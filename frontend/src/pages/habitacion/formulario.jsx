import React, { useState, useEffect } from 'react';

// Datos de tipos de habitación
const tiposEjemplo = [
  { id_tipo: 1, nombre: "Individual", capacidad: 1, precio_base: 200.00 },
  { id_tipo: 2, nombre: "Doble", capacidad: 2, precio_base: 350.00 },
  { id_tipo: 3, nombre: "Suite", capacidad: 3, precio_base: 600.00 }
];

const Formulario = ({ onCancel }) => {
  const [formData, setFormData] = useState({
    numero: '',
    id_tipo: '',
    precio_total: '',
    piso: '',
    estado: 'disponible',
    descripcion: ''
  });
  const [mensaje, setMensaje] = useState('');
  const [tipoError, setTipoError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (mensaje) {
      setMensaje('');
      setTipoError('');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validaciones básicas
    if (!formData.numero.trim()) {
      setMensaje('El número de habitación es obligatorio');
      setTipoError('error');
      return;
    }

    if (!formData.id_tipo) {
      setMensaje('Debe seleccionar un tipo de habitación');
      setTipoError('error');
      return;
    }

    if (!formData.precio_total || parseFloat(formData.precio_total) <= 0) {
      setMensaje('El precio debe ser mayor a 0');
      setTipoError('error');
      return;
    }

    // Éxito
    setMensaje(`¡Habitación ${formData.numero} creada exitosamente!`);
    setTipoError('success');

    // Limpiar formulario
    setTimeout(() => {
      setFormData({
        numero: '',
        id_tipo: '',
        precio_total: '',
        piso: '',
        estado: 'disponible',
        descripcion: ''
      });
      setMensaje('');
      setTipoError('');
    }, 3000);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Nueva Habitación</h3>
      
      {mensaje && (
        <div className={`p-3 rounded mb-4 ${
          tipoError === 'success' 
            ? 'bg-green-100 text-green-700 border border-green-200' 
            : 'bg-red-100 text-red-700 border border-red-200'
        }`}>
          {mensaje}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Número * 
            </label>
            <input
              type="text"
              name="numero"
              value={formData.numero}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ej: 101, 202, 305"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Habitación *
            </label>
            <select
              name="id_tipo"
              value={formData.id_tipo}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Seleccionar tipo...</option>
              {tiposEjemplo.map(tipo => (
                <option key={tipo.id_tipo} value={tipo.id_tipo}>
                  {tipo.nombre} - Bs. {tipo.precio_base.toFixed(2)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Precio por Noche (Bs) *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-500">Bs.</span>
              <input
                type="number"
                step="0.01"
                min="0"
                name="precio_total"
                value={formData.precio_total}
                onChange={handleChange}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Piso</label>
            <input
              type="number"
              min="1"
              max="10"
              name="piso"
              value={formData.piso}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ej: 1, 2, 3"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado *
            </label>
            <select
              name="estado"
              value={formData.estado}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="disponible">🟢 Disponible</option>
              <option value="ocupada">🔴 Ocupada</option>
              <option value="limpieza">🟡 En Limpieza</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Descripción
          </label>
          <textarea
            name="descripcion"
            rows="3"
            value={formData.descripcion}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Describe las características de la habitación..."
          />
        </div>

        <div className="flex gap-2 pt-4">
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded font-medium"
          >
            ✅ Crear Habitación
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded font-medium"
          >
            ❌ Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};

export default Formulario;