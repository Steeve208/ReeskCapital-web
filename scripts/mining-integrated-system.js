/**
 * Mining Integrated System
 * Sistema integrado de minería con persistencia automática
 * Garantiza que TODO lo que se mine se guarde en la wallet
 */

class MiningIntegratedSystem {
    constructor() {
        this.isRunning = false;
        this.miningInterval = null;
        this.currentHashRate = 0;
        this.totalMined = 0;
        this.sessionStartTime = null;
        
        // Inicializar sistema de persistencia
        this.persistenceManager = new MiningPersistenceManager();
        
        // Configuración de minería
        this.miningConfig = {
            baseReward: 0.001, // Recompensa base por hash
            hashRateMultiplier: 0.00001, // Multiplicador por hash rate
            maxReward: 1.0, // Recompensa máxima por bloque
            miningInterval: 1000, // Intervalo de minería en ms
            difficultyAdjustment: 1.0 // Ajuste de dificultad
        };
        
        this.init();
    }

    async init() {
        try {
            // Esperar a que el persistence manager esté listo
            while (!this.persistenceManager.isInitialized) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
            
            // Cargar configuración guardada
            this.loadSavedConfig();
            
            // Inicializar UI
            this.initializeUI();
            
            // Configurar eventos
            this.setupEventListeners();
            
            // Recuperar estado anterior
            await this.recoverPreviousState();
            
            console.log('✅ Mining Integrated System inicializado correctamente');
            
        } catch (error) {
            console.error('❌ Error inicializando Mining Integrated System:', error);
        }
    }

    /**
     * Carga configuración guardada
     */
    loadSavedConfig() {
        try {
            const savedConfig = localStorage.getItem('rsc_mining_config');
            if (savedConfig) {
                const config = JSON.parse(savedConfig);
                this.miningConfig = { ...this.miningConfig, ...config };
            }
        } catch (error) {
            console.warn('⚠️ No se pudo cargar configuración guardada:', error);
        }
    }

    /**
     * Guarda configuración actual
     */
    saveConfig() {
        try {
            localStorage.setItem('rsc_mining_config', JSON.stringify(this.miningConfig));
        } catch (error) {
            console.warn('⚠️ No se pudo guardar configuración:', error);
        }
    }

    /**
     * Inicializa la interfaz de usuario
     */
    initializeUI() {
        try {
            // Crear controles de minería si no existen
            this.createMiningControls();
            
            // Actualizar display inicial
            this.updateMiningDisplay();
            
        } catch (error) {
            console.warn('⚠️ Error inicializando UI:', error);
        }
    }

    /**
     * Crea controles de minería
     */
    createMiningControls() {
        const existingControls = document.getElementById('mining-controls');
        if (existingControls) return;

        const controlsContainer = document.createElement('div');
        controlsContainer.id = 'mining-controls';
        controlsContainer.className = 'mining-controls-container';
        controlsContainer.innerHTML = `
            <div class="mining-controls-header">
                <h3>🚀 Sistema de Minería Integrado</h3>
                <p>Minería automática con persistencia garantizada</p>
            </div>
            
            <div class="mining-controls-body">
                <div class="mining-status">
                    <div class="status-indicator">
                        <span class="status-dot" id="status-dot"></span>
                        <span class="status-text" id="status-text">Detenido</span>
                    </div>
                </div>
                
                <div class="mining-stats">
                    <div class="stat-item">
                        <label>Hash Rate:</label>
                        <span id="hash-rate-display">0 H/s</span>
                    </div>
                    <div class="stat-item">
                        <label>Total Minado:</label>
                        <span id="total-mined-display">0 RSC</span>
                    </div>
                    <div class="stat-item">
                        <label>Balance Wallet:</label>
                        <span id="wallet-balance-display" data-wallet-balance="0">0 RSC</span>
                    </div>
                    <div class="stat-item">
                        <label>Tiempo Sesión:</label>
                        <span id="session-time-display">00:00:00</span>
                    </div>
                </div>
                
                <div class="mining-controls-buttons">
                    <button id="start-mining-btn" class="mining-btn start">🚀 Iniciar Minería</button>
                    <button id="stop-mining-btn" class="mining-btn stop" disabled>⏹️ Detener Minería</button>
                    <button id="reset-mining-btn" class="mining-btn reset">🔄 Reiniciar</button>
                </div>
                
                <div class="mining-settings">
                    <div class="setting-item">
                        <label for="hash-rate-input">Hash Rate (H/s):</label>
                        <input type="number" id="hash-rate-input" value="1000" min="100" max="100000">
                    </div>
                    <div class="setting-item">
                        <label for="mining-interval-input">Intervalo (ms):</label>
                        <input type="number" id="mining-interval-input" value="1000" min="100" max="10000">
                    </div>
                    <button id="apply-settings-btn" class="settings-btn">⚙️ Aplicar Configuración</button>
                </div>
            </div>
            
            <div class="mining-notifications" id="mining-notifications"></div>
        `;

        // Insertar en la página
        const targetContainer = document.querySelector('.mining-section') || 
                              document.querySelector('.mining-container') || 
                              document.body;
        targetContainer.appendChild(controlsContainer);
    }

