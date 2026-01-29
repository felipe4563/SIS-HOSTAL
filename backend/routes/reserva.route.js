import express from 'express';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import {
  crearReserva,
  obtenerMisReservas,
  cancelarReserva
} from '../controllers/reserva.controller.js';

const router = express.Router();

// Crear reserva (requiere autenticación)
router.post('/', authMiddleware, crearReserva);

// Obtener mis reservas
router.get('/mis-reservas', authMiddleware, obtenerMisReservas);

// Cancelar reserva
router.patch('/:id/cancelar', authMiddleware, cancelarReserva);

export default router;