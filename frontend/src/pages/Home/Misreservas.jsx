import { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext.jsx';
import { obtenerMisReservas, cancelarReserva } from '../../services/reserva.js';

const MisReservas = () => {
  const { usuario } = useContext(AuthContext);
  const navigate = useNavigate();
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reservaCancelar, setReservaCancelar] = useState(null);
  const API_BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:4000';

  useEffect(() => {
    // Verificar que sea un cliente
    if (!usuario || usuario.tipo !== 'cliente') {
      navigate('/');
      return;
    }

    cargarReservas();
  }, [usuario, navigate]);

  const cargarReservas = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await obtenerMisReservas();
      setReservas(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar reservas');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelarReserva = async (id) => {
    if (!window.confirm('¿Estás seguro de que deseas cancelar esta reserva?')) {
      return;
    }

    try {
      await cancelarReserva(id);
      alert('Reserva cancelada exitosamente');
      cargarReservas();
      setReservaCancelar(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Error al cancelar la reserva');
    }
  };

  const getEstadoBadge = (estado) => {
    const badges = {
      pendiente: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      confirmada: 'bg-green-100 text-green-800 border-green-200',
      cancelada: 'bg-red-100 text-red-800 border-red-200',
      finalizada: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    
    const iconos = {
      pendiente: '⏳',
      confirmada: '✅',
      cancelada: '❌',
      finalizada: '🏁'
    };

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border ${badges[estado]}`}>
        <span className="mr-1">{iconos[estado]}</span>
        {estado.charAt(0).toUpperCase() + estado.slice(1)}
      </span>
    );
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calcularNoches = (entrada, salida) => {
    const diff = new Date(salida) - new Date(entrada);
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  if (!usuario || usuario.tipo !== 'cliente') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-amber-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-between">
            <div>
              <Link 
                to="/" 
                className="inline-flex items-center text-blue-100 hover:text-white transition-colors mb-4"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Volver al inicio
              </Link>
              <h1 className="text-4xl font-extrabold mb-2">Mis Reservas</h1>
              <p className="text-blue-100">Gestiona todas tus reservas en Hostal Suri</p>
            </div>
            <div className="hidden md:flex items-center space-x-3 bg-white/10 backdrop-blur-sm rounded-xl px-6 py-4">
              <span className="text-3xl">👤</span>
              <div>
                <p className="font-semibold">{usuario.nombre} {usuario.apellido}</p>
                <p className="text-sm text-blue-200">{usuario.correo}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading && (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600 font-medium">Cargando reservas...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 text-center">
            <div className="text-4xl mb-4">⚠️</div>
            <p className="text-red-700 font-semibold mb-4">{error}</p>
            <button
              onClick={cargarReservas}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-semibold transition-all"
            >
              Reintentar
            </button>
          </div>
        )}

        {!loading && !error && (
          <>
            {reservas.length > 0 ? (
              <div className="grid gap-6">
                {reservas.map((reserva) => {
                  const noches = calcularNoches(reserva.fecha_entrada, reserva.fecha_salida);
                  const precioPorNoche = reserva.total / noches;

                  return (
                    <div
                      key={reserva.id_reserva}
                      className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100"
                    >
                      <div className="md:flex">
                        {/* Imagen de la habitación */}
                        <div className="md:w-1/3 relative">
                          <div className="h-64 md:h-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                            <div className="text-center text-white">
                              <span className="text-6xl mb-2 block">🏨</span>
                              <p className="text-2xl font-bold">Hab. {reserva.numero_habitacion}</p>
                              <p className="text-blue-100">{reserva.tipo_habitacion}</p>
                            </div>
                          </div>
                          <div className="absolute top-4 right-4">
                            {getEstadoBadge(reserva.estado)}
                          </div>
                        </div>

                        {/* Detalles */}
                        <div className="md:w-2/3 p-6 md:p-8">
                          <div className="flex justify-between items-start mb-6">
                            <div>
                              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                {reserva.tipo_habitacion} - Habitación {reserva.numero_habitacion}
                              </h3>
                              <p className="text-gray-500 text-sm">
                                Reserva #{reserva.id_reserva}
                              </p>
                            </div>
                          </div>

                          <div className="grid md:grid-cols-2 gap-6 mb-6">
                            {/* Fechas */}
                            <div className="space-y-3">
                              <div className="flex items-center text-gray-700">
                                <span className="text-2xl mr-3">📅</span>
                                <div>
                                  <p className="text-xs text-gray-500 font-semibold">Check-in</p>
                                  <p className="font-semibold">{formatearFecha(reserva.fecha_entrada)}</p>
                                </div>
                              </div>
                              <div className="flex items-center text-gray-700">
                                <span className="text-2xl mr-3">📅</span>
                                <div>
                                  <p className="text-xs text-gray-500 font-semibold">Check-out</p>
                                  <p className="font-semibold">{formatearFecha(reserva.fecha_salida)}</p>
                                </div>
                              </div>
                            </div>

                            {/* Detalles de precio */}
                            <div className="bg-blue-50 rounded-xl p-4">
                              <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-600">Noches:</span>
                                  <span className="font-semibold text-gray-900">{noches}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-600">Precio por noche:</span>
                                  <span className="font-semibold text-gray-900">Bs. {precioPorNoche.toFixed(2)}</span>
                                </div>
                                <div className="border-t border-blue-200 pt-2 flex justify-between">
                                  <span className="font-bold text-gray-900">Total:</span>
                                  <span className="font-bold text-blue-600 text-xl">Bs. {reserva.total}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Acciones */}
                          <div className="flex flex-wrap gap-3">
                            {reserva.estado === 'pendiente' && (
                              <button
                                onClick={() => handleCancelarReserva(reserva.id_reserva)}
                                className="flex-1 sm:flex-none bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg"
                              >
                                Cancelar Reserva
                              </button>
                            )}
                            {reserva.estado === 'confirmada' && (
                              <div className="flex-1 bg-green-50 border border-green-200 rounded-xl px-4 py-3 flex items-center">
                                <span className="text-2xl mr-3">✅</span>
                                <div>
                                  <p className="text-sm font-semibold text-green-800">Reserva Confirmada</p>
                                  <p className="text-xs text-green-600">¡Te esperamos!</p>
                                </div>
                              </div>
                            )}
                            {reserva.estado === 'cancelada' && (
                              <div className="flex-1 bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center">
                                <span className="text-2xl mr-3">❌</span>
                                <p className="text-sm font-semibold text-red-800">Esta reserva fue cancelada</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="text-6xl mb-6">📋</div>
                <h3 className="text-3xl font-bold text-gray-900 mb-3">
                  No tienes reservas aún
                </h3>
                <p className="text-gray-600 mb-8 text-lg">
                  ¡Explora nuestras habitaciones y haz tu primera reserva!
                </p>
                <Link
                  to="/"
                  className="inline-flex items-center bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-4 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  <span className="mr-2">🏨</span>
                  Ver Habitaciones
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MisReservas;