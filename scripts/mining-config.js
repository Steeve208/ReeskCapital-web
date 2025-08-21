/* ===== CONFIGURACIÓN CENTRALIZADA DEL SISTEMA DE MINERÍA RSC ===== */

const MINING_CONFIG = {
    // Configuración de sesiones
    SESSION_DURATION: 24 * 60 * 60 * 1000, // 24 horas en milisegundos
    
    // Configuración de tokens
    BASE_TOKEN_RATE: 0.001, // tokens por segundo base
    HASH_POWER_MULTIPLIER: 0.2, // multiplicador por punto de hash power
    TIME_MULTIPLIER_CAP: 24, // máximo multiplicador por tiempo (horas)
    
    // Configuración de actualizaciones
    TOKEN_CALCULATION_INTERVAL: 1000, // 1 segundo
    UI_UPDATE_INTERVAL: 1000, // 1 segundo
    BACKEND_SYNC_INTERVAL: 30000, // 30 segundos
    DATA_SAVE_INTERVAL: 10000, // 10 segundos
    
    // Configuración de niveles
    LEVELS: {
        1: { name: 'Novato', minTokens: 0, maxTokens: 9.99, bonus: 0 },
        2: { name: 'Aprendiz', minTokens: 10, maxTokens: 49.99, bonus: 5 },
        3: { name: 'Minero', minTokens: 50, maxTokens: 99.99, bonus: 10 },
        4: { name: 'Experto', minTokens: 100, maxTokens: 499.99, bonus: 15 },
        5: { name: 'Maestro', minTokens: 500, maxTokens: 999.99, bonus: 20 },
        6: { name: 'Veterano', minTokens: 1000, maxTokens: 1999.99, bonus: 25 },
        7: { name: 'Élite', minTokens: 2000, maxTokens: 4999.99, bonus: 30 },
        8: { name: 'Legendario', minTokens: 5000, maxTokens: 9999.99, bonus: 35 },
        9: { name: 'Mítico', minTokens: 10000, maxTokens: 49999.99, bonus: 40 },
        10: { name: 'Divino', minTokens: 50000, maxTokens: Infinity, bonus: 50 }
    },
    
    // Configuración de intensidad
    INTENSITY_LEVELS: {
        1: { name: 'Muy Baja', multiplier: 0.5, power: 500 },
        2: { name: 'Baja', multiplier: 0.7, power: 700 },
        3: { name: 'Media-Baja', multiplier: 0.85, power: 850 },
        4: { name: 'Media', multiplier: 1.0, power: 1000 },
        5: { name: 'Media-Alta', multiplier: 1.2, power: 1200 },
        6: { name: 'Alta', multiplier: 1.4, power: 1400 },
        7: { name: 'Muy Alta', multiplier: 1.7, power: 1700 },
        8: { name: 'Extrema', multiplier: 2.0, power: 2000 },
        9: { name: 'Insana', multiplier: 2.5, power: 2500 },
        10: { name: 'Épica', multiplier: 3.0, power: 3000 }
    },
    
    // Configuración de eficiencia
    EFFICIENCY_FACTORS: {
        TIME_BONUS_MAX: 50, // máximo 50% por tiempo
        CONSISTENCY_BONUS: 50, // 50% por consistencia
        HASH_POWER_BONUS_MAX: 30, // máximo 30% por hash power
        LEVEL_BONUS_MAX: 20 // máximo 20% por nivel
    },
    
    // Configuración de recompensas
    REWARDS: {
        DAILY_BONUS: 0.1, // 10% bonus por sesión diaria completa
        STREAK_BONUS: 0.05, // 5% bonus por cada día consecutivo
        LEVEL_UP_BONUS: 0.25, // 25% bonus al subir de nivel
        PERFECT_SESSION_BONUS: 0.5 // 50% bonus por sesión perfecta
    },
    
    // Configuración de persistencia
    STORAGE_KEYS: {
        MINING_DATA: 'rsc_mining_data',
        LAST_UPDATE: 'rsc_mining_last_update',
        USER_PREFERENCES: 'rsc_mining_preferences',
        ACHIEVEMENTS: 'rsc_mining_achievements'
    },
    
    // Configuración de notificaciones
    NOTIFICATION_DURATION: 5000, // 5 segundos
    
    // Configuración de animaciones
    ANIMATION_DURATION: 300, // 300ms
    
    // Configuración de validación
    VALIDATION: {
        MIN_HASH_POWER: 1,
        MAX_HASH_POWER: 10,
        MIN_SESSION_TIME: 60 * 1000, // 1 minuto mínimo
        MAX_SESSION_TIME: 25 * 60 * 60 * 1000 // 25 horas máximo
    }
};

