import { RedEnlaceService } from '../services/redEnlaceService.js';
import db from '../config/db.js';

/**
 * Iniciar proceso de pago
 */
export const iniciarPago = async (req, res) => {
  const { id_reserva } = req.body;

  try {
    // Obtener información de la reserva con todos los detalles
    const [reservas] = await db.query(
      `SELECT r.*, c.correo, c.nombre, c.apellido,
              h.numero as numero_habitacion,
              t.nombre as tipo_habitacion
       FROM reserva r
       INNER JOIN cliente c ON r.id_cliente = c.id_cliente
       INNER JOIN habitacion h ON r.id_habitacion = h.id_habitacion
       INNER JOIN tipo t ON h.id_tipo = t.id_tipo
       WHERE r.id_reserva = ?`,
      [id_reserva]
    );

    if (reservas.length === 0) {
      return res.status(404).json({ message: 'Reserva no encontrada' });
    }

    const reserva = reservas[0];

    // Verificar que la reserva esté pendiente
    if (reserva.estado !== 'pendiente') {
      return res.status(400).json({ 
        message: 'Esta reserva ya ha sido procesada o confirmada' 
      });
    }

    // Verificar que el usuario sea el dueño de la reserva (seguridad)
    if (req.usuario.id_cliente && req.usuario.id_cliente !== reserva.id_cliente) {
      return res.status(403).json({ 
        message: 'No tienes permiso para procesar esta reserva' 
      });
    }

    // Crear descripción del pago
    const descripcion = `Reserva #${id_reserva} - ${reserva.tipo_habitacion} Hab. ${reserva.numero_habitacion} - ${reserva.nombre} ${reserva.apellido}`;

    console.log('📋 Iniciando pago para reserva:', {
      id_reserva,
      cliente: `${reserva.nombre} ${reserva.apellido}`,
      monto: reserva.total
    });

    // Crear transacción en Red Enlace
    const resultado = await RedEnlaceService.crearTransaccion({
      id_reserva: reserva.id_reserva,
      total: reserva.total,
      descripcion: descripcion,
      numero_habitacion: reserva.numero_habitacion,
      tipo_habitacion: reserva.tipo_habitacion
    });

    // Registrar el intento de pago en la base de datos
    const [resultPago] = await db.query(
      `INSERT INTO pago (id_reserva, monto, metodo_pago, estado_pago, transaccion_id, datos_transaccion)
       VALUES (?, ?, ?, 'pendiente', ?, ?)`,
      [
        id_reserva,
        reserva.total,
        'red_enlace',
        resultado.reference,
        JSON.stringify(resultado.data)
      ]
    );

    console.log(`💳 Pago iniciado - ID Pago: ${resultPago.insertId}, ID Reserva: ${id_reserva}`);
    console.log(`🔗 Link de pago: ${resultado.paymentUrl}`);

    res.json({
      success: true,
      paymentUrl: resultado.paymentUrl,
      reference: resultado.reference,
      id_pago: resultPago.insertId,
      id_reserva: id_reserva,
      monto: reserva.total,
      message: 'Redirigiendo a la pasarela de pago...'
    });

  } catch (error) {
    console.error('❌ Error al iniciar pago:', error);
    res.status(500).json({ 
      message: error.message || 'Error al procesar el pago' 
    });
  }
};

/**
 * Iniciar pago único para múltiples reservas (carrito)
 */
