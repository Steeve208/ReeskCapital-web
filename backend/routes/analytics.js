/**
 * 📊 ANALYTICS ROUTES
 * Rutas para analytics y reportes
 */

const express = require('express');
const { pool } = require('../config/database');
const { userAuth } = require('../security/auth');
const router = express.Router();

router.use(userAuth);

/**
 * GET /api/analytics/dashboard
 * Obtener datos del dashboard
 */
router.get('/dashboard', async (req, res) => {
  try {
    const userId = req.user.id;

    // Obtener stats básicas
    const userResult = await pool.query(
      `SELECT balance FROM users WHERE id = $1`,
      [userId]
    );

    // Obtener sesión activa
    const activeSessionResult = await pool.query(
      `SELECT * FROM mining_sessions 
       WHERE user_id = $1 AND status = 'active' 
       ORDER BY start_time DESC LIMIT 1`,
      [userId]
    );

    // Obtener ganancias de hoy
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEarningsResult = await pool.query(
      `SELECT COALESCE(SUM(amount), 0) as today_earnings
       FROM transactions
       WHERE user_id = $1 AND type = 'mining' AND amount > 0 AND created_at >= $2`,
      [userId, todayStart.toISOString()]
    );

    // Obtener hashrate history (últimas 24 horas)
    const hashrateHistoryResult = await pool.query(
      `SELECT start_time as time, hash_rate as hashrate
       FROM mining_sessions
       WHERE user_id = $1 AND start_time >= NOW() - INTERVAL '24 hours'
       ORDER BY start_time ASC`,
      [userId]
    );

    // Obtener earnings history (últimos 7 días)
    const earningsHistoryResult = await pool.query(
      `SELECT DATE(created_at) as date, COALESCE(SUM(amount), 0) as earnings
       FROM transactions
       WHERE user_id = $1 AND type = 'mining' AND amount > 0 
       AND created_at >= NOW() - INTERVAL '7 days'
       GROUP BY DATE(created_at)
       ORDER BY date ASC`,
      [userId]
    );

    // Obtener actividad reciente
    const recentActivityResult = await pool.query(
      `SELECT 
        'transaction' as type,
        created_at,
        type as transaction_type,
        amount,
        description
       FROM transactions
       WHERE user_id = $1
       UNION ALL
       SELECT 
        'mining_session' as type,
        start_time as created_at,
        'mining' as transaction_type,
        tokens_mined as amount,
        CONCAT('Mining session - ', session_id) as description
       FROM mining_sessions
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT 10`,
      [userId]
    );

    res.json({
      success: true,
      data: {
        stats: {
          current_hashrate: activeSessionResult.rows[0]?.hash_rate || 0,
          balance: parseFloat(userResult.rows[0]?.balance || 0),
          today_earnings: parseFloat(todayEarningsResult.rows[0]?.today_earnings || 0),
          uptime_percentage: 99.5 // Calcular basado en sesiones
        },
        hashrate_history: hashrateHistoryResult.rows.map(row => ({
          time: row.time,
          value: parseFloat(row.hashrate || 0)
        })),
        earnings_history: earningsHistoryResult.rows.map(row => ({
          time: row.date,
          value: parseFloat(row.earnings || 0)
        })),
        recent_activity: recentActivityResult.rows
      }
    });

  } catch (error) {
    console.error('Error obteniendo datos del dashboard:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

/**
 * GET /api/analytics/performance
 * Obtener métricas de rendimiento
 */
router.get('/performance', async (req, res) => {
  try {
    const userId = req.user.id;
    const { range = '24h' } = req.query;

    const now = new Date();
    let startDate;

    switch (range) {
      case '24h':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(0);
    }

    // Obtener datos de hashrate
    const hashrateResult = await pool.query(
      `SELECT start_time as time, hash_rate as value
       FROM mining_sessions
       WHERE user_id = $1 AND start_time >= $2
       ORDER BY start_time ASC`,
      [userId, startDate.toISOString()]
    );

    // Obtener datos de earnings
    const earningsResult = await pool.query(
      `SELECT created_at as time, amount as value
       FROM transactions
       WHERE user_id = $1 AND type = 'mining' AND amount > 0 AND created_at >= $2
       ORDER BY created_at ASC`,
      [userId, startDate.toISOString()]
    );

    // Obtener datos de efficiency
    const efficiencyResult = await pool.query(
      `SELECT start_time as time, efficiency as value
       FROM mining_sessions
       WHERE user_id = $1 AND start_time >= $2 AND efficiency IS NOT NULL
       ORDER BY start_time ASC`,
      [userId, startDate.toISOString()]
    );

    // Comparar con período anterior
    const previousStartDate = new Date(startDate.getTime() - (now.getTime() - startDate.getTime()));
    const previousEarningsResult = await pool.query(
      `SELECT COALESCE(SUM(amount), 0) as total
       FROM transactions
       WHERE user_id = $1 AND type = 'mining' AND amount > 0 
       AND created_at >= $2 AND created_at < $3`,
      [userId, previousStartDate.toISOString(), startDate.toISOString()]
    );

    const currentEarningsResult = await pool.query(
      `SELECT COALESCE(SUM(amount), 0) as total
       FROM transactions
       WHERE user_id = $1 AND type = 'mining' AND amount > 0 AND created_at >= $2`,
      [userId, startDate.toISOString()]
    );

    const previousTotal = parseFloat(previousEarningsResult.rows[0]?.total || 0);
    const currentTotal = parseFloat(currentEarningsResult.rows[0]?.total || 0);
    const changePercentage = previousTotal > 0 
      ? ((currentTotal - previousTotal) / previousTotal) * 100 
      : 0;

    res.json({
      success: true,
      data: {
        hashrate_data: hashrateResult.rows.map(row => ({
          time: row.time,
          value: parseFloat(row.value || 0)
        })),
        earnings_data: earningsResult.rows.map(row => ({
          time: row.time,
          value: parseFloat(row.value || 0)
        })),
        efficiency_data: efficiencyResult.rows.map(row => ({
          time: row.time,
          value: parseFloat(row.value || 0)
        })),
        comparison: {
          previous_period: {
            total: previousTotal,
            start_date: previousStartDate.toISOString(),
            end_date: startDate.toISOString()
          },
          current_period: {
            total: currentTotal,
            start_date: startDate.toISOString(),
            end_date: now.toISOString()
          },
          change_percentage: changePercentage
        }
      }
    });

  } catch (error) {
    console.error('Error obteniendo métricas de rendimiento:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

/**
 * GET /api/analytics/distribution
 * Obtener distribución de minería
 */
router.get('/distribution', async (req, res) => {
  try {
    const userId = req.user.id;
    const { period = 'month' } = req.query;

    const now = new Date();
    let startDate;

    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(0);
    }

    // Distribución por pool
    const poolDistributionResult = await pool.query(
      `SELECT 
        COALESCE(pool_url, 'unknown') as pool,
        COUNT(*) as sessions,
        COALESCE(SUM(tokens_mined), 0) as tokens_mined
       FROM mining_sessions
       WHERE user_id = $1 AND start_time >= $2
       GROUP BY pool_url`,
      [userId, startDate.toISOString()]
    );

    // Distribución por algoritmo
    const algorithmDistributionResult = await pool.query(
      `SELECT 
        COALESCE(algorithm, 'unknown') as algorithm,
        COUNT(*) as sessions,
        COALESCE(SUM(tokens_mined), 0) as tokens_mined
       FROM mining_sessions
       WHERE user_id = $1 AND start_time >= $2
       GROUP BY algorithm`,
      [userId, startDate.toISOString()]
    );

    // Distribución por hora del día
    const timeDistributionResult = await pool.query(
      `SELECT 
        EXTRACT(HOUR FROM start_time) as hour,
        COUNT(*) as sessions,
        COALESCE(SUM(tokens_mined), 0) as tokens_mined
       FROM mining_sessions
       WHERE user_id = $1 AND start_time >= $2
       GROUP BY EXTRACT(HOUR FROM start_time)
       ORDER BY hour`,
      [userId, startDate.toISOString()]
    );

    res.json({
      success: true,
      data: {
        by_pool: poolDistributionResult.rows.map(row => ({
          pool: row.pool,
          sessions: parseInt(row.sessions),
          tokens_mined: parseFloat(row.tokens_mined || 0)
        })),
        by_algorithm: algorithmDistributionResult.rows.map(row => ({
          algorithm: row.algorithm,
          sessions: parseInt(row.sessions),
          tokens_mined: parseFloat(row.tokens_mined || 0)
        })),
        by_time_of_day: timeDistributionResult.rows.map(row => ({
          hour: parseInt(row.hour),
          sessions: parseInt(row.sessions),
          tokens_mined: parseFloat(row.tokens_mined || 0)
        }))
      }
    });

  } catch (error) {
    console.error('Error obteniendo distribución:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

module.exports = router;

