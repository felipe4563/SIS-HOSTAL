import { useEffect, useState } from "react";
import {
  getRoles,
  createRol,
  updateRol,
  assignPermisos,
  deleteRol
} from "../../services/rol.js";
import { getPermisos } from "../../services/permisos.js";
import {
  PlusCircleIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  ShieldCheckIcon,
  UsersIcon,
  DocumentCheckIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  ClipboardDocumentCheckIcon
} from "@heroicons/react/24/outline";

const RolesList = () => {
  const [roles, setRoles] = useState([]);
  const [permisos, setPermisos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingRoles, setLoadingRoles] = useState(true);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    nombre_rol: "",
    descripcion: "",
    permisos: []
  });

  const [editando, setEditando] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedPermisos, setSelectedPermisos] = useState(new Set());

  useEffect(() => {
    fetchRoles();
    fetchPermisos();
  }, []);

  const fetchRoles = async () => {
    try {
      setLoadingRoles(true);
      setError(null);
      const data = await getRoles();
      
      const rolesConArray = data.map(r => ({
        ...r,
        permisos: r.permisos_nombres
          ? r.permisos_nombres.split(",").filter(p => p.trim() !== "")
          : []
      }));
      
      setRoles(rolesConArray);
    } catch (err) {
      console.error("Error al obtener roles:", err);
      setError("No se pudieron cargar los roles");
    } finally {
      setLoadingRoles(false);
    }
  };

  const fetchPermisos = async () => {
    try {
      const data = await getPermisos();
      setPermisos(data);
    } catch (err) {
      console.error("Error al obtener permisos:", err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheck = (id_permiso) => {
    const newSelected = new Set(selectedPermisos);
    if (newSelected.has(id_permiso)) {
      newSelected.delete(id_permiso);
    } else {
      newSelected.add(id_permiso);
    }
    setSelectedPermisos(newSelected);
    
    // Actualizar formData
    setFormData(prev => ({
      ...prev,
      permisos: Array.from(newSelected)
    }));
  };

  const handleSelectAll = () => {
    if (selectedPermisos.size === permisos.length) {
      // Deseleccionar todos
      setSelectedPermisos(new Set());
      setFormData(prev => ({ ...prev, permisos: [] }));
    } else {
      // Seleccionar todos
      const allPermisos = new Set(permisos.map(p => p.id_permiso));
      setSelectedPermisos(allPermisos);
      setFormData(prev => ({ ...prev, permisos: Array.from(allPermisos) }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.nombre_rol.trim()) {
      setError("El nombre del rol es obligatorio");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let rolId;

      if (editando) {
        await updateRol(editando.id_rol, formData);
        rolId = editando.id_rol;
      } else {
        const nuevo = await createRol(formData);
        rolId = nuevo.id_rol;
      }

      // Asignar permisos
      if (formData.permisos.length > 0) {
        await assignPermisos(rolId, formData.permisos);
      }

      // Resetear
      resetForm();
      await fetchRoles();
      
    } catch (err) {
      console.error("Error al guardar rol:", err);
      setError(err.response?.data?.message || "Error al guardar el rol");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (rol) => {
    setEditando(rol);
    
    // Convertir permisos a IDs
    const permisosIds = permisos
      .filter(p => rol.permisos.includes(p.nombre))
      .map(p => p.id_permiso);
    
    const newSelected = new Set(permisosIds);
    setSelectedPermisos(newSelected);
    
    setFormData({
      nombre_rol: rol.nombre_rol,
      descripcion: rol.descripcion || "",
      permisos: permisosIds
    });
    
    setShowForm(true);
    setError(null);
  };

  const handleDelete = async (id, nombre) => {
    if (!confirm(`¿Está seguro de eliminar el rol "${nombre}"?`)) return;
    
    try {
      await deleteRol(id);
      await fetchRoles();
    } catch (err) {
      console.error("Error al eliminar rol:", err);
      alert(err.response?.data?.message || "Error al eliminar el rol");
    }
  };

  const resetForm = () => {
    setFormData({ nombre_rol: "", descripcion: "", permisos: [] });
    setSelectedPermisos(new Set());
    setEditando(null);
    setShowForm(false);
    setError(null);
  };

  const nuevoRol = () => {
    resetForm();
    setShowForm(true);
  };

  const categorizarPermisos = () => {
    const categorias = {};
    
    permisos.forEach(permiso => {
      const categoria = permiso.nombre.split('_')[0] || 'General';
      if (!categorias[categoria]) {
        categorias[categoria] = [];
      }
      categorias[categoria].push(permiso);
    });
    
    return categorias;
  };

  if (loadingRoles) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <ArrowPathIcon className="h-12 w-12 text-blue-500 animate-spin mx-auto mb-3" />
          <p className="text-gray-600">Cargando roles...</p>
        </div>
      </div>
    );
  }

  const categoriasPermisos = categorizarPermisos();

  return (
    <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShieldCheckIcon className="h-8 w-8" />
            <div>
              <h2 className="text-2xl font-bold">Gestión de Roles</h2>
              <p className="text-purple-100 text-sm">
                Administra los roles y permisos del sistema
              </p>
            </div>
          </div>
          <button
            onClick={nuevoRol}
            className="flex items-center gap-2 bg-white text-purple-700 hover:bg-purple-50 px-4 py-2 rounded-lg font-semibold transition-colors"
          >
            <PlusCircleIcon className="h-5 w-5" />
            Nuevo Rol
          </button>
        </div>
      </div>

      {/* Formulario */}
      {showForm && (
        <div className="p-6 border-b border-gray-200">
          <div className="bg-gradient-to-r from-gray-50 to-white rounded-xl p-5 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <ShieldCheckIcon className="h-5 w-5 text-purple-500" />
                {editando ? "Editar Rol" : "Crear Nuevo Rol"}
              </h3>
              <button
                onClick={resetForm}
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

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Información básica */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre del Rol *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="nombre_rol"
                      value={formData.nombre_rol}
                      onChange={handleChange}
                      className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      placeholder="Ej: Administrador, Recepcionista"
                      required
                      disabled={loading}
                    />
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                      <ShieldCheckIcon className="h-5 w-5" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="descripcion"
                      value={formData.descripcion}
                      onChange={handleChange}
                      className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      placeholder="Describe las funciones de este rol"
                      disabled={loading}
                    />
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                      <DocumentCheckIcon className="h-5 w-5" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Permisos */}
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-md font-semibold text-gray-800 flex items-center gap-2">
                    <ClipboardDocumentCheckIcon className="h-5 w-5 text-purple-500" />
                    Permisos ({selectedPermisos.size} seleccionados)
                  </h4>
                  <button
                    type="button"
                    onClick={handleSelectAll}
                    className="text-sm text-purple-600 hover:text-purple-800 font-medium"
                  >
                    {selectedPermisos.size === permisos.length ? "Deseleccionar todos" : "Seleccionar todos"}
                  </button>
                </div>

                <div className="space-y-4">
                  {Object.entries(categoriasPermisos).map(([categoria, permisosCategoria]) => (
                    <div key={categoria} className="border border-gray-200 rounded-lg p-3 bg-white">
                      <h5 className="font-semibold text-gray-700 mb-2 text-sm uppercase tracking-wide">
                        {categoria}
                      </h5>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                        {permisosCategoria.map((permiso) => (
                          <label
                            key={permiso.id_permiso}
                            className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
                              selectedPermisos.has(permiso.id_permiso)
                                ? "bg-purple-50 border border-purple-200"
                                : "hover:bg-gray-50"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={selectedPermisos.has(permiso.id_permiso)}
                              onChange={() => handleCheck(permiso.id_permiso)}
                              className="h-4 w-4 text-purple-600 rounded focus:ring-purple-500"
                              disabled={loading}
                            />
                            <span className="text-sm text-gray-700">
                              {permiso.nombre.replace(categoria + '_', '')}
                            </span>
                            {permiso.descripcion && (
                              <span className="text-xs text-gray-500 ml-auto" title={permiso.descripcion}>
                                <EyeIcon className="h-4 w-4" />
                              </span>
                            )}
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2.5 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <ArrowPathIcon className="h-4 w-4 animate-spin" />
                      {editando ? "Actualizando..." : "Guardando..."}
                    </>
                  ) : (
                    <>
                      <CheckCircleIcon className="h-4 w-4" />
                      {editando ? "Actualizar Rol" : "Crear Rol"}
                    </>
                  )}
                </button>
                
                <button
                  type="button"
                  onClick={resetForm}
                  disabled={loading}
                  className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lista de roles */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-800">
            Roles del Sistema ({roles.length})
          </h3>
          <button
            onClick={() => fetchRoles()}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800"
          >
            <ArrowPathIcon className="h-4 w-4" />
            Actualizar
          </button>
        </div>

        {roles.length === 0 ? (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <UsersIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h4 className="text-xl font-semibold text-gray-700 mb-2">No hay roles registrados</h4>
              <p className="text-gray-500 mb-6">
                Comienza creando tu primer rol para gestionar permisos en el sistema.
              </p>
              <button
                onClick={nuevoRol}
                className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold"
              >
                <PlusCircleIcon className="h-5 w-5" />
                Crear Primer Rol
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Vista móvil - Tarjetas */}
            <div className="block md:hidden space-y-4">
              {roles.map((rol) => (
                <div key={rol.id_rol} className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-bold text-gray-900">{rol.nombre_rol}</h4>
                      {rol.descripcion && (
                        <p className="text-sm text-gray-600 mt-1">{rol.descripcion}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(rol)}
                        className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200"
                        title="Editar"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(rol.id_rol, rol.nombre_rol)}
                        className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                        title="Eliminar"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <p className="text-xs text-gray-500 mb-2">Permisos ({rol.permisos.length})</p>
                    <div className="flex flex-wrap gap-1">
                      {rol.permisos.slice(0, 3).map((permiso, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full"
                        >
                          {permiso}
                        </span>
                      ))}
                      {rol.permisos.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                          +{rol.permisos.length - 3} más
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="pt-3 border-t border-gray-200">
                    <p className="text-xs text-gray-500">
                      ID: <span className="font-semibold text-gray-700">{rol.id_rol}</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Vista desktop - Tabla */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 border-b border-gray-200">
                      ID
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 border-b border-gray-200">
                      Rol
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 border-b border-gray-200">
                      Descripción
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 border-b border-gray-200">
                      Permisos
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 border-b border-gray-200">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {roles.map((rol) => (
                    <tr 
                      key={rol.id_rol} 
                      className="hover:bg-gray-50 border-b border-gray-100 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center justify-center w-8 h-8 bg-purple-100 text-purple-700 rounded-full font-semibold text-sm">
                          {rol.id_rol}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <ShieldCheckIcon className="h-5 w-5 text-purple-500" />
                          <span className="font-semibold text-gray-900">{rol.nombre_rol}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-600 text-sm max-w-xs">
                        {rol.descripcion || (
                          <span className="text-gray-400 italic">Sin descripción</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1 max-w-md">
                          {rol.permisos.slice(0, 5).map((permiso, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full border border-blue-100"
                              title={permiso}
                            >
                              {permiso.length > 15 ? permiso.substring(0, 15) + '...' : permiso}
                            </span>
                          ))}
                          {rol.permisos.length > 5 && (
                            <span 
                              className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                              title={`${rol.permisos.length - 5} permisos más`}
                            >
                              +{rol.permisos.length - 5}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(rol)}
                            className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg font-medium text-sm transition-colors"
                          >
                            <PencilIcon className="h-3.5 w-3.5" />
                            <span className="hidden lg:inline">Editar</span>
                          </button>
                          <button
                            onClick={() => handleDelete(rol.id_rol, rol.nombre_rol)}
                            className="flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg font-medium text-sm transition-colors"
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

            {/* Resumen */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                  <p className="text-sm text-purple-700 font-semibold">Total Roles</p>
                  <p className="text-2xl font-bold text-purple-800">{roles.length}</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <p className="text-sm text-blue-700 font-semibold">Total Permisos</p>
                  <p className="text-2xl font-bold text-blue-800">{permisos.length}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                  <p className="text-sm text-green-700 font-semibold">Permisos Promedio por Rol</p>
                  <p className="text-2xl font-bold text-green-800">
                    {roles.length > 0 
                      ? (roles.reduce((acc, r) => acc + r.permisos.length, 0) / roles.length).toFixed(1)
                      : 0
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

export default RolesList;