// ========================================
// SISTEMA DE MINERÍA AUTOMÁTICA 24/7
// ========================================

class AutoMiningSystem {
    constructor() {
        this.serviceWorker = null;
        this.miningActive = false;
        this.miningStartTime = null;
        this.totalMinedRSC = 0;
        this.dailyLimit = 1; // 1 RSC máximo por día
        this.remainingLimit = 1;
        this.sessionTime = 0;
        this.lastResetDate = null;
        
        this.updateInterval = null;
        this.progressBar = null;
        this.statusIndicator = null;
        this.miningStats = null;
        
        this.init();
    }
    
    async init() {
        console.log('🚀 Inicializando Sistema de Minería Automática');
        
        // Registrar Service Worker
        await this.registerServiceWorker();
        
        // Inicializar UI
        this.initializeUI();
        
        // Conectar con Service Worker
        this.connectToServiceWorker();
        
        // Cargar estado guardado
        this.loadSavedState();
        
        // Iniciar actualizaciones
        this.startUpdates();
        
        console.log('✅ Sistema de Minería Automática inicializado');
    }
    
    async registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                this.serviceWorker = await navigator.serviceWorker.register('/scripts/mining-service-worker.js');
                console.log('✅ Service Worker registrado:', this.serviceWorker);
                
