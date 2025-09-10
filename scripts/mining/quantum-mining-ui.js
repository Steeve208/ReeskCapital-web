/**
 * 🎨 RSC QUANTUM MINING UI - INTERFAZ REVOLUCIONARIA
 * 
 * Sistema de interfaz de usuario más avanzado del mundo
 * - Animaciones cuánticas
 * - Efectos visuales únicos
 * - Interactividad fluida
 * - Responsive design
 * - Accesibilidad completa
 */

class QuantumMiningUI {
    constructor() {
        this.version = '2.0.0';
        this.isInitialized = false;
        this.currentAlgorithm = 'quantum';
        this.isMining = false;
        this.animations = new Map();
        this.notifications = [];
        
        // Elementos DOM
        this.elements = {
            authSection: null,
            miningDashboard: null,
            startMiningBtn: null,
            stopMiningBtn: null,
            pauseMiningBtn: null,
            algorithmGrid: null,
            metricsDisplay: null,
            progressBar: null,
            connectionStatus: null,
            userInfo: null
        };
        
        // Estado de la UI
        this.uiState = {
            isAuthenticated: false,
            currentUser: null,
            selectedAlgorithm: 'quantum',
            miningStatus: 'ready',
            connectionStatus: 'connecting',
            notifications: []
        };
        
        // Configuración de animaciones
        this.animationConfig = {
            duration: 300,
            easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
            stagger: 100
        };
        
        // Inicializar
        this.init();
    }
    
    /**
     * Inicializar la UI
     */
    async init() {
        try {
            console.log('🎨 Inicializando Quantum Mining UI v' + this.version);
            
            // Obtener elementos DOM
            this.getDOMElements();
            
            // Configurar event listeners
            this.setupEventListeners();
            
            // Inicializar animaciones
            this.initializeAnimations();
            
            // Cargar algoritmos
            await this.loadAlgorithms();
            
            // Configurar notificaciones
            this.setupNotifications();
            
            // Verificar autenticación
            await this.checkAuthentication();
            
            this.isInitialized = true;
            console.log('✅ Quantum Mining UI inicializada correctamente');
            
        } catch (error) {
            console.error('❌ Error inicializando Quantum Mining UI:', error);
        }
    }
    
    /**
     * Obtener elementos DOM
     */
    getDOMElements() {
        this.elements = {
            authSection: document.getElementById('authSection'),
            miningDashboard: document.getElementById('miningDashboard'),
            startMiningBtn: document.getElementById('startMiningBtn'),
            stopMiningBtn: document.getElementById('stopMiningBtn'),
            pauseMiningBtn: document.getElementById('pauseMiningBtn'),
            algorithmGrid: document.getElementById('algorithmGrid'),
            connectionStatus: document.getElementById('connectionStatus'),
            userInfo: document.getElementById('userInfo'),
            userName: document.getElementById('userName'),
            userBalance: document.getElementById('userBalance'),
            userBalanceDisplay: document.getElementById('userBalanceDisplay'),
            totalMinedDisplay: document.getElementById('totalMinedDisplay'),
            miningPowerDisplay: document.getElementById('miningPowerDisplay'),
            miningLevelDisplay: document.getElementById('miningLevelDisplay'),
            hashRateDisplay: document.getElementById('hashRateDisplay'),
            tokensPerSecondDisplay: document.getElementById('tokensPerSecondDisplay'),
            efficiencyDisplay: document.getElementById('efficiencyDisplay'),
            energyDisplay: document.getElementById('energyDisplay'),
            temperatureDisplay: document.getElementById('temperatureDisplay'),
            stabilityDisplay: document.getElementById('stabilityDisplay'),
            progressBarFill: document.getElementById('progressBarFill'),
            progressPercentage: document.getElementById('progressPercentage'),
            sessionTimeDisplay: document.getElementById('sessionTimeDisplay'),
            sessionTokensDisplay: document.getElementById('sessionTokensDisplay'),
            totalHashesDisplay: document.getElementById('totalHashesDisplay'),
            equipmentGrid: document.getElementById('equipmentGrid'),
            leaderboardList: document.getElementById('leaderboardList')
        };
    }
    
