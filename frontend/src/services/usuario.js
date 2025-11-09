import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export const obtenerUsuarios = async () => {
  const res = await axios.get(`${API_URL}/usuarios`);
  return res.data;
};

export const registrarUsuario = async (data) => {
  const res = await axios.post(`${API_URL}/usuarios/register`, data);
  return res.data;
};

export const eliminarUsuario = async (id_usuario) => {
  const res = await axios.delete(`${API_URL}/usuarios/${id_usuario}`);
  return res.data;
};

export const actualizarUsuario = async (id_usuario, data) => {
  const res = await axios.put(`${API_URL}/usuarios/${id_usuario}`, data);
  return res.data;
};
