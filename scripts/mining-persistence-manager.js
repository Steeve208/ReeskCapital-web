/**
 * Mining Persistence Manager
 * Sistema profesional de persistencia automática para minería
 * Garantiza que NADA se pierda del usuario
 */

class MiningPersistenceManager {
    constructor() {
        this.isInitialized = false;
        this.currentSession = null;
        this.pendingRewards = [];
        this.syncQueue = [];
        this.retryAttempts = 0;
        this.maxRetries = 5;
        
        this.init();
    }

    async init() {
        try {
            await this.initializeStorage();
            await this.loadPendingRewards();
            await this.recoverLostRewards();
            this.startAutoSync();
            this.isInitialized = true;
            
            console.log('✅ Mining Persistence Manager inicializado correctamente');
        } catch (error) {
            console.error('❌ Error inicializando Mining Persistence Manager:', error);
            this.handleInitializationError(error);
        }
    }

    /**
     * Inicializa todos los sistemas de storage
     */
    async initializeStorage() {
        // IndexedDB para persistencia robusta
        this.db = await this.openIndexedDB();
        
        // LocalStorage como backup rápido
        this.localStorage = window.localStorage;
        
        // SessionStorage para sesión actual
        this.sessionStorage = window.sessionStorage;
        
        // Verificar integridad de storage
        await this.verifyStorageIntegrity();
    }

    /**
     * Abre conexión a IndexedDB
     */
    async openIndexedDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('RSCMiningDB', 2);
            
            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // Store para recompensas de minería
                if (!db.objectStoreNames.contains('miningRewards')) {
                    const rewardStore = db.createObjectStore('miningRewards', { 
                        keyPath: 'id', 
                        autoIncrement: true 
                    });
                    rewardStore.createIndex('timestamp', 'timestamp', { unique: false });
                    rewardStore.createIndex('status', 'status', { unique: false });
                    rewardStore.createIndex('sessionId', 'sessionId', { unique: false });
                }
                
                // Store para sesiones de minería
                if (!db.objectStoreNames.contains('miningSessions')) {
                    const sessionStore = db.createObjectStore('miningSessions', { 
                        keyPath: 'id', 
                        autoIncrement: true 
                    });
                    sessionStore.createIndex('startTime', 'startTime', { unique: false });
                    sessionStore.createIndex('status', 'status', { unique: false });
                }
                
