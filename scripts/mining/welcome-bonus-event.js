/**
 * 🚀 WELCOME BONUS EVENT v2.0 - Click & Earn System
 * Sistema completamente automático sin verificación manual
 * Recompensa: 50 RSK por completar acciones sociales
 * Características: Instantáneo, gamificado, sin fricción
 */

class WelcomeBonusEvent {
    constructor() {
        // Configuración del evento
        this.config = {
            name: 'Welcome Bonus v2.0',
            reward: 50, // 50 RSK por completar
            rewardCurrency: 'RSK',
            maxSlots: 50000, // Aumentado para más usuarios
            duration: 30, // 30 días
            requiredActions: ['follow_twitter', 'join_telegram'],
            socialLinks: {
                twitter: 'https://x.com/Reeskcap?t=-wkiQaKEX_AwJzV-6QhQag&s=09',
                telegram: 'https://t.me/RSCchain'
            }
        };

        // Estado del evento global
        this.eventState = {
            id: 'welcome_bonus_v2',
            startDate: new Date(),
            endDate: new Date(Date.now() + this.config.duration * 24 * 60 * 60 * 1000),
            claimedCount: 0,
            isActive: true
        };

        // Estado del usuario
        this.userState = {
            hasSeenBanner: false,
            hasCompletedActions: {
                follow_twitter: false,
                join_telegram: false
            },
            hasClaimedReward: false,
            claimDate: null,
            deviceId: this.generateDeviceId(),
            lastActivity: new Date()
        };

        // Sistema de notificaciones
        this.notifications = [];

        // Metadatos por acción para mensajes claros
        this.actionMeta = {
            follow_twitter: {
                pendingStatus: 'Click to follow on X',
                completedStatus: 'Followed on X',
                successMessage: '✅ Thanks for following us on X!'
            },
            join_telegram: {
                pendingStatus: 'Click to join our Telegram',
                completedStatus: 'Joined Telegram',
                successMessage: '✅ Thanks for joining our Telegram community!'
            }
        };

        // Inicializar el evento
        this.initialize();
    }

    async initialize() {
        console.log('🚀 Inicializando Welcome Bonus Event v2.0...');

        try {
            // Cargar estado guardado
            await this.loadSavedState();
            console.log('📥 Estado inicial cargado:', this.userState);

            // Verificar elementos DOM
            await this.waitForDOM();
            console.log('✅ DOM listo');

            // Configurar event listeners
            this.setupEventListeners();

            // Mostrar banner si es necesario
            this.checkBannerDisplay();

            // Actualizar UI
            this.updateUI();
            console.log('🎨 UI inicial actualizada');

            console.log('✅ Welcome Bonus Event v2.0 inicializado correctamente');
            console.log('🎯 Estado final:', {
                hasCompletedActions: this.userState.hasCompletedActions,
                hasClaimedReward: this.userState.hasClaimedReward,
                canClaim: this.checkClaimEligibility()
            });

        } catch (error) {
            console.error('❌ Error inicializando Welcome Bonus Event:', error);
        }
    }

    // ========== SISTEMA DE CARGA Y GUARDADO ==========

    async loadSavedState() {
        try {
            // Cargar estado del evento
            const savedEventState = localStorage.getItem('welcome_bonus_event_state');
            if (savedEventState) {
                const parsed = JSON.parse(savedEventState);
                this.eventState = { ...this.eventState, ...parsed };
                // Convertir fechas de string a Date objects
                this.eventState.startDate = new Date(this.eventState.startDate);
                this.eventState.endDate = new Date(this.eventState.endDate);
            }

            // Cargar estado del usuario
            const savedUserState = localStorage.getItem('welcome_bonus_user_state');
            if (savedUserState) {
                const parsed = JSON.parse(savedUserState);
                this.userState = { ...this.userState, ...parsed };
                if (parsed.lastActivity) {
                    this.userState.lastActivity = new Date(parsed.lastActivity);
                }
                if (parsed.claimDate) {
                    this.userState.claimDate = new Date(parsed.claimDate);
                }
            }

            console.log('📥 Estado cargado desde localStorage');
        } catch (error) {
            console.warn('⚠️ Error cargando estado guardado:', error);
        }
    }

    saveState() {
        try {
            localStorage.setItem('welcome_bonus_event_state', JSON.stringify(this.eventState));
            localStorage.setItem('welcome_bonus_user_state', JSON.stringify(this.userState));
            console.log('💾 Estado guardado en localStorage');
        } catch (error) {
            console.error('❌ Error guardando estado:', error);
        }
    }

