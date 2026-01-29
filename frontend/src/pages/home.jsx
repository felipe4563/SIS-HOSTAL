import { useState, useEffect, useContext, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { getHabitaciones } from '../services/habitacion';
import HabitacionCard from '../pages/Home/HabitacionCard';
import FiltrosHabitaciones from '../pages/Home/FiltrosHabitaciones';
import ModalReserva from '../pages/Home/ModalReserva';

function Home() {
  const { usuario, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [habitaciones, setHabitaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filtros, setFiltros] = useState({});
  const [habitacionSeleccionada, setHabitacionSeleccionada] = useState(null);
  const [mostrarModalReserva, setMostrarModalReserva] = useState(false);
  const [menuMovilAbierto, setMenuMovilAbierto] = useState(false);
  const [menuUsuarioAbierto, setMenuUsuarioAbierto] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const habitacionesRef = useRef(null);

  // Determinar tipo de usuario
  const esCliente = usuario?.tipo === 'cliente';
  const esUsuarioSistema = usuario && !esCliente;

  useEffect(() => {
    cargarHabitaciones();
    
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
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

  const handleCerrarSesion = () => {
    logout();
    navigate('/');
    setMenuUsuarioAbierto(false);
  };

  const scrollToHabitaciones = () => {
    habitacionesRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-amber-50">
      {/* NAVBAR MEJORADO */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrollY > 50 
          ? 'bg-white/95 backdrop-blur-lg shadow-lg' 
          : 'bg-white/80 backdrop-blur-md'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg ring-2 ring-amber-300/50 group-hover:ring-4 group-hover:scale-110 transition-all duration-300">
                <span className="text-white text-xl sm:text-2xl font-bold">🏨</span>
              </div>
              <div className="hidden sm:block">
                <div className="flex items-baseline">
                  <span className="text-lg font-bold text-gray-900">HOSTAL</span>
                  <span className="text-lg font-bold text-amber-500 ml-1">SUR</span>
                  <span className="text-lg font-bold text-amber-500 relative">
                    I
                    <span className="absolute -top-3 -right-2 text-xs animate-bounce">👑</span>
                  </span>
                </div>
              </div>
            </Link>

            {/* Menu Desktop */}
            <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
              <button
                onClick={scrollToHabitaciones}
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors relative group"
              >
                Habitaciones
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300"></span>
              </button>
              
              <button
                onClick={() => {/* Lógica para scroll a servicios */}}
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors relative group"
              >
                Servicios
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300"></span>
              </button>
              
              <button
                onClick={() => {/* Lógica para scroll a contacto */}}
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors relative group"
              >
                Contacto
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300"></span>
              </button>

              {/* Menú según tipo de usuario */}
              {esUsuarioSistema ? (
                // Usuario del sistema (admin, recepcionista)
                <Link
                  to="/sistema"
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-2.5 rounded-xl font-semibold transition-all shadow-md hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  Ir al Sistema
                </Link>
              ) : esCliente ? (
                // Cliente (huésped)
                <div className="relative">
                  <button
                    onClick={() => setMenuUsuarioAbierto(!menuUsuarioAbierto)}
                    className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2.5 rounded-xl font-semibold transition-all shadow-md hover:shadow-xl"
                  >
                    <span className="text-xl">👤</span>
                    <span className="hidden lg:inline">{usuario.nombre}</span>
                    <svg className={`w-4 h-4 transition-transform ${menuUsuarioAbierto ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Dropdown menu */}
                  {menuUsuarioAbierto && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl py-2 border border-gray-100">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-semibold text-gray-900">{usuario.nombre} {usuario.apellido}</p>
                        <p className="text-xs text-gray-500 truncate">{usuario.correo}</p>
                      </div>
                      
                      <Link
                        to="/mis-reservas"
                        className="flex items-center px-4 py-3 text-gray-700 hover:bg-blue-50 transition-colors"
                        onClick={() => setMenuUsuarioAbierto(false)}
                      >
                        <span className="text-xl mr-3">📋</span>
                        <span className="font-medium">Mis Reservas</span>
                      </Link>

                      <Link
                        to="/mi-perfil"
                        className="flex items-center px-4 py-3 text-gray-700 hover:bg-blue-50 transition-colors"
                        onClick={() => setMenuUsuarioAbierto(false)}
                      >
                        <span className="text-xl mr-3">⚙️</span>
                        <span className="font-medium">Mi Perfil</span>
                      </Link>

                      <button
                        onClick={handleCerrarSesion}
                        className="flex items-center w-full px-4 py-3 text-red-600 hover:bg-red-50 transition-colors border-t border-gray-100"
                      >
                        <span className="text-xl mr-3">🚪</span>
                        <span className="font-medium">Cerrar Sesión</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                // No logueado
                <Link
                  to="/login-cliente"
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-2.5 rounded-xl font-semibold transition-all shadow-md hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  Iniciar Sesión
                </Link>
              )}
            </div>

            {/* Botón menú móvil */}
            <button
              onClick={() => setMenuMovilAbierto(!menuMovilAbierto)}
              className="md:hidden text-gray-700 hover:text-blue-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {menuMovilAbierto ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {/* Menú móvil */}
          {menuMovilAbierto && (
            <div className="md:hidden py-4 border-t border-gray-200">
              <div className="flex flex-col space-y-3">
                {esCliente && (
                  <div className="px-4 py-2 bg-blue-50 rounded-lg">
                    <p className="text-sm font-semibold text-gray-900">{usuario.nombre} {usuario.apellido}</p>
                    <p className="text-xs text-gray-500">{usuario.correo}</p>
                  </div>
                )}

                <button
                  onClick={() => {
                    scrollToHabitaciones();
                    setMenuMovilAbierto(false);
                  }}
                  className="text-gray-700 hover:text-blue-600 font-medium text-left px-2 py-2 hover:bg-blue-50 rounded-lg transition-all"
                >
                  Habitaciones
                </button>

                <button
                  onClick={() => setMenuMovilAbierto(false)}
                  className="text-gray-700 hover:text-blue-600 font-medium text-left px-2 py-2 hover:bg-blue-50 rounded-lg transition-all"
                >
                  Servicios
                </button>

                <button
                  onClick={() => setMenuMovilAbierto(false)}
                  className="text-gray-700 hover:text-blue-600 font-medium text-left px-2 py-2 hover:bg-blue-50 rounded-lg transition-all"
                >
                  Contacto
                </button>

                {esCliente && (
                  <>
                    <Link
                      to="/mis-reservas"
                      className="flex items-center text-gray-700 hover:text-blue-600 font-medium px-2 py-2 hover:bg-blue-50 rounded-lg transition-all"
                      onClick={() => setMenuMovilAbierto(false)}
                    >
                      <span className="mr-2">📋</span>
                      Mis Reservas
                    </Link>
                    <Link
                      to="/mi-perfil"
                      className="flex items-center text-gray-700 hover:text-blue-600 font-medium px-2 py-2 hover:bg-blue-50 rounded-lg transition-all"
                      onClick={() => setMenuMovilAbierto(false)}
                    >
                      <span className="mr-2">⚙️</span>
                      Mi Perfil
                    </Link>
                    <button
                      onClick={handleCerrarSesion}
                      className="flex items-center text-red-600 hover:bg-red-50 font-medium px-2 py-2 rounded-lg transition-all text-left"
                    >
                      <span className="mr-2">🚪</span>
                      Cerrar Sesión
                    </button>
                  </>
                )}

                {esUsuarioSistema && (
                  <Link
                    to="/sistema"
                    className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2.5 rounded-xl font-semibold text-center"
                  >
                    Ir al Sistema
                  </Link>
                )}

                {!usuario && (
                  <Link
                    to="/login-cliente"
                    className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2.5 rounded-xl font-semibold text-center"
                  >
                    Iniciar Sesión
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* HERO SECTION MEJORADO */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white pt-16 sm:pt-20">
        {/* Efectos de fondo animados */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
          <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-amber-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold mb-6 leading-tight">
              Bienvenido a{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400">
                Hostal Suri
              </span>
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-blue-100 mb-12 max-w-3xl mx-auto">
              Descubre nuestras habitaciones con tours virtuales 360° y reserva
              con tarifas dinámicas personalizadas
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6">
              <button
                onClick={scrollToHabitaciones}
                className="group inline-flex items-center justify-center bg-white text-blue-700 px-8 py-4 rounded-2xl text-lg font-bold hover:bg-blue-50 transition-all shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 hover:scale-105"
              >
                <span className="mr-2">🏨</span>
                Ver Habitaciones
              </button>
              <button
                onClick={scrollToHabitaciones}
                className="group inline-flex items-center justify-center bg-gradient-to-r from-amber-500 to-amber-600 text-white px-8 py-4 rounded-2xl text-lg font-bold hover:from-amber-600 hover:to-amber-700 transition-all shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 hover:scale-105"
              >
                <span className="mr-2">🌐</span>
                Tour Virtual 360°
              </button>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <svg className="w-full h-24" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" fill="#f9fafb"></path>
          </svg>
        </div>
      </div>

      {/* CARACTERÍSTICAS MEJORADAS */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">
            ¿Por qué elegirnos?
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-amber-500 mx-auto rounded-full"></div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: '🏨',
              title: 'Habitaciones Modernas',
              description: 'Espacios cómodos y totalmente equipados con todas las comodidades para tu estadía perfecta',
              color: 'from-blue-500 to-blue-600'
            },
            {
              icon: '🌐',
              title: 'Tour Virtual 360°',
              description: 'Explora nuestras instalaciones de forma inmersiva antes de hacer tu reserva',
              color: 'from-purple-500 to-purple-600'
            },
            {
              icon: '💰',
              title: 'Tarifas Dinámicas',
              description: 'Precios inteligentes adaptados a la demanda para ofrecerte las mejores ofertas',
              color: 'from-amber-500 to-amber-600'
            }
          ].map((item, index) => (
            <div
              key={index}
              className="group bg-white p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100"
            >
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${item.color} mb-6 text-3xl transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg`}>
                {item.icon}
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900 group-hover:text-blue-600 transition-colors">
                {item.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* CATÁLOGO DE HABITACIONES */}
      <div ref={habitacionesRef} id="habitaciones" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 scroll-mt-20">
        <div className="text-center mb-12">
          <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-4">
            Nuestras Habitaciones
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Encuentra la habitación perfecta para tu estadía
          </p>
          <div className="w-32 h-1 bg-gradient-to-r from-blue-600 to-amber-500 mx-auto mt-6 rounded-full"></div>
        </div>

        <FiltrosHabitaciones onFiltrar={handleFiltrar} filtrosActivos={filtros} />

        {loading && (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-20 h-20 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-6"></div>
            <p className="text-gray-600 font-medium text-lg">Cargando habitaciones...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8 text-center">
            <div className="text-5xl mb-4">⚠️</div>
            <p className="text-red-700 font-semibold text-lg mb-4">{error}</p>
            <button
              onClick={() => cargarHabitaciones(filtros)}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg"
            >
              Reintentar
            </button>
          </div>
        )}

        {!loading && !error && (
          <>
            {habitaciones.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                {habitaciones.map((habitacion, index) => (
                  <div
                    key={habitacion.id_habitacion}
                  >
                    <HabitacionCard
                      habitacion={habitacion}
                      onReservar={handleReservar}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="text-6xl mb-6">🔍</div>
                <h3 className="text-3xl font-bold text-gray-900 mb-3">
                  No se encontraron habitaciones
                </h3>
                <p className="text-gray-600 mb-8 text-lg">
                  Intenta ajustar los filtros de búsqueda
                </p>
                <button
                  onClick={() => handleFiltrar({})}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-4 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  Limpiar filtros
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* FOOTER MEJORADO */}
      <footer className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="text-xl font-bold mb-4 flex items-center">
                <span className="text-2xl mr-2">🏨</span>
                Hostal Suri
              </h3>
              <p className="text-gray-400">
                Tu mejor opción para hospedaje en Cochabamba
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Contacto</h4>
              <div className="space-y-2 text-gray-400">
                <p>📍 Cochabamba, Bolivia</p>
                <p>📞 +591 4 123 4567</p>
                <p>✉️ info@hostalsuri.com</p>
              </div>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Síguenos</h4>
              <div className="flex space-x-4">
                <a href="#" className="text-2xl hover:text-blue-400 transition-colors">📘</a>
                <a href="#" className="text-2xl hover:text-pink-400 transition-colors">📷</a>
                <a href="#" className="text-2xl hover:text-green-400 transition-colors">💬</a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-700 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Hostal Suri. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>

      {/* MODAL DE RESERVA */}
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
    </div>
  );
}

export default Home;