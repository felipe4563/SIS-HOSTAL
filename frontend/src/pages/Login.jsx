import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';
import { login } from '../services/auth.js';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [identificador, setIdentificador] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { setUsuario, setToken } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const data = await login(identificador, password);
      setUsuario(data.usuario);
      setToken(data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-amber-50 to-blue-100 flex items-center justify-center p-3 sm:p-4">
      {/* Fondo decorativo */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -right-20 sm:-top-40 sm:-right-40 w-40 h-40 sm:w-80 sm:h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
        <div className="absolute -bottom-20 -left-20 sm:-bottom-40 sm:-left-40 w-40 h-40 sm:w-80 sm:h-80 bg-amber-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 sm:w-60 sm:h-60 bg-yellow-100 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
      </div>

      <div className="relative w-full max-w-xs sm:max-w-sm md:max-w-md">
        {/* Tarjeta principal */}
        <div className="bg-white/90 backdrop-blur-lg rounded-2xl sm:rounded-3xl shadow-xl sm:shadow-2xl border border-white/20 overflow-hidden">
          {/* Header idéntico al sidebar */}
          <div className="bg-gradient-to-b from-blue-800 to-blue-900 px-4 sm:px-6 md:px-8 py-4 sm:py-6 border-b border-blue-700">
            <div className="flex items-center justify-center space-x-2 sm:space-x-3">
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

          {/* Contenido del formulario */}
          <div className="px-4 sm:px-6 md:px-8 py-6 sm:py-8">
            <div className="text-center mb-6 sm:mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Bienvenido</h2>
              <p className="text-gray-600 mt-2 text-sm sm:text-base">Ingrese sus credenciales para continuar</p>
            </div>

            {/* Mensaje de error */}
            {error && (
              <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-2 sm:space-x-3 animate-fade-in">
                <div className="flex-shrink-0">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-red-700 text-xs sm:text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              {/* Campo Identificador */}
              <div>
                <label htmlFor="identificador" className="block text-sm font-medium text-gray-700 mb-2">
                  CI o Correo Electrónico
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <input
                    id="identificador"
                    type="text"
                    value={identificador}
                    onChange={(e) => setIdentificador(e.target.value)}
                    required
                    className="block w-full pl-10 pr-4 py-2 sm:py-3 text-gray-900 placeholder-gray-500 bg-white border border-gray-300 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 group-hover:border-blue-300 text-sm sm:text-base"
                    placeholder="ejemplo@hostalsuri.com"
                  />
                </div>
              </div>

              {/* Campo Contraseña */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Contraseña
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-focus-within:text-amber-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="block w-full pl-10 pr-4 py-2 sm:py-3 text-gray-900 placeholder-gray-500 bg-white border border-gray-300 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 group-hover:border-amber-300 text-sm sm:text-base"
                    placeholder="Ingrese su contraseña"
                  />
                </div>
              </div>

              {/* Botón de envío */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-amber-500 text-white py-3 sm:py-4 px-4 rounded-lg sm:rounded-xl font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 hover:from-blue-700 hover:to-amber-600 hover:shadow-lg transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-sm sm:text-base"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Iniciando sesión...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    <span>Ingresar al Sistema</span>
                  </div>
                )}
              </button>
            </form>

          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-4 sm:mt-6">
          <p className="text-xs sm:text-sm text-gray-600">
            © 2025 <span className="font-semibold">HOSTAL SURI</span>. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;