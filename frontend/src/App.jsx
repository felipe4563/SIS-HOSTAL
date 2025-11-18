import { Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "./context/AuthContext.jsx";

import Login from "./pages/Login.jsx";
import MainLayout from "./components/MainLayout.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Habitaciones from "./pages/Habitaciones.jsx";
import Roles from "./pages/Roles.jsx";
import Reservas from "./pages/Reservas.jsx";
import Usuarios from "./pages/Usuarios.jsx";
import Reportes from "./pages/Reportes.jsx";
import Clientes from "./pages/clientes.jsx";

// Componente que protege rutas según permisos
const ProtectedRoute = ({ permiso, children }) => {
  const { usuario } = useContext(AuthContext);

  if (!usuario) return <Navigate to="/login" replace />;
  if (permiso && !usuario.permisos.includes(permiso)) {
    return <Navigate to="/" replace />; // o mostrar un "No autorizado"
  }

  return children;
};

function App() {
  const { usuario } = useContext(AuthContext);

  return (
    <Routes>
      {/* RUTA LOGIN */}
      <Route
        path="/login"
        element={!usuario ? <Login /> : <Navigate to="/" replace />}
      />

      {/* RUTAS PROTEGIDAS CON LAYOUT */}
      <Route
        path="/"
        element={usuario ? <MainLayout /> : <Navigate to="/login" replace />}
      >
        {/* Redirigir a dashboard solo si tiene permiso */}
        <Route
          index
          element={
            usuario?.permisos.includes("dashboard.ver") ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        <Route
          path="dashboard"
          element={
            <ProtectedRoute permiso="dashboard.ver">
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="habitaciones"
          element={
            <ProtectedRoute permiso="habitacion.ver">
              <Habitaciones />
            </ProtectedRoute>
          }
        />
        <Route
          path="reservas"
          element={
            <ProtectedRoute permiso="reserva.ver">
              <Reservas />
            </ProtectedRoute>
          }
        />
        <Route
          path="usuarios"
          element={
            <ProtectedRoute permiso="usuario.ver">
              <Usuarios />
            </ProtectedRoute>
          }
        />
        <Route
          path="reportes"
          element={
            <ProtectedRoute permiso="reporte.ver">
              <Reportes />
            </ProtectedRoute>
          }
        />
        <Route
          path="clientes"
          element={
            <ProtectedRoute permiso="cliente.ver">
              <Clientes />
            </ProtectedRoute>
          }
        />
        <Route
          path="roles"
          element={
            <ProtectedRoute permiso="rol.ver">
              <Roles />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Ruta por defecto */}
      <Route
        path="*"
        element={<Navigate to={usuario ? "/" : "/login"} replace />}
      />
    </Routes>
  );
}

export default App;
