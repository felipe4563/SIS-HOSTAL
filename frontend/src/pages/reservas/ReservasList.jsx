import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";

const ReservasList = ({
  reservas,
  loading,
  error,
  busqueda,
  filtroEstado,
  onBusquedaChange,
  onFiltroEstadoChange,
  onRetry,
  onEdit,
  onDelete,
  onCheckIn,
  onCheckOut,
  onOpenEstadoModal
}) => {
  const { usuario } = useContext(AuthContext);
  const tienePermiso = (p) => usuario?.permisos?.includes(p);

  const formatearFecha = (fecha) =>
    new Date(fecha).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" });

  const formatearFechaHora = (fecha) => {
    if (!fecha) return "";
    return new Date(fecha).toLocaleString("es-ES", {
      day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
    });
  };

  const calcularNoches = (entrada, salida) =>
    Math.ceil((new Date(salida) - new Date(entrada)) / (1000 * 60 * 60 * 24));

  const getEstadoBadge = (estado) => {
    const badges = {
      pendiente:  "bg-yellow-100 text-yellow-800 border-yellow-300",
      confirmada: "bg-green-100 text-green-800 border-green-300",
      cancelada:  "bg-red-100 text-red-800 border-red-300",
      finalizada: "bg-gray-100 text-gray-800 border-gray-300"
    };
    const iconos = { pendiente: "⏳", confirmada: "✅", cancelada: "❌", finalizada: "🏁" };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border-2 ${badges[estado]}`}>
        <span className="mr-1">{iconos[estado]}</span>{estado.toUpperCase()}
      </span>
    );
  };

  const reservasFiltradas = reservas.filter((r) => {
    const cumpleEstado = filtroEstado === "todas" || r.estado === filtroEstado;
    const q = busqueda.toLowerCase();
    const cumpleBusqueda =
      r.numero_habitacion?.toLowerCase().includes(q) ||
      r.nombre_cliente?.toLowerCase().includes(q) ||
      r.ci_cliente?.includes(busqueda) ||
      r.id_reserva.toString().includes(busqueda);
    return cumpleEstado && cumpleBusqueda;
  });

  const stats = {
    total:      reservas.length,
    pendientes: reservas.filter((r) => r.estado === "pendiente").length,
    confirmadas:reservas.filter((r) => r.estado === "confirmada").length,
    canceladas: reservas.filter((r) => r.estado === "cancelada").length,
    finalizadas:reservas.filter((r) => r.estado === "finalizada").length
  };

  /* ── Botones de acción reutilizables ─────────────────────────── */
  const AccionesBotones = ({ reserva, compact = false }) => {
    const puedeEditar  = tienePermiso('reserva.editar');
    const puedeEliminar= tienePermiso('reserva.eliminar');
    const activa = reserva.estado !== "cancelada" && reserva.estado !== "finalizada";

    if (!puedeEditar && !puedeEliminar) return null;

    if (compact) {
      /* Vista móvil — botones en fila horizontal con texto */
      return (
        <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-100 mt-3">
          {puedeEditar && activa && (
            <>
              {!reserva.checkin_at ? (
                <button
                  onClick={() => onCheckIn?.(reserva)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-50 text-green-700 text-xs font-semibold border border-green-200 hover:bg-green-100 active:scale-95 transition-all"
                >
                  🛬 Check-in
                </button>
              ) : (
                <button
                  onClick={() => onCheckOut?.(reserva)}
                  title={`Check-in: ${formatearFechaHora(reserva.checkin_at)}`}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 text-amber-700 text-xs font-semibold border border-amber-200 hover:bg-amber-100 active:scale-95 transition-all"
                >
                  🛫 Check-out
                </button>
              )}
              <button
                onClick={() => onEdit(reserva)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-semibold border border-indigo-200 hover:bg-indigo-100 active:scale-95 transition-all"
              >
                📝 Editar
              </button>
              <button
                onClick={() => onOpenEstadoModal(reserva)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-200 hover:bg-blue-100 active:scale-95 transition-all"
              >
                ✏️ Estado
              </button>
            </>
          )}
          {puedeEliminar && (
            <button
              onClick={() => onDelete(reserva.id_reserva)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 text-red-700 text-xs font-semibold border border-red-200 hover:bg-red-100 active:scale-95 transition-all"
            >
              🗑️ Eliminar
            </button>
          )}
        </div>
      );
    }

    /* Vista desktop — íconos compactos en tabla */
    return (
      <div className="flex items-center space-x-2">
        {puedeEditar && activa && (
          <>
            {!reserva.checkin_at ? (
              <button onClick={() => onCheckIn?.(reserva)} className="text-green-700 hover:text-green-900 text-lg" title="Check-in">🛬</button>
            ) : (
              <button onClick={() => onCheckOut?.(reserva)} className="text-amber-700 hover:text-amber-900 text-lg" title={`Check-out (check-in: ${formatearFechaHora(reserva.checkin_at)})`}>🛫</button>
            )}
            <button onClick={() => onEdit(reserva)} className="text-indigo-600 hover:text-indigo-800 text-lg" title="Editar reserva">📝</button>
            <button onClick={() => onOpenEstadoModal(reserva)} className="text-blue-600 hover:text-blue-800 text-lg" title="Cambiar estado">✏️</button>
          </>
        )}
        {puedeEliminar && (
          <button onClick={() => onDelete(reserva.id_reserva)} className="text-red-600 hover:text-red-800 text-lg" title="Eliminar reserva">🗑️</button>
        )}
      </div>
    );
  };

  return (
    <>
      {/* ── Estadísticas ───────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4 mb-6 sm:mb-8">
        <div className="bg-white rounded-xl shadow-md p-3 sm:p-4 border-l-4 border-blue-500">
          <p className="text-xs sm:text-sm text-gray-600 font-medium">Total</p>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-3 sm:p-4 border-l-4 border-yellow-500">
          <p className="text-xs sm:text-sm text-gray-600 font-medium">Pendientes</p>
          <p className="text-2xl sm:text-3xl font-bold text-yellow-600">{stats.pendientes}</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-3 sm:p-4 border-l-4 border-green-500">
          <p className="text-xs sm:text-sm text-gray-600 font-medium">Confirmadas</p>
          <p className="text-2xl sm:text-3xl font-bold text-green-600">{stats.confirmadas}</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-3 sm:p-4 border-l-4 border-red-500">
          <p className="text-xs sm:text-sm text-gray-600 font-medium">Canceladas</p>
          <p className="text-2xl sm:text-3xl font-bold text-red-600">{stats.canceladas}</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-3 sm:p-4 border-l-4 border-gray-500 col-span-2 sm:col-span-1">
          <p className="text-xs sm:text-sm text-gray-600 font-medium">Finalizadas</p>
          <p className="text-2xl sm:text-3xl font-bold text-gray-600">{stats.finalizadas}</p>
        </div>
      </div>

      {/* ── Filtros ─────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Buscar</label>
            <input
              type="text"
              placeholder="Habitación, cliente, CI o ID..."
              value={busqueda}
              onChange={(e) => onBusquedaChange(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Filtrar por estado</label>
            <select
              value={filtroEstado}
              onChange={(e) => onFiltroEstadoChange(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm"
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

      {/* ── Loading / Error ──────────────────────────────────────── */}
      {loading && (
        <div className="text-center py-20">
          <div className="inline-block w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-gray-600 font-medium">Cargando reservas...</p>
        </div>
      )}
      {error && (
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 text-center">
          <p className="text-red-700 font-semibold mb-4">{error}</p>
          <button onClick={onRetry} className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-semibold">
            Reintentar
          </button>
        </div>
      )}

      {/* ── Sin resultados ───────────────────────────────────────── */}
      {!loading && !error && reservasFiltradas.length === 0 && (
        <div className="text-center py-20 bg-white rounded-xl shadow-md">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">No se encontraron reservas</h3>
          <p className="text-gray-600">
            {filtroEstado !== "todas" || busqueda
              ? "Intenta ajustar los filtros de búsqueda"
              : "Aún no hay reservas registradas"}
          </p>
        </div>
      )}

      {!loading && !error && reservasFiltradas.length > 0 && (
        <>
          {/* ══ CARDS — móvil (< md) ════════════════════════════ */}
          <div className="md:hidden space-y-4">
            {reservasFiltradas.map((reserva) => (
              <div key={reserva.id_reserva} className="bg-white rounded-xl shadow-md p-4 border border-gray-100">
                {/* Cabecera de la card */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <span className="text-xs text-gray-400 font-medium">Reserva</span>
                    <p className="text-lg font-bold text-gray-900">#{reserva.id_reserva}</p>
                  </div>
                  {getEstadoBadge(reserva.estado)}
                </div>

                {/* Datos */}
                {reserva.fecha_creacion && (
                  <p className="text-xs text-gray-400 mb-3">
                    Registrada el {formatearFecha(reserva.fecha_creacion)}
                  </p>
                )}

                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  <div>
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Cliente</p>
                    <p className="font-semibold text-gray-900">{reserva.nombre_cliente}</p>
                    {reserva.ci_cliente && <p className="text-gray-500 text-xs">CI: {reserva.ci_cliente}</p>}
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Habitación</p>
                    <p className="font-semibold text-gray-900">Hab. {reserva.numero_habitacion}</p>
                    <p className="text-gray-500 text-xs">{reserva.tipo_habitacion}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Entrada</p>
                    <p className="font-medium text-gray-800">{formatearFecha(reserva.fecha_entrada)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Salida</p>
                    <p className="font-medium text-gray-800">{formatearFecha(reserva.fecha_salida)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Noches</p>
                    <p className="font-semibold text-gray-900">{calcularNoches(reserva.fecha_entrada, reserva.fecha_salida)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Total</p>
                    <p className="font-bold text-green-600">Bs. {parseFloat(reserva.total).toFixed(2)}</p>
                  </div>
                </div>

                {/* Botones */}
                <AccionesBotones reserva={reserva} compact />
              </div>
            ))}
          </div>

          {/* ══ TABLA — tablet y desktop (≥ md) ════════════════════ */}
          <div className="hidden md:block bg-white rounded-xl shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 lg:px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">ID</th>
                    <th className="px-4 lg:px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Cliente</th>
                    <th className="px-4 lg:px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Habitación</th>
                    <th className="px-4 lg:px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Fechas</th>
                    <th className="px-4 lg:px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Noches</th>
                    <th className="px-4 lg:px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Total</th>
                    <th className="px-4 lg:px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Registrada</th>
                    <th className="px-4 lg:px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Estado</th>
                    {(tienePermiso('reserva.editar') || tienePermiso('reserva.eliminar')) && (
                      <th className="px-4 lg:px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Acciones</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {reservasFiltradas.map((reserva) => (
                    <tr key={reserva.id_reserva} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-bold text-gray-900">#{reserva.id_reserva}</span>
                      </td>
                      <td className="px-4 lg:px-6 py-4">
                        <p className="text-sm font-semibold text-gray-900">{reserva.nombre_cliente}</p>
                        {reserva.ci_cliente && <p className="text-xs text-gray-500">CI: {reserva.ci_cliente}</p>}
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                        <p className="text-sm font-semibold text-gray-900">Hab. {reserva.numero_habitacion}</p>
                        <p className="text-xs text-gray-500">{reserva.tipo_habitacion}</p>
                      </td>
                      <td className="px-4 lg:px-6 py-4">
                        <p className="text-sm text-gray-900"><span className="font-semibold">Entrada:</span> {formatearFecha(reserva.fecha_entrada)}</p>
                        <p className="text-sm text-gray-900"><span className="font-semibold">Salida:</span> {formatearFecha(reserva.fecha_salida)}</p>
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-semibold text-gray-900">{calcularNoches(reserva.fecha_entrada, reserva.fecha_salida)}</span>
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-bold text-green-600">Bs. {parseFloat(reserva.total).toFixed(2)}</span>
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                        <span className="text-xs text-gray-500">{reserva.fecha_creacion ? formatearFecha(reserva.fecha_creacion) : '—'}</span>
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                        {getEstadoBadge(reserva.estado)}
                      </td>
                      {(tienePermiso('reserva.editar') || tienePermiso('reserva.eliminar')) && (
                        <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                          <AccionesBotones reserva={reserva} compact={false} />
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default ReservasList;
