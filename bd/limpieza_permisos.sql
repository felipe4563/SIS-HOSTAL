-- ============================================================
--  MÓDULO LIMPIEZA — Permisos y asignación a roles
--  Ejecutar en phpMyAdmin o MySQL CLI (XAMPP)
-- ============================================================

-- 1) CREAR LA TABLA limpieza (si aún no existe)
CREATE TABLE IF NOT EXISTS `limpieza` (
  `id_limpieza`    INT          NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `id_habitacion`  INT          NOT NULL,
  `id_reserva`     INT          NULL,
  `estado`         ENUM('pendiente','en_proceso','completada') NOT NULL DEFAULT 'pendiente',
  `tipo`           ENUM('checkout','mantenimiento') NOT NULL DEFAULT 'checkout',
  `fecha_creacion` DATETIME     NOT NULL DEFAULT NOW(),
  `fecha_inicio`   DATETIME     NULL,
  `fecha_fin`      DATETIME     NULL,
  `observaciones`  TEXT         NULL,
  CONSTRAINT `fk_limpieza_habitacion` FOREIGN KEY (`id_habitacion`) REFERENCES `habitacion`(`id_habitacion`),
  CONSTRAINT `fk_limpieza_reserva`    FOREIGN KEY (`id_reserva`)    REFERENCES `reserva`(`id_reserva`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ============================================================
-- 2) INSERTAR LOS PERMISOS DEL MÓDULO
--    (usa INSERT IGNORE para no fallar si ya existen)
-- ============================================================
INSERT IGNORE INTO `permisos` (`id_permiso`, `nombre`, `descripcion`) VALUES
(28, 'limpieza.ver',    'Ver tareas de limpieza'),
(29, 'limpieza.crear',  'Crear tareas de limpieza manualmente'),
(30, 'limpieza.editar', 'Iniciar y completar tareas de limpieza');

-- ============================================================
-- 3) ASIGNAR PERMISOS A LOS ROLES
--    Rol 1 = Administrador  → todos los permisos
--    Rol 2 = Limpieza       → ver + editar (iniciar/completar)
--    Rol 3 = Recepcionista  → ver (para conocer estado de habitaciones)
-- ============================================================

-- Administrador (rol 1): todos los permisos de limpieza
INSERT IGNORE INTO `rol_permiso` (`id_rol`, `id_permiso`) VALUES
(1, 28),
(1, 29),
(1, 30);

-- Personal de Limpieza (rol 2): ver y actualizar estado
INSERT IGNORE INTO `rol_permiso` (`id_rol`, `id_permiso`) VALUES
(2, 28),
(2, 30);

-- Recepcionista (rol 3): solo ver el panel
INSERT IGNORE INTO `rol_permiso` (`id_rol`, `id_permiso`) VALUES
(3, 28);

-- ============================================================
-- Verificación (opcional, puedes ejecutar para confirmar)
-- ============================================================
-- SELECT p.id_permiso, p.nombre, r.nombre AS rol
-- FROM permisos p
-- JOIN rol_permiso rp ON p.id_permiso = rp.id_permiso
-- JOIN rol r ON rp.id_rol = r.id_rol
-- WHERE p.nombre LIKE 'limpieza%'
-- ORDER BY r.id_rol;
