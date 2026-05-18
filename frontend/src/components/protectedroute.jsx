import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AbilityContext } from "../context/AbilityContext";
import { AuthContext } from "../context/AuthContext";

// Módulos en orden de prioridad: se redirige al primero que el usuario pueda leer
const MODULOS = [
  { path: "/sistema", action: "read", subject: "Dashboard" },
  { path: "/sistema/reservas", action: "read", subject: "Reserva" },
  { path: "/sistema/habitaciones", action: "read", subject: "Habitacion" },
  { path: "/sistema/clientes", action: "read", subject: "Cliente" },
  { path: "/sistema/usuarios", action: "read", subject: "Usuario" },
  { path: "/sistema/tipos", action: "read", subject: "TipoHabitacion" },
  { path: "/sistema/roles", action: "read", subject: "Role" },
  { path: "/sistema/reportes", action: "read", subject: "Reporte" },
  { path: "/sistema/limpieza", action: "read", subject: "Limpieza" },
];

const getFirstAccessiblePath = (ability) => {
  const modulo = MODULOS.find(({ action, subject }) => ability.can(action, subject));
  return modulo?.path ?? "/login";
};

const ProtectedRoute = ({ action, subject, any, children }) => {
  const ability = useContext(AbilityContext);
  const { usuario } = useContext(AuthContext);

  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  if (!ability) {
    return <Navigate to="/login" replace />;
  }

  // Verificar múltiples permisos (prop "any")
  if (any) {
    const hasPermission = any.some(({ action: a, subject: s }) => ability.can(a, s));
    if (!hasPermission) return <Navigate to={getFirstAccessiblePath(ability)} replace />;
    return children;
  }

  // Verificar un solo permiso
  if (!ability.can(action, subject)) {
    return <Navigate to={getFirstAccessiblePath(ability)} replace />;
  }

  return children;
};

export default ProtectedRoute;
