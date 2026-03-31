import { useState } from 'react';
import { iniciarPago } from '../../services/pago';

const ModalPreparacionPago = ({ reserva, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleProcederPago = async () => {
    setLoading(true);
    setError('');

    try {
      // Crear transacción en Red Enlace
      const resultado = await iniciarPago(reserva.id_reserva);
      
      if (resultado.success && resultado.paymentUrl) {
        // Guardar info para cuando regrese
        sessionStorage.setItem('pago_pendiente', JSON.stringify({
          id_reserva: reserva.id_reserva,
          id_pago: resultado.id_pago,
          timestamp: new Date().getTime()
        }));

        // Redirigir a Red Enlace
        window.location.href = resultado.paymentUrl;
      } else {
        setError('No se pudo iniciar el proceso de pago');
      }
    } catch (err) {
      console.error('Error:', err);
      setError(err.response?.data?.message || 'Error al procesar el pago');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-white p-8">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-5xl mb-3">💳</div>
              <h2 className="text-3xl font-bold mb-2">Proceder al Pago</h2>
              <p className="text-green-100">
                Completa tu reserva de forma segura
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-all"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Contenido */}
        <div className="p-8">
          {/* Resumen */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 mb-6 border border-blue-200">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Resumen de la reserva
            </h3>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Habitación</span>
                <span className="font-semibold text-gray-900">
                  {reserva.tipo_habitacion} - #{reserva.numero_habitacion}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Check-in</span>
                <span className="font-semibold text-gray-900">
                  {new Date(reserva.fecha_entrada).toLocaleDateString('es-ES')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Check-out</span>
                <span className="font-semibold text-gray-900">
                  {new Date(reserva.fecha_salida).toLocaleDateString('es-ES')}
                </span>
              </div>
              <div className="border-t-2 border-blue-200 pt-3 flex justify-between">
                <span className="font-bold text-gray-900 text-lg">Total a pagar</span>
                <span className="font-bold text-blue-600 text-2xl">Bs. {reserva.total}</span>
              </div>
            </div>
          </div>

          {/* Métodos disponibles */}
          <div className="bg-purple-50 rounded-2xl p-6 mb-6 border border-purple-200">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Opciones de pago disponibles
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center mr-3">
                  <span className="text-xl">📱</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Pago con QR</p>
                  <p className="text-sm text-gray-600">Tigo Money, BNB, Banco Unión, QR PIX</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                  <span className="text-xl">💳</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Tarjeta de débito/crédito</p>
                  <p className="text-sm text-gray-600">Visa, Mastercard, American Express</p>
                </div>
              </div>
            </div>
          </div>

          {/* Seguridad */}
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
            <div className="flex items-start">
              <svg className="w-6 h-6 text-green-600 mr-3 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <div>
                <p className="text-sm font-semibold text-green-900 mb-1">
                  🔒 Pago 100% Seguro
                </p>
                <p className="text-xs text-green-700">
                  Serás redirigido a nuestra pasarela de pagos segura Red Enlace. 
                  Todos los datos están protegidos con encriptación bancaria.
                </p>
              </div>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
              <p className="text-red-700 text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Botones */}
          <div className="flex gap-4">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleProcederPago}
              disabled={loading}
              className="flex-1 px-6 py-4 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 hover:from-green-700 hover:via-emerald-700 hover:to-teal-700 text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="w-5 h-5 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Preparando...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                  Ir a Pasarela de Pago
                </span>
              )}
            </button>
          </div>

          {/* Nota */}
          <p className="text-xs text-gray-500 text-center mt-4">
            Al continuar, aceptas nuestros términos y condiciones
          </p>
        </div>
      </div>
    </div>
  );
};

export default ModalPreparacionPago;