import { useState, useEffect, useRef, useCallback } from 'react';
import { capturaFotos360 } from '../../services/habitacion';

const SECTORES_H = ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO'];
const MIN_FOTOS = 6;

const getZona = (alpha, beta) => {
  const h = Math.floor(((alpha ?? 0) + 22.5) % 360 / 45);
  const v = (beta ?? 0) < -20 ? 'U' : 'M';
  return `${h}-${v}`;
};

const CapturaAsistente360 = ({ habitacion, onClose, onSuccess }) => {
  const videoRef       = useRef(null);
  const canvasRef      = useRef(null);
  const streamRef      = useRef(null);
  const orientRef      = useRef({ alpha: 0, beta: 0 });
  const lastZoneRef    = useRef(null);
  const captureTimerRef = useRef(null);

  const [fotos,          setFotos]          = useState([]);
  const [zonasCubiertas, setZonasCubiertas] = useState(new Set());
  const [zonaActual,     setZonaActual]     = useState('');
  const [flash,          setFlash]          = useState(false);
  const [procesando,     setProcesando]     = useState(false);
  const [error,          setError]          = useState('');
  const [titulo,         setTitulo]         = useState('Vista 360°');
  const [camActiva,      setCamActiva]      = useState(false);
  const [sinGiroscopio,  setSinGiroscopio]  = useState(false);

  // Abrir cámara trasera
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } },
          audio: false
        });
        if (cancelled) { stream.getTracks().forEach(t => t.stop()); return; }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
          setCamActiva(true);
        }
      } catch {
        setError('No se pudo acceder a la cámara. Verifica los permisos del navegador.');
      }
    })();
    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, []);

  // Giroscopio con soporte iOS 13+
  useEffect(() => {
    let gotOrientation = false;
    const onOrientation = (e) => {
      if (!gotOrientation) { gotOrientation = true; setSinGiroscopio(false); }
      orientRef.current = { alpha: e.alpha ?? 0, beta: e.beta ?? 0 };
      const zona = getZona(e.alpha, e.beta);
      setZonaActual(zona);
    };

    if (typeof DeviceOrientationEvent?.requestPermission === 'function') {
      DeviceOrientationEvent.requestPermission()
        .then(p => { if (p === 'granted') window.addEventListener('deviceorientation', onOrientation); })
        .catch(() => setSinGiroscopio(true));
    } else {
      window.addEventListener('deviceorientation', onOrientation);
      setTimeout(() => { if (!gotOrientation) setSinGiroscopio(true); }, 2000);
    }

    return () => window.removeEventListener('deviceorientation', onOrientation);
  }, []);

  // Auto-captura al detectar zona nueva estable 600ms
  useEffect(() => {
    if (!camActiva || !zonaActual || procesando) return;
    if (zonaActual === lastZoneRef.current) return;
    if (zonasCubiertas.has(zonaActual)) return;

    clearTimeout(captureTimerRef.current);
    captureTimerRef.current = setTimeout(() => {
      if (zonaActual !== lastZoneRef.current) return;
      capturarFoto();
    }, 600);

    lastZoneRef.current = zonaActual;
    return () => clearTimeout(captureTimerRef.current);
  }, [zonaActual, camActiva, procesando]);

  const capturarFoto = useCallback(() => {
    const video  = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !camActiva) return;

    canvas.width  = video.videoWidth  || 1280;
    canvas.height = video.videoHeight || 720;
    canvas.getContext('2d').drawImage(video, 0, 0);

    canvas.toBlob((blob) => {
      if (!blob) return;
      setFotos(prev => [...prev, blob]);
      setZonasCubiertas(prev => new Set([...prev, zonaActual]));
      setFlash(true);
      setTimeout(() => setFlash(false), 200);
    }, 'image/jpeg', 0.92);
  }, [camActiva, zonaActual]);

  const handleEnviar = async () => {
    if (fotos.length < MIN_FOTOS) {
      setError(`Necesitas al menos ${MIN_FOTOS} fotos. Tienes ${fotos.length}.`);
      return;
    }
    setProcesando(true);
    setError('');
    try {
      await capturaFotos360(habitacion.id_habitacion, fotos, titulo);
      onSuccess();
      onClose();
    } catch (e) {
      setError(e?.response?.data?.detalle || e?.response?.data?.message || 'Error al procesar las fotos');
    } finally {
      setProcesando(false);
    }
  };

  const progreso = Math.min(100, Math.round((fotos.length / 16) * 100));

  return (
    <div className="fixed inset-0 z-[300] flex flex-col bg-black">
      {/* Flash de captura */}
      {flash && <div className="absolute inset-0 z-50 bg-white opacity-60 pointer-events-none" />}

      {/* Video */}
      <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover" playsInline muted />
      <canvas ref={canvasRef} className="hidden" />

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between px-4 py-3 bg-black/60 backdrop-blur-sm">
        <button onClick={onClose} className="flex items-center gap-2 text-white text-sm font-medium">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
          Cancelar
        </button>
        <p className="text-white text-sm font-semibold">Captura 360° — Hab. {habitacion.numero}</p>
        <span className="text-white/60 text-sm">{fotos.length} fotos</span>
      </div>

      {/* Barra de progreso */}
      <div className="relative z-10 h-1.5 bg-white/20">
        <div className="h-full bg-green-400 transition-all duration-300" style={{ width: `${progreso}%` }} />
      </div>

      {/* Compass de zonas */}
      <div className="relative z-10 flex justify-center py-4">
        <div className="relative w-32 h-32">
          <div className="absolute inset-0 rounded-full border-2 border-white/30" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-white/60" />
          </div>
          {SECTORES_H.map((dir, i) => {
            const angle = i * 45 - 90;
            const rad   = (angle * Math.PI) / 180;
            const r     = 48;
            const x     = 64 + r * Math.cos(rad);
            const y     = 64 + r * Math.sin(rad);
            const cubiertoM = zonasCubiertas.has(`${i}-M`);
            const cubiertoU = zonasCubiertas.has(`${i}-U`);
            return (
              <div
                key={dir}
                className="absolute flex flex-col items-center gap-0.5"
                style={{ left: x - 10, top: y - 10, width: 20 }}
              >
                <div className={`w-2 h-2 rounded-full border ${cubiertoU ? 'bg-green-400 border-green-400' : 'bg-transparent border-white/30'}`} />
                <div className={`w-3 h-3 rounded-full border-2 ${cubiertoM ? 'bg-green-400 border-green-400' : 'bg-transparent border-white/50'}`} />
                <span className="text-white/50 text-[8px] leading-none">{dir}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Instrucción central */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center gap-2 pointer-events-none">
        {sinGiroscopio ? (
          <div className="bg-amber-500/80 rounded-xl px-4 py-2 text-center">
            <p className="text-white text-sm font-medium">Sin giroscopio detectado</p>
            <p className="text-white/80 text-xs mt-0.5">Usa el botón para capturar manualmente</p>
          </div>
        ) : (
          <div className="bg-black/50 rounded-full px-5 py-2">
            <p className="text-white text-sm">Apunta en todas direcciones — se captura solo</p>
          </div>
        )}
      </div>

      {/* Controles inferiores */}
      <div className="relative z-10 bg-black/70 backdrop-blur-sm px-4 pb-6 pt-3 space-y-3">
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
          <button
            onClick={capturarFoto}
            disabled={!camActiva || procesando}
            className="flex-1 flex items-center justify-center gap-2 bg-white/15 hover:bg-white/25 disabled:opacity-40 border border-white/20 text-white rounded-xl py-3 text-sm font-medium transition-colors"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
              <circle cx="12" cy="13" r="3"/>
            </svg>
            Capturar ({fotos.length})
          </button>

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
            ) : (
              <>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
                </svg>
                {fotos.length < MIN_FOTOS ? `Falta ${MIN_FOTOS - fotos.length}` : 'Crear 360°'}
              </>
            )}
          </button>
        </div>

        <p className="text-center text-white/30 text-xs pb-1">
          Mínimo {MIN_FOTOS} fotos · Recomendado 12–20 con superposición
        </p>
      </div>
    </div>
  );
};

export default CapturaAsistente360;
