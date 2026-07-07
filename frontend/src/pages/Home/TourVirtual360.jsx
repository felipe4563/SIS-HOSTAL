import { useState, useEffect, useCallback, useRef } from 'react';
import Visor360 from '../../components/Visor360';

const API_BASE = import.meta.env.VITE_BASE_URL || 'http://localhost:4000';
const toUrl = (r) => (!r ? '' : r.startsWith('http') ? r : `${API_BASE}/api/uploads/${r}`);

/* ── Iconos ──────────────────────────────────────────────────── */
const IcoBack = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2}
    strokeLinecap="round" strokeLinejoin="round" style={{ width: '100%', height: '100%' }}>
    <path d="M19 12H5M12 5l-7 7 7 7" />
  </svg>
);
const IcoPrev = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}
    strokeLinecap="round" strokeLinejoin="round" style={{ width: '100%', height: '100%' }}>
    <path d="M15 18l-6-6 6-6" />
  </svg>
);
const IcoNext = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}
    strokeLinecap="round" strokeLinejoin="round" style={{ width: '100%', height: '100%' }}>
    <path d="M9 18l6-6-6-6" />
  </svg>
);

/* ── Estilos globales del componente ────────────────────────── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500&family=Inter:wght@300;400;500&display=swap');

  .t360 {
    font-family: 'Inter', sans-serif;
    --gold:        #c9a84c;
    --gold-glow:   rgba(201,168,76,.3);
    --gold-border: rgba(201,168,76,.22);
    --dark:        #0b0b0f;
    --glass:       rgba(11,11,15,.84);
    --surface:     rgba(255,255,255,.04);
    --text:        rgba(255,255,255,.88);
    --text-dim:    rgba(255,255,255,.42);
  }

  /* Spinner */
  @keyframes t360spin { to { transform: rotate(360deg); } }
  .t360-spin-a { animation: t360spin 1.1s linear infinite; }
  .t360-spin-b { animation: t360spin .72s linear infinite reverse; }

  /* Hint */
  @keyframes t360hint-in {
    from { opacity: 0; transform: translateX(-50%) translateY(6px); }
    to   { opacity: 1; transform: translateX(-50%) translateY(0);   }
  }
  .t360-hint-show { animation: t360hint-in .38s ease forwards; }
  .t360-hint-hide { opacity: 0; transition: opacity .4s ease; pointer-events: none; }

  /* Botones */
  .t360-btn-back {
    display: flex; align-items: center; gap: 6px;
    padding: 6px 10px; border-radius: 8px; cursor: pointer;
    border: 1px solid var(--gold-border);
    background: var(--surface);
    color: rgba(201,168,76,.9);
    transition: background .18s, border-color .18s;
    flex-shrink: 0;
  }
  .t360-btn-back:hover {
    background: rgba(201,168,76,.1);
    border-color: rgba(201,168,76,.45);
  }
  .t360-btn-back:active { transform: scale(.95); }
  .t360-back-text { display: none; font-size: 13px; font-weight: 500; }

  .t360-nav {
    display: none;   /* hidden on mobile */
    position: absolute; top: 50%; transform: translateY(-50%);
    z-index: 15; width: 44px; height: 44px; border-radius: 50%;
    border: 1px solid var(--gold-border); background: var(--glass);
    backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
    color: rgba(201,168,76,.8); cursor: pointer;
    align-items: center; justify-content: center;
    transition: background .18s, border-color .18s, transform .15s;
  }
  .t360-nav:hover {
    background: rgba(201,168,76,.14);
    border-color: rgba(201,168,76,.5);
    transform: translateY(-50%) scale(1.07);
  }
  .t360-nav:active { transform: translateY(-50%) scale(.94); }

  .t360-thumb {
    flex-shrink: 0; overflow: hidden; border-radius: 6px; cursor: pointer;
    width: 66px; height: 46px; position: relative;
    transition: opacity .2s, transform .18s, border-color .2s, box-shadow .2s;
  }
  .t360-thumb:hover  { transform: scale(1.05); opacity: .9 !important; }
  .t360-thumb:active { transform: scale(.96); }

  /* Responsive ≥ 600 px */
  @media (min-width: 600px) {
    .t360-back-text { display: inline; }
    .t360-nav       { display: flex !important; }
    .t360-thumb     { width: 86px !important; height: 60px !important; }
    .t360-header    { padding: 12px 20px !important; }
    .t360-strip-row { padding: 10px 20px !important; }
  }

  /* Ocultar scrollbar */
  .t360-strip-scroll { scrollbar-width: none; }
  .t360-strip-scroll::-webkit-scrollbar { display: none; }

  /* Reducir motion */
  @media (prefers-reduced-motion: reduce) {
    .t360-spin-a, .t360-spin-b { animation: none; }
    .t360-hint-show, .t360-hint-hide { animation: none; transition: none; }
  }
