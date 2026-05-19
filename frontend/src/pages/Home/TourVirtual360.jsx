import { useState, useEffect, useCallback } from 'react';
import { ReactPhotoSphereViewer } from 'react-photo-sphere-viewer';

const API_BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:4000';

const buildSrc = (ruta) => {
  if (!ruta) return '';
  if (ruta.startsWith('http://') || ruta.startsWith('https://')) return ruta;
  return `${API_BASE_URL}/api/uploads/${ruta}`;
};

const TourVirtual360 = ({ imagenes360 = [], nombreHabitacion = 'Habitación', onClose }) => {
  const [imagenActual, setImagenActual] = useState(0);
  const [cargando, setCargando] = useState(true);

  const imagen = imagenes360[imagenActual];
  const total = imagenes360.length;

  // Cerrar con Escape
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  // Bloquear scroll del body
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const irA = useCallback((index) => {
    setCargando(true);
    setImagenActual(index);
  }, []);

  const anterior = () => irA((imagenActual - 1 + total) % total);
  const siguiente = () => irA((imagenActual + 1) % total);

  if (!imagen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex flex-col bg-[#0a0a0f]">

      {/* Botón Regresar — fixed para sobrevivir el stacking context del visor 360 */}
      <button
        onClick={onClose}
        style={{ position: 'fixed', top: 16, left: 16, zIndex: 99999 }}
        className="flex items-center gap-2 rounded-xl border border-white/20 bg-black/80 px-4 py-3 text-white shadow-2xl backdrop-blur-md transition-all hover:bg-white/20 active:scale-95"
        aria-label="Regresar"
      >
        <svg className="h-5 w-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        <span className="text-sm font-bold">Regresar</span>
      </button>

      {/* ── HEADER ── (título + contador) */}
      <div className="relative z-10 flex items-center justify-end gap-3 border-b border-white/10 bg-black/70 px-3 py-2 backdrop-blur-md sm:px-6 sm:py-3">
        <div className="mr-auto pl-32 min-w-0">
          <p className="truncate text-sm font-bold text-white">Tour Virtual 360°</p>
          <p className="truncate text-xs text-blue-300/80">{nombreHabitacion}</p>
        </div>
        {total > 1 && (
          <span className="flex-shrink-0 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold text-white/70">
            {imagenActual + 1} / {total}
          </span>
        )}
      </div>

      {/* ── VISOR 360° ── */}
      <div className="relative flex-1 overflow-hidden">
        {/* Overlay de carga */}
        {cargando && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#0a0a0f]">
            <div className="relative mb-5">
              <div className="h-16 w-16 animate-spin rounded-full border-[3px] border-indigo-500/30 border-t-indigo-400" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-8 w-8 animate-pulse rounded-full bg-indigo-500/20" />
              </div>
            </div>
            <p className="text-sm font-medium text-white/50">Cargando panorámica…</p>
          </div>
        )}

        <ReactPhotoSphereViewer
          key={imagen.ruta}
          src={buildSrc(imagen.ruta)}
          height="100%"
          width="100%"
          navbar={['zoom', 'fullscreen']}
          defaultZoomLvl={50}
          mousewheel
          touchmoveTwoFingers={false}
          autorotateDelay={2500}
          autorotateSpeed="1.5rpm"
          onReady={() => setCargando(false)}
          container=""
        />

        {/* Hint flotante "arrastra" */}
        {!cargando && (
          <div className="pointer-events-none absolute bottom-4 left-1/2 z-10 -translate-x-1/2 animate-fade-up">
            <div className="flex items-center gap-2 rounded-full border border-white/15 bg-black/50 px-4 py-2 backdrop-blur-sm">
              <svg className="h-4 w-4 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                  d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5" />
              </svg>
              <span className="text-xs font-medium text-white/60">Arrastra para explorar · Scroll para zoom</span>
            </div>
          </div>
        )}

        {/* Flechas de navegación (solo si hay más de 1 imagen) */}
        {total > 1 && (
          <>
            <button
              onClick={anterior}
              className="absolute left-3 top-1/2 z-10 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-black/50 text-white backdrop-blur-sm transition-all hover:border-indigo-400/50 hover:bg-indigo-600/30 sm:h-12 sm:w-12"
              aria-label="Vista anterior"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={siguiente}
              className="absolute right-3 top-1/2 z-10 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-black/50 text-white backdrop-blur-sm transition-all hover:border-indigo-400/50 hover:bg-indigo-600/30 sm:h-12 sm:w-12"
              aria-label="Vista siguiente"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}
      </div>

      {/* ── THUMBNAILS ── */}
      {total > 1 && (
        <div className="relative z-10 border-t border-white/10 bg-black/70 backdrop-blur-md">
          <div className="flex items-center gap-2 overflow-x-auto px-4 py-3 sm:justify-center sm:px-6">
            {imagenes360.map((img, idx) => (
              <button
                key={idx}
                onClick={() => irA(idx)}
                className={`relative h-14 w-20 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all duration-200 sm:h-16 sm:w-24 ${
                  idx === imagenActual
                    ? 'scale-105 border-indigo-400 shadow-lg shadow-indigo-500/30'
                    : 'border-white/15 opacity-60 hover:border-white/40 hover:opacity-100'
                }`}
              >
                <img
                  src={buildSrc(img.ruta)}
                  alt={img.titulo || `Vista ${idx + 1}`}
                  className="h-full w-full object-cover"
                />
                {idx === imagenActual && (
                  <div className="absolute inset-0 flex items-center justify-center bg-indigo-600/20">
                    <div className="h-2.5 w-2.5 rounded-full bg-indigo-400 shadow-md" />
                  </div>
                )}
                {img.titulo && (
                  <div className="absolute inset-x-0 bottom-0 bg-black/60 px-1 py-0.5 text-center text-[9px] font-medium text-white/80 line-clamp-1">
                    {img.titulo}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TourVirtual360;
