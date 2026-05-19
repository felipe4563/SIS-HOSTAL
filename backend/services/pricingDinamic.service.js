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
      
      // 3. Calcular único ajuste: temporada
      const ajusteTemporada = await this.calcularAjusteTemporada(entrada);
      const ajustes = { temporada: ajusteTemporada };

      // 4. Calcular precio final
      const ajusteTotal = ajusteTemporada;
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

    // Temporada alta (registro en DB con ajuste positivo): +5%
    // Temporada normal (sin registro o ajuste <= 0): -3%
    if (rows.length > 0 && parseFloat(rows[0].ajuste_precio) > 0) {
      return 5.0;
    }
    return -3.0;
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