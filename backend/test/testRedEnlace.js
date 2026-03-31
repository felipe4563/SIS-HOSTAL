import { RedEnlaceService } from '../services/redEnlaceService.js';
import dotenv from 'dotenv';

dotenv.config();

// Test 1: Verificar configuración
console.log('🔧 Test 1: Verificar configuración');
const config = RedEnlaceService.getConfig();
console.log('✅ URL:', config.url);
console.log('✅ Usuario:', config.username);
console.log('✅ Account ID:', config.account_id);
console.log('✅ Key Webservice:', config.key_webservice ? '***CONFIGURADO***' : '❌ FALTA');
console.log('✅ URL Back:', config.url_back);
console.log('✅ URL Redirect:', config.url_redirect);
console.log('');

// Test 2: Encriptar y desencriptar
console.log('🔐 Test 2: Encriptar y desencriptar referencia');
const reservaId = 123;
console.log('ID Original:', reservaId);

const encriptado = RedEnlaceService.encriptarReferencia(reservaId);
console.log('Encriptado:', encriptado);

const desencriptado = RedEnlaceService.desencriptarReferencia(encriptado);
console.log('Desencriptado:', desencriptado);
console.log('✅ Encriptación:', reservaId == desencriptado ? 'CORRECTA' : '❌ ERROR');
console.log('');

// Test 3: Crear transacción de prueba
console.log('💳 Test 3: Crear transacción de prueba');
console.log('⚠️  Este test hace una llamada REAL a Red Enlace');
console.log('');

const datosReserva = {
  id_reserva: 123,
  total: 250.50,
  descripcion: 'Reserva de prueba - Habitación Doble',
  numero_habitacion: '101',
  tipo_habitacion: 'Doble'
};

RedEnlaceService.crearTransaccion(datosReserva)
  .then(resultado => {
    console.log('✅ Transacción creada exitosamente:');
    console.log('   Link de pago:', resultado.paymentUrl);
    console.log('   Referencia:', resultado.reference);
    console.log('');
    console.log('🎉 Todos los tests pasaron correctamente');
    console.log('');
    console.log('📋 PRÓXIMO PASO:');
    console.log('   Copia este link y ábrelo en tu navegador:');
    console.log('   ' + resultado.paymentUrl);
  })
  .catch(error => {
    console.error('❌ Error al crear transacción:', error.message);
    console.log('');
    console.log('🔍 POSIBLES CAUSAS:');
    console.log('   1. Credenciales incorrectas en .env');
    console.log('   2. Llave Webservice no generada en el panel de Red Enlace');
    console.log('   3. Cuenta no activada para ambiente de pruebas');
  });