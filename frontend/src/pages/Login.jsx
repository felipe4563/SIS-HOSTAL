import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';
import { login as loginService } from '../services/auth.js';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [identificador, setIdentificador] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  // LOGIN NORMAL
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const data = await loginService(identificador, password);
      login(data);
      navigate('/sistema');
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-amber-50 to-blue-100 flex items-center justify-center p-3 sm:p-4">
      {/* Fondo decorativo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 sm:-top-40 sm:-right-40 w-40 h-40 sm:w-80 sm:h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
        <div className="absolute -bottom-20 -left-20 sm:-bottom-40 sm:-left-40 w-40 h-40 sm:w-80 sm:h-80 bg-amber-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 sm:w-60 sm:h-60 bg-yellow-100 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
        
        {/* Iconos flotantes de hostal */}
        <div className="absolute top-20 left-10 text-4xl animate-float opacity-20">🛏️</div>
        <div className="absolute top-40 right-16 text-3xl animate-float-delayed opacity-15" style={{animationDelay: '1s'}}>🔑</div>
        <div className="absolute bottom-32 left-20 text-3xl animate-float-delayed opacity-20" style={{animationDelay: '2s'}}>🏨</div>
        <div className="absolute bottom-48 right-12 text-2xl animate-float opacity-15" style={{animationDelay: '1.5s'}}>⭐</div>
        <div className="absolute top-60 left-32 text-3xl animate-float-delayed opacity-20" style={{animationDelay: '0.5s'}}>🚪</div>
      </div>
      
      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(5deg);
          }
        }
        
        @keyframes pulse {
          0%, 100% {
            opacity: 0.3;
          }
          50% {
            opacity: 0.5;
          }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-float-delayed {
          animation: float 8s ease-in-out infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>

      <div className="relative w-full max-w-xs sm:max-w-sm md:max-w-md z-10">
        <div className="bg-white/90 backdrop-blur-lg rounded-2xl sm:rounded-3xl shadow-xl sm:shadow-2xl border border-white/20 overflow-hidden">
          {/* Header */}
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

            {/* FORMULARIO LOGIN NORMAL */}
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              <div>
                <label htmlFor="identificador" className="block text-sm font-medium text-gray-700 mb-2">
                  CI o Correo Electrónico
                </label>
                <div className="relative group">
                  <input
                    id="identificador"
                    type="text"
                    value={identificador}
                    onChange={(e) => setIdentificador(e.target.value)}
                    required
                    className="block w-full pl-3 pr-4 py-2 sm:py-3 text-gray-900 placeholder-gray-500 bg-white border border-gray-300 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="ejemplo@hostal.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Contraseña
                </label>
                <div className="relative group">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="block w-full pl-3 pr-12 py-2 sm:py-3 text-gray-900 placeholder-gray-500 bg-white border border-gray-300 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200"
                    placeholder="Ingrese su contraseña"
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center focus:outline-none"
                    aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-amber-500 text-white py-3 sm:py-4 rounded-lg sm:rounded-xl font-semibold hover:from-blue-700 hover:to-amber-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Iniciando sesión...
                  </span>
                ) : (
                  'Ingresar al Sistema'
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