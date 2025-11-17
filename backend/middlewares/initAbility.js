import { defineAbilitiesFor } from '../config/abilities.js';

export const initAbility = (req, res, next) => {
  try {
    // req.user debe venir del authMiddleware
    if (!req.user || !req.user.permisos) {
      return res.status(401).json({ message: 'Permisos no disponibles' });
    }

    // Crear la Ability y guardarla en req
    req.ability = defineAbilitiesFor(req.user.permisos);

    next();
  } catch (error) {
    console.error('initAbility error', error);
    return res.status(500).json({ message: 'Error al inicializar Ability' });
  }
};
