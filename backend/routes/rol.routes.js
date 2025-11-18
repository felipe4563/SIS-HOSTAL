import { Router } from 'express';
import { initAbility } from '../middlewares/initAbility.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { checkAbility } from '../middlewares/checkAbility.js';
import { crearRol, listarRoles, obtenerRol, actualizarRol, eliminarRol, asignarPermisos } from '../controllers/rol.controller.js';

const router = Router();

// CRUD roles
router.post('/', authMiddleware, initAbility, checkAbility('create', 'Rol'), crearRol);
router.get('/', authMiddleware, initAbility, checkAbility('read', 'Rol'), listarRoles);
router.get('/:id', authMiddleware, initAbility, checkAbility('read', 'Rol'), obtenerRol);
router.put('/:id', authMiddleware, initAbility, checkAbility('update', 'Rol'), actualizarRol);
router.delete('/:id', authMiddleware, initAbility, checkAbility('delete', 'Rol'), eliminarRol);

// Asignar permisos
router.post('/:id/permisos', authMiddleware, initAbility, checkAbility('update', 'Rol'), asignarPermisos);

export default router;
