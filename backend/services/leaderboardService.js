const { pool } = require('../config/database');
const { withCache, clearCacheByPattern } = require('../config/cache');
const { startOfUTC, endOfUTC } = require('../utils/time');

/**
 * Tipos de período válidos para el leaderboard
 */
const VALID_PERIODS = ['day', 'week', 'month', 'all'];

/**
 * Valida que el período sea válido
 * @param {string} period - Período a validar
 * @returns {boolean} True si es válido
 */
function isValidPeriod(period) {
  return VALID_PERIODS.includes(period);
}

/**
 * Genera la cláusula WHERE para filtrar por período
 * @param {string} period - Período del leaderboard
 * @returns {string} Cláusula WHERE SQL
 */
function generatePeriodWhereClause(period) {
  if (period === 'all') return '';
  
  const startDate = startOfUTC(period);
  const endDate = endOfUTC(period);
  
  return `WHERE me.created_at >= $1 AND me.created_at <= $2`;
}

/**
 * Obtiene el leaderboard para un período específico
 * @param {string} period - Período: 'day', 'week', 'month', 'all'
 * @param {number} limit - Límite de registros
 * @param {number} offset - Offset para paginación
 * @returns {Promise<Array>} Array del leaderboard
 */
async function getLeaderboard(period = 'all', limit = 50, offset = 0) {
  if (!isValidPeriod(period)) {
    throw new Error(`Período no válido: ${period}. Períodos válidos: ${VALID_PERIODS.join(', ')}`);
  }
  
  const cacheKey = `leaderboard:${period}:${limit}:${offset}`;
  
  return withCache(cacheKey, async () => {
    try {
      let query, params;
      
      if (period === 'all') {
        query = `
          SELECT 
            u.id,
            u.email,
            u.wallet_address,
            COALESCE(SUM(me.reward), 0) AS total_mined,
            COUNT(me.id) AS total_mines,
            MAX(me.created_at) AS last_mine,
            u.created_at AS registration_date
          FROM users u
          LEFT JOIN mining_events me ON me.user_id = u.id
          WHERE u.status = 'active'
          GROUP BY u.id, u.email, u.wallet_address, u.created_at
          HAVING COALESCE(SUM(me.reward), 0) > 0
          ORDER BY total_mined DESC
          LIMIT $1 OFFSET $2
        `;
        params = [limit, offset];
      } else {
        const startDate = startOfUTC(period);
        const endDate = endOfUTC(period);
        
        query = `
          SELECT 
            u.id,
            u.email,
            u.wallet_address,
            COALESCE(SUM(me.reward), 0) AS total_mined,
            COUNT(me.id) AS total_mines,
            MAX(me.created_at) AS last_mine,
            u.created_at AS registration_date
          FROM users u
          LEFT JOIN mining_events me ON me.user_id = u.id
          WHERE u.status = 'active'
            AND me.created_at >= $1 
            AND me.created_at <= $2
          GROUP BY u.id, u.email, u.wallet_address, u.created_at
          HAVING COALESCE(SUM(me.reward), 0) > 0
          ORDER BY total_mined DESC
          LIMIT $3 OFFSET $4
        `;
        params = [startDate, endDate, limit, offset];
      }
      
      const { rows } = await pool.query(query, params);
      
      // Agregar posición en el ranking
      return rows.map((row, index) => ({
        ...row,
        position: offset + index + 1,
        total_mined: parseFloat(row.total_mined),
        total_mines: parseInt(row.total_mines)
      }));
      
    } catch (error) {
      console.error(`Error obteniendo leaderboard para período ${period}:`, error);
      throw error;
    }
  });
}

/**
 * Obtiene el total de registros para un período específico
 * @param {string} period - Período del leaderboard
 * @returns {Promise<number>} Total de registros
 */
async function getLeaderboardTotal(period = 'all') {
  if (!isValidPeriod(period)) {
    throw new Error(`Período no válido: ${period}`);
  }
  
  const cacheKey = `leaderboard_total:${period}`;
  
  return withCache(cacheKey, async () => {
    try {
      let query, params;
      
      if (period === 'all') {
        query = `
          SELECT COUNT(DISTINCT u.id) as total
          FROM users u
          LEFT JOIN mining_events me ON me.user_id = u.id
          WHERE u.status = 'active'
            AND COALESCE(SUM(me.reward), 0) > 0
        `;
        params = [];
      } else {
        const startDate = startOfUTC(period);
        const endDate = endOfUTC(period);
        
        query = `
          SELECT COUNT(DISTINCT u.id) as total
          FROM users u
          LEFT JOIN mining_events me ON me.user_id = u.id
          WHERE u.status = 'active'
            AND me.created_at >= $1 
            AND me.created_at <= $2
            AND COALESCE(SUM(me.reward), 0) > 0
        `;
        params = [startDate, endDate];
      }
      
      const { rows: [{ total }] } = await pool.query(query, params);
      return parseInt(total);
      
    } catch (error) {
      console.error(`Error obteniendo total del leaderboard para período ${period}:`, error);
      throw error;
    }
  });
}

/**
 * Obtiene estadísticas generales del sistema
 * @returns {Promise<Object>} Estadísticas del sistema
 */
