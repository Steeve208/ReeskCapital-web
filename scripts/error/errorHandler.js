/**
 * SISTEMA DE MANEJO DE ERRORES ROBUSTO
 * 
 * Manejo centralizado y robusto de errores
 * - Clasificación de errores
 * - Logging estructurado
 * - Recuperación automática
 * - Notificaciones de usuario
 */

import rscStore from '../store/rscStore.js';

class ErrorHandler {
    constructor() {
        this.errorTypes = {
            NETWORK: 'NETWORK_ERROR',
            AUTH: 'AUTH_ERROR',
            VALIDATION: 'VALIDATION_ERROR',
            MINING: 'MINING_ERROR',
            DATABASE: 'DATABASE_ERROR',
            UNKNOWN: 'UNKNOWN_ERROR'
        };
        
        this.severityLevels = {
            LOW: 'low',
            MEDIUM: 'medium',
            HIGH: 'high',
            CRITICAL: 'critical'
        };
        
        this.retryConfig = {
            maxRetries: 3,
            baseDelay: 1000,
            maxDelay: 10000,
            backoffMultiplier: 2
        };
        
        this.errorLog = [];
        this.maxLogSize = 100;
        
        this.init();
    }

    /**
     * Inicializar manejador de errores
     */
    init() {
        // Configurar manejo global de errores
        window.addEventListener('error', (event) => {
            this.handleGlobalError(event.error, 'GLOBAL_ERROR');
        });
        
        window.addEventListener('unhandledrejection', (event) => {
            this.handleGlobalError(event.reason, 'UNHANDLED_PROMISE_REJECTION');
        });
        
        console.log('🛡️ Sistema de manejo de errores inicializado');
    }

    /**
     * Manejar error global
     */
    handleGlobalError(error, source) {
        const errorInfo = this.classifyError(error, source);
        this.logError(errorInfo);
        this.notifyUser(errorInfo);
    }

    /**
     * Clasificar error
     */
    classifyError(error, source = 'UNKNOWN') {
        const errorInfo = {
            id: this.generateErrorId(),
            timestamp: new Date().toISOString(),
            source: source,
            message: error?.message || 'Error desconocido',
            stack: error?.stack || '',
            type: this.errorTypes.UNKNOWN,
            severity: this.severityLevels.MEDIUM,
            retryable: false,
            context: {}
        };

        // Clasificar por tipo de error
        if (error?.message) {
            const message = error.message.toLowerCase();
            
            if (message.includes('network') || message.includes('fetch') || message.includes('connection')) {
                errorInfo.type = this.errorTypes.NETWORK;
                errorInfo.severity = this.severityLevels.MEDIUM;
                errorInfo.retryable = true;
            } else if (message.includes('auth') || message.includes('login') || message.includes('permission')) {
                errorInfo.type = this.errorTypes.AUTH;
                errorInfo.severity = this.severityLevels.HIGH;
                errorInfo.retryable = false;
            } else if (message.includes('validation') || message.includes('invalid') || message.includes('required')) {
                errorInfo.type = this.errorTypes.VALIDATION;
                errorInfo.severity = this.severityLevels.LOW;
                errorInfo.retryable = false;
            } else if (message.includes('mining') || message.includes('session') || message.includes('balance')) {
                errorInfo.type = this.errorTypes.MINING;
                errorInfo.severity = this.severityLevels.MEDIUM;
                errorInfo.retryable = true;
            } else if (message.includes('database') || message.includes('supabase') || message.includes('sql')) {
                errorInfo.type = this.errorTypes.DATABASE;
                errorInfo.severity = this.severityLevels.HIGH;
                errorInfo.retryable = true;
            }
        }

        // Clasificar por código de error HTTP
        if (error?.status || error?.code) {
            const status = error.status || error.code;
            
            if (status >= 500) {
                errorInfo.severity = this.severityLevels.HIGH;
                errorInfo.retryable = true;
            } else if (status === 401 || status === 403) {
                errorInfo.type = this.errorTypes.AUTH;
                errorInfo.severity = this.severityLevels.HIGH;
                errorInfo.retryable = false;
            } else if (status === 400) {
                errorInfo.type = this.errorTypes.VALIDATION;
                errorInfo.severity = this.severityLevels.LOW;
                errorInfo.retryable = false;
            }
        }

        return errorInfo;
    }

