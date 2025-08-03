/* ================================
   CONFIG.JS — CONFIGURACIÓN DE APIS
================================ */

// Configuración de APIs y endpoints
const API_CONFIG = {
  // API Base URL - RSC Chain Production
  BASE_URL: 'https://rsc-chain-production.up.railway.app',
  
  // Endpoints de Wallet
  WALLET: {
    CREATE: '/api/wallet/create',
    BALANCE: '/api/wallet/balance',
    TRANSACTIONS: '/api/wallet/transactions',
    SEND: '/api/wallet/send'
  },
  
  // Endpoints de Mining
  MINING: {
    START: '/api/mining/start',
    STOP: '/api/mining/stop',
    STATUS: '/api/mining/status'
  },
  
  // Endpoints de Staking
  STAKING: {
    POOLS: '/api/staking/pools',
    VALIDATORS: '/api/staking/validators',
    DELEGATE: '/api/staking/delegate',
    UNDELEGATE: '/api/staking/undelegate',
    DELEGATIONS: '/api/staking/delegations'
  },
  
  // Endpoints de P2P
  P2P: {
    ORDERS: '/api/p2p/orders',
    CREATE_ORDER: '/api/p2p/orders'
  },
  
  // Endpoints de Blockchain Explorer
  BLOCKCHAIN: {
    STATS: '/api/blockchain/stats',
    BLOCKS: '/api/blockchain/blocks',
    TRANSACTIONS: '/api/blockchain/transactions',
    STATUS: '/api/status'
  },
  
  // Endpoints de Banking
  BANK: {
    BALANCE: '/api/bank/balance',
    TRANSACTIONS: '/api/bank/transactions'
  },
  
  // Configuración de WebSocket
  WEBSOCKET: {
    URL: 'wss://rsc-chain-production.up.railway.app/ws',
    RECONNECT_INTERVAL: 5000,
    MAX_RECONNECT_ATTEMPTS: 5
  }
};

// Configuración de la aplicación
const APP_CONFIG = {
  // Configuración de notificaciones
  NOTIFICATIONS: {
    AUTO_HIDE: true,
    AUTO_HIDE_DELAY: 5000,
    MAX_NOTIFICATIONS: 5
  },
  
  // Configuración de animaciones
  ANIMATIONS: {
    ENABLED: true,
    DURATION: 300,
    EASING: 'ease-out'
  },
  
  // Configuración de datos en tiempo real
  REALTIME: {
    UPDATE_INTERVAL: 30000, // 30 segundos
    ENABLED: true
  },
  
  // Configuración de cache
  CACHE: {
    ENABLED: true,
    DURATION: 5 * 60 * 1000, // 5 minutos
    MAX_SIZE: 50
  }
};

// Configuración de temas
const THEME_CONFIG = {
  COLORS: {
    primary: '#7657fc',
    secondary: '#10b981',
    accent: '#f59e0b',
    danger: '#ef4444',
    warning: '#f59e0b',
    success: '#10b981',
    info: '#3b82f6'
  },
  
  GRADIENTS: {
    primary: 'linear-gradient(135deg, #7657fc 0%, #a855f7 100%)',
    secondary: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    accent: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
  }
};

// Configuración de validación
const VALIDATION_CONFIG = {
  // Validación de direcciones de wallet
  ADDRESS: {
    PATTERN: /^0x[a-fA-F0-9]{40}$/,
    MIN_LENGTH: 42,
    MAX_LENGTH: 42
  },
  
  // Validación de transacciones
  TRANSACTION: {
    MIN_AMOUNT: 0.000001,
    MAX_AMOUNT: 1000000,
    MIN_FEE: 50
  },
  
  // Validación de staking
  STAKING: {
    MIN_AMOUNT: 100,
    MAX_AMOUNT: 1000000
  }
};

// Configuración de errores
const ERROR_MESSAGES = {
  NETWORK: {
    CONNECTION_FAILED: 'Error de conexión. Verifica tu internet.',
    TIMEOUT: 'La solicitud tardó demasiado. Intenta de nuevo.',
    SERVER_ERROR: 'Error del servidor. Intenta más tarde.'
  },
  
  WALLET: {
    INVALID_ADDRESS: 'Dirección de wallet inválida.',
    INSUFFICIENT_BALANCE: 'Saldo insuficiente.',
    TRANSACTION_FAILED: 'La transacción falló.'
  },
  
  MINING: {
    ALREADY_MINING: 'Ya estás minando.',
    NOT_MINING: 'No estás minando actualmente.',
    SESSION_EXPIRED: 'La sesión de minería expiró.'
  },
  
  STAKING: {
    INSUFFICIENT_TOKENS: 'Tokens insuficientes para staking.',
    VALIDATOR_NOT_FOUND: 'Validador no encontrado.',
    DELEGATION_FAILED: 'La delegación falló.'
  }
};

// Función para obtener la URL completa de un endpoint
function getApiUrl(endpoint) {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
}

// Función para hacer requests a la API
async function apiRequest(endpoint, options = {}) {
  const url = getApiUrl(endpoint);
  const defaultOptions = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    },
    timeout: 10000
  };
  
  const finalOptions = { ...defaultOptions, ...options };
  
  try {
    const response = await fetch(url, finalOptions);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    return { success: true, data };
    
  } catch (error) {
    console.error('API Request Error:', error);
    return { 
      success: false, 
      error: error.message,
      endpoint,
      timestamp: new Date().toISOString()
    };
  }
}

// Función para validar una dirección de wallet
function validateAddress(address) {
  return VALIDATION_CONFIG.ADDRESS.PATTERN.test(address);
}

// Función para validar un monto
function validateAmount(amount, min = VALIDATION_CONFIG.TRANSACTION.MIN_AMOUNT, max = VALIDATION_CONFIG.TRANSACTION.MAX_AMOUNT) {
  const num = parseFloat(amount);
  return !isNaN(num) && num >= min && num <= max;
}

// Función para formatear números
function formatNumber(num, decimals = 6) {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: decimals
  }).format(num);
}

// Función para formatear direcciones
function formatAddress(address, start = 6, end = 4) {
  if (!address) return '';
  return `${address.substring(0, start)}...${address.substring(address.length - end)}`;
}

// Función para obtener el mensaje de error
function getErrorMessage(error, context = '') {
  const errorKey = error.toUpperCase().replace(/\s+/g, '_');
  return ERROR_MESSAGES[context]?.[errorKey] || error;
}

// Exportar configuración
window.API_CONFIG = API_CONFIG;
window.APP_CONFIG = APP_CONFIG;
window.THEME_CONFIG = THEME_CONFIG;
window.VALIDATION_CONFIG = VALIDATION_CONFIG;
window.ERROR_MESSAGES = ERROR_MESSAGES;

// Exportar funciones utilitarias
window.getApiUrl = getApiUrl;
window.apiRequest = apiRequest;
window.validateAddress = validateAddress;
window.validateAmount = validateAmount;
window.formatNumber = formatNumber;
window.formatAddress = formatAddress;
window.getErrorMessage = getErrorMessage; 