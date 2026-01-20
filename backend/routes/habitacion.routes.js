import express from 'express';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { initAbility } from '../middlewares/initAbility.js';
import { checkAbility } from '../middlewares/checkAbility.js';
import {
  listarHabitaciones,
  obtenerHabitacion,
  crearHabitacion,
  editarHabitacion,
  eliminarHabitacion,
  cambiarEstadoHabitacion,
  // Nuevas funciones para imágenes 360°
  subirImagenes360,
  listarImagenes360,
  eliminarImagen360,
  actualizarImagen360
} from '../controllers/habitacion.controller.js';
import { upload, upload360 } from '../middlewares/multer.js';

const router = express.Router();

// ============================
// RUTAS DE HABITACIONES
// ============================

// Listar todas las habitaciones
router.get('/', 
  authMiddleware, 
  initAbility, 
  checkAbility('read', 'Habitacion'), 
  listarHabitaciones
);

// Obtener habitación por id
router.get('/:id', 
  authMiddleware, 
  initAbility, 
  checkAbility('read', 'Habitacion'), 
  obtenerHabitacion
);

// Crear habitación
router.post('/', 
  authMiddleware, 
  initAbility, 
  checkAbility('create', 'Habitacion'), 
  upload.array('imagenes', 5), 
  crearHabitacion
);

// Editar habitación
router.put('/:id', 
  authMiddleware, 
  initAbility, 
  checkAbility('update', 'Habitacion'), 
  upload.array('imagenes', 5), 
  editarHabitacion
);

// Eliminar habitación
router.delete('/:id', 
  authMiddleware, 
  initAbility, 
  checkAbility('delete', 'Habitacion'), 
  eliminarHabitacion
);

// Cambiar estado de habitación
router.patch('/:id/estado', 
  authMiddleware, 
  initAbility, 
  checkAbility('update', 'Habitacion'), 
  cambiarEstadoHabitacion
);

// ============================
// RUTAS DE IMÁGENES 360°
// ============================

// Listar imágenes 360° de una habitación
router.get('/:id/imagenes-360', 
  authMiddleware, 
  initAbility, 
  checkAbility('read', 'Habitacion'), 
  listarImagenes360
);

// Subir imagen 360°
router.post('/:id/imagenes-360', 
  authMiddleware, 
  initAbility, 
  checkAbility('update', 'Habitacion'), 
  upload360.single('imagen360'), 
  subirImagenes360
);

// Actualizar imagen 360° (título, descripción, orden)
router.put('/:id/imagenes-360/:idImagen', 
  authMiddleware, 
  initAbility, 
  checkAbility('update', 'Habitacion'), 
  actualizarImagen360
);

// Eliminar imagen 360°
router.delete('/:id/imagenes-360/:idImagen', 
  authMiddleware, 
  initAbility, 
  checkAbility('delete', 'Habitacion'), 
  eliminarImagen360
);

export default router;