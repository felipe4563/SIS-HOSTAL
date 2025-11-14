import React, { useState, useEffect } from 'react';

const Habitaciones = () => {
  const [activeTab, setActiveTab] = useState('lista');
  const [habitaciones, setHabitaciones] = useState([]);
  const [tiposHabitacion, setTiposHabitacion] = useState([]);
  const [loading, setLoading] = useState(true);
  const [imagenModal, setImagenModal] = useState({ mostrar: false, imagen: null, habitacion: null });

  // 💰 Datos de ejemplo en bolivianos CON IMÁGENES
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
        },
        {
          id_imagen: 2,
          imagen_url: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop",
          es_principal: false
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
        },
        {
          id_imagen: 4,
          imagen_url: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&h=300&fit=crop",
          es_principal: false
        }
      ]
    },
    {
      id_habitacion: 3,
      numero: "201",
      id_tipo: 3,
      tipo_habitacion: "Suite",
      piso: 2,
      precio_total: 600.00,
      estado: "disponible",
      descripcion: "Suite ejecutiva con sala separada y jacuzzi",
      imagenes: [
        {
          id_imagen: 5,
          imagen_url: "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=400&h=300&fit=crop",
          es_principal: true
        }
      ]
    }
  ];

  const tiposEjemplo = [
    { id_tipo: 1, nombre: "Individual", capacidad: 1, precio_base: 200.00, descripcion: "Habitación individual" },
    { id_tipo: 2, nombre: "Doble", capacidad: 2, precio_base: 350.00, descripcion: "Habitación doble" },
    { id_tipo: 3, nombre: "Suite", capacidad: 3, precio_base: 600.00, descripcion: "Suite ejecutiva" }
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      setHabitaciones(datosEjemplo);
      setTiposHabitacion(tiposEjemplo);
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  // Componente de Galería de Imágenes
  const GaleriaHabitacion = ({ habitacion }) => {
    const [imagenPrincipal, setImagenPrincipal] = useState(
      habitacion.imagenes?.find(img => img.es_principal) || habitacion.imagenes?.[0]
    );

    const abrirModal = (imagen) => {
      setImagenModal({
        mostrar: true,
        imagen: imagen,
        habitacion: habitacion
      });
    };

    const cambiarImagenPrincipal = (imagen) => {
      setImagenPrincipal(imagen);
    };

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
        {/* Imagen principal */}
        <div 
          className="bg-gray-200 rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition duration-200 h-48"
          onClick={() => abrirModal(imagenPrincipal)}
        >
          <img 
            src={imagenPrincipal?.imagen_url} 
            alt={`Habitación ${habitacion.numero}`}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Miniaturas - solo si hay más de 1 imagen */}
        {habitacion.imagenes.length > 1 && (
          <div className="grid grid-cols-4 gap-2">
            {habitacion.imagenes.map((imagen, index) => (
              <div 
                key={imagen.id_imagen || index}
                className={`border-2 rounded cursor-pointer overflow-hidden ${
                  imagenPrincipal?.id_imagen === imagen.id_imagen ? 'border-blue-500' : 'border-gray-200'
                }`}
                onClick={() => cambiarImagenPrincipal(imagen)}
              >
                <img 
                  src={imagen.imagen_url} 
                  alt={`Vista ${index + 1}`}
                  className="w-full h-16 object-cover"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Modal para imagen ampliada
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

  // Componente de Lista CON IMÁGENES
  const ListaHabitaciones = () => {
    const getColorEstado = (estado) => {
      switch(estado) {
        case 'disponible': return 'bg-green-100 text-green-800';
        case 'ocupada': return 'bg-red-100 text-red-800';
        case 'limpieza': return 'bg-yellow-100 text-yellow-800';
        default: return 'bg-gray-100 text-gray-800';
      }
    };

    const handleEliminar = (id, numero) => {
      if (window.confirm(`¿Eliminar habitación ${numero}?`)) {
        setHabitaciones(prev => prev.filter(h => h.id_habitacion !== id));
      }
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
        <div>
          <h3 className="text-lg font-semibold mb-4">Vista de Galería</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {habitaciones.map((habitacion) => (
              <div key={habitacion.id_habitacion} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition duration-300">
                {/* Galería de imágenes */}
                <GaleriaHabitacion habitacion={habitacion} />
                
                {/* Información de la habitación */}
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
                  
                  {/* Acciones */}
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
        </div>

        {/* Vista de tabla tradicional */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Vista de Tabla</h3>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Imagen</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Número</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Piso</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Precio (Bs)</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {habitaciones.map((habitacion) => (
                    <tr key={habitacion.id_habitacion} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="w-16 h-12 rounded overflow-hidden cursor-pointer"
                             onClick={() => abrirModal(habitacion.imagenes?.[0])}>
                          <img 
                            src={habitacion.imagenes?.[0]?.imagen_url} 
                            alt={`Habitación ${habitacion.numero}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4 font-bold">{habitacion.numero}</td>
                      <td className="px-6 py-4">{habitacion.tipo_habitacion}</td>
                      <td className="px-6 py-4">Piso {habitacion.piso}</td>
                      <td className="px-6 py-4 font-semibold">Bs. {habitacion.precio_total.toFixed(2)}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getColorEstado(habitacion.estado)}`}>
                          {habitacion.estado}
                        </span>
                      </td>
                      <td className="px-6 py-4 space-x-2">
                        <button 
                          onClick={() => setActiveTab('formulario')}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Editar
                        </button>
                        <button 
                          onClick={() => handleEliminar(habitacion.id_habitacion, habitacion.numero)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {habitaciones.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🏨</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay habitaciones</h3>
            <p className="text-gray-500">Comienza agregando tu primera habitación</p>
          </div>
        )}
      </div>
    );
  };

  // Componente de Formulario (sin cambios)
  const FormularioHabitacion = () => {
    const [formData, setFormData] = useState({
      numero: '',
      id_tipo: '',
      precio_total: '',
      piso: '',
      estado: 'disponible',
      descripcion: ''
    });

    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
      e.preventDefault();
      alert('Habitación guardada: ' + JSON.stringify(formData, null, 2));
      setFormData({
        numero: '', id_tipo: '', precio_total: '', piso: '', estado: 'disponible', descripcion: ''
      });
    };

    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Nueva Habitación</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Número *</label>
              <input
                type="text"
                name="numero"
                value={formData.numero}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo *</label>
              <select
                name="id_tipo"
                value={formData.id_tipo}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Seleccionar tipo...</option>
                {tiposHabitacion.map(tipo => (
                  <option key={tipo.id_tipo} value={tipo.id_tipo}>
                    {tipo.nombre} - Bs. {tipo.precio_base.toFixed(2)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Precio Total (Bs) *</label>
              <input
                type="number"
                step="0.01"
                name="precio_total"
                value={formData.precio_total}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Piso</label>
              <input
                type="number"
                name="piso"
                value={formData.piso}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estado *</label>
              <select
                name="estado"
                value={formData.estado}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="disponible">Disponible</option>
                <option value="ocupada">Ocupada</option>
                <option value="limpieza">Limpieza</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <textarea
              name="descripcion"
              rows="3"
              value={formData.descripcion}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
            >
              Guardar Habitación
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('lista')}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    );
  };

  // Componente de Tipos de Habitación (sin cambios)
  const TiposHabitacion = () => {
    const [formTipo, setFormTipo] = useState({
      nombre: '',
      capacidad: '',
      precio_base: '',
      descripcion: ''
    });

    const handleChangeTipo = (e) => {
      const { name, value } = e.target;
      setFormTipo(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmitTipo = (e) => {
      e.preventDefault();
      const nuevoTipo = {
        id_tipo: tiposHabitacion.length + 1,
        ...formTipo
      };
      setTiposHabitacion(prev => [...prev, nuevoTipo]);
      setFormTipo({ nombre: '', capacidad: '', precio_base: '', descripcion: '' });
      alert('Tipo de habitación creado');
    };

    const handleEliminarTipo = (id, nombre) => {
      if (window.confirm(`¿Eliminar tipo ${nombre}?`)) {
        setTiposHabitacion(prev => prev.filter(t => t.id_tipo !== id));
      }
    };

    return (
      <div className="space-y-6">
        {/* Formulario para crear tipo */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Nuevo Tipo de Habitación</h3>
          <form onSubmit={handleSubmitTipo} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
              <input
                type="text"
                name="nombre"
                value={formTipo.nombre}
                onChange={handleChangeTipo}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Capacidad *</label>
              <input
                type="number"
                name="capacidad"
                value={formTipo.capacidad}
                onChange={handleChangeTipo}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Precio Base (Bs) *</label>
              <input
                type="number"
                step="0.01"
                name="precio_base"
                value={formTipo.precio_base}
                onChange={handleChangeTipo}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
              <textarea
                name="descripcion"
                rows="2"
                value={formTipo.descripcion}
                onChange={handleChangeTipo}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <button type="submit" className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded">
                Crear Tipo
              </button>
            </div>
          </form>
        </div>

        {/* Lista de tipos */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b">
            <h3 className="text-lg font-semibold">Tipos de Habitación Existentes</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Capacidad</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Precio Base (Bs)</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Descripción</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {tiposHabitacion.map(tipo => (
                  <tr key={tipo.id_tipo} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-semibold">{tipo.nombre}</td>
                    <td className="px-6 py-4">{tipo.capacidad} personas</td>
                    <td className="px-6 py-4">Bs. {tipo.precio_base.toFixed(2)}</td>
                    <td className="px-6 py-4">{tipo.descripcion}</td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => handleEliminarTipo(tipo.id_tipo, tipo.nombre)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // Tabs navigation
  const tabs = [
    { id: 'lista', label: '📋 Lista de Habitaciones' },
    { id: 'formulario', label: '➕ Nueva Habitación' },
    { id: 'tipos', label: '🏷️ Tipos de Habitación' }
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Gestión de Habitaciones</h2>
        <p className="text-gray-600">Administra las habitaciones del hostal</p>
      </div>

      {/* Navegación de pestañas */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Contenido de la pestaña activa */}
      <div>
        {activeTab === 'lista' && <ListaHabitaciones />}
        {activeTab === 'formulario' && <FormularioHabitacion />}
        {activeTab === 'tipos' && <TiposHabitacion />}
      </div>

      {/* Modal para imagen ampliada */}
      <ModalImagen />
    </div>
  );
};

export default Habitaciones;