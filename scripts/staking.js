/* ===== STAKING FUNCTIONALITY ===== */

class StakingManager {
    constructor() {
        this.stakingPools = [];
        this.myStakes = [];
        this.validators = [];
        this.rewards = 0;
        this.totalStaked = 0;
        this.isInitialized = false;
        this.init();
    }

    async init() {
        try {
            // Load staking data
            this.loadStakingData();
            
            this.setupEventListeners();
            this.setupSidebarNavigation();
            this.showPage('pools');
            this.isInitialized = true;
            
            // Load initial data
            await this.loadStakingPools();
            await this.loadValidators();
            
        } catch (error) {
            console.error('Staking initialization failed:', error);
            showNotification('error', 'Staking Error', 'Failed to initialize staking system');
        }
    }

    setupEventListeners() {
        // Staking actions
        document.addEventListener('click', (e) => {
            if (e.target.matches('.stake-btn')) {
                const action = e.target.dataset.action;
                const poolId = e.target.dataset.poolId;
                this.handleStakingAction(action, poolId);
            }
            
            if (e.target.matches('.claim-btn')) {
                this.handleClaimRewards();
            }
            
            if (e.target.matches('.validator-btn')) {
                const action = e.target.dataset.action;
                const validatorId = e.target.dataset.validatorId;
                this.handleValidatorAction(action, validatorId);
            }
        });

        // Form submissions
        document.addEventListener('submit', (e) => {
            if (e.target.matches('#stake-form')) {
                e.preventDefault();
                this.handleStakeForm();
            }
        });

        // Amount input
        document.addEventListener('input', (e) => {
            if (e.target.matches('.stake-amount')) {
                this.updateStakePreview(e.target);
            }
        });
    }