    /**
     * Configurar event listeners
     */
    setupEventListeners() {
        // Botones de minería
        if (this.elements.startMiningBtn) {
            this.elements.startMiningBtn.addEventListener('click', () => this.startMining());
        }
        
        if (this.elements.stopMiningBtn) {
            this.elements.stopMiningBtn.addEventListener('click', () => this.stopMining());
        }
        
        if (this.elements.pauseMiningBtn) {
            this.elements.pauseMiningBtn.addEventListener('click', () => this.pauseMining());
        }
        
        // Formularios de autenticación
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');
        const showRegister = document.getElementById('showRegister');
        const showLogin = document.getElementById('showLogin');
        
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }
        
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => this.handleRegister(e));
        }
        
        if (showRegister) {
            showRegister.addEventListener('click', (e) => {
                e.preventDefault();
                this.showRegisterForm();
            });
        }
        
        if (showLogin) {
            showLogin.addEventListener('click', (e) => {
                e.preventDefault();
                this.showLoginForm();
            });
        }
        
        // Modales
        const settingsBtn = document.getElementById('settingsBtn');
        const helpBtn = document.getElementById('helpBtn');
        const closeSettingsModal = document.getElementById('closeSettingsModal');
        const closeHelpModal = document.getElementById('closeHelpModal');
        
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => this.showSettingsModal());
        }
        
        if (helpBtn) {
            helpBtn.addEventListener('click', () => this.showHelpModal());
        }
        
        if (closeSettingsModal) {
            closeSettingsModal.addEventListener('click', () => this.hideSettingsModal());
        }
        
        if (closeHelpModal) {
            closeHelpModal.addEventListener('click', () => this.hideHelpModal());
        }
        
        // Tabs del leaderboard
        const tabBtns = document.querySelectorAll('.tab-btn');
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => this.switchLeaderboardTab(btn.dataset.period));
        });
        
        // Event listeners del motor de minería
        if (window.RSCQuantumMining) {
            window.RSCQuantumMining.on('miningStarted', (data) => this.handleMiningStarted(data));
            window.RSCQuantumMining.on('miningStopped', (data) => this.handleMiningStopped(data));
            window.RSCQuantumMining.on('miningPaused', (data) => this.handleMiningPaused(data));
            window.RSCQuantumMining.on('miningResumed', (data) => this.handleMiningResumed(data));
            window.RSCQuantumMining.on('hashFound', (data) => this.handleHashFound(data));
            window.RSCQuantumMining.on('metricsUpdate', (data) => this.handleMetricsUpdate(data));
            window.RSCQuantumMining.on('miningError', (data) => this.handleMiningError(data));
        }
        
        // Event listeners del sistema de sincronización
        if (window.RSCRealTimeSync) {
            window.RSCRealTimeSync.on('connected', () => this.handleConnectionEstablished());
            window.RSCRealTimeSync.on('disconnected', () => this.handleConnectionLost());
            window.RSCRealTimeSync.on('miningUpdate', (data) => this.handleRemoteMiningUpdate(data));
            window.RSCRealTimeSync.on('userUpdate', (data) => this.handleUserUpdate(data));
            window.RSCRealTimeSync.on('notification', (data) => this.showNotification(data));
        }
    }
    
    /**
     * Inicializar animaciones
     */
    initializeAnimations() {
        // Animación de partículas cuánticas
        this.createQuantumParticles();
        
        // Animación de ondas
        this.createQuantumWaves();
        
        // Animación de grid
        this.createQuantumGrid();
        
        // Animación de logo
        this.animateLogo();
    }
    
    /**
     * Crear partículas cuánticas
     */
    createQuantumParticles() {
        const particlesContainer = document.querySelector('.quantum-particles');
        if (!particlesContainer) return;
        
        for (let i = 0; i < 50; i++) {
            const particle = document.createElement('div');
            particle.className = 'quantum-particle';
            particle.style.cssText = `
                position: absolute;
                width: 2px;
                height: 2px;
                background: var(--quantum-primary);
                border-radius: 50%;
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
                animation: quantumFloat ${5 + Math.random() * 10}s linear infinite;
                opacity: ${0.3 + Math.random() * 0.7};
            `;
            particlesContainer.appendChild(particle);
        }
    }
    
    /**
     * Crear ondas cuánticas
     */
    createQuantumWaves() {
        const wavesContainer = document.querySelector('.quantum-waves');
        if (!wavesContainer) return;
        
        for (let i = 0; i < 3; i++) {
            const wave = document.createElement('div');
            wave.className = 'quantum-wave';
            wave.style.cssText = `
                position: absolute;
                width: 200%;
                height: 200%;
                background: linear-gradient(45deg, transparent 30%, rgba(0, 212, 255, 0.1) 50%, transparent 70%);
                animation: quantumWave ${10 + i * 5}s ease-in-out infinite;
                animation-delay: ${i * 2}s;
            `;
            wavesContainer.appendChild(wave);
        }
    }
    
    /**
     * Crear grid cuántico
     */
    createQuantumGrid() {
        const gridContainer = document.querySelector('.quantum-grid');
        if (!gridContainer) return;
        
        // El grid ya está definido en CSS, solo agregamos animación
        gridContainer.style.animation = 'quantumGrid 20s linear infinite';
    }
    
    /**
     * Animar logo
     */
    animateLogo() {
        const logo = document.querySelector('.quantum-logo');
        if (!logo) return;
        
        // Agregar efecto de hover
        logo.addEventListener('mouseenter', () => {
            logo.style.transform = 'scale(1.1)';
            logo.style.transition = 'transform 0.3s ease';
        });
        
        logo.addEventListener('mouseleave', () => {
            logo.style.transform = 'scale(1)';
        });
    }
    
    /**
     * Cargar algoritmos
     */
    async loadAlgorithms() {
        try {
            const algorithms = [
                {
                    id: 'quantum',
                    name: 'Quantum Core',
                    description: 'Algoritmo cuántico de última generación',
                    efficiency: 150,
                    powerConsumption: 0.8,
                    icon: 'fas fa-atom',
                    color: 'var(--quantum-primary)'
                },
                {
                    id: 'neural',
                    name: 'Neural Network',
                    description: 'Red neuronal adaptativa',
                    efficiency: 120,
                    powerConsumption: 0.6,
                    icon: 'fas fa-brain',
                    color: 'var(--quantum-secondary)'
                },
                {
                    id: 'hybrid',
                    name: 'Hybrid Fusion',
                    description: 'Combinación cuántica-neural',
                    efficiency: 180,
                    powerConsumption: 1.2,
                    icon: 'fas fa-sync-alt',
                    color: 'var(--quantum-accent)'
                },
                {
                    id: 'adaptive',
                    name: 'Adaptive Matrix',
                    description: 'Algoritmo auto-adaptativo',
                    efficiency: 200,
                    powerConsumption: 1.5,
                    icon: 'fas fa-cogs',
                    color: 'var(--quantum-light)'
                }
            ];
            
            this.renderAlgorithms(algorithms);
            
        } catch (error) {
            console.error('❌ Error cargando algoritmos:', error);
        }
    }
    
    /**
     * Renderizar algoritmos
     */
    renderAlgorithms(algorithms) {
        if (!this.elements.algorithmGrid) return;
        
        this.elements.algorithmGrid.innerHTML = '';
        
        algorithms.forEach((algorithm, index) => {
            const algorithmCard = document.createElement('div');
            algorithmCard.className = `algorithm-card ${algorithm.id}`;
            algorithmCard.innerHTML = `
                <div class="algorithm-icon">
                    <i class="${algorithm.icon}"></i>
                </div>
                <div class="algorithm-name">${algorithm.name}</div>
                <div class="algorithm-description">${algorithm.description}</div>
                <div class="algorithm-stats">
                    <div class="algorithm-stat">
                        <div class="algorithm-stat-label">Efficiency</div>
                        <div class="algorithm-stat-value">${algorithm.efficiency}%</div>
                    </div>
                    <div class="algorithm-stat">
                        <div class="algorithm-stat-label">Power</div>
                        <div class="algorithm-stat-value">${algorithm.powerConsumption}x</div>
                    </div>
                </div>
            `;
            
            // Agregar event listener
            algorithmCard.addEventListener('click', () => this.selectAlgorithm(algorithm.id));
            
            // Animación de entrada
            algorithmCard.style.opacity = '0';
            algorithmCard.style.transform = 'translateY(20px)';
            
            this.elements.algorithmGrid.appendChild(algorithmCard);
            
            // Animar entrada
            setTimeout(() => {
                algorithmCard.style.transition = 'all 0.3s ease';
                algorithmCard.style.opacity = '1';
                algorithmCard.style.transform = 'translateY(0)';
            }, index * 100);
        });
    }
    
    /**
     * Seleccionar algoritmo
     */
    selectAlgorithm(algorithmId) {
        // Remover selección anterior
        document.querySelectorAll('.algorithm-card').forEach(card => {
            card.classList.remove('selected');
        });
        
        // Seleccionar nuevo algoritmo
        const selectedCard = document.querySelector(`.algorithm-card.${algorithmId}`);
        if (selectedCard) {
            selectedCard.classList.add('selected');
            this.currentAlgorithm = algorithmId;
            
            // Animación de selección
            selectedCard.style.transform = 'scale(1.05)';
            setTimeout(() => {
                selectedCard.style.transform = 'scale(1)';
            }, 200);
        }
    }
    
    /**
     * Iniciar minería
     */
    async startMining() {
        try {
            if (!window.RSCQuantumMining) {
                throw new Error('Mining engine not available');
            }
            
            if (!this.uiState.isAuthenticated) {
                this.showNotification({
                    type: 'error',
                    message: 'Please sign in to start mining',
                    duration: 5000
                });
                return;
            }
            
            // Deshabilitar botón
            this.elements.startMiningBtn.disabled = true;
            this.elements.startMiningBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>Starting...</span>';
            
            // Iniciar minería
            const result = await window.RSCQuantumMining.startMining(
                this.uiState.currentUser.id,
                this.currentAlgorithm
            );
            
            if (result.success) {
                this.isMining = true;
                this.updateMiningStatus('active');
                this.showNotification({
                    type: 'success',
                    message: 'Quantum mining started successfully!',
                    duration: 3000
                });
            }
            
        } catch (error) {
            console.error('❌ Error iniciando minería:', error);
            this.showNotification({
                type: 'error',
                message: error.message,
                duration: 5000
            });
        } finally {
            // Restaurar botón
            this.elements.startMiningBtn.disabled = false;
            this.elements.startMiningBtn.innerHTML = '<i class="fas fa-play"></i><span>Start Quantum Mining</span>';
        }
    }
    
    /**
     * Detener minería
     */
    async stopMining() {
        try {
            if (!window.RSCQuantumMining) {
                throw new Error('Mining engine not available');
            }
            
            // Deshabilitar botón
            this.elements.stopMiningBtn.disabled = true;
            this.elements.stopMiningBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>Stopping...</span>';
            
            // Detener minería
            const result = await window.RSCQuantumMining.stopMining();
            
            if (result.success) {
                this.isMining = false;
                this.updateMiningStatus('ready');
                this.showNotification({
                    type: 'success',
                    message: `Mining stopped. Mined ${result.tokensMined.toFixed(6)} RSC`,
                    duration: 5000
                });
            }
            
        } catch (error) {
            console.error('❌ Error deteniendo minería:', error);
            this.showNotification({
                type: 'error',
                message: error.message,
                duration: 5000
            });
        } finally {
            // Restaurar botón
            this.elements.stopMiningBtn.disabled = false;
            this.elements.stopMiningBtn.innerHTML = '<i class="fas fa-stop"></i><span>Stop Mining</span>';
        }
    }
    
    /**
     * Pausar minería
     */
    pauseMining() {
        if (window.RSCQuantumMining) {
            window.RSCQuantumMining.pauseMining();
            this.updateMiningStatus('paused');
        }
    }
    
    /**
     * Actualizar estado de minería
     */
    updateMiningStatus(status) {
        this.uiState.miningStatus = status;
        
        // Actualizar botones
        if (status === 'active') {
            this.elements.startMiningBtn.classList.add('hidden');
            this.elements.stopMiningBtn.classList.remove('hidden');
            this.elements.pauseMiningBtn.classList.remove('hidden');
        } else if (status === 'paused') {
            this.elements.startMiningBtn.classList.add('hidden');
            this.elements.stopMiningBtn.classList.remove('hidden');
            this.elements.pauseMiningBtn.classList.remove('hidden');
        } else {
            this.elements.startMiningBtn.classList.remove('hidden');
            this.elements.stopMiningBtn.classList.add('hidden');
            this.elements.pauseMiningBtn.classList.add('hidden');
        }
        
        // Actualizar indicador de estado
        const statusIndicator = document.querySelector('.mining-status .status-indicator .status-dot');
        const statusText = document.querySelector('.mining-status .status-text');
        
        if (statusIndicator && statusText) {
            statusIndicator.className = `status-dot ${status}`;
            statusText.textContent = this.getStatusText(status);
        }
    }
    
    /**
     * Obtener texto de estado
     */
    getStatusText(status) {
        const statusTexts = {
            ready: 'Ready to Start',
            active: 'Mining Active',
            paused: 'Mining Paused',
            stopped: 'Mining Stopped',
            error: 'Mining Error'
        };
        return statusTexts[status] || 'Unknown';
    }
    
    /**
     * Manejar inicio de minería
     */
    handleMiningStarted(data) {
        console.log('🚀 Minería iniciada:', data);
        this.updateMiningStatus('active');
        this.animateMiningStart();
    }
    
    /**
     * Manejar detención de minería
     */
    handleMiningStopped(data) {
        console.log('⏹️ Minería detenida:', data);
        this.updateMiningStatus('ready');
        this.animateMiningStop();
    }
    
    /**
     * Manejar pausa de minería
     */
    handleMiningPaused(data) {
        console.log('⏸️ Minería pausada:', data);
        this.updateMiningStatus('paused');
    }
    
    /**
     * Manejar reanudación de minería
     */
    handleMiningResumed(data) {
        console.log('▶️ Minería reanudada:', data);
        this.updateMiningStatus('active');
    }
    
    /**
     * Manejar hash encontrado
     */
    handleHashFound(data) {
        console.log('💎 Hash encontrado:', data);
        this.animateHashFound(data);
    }
    
    /**
     * Manejar actualización de métricas
     */
    handleMetricsUpdate(data) {
        this.updateMetricsDisplay(data);
    }
    
    /**
     * Manejar error de minería
     */
    handleMiningError(data) {
        console.error('❌ Error de minería:', data);
        this.updateMiningStatus('error');
        this.showNotification({
            type: 'error',
            message: data.error,
            duration: 5000
        });
    }
    
    /**
     * Actualizar display de métricas
     */
    updateMetricsDisplay(data) {
        const { metrics, state } = data;
        
        // Actualizar métricas en tiempo real
        if (this.elements.hashRateDisplay) {
            this.elements.hashRateDisplay.textContent = `${metrics.hashRate.toFixed(2)} H/s`;
        }
        
        if (this.elements.tokensPerSecondDisplay) {
            this.elements.tokensPerSecondDisplay.textContent = `${metrics.tokensPerSecond.toFixed(6)} RSC/s`;
        }
        
        if (this.elements.efficiencyDisplay) {
            this.elements.efficiencyDisplay.textContent = `${metrics.efficiency.toFixed(1)}%`;
        }
        
        if (this.elements.energyDisplay) {
            this.elements.energyDisplay.textContent = `${metrics.energyConsumption.toFixed(2)} kWh`;
        }
        
        if (this.elements.temperatureDisplay) {
            this.elements.temperatureDisplay.textContent = `${metrics.temperature.toFixed(1)}°C`;
        }
        
        if (this.elements.stabilityDisplay) {
            this.elements.stabilityDisplay.textContent = `${metrics.stability.toFixed(1)}%`;
        }
        
        // Actualizar barras de progreso
        this.updateProgressBars(metrics);
        
        // Actualizar tokens minados
        if (this.elements.sessionTokensDisplay) {
            this.elements.sessionTokensDisplay.textContent = `${state.tokensMined.toFixed(6)} RSC`;
        }
        
        // Actualizar hashes totales
        if (this.elements.totalHashesDisplay) {
            this.elements.totalHashesDisplay.textContent = state.totalHashes.toLocaleString();
        }
        
        // Actualizar tiempo de sesión
        if (this.elements.sessionTimeDisplay && state.sessionStartTime) {
            const elapsed = Date.now() - state.sessionStartTime;
            const hours = Math.floor(elapsed / 3600000);
            const minutes = Math.floor((elapsed % 3600000) / 60000);
            const seconds = Math.floor((elapsed % 60000) / 1000);
            this.elements.sessionTimeDisplay.textContent = 
                `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
    }
    
    /**
     * Actualizar barras de progreso
     */
    updateProgressBars(metrics) {
        // Hash rate progress
        const hashRateProgress = document.getElementById('hashRateProgress');
        if (hashRateProgress) {
            const percentage = Math.min(100, (metrics.hashRate / 1000) * 100);
            hashRateProgress.style.width = `${percentage}%`;
        }
        
        // Tokens progress
        const tokensProgress = document.getElementById('tokensProgress');
        if (tokensProgress) {
            const percentage = Math.min(100, metrics.tokensPerSecond * 1000000);
            tokensProgress.style.width = `${percentage}%`;
        }
        
        // Efficiency progress
        const efficiencyProgress = document.getElementById('efficiencyProgress');
        if (efficiencyProgress) {
            efficiencyProgress.style.width = `${metrics.efficiency}%`;
        }
        
        // Energy progress
        const energyProgress = document.getElementById('energyProgress');
        if (energyProgress) {
            const percentage = Math.min(100, (metrics.energyConsumption / 10) * 100);
            energyProgress.style.width = `${percentage}%`;
        }
        
        // Temperature progress
        const temperatureProgress = document.getElementById('temperatureProgress');
        if (temperatureProgress) {
            const percentage = Math.min(100, (metrics.temperature / 100) * 100);
            temperatureProgress.style.width = `${percentage}%`;
        }
        
        // Stability progress
        const stabilityProgress = document.getElementById('stabilityProgress');
        if (stabilityProgress) {
            stabilityProgress.style.width = `${metrics.stability}%`;
        }
    }
    
    /**
     * Animar inicio de minería
     */
    animateMiningStart() {
        // Efecto de partículas
        this.createMiningParticles();
        
        // Efecto de ondas
        this.createMiningWaves();
        
        // Animación de la barra de progreso
        if (this.elements.progressBarFill) {
            this.elements.progressBarFill.style.animation = 'progressParticles 2s linear infinite';
        }
    }
    
    /**
     * Animar detención de minería
     */
    animateMiningStop() {
        // Detener animaciones
        if (this.elements.progressBarFill) {
            this.elements.progressBarFill.style.animation = 'none';
        }
        
        // Limpiar partículas
        document.querySelectorAll('.mining-particle').forEach(particle => {
            particle.remove();
        });
    }
    
    /**
     * Animar hash encontrado
     */
    animateHashFound(data) {
        // Crear efecto visual de hash encontrado
        const effect = document.createElement('div');
        effect.className = 'hash-found-effect';
        effect.innerHTML = `
            <div class="hash-effect-content">
                <i class="fas fa-gem"></i>
                <span>Hash Found!</span>
                <div class="hash-value">${data.hash.substring(0, 8)}...</div>
            </div>
        `;
        
        effect.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: var(--gradient-quantum);
            color: var(--quantum-dark);
            padding: 1rem 2rem;
            border-radius: var(--border-radius);
            font-weight: 700;
            z-index: 10000;
            animation: hashFoundAnimation 2s ease-out forwards;
        `;
        
        document.body.appendChild(effect);
        
        // Remover después de la animación
        setTimeout(() => {
            effect.remove();
        }, 2000);
    }
    
    /**
     * Crear partículas de minería
     */
    createMiningParticles() {
        const container = document.querySelector('.progress-bar-container');
        if (!container) return;
        
        for (let i = 0; i < 20; i++) {
            const particle = document.createElement('div');
            particle.className = 'mining-particle';
            particle.style.cssText = `
                position: absolute;
                width: 4px;
                height: 4px;
                background: var(--quantum-primary);
                border-radius: 50%;
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
                animation: miningParticleFloat ${2 + Math.random() * 3}s linear infinite;
                pointer-events: none;
            `;
            container.appendChild(particle);
        }
    }
    
    /**
     * Crear ondas de minería
     */
    createMiningWaves() {
        const container = document.querySelector('.progress-bar-container');
        if (!container) return;
        
        for (let i = 0; i < 3; i++) {
            const wave = document.createElement('div');
            wave.className = 'mining-wave';
            wave.style.cssText = `
                position: absolute;
                width: 100%;
                height: 100%;
                border: 2px solid var(--quantum-primary);
                border-radius: 10px;
                animation: miningWave ${1 + i * 0.5}s ease-out infinite;
                animation-delay: ${i * 0.3}s;
                pointer-events: none;
            `;
            container.appendChild(wave);
        }
    }
    
    /**
     * Manejar login
     */
    async handleLogin(e) {
        e.preventDefault();
        
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        try {
            // Aquí se implementaría la lógica de login real
            console.log('Login attempt:', { email, password });
            
            // Simular login exitoso
            this.uiState.isAuthenticated = true;
            this.uiState.currentUser = {
                id: 'user_' + Date.now(),
                email: email,
                username: email.split('@')[0],
                balance: 0,
                miningPower: 1.0,
                miningLevel: 1
            };
            
            this.showMiningDashboard();
            this.showNotification({
                type: 'success',
                message: 'Welcome to Quantum Mining!',
                duration: 3000
            });
            
        } catch (error) {
            console.error('❌ Error en login:', error);
            this.showNotification({
                type: 'error',
                message: 'Login failed. Please try again.',
                duration: 5000
            });
        }
    }
    
    /**
     * Manejar registro
     */
    async handleRegister(e) {
        e.preventDefault();
        
        const email = document.getElementById('registerEmail').value;
        const username = document.getElementById('registerUsername').value;
        const password = document.getElementById('registerPassword').value;
        const referralCode = document.getElementById('referralCode').value;
        
        try {
            // Aquí se implementaría la lógica de registro real
            console.log('Register attempt:', { email, username, password, referralCode });
            
            // Simular registro exitoso
            this.uiState.isAuthenticated = true;
            this.uiState.currentUser = {
                id: 'user_' + Date.now(),
                email: email,
                username: username,
                balance: 0,
                miningPower: 1.0,
                miningLevel: 1
            };
            
            this.showMiningDashboard();
            this.showNotification({
                type: 'success',
                message: 'Account created successfully!',
                duration: 3000
            });
            
        } catch (error) {
            console.error('❌ Error en registro:', error);
            this.showNotification({
                type: 'error',
                message: 'Registration failed. Please try again.',
                duration: 5000
            });
        }
    }
    
    /**
     * Mostrar formulario de registro
     */
    showRegisterForm() {
        document.getElementById('loginForm').classList.remove('active');
        document.getElementById('registerForm').classList.add('active');
    }
    
    /**
     * Mostrar formulario de login
     */
    showLoginForm() {
        document.getElementById('registerForm').classList.remove('active');
        document.getElementById('loginForm').classList.add('active');
    }
    
    /**
     * Mostrar dashboard de minería
     */
    showMiningDashboard() {
        if (this.elements.authSection) {
            this.elements.authSection.classList.add('hidden');
        }
        
        if (this.elements.miningDashboard) {
            this.elements.miningDashboard.classList.remove('hidden');
            this.elements.miningDashboard.classList.add('active');
        }
        
        // Mostrar información del usuario
        if (this.elements.userInfo) {
            this.elements.userInfo.style.display = 'flex';
        }
        
        if (this.elements.userName) {
            this.elements.userName.textContent = this.uiState.currentUser.username;
        }
        
        if (this.elements.userBalance) {
            this.elements.userBalance.textContent = `${this.uiState.currentUser.balance.toFixed(6)} RSC`;
        }
        
        // Actualizar display de métricas
        this.updateUserStats();
    }
    
    /**
     * Actualizar estadísticas del usuario
     */
    updateUserStats() {
        if (!this.uiState.currentUser) return;
        
        const user = this.uiState.currentUser;
        
        if (this.elements.userBalanceDisplay) {
            this.elements.userBalanceDisplay.textContent = `${user.balance.toFixed(6)} RSC`;
        }
        
        if (this.elements.totalMinedDisplay) {
            this.elements.totalMinedDisplay.textContent = `${user.totalMined || 0} RSC`;
        }
        
        if (this.elements.miningPowerDisplay) {
            this.elements.miningPowerDisplay.textContent = `${user.miningPower.toFixed(2)}x`;
        }
        
        if (this.elements.miningLevelDisplay) {
            this.elements.miningLevelDisplay.textContent = user.miningLevel;
        }
    }
    
    /**
     * Verificar autenticación
     */
    async checkAuthentication() {
        // Aquí se verificaría la autenticación real
        // Por ahora, simular que no está autenticado
        this.uiState.isAuthenticated = false;
    }
    
    /**
     * Configurar notificaciones
     */
    setupNotifications() {
        // Crear contenedor de notificaciones si no existe
        if (!document.getElementById('notificationsContainer')) {
            const container = document.createElement('div');
            container.id = 'notificationsContainer';
            container.className = 'notifications-container';
            document.body.appendChild(container);
        }
    }
    
    /**
     * Mostrar notificación
     */
    showNotification(data) {
        const { type, message, duration = 5000 } = data;
        
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${this.getNotificationIcon(type)}"></i>
                <span>${message}</span>
            </div>
        `;
        
        const container = document.getElementById('notificationsContainer');
        if (container) {
            container.appendChild(notification);
            
            // Remover después de la duración
            setTimeout(() => {
                notification.style.animation = 'slideOutRight 0.3s ease forwards';
                setTimeout(() => {
                    notification.remove();
                }, 300);
            }, duration);
        }
    }
    
    /**
     * Obtener icono de notificación
     */
    getNotificationIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };
        return icons[type] || 'info-circle';
    }
    
    /**
     * Mostrar modal de configuración
     */
    showSettingsModal() {
        const modal = document.getElementById('settingsModal');
        if (modal) {
            modal.classList.add('active');
        }
    }
    
    /**
     * Ocultar modal de configuración
     */
    hideSettingsModal() {
        const modal = document.getElementById('settingsModal');
        if (modal) {
            modal.classList.remove('active');
        }
    }
    
    /**
     * Mostrar modal de ayuda
     */
    showHelpModal() {
        const modal = document.getElementById('helpModal');
        if (modal) {
            modal.classList.add('active');
        }
    }
    
    /**
     * Ocultar modal de ayuda
     */
    hideHelpModal() {
        const modal = document.getElementById('helpModal');
        if (modal) {
            modal.classList.remove('active');
        }
    }
    
    /**
     * Cambiar tab del leaderboard
     */
    switchLeaderboardTab(period) {
        // Remover clase active de todos los tabs
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Agregar clase active al tab seleccionado
        const selectedTab = document.querySelector(`[data-period="${period}"]`);
        if (selectedTab) {
            selectedTab.classList.add('active');
        }
        
        // Cargar datos del leaderboard
        this.loadLeaderboard(period);
    }
    
    /**
     * Cargar leaderboard
     */
    async loadLeaderboard(period = 'all') {
        try {
            // Aquí se cargarían los datos reales del leaderboard
            const mockData = [
                { rank: 1, username: 'QuantumMiner', totalMined: 1250.5, level: 15 },
                { rank: 2, username: 'NeuralNet', totalMined: 1100.2, level: 12 },
                { rank: 3, username: 'HybridFusion', totalMined: 950.8, level: 10 },
                { rank: 4, username: 'AdaptiveMatrix', totalMined: 800.3, level: 8 },
                { rank: 5, username: 'CryptoMiner', totalMined: 750.1, level: 7 }
            ];
            
            this.renderLeaderboard(mockData);
            
        } catch (error) {
            console.error('❌ Error cargando leaderboard:', error);
        }
    }
    
    /**
     * Renderizar leaderboard
     */
    renderLeaderboard(data) {
        if (!this.elements.leaderboardList) return;
        
        this.elements.leaderboardList.innerHTML = '';
        
        data.forEach((item, index) => {
            const leaderboardItem = document.createElement('div');
            leaderboardItem.className = 'leaderboard-item';
            leaderboardItem.innerHTML = `
                <div class="leaderboard-rank">${item.rank}</div>
                <div class="leaderboard-info">
                    <div class="leaderboard-username">${item.username}</div>
                    <div class="leaderboard-stats">Level ${item.level}</div>
                </div>
                <div class="leaderboard-value">${item.totalMined.toFixed(2)} RSC</div>
            `;
            
            // Animación de entrada
            leaderboardItem.style.opacity = '0';
            leaderboardItem.style.transform = 'translateX(20px)';
            
            this.elements.leaderboardList.appendChild(leaderboardItem);
            
            setTimeout(() => {
                leaderboardItem.style.transition = 'all 0.3s ease';
                leaderboardItem.style.opacity = '1';
                leaderboardItem.style.transform = 'translateX(0)';
            }, index * 100);
        });
    }
    
    /**
     * Manejar conexión establecida
     */
    handleConnectionEstablished() {
        this.uiState.connectionStatus = 'connected';
        this.updateConnectionStatus();
    }
    
    /**
     * Manejar conexión perdida
     */
    handleConnectionLost() {
        this.uiState.connectionStatus = 'disconnected';
        this.updateConnectionStatus();
    }
    
    /**
     * Actualizar estado de conexión
     */
    updateConnectionStatus() {
        const statusDot = document.querySelector('.connection-status .status-dot');
        const statusText = document.querySelector('.connection-status .status-value');
        
        if (statusDot && statusText) {
            statusDot.className = `status-dot ${this.uiState.connectionStatus}`;
            statusText.textContent = this.uiState.connectionStatus === 'connected' ? 'Connected' : 'Disconnected';
        }
    }
    
    /**
     * Manejar actualización remota de minería
     */
    handleRemoteMiningUpdate(data) {
        console.log('📡 Actualización remota de minería:', data);
        this.updateMetricsDisplay(data);
    }
    
    /**
     * Manejar actualización de usuario
     */
    handleUserUpdate(data) {
        console.log('👤 Actualización de usuario:', data);
        if (this.uiState.currentUser) {
            Object.assign(this.uiState.currentUser, data);
            this.updateUserStats();
        }
    }
    
    /**
     * Obtener estado de la UI
     */
    getUIState() {
        return {
            isInitialized: this.isInitialized,
            isAuthenticated: this.uiState.isAuthenticated,
            currentUser: this.uiState.currentUser,
            selectedAlgorithm: this.currentAlgorithm,
            miningStatus: this.uiState.miningStatus,
            connectionStatus: this.uiState.connectionStatus
        };
    }
    
    /**
     * Limpiar recursos
     */
    cleanup() {
        // Limpiar animaciones
        this.animations.clear();
        
        // Limpiar notificaciones
        document.querySelectorAll('.notification').forEach(notification => {
            notification.remove();
        });
        
        // Limpiar partículas
        document.querySelectorAll('.quantum-particle, .mining-particle').forEach(particle => {
            particle.remove();
        });
        
        console.log('🧹 Quantum Mining UI limpiada');
    }
}

// Exportar para uso global
window.QuantumMiningUI = QuantumMiningUI;

// Crear instancia global
window.RSCQuantumMiningUI = new QuantumMiningUI();

console.log('🎨 RSC Quantum Mining UI v2.0.0 - INICIADA');
