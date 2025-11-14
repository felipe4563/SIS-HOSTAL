import React, { useState, useEffect } from 'react';

// Datos de ejemplo
const datosEjemplo = [
  {
    id_habitacion: 1,
    numero: "101",
    id_tipo: 1,
    tipo_habitacion: "Individual",
    piso: 1,
    precio_total: 200.00,
    estado: "disponible",
    descripcion: "Habitación individual con baño privado, TV y wifi",
    imagenes: [
      {
        id_imagen: 1,
        imagen_url: "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400&h=300&fit=crop",
        es_principal: true
      }
    ]
  },
  {
    id_habitacion: 2,
    numero: "102", 
    id_tipo: 2,
    tipo_habitacion: "Doble",
    piso: 1,
    precio_total: 350.00,
    estado: "ocupada",
    descripcion: "Habitación doble matrimonial con vista al jardín",
    imagenes: [
      {
        id_imagen: 3,
        imagen_url: "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=400&h=300&fit=crop",
        es_principal: true
      }
    ]
  }
];

const Lista = () => {
  const [habitaciones, setHabitaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [imagenModal, setImagenModal] = useState({ mostrar: false, imagen: null, habitacion: null });

  useEffect(() => {
    const timer = setTimeout(() => {
      setHabitaciones(datosEjemplo);
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const getColorEstado = (estado) => {
    switch(estado) {
      case 'disponible': return 'bg-green-100 text-green-800';
      case 'ocupada': return 'bg-red-100 text-red-800';
      case 'limpieza': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleEliminar = (id, numero) => {
    if (window.confirm(`¿Estás seguro de eliminar la habitación ${numero}?`)) {
      setHabitaciones(prev => prev.filter(h => h.id_habitacion !== id));
    }
  };

  const GaleriaHabitacion = ({ habitacion }) => {
    const [imagenPrincipal, setImagenPrincipal] = useState(habitacion.imagenes?.[0]);

    if (!habitacion.imagenes || habitacion.imagenes.length === 0) {
      return (
        <div className="bg-gray-100 rounded-lg h-48 flex items-center justify-center">
          <div className="text-center">
            <div className="text-4xl mb-2">🏨</div>
            <p className="text-gray-500 text-sm">Sin imagen</p>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        <div 
          className="bg-gray-200 rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition duration-200 h-48"
          onClick={() => setImagenModal({ mostrar: true, imagen: imagenPrincipal, habitacion })}
        >
          <img 
            src={imagenPrincipal?.imagen_url} 
            alt={`Habitación ${habitacion.numero}`}
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    );
  };

  const ModalImagen = () => {
    if (!imagenModal.mostrar) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-4xl max-h-full overflow-auto">
          <div className="relative">
            <button 
              onClick={() => setImagenModal({ mostrar: false, imagen: null, habitacion: null })}
              className="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-75 z-10"
            >
              ✕
            </button>
            <img 
              src={imagenModal.imagen?.imagen_url} 
              alt={`Habitación ${imagenModal.habitacion?.numero}`}
              className="w-full h-auto max-h-96 object-contain"
            />
          </div>
          <div className="p-4 bg-white">
            <h3 className="text-lg font-semibold">Habitación {imagenModal.habitacion?.numero}</h3>
            <p className="text-gray-600">{imagenModal.habitacion?.tipo_habitacion}</p>
            <p className="text-sm text-gray-500">{imagenModal.habitacion?.descripcion}</p>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-2">Cargando habitaciones...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Vista de tarjetas con imágenes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {habitaciones.map((habitacion) => (
          <div key={habitacion.id_habitacion} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition duration-300">
            <GaleriaHabitacion habitacion={habitacion} />
            
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-bold text-gray-800">Habitación {habitacion.numero}</h3>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getColorEstado(habitacion.estado)}`}>
                  {habitacion.estado}
                </span>
              </div>
              
              <p className="text-gray-600 mb-1">{habitacion.tipo_habitacion}</p>
              <p className="text-gray-500 text-sm mb-2">Piso {habitacion.piso}</p>
              
              <div className="flex justify-between items-center mb-3">
                <span className="text-lg font-bold text-blue-600">Bs. {habitacion.precio_total.toFixed(2)}</span>
                <span className="text-sm text-gray-500">por noche</span>
              </div>
              
              <p className="text-gray-700 text-sm mb-4 line-clamp-2">
                {habitacion.descripcion}
              </p>
              
              <div className="flex space-x-2">
                <button className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-3 rounded text-sm">
                  Reservar
                </button>
                <button className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 px-3 rounded text-sm">
                  Detalles
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <ModalImagen />
    </div>
  );
};

export default Lista;