import { useState } from 'react';
import { useCarrito } from '../../context/CarritoContext';

const HabitacionCard = ({ habitacion, onReservar }) => {
  const { agregarHabitacion, habitaciones } = useCarrito();
  const [mostrandoMensaje, setMostrandoMensaje] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:4000';

  const construirUrlImagen = (ruta) => {
    if (!ruta) return 'https://placehold.co/400x300?text=Sin+Imagen';
    if (ruta.startsWith('http://') || ruta.startsWith('https://')) return ruta;
    return `${API_BASE_URL}/${ruta}`;
  };

  const imagenPortada = habitacion.imagenes?.find(img => img.es_portada) || habitacion.imagenes?.[0];
  const imagenUrl = construirUrlImagen(imagenPortada?.ruta);

  // Verificar si la habitación ya está en el carrito
  const estaEnCarrito = habitaciones.some(h => h.id_habitacion === habitacion.id_habitacion);

  const handleAgregarCarrito = () => {
    const agregado = agregarHabitacion(habitacion);
    
    if (agregado) {
      setMostrandoMensaje(true);
      setTimeout(() => setMostrandoMensaje(false), 2000);
    } else {
      alert('Esta habitación ya está en el carrito');
    }
  };

  return (
    <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 hover:border-blue-200 transform hover:-translate-y-2">
      {/* Imagen */}
      <div className="relative h-56 overflow-hidden">
        <img
          src={imagenUrl}
          alt={`Habitación ${habitacion.numero}`}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        
        {/* Badge de disponibilidad */}
        <div className={`absolute top-4 right-4 px-4 py-2 rounded-full font-bold text-sm shadow-lg ${
          habitacion.estado === 'disponible'
            ? 'bg-green-500 text-white'
            : habitacion.estado === 'ocupada'
            ? 'bg-red-500 text-white'
            : 'bg-yellow-500 text-white'
        }`}>
          {habitacion.estado === 'disponible' ? '✓ Disponible' : 
           habitacion.estado === 'ocupada' ? '✗ Ocupada' : 
           '⚠ Mantenimiento'}
        </div>

        {/* Badge de carrito */}
        {estaEnCarrito && (
          <div className="absolute top-4 left-4 bg-blue-600 text-white px-4 py-2 rounded-full font-bold text-sm shadow-lg animate-pulse">
            🛒 En carrito
          </div>
        )}

        {/* Mensaje de agregado */}
        {mostrandoMensaje && (
          <div className="absolute inset-0 bg-green-600/90 flex items-center justify-center backdrop-blur-sm">
            <div className="text-white text-center">
              <div className="text-4xl mb-2">✓</div>
              <div className="font-bold text-lg">Agregado al carrito</div>
            </div>
          </div>
        )}
      </div>

      {/* Contenido */}
      <div className="p-6">
        {/* Número y tipo */}
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-2xl font-bold text-gray-900">
            Habitación {habitacion.numero}
          </h3>
          <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold">
            {habitacion.tipo?.nombre || 'Sin tipo'}
          </span>
        </div>

        {/* Capacidad */}
        <div className="flex items-center space-x-4 mb-4 text-gray-600">
          <div className="flex items-center">
            <span className="mr-1">👤</span>
            <span className="text-sm font-medium">{habitacion.capacidad} personas</span>
          </div>
          <div className="flex items-center">
            <span className="mr-1">🛏️</span>
            <span className="text-sm font-medium">{habitacion.numero_camas} camas</span>
          </div>
        </div>

        {/* Precio */}
        <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100">
          <div className="text-sm text-gray-600 mb-1">Precio por noche</div>
          <div className="text-3xl font-bold text-blue-600">
            Bs. {habitacion.precio_total?.toFixed(2) || '0.00'}
          </div>
        </div>

        {/* Servicios */}
        {habitacion.servicios && habitacion.servicios.length > 0 && (
          <div className="mb-4">
            <div className="text-sm font-semibold text-gray-700 mb-2">Servicios incluidos:</div>
            <div className="flex flex-wrap gap-2">
              {habitacion.servicios.slice(0, 3).map((servicio, index) => (
                <span
                  key={index}
                  className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-medium"
                >
                  {servicio.nombre}
                </span>
              ))}
              {habitacion.servicios.length > 3 && (
                <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-medium">
                  +{habitacion.servicios.length - 3} más
                </span>
              )}
            </div>
          </div>
        )}

        {/* Botones */}
        <div className="space-y-2">
          {/* Botón de Reserva Individual */}
          <button
            onClick={() => onReservar(habitacion)}
            disabled={habitacion.estado !== 'disponible'}
            className={`w-full py-3 rounded-xl font-bold transition-all ${
              habitacion.estado === 'disponible'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 hover:shadow-xl transform hover:-translate-y-0.5'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {habitacion.estado === 'disponible' ? '📅 Reservar Ahora' : 'No Disponible'}
          </button>

          {/* Botón de Agregar al Carrito */}
          {habitacion.estado === 'disponible' && (
            <button
              onClick={handleAgregarCarrito}
              disabled={estaEnCarrito}
              className={`w-full py-3 rounded-xl font-bold transition-all ${
                estaEnCarrito
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-50 hover:shadow-lg transform hover:-translate-y-0.5'
              }`}
            >
              {estaEnCarrito ? '✓ Ya en carrito' : '🛒 Agregar al carrito'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default HabitacionCard;