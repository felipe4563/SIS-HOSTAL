import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { verificarDisponibilidad } from '../../services/habitacion';
import { crearReserva } from '../../services/reserva';

const ModalReserva = ({ habitacion, onClose, onSuccess }) => {
  const { usuario } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [fechaEntrada, setFechaEntrada] = useState('');
  const [fechaSalida, setFechaSalida] = useState('');
  const [dias, setDias] = useState(0);
  const [total, setTotal] = useState(0);
  const [disponible, setDisponible] = useState(null);
  const [verificando, setVerificando] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Calcular días y total cuando cambien las fechas
  useEffect(() => {
    if (fechaEntrada && fechaSalida) {
      const entrada = new Date(fechaEntrada);
      const salida = new Date(fechaSalida);
      const diferencia = Math.ceil((salida - entrada) / (1000 * 60 * 60 * 24));
      
      if (diferencia > 0) {
        setDias(diferencia);
        setTotal(diferencia * habitacion.precio_total);
      } else {
        setDias(0);
        setTotal(0);
      }
    }
  }, [fechaEntrada, fechaSalida, habitacion.precio_total]);

  // Verificar disponibilidad cuando se seleccionen ambas fechas
  const handleVerificarDisponibilidad = async () => {
    if (!fechaEntrada || !fechaSalida) return;
    
    setVerificando(true);
    setError('');
    
    try {
      const resultado = await verificarDisponibilidad(
        habitacion.id_habitacion,
        fechaEntrada,
        fechaSalida
      );
      setDisponible(resultado.disponible);
    } catch (err) {
      setError('Error al verificar disponibilidad');
      console.error(err);
    } finally {
      setVerificando(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validaciones
    if (!fechaEntrada || !fechaSalida) {
      setError('Por favor selecciona las fechas');
      return;
    }

    if (dias <= 0) {
      setError('La fecha de salida debe ser posterior a la de entrada');
      return;
    }

    // Si NO está logueado, guardar en sessionStorage y redirigir
    if (!usuario) {
      sessionStorage.setItem('reservaPendiente', JSON.stringify({
        id_habitacion: habitacion.id_habitacion,
        numero_habitacion: habitacion.numero,
        fecha_entrada: fechaEntrada,
        fecha_salida: fechaSalida,
        total: total
      }));
      
      alert('Debes iniciar sesión para completar la reserva');
      navigate('/login-cliente');
      return;
    }

    // 👇 CORRECCIÓN: Verificar si es cliente y obtener id_cliente
    const idCliente = usuario.id_cliente;
    
    if (!idCliente) {
      setError('Error: No se encontró la información del cliente');
      console.error('Usuario sin id_cliente:', usuario);
      return;
    }

    // Si SÍ está logueado, crear la reserva
    setLoading(true);
    setError('');

    try {
      console.log('Creando reserva con datos:', {
        id_cliente: idCliente,
        id_habitacion: habitacion.id_habitacion,
        fecha_entrada: fechaEntrada,
        fecha_salida: fechaSalida,
        total: total
      });

      await crearReserva({
        id_cliente: idCliente,
        id_habitacion: habitacion.id_habitacion,
        fecha_entrada: fechaEntrada,
        fecha_salida: fechaSalida,
        total: total
      });

      alert('¡Reserva creada exitosamente!');
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error completo:', err);
      setError(err.response?.data?.message || 'Error al crear la reserva');
    } finally {
      setLoading(false);
    }
  };

  // Fecha mínima = hoy
  const fechaMinima = new Date().toISOString().split('T')[0];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-2xl">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold mb-2">
                Reservar Habitación {habitacion.numero}
              </h2>
              <p className="text-blue-100">
                {habitacion.tipo.nombre} • Bs. {habitacion.precio_total}/noche
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Contenido */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Mostrar info del usuario logueado (debug) */}
          {usuario && (
            <div className="bg-blue-50 rounded-lg p-3 text-sm">
              <p className="text-blue-800">
                👤 <strong>{usuario.nombre} {usuario.apellido}</strong>
              </p>
              <p className="text-blue-600 text-xs">
                {usuario.correo}
              </p>
            </div>
          )}

          {/* Fecha de entrada */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Fecha de entrada
            </label>
            <input
              type="date"
              value={fechaEntrada}
              onChange={(e) => setFechaEntrada(e.target.value)}
              onBlur={handleVerificarDisponibilidad}
              min={fechaMinima}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Fecha de salida */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Fecha de salida
            </label>
            <input
              type="date"
              value={fechaSalida}
              onChange={(e) => setFechaSalida(e.target.value)}
              onBlur={handleVerificarDisponibilidad}
              min={fechaEntrada || fechaMinima}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Información de la reserva */}
          {dias > 0 && (
            <div className="bg-blue-50 rounded-xl p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-700">Noches:</span>
                <span className="font-semibold text-gray-900">{dias}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-700">Precio por noche:</span>
                <span className="font-semibold text-gray-900">Bs. {habitacion.precio_total}</span>
              </div>
              <div className="border-t border-blue-200 pt-2 mt-2 flex justify-between">
                <span className="font-bold text-gray-900">Total:</span>
                <span className="font-bold text-blue-600 text-xl">Bs. {total.toFixed(2)}</span>
              </div>
            </div>
          )}

          {/* Estado de disponibilidad */}
          {verificando && (
            <div className="text-center py-2">
              <div className="inline-block w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm text-gray-600 mt-2">Verificando disponibilidad...</p>
            </div>
          )}

          {disponible !== null && !verificando && (
            <div className={`rounded-lg p-4 ${
              disponible 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              <div className="flex items-center space-x-2">
                <span className="text-2xl">{disponible ? '✅' : '❌'}</span>
                <span className={`font-semibold ${
                  disponible ? 'text-green-700' : 'text-red-700'
                }`}>
                  {disponible 
                    ? 'Habitación disponible para estas fechas' 
                    : 'No disponible para estas fechas'}
                </span>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700 text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Botones */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || disponible === false || dias <= 0}
              className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all ${
                loading || disponible === false || dias <= 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md hover:shadow-lg'
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                  Procesando...
                </span>
              ) : !usuario ? (
                'Continuar con Login'
              ) : (
                'Confirmar Reserva'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalReserva;