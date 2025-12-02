import db from '../config/db.js';
import path from 'path';

// Función auxiliar para extraer solo el nombre del archivo
function extraerNombreArchivo(rutaCompleta) {
  if (!rutaCompleta) return null;
  // Para Windows (\) y Linux/Mac (/)
  return rutaCompleta.split(/[/\\]/).pop();
}

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
        'SELECT ruta FROM habitacion_imagen WHERE id_habitacion = ?',
        [habitacion.id_habitacion]
      );
      
      // Aquí aplicamos la función para corregir las rutas
      habitacion.imagenes = imagenes.map(img => {
        const nombreArchivo = extraerNombreArchivo(img.ruta);
        if (!nombreArchivo) return null;
        
        // Construir URL correcta
        return `${process.env.BACKEND_URL || 'http://localhost:4000'}/uploads/habitaciones/${nombreArchivo}`;
      }).filter(url => url !== null); // Filtrar URLs nulas
    }

    console.log("Primera habitación con imágenes corregidas:", habitaciones[0]);
    res.json(habitaciones);
  } catch (error) {
    console.error("Error al obtener habitaciones:", error);
    res.status(500).json({ message: "Error al obtener habitaciones" });
  }
};

export const obtenerHabitacion = async (req, res) => {
  const { id } = req.params;

  try {
    // Obtener datos de la habitación
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

    // Obtener imágenes
    const [imagenes] = await db.query(
      'SELECT id_imagen, ruta, es_portada FROM habitacion_imagen WHERE id_habitacion = ?',
      [id]
    );

    // Construir objeto de habitación con imágenes
    const habitacionCompleta = {
      ...habitacion[0],
      imagenes: imagenes.map(img => ({
        id_imagen: img.id_imagen,
        // Aquí debes construir la URL completa igual que en listarHabitaciones
        ruta: `${process.env.BACKEND_URL || 'http://localhost:4000'}/uploads/habitaciones/${extraerNombreArchivo(img.ruta)}`,
        es_portada: img.es_portada
      }))
    };

    res.json(habitacionCompleta);
  } catch (error) {
    console.error("Error al obtener habitación:", error);
    res.status(500).json({ message: "Error al obtener habitación" });
  }
};


// ✅ AGREGAR ESTA FUNCIÓN PARA CREAR HABITACIONES
export const crearHabitacion = async (req, res) => {
  const { numero, id_tipo, precio_total, piso, estado, descripcion } = req.body;
  const files = req.files;

  if (!numero || !id_tipo || !precio_total) {
    return res.status(400).json({ message: 'Número, tipo y precio total son obligatorios' });
  }

  try {
    const [existe] = await db.query(
      'SELECT id_habitacion FROM habitacion WHERE numero = ?',
      [numero]
    );

    if (existe.length > 0) {
      return res.status(400).json({ message: 'El número de habitación ya existe' });
    }

    const [result] = await db.query(
      `INSERT INTO habitacion (numero, id_tipo, precio_total, piso, estado, descripcion)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [numero, id_tipo, precio_total, piso, estado || 'disponible', descripcion]
    );

    const habitacionId = result.insertId;

    // Guardar imágenes en habitacion_imagen
    if (files && files.length > 0) {
      const insertImages = files.map(file => [
        habitacionId,
        file.filename,  // Solo el nombre del archivo, NO la ruta completa
        0               // es_portada por defecto
      ]);

      await db.query(
        `INSERT INTO habitacion_imagen (id_habitacion, ruta, es_portada) VALUES ?`,
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
    if (habitacion.length === 0) return res.status(404).json({ message: 'Habitación no encontrada' });

    // Verificar número duplicado
    if (numero) {
      const [existe] = await db.query(
        'SELECT id_habitacion FROM habitacion WHERE numero = ? AND id_habitacion != ?',
        [numero, id]
      );
      if (existe.length > 0) return res.status(400).json({ message: 'El número de habitación ya existe' });
    }

    // Actualizar campos de la habitación
    await db.query(
      `UPDATE habitacion 
       SET numero=?, id_tipo=?, precio_total=?, piso=?, estado=?, descripcion=?
       WHERE id_habitacion=?`,
      [numero, id_tipo, precio_total, piso, estado, descripcion, id]
    );

    // ============================
    // MANEJO DE IMÁGENES
    // ============================
    // 1️⃣ Obtener todas las imágenes actuales
    const [imgsActuales] = await db.query(
      'SELECT * FROM habitacion_imagen WHERE id_habitacion = ?',
      [id]
    );

    // 2️⃣ Borrar las imágenes que no estén en imagenesExistentes
    let idsExistentes = [];
    if (imagenesExistentes) {
      try {
        idsExistentes = JSON.parse(imagenesExistentes).map(img => img.id_imagen);
      } catch (e) {
        console.error('Error al parsear imagenesExistentes:', e);
      }
    }

    const imgsBorrar = imgsActuales.filter(img => !idsExistentes.includes(img.id_imagen));
    
    for (const img of imgsBorrar) {
      try {
        // Eliminar archivo físico
        const filePath = path.join('uploads', 'habitaciones', img.ruta);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch(e) { 
        console.log("Error eliminando archivo:", e.message);
      }
    }
    
    if (imgsBorrar.length > 0) {
      await db.query(
        'DELETE FROM habitacion_imagen WHERE id_imagen IN (?)',
        [imgsBorrar.map(img => img.id_imagen)]
      );
    }

    // 3️⃣ Guardar nuevas imágenes
    if (files && files.length > 0) {
      const insertImages = files.map(file => [id, file.filename, 0]);
      await db.query(
        'INSERT INTO habitacion_imagen (id_habitacion, ruta, es_portada) VALUES ?',
        [insertImages]
      );
    }

    res.json({ message: 'Habitación actualizada exitosamente' });

  } catch (error) {
    console.error('Error al editar habitación:', error);
    res.status(500).json({ message: 'Error al actualizar habitación' });
  }
};


export const eliminarHabitacion = async (req, res) => {
  const { id } = req.params;

  try {
    // Verificar si la habitación existe
    const [habitacion] = await db.query(
      'SELECT id_habitacion FROM habitacion WHERE id_habitacion = ?',
      [id]
    );

    if (habitacion.length === 0) {
      return res.status(404).json({ message: 'Habitación no encontrada' });
    }

    // Verificar si la habitación está ocupada antes de eliminar
    const [estado] = await db.query(
      'SELECT estado FROM habitacion WHERE id_habitacion = ?',
      [id]
    );

    if (estado[0].estado === 'ocupada') {
      return res.status(400).json({ 
        message: 'No se puede eliminar una habitación ocupada' 
      });
    }

    await db.query('DELETE FROM habitacion WHERE id_habitacion = ?', [id]);
    
    res.json({ message: 'Habitación eliminada exitosamente' });
  } catch (error) {
    console.error('Error al eliminar habitación:', error);
    res.status(500).json({ message: 'Error al eliminar habitación' });
  }
};

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