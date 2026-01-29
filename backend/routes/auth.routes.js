import express from 'express';
import { login } from '../controllers/auth.controller.js';
import { loginGoogleCliente, loginCliente } from '../controllers/auth.cliente.controller.js';
const router = express.Router();

router.post('/login', login);
router.post('/cliente/google', loginGoogleCliente);
router.post('/cliente/login', loginCliente);


export default router;