                // Escuchar mensajes del Service Worker
                navigator.serviceWorker.addEventListener('message', (event) => {
                    this.handleServiceWorkerMessage(event.data);
                });
                
            } catch (error) {
                console.error('❌ Error al registrar Service Worker:', error);
            }
        } else {
            console.warn('⚠️ Service Worker no soportado');
        }
    }
    
    connectToServiceWorker() {
        if (navigator.serviceWorker.controller) {
            // Solicitar estado actual
            navigator.serviceWorker.controller.postMessage({
                type: 'GET_MINING_STATUS'
            });
        }
    }
    
    handleServiceWorkerMessage(message) {
        const { type, data } = message;
        
        switch (type) {
            case 'MINING_STATUS':
                this.updateMiningStatus(data);
                break;
            case 'MINING_STARTED':
                this.onMiningStarted(data);
                break;
            case 'MINING_STOPPED':
                this.onMiningStopped(data);
                break;
            case 'MINING_PROGRESS':
                this.onMiningProgress(data);
                break;
            case 'DAILY_LIMIT_REACHED':
                this.onDailyLimitReached(data);
                break;
            case 'DAILY_LIMIT_RESET':
                this.onDailyLimitReset(data);
                break;
            case 'SESSION_COMPLETED':
                this.onSessionCompleted(data);
                break;
        }
    }
    
    updateMiningStatus(data) {
        this.miningActive = data.miningActive;
        this.miningStartTime = data.miningStartTime ? new Date(data.miningStartTime) : null;
        this.totalMinedRSC = data.totalMinedRSC;
        this.remainingLimit = data.remainingLimit;
        this.sessionTime = data.sessionTime;
        this.remainingSessionTime = data.remainingSessionTime || 0;
        this.sessionDuration = data.sessionDuration || (24 * 60 * 60 * 1000);
        this.lastResetDate = data.lastResetDate ? new Date(data.lastResetDate) : null;
        
        this.updateUI();
    }
    
    onMiningStarted(data) {
        this.miningActive = true;
        this.miningStartTime = new Date(data.startTime);
        this.totalMinedRSC = data.totalMined;
        
        this.updateUI();
        this.showNotification('⛏️ Minería iniciada', 'La minería automática está funcionando en segundo plano');
    }
    
    onMiningStopped(data) {
        this.miningActive = false;
        this.totalMinedRSC = data.totalMined;
        this.sessionTime = data.sessionDuration;
        
        this.updateUI();
        this.showNotification('⏹️ Minería detenida', 'La minería automática se ha detenido');
    }
    
    onMiningProgress(data) {
        this.totalMinedRSC = data.totalMined;
        this.remainingLimit = data.remaining;
        this.sessionTime = data.sessionTime;
        this.remainingSessionTime = data.remainingSessionTime || 0;
        this.sessionDuration = data.sessionDuration || (24 * 60 * 60 * 1000);
        
        this.updateProgressBar();
        this.updateMiningStats();
    }
    
    onDailyLimitReached(data) {
        this.miningActive = false;
        this.totalMinedRSC = data.totalMined;
        this.remainingLimit = 0;
        
        this.updateUI();
        this.showNotification('🚫 Límite diario alcanzado', 'Has minado el máximo de 1 RSC por día');
    }
    
    onDailyLimitReset(data) {
        this.totalMinedRSC = data.totalMined;
        this.remainingLimit = this.dailyLimit;
        this.lastResetDate = new Date(data.newDate);
        
        this.updateUI();
        this.showNotification('🔄 Límite diario reseteado', 'Puedes comenzar a minar nuevamente');
    }
    
    onSessionCompleted(data) {
        this.miningActive = false;
        this.totalMinedRSC = data.totalMined;
        this.sessionTime = data.sessionDuration;
        
        this.updateUI();
        this.showNotification('⏰ Sesión completada', 'Has completado las 24 horas de minería. Activa nuevamente para continuar.');
    }
    
    // ========================================
    // CONTROL DE MINERÍA
    // ========================================
    
    startMining() {
        if (this.miningActive) {
            console.log('⚠️ La minería ya está activa');
            return;
        }
        
        if (this.remainingLimit <= 0) {
            this.showNotification('🚫 Límite diario alcanzado', 'Espera hasta mañana para continuar minando');
            return;
        }
        
        // Verificar si ya se completó una sesión de 24 horas
        if (this.miningStartTime && (Date.now() - this.miningStartTime.getTime()) >= (24 * 60 * 60 * 1000)) {
            // Resetear para nueva sesión
            this.miningStartTime = null;
            this.sessionTime = 0;
        }
        
        if (navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({
                type: 'START_MINING',
                data: {}
            });
        }
        
        // También iniciar minería local para UI
        this.startLocalMining();
    }
    
    stopMining() {
        if (!this.miningActive) {
            console.log('⚠️ La minería no está activa');
            return;
        }
        
        if (navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({
                type: 'STOP_MINING'
            });
        }
        
        this.stopLocalMining();
    }
    
    startLocalMining() {
        this.miningActive = true;
        this.miningStartTime = new Date();
        this.updateUI();
        
        // Iniciar actualizaciones en tiempo real
        this.startRealTimeUpdates();
    }
    
    stopLocalMining() {
        this.miningActive = false;
        this.updateUI();
        this.stopRealTimeUpdates();
    }
    
    // ========================================
    // ACTUALIZACIONES EN TIEMPO REAL
    // ========================================
    
    startRealTimeUpdates() {
        this.updateInterval = setInterval(() => {
            if (this.miningActive) {
                this.updateSessionTime();
                this.updateProgressBar();
            }
        }, 1000);
    }
    
    stopRealTimeUpdates() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
    }
    
    updateSessionTime() {
        if (this.miningStartTime) {
            this.sessionTime = Date.now() - this.miningStartTime.getTime();
        }
    }
    
    // ========================================
    // INTERFAZ DE USUARIO
    // ========================================
    
    initializeUI() {
        // Buscar elementos de la UI
        this.progressBar = document.querySelector('.session-progress-fill');
        this.statusIndicator = document.querySelector('.connection-dot');
        this.miningStats = document.querySelectorAll('.stat-value');
        
        // Crear controles de minería automática
        this.createAutoMiningControls();
        
        // Crear indicadores de estado
        this.createStatusIndicators();
    }
    
    createAutoMiningControls() {
        const controlPanel = document.querySelector('.mining-controls');
        if (!controlPanel) return;
        
        // Botón de minería automática
        const autoMiningBtn = document.createElement('button');
        autoMiningBtn.className = 'control-button auto-mining';
        autoMiningBtn.innerHTML = `
            <span class="btn-icon">🤖</span>
            <span class="btn-text">Minería Automática</span>
        `;
        
        autoMiningBtn.addEventListener('click', () => {
            if (this.miningActive) {
                this.stopMining();
            } else {
                this.startMining();
            }
        });
        
        // Insertar después del botón de inicio
        const startBtn = controlPanel.querySelector('.control-button.start');
        if (startBtn) {
            startBtn.parentNode.insertBefore(autoMiningBtn, startBtn.nextSibling);
        }
        
        // Actualizar estilos del botón
        this.updateAutoMiningButton(autoMiningBtn);
    }
    
    createStatusIndicators() {
        const miningHeader = document.querySelector('.mining-header-content');
        if (!miningHeader) return;
        
        // Indicador de límite diario
        const dailyLimitIndicator = document.createElement('div');
        dailyLimitIndicator.className = 'daily-limit-indicator';
        dailyLimitIndicator.innerHTML = `
            <div class="limit-label">Límite Diario</div>
            <div class="limit-progress">
                <div class="limit-bar">
                    <div class="limit-fill" style="width: ${(this.totalMinedRSC / this.dailyLimit) * 100}%"></div>
                </div>
                <div class="limit-text">${this.totalMinedRSC.toFixed(4)} / ${this.dailyLimit} RSC</div>
            </div>
        `;
        
        // Indicador de tiempo de sesión
        const sessionTimeIndicator = document.createElement('div');
        sessionTimeIndicator.className = 'session-time-indicator';
        sessionTimeIndicator.innerHTML = `
            <div class="session-label">Tiempo de Sesión</div>
            <div class="session-progress">
                <div class="session-bar">
                    <div class="session-fill" style="width: 0%"></div>
                </div>
                <div class="session-text">24h disponibles</div>
            </div>
        `;
        
        // Insertar en el header
        const sessionProgress = miningHeader.querySelector('.session-progress-container');
        if (sessionProgress) {
            sessionProgress.parentNode.insertBefore(dailyLimitIndicator, sessionProgress.nextSibling);
            sessionProgress.parentNode.insertBefore(sessionTimeIndicator, dailyLimitIndicator.nextSibling);
        }
    }
    
    updateUI() {
        this.updateAutoMiningButton();
        this.updateStatusIndicator();
        this.updateProgressBar();
        this.updateMiningStats();
        this.updateDailyLimitIndicator();
        this.updateSessionTimeIndicator();
    }
    
    updateAutoMiningButton(button = null) {
        const btn = button || document.querySelector('.control-button.auto-mining');
        if (!btn) return;
        
        if (this.miningActive) {
            btn.className = 'control-button auto-mining active';
            btn.innerHTML = `
                <span class="btn-icon">⏹️</span>
                <span class="btn-text">Detener Automática</span>
            `;
            btn.style.background = 'linear-gradient(135deg, var(--accent-red), #dc2626)';
        } else {
            btn.className = 'control-button auto-mining';
            btn.innerHTML = `
                <span class="btn-icon">🤖</span>
                <span class="btn-text">Minería Automática</span>
            `;
            btn.style.background = 'linear-gradient(135deg, var(--accent-blue), #2563eb)';
        }
    }
    
    updateStatusIndicator() {
        if (!this.statusIndicator) return;
        
        if (this.miningActive) {
            this.statusIndicator.className = 'connection-dot';
            this.statusIndicator.style.background = 'var(--accent-green)';
        } else {
            this.statusIndicator.className = 'connection-dot disconnected';
            this.statusIndicator.style.background = 'var(--accent-red)';
        }
    }
    
    updateProgressBar() {
        if (!this.progressBar) return;
        
        if (this.miningStartTime) {
            // Mostrar progreso de la sesión (tiempo transcurrido vs 24 horas)
            const progress = Math.min((this.sessionTime / this.sessionDuration) * 100, 100);
            this.progressBar.style.width = `${progress}%`;
        }
    }
    
    updateMiningStats() {
        if (!this.miningStats || this.miningStats.length < 4) return;
        
        // Tokens minados
        if (this.miningStats[0]) {
            this.miningStats[0].textContent = this.totalMinedRSC.toFixed(6);
        }
        
        // Tiempo de sesión (mostrar tiempo restante)
        if (this.miningStats[3]) {
            if (this.miningActive && this.remainingSessionTime > 0) {
                const hours = Math.floor(this.remainingSessionTime / (1000 * 60 * 60));
                const minutes = Math.floor((this.remainingSessionTime % (1000 * 60 * 60)) / (1000 * 60));
                this.miningStats[3].textContent = `${hours}h ${minutes}m restantes`;
            } else if (this.miningActive) {
                this.miningStats[3].textContent = '0h 0m - Sesión completada';
            } else {
                this.miningStats[3].textContent = '24h disponibles';
            }
        }
    }
    
    updateDailyLimitIndicator() {
        const limitFill = document.querySelector('.limit-fill');
        const limitText = document.querySelector('.limit-text');
        
        if (limitFill) {
            const progress = Math.min((this.totalMinedRSC / this.dailyLimit) * 100, 100);
            limitFill.style.width = `${progress}%`;
        }
        
        if (limitText) {
            limitText.textContent = `${this.totalMinedRSC.toFixed(4)} / ${this.dailyLimit} RSC`;
        }
    }
    
    updateSessionTimeIndicator() {
        const sessionFill = document.querySelector('.session-fill');
        const sessionText = document.querySelector('.session-text');
        
        if (sessionFill && sessionText) {
            if (this.miningActive && this.remainingSessionTime > 0) {
                // Mostrar progreso de la sesión (tiempo restante)
                const progress = Math.max(0, ((this.sessionDuration - this.remainingSessionTime) / this.sessionDuration) * 100);
                sessionFill.style.width = `${progress}%`;
                
                const hours = Math.floor(this.remainingSessionTime / (1000 * 60 * 60));
                const minutes = Math.floor((this.remainingSessionTime % (1000 * 60 * 60)) / (1000 * 60));
                sessionText.textContent = `${hours}h ${minutes}m restantes`;
            } else if (this.miningActive) {
                // Sesión completada
                sessionFill.style.width = '100%';
                sessionText.textContent = '0h 0m - Sesión completada';
            } else {
                // No hay sesión activa
                sessionFill.style.width = '0%';
                sessionText.textContent = '24h disponibles';
            }
        }
    }
    
    // ========================================
    // PERSISTENCIA Y SINCRONIZACIÓN
    // ========================================
    
    loadSavedState() {
        const savedState = localStorage.getItem('rscMiningState');
        if (savedState) {
            const state = JSON.parse(savedState);
            this.miningActive = state.miningActive || false;
            this.miningStartTime = state.miningStartTime ? new Date(state.miningStartTime) : null;
            this.totalMinedRSC = state.totalMinedRSC || 0;
            this.lastResetDate = state.lastResetDate ? new Date(state.lastResetDate) : null;
            this.remainingLimit = this.dailyLimit - this.totalMinedRSC;
            
            this.updateUI();
        }
    }
    
    saveState() {
        const state = {
            miningActive: this.miningActive,
            miningStartTime: this.miningStartTime ? this.miningStartTime.toISOString() : null,
            totalMinedRSC: this.totalMinedRSC,
            lastResetDate: this.lastResetDate ? this.lastResetDate.toISOString() : null
        };
        
        localStorage.setItem('rscMiningState', JSON.stringify(state));
    }
    
    startUpdates() {
        // Actualizar cada 5 segundos
        setInterval(() => {
            this.updateUI();
            this.saveState();
        }, 5000);
    }
    
    // ========================================
    // NOTIFICACIONES
    // ========================================
    
    showNotification(title, message) {
        // Crear notificación personalizada
        const notification = document.createElement('div');
        notification.className = 'mining-notification';
        notification.innerHTML = `
            <div class="notification-header">
                <span class="notification-title">${title}</span>
                <button class="notification-close">×</button>
            </div>
            <div class="notification-message">${message}</div>
        `;
        
        // Agregar al DOM
        document.body.appendChild(notification);
        
        // Mostrar con animación
        setTimeout(() => notification.classList.add('show'), 100);
        
        // Auto-ocultar después de 5 segundos
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 5000);
        
        // Botón de cerrar
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        });
    }
}

// ========================================
// INICIALIZACIÓN
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    window.autoMiningSystem = new AutoMiningSystem();
});

console.log('🚀 Sistema de Minería Automática cargado');
