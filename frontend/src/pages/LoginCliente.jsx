import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import api from '../services/api.js';

const LoginCliente = () => {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  // LOGIN GOOGLE PARA CLIENTES
  const handleGoogleLogin = async (credentialResponse) => {
    setIsLoading(true);
    setError('');
    
    try {
      const response = await api.post('/auth/cliente/google', {
        token: credentialResponse.credential
      });

      login(response.data); // Guarda el cliente en el contexto
      
      // Verificar si hay una reserva pendiente en sessionStorage
      const reservaPendiente = sessionStorage.getItem('reservaPendiente');
      if (reservaPendiente) {
        navigate('/', { state: { completarReserva: true } });
      } else {
        navigate('/');
      }
      
    } catch (err) {
      setError(err.response?.data?.message || 'Error al iniciar sesión con Google');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-amber-50 to-blue-100 flex items-center justify-center p-4">
      {/* Fondo decorativo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-amber-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse animation-delay-2000"></div>
      </div>

      <div className="relative w-full max-w-md z-10">
        <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-br from-blue-600 to-blue-800 px-8 py-6 text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-white text-3xl">🏨</span>
              </div>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Hostal Suri</h1>
            <p className="text-blue-100 text-sm">Inicia sesión para completar tu reserva</p>
          </div>

          {/* Contenido */}
          <div className="px-8 py-8">
            {/* Mensaje de error */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {/* Información */}
            <div className="mb-8 text-center">
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Bienvenido
              </h2>
              <p className="text-gray-600 text-sm">
                Inicia sesión con tu cuenta de Google para continuar
              </p>
            </div>

            {/* Botón Google */}
            <div className="flex justify-center mb-6">
              {isLoading ? (
                <div className="flex items-center justify-center py-4">
                  <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                  <span className="text-gray-600">Iniciando sesión...</span>
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

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  ¿No tienes cuenta? Se creará automáticamente
                </span>
              </div>
            </div>

            {/* Botón volver */}
            <button
              onClick={() => navigate('/')}
              className="w-full border-2 border-gray-300 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-all"
            >
              Volver al inicio
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            © 2025 <span className="font-semibold">Hostal Suri</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginCliente;