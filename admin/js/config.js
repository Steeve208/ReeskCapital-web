/**
 * RSC CHAIN ADMIN PANEL - CONFIGURATION
 * 
 * IMPORTANTE: Este archivo contiene configuraciones sensibles.
 * NO subir a repositorio público con credenciales reales.
 * Usar variables de entorno en producción.
 */

const ADMIN_CONFIG = {
  // ===== SUPABASE =====
  supabase: {
    url: 'YOUR_SUPABASE_PROJECT_URL',
    anonKey: 'YOUR_SUPABASE_ANON_KEY',
    // Opcional: Service Role Key (solo backend)
    serviceKey: 'YOUR_SUPABASE_SERVICE_ROLE_KEY'
  },

  // ===== AUTHENTICATION =====
  auth: {
    // Duración de sesión (milisegundos)
    sessionDuration: 24 * 60 * 60 * 1000, // 24 horas
    
    // Duración de "remember me"
    rememberMeDuration: 30 * 24 * 60 * 60 * 1000, // 30 días
    
    // Habilitar 2FA
    enable2FA: false,
    
    // Máximo intentos de login
    maxLoginAttempts: 5,
    
    // Tiempo de bloqueo después de intentos fallidos (minutos)
    lockoutDuration: 15
  },

  // ===== API =====
  api: {
    // Base URL de tu API (si tienes backend separado)
    baseUrl: 'https://api.rscchain.com',
    
    // Timeout de requests (milisegundos)
    timeout: 30000,
    
    // Retry automático
    retry: {
      enabled: true,
      maxRetries: 3,
      delayMs: 1000
    }
  },

  // ===== PAGINATION =====
  pagination: {
    // Items por página por defecto
    defaultPageSize: 25,
    
    // Opciones de items por página
    pageSizeOptions: [10, 25, 50, 100]
  },

  // ===== UPLOADS =====
  uploads: {
    // Tamaño máximo de archivo (bytes)
    maxFileSize: 10 * 1024 * 1024, // 10MB
    
    // Tipos de archivo permitidos
    allowedTypes: [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf'
    ],
    
    // Bucket de Supabase Storage
    storageBucket: 'admin-uploads'
  },

  // ===== TREASURY =====
  treasury: {
    // Límites por defecto
    defaultLimits: {
      daily: 10000,
      weekly: 50000,
      monthly: 150000
    },
    
    // Umbral para aprobación automática
    autoApproveUnder: 100,
    
    // Umbral para requerer aprobación
    requireApprovalOver: 5000,
    
    // Wallets
    wallets: {
      hot: 'HOT_WALLET_ADDRESS',
      cold: 'COLD_WALLET_ADDRESS'
    }
  },

  // ===== METRICS =====
  metrics: {
    // Intervalo de actualización automática (segundos)
    autoRefreshInterval: 60,
    
    // Retención de historial (días)
    historyRetentionDays: 90,
    
    // APIs externas para métricas
    externalAPIs: {
      youtube: {
        enabled: false,
        apiKey: 'YOUR_YOUTUBE_API_KEY',
        channelId: 'YOUR_CHANNEL_ID'
      },
      twitter: {
        enabled: false,
        bearerToken: 'YOUR_TWITTER_BEARER_TOKEN',
        username: 'YOUR_TWITTER_USERNAME'
      },
      telegram: {
        enabled: false,
        botToken: 'YOUR_TELEGRAM_BOT_TOKEN',
        chatId: 'YOUR_CHAT_ID'
      }
    }
  },

  // ===== CAMPAIGNS =====
  campaigns: {
    // Duración máxima de campaña (días)
    maxDurationDays: 365,
    
    // Permitir campañas simultáneas
    allowMultipleCampaigns: true,
    
    // Auto-completar campañas al alcanzar todas las metas
    autoComplete: true
  },

  // ===== REWARDS =====
  rewards: {
    // Procesamiento de lotes
    batchProcessing: {
      // Tamaño máximo de lote
      maxBatchSize: 1000,
      
      // Procesamiento por chunks
      chunkSize: 100,
      
      // Delay entre chunks (ms)
      chunkDelay: 1000
    },
    
    // Tipos de recompensa soportados
    supportedTypes: [
      'RSC',
      'NFT',
      'POINTS',
      'BADGE',
      'ACCESS'
    ]
  },

  // ===== JOBS =====
  jobs: {
    // Intervalo mínimo de ejecución (minutos)
    minInterval: 5,
    
    // Timeout de ejecución (minutos)
    executionTimeout: 30,
    
    // Retención de logs (días)
    logRetentionDays: 30,
    
    // Jobs predefinidos
    predefinedJobs: [
      {
        name: 'Update Metrics',
        description: 'Actualizar métricas desde APIs externas',
        schedule: '0 */6 * * *', // Cada 6 horas
        enabled: true
      },
      {
        name: 'Process Pending Rewards',
        description: 'Procesar recompensas pendientes',
        schedule: '0 0 * * *', // Diario a medianoche
        enabled: true
      },
      {
        name: 'Cleanup Old Data',
        description: 'Limpiar datos antiguos',
        schedule: '0 2 * * 0', // Domingos a las 2 AM
        enabled: true
      }
    ]
  },

  // ===== AUDIT =====
  audit: {
    // Retención de logs (días)
    logRetentionDays: 365,
    
    // Módulos auditables
    auditableModules: [
      'users',
      'campaigns',
      'rewards',
      'treasury',
      'admins',
      'settings'
    ],
    
    // Acciones críticas que requieren confirmación
    criticalActions: [
      'delete_user',
      'delete_campaign',
      'approve_payment',
      'create_admin',
      'delete_admin',
      'change_settings'
    ]
  },

  // ===== NOTIFICATIONS =====
  notifications: {
    // Canales habilitados
    channels: {
      email: false,
      sms: false,
      telegram: true,
      inApp: true
    },
    
    // Telegram Bot
    telegram: {
      botToken: 'YOUR_TELEGRAM_BOT_TOKEN',
      adminChatId: 'YOUR_ADMIN_CHAT_ID'
    },
    
    // Tipos de notificaciones
    types: {
      // Críticas (siempre enviar)
      critical: [
        'payment_failed',
        'security_breach',
        'system_error'
      ],
      
      // Importantes (enviar según preferencias)
      important: [
        'large_payment',
        'new_admin',
        'campaign_completed'
      ],
      
      // Informativas (opcional)
      info: [
        'user_registered',
        'metric_updated',
        'job_completed'
      ]
    }
  },

  // ===== FEATURES =====
  features: {
    // Habilitar/deshabilitar módulos
    enabledModules: {
      dashboard: true,
      content: true,
      users: true,
      metrics: true,
      campaigns: true,
      rewards: true,
      jobs: true,
      treasury: true,
      admins: true,
      audit: true,
      settings: true
    },
    
    // Features experimentales
    experimental: {
      aiRecommendations: false,
      predictiveAnalytics: false,
      autoScaling: false
    }
  },

  // ===== UI/UX =====
  ui: {
    // Tema por defecto
    defaultTheme: 'dark',
    
    // Temas disponibles
    availableThemes: ['dark', 'light', 'auto'],
    
    // Idioma por defecto
    defaultLanguage: 'es',
    
    // Idiomas disponibles
    availableLanguages: ['es', 'en', 'pt'],
    
    // Formato de fecha
    dateFormat: 'DD/MM/YYYY HH:mm',
    
    // Formato de moneda
    currencyFormat: {
      symbol: 'RSC',
      decimals: 2,
      thousandsSeparator: ',',
      decimalSeparator: '.'
    }
  },

  // ===== DEVELOPMENT =====
  development: {
    // Modo debug
    debug: false,
    
    // Mostrar logs en consola
    verboseLogs: false,
    
    // Mock data para testing
    useMockData: false,
    
    // Desactivar autenticación (¡solo desarrollo!)
    skipAuth: false
  }
};

// Export configuration
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ADMIN_CONFIG;
}

// Make available globally
window.ADMIN_CONFIG = ADMIN_CONFIG;


