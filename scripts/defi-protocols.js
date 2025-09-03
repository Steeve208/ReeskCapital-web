// ===== RSC CHAIN - DEFI PROTOCOLS SYSTEM =====

class DeFiProtocols {
    constructor() {
        this.pools = new Map();
        this.stakingPools = new Map();
        this.yieldFarms = new Map();
        this.liquidityPools = new Map();
        this.userPositions = new Map();
        this.currentUser = null;
        this.eventBus = new EventTarget();
        this.initialized = false;
    }

    // Initialize DeFi protocols
    async init() {
        if (this.initialized) return;
        
        try {
            await this.loadSampleData();
            await this.setupEventListeners();
            this.initialized = true;
            
            console.log('🚀 RSC Chain DeFi Protocols Initialized');
            this.emit('defi:ready', { status: 'connected' });
        } catch (error) {
            console.error('Failed to initialize DeFi protocols:', error);
            this.emit('defi:error', { error: error.message });
        }
    }

    // Load sample data
    async loadSampleData() {
        // Staking Pools
        const stakingPools = [
            {
                id: 'stake_rsc_001',
                name: 'RSC Staking Pool',
                token: 'RSC',
                apy: 12.5,
                minStake: 100,
                maxStake: 1000000,
                lockPeriod: 30, // days
                totalStaked: 2500000,
                totalRewards: 125000,
                status: 'active',
                description: 'Stake RSC tokens to earn rewards with 12.5% APY'
            },
            {
                id: 'stake_rsc_002',
                name: 'RSC Long-term Pool',
                token: 'RSC',
                apy: 18.7,
                minStake: 500,
                maxStake: 5000000,
                lockPeriod: 90, // days
                totalStaked: 1800000,
                totalRewards: 89000,
                status: 'active',
                description: 'Long-term staking with higher rewards and 90-day lock period'
            },
            {
                id: 'stake_eth_001',
                name: 'ETH Staking Pool',
                token: 'ETH',
                apy: 8.3,
                minStake: 0.1,
                maxStake: 1000,
                lockPeriod: 14, // days
                totalStaked: 450,
                totalRewards: 12.5,
                status: 'active',
                description: 'Stake ETH to earn RSC rewards'
            }
        ];

        stakingPools.forEach(pool => {
            this.stakingPools.set(pool.id, pool);
        });

        // Yield Farms
        const yieldFarms = [
            {
                id: 'farm_rsc_eth_001',
                name: 'RSC/ETH Farm',
                pair: 'RSC/ETH',
                apy: 24.8,
                tvl: 850000,
                rewards: 'RSC',
                multiplier: 2.5,
                status: 'active',
                description: 'Provide liquidity for RSC/ETH pair and earn RSC rewards'
            },
            {
                id: 'farm_rsc_btc_001',
                name: 'RSC/BTC Farm',
                pair: 'RSC/BTC',
                apy: 31.2,
                tvl: 1200000,
                rewards: 'RSC',
                multiplier: 3.0,
                status: 'active',
                description: 'High-yield farming for RSC/BTC liquidity providers'
            },
            {
                id: 'farm_eth_usdc_001',
                name: 'ETH/USDC Farm',
                pair: 'ETH/USDC',
                apy: 15.6,
                tvl: 2100000,
                rewards: 'RSC',
                multiplier: 1.5,
                status: 'active',
                description: 'Stable pair farming with consistent returns'
            }
        ];

        yieldFarms.forEach(farm => {
            this.yieldFarms.set(farm.id, farm);
        });

        // Liquidity Pools
        const liquidityPools = [
            {
                id: 'pool_rsc_eth_001',
                name: 'RSC/ETH Pool',
                tokenA: 'RSC',
                tokenB: 'ETH',
                reserveA: 500000,
                reserveB: 250,
                totalSupply: 1000000,
                fee: 0.3, // 0.3%
                volume24h: 125000,
                fees24h: 375,
                status: 'active'
            },
            {
                id: 'pool_rsc_btc_001',
                name: 'RSC/BTC Pool',
                tokenA: 'RSC',
                tokenB: 'BTC',
                reserveA: 800000,
                reserveB: 15,
                totalSupply: 1200000,
                fee: 0.3,
                volume24h: 89000,
                fees24h: 267,
                status: 'active'
            },
            {
                id: 'pool_eth_usdc_001',
                name: 'ETH/USDC Pool',
                tokenA: 'ETH',
                tokenB: 'USDC',
                reserveA: 180,
                reserveB: 450000,
                totalSupply: 900000,
                fee: 0.3,
                volume24h: 340000,
                fees24h: 1020,
                status: 'active'
            }
        ];

        liquidityPools.forEach(pool => {
            this.liquidityPools.set(pool.id, pool);
        });
    }

