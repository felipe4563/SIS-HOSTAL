import express from 'express';
import { registerUser,
getUsuarios,
getUsuarioById,
updateUsuario,
deleteUsuario
 } from '../controllers/user.controller.js';

const router = express.Router();

router.post('/register', registerUser);
router.get("/", getUsuarios);
router.get("/:id", getUsuarioById);
router.put("/:id", updateUsuario);
router.delete("/:id", deleteUsuario);

export default router;
