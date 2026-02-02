import axios from 'axios';
import db from '../config/db.js';
import cron from 'node-cron';

class EventosExternosService {
  
  constructor() {
    // Coordenadas de Cochabamba
    this.COCHABAMBA_LAT = -17.3895;
    this.COCHABAMBA_LNG = -66.1568;
    
    // Iniciar sincronización automática
    this.iniciarCronJob();
  }
  
  /**
   * 🔄 CRON JOBS AUTOMÁTICOS
   */
  iniciarCronJob() {
    // 1️⃣ Sincronización SEMANAL (Domingos 3:00 AM)
    cron.schedule('0 3 * * 0', async () => {
      console.log('🔄 [CRON] Sincronización semanal de eventos - ' + new Date().toISOString());
      await this.sincronizarEventosFuturos();
    });
    
    // 2️⃣ Limpieza DIARIA (Todos los días 4:00 AM)
    cron.schedule('0 4 * * *', async () => {
      console.log('🧹 [CRON] Limpiando eventos pasados - ' + new Date().toISOString());
      await this.limpiarEventosPasados();
    });
    
    // 3️⃣ Sincronización ESPECIAL cada 1 de Enero (actualizar año nuevo)
    cron.schedule('0 2 1 1 *', async () => {
      console.log('🎉 [CRON] Actualización especial de Año Nuevo');
      await this.sincronizarEventosFuturos();
    });
    
    console.log('✅ Cron jobs de eventos iniciados:');
    console.log('   📅 Sincronización: Domingos 3:00 AM');
    console.log('   🧹 Limpieza: Diario 4:00 AM');
    console.log('   🎊 Especial: 1 de Enero 2:00 AM');
  }
  
  /**
   * 📡 SINCRONIZACIÓN PRINCIPAL
   * Descarga feriados del año actual y próximo
   */
  async sincronizarEventosFuturos() {
    const resultados = {
      feriados: { nuevos: 0, actualizados: 0 },
      errores: []
    };
    
    try {
      const hoy = new Date().toISOString().split('T')[0];
      
      console.log('📡 Consultando API de feriados de Bolivia...');
      
      // Obtener feriados de este año y el siguiente
      const feriados = await this.obtenerFeriadosBolivia();
      
      // Filtrar solo eventos futuros o del presente
      const feriadosFuturos = feriados.filter(f => f.fecha_fin >= hoy);
      
      console.log(`✅ Encontrados ${feriadosFuturos.length} feriados futuros`);
      
      if (feriadosFuturos.length > 0) {
        // Guardar/actualizar en base de datos
        resultados.feriados = await this.guardarEventos(feriadosFuturos, 'feriados_api');
        
        console.log(`💾 Guardados: ${resultados.feriados.nuevos} nuevos, ${resultados.feriados.actualizados} actualizados`);
      }
      
      // Registrar log
      await this.registrarLog('sincronizacion_semanal', {
        eventos_encontrados: feriadosFuturos.length,
        eventos_nuevos: resultados.feriados.nuevos,
        eventos_actualizados: resultados.feriados.actualizados
      });
      
      return resultados;
      
    } catch (error) {
      console.error('❌ Error en sincronización:', error.message);
      resultados.errores.push(error.message);
      
      await this.registrarLog('sincronizacion_error', {
        error: error.message
      });
      
      return resultados;
    }
  }
  
