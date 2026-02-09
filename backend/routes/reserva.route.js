import express from 'express';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import {
  crearReserva,
  obtenerMisReservas,
  cancelarReserva,
  obtenerTodasReservas,
  actualizarEstadoReserva,
  eliminarReserva, 
  crearReservaMultiple
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
router.get('/', authMiddleware, obtenerTodasReservas);

// Actualizar estado de reserva (admin)
router.patch('/:id/estado', authMiddleware, actualizarEstadoReserva);

// Eliminar reserva (admin)
router.delete('/:id', authMiddleware, eliminarReserva);

export default router;