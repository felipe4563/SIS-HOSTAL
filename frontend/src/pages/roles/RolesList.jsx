import { useEffect, useState } from "react";
import {
  getRoles,
  createRol,
  updateRol,
  assignPermisos,
  deleteRol
} from "../../services/rol.js";
import { getPermisos } from "../../services/permisos.js";

const RolesList = () => {
  const [roles, setRoles] = useState([]);
  const [permisos, setPermisos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    nombre_rol: "",
    descripcion: "",
    permisos: []
  });

  const [editando, setEditando] = useState(null);

  // Agrupar permisos por módulo (basado en el nombre del permiso)
  const permisosAgrupados = permisos.reduce((grupos, permiso) => {
    // Extraer el módulo del nombre del permiso (ej: "gestionar_usuarios" -> "usuarios")
    const partes = permiso.nombre.split("_");
    const modulo = partes.length > 1 ? partes[partes.length - 1] : "general";
    const moduloCapitalizado = modulo.charAt(0).toUpperCase() + modulo.slice(1);
    
    if (!grupos[moduloCapitalizado]) {
      grupos[moduloCapitalizado] = [];
    }
    grupos[moduloCapitalizado].push(permiso);
    return grupos;
  }, {});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    await Promise.all([fetchRoles(), fetchPermisos()]);
    setLoading(false);
  };

  const fetchRoles = async () => {
    try {
      const data = await getRoles();
      const rolesConArray = data.map(r => ({
        ...r,
        permisos: r.permisos_nombres ? r.permisos_nombres.split(",") : []
      }));
      setRoles(rolesConArray);
    } catch (err) {
      console.error("Error al obtener roles:", err);
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

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleCheck = (id_permiso) => {
    let nuevaLista = [...formData.permisos];

    if (nuevaLista.includes(id_permiso)) {
      nuevaLista = nuevaLista.filter((p) => p !== id_permiso);
    } else {
      nuevaLista.push(id_permiso);
    }

    setFormData({ ...formData, permisos: nuevaLista });
  };

  const handleSelectAllModule = (moduloPermisos, seleccionar) => {
    let nuevaLista = [...formData.permisos];
    
    moduloPermisos.forEach(p => {
      if (seleccionar && !nuevaLista.includes(p.id_permiso)) {
        nuevaLista.push(p.id_permiso);
      } else if (!seleccionar) {
        nuevaLista = nuevaLista.filter(id => id !== p.id_permiso);
      }
    });

    setFormData({ ...formData, permisos: nuevaLista });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      let rolId;

      if (editando) {
        await updateRol(editando.id_rol, formData);
        rolId = editando.id_rol;
      } else {
        const nuevo = await createRol(formData);
        rolId = nuevo.id_rol;
      }

      await assignPermisos(rolId, formData.permisos);

      setFormData({ nombre_rol: "", descripcion: "", permisos: [] });
      setEditando(null);
      setShowForm(false);
      fetchRoles();

    } catch (err) {
      console.error("Error al guardar rol:", err);
      alert(err?.response?.data?.message || "Error al guardar rol");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (rol) => {
    setEditando(rol);
    const permisosIds = permisos
      .filter(p => rol.permisos.includes(p.nombre))
      .map(p => p.id_permiso);

    setFormData({
      nombre_rol: rol.nombre_rol,
      descripcion: rol.descripcion || "",
      permisos: permisosIds
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("¿Eliminar este rol? Esta acción no se puede deshacer.")) return;
    try {
      await deleteRol(id);
      fetchRoles();
    } catch (err) {
      console.error("Error al eliminar rol:", err);
      alert(err?.response?.data?.message || "Error al eliminar rol");
    }
  };

  const handleCancel = () => {
    setFormData({ nombre_rol: "", descripcion: "", permisos: [] });
    setEditando(null);
    setShowForm(false);
  };

  // Colores para badges de permisos
  const getPermisoColor = (permiso) => {
    const nombre = permiso.toLowerCase();
    if (nombre.includes("crear") || nombre.includes("create")) return "bg-green-100 text-green-700";
    if (nombre.includes("editar") || nombre.includes("update") || nombre.includes("gestionar")) return "bg-blue-100 text-blue-700";
    if (nombre.includes("eliminar") || nombre.includes("delete")) return "bg-red-100 text-red-700";
    if (nombre.includes("ver") || nombre.includes("read") || nombre.includes("listar")) return "bg-purple-100 text-purple-700";
    return "bg-gray-100 text-gray-700";
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-md p-8">
        <div className="flex items-center justify-center gap-3">
          <svg className="animate-spin h-8 w-8 text-blue-600" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="text-gray-600 text-lg">Cargando roles...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow-md rounded-xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              🛡️ Gestión de Roles
            </h3>
            <p className="text-gray-500 text-sm mt-1">
              Administra los roles y permisos del sistema
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 rounded-xl px-4 py-2 text-center">
              <p className="text-2xl font-bold text-blue-700">{roles.length}</p>
              <p className="text-xs text-blue-600">Roles</p>
            </div>
            <div className="bg-purple-100 rounded-xl px-4 py-2 text-center">
              <p className="text-2xl font-bold text-purple-700">{permisos.length}</p>
              <p className="text-xs text-purple-600">Permisos</p>
            </div>
            
            <button
              onClick={() => setShowForm(!showForm)}
              className={`px-5 py-2.5 rounded-lg font-medium transition-all flex items-center gap-2 ${
                showForm
                  ? 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200'
              }`}
            >
              {showForm ? '✕ Cerrar' : '➕ Nuevo Rol'}
            </button>
          </div>
        </div>
      </div>

      {/* Formulario */}
      {showForm && (
        <div className="bg-white shadow-md rounded-xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
            <h4 className="text-lg font-semibold text-white flex items-center gap-2">
              {editando ? '✏️ Editar Rol' : '➕ Nuevo Rol'}
            </h4>
            <p className="text-blue-100 text-sm">
              {editando ? 'Modifica los datos del rol' : 'Completa los datos para crear un nuevo rol'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Datos básicos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre del Rol <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="nombre_rol"
                  placeholder="Ej: Administrador, Recepcionista"
                  value={formData.nombre_rol}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción
                </label>
                <input
                  type="text"
                  name="descripcion"
                  placeholder="Descripción breve del rol"
                  value={formData.descripcion}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                />
              </div>
            </div>

            {/* Permisos agrupados */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-gray-700">
                  Permisos del Rol
                </label>
                <span className="text-sm text-gray-500">
                  {formData.permisos.length} seleccionados
                </span>
              </div>

              <div className="border border-gray-200 rounded-xl overflow-hidden">
                {Object.keys(permisosAgrupados).length > 0 ? (
                  Object.entries(permisosAgrupados).map(([modulo, moduloPermisos], idx) => {
                    const todosSeleccionados = moduloPermisos.every(p => 
                      formData.permisos.includes(p.id_permiso)
                    );
                    const algunoSeleccionado = moduloPermisos.some(p => 
                      formData.permisos.includes(p.id_permiso)
                    );

                    return (
                      <div 
                        key={modulo} 
                        className={`${idx > 0 ? 'border-t border-gray-200' : ''}`}
                      >
                        {/* Header del módulo */}
                        <div className="bg-gray-50 px-4 py-3 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-lg">
                              {modulo.toLowerCase().includes('usuario') ? '👥' :
                               modulo.toLowerCase().includes('habitacion') ? '🏨' :
                               modulo.toLowerCase().includes('reserva') ? '📅' :
                               modulo.toLowerCase().includes('cliente') ? '👤' :
                               modulo.toLowerCase().includes('pago') ? '💰' :
                               modulo.toLowerCase().includes('reporte') ? '📊' : '📁'}
                            </span>
                            <span className="font-medium text-gray-700">{modulo}</span>
                            <span className="text-xs text-gray-400">
                              ({moduloPermisos.length} permisos)
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleSelectAllModule(moduloPermisos, !todosSeleccionados)}
                            className={`text-xs px-3 py-1 rounded-full transition-colors ${
                              todosSeleccionados
                                ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                                : algunoSeleccionado
                                ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                            }`}
                          >
                            {todosSeleccionados ? '✓ Todos' : 'Seleccionar todos'}
                          </button>
                        </div>

                        {/* Permisos del módulo */}
                        <div className="px-4 py-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                          {moduloPermisos.map((p) => (
                            <label
                              key={p.id_permiso}
                              className={`flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-all ${
                                formData.permisos.includes(p.id_permiso)
                                  ? 'bg-blue-50 border-2 border-blue-300'
                                  : 'bg-white border-2 border-transparent hover:bg-gray-50'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={formData.permisos.includes(p.id_permiso)}
                                onChange={() => handleCheck(p.id_permiso)}
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-700 truncate">
                                  {p.nombre}
                                </p>
                                {p.descripcion && (
                                  <p className="text-xs text-gray-400 truncate">
                                    {p.descripcion}
                                  </p>
                                )}
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-8 text-center text-gray-400">
                    <div className="text-4xl mb-2">🔐</div>
                    <p>No hay permisos disponibles</p>
                  </div>
                )}
              </div>
            </div>

            {/* Botones */}
            <div className="flex gap-3 pt-4 border-t">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-blue-300 disabled:to-blue-400 text-white py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Guardando...
                  </>
                ) : (
                  <>{editando ? '💾 Actualizar Rol' : '➕ Crear Rol'}</>
                )}
              </button>

              <button
                type="button"
                onClick={handleCancel}
                className="px-6 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 rounded-lg font-medium transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de Roles */}
      <div className="bg-white shadow-md rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b bg-gray-50">
          <h4 className="font-semibold text-gray-700">📋 Lista de Roles</h4>
        </div>

        {roles.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-6xl mb-4">🛡️</div>
            <h4 className="text-xl font-medium text-gray-700 mb-2">No hay roles registrados</h4>
            <p className="text-gray-500 mb-4">Crea el primer rol para comenzar</p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors"
            >
              ➕ Crear primer rol
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {roles.map((rol, index) => (
              <div
                key={rol.id_rol}
                className="p-5 hover:bg-gray-50 transition-colors"
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  {/* Info del rol */}
                  <div className="flex items-start gap-4">
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg shadow-lg">
                      {rol.nombre_rol.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h5 className="font-semibold text-gray-800 text-lg">
                        {rol.nombre_rol}
                      </h5>
                      {rol.descripcion && (
                        <p className="text-sm text-gray-500 mt-0.5">
                          {rol.descripcion}
                        </p>
                      )}
                      
                      {/* Permisos */}
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {rol.permisos.length > 0 ? (
                          <>
                            {rol.permisos.slice(0, 5).map((permiso, i) => (
                              <span
                                key={i}
                                className={`px-2.5 py-1 rounded-full text-xs font-medium ${getPermisoColor(permiso)}`}
                              >
                                {permiso}
                              </span>
                            ))}
                            {rol.permisos.length > 5 && (
                              <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-200 text-gray-600">
                                +{rol.permisos.length - 5} más
                              </span>
                            )}
                          </>
                        ) : (
                          <span className="text-sm text-gray-400 italic">
                            Sin permisos asignados
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="flex items-center gap-2 lg:flex-shrink-0">
                    <span className="text-xs text-gray-400 mr-2">
                      {rol.permisos.length} permisos
                    </span>
                    <button
                      onClick={() => handleEdit(rol)}
                      className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
                    >
                      ✏️ Editar
                    </button>
                    <button
                      onClick={() => handleDelete(rol.id_rol)}
                      className="bg-red-100 hover:bg-red-200 text-red-600 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
                    >
                      🗑️ Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info card */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex gap-3">
          <span className="text-2xl">💡</span>
          <div>
            <h4 className="font-medium text-blue-800">Consejo</h4>
            <p className="text-sm text-blue-600 mt-1">
              Los permisos definen las acciones que cada rol puede realizar en el sistema. 
              Asigna solo los permisos necesarios para cada rol siguiendo el principio de menor privilegio.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RolesList;