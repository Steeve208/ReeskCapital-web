/**
 * RSC MINING CORE SYSTEM
 * 
 * Sistema de minería robusto y funcional para RSC Chain
 * - Minería de 24 horas continuas
 * - Persistencia automática
 * - Conexión con backend real
 * - Interfaz en tiempo real
 */

class RSCMiningCore {
    constructor() {
        // Estado de minería
        this.isMining = false;
        this.sessionId = null;
        this.startTime = null;
        this.endTime = null;
        this.sessionDuration = 24 * 60 * 60 * 1000; // 24 horas en ms
        
        // Estadísticas de minería
        this.stats = {
            totalMined: 0,
            sessionMined: 0,
            hashRate: 0,
            activeTime: 0,
            efficiency: 100,
            level: 1
        };
        
        // Configuración de minería
        this.config = {
            baseHashRate: 1000, // H/s base
            tokensPerSecond: 0.001, // RSC por segundo
            maxEfficiency: 150, // Máxima eficiencia %
            minEfficiency: 50, // Mínima eficiencia %
            difficultyAdjustment: 1.0 // Ajuste de dificultad
        };
        
        // Timers e intervalos
        this.miningInterval = null;
        this.statsInterval = null;
        this.saveInterval = null;
        
        // Backend connection
        this.backend = null;
        this.isBackendConnected = false;
        
        // Storage keys
        this.storageKeys = {
            session: 'rsc_mining_session',
            stats: 'rsc_mining_stats',
            config: 'rsc_mining_config'
        };
        
        // Event listeners
        this.eventListeners = new Map();
        
        this.init();
    }

    /**
     * Inicializar el sistema de minería
     */
    async init() {
        console.log('🚀 Inicializando RSC Mining Core...');
        
        try {
            // Cargar configuración guardada
            await this.loadSavedData();
            
            // Inicializar backend
            await this.initBackend();
            
            // Configurar event listeners
            this.setupEventListeners();
            
            // Verificar sesión existente
            await this.checkExistingSession();
            
            console.log('✅ RSC Mining Core inicializado correctamente');
            
            // Emitir evento de inicialización
            this.emit('coreInitialized', {
                isMining: this.isMining,
                stats: this.stats,
                sessionId: this.sessionId
            });
            
        } catch (error) {
            console.error('❌ Error inicializando RSC Mining Core:', error);
            this.emit('coreError', { error: error.message });
        }
    }

    /**
     * Inicializar conexión con backend
     */
    async initBackend() {
        try {
            // Verificar si el backend está disponible
            const response = await fetch('/api/mining/status', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                this.isBackendConnected = true;
                console.log('✅ Backend conectado correctamente');
            } else {
                console.warn('⚠️ Backend no disponible, usando modo offline');
                this.isBackendConnected = false;
            }
        } catch (error) {
            console.warn('⚠️ Error conectando con backend:', error);
            this.isBackendConnected = false;
        }
    }

    /**
     * Iniciar minería
     */
    async startMining() {
        if (this.isMining) {
            console.warn('⚠️ La minería ya está activa');
            return { success: false, message: 'Mining already active' };
        }

        console.log('🚀 Iniciando minería...');

        try {
            // Crear nueva sesión
            this.sessionId = this.generateSessionId();
            this.startTime = Date.now();
            this.endTime = this.startTime + this.sessionDuration;
            this.isMining = true;
            
            // Resetear estadísticas de sesión
            this.stats.sessionMined = 0;
            this.stats.activeTime = 0;
            this.stats.efficiency = 100;
            
            // Iniciar intervalos
            this.startMiningInterval();
            this.startStatsInterval();
            this.startSaveInterval();
            
            // Guardar sesión
            await this.saveSession();
            
            // Notificar al backend
            if (this.isBackendConnected) {
                await this.notifyBackend('session_started', {
                    sessionId: this.sessionId,
                    startTime: this.startTime,
                    endTime: this.endTime
                });
            }
            
            console.log('✅ Minería iniciada correctamente');
            
            // Emitir evento
            this.emit('miningStarted', {
                sessionId: this.sessionId,
                startTime: this.startTime,
                endTime: this.endTime
            });
            
            return { success: true, message: 'Mining started successfully' };
            
        } catch (error) {
            console.error('❌ Error iniciando minería:', error);
            this.isMining = false;
            this.emit('miningError', { error: error.message });
            return { success: false, message: error.message };
        }
    }

