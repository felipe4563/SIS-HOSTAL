import { useEffect, useState } from "react";
import { listarTipos, crearTipo, eliminarTipo, actualizarTipo } from "../../services/tipo";

const TiposHabitacionLista = () => {
  const [tipos, setTipos] = useState([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    nombre: "",
    capacidad: "",
    precio_base: "",
    descripcion: "",
  });

  const [editando, setEditando] = useState(null); // ← para editar

  const cargarTipos = async () => {
    try {
      const data = await listarTipos();
      setTipos(data);
    } catch (error) {
      console.error("Error al cargar tipos:", error);
    }
  };

  useEffect(() => {
    cargarTipos();
  }, []);

  // Crear o Editar tipo
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.nombre.trim()) return alert("El nombre es obligatorio.");

    setLoading(true);

    try {
      if (editando) {
        // Actualizar
        await actualizarTipo(editando, form);
        setEditando(null);
      } else {
        // Crear
        await crearTipo(form);
      }

      // Reset formulario
      setForm({ nombre: "", capacidad: "", precio_base: "", descripcion: "" });
      cargarTipos();
    } catch (error) {
      console.error("Error:", error);
      alert(error.response?.data?.message || "Error al guardar tipo.");
    } finally {
      setLoading(false);
    }
  };

  // Eliminar
  const handleDelete = async (id) => {
    if (!confirm("¿Seguro que deseas eliminar este tipo?")) return;

    try {
      await eliminarTipo(id);
      cargarTipos();
    } catch (error) {
      alert(error.response?.data?.message || "Error al eliminar tipo.");
    }
  };

  // Cargar datos al formulario
  const handleEdit = (tipo) => {
    setEditando(tipo.id_tipo);
    setForm({
      nombre: tipo.nombre,
      capacidad: tipo.capacidad,
      precio_base: tipo.precio_base,
      descripcion: tipo.descripcion,
    });
  };

  return (
    <div className="p-4 bg-white shadow rounded">

      <h3 className="text-xl font-semibold mb-4">Tipos de Habitación</h3>

      {/* Formularo */}
      <form onSubmit={handleSubmit} className="mb-6 space-y-3">

        <div>
          <label className="block font-medium">Nombre</label>
          <input
            type="text"
            value={form.nombre}
            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            className="w-full border px-3 py-2 rounded"
            required
          />
        </div>

        <div>
          <label className="block font-medium">Capacidad</label>
          <input
            type="number"
            value={form.capacidad}
            onChange={(e) => setForm({ ...form, capacidad: e.target.value })}
            className="w-full border px-3 py-2 rounded"
            required
          />
        </div>

        <div>
          <label className="block font-medium">Precio Base</label>
          <input
            type="number"
            value={form.precio_base}
            onChange={(e) => setForm({ ...form, precio_base: e.target.value })}
            className="w-full border px-3 py-2 rounded"
            required
          />
        </div>

        <div>
          <label className="block font-medium">Descripción</label>
          <textarea
            value={form.descripcion}
            onChange={(e) =>
              setForm({ ...form, descripcion: e.target.value })
            }
            className="w-full border px-3 py-2 rounded"
          ></textarea>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {loading
            ? "Guardando..."
            : editando
            ? "Actualizar Tipo"
            : "Registrar Tipo"}
        </button>

        {editando && (
          <button
            type="button"
            onClick={() => {
              setEditando(null);
              setForm({ nombre: "", capacidad: "", precio_base: "", descripcion: "" });
            }}
            className="ml-2 bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
          >
            Cancelar
          </button>
        )}
      </form>

      {/* Lista */}
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-3 py-2">ID</th>
            <th className="border px-3 py-2">Nombre</th>
            <th className="border px-3 py-2">Capacidad</th>
            <th className="border px-3 py-2">Precio Base</th>
            <th className="border px-3 py-2">Descripción</th>
            <th className="border px-3 py-2">Acciones</th>
          </tr>
        </thead>

        <tbody>
          {tipos.map((t) => (
            <tr key={t.id_tipo}>
              <td className="border px-3 py-2">{t.id_tipo}</td>
              <td className="border px-3 py-2">{t.nombre}</td>
              <td className="border px-3 py-2">{t.capacidad}</td>
              <td className="border px-3 py-2">{t.precio_base}</td>
              <td className="border px-3 py-2">{t.descripcion || "-"}</td>

              <td className="border px-3 py-2 text-center">
                <button
                  onClick={() => handleEdit(t)}
                  className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 mr-2"
                >
                  Editar
                </button>

                <button
                  onClick={() => handleDelete(t.id_tipo)}
                  className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                >
                  Eliminar
                </button>
              </td>

            </tr>
          ))}
        </tbody>
      </table>

    </div>
  );
};

export default TiposHabitacionLista;
