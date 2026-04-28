import api from './api';

// Crear reserva
export const crearReserva = async (datos) => {
  const response = await api.post('/reservas', datos);
  return response.data;
};

// Crear reserva múltiple
export const crearReservaMultiple = async (data) => {
  const response = await api.post('/reservas/multiple', data);
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

// Obtener todas las reservas (admin)
export const obtenerTodasReservas = async () => {
  const response = await api.get('/reservas');
  return response.data;
};

// Actualizar estado de reserva (admin)
export const actualizarEstadoReserva = async (id, estado) => {
  const response = await api.patch(`/reservas/${id}/estado`, { estado });
  return response.data;
};

// Eliminar reserva (admin)
export const eliminarReserva = async (id) => {
  const response = await api.delete(`/reservas/${id}`);
  return response.data;
};

// Actualizar datos de reserva (admin)
export const actualizarReserva = async (id, datos) => {
  const response = await api.put(`/reservas/${id}`, datos);
  return response.data;
};