import db from '../config/db.js';

export const listarHabitaciones = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM habitacion');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener habitaciones' });
  }
};

export const crearHabitacion = async (req, res) => {
  const { numero, id_tipo, precio_total, piso, estado, descripcion } = req.body;
  try {
    const [result] = await db.query(
      `INSERT INTO habitacion (numero, id_tipo, precio_total, piso, estado, descripcion)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [numero, id_tipo, precio_total, piso, estado, descripcion]
    );
    res.json({ message: 'Habitación creada', id: result.insertId });
  } catch (error) {
    res.status(500).json({ message: 'Error al crear habitación' });
  }
};

export const editarHabitacion = async (req, res) => {
  const { id } = req.params;
  const { numero, precio_total, piso, estado, descripcion } = req.body;
  try {
    await db.query(
      `UPDATE habitacion SET numero=?, precio_total=?, piso=?, estado=?, descripcion=? WHERE id_habitacion=?`,
      [numero, precio_total, piso, estado, descripcion, id]
    );
    res.json({ message: 'Habitación actualizada' });
  } catch (error) {
    res.status(500).json({ message: 'Error al editar habitación' });
  }
};
