import api from "./api";

// Tipos de habitación
export const listarTipos = async () => {
  const { data } = await api.get("/tipos");
  return data;
};

export const obtenerTipo = async (id) => {
  const { data } = await api.get(`/tipos/${id}`);
  return data;
};

export const crearTipo = async (tipo) => {
  const { data } = await api.post("/tipos", tipo);
  return data;
};

export const actualizarTipo = async (id, tipo) => {
  const { data } = await api.put(`/tipos/${id}`, tipo);
  return data;
};

export const eliminarTipo = async (id) => {
  const { data } = await api.delete(`/tipos/${id}`);
  return data;
};