    /**
     * Manejar error con contexto
     */
    handleError(error, context = {}) {
        const errorInfo = this.classifyError(error, context.source || 'APPLICATION');
        errorInfo.context = { ...errorInfo.context, ...context };
        
        this.logError(errorInfo);
        this.notifyUser(errorInfo);
        
        // Intentar recuperación automática si es posible
        if (errorInfo.retryable) {
            this.attemptRecovery(errorInfo);
        }
        
        return errorInfo;
    }

    /**
     * Manejar error de red
     */
    async handleNetworkError(error, operation, retryCount = 0) {
        const errorInfo = this.classifyError(error, 'NETWORK');
        errorInfo.context = {
            operation,
            retryCount,
            url: error?.url || 'unknown'
        };
        
        this.logError(errorInfo);
        
        if (retryCount < this.retryConfig.maxRetries) {
            const delay = Math.min(
                this.retryConfig.baseDelay * Math.pow(this.retryConfig.backoffMultiplier, retryCount),
                this.retryConfig.maxDelay
            );
            
            console.log(`🔄 Reintentando operación ${operation} en ${delay}ms (intento ${retryCount + 1})`);
            
            setTimeout(() => {
                this.attemptRecovery(errorInfo);
            }, delay);
            
            return { shouldRetry: true, delay };
        } else {
            this.notifyUser(errorInfo);
            return { shouldRetry: false };
        }
    }

    /**
     * Manejar error de autenticación
     */
    handleAuthError(error, context = {}) {
        const errorInfo = this.classifyError(error, 'AUTH');
        errorInfo.context = { ...errorInfo.context, ...context };
        
        this.logError(errorInfo);
        
        // Limpiar datos de autenticación
        rscStore.setState({
            user: null,
            isAuthenticated: false,
            authLoading: false
        });
        
        this.notifyUser(errorInfo);
        
        return errorInfo;
    }

    /**
     * Manejar error de validación
     */
    handleValidationError(error, field = 'unknown') {
        const errorInfo = this.classifyError(error, 'VALIDATION');
        errorInfo.context = { field };
        
        this.logError(errorInfo);
        this.notifyUser(errorInfo);
        
        return errorInfo;
    }

    /**
     * Manejar error de minería
     */
    handleMiningError(error, context = {}) {
        const errorInfo = this.classifyError(error, 'MINING');
        errorInfo.context = { ...errorInfo.context, ...context };
        
        this.logError(errorInfo);
        
        // Detener minería si es crítico
        if (errorInfo.severity === this.severityLevels.CRITICAL) {
            if (window.MiningEngine) {
                window.MiningEngine.stopMining();
            }
        }
        
        this.notifyUser(errorInfo);
        
        return errorInfo;
    }

    /**
     * Manejar error de base de datos
     */
    async handleDatabaseError(error, operation, retryCount = 0) {
        const errorInfo = this.classifyError(error, 'DATABASE');
        errorInfo.context = {
            operation,
            retryCount,
            table: error?.table || 'unknown'
        };
        
        this.logError(errorInfo);
        
        if (retryCount < this.retryConfig.maxRetries) {
            const delay = Math.min(
                this.retryConfig.baseDelay * Math.pow(this.retryConfig.backoffMultiplier, retryCount),
                this.retryConfig.maxDelay
            );
            
            console.log(`🔄 Reintentando operación de BD ${operation} en ${delay}ms`);
            
            setTimeout(() => {
                this.attemptRecovery(errorInfo);
            }, delay);
            
            return { shouldRetry: true, delay };
        } else {
            this.notifyUser(errorInfo);
            return { shouldRetry: false };
        }
    }

