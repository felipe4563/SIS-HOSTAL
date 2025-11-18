import api from './api';

export const obtenerUsuarios = async () => {
  const res = await api.get('/usuarios'); 
  return res.data;
};

export const registrarUsuario = async (data) => {
  const res = await api.post('/usuarios', data); 
  return res.data;
};

export const eliminarUsuario = async (id_usuario) => {
  const res = await api.delete(`/usuarios/${id_usuario}`);
  return res.data;
};

export const actualizarUsuario = async (id_usuario, data) => {
  const res = await api.put(`/usuarios/${id_usuario}`, data);
  return res.data;
};


export const toggleEstadoUsuario = async (id_usuario) => {
  const res = await api.patch(`/usuarios/${id_usuario}/estado`);
  return res.data;
};

