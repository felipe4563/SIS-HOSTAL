import { useState, useEffect, useRef, useCallback } from 'react';
import { capturaFotos360 } from '../../services/habitacion';

const CAPTURE_DIST = 22;   // grados mínimos desde cualquier foto anterior para auto-disparar
const HOLD_MS      = 500;  // ms quieto antes de capturar
const MIN_FOTOS    = 12;
const TARGET_FOTOS = 28;

const angleDiff = (a, b) => {
  let d = ((a - b) % 360 + 360) % 360;
  return d > 180 ? d - 360 : d;
};

const sphereDist = (a1, b1, a2, b2) =>
  Math.sqrt(angleDiff(a1, a2) ** 2 + (b1 - b2) ** 2);

// Mini mapa de cobertura esférica
const CoverageMinimap = ({ fotos }) => {
  const COLS = 36, ROWS = 18, CELL = 4;
  return (
    <div style={{
      background: 'rgba(0,0,0,0.65)',
      borderRadius: 8,
      padding: 5,
      border: '1px solid rgba(255,255,255,0.15)',
    }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${COLS}, ${CELL}px)`,
        gap: 1,
      }}>
        {Array.from({ length: ROWS }, (_, row) =>
          Array.from({ length: COLS }, (_, col) => {
            const alpha = (col / COLS) * 360;
            const beta  = ((row / ROWS) - 0.5) * 160;
            const covered = fotos.some(f => sphereDist(f.alpha, f.beta, alpha, beta) < 25);
            return (
              <div key={`${row}-${col}`} style={{
                width: CELL, height: CELL, borderRadius: 1,
                background: covered ? '#22c55e' : 'rgba(255,255,255,0.1)',
              }} />
            );
          })
        )}
      </div>
      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 9, textAlign: 'center', marginTop: 3 }}>
        cobertura 360°
      </p>
    </div>
  );
};

const CapturaAsistente360 = ({ habitacion, onClose, onSuccess }) => {
  const videoRef        = useRef(null);
  const canvasRef       = useRef(null);
  const streamRef       = useRef(null);
  const orientRef       = useRef({ alpha: 0, beta: 0 });
  const alpha0Ref       = useRef(null);      // dirección inicial = "norte" relativo
  const capturedPosRef  = useRef([]);         // [{alpha,beta}] actualizado sincrónicamente
  const holdTimerRef    = useRef(null);
  const holdStartRef    = useRef(null);

  const [listo,        setListo]        = useState(false);
  const [camActiva,    setCamActiva]    = useState(false);
  const [sinGiro,      setSinGiro]      = useState(false);
  const [orient,       setOrient]       = useState({ alpha: 0, beta: 0 });
  const [fotos,        setFotos]        = useState([]);
  const [flash,        setFlash]        = useState(false);
  const [procesando,   setProcesando]   = useState(false);
  const [error,        setError]        = useState('');
  const [titulo,       setTitulo]       = useState('Vista 360°');
  const [started,      setStarted]      = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const [farEnough,    setFarEnough]    = useState(false);

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
      setError('No se pudo acceder a la cámara. Verifica los permisos.');
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
      // beta en portrait: ~90° = horizontal → convertir a elevación (0=horizontal)
      const elevation = (e.beta ?? 90) - 90;
      const o = { alpha: e.alpha ?? 0, beta: elevation };
      orientRef.current = o;
      if (!got) { got = true; setSinGiro(false); }
      setOrient(o);
    };
    if (typeof DeviceOrientationEvent?.requestPermission === 'function') {
      DeviceOrientationEvent.requestPermission()
        .then(p => { if (p === 'granted') window.addEventListener('deviceorientation', handler); })
        .catch(() => setSinGiro(true));
    } else {
      window.addEventListener('deviceorientation', handler);
      setTimeout(() => { if (!got) setSinGiro(true); }, 2000);
    }
    return () => window.removeEventListener('deviceorientation', handler);
  }, []);

  // ── Calcular alpha relativo al inicio ────────────────────────────────────
  const getRelAlpha = useCallback(() => {
    const raw = orientRef.current.alpha;
    if (alpha0Ref.current === null) return 0;
    return ((raw - alpha0Ref.current) % 360 + 360) % 360;
  }, []);

  // ── Capturar foto ────────────────────────────────────────────────────────
  const capturarFoto = useCallback(() => {
    const video  = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const alpha = getRelAlpha();
    const beta  = orientRef.current.beta;

    canvas.width  = video.videoWidth  || 1280;
    canvas.height = video.videoHeight || 720;
    canvas.getContext('2d').drawImage(video, 0, 0);
    canvas.toBlob((blob) => {
      if (!blob) return;
      capturedPosRef.current = [...capturedPosRef.current, { alpha, beta }];
      setFotos(prev => [...prev, { blob, alpha, beta }]);
      setFlash(true);
      setTimeout(() => setFlash(false), 150);
    }, 'image/jpeg', 0.90);
  }, [getRelAlpha]);

  // ── Empezar ──────────────────────────────────────────────────────────────
  const handleStart = () => {
    alpha0Ref.current    = orientRef.current.alpha;
    capturedPosRef.current = [];
    capturarFoto();
    setStarted(true);
  };

  // ── Auto-captura por movimiento ──────────────────────────────────────────
  useEffect(() => {
    if (!camActiva || !started || procesando) return;

    const alpha = getRelAlpha();
    const beta  = orientRef.current.beta;
    const positions = capturedPosRef.current;

    const dist = positions.length === 0
      ? Infinity
      : Math.min(...positions.map(f => sphereDist(alpha, beta, f.alpha, f.beta)));

    const lejos = dist >= CAPTURE_DIST;
    setFarEnough(lejos);

    if (lejos) {
      if (!holdTimerRef.current) {
        holdStartRef.current = Date.now();
        holdTimerRef.current = setInterval(() => {
          const elapsed = Date.now() - holdStartRef.current;
          setHoldProgress(Math.min(100, (elapsed / HOLD_MS) * 100));
          if (elapsed >= HOLD_MS) {
            clearInterval(holdTimerRef.current);
            holdTimerRef.current = null;
            holdStartRef.current = null;
            setHoldProgress(0);
            capturarFoto();
          }
        }, 30);
      }
    } else {
      if (holdTimerRef.current) {
        clearInterval(holdTimerRef.current);
        holdTimerRef.current = null;
        holdStartRef.current = null;
        setHoldProgress(0);
      }
    }
  }, [orient, camActiva, started, procesando, capturarFoto, getRelAlpha]);

  useEffect(() => () => {
    if (holdTimerRef.current) clearInterval(holdTimerRef.current);
  }, []);

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

  // ── Pantalla inicial ──────────────────────────────────────────────────────
  if (!listo) {
    return (
      <div className="fixed inset-0 z-[300] flex flex-col items-center justify-center bg-gray-900 px-6 text-center">
        <div className="text-6xl mb-5">📷</div>
        <h2 className="text-white text-2xl font-bold mb-1">Captura 360°</h2>
        <p className="text-gray-400 text-sm mb-2">Hab. {habitacion.numero} — {habitacion.tipo_habitacion}</p>

        <div className="bg-white/5 rounded-2xl p-5 my-4 text-left space-y-3 w-full max-w-sm">
          <p className="text-white font-semibold text-sm mb-1">Cómo hacerlo:</p>
          {[
            ['🏠', 'Párate en el', 'centro', 'de la habitación'],
            ['▶️', 'Presiona', 'Empezar', '— captura la primera foto'],
            ['🔄', 'Muévete despacio en', 'todas direcciones', '(alrededor, arriba y abajo)'],
            ['✅', 'Se captura', 'automáticamente', 'cada vez que te mueves ~22°'],
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

        <button onClick={iniciarCamara}
          className="w-full max-w-sm bg-green-500 hover:bg-green-600 active:bg-green-700 text-white font-bold py-4 rounded-2xl text-lg">
          Activar cámara
        </button>
        <button onClick={onClose} className="mt-3 text-gray-500 text-sm py-2 w-full max-w-sm">
          Cancelar
        </button>
      </div>
    );
  }

  const RETICLE_R     = 44;
  const CIRCUMFERENCE = 2 * Math.PI * RETICLE_R;
  const cobertura     = Math.min(100, Math.round((fotos.length / TARGET_FOTOS) * 100));

  // ── Vista de captura ──────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-[300] bg-black overflow-hidden">
      {flash && <div className="absolute inset-0 z-50 bg-white opacity-60 pointer-events-none" />}

      <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover" playsInline muted />
      <canvas ref={canvasRef} className="hidden" />

      {/* Retículo central con anillo de progreso */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <svg width={RETICLE_R * 2 + 20} height={RETICLE_R * 2 + 20}>
          <circle
            cx={RETICLE_R + 10} cy={RETICLE_R + 10} r={RETICLE_R}
            fill="none"
            stroke={farEnough ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.2)'}
            strokeWidth={farEnough ? 2.5 : 1.5}
            strokeDasharray={farEnough ? undefined : '5 4'}
          />
          {farEnough && holdProgress > 0 && (
            <circle
              cx={RETICLE_R + 10} cy={RETICLE_R + 10} r={RETICLE_R}
              fill="none" stroke="#22c55e" strokeWidth="4" strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={CIRCUMFERENCE * (1 - holdProgress / 100)}
              transform={`rotate(-90 ${RETICLE_R + 10} ${RETICLE_R + 10})`}
            />
          )}
          <circle cx={RETICLE_R + 10} cy={RETICLE_R + 10} r={3}
            fill={farEnough ? '#22c55e' : 'rgba(255,255,255,0.7)'} />
          {/* Cruz central */}
          {[[-8, 0, -2, 0], [8, 0, 2, 0], [0, -8, 0, -2], [0, 8, 0, 2]].map(([x1, y1, x2, y2], i) => (
            <line key={i}
              x1={RETICLE_R + 10 + x1} y1={RETICLE_R + 10 + y1}
              x2={RETICLE_R + 10 + x2} y2={RETICLE_R + 10 + y2}
              stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeLinecap="round" />
          ))}
        </svg>
      </div>

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-4 py-3 bg-gradient-to-b from-black/70 to-transparent">
        <button onClick={onClose} className="text-white p-1">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
        </button>
        <div className="text-center">
          <p className="text-white font-bold text-sm">{fotos.length} fotos · {cobertura}% cobertura</p>
          {started && (
            <p className="text-xs mt-0.5" style={{ color: farEnough ? '#22c55e' : '#9ca3af' }}>
              {farEnough ? '⏺ Quieto… capturando' : 'Muévete para capturar más'}
            </p>
          )}
        </div>
        <div className="w-8" />
      </div>

      {/* Mini mapa de cobertura */}
      {fotos.length > 0 && (
        <div className="absolute top-16 right-3 z-10">
          <CoverageMinimap fotos={fotos} />
        </div>
      )}

      {/* Sin giroscopio */}
      {sinGiro && started && (
        <div className="absolute top-20 left-0 right-0 flex justify-center z-10 px-4">
          <div className="bg-yellow-500/90 text-black text-xs font-semibold px-3 py-1.5 rounded-full text-center">
            Sin giroscopio — usa el botón para capturar manualmente
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 z-10 px-4 pb-8 pt-4 bg-gradient-to-t from-black/80 to-transparent">
        {error && (
          <div className="bg-red-500/20 border border-red-400/40 rounded-xl px-4 py-2 text-red-300 text-sm mb-3 text-center">
            {error}
          </div>
        )}

        <input
          value={titulo}
          onChange={e => setTitulo(e.target.value)}
          className="w-full bg-white/10 text-white placeholder-white/40 rounded-xl px-4 py-2.5 text-sm mb-3 outline-none border border-white/10 focus:border-white/30"
          placeholder="Nombre del tour (ej: Habitación Doble)"
        />

        {!started ? (
          <button onClick={handleStart}
            className="w-full bg-green-500 hover:bg-green-600 active:bg-green-700 text-white font-bold py-4 rounded-2xl text-lg">
            ▶ Empezar captura
          </button>
        ) : (
          <div className="flex gap-3 items-center">
            {/* Botón manual de captura */}
            <button
              onPointerDown={capturarFoto}
              className="flex-none w-16 h-16 rounded-full border-4 border-white bg-white/20 active:bg-white/40 flex items-center justify-center"
            >
              <div className="w-10 h-10 rounded-full bg-white" />
            </button>

            <button
              onClick={handleEnviar}
              disabled={procesando || fotos.length < MIN_FOTOS}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-bold py-4 rounded-2xl text-sm"
            >
              {procesando
                ? 'Procesando…'
                : fotos.length < MIN_FOTOS
                  ? `Necesitas ${MIN_FOTOS - fotos.length} fotos más`
                  : `Crear panorama (${fotos.length} fotos)`
              }
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CapturaAsistente360;
