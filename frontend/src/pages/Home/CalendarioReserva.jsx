import { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

const CalendarioReserva = ({ 
  idHabitacion, 
  fechaEntrada, 
  fechaSalida, 
  onFechasChange 
}) => {
  const [fechasOcupadas, setFechasOcupadas] = useState([]);
  const [seleccionando, setSeleccionando] = useState('entrada');
  const [rangoTemporal, setRangoTemporal] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarFechasOcupadas();
  }, [idHabitacion]);

  const cargarFechasOcupadas = async () => {
    try {
      setLoading(true);
      const hoy = new Date();
      const dentroDe6Meses = new Date();
      dentroDe6Meses.setMonth(dentroDe6Meses.getMonth() + 6);

      const response = await fetch(
        `${import.meta.env.VITE_BASE_URL}/api/habitaciones/${idHabitacion}/fechas-ocupadas?` +
        `fecha_inicio=${hoy.toISOString().split('T')[0]}&` +
        `fecha_fin=${dentroDe6Meses.toISOString().split('T')[0]}`
      );
      
      const data = await response.json();
      
      // Convertir a array de fechas
      const fechas = [];
      data.forEach(reserva => {
        const inicio = new Date(reserva.fecha_entrada);
        const fin = new Date(reserva.fecha_salida);
        
        for (let d = new Date(inicio); d <= fin; d.setDate(d.getDate() + 1)) {
          fechas.push(new Date(d).toISOString().split('T')[0]);
        }
      });
      
      setFechasOcupadas(fechas);
    } catch (error) {
      console.error('Error cargando fechas ocupadas:', error);
    } finally {
      setLoading(false);
    }
  };

  const esFechaOcupada = (fecha) => {
    const fechaStr = fecha.toISOString().split('T')[0];
    return fechasOcupadas.includes(fechaStr);
  };

  const esFechaPasada = (fecha) => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    return fecha < hoy;
  };

  const esFechaDeshabilitada = (fecha) => {
    return esFechaPasada(fecha) || esFechaOcupada(fecha);
  };

  const handleClickDia = (fecha) => {
    if (esFechaDeshabilitada(fecha)) return;

    const fechaStr = fecha.toISOString().split('T')[0];

    if (seleccionando === 'entrada') {
      onFechasChange(fechaStr, '');
      setSeleccionando('salida');
      setRangoTemporal({ inicio: fecha, fin: null });
    } else {
      // Verificar que no haya fechas ocupadas en el rango
      if (rangoTemporal && fecha > rangoTemporal.inicio) {
        const hayConflicto = verificarConflictoEnRango(rangoTemporal.inicio, fecha);
        
        if (!hayConflicto) {
          onFechasChange(rangoTemporal.inicio.toISOString().split('T')[0], fechaStr);
          setSeleccionando('entrada');
          setRangoTemporal(null);
        } else {
          alert('⚠️ El rango seleccionado incluye fechas no permitidas (ocupadas o fin de semana). Por favor, elige otras fechas.');
          onFechasChange('', '');
          setSeleccionando('entrada');
          setRangoTemporal(null);
        }
      } else {
        alert('⚠️ La fecha de salida debe ser posterior a la de entrada');
      }
    }
  };

  const verificarConflictoEnRango = (inicio, fin) => {
    for (let d = new Date(inicio); d <= fin; d.setDate(d.getDate() + 1)) {
      if (esFechaOcupada(d)) return true;
    }
    return false;
  };

  const getTileClassName = ({ date, view }) => {
    if (view !== 'month') return '';

    const fechaStr = date.toISOString().split('T')[0];
    const clases = ['cal-tile relative flex items-center justify-center font-semibold rounded-xl transition-all duration-200'];

    // Fecha ocupada
    if (esFechaOcupada(date)) {
      clases.push('bg-red-100 text-red-700 cursor-not-allowed hover:bg-red-200');
      return clases.join(' ');
    }
    
    // Fecha pasada
    if (esFechaPasada(date)) {
      clases.push('bg-gray-100 text-gray-400 cursor-not-allowed');
      return clases.join(' ');
    }

    // Fecha seleccionada (entrada)
    if (fechaEntrada && fechaStr === fechaEntrada) {
      clases.push('bg-gradient-to-br from-green-500 to-green-600 text-white font-bold shadow-lg shadow-green-200 scale-105');
      return clases.join(' ');
    }

    // Fecha seleccionada (salida)
    if (fechaSalida && fechaStr === fechaSalida) {
      clases.push('bg-gradient-to-br from-blue-500 to-blue-600 text-white font-bold shadow-lg shadow-blue-200 scale-105');
      return clases.join(' ');
    }

    // Rango seleccionado
    if (fechaEntrada && fechaSalida) {
      const entrada = new Date(fechaEntrada);
      const salida = new Date(fechaSalida);
      if (date > entrada && date < salida) {
        clases.push('bg-blue-50 text-blue-700 border border-blue-200');
        return clases.join(' ');
      }
    }

    // Fecha disponible normal
    clases.push('hover:bg-blue-50 hover:border-2 hover:border-blue-400 hover:scale-105 cursor-pointer');
    
    return clases.join(' ');
  };

  const getTileContent = ({ date, view }) => {
    if (view !== 'month') return null;

    const fechaStr = date.toISOString().split('T')[0];

    // Emoji para fecha de entrada
    if (fechaEntrada && fechaStr === fechaEntrada) {
      return (
        <span className="absolute top-0.5 right-0.5 text-xs">🛬</span>
      );
    }

    // Emoji para fecha de salida
    if (fechaSalida && fechaStr === fechaSalida) {
      return (
        <span className="absolute top-0.5 right-0.5 text-xs">🛫</span>
      );
    }

    // Emoji para fecha ocupada
    if (esFechaOcupada(date)) {
      return (
        <span className="absolute bottom-0.5 right-0.5 text-xs">🚫</span>
      );
    }

    return null;
  };

  const handleLimpiar = () => {
    onFechasChange('', '');
    setSeleccionando('entrada');
    setRangoTemporal(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando disponibilidad...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Instrucciones */}
      <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
        <div className="flex items-start">
          <svg className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="font-semibold text-blue-900 mb-1">
              {seleccionando === 'entrada' ? '📅 Paso 1: Selecciona la fecha de entrada' : '📅 Paso 2: Selecciona la fecha de salida'}
            </p>
            <p className="text-sm text-blue-700">
              Los días en <span className="font-bold text-red-600">rojo</span> ya están reservados
            </p>
          </div>
        </div>
      </div>

      {/* Fechas seleccionadas */}
      {(fechaEntrada || fechaSalida) && (
        <div className="mb-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-700 mb-2">Fechas seleccionadas:</p>
              <div className="flex gap-4 flex-wrap">
                {fechaEntrada && (
                  <div className="flex items-center">
                    <span className="text-2xl mr-2">🛬</span>
                    <div>
                      <p className="text-xs text-gray-600">Entrada</p>
                      <p className="font-bold text-green-700">
                        {new Date(fechaEntrada + 'T00:00:00').toLocaleDateString('es-ES', { 
                          weekday: 'short', 
                          day: 'numeric', 
                          month: 'short' 
                        })}
                      </p>
                    </div>
                  </div>
                )}
                {fechaSalida && (
                  <div className="flex items-center">
                    <span className="text-2xl mr-2">🛫</span>
                    <div>
                      <p className="text-xs text-gray-600">Salida</p>
                      <p className="font-bold text-green-700">
                        {new Date(fechaSalida + 'T00:00:00').toLocaleDateString('es-ES', { 
                          weekday: 'short', 
                          day: 'numeric', 
                          month: 'short' 
                        })}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={handleLimpiar}
              className="px-4 py-2 bg-white border-2 border-gray-300 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-all"
            >
              🔄 Limpiar
            </button>
          </div>
        </div>
      )}

      {/* Calendario */}
      <div className="calendario-tailwind w-full">
        <Calendar
          locale="es"
          onClickDay={handleClickDia}
          tileClassName={getTileClassName}
          tileContent={getTileContent}
          tileDisabled={({ date }) => esFechaDeshabilitada(date)}
          minDetail="month"
          showNeighboringMonth={false}
          prev2Label={null}
          next2Label={null}
          formatShortWeekday={(locale, date) => 
            ['D', 'L', 'M', 'X', 'J', 'V', 'S'][date.getDay()]
          }
        />
      </div>

      {/* Leyenda */}
      <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
        <p className="text-xs font-bold text-gray-700 mb-3">LEYENDA:</p>
        <div className="grid gap-3 text-sm [grid-template-columns:repeat(auto-fit,minmax(160px,1fr))]">
          <div className="flex items-center">
            <div className="w-4 h-4 rounded bg-red-500 mr-2"></div>
            <span className="text-gray-700 font-medium whitespace-nowrap">Ocupado</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 rounded bg-gray-300 mr-2"></div>
            <span className="text-gray-700 font-medium whitespace-nowrap">No disponible</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 rounded bg-green-500 mr-2"></div>
            <span className="text-gray-700 font-medium whitespace-nowrap">Entrada</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 rounded bg-blue-500 mr-2"></div>
            <span className="text-gray-700 font-medium whitespace-nowrap">Salida</span>
          </div>
        </div>
      </div>

      {/* Estilos globales para react-calendar usando Tailwind */}
      <style jsx>{`
        .calendario-tailwind {
          /* Tamaños fluidos según viewport */
          --cal-nav-font: clamp(14px, 3.2vw, 18px);
          /* Más pequeño en móvil para encajar en el modal */
          --cal-tile-size: clamp(32px, 7.2vw, 56px);
          --cal-tile-font: clamp(12px, 3.2vw, 16px);
          --cal-emoji: clamp(10px, 2.6vw, 12px);
        }

        .calendario-tailwind :global(.react-calendar) {
          @apply w-full max-w-full border-none rounded-2xl p-3 sm:p-5 bg-white shadow-lg;
          min-width: 0;
        }

        .calendario-tailwind :global(.react-calendar__viewContainer) {
          min-width: 0;
        }

        .calendario-tailwind :global(.react-calendar__navigation) {
          @apply mb-5 flex gap-2;
        }

        .calendario-tailwind :global(.react-calendar__navigation button) {
          @apply min-w-[40px] h-11 sm:h-12 bg-transparent rounded-xl font-bold text-base sm:text-lg text-gray-800 hover:bg-gray-100 disabled:opacity-30 transition-all;
          font-size: var(--cal-nav-font);
        }

        .calendario-tailwind :global(.react-calendar__navigation__label) {
          @apply flex-grow;
        }

        .calendario-tailwind :global(.react-calendar__month-view__weekdays) {
          @apply text-center uppercase font-bold text-xs text-gray-600 mb-2;
        }

        .calendario-tailwind :global(.react-calendar__month-view__weekdays__weekday) {
          @apply py-3;
        }

        .calendario-tailwind :global(.react-calendar__month-view__weekdays__weekday abbr) {
          @apply no-underline;
        }

        /* Fuerza un layout estable y responsivo de 7 columnas */
        .calendario-tailwind :global(.react-calendar__month-view__weekdays),
        .calendario-tailwind :global(.react-calendar__month-view__days) {
          display: grid;
          grid-template-columns: repeat(7, minmax(0, 1fr));
        }

        .calendario-tailwind :global(.react-calendar__tile) {
          @apply m-0.5 border-2 border-transparent;
          width: 100%;
        }

        .calendario-tailwind :global(.cal-tile) {
          height: var(--cal-tile-size);
          font-size: var(--cal-tile-font);
          line-height: 1;
        }

        .calendario-tailwind :global(.cal-tile span) {
          font-size: var(--cal-emoji);
        }

        .calendario-tailwind :global(.react-calendar__tile--now) {
          @apply bg-yellow-100 text-yellow-800 font-bold;
        }

        .calendario-tailwind :global(.react-calendar__tile--now:hover) {
          @apply bg-yellow-200;
        }

        .calendario-tailwind :global(.react-calendar__tile:disabled) {
          @apply cursor-not-allowed opacity-50;
        }

        .calendario-tailwind :global(.react-calendar__month-view__days) {
          @apply gap-1;
        }

        @media (max-width: 768px) {
          .calendario-tailwind :global(.react-calendar) {
            @apply p-3;
          }
          
          .calendario-tailwind :global(.react-calendar__tile) {
            @apply text-sm;
          }

          .calendario-tailwind :global(.react-calendar__navigation) {
            @apply mb-3;
          }
        }
      `}</style>
    </div>
  );
};

export default CalendarioReserva;