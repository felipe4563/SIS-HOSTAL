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
  actualizarReserva
} from '../controllers/reserva.controller.js';

const router = express.Router();

// Crear reserva (requiere autenticación)
router.post('/', authMiddleware, crearReserva);

router.post('/multiple', authMiddleware, crearReservaMultiple);

// Obtener mis reservas
router.get('/mis-reservas', authMiddleware, obtenerMisReservas);

// Cancelar reserva
router.patch('/:id/cancelar', authMiddleware, cancelarReserva);


// Obtener TODAS las reservas (admin)
router.get('/', authMiddleware, initAbility, checkAbility('read', 'Reserva'), obtenerTodasReservas);

// Actualizar estado de reserva (admin)
router.patch('/:id/estado', authMiddleware, initAbility, checkAbility('update', 'Reserva'), actualizarEstadoReserva);

// Actualizar datos de reserva (admin)
router.put('/:id', authMiddleware, initAbility, checkAbility('update', 'Reserva'), actualizarReserva);

// Eliminar reserva (admin)
router.delete('/:id', authMiddleware, initAbility, checkAbility('delete', 'Reserva'), eliminarReserva);

export default router;