    /**
     * Configura event listeners
     */
    setupEventListeners() {
        try {
            // Botón de iniciar minería
            const startBtn = document.getElementById('start-mining-btn');
            if (startBtn) {
                startBtn.addEventListener('click', () => this.startMining());
            }

            // Botón de detener minería
            const stopBtn = document.getElementById('stop-mining-btn');
            if (stopBtn) {
                stopBtn.addEventListener('click', () => this.stopMining());
            }

            // Botón de reiniciar
            const resetBtn = document.getElementById('reset-mining-btn');
            if (resetBtn) {
                resetBtn.addEventListener('click', () => this.resetMining());
            }

            // Botón de aplicar configuración
            const applyBtn = document.getElementById('apply-settings-btn');
            if (applyBtn) {
                applyBtn.addEventListener('click', () => this.applySettings());
            }

            // Inputs de configuración
            const hashRateInput = document.getElementById('hash-rate-input');
            if (hashRateInput) {
                hashRateInput.addEventListener('change', () => this.updateHashRate());
            }

            const intervalInput = document.getElementById('mining-interval-input');
            if (intervalInput) {
                intervalInput.addEventListener('change', () => this.updateMiningInterval());
            }

            // Evento de actualización de balance de wallet
            document.addEventListener('walletBalanceUpdated', (event) => {
                this.updateWalletBalanceDisplay(event.detail.balance);
            });

        } catch (error) {
            console.error('❌ Error configurando event listeners:', error);
        }
    }

    /**
     * Recupera estado anterior
     */
    async recoverPreviousState() {
        try {
            // Recuperar estadísticas de minería
            const stats = await this.persistenceManager.getMiningStats();
            
            if (stats) {
                this.totalMined = stats.totalMined;
                this.updateMiningDisplay();
            }
            
            // Recuperar balance de wallet
            const walletBalance = localStorage.getItem('rsc_wallet_balance');
            if (walletBalance) {
                this.updateWalletBalanceDisplay(parseFloat(walletBalance));
            }
            
        } catch (error) {
            console.warn('⚠️ No se pudo recuperar estado anterior:', error);
        }
    }

    /**
     * Inicia la minería
     */
    async startMining() {
        if (this.isRunning) {
            console.warn('⚠️ La minería ya está ejecutándose');
            return;
        }

        try {
            console.log('🚀 Iniciando sistema de minería...');
            
            // Iniciar sesión de minería
            this.persistenceManager.startMiningSession();
            
            // Configurar estado
            this.isRunning = true;
            this.sessionStartTime = Date.now();
            
            // Iniciar intervalo de minería
            this.startMiningInterval();
            
            // Actualizar UI
            this.updateMiningStatus('running');
            this.updateControlButtons();
            
            // Mostrar notificación
            this.showNotification('🚀 Minería iniciada correctamente', 'success');
            
            console.log('✅ Minería iniciada correctamente');
            
        } catch (error) {
            console.error('❌ Error iniciando minería:', error);
            this.showNotification('❌ Error iniciando minería', 'error');
        }
    }

