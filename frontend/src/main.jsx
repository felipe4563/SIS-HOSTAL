import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthProvider } from "./context/AuthContext";
import { AbilityContext } from "./context/AbilityContext";
import { AuthContext } from "./context/AuthContext";
import App from "./App";
import "./index.css";

// 👇 LEER EL CLIENT ID DEL ARCHIVO .env
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

// 👇 DEBUG: Verificar que se está leyendo correctamente
console.log('🔑 Google Client ID:', GOOGLE_CLIENT_ID);

if (!GOOGLE_CLIENT_ID) {
  console.error('❌ ERROR: VITE_GOOGLE_CLIENT_ID no está definido en .env');
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <BrowserRouter>
        <AuthProvider>
          <AuthConsumer />
        </AuthProvider>
      </BrowserRouter>
    </GoogleOAuthProvider>
  </React.StrictMode>
);

// Componente auxiliar para pasar ability al contexto
function AuthConsumer() {
  const { ability } = React.useContext(AuthContext);

  return (
    <AbilityContext.Provider value={ability}>
      <App />
    </AbilityContext.Provider>
  );
}