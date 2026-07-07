import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCarrito } from '../../context/CarritoContext';

/* ── Iconos SVG ─────────────────────────────────────────────────────────── */
const ICON_DEFS = {
  globe:          ['M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418'],
  cart:           ['M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z'],
  check:          ['M4.5 12.75l6 6 9-13.5'],
  checkCircle:    ['M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z'],
  xCircle:        ['M9.75 9.75l4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z'],
  warnCircle:     ['M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z'],
  chevronLeft:    ['M15.75 19.5 8.25 12l7.5-7.5'],
  chevronRight:   ['M8.25 4.5l7.5 7.5-7.5 7.5'],
  tag:            ['M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z', 'M6 6h.008v.008H6V6Z'],
  users:          ['M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z'],
  building:       ['M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Z'],
  calendar:       ['M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5'],
};

const SvgIcon = ({ name, className = 'h-5 w-5' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className={className}>
    {(ICON_DEFS[name] || []).map((d, i) => (
      <path key={i} strokeLinecap="round" strokeLinejoin="round" d={d} />
    ))}
  </svg>
);
/* ────────────────────────────────────────────────────────────────────────── */

const HabitacionCard = ({ habitacion, onReservar }) => {
  const [imagenActual, setImagenActual] = useState(0);
  const [mostrandoMensaje, setMostrandoMensaje] = useState(false);

  const navigate = useNavigate();
  const { agregarHabitacion, habitaciones } = useCarrito();

  const API_BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:4000';

  const construirUrlImagen = (ruta) => {
    if (!ruta) return 'https://placehold.co/400x300?text=Sin+Imagen';
    if (ruta.startsWith('http://') || ruta.startsWith('https://')) return ruta;
    return `${API_BASE_URL}/api/uploads/${ruta}`;
  };

  const imagenesNormales = habitacion.imagenes?.filter(img => img.tipo_imagen === 'normal') || [];
  const imagenes360 = habitacion.imagenes?.filter(img => img.tipo_imagen === '360') || [];

  const imagenes = imagenesNormales.length > 0
    ? imagenesNormales
    : [{ ruta: null, tipo_imagen: 'normal', es_portada: true }];

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

  const siguienteImagen = () => setImagenActual((prev) => (prev + 1) % imagenes.length);
  const anteriorImagen = () => setImagenActual((prev) => (prev - 1 + imagenes.length) % imagenes.length);
  const handleAbrirTour = () => navigate('/tour360', {
    state: {
      imagenes360,
      nombreHabitacion: `Habitación ${habitacion.numero}`,
    },
  });

  /* Badge de estado */
  const estadoBadge = {
    disponible:   { cls: 'bg-green-500 text-white', icon: 'checkCircle', label: 'Disponible' },
    ocupada:      { cls: 'bg-red-500 text-white',   icon: 'xCircle',     label: 'Ocupada' },
    mantenimiento:{ cls: 'bg-yellow-500 text-white', icon: 'warnCircle',  label: 'Mantenimiento' },
  };
  const badge = estadoBadge[habitacion.estado] ?? estadoBadge.mantenimiento;

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
        {/* ── Galería ── */}
        <div className="relative h-56 sm:h-64 bg-gray-200 group">
          <img
            src={construirUrlImagen(imagenes[imagenActual]?.ruta)}
            alt={`Habitación ${habitacion.numero}`}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = 'https://placehold.co/400x300?text=Error+Imagen';
            }}
          />

          {/* Badge tour 360 */}
          {imagenes360.length > 0 && (
            <div className="absolute top-3 left-3 bg-gradient-to-r from-indigo-600 to-blue-700 text-white px-2.5 sm:px-3 py-1.5 rounded-full text-[11px] sm:text-xs font-bold flex items-center gap-1.5 shadow-lg max-w-[75%]">
              <SvgIcon name="globe" className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="truncate">Tour 360° Disponible</span>
            </div>
          )}

          {/* Badge en carrito */}
          {estaEnCarrito && (
            <div className="absolute top-3 right-3 bg-green-500 text-white px-2.5 sm:px-3 py-1.5 rounded-full text-[11px] sm:text-xs font-bold flex items-center gap-1.5 shadow-lg animate-pulse">
              <SvgIcon name="cart" className="h-3.5 w-3.5 flex-shrink-0" />
              <span>En Carrito</span>
            </div>
          )}

          {/* Overlay "agregado" */}
          {mostrandoMensaje && (
            <div className="absolute inset-0 bg-green-600/95 flex items-center justify-center backdrop-blur-sm animate-fadeIn z-10">
              <div className="text-white text-center">
                <div className="flex justify-center mb-2">
                  <SvgIcon name="check" className="h-14 w-14 animate-bounce" />
                </div>
                <div className="font-bold text-lg">Agregado al carrito</div>
                <div className="text-sm opacity-90 mt-1">Habitación {habitacion.numero}</div>
              </div>
            </div>
          )}

          {/* Badge estado */}
          {habitacion.estado && (
            <div className={`absolute bottom-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold shadow-lg ${badge.cls}`}>
              <SvgIcon name={badge.icon} className="h-3.5 w-3.5 flex-shrink-0" />
              {badge.label}
            </div>
          )}

          {/* Navegación imágenes */}
          {imagenes.length > 1 && (
            <>
              <button
                onClick={anteriorImagen}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity z-10"
              >
                <SvgIcon name="chevronLeft" className="h-4 w-4" />
              </button>
              <button
                onClick={siguienteImagen}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity z-10"
              >
                <SvgIcon name="chevronRight" className="h-4 w-4" />
              </button>

              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex space-x-2 z-10">
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

        {/* ── Info ── */}
        <div className="p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-3">
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">
                Habitación {habitacion.numero}
              </h3>
              <p className="text-sm text-slate-600 flex items-center gap-1.5 mt-1">
                <SvgIcon name="tag" className="h-4 w-4 flex-shrink-0 text-slate-400" />
                {habitacion.tipo.nombre}
              </p>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-xl sm:text-2xl font-extrabold text-blue-700">
                Bs. {habitacion.precio_total?.toFixed(2) || '0.00'}
              </p>
              <p className="text-xs text-slate-500 font-medium">por noche</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2.5 mb-4">
            <span className="flex items-center gap-1.5 text-sm text-slate-700 bg-slate-100 px-3 py-1 rounded-full">
              <SvgIcon name="users" className="h-4 w-4 flex-shrink-0 text-slate-500" />
              {habitacion.tipo.capacidad} personas
            </span>
            <span className="flex items-center gap-1.5 text-sm text-slate-700 bg-slate-100 px-3 py-1 rounded-full">
              <SvgIcon name="building" className="h-4 w-4 flex-shrink-0 text-slate-500" />
              Piso {habitacion.piso}
            </span>
          </div>

          {habitacion.descripcion && (
            <p className="text-sm text-slate-600 mb-4 line-clamp-2 leading-relaxed">
              {habitacion.descripcion}
            </p>
          )}

          <div className="space-y-2">
            {imagenes360.length > 0 && (
              <button
                onClick={handleAbrirTour}
                className="w-full py-3 rounded-xl font-semibold transition-all duration-300 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-md hover:shadow-lg flex items-center justify-center gap-2"
              >
                <SvgIcon name="globe" className="h-5 w-5" />
                <span>Ver Tour Virtual 360°</span>
              </button>
            )}

            <button
              onClick={() => onReservar(habitacion)}
              disabled={habitacion.estado !== 'disponible'}
              className={`w-full py-3 rounded-xl font-semibold transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2 ${
                habitacion.estado === 'disponible'
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {habitacion.estado === 'disponible' ? (
                <>
                  <SvgIcon name="calendar" className="h-5 w-5" />
                  <span>Reservar Ahora</span>
                </>
              ) : (
                <span>No Disponible</span>
              )}
            </button>

            {habitacion.estado === 'disponible' && (
              <button
                onClick={handleAgregarCarrito}
                disabled={estaEnCarrito}
                className={`w-full py-3 rounded-xl font-semibold transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2 ${
                  estaEnCarrito
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed border-2 border-gray-300'
                    : 'bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-50 hover:border-blue-700'
                }`}
              >
                {estaEnCarrito ? (
                  <>
                    <SvgIcon name="checkCircle" className="h-5 w-5" />
                    <span>Ya en carrito</span>
                  </>
                ) : (
                  <>
                    <SvgIcon name="cart" className="h-5 w-5" />
                    <span>Agregar al carrito</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
  );
};

export default HabitacionCard;
