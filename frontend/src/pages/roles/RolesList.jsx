import { useEffect, useState } from "react";
import {
  getRoles,
  createRol,
  updateRol,
  deleteRol,
} from "../../services/rol.js";

const RolesList = () => {
  const [roles, setRoles] = useState([]);
  const [formData, setFormData] = useState({ nombre_rol: "", descripcion: "" });
  const [editando, setEditando] = useState(null);

  // ✅ Cargar roles al montar
  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const data = await getRoles();
      setRoles(data);
    } catch (err) {
      console.error("Error al obtener roles:", err);
    }
  };

  // ✅ Manejo del formulario
  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editando) {
        await updateRol(editando.id_rol, formData);
      } else {
        await createRol(formData);
      }
      setFormData({ nombre_rol: "", descripcion: "" });
      setEditando(null);
      fetchRoles();
    } catch (err) {
      console.error("Error al guardar rol:", err);
    }
  };

  const handleEdit = (rol) => {
    setEditando(rol);
    setFormData({ nombre_rol: rol.nombre_rol, descripcion: rol.descripcion });
  };

  const handleDelete = async (id) => {
    if (!confirm("¿Eliminar este rol?")) return;
    try {
      await deleteRol(id);
      fetchRoles();
    } catch (err) {
      console.error("Error al eliminar rol:", err);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-xl font-semibold mb-4">
        {editando ? "Editar Rol" : "Registrar Nuevo Rol"}
      </h3>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-2 gap-4 mb-6 border-b pb-6"
      >
        <input
          type="text"
          name="nombre_rol"
          placeholder="Nombre del Rol"
          value={formData.nombre_rol}
          onChange={handleChange}
          className="border rounded p-2"
          required
        />
        <input
          type="text"
          name="descripcion"
          placeholder="Descripción"
          value={formData.descripcion}
          onChange={handleChange}
          className="border rounded p-2"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700 col-span-2"
        >
          {editando ? "Actualizar Rol" : "Registrar Rol"}
        </button>
      </form>

      {/* Tabla de roles */}
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="p-2 border">#</th>
            <th className="p-2 border">Nombre</th>
            <th className="p-2 border">Descripción</th>
            <th className="p-2 border text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {roles.map((rol, index) => (
            <tr key={rol.id_rol} className="hover:bg-gray-50">
              <td className="p-2 border">{index + 1}</td>
              <td className="p-2 border">{rol.nombre_rol}</td>
              <td className="p-2 border">{rol.descripcion}</td>
              <td className="p-2 border text-center space-x-2">
                <button
                  onClick={() => handleEdit(rol)}
                  className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(rol.id_rol)}
                  className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}

          {roles.length === 0 && (
            <tr>
              <td colSpan="4" className="text-center text-gray-500 py-3">
                No hay roles registrados
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default RolesList;
