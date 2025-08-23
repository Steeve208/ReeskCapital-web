const express = require('express');
const { userAuth } = require('../security/auth');
const { miningLimiter } = require('../security/rateLimit');
const { 
  executeMining, 
  getUserMiningStats, 
  getUserMiningHistory 
} = require('../services/miningService');
const { pool } = require('../config/database');

const router = express.Router();

// Aplicar rate limiting específico para minería
router.use(miningLimiter);

/**
 * POST /mine/mine
 * Ejecuta la minería para el usuario autenticado
 */
router.post('/mine', userAuth, async (req, res) => {
  try {
    const user = req.user;
    const ip = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];
    
    console.log(`🔨 Usuario ${user.email} intentando minar desde IP: ${ip}`);
    
    // Ejecutar minería
    const result = await executeMining(user.id, ip, userAgent);
    
    if (!result.success) {
      return res.status(429).json({
        success: false,
        error: result.error,
        code: result.reason,
        ...(result.secondsLeft && { secondsLeft: result.secondsLeft }),
        ...(result.dailyTotal && { dailyTotal: result.dailyTotal }),
        ...(result.dailyCap && { dailyCap: result.dailyCap })
      });
    }
    
    console.log(`✅ Usuario ${user.email} minó exitosamente: ${result.reward} tokens`);
    
    res.json({
      success: true,
      message: result.message,
      data: {
        reward: result.reward,
        adjusted: result.adjusted,
        timestamp: new Date().toISOString(),
        user: {
          id: user.id,
          email: user.email
        }
      }
    });
    
  } catch (error) {
    console.error('Error ejecutando minería:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor durante la minería',
      code: 'MINING_ERROR'
    });
  }
});

/**
 * GET /mine/balance
 * Obtiene el balance minado del usuario autenticado
 */
router.get('/balance', userAuth, async (req, res) => {
  try {
    const user = req.user;
    
    const { rows: [userData] } = await pool.query(
      'SELECT mined_balance, last_mine FROM users WHERE id = $1',
      [user.id]
    );
    
    if (!userData) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado',
        code: 'USER_NOT_FOUND'
      });
    }
    
    res.json({
      success: true,
      data: {
        balance: parseFloat(userData.mined_balance || 0),
        lastMine: userData.last_mine,
        userId: user.id
      }
    });
    
  } catch (error) {
    console.error('Error obteniendo balance:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      code: 'INTERNAL_SERVER_ERROR'
    });
  }
});

/**
 * GET /mine/stats
 * Obtiene estadísticas detalladas de minería del usuario
 */
router.get('/stats', userAuth, async (req, res) => {
  try {
    const user = req.user;
    
    const stats = await getUserMiningStats(user.id);
    
    if (!stats) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado',
        code: 'USER_NOT_FOUND'
      });
    }
    
    res.json({
      success: true,
      data: stats
    });
    
  } catch (error) {
    console.error('Error obteniendo estadísticas de minería:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      code: 'INTERNAL_SERVER_ERROR'
    });
  }
});

/**
 * GET /mine/history
 * Obtiene el historial de minería del usuario
 */
router.get('/history', userAuth, async (req, res) => {
  try {
    const user = req.user;
    const { page = 1, pageSize = 20 } = req.query;
    
    const limit = Math.min(100, Math.max(1, parseInt(pageSize)));
    const offset = (parseInt(page) - 1) * limit;
    
    const history = await getUserMiningHistory(user.id, limit, offset);
    
    res.json({
      success: true,
      data: history
    });
    
  } catch (error) {
    console.error('Error obteniendo historial de minería:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      code: 'INTERNAL_SERVER_ERROR'
    });
  }
});

/**
 * GET /mine/status
 * Obtiene el estado actual de minería del usuario (si puede minar, cooldown, etc.)
 */
router.get('/status', userAuth, async (req, res) => {
  try {
    const user = req.user;
    
    const { rows: [userData] } = await pool.query(
      'SELECT last_mine, status FROM users WHERE id = $1',
      [user.id]
    );
    
    if (!userData) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado',
        code: 'USER_NOT_FOUND'
      });
    }
    
    // Obtener estadísticas del día
    const { rows: [dailyStats] } = await pool.query(
      `SELECT 
         COUNT(*) as total_mines_today,
         COALESCE(SUM(reward), 0) as total_reward_today
       FROM mining_events 
       WHERE user_id = $1 
       AND created_at::date = CURRENT_DATE`,
      [user.id]
    );
    
    const dailyTotal = parseFloat(dailyStats.total_reward_today || 0);
    const canMine = !userData.last_mine || 
      (new Date() - new Date(userData.last_mine)) >= 60 * 1000; // 60 segundos
    
    const cooldownRemaining = userData.last_mine ? 
      Math.max(0, 60 - Math.floor((new Date() - new Date(userData.last_mine)) / 1000)) : 0;
    
    res.json({
      success: true,
      data: {
        canMine,
        cooldownRemaining,
        dailyProgress: {
          total: dailyTotal,
          remaining: Math.max(0, 5 - dailyTotal), // 5 es el límite diario
          limit: 5
        },
        lastMine: userData.last_mine,
        status: userData.status
      }
    });
    
  } catch (error) {
    console.error('Error obteniendo estado de minería:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      code: 'INTERNAL_SERVER_ERROR'
    });
  }
});

/**
 * POST /mine/claim-daily
 * Reclama la recompensa diaria (si está disponible)
 */
router.post('/claim-daily', userAuth, async (req, res) => {
  try {
    const user = req.user;
    
    // Verificar si ya reclamó hoy
    const { rows: [dailyClaim] } = await pool.query(
      `SELECT 
         COUNT(*) as total_claims_today,
         COALESCE(SUM(reward), 0) as total_reward_today
       FROM mining_events 
       WHERE user_id = $1 
       AND created_at::date = CURRENT_DATE`,
      [user.id]
    );
    
    const totalClaims = parseInt(dailyClaim.total_claims_today || 0);
    const totalReward = parseFloat(dailyClaim.total_reward_today || 0);
    
    if (totalClaims >= 5) { // Máximo 5 minas por día
      return res.status(429).json({
        success: false,
        error: 'Ya has alcanzado el límite diario de minería',
        code: 'DAILY_LIMIT_REACHED',
        data: {
          dailyClaims: totalClaims,
          dailyLimit: 5,
          totalReward
        }
      });
    }
    
    // Ejecutar minería
    const ip = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];
    
    const result = await executeMining(user.id, ip, userAgent);
    
    if (!result.success) {
      return res.status(429).json({
        success: false,
        error: result.error,
        code: result.reason,
        ...(result.secondsLeft && { secondsLeft: result.secondsLeft })
      });
    }
    
    res.json({
      success: true,
      message: 'Recompensa diaria reclamada exitosamente',
      data: {
        reward: result.reward,
        dailyClaims: totalClaims + 1,
        dailyLimit: 5,
        totalDailyReward: totalReward + result.reward
      }
    });
    
  } catch (error) {
    console.error('Error reclamando recompensa diaria:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      code: 'INTERNAL_SERVER_ERROR'
    });
  }
});

module.exports = router;
