/**
 * SISTEMA DE VALIDACIÓN DE DATOS
 * 
 * Validación robusta de todos los datos de la aplicación
 * - Validación de entrada
 * - Sanitización de datos
 * - Validación de tipos
 * - Validación de rangos
 */

import { MINING_CONFIG, SECURITY_CONFIG, REFERRAL_CONFIG } from '../config/supabase.js';

class DataValidator {
    constructor() {
        this.rules = {
            email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            username: /^[a-zA-Z0-9_]{3,20}$/,
            referralCode: /^[A-Z0-9]{8}$/,
            sessionId: /^mining_[a-z0-9_]+$/,
            walletAddress: /^0x[a-fA-F0-9]{40}$/
        };
        
        this.limits = {
            email: { min: 5, max: 255 },
            username: { min: 3, max: 20 },
            password: { min: SECURITY_CONFIG.PASSWORD_MIN_LENGTH, max: 128 },
            referralCode: { length: 8 },
            balance: { min: MINING_CONFIG.MIN_BALANCE, max: MINING_CONFIG.MAX_BALANCE },
            tokensMined: { min: 0, max: MINING_CONFIG.MAX_DAILY_MINING },
            hashRate: { min: 0, max: 1000000 },
            efficiency: { min: 0, max: 200 },
            sessionDuration: { min: 1000, max: 25 * 60 * 60 * 1000 } // 1 segundo a 25 horas
        };
    }

    /**
     * Validar email
     */
    validateEmail(email) {
        const errors = [];
        
        if (!email) {
            errors.push('Email es requerido');
            return { valid: false, errors };
        }
        
        if (typeof email !== 'string') {
            errors.push('Email debe ser una cadena de texto');
            return { valid: false, errors };
        }
        
        if (email.length < this.limits.email.min) {
            errors.push(`Email debe tener al menos ${this.limits.email.min} caracteres`);
        }
        
        if (email.length > this.limits.email.max) {
            errors.push(`Email debe tener máximo ${this.limits.email.max} caracteres`);
        }
        
        if (!this.rules.email.test(email)) {
            errors.push('Email tiene un formato inválido');
        }
        
        return {
            valid: errors.length === 0,
            errors,
            sanitized: email.toLowerCase().trim()
        };
    }

    /**
     * Validar contraseña
     */
    validatePassword(password) {
        const errors = [];
        
        if (!password) {
            errors.push('Contraseña es requerida');
            return { valid: false, errors };
        }
        
        if (typeof password !== 'string') {
            errors.push('Contraseña debe ser una cadena de texto');
            return { valid: false, errors };
        }
        
        if (password.length < this.limits.password.min) {
            errors.push(`Contraseña debe tener al menos ${this.limits.password.min} caracteres`);
        }
        
        if (password.length > this.limits.password.max) {
            errors.push(`Contraseña debe tener máximo ${this.limits.password.max} caracteres`);
        }
        
        // Verificar complejidad
        if (!/(?=.*[a-z])/.test(password)) {
            errors.push('Contraseña debe contener al menos una letra minúscula');
        }
        
        if (!/(?=.*[A-Z])/.test(password)) {
            errors.push('Contraseña debe contener al menos una letra mayúscula');
        }
        
        if (!/(?=.*\d)/.test(password)) {
            errors.push('Contraseña debe contener al menos un número');
        }
        
        if (!/(?=.*[@$!%*?&])/.test(password)) {
            errors.push('Contraseña debe contener al menos un carácter especial (@$!%*?&)');
        }
        
        return {
            valid: errors.length === 0,
            errors,
            sanitized: password
        };
    }

    /**
     * Validar nombre de usuario
     */
    validateUsername(username) {
        const errors = [];
        
        if (!username) {
            errors.push('Nombre de usuario es requerido');
            return { valid: false, errors };
        }
        
        if (typeof username !== 'string') {
            errors.push('Nombre de usuario debe ser una cadena de texto');
            return { valid: false, errors };
        }
        
        if (username.length < this.limits.username.min) {
            errors.push(`Nombre de usuario debe tener al menos ${this.limits.username.min} caracteres`);
        }
        
        if (username.length > this.limits.username.max) {
            errors.push(`Nombre de usuario debe tener máximo ${this.limits.username.max} caracteres`);
        }
        
        if (!this.rules.username.test(username)) {
            errors.push('Nombre de usuario solo puede contener letras, números y guiones bajos');
        }
        
        // Verificar palabras reservadas
        const reservedWords = ['admin', 'root', 'system', 'api', 'www', 'mail', 'ftp', 'test'];
        if (reservedWords.includes(username.toLowerCase())) {
            errors.push('Nombre de usuario no disponible');
        }
        
        return {
            valid: errors.length === 0,
            errors,
            sanitized: username.toLowerCase().trim()
        };
    }

