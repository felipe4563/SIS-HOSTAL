import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';
import { login as loginService } from '../services/auth.js';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import api from '../services/api.js';

const Login = () => {
  const { login }  = useContext(AuthContext);
  const navigate   = useNavigate();

  const [identificador, setIdentificador] = useState('');
  const [password,      setPassword]      = useState('');
  const [showPassword,  setShowPassword]  = useState(false);
  const [error,         setError]         = useState('');
  const [isLoading,     setIsLoading]     = useState(false);

  /* ── Google (huésped) ─────────────────────────────────── */
  const handleGoogleLogin = async (credentialResponse) => {
    setIsLoading(true);
    setError('');
    try {
      const response = await api.post('/auth/cliente/google', {
        token: credentialResponse.credential,
      });
      login(response.data);
      const reservaPendiente = sessionStorage.getItem('reservaPendiente');
      navigate('/', { state: reservaPendiente ? { completarReserva: true } : undefined });
    } catch (err) {
      setError(err.response?.data?.message || 'Error al iniciar sesión con Google');
    } finally {
      setIsLoading(false);
    }
  };

  /* ── Personal del sistema ─────────────────────────────── */
  const handlePersonalSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const data = await loginService(identificador, password);
      login(data);
      navigate('/sistema');
    } catch (err) {
      setError(err.message || 'Credenciales incorrectas');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-amber-50 to-blue-100 flex items-center justify-center p-4">

      {/* Fondo decorativo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-amber-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative w-full max-w-md z-10">
        <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 overflow-hidden">

          {/* Header */}
          <div className="bg-gradient-to-br from-blue-700 to-blue-900 px-8 py-6 text-center">
            <div className="flex items-center justify-center mb-3">
              <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-white text-3xl">🏨</span>
              </div>
            </div>
            <h1 className="text-2xl font-bold text-white">Hostal Suri</h1>
            <p className="text-blue-200 text-sm mt-1">Bienvenido, inicia sesión para continuar</p>
          </div>

          <div className="px-8 py-8 space-y-6">

            {/* Error */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2">
                <svg className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {/* ── Google (huéspedes) ── */}
            <div>
              <div className="flex justify-center">
                {isLoading ? (
                  <div className="flex items-center gap-2 py-3">
                    <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    <span className="text-gray-600 text-sm">Iniciando sesión...</span>
                  </div>
                ) : (
                  <GoogleLogin
                    onSuccess={handleGoogleLogin}
                    onError={() => setError('Error al iniciar sesión con Google')}
                    useOneTap
                    text="continue_with"
                    locale="es"
                  />
                )}
              </div>
            </div>

            {/* Divisor */}
      

            {/* ── Formulario personal ── */}
            <form onSubmit={handlePersonalSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  CI o Correo Electrónico
                </label>
                <input
                  type="text"
                  value={identificador}
                  onChange={(e) => setIdentificador(e.target.value)}
                  required
                  placeholder="ejemplo@hostal.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Contraseña
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Ingrese su contraseña"
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-800 text-white py-3 rounded-xl font-bold hover:from-blue-700 hover:to-blue-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-[1.01] active:scale-[0.99]"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Iniciando sesión...
                  </span>
                ) : (
                  'Iniciar sesión'
                )}
              </button>
            </form>

            {/* Volver al inicio */}
            <button
              onClick={() => navigate('/')}
              className="w-full border-2 border-gray-200 text-gray-600 py-2.5 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-300 transition-all text-sm"
            >
              ← Volver al inicio
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-gray-500 mt-5">
          © {new Date().getFullYear()} <span className="font-semibold">Hostal Suri</span>. Todos los derechos reservados.
        </p>
      </div>
    </div>
  );
};

export default Login;
