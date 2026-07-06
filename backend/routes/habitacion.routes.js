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
  subirImagenes360,
  listarImagenes360,
  eliminarImagen360,
  actualizarImagen360,
  capturarFotos360,
  getHabitacionesPublicas,
  getHabitacionDetalle,
  verificarDisponibilidad,
  getTiposHabitacion,
  obtenerFechasOcupadas
} from '../controllers/habitacion.controller.js';
import { upload, upload360, uploadTemp } from '../config/multer.js';

const router = express.Router();

// ============================
// ⚠️ RUTAS PÚBLICAS (SIN AUTENTICACIÓN) - DEBEN IR PRIMERO
// ============================

// Obtener habitaciones públicas (para el home)
router.get('/publicas', getHabitacionesPublicas);

// Obtener tipos de habitación (público)
router.get('/tipos', getTiposHabitacion);

// Verificar disponibilidad (público)
router.get('/disponibilidad', verificarDisponibilidad);

// Fechas ocupadas por habitación (público)
router.get('/:id/fechas-ocupadas', obtenerFechasOcupadas);

// Obtener detalle público de habitación
router.get('/publicas/:id', getHabitacionDetalle);

// ============================
// 🔒 RUTAS PROTEGIDAS (CON AUTENTICACIÓN)
// ============================

// Listar todas las habitaciones (admin/recepcionista)
router.get('/', 
  authMiddleware, 
  initAbility, 
  checkAbility('read', 'Habitacion'), 
  listarHabitaciones
);

// Obtener habitación por id (admin/recepcionista)
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

// Capturar fotos con cámara y crear imagen 360° automáticamente
router.post('/:id/capturar-360',
  authMiddleware,
  initAbility,
  checkAbility('update', 'Habitacion'),
  uploadTemp.array('fotos[]', 30),
  capturarFotos360
);

export default router;