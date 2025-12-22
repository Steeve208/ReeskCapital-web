/**
 * 👥 REFERRALS ROUTES (Nueva versión)
 * Rutas para sistema de referidos
 */

const express = require('express');
const { pool } = require('../config/database');
const { userAuth } = require('../security/auth');
const router = express.Router();

router.use(userAuth);

/**
 * GET /api/referrals
 * Obtener lista de referidos con hashrate y earnings (query optimizada)
 */
router.get('/', async (req, res) => {
  try {
    const userId = req.user.id;

    // Query optimizada: obtiene todo en una sola consulta usando subconsultas
    const result = await pool.query(
      `SELECT 
        r.*,
        u.id as referred_id,
        u.email as referred_email,
        u.username as referred_username,
        u.created_at as referred_joined_at,
        u.balance as referred_balance,
        u.status as referred_status,
        u.is_active as referred_is_active,
        u.referral_code as referred_referral_code,
        -- Hashrate promedio del referido (desde sesiones completadas)
        COALESCE((
          SELECT AVG(hash_rate)
          FROM mining_sessions
          WHERE user_id = r.referred_id 
          AND status = 'completed'
        ), 0) as avg_hashrate,
        -- Earnings totales del referido (desde transactions tipo 'mining')
        COALESCE((
          SELECT SUM(amount)
          FROM transactions
          WHERE user_id = r.referred_id 
          AND type = 'mining' 
          AND amount > 0
          AND (COALESCE(status, 'completed') = 'completed' OR status IS NULL)
        ), 0) as total_earnings
       FROM referrals r
       JOIN users u ON r.referred_id = u.id
       WHERE r.referrer_id = $1
       ORDER BY r.created_at DESC`,
      [userId]
    );

    // Obtener totales (manejar tanto status VARCHAR como is_active BOOLEAN)
    const totalsResult = await pool.query(
      `SELECT 
        COUNT(*) as total_referrals,
        COUNT(CASE 
          WHEN (u.status = 'active' OR u.status IS NULL) 
          OR (u.is_active = true OR (u.is_active IS NULL AND u.status IS NULL))
          THEN 1 
        END) as active_referrals,
        COALESCE(SUM(r.total_commission), 0) as total_commissions
       FROM referrals r
       JOIN users u ON r.referred_id = u.id
       WHERE r.referrer_id = $1`,
      [userId]
    );

    // Obtener código de referral del usuario actual
    const userCodeResult = await pool.query(
      `SELECT referral_code FROM users WHERE id = $1`,
      [userId]
    );
    const referralCode = userCodeResult.rows[0]?.referral_code || null;

    res.json({
      success: true,
      data: {
        referrals: result.rows.map(row => ({
          ...row,
          avg_hashrate: parseFloat(row.avg_hashrate || 0),
          total_earnings: parseFloat(row.total_earnings || 0)
        })),
        total_referrals: parseInt(totalsResult.rows[0].total_referrals || 0),
        active_referrals: parseInt(totalsResult.rows[0].active_referrals || 0),
        total_commissions: parseFloat(totalsResult.rows[0].total_commissions || 0),
        referral_code: referralCode
      }
    });

  } catch (error) {
    console.error('Error obteniendo referidos:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

/**
 * GET /api/referrals/commissions
 * Obtener comisiones de referidos
 */
router.get('/commissions', async (req, res) => {
  try {
    const userId = req.user.id;
    const { period = 'month' } = req.query;

    const now = new Date();
    let startDate;

    switch (period) {
      case 'today':
        startDate = new Date(now.setHours(0, 0, 0, 0));
        break;
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'month':
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      case 'year':
        startDate = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
      default:
        startDate = new Date(0);
    }

    const result = await pool.query(
      `SELECT * FROM transactions
       WHERE user_id = $1 
       AND type = 'referral_commission' 
       AND created_at >= $2
       ORDER BY created_at DESC`,
      [userId, startDate.toISOString()]
    );

    const totalResult = await pool.query(
      `SELECT COALESCE(SUM(amount), 0) as period_total
       FROM transactions
       WHERE user_id = $1 
       AND type = 'referral_commission' 
       AND created_at >= $2`,
      [userId, startDate.toISOString()]
    );

    res.json({
      success: true,
      data: {
        commissions: result.rows,
        total: parseFloat(totalResult.rows[0].period_total || 0),
        period_total: parseFloat(totalResult.rows[0].period_total || 0)
      }
    });

  } catch (error) {
    console.error('Error obteniendo comisiones:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

/**
 * GET /api/referrals/stats
 * Obtener estadísticas de referidos
 */
router.get('/stats', async (req, res) => {
  try {
    const userId = req.user.id;

    // Obtener código de referral y datos del usuario
    const userResult = await pool.query(
      `SELECT 
        referral_code,
        email,
        username,
        balance,
        status,
        is_active,
        created_at
       FROM users 
       WHERE id = $1`,
      [userId]
    );

    // Obtener estadísticas (manejar tanto status VARCHAR como is_active BOOLEAN)
    const statsResult = await pool.query(
      `SELECT 
        COUNT(*) as total_referrals,
        COUNT(CASE 
          WHEN (u.status = 'active' OR u.status IS NULL) 
          OR (u.is_active = true OR (u.is_active IS NULL AND u.status IS NULL))
          THEN 1 
        END) as active_referrals,
        COALESCE(SUM(r.total_commission), 0) as total_commissions_earned,
        COALESCE(AVG(r.commission_rate), 0.1) as commission_rate
       FROM referrals r
       JOIN users u ON r.referred_id = u.id
       WHERE r.referrer_id = $1`,
      [userId]
    );

    const user = userResult.rows[0];
    
    res.json({
      success: true,
      data: {
        total_referrals: parseInt(statsResult.rows[0].total_referrals || 0),
        active_referrals: parseInt(statsResult.rows[0].active_referrals || 0),
        total_commissions_earned: parseFloat(statsResult.rows[0].total_commissions_earned || 0),
        commission_rate: parseFloat(statsResult.rows[0].commission_rate || 0.1),
        referral_code: user?.referral_code || null,
        user: user ? {
          email: user.email,
          username: user.username,
          balance: parseFloat(user.balance || 0),
          status: user.status,
          is_active: user.is_active
        } : null
      }
    });

  } catch (error) {
    console.error('Error obteniendo estadísticas de referidos:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

/**
 * GET /api/referrals/commissions-chart
 * Obtener datos de comisiones para el gráfico (últimos 30 días)
 */
router.get('/commissions-chart', async (req, res) => {
  try {
    const userId = req.user.id;
    const { days = 30 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const result = await pool.query(
      `SELECT 
        DATE(created_at) as date,
        COALESCE(SUM(amount), 0) as daily_commissions
       FROM transactions
       WHERE user_id = $1 
       AND type = 'referral_commission'
       AND created_at >= $2
       AND (COALESCE(status, 'completed') = 'completed' OR status IS NULL)
       GROUP BY DATE(created_at)
       ORDER BY date ASC`,
      [userId, startDate.toISOString()]
    );

    res.json({
      success: true,
      data: {
        chart_data: result.rows.map(row => ({
          date: row.date,
          commissions: parseFloat(row.daily_commissions || 0)
        }))
      }
    });

  } catch (error) {
    console.error('Error obteniendo datos del gráfico de comisiones:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

/**
 * POST /api/referrals/validate-code
 * Validar código de referido
 */
router.post('/validate-code', async (req, res) => {
  try {
    const { referral_code } = req.body;

    if (!referral_code) {
      return res.status(400).json({
        success: false,
        error: 'Código de referido es requerido'
      });
    }

    const result = await pool.query(
      `SELECT id, email, username FROM users 
       WHERE referral_code = $1 AND (status = 'active' OR status IS NULL)`,
      [referral_code]
    );

    if (result.rows.length === 0) {
      return res.json({
        success: true,
        data: {
          valid: false
        }
      });
    }

    res.json({
      success: true,
      data: {
        valid: true,
        referrer: {
          username: result.rows[0].username,
          email: result.rows[0].email
        }
      }
    });

  } catch (error) {
    console.error('Error validando código:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

module.exports = router;