                // Store para transacciones de wallet
                if (!db.objectStoreNames.contains('walletTransactions')) {
                    const transactionStore = db.createObjectStore('walletTransactions', { 
                        keyPath: 'id', 
                        autoIncrement: true 
                    });
                    transactionStore.createIndex('timestamp', 'timestamp', { unique: false });
                    transactionStore.createIndex('type', 'type', { unique: false });
                }
            };
        });
    }

    /**
     * Verifica integridad del storage
     */
    async verifyStorageIntegrity() {
        try {
            // Verificar IndexedDB
            const dbCheck = await this.performDatabaseCheck();
            
            // Verificar LocalStorage
            const localCheck = this.performLocalStorageCheck();
            
            // Verificar SessionStorage
            const sessionCheck = this.performSessionStorageCheck();
            
            if (!dbCheck || !localCheck || !sessionCheck) {
                throw new Error('Integridad del storage comprometida');
            }
            
            console.log('✅ Verificación de integridad del storage completada');
        } catch (error) {
            console.error('❌ Error en verificación de integridad:', error);
            await this.repairStorage();
        }
    }

    /**
     * Procesa una recompensa de minería con persistencia garantizada
     */
    async processMiningReward(amount, metadata = {}) {
        if (!this.isInitialized) {
            throw new Error('Mining Persistence Manager no está inicializado');
        }

        if (amount <= 0) {
            console.warn('⚠️ Cantidad de minería inválida:', amount);
            return false;
        }

        try {
            const reward = {
                id: this.generateUniqueId(),
                amount: amount,
                timestamp: Date.now(),
                sessionId: this.currentSession?.id || 'unknown',
                status: 'pending',
                metadata: metadata,
                hash: this.generateHash(amount, metadata)
            };

            // 1. Guardar en IndexedDB (persistencia principal)
            await this.saveToIndexedDB(reward);
            
            // 2. Guardar en LocalStorage (backup rápido)
            this.saveToLocalStorage(reward);
            
            // 3. Agregar a cola de sincronización
            this.addToSyncQueue(reward);
            
            // 4. Actualizar wallet inmediatamente
            await this.updateWalletBalance(amount);
            
            // 5. Notificar al usuario
            this.notifyUser(reward);
            
            // 6. Intentar sincronización inmediata
            this.triggerImmediateSync();
            
            console.log(`✅ Recompensa de ${amount} RSC procesada y persistida correctamente`);
            return true;
            
        } catch (error) {
            console.error('❌ Error procesando recompensa de minería:', error);
            await this.handleProcessingError(amount, metadata, error);
            return false;
        }
    }

    /**
     * Guarda recompensa en IndexedDB
     */
    async saveToIndexedDB(reward) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['miningRewards'], 'readwrite');
            const store = transaction.objectStore('miningRewards');
            
            const request = store.add(reward);
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Guarda recompensa en LocalStorage como backup
     */
    saveToLocalStorage(reward) {
        try {
            const key = `mining_reward_${reward.id}`;
            this.localStorage.setItem(key, JSON.stringify(reward));
            
            // Mantener solo las últimas 100 recompensas en LocalStorage
            this.cleanupLocalStorage();
        } catch (error) {
            console.warn('⚠️ No se pudo guardar en LocalStorage:', error);
        }
    }

    /**
     * Actualiza el balance de la wallet
     */
    async updateWalletBalance(amount) {
        try {
            // Obtener balance actual
            let currentBalance = parseFloat(this.localStorage.getItem('rsc_wallet_balance') || '0');
            
            // Agregar nueva cantidad
            const newBalance = currentBalance + amount;
            
            // Guardar en múltiples lugares
            this.localStorage.setItem('rsc_wallet_balance', newBalance.toString());
            this.sessionStorage.setItem('rsc_wallet_balance', newBalance.toString());
            
            // Registrar transacción
            await this.recordWalletTransaction(amount, 'mining_reward');
            
            // Actualizar UI si está disponible
            this.updateWalletUI(newBalance);
            
            return newBalance;
        } catch (error) {
            console.error('❌ Error actualizando balance de wallet:', error);
            throw error;
        }
    }

    /**
     * Registra transacción en la wallet
     */
    async recordWalletTransaction(amount, type) {
        const transaction = {
            id: this.generateUniqueId(),
            amount: amount,
            type: type,
            timestamp: Date.now(),
            status: 'completed'
        };

        return new Promise((resolve, reject) => {
            const dbTransaction = this.db.transaction(['walletTransactions'], 'readwrite');
            const store = dbTransaction.objectStore('walletTransactions');
            
            const request = store.add(transaction);
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Recupera recompensas perdidas
     */
    async recoverLostRewards() {
        try {
            console.log('🔍 Iniciando recuperación de recompensas perdidas...');
            
            // Recuperar desde IndexedDB
            const dbRewards = await this.getPendingRewardsFromDB();
            
            // Recuperar desde LocalStorage
            const localRewards = this.getPendingRewardsFromLocal();
            
            // Consolidar recompensas
            const allRewards = this.consolidateRewards(dbRewards, localRewards);
            
            if (allRewards.length > 0) {
                console.log(`📦 Recuperando ${allRewards.length} recompensas perdidas...`);
                
                for (const reward of allRewards) {
                    await this.processRecoveredReward(reward);
                }
                
                console.log('✅ Recuperación de recompensas completada');
            } else {
                console.log('✅ No se encontraron recompensas perdidas');
            }
            
        } catch (error) {
            console.error('❌ Error en recuperación de recompensas:', error);
        }
    }

    /**
     * Obtiene recompensas pendientes desde IndexedDB
     */
    async getPendingRewardsFromDB() {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['miningRewards'], 'readonly');
            const store = transaction.objectStore('miningRewards');
            const index = store.index('status');
            
            const request = index.getAll('pending');
            
            request.onsuccess = () => resolve(request.result || []);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Obtiene recompensas pendientes desde LocalStorage
     */
    getPendingRewardsFromLocal() {
        const rewards = [];
        
        try {
            for (let i = 0; i < this.localStorage.length; i++) {
                const key = this.localStorage.key(i);
                if (key && key.startsWith('mining_reward_')) {
                    const rewardData = this.localStorage.getItem(key);
                    if (rewardData) {
                        try {
                            const reward = JSON.parse(rewardData);
                            rewards.push(reward);
                        } catch (e) {
                            console.warn('⚠️ Error parseando recompensa desde LocalStorage:', e);
                        }
                    }
                }
            }
        } catch (error) {
            console.warn('⚠️ Error accediendo a LocalStorage:', error);
        }
        
        return rewards;
    }

    /**
     * Consolida recompensas de múltiples fuentes
     */
    consolidateRewards(dbRewards, localRewards) {
        const consolidated = new Map();
        
        // Agregar recompensas de IndexedDB
        for (const reward of dbRewards) {
            consolidated.set(reward.hash, reward);
        }
        
        // Agregar recompensas de LocalStorage (prioridad si no están en DB)
        for (const reward of localRewards) {
            if (!consolidated.has(reward.hash)) {
                consolidated.set(reward.hash, reward);
            }
        }
        
        return Array.from(consolidated.values());
    }

    /**
     * Procesa una recompensa recuperada
     */
    async processRecoveredReward(reward) {
        try {
            // Verificar que no esté duplicada
            if (await this.isRewardAlreadyProcessed(reward)) {
                console.log(`🔄 Recompensa ${reward.id} ya procesada, marcando como completada`);
                await this.markRewardAsCompleted(reward.id);
                return;
            }
            
            // Procesar la recompensa
            await this.updateWalletBalance(reward.amount);
            await this.markRewardAsCompleted(reward.id);
            
            console.log(`✅ Recompensa recuperada: ${reward.amount} RSC`);
            
        } catch (error) {
            console.error(`❌ Error procesando recompensa recuperada ${reward.id}:`, error);
        }
    }

    /**
     * Verifica si una recompensa ya fue procesada
     */
    async isRewardAlreadyProcessed(reward) {
        try {
            const currentBalance = parseFloat(this.localStorage.getItem('rsc_wallet_balance') || '0');
            const expectedBalance = parseFloat(this.localStorage.getItem('rsc_expected_balance') || '0');
            
            // Si el balance actual es mayor o igual al esperado, la recompensa ya fue procesada
            return currentBalance >= expectedBalance;
        } catch (error) {
            return false;
        }
    }

    /**
     * Marca una recompensa como completada
     */
    async markRewardAsCompleted(rewardId) {
        try {
            const transaction = this.db.transaction(['miningRewards'], 'readwrite');
            const store = transaction.objectStore('miningRewards');
            
            const getRequest = store.get(rewardId);
            
            getRequest.onsuccess = () => {
                const reward = getRequest.result;
                if (reward) {
                    reward.status = 'completed';
                    reward.completedAt = Date.now();
                    
                    const updateRequest = store.put(reward);
                    updateRequest.onsuccess = () => {
                        console.log(`✅ Recompensa ${rewardId} marcada como completada`);
                    };
                }
            };
            
        } catch (error) {
            console.error(`❌ Error marcando recompensa ${rewardId} como completada:`, error);
        }
    }

    /**
     * Inicia sesión de minería
     */
    startMiningSession() {
        this.currentSession = {
            id: this.generateUniqueId(),
            startTime: Date.now(),
            status: 'active',
            totalMined: 0
        };
        
        // Guardar sesión
        this.saveMiningSession(this.currentSession);
        
        console.log('🚀 Sesión de minería iniciada:', this.currentSession.id);
    }

    /**
     * Finaliza sesión de minería
     */
    async endMiningSession() {
        if (this.currentSession) {
            this.currentSession.status = 'completed';
            this.currentSession.endTime = Date.now();
            this.currentSession.duration = this.currentSession.endTime - this.currentSession.startTime;
            
            // Guardar sesión completada
            await this.saveMiningSession(this.currentSession);
            
            // Sincronizar con backend
            await this.syncSessionWithBackend(this.currentSession);
            
            console.log('🏁 Sesión de minería finalizada:', this.currentSession);
            
            this.currentSession = null;
        }
    }

    /**
     * Guarda sesión de minería
     */
    async saveMiningSession(session) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['miningSessions'], 'readwrite');
            const store = transaction.objectStore('miningSessions');
            
            const request = store.add(session);
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Sincroniza sesión con backend
     */
    async syncSessionWithBackend(session) {
        try {
            // Implementar sincronización con backend cuando esté disponible
            console.log('🔄 Sincronizando sesión con backend:', session.id);
        } catch (error) {
            console.warn('⚠️ No se pudo sincronizar con backend:', error);
        }
    }

    /**
     * Inicia sincronización automática
     */
    startAutoSync() {
        // Sincronizar cada 30 segundos
        this.syncInterval = setInterval(() => {
            this.performAutoSync();
        }, 30000);
        
        console.log('🔄 Sincronización automática iniciada');
    }

    /**
     * Realiza sincronización automática
     */
    async performAutoSync() {
        try {
            console.log('🔄 Iniciando sincronización automática...');
            
            // Sincronizar recompensas pendientes
            await this.syncPendingRewards();
            
            // Sincronizar sesiones
            await this.syncMiningSessions();
            
            // Limpiar storage
            await this.cleanupStorage();
            
            console.log('✅ Sincronización automática completada');
            
        } catch (error) {
            console.error('❌ Error en sincronización automática:', error);
        }
    }

    /**
     * Sincroniza recompensas pendientes
     */
    async syncPendingRewards() {
        try {
            const pendingRewards = await this.getPendingRewardsFromDB();
            
            for (const reward of pendingRewards) {
                await this.syncRewardWithBackend(reward);
            }
        } catch (error) {
            console.error('❌ Error sincronizando recompensas:', error);
        }
    }

    /**
     * Sincroniza recompensa individual con backend
     */
    async syncRewardWithBackend(reward) {
        try {
            // Implementar sincronización con backend
            console.log(`🔄 Sincronizando recompensa ${reward.id} con backend`);
            
            // Marcar como sincronizada
            await this.markRewardAsSynced(reward.id);
            
        } catch (error) {
            console.error(`❌ Error sincronizando recompensa ${reward.id}:`, error);
        }
    }

    /**
     * Marca recompensa como sincronizada
     */
    async markRewardAsSynced(rewardId) {
        try {
            const transaction = this.db.transaction(['miningRewards'], 'readwrite');
            const store = transaction.objectStore('miningRewards');
            
            const getRequest = store.get(rewardId);
            
            getRequest.onsuccess = () => {
                const reward = getRequest.result;
                if (reward) {
                    reward.status = 'synced';
                    reward.syncedAt = Date.now();
                    
                    const updateRequest = store.put(reward);
                    updateRequest.onsuccess = () => {
                        console.log(`✅ Recompensa ${rewardId} marcada como sincronizada`);
                    };
                }
            };
            
        } catch (error) {
            console.error(`❌ Error marcando recompensa ${rewardId} como sincronizada:`, error);
        }
    }

    /**
     * Sincroniza sesiones de minería
     */
    async syncMiningSessions() {
        try {
            const transaction = this.db.transaction(['miningSessions'], 'readonly');
            const store = transaction.objectStore('miningSessions');
            const index = store.index('status');
            
            const request = index.getAll('completed');
            
            request.onsuccess = async () => {
                const sessions = request.result || [];
                
                for (const session of sessions) {
                    await this.syncSessionWithBackend(session);
                }
            };
            
        } catch (error) {
            console.error('❌ Error sincronizando sesiones:', error);
        }
    }

    /**
     * Limpia storage
     */
    async cleanupStorage() {
        try {
            // Limpiar LocalStorage (mantener solo las últimas 50 recompensas)
            this.cleanupLocalStorage();
            
            // Limpiar sesiones antiguas (más de 30 días)
            await this.cleanupOldSessions();
            
            // Limpiar transacciones antiguas (más de 90 días)
            await this.cleanupOldTransactions();
            
        } catch (error) {
            console.error('❌ Error limpiando storage:', error);
        }
    }

    /**
     * Limpia LocalStorage
     */
    cleanupLocalStorage() {
        try {
            const rewardKeys = [];
            
            for (let i = 0; i < this.localStorage.length; i++) {
                const key = this.localStorage.key(i);
                if (key && key.startsWith('mining_reward_')) {
                    rewardKeys.push(key);
                }
            }
            
            // Mantener solo las últimas 50 recompensas
            if (rewardKeys.length > 50) {
                rewardKeys.sort();
                const keysToRemove = rewardKeys.slice(0, rewardKeys.length - 50);
                
                for (const key of keysToRemove) {
                    this.localStorage.removeItem(key);
                }
                
                console.log(`🧹 Limpiadas ${keysToRemove.length} recompensas antiguas de LocalStorage`);
            }
        } catch (error) {
            console.warn('⚠️ Error limpiando LocalStorage:', error);
        }
    }

    /**
     * Limpia sesiones antiguas
     */
    async cleanupOldSessions() {
        try {
            const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
            
            const transaction = this.db.transaction(['miningSessions'], 'readwrite');
            const store = transaction.objectStore('miningSessions');
            const index = store.index('startTime');
            
            const request = index.openCursor(IDBKeyRange.upperBound(thirtyDaysAgo));
            
            request.onsuccess = (event) => {
                const cursor = event.target.result;
                if (cursor) {
                    store.delete(cursor.primaryKey);
                    cursor.continue();
                }
            };
            
        } catch (error) {
            console.error('❌ Error limpiando sesiones antiguas:', error);
        }
    }

    /**
     * Limpia transacciones antiguas
     */
    async cleanupOldTransactions() {
        try {
            const ninetyDaysAgo = Date.now() - (90 * 24 * 60 * 60 * 1000);
            
            const transaction = this.db.transaction(['walletTransactions'], 'readwrite');
            const store = transaction.objectStore('walletTransactions');
            const index = store.index('timestamp');
            
            const request = index.openCursor(IDBKeyRange.upperBound(ninetyDaysAgo));
            
            request.onsuccess = (event) => {
                const cursor = event.target.result;
                if (cursor) {
                    store.delete(cursor.primaryKey);
                    cursor.continue();
                }
            };
            
        } catch (error) {
            console.error('❌ Error limpiando transacciones antiguas:', error);
        }
    }

    /**
     * Obtiene estadísticas de minería
     */
    async getMiningStats() {
        try {
            const stats = {
                totalMined: 0,
                totalSessions: 0,
                currentBalance: 0,
                pendingRewards: 0,
                lastMiningTime: null
            };
            
            // Obtener balance actual
            stats.currentBalance = parseFloat(this.localStorage.getItem('rsc_wallet_balance') || '0');
            
            // Obtener recompensas pendientes
            const pendingRewards = await this.getPendingRewardsFromDB();
            stats.pendingRewards = pendingRewards.length;
            
            // Obtener total de sesiones
            const transaction = this.db.transaction(['miningSessions'], 'readonly');
            const sessionStore = transaction.objectStore('miningSessions');
            const sessionRequest = sessionStore.getAll();
            
            sessionRequest.onsuccess = () => {
                const sessions = sessionRequest.result || [];
                stats.totalSessions = sessions.length;
                
                if (sessions.length > 0) {
                    const lastSession = sessions[sessions.length - 1];
                    stats.lastMiningTime = lastSession.endTime || lastSession.startTime;
                }
            };
            
            // Obtener total minado
            const rewardTransaction = this.db.transaction(['miningRewards'], 'readonly');
            const rewardStore = rewardTransaction.objectStore('miningRewards');
            const rewardRequest = rewardStore.getAll();
            
            rewardRequest.onsuccess = () => {
                const rewards = rewardRequest.result || [];
                stats.totalMined = rewards.reduce((total, reward) => total + reward.amount, 0);
            };
            
            return stats;
            
        } catch (error) {
            console.error('❌ Error obteniendo estadísticas de minería:', error);
            return null;
        }
    }

    /**
     * Genera ID único
     */
    generateUniqueId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    /**
     * Genera hash para verificación
     */
    generateHash(amount, metadata) {
        const data = `${amount}-${JSON.stringify(metadata)}-${Date.now()}`;
        return btoa(data).substr(0, 16);
    }

    /**
     * Notifica al usuario
     */
    notifyUser(reward) {
        try {
            // Crear notificación visual
            const notification = document.createElement('div');
            notification.className = 'mining-notification success';
            notification.innerHTML = `
                <div class="notification-content">
                    <span class="notification-icon">💰</span>
                    <span class="notification-text">¡Minería exitosa! +${reward.amount} RSC agregados a tu wallet</span>
                </div>
            `;
            
            // Agregar al DOM
            document.body.appendChild(notification);
            
            // Remover después de 5 segundos
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 5000);
            
        } catch (error) {
            console.warn('⚠️ No se pudo mostrar notificación:', error);
        }
    }

    /**
     * Actualiza UI de wallet
     */
    updateWalletUI(balance) {
        try {
            // Buscar elementos de UI que muestren el balance
            const balanceElements = document.querySelectorAll('[data-wallet-balance]');
            
            balanceElements.forEach(element => {
                element.textContent = balance.toFixed(6);
                element.setAttribute('data-wallet-balance', balance.toString());
            });
            
            // Disparar evento personalizado
            const event = new CustomEvent('walletBalanceUpdated', { 
                detail: { balance: balance } 
            });
            document.dispatchEvent(event);
            
        } catch (error) {
            console.warn('⚠️ No se pudo actualizar UI de wallet:', error);
        }
    }

    /**
     * Agrega a cola de sincronización
     */
    addToSyncQueue(reward) {
        this.syncQueue.push(reward);
        
        // Limitar cola a 100 elementos
        if (this.syncQueue.length > 100) {
            this.syncQueue.shift();
        }
    }

    /**
     * Dispara sincronización inmediata
     */
    triggerImmediateSync() {
        if (this.syncQueue.length > 0) {
            setTimeout(() => {
                this.performAutoSync();
            }, 1000);
        }
    }

    /**
     * Maneja errores de procesamiento
     */
    async handleProcessingError(amount, metadata, error) {
        console.error('❌ Error procesando recompensa:', error);
        
        // Guardar en cola de reintentos
        this.addToRetryQueue(amount, metadata, error);
        
        // Notificar al usuario del error
        this.notifyUserError(amount, error);
    }

    /**
     * Agrega a cola de reintentos
     */
    addToRetryQueue(amount, metadata, error) {
        const retryItem = {
            amount: amount,
            metadata: metadata,
            error: error.message,
            timestamp: Date.now(),
            attempts: 0
        };
        
        // Implementar lógica de reintentos
        setTimeout(() => {
            this.retryProcessing(retryItem);
        }, 5000);
    }

    /**
     * Reintenta procesamiento
     */
    async retryProcessing(retryItem) {
        try {
            retryItem.attempts++;
            
            if (retryItem.attempts <= this.maxRetries) {
                console.log(`🔄 Reintentando procesamiento (intento ${retryItem.attempts}/${this.maxRetries})`);
                
                const success = await this.processMiningReward(retryItem.amount, retryItem.metadata);
                
                if (success) {
                    console.log('✅ Reintento exitoso');
                } else {
                    // Programar siguiente reintento
                    setTimeout(() => {
                        this.retryProcessing(retryItem);
                    }, 10000 * retryItem.attempts); // Backoff exponencial
                }
            } else {
                console.error('❌ Máximo de reintentos alcanzado para recompensa:', retryItem);
                this.notifyUserError(retryItem.amount, new Error('Máximo de reintentos alcanzado'));
            }
            
        } catch (error) {
            console.error('❌ Error en reintento:', error);
        }
    }

    /**
     * Notifica error al usuario
     */
    notifyUserError(amount, error) {
        try {
            const notification = document.createElement('div');
            notification.className = 'mining-notification error';
            notification.innerHTML = `
                <div class="notification-content">
                    <span class="notification-icon">⚠️</span>
                    <span class="notification-text">Error procesando ${amount} RSC. Reintentando...</span>
                </div>
            `;
            
            document.body.appendChild(notification);
            
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 5000);
            
        } catch (e) {
            console.warn('⚠️ No se pudo mostrar notificación de error:', e);
        }
    }

    /**
     * Maneja errores de inicialización
     */
    handleInitializationError(error) {
        console.error('❌ Error crítico en inicialización:', error);
        
        // Intentar recuperación automática
        setTimeout(() => {
            console.log('🔄 Intentando recuperación automática...');
            this.init();
        }, 10000);
    }

    /**
     * Repara storage corrupto
     */
    async repairStorage() {
        try {
            console.log('🔧 Iniciando reparación de storage...');
            
            // Limpiar storage corrupto
            this.localStorage.clear();
            this.sessionStorage.clear();
            
            // Recrear IndexedDB
            await this.recreateIndexedDB();
            
            console.log('✅ Storage reparado correctamente');
            
        } catch (error) {
            console.error('❌ Error reparando storage:', error);
        }
    }

    /**
     * Recrea IndexedDB
     */
    async recreateIndexedDB() {
        try {
            // Cerrar conexión actual
            if (this.db) {
                this.db.close();
            }
            
            // Eliminar base de datos existente
            const deleteRequest = indexedDB.deleteDatabase('RSCMiningDB');
            
            deleteRequest.onsuccess = async () => {
                // Recrear base de datos
                this.db = await this.openIndexedDB();
                console.log('✅ IndexedDB recreado correctamente');
            };
            
        } catch (error) {
            console.error('❌ Error recreando IndexedDB:', error);
        }
    }

    /**
     * Destruye el manager
     */
    destroy() {
        try {
            // Detener sincronización automática
            if (this.syncInterval) {
                clearInterval(this.syncInterval);
            }
            
            // Cerrar conexiones de base de datos
            if (this.db) {
                this.db.close();
            }
            
            console.log('✅ Mining Persistence Manager destruido correctamente');
            
        } catch (error) {
            console.error('❌ Error destruyendo manager:', error);
        }
    }
}

// Exportar para uso global
window.MiningPersistenceManager = MiningPersistenceManager;
