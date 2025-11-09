import { useEffect, useState } from "react";
import {
  obtenerUsuarios,
  registrarUsuario,
  eliminarUsuario,
  actualizarUsuario,
} from "../services/usuario";

const Usuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    correo: "",
    password: "",
    id_rol: "",
  });
  const [editando, setEditando] = useState(null);

  // Cargar lista de usuarios
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
  }, []);

  // Manejar inputs
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Crear o actualizar
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editando) {
        await actualizarUsuario(editando, formData);
      } else {
        await registrarUsuario(formData);
      }
      await fetchUsuarios();
      setFormData({ nombre: "", apellido: "", correo: "", password: "", id_rol: "" });
      setEditando(null);
    } catch (err) {
      console.error("Error al guardar usuario:", err);
    }
  };

  // Eliminar
  const handleEliminar = async (id) => {
    if (!confirm("¿Seguro que deseas eliminar este usuario?")) return;
    try {
      await eliminarUsuario(id);
      await fetchUsuarios();
    } catch (err) {
      console.error("Error al eliminar usuario:", err);
    }
  };

  // Editar
  const handleEditar = (usuario) => {
    setEditando(usuario.id_usuario);
    setFormData({
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      correo: usuario.correo,
      password: "",
      id_rol: usuario.id_rol,
    });
  };

  if (loading) return <p>Cargando...</p>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">👥 Gestión de Usuarios</h2>

      {/* Formulario */}
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow rounded-lg p-4 mb-8 grid grid-cols-2 gap-4"
      >
        <input
          type="text"
          name="nombre"
          placeholder="Nombre"
          value={formData.nombre}
          onChange={handleChange}
          className="border p-2 rounded"
          required
        />
        <input
          type="text"
          name="apellido"
          placeholder="Apellido"
          value={formData.apellido}
          onChange={handleChange}
          className="border p-2 rounded"
          required
        />
        <input
          type="email"
          name="correo"
          placeholder="Correo"
          value={formData.correo}
          onChange={handleChange}
          className="border p-2 rounded"
          required
        />
        <input
          type="password"
          name="password"
          placeholder={editando ? "Nueva contraseña (opcional)" : "Contraseña"}
          value={formData.password}
          onChange={handleChange}
          className="border p-2 rounded"
          required={!editando}
        />
        <input
          type="number"
          name="id_rol"
          placeholder="ID Rol"
          value={formData.id_rol}
          onChange={handleChange}
          className="border p-2 rounded"
          required
        />

        <button
          type="submit"
          className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700 col-span-2"
        >
          {editando ? "Actualizar Usuario" : "Registrar Usuario"}
        </button>
      </form>

      {/* Tabla de usuarios */}
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
                  onClick={() => handleEditar(u)}
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
    </div>
  );
};

export default Usuarios;
