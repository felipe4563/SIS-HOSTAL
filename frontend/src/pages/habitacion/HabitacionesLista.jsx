import { useEffect, useState, useCallback } from "react";
import {
  listarHabitaciones,
  eliminarHabitacion,
  cambiarEstadoHabitacion,
} from "../../services/habitacion";
import { 
  PencilIcon, 
  TrashIcon, 
  EyeIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  XMarkIcon,
  AdjustmentsHorizontalIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ClockIcon
} from "@heroicons/react/24/outline";

const HabitacionesLista = ({ onEdit, reload }) => {
  const [habitaciones, setHabitaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filtroEstado, setFiltroEstado] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [showFiltros, setShowFiltros] = useState(false);

  // Estado de carrusel por habitación
  const [indicesCarrusel, setIndicesCarrusel] = useState({});
  const [imagenModal, setImagenModal] = useState({ open: false, url: null });

  const cargarHabitaciones = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await listarHabitaciones();
      setHabitaciones(data);

      // Inicializar índices de carrusel
      const initial = {};
      data.forEach((h) => {
        initial[h.id_habitacion] = 0;
      });
      setIndicesCarrusel(initial);
    } catch (error) {
      console.error("Error al cargar habitaciones:", error);
      setError("No se pudieron cargar las habitaciones. Intente nuevamente.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarHabitaciones();
  }, [reload, cargarHabitaciones]);

  const handleEstado = async (id, estado) => {
    try {
      await cambiarEstadoHabitacion(id, estado);
      await cargarHabitaciones();
    } catch (error) {
      console.error("Error al cambiar estado:", error);
      alert("Error al cambiar el estado de la habitación");
    }
  };

  const handleDelete = async (id, numero) => {
    if (!confirm(`¿Seguro que deseas eliminar la habitación ${numero}?`)) return;
    try {
      await eliminarHabitacion(id);
      await cargarHabitaciones();
    } catch (error) {
      console.error("Error al eliminar habitación:", error);
      alert("No se pudo eliminar la habitación. Verifique que no tenga reservas activas.");
    }
  };

  // Mejores badges con iconos
  const estadoConfig = {
    disponible: {
      color: "bg-green-100 text-green-800 border-green-200",
      icon: CheckCircleIcon,
      label: "Disponible"
    },
    ocupada: {
      color: "bg-red-100 text-red-800 border-red-200",
      icon: ExclamationCircleIcon,
      label: "Ocupada"
    },
    limpieza: {
      color: "bg-yellow-100 text-yellow-800 border-yellow-200",
      icon: ClockIcon,
      label: "En Limpieza"
    },
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando habitaciones...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <ExclamationCircleIcon className="h-12 w-12 text-red-400 mx-auto mb-3" />
        <p className="text-red-700 mb-4">{error}</p>
        <button
          onClick={cargarHabitaciones}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium"
        >
          Reintentar
        </button>
      </div>
    );
  }

  // Filtrado mejorado
  const habitacionesFiltradas = habitaciones.filter((h) => {
    const estadoMatch = filtroEstado ? h.estado === filtroEstado : true;
    const tipoMatch = filtroTipo ? h.tipo_habitacion === filtroTipo : true;
    const busquedaMatch = busqueda 
      ? h.numero.toLowerCase().includes(busqueda.toLowerCase()) ||
        h.tipo_habitacion.toLowerCase().includes(busqueda.toLowerCase()) ||
        h.descripcion?.toLowerCase().includes(busqueda.toLowerCase())
      : true;
    
    return estadoMatch && tipoMatch && busquedaMatch;
  });

  const tiposUnicos = [...new Set(habitaciones.map((h) => h.tipo_habitacion))];

  // Función para avanzar carrusel
  const nextImage = (id, total) => {
    setIndicesCarrusel((prev) => ({
      ...prev,
      [id]: (prev[id] + 1) % total,
    }));
  };

  // Función para retroceder carrusel
  const prevImage = (id, total) => {
    setIndicesCarrusel((prev) => ({
      ...prev,
      [id]: (prev[id] - 1 + total) % total,
    }));
  };

  const openImageModal = (url) => {
    setImagenModal({ open: true, url });
  };

  const closeImageModal = () => {
    setImagenModal({ open: false, url: null });
  };

  return (
    <div className="bg-white shadow-xl rounded-xl p-4 md:p-6">
      {/* Header con título y estadísticas */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h3 className="text-2xl font-bold text-gray-800">Habitaciones</h3>
          <p className="text-gray-600 mt-1">
            {habitacionesFiltradas.length} de {habitaciones.length} habitaciones
          </p>
        </div>

        {/* Botón para mostrar/ocultar filtros en móviles */}
        <button
          onClick={() => setShowFiltros(!showFiltros)}
          className="md:hidden flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700"
        >
          <AdjustmentsHorizontalIcon className="h-5 w-5" />
          Filtros
        </button>
      </div>

      {/* Barra de búsqueda */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar por número, tipo o descripción..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          {busqueda && (
            <button
              onClick={() => setBusqueda("")}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      {/* Filtros - Responsivos */}
      <div className={`${showFiltros ? 'block' : 'hidden'} md:block mb-8`}>
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-gray-700 font-medium">Filtrar por:</span>
            
            {/* Filtro Estado */}
            <div className="relative">
              <select
                className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
              >
                <option value="">Todos los estados</option>
                <option value="disponible">Disponible</option>
                <option value="ocupada">Ocupada</option>
                <option value="limpieza">En Limpieza</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Filtro Tipo */}
            <div className="relative">
              <select
                className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value)}
              >
                <option value="">Todos los tipos</option>
                {tiposUnicos.map((tipo) => (
                  <option key={tipo} value={tipo}>
                    {tipo}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Botón limpiar filtros */}
            {(filtroEstado || filtroTipo || busqueda) && (
              <button
                onClick={() => {
                  setFiltroEstado("");
                  setFiltroTipo("");
                  setBusqueda("");
                }}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
              >
                <XMarkIcon className="h-4 w-4" />
                Limpiar filtros
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mensaje si no hay resultados */}
      {habitacionesFiltradas.length === 0 ? (
        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <div className="h-24 w-24 mx-auto mb-4 text-gray-300">
              <svg className="h-full w-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h4 className="text-xl font-semibold text-gray-700 mb-2">No se encontraron habitaciones</h4>
            <p className="text-gray-500 mb-6">
              {habitaciones.length === 0 
                ? "No hay habitaciones registradas. Comience agregando una nueva."
                : "No hay habitaciones que coincidan con los filtros aplicados."}
            </p>
            {(filtroEstado || filtroTipo || busqueda) && (
              <button
                onClick={() => {
                  setFiltroEstado("");
                  setFiltroTipo("");
                  setBusqueda("");
                }}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
              >
                Ver todas las habitaciones
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Tarjetas de habitaciones - Responsivas */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {habitacionesFiltradas.map((h) => {
            const imgs = h.imagenes?.length > 0 ? h.imagenes : [];
            const index = indicesCarrusel[h.id_habitacion] || 0;
            const imagenActual = imgs.length > 0
              ? imgs[index]
              : "https://via.placeholder.com/400x300?text=Sin+Imagen";

            const EstadoIcon = estadoConfig[h.estado]?.icon || CheckCircleIcon;
            const estadoInfo = estadoConfig[h.estado] || estadoConfig.disponible;

            return (
              <div
                key={h.id_habitacion}
                className="group shadow-lg hover:shadow-2xl rounded-2xl overflow-hidden border border-gray-200 bg-white transition-all duration-300 hover:-translate-y-1"
              >
                {/* Carrusel de imágenes */}
                <div className="relative w-full h-56 bg-gray-100">
                  <img
                    src={imagenActual}
                    alt={`Habitación ${h.numero}`}
                    className="w-full h-full object-cover cursor-pointer"
                    onClick={() => openImageModal(imagenActual)}
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/400x300?text=Error+Imagen";
                    }}
                  />

                  {/* Indicador de imagen actual */}
                  {imgs.length > 1 && (
                    <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex gap-1">
                      {imgs.map((_, i) => (
                        <div
                          key={i}
                          className={`h-2 w-2 rounded-full ${i === index ? 'bg-white' : 'bg-white/50'}`}
                        />
                      ))}
                    </div>
                  )}

                  {/* Controles del carrusel */}
                  {imgs.length > 1 && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          prevImage(h.id_habitacion, imgs.length);
                        }}
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition-all"
                      >
                        <ArrowLeftIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          nextImage(h.id_habitacion, imgs.length);
                        }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition-all"
                      >
                        <ArrowRightIcon className="h-4 w-4" />
                      </button>
                    </>
                  )}

                  {/* Badge de estado en esquina */}
                  <div className={`absolute top-3 right-3 px-3 py-1 rounded-full border ${estadoInfo.color} flex items-center gap-1.5`}>
                    <EstadoIcon className="h-3 w-3" />
                    <span className="text-xs font-semibold">{estadoInfo.label}</span>
                  </div>

                  {/* Botón para ver imagen en grande */}
                  {imgs.length > 0 && (
                    <button
                      onClick={() => openImageModal(imagenActual)}
                      className="absolute top-3 left-3 bg-black/50 hover:bg-black/70 p-2 rounded-full text-white"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {/* Contenido de la tarjeta */}
                <div className="p-5">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="text-xl font-bold text-gray-900">Habitación {h.numero}</h4>
                      <p className="text-gray-600 mt-1">{h.tipo_habitacion}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-blue-600">
                        Bs. {h.precio_total ?? h.precio_base}
                      </p>
                      <p className="text-xs text-gray-500">por noche</p>
                    </div>
                  </div>

                  {/* Información adicional */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-500">Piso</p>
                      <p className="font-semibold">{h.piso || "-"}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-500">Capacidad</p>
                      <p className="font-semibold">{h.capacidad} personas</p>
                    </div>
                  </div>

                  {/* Descripción (si existe) */}
                  {h.descripcion && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {h.descripcion}
                    </p>
                  )}

                  {/* Acciones */}
                  <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => onEdit(h)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
                    >
                      <PencilIcon className="h-4 w-4" />
                      Editar
                    </button>
                    
                    <button
                      onClick={() => handleDelete(h.id_habitacion, h.numero)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
                    >
                      <TrashIcon className="h-4 w-4" />
                      Eliminar
                    </button>
                    
                    <div className="w-full mt-2">
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        value={h.estado}
                        onChange={(e) => handleEstado(h.id_habitacion, e.target.value)}
                      >
                        <option value="disponible">Cambiar a: Disponible</option>
                        <option value="ocupada">Cambiar a: Ocupada</option>
                        <option value="limpieza">Cambiar a: Limpieza</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal para ver imagen en grande */}
      {imagenModal.open && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <button
            onClick={closeImageModal}
            className="absolute top-4 right-4 text-white hover:text-gray-300"
          >
            <XMarkIcon className="h-8 w-8" />
          </button>
          <img
            src={imagenModal.url}
            alt="Vista ampliada"
            className="max-w-full max-h-[90vh] object-contain rounded-lg"
          />
        </div>
      )}
    </div>
  );
};

export default HabitacionesLista;