    // ========== UTILIDADES ==========

    generateDeviceId() {
        try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.font = '14px Arial';
                ctx.fillText('device_fingerprint', 2, 2);
                return btoa(canvas.toDataURL()).substring(0, 16);
            }
        } catch (error) {
            console.warn('Canvas fingerprinting not available');
        }
        // Fallback: generar ID simple
        return Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
    }

    async waitForDOM() {
        return new Promise((resolve) => {
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', resolve);
            } else {
                // Pequeño delay para asegurar que todo esté listo
                setTimeout(resolve, 100);
            }
        });
    }

    // ========== SISTEMA DE ACCIONES SOCIALES ==========

    setupEventListeners() {
        console.log('🎧 Configurando event listeners...');

        // Botones sociales
        const twitterBtn = document.querySelector('[data-action="follow_twitter"]');
        const telegramBtn = document.querySelector('[data-action="join_telegram"]');
        const claimBtn = document.getElementById('claimWelcomeBonus');

        console.log('🔍 Elementos encontrados:', {
            twitterBtn: !!twitterBtn,
            telegramBtn: !!telegramBtn,
            claimBtn: !!claimBtn
        });

        if (twitterBtn) {
            twitterBtn.addEventListener('click', () => {
                console.log('🐦 Twitter button clicked');
                this.handleSocialAction('follow_twitter');
            });
            console.log('✅ Twitter button listener attached');
        } else {
            console.error('❌ Twitter button not found');
        }

        if (telegramBtn) {
            telegramBtn.addEventListener('click', () => {
                console.log('📱 Telegram button clicked');
                this.handleSocialAction('join_telegram');
            });
            console.log('✅ Telegram button listener attached');
        } else {
            console.error('❌ Telegram button not found');
        }

        if (claimBtn) {
            claimBtn.addEventListener('click', () => {
                console.log('🎁 Claim button clicked');
                this.claimReward();
            });
            console.log('✅ Claim button listener attached');
        } else {
            console.error('❌ Claim button not found');
        }

        // Banner
        const bannerClose = document.getElementById('bannerClose');
        if (bannerClose) {
            bannerClose.addEventListener('click', () => this.hideBanner());
        }
    }

    async handleSocialAction(actionType) {
        console.log(`🔗 Ejecutando acción social: ${actionType}`);

        // Evitar acciones duplicadas
        if (this.userState.hasCompletedActions[actionType]) {
            this.showNotification('You have already completed this action!', 'info');
            return;
        }

        // Abrir link correspondiente
        const links = {
            follow_twitter: this.config.socialLinks.twitter,
            join_telegram: this.config.socialLinks.telegram
        };

        if (links[actionType]) {
            window.open(links[actionType], '_blank', 'noopener,noreferrer');
        }

        // Marcar como completado inmediatamente
        this.userState.hasCompletedActions[actionType] = true;
        this.userState.lastActivity = new Date();

        // Guardar estado
        this.saveState();

        // Actualizar UI
        this.updateUI();

        // Notificación de éxito
        const meta = this.actionMeta[actionType] || {};
        this.showNotification(meta.successMessage || '✅ Action completed!', 'success');

        // Verificar si puede reclamar recompensa
        this.checkClaimEligibility();
    }

    // ========== SISTEMA DE RECOMPENSAS ==========

    checkClaimEligibility() {
        const allCompleted = Object.values(this.userState.hasCompletedActions).every(completed => completed);
        const canClaim = allCompleted && !this.userState.hasClaimedReward && this.eventState.isActive;

        console.log('🎯 Verificando elegibilidad para claim:', { allCompleted, canClaim });

        return canClaim;
    }

    async claimReward() {
        console.log('🎁 Intentando reclamar recompensa...');

        // Validaciones
        if (this.userState.hasClaimedReward) {
            this.showNotification('You have already claimed your reward!', 'warning');
            return;
        }

        if (!this.checkClaimEligibility()) {
            this.showNotification('Complete all social actions first!', 'warning');
            return;
        }

        if (this.eventState.claimedCount >= this.config.maxSlots) {
            this.showNotification('Sorry, all rewards have been claimed!', 'error');
            this.eventState.isActive = false;
            this.saveState();
            this.updateUI();
            return;
        }

        try {
            // Mostrar loading
            this.showLoading(true);

            // Agregar recompensa local
            const success = await this.addLocalBalance(this.config.reward);

            if (success) {
                // Actualizar estados
                this.userState.hasClaimedReward = true;
                this.userState.claimDate = new Date();
                this.eventState.claimedCount++;

                // Sincronizar con servidor si está disponible
                if (window.supabaseIntegration?.user?.isAuthenticated) {
                    try {
                        await window.supabaseIntegration.addBalance(this.config.reward);
                        await this.syncEventData();
                    } catch (error) {
                        console.warn('⚠️ No se pudo sincronizar con servidor, pero balance local guardado');
                    }
                }

                // Guardar estado
                this.saveState();

                // Actualizar UI
                this.updateUI();

                // Notificación de éxito
                this.showSuccessCelebration();

                console.log('🎉 Recompensa reclamada exitosamente!');
            } else {
                throw new Error('Failed to add balance');
            }

        } catch (error) {
            console.error('❌ Error reclamando recompensa:', error);
            this.showNotification('Failed to claim reward. Please try again.', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    async addLocalBalance(amount) {
        try {
            const currentBalance = parseFloat(localStorage.getItem('rsc_user_balance') || '0');
            const newBalance = currentBalance + amount;

            localStorage.setItem('rsc_user_balance', newBalance.toString());

            // Agregar al historial
            const history = JSON.parse(localStorage.getItem('rsc_balance_history') || '[]');
            history.push({
                type: 'welcome_bonus_v2',
                amount: amount,
                timestamp: new Date().toISOString(),
                description: `Welcome Bonus v2.0 - ${amount} ${this.config.rewardCurrency}`
            });
            localStorage.setItem('rsc_balance_history', JSON.stringify(history));

            console.log(`💰 Balance actualizado: ${currentBalance} → ${newBalance} ${this.config.rewardCurrency}`);
            return true;

        } catch (error) {
            console.error('❌ Error agregando balance local:', error);
            return false;
        }
    }

    async syncEventData() {
        // Sincronizar con servidor si es necesario
        try {
            if (window.supabaseIntegration?.user?.isAuthenticated) {
                await window.supabaseIntegration.makeRequest('POST', '/rest/v1/bonuses', {
                    user_id: window.supabaseIntegration.user.id,
                    bonus_type: 'welcome_bonus_v2',
                    amount: this.config.reward,
                    is_claimed: true,
                    metadata: {
                        event_id: this.eventState.id,
                        claimed_at: new Date().toISOString(),
                        device_id: this.userState.deviceId
                    }
                });
            }
        } catch (error) {
            console.warn('⚠️ Error sincronizando con servidor:', error);
        }
    }

    // ========== SISTEMA DE UI ==========

    updateUI() {
        this.updateActionButtons();
        this.updateClaimButton();
        this.updateProgressIndicator();
        this.updateStats();
    }

    updateActionButtons() {
        const actions = ['follow_twitter', 'join_telegram'];

        actions.forEach(action => {
            const button = document.querySelector(`[data-action="${action}"]`);
            if (!button) return;

            const meta = this.actionMeta[action] || {};
            const isCompleted = this.userState.hasCompletedActions[action];
            const statusSpan = button.querySelector('[data-action-status]');
            const titleSpan = button.querySelector('.btn-title');

            if (isCompleted) {
                button.classList.add('completed');
                button.disabled = true;

                if (statusSpan) {
                    statusSpan.textContent = meta.completedStatus || 'Completed';
                }

                if (titleSpan && meta.completedStatus) {
                    titleSpan.setAttribute('aria-label', meta.completedStatus);
                }
            } else {
                button.classList.remove('completed');
                button.disabled = false;

                if (statusSpan) {
                    statusSpan.textContent = meta.pendingStatus || 'Click to complete';
                }

                if (titleSpan && meta.pendingStatus) {
                    titleSpan.setAttribute('aria-label', meta.pendingStatus);
                }
            }
        });
    }

    updateClaimButton() {
        const claimBtn = document.getElementById('claimWelcomeBonus');
        if (!claimBtn) return;

        const canClaim = this.checkClaimEligibility();

        if (canClaim) {
            claimBtn.style.display = 'flex';
            claimBtn.innerHTML = `<i class="fas fa-gift"></i> <span>🎉 Claim ${this.config.reward} ${this.config.rewardCurrency}!</span>`;
            claimBtn.disabled = false;
            claimBtn.classList.add('pulse');
        } else if (this.userState.hasClaimedReward) {
            claimBtn.style.display = 'none'; // Ocultar si ya reclamó
        } else {
            claimBtn.style.display = 'flex';
            claimBtn.innerHTML = `<i class="fas fa-clock"></i> <span>Complete Actions First</span>`;
            claimBtn.disabled = true;
            claimBtn.classList.remove('pulse');
        }
    }

    updateProgressIndicator() {
        const progressBar = document.getElementById('welcomeProgressBar');
        const progressText = document.getElementById('welcomeProgressText');

        if (!progressBar || !progressText) return;

        const completedActions = Object.values(this.userState.hasCompletedActions).filter(Boolean).length;
        const totalActions = Object.keys(this.userState.hasCompletedActions).length;
        const progress = (completedActions / totalActions) * 100;

        progressBar.style.width = `${progress}%`;
        progressText.textContent = `${completedActions}/${totalActions} actions completed`;
    }

    updateStats() {
        const statsContainer = document.getElementById('welcomeStats');
        if (!statsContainer) return;

        const timeLeft = this.getTimeLeft();
        const claimedPercentage = Math.min((this.eventState.claimedCount / this.config.maxSlots) * 100, 100);

        statsContainer.innerHTML = `
            <div class="stat-item">
                <span class="stat-label">Time Left</span>
                <span class="stat-value">${timeLeft}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Rewards Claimed</span>
                <span class="stat-value">${this.eventState.claimedCount.toLocaleString()}/${this.config.maxSlots.toLocaleString()}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Your Reward</span>
                <span class="stat-value">${this.config.reward} ${this.config.rewardCurrency}</span>
            </div>
        `;
    }

    getTimeLeft() {
        const now = new Date();
        const timeLeft = this.eventState.endDate - now;

        if (timeLeft <= 0) return 'Ended';

        const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

        if (days > 0) return `${days}d ${hours}h`;
        return `${hours}h left`;
    }

    // ========== SISTEMA DE BANNER ==========

    checkBannerDisplay() {
        // Mostrar banner solo si no lo ha visto y no ha completado todo
        const shouldShow = !this.userState.hasSeenBanner &&
                          !this.userState.hasClaimedReward &&
                          this.eventState.isActive;

        if (shouldShow) {
            setTimeout(() => this.showBanner(), 2000); // Mostrar después de 2 segundos
        }
    }

    showBanner() {
        const banner = document.getElementById('welcomeBannerOverlay');
        if (banner) {
            banner.style.display = 'flex';
            this.userState.hasSeenBanner = true;
            this.saveState();
        }
    }

    hideBanner() {
        const banner = document.getElementById('welcomeBannerOverlay');
        if (banner) {
            banner.style.display = 'none';
        }
    }

    // ========== SISTEMA DE NOTIFICACIONES ==========

    showNotification(message, type = 'info') {
        // Crear notificación toast
        const toast = document.createElement('div');
        toast.className = `welcome-toast toast-${type}`;

        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-triangle',
            warning: 'fas fa-exclamation-circle',
            info: 'fas fa-info-circle'
        };

        toast.innerHTML = `
            <div class="toast-icon">
                <i class="${icons[type] || icons.info}"></i>
            </div>
            <div class="toast-content">
                <div class="toast-message">${message}</div>
            </div>
            <button class="toast-close" onclick="this.closest('.welcome-toast').remove()">×</button>
        `;

        // Aplicar estilos
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#4caf50' : type === 'error' ? '#f44336' : type === 'warning' ? '#ff9800' : '#2196f3'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 12px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            z-index: 10000;
            display: flex;
            align-items: center;
            gap: 1rem;
            max-width: 400px;
            animation: slideInRight 0.3s ease;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: 0.9rem;
        `;

        document.body.appendChild(toast);

        // Auto-remover
        setTimeout(() => {
            if (toast.parentNode) {
                toast.style.animation = 'slideOutRight 0.3s ease';
                setTimeout(() => toast.remove(), 300);
            }
        }, 4000);
    }

    showSuccessCelebration() {
        // Crear celebración especial para el claim exitoso
        const celebration = document.createElement('div');
        celebration.className = 'welcome-celebration';
        celebration.innerHTML = `
            <div class="celebration-content">
                <div class="celebration-icon">
                    <i class="fas fa-trophy"></i>
                </div>
                <h3>🎉 Congratulations!</h3>
                <p>You've earned <strong>${this.config.reward} ${this.config.rewardCurrency}</strong>!</p>
                <div class="celebration-sparks">
                    <div class="spark"></div>
                    <div class="spark"></div>
                    <div class="spark"></div>
                    <div class="spark"></div>
                    <div class="spark"></div>
                </div>
            </div>
        `;

        celebration.style.cssText = `
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10001;
            animation: fadeIn 0.3s ease;
        `;

        document.body.appendChild(celebration);

        // Auto-remover después de 3 segundos
        setTimeout(() => {
            celebration.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => celebration.remove(), 300);
        }, 3000);
    }

    showLoading(show) {
        const claimBtn = document.getElementById('claimWelcomeBonus');
        if (!claimBtn) return;

        if (show) {
            claimBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Processing...</span>';
            claimBtn.disabled = true;
        } else {
            this.updateClaimButton(); // Restaurar estado normal
        }
    }

    // ========== MÉTODOS DE DEBUG/RESET ==========

    // Función para resetear el estado del usuario (útil para testing)
    resetUserState() {
        console.log('🔄 Reseteando estado del usuario...');
        this.userState = {
            hasSeenBanner: false,
            hasCompletedActions: {
                follow_twitter: false,
                join_telegram: false
            },
            hasClaimedReward: false,
            claimDate: null,
            deviceId: this.generateDeviceId(),
            lastActivity: new Date()
        };
        this.saveState();
        this.updateUI();
        this.showNotification('🔄 User state reset for testing', 'info');
        console.log('✅ Estado reseteado');
    }

    // Función para mostrar el estado actual (útil para debugging)
    debugState() {
        console.log('🐛 === DEBUG STATE ===');
        console.log('User State:', this.userState);
        console.log('Event State:', this.eventState);
        console.log('Can Claim:', this.checkClaimEligibility());
        console.log('UI Elements:', {
            twitterBtn: !!document.querySelector('[data-action="follow_twitter"]'),
            telegramBtn: !!document.querySelector('[data-action="join_telegram"]'),
            claimBtn: !!document.getElementById('claimWelcomeBonus')
        });
        console.log('===================');
    }

    // Forzar actualización completa de UI
    forceUpdate() {
        console.log('🔄 Forzando actualización completa...');
        this.updateUI();
        this.showNotification('🔄 UI updated', 'info');
    }

    // ========== MÉTODOS PÚBLICOS ==========

    getEventData() {
        return { ...this.eventState };
    }

    getUserData() {
        return { ...this.userState };
    }

    isEventActive() {
        return this.eventState.isActive;
    }

    canUserClaim() {
        return this.checkClaimEligibility();
    }
}

// ========== INICIALIZACIÓN ==========

// Crear instancia global cuando el DOM esté listo
let welcomeBonusEvent;

function initializeWelcomeBonusEvent() {
    console.log('🎯 Inicializando Welcome Bonus Event v2.0...');

    if (!welcomeBonusEvent) {
        welcomeBonusEvent = new WelcomeBonusEvent();
        // Mantener compatibilidad con código antiguo
        window.followBonusEvent = welcomeBonusEvent;
    }
}

// Auto-inicialización deshabilitada - Solo se inicializará cuando se cargue explícitamente desde una página de eventos
// if (document.readyState === 'loading') {
//     document.addEventListener('DOMContentLoaded', initializeWelcomeBonusEvent);
// } else {
//     initializeWelcomeBonusEvent();
// }

// Función para inicializar manualmente desde una página de eventos
window.initializeWelcomeBonusEvent = initializeWelcomeBonusEvent;

// Exportar para uso global y debugging
window.WelcomeBonusEvent = WelcomeBonusEvent;
window.welcomeBonusDebug = {
    reset: () => welcomeBonusEvent?.resetUserState(),
    debug: () => welcomeBonusEvent?.debugState(),
    update: () => welcomeBonusEvent?.forceUpdate(),
    state: () => welcomeBonusEvent?.getUserData()
};

// Sistema completamente automático - sin elementos manuales
console.log('🚀 Welcome Bonus Event v2.0 loaded - Click & Earn System!');
console.log('🐛 Debug functions available: welcomeBonusDebug.reset(), welcomeBonusDebug.debug(), welcomeBonusDebug.update(), welcomeBonusDebug.state()');