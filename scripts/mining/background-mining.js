/* ================================
   BACKGROUND MINING INTEGRATION
================================ */

/**
 * 🔄 INTEGRACIÓN DE MINERÍA EN SEGUNDO PLANO
 * 
 * Conecta la página principal con el Service Worker
 * para permitir minería continua en background
 */

class BackgroundMiningManager {
    constructor() {
        this.serviceWorker = null;
        this.isSupported = 'serviceWorker' in navigator;
        this.isBackgroundActive = false;
        this.backgroundData = {
            tokensMinedInBackground: 0,
            startTime: null,
            sessionId: null
        };
        
        this.init();
    }

    async init() {
        if (!this.isSupported) {
            console.warn('⚠️ Service Workers no soportados en este navegador');
            return;
        }

        try {
            // Registrar Service Worker
            const registration = await navigator.serviceWorker.register('/background-mining-sw.js', {
                scope: '/'
            });

            console.log('✅ Service Worker registrado:', registration.scope);

            // Esperar a que esté activo
            await this.waitForServiceWorker(registration);

            // Configurar listeners
            this.setupMessageListeners();
            this.setupVisibilityListeners();

            // Solicitar permisos de notificación
            await this.requestNotificationPermission();

            console.log('🚀 Background Mining Manager inicializado');

        } catch (error) {
            console.error('❌ Error registrando Service Worker:', error);
        }
    }

