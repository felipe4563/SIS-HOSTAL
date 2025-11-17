import express from 'express';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes.js';
import usuarioRoutes from './routes/user.routes.js';
import rolRoutes from './routes/rol.routes.js';
import { authMiddleware } from './middlewares/authMiddleware.js';
import { defineAbilitiesFor } from './config/abilities.js';

dotenv.config();
const app = express();

app.use(express.json());

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

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
