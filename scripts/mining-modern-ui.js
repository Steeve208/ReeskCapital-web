// 🎨 RSC MINING MODERN UI - REVOLUTIONARY INTERFACE
// Interfaz moderna para la plataforma de minería simulada RSC
// Características educativas y preparación para mainnet

class RSCMiningModernUI {
    constructor() {
        this.miningEngine = null;
        this.authSystem = null;
        this.currentUser = null;
        this.isInitialized = false;
        this.notifications = [];
        this.animations = {
            hashVisualization: null,
            progressBar: null,
            particleSystem: null
        };
        
        this.init();
    }
    
    async init() {
        try {
            console.log('🎨 Inicializando UI moderna de minería RSC...');
            
            // Inicializar sistemas
            await this.initializeSystems();
            
            // Configurar event listeners
            this.setupEventListeners();
            
            // Configurar animaciones
            this.setupAnimations();
            
            // Verificar autenticación
            await this.checkAuthentication();
            
            // Inicializar UI
            this.initializeUI();
            
            this.isInitialized = true;
            console.log('✅ UI moderna de minería inicializada correctamente');
            
        } catch (error) {
            console.error('❌ Error al inicializar UI moderna:', error);
            throw error;
        }
    }
    
    async initializeSystems() {
        // Inicializar motor de minería simulada
        if (window.RSCSimulatedMiningEngine) {
            this.miningEngine = new RSCSimulatedMiningEngine();
        } else {
            throw new Error('Motor de minería simulada no disponible');
        }
        
        // Inicializar sistema de autenticación
        if (window.RSCMiningAuth) {
            this.authSystem = new RSCMiningAuth();
        } else {
            throw new Error('Sistema de autenticación no disponible');
        }
    }
    
    setupEventListeners() {
        // Event listeners para formularios
        this.setupAuthEventListeners();
        
        // Event listeners para controles de minería
        this.setupMiningEventListeners();
        
        // Event listeners para notificaciones
        this.setupNotificationEventListeners();
        
        // Event listeners para modales
        this.setupModalEventListeners();
        
        // Event listeners para actualizaciones en tiempo real
        this.setupRealtimeEventListeners();
    }
    
    setupAuthEventListeners() {
        // Login form
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }
        
