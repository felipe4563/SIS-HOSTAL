import { useEffect, useState } from "react";
import { listarTipos, crearTipo, eliminarTipo, actualizarTipo } from "../services/tipo";

const TiposHabitacionLista = () => {
  const [tipos, setTipos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    nombre: "",
    capacidad: "",
    precio_base: "",
    descripcion: "",
  });

  const [editando, setEditando] = useState(null);

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.nombre.trim()) return alert("El nombre es obligatorio.");

    setLoading(true);

    try {
      if (editando) {
        await actualizarTipo(editando, form);
        setEditando(null);
      } else {
        await crearTipo(form);
      }

      setForm({ nombre: "", capacidad: "", precio_base: "", descripcion: "" });
      setShowForm(false);
      cargarTipos();
    } catch (error) {
      console.error("Error:", error);
      alert(error.response?.data?.message || "Error al guardar tipo.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("¿Seguro que deseas eliminar este tipo?")) return;

    try {
      await eliminarTipo(id);
      cargarTipos();
    } catch (error) {
      alert(error.response?.data?.message || "Error al eliminar tipo.");
    }
  };

  const handleEdit = (tipo) => {
    setEditando(tipo.id_tipo);
    setForm({
      nombre: tipo.nombre,
      capacidad: tipo.capacidad,
      precio_base: tipo.precio_base,
      descripcion: tipo.descripcion || "",
    });
    setShowForm(true);
  };

  const handleCancel = () => {
    setEditando(null);
    setForm({ nombre: "", capacidad: "", precio_base: "", descripcion: "" });
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow-md rounded-xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-2xl font-bold text-gray-800">🏷️ Tipos de Habitación</h3>
            <p className="text-gray-500 text-sm mt-1">
              Gestiona los tipos de habitación disponibles
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className={`px-5 py-2.5 rounded-lg font-medium transition-colors flex items-center gap-2 ${
              showForm
                ? 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {showForm ? '✕ Cerrar' : '➕ Nuevo Tipo'}
          </button>
        </div>
      </div>

      {/* Formulario */}
      {showForm && (
        <div className="bg-white shadow-md rounded-xl p-6">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">
            {editando ? '✏️ Editar Tipo' : '➕ Nuevo Tipo de Habitación'}
          </h4>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  placeholder="Ej: Suite, Individual, Doble"
                  className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Capacidad <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={form.capacidad}
                    onChange={(e) => setForm({ ...form, capacidad: e.target.value })}
                    placeholder="Número de personas"
                    className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    min="1"
                    required
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                    👥 personas
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Precio Base (Bs.) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">Bs.</span>
                  <input
                    type="number"
                    value={form.precio_base}
                    onChange={(e) => setForm({ ...form, precio_base: e.target.value })}
                    placeholder="0.00"
                    className="w-full border border-gray-300 pl-12 pr-4 py-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    min="1"
                    step="0.01"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción
                </label>
                <input
                  type="text"
                  value={form.descripcion}
                  onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                  placeholder="Descripción breve del tipo"
                  className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white py-2.5 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Guardando...
                  </>
                ) : (
                  <>{editando ? '💾 Actualizar' : '➕ Registrar'}</>
                )}
              </button>

              <button
                type="button"
                onClick={handleCancel}
                className="px-6 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2.5 rounded-lg font-medium transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de tipos */}
      <div className="bg-white shadow-md rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Nombre</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Capacidad</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Precio Base</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Descripción</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Acciones</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {tipos.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <div className="text-5xl mb-3">🏷️</div>
                    <p className="text-gray-500 font-medium">No hay tipos registrados</p>
                    <p className="text-gray-400 text-sm mt-1">Crea el primer tipo de habitación</p>
                  </td>
                </tr>
              ) : (
                tipos.map((t) => (
                  <tr key={t.id_tipo} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="bg-blue-100 text-blue-700 w-10 h-10 rounded-lg flex items-center justify-center font-bold">
                          {t.nombre.charAt(0).toUpperCase()}
                        </span>
                        <span className="font-medium text-gray-800">{t.nombre}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                        👥 {t.capacidad}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="font-bold text-blue-600">
                        Bs. {parseFloat(t.precio_base).toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600 text-sm">
                      {t.descripcion || <span className="text-gray-400">-</span>}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEdit(t)}
                          className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                          ✏️ Editar
                        </button>
                        <button
                          onClick={() => handleDelete(t.id_tipo)}
                          className="bg-red-100 hover:bg-red-200 text-red-600 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TiposHabitacionLista;