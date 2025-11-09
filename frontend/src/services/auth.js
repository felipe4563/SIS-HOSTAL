import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export const login = async (identificador, password) => {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, {
      identificador,
      password
    });
    return response.data; // { token, usuario }
  } catch (error) {
    throw error.response?.data || { message: 'Error al iniciar sesión' };
  }
};
