/* ================================
   WEBSOCKET.JS — COMUNICACIÓN EN TIEMPO REAL
================================ */

class WebSocketManager {
  constructor() {
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectInterval = 5000;
    this.isConnected = false;
    this.messageQueue = [];
    this.eventListeners = new Map();
    this.init();
  }

  init() {
    this.connect();
    this.setupEventListeners();
  }

  connect() {
    try {
      const wsUrl = API_CONFIG.WEBSOCKET.URL;
      this.ws = new WebSocket(wsUrl);
      
      this.ws.onopen = () => {
        console.log('🔗 WebSocket conectado');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.processMessageQueue();
        this.emit('connected');
      };

      this.ws.onmessage = (event) => {
        this.handleMessage(event.data);
      };

      this.ws.onclose = (event) => {
        console.log('🔌 WebSocket desconectado:', event.code, event.reason);
        this.isConnected = false;
        this.emit('disconnected', event);
        
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          this.scheduleReconnect();
        }
      };

      this.ws.onerror = (error) => {
        console.error('❌ Error de WebSocket:', error);
        this.emit('error', error);
      };

    } catch (error) {
      console.error('❌ Error conectando WebSocket:', error);
      this.scheduleReconnect();
    }
  }

  scheduleReconnect() {
    this.reconnectAttempts++;
    const delay = this.reconnectInterval * this.reconnectAttempts;
    
    console.log(`🔄 Reintentando conexión en ${delay}ms (intento ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
    
    setTimeout(() => {
      if (!this.isConnected) {
        this.connect();
      }
    }, delay);
  }

  handleMessage(data) {
    try {
      const message = JSON.parse(data);
      
      switch (message.type) {
        case 'price_update':
          this.handlePriceUpdate(message.data);
          break;
        case 'transaction_update':
          this.handleTransactionUpdate(message.data);
          break;
        case 'mining_update':
          this.handleMiningUpdate(message.data);
          break;
        case 'staking_update':
          this.handleStakingUpdate(message.data);
          break;
        case 'network_update':
          this.handleNetworkUpdate(message.data);
          break;
        case 'notification':
          this.handleNotification(message.data);
          break;
        default:
          console.log('📨 Mensaje WebSocket recibido:', message);
      }
      
      this.emit('message', message);
      
    } catch (error) {
      console.error('❌ Error procesando mensaje WebSocket:', error);
    }
  }

  handlePriceUpdate(data) {
    // Actualizar precio en tiempo real
    const priceElements = document.querySelectorAll('.price-value, .rsc-price');
    priceElements.forEach(element => {
      element.textContent = formatNumber(data.price);
      
      // Efecto de cambio de precio
      const change = data.change || 0;
      const changeClass = change > 0 ? 'positive' : change < 0 ? 'negative' : '';
      element.className = `price-value ${changeClass}`;
    });

    // Actualizar gráfico si existe
    if (window.chartManager) {
      window.chartManager.updatePriceChart(data.price);
    }
  }

  handleTransactionUpdate(data) {
    // Actualizar transacciones en tiempo real
    const { transaction, type } = data;
    
    // Agregar nueva transacción a la lista
    if (type === 'new') {
      this.addTransactionToList(transaction);
    }
    
    // Actualizar estado de transacción
    if (type === 'update') {
      this.updateTransactionStatus(transaction);
    }
  }

  handleMiningUpdate(data) {
    // Actualizar datos de minería en tiempo real
    const { hashRate, rewards, status } = data;
    
    // Actualizar elementos de minería
    const hashRateElements = document.querySelectorAll('.hash-rate-value');
    hashRateElements.forEach(element => {
      element.textContent = formatHashRate(hashRate);
    });

    const rewardsElements = document.querySelectorAll('.rewards-value');
    rewardsElements.forEach(element => {
      element.textContent = formatNumber(rewards);
    });

    const statusElements = document.querySelectorAll('.mining-status');
    statusElements.forEach(element => {
      element.textContent = status;
      element.className = `mining-status ${status}`;
    });

    // Actualizar gráfico si existe
    if (window.chartManager) {
      window.chartManager.updateMiningChart(hashRate);
    }
  }

  handleStakingUpdate(data) {
    // Actualizar datos de staking en tiempo real
    const { totalStaked, rewards, apy } = data;
    
    // Actualizar elementos de staking
    const stakedElements = document.querySelectorAll('.staked-amount');
    stakedElements.forEach(element => {
      element.textContent = formatNumber(totalStaked);
    });

    const apyElements = document.querySelectorAll('.apy-value');
    apyElements.forEach(element => {
      element.textContent = `${apy.toFixed(2)}%`;
    });

    // Actualizar gráfico si existe
    if (window.chartManager) {
      window.chartManager.updateStakingChart(totalStaked, 1000000000);
    }
  }

  handleNetworkUpdate(data) {
    // Actualizar estadísticas de red en tiempo real
    const { totalSupply, circulatingSupply, totalTransactions, activeValidators } = data;
    
    // Actualizar elementos de estadísticas
    const supplyElements = document.querySelectorAll('.total-supply');
    supplyElements.forEach(element => {
      element.textContent = formatNumber(totalSupply);
    });

    const circulatingElements = document.querySelectorAll('.circulating-supply');
    circulatingElements.forEach(element => {
      element.textContent = formatNumber(circulatingSupply);
    });

    const transactionElements = document.querySelectorAll('.total-transactions');
    transactionElements.forEach(element => {
      element.textContent = formatNumber(totalTransactions);
    });

    const validatorElements = document.querySelectorAll('.active-validators');
    validatorElements.forEach(element => {
      element.textContent = activeValidators;
    });
  }

  handleNotification(data) {
    // Mostrar notificación en tiempo real
    const { type, title, message, duration } = data;
    showNotification(type, title, message, duration);
  }

  addTransactionToList(transaction) {
    const transactionList = document.querySelector('.transaction-history, .transactions-list');
    if (!transactionList) return;

    const transactionHTML = this.createTransactionHTML(transaction);
    transactionList.insertAdjacentHTML('afterbegin', transactionHTML);
    
    // Limitar el número de transacciones mostradas
    const transactions = transactionList.querySelectorAll('.transaction-item, .history-item');
    if (transactions.length > 50) {
      transactions[transactions.length - 1].remove();
    }
  }

  updateTransactionStatus(transaction) {
    const transactionElement = document.querySelector(`[data-tx-hash="${transaction.hash}"]`);
    if (!transactionElement) return;

    const statusElement = transactionElement.querySelector('.transaction-status, .history-status');
    if (statusElement) {
      statusElement.textContent = transaction.status;
      statusElement.className = `transaction-status ${transaction.status}`;
    }
  }

  createTransactionHTML(transaction) {
    const type = transaction.type === 'send' ? 'sent' : 'received';
    const amount = transaction.type === 'send' ? `-${transaction.amount}` : `+${transaction.amount}`;
    const icon = transaction.type === 'send' ? '↗' : '↘';
    
    return `
      <div class="transaction-item" data-tx-hash="${transaction.hash}">
        <div class="transaction-icon ${type}">${icon}</div>
        <div class="transaction-details">
          <div class="transaction-title">${transaction.type === 'send' ? 'Sent' : 'Received'}</div>
          <div class="transaction-subtitle">${formatAddress(transaction.hash)}</div>
        </div>
        <div class="transaction-amount ${type}">${amount} RSC</div>
        <div class="transaction-status ${transaction.status}">${transaction.status}</div>
      </div>
    `;
  }

  send(message) {
    if (this.isConnected && this.ws) {
      this.ws.send(JSON.stringify(message));
    } else {
      // Agregar a la cola si no está conectado
      this.messageQueue.push(message);
    }
  }

  processMessageQueue() {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      this.send(message);
    }
  }

  subscribe(channel, callback) {
    if (!this.eventListeners.has(channel)) {
      this.eventListeners.set(channel, []);
    }
    this.eventListeners.get(channel).push(callback);
  }

  unsubscribe(channel, callback) {
    if (this.eventListeners.has(channel)) {
      const listeners = this.eventListeners.get(channel);
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  emit(channel, data) {
    if (this.eventListeners.has(channel)) {
      this.eventListeners.get(channel).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error en callback de WebSocket:', error);
        }
      });
    }
  }

  setupEventListeners() {
    // Suscribirse a eventos de la aplicación
    this.subscribe('connected', () => {
      console.log('🎉 WebSocket conectado exitosamente');
      showNotification('success', 'Conectado', 'Conexión en tiempo real establecida');
    });

    this.subscribe('disconnected', () => {
      console.log('⚠️ WebSocket desconectado');
      showNotification('warning', 'Desconectado', 'Conexión en tiempo real perdida');
    });

    this.subscribe('error', (error) => {
      console.error('❌ Error de WebSocket:', error);
      showNotification('error', 'Error de Conexión', 'Error en la conexión en tiempo real');
    });
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
    }
  }

  destroy() {
    this.disconnect();
    this.eventListeners.clear();
    this.messageQueue = [];
  }
}

// Función utilitaria para formatear hash rate
function formatHashRate(hashRate) {
  if (hashRate >= 1000000) {
    return (hashRate / 1000000).toFixed(2) + ' MH/s';
  } else if (hashRate >= 1000) {
    return (hashRate / 1000).toFixed(2) + ' KH/s';
  } else {
    return hashRate + ' H/s';
  }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  window.wsManager = new WebSocketManager();
});

// Exportar para uso global
window.WebSocketManager = WebSocketManager; 