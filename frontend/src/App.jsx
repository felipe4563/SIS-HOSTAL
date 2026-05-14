import { Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "./context/AuthContext";
import { Toaster } from "react-hot-toast";

// 🏠 PÁGINAS PÚBLICAS
import Home from "./pages/home";
import Login from "./pages/Login";
import LoginCliente from "./pages/LoginCliente";
import TourVirtual360 from "./pages/Home/TourVirtual360";

// 👤 PÁGINAS DE CLIENTE
import MisReservas from "./pages/Home/Misreservas";
import MiPerfil from "./pages/Home/Miperfil";

// 🔒 SISTEMA ADMINISTRATIVO
import MainLayout from "./components/MainLayout";
import Dashboard from "./pages/Dashboard";
import Habitaciones from "./pages/Habitaciones";
import Tipos from "./pages/Tipos";
import Roles from "./pages/Roles";
import Reservas from "./pages/Reservas";
import Usuarios from "./pages/Usuarios";
import Reportes from "./pages/Reportes";
import Clientes from "./pages/Clientes";

// 🔐 Ruta protegida con CASL
import ProtectedRoute from "./components/protectedroute";

function App() {
  const { usuario } = useContext(AuthContext);

  // Verificar si es cliente o usuario del sistema
  const esCliente = usuario?.tipo === 'cliente';
  const esUsuarioSistema = usuario && !esCliente;

  return (
    <>
      <Toaster position="top-right" />
      <Routes>
        {/* 🏠 PÁGINA PRINCIPAL PÚBLICA */}
      <Route path="/" element={<Home />} />
      <Route path="/tour-360" element={<TourVirtual360 />} />

      {/* 🔑 LOGIN PARA CLIENTES (Huéspedes) */}
      <Route
        path="/login-cliente"
        element={!usuario ? <LoginCliente /> : <Navigate to="/" replace />}
      />

      {/* 🔑 LOGIN PARA PERSONAL DEL SISTEMA */}
      <Route
        path="/login"
        element={!esUsuarioSistema ? <Login /> : <Navigate to="/sistema" replace />}
      />

      {/* 👤 PÁGINAS DE CLIENTE (solo accesibles si está logueado como cliente) */}
      <Route
        path="/mis-reservas"
        element={
          esCliente ? (
            <MisReservas />
          ) : (
            <Navigate to="/login-cliente" replace />
          )
        }
      />

      <Route
        path="/mi-perfil"
        element={
          esCliente ? (
            <MiPerfil />
          ) : (
            <Navigate to="/login-cliente" replace />
          )
        }
      />

      {/* 🔒 SISTEMA ADMINISTRATIVO PROTEGIDO (solo usuarios del sistema) */}
      <Route
        path="/sistema"
        element={
          esUsuarioSistema ? (
            <MainLayout />
          ) : esCliente ? (
            <Navigate to="/" replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      >
        {/* Dashboard */}
        <Route
          index
          element={
            <ProtectedRoute action="read" subject="Dashboard">
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Habitaciones */}
        <Route
          path="habitaciones"
          element={
            <ProtectedRoute action="read" subject="Habitacion">
              <Habitaciones />
            </ProtectedRoute>
          }
        />

        {/* Tipos de Habitación */}
        <Route
          path="tipos"
          element={
            <ProtectedRoute action="read" subject="TipoHabitacion">
              <Tipos />
            </ProtectedRoute>
          }
        />

        {/* Reservas */}
        <Route
          path="reservas"
          element={
            <ProtectedRoute action="read" subject="Reserva">
              <Reservas />
            </ProtectedRoute>
          }
        />

        {/* Clientes */}
        <Route
          path="clientes"
          element={
            <ProtectedRoute action="read" subject="Cliente">
              <Clientes />
            </ProtectedRoute>
          }
        />

        {/* Usuarios */}
        <Route
          path="usuarios"
          element={
            <ProtectedRoute action="read" subject="Usuario">
              <Usuarios />
            </ProtectedRoute>
          }
        />

        {/* Roles */}
        <Route
          path="roles"
          element={
            <ProtectedRoute action="read" subject="Role">
              <Roles />
            </ProtectedRoute>
          }
        />

        {/* Reportes */}
        <Route
          path="reportes"
          element={
            <ProtectedRoute action="read" subject="Reporte">
              <Reportes />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* ⚠️ Rutas no encontradas */}
      <Route
        path="*"
        element={
          <Navigate 
            to={esUsuarioSistema ? "/sistema" : "/"} 
            replace 
          />
        }
      />
    </Routes>
    </>
  );
}

export default App;