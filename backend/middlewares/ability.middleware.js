// middlewares/ability.middleware.js
import { defineAbilitiesFor } from '../config/abilities.js';

export const abilityMiddleware = (req, res, next) => {
  try {
    // Si el login ya incluyó permisos en el token:
    const permisos = req.user?.permisos || [];

    // Si no vienen en el token, podrías cargar desde BD aquí (opcional).
    req.ability = defineAbilitiesFor(permisos);
    next();
  } catch (err) {
    console.error('abilityMiddleware error', err);
    return res.status(500).json({ message: 'Error al construir permisos' });
  }
};
