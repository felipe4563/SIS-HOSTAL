import { useState, useEffect } from 'react';
import { getTiposHabitacion } from '../../services/habitacion';

const FiltrosHabitaciones = ({ onFiltrar, filtrosActivos }) => {
  const [tipos, setTipos] = useState([]);
  const [filtros, setFiltros] = useState({
    id_tipo: filtrosActivos?.id_tipo || '',
    precio_min: filtrosActivos?.precio_min || '',
    precio_max: filtrosActivos?.precio_max || '',
    capacidad: filtrosActivos?.capacidad || ''
  });

  useEffect(() => {
    cargarTipos();
  }, []);

  const cargarTipos = async () => {
    try {
      const data = await getTiposHabitacion();
      setTipos(data);
    } catch (error) {
      console.error('Error al cargar tipos:', error);
    }
  };

  const handleChange = (campo, valor) => {
    const nuevosFiltros = { ...filtros, [campo]: valor };
    setFiltros(nuevosFiltros);
    // 👇 Aplicar filtros automáticamente
    onFiltrar(nuevosFiltros);
  };

  const limpiarFiltros = () => {
    const filtrosVacios = {
      id_tipo: '',
      precio_min: '',
      precio_max: '',
      capacidad: ''
    };
    setFiltros(filtrosVacios);
    onFiltrar(filtrosVacios);
  };

  const contarFiltrosActivos = () => {
    return Object.values(filtros).filter(v => v && v !== '').length;
  };

  return (
    <div className="bg-white/95 backdrop-blur rounded-2xl shadow-xl border border-blue-100 p-4 sm:p-6 mb-8">
      {/* Header con contador de filtros */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
        <div className="flex items-center space-x-2 min-w-0">
          <span className="text-base sm:text-lg font-bold text-gray-900 truncate">🔎 Filtros inteligentes</span>
          {contarFiltrosActivos() > 0 && (
            <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-sm">
              {contarFiltrosActivos()} activos
            </span>
          )}
        </div>
        
        {contarFiltrosActivos() > 0 && (
          <button
            onClick={limpiarFiltros}
            className="text-sm text-red-600 hover:text-red-700 font-semibold underline underline-offset-2 transition-colors self-start sm:self-auto"
          >
            Limpiar todos
          </button>
        )}
      </div>

      {/* Grid de filtros siempre visible */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Tipo de habitación */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Tipo de Habitación
          </label>
          <select
            value={filtros.id_tipo}
            onChange={(e) => handleChange('id_tipo', e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          >
            <option value="">Todos los tipos</option>
            {tipos.map((tipo) => (
              <option key={tipo.id_tipo} value={tipo.id_tipo}>
                {tipo.nombre}
              </option>
            ))}
          </select>
        </div>

        {/* Capacidad */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Capacidad mínima
          </label>
          <select
            value={filtros.capacidad}
            onChange={(e) => handleChange('capacidad', e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          >
            <option value="">Cualquiera</option>
            <option value="1">1 persona</option>
            <option value="2">2 personas</option>
            <option value="3">3 personas</option>
            <option value="4">4+ personas</option>
          </select>
        </div>

        {/* Precio mínimo */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Precio mínimo (Bs.)
          </label>
          <input
            type="number"
            value={filtros.precio_min}
            onChange={(e) => handleChange('precio_min', e.target.value)}
            placeholder="0"
            min="0"
            className="w-full px-3 py-2.5 border border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>

        {/* Precio máximo */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Precio máximo (Bs.)
          </label>
          <input
            type="number"
            value={filtros.precio_max}
            onChange={(e) => handleChange('precio_max', e.target.value)}
            placeholder="1000"
            min="0"
            className="w-full px-3 py-2.5 border border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>
      </div>

      {/* Información de filtros activos */}
      {contarFiltrosActivos() > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex flex-wrap gap-2">
            {filtros.id_tipo && (
              <span className="inline-flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium border border-blue-200">
                Tipo: {tipos.find(t => t.id_tipo === parseInt(filtros.id_tipo))?.nombre}
                <button
                  onClick={() => handleChange('id_tipo', '')}
                  className="ml-2 text-blue-600 hover:text-blue-800 font-bold"
                >
                  ✕
                </button>
              </span>
            )}
            
            {filtros.capacidad && (
              <span className="inline-flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium border border-blue-200">
                Capacidad: {filtros.capacidad}+ personas
                <button
                  onClick={() => handleChange('capacidad', '')}
                  className="ml-2 text-blue-600 hover:text-blue-800 font-bold"
                >
                  ✕
                </button>
              </span>
            )}
            
            {filtros.precio_min && (
              <span className="inline-flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium border border-blue-200">
                Min: Bs. {filtros.precio_min}
                <button
                  onClick={() => handleChange('precio_min', '')}
                  className="ml-2 text-blue-600 hover:text-blue-800 font-bold"
                >
                  ✕
                </button>
              </span>
            )}
            
            {filtros.precio_max && (
              <span className="inline-flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium border border-blue-200">
                Max: Bs. {filtros.precio_max}
                <button
                  onClick={() => handleChange('precio_max', '')}
                  className="ml-2 text-blue-600 hover:text-blue-800 font-bold"
                >
                  ✕
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FiltrosHabitaciones;