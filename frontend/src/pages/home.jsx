import { useState, useEffect, useContext, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { getHabitaciones } from '../services/habitacion';
import HabitacionCard from '../pages/Home/HabitacionCard';
import FiltrosHabitaciones from '../pages/Home/FiltrosHabitaciones';
import ModalReserva from '../pages/Home/ModalReserva';
import ModalCarrito from '../pages/Home/ModalCarrito';
import BotonCarrito from '../pages/Home/BotonCarrito';

/* ── Iconos SVG ─────────────────────────────────────────────────────────── */
const ICON_DEFS = {
  building:           ['M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21'],
  userCircle:         ['M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z'],
  clipboardList:      ['M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z'],
  identification:     ['M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Zm6-10.125a1.875 1.875 0 1 1-3.75 0 1.875 1.875 0 0 1 3.75 0Zm1.294 6.336a6.721 6.721 0 0 1-3.17.789 6.721 6.721 0 0 1-3.168-.789 3.376 3.376 0 0 1 6.338 0Z'],
  logout:             ['M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9'],
  sparkles:           ['M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z'],
  wifi:               ['M8.288 15.038a5.25 5.25 0 0 1 7.424 0M5.106 11.856c3.807-3.808 9.98-3.808 13.788 0M1.924 8.674c5.565-5.565 14.587-5.565 20.152 0M12.53 18.22l-.53.53-.53-.53a.75.75 0 0 1 1.06 0Z'],
  bell:               ['M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0'],
  shine:              ['M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z'],
  mapPin:             ['M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z', 'M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z'],
  checkCircle:        ['M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z'],
  globe:              ['M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418'],
  creditCard:         ['M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 21Z'],
  exclamation:        ['M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z'],
  search:             ['m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z'],
};

const SvgIcon = ({ name, className = 'h-5 w-5' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className={className}>
    {(ICON_DEFS[name] || []).map((d, i) => (
      <path key={i} strokeLinecap="round" strokeLinejoin="round" d={d} />
    ))}
  </svg>
);
/* ────────────────────────────────────────────────────────────────────────── */

function Home() {
  const { usuario, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const mapRef = useRef(null);

  const scrollAlMapa = () => {
    mapRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  const [habitaciones, setHabitaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filtros, setFiltros] = useState({});
  const [habitacionSeleccionada, setHabitacionSeleccionada] = useState(null);
  const [mostrarModalReserva, setMostrarModalReserva] = useState(false);
  const [mostrarModalCarrito, setMostrarModalCarrito] = useState(false);
  const [menuMovilAbierto, setMenuMovilAbierto] = useState(false);
  const [menuUsuarioAbierto, setMenuUsuarioAbierto] = useState(false);

  const esCliente = usuario?.tipo === 'cliente';
  const esUsuarioSistema = usuario && !esCliente;

  useEffect(() => {
    cargarHabitaciones();
    if (location.state?.reabrirCarrito || location.state?.completarReserva) {
      setMostrarModalCarrito(true);
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const cargarHabitaciones = async (filtrosAplicados = {}) => {
    setLoading(true);
    setError('');
    try {
      const data = await getHabitaciones(filtrosAplicados);
      setHabitaciones(data);
    } catch (err) {
      setError(err.message || 'Error al cargar habitaciones');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFiltrar = (nuevosFiltros) => {
    setFiltros(nuevosFiltros);
    cargarHabitaciones(nuevosFiltros);
  };

  const handleReservar = (habitacion) => {
    setHabitacionSeleccionada(habitacion);
    setMostrarModalReserva(true);
  };

  const handleReservaExitosa = () => {
    alert('¡Reserva creada exitosamente!');
    cargarHabitaciones(filtros);
  };

  const handleReservaMultipleExitosa = () => {
    cargarHabitaciones(filtros);
  };

  const handleCerrarSesion = () => {
    logout();
    navigate('/');
    setMenuUsuarioAbierto(false);
    setMenuMovilAbierto(false);
  };

  const totalHabitaciones = habitaciones.length;
  const habitacionesDisponibles = habitaciones.filter(
    (habitacion) => habitacion.estado === 'disponible'
  ).length;
  const habitacionesConTour360 = habitaciones.filter(
    (habitacion) => habitacion.imagenes?.some((imagen) => imagen.tipo_imagen === '360')
  ).length;

  const cerrarMenus = () => {
    setMenuMovilAbierto(false);
    setMenuUsuarioAbierto(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 animate-fade-in-soft">
      {/* ── NAV ── */}
      <nav className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur-md animate-fade-up">
        <div className="mx-auto flex h-16 sm:h-18 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex min-w-0 items-center gap-2 sm:gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 shadow-md sm:h-11 sm:w-11">
              <SvgIcon name="building" className="h-6 w-6 text-white" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-black tracking-wide text-slate-900 sm:text-base">
                HOSTAL <span className="text-amber-500">SURI</span>
              </p>
              <p className="hidden text-xs text-slate-500 sm:block">Reserva inteligente</p>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden items-center gap-4 md:flex">
            {esUsuarioSistema && (
              <Link
                to="/sistema"
                className="rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:shadow-lg hover:-translate-y-0.5"
              >
                Ir al Sistema
              </Link>
            )}

            {esCliente && (
              <div className="relative">
                <button
                  onClick={() => setMenuUsuarioAbierto((prev) => !prev)}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:shadow-lg hover:-translate-y-0.5"
                >
                  <SvgIcon name="userCircle" className="h-5 w-5 flex-shrink-0" />
                  <span className="max-w-[140px] truncate">{usuario.nombre}</span>
                  <svg className={`h-4 w-4 transition-transform ${menuUsuarioAbierto ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {menuUsuarioAbierto && (
                  <div className="absolute right-0 mt-2 w-60 overflow-hidden rounded-xl border border-slate-100 bg-white shadow-2xl">
                    <div className="border-b border-slate-100 px-4 py-3">
                      <p className="text-sm font-semibold text-slate-900">{usuario.nombre} {usuario.apellido}</p>
                      <p className="truncate text-xs text-slate-500">{usuario.correo}</p>
                    </div>

                    <Link to="/mis-reservas" className="flex items-center gap-2.5 px-4 py-3 text-sm text-slate-700 hover:bg-blue-50" onClick={cerrarMenus}>
                      <SvgIcon name="clipboardList" className="h-4 w-4 flex-shrink-0 text-slate-400" />
                      Mis Reservas
                    </Link>
                    <Link to="/mi-perfil" className="flex items-center gap-2.5 px-4 py-3 text-sm text-slate-700 hover:bg-blue-50" onClick={cerrarMenus}>
                      <SvgIcon name="identification" className="h-4 w-4 flex-shrink-0 text-slate-400" />
                      Mi Perfil
                    </Link>
                    <button onClick={handleCerrarSesion} className="flex w-full items-center gap-2.5 border-t border-slate-100 px-4 py-3 text-left text-sm font-medium text-red-600 hover:bg-red-50">
                      <SvgIcon name="logout" className="h-4 w-4 flex-shrink-0" />
                      Cerrar Sesión
                    </button>
                  </div>
                )}
              </div>
            )}

            {!usuario && (
              <Link
                to="/login"
                className="rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:shadow-lg hover:-translate-y-0.5"
              >
                Iniciar Sesión
              </Link>
            )}
          </div>

          {/* Hamburger */}
          <button
            onClick={() => setMenuMovilAbierto((prev) => !prev)}
            className="rounded-lg p-2 text-slate-700 md:hidden"
            aria-label={menuMovilAbierto ? 'Cerrar menú' : 'Abrir menú'}
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuMovilAbierto ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {menuMovilAbierto && (
          <div className="border-t border-slate-200 px-4 py-4 md:hidden">
            <div className="mx-auto flex max-w-7xl flex-col gap-2">
              {esCliente && (
                <>
                  <div className="rounded-xl bg-blue-50 px-3 py-2">
                    <p className="text-sm font-semibold text-slate-900">{usuario.nombre} {usuario.apellido}</p>
                    <p className="truncate text-xs text-slate-500">{usuario.correo}</p>
                  </div>
                  <Link to="/mis-reservas" className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-blue-50" onClick={cerrarMenus}>
                    <SvgIcon name="clipboardList" className="h-4 w-4 flex-shrink-0 text-slate-400" />
                    Mis Reservas
                  </Link>
                  <Link to="/mi-perfil" className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-blue-50" onClick={cerrarMenus}>
                    <SvgIcon name="identification" className="h-4 w-4 flex-shrink-0 text-slate-400" />
                    Mi Perfil
                  </Link>
                  <button onClick={handleCerrarSesion} className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-red-600 hover:bg-red-50">
                    <SvgIcon name="logout" className="h-4 w-4 flex-shrink-0" />
                    Cerrar Sesión
                  </button>
                </>
              )}

              {esUsuarioSistema && (
                <Link to="/sistema" className="rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3 text-center text-sm font-semibold text-white" onClick={cerrarMenus}>
                  Ir al Sistema
                </Link>
              )}

              {!usuario && (
                <Link to="/login" className="rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3 text-center text-sm font-semibold text-white" onClick={cerrarMenus}>
                  Iniciar Sesión
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* ── HERO ── */}
      <header className="relative overflow-hidden bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-900 text-white">
        <div className="absolute inset-0 opacity-25">
          <div className="absolute -left-16 -top-20 h-72 w-72 rounded-full bg-cyan-300 blur-3xl animate-soft-float" />
          <div className="absolute -bottom-20 -right-10 h-80 w-80 rounded-full bg-purple-400 blur-3xl animate-soft-float" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-5 lg:gap-10">
            <div className="lg:col-span-3">
              <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-3 py-1 text-xs font-medium text-blue-100 sm:text-sm animate-fade-up-delay-1">
                <SvgIcon name="sparkles" className="h-3.5 w-3.5 flex-shrink-0" />
                Bienvenido a Hostal Suri
              </p>
              <h1 className="text-3xl font-extrabold leading-tight sm:text-5xl lg:text-6xl animate-fade-up-delay-2">
                Descansa cómodo en el corazón de la ciudad
              </h1>
              <p className="mt-4 max-w-2xl text-sm text-blue-100 sm:text-lg animate-fade-up-delay-3">
                Habitaciones modernas, atención cálida y reservas rápidas con filtros inteligentes y tour virtual 360°.
              </p>

              {/* Chips */}
              <div className="mt-6 flex flex-wrap gap-2.5 animate-fade-up-delay-3">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-xs sm:text-sm">
                  <SvgIcon name="wifi" className="h-3.5 w-3.5 flex-shrink-0" />
                  WiFi rápido
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-xs sm:text-sm">
                  <SvgIcon name="bell" className="h-3.5 w-3.5 flex-shrink-0" />
                  Atención 24/7
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-xs sm:text-sm">
                  <SvgIcon name="shine" className="h-3.5 w-3.5 flex-shrink-0" />
                  Habitaciones impecables
                </span>
                <button
                  type="button"
                  onClick={scrollAlMapa}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-xs sm:text-sm hover:bg-white/20 transition-colors cursor-pointer"
                >
                  <SvgIcon name="mapPin" className="h-3.5 w-3.5 flex-shrink-0" />
                  Excelente ubicación
                </button>
              </div>

              {/* Stats mini */}
              <div className="mt-7 grid grid-cols-2 gap-3 sm:gap-4">
                <div className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur animate-fade-up-delay-2">
                  <p className="text-xs uppercase tracking-wide text-blue-200">Disponibles ahora</p>
                  <p className="mt-1 text-2xl font-bold">{habitacionesDisponibles}</p>
                </div>
                <div className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur animate-fade-up-delay-3">
                  <p className="text-xs uppercase tracking-wide text-blue-200">Tour Virtual 360°</p>
                  <p className="mt-1 text-2xl font-bold">{habitacionesConTour360}</p>
                </div>
              </div>
            </div>

            {/* Info card */}
            <div className="lg:col-span-2">
              <div className="h-full rounded-3xl border border-white/20 bg-white/10 p-5 sm:p-6 backdrop-blur-md shadow-2xl animate-fade-up-delay-2">
                <p className="text-xs uppercase tracking-wider text-cyan-200 font-semibold">Experiencia Suri</p>
                <h3 className="mt-2 text-2xl sm:text-3xl font-black leading-tight">
                  Tu estadía empieza con una gran primera impresión
                </h3>
                <p className="mt-3 text-sm sm:text-base text-blue-100/95">
                  Revisa disponibilidad en tiempo real, compara tipos de habitación y reserva al instante desde cualquier dispositivo.
                </p>

                <div className="mt-5 space-y-3">
                  <div className="flex items-center gap-3 rounded-xl bg-white/10 px-3 py-2.5">
                    <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-white/20">
                      <SvgIcon name="checkCircle" className="h-4 w-4" />
                    </span>
                    <span className="text-sm">Confirmación de reserva rápida</span>
                  </div>
                  <div className="flex items-center gap-3 rounded-xl bg-white/10 px-3 py-2.5">
                    <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-white/20">
                      <SvgIcon name="globe" className="h-4 w-4" />
                    </span>
                    <span className="text-sm">Tour virtual 360° para elegir mejor</span>
                  </div>
                  <div className="flex items-center gap-3 rounded-xl bg-white/10 px-3 py-2.5">
                    <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-white/20">
                      <SvgIcon name="creditCard" className="h-4 w-4" />
                    </span>
                    <span className="text-sm">Proceso simple para reservar</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ── LISTADO ── */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12 animate-fade-up-delay-1">
        <div className="animate-fade-up-delay-1">
          <FiltrosHabitaciones onFiltrar={handleFiltrar} filtrosActivos={filtros} />
        </div>

        {!loading && !error && totalHabitaciones > 0 && (
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 animate-fade-up-delay-2">
            <p className="text-sm font-medium text-slate-600 sm:text-base">
              {totalHabitaciones} habitación{totalHabitaciones > 1 ? 'es' : ''} encontrada{totalHabitaciones > 1 ? 's' : ''}
            </p>
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 sm:text-sm">
              ✓ {habitacionesDisponibles} disponible{habitacionesDisponibles !== 1 ? 's' : ''}
            </span>
          </div>
        )}

        {loading && (
          <section className="py-16 text-center sm:py-20">
            <div className="mx-auto mb-6 h-16 w-16 animate-spin rounded-full border-4 border-blue-600 border-t-transparent sm:h-20 sm:w-20" />
            <p className="text-base font-semibold text-slate-700 sm:text-lg">Cargando habitaciones...</p>
            <p className="mt-2 text-sm text-slate-500">Estamos preparando las mejores opciones para ti.</p>
          </section>
        )}

        {error && (
          <section className="rounded-2xl border-2 border-red-200 bg-red-50 p-6 text-center sm:p-8">
            <div className="mb-4 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                <SvgIcon name="exclamation" className="h-8 w-8 text-red-500" />
              </div>
            </div>
            <p className="mb-4 text-base font-semibold text-red-700 sm:text-lg">{error}</p>
            <button
              onClick={() => cargarHabitaciones(filtros)}
              className="rounded-xl bg-red-600 px-6 py-3 font-semibold text-white transition hover:bg-red-700"
            >
              Reintentar
            </button>
          </section>
        )}

        {!loading && !error && totalHabitaciones > 0 && (
          <section className="grid grid-cols-1 gap-5 sm:gap-6 md:grid-cols-2 xl:grid-cols-3 xl:gap-7 animate-fade-up-delay-2">
            {habitaciones.map((habitacion) => (
              <HabitacionCard
                key={habitacion.id_habitacion}
                habitacion={habitacion}
                onReservar={handleReservar}
              />
            ))}
          </section>
        )}

        {!loading && !error && totalHabitaciones === 0 && (
          <section className="rounded-3xl border border-slate-100 bg-white px-4 py-14 text-center shadow-sm sm:px-8 sm:py-20 animate-fade-up-delay-2">
            <div className="mb-5 flex justify-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-100">
                <SvgIcon name="search" className="h-10 w-10 text-slate-400" />
              </div>
            </div>
            <h3 className="mb-3 text-2xl font-bold text-slate-900 sm:text-3xl">No se encontraron habitaciones</h3>
            <p className="mx-auto mb-8 max-w-xl text-sm text-slate-600 sm:text-base">
              Ajusta los filtros para ver más resultados o limpia la búsqueda actual.
            </p>
            <button
              onClick={() => handleFiltrar({})}
              className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-7 py-3.5 font-semibold text-white transition hover:shadow-lg sm:w-auto"
            >
              Limpiar filtros
            </button>
          </section>
        )}
      </main>

      {/* ── UBICACIÓN ── */}
      <section ref={mapRef} className="mt-16 sm:mt-20 scroll-mt-4">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-col items-center text-center">
            <span className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-blue-600">
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Cómo llegar
            </span>
            <h2 className="text-2xl font-extrabold text-slate-900 sm:text-3xl lg:text-4xl">
              Estamos en el corazón de <span className="text-amber-500">Cochabamba</span>
            </h2>
            <p className="mt-3 max-w-xl text-sm text-slate-500 sm:text-base">
              Ubicación privilegiada, a minutos del centro. Fácil acceso en transporte público o vehículo propio.
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl lg:grid lg:grid-cols-5">

            {/* Panel izquierdo */}
            <div className="flex flex-col justify-between bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-900 p-7 text-white sm:p-10 lg:col-span-2">
              <div>
                <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-400/20 ring-1 ring-amber-400/40">
                  <SvgIcon name="building" className="h-8 w-8 text-amber-400" />
                </div>
                <h3 className="text-2xl font-black sm:text-3xl">Hostal Suri</h3>
                <p className="mt-1 text-sm font-medium text-blue-300">Cochabamba, Bolivia</p>
              </div>

              <div className="my-8 space-y-5">
                <InfoRow
                  icon={
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  }
                  title="Dirección"
                  text="Cochabamba, Bolivia"
                />
                <InfoRow
                  icon={
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  }
                  title="Atención"
                  text="Lunes a Domingo · 24 horas"
                />
                <InfoRow
                  icon={
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                  }
                  title="Coordenadas"
                  text="-17.4018° S, -66.1560° O"
                />
              </div>

              <a
                href="https://maps.app.goo.gl/MAWGs7k6Sp4U2xhy6"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-center gap-3 rounded-2xl bg-amber-400 px-6 py-4 font-bold text-slate-900 shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:bg-amber-300 hover:shadow-xl"
              >
                <svg className="h-5 w-5 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                Abrir en Google Maps
                <svg className="h-4 w-4 opacity-60 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>

              <div className="mt-5 flex flex-wrap gap-2">
                {['Zona céntrica', 'Transporte cercano', 'Fácil acceso'].map((chip) => (
                  <span key={chip} className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-blue-100">
                    {chip}
                  </span>
                ))}
              </div>
            </div>

            {/* Mapa */}
            <div className="relative lg:col-span-3">
              <div className="absolute left-4 top-4 z-10 flex items-center gap-2 rounded-xl border border-white/60 bg-white/90 px-3 py-2 shadow-lg backdrop-blur-sm">
                <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-200" />
                <span className="text-xs font-semibold text-slate-800">Hostal Suri</span>
              </div>

              <iframe
                title="Ubicación Hostal Suri"
                src="https://maps.google.com/maps?q=-17.4017855,-66.1559826&z=17&output=embed"
                className="h-72 w-full sm:h-96 lg:h-full"
                style={{ minHeight: '400px', border: 0 }}
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="mt-12 bg-slate-900 py-7 text-white sm:mt-14 sm:py-8">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <div className="mb-3 flex items-center justify-center gap-2">
            <SvgIcon name="building" className="h-6 w-6 text-amber-400" />
            <span className="text-base font-bold sm:text-xl">Hostal Suri</span>
          </div>
          <p className="text-xs text-slate-400 sm:text-sm">&copy; 2026 Hostal Suri. Todos los derechos reservados.</p>
        </div>
      </footer>

      {mostrarModalReserva && habitacionSeleccionada && (
        <ModalReserva
          habitacion={habitacionSeleccionada}
          onClose={() => {
            setMostrarModalReserva(false);
            setHabitacionSeleccionada(null);
          }}
          onSuccess={handleReservaExitosa}
        />
      )}

      {mostrarModalCarrito && (
        <ModalCarrito
          onClose={() => setMostrarModalCarrito(false)}
          onSuccess={handleReservaMultipleExitosa}
        />
      )}

      <BotonCarrito onClick={() => setMostrarModalCarrito(true)} />
    </div>
  );
}

function InfoRow({ icon, title, text }) {
  return (
    <div className="flex items-start gap-3.5">
      <div className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-white/10 text-blue-300">
        {icon}
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-blue-400">{title}</p>
        <p className="mt-0.5 text-sm font-medium text-white/90">{text}</p>
      </div>
    </div>
  );
}

export default Home;
