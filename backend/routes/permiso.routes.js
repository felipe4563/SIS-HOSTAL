import express from 'express';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { initAbility } from '../middlewares/initAbility.js';
import { checkAbility } from '../middlewares/checkAbility.js';
import {
  crearPermiso,
  obtenerPermisos,
  obtenerPermisoPorId,
  actualizarPermiso,
  eliminarPermiso
} from '../controllers/permiso.controller.js';

const router = express.Router();

router.post('/', authMiddleware, initAbility, checkAbility('update', 'Rol'), crearPermiso);
router.get('/', authMiddleware, initAbility, checkAbility('read', 'Rol'), obtenerPermisos);
router.get('/:id', authMiddleware, initAbility, checkAbility('read', 'Rol'), obtenerPermisoPorId);
router.put('/:id', authMiddleware, initAbility, checkAbility('update', 'Rol'), actualizarPermiso);
router.delete('/:id', authMiddleware, initAbility, checkAbility('update', 'Rol'), eliminarPermiso);

export default router;