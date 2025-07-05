/* ================================
   WALLET-ENHANCED.JS — FUNCIONALIDADES AVANZADAS
================================ */

class WalletEnhanced {
  constructor() {
    this.balance = 125847.32;
    this.transactions = [];
    this.isBalanceHidden = false;
    this.init();
  }

  init() {
    this.loadTransactions();
    this.setupEventListeners();
    this.updateBalance();
    this.startPriceUpdates();
  }

  setupEventListeners() {
    // Toggle balance visibility
    const toggleBtn = document.getElementById('toggleBalance');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => this.toggleBalance());
    }

    // Refresh balance
    const refreshBtn = document.getElementById('refreshBalance');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => this.refreshBalance());
    }

    // Setup form handlers
    this.setupFormHandlers();
  }

  toggleBalance() {
    this.isBalanceHidden = !this.isBalanceHidden;
    this.updateBalance();
    
    const toggleBtn = document.getElementById('toggleBalance');
    if (toggleBtn) {
      toggleBtn.textContent = this.isBalanceHidden ? '👁️‍🗨️' : '👁️';
    }
  }

  updateBalance() {
    const balanceElement = document.getElementById('balanceAmount');
    if (balanceElement) {
      if (this.isBalanceHidden) {
        balanceElement.innerHTML = '<span class="amount">••••••</span><span class="currency">RSC</span>';
      } else {
        balanceElement.innerHTML = `<span class="amount">${this.formatNumber(this.balance)}</span><span class="currency">RSC</span>`;
      }
    }

    // Update USD value
    const usdElement = document.querySelector('.balance-usd .usd-amount');
    if (usdElement && !this.isBalanceHidden) {
      const usdValue = this.balance * 0.85; // Mock price
      usdElement.textContent = `$${this.formatNumber(usdValue)}`;
    }
  }

  refreshBalance() {
    const refreshBtn = document.getElementById('refreshBalance');
    if (refreshBtn) {
      refreshBtn.style.transform = 'rotate(360deg)';
      setTimeout(() => {
        refreshBtn.style.transform = 'rotate(0deg)';
      }, 1000);
    }

    // Simulate API call
    setTimeout(() => {
      this.balance += Math.random() * 100 - 50;
      this.updateBalance();
      this.showNotification('Balance actualizado', 'success');
    }, 1000);
  }

  loadTransactions() {
    // Mock transactions data
    this.transactions = [
      {
        id: 1,
        type: 'send',
        amount: 1000,
        address: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
        timestamp: new Date(Date.now() - 3600000),
        status: 'completed'
      },
      {
        id: 2,
        type: 'receive',
        amount: 2500,
        address: '0x1234567890abcdef1234567890abcdef12345678',
        timestamp: new Date(Date.now() - 7200000),
        status: 'completed'
      },
      {
        id: 3,
        type: 'stake',
        amount: 5000,
        address: 'Staking Pool #1',
        timestamp: new Date(Date.now() - 86400000),
        status: 'pending'
      }
    ];

    this.renderTransactions();
  }

  renderTransactions() {
    const container = document.getElementById('transactionsList');
    if (!container) return;

    container.innerHTML = this.transactions.map(tx => `
      <div class="transaction-item ${tx.type} ${tx.status}">
        <div class="transaction-icon">
          ${this.getTransactionIcon(tx.type)}
        </div>
        <div class="transaction-details">
          <div class="transaction-type">${this.getTransactionType(tx.type)}</div>
          <div class="transaction-address">${this.shortenAddress(tx.address)}</div>
          <div class="transaction-time">${this.formatTime(tx.timestamp)}</div>
        </div>
        <div class="transaction-amount">
          <span class="amount ${tx.type === 'send' ? 'negative' : 'positive'}">
            ${tx.type === 'send' ? '-' : '+'}${this.formatNumber(tx.amount)} RSC
          </span>
          <span class="status ${tx.status}">${tx.status}</span>
        </div>
      </div>
    `).join('');
  }

  getTransactionIcon(type) {
    const icons = {
      send: '📤',
      receive: '📥',
      stake: '💎',
      swap: '🔄'
    };
    return icons[type] || '📋';
  }

  getTransactionType(type) {
    const types = {
      send: 'Enviado',
      receive: 'Recibido',
      stake: 'Staking',
      swap: 'Intercambio'
    };
    return types[type] || 'Transacción';
  }

  shortenAddress(address) {
    if (address.length <= 20) return address;
    return address.substring(0, 10) + '...' + address.substring(address.length - 8);
  }

  formatTime(timestamp) {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    return `${days}d`;
  }

  setupFormHandlers() {
    // Send form
    const sendForm = document.getElementById('sendForm');
    if (sendForm) {
      sendForm.addEventListener('submit', (e) => this.handleSend(e));
    }

    // Receive form
    const receiveForm = document.getElementById('receiveForm');
    if (receiveForm) {
      receiveForm.addEventListener('submit', (e) => this.handleReceive(e));
    }
  }

  handleSend(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const address = formData.get('recipientAddress');
    const amount = parseFloat(formData.get('sendAmount'));

    if (amount > this.balance) {
      this.showNotification('Saldo insuficiente', 'error');
      return;
    }

    // Simulate transaction
    this.showNotification('Transacción enviada', 'success');
    this.balance -= amount;
    this.updateBalance();
    this.closeModal('sendModal');
    
    // Add to transactions
    this.transactions.unshift({
      id: Date.now(),
      type: 'send',
      amount: amount,
      address: address,
      timestamp: new Date(),
      status: 'completed'
    });
    this.renderTransactions();
  }

  handleReceive(e) {
    e.preventDefault();
    this.showNotification('Dirección copiada al portapapeles', 'success');
    this.closeModal('receiveModal');
  }

  startPriceUpdates() {
    // Simulate real-time price updates
    setInterval(() => {
      const priceElement = document.querySelector('.stat-number');
      if (priceElement && priceElement.textContent.includes('$')) {
        const currentPrice = parseFloat(priceElement.textContent.replace('$', ''));
        const change = (Math.random() - 0.5) * 0.1;
        const newPrice = currentPrice + change;
        priceElement.textContent = `$${newPrice.toFixed(2)}`;
      }
    }, 5000);
  }

  showNotification(message, type) {
    if (window.showNotification) {
      window.showNotification(message, type);
    } else {
      console.log(`${type.toUpperCase()}: ${message}`);
    }
  }

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.style.display = 'none';
    }
  }

  formatNumber(num) {
    return num.toLocaleString('en-US', { 
      minimumFractionDigits: 2,
      maximumFractionDigits: 2 
    });
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  if (window.location.pathname.includes('wallet.html')) {
    new WalletEnhanced();
  }
});

// Export for global use
window.WalletEnhanced = WalletEnhanced; 