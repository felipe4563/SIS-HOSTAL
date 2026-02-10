import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { useCarrito } from '../../context/CarritoContext';
import { crearReservaMultiple } from '../../services/reserva';
import { calcularPrecioDinamicoMultiple } from '../../services/pricing'; // 👈 NUEVO

const ModalCarrito = ({ onClose }) => {
  const { usuario } = useContext(AuthContext);
  const navigate = useNavigate();
  const { habitaciones, eliminarHabitacion, limpiarCarrito } = useCarrito();

  const [fechaEntrada, setFechaEntrada] = useState('');
  const [fechaSalida, setFechaSalida] = useState('');
  const [cantidadAdultos, setCantidadAdultos] = useState(1);
  const [cantidadNinos, setCantidadNinos] = useState(0);
  const [horaLlegada, setHoraLlegada] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 🎯 Estados para pricing dinámico
  const [preciosDinamicos, setPreciosDinamicos] = useState([]);
  const [calculandoPrecios, setCalculandoPrecios] = useState(false);
  const [mostrarDetalles, setMostrarDetalles] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:4000';

  const construirUrlImagen = (ruta) => {
    if (!ruta) return 'https://placehold.co/100x100?text=Sin+Imagen';
    if (ruta.startsWith('http://') || ruta.startsWith('https://')) return ruta;
    return `${API_BASE_URL}/${ruta}`;
  };

  // 🎯 Calcular precios dinámicos cuando cambien las fechas
  useEffect(() => {
    const calcularPrecios = async () => {
      if (fechaEntrada && fechaSalida && habitaciones.length > 0) {
        try {
          setCalculandoPrecios(true);
          const precios = await calcularPrecioDinamicoMultiple(
            habitaciones,
            fechaEntrada,
            fechaSalida
          );
          setPreciosDinamicos(precios);
        } catch (err) {
          console.error('Error calculando precios:', err);
          setPreciosDinamicos([]);
        } finally {
          setCalculandoPrecios(false);
        }
      } else {
        setPreciosDinamicos([]);
      }
    };

    calcularPrecios();
  }, [fechaEntrada, fechaSalida, habitaciones]);

  // Calcular total con precios dinámicos
  const totalGeneral = preciosDinamicos.reduce(
    (sum, precio) => sum + precio.precio_total, 
    0
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!fechaEntrada || !fechaSalida) {
      setError('Por favor selecciona las fechas');
      return;
    }

    if (preciosDinamicos.length === 0 || preciosDinamicos[0]?.noches <= 0) {
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
      // 🎯 YA NO ENVIAMOS PRECIOS - el backend los calcula
      const habitacionesData = habitaciones.map(hab => ({
        id_habitacion: hab.id_habitacion
        // precio: SE ELIMINA - ahora lo calcula el backend
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
      console.log('Detalles:', response);
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

  // Función para obtener el color del ajuste
  const getAjusteColor = (valor) => {
    if (valor > 0) return 'text-red-600';
    if (valor < 0) return 'text-green-600';
    return 'text-gray-600';
  };

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
              <label className="block text-sm font-bold text-gray-700 mb-2">
                📅 Fecha de entrada
              </label>
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
              <label className="block text-sm font-bold text-gray-700 mb-2">
                📅 Fecha de salida
              </label>
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
            <h3 className="font-bold text-gray-900">👥 Cantidad de huéspedes</h3>
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
              ⏰ Hora estimada de llegada <span className="font-normal text-gray-500">(opcional)</span>
            </label>
            <input
              type="time"
              value={horaLlegada}
              onChange={(e) => setHoraLlegada(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500"
            />
          </div>

          {/* Loading de cálculo de precios */}
          {calculandoPrecios && (
            <div className="bg-blue-50 rounded-xl p-6 text-center border border-blue-200">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-3">
                <div className="w-6 h-6 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
              <p className="text-blue-900 font-semibold">Calculando precios dinámicos...</p>
            </div>
          )}

          {/* Lista de Habitaciones CON PRECIOS DINÁMICOS */}
          {!calculandoPrecios && preciosDinamicos.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900 text-lg">🏨 Habitaciones seleccionadas</h3>
                <button
                  type="button"
                  onClick={() => setMostrarDetalles(!mostrarDetalles)}
                  className="text-sm text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
                >
                  {mostrarDetalles ? 'Ocultar' : 'Ver'} detalles
                  <svg 
                    className={`w-4 h-4 transition-transform ${mostrarDetalles ? 'rotate-180' : ''}`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>

              {habitaciones.map((hab, index) => {
                const imagenPortada = hab.imagenes?.find(img => img.es_portada) || hab.imagenes?.[0];
                const precioDinamico = preciosDinamicos[index];

                return (
                  <div key={hab.id_habitacion} className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200 p-4">
                    <div className="flex items-center gap-4 mb-3">
                      <img
                        src={construirUrlImagen(imagenPortada?.ruta)}
                        alt={`Habitación ${hab.numero}`}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900">Habitación {hab.numero}</h4>
                        <p className="text-sm text-gray-600">{hab.tipo.nombre}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-500 line-through">
                            Bs. {precioDinamico?.precio_base}/noche
                          </span>
                          <span className="text-sm font-bold text-blue-600">
                            Bs. {precioDinamico?.precio_por_noche}/noche
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-blue-600">
                          Bs. {precioDinamico?.precio_total.toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-500">
                          ({precioDinamico?.noches} noches)
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

                    {/* Detalles de ajustes (expandible) */}
                    {mostrarDetalles && precioDinamico && (
                      <div className="mt-3 pt-3 border-t border-blue-300 bg-white/60 rounded-lg p-3 text-sm space-y-1">
                        <p className="text-xs font-bold text-gray-600 mb-2">AJUSTES APLICADOS:</p>
                        
                        {Object.entries(precioDinamico.ajustes).map(([key, value]) => {
                          if (key === 'total' || value === 0) return null;
                          
                          const labels = {
                            temporada: 'Temporada',
                            dia_semana: 'Día de semana',
                            anticipacion: `Anticipación (${precioDinamico.dias_anticipacion} días)`,
                            ocupacion: `Ocupación (${precioDinamico.ocupacion_actual}%)`,
                            duracion: 'Duración de estadía',
                            eventos: 'Eventos especiales'
                          };

                          return (
                            <div key={key} className="flex justify-between">
                              <span className="text-gray-600">• {labels[key]}</span>
                              <span className={`font-semibold ${getAjusteColor(value)}`}>
                                {value > 0 ? '+' : ''}{value}%
                              </span>
                            </div>
                          );
                        })}

                        <div className="flex justify-between pt-2 border-t border-gray-300">
                          <span className="font-bold text-gray-700">Ajuste total</span>
                          <span className={`font-bold ${getAjusteColor(precioDinamico.ajustes.total)}`}>
                            {precioDinamico.ajustes.total > 0 ? '+' : ''}{precioDinamico.ajustes.total}%
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Resumen Total CON PRICING DINÁMICO */}
          {preciosDinamicos.length > 0 && !calculandoPrecios && (
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border-2 border-green-200 shadow-lg">
              <h3 className="font-bold text-gray-900 text-lg mb-4 flex items-center">
                <svg className="w-6 h-6 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Resumen Total con Precio Inteligente
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-700">Noches de estancia</span>
                  <span className="font-bold">{preciosDinamicos[0]?.noches || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Habitaciones</span>
                  <span className="font-bold">{habitaciones.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Huéspedes</span>
                  <span className="font-bold">{cantidadAdultos + cantidadNinos}</span>
                </div>
                <div className="border-t-2 border-green-300 pt-3 mt-3">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-lg">Total a pagar</span>
                    <div className="text-right">
                      <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                        Bs. {totalGeneral.toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        ({preciosDinamicos[0]?.noches} noches × {habitaciones.length} habitaciones)
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 text-red-700 flex items-start">
              <svg className="w-6 h-6 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <p className="font-semibold">Error</p>
                <p className="text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Botones */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-4 border-2 border-gray-300 rounded-xl font-bold hover:bg-gray-50 transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || preciosDinamicos.length === 0 || habitaciones.length === 0 || calculandoPrecios}
              className={`flex-1 px-6 py-4 rounded-xl font-bold transition-all ${
                loading || preciosDinamicos.length === 0 || habitaciones.length === 0 || calculandoPrecios
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:shadow-xl hover:from-green-700 hover:to-emerald-700'
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="w-5 h-5 mr-3 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Procesando...
                </span>
              ) : (
                `✅ Confirmar ${habitaciones.length} Reserva${habitaciones.length > 1 ? 's' : ''} (Bs. ${totalGeneral.toFixed(2)})`
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalCarrito;