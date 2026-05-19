import db from '../config/db.js';

// 📋 Reporte general de reservas por rango de fechas
export const getReportePorFechas = async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin, id_habitacion, estado } = req.query;

    if (!fecha_inicio || !fecha_fin) {
      return res.status(400).json({ 
        message: 'Las fechas de inicio y fin son obligatorias' 
      });
    }

    let query = `
      SELECT
        r.id_reserva,
        DATE(r.fecha_entrada) as fecha_entrada,
        DATE(r.fecha_salida) as fecha_salida,
        r.total,
        r.cantidad_adultos,
        r.cantidad_ninos,
        r.estado,
        DATE(r.fecha_creacion) as fecha_creacion,
        h.numero as numero_habitacion,
        h.piso,
        t.nombre as tipo_habitacion,
        c.nombre as cliente_nombre,
        c.apellido as cliente_apellido,
        c.correo as cliente_correo,
        c.celular as cliente_celular,
        COALESCE(p.monto_pagado, 0) as monto_pagado,
        p.metodo_pago,
        p.fecha_pago,
        DATEDIFF(r.fecha_salida, r.fecha_entrada) as noches
      FROM reserva r
      INNER JOIN habitacion h ON r.id_habitacion = h.id_habitacion
      INNER JOIN tipo t ON h.id_tipo = t.id_tipo
      INNER JOIN cliente c ON r.id_cliente = c.id_cliente
      LEFT JOIN (
        SELECT id_reserva,
               SUM(monto)        as monto_pagado,
               MAX(metodo_pago)  as metodo_pago,
               DATE(MAX(fecha_pago)) as fecha_pago
        FROM pago
        GROUP BY id_reserva
      ) p ON r.id_reserva = p.id_reserva
      WHERE DATE(r.fecha_creacion) >= ? AND DATE(r.fecha_creacion) <= ?
    `;

    const params = [fecha_inicio, fecha_fin];

    if (id_habitacion) {
      query += ' AND r.id_habitacion = ?';
      params.push(id_habitacion);
    }

    if (estado) {
      query += ' AND r.estado = ?';
      params.push(estado);
    }

    query += ' ORDER BY r.fecha_entrada DESC';

    const [reservas] = await db.query(query, params);

    const totalReservas = reservas.length;
    const totalIngresos = reservas.reduce((sum, r) => sum + parseFloat(r.total || 0), 0);
    const totalNoches = reservas.reduce((sum, r) => sum + (r.noches || 0), 0);

    res.json({
      reservas,
      resumen: {
        total_reservas: totalReservas,
        total_ingresos: totalIngresos.toFixed(2),
        total_noches: totalNoches,
        ingreso_promedio: totalReservas > 0 ? (totalIngresos / totalReservas).toFixed(2) : 0
      }
    });

  } catch (error) {
    console.error('Error al obtener reporte por fechas:', error);
    res.status(500).json({ message: 'Error al generar reporte' });
  }
};

// 🏨 Habitaciones más reservadas en un rango de fechas
export const getHabitacionesMasReservadasPorFecha = async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin } = req.query;

    if (!fecha_inicio || !fecha_fin) {
      return res.status(400).json({ 
        message: 'Las fechas de inicio y fin son obligatorias' 
      });
    }

    const [habitaciones] = await db.query(
      `SELECT 
        h.numero,
        h.piso,
        t.nombre as tipo,
        COUNT(r.id_reserva) as total_reservas,
        COALESCE(SUM(r.total), 0) as ingresos_generados,
        COALESCE(SUM(DATEDIFF(r.fecha_salida, r.fecha_entrada)), 0) as total_noches,
        COALESCE(AVG(r.total), 0) as ingreso_promedio,
        h.estado as estado_actual
       FROM habitacion h
       LEFT JOIN reserva r ON h.id_habitacion = r.id_habitacion 
         AND DATE(r.fecha_entrada) >= ? 
         AND DATE(r.fecha_entrada) <= ?
       LEFT JOIN tipo t ON h.id_tipo = t.id_tipo
       GROUP BY h.id_habitacion, h.numero, h.piso, t.nombre, h.estado
       ORDER BY total_reservas DESC`,
      [fecha_inicio, fecha_fin]
    );

    res.json(habitaciones);

  } catch (error) {
    console.error('Error al obtener habitaciones más reservadas:', error);
    res.status(500).json({ message: 'Error al generar reporte' });
  }
};

// 📅 Días con más reservas (ocupación diaria)
export const getDiasConMasReservas = async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin } = req.query;

    if (!fecha_inicio || !fecha_fin) {
      return res.status(400).json({ 
        message: 'Las fechas de inicio y fin son obligatorias' 
      });
    }

    const [dias] = await db.query(
      `SELECT 
        DATE(r.fecha_entrada) as fecha,
        COUNT(DISTINCT r.id_reserva) as total_reservas,
        COUNT(DISTINCT r.id_habitacion) as habitaciones_ocupadas,
        COALESCE(SUM(r.total), 0) as ingresos_del_dia,
        GROUP_CONCAT(DISTINCT CONCAT(h.numero, ' (', t.nombre, ')') SEPARATOR ', ') as habitaciones
       FROM reserva r
       INNER JOIN habitacion h ON r.id_habitacion = h.id_habitacion
       INNER JOIN tipo t ON h.id_tipo = t.id_tipo
       WHERE DATE(r.fecha_entrada) >= ? AND DATE(r.fecha_entrada) <= ?
       GROUP BY DATE(r.fecha_entrada)
       ORDER BY total_reservas DESC, fecha DESC`,
      [fecha_inicio, fecha_fin]
    );

    res.json(dias);

  } catch (error) {
    console.error('Error al obtener días con más reservas:', error);
    res.status(500).json({ message: 'Error al generar reporte' });
  }
};

