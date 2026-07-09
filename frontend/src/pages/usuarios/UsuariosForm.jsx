import { useEffect, useState, useContext } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { registrarUsuario, actualizarUsuario } from "../../services/usuario";
import { getRoles } from "../../services/rol";
import { AuthContext } from "../../context/AuthContext.jsx";
import toast from "react-hot-toast";

// Esquema de validación para frontend (similar al backend)
const usuarioSchema = z.object({
  nombre: z.string().min(1, "El nombre es obligatorio").regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, "Solo letras y espacios"),
  apellido: z.string().min(1, "El apellido es obligatorio").regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, "Solo letras y espacios"),
  ci: z.string().regex(/^\d{7,8}$/, "Debe tener 7 u 8 dígitos numéricos"),
  correo: z.string().email("Correo inválido").endsWith("@hostalsuri.com", "Debe ser @hostalsuri.com"),
  password: z.string().optional(),
  id_rol: z.union([z.string(), z.number()]).refine(val => !!val, "El rol es obligatorio"),
}).superRefine((data, ctx) => {
  if (!data.id_usuario && (!data.password || data.password.length < 8)) {
    if (!data.password) {
      ctx.addIssue({ path: ["password"], code: z.ZodIssueCode.custom, message: "La contraseña es obligatoria" });
    } else if (data.password.length < 8) {
      ctx.addIssue({ path: ["password"], code: z.ZodIssueCode.custom, message: "Mínimo 8 caracteres" });
    }
  } else if (data.id_usuario && data.password && data.password.length < 8) {
    ctx.addIssue({ path: ["password"], code: z.ZodIssueCode.custom, message: "Mínimo 8 caracteres" });
  }
});

