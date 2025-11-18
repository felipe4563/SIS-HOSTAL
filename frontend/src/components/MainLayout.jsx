import { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';
import { Outlet, useLocation, Link } from 'react-router-dom';

const MainLayout = () => {
  const { usuario, logout } = useContext(AuthContext);
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Lista completa de menús
  const menuItems = [
    { name: 'Dashboard', icon: '📊', path: '/dashboard', modulo: 'dashboard' },
    { name: 'Habitaciones', icon: '🏨', path: '/habitaciones', modulo: 'habitacion' },
    { name: 'Reservas', icon: '📅', path: '/reservas', modulo: 'reserva' },
    { name: 'Usuarios', icon: '👥', path: '/usuarios', modulo: 'usuario' },
    { name: 'Clientes', icon: '👨‍👩‍👧‍👦', path: '/clientes', modulo: 'cliente' },
    { name: 'Reportes', icon: '📈', path: '/reportes', modulo: 'reporte' },
    { name: 'Roles', icon: '🔐', path: '/roles', modulo: 'rol' },
  ];

  // Función que revisa si el usuario tiene permisos en el módulo
  const tienePermisoModulo = (modulo) => {
    if (!usuario?.permisos) return false;
    return usuario.permisos.some(permiso => permiso.startsWith(modulo));
  };

  // Filtrar menú según permisos
  const menuFiltrado = menuItems.filter(item => {
    // Dashboard solo si tiene permiso dashboard.ver
    if (item.modulo === 'dashboard') return tienePermisoModulo('dashboard');
    return tienePermisoModulo(item.modulo);
  });

  // Verificar si la ruta está activa
  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  // Mostrar el rol directamente desde el usuario
  const getRolDisplay = () => usuario?.rol || 'usuario';

  // Iniciales del usuario
  const getInitials = () => usuario?.nombre ? usuario.nombre.charAt(0).toUpperCase() : 'U';

  // Título de la página según menú filtrado
  const getPageTitle = () => {
    const currentItem = menuFiltrado.find(item => isActive(item.path));
    return currentItem?.name || '';
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar Desktop */}
      <div className="hidden lg:flex w-64 bg-gradient-to-b from-blue-800 to-blue-900 shadow-xl flex-col">
        {/* Logo */}
        <div className="p-4 sm:p-6 border-b border-blue-700">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white text-lg sm:text-xl font-bold">🏨</span>
            </div>
            <div>
              <div className="flex items-baseline">
                <span className="text-base sm:text-lg font-bold text-white">HOSTAL</span>
                <span className="text-base sm:text-lg font-bold text-amber-400 ml-1">SUR</span>
                <span className="text-base sm:text-lg font-bold text-amber-400 relative">
                  I
                  <span className="absolute -top-2 -right-1 sm:-top-3 sm:-right-2 text-xs">👑</span>
                </span>
              </div>
              <p className="text-blue-200 text-xs mt-1">Sistema de Gestión</p>
            </div>
          </div>
        </div>

        {/* Menú de Navegación */}
        <nav className="p-3 sm:p-4 space-y-1 sm:space-y-2 flex-1">
          {menuFiltrado.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center space-x-2 sm:space-x-3 px-3 sm:px-4 py-2 sm:py-3 rounded-lg transition-all duration-200 ${
                isActive(item.path)
                  ? 'bg-blue-700 text-white shadow-lg'
                  : 'text-blue-100 hover:bg-blue-700 hover:text-white'
              }`}
            >
              <span className="text-base sm:text-lg">{item.icon}</span>
              <span className="font-medium text-sm sm:text-base">{item.name}</span>
            </Link>
          ))}
        </nav>

        {/* Información del Usuario y Logout */}
        <div className="p-3 sm:p-4 border-t border-blue-700 bg-blue-800">
          <div className="flex items-center space-x-2 sm:space-x-3 mb-3 sm:mb-4">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center text-white font-semibold text-sm sm:text-base">
              {getInitials()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs sm:text-sm font-medium truncate">{usuario?.nombre || 'Usuario'}</p>
              <p className="text-blue-200 text-xs capitalize truncate">{getRolDisplay()}</p>
            </div>
          </div>

          <button
            onClick={logout}
            className="w-full flex items-center justify-center space-x-2 sm:space-x-3 bg-red-500 hover:bg-red-600 text-white py-2 sm:py-3 px-3 sm:px-4 rounded-lg font-medium transition-all duration-200 hover:shadow-lg transform hover:-translate-y-0.5 text-sm sm:text-base"
          >
            <span className="text-base sm:text-lg">🚪</span>
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </div>

      {/* Contenido Principal */}
      <div className="flex-1 flex flex-col overflow-hidden w-full min-w-0">
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between px-3 sm:px-4 md:px-6 py-3 sm:py-4">
            <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-4 min-w-0">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-1 sm:p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex-shrink-0"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
                  />
                </svg>
              </button>
              <div className="min-w-0 flex-1">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 truncate">{getPageTitle()}</h2>
                <p className="text-gray-600 text-xs sm:text-sm md:text-base truncate">Sistema de Gestión Hotelera</p>
              </div>
            </div>
            <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-4 flex-shrink-0">
              <div className="lg:hidden flex items-center space-x-1 sm:space-x-2">
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center text-white font-semibold text-xs sm:text-sm">
                  {getInitials()}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Menú móvil */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-white border-b border-gray-200 shadow-lg">
            <div className="px-3 sm:px-4 py-2 sm:py-3 space-y-1">
              {menuFiltrado.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center space-x-2 sm:space-x-3 px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-sm sm:text-base font-medium transition-all duration-200 ${
                    isActive(item.path)
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-500'
                      : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-base sm:text-lg">{item.icon}</span>
                  <span className="flex-1">{item.name}</span>
                </Link>
              ))}
              <button
                onClick={() => {
                  logout();
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center space-x-2 sm:space-x-3 w-full px-3 sm:px-4 py-2 sm:py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors mt-2 sm:mt-4 text-sm sm:text-base"
              >
                <span className="text-base sm:text-lg">🚪</span>
                <span>Cerrar Sesión</span>
              </button>
            </div>
          </div>
        )}

        <main className="flex-1 overflow-y-auto bg-gradient-to-br from-blue-50 to-amber-50 p-3 sm:p-4 md:p-6">
          <div className="max-w-full">
            <Outlet />
          </div>
        </main>

        {/* Footer Móvil */}
        <footer className="lg:hidden bg-white border-t border-gray-200 py-2 px-3 sm:px-4">
          <div className="flex justify-between items-center text-xs text-gray-600">
            <span className="truncate">HOSTAL SURI</span>
            <span className="capitalize truncate ml-2">{getRolDisplay()}</span>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default MainLayout;
