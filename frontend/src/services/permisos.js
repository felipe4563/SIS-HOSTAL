import api from './api';

export const getPermisos = async () => {
  const { data } = await api.get("/permisos");
  return data;
};
