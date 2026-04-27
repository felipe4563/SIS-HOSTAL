import db from '../config/db.js';
import path from 'path';
import fs from 'fs';

// Función auxiliar para extraer solo el nombre del archivo
function extraerNombreArchivo(rutaCompleta) {
  if (!rutaCompleta) return null;
  return rutaCompleta.split(/[/\\]/).pop();
}

// Función auxiliar para construir URL de imagen
function construirUrlImagen(nombreArchivo, tipo = 'normal') {
  if (!nombreArchivo) return null;
  const carpeta = tipo === '360' ? 'habitaciones/360' : 'habitaciones';
  return `${process.env.BACKEND_URL || 'http://localhost:4000'}/uploads/${carpeta}/${nombreArchivo}`;
}

// ============================
// LISTAR HABITACIONES
// ============================
export const listarHabitaciones = async (req, res) => {
  try {
    const [habitaciones] = await db.query(`
      SELECT 
        h.*,
        t.nombre AS tipo_habitacion,
        t.capacidad,
        t.precio_base
      FROM habitacion h
      INNER JOIN tipo t ON h.id_tipo = t.id_tipo
      ORDER BY h.piso, h.numero
    `);

    // Obtener imágenes para cada habitación
    for (let habitacion of habitaciones) {
      const [imagenes] = await db.query(
        `SELECT id_imagen, ruta, tipo_imagen, titulo, descripcion, orden, es_portada 
         FROM habitacion_imagen 
         WHERE id_habitacion = ? 
         ORDER BY es_portada DESC, orden ASC`,
        [habitacion.id_habitacion]
      );

      // Separar imágenes normales y 360°
      habitacion.imagenes = imagenes
        .filter(img => img.tipo_imagen === 'normal')
        .map(img => ({
          id_imagen: img.id_imagen,
          url: construirUrlImagen(extraerNombreArchivo(img.ruta), 'normal'),
          es_portada: img.es_portada
        }));

      habitacion.imagenes_360 = imagenes
        .filter(img => img.tipo_imagen === '360')
        .map(img => ({
          id_imagen: img.id_imagen,
          url: construirUrlImagen(extraerNombreArchivo(img.ruta), '360'),
          titulo: img.titulo,
          descripcion: img.descripcion,
          orden: img.orden
        }));

      // Imagen de portada para mostrar en listado
      const portada = imagenes.find(img => img.es_portada === 1 && img.tipo_imagen === 'normal');
      habitacion.imagen_portada = portada 
        ? construirUrlImagen(extraerNombreArchivo(portada.ruta), 'normal')
        : (habitacion.imagenes[0]?.url || null);
    }

    res.json(habitaciones);
  } catch (error) {
    console.error("Error al obtener habitaciones:", error);
    res.status(500).json({ message: "Error al obtener habitaciones" });
  }
};

// ============================
// OBTENER HABITACIÓN POR ID
// ============================
export const obtenerHabitacion = async (req, res) => {
  const { id } = req.params;

  try {
    const [habitacion] = await db.query(`
      SELECT 
        h.*,
        t.nombre AS tipo_habitacion,
        t.capacidad,
        t.precio_base
      FROM habitacion h
      INNER JOIN tipo t ON h.id_tipo = t.id_tipo
      WHERE h.id_habitacion = ?
    `, [id]);

    if (habitacion.length === 0) {
      return res.status(404).json({ message: 'Habitación no encontrada' });
    }

    // Obtener todas las imágenes
    const [imagenes] = await db.query(
      `SELECT id_imagen, ruta, tipo_imagen, titulo, descripcion, orden, es_portada 
       FROM habitacion_imagen 
       WHERE id_habitacion = ?
       ORDER BY tipo_imagen, orden ASC`,
      [id]
    );

    // Construir respuesta
    const habitacionCompleta = {
      ...habitacion[0],
      imagenes: imagenes
        .filter(img => img.tipo_imagen === 'normal')
        .map(img => ({
          id_imagen: img.id_imagen,
          url: construirUrlImagen(extraerNombreArchivo(img.ruta), 'normal'),
          es_portada: img.es_portada
        })),
      imagenes_360: imagenes
        .filter(img => img.tipo_imagen === '360')
        .map(img => ({
          id_imagen: img.id_imagen,
          url: construirUrlImagen(extraerNombreArchivo(img.ruta), '360'),
          titulo: img.titulo,
          descripcion: img.descripcion,
          orden: img.orden
        }))
    };

    res.json(habitacionCompleta);
  } catch (error) {
    console.error("Error al obtener habitación:", error);
    res.status(500).json({ message: "Error al obtener habitación" });
  }
};

