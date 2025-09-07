/**
 * RSC MINING BACKEND INTEGRATION
 * 
 * Integración completa del frontend con el backend
 * - Sincronización de datos de minería
 * - Gestión de usuarios
 * - Sistema de referidos
 * - API calls optimizados
 */

class RSCMiningBackendIntegration {
    constructor() {
        this.baseURL = 'http://localhost:3000/api';
        this.userId = null;
        this.sessionId = null;
        this.isConnected = false;
        this.syncInterval = null;
        this.retryCount = 0;
        this.maxRetries = 3;
    }

    /**
     * Inicializar integración con backend
     */
    async initialize() {
        try {
            console.log('🔗 Inicializando integración con backend...');
            
            // Verificar conectividad
            const isOnline = await this.checkConnection();
            if (!isOnline) {
                console.warn('⚠️ Backend no disponible, funcionando en modo offline');
                return false;
            }

            // Obtener usuario actual
            this.userId = await this.getCurrentUserId();
            if (!this.userId) {
                console.warn('⚠️ Usuario no autenticado, funcionando en modo local');
                return false;
            }

            this.isConnected = true;
            console.log('✅ Integración con backend inicializada');
            
            // Iniciar sincronización automática
            this.startAutoSync();
            
            return true;
        } catch (error) {
            console.error('❌ Error inicializando integración:', error);
            return false;
        }
    }

    /**
     * Verificar conexión con backend
     */
    async checkConnection() {
        try {
            const response = await fetch(`${this.baseURL}/health`, {
                method: 'GET',
                timeout: 5000
            });
            
            return response.ok;
        } catch (error) {
            console.error('❌ Error verificando conexión:', error);
            return false;
        }
    }

    /**
     * Obtener ID de usuario actual
     */
    async getCurrentUserId() {
        try {
            // Intentar obtener desde localStorage
            const storedUserId = localStorage.getItem('rsc_user_id');
            if (storedUserId) {
                return storedUserId;
            }

            // Si no existe, crear usuario temporal para testing
            const tempUser = await this.createTempUser();
            return tempUser.id;
        } catch (error) {
            console.error('❌ Error obteniendo usuario:', error);
            return null;
        }
    }

