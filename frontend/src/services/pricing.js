import api from './api';

export const calcularPrecioDinamico = async (datos) => {
  const { data } = await api.post('/pricing/calcular', datos);
  return data;
};

// 👇 NUEVO: Calcular precio para múltiples habitaciones
export const calcularPrecioDinamicoMultiple = async (habitaciones, fechaEntrada, fechaSalida) => {
  const promesas = habitaciones.map(hab => 
    calcularPrecioDinamico({
      id_habitacion: hab.id_habitacion,
      fecha_entrada: fechaEntrada,
      fecha_salida: fechaSalida
    })
  );
  
  return await Promise.all(promesas);
};

export const obtenerEventosActivos = async () => {
  const { data } = await api.get('/pricing/eventos/activos');
  return data;
};

export const obtenerTemporadas = async () => {
  const { data } = await api.get('/pricing/temporadas');
  return data;
};