import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { initAbility } from '../middlewares/initAbility.js';
import { checkAbility } from '../middlewares/checkAbility.js';
import { crearUsuario, listarUsuarios, obtenerUsuario, actualizarUsuario, toggleEstadoUsuario } from '../controllers/user.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import { crearUsuarioSchema, actualizarUsuarioSchema } from '../schemas/user.schema.js';

const router = Router();

// Crear usuario
router.post('/', authMiddleware, initAbility, checkAbility('create', 'Usuario'), validate(crearUsuarioSchema), crearUsuario);

// Listar usuarios
router.get('/', authMiddleware, initAbility, checkAbility('read', 'Usuario'), listarUsuarios);

// Obtener usuario por id
router.get('/:id', authMiddleware, initAbility, checkAbility('read', 'Usuario'), obtenerUsuario);

// Actualizar usuario
router.put('/:id', authMiddleware, initAbility, checkAbility('update', 'Usuario'), validate(actualizarUsuarioSchema), actualizarUsuario);

// Desactivar usuario
router.patch('/:id/estado', authMiddleware, initAbility, checkAbility('delete', 'Usuario'), toggleEstadoUsuario);

export default router;
