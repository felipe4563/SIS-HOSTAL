import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext.jsx";

const getPermisoColor = (permiso) => {
  const nombre = permiso.toLowerCase();
  if (nombre.includes("crear") || nombre.includes("create")) return "bg-green-100 text-green-700";
  if (nombre.includes("editar") || nombre.includes("update") || nombre.includes("gestionar")) return "bg-blue-100 text-blue-700";
  if (nombre.includes("eliminar") || nombre.includes("delete")) return "bg-red-100 text-red-700";
  if (nombre.includes("ver") || nombre.includes("read") || nombre.includes("listar")) return "bg-purple-100 text-purple-700";
  return "bg-gray-100 text-gray-700";
};

const RolesItemsList = ({ roles, onEdit, onDelete, onCreateFirst }) => {
  const { usuario } = useContext(AuthContext);
  const tienePermiso = (p) => usuario?.permisos?.includes(p);
  return (
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
            onClick={onCreateFirst}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors"
          >
            ➕ Crear primer rol
          </button>
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {roles.map((rol) => (
            <div
              key={rol.id_rol}
              className="p-5 hover:bg-gray-50 transition-colors"
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
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
                              +{rol.permisos.length - 5} mas
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

                <div className="flex items-center gap-2 lg:flex-shrink-0">
                  <span className="text-xs text-gray-400 mr-2">
                    {rol.permisos.length} permisos
                  </span>
                  {tienePermiso('rol.editar') && (
                    <button
                      onClick={() => onEdit(rol)}
                      className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
                    >
                      ✏️ Editar
                    </button>
                  )}
                  {tienePermiso('rol.eliminar') && (
                    <button
                      onClick={() => onDelete(rol.id_rol)}
                      className="bg-red-100 hover:bg-red-200 text-red-600 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
                    >
                      🗑️ Eliminar
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RolesItemsList;
