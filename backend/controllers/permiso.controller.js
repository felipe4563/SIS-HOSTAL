import db from '../config/db.js';

// ✅ Crear un nuevo permiso
export const crearPermiso = async (req, res) => {
  const { nombre, descripcion } = req.body;

  try {
    // Verificar si ya existe un permiso con el mismo nombre
    const [existente] = await db.query(
      'SELECT * FROM permisos WHERE nombre = ?',
      [nombre]
    );
    if (existente.length > 0)
      return res.status(400).json({ message: 'El permiso ya existe' });

    // Insertar nuevo permiso
    await db.query(
      'INSERT INTO permisos (nombre, descripcion) VALUES (?, ?)',
      [nombre, descripcion]
    );
    res.status(201).json({ message: 'Permiso creado correctamente' });
  } catch (error) {
    console.error('Error al crear permiso:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

// ✅ Obtener todos los permisos
export const obtenerPermisos = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM permisos');
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener permisos:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

// ✅ Obtener un permiso por ID
export const obtenerPermisoPorId = async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await db.query('SELECT * FROM permisos WHERE id_permiso = ?', [id]);
    if (rows.length === 0)
      return res.status(404).json({ message: 'Permiso no encontrado' });

    res.json(rows[0]);
  } catch (error) {
    console.error('Error al obtener permiso:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

// ✅ Actualizar un permiso
export const actualizarPermiso = async (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion } = req.body;

  try {
    const [result] = await db.query(
      'UPDATE permisos SET nombre = ?, descripcion = ? WHERE id_permiso = ?',
      [nombre, descripcion, id]
    );

    if (result.affectedRows === 0)
      return res.status(404).json({ message: 'Permiso no encontrado' });

    res.json({ message: 'Permiso actualizado correctamente' });
  } catch (error) {
    console.error('Error al actualizar permiso:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

// ✅ Eliminar un permiso
export const eliminarPermiso = async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await db.query('DELETE FROM permisos WHERE id_permiso = ?', [id]);

    if (result.affectedRows === 0)
      return res.status(404).json({ message: 'Permiso no encontrado' });

    res.json({ message: 'Permiso eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar permiso:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};
