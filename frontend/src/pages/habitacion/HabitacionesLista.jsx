import { useEffect, useState, useContext } from "react";
import {
  listarHabitaciones,
  eliminarHabitacion,
  cambiarEstadoHabitacion,
} from "../../services/habitacion";
import { AuthContext } from "../../context/AuthContext.jsx";

const HabitacionesLista = ({ onEdit, onTour360, reload }) => {
  const { usuario } = useContext(AuthContext);
  const tienePermiso = (p) => usuario?.permisos?.includes(p);
  const [habitaciones, setHabitaciones] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filtroEstado, setFiltroEstado] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("");
  const [busqueda, setBusqueda] = useState("");

  const [indicesCarrusel, setIndicesCarrusel] = useState({});
  const tieneVistaCompleta = tienePermiso("habitacion.vista_completa");
  const [vista, setVista] = useState(tieneVistaCompleta ? "cards" : "tabla");

  const cargarHabitaciones = async () => {
    try {
      setLoading(true);
      const data = await listarHabitaciones();
      setHabitaciones(data);

      const initial = {};
      data.forEach((h) => {
        initial[h.id_habitacion] = 0;
      });
      setIndicesCarrusel(initial);
    } catch (error) {
      console.error("Error al cargar habitaciones:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarHabitaciones();
  }, [reload]);

  const handleEstado = async (id, estado) => {
    try {
      await cambiarEstadoHabitacion(id, estado);
      cargarHabitaciones();
    } catch (error) {
      console.error("Error al cambiar estado:", error);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("¿Seguro que deseas eliminar esta habitación?")) return;
    try {
      await eliminarHabitacion(id);
      cargarHabitaciones();
    } catch (error) {
      console.error("Error al eliminar habitación:", error);
      alert(error?.response?.data?.message || "Error al eliminar");
    }
  };

  const badgeStyles = {
    disponible: "bg-green-100 text-green-700 border-green-200",
    ocupada: "bg-red-100 text-red-700 border-red-200",
    limpieza: "bg-yellow-100 text-yellow-700 border-yellow-200",
  };

  const estadoIcons = {
    disponible: "✅",
    ocupada: "🔒",
    limpieza: "🧹",
  };

  // Filtrado
  const habitacionesFiltradas = habitaciones.filter((h) => {
    const estadoMatch = filtroEstado ? h.estado === filtroEstado : true;
    const tipoMatch = filtroTipo ? h.tipo_habitacion === filtroTipo : true;
    const busquedaMatch = busqueda
      ? h.numero.toLowerCase().includes(busqueda.toLowerCase()) ||
        h.tipo_habitacion?.toLowerCase().includes(busqueda.toLowerCase())
      : true;
    return estadoMatch && tipoMatch && busquedaMatch;
  });

  const tiposUnicos = [...new Set(habitaciones.map((h) => h.tipo_habitacion).filter(Boolean))];

  const nextImage = (id, total) => {
    setIndicesCarrusel((prev) => ({
      ...prev,
      [id]: (prev[id] + 1) % total,
    }));
  };

  const prevImage = (id, total) => {
    setIndicesCarrusel((prev) => ({
      ...prev,
      [id]: (prev[id] - 1 + total) % total,
    }));
  };

  // Contadores
  const contadores = {
    total: habitaciones.length,
    disponible: habitaciones.filter(h => h.estado === 'disponible').length,
    ocupada: habitaciones.filter(h => h.estado === 'ocupada').length,
    limpieza: habitaciones.filter(h => h.estado === 'limpieza').length,
  };

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg p-8">
        <div className="flex items-center justify-center gap-3">
          <svg className="animate-spin h-8 w-8 text-blue-600" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="text-gray-600 text-lg">Cargando habitaciones...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con estadísticas */}
      <div className="bg-white shadow-md rounded-xl p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div>
            <h3 className="text-2xl font-bold text-gray-800">🏨 Habitaciones</h3>
            <p className="text-gray-500 text-sm mt-1">Gestiona las habitaciones del hostal</p>
          </div>

          {/* Contadores */}
          <div className="flex flex-wrap gap-3">
            <div className="bg-gray-100 rounded-xl px-4 py-2 text-center min-w-[70px]">
              <p className="text-2xl font-bold text-gray-700">{contadores.total}</p>
              <p className="text-xs text-gray-500">Total</p>
            </div>
            <div className="bg-green-100 rounded-xl px-4 py-2 text-center min-w-[70px]">
              <p className="text-2xl font-bold text-green-700">{contadores.disponible}</p>
              <p className="text-xs text-green-600">Disponibles</p>
            </div>
            <div className="bg-red-100 rounded-xl px-4 py-2 text-center min-w-[70px]">
              <p className="text-2xl font-bold text-red-700">{contadores.ocupada}</p>
              <p className="text-xs text-red-600">Ocupadas</p>
            </div>
            <div className="bg-yellow-100 rounded-xl px-4 py-2 text-center min-w-[70px]">
              <p className="text-2xl font-bold text-yellow-700">{contadores.limpieza}</p>
              <p className="text-xs text-yellow-600">Limpieza</p>
            </div>
          </div>
        </div>

        {/* Filtros + toggle de vista */}
        <div className="flex flex-wrap gap-3 items-center">
          {/* Búsqueda */}
          <div className="relative flex-1 min-w-[200px]">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
            <input
              type="text"
              placeholder="Buscar por número o tipo..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Estado */}
          <select
            className="border border-gray-300 px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 min-w-[160px]"
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
          >
            <option value="">📊 Todos los estados</option>
            <option value="disponible">✅ Disponible</option>
            <option value="ocupada">🔒 Ocupada</option>
            <option value="limpieza">🧹 En Limpieza</option>
          </select>

          {/* Tipo */}
          <select
            className="border border-gray-300 px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 min-w-[160px]"
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value)}
          >
            <option value="">🏷️ Todos los tipos</option>
            {tiposUnicos.map((tipo) => (
              <option key={tipo} value={tipo}>{tipo}</option>
            ))}
          </select>

          {(filtroEstado || filtroTipo || busqueda) && (
            <button
              onClick={() => { setFiltroEstado(""); setFiltroTipo(""); setBusqueda(""); }}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2.5 rounded-lg transition-colors flex items-center gap-2"
            >
              ✕ Limpiar
            </button>
          )}

          {/* Toggle vista — solo si tiene habitacion.vista_completa */}
          {tieneVistaCompleta && <div className="flex border border-gray-300 rounded-lg overflow-hidden ml-auto">
            <button
              onClick={() => setVista("cards")}
              title="Vista tarjetas"
              className={`px-3 py-2.5 transition-colors ${vista === "cards" ? "bg-blue-600 text-white" : "bg-white text-gray-500 hover:bg-gray-100"}`}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16">
                <path d="M1 2.5A1.5 1.5 0 0 1 2.5 1h3A1.5 1.5 0 0 1 7 2.5v3A1.5 1.5 0 0 1 5.5 7h-3A1.5 1.5 0 0 1 1 5.5v-3zm8 0A1.5 1.5 0 0 1 10.5 1h3A1.5 1.5 0 0 1 15 2.5v3A1.5 1.5 0 0 1 13.5 7h-3A1.5 1.5 0 0 1 9 5.5v-3zm-8 8A1.5 1.5 0 0 1 2.5 9h3A1.5 1.5 0 0 1 7 10.5v3A1.5 1.5 0 0 1 5.5 15h-3A1.5 1.5 0 0 1 1 13.5v-3zm8 0A1.5 1.5 0 0 1 10.5 9h3a1.5 1.5 0 0 1 1.5 1.5v3a1.5 1.5 0 0 1-1.5 1.5h-3A1.5 1.5 0 0 1 9 13.5v-3z"/>
              </svg>
            </button>
            <button
              onClick={() => setVista("tabla")}
              title="Vista tabla"
              className={`px-3 py-2.5 transition-colors ${vista === "tabla" ? "bg-blue-600 text-white" : "bg-white text-gray-500 hover:bg-gray-100"}`}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16">
                <path d="M0 2a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V2zm15 2h-4v3h4V4zm0 4h-4v3h4V8zm0 4h-4v3h3a1 1 0 0 0 1-1v-2zm-5 3v-3H6v3h4zm-5 0v-3H1v2a1 1 0 0 0 1 1h3zm-4-4h4V8H1v3zm0-4h4V4H1v3zm5-3v3h4V4H6zm4 4H6v3h4V8z"/>
              </svg>
            </button>
          </div>}
        </div>
      </div>

      {/* ══ VISTA TABLA ══════════════════════════════════════════════ */}
      {vista === "tabla" && habitacionesFiltradas.length > 0 && (
        <div className="bg-white shadow-md rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">N°</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Tipo</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Piso</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Precio</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Capacidad</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">360°</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Estado</th>
                  {(tienePermiso('habitacion.editar') || tienePermiso('habitacion.eliminar')) && (
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Acciones</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {habitacionesFiltradas.map((h) => {
                  const tiene360 = h.imagenes_360?.length > 0;
                  return (
                    <tr key={h.id_habitacion} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-bold text-gray-900">Hab. {h.numero}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{h.tipo_habitacion || '—'}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{h.piso ? `Piso ${h.piso}` : '—'}</td>
                      <td className="px-4 py-3 text-sm font-semibold text-blue-600">Bs. {h.precio_total ?? h.precio_base}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">👥 {h.capacidad}</td>
                      <td className="px-4 py-3 text-sm">
                        {tiene360
                          ? <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full text-xs font-semibold">🔄 Sí</span>
                          : <span className="text-gray-400 text-xs">—</span>}
                      </td>
                      <td className="px-4 py-3">
                        {tienePermiso('habitacion.editar') ? (
                          <select
                            className={`text-xs px-2 py-1 rounded-lg border font-medium ${badgeStyles[h.estado] || 'border-gray-200'}`}
                            value={h.estado}
                            onChange={(e) => handleEstado(h.id_habitacion, e.target.value)}
                          >
                            <option value="disponible">✅ Disponible</option>
                            <option value="ocupada">🔒 Ocupada</option>
                            <option value="limpieza">🧹 Limpieza</option>
                          </select>
                        ) : (
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${badgeStyles[h.estado] || 'bg-gray-100'}`}>
                            {estadoIcons[h.estado]} {h.estado}
                          </span>
                        )}
                      </td>
                      {(tienePermiso('habitacion.editar') || tienePermiso('habitacion.eliminar')) && (
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {tienePermiso('habitacion.editar') && (
                              <>
                                <button
                                  onClick={() => onEdit(h)}
                                  className="text-blue-600 hover:text-blue-800 text-lg"
                                  title="Editar"
                                >✏️</button>
                                {onTour360 && (
                                  <button
                                    onClick={() => onTour360(h)}
                                    className="text-purple-600 hover:text-purple-800 text-lg"
                                    title={tiene360 ? "Ver 360°" : "Agregar 360°"}
                                  >🔄</button>
                                )}
                              </>
                            )}
                            {tienePermiso('habitacion.eliminar') && (
                              <button
                                onClick={() => handleDelete(h.id_habitacion)}
                                className="text-red-500 hover:text-red-700 text-lg"
                                title="Eliminar"
                              >🗑️</button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ══ VISTA CARDS ══════════════════════════════════════════════ */}
      {vista === "cards" && (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {habitacionesFiltradas.map((h) => {
          const imgs = h.imagenes?.map(img => img.url || img) || [];
          const index = indicesCarrusel[h.id_habitacion] || 0;
          const imagenActual = imgs.length > 0 ? imgs[index] : null;
          const tiene360 = h.imagenes_360?.length > 0;

          return (
            <div
              key={h.id_habitacion}
              className="bg-white shadow-md rounded-xl overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow"
            >
              {/* Imagen */}
              <div className="relative w-full h-48 bg-gray-200">
                {imagenActual ? (
                  <img
                    src={imagenActual}
                    alt={`Habitación ${h.numero}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/400x300?text=Error";
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <div className="text-center">
                      <div className="text-4xl mb-2">🏨</div>
                      <p className="text-sm">Sin imagen</p>
                    </div>
                  </div>
                )}

                {/* Badge 360° */}
                {tiene360 && (
                  <span className="absolute top-2 left-2 bg-purple-600 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 shadow">
                    🔄 360°
                  </span>
                )}

                {/* Piso */}
                {h.piso && (
                  <span className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded shadow">
                    Piso {h.piso}
                  </span>
                )}

                {/* Controles carrusel */}
                {imgs.length > 1 && (
                  <>
                    <button
                      onClick={() => prevImage(h.id_habitacion, imgs.length)}
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                    >
                      ‹
                    </button>
                    <button
                      onClick={() => nextImage(h.id_habitacion, imgs.length)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                    >
                      ›
                    </button>
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                      {imgs.map((_, i) => (
                        <span
                          key={i}
                          className={`w-2 h-2 rounded-full transition-colors ${
                            i === index ? 'bg-white' : 'bg-white/50'
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Contenido */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="text-lg font-bold text-gray-800">
                      Hab. {h.numero}
                    </h4>
                    <p className="text-sm text-gray-500">{h.tipo_habitacion}</p>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium border ${
                      badgeStyles[h.estado] || 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {estadoIcons[h.estado]} {h.estado}
                  </span>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <p className="text-xl font-bold text-blue-600">
                    Bs. {h.precio_total ?? h.precio_base}
                  </p>
                  <p className="text-sm text-gray-500">
                    👥 {h.capacidad} pers.
                  </p>
                </div>

                {/* Acciones */}
                {(tienePermiso('habitacion.editar') || tienePermiso('habitacion.eliminar')) && (
                  <div className="flex gap-2 mb-3">
                    {tienePermiso('habitacion.editar') && (
                      <button
                        onClick={() => onEdit(h)}
                        className="flex-1 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors"
                      >
                        ✏️ Editar
                      </button>
                    )}

                    {onTour360 && tienePermiso('habitacion.editar') && (
                      <button
                        onClick={() => onTour360(h)}
                        className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          tiene360
                            ? 'bg-purple-500 hover:bg-purple-600 text-white'
                            : 'bg-purple-100 hover:bg-purple-200 text-purple-700'
                        }`}
                      >
                        🔄 {tiene360 ? 'Ver' : 'Agregar'} 360°
                      </button>
                    )}

                    {tienePermiso('habitacion.eliminar') && (
                      <button
                        onClick={() => handleDelete(h.id_habitacion)}
                        className="px-3 py-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg text-sm font-medium transition-colors"
                        title="Eliminar"
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                )}

                {/* Cambio de estado */}
                {tienePermiso('habitacion.editar') && (
                  <div className="pt-3 border-t">
                    <label className="text-xs text-gray-500 block mb-1">Cambiar estado:</label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                      value={h.estado}
                      onChange={(e) => handleEstado(h.id_habitacion, e.target.value)}
                    >
                      <option value="disponible">✅ Disponible</option>
                      <option value="ocupada">🔒 Ocupada</option>
                      <option value="limpieza">🧹 En Limpieza</option>
                    </select>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      )}

      {/* Sin resultados */}
      {habitacionesFiltradas.length === 0 && (
        <div className="bg-white shadow-md rounded-xl p-12 text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h4 className="text-xl font-medium text-gray-700 mb-2">
            No se encontraron habitaciones
          </h4>
          <p className="text-gray-500">
            Intenta ajustar los filtros de búsqueda
          </p>
        </div>
      )}
    </div>
  );
};

export default HabitacionesLista;