    /**
     * Detener minería
     */
    async stopMining() {
        if (!this.isMining) {
            console.warn('⚠️ No hay minería activa');
            return { success: false, message: 'No active mining session' };
        }

        console.log('⏹️ Deteniendo minería...');

        try {
            // Detener intervalos
            this.stopMiningInterval();
            this.stopStatsInterval();
            this.stopSaveInterval();
            
            // Calcular estadísticas finales
            const finalStats = this.calculateFinalStats();
            
            // Notificar al backend
            if (this.isBackendConnected) {
                await this.notifyBackend('session_stopped', {
                    sessionId: this.sessionId,
                    finalStats: finalStats
                });
            }
            
            // Guardar datos finales
            await this.saveFinalData();
            
            // Limpiar sesión
            this.clearSession();
            
            console.log('✅ Minería detenida correctamente');
            
            // Emitir evento
            this.emit('miningStopped', {
                sessionId: this.sessionId,
                finalStats: finalStats
            });
            
            return { success: true, message: 'Mining stopped successfully' };
            
        } catch (error) {
            console.error('❌ Error deteniendo minería:', error);
            this.emit('miningError', { error: error.message });
            return { success: false, message: error.message };
        }
    }

    /**
     * Iniciar intervalo de minería
     */
    startMiningInterval() {
        this.miningInterval = setInterval(() => {
            if (this.isMining) {
                this.performMining();
            }
        }, 1000); // Cada segundo
    }

    /**
     * Detener intervalo de minería
     */
    stopMiningInterval() {
        if (this.miningInterval) {
            clearInterval(this.miningInterval);
            this.miningInterval = null;
        }
    }

    /**
     * Iniciar intervalo de estadísticas
     */
    startStatsInterval() {
        this.statsInterval = setInterval(() => {
            if (this.isMining) {
                this.updateStats();
            }
        }, 1000); // Cada segundo
    }

    /**
     * Detener intervalo de estadísticas
     */
    stopStatsInterval() {
        if (this.statsInterval) {
            clearInterval(this.statsInterval);
            this.statsInterval = null;
        }
    }

    /**
     * Iniciar intervalo de guardado
     */
    startSaveInterval() {
        this.saveInterval = setInterval(() => {
            if (this.isMining) {
                this.saveSession();
            }
        }, 30000); // Cada 30 segundos
    }

    /**
     * Detener intervalo de guardado
     */
    stopSaveInterval() {
        if (this.saveInterval) {
            clearInterval(this.saveInterval);
            this.saveInterval = null;
        }
    }

    /**
     * Realizar operación de minería
     */
    performMining() {
        if (!this.isMining || !this.startTime) return;

        // Verificar si la sesión ha expirado
        if (Date.now() >= this.endTime) {
            this.handleSessionExpired();
            return;
        }

        // Calcular tokens minados
        const tokensMined = this.calculateTokensMined();
        
        // Actualizar estadísticas
        this.stats.sessionMined += tokensMined;
        this.stats.totalMined += tokensMined;
        this.stats.activeTime = Date.now() - this.startTime;
        
        // Calcular hash rate
        this.stats.hashRate = this.calculateHashRate();
        
        // Calcular eficiencia
        this.stats.efficiency = this.calculateEfficiency();
        
        // Calcular nivel
        this.stats.level = this.calculateLevel();
        
        // 🔥 IMPORTANTE: Sincronizar balance con tokens minados
        this.syncWalletBalance();
        
        // Emitir evento de actualización
        this.emit('miningUpdate', {
            stats: { ...this.stats },
            tokensMined: tokensMined,
            sessionId: this.sessionId
        });
    }

    /**
     * Calcular tokens minados
     */
    calculateTokensMined() {
        const baseRate = this.config.tokensPerSecond;
        const efficiencyMultiplier = this.stats.efficiency / 100;
        const difficultyMultiplier = 1 / this.config.difficultyAdjustment;
        
        return baseRate * efficiencyMultiplier * difficultyMultiplier;
    }

    /**
     * Calcular hash rate
     */
    calculateHashRate() {
        const baseHashRate = this.config.baseHashRate;
        const efficiencyMultiplier = this.stats.efficiency / 100;
        const levelMultiplier = Math.sqrt(this.stats.level);
        
        return Math.floor(baseHashRate * efficiencyMultiplier * levelMultiplier);
    }

