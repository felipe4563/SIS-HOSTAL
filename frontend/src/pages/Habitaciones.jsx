import React, { useState, useEffect } from 'react';

const Habitaciones = () => {
  const [habitaciones, setHabitaciones] = useState([]);
  const [loading, setLoading] = useState(true);

  // Datos de ejemplo - los reemplazarás con tu API después
  const datosEjemplo = [
    {
      id_habitacion: 1,
      numero: "101",
      tipo_habitacion: "Individual",
      piso: 1,
      precio_total: 80.00,
      estado: "disponible",
      descripcion: "Habitación individual con baño privado"
    },
    {
      id_habitacion: 2,
      numero: "102", 
      tipo_habitacion: "Doble",
      piso: 1,
      precio_total: 120.00,
      estado: "ocupada",
      descripcion: "Habitación doble matrimonial"
    },
    {
      id_habitacion: 3,
      numero: "201",
      tipo_habitacion: "Suite", 
      piso: 2,
      precio_total: 200.00,
      estado: "limpieza",
      descripcion: "Suite ejecutiva con sala"
    },
    {
      id_habitacion: 4,
      numero: "202",
      tipo_habitacion: "Familiar",
      piso: 2, 
      precio_total: 180.00,
      estado: "disponible",
      descripcion: "Habitación familiar para 4 personas"
    }
  ];

  // Simular carga de datos
  useEffect(() => {
    const timer = setTimeout(() => {
      setHabitaciones(datosEjemplo);
      setLoading(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);

  // Función para obtener color según estado
  const getColorEstado = (estado) => {
    switch(estado) {
      case 'disponible': return 'bg-green-100 text-green-800 border-green-200';
      case 'ocupada': return 'bg-red-100 text-red-800 border-red-200';
      case 'limpieza': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Función para eliminar habitación
  const handleEliminar = (id, numero) => {
    if (window.confirm(`¿Estás seguro de eliminar la habitación ${numero}?`)) {
      const nuevasHabitaciones = habitaciones.filter(h => h.id_habitacion !== id);
      setHabitaciones(nuevasHabitaciones);
      alert(`Habitación ${numero} eliminada`);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">Gestión de Habitaciones</h2>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando habitaciones...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Gestión de Habitaciones</h2>
          <p className="text-gray-600">Administra las habitaciones del hostal</p>
        </div>
        <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition duration-200">
          + Nueva Habitación
        </button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="text-2xl font-bold text-gray-800">{habitaciones.length}</div>
          <div className="text-gray-600">Total</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="text-2xl font-bold text-green-600">
            {habitaciones.filter(h => h.estado === 'disponible').length}
          </div>
          <div className="text-gray-600">Disponibles</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="text-2xl font-bold text-red-600">
            {habitaciones.filter(h => h.estado === 'ocupada').length}
          </div>
          <div className="text-gray-600">Ocupadas</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="text-2xl font-bold text-yellow-600">
            {habitaciones.filter(h => h.estado === 'limpieza').length}
          </div>
          <div className="text-gray-600">En limpieza</div>
        </div>
      </div>

      {/* Tabla de habitaciones */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Habitación
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Piso
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Precio
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {habitaciones.map((habitacion) => (
                <tr key={habitacion.id_habitacion} className="hover:bg-gray-50 transition duration-150">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="ml-4">
                        <div className="text-sm font-bold text-gray-900">
                          {habitacion.numero}
                        </div>
                        <div className="text-sm text-gray-500">
                          {habitacion.descripcion}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{habitacion.tipo_habitacion}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">Piso {habitacion.piso}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-gray-900">
                      ${habitacion.precio_total}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full border ${getColorEstado(habitacion.estado)}`}>
                      {habitacion.estado}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button 
                        className="text-blue-600 hover:text-blue-900 font-medium"
                        onClick={() => alert(`Editando habitación ${habitacion.numero}`)}
                      >
                        Editar
                      </button>
                      <button 
                        className="text-red-600 hover:text-red-900 font-medium"
                        onClick={() => handleEliminar(habitacion.id_habitacion, habitacion.numero)}
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mensaje si no hay habitaciones */}
      {habitaciones.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">🏨</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay habitaciones</h3>
          <p className="text-gray-500">Comienza agregando tu primera habitación</p>
        </div>
      )}
    </div>
  );
};

export default Habitaciones;