    /**
     * Detiene la minería
     */
    async stopMining() {
        if (!this.isRunning) {
            console.warn('⚠️ La minería no está ejecutándose');
            return;
        }

        try {
            console.log('⏹️ Deteniendo sistema de minería...');
            
            // Detener intervalo de minería
            this.stopMiningInterval();
            
            // Finalizar sesión de minería
            await this.persistenceManager.endMiningSession();
            
            // Configurar estado
            this.isRunning = false;
            this.sessionStartTime = null;
            
            // Actualizar UI
            this.updateMiningStatus('stopped');
            this.updateControlButtons();
            
            // Mostrar notificación
            this.showNotification('⏹️ Minería detenida correctamente', 'info');
            
            console.log('✅ Minería detenida correctamente');
            
        } catch (error) {
            console.error('❌ Error deteniendo minería:', error);
            this.showNotification('❌ Error deteniendo minería', 'error');
        }
    }

    /**
     * Reinicia la minería
     */
    async resetMining() {
        try {
            console.log('🔄 Reiniciando sistema de minería...');
            
            // Detener minería si está ejecutándose
            if (this.isRunning) {
                await this.stopMining();
            }
            
            // Reiniciar estadísticas
            this.totalMined = 0;
            this.currentHashRate = 0;
            
            // Limpiar storage de minería
            await this.clearMiningData();
            
            // Actualizar UI
            this.updateMiningDisplay();
            
            // Mostrar notificación
            this.showNotification('🔄 Sistema de minería reiniciado', 'info');
            
            console.log('✅ Sistema de minería reiniciado correctamente');
            
        } catch (error) {
            console.error('❌ Error reiniciando minería:', error);
            this.showNotification('❌ Error reiniciando minería', 'error');
        }
    }

    /**
     * Inicia intervalo de minería
     */
    startMiningInterval() {
        if (this.miningInterval) {
            clearInterval(this.miningInterval);
        }

        this.miningInterval = setInterval(() => {
            this.performMining();
        }, this.miningConfig.miningInterval);
    }

    /**
     * Detiene intervalo de minería
     */
    stopMiningInterval() {
        if (this.miningInterval) {
            clearInterval(this.miningInterval);
            this.miningInterval = null;
        }
    }

    /**
     * Ejecuta un ciclo de minería
     */
    async performMining() {
        if (!this.isRunning) return;

        try {
            // Calcular recompensa basada en hash rate
            const reward = this.calculateMiningReward();
            
            if (reward > 0) {
                // Procesar recompensa con persistencia garantizada
                const success = await this.persistenceManager.processMiningReward(reward, {
                    hashRate: this.currentHashRate,
                    difficulty: this.miningConfig.difficultyAdjustment,
                    timestamp: Date.now()
                });
                
                if (success) {
                    // Actualizar estadísticas
                    this.totalMined += reward;
                    
                    // Actualizar display
                    this.updateMiningDisplay();
                    
                    // Log de minería exitosa
                    console.log(`⛏️ Minado: +${reward.toFixed(6)} RSC (Total: ${this.totalMined.toFixed(6)} RSC)`);
                }
            }
            
        } catch (error) {
            console.error('❌ Error en ciclo de minería:', error);
        }
    }

    /**
     * Calcula recompensa de minería
     */
    calculateMiningReward() {
        try {
            // Recompensa base
            let reward = this.miningConfig.baseReward;
            
            // Multiplicador por hash rate
            const hashRateBonus = this.currentHashRate * this.miningConfig.hashRateMultiplier;
            reward += hashRateBonus;
            
            // Ajuste de dificultad
            reward *= this.miningConfig.difficultyAdjustment;
            
            // Límite máximo
            reward = Math.min(reward, this.miningConfig.maxReward);
            
            // Asegurar valor positivo
            reward = Math.max(reward, 0.000001);
            
            return reward;
            
        } catch (error) {
            console.error('❌ Error calculando recompensa:', error);
            return 0.000001; // Recompensa mínima
        }
    }