    /**
     * Validar código de referral
     */
    validateReferralCode(referralCode) {
        const errors = [];
        
        if (!referralCode) {
            return { valid: true, errors: [], sanitized: null }; // Opcional
        }
        
        if (typeof referralCode !== 'string') {
            errors.push('Código de referral debe ser una cadena de texto');
            return { valid: false, errors };
        }
        
        if (referralCode.length !== this.limits.referralCode.length) {
            errors.push(`Código de referral debe tener ${this.limits.referralCode.length} caracteres`);
        }
        
        if (!this.rules.referralCode.test(referralCode)) {
            errors.push('Código de referral debe contener solo letras mayúsculas y números');
        }
        
        return {
            valid: errors.length === 0,
            errors,
            sanitized: referralCode.toUpperCase().trim()
        };
    }

    /**
     * Validar balance
     */
    validateBalance(balance) {
        const errors = [];
        
        if (balance === null || balance === undefined) {
            errors.push('Balance es requerido');
            return { valid: false, errors };
        }
        
        const numBalance = parseFloat(balance);
        
        if (isNaN(numBalance)) {
            errors.push('Balance debe ser un número válido');
            return { valid: false, errors };
        }
        
        if (numBalance < this.limits.balance.min) {
            errors.push(`Balance debe ser al menos ${this.limits.balance.min}`);
        }
        
        if (numBalance > this.limits.balance.max) {
            errors.push(`Balance no puede exceder ${this.limits.balance.max}`);
        }
        
        return {
            valid: errors.length === 0,
            errors,
            sanitized: Math.round(numBalance * 100000000) / 100000000 // 8 decimales
        };
    }

    /**
     * Validar tokens minados
     */
    validateTokensMined(tokens) {
        const errors = [];
        
        if (tokens === null || tokens === undefined) {
            errors.push('Tokens minados es requerido');
            return { valid: false, errors };
        }
        
        const numTokens = parseFloat(tokens);
        
        if (isNaN(numTokens)) {
            errors.push('Tokens minados debe ser un número válido');
            return { valid: false, errors };
        }
        
        if (numTokens < this.limits.tokensMined.min) {
            errors.push(`Tokens minados debe ser al menos ${this.limits.tokensMined.min}`);
        }
        
        if (numTokens > this.limits.tokensMined.max) {
            errors.push(`Tokens minados no puede exceder ${this.limits.tokensMined.max} por día`);
        }
        
        return {
            valid: errors.length === 0,
            errors,
            sanitized: Math.round(numTokens * 100000000) / 100000000 // 8 decimales
        };
    }

    /**
     * Validar hash rate
     */
    validateHashRate(hashRate) {
        const errors = [];
        
        if (hashRate === null || hashRate === undefined) {
            errors.push('Hash rate es requerido');
            return { valid: false, errors };
        }
        
        const numHashRate = parseFloat(hashRate);
        
        if (isNaN(numHashRate)) {
            errors.push('Hash rate debe ser un número válido');
            return { valid: false, errors };
        }
        
        if (numHashRate < this.limits.hashRate.min) {
            errors.push(`Hash rate debe ser al menos ${this.limits.hashRate.min}`);
        }
        
        if (numHashRate > this.limits.hashRate.max) {
            errors.push(`Hash rate no puede exceder ${this.limits.hashRate.max}`);
        }
        
        return {
            valid: errors.length === 0,
            errors,
            sanitized: Math.round(numHashRate)
        };
    }

