#!/usr/bin/env node

/**
 * Servidor principal del sistema de minería RSC
 * Versión 2.0.0 - Backend completo con todas las funcionalidades
 */

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');

// Configuración
const config = require('./config/env');
const { testConnection, closePool } = require('./config/database');
const { getCacheStats } = require('./config/cache');

// Middleware de seguridad
const { ipLimiter } = require('./security/rateLimit');

// Rutas
const authRoutes = require('./routes/auth');
const mineRoutes = require('./routes/mine');
const adminRoutes = require('./routes/admin');
const publicRoutes = require('./routes/public');

// Crear aplicación Express
const app = express();

// Middleware de seguridad
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"]
    }
  },
  crossOriginEmbedderPolicy: false
}));

// CORS
app.use(cors({
  origin: config.security.corsOrigin === '*' ? true : config.security.corsOrigin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Middleware de parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
app.use(morgan('combined', {
  format: ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"'
}));

// Rate limiting global
app.use(ipLimiter);

// Middleware para obtener IP real
app.use((req, res, next) => {
  req.ip = req.headers['x-forwarded-for'] || 
           req.connection.remoteAddress || 
           req.socket.remoteAddress ||
           (req.connection.socket ? req.connection.socket.remoteAddress : null);
  next();
});

// Middleware de logging personalizado
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logLevel = res.statusCode >= 400 ? 'WARN' : 'INFO';
    
    console.log(`[${logLevel}] ${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms - ${req.ip}`);
  });
  
  next();
});

// Rutas de la API
app.use('/auth', authRoutes);
app.use('/mine', mineRoutes);
app.use('/admin', adminRoutes);
app.use('/public', publicRoutes);

// Ruta principal
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '🚀 RSC Mining Backend API v2.0.0',
    version: '2.0.0',
    status: 'running',
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: '/auth',
      mining: '/mine',
      admin: '/admin',
      public: '/public'
    },
    documentation: '/docs',
    health: '/health'
  });
});

// Endpoint de salud
app.get('/health', async (req, res) => {
  try {
    // Verificar conexión a la base de datos
    const dbHealthy = await testConnection();
    
    // Obtener estadísticas del caché
    const cacheStats = getCacheStats();
    
    // Obtener información del sistema
    const systemInfo = {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      nodeVersion: process.version,
      platform: process.platform,
      timestamp: new Date().toISOString()
    };
    
    const healthStatus = {
      status: dbHealthy ? 'healthy' : 'unhealthy',
      database: dbHealthy ? 'connected' : 'disconnected',
      cache: cacheStats,
      system: systemInfo
    };
    
    const statusCode = dbHealthy ? 200 : 503;
    
    res.status(statusCode).json({
      success: dbHealthy,
      data: healthStatus
    });
    
  } catch (error) {
    console.error('Error en health check:', error);
    res.status(503).json({
      success: false,
      status: 'unhealthy',
      error: 'Health check failed',
      timestamp: new Date().toISOString()
    });
  }
});

// Endpoint de métricas (para monitoreo)
app.get('/metrics', async (req, res) => {
  try {
    const { pool } = require('./config/database');
    const cacheStats = getCacheStats();
    
    // Métricas de base de datos
    const { rows: [userCount] } = await pool.query('SELECT COUNT(*) as total FROM users');
    const { rows: [miningCount] } = await pool.query('SELECT COUNT(*) as total FROM mining_events');
    const { rows: [adminCount] } = await pool.query('SELECT COUNT(*) as total FROM admins');
    
    // Métricas del sistema
    const metrics = {
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      database: {
        users: parseInt(userCount.total || 0),
        miningEvents: parseInt(miningCount.total || 0),
        admins: parseInt(adminCount.total || 0)
      },
      cache: cacheStats,
      system: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch
      }
    };
    
    res.json({
      success: true,
      data: metrics
    });
    
  } catch (error) {
    console.error('Error obteniendo métricas:', error);
    res.status(500).json({
      success: false,
      error: 'Error obteniendo métricas',
      timestamp: new Date().toISOString()
    });
  }
});

