/**
 * CONFIGURACIÓN UNIFICADA DE SUPABASE
 * 
 * Configuración centralizada y única para toda la aplicación
 * - Cliente principal para operaciones de usuario
 * - Cliente admin para operaciones del sistema
 * - Configuración de tablas y esquemas
 * - Funciones de utilidad
 */

import { createClient } from '@supabase/supabase-js';

// ===== CONFIGURACIÓN PRINCIPAL =====
const SUPABASE_CONFIG = {
    url: 'https://unevdceponbnmhvpzlzf.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVuZXZkY2Vwb25ibm1odnB6bHpmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU5MTIyMTksImV4cCI6MjA3MTQ4ODIxOX0.OLHbZrezgBiXWQplN1jrGD_xkARqG2uD8ECqzo05jE4',
    serviceKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVuZXZkY2Vwb25ibm1odnB6bHpmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTkxMjIxOSwiZXhwIjoyMDcxNDg4MjE5fQ.f0JDrO3AJrgpB8UwCuwHFXw8WWAY9Y-kCojWCaKIhjU'
};

// ===== CLIENTES SUPABASE =====
export const supabase = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
export const supabaseAdmin = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.serviceKey);

// ===== CONFIGURACIÓN DE TABLAS =====
export const TABLES = {
    USERS: 'users',
    MINING_SESSIONS: 'mining_sessions',
    TRANSACTIONS: 'transactions',
    REFERRALS: 'referrals',
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

// ===== CONFIGURACIÓN DE MINERÍA =====
export const MINING_CONFIG = {
    SESSION_DURATION: 24 * 60 * 60 * 1000, // 24 horas en ms
    BASE_HASH_RATE: 1000, // H/s base
    TOKENS_PER_SECOND: 0.001, // RSC por segundo
    MAX_EFFICIENCY: 150, // Máxima eficiencia %
    MIN_EFFICIENCY: 50, // Mínima eficiencia %
    DIFFICULTY_ADJUSTMENT: 1.0,
    MAX_DAILY_MINING: 100.0, // 100 RSC máximo por día
    MIN_BALANCE: 0.0,
    MAX_BALANCE: 1000000.0
};

// ===== CONFIGURACIÓN DE REFERRALS =====
export const REFERRAL_CONFIG = {
    COMMISSION_RATE: 0.10, // 10% para referrers
    BONUS_RATE: 0.05, // 5% bonus por referir
    MAX_LEVELS: 3, // Máximo 3 niveles de referidos
    CODE_LENGTH: 8,
    CODE_PREFIX: 'RSC'
};

// ===== CONFIGURACIÓN DE SEGURIDAD =====
export const SECURITY_CONFIG = {
    MAX_LOGIN_ATTEMPTS: 5,
    LOCKOUT_DURATION: 15 * 60 * 1000, // 15 minutos
    SESSION_TIMEOUT: 24 * 60 * 60 * 1000, // 24 horas
    PASSWORD_MIN_LENGTH: 8,
    EMAIL_VERIFICATION_REQUIRED: false // Cambiar a true en producción
};

// ===== FUNCIONES DE UTILIDAD =====

/**
 * Verificar conexión con Supabase
 */
export async function checkSupabaseConnection() {
    try {
        const { data, error } = await supabase
            .from(TABLES.USERS)
            .select('count')
            .limit(1);
        
        if (error) throw error;
        return { connected: true, error: null };
    } catch (error) {
        console.error('❌ Error conectando con Supabase:', error);
        return { connected: false, error: error.message };
    }
}

/**
 * Obtener usuario actual autenticado
 */
export async function getCurrentUser() {
    try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) throw error;
        return user;
    } catch (error) {
        console.error('❌ Error obteniendo usuario actual:', error);
        return null;
    }
}

/**
 * Generar código de referral único
 */
export function generateReferralCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = REFERRAL_CONFIG.CODE_PREFIX;
    for (let i = 0; i < REFERRAL_CONFIG.CODE_LENGTH - REFERRAL_CONFIG.CODE_PREFIX.length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

/**
 * Validar email
 */
export function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Validar contraseña
 */
export function validatePassword(password) {
    return password && password.length >= SECURITY_CONFIG.PASSWORD_MIN_LENGTH;
}

/**
 * Formatear balance
 */
export function formatBalance(balance) {
    return parseFloat(balance).toFixed(6);
}

/**
 * Formatear hash rate
 */
export function formatHashRate(hashRate) {
    if (hashRate >= 1000000) {
        return (hashRate / 1000000).toFixed(1) + ' MH/s';
    } else if (hashRate >= 1000) {
        return (hashRate / 1000).toFixed(1) + ' KH/s';
    } else {
        return hashRate.toFixed(0) + ' H/s';
    }
}

/**
 * Formatear tiempo
 */
export function formatTime(milliseconds) {
    const seconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// ===== EXPORTAR CONFIGURACIÓN COMPLETA =====
export default {
    supabase,
    supabaseAdmin,
    TABLES,
    TRANSACTION_TYPES,
    MINING_STATUS,
    MINING_CONFIG,
    REFERRAL_CONFIG,
    SECURITY_CONFIG,
    checkSupabaseConnection,
    getCurrentUser,
    generateReferralCode,
    validateEmail,
    validatePassword,
    formatBalance,
    formatHashRate,
    formatTime
};

// Hacer disponible globalmente para compatibilidad
if (typeof window !== 'undefined') {
    window.SUPABASE_CONFIG = SUPABASE_CONFIG;
    window.supabase = supabase;
    window.supabaseAdmin = supabaseAdmin;
    window.TABLES = TABLES;
    window.MINING_CONFIG = MINING_CONFIG;
    window.REFERRAL_CONFIG = REFERRAL_CONFIG;
    window.SECURITY_CONFIG = SECURITY_CONFIG;
}
