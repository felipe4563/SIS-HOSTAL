import api from "./api";

// Obtener todos los roles
export const getRoles = async () => {
  const { data } = await api.get("/roles");
  return data;
};

// Crear un nuevo rol
export const createRol = async (rol) => {
  const { data } = await api.post("/roles", rol);
  return data;
};

// Asignar permisos a un rol
export const assignPermisos = async (id_rol, permisos) => {
  return await api.post(`/roles/${id_rol}/permisos`, { permisos });
};

// Eliminar un rol
export const deleteRol = async (id_rol) => {
  return await api.delete(`/roles/${id_rol}`);
};

export const updateRol = async (id_rol, rol) => {
  const { data } = await api.put(`/roles/${id_rol}`, rol);
  return data;
};