    // Setup event listeners
    async setupEventListeners() {
        this.eventBus.addEventListener('user:login', (event) => {
            this.handleUserLogin(event.detail);
        });

        this.eventBus.addEventListener('stake:deposit', (event) => {
            this.handleStakeDeposit(event.detail);
        });

        this.eventBus.addEventListener('stake:withdraw', (event) => {
            this.handleStakeWithdraw(event.detail);
        });

        this.eventBus.addEventListener('farm:deposit', (event) => {
            this.handleFarmDeposit(event.detail);
        });

        this.eventBus.addEventListener('farm:withdraw', (event) => {
            this.handleFarmWithdraw(event.detail);
        });

        this.eventBus.addEventListener('pool:addLiquidity', (event) => {
            this.handleAddLiquidity(event.detail);
        });

        this.eventBus.addEventListener('pool:removeLiquidity', (event) => {
            this.handleRemoveLiquidity(event.detail);
        });
    }

    // Staking functions
    async stakeTokens(poolId, amount) {
        if (!this.currentUser) {
            throw new Error('User must be logged in to stake tokens');
        }

        const pool = this.stakingPools.get(poolId);
        if (!pool) {
            throw new Error('Staking pool not found');
        }

        if (amount < pool.minStake) {
            throw new Error(`Minimum stake amount is ${pool.minStake} ${pool.token}`);
        }

        if (amount > pool.maxStake) {
            throw new Error(`Maximum stake amount is ${pool.maxStake} ${pool.token}`);
        }

        const stakePosition = {
            id: `stake_${Date.now()}`,
            userId: this.currentUser.id,
            poolId: poolId,
            amount: amount,
            startTime: new Date(),
            endTime: new Date(Date.now() + pool.lockPeriod * 24 * 60 * 60 * 1000),
            rewards: 0,
            status: 'active'
        };

        if (!this.userPositions.has(this.currentUser.id)) {
            this.userPositions.set(this.currentUser.id, []);
        }
        this.userPositions.get(this.currentUser.id).push(stakePosition);

        // Update pool totals
        pool.totalStaked += amount;

        this.emit('stake:deposited', stakePosition);
        return stakePosition;
    }

    async unstakeTokens(positionId) {
        if (!this.currentUser) {
            throw new Error('User must be logged in to unstake tokens');
        }

        const userPositions = this.userPositions.get(this.currentUser.id) || [];
        const position = userPositions.find(p => p.id === positionId);
        
        if (!position) {
            throw new Error('Staking position not found');
        }

        if (position.status !== 'active') {
            throw new Error('Position is not active');
        }

        if (new Date() < position.endTime) {
            throw new Error('Position is still locked');
        }

        // Calculate rewards
        const pool = this.stakingPools.get(position.poolId);
        const timeStaked = (new Date() - position.startTime) / (1000 * 60 * 60 * 24); // days
        const rewards = (position.amount * pool.apy / 100 * timeStaked) / 365;

        position.rewards = rewards;
        position.status = 'completed';

        this.emit('stake:withdrawn', { position, rewards });
        return { position, rewards };
    }

    // Yield farming functions
    async depositToFarm(farmId, amount) {
        if (!this.currentUser) {
            throw new Error('User must be logged in to deposit to farm');
        }

        const farm = this.yieldFarms.get(farmId);
        if (!farm) {
            throw new Error('Yield farm not found');
        }

        const farmPosition = {
            id: `farm_${Date.now()}`,
            userId: this.currentUser.id,
            farmId: farmId,
            amount: amount,
            startTime: new Date(),
            rewards: 0,
            status: 'active'
        };

        if (!this.userPositions.has(this.currentUser.id)) {
            this.userPositions.set(this.currentUser.id, []);
        }
        this.userPositions.get(this.currentUser.id).push(farmPosition);

        // Update farm TVL
        farm.tvl += amount;

        this.emit('farm:deposited', farmPosition);
        return farmPosition;
    }

