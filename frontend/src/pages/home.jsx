import { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { getHabitaciones } from '../services/habitacion';
import HabitacionCard from '../pages/Home/HabitacionCard';
import FiltrosHabitaciones from '../pages/Home/FiltrosHabitaciones';
import ModalReserva from '../pages/Home/ModalReserva';
import ModalCarrito from '../pages/Home/ModalCarrito';
import BotonCarrito from '../pages/Home/BotonCarrito';

function Home() {
  const { usuario, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [habitaciones, setHabitaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filtros, setFiltros] = useState({});
  const [habitacionSeleccionada, setHabitacionSeleccionada] = useState(null);
  const [mostrarModalReserva, setMostrarModalReserva] = useState(false);
  const [mostrarModalCarrito, setMostrarModalCarrito] = useState(false);
  const [menuMovilAbierto, setMenuMovilAbierto] = useState(false);
  const [menuUsuarioAbierto, setMenuUsuarioAbierto] = useState(false);

  // Determinar tipo de usuario
  const esCliente = usuario?.tipo === 'cliente';
  const esUsuarioSistema = usuario && !esCliente;

  useEffect(() => {
    cargarHabitaciones();
  }, []);

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
      <nav className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur-md animate-fade-up">
        <div className="mx-auto flex h-16 sm:h-18 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex min-w-0 items-center gap-2 sm:gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 shadow-md sm:h-11 sm:w-11">
              <span className="text-xl sm:text-2xl">🏨</span>
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-black tracking-wide text-slate-900 sm:text-base">
                HOSTAL <span className="text-amber-500">SURI</span>
              </p>
              <p className="hidden text-xs text-slate-500 sm:block">Reserva inteligente</p>
            </div>
          </Link>

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
                  <span>👤</span>
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

                    <Link to="/mis-reservas" className="flex items-center gap-2 px-4 py-3 text-sm text-slate-700 hover:bg-blue-50" onClick={cerrarMenus}>
                      <span>📋</span>
                      Mis Reservas
                    </Link>
                    <Link to="/mi-perfil" className="flex items-center gap-2 px-4 py-3 text-sm text-slate-700 hover:bg-blue-50" onClick={cerrarMenus}>
                      <span>⚙️</span>
                      Mi Perfil
                    </Link>
                    <button onClick={handleCerrarSesion} className="flex w-full items-center gap-2 border-t border-slate-100 px-4 py-3 text-left text-sm font-medium text-red-600 hover:bg-red-50">
                      <span>🚪</span>
                      Cerrar Sesión
                    </button>
                  </div>
                )}
              </div>
            )}

            {!usuario && (
              <Link
                to="/login-cliente"
                className="rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:shadow-lg hover:-translate-y-0.5"
              >
                Iniciar Sesión
              </Link>
            )}
          </div>

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

        {menuMovilAbierto && (
          <div className="border-t border-slate-200 px-4 py-4 md:hidden">
            <div className="mx-auto flex max-w-7xl flex-col gap-2">
              {esCliente && (
                <>
                  <div className="rounded-xl bg-blue-50 px-3 py-2">
                    <p className="text-sm font-semibold text-slate-900">{usuario.nombre} {usuario.apellido}</p>
                    <p className="truncate text-xs text-slate-500">{usuario.correo}</p>
                  </div>
                  <Link to="/mis-reservas" className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-blue-50" onClick={cerrarMenus}>📋 Mis Reservas</Link>
                  <Link to="/mi-perfil" className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-blue-50" onClick={cerrarMenus}>⚙️ Mi Perfil</Link>
                  <button onClick={handleCerrarSesion} className="rounded-lg px-3 py-2.5 text-left text-sm font-medium text-red-600 hover:bg-red-50">🚪 Cerrar Sesión</button>
                </>
              )}

              {esUsuarioSistema && (
                <Link to="/sistema" className="rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3 text-center text-sm font-semibold text-white" onClick={cerrarMenus}>
                  Ir al Sistema
                </Link>
              )}

              {!usuario && (
                <Link to="/login-cliente" className="rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3 text-center text-sm font-semibold text-white" onClick={cerrarMenus}>
                  Iniciar Sesión
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>

      <header className="relative overflow-hidden bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-900 text-white">
        <div className="absolute inset-0 opacity-25">
          <div className="absolute -left-16 -top-20 h-72 w-72 rounded-full bg-cyan-300 blur-3xl animate-soft-float" />
          <div className="absolute -bottom-20 -right-10 h-80 w-80 rounded-full bg-purple-400 blur-3xl animate-soft-float" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-5 lg:gap-10">
            <div className="lg:col-span-3">
              <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-3 py-1 text-xs font-medium text-blue-100 sm:text-sm animate-fade-up-delay-1">
                ✨ Bienvenido a Hostal Suri
              </p>
              <h1 className="text-3xl font-extrabold leading-tight sm:text-5xl lg:text-6xl animate-fade-up-delay-2">
                Descansa cómodo en el corazón de la ciudad
              </h1>
              <p className="mt-4 max-w-2xl text-sm text-blue-100 sm:text-lg animate-fade-up-delay-3">
                Habitaciones modernas, atención cálida y reservas rápidas con filtros inteligentes y tour virtual 360°.
              </p>

              <div className="mt-6 flex flex-wrap gap-2.5 animate-fade-up-delay-3">
                <span className="rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-xs sm:text-sm">📶 WiFi rápido</span>
                <span className="rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-xs sm:text-sm">🛎️ Atención 24/7</span>
                <span className="rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-xs sm:text-sm">🧹 Habitaciones impecables</span>
                <span className="rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-xs sm:text-sm">📍 Excelente ubicación</span>
              </div>

              <div className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
                <div className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur animate-fade-up-delay-1">
                  <p className="text-xs uppercase tracking-wide text-blue-200">Resultados</p>
                  <p className="mt-1 text-2xl font-bold">{totalHabitaciones}</p>
                </div>
                <div className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur animate-fade-up-delay-2">
                  <p className="text-xs uppercase tracking-wide text-blue-200">Disponibles</p>
                  <p className="mt-1 text-2xl font-bold">{habitacionesDisponibles}</p>
                </div>
                <div className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur animate-fade-up-delay-3">
                  <p className="text-xs uppercase tracking-wide text-blue-200">Tour Virtual 360°</p>
                  <p className="mt-1 text-2xl font-bold">{habitacionesConTour360}</p>
                </div>
              </div>
            </div>

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
                    <span className="text-lg">✅</span>
                    <span className="text-sm">Confirmación de reserva rápida</span>
                  </div>
                  <div className="flex items-center gap-3 rounded-xl bg-white/10 px-3 py-2.5">
                    <span className="text-lg">🌐</span>
                    <span className="text-sm">Tour virtual 360° para elegir mejor</span>
                  </div>
                  <div className="flex items-center gap-3 rounded-xl bg-white/10 px-3 py-2.5">
                    <span className="text-lg">💳</span>
                    <span className="text-sm">Proceso simple para reservar</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12 animate-fade-up-delay-1">
        <div className="animate-fade-up-delay-1">
          <FiltrosHabitaciones onFiltrar={handleFiltrar} filtrosActivos={filtros} />
        </div>

        {!loading && !error && (
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 animate-fade-up-delay-2">
            <p className="text-sm font-medium text-slate-700 sm:text-base">
              {totalHabitaciones > 0
                ? `Mostrando ${totalHabitaciones} habitación${totalHabitaciones > 1 ? 'es' : ''}`
                : 'No hay habitaciones para los filtros seleccionados'}
            </p>
            {totalHabitaciones > 0 && (
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 sm:text-sm animate-pulse-glow">
                ✓ {habitacionesDisponibles} disponibles ahora
              </span>
            )}
          </div>
        )}

        {loading && (
          <section className="py-16 text-center sm:py-20">
            <div className="mx-auto mb-6 h-16 w-16 animate-spin rounded-full border-4 border-blue-600 border-t-transparent sm:h-20 sm:w-20"></div>
            <p className="text-base font-semibold text-slate-700 sm:text-lg">Cargando habitaciones...</p>
            <p className="mt-2 text-sm text-slate-500">Estamos preparando las mejores opciones para ti.</p>
          </section>
        )}

        {error && (
          <section className="rounded-2xl border-2 border-red-200 bg-red-50 p-6 text-center sm:p-8">
            <div className="mb-3 text-4xl sm:text-5xl">⚠️</div>
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
            <div className="mb-5 text-5xl sm:text-6xl">🔍</div>
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

      <footer className="mt-16 bg-slate-900 py-7 text-white sm:mt-20 sm:py-8">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <div className="mb-3 flex items-center justify-center gap-2">
            <span className="text-xl sm:text-2xl">🏨</span>
            <span className="text-base font-bold sm:text-xl">Hostal Suri</span>
          </div>
          <p className="text-xs text-slate-400 sm:text-sm">&copy; 2025 Hostal Suri. Todos los derechos reservados.</p>
        </div>
      </footer>

      {/* MODAL DE RESERVA INDIVIDUAL */}
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

      {/* MODAL DE CARRITO (RESERVAS MÚLTIPLES) */}
      {mostrarModalCarrito && (
        <ModalCarrito
          onClose={() => setMostrarModalCarrito(false)}
          onSuccess={handleReservaMultipleExitosa}
        />
      )}

      {/* BOTÓN FLOTANTE DEL CARRITO */}
      <BotonCarrito onClick={() => setMostrarModalCarrito(true)} />
    </div>
  );
}

export default Home;