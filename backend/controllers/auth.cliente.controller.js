import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import db from '../config/db.js';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Login/Registro de CLIENTE con Google (para el Home público)
export const loginGoogleCliente = async (req, res) => {
  const { token } = req.body;

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const { email, given_name, family_name } = ticket.getPayload();

    // Buscar si existe el cliente
    const [rows] = await db.query(
      'SELECT * FROM cliente WHERE correo = ?',
      [email]
    );

    let cliente;

    if (rows.length === 0) {
      // Crear nuevo CLIENTE
      const [result] = await db.query(
        `INSERT INTO cliente 
        (nombre, apellido, ci, correo, celular, direccion, estado)
        VALUES (?, ?, ?, ?, ?, ?, 1)`,
        [
          given_name, 
          family_name || '', 
          null, // CI se puede agregar después
          email, 
          null, // Celular se puede agregar después
          null, // Dirección se puede agregar después
          1
        ]
      );

      cliente = {
        id_cliente: result.insertId,
        nombre: given_name,
        apellido: family_name || '',
        correo: email,
        ci: null,
        celular: null,
        direccion: null
      };
    } else {
      cliente = rows[0];
    }

    // Verificar si está activo
    if (cliente.estado === 0) {
      return res.status(403).json({ message: 'Cliente desactivado' });
    }

    // Crear token JWT para el cliente
    const tokenJWT = jwt.sign(
      {
        id_cliente: cliente.id_cliente,
        tipo: 'cliente', // Para diferenciar de usuarios del sistema
        correo: cliente.correo
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token: tokenJWT,
      cliente: {
        id_cliente: cliente.id_cliente,
        nombre: cliente.nombre,
        apellido: cliente.apellido,
        correo: cliente.correo,
        ci: cliente.ci,
        celular: cliente.celular,
        direccion: cliente.direccion,
        tipo: 'cliente'
      }
    });

  } catch (err) {
    console.error(err);
    res.status(401).json({ message: 'Token Google inválido' });
  }
};

// Login CLIENTE con credenciales (CI + contraseña) - OPCIONAL
export const loginCliente = async (req, res) => {
  const { ci, password } = req.body;

  try {
    const [rows] = await db.query(
      'SELECT * FROM cliente WHERE ci = ?',
      [ci]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }

    const cliente = rows[0];

    if (cliente.estado === 0) {
      return res.status(403).json({ message: 'Cliente desactivado' });
    }

    // Aquí podrías verificar una contraseña si la tabla cliente tuviera ese campo
    // Por ahora, solo validamos que exista

    const token = jwt.sign(
      {
        id_cliente: cliente.id_cliente,
        tipo: 'cliente',
        correo: cliente.correo
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      cliente: {
        id_cliente: cliente.id_cliente,
        nombre: cliente.nombre,
        apellido: cliente.apellido,
        correo: cliente.correo,
        ci: cliente.ci,
        celular: cliente.celular,
        direccion: cliente.direccion,
        tipo: 'cliente'
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};