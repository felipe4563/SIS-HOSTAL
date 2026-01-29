import api from './api';

// Crear reserva
export const crearReserva = async (datos) => {
  const response = await api.post('/reservas', datos);
  return response.data;
};

// Obtener reservas del cliente
export const obtenerMisReservas = async () => {
  const response = await api.get('/reservas/mis-reservas');
  return response.data;
};

// Cancelar reserva
export const cancelarReserva = async (id) => {
  const response = await api.patch(`/reservas/${id}/cancelar`);
  return response.data;
};