    async waitForServiceWorker(registration) {
        return new Promise((resolve) => {
            if (registration.active) {
                this.serviceWorker = registration.active;
                resolve();
            } else {
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'activated') {
                            this.serviceWorker = newWorker;
                            resolve();
                        }
                    });
                });
            }
        });
    }

    setupMessageListeners() {
        navigator.serviceWorker.addEventListener('message', (event) => {
            const { type, data } = event.data;

            switch (type) {
                case 'BACKGROUND_MINING_UPDATE':
                    this.handleBackgroundUpdate(data);
                    break;
                case 'BACKGROUND_MINING_COMPLETE':
                    this.handleBackgroundComplete(data);
                    break;
                case 'BACKGROUND_STATUS':
                    this.handleBackgroundStatus(data);
                    break;
                case 'BACKGROUND_SYNC_COMPLETE':
                    this.handleBackgroundSync(data);
                    break;
            }
        });
    }

    setupVisibilityListeners() {
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                // Página va a segundo plano
                this.onPageHidden();
            } else {
                // Página vuelve a primer plano
                this.onPageVisible();
            }
        });

        // También escuchar cuando la ventana pierde/gana foco
        window.addEventListener('blur', () => this.onPageHidden());
        window.addEventListener('focus', () => this.onPageVisible());
    }

    async requestNotificationPermission() {
        if ('Notification' in window) {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                console.log('✅ Permisos de notificación concedidos');
            } else {
                console.warn('⚠️ Permisos de notificación denegados');
            }
        }
    }

    // Iniciar minería en segundo plano
    async startBackgroundMining(config = {}) {
        if (!this.serviceWorker) {
            console.warn('⚠️ Service Worker no disponible');
            return false;
        }

        const miningConfig = {
            sessionId: this.generateSessionId(),
            baseRate: config.baseRate || 0.1,
            hashRate: config.hashRate || 100,
            efficiency: config.efficiency || 100,
            algorithm: config.algorithm || 'sha256',
            ...config
        };

        this.sendToServiceWorker('START_BACKGROUND_MINING', miningConfig);
        
        this.isBackgroundActive = true;
        this.backgroundData.sessionId = miningConfig.sessionId;
        this.backgroundData.startTime = Date.now();

        console.log('🚀 Minería en segundo plano iniciada');
        return true;
    }

    // Detener minería en segundo plano
    stopBackgroundMining() {
        if (!this.serviceWorker) return;

        this.sendToServiceWorker('STOP_BACKGROUND_MINING');
        this.isBackgroundActive = false;

        console.log('⏹️ Minería en segundo plano detenida');
    }

    // Actualizar configuración de minería
    updateMiningConfig(config) {
        if (!this.serviceWorker || !this.isBackgroundActive) return;

        this.sendToServiceWorker('UPDATE_MINING_CONFIG', config);
        console.log('⚙️ Configuración de minería actualizada');
    }

    // Obtener estado actual
    async getBackgroundStatus() {
        if (!this.serviceWorker) return null;

        return new Promise((resolve) => {
            const timeout = setTimeout(() => resolve(null), 5000);
            
            const handler = (event) => {
                if (event.data.type === 'BACKGROUND_STATUS') {
                    clearTimeout(timeout);
                    navigator.serviceWorker.removeEventListener('message', handler);
                    resolve(event.data.data);
                }
            };

            navigator.serviceWorker.addEventListener('message', handler);
            this.sendToServiceWorker('GET_BACKGROUND_STATUS');
        });
    }

    // Manejar eventos del Service Worker
    handleBackgroundUpdate(data) {
        this.backgroundData.tokensMinedInBackground = data.tokensMinedInBackground;
        
        // Actualizar UI si está visible
        if (!document.hidden) {
            this.updateBackgroundUI(data);
        }

        // Disparar evento personalizado
        window.dispatchEvent(new CustomEvent('backgroundMiningUpdate', { detail: data }));
    }

    handleBackgroundComplete(data) {
        this.isBackgroundActive = false;
        this.backgroundData = { ...this.backgroundData, ...data };

        // Agregar tokens al balance principal
        if (window.supabaseIntegration && data.tokensMinedInBackground > 0) {
            window.supabaseIntegration.addBalance(data.tokensMinedInBackground);
        }

        // Actualizar logros
        if (window.achievementSystem && data.tokensMinedInBackground > 0) {
            window.achievementSystem.updateStats({
                tokens_mined: data.tokensMinedInBackground,
                mining_sessions: 1
            });
        }

        // Mostrar notificación en la UI
        this.showBackgroundCompleteNotification(data);

        // Disparar evento personalizado
        window.dispatchEvent(new CustomEvent('backgroundMiningComplete', { detail: data }));
    }

    handleBackgroundStatus(data) {
        this.isBackgroundActive = data.isActive;
        this.backgroundData = { ...this.backgroundData, ...data };
        
        // Actualizar UI
        this.updateBackgroundStatusUI(data);
    }

    handleBackgroundSync(data) {
        console.log('🔄 Sincronización de segundo plano completada:', data);
        
        // Disparar evento personalizado
        window.dispatchEvent(new CustomEvent('backgroundSync', { detail: data }));
    }

    // Eventos de visibilidad
    onPageHidden() {
        console.log('📱 Página en segundo plano');
        
        // ARREGLO TEMPORAL: Solo continuar la minería local en background
        if (window.supabaseIntegration?.miningSession?.isActive) {
            console.log('⛏️ Continuando minería en segundo plano (modo simple)');
            // La minería continuará automáticamente porque se basa en tiempo transcurrido
            // No necesitamos Service Worker para esto
        }
    }

    onPageVisible() {
        console.log('👀 Página visible');
        
        // ARREGLO: Forzar actualización de minería al volver
        if (window.supabaseIntegration?.miningSession?.isActive) {
            console.log('🔄 Actualizando minería al volver a la página...');
            
            // Simular una actualización de stats para recalcular tokens
            const currentHashRate = window.supabaseIntegration.miningSession.hashRate || 100;
            const currentEfficiency = window.supabaseIntegration.miningSession.efficiency || 100;
            
            // Forzar actualización
            window.supabaseIntegration.updateMiningStats(0, currentHashRate, currentEfficiency);
            
            // Actualizar UI si existe
            if (window.updateMiningUI) {
                window.updateMiningUI();
            }
        }
    }

    // Funciones de UI
    updateBackgroundUI(data) {
        // Actualizar indicador de minería en background
        const backgroundIndicator = document.getElementById('backgroundMiningIndicator');
        if (backgroundIndicator) {
            backgroundIndicator.innerHTML = `
                <i class="fas fa-mobile-alt"></i>
                <span>Minería en segundo plano: ${data.tokensMinedInBackground.toFixed(4)} RSC</span>
            `;
            backgroundIndicator.style.display = 'block';
        }
    }

    updateBackgroundStatusUI(data) {
        const statusElement = document.getElementById('backgroundStatus');
        if (statusElement) {
            statusElement.innerHTML = data.isActive ? 
                `<i class="fas fa-check-circle" style="color: #4CAF50;"></i> Minería en segundo plano activa` :
                `<i class="fas fa-pause-circle" style="color: #888;"></i> Minería en segundo plano inactiva`;
        }
    }

    showBackgroundCompleteNotification(data) {
        // Crear notificación en la UI
        const notification = document.createElement('div');
        notification.className = 'background-mining-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-mobile-alt" style="color: #4CAF50;"></i>
                <div class="notification-text">
                    <h4>¡Minería en Segundo Plano Completada!</h4>
                    <p>Has minado ${data.tokensMinedInBackground.toFixed(4)} RSC mientras estabas ausente</p>
                </div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Mostrar con animación
        setTimeout(() => notification.classList.add('show'), 100);
        
        // Remover después de 8 segundos
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 8000);
    }

    // Utilidades
    sendToServiceWorker(type, data = {}) {
        if (this.serviceWorker) {
            this.serviceWorker.postMessage({ type, data });
        }
    }

    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // Getters públicos
    getBackgroundData() {
        return { ...this.backgroundData };
    }

    isBackgroundMiningActive() {
        return this.isBackgroundActive;
    }

    isBackgroundMiningSupported() {
        return this.isSupported;
    }
}

// Crear instancia global
window.backgroundMiningManager = new BackgroundMiningManager();

console.log('🔄 Background Mining Manager cargado');
