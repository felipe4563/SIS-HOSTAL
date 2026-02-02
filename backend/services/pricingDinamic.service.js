import db from '../config/db.js';

class PricingDinamicoService {
  
  /**
   * 🎯 ALGORITMO PRINCIPAL
   * Calcula precio dinámico para una habitación
   */
  async calcularPrecio(id_habitacion, fecha_entrada, fecha_salida, ip_usuario = null) {
    try {
      // 1. Obtener precio base
      const precioBase = await this.obtenerPrecioBase(id_habitacion);
      
      // 2. Calcular noches y anticipación
      const entrada = new Date(fecha_entrada);
      const salida = new Date(fecha_salida);
      const noches = Math.ceil((salida - entrada) / (1000 * 60 * 60 * 24));
      
      if (noches < 1) {
        throw new Error('La fecha de salida debe ser posterior a la fecha de entrada');
      }
      
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      entrada.setHours(0, 0, 0, 0);
      const diasAnticipacion = Math.ceil((entrada - hoy) / (1000 * 60 * 60 * 24));
      
      // 3. Inicializar ajustes
      const ajustes = {
        temporada: 0,
        dia_semana: 0,
        anticipacion: 0,
        ocupacion: 0,
        duracion: 0,
        eventos: 0
      };
      
      // 4. Aplicar cada regla
      ajustes.temporada = await this.calcularAjusteTemporada(entrada);
      ajustes.dia_semana = this.calcularAjusteDiaSemana(entrada);
      ajustes.anticipacion = this.calcularAjusteAnticipacion(diasAnticipacion);
      ajustes.ocupacion = await this.calcularAjusteOcupacion(fecha_entrada, fecha_salida);
      ajustes.duracion = this.calcularAjusteDuracion(noches);
      ajustes.eventos = await this.calcularAjusteEventos(entrada, salida);
      
      // 5. Calcular precio final
      const ajusteTotal = Object.values(ajustes).reduce((sum, val) => sum + val, 0);
      const precioPorNoche = precioBase * (1 + ajusteTotal / 100);
      const precioTotal = precioPorNoche * noches;
      
      // 6. Límites de seguridad (no bajar >30% ni subir >100%)
      const precioMinimo = precioBase * 0.7;
      const precioMaximo = precioBase * 2.0;
      const precioFinalPorNoche = Math.max(precioMinimo, Math.min(precioMaximo, precioPorNoche));
      const precioFinalTotal = precioFinalPorNoche * noches;
      
      // 7. Obtener ocupación actual
      const ocupacionActual = await this.obtenerOcupacionActual();
      
      // 8. Registrar consulta
      await this.registrarConsulta({
        id_habitacion,
        fecha_entrada,
        fecha_salida,
        noches,
        precio_calculado: precioFinalTotal,
        precio_base: precioBase,
        ajustes,
        ocupacion_porcentaje: ocupacionActual,
        ip_usuario
      });
      
      // 9. Retornar resultado
      return {
        precio_base: parseFloat(precioBase.toFixed(2)),
        precio_por_noche: parseFloat(precioFinalPorNoche.toFixed(2)),
        precio_total: parseFloat(precioFinalTotal.toFixed(2)),
        noches,
        dias_anticipacion: diasAnticipacion,
        ajustes: {
          temporada: parseFloat(ajustes.temporada.toFixed(2)),
          dia_semana: parseFloat(ajustes.dia_semana.toFixed(2)),
          anticipacion: parseFloat(ajustes.anticipacion.toFixed(2)),
          ocupacion: parseFloat(ajustes.ocupacion.toFixed(2)),
          duracion: parseFloat(ajustes.duracion.toFixed(2)),
          eventos: parseFloat(ajustes.eventos.toFixed(2)),
          total: parseFloat(ajusteTotal.toFixed(2))
        },
        ocupacion_actual: parseFloat(ocupacionActual.toFixed(2)),
        fecha_entrada,
        fecha_salida
      };
      
    } catch (error) {
      console.error('Error calculando precio:', error);
      throw error;
    }
  }
  