    /**
     * Crear usuario temporal para testing
     */
    async createTempUser() {
        try {
            const tempEmail = `temp_${Date.now()}@rscchain.com`;
            const tempUsername = `user_${Date.now()}`;
            
            const response = await fetch(`${this.baseURL}/users/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: tempEmail,
                    username: tempUsername
                })
            });

            const result = await response.json();
            
            if (result.success) {
                localStorage.setItem('rsc_user_id', result.user.id);
                console.log('✅ Usuario temporal creado:', result.user.username);
                return result.user;
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error('❌ Error creando usuario temporal:', error);
            return null;
        }
    }

    /**
     * Iniciar sesión de minería en backend
     */
    async startMiningSession(sessionData) {
        if (!this.isConnected) {
            console.log('📱 Modo offline: sesión guardada localmente');
            return { success: true, offline: true };
        }

        try {
            const response = await fetch(`${this.baseURL}/mining/start`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-User-ID': this.userId
                },
                body: JSON.stringify(sessionData)
            });

            const result = await response.json();
            
            if (result.success) {
                this.sessionId = sessionData.sessionId;
                console.log('✅ Sesión de minería iniciada en backend');
            }
            
            return result;
        } catch (error) {
            console.error('❌ Error iniciando sesión en backend:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Actualizar sesión de minería en backend
     */
    async updateMiningSession(updateData) {
        if (!this.isConnected || !this.sessionId) {
            return { success: true, offline: true };
        }

        try {
            const response = await fetch(`${this.baseURL}/mining/update`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-User-ID': this.userId
                },
                body: JSON.stringify({
                    sessionId: this.sessionId,
                    ...updateData
                })
            });

            const result = await response.json();
            return result;
        } catch (error) {
            console.error('❌ Error actualizando sesión:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Finalizar sesión de minería en backend
     */
    async endMiningSession(finalData) {
        if (!this.isConnected || !this.sessionId) {
            return { success: true, offline: true };
        }

        try {
            const response = await fetch(`${this.baseURL}/mining/end`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-User-ID': this.userId
                },
                body: JSON.stringify({
                    sessionId: this.sessionId,
                    ...finalData
                })
            });

            const result = await response.json();
            
            if (result.success) {
                this.sessionId = null;
                console.log('✅ Sesión de minería finalizada en backend');
            }
            
            return result;
        } catch (error) {
            console.error('❌ Error finalizando sesión:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Sincronizar datos de minería
     */
    async syncMiningData(miningData) {
        if (!this.isConnected) {
            return { success: true, offline: true };
        }

        try {
            const response = await fetch(`${this.baseURL}/mining/sync`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-User-ID': this.userId
                },
                body: JSON.stringify({
                    sessionId: this.sessionId,
                    ...miningData
                })
            });

            const result = await response.json();
            return result;
        } catch (error) {
            console.error('❌ Error sincronizando datos:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Obtener balance del usuario
     */
    async getUserBalance() {
        if (!this.isConnected) {
            // Obtener balance local
            const localBalance = parseFloat(localStorage.getItem('rsc_wallet_balance') || '0');
            return { success: true, balance: localBalance, offline: true };
        }

        try {
            const response = await fetch(`${this.baseURL}/users/balance`, {
                method: 'GET',
                headers: {
                    'X-User-ID': this.userId
                }
            });

            const result = await response.json();
            
            if (result.success) {
                // Sincronizar balance local con backend
                localStorage.setItem('rsc_wallet_balance', result.balance.toString());
            }
            
            return result;
        } catch (error) {
            console.error('❌ Error obteniendo balance:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Obtener perfil del usuario
     */
    async getUserProfile() {
        if (!this.isConnected) {
            return { success: false, offline: true };
        }

        try {
            const response = await fetch(`${this.baseURL}/users/profile`, {
                method: 'GET',
                headers: {
                    'X-User-ID': this.userId
                }
            });

            const result = await response.json();
            return result;
        } catch (error) {
            console.error('❌ Error obteniendo perfil:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Validar código de referral
     */
    async validateReferralCode(referralCode) {
        if (!this.isConnected) {
            return { success: false, offline: true };
        }

        try {
            const response = await fetch(`${this.baseURL}/users/validate-referral`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ referralCode })
            });

            const result = await response.json();
            return result;
        } catch (error) {
            console.error('❌ Error validando código de referral:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Obtener ranking de usuarios
     */
    async getUserRanking(limit = 100) {
        if (!this.isConnected) {
            return { success: false, offline: true };
        }

        try {
            const response = await fetch(`${this.baseURL}/ranking?limit=${limit}`, {
                method: 'GET'
            });

            const result = await response.json();
            return result;
        } catch (error) {
            console.error('❌ Error obteniendo ranking:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Obtener estadísticas generales
     */
    async getGeneralStats() {
        if (!this.isConnected) {
            return { success: false, offline: true };
        }

        try {
            const response = await fetch(`${this.baseURL}/stats`, {
                method: 'GET'
            });

            const result = await response.json();
            return result;
        } catch (error) {
            console.error('❌ Error obteniendo estadísticas:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Iniciar sincronización automática
     */
    startAutoSync() {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
        }

        // Sincronizar cada 30 segundos
        this.syncInterval = setInterval(async () => {
            if (this.isConnected && this.sessionId) {
                await this.syncMiningData({
                    tokensMined: parseFloat(localStorage.getItem('rsc_wallet_balance') || '0'),
                    isActive: true
                });
            }
        }, 30000);

        console.log('🔄 Sincronización automática iniciada');
    }

    /**
     * Detener sincronización automática
     */
    stopAutoSync() {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
            this.syncInterval = null;
            console.log('⏹️ Sincronización automática detenida');
        }
    }

    /**
     * Reconectar con backend
     */
    async reconnect() {
        console.log('🔄 Intentando reconectar con backend...');
        
        const isOnline = await this.checkConnection();
        if (isOnline) {
            this.isConnected = true;
            this.retryCount = 0;
            console.log('✅ Reconectado con backend');
            return true;
        } else {
            this.retryCount++;
            if (this.retryCount < this.maxRetries) {
                setTimeout(() => this.reconnect(), 5000);
            } else {
                console.warn('⚠️ Máximo de reintentos alcanzado');
            }
            return false;
        }
    }

    /**
     * Obtener estado de conexión
     */
    getConnectionStatus() {
        return {
            connected: this.isConnected,
            userId: this.userId,
            sessionId: this.sessionId,
            retryCount: this.retryCount
        };
    }
}

// Exportar instancia global
window.RSCMiningBackend = new RSCMiningBackendIntegration();

// Auto-inicializar si está disponible
if (typeof window !== 'undefined') {
    window.addEventListener('load', () => {
        window.RSCMiningBackend.initialize();
    });
}

export default RSCMiningBackendIntegration;
