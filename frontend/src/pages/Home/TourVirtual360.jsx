import { useState, useEffect, useCallback, useRef } from 'react';
import { ReactPhotoSphereViewer } from 'react-photo-sphere-viewer';

const API_BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:4000';

const buildSrc = (ruta) => {
  if (!ruta) return '';
  if (ruta.startsWith('http://') || ruta.startsWith('https://')) return ruta;
  return `${API_BASE_URL}/api/uploads/${ruta}`;
};

/* ── Íconos inline ──────────────────────────────────────── */
const IcoArrowLeft  = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
    <path d="M15 18l-6-6 6-6" />
  </svg>
);
const IcoArrowRight = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
    <path d="M9 18l6-6-6-6" />
  </svg>
);
const IcoBack = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
    <path d="M19 12H5M12 5l-7 7 7 7" />
  </svg>
);
const IcoDrag = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
    <circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>
    <path d="M7 8l-4 4 4 4M17 8l4 4-4 4" />
  </svg>
);

/* ── Componente principal ───────────────────────────────── */
const TourVirtual360 = ({ imagenes360 = [], nombreHabitacion = 'Habitación', onClose }) => {
  const [imagenActual, setImagenActual]   = useState(0);
  const [cargando,     setCargando]       = useState(true);
  const [hintVisible,  setHintVisible]    = useState(false);
  const [thumbOpen,    setThumbOpen]      = useState(false);
  const hintTimerRef = useRef(null);

  const imagen = imagenes360[imagenActual];
  const total  = imagenes360.length;

  /* ── Tecla Escape ───────────────────────────────────── */
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  /* ── Bloquear scroll ────────────────────────────────── */
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  /* ── Hint "arrastra" ────────────────────────────────── */
  useEffect(() => {
    if (!cargando) {
      setHintVisible(true);
      hintTimerRef.current = setTimeout(() => setHintVisible(false), 3200);
    }
    return () => clearTimeout(hintTimerRef.current);
  }, [cargando, imagenActual]);

  /* ── Navegación ─────────────────────────────────────── */
  const irA = useCallback((idx) => {
    setCargando(true);
    setHintVisible(false);
    setImagenActual(idx);
    setThumbOpen(false);
  }, []);

  const anterior = useCallback(() => irA((imagenActual - 1 + total) % total), [imagenActual, total, irA]);
  const siguiente = useCallback(() => irA((imagenActual + 1) % total), [imagenActual, total, irA]);

  /* ── Swipe táctil ───────────────────────────────────── */
  const touchStartX = useRef(null);
  const onTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
  const onTouchEnd   = (e) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 60) { dx < 0 ? siguiente() : anterior(); }
    touchStartX.current = null;
  };

  if (!imagen) return null;

  /* ── Render ─────────────────────────────────────────── */
  return (
    <>
      {/* ── Fuentes ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;600&family=DM+Sans:wght@300;400;500&display=swap');

        .tour360-root {
          font-family: 'DM Sans', sans-serif;
          --gold: #c9a84c;
          --gold-light: #e8c97a;
          --gold-dim: rgba(201,168,76,.18);
          --dark: #08080d;
          --glass: rgba(8,8,13,.72);
          --border: rgba(201,168,76,.22);
        }

        .tour360-root .psv-container { background: #08080d !important; }
        .tour360-root .psv-navbar    { display: none !important; }

        /* Hint fade */
        @keyframes t360FadeUp {
          from { opacity:0; transform: translateX(-50%) translateY(10px); }
          to   { opacity:1; transform: translateX(-50%) translateY(0); }
        }
        .hint-enter  { animation: t360FadeUp .45s ease forwards; }
        .hint-exit   { opacity:0; transition: opacity .5s ease; }

        /* Spinner ring */
        @keyframes t360Spin { to { transform: rotate(360deg); } }
        .t360-spin { animation: t360Spin 1.1s linear infinite; }

        /* Thumb strip slide */
        @keyframes t360SlideUp {
          from { transform: translateY(100%); }
          to   { transform: translateY(0); }
        }
        .thumb-open  { animation: t360SlideUp .3s ease forwards; }
        .thumb-close { transform: translateY(100%); }

        /* Flecha pulse */
        @keyframes t360Pulse { 0%,100%{opacity:.7} 50%{opacity:1} }
        .t360-arrow-pulse { animation: t360Pulse 2.5s ease-in-out infinite; }

        /* Active scale */
        .t360-btn:active { transform: scale(.93); }

        /* Dot active */
        .t360-dot-active {
          background: var(--gold) !important;
          width: 18px !important;
          border-radius: 4px !important;
        }
      `}</style>

      <div
        className="tour360-root fixed inset-0 flex flex-col"
        style={{ zIndex: 9999, background: 'var(--dark)' }}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >

        {/* ════════════════════════════════════════════════
            HEADER
        ════════════════════════════════════════════════ */}
        <header
          style={{
            background: 'var(--glass)',
            borderBottom: '1px solid var(--border)',
            backdropFilter: 'blur(18px)',
            WebkitBackdropFilter: 'blur(18px)',
            flexShrink: 0,
          }}
          className="relative z-50 flex items-center gap-3 px-3 py-2.5 sm:px-5 sm:py-3"
        >
          {/* Botón regresar */}
          <button
            onClick={onClose}
            className="t360-btn flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors"
            style={{
              border: '1px solid var(--border)',
              color: 'var(--gold-light)',
              background: 'rgba(201,168,76,.08)',
              flexShrink: 0,
              minWidth: 40,
            }}
            aria-label="Regresar"
          >
            <span style={{ width: 16, height: 16, display:'inline-flex', flexShrink:0 }}>
              <IcoBack />
            </span>
            <span className="hidden sm:inline">Regresar</span>
          </button>

          {/* Título */}
          <div className="flex-1 min-w-0 text-center">
            <p
              className="text-xs tracking-[.18em] uppercase truncate"
              style={{ color: 'var(--gold)', fontFamily: "'DM Sans', sans-serif", letterSpacing: '.18em' }}
            >
              Tour Virtual 360°
            </p>
            <p
              className="truncate text-sm sm:text-base font-light mt-0.5"
              style={{ fontFamily: "'Cormorant Garamond', serif", color: 'rgba(255,255,255,.85)', lineHeight: 1.2 }}
            >
              {nombreHabitacion}
            </p>
          </div>

          {/* Contador + botón miniaturas */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {total > 1 && (
              <span
                className="text-xs font-medium rounded-md px-2.5 py-1"
                style={{
                  border: '1px solid var(--border)',
                  color: 'rgba(255,255,255,.55)',
                  background: 'rgba(255,255,255,.05)',
                  minWidth: 44,
                  textAlign: 'center',
                }}
              >
                {imagenActual + 1} / {total}
              </span>
            )}
            {total > 1 && (
              <button
                onClick={() => setThumbOpen(v => !v)}
                className="t360-btn rounded-lg p-2 sm:hidden transition-colors"
                style={{
                  border: '1px solid var(--border)',
                  color: thumbOpen ? 'var(--gold)' : 'rgba(255,255,255,.5)',
                  background: thumbOpen ? 'var(--gold-dim)' : 'rgba(255,255,255,.05)',
                }}
                aria-label="Ver miniaturas"
              >
                <svg viewBox="0 0 20 20" fill="currentColor" style={{ width:16, height:16 }}>
                  <rect x="2" y="2" width="6" height="6" rx="1"/>
                  <rect x="12" y="2" width="6" height="6" rx="1"/>
                  <rect x="2" y="12" width="6" height="6" rx="1"/>
                  <rect x="12" y="12" width="6" height="6" rx="1"/>
                </svg>
              </button>
            )}
          </div>
        </header>

        {/* ════════════════════════════════════════════════
            VISOR
        ════════════════════════════════════════════════ */}
        <div className="relative flex-1 overflow-hidden" style={{ minHeight: 0 }}>

          {/* Overlay carga */}
          {cargando && (
            <div
              className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-4"
              style={{ background: 'var(--dark)' }}
            >
              {/* Anillo doble */}
              <div className="relative w-14 h-14 sm:w-16 sm:h-16">
                <div
                  className="t360-spin absolute inset-0 rounded-full"
                  style={{ border: '2px solid rgba(201,168,76,.15)', borderTopColor: 'var(--gold)' }}
                />
                <div
                  className="t360-spin absolute inset-[6px] rounded-full"
                  style={{
                    border: '1.5px solid rgba(201,168,76,.08)',
                    borderBottomColor: 'var(--gold-light)',
                    animationDirection: 'reverse',
                    animationDuration: '.7s',
                  }}
                />
              </div>
              <p
                className="text-xs tracking-widest uppercase"
                style={{ color: 'rgba(201,168,76,.6)', letterSpacing: '.2em' }}
              >
                Cargando panorámica
              </p>
            </div>
          )}

          {/* Visor 360 */}
          <ReactPhotoSphereViewer
            key={imagen.ruta}
            src={buildSrc(imagen.ruta)}
            height="100%"
            width="100%"
            navbar={false}
            defaultZoomLvl={50}
            mousewheel
            touchmoveTwoFingers={false}
            autorotateDelay={2800}
            autorotateSpeed="1rpm"
            onReady={() => setCargando(false)}
            container=""
          />

          {/* ── Hint "arrastra" ── */}
          {!cargando && (
            <div
              className={`pointer-events-none absolute bottom-5 left-1/2 z-20 ${hintVisible ? 'hint-enter' : 'hint-exit'}`}
              style={{ transform: 'translateX(-50%)', whiteSpace: 'nowrap' }}
            >
              <div
                className="flex items-center gap-2 rounded-full px-4 py-2"
                style={{
                  background: 'rgba(8,8,13,.7)',
                  border: '1px solid rgba(201,168,76,.2)',
                  backdropFilter: 'blur(10px)',
                }}
              >
                <span style={{ width:16, height:16, color:'rgba(201,168,76,.7)', display:'inline-flex' }}>
                  <IcoDrag />
                </span>
                <span className="text-xs" style={{ color: 'rgba(255,255,255,.55)' }}>
                  Arrastra · Pellizca para zoom
                </span>
              </div>
            </div>
          )}

          {/* ── Flechas laterales (≥ md) ── */}
          {total > 1 && (
            <>
              <button
                onClick={anterior}
                className="t360-btn t360-arrow-pulse hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 items-center justify-center rounded-full transition-all"
                style={{
                  border: '1px solid var(--border)',
                  background: 'var(--glass)',
                  color: 'var(--gold-light)',
                  backdropFilter: 'blur(12px)',
                }}
                aria-label="Vista anterior"
              >
                <span style={{ width:18, height:18 }}><IcoArrowLeft /></span>
              </button>
              <button
                onClick={siguiente}
                className="t360-btn t360-arrow-pulse hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 items-center justify-center rounded-full transition-all"
                style={{
                  border: '1px solid var(--border)',
                  background: 'var(--glass)',
                  color: 'var(--gold-light)',
                  backdropFilter: 'blur(12px)',
                }}
                aria-label="Vista siguiente"
              >
                <span style={{ width:18, height:18 }}><IcoArrowRight /></span>
              </button>
            </>
          )}

          {/* ── Dots móvil (< md, sin thumbnails) ── */}
          {total > 1 && (
            <div className="md:hidden absolute bottom-16 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 pointer-events-none">
              {imagenes360.map((_, idx) => (
                <div
                  key={idx}
                  className="rounded-full transition-all duration-300"
                  style={{
                    width: idx === imagenActual ? 18 : 6,
                    height: 6,
                    background: idx === imagenActual ? 'var(--gold)' : 'rgba(255,255,255,.25)',
                    borderRadius: idx === imagenActual ? 4 : 999,
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* ════════════════════════════════════════════════
            THUMBNAILS — desktop siempre, móvil toggle
        ════════════════════════════════════════════════ */}
        {total > 1 && (
          <>
            {/* Desktop strip */}
            <div
              className="hidden sm:block flex-shrink-0"
              style={{
                background: 'var(--glass)',
                borderTop: '1px solid var(--border)',
                backdropFilter: 'blur(18px)',
              }}
            >
              <div className="flex items-center gap-2.5 overflow-x-auto px-4 py-3 sm:justify-center sm:px-6 scrollbar-thin">
                {imagenes360.map((img, idx) => (
                  <ThumbButton
                    key={idx}
                    img={img}
                    idx={idx}
                    activo={idx === imagenActual}
                    onClick={() => irA(idx)}
                  />
                ))}
              </div>
            </div>

            {/* Móvil: panel deslizable */}
            <div
              className={`sm:hidden absolute inset-x-0 bottom-0 z-40 ${thumbOpen ? 'thumb-open' : 'thumb-close'}`}
              style={{
                background: 'var(--glass)',
                borderTop: '1px solid var(--border)',
                backdropFilter: 'blur(18px)',
                paddingBottom: 'env(safe-area-inset-bottom)',
              }}
            >
              {/* Handle */}
              <div className="flex justify-center py-2">
                <div style={{ width: 36, height: 4, borderRadius: 2, background: 'rgba(255,255,255,.2)' }} />
              </div>
              <div className="flex items-center gap-2.5 overflow-x-auto px-4 pb-4">
                {imagenes360.map((img, idx) => (
                  <ThumbButton
                    key={idx}
                    img={img}
                    idx={idx}
                    activo={idx === imagenActual}
                    onClick={() => irA(idx)}
                  />
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};

/* ── Sub-componente ThumbButton ─────────────────────────── */
const ThumbButton = ({ img, idx, activo, onClick }) => (
  <button
    onClick={onClick}
    className="t360-btn relative flex-shrink-0 overflow-hidden rounded-lg transition-all duration-200"
    style={{
      width: 80, height: 56,
      border: activo ? '2px solid var(--gold)' : '2px solid rgba(255,255,255,.12)',
      boxShadow: activo ? '0 0 14px rgba(201,168,76,.35)' : 'none',
      opacity: activo ? 1 : .55,
      transform: activo ? 'scale(1.05)' : 'scale(1)',
    }}
    aria-label={img.titulo || `Vista ${idx + 1}`}
  >
    <img
      src={buildSrc(img.ruta)}
      alt={img.titulo || `Vista ${idx + 1}`}
      className="w-full h-full object-cover"
      onError={(e) => { e.target.style.background = '#1a1a2e'; }}
    />

    {/* Overlay dorado activo */}
    {activo && (
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{ background: 'rgba(201,168,76,.12)' }}
      >
        <div style={{ width:8, height:8, borderRadius:'50%', background:'var(--gold)', boxShadow:'0 0 6px var(--gold)' }} />
      </div>
    )}

    {/* Label */}
    {img.titulo && (
      <div
        className="absolute inset-x-0 bottom-0 px-1 py-0.5 text-center truncate"
        style={{
          background: 'linear-gradient(transparent, rgba(8,8,13,.85))',
          fontSize: 9,
          color: activo ? 'var(--gold-light)' : 'rgba(255,255,255,.7)',
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        {img.titulo}
      </div>
    )}
  </button>
);

export default TourVirtual360;