    async withdrawFromFarm(positionId) {
        if (!this.currentUser) {
            throw new Error('User must be logged in to withdraw from farm');
        }

        const userPositions = this.userPositions.get(this.currentUser.id) || [];
        const position = userPositions.find(p => p.id === positionId);
        
        if (!position) {
            throw new Error('Farm position not found');
        }

        if (position.status !== 'active') {
            throw new Error('Position is not active');
        }

        const farm = this.yieldFarms.get(position.farmId);
        const timeStaked = (new Date() - position.startTime) / (1000 * 60 * 60 * 24); // days
        const rewards = (position.amount * farm.apy / 100 * timeStaked) / 365;

        position.rewards = rewards;
        position.status = 'completed';

        // Update farm TVL
        farm.tvl -= position.amount;

        this.emit('farm:withdrawn', { position, rewards });
        return { position, rewards };
    }

    // Liquidity pool functions
    async addLiquidity(poolId, amountA, amountB) {
        if (!this.currentUser) {
            throw new Error('User must be logged in to add liquidity');
        }

        const pool = this.liquidityPools.get(poolId);
        if (!pool) {
            throw new Error('Liquidity pool not found');
        }

        // Calculate LP tokens to mint
        const lpTokens = Math.min(
            (amountA / pool.reserveA) * pool.totalSupply,
            (amountB / pool.reserveB) * pool.totalSupply
        );

        const liquidityPosition = {
            id: `liquidity_${Date.now()}`,
            userId: this.currentUser.id,
            poolId: poolId,
            amountA: amountA,
            amountB: amountB,
            lpTokens: lpTokens,
            startTime: new Date(),
            status: 'active'
        };

        if (!this.userPositions.has(this.currentUser.id)) {
            this.userPositions.set(this.currentUser.id, []);
        }
        this.userPositions.get(this.currentUser.id).push(liquidityPosition);

        // Update pool reserves
        pool.reserveA += amountA;
        pool.reserveB += amountB;
        pool.totalSupply += lpTokens;

        this.emit('pool:liquidityAdded', liquidityPosition);
        return liquidityPosition;
    }

    async removeLiquidity(positionId) {
        if (!this.currentUser) {
            throw new Error('User must be logged in to remove liquidity');
        }

        const userPositions = this.userPositions.get(this.currentUser.id) || [];
        const position = userPositions.find(p => p.id === positionId);
        
        if (!position) {
            throw new Error('Liquidity position not found');
        }

        if (position.status !== 'active') {
            throw new Error('Position is not active');
        }

        const pool = this.liquidityPools.get(position.poolId);
        
        // Calculate amounts to return
        const amountA = (position.lpTokens / pool.totalSupply) * pool.reserveA;
        const amountB = (position.lpTokens / pool.totalSupply) * pool.reserveB;

        position.status = 'completed';

        // Update pool reserves
        pool.reserveA -= amountA;
        pool.reserveB -= amountB;
        pool.totalSupply -= position.lpTokens;

        this.emit('pool:liquidityRemoved', { position, amountA, amountB });
        return { position, amountA, amountB };
    }

    // Utility functions
    calculateAPY(poolId) {
        const pool = this.stakingPools.get(poolId) || this.yieldFarms.get(poolId);
        return pool ? pool.apy : 0;
    }

    calculateTVL(poolId) {
        const pool = this.stakingPools.get(poolId) || this.yieldFarms.get(poolId) || this.liquidityPools.get(poolId);
        return pool ? (pool.totalStaked || pool.tvl || (pool.reserveA + pool.reserveB)) : 0;
    }

    getUserPositions(userId) {
        return this.userPositions.get(userId) || [];
    }

    getUserStakingPositions(userId) {
        const positions = this.userPositions.get(userId) || [];
        return positions.filter(p => p.poolId && this.stakingPools.has(p.poolId));
    }

    getUserFarmPositions(userId) {
        const positions = this.userPositions.get(userId) || [];
        return positions.filter(p => p.farmId && this.yieldFarms.has(p.farmId));
    }

