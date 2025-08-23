const express = require('express');
const { adminAuth } = require('../security/auth');
const { adminLimiter } = require('../security/rateLimit');
const { parsePagination, buildPaginatedResponse } = require('../utils/pagination');
const { 
  generateUsersCSV, 
  generateMiningEventsCSV, 
  generateStatsCSV,
  setCSVHeaders 
} = require('../utils/csv');
const { pool } = require('../config/database');
const { clearLeaderboardCache } = require('../services/leaderboardService');

const router = express.Router();

// Aplicar rate limiting para administración
router.use(adminLimiter);

// Aplicar autenticación de administrador a todas las rutas
router.use(adminAuth);

/**
 * GET /admin/dashboard
 * Obtiene estadísticas del dashboard administrativo
 */
router.get('/dashboard', async (req, res) => {
  try {
    const admin = req.admin;
    
    // Estadísticas generales
    const { rows: [userStats] } = await pool.query(`
      SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_users,
        COUNT(CASE WHEN created_at >= NOW() - INTERVAL '24 hours' THEN 1 END) as new_users_24h,
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
    
    // Top 5 usuarios por balance
    const { rows: topUsers } = await pool.query(`
      SELECT 
        id, email, wallet_address, mined_balance, last_mine, created_at
      FROM users 
      WHERE status = 'active' 
      ORDER BY mined_balance DESC 
      LIMIT 5
    `);
    
    // Actividad reciente
    const { rows: recentActivity } = await pool.query(`
      SELECT 
        me.id, me.user_id, u.email, me.reward, me.created_at, me.ip
      FROM mining_events me
      JOIN users u ON me.user_id = u.id
      ORDER BY me.created_at DESC
      LIMIT 10
    `);
    
    const dashboard = {
      users: {
        total: parseInt(userStats.total_users || 0),
        active: parseInt(userStats.active_users || 0),
        new24h: parseInt(userStats.new_users_24h || 0),
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
      topUsers,
      recentActivity,
      lastUpdated: new Date().toISOString()
    };
    
    res.json({
      success: true,
      data: dashboard
    });
    
  } catch (error) {
    console.error('Error obteniendo dashboard:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      code: 'INTERNAL_SERVER_ERROR'
    });
  }
});

/**
 * GET /admin/users
 * Lista de usuarios con paginación
 */
router.get('/users', async (req, res) => {
  try {
    const { page = 1, pageSize = 20, status, search } = req.query;
    
    // Parsear paginación
    const pagination = parsePagination({ page, pageSize });
    
    // Construir query base
    let whereClause = 'WHERE 1=1';
    let params = [];
    let paramIndex = 1;
    
    if (status) {
      whereClause += ` AND u.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }
    
    if (search) {
      whereClause += ` AND (u.email ILIKE $${paramIndex} OR u.wallet_address ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }
    
    // Obtener usuarios
    const { rows: users } = await pool.query(
      `SELECT 
         u.id, u.email, u.wallet_address, u.referral_code, u.referred_by,
         u.mined_balance, u.last_mine, u.status, u.created_at,
         COUNT(me.id) as total_mines,
         COALESCE(SUM(me.reward), 0) as total_reward
       FROM users u
       LEFT JOIN mining_events me ON me.user_id = u.id
       ${whereClause}
       GROUP BY u.id
       ORDER BY u.mined_balance DESC
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...params, pagination.pageSize, pagination.offset]
    );
    
    // Obtener total
    const { rows: [{ total }] } = await pool.query(
      `SELECT COUNT(*) as total FROM users u ${whereClause}`,
      params
    );
    
    // Construir respuesta paginada
    const response = buildPaginatedResponse(users, parseInt(total), pagination);
    
    res.json({
      ...response,
      success: true
    });
    
  } catch (error) {
    console.error('Error obteniendo usuarios:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      code: 'INTERNAL_SERVER_ERROR'
    });
  }
});

/**
 * GET /admin/users/:id
 * Obtiene detalles de un usuario específico
 */
router.get('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { rows: [user] } = await pool.query(
      `SELECT 
         u.*,
         COUNT(me.id) as total_mines,
         COALESCE(SUM(me.reward), 0) as total_reward,
         MAX(me.created_at) as last_mine_date
       FROM users u
       LEFT JOIN mining_events me ON me.user_id = u.id
       WHERE u.id = $1
       GROUP BY u.id`,
      [id]
    );
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado',
        code: 'USER_NOT_FOUND'
      });
    }
    
    // Obtener historial reciente de minería
    const { rows: miningHistory } = await pool.query(
      `SELECT 
         id, reward, created_at, ip, user_agent
       FROM mining_events 
       WHERE user_id = $1 
       ORDER BY created_at DESC 
       LIMIT 20`,
      [id]
    );
    
    res.json({
      success: true,
      data: {
        user: {
          ...user,
          total_mines: parseInt(user.total_mines || 0),
          total_reward: parseFloat(user.total_reward || 0)
        },
        miningHistory
      }
    });
    
  } catch (error) {
    console.error('Error obteniendo usuario:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      code: 'INTERNAL_SERVER_ERROR'
    });
  }
});

/**
 * PUT /admin/users/:id/status
 * Actualiza el estado de un usuario
 */
