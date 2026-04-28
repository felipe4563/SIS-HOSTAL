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
 * Listar roles con permisos
 */
export const listarRoles = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
      r.id_rol, 
      r.nombre_rol, 
      r.descripcion,
      GROUP_CONCAT(rp.id_permiso) AS permisos_ids,
      GROUP_CONCAT(p.nombre) AS permisos_nombres
    FROM rol r
    LEFT JOIN rol_permiso rp ON r.id_rol = rp.id_rol
    LEFT JOIN permisos p ON rp.id_permiso = p.id_permiso
    GROUP BY r.id_rol
    `);

    // Convertir permisos de string a array de nombres
    const roles = rows.map(r => ({
      ...r,
      permisos: r.permisos_nombres ? r.permisos_nombres.split(',') : []
    }));

    res.json(roles);
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
    const [rows] = await db.query(`
      SELECT r.id_rol, r.nombre_rol, r.descripcion,
             GROUP_CONCAT(rp.id_permiso) AS permisos
      FROM rol r
      LEFT JOIN rol_permiso rp ON r.id_rol = rp.id_rol
      WHERE r.id_rol = ?
      GROUP BY r.id_rol
    `, [id]);

    if (rows.length === 0) return res.status(404).json({ message: 'Rol no encontrado' });

    const rol = rows[0];
    rol.permisos = rol.permisos ? rol.permisos.split(',').map(Number) : [];
    res.json(rol);
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
  const idRol = Number(id);

  if (!Number.isInteger(idRol) || idRol <= 0) {
    return res.status(400).json({ message: 'ID de rol inválido' });
  }

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const [rolRows] = await connection.query(`SELECT id_rol FROM rol WHERE id_rol = ?`, [idRol]);
    if (rolRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: 'Rol no encontrado' });
    }

    const [usuarios] = await connection.query(
      `SELECT COUNT(*) AS total FROM usuario WHERE id_rol = ?`,
      [idRol]
    );

    if (usuarios[0].total > 0) {
      await connection.rollback();
      return res.status(409).json({
        message: 'No se puede eliminar el rol porque está asignado a uno o más usuarios'
      });
    }

    await connection.query(`DELETE FROM rol_permiso WHERE id_rol = ?`, [idRol]);
    await connection.query(`DELETE FROM rol WHERE id_rol = ?`, [idRol]);

    await connection.commit();
    res.json({ message: 'Rol eliminado' });
  } catch (err) {
    await connection.rollback();
    console.error(err);
    if (err.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(409).json({
        message: 'No se puede eliminar el rol porque tiene registros relacionados'
      });
    }
    res.status(500).json({ message: 'Error al eliminar rol' });
  } finally {
    connection.release();
  }
};

/**
 * Asignar permisos a un rol
 */
export const asignarPermisos = async (req, res) => {
  const idRol = Number(req.params.id);
  const { permisos = [] } = req.body; // array de id_permiso

  if (!Number.isInteger(idRol) || idRol <= 0) {
    return res.status(400).json({ message: 'ID de rol inválido' });
  }

  try {
    const [rolRows] = await db.query(`SELECT id_rol FROM rol WHERE id_rol = ?`, [idRol]);
    if (rolRows.length === 0) {
      return res.status(404).json({ message: 'Rol no encontrado' });
    }

    const permisosLimpios = [...new Set(
      permisos
        .map((p) => Number(p))
        .filter((p) => Number.isInteger(p) && p > 0)
    )];

    if (permisosLimpios.length !== permisos.length) {
      return res.status(400).json({ message: 'Lista de permisos inválida' });
    }

    // Validar que los permisos existen
    if (permisosLimpios.length > 0) {
      const [existing] = await db.query(
        `SELECT id_permiso FROM permisos WHERE id_permiso IN (?)`, 
        [permisosLimpios]
      );

      const existingIds = existing.map(p => p.id_permiso);
      const invalid = permisosLimpios.filter(p => !existingIds.includes(p));
      if (invalid.length > 0) {
        return res.status(400).json({ message: 'Permisos inválidos', invalid });
      }
    }

    // Primero eliminar permisos existentes
    await db.query(`DELETE FROM rol_permiso WHERE id_rol = ?`, [idRol]);

    // Insertar permisos nuevos
    const values = permisosLimpios.map(id_permiso => [idRol, id_permiso]);
    if (values.length > 0) {
      await db.query(`INSERT INTO rol_permiso (id_rol, id_permiso) VALUES ?`, [values]);
    }

    res.json({ message: 'Permisos asignados', permisos: permisosLimpios });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al asignar permisos' });
  }
};
