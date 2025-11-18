import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';

// 👉 IMPORTA Ability y su contexto
import { AbilityContext } from './context/AbilityContext.jsx';
import { ability } from './ability/ability.js';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>

      <AuthProvider>
        {/* 👉 ENVUELVE TODO EN AbilityContext */}
        <AbilityContext.Provider value={ability}>
          <App />
        </AbilityContext.Provider>
      </AuthProvider>

    </BrowserRouter>
  </React.StrictMode>
);
