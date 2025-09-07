/**
 * RSC MINING UI SYSTEM
 * 
 * Sistema de interfaz de usuario para la minería RSC
 * - Control de botones y elementos
 * - Actualización en tiempo real
 * - Notificaciones y alertas
 * - Integración con el core de minería
 */

class RSCMiningUI {
    constructor() {
        this.core = null;
        this.elements = {};
        this.isInitialized = false;
        this.updateInterval = null;
        
        this.init();
    }

    /**
     * Inicializar el sistema de UI
     */
    async init() {
        console.log('🎨 Inicializando RSC Mining UI...');
        
        try {
            // Esperar a que el core esté disponible
            await this.waitForCore();
            
            // Configurar elementos del DOM
            this.setupElements();
            
            // Configurar event listeners
            this.setupEventListeners();
            
            // Configurar listeners del core
            this.setupCoreListeners();
            
            // Inicializar UI
            this.initializeUI();
            
            // Iniciar actualización automática
            this.startUpdateInterval();
            
            this.isInitialized = true;
            console.log('✅ RSC Mining UI inicializado correctamente');
            
        } catch (error) {
            console.error('❌ Error inicializando RSC Mining UI:', error);
        }
    }

    /**
     * Esperar a que el core esté disponible
     */
    async waitForCore() {
        let attempts = 0;
        const maxAttempts = 50; // 5 segundos máximo
        
        while (!window.RSCMiningCore && attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        
        if (!window.RSCMiningCore) {
            throw new Error('RSC Mining Core no disponible');
        }
        
        this.core = window.RSCMiningCore;
    }

    /**
     * Configurar elementos del DOM
     */
    setupElements() {
        this.elements = {
            // Botones principales
            startBtn: document.getElementById('startMiningBtn'),
            stopBtn: document.getElementById('stopMiningBtn'),
            
            // Estado de minería
            miningStatus: document.getElementById('miningStatus'),
            statusDot: document.querySelector('#miningStatus .status-dot'),
            statusText: document.querySelector('#miningStatus .status-text'),
            
            // Información de usuario
            userName: document.getElementById('userName'),
            userEmail: document.getElementById('userEmail'),
            userWallet: document.getElementById('userWallet'),
            userBalance: document.getElementById('userBalance'),
            
            // Estadísticas de minería
            hashRate: document.getElementById('hashRate'),
            minedAmount: document.getElementById('minedAmount'),
            activeTime: document.getElementById('activeTime'),
            
            // Estadísticas generales
            totalMined: document.getElementById('totalMined'),
            sessionTime: document.getElementById('sessionTime'),
            currentHashRate: document.getElementById('currentHashRate'),
            efficiency: document.getElementById('efficiency'),
            
            // Progreso de sesión
            progressBarFill: document.getElementById('progressBarFill'),
            progressPercentage: document.getElementById('progressPercentage'),
            progressTime: document.getElementById('progressTime'),
            
            // Estado de red
            networkStatus: document.getElementById('networkStatus'),
            networkStatusText: document.getElementById('networkStatusText'),
            miningStatusText: document.getElementById('miningStatusText'),
            
            // Modal de ayuda
            helpModal: document.getElementById('helpModal'),
            helpBtn: document.getElementById('helpBtn'),
            closeHelpModal: document.getElementById('closeHelpModal')
        };
        
        console.log('🎨 Elementos del DOM configurados');
    }

    /**
     * Configurar event listeners
     */
    setupEventListeners() {
        // Botón de inicio de minería
        if (this.elements.startBtn) {
            this.elements.startBtn.addEventListener('click', () => {
                this.handleStartMining();
            });
        }

        // Botón de parada de minería
        if (this.elements.stopBtn) {
            this.elements.stopBtn.addEventListener('click', () => {
                this.handleStopMining();
            });
        }

        // Botón de ayuda
        if (this.elements.helpBtn) {
            this.elements.helpBtn.addEventListener('click', () => {
                this.showHelpModal();
            });
        }

        // Cerrar modal de ayuda
        if (this.elements.closeHelpModal) {
            this.elements.closeHelpModal.addEventListener('click', () => {
                this.hideHelpModal();
            });
        }

        // Cerrar modal al hacer clic fuera
        if (this.elements.helpModal) {
            this.elements.helpModal.addEventListener('click', (e) => {
                if (e.target === this.elements.helpModal) {
                    this.hideHelpModal();
                }
            });
        }

        console.log('👂 Event listeners configurados');
    }

    /**
     * Configurar listeners del core
     */
    setupCoreListeners() {
        // Core inicializado
        this.core.on('coreInitialized', (data) => {
            this.handleCoreInitialized(data);
        });

        // Minería iniciada
        this.core.on('miningStarted', (data) => {
            this.handleMiningStarted(data);
        });

        // Minería detenida
        this.core.on('miningStopped', (data) => {
            this.handleMiningStopped(data);
        });

        // Actualización de minería
        this.core.on('miningUpdate', (data) => {
            this.handleMiningUpdate(data);
        });

        // Actualización de estadísticas
        this.core.on('statsUpdate', (data) => {
            this.handleStatsUpdate(data);
        });

        // Actualización de wallet
        this.core.on('walletBalanceUpdated', (data) => {
            this.handleWalletUpdate(data);
        });

        // Sesión restaurada
        this.core.on('sessionRestored', (data) => {
            this.handleSessionRestored(data);
        });

        // Sesión expirada
        this.core.on('sessionExpired', (data) => {
            this.handleSessionExpired(data);
        });

        // Error del core
        this.core.on('coreError', (data) => {
            this.handleCoreError(data);
        });

        console.log('🔗 Listeners del core configurados');
    }

    /**
     * Inicializar UI
     */
    initializeUI() {
        // Sincronizar balance inicial
        if (this.core) {
            this.core.syncWalletBalance();
        }
        
        // Actualizar estado inicial
        this.updateUI();
        
        // Configurar información de usuario
        this.setupUserInfo();
        
        console.log('🎨 UI inicializada');
    }

    /**
     * Configurar información de usuario
     */
    setupUserInfo() {
        // Información de usuario de prueba
        const userInfo = {
            name: 'RSC Miner',
            email: 'miner@rscchain.com',
            wallet: '0x' + Math.random().toString(16).substr(2, 40),
            balance: this.getCurrentWalletBalance()
        };

        if (this.elements.userName) {
            this.elements.userName.textContent = userInfo.name;
        }
        if (this.elements.userEmail) {
            this.elements.userEmail.textContent = userInfo.email;
        }
        if (this.elements.userWallet) {
            this.elements.userWallet.textContent = userInfo.wallet;
        }
        if (this.elements.userBalance) {
            this.elements.userBalance.textContent = userInfo.balance.toFixed(6) + ' RSC';
        }
    }

    /**
     * Obtener balance actual de la wallet
     */
    getCurrentWalletBalance() {
        try {
            const balance = localStorage.getItem('rsc_wallet_balance');
            return balance ? parseFloat(balance) : 0;
        } catch (error) {
            console.error('❌ Error obteniendo balance de wallet:', error);
            return 0;
        }
    }

    /**
     * Manejar inicio de minería
     */
    async handleStartMining() {
        try {
            const result = await this.core.startMining();
            
            if (result.success) {
                this.showNotification('success', 'Minería Iniciada', 
                    'Has comenzado a minar RSC. La sesión durará 24 horas.');
            } else {
                this.showNotification('error', 'Error', result.message);
            }
        } catch (error) {
            console.error('❌ Error iniciando minería:', error);
            this.showNotification('error', 'Error', 'No se pudo iniciar la minería');
        }
    }

    /**
     * Manejar parada de minería
     */
    async handleStopMining() {
        try {
            const result = await this.core.stopMining();
            
            if (result.success) {
                this.showNotification('info', 'Minería Detenida', 
                    'La minería ha sido detenida. Los tokens han sido guardados.');
            } else {
                this.showNotification('error', 'Error', result.message);
            }
        } catch (error) {
            console.error('❌ Error deteniendo minería:', error);
            this.showNotification('error', 'Error', 'No se pudo detener la minería');
        }
    }

    /**
     * Manejar core inicializado
     */
    handleCoreInitialized(data) {
        console.log('🔄 Core inicializado, actualizando UI...');
        this.updateUI();
    }

    /**
     * Manejar minería iniciada
     */
    handleMiningStarted(data) {
        console.log('🚀 Minería iniciada desde UI');
        this.updateUI();
        this.showNotification('success', 'Minería Iniciada', 
            `Sesión ${data.sessionId} iniciada correctamente`);
    }

    /**
     * Manejar minería detenida
     */
    handleMiningStopped(data) {
        console.log('⏹️ Minería detenida desde UI');
        this.updateUI();
        this.showNotification('info', 'Minería Detenida', 
            `Sesión completada. Total minado: ${data.finalStats.sessionMined.toFixed(6)} RSC`);
    }

    /**
     * Manejar actualización de minería
     */
    handleMiningUpdate(data) {
        this.updateMiningStats(data.stats);
        this.updateProgress(data.stats);
    }

    /**
     * Manejar actualización de estadísticas
     */
    handleStatsUpdate(data) {
        this.updateMiningStats(data.stats);
    }

    /**
     * Manejar actualización de wallet
     */
    handleWalletUpdate(data) {
        // Actualizar balance en la UI (sin notificaciones)
        if (this.elements.userBalance) {
            this.elements.userBalance.textContent = data.balance.toFixed(6) + ' RSC';
        }
    }

    /**
     * Manejar sesión restaurada
     */
    handleSessionRestored(data) {
        console.log('🔄 Sesión restaurada desde UI');
        this.updateUI();
        this.showNotification('info', 'Sesión Restaurada', 
            'Tu sesión de minería ha sido restaurada automáticamente');
    }

    /**
     * Manejar sesión expirada
     */
    handleSessionExpired(data) {
        console.log('⏰ Sesión expirada desde UI');
        this.updateUI();
        this.showNotification('warning', 'Sesión Expirada', 
            'La sesión de 24 horas ha terminado. Puedes iniciar una nueva sesión.');
    }

    /**
     * Manejar error del core
     */
    handleCoreError(data) {
        console.error('❌ Error del core:', data.error);
        this.showNotification('error', 'Error del Sistema', data.error);
    }

    /**
     * Actualizar UI completa
     */
    updateUI() {
        const status = this.core.getStatus();
        
        // Actualizar botones
        this.updateButtons(status.isMining);
        
        // Actualizar estado de minería
        this.updateMiningStatus(status.isMining);
        
        // Actualizar estadísticas
        this.updateMiningStats(status.stats);
        
        // Actualizar progreso
        this.updateProgress(status.stats);
        
        // Actualizar estado de red
        this.updateNetworkStatus(status.isBackendConnected);
    }

    /**
     * Actualizar botones
     */
    updateButtons(isMining) {
        if (this.elements.startBtn) {
            this.elements.startBtn.disabled = isMining;
            this.elements.startBtn.classList.toggle('hidden', isMining);
        }
        
        if (this.elements.stopBtn) {
            this.elements.stopBtn.disabled = !isMining;
            this.elements.stopBtn.classList.toggle('hidden', !isMining);
        }
    }

    /**
     * Actualizar estado de minería
     */
    updateMiningStatus(isMining) {
        if (this.elements.statusDot) {
            this.elements.statusDot.className = `status-dot ${isMining ? 'online' : 'offline'}`;
        }
        
        if (this.elements.statusText) {
            this.elements.statusText.textContent = isMining ? 'Active' : 'Stopped';
        }
        
        if (this.elements.miningStatusText) {
            this.elements.miningStatusText.textContent = isMining ? 'Mining' : 'Ready';
        }
    }

    /**
     * Actualizar estadísticas de minería
     */
    updateMiningStats(stats) {
        // Hash rate
        if (this.elements.hashRate) {
            this.elements.hashRate.textContent = this.formatHashRate(stats.hashRate);
        }
        
        if (this.elements.currentHashRate) {
            this.elements.currentHashRate.textContent = this.formatHashRate(stats.hashRate);
        }
        
        // Tokens minados
        if (this.elements.minedAmount) {
            this.elements.minedAmount.textContent = stats.sessionMined.toFixed(6) + ' RSC';
        }
        
        if (this.elements.totalMined) {
            this.elements.totalMined.textContent = stats.totalMined.toFixed(6) + ' RSC';
        }
        
        // Tiempo activo
        if (this.elements.activeTime) {
            this.elements.activeTime.textContent = this.formatTime(stats.activeTime);
        }
        
        if (this.elements.sessionTime) {
            this.elements.sessionTime.textContent = this.formatTime(stats.activeTime);
        }
        
        // Eficiencia
        if (this.elements.efficiency) {
            this.elements.efficiency.textContent = stats.efficiency.toFixed(0) + '%';
        }
    }

    /**
     * Actualizar progreso de sesión
     */
    updateProgress(stats) {
        const status = this.core.getStatus();
        
        if (status.startTime && status.endTime) {
            const now = Date.now();
            const elapsed = now - status.startTime;
            const total = status.endTime - status.startTime;
            const progress = Math.min((elapsed / total) * 100, 100);
            
            // Actualizar barra de progreso
            if (this.elements.progressBarFill) {
                this.elements.progressBarFill.style.width = progress + '%';
            }
            
            // Actualizar porcentaje
            if (this.elements.progressPercentage) {
                this.elements.progressPercentage.textContent = progress.toFixed(1) + '%';
            }
            
            // Actualizar tiempo restante
            if (this.elements.progressTime) {
                const remaining = Math.max(status.endTime - now, 0);
                const hours = Math.floor(remaining / (1000 * 60 * 60));
                const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
                this.elements.progressTime.textContent = `${hours}h ${minutes}m restantes`;
            }
        }
    }

    /**
     * Actualizar estado de red
     */
    updateNetworkStatus(isConnected) {
        if (this.elements.networkStatus) {
            this.elements.networkStatus.className = `status-dot ${isConnected ? 'online' : 'offline'}`;
        }
        
        if (this.elements.networkStatusText) {
            this.elements.networkStatusText.textContent = isConnected ? 'Connected' : 'Offline';
        }
    }

    /**
     * Iniciar intervalo de actualización
     */
    startUpdateInterval() {
        this.updateInterval = setInterval(() => {
            if (this.isInitialized) {
                this.updateUI();
            }
        }, 1000); // Cada segundo
    }

    /**
     * Detener intervalo de actualización
     */
    stopUpdateInterval() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
    }

