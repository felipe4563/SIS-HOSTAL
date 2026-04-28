import { useEffect, useState } from "react";
import {
  getRoles,
  createRol,
  updateRol,
  assignPermisos,
  deleteRol
} from "../../services/rol.js";
import { getPermisos } from "../../services/permisos.js";
import RolesForm from "./RolesForm.jsx";
import RolesItemsList from "./RolesItemsList.jsx";

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

      {showForm && (
        <RolesForm
          editando={editando}
          formData={formData}
          permisos={permisos}
          saving={saving}
          onSubmit={handleSubmit}
          onChange={handleChange}
          onCheck={handleCheck}
          onSelectAllModule={handleSelectAllModule}
          onCancel={handleCancel}
        />
      )}

      <RolesItemsList
        roles={roles}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onCreateFirst={() => setShowForm(true)}
      />

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