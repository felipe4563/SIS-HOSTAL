import { createContext, useState, useEffect, useMemo } from "react";
import { defineAbilitiesFor } from "../ability/ability";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);

  // ability se deriva de usuario en el mismo render — sin doble render ni parpadeo
  const ability = useMemo(() => {
    if (!usuario || usuario.tipo === 'cliente') return null;
    return defineAbilitiesFor(usuario.permisos || []);
  }, [usuario]);

  // Cargar usuario/cliente al montar
  useEffect(() => {
    const token = localStorage.getItem("token");
    const usuarioGuardado = localStorage.getItem("usuario");

    if (token && usuarioGuardado) {
      try {
        const user = JSON.parse(usuarioGuardado);
        setUsuario(user);
      } catch (error) {
        console.error("Error al cargar usuario:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("usuario");
      }
    }
    setLoading(false);
  }, []);

  // Login: guarda token y usuario/cliente
  const login = (data) => {
    const { token, usuario: userData, cliente: clienteData } = data;

    const user = userData || clienteData;
    setUsuario(user);

    localStorage.setItem("token", token);
    localStorage.setItem("usuario", JSON.stringify(user));
  };

  // Logout
  const logout = () => {
    setUsuario(null);
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    sessionStorage.clear();
  };

  // Verificar si es cliente
  const esCliente = () => {
    return usuario?.tipo === 'cliente';
  };

  // Verificar si es usuario del sistema
  const esUsuarioSistema = () => {
    return usuario && usuario.tipo !== 'cliente';
  };

  // Obtener datos del cliente (si es cliente)
  const obtenerCliente = () => {
    if (esCliente()) {
      return {
        id_cliente: usuario.id_cliente,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        correo: usuario.correo,
        ci: usuario.ci,
        celular: usuario.celular,
        direccion: usuario.direccion
      };
    }
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-amber-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider 
      value={{ 
        usuario, 
        ability, 
        login, 
        logout,
        esCliente,
        esUsuarioSistema,
        obtenerCliente
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};