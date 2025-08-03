/* ===== MINING FUNCTIONALITY ===== */

class MiningManager {
    constructor() {
        this.isMining = false;
        this.miningSession = null;
        this.hashRate = 0;
        this.totalRewards = 0;
        this.userLevel = 1;
        this.efficiency = 85;
        this.miningHistory = [];
        this.isInitialized = false;
        this.updateInterval = null;
        this.init();
    }

    async init() {
        try {
            // Load saved mining data
            this.loadMiningData();
            
            this.setupEventListeners();
            this.setupSidebarNavigation();
            this.showPage('overview');
            this.isInitialized = true;
            
            // Start real-time updates
            this.startRealTimeUpdates();
            
        } catch (error) {
            console.error('Mining initialization failed:', error);
            showNotification('error', 'Mining Error', 'Failed to initialize mining system');
        }
    }

    setupEventListeners() {
        // Mining controls
        document.addEventListener('click', (e) => {
            if (e.target.matches('.mining-control-btn')) {
                const action = e.target.dataset.action;
                this.handleMiningAction(action);
            }
            
            if (e.target.matches('.claim-btn')) {
                this.handleClaimRewards();
            }
        });

        // Form submissions
        document.addEventListener('submit', (e) => {
            if (e.target.matches('#mining-settings-form')) {
                e.preventDefault();
                this.handleMiningSettings();
            }
        });

        // Progress updates
        document.addEventListener('input', (e) => {
            if (e.target.matches('.efficiency-slider')) {
                this.updateEfficiency(e.target.value);
            }
        });
    }

