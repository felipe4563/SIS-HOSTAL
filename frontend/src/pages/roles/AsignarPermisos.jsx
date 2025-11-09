import { useEffect, useState } from "react";
import { getRoles} from "../../services/rol";
import { getPermisos } from "../../services/permisos";
import {
  obtenerPermisosPorRol,
  asignarPermisosARol,
} from "../../services/rolpermiso";

const AsignarPermisos = () => {
  const [roles, setRoles] = useState([]);
  const [permisos, setPermisos] = useState([]);
  const [rolSeleccionado, setRolSeleccionado] = useState("");
  const [permisosSeleccionados, setPermisosSeleccionados] = useState([]);
  const [guardando, setGuardando] = useState(false);

  // Cargar roles y permisos al iniciar
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [r, p] = await Promise.all([
          getRoles(),
          getPermisos(),
        ]);
        setRoles(r);
        setPermisos(p);
      } catch (error) {
        console.error("Error al cargar datos:", error);
      }
    };
    fetchData();
  }, []);

  // Cuando cambia el rol, traer sus permisos actuales
  useEffect(() => {
    if (rolSeleccionado) {
      fetchPermisosRol(rolSeleccionado);
    } else {
      setPermisosSeleccionados([]);
    }
  }, [rolSeleccionado]);

  const fetchPermisosRol = async (idRol) => {
    try {
      const permisosRol = await obtenerPermisosPorRol(idRol);
      setPermisosSeleccionados(permisosRol.map((p) => p.id_permiso));
    } catch (err) {
      console.error("Error al obtener permisos del rol:", err);
    }
  };

  const handleCheckboxChange = (id_permiso) => {
    setPermisosSeleccionados((prev) =>
      prev.includes(id_permiso)
        ? prev.filter((id) => id !== id_permiso)
        : [...prev, id_permiso]
    );
  };

  const handleGuardar = async () => {
    if (!rolSeleccionado) return alert("Selecciona un rol primero");
    setGuardando(true);
    try {
      await asignarPermisosARol(rolSeleccionado, permisosSeleccionados);
      alert("✅ Permisos actualizados correctamente");
    } catch (err) {
      console.error("Error al asignar permisos:", err);
      alert("❌ Error al guardar permisos");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-2xl font-bold mb-4">Asignar Permisos a Roles</h3>

      {/* Selección de rol */}
      <div className="mb-6">
        <label className="font-semibold block mb-2">Selecciona un Rol:</label>
        <select
          value={rolSeleccionado}
          onChange={(e) => setRolSeleccionado(e.target.value)}
          className="border rounded p-2 w-full"
        >
          <option value="">-- Seleccionar --</option>
          {roles.map((rol) => (
            <option key={rol.id_rol} value={rol.id_rol}>
              {rol.nombre_rol}
            </option>
          ))}
        </select>
      </div>

      {/* Lista de permisos */}
      {rolSeleccionado && (
        <>
          <h4 className="text-lg font-semibold mb-3">Permisos disponibles:</h4>
          <div className="grid grid-cols-2 gap-2 border p-4 rounded-lg">
            {permisos.map((permiso) => (
              <label
                key={permiso.id_permiso}
                className="flex items-center space-x-2"
              >
                <input
                  type="checkbox"
                  checked={permisosSeleccionados.includes(permiso.id_permiso)}
                  onChange={() => handleCheckboxChange(permiso.id_permiso)}
                />
                <span>{permiso.nombre}</span>
              </label>
            ))}
          </div>

          <button
            onClick={handleGuardar}
            disabled={guardando}
            className={`mt-6 px-4 py-2 rounded text-white ${
              guardando ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {guardando ? "Guardando..." : "Guardar Cambios"}
          </button>
        </>
      )}
    </div>
  );
};

export default AsignarPermisos;