    /**
     * Calcular eficiencia
     */
    calculateEfficiency() {
        const maxEfficiency = this.config.maxEfficiency;
        const minEfficiency = this.config.minEfficiency;
        const timeFactor = Math.min(this.stats.activeTime / (60 * 60 * 1000), 1); // 1 hora = 100%
        
        return Math.max(minEfficiency, maxEfficiency * timeFactor);
    }

    /**
     * Calcular nivel
     */
    calculateLevel() {
        return Math.floor(this.stats.totalMined / 10) + 1; // 1 nivel cada 10 RSC
    }

    /**
     * Sincronizar balance de wallet con tokens minados
     */
    syncWalletBalance() {
        try {
            // El balance debe ser igual a los tokens minados en esta sesión
            const newBalance = this.stats.sessionMined;
            
            // Guardar balance sincronizado
            localStorage.setItem('rsc_wallet_balance', newBalance.toString());
            
            // Emitir evento de actualización de wallet (sin notificación)
            this.emit('walletBalanceUpdated', {
                balance: newBalance,
                sessionMined: this.stats.sessionMined
            });
            
        } catch (error) {
            console.error('❌ Error sincronizando balance de wallet:', error);
        }
    }

    /**
     * Actualizar estadísticas
     */
    updateStats() {
        if (!this.isMining || !this.startTime) return;

        this.stats.activeTime = Date.now() - this.startTime;
        this.stats.hashRate = this.calculateHashRate();
        this.stats.efficiency = this.calculateEfficiency();
        this.stats.level = this.calculateLevel();
        
        // Emitir evento de actualización de estadísticas
        this.emit('statsUpdate', {
            stats: { ...this.stats },
            sessionId: this.sessionId
        });
    }

    /**
     * Manejar sesión expirada
     */
    handleSessionExpired() {
        console.log('⏰ Sesión de minería expirada');
        
        // Detener minería
        this.stopMining();
        
        // Emitir evento de sesión expirada
        this.emit('sessionExpired', {
            sessionId: this.sessionId,
            finalStats: this.calculateFinalStats()
        });
    }

    /**
     * Calcular estadísticas finales
     */
    calculateFinalStats() {
        return {
            sessionId: this.sessionId,
            startTime: this.startTime,
            endTime: this.endTime,
            duration: this.endTime - this.startTime,
            totalMined: this.stats.totalMined,
            sessionMined: this.stats.sessionMined,
            finalHashRate: this.stats.hashRate,
            finalEfficiency: this.stats.efficiency,
            finalLevel: this.stats.level
        };
    }

    /**
     * Verificar sesión existente
     */
    async checkExistingSession() {
        try {
            const sessionData = localStorage.getItem(this.storageKeys.session);
            if (!sessionData) return;

            const session = JSON.parse(sessionData);
            const now = Date.now();

            // Verificar si la sesión aún es válida
            if (session.endTime && now < session.endTime) {
                // Restaurar sesión
                this.sessionId = session.sessionId;
                this.startTime = session.startTime;
                this.endTime = session.endTime;
                this.isMining = true;
                this.stats = { ...this.stats, ...session.stats };

                // Reanudar intervalos
                this.startMiningInterval();
                this.startStatsInterval();
                this.startSaveInterval();

                console.log('🔄 Sesión de minería restaurada');
                
                // Emitir evento de restauración
                this.emit('sessionRestored', {
                    sessionId: this.sessionId,
                    stats: this.stats
                });
            } else {
                // Sesión expirada, limpiar
                this.clearSession();
                console.log('⏰ Sesión expirada, limpiando datos');
            }
        } catch (error) {
            console.error('❌ Error verificando sesión existente:', error);
            this.clearSession();
        }
    }

    /**
     * Guardar sesión
     */
    async saveSession() {
        try {
            const sessionData = {
                sessionId: this.sessionId,
                startTime: this.startTime,
                endTime: this.endTime,
                isMining: this.isMining,
                stats: this.stats,
                lastUpdate: Date.now()
            };

            localStorage.setItem(this.storageKeys.session, JSON.stringify(sessionData));
        } catch (error) {
            console.error('❌ Error guardando sesión:', error);
        }
    }