    getUserLiquidityPositions(userId) {
        const positions = this.userPositions.get(userId) || [];
        return positions.filter(p => p.poolId && this.liquidityPools.has(p.poolId));
    }

    // Event handlers
    handleUserLogin(userData) {
        this.currentUser = userData;
    }

    handleStakeDeposit(data) {
        console.log('Stake deposited:', data);
    }

    handleStakeWithdraw(data) {
        console.log('Stake withdrawn:', data);
    }

    handleFarmDeposit(data) {
        console.log('Farm deposited:', data);
    }

    handleFarmWithdraw(data) {
        console.log('Farm withdrawn:', data);
    }

    handleAddLiquidity(data) {
        console.log('Liquidity added:', data);
    }

    handleRemoveLiquidity(data) {
        console.log('Liquidity removed:', data);
    }

    // Emit events
    emit(eventName, data) {
        this.eventBus.dispatchEvent(new CustomEvent(eventName, { detail: data }));
    }

    // Add event listener
    on(eventName, handler) {
        this.eventBus.addEventListener(eventName, handler);
    }

    // Remove event listener
    off(eventName, handler) {
        this.eventBus.removeEventListener(eventName, handler);
    }
}

// ===== DEFI UI MANAGER =====
class DeFiUIManager {
    constructor(defiProtocols) {
        this.defi = defiProtocols;
        this.elements = new Map();
        this.currentView = 'overview';
    }

    init() {
        this.setupElements();
        this.setupEventListeners();
        this.renderOverview();
    }

    setupElements() {
        // Overview elements
        this.elements.set('overviewContainer', document.querySelector('[data-defi-overview]'));
        this.elements.set('totalValue', document.querySelector('[data-total-value]'));
        this.elements.set('totalRewards', document.querySelector('[data-total-rewards]'));

        // Staking elements
        this.elements.set('stakingContainer', document.querySelector('[data-staking-container]'));
        this.elements.set('stakeAmount', document.querySelector('[data-stake-amount]'));
        this.elements.set('stakeButton', document.querySelector('[data-stake-button]'));

        // Farming elements
        this.elements.set('farmingContainer', document.querySelector('[data-farming-container]'));
        this.elements.set('farmAmount', document.querySelector('[data-farm-amount]'));
        this.elements.set('farmButton', document.querySelector('[data-farm-button]'));

        // Liquidity elements
        this.elements.set('liquidityContainer', document.querySelector('[data-liquidity-container]'));
        this.elements.set('liquidityAmountA', document.querySelector('[data-liquidity-amount-a]'));
        this.elements.set('liquidityAmountB', document.querySelector('[data-liquidity-amount-b]'));
        this.elements.set('addLiquidityButton', document.querySelector('[data-add-liquidity-button]'));

        // Navigation elements
        this.elements.set('overviewTab', document.querySelector('[data-tab="overview"]'));
        this.elements.set('stakingTab', document.querySelector('[data-tab="staking"]'));
        this.elements.set('farmingTab', document.querySelector('[data-tab="farming"]'));
        this.elements.set('liquidityTab', document.querySelector('[data-tab="liquidity"]'));
    }

    setupEventListeners() {
        // Staking
        if (this.elements.get('stakeButton')) {
            this.elements.get('stakeButton').addEventListener('click', () => {
                this.stakeTokens();
            });
        }

        // Farming
        if (this.elements.get('farmButton')) {
            this.elements.get('farmButton').addEventListener('click', () => {
                this.depositToFarm();
            });
        }

        // Liquidity
        if (this.elements.get('addLiquidityButton')) {
            this.elements.get('addLiquidityButton').addEventListener('click', () => {
                this.addLiquidity();
            });
        }

        // Tab navigation
        if (this.elements.get('overviewTab')) {
            this.elements.get('overviewTab').addEventListener('click', () => {
                this.showView('overview');
            });
        }

        if (this.elements.get('stakingTab')) {
            this.elements.get('stakingTab').addEventListener('click', () => {
                this.showView('staking');
            });
        }

        if (this.elements.get('farmingTab')) {
            this.elements.get('farmingTab').addEventListener('click', () => {
                this.showView('farming');
            });
        }

        if (this.elements.get('liquidityTab')) {
            this.elements.get('liquidityTab').addEventListener('click', () => {
                this.showView('liquidity');
            });
        }

        // DeFi events
        this.defi.on('stake:deposited', (event) => {
            this.showSuccess('Tokens staked successfully!');
            this.renderOverview();
        });

        this.defi.on('farm:deposited', (event) => {
            this.showSuccess('Deposited to farm successfully!');
            this.renderOverview();
        });

        this.defi.on('pool:liquidityAdded', (event) => {
            this.showSuccess('Liquidity added successfully!');
            this.renderOverview();
        });
    }

