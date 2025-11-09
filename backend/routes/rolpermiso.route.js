import express from "express";
import {
  obtenerPermisosPorRol,
  asignarPermisosARol,
} from "../controllers/rolpermiso.controller.js";

const router = express.Router();

// Obtener permisos de un rol
router.get("/:idRol", obtenerPermisosPorRol);

// Asignar permisos a un rol
router.post("/:idRol", asignarPermisosARol);

export default router;
