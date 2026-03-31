import express from 'express';
import { iniciarPago, webhookRedEnlace, verificarEstadoPago } from '../controllers/pago.controller.js'; // ← SIN PUNTO
import { authMiddleware } from '../middlewares/authMiddleware.js'; // ← SIN "S" EN middleware

const router = express.Router();

// Iniciar proceso de pago (requiere autenticación)
router.post('/iniciar', authMiddleware, iniciarPago);

// Webhook para recibir confirmaciones de Red Enlace (SIN autenticación - importante!)
router.post('/webhook-red-enlace', webhookRedEnlace);

// Verificar estado del pago
router.get('/estado/:id_reserva', verificarEstadoPago);

export default router;