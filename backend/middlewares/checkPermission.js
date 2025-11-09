import db from '../config/db.js';

export const checkPermission = (permiso) => {
  return async (req, res, next) => {
    const idUsuario = req.user.id_usuario;

    try {
      const [rows] = await db.query(
        `SELECT p.nombre 
         FROM permisos p
         JOIN rol_permiso rp ON p.id_permiso = rp.id_permiso
         JOIN rol r ON rp.id_rol = r.id_rol
         JOIN usuario u ON u.id_rol = r.id_rol
         WHERE u.id_usuario = ?`,
        [idUsuario]
      );

      const permisosUsuario = rows.map((r) => r.nombre);
      if (permisosUsuario.includes(permiso)) return next();

      return res.status(403).json({ message: 'Acceso denegado: permiso requerido.' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Error interno del servidor.' });
    }
  };
};