    /**
     * Validar eficiencia
     */
    validateEfficiency(efficiency) {
        const errors = [];
        
        if (efficiency === null || efficiency === undefined) {
            errors.push('Eficiencia es requerida');
            return { valid: false, errors };
        }
        
        const numEfficiency = parseFloat(efficiency);
        
        if (isNaN(numEfficiency)) {
            errors.push('Eficiencia debe ser un número válido');
            return { valid: false, errors };
        }
        
        if (numEfficiency < this.limits.efficiency.min) {
            errors.push(`Eficiencia debe ser al menos ${this.limits.efficiency.min}%`);
        }
        
        if (numEfficiency > this.limits.efficiency.max) {
            errors.push(`Eficiencia no puede exceder ${this.limits.efficiency.max}%`);
        }
        
        return {
            valid: errors.length === 0,
            errors,
            sanitized: Math.round(numEfficiency * 100) / 100 // 2 decimales
        };
    }

    /**
     * Validar sesión de minería
     */
    validateMiningSession(sessionData) {
        const errors = [];
        const validatedData = {};
        
        // Validar sessionId
        if (sessionData.sessionId) {
            const sessionIdValidation = this.validateSessionId(sessionData.sessionId);
            if (!sessionIdValidation.valid) {
                errors.push(...sessionIdValidation.errors);
            } else {
                validatedData.sessionId = sessionIdValidation.sanitized;
            }
        }
        
        // Validar startTime
        if (sessionData.startTime) {
            const startTimeValidation = this.validateTimestamp(sessionData.startTime);
            if (!startTimeValidation.valid) {
                errors.push(...startTimeValidation.errors);
            } else {
                validatedData.startTime = startTimeValidation.sanitized;
            }
        }
        
        // Validar endTime
        if (sessionData.endTime) {
            const endTimeValidation = this.validateTimestamp(sessionData.endTime);
            if (!endTimeValidation.valid) {
                errors.push(...endTimeValidation.errors);
            } else {
                validatedData.endTime = endTimeValidation.sanitized;
            }
        }
        
        // Validar duración si hay startTime y endTime
        if (validatedData.startTime && validatedData.endTime) {
            const duration = validatedData.endTime - validatedData.startTime;
            if (duration < this.limits.sessionDuration.min) {
                errors.push(`Duración de sesión debe ser al menos ${this.limits.sessionDuration.min}ms`);
            }
            if (duration > this.limits.sessionDuration.max) {
                errors.push(`Duración de sesión no puede exceder ${this.limits.sessionDuration.max}ms`);
            }
        }
        
        return {
            valid: errors.length === 0,
            errors,
            sanitized: validatedData
        };
    }

    /**
     * Validar ID de sesión
     */
    validateSessionId(sessionId) {
        const errors = [];
        
        if (!sessionId) {
            errors.push('ID de sesión es requerido');
            return { valid: false, errors };
        }
        
        if (typeof sessionId !== 'string') {
            errors.push('ID de sesión debe ser una cadena de texto');
            return { valid: false, errors };
        }
        
        if (!this.rules.sessionId.test(sessionId)) {
            errors.push('ID de sesión tiene un formato inválido');
        }
        
        return {
            valid: errors.length === 0,
            errors,
            sanitized: sessionId
        };
    }

    /**
     * Validar timestamp
     */
    validateTimestamp(timestamp) {
        const errors = [];
        
        if (timestamp === null || timestamp === undefined) {
            errors.push('Timestamp es requerido');
            return { valid: false, errors };
        }
        
        const numTimestamp = parseInt(timestamp);
        
        if (isNaN(numTimestamp)) {
            errors.push('Timestamp debe ser un número válido');
            return { valid: false, errors };
        }
        
        const date = new Date(numTimestamp);
        if (isNaN(date.getTime())) {
            errors.push('Timestamp debe ser una fecha válida');
        }
        
        // Verificar que no sea en el futuro (con margen de 1 hora)
        const now = Date.now();
        const oneHour = 60 * 60 * 1000;
        if (numTimestamp > now + oneHour) {
            errors.push('Timestamp no puede ser en el futuro');
        }
        
        // Verificar que no sea muy antiguo (más de 1 año)
        const oneYear = 365 * 24 * 60 * 60 * 1000;
        if (numTimestamp < now - oneYear) {
            errors.push('Timestamp no puede ser muy antiguo');
        }
        
        return {
            valid: errors.length === 0,
            errors,
            sanitized: numTimestamp
        };
    }

