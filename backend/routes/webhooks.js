/**
 * 🪝 WEBHOOKS ROUTES
 * Rutas para gestión de webhooks
 */

const express = require('express');
const crypto = require('crypto');
const { pool } = require('../config/database');
const { userAuth } = require('../security/auth');
const router = express.Router();

router.use(userAuth);

/**
 * GET /api/webhooks
 * Obtener webhooks del usuario
 */
router.get('/', async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `SELECT id, url, events, status, last_triggered, failure_count, created_at
       FROM webhooks
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId]
    );

    res.json({
      success: true,
      data: {
        webhooks: result.rows
      }
    });

  } catch (error) {
    console.error('Error obteniendo webhooks:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

/**
 * POST /api/webhooks
 * Crear webhook
 */
router.post('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const { url, events } = req.body;

    if (!url || !events || !Array.isArray(events) || events.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'URL y eventos son requeridos'
      });
    }

    // Validar URL
    try {
      new URL(url);
    } catch (e) {
      return res.status(400).json({
        success: false,
        error: 'URL inválida'
      });
    }

    // Generar secret
    const secret = crypto.randomBytes(32).toString('hex');

    const result = await pool.query(
      `INSERT INTO webhooks 
       (user_id, url, events, secret, status)
       VALUES ($1, $2, $3, $4, 'active')
       RETURNING id, url, events, status, created_at`,
      [userId, url, JSON.stringify(events), secret]
    );

    res.json({
      success: true,
      data: {
        webhook_id: result.rows[0].id,
        url: url,
        events: events,
        status: 'active',
        secret: secret // Solo se muestra una vez
      }
    });

  } catch (error) {
    console.error('Error creando webhook:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

/**
 * PUT /api/webhooks/:id
 * Actualizar webhook
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { url, events, status } = req.body;
    const userId = req.user.id;

    const updateFields = [];
    const values = [];
    let paramCount = 1;

    if (url) {
      try {
        new URL(url);
        updateFields.push(`url = $${paramCount++}`);
        values.push(url);
      } catch (e) {
        return res.status(400).json({
          success: false,
          error: 'URL inválida'
        });
      }
    }
    if (events) {
      updateFields.push(`events = $${paramCount++}`);
      values.push(JSON.stringify(events));
    }
    if (status) {
      updateFields.push(`status = $${paramCount++}`);
      values.push(status);
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
      UPDATE webhooks 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramCount++} AND user_id = $${paramCount++}
      RETURNING *
    `;

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Webhook no encontrado'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Error actualizando webhook:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

/**
 * DELETE /api/webhooks/:id
 * Eliminar webhook
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await pool.query(
      `DELETE FROM webhooks 
       WHERE id = $1 AND user_id = $2
       RETURNING *`,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Webhook no encontrado'
      });
    }

    res.json({
      success: true,
      message: 'Webhook eliminado correctamente'
    });

  } catch (error) {
    console.error('Error eliminando webhook:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

/**
 * POST /api/webhooks/:id/test
 * Probar webhook
 */
router.post('/:id/test', async (req, res) => {
  try {
    const { id } = req.params;
    const { event, data } = req.body;
    const userId = req.user.id;

    const result = await pool.query(
      `SELECT * FROM webhooks 
       WHERE id = $1 AND user_id = $2 AND status = 'active'`,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Webhook no encontrado o inactivo'
      });
    }

    const webhook = result.rows[0];

    // En producción, aquí harías una request HTTP real al webhook
    // Por ahora solo simulamos
    const testPayload = {
      event: event || 'test',
      data: data || { test: true },
      timestamp: new Date().toISOString()
    };

    // Actualizar last_triggered
    await pool.query(
      `UPDATE webhooks 
       SET last_triggered = NOW(), updated_at = NOW()
       WHERE id = $1`,
      [id]
    );

    res.json({
      success: true,
      data: {
        webhook_id: id,
        url: webhook.url,
        payload: testPayload,
        status: 'sent',
        message: 'Webhook test enviado (simulado)'
      }
    });

  } catch (error) {
    console.error('Error probando webhook:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

module.exports = router;

