import express from 'express';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { 
  obtenerClientes,
  obtenerClientePorId,
  actualizarCliente,
  eliminarCliente
} from '../controllers/cliente.controller.js';

const router = express.Router();

// ========================================
// RUTAS PARA ADMINISTRADORES
// ========================================

// Obtener todos los clientes (admin)
router.get('/', authMiddleware, obtenerClientes);

// Obtener cliente por ID (admin)
router.get('/:id', authMiddleware, obtenerClientePorId);

// Eliminar cliente (admin)
router.delete('/:id', authMiddleware, eliminarCliente);

// ========================================
// RUTAS COMPARTIDAS (Admin y Cliente)
// ========================================

// Actualizar cliente
// - Si es cliente: solo puede actualizar su propio perfil
// - Si es admin: puede actualizar cualquier cliente
router.put('/:id', authMiddleware, actualizarCliente);

export default router;