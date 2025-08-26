/* ================================
   MINING SUPABASE INTEGRATION
================================ */

class MiningSupabaseIntegration {
  constructor() {
    this.currentMiner = null;
    this.isMining = false;
    this.miningInterval = null;
    this.hashPower = 0;
    this.balance = 0;
    this.blocksMined = 0;
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.loadMinerData();
  }

  setupEventListeners() {
    // Start mining button
    const startMiningBtn = document.getElementById('startMining');
    if (startMiningBtn) {
      startMiningBtn.addEventListener('click', () => this.startMining());
    }

    // Stop mining button
    const stopMiningBtn = document.getElementById('stopMining');
    if (stopMiningBtn) {
      stopMiningBtn.addEventListener('click', () => this.stopMining());
    }

    // Mining form
    const miningForm = document.getElementById('miningForm');
    if (miningForm) {
      miningForm.addEventListener('submit', (e) => this.handleMiningForm(e));
    }
  }

  async loadMinerData() {
    // Try to get miner data from localStorage first
    const savedEmail = localStorage.getItem('minerEmail');
    if (savedEmail) {
      await this.loadMinerFromSupabase(savedEmail);
    }
  }

  async loadMinerFromSupabase(email) {
    if (!window.SupabaseHelpers) {
      console.warn('Supabase helpers not loaded');
      return;
    }

    try {
      const result = await window.SupabaseHelpers.getMiner(email);
      if (result.success && result.data) {
        this.currentMiner = result.data;
        this.hashPower = result.data.hash_power || 0;
        this.balance = result.data.balance || 0;
        this.blocksMined = result.data.blocks_mined || 0;
        this.updateMiningDisplay();
        console.log('Miner data loaded from Supabase:', this.currentMiner);
      }
    } catch (error) {
      console.error('Error loading miner data:', error);
    }
  }

  async handleMiningForm(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const email = formData.get('email');
    const name = formData.get('name');
    const walletAddress = formData.get('walletAddress') || null;

    if (!email || !name) {
      this.showNotification('Por favor completa todos los campos requeridos', 'error');
      return;
    }

    await this.registerMiner(email, name, walletAddress);
  }

  async registerMiner(email, name, walletAddress) {
    if (!window.SupabaseHelpers) {
      this.showNotification('Error: Supabase no está disponible', 'error');
      return;
    }

    try {
      // Check if miner already exists
      const existsResult = await window.SupabaseHelpers.checkMinerExists(email);
      
      if (existsResult.exists) {
        // Load existing miner
        await this.loadMinerFromSupabase(email);
        this.showNotification(`Bienvenido de vuelta, ${name}!`, 'success');
      } else {
        // Create new miner
        const result = await window.SupabaseHelpers.saveMiner(email, name, walletAddress);
        
        if (result.success) {
          this.currentMiner = result.data[0];
          this.hashPower = 0;
          this.balance = 0;
          this.blocksMined = 0;
          
          // Save email to localStorage
          localStorage.setItem('minerEmail', email);
          
          this.showNotification(`Minero registrado exitosamente, ${name}!`, 'success');
          this.updateMiningDisplay();
        } else {
          this.showNotification('Error registrando minero: ' + result.error.message, 'error');
          return;
        }
      }

      // Enable mining controls
      this.enableMiningControls();
      
    } catch (error) {
      console.error('Error in registerMiner:', error);
      this.showNotification('Error en el registro: ' + error.message, 'error');
    }
  }

  async startMining() {
    if (!this.currentMiner) {
      this.showNotification('Por favor regístrate primero', 'error');
      return;
    }

    if (this.isMining) {
      this.showNotification('Ya estás minando', 'info');
      return;
    }

    this.isMining = true;
    this.updateMiningButton();
    
    // Start mining simulation
    this.miningInterval = setInterval(() => {
      this.mineBlock();
    }, 1000); // Mine every second

    this.showNotification('Minería iniciada!', 'success');
  }

  async mineBlock() {
    if (!this.isMining) return;

    // Simulate mining a block
    const blockReward = Math.random() * 10 + 1; // Random reward between 1-11 RSC
    const hashPowerGain = Math.random() * 5 + 1; // Random hash power gain
    
    this.balance += blockReward;
    this.hashPower += hashPowerGain;
    this.blocksMined++;

    // Update display
    this.updateMiningDisplay();

    // Save to Supabase
    await this.saveMiningProgress();

    // Save transaction
    await this.saveMiningTransaction(blockReward, hashPowerGain);

    // Show mining notification
    this.showMiningNotification(blockReward, hashPowerGain);
  }

