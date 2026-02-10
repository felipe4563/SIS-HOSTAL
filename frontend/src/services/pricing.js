import api from './api';

export const calcularPrecioDinamico = async (datos) => {
  const { data } = await api.post('/pricing/calcular', datos);
  return data;
};

// 👇 NUEVO: Calcular precio para múltiples habitaciones
export const calcularPrecioDinamicoMultiple = async (habitaciones, fechaEntrada, fechaSalida) => {
  const { data } = await api.post('/pricing/calcular-multiple', {
    habitaciones: habitaciones.map(hab => ({ id_habitacion: hab.id_habitacion })),
    fecha_entrada: fechaEntrada,
    fecha_salida: fechaSalida
  });
  
  return data.precios; // Retorna el array de precios
};

export const obtenerEventosActivos = async () => {
  const { data } = await api.get('/pricing/eventos/activos');
  return data;
};

export const obtenerTemporadas = async () => {
  const { data } = await api.get('/pricing/temporadas');
  return data;
};