    /**
     * Aplica configuración de minería
     */
    applySettings() {
        try {
            // Obtener valores de inputs
            const hashRateInput = document.getElementById('hash-rate-input');
            const intervalInput = document.getElementById('mining-interval-input');
            
            if (hashRateInput && intervalInput) {
                const newHashRate = parseInt(hashRateInput.value) || 1000;
                const newInterval = parseInt(intervalInput.value) || 1000;
                
                // Validar valores
                if (newHashRate < 100 || newHashRate > 100000) {
                    this.showNotification('⚠️ Hash Rate debe estar entre 100 y 100,000 H/s', 'warning');
                    return;
                }
                
                if (newInterval < 100 || newInterval > 10000) {
                    this.showNotification('⚠️ Intervalo debe estar entre 100 y 10,000 ms', 'warning');
                    return;
                }
                
                // Aplicar configuración
                this.currentHashRate = newHashRate;
                this.miningConfig.miningInterval = newInterval;
                
                // Guardar configuración
                this.saveConfig();
                
                // Reiniciar minería si está ejecutándose
                if (this.isRunning) {
                    this.stopMiningInterval();
                    this.startMiningInterval();
                }
                
                // Actualizar display
                this.updateMiningDisplay();
                
                // Mostrar notificación
                this.showNotification('⚙️ Configuración aplicada correctamente', 'success');
                
                console.log('✅ Configuración aplicada:', { hashRate: newHashRate, interval: newInterval });
            }
            
        } catch (error) {
            console.error('❌ Error aplicando configuración:', error);
            this.showNotification('❌ Error aplicando configuración', 'error');
        }
    }

    /**
     * Actualiza hash rate
     */
    updateHashRate() {
        const hashRateInput = document.getElementById('hash-rate-input');
        if (hashRateInput) {
            const newHashRate = parseInt(hashRateInput.value) || 1000;
            this.currentHashRate = newHashRate;
            this.updateMiningDisplay();
        }
    }

    /**
     * Actualiza intervalo de minería
     */
    updateMiningInterval() {
        const intervalInput = document.getElementById('mining-interval-input');
        if (intervalInput) {
            const newInterval = parseInt(intervalInput.value) || 1000;
            this.miningConfig.miningInterval = newInterval;
            
            // Reiniciar intervalo si está ejecutándose
            if (this.isRunning) {
                this.stopMiningInterval();
                this.startMiningInterval();
            }
        }
    }

    /**
     * Actualiza estado de minería
     */
    updateMiningStatus(status) {
        try {
            const statusDot = document.getElementById('status-dot');
            const statusText = document.getElementById('status-text');
            
            if (statusDot && statusText) {
                statusDot.className = `status-dot ${status}`;
                
                switch (status) {
                    case 'running':
                        statusText.textContent = 'Ejecutándose';
                        break;
                    case 'stopped':
                        statusText.textContent = 'Detenido';
                        break;
                    case 'error':
                        statusText.textContent = 'Error';
                        break;
                    default:
                        statusText.textContent = 'Desconocido';
                }
            }
        } catch (error) {
            console.warn('⚠️ Error actualizando estado de minería:', error);
        }
    }

    /**
     * Actualiza botones de control
     */
    updateControlButtons() {
        try {
            const startBtn = document.getElementById('start-mining-btn');
            const stopBtn = document.getElementById('stop-mining-btn');
            
            if (startBtn && stopBtn) {
                if (this.isRunning) {
                    startBtn.disabled = true;
                    stopBtn.disabled = false;
                } else {
                    startBtn.disabled = false;
                    stopBtn.disabled = true;
                }
            }
        } catch (error) {
            console.warn('⚠️ Error actualizando botones de control:', error);
        }
    }

    /**
     * Actualiza display de minería
     */
    updateMiningDisplay() {
        try {
            // Hash rate
            const hashRateDisplay = document.getElementById('hash-rate-display');
            if (hashRateDisplay) {
                hashRateDisplay.textContent = `${this.currentHashRate.toLocaleString()} H/s`;
            }
            
            // Total minado
            const totalMinedDisplay = document.getElementById('total-mined-display');
            if (totalMinedDisplay) {
                totalMinedDisplay.textContent = `${this.totalMined.toFixed(6)} RSC`;
            }
            
            // Tiempo de sesión
            this.updateSessionTimeDisplay();
            
        } catch (error) {
            console.warn('⚠️ Error actualizando display de minería:', error);
        }
    }

