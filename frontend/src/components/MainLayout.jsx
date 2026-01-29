import { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';
import { AbilityContext } from '../context/AbilityContext.jsx';
import { Outlet, useLocation, Link } from 'react-router-dom';

const MainLayout = () => {
  const { usuario, logout } = useContext(AuthContext);
  const ability = useContext(AbilityContext);
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // 👇 CORREGIDO: Rutas actualizadas a /sistema/*
  const menuItems = [
  { 
    name: 'Dashboard', 
    icon: '📊', 
    path: '/sistema',
    action: 'read', 
    subject: 'Dashboard' 
  },
  { 
    name: 'Habitaciones', 
    icon: '🏨', 
    path: '/sistema/habitaciones',
    action: 'read', 
    subject: 'Habitacion' 
  },
  { 
    name: 'Tipos', 
    icon: '🏷️', 
    path: '/sistema/tipos',
    action: 'read', 
    subject: 'TipoHabitacion' 
  },
  { 
    name: 'Reservas', 
    icon: '📅', 
    path: '/sistema/reservas',
    action: 'read', 
    subject: 'Reserva' 
  },
  { 
    name: 'Clientes', 
    icon: '👨‍👩‍👧‍👦', 
    path: '/sistema/clientes',
    action: 'read', 
    subject: 'Cliente' 
  },
  { 
    name: 'Usuarios', 
    icon: '👥', 
    path: '/sistema/usuarios',
    action: 'read', 
    subject: 'Usuario' 
  },
  { 
    name: 'Roles', 
    icon: '🔐', 
    path: '/sistema/roles',
    action: 'read', 
    subject: 'Role' 
  },
  { 
    name: 'Reportes', 
    icon: '📈', 
    path: '/sistema/reportes',
    action: 'read', 
    subject: 'Reporte' 
  },
];

  // 👇 USAR CASL en lugar de permisos string
  const menuFiltrado = menuItems.filter(item => {
    if (!ability) return false;
    return ability.can(item.action, item.subject);
  });

  // 👇 CORREGIR isActive para manejar /sistema correctamente
  const isActive = (path) => {
    if (path === '/sistema') {
      return location.pathname === '/sistema';
    }
    return location.pathname.startsWith(path);
  };

  // Mostrar el rol directamente desde el usuario
  const getRolDisplay = () => usuario?.nombre_rol || 'Usuario';

  // Iniciales del usuario
  const getInitials = () => {
    if (usuario?.nombre) {
      return usuario.nombre.charAt(0).toUpperCase();
    }
    return 'U';
  };

  // Título de la página según menú filtrado
  const getPageTitle = () => {
    const currentItem = menuFiltrado.find(item => isActive(item.path));
    return currentItem?.name || 'Sistema';
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar Desktop */}
      <div className="hidden lg:flex w-64 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 shadow-2xl flex-col">
        {/* Logo */}
        <div className="p-4 sm:p-6 border-b border-blue-700/50 backdrop-blur-sm">
          <Link to="/" className="flex items-center space-x-2 sm:space-x-3 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 rounded-xl flex items-center justify-center shadow-xl ring-2 ring-amber-300/50">
              <span className="text-white text-lg sm:text-xl font-bold">🏨</span>
            </div>
            <div>
              <div className="flex items-baseline">
                <span className="text-base sm:text-lg font-bold text-white tracking-wide">HOSTAL</span>
                <span className="text-base sm:text-lg font-bold text-amber-400 ml-1 tracking-wide">SUR</span>
                <span className="text-base sm:text-lg font-bold text-amber-400 relative tracking-wide">
                  I
                  <span className="absolute -top-2 -right-1 sm:-top-3 sm:-right-2 text-xs">👑</span>
                </span>
              </div>
              <p className="text-blue-300 text-xs mt-1 font-medium">Sistema de Gestión</p>
            </div>
          </Link>
        </div>

        {/* Menú de Navegación */}
        <nav className="p-3 sm:p-4 space-y-1 sm:space-y-2 flex-1 overflow-y-auto">
          {menuFiltrado.length > 0 ? (
            menuFiltrado.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center space-x-2 sm:space-x-3 px-3 sm:px-4 py-2 sm:py-3 rounded-xl transition-all duration-300 group ${
                  isActive(item.path)
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-900/50 scale-105'
                    : 'text-blue-100 hover:bg-blue-700/70 hover:text-white hover:shadow-md hover:scale-102'
                }`}
              >
                <span className="text-base sm:text-lg transition-transform duration-300 group-hover:scale-110">{item.icon}</span>
                <span className="font-medium text-sm sm:text-base">{item.name}</span>
                {isActive(item.path) && (
                  <div className="ml-auto w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
                )}
              </Link>
            ))
          ) : (
            <div className="text-blue-300 text-sm text-center py-4">
              No hay módulos disponibles
            </div>
          )}
        </nav>

        {/* Información del Usuario y Logout */}
        <div className="p-3 sm:p-4 border-t border-blue-700/50 bg-blue-900/50 backdrop-blur-sm">
          <div className="flex items-center space-x-2 sm:space-x-3 mb-3 sm:mb-4 p-2 rounded-xl bg-blue-800/40">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 rounded-full flex items-center justify-center text-white font-semibold text-sm sm:text-base shadow-lg ring-2 ring-amber-300/30">
              {getInitials()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs sm:text-sm font-semibold truncate">{usuario?.nombre || 'Usuario'}</p>
              <p className="text-blue-300 text-xs capitalize truncate font-medium">{getRolDisplay()}</p>
            </div>
          </div>

          <button
            onClick={logout}
            className="w-full flex items-center justify-center space-x-2 sm:space-x-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white py-2 sm:py-3 px-3 sm:px-4 rounded-xl font-semibold transition-all duration-300 hover:shadow-xl hover:shadow-red-900/50 transform hover:-translate-y-1 active:translate-y-0 text-sm sm:text-base"
          >
            <span className="text-base sm:text-lg">🚪</span>
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </div>

      {/* Contenido Principal */}
      <div className="flex-1 flex flex-col overflow-hidden w-full min-w-0">
        <header className="bg-white/90 backdrop-blur-md shadow-lg border-b border-gray-200/50">
          <div className="flex items-center justify-between px-3 sm:px-4 md:px-6 py-3 sm:py-4">
            <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-4 min-w-0">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-1 sm:p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-300 flex-shrink-0 active:scale-95"
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
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-900 to-blue-600 bg-clip-text text-transparent truncate">{getPageTitle()}</h2>
                <p className="text-gray-500 text-xs sm:text-sm md:text-base truncate font-medium">Sistema de Gestión Hotelera</p>
              </div>
            </div>
            <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-4 flex-shrink-0">
              {/* Botón para volver al home */}
              <Link
                to="/"
                className="hidden sm:flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-300"
                title="Ir a página principal"
              >
                <span className="text-lg">🏠</span>
                <span className="text-sm font-medium hidden md:inline">Inicio</span>
              </Link>

              <div className="lg:hidden flex items-center space-x-1 sm:space-x-2">
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 rounded-full flex items-center justify-center text-white font-semibold text-xs sm:text-sm shadow-lg ring-2 ring-amber-300/30">
                  {getInitials()}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Menú móvil */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-xl">
            <div className="px-3 sm:px-4 py-2 sm:py-3 space-y-1">
              {menuFiltrado.length > 0 ? (
                <>
                  {menuFiltrado.map((item) => (
                    <Link
                      key={item.name}
                      to={item.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center space-x-2 sm:space-x-3 px-3 sm:px-4 py-2 sm:py-3 rounded-xl text-sm sm:text-base font-medium transition-all duration-300 ${
                        isActive(item.path)
                          ? 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border-l-4 border-blue-500 shadow-md'
                          : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50 active:bg-gray-100'
                      }`}
                    >
                      <span className="text-base sm:text-lg">{item.icon}</span>
                      <span className="flex-1">{item.name}</span>
                      {isActive(item.path) && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                      )}
                    </Link>
                  ))}

                  {/* Botón Inicio móvil */}
                  <Link
                    to="/"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center space-x-2 sm:space-x-3 px-3 sm:px-4 py-2 sm:py-3 rounded-xl text-sm sm:text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 active:bg-gray-100 transition-all duration-300 mt-2"
                  >
                    <span className="text-base sm:text-lg">🏠</span>
                    <span className="flex-1">Página Principal</span>
                  </Link>
                </>
              ) : (
                <div className="text-gray-500 text-sm text-center py-4">
                  No hay módulos disponibles
                </div>
              )}

              <button
                onClick={() => {
                  logout();
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center space-x-2 sm:space-x-3 w-full px-3 sm:px-4 py-2 sm:py-3 text-red-600 hover:bg-red-50 active:bg-red-100 rounded-xl transition-all duration-300 mt-2 sm:mt-4 text-sm sm:text-base font-semibold"
              >
                <span className="text-base sm:text-lg">🚪</span>
                <span>Cerrar Sesión</span>
              </button>
            </div>
          </div>
        )}

        <main className="flex-1 overflow-y-auto bg-gradient-to-br from-blue-50 via-gray-50 to-amber-50 p-3 sm:p-4 md:p-6">
          <div className="max-w-full">
            <Outlet />
          </div>
        </main>

        {/* Footer Móvil */}
        <footer className="lg:hidden bg-white/90 backdrop-blur-md border-t border-gray-200/50 py-2 px-3 sm:px-4 shadow-lg">
          <div className="flex justify-between items-center text-xs">
            <div className="flex items-center space-x-1.5">
              <div className="w-5 h-5 bg-gradient-to-br from-amber-400 to-amber-600 rounded-md flex items-center justify-center shadow-md">
                <span className="text-white text-xs">🏨</span>
              </div>
              <span className="font-bold text-gray-700">HOSTAL SURI</span>
            </div>
            <span className="text-gray-600 capitalize truncate ml-2 font-medium">{getRolDisplay()}</span>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default MainLayout;