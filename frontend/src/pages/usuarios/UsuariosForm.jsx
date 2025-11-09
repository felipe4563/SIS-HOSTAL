import { useEffect, useState } from "react";
import { registrarUsuario, actualizarUsuario } from "../../services/usuario";
import { getRoles } from "../../services/rol"; // ✅ importar servicio de roles

const UsuarioForm = ({ usuarioEdit, onSaved }) => {
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    ci: "",
    correo: "",
    password: "",
    id_rol: "",
  });
  const [roles, setRoles] = useState([]); // ✅ estado para guardar roles

  // Cargar roles al montar
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

  // Actualizar formulario cuando se edita
  useEffect(() => {
    if (usuarioEdit) {
      setFormData({
        nombre: usuarioEdit.nombre,
        apellido: usuarioEdit.apellido,
        ci: usuarioEdit.ci || "",
        correo: usuarioEdit.correo,
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
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white shadow rounded-lg p-6 grid grid-cols-2 gap-4"
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
        type="text"
        name="ci"
        placeholder="Carnet de identidad"
        value={formData.ci}
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
        placeholder={usuarioEdit ? "Nueva contraseña (opcional)" : "Contraseña"}
        value={formData.password}
        onChange={handleChange}
        className="border p-2 rounded"
        required={!usuarioEdit}
      />

      {/* ✅ Select de roles */}
      <select
        name="id_rol"
        value={formData.id_rol}
        onChange={handleChange}
        className="border p-2 rounded"
        required
      >
        <option value="">-- Seleccione un Rol --</option>
        {roles.map((rol) => (
          <option key={rol.id_rol} value={rol.id_rol}>
            {rol.nombre_rol}
          </option>
        ))}
      </select>

      <button
        type="submit"
        className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700 col-span-2"
      >
        {usuarioEdit ? "Actualizar Usuario" : "Registrar Usuario"}
      </button>
    </form>
  );
};

export default UsuarioForm;
