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

const normalizar = (v = "") => String(v).trim().toLowerCase();

const parsePermiso = (nombre = "") => {
  const n = normalizar(nombre);

  // Formato recomendado: "recurso.accion"
  if (n.includes(".")) {
    const [modulo, accion] = n.split(".");
    return { modulo, accion, formato: "dot" };
  }

  // Formato alterno: "accion_modulo" (ej: ver_reserva)
  if (n.includes("_")) {
    const partes = n.split("_").filter(Boolean);
    if (partes.length >= 2) {
      const accion = partes[0];
      const modulo = partes[partes.length - 1];
      return { modulo, accion, formato: "underscore" };
    }
  }

  return { modulo: "general", accion: n, formato: "unknown" };
};

const accionesDeLectura = new Set(["ver", "listar", "read", "list"]);

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
    const permiso = permisos.find((p) => p.id_permiso === id_permiso);
    const { modulo, accion } = parsePermiso(permiso?.nombre);

    const byId = new Map(permisos.map((p) => [p.id_permiso, p]));
    const byNombre = new Map(permisos.map((p) => [normalizar(p.nombre), p]));

    const buscarPermisoVer = (mod) => {
      // Preferimos formato dot: "modulo.ver"
      const candidatoDot = byNombre.get(`${normalizar(mod)}.ver`);
      if (candidatoDot) return candidatoDot.id_permiso;

      // Formato underscore: "ver_modulo"
      const candidatoUnderscore = byNombre.get(`ver_${normalizar(mod)}`);
      if (candidatoUnderscore) return candidatoUnderscore.id_permiso;

      // Fallback: algo que termine con ".ver" y contenga el módulo
      for (const [nombreKey, p] of byNombre.entries()) {
        if (nombreKey.endsWith(".ver") && nombreKey.startsWith(`${normalizar(mod)}.`)) {
          return p.id_permiso;
        }
      }
      return null;
    };

    const getPermisosSeleccionadosDeModulo = (mod, listaIds) => {
      const modKey = normalizar(mod);
      return listaIds.filter((id) => {
        const p = byId.get(id);
        if (!p) return false;
        const parsed = parsePermiso(p.nombre);
        return normalizar(parsed.modulo) === modKey;
      });
    };

    let nuevaLista = [...formData.permisos];
    const yaSeleccionado = nuevaLista.includes(id_permiso);

    if (yaSeleccionado) {
      // Si intenta quitar "ver" pero hay otros permisos del módulo, no lo permitimos.
      const esLectura = accionesDeLectura.has(normalizar(accion));
      if (esLectura) {
        const seleccionadosModulo = getPermisosSeleccionadosDeModulo(modulo, nuevaLista).filter(
          (id) => id !== id_permiso
        );
        if (seleccionadosModulo.length > 0) {
          // Mantener "ver" activo
          setFormData({ ...formData, permisos: nuevaLista });
          return;
        }
      }

      nuevaLista = nuevaLista.filter((p) => p !== id_permiso);
      setFormData({ ...formData, permisos: nuevaLista });
      return;
    }

    // Agregar el permiso seleccionado
    nuevaLista.push(id_permiso);

    // Regla: al seleccionar cualquier permiso de un módulo, activar automáticamente su permiso "ver"
    // - Incluye cualquier permiso que contenga/sea del módulo "rol"
    const moduloObjetivo = normalizar(modulo);
    const idPermisoVer = buscarPermisoVer(moduloObjetivo);

    const debeForzarVer =
      !accionesDeLectura.has(normalizar(accion)) &&
      idPermisoVer &&
      !nuevaLista.includes(idPermisoVer);

    if (debeForzarVer) {
      nuevaLista.push(idPermisoVer);
    }

    // Caso especial solicitado: si el permiso pertenece al módulo "rol" (o contiene rol),
    // asegurar "ver" de rol.
    const nombrePermiso = normalizar(permiso?.nombre);
    const pareceRol = moduloObjetivo.includes("rol") || nombrePermiso.includes("rol");
    if (pareceRol) {
      const idVerRol = buscarPermisoVer("rol");
      if (idVerRol && !nuevaLista.includes(idVerRol)) {
        nuevaLista.push(idVerRol);
      }
    }

    setFormData({ ...formData, permisos: [...new Set(nuevaLista)] });
  };

  const handleSelectAllModule = (moduloPermisos, seleccionar) => {
    let nuevaLista = [...formData.permisos];
    
    const byNombre = new Map(permisos.map((p) => [normalizar(p.nombre), p]));

    const buscarPermisoVer = (mod) => {
      const candidatoDot = byNombre.get(`${normalizar(mod)}.ver`);
      if (candidatoDot) return candidatoDot.id_permiso;
      const candidatoUnderscore = byNombre.get(`ver_${normalizar(mod)}`);
      if (candidatoUnderscore) return candidatoUnderscore.id_permiso;
      return null;
    };

    const moduloKey = (() => {
      const first = moduloPermisos?.[0];
      const parsed = parsePermiso(first?.nombre);
      return parsed.modulo;
    })();

    moduloPermisos.forEach((p) => {
      if (seleccionar && !nuevaLista.includes(p.id_permiso)) {
        nuevaLista.push(p.id_permiso);
      } else if (!seleccionar) {
        nuevaLista = nuevaLista.filter((id) => id !== p.id_permiso);
      }
    });

    if (seleccionar && moduloKey) {
      const idVer = buscarPermisoVer(moduloKey);
      if (idVer && !nuevaLista.includes(idVer)) {
        nuevaLista.push(idVer);
      }
    }

    setFormData({ ...formData, permisos: [...new Set(nuevaLista)] });
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