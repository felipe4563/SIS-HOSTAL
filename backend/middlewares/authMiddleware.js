import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

export const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Token no proporcionado' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 👇 CAMBIO IMPORTANTE: Guardar en req.usuario (no req.user)
    // Y manejar tanto clientes como usuarios del sistema
    req.usuario = decoded; // Contiene id_cliente O id_usuario
    req.user = decoded; // Por compatibilidad con código existente
    
    next();
  } catch (err) {
    console.error('Error en authMiddleware:', err);
    return res.status(401).json({ message: 'Token inválido o expirado' });
  }
};