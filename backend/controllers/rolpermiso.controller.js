import db from "../config/db.js";

// 🔹 Obtener permisos de un rol
export const obtenerPermisosPorRol = async (req, res) => {
  const { idRol } = req.params;

  try {
    const [rows] = await db.query(
      `SELECT rp.id_permiso, p.nombre
       FROM rol_permiso rp
       JOIN permisos p ON rp.id_permiso = p.id_permiso
       WHERE rp.id_rol = ?`,
      [idRol]
    );

    res.json(rows);
  } catch (error) {
    console.error("Error al obtener permisos del rol:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
};

// 🔹 Asignar permisos a un rol (reemplaza los existentes)
export const asignarPermisosARol = async (req, res) => {
  const { idRol } = req.params;
  const { permisos } = req.body; // Array de id_permiso

  if (!Array.isArray(permisos)) {
    return res.status(400).json({ message: "Permisos debe ser un array" });
  }

  try {
    // 1️⃣ Eliminar todos los permisos existentes del rol
    await db.query("DELETE FROM rol_permiso WHERE id_rol = ?", [idRol]);

    // 2️⃣ Insertar los permisos seleccionados
    if (permisos.length > 0) {
      const values = permisos.map((id_permiso) => [idRol, id_permiso]);
      await db.query(
        "INSERT INTO rol_permiso (id_rol, id_permiso) VALUES ?",
        [values]
      );
    }

    res.json({ message: "Permisos asignados correctamente" });
  } catch (error) {
    console.error("Error al asignar permisos:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
};