    /**
     * Intentar recuperación automática
     */
    async attemptRecovery(errorInfo) {
        try {
            console.log(`🔧 Intentando recuperación para error ${errorInfo.id}`);
            
            switch (errorInfo.type) {
                case this.errorTypes.NETWORK:
                    await this.recoverNetworkError(errorInfo);
                    break;
                    
                case this.errorTypes.DATABASE:
                    await this.recoverDatabaseError(errorInfo);
                    break;
                    
                case this.errorTypes.MINING:
                    await this.recoverMiningError(errorInfo);
                    break;
                    
                default:
                    console.log(`⚠️ No hay recuperación disponible para tipo ${errorInfo.type}`);
            }
            
        } catch (recoveryError) {
            console.error('❌ Error en recuperación:', recoveryError);
            this.logError(this.classifyError(recoveryError, 'RECOVERY_ERROR'));
        }
    }

    /**
     * Recuperar error de red
     */
    async recoverNetworkError(errorInfo) {
        // Verificar conectividad
        const isOnline = navigator.onLine;
        if (!isOnline) {
            throw new Error('Sin conexión a internet');
        }
        
        // Verificar conexión con Supabase
        try {
            const { supabase } = await import('../config/supabase.js');
            const { data, error } = await supabase
                .from('users')
                .select('count')
                .limit(1);
            
            if (error) throw error;
            
            console.log('✅ Conexión de red recuperada');
            
        } catch (error) {
            throw new Error('No se pudo recuperar la conexión de red');
        }
    }

    /**
     * Recuperar error de base de datos
     */
    async recoverDatabaseError(errorInfo) {
        // Verificar conexión con Supabase
        try {
            const { supabase } = await import('../config/supabase.js');
            const { data, error } = await supabase
                .from('users')
                .select('count')
                .limit(1);
            
            if (error) throw error;
            
            console.log('✅ Conexión de base de datos recuperada');
            
        } catch (error) {
            throw new Error('No se pudo recuperar la conexión de base de datos');
        }
    }

    /**
     * Recuperar error de minería
     */
    async recoverMiningError(errorInfo) {
        // Reiniciar motor de minería si está disponible
        if (window.MiningEngine) {
            try {
                await window.MiningEngine.init();
                console.log('✅ Motor de minería recuperado');
            } catch (error) {
                throw new Error('No se pudo recuperar el motor de minería');
            }
        }
    }

    /**
     * Notificar usuario
     */
    notifyUser(errorInfo) {
        const message = this.getUserFriendlyMessage(errorInfo);
        
        rscStore.showNotification(
            this.getNotificationType(errorInfo.severity),
            this.getNotificationTitle(errorInfo.type),
            message,
            8000 // 8 segundos para errores
        );
    }

    /**
     * Obtener mensaje amigable para el usuario
     */
    getUserFriendlyMessage(errorInfo) {
        const messages = {
            [this.errorTypes.NETWORK]: 'Problema de conexión. Verificando conectividad...',
            [this.errorTypes.AUTH]: 'Error de autenticación. Por favor, inicia sesión nuevamente.',
            [this.errorTypes.VALIDATION]: 'Datos inválidos. Por favor, verifica la información.',
            [this.errorTypes.MINING]: 'Error en la minería. Reintentando...',
            [this.errorTypes.DATABASE]: 'Error de base de datos. Sincronizando...',
            [this.errorTypes.UNKNOWN]: 'Ha ocurrido un error inesperado. Reintentando...'
        };
        
        return messages[errorInfo.type] || 'Error desconocido';
    }

    /**
     * Obtener tipo de notificación
     */
    getNotificationType(severity) {
        const types = {
            [this.severityLevels.LOW]: 'info',
            [this.severityLevels.MEDIUM]: 'warning',
            [this.severityLevels.HIGH]: 'error',
            [this.severityLevels.CRITICAL]: 'error'
        };
        
        return types[severity] || 'error';
    }

