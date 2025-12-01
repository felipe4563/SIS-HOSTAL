import { useEffect, useState } from "react";
import {
  listarHabitaciones,
  eliminarHabitacion,
  cambiarEstadoHabitacion,
} from "../../services/habitacion";

const HabitacionesLista = ({ onEdit, reload }) => {
  const [habitaciones, setHabitaciones] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filtroEstado, setFiltroEstado] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("");

  // Estado de carrusel por habitación
  const [indicesCarrusel, setIndicesCarrusel] = useState({});

  const cargarHabitaciones = async () => {
    try {
      setLoading(true);
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
    }
  };

  const badgeColor = {
    disponible: "bg-green-100 text-green-700",
    ocupada: "bg-red-100 text-red-700",
    limpieza: "bg-yellow-100 text-yellow-700",
  };

  if (loading) return <p>Cargando habitaciones...</p>;

  // Filtrado
  const habitacionesFiltradas = habitaciones.filter((h) => {
    const estadoMatch = filtroEstado ? h.estado === filtroEstado : true;
    const tipoMatch = filtroTipo ? h.tipo_habitacion === filtroTipo : true;
    return estadoMatch && tipoMatch;
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

  return (
    <div className="bg-white shadow rounded p-4">

      <h3 className="text-xl font-semibold mb-4">Habitaciones</h3>

      {/* Filtros */}
      <div className="flex flex-wrap gap-4 mb-6">
        <select
          className="border px-3 py-2 rounded"
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
        >
          <option value="">Todos los estados</option>
          <option value="disponible">Disponible</option>
          <option value="ocupada">Ocupada</option>
          <option value="limpieza">En Limpieza</option>
        </select>

        <select
          className="border px-3 py-2 rounded"
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

        {(filtroEstado || filtroTipo) && (
          <button
            onClick={() => {
              setFiltroEstado("");
              setFiltroTipo("");
            }}
            className="bg-gray-400 text-white px-3 py-1 rounded hover:bg-gray-500"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      {/* Tarjetas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {habitacionesFiltradas.map((h) => {
          const imgs = h.imagenes?.length > 0 ? h.imagenes : [];
          const index = indicesCarrusel[h.id_habitacion] || 0;
          const imagenActual =
            imgs.length > 0
              ? imgs[index]
              : "https://via.placeholder.com/300x200?text=Sin+Imagen";

          return (
            <div
              key={h.id_habitacion}
              className="shadow rounded overflow-hidden border bg-white"
            >
              {/* Carrusel */}
              <div className="relative w-full h-44 bg-black">
                <img
                  src={imagenActual}
                  alt="Habitación"
                  className="w-full h-full object-cover"
                />

                {imgs.length > 1 && (
                  <>
                    {/* Botón previo */}
                    <button
                      onClick={() => prevImage(h.id_habitacion, imgs.length)}
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-white bg-opacity-70 hover:bg-opacity-100 px-2 py-1 rounded"
                    >
                      ◀
                    </button>

                    {/* Botón siguiente */}
                    <button
                      onClick={() => nextImage(h.id_habitacion, imgs.length)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-white bg-opacity-70 hover:bg-opacity-100 px-2 py-1 rounded"
                    >
                      ▶
                    </button>
                  </>
                )}
              </div>

              <div className="p-4 space-y-2">
                <h4 className="text-lg font-bold">Habitación {h.numero}</h4>
                <p className="text-gray-700">{h.tipo_habitacion}</p>

                <p className="font-bold text-blue-700">
                  Bs. {h.precio_total ?? h.precio_base}
                </p>

                <span
                  className={`px-2 py-1 rounded text-sm font-medium ${
                    badgeColor[h.estado] || "bg-gray-200 text-gray-600"
                  }`}
                >
                  {h.estado}
                </span>

                {/* Acciones */}
                <div className="flex flex-wrap justify-between mt-3 gap-2">
                  <button
                    onClick={() => onEdit(h)}
                    className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                  >
                    Editar
                  </button>

                  <button
                    onClick={() => handleDelete(h.id_habitacion)}
                    className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                  >
                    Eliminar
                  </button>

                  <select
                    className="px-2 py-1 border rounded text-sm"
                    value={h.estado}
                    onChange={(e) => handleEstado(h.id_habitacion, e.target.value)}
                  >
                    <option value="disponible">Disponible</option>
                    <option value="ocupada">Ocupada</option>
                    <option value="limpieza">En Limpieza</option>
                  </select>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {habitacionesFiltradas.length === 0 && (
        <p className="text-center text-gray-500 mt-4">
          No hay habitaciones que coincidan con los filtros.
        </p>
      )}
    </div>
  );
};

export default HabitacionesLista;
