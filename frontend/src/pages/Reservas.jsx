import { useState, useEffect } from 'react';
import { obtenerTodasReservas, actualizarEstadoReserva, eliminarReserva } from '../services/reserva';

const Reservas = () => {
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todas');
  const [busqueda, setBusqueda] = useState('');
  const [reservaSeleccionada, setReservaSeleccionada] = useState(null);
  const [mostrarModalEstado, setMostrarModalEstado] = useState(false);

  useEffect(() => {
    cargarReservas();
  }, []);

  const cargarReservas = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await obtenerTodasReservas();
      setReservas(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar reservas');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCambiarEstado = async (id, nuevoEstado) => {
    if (!window.confirm(`¿Confirmar cambio de estado a "${nuevoEstado}"?`)) {
      return;
    }

    try {
      await actualizarEstadoReserva(id, nuevoEstado);
      alert('Estado actualizado exitosamente');
      cargarReservas();
      setMostrarModalEstado(false);
      setReservaSeleccionada(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Error al actualizar estado');
    }
  };

  const handleEliminarReserva = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar esta reserva? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      await eliminarReserva(id);
      alert('Reserva eliminada exitosamente');
      cargarReservas();
    } catch (err) {
      alert(err.response?.data?.message || 'Error al eliminar reserva');
    }
  };

  const getEstadoBadge = (estado) => {
    const badges = {
      pendiente: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      confirmada: 'bg-green-100 text-green-800 border-green-300',
      cancelada: 'bg-red-100 text-red-800 border-red-300',
      finalizada: 'bg-gray-100 text-gray-800 border-gray-300'
    };
    
    const iconos = {
      pendiente: '⏳',
      confirmada: '✅',
      cancelada: '❌',
      finalizada: '🏁'
    };

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border-2 ${badges[estado]}`}>
        <span className="mr-1">{iconos[estado]}</span>
        {estado.toUpperCase()}
      </span>
    );
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const calcularNoches = (entrada, salida) => {
    const diff = new Date(salida) - new Date(entrada);
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  // Filtrar reservas
  const reservasFiltradas = reservas.filter(reserva => {
    const cumpleFiltroEstado = filtroEstado === 'todas' || reserva.estado === filtroEstado;
    const cumpleBusqueda = 
      reserva.numero_habitacion?.toLowerCase().includes(busqueda.toLowerCase()) ||
      reserva.nombre_cliente?.toLowerCase().includes(busqueda.toLowerCase()) ||
      reserva.ci_cliente?.includes(busqueda) ||
      reserva.id_reserva.toString().includes(busqueda);
    
    return cumpleFiltroEstado && cumpleBusqueda;
  });

  // Estadísticas
  const stats = {
    total: reservas.length,
    pendientes: reservas.filter(r => r.estado === 'pendiente').length,
    confirmadas: reservas.filter(r => r.estado === 'confirmada').length,
    canceladas: reservas.filter(r => r.estado === 'cancelada').length,
    finalizadas: reservas.filter(r => r.estado === 'finalizada').length
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestión de Reservas</h1>
        <p className="text-gray-600">Administra todas las reservas del hostal</p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-md p-4 border-l-4 border-blue-500">
          <p className="text-sm text-gray-600 font-medium">Total</p>
          <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-4 border-l-4 border-yellow-500">
          <p className="text-sm text-gray-600 font-medium">Pendientes</p>
          <p className="text-3xl font-bold text-yellow-600">{stats.pendientes}</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-4 border-l-4 border-green-500">
          <p className="text-sm text-gray-600 font-medium">Confirmadas</p>
          <p className="text-3xl font-bold text-green-600">{stats.confirmadas}</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-4 border-l-4 border-red-500">
          <p className="text-sm text-gray-600 font-medium">Canceladas</p>
          <p className="text-3xl font-bold text-red-600">{stats.canceladas}</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-4 border-l-4 border-gray-500">
          <p className="text-sm text-gray-600 font-medium">Finalizadas</p>
          <p className="text-3xl font-bold text-gray-600">{stats.finalizadas}</p>
        </div>
      </div>

      {/* Filtros y búsqueda */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <div className="grid md:grid-cols-2 gap-4">
          {/* Búsqueda */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Buscar
            </label>
            <input
              type="text"
              placeholder="Buscar por habitación, cliente, CI o ID..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filtro por estado */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Filtrar por estado
            </label>
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="todas">Todas las reservas</option>
              <option value="pendiente">Pendientes</option>
              <option value="confirmada">Confirmadas</option>
              <option value="cancelada">Canceladas</option>
              <option value="finalizada">Finalizadas</option>
            </select>
          </div>
        </div>
      </div>

      {/* Contenido */}
      {loading && (
        <div className="text-center py-20">
          <div className="inline-block w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600 font-medium">Cargando reservas...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 text-center">
          <p className="text-red-700 font-semibold mb-4">{error}</p>
          <button
            onClick={cargarReservas}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-semibold"
          >
            Reintentar
          </button>
        </div>
      )}

      {!loading && !error && (
        <>
          {reservasFiltradas.length > 0 ? (
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        ID
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Cliente
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Habitación
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Fechas
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Noches
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Total
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {reservasFiltradas.map((reserva) => {
                      const noches = calcularNoches(reserva.fecha_entrada, reserva.fecha_salida);
                      
                      return (
                        <tr key={reserva.id_reserva} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm font-bold text-gray-900">#{reserva.id_reserva}</span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm">
                              <p className="font-semibold text-gray-900">{reserva.nombre_cliente}</p>
                              {reserva.ci_cliente && (
                                <p className="text-gray-500">CI: {reserva.ci_cliente}</p>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <span className="text-2xl mr-2">🏨</span>
                              <div>
                                <p className="text-sm font-semibold text-gray-900">
                                  Hab. {reserva.numero_habitacion}
                                </p>
                                <p className="text-xs text-gray-500">{reserva.tipo_habitacion}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm">
                              <p className="text-gray-900">
                                <span className="font-semibold">Entrada:</span> {formatearFecha(reserva.fecha_entrada)}
                              </p>
                              <p className="text-gray-900">
                                <span className="font-semibold">Salida:</span> {formatearFecha(reserva.fecha_salida)}
                              </p>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm font-semibold text-gray-900">{noches}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm font-bold text-green-600">
                              Bs. {parseFloat(reserva.total).toFixed(2)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getEstadoBadge(reserva.estado)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-2">
                              {/* Cambiar estado */}
                              {reserva.estado !== 'cancelada' && reserva.estado !== 'finalizada' && (
                                <button
                                  onClick={() => {
                                    setReservaSeleccionada(reserva);
                                    setMostrarModalEstado(true);
                                  }}
                                  className="text-blue-600 hover:text-blue-800 font-semibold text-sm"
                                  title="Cambiar estado"
                                >
                                  ✏️
                                </button>
                              )}

                              {/* Eliminar */}
                              <button
                                onClick={() => handleEliminarReserva(reserva.id_reserva)}
                                className="text-red-600 hover:text-red-800 font-semibold text-sm"
                                title="Eliminar reserva"
                              >
                                🗑️
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-xl shadow-md">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                No se encontraron reservas
              </h3>
              <p className="text-gray-600">
                {filtroEstado !== 'todas' || busqueda
                  ? 'Intenta ajustar los filtros de búsqueda'
                  : 'Aún no hay reservas registradas'}
              </p>
            </div>
          )}
        </>
      )}

      {/* Modal cambiar estado */}
      {mostrarModalEstado && reservaSeleccionada && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Cambiar Estado - Reserva #{reservaSeleccionada.id_reserva}
            </h3>
            
            <div className="space-y-3 mb-6">
              <p className="text-sm text-gray-600">
                <span className="font-semibold">Cliente:</span> {reservaSeleccionada.nombre_cliente}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-semibold">Habitación:</span> {reservaSeleccionada.numero_habitacion}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-semibold">Estado actual:</span> {getEstadoBadge(reservaSeleccionada.estado)}
              </p>
            </div>

            <div className="space-y-3">
              {reservaSeleccionada.estado === 'pendiente' && (
                <button
                  onClick={() => handleCambiarEstado(reservaSeleccionada.id_reserva, 'confirmada')}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-semibold transition-all"
                >
                  ✅ Confirmar Reserva
                </button>
              )}

              {reservaSeleccionada.estado === 'confirmada' && (
                <button
                  onClick={() => handleCambiarEstado(reservaSeleccionada.id_reserva, 'finalizada')}
                  className="w-full bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-xl font-semibold transition-all"
                >
                  🏁 Marcar como Finalizada
                </button>
              )}

              {(reservaSeleccionada.estado === 'pendiente' || reservaSeleccionada.estado === 'confirmada') && (
                <button
                  onClick={() => handleCambiarEstado(reservaSeleccionada.id_reserva, 'cancelada')}
                  className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-semibold transition-all"
                >
                  ❌ Cancelar Reserva
                </button>
              )}

              <button
                onClick={() => {
                  setMostrarModalEstado(false);
                  setReservaSeleccionada(null);
                }}
                className="w-full border-2 border-gray-300 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-all"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reservas;