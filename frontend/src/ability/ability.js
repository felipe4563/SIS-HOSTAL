import { AbilityBuilder, Ability } from "@casl/ability";

/**
 * Define las habilidades (permisos) basadas en los permisos del usuario
 * @param {Array} permisos - Array de strings con los permisos del usuario
 * @returns {Ability} - Instancia de CASL Ability
 */
export function defineAbilitiesFor(permisos = []) {
  const { can, build } = new AbilityBuilder(Ability);

  // Mapeo de permisos del backend a CASL
  permisos.forEach((permiso) => {
    // Ejemplo: "dashboard.ver" -> can('read', 'Dashboard')
    // Ejemplo: "habitacion.crear" -> can('create', 'Habitacion')
    
    const [recurso, accion] = permiso.split(".");

    // Mapeo de acciones
    const accionMap = {
      ver: "read",
      crear: "create",
      editar: "update",
      eliminar: "delete",
      generar: "generate", // Para reportes
      gestionar: "manage", // manage = todos los permisos
    };

    // Mapeo de recursos (primera letra mayúscula para CASL)
    const recursoMap = {
      dashboard: "Dashboard",
      habitacion: "Habitacion",
      reserva: "Reserva",
      usuario: "Usuario",
      cliente: "Cliente",
      reporte: "Reporte",
      rol: "Role",
      pago: "Pago",
      ocupacion: "Ocupacion",
      tipo: "TipoHabitacion", // Tipos de habitación
      limpieza: "Limpieza",
    };

    const accionCasl = accionMap[accion];
    const recursoCasl = recursoMap[recurso];

    if (accionCasl && recursoCasl) {
      can(accionCasl, recursoCasl);
    }
  });

  return build();
}