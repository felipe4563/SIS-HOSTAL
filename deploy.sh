#!/bin/bash
set -e

PROJECT_DIR="/home/ubuntu/SISTEMAS/SIS-HOSTAL"
APP_NAME="hostal-api"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log()  { echo -e "${GREEN}[DEPLOY]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC}  $1"; }
fail() { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

cd "$PROJECT_DIR" || fail "No se encontró el directorio $PROJECT_DIR"

log "Pulling últimos cambios..."
git pull origin main || fail "Error al hacer git pull"

log "Instalando dependencias del backend..."
cd "$PROJECT_DIR/backend"
npm install --omit=dev

log "Instalando dependencias del frontend..."
cd "$PROJECT_DIR/frontend"
npm install

log "Construyendo frontend..."
npm run build || fail "Error al construir el frontend"

log "Reiniciando backend con PM2..."
cd "$PROJECT_DIR"
if pm2 describe "$APP_NAME" > /dev/null 2>&1; then
  pm2 restart "$APP_NAME"
else
  warn "Proceso PM2 '$APP_NAME' no existe — iniciando por primera vez..."
  cd "$PROJECT_DIR/backend"
  pm2 start app.js --name "$APP_NAME"
fi

pm2 save

log "Recargando Nginx..."
sudo nginx -t && sudo systemctl reload nginx

log ""
log "Deploy completado exitosamente."
pm2 status "$APP_NAME"
