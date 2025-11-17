// config/abilities.js
import { AbilityBuilder, Ability } from '@casl/ability';

/**
 * permisos: array de strings como "reservas.crear" o "habitacion.read"
 * Retorna una instancia de Ability
 */
export function defineAbilitiesFor(permisos = []) {
  const { can, cannot, build } = new AbilityBuilder(Ability);

  // Convenciones:
  // permiso = "<subject>.<action>" ej: "reserva.create" o "habitacion.read"
  // Si tu permiso viene como "reservas.crear" o "reservas.ver" adapta el split.

  permisos.forEach((perm) => {
    // soporta formatos "reserva.create", "reserva.create:any", "reservas.crear"
    const raw = String(perm).trim();
    // Intentamos soportar "recurso.accion" usando separador '.' o '/'
    const parts = raw.includes('.') ? raw.split('.') : raw.split('/');
    if (parts.length >= 2) {
      const [subjectRaw, actionRaw] = parts;
      // mapear acción en español si usas (opcional)
      const action = mapAction(actionRaw); // ver función abajo
      const subject = normalizeSubject(subjectRaw);
      can(action, subject);
    } else {
      // permiso no estándar: darlo como 'manage' sobre el string
      can('manage', raw);
    }
  });

  return build();
}

// Helpers básicos (ajusta nombres si usas otras convenciones)
function normalizeSubject(sub) {
  // convierte 'reservas' -> 'Reserva', 'habitacion' -> 'Habitacion'
  const s = sub.toLowerCase().replace(/s$/,''); // quitar s plural
  return capitalize(s);
}
function mapAction(a) {
  const act = a.toLowerCase();
  // soporta español e inglés corto
  if (['crear','create','c'].includes(act)) return 'create';
  if (['editar','update','edit','u'].includes(act)) return 'update';
  if (['eliminar','delete','d'].includes(act)) return 'delete';
  if (['ver','read','r','list','index'].includes(act)) return 'read';
  if (['manage','all','*'].includes(act)) return 'manage';
  // fallback
  return act;
}
function capitalize(s) {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}