async function getSystemStats() {
  const cacheKey = 'system_stats';
  
  return withCache(cacheKey, async () => {
    try {
      // Estadísticas de usuarios
      const { rows: [userStats] } = await pool.query(`
        SELECT 
          COUNT(*) as total_users,
          COUNT(CASE WHEN status = 'active' THEN 1 END) as active_users,
          COUNT(CASE WHEN last_mine >= NOW() - INTERVAL '24 hours' THEN 1 END) as active_miners_24h
        FROM users
      `);
      
      // Estadísticas de minería
      const { rows: [miningStats] } = await pool.query(`
        SELECT 
          COUNT(*) as total_mining_events,
          COALESCE(SUM(reward), 0) as total_tokens_mined,
          COUNT(DISTINCT user_id) as unique_miners,
          AVG(reward) as average_reward
        FROM mining_events
      `);
      
      // Estadísticas del día actual
      const { rows: [todayStats] } = await pool.query(`
        SELECT 
          COUNT(*) as today_mining_events,
          COALESCE(SUM(reward), 0) as today_tokens_mined,
          COUNT(DISTINCT user_id) as today_unique_miners
        FROM mining_events
        WHERE created_at::date = CURRENT_DATE
      `);
      
      // Estadísticas de la semana actual
      const { rows: [weekStats] } = await pool.query(`
        SELECT 
          COUNT(*) as week_mining_events,
          COALESCE(SUM(reward), 0) as week_tokens_mined,
          COUNT(DISTINCT user_id) as week_unique_miners
        FROM mining_events
        WHERE date_trunc('week', created_at) = date_trunc('week', NOW())
      `);
      
      return {
        users: {
          total: parseInt(userStats.total_users || 0),
          active: parseInt(userStats.active_users || 0),
          activeMiners24h: parseInt(userStats.active_miners_24h || 0)
        },
        mining: {
          totalEvents: parseInt(miningStats.total_mining_events || 0),
          totalTokens: parseFloat(miningStats.total_tokens_mined || 0),
          uniqueMiners: parseInt(miningStats.unique_miners || 0),
          averageReward: parseFloat(miningStats.average_reward || 0)
        },
        today: {
          events: parseInt(todayStats.today_mining_events || 0),
          tokens: parseFloat(todayStats.today_tokens_mined || 0),
          uniqueMiners: parseInt(todayStats.today_unique_miners || 0)
        },
        week: {
          events: parseInt(weekStats.week_mining_events || 0),
          tokens: parseFloat(weekStats.week_tokens_mined || 0),
          uniqueMiners: parseInt(weekStats.week_unique_miners || 0)
        },
        lastUpdated: new Date().toISOString()
      };
      
    } catch (error) {
      console.error('Error obteniendo estadísticas del sistema:', error);
      throw error;
    }
  });
}

/**
 * Obtiene el top 10 del leaderboard para un período específico
 * @param {string} period - Período del leaderboard
 * @returns {Promise<Array>} Top 10 del leaderboard
 */
async function getTop10(period = 'all') {
  return getLeaderboard(period, 10, 0);
}

/**
 * Limpia el caché del leaderboard
 * @param {string} period - Período específico a limpiar (opcional)
 */
function clearLeaderboardCache(period = null) {
  if (period) {
    clearCacheByPattern(`leaderboard:${period}`);
    clearCacheByPattern(`leaderboard_total:${period}`);
  } else {
    clearCacheByPattern('leaderboard');
    clearCacheByPattern('leaderboard_total');
  }
  
  // También limpiar estadísticas del sistema
  clearCacheByPattern('system_stats');
}

/**
 * Obtiene estadísticas de un usuario específico en el ranking
 * @param {string} userId - ID del usuario
 * @param {string} period - Período del ranking
 * @returns {Promise<Object>} Estadísticas del usuario en el ranking
 */
async function getUserRankingStats(userId, period = 'all') {
  try {
    let query, params;
    
    if (period === 'all') {
      query = `
        WITH user_rank AS (
          SELECT 
            u.id,
            u.email,
            COALESCE(SUM(me.reward), 0) AS total_mined,
            ROW_NUMBER() OVER (ORDER BY COALESCE(SUM(me.reward), 0) DESC) as rank
          FROM users u
          LEFT JOIN mining_events me ON me.user_id = u.id
          WHERE u.status = 'active'
          GROUP BY u.id, u.email
          HAVING COALESCE(SUM(me.reward), 0) > 0
        )
        SELECT * FROM user_rank WHERE id = $1
      `;
      params = [userId];
    } else {
      const startDate = startOfUTC(period);
      const endDate = endOfUTC(period);
      
      query = `
        WITH user_rank AS (
          SELECT 
            u.id,
            u.email,
            COALESCE(SUM(me.reward), 0) AS total_mined,
            ROW_NUMBER() OVER (ORDER BY COALESCE(SUM(me.reward), 0) DESC) as rank
          FROM users u
          LEFT JOIN mining_events me ON me.user_id = u.id
          WHERE u.status = 'active'
            AND me.created_at >= $1 
            AND me.created_at <= $2
          GROUP BY u.id, u.email
          HAVING COALESCE(SUM(me.reward), 0) > 0
        )
        SELECT * FROM user_rank WHERE id = $3
      `;
      params = [startDate, endDate, userId];
    }
    
    const { rows: [userRank] } = await pool.query(query, params);
    
    if (!userRank) {
      return null;
    }
    
    return {
      userId: userRank.id,
      email: userRank.email,
      totalMined: parseFloat(userRank.total_mined),
      rank: parseInt(userRank.rank),
      period
    };
    
  } catch (error) {
    console.error(`Error obteniendo estadísticas de ranking para usuario ${userId}:`, error);
    throw error;
  }
}

module.exports = {
  getLeaderboard,
  getLeaderboardTotal,
  getSystemStats,
  getTop10,
  clearLeaderboardCache,
  getUserRankingStats,
  isValidPeriod,
  VALID_PERIODS
};
