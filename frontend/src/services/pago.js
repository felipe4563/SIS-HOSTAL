import axios from 'axios';

const API_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:4000';

export const iniciarPago = async (id_reserva) => {
  const token = localStorage.getItem('token');
  
  const response = await axios.post(
    `${API_URL}/api/pagos/iniciar`,
    { 
      id_reserva,
      metodo_pago: 'tarjeta' // Red Enlace mostrará todas las opciones
    },
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );
  
  return response.data;
};

export const iniciarPagoMultiple = async (ids_reserva) => {
  const token = localStorage.getItem('token');
  const response = await axios.post(
    `${API_URL}/api/pagos/iniciar-multiple`,
    { ids_reserva },
    { headers: { 'Authorization': `Bearer ${token}` } }
  );
  return response.data;
};

export const verificarEstadoPago = async (id_reserva) => {
  const response = await axios.get(
    `${API_URL}/api/pagos/estado/${id_reserva}`
  );
  
  return response.data;
};