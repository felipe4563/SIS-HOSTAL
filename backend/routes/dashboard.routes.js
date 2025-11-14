import express from 'express';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { checkPermission } from '../middlewares/checkPermission.js';
import {
  obtenerEstadisticas,
  obtenerGraficoReservas,
  obtenerAlertas
} from '../controllers/dashboard.controller.js';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Rutas del dashboard
router.get('/estadisticas', checkPermission('ver_dashboard'), obtenerEstadisticas);
router.get('/graficos', checkPermission('ver_dashboard'), obtenerGraficoReservas);
router.get('/alertas', checkPermission('ver_dashboard'), obtenerAlertas);

export default router;