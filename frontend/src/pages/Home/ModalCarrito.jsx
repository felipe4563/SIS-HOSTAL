import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { useCarrito } from '../../context/CarritoContext';
import { crearReservaMultiple } from '../../services/reserva'; // 👈 Nuevo servicio

const ModalCarrito = ({ onClose }) => {
  const { usuario } = useContext(AuthContext);
  const navigate = useNavigate();
  const { habitaciones, eliminarHabitacion, limpiarCarrito, calcularTotal } = useCarrito();

  const [fechaEntrada, setFechaEntrada] = useState('');
  const [fechaSalida, setFechaSalida] = useState('');
  const [dias, setDias] = useState(0);
  const [cantidadAdultos, setCantidadAdultos] = useState(1);
  const [cantidadNinos, setCantidadNinos] = useState(0);
  const [horaLlegada, setHoraLlegada] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const API_BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:4000';

  const construirUrlImagen = (ruta) => {
    if (!ruta) return 'https://placehold.co/100x100?text=Sin+Imagen';
    if (ruta.startsWith('http://') || ruta.startsWith('https://')) return ruta;
    return `${API_BASE_URL}/${ruta}`;
  };

  useEffect(() => {
    if (fechaEntrada && fechaSalida) {
      const entrada = new Date(fechaEntrada);
      const salida = new Date(fechaSalida);
      const diferencia = Math.ceil((salida - entrada) / (1000 * 60 * 60 * 24));
      setDias(diferencia > 0 ? diferencia : 0);
    }
  }, [fechaEntrada, fechaSalida]);

  const totalGeneral = dias > 0 ? calcularTotal(dias) : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!fechaEntrada || !fechaSalida) {
      setError('Por favor selecciona las fechas');
      return;
    }

    if (dias <= 0) {
      setError('La fecha de salida debe ser posterior a la de entrada');
      return;
    }

    if (!usuario) {
      alert('Debes iniciar sesión para completar la reserva');
      navigate('/login-cliente');
      return;
    }

    const idCliente = usuario.id_cliente;
    if (!idCliente) {
      setError('Error: No se encontró la información del cliente');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Preparar array de habitaciones para el backend
      const habitacionesData = habitaciones.map(hab => ({
        id_habitacion: hab.id_habitacion,
        precio: hab.precio_total * dias
      }));

      const response = await crearReservaMultiple({
        id_cliente: idCliente,
        habitaciones: habitacionesData,
        fecha_entrada: fechaEntrada,
        fecha_salida: fechaSalida,
        cantidad_adultos: cantidadAdultos,
        cantidad_ninos: cantidadNinos,
        hora_llegada: horaLlegada
      });

      alert(`✅ ${response.cantidad_reservas} reservas creadas exitosamente!`);
      limpiarCarrito();
      onClose();
      navigate('/mis-reservas');
    } catch (err) {
      console.error('Error:', err);
      setError(err.response?.data?.message || 'Error al crear las reservas');
    } finally {
      setLoading(false);
    }
  };

  const fechaMinima = new Date().toISOString().split('T')[0];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 text-white p-8">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-3xl font-bold mb-2">🛒 Tu Carrito de Reservas</h2>
              <p className="text-blue-100">
                {habitaciones.length} {habitaciones.length === 1 ? 'habitación seleccionada' : 'habitaciones seleccionadas'}
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

        <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto max-h-[calc(95vh-180px)]">
          
          {/* Lista de Habitaciones */}
          <div className="space-y-3">
            <h3 className="font-bold text-gray-900 text-lg mb-4">Habitaciones seleccionadas</h3>
            {habitaciones.map((hab) => {
              const imagenPortada = hab.imagenes?.find(img => img.es_portada) || hab.imagenes?.[0];
              return (
                <div key={hab.id_habitacion} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-blue-300 transition-all">
                  <img
                    src={construirUrlImagen(imagenPortada?.ruta)}
                    alt={`Habitación ${hab.numero}`}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900">Habitación {hab.numero}</h4>
                    <p className="text-sm text-gray-600">{hab.tipo.nombre}</p>
                    <p className="text-sm font-semibold text-blue-600">
                      Bs. {hab.precio_total}/noche
                      {dias > 0 && ` × ${dias} = Bs. ${(hab.precio_total * dias).toFixed(2)}`}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => eliminarHabitacion(hab.id_habitacion)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              );
            })}
          </div>

          {/* Usuario */}
          {usuario && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold mr-4">
                {usuario.nombre.charAt(0)}{usuario.apellido.charAt(0)}
              </div>
              <div>
                <p className="font-semibold text-gray-900">{usuario.nombre} {usuario.apellido}</p>
                <p className="text-sm text-gray-600">{usuario.correo}</p>
              </div>
            </div>
          )}

          {/* Fechas */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Fecha de entrada</label>
              <input
                type="date"
                value={fechaEntrada}
                onChange={(e) => setFechaEntrada(e.target.value)}
                min={fechaMinima}
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Fecha de salida</label>
              <input
                type="date"
                value={fechaSalida}
                onChange={(e) => setFechaSalida(e.target.value)}
                min={fechaEntrada || fechaMinima}
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Huéspedes */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-3">
            <h3 className="font-bold text-gray-900">Cantidad de huéspedes</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Adultos</label>
                <select
                  value={cantidadAdultos}
                  onChange={(e) => setCantidadAdultos(Number(e.target.value))}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500"
                >
                  {[1, 2, 3, 4, 5, 6].map(num => (
                    <option key={num} value={num}>{num}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Niños</label>
                <select
                  value={cantidadNinos}
                  onChange={(e) => setCantidadNinos(Number(e.target.value))}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500"
                >
                  {[0, 1, 2, 3, 4, 5].map(num => (
                    <option key={num} value={num}>{num}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Hora de llegada */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Hora estimada de llegada <span className="font-normal text-gray-500">(opcional)</span>
            </label>
            <input
              type="time"
              value={horaLlegada}
              onChange={(e) => setHoraLlegada(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500"
            />
          </div>

          {/* Resumen Total */}
          {dias > 0 && (
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 border-2 border-blue-200">
              <h3 className="font-bold text-gray-900 text-lg mb-4">💰 Resumen Total</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-700">Noches de estancia</span>
                  <span className="font-bold">{dias}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Habitaciones</span>
                  <span className="font-bold">{habitaciones.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Huéspedes</span>
                  <span className="font-bold">{cantidadAdultos + cantidadNinos}</span>
                </div>
                <div className="border-t-2 border-blue-300 pt-3 mt-3">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-lg">Total a pagar</span>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-blue-600">
                        Bs. {totalGeneral.toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-500">
                        ({dias} {dias === 1 ? 'noche' : 'noches'})
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 text-red-700">
              {error}
            </div>
          )}

          {/* Botones */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-4 border-2 border-gray-300 rounded-xl font-bold hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || dias <= 0 || habitaciones.length === 0}
              className={`flex-1 px-6 py-4 rounded-xl font-bold ${
                loading || dias <= 0 || habitaciones.length === 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-xl'
              }`}
            >
              {loading ? 'Procesando...' : `Confirmar ${habitaciones.length} Reserva${habitaciones.length > 1 ? 's' : ''}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalCarrito;