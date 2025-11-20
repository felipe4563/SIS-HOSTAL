import api from "./api";

// Servicio de habitaciones
export const listarHabitaciones = async () => {
  const { data } = await api.get("/habitaciones");
  return data;
};

export const obtenerHabitacion = async (id) => {
  const { data } = await api.get(`/habitaciones/${id}`);
  return data;
};

export const crearHabitacion = async (habitacion) => {
  const { data } = await api.post("/habitaciones", habitacion);
  return data;
};

export const actualizarHabitacion = async (id, datos) => {
  const { data } = await api.put(`/habitaciones/${id}`, datos);
  return data;
};

export const eliminarHabitacion = async (id) => {
  const { data } = await api.delete(`/habitaciones/${id}`);
  return data;
};

// Cambiar estado (disponible / ocupada / limpieza)
export const cambiarEstadoHabitacion = async (id, estado) => {
  const { data } = await api.patch(`/habitaciones/${id}/estado`, { estado });
  return data;
};
