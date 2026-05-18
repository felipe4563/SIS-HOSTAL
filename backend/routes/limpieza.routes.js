import express from 'express';
import {
  listarPendientes,
  historial,
  crearTarea,
  iniciarLimpieza,
  completarLimpieza,
  stats,
} from '../controllers/limpieza.controller.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/stats',     stats);
router.get('/',          listarPendientes);
router.get('/historial', historial);
router.post('/',         crearTarea);
router.patch('/:id/iniciar',   iniciarLimpieza);
router.patch('/:id/completar', completarLimpieza);

export default router;
