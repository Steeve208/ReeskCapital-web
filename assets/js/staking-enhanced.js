/* ================================
   STAKING-ENHANCED.JS — STAKING AVANZADO
================================ */

class StakingEnhanced {
  constructor() {
    this.stakedAmount = 15000;
    this.totalRewards = 2347.89;
    this.apy = 12.5;
    this.pools = [];
    this.validators = [];
    this.init();
  }

  init() {
    this.loadPools();
    this.loadValidators();
    this.setupEventListeners();
    this.startRewardSimulation();
    this.renderDashboard();
  }

  setupEventListeners() {
    // Tab switching
    document.querySelectorAll('.staking-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        this.switchTab(e.target.dataset.tab);
      });
    });

    // Staking actions
    document.querySelectorAll('.btn-stake').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const poolId = e.target.dataset.pool;
        this.openStakeModal(poolId);
      });
    });

    document.querySelectorAll('.btn-unstake').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const poolId = e.target.dataset.pool;
        this.openUnstakeModal(poolId);
      });
    });
  }

  loadPools() {
    this.pools = [
      {
        id: 1,
        name: 'Pool Principal',
        apy: 12.5,
        totalStaked: 2500000,
        minStake: 100,
        maxStake: 100000,
        stakedAmount: 10000,
        rewards: 1250.45,
        status: 'active'
      },
      {
        id: 2,
        name: 'Pool de Alto Rendimiento',
        apy: 15.2,
        totalStaked: 1800000,
        minStake: 500,
        maxStake: 50000,
        stakedAmount: 5000,
        rewards: 760.23,
        status: 'active'
      },
      {
        id: 3,
        name: 'Pool de Liquidez',
        apy: 8.7,
        totalStaked: 3200000,
        minStake: 50,
        maxStake: 200000,
        stakedAmount: 0,
        rewards: 0,
        status: 'active'
      }
    ];
  }

  loadValidators() {
    this.validators = [
      {
        id: 1,
        name: 'Validator Alpha',
        commission: 5.0,
        uptime: 99.8,
        totalStaked: 450000,
        delegators: 1250,
        status: 'active'
      },
      {
        id: 2,
        name: 'Validator Beta',
        commission: 3.5,
        uptime: 99.9,
        totalStaked: 380000,
        delegators: 980,
        status: 'active'
      },
      {
        id: 3,
        name: 'Validator Gamma',
        commission: 7.2,
        uptime: 99.5,
        totalStaked: 290000,
        delegators: 750,
        status: 'active'
      }
    ];
  }

  renderDashboard() {
    this.renderStakingOverview();
    this.renderPools();
    this.renderValidators();
    this.renderNetworkStats();
  }

  renderStakingOverview() {
    const container = document.querySelector('.staking-overview');
    if (!container) return;

    const totalStaked = this.pools.reduce((sum, pool) => sum + pool.stakedAmount, 0);
    const totalRewards = this.pools.reduce((sum, pool) => sum + pool.rewards, 0);
    const avgApy = this.pools.reduce((sum, pool) => sum + pool.apy, 0) / this.pools.length;

    container.innerHTML = `
      <div class="overview-card">
        <div class="overview-icon">💰</div>
        <div class="overview-info">
          <div class="overview-value">${this.formatNumber(totalStaked)} RSC</div>
          <div class="overview-label">Total Staked</div>
        </div>
      </div>
      <div class="overview-card">
        <div class="overview-icon">🎯</div>
        <div class="overview-info">
          <div class="overview-value">${this.formatNumber(totalRewards)} RSC</div>
          <div class="overview-label">Total Rewards</div>
        </div>
      </div>
      <div class="overview-card">
        <div class="overview-icon">📈</div>
        <div class="overview-info">
          <div class="overview-value">${avgApy.toFixed(1)}%</div>
          <div class="overview-label">Average APY</div>
        </div>
      </div>
    `;
  }

  renderPools() {
    const container = document.querySelector('.pools-container');
    if (!container) return;

    container.innerHTML = this.pools.map(pool => `
      <div class="pool-card ${pool.status}">
        <div class="pool-header">
          <h3>${pool.name}</h3>
          <span class="pool-status ${pool.status}">${pool.status}</span>
        </div>
        <div class="pool-stats">
          <div class="stat">
            <span class="label">APY</span>
            <span class="value">${pool.apy}%</span>
          </div>
          <div class="stat">
            <span class="label">Total Staked</span>
            <span class="value">${this.formatNumber(pool.totalStaked)} RSC</span>
          </div>
          <div class="stat">
            <span class="label">Your Stake</span>
            <span class="value">${this.formatNumber(pool.stakedAmount)} RSC</span>
          </div>
          <div class="stat">
            <span class="label">Rewards</span>
            <span class="value">${this.formatNumber(pool.rewards)} RSC</span>
          </div>
        </div>
        <div class="pool-limits">
          <span>Min: ${this.formatNumber(pool.minStake)} RSC</span>
          <span>Max: ${this.formatNumber(pool.maxStake)} RSC</span>
        </div>
        <div class="pool-actions">
          ${pool.stakedAmount > 0 ? 
            `<button class="btn-unstake" data-pool="${pool.id}">Unstake</button>` : 
            ''
          }
          <button class="btn-stake" data-pool="${pool.id}">
            ${pool.stakedAmount > 0 ? 'Stake More' : 'Stake'}
          </button>
          ${pool.rewards > 0 ? 
            `<button class="btn-claim" onclick="stakingEnhanced.claimRewards(${pool.id})">Claim Rewards</button>` : 
            ''
          }
        </div>
      </div>
    `).join('');
  }

  renderValidators() {
    const container = document.querySelector('.validators-container');
    if (!container) return;

    container.innerHTML = this.validators.map(validator => `
      <div class="validator-card ${validator.status}">
        <div class="validator-header">
          <h3>${validator.name}</h3>
          <span class="validator-status ${validator.status}">${validator.status}</span>
        </div>
        <div class="validator-stats">
          <div class="stat">
            <span class="label">Commission</span>
            <span class="value">${validator.commission}%</span>
          </div>
          <div class="stat">
            <span class="label">Uptime</span>
            <span class="value">${validator.uptime}%</span>
          </div>
          <div class="stat">
            <span class="label">Total Staked</span>
            <span class="value">${this.formatNumber(validator.totalStaked)} RSC</span>
          </div>
          <div class="stat">
            <span class="label">Delegators</span>
            <span class="value">${validator.delegators}</span>
          </div>
        </div>
        <div class="validator-actions">
          <button class="btn-delegate" onclick="stakingEnhanced.delegateToValidator(${validator.id})">
            Delegate
          </button>
          <button class="btn-view" onclick="stakingEnhanced.viewValidatorDetails(${validator.id})">
            View Details
          </button>
        </div>
      </div>
    `).join('');
  }

  renderNetworkStats() {
    const container = document.querySelector('.network-stats');
    if (!container) return;

    const totalNetworkStaked = this.pools.reduce((sum, pool) => sum + pool.totalStaked, 0);
    const totalValidators = this.validators.length;
    const avgUptime = this.validators.reduce((sum, v) => sum + v.uptime, 0) / this.validators.length;

    container.innerHTML = `
      <div class="stat-card">
        <div class="stat-icon">🌐</div>
        <div class="stat-info">
          <div class="stat-value">${this.formatNumber(totalNetworkStaked)}</div>
          <div class="stat-label">Total Network Staked</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">🔗</div>
        <div class="stat-info">
          <div class="stat-value">${totalValidators}</div>
          <div class="stat-label">Active Validators</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">⚡</div>
        <div class="stat-info">
          <div class="stat-value">${avgUptime.toFixed(1)}%</div>
          <div class="stat-label">Average Uptime</div>
        </div>
      </div>
    `;
  }

  switchTab(tabName) {
    // Remove active class from all tabs
    document.querySelectorAll('.staking-tab').forEach(tab => {
      tab.classList.remove('active');
    });

    // Add active class to clicked tab
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

    // Show corresponding content
    document.querySelectorAll('.staking-content').forEach(content => {
      content.style.display = 'none';
    });
    document.querySelector(`.${tabName}-content`).style.display = 'block';
  }

  openStakeModal(poolId) {
    const pool = this.pools.find(p => p.id == poolId);
    if (!pool) return;

    this.showNotification(`Abriendo modal de staking para ${pool.name}`, 'info');
    // Here you would open a modal with staking form
  }

  openUnstakeModal(poolId) {
    const pool = this.pools.find(p => p.id == poolId);
    if (!pool) return;

    this.showNotification(`Abriendo modal de unstaking para ${pool.name}`, 'info');
    // Here you would open a modal with unstaking form
  }

  claimRewards(poolId) {
    const pool = this.pools.find(p => p.id == poolId);
    if (!pool || pool.rewards <= 0) return;

    this.showNotification(`Reclamando ${this.formatNumber(pool.rewards)} RSC de recompensas`, 'success');
    pool.rewards = 0;
    this.renderPools();
    this.renderStakingOverview();
  }

  delegateToValidator(validatorId) {
    const validator = this.validators.find(v => v.id == validatorId);
    if (!validator) return;

    this.showNotification(`Delegando a ${validator.name}`, 'info');
    // Here you would open delegation modal
  }

  viewValidatorDetails(validatorId) {
    const validator = this.validators.find(v => v.id == validatorId);
    if (!validator) return;

    this.showNotification(`Viendo detalles de ${validator.name}`, 'info');
    // Here you would open validator details modal
  }

  startRewardSimulation() {
    // Simulate reward accumulation
    setInterval(() => {
      this.pools.forEach(pool => {
        if (pool.stakedAmount > 0) {
          const dailyReward = (pool.stakedAmount * pool.apy) / 365 / 100;
          pool.rewards += dailyReward / 24; // Hourly reward
        }
      });
      this.renderPools();
      this.renderStakingOverview();
    }, 60000); // Update every minute
  }

  showNotification(message, type) {
    if (window.showNotification) {
      window.showNotification(message, type);
    } else {
      console.log(`${type.toUpperCase()}: ${message}`);
    }
  }

  formatNumber(num) {
    return num.toLocaleString('en-US', { 
      minimumFractionDigits: 0,
      maximumFractionDigits: 2 
    });
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  if (window.location.pathname.includes('staking.html')) {
    window.stakingEnhanced = new StakingEnhanced();
  }
});

// Export for global use
window.StakingEnhanced = StakingEnhanced; 