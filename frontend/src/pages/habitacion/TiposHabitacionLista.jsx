import { useEffect, useState } from "react";
import { listarTipos, crearTipo, eliminarTipo, actualizarTipo } from "../../services/tipo";
import {
  PlusCircleIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  BuildingOfficeIcon,
  ExclamationTriangleIcon
} from "@heroicons/react/24/outline";

const TiposHabitacionLista = () => {
  const [tipos, setTipos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingList, setLoadingList] = useState(true);
  const [error, setError] = useState(null);

  const [form, setForm] = useState({
    nombre: "",
    capacidad: "",
    precio_base: "",
    descripcion: "",
  });

  const [editando, setEditando] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const cargarTipos = async () => {
    try {
      setLoadingList(true);
      setError(null);
      const data = await listarTipos();
      setTipos(data);
    } catch (error) {
      console.error("Error al cargar tipos:", error);
      setError("No se pudieron cargar los tipos de habitación");
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    cargarTipos();
  }, []);

  // Crear o Editar tipo
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.nombre.trim()) {
      setError("El nombre es obligatorio");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (editando) {
        await actualizarTipo(editando, form);
        setEditando(null);
      } else {
        await crearTipo(form);
      }

      // Reset formulario
      setForm({ nombre: "", capacidad: "", precio_base: "", descripcion: "" });
      setShowForm(false);
      await cargarTipos();
    } catch (error) {
      console.error("Error:", error);
      const errorMsg = error.response?.data?.message || "Error al guardar tipo de habitación";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Eliminar
  const handleDelete = async (id, nombre) => {
    if (!confirm(`¿Está seguro de eliminar el tipo "${nombre}"?`)) return;

    try {
      await eliminarTipo(id);
      await cargarTipos();
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Error al eliminar tipo";
      alert(errorMsg);
    }
  };

  // Cargar datos al formulario
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

  const cancelarEdicion = () => {
    setEditando(null);
    setForm({ nombre: "", capacidad: "", precio_base: "", descripcion: "" });
    setShowForm(false);
    setError(null);
  };

  const nuevoTipo = () => {
    setEditando(null);
    setForm({ nombre: "", capacidad: "", precio_base: "", descripcion: "" });
    setShowForm(true);
    setError(null);
  };

  if (loadingList) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <ArrowPathIcon className="h-12 w-12 text-blue-500 animate-spin mx-auto mb-3" />
          <p className="text-gray-600">Cargando tipos de habitación...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BuildingOfficeIcon className="h-8 w-8" />
            <div>
              <h2 className="text-2xl font-bold">Tipos de Habitación</h2>
              <p className="text-indigo-100 text-sm">
                Administra los diferentes tipos de habitaciones disponibles
              </p>
            </div>
          </div>
          <button
            onClick={nuevoTipo}
            className="flex items-center gap-2 bg-white text-indigo-700 hover:bg-indigo-50 px-4 py-2 rounded-lg font-semibold transition-colors"
          >
            <PlusCircleIcon className="h-5 w-5" />
            Nuevo Tipo
          </button>
        </div>
      </div>

      {/* Formulario - Solo se muestra cuando showForm es true */}
      {showForm && (
        <div className="p-6 border-b border-gray-200">
          <div className="bg-gradient-to-r from-gray-50 to-white rounded-xl p-5 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <DocumentTextIcon className="h-5 w-5 text-indigo-500" />
                {editando ? "Editar Tipo" : "Nuevo Tipo de Habitación"}
              </h3>
              <button
                onClick={cancelarEdicion}
                className="p-1 hover:bg-gray-100 rounded-lg"
              >
                <XMarkIcon className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Nombre */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre del Tipo *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={form.nombre}
                      onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                      className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Ej: Matrimonial, Suite, Individual"
                      required
                      disabled={loading}
                    />
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                      <DocumentTextIcon className="h-5 w-5" />
                    </div>
                  </div>
                </div>

                {/* Capacidad */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Capacidad (personas) *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={form.capacidad}
                      onChange={(e) => setForm({ ...form, capacidad: e.target.value })}
                      className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Ej: 2"
                      min="1"
                      required
                      disabled={loading}
                    />
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                      <UserGroupIcon className="h-5 w-5" />
                    </div>
                  </div>
                </div>

                {/* Precio Base */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Precio Base (Bs.) *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={form.precio_base}
                      onChange={(e) => setForm({ ...form, precio_base: e.target.value })}
                      className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="0.00"
                      min="1"
                      step="0.01"
                      required
                      disabled={loading}
                    />
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                      <CurrencyDollarIcon className="h-5 w-5" />
                    </div>
                  </div>
                </div>

                {/* Descripción */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción
                  </label>
                  <textarea
                    value={form.descripcion}
                    onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Describe las características de este tipo de habitación"
                    rows="3"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Botones del formulario */}
              <div className="flex flex-wrap gap-3 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <ArrowPathIcon className="h-4 w-4 animate-spin" />
                      {editando ? "Actualizando..." : "Guardando..."}
                    </>
                  ) : (
                    <>
                      <CheckCircleIcon className="h-4 w-4" />
                      {editando ? "Actualizar Tipo" : "Crear Tipo"}
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={cancelarEdicion}
                  disabled={loading}
                  className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lista de tipos */}
      <div className="p-6">
        {error && !showForm && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {tipos.length === 0 ? (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <BuildingOfficeIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h4 className="text-xl font-semibold text-gray-700 mb-2">No hay tipos de habitación</h4>
              <p className="text-gray-500 mb-6">
                Comienza creando tu primer tipo de habitación para poder registrar habitaciones.
              </p>
              <button
                onClick={nuevoTipo}
                className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-semibold"
              >
                <PlusCircleIcon className="h-5 w-5" />
                Crear Primer Tipo
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Tipos Registrados ({tipos.length})
              </h3>
              <button
                onClick={() => cargarTipos()}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800"
              >
                <ArrowPathIcon className="h-4 w-4" />
                Actualizar
              </button>
            </div>

            {/* Tarjetas para móvil */}
            <div className="block md:hidden space-y-4">
              {tipos.map((t) => (
                <div key={t.id_tipo} className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-bold text-gray-900">{t.nombre}</h4>
                      <p className="text-sm text-gray-600">ID: {t.id_tipo}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(t)}
                        className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200"
                        title="Editar"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(t.id_tipo, t.nombre)}
                        className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                        title="Eliminar"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="bg-white p-2 rounded-lg border">
                      <p className="text-xs text-gray-500">Capacidad</p>
                      <p className="font-semibold flex items-center gap-1">
                        <UserGroupIcon className="h-4 w-4" />
                        {t.capacidad} personas
                      </p>
                    </div>
                    <div className="bg-white p-2 rounded-lg border">
                      <p className="text-xs text-gray-500">Precio Base</p>
                      <p className="font-semibold flex items-center gap-1">
                        <CurrencyDollarIcon className="h-4 w-4" />
                        Bs. {parseFloat(t.precio_base).toFixed(2)}
                      </p>
                    </div>
                  </div>
                  
                  {t.descripcion && (
                    <div className="pt-3 border-t border-gray-200">
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {t.descripcion}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Tabla para desktop */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 border-b border-gray-200">
                      ID
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 border-b border-gray-200">
                      Nombre
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 border-b border-gray-200">
                      Capacidad
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 border-b border-gray-200">
                      Precio Base
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 border-b border-gray-200">
                      Descripción
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 border-b border-gray-200">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {tipos.map((t) => (
                    <tr 
                      key={t.id_tipo} 
                      className="hover:bg-gray-50 border-b border-gray-100 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center justify-center w-8 h-8 bg-indigo-100 text-indigo-700 rounded-full font-semibold text-sm">
                          {t.id_tipo}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-medium text-gray-900">
                        {t.nombre}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <UserGroupIcon className="h-4 w-4 text-gray-400" />
                          <span className="font-semibold">{t.capacidad}</span>
                          <span className="text-gray-500 text-sm">personas</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <CurrencyDollarIcon className="h-4 w-4 text-gray-400" />
                          <span className="font-bold text-green-600">
                            Bs. {parseFloat(t.precio_base).toFixed(2)}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-gray-600 text-sm line-clamp-2 max-w-xs">
                          {t.descripcion || (
                            <span className="text-gray-400 italic">Sin descripción</span>
                          )}
                        </p>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(t)}
                            className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg font-medium text-sm transition-colors"
                            title="Editar"
                          >
                            <PencilIcon className="h-3.5 w-3.5" />
                            <span className="hidden lg:inline">Editar</span>
                          </button>
                          <button
                            onClick={() => handleDelete(t.id_tipo, t.nombre)}
                            className="flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg font-medium text-sm transition-colors"
                            title="Eliminar"
                          >
                            <TrashIcon className="h-3.5 w-3.5" />
                            <span className="hidden lg:inline">Eliminar</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Información adicional */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <p className="text-sm text-blue-700 font-semibold">Total Tipos</p>
                  <p className="text-2xl font-bold text-blue-800">{tipos.length}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                  <p className="text-sm text-green-700 font-semibold">Capacidad Promedio</p>
                  <p className="text-2xl font-bold text-green-800">
                    {tipos.length > 0 
                      ? (tipos.reduce((acc, t) => acc + parseInt(t.capacidad), 0) / tipos.length).toFixed(1)
                      : 0
                    } personas
                  </p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                  <p className="text-sm text-purple-700 font-semibold">Precio Promedio</p>
                  <p className="text-2xl font-bold text-purple-800">
                    {tipos.length > 0 
                      ? "Bs. " + (tipos.reduce((acc, t) => acc + parseFloat(t.precio_base), 0) / tipos.length).toFixed(2)
                      : "Bs. 0.00"
                    }
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TiposHabitacionLista;