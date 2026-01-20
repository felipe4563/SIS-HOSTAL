import api from "./api";

// ============================
// HABITACIONES - CRUD
// ============================

export const listarHabitaciones = async () => {
  const { data } = await api.get("/habitaciones");
  return data;
};

export const obtenerHabitacion = async (id) => {
  const { data } = await api.get(`/habitaciones/${id}`);
  
  // Asegurar que las imágenes tengan el formato correcto
  if (data.imagenes && Array.isArray(data.imagenes)) {
    data.imagenes = data.imagenes.map(img => {
      if (typeof img === 'string') {
        return {
          id_imagen: null,
          url: img,
          es_portada: false
        };
      }
      // Si viene con 'ruta' en lugar de 'url', normalizar
      if (img.ruta && !img.url) {
        img.url = img.ruta;
      }
      return img;
    });
  }

  // Lo mismo para imágenes 360°
  if (data.imagenes_360 && Array.isArray(data.imagenes_360)) {
    data.imagenes_360 = data.imagenes_360.map(img => {
      if (img.ruta && !img.url) {
        img.url = img.ruta;
      }
      return img;
    });
  }
  
  return data;
};

export const crearHabitacion = async (formData) => {
  const { data } = await api.post("/habitaciones", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });
  return data;
};

export const actualizarHabitacion = async (id, formData) => {
  const { data } = await api.put(`/habitaciones/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });
  return data;
};

export const eliminarHabitacion = async (id) => {
  const { data } = await api.delete(`/habitaciones/${id}`);
  return data;
};

export const cambiarEstadoHabitacion = async (id, estado) => {
  const { data } = await api.patch(`/habitaciones/${id}/estado`, { estado });
  return data;
};

// ============================
// IMÁGENES 360°
// ============================

export const listarImagenes360 = async (idHabitacion) => {
  const { data } = await api.get(`/habitaciones/${idHabitacion}/imagenes-360`);
  return data;
};

export const subirImagen360 = async (idHabitacion, formData) => {
  const { data } = await api.post(
    `/habitaciones/${idHabitacion}/imagenes-360`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return data;
};

export const actualizarImagen360 = async (idHabitacion, idImagen, datos) => {
  const { data } = await api.put(
    `/habitaciones/${idHabitacion}/imagenes-360/${idImagen}`,
    datos
  );
  return data;
};

export const eliminarImagen360 = async (idHabitacion, idImagen) => {
  const { data } = await api.delete(
    `/habitaciones/${idHabitacion}/imagenes-360/${idImagen}`
  );
  return data;
};