    /**
     * Actualiza display de tiempo de sesión
     */
    updateSessionTimeDisplay() {
        try {
            const sessionTimeDisplay = document.getElementById('session-time-display');
            if (sessionTimeDisplay && this.sessionStartTime) {
                const elapsed = Date.now() - this.sessionStartTime;
                const hours = Math.floor(elapsed / 3600000);
                const minutes = Math.floor((elapsed % 3600000) / 60000);
                const seconds = Math.floor((elapsed % 60000) / 1000);
                
                sessionTimeDisplay.textContent = 
                    `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            }
        } catch (error) {
            console.warn('⚠️ Error actualizando tiempo de sesión:', error);
        }
    }

    /**
     * Actualiza display de balance de wallet
     */
    updateWalletBalanceDisplay(balance) {
        try {
            const walletBalanceDisplay = document.getElementById('wallet-balance-display');
            if (walletBalanceDisplay) {
                walletBalanceDisplay.textContent = `${balance.toFixed(6)} RSC`;
                walletBalanceDisplay.setAttribute('data-wallet-balance', balance.toString());
            }
        } catch (error) {
            console.warn('⚠️ Error actualizando balance de wallet:', error);
        }
    }

    /**
     * Muestra notificación
     */
    showNotification(message, type = 'info') {
        try {
            const notificationsContainer = document.getElementById('mining-notifications');
            if (!notificationsContainer) return;
            
            const notification = document.createElement('div');
            notification.className = `mining-notification ${type}`;
            notification.innerHTML = `
                <div class="notification-content">
                    <span class="notification-text">${message}</span>
                    <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
                </div>
            `;
            
            notificationsContainer.appendChild(notification);
            
            // Remover automáticamente después de 5 segundos
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 5000);
            
        } catch (error) {
            console.warn('⚠️ Error mostrando notificación:', error);
        }
    }

    /**
     * Limpia datos de minería
     */
    async clearMiningData() {
        try {
            // Limpiar estadísticas locales
            this.totalMined = 0;
            this.sessionStartTime = null;
            
            // Limpiar storage local
            const keysToRemove = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith('mining_')) {
                    keysToRemove.push(key);
                }
            }
            
            keysToRemove.forEach(key => localStorage.removeItem(key));
            
            console.log('✅ Datos de minería limpiados correctamente');
            
        } catch (error) {
            console.error('❌ Error limpiando datos de minería:', error);
        }
    }

    /**
     * Obtiene estadísticas completas
     */
    async getCompleteStats() {
        try {
            const miningStats = await this.persistenceManager.getMiningStats();
            const systemStats = {
                isRunning: this.isRunning,
                currentHashRate: this.currentHashRate,
                totalMined: this.totalMined,
                sessionStartTime: this.sessionStartTime,
                miningConfig: this.miningConfig
            };
            
            return {
                mining: miningStats,
                system: systemStats
            };
            
        } catch (error) {
            console.error('❌ Error obteniendo estadísticas completas:', error);
            return null;
        }
    }

    /**
     * Exporta datos de minería
     */
    async exportMiningData() {
        try {
            const stats = await this.getCompleteStats();
            const exportData = {
                exportDate: new Date().toISOString(),
                version: '1.0.0',
                data: stats
            };
            
            const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `rsc-mining-data-${Date.now()}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            
            URL.revokeObjectURL(url);
            
            this.showNotification('📊 Datos de minería exportados correctamente', 'success');
            
        } catch (error) {
            console.error('❌ Error exportando datos de minería:', error);
            this.showNotification('❌ Error exportando datos', 'error');
        }
    }

    /**
     * Destruye el sistema
     */
    destroy() {
        try {
            // Detener minería si está ejecutándose
            if (this.isRunning) {
                this.stopMining();
            }
            
            // Limpiar intervalos
            if (this.miningInterval) {
                clearInterval(this.miningInterval);
            }
            
            // Limpiar event listeners
            this.removeEventListeners();
            
            // Destruir persistence manager
            if (this.persistenceManager) {
                this.persistenceManager.destroy();
            }
            
            console.log('✅ Mining Integrated System destruido correctamente');
            
        } catch (error) {
            console.error('❌ Error destruyendo sistema:', error);
        }
    }

    /**
     * Remueve event listeners
     */
    removeEventListeners() {
        try {
            // Remover elementos de UI
            const controlsContainer = document.getElementById('mining-controls');
            if (controlsContainer) {
                controlsContainer.remove();
            }
            
        } catch (error) {
            console.warn('⚠️ Error removiendo event listeners:', error);
        }
    }
}

// Exportar para uso global
window.MiningIntegratedSystem = MiningIntegratedSystem;
