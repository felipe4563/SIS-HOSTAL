import React, { useState, useEffect } from 'react';

const tiposIniciales = [
  { id_tipo: 1, nombre: "Individual", capacidad: 1, precio_base: 200.00, descripcion: "Habitación individual" },
  { id_tipo: 2, nombre: "Doble", capacidad: 2, precio_base: 350.00, descripcion: "Habitación doble" },
  { id_tipo: 3, nombre: "Suite", capacidad: 3, precio_base: 600.00, descripcion: "Suite ejecutiva" }
];

const Tipos = () => {
  const [tipos, setTipos] = useState([]);
  const [formTipo, setFormTipo] = useState({
    nombre: '',
    capacidad: '',
    precio_base: '',
    descripcion: ''
  });
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    setTipos(tiposIniciales);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormTipo(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formTipo.nombre.trim()) {
      setMensaje('El nombre del tipo es obligatorio');
      return;
    }

    const nuevoTipo = {
      id_tipo: tipos.length + 1,
      nombre: formTipo.nombre.trim(),
      capacidad: parseInt(formTipo.capacidad),
      precio_base: parseFloat(formTipo.precio_base),
      descripcion: formTipo.descripcion.trim()
    };
    
    setTipos(prev => [...prev, nuevoTipo]);
    setFormTipo({ nombre: '', capacidad: '', precio_base: '', descripcion: '' });
    setMensaje('✅ Tipo de habitación creado exitosamente!');
    
    setTimeout(() => {
      setMensaje('');
    }, 3000);
  };

  const handleEliminar = (id, nombre) => {
    if (window.confirm(`¿Estás seguro de eliminar el tipo "${nombre}"?`)) {
      setTipos(prev => prev.filter(t => t.id_tipo !== id));
    }
  };

  return (
    <div className="space-y-6">
      {/* Formulario para crear tipo */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Nuevo Tipo de Habitación</h3>
        
        {mensaje && (
          <div className={`p-3 rounded mb-4 ${
            mensaje.includes('✅') 
              ? 'bg-green-100 text-green-700 border border-green-200' 
              : 'bg-red-100 text-red-700 border border-red-200'
          }`}>
            {mensaje}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
            <input
              type="text"
              name="nombre"
              value={formTipo.nombre}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Ej: Individual, Doble, Suite"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Capacidad *</label>
            <input
              type="number"
              min="1"
              name="capacidad"
              value={formTipo.capacidad}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Número de personas"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Precio Base (Bs) *</label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-500">Bs.</span>
              <input
                type="number"
                step="0.01"
                min="0"
                name="precio_base"
                value={formTipo.precio_base}
                onChange={handleChange}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md"
                placeholder="0.00"
                required
              />
            </div>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <textarea
              name="descripcion"
              rows="2"
              value={formTipo.descripcion}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Describe las características de este tipo de habitación..."
            />
          </div>
          <div>
            <button type="submit" className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded">
              ✅ Crear Tipo
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
              {tipos.map(tipo => (
                <tr key={tipo.id_tipo} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-semibold">{tipo.nombre}</td>
                  <td className="px-6 py-4">{tipo.capacidad} persona{tipo.capacidad > 1 ? 's' : ''}</td>
                  <td className="px-6 py-4 font-semibold">Bs. {tipo.precio_base.toFixed(2)}</td>
                  <td className="px-6 py-4 text-gray-600">{tipo.descripcion}</td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => handleEliminar(tipo.id_tipo, tipo.nombre)}
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

export default Tipos;