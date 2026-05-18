import { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';
import { AbilityContext } from '../context/AbilityContext.jsx';
import { Outlet, useLocation, Link } from 'react-router-dom';

/* ── SVG Icon components ── */
const IconDashboard = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
      d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5z
         M14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5z
         M4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4z
         M14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
  </svg>
);

const IconBed = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
      d="M3 20v-5m0 0h18m-18 0v-3a3 3 0 013-3h12a3 3 0 013 3v3
         M7 12V9a2 2 0 012-2h2a2 2 0 012 2v3
         M3 20h18" />
  </svg>
);

const IconTag = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
      d="M7 7h.01M3 5.5V11l9.293 9.293a1 1 0 001.414 0l6.293-6.293a1 1 0 000-1.414L10.707 3.5A1 1 0 0010 3H4.5A1.5 1.5 0 003 4.5v1z" />
  </svg>
);

const IconCalendar = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const IconPerson = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const IconUsers = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857
         M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857
         m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z
         M21 10a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);

const IconShield = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04
         A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622
         0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const IconChart = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2z
         m0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2
         m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const IconBuilding = ({ className = 'w-6 h-6' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0H5m14 0h2M5 21H3
         M9 7h1m4 0h1M9 11h1m4 0h1M9 15h1m4 0h1M10 21v-4h4v4" />
  </svg>
);

const IconCrown = () => (
  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
    <path d="M2 19l2.5-11L9 13l3-9 3 9 4.5-5L22 19H2z" />
  </svg>
);

const IconLogout = ({ className = 'w-5 h-5' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);

const IconHome = ({ className = 'w-5 h-5' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3
         m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

const IconBroom = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
      d="M3 21l6-6m0 0l2-8 7-7-9 9m-2 6l-2-2m2 2l2 2M9 15l-2 2" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
      d="M15 3l2 2-9 9-2-2 9-9z" />
  </svg>
);

/* ─────────────────────────────────────────── */

const MainLayout = () => {
  const { usuario, logout } = useContext(AuthContext);
  const ability = useContext(AbilityContext);
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    { name: 'Dashboard',    icon: <IconDashboard />, path: '/sistema',              action: 'read', subject: 'Dashboard'       },
    { name: 'Habitaciones', icon: <IconBed />,       path: '/sistema/habitaciones', action: 'read', subject: 'Habitacion'      },
    { name: 'Tipos',        icon: <IconTag />,       path: '/sistema/tipos',        action: 'read', subject: 'TipoHabitacion'  },
    { name: 'Reservas',     icon: <IconCalendar />,  path: '/sistema/reservas',     action: 'read', subject: 'Reserva'         },
    { name: 'Clientes',     icon: <IconPerson />,    path: '/sistema/clientes',     action: 'read', subject: 'Cliente'         },
    { name: 'Usuarios',     icon: <IconUsers />,     path: '/sistema/usuarios',     action: 'read', subject: 'Usuario'         },
    { name: 'Roles',        icon: <IconShield />,    path: '/sistema/roles',        action: 'read', subject: 'Role'            },
    { name: 'Reportes',     icon: <IconChart />,     path: '/sistema/reportes',     action: 'read', subject: 'Reporte'         },
    { name: 'Limpieza',     icon: <IconBroom />,     path: '/sistema/limpieza',     action: 'read', subject: 'Limpieza'         },
  ];

  const menuFiltrado = menuItems.filter(item => ability?.can(item.action, item.subject));

  const isActive = (path) => {
    if (path === '/sistema') return location.pathname === '/sistema';
    return location.pathname.startsWith(path);
  };

  const getRolDisplay = () => usuario?.nombre_rol || 'Usuario';
  const getInitials = () => usuario?.nombre ? usuario.nombre.charAt(0).toUpperCase() : 'U';
  const getPageTitle = () => menuFiltrado.find(item => isActive(item.path))?.name || 'Sistema';

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar Desktop */}
      <div className="hidden lg:flex w-64 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 shadow-2xl flex-col">
        {/* Logo */}
        <div className="p-4 sm:p-6 border-b border-blue-700/50 backdrop-blur-sm">
          <Link to="/" className="flex items-center space-x-2 sm:space-x-3 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 rounded-xl flex items-center justify-center shadow-xl ring-2 ring-amber-300/50">
              <IconBuilding className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <div className="flex items-baseline">
                <span className="text-base sm:text-lg font-bold text-white tracking-wide">HOSTAL</span>
                <span className="text-base sm:text-lg font-bold text-amber-400 ml-1 tracking-wide">SUR</span>
                <span className="text-base sm:text-lg font-bold text-amber-400 relative tracking-wide">
                  I
                  <span className="absolute -top-2 -right-2 sm:-top-3 sm:-right-2.5 text-amber-300">
                    <IconCrown />
                  </span>
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
                    : 'text-blue-100 hover:bg-blue-700/70 hover:text-white hover:shadow-md'
                }`}
              >
                <span className="flex-shrink-0 transition-transform duration-300 group-hover:scale-110">
                  {item.icon}
                </span>
                <span className="font-medium text-sm sm:text-base">{item.name}</span>
                {isActive(item.path) && (
                  <div className="ml-auto w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
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
            <IconLogout className="w-4 h-4 sm:w-5 sm:h-5" />
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                </svg>
              </button>
              <div className="min-w-0 flex-1">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-900 to-blue-600 bg-clip-text text-transparent truncate">
                  {getPageTitle()}
                </h2>
                <p className="text-gray-500 text-xs sm:text-sm md:text-base truncate font-medium">Sistema de Gestión Hotelera</p>
              </div>
            </div>
            <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-4 flex-shrink-0">
              <Link
                to="/"
                className="hidden sm:flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-300"
                title="Ir a página principal"
              >
                <IconHome />
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
                      <span className="flex-shrink-0">{item.icon}</span>
                      <span className="flex-1">{item.name}</span>
                      {isActive(item.path) && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                      )}
                    </Link>
                  ))}

                  <Link
                    to="/"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center space-x-2 sm:space-x-3 px-3 sm:px-4 py-2 sm:py-3 rounded-xl text-sm sm:text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 active:bg-gray-100 transition-all duration-300 mt-2"
                  >
                    <IconHome />
                    <span className="flex-1">Página Principal</span>
                  </Link>
                </>
              ) : (
                <div className="text-gray-500 text-sm text-center py-4">
                  No hay módulos disponibles
                </div>
              )}

              <button
                onClick={() => { logout(); setIsMobileMenuOpen(false); }}
                className="flex items-center space-x-2 sm:space-x-3 w-full px-3 sm:px-4 py-2 sm:py-3 text-red-600 hover:bg-red-50 active:bg-red-100 rounded-xl transition-all duration-300 mt-2 sm:mt-4 text-sm sm:text-base font-semibold"
              >
                <IconLogout />
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
              <div className="w-5 h-5 bg-gradient-to-br from-amber-400 to-amber-600 rounded-md flex items-center justify-center shadow-md text-white">
                <IconBuilding className="w-3 h-3" />
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
