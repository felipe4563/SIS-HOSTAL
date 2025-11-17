import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { checkAbility } from '../middlewares/checkAbility.js';
import { crearRol, listarRoles, obtenerRol, actualizarRol, eliminarRol, asignarPermisos } from '../controllers/rol.controller.js';

const router = Router();

// CRUD roles
router.post('/', authMiddleware, checkAbility('create', 'Rol'), crearRol);
router.get('/', authMiddleware, checkAbility('read', 'Rol'), listarRoles);
router.get('/:id', authMiddleware, checkAbility('read', 'Rol'), obtenerRol);
router.put('/:id', authMiddleware, checkAbility('update', 'Rol'), actualizarRol);
router.delete('/:id', authMiddleware, checkAbility('delete', 'Rol'), eliminarRol);

// Asignar permisos
router.post('/:id/permisos', authMiddleware, checkAbility('update', 'Rol'), asignarPermisos);

export default router;
