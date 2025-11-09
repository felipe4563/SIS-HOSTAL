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

function App() {
  const { usuario } = useContext(AuthContext);

  return (
    <Routes>
      {/* RUTA LOGIN */}
      <Route
        path="/login"
        element={!usuario ? <Login /> : <Navigate to="/dashboard" replace />}
      />

      {/* RUTAS PROTEGIDAS - SOLO UN LAYOUT */}
      <Route 
        path="/" 
        element={usuario ? <MainLayout /> : <Navigate to="/login" replace />}
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="habitaciones" element={<Habitaciones />} />
        <Route path="reservas" element={<Reservas />} />
        <Route path="usuarios" element={<Usuarios />} />
        <Route path="reportes" element={<Reportes />} />
        <Route path="clientes" element={<Clientes />} />
        <Route path="roles" element={<Roles />} />
      </Route>

      {/* Ruta por defecto */}
      <Route 
        path="*" 
        element={<Navigate to={usuario ? "/dashboard" : "/login"} replace />} 
      />
    </Routes>
  );
}

export default App;