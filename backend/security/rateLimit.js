const rateLimit = require('express-rate-limit');
const config = require('../config/env');

// Rate limiter global por IP
const ipLimiter = rateLimit({
  windowMs: config.security.rateLimitWindowMs,
  max: config.security.rateLimitMax,
  message: {
    error: 'Demasiadas solicitudes desde esta IP',
    code: 'RATE_LIMIT_EXCEEDED',
    retryAfter: Math.ceil(config.security.rateLimitWindowMs / 1000)
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: 'Demasiadas solicitudes desde esta IP',
      code: 'RATE_LIMIT_EXCEEDED',
      retryAfter: Math.ceil(config.security.rateLimitWindowMs / 1000),
      limit: config.security.rateLimitMax,
      windowMs: config.security.rateLimitWindowMs
    });
  }
});

// Rate limiter específico para autenticación (más restrictivo)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // máximo 5 intentos
  message: {
    error: 'Demasiados intentos de autenticación',
    code: 'AUTH_RATE_LIMIT_EXCEEDED',
    retryAfter: 15 * 60
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // no contar intentos exitosos
  handler: (req, res) => {
    res.status(429).json({
      error: 'Demasiados intentos de autenticación. Intenta de nuevo en 15 minutos.',
      code: 'AUTH_RATE_LIMIT_EXCEEDED',
      retryAfter: 15 * 60
    });
  }
});

// Rate limiter para minería (más restrictivo)
const miningLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 10, // máximo 10 intentos por minuto
  message: {
    error: 'Demasiados intentos de minería',
    code: 'MINING_RATE_LIMIT_EXCEEDED',
    retryAfter: 60
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: 'Demasiados intentos de minería. Intenta de nuevo en 1 minuto.',
      code: 'MINING_RATE_LIMIT_EXCEEDED',
      retryAfter: 60
    });
  }
});

// Rate limiter para endpoints de administración
const adminLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 30, // máximo 30 solicitudes por minuto
  message: {
    error: 'Demasiadas solicitudes administrativas',
    code: 'ADMIN_RATE_LIMIT_EXCEEDED',
    retryAfter: 60
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: 'Demasiadas solicitudes administrativas. Intenta de nuevo en 1 minuto.',
      code: 'ADMIN_RATE_LIMIT_EXCEEDED',
      retryAfter: 60
    });
  }
});

// Rate limiter para API pública (más permisivo)
const publicApiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 100, // máximo 100 solicitudes por minuto
  message: {
    error: 'Demasiadas solicitudes a la API pública',
    code: 'PUBLIC_API_RATE_LIMIT_EXCEEDED',
    retryAfter: 60
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: 'Demasiadas solicitudes a la API pública. Intenta de nuevo en 1 minuto.',
      code: 'PUBLIC_API_RATE_LIMIT_EXCEEDED',
      retryAfter: 60
    });
  }
});

module.exports = {
  ipLimiter,
  authLimiter,
  miningLimiter,
  adminLimiter,
  publicApiLimiter
};
