import api from './api';

export const login = async (identificador, password) => {
  try {
    const res = await api.post('/auth/login', { identificador, password });
    return res.data; // { token, usuario }
  } catch (error) {
    throw error.response?.data || { message: 'Error al iniciar sesión' };
  }
};