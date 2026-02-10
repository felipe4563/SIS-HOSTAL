import express from 'express';
import {
  getReportePorFechas,
  getHabitacionesMasReservadasPorFecha,
  getDiasConMasReservas,
  getEstadisticasPorEstado,
  getReporteIngresos,
  getOcupacionPromedio
} from '../controllers/reportes.controller.js';
import {authMiddleware} from '../middlewares/authMiddleware.js';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Rutas de reportes
router.get('/por-fechas', getReportePorFechas);
router.get('/habitaciones-mas-reservadas', getHabitacionesMasReservadasPorFecha);
router.get('/dias-con-mas-reservas', getDiasConMasReservas);
router.get('/estadisticas-por-estado', getEstadisticasPorEstado);
router.get('/ingresos', getReporteIngresos);
router.get('/ocupacion-promedio', getOcupacionPromedio);

export default router;