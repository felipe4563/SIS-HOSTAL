import { useState, useEffect } from 'react';
import { getHabitaciones } from '../services/habitacion';
import {
  getReportePorFechas,
  getHabitacionesMasReservadas,
  getDiasConMasReservas,
  getEstadisticasPorEstado,
  getReporteIngresos,
  getOcupacionPromedio
} from '../services/reportes';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { exportarReportePDF } from '../pages/reportes/exportarReportePDF';

const Reportes = () => {
  // Estados para filtros
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [habitacionSeleccionada, setHabitacionSeleccionada] = useState('');
  const [estadoSeleccionado, setEstadoSeleccionado] = useState('');
  
  // Estados para datos
  const [habitaciones, setHabitaciones] = useState([]);
  const [reporteGeneral, setReporteGeneral] = useState(null);
  const [habitacionesMasReservadas, setHabitacionesMasReservadas] = useState([]);
  const [diasMasReservas, setDiasMasReservas] = useState([]);
  const [estadisticasPorEstado, setEstadisticasPorEstado] = useState([]);
  const [reporteIngresos, setReporteIngresos] = useState(null);
  const [ocupacionPromedio, setOcupacionPromedio] = useState(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

  // 👇 Función helper para formatear fechas
  const formatearFecha = (fecha) => {
    if (!fecha) return '';
    
    // Si viene con timestamp, extraer solo la fecha
    if (typeof fecha === 'string' && fecha.includes('T')) {
      return fecha.split('T')[0];
    }
    
    // Si es un objeto Date o string sin T
    const date = new Date(fecha);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    cargarHabitaciones();
    // Establecer fechas por defecto (último mes)
    const hoy = new Date();
    const haceUnMes = new Date();
    haceUnMes.setMonth(haceUnMes.getMonth() - 1);
    
    setFechaFin(hoy.toISOString().split('T')[0]);
    setFechaInicio(haceUnMes.toISOString().split('T')[0]);
  }, []);

  const cargarHabitaciones = async () => {
    try {
      const data = await getHabitaciones();
      setHabitaciones(data);
    } catch (err) {
      console.error('Error al cargar habitaciones:', err);
    }
  };

  const generarReporte = async () => {
    if (!fechaInicio || !fechaFin) {
      setError('Por favor selecciona un rango de fechas');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const params = {
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin,
        ...(habitacionSeleccionada && { id_habitacion: habitacionSeleccionada }),
        ...(estadoSeleccionado && { estado: estadoSeleccionado })
      };

      const [general, habitacionesRes, dias, estadisticas, ingresos, ocupacion] = await Promise.all([
        getReportePorFechas(params),
        getHabitacionesMasReservadas({ fecha_inicio: fechaInicio, fecha_fin: fechaFin }),
        getDiasConMasReservas({ fecha_inicio: fechaInicio, fecha_fin: fechaFin }),
        getEstadisticasPorEstado({ fecha_inicio: fechaInicio, fecha_fin: fechaFin }),
        getReporteIngresos({ fecha_inicio: fechaInicio, fecha_fin: fechaFin }),
        getOcupacionPromedio({ fecha_inicio: fechaInicio, fecha_fin: fechaFin })
      ]);

      setReporteGeneral(general);
      setHabitacionesMasReservadas(habitacionesRes);
      setDiasMasReservas(dias);
      setEstadisticasPorEstado(estadisticas);
      setReporteIngresos(ingresos);
      setOcupacionPromedio(ocupacion);

    } catch (err) {
      console.error('Error al generar reporte:', err);
      setError('Error al generar el reporte');
    } finally {
      setLoading(false);
    }
  };

  const limpiarFiltros = () => {
    const hoy = new Date();
    const haceUnMes = new Date();
    haceUnMes.setMonth(haceUnMes.getMonth() - 1);
    
    setFechaInicio(haceUnMes.toISOString().split('T')[0]);
    setFechaFin(hoy.toISOString().split('T')[0]);
    setHabitacionSeleccionada('');
    setEstadoSeleccionado('');
    setReporteGeneral(null);
  };

  // 📄 Función para exportar PDF
  const handleExportarPDF = () => {
    if (!reporteGeneral) {
      alert('Primero debes generar un reporte');
      return;
    }

    try {
      exportarReportePDF(
        reporteGeneral,
        habitacionesMasReservadas,
        estadisticasPorEstado,
        diasMasReservas,
        fechaInicio,
        fechaFin
      );
    } catch (error) {
      console.error('Error al exportar PDF:', error);
      alert('Error al generar el PDF');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">📊 Reportes y Análisis</h1>
          <p className="text-gray-600">Genera reportes detallados de reservas e ingresos</p>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Filtros de Búsqueda</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Fecha Inicio */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Fecha Inicio
              </label>
              <input
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500"
              />
            </div>

            {/* Fecha Fin */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Fecha Fin
              </label>
              <input
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500"
              />
            </div>

            {/* Habitación */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Habitación (opcional)
              </label>
              <select
                value={habitacionSeleccionada}
                onChange={(e) => setHabitacionSeleccionada(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500"
              >
                <option value="">Todas las habitaciones</option>
                {habitaciones.map((hab) => (
                  <option key={hab.id_habitacion} value={hab.id_habitacion}>
                    Habitación {hab.numero} - {hab.tipo.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* Estado */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Estado (opcional)
              </label>
              <select
                value={estadoSeleccionado}
                onChange={(e) => setEstadoSeleccionado(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500"
              >
                <option value="">Todos los estados</option>
                <option value="pendiente">Pendiente</option>
                <option value="confirmada">Confirmada</option>
                <option value="cancelada">Cancelada</option>
                <option value="finalizada">Finalizada</option>
              </select>
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-4">
            <button
              onClick={generarReporte}
              disabled={loading || !fechaInicio || !fechaFin}
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Generando...' : '📊 Generar Reporte'}
            </button>
            
            {/* Botón Exportar PDF */}
            {reporteGeneral && (
              <button
                onClick={handleExportarPDF}
                className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl font-semibold transition-all shadow-md hover:shadow-lg flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Exportar PDF
              </button>
            )}
            
            <button
              onClick={limpiarFiltros}
              className="px-6 py-3 border-2 border-gray-300 rounded-xl font-semibold hover:bg-gray-50 transition-all"
            >
              Limpiar Filtros
            </button>
          </div>

          {error && (
            <div className="mt-4 bg-red-50 border-2 border-red-200 rounded-xl p-4 text-red-700">
              {error}
            </div>
          )}
        </div>

        {/* Resultados */}
        {reporteGeneral && (
          <>
            {/* Resumen General */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
                <div className="text-4xl mb-2">📅</div>
                <p className="text-blue-100 text-sm mb-1">Total Reservas</p>
                <p className="text-3xl font-bold">{reporteGeneral.resumen.total_reservas}</p>
              </div>

              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg">
                <div className="text-4xl mb-2">💰</div>
                <p className="text-green-100 text-sm mb-1">Ingresos Totales</p>
                <p className="text-3xl font-bold">Bs. {reporteGeneral.resumen.total_ingresos}</p>
              </div>

              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
                <div className="text-4xl mb-2">🌙</div>
                <p className="text-purple-100 text-sm mb-1">Total Noches</p>
                <p className="text-3xl font-bold">{reporteGeneral.resumen.total_noches}</p>
              </div>

              <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl p-6 text-white shadow-lg">
                <div className="text-4xl mb-2">📊</div>
                <p className="text-amber-100 text-sm mb-1">Ingreso Promedio</p>
                <p className="text-3xl font-bold">Bs. {reporteGeneral.resumen.ingreso_promedio}</p>
              </div>
            </div>

            {/* Gráficas */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Días con más reservas */}
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <h3 className="text-xl font-bold text-gray-900 mb-4">📅 Días con Más Reservas</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={diasMasReservas.slice(0, 10)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="fecha" angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="total_reservas" fill="#3B82F6" name="Reservas" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Estadísticas por Estado */}
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <h3 className="text-xl font-bold text-gray-900 mb-4">📊 Reservas por Estado</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={estadisticasPorEstado}
                      dataKey="cantidad"
                      nameKey="estado"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label
                    >
                      {estadisticasPorEstado.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Habitaciones Más Reservadas */}
            <div className="bg-white rounded-2xl p-6 shadow-lg mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">🏨 Top 10 Habitaciones Más Reservadas</h3>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={habitacionesMasReservadas.slice(0, 10)} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="numero" width={80} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="total_reservas" fill="#8B5CF6" name="Reservas" />
                  <Bar dataKey="ingresos_generados" fill="#10B981" name="Ingresos (Bs.)" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Ocupación Promedio */}
            {ocupacionPromedio && (
              <div className="bg-white rounded-2xl p-6 shadow-lg mb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">📈 Ocupación Diaria</h3>
                <div className="mb-4 p-4 bg-blue-50 rounded-xl">
                  <p className="text-sm text-gray-600">Ocupación Promedio</p>
                  <p className="text-3xl font-bold text-blue-600">{ocupacionPromedio.resumen.promedio_ocupacion}</p>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={ocupacionPromedio.ocupacion_diaria}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="fecha" angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="porcentaje_ocupacion" stroke="#3B82F6" strokeWidth={2} name="% Ocupación" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Tabla de Reservas */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-4">📋 Detalle de Reservas</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Hab.</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Cliente</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Fecha Entrada</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Fecha Salida</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Noches</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Total</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {reporteGeneral.reservas.map((reserva) => (
                      <tr key={reserva.id_reserva} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium">{reserva.numero_habitacion}</td>
                        <td className="px-4 py-3 text-sm">{reserva.cliente_nombre} {reserva.cliente_apellido}</td>
                        
                        {/* 👇 USAR LA FUNCIÓN HELPER */}
                        <td className="px-4 py-3 text-sm">{formatearFecha(reserva.fecha_entrada)}</td>
                        <td className="px-4 py-3 text-sm">{formatearFecha(reserva.fecha_salida)}</td>
                        
                        <td className="px-4 py-3 text-sm">{reserva.noches}</td>
                        <td className="px-4 py-3 text-sm font-semibold">Bs. {parseFloat(reserva.total).toFixed(2)}</td>
                        <td className="px-4 py-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            reserva.estado === 'confirmada' ? 'bg-green-100 text-green-700' :
                            reserva.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-700' :
                            reserva.estado === 'cancelada' ? 'bg-red-100 text-red-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {reserva.estado}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* Mensaje cuando no hay reporte */}
        {!reporteGeneral && !loading && (
          <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-12 text-center">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              Selecciona un rango de fechas
            </h3>
            <p className="text-gray-600">
              Elige las fechas y opcionalmente filtra por habitación o estado para generar tu reporte
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reportes;