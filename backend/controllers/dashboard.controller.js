import db from '../config/db.js';

// Helper function para obtener el rango de fechas según el periodo
const obtenerRangoFechas = (periodo) => {
  let fechaInicio, fechaFin;
  const ahora = new Date();
  
  switch(periodo) {
    case 'semana':
      fechaInicio = new Date(ahora);
      fechaInicio.setDate(ahora.getDate() - 7);
      fechaFin = ahora;
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
      // Por defecto mes actual
      fechaInicio = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
      fechaFin = new Date(ahora.getFullYear(), ahora.getMonth() + 1, 0);
  }
  
  return {
    inicio: fechaInicio.toISOString().split('T')[0],
    fin: fechaFin.toISOString().split('T')[0]
  };
};

// 📊 Obtener estadísticas generales del dashboard
export const getEstadisticasGenerales = async (req, res) => {
  try {
    const { periodo = 'mes' } = req.query;
    const { inicio, fin } = obtenerRangoFechas(periodo);
    
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

    connection.release();

    res.json({
      totalReservas: totalReservas[0].total,
      totalClientes: totalClientes[0].total,
      ingresosPeriodo: parseFloat(ingresosPeriodo[0].total),
      habitacionesDisponibles: habitacionesDisponibles[0].total,
      totalHabitaciones: totalHabitaciones[0].total,
      tasaOcupacion: ((totalHabitaciones[0].total - habitacionesDisponibles[0].total) / totalHabitaciones[0].total * 100).toFixed(2),
      periodo: periodo,
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
    const { periodo = 'mes' } = req.query;
    const { inicio, fin } = obtenerRangoFechas(periodo);

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
    const { periodo = 'mes' } = req.query;
    const { inicio, fin } = obtenerRangoFechas(periodo);
    
    let formatoFecha, groupBy;
    
    switch(periodo) {
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
    const { periodo = 'mes' } = req.query;
    const { inicio, fin } = obtenerRangoFechas(periodo);

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
    const { periodo = 'mes' } = req.query;
    const { inicio, fin } = obtenerRangoFechas(periodo);

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
    const { periodo = 'mes' } = req.query;
    const { inicio, fin } = obtenerRangoFechas(periodo);

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
    const { periodo = 'mes' } = req.query;
    const { inicio, fin } = obtenerRangoFechas(periodo);

    let formatoFecha, groupBy;
    
    switch(periodo) {
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