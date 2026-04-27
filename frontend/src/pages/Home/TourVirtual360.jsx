import { useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { GyroscopePlugin } from '@photo-sphere-viewer/gyroscope-plugin';
import { ReactPhotoSphereViewer } from 'react-photo-sphere-viewer';

const TourVirtual360 = () => {
  const [imagenActual, setImagenActual] = useState(0);
  const [gyroActivo, setGyroActivo] = useState(false);
  const [gyroMensaje, setGyroMensaje] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const { imagenes360 = [], nombreHabitacion = 'Habitación' } = location.state || {};
  const API_BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:4000';
  const viewerRef = useRef(null);

  if (!imagenes360 || imagenes360.length === 0) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold mb-2">Tour no disponible</h2>
          <p className="text-slate-300 mb-6">
            No se encontraron imagenes 360 para mostrar en este momento.
          </p>
          <button
            onClick={() => navigate('/')}
            className="rounded-xl bg-blue-600 hover:bg-blue-700 px-5 py-2.5 font-semibold transition-colors"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  const imagen = imagenes360[imagenActual];

  const handleCambiarVista = (index) => {
    setImagenActual(index);
  };

  const toggleGyro = async () => {
    if (!viewerRef.current) return;

    const plugin = viewerRef.current.getPlugin(GyroscopePlugin);

    if (!plugin) {
      setGyroMensaje('Tu dispositivo no soporta el modo inmersivo.');
      return;
    }

    try {
      if (!gyroActivo) {
        if (
          typeof window !== 'undefined' &&
          window.DeviceOrientationEvent &&
          typeof window.DeviceOrientationEvent.requestPermission === 'function'
        ) {
          const permiso = await window.DeviceOrientationEvent.requestPermission();
          if (permiso !== 'granted') {
            setGyroMensaje('Debes permitir acceso al sensor para activar el modo inmersivo.');
            return;
          }
        }

        await plugin.start();
        setGyroActivo(true);
        setGyroMensaje('Modo inmersivo activado. Mueve tu celular para explorar.');
      } else {
        await plugin.stop();
        setGyroActivo(false);
        setGyroMensaje('Modo inmersivo desactivado.');
      }
    } catch (error) {
      setGyroMensaje('No se pudo activar el giroscopio en este dispositivo.');
      console.error('Error con giroscopio:', error);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black h-dvh w-full overflow-hidden">
      {/* Visor 360° ocupa toda la pantalla */}
      <div className="absolute inset-0">
        <ReactPhotoSphereViewer
          src={`${API_BASE_URL}/uploads/${imagen.ruta}`}
          height="100vh"
          width="100%"
          littlePlanet={false}
          navbar={['autorotate', 'zoom', 'fullscreen']}
          plugins={[[GyroscopePlugin, {}]]}
          onReady={(instance) => {
            viewerRef.current = instance;
          }}
          container=""
          mousewheel={true}
          touchmoveTwoFingers={false}
          defaultZoomLvl={50}
          fisheye={false}
          autorotateDelay={3000}
          autorotateSpeed="2rpm"
        />
      </div>

      {/* Header flotante */}
      <div className="absolute top-0 inset-x-0 bg-gradient-to-b from-black/90 to-transparent p-3 sm:p-6 z-30 pointer-events-none">
        <div className="max-w-7xl mx-auto flex justify-between items-start gap-3">
          <div>
            <h2 className="text-lg sm:text-2xl font-bold text-white mb-1">
              🌐 Tour Virtual 360° - {nombreHabitacion}
            </h2>
            {imagen.titulo && (
              <p className="text-blue-300 text-xs sm:text-sm">{imagen.titulo}</p>
            )}
          </div>
          <div className="flex items-center gap-2 pointer-events-auto">
            <button
              onClick={toggleGyro}
              className={`rounded-full px-3 py-2 text-xs sm:text-sm font-semibold transition-colors ${
                gyroActivo
                  ? 'bg-emerald-500/90 text-white hover:bg-emerald-600'
                  : 'bg-white/15 text-white hover:bg-white/25'
              }`}
            >
              {gyroActivo ? '📱 Modo inmersivo ON' : '📱 Activar modo inmersivo'}
            </button>
            <button
              onClick={() => navigate(-1)}
              className="text-white hover:text-red-400 transition-colors bg-white/10 hover:bg-white/20 rounded-full p-2 sm:p-3"
              aria-label="Cerrar tour virtual"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        {gyroMensaje && (
          <div className="max-w-7xl mx-auto mt-2 sm:mt-3 pointer-events-none">
            <div className="inline-block rounded-lg bg-black/50 px-3 py-2 text-[11px] sm:text-xs text-blue-100">
              {gyroMensaje}
            </div>
          </div>
        )}
      </div>

      {/* Indicador de controles */}
      <div className="absolute bottom-20 sm:bottom-24 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm text-white px-3 py-2 sm:px-6 sm:py-3 rounded-full pointer-events-none z-20 max-w-[92vw]">
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-[11px] sm:text-sm text-center">
          <span>🖱️ Arrastra para explorar</span>
          <span className="hidden sm:inline text-white/50">|</span>
          <span>🔍 Scroll = Zoom</span>
          <span className="hidden sm:inline text-white/50">|</span>
          <span>📱 Modo inmersivo con giroscopio</span>
        </div>
      </div>

      {/* Navegación entre vistas */}
      {imagenes360.length > 1 && (
        <>
          <button
            onClick={() => handleCambiarVista((imagenActual - 1 + imagenes360.length) % imagenes360.length)}
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white p-2.5 sm:p-4 rounded-full transition-all backdrop-blur-sm z-30"
            aria-label="Vista anterior"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <button
            onClick={() => handleCambiarVista((imagenActual + 1) % imagenes360.length)}
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white p-2.5 sm:p-4 rounded-full transition-all backdrop-blur-sm z-30"
            aria-label="Vista siguiente"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Miniaturas */}
          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 to-transparent p-3 sm:p-6 z-20">
            <div className="max-w-7xl mx-auto">
              <div className="flex justify-start sm:justify-center space-x-2 sm:space-x-3 overflow-x-auto pb-2">
                {imagenes360.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => handleCambiarVista(index)}
                    className={`flex-shrink-0 w-14 h-14 sm:w-24 sm:h-24 rounded-lg overflow-hidden border-2 transition-all ${
                      index === imagenActual
                        ? 'border-blue-500 scale-110 shadow-lg shadow-blue-500/50'
                        : 'border-white/30 hover:border-white/60'
                    }`}
                  >
                    <img
                      src={`${API_BASE_URL}/uploads/${img.ruta}`}
                      alt={img.titulo || `Vista ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
              <div className="text-center text-white/80 text-xs sm:text-sm mt-3">
                Vista {imagenActual + 1} de {imagenes360.length}
                {imagen.descripcion && (
                  <span className="block sm:inline sm:ml-2 sm:before:content-['•'] sm:before:mr-2">
                    {imagen.descripcion}
                  </span>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default TourVirtual360;