  async saveMiningProgress() {
    if (!this.currentMiner || !window.SupabaseHelpers) return;

    try {
      const result = await window.SupabaseHelpers.updateMiningProgress(
        this.currentMiner.email,
        this.hashPower,
        this.balance
      );

      if (!result.success) {
        console.error('Error saving mining progress:', result.error);
      }
    } catch (error) {
      console.error('Exception saving mining progress:', error);
    }
  }

  async saveMiningTransaction(reward, hashPowerGain) {
    if (!this.currentMiner || !window.SupabaseHelpers) return;

    try {
      const blockHash = this.generateBlockHash();
      const result = await window.SupabaseHelpers.saveMiningTransaction(
        this.currentMiner.email,
        hashPowerGain,
        reward,
        blockHash
      );

      if (!result.success) {
        console.error('Error saving mining transaction:', result.error);
      }
    } catch (error) {
      console.error('Exception saving mining transaction:', error);
    }
  }

  generateBlockHash() {
    return '0x' + Math.random().toString(16).substr(2, 64);
  }

  stopMining() {
    if (!this.isMining) {
      this.showNotification('No estás minando', 'info');
      return;
    }

    this.isMining = false;
    if (this.miningInterval) {
      clearInterval(this.miningInterval);
      this.miningInterval = null;
    }

    this.updateMiningButton();
    this.showNotification('Minería detenida', 'info');

    // Save final progress
    this.saveMiningProgress();
  }

  updateMiningButton() {
    const startBtn = document.getElementById('startMining');
    const stopBtn = document.getElementById('stopMining');
    
    if (startBtn) startBtn.style.display = this.isMining ? 'none' : 'inline-block';
    if (stopBtn) stopBtn.style.display = this.isMining ? 'inline-block' : 'none';
  }

  updateMiningDisplay() {
    // Update hash power
    const hashPowerElement = document.getElementById('hashPower');
    if (hashPowerElement) {
      hashPowerElement.textContent = this.formatNumber(this.hashPower);
    }

    // Update balance
    const balanceElement = document.getElementById('miningBalance');
    if (balanceElement) {
      balanceElement.textContent = this.formatNumber(this.balance);
    }

    // Update blocks mined
    const blocksElement = document.getElementById('blocksMined');
    if (blocksElement) {
      blocksElement.textContent = this.blocksMined;
    }

    // Update miner info
    const minerInfoElement = document.getElementById('minerInfo');
    if (minerInfoElement && this.currentMiner) {
      minerInfoElement.innerHTML = `
        <strong>Minero:</strong> ${this.currentMiner.name}<br>
        <strong>Email:</strong> ${this.currentMiner.email}<br>
        <strong>Wallet:</strong> ${this.currentMiner.wallet_address || 'No conectada'}
      `;
    }
  }

  enableMiningControls() {
    const miningControls = document.getElementById('miningControls');
    if (miningControls) {
      miningControls.style.display = 'block';
    }

    const miningForm = document.getElementById('miningForm');
    if (miningForm) {
      miningForm.style.display = 'none';
    }
  }

  showMiningNotification(reward, hashPowerGain) {
    const notification = document.createElement('div');
    notification.className = 'mining-notification';
    notification.innerHTML = `
      <div class="notification-content">
        <span class="notification-icon">⛏️</span>
        <span class="notification-text">
          ¡Bloque minado! +${this.formatNumber(reward)} RSC | +${this.formatNumber(hashPowerGain)} Hash Power
        </span>
      </div>
    `;

    // Add to page
    const container = document.querySelector('.mining-container') || document.body;
    container.appendChild(notification);

    // Remove after 3 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 3000);
  }

  showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;

    // Add to page
    document.body.appendChild(notification);

    // Remove after 5 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 5000);
  }

  formatNumber(num) {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(num);
  }

  // Get current mining stats
  getMiningStats() {
    return {
      isMining: this.isMining,
      hashPower: this.hashPower,
      balance: this.balance,
      blocksMined: this.blocksMined,
      miner: this.currentMiner
    };
  }

  // Reset mining session
  resetMining() {
    this.stopMining();
    this.hashPower = 0;
    this.balance = 0;
    this.blocksMined = 0;
    this.updateMiningDisplay();
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.miningSupabase = new MiningSupabaseIntegration();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MiningSupabaseIntegration;
}