    async stakeTokens() {
        const amount = parseFloat(this.elements.get('stakeAmount')?.value);
        if (!amount || isNaN(amount)) {
            this.showError('Please enter a valid amount');
            return;
        }

        try {
            // For demo purposes, use the first staking pool
            const pools = Array.from(this.defi.stakingPools.values());
            if (pools.length > 0) {
                await this.defi.stakeTokens(pools[0].id, amount);
            }
        } catch (error) {
            this.showError('Failed to stake tokens: ' + error.message);
        }
    }

    async depositToFarm() {
        const amount = parseFloat(this.elements.get('farmAmount')?.value);
        if (!amount || isNaN(amount)) {
            this.showError('Please enter a valid amount');
            return;
        }

        try {
            // For demo purposes, use the first yield farm
            const farms = Array.from(this.defi.yieldFarms.values());
            if (farms.length > 0) {
                await this.defi.depositToFarm(farms[0].id, amount);
            }
        } catch (error) {
            this.showError('Failed to deposit to farm: ' + error.message);
        }
    }

    async addLiquidity() {
        const amountA = parseFloat(this.elements.get('liquidityAmountA')?.value);
        const amountB = parseFloat(this.elements.get('liquidityAmountB')?.value);
        
        if (!amountA || !amountB || isNaN(amountA) || isNaN(amountB)) {
            this.showError('Please enter valid amounts for both tokens');
            return;
        }

        try {
            // For demo purposes, use the first liquidity pool
            const pools = Array.from(this.defi.liquidityPools.values());
            if (pools.length > 0) {
                await this.defi.addLiquidity(pools[0].id, amountA, amountB);
            }
        } catch (error) {
            this.showError('Failed to add liquidity: ' + error.message);
        }
    }

