import db from '../config/db.js';
import bcrypt from 'bcrypt';
import { defineAbilitiesFor } from '../config/abilities.js';

/**
 * Crear usuario
 */
export const crearUsuario = async (req, res) => {
  const { nombre, apellido, ci, correo, password, id_rol, estado = 1 } = req.body;

  try {
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
    const [rows] = await db.query(`SELECT * FROM usuario WHERE estado = 1`);
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
  const { nombre, apellido, ci, correo, password, id_rol, estado } = req.body;

  try {
    let query = 'UPDATE usuario SET nombre = ?, apellido = ?, ci = ?, correo = ?, id_rol = ?, estado = ?';
    const params = [nombre, apellido, ci, correo, id_rol, estado];

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
export const eliminarUsuario = async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('UPDATE usuario SET estado = 0 WHERE id_usuario = ?', [id]);
    res.json({ message: 'Usuario desactivado' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al desactivar usuario' });
  }
};
