import db from '../config/db.js';

const BASE_SELECT = `
  SELECT l.*,
         h.numero   AS numero_habitacion,
         h.piso,
         t.nombre   AS tipo_habitacion,
         t.capacidad
  FROM   limpieza l
  INNER  JOIN habitacion h ON l.id_habitacion = h.id_habitacion
  INNER  JOIN tipo       t ON h.id_tipo       = t.id_tipo
`;

/** GET /api/limpieza — tareas pendientes y en proceso */
export const listarPendientes = async (req, res) => {
  try {
    const [rows] = await db.query(
      `${BASE_SELECT}
       WHERE l.estado IN ('pendiente','en_proceso')
       ORDER BY l.estado ASC, l.fecha_creacion ASC`
    );
    res.json(rows);
  } catch (error) {
    console.error('Error listarPendientes:', error);
    res.status(500).json({ message: 'Error al obtener tareas de limpieza' });
  }
};

/** GET /api/limpieza/historial — tareas completadas */
export const historial = async (req, res) => {
  try {
    const limite = Math.min(Number(req.query.limite) || 50, 200);
    const [rows] = await db.query(
      `${BASE_SELECT}
       WHERE l.estado = 'completada'
       ORDER BY l.fecha_fin DESC
       LIMIT ?`,
      [limite]
    );
    res.json(rows);
  } catch (error) {
    console.error('Error historial:', error);
    res.status(500).json({ message: 'Error al obtener historial' });
  }
};

/** POST /api/limpieza — crear tarea manualmente */
export const crearTarea = async (req, res) => {
  const { id_habitacion, tipo = 'mantenimiento', observaciones } = req.body;
  if (!id_habitacion) {
    return res.status(400).json({ message: 'Se requiere id_habitacion' });
  }
  try {
    const [hab] = await db.query(
      'SELECT id_habitacion FROM habitacion WHERE id_habitacion = ?',
      [id_habitacion]
    );
    if (hab.length === 0) {
      return res.status(404).json({ message: 'Habitación no encontrada' });
    }
    const [result] = await db.query(
      `INSERT INTO limpieza (id_habitacion, tipo, observaciones)
       VALUES (?, ?, ?)`,
      [id_habitacion, tipo, observaciones || null]
    );

    // Marcar habitación en limpieza si aún no lo está
    await db.query(
      `UPDATE habitacion SET estado = 'limpieza'
       WHERE id_habitacion = ? AND estado != 'limpieza'`,
      [id_habitacion]
    );

    const [created] = await db.query(`${BASE_SELECT} WHERE l.id_limpieza = ?`, [result.insertId]);
    res.status(201).json(created[0]);
  } catch (error) {
    console.error('Error crearTarea:', error);
    res.status(500).json({ message: 'Error al crear tarea de limpieza' });
  }
};

/** PATCH /api/limpieza/:id/iniciar */
export const iniciarLimpieza = async (req, res) => {
  const id = Number(req.params.id);
  try {
    const [rows] = await db.query(
      'SELECT id_limpieza, estado FROM limpieza WHERE id_limpieza = ?',
      [id]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'Tarea no encontrada' });
    if (rows[0].estado !== 'pendiente') {
      return res.status(400).json({ message: 'La tarea ya fue iniciada o completada' });
    }
    await db.query(
      `UPDATE limpieza SET estado = 'en_proceso', fecha_inicio = NOW()
       WHERE id_limpieza = ?`,
      [id]
    );
    const [updated] = await db.query(`${BASE_SELECT} WHERE l.id_limpieza = ?`, [id]);
    res.json(updated[0]);
  } catch (error) {
    console.error('Error iniciarLimpieza:', error);
    res.status(500).json({ message: 'Error al iniciar limpieza' });
  }
};

/** PATCH /api/limpieza/:id/completar */
export const completarLimpieza = async (req, res) => {
  const id = Number(req.params.id);
  const { observaciones } = req.body;

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const [rows] = await connection.query(
      'SELECT id_limpieza, id_habitacion, estado FROM limpieza WHERE id_limpieza = ? FOR UPDATE',
      [id]
    );
    if (rows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: 'Tarea no encontrada' });
    }
    if (rows[0].estado === 'completada') {
      await connection.rollback();
      return res.status(400).json({ message: 'La tarea ya está completada' });
    }

    const { id_habitacion } = rows[0];

    await connection.query(
      `UPDATE limpieza
       SET estado = 'completada', fecha_fin = NOW(),
           fecha_inicio = COALESCE(fecha_inicio, NOW()),
           observaciones = COALESCE(?, observaciones)
       WHERE id_limpieza = ?`,
      [observaciones || null, id]
    );

    // La habitación vuelve a disponible
    await connection.query(
      `UPDATE habitacion SET estado = 'disponible' WHERE id_habitacion = ?`,
      [id_habitacion]
    );

    await connection.commit();

    const [updated] = await db.query(`${BASE_SELECT} WHERE l.id_limpieza = ?`, [id]);
    res.json(updated[0]);
  } catch (error) {
    await connection.rollback();
    console.error('Error completarLimpieza:', error);
    res.status(500).json({ message: 'Error al completar limpieza' });
  } finally {
    connection.release();
  }
};

/** GET /api/limpieza/stats — contadores rápidos */
export const stats = async (req, res) => {
  try {
    const [[{ pendientes }]] = await db.query(
      `SELECT COUNT(*) AS pendientes FROM limpieza WHERE estado = 'pendiente'`
    );
    const [[{ en_proceso }]] = await db.query(
      `SELECT COUNT(*) AS en_proceso FROM limpieza WHERE estado = 'en_proceso'`
    );
    const [[{ completadas_hoy }]] = await db.query(
      `SELECT COUNT(*) AS completadas_hoy FROM limpieza
       WHERE estado = 'completada' AND DATE(fecha_fin) = CURDATE()`
    );
    const [[{ completadas_mes }]] = await db.query(
      `SELECT COUNT(*) AS completadas_mes FROM limpieza
       WHERE estado = 'completada'
         AND YEAR(fecha_fin) = YEAR(NOW()) AND MONTH(fecha_fin) = MONTH(NOW())`
    );
    res.json({ pendientes, en_proceso, completadas_hoy, completadas_mes });
  } catch (error) {
    console.error('Error stats:', error);
    res.status(500).json({ message: 'Error al obtener estadísticas' });
  }
};
