import express from 'express';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { initAbility } from '../middlewares/initAbility.js';
import { checkAbility } from '../middlewares/checkAbility.js';
import {
  listarHabitaciones,
  obtenerHabitacion,
  crearHabitacion,
  editarHabitacion,
  eliminarHabitacion,
  cambiarEstadoHabitacion
} from '../controllers/habitacion.controller.js';
import { upload } from '../middlewares/multer.js';

const router = express.Router();

// Listar habitaciones
router.get('/', authMiddleware, initAbility, checkAbility('read', 'Habitacion'), listarHabitaciones);

// Obtener habitación por id
router.get('/:id', authMiddleware, initAbility, checkAbility('read', 'Habitacion'), obtenerHabitacion);

// Crear habitación
router.post('/', authMiddleware, initAbility, checkAbility('create', 'Habitacion'), upload.array('imagenes', 5), crearHabitacion);

// Editar habitación
router.put('/:id', authMiddleware, initAbility, checkAbility('update', 'Habitacion'), upload.array('imagenes', 5),editarHabitacion);

// Eliminar habitación
router.delete('/:id', authMiddleware, initAbility, checkAbility('delete', 'Habitacion'), eliminarHabitacion);

// Cambiar estado de habitación
router.patch('/:id/estado', authMiddleware, initAbility, checkAbility('update', 'Habitacion'), cambiarEstadoHabitacion);

export default router;
