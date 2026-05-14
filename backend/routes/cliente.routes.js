import express from 'express';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { initAbility } from '../middlewares/initAbility.js';
import { checkAbility } from '../middlewares/checkAbility.js';
import { 
  crearCliente,
  obtenerClientes,
  obtenerClientePorId,
  actualizarCliente,
  eliminarCliente
} from '../controllers/cliente.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import { crearClienteSchema, actualizarClienteSchema } from '../schemas/cliente.schema.js';

const router = express.Router();

// ========================================
// RUTAS PARA ADMINISTRADORES
// ========================================

// Obtener todos los clientes (admin)
router.get('/', authMiddleware, initAbility, checkAbility('read', 'Cliente'), obtenerClientes);

// Crear cliente (admin)
router.post('/', authMiddleware, initAbility, checkAbility('create', 'Cliente'), validate(crearClienteSchema), crearCliente);

// Obtener cliente por ID (admin)
router.get('/:id', authMiddleware, initAbility, checkAbility('read', 'Cliente'), obtenerClientePorId);

// Eliminar cliente (admin)
router.delete('/:id', authMiddleware, initAbility, checkAbility('delete', 'Cliente'), eliminarCliente);

// ========================================
// RUTAS COMPARTIDAS (Admin y Cliente)
// ========================================

// Actualizar cliente
// - Si es cliente: solo puede actualizar su propio perfil
// - Si es admin: puede actualizar cualquier cliente
router.put('/:id', authMiddleware, validate(actualizarClienteSchema), actualizarCliente);

export default router;