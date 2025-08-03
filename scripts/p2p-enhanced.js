/* ================================
   P2P-ENHANCED.JS — MARKETPLACE P2P AVANZADO
================================ */

class P2PEnhanced {
  constructor() {
    this.orders = [];
    this.currentPrice = 0.85;
    this.priceHistory = [];
    this.userBalance = {
      rsc: 25847.32,
      usdt: 12450.00
    };
    this.init();
  }

  init() {
    this.loadOrders();
    this.setupEventListeners();
    this.startPriceSimulation();
    this.renderOrders();
    this.updatePriceChart();
  }

  setupEventListeners() {
    // Search functionality
    const searchInput = document.getElementById('searchTrader');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => this.filterOrders());
    }

    // Filter changes
    const paymentSelect = document.getElementById('paymentMethod');
    const orderSelect = document.getElementById('orderType');
    const sortSelect = document.getElementById('sortBy');

    if (paymentSelect) paymentSelect.addEventListener('change', () => this.filterOrders());
    if (orderSelect) orderSelect.addEventListener('change', () => this.filterOrders());
    if (sortSelect) sortSelect.addEventListener('change', () => this.sortOrders());

    // View toggle
    document.querySelectorAll('.btn-view').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.btn-view').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        this.switchView(e.target.dataset.view);
      });
    });
  }

  async loadOrders() {
    try {
      const response = await fetch(getApiUrl('/p2p/orders'), {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        const data = await response.json();
        this.orders = data.orders || [];
      } else {
        // Si P2P no está implementado, mostrar mensaje
        this.orders = [];
        this.showNotification('P2P no está disponible actualmente', 'info');
      }
    } catch (error) {
      console.error('Error cargando órdenes P2P:', error);
      this.orders = [];
      this.showNotification('Error cargando órdenes P2P', 'error');
    }
  }

  renderOrders() {
    this.renderBuyOrders();
    this.renderSellOrders();
  }

  renderBuyOrders() {
    const container = document.getElementById('buyOrdersContainer');
    if (!container) return;

    const buyOrders = this.orders.filter(order => order.type === 'buy');
    container.innerHTML = buyOrders.map(order => this.createOrderCard(order)).join('');
  }

  renderSellOrders() {
    const container = document.getElementById('sellOrdersContainer');
    if (!container) return;

    const sellOrders = this.orders.filter(order => order.type === 'sell');
    container.innerHTML = sellOrders.map(order => this.createOrderCard(order)).join('');
  }

  createOrderCard(order) {
    return `
      <div class="order-card ${order.type}" data-order-id="${order.id}">
        <div class="order-header">
          <div class="trader-info">
            <div class="trader-name">${order.trader}</div>
            <div class="trader-stats">
              <span class="rating">⭐ ${order.rating} (${order.trades})</span>
              <span class="payment">${this.getPaymentIcon(order.payment)} ${this.getPaymentName(order.payment)}</span>
            </div>
          </div>
          <div class="order-price">
            <span class="price">$${order.price}</span>
            <span class="amount">${this.formatNumber(order.amount)} RSC</span>
          </div>
        </div>
        <div class="order-details">
          <div class="limits">
            <span>Min: ${this.formatNumber(order.min)} RSC</span>
            <span>Max: ${this.formatNumber(order.max)} RSC</span>
          </div>
          <div class="order-time">${order.time}</div>
        </div>
        <div class="order-actions">
          <button class="btn-primary" onclick="p2pEnhanced.startTrade(${order.id})">
            ${order.type === 'buy' ? 'Comprar' : 'Vender'}
          </button>
          <button class="btn-secondary" onclick="p2pEnhanced.viewTrader(${order.trader})">
            Ver Perfil
          </button>
        </div>
      </div>
    `;
  }

  getPaymentIcon(payment) {
    const icons = {
      bank: '🏦',
      paypal: '💳',
      cash: '💵',
      crypto: '₿'
    };
    return icons[payment] || '💳';
  }

  getPaymentName(payment) {
    const names = {
      bank: 'Transferencia',
      paypal: 'PayPal',
      cash: 'Efectivo',
      crypto: 'Crypto'
    };
    return names[payment] || 'Otro';
  }

  filterOrders() {
    const searchTerm = document.getElementById('searchTrader')?.value.toLowerCase() || '';
    const paymentMethod = document.getElementById('paymentMethod')?.value || '';
    const orderType = document.getElementById('orderType')?.value || '';

    const filtered = this.orders.filter(order => {
      const matchesSearch = order.trader.toLowerCase().includes(searchTerm);
      const matchesPayment = !paymentMethod || order.payment === paymentMethod;
      const matchesType = !orderType || order.type === orderType;
      
      return matchesSearch && matchesPayment && matchesType;
    });

    this.renderFilteredOrders(filtered);
  }

  renderFilteredOrders(filteredOrders) {
    const buyContainer = document.getElementById('buyOrdersContainer');
    const sellContainer = document.getElementById('sellOrdersContainer');

    if (buyContainer) {
      const buyOrders = filteredOrders.filter(order => order.type === 'buy');
      buyContainer.innerHTML = buyOrders.map(order => this.createOrderCard(order)).join('');
    }

    if (sellContainer) {
      const sellOrders = filteredOrders.filter(order => order.type === 'sell');
      sellContainer.innerHTML = sellOrders.map(order => this.createOrderCard(order)).join('');
    }
  }

  sortOrders() {
    const sortBy = document.getElementById('sortBy')?.value || 'price';
    
    this.orders.sort((a, b) => {
      switch (sortBy) {
        case 'price':
          return a.price - b.price;
        case 'volume':
          return b.amount - a.amount;
        case 'rating':
          return b.rating - a.rating;
        case 'time':
          return new Date(a.time) - new Date(b.time);
        default:
          return 0;
      }
    });

    this.renderOrders();
  }

  switchView(view) {
    const containers = document.querySelectorAll('.orders-container');
    containers.forEach(container => {
      container.className = `orders-container view-${view}`;
    });
  }

  startTrade(orderId) {
    const order = this.orders.find(o => o.id === orderId);
    if (!order) return;

    this.showNotification(`Iniciando transacción con ${order.trader}`, 'info');
    
    // Simulate trade process
    setTimeout(() => {
      this.showNotification('Transacción completada exitosamente', 'success');
      this.updateUserBalance(order);
    }, 2000);
  }

  viewTrader(traderName) {
    this.showNotification(`Perfil de ${traderName}`, 'info');
    // Here you would open a modal with trader details
  }

  updateUserBalance(order) {
    if (order.type === 'buy') {
      this.userBalance.rsc += order.amount;
      this.userBalance.usdt -= order.amount * order.price;
    } else {
      this.userBalance.rsc -= order.amount;
      this.userBalance.usdt += order.amount * order.price;
    }

    this.updateBalanceDisplay();
  }

  updateBalanceDisplay() {
    const rscBalance = document.querySelector('.balance-item .value');
    const usdtBalance = document.querySelectorAll('.balance-item .value')[1];

    if (rscBalance) rscBalance.textContent = `${this.formatNumber(this.userBalance.rsc)} RSC`;
    if (usdtBalance) usdtBalance.textContent = `$${this.formatNumber(this.userBalance.usdt)}`;
  }

  startPriceSimulation() {
    // Simulate price changes
    setInterval(() => {
      const change = (Math.random() - 0.5) * 0.02;
      this.currentPrice += change;
      this.currentPrice = Math.max(0.5, Math.min(1.2, this.currentPrice));
      
      this.priceHistory.push({
        time: new Date(),
        price: this.currentPrice
      });

      // Keep only last 100 points
      if (this.priceHistory.length > 100) {
        this.priceHistory.shift();
      }

      this.updatePriceDisplay();
      this.updatePriceChart();
    }, 3000);
  }

  updatePriceDisplay() {
    const priceElement = document.querySelector('.price-value');
    if (priceElement) {
      priceElement.textContent = `$${this.currentPrice.toFixed(2)}`;
    }

    // Update change indicator
    const changeElement = document.querySelector('.price-change');
    if (changeElement && this.priceHistory.length > 1) {
      const previousPrice = this.priceHistory[this.priceHistory.length - 2].price;
      const change = this.currentPrice - previousPrice;
      const changePercent = (change / previousPrice) * 100;
      
      changeElement.textContent = `${change >= 0 ? '+' : ''}$${change.toFixed(2)} (${changePercent.toFixed(1)}%)`;
      changeElement.className = `price-change ${change >= 0 ? 'positive' : 'negative'}`;
    }
  }

  updatePriceChart() {
    const chartContainer = document.getElementById('priceChart');
    if (!chartContainer) return;

    // Simple chart visualization
    const chartData = this.priceHistory.map(point => point.price);
    const maxPrice = Math.max(...chartData);
    const minPrice = Math.min(...chartData);
    const range = maxPrice - minPrice;

    const svg = `
      <svg width="100%" height="100" viewBox="0 0 300 100">
        <polyline
          fill="none"
          stroke="${this.currentPrice > this.priceHistory[0]?.price ? '#24db81' : '#e35060'}"
          stroke-width="2"
          points="${chartData.map((price, index) => 
            `${(index / (chartData.length - 1)) * 300},${100 - ((price - minPrice) / range) * 80}`
          ).join(' ')}"
        />
      </svg>
    `;

    chartContainer.innerHTML = svg;
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
  if (window.location.pathname.includes('p2p.html')) {
    window.p2pEnhanced = new P2PEnhanced();
  }
});

// Export for global use
window.P2PEnhanced = P2PEnhanced; 