export const iniciarPagoMultiple = async (req, res) => {
  const { ids_reserva } = req.body;

  if (!Array.isArray(ids_reserva) || ids_reserva.length === 0) {
    return res.status(400).json({ message: 'Se requiere un array de ids_reserva' });
  }

  try {
    const placeholders = ids_reserva.map(() => '?').join(',');
    const [reservas] = await db.query(
      `SELECT r.*, c.correo, c.nombre, c.apellido,
              h.numero AS numero_habitacion,
              t.nombre AS tipo_habitacion
       FROM reserva r
       INNER JOIN cliente c ON r.id_cliente = c.id_cliente
       INNER JOIN habitacion h ON r.id_habitacion = h.id_habitacion
       INNER JOIN tipo t ON h.id_tipo = t.id_tipo
       WHERE r.id_reserva IN (${placeholders})`,
      ids_reserva
    );

    if (reservas.length !== ids_reserva.length) {
      return res.status(404).json({ message: 'Alguna reserva no fue encontrada' });
    }

    const noDisponibles = reservas.filter((r) => r.estado !== 'pendiente');
    if (noDisponibles.length > 0) {
      return res.status(400).json({ message: 'Algunas reservas ya fueron procesadas' });
    }

    // Verificar que el cliente autenticado sea el dueño
    if (req.usuario.id_cliente && req.usuario.id_cliente !== reservas[0].id_cliente) {
      return res.status(403).json({ message: 'No tienes permiso para procesar estas reservas' });
    }

    const montoTotal = reservas.reduce((sum, r) => sum + parseFloat(r.total), 0);
    const cliente = reservas[0];

    const habitacionesStr = reservas.map((r) => `Hab. ${r.numero_habitacion}`).join(', ');
    const descripcion = `${ids_reserva.length} habitaciones (${habitacionesStr}) - ${cliente.nombre} ${cliente.apellido}`;

    console.log('🛒 Iniciando pago múltiple:', {
      ids_reserva,
      cliente: `${cliente.nombre} ${cliente.apellido}`,
      monto_total: montoTotal,
    });

    // Crear UNA transacción en Red Enlace con el total combinado
    const resultado = await RedEnlaceService.crearTransaccion({
      id_reserva: ids_reserva[0], // referencia primaria para el webhook
      total: montoTotal.toFixed(2),
      descripcion,
      numero_habitacion: habitacionesStr,
      tipo_habitacion: reservas.map((r) => r.tipo_habitacion).join(', '),
    });

    // Un solo registro en pago que cubre todas las reservas
    const [resultPago] = await db.query(
      `INSERT INTO pago (id_reserva, monto, metodo_pago, estado_pago, transaccion_id, datos_transaccion)
       VALUES (?, ?, 'red_enlace', 'pendiente', ?, ?)`,
      [
        ids_reserva[0],
        montoTotal.toFixed(2),
        resultado.reference,
        JSON.stringify({ ...resultado.data, ids_reserva_todas: ids_reserva }),
      ]
    );

    console.log(`💳 Pago múltiple iniciado - ID Pago: ${resultPago.insertId}, Reservas: ${ids_reserva.join(', ')}`);
    console.log(`🔗 Link de pago: ${resultado.paymentUrl}`);

    res.json({
      success: true,
      paymentUrl: resultado.paymentUrl,
      reference: resultado.reference,
      id_pago: resultPago.insertId,
      ids_reserva,
      monto_total: montoTotal,
      message: 'Redirigiendo a la pasarela de pago...',
    });
  } catch (error) {
    console.error('❌ Error al iniciar pago múltiple:', error);
    res.status(500).json({ message: error.message || 'Error al procesar el pago' });
  }
};

/**
 * Webhook para recibir confirmaciones de Red Enlace
 * Este endpoint NO requiere autenticación porque Red Enlace lo llama
 */
