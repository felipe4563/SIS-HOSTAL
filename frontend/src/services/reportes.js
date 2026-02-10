import api from './api';

export const getReportePorFechas = async (params) => {
  const response = await api.get('/reportes/por-fechas', { params });
  return response.data;
};

export const getHabitacionesMasReservadas = async (params) => {
  const response = await api.get('/reportes/habitaciones-mas-reservadas', { params });
  return response.data;
};

export const getDiasConMasReservas = async (params) => {
  const response = await api.get('/reportes/dias-con-mas-reservas', { params });
  return response.data;
};

export const getEstadisticasPorEstado = async (params) => {
  const response = await api.get('/reportes/estadisticas-por-estado', { params });
  return response.data;
};

export const getReporteIngresos = async (params) => {
  const response = await api.get('/reportes/ingresos', { params });
  return response.data;
};

export const getOcupacionPromedio = async (params) => {
  const response = await api.get('/reportes/ocupacion-promedio', { params });
  return response.data;
};