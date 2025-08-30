// ========================================
// CONFIGURACIÓN DE MINERÍA MAINNET-READY
// ========================================

module.exports = {
    // ========================================
    // CONFIGURACIÓN DE BLOCKCHAIN
    // ========================================
    blockchain: {
        // API principal de RSC Chain
        apiUrl: process.env.RSC_BLOCKCHAIN_API || 'https://rsc-chain-production.up.railway.app/',
        
        // Configuración de red
        network: {
            testnet: {
                chainId: 1,
                name: 'RSC Testnet',
                isMainnet: false,
                blockTime: 15, // segundos
                maxGasPrice: '5000000000' // 5 gwei
            },
            mainnet: {
                chainId: 1,
                name: 'RSC Mainnet',
                isMainnet: true,
                blockTime: 15, // segundos
                maxGasPrice: '20000000000' // 20 gwei
            }
        },
        
        // Timeouts y reintentos
        timeouts: {
            request: 10000, // 10 segundos
            connection: 5000, // 5 segundos
            maxRetries: 3
        }
    },

    // ========================================
    // CONFIGURACIÓN DE MINERÍA
    // ========================================
    mining: {
        // Duración de sesiones
        session: {
            maxDuration: 24 * 60 * 60 * 1000, // 24 horas en ms
            minDuration: 60 * 60 * 1000, // 1 hora en ms
            cooldownPeriod: 60 * 60 * 1000, // 1 hora en ms
            maxSessionsPerDay: 1
        },
        
        // Potencia de hash
        hashPower: {
            min: 0.1,
            max: 100.0,
            default: 10.0,
            step: 0.1
        },
        
        // Recompensas
        rewards: {
            baseRate: 0.001, // tokens por segundo base
            hashMultiplier: 0.2, // multiplicador por unidad de hash power
            timeMultiplier: 1.0, // multiplicador por tiempo
            maxDailyReward: 100.0 // máximo de tokens por día
        },
        
        // Validaciones
        validation: {
            requireWallet: true,
            requireNetworkConnection: true,
            validateHashPower: true,
            preventMultipleSessions: true
        }
    },

    // ========================================
    // CONFIGURACIÓN DE PERSISTENCIA
    // ========================================
    persistence: {
        // Almacenamiento local
        local: {
            enabled: true,
            keyPrefix: 'rsc_mining_',
            encryption: false
        },
        
        // Sincronización con blockchain
        blockchain: {
            enabled: true,
            syncInterval: 30000, // 30 segundos
            autoSync: true,
            retryOnFailure: true
        },
        
        // Backup y recuperación
        backup: {
            enabled: true,
            interval: 300000, // 5 minutos
            maxBackups: 10
        }
    },

    // ========================================
    // CONFIGURACIÓN DE SEGURIDAD
    // ========================================
    security: {
        // Rate limiting
        rateLimit: {
            enabled: true,
            maxRequests: 100, // por minuto
            windowMs: 60000 // 1 minuto
        },
        
        // Validación de sesiones
        sessionValidation: {
            enabled: true,
            maxConcurrentSessions: 1,
            sessionTimeout: 30 * 60 * 1000 // 30 minutos
        },
        
        // Protección contra fraude
        fraudProtection: {
            enabled: true,
            detectBots: true,
            validateTransactions: true,
            suspiciousActivityThreshold: 5
        }
    },

    // ========================================
    // CONFIGURACIÓN DE NOTIFICACIONES
    // ========================================
    notifications: {
        // Tipos de notificación
        types: {
            mining: {
                start: true,
                stop: true,
                progress: true,
                completion: true
            },
            blockchain: {
                connection: true,
                sync: true,
                error: true
            },
            security: {
                suspicious: true,
                rateLimit: true,
                validation: true
            }
        },
        
        // Canales de notificación
        channels: {
            inApp: true,
            email: false,
            push: false,
            webhook: false
        }
    },

    // ========================================
    // CONFIGURACIÓN DE MONITOREO
    // ========================================
    monitoring: {
        // Métricas
        metrics: {
            enabled: true,
            collectionInterval: 60000, // 1 minuto
            retentionDays: 30
        },
        
        // Logs
        logging: {
            level: process.env.LOG_LEVEL || 'info',
            format: 'json',
            maxSize: '10m',
            maxFiles: 5
        },
        
        // Alertas
        alerts: {
            enabled: true,
            thresholds: {
                errorRate: 0.05, // 5%
                responseTime: 5000, // 5 segundos
                memoryUsage: 0.8 // 80%
            }
        }
    },

    // ========================================
    // CONFIGURACIÓN DE DESARROLLO
    // ========================================
    development: {
        // Modo debug
        debug: process.env.NODE_ENV === 'development',
        
        // Datos de prueba
        testData: {
            enabled: process.env.NODE_ENV === 'development',
            mockBlockchain: true,
            mockTransactions: true
        },
        
        // Logs detallados
        verbose: process.env.NODE_ENV === 'development'
    }
};
