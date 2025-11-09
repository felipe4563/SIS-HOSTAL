import db from '../config/db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export const login = async (req, res) => {
  const { identificador, password } = req.body; // puede ser correo o ci

  try {
    const [rows] = await db.query(
      'SELECT * FROM usuario WHERE correo = ? OR ci = ?',
      [identificador, identificador]
    );

    if (rows.length === 0)
      return res.status(404).json({ message: 'Usuario no encontrado' });

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(401).json({ message: 'Contraseña incorrecta' });

    // Consultar permisos del rol
    const [permisos] = await db.query(
      `SELECT p.nombre
       FROM permisos p
       INNER JOIN rol_permiso rp ON p.id_permiso = rp.id_permiso
       WHERE rp.id_rol = ?`,
      [user.id_rol]
    );

    const permisosUsuario = permisos.map(p => p.nombre); // ['ver_habitaciones', 'crear_roles', ...]

    const token = jwt.sign(
      { id_usuario: user.id_usuario, id_rol: user.id_rol, permisos: permisosUsuario },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({
      token,
      usuario: {
        id_usuario: user.id_usuario,
        nombre: user.nombre,
        apellido: user.apellido,
        correo: user.correo,
        ci: user.ci,
        id_rol: user.id_rol,
        permisos: permisosUsuario
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};