  /**
   * Obtiene precio base de la habitación
   */
  async obtenerPrecioBase(id_habitacion) {
    const [rows] = await db.query(`
      SELECT h.precio_total
      FROM habitacion h
      WHERE h.id_habitacion = ?
    `, [id_habitacion]);
    
    if (rows.length === 0) {
      throw new Error('Habitación no encontrada');
    }
    
    return parseFloat(rows[0].precio_total);
  }
  
  /**
   * ⭐ REGLA 1: Ajuste por temporada del año
   * Ejemplo: Diciembre = +30%, Junio = -5%
   */
  async calcularAjusteTemporada(fecha) {
    const mes = fecha.getMonth() + 1; // 1-12
    
    const [rows] = await db.query(`
      SELECT ajuste_precio
      FROM temporada
      WHERE ? BETWEEN mes_inicio AND mes_fin
      AND activo = 1
      ORDER BY ajuste_precio DESC
      LIMIT 1
    `, [mes]);
    
    return rows.length > 0 ? parseFloat(rows[0].ajuste_precio) : 0;
  }
  
  /**
   * ⭐ REGLA 2: Ajuste por día de semana
   * Viernes/Sábado = +20%, Domingo = +10%
   */
  calcularAjusteDiaSemana(fecha) {
    const dia = fecha.getDay(); // 0=Domingo, 6=Sábado
    
    if (dia === 5 || dia === 6) return 20.0; // Viernes/Sábado +20%
    if (dia === 0) return 10.0; // Domingo +10%
    return 0; // Lunes a Jueves: normal
  }
  
  /**
   * ⭐ REGLA 3: Ajuste por anticipación de reserva
   * Más anticipación = descuento, última hora = +precio
   */
  calcularAjusteAnticipacion(dias) {
    if (dias > 60) return -10.0;  // Más de 2 meses: -10%
    if (dias > 30) return -5.0;   // Más de 1 mes: -5%
    if (dias >= 7) return 0;      // 1 semana: normal
    if (dias >= 3) return 10.0;   // 3-6 días: +10%
    if (dias >= 1) return 20.0;   // 1-2 días: +20%
    return 30.0;                  // Mismo día: +30%
  }
  
  /**
   * ⭐ REGLA 4: Ajuste por ocupación del hostal
   * Más ocupación = precio más alto (oferta y demanda)
   */
  async calcularAjusteOcupacion(fecha_entrada, fecha_salida) {
    // Contar habitaciones totales
    const [totalHabs] = await db.query('SELECT COUNT(*) as total FROM habitacion');
    const totalHabitaciones = totalHabs[0].total;
    
    // Contar habitaciones ocupadas en ese rango de fechas
    const [ocupadas] = await db.query(`
      SELECT COUNT(DISTINCT id_habitacion) as ocupadas
      FROM reserva
      WHERE estado IN ('pendiente', 'confirmada')
      AND (
        (fecha_entrada <= ? AND fecha_salida >= ?) OR
        (fecha_entrada >= ? AND fecha_entrada < ?) OR
        (fecha_salida > ? AND fecha_salida <= ?)
      )
    `, [fecha_salida, fecha_entrada, fecha_entrada, fecha_salida, fecha_entrada, fecha_salida]);
    
    const porcentaje = (ocupadas[0].ocupadas / totalHabitaciones) * 100;
    
    // Ajustes progresivos
    if (porcentaje >= 90) return 30.0;  // Casi lleno: +30%
    if (porcentaje >= 75) return 20.0;  // Muy ocupado: +20%
    if (porcentaje >= 60) return 10.0;  // Ocupado: +10%
    if (porcentaje >= 40) return 0;     // Normal
    if (porcentaje >= 20) return -5.0;  // Poca ocupación: -5%
    return -10.0;                       // Muy vacío: -10% (incentivo)
  }
  
