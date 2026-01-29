import { useState } from 'react';
import TourVirtual360 from './TourVirtual360';

const HabitacionCard = ({ habitacion, onReservar }) => {
  const [imagenActual, setImagenActual] = useState(0);
  const [mostrarTour360, setMostrarTour360] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:4000';
  
  const construirUrlImagen = (ruta) => {
    if (!ruta) {
      return 'https://placehold.co/400x300?text=Sin+Imagen';
    }
    
    if (ruta.startsWith('http://') || ruta.startsWith('https://')) {
      return ruta;
    }
    
    return `${API_BASE_URL}/${ruta}`;
  };

  // 👇 SEPARAR imágenes normales de las 360°
  const imagenesNormales = habitacion.imagenes?.filter(img => img.tipo_imagen === 'normal') || [];
  const imagenes360 = habitacion.imagenes?.filter(img => img.tipo_imagen === '360') || [];

  const imagenes = imagenesNormales.length > 0 
    ? imagenesNormales 
    : [{ ruta: null, tipo_imagen: 'normal', es_portada: true }];

  const siguienteImagen = () => {
    setImagenActual((prev) => (prev + 1) % imagenes.length);
  };

  const anteriorImagen = () => {
    setImagenActual((prev) => (prev - 1 + imagenes.length) % imagenes.length);
  };

  return (
    <>
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
        <div className="relative h-64 bg-gray-200 group">
          <img
            src={construirUrlImagen(imagenes[imagenActual]?.ruta)}
            alt={`Habitación ${habitacion.numero}`}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = 'https://placehold.co/400x300?text=Error+Imagen';
            }}
          />
          
          {/* Badge de Tour 360° disponible */}
          {imagenes360.length > 0 && (
            <div className="absolute top-3 left-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center space-x-1 shadow-lg">
              <span>🌐</span>
              <span>Tour 360° Disponible</span>
            </div>
          )}

          {imagenes.length > 1 && (
            <>
              <button
                onClick={anteriorImagen}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                ←
              </button>
              <button
                onClick={siguienteImagen}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                →
              </button>

              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex space-x-2">
                {imagenes.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setImagenActual(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === imagenActual ? 'bg-white w-6' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        <div className="p-5">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                Habitación {habitacion.numero}
              </h3>
              <p className="text-sm text-gray-600 flex items-center mt-1">
                <span className="mr-2">🏷️</span>
                {habitacion.tipo.nombre}
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-blue-600">
                Bs. {habitacion.precio_total}
              </p>
              <p className="text-xs text-gray-500">por noche</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 mb-4">
            <span className="flex items-center text-sm text-gray-600">
              <span className="mr-1">👥</span>
              {habitacion.tipo.capacidad} personas
            </span>
            <span className="flex items-center text-sm text-gray-600">
              <span className="mr-1">🏢</span>
              Piso {habitacion.piso}
            </span>
          </div>

          {habitacion.descripcion && (
            <p className="text-sm text-gray-600 mb-4 line-clamp-2">
              {habitacion.descripcion}
            </p>
          )}

          {/* Botones de acción */}
          <div className="space-y-2">
            {/* Botón Tour 360° */}
            {imagenes360.length > 0 && (
              <button
                onClick={() => setMostrarTour360(true)}
                className="w-full py-3 rounded-lg font-semibold transition-all duration-300 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-md hover:shadow-lg flex items-center justify-center space-x-2"
              >
                <span>🌐</span>
                <span>Ver Tour Virtual 360°</span>
              </button>
            )}

            {/* Botón Reservar */}
            <button
              onClick={() => onReservar(habitacion)}
              className="w-full py-3 rounded-lg font-semibold transition-all duration-300 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md hover:shadow-lg"
            >
              🗓️ Reservar Ahora
            </button>
          </div>
        </div>
      </div>

      {/* Modal Tour 360° */}
      {mostrarTour360 && (
        <TourVirtual360
          imagenes360={imagenes360}
          nombreHabitacion={`Habitación ${habitacion.numero}`}
          onClose={() => setMostrarTour360(false)}
        />
      )}
    </>
  );
};

export default HabitacionCard;