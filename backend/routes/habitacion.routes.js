import express from 'express';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { checkPermission } from '../middlewares/checkPermission.js';
import {
  listarHabitaciones,
  crearHabitacion,
  editarHabitacion
} from '../controllers/habitacion.controller.js';

const router = express.Router();

router.get('/', authMiddleware, checkPermission('ver_habitaciones'), listarHabitaciones);
router.post('/', authMiddleware, checkPermission('crear_habitacion'), crearHabitacion);
router.put('/:id', authMiddleware, checkPermission('editar_habitacion'), editarHabitacion);

export default router;
