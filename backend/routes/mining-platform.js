/**
 * 🚀 RSC MINING PLATFORM - RUTAS COMPLETAS
 * 
 * Todas las rutas para la nueva plataforma de minería profesional
 * Conecta con Supabase para todas las operaciones
 */

const express = require('express');
const { pool } = require('../config/database');
const { userAuth } = require('../security/auth');
const router = express.Router();

// Aplicar autenticación a todas las rutas
router.use(userAuth);

// ===== CONFIGURACIÓN SUPABASE =====
// Nota: Si usas Supabase directamente, importa el cliente aquí
// Por ahora usamos PostgreSQL directo que es más compatible

// ===== MINING SESSIONS =====

/**
 * POST /api/mining/start
 * Iniciar sesión de minería
 */
router.post('/start', async (req, res) => {
  try {
    const { hash_rate, pool_url, algorithm, cpu_threads, intensity } = req.body;
    const userId = req.user.id;

    // Validaciones
    if (!hash_rate || hash_rate <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Hash rate válido es requerido'
      });
    }

    // Verificar si hay sesión activa
    const activeSession = await pool.query(
      `SELECT * FROM mining_sessions 
       WHERE user_id = $1 AND status = 'active' 
       ORDER BY start_time DESC LIMIT 1`,
      [userId]
    );

    if (activeSession.rows.length > 0) {
      return res.status(409).json({
        success: false,
        error: 'Ya existe una sesión de minería activa',
        session: activeSession.rows[0]
      });
    }

    // Crear nueva sesión
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const startTime = new Date();
    // Calcular tiempo de finalización automática (24 horas después)
    const endTimeAuto = new Date(startTime.getTime() + (24 * 60 * 60 * 1000));

    const result = await pool.query(
      `INSERT INTO mining_sessions 
       (user_id, session_id, start_time, hash_rate, pool_url, algorithm, cpu_threads, intensity, status, tokens_mined)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'active', 0)
       RETURNING *`,
      [userId, sessionId, startTime, hash_rate, pool_url || null, algorithm || 'sha256', cpu_threads || null, intensity || 'medium']
    );
    
    console.log(`✅ Sesión de minería iniciada: ${sessionId}`);
    console.log(`   Usuario: ${userId}`);
    console.log(`   Hash Rate: ${hash_rate} H/s`);
    console.log(`   Finalización automática: ${endTimeAuto.toISOString()}`);

    res.json({
      success: true,
      data: {
        session_id: sessionId,
        start_time: startTime.toISOString(),
        hash_rate: hash_rate,
        status: 'active'
      }
    });

  } catch (error) {
    console.error('Error iniciando sesión de minería:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

/**
 * PUT /api/mining/update/:sessionId
 * Actualizar sesión de minería
 */
router.put('/update/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { tokens_mined, hash_rate, efficiency, metadata } = req.body;
    const userId = req.user.id;

    // Verificar que la sesión pertenece al usuario
    const sessionCheck = await pool.query(
      `SELECT * FROM mining_sessions 
       WHERE session_id = $1 AND user_id = $2 AND status = 'active'`,
      [sessionId, userId]
    );

    if (sessionCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Sesión no encontrada o no activa'
      });
    }

    const currentSession = sessionCheck.rows[0];
    const updateData = {};
    const updateValues = [];
    let paramCount = 1;

    if (tokens_mined !== undefined) {
      updateData.tokens_mined = tokens_mined;
      updateValues.push(`tokens_mined = $${paramCount++}`);
    }
    if (hash_rate !== undefined) {
      updateData.hash_rate = hash_rate;
      updateValues.push(`hash_rate = $${paramCount++}`);
      // Actualizar peak_hash_rate si es mayor
      if (hash_rate > (currentSession.peak_hash_rate || 0)) {
        updateValues.push(`peak_hash_rate = $${paramCount++}`);
      }
    }
    if (efficiency !== undefined) {
      updateData.efficiency = efficiency;
      updateValues.push(`efficiency = $${paramCount++}`);
    }
    if (metadata) {
      updateData.metadata = metadata;
      updateValues.push(`metadata = $${paramCount++}::jsonb`);
    }

    updateValues.push(`updated_at = NOW()`);

    const values = Object.values(updateData);
    if (hash_rate > (currentSession.peak_hash_rate || 0)) {
      values.push(hash_rate);
    }

    const query = `
      UPDATE mining_sessions 
      SET ${updateValues.join(', ')}
      WHERE session_id = $${paramCount} AND user_id = $${paramCount + 1}
      RETURNING *
    `;
    values.push(sessionId, userId);

    const result = await pool.query(query, values);

    res.json({
      success: true,
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Error actualizando sesión:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

/**
 * POST /api/mining/stop/:sessionId
 * Detener sesión de minería
 */
router.post('/stop/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.id;

    // Obtener sesión activa
    const sessionResult = await pool.query(
      `SELECT * FROM mining_sessions 
       WHERE session_id = $1 AND user_id = $2 AND status = 'active'`,
      [sessionId, userId]
    );

    if (sessionResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Sesión activa no encontrada'
      });
    }

    const session = sessionResult.rows[0];
    const endTime = new Date();
    const startTime = new Date(session.start_time);
    const durationMs = endTime - startTime;
    const tokensMined = parseFloat(session.tokens_mined || 0);

    // Actualizar sesión
    await pool.query(
      `UPDATE mining_sessions 
       SET end_time = $1, duration_ms = $2, status = 'completed', updated_at = NOW()
       WHERE session_id = $3 AND user_id = $4`,
      [endTime, durationMs, sessionId, userId]
    );

    // Actualizar balance del usuario si hay tokens minados
    if (tokensMined > 0) {
      // Obtener balance actual
      const userResult = await pool.query(
        `SELECT balance FROM users WHERE id = $1`,
        [userId]
      );

      if (userResult.rows.length > 0) {
        const balanceBefore = parseFloat(userResult.rows[0].balance || 0);
        const balanceAfter = balanceBefore + tokensMined;

        // Actualizar balance
        await pool.query(
          `UPDATE users SET balance = $1, updated_at = NOW() WHERE id = $2`,
          [balanceAfter, userId]
        );

        // Crear transacción
        await pool.query(
          `INSERT INTO transactions 
           (user_id, type, amount, balance_before, balance_after, reference_id, reference_type, description, status)
           VALUES ($1, 'mining', $2, $3, $4, $5, 'mining_session', $6, 'completed')`,
          [userId, tokensMined, balanceBefore, balanceAfter, session.id, `Mining session completed - ${Math.floor(durationMs / 1000)}s`]
        );

        // Procesar comisiones de referidos
        await processReferralCommission(userId, tokensMined);
      }
    }

    res.json({
      success: true,
      data: {
        session_id: sessionId,
        end_time: endTime.toISOString(),
        duration_ms: durationMs,
        tokens_mined: tokensMined,
        final_balance: userResult?.rows[0] ? parseFloat(userResult.rows[0].balance || 0) + tokensMined : 0
      }
    });

  } catch (error) {
    console.error('Error deteniendo sesión:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

/**
 * GET /api/mining/active
 * Obtener sesión activa
 */
router.get('/active', async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `SELECT * FROM mining_sessions 
       WHERE user_id = $1 AND status = 'active' 
       ORDER BY start_time DESC LIMIT 1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.json({
        success: true,
        data: { session: null }
      });
    }

    res.json({
      success: true,
      data: { session: result.rows[0] }
    });

  } catch (error) {
    console.error('Error obteniendo sesión activa:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

/**
 * GET /api/mining/history
 * Obtener historial de sesiones
 */
router.get('/history', async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 50, offset = 0, start_date, end_date } = req.query;

    let query = `
      SELECT * FROM mining_sessions 
      WHERE user_id = $1
    `;
    const params = [userId];
    let paramCount = 2;

    if (start_date) {
      query += ` AND start_time >= $${paramCount++}`;
      params.push(start_date);
    }
    if (end_date) {
      query += ` AND start_time <= $${paramCount++}`;
      params.push(end_date);
    }

    query += ` ORDER BY start_time DESC LIMIT $${paramCount++} OFFSET $${paramCount++}`;
    params.push(parseInt(limit), parseInt(offset));

    const result = await pool.query(query, params);

    // Obtener total
    const countResult = await pool.query(
      `SELECT COUNT(*) FROM mining_sessions WHERE user_id = $1`,
      [userId]
    );

    res.json({
      success: true,
      data: {
        sessions: result.rows,
        total: parseInt(countResult.rows[0].count),
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });

  } catch (error) {
    console.error('Error obteniendo historial:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

/**
 * GET /api/mining/stats
 * Obtener estadísticas de minería
 */
router.get('/stats', async (req, res) => {
  try {
    const userId = req.user.id;
    const { period = 'all' } = req.query;

    let dateFilter = '';
    const params = [userId];

    if (period !== 'all') {
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
      }

      if (startDate) {
        dateFilter = ` AND start_time >= $2`;
        params.push(startDate.toISOString());
      }
    }

    const statsQuery = `
      SELECT 
        COUNT(*) as total_sessions,
        COALESCE(SUM(tokens_mined), 0) as total_tokens_mined,
        COALESCE(SUM(duration_ms), 0) as total_duration_ms,
        COALESCE(AVG(hash_rate), 0) as avg_hashrate,
        COALESCE(MAX(peak_hash_rate), 0) as peak_hashrate,
        COALESCE(AVG(efficiency), 0) as avg_efficiency
      FROM mining_sessions
      WHERE user_id = $1 AND status = 'completed' ${dateFilter}
    `;

    const result = await pool.query(statsQuery, params);

    res.json({
      success: true,
      data: {
        total_tokens_mined: parseFloat(result.rows[0].total_tokens_mined || 0),
        total_sessions: parseInt(result.rows[0].total_sessions || 0),
        total_duration_ms: parseInt(result.rows[0].total_duration_ms || 0),
        avg_hashrate: parseFloat(result.rows[0].avg_hashrate || 0),
        peak_hashrate: parseFloat(result.rows[0].peak_hashrate || 0),
        avg_efficiency: parseFloat(result.rows[0].avg_efficiency || 0)
      }
    });

  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

/**
 * GET /api/mining/hashrate-history
 * Obtener historial de hashrate
 */
router.get('/hashrate-history', async (req, res) => {
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

    const result = await pool.query(
      `SELECT 
        start_time as time,
        hash_rate as hashrate,
        tokens_mined
       FROM mining_sessions
       WHERE user_id = $1 AND start_time >= $2
       ORDER BY start_time ASC`,
      [userId, startDate.toISOString()]
    );

    res.json({
      success: true,
      data: {
        history: result.rows.map(row => ({
          time: row.time,
          hashrate: parseFloat(row.hashrate || 0),
          tokens_mined: parseFloat(row.tokens_mined || 0)
        }))
      }
    });

  } catch (error) {
    console.error('Error obteniendo historial de hashrate:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

/**
 * GET /api/mining/dashboard
 * Obtener todas las estadísticas del dashboard
 */
router.get('/dashboard', async (req, res) => {
  try {
    const userId = req.user.id;

    // Obtener sesión activa para hashrate actual y uptime
    const activeSessionResult = await pool.query(
      `SELECT hash_rate, start_time, tokens_mined
       FROM mining_sessions 
       WHERE user_id = $1 AND status = 'active' 
       ORDER BY start_time DESC LIMIT 1`,
      [userId]
    );

    const activeSession = activeSessionResult.rows[0];
    let currentHashrate = 0;
    let uptimeSeconds = 0;

    if (activeSession) {
      currentHashrate = parseFloat(activeSession.hash_rate || 0);
      const startTime = new Date(activeSession.start_time);
      const now = new Date();
      uptimeSeconds = Math.floor((now - startTime) / 1000);
    }

    // Calcular hashrate promedio desde todas las sesiones completadas
    const avgHashrateResult = await pool.query(
      `SELECT COALESCE(AVG(hash_rate), 0) as avg_hashrate
       FROM mining_sessions
       WHERE user_id = $1 AND status = 'completed'`,
      [userId]
    );
    const avgHashrate = parseFloat(avgHashrateResult.rows[0].avg_hashrate || 0);

    // Obtener balance del usuario
    const userResult = await pool.query(
      `SELECT balance FROM users WHERE id = $1`,
      [userId]
    );
    const balance = parseFloat(userResult.rows[0]?.balance || 0);

    // Calcular ganancias de hoy desde transactions
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    
    // Consulta que funciona con o sin campo status (usando COALESCE para manejar NULL)
    const todayEarningsResult = await pool.query(
      `SELECT COALESCE(SUM(amount), 0) as today_earnings
       FROM transactions
       WHERE user_id = $1 
       AND type = 'mining'
       AND created_at >= $2
       AND (COALESCE(status, 'completed') = 'completed' OR status IS NULL)`,
      [userId, todayStart.toISOString()]
    );
    const todayEarnings = parseFloat(todayEarningsResult.rows[0].today_earnings || 0);

    res.json({
      success: true,
      data: {
        current_hashrate: currentHashrate,
        avg_hashrate: avgHashrate,
        total_balance: balance,
        available_balance: balance,
        today_earnings: todayEarnings,
        uptime_seconds: uptimeSeconds
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
 * GET /api/mining/charts-data
 * Obtener datos para los gráficos (hashrate y earnings)
 */
router.get('/charts-data', async (req, res) => {
  try {
    const userId = req.user.id;
    const { range = '24h' } = req.query;

    const now = new Date();
    let startDate;
    let intervalMinutes = 60; // Intervalo por defecto 1 hora

    switch (range) {
      case '24h':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        intervalMinutes = 60; // 1 hora
        break;
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        intervalMinutes = 240; // 4 horas
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        intervalMinutes = 1440; // 1 día
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        intervalMinutes = 4320; // 3 días
        break;
      default:
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }

    // Obtener datos de hashrate desde mining_sessions
    const hashrateResult = await pool.query(
      `SELECT 
        DATE_TRUNC('hour', start_time) as time_bucket,
        AVG(hash_rate) as avg_hashrate
       FROM mining_sessions
       WHERE user_id = $1 AND start_time >= $2
       GROUP BY time_bucket
       ORDER BY time_bucket ASC`,
      [userId, startDate.toISOString()]
    );

    // Obtener datos de earnings desde transactions
    const earningsResult = await pool.query(
      `SELECT 
        DATE_TRUNC('hour', created_at) as time_bucket,
        SUM(amount) as total_earnings
       FROM transactions
       WHERE user_id = $1 
       AND type = 'mining'
       AND created_at >= $2
       AND status = 'completed'
       GROUP BY time_bucket
       ORDER BY time_bucket ASC`,
      [userId, startDate.toISOString()]
    );

    // Formatear datos de hashrate
    const hashrateData = hashrateResult.rows.map(row => ({
      time: row.time_bucket,
      value: parseFloat(row.avg_hashrate || 0)
    }));

    // Formatear datos de earnings
    const earningsData = earningsResult.rows.map(row => ({
      time: row.time_bucket,
      value: parseFloat(row.total_earnings || 0)
    }));

    res.json({
      success: true,
      data: {
        hashrate: hashrateData,
        earnings: earningsData
      }
    });

  } catch (error) {
    console.error('Error obteniendo datos de gráficos:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

/**
 * GET /api/mining/usd-rate
 * Obtener tasa de conversión USD
 */
router.get('/usd-rate', async (req, res) => {
  try {
    // Por ahora retornamos un valor fijo, pero se puede integrar con una API externa
    // TODO: Integrar con API de precios de criptomonedas
    const usdRate = parseFloat(process.env.RSC_USD_RATE || '0.5');

    res.json({
      success: true,
      data: {
        usd_rate: usdRate,
        last_updated: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error obteniendo tasa USD:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// ===== FUNCIONES AUXILIARES =====

/**
 * Procesar comisión de referido
 */
async function processReferralCommission(userId, amount) {
  try {
    // Obtener usuario y su referrer
    const userResult = await pool.query(
      `SELECT referred_by FROM users WHERE id = $1`,
      [userId]
    );

    if (userResult.rows.length === 0 || !userResult.rows[0].referred_by) {
      return; // No tiene referrer
    }

    const referrerId = userResult.rows[0].referred_by;

    // Obtener tasa de comisión
    const referralResult = await pool.query(
      `SELECT commission_rate FROM referrals 
       WHERE referrer_id = $1 AND referred_id = $2`,
      [referrerId, userId]
    );

    const commissionRate = referralResult.rows.length > 0 
      ? parseFloat(referralResult.rows[0].commission_rate || 0.1)
      : 0.1; // 10% por defecto

    const commissionAmount = amount * commissionRate;

    // Obtener balance del referrer
    const referrerBalanceResult = await pool.query(
      `SELECT balance FROM users WHERE id = $1`,
      [referrerId]
    );

    if (referrerBalanceResult.rows.length === 0) {
      return;
    }

    const balanceBefore = parseFloat(referrerBalanceResult.rows[0].balance || 0);
    const balanceAfter = balanceBefore + commissionAmount;

    // Actualizar balance del referrer
    await pool.query(
      `UPDATE users SET balance = $1, updated_at = NOW() WHERE id = $2`,
      [balanceAfter, referrerId]
    );

    // Actualizar comisión total
    await pool.query(
      `UPDATE referrals 
       SET total_commission = COALESCE(total_commission, 0) + $1, updated_at = NOW()
       WHERE referrer_id = $2 AND referred_id = $3`,
      [commissionAmount, referrerId, userId]
    );

    // Crear transacción de comisión
    await pool.query(
      `INSERT INTO transactions 
       (user_id, type, amount, balance_before, balance_after, reference_id, reference_type, description, status)
       VALUES ($1, 'referral_commission', $2, $3, $4, $5, 'referral', $6, 'completed')`,
      [referrerId, commissionAmount, balanceBefore, balanceAfter, userId, `Commission from referred user mining`]
    );

  } catch (error) {
    console.error('Error procesando comisión de referido:', error);
  }
}

module.exports = router;

