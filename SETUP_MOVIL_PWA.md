# Configuracion para usar en celular (LAN + App)

## 1) Requisitos
- Tu PC y tu celular deben estar en la misma red WiFi.
- Permitir en firewall de Windows los puertos:
  - `4000` (backend)
  - `5173` (frontend dev)

## 2) Configurar backend
En `backend/.env` usa:

```env
PORT=4000
HOST=0.0.0.0
BACKEND_URL=http://TU_IP_LOCAL:4000
FRONTEND_URL=http://TU_IP_LOCAL:5173
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173,http://TU_IP_LOCAL:5173
```

Ejemplo:
`TU_IP_LOCAL=192.168.1.100`

## 3) Configurar frontend
En `frontend/.env` usa:

```env
VITE_API_URL=http://TU_IP_LOCAL:4000/api
VITE_BASE_URL=http://TU_IP_LOCAL:4000
VITE_GOOGLE_CLIENT_ID=xxxxx
```

## 4) Levantar proyecto

Backend:
```bash
cd backend
npm run dev
```

Frontend:
```bash
cd frontend
npm run dev
```

Abrir desde celular:
- `http://TU_IP_LOCAL:5173`

## 5) Instalar como app (PWA)
En el navegador del celular (Chrome/Edge):
- Abrir la URL del frontend.
- Menu del navegador > **Instalar app** / **Agregar a pantalla de inicio**.

La app queda instalable en modo standalone.

## 6) Obtener tu IP local en Windows
En PowerShell:
```powershell
ipconfig
```
Busca la direccion `IPv4` de tu adaptador WiFi.