router.put('/users/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;
    const admin = req.admin;
    
    if (!status || !['active', 'suspended', 'banned'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Estado no válido',
        code: 'INVALID_STATUS'
      });
    }
    
    // Verificar que el usuario existe
    const { rows: [user] } = await pool.query(
      'SELECT id, email, status FROM users WHERE id = $1',
      [id]
    );
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado',
        code: 'USER_NOT_FOUND'
      });
    }
    
    // Actualizar estado
    await pool.query(
      'UPDATE users SET status = $1, updated_at = NOW() WHERE id = $2',
      [status, id]
    );
    
    // Registrar acción administrativa
    await pool.query(
      `INSERT INTO admin_actions (admin_user_id, target_user_id, action_type, action_details, reason)
       VALUES ($1, $2, $3, $4, $5)`,
      [admin.id, id, 'status_update', `Status changed from ${user.status} to ${status}`, reason || null]
    );
    
    res.json({
      success: true,
      message: `Estado del usuario actualizado a ${status}`,
      data: {
        userId: id,
        oldStatus: user.status,
        newStatus: status,
        reason
      }
    });
    
  } catch (error) {
    console.error('Error actualizando estado de usuario:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      code: 'INTERNAL_SERVER_ERROR'
    });
  }
});

/**
 * GET /admin/mining-events
 * Lista de eventos de minería con paginación
 */
router.get('/mining-events', async (req, res) => {
  try {
    const { page = 1, pageSize = 20, userId, dateFrom, dateTo } = req.query;
    
    // Parsear paginación
    const pagination = parsePagination({ page, pageSize });
    
    // Construir query base
    let whereClause = 'WHERE 1=1';
    let params = [];
    let paramIndex = 1;
    
    if (userId) {
      whereClause += ` AND me.user_id = $${paramIndex}`;
      params.push(userId);
      paramIndex++;
    }
    
    if (dateFrom) {
      whereClause += ` AND me.created_at >= $${paramIndex}`;
      params.push(dateFrom);
      paramIndex++;
    }
    
    if (dateTo) {
      whereClause += ` AND me.created_at <= $${paramIndex}`;
      params.push(dateTo);
      paramIndex++;
    }
    
    // Obtener eventos
    const { rows: events } = await pool.query(
      `SELECT 
         me.id, me.user_id, me.reward, me.created_at, me.ip, me.user_agent,
         u.email, u.wallet_address
       FROM mining_events me
       JOIN users u ON me.user_id = u.id
       ${whereClause}
       ORDER BY me.created_at DESC
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...params, pagination.pageSize, pagination.offset]
    );
    
    // Obtener total
    const { rows: [{ total }] } = await pool.query(
      `SELECT COUNT(*) as total FROM mining_events me ${whereClause}`,
      params
    );
    
    // Construir respuesta paginada
    const response = buildPaginatedResponse(events, parseInt(total), pagination);
    
    res.json({
      ...response,
      success: true
    });
    
  } catch (error) {
    console.error('Error obteniendo eventos de minería:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      code: 'INTERNAL_SERVER_ERROR'
    });
  }
});

/**
 * GET /admin/export/users.csv
 * Exporta usuarios a CSV
 */
router.get('/export/users.csv', async (req, res) => {
  try {
    const { rows: users } = await pool.query(`
      SELECT 
        id, email, wallet_address, referral_code, referred_by,
        mined_balance, last_mine, status, created_at
      FROM users 
      ORDER BY created_at DESC
    `);
    
    const csv = generateUsersCSV(users);
    setCSVHeaders(res, `users_${new Date().toISOString().split('T')[0]}.csv`);
    res.send(csv);
    
  } catch (error) {
    console.error('Error exportando usuarios:', error);
    res.status(500).json({
      success: false,
      error: 'Error exportando usuarios',
      code: 'EXPORT_ERROR'
    });
  }
});

/**
 * GET /admin/export/mining.csv
 * Exporta eventos de minería a CSV
 */
router.get('/export/mining.csv', async (req, res) => {
  try {
    const { rows: events } = await pool.query(`
      SELECT 
        me.id, me.user_id, me.reward, me.created_at, me.ip, me.user_agent,
        u.email, u.wallet_address
      FROM mining_events me
      JOIN users u ON me.user_id = u.id
      ORDER BY me.created_at DESC
    `);
    
    const csv = generateMiningEventsCSV(events);
    setCSVHeaders(res, `mining_events_${new Date().toISOString().split('T')[0]}.csv`);
    res.send(csv);
    
  } catch (error) {
    console.error('Error exportando eventos de minería:', error);
    res.status(500).json({
      success: false,
      error: 'Error exportando eventos de minería',
      code: 'EXPORT_ERROR'
    });
  }
});

/**
 * POST /admin/cache/clear
 * Limpia el caché del sistema
 */
router.post('/cache/clear', async (req, res) => {
  try {
    const { pattern } = req.body;
    
    if (pattern) {
      clearLeaderboardCache(pattern);
    } else {
      clearLeaderboardCache();
    }
    
    res.json({
      success: true,
      message: 'Caché limpiado exitosamente',
      data: {
        pattern: pattern || 'all',
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('Error limpiando caché:', error);
    res.status(500).json({
      success: false,
      error: 'Error limpiando caché',
      code: 'CACHE_CLEAR_ERROR'
    });
  }
});

/**
 * GET /admin/system/info
 * Información del sistema
 */
router.get('/system/info', async (req, res) => {
  try {
    const systemInfo = {
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString()
    };
    
    res.json({
      success: true,
      data: systemInfo
    });
    
  } catch (error) {
    console.error('Error obteniendo información del sistema:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      code: 'INTERNAL_SERVER_ERROR'
    });
  }
});

module.exports = router;
