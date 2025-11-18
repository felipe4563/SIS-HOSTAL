import { useEffect, useState, useContext } from "react"; 
import { obtenerUsuarios, toggleEstadoUsuario } from "../../services/usuario";
import { AuthContext } from "../../context/AuthContext.jsx";

const UsuarioLista = ({ onEdit, reload }) => {
  const { usuario } = useContext(AuthContext);
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);

  // Verifica si tiene cierto permiso
  const tienePermiso = (permiso) => {
    return usuario?.permisos?.includes(permiso);
  };

  const fetchUsuarios = async () => {
    try {
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
    else setUsuarios([]); // No tiene permiso de ver usuarios
  }, [reload]);

  const handleToggleEstado = async (usuario) => {
    if (!tienePermiso("usuario.eliminar")) return alert("No tienes permiso para cambiar estado");
    const confirmMsg =
      usuario.estado === 1
        ? "¿Seguro que deseas desactivar este usuario?"
        : "¿Seguro que deseas activar este usuario?";
    if (!confirm(confirmMsg)) return;

    try {
      await toggleEstadoUsuario(usuario.id_usuario);
      await fetchUsuarios();
    } catch (err) {
      console.error("Error al cambiar estado del usuario:", err);
    }
  };

  if (loading) return <p>Cargando usuarios...</p>;
  if (!tienePermiso("usuario.ver")) return <p>No tienes permiso para ver usuarios.</p>;

  return (
    <table className="min-w-full bg-white shadow rounded-lg">
      <thead className="bg-gray-100">
        <tr>
          <th className="p-3 text-left">Nombre</th>
          <th className="p-3 text-left">Correo</th>
          <th className="p-3 text-left">Rol</th>
          {(tienePermiso("usuario.editar") || tienePermiso("usuario.eliminar")) && (
            <th className="p-3 text-left">Acciones</th>
          )}
        </tr>
      </thead>
      <tbody>
        {usuarios.map((u) => (
          <tr key={u.id_usuario} className={`border-b hover:bg-gray-50 ${u.estado === 0 ? "bg-gray-200" : ""}`}>
            <td className="p-3">{u.nombre} {u.apellido}</td>
            <td className="p-3">{u.correo}</td>
            <td className="p-3">{u.nombre_rol}</td>
            {(tienePermiso("usuario.editar") || tienePermiso("usuario.eliminar")) && (
              <td className="p-3 flex gap-2">
                {tienePermiso("usuario.editar") && (
                  <button
                    onClick={() => onEdit(u)}
                    className="bg-yellow-500 text-white px-3 py-1 rounded"
                  >
                    Editar
                  </button>
                )}
                {tienePermiso("usuario.eliminar") && (
                  <button
                    onClick={() => handleToggleEstado(u)}
                    className={`px-3 py-1 rounded text-white ${u.estado === 1 ? "bg-red-600" : "bg-green-600"}`}
                  >
                    {u.estado === 1 ? "Desactivar" : "Activar"}
                  </button>
                )}
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default UsuarioLista;
