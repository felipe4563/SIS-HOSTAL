import crypto from 'crypto';
import axios from 'axios';

export class RedEnlaceService {
  
  static getConfig() {
    const isProduction = process.env.RED_ENLACE_ENVIRONMENT === 'production';
    
    return {
      username: process.env.RED_ENLACE_USERNAME,
      account_id: process.env.RED_ENLACE_ACCOUNT_ID,
      key_webservice: process.env.RED_ENLACE_KEY_WEBSERVICE,
      url: isProduction 
        ? 'https://api.enlazateonline.com:4443/app/webservice/webcheckout/rest'
        : 'https://qa-api.enlazateonline.com/app/webservice/webcheckout/rest',
      url_back: `${process.env.BACKEND_URL}/api/pagos/webhook-red-enlace`,
      url_redirect: `${process.env.FRONTEND_URL}/pago-resultado`
    };
  }

  /**
   * Preparar la clave para AES-256-ECB (debe ser exactamente 32 bytes)
   */
  static prepararClave(keyWebservice) {
    let key = Buffer.from(keyWebservice, 'utf8');
    
    // AES-256 requiere exactamente 32 bytes
    if (key.length < 32) {
      // Si es más corta, rellenar con ceros
      const padding = Buffer.alloc(32 - key.length, 0);
      key = Buffer.concat([key, padding]);
    } else if (key.length > 32) {
      // Si es más larga, truncar
      key = key.slice(0, 32);
    }
    
    return key;
  }

  /**
   * Encriptar referencia usando AES-256-ECB (como en el plugin de WordPress)
   */
  static encriptarReferencia(reservaId) {
    const config = this.getConfig();
    const key = this.prepararClave(config.key_webservice);
    
    try {
      // Crear cipher con AES-256-ECB
      const cipher = crypto.createCipheriv('aes-256-ecb', key, null);
      
      // Encriptar
      let encrypted = cipher.update(String(reservaId), 'utf8');
      encrypted = Buffer.concat([encrypted, cipher.final()]);
      
      // Retornar en base64
      return encrypted.toString('base64');
    } catch (error) {
      console.error('Error al encriptar:', error);
      throw new Error('Error en la encriptación de la referencia');
    }
  }

  /**
   * Desencriptar referencia
   */
  static desencriptarReferencia(referenciaEncriptada) {
    const config = this.getConfig();
    const key = this.prepararClave(config.key_webservice);
    
    try {
      // Crear decipher con AES-256-ECB
      const decipher = crypto.createDecipheriv('aes-256-ecb', key, null);
      
      // Desencriptar
      let decrypted = decipher.update(Buffer.from(referenciaEncriptada, 'base64'));
      decrypted = Buffer.concat([decrypted, decipher.final()]);
      
      return decrypted.toString('utf8');
    } catch (error) {
      console.error('Error al desencriptar:', error);
      throw new Error('Error en la desencriptación de la referencia');
    }
  }

  /**
   * Crear transacción de pago
   */
  static async crearTransaccion(datosReserva) {
    const config = this.getConfig();
    
    const {
      id_reserva,
      total,
      descripcion,
      numero_habitacion,
      tipo_habitacion
    } = datosReserva;

    // Encriptar el ID de la reserva
    const referenciaEncriptada = this.encriptarReferencia(id_reserva);

    // Preparar descripción (máximo 200 caracteres)
    let desc = descripcion || `Reserva #${id_reserva} - ${tipo_habitacion} Hab. ${numero_habitacion}`;
    if (desc.length > 200) {
      desc = desc.substring(0, 185) + ' - Hostal Suri';
    }

    // Preparar el payload según la estructura de Red Enlace
    const payload = {
      username: config.username,
      account_id: config.account_id,
      key_webservice: config.key_webservice,
      reference: referenciaEncriptada,
      currency: 'BOB',
      value: parseFloat(total).toFixed(2),
      iva: '0',
      value_base_iva: '0',
      description: desc,
      url_back: config.url_back,
      url_redirect: `${config.url_redirect}?reserva=${id_reserva}`
    };

    console.log('📤 Enviando petición a Red Enlace:', {
      url: config.url,
      payload: { ...payload, key_webservice: '***OCULTO***' }
    });

    try {
      const response = await axios.post(config.url, payload, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 30000 // 30 segundos
      });

      console.log('✅ Respuesta de Red Enlace:', response.data);

      // Verificar si hay un link en la respuesta
      if (response.data && response.data.link) {
        return {
          success: true,
          paymentUrl: response.data.link,
          reference: referenciaEncriptada,
          data: response.data
        };
      }

      // Si hay un mensaje de error
      if (response.data && response.data.message) {
        throw new Error(response.data.message);
      }

      throw new Error('Respuesta inválida de Red Enlace');

    } catch (error) {
      console.error('❌ Error al crear transacción:', error);
      
      if (error.response) {
        console.error('Datos del error:', error.response.data);
        const mensaje = error.response.data.message || 'Error al procesar el pago';
        throw new Error(mensaje);
      }
      
      if (error.code === 'ECONNABORTED') {
        throw new Error('Tiempo de espera agotado. Por favor, intente nuevamente.');
      }
      
      throw new Error(error.message || 'Error de conexión con Red Enlace');
    }
  }

  /**
   * Procesar confirmación del webhook
   */
  static procesarConfirmacion(datosWebhook) {
    const { reference, response } = datosWebhook;

    // Desencriptar la referencia para obtener el ID de reserva
    const reservaId = this.desencriptarReferencia(reference);

    // Determinar el estado según la respuesta
    let estadoPago = 'pendiente';
    let estadoReserva = 'pendiente';

    if (response === 'Aprobada') {
      estadoPago = 'aprobado';
      estadoReserva = 'confirmada';
    } else if (response === 'Rechazada') {
      estadoPago = 'rechazado';
      estadoReserva = 'pendiente'; // Mantener pendiente para que el usuario intente de nuevo
    } else {
      estadoPago = 'fallido';
      estadoReserva = 'pendiente';
    }

    return {
      id_reserva: reservaId,
      estado_pago: estadoPago,
      estado_reserva: estadoReserva,
      respuesta_original: response
    };
  }
}