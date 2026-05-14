import db from '../config/db.js';
import bcrypt from 'bcrypt';
import { defineAbilitiesFor } from '../config/abilities.js';

/**
 * Crear usuario
 */
export const crearUsuario = async (req, res) => {
  const { nombre, apellido, ci, correo, password, id_rol, estado = 1 } = req.body;

  try {
    // Validar unicidad de CI y Correo
    const [existing] = await db.query(
      `SELECT ci, correo FROM usuario WHERE ci = ? OR correo = ?`,
      [ci, correo]
    );

    if (existing.length > 0) {
      if (existing.some(u => u.ci === ci)) {
        return res.status(400).json({ message: 'El CI ingresado ya está registrado en el sistema' });
      }
      if (existing.some(u => u.correo === correo)) {
        return res.status(400).json({ message: 'El correo generado ya está registrado, intente agregar una variante' });
      }
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await db.query(
      `INSERT INTO usuario (nombre, apellido, ci, correo, password, id_rol, estado) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [nombre, apellido, ci, correo, hashedPassword, id_rol, estado]
    );

    res.status(201).json({ message: 'Usuario creado', id_usuario: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al crear usuario' });
  }
};

/**
 * Listar todos los usuarios
 */
export const listarUsuarios = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT u.id_usuario, u.nombre, u.apellido, u.ci, u.correo, u.id_rol, u.estado, r.nombre_rol
      FROM usuario u
      LEFT JOIN rol r ON u.id_rol = r.id_rol
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al obtener usuarios' });
  }
};

/**
 * Obtener usuario por ID
 */
export const obtenerUsuario = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.query(`SELECT * FROM usuario WHERE id_usuario = ?`, [id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Usuario no encontrado' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al obtener usuario' });
  }
};

/**
 * Actualizar usuario
 */
export const actualizarUsuario = async (req, res) => {
  const { id } = req.params;
  const { nombre, apellido, ci, correo, password, id_rol } = req.body;

  try {
    // Validar unicidad de CI y Correo, excluyendo al usuario actual
    const [existing] = await db.query(
      `SELECT ci, correo FROM usuario WHERE (ci = ? OR correo = ?) AND id_usuario != ?`,
      [ci, correo, id]
    );

    if (existing.length > 0) {
      if (existing.some(u => u.ci === ci)) {
        return res.status(400).json({ message: 'El CI ingresado ya está registrado por otro usuario' });
      }
      if (existing.some(u => u.correo === correo)) {
        return res.status(400).json({ message: 'El correo generado ya está registrado por otro usuario' });
      }
    }
    let query = 'UPDATE usuario SET nombre = ?, apellido = ?, ci = ?, correo = ?, id_rol = ?';
    const params = [nombre, apellido, ci, correo, id_rol];

    // Solo actualizar contraseña si se envió
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      query += ', password = ?';
      params.push(hashedPassword);
    }

    query += ' WHERE id_usuario = ?';
    params.push(id);

    await db.query(query, params);

    res.json({ message: 'Usuario actualizado' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al actualizar usuario' });
  }
};


/**
 * Desactivar usuario
 */
// controllers/user.controller.js
export const toggleEstadoUsuario = async (req, res) => {
  const { id } = req.params;
  try {
    // Obtiene el usuario
    const [rows] = await db.query('SELECT estado FROM usuario WHERE id_usuario = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Usuario no encontrado' });

    const nuevoEstado = rows[0].estado === 1 ? 0 : 1; // alterna entre activo y desactivado
    await db.query('UPDATE usuario SET estado = ? WHERE id_usuario = ?', [nuevoEstado, id]);

    res.json({ message: `Usuario ${nuevoEstado === 1 ? 'activado' : 'desactivado'}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al actualizar estado del usuario' });
  }
};

