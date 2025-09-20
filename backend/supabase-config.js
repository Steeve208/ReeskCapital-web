/**
 * RSC MINING BACKEND CONFIGURATION
 * 
 * Configuración completa para Supabase con sistema de referidos
 * - Gestión de usuarios
 * - Sistema de referidos con comisiones
 * - Integración con minería
 * - API endpoints
 */

import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase
const supabaseUrl = process.env.SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'your-anon-key';

// Cliente de Supabase
export const supabase = createClient(supabaseUrl, supabaseKey);

// ===== CONFIGURACIÓN DE TABLAS =====
export const TABLES = {
    USERS: 'users',
    REFERRALS: 'referrals',
    MINING_SESSIONS: 'mining_sessions',
    TRANSACTIONS: 'transactions',
    REFERRAL_CODES: 'referral_codes'
};

// ===== CONFIGURACIÓN DE TIPOS =====
export const TRANSACTION_TYPES = {
    MINING: 'mining',
    REFERRAL_COMMISSION: 'referral_commission',
    BONUS: 'bonus',
    WITHDRAWAL: 'withdrawal'
};

export const MINING_STATUS = {
    ACTIVE: 'active',
    COMPLETED: 'completed',
    EXPIRED: 'expired',
    CANCELLED: 'cancelled'
};

// ===== CONFIGURACIÓN DE COMISIONES =====
export const COMMISSION_RATES = {
    REFERRAL: 0.10, // 10% para referrers
    BONUS: 0.05,    // 5% bonus por referir
    MAX_LEVELS: 3   // Máximo 3 niveles de referidos
};

// ===== CONFIGURACIÓN DE MINERÍA =====
export const MINING_CONFIG = {
    SESSION_DURATION: 24 * 60 * 60 * 1000, // 24 horas en ms
    BASE_HASH_RATE: 1000, // H/s base
    TOKENS_PER_SECOND: 0.000116, // RSC por segundo (10 RSC por día)
    MAX_EFFICIENCY: 150, // Máxima eficiencia %
    MIN_EFFICIENCY: 50,  // Mínima eficiencia %
    DIFFICULTY_ADJUSTMENT: 1.0
};

// ===== CONFIGURACIÓN DE CÓDIGOS DE REFERRAL =====
export const REFERRAL_CONFIG = {
    CODE_LENGTH: 8,
    CODE_PREFIX: 'RSC',
    EXPIRY_DAYS: 365, // Los códigos expiran en 1 año
    MAX_USES: 1000    // Máximo 1000 usos por código
};

// ===== CONFIGURACIÓN DE LÍMITES =====
export const LIMITS = {
    MAX_BALANCE: 1000000.00000000, // 1M RSC máximo
    MIN_BALANCE: 0.00000000,       // 0 RSC mínimo
    MAX_SESSION_DURATION: 25 * 60 * 60 * 1000, // 25 horas máximo
    MAX_DAILY_MINING: 100.00000000, // 100 RSC máximo por día
    MAX_REFERRALS_PER_USER: 1000    // Máximo 1000 referidos por usuario
};

// ===== CONFIGURACIÓN DE SEGURIDAD =====
export const SECURITY_CONFIG = {
    MAX_LOGIN_ATTEMPTS: 5,
    LOCKOUT_DURATION: 15 * 60 * 1000, // 15 minutos
    SESSION_TIMEOUT: 24 * 60 * 60 * 1000, // 24 horas
    PASSWORD_MIN_LENGTH: 8,
    EMAIL_VERIFICATION_REQUIRED: true
};

// ===== CONFIGURACIÓN DE NOTIFICACIONES =====
export const NOTIFICATION_CONFIG = {
    ENABLE_EMAIL: true,
    ENABLE_PUSH: true,
    ENABLE_SMS: false,
    MINING_UPDATE_INTERVAL: 30000, // 30 segundos
    BALANCE_UPDATE_THRESHOLD: 0.001 // 0.001 RSC mínimo para notificar
};

// ===== CONFIGURACIÓN DE ANALYTICS =====
export const ANALYTICS_CONFIG = {
    TRACK_MINING_SESSIONS: true,
    TRACK_REFERRAL_CONVERSIONS: true,
    TRACK_USER_BEHAVIOR: true,
    RETENTION_DAYS: 30,
    CONVERSION_TRACKING: true
};

