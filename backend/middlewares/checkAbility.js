// middlewares/checkAbility.js
export const checkAbility = (action, subject) => {
  return (req, res, next) => {
    try {
      if (!req.ability) {
        return res.status(500).json({ message: 'Ability no inicializada' });
      }
      if (req.ability.can(action, subject)) {
        return next();
      }
      return res.status(403).json({ message: 'Acceso denegado' });
    } catch (err) {
      console.error('checkAbility error', err);
      return res.status(500).json({ message: 'Error interno' });
    }
  };
};
