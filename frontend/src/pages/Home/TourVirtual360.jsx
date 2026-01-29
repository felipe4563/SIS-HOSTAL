import { useState } from 'react';
import { ReactPhotoSphereViewer } from 'react-photo-sphere-viewer';

const TourVirtual360 = ({ imagenes360, nombreHabitacion, onClose }) => {
  const [imagenActual, setImagenActual] = useState(0);
  const API_BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:4000';

  if (!imagenes360 || imagenes360.length === 0) {
    return null;
  }

  const imagen = imagenes360[imagenActual];

  const handleCambiarVista = (index) => {
    setImagenActual(index);
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-b from-black/90 to-transparent p-4 sm:p-6 z-10 relative">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">
              🌐 Tour Virtual 360° - {nombreHabitacion}
            </h2>
            {imagen.titulo && (
              <p className="text-blue-300 text-sm">{imagen.titulo}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-red-400 transition-colors bg-white/10 hover:bg-white/20 rounded-full p-2 sm:p-3"
            aria-label="Cerrar tour virtual"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Visor 360° Interactivo */}
      <div className="flex-1 relative">
        <ReactPhotoSphereViewer
          src={`${API_BASE_URL}/${imagen.ruta}`}
          height="100%"
          width="100%"
          littlePlanet={false}
          navbar={[
            'autorotate',
            'zoom',
            'fullscreen',
          ]}
          container=""
          mousewheel={true}
          touchmoveTwoFingers={false}
          defaultZoomLvl={50}
          fisheye={false}
          autorotateDelay={3000}
          autorotateSpeed="2rpm"
        />

        {/* Indicador de controles (solo al inicio) */}
        <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2 bg-black/60 backdrop-blur-sm text-white px-4 py-2 sm:px-6 sm:py-3 rounded-full pointer-events-none">
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-xs sm:text-sm">
            <span>🖱️ Arrastra para explorar</span>
            <span className="hidden sm:inline text-white/50">|</span>
            <span>🔍 Scroll = Zoom</span>
          </div>
        </div>
      </div>

      {/* Navegación entre vistas */}
      {imagenes360.length > 1 && (
        <>
          <button
            onClick={() => handleCambiarVista((imagenActual - 1 + imagenes360.length) % imagenes360.length)}
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white p-3 sm:p-4 rounded-full transition-all backdrop-blur-sm z-20"
            aria-label="Vista anterior"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <button
            onClick={() => handleCambiarVista((imagenActual + 1) % imagenes360.length)}
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white p-3 sm:p-4 rounded-full transition-all backdrop-blur-sm z-20"
            aria-label="Vista siguiente"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Miniaturas */}
          <div className="bg-gradient-to-t from-black/90 to-transparent p-4 sm:p-6 relative z-10">
            <div className="max-w-7xl mx-auto">
              <div className="flex justify-center space-x-2 sm:space-x-3 overflow-x-auto pb-2">
                {imagenes360.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => handleCambiarVista(index)}
                    className={`flex-shrink-0 w-16 h-16 sm:w-24 sm:h-24 rounded-lg overflow-hidden border-2 transition-all ${
                      index === imagenActual
                        ? 'border-blue-500 scale-110 shadow-lg shadow-blue-500/50'
                        : 'border-white/30 hover:border-white/60'
                    }`}
                  >
                    <img
                      src={`${API_BASE_URL}/${img.ruta}`}
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