// 📊 Estadísticas por estado en un rango de fechas
export const getEstadisticasPorEstado = async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin } = req.query;

    if (!fecha_inicio || !fecha_fin) {
      return res.status(400).json({ 
        message: 'Las fechas de inicio y fin son obligatorias' 
      });
    }

    const [estadisticas] = await db.query(
      `SELECT 
        estado,
        COUNT(*) as cantidad,
        COALESCE(SUM(total), 0) as ingresos_totales,
        COALESCE(AVG(total), 0) as ingreso_promedio,
        COALESCE(SUM(DATEDIFF(fecha_salida, fecha_entrada)), 0) as total_noches
       FROM reserva
       WHERE DATE(fecha_entrada) >= ? AND DATE(fecha_entrada) <= ?
       GROUP BY estado
       ORDER BY cantidad DESC`,
      [fecha_inicio, fecha_fin]
    );

    res.json(estadisticas);

  } catch (error) {
    console.error('Error al obtener estadísticas por estado:', error);
    res.status(500).json({ message: 'Error al generar reporte' });
  }
};

// 💰 Reporte de ingresos detallado
export const getReporteIngresos = async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin, metodo_pago } = req.query;

    if (!fecha_inicio || !fecha_fin) {
      return res.status(400).json({ 
        message: 'Las fechas de inicio y fin son obligatorias' 
      });
    }

    let query = `
      SELECT 
        p.id_pago,
        p.monto,
        p.metodo_pago,
        DATE(p.fecha_pago) as fecha_pago,
        r.id_reserva,
        r.estado as estado_reserva,
        h.numero as numero_habitacion,
        t.nombre as tipo_habitacion,
        c.nombre as cliente_nombre,
        c.apellido as cliente_apellido,
        DATE(r.fecha_entrada) as fecha_entrada,
        DATE(r.fecha_salida) as fecha_salida
      FROM pago p
      INNER JOIN reserva r ON p.id_reserva = r.id_reserva
      INNER JOIN habitacion h ON r.id_habitacion = h.id_habitacion
      INNER JOIN tipo t ON h.id_tipo = t.id_tipo
      INNER JOIN cliente c ON r.id_cliente = c.id_cliente
      WHERE DATE(p.fecha_pago) >= ? AND DATE(p.fecha_pago) <= ?
    `;

    const params = [fecha_inicio, fecha_fin];

    if (metodo_pago) {
      query += ' AND p.metodo_pago = ?';
      params.push(metodo_pago);
    }

    query += ' ORDER BY p.fecha_pago DESC';

    const [pagos] = await db.query(query, params);

    const totalPagos = pagos.length;
    const totalMonto = pagos.reduce((sum, p) => sum + parseFloat(p.monto), 0);

    const porMetodo = {};
    pagos.forEach(p => {
      if (!porMetodo[p.metodo_pago]) {
        porMetodo[p.metodo_pago] = { cantidad: 0, monto: 0 };
      }
      porMetodo[p.metodo_pago].cantidad++;
      porMetodo[p.metodo_pago].monto += parseFloat(p.monto);
    });

    res.json({
      pagos,
      resumen: {
        total_pagos: totalPagos,
        monto_total: totalMonto.toFixed(2),
        promedio_pago: totalPagos > 0 ? (totalMonto / totalPagos).toFixed(2) : 0,
        por_metodo: porMetodo
      }
    });

  } catch (error) {
    console.error('Error al obtener reporte de ingresos:', error);
    res.status(500).json({ message: 'Error al generar reporte' });
  }
};

// 📈 Ocupación promedio por período
export const getOcupacionPromedio = async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin } = req.query;

    if (!fecha_inicio || !fecha_fin) {
      return res.status(400).json({ 
        message: 'Las fechas de inicio y fin son obligatorias' 
      });
    }

    const [totalHab] = await db.query('SELECT COUNT(*) as total FROM habitacion');
    const totalHabitaciones = totalHab[0].total;

    const [ocupacion] = await db.query(
      `SELECT 
        DATE(r.fecha_entrada) as fecha,
        COUNT(DISTINCT r.id_habitacion) as habitaciones_ocupadas,
        ? as total_habitaciones,
        ROUND((COUNT(DISTINCT r.id_habitacion) / ?) * 100, 2) as porcentaje_ocupacion
       FROM reserva r
       WHERE DATE(r.fecha_entrada) >= ? AND DATE(r.fecha_entrada) <= ?
       GROUP BY DATE(r.fecha_entrada)
       ORDER BY fecha ASC`,
      [totalHabitaciones, totalHabitaciones, fecha_inicio, fecha_fin]
    );

    const promedioOcupacion = ocupacion.length > 0
      ? ocupacion.reduce((sum, d) => sum + parseFloat(d.porcentaje_ocupacion), 0) / ocupacion.length
      : 0;

    res.json({
      ocupacion_diaria: ocupacion,
      resumen: {
        total_habitaciones: totalHabitaciones,
        promedio_ocupacion: promedioOcupacion.toFixed(2) + '%',
        dias_analizados: ocupacion.length
      }
    });

  } catch (error) {
    console.error('Error al obtener ocupación promedio:', error);
    res.status(500).json({ message: 'Error al generar reporte' });
  }
};