import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthProvider } from "./context/AuthContext";
import { AbilityContext } from "./context/AbilityContext";
import { AuthContext } from "./context/AuthContext";
import { CarritoProvider } from "./context/CarritoContext";
import App from "./App";
import "./index.css";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

console.log('🔑 Google Client ID:', GOOGLE_CLIENT_ID);

if (!GOOGLE_CLIENT_ID) {
  console.error('❌ ERROR: VITE_GOOGLE_CLIENT_ID no está definido en .env');
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <BrowserRouter>
        <AuthProvider>
          <CarritoProvider>
            <AuthConsumer />
          </CarritoProvider>
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
      <App />  {/* 👈 ESTO FALTABA */}
    </AbilityContext.Provider>
  );
}