    /**
     * Guardar datos finales
     */
    async saveFinalData() {
        try {
            // Guardar estadísticas
            const statsData = {
                totalMined: this.stats.totalMined,
                totalSessions: this.getTotalSessions() + 1,
                lastSession: this.sessionId,
                lastUpdate: Date.now()
            };

            localStorage.setItem(this.storageKeys.stats, JSON.stringify(statsData));

            // Notificar al backend
            if (this.isBackendConnected) {
                await this.notifyBackend('mining_completed', {
                    sessionId: this.sessionId,
                    finalStats: this.calculateFinalStats()
                });
            }
        } catch (error) {
            console.error('❌ Error guardando datos finales:', error);
        }
    }

    /**
     * Limpiar sesión
     */
    clearSession() {
        this.isMining = false;
        this.sessionId = null;
        this.startTime = null;
        this.endTime = null;
        this.stats.sessionMined = 0;
        this.stats.activeTime = 0;
        
        // Detener intervalos
        this.stopMiningInterval();
        this.stopStatsInterval();
        this.stopSaveInterval();
        
        // Limpiar storage
        localStorage.removeItem(this.storageKeys.session);
    }

    /**
     * Cargar datos guardados
     */
    async loadSavedData() {
        try {
            // Cargar estadísticas
            const statsData = localStorage.getItem(this.storageKeys.stats);
            if (statsData) {
                const stats = JSON.parse(statsData);
                this.stats.totalMined = stats.totalMined || 0;
            }

            // Cargar configuración
            const configData = localStorage.getItem(this.storageKeys.config);
            if (configData) {
                const config = JSON.parse(configData);
                this.config = { ...this.config, ...config };
            }
        } catch (error) {
            console.error('❌ Error cargando datos guardados:', error);
        }
    }

    /**
     * Notificar al backend
     */
    async notifyBackend(event, data) {
        if (!this.isBackendConnected) return;

        try {
            await fetch('/api/mining/event', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    event: event,
                    data: data,
                    timestamp: Date.now()
                })
            });
        } catch (error) {
            console.error('❌ Error notificando al backend:', error);
        }
    }

    /**
     * Configurar event listeners
     */
    setupEventListeners() {
        // Listener para visibilidad de página
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden && this.isMining) {
                this.updateStats();
            }
        });

        // Listener para antes de cerrar página
        window.addEventListener('beforeunload', () => {
            if (this.isMining) {
                this.saveSession();
            }
        });
    }

    /**
     * Obtener total de sesiones
     */
    getTotalSessions() {
        try {
            const statsData = localStorage.getItem(this.storageKeys.stats);
            if (statsData) {
                const stats = JSON.parse(statsData);
                return stats.totalSessions || 0;
            }
        } catch (error) {
            console.error('❌ Error obteniendo total de sesiones:', error);
        }
        return 0;
    }

    /**
     * Generar ID de sesión
     */
    generateSessionId() {
        return 'mining_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2);
    }

    /**
     * Emitir evento
     */
    emit(event, data) {
        const listeners = this.eventListeners.get(event) || [];
        listeners.forEach(listener => {
            try {
                listener(data);
            } catch (error) {
                console.error(`❌ Error en listener de evento ${event}:`, error);
            }
        });
    }

    /**
     * Agregar event listener
     */
    on(event, listener) {
        if (!this.eventListeners.has(event)) {
            this.eventListeners.set(event, []);
        }
        this.eventListeners.get(event).push(listener);
    }

    /**
     * Remover event listener
     */
    off(event, listener) {
        const listeners = this.eventListeners.get(event) || [];
        const index = listeners.indexOf(listener);
        if (index > -1) {
            listeners.splice(index, 1);
        }
    }

    /**
     * Obtener estado actual
     */
    getStatus() {
        return {
            isMining: this.isMining,
            sessionId: this.sessionId,
            startTime: this.startTime,
            endTime: this.endTime,
            stats: { ...this.stats },
            isBackendConnected: this.isBackendConnected
        };
    }

    /**
     * Obtener estadísticas
     */
    getStats() {
        return { ...this.stats };
    }

    /**
     * Obtener configuración
     */
    getConfig() {
        return { ...this.config };
    }

    /**
     * Actualizar configuración
     */
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        localStorage.setItem(this.storageKeys.config, JSON.stringify(this.config));
    }

    /**
     * Destruir instancia
     */
    destroy() {
        this.clearSession();
        this.eventListeners.clear();
        console.log('✅ RSC Mining Core destruido');
    }
}

// Crear instancia global
window.RSCMiningCore = new RSCMiningCore();

// Exportar para uso en módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RSCMiningCore;
}
