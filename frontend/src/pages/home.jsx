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
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-lg shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-all duration-300">
                <span className="text-white text-2xl font-bold">🏨</span>
              </div>
              <div className="hidden sm:block">
                <div className="flex items-baseline">
                  <span className="text-xl font-bold text-gray-900">HOSTAL</span>
                  <span className="text-xl font-bold text-amber-500 ml-1">SURI</span>
                </div>
              </div>
            </Link>

            {/* Menu Desktop */}
            <div className="hidden md:flex items-center space-x-6">
              {esUsuarioSistema ? (
                <Link
                  to="/sistema"
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-2.5 rounded-xl font-semibold transition-all shadow-md hover:shadow-xl"
                >
                  Ir al Sistema
                </Link>
              ) : esCliente ? (
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
                <Link
                  to="/login-cliente"
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-2.5 rounded-xl font-semibold transition-all shadow-md hover:shadow-xl"
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
                  <>
                    <div className="px-4 py-2 bg-blue-50 rounded-lg">
                      <p className="text-sm font-semibold text-gray-900">{usuario.nombre} {usuario.apellido}</p>
                      <p className="text-xs text-gray-500">{usuario.correo}</p>
                    </div>
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

      {/* HEADER DE HABITACIONES */}
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-4">
            🏨 Nuestras Habitaciones
          </h1>
          <p className="text-lg sm:text-xl text-blue-100 max-w-2xl mx-auto">
            Encuentra la habitación perfecta para tu estadía con tours virtuales 360° y reserva múltiple
          </p>
        </div>
      </div>

      {/* CATÁLOGO DE HABITACIONES */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
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
                {habitaciones.map((habitacion) => (
                  <HabitacionCard
                    key={habitacion.id_habitacion}
                    habitacion={habitacion}
                    onReservar={handleReservar}
                  />
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
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-4 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl"
                >
                  Limpiar filtros
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* FOOTER MINIMALISTA */}
      <footer className="bg-gray-900 text-white mt-20 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <span className="text-2xl">🏨</span>
            <span className="text-xl font-bold">Hostal Suri</span>
          </div>
          <p className="text-gray-400 text-sm">
            &copy; 2025 Hostal Suri. Todos los derechos reservados.
          </p>
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