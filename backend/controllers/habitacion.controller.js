import db from '../config/db.js';

export const listarHabitaciones = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        h.*,
        t.nombre AS tipo_habitacion,
        t.capacidad,
        t.precio_base
      FROM habitacion h
      INNER JOIN tipo t ON h.id_tipo = t.id_tipo
      ORDER BY h.piso, h.numero
    `);

    // Convertir rutas JSON en URLs completas
    const habitaciones = rows.map(h => ({
      ...h,
      imagenes: h.imagenes
        ? JSON.parse(h.imagenes).map(img => `${process.env.BACKEND_URL}/uploads/habitaciones/${img}`)
        : []
    }));

    res.json(habitaciones);
  } catch (error) {
    console.error("Error al obtener habitaciones:", error);
    res.status(500).json({ message: "Error al obtener habitaciones" });
  }
};

export const obtenerHabitacion = async (req, res) => {
  const { id } = req.params;

  try {
    // Obtener datos de la habitación con su tipo
    const [rows] = await db.query(
      `
      SELECT 
        h.*,
        t.nombre AS tipo_habitacion,
        t.capacidad,
        t.precio_base
      FROM habitacion h
      INNER JOIN tipo t ON h.id_tipo = t.id_tipo
      WHERE h.id_habitacion = ?
      `,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Habitación no encontrada" });
    }

    const habitacion = rows[0];

    // Obtener imágenes de la habitación
    const [imagenes] = await db.query(
      `SELECT id_imagen, ruta, es_portada FROM habitacion_imagen WHERE id_habitacion = ?`,
      [id]
    );

    // Devolver datos junto con las imágenes
    res.json({ ...habitacion, imagenes });
  } catch (error) {
    console.error("Error al obtener habitación:", error);
    res.status(500).json({ message: "Error al obtener habitación" });
  }
};


// ✅ AGREGAR ESTA FUNCIÓN PARA CREAR HABITACIONES
export const crearHabitacion = async (req, res) => {
  const { numero, id_tipo, precio_total, piso, estado, descripcion } = req.body;
  const files = req.files; // aquí estarán las imágenes

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
        file.path,      // ruta en servidor
        0               // es_portada por defecto
      ]);

      await db.query(
        `INSERT INTO habitacion_imagen (id_habitacion, ruta, es_portada) VALUES ?`,
        [insertImages]
      );
    }

    res.status(201).json({ message: 'Habitación creada exitosamente', id: habitacionId });
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
  const files = req.files; // nuevas imágenes

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
    const idsExistentes = imagenesExistentes ? JSON.parse(imagenesExistentes).map(img => img.id_imagen) : [];
    const imgsBorrar = imgsActuales.filter(img => !idsExistentes.includes(img.id_imagen));
    for (const img of imgsBorrar) {
      // eliminar archivo del servidor
      try { fs.unlinkSync(img.ruta); } catch(e){ console.log("Archivo ya eliminado:", img.ruta); }
    }
    if (imgsBorrar.length > 0) {
      await db.query(
        'DELETE FROM habitacion_imagen WHERE id_imagen IN (?)',
        [imgsBorrar.map(img => img.id_imagen)]
      );
    }

    // 3️⃣ Guardar nuevas imágenes
    if (files && files.length > 0) {
      const insertImages = files.map(file => [id, file.path, 0]);
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