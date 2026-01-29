import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AbilityContext } from "../context/AbilityContext";

const ProtectedRoute = ({ action, subject, any, children }) => {
  const ability = useContext(AbilityContext);

  // Si se pasa "any", verifica si cumple al menos uno de los permisos
  if (any) {
    const hasPermission = any.some(({ action, subject }) =>
      ability.can(action, subject)
    );
    if (!hasPermission) {
      return <Navigate to="/app" replace />;
    }
    return children;
  }

  // Verificación normal de un solo permiso
  if (!ability.can(action, subject)) {
    return <Navigate to="/app" replace />;
  }

  return children;
};

export default ProtectedRoute;