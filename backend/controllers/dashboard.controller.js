import db from '../config/db.js';

const PERIODOS_VALIDOS = new Set(['semana', 'mes', 'año']);

const toYmdLocal = (date) => {
  // Evita problemas de timezone de toISOString() al formatear fechas de DB (DATE).
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const esYmd = (value = '') => /^\d{4}-\d{2}-\d{2}$/.test(value);

// Helper function para obtener el rango de fechas según el periodo o query string
const obtenerRangoFechas = (periodo, inicioQuery, finQuery) => {
  const periodoSeguro = PERIODOS_VALIDOS.has(periodo) ? periodo : 'mes';

  if (esYmd(inicioQuery) && esYmd(finQuery)) {
    return { inicio: inicioQuery, fin: finQuery, periodo: 'custom' };
  }

  let fechaInicio;
  let fechaFin;
  const ahora = new Date();

  switch (periodoSeguro) {
    case 'semana':
      fechaInicio = new Date(ahora);
      fechaInicio.setDate(ahora.getDate() - 7);
      fechaFin = new Date(ahora);
      break;
    case 'mes':
      fechaInicio = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
      fechaFin = new Date(ahora.getFullYear(), ahora.getMonth() + 1, 0);
      break;
    case 'año':
      fechaInicio = new Date(ahora.getFullYear(), 0, 1);
      fechaFin = new Date(ahora.getFullYear(), 11, 31);
      break;
    default:
      fechaInicio = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
      fechaFin = new Date(ahora.getFullYear(), ahora.getMonth() + 1, 0);
  }

  return { inicio: toYmdLocal(fechaInicio), fin: toYmdLocal(fechaFin), periodo: periodoSeguro };
};

// 📊 Obtener estadísticas generales del dashboard
export const getEstadisticasGenerales = async (req, res) => {
  try {
    const { periodo = 'mes', inicio: inicioQuery, fin: finQuery } = req.query;
    const { inicio, fin, periodo: periodoResuelto } = obtenerRangoFechas(periodo, inicioQuery, finQuery);
    
    const connection = await db.getConnection();

    // Total de reservas en el periodo
    const [totalReservas] = await connection.query(
      `SELECT COUNT(*) as total FROM reserva 
       WHERE DATE(fecha_creacion) BETWEEN ? AND ?`,
      [inicio, fin]
    );

    // Total de clientes
    const [totalClientes] = await connection.query(
      'SELECT COUNT(*) as total FROM cliente WHERE estado = 1'
    );

    // Ingresos en el periodo
    const [ingresosPeriodo] = await connection.query(
      `SELECT COALESCE(SUM(monto), 0) as total FROM pago 
       WHERE DATE(fecha_pago) BETWEEN ? AND ?`,
      [inicio, fin]
    );

    // Habitaciones disponibles
    const [habitacionesDisponibles] = await connection.query(
      "SELECT COUNT(*) as total FROM habitacion WHERE estado = 'disponible'"
    );

    // Total de habitaciones
    const [totalHabitaciones] = await connection.query(
      'SELECT COUNT(*) as total FROM habitacion'
    );

    // Ocupación por rango (no por estado actual de la habitación)
    const [[ocupadasEnRango]] = await connection.query(
      `SELECT COUNT(DISTINCT r.id_habitacion) as total
       FROM reserva r
       WHERE r.estado IN ('pendiente','confirmada')
         AND DATE(r.fecha_entrada) <= ?
         AND DATE(r.fecha_salida) >= ?`,
      [fin, inicio]
    );

    connection.release();

    const totalHab = Number(totalHabitaciones?.[0]?.total || 0);
    const disponibles = Number(habitacionesDisponibles?.[0]?.total || 0);
    const ocupadasRango = Number(ocupadasEnRango?.total || 0);
    const tasaOcupacion = totalHab > 0 ? ((ocupadasRango / totalHab) * 100).toFixed(2) : '0.00';

    res.json({
      totalReservas: totalReservas[0].total,
      totalClientes: totalClientes[0].total,
      ingresosPeriodo: parseFloat(ingresosPeriodo[0].total),
      habitacionesDisponibles: habitacionesDisponibles[0].total,
      totalHabitaciones: totalHabitaciones[0].total,
      tasaOcupacion,
      habitacionesOcupadasRango: ocupadasRango,
      periodo: periodoResuelto,
      fechaInicio: inicio,
      fechaFin: fin
    });

  } catch (error) {
    console.error('Error al obtener estadísticas generales:', error);
    res.status(500).json({ message: 'Error al obtener estadísticas' });
  }
};

// 📈 Reservas por estado
export const getReservasPorEstado = async (req, res) => {
  try {
    const { periodo = 'mes', inicio: inicioQuery, fin: finQuery } = req.query;
    const { inicio, fin } = obtenerRangoFechas(periodo, inicioQuery, finQuery);

    const [reservas] = await db.query(
      `SELECT estado, COUNT(*) as cantidad 
       FROM reserva 
       WHERE DATE(fecha_creacion) BETWEEN ? AND ?
       GROUP BY estado`,
      [inicio, fin]
    );

    res.json(reservas);
  } catch (error) {
    console.error('Error al obtener reservas por estado:', error);
    res.status(500).json({ message: 'Error al obtener datos' });
  }
};

// 📅 Reservas por periodo (desglose)
export const getReservasPorPeriodo = async (req, res) => {
  try {
    const { periodo = 'mes', inicio: inicioQuery, fin: finQuery } = req.query;
    const { inicio, fin, periodo: periodoResuelto } = obtenerRangoFechas(periodo, inicioQuery, finQuery);
    
    let formatoFecha, groupBy;
    
    switch(periodoResuelto) {
      case 'semana':
        formatoFecha = '%Y-%m-%d'; // Por día
        groupBy = 'DATE(fecha_creacion)';
        break;
      case 'mes':
        formatoFecha = '%Y-%m-%d'; // Por día del mes
        groupBy = 'DATE(fecha_creacion)';
        break;
      case 'año':
        formatoFecha = '%Y-%m'; // Por mes del año
        groupBy = 'DATE_FORMAT(fecha_creacion, "%Y-%m")';
        break;
      default:
        formatoFecha = '%Y-%m-%d';
        groupBy = 'DATE(fecha_creacion)';
    }

    const [reservas] = await db.query(
      `SELECT 
        DATE_FORMAT(fecha_creacion, ?) as periodo,
        COUNT(*) as cantidad,
        COALESCE(SUM(total), 0) as ingresos
       FROM reserva
       WHERE DATE(fecha_creacion) BETWEEN ? AND ?
       GROUP BY ${groupBy}
       ORDER BY periodo ASC`,
      [formatoFecha, inicio, fin]
    );

    res.json(reservas);
  } catch (error) {
    console.error('Error al obtener reservas por periodo:', error);
    res.status(500).json({ message: 'Error al obtener datos' });
  }
};

// 🏨 Habitaciones más reservadas
export const getHabitacionesMasReservadas = async (req, res) => {
  try {
    const { periodo = 'mes', inicio: inicioQuery, fin: finQuery } = req.query;
    const { inicio, fin } = obtenerRangoFechas(periodo, inicioQuery, finQuery);

    const [habitaciones] = await db.query(
      `SELECT 
        h.numero,
        t.nombre as tipo,
        COUNT(r.id_reserva) as total_reservas,
        COALESCE(SUM(r.total), 0) as ingresos_generados
       FROM habitacion h
       LEFT JOIN reserva r ON h.id_habitacion = r.id_habitacion 
         AND DATE(r.fecha_creacion) BETWEEN ? AND ?
       LEFT JOIN tipo t ON h.id_tipo = t.id_tipo
       GROUP BY h.id_habitacion, h.numero, t.nombre
       HAVING total_reservas > 0
       ORDER BY total_reservas DESC
       LIMIT 10`,
      [inicio, fin]
    );

    res.json(habitaciones);
  } catch (error) {
    console.error('Error al obtener habitaciones más reservadas:', error);
    res.status(500).json({ message: 'Error al obtener datos' });
  }
};

// 💳 Métodos de pago más usados
export const getMetodosPago = async (req, res) => {
  try {
    const { periodo = 'mes', inicio: inicioQuery, fin: finQuery } = req.query;
    const { inicio, fin } = obtenerRangoFechas(periodo, inicioQuery, finQuery);

    const [metodos] = await db.query(
      `SELECT 
        metodo_pago,
        COUNT(*) as cantidad,
        COALESCE(SUM(monto), 0) as total_monto
       FROM pago
       WHERE DATE(fecha_pago) BETWEEN ? AND ?
       GROUP BY metodo_pago`,
      [inicio, fin]
    );

    res.json(metodos);
  } catch (error) {
    console.error('Error al obtener métodos de pago:', error);
    res.status(500).json({ message: 'Error al obtener datos' });
  }
};

// 🌡️ Ocupación por temporada
export const getOcupacionPorTemporada = async (req, res) => {
  try {
    const [ocupacion] = await db.query(
      `SELECT 
        t.nombre as temporada,
        COUNT(r.id_reserva) as total_reservas,
        AVG(r.total) as promedio_ingreso
       FROM temporada t
       LEFT JOIN reserva r ON MONTH(r.fecha_entrada) BETWEEN t.mes_inicio AND t.mes_fin
       WHERE t.activo = 1
       GROUP BY t.id_temporada, t.nombre
       ORDER BY total_reservas DESC`
    );

    res.json(ocupacion);
  } catch (error) {
    console.error('Error al obtener ocupación por temporada:', error);
    res.status(500).json({ message: 'Error al obtener datos' });
  }
};

// 👥 Clientes más frecuentes
export const getClientesFrecuentes = async (req, res) => {
  try {
    const { periodo = 'mes', inicio: inicioQuery, fin: finQuery } = req.query;
    const { inicio, fin } = obtenerRangoFechas(periodo, inicioQuery, finQuery);

    const [clientes] = await db.query(
      `SELECT 
        c.nombre,
        c.apellido,
        c.correo,
        COUNT(r.id_reserva) as total_reservas,
        COALESCE(SUM(r.total), 0) as gasto_total
       FROM cliente c
       LEFT JOIN reserva r ON c.id_cliente = r.id_cliente 
         AND DATE(r.fecha_creacion) BETWEEN ? AND ?
       WHERE c.estado = 1
       GROUP BY c.id_cliente, c.nombre, c.apellido, c.correo
       HAVING total_reservas > 0
       ORDER BY total_reservas DESC
       LIMIT 10`,
      [inicio, fin]
    );

    res.json(clientes);
  } catch (error) {
    console.error('Error al obtener clientes frecuentes:', error);
    res.status(500).json({ message: 'Error al obtener datos' });
  }
};

// 📊 Estado de habitaciones
export const getEstadoHabitaciones = async (req, res) => {
  try {
    const [estados] = await db.query(
      `SELECT 
        estado,
        COUNT(*) as cantidad
       FROM habitacion
       GROUP BY estado`
    );

    res.json(estados);
  } catch (error) {
    console.error('Error al obtener estado de habitaciones:', error);
    res.status(500).json({ message: 'Error al obtener datos' });
  }
};

// 💰 Ingresos por periodo
export const getIngresosPorPeriodo = async (req, res) => {
  try {
    const { periodo = 'mes', inicio: inicioQuery, fin: finQuery } = req.query;
    const { inicio, fin, periodo: periodoResuelto } = obtenerRangoFechas(periodo, inicioQuery, finQuery);

    let formatoFecha, groupBy;
    
    switch(periodoResuelto) {
      case 'semana':
      case 'mes':
        formatoFecha = '%Y-%m-%d';
        groupBy = 'DATE(fecha_pago)';
        break;
      case 'año':
        formatoFecha = '%Y-%m';
        groupBy = 'DATE_FORMAT(fecha_pago, "%Y-%m")';
        break;
      default:
        formatoFecha = '%Y-%m-%d';
        groupBy = 'DATE(fecha_pago)';
    }

    const [ingresos] = await db.query(
      `SELECT 
        DATE_FORMAT(fecha_pago, ?) as fecha,
        COALESCE(SUM(monto), 0) as total
       FROM pago
       WHERE DATE(fecha_pago) BETWEEN ? AND ?
       GROUP BY ${groupBy}
       ORDER BY fecha ASC`,
      [formatoFecha, inicio, fin]
    );

    res.json(ingresos);
  } catch (error) {
    console.error('Error al obtener ingresos por periodo:', error);
    res.status(500).json({ message: 'Error al obtener datos' });
  }
};

// 🚀 Endpoint único para el dashboard (menos roundtrips al backend)
export const getDashboardOverview = async (req, res) => {
  try {
    const { periodo = 'mes', inicio: inicioQuery, fin: finQuery } = req.query;
    const { inicio, fin, periodo: periodoResuelto } = obtenerRangoFechas(periodo, inicioQuery, finQuery);

    const connection = await db.getConnection();

    const hoy = toYmdLocal(new Date());
    const proximaSemana = (() => {
      const d = new Date();
      d.setDate(d.getDate() + 7);
      return toYmdLocal(d);
    })();

    const [
      [totalReservas],
      [totalClientes],
      [ingresosPeriodo],
      [habitacionesDisponibles],
      [totalHabitaciones],
      [reservasPorEstado],
      [reservasPorPeriodo],
      [ingresosPorPeriodo],
      [habitacionesMasReservadas],
      [metodosPago],
      [estadoHabitaciones],
      [clientesFrecuentes],
      [ocupadasEnRango],
      [kpisNoches],
      [proximasEntradas],
      [proximasSalidas],
    ] = await Promise.all([
      connection.query(
        `SELECT COUNT(*) as total FROM reserva 
         WHERE DATE(fecha_creacion) BETWEEN ? AND ?`,
        [inicio, fin]
      ),
      connection.query('SELECT COUNT(*) as total FROM cliente WHERE estado = 1'),
      connection.query(
        `SELECT COALESCE(SUM(monto), 0) as total FROM pago 
         WHERE DATE(fecha_pago) BETWEEN ? AND ?`,
        [inicio, fin]
      ),
      connection.query("SELECT COUNT(*) as total FROM habitacion WHERE estado = 'disponible'"),
      connection.query('SELECT COUNT(*) as total FROM habitacion'),
      connection.query(
        `SELECT estado, COUNT(*) as cantidad
         FROM reserva
         WHERE DATE(fecha_creacion) BETWEEN ? AND ?
         GROUP BY estado`,
        [inicio, fin]
      ),
      (() => {
        let formatoFecha;
        let groupBy;

        switch (periodoResuelto) {
          case 'año':
            formatoFecha = '%Y-%m';
            groupBy = 'DATE_FORMAT(fecha_creacion, "%Y-%m")';
            break;
          case 'semana':
          case 'mes':
          default:
            formatoFecha = '%Y-%m-%d';
            groupBy = 'DATE(fecha_creacion)';
        }

        return connection.query(
          `SELECT 
            DATE_FORMAT(fecha_creacion, ?) as periodo,
            COUNT(*) as cantidad,
            COALESCE(SUM(total), 0) as ingresos
           FROM reserva
           WHERE DATE(fecha_creacion) BETWEEN ? AND ?
           GROUP BY ${groupBy}
           ORDER BY periodo ASC`,
          [formatoFecha, inicio, fin]
        );
      })(),
      (() => {
        let formatoFecha;
        let groupBy;

        switch (periodoResuelto) {
          case 'año':
            formatoFecha = '%Y-%m';
            groupBy = 'DATE_FORMAT(fecha_pago, "%Y-%m")';
            break;
          case 'semana':
          case 'mes':
          default:
            formatoFecha = '%Y-%m-%d';
            groupBy = 'DATE(fecha_pago)';
        }

        return connection.query(
          `SELECT 
            DATE_FORMAT(fecha_pago, ?) as fecha,
            COALESCE(SUM(monto), 0) as total
           FROM pago
           WHERE DATE(fecha_pago) BETWEEN ? AND ?
           GROUP BY ${groupBy}
           ORDER BY fecha ASC`,
          [formatoFecha, inicio, fin]
        );
      })(),
      connection.query(
        `SELECT 
          h.numero,
          t.nombre as tipo,
          COUNT(r.id_reserva) as total_reservas,
          COALESCE(SUM(r.total), 0) as ingresos_generados
         FROM habitacion h
         LEFT JOIN reserva r ON h.id_habitacion = r.id_habitacion 
           AND DATE(r.fecha_creacion) BETWEEN ? AND ?
         LEFT JOIN tipo t ON h.id_tipo = t.id_tipo
         GROUP BY h.id_habitacion, h.numero, t.nombre
         HAVING total_reservas > 0
         ORDER BY total_reservas DESC
         LIMIT 10`,
        [inicio, fin]
      ),
      connection.query(
        `SELECT 
          metodo_pago,
          COUNT(*) as cantidad,
          COALESCE(SUM(monto), 0) as total_monto
         FROM pago
         WHERE DATE(fecha_pago) BETWEEN ? AND ?
         GROUP BY metodo_pago`,
        [inicio, fin]
      ),
      connection.query(
        `SELECT estado, COUNT(*) as cantidad
         FROM habitacion
         GROUP BY estado`
      ),
      connection.query(
        `SELECT 
          c.nombre,
          c.apellido,
          c.correo,
          COUNT(r.id_reserva) as total_reservas,
          COALESCE(SUM(r.total), 0) as gasto_total
         FROM cliente c
         LEFT JOIN reserva r ON c.id_cliente = r.id_cliente 
           AND DATE(r.fecha_creacion) BETWEEN ? AND ?
         WHERE c.estado = 1
         GROUP BY c.id_cliente, c.nombre, c.apellido, c.correo
         HAVING total_reservas > 0
         ORDER BY total_reservas DESC
         LIMIT 10`,
        [inicio, fin]
      ),
      connection.query(
        `SELECT COUNT(DISTINCT r.id_habitacion) as total
         FROM reserva r
         WHERE r.estado IN ('pendiente','confirmada')
           AND DATE(r.fecha_entrada) <= ?
           AND DATE(r.fecha_salida) >= ?`,
        [fin, inicio]
      ),
      connection.query(
        `SELECT
          COALESCE(SUM(DATEDIFF(r.fecha_salida, r.fecha_entrada)), 0) as total_noches,
          COALESCE(AVG(DATEDIFF(r.fecha_salida, r.fecha_entrada)), 0) as noches_promedio,
          COALESCE(SUM(r.total), 0) as total_reservas_monto
         FROM reserva r
         WHERE r.estado IN ('pendiente','confirmada','finalizada')
           AND DATE(r.fecha_creacion) BETWEEN ? AND ?`,
        [inicio, fin]
      ),
      connection.query(
        `SELECT 
          r.id_reserva,
          DATE(r.fecha_entrada) as fecha_entrada,
          r.estado,
          h.numero as habitacion,
          CONCAT(c.nombre,' ',c.apellido) as cliente,
          r.total
         FROM reserva r
         INNER JOIN habitacion h ON r.id_habitacion = h.id_habitacion
         INNER JOIN cliente c ON r.id_cliente = c.id_cliente
         WHERE r.estado IN ('pendiente','confirmada')
           AND DATE(r.fecha_entrada) BETWEEN ? AND ?
         ORDER BY r.fecha_entrada ASC
         LIMIT 10`,
        [hoy, proximaSemana]
      ),
      connection.query(
        `SELECT 
          r.id_reserva,
          DATE(r.fecha_salida) as fecha_salida,
          r.estado,
          h.numero as habitacion,
          CONCAT(c.nombre,' ',c.apellido) as cliente,
          r.total
         FROM reserva r
         INNER JOIN habitacion h ON r.id_habitacion = h.id_habitacion
         INNER JOIN cliente c ON r.id_cliente = c.id_cliente
         WHERE r.estado IN ('pendiente','confirmada')
           AND DATE(r.fecha_salida) BETWEEN ? AND ?
         ORDER BY r.fecha_salida ASC
         LIMIT 10`,
        [hoy, proximaSemana]
      ),
    ]);

    connection.release();

    const totalHab = Number(totalHabitaciones?.[0]?.total || 0);
    const ocupadasRango = Number(ocupadasEnRango?.[0]?.total || 0);
    const tasaOcupacion = totalHab > 0 ? (ocupadasRango / totalHab) * 100 : 0;

    const nochesTotales = Number(kpisNoches?.[0]?.total_noches || 0);
    const totalReservaMonto = Number(kpisNoches?.[0]?.total_reservas_monto || 0);
    const adr = nochesTotales > 0 ? totalReservaMonto / nochesTotales : 0;
    const revpar = totalHab > 0 ? (adr * (tasaOcupacion / 100)) : 0;

    res.json({
      rango: { inicio, fin, periodo: periodoResuelto },
      estadisticasGenerales: {
        totalReservas: Number(totalReservas?.[0]?.total || 0),
        totalClientes: Number(totalClientes?.[0]?.total || 0),
        ingresosPeriodo: Number(ingresosPeriodo?.[0]?.total || 0),
        habitacionesDisponibles: Number(habitacionesDisponibles?.[0]?.total || 0),
        totalHabitaciones: totalHab,
        habitacionesOcupadasRango: ocupadasRango,
        tasaOcupacion: Number(tasaOcupacion.toFixed(2)),
        adr: Number(adr.toFixed(2)),
        revpar: Number(revpar.toFixed(2)),
        nochesPromedio: Number(Number(kpisNoches?.[0]?.noches_promedio || 0).toFixed(2)),
      },
      reservasPorEstado: reservasPorEstado || [],
      reservasPorPeriodo: reservasPorPeriodo || [],
      ingresosPorPeriodo: ingresosPorPeriodo || [],
      habitacionesMasReservadas: habitacionesMasReservadas || [],
      metodosPago: metodosPago || [],
      estadoHabitaciones: estadoHabitaciones || [],
      clientesFrecuentes: clientesFrecuentes || [],
      proximasEntradas: proximasEntradas || [],
      proximasSalidas: proximasSalidas || [],
    });
  } catch (error) {
    console.error('Error al obtener overview del dashboard:', error);
    res.status(500).json({ message: 'Error al obtener datos del dashboard' });
  }
};