  /**
   * 🌐 OBTENER FERIADOS DE BOLIVIA
   * API GRATUITA: https://date.nager.at/Api
   * Descarga automáticamente las fechas correctas de cada año
   */
  async obtenerFeriadosBolivia() {
    try {
      const anioActual = new Date().getFullYear();
      const eventos = [];
      
      // 🔄 Obtener feriados de ESTE AÑO y el PRÓXIMO
      for (let anio of [anioActual, anioActual + 1]) {
        console.log(`   📅 Consultando feriados de ${anio}...`);
        
        try {
          const response = await axios.get(
            `https://date.nager.at/api/v3/PublicHolidays/${anio}/BO`,
            { 
              timeout: 10000,
              headers: {
                'User-Agent': 'HostalSuri-PricingSystem/1.0'
              }
            }
          );
          
          console.log(`   ✅ ${response.data.length} feriados encontrados para ${anio}`);
          
          // Procesar cada feriado
          response.data.forEach(feriado => {
            // Calcular ajuste de precio según importancia
            let ajustePrecio = 20.0; // Por defecto
            
            if (feriado.global) {
              // Feriados NACIONALES (más importantes)
              const nombre = feriado.localName.toLowerCase();
              
              if (nombre.includes('navidad') || nombre.includes('año nuevo')) {
                ajustePrecio = 45.0; // +45% Navidad y Año Nuevo
              } else if (nombre.includes('independencia') || nombre.includes('carnaval')) {
                ajustePrecio = 35.0; // +35% Independencia y Carnaval
              } else {
                ajustePrecio = 30.0; // +30% Otros feriados nacionales
              }
            } else {
              // Feriados REGIONALES
              ajustePrecio = 15.0; // +15%
            }
            
            eventos.push({
              fuente_id: `feriado_${feriado.date}`,
              nombre: `${feriado.localName || feriado.name} ${anio}`,
              fecha_inicio: feriado.date,
              fecha_fin: feriado.date,
              categoria: 'feriado',
              asistencia_estimada: null,
              ubicacion: feriado.global ? 'Bolivia (Nacional)' : 'Bolivia (Regional)',
              ajuste_precio: ajustePrecio,
              impacto_calculado: feriado.global ? 'alto' : 'medio',
              url_fuente: null,
              verificado: 1,
              descripcion: `${feriado.localName} - Feriado ${feriado.global ? 'nacional' : 'regional'} de ${anio}`
            });
          });
          
        } catch (error) {
          console.error(`   ❌ Error obteniendo feriados de ${anio}:`, error.message);
          
          if (error.code === 'ECONNABORTED') {
            console.error('      Timeout: La API no respondió a tiempo');
          } else if (error.response?.status === 404) {
            console.error(`      La API aún no tiene datos para ${anio}`);
          }
        }
      }
      
      return eventos;
      
    } catch (error) {
      console.error('❌ Error general obteniendo feriados:', error.message);
      return [];
    }
  }
  
  /**
   * 💾 GUARDAR/ACTUALIZAR EVENTOS
   * Evita duplicados usando fuente_id único
   */
  async guardarEventos(eventos, fuente) {
    let nuevos = 0;
    let actualizados = 0;
    
    for (const evento of eventos) {
      try {
        // Verificar si YA existe (por fuente_id)
        const [existe] = await db.query(`
          SELECT id_evento FROM evento_especial
          WHERE fuente = ? AND fuente_id = ?
        `, [fuente, evento.fuente_id]);
        
        if (existe.length > 0) {
          // ✏️ ACTUALIZAR evento existente (fecha puede haber cambiado)
          await db.query(`
            UPDATE evento_especial
            SET nombre = ?, 
                fecha_inicio = ?, 
                fecha_fin = ?, 
                ajuste_precio = ?,
                categoria = ?, 
                ubicacion = ?,
                impacto_calculado = ?,
                descripcion = ?,
                fecha_sincronizacion = NOW(), 
                activo = 1,
                verificado = ?
            WHERE id_evento = ?
          `, [
            evento.nombre,
            evento.fecha_inicio,
            evento.fecha_fin,
            evento.ajuste_precio,
            evento.categoria,
            evento.ubicacion,
            evento.impacto_calculado,
            evento.descripcion,
            evento.verificado,
            existe[0].id_evento
          ]);
          
          actualizados++;
          console.log(`   ✏️ Actualizado: ${evento.nombre}`);
          
        } else {
          // ➕ INSERTAR nuevo evento
          await db.query(`
            INSERT INTO evento_especial 
            (nombre, fecha_inicio, fecha_fin, ajuste_precio, categoria, 
             fuente, fuente_id, ubicacion, impacto_calculado,
             verificado, descripcion, fecha_sincronizacion, estado, activo)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), 1, 1)
          `, [
            evento.nombre,
            evento.fecha_inicio,
            evento.fecha_fin,
            evento.ajuste_precio,
            evento.categoria,
            fuente,
            evento.fuente_id,
            evento.ubicacion,
            evento.impacto_calculado,
            evento.verificado,
            evento.descripcion
          ]);
          
          nuevos++;
          console.log(`   ➕ Nuevo: ${evento.nombre}`);
        }
        
      } catch (error) {
        console.error(`   ❌ Error guardando "${evento.nombre}":`, error.message);
      }
    }
    
    return { nuevos, actualizados };
  }
  
