import express from 'express';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { initAbility } from '../middlewares/initAbility.js';
import { checkAbility } from '../middlewares/checkAbility.js';
import {
  crearReserva,
  obtenerMisReservas,
  cancelarReserva,
  obtenerTodasReservas,
  actualizarEstadoReserva,
  eliminarReserva, 
  crearReservaMultiple,
  actualizarReserva,
  checkInReserva,
  checkOutReserva
} from '../controllers/reserva.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import { crearReservaSchema, crearReservaMultipleSchema, actualizarReservaSchema } from '../schemas/reserva.schema.js';

const router = express.Router();

// Crear reserva (requiere autenticación)
router.post('/', authMiddleware, validate(crearReservaSchema), crearReserva);

router.post('/multiple', authMiddleware, validate(crearReservaMultipleSchema), crearReservaMultiple);

// Obtener mis reservas
router.get('/mis-reservas', authMiddleware, obtenerMisReservas);

// Cancelar reserva
router.patch('/:id/cancelar', authMiddleware, cancelarReserva);


// Obtener TODAS las reservas (admin)
router.get('/', authMiddleware, initAbility, checkAbility('read', 'Reserva'), obtenerTodasReservas);

// Actualizar estado de reserva (admin)
router.patch('/:id/estado', authMiddleware, initAbility, checkAbility('update', 'Reserva'), actualizarEstadoReserva);

// Actualizar datos de reserva (admin)
router.put('/:id', authMiddleware, initAbility, checkAbility('update', 'Reserva'), validate(actualizarReservaSchema), actualizarReserva);

// Check-in / Check-out (admin)
router.post('/:id/checkin', authMiddleware, initAbility, checkAbility('update', 'Reserva'), checkInReserva);
router.post('/:id/checkout', authMiddleware, initAbility, checkAbility('update', 'Reserva'), checkOutReserva);

// Eliminar reserva (admin)
router.delete('/:id', authMiddleware, initAbility, checkAbility('delete', 'Reserva'), eliminarReserva);

export default router;