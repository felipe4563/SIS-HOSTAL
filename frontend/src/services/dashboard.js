import api from './api';

export const getEstadisticasGenerales = async (periodo = 'mes') => {
  const { data } = await api.get(`/dashboard/estadisticas-generales?periodo=${periodo}`);
  return data;
};

export const getReservasPorEstado = async (periodo = 'mes') => {
  const { data } = await api.get(`/dashboard/reservas-por-estado?periodo=${periodo}`);
  return data;
};

export const getReservasPorPeriodo = async (periodo = 'mes') => {
  const { data } = await api.get(`/dashboard/reservas-por-periodo?periodo=${periodo}`);
  return data;
};

export const getHabitacionesMasReservadas = async (periodo = 'mes') => {
  const { data } = await api.get(`/dashboard/habitaciones-mas-reservadas?periodo=${periodo}`);
  return data;
};

export const getMetodosPago = async (periodo = 'mes') => {
  const { data } = await api.get(`/dashboard/metodos-pago?periodo=${periodo}`);
  return data;
};

export const getEstadoHabitaciones = async () => {
  const { data } = await api.get('/dashboard/estado-habitaciones');
  return data;
};

export const getIngresosPorPeriodo = async (periodo = 'mes') => {
  const { data } = await api.get(`/dashboard/ingresos-por-periodo?periodo=${periodo}`);
  return data;
};

export const getClientesFrecuentes = async (periodo = 'mes') => {
  const { data } = await api.get(`/dashboard/clientes-frecuentes?periodo=${periodo}`);
  return data;
};