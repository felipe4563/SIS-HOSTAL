import { useState, useEffect, useContext } from 'react';
import { getHabitaciones } from '../services/habitacion';
import { getReportePorFechas } from '../services/reportes';
import { exportarReportePDF } from '../pages/reportes/exportarReportePDF';
import { AuthContext } from '../context/AuthContext';

const Reportes = () => {
  const { usuario } = useContext(AuthContext);
  const tienePermiso = (p) => usuario?.permisos?.includes(p);
  // Estados para filtros
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [habitacionSeleccionada, setHabitacionSeleccionada] = useState('');
  const [estadoSeleccionado, setEstadoSeleccionado] = useState('');
  
  // Estados para datos
  const [habitaciones, setHabitaciones] = useState([]);
  const [reporteGeneral, setReporteGeneral] = useState(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Función helper para formatear fechas
  const formatearFecha = (fecha) => {
    if (!fecha) return '';
    
    if (typeof fecha === 'string' && fecha.includes('T')) {
      return fecha.split('T')[0];
    }
    
    const date = new Date(fecha);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatearFechaLarga = (fecha) => {
    if (!fecha) return '';
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const cargarHabitaciones = async () => {
    try {
      const data = await getHabitaciones();
      setHabitaciones(data);
    } catch (err) {
      console.error('Error al cargar habitaciones:', err);
    }
  };

  const generarReporte = async (inicio = fechaInicio, fin = fechaFin) => {
    if (!inicio || !fin) {
      setError('Por favor seleccione un rango de fechas');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const params = {
        fecha_inicio: inicio,
        fecha_fin: fin,
        ...(habitacionSeleccionada && { id_habitacion: habitacionSeleccionada }),
        ...(estadoSeleccionado && { estado: estadoSeleccionado })
      };

      const general = await getReportePorFechas(params);
      setReporteGeneral(general);

    } catch (err) {
      console.error('Error al generar reporte:', err);
      setError('Error al generar el reporte. Por favor, intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarHabitaciones();
    const hoy = new Date();
    const haceUnMes = new Date();
    haceUnMes.setMonth(haceUnMes.getMonth() - 1);
    const fin   = hoy.toISOString().split('T')[0];
    const inicio = haceUnMes.toISOString().split('T')[0];
    setFechaFin(fin);
    setFechaInicio(inicio);
    generarReporte(inicio, fin);
  }, []);

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

  const handleExportarPDF = () => {
    if (!reporteGeneral) {
      alert('Primero debe generar un reporte');
      return;
    }

    try {
      exportarReportePDF(
        reporteGeneral,
        [],
        [],
        [],
        fechaInicio,
        fechaFin
      );
    } catch (error) {
      console.error('Error al exportar PDF:', error);
      alert('Error al generar el archivo PDF');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Corporativo */}
      <div className="bg-white border-b-4 border-blue-900 shadow-sm">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">HOSTAL SURI</h1>
              <p className="text-sm text-gray-600 mt-1 uppercase tracking-wider">Sistema de Reportes y Análisis</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500 uppercase tracking-wider">Fecha de generación</p>
              <p className="text-sm font-semibold text-gray-900">
                {new Date().toLocaleDateString('es-ES', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-8">
        {/* Sección de Filtros */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-900 uppercase tracking-wide">
              Parámetros de Consulta
            </h2>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              {/* Fecha Inicio */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                  Fecha Creación (desde)
                </label>
                <input
                  type="date"
                  value={fechaInicio}
                  onChange={(e) => setFechaInicio(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>

              {/* Fecha Fin */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                  Fecha Creación (hasta)
                </label>
                <input
                  type="date"
                  value={fechaFin}
                  onChange={(e) => setFechaFin(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>

              {/* Habitación */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                  Habitación
                </label>
                <select
                  value={habitacionSeleccionada}
                  onChange={(e) => setHabitacionSeleccionada(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
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
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                  Estado de Reserva
                </label>
                <select
                  value={estadoSeleccionado}
                  onChange={(e) => setEstadoSeleccionado(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                >
                  <option value="">Todos los estados</option>
                  <option value="pendiente">Pendiente</option>
                  <option value="confirmada">Confirmada</option>
                  <option value="cancelada">Cancelada</option>
                  <option value="finalizada">Finalizada</option>
                </select>
              </div>
            </div>

            {/* Botones de Acción */}
            <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
              {tienePermiso('reporte.generar') && (
                <button
                  onClick={() => generarReporte()}
                  disabled={loading || !fechaInicio || !fechaFin}
                  className="px-6 py-2.5 bg-blue-900 hover:bg-blue-800 text-white text-sm font-semibold rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider"
                >
                  {loading ? 'Generando Reporte...' : 'Generar Reporte'}
                </button>
              )}

              {tienePermiso('reporte.generar') && reporteGeneral && (
                <button
                  onClick={handleExportarPDF}
                  className="px-6 py-2.5 bg-red-700 hover:bg-red-600 text-white text-sm font-semibold rounded-md transition-colors uppercase tracking-wider flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Exportar PDF
                </button>
              )}

              <button
                onClick={limpiarFiltros}
                className="px-6 py-2.5 border border-gray-300 text-gray-700 text-sm font-semibold rounded-md hover:bg-gray-50 transition-colors uppercase tracking-wider"
              >
                Restablecer
              </button>
            </div>

            {error && (
              <div className="mt-4 bg-red-50 border-l-4 border-red-600 p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700 font-medium">{error}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Resultados del Reporte */}
        {reporteGeneral && (
          <>
            {/* Encabezado del Reporte Generado */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8 overflow-hidden">
              <div className="bg-blue-900 text-white px-6 py-6">
                <h2 className="text-2xl font-bold mb-2 uppercase tracking-wide">Informe Ejecutivo</h2>
                <p className="text-blue-100 text-sm">
                  Período: {formatearFechaLarga(fechaInicio)} - {formatearFechaLarga(fechaFin)}
                </p>
              </div>

              {/* Indicadores Clave (KPIs) */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-gray-200">
                <div className="bg-white p-6">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Total de Reservas
                  </p>
                  <p className="text-4xl font-bold text-gray-900">{reporteGeneral.resumen.total_reservas}</p>
                  <p className="text-xs text-gray-500 mt-2">Unidades registradas</p>
                </div>

                <div className="bg-white p-6">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Ingresos Totales
                  </p>
                  <p className="text-4xl font-bold text-green-700">Bs. {reporteGeneral.resumen.total_ingresos}</p>
                  <p className="text-xs text-gray-500 mt-2">Bolivianos facturados</p>
                </div>

                <div className="bg-white p-6">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Noches Hospedadas
                  </p>
                  <p className="text-4xl font-bold text-gray-900">{reporteGeneral.resumen.total_noches}</p>
                  <p className="text-xs text-gray-500 mt-2">Días de ocupación</p>
                </div>

                <div className="bg-white p-6">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Ticket Promedio
                  </p>
                  <p className="text-4xl font-bold text-blue-700">Bs. {reporteGeneral.resumen.ingreso_promedio}</p>
                  <p className="text-xs text-gray-500 mt-2">Por reserva</p>
                </div>
              </div>
            </div>

            {/* Tabla Detallada de Reservas */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
                <h3 className="text-lg font-semibold text-gray-900 uppercase tracking-wide">
                  Detalle de Reservas
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {reporteGeneral.reservas.length} registro{reporteGeneral.reservas.length !== 1 ? 's' : ''} encontrado{reporteGeneral.reservas.length !== 1 ? 's' : ''}
                </p>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        ID
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Habitación
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Cliente
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Fecha Entrada
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Fecha Salida
                      </th>
                      <th scope="col" className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Noches
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Monto Total
                      </th>
                      <th scope="col" className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Estado
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {reporteGeneral.reservas.map((reserva, index) => (
                      <tr key={reserva.id_reserva} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          #{reserva.id_reserva}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {reserva.numero_habitacion}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {reserva.cliente_nombre} {reserva.cliente_apellido}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {formatearFecha(reserva.fecha_entrada)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {formatearFecha(reserva.fecha_salida)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-medium text-gray-900">
                          {reserva.noches}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold text-gray-900">
                          Bs. {parseFloat(reserva.total).toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded ${
                            reserva.estado === 'confirmada' ? 'bg-green-100 text-green-800' :
                            reserva.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-800' :
                            reserva.estado === 'cancelada' ? 'bg-red-100 text-red-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {reserva.estado.toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Footer de Totales */}
              <div className="bg-gray-50 border-t-2 border-gray-300 px-6 py-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-xs text-gray-600 uppercase tracking-wider">Total de Registros</p>
                    <p className="text-lg font-bold text-gray-900">{reporteGeneral.reservas.length}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-600 uppercase tracking-wider mb-1">Total Facturado</p>
                    <p className="text-2xl font-bold text-green-700">
                      Bs. {reporteGeneral.resumen.total_ingresos}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Nota al pie */}
            <div className="mt-8 text-center text-xs text-gray-500">
              <p className="mb-1">HOSTAL SURI - Sistema de Gestión Hotelera</p>
              <p>Documento generado automáticamente el {new Date().toLocaleString('es-ES')}</p>
            </div>
          </>
        )}

        {/* Estado Inicial - Sin Reporte */}
        {!reporteGeneral && !loading && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <div className="max-w-md mx-auto">
              <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No hay datos para mostrar
              </h3>
              <p className="text-gray-600 text-sm mb-6">
                Seleccione un rango de fechas y haga clic en "Generar Reporte" para visualizar la información
              </p>
              <div className="border-t border-gray-200 pt-6 mt-6">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Instrucciones</p>
                <ol className="text-sm text-gray-600 text-left space-y-2">
                  <li>1. Seleccione las fechas de inicio y fin del período</li>
                  <li>2. Opcionalmente, filtre por habitación o estado</li>
                  <li>3. Presione el botón "Generar Reporte"</li>
                  <li>4. Exporte el reporte en formato PDF si lo requiere</li>
                </ol>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reportes;