    renderOverview() {
        const container = this.elements.get('overviewContainer');
        if (!container) return;

        const totalValue = this.calculateTotalValue();
        const totalRewards = this.calculateTotalRewards();

        if (this.elements.get('totalValue')) {
            this.elements.get('totalValue').textContent = `$${totalValue.toLocaleString()}`;
        }

        if (this.elements.get('totalRewards')) {
            this.elements.get('totalRewards').textContent = `${totalRewards.toFixed(4)} RSC`;
        }

        // Render staking pools
        const stakingPools = Array.from(this.defi.stakingPools.values());
        const stakingHTML = stakingPools.map(pool => `
            <div class="defi-card">
                <div class="card-header">
                    <div class="card-icon">
                        <i class="fas fa-lock"></i>
                    </div>
                    <h3>${pool.name}</h3>
                </div>
                <div class="card-content">
                    <div class="info-item">
                        <span class="info-label">APY:</span>
                        <span class="info-value">${pool.apy}%</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Total Staked:</span>
                        <span class="info-value">${pool.totalStaked.toLocaleString()} ${pool.token}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Lock Period:</span>
                        <span class="info-value">${pool.lockPeriod} days</span>
                    </div>
                </div>
                <div class="card-actions">
                    <button class="btn btn-primary" onclick="defiUI.stakeInPool('${pool.id}')">Stake</button>
                </div>
            </div>
        `).join('');

        // Render yield farms
        const yieldFarms = Array.from(this.defi.yieldFarms.values());
        const farmingHTML = yieldFarms.map(farm => `
            <div class="defi-card">
                <div class="card-header">
                    <div class="card-icon">
                        <i class="fas fa-seedling"></i>
                    </div>
                    <h3>${farm.name}</h3>
                </div>
                <div class="card-content">
                    <div class="info-item">
                        <span class="info-label">APY:</span>
                        <span class="info-value">${farm.apy}%</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">TVL:</span>
                        <span class="info-value">$${farm.tvl.toLocaleString()}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Multiplier:</span>
                        <span class="info-value">${farm.multiplier}x</span>
                    </div>
                </div>
                <div class="card-actions">
                    <button class="btn btn-primary" onclick="defiUI.farmInPool('${farm.id}')">Farm</button>
                </div>
            </div>
        `).join('');

        // Render liquidity pools
        const liquidityPools = Array.from(this.defi.liquidityPools.values());
        const liquidityHTML = liquidityPools.map(pool => `
            <div class="defi-card">
                <div class="card-header">
                    <div class="card-icon">
                        <i class="fas fa-exchange-alt"></i>
                    </div>
                    <h3>${pool.name}</h3>
                </div>
                <div class="card-content">
                    <div class="info-item">
                        <span class="info-label">Volume 24h:</span>
                        <span class="info-value">$${pool.volume24h.toLocaleString()}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Fees 24h:</span>
                        <span class="info-value">$${pool.fees24h.toLocaleString()}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Fee:</span>
                        <span class="info-value">${pool.fee}%</span>
                    </div>
                </div>
                <div class="card-actions">
                    <button class="btn btn-primary" onclick="defiUI.addLiquidityToPool('${pool.id}')">Add Liquidity</button>
                </div>
            </div>
        `).join('');

        container.innerHTML = `
            <div class="defi-overview">
                <div class="overview-stats">
                    <div class="stat-card">
                        <div class="stat-icon">
                            <i class="fas fa-wallet"></i>
                        </div>
                        <div class="stat-content">
                            <div class="stat-value">$${totalValue.toLocaleString()}</div>
                            <div class="stat-label">Total Value Locked</div>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">
                            <i class="fas fa-coins"></i>
                        </div>
                        <div class="stat-content">
                            <div class="stat-value">${totalRewards.toFixed(4)} RSC</div>
                            <div class="stat-label">Total Rewards</div>
                        </div>
                    </div>
                </div>
                
                <div class="defi-sections">
                    <div class="defi-section">
                        <h3>Staking Pools</h3>
                        <div class="defi-grid">
                            ${stakingHTML}
                        </div>
                    </div>
                    
                    <div class="defi-section">
                        <h3>Yield Farms</h3>
                        <div class="defi-grid">
                            ${farmingHTML}
                        </div>
                    </div>
                    
                    <div class="defi-section">
                        <h3>Liquidity Pools</h3>
                        <div class="defi-grid">
                            ${liquidityHTML}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderStaking() {
        const container = this.elements.get('stakingContainer');
        if (!container) return;

        const stakingPools = Array.from(this.defi.stakingPools.values());
        container.innerHTML = stakingPools.map(pool => `
            <div class="staking-pool">
                <div class="pool-header">
                    <h3>${pool.name}</h3>
                    <div class="pool-apy">${pool.apy}% APY</div>
                </div>
                <div class="pool-info">
                    <p>${pool.description}</p>
                    <div class="pool-details">
                        <div class="detail">
                            <span class="label">Min Stake:</span>
                            <span class="value">${pool.minStake} ${pool.token}</span>
                        </div>
                        <div class="detail">
                            <span class="label">Max Stake:</span>
                            <span class="value">${pool.maxStake} ${pool.token}</span>
                        </div>
                        <div class="detail">
                            <span class="label">Lock Period:</span>
                            <span class="value">${pool.lockPeriod} days</span>
                        </div>
                    </div>
                </div>
                <div class="pool-actions">
                    <input type="number" placeholder="Amount to stake" class="stake-input">
                    <button class="btn btn-primary" onclick="defiUI.stakeInPool('${pool.id}')">Stake Now</button>
                </div>
            </div>
        `).join('');
    }

    renderFarming() {
        const container = this.elements.get('farmingContainer');
        if (!container) return;

        const yieldFarms = Array.from(this.defi.yieldFarms.values());
        container.innerHTML = yieldFarms.map(farm => `
            <div class="yield-farm">
                <div class="farm-header">
                    <h3>${farm.name}</h3>
                    <div class="farm-apy">${farm.apy}% APY</div>
                </div>
                <div class="farm-info">
                    <p>${farm.description}</p>
                    <div class="farm-details">
                        <div class="detail">
                            <span class="label">TVL:</span>
                            <span class="value">$${farm.tvl.toLocaleString()}</span>
                        </div>
                        <div class="detail">
                            <span class="label">Rewards:</span>
                            <span class="value">${farm.rewards}</span>
                        </div>
                        <div class="detail">
                            <span class="label">Multiplier:</span>
                            <span class="value">${farm.multiplier}x</span>
                        </div>
                    </div>
                </div>
                <div class="farm-actions">
                    <input type="number" placeholder="Amount to farm" class="farm-input">
                    <button class="btn btn-primary" onclick="defiUI.farmInPool('${farm.id}')">Start Farming</button>
                </div>
            </div>
        `).join('');
    }

    renderLiquidity() {
        const container = this.elements.get('liquidityContainer');
        if (!container) return;

        const liquidityPools = Array.from(this.defi.liquidityPools.values());
        container.innerHTML = liquidityPools.map(pool => `
            <div class="liquidity-pool">
                <div class="pool-header">
                    <h3>${pool.name}</h3>
                    <div class="pool-fee">${pool.fee}% Fee</div>
                </div>
                <div class="pool-info">
                    <div class="pool-details">
                        <div class="detail">
                            <span class="label">Reserve A:</span>
                            <span class="value">${pool.reserveA.toLocaleString()} ${pool.tokenA}</span>
                        </div>
                        <div class="detail">
                            <span class="label">Reserve B:</span>
                            <span class="value">${pool.reserveB.toLocaleString()} ${pool.tokenB}</span>
                        </div>
                        <div class="detail">
                            <span class="label">Volume 24h:</span>
                            <span class="value">$${pool.volume24h.toLocaleString()}</span>
                        </div>
                    </div>
                </div>
                <div class="pool-actions">
                    <div class="liquidity-inputs">
                        <input type="number" placeholder="${pool.tokenA} amount" class="liquidity-input">
                        <input type="number" placeholder="${pool.tokenB} amount" class="liquidity-input">
                    </div>
                    <button class="btn btn-primary" onclick="defiUI.addLiquidityToPool('${pool.id}')">Add Liquidity</button>
                </div>
            </div>
        `).join('');
    }

    showView(view) {
        this.currentView = view;
        
        // Update tab states
        document.querySelectorAll('[data-tab]').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-tab="${view}"]`)?.classList.add('active');

