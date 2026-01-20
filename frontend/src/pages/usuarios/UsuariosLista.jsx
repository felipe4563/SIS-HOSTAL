import { useEffect, useState, useContext } from "react";
import { obtenerUsuarios, toggleEstadoUsuario } from "../../services/usuario";
import { AuthContext } from "../../context/AuthContext.jsx";

const UsuarioLista = ({ onEdit, reload }) => {
  const { usuario } = useContext(AuthContext);
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [filtroRol, setFiltroRol] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");

  const tienePermiso = (permiso) => {
    return usuario?.permisos?.includes(permiso);
  };

  const fetchUsuarios = async () => {
    try {
      setLoading(true);
      const data = await obtenerUsuarios();
      setUsuarios(data);
    } catch (err) {
      console.error("Error al obtener usuarios:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tienePermiso("usuario.ver")) fetchUsuarios();
    else {
      setUsuarios([]);
      setLoading(false);
    }
  }, [reload]);

  const handleToggleEstado = async (user) => {
    if (!tienePermiso("usuario.eliminar")) {
      return alert("No tienes permiso para cambiar estado");
    }

    const confirmMsg =
      user.estado === 1
        ? `¿Desactivar a ${user.nombre} ${user.apellido}?`
        : `¿Activar a ${user.nombre} ${user.apellido}?`;

    if (!confirm(confirmMsg)) return;

    try {
      await toggleEstadoUsuario(user.id_usuario);
      await fetchUsuarios();
    } catch (err) {
      console.error("Error al cambiar estado:", err);
      alert("Error al cambiar estado del usuario");
    }
  };

  // Filtrado
  const usuariosFiltrados = usuarios.filter((u) => {
    const busquedaMatch =
      busqueda === "" ||
      u.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      u.apellido.toLowerCase().includes(busqueda.toLowerCase()) ||
      u.correo.toLowerCase().includes(busqueda.toLowerCase()) ||
      u.ci?.toLowerCase().includes(busqueda.toLowerCase());

    const rolMatch = filtroRol === "" || u.nombre_rol === filtroRol;
    const estadoMatch =
      filtroEstado === "" ||
      (filtroEstado === "activo" && u.estado === 1) ||
      (filtroEstado === "inactivo" && u.estado === 0);

    return busquedaMatch && rolMatch && estadoMatch;
  });

  // Roles únicos para el filtro
  const rolesUnicos = [...new Set(usuarios.map((u) => u.nombre_rol).filter(Boolean))];

  // Contadores
  const contadores = {
    total: usuarios.length,
    activos: usuarios.filter((u) => u.estado === 1).length,
    inactivos: usuarios.filter((u) => u.estado === 0).length,
  };

  // Colores para roles
  const getRolColor = (rol) => {
    const nombre = rol?.toLowerCase() || "";
    if (nombre.includes("admin")) return "bg-purple-100 text-purple-700 border-purple-200";
    if (nombre.includes("recep")) return "bg-blue-100 text-blue-700 border-blue-200";
    if (nombre.includes("limpieza")) return "bg-yellow-100 text-yellow-700 border-yellow-200";
    return "bg-gray-100 text-gray-700 border-gray-200";
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-md p-8">
        <div className="flex items-center justify-center gap-3">
          <svg className="animate-spin h-8 w-8 text-indigo-600" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="text-gray-600 text-lg">Cargando usuarios...</span>
        </div>
      </div>
    );
  }

  if (!tienePermiso("usuario.ver")) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-8 text-center">
        <div className="text-5xl mb-4">🔒</div>
        <h4 className="text-xl font-medium text-yellow-700 mb-2">Acceso Restringido</h4>
        <p className="text-yellow-600">No tienes permiso para ver usuarios.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con estadísticas */}
      <div className="bg-white shadow-md rounded-xl p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div>
            <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              👥 Usuarios del Sistema
            </h3>
            <p className="text-gray-500 text-sm mt-1">
              Gestiona los usuarios y sus accesos
            </p>
          </div>

          {/* Contadores */}
          <div className="flex flex-wrap gap-3">
            <div className="bg-gray-100 rounded-xl px-4 py-2 text-center min-w-[70px]">
              <p className="text-2xl font-bold text-gray-700">{contadores.total}</p>
              <p className="text-xs text-gray-500">Total</p>
            </div>
            <div className="bg-green-100 rounded-xl px-4 py-2 text-center min-w-[70px]">
              <p className="text-2xl font-bold text-green-700">{contadores.activos}</p>
              <p className="text-xs text-green-600">Activos</p>
            </div>
            <div className="bg-red-100 rounded-xl px-4 py-2 text-center min-w-[70px]">
              <p className="text-2xl font-bold text-red-700">{contadores.inactivos}</p>
              <p className="text-xs text-red-600">Inactivos</p>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex flex-wrap gap-3">
          {/* Búsqueda */}
          <div className="relative flex-1 min-w-[200px]">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
            <input
              type="text"
              placeholder="Buscar por nombre, correo o CI..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Filtro Rol */}
          <select
            className="border border-gray-300 px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 min-w-[150px]"
            value={filtroRol}
            onChange={(e) => setFiltroRol(e.target.value)}
          >
            <option value="">🛡️ Todos los roles</option>
            {rolesUnicos.map((rol) => (
              <option key={rol} value={rol}>
                {rol}
              </option>
            ))}
          </select>

          {/* Filtro Estado */}
          <select
            className="border border-gray-300 px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 min-w-[140px]"
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
          >
            <option value="">📊 Todos</option>
            <option value="activo">✅ Activos</option>
            <option value="inactivo">❌ Inactivos</option>
          </select>

          {/* Limpiar filtros */}
          {(busqueda || filtroRol || filtroEstado) && (
            <button
              onClick={() => {
                setBusqueda("");
                setFiltroRol("");
                setFiltroEstado("");
              }}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2.5 rounded-lg transition-colors flex items-center gap-2"
            >
              ✕ Limpiar
            </button>
          )}
        </div>
      </div>

      {/* Lista de usuarios - Vista Desktop */}
      <div className="hidden md:block bg-white shadow-md rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Usuario</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Contacto</th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Rol</th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Estado</th>
              {(tienePermiso("usuario.editar") || tienePermiso("usuario.eliminar")) && (
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Acciones</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {usuariosFiltrados.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-12 text-center">
                  <div className="text-5xl mb-3">🔍</div>
                  <p className="text-gray-500 font-medium">No se encontraron usuarios</p>
                  <p className="text-gray-400 text-sm mt-1">Intenta ajustar los filtros</p>
                </td>
              </tr>
            ) : (
              usuariosFiltrados.map((u) => (
                <tr
                  key={u.id_usuario}
                  className={`hover:bg-gray-50 transition-colors ${
                    u.estado === 0 ? "bg-gray-50 opacity-60" : ""
                  }`}
                >
                  {/* Usuario */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                          u.estado === 1
                            ? "bg-gradient-to-br from-indigo-500 to-indigo-600"
                            : "bg-gray-400"
                        }`}
                      >
                        {u.nombre.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">
                          {u.nombre} {u.apellido}
                        </p>
                        <p className="text-sm text-gray-500">CI: {u.ci || "N/A"}</p>
                      </div>
                    </div>
                  </td>

                  {/* Contacto */}
                  <td className="px-6 py-4">
                    <p className="text-gray-700">{u.correo}</p>
                  </td>

                  {/* Rol */}
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`inline-flex px-3 py-1 rounded-full text-xs font-medium border ${getRolColor(
                        u.nombre_rol
                      )}`}
                    >
                      {u.nombre_rol || "Sin rol"}
                    </span>
                  </td>

                  {/* Estado */}
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                        u.estado === 1
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {u.estado === 1 ? "✅ Activo" : "❌ Inactivo"}
                    </span>
                  </td>

                  {/* Acciones */}
                  {(tienePermiso("usuario.editar") || tienePermiso("usuario.eliminar")) && (
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        {tienePermiso("usuario.editar") && (
                          <button
                            onClick={() => onEdit(u)}
                            className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                          >
                            ✏️ Editar
                          </button>
                        )}
                        {tienePermiso("usuario.eliminar") && (
                          <button
                            onClick={() => handleToggleEstado(u)}
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                              u.estado === 1
                                ? "bg-red-100 hover:bg-red-200 text-red-700"
                                : "bg-green-100 hover:bg-green-200 text-green-700"
                            }`}
                          >
                            {u.estado === 1 ? "🚫 Desactivar" : "✅ Activar"}
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Lista de usuarios - Vista Mobile (Cards) */}
      <div className="md:hidden space-y-4">
        {usuariosFiltrados.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <div className="text-5xl mb-3">🔍</div>
            <p className="text-gray-500 font-medium">No se encontraron usuarios</p>
          </div>
        ) : (
          usuariosFiltrados.map((u) => (
            <div
              key={u.id_usuario}
              className={`bg-white rounded-xl shadow-md overflow-hidden border ${
                u.estado === 0 ? "border-gray-300 opacity-70" : "border-transparent"
              }`}
            >
              {/* Header de la card */}
              <div className="p-4 flex items-center gap-3 border-b bg-gray-50">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white text-lg ${
                    u.estado === 1
                      ? "bg-gradient-to-br from-indigo-500 to-indigo-600"
                      : "bg-gray-400"
                  }`}
                >
                  {u.nombre.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 truncate">
                    {u.nombre} {u.apellido}
                  </p>
                  <span
                    className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${getRolColor(
                      u.nombre_rol
                    )}`}
                  >
                    {u.nombre_rol || "Sin rol"}
                  </span>
                </div>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    u.estado === 1
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {u.estado === 1 ? "Activo" : "Inactivo"}
                </span>
              </div>

              {/* Body de la card */}
              <div className="p-4 space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-400">📧</span>
                  <span className="text-gray-700 truncate">{u.correo}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-400">🪪</span>
                  <span className="text-gray-700">CI: {u.ci || "N/A"}</span>
                </div>
              </div>

              {/* Acciones */}
              {(tienePermiso("usuario.editar") || tienePermiso("usuario.eliminar")) && (
                <div className="px-4 pb-4 flex gap-2">
                  {tienePermiso("usuario.editar") && (
                    <button
                      onClick={() => onEdit(u)}
                      className="flex-1 bg-blue-100 hover:bg-blue-200 text-blue-700 py-2.5 rounded-lg text-sm font-medium transition-colors"
                    >
                      ✏️ Editar
                    </button>
                  )}
                  {tienePermiso("usuario.eliminar") && (
                    <button
                      onClick={() => handleToggleEstado(u)}
                      className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                        u.estado === 1
                          ? "bg-red-100 hover:bg-red-200 text-red-700"
                          : "bg-green-100 hover:bg-green-200 text-green-700"
                      }`}
                    >
                      {u.estado === 1 ? "🚫 Desactivar" : "✅ Activar"}
                    </button>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Resultados */}
      {usuariosFiltrados.length > 0 && (
        <div className="text-center text-sm text-gray-500">
          Mostrando {usuariosFiltrados.length} de {usuarios.length} usuarios
        </div>
      )}
    </div>
  );
};

export default UsuarioLista;