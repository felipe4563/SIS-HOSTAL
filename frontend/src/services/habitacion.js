import axios from 'axios';

const API_URL = 'http://localhost:4000/api';

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const habitacionService = {
  // Habitaciones
  listarHabitaciones: async () => {
    const response = await api.get('/habitaciones');
    return response.data;
  },

  crearHabitacion: async (datos) => {
    const response = await api.post('/habitaciones', datos);
    return response.data;
  },

  actualizarHabitacion: async (id, datos) => {
    const response = await api.put(`/habitaciones/${id}`, datos);
    return response.data;
  },

  eliminarHabitacion: async (id) => {
    const response = await api.delete(`/habitaciones/${id}`);
    return response.data;
  },

  // Tipos de habitación
  listarTipos: async () => {
    const response = await api.get('/tipos');
    return response.data;
  },

  crearTipo: async (datos) => {
    const response = await api.post('/tipos', datos);
    return response.data;
  },

  eliminarTipo: async (id) => {
    const response = await api.delete(`/tipos/${id}`);
    return response.data;
  }
};