// Funciones de utilidad para el sistema de minería
const MiningUtils = {
    // Obtener nombre del nivel
    getLevelName(level) {
        return MINING_CONFIG.LEVELS[level]?.name || 'Desconocido';
    },
    
    // Obtener nivel actual basado en tokens
    getCurrentLevel(tokens) {
        for (let level = Object.keys(MINING_CONFIG.LEVELS).length; level >= 1; level--) {
            if (tokens >= MINING_CONFIG.LEVELS[level].minTokens) {
                return level;
            }
        }
        return 1;
    },
    
    // Obtener progreso hacia el siguiente nivel
    getLevelProgress(tokens) {
        const currentLevel = this.getCurrentLevel(tokens);
        const currentLevelData = MINING_CONFIG.LEVELS[currentLevel];
        const nextLevelData = MINING_CONFIG.LEVELS[currentLevel + 1];
        
        if (!nextLevelData) return 100; // Nivel máximo
        
        const currentLevelTokens = currentLevelData.minTokens;
        const nextLevelTokens = nextLevelData.minTokens;
        const userTokens = tokens;
        
        const progress = ((userTokens - currentLevelTokens) / (nextLevelTokens - currentLevelTokens)) * 100;
        return Math.min(Math.max(progress, 0), 100);
    },
    
    // Obtener bonus del nivel actual
    getLevelBonus(level) {
        return MINING_CONFIG.LEVELS[level]?.bonus || 0;
    },
    
    // Obtener información de intensidad
    getIntensityInfo(hashPower) {
        return MINING_CONFIG.INTENSITY_LEVELS[hashPower] || MINING_CONFIG.INTENSITY_LEVELS[5];
    },
    
    // Calcular eficiencia total
    calculateTotalEfficiency(elapsed, hashPower, level, consistency) {
        const timeEfficiency = Math.min((elapsed / 3600) * (MINING_CONFIG.EFFICIENCY_FACTORS.TIME_BONUS_MAX / 24), MINING_CONFIG.EFFICIENCY_FACTORS.TIME_BONUS_MAX);
        const hashPowerEfficiency = Math.min((hashPower / 10) * MINING_CONFIG.EFFICIENCY_FACTORS.HASH_POWER_BONUS_MAX, MINING_CONFIG.EFFICIENCY_FACTORS.HASH_POWER_BONUS_MAX);
        const levelEfficiency = Math.min((level / 10) * MINING_CONFIG.EFFICIENCY_FACTORS.LEVEL_BONUS_MAX, MINING_CONFIG.EFFICIENCY_FACTORS.LEVEL_BONUS_MAX);
        const consistencyEfficiency = consistency * MINING_CONFIG.EFFICIENCY_FACTORS.CONSISTENCY_BONUS;
        
        return Math.min(100, timeEfficiency + hashPowerEfficiency + levelEfficiency + consistencyEfficiency);
    },
    
    // Calcular tokens con todos los bonus
    calculateTokensWithBonus(baseTokens, hashPower, level, efficiency, streak, perfectSession) {
        const intensityMultiplier = MINING_CONFIG.INTENSITY_LEVELS[hashPower]?.multiplier || 1;
        const levelBonus = this.getLevelBonus(level) / 100;
        const efficiencyBonus = efficiency / 100;
        const streakBonus = streak * MINING_CONFIG.REWARDS.STREAK_BONUS;
        const perfectBonus = perfectSession ? MINING_CONFIG.REWARDS.PERFECT_SESSION_BONUS : 0;
        
        const totalMultiplier = 1 + levelBonus + efficiencyBonus + streakBonus + perfectBonus;
        
        return baseTokens * intensityMultiplier * totalMultiplier;
    },
    
    // Formatear números
    formatNumber(num, decimals = 6) {
        if (num < 1000) return num.toFixed(decimals);
        if (num < 1000000) return (num / 1000).toFixed(3) + 'K';
        if (num < 1000000000) return (num / 1000000).toFixed(3) + 'M';
        return (num / 1000000000).toFixed(3) + 'B';
    },
    
    // Formatear tiempo
    formatTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        
        if (hours > 0) {
            return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        } else if (minutes > 0) {
            return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        } else {
            return `${secs.toString().padStart(2, '0')}s`;
        }
    },
    
    // Formatear tiempo restante
    formatTimeRemaining(milliseconds) {
        if (milliseconds <= 0) return 'Completado';
        
        const hours = Math.floor(milliseconds / (1000 * 60 * 60));
        const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);
        
        if (hours > 0) {
            return `${hours}h ${minutes}m ${seconds}s`;
        } else if (minutes > 0) {
            return `${minutes}m ${seconds}s`;
        } else {
            return `${seconds}s`;
        }
    },
    
    // Obtener tiempo restante
    getTimeRemaining(endTime) {
        const now = new Date();
        const end = new Date(endTime);
        const remaining = end - now;
        
        if (remaining <= 0) return 0;
        return remaining;
    },
    
    // Validar hash power
    validateHashPower(hashPower) {
        return hashPower >= MINING_CONFIG.VALIDATION.MIN_HASH_POWER && 
               hashPower <= MINING_CONFIG.VALIDATION.MAX_HASH_POWER;
    },
    
    // Validar tiempo de sesión
    validateSessionTime(duration) {
        return duration >= MINING_CONFIG.VALIDATION.MIN_SESSION_TIME && 
               duration <= MINING_CONFIG.VALIDATION.MAX_SESSION_TIME;
    },
    
    // Generar ID de sesión único
    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    },
    
    // Calcular hash rate en H/s
    calculateHashRate(hashPower) {
        return hashPower * 1000;
    },
    
    // Calcular potencia total
    calculateTotalPower(hashPower, level, efficiency) {
        const basePower = this.calculateHashRate(hashPower);
        const levelMultiplier = 1 + (level - 1) * 0.1; // 10% por nivel
        const efficiencyMultiplier = efficiency / 100;
        
        return basePower * levelMultiplier * efficiencyMultiplier;
    }
};

// Exportar configuración y utilidades
window.MINING_CONFIG = MINING_CONFIG;
window.MiningUtils = MiningUtils;
