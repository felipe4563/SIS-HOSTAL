import db from '../config/db.js';

// Crear cliente (admin)
export const crearCliente = async (req, res) => {
  const { nombre, apellido, ci, correo, celular, direccion, estado = 1 } = req.body;

  try {
    if (ci) {
      const [ciExistente] = await db.query('SELECT id_cliente FROM cliente WHERE ci = ?', [ci]);
      if (ciExistente.length > 0) {
        return res.status(400).json({ message: 'El CI ya está registrado' });
      }
    }

    if (correo) {
      const [correoExistente] = await db.query('SELECT id_cliente FROM cliente WHERE correo = ?', [correo]);
      if (correoExistente.length > 0) {
        return res.status(400).json({ message: 'El correo ya está registrado' });
      }
    }

    const [result] = await db.query(
      `INSERT INTO cliente (nombre, apellido, ci, correo, celular, direccion, estado)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [nombre, apellido, ci || null, correo || null, celular || null, direccion || null, estado]
    );

    const [clienteCreado] = await db.query('SELECT * FROM cliente WHERE id_cliente = ?', [result.insertId]);

    res.status(201).json({
      message: 'Cliente creado exitosamente',
      cliente: clienteCreado[0]
    });
  } catch (error) {
    console.error('Error al crear cliente:', error);
    res.status(500).json({ message: 'Error al crear cliente' });
  }
};

// Obtener todos los clientes (admin)
export const obtenerClientes = async (req, res) => {
  try {
    const [clientes] = await db.query(
      `SELECT 
        id_cliente,
        nombre,
        apellido,
        ci,
        correo,
        celular,
        direccion,
        fecha_registro,
        estado
       FROM cliente
       ORDER BY fecha_registro DESC`
    );

    res.json(clientes);
  } catch (error) {
    console.error('Error al obtener clientes:', error);
    res.status(500).json({ message: 'Error al obtener clientes' });
  }
};

// Obtener cliente por ID (admin)
export const obtenerClientePorId = async (req, res) => {
  const { id } = req.params;

  try {
    const [cliente] = await db.query(
      `SELECT 
        id_cliente,
        nombre,
        apellido,
        ci,
        correo,
        celular,
        direccion,
        fecha_registro,
        estado
       FROM cliente
       WHERE id_cliente = ?`,
      [id]
    );

    if (cliente.length === 0) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }

    res.json(cliente[0]);
  } catch (error) {
    console.error('Error al obtener cliente:', error);
    res.status(500).json({ message: 'Error al obtener cliente' });
  }
};

// Actualizar cliente (admin O el mismo cliente)
export const actualizarCliente = async (req, res) => {
  const { id } = req.params;
  const { nombre, apellido, ci, celular, direccion, estado } = req.body;

  try {
    // Verificar que el cliente existe
    const [clienteExiste] = await db.query(
      'SELECT id_cliente FROM cliente WHERE id_cliente = ?',
      [id]
    );

    if (clienteExiste.length === 0) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }

    // 👇 IMPORTANTE: Verificar si es el mismo cliente o un admin
    const esCliente = req.usuario.id_cliente !== undefined;
    const esAdmin = req.usuario.id_usuario !== undefined;

    // Si es un cliente, solo puede actualizar su propio perfil
    if (esCliente && parseInt(id) !== req.usuario.id_cliente) {
      return res.status(403).json({ message: 'No autorizado para modificar este cliente' });
    }

    // Verificar que el CI no esté en uso por otro cliente (si se proporciona)
    if (ci) {
      const [ciExistente] = await db.query(
        'SELECT id_cliente FROM cliente WHERE ci = ? AND id_cliente != ?',
        [ci, id]
      );

      if (ciExistente.length > 0) {
        return res.status(400).json({ message: 'El CI ya está registrado por otro cliente' });
      }
    }

    // Construir query dinámicamente según los campos proporcionados
    const campos = [];
    const valores = [];

    if (nombre !== undefined) {
      campos.push('nombre = ?');
      valores.push(nombre);
    }
    if (apellido !== undefined) {
      campos.push('apellido = ?');
      valores.push(apellido);
    }
    if (ci !== undefined) {
      campos.push('ci = ?');
      valores.push(ci || null);
    }
    if (celular !== undefined) {
      campos.push('celular = ?');
      valores.push(celular || null);
    }
    if (direccion !== undefined) {
      campos.push('direccion = ?');
      valores.push(direccion || null);
    }
    
    // Solo admin puede cambiar el estado
    if (estado !== undefined && esAdmin) {
      campos.push('estado = ?');
      valores.push(estado);
    }

    if (campos.length === 0) {
      return res.status(400).json({ message: 'No hay campos para actualizar' });
    }

    valores.push(id);

    // Actualizar datos
    await db.query(
      `UPDATE cliente SET ${campos.join(', ')} WHERE id_cliente = ?`,
      valores
    );

    // Obtener datos actualizados
    const [cliente] = await db.query(
      'SELECT * FROM cliente WHERE id_cliente = ?',
      [id]
    );

    res.json({
      message: 'Cliente actualizado exitosamente',
      cliente: cliente[0]
    });
  } catch (error) {
    console.error('Error al actualizar cliente:', error);
    res.status(500).json({ message: 'Error al actualizar cliente' });
  }
};

// Eliminar cliente (admin)
export const eliminarCliente = async (req, res) => {
  const { id } = req.params;

  try {
    // Verificar que el cliente existe
    const [cliente] = await db.query(
      'SELECT id_cliente FROM cliente WHERE id_cliente = ?',
      [id]
    );

    if (cliente.length === 0) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }

    // Verificar si tiene reservas asociadas
    const [reservas] = await db.query(
      'SELECT COUNT(*) as total FROM reserva WHERE id_cliente = ?',
      [id]
    );

    if (reservas[0].total > 0) {
      return res.status(400).json({ 
        message: 'No se puede eliminar el cliente porque tiene reservas asociadas. Puedes desactivarlo en su lugar.' 
      });
    }

    // Eliminar cliente
    await db.query('DELETE FROM cliente WHERE id_cliente = ?', [id]);

    res.json({ message: 'Cliente eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar cliente:', error);
    res.status(500).json({ message: 'Error al eliminar cliente' });
  }
};