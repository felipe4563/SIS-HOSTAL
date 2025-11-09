import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import rolRoutes from './routes/rol.routes.js';
import permisoRoutes from './routes/permiso.routes.js';
import habitacionRoutes from './routes/habitacion.routes.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/usuarios', userRoutes);
app.use('/api/roles', rolRoutes);
app.use('/api/permisos', permisoRoutes);
app.use('/api/habitaciones', habitacionRoutes);


const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Servidor corriendo en el puerto ${PORT}`));
