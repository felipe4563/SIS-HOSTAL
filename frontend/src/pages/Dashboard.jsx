import { useState, useEffect } from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import {
  getEstadisticasGenerales,
  getReservasPorEstado,
  getReservasPorPeriodo,
  getHabitacionesMasReservadas,
  getMetodosPago,
  getEstadoHabitaciones,
  getIngresosPorPeriodo
} from '../services/dashboard.js';

const Dashboard = () => {
  const [periodo, setPeriodo] = useState('mes'); // 👈 Estado para el filtro
  const [estadisticasGenerales, setEstadisticasGenerales] = useState(null);
  const [reservasPorEstado, setReservasPorEstado] = useState([]);
  const [reservasPorPeriodo, setReservasPorPeriodo] = useState([]);
  const [habitacionesMasReservadas, setHabitacionesMasReservadas] = useState([]);
  const [metodosPago, setMetodosPago] = useState([]);
  const [estadoHabitaciones, setEstadoHabitaciones] = useState([]);
  const [ingresosPorPeriodo, setIngresosPorPeriodo] = useState([]);
  const [loading, setLoading] = useState(true);

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

  useEffect(() => {
    cargarDatos();
  }, [periodo]); // 👈 Recargar cuando cambie el periodo

  const cargarDatos = async () => {
    try {
      setLoading(true);
      
      const [
        stats, 
        reservasEstado, 
        reservasPer, 
        habitaciones, 
        pagos, 
        estados, 
        ingresos
      ] = await Promise.all([
        getEstadisticasGenerales(periodo),
        getReservasPorEstado(periodo),
        getReservasPorPeriodo(periodo),
        getHabitacionesMasReservadas(periodo),
        getMetodosPago(periodo),
        getEstadoHabitaciones(),
        getIngresosPorPeriodo(periodo)
      ]);

      setEstadisticasGenerales(stats || null);
      setReservasPorEstado(reservasEstado || []);
      setReservasPorPeriodo(reservasPer || []);
      setHabitacionesMasReservadas(habitaciones || []);
      setMetodosPago(pagos || []);
      setEstadoHabitaciones(estados || []);
      setIngresosPorPeriodo(ingresos || []);
    } catch (error) {
      console.error('Error al cargar datos del dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  // 👇 Función para obtener el label del periodo
  const getPeriodoLabel = () => {
    const labels = {
      'semana': 'Última Semana',
      'mes': 'Este Mes',
      'año': 'Este Año'
    };
    return labels[periodo] || 'Este Mes';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header con filtros */}
        <div className="mb-6 md:mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">📊 Dashboard</h1>
              <p className="text-gray-600">Panel de control y estadísticas del hostal</p>
            </div>
            
            {/* 👇 FILTROS DE PERIODO */}
            <div className="flex gap-2">
              <button
                onClick={() => setPeriodo('semana')}
                className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                  periodo === 'semana'
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200'
                }`}
              >
                Semana
              </button>
              <button
                onClick={() => setPeriodo('mes')}
                className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                  periodo === 'mes'
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200'
                }`}
              >
                Mes
              </button>
              <button
                onClick={() => setPeriodo('año')}
                className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                  periodo === 'año'
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200'
                }`}
              >
                Año
              </button>
            </div>
          </div>

          {/* Mostrar periodo seleccionado */}
          {estadisticasGenerales && (
            <div className="mt-4 bg-blue-50 border-2 border-blue-200 rounded-xl p-3">
              <p className="text-sm text-blue-800">
                <span className="font-semibold">Periodo:</span> {getPeriodoLabel()} 
                {estadisticasGenerales.fechaInicio && estadisticasGenerales.fechaFin && (
                  <span className="ml-2">
                    ({new Date(estadisticasGenerales.fechaInicio).toLocaleDateString('es-ES')} - {new Date(estadisticasGenerales.fechaFin).toLocaleDateString('es-ES')})
                  </span>
                )}
              </p>
            </div>
          )}
        </div>

        {/* Tarjetas de estadísticas generales */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl md:rounded-2xl p-4 md:p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-3 md:mb-4">
              <div className="text-3xl md:text-4xl">📅</div>
              <div className="text-right">
                <p className="text-blue-100 text-sm">Total Reservas</p>
                <p className="text-2xl md:text-3xl font-bold">
                  {estadisticasGenerales?.totalReservas || 0}
                </p>
              </div>
            </div>
            <div className="text-blue-100 text-xs md:text-sm">
              {getPeriodoLabel()}
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl md:rounded-2xl p-4 md:p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-3 md:mb-4">
              <div className="text-3xl md:text-4xl">💰</div>
              <div className="text-right">
                <p className="text-green-100 text-sm">Ingresos</p>
                <p className="text-2xl md:text-3xl font-bold">
                  Bs. {(estadisticasGenerales?.ingresosPeriodo || 0).toLocaleString('es-BO', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
                </p>
              </div>
            </div>
            <div className="text-green-100 text-xs md:text-sm">
              {getPeriodoLabel()}
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl md:rounded-2xl p-4 md:p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-3 md:mb-4">
              <div className="text-3xl md:text-4xl">👥</div>
              <div className="text-right">
                <p className="text-purple-100 text-sm">Total Clientes</p>
                <p className="text-2xl md:text-3xl font-bold">
                  {estadisticasGenerales?.totalClientes || 0}
                </p>
              </div>
            </div>
            <div className="text-purple-100 text-xs md:text-sm">
              Clientes activos
            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl md:rounded-2xl p-4 md:p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-3 md:mb-4">
              <div className="text-3xl md:text-4xl">🏨</div>
              <div className="text-right">
                <p className="text-amber-100 text-sm">Tasa de Ocupación</p>
                <p className="text-2xl md:text-3xl font-bold">
                  {estadisticasGenerales?.tasaOcupacion || 0}%
                </p>
              </div>
            </div>
            <div className="text-amber-100 text-xs md:text-sm">
              {estadisticasGenerales?.habitacionesDisponibles || 0} de {estadisticasGenerales?.totalHabitaciones || 0} disponibles
            </div>
          </div>
        </div>

        {/* Gráficas principales */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
          {/* Reservas por Estado */}
          <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 shadow-lg">
            <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-4">
              Reservas por Estado - {getPeriodoLabel()}
            </h3>
            {reservasPorEstado.length > 0 ? (
              <div className="h-64 md:h-72 lg:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={reservasPorEstado}
                      dataKey="cantidad"
                      nameKey="estado"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={(entry) => `${entry.estado}: ${entry.cantidad}`}
                    >
                      {reservasPorEstado.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}-${entry.estado}`} 
                          fill={COLORS[index % COLORS.length]} 
                        />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [value, 'Cantidad']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-500">
                No hay datos para este periodo
              </div>
            )}
          </div>

          {/* Estado de Habitaciones */}
          <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 shadow-lg">
            <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-4">Estado de Habitaciones</h3>
            {estadoHabitaciones.length > 0 ? (
              <div className="h-64 md:h-72 lg:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={estadoHabitaciones}
                      dataKey="cantidad"
                      nameKey="estado"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={(entry) => `${entry.estado}: ${entry.cantidad}`}
                    >
                      {estadoHabitaciones.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}-${entry.estado}`} 
                          fill={COLORS[index % COLORS.length]} 
                        />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [value, 'Cantidad']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-500">
                No hay datos disponibles
              </div>
            )}
          </div>
        </div>

        {/* Reservas por Periodo */}
        <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 shadow-lg mb-6 md:mb-8">
          <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-4">
            Reservas e Ingresos - {getPeriodoLabel()}
          </h3>
          {reservasPorPeriodo.length > 0 ? (
            <div className="h-72 md:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={reservasPorPeriodo}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="periodo" 
                    angle={periodo === 'semana' || periodo === 'mes' ? -45 : 0}
                    textAnchor={periodo === 'semana' || periodo === 'mes' ? 'end' : 'middle'}
                    height={periodo === 'semana' || periodo === 'mes' ? 80 : 60}
                  />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip 
                    formatter={(value, name) => [
                      name === 'Ingresos (Bs.)' 
                        ? `Bs. ${Number(value).toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                        : value,
                      name
                    ]}
                  />
                  <Legend />
                  <Line 
                    yAxisId="left" 
                    type="monotone" 
                    dataKey="cantidad" 
                    stroke="#3B82F6" 
                    strokeWidth={2} 
                    name="Reservas" 
                    dot={{ r: 4 }}
                  />
                  <Line 
                    yAxisId="right" 
                    type="monotone" 
                    dataKey="ingresos" 
                    stroke="#10B981" 
                    strokeWidth={2} 
                    name="Ingresos (Bs.)" 
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-72 flex items-center justify-center text-gray-500">
              No hay datos para este periodo
            </div>
          )}
        </div>

        {/* Ingresos por Periodo */}
        <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 shadow-lg mb-6 md:mb-8">
          <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-4">
            Ingresos Detallados - {getPeriodoLabel()}
          </h3>
          {ingresosPorPeriodo.length > 0 ? (
            <div className="h-64 md:h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ingresosPorPeriodo}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="fecha" 
                    angle={periodo === 'semana' || periodo === 'mes' ? -45 : 0}
                    textAnchor={periodo === 'semana' || periodo === 'mes' ? 'end' : 'middle'}
                    height={periodo === 'semana' || periodo === 'mes' ? 80 : 60}
                  />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => [
                      `Bs. ${Number(value).toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                      'Ingresos'
                    ]}
                  />
                  <Legend />
                  <Bar dataKey="total" fill="#10B981" name="Ingresos (Bs.)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              No hay datos para este periodo
            </div>
          )}
        </div>

        {/* Habitaciones Más Reservadas y Métodos de Pago */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
          {/* Habitaciones Más Reservadas */}
          <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 shadow-lg">
            <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-4">
              Top 10 Habitaciones - {getPeriodoLabel()}
            </h3>
            {habitacionesMasReservadas.length > 0 ? (
              <div className="h-72 md:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={habitacionesMasReservadas} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis 
                      type="category" 
                      dataKey="numero" 
                      width={60}
                      tickFormatter={(value) => `Hab. ${value}`}
                    />
                    <Tooltip formatter={(value) => [value, 'Reservas']} />
                    <Legend />
                    <Bar 
                      dataKey="total_reservas" 
                      fill="#8B5CF6" 
                      name="Reservas" 
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-72 flex items-center justify-center text-gray-500">
                No hay datos para este periodo
              </div>
            )}
          </div>

          {/* Métodos de Pago */}
          <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 shadow-lg">
            <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-4">
              Métodos de Pago - {getPeriodoLabel()}
            </h3>
            {metodosPago.length > 0 ? (
              <div className="h-72 md:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={metodosPago}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="metodo_pago" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value, name) => [
                        name === 'Monto Total (Bs.)'
                          ? `Bs. ${Number(value).toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                          : value,
                        name
                      ]}
                    />
                    <Legend />
                    <Bar 
                      dataKey="cantidad" 
                      fill="#F59E0B" 
                      name="Cantidad" 
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar 
                      dataKey="total_monto" 
                      fill="#3B82F6" 
                      name="Monto Total (Bs.)" 
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-72 flex items-center justify-center text-gray-500">
                No hay datos para este periodo
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;