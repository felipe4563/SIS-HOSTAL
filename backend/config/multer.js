import multer from 'multer';
import path from 'path';
import fs from 'fs';

// ============================
// CONFIGURACIÓN PARA IMÁGENES NORMALES
// ============================
const storageNormal = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = 'uploads/habitaciones';
    
    // Crear carpeta si no existe
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `habitacion-${uniqueSuffix}${ext}`);
  }
});

// ============================
// CONFIGURACIÓN PARA IMÁGENES 360°
// ============================
const storage360 = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = 'uploads/habitaciones/360';
    
    // Crear carpeta si no existe
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `360-${uniqueSuffix}${ext}`);
  }
});

// ============================
// FILTRO DE ARCHIVOS (solo imágenes)
// ============================
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten imágenes (jpeg, jpg, png, gif, webp)'), false);
  }
};

// ============================
// EXPORTAR MULTER CONFIGURADOS
// ============================

// Para imágenes normales de habitaciones
export const upload = multer({
  storage: storageNormal,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB máximo
  }
});

// Para imágenes 360°
export const upload360 = multer({
  storage: storage360,
  fileFilter: fileFilter,
  limits: {
    fileSize: 20 * 1024 * 1024 // 20MB máximo para imágenes 360° (son más pesadas)
  }
});

// ============================
// CONFIGURACIÓN PARA FOTOS TEMPORALES (captura 360°)
// ============================
const storageTemp = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!req.tempFolderPath) {
      req.tempFolderPath = `uploads/temp/${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    }
    if (!fs.existsSync(req.tempFolderPath)) {
      fs.mkdirSync(req.tempFolderPath, { recursive: true });
    }
    cb(null, req.tempFolderPath);
  },
  filename: (req, file, cb) => {
    const idx = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `foto-${idx}.jpg`);
  }
});

// Hasta 30 fotos, 8 MB cada una
export const uploadTemp = multer({
  storage: storageTemp,
  fileFilter: fileFilter,
  limits: { fileSize: 8 * 1024 * 1024, files: 30 }
});

// Middleware para manejar errores de multer
export const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ 
        message: 'El archivo es demasiado grande' 
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ 
        message: 'Demasiados archivos' 
      });
    }
    return res.status(400).json({ message: err.message });
  }
  
  if (err) {
    return res.status(400).json({ message: err.message });
  }
  
  next();
};