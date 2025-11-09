import api from './api';

// Obtener todos los permisos
export const getPermisos = async () => {
  const res = await api.get('/permisos');
  return res.data;
};

// Crear permiso
export const createPermiso = async (permisoData) => {
  const res = await api.post('/permisos', permisoData);
  return res.data;
};

// Obtener permiso por ID
export const getPermisoById = async (id) => {
  const res = await api.get(`/permisos/${id}`);
  return res.data;
};

// Actualizar permiso
export const updatePermiso = async (id, permisoData) => {
  const res = await api.put(`/permisos/${id}`, permisoData);
  return res.data;
};

// Eliminar permiso
export const deletePermiso = async (id) => {
  const res = await api.delete(`/permisos/${id}`);
  return res.data;
};
