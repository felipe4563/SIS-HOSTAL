import db from '../config/db.js';

// ✅ Crear un nuevo rol
export const crearRol = async (req, res) => {
  const { nombre_rol, descripcion } = req.body;

  try {
    // Verificar si ya existe un rol con el mismo nombre
    const [existente] = await db.query(
      'SELECT * FROM rol WHERE nombre_rol = ?',
      [nombre_rol]
    );
    if (existente.length > 0)
      return res.status(400).json({ message: 'El rol ya existe' });

    // Insertar nuevo rol
    await db.query(
      'INSERT INTO rol (nombre_rol, descripcion) VALUES (?, ?)',
      [nombre_rol, descripcion]
    );
    res.status(201).json({ message: 'Rol creado correctamente' });
  } catch (error) {
    console.error('Error al crear rol:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

// ✅ Obtener todos los roles
export const obtenerRoles = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM rol');
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener roles:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

// ✅ Obtener un rol por ID
export const obtenerRolPorId = async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await db.query('SELECT * FROM rol WHERE id_rol = ?', [id]);
    if (rows.length === 0)
      return res.status(404).json({ message: 'Rol no encontrado' });

    res.json(rows[0]);
  } catch (error) {
    console.error('Error al obtener rol:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

// ✅ Actualizar un rol
export const actualizarRol = async (req, res) => {
  const { id } = req.params;
  const { nombre_rol, descripcion } = req.body;

  try {
    const [result] = await db.query(
      'UPDATE rol SET nombre_rol = ?, descripcion = ? WHERE id_rol = ?',
      [nombre_rol, descripcion, id]
    );

    if (result.affectedRows === 0)
      return res.status(404).json({ message: 'Rol no encontrado' });

    res.json({ message: 'Rol actualizado correctamente' });
  } catch (error) {
    console.error('Error al actualizar rol:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

// ✅ Eliminar un rol
export const eliminarRol = async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await db.query('DELETE FROM rol WHERE id_rol = ?', [id]);

    if (result.affectedRows === 0)
      return res.status(404).json({ message: 'Rol no encontrado' });

    res.json({ message: 'Rol eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar rol:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};
