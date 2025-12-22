/**
 * 🏊 POOLS ROUTES
 * Rutas para gestión de pools
 */

const express = require('express');
const { pool } = require('../config/database');
const { userAuth } = require('../security/auth');
const router = express.Router();

router.use(userAuth);

/**
 * GET /api/pools
 * Obtener lista de pools disponibles
 */
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM pools WHERE status = 'active' ORDER BY priority ASC, name ASC`
    );

    const defaultPoolResult = await pool.query(
      `SELECT * FROM pools WHERE is_default = true AND status = 'active' LIMIT 1`
    );

    res.json({
      success: true,
      data: {
        pools: result.rows,
        default_pool: defaultPoolResult.rows[0] || null
      }
    });

  } catch (error) {
    console.error('Error obteniendo pools:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

/**
 * GET /api/pools/:id
 * Obtener detalles de un pool
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT * FROM pools WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Pool no encontrado'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Error obteniendo pool:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

/**
 * GET /api/pools/user/list
 * Obtener pools configurados por el usuario
 */
router.get('/user/list', async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `SELECT 
        up.*,
        p.name as pool_name,
        p.url as pool_url,
        p.port as pool_port,
        p.algorithm,
        p.fee_percentage
       FROM user_pools up
       LEFT JOIN pools p ON up.pool_id = p.id
       WHERE up.user_id = $1
       ORDER BY up.priority ASC`,
      [userId]
    );

    res.json({
      success: true,
      data: {
        user_pools: result.rows
      }
    });

  } catch (error) {
    console.error('Error obteniendo pools del usuario:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

/**
 * POST /api/pools/user/add
 * Agregar pool personalizado del usuario
 */
router.post('/user/add', async (req, res) => {
  try {
    const { pool_id, custom_name, custom_url, custom_port, priority } = req.body;
    const userId = req.user.id;

    if (!pool_id && !custom_url) {
      return res.status(400).json({
        success: false,
        error: 'Debe proporcionar pool_id o custom_url'
      });
    }

    // Si es pool personalizado, verificar que no exista
    if (custom_url) {
      const existingResult = await pool.query(
        `SELECT * FROM user_pools 
         WHERE user_id = $1 AND custom_url = $2`,
        [userId, custom_url]
      );

      if (existingResult.rows.length > 0) {
        return res.status(409).json({
          success: false,
          error: 'Este pool personalizado ya existe'
        });
      }
    }

    const result = await pool.query(
      `INSERT INTO user_pools 
       (user_id, pool_id, custom_name, custom_url, custom_port, priority, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, true)
       RETURNING *`,
      [userId, pool_id || null, custom_name || null, custom_url || null, custom_port || null, priority || 0]
    );

    res.json({
      success: true,
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Error agregando pool del usuario:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

/**
 * PUT /api/pools/user/:id
 * Actualizar configuración de pool del usuario
 */
router.put('/user/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { priority, is_active, custom_name } = req.body;
    const userId = req.user.id;

    const updateFields = [];
    const values = [];
    let paramCount = 1;

    if (priority !== undefined) {
      updateFields.push(`priority = $${paramCount++}`);
      values.push(priority);
    }
    if (is_active !== undefined) {
      updateFields.push(`is_active = $${paramCount++}`);
      values.push(is_active);
    }
    if (custom_name !== undefined) {
      updateFields.push(`custom_name = $${paramCount++}`);
      values.push(custom_name);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No hay campos para actualizar'
      });
    }

    updateFields.push(`updated_at = NOW()`);
    values.push(id, userId);

    const query = `
      UPDATE user_pools 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramCount++} AND user_id = $${paramCount++}
      RETURNING *
    `;

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Pool del usuario no encontrado'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Error actualizando pool del usuario:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

/**
 * DELETE /api/pools/user/:id
 * Eliminar pool personalizado del usuario
 */
router.delete('/user/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await pool.query(
      `DELETE FROM user_pools 
       WHERE id = $1 AND user_id = $2
       RETURNING *`,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Pool del usuario no encontrado'
      });
    }

    res.json({
      success: true,
      message: 'Pool eliminado correctamente'
    });

  } catch (error) {
    console.error('Error eliminando pool del usuario:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

module.exports = router;

