import db from '../config/db.js';
import pricingDinamicoService from '../services/pricingDinamic.service.js';

// ============================================
// 📌 CREAR RESERVA INDIVIDUAL (CON PRICING DINÁMICO)
// ============================================
export const crearReserva = async (req, res) => {
  const { 
    id_cliente, 
    id_habitacion, 
    fecha_entrada, 
    fecha_salida,
    cantidad_adultos,
    cantidad_ninos,
    hora_llegada
  } = req.body;

  // Validar campos obligatorios
  if (!id_cliente || !id_habitacion || !fecha_entrada || !fecha_salida) {
    return res.status(400).json({ 
      message: 'Todos los campos son obligatorios' 
    });
  }

  // Validar cantidad de personas
  if (!cantidad_adultos || cantidad_adultos < 1) {
    return res.status(400).json({ 
      message: 'Debe haber al menos 1 adulto en la reserva' 
    });
  }

  try {
    // Verificar que la habitación existe
    const [habitacion] = await db.query(
      'SELECT * FROM habitacion WHERE id_habitacion = ?',
      [id_habitacion]
    );

    if (habitacion.length === 0) {
      return res.status(404).json({ message: 'Habitación no encontrada' });
    }

    // Verificar disponibilidad
    const [conflictos] = await db.query(
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

    if (conflictos[0].conflictos > 0) {
      return res.status(400).json({ 
        message: 'La habitación no está disponible para esas fechas' 
      });
    }

    // 🎯 CALCULAR PRECIO DINÁMICO
    const precioCalculado = await pricingDinamicoService.calcularPrecio(
      id_habitacion,
      fecha_entrada,
      fecha_salida,
      req.ip
    );

    // Crear la reserva con precio dinámico calculado
    const [result] = await db.query(
      `INSERT INTO reserva (
        id_cliente, 
        id_habitacion, 
        fecha_entrada, 
        fecha_salida, 
        total, 
        cantidad_adultos, 
        cantidad_ninos, 
        hora_llegada,
        estado
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pendiente')`,
      [
        id_cliente, 
        id_habitacion, 
        fecha_entrada, 
        fecha_salida, 
        precioCalculado.precio_total, // 👈 Precio dinámico
        cantidad_adultos || 1,
        cantidad_ninos || 0,
        hora_llegada || null
      ]
    );

    // 📊 Marcar consulta de precio como convertida en reserva
    await pricingDinamicoService.marcarConsultaConvertida(
      id_habitacion,
      fecha_entrada,
      result.insertId
    );

    res.status(201).json({
      message: 'Reserva creada exitosamente',
      id_reserva: result.insertId,
      detalles_precio: {
        precio_base: precioCalculado.precio_base,
        precio_por_noche: precioCalculado.precio_por_noche,
        precio_total: precioCalculado.precio_total,
        noches: precioCalculado.noches,
        ajustes_aplicados: precioCalculado.ajustes
      }
    });
  } catch (error) {
    console.error('Error al crear reserva:', error);
    res.status(500).json({ 
      message: error.message || 'Error al crear reserva' 
    });
  }
};

// ============================================
// 📌 CREAR RESERVA MÚLTIPLE (OPTIMIZADO)
// ============================================
export const crearReservaMultiple = async (req, res) => {
  const { 
    id_cliente, 
    habitaciones, // Array de { id_habitacion }
    fecha_entrada, 
    fecha_salida,
    cantidad_adultos,
    cantidad_ninos,
    hora_llegada
  } = req.body;

  // Validar campos obligatorios
  if (!id_cliente || !habitaciones || !Array.isArray(habitaciones) || habitaciones.length === 0) {
    return res.status(400).json({ 
      message: 'Cliente y habitaciones son obligatorios' 
    });
  }

  if (!fecha_entrada || !fecha_salida) {
    return res.status(400).json({ 
      message: 'Las fechas de entrada y salida son obligatorias' 
    });
  }

  if (!cantidad_adultos || cantidad_adultos < 1) {
    return res.status(400).json({ 
      message: 'Debe haber al menos 1 adulto en la reserva' 
    });
  }

  const connection = await db.getConnection();
  
  try {
    // Iniciar transacción
    await connection.beginTransaction();

    // 🚀 PASO 1: VERIFICAR TODAS LAS HABITACIONES EN PARALELO
    const verificacionesPromesas = habitaciones.map(async (hab) => {
      const { id_habitacion } = hab;

      if (!id_habitacion) {
        throw new Error('Cada habitación debe tener id_habitacion');
      }

      // Verificar que la habitación existe
      const [habitacion] = await connection.query(
        'SELECT * FROM habitacion WHERE id_habitacion = ?',
        [id_habitacion]
      );

      if (habitacion.length === 0) {
        throw new Error(`Habitación ${id_habitacion} no encontrada`);
      }

      // Verificar disponibilidad
      const [conflictos] = await connection.query(
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

      if (conflictos[0].conflictos > 0) {
        throw new Error(
          `La habitación ${habitacion[0].numero} no está disponible para esas fechas`
        );
      }

      return { id_habitacion, habitacion: habitacion[0] };
    });

    const habitacionesVerificadas = await Promise.all(verificacionesPromesas);

    // 🚀 PASO 2: CALCULAR TODOS LOS PRECIOS EN PARALELO
    const preciosPromesas = habitacionesVerificadas.map(({ id_habitacion }) => 
      pricingDinamicoService.calcularPrecio(
        id_habitacion,
        fecha_entrada,
        fecha_salida,
        req.ip
      )
    );

    const preciosCalculados = await Promise.all(preciosPromesas);

    // 🚀 PASO 3: CREAR TODAS LAS RESERVAS
    const reservasCreadas = [];
    let totalGeneral = 0;

    for (let i = 0; i < habitacionesVerificadas.length; i++) {
      const { id_habitacion, habitacion } = habitacionesVerificadas[i];
      const precioCalculado = preciosCalculados[i];

      // Crear la reserva
      const [result] = await connection.query(
        `INSERT INTO reserva (
          id_cliente, 
          id_habitacion, 
          fecha_entrada, 
          fecha_salida, 
          total, 
          cantidad_adultos, 
          cantidad_ninos, 
          hora_llegada,
          estado
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pendiente')`,
        [
          id_cliente, 
          id_habitacion, 
          fecha_entrada, 
          fecha_salida, 
          precioCalculado.precio_total,
          cantidad_adultos || 1,
          cantidad_ninos || 0,
          hora_llegada || null
        ]
      );

      // 📊 Marcar consulta como convertida (sin await para no bloquear)
      pricingDinamicoService.marcarConsultaConvertida(
        id_habitacion,
        fecha_entrada,
        result.insertId
      ).catch(err => console.error('Error marcando consulta:', err));

      totalGeneral += precioCalculado.precio_total;

      reservasCreadas.push({
        id_reserva: result.insertId,
        id_habitacion,
        numero_habitacion: habitacion.numero,
        precio_base: precioCalculado.precio_base,
        precio_por_noche: precioCalculado.precio_por_noche,
        precio_total: precioCalculado.precio_total,
        noches: precioCalculado.noches,
        ajustes_aplicados: precioCalculado.ajustes
      });
    }

    // Confirmar transacción
    await connection.commit();

    res.status(201).json({
      message: 'Reservas creadas exitosamente',
      cantidad_reservas: reservasCreadas.length,
      reservas: reservasCreadas,
      total_general: parseFloat(totalGeneral.toFixed(2)),
      desglose: {
        fecha_entrada,
        fecha_salida,
        cantidad_adultos,
        cantidad_ninos
      }
    });

  } catch (error) {
    // Revertir transacción en caso de error
    await connection.rollback();
    console.error('Error al crear reservas:', error);
    res.status(500).json({ 
      message: error.message || 'Error al crear reservas' 
    });
  } finally {
    connection.release();
  }
};

// Obtener reservas del cliente logueado
export const obtenerMisReservas = async (req, res) => {
  const id_cliente = req.usuario.id_cliente;

  try {
    const [reservas] = await db.query(
      `SELECT 
        r.*,
        h.numero as numero_habitacion,
        t.nombre as tipo_habitacion,
        t.capacidad as capacidad_habitacion,
        DATEDIFF(r.fecha_salida, r.fecha_entrada) as noches
       FROM reserva r
       INNER JOIN habitacion h ON r.id_habitacion = h.id_habitacion
       INNER JOIN tipo t ON h.id_tipo = t.id_tipo
       WHERE r.id_cliente = ?
       ORDER BY r.fecha_entrada DESC`,
      [id_cliente]
    );

    res.json(reservas);
  } catch (error) {
    console.error('Error al obtener reservas:', error);
    res.status(500).json({ message: 'Error al obtener reservas' });
  }
};

// Cancelar reserva
export const cancelarReserva = async (req, res) => {
  const { id } = req.params;
  const id_cliente = req.usuario.id_cliente;

  try {
    // Verificar que la reserva existe y pertenece al cliente
    const [reserva] = await db.query(
      'SELECT * FROM reserva WHERE id_reserva = ? AND id_cliente = ?',
      [id, id_cliente]
    );

    if (reserva.length === 0) {
      return res.status(404).json({ message: 'Reserva no encontrada' });
    }

    if (reserva[0].estado === 'cancelada') {
      return res.status(400).json({ message: 'La reserva ya está cancelada' });
    }

    // Cancelar la reserva
    await db.query(
      "UPDATE reserva SET estado = 'cancelada' WHERE id_reserva = ?",
      [id]
    );

    res.json({ message: 'Reserva cancelada exitosamente' });
  } catch (error) {
    console.error('Error al cancelar reserva:', error);
    res.status(500).json({ message: 'Error al cancelar reserva' });
  }
};

// ========================================
// 👇 FUNCIONES PARA ADMINISTRADORES
// ========================================

// Obtener TODAS las reservas (admin)
export const obtenerTodasReservas = async (req, res) => {
  try {
    const [reservas] = await db.query(
      `SELECT 
        r.*,
        h.numero as numero_habitacion,
        t.nombre as tipo_habitacion,
        c.nombre as nombre_cliente,
        c.apellido as apellido_cliente,
        c.ci as ci_cliente,
        c.correo as correo_cliente,
        DATEDIFF(r.fecha_salida, r.fecha_entrada) as noches,
        CONCAT(c.nombre, ' ', c.apellido) as cliente_completo
       FROM reserva r
       INNER JOIN habitacion h ON r.id_habitacion = h.id_habitacion
       INNER JOIN tipo t ON h.id_tipo = t.id_tipo
       INNER JOIN cliente c ON r.id_cliente = c.id_cliente
       ORDER BY r.fecha_entrada DESC`
    );

    res.json(reservas);
  } catch (error) {
    console.error('Error al obtener todas las reservas:', error);
    res.status(500).json({ message: 'Error al obtener reservas' });
  }
};

// Actualizar estado de reserva (admin)
export const actualizarEstadoReserva = async (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;

  // Validar estado
  const estadosValidos = ['pendiente', 'confirmada', 'cancelada', 'finalizada'];
  if (!estadosValidos.includes(estado)) {
    return res.status(400).json({ message: 'Estado inválido' });
  }

  try {
    // Verificar que la reserva existe
    const [reserva] = await db.query(
      'SELECT * FROM reserva WHERE id_reserva = ?',
      [id]
    );

    if (reserva.length === 0) {
      return res.status(404).json({ message: 'Reserva no encontrada' });
    }

    // Actualizar estado
    await db.query(
      'UPDATE reserva SET estado = ? WHERE id_reserva = ?',
      [estado, id]
    );

    res.json({ message: 'Estado actualizado exitosamente' });
  } catch (error) {
    console.error('Error al actualizar estado:', error);
    res.status(500).json({ message: 'Error al actualizar estado' });
  }
};

// Eliminar reserva (admin)
export const eliminarReserva = async (req, res) => {
  const { id } = req.params;

  try {
    // Verificar que la reserva existe
    const [reserva] = await db.query(
      'SELECT * FROM reserva WHERE id_reserva = ?',
      [id]
    );

    if (reserva.length === 0) {
      return res.status(404).json({ message: 'Reserva no encontrada' });
    }

    // Eliminar la reserva
    await db.query('DELETE FROM reserva WHERE id_reserva = ?', [id]);

    res.json({ message: 'Reserva eliminada exitosamente' });
  } catch (error) {
    console.error('Error al eliminar reserva:', error);
    res.status(500).json({ message: 'Error al eliminar reserva' });
  }
};