import express from 'express';
import {
  crearRol,
  obtenerRoles,
  obtenerRolPorId,
  actualizarRol,
  eliminarRol
} from '../controllers/rol.controller.js';

const router = express.Router();

router.post('/', crearRol);
router.get('/', obtenerRoles);
router.get('/:id', obtenerRolPorId);
router.put('/:id', actualizarRol);
router.delete('/:id', eliminarRol);

export default router;
