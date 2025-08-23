const { pool } = require('../config/database');
const config = require('../config/env');
const { checkCooldown } = require('../utils/time');

/**
 * Genera una recompensa aleatoria dentro del rango configurado
 * @returns {number} Recompensa generada
 */
function generateRandomReward() {
  const { rewardMin, rewardMax } = config.mining;
  const reward = Math.random() * (rewardMax - rewardMin) + rewardMin;
  return Number(reward.toFixed(8)); // 8 decimales para precisión
}

/**
 * Verifica si un usuario puede minar basado en cooldown y límites diarios
 * @param {string} userId - ID del usuario
 * @param {string} ip - IP del usuario (opcional)
 * @param {string} userAgent - User agent del usuario (opcional)
 * @returns {Object} Resultado de la verificación
 */
async function canUserMine(userId, ip = null, userAgent = null) {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Obtener información del usuario con bloqueo
    const { rows: [user] } = await client.query(
      'SELECT mined_balance, last_mine, status FROM users WHERE id = $1 FOR UPDATE',
      [userId]
    );
    
    if (!user) {
      await client.query('ROLLBACK');
      return { 
        canMine: false, 
        reason: 'USER_NOT_FOUND',
        error: 'Usuario no encontrado'
      };
    }
    
    if (user.status !== 'active') {
      await client.query('ROLLBACK');
      return { 
        canMine: false, 
        reason: 'USER_INACTIVE',
        error: 'Usuario inactivo'
      };
    }
    
    // Verificar cooldown
    if (user.last_mine) {
      const cooldownCheck = checkCooldown(user.last_mine, config.mining.cooldownSeconds);
      if (!cooldownCheck.canProceed) {
        await client.query('ROLLBACK');
        return { 
          canMine: false, 
          reason: 'COOLDOWN',
          error: 'Debes esperar antes de minar de nuevo',
          secondsLeft: cooldownCheck.secondsLeft,
          cooldownSeconds: config.mining.cooldownSeconds
        };
      }
    }
    
    // Verificar límite diario
    const { rows: [{ daily_total }] } = await client.query(
      `SELECT COALESCE(SUM(reward), 0) as daily_total
       FROM mining_events 
       WHERE user_id = $1 
       AND created_at::date = CURRENT_DATE`,
      [userId]
    );
    
    const currentDailyTotal = parseFloat(daily_total);
    if (currentDailyTotal >= config.mining.dailyCap) {
      await client.query('ROLLBACK');
      return { 
        canMine: false, 
        reason: 'DAILY_CAP_REACHED',
        error: 'Has alcanzado el límite diario de minería',
        dailyTotal: currentDailyTotal,
        dailyCap: config.mining.dailyCap
      };
    }
    
    await client.query('COMMIT');
    
    return { 
      canMine: true,
      dailyTotal: currentDailyTotal,
      dailyCap: config.mining.dailyCap,
      remainingDaily: config.mining.dailyCap - currentDailyTotal
    };
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error verificando si usuario puede minar:', error);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Ejecuta la minería para un usuario
 * @param {string} userId - ID del usuario
 * @param {string} ip - IP del usuario
 * @param {string} userAgent - User agent del usuario
 * @returns {Object} Resultado de la minería
 */
async function executeMining(userId, ip = null, userAgent = null) {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Verificar nuevamente que puede minar (doble verificación)
    const canMineCheck = await canUserMine(userId, ip, userAgent);
    if (!canMineCheck.canMine) {
      await client.query('ROLLBACK');
      return canMineCheck;
    }
    
    // Generar recompensa
    const reward = generateRandomReward();
    
    // Verificar que no exceda el límite diario con la nueva recompensa
    const newDailyTotal = canMineCheck.dailyTotal + reward;
    if (newDailyTotal > config.mining.dailyCap) {
      // Ajustar recompensa para no exceder el límite
      const adjustedReward = Math.max(0, config.mining.dailyCap - canMineCheck.dailyTotal);
      
      if (adjustedReward <= 0) {
        await client.query('ROLLBACK');
        return { 
          canMine: false, 
          reason: 'DAILY_CAP_EXCEEDED',
          error: 'No se puede minar más hoy'
        };
      }
      
      // Usar recompensa ajustada
      const finalReward = adjustedReward;
      
      // Actualizar balance del usuario
      await client.query(
        'UPDATE users SET mined_balance = mined_balance + $1, last_mine = NOW() WHERE id = $2',
        [finalReward, userId]
      );
      
      // Registrar evento de minería
      await client.query(
        'INSERT INTO mining_events (user_id, reward, ip, user_agent) VALUES ($1, $2, $3, $4)',
        [userId, finalReward, ip, userAgent]
      );
      
      await client.query('COMMIT');
      
      return {
        success: true,
        reward: finalReward,
        adjusted: true,
        reason: 'DAILY_CAP_ADJUSTED',
        message: 'Recompensa ajustada para no exceder límite diario'
      };
    }
    
    // Recompensa normal
    await client.query(
      'UPDATE users SET mined_balance = mined_balance + $1, last_mine = NOW() WHERE id = $2',
      [reward, userId]
    );
    
    // Registrar evento de minería
    await client.query(
      'INSERT INTO mining_events (user_id, reward, ip, user_agent) VALUES ($1, $2, $3, $4)',
      [userId, reward, ip, userAgent]
    );
    
    await client.query('COMMIT');
    
    return {
      success: true,
      reward,
      adjusted: false,
      message: 'Minería exitosa'
    };
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error ejecutando minería:', error);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Obtiene estadísticas de minería de un usuario
 * @param {string} userId - ID del usuario
 * @returns {Object} Estadísticas del usuario
 */
async function getUserMiningStats(userId) {
  try {
    const { rows: [user] } = await pool.query(
      'SELECT mined_balance, last_mine FROM users WHERE id = $1',
      [userId]
    );
    
    if (!user) {
      return null;
    }
    
    // Obtener estadísticas del día actual
    const { rows: [dailyStats] } = await pool.query(
      `SELECT 
         COUNT(*) as total_mines_today,
         COALESCE(SUM(reward), 0) as total_reward_today,
         MAX(created_at) as last_mine_today
       FROM mining_events 
       WHERE user_id = $1 
       AND created_at::date = CURRENT_DATE`,
      [userId]
    );
    
    // Obtener estadísticas totales
    const { rows: [totalStats] } = await pool.query(
      `SELECT 
         COUNT(*) as total_mines,
         COALESCE(SUM(reward), 0) as total_reward
       FROM mining_events 
       WHERE user_id = $1`,
      [userId]
    );
    
    return {
      userId,
      balance: parseFloat(user.mined_balance || 0),
      lastMine: user.last_mine,
      daily: {
        totalMines: parseInt(dailyStats.total_mines_today || 0),
        totalReward: parseFloat(dailyStats.total_reward_today || 0),
        lastMine: dailyStats.last_mine_today
      },
      total: {
        totalMines: parseInt(totalStats.total_mines || 0),
        totalReward: parseFloat(totalStats.total_reward || 0)
      },
      limits: {
        dailyCap: config.mining.dailyCap,
        cooldownSeconds: config.mining.cooldownSeconds,
        remainingDaily: Math.max(0, config.mining.dailyCap - parseFloat(dailyStats.total_reward_today || 0))
      }
    };
    
  } catch (error) {
    console.error('Error obteniendo estadísticas de minería:', error);
    throw error;
  }
}

/**
 * Obtiene el historial de minería de un usuario
 * @param {string} userId - ID del usuario
 * @param {number} limit - Límite de registros
 * @param {number} offset - Offset para paginación
 * @returns {Object} Historial de minería
 */
async function getUserMiningHistory(userId, limit = 50, offset = 0) {
  try {
    const { rows } = await pool.query(
      `SELECT 
         id, reward, created_at, ip, user_agent
       FROM mining_events 
       WHERE user_id = $1 
       ORDER BY created_at DESC 
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );
    
    const { rows: [{ total }] } = await pool.query(
      'SELECT COUNT(*) as total FROM mining_events WHERE user_id = $1',
      [userId]
    );
    
    return {
      events: rows,
      total: parseInt(total),
      limit,
      offset
    };
    
  } catch (error) {
    console.error('Error obteniendo historial de minería:', error);
    throw error;
  }
}

module.exports = {
  canUserMine,
  executeMining,
  getUserMiningStats,
  getUserMiningHistory,
  generateRandomReward
};
