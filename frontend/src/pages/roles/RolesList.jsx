import { useEffect, useState } from "react";
import {
  getRoles,
  createRol,
  updateRol,
  assignPermisos,
  deleteRol
} from "../../services/rol.js";
import { getPermisos } from "../../services/permisos.js";

const RolesList = () => {
  const [roles, setRoles] = useState([]);
  const [permisos, setPermisos] = useState([]);

  const [formData, setFormData] = useState({
    nombre_rol: "",
    descripcion: "",
    permisos: []
  });

  const [editando, setEditando] = useState(null);

  useEffect(() => {
    fetchRoles();
    fetchPermisos();
  }, []);

  const fetchRoles = async () => {
    try {
      const data = await getRoles();
      // Convertimos permisos_nombres en array si no lo es
      const rolesConArray = data.map(r => ({
        ...r,
        permisos: r.permisos_nombres
          ? r.permisos_nombres.split(",")
          : []
      }));
      setRoles(rolesConArray);
    } catch (err) {
      console.error("Error al obtener roles:", err);
    }
  };

  const fetchPermisos = async () => {
    try {
      const data = await getPermisos();
      setPermisos(data);
    } catch (err) {
      console.error("Error al obtener permisos:", err);
    }
  };

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleCheck = (id_permiso) => {
    let nuevaLista = [...formData.permisos];

    if (nuevaLista.includes(id_permiso)) {
      nuevaLista = nuevaLista.filter((p) => p !== id_permiso); // desmarca
    } else {
      nuevaLista.push(id_permiso); // marca
    }

    setFormData({ ...formData, permisos: nuevaLista });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let rolId;

      if (editando) {
        await updateRol(editando.id_rol, formData);
        rolId = editando.id_rol;
      } else {
        const nuevo = await createRol(formData);
        rolId = nuevo.id_rol;
      }

      // Asignar permisos después del rol
      await assignPermisos(rolId, formData.permisos);

      setFormData({ nombre_rol: "", descripcion: "", permisos: [] });
      setEditando(null);
      fetchRoles();

    } catch (err) {
      console.error("Error al guardar rol:", err);
    }
  };

  const handleEdit = (rol) => {
    setEditando(rol);
    // Convertimos los permisos a array de IDs para marcar los checkboxes
    const permisosIds = permisos
      .filter(p => rol.permisos.includes(p.nombre))
      .map(p => p.id_permiso);

    setFormData({
      nombre_rol: rol.nombre_rol,
      descripcion: rol.descripcion,
      permisos: permisosIds
    });
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

      {/* FORMULARIO */}
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

        {/* PERMISOS CHECKBOX */}
        <div className="col-span-2">
          <h4 className="font-semibold mb-2">Permisos</h4>

          <div className="grid grid-cols-3 gap-2">
            {permisos.map((p) => (
              <label key={p.id_permiso} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.permisos.includes(p.id_permiso)}
                  onChange={() => handleCheck(p.id_permiso)}
                />
                {p.nombre}
              </label>
            ))}
          </div>
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700 col-span-2"
        >
          {editando ? "Actualizar Rol" : "Registrar Rol"}
        </button>
      </form>

      {/* TABLA */}
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="p-2 border">#</th>
            <th className="p-2 border">Nombre</th>
            <th className="p-2 border">Permisos</th>
            <th className="p-2 border">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {roles.map((rol, index) => (
            <tr key={rol.id_rol}>
              <td className="p-2 border">{index + 1}</td>
              <td className="p-2 border">{rol.nombre_rol}</td>
              <td className="p-2 border">{rol.permisos.join(", ")}</td>
              <td className="p-2 border flex gap-2">
                <button
                  onClick={() => handleEdit(rol)}
                  className="bg-yellow-500 text-white px-3 py-1 rounded"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(rol.id_rol)}
                  className="bg-red-600 text-white px-3 py-1 rounded"
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}

          {roles.length === 0 && (
            <tr>
              <td className="text-center py-3" colSpan="4">
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
