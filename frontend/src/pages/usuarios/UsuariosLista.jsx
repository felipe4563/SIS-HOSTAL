import { useEffect, useState } from "react";
import { obtenerUsuarios, eliminarUsuario } from "../../services/usuario";

const UsuarioLista = ({ onEdit, reload }) => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);

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
    fetchUsuarios();
  }, [reload]);

  const handleEliminar = async (id) => {
    if (!confirm("¿Seguro que deseas eliminar este usuario?")) return;
    try {
      await eliminarUsuario(id);
      await fetchUsuarios();
    } catch (err) {
      console.error("Error al eliminar usuario:", err);
    }
  };

  if (loading) return <p>Cargando usuarios...</p>;

  return (
    <table className="min-w-full bg-white shadow rounded-lg">
      <thead className="bg-gray-100">
        <tr>
          <th className="p-3 text-left">Nombre</th>
          <th className="p-3 text-left">Correo</th>
          <th className="p-3 text-left">Rol</th>
          <th className="p-3 text-left">Acciones</th>
        </tr>
      </thead>
      <tbody>
        {usuarios.map((u) => (
          <tr key={u.id_usuario} className="border-b hover:bg-gray-50">
            <td className="p-3">
              {u.nombre} {u.apellido}
            </td>
            <td className="p-3">{u.correo}</td>
            <td className="p-3">{u.nombre_rol}</td>
            <td className="p-3 flex gap-2">
              <button
                onClick={() => onEdit(u)}
                className="bg-yellow-500 text-white px-3 py-1 rounded"
              >
                Editar
              </button>
              <button
                onClick={() => handleEliminar(u.id_usuario)}
                className="bg-red-600 text-white px-3 py-1 rounded"
              >
                Eliminar
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default UsuarioLista;