    /**
     * Mostrar modal de ayuda
     */
    showHelpModal() {
        if (this.elements.helpModal) {
            this.elements.helpModal.classList.add('active');
        }
    }

    /**
     * Ocultar modal de ayuda
     */
    hideHelpModal() {
        if (this.elements.helpModal) {
            this.elements.helpModal.classList.remove('active');
        }
    }

    /**
     * Mostrar notificación
     */
    showNotification(type, title, message) {
        // Crear notificación
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <div class="notification-title">${title}</div>
                <div class="notification-message">${message}</div>
            </div>
        `;

        // Agregar estilos si no existen
        if (!document.getElementById('notification-styles')) {
            const styles = document.createElement('style');
            styles.id = 'notification-styles';
            styles.textContent = `
                .notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    padding: 15px 20px;
                    border-radius: 10px;
                    color: white;
                    font-weight: bold;
                    z-index: 10000;
                    max-width: 350px;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
                    animation: slideIn 0.3s ease-out;
                }
                .notification.success { background: linear-gradient(45deg, #4caf50, #45a049); }
                .notification.error { background: linear-gradient(45deg, #f44336, #d32f2f); }
                .notification.warning { background: linear-gradient(45deg, #ff9800, #f57c00); }
                .notification.info { background: linear-gradient(45deg, #2196f3, #1976d2); }
                .notification-title { font-size: 14px; margin-bottom: 5px; }
                .notification-message { font-size: 12px; opacity: 0.9; }
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `;
            document.head.appendChild(styles);
        }

        // Agregar al DOM
        document.body.appendChild(notification);

        // Remover después de 5 segundos
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 5000);
    }

    /**
     * Formatear hash rate
     */
    formatHashRate(hashRate) {
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
    formatTime(milliseconds) {
        const seconds = Math.floor(milliseconds / 1000);
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    /**
     * Destruir instancia
     */
    destroy() {
        this.stopUpdateInterval();
        console.log('✅ RSC Mining UI destruido');
    }
}

// Inicializar UI cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.RSCMiningUI = new RSCMiningUI();
});

// Exportar para uso en módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RSCMiningUI;
}
