import express from 'express';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { initAbility } from '../middlewares/initAbility.js';
import { checkAbility } from '../middlewares/checkAbility.js';
import {
  listarTipos,
  obtenerTipo,
  crearTipo,
  editarTipo,
  eliminarTipo
} from '../controllers/tipo.controller.js';

const router = express.Router();

router.use(authMiddleware, initAbility);

router.get('/', checkAbility('read', 'Tipo'), listarTipos);
router.get('/:id', checkAbility('read', 'Tipo'), obtenerTipo);
router.post('/', checkAbility('create', 'Tipo'), crearTipo);
router.put('/:id', checkAbility('update', 'Tipo'), editarTipo);
router.delete('/:id', checkAbility('delete', 'Tipo'), eliminarTipo);

export default router;
