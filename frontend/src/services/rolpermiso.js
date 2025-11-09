import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL + "/rol-permiso";

// 🔹 Obtener permisos asignados a un rol
export const obtenerPermisosPorRol = async (idRol) => {
  const res = await axios.get(`${API_URL}/${idRol}`);
  return res.data;
};

// 🔹 Asignar permisos (recibe un array de id_permiso)
export const asignarPermisosARol = async (idRol, permisos) => {
  const res = await axios.post(`${API_URL}/${idRol}`, { permisos });
  return res.data;
};
