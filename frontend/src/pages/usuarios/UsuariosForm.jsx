import { useEffect, useState, useContext } from "react";
import { registrarUsuario, actualizarUsuario } from "../../services/usuario";
import { getRoles } from "../../services/rol";
import { AuthContext } from "../../context/AuthContext.jsx";

const UsuarioForm = ({ usuarioEdit, onSaved, onCancel }) => {
  const { usuario } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    ci: "",
    correo: "",
    password: "",
    id_rol: "",
  });
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const tienePermiso = (permiso) => usuario?.permisos?.includes(permiso);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const data = await getRoles();
        setRoles(data);
      } catch (err) {
        console.error("Error al obtener roles:", err);
      }
    };
    fetchRoles();
  }, []);

  useEffect(() => {
    if (usuarioEdit) {
      setFormData({
        nombre: usuarioEdit.nombre || "",
        apellido: usuarioEdit.apellido || "",
        ci: usuarioEdit.ci || "",
        correo: usuarioEdit.correo || "",
        password: "",
        id_rol: usuarioEdit.id_rol || "",
      });
    } else {
      setFormData({
        nombre: "",
        apellido: "",
        ci: "",
        correo: "",
        password: "",
        id_rol: "",
      });
    }
  }, [usuarioEdit]);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (usuarioEdit && !tienePermiso("usuario.editar")) {
      return alert("No tienes permiso para actualizar usuarios");
    }
    if (!usuarioEdit && !tienePermiso("usuario.crear")) {
      return alert("No tienes permiso para registrar usuarios");
    }

    setLoading(true);
    try {
      if (usuarioEdit) {
        await actualizarUsuario(usuarioEdit.id_usuario, formData);
      } else {
        await registrarUsuario(formData);
      }
      onSaved();
      setFormData({
        nombre: "",
        apellido: "",
        ci: "",
        correo: "",
        password: "",
        id_rol: "",
      });
    } catch (err) {
      console.error("Error al guardar usuario:", err);
      alert(err?.response?.data?.message || "Error al guardar usuario");
    } finally {
      setLoading(false);
    }
  };

  if (!tienePermiso("usuario.crear") && !tienePermiso("usuario.editar")) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center">
        <div className="text-4xl mb-3">🔒</div>
        <p className="text-yellow-700 font-medium">No tienes permiso para crear o editar usuarios.</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-lg rounded-xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-4">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          {usuarioEdit ? "✏️ Editar Usuario" : "👤 Nuevo Usuario"}
        </h3>
        <p className="text-indigo-100 text-sm mt-1">
          {usuarioEdit ? "Modifica los datos del usuario" : "Completa los datos para registrar"}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-5">
        {/* Nombre y Apellido */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">👤</span>
              <input
                type="text"
                name="nombre"
                placeholder="Nombre del usuario"
                value={formData.nombre}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Apellido <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="apellido"
              placeholder="Apellido del usuario"
              value={formData.apellido}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              required
            />
          </div>
        </div>

        {/* CI y Correo */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Carnet de Identidad <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🪪</span>
              <input
                type="text"
                name="ci"
                placeholder="Ej: 12345678"
                value={formData.ci}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Correo Electrónico <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">📧</span>
              <input
                type="email"
                name="correo"
                placeholder="correo@ejemplo.com"
                value={formData.correo}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                required
              />
            </div>
          </div>
        </div>

        {/* Password y Rol */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña {!usuarioEdit && <span className="text-red-500">*</span>}
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔒</span>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder={usuarioEdit ? "Nueva contraseña (opcional)" : "Contraseña"}
                value={formData.password}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg pl-10 pr-12 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                required={!usuarioEdit}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
            {usuarioEdit && (
              <p className="text-xs text-gray-400 mt-1">
                Dejar vacío para mantener la contraseña actual
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rol <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🛡️</span>
              <select
                name="id_rol"
                value={formData.id_rol}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition appearance-none bg-white"
                required
              >
                <option value="">Seleccione un Rol</option>
                {roles.map((rol) => (
                  <option key={rol.id_rol} value={rol.id_rol}>
                    {rol.nombre_rol}
                  </option>
                ))}
              </select>
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                ▼
              </span>
            </div>
          </div>
        </div>

        {/* Info del rol seleccionado */}
        {formData.id_rol && (
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <span className="text-indigo-600">ℹ️</span>
              <span className="text-sm text-indigo-700">
                Rol seleccionado: <strong>{roles.find(r => r.id_rol == formData.id_rol)?.nombre_rol}</strong>
              </span>
            </div>
          </div>
        )}

        {/* Botones */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 disabled:from-indigo-300 disabled:to-indigo-400 text-white py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2"
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
              <>{usuarioEdit ? "💾 Actualizar Usuario" : "➕ Registrar Usuario"}</>
            )}
          </button>

          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="sm:w-auto px-6 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 rounded-lg font-medium transition-colors"
            >
              Cancelar
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default UsuarioForm;