import db from '../config/db.js';

export const listarTipos = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM tipo ORDER BY nombre');
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener tipos:', error);
    res.status(500).json({ message: 'Error al obtener tipos de habitación' });
  }
};

export const obtenerTipo = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.query('SELECT * FROM tipo WHERE id_tipo = ?', [id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Tipo de habitación no encontrado' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Error al obtener tipo:', error);
    res.status(500).json({ message: 'Error al obtener tipo de habitación' });
  }
};

export const crearTipo = async (req, res) => {
  const { nombre, capacidad, precio_base, descripcion } = req.body;

  // Validaciones
  if (!nombre || !capacidad || !precio_base) {
    return res.status(400).json({ 
      message: 'Nombre, capacidad y precio base son obligatorios' 
    });
  }

  try {
    const [result] = await db.query(
      `INSERT INTO tipo (nombre, capacidad, precio_base, descripcion) 
       VALUES (?, ?, ?, ?)`,
      [nombre, capacidad, precio_base, descripcion]
    );
    
    res.status(201).json({ 
      message: 'Tipo de habitación creado exitosamente', 
      id: result.insertId 
    });
  } catch (error) {
    console.error('Error al crear tipo:', error);
    
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'El nombre del tipo ya existe' });
    }
    
    res.status(500).json({ message: 'Error al crear tipo de habitación' });
  }
};

export const editarTipo = async (req, res) => {
  const { id } = req.params;
  const { nombre, capacidad, precio_base, descripcion } = req.body;

  try {
    // Verificar si el tipo existe
    const [tipo] = await db.query(
      'SELECT id_tipo FROM tipo WHERE id_tipo = ?',
      [id]
    );

    if (tipo.length === 0) {
      return res.status(404).json({ message: 'Tipo de habitación no encontrado' });
    }

    await db.query(
      `UPDATE tipo 
       SET nombre=?, capacidad=?, precio_base=?, descripcion=?
       WHERE id_tipo=?`,
      [nombre, capacidad, precio_base, descripcion, id]
    );
    
    res.json({ message: 'Tipo de habitación actualizado exitosamente' });
  } catch (error) {
    console.error('Error al editar tipo:', error);
    res.status(500).json({ message: 'Error al actualizar tipo de habitación' });
  }
};

export const eliminarTipo = async (req, res) => {
  const { id } = req.params;

  try {
    // Verificar si el tipo existe
    const [tipo] = await db.query(
      'SELECT id_tipo FROM tipo WHERE id_tipo = ?',
      [id]
    );

    if (tipo.length === 0) {
      return res.status(404).json({ message: 'Tipo de habitación no encontrado' });
    }

    // Verificar si hay habitaciones usando este tipo
    const [habitaciones] = await db.query(
      'SELECT id_habitacion FROM habitacion WHERE id_tipo = ?',
      [id]
    );

    if (habitaciones.length > 0) {
      return res.status(400).json({ 
        message: 'No se puede eliminar. Existen habitaciones con este tipo' 
      });
    }

    await db.query('DELETE FROM tipo WHERE id_tipo = ?', [id]);
    
    res.json({ message: 'Tipo de habitación eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar tipo:', error);
    res.status(500).json({ message: 'Error al eliminar tipo de habitación' });
  }
};