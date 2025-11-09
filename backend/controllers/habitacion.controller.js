import db from '../config/db.js';

export const listarHabitaciones = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        h.*,
        t.nombre as tipo_habitacion,
        t.capacidad,
        t.precio_base
      FROM habitacion h
      INNER JOIN tipo t ON h.id_tipo = t.id_tipo
      ORDER BY h.piso, h.numero
    `);
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener habitaciones:', error);
    res.status(500).json({ message: 'Error al obtener habitaciones' });
  }
};

export const obtenerHabitacion = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.query(`
      SELECT 
        h.*,
        t.nombre as tipo_habitacion,
        t.capacidad,
        t.precio_base
      FROM habitacion h
      INNER JOIN tipo t ON h.id_tipo = t.id_tipo
      WHERE h.id_habitacion = ?
    `, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Habitación no encontrada' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Error al obtener habitación:', error);
    res.status(500).json({ message: 'Error al obtener habitación' });
  }
};

// ✅ AGREGAR ESTA FUNCIÓN PARA CREAR HABITACIONES
export const crearHabitacion = async (req, res) => {
  const { numero, id_tipo, precio_total, piso, estado, descripcion } = req.body;
  
  // Validaciones básicas
  if (!numero || !id_tipo || !precio_total) {
    return res.status(400).json({ 
      message: 'Número, tipo y precio total son obligatorios' 
    });
  }

  try {
    // Verificar si el número ya existe
    const [existe] = await db.query(
      'SELECT id_habitacion FROM habitacion WHERE numero = ?',
      [numero]
    );

    if (existe.length > 0) {
      return res.status(400).json({ message: 'El número de habitación ya existe' });
    }

    const [result] = await db.query(
      `INSERT INTO habitacion (numero, id_tipo, precio_total, piso, estado, descripcion)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [numero, id_tipo, precio_total, piso, estado || 'disponible', descripcion]
    );
    
    res.status(201).json({ 
      message: 'Habitación creada exitosamente', 
      id: result.insertId 
    });
  } catch (error) {
    console.error('Error al crear habitación:', error);
    
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({ message: 'El tipo de habitación no existe' });
    }
    
    res.status(500).json({ message: 'Error al crear habitación' });
  }
};

export const editarHabitacion = async (req, res) => {
  const { id } = req.params;
  const { numero, id_tipo, precio_total, piso, estado, descripcion } = req.body;

  try {
    // Verificar si la habitación existe
    const [habitacion] = await db.query(
      'SELECT id_habitacion FROM habitacion WHERE id_habitacion = ?',
      [id]
    );

    if (habitacion.length === 0) {
      return res.status(404).json({ message: 'Habitación no encontrada' });
    }

    // Verificar si el nuevo número ya existe (excluyendo la actual)
    if (numero) {
      const [existe] = await db.query(
        'SELECT id_habitacion FROM habitacion WHERE numero = ? AND id_habitacion != ?',
        [numero, id]
      );

      if (existe.length > 0) {
        return res.status(400).json({ message: 'El número de habitación ya existe' });
      }
    }

    await db.query(
      `UPDATE habitacion 
       SET numero=?, id_tipo=?, precio_total=?, piso=?, estado=?, descripcion=?
       WHERE id_habitacion=?`,
      [numero, id_tipo, precio_total, piso, estado, descripcion, id]
    );
    
    res.json({ message: 'Habitación actualizada exitosamente' });
  } catch (error) {
    console.error('Error al editar habitación:', error);
    res.status(500).json({ message: 'Error al actualizar habitación' });
  }
};

export const eliminarHabitacion = async (req, res) => {
  const { id } = req.params;

  try {
    // Verificar si la habitación existe
    const [habitacion] = await db.query(
      'SELECT id_habitacion FROM habitacion WHERE id_habitacion = ?',
      [id]
    );

    if (habitacion.length === 0) {
      return res.status(404).json({ message: 'Habitación no encontrada' });
    }

    // Verificar si la habitación está ocupada antes de eliminar
    const [estado] = await db.query(
      'SELECT estado FROM habitacion WHERE id_habitacion = ?',
      [id]
    );

    if (estado[0].estado === 'ocupada') {
      return res.status(400).json({ 
        message: 'No se puede eliminar una habitación ocupada' 
      });
    }

    await db.query('DELETE FROM habitacion WHERE id_habitacion = ?', [id]);
    
    res.json({ message: 'Habitación eliminada exitosamente' });
  } catch (error) {
    console.error('Error al eliminar habitación:', error);
    res.status(500).json({ message: 'Error al eliminar habitación' });
  }
};

export const cambiarEstadoHabitacion = async (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;

  const estadosPermitidos = ['disponible', 'ocupada', 'limpieza'];
  
  if (!estadosPermitidos.includes(estado)) {
    return res.status(400).json({ 
      message: 'Estado no válido. Use: disponible, ocupada o limpieza' 
    });
  }

  try {
    const [result] = await db.query(
      'UPDATE habitacion SET estado = ? WHERE id_habitacion = ?',
      [estado, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Habitación no encontrada' });
    }

    res.json({ message: `Estado cambiado a: ${estado}` });
  } catch (error) {
    console.error('Error al cambiar estado:', error);
    res.status(500).json({ message: 'Error al cambiar estado' });
  }
};