    /**
     * Validar datos de usuario completo
     */
    validateUserData(userData) {
        const errors = [];
        const validatedData = {};
        
        // Validar email
        if (userData.email) {
            const emailValidation = this.validateEmail(userData.email);
            if (!emailValidation.valid) {
                errors.push(...emailValidation.errors);
            } else {
                validatedData.email = emailValidation.sanitized;
            }
        }
        
        // Validar username
        if (userData.username) {
            const usernameValidation = this.validateUsername(userData.username);
            if (!usernameValidation.valid) {
                errors.push(...usernameValidation.errors);
            } else {
                validatedData.username = usernameValidation.sanitized;
            }
        }
        
        // Validar password
        if (userData.password) {
            const passwordValidation = this.validatePassword(userData.password);
            if (!passwordValidation.valid) {
                errors.push(...passwordValidation.errors);
            } else {
                validatedData.password = passwordValidation.sanitized;
            }
        }
        
        // Validar referralCode
        if (userData.referralCode) {
            const referralValidation = this.validateReferralCode(userData.referralCode);
            if (!referralValidation.valid) {
                errors.push(...referralValidation.errors);
            } else {
                validatedData.referralCode = referralValidation.sanitized;
            }
        }
        
        return {
            valid: errors.length === 0,
            errors,
            sanitized: validatedData
        };
    }

    /**
     * Validar datos de minería
     */
    validateMiningData(miningData) {
        const errors = [];
        const validatedData = {};
        
        // Validar tokens minados
        if (miningData.tokensMined !== undefined) {
            const tokensValidation = this.validateTokensMined(miningData.tokensMined);
            if (!tokensValidation.valid) {
                errors.push(...tokensValidation.errors);
            } else {
                validatedData.tokensMined = tokensValidation.sanitized;
            }
        }
        
        // Validar hash rate
        if (miningData.hashRate !== undefined) {
            const hashRateValidation = this.validateHashRate(miningData.hashRate);
            if (!hashRateValidation.valid) {
                errors.push(...hashRateValidation.errors);
            } else {
                validatedData.hashRate = hashRateValidation.sanitized;
            }
        }
        
        // Validar eficiencia
        if (miningData.efficiency !== undefined) {
            const efficiencyValidation = this.validateEfficiency(miningData.efficiency);
            if (!efficiencyValidation.valid) {
                errors.push(...efficiencyValidation.errors);
            } else {
                validatedData.efficiency = efficiencyValidation.sanitized;
            }
        }
        
        return {
            valid: errors.length === 0,
            errors,
            sanitized: validatedData
        };
    }

    /**
     * Sanitizar string
     */
    sanitizeString(str) {
        if (typeof str !== 'string') return str;
        
        return str
            .trim()
            .replace(/[<>]/g, '') // Remover < y >
            .replace(/javascript:/gi, '') // Remover javascript:
            .replace(/on\w+=/gi, '') // Remover event handlers
            .substring(0, 1000); // Limitar longitud
    }

    /**
     * Sanitizar número
     */
    sanitizeNumber(num, decimals = 8) {
        const parsed = parseFloat(num);
        if (isNaN(parsed)) return 0;
        
        return Math.round(parsed * Math.pow(10, decimals)) / Math.pow(10, decimals);
    }

    /**
     * Validar y sanitizar objeto completo
     */
    validateAndSanitize(data, rules) {
        const errors = [];
        const sanitized = {};
        
        for (const [key, value] of Object.entries(data)) {
            if (rules[key]) {
                const validation = rules[key](value);
                if (!validation.valid) {
                    errors.push(...validation.errors.map(err => `${key}: ${err}`));
                } else {
                    sanitized[key] = validation.sanitized;
                }
            } else {
                // Sanitizar por defecto
                if (typeof value === 'string') {
                    sanitized[key] = this.sanitizeString(value);
                } else if (typeof value === 'number') {
                    sanitized[key] = this.sanitizeNumber(value);
                } else {
                    sanitized[key] = value;
                }
            }
        }
        
        return {
            valid: errors.length === 0,
            errors,
            sanitized
        };
    }
}

// Crear instancia global
const dataValidator = new DataValidator();

// Hacer disponible globalmente
if (typeof window !== 'undefined') {
    window.DataValidator = dataValidator;
}

export default dataValidator;
