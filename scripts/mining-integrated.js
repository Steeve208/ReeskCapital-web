/* ================================
   MINING-INTEGRATED.JS — COMPONENTE DE MINERÍA INTEGRADO CON BACKEND
================================ */

/**
 * ⛏️ COMPONENTE DE MINERÍA INTEGRADO CON BACKEND RSC MINING
 * 
 * Sistema de minería completo conectado al backend
 * Incluye autenticación, minería, balance y estadísticas
 */

class MiningIntegratedComponent {
    constructor(containerId = 'mining-integrated-container') {
        this.containerId = containerId;
        this.container = null;
        this.isMining = false;
        this.miningCooldown = 0;
        this.userBalance = 0;
        this.miningStats = null;
        this.autoUpdateInterval = null;
        
        this.init();
    }
    
    init() {
        console.log('⛏️ Inicializando componente de Minería Integrado...');
        
        // Esperar a que el DOM esté listo
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupComponent());
        } else {
            this.setupComponent();
        }
    }
    
    setupComponent() {
        this.container = document.getElementById(this.containerId);
        if (!this.container) {
            console.warn(`⚠️ Contenedor con ID '${this.containerId}' no encontrado`);
            return;
        }
        
        this.render();
        this.setupEventListeners();
        this.startAutoUpdate();
        
        console.log('✅ Componente de Minería Integrado configurado');
    }
    
    render() {
        this.container.innerHTML = `
            <div class="mining-integrated-wrapper">
                <!-- Header de Minería -->
                <div class="mining-header">
                    <h2 class="mining-title">
                        <span class="title-icon">⛏️</span>
                        RSC Mining System
                    </h2>
                    <div class="mining-status" id="mining-status">
                        <span class="status-indicator offline"></span>
                        <span class="status-text">Desconectado</span>
                    </div>
                </div>
                
                <!-- Panel de Autenticación -->
                <div class="auth-panel" id="auth-panel">
                    <div class="auth-tabs">
                        <button class="auth-tab active" data-tab="login">🔐 Iniciar Sesión</button>
                        <button class="auth-tab" data-tab="register">📝 Registrarse</button>
                    </div>
                    
                    <!-- Formulario de Login -->
                    <div class="auth-form active" id="login-form">
                        <div class="form-group">
                            <label for="login-email">Email:</label>
                            <input type="email" id="login-email" placeholder="tu@email.com" required>
                        </div>
                        <div class="form-group">
                            <label for="login-password">Contraseña:</label>
                            <input type="password" id="login-password" placeholder="Tu contraseña" required>
                        </div>
                        <button class="auth-btn login-btn" onclick="miningIntegrated.login()">
                            <span class="btn-icon">🔓</span>
                            Iniciar Sesión
                        </button>
                    </div>
                    
                    <!-- Formulario de Registro -->
                    <div class="auth-form" id="register-form">
                        <div class="form-group">
                            <label for="register-email">Email:</label>
                            <input type="email" id="register-email" placeholder="tu@email.com" required>
                        </div>
                        <div class="form-group">
                            <label for="register-password">Contraseña:</label>
                            <input type="password" id="register-password" placeholder="Mínimo 8 caracteres" required>
                        </div>
                        <div class="form-group">
                            <label for="referral-code">Código de Referido (opcional):</label>
                            <input type="text" id="referral-code" placeholder="Código de referido">
                        </div>
                        <button class="auth-btn register-btn" onclick="miningIntegrated.register()">
                            <span class="btn-icon">📝</span>
                            Registrarse
                        </button>
                    </div>
                </div>
                
                <!-- Panel de Usuario Autenticado -->
                <div class="user-panel" id="user-panel" style="display: none;">
                    <!-- Información del Usuario -->
                    <div class="user-info">
                        <div class="user-avatar">👤</div>
                        <div class="user-details">
                            <div class="user-email" id="user-email">usuario@email.com</div>
                            <div class="user-balance">
                                <span class="balance-label">Balance:</span>
                                <span class="balance-amount" id="user-balance-amount">0.000000</span>
                                <span class="balance-currency">RSC</span>
                            </div>
                        </div>
                        <button class="logout-btn" onclick="miningIntegrated.logout()">
                            <span class="btn-icon">🚪</span>
                            Cerrar Sesión
                        </button>
                    </div>
                    
                    <!-- Panel de Minería -->
                    <div class="mining-panel">
                        <div class="mining-controls">
                            <button class="mine-btn" id="mine-btn" onclick="miningIntegrated.executeMining()">
                                <span class="btn-icon">⛏️</span>
                                <span class="btn-text">Minar RSC</span>
                            </button>
                            <div class="cooldown-info" id="cooldown-info" style="display: none;">
                                <span class="cooldown-icon">⏰</span>
                                <span class="cooldown-text">Espera <span id="cooldown-seconds">0</span>s</span>
                            </div>
                        </div>
                        
                        <!-- Estadísticas de Minería -->
                        <div class="mining-stats" id="mining-stats">
                            <div class="stat-card">
                                <div class="stat-icon">📊</div>
                                <div class="stat-content">
                                    <div class="stat-label">Total Minado</div>
                                    <div class="stat-value" id="total-mined">0.000000 RSC</div>
                                </div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-icon">🎯</div>
                                <div class="stat-content">
                                    <div class="stat-label">Minas Hoy</div>
                                    <div class="stat-value" id="mines-today">0</div>
                                </div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-icon">⚡</div>
                                <div class="stat-content">
                                    <div class="stat-label">Última Mina</div>
                                    <div class="stat-value" id="last-mine">Nunca</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Panel de Administrador -->
                <div class="admin-panel" id="admin-panel" style="display: none;">
                    <div class="admin-header">
                        <h3>👑 Panel de Administrador</h3>
                        <button class="admin-btn" onclick="miningIntegrated.showAdminDashboard()">
                            <span class="btn-icon">📊</span>
                            Dashboard
                        </button>
                    </div>
                    <div class="admin-actions">
                        <button class="admin-btn" onclick="miningIntegrated.exportUsers()">
                            <span class="btn-icon">📥</span>
                            Exportar Usuarios
                        </button>
                        <button class="admin-btn" onclick="miningIntegrated.exportMining()">
                            <span class="btn-icon">📊</span>
                            Exportar Minería
                        </button>
                    </div>
                </div>
                
                <!-- Notificaciones -->
                <div class="mining-notifications" id="mining-notifications"></div>
            </div>
        `;
        
        // Aplicar estilos
        this.applyStyles();
    }
    
    setupEventListeners() {
        // Tabs de autenticación
        const authTabs = document.querySelectorAll('.auth-tab');
        authTabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                const targetTab = e.target.dataset.tab;
                this.switchAuthTab(targetTab);
            });
        });
        
        // Enter key en formularios
        const forms = document.querySelectorAll('.auth-form');
        forms.forEach(form => {
            const inputs = form.querySelectorAll('input');
            inputs.forEach(input => {
                input.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        if (targetTab === 'login') {
                            this.login();
                        } else {
                            this.register();
                        }
                    }
                });
            });
        });
    }
    
    switchAuthTab(tabName) {
        // Actualizar tabs activos
        document.querySelectorAll('.auth-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        
        // Mostrar formulario correspondiente
        document.querySelectorAll('.auth-form').forEach(form => {
            form.classList.remove('active');
        });
        document.getElementById(`${tabName}-form`).classList.add('active');
    }
    
    // ===== AUTENTICACIÓN =====
    
    async login() {
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        
        if (!email || !password) {
            this.showNotification('error', 'Por favor completa todos los campos');
            return;
        }
        
        try {
            await window.rscBackend.loginUser(email, password);
            this.onUserAuthenticated();
        } catch (error) {
            console.error('Error en login:', error);
        }
    }
    
    async register() {
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        const referralCode = document.getElementById('referral-code').value;
        
        if (!email || !password) {
            this.showNotification('error', 'Por favor completa los campos obligatorios');
            return;
        }
        
        if (password.length < 8) {
            this.showNotification('error', 'La contraseña debe tener al menos 8 caracteres');
            return;
        }
        
        try {
            await window.rscBackend.registerUser(email, password, referralCode || null);
            this.showNotification('success', 'Registro exitoso. Ahora puedes iniciar sesión.');
            this.switchAuthTab('login');
        } catch (error) {
            console.error('Error en registro:', error);
        }
    }
    
    logout() {
        window.rscBackend.logout();
        this.onUserLoggedOut();
    }
    
    onUserAuthenticated() {
        // Ocultar panel de autenticación
        document.getElementById('auth-panel').style.display = 'none';
        
        // Mostrar panel de usuario
        document.getElementById('user-panel').style.display = 'block';
        
        // Mostrar panel de admin si es admin
        if (window.rscBackend.isUserAdmin()) {
            document.getElementById('admin-panel').style.display = 'block';
        }
        
        // Actualizar información del usuario
        this.updateUserInfo();
        
        // Cargar datos iniciales
        this.loadUserData();
    }
    
    onUserLoggedOut() {
        // Mostrar panel de autenticación
        document.getElementById('auth-panel').style.display = 'block';
        
        // Ocultar paneles de usuario y admin
        document.getElementById('user-panel').style.display = 'none';
        document.getElementById('admin-panel').style.display = 'none';
        
        // Limpiar datos
        this.userBalance = 0;
        this.miningStats = null;
        this.updateUserInfo();
    }
    
    // ===== MINERÍA =====
    
    async executeMining() {
        if (!window.rscBackend.isUserAuthenticated()) {
            this.showNotification('error', 'Debes iniciar sesión para minar');
            return;
        }
        
        if (this.isMining) {
            this.showNotification('warning', 'Ya estás minando');
            return;
        }
        
        try {
            this.isMining = true;
            this.updateMiningButton(true);
            
            const result = await window.rscBackend.executeMining();
            
            if (result.ok) {
                // Actualizar balance y estadísticas
                await this.loadUserData();
                
                // Mostrar animación de éxito
                this.showMiningSuccess(result.reward);
            } else {
                // Manejar cooldown o límite diario
                if (result.reason === 'COOLDOWN') {
                    this.startCooldown(result.secondsLeft);
                }
            }
            
        } catch (error) {
            console.error('Error ejecutando minería:', error);
            this.showNotification('error', `Error de minería: ${error.message}`);
        } finally {
            this.isMining = false;
            this.updateMiningButton(false);
        }
    }
    
    startCooldown(seconds) {
        this.miningCooldown = seconds;
        this.updateCooldownDisplay();
        
        const cooldownInterval = setInterval(() => {
            this.miningCooldown--;
            this.updateCooldownDisplay();
            
            if (this.miningCooldown <= 0) {
                clearInterval(cooldownInterval);
                this.hideCooldown();
            }
        }, 1000);
    }
    
    updateCooldownDisplay() {
        const cooldownInfo = document.getElementById('cooldown-info');
        const cooldownSeconds = document.getElementById('cooldown-seconds');
        
        if (cooldownInfo && cooldownSeconds) {
            cooldownInfo.style.display = 'block';
            cooldownSeconds.textContent = this.miningCooldown;
        }
    }
    
    hideCooldown() {
        const cooldownInfo = document.getElementById('cooldown-info');
        if (cooldownInfo) {
            cooldownInfo.style.display = 'none';
        }
    }
    
    updateMiningButton(mining) {
        const mineBtn = document.getElementById('mine-btn');
        if (mineBtn) {
            mineBtn.disabled = mining;
            mineBtn.innerHTML = mining ? 
                '<span class="btn-icon">⏳</span><span class="btn-text">Minando...</span>' :
                '<span class="btn-icon">⛏️</span><span class="btn-text">Minar RSC</span>';
        }
    }
    
    // ===== DATOS DEL USUARIO =====
    
    async loadUserData() {
        try {
            // Cargar balance
            this.userBalance = await window.rscBackend.getUserBalance();
            
            // Cargar estadísticas de minería
            this.miningStats = await window.rscBackend.getMiningStats();
            
            // Actualizar UI
            this.updateUserInfo();
            
        } catch (error) {
            console.error('Error cargando datos del usuario:', error);
        }
    }
    
    updateUserInfo() {
        // Actualizar email del usuario
        const userProfile = window.rscBackend.getUserProfile();
        if (userProfile) {
            const userEmail = document.getElementById('user-email');
            if (userEmail) {
                userEmail.textContent = userProfile.email;
            }
        }
        
        // Actualizar balance
        const balanceAmount = document.getElementById('user-balance-amount');
        if (balanceAmount) {
            balanceAmount.textContent = this.userBalance.toFixed(6);
        }
        
        // Actualizar estadísticas
        this.updateMiningStats();
    }
    
    updateMiningStats() {
        if (!this.miningStats) return;
        
        // Total minado
        const totalMined = document.getElementById('total-mined');
        if (totalMined) {
            totalMined.textContent = `${parseFloat(this.miningStats.totalMined || 0).toFixed(6)} RSC`;
        }
        
        // Minas hoy
        const minesToday = document.getElementById('mines-today');
        if (minesToday) {
            minesToday.textContent = this.miningStats.minesToday || 0;
        }
        
        // Última mina
        const lastMine = document.getElementById('last-mine');
        if (lastMine) {
            if (this.miningStats.lastMine) {
                const lastMineDate = new Date(this.miningStats.lastMine);
                lastMine.textContent = lastMineDate.toLocaleString();
            } else {
                lastMine.textContent = 'Nunca';
            }
        }
    }
    
    // ===== ADMINISTRACIÓN =====
    
    async showAdminDashboard() {
        try {
            const dashboard = await window.rscBackend.getAdminDashboard();
            this.showNotification('info', 'Dashboard cargado. Revisa la consola para más detalles.');
            console.log('Dashboard administrativo:', dashboard);
        } catch (error) {
            this.showNotification('error', `Error cargando dashboard: ${error.message}`);
        }
    }
    
    async exportUsers() {
        try {
            await window.rscBackend.exportUsersCSV();
        } catch (error) {
            this.showNotification('error', `Error exportando usuarios: ${error.message}`);
        }
    }
    
    async exportMining() {
        try {
            // Implementar exportación de minería
            this.showNotification('info', 'Exportación de minería en desarrollo');
        } catch (error) {
            this.showNotification('error', `Error exportando minería: ${error.message}`);
        }
    }
    
    // ===== UTILIDADES =====
    
    showMiningSuccess(reward) {
        // Crear notificación de éxito
        const notification = document.createElement('div');
        notification.className = 'mining-success-notification';
        notification.innerHTML = `
            <div class="success-content">
                <span class="success-icon">🎉</span>
                <span class="success-text">¡Minaste ${reward.toFixed(6)} RSC!</span>
            </div>
        `;
        
        // Agregar al contenedor de notificaciones
        const notificationsContainer = document.getElementById('mining-notifications');
        if (notificationsContainer) {
            notificationsContainer.appendChild(notification);
            
            // Remover después de 5 segundos
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 5000);
        }
    }
    
    showNotification(type, message) {
        // Crear notificación
        const notification = document.createElement('div');
        notification.className = `mining-notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">${this.getNotificationIcon(type)}</span>
                <span class="notification-text">${message}</span>
            </div>
        `;
        
        // Agregar al contenedor
        const notificationsContainer = document.getElementById('mining-notifications');
        if (notificationsContainer) {
            notificationsContainer.appendChild(notification);
            
            // Remover después de 5 segundos
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 5000);
        }
    }
    
    getNotificationIcon(type) {
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        return icons[type] || 'ℹ️';
    }
    
    startAutoUpdate() {
        // Actualizar datos cada 30 segundos
        this.autoUpdateInterval = setInterval(() => {
            if (window.rscBackend && window.rscBackend.isUserAuthenticated()) {
                this.loadUserData();
            }
        }, 30 * 1000);
    }
    
    stopAutoUpdate() {
        if (this.autoUpdateInterval) {
            clearInterval(this.autoUpdateInterval);
            this.autoUpdateInterval = null;
        }
    }
    
    // ===== ESTILOS =====
    
    applyStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .mining-integrated-wrapper {
                background: linear-gradient(135deg, #1a1a2e, #16213e);
                border-radius: 16px;
                padding: 24px;
                margin: 20px 0;
                box-shadow: 0 8px 32px rgba(0,0,0,0.3);
                border: 1px solid rgba(255,255,255,0.1);
                color: #ffffff;
            }
            
            .mining-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 24px;
                padding-bottom: 16px;
                border-bottom: 1px solid rgba(255,255,255,0.1);
            }
            
            .mining-title {
                font-size: 28px;
                font-weight: 700;
                margin: 0;
                display: flex;
                align-items: center;
                gap: 12px;
            }
            
            .title-icon {
                font-size: 32px;
            }
            
            .mining-status {
                display: flex;
                align-items: center;
                gap: 8px;
                font-size: 14px;
            }
            
            .status-indicator {
                width: 12px;
                height: 12px;
                border-radius: 50%;
                background: #ef4444;
            }
            
            .status-indicator.online {
                background: #10b981;
            }
            
            /* Panel de Autenticación */
            .auth-panel {
                margin-bottom: 24px;
            }
            
            .auth-tabs {
                display: flex;
                gap: 8px;
                margin-bottom: 20px;
            }
            
            .auth-tab {
                background: rgba(255,255,255,0.1);
                border: 1px solid rgba(255,255,255,0.2);
                border-radius: 8px;
                padding: 12px 20px;
                color: #e2e8f0;
                cursor: pointer;
                transition: all 0.3s ease;
                font-weight: 500;
            }
            
            .auth-tab.active {
                background: linear-gradient(135deg, #7657fc, #10b981);
                color: white;
                border-color: transparent;
            }
            
            .auth-form {
                display: none;
                background: rgba(255,255,255,0.05);
                border-radius: 12px;
                padding: 24px;
                border: 1px solid rgba(255,255,255,0.1);
            }
            
            .auth-form.active {
                display: block;
            }
            
            .form-group {
                margin-bottom: 16px;
            }
            
            .form-group label {
                display: block;
                margin-bottom: 8px;
                color: #e2e8f0;
                font-weight: 500;
            }
            
            .form-group input {
                width: 100%;
                padding: 12px;
                background: rgba(255,255,255,0.1);
                border: 1px solid rgba(255,255,255,0.2);
                border-radius: 8px;
                color: #ffffff;
                font-size: 14px;
            }
            
            .form-group input:focus {
                outline: none;
                border-color: #7657fc;
                box-shadow: 0 0 0 3px rgba(117, 87, 252, 0.1);
            }
            
            .auth-btn {
                background: linear-gradient(135deg, #7657fc, #10b981);
                border: none;
                border-radius: 8px;
                padding: 14px 24px;
                color: white;
                font-weight: 600;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 8px;
                transition: all 0.3s ease;
                width: 100%;
                justify-content: center;
            }
            
            .auth-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 16px rgba(117, 87, 252, 0.4);
            }
            
            /* Panel de Usuario */
            .user-panel {
                margin-bottom: 24px;
            }
            
            .user-info {
                display: flex;
                align-items: center;
                gap: 16px;
                background: rgba(255,255,255,0.05);
                border-radius: 12px;
                padding: 20px;
                margin-bottom: 24px;
                border: 1px solid rgba(255,255,255,0.1);
            }
            
            .user-avatar {
                font-size: 32px;
                background: rgba(117, 87, 252, 0.2);
                border-radius: 50%;
                width: 60px;
                height: 60px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .user-details {
                flex: 1;
            }
            
            .user-email {
                font-size: 18px;
                font-weight: 600;
                color: #ffffff;
                margin-bottom: 8px;
            }
            
            .user-balance {
                display: flex;
                align-items: center;
                gap: 8px;
                color: #e2e8f0;
            }
            
            .balance-amount {
                font-size: 20px;
                font-weight: 700;
                color: #10b981;
            }
            
            .logout-btn {
                background: rgba(239, 68, 68, 0.2);
                border: 1px solid rgba(239, 68, 68, 0.3);
                border-radius: 8px;
                padding: 10px 16px;
                color: #ef4444;
                cursor: pointer;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .logout-btn:hover {
                background: rgba(239, 68, 68, 0.3);
            }
            
            /* Panel de Minería */
            .mining-panel {
                background: rgba(255,255,255,0.05);
                border-radius: 12px;
                padding: 24px;
                border: 1px solid rgba(255,255,255,0.1);
            }
            
            .mining-controls {
                display: flex;
                align-items: center;
                gap: 16px;
                margin-bottom: 24px;
                flex-wrap: wrap;
            }
            
            .mine-btn {
                background: linear-gradient(135deg, #f59e0b, #ef4444);
                border: none;
                border-radius: 12px;
                padding: 16px 32px;
                color: white;
                font-size: 18px;
                font-weight: 700;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 12px;
                transition: all 0.3s ease;
                min-width: 200px;
                justify-content: center;
            }
            
            .mine-btn:hover:not(:disabled) {
                transform: translateY(-3px);
                box-shadow: 0 8px 24px rgba(245, 158, 11, 0.4);
            }
            
            .mine-btn:disabled {
                opacity: 0.6;
                cursor: not-allowed;
                transform: none;
            }
            
            .cooldown-info {
                display: flex;
                align-items: center;
                gap: 8px;
                color: #f59e0b;
                font-weight: 600;
                font-size: 16px;
            }
            
            .mining-stats {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 20px;
            }
            
            .stat-card {
                background: rgba(255,255,255,0.05);
                border-radius: 8px;
                padding: 20px;
                border: 1px solid rgba(255,255,255,0.1);
                display: flex;
                align-items: center;
                gap: 16px;
            }
            
            .stat-icon {
                font-size: 24px;
                background: rgba(117, 87, 252, 0.2);
                border-radius: 50%;
                width: 48px;
                height: 48px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .stat-content {
                flex: 1;
            }
            
            .stat-label {
                font-size: 14px;
                color: #94a3b8;
                margin-bottom: 4px;
            }
            
            .stat-value {
                font-size: 18px;
                font-weight: 700;
                color: #ffffff;
            }
            
            /* Panel de Administrador */
            .admin-panel {
                background: rgba(245, 158, 11, 0.1);
                border: 1px solid rgba(245, 158, 11, 0.3);
                border-radius: 12px;
                padding: 20px;
                margin-top: 24px;
            }
            
            .admin-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 16px;
            }
            
            .admin-header h3 {
                margin: 0;
                color: #f59e0b;
                font-size: 20px;
            }
            
            .admin-actions {
                display: flex;
                gap: 12px;
                flex-wrap: wrap;
            }
            
            .admin-btn {
                background: rgba(245, 158, 11, 0.2);
                border: 1px solid rgba(245, 158, 11, 0.3);
                border-radius: 8px;
                padding: 10px 16px;
                color: #f59e0b;
                cursor: pointer;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                gap: 8px;
                font-weight: 500;
            }
            
            .admin-btn:hover {
                background: rgba(245, 158, 11, 0.3);
            }
            
            /* Notificaciones */
            .mining-notifications {
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 1000;
                max-width: 400px;
            }
            
            .mining-notification, .mining-success-notification {
                background: rgba(0,0,0,0.9);
                border-radius: 8px;
                padding: 16px;
                margin-bottom: 12px;
                border-left: 4px solid;
                animation: slideIn 0.3s ease;
            }
            
            .mining-notification.success { border-left-color: #10b981; }
            .mining-notification.error { border-left-color: #ef4444; }
            .mining-notification.warning { border-left-color: #f59e0b; }
            .mining-notification.info { border-left-color: #3b82f6; }
            
            .mining-success-notification {
                border-left-color: #10b981;
                background: linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(16, 185, 129, 0.1));
            }
            
            .notification-content, .success-content {
                display: flex;
                align-items: center;
                gap: 12px;
                color: #ffffff;
            }
            
            .notification-icon, .success-icon {
                font-size: 20px;
            }
            
            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            
            /* Responsive */
            @media (max-width: 768px) {
                .mining-header {
                    flex-direction: column;
                    gap: 16px;
                    text-align: center;
                }
                
                .user-info {
                    flex-direction: column;
                    text-align: center;
                }
                
                .mining-controls {
                    flex-direction: column;
                    align-items: stretch;
                }
                
                .mine-btn {
                    min-width: auto;
                }
                
                .mining-stats {
                    grid-template-columns: 1fr;
                }
                
                .admin-actions {
                    flex-direction: column;
                }
            }
        `;
        
        document.head.appendChild(style);
    }
    
    // ===== MÉTODOS PÚBLICOS =====
    
    // Verificar estado de autenticación
    checkAuthStatus() {
        if (window.rscBackend && window.rscBackend.isUserAuthenticated()) {
            this.onUserAuthenticated();
        }
    }
    
    // Destruir componente
    destroy() {
        this.stopAutoUpdate();
        if (this.container) {
            this.container.innerHTML = '';
        }
    }
}

// ===== INICIALIZACIÓN GLOBAL =====

// Crear instancia global
window.miningIntegrated = new MiningIntegratedComponent();

console.log('⛏️ Componente de Minería Integrado cargado');
