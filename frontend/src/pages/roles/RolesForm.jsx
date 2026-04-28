const RolesForm = ({
  editando,
  formData,
  permisos,
  saving,
  onSubmit,
  onChange,
  onCheck,
  onSelectAllModule,
  onCancel
}) => {
  const permisosAgrupados = permisos.reduce((grupos, permiso) => {
    const nombrePermiso = String(permiso.nombre || "");
    let modulo = "general";

    // Formato principal actual: "recurso.accion" (ej: "usuario.ver")
    if (nombrePermiso.includes(".")) {
      [modulo] = nombrePermiso.split(".");
    } else if (nombrePermiso.includes("_")) {
      // Compatibilidad con formatos antiguos: "gestionar_usuarios"
      const partes = nombrePermiso.split("_");
      modulo = partes.length > 1 ? partes[partes.length - 1] : "general";
    }

    const moduloCapitalizado = modulo.charAt(0).toUpperCase() + modulo.slice(1);

    if (!grupos[moduloCapitalizado]) {
      grupos[moduloCapitalizado] = [];
    }

    grupos[moduloCapitalizado].push(permiso);
    return grupos;
  }, {});

  return (
    <div className="bg-white shadow-md rounded-xl overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
        <h4 className="text-lg font-semibold text-white flex items-center gap-2">
          {editando ? "✏️ Editar Rol" : "➕ Nuevo Rol"}
        </h4>
        <p className="text-blue-100 text-sm">
          {editando ? "Modifica los datos del rol" : "Completa los datos para crear un nuevo rol"}
        </p>
      </div>

      <form onSubmit={onSubmit} className="p-6 space-y-6">
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
              onChange={onChange}
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
              onChange={onChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            />
          </div>
        </div>

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
                const todosSeleccionados = moduloPermisos.every((p) =>
                  formData.permisos.includes(p.id_permiso)
                );
                const algunoSeleccionado = moduloPermisos.some((p) =>
                  formData.permisos.includes(p.id_permiso)
                );

                return (
                  <div
                    key={modulo}
                    className={`${idx > 0 ? "border-t border-gray-200" : ""}`}
                  >
                    <div className="bg-gray-50 px-4 py-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-lg">
                          {modulo.toLowerCase().includes("usuario") ? "👥" :
                           modulo.toLowerCase().includes("habitacion") ? "🏨" :
                           modulo.toLowerCase().includes("reserva") ? "📅" :
                           modulo.toLowerCase().includes("cliente") ? "👤" :
                           modulo.toLowerCase().includes("pago") ? "💰" :
                           modulo.toLowerCase().includes("reporte") ? "📊" : "📁"}
                        </span>
                        <span className="font-medium text-gray-700">{modulo}</span>
                        <span className="text-xs text-gray-400">
                          ({moduloPermisos.length} permisos)
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => onSelectAllModule(moduloPermisos, !todosSeleccionados)}
                        className={`text-xs px-3 py-1 rounded-full transition-colors ${
                          todosSeleccionados
                            ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
                            : algunoSeleccionado
                            ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                            : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                        }`}
                      >
                        {todosSeleccionados ? "✓ Todos" : "Seleccionar todos"}
                      </button>
                    </div>

                    <div className="px-4 py-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {moduloPermisos.map((p) => (
                        <label
                          key={p.id_permiso}
                          className={`flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-all ${
                            formData.permisos.includes(p.id_permiso)
                              ? "bg-blue-50 border-2 border-blue-300"
                              : "bg-white border-2 border-transparent hover:bg-gray-50"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={formData.permisos.includes(p.id_permiso)}
                            onChange={() => onCheck(p.id_permiso)}
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
              <>{editando ? "💾 Actualizar Rol" : "➕ Crear Rol"}</>
            )}
          </button>

          <button
            type="button"
            onClick={onCancel}
            className="px-6 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 rounded-lg font-medium transition-colors"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};

export default RolesForm;
