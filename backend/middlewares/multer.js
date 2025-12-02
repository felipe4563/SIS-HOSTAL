import multer from "multer";
import path from "path";
import fs from "fs";

// Crear carpeta específica para habitaciones
const habitacionesDir = "uploads/habitaciones";

if (!fs.existsSync(habitacionesDir)) {
  fs.mkdirSync(habitacionesDir, { recursive: true });
  console.log(`📁 Carpeta '${habitacionesDir}' creada automáticamente`);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, habitacionesDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) return cb(null, true);
  cb(new Error("Solo se permiten imágenes (JPEG, JPG, PNG, GIF, WEBP)"));
};

export const upload = multer({ 
  storage, 
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB límite
});