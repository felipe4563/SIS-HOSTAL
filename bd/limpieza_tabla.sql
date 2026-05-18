-- Tabla de tareas de limpieza
CREATE TABLE IF NOT EXISTS limpieza (
  id_limpieza      INT          NOT NULL AUTO_INCREMENT PRIMARY KEY,
  id_habitacion    INT          NOT NULL,
  id_reserva       INT          NULL,
  estado           ENUM('pendiente','en_proceso','completada') NOT NULL DEFAULT 'pendiente',
  tipo             ENUM('checkout','mantenimiento') NOT NULL DEFAULT 'checkout',
  fecha_creacion   DATETIME     NOT NULL DEFAULT NOW(),
  fecha_inicio     DATETIME     NULL,
  fecha_fin        DATETIME     NULL,
  observaciones    TEXT         NULL,
  CONSTRAINT fk_limpieza_habitacion FOREIGN KEY (id_habitacion) REFERENCES habitacion(id_habitacion),
  CONSTRAINT fk_limpieza_reserva    FOREIGN KEY (id_reserva)    REFERENCES reserva(id_reserva) ON DELETE SET NULL
);
