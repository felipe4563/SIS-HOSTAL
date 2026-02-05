import { useState, useEffect, useContext } from 'react';
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* NAVBAR */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrollY > 50 
          ? 'bg-white shadow-lg' 
          : 'bg-white'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                <span className="text-white text-xl font-bold">🏨</span>
              </div>
              <span className="text-lg font-bold text-gray-900">Hostal Suri</span>
            </Link>

            {/* Menu Desktop */}
            <div className="hidden md:flex items-center space-x-4">
              {esUsuarioSistema ? (
                <Link
                  to="/sistema"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-all"
                >
                  Ir al Sistema
                </Link>
              ) : esCliente ? (
                <div className="relative">
                  <button
                    onClick={() => setMenuUsuarioAbierto(!menuUsuarioAbierto)}
                    className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-all"
                  >
                    <span>👤</span>
                    <span>{usuario.nombre}</span>
                    <svg className={`w-4 h-4 transition-transform ${menuUsuarioAbierto ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {menuUsuarioAbierto && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl py-2">
                      <div className="px-4 py-2 border-b">
                        <p className="text-sm font-semibold text-gray-900">{usuario.nombre} {usuario.apellido}</p>
                        <p className="text-xs text-gray-500">{usuario.correo}</p>
                      </div>
                      
                      <Link
                        to="/mis-reservas"
                        className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100"
                        onClick={() => setMenuUsuarioAbierto(false)}
                      >
                        <span className="mr-2">📋</span>
                        Mis Reservas
                      </Link>

                      <Link
                        to="/mi-perfil"
                        className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100"
                        onClick={() => setMenuUsuarioAbierto(false)}
                      >
                        <span className="mr-2">⚙️</span>
                        Mi Perfil
                      </Link>

                      <button
                        onClick={handleCerrarSesion}
                        className="flex items-center w-full px-4 py-2 text-red-600 hover:bg-red-50 border-t"
                      >
                        <span className="mr-2">🚪</span>
                        Cerrar Sesión
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to="/login-cliente"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-all"
                >
                  Iniciar Sesión
                </Link>
              )}
            </div>

            {/* Botón menú móvil */}
            <button
              onClick={() => setMenuMovilAbierto(!menuMovilAbierto)}
              className="md:hidden text-gray-700"
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
            <div className="md:hidden py-4 border-t">
              {esCliente && (
                <div className="px-4 py-2 bg-gray-50 rounded-lg mb-2">
                  <p className="text-sm font-semibold">{usuario.nombre} {usuario.apellido}</p>
                  <p className="text-xs text-gray-500">{usuario.correo}</p>
                </div>
              )}

              {esCliente && (
                <>
                  <Link
                    to="/mis-reservas"
                    className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
                    onClick={() => setMenuMovilAbierto(false)}
                  >
                    <span className="mr-2">📋</span>
                    Mis Reservas
                  </Link>
                  <Link
                    to="/mi-perfil"
                    className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
                    onClick={() => setMenuMovilAbierto(false)}
                  >
                    <span className="mr-2">⚙️</span>
                    Mi Perfil
                  </Link>
                  <button
                    onClick={handleCerrarSesion}
                    className="flex items-center w-full px-4 py-2 text-red-600 hover:bg-red-50 rounded"
                  >
                    <span className="mr-2">🚪</span>
                    Cerrar Sesión
                  </button>
                </>
              )}

              {esUsuarioSistema && (
                <Link
                  to="/sistema"
                  className="block bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold text-center"
                >
                  Ir al Sistema
                </Link>
              )}

              {!usuario && (
                <Link
                  to="/login-cliente"
                  className="block bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold text-center"
                >
                  Iniciar Sesión
                </Link>
              )}
            </div>
          )}
        </div>
      </nav>

      {/* HERO SIMPLE */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Hostal Suri
          </h1>
          <p className="text-xl text-blue-100">
            Encuentra tu habitación ideal
          </p>
        </div>
      </div>

      {/* CATÁLOGO DE HABITACIONES */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Habitaciones Disponibles
        </h2>

        <FiltrosHabitaciones onFiltrar={handleFiltrar} filtrosActivos={filtros} />

        {loading && (
          <div className="text-center py-20">
            <div className="inline-block w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600">Cargando habitaciones...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-700 font-semibold mb-4">{error}</p>
            <button
              onClick={() => cargarHabitaciones(filtros)}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-semibold"
            >
              Reintentar
            </button>
          </div>
        )}

        {!loading && !error && (
          <>
            {habitaciones.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  No se encontraron habitaciones
                </h3>
                <p className="text-gray-600 mb-6">
                  Intenta ajustar los filtros de búsqueda
                </p>
                <button
                  onClick={() => handleFiltrar({})}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold"
                >
                  Limpiar filtros
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* FOOTER SIMPLE */}
      <footer className="bg-gray-900 text-white mt-20">
        <div className="max-w-7xl mx-auto px-4 py-8 text-center">
          <p className="text-gray-400">
            &copy; 2026 Hostal Suri - Cochabamba, Bolivia
          </p>
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