import express from 'express';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { checkPermission } from '../middlewares/checkPermission.js';
import {
  listarTipos,
  obtenerTipo,
  crearTipo,
  editarTipo,
  eliminarTipo
} from '../controllers/tipo.controller.js';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Rutas de tipos de habitación
router.get('/', checkPermission('ver_habitaciones'), listarTipos);
router.get('/:id', checkPermission('ver_habitaciones'), obtenerTipo);
router.post('/', checkPermission('crear_habitaciones'), crearTipo);
router.put('/:id', checkPermission('editar_habitaciones'), editarTipo);
router.delete('/:id', checkPermission('eliminar_habitaciones'), eliminarTipo);

export default router;