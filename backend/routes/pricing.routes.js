import express from 'express';
import pricingDinamicoService from '../services/pricingDinamic.service.js';
import eventosExternosService from '../services/eventosExternos.service.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import db from '../config/db.js';

const router = express.Router();

// ============================================
// 💰 CALCULAR PRECIO DINÁMICO
// ============================================
router.post('/calcular', async (req, res) => {
  try {
    const { id_habitacion, fecha_entrada, fecha_salida } = req.body;
    
    if (!id_habitacion || !fecha_entrada || !fecha_salida) {
      return res.status(400).json({ 
        message: 'Faltan parámetros: id_habitacion, fecha_entrada, fecha_salida' 
      });
    }
    
    const resultado = await pricingDinamicoService.calcularPrecio(
      id_habitacion,
      fecha_entrada,
      fecha_salida,
      req.ip
    );
    
    res.json(resultado);
    
  } catch (error) {
    console.error('Error calculando precio:', error);
    res.status(500).json({ 
      message: error.message || 'Error al calcular precio' 
    });
  }
});

// ============================================
// 🔄 EVENTOS - SINCRONIZACIÓN
// ============================================

// Sincronizar eventos manualmente (admin)
router.post('/eventos/sincronizar', authMiddleware, async (req, res) => {
  try {
    console.log('🔧 Sincronización manual solicitada');
    const resultado = await eventosExternosService.sincronizarManual();
    res.json({
      message: 'Sincronización completada',
      resultado
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Ver estadísticas de eventos (admin)
router.get('/eventos/estadisticas', authMiddleware, async (req, res) => {
  try {
    const stats = await eventosExternosService.obtenerEstadisticas();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Ver eventos activos (público)
router.get('/eventos/activos', async (req, res) => {
  try {
    const [eventos] = await db.query(`
      SELECT 
        id_evento,
        nombre, 
        fecha_inicio, 
        fecha_fin, 
        ajuste_precio, 
        categoria, 
        ubicacion, 
        descripcion,
        impacto_calculado
      FROM evento_especial
      WHERE activo = 1 AND estado = 1
      ORDER BY fecha_inicio
    `);
    
    res.json(eventos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Ver todas las temporadas (público)
router.get('/temporadas', async (req, res) => {
  try {
    const [temporadas] = await db.query(`
      SELECT * FROM temporada 
      WHERE activo = 1 
      ORDER BY mes_inicio
    `);
    res.json(temporadas);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ============================================
// 📊 LOGS Y ESTADÍSTICAS
// ============================================

// Ver logs de sincronización (admin)
router.get('/logs', authMiddleware, async (req, res) => {
  try {
    const [logs] = await db.query(`
      SELECT * FROM log_sincronizacion
      ORDER BY fecha_sincronizacion DESC
      LIMIT 20
    `);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Estadísticas de consultas de precio (admin)
router.get('/estadisticas/consultas', authMiddleware, async (req, res) => {
  try {
    const { mes, anio } = req.query;
    const mesActual = mes || new Date().getMonth() + 1;
    const anioActual = anio || new Date().getFullYear();
    
    const stats = await pricingDinamicoService.obtenerEstadisticasConsultas(
      mesActual,
      anioActual
    );
    
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;