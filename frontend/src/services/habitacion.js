// habitacion.js - Servicio para conectar con tu API
import axios from 'axios';

const API_URL = 'http://localhost:4000/api';

const api = axios.create({
  baseURL: API_URL,
});

// Agregar token a las peticiones
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const habitacionService = {
  listar: async () => {
    const response = await api.get('/habitaciones');
    return response.data;
  },
  
  crear: async (datos) => {
    const response = await api.post('/habitaciones', datos);
    return response.data;
  }
};