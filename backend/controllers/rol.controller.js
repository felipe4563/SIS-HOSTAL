import db from '../config/db.js';

/**
 * Crear rol
 */
export const crearRol = async (req, res) => {
  const { nombre_rol, descripcion } = req.body;

  try {
    const [result] = await db.query(
      `INSERT INTO rol (nombre_rol, descripcion) VALUES (?, ?)`,
      [nombre_rol, descripcion]
    );

    res.status(201).json({ message: 'Rol creado', id_rol: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al crear rol' });
  }
};

/**
 * Listar roles
 */
export const listarRoles = async (req, res) => {
  try {
    const [rows] = await db.query(`SELECT * FROM rol`);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al listar roles' });
  }
};

/**
 * Obtener rol por ID
 */
export const obtenerRol = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.query(`SELECT * FROM rol WHERE id_rol = ?`, [id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Rol no encontrado' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al obtener rol' });
  }
};

/**
 * Actualizar rol
 */
export const actualizarRol = async (req, res) => {
  const { id } = req.params;
  const { nombre_rol, descripcion } = req.body;

  try {
    await db.query(`UPDATE rol SET nombre_rol = ?, descripcion = ? WHERE id_rol = ?`,
      [nombre_rol, descripcion, id]
    );
    res.json({ message: 'Rol actualizado' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al actualizar rol' });
  }
};

/**
 * Eliminar rol
 */
export const eliminarRol = async (req, res) => {
  const { id } = req.params;
  try {
    await db.query(`DELETE FROM rol WHERE id_rol = ?`, [id]);
    res.json({ message: 'Rol eliminado' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al eliminar rol' });
  }
};

/**
 * Asignar permisos a un rol
 */
export const asignarPermisos = async (req, res) => {
  const { id } = req.params;
  const { permisos = [] } = req.body; // array de id_permiso

  try {
    // Primero eliminar permisos existentes
    await db.query(`DELETE FROM rol_permiso WHERE id_rol = ?`, [id]);

    // Insertar permisos nuevos
    const values = permisos.map(id_permiso => [id, id_permiso]);
    if (values.length > 0) {
      await db.query(`INSERT INTO rol_permiso (id_rol, id_permiso) VALUES ?`, [values]);
    }

    res.json({ message: 'Permisos asignados' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al asignar permisos' });
  }
};