  /**
   * ⭐ REGLA 5: Ajuste por duración de estadía
   * Más noches = descuento (incentivar estadías largas)
   */
  calcularAjusteDuracion(noches) {
    if (noches >= 30) return -20.0;  // Mes o más: -20%
    if (noches >= 14) return -15.0;  // 2 semanas: -15%
    if (noches >= 7) return -10.0;   // 1 semana: -10%
    if (noches >= 3) return -5.0;    // 3-6 noches: -5%
    return 0;                        // 1-2 noches: normal
  }
  
  /**
   * ⭐ REGLA 6: Ajuste por eventos especiales
   * Navidad, Carnaval, etc. = precio más alto
   */
  async calcularAjusteEventos(fecha_entrada, fecha_salida) {
    const [eventos] = await db.query(`
      SELECT ajuste_precio, nombre
      FROM evento_especial
      WHERE activo = 1
      AND estado = 1
      AND (
        (fecha_inicio <= ? AND fecha_fin >= ?) OR
        (fecha_inicio >= ? AND fecha_inicio <= ?)
      )
      ORDER BY ajuste_precio DESC
      LIMIT 1
    `, [fecha_salida, fecha_entrada, fecha_entrada, fecha_salida]);
    
    if (eventos.length > 0) {
      console.log(`   🎉 Evento detectado: ${eventos[0].nombre} (+${eventos[0].ajuste_precio}%)`);
      return parseFloat(eventos[0].ajuste_precio);
    }
    
    return 0;
  }
  
  /**
   * Obtiene ocupación actual del hostal (%)
   */
  async obtenerOcupacionActual() {
    const hoy = new Date().toISOString().split('T')[0];
    
    const [totalHabs] = await db.query('SELECT COUNT(*) as total FROM habitacion');
    const [ocupadas] = await db.query(`
      SELECT COUNT(DISTINCT id_habitacion) as ocupadas
      FROM reserva
      WHERE estado IN ('pendiente', 'confirmada')
      AND fecha_entrada <= ? AND fecha_salida >= ?
    `, [hoy, hoy]);
    
    return (ocupadas[0].ocupadas / totalHabs[0].total) * 100;
  }
  
  /**
   * Registra consulta para análisis futuro
   */
  async registrarConsulta(datos) {
    try {
      await db.query(`
        INSERT INTO consulta_precio 
        (id_habitacion, fecha_entrada, fecha_salida, noches, precio_calculado, 
         precio_base, ajustes, ocupacion_porcentaje)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        datos.id_habitacion,
        datos.fecha_entrada,
        datos.fecha_salida,
        datos.noches,
        datos.precio_calculado,
        datos.precio_base,
        JSON.stringify(datos.ajustes),
        datos.ocupacion_porcentaje
      ]);
    } catch (error) {
      // No es crítico si falla
      console.error('Error registrando consulta:', error.message);
    }
  }
  
  /**
   * Marca una consulta como convertida en reserva
   */
  async marcarConsultaConvertida(id_habitacion, fecha_entrada, id_reserva) {
    try {
      await db.query(`
        UPDATE consulta_precio
        SET convirtio_en_reserva = 1, id_reserva = ?
        WHERE id_habitacion = ? 
        AND DATE(fecha_entrada) = DATE(?)
        AND convirtio_en_reserva = 0
        ORDER BY fecha_consulta DESC
        LIMIT 1
      `, [id_reserva, id_habitacion, fecha_entrada]);
    } catch (error) {
      console.error('Error marcando consulta convertida:', error.message);
    }
  }
  
  /**
   * Obtiene estadísticas de consultas
   */
  async obtenerEstadisticasConsultas(mes, anio) {
    try {
      const [stats] = await db.query(`
        SELECT 
          COUNT(*) as total_consultas,
          AVG(precio_calculado / noches) as precio_promedio_noche,
          SUM(convirtio_en_reserva) as conversiones,
          (SUM(convirtio_en_reserva) / COUNT(*)) * 100 as tasa_conversion,
          AVG(ocupacion_porcentaje) as ocupacion_promedio
        FROM consulta_precio
        WHERE YEAR(fecha_entrada) = ? AND MONTH(fecha_entrada) = ?
      `, [anio, mes]);
      
      return stats[0];
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      return null;
    }
  }
}

export default new PricingDinamicoService();