        // Show/hide containers
        document.querySelectorAll('.defi-container').forEach(container => {
            container.style.display = 'none';
        });
        document.querySelector(`[data-${view}-container]`)?.style.display = 'block';

        // Render appropriate content
        switch (view) {
            case 'overview':
                this.renderOverview();
                break;
            case 'staking':
                this.renderStaking();
                break;
            case 'farming':
                this.renderFarming();
                break;
            case 'liquidity':
                this.renderLiquidity();
                break;
        }
    }

    calculateTotalValue() {
        // Calculate total value from all positions
        let total = 0;
        const positions = this.defi.getUserPositions(this.defi.currentUser?.id);
        positions.forEach(position => {
            if (position.amount) {
                total += position.amount;
            }
        });
        return total;
    }

    calculateTotalRewards() {
        // Calculate total rewards from all positions
        let total = 0;
        const positions = this.defi.getUserPositions(this.defi.currentUser?.id);
        positions.forEach(position => {
            if (position.rewards) {
                total += position.rewards;
            }
        });
        return total;
    }

    showSuccess(message) {
        if (window.componentSystem) {
            componentSystem.create('Notification').show(message, 'success');
        }
    }

    showError(message) {
        if (window.componentSystem) {
            componentSystem.create('Notification').show(message, 'error');
        }
    }
}

// ===== INITIALIZE DEFI PROTOCOLS =====
const defiProtocols = new DeFiProtocols();
const defiUI = new DeFiUIManager(defiProtocols);

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    try {
        await defiProtocols.init();
        defiUI.init();
    } catch (error) {
        console.error('Failed to initialize DeFi protocols:', error);
    }
});

// Export for global access
window.defiProtocols = defiProtocols;
window.defiUI = defiUI;
