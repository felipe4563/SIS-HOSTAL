import bcrypt from 'bcrypt';
import db from '../config/db.js';

export const registerUser = async (req, res) => {
  try {
    const { nombre, apellido, ci, correo, password, id_rol } = req.body;

    if (!nombre || !apellido || !ci || !correo || !password || !id_rol) {
      return res.status(400).json({ message: "Todos los campos son obligatorios" });
    }

    // Verificar si el CI o correo ya existen
    const [existe] = await db.query(
      "SELECT * FROM usuario WHERE ci = ? OR correo = ?",
      [ci, correo]
    );
    if (existe.length > 0) {
      return res.status(400).json({ message: "El CI o correo ya está registrado" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const query = `
      INSERT INTO usuario (nombre, apellido, ci, correo, password, id_rol)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    await db.query(query, [nombre, apellido, ci, correo, hashedPassword, id_rol]);

    res.status(201).json({ message: "Usuario creado correctamente" });
  } catch (error) {
    console.error("Error al registrar usuario:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};


export const getUsuarios = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT u.id_usuario, u.nombre, u.apellido, u.ci, u.correo, u.fecha_registro,
             r.nombre_rol, r.descripcion AS rol_descripcion
      FROM usuario u
      LEFT JOIN rol r ON u.id_rol = r.id_rol
    `);
    res.json(rows);
  } catch (error) {
    console.error("❌ Error al obtener usuarios:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};


// ✅ Obtener un usuario por ID
export const getUsuarioById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query(`
      SELECT u.*, r.nombre_rol
      FROM usuario u
      LEFT JOIN rol r ON u.id_rol = r.id_rol
      WHERE u.id_usuario = ?
    `, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error("❌ Error al obtener usuario:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

// ✅ Actualizar usuario
export const updateUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, apellido, ci, correo, password, id_rol } = req.body;

    let hashedPassword;
    let query;
    let params;

    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
      query = `
        UPDATE usuario
        SET nombre = ?, apellido = ?, ci = ?, correo = ?, password = ?, id_rol = ?
        WHERE id_usuario = ?
      `;
      params = [nombre, apellido, ci, correo, hashedPassword, id_rol, id];
    } else {
      query = `
        UPDATE usuario
        SET nombre = ?, apellido = ?, ci = ?, correo = ?, id_rol = ?
        WHERE id_usuario = ?
      `;
      params = [nombre, apellido, ci, correo, id_rol, id];
    }

    await db.query(query, params);

    res.json({ message: "Usuario actualizado correctamente" });
  } catch (error) {
    console.error("❌ Error al actualizar usuario:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};


// ✅ Eliminar usuario
export const deleteUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query("DELETE FROM usuario WHERE id_usuario = ?", [id]);
    res.json({ message: "Usuario eliminado correctamente" });
  } catch (error) {
    console.error("❌ Error al eliminar usuario:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};