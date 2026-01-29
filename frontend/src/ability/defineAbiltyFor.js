import { AbilityBuilder, Ability } from "@casl/ability";
import Marcas from "../pages/Atributos/Marcas";

export function defineAbilityFor(permisos = []) {
  const { can, rules } = new AbilityBuilder(Ability);

  permisos.forEach((permiso) => {
    const [recurso, accion] = permiso.split(".");

    // productos -> Producto
    const subject = capitalize(singularize(recurso));

    can(accion, subject);
  });

  return new Ability(rules);
}

function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function singularize(text) {
  const map = {
    colores: "Color",
    categorias: "Categoria",
    tallas: "Talla",
    productos: "Producto",
    roles: "Role",
    usuarios: "Usuario",
    ventas: "Venta",
    reportes: "Reporte",
    clientes: "Cliente",
    marcas: "Marca",
  };
  return map[text.toLowerCase()] || text;
}


