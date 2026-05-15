import { useState, useEffect } from 'react';
import { getTiposHabitacion } from '../../services/habitacion';

const FiltrosHabitaciones = ({ onFiltrar, filtrosActivos }) => {
  const [tipos, setTipos] = useState([]);
  const [filtros, setFiltros] = useState({
    id_tipo: filtrosActivos?.id_tipo || '',
    precio_min: filtrosActivos?.precio_min || '',
    precio_max: filtrosActivos?.precio_max || '',
    capacidad: filtrosActivos?.capacidad || '',
    disponible: filtrosActivos?.disponible || false,
  });

  useEffect(() => {
    getTiposHabitacion()
      .then(setTipos)
      .catch((err) => console.error('Error al cargar tipos:', err));
  }, []);

  const handleChange = (campo, valor) => {
    const nuevosFiltros = { ...filtros, [campo]: valor };
    setFiltros(nuevosFiltros);
    onFiltrar(nuevosFiltros);
  };

  const limpiarFiltros = () => {
    const filtrosVacios = { id_tipo: '', precio_min: '', precio_max: '', capacidad: '', disponible: false };
    setFiltros(filtrosVacios);
    onFiltrar(filtrosVacios);
  };

  const filtrosActivos_ = Object.entries(filtros).filter(([k, v]) => v !== '' && v !== false);
  const cantidadActivos = filtrosActivos_.length;

  return (
    <div className="mb-8 rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
            </svg>
          </div>
          <span className="text-sm font-semibold text-slate-800">Filtros de búsqueda</span>
          {cantidadActivos > 0 && (
            <span className="rounded-full bg-blue-600 px-2 py-0.5 text-xs font-bold text-white">
              {cantidadActivos}
            </span>
          )}
        </div>
        {cantidadActivos > 0 && (
          <button
            onClick={limpiarFiltros}
            className="text-xs font-semibold text-slate-400 transition hover:text-red-500"
          >
            Limpiar todo
          </button>
        )}
      </div>

      {/* Controles */}
      <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 lg:grid-cols-5">
        {/* Tipo de habitación */}
        <div className="lg:col-span-1">
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
            Tipo
          </label>
          <select
            value={filtros.id_tipo}
            onChange={(e) => handleChange('id_tipo', e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
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
        <div className="lg:col-span-1">
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
            Capacidad mínima
          </label>
          <select
            value={filtros.capacidad}
            onChange={(e) => handleChange('capacidad', e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
          >
            <option value="">Cualquiera</option>
            <option value="1">1 persona</option>
            <option value="2">2 personas</option>
            <option value="3">3 personas</option>
            <option value="4">4+ personas</option>
          </select>
        </div>

        {/* Precio mínimo */}
        <div className="lg:col-span-1">
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
            Precio mín. (Bs.)
          </label>
          <input
            type="number"
            value={filtros.precio_min}
            onChange={(e) => handleChange('precio_min', e.target.value)}
            placeholder="0"
            min="0"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 placeholder-slate-300 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
          />
        </div>

        {/* Precio máximo */}
        <div className="lg:col-span-1">
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
            Precio máx. (Bs.)
          </label>
          <input
            type="number"
            value={filtros.precio_max}
            onChange={(e) => handleChange('precio_max', e.target.value)}
            placeholder="Sin límite"
            min="0"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 placeholder-slate-300 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
          />
        </div>

        {/* Solo disponibles */}
        <div className="flex items-end lg:col-span-1">
          <button
            onClick={() => handleChange('disponible', !filtros.disponible)}
            className={`flex w-full items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-semibold transition-all ${
              filtros.disponible
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700 shadow-sm'
                : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700'
            }`}
          >
            <span className={`h-4 w-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
              filtros.disponible ? 'border-emerald-500 bg-emerald-500' : 'border-slate-300'
            }`}>
              {filtros.disponible && (
                <svg className="h-2.5 w-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </span>
            Solo disponibles
          </button>
        </div>
      </div>

      {/* Tags de filtros activos */}
      {cantidadActivos > 0 && (
        <div className="flex flex-wrap gap-2 border-t border-slate-100 px-5 py-3">
          {filtros.id_tipo && (
            <Tag
              label={`Tipo: ${tipos.find((t) => t.id_tipo === parseInt(filtros.id_tipo))?.nombre ?? filtros.id_tipo}`}
              onRemove={() => handleChange('id_tipo', '')}
            />
          )}
          {filtros.capacidad && (
            <Tag label={`${filtros.capacidad}+ persona${filtros.capacidad > 1 ? 's' : ''}`} onRemove={() => handleChange('capacidad', '')} />
          )}
          {filtros.precio_min && (
            <Tag label={`Desde Bs. ${filtros.precio_min}`} onRemove={() => handleChange('precio_min', '')} />
          )}
          {filtros.precio_max && (
            <Tag label={`Hasta Bs. ${filtros.precio_max}`} onRemove={() => handleChange('precio_max', '')} />
          )}
          {filtros.disponible && (
            <Tag label="Solo disponibles" onRemove={() => handleChange('disponible', false)} color="emerald" />
          )}
        </div>
      )}
    </div>
  );
};

const Tag = ({ label, onRemove, color = 'blue' }) => {
  const colors = {
    blue: 'border-blue-200 bg-blue-50 text-blue-700',
    emerald: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${colors[color]}`}>
      {label}
      <button onClick={onRemove} className="opacity-60 hover:opacity-100 transition-opacity">
        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </span>
  );
};

export default FiltrosHabitaciones;