const UsuarioForm = ({ usuarioEdit, onSaved, onCancel }) => {
  const { usuario } = useContext(AuthContext);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const tienePermiso = (permiso) => usuario?.permisos?.includes(permiso);

  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm({
    resolver: zodResolver(usuarioSchema),
    defaultValues: {
      nombre: "",
      apellido: "",
      ci: "",
      correo: "",
      password: "",
      id_rol: "",
    }
  });

  const watchNombre = watch("nombre", "");
  const watchApellido = watch("apellido", "");
  const watchPassword = watch("password", "");
  const watchIdRol = watch("id_rol", "");

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const data = await getRoles();
        setRoles(data);
      } catch (err) {
        toast.error("Error al cargar roles");
      }
    };
    fetchRoles();
  }, []);

  useEffect(() => {
    if (usuarioEdit) {
      reset({
        id_usuario: usuarioEdit.id_usuario,
        nombre: usuarioEdit.nombre || "",
        apellido: usuarioEdit.apellido || "",
        ci: usuarioEdit.ci || "",
        correo: usuarioEdit.correo || "",
        password: "",
        id_rol: usuarioEdit.id_rol || "",
      });
    } else {
      reset({
        id_usuario: null,
        nombre: "",
        apellido: "",
        ci: "",
        correo: "",
        password: "",
        id_rol: "",
      });
    }
  }, [usuarioEdit, reset]);

  // Generación automática de correo
  useEffect(() => {
    if (!usuarioEdit || watchNombre !== (usuarioEdit.nombre || "") || watchApellido !== (usuarioEdit.apellido || "")) {
      if (watchNombre || watchApellido) {
        const inicial = watchNombre.trim().charAt(0).toLowerCase();
        const apellidoStr = watchApellido.trim().split(' ')[0].toLowerCase();
        const cleanStr = (str) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "");
        const email = `${cleanStr(inicial)}${cleanStr(apellidoStr)}@hostalsuri.com`;
        setValue("correo", email, { shouldValidate: true });
      }
    }
  }, [watchNombre, watchApellido, usuarioEdit, setValue]);

  const evaluatePassword = (password) => {
    const pwd = password || "";
    const checks = {
      length: pwd.length >= 8,
      uppercase: /[A-Z]/.test(pwd),
      lowercase: /[a-z]/.test(pwd),
      number: /[0-9]/.test(pwd),
      special: /[^A-Za-z0-9]/.test(pwd),
    };
    const strength = Object.values(checks).filter(Boolean).length;
    return { checks, strength };
  };

  const onSubmit = async (data) => {
    if (usuarioEdit && !tienePermiso("usuario.editar")) {
      return toast.error("No tienes permiso para actualizar usuarios");
    }
    if (!usuarioEdit && !tienePermiso("usuario.crear")) {
      return toast.error("No tienes permiso para registrar usuarios");
    }

    setLoading(true);
    try {
      if (usuarioEdit) {
        await actualizarUsuario(usuarioEdit.id_usuario, data);
        toast.success("Usuario actualizado correctamente");
      } else {
        await registrarUsuario(data);
        toast.success("Usuario registrado exitosamente");
      }
      onSaved();
      reset();
    } catch (err) {
      console.error("Error al guardar usuario:", err);
      toast.error(err?.response?.data?.message || "Error al guardar usuario");
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

      <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
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
                placeholder="Nombre del usuario"
                {...register("nombre")}
                className={`w-full border ${errors.nombre ? 'border-red-500' : 'border-gray-300'} rounded-lg pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition`}
              />
            </div>
            {errors.nombre && <p className="text-red-500 text-xs mt-1">{errors.nombre.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Apellido <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Apellido del usuario"
              {...register("apellido")}
              className={`w-full border ${errors.apellido ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition`}
            />
            {errors.apellido && <p className="text-red-500 text-xs mt-1">{errors.apellido.message}</p>}
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
                placeholder="Ej: 12345678"
                {...register("ci")}
                className={`w-full border ${errors.ci ? 'border-red-500' : 'border-gray-300'} rounded-lg pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition`}
              />
            </div>
            {errors.ci && <p className="text-red-500 text-xs mt-1">{errors.ci.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Correo Electrónico <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">📧</span>
              <input
                type="email"
                placeholder="correo@ejemplo.com"
                {...register("correo")}
                className={`w-full border ${errors.correo ? 'border-red-500' : 'border-gray-300'} rounded-lg pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition bg-gray-50`}
                readOnly
              />
            </div>
            {errors.correo && <p className="text-red-500 text-xs mt-1">{errors.correo.message}</p>}
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
                placeholder={usuarioEdit ? "Nueva contraseña (opcional)" : "Contraseña"}
                {...register("password")}
                className={`w-full border ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded-lg pl-10 pr-12 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            
            {/* Visualizador de fuerza de contraseña */}
            {(!usuarioEdit || watchPassword) && (
              <div className="mt-2 text-xs">
                {(() => {
                  const { checks, strength } = evaluatePassword(watchPassword);
                  const colors = ["bg-red-500", "bg-red-400", "bg-yellow-500", "bg-blue-500", "bg-green-500"];
                  const strengthLabels = ["Muy débil", "Débil", "Regular", "Buena", "Fuerte"];
                  const width = (strength / 5) * 100;
                  
                  return (
                    <div className="space-y-1 bg-gray-50 p-2 rounded-lg border border-gray-100 mt-2">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-gray-600 font-medium">Seguridad: {strength > 0 ? strengthLabels[strength - 1] : "Ninguna"}</span>
                      </div>
                      <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden mb-2">
                        <div 
                          className={`h-full transition-all duration-300 ${strength > 0 ? colors[strength - 1] : "bg-transparent"}`}
                          style={{ width: `${width}%` }}
                        ></div>
                      </div>
                      <ul className="mt-1 grid grid-cols-1 sm:grid-cols-2 gap-1 text-[10px] text-gray-500">
                        <li className={checks.length ? "text-green-600 flex items-center gap-1" : "flex items-center gap-1"}> {checks.length ? "✅" : "❌"} Mínimo 8 caracteres</li>
                        <li className={checks.uppercase ? "text-green-600 flex items-center gap-1" : "flex items-center gap-1"}> {checks.uppercase ? "✅" : "❌"} Una mayúscula</li>
                        <li className={checks.lowercase ? "text-green-600 flex items-center gap-1" : "flex items-center gap-1"}> {checks.lowercase ? "✅" : "❌"} Una minúscula</li>
                        <li className={checks.number ? "text-green-600 flex items-center gap-1" : "flex items-center gap-1"}> {checks.number ? "✅" : "❌"} Un número</li>
                        <li className={checks.special ? "text-green-600 flex items-center gap-1" : "flex items-center gap-1"}> {checks.special ? "✅" : "❌"} Carácter especial</li>
                      </ul>
                    </div>
                  );
                })()}
              </div>
            )}

            {usuarioEdit && !errors.password && !watchPassword && (
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
                {...register("id_rol")}
                className={`w-full border ${errors.id_rol ? 'border-red-500' : 'border-gray-300'} rounded-lg pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition appearance-none bg-white`}
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
            {errors.id_rol && <p className="text-red-500 text-xs mt-1">{errors.id_rol.message}</p>}
          </div>
        </div>

        {/* Info del rol seleccionado */}
        {watchIdRol && (
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <span className="text-indigo-600">ℹ️</span>
              <span className="text-sm text-indigo-700">
                Rol seleccionado: <strong>{roles.find(r => r.id_rol == watchIdRol)?.nombre_rol}</strong>
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