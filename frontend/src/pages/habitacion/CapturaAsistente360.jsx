import { useState, useEffect, useRef, useCallback } from 'react';
import { capturaFotos360 } from '../../services/habitacion';

// 3 filas: media (12 × 30°), superior (8 × 45° hacia arriba), inferior (8 × 45° hacia abajo)
const TARGETS = [
  ...Array.from({ length: 12 }, (_, i) => ({ id: `M${i}`, alpha: i * 30, beta:   0 })),
  ...Array.from({ length:  8 }, (_, i) => ({ id: `U${i}`, alpha: i * 45, beta: -35 })),
  ...Array.from({ length:  8 }, (_, i) => ({ id: `L${i}`, alpha: i * 45, beta: +35 })),
];

const MIN_FOTOS    = 10;
const THRESHOLD    = 15;   // grados para activar captura
const CAPTURE_MS   = 900;  // ms estable para auto-capturar
const FOV_H        = 65;   // campo de visión horizontal estimado
const RETICLE_R    = 42;
const CIRCUMFERENCE = 2 * Math.PI * RETICLE_R;

const angleDiff = (a, b) => {
  let d = ((a - b) % 360 + 360) % 360;
  return d > 180 ? d - 360 : d;
};

const sphereDist = (a1, b1, a2, b2) =>
  Math.sqrt(angleDiff(a1, a2) ** 2 + (b1 - b2) ** 2);

