import { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext.jsx';
import { obtenerMisReservas, cancelarReserva } from '../../services/reserva.js';

const MisReservas = () => {
  const { usuario } = useContext(AuthContext);
  const navigate = useNavigate();
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!usuario || usuario.tipo !== 'cliente') {
      navigate('/');
      return;
    }
    cargarReservas();
  }, [usuario, navigate]);

  const cargarReservas = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await obtenerMisReservas();
      setReservas(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar reservas');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelarReserva = async (id) => {
    if (!window.confirm('¿Estás seguro de que deseas cancelar esta reserva?')) {
      return;
    }
    try {
      await cancelarReserva(id);
      cargarReservas();
    } catch (err) {
      alert(err.response?.data?.message || 'Error al cancelar la reserva');
    }
  };

  const getEstadoBadge = (estado) => {
    const badges = {
      pendiente: 'bg-amber-100/80 text-amber-800 border-amber-300 shadow-amber-100',
      confirmada: 'bg-emerald-100/80 text-emerald-800 border-emerald-300 shadow-emerald-100',
      cancelada: 'bg-rose-100/80 text-rose-800 border-rose-300 shadow-rose-100',
      finalizada: 'bg-slate-100/80 text-slate-800 border-slate-300 shadow-slate-100'
    };
    const iconos = {
      pendiente: '⏳',
      confirmada: '✅',
      cancelada: '❌',
      finalizada: '🏁'
    };
    return (
      <div className={`inline-flex items-center px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold border shadow-sm backdrop-blur-sm ${badges[estado]} uppercase tracking-wider`}>
        <span className="mr-2 text-base">{iconos[estado]}</span>
        {estado}
      </div>
    );
  };

  const formatearFechaStr = (fecha) => {
    const date = new Date(fecha);
    const options = { weekday: 'short', day: '2-digit', month: 'short' };
    return date.toLocaleDateString('es-ES', options).replace(',', '');
  };

  const construirUrlImagen = (ruta) => {
    if (!ruta) return 'https://placehold.co/800x600/1e3a8a/ffffff?text=Hostal+Suri';
    if (ruta.startsWith('http://') || ruta.startsWith('https://')) return ruta;
    
    // Solución para redes LAN (dispositivos móviles)
    let baseUrl = import.meta.env.VITE_BASE_URL || 'http://localhost:3000';
    if (baseUrl.includes('localhost') && window.location.hostname !== 'localhost') {
      baseUrl = baseUrl.replace('localhost', window.location.hostname);
    }
    
    if (ruta.startsWith('habitaciones/')) return `${baseUrl}/api/uploads/${ruta}`;
    return `${baseUrl}/api/uploads/habitaciones/${ruta}`;
  };

  if (!usuario || usuario.tipo !== 'cliente') return null;

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20">
      {/* Header Premium */}
      <div className="relative bg-gradient-to-br from-[#0F172A] via-[#1E3A8A] to-[#2563EB] overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 relative z-10">
          <Link to="/" className="inline-flex items-center text-blue-200 hover:text-white transition-colors mb-6 group">
            <span className="bg-white/10 p-2 rounded-full mr-3 group-hover:bg-white/20 transition-all">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </span>
            <span className="font-medium tracking-wide">Volver al inicio</span>
          </Link>
          
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-3 tracking-tight">Mis Reservas</h1>
              <p className="text-blue-100 text-lg max-w-2xl font-light">
                Administra tus estadías y revisa el estado de tus reservas en <span className="font-semibold text-white">Hostal Suri</span>.
              </p>
            </div>
            
            {/* Perfil Mini */}
            <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md border border-white/10 p-4 rounded-2xl shadow-2xl">
              <div className="w-14 h-14 bg-gradient-to-tr from-amber-400 to-orange-500 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-inner">
                {usuario.nombre.charAt(0)}{usuario.apellido.charAt(0)}
              </div>
              <div>
                <h3 className="text-white font-bold text-lg leading-tight">{usuario.nombre} {usuario.apellido}</h3>
                <p className="text-blue-200 text-sm">{usuario.correo}</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Wave divisor */}
        <div className="absolute bottom-0 w-full overflow-hidden leading-[0]">
          <svg className="relative block w-[calc(100%+1.3px)] h-[40px] sm:h-[60px]" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C59.71,118.08,130.83,123.15,195.96,114.07,238.94,108.06,281.39,81.42,321.39,56.44Z" className="fill-[#F8FAFC]"></path>
          </svg>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-20">
        {loading && (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <p className="mt-4 text-slate-500 font-medium">Buscando tus reservas...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-3xl p-8 text-center shadow-sm max-w-2xl mx-auto mt-10">
            <div className="text-5xl mb-4">⚠️</div>
            <p className="text-red-700 font-bold text-lg mb-6">{error}</p>
            <button onClick={cargarReservas} className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-full font-bold transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5">
              Intentar de nuevo
            </button>
          </div>
        )}

        {!loading && !error && (
          <>
            {reservas.length > 0 ? (
              <div className="space-y-8 mt-10">
                {reservas.map((reserva) => {
                  const esActiva = reserva.estado === 'confirmada' || reserva.estado === 'pendiente';
                  
                  return (
                    <div key={reserva.id_reserva} className={`bg-white rounded-[2rem] overflow-hidden transition-all duration-300 border ${esActiva ? 'border-blue-100 shadow-xl hover:shadow-2xl' : 'border-slate-200 shadow-md opacity-90'}`}>
                      <div className="flex flex-col lg:flex-row">
                        
                        {/* 🖼️ Imagen Responsiva */}
                        <div className="w-full lg:w-2/5 xl:w-1/3 relative h-[250px] sm:h-[320px] lg:h-auto group">
                          <img 
                            src={construirUrlImagen(reserva.imagen_portada)} 
                            alt={`Habitación ${reserva.numero_habitacion}`}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            onError={(e) => { e.target.src = 'https://placehold.co/800x600/1e3a8a/ffffff?text=Hostal+Suri'; }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/80 via-transparent to-transparent"></div>
                          
                          <div className="absolute top-5 left-5 z-10">
                            {getEstadoBadge(reserva.estado)}
                          </div>
                          
                          <div className="absolute bottom-5 left-5 right-5 text-white z-10 pointer-events-none">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border border-white/30">
                                {reserva.tipo_habitacion}
                              </span>
                            </div>
                            <h3 className="text-3xl font-bold drop-shadow-md">Hab. {reserva.numero_habitacion}</h3>
                            <p className="text-white/80 text-sm flex items-center gap-2 mt-1">
                              <span>👥 Capacidad: {reserva.capacidad_habitacion} pax</span>
                            </p>
                          </div>
                        </div>

                        {/* 📄 Contenido y Detalles */}
                        <div className="w-full lg:w-3/5 xl:w-2/3 p-6 sm:p-8 flex flex-col justify-between bg-white relative z-20">
                          <div>
                            <div className="flex justify-between items-start mb-6 border-b border-slate-100 pb-4">
                              <div>
                                <p className="text-sm font-bold text-blue-600 uppercase tracking-wider mb-1">Reserva #{reserva.id_reserva}</p>
                                <p className="text-slate-500 text-sm">Realizada el {new Date(reserva.fecha_creacion || Date.now()).toLocaleDateString()}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-3xl font-extrabold text-[#0F172A]">Bs. {parseFloat(reserva.total).toFixed(2)}</p>
                                <p className="text-sm text-slate-500 font-medium">Total por {reserva.noches} noches</p>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                                <p className="text-xs text-slate-400 font-bold uppercase mb-1">Check-in</p>
                                <p className="font-bold text-slate-800">{formatearFechaStr(reserva.fecha_entrada)}</p>
                                <p className="text-xs text-slate-500 mt-1">14:00 hrs</p>
                              </div>
                              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                                <p className="text-xs text-slate-400 font-bold uppercase mb-1">Check-out</p>
                                <p className="font-bold text-slate-800">{formatearFechaStr(reserva.fecha_salida)}</p>
                                <p className="text-xs text-slate-500 mt-1">11:00 hrs</p>
                              </div>
                              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                                <p className="text-xs text-slate-400 font-bold uppercase mb-1">Huéspedes</p>
                                <p className="font-bold text-slate-800">{reserva.cantidad_adultos} Ad, {reserva.cantidad_ninos} Ni</p>
                              </div>
                              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                                <p className="text-xs text-slate-400 font-bold uppercase mb-1">Llegada Est.</p>
                                <p className="font-bold text-slate-800">{reserva.hora_llegada ? reserva.hora_llegada.substring(0,5) : 'No def.'}</p>
                              </div>
                            </div>
                          </div>

                          {/* Action Area */}
                          <div className="mt-4 pt-6 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                            
                            <div className="w-full sm:w-auto text-sm text-slate-500">
                              {reserva.estado === 'pendiente' && (
                                <p className="flex items-center gap-2 text-amber-600 bg-amber-50 px-4 py-2 rounded-xl font-medium">
                                  <span>💳</span> Esperando pago en recepción
                                </p>
                              )}
                              {reserva.estado === 'confirmada' && (
                                <p className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-4 py-2 rounded-xl font-medium">
                                  <span>🎉</span> Todo listo para tu llegada
                                </p>
                              )}
                              {reserva.estado === 'cancelada' && (
                                <p className="flex items-center gap-2 text-rose-600 bg-rose-50 px-4 py-2 rounded-xl font-medium">
                                  <span>🚫</span> Esta reserva fue cancelada
                                </p>
                              )}
                            </div>

                            <div className="w-full sm:w-auto flex gap-3">
                              {(reserva.estado === 'pendiente' || reserva.estado === 'confirmada') && (
                                <button
                                  onClick={() => handleCancelarReserva(reserva.id_reserva)}
                                  className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-red-600 bg-red-50 hover:bg-red-600 hover:text-white transition-all duration-300 text-sm"
                                >
                                  Cancelar Reserva
                                </button>
                              )}
                            </div>
                          </div>

                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 px-4">
                <div className="bg-white p-10 rounded-[3rem] shadow-xl text-center max-w-lg border border-slate-100">
                  <div className="text-8xl mb-6 select-none">🧳</div>
                  <h3 className="text-3xl font-extrabold text-[#0F172A] mb-4">Aún no tienes reservas</h3>
                  <p className="text-slate-500 mb-8 text-lg">Tu próxima gran aventura o viaje de negocios comienza aquí. ¡Descubre nuestras habitaciones!</p>
                  <Link
                    to="/"
                    className="inline-flex items-center justify-center w-full bg-gradient-to-r from-blue-600 to-blue-800 text-white px-8 py-4 rounded-2xl font-bold transition-all shadow-lg hover:shadow-blue-600/30 hover:-translate-y-1 text-lg"
                  >
                    <span>Explorar Habitaciones</span>
                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                  </Link>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MisReservas;