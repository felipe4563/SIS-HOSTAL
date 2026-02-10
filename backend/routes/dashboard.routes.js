import express from 'express';
import {
  getEstadisticasGenerales,
  getReservasPorEstado,
  getReservasPorPeriodo,
  getHabitacionesMasReservadas,
  getMetodosPago,
  getOcupacionPorTemporada,
  getClientesFrecuentes,
  getEstadoHabitaciones,
  getIngresosPorPeriodo
} from '../controllers/dashboard.controller.js';
import {authMiddleware} from '../middlewares/authMiddleware.js';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Rutas del dashboard con soporte de filtros ?periodo=mes|semana|año
router.get('/estadisticas-generales', getEstadisticasGenerales);
router.get('/reservas-por-estado', getReservasPorEstado);
router.get('/reservas-por-periodo', getReservasPorPeriodo); // 👈 Nuevo
router.get('/habitaciones-mas-reservadas', getHabitacionesMasReservadas);
router.get('/metodos-pago', getMetodosPago);
router.get('/ocupacion-por-temporada', getOcupacionPorTemporada);
router.get('/clientes-frecuentes', getClientesFrecuentes);
router.get('/estado-habitaciones', getEstadoHabitaciones);
router.get('/ingresos-por-periodo', getIngresosPorPeriodo); // 👈 Nuevo

export default router;