        // Register form
        const registerForm = document.getElementById('registerForm');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => this.handleRegister(e));
        }
        
        // Form toggle
        const toggleFormBtn = document.getElementById('toggleFormBtn');
        if (toggleFormBtn) {
            toggleFormBtn.addEventListener('click', () => this.toggleAuthForm());
        }
        
        // Password toggles
        const toggleLoginPassword = document.getElementById('toggleLoginPassword');
        const toggleRegisterPassword = document.getElementById('toggleRegisterPassword');
        
        if (toggleLoginPassword) {
            toggleLoginPassword.addEventListener('click', () => this.togglePassword('loginPassword'));
        }
        
        if (toggleRegisterPassword) {
            toggleRegisterPassword.addEventListener('click', () => this.togglePassword('registerPassword'));
        }
        
        // Password strength
        const registerPassword = document.getElementById('registerPassword');
        if (registerPassword) {
            registerPassword.addEventListener('input', (e) => this.updatePasswordStrength(e.target.value));
        }
        
        // Logout
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.handleLogout());
        }
    }
    
    setupMiningEventListeners() {
        // Start mining
        const startMiningBtn = document.getElementById('startMiningBtn');
        if (startMiningBtn) {
            startMiningBtn.addEventListener('click', () => this.startMining());
        }
        
        // Stop mining
        const stopMiningBtn = document.getElementById('stopMiningBtn');
        if (stopMiningBtn) {
            stopMiningBtn.addEventListener('click', () => this.stopMining());
        }
        
        // Refresh activity
        const refreshActivityBtn = document.getElementById('refreshActivityBtn');
        if (refreshActivityBtn) {
            refreshActivityBtn.addEventListener('click', () => this.refreshActivity());
        }
        
        // Copy referral code
        const copyReferralBtn = document.getElementById('copyReferralBtn');
        if (copyReferralBtn) {
            copyReferralBtn.addEventListener('click', () => this.copyReferralCode());
        }
    }
    
    setupNotificationEventListeners() {
        // Auto-hide notifications
        setInterval(() => {
            this.hideOldNotifications();
        }, 5000);
    }
    
    setupModalEventListeners() {
        // Help modal
        const helpBtn = document.getElementById('helpBtn');
        const helpModal = document.getElementById('helpModal');
        const closeHelpModal = document.getElementById('closeHelpModal');
        
        if (helpBtn && helpModal) {
            helpBtn.addEventListener('click', () => this.showModal('helpModal'));
        }
        
        if (closeHelpModal && helpModal) {
            closeHelpModal.addEventListener('click', () => this.hideModal('helpModal'));
        }
        
        // Close modal on overlay click
        if (helpModal) {
            helpModal.addEventListener('click', (e) => {
                if (e.target === helpModal) {
                    this.hideModal('helpModal');
                }
            });
        }
    }
    
    setupRealtimeEventListeners() {
        // Hash updates
        document.addEventListener('hashUpdate', (e) => {
            this.updateHashVisualization(e.detail);
        });
        
        // Activity updates
        document.addEventListener('activityUpdate', (e) => {
            this.addActivityItem(e.detail);
        });
        
        // Mining state updates
        setInterval(() => {
            this.updateMiningStats();
        }, 1000);
        
        // Network stats updates
        setInterval(() => {
            this.updateNetworkStats();
        }, 5000);
        
        // Mainnet info updates
        setInterval(() => {
            this.updateMainnetInfo();
        }, 1000);
        
        // Referral stats updates
        setInterval(() => {
            this.updateReferralStats();
        }, 5000);
    }
    
    setupAnimations() {
        // Configurar animaciones CSS
        this.setupCSSAnimations();
        
        // Configurar animaciones de partículas
        this.setupParticleAnimations();
    }
    
    setupCSSAnimations() {
        // Añadir clases de animación a elementos
        const animatedElements = document.querySelectorAll('.stat-card, .control-card, .activity-item');
        animatedElements.forEach((element, index) => {
            element.style.animationDelay = `${index * 0.1}s`;
            element.classList.add('animate-slide-up');
        });
    }
    
    setupParticleAnimations() {
        // Crear sistema de partículas para visualización de hash
        this.createParticleSystem();
    }
    
    createParticleSystem() {
        const canvas = document.createElement('canvas');
        canvas.id = 'hashParticles';
        canvas.style.position = 'fixed';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.pointerEvents = 'none';
        canvas.style.zIndex = '1';
        canvas.style.opacity = '0.1';
        
        document.body.appendChild(canvas);
        
        this.animations.particleSystem = {
            canvas: canvas,
            ctx: canvas.getContext('2d'),
            particles: [],
            isActive: false
        };
        
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
    }
    
    resizeCanvas() {
        if (this.animations.particleSystem) {
            const canvas = this.animations.particleSystem.canvas;
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
    }
    
    // ========================================
    // FUNCIONES DE AUTENTICACIÓN
    // ========================================
    
    async checkAuthentication() {
        try {
            if (this.authSystem && this.authSystem.isAuthenticated()) {
                this.currentUser = this.authSystem.getCurrentUser();
                this.showMiningDashboard();
                this.updateUserInfo();
            } else {
                this.showAuthSection();
            }
        } catch (error) {
            console.warn('⚠️ Error al verificar autenticación:', error);
            this.showAuthSection();
        }
    }
    
    async handleLogin(e) {
        e.preventDefault();
        
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        try {
            this.showLoading('Iniciando sesión...');
            
            const result = await this.authSystem.authenticateUser(email, password);
            
            if (result.success) {
                this.currentUser = result.user;
                this.showMiningDashboard();
                this.updateUserInfo();
                this.showNotification('success', '¡Bienvenido!', 'Sesión iniciada correctamente');
            }
            
        } catch (error) {
            this.showNotification('error', 'Error de login', error.message);
        } finally {
            this.hideLoading();
        }
    }
    
    async handleRegister(e) {
        e.preventDefault();
        
        const email = document.getElementById('registerEmail').value;
        const username = document.getElementById('registerUsername').value;
        const password = document.getElementById('registerPassword').value;
        const wallet = document.getElementById('registerWallet').value;
        
        try {
            this.showLoading('Creando cuenta...');
            
            const user = await this.authSystem.registerUser(email, username, password, wallet);
            
            this.showNotification('success', '¡Cuenta creada!', 'Registro exitoso. Inicia sesión para comenzar a minar.');
            this.toggleAuthForm();
            
        } catch (error) {
            this.showNotification('error', 'Error de registro', error.message);
        } finally {
            this.hideLoading();
        }
    }
    
    async handleLogout() {
        try {
            await this.authSystem.logout();
            this.currentUser = null;
            this.showAuthSection();
            this.showNotification('info', 'Sesión cerrada', 'Has cerrado sesión correctamente');
        } catch (error) {
            this.showNotification('error', 'Error al cerrar sesión', error.message);
        }
    }
    
    toggleAuthForm() {
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');
        const toggleText = document.getElementById('toggleText');
        const toggleBtn = document.getElementById('toggleFormBtn');
        
        if (loginForm && registerForm && toggleText && toggleBtn) {
            const isLogin = !loginForm.classList.contains('hidden');
            
            if (isLogin) {
                loginForm.classList.add('hidden');
                registerForm.classList.remove('hidden');
                toggleText.textContent = '¿Ya tienes cuenta?';
                toggleBtn.textContent = 'Inicia sesión aquí';
            } else {
                registerForm.classList.add('hidden');
                loginForm.classList.remove('hidden');
                toggleText.textContent = '¿No tienes cuenta?';
                toggleBtn.textContent = 'Regístrate aquí';
            }
        }
    }
    
    togglePassword(inputId) {
        const input = document.getElementById(inputId);
        const button = document.querySelector(`#toggle${inputId.charAt(0).toUpperCase() + inputId.slice(1)}`);
        
        if (input && button) {
            const isPassword = input.type === 'password';
            input.type = isPassword ? 'text' : 'password';
            button.innerHTML = isPassword ? '<i class="fas fa-eye-slash"></i>' : '<i class="fas fa-eye"></i>';
        }
    }
    
    updatePasswordStrength(password) {
        const strengthBar = document.getElementById('passwordStrength');
        if (!strengthBar) return;
        
        const strength = this.calculatePasswordStrength(password);
        strengthBar.className = `password-strength ${strength.level}`;
    }
    
    calculatePasswordStrength(password) {
        let score = 0;
        const checks = {
            length: password.length >= 8,
            uppercase: /[A-Z]/.test(password),
            lowercase: /[a-z]/.test(password),
            numbers: /\d/.test(password),
            special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
        };
        
        score = Object.values(checks).filter(Boolean).length;
        
        if (score < 3) return { level: 'weak', score };
        if (score < 5) return { level: 'medium', score };
        return { level: 'strong', score };
    }
    
    // ========================================
    // FUNCIONES DE MINERÍA
    // ========================================
    
    async startMining() {
        try {
            if (!this.currentUser) {
                this.showNotification('error', 'Error', 'Debes iniciar sesión para minar');
                return;
            }
            
            this.showLoading('Iniciando minería...');
            
            const session = await this.miningEngine.startMining(this.currentUser);
            
            this.updateMiningUI(true);
            this.showNotification('success', '¡Minería iniciada!', 'La minería simulada ha comenzado');
            
        } catch (error) {
            this.showNotification('error', 'Error al iniciar minería', error.message);
        } finally {
            this.hideLoading();
        }
    }
    
    async stopMining() {
        try {
            this.showLoading('Deteniendo minería...');
            
            const result = await this.miningEngine.stopMining();
            
            this.updateMiningUI(false);
            this.showNotification('success', 'Minería detenida', `Ganaste ${result.tokensEarned.toFixed(8)} RSC`);
            
        } catch (error) {
            this.showNotification('error', 'Error al detener minería', error.message);
        } finally {
            this.hideLoading();
        }
    }
    
    updateMiningUI(isMining) {
        const startBtn = document.getElementById('startMiningBtn');
        const stopBtn = document.getElementById('stopMiningBtn');
        const miningStatus = document.getElementById('miningStatus');
        const miningSession = document.getElementById('miningSession');
        
        if (isMining) {
            if (startBtn) startBtn.classList.add('hidden');
            if (stopBtn) stopBtn.classList.remove('hidden');
            if (miningSession) miningSession.classList.remove('hidden');
            if (miningStatus) {
                miningStatus.innerHTML = '<span class="status-dot online"></span><span class="status-text">Minando</span>';
            }
        } else {
            if (startBtn) startBtn.classList.remove('hidden');
            if (stopBtn) stopBtn.classList.add('hidden');
            if (miningSession) miningSession.classList.add('hidden');
            if (miningStatus) {
                miningStatus.innerHTML = '<span class="status-dot offline"></span><span class="status-text">Detenido</span>';
            }
        }
    }
    
    updateMiningStats() {
        if (!this.miningEngine) return;
        
        const state = this.miningEngine.getMiningState();
        
        // Actualizar estadísticas de sesión
        this.updateElement('currentDifficulty', state.currentDifficulty.toFixed(2) + 'x');
        this.updateElement('currentHashRate', state.currentHashRate.toLocaleString() + ' H/s');
        this.updateElement('blocksFound', state.totalBlocksFound.toString());
        this.updateElement('sessionTokens', state.sessionTokens.toFixed(8));
        this.updateElement('sessionEfficiency', state.efficiency.toFixed(1) + '%');
        
        // Actualizar timer de sesión
        if (state.isMining && state.sessionStartTime) {
            const duration = Math.floor((Date.now() - state.sessionStartTime) / 1000);
            this.updateElement('sessionTimer', this.formatTime(duration));
            this.updateElement('sessionDuration', Math.floor(duration / 60) + ' min');
            
            // Actualizar barra de progreso
            this.updateProgressBar(duration);
        }
        
        // Actualizar estimación de recompensa por hora
        if (state.isMining) {
            const hourlyEstimate = state.sessionTokens * (3600 / Math.max(1, (Date.now() - state.sessionStartTime) / 1000));
            this.updateElement('estimatedReward', hourlyEstimate.toFixed(8));
        }
    }
    
    updateNetworkStats() {
        if (!this.miningEngine) return;
        
        const stats = this.miningEngine.getNetworkStats();
        
        this.updateElement('activeMiners', stats.activeMiners.toLocaleString());
        this.updateElement('totalMiningPower', stats.totalMiningPower.toFixed(1) + 'x');
        this.updateElement('networkDifficulty', stats.networkDifficulty.toFixed(2) + 'x');
        this.updateElement('blocks24h', stats.blocks24h.toString());
        this.updateElement('rsc24h', stats.rsc24h.toFixed(8));
        this.updateElement('avgBlockTime', Math.floor(stats.avgBlockTime) + 's');
    }
    
    updateLeaderboard() {
        if (!this.miningEngine) return;
        
        const leaderboard = this.miningEngine.getLeaderboard();
        
        leaderboard.slice(0, 3).forEach((leader, index) => {
            this.updateElement(`leader${index + 1}`, leader.username);
            this.updateElement(`leader${index + 1}Amount`, leader.amount.toFixed(2));
        });
    }
    
    updateProgressBar(duration) {
        const progressFill = document.getElementById('sessionProgress');
        if (progressFill) {
            // Simular progreso basado en duración (máximo 1 hora)
            const maxDuration = 3600; // 1 hora
            const progress = Math.min(100, (duration / maxDuration) * 100);
            progressFill.style.width = progress + '%';
        }
    }
    
    // ========================================
    // VISUALIZACIÓN DE HASH
    // ========================================
    
    updateHashVisualization(data) {
        // Actualizar visualización de hash en tiempo real
        const hashDisplay = document.getElementById('hashDisplay');
        if (hashDisplay) {
            hashDisplay.textContent = data.hash;
            hashDisplay.style.color = this.getHashColor(data.hash);
        }
        
        // Actualizar contador de hashes
        const hashCount = document.getElementById('hashCount');
        if (hashCount) {
            hashCount.textContent = data.count.toLocaleString();
        }
        
        // Crear partículas
        this.createHashParticles(data.hash);
    }
    
    getHashColor(hash) {
        // Generar color basado en el hash
        const hashNum = parseInt(hash.substring(0, 8), 16);
        const hue = hashNum % 360;
        return `hsl(${hue}, 70%, 60%)`;
    }
    
    createHashParticles(hash) {
        if (!this.animations.particleSystem || !this.animations.particleSystem.isActive) return;
        
        const canvas = this.animations.particleSystem.canvas;
        const ctx = this.animations.particleSystem.ctx;
        
        // Crear partículas basadas en el hash
        for (let i = 0; i < 3; i++) {
            this.animations.particleSystem.particles.push({
                x: Math.random() * canvas.width,
                y: canvas.height,
                vx: (Math.random() - 0.5) * 2,
                vy: -Math.random() * 3 - 1,
                life: 1.0,
                color: this.getHashColor(hash)
            });
        }
        
        this.animateParticles();
    }
    
    animateParticles() {
        if (!this.animations.particleSystem) return;
        
        const canvas = this.animations.particleSystem.canvas;
        const ctx = this.animations.particleSystem.ctx;
        const particles = this.animations.particleSystem.particles;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        particles.forEach((particle, index) => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.life -= 0.01;
            
            if (particle.life <= 0) {
                particles.splice(index, 1);
                return;
            }
            
            ctx.save();
            ctx.globalAlpha = particle.life;
            ctx.fillStyle = particle.color;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        });
        
        if (particles.length > 0) {
            requestAnimationFrame(() => this.animateParticles());
        }
    }
    
    // ========================================
    // ACTIVIDAD RECIENTE
    // ========================================
    
    addActivityItem(activity) {
        const activityList = document.getElementById('activityList');
        if (!activityList) return;
        
        const activityItem = document.createElement('div');
        activityItem.className = 'activity-item';
        activityItem.innerHTML = `
            <div class="activity-icon">
                <i class="fas ${this.getActivityIcon(activity.type)}"></i>
            </div>
            <div class="activity-content">
                <p>${activity.message}</p>
                <small>${this.formatTimeAgo(activity.timestamp)}</small>
            </div>
        `;
        
        activityList.insertBefore(activityItem, activityList.firstChild);
        
        // Mantener solo los últimos 10 elementos
        while (activityList.children.length > 10) {
            activityList.removeChild(activityList.lastChild);
        }
    }
    
    getActivityIcon(type) {
        const icons = {
            'block_found': 'fa-coins',
            'referral_bonus': 'fa-gift',
            'difficulty_adjustment': 'fa-cogs',
            'mining_started': 'fa-play',
            'mining_stopped': 'fa-stop'
        };
        return icons[type] || 'fa-info-circle';
    }
    
    async refreshActivity() {
        try {
            const activity = this.miningEngine.getRecentActivity();
            const activityList = document.getElementById('activityList');
            
            if (activityList) {
                activityList.innerHTML = '';
                activity.slice(0, 10).forEach(act => {
                    this.addActivityItem(act);
                });
            }
        } catch (error) {
            console.warn('⚠️ Error al actualizar actividad:', error);
        }
    }
    
    // ========================================
    // FUNCIONES DE UI
    // ========================================
    
    showAuthSection() {
        const authSection = document.getElementById('authSection');
        const miningDashboard = document.getElementById('miningDashboard');
        
        if (authSection) authSection.classList.remove('hidden');
        if (miningDashboard) miningDashboard.classList.add('hidden');
    }
    
    showMiningDashboard() {
        const authSection = document.getElementById('authSection');
        const miningDashboard = document.getElementById('miningDashboard');
        
        if (authSection) authSection.classList.add('hidden');
        if (miningDashboard) miningDashboard.classList.remove('hidden');
        
        // Actualizar datos del dashboard
        this.updateUserInfo();
        this.updateNetworkStats();
        this.updateLeaderboard();
        this.refreshActivity();
    }
    
    updateUserInfo() {
        if (!this.currentUser) return;
        
        this.updateElement('userUsername', this.currentUser.username);
        this.updateElement('userEmail', this.currentUser.email);
        this.updateElement('userBalance', this.currentUser.balance.toFixed(8) + ' RSC');
        this.updateElement('userMiningPower', this.currentUser.mining_power.toFixed(1) + 'x');
    }
    
    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        }
    }
    
    hideModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('hidden');
            document.body.style.overflow = 'auto';
        }
    }
    
    showLoading(message = 'Cargando...') {
        const overlay = document.getElementById('loadingOverlay');
        const messageEl = overlay?.querySelector('p');
        
        if (overlay) {
            overlay.classList.remove('hidden');
            if (messageEl) messageEl.textContent = message;
        }
    }
    
    hideLoading() {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.classList.add('hidden');
        }
    }
    
    showNotification(type, title, message) {
        const container = document.getElementById('notificationsContainer');
        if (!container) return;
        
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-icon">
                <i class="fas ${this.getNotificationIcon(type)}"></i>
            </div>
            <div class="notification-content">
                <div class="notification-title">${title}</div>
                <div class="notification-message">${message}</div>
            </div>
            <button class="notification-close" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        container.appendChild(notification);
        
        // Auto-remove después de 5 segundos
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }
    
    getNotificationIcon(type) {
        const icons = {
            'success': 'fa-check-circle',
            'error': 'fa-exclamation-circle',
            'warning': 'fa-exclamation-triangle',
            'info': 'fa-info-circle'
        };
        return icons[type] || 'fa-info-circle';
    }
    
    hideOldNotifications() {
        const container = document.getElementById('notificationsContainer');
        if (container && container.children.length > 5) {
            container.removeChild(container.firstChild);
        }
    }
    
    updateElement(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    }
    
    // ========================================
    // FUNCIONES DE REFERIDOS
    // ========================================
    
    async copyReferralCode() {
        try {
            const referralCode = document.getElementById('referralCode');
            if (referralCode) {
                await navigator.clipboard.writeText(referralCode.value);
                this.showNotification('success', 'Código copiado', 'El código de referido se ha copiado al portapapeles');
            }
        } catch (error) {
            console.warn('⚠️ Error al copiar código de referido:', error);
            this.showNotification('error', 'Error', 'No se pudo copiar el código de referido');
        }
    }
    
    updateReferralStats() {
        if (!this.miningEngine) return;
        
        const state = this.miningEngine.getMiningState();
        
        this.updateElement('referralCount', state.totalReferrals.toString());
        this.updateElement('referralEarnings', state.referralEarnings.toFixed(8) + ' RSC');
    }
    
    generateReferralCode() {
        if (!this.currentUser) return 'RSC_1234567890';
        
        return this.miningEngine.generateReferralCode(this.currentUser.id);
    }
    
    // ========================================
    // FUNCIONES DE MAINNET
    // ========================================
    
    updateMainnetInfo() {
        if (!this.miningEngine) return;
        
        const mainnetInfo = this.miningEngine.getMainnetInfo();
        
        // Actualizar countdown
        this.updateElement('mainnetDays', mainnetInfo.countdown.days.toString());
        this.updateElement('mainnetHours', mainnetInfo.countdown.hours.toString());
        this.updateElement('mainnetMinutes', mainnetInfo.countdown.minutes.toString());
        this.updateElement('mainnetSeconds', mainnetInfo.countdown.seconds.toString());
        
        // Actualizar progreso
        this.updateElement('mainnetProgress', mainnetInfo.progress.progress + '%');
        this.updateElement('mainnetPhase', mainnetInfo.progress.phase);
        
        // Actualizar barra de progreso
        const progressFill = document.getElementById('mainnetProgressFill');
        if (progressFill) {
            progressFill.style.width = mainnetInfo.progress.progress + '%';
        }
    }
    
    // ========================================
    // FUNCIONES DE UTILIDAD
    // ========================================
    
    formatTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    
    formatTimeAgo(timestamp) {
        const now = new Date();
        const time = new Date(timestamp);
        const diff = now - time;
        
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);
        
        if (days > 0) return `hace ${days} día${days > 1 ? 's' : ''}`;
        if (hours > 0) return `hace ${hours} hora${hours > 1 ? 's' : ''}`;
        if (minutes > 0) return `hace ${minutes} minuto${minutes > 1 ? 's' : ''}`;
        return 'ahora';
    }
    
    initializeUI() {
        // Inicializar elementos de la UI
        this.updateMiningUI(false);
        this.updateNetworkStats();
        this.updateLeaderboard();
        this.updateMainnetInfo();
        this.updateReferralStats();
        
        // Generar código de referido
        if (this.currentUser) {
            const referralCode = this.generateReferralCode();
            const referralInput = document.getElementById('referralCode');
            if (referralInput) {
                referralInput.value = referralCode;
            }
        }
        
        // Configurar animaciones iniciales
        this.setupInitialAnimations();
    }
    
    setupInitialAnimations() {
        // Animar elementos al cargar
        const elements = document.querySelectorAll('.stat-card, .control-card');
        elements.forEach((element, index) => {
            element.style.opacity = '0';
            element.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                element.style.transition = 'all 0.5s ease-out';
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }, index * 100);
        });
    }
}

// Inicializar UI cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.miningUI = new RSCMiningModernUI();
});

console.log('🎨 UI moderna de minería RSC cargada - Revolutionary Interface');
