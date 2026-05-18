import api from './api.js';

export const getLimpiezaPendientes = () =>
  api.get('/limpieza').then((r) => r.data);

export const getLimpiezaHistorial = (limite = 50) =>
  api.get(`/limpieza/historial?limite=${limite}`).then((r) => r.data);

export const getLimpiezaStats = () =>
  api.get('/limpieza/stats').then((r) => r.data);

export const crearTareaLimpieza = (datos) =>
  api.post('/limpieza', datos).then((r) => r.data);

export const iniciarLimpieza = (id) =>
  api.patch(`/limpieza/${id}/iniciar`).then((r) => r.data);

export const completarLimpieza = (id, observaciones = '') =>
  api.patch(`/limpieza/${id}/completar`, { observaciones }).then((r) => r.data);
