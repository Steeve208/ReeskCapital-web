// Configuración del Backend RSC Chain
const config = {
  // Configuración del servidor
  port: process.env.PORT || 4000,
  host: process.env.HOST || 'localhost',
  
  // API de la blockchain
  blockchainApi: process.env.BLOCKCHAIN_API || 'https://rsc-chain-production.up.railway.app/',
  
  // Configuración de CORS
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true
  },
  
  // Configuración de logs
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.LOG_FORMAT || 'dev'
  },
  
  // Timeouts
  timeouts: {
    request: 10000, // 10 segundos
    blockchain: 5000  // 5 segundos
  },
  
  // Configuración de seguridad
  security: {
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15 minutos
      max: 100 // máximo 100 requests por ventana
    }
  },
  
  // Configuración de desarrollo
  development: {
    mockData: process.env.NODE_ENV !== 'production',
    debug: process.env.NODE_ENV === 'development'
  }
};

module.exports = config; 