// ===== CONFIGURACIÓN DE BACKUP =====
export const BACKUP_CONFIG = {
    ENABLE_AUTO_BACKUP: true,
    BACKUP_INTERVAL: 24 * 60 * 60 * 1000, // 24 horas
    RETAIN_DAYS: 30,
    COMPRESS_BACKUPS: true
};

// ===== CONFIGURACIÓN DE RATE LIMITING =====
export const RATE_LIMITS = {
    API_CALLS_PER_MINUTE: 100,
    MINING_UPDATES_PER_MINUTE: 60,
    REFERRAL_CHECKS_PER_HOUR: 10,
    BALANCE_UPDATES_PER_MINUTE: 30
};

// ===== CONFIGURACIÓN DE MONITOREO =====
export const MONITORING_CONFIG = {
    ENABLE_LOGGING: true,
    LOG_LEVEL: 'info', // debug, info, warn, error
    ENABLE_METRICS: true,
    ENABLE_ALERTS: true,
    ALERT_THRESHOLDS: {
        ERROR_RATE: 0.05, // 5%
        RESPONSE_TIME: 5000, // 5 segundos
        BALANCE_DISCREPANCY: 0.01 // 0.01 RSC
    }
};

// ===== CONFIGURACIÓN DE DESARROLLO =====
export const DEV_CONFIG = {
    ENABLE_DEBUG: process.env.NODE_ENV === 'development',
    MOCK_DATA: process.env.NODE_ENV === 'development',
    VERBOSE_LOGGING: process.env.NODE_ENV === 'development',
    ENABLE_TEST_ENDPOINTS: process.env.NODE_ENV === 'development'
};

// ===== CONFIGURACIÓN DE PRODUCCIÓN =====
export const PROD_CONFIG = {
    ENABLE_DEBUG: false,
    MOCK_DATA: false,
    VERBOSE_LOGGING: false,
    ENABLE_TEST_ENDPOINTS: false,
    ENABLE_CACHING: true,
    CACHE_TTL: 300000 // 5 minutos
};

// ===== CONFIGURACIÓN COMBINADA =====
export const CONFIG = {
    ...TABLES,
    ...TRANSACTION_TYPES,
    ...MINING_STATUS,
    ...COMMISSION_RATES,
    ...MINING_CONFIG,
    ...REFERRAL_CONFIG,
    ...LIMITS,
    ...SECURITY_CONFIG,
    ...NOTIFICATION_CONFIG,
    ...ANALYTICS_CONFIG,
    ...BACKUP_CONFIG,
    ...RATE_LIMITS,
    ...MONITORING_CONFIG,
    ...(process.env.NODE_ENV === 'production' ? PROD_CONFIG : DEV_CONFIG)
};

// ===== FUNCIONES DE UTILIDAD =====

/**
 * Obtener configuración por entorno
 */
export function getConfig(env = process.env.NODE_ENV) {
    return env === 'production' ? PROD_CONFIG : DEV_CONFIG;
}

/**
 * Validar configuración
 */
export function validateConfig() {
    const required = ['SUPABASE_URL', 'SUPABASE_ANON_KEY'];
    const missing = required.filter(key => !process.env[key]);
    
    if (missing.length > 0) {
        throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
    
    return true;
}

/**
 * Obtener configuración de minería
 */
export function getMiningConfig() {
    return MINING_CONFIG;
}

/**
 * Obtener configuración de referidos
 */
export function getReferralConfig() {
    return REFERRAL_CONFIG;
}

/**
 * Obtener límites del sistema
 */
export function getLimits() {
    return LIMITS;
}

// ===== EXPORTAR CONFIGURACIÓN COMPLETA =====
export default {
    supabase,
    TABLES,
    TRANSACTION_TYPES,
    MINING_STATUS,
    COMMISSION_RATES,
    MINING_CONFIG,
    REFERRAL_CONFIG,
    LIMITS,
    SECURITY_CONFIG,
    NOTIFICATION_CONFIG,
    ANALYTICS_CONFIG,
    BACKUP_CONFIG,
    RATE_LIMITS,
    MONITORING_CONFIG,
    CONFIG,
    getConfig,
    validateConfig,
    getMiningConfig,
    getReferralConfig,
    getLimits
};