    setupSidebarNavigation() {
        const navLinks = document.querySelectorAll('.mining-nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = link.dataset.page;
                this.showPage(page);
                
                // Update active state
                navLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
            });
        });
    }

    loadMiningData() {
        // Load from localStorage
        const savedSession = localStorage.getItem('rsc_mining_session');
        const savedHistory = localStorage.getItem('rsc_mining_history');
        const savedStats = localStorage.getItem('rsc_mining_stats');
        
        if (savedSession) {
            this.miningSession = JSON.parse(savedSession);
            this.isMining = this.miningSession.isActive;
        }
        
        if (savedHistory) {
            this.miningHistory = JSON.parse(savedHistory);
        }
        
        if (savedStats) {
            const stats = JSON.parse(savedStats);
            this.totalRewards = stats.totalRewards || 0;
            this.userLevel = stats.userLevel || 1;
            this.efficiency = stats.efficiency || 85;
        }
    }

    saveMiningData() {
        localStorage.setItem('rsc_mining_session', JSON.stringify(this.miningSession));
        localStorage.setItem('rsc_mining_history', JSON.stringify(this.miningHistory));
        localStorage.setItem('rsc_mining_stats', JSON.stringify({
            totalRewards: this.totalRewards,
            userLevel: this.userLevel,
            efficiency: this.efficiency
        }));
    }

    async handleMiningAction(action) {
        switch (action) {
            case 'start':
                await this.startMining();
                break;
            case 'stop':
                await this.stopMining();
                break;
            case 'pause':
                await this.pauseMining();
                break;
            case 'resume':
                await this.resumeMining();
                break;
            default:
                console.log('Unknown mining action:', action);
        }
    }

    async startMining() {
        if (this.isMining) {
            showNotification('warning', 'Already Mining', 'Mining is already active');
            return;
        }

        try {
            // Obtener dirección de wallet actual
            const currentWallet = JSON.parse(localStorage.getItem('rsc_wallet'));
            if (!currentWallet || !currentWallet.address) {
                showNotification('error', 'Wallet Required', 'Please connect a wallet first');
                return;
            }

            // Iniciar minería en la blockchain real
            if (window.blockchainConnection && window.blockchainConnection.isConnected) {
                const miningData = {
                    address: currentWallet.address,
                    efficiency: this.efficiency,
                    timestamp: new Date().toISOString()
                };

                const result = await window.blockchainConnection.startMining(miningData);
                
                if (result.success) {
                    this.isMining = true;
                    this.miningSession = {
                        id: result.data.sessionId || this.generateSessionId(),
                        startTime: new Date().toISOString(),
                        isActive: true,
                        address: currentWallet.address,
                        efficiency: this.efficiency,
                        hashRate: result.data.hashRate || 0,
                        rewards: 0
                    };

                    // Guardar sesión local
                    this.saveMiningData();
                    
                    // Iniciar actualizaciones en tiempo real
                    this.startProgressUpdates();
                    
                    // Actualizar UI
                    this.updateMiningUI();
                    
                    showNotification('success', 'Mining Started', 'Successfully started mining on blockchain');
                    
                } else {
                    console.error('Error iniciando minería:', result.error);
                    showNotification('error', 'Mining Error', 'Failed to start mining on blockchain');
                }
            } else {
                console.warn('⚠️ No conectado a blockchain, iniciando minería local');
                
                // Iniciar minería local
                this.isMining = true;
                this.miningSession = {
                    id: this.generateSessionId(),
                    startTime: new Date().toISOString(),
                    isActive: true,
                    address: currentWallet.address,
                    efficiency: this.efficiency,
                    hashRate: this.calculateHashRate(),
                    rewards: 0
                };

                // Guardar sesión local
                this.saveMiningData();
                
                // Iniciar actualizaciones en tiempo real
                this.startProgressUpdates();
                
                // Actualizar UI
                this.updateMiningUI();
                
                showNotification('success', 'Mining Started', 'Mining started (offline mode)');
            }
            
        } catch (error) {
            console.error('Failed to start mining:', error);
            showNotification('error', 'Mining Error', 'Failed to start mining');
        }
    }

    async stopMining() {
        if (!this.isMining) {
            showNotification('warning', 'Not Mining', 'No active mining session');
            return;
        }

        try {
            // Detener minería en la blockchain real
            if (window.blockchainConnection && window.blockchainConnection.isConnected) {
                const result = await window.blockchainConnection.stopMining(this.miningSession.address);
                
                if (result.success) {
                    // Finalizar sesión local
                    this.miningSession.isActive = false;
                    this.miningSession.endTime = new Date().toISOString();
                    this.miningSession.rewards = result.data.rewards || this.calculateSessionRewards();
                    
                    // Agregar a historial
                    this.miningHistory.unshift({
                        ...this.miningSession,
                        duration: this.calculateSessionDuration()
                    });
                    
                    // Actualizar estadísticas
                    this.totalRewards += this.miningSession.rewards;
                    
                    // Guardar datos
                    this.saveMiningData();
                    
                    // Detener actualizaciones
                    this.stopProgressUpdates();
                    
                    // Actualizar UI
                    this.updateMiningUI();
                    
                    showNotification('success', 'Mining Stopped', 'Successfully stopped mining on blockchain');
                    
                } else {
                    console.error('Error deteniendo minería:', result.error);
                    showNotification('error', 'Mining Error', 'Failed to stop mining on blockchain');
                }
            } else {
                console.warn('⚠️ No conectado a blockchain, deteniendo minería local');
                
                // Detener minería local
                this.miningSession.isActive = false;
                this.miningSession.endTime = new Date().toISOString();
                this.miningSession.rewards = this.calculateSessionRewards();
                
                // Agregar a historial
                this.miningHistory.unshift({
                    ...this.miningSession,
                    duration: this.calculateSessionDuration()
                });
                
                // Actualizar estadísticas
                this.totalRewards += this.miningSession.rewards;
                
                // Guardar datos
                this.saveMiningData();
                
                // Detener actualizaciones
                this.stopProgressUpdates();
                
                // Actualizar UI
                this.updateMiningUI();
                
                showNotification('success', 'Mining Stopped', 'Mining stopped (offline mode)');
            }
            
        } catch (error) {
            console.error('Failed to stop mining:', error);
            showNotification('error', 'Mining Error', 'Failed to stop mining');
        }
    }

    async pauseMining() {
        if (!this.isMining) {
            showNotification('warning', 'Not Mining', 'No active mining session');
            return;
        }

        this.isMining = false;
        this.miningSession.isActive = false;
        this.saveMiningData();
        this.updateMiningUI();
        this.stopProgressUpdates();

        showNotification('info', 'Mining Paused', 'Mining session paused');
    }

    async resumeMining() {
        if (this.isMining) {
            showNotification('warning', 'Already Mining', 'Mining is already active');
            return;
        }

        if (!this.miningSession) {
            showNotification('error', 'No Session', 'No mining session to resume');
            return;
        }

        this.isMining = true;
        this.miningSession.isActive = true;
        this.saveMiningData();
        this.updateMiningUI();
        this.startProgressUpdates();

        showNotification('success', 'Mining Resumed', 'Mining session resumed');
    }

    async handleClaimRewards() {
        if (this.totalRewards <= 0) {
            showNotification('warning', 'No Rewards', 'No rewards available to claim');
            return;
        }

        try {
            // Simulate API call to claim rewards
            const response = await fetch(`${API_BASE_URL}/api/mining/claim`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    amount: this.totalRewards
                })
            });

            if (response.ok) {
                const claimedAmount = this.totalRewards;
                this.totalRewards = 0;
                this.saveMiningData();
                this.updateMiningUI();

                showNotification('success', 'Rewards Claimed', `${claimedAmount.toFixed(6)} RSC claimed successfully`);
            } else {
                throw new Error('Failed to claim rewards');
            }
        } catch (error) {
            console.error('Failed to claim rewards:', error);
            showNotification('error', 'Claim Error', 'Failed to claim rewards');
        }
    }

    async handleMiningSettings() {
        const form = document.getElementById('mining-settings-form');
        const efficiency = parseInt(form.querySelector('[name="efficiency"]').value);
        const autoClaim = form.querySelector('[name="auto_claim"]').checked;

        this.efficiency = efficiency;
        localStorage.setItem('mining_auto_claim', autoClaim);
        this.saveMiningData();

        showNotification('success', 'Settings Updated', 'Mining settings saved successfully');
    }

    updateEfficiency(value) {
        this.efficiency = parseInt(value);
        const efficiencyDisplay = document.querySelector('.efficiency-value');
        if (efficiencyDisplay) {
            efficiencyDisplay.textContent = `${value}%`;
        }
    }

    startProgressUpdates() {
        this.updateInterval = setInterval(() => {
            this.updateMiningProgress();
        }, 1000);
    }

    stopProgressUpdates() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
    }

    updateMiningProgress() {
        if (!this.isMining || !this.miningSession) return;

        // Simulate hash rate fluctuations
        const baseHashRate = 1000 + (this.userLevel * 500);
        const efficiencyMultiplier = this.efficiency / 100;
        const randomFactor = 0.8 + (Math.random() * 0.4); // 80% to 120%
        
        this.hashRate = Math.floor(baseHashRate * efficiencyMultiplier * randomFactor);

        // Update progress bars
        this.updateProgressBars();
        
        // Update mining stats
        this.updateMiningStats();
    }

    updateProgressBars() {
        const progressBars = document.querySelectorAll('.progress-fill');
        progressBars.forEach(bar => {
            const type = bar.dataset.type;
            let progress = 0;

            switch (type) {
                case 'session':
                    if (this.miningSession) {
                        const startTime = new Date(this.miningSession.startTime);
                        const now = new Date();
                        const elapsed = (now - startTime) / 1000; // seconds
                        progress = Math.min((elapsed / 3600) * 100, 100); // 1 hour session
                    }
                    break;
                case 'level':
                    const levelProgress = this.calculateLevelProgress();
                    progress = levelProgress;
                    break;
                case 'efficiency':
                    progress = this.efficiency;
                    break;
            }

            bar.style.width = `${progress}%`;
        });
    }

    updateMiningStats() {
        // Update hash rate display
        const hashRateElement = document.querySelector('.mining-stat-value[data-stat="hash_rate"]');
        if (hashRateElement) {
            hashRateElement.textContent = this.formatHashRate(this.hashRate);
        }

        // Update rewards display
        const rewardsElement = document.querySelector('.mining-stat-value[data-stat="rewards"]');
        if (rewardsElement) {
            rewardsElement.textContent = this.formatNumber(this.totalRewards);
        }

        // Update level display
        const levelElement = document.querySelector('.mining-stat-value[data-stat="level"]');
        if (levelElement) {
            levelElement.textContent = this.userLevel;
        }

        // Update efficiency display
        const efficiencyElement = document.querySelector('.mining-stat-value[data-stat="efficiency"]');
        if (efficiencyElement) {
            efficiencyElement.textContent = `${this.efficiency}%`;
        }
    }

    updateMiningUI() {
        // Update status indicator
        const statusElement = document.querySelector('.mining-status-indicator');
        if (statusElement) {
            if (this.isMining) {
                statusElement.className = 'mining-status-indicator active';
                statusElement.textContent = 'Active';
            } else if (this.miningSession && !this.miningSession.isActive) {
                statusElement.className = 'mining-status-indicator paused';
                statusElement.textContent = 'Paused';
            } else {
                statusElement.className = 'mining-status-indicator inactive';
                statusElement.textContent = 'Inactive';
            }
        }

        // Update control buttons
        const controlButtons = document.querySelectorAll('.mining-control-btn');
        controlButtons.forEach(btn => {
            const action = btn.dataset.action;
            btn.classList.remove('active');
            
            if (action === 'start' && !this.isMining) {
                btn.classList.add('active');
            } else if (action === 'stop' && this.isMining) {
                btn.classList.add('active');
            } else if (action === 'pause' && this.isMining) {
                btn.classList.add('active');
            } else if (action === 'resume' && this.miningSession && !this.isMining) {
                btn.classList.add('active');
            }
        });

        // Update mining stats
        this.updateMiningStats();
    }

    updateMiningHistory() {
        const container = document.querySelector('.mining-history');
        if (!container) return;

        if (this.miningHistory.length === 0) {
            container.innerHTML = '<p class="no-history">No mining history yet</p>';
            return;
        }

        const historyHTML = this.miningHistory.map(session => this.createHistoryHTML(session)).join('');
        container.innerHTML = historyHTML;
    }

    createHistoryHTML(session) {
        const startTime = new Date(session.startTime);
        const endTime = session.endTime ? new Date(session.endTime) : null;
        const duration = endTime ? Math.floor((endTime - startTime) / 1000 / 60) : 0; // minutes

        return `
            <div class="history-item">
                <div class="history-icon">⛏️</div>
                <div class="history-details">
                    <div class="history-title">Mining Session</div>
                    <div class="history-subtitle">${startTime.toLocaleDateString()} - ${duration}min</div>
                </div>
                <div class="history-amount">+${session.rewards.toFixed(6)} RSC</div>
            </div>
        `;
    }

    updateLevelProgress() {
        const levelProgress = this.calculateLevelProgress();
        const levelElement = document.querySelector('.level-progress-label');
        if (levelElement) {
            levelElement.textContent = `Level ${this.userLevel} - ${levelProgress.toFixed(1)}%`;
        }
    }

    calculateLevelProgress() {
        const levelThreshold = this.userLevel * 1000; // 1000 rewards per level
        const currentProgress = this.totalRewards % levelThreshold;
        return (currentProgress / levelThreshold) * 100;
    }

    calculateSessionRewards() {
        if (!this.miningSession) return 0;

        const startTime = new Date(this.miningSession.startTime);
        const endTime = new Date();
        const duration = (endTime - startTime) / 1000 / 60; // minutes

        const baseRewardPerMinute = 0.001; // 0.001 RSC per minute
        const levelMultiplier = 1 + (this.userLevel - 1) * 0.1; // 10% increase per level
        const efficiencyMultiplier = this.efficiency / 100;

        return duration * baseRewardPerMinute * levelMultiplier * efficiencyMultiplier;
    }

    calculateSessionDuration() {
        if (!this.miningSession) return 0;
        const startTime = new Date(this.miningSession.startTime);
        const endTime = this.miningSession.endTime ? new Date(this.miningSession.endTime) : new Date();
        return Math.floor((endTime - startTime) / 1000 / 60); // minutes
    }

    showPage(pageName) {
        // Hide all pages
        const pages = document.querySelectorAll('.mining-page');
        pages.forEach(page => page.classList.remove('active'));
        
        // Show target page
        const targetPage = document.querySelector(`.mining-page[data-page="${pageName}"]`);
        if (targetPage) {
            targetPage.classList.add('active');
        }
        
        // Update page-specific content
        this.updatePageContent(pageName);
    }

    updatePageContent(pageName) {
        switch (pageName) {
            case 'overview':
                this.updateOverviewPage();
                break;
            case 'miners':
                this.updateMinersPage();
                break;
            case 'rewards':
                this.updateRewardsPage();
                break;
            case 'settings':
                this.updateSettingsPage();
                break;
        }
    }

    updateOverviewPage() {
        this.updateMiningUI();
        this.updateProgressBars();
    }

    updateMinersPage() {
        // Update miners list (if any)
        const minersContainer = document.querySelector('.miners-list');
        if (minersContainer) {
            minersContainer.innerHTML = '<p>No miners configured yet</p>';
        }
    }

    updateRewardsPage() {
        this.updateMiningHistory();
    }

    updateSettingsPage() {
        // Load current settings
        const form = document.getElementById('mining-settings-form');
        if (form) {
            const efficiencySlider = form.querySelector('[name="efficiency"]');
            const autoClaimCheckbox = form.querySelector('[name="auto_claim"]');
            
            if (efficiencySlider) {
                efficiencySlider.value = this.efficiency;
            }
            
            if (autoClaimCheckbox) {
                autoClaimCheckbox.checked = localStorage.getItem('mining_auto_claim') === 'true';
            }
        }
    }

    startRealTimeUpdates() {
        // Update mining stats every 5 seconds
        setInterval(() => {
            if (this.isMining) {
                this.updateMiningProgress();
            }
        }, 5000);
    }

    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    formatHashRate(hashRate) {
        if (hashRate >= 1000000) {
            return (hashRate / 1000000).toFixed(2) + ' MH/s';
        } else if (hashRate >= 1000) {
            return (hashRate / 1000).toFixed(2) + ' KH/s';
        } else {
            return hashRate + ' H/s';
        }
    }

    formatNumber(num) {
        return new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 6
        }).format(num);
    }
}

// Initialize mining when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.miningManager = new MiningManager();
});

// Export for global access
window.MiningManager = MiningManager;
