import express from 'express';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { checkPermission } from '../middlewares/checkPermission.js';
import {
  listarHabitaciones,
  obtenerHabitacion,
  crearHabitacion,  // ✅ Asegúrate de importarla
  editarHabitacion,
  eliminarHabitacion,
  cambiarEstadoHabitacion
} from '../controllers/habitacion.controller.js';

const router = express.Router();

router.get('/', authMiddleware, checkPermission('ver_habitaciones'), listarHabitaciones);
router.get('/:id', authMiddleware, checkPermission('ver_habitaciones'), obtenerHabitacion);
router.post('/', authMiddleware, checkPermission('crear_habitaciones'), crearHabitacion); // ✅ Ruta para CREAR
router.put('/:id', authMiddleware, checkPermission('editar_habitaciones'), editarHabitacion);
router.delete('/:id', authMiddleware, checkPermission('eliminar_habitaciones'), eliminarHabitacion);
router.patch('/:id/estado', authMiddleware, checkPermission('editar_habitaciones'), cambiarEstadoHabitacion);

export default router;
