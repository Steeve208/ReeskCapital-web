/**
 * 💰 EARNINGS & WITHDRAWALS ROUTES
 * Rutas para ganancias y retiros
 */

const express = require('express');
const { pool } = require('../config/database');
const { userAuth } = require('../security/auth');
const router = express.Router();

router.use(userAuth);

/**
 * GET /api/earnings/summary
 * Obtener resumen de ganancias
 */
router.get('/summary', async (req, res) => {
  try {
    const userId = req.user.id;
    const { period = 'all' } = req.query;

    // Obtener balance del usuario (available)
    const userResult = await pool.query(
      `SELECT balance FROM users WHERE id = $1`,
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado'
      });
    }

    const availableBalance = parseFloat(userResult.rows[0].balance || 0);

    // Calcular total: suma de todas las transacciones de tipo 'mining' (histórico completo)
    const totalResult = await pool.query(
      `SELECT COALESCE(SUM(amount), 0) as total
       FROM transactions
       WHERE user_id = $1 AND type = 'mining' AND amount > 0
       AND (COALESCE(status, 'completed') = 'completed' OR status IS NULL)`,
      [userId]
    );
    const total = parseFloat(totalResult.rows[0].total || 0);

    // Calcular pending: desde transactions con status 'pending' o withdrawals pendientes
    const pendingTransactionsResult = await pool.query(
      `SELECT COALESCE(SUM(ABS(amount)), 0) as pending_from_transactions
       FROM transactions
       WHERE user_id = $1 AND status = 'pending' AND type IN ('mining', 'withdrawal')`,
      [userId]
    );
    
    const pendingWithdrawalsResult = await pool.query(
      `SELECT COALESCE(SUM(amount), 0) as pending_from_withdrawals
       FROM withdrawals
       WHERE user_id = $1 AND status IN ('pending', 'processing')`,
      [userId]
    );
    
    const pending = parseFloat(pendingTransactionsResult.rows[0].pending_from_transactions || 0) + 
                    parseFloat(pendingWithdrawalsResult.rows[0].pending_from_withdrawals || 0);

    // Calcular withdrawn: desde withdrawals completados o transactions tipo 'withdrawal' completadas
    const withdrawnWithdrawalsResult = await pool.query(
      `SELECT COALESCE(SUM(amount), 0) as withdrawn_from_withdrawals
       FROM withdrawals
       WHERE user_id = $1 AND status = 'completed'`,
      [userId]
    );
    
    const withdrawnTransactionsResult = await pool.query(
      `SELECT COALESCE(SUM(ABS(amount)), 0) as withdrawn_from_transactions
       FROM transactions
       WHERE user_id = $1 AND type = 'withdrawal' 
       AND (COALESCE(status, 'completed') = 'completed' OR status IS NULL)`,
      [userId]
    );
    
    const withdrawn = parseFloat(withdrawnWithdrawalsResult.rows[0].withdrawn_from_withdrawals || 0) +
                      parseFloat(withdrawnTransactionsResult.rows[0].withdrawn_from_transactions || 0);

    res.json({
      success: true,
      data: {
        total: total,
        available: availableBalance,
        pending: pending,
        withdrawn: withdrawn
      }
    });

  } catch (error) {
    console.error('Error obteniendo resumen de ganancias:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

/**
 * GET /api/earnings/history
 * Obtener historial de ganancias
 */
router.get('/history', async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 50, offset = 0, start_date, end_date } = req.query;

    let query = `
      SELECT * FROM transactions
      WHERE user_id = $1 AND type = 'mining' AND amount > 0
    `;
    const params = [userId];
    let paramCount = 2;

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

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM transactions 
       WHERE user_id = $1 AND type = 'mining' AND amount > 0`,
      [userId]
    );

    res.json({
      success: true,
      data: {
        earnings: result.rows,
        total: parseInt(countResult.rows[0].count),
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });

  } catch (error) {
    console.error('Error obteniendo historial de ganancias:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

/**
 * POST /api/earnings/withdraw
 * Solicitar retiro
 */
router.post('/withdraw', async (req, res) => {
  try {
    const { amount, address, password } = req.body;
    const userId = req.user.id;

    // Validaciones
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Monto inválido'
      });
    }

    if (!address || address.length < 20) {
      return res.status(400).json({
        success: false,
        error: 'Dirección de wallet inválida'
      });
    }

    const MIN_WITHDRAWAL = 10.0; // Mínimo de retiro
    const WITHDRAWAL_FEE = 0.5; // Fee fijo

    if (amount < MIN_WITHDRAWAL) {
      return res.status(400).json({
        success: false,
        error: `El monto mínimo de retiro es ${MIN_WITHDRAWAL} tokens`
      });
    }

    // Obtener balance del usuario
    const userResult = await pool.query(
      `SELECT balance, password FROM users WHERE id = $1`,
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado'
      });
    }

    const userBalance = parseFloat(userResult.rows[0].balance || 0);
    const totalNeeded = amount + WITHDRAWAL_FEE;

    if (userBalance < totalNeeded) {
      return res.status(400).json({
        success: false,
        error: 'Balance insuficiente',
        required: totalNeeded,
        available: userBalance
      });
    }

    // Verificar contraseña si se proporciona
    if (password) {
      const { verifyPassword } = require('../security/auth');
      const isValid = await verifyPassword(password, userResult.rows[0].password);
      if (!isValid) {
        return res.status(401).json({
          success: false,
          error: 'Contraseña incorrecta'
        });
      }
    }

    // Crear retiro
    const netAmount = amount - WITHDRAWAL_FEE;
    const withdrawalResult = await pool.query(
      `INSERT INTO withdrawals 
       (user_id, amount, address, fee, net_amount, status)
       VALUES ($1, $2, $3, $4, $5, 'pending')
       RETURNING *`,
      [userId, amount, address, WITHDRAWAL_FEE, netAmount]
    );

    // Actualizar balance (reservar fondos)
    const newBalance = userBalance - totalNeeded;
    await pool.query(
      `UPDATE users SET balance = $1, updated_at = NOW() WHERE id = $2`,
      [newBalance, userId]
    );

    // Crear transacción
    await pool.query(
      `INSERT INTO transactions 
       (user_id, type, amount, balance_before, balance_after, reference_id, reference_type, description, status)
       VALUES ($1, 'withdrawal', $2, $3, $4, $5, 'withdrawal', $6, 'pending')`,
      [userId, -totalNeeded, userBalance, newBalance, withdrawalResult.rows[0].id, `Withdrawal request to ${address.substring(0, 10)}...`]
    );

    res.json({
      success: true,
      data: {
        withdrawal_id: withdrawalResult.rows[0].id,
        amount: amount,
        fee: WITHDRAWAL_FEE,
        net_amount: netAmount,
        address: address,
        status: 'pending',
        estimated_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 horas estimadas
      }
    });

  } catch (error) {
    console.error('Error procesando retiro:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

/**
 * GET /api/earnings/withdrawals
 * Obtener historial de retiros
 */
router.get('/withdrawals', async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 50, offset = 0, status } = req.query;

    let query = `SELECT * FROM withdrawals WHERE user_id = $1`;
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
      `SELECT COUNT(*) FROM withdrawals WHERE user_id = $1${status ? ` AND status = '${status}'` : ''}`,
      [userId]
    );

    res.json({
      success: true,
      data: {
        withdrawals: result.rows,
        total: parseInt(countResult.rows[0].count),
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });

  } catch (error) {
    console.error('Error obteniendo retiros:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

/**
 * GET /api/earnings/withdrawals/:id
 * Obtener detalles de un retiro
 */
router.get('/withdrawals/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await pool.query(
      `SELECT * FROM withdrawals WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Retiro no encontrado'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Error obteniendo detalles de retiro:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

/**
 * GET /api/earnings/breakdown
 * Obtener breakdown de ganancias por período
 */
router.get('/breakdown', async (req, res) => {
  try {
    const userId = req.user.id;
    const { period = 'month' } = req.query;

    const now = new Date();
    let startDate;
    let groupBy;

    switch (period) {
      case 'today':
        startDate = new Date(now.setHours(0, 0, 0, 0));
        groupBy = 'hour';
        break;
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - 7));
        groupBy = 'day';
        break;
      case 'month':
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        groupBy = 'day';
        break;
      case 'year':
        startDate = new Date(now.setFullYear(now.getFullYear() - 1));
        groupBy = 'month';
        break;
      default:
        startDate = new Date(0);
        groupBy = 'day';
    }

    let dateTrunc;
    switch (groupBy) {
      case 'hour':
        dateTrunc = `DATE_TRUNC('hour', created_at)`;
        break;
      case 'day':
        dateTrunc = `DATE(created_at)`;
        break;
      case 'month':
        dateTrunc = `DATE_TRUNC('month', created_at)`;
        break;
      default:
        dateTrunc = `DATE(created_at)`;
    }

    const breakdownResult = await pool.query(
      `SELECT 
        ${dateTrunc} as period_date,
        COALESCE(SUM(amount), 0) as earnings
       FROM transactions
       WHERE user_id = $1 
       AND type = 'mining' 
       AND amount > 0
       AND created_at >= $2
       AND (COALESCE(status, 'completed') = 'completed' OR status IS NULL)
       GROUP BY ${dateTrunc}
       ORDER BY period_date DESC`,
      [userId, startDate.toISOString()]
    );

    res.json({
      success: true,
      data: {
        period: period,
        breakdown: breakdownResult.rows.map(row => ({
          date: row.period_date,
          earnings: parseFloat(row.earnings || 0)
        }))
      }
    });

  } catch (error) {
    console.error('Error obteniendo breakdown de ganancias:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

module.exports = router;