const CapturaAsistente360 = ({ habitacion, onClose, onSuccess }) => {
  const videoRef        = useRef(null);
  const canvasRef       = useRef(null);
  const streamRef       = useRef(null);
  const captureStartRef = useRef(null);
  const optimisticRef   = useRef(new Set());
  const orientRef       = useRef({ alpha: 0, beta: 0 }); // siempre actualizado, sin re-render

  const [listo,           setListo]           = useState(false);
  const [camActiva,       setCamActiva]        = useState(false);
  const [sinGiroscopio,   setSinGiroscopio]    = useState(false);
  const [orient,          setOrient]           = useState({ alpha: 0, beta: 0 });
  const [capturados,      setCapturados]       = useState(new Set());
  // fotos: array de { blob, alpha, beta }
  const [fotos,           setFotos]            = useState([]);
  const [flash,           setFlash]            = useState(false);
  const [procesando,      setProcesando]       = useState(false);
  const [error,           setError]            = useState('');
  const [titulo,          setTitulo]           = useState('Vista 360°');
  const [captureProgress, setCaptureProgress]  = useState(0);
  const [nearTarget,      setNearTarget]       = useState(false);

  // ── Cámara ──────────────────────────────────────────────────────────────
  const iniciarCamara = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false,
      });
      streamRef.current = stream;
      setListo(true);
    } catch {
      setError('No se pudo acceder a la cámara. Verifica los permisos del navegador.');
    }
  };

  useEffect(() => {
    if (!listo || !streamRef.current) return;
    const video = videoRef.current;
    if (!video) return;
    video.srcObject = streamRef.current;
    video.play().then(() => setCamActiva(true)).catch(() => {});
    return () => streamRef.current?.getTracks().forEach(t => t.stop());
  }, [listo]);

  // ── Giroscopio ──────────────────────────────────────────────────────────
  useEffect(() => {
    let got = false;
    const handler = (e) => {
      // DeviceOrientation.beta en portrait: ~90° = horizontal, ~55° = apuntando 35° arriba
      // Convertimos a ángulo de elevación: 0=horizontal, negativo=arriba, positivo=abajo
      const elevation = (e.beta ?? 90) - 90;
      const o = { alpha: e.alpha ?? 0, beta: elevation };
      orientRef.current = o;
      if (!got) { got = true; setSinGiroscopio(false); }
      setOrient(o);
    };
    if (typeof DeviceOrientationEvent?.requestPermission === 'function') {
      DeviceOrientationEvent.requestPermission()
        .then(p => { if (p === 'granted') window.addEventListener('deviceorientation', handler); })
        .catch(() => setSinGiroscopio(true));
    } else {
      window.addEventListener('deviceorientation', handler);
      setTimeout(() => { if (!got) setSinGiroscopio(true); }, 2000);
    }
    return () => window.removeEventListener('deviceorientation', handler);
  }, []);

  // ── Captura ──────────────────────────────────────────────────────────────
  const capturarFoto = useCallback((targetId) => {
    const video  = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    // Usar la posición IDEAL del target (no el compass real, que es poco confiable en interiores)
    // El target define exactamente dónde debería estar esta foto en la esfera
    const target = TARGETS.find(t => t.id === targetId);
    const alpha = target ? target.alpha : orientRef.current.alpha;
    const beta  = target ? target.beta  : orientRef.current.beta;
    canvas.width  = video.videoWidth  || 1280;
    canvas.height = video.videoHeight || 720;
    canvas.getContext('2d').drawImage(video, 0, 0);
    canvas.toBlob((blob) => {
      if (!blob) return;
      setFotos(prev => [...prev, { blob, alpha, beta }]);
      if (targetId) setCapturados(prev => new Set([...prev, targetId]));
      setFlash(true);
      setTimeout(() => setFlash(false), 200);
    }, 'image/jpeg', 0.92);
  }, []);

  // ── Auto-captura cuando el retículo está sobre un punto ─────────────────
  useEffect(() => {
    if (!camActiva || procesando) return;
    const { alpha, beta } = orient;

    let closest = null;
    let minDist = Infinity;
    TARGETS.forEach(t => {
      if (capturados.has(t.id) || optimisticRef.current.has(t.id)) return;
      const d = sphereDist(alpha, beta, t.alpha, t.beta);
      if (d < minDist) { minDist = d; closest = t; }
    });

    const isNear = !!closest && minDist < THRESHOLD;
    setNearTarget(isNear);

    if (!isNear) {
      captureStartRef.current = null;
      setCaptureProgress(0);
      return;
    }

    if (!captureStartRef.current) captureStartRef.current = Date.now();
    const elapsed = Date.now() - captureStartRef.current;
    setCaptureProgress(Math.min(100, (elapsed / CAPTURE_MS) * 100));

    if (elapsed >= CAPTURE_MS) {
      captureStartRef.current = null;
      setCaptureProgress(0);
      optimisticRef.current.add(closest.id);
      capturarFoto(closest.id);
    }
  }, [orient, camActiva, procesando, capturados, capturarFoto]);

  // ── Proyección de puntos en pantalla ────────────────────────────────────
  const projectTarget = (target) => {
    const w    = window.innerWidth;
    const h    = window.innerHeight;
    const fovV = FOV_H * (h / w);
    const da   = angleDiff(target.alpha, orient.alpha);
    const db   = target.beta - orient.beta;
    return {
      x: w / 2 + (da / (FOV_H / 2)) * (w / 2),
      y: h / 2 + (db / (fovV / 2)) * (h / 2),
      visible: Math.abs(da) < FOV_H / 2 + 22 && Math.abs(db) < fovV / 2 + 22,
      dist: sphereDist(orient.alpha, orient.beta, target.alpha, target.beta),
    };
  };

  // ── Enviar al servidor ───────────────────────────────────────────────────
  const handleEnviar = async () => {
    if (fotos.length < MIN_FOTOS) {
      setError(`Necesitas al menos ${MIN_FOTOS} fotos. Tienes ${fotos.length}.`);
      return;
    }
    setProcesando(true);
    setError('');
    try {
      const blobs        = fotos.map(f => f.blob);
      const orientaciones = fotos.map(f => ({ alpha: f.alpha, beta: f.beta }));
      await capturaFotos360(habitacion.id_habitacion, blobs, titulo, orientaciones);
      onSuccess();
      onClose();
    } catch (e) {
      setError(e?.response?.data?.detalle || e?.response?.data?.message || 'Error al procesar las fotos');
    } finally {
      setProcesando(false);
    }
  };

  const captured = capturados.size;
  const total    = TARGETS.length;
  const progreso = Math.round((captured / total) * 100);

  // ── Pantalla previa ──────────────────────────────────────────────────────
  if (!listo) {
    return (
      <div className="fixed inset-0 z-[300] flex flex-col items-center justify-center bg-gray-900 px-6 text-center">
        <div className="text-6xl mb-5">📷</div>
        <h2 className="text-white text-2xl font-bold mb-1">Captura 360°</h2>
        <p className="text-gray-400 text-sm">Hab. {habitacion.numero} — {habitacion.tipo_habitacion}</p>

        <div className="bg-white/5 rounded-2xl p-5 my-6 text-left space-y-3 w-full max-w-sm">
          <p className="text-white font-semibold text-sm mb-1">Cómo hacerlo:</p>
          {[
            ['🏠', 'Párate en el', 'centro', 'de la habitación'],
            ['🎯', 'Apunta la cámara a cada', 'círculo blanco', 'que aparezca'],
            ['✅', 'Cuando el anillo se llena de', 'verde', ', se captura solo'],
            ['🔄', 'Cubre todas las direcciones:', 'alrededor, arriba y abajo', ''],
          ].map(([icon, pre, bold, post], i) => (
            <div key={i} className="flex items-start gap-3 text-gray-300 text-sm">
              <span className="text-xl shrink-0">{icon}</span>
              <span>{pre} <strong className="text-white">{bold}</strong>{post ? ` ${post}` : ''}</span>
            </div>
          ))}
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-400/40 rounded-xl px-4 py-3 text-red-300 text-sm mb-4 w-full max-w-sm">
            {error}
          </div>
        )}

        <button
          onClick={iniciarCamara}
          className="w-full max-w-sm bg-green-500 hover:bg-green-600 active:bg-green-700 text-white font-bold py-4 rounded-2xl text-lg transition-colors"
        >
          Activar cámara
        </button>
        <button onClick={onClose} className="mt-3 text-gray-500 text-sm py-2 w-full max-w-sm">
          Cancelar
        </button>
      </div>
    );
  }

  // ── Vista de captura ─────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-[300] bg-black overflow-hidden">
      {flash && <div className="absolute inset-0 z-50 bg-white opacity-60 pointer-events-none" />}

      <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover" playsInline muted />
      <canvas ref={canvasRef} className="hidden" />

      {/* Puntos proyectados sobre la cámara */}
      {!sinGiroscopio && TARGETS.map(t => {
        const { x, y, visible, dist } = projectTarget(t);
        if (!visible) return null;
        const done      = capturados.has(t.id) || optimisticRef.current.has(t.id);
        const isClosest = nearTarget && dist < THRESHOLD;
        return (
          <div
            key={t.id}
            className="absolute pointer-events-none"
            style={{ left: x, top: y, transform: 'translate(-50%,-50%)' }}
          >
            <div className={`
              rounded-full border-2 transition-all duration-200
              ${done
                ? 'w-4 h-4 bg-green-400 border-green-300 opacity-90'
                : isClosest
                  ? 'w-7 h-7 bg-white/25 border-white shadow-lg shadow-white/20'
                  : 'w-5 h-5 bg-transparent border-white/50'
              }
            `} />
          </div>
        );
      })}

      {/* Retículo central con anillo de progreso */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <svg width={RETICLE_R * 2 + 20} height={RETICLE_R * 2 + 20}>
          <circle
            cx={RETICLE_R + 10} cy={RETICLE_R + 10} r={RETICLE_R}
            fill="none"
            stroke={nearTarget ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.2)'}
            strokeWidth={nearTarget ? 2.5 : 1.5}
            strokeDasharray={nearTarget ? undefined : '5 4'}
          />
          {nearTarget && (
            <circle
              cx={RETICLE_R + 10} cy={RETICLE_R + 10} r={RETICLE_R}
              fill="none"
              stroke="#22c55e"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={CIRCUMFERENCE * (1 - captureProgress / 100)}
              transform={`rotate(-90 ${RETICLE_R + 10} ${RETICLE_R + 10})`}
            />
          )}
          <circle cx={RETICLE_R + 10} cy={RETICLE_R + 10} r={3}
            fill={nearTarget ? '#22c55e' : 'rgba(255,255,255,0.7)'} />
          <line x1={RETICLE_R+10} y1={RETICLE_R+2}  x2={RETICLE_R+10} y2={RETICLE_R-4}
            stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeLinecap="round" />
          <line x1={RETICLE_R+10} y1={RETICLE_R+18} x2={RETICLE_R+10} y2={RETICLE_R+24}
            stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeLinecap="round" />
          <line x1={RETICLE_R+2}  y1={RETICLE_R+10} x2={RETICLE_R-4}  y2={RETICLE_R+10}
            stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeLinecap="round" />
          <line x1={RETICLE_R+18} y1={RETICLE_R+10} x2={RETICLE_R+24} y2={RETICLE_R+10}
            stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-4 py-3 bg-gradient-to-b from-black/70 to-transparent">
        <button onClick={onClose} className="flex items-center gap-2 text-white text-sm font-medium">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
          Cancelar
        </button>
        <div className="bg-black/50 rounded-full px-3 py-1 flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-green-400" />
          <span className="text-white text-sm font-semibold">{captured}/{total} puntos</span>
        </div>
      </div>

      {/* Barra de progreso */}
      <div className="absolute top-[52px] left-0 right-0 z-10 h-1 bg-white/20">
        <div className="h-full bg-green-400 transition-all duration-300" style={{ width: `${progreso}%` }} />
      </div>

      {/* Sin giroscopio */}
      {sinGiroscopio && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none">
          <div className="bg-amber-500/85 rounded-xl px-4 py-2 text-center">
            <p className="text-white text-sm font-medium">Sin giroscopio</p>
            <p className="text-white/80 text-xs mt-0.5">Usa el botón para capturar</p>
          </div>
        </div>
      )}

      {/* Hint cuando está cerca */}
      {nearTarget && !sinGiroscopio && (
        <div className="absolute top-24 left-0 right-0 z-10 flex justify-center pointer-events-none">
          <div className="bg-green-500/80 rounded-full px-4 py-1.5">
            <p className="text-white text-xs font-medium">¡Mantén estable!</p>
          </div>
        </div>
      )}

      {/* Controles inferiores */}
      <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black/85 to-transparent px-4 pb-8 pt-16 space-y-3">
        {error && (
          <div className="bg-red-500/20 border border-red-400/50 rounded-xl px-3 py-2 text-red-200 text-sm text-center">
            {error}
          </div>
        )}

        <input
          type="text"
          value={titulo}
          onChange={e => setTitulo(e.target.value)}
          placeholder="Nombre de esta vista (ej: Sala principal)"
          className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-white text-sm placeholder-white/40 focus:outline-none focus:border-white/50"
        />

        <div className="flex gap-3">
          {/* Captura manual */}
          <button
            onClick={() => capturarFoto(null)}
            disabled={!camActiva || procesando}
            className="flex items-center justify-center gap-2 bg-white/15 hover:bg-white/25 disabled:opacity-40 border border-white/20 text-white rounded-xl py-3 px-4 text-sm font-medium transition-colors"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5 shrink-0">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
              <circle cx="12" cy="13" r="3"/>
            </svg>
            <span>{fotos.length}</span>
          </button>

          {/* Crear 360 */}
          <button
            onClick={handleEnviar}
            disabled={fotos.length < MIN_FOTOS || procesando}
            className="flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 disabled:bg-green-900/50 disabled:text-white/40 text-white rounded-xl py-3 text-sm font-bold transition-colors"
          >
            {procesando ? (
              <>
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Procesando…
              </>
            ) : fotos.length < MIN_FOTOS ? (
              `Faltan ${MIN_FOTOS - fotos.length} fotos`
            ) : (
              <>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
                </svg>
                Crear 360°
              </>
            )}
          </button>
        </div>

        <p className="text-center text-white/30 text-xs">
          Apunta a cada círculo · {total} puntos · arriba, medio y abajo
        </p>
      </div>
    </div>
  );
};

export default CapturaAsistente360;
