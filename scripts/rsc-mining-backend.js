/**
 * RSC MINING BACKEND INTEGRATION
 * 
 * Sistema de integración con el backend para minería RSC
 * - Conexión con API real
 * - Sincronización de datos
 * - Autenticación de usuarios
 * - Persistencia en servidor
 */

class RSCMiningBackend {
    constructor() {
        this.baseURL = '/api/mining';
        this.isConnected = false;
        this.retryAttempts = 0;
        this.maxRetries = 5;
        this.retryDelay = 5000; // 5 segundos
        
        this.init();
    }

    /**
     * Inicializar conexión con backend
     */
    async init() {
        console.log('🔗 Inicializando conexión con backend...');
        
        try {
            // Verificar conectividad
            await this.checkConnection();
            
            // Configurar listeners
            this.setupEventListeners();
            
            console.log('✅ Backend inicializado correctamente');
            
        } catch (error) {
            console.error('❌ Error inicializando backend:', error);
            this.scheduleRetry();
        }
    }

    /**
     * Verificar conexión con backend
     */
    async checkConnection() {
        try {
            const response = await fetch(`${this.baseURL}/status`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                this.isConnected = true;
                this.retryAttempts = 0;
                console.log('✅ Backend conectado correctamente');
                return true;
            } else {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
        } catch (error) {
            this.isConnected = false;
            console.warn('⚠️ Backend no disponible:', error.message);
            return false;
        }
    }

    /**
     * Programar reintento de conexión
     */
    scheduleRetry() {
        if (this.retryAttempts < this.maxRetries) {
            this.retryAttempts++;
            const delay = this.retryDelay * this.retryAttempts;
            
            console.log(`🔄 Reintentando conexión en ${delay/1000} segundos...`);
            
            setTimeout(() => {
                this.checkConnection();
            }, delay);
        } else {
            console.error('❌ Máximo de reintentos alcanzado');
        }
    }

    /**
     * Configurar event listeners
     */
    setupEventListeners() {
        // Listener para eventos de minería
        if (window.RSCMiningCore) {
            window.RSCMiningCore.on('miningStarted', (data) => {
                this.handleMiningStarted(data);
            });
            
            window.RSCMiningCore.on('miningStopped', (data) => {
                this.handleMiningStopped(data);
            });
            
            window.RSCMiningCore.on('miningUpdate', (data) => {
                this.handleMiningUpdate(data);
            });
            
            window.RSCMiningCore.on('sessionExpired', (data) => {
                this.handleSessionExpired(data);
            });
        }
    }

    /**
     * Manejar inicio de minería
     */
    async handleMiningStarted(data) {
        if (!this.isConnected) return;
        
        try {
            await this.sendEvent('session_started', {
                sessionId: data.sessionId,
                startTime: data.startTime,
                endTime: data.endTime,
                timestamp: Date.now()
            });
            
            console.log('📤 Evento de inicio de minería enviado al backend');
        } catch (error) {
            console.error('❌ Error enviando evento de inicio:', error);
        }
    }

    /**
     * Manejar parada de minería
     */
    async handleMiningStopped(data) {
        if (!this.isConnected) return;
        
        try {
            await this.sendEvent('session_stopped', {
                sessionId: data.sessionId,
                finalStats: data.finalStats,
                timestamp: Date.now()
            });
            
            console.log('📤 Evento de parada de minería enviado al backend');
        } catch (error) {
            console.error('❌ Error enviando evento de parada:', error);
        }
    }

    /**
     * Manejar actualización de minería
     */
    async handleMiningUpdate(data) {
        if (!this.isConnected) return;
        
        try {
            // Solo enviar actualizaciones cada 30 segundos para evitar spam
            if (Date.now() % 30000 < 1000) {
                await this.sendEvent('mining_update', {
                    sessionId: data.sessionId,
                    stats: data.stats,
                    timestamp: Date.now()
                });
            }
        } catch (error) {
            console.error('❌ Error enviando actualización:', error);
        }
    }

    /**
     * Manejar sesión expirada
     */
    async handleSessionExpired(data) {
        if (!this.isConnected) return;
        
        try {
            await this.sendEvent('session_expired', {
                sessionId: data.sessionId,
                finalStats: data.finalStats,
                timestamp: Date.now()
            });
            
            console.log('📤 Evento de sesión expirada enviado al backend');
        } catch (error) {
            console.error('❌ Error enviando evento de expiración:', error);
        }
    }

    /**
     * Enviar evento al backend
     */
    async sendEvent(eventType, data) {
        if (!this.isConnected) {
            console.warn('⚠️ Backend no conectado, no se puede enviar evento');
            return false;
        }
        
        try {
            const response = await fetch(`${this.baseURL}/event`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    event: eventType,
                    data: data,
                    timestamp: Date.now()
                })
            });
            
