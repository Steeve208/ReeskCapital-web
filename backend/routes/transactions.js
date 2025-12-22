/**
 * 📜 TRANSACTIONS ROUTES
 * Rutas para historial de transacciones
 */

const express = require('express');
const { pool } = require('../config/database');
const { userAuth } = require('../security/auth');
const router = express.Router();

router.use(userAuth);

/**
 * GET /api/transactions
 * Obtener transacciones
 */
router.get('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 50, offset = 0, type, start_date, end_date, status } = req.query;

    let query = `SELECT * FROM transactions WHERE user_id = $1`;
    const params = [userId];
    let paramCount = 2;

    if (type) {
      query += ` AND type = $${paramCount++}`;
      params.push(type);
    }
    if (status) {
      query += ` AND status = $${paramCount++}`;
      params.push(status);
    }
    if (start_date) {
      query += ` AND created_at >= $${paramCount++}`;
      params.push(start_date);
    }
    if (end_date) {
      query += ` AND created_at <= $${paramCount++}`;
      params.push(end_date);
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramCount++} OFFSET $${paramCount++}`;
    params.push(parseInt(limit), parseInt(offset));

    const result = await pool.query(query, params);

    // Obtener total
    let countQuery = `SELECT COUNT(*) FROM transactions WHERE user_id = $1`;
    const countParams = [userId];
    let countParamCount = 2;

    if (type) {
      countQuery += ` AND type = $${countParamCount++}`;
      countParams.push(type);
    }
    if (status) {
      countQuery += ` AND status = $${countParamCount++}`;
      countParams.push(status);
    }
    if (start_date) {
      countQuery += ` AND created_at >= $${countParamCount++}`;
      countParams.push(start_date);
    }
    if (end_date) {
      countQuery += ` AND created_at <= $${countParamCount++}`;
      countParams.push(end_date);
    }

    const countResult = await pool.query(countQuery, countParams);

    res.json({
      success: true,
      data: {
        transactions: result.rows,
        total: parseInt(countResult.rows[0].count),
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });

  } catch (error) {
    console.error('Error obteniendo transacciones:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

/**
 * GET /api/transactions/:id
 * Obtener detalles de transacción
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await pool.query(
      `SELECT * FROM transactions WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Transacción no encontrada'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Error obteniendo transacción:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

/**
 * GET /api/transactions/export
 * Exportar transacciones
 */
router.get('/export/:format', async (req, res) => {
  try {
    const { format } = req.params; // csv, json, pdf
    const userId = req.user.id;
    const { start_date, end_date, type } = req.query;

    let query = `SELECT * FROM transactions WHERE user_id = $1`;
    const params = [userId];
    let paramCount = 2;

    if (type) {
      query += ` AND type = $${paramCount++}`;
      params.push(type);
    }
    if (start_date) {
      query += ` AND created_at >= $${paramCount++}`;
      params.push(start_date);
    }
    if (end_date) {
      query += ` AND created_at <= $${paramCount++}`;
      params.push(end_date);
    }

    query += ` ORDER BY created_at DESC`;

    const result = await pool.query(query, params);

    if (format === 'csv') {
      const csv = require('../utils/csv');
      const csvData = csv.generateCSV(result.rows);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=transactions_${Date.now()}.csv`);
      res.send(csvData);
    } else if (format === 'json') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename=transactions_${Date.now()}.json`);
      res.json({
        success: true,
        data: result.rows
      });
    } else {
      return res.status(400).json({
        success: false,
        error: 'Formato no soportado. Use csv o json'
      });
    }

  } catch (error) {
    console.error('Error exportando transacciones:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

module.exports = router;