export const webhookRedEnlace = async (req, res) => {
  console.log('🔔 ===== WEBHOOK RECIBIDO DE RED ENLACE =====');
  console.log('📥 Body completo:', JSON.stringify(req.body, null, 2));
  console.log('📥 Headers:', JSON.stringify(req.headers, null, 2));
  console.log('📥 Method:', req.method);
  console.log('📥 URL:', req.url);

  try {
    const { reference, response } = req.body;

    // Validar que vengan los datos necesarios
    if (!reference || !response) {
      console.error('❌ Datos inválidos en webhook - Falta reference o response');
      console.error('   Reference:', reference);
      console.error('   Response:', response);
      return res.status(400).json({ error: 'Datos inválidos' });
    }

    console.log('🔐 Referencia encriptada recibida:', reference);
    console.log('📊 Respuesta de Red Enlace:', response);

    // Procesar la confirmación
    let resultado;
    try {
      resultado = RedEnlaceService.procesarConfirmacion({ reference, response });
      console.log('✅ Desencriptación exitosa. ID Reserva:', resultado.id_reserva);
    } catch (errorDesencriptacion) {
      console.error('❌ Error al desencriptar referencia:', errorDesencriptacion);
      return res.status(400).json({ error: 'Error al procesar la referencia' });
    }

    console.log('✅ Resultado procesado:', {
      id_reserva: resultado.id_reserva,
      estado_pago: resultado.estado_pago,
      estado_reserva: resultado.estado_reserva,
      respuesta_original: resultado.respuesta_original
    });

    // Verificar que la reserva primaria existe
    const [reservaExiste] = await db.query(
      'SELECT id_reserva, estado FROM reserva WHERE id_reserva = ?',
      [resultado.id_reserva]
    );

    if (reservaExiste.length === 0) {
      console.error('❌ Reserva no encontrada:', resultado.id_reserva);
      return res.status(404).json({ error: 'Reserva no encontrada' });
    }

    console.log('📋 Reserva primaria - Estado:', reservaExiste[0].estado);

    // Buscar todas las reservas vinculadas al mismo pago (puede ser un pago múltiple)
    const [pagoInfo] = await db.query(
      'SELECT datos_transaccion FROM pago WHERE transaccion_id = ? LIMIT 1',
      [reference]
    );

    let idsReserva = [resultado.id_reserva];
    if (pagoInfo.length > 0 && pagoInfo[0].datos_transaccion) {
      try {
        const datos = JSON.parse(pagoInfo[0].datos_transaccion);
        if (Array.isArray(datos.ids_reserva_todas) && datos.ids_reserva_todas.length > 0) {
          idsReserva = datos.ids_reserva_todas;
          console.log(`🛒 Pago múltiple detectado - Actualizando reservas: ${idsReserva.join(', ')}`);
        }
      } catch (e) {
        console.warn('No se pudo parsear datos_transaccion, usando solo reserva primaria');
      }
    }

    // Actualizar TODAS las reservas vinculadas al pago
    const placeholders = idsReserva.map(() => '?').join(',');
    const [updateReserva] = await db.query(
      `UPDATE reserva SET estado = ? WHERE id_reserva IN (${placeholders})`,
      [resultado.estado_reserva, ...idsReserva]
    );

    console.log(`📝 Reservas actualizadas - Filas afectadas: ${updateReserva.affectedRows}`);
    console.log(`📝 Nuevo estado: ${resultado.estado_reserva} → Reservas: ${idsReserva.join(', ')}`);

    // Actualizar el estado del pago
    const [updatePago] = await db.query(
      `UPDATE pago 
       SET estado_pago = ?, 
           fecha_pago = NOW(),
           datos_transaccion = JSON_SET(
             COALESCE(datos_transaccion, '{}'),
             '$.webhook_response', ?,
             '$.webhook_timestamp', NOW()
           )
       WHERE transaccion_id = ?`,
      [resultado.estado_pago, response, reference]
    );

    console.log(`💰 Pago actualizado - Filas afectadas: ${updatePago.affectedRows}`);
    console.log(`💰 Nuevo estado pago: ${resultado.estado_pago}`);

    // Verificar que se actualizaron
    const [verificacion] = await db.query(
      `SELECT id_reserva, estado FROM reserva WHERE id_reserva IN (${placeholders})`,
      idsReserva
    );
    verificacion.forEach((r) => {
      console.log(`✅ VERIFICACIÓN - Reserva #${r.id_reserva} → Estado: ${r.estado}`);
    });

    console.log(`✅ ${idsReserva.length} reserva(s) → Estado: ${resultado.estado_reserva}`);
    console.log(`💰 Pago → Estado: ${resultado.estado_pago}`);
    console.log('🔔 ===== FIN WEBHOOK EXITOSO =====\n');

    // Responder a Red Enlace
    res.json({ 
      success: true, 
      order_id: resultado.id_reserva,
      message: 'Webhook procesado correctamente'
    });

  } catch (error) {
    console.error('❌ ===== ERROR EN WEBHOOK =====');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    console.error('Body recibido:', req.body);
    console.error('❌ ===== FIN ERROR WEBHOOK =====\n');
    
    res.status(500).json({ 
      error: 'Error al procesar confirmación',
      message: error.message 
    });
  }
};

/**
 * Verificar estado de pago de una reserva
 */
export const verificarEstadoPago = async (req, res) => {
  const { id_reserva } = req.params;

  try {
    // Obtener el pago más reciente de la reserva
    const [pagos] = await db.query(
      `SELECT p.*, r.estado as estado_reserva, r.total as monto_reserva
       FROM pago p
       INNER JOIN reserva r ON p.id_reserva = r.id_reserva
       WHERE p.id_reserva = ?
       ORDER BY p.fecha_pago DESC, p.id_pago DESC
       LIMIT 1`,
      [id_reserva]
    );

    if (pagos.length === 0) {
      return res.status(404).json({ 
        message: 'No se encontró información de pago para esta reserva' 
      });
    }

    const pago = pagos[0];

    // Log para debugging
    console.log(`🔍 Verificación de pago - Reserva #${id_reserva}:`, {
      estado_pago: pago.estado_pago,
      estado_reserva: pago.estado_reserva,
      monto: pago.monto
    });

    res.json(pago);

  } catch (error) {
    console.error('❌ Error al verificar estado:', error);
    res.status(500).json({ 
      message: 'Error al verificar estado del pago' 
    });
  }
};