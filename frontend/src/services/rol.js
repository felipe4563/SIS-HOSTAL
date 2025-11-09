import api from './api';

// Obtener todos los roles
export const getRoles = async () => {
  const res = await api.get('/roles');
  return res.data;
};

// Crear rol
export const createRol = async (rolData) => {
  const res = await api.post('/roles', rolData);
  return res.data;
};

// Obtener rol por ID
export const getRolById = async (id) => {
  const res = await api.get(`/roles/${id}`);
  return res.data;
};

// Actualizar rol
export const updateRol = async (id, rolData) => {
  const res = await api.put(`/roles/${id}`, rolData);
  return res.data;
};

// Eliminar rol
export const deleteRol = async (id) => {
  const res = await api.delete(`/roles/${id}`);
  return res.data;
};
