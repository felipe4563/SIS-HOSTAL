import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { useCarrito } from '../../context/CarritoContext';
import { crearReservaMultiple } from '../../services/reserva';
import { calcularPrecioDinamicoMultiple } from '../../services/pricing';
import { verificarDisponibilidad } from '../../services/habitacion';
import { iniciarPagoMultiple } from '../../services/pago';
import CalendarioReserva from './CalendarioReserva';

const ModalCarrito = ({ onClose }) => {
  const { usuario } = useContext(AuthContext);
  const navigate = useNavigate();
  const { habitaciones, eliminarHabitacion, limpiarCarrito } = useCarrito();

  const [fechaEntrada, setFechaEntrada] = useState('');
  const [fechaSalida, setFechaSalida] = useState('');
  const [cantidadAdultos, setCantidadAdultos] = useState(1);
  const [cantidadNinos, setCantidadNinos] = useState(0);
  const [horaLlegada, setHoraLlegada] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mostrarDetalles, setMostrarDetalles] = useState(false);

  // Availability per room
  const [disponibilidad, setDisponibilidad] = useState({});
  const [verificando, setVerificando] = useState(false);

  // Dynamic pricing
  const [preciosDinamicos, setPreciosDinamicos] = useState([]);
  const [calculandoPrecios, setCalculandoPrecios] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:4000';

  const construirUrlImagen = (ruta) => {
    if (!ruta) return 'https://placehold.co/100x100?text=Sin+Imagen';
    if (ruta.startsWith('http://') || ruta.startsWith('https://')) return ruta;
    return `${API_BASE_URL}/uploads/${ruta}`;
  };

  // Auto-verify availability for every room when dates change
  useEffect(() => {
    if (!fechaEntrada || !fechaSalida || habitaciones.length === 0) {
      setDisponibilidad({});
      return;
    }

    let cancelled = false;

    const verificarTodas = async () => {
      setVerificando(true);
      const checks = habitaciones.map((hab) =>
        verificarDisponibilidad(hab.id_habitacion, fechaEntrada, fechaSalida)
          .then((r) => ({ id: hab.id_habitacion, disponible: r.disponible }))
          .catch(() => ({ id: hab.id_habitacion, disponible: false }))
      );
      const results = await Promise.all(checks);
      if (!cancelled) {
        const map = {};
        results.forEach((r) => { map[r.id] = r.disponible; });
        setDisponibilidad(map);
        setVerificando(false);
      }
    };

    verificarTodas();
    return () => { cancelled = true; };
  }, [fechaEntrada, fechaSalida, habitaciones]);

  // Calculate dynamic prices when dates change
  useEffect(() => {
    if (!fechaEntrada || !fechaSalida || habitaciones.length === 0) {
      setPreciosDinamicos([]);
      return;
    }

    let cancelled = false;

    const calcularPrecios = async () => {
      setCalculandoPrecios(true);
      try {
        const precios = await calcularPrecioDinamicoMultiple(habitaciones, fechaEntrada, fechaSalida);
        if (!cancelled) setPreciosDinamicos(precios);
      } catch (err) {
        console.error('Error calculando precios:', err);
        if (!cancelled) setPreciosDinamicos([]);
      } finally {
        if (!cancelled) setCalculandoPrecios(false);
      }
    };

    calcularPrecios();
    return () => { cancelled = true; };
  }, [fechaEntrada, fechaSalida, habitaciones]);

  const totalGeneral = preciosDinamicos.reduce((sum, p) => sum + p.precio_total, 0);
  const noches = preciosDinamicos[0]?.noches || 0;

  const handleFechasChange = (entrada, salida) => {
    setFechaEntrada(entrada);
    setFechaSalida(salida);
    setError('');
  };

  const idsEnCarrito = habitaciones.map((h) => h.id_habitacion);

  const todasVerificadas = habitaciones.length > 0 &&
    Object.keys(disponibilidad).length === habitaciones.length;

  const hayNoDisponible = Object.values(disponibilidad).some((d) => d === false);
  const todasDisponibles = todasVerificadas && !hayNoDisponible;

  const getAjusteColor = (v) => (v > 0 ? 'text-red-600' : v < 0 ? 'text-green-600' : 'text-gray-600');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!fechaEntrada || !fechaSalida) { setError('Por favor selecciona las fechas'); return; }
    if (noches <= 0) { setError('La fecha de salida debe ser posterior a la de entrada'); return; }
    if (hayNoDisponible) {
      setError('Hay habitaciones no disponibles para las fechas seleccionadas. Elimínalas del carrito o cambia las fechas.');
      return;
    }

    if (!usuario) {
      sessionStorage.setItem('carritoGuardado', JSON.stringify({ fechaEntrada, fechaSalida }));
      alert('Debes iniciar sesión para completar la reserva');
      navigate('/login-cliente');
      return;
    }

    if (!usuario.id_cliente) { setError('Error: No se encontró la información del cliente'); return; }

    if (!usuario.ci || !usuario.celular || !usuario.direccion) {
      alert('Para completar tu reserva debes llenar tus datos personales (CI, Celular y Dirección). Serás redirigido a tu perfil.');
      navigate('/mi-perfil', { state: { completarPerfil: true } });
      onClose();
      return;
    }

    setLoading(true);
    setError('');

    try {
      // 1️⃣ Crear todas las reservas
      const responseReserva = await crearReservaMultiple({
        id_cliente: usuario.id_cliente,
        habitaciones: habitaciones.map((h) => ({ id_habitacion: h.id_habitacion })),
        fecha_entrada: fechaEntrada,
        fecha_salida: fechaSalida,
        cantidad_adultos: cantidadAdultos,
        cantidad_ninos: cantidadNinos,
        hora_llegada: horaLlegada,
      });

      const reservasIds = responseReserva.reservas.map((r) => r.id_reserva);

      // 2️⃣ UN solo pago para TODAS las reservas con el total combinado
      const resultadoPago = await iniciarPagoMultiple(reservasIds);

      if (resultadoPago.success && resultadoPago.paymentUrl) {
        sessionStorage.setItem('pago_pendiente', JSON.stringify({
          ids_reserva: reservasIds,
          id_pago: resultadoPago.id_pago,
          monto_total: resultadoPago.monto_total,
          timestamp: Date.now(),
        }));

        limpiarCarrito();
        onClose();

        setTimeout(() => {
          alert(`¡${reservasIds.length} ${reservasIds.length === 1 ? 'reserva creada' : 'reservas creadas'}! Serás redirigido al portal de pagos para completar el pago total.`);
          window.location.href = resultadoPago.paymentUrl;
        }, 400);
      } else {
        setError('Reservas creadas pero no se pudo iniciar el pago. Ve a "Mis Reservas" para completar el pago.');
      }
    } catch (err) {
      console.error('Error:', err);
      setError(err.response?.data?.message || 'Error al crear las reservas');
    } finally {
      setLoading(false);
    }
  };

  const cargando = verificando || calculandoPrecios;
  const canSubmit = !loading && !cargando && todasDisponibles && preciosDinamicos.length > 0 && habitaciones.length > 0;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-2 sm:p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl w-full sm:max-w-4xl max-h-[95vh] overflow-hidden transform animate-slideUp">

        {/* Header */}
        <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white p-5 sm:p-8 overflow-hidden">
          <div className="absolute top-0 right-0 w-72 h-72 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-500/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl pointer-events-none" />

          <div className="relative z-10 flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-1.5 rounded-full mb-4 text-sm font-medium">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Carrito de Reservas
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-1 truncate">
                {habitaciones.length} {habitaciones.length === 1 ? 'habitación' : 'habitaciones'} seleccionadas
              </h2>
              {noches > 0 && (
                <p className="text-blue-200 text-sm flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                  {noches} {noches === 1 ? 'noche' : 'noches'} ·{' '}
                  {new Date(fechaEntrada + 'T12:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })} →{' '}
                  {new Date(fechaSalida + 'T12:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="flex-shrink-0 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-all group"
            >
              <svg className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-8 space-y-6 overflow-y-auto max-h-[calc(95vh-160px)]">

          {/* Info del usuario */}
          {usuario && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-4 flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                {usuario.nombre.charAt(0)}{usuario.apellido.charAt(0)}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-gray-900 truncate">{usuario.nombre} {usuario.apellido}</p>
                <p className="text-sm text-gray-500 truncate">{usuario.correo}</p>
              </div>
            </div>
          )}

          {/* ── CALENDARIO + HUÉSPEDES/HORA ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

            {/* Calendario con fechas ocupadas unificadas de todas las habitaciones */}
            <div className="min-w-0">
              <div className="rounded-2xl border border-gray-200 p-3 sm:p-4 bg-white overflow-hidden">
                <CalendarioReserva
                  idHabitaciones={idsEnCarrito}
                  fechaEntrada={fechaEntrada}
                  fechaSalida={fechaSalida}
                  onFechasChange={handleFechasChange}
                />
              </div>
            </div>

            {/* Huéspedes + hora de llegada */}
            <div className="min-w-0 space-y-4">
              <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 space-y-4">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  Cantidad de huéspedes
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-2 block">Adultos</label>
                    <div className="relative">
                      <select
                        value={cantidadAdultos}
                        onChange={(e) => setCantidadAdultos(Number(e.target.value))}
                        required
                        className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all appearance-none font-semibold bg-white cursor-pointer"
                      >
                        {[1,2,3,4,5,6].map((n) => <option key={n} value={n}>{n} {n === 1 ? 'adulto' : 'adultos'}</option>)}
                      </select>
                      <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-2 block">Niños</label>
                    <div className="relative">
                      <select
                        value={cantidadNinos}
                        onChange={(e) => setCantidadNinos(Number(e.target.value))}
                        className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all appearance-none font-semibold bg-white cursor-pointer"
                      >
                        {[0,1,2,3,4,5].map((n) => <option key={n} value={n}>{n} {n === 1 ? 'niño' : 'niños'}</option>)}
                      </select>
                      <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-gray-200">
                <label className="font-bold text-gray-900 flex items-center gap-2 mb-3">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Hora estimada de llegada
                  <span className="text-xs font-normal text-gray-500">(opcional)</span>
                </label>
                <input
                  type="time"
                  value={horaLlegada}
                  onChange={(e) => setHoraLlegada(e.target.value)}
                  className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all font-medium"
                />
                <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Check-in disponible de 14:00 a 22:00
                </p>
              </div>
            </div>
          </div>

          {/* ── SPINNER de verificación / cálculo ── */}
          {cargando && (
            <div className="bg-blue-50 rounded-2xl p-6 text-center border border-blue-200">
              <div className="relative inline-flex items-center justify-center w-12 h-12 mb-3">
                <div className="h-12 w-12 animate-spin rounded-full border-[3px] border-blue-200 border-t-blue-600" />
              </div>
              <p className="text-blue-900 font-semibold">
                {verificando ? 'Verificando disponibilidad de habitaciones…' : 'Calculando precios dinámicos…'}
              </p>
            </div>
          )}

          {/* ── LISTA DE HABITACIONES con disponibilidad + precios ── */}
          {!cargando && fechaEntrada && fechaSalida && habitaciones.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                      d="M3 20v-5m0 0h18m-18 0v-3a3 3 0 013-3h12a3 3 0 013 3v3M7 12V9a2 2 0 012-2h2a2 2 0 012 2v3M3 20h18" />
                  </svg>
                  Habitaciones seleccionadas
                </h3>
                {preciosDinamicos.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setMostrarDetalles(!mostrarDetalles)}
                    className="text-sm text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1 transition-colors"
                  >
                    {mostrarDetalles ? 'Ocultar' : 'Ver'} ajustes
                    <svg className={`w-4 h-4 transition-transform ${mostrarDetalles ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                )}
              </div>

              {habitaciones.map((hab, index) => {
                const imagenPortada = hab.imagenes?.find((img) => img.es_portada) || hab.imagenes?.[0];
                const precio = preciosDinamicos[index];
                const disp = disponibilidad[hab.id_habitacion];
                const verificado = disp !== undefined;

                return (
                  <div
                    key={hab.id_habitacion}
                    className={`rounded-2xl border-2 p-4 transition-all duration-300 ${
                      !verificado
                        ? 'border-gray-200 bg-white'
                        : disp
                        ? 'border-green-200 bg-gradient-to-r from-green-50 to-emerald-50'
                        : 'border-red-200 bg-gradient-to-r from-red-50 to-rose-50'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src={construirUrlImagen(imagenPortada?.ruta)}
                        alt={`Habitación ${hab.numero}`}
                        className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-xl flex-shrink-0"
                        onError={(e) => { e.target.src = 'https://placehold.co/100x100?text=Sin+Imagen'; }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h4 className="font-bold text-gray-900">Habitación {hab.numero}</h4>
                          {verificado && (
                            <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                              disp
                                ? 'bg-green-100 text-green-700 border border-green-200'
                                : 'bg-red-100 text-red-700 border border-red-200'
                            }`}>
                              {disp ? (
                                <>
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                  </svg>
                                  Disponible
                                </>
                              ) : (
                                <>
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                  No disponible
                                </>
                              )}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 mb-1">{hab.tipo.nombre}</p>
                        {precio && (
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs text-gray-400 line-through">Bs. {precio.precio_base}/noche</span>
                            <span className="text-sm font-bold text-blue-600">Bs. {precio.precio_por_noche}/noche</span>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-2 flex-shrink-0">
                        {precio && (
                          <div className="text-right">
                            <p className="text-xl font-bold text-blue-700">Bs. {precio.precio_total.toFixed(2)}</p>
                            <p className="text-xs text-gray-400">{precio.noches} {precio.noches === 1 ? 'noche' : 'noches'}</p>
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => eliminarHabitacion(hab.id_habitacion)}
                          className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          title="Eliminar del carrito"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Detalles de ajustes expandibles */}
                    {mostrarDetalles && precio && (
                      <div className="mt-3 pt-3 border-t border-gray-200 bg-white/60 rounded-xl p-3 space-y-1.5">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Ajustes aplicados</p>
                        {Object.entries(precio.ajustes).map(([key, value]) => {
                          if (key === 'total' || value === 0) return null;
                          const labels = {
                            temporada: 'Temporada',
                            dia_semana: 'Día de semana',
                            anticipacion: `Anticipación (${precio.dias_anticipacion} días)`,
                            ocupacion: `Ocupación (${precio.ocupacion_actual}%)`,
                            duracion: 'Duración de estadía',
                            eventos: 'Eventos especiales',
                          };
                          return (
                            <div key={key} className="flex justify-between text-sm">
                              <span className="text-gray-600">• {labels[key]}</span>
                              <span className={`font-semibold ${getAjusteColor(value)}`}>
                                {value > 0 ? '+' : ''}{value}%
                              </span>
                            </div>
                          );
                        })}
                        <div className="flex justify-between text-sm pt-2 border-t border-gray-200">
                          <span className="font-bold text-gray-700">Ajuste total</span>
                          <span className={`font-bold ${getAjusteColor(precio.ajustes.total)}`}>
                            {precio.ajustes.total > 0 ? '+' : ''}{precio.ajustes.total}%
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* ── Alerta habitaciones no disponibles ── */}
          {hayNoDisponible && !cargando && (
            <div className="bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-200 rounded-2xl p-5 flex items-start gap-3 shadow-sm">
              <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <p className="font-bold text-red-900">Habitaciones no disponibles</p>
                <p className="text-sm text-red-700 mt-0.5">
                  Algunas habitaciones no están disponibles para las fechas seleccionadas. Elimínalas del carrito o elige otras fechas.
                </p>
              </div>
            </div>
          )}

          {/* ── Resumen total ── */}
          {preciosDinamicos.length > 0 && !cargando && todasDisponibles && (
            <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-2xl p-6 border-2 border-blue-100 shadow-lg">
              <h3 className="font-bold text-gray-900 text-lg mb-4 flex items-center gap-2">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                Resumen con Precio Inteligente
              </h3>
              <div className="space-y-2.5">
                <div className="flex justify-between text-gray-700">
                  <span>Noches de estancia</span>
                  <span className="font-bold text-gray-900">{noches}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Habitaciones</span>
                  <span className="font-bold text-gray-900">{habitaciones.length}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Huéspedes</span>
                  <span className="font-bold text-gray-900">{cantidadAdultos + cantidadNinos}</span>
                </div>
                <div className="border-t-2 border-blue-200 pt-3 mt-3">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-gray-900 text-lg">Total a pagar</span>
                    <div className="text-right">
                      <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        Bs. {totalGeneral.toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {noches} noches × {habitaciones.length} habitaciones
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Error ── */}
          {error && (
            <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 flex items-start gap-3 shadow-sm">
              <svg className="w-6 h-6 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <p className="font-semibold text-red-900">Error</p>
                <p className="text-sm text-red-700 mt-0.5">{error}</p>
              </div>
            </div>
          )}

          {/* ── Botones ── */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!canSubmit}
              className={`flex-1 px-6 py-4 rounded-xl font-bold transition-all duration-200 transform ${
                canSubmit
                  ? 'bg-gradient-to-r from-blue-600 via-blue-700 to-purple-700 hover:from-blue-700 hover:via-blue-800 hover:to-purple-800 text-white shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98]'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-3">
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Procesando reservas y pago…
                </span>
              ) : !usuario ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  Iniciar sesión y reservar
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Confirmar {habitaciones.length} {habitaciones.length === 1 ? 'reserva' : 'reservas'} y pagar
                  {totalGeneral > 0 && ` · Bs. ${totalGeneral.toFixed(2)}`}
                </span>
              )}
            </button>
          </div>

          {/* Info pago único */}
          {habitaciones.length > 1 && usuario && (
            <p className="text-xs text-gray-400 text-center flex items-center justify-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Se generará un solo cobro con el total de las {habitaciones.length} habitaciones.
            </p>
          )}
        </form>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity:0 } to { opacity:1 } }
        @keyframes slideUp { from { opacity:0; transform:translateY(24px) scale(.97) } to { opacity:1; transform:translateY(0) scale(1) } }
        .animate-fadeIn { animation: fadeIn .2s ease-out }
        .animate-slideUp { animation: slideUp .3s ease-out }
      `}</style>
    </div>
  );
};

export default ModalCarrito;
