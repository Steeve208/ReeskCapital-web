/**
 * 🎫 SUPPORT ROUTES
 * Rutas para tickets de soporte
 */

const express = require('express');
const { pool } = require('../config/database');
const { userAuth } = require('../security/auth');
const router = express.Router();

router.use(userAuth);

/**
 * GET /api/support/tickets
 * Obtener tickets de soporte
 */
router.get('/tickets', async (req, res) => {
  try {
    const userId = req.user.id;
    const { status, limit = 50, offset = 0 } = req.query;

    let query = `SELECT * FROM support_tickets WHERE user_id = $1`;
    const params = [userId];
    let paramCount = 2;

    if (status) {
      query += ` AND status = $${paramCount++}`;
      params.push(status);
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramCount++} OFFSET $${paramCount++}`;
    params.push(parseInt(limit), parseInt(offset));

    const result = await pool.query(query, params);

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM support_tickets WHERE user_id = $1${status ? ` AND status = '${status}'` : ''}`,
      [userId]
    );

    res.json({
      success: true,
      data: {
        tickets: result.rows,
        total: parseInt(countResult.rows[0].count),
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });

  } catch (error) {
    console.error('Error obteniendo tickets:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

/**
 * POST /api/support/tickets
 * Crear ticket de soporte
 */
router.post('/tickets', async (req, res) => {
  try {
    const userId = req.user.id;
    const { subject, message, category, priority } = req.body;

    if (!subject || !message) {
      return res.status(400).json({
        success: false,
        error: 'Asunto y mensaje son requeridos'
      });
    }

    const result = await pool.query(
      `INSERT INTO support_tickets 
       (user_id, subject, message, category, priority, status)
       VALUES ($1, $2, $3, $4, $5, 'open')
       RETURNING *`,
      [userId, subject, message, category || 'general', priority || 'medium']
    );

    res.json({
      success: true,
      data: {
        ticket_id: result.rows[0].id,
        status: 'open',
        created_at: result.rows[0].created_at
      }
    });

  } catch (error) {
    console.error('Error creando ticket:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

/**
 * GET /api/support/tickets/:id
 * Obtener detalles de ticket
 */
router.get('/tickets/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await pool.query(
      `SELECT * FROM support_tickets WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Ticket no encontrado'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Error obteniendo ticket:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

/**
 * POST /api/support/tickets/:id/respond
 * Responder a ticket
 */
router.post('/tickets/:id/respond', async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;
    const userId = req.user.id;

    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'Mensaje es requerido'
      });
    }

    // Obtener ticket
    const ticketResult = await pool.query(
      `SELECT responses FROM support_tickets WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );

    if (ticketResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Ticket no encontrado'
      });
    }

    const responses = ticketResult.rows[0].responses || [];
    responses.push({
      user_id: userId,
      message: message,
      created_at: new Date().toISOString()
    });

    await pool.query(
      `UPDATE support_tickets 
       SET responses = $1, status = 'in_progress', updated_at = NOW()
       WHERE id = $2 AND user_id = $3`,
      [JSON.stringify(responses), id, userId]
    );

    res.json({
      success: true,
      message: 'Respuesta agregada correctamente'
    });

  } catch (error) {
    console.error('Error respondiendo ticket:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

module.exports = router;