  /**
   * 🧹 LIMPIEZA AUTOMÁTICA
   * Desactiva eventos pasados (quedan como historial)
   * Elimina eventos muy antiguos (>2 años)
   */
  async limpiarEventosPasados() {
    try {
      const hoy = new Date().toISOString().split('T')[0];
      
      // 1️⃣ Desactivar eventos que ya pasaron
      const [result] = await db.query(`
        UPDATE evento_especial
        SET activo = 0
        WHERE fecha_fin < ? AND activo = 1
      `, [hoy]);
      
      if (result.affectedRows > 0) {
        console.log(`   🔄 Desactivados ${result.affectedRows} eventos pasados (ahora son historial)`);
      }
      
      // 2️⃣ Eliminar eventos MUY antiguos (más de 2 años)
      const hace2Anios = new Date();
      hace2Anios.setFullYear(hace2Anios.getFullYear() - 2);
      const fecha2Anios = hace2Anios.toISOString().split('T')[0];
      
      const [deleted] = await db.query(`
        DELETE FROM evento_especial
        WHERE fecha_fin < ? AND activo = 0
      `, [fecha2Anios]);
      
      if (deleted.affectedRows > 0) {
        console.log(`   🗑️ Eliminados ${deleted.affectedRows} eventos de hace más de 2 años`);
      }
      
      // 3️⃣ Estadísticas
      const [stats] = await db.query(`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN activo = 1 THEN 1 ELSE 0 END) as activos,
          SUM(CASE WHEN activo = 0 THEN 1 ELSE 0 END) as historial
        FROM evento_especial
      `);
      
      console.log(`   📊 Eventos en BD: ${stats[0].total} total | ${stats[0].activos} activos | ${stats[0].historial} historial`);
      
    } catch (error) {
      console.error('❌ Error en limpieza:', error.message);
    }
  }
  
  /**
   * 📝 REGISTRAR LOG
   */
  async registrarLog(fuente, datos) {
    try {
      await db.query(`
        INSERT INTO log_sincronizacion 
        (fuente, eventos_encontrados, eventos_nuevos, eventos_actualizados, errores)
        VALUES (?, ?, ?, ?, ?)
      `, [
        fuente,
        datos.eventos_encontrados || 0,
        datos.eventos_nuevos || 0,
        datos.eventos_actualizados || 0,
        datos.error ? JSON.stringify([datos.error]) : null
      ]);
    } catch (error) {
      console.error('Error registrando log:', error.message);
    }
  }
  
  /**
   * 📊 OBTENER ESTADÍSTICAS
   */
  async obtenerEstadisticas() {
    try {
      const [stats] = await db.query(`
        SELECT 
          COUNT(*) as total_eventos,
          SUM(CASE WHEN activo = 1 THEN 1 ELSE 0 END) as eventos_activos,
          SUM(CASE WHEN activo = 0 THEN 1 ELSE 0 END) as eventos_historial,
          SUM(CASE WHEN verificado = 1 THEN 1 ELSE 0 END) as eventos_verificados,
          MIN(fecha_inicio) as primer_evento,
          MAX(fecha_fin) as ultimo_evento
        FROM evento_especial
        WHERE activo = 1
      `);
      
      const [ultimaSync] = await db.query(`
        SELECT fecha_sincronizacion, eventos_nuevos, eventos_actualizados
        FROM log_sincronizacion
        ORDER BY fecha_sincronizacion DESC
        LIMIT 1
      `);
      
      return {
        eventos: stats[0],
        ultima_sincronizacion: ultimaSync[0] || null
      };
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      return null;
    }
  }
  
  /**
   * 🔧 SINCRONIZACIÓN MANUAL (para testing)
   */
  async sincronizarManual() {
    console.log('🔧 Sincronización manual iniciada...');
    const resultado = await this.sincronizarEventosFuturos();
    await this.limpiarEventosPasados();
    return resultado;
  }
}

export default new EventosExternosService();