`;

/* ── Componente principal ────────────────────────────────────── */
const TourVirtual360 = ({
  imagenes360 = [],
  nombreHabitacion = 'Habitación',
  onClose,
}) => {
  const [current,     setCurrent]     = useState(0);
  const [loading,     setLoading]     = useState(true);
  const [hintVisible, setHintVisible] = useState(false);
  const hintTimer = useRef(null);
  const thumbRef  = useRef(null);

  const imagen = imagenes360[current];
  const total  = imagenes360.length;

  /* Tecla Escape */
  useEffect(() => {
    const fn = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', fn);
    return () => document.removeEventListener('keydown', fn);
  }, [onClose]);

  /* Bloquear scroll del body */
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  /* Mostrar hint cuando carga */
  useEffect(() => {
    if (!loading) {
      setHintVisible(true);
      hintTimer.current = setTimeout(() => setHintVisible(false), 3000);
    }
    return () => clearTimeout(hintTimer.current);
  }, [loading, current]);

  /* Centrar miniatura activa en el strip */
  useEffect(() => {
    if (!thumbRef.current) return;
    const active = thumbRef.current.querySelector('[data-active="true"]');
    active?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }, [current]);

  const goTo = useCallback((idx) => {
    setLoading(true);
    setHintVisible(false);
    setCurrent(idx);
  }, []);

  const prev = useCallback(() => goTo((current - 1 + total) % total), [current, total, goTo]);
  const next = useCallback(() => goTo((current + 1) % total), [current, total, goTo]);

  if (!imagen) return null;

  return (
    <>
      <style>{CSS}</style>

      <div
        className="t360"
        style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          display: 'flex', flexDirection: 'column',
          background: 'var(--dark)',
        }}
      >
        {/* ══ HEADER ══════════════════════════════════════════ */}
        <header
          className="t360-header"
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '9px 12px', flexShrink: 0,
            background: 'var(--glass)',
            borderBottom: '1px solid var(--gold-border)',
            backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
          }}
        >
          <button className="t360-btn-back" onClick={onClose} aria-label="Regresar">
            <span style={{ width: 16, height: 16, display: 'flex', flexShrink: 0 }}>
              <IcoBack />
            </span>
            <span className="t360-back-text">Regresar</span>
          </button>

          <div style={{ flex: 1, textAlign: 'center', minWidth: 0 }}>
            <div style={{
              fontSize: 9, letterSpacing: '.22em', textTransform: 'uppercase',
              color: 'var(--gold)', marginBottom: 2, lineHeight: 1,
            }}>
              Tour Virtual 360°
            </div>
            <div style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 15, fontWeight: 400, color: 'var(--text)',
              lineHeight: 1.25, whiteSpace: 'nowrap',
              overflow: 'hidden', textOverflow: 'ellipsis',
            }}>
              {nombreHabitacion}
            </div>
          </div>

          {total > 1 ? (
            <span style={{
              fontSize: 11, fontWeight: 500, color: 'var(--text-dim)',
              border: '1px solid var(--gold-border)', background: 'var(--surface)',
              borderRadius: 6, padding: '4px 9px',
              flexShrink: 0, minWidth: 34, textAlign: 'center',
            }}>
              {current + 1}/{total}
            </span>
          ) : (
            /* placeholder para mantener header centrado */
            <div style={{ width: 44, flexShrink: 0 }} />
          )}
        </header>

        {/* ══ BARRA DE PROGRESO ═══════════════════════════════ */}
        {total > 1 && (
          <div style={{ height: 2, background: 'rgba(201,168,76,.1)', flexShrink: 0 }}>
            <div style={{
              height: '100%', background: 'var(--gold)',
              width: `${((current + 1) / total) * 100}%`,
              transition: 'width .35s ease',
            }} />
          </div>
        )}

        {/* ══ ÁREA DEL VISOR ══════════════════════════════════ */}
        <div style={{ position: 'relative', flex: 1, overflow: 'hidden', minHeight: 0 }}>

          {/* Visor Three.js */}
          <div style={{ position: 'absolute', inset: 0 }}>
            <Visor360
              key={imagen.ruta}
              src={toUrl(imagen.ruta)}
              onReady={() => setLoading(false)}
              onError={() => setLoading(false)}
            />
          </div>

          {/* Overlay de carga */}
          {loading && (
            <div style={{
              position: 'absolute', inset: 0, zIndex: 10,
              background: 'var(--dark)',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 16,
            }}>
              <div style={{ position: 'relative', width: 52, height: 52 }}>
                <div className="t360-spin-a" style={{
                  position: 'absolute', inset: 0, borderRadius: '50%',
                  border: '2px solid rgba(201,168,76,.1)',
                  borderTopColor: 'var(--gold)',
                }} />
                <div className="t360-spin-b" style={{
                  position: 'absolute', inset: 8, borderRadius: '50%',
                  border: '1.5px solid rgba(201,168,76,.07)',
                  borderBottomColor: 'rgba(232,201,122,.65)',
                }} />
              </div>
              <span style={{
                fontSize: 9, letterSpacing: '.22em', textTransform: 'uppercase',
                color: 'rgba(201,168,76,.5)',
              }}>
                Cargando panorámica
              </span>
            </div>
          )}

          {/* Flechas de navegación (solo desktop) */}
          {total > 1 && (
            <>
              <button
                className="t360-nav"
                style={{ left: 14 }}
                onClick={prev}
                aria-label="Vista anterior"
              >
                <span style={{ width: 18, height: 18, display: 'flex' }}><IcoPrev /></span>
              </button>
              <button
                className="t360-nav"
                style={{ right: 14 }}
                onClick={next}
                aria-label="Vista siguiente"
              >
                <span style={{ width: 18, height: 18, display: 'flex' }}><IcoNext /></span>
              </button>
            </>
          )}

          {/* Hint "arrastra" */}
          {!loading && (
            <div
              className={hintVisible ? 't360-hint-show' : 't360-hint-hide'}
              style={{
                position: 'absolute', bottom: 18, left: '50%',
                zIndex: 15, whiteSpace: 'nowrap',
              }}
            >
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '7px 14px', borderRadius: 20,
                background: 'rgba(11,11,15,.76)',
                border: '1px solid rgba(201,168,76,.16)',
                backdropFilter: 'blur(10px)',
              }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="rgba(201,168,76,.65)"
                  strokeWidth={1.5} style={{ width: 14, height: 14, flexShrink: 0 }}>
                  <circle cx="12" cy="12" r="1.5" />
                  <path d="M7 9l-4 3 4 3M17 9l4 3-4 3" />
                </svg>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,.48)' }}>
                  Arrastra para explorar · Pellizca para zoom
                </span>
              </div>
            </div>
          )}
        </div>

        {/* ══ STRIP DE MINIATURAS ═════════════════════════════ */}
        {total > 1 && (
          <div
            className="t360-strip-scroll"
            style={{
              background: 'var(--glass)',
              borderTop: '1px solid var(--gold-border)',
              backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
              flexShrink: 0, overflowX: 'auto',
            }}
          >
            {/* inner row: centra cuando caben, scrollea cuando no */}
            <div
              ref={thumbRef}
              className="t360-strip-row"
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '9px 12px',
                width: 'max-content', minWidth: '100%',
                boxSizing: 'border-box',
                justifyContent: 'center',
              }}
            >
              {imagenes360.map((img, i) => (
                <button
                  key={i}
                  data-active={i === current}
                  onClick={() => goTo(i)}
                  className="t360-thumb"
                  style={{
                    border: i === current
                      ? '2px solid var(--gold)'
                      : '2px solid rgba(255,255,255,.1)',
                    opacity: i === current ? 1 : 0.48,
                    boxShadow: i === current ? '0 0 12px var(--gold-glow)' : 'none',
                  }}
                  aria-label={img.titulo || `Vista ${i + 1}`}
                >
                  <img
                    src={toUrl(img.ruta)}
                    alt={img.titulo || `Vista ${i + 1}`}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    onError={(e) => { e.target.style.background = '#18182a'; }}
                  />
                  {img.titulo && (
                    <span style={{
                      position: 'absolute', inset: '0 0 auto 0', top: 'auto', bottom: 0,
                      padding: '4px 3px 2px',
                      background: 'linear-gradient(transparent, rgba(11,11,15,.9))',
                      fontSize: 8, textAlign: 'center',
                      color: i === current ? 'rgba(201,168,76,.9)' : 'rgba(255,255,255,.55)',
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                      display: 'block',
                    }}>
                      {img.titulo}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default TourVirtual360;
