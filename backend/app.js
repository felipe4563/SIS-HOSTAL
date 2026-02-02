import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from "path";
import { fileURLToPath } from "url";

import authRoutes from './routes/auth.routes.js';
import usuarioRoutes from './routes/user.routes.js';
import rolRoutes from './routes/rol.routes.js';
import permisosRoutes from './routes/permiso.routes.js';
import habitacionRoutes from './routes/habitacion.routes.js';
import tipoRoutes from './routes/tipo.routes.js';
import reservaRoutes from './routes/reserva.route.js';
import clienteRoutes from './routes/cliente.routes.js';
import pricingRoutes from './routes/pricing.routes.js'; // 👈 NUEVO
import { defineAbilitiesFor } from './config/abilities.js';
import eventosExternosService from './services/eventosExternos.service.js'; // 👈 NUEVO

dotenv.config();
const app = express();

const allowedOrigins = [
  'http://localhost:5173',
  'https://tudominio.com',   // <-- futuro dominio producción
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Permite requests sin origen (Postman, cURL)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Origen no permitido por CORS'));
      }
    },
    credentials: true,
  })
);

app.use(express.json());
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware para inicializar Ability CASL en cada request
app.use((req, res, next) => {
  if (req.user && req.user.permisos) {
    req.ability = defineAbilitiesFor(req.user.permisos);
  }
  next();
});

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/roles', rolRoutes);
app.use('/api/permisos', permisosRoutes);
app.use('/api/habitaciones', habitacionRoutes);
app.use('/api/tipos', tipoRoutes);
app.use('/api/reservas', reservaRoutes);
app.use('/api/clientes', clienteRoutes);
app.use('/api/pricing', pricingRoutes); // 👈 NUEVO - Rutas de tarifas dinámicas
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const PORT = process.env.PORT || 4000;

app.listen(PORT, async () => {
  console.log(`✅ Servidor corriendo en puerto ${PORT}`);
  console.log(`🌐 http://localhost:${PORT}`);
  console.log('');
  
  // 🎯 Sistema de Tarifas Dinámicas
  console.log('🎯 Sistema de Tarifas Dinámicas ACTIVO');
  console.log('   Los cron jobs están configurados para sincronizar eventos automáticamente');
  console.log('');
  
  // 🔧 OPCIONAL: Sincronizar eventos al iniciar el servidor (solo primera vez)
  // Descomentar las siguientes líneas si quieres sincronizar inmediatamente:
  /*
  try {
    console.log('🔧 Sincronizando eventos al iniciar servidor...');
    const resultado = await eventosExternosService.sincronizarManual();
    console.log('✅ Sincronización inicial completada:');
    console.log(`   - Nuevos: ${resultado.feriados.nuevos}`);
    console.log(`   - Actualizados: ${resultado.feriados.actualizados}`);
    console.log('');
  } catch (error) {
    console.error('❌ Error en sincronización inicial:', error.message);
    console.log('');
  }
  */
});