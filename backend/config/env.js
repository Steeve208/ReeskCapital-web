require('dotenv').config();

// Validación de variables de entorno
const requiredEnvVars = [
  'DATABASE_URL',
  'JWT_SECRET',
  'ADMIN_JWT_SECRET'
];

// Solo validar en producción
if (process.env.NODE_ENV === 'production') {
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      console.error(`❌ Variable de entorno requerida: ${envVar}`);
      process.exit(1);
    }
  }
}

const config = {
  // PostgreSQL
  database: {
    url: process.env.DATABASE_URL || 'postgres://rsc_user:rsc_password_2024@localhost:5432/rsc_mining'
  },

  // Auth
  jwt: {
    secret: process.env.JWT_SECRET || 'rsc_jwt_secret_key_2024_development',
    expires: process.env.JWT_EXPIRES || '7d',
    adminSecret: process.env.ADMIN_JWT_SECRET || 'rsc_admin_jwt_secret_key_2024_development',
    adminExpires: process.env.ADMIN_JWT_EXPIRES || '7d'
  },

  // Seguridad
  security: {
    rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 60000,
    rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX) || 120,
    corsOrigin: process.env.CORS_ORIGIN || '*'
  },

  // Minería
  mining: {
    cooldownSeconds: parseInt(process.env.MINE_COOLDOWN_SECONDS) || 60,
    rewardMin: parseFloat(process.env.MINE_REWARD_MIN) || 0.001,
    rewardMax: parseFloat(process.env.MINE_REWARD_MAX) || 0.05,
    dailyCap: parseFloat(process.env.MINE_DAILY_CAP) || 5
  },

  // Caché
  cache: {
    ttlSeconds: parseInt(process.env.CACHE_TTL_SECONDS) || 30
  },

  // App
  app: {
    port: parseInt(process.env.PORT) || 4000,
    nodeEnv: process.env.NODE_ENV || 'development'
  },

  // RSC Chain API
  rscChain: {
    api: process.env.RSC_CHAIN_API || 'https://rsc-chain-production.up.railway.app/'
  }
};

module.exports = config;