    setupSidebarNavigation() {
        const navLinks = document.querySelectorAll('.staking-nav-link');
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

    loadStakingData() {
        // Load from localStorage
        const savedStakes = localStorage.getItem('rsc_stakes');
        const savedRewards = localStorage.getItem('rsc_staking_rewards');
        
        if (savedStakes) {
            this.myStakes = JSON.parse(savedStakes);
        }
        
        if (savedRewards) {
            this.rewards = parseFloat(savedRewards);
        }
        
        this.calculateTotalStaked();
    }

    saveStakingData() {
        localStorage.setItem('rsc_stakes', JSON.stringify(this.myStakes));
        localStorage.setItem('rsc_staking_rewards', this.rewards.toString());
    }

    async loadStakingPools() {
        try {
            // Load pools from API
            const response = await fetch(`${API_BASE_URL}/api/staking/pools`);
            const data = await response.json();
            
            if (data.success) {
                this.stakingPools = data.pools;
                this.updatePoolsUI();
            }
        } catch (error) {
            console.error('Failed to load staking pools:', error);
            // Load real data
            await this.loadMockPools();
        }
    }

    async loadMockPools() {
        try {
            // Intentar obtener datos reales de la API de RSC Chain
            const response = await fetch('https://rsc-chain-production.up.railway.app/api/staking/pools');
            if (response.ok) {
                const data = await response.json();
                this.stakingPools = data.pools || [];
                console.log('✅ Pools de staking reales cargados desde RSC Chain API');
            } else {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
        } catch (error) {
            console.warn('⚠️ No se pudieron cargar pools de staking reales:', error.message);
            // Fallback a pools vacíos
            this.stakingPools = [];
        }
        this.updatePoolsUI();
    }

    async loadValidators() {
        try {
            // Load validators from API
            const response = await fetch(`${API_BASE_URL}/api/staking/validators`);
            const data = await response.json();
            
            if (data.success) {
                this.validators = data.validators;
                this.updateValidatorsUI();
            }
        } catch (error) {
            console.error('Failed to load validators:', error);
            // Load mock data
            this.loadMockValidators();
        }
    }

    loadMockValidators() {
        this.validators = [
            {
                id: 'val1',
                name: 'Validator Alpha',
                address: '0x1234...5678',
                commission: 5.0,
                uptime: 99.8,
                totalStake: 15000,
                blocksSigned: 1250,
                status: 'active',
                performance: 98.5
            },
            {
                id: 'val2',
                name: 'Validator Beta',
                address: '0x8765...4321',
                commission: 3.5,
                uptime: 99.9,
                totalStake: 12000,
                blocksSigned: 1100,
                status: 'active',
                performance: 99.2
            },
            {
                id: 'val3',
                name: 'Validator Gamma',
                address: '0x9876...5432',
                commission: 4.2,
                uptime: 99.7,
                totalStake: 18000,
                blocksSigned: 1400,
                status: 'active',
                performance: 97.8
            }
        ];
        this.updateValidatorsUI();
    }

    handleStakingAction(action, poolId) {
        switch (action) {
            case 'stake':
                this.handleStake(poolId);
                break;
            case 'unstake':
                this.handleUnstake(poolId);
                break;
            case 'claim':
                this.handleClaimPoolRewards(poolId);
                break;
            default:
                console.log('Unknown staking action:', action);
        }
    }

    async handleStake(poolId) {
        const pool = this.stakingPools.find(p => p.id === poolId);
        if (!pool) return;

        // Show stake form
        this.showStakeForm(pool);
    }

    async handleUnstake(poolId) {
        const stake = this.myStakes.find(s => s.poolId === poolId);
        if (!stake) {
            showNotification('error', 'No Stake', 'You don\'t have any stakes in this pool');
            return;
        }

        if (!confirm(`Are you sure you want to unstake ${stake.amount} RSC from ${stake.poolName}?`)) {
            return;
        }

        try {
            // Simulate unstaking
            const unstakeAmount = stake.amount;
            const rewards = this.calculateStakeRewards(stake);
            
            // Remove stake
            this.myStakes = this.myStakes.filter(s => s.poolId !== poolId);
            this.totalStaked -= unstakeAmount;
            this.rewards += rewards;
            
            this.saveStakingData();
            this.updateStakingUI();
            
            showNotification('success', 'Unstaked Successfully', `Unstaked ${unstakeAmount} RSC + ${rewards.toFixed(6)} RSC rewards`);
            
        } catch (error) {
            console.error('Unstaking failed:', error);
            showNotification('error', 'Unstaking Error', 'Failed to unstake tokens');
        }
    }

    async handleClaimPoolRewards(poolId) {
        const stake = this.myStakes.find(s => s.poolId === poolId);
        if (!stake) {
            showNotification('error', 'No Stake', 'You don\'t have any stakes in this pool');
            return;
        }

        const rewards = this.calculateStakeRewards(stake);
        if (rewards <= 0) {
            showNotification('warning', 'No Rewards', 'No rewards available to claim');
            return;
        }

        try {
            // Claim rewards
            stake.lastClaimed = new Date().toISOString();
            this.rewards += rewards;
            
            this.saveStakingData();
            this.updateStakingUI();
            
            showNotification('success', 'Rewards Claimed', `Claimed ${rewards.toFixed(6)} RSC rewards`);
            
        } catch (error) {
            console.error('Claim failed:', error);
            showNotification('error', 'Claim Error', 'Failed to claim rewards');
        }
    }

    async handleClaimRewards() {
        if (this.rewards <= 0) {
            showNotification('warning', 'No Rewards', 'No rewards available to claim');
            return;
        }

        try {
            const claimedAmount = this.rewards;
            this.rewards = 0;
            
            this.saveStakingData();
            this.updateStakingUI();
            
            showNotification('success', 'Rewards Claimed', `Claimed ${claimedAmount.toFixed(6)} RSC rewards`);
            
        } catch (error) {
            console.error('Claim failed:', error);
            showNotification('error', 'Claim Error', 'Failed to claim rewards');
        }
    }

    handleValidatorAction(action, validatorId) {
        switch (action) {
            case 'delegate':
                this.handleDelegate(validatorId);
                break;
            case 'undelegate':
                this.handleUndelegate(validatorId);
                break;
            default:
                console.log('Unknown validator action:', action);
        }
    }

    async handleDelegate(validatorId) {
        const validator = this.validators.find(v => v.id === validatorId);
        if (!validator) return;

        // Show delegation form
        this.showDelegationForm(validator);
    }

    async handleUndelegate(validatorId) {
        // Implementation for undelegation
        showNotification('info', 'Undelegation', 'Undelegation feature coming soon');
    }

    async handleStakeForm() {
        const form = document.getElementById('stake-form');
        const poolId = form.querySelector('[name="pool_id"]').value;
        const amount = parseFloat(form.querySelector('[name="amount"]').value);

        if (!amount || amount <= 0) {
            showNotification('error', 'Invalid Amount', 'Please enter a valid amount');
            return;
        }

        const pool = this.stakingPools.find(p => p.id === poolId);
        if (!pool) {
            showNotification('error', 'Invalid Pool', 'Selected pool not found');
            return;
        }

        if (amount < pool.minStake) {
            showNotification('error', 'Amount Too Low', `Minimum stake is ${pool.minStake} RSC`);
            return;
        }

        if (amount > pool.maxStake) {
            showNotification('error', 'Amount Too High', `Maximum stake is ${pool.maxStake} RSC`);
            return;
        }

        try {
            // Create stake
            const stake = {
                id: this.generateStakeId(),
                poolId: poolId,
                poolName: pool.name,
                amount: amount,
                apy: pool.apy,
                startDate: new Date().toISOString(),
                lastClaimed: new Date().toISOString(),
                status: 'active'
            };

            this.myStakes.push(stake);
            this.totalStaked += amount;
            
            this.saveStakingData();
            this.updateStakingUI();
            
            // Clear form
            form.reset();
            
            showNotification('success', 'Staked Successfully', `Staked ${amount} RSC in ${pool.name}`);
            
        } catch (error) {
            console.error('Staking failed:', error);
            showNotification('error', 'Staking Error', 'Failed to stake tokens');
        }
    }

    showStakeForm(pool) {
        const form = document.getElementById('stake-form');
        if (!form) return;

        // Set pool ID
        form.querySelector('[name="pool_id"]').value = pool.id;
        
        // Update form info
        const infoElement = form.querySelector('.stake-info');
        if (infoElement) {
            infoElement.innerHTML = `
                <div class="pool-info">
                    <h3>${pool.name}</h3>
                    <p>${pool.description}</p>
                    <div class="pool-stats">
                        <span>APY: ${pool.apy}%</span>
                        <span>Min: ${pool.minStake} RSC</span>
                        <span>Max: ${pool.maxStake} RSC</span>
                    </div>
                </div>
            `;
        }
        
        this.showPage('stake');
    }

    showDelegationForm(validator) {
        // Implementation for delegation form
        showNotification('info', 'Delegation', 'Delegation feature coming soon');
    }

    updateStakePreview(input) {
        const amount = parseFloat(input.value) || 0;
        const poolId = input.closest('form').querySelector('[name="pool_id"]').value;
        const pool = this.stakingPools.find(p => p.id === poolId);
        
        if (!pool) return;

        const previewElement = input.closest('form').querySelector('.stake-preview');
        if (previewElement) {
            const annualReward = (amount * pool.apy) / 100;
            const monthlyReward = annualReward / 12;
            const dailyReward = annualReward / 365;
            
            previewElement.innerHTML = `
                <div class="preview-stats">
                    <div class="preview-stat">
                        <span class="label">Annual Reward:</span>
                        <span class="value">${annualReward.toFixed(6)} RSC</span>
                    </div>
                    <div class="preview-stat">
                        <span class="label">Monthly Reward:</span>
                        <span class="value">${monthlyReward.toFixed(6)} RSC</span>
                    </div>
                    <div class="preview-stat">
                        <span class="label">Daily Reward:</span>
                        <span class="value">${dailyReward.toFixed(6)} RSC</span>
                    </div>
                </div>
            `;
        }
    }

    updatePoolsUI() {
        const container = document.querySelector('.staking-pools');
        if (!container) return;

        if (this.stakingPools.length === 0) {
            container.innerHTML = '<p class="no-pools">No staking pools available</p>';
            return;
        }

        const poolsHTML = this.stakingPools.map(pool => this.createPoolHTML(pool)).join('');
        container.innerHTML = poolsHTML;
    }

    createPoolHTML(pool) {
        const myStake = this.myStakes.find(s => s.poolId === pool.id);
        const hasStake = !!myStake;
        
        return `
            <div class="pool-card" data-id="${pool.id}">
                <div class="pool-header">
                    <div class="pool-name">${pool.name}</div>
                    <div class="pool-status ${pool.status}">${pool.status}</div>
                </div>
                <div class="pool-description">${pool.description}</div>
                <div class="pool-stats">
                    <div class="pool-stat">
                        <span class="stat-label">APY</span>
                        <span class="stat-value">${pool.apy}%</span>
                    </div>
                    <div class="pool-stat">
                        <span class="stat-label">Total Staked</span>
                        <span class="stat-value">${pool.totalStaked.toLocaleString()} RSC</span>
                    </div>
                    <div class="pool-stat">
                        <span class="stat-label">Participants</span>
                        <span class="stat-value">${pool.participants}</span>
                    </div>
                    <div class="pool-stat">
                        <span class="stat-label">Lock Period</span>
                        <span class="stat-value">${pool.lockPeriod} days</span>
                    </div>
                </div>
                <div class="pool-limits">
                    <span class="limit">Min: ${pool.minStake} RSC</span>
                    <span class="limit">Max: ${pool.maxStake} RSC</span>
                </div>
                <div class="pool-actions">
                    ${hasStake ? `
                        <button class="stake-btn secondary" data-action="unstake" data-pool-id="${pool.id}">
                            Unstake
                        </button>
                        <button class="stake-btn primary" data-action="claim" data-pool-id="${pool.id}">
                            Claim Rewards
                        </button>
                    ` : `
                        <button class="stake-btn primary" data-action="stake" data-pool-id="${pool.id}">
                            Stake Now
                        </button>
                    `}
                </div>
                ${hasStake ? `
                    <div class="my-stake-info">
                        <span>Your Stake: ${myStake.amount} RSC</span>
                        <span>Earned: ${this.calculateStakeRewards(myStake).toFixed(6)} RSC</span>
                    </div>
                ` : ''}
            </div>
        `;
    }

    updateMyStakesUI() {
        const container = document.querySelector('.my-stakes');
        if (!container) return;

        if (this.myStakes.length === 0) {
            container.innerHTML = '<p class="no-stakes">You haven\'t staked any tokens yet</p>';
            return;
        }

        const stakesHTML = this.myStakes.map(stake => this.createStakeHTML(stake)).join('');
        container.innerHTML = stakesHTML;
    }

    createStakeHTML(stake) {
        const pool = this.stakingPools.find(p => p.id === stake.poolId);
        const rewards = this.calculateStakeRewards(stake);
        const startDate = new Date(stake.startDate);
        const daysStaked = Math.floor((new Date() - startDate) / (1000 * 60 * 60 * 24));
        
        return `
            <div class="stake-item" data-id="${stake.id}">
                <div class="stake-header">
                    <div class="stake-pool">${stake.poolName}</div>
                    <div class="stake-status ${stake.status}">${stake.status}</div>
                </div>
                <div class="stake-details">
                    <div class="stake-amount">
                        <span class="label">Staked Amount:</span>
                        <span class="value">${stake.amount} RSC</span>
                    </div>
                    <div class="stake-apy">
                        <span class="label">APY:</span>
                        <span class="value">${stake.apy}%</span>
                    </div>
                    <div class="stake-rewards">
                        <span class="label">Earned Rewards:</span>
                        <span class="value">${rewards.toFixed(6)} RSC</span>
                    </div>
                    <div class="stake-duration">
                        <span class="label">Days Staked:</span>
                        <span class="value">${daysStaked}</span>
                    </div>
                </div>
                <div class="stake-actions">
                    <button class="stake-btn secondary" data-action="unstake" data-pool-id="${stake.poolId}">
                        Unstake
                    </button>
                    <button class="stake-btn primary" data-action="claim" data-pool-id="${stake.poolId}">
                        Claim Rewards
                    </button>
                </div>
            </div>
        `;
    }

    updateValidatorsUI() {
        const container = document.querySelector('.validators-list');
        if (!container) return;

        if (this.validators.length === 0) {
            container.innerHTML = '<p class="no-validators">No validators available</p>';
            return;
        }

        const validatorsHTML = this.validators.map(validator => this.createValidatorHTML(validator)).join('');
        container.innerHTML = validatorsHTML;
    }

    createValidatorHTML(validator) {
        return `
            <div class="validator-card" data-id="${validator.id}">
                <div class="validator-header">
                    <div class="validator-name">${validator.name}</div>
                    <div class="validator-status ${validator.status}">${validator.status}</div>
                </div>
                <div class="validator-details">
                    <div class="validator-address">${validator.address}</div>
                    <div class="validator-stats">
                        <div class="validator-stat">
                            <span class="stat-label">Commission:</span>
                            <span class="stat-value">${validator.commission}%</span>
                        </div>
                        <div class="validator-stat">
                            <span class="stat-label">Uptime:</span>
                            <span class="stat-value">${validator.uptime}%</span>
                        </div>
                        <div class="validator-stat">
                            <span class="stat-label">Total Stake:</span>
                            <span class="stat-value">${validator.totalStake.toLocaleString()} RSC</span>
                        </div>
                        <div class="validator-stat">
                            <span class="stat-label">Blocks Signed:</span>
                            <span class="stat-value">${validator.blocksSigned}</span>
                        </div>
                        <div class="validator-stat">
                            <span class="stat-label">Performance:</span>
                            <span class="stat-value">${validator.performance}%</span>
                        </div>
                    </div>
                </div>
                <div class="validator-actions">
                    <button class="validator-btn primary" data-action="delegate" data-validator-id="${validator.id}">
                        Delegate
                    </button>
                </div>
            </div>
        `;
    }

    updateStakingUI() {
        this.updatePoolsUI();
        this.updateMyStakesUI();
        this.updateValidatorsUI();
        this.updateStakingStats();
    }

    updateStakingStats() {
        // Update overview stats
        const totalStakedElement = document.querySelector('.staking-stat-value[data-stat="total_staked"]');
        if (totalStakedElement) {
            totalStakedElement.textContent = this.formatNumber(this.totalStaked);
        }
        
        const totalRewardsElement = document.querySelector('.staking-stat-value[data-stat="total_rewards"]');
        if (totalRewardsElement) {
            totalRewardsElement.textContent = this.formatNumber(this.rewards);
        }
        
        const activeStakesElement = document.querySelector('.staking-stat-value[data-stat="active_stakes"]');
        if (activeStakesElement) {
            activeStakesElement.textContent = this.myStakes.length;
        }
        
        const avgApyElement = document.querySelector('.staking-stat-value[data-stat="avg_apy"]');
        if (avgApyElement) {
            const avgApy = this.myStakes.length > 0 ? 
                this.myStakes.reduce((sum, stake) => sum + stake.apy, 0) / this.myStakes.length : 0;
            avgApyElement.textContent = `${avgApy.toFixed(2)}%`;
        }
    }

    calculateStakeRewards(stake) {
        const startDate = new Date(stake.startDate);
        const lastClaimed = new Date(stake.lastClaimed);
        const now = new Date();
        
        const daysSinceLastClaim = (now - lastClaimed) / (1000 * 60 * 60 * 24);
        const annualReward = (stake.amount * stake.apy) / 100;
        const dailyReward = annualReward / 365;
        
        return dailyReward * daysSinceLastClaim;
    }

    calculateTotalStaked() {
        this.totalStaked = this.myStakes.reduce((sum, stake) => sum + stake.amount, 0);
    }

    showPage(pageName) {
        // Hide all pages
        const pages = document.querySelectorAll('.staking-page');
        pages.forEach(page => page.classList.remove('active'));
        
        // Show target page
        const targetPage = document.querySelector(`.staking-page[data-page="${pageName}"]`);
        if (targetPage) {
            targetPage.classList.add('active');
        }
        
        // Update page-specific content
        this.updatePageContent(pageName);
    }

    updatePageContent(pageName) {
        switch (pageName) {
            case 'pools':
                this.updatePoolsPage();
                break;
            case 'my-stakes':
                this.updateMyStakesPage();
                break;
            case 'validators':
                this.updateValidatorsPage();
                break;
            case 'rewards':
                this.updateRewardsPage();
                break;
            case 'analytics':
                this.updateAnalyticsPage();
                break;
            case 'stake':
                this.updateStakePage();
                break;
        }
    }

    updatePoolsPage() {
        this.updatePoolsUI();
    }

    updateMyStakesPage() {
        this.updateMyStakesUI();
    }

    updateValidatorsPage() {
        this.updateValidatorsUI();
    }

    updateRewardsPage() {
        // Update rewards display
        const rewardsElement = document.querySelector('.rewards-amount');
        if (rewardsElement) {
            rewardsElement.textContent = this.formatNumber(this.rewards);
        }
    }

    updateAnalyticsPage() {
        // Update analytics charts
        this.updateAnalyticsCharts();
    }

    updateStakePage() {
        // Form is already set up
    }

    updateAnalyticsCharts() {
        // Implementation for analytics charts
        // This would integrate with Chart.js for visualizations
    }

    generateStakeId() {
        return 'stake_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    formatNumber(num) {
        return new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 6
        }).format(num);
    }
}

// Initialize staking when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.stakingManager = new StakingManager();
});

// Export for global access
window.StakingManager = StakingManager;