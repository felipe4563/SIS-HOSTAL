import api from './api';

// Obtener todos los clientes (admin)
export const obtenerClientes = async () => {
  const response = await api.get('/clientes');
  return response.data;
};

// Obtener un cliente por ID (admin)
export const obtenerClientePorId = async (id) => {
  const response = await api.get(`/clientes/${id}`);
  return response.data;
};

// Actualizar cliente (admin o el mismo cliente)
export const actualizarCliente = async (id, datos) => {
  const response = await api.put(`/clientes/${id}`, datos);
  return response.data;
};

// Eliminar cliente (admin)
export const eliminarCliente = async (id) => {
  const response = await api.delete(`/clientes/${id}`);
  return response.data;
};