            if (response.ok) {
                return true;
            } else {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
        } catch (error) {
            console.error('❌ Error enviando evento al backend:', error);
            this.isConnected = false;
            this.scheduleRetry();
            return false;
        }
    }

    /**
     * Obtener estadísticas del usuario
     */
    async getUserStats() {
        if (!this.isConnected) {
            console.warn('⚠️ Backend no conectado, usando datos locales');
            return this.getLocalStats();
        }
        
        try {
            const response = await fetch(`${this.baseURL}/user/stats`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                return data;
            } else {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
        } catch (error) {
            console.error('❌ Error obteniendo estadísticas del usuario:', error);
            return this.getLocalStats();
        }
    }

    /**
     * Obtener estadísticas locales
     */
    getLocalStats() {
        try {
            const statsData = localStorage.getItem('rsc_mining_stats');
            if (statsData) {
                return JSON.parse(statsData);
            }
        } catch (error) {
            console.error('❌ Error obteniendo estadísticas locales:', error);
        }
        
        return {
            totalMined: 0,
            totalSessions: 0,
            lastSession: null,
            lastUpdate: Date.now()
        };
    }

    /**
     * Sincronizar datos con backend
     */
    async syncData() {
        if (!this.isConnected) {
            console.warn('⚠️ Backend no conectado, no se puede sincronizar');
            return false;
        }
        
        try {
            // Obtener datos locales
            const localData = this.getLocalStats();
            
            // Enviar al backend
            const response = await fetch(`${this.baseURL}/sync`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    localData: localData,
                    timestamp: Date.now()
                })
            });
            
            if (response.ok) {
                const serverData = await response.json();
                console.log('✅ Datos sincronizados con backend');
                return serverData;
            } else {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
        } catch (error) {
            console.error('❌ Error sincronizando datos:', error);
            return false;
        }
    }

    /**
     * Obtener configuración del servidor
     */
    async getServerConfig() {
        if (!this.isConnected) {
            console.warn('⚠️ Backend no conectado, usando configuración local');
            return this.getLocalConfig();
        }
        
        try {
            const response = await fetch(`${this.baseURL}/config`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                const config = await response.json();
                console.log('✅ Configuración obtenida del servidor');
                return config;
            } else {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
        } catch (error) {
            console.error('❌ Error obteniendo configuración del servidor:', error);
            return this.getLocalConfig();
        }
    }

    /**
     * Obtener configuración local
     */
    getLocalConfig() {
        try {
            const configData = localStorage.getItem('rsc_mining_config');
            if (configData) {
                return JSON.parse(configData);
            }
        } catch (error) {
            console.error('❌ Error obteniendo configuración local:', error);
        }
        
        return {
            baseHashRate: 1000,
            tokensPerSecond: 0.001,
            maxEfficiency: 150,
            minEfficiency: 50,
            difficultyAdjustment: 1.0
        };
    }

    /**
     * Actualizar configuración en servidor
     */
    async updateServerConfig(config) {
        if (!this.isConnected) {
            console.warn('⚠️ Backend no conectado, guardando configuración local');
            this.updateLocalConfig(config);
            return false;
        }
        
        try {
            const response = await fetch(`${this.baseURL}/config`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    config: config,
                    timestamp: Date.now()
                })
            });
            
            if (response.ok) {
                console.log('✅ Configuración actualizada en servidor');
                return true;
            } else {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
        } catch (error) {
            console.error('❌ Error actualizando configuración en servidor:', error);
            this.updateLocalConfig(config);
            return false;
        }
    }

    /**
     * Actualizar configuración local
     */
    updateLocalConfig(config) {
        try {
            localStorage.setItem('rsc_mining_config', JSON.stringify(config));
            console.log('✅ Configuración guardada localmente');
        } catch (error) {
            console.error('❌ Error guardando configuración local:', error);
        }
    }

    /**
     * Obtener historial de minería
     */
    async getMiningHistory(limit = 50) {
        if (!this.isConnected) {
            console.warn('⚠️ Backend no conectado, usando historial local');
            return this.getLocalHistory(limit);
        }
        
        try {
            const response = await fetch(`${this.baseURL}/history?limit=${limit}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                const history = await response.json();
                return history;
            } else {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
        } catch (error) {
            console.error('❌ Error obteniendo historial de minería:', error);
            return this.getLocalHistory(limit);
        }
    }

    /**
     * Obtener historial local
     */
    getLocalHistory(limit) {
        try {
            const historyData = localStorage.getItem('rsc_mining_history');
            if (historyData) {
                const history = JSON.parse(historyData);
                return history.slice(0, limit);
            }
        } catch (error) {
            console.error('❌ Error obteniendo historial local:', error);
        }
        
        return [];
    }

    /**
     * Guardar historial local
     */
    saveLocalHistory(sessionData) {
        try {
            const historyData = localStorage.getItem('rsc_mining_history');
            let history = historyData ? JSON.parse(historyData) : [];
            
            history.unshift(sessionData);
            
            // Mantener solo los últimos 100 registros
            if (history.length > 100) {
                history = history.slice(0, 100);
            }
            
            localStorage.setItem('rsc_mining_history', JSON.stringify(history));
        } catch (error) {
            console.error('❌ Error guardando historial local:', error);
        }
    }

    /**
     * Verificar estado de conexión
     */
    getConnectionStatus() {
        return {
            isConnected: this.isConnected,
            retryAttempts: this.retryAttempts,
            maxRetries: this.maxRetries
        };
    }

    /**
     * Forzar reconexión
     */
    async forceReconnect() {
        console.log('🔄 Forzando reconexión...');
        this.retryAttempts = 0;
        await this.checkConnection();
    }

    /**
     * Destruir instancia
     */
    destroy() {
        console.log('✅ RSC Mining Backend destruido');
    }
}

// Crear instancia global
window.RSCMiningBackend = new RSCMiningBackend();

// Exportar para uso en módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RSCMiningBackend;
}
