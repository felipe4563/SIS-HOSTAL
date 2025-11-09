import express from 'express';
import {
  crearPermiso,
  obtenerPermisos,
  obtenerPermisoPorId,
  actualizarPermiso,
  eliminarPermiso
} from '../controllers/permiso.controller.js';

const router = express.Router();

router.post('/', crearPermiso);
router.get('/', obtenerPermisos);
router.get('/:id', obtenerPermisoPorId);
router.put('/:id', actualizarPermiso);
router.delete('/:id', eliminarPermiso);

export default router;