    /**
     * Obtener título de notificación
     */
    getNotificationTitle(errorType) {
        const titles = {
            [this.errorTypes.NETWORK]: 'Error de Red',
            [this.errorTypes.AUTH]: 'Error de Autenticación',
            [this.errorTypes.VALIDATION]: 'Error de Validación',
            [this.errorTypes.MINING]: 'Error de Minería',
            [this.errorTypes.DATABASE]: 'Error de Base de Datos',
            [this.errorTypes.UNKNOWN]: 'Error del Sistema'
        };
        
        return titles[errorType] || 'Error';
    }

    /**
     * Registrar error
     */
    logError(errorInfo) {
        // Agregar al log
        this.errorLog.push(errorInfo);
        
        // Mantener tamaño del log
        if (this.errorLog.length > this.maxLogSize) {
            this.errorLog.shift();
        }
        
        // Log en consola
        console.error(`❌ [${errorInfo.type}] ${errorInfo.message}`, {
            id: errorInfo.id,
            severity: errorInfo.severity,
            context: errorInfo.context,
            stack: errorInfo.stack
        });
        
        // Enviar a servicio de logging si está disponible
        this.sendToLoggingService(errorInfo);
    }

    /**
     * Enviar a servicio de logging
     */
    async sendToLoggingService(errorInfo) {
        try {
            // Aquí podrías enviar a un servicio como Sentry, LogRocket, etc.
            // Por ahora solo lo guardamos en localStorage para debugging
            const errorLog = JSON.parse(localStorage.getItem('rsc_error_log') || '[]');
            errorLog.push(errorInfo);
            
            // Mantener solo los últimos 50 errores
            if (errorLog.length > 50) {
                errorLog.splice(0, errorLog.length - 50);
            }
            
            localStorage.setItem('rsc_error_log', JSON.stringify(errorLog));
            
        } catch (error) {
            console.error('❌ Error enviando a servicio de logging:', error);
        }
    }

    /**
     * Obtener log de errores
     */
    getErrorLog() {
        return [...this.errorLog];
    }

    /**
     * Limpiar log de errores
     */
    clearErrorLog() {
        this.errorLog = [];
        localStorage.removeItem('rsc_error_log');
        console.log('🧹 Log de errores limpiado');
    }

    /**
     * Generar ID de error
     */
    generateErrorId() {
        return 'err_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2);
    }

    /**
     * Wrapper para operaciones async con manejo de errores
     */
    async withErrorHandling(operation, context = {}) {
        try {
            return await operation();
        } catch (error) {
            return this.handleError(error, context);
        }
    }

    /**
     * Wrapper para operaciones de red con reintentos
     */
    async withRetry(operation, context = {}, maxRetries = this.retryConfig.maxRetries) {
        let lastError;
        
        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                return await operation();
            } catch (error) {
                lastError = error;
                
                if (attempt < maxRetries) {
                    const delay = Math.min(
                        this.retryConfig.baseDelay * Math.pow(this.retryConfig.backoffMultiplier, attempt),
                        this.retryConfig.maxDelay
                    );
                    
                    console.log(`🔄 Reintentando operación en ${delay}ms (intento ${attempt + 1}/${maxRetries + 1})`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
            }
        }
        
        throw lastError;
    }

    /**
     * Verificar si un error es recuperable
     */
    isRecoverableError(error) {
        const errorInfo = this.classifyError(error);
        return errorInfo.retryable;
    }

    /**
     * Obtener estadísticas de errores
     */
    getErrorStats() {
        const stats = {
            total: this.errorLog.length,
            byType: {},
            bySeverity: {},
            recent: this.errorLog.slice(-10)
        };
        
        this.errorLog.forEach(error => {
            stats.byType[error.type] = (stats.byType[error.type] || 0) + 1;
            stats.bySeverity[error.severity] = (stats.bySeverity[error.severity] || 0) + 1;
        });
        
        return stats;
    }
}

// Crear instancia global
const errorHandler = new ErrorHandler();

// Hacer disponible globalmente
if (typeof window !== 'undefined') {
    window.ErrorHandler = errorHandler;
}

export default errorHandler;