// Endpoint de información del sistema
app.get('/system/info', (req, res) => {
  try {
    const systemInfo = {
      name: 'RSC Mining Backend',
      version: '2.0.0',
      description: 'Backend completo para sistema de minería RSC con ranking público, API pública con caché, controles anti-abuso, exportación CSV, paginación, métricas y más',
      features: [
        'Sistema de autenticación JWT para usuarios y administradores',
        'Sistema de minería con cooldown y límites diarios',
        'Leaderboard público con múltiples períodos',
        'API pública con caché optimizado',
        'Panel de administración completo',
        'Exportación de datos a CSV',
        'Sistema de rate limiting y anti-abuso',
        'Métricas y monitoreo del sistema',
        'Migraciones automáticas de base de datos',
        'Auditoría completa de acciones'
      ],
      technologies: [
        'Node.js + Express',
        'PostgreSQL con UUIDs',
        'JWT + bcrypt para autenticación',
        'NodeCache para caché en memoria',
        'Helmet para seguridad',
        'Morgan para logging',
        'Rate limiting con express-rate-limit'
      ],
      endpoints: {
        auth: {
          register: 'POST /auth/register',
          login: 'POST /auth/login',
          adminLogin: 'POST /auth/admin/login',
          profile: 'GET /auth/profile'
        },
        mining: {
          mine: 'POST /mine/mine',
          balance: 'GET /mine/balance',
          stats: 'GET /mine/stats',
          history: 'GET /mine/history',
          status: 'GET /mine/status'
        },
        public: {
          leaderboard: 'GET /public/leaderboard',
          stats: 'GET /public/stats',
          top10: 'GET /public/leaderboard/top10'
        },
        admin: {
          dashboard: 'GET /admin/dashboard',
          users: 'GET /admin/users',
          miningEvents: 'GET /admin/mining-events',
          exportUsers: 'GET /admin/export/users.csv',
          exportMining: 'GET /admin/export/mining.csv'
        }
      },
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
      error: 'Error obteniendo información del sistema'
    });
  }
});

// Middleware de manejo de errores
app.use((err, req, res, next) => {
  console.error('Error no manejado:', err);
  
  // Error de validación
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: 'Error de validación',
      details: err.message,
      code: 'VALIDATION_ERROR'
    });
  }
  
  // Error de base de datos
  if (err.code === '23505') { // Unique constraint violation
    return res.status(409).json({
      success: false,
      error: 'Conflicto de datos',
      code: 'DUPLICATE_ENTRY'
    });
  }
  
  // Error de autenticación
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: 'Token inválido',
      code: 'INVALID_TOKEN'
    });
  }
  
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error: 'Token expirado',
      code: 'TOKEN_EXPIRED'
    });
  }
  
  // Error genérico
  res.status(500).json({
    success: false,
    error: 'Error interno del servidor',
    code: 'INTERNAL_SERVER_ERROR',
    ...(config.app.nodeEnv === 'development' && { details: err.message })
  });
});

// Middleware para rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint no encontrado',
    code: 'ENDPOINT_NOT_FOUND',
    requestedUrl: req.originalUrl,
    availableEndpoints: [
      '/',
      '/health',
      '/metrics',
      '/system/info',
      '/auth/*',
      '/mine/*',
      '/admin/*',
      '/public/*'
    ]
  });
});

// Función para iniciar el servidor
async function startServer() {
  try {
    // Verificar conexión a la base de datos
    console.log('🔌 Verificando conexión a la base de datos...');
    const dbConnected = await testConnection();
    
    if (!dbConnected) {
      console.error('❌ No se pudo conectar a la base de datos');
      process.exit(1);
    }
    
    console.log('✅ Conexión a la base de datos establecida');
    
    // Iniciar servidor
    const server = app.listen(config.app.port, () => {
      console.log('🚀 RSC Mining Backend iniciado exitosamente!');
      console.log(`📡 Servidor escuchando en puerto ${config.app.port}`);
      console.log(`🌍 Entorno: ${config.app.nodeEnv}`);
      console.log(`🔒 Modo: ${config.app.nodeEnv === 'production' ? 'Producción' : 'Desarrollo'}`);
      console.log(`📊 Health check: http://localhost:${config.app.port}/health`);
      console.log(`📈 Métricas: http://localhost:${config.app.port}/metrics`);
      console.log(`ℹ️  Info: http://localhost:${config.app.port}/system/info`);
      console.log('');
      console.log('📋 Endpoints disponibles:');
      console.log('  🔐 Auth: /auth/*');
      console.log('  ⛏️  Mining: /mine/*');
      console.log('  👑 Admin: /admin/*');
      console.log('  🌐 Public: /public/*');
      console.log('');
    });
    
    // Manejo de cierre graceful
    process.on('SIGTERM', () => {
      console.log('🛑 Recibida señal SIGTERM, cerrando servidor...');
      gracefulShutdown(server);
    });
    
    process.on('SIGINT', () => {
      console.log('🛑 Recibida señal SIGINT, cerrando servidor...');
      gracefulShutdown(server);
    });
    
    // Manejo de errores no capturados
    process.on('uncaughtException', (err) => {
      console.error('💥 Error no capturado:', err);
      gracefulShutdown(server);
    });
    
    process.on('unhandledRejection', (reason, promise) => {
      console.error('💥 Promesa rechazada no manejada:', reason);
      gracefulShutdown(server);
    });
    
  } catch (error) {
    console.error('💥 Error iniciando servidor:', error);
    process.exit(1);
  }
}

// Función para cierre graceful
async function gracefulShutdown(server) {
  try {
    console.log('🔄 Cerrando conexiones...');
    
    // Cerrar servidor HTTP
    server.close(() => {
      console.log('✅ Servidor HTTP cerrado');
    });
    
    // Cerrar pool de base de datos
    await closePool();
    console.log('✅ Pool de base de datos cerrado');
    
    console.log('🎉 Cierre graceful completado');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error durante cierre graceful:', error);
    process.exit(1);
  }
}

// Iniciar servidor
startServer(); 