# Diseño: Captura de Imágenes 360° desde el Sistema

## Resumen

Módulo integrado en el panel de administración (Imagenes360Manager) que permite al personal del hostal capturar fotos panorámicas con el celular, unirlas automáticamente en una imagen equirectangular y subirla directamente al sistema sin apps externas.

## Herramientas

| Capa | Herramienta | Rol |
|---|---|---|
| Frontend | MediaDevices API | Acceso a la cámara del celular |
| Frontend | DeviceOrientation API | Giroscopio para guiar ángulos |
| Frontend | Canvas API | Capturar fotogramas del video |
| Frontend | React | UI del asistente de captura |
| Backend Node | multer | Recibir las fotos del celular |
| Backend Node | child_process | Llamar al script Python |
| Python | opencv-python | Stitching de fotos en panorama |
| Python | numpy | Manipulación de arrays |
| Python | Pillow | Ajuste a proporción 2:1 equirectangular |

## Arquitectura

```
[Celular - Navegador]
  └─ CapturaAsistente360.jsx        ← nuevo componente modal
       ├─ Abre cámara (getUserMedia)
       ├─ Lee giroscopio (DeviceOrientation)
       ├─ Muestra guía visual de ángulos a cubrir
       ├─ Auto-captura foto cuando el ángulo es nuevo
       └─ Envía ~20 fotos a /api/habitaciones/:id/capturar-360

[Backend - Node.js]
  └─ POST /api/habitaciones/:id/capturar-360
       ├─ multer recibe las fotos (campo: "fotos[]")
       ├─ Las guarda en uploads/temp/<uuid>/
       ├─ Llama: python scripts/stitch360.py <carpeta_temp> <ruta_salida>
       └─ Registra imagen resultante en BD (tabla habitacion_imagen)

[Python]
  └─ scripts/stitch360.py
       ├─ Lee imágenes de la carpeta temp
       ├─ cv2.Stitcher_create().stitch(imagenes)
       ├─ Redimensiona a proporción 2:1 con Pillow
       └─ Guarda en uploads/habitaciones/360/<uuid>.jpg
```

## Flujo de usuario

1. Personal abre Imagenes360Manager → presiona "Capturar con cámara"
2. Se abre CapturaAsistente360 (modal fullscreen, optimizado para móvil)
3. La pantalla muestra una esfera/grilla con zonas a cubrir
4. El celular detecta el ángulo automáticamente con el giroscopio
5. Cuando apunta a una zona nueva → captura automática (flash visual)
6. Al completar ~20 fotos (o manualmente "Listo") → envía al backend
7. Backend procesa con Python → devuelve la imagen resultante
8. La imagen aparece en la lista de Imagenes360Manager lista para usar

## Archivos a crear / modificar

### Nuevos
- `frontend/src/pages/habitacion/CapturaAsistente360.jsx` — asistente de captura
- `backend/scripts/stitch360.py` — script Python de stitching
- `backend/routes/habitacion.routes.js` — agregar ruta POST capturar-360
- `backend/controllers/habitacion.controller.js` — agregar controlador

### Modificados
- `frontend/src/pages/habitacion/Imagenes360Manager.jsx` — botón "Capturar"
- `frontend/src/services/habitacion.js` — función capturaFotos360()

## Casos límite

- Menos de 4 fotos: rechazar, pedir más cobertura
- OpenCV no puede unir: devolver error claro al usuario
- Navegador sin giroscopio (desktop): mostrar modo manual (captura por botón)
- Permisos de cámara denegados: mensaje de instrucciones
- Timeout Python >30s: cancelar y limpiar archivos temp

## Instalación requerida (Python)

```bash
pip install opencv-python numpy Pillow
```
