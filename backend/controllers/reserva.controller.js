import db from '../config/db.js';

// Crear reserva (público si no está logueado, protegido si sí)
export const crearReserva = async (req, res) => {
  const { id_cliente, id_habitacion, fecha_entrada, fecha_salida, total } = req.body;

  if (!id_cliente || !id_habitacion || !fecha_entrada || !fecha_salida || !total) {
    return res.status(400).json({ 
      message: 'Todos los campos son obligatorios' 
    });
  }

  try {
    // Verificar que la habitación existe
    const [habitacion] = await db.query(
      'SELECT * FROM habitacion WHERE id_habitacion = ?',
      [id_habitacion]
    );

    if (habitacion.length === 0) {
      return res.status(404).json({ message: 'Habitación no encontrada' });
    }

    // Verificar disponibilidad
    const [conflictos] = await db.query(
      `SELECT COUNT(*) as conflictos
       FROM reserva
       WHERE id_habitacion = ?
         AND estado IN ('pendiente', 'confirmada')
         AND (
           (fecha_entrada <= ? AND fecha_salida >= ?) OR
           (fecha_entrada <= ? AND fecha_salida >= ?) OR
           (fecha_entrada >= ? AND fecha_salida <= ?)
         )`,
      [
        id_habitacion,
        fecha_salida, fecha_entrada,
        fecha_salida, fecha_salida,
        fecha_entrada, fecha_salida
      ]
    );

    if (conflictos[0].conflictos > 0) {
      return res.status(400).json({ 
        message: 'La habitación no está disponible para esas fechas' 
      });
    }

    // Crear la reserva
    const [result] = await db.query(
      `INSERT INTO reserva (id_cliente, id_habitacion, fecha_entrada, fecha_salida, total, estado)
       VALUES (?, ?, ?, ?, ?, 'pendiente')`,
      [id_cliente, id_habitacion, fecha_entrada, fecha_salida, total]
    );

    res.status(201).json({
      message: 'Reserva creada exitosamente',
      id_reserva: result.insertId
    });
  } catch (error) {
    console.error('Error al crear reserva:', error);
    res.status(500).json({ message: 'Error al crear reserva' });
  }
};

// Obtener reservas del cliente logueado
export const obtenerMisReservas = async (req, res) => {
  const id_cliente = req.usuario.id_cliente;

  try {
    const [reservas] = await db.query(
      `SELECT 
        r.*,
        h.numero as numero_habitacion,
        t.nombre as tipo_habitacion
       FROM reserva r
       INNER JOIN habitacion h ON r.id_habitacion = h.id_habitacion
       INNER JOIN tipo t ON h.id_tipo = t.id_tipo
       WHERE r.id_cliente = ?
       ORDER BY r.fecha_entrada DESC`,
      [id_cliente]
    );

    res.json(reservas);
  } catch (error) {
    console.error('Error al obtener reservas:', error);
    res.status(500).json({ message: 'Error al obtener reservas' });
  }
};

// Cancelar reserva
export const cancelarReserva = async (req, res) => {
  const { id } = req.params;
  const id_cliente = req.usuario.id_cliente;

  try {
    // Verificar que la reserva existe y pertenece al cliente
    const [reserva] = await db.query(
      'SELECT * FROM reserva WHERE id_reserva = ? AND id_cliente = ?',
      [id, id_cliente]
    );

    if (reserva.length === 0) {
      return res.status(404).json({ message: 'Reserva no encontrada' });
    }

    if (reserva[0].estado === 'cancelada') {
      return res.status(400).json({ message: 'La reserva ya está cancelada' });
    }

    // Cancelar la reserva
    await db.query(
      "UPDATE reserva SET estado = 'cancelada' WHERE id_reserva = ?",
      [id]
    );

    res.json({ message: 'Reserva cancelada exitosamente' });
  } catch (error) {
    console.error('Error al cancelar reserva:', error);
    res.status(500).json({ message: 'Error al cancelar reserva' });
  }
};

// ========================================
// 👇 FUNCIONES PARA ADMINISTRADORES
// ========================================

// Obtener TODAS las reservas (admin)
export const obtenerTodasReservas = async (req, res) => {
  try {
    const [reservas] = await db.query(
      `SELECT 
        r.*,
        h.numero as numero_habitacion,
        t.nombre as tipo_habitacion,
        c.nombre as nombre_cliente,
        c.apellido as apellido_cliente,
        c.ci as ci_cliente,
        c.correo as correo_cliente,
        CONCAT(c.nombre, ' ', c.apellido) as nombre_cliente
       FROM reserva r
       INNER JOIN habitacion h ON r.id_habitacion = h.id_habitacion
       INNER JOIN tipo t ON h.id_tipo = t.id_tipo
       INNER JOIN cliente c ON r.id_cliente = c.id_cliente
       ORDER BY r.fecha_entrada DESC`
    );

    res.json(reservas);
  } catch (error) {
    console.error('Error al obtener todas las reservas:', error);
    res.status(500).json({ message: 'Error al obtener reservas' });
  }
};

// Actualizar estado de reserva (admin)
export const actualizarEstadoReserva = async (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;

  // Validar estado
  const estadosValidos = ['pendiente', 'confirmada', 'cancelada', 'finalizada'];
  if (!estadosValidos.includes(estado)) {
    return res.status(400).json({ message: 'Estado inválido' });
  }

  try {
    // Verificar que la reserva existe
    const [reserva] = await db.query(
      'SELECT * FROM reserva WHERE id_reserva = ?',
      [id]
    );

    if (reserva.length === 0) {
      return res.status(404).json({ message: 'Reserva no encontrada' });
    }

    // Actualizar estado
    await db.query(
      'UPDATE reserva SET estado = ? WHERE id_reserva = ?',
      [estado, id]
    );

    res.json({ message: 'Estado actualizado exitosamente' });
  } catch (error) {
    console.error('Error al actualizar estado:', error);
    res.status(500).json({ message: 'Error al actualizar estado' });
  }
};

// Eliminar reserva (admin)
export const eliminarReserva = async (req, res) => {
  const { id } = req.params;

  try {
    // Verificar que la reserva existe
    const [reserva] = await db.query(
      'SELECT * FROM reserva WHERE id_reserva = ?',
      [id]
    );

    if (reserva.length === 0) {
      return res.status(404).json({ message: 'Reserva no encontrada' });
    }

    // Eliminar la reserva
    await db.query('DELETE FROM reserva WHERE id_reserva = ?', [id]);

    res.json({ message: 'Reserva eliminada exitosamente' });
  } catch (error) {
    console.error('Error al eliminar reserva:', error);
    res.status(500).json({ message: 'Error al eliminar reserva' });
  }
};