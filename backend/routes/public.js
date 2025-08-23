const express = require('express');
const { publicApiLimiter } = require('../security/rateLimit');
const { 
  getLeaderboard, 
  getLeaderboardTotal, 
  getSystemStats, 
  getTop10,
  isValidPeriod,
  VALID_PERIODS 
} = require('../services/leaderboardService');
const { parsePagination, buildPaginatedResponse } = require('../utils/pagination');

const router = express.Router();

// Aplicar rate limiting para API pública
router.use(publicApiLimiter);

/**
 * GET /public/leaderboard
 * Obtiene el leaderboard público con paginación
 * Query params: period (day|week|month|all), page, pageSize
 */
router.get('/leaderboard', async (req, res) => {
  try {
    const { period = 'all', page = 1, pageSize = 20 } = req.query;
    
    // Validar período
    if (!isValidPeriod(period)) {
      return res.status(400).json({
        success: false,
        error: `Período no válido: ${period}`,
        code: 'INVALID_PERIOD',
        validPeriods: VALID_PERIODS
      });
    }
    
    // Validar y parsear paginación
    const pagination = parsePagination({ page, pageSize });
    
    // Obtener leaderboard y total
    const [leaderboardData, total] = await Promise.all([
      getLeaderboard(period, pagination.pageSize, pagination.offset),
      getLeaderboardTotal(period)
    ]);
    
    // Construir respuesta paginada
    const response = buildPaginatedResponse(leaderboardData, total, pagination);
    
    res.json({
      ...response,
      period,
      success: true
    });
    
  } catch (error) {
    console.error('Error obteniendo leaderboard:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      code: 'INTERNAL_SERVER_ERROR'
    });
  }
});

/**
 * GET /public/leaderboard/top10
 * Obtiene el top 10 del leaderboard para un período específico
 */
router.get('/leaderboard/top10', async (req, res) => {
  try {
    const { period = 'all' } = req.query;
    
    // Validar período
    if (!isValidPeriod(period)) {
      return res.status(400).json({
        success: false,
        error: `Período no válido: ${period}`,
        code: 'INVALID_PERIOD',
        validPeriods: VALID_PERIODS
      });
    }
    
    const top10 = await getTop10(period);
    
    res.json({
      success: true,
      data: top10,
      period,
      count: top10.length
    });
    
  } catch (error) {
    console.error('Error obteniendo top 10:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      code: 'INTERNAL_SERVER_ERROR'
    });
  }
});

/**
 * GET /public/stats
 * Obtiene estadísticas generales del sistema
 */
router.get('/stats', async (req, res) => {
  try {
    const stats = await getSystemStats();
    
    res.json({
      success: true,
      data: stats
    });
    
  } catch (error) {
    console.error('Error obteniendo estadísticas del sistema:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      code: 'INTERNAL_SERVER_ERROR'
    });
  }
});

/**
 * GET /public/stats/summary
 * Obtiene un resumen rápido de estadísticas (para widgets)
 */
router.get('/stats/summary', async (req, res) => {
  try {
    const stats = await getSystemStats();
    
    // Resumen simplificado para widgets
    const summary = {
      totalUsers: stats.users.total,
      activeUsers: stats.users.active,
      totalTokensMined: stats.mining.totalTokens,
      todayTokensMined: stats.today.tokens,
      weekTokensMined: stats.week.tokens,
      lastUpdated: stats.lastUpdated
    };
    
    res.json({
      success: true,
      data: summary
    });
    
  } catch (error) {
    console.error('Error obteniendo resumen de estadísticas:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      code: 'INTERNAL_SERVER_ERROR'
    });
  }
});

/**
 * GET /public/periods
 * Obtiene información sobre los períodos disponibles
 */
router.get('/periods', async (req, res) => {
  try {
    const periods = VALID_PERIODS.map(period => {
      const now = new Date();
      let description, startDate, endDate;
      
      switch (period) {
        case 'day':
          description = 'Hoy';
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
          break;
        case 'week':
          description = 'Esta semana';
          const day = now.getDay();
          const diff = now.getDate() - day + (day === 0 ? -6 : 1);
          startDate = new Date(now.getFullYear(), now.getMonth(), diff);
          endDate = new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          description = 'Este mes';
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
          break;
        case 'all':
          description = 'Todo el tiempo';
          startDate = null;
          endDate = null;
          break;
      }
      
      return {
        period,
        description,
        startDate: startDate?.toISOString(),
        endDate: endDate?.toISOString()
      };
    });
    
    res.json({
      success: true,
      data: periods
    });
    
  } catch (error) {
    console.error('Error obteniendo períodos:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      code: 'INTERNAL_SERVER_ERROR'
    });
  }
});

/**
 * GET /public/health
 * Endpoint de salud para monitoreo
 */
router.get('/health', async (req, res) => {
  try {
    res.json({
      success: true,
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET /public/info
 * Información general sobre la API
 */
router.get('/info', async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        name: 'RSC Mining API',
        version: '2.0.0',
        description: 'API pública para sistema de minería RSC',
        endpoints: {
          leaderboard: '/public/leaderboard',
          stats: '/public/stats',
          top10: '/public/leaderboard/top10',
          periods: '/public/periods',
          health: '/public/health'
        },
        features: [
          'Leaderboard público con múltiples períodos',
          'Estadísticas del sistema en tiempo real',
          'Paginación y filtros',
          'Caché optimizado',
          'Rate limiting para prevenir abuso'
        ],
        documentation: '/docs',
        support: 'support@rsc.com'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      code: 'INTERNAL_SERVER_ERROR'
    });
  }
});

module.exports = router;