// ============================
// CREAR HABITACIÓN
// ============================
export const crearHabitacion = async (req, res) => {
  const { numero, id_tipo, precio_total, piso, estado, descripcion } = req.body;
  const files = req.files;

  if (!numero || !id_tipo || !precio_total) {
    return res.status(400).json({ message: 'Número, tipo y precio total son obligatorios' });
  }

  try {
    // Verificar si el número ya existe
    const [existe] = await db.query(
      'SELECT id_habitacion FROM habitacion WHERE numero = ?',
      [numero]
    );

    if (existe.length > 0) {
      return res.status(400).json({ message: 'El número de habitación ya existe' });
    }

    // Insertar habitación
    const [result] = await db.query(
      `INSERT INTO habitacion (numero, id_tipo, precio_total, piso, estado, descripcion)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [numero, id_tipo, precio_total, piso, estado || 'disponible', descripcion]
    );

    const habitacionId = result.insertId;

    // Guardar imágenes normales
    if (files && files.length > 0) {
      const insertImages = files.map((file, index) => [
        habitacionId,
        file.filename,
        'normal',           // tipo_imagen
        null,               // titulo
        null,               // descripcion
        index,              // orden
        index === 0 ? 1 : 0 // Primera imagen como portada
      ]);

      await db.query(
        `INSERT INTO habitacion_imagen 
         (id_habitacion, ruta, tipo_imagen, titulo, descripcion, orden, es_portada) 
         VALUES ?`,
        [insertImages]
      );
    }

    res.status(201).json({
      message: 'Habitación creada exitosamente',
      id: habitacionId
    });
  } catch (error) {
    console.error('Error al crear habitación:', error);
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({ message: 'El tipo de habitación no existe' });
    }
    res.status(500).json({ message: 'Error al crear habitación' });
  }
};

// ============================
// EDITAR HABITACIÓN
// ============================
export const editarHabitacion = async (req, res) => {
  const { id } = req.params;
  const { numero, id_tipo, precio_total, piso, estado, descripcion, imagenesExistentes } = req.body;
  const files = req.files;

  try {
    // Verificar si la habitación existe
    const [habitacion] = await db.query(
      'SELECT id_habitacion FROM habitacion WHERE id_habitacion = ?',
      [id]
    );
    if (habitacion.length === 0) {
      return res.status(404).json({ message: 'Habitación no encontrada' });
    }

    // Verificar número duplicado
    if (numero) {
      const [existe] = await db.query(
        'SELECT id_habitacion FROM habitacion WHERE numero = ? AND id_habitacion != ?',
        [numero, id]
      );
      if (existe.length > 0) {
        return res.status(400).json({ message: 'El número de habitación ya existe' });
      }
    }

    // Actualizar datos de la habitación
    await db.query(
      `UPDATE habitacion 
       SET numero=?, id_tipo=?, precio_total=?, piso=?, estado=?, descripcion=?
       WHERE id_habitacion=?`,
      [numero, id_tipo, precio_total, piso, estado, descripcion, id]
    );

    // ============================
    // MANEJO DE IMÁGENES NORMALES
    // ============================
    const [imgsActuales] = await db.query(
      "SELECT * FROM habitacion_imagen WHERE id_habitacion = ? AND tipo_imagen = 'normal'",
      [id]
    );

    let idsExistentes = [];
    if (imagenesExistentes) {
      try {
        idsExistentes = JSON.parse(imagenesExistentes).map(img => img.id_imagen);
      } catch (e) {
        console.error('Error al parsear imagenesExistentes:', e);
      }
    }

    // Eliminar imágenes que ya no están
    const imgsBorrar = imgsActuales.filter(img => !idsExistentes.includes(img.id_imagen));

    for (const img of imgsBorrar) {
      try {
        const filePath = path.join('uploads', 'habitaciones', extraerNombreArchivo(img.ruta));
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (e) {
        console.log("Error eliminando archivo:", e.message);
      }
    }

    if (imgsBorrar.length > 0) {
      await db.query(
        'DELETE FROM habitacion_imagen WHERE id_imagen IN (?)',
        [imgsBorrar.map(img => img.id_imagen)]
      );
    }

    // Guardar nuevas imágenes
    if (files && files.length > 0) {
      const [maxOrden] = await db.query(
        "SELECT COALESCE(MAX(orden), 0) as max_orden FROM habitacion_imagen WHERE id_habitacion = ? AND tipo_imagen = 'normal'",
        [id]
      );
      let orden = maxOrden[0].max_orden + 1;

      const insertImages = files.map((file) => [
        id,
        file.filename,
        'normal',
        null,
        null,
        orden++,
        0
      ]);

      await db.query(
        `INSERT INTO habitacion_imagen 
         (id_habitacion, ruta, tipo_imagen, titulo, descripcion, orden, es_portada) 
         VALUES ?`,
        [insertImages]
      );
    }

    res.json({ message: 'Habitación actualizada exitosamente' });

  } catch (error) {
    console.error('Error al editar habitación:', error);
    res.status(500).json({ message: 'Error al actualizar habitación' });
  }
};

// ============================
// ELIMINAR HABITACIÓN
// ============================
export const eliminarHabitacion = async (req, res) => {
  const { id } = req.params;

  try {
    const [habitacion] = await db.query(
      'SELECT id_habitacion, estado FROM habitacion WHERE id_habitacion = ?',
      [id]
    );

    if (habitacion.length === 0) {
      return res.status(404).json({ message: 'Habitación no encontrada' });
    }

    if (habitacion[0].estado === 'ocupada') {
      return res.status(400).json({
        message: 'No se puede eliminar una habitación ocupada'
      });
    }

    // Eliminar imágenes físicas
    const [imagenes] = await db.query(
      'SELECT ruta, tipo_imagen FROM habitacion_imagen WHERE id_habitacion = ?',
      [id]
    );

    for (const img of imagenes) {
      try {
        const carpeta = img.tipo_imagen === '360' ? 'habitaciones/360' : 'habitaciones';
        const filePath = path.join('uploads', carpeta, extraerNombreArchivo(img.ruta));
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (e) {
        console.log("Error eliminando archivo:", e.message);
      }
    }

    // Eliminar registros de imágenes
    await db.query('DELETE FROM habitacion_imagen WHERE id_habitacion = ?', [id]);

    // Eliminar habitación
    await db.query('DELETE FROM habitacion WHERE id_habitacion = ?', [id]);

    res.json({ message: 'Habitación eliminada exitosamente' });
  } catch (error) {
    console.error('Error al eliminar habitación:', error);
    res.status(500).json({ message: 'Error al eliminar habitación' });
  }
};

// ============================
// CAMBIAR ESTADO DE HABITACIÓN
// ============================
export const cambiarEstadoHabitacion = async (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;

  const estadosPermitidos = ['disponible', 'ocupada', 'limpieza'];

  if (!estadosPermitidos.includes(estado)) {
    return res.status(400).json({
      message: 'Estado no válido. Use: disponible, ocupada o limpieza'
    });
  }

  try {
    const [result] = await db.query(
      'UPDATE habitacion SET estado = ? WHERE id_habitacion = ?',
      [estado, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Habitación no encontrada' });
    }

    res.json({ message: `Estado cambiado a: ${estado}` });
  } catch (error) {
    console.error('Error al cambiar estado:', error);
    res.status(500).json({ message: 'Error al cambiar estado' });
  }
};

// ============================
// SUBIR IMÁGENES 360°
// ============================
export const subirImagenes360 = async (req, res) => {
  const { id } = req.params;
  const { titulo, descripcion, orden } = req.body;
  const file = req.file;

  if (!file) {
    return res.status(400).json({ message: 'No se proporcionó ninguna imagen' });
  }

  try {
    // Verificar que la habitación existe
    const [habitacion] = await db.query(
      'SELECT id_habitacion FROM habitacion WHERE id_habitacion = ?',
      [id]
    );

    if (habitacion.length === 0) {
      return res.status(404).json({ message: 'Habitación no encontrada' });
    }

    // Obtener el siguiente orden si no se proporciona
    let ordenFinal = orden;
    if (!orden) {
      const [maxOrden] = await db.query(
        "SELECT COALESCE(MAX(orden), 0) as max_orden FROM habitacion_imagen WHERE id_habitacion = ? AND tipo_imagen = '360'",
        [id]
      );
      ordenFinal = maxOrden[0].max_orden + 1;
    }

    // Insertar imagen 360°
    const [result] = await db.query(
      `INSERT INTO habitacion_imagen 
       (id_habitacion, ruta, tipo_imagen, titulo, descripcion, orden, es_portada) 
       VALUES (?, ?, '360', ?, ?, ?, 0)`,
      [id, file.filename, titulo || null, descripcion || null, ordenFinal]
    );

    res.status(201).json({
      message: 'Imagen 360° subida exitosamente',
      id_imagen: result.insertId,
      url: construirUrlImagen(file.filename, '360')
    });
  } catch (error) {
    console.error('Error al subir imagen 360°:', error);
    res.status(500).json({ message: 'Error al subir imagen 360°' });
  }
};

// ============================
// LISTAR IMÁGENES 360° DE UNA HABITACIÓN
// ============================
export const listarImagenes360 = async (req, res) => {
  const { id } = req.params;

  try {
    const [imagenes] = await db.query(
      `SELECT id_imagen, ruta, titulo, descripcion, orden 
       FROM habitacion_imagen 
       WHERE id_habitacion = ? AND tipo_imagen = '360'
       ORDER BY orden ASC`,
      [id]
    );

    const imagenesFormateadas = imagenes.map(img => ({
      id_imagen: img.id_imagen,
      url: construirUrlImagen(extraerNombreArchivo(img.ruta), '360'),
      titulo: img.titulo,
      descripcion: img.descripcion,
      orden: img.orden
    }));

    res.json(imagenesFormateadas);
  } catch (error) {
    console.error('Error al listar imágenes 360°:', error);
    res.status(500).json({ message: 'Error al obtener imágenes 360°' });
  }
};

// ============================
// ELIMINAR IMAGEN 360°
// ============================
export const eliminarImagen360 = async (req, res) => {
  const { id, idImagen } = req.params;

  try {
    // Verificar que la imagen existe y pertenece a la habitación
    const [imagen] = await db.query(
      "SELECT * FROM habitacion_imagen WHERE id_imagen = ? AND id_habitacion = ? AND tipo_imagen = '360'",
      [idImagen, id]
    );

    if (imagen.length === 0) {
      return res.status(404).json({ message: 'Imagen no encontrada' });
    }

    // Eliminar archivo físico
    try {
      const filePath = path.join('uploads', 'habitaciones', '360', extraerNombreArchivo(imagen[0].ruta));
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (e) {
      console.log("Error eliminando archivo:", e.message);
    }

    // Eliminar registro
    await db.query('DELETE FROM habitacion_imagen WHERE id_imagen = ?', [idImagen]);

    res.json({ message: 'Imagen 360° eliminada exitosamente' });
  } catch (error) {
    console.error('Error al eliminar imagen 360°:', error);
    res.status(500).json({ message: 'Error al eliminar imagen 360°' });
  }
};

// ============================
// ACTUALIZAR IMAGEN 360°
// ============================
export const actualizarImagen360 = async (req, res) => {
  const { id, idImagen } = req.params;
  const { titulo, descripcion, orden } = req.body;

  try {
    const [imagen] = await db.query(
      "SELECT * FROM habitacion_imagen WHERE id_imagen = ? AND id_habitacion = ? AND tipo_imagen = '360'",
      [idImagen, id]
    );

    if (imagen.length === 0) {
      return res.status(404).json({ message: 'Imagen no encontrada' });
    }

    await db.query(
      `UPDATE habitacion_imagen 
       SET titulo = ?, descripcion = ?, orden = ?
       WHERE id_imagen = ?`,
      [titulo, descripcion, orden, idImagen]
    );

    res.json({ message: 'Imagen 360° actualizada exitosamente' });
  } catch (error) {
    console.error('Error al actualizar imagen 360°:', error);
    res.status(500).json({ message: 'Error al actualizar imagen 360°' });
  }
};


// ============================
// OBTENER HABITACIONES PÚBLICAS
// ============================
export const getHabitacionesPublicas = async (req, res) => {
  try {
    const { id_tipo, precio_min, precio_max, capacidad, disponible } = req.query;

    let query = `
      SELECT 
        h.id_habitacion,
        h.numero,
        h.precio_total,
        h.piso,
        h.estado,
        h.descripcion,
        t.id_tipo,
        t.nombre as tipo_nombre,
        t.capacidad,
        t.precio_base,
        t.descripcion as tipo_descripcion,
        GROUP_CONCAT(
          DISTINCT CONCAT(
            hi.id_imagen, '|',
            hi.ruta, '|',
            hi.tipo_imagen, '|',
            hi.es_portada
          ) SEPARATOR '###'
        ) as imagenes
      FROM habitacion h
      INNER JOIN tipo t ON h.id_tipo = t.id_tipo
      LEFT JOIN habitacion_imagen hi ON h.id_habitacion = hi.id_habitacion
      WHERE 1=1
    `;

    const params = [];

    if (id_tipo) {
      query += ' AND h.id_tipo = ?';
      params.push(id_tipo);
    }

    if (precio_min) {
      query += ' AND h.precio_total >= ?';
      params.push(precio_min);
    }

    if (precio_max) {
      query += ' AND h.precio_total <= ?';
      params.push(precio_max);
    }

    if (capacidad) {
      query += ' AND t.capacidad >= ?';
      params.push(capacidad);
    }

    if (disponible === 'true') {
      query += " AND h.estado = 'disponible'";
    }

    query += ' GROUP BY h.id_habitacion ORDER BY h.numero';

    const [habitaciones] = await db.query(query, params);

    // Procesar imágenes
    const habitacionesProcesadas = habitaciones.map(h => {
      let imagenes = [];
      
      if (h.imagenes) {
        imagenes = h.imagenes.split('###').map(img => {
          const [id_imagen, ruta, tipo_imagen, es_portada] = img.split('|');
          
          // 🔥 CONSTRUIR RUTA SEGÚN LA ESTRUCTURA DE CARPETAS
          // uploads/habitaciones/imagen.jpg (para normal)
          // uploads/habitaciones/360/imagen.jpg (para 360)
          let rutaCompleta;
          
          if (tipo_imagen === '360') {
            rutaCompleta = `habitaciones/360/${ruta}`;
          } else {
            rutaCompleta = `habitaciones/${ruta}`;
          }
          
          console.log(`📸 Imagen procesada: ${rutaCompleta}`);
          
          return {
            id_imagen: parseInt(id_imagen),
            ruta: rutaCompleta, // Sin "uploads/" al inicio
            tipo_imagen,
            es_portada: parseInt(es_portada) === 1
          };
        });
      }

      return {
        id_habitacion: h.id_habitacion,
        numero: h.numero,
        precio_total: parseFloat(h.precio_total),
        piso: h.piso,
        estado: h.estado,
        descripcion: h.descripcion,
        tipo: {
          id_tipo: h.id_tipo,
          nombre: h.tipo_nombre,
          capacidad: h.capacidad,
          precio_base: parseFloat(h.precio_base),
          descripcion: h.tipo_descripcion
        },
        imagenes: imagenes.sort((a, b) => b.es_portada - a.es_portada)
      };
    });

    console.log(`✅ ${habitacionesProcesadas.length} habitaciones encontradas`);
    res.json(habitacionesProcesadas);
    
  } catch (error) {
    console.error('❌ Error al obtener habitaciones:', error);
    res.status(500).json({ message: 'Error al obtener habitaciones' });
  }
};

// Obtener detalle de una habitación
export const getHabitacionDetalle = async (req, res) => {
  try {
    const { id } = req.params;

    const [habitaciones] = await db.query(
      `SELECT 
        h.*,
        t.nombre as tipo_nombre,
        t.capacidad,
        t.precio_base,
        t.descripcion as tipo_descripcion
      FROM habitacion h
      INNER JOIN tipo t ON h.id_tipo = t.id_tipo
      WHERE h.id_habitacion = ?`,
      [id]
    );

    if (habitaciones.length === 0) {
      return res.status(404).json({ message: 'Habitación no encontrada' });
    }

    // Obtener imágenes
    const [imagenes] = await db.query(
      'SELECT * FROM habitacion_imagen WHERE id_habitacion = ? ORDER BY es_portada DESC, orden',
      [id]
    );

    // Construir URLs completas
    const imagenesConUrl = imagenes.map(img => {
      let rutaCompleta;
      
      if (img.tipo_imagen === '360') {
        rutaCompleta = `habitaciones/360/${img.ruta}`;
      } else {
        rutaCompleta = `habitaciones/${img.ruta}`;
      }
      
      return {
        ...img,
        ruta: rutaCompleta
      };
    });

    const habitacion = {
      ...habitaciones[0],
      tipo: {
        nombre: habitaciones[0].tipo_nombre,
        capacidad: habitaciones[0].capacidad,
        precio_base: habitaciones[0].precio_base,
        descripcion: habitaciones[0].tipo_descripcion
      },
      imagenes: imagenesConUrl
    };

    res.json(habitacion);
    
  } catch (error) {
    console.error('❌ Error al obtener habitación:', error);
    res.status(500).json({ message: 'Error al obtener habitación' });
  }
};

// Verificar disponibilidad
export const verificarDisponibilidad = async (req, res) => {
  try {
    const { id_habitacion, fecha_entrada, fecha_salida } = req.query;

    const [reservas] = await db.query(
      `SELECT COUNT(*) as conflictos
       FROM reserva
       WHERE id_habitacion = ?
         AND estado IN ('pendiente', 'confirmada')
         AND (
           (fecha_entrada <= ? AND fecha_salida >= ?) OR
           (fecha_entrada <= ? AND fecha_salida >= ?) OR
           (fecha_entrada >= ? AND fecha_salida <= ?)
         )`,
      [
        id_habitacion,
        fecha_salida, fecha_entrada,
        fecha_salida, fecha_salida,
        fecha_entrada, fecha_salida
      ]
    );

    const disponible = reservas[0].conflictos === 0;

    res.json({ disponible });
  } catch (error) {
    console.error('❌ Error al verificar disponibilidad:', error);
    res.status(500).json({ message: 'Error al verificar disponibilidad' });
  }
};

// Obtener tipos de habitación
export const getTiposHabitacion = async (req, res) => {
  try {
    const [tipos] = await db.query('SELECT * FROM tipo ORDER BY nombre');
    res.json(tipos);
  } catch (error) {
    console.error('❌ Error al obtener tipos:', error);
    res.status(500).json({ message: 'Error al obtener tipos' });
  }
};