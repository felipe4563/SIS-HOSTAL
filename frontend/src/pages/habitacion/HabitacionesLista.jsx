import { useEffect, useState } from "react";
import {
  listarHabitaciones,
  eliminarHabitacion,
  cambiarEstadoHabitacion,
} from "../../services/habitacion";

const HabitacionesLista = ({ onEdit, reload }) => {
  const [habitaciones, setHabitaciones] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filtros
  const [filtroEstado, setFiltroEstado] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("");

  const cargarHabitaciones = async () => {
    try {
      setLoading(true);
      const data = await listarHabitaciones();
      setHabitaciones(data);
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

  // Aplicar filtros
  const habitacionesFiltradas = habitaciones.filter((h) => {
    const estadoMatch = filtroEstado ? h.estado === filtroEstado : true;
    const tipoMatch = filtroTipo ? h.tipo_habitacion === filtroTipo : true;
    return estadoMatch && tipoMatch;
  });

  // Obtener tipos únicos para el filtro
  const tiposUnicos = [...new Set(habitaciones.map((h) => h.tipo_habitacion))];

  return (
    <div className="bg-white shadow rounded p-4">
      <h3 className="text-xl font-semibold mb-4">Lista de Habitaciones</h3>

      {/* Filtros */}
      <div className="flex gap-4 mb-4">
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

      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 border">Número</th>
            <th className="p-2 border">Tipo</th>
            <th className="p-2 border">Precio</th>
            <th className="p-2 border">Estado</th>
            <th className="p-2 border">Acciones</th>
          </tr>
        </thead>

        <tbody>
          {habitacionesFiltradas.map((h) => (
            <tr key={h.id_habitacion} className="hover:bg-gray-50">
              <td className="p-2 border text-center font-medium">{h.numero}</td>
              <td className="p-2 border text-center">{h.tipo_habitacion}</td>
              <td className="p-2 border text-center">Bs. {h.precio_total ?? h.precio_base}</td>
              <td className="p-2 border text-center">
                <span
                  className={`px-2 py-1 rounded text-sm font-medium ${
                    badgeColor[h.estado] || "bg-gray-200 text-gray-600"
                  }`}
                >
                  {h.estado}
                </span>
              </td>
              <td className="p-2 border text-center space-x-2">
                <button
                  onClick={() => onEdit(h)}
                  className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(h.id_habitacion)}
                  className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Eliminar
                </button>
                <select
                  className="px-2 py-1 border rounded"
                  value={h.estado}
                  onChange={(e) =>
                    handleEstado(h.id_habitacion, e.target.value)
                  }
                >
                  <option value="disponible">Disponible</option>
                  <option value="ocupada">Ocupada</option>
                  <option value="limpieza">En Limpieza</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {habitacionesFiltradas.length === 0 && (
        <p className="text-center text-gray-500 mt-4">
          No hay habitaciones que coincidan con los filtros.
        </p>
      )}
    </div>
  );
};

export default HabitacionesLista;
