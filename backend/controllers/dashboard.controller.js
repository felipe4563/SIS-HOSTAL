import db from '../config/db.js';

export const obtenerEstadisticas = async (req, res) => {
  try {
    // Estadísticas generales
    const [totalHabitaciones] = await db.query(
      'SELECT COUNT(*) as total FROM habitacion'
    );

    const [habitacionesDisponibles] = await db.query(
      'SELECT COUNT(*) as disponibles FROM habitacion WHERE estado = "disponible"'
    );

    const [habitacionesOcupadas] = await db.query(
      'SELECT COUNT(*) as ocupadas FROM habitacion WHERE estado = "ocupada"'
    );

    const [totalClientes] = await db.query(
      'SELECT COUNT(*) as total FROM cliente'
    );

    // Ingresos del mes actual
    const [ingresosMes] = await db.query(`
      SELECT COALESCE(SUM(total), 0) as ingresos_mes 
      FROM reservas 
      WHERE MONTH(fecha_creacion) = MONTH(CURRENT_DATE()) 
      AND YEAR(fecha_creacion) = YEAR(CURRENT_DATE())
      AND estado = 'confirmada'
    `);

    // Habitaciones más populares
    const [habitacionesPopulares] = await db.query(`
      SELECT h.numero, h.tipo_habitacion, COUNT(r.id_reserva) as reservas_count
      FROM habitacion h
      LEFT JOIN reservas r ON h.id_habitacion = r.id_habitacion
      GROUP BY h.id_habitacion, h.numero, h.tipo_habitacion
      ORDER BY reservas_count DESC
      LIMIT 5
    `);

    // Estado de habitaciones por piso
    const [estadoPorPiso] = await db.query(`
      SELECT 
        piso,
        COUNT(*) as total,
        SUM(CASE WHEN estado = 'disponible' THEN 1 ELSE 0 END) as disponibles,
        SUM(CASE WHEN estado = 'ocupada' THEN 1 ELSE 0 END) as ocupadas,
        SUM(CASE WHEN estado = 'limpieza' THEN 1 ELSE 0 END) as limpieza
      FROM habitacion
      GROUP BY piso
      ORDER BY piso
    `);

    // Reservas recientes (últimas 5)
    const [reservasRecientes] = await db.query(`
      SELECT r.id_reserva, r.fecha_entrada, r.fecha_salida, r.estado,
             c.nombre, c.apellido, h.numero as habitacion
      FROM reservas r
      INNER JOIN cliente c ON r.id_cliente = c.id_cliente
      INNER JOIN habitacion h ON r.id_habitacion = h.id_habitacion
      ORDER BY r.fecha_creacion DESC
      LIMIT 5
    `);

    res.json({
      success: true,
      data: {
        estadisticas: {
          total_habitaciones: totalHabitaciones[0].total,
          habitaciones_disponibles: habitacionesDisponibles[0].disponibles,
          habitaciones_ocupadas: habitacionesOcupadas[0].ocupadas,
          total_clientes: totalClientes[0].total,
          ingresos_mes: parseFloat(ingresosMes[0].ingresos_mes) || 0
        },
        habitaciones_populares: habitacionesPopulares,
        estado_por_piso: estadoPorPiso,
        reservas_recientes: reservasRecientes
      }
    });

  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

export const obtenerGraficoReservas = async (req, res) => {
  try {
    // Reservas por mes (últimos 6 meses)
    const [reservasPorMes] = await db.query(`
      SELECT 
        DATE_FORMAT(fecha_creacion, '%Y-%m') as mes,
        COUNT(*) as total_reservas,
        SUM(total) as ingresos
      FROM reservas 
      WHERE fecha_creacion >= DATE_SUB(CURRENT_DATE(), INTERVAL 6 MONTH)
      AND estado = 'confirmada'
      GROUP BY DATE_FORMAT(fecha_creacion, '%Y-%m')
      ORDER BY mes
    `);

    // Tipos de habitación más reservados
    const [tiposPopulares] = await db.query(`
      SELECT t.nombre, COUNT(r.id_reserva) as reservas_count
      FROM tipo t
      LEFT JOIN habitacion h ON t.id_tipo = h.id_tipo
      LEFT JOIN reservas r ON h.id_habitacion = r.id_habitacion
      WHERE r.fecha_creacion >= DATE_SUB(CURRENT_DATE(), INTERVAL 3 MONTH)
      GROUP BY t.id_tipo, t.nombre
      ORDER BY reservas_count DESC
    `);

    res.json({
      success: true,
      data: {
        reservas_por_mes: reservasPorMes,
        tipos_populares: tiposPopulares
      }
    });

  } catch (error) {
    console.error('Error al obtener datos para gráficos:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

export const obtenerAlertas = async (req, res) => {
  try {
    // Habitaciones en mantenimiento por mucho tiempo
    const [habitacionesMantenimiento] = await db.query(`
      SELECT numero, estado, descripcion
      FROM habitacion 
      WHERE estado = 'limpieza'
      ORDER BY id_habitacion
      LIMIT 10
    `);

    // Reservas pendientes de confirmación
    const [reservasPendientes] = await db.query(`
      SELECT COUNT(*) as pendientes
      FROM reservas 
      WHERE estado = 'pendiente'
    `);

    // Clientes frecuentes
    const [clientesFrecuentes] = await db.query(`
      SELECT c.nombre, c.apellido, COUNT(r.id_reserva) as total_reservas
      FROM cliente c
      INNER JOIN reservas r ON c.id_cliente = r.id_cliente
      GROUP BY c.id_cliente, c.nombre, c.apellido
      HAVING total_reservas >= 3
      ORDER BY total_reservas DESC
      LIMIT 5
    `);

    res.json({
      success: true,
      data: {
        alertas: {
          habitaciones_mantenimiento: habitacionesMantenimiento,
          reservas_pendientes: reservasPendientes[0].pendientes,
          clientes_frecuentes: clientesFrecuentes
        }
      }
    });

  } catch (error) {
    console.error('Error al obtener alertas:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};