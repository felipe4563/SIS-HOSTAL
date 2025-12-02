import api from "./api";

// Servicio de habitaciones
export const listarHabitaciones = async () => {
  const { data } = await api.get("/habitaciones");
  return data;
};

// En tu services/habitacion.js
export const obtenerHabitacion = async (id) => {
  const { data } = await api.get(`/habitaciones/${id}`);
  
  // Asegurar que las imágenes tengan el formato correcto
  if (data.imagenes && Array.isArray(data.imagenes)) {
    data.imagenes = data.imagenes.map(img => {
      // Si es una string (URL completa), convertir a objeto
      if (typeof img === 'string') {
        return {
          id_imagen: null, // Temporal, no tenemos id
          ruta: img,
          es_portada: false
        };
      }
      return img;
    });
  }
  
  return data;
};

export const crearHabitacion = async (formData) => {
  const { data } = await api.post("/habitaciones", formData, {
    headers: {
      "Content-Type": "multipart/form-data"
    }
  });
  return data;
};

export const actualizarHabitacion = async (id, formData) => {
  const { data } = await api.put(`/habitaciones/${id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data"
    }
  });
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
