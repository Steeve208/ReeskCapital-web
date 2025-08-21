// ===== SIMULADOR DE MINERÍA - RSC CHAIN =====
// Sistema completo de minería simulada para el frontend

class MiningSimulator {
  constructor() {
    this.isMining = false;
    this.currentSession = null;
    this.walletAddress = null;
    this.hashPower = 1.0;
    this.updateInterval = null;
    this.statsUpdateInterval = null;
    this.currentTokens = 0;
    this.totalTokens = 0;
    this.miningStartTime = null;
    
    // Configuración
    this.config = {
      updateIntervalMs: 1000,
      statsUpdateIntervalMs: 5000,
      maxHashPower: 100.0,
      minHashPower: 0.1,
      defaultHashPower: 1.0
    };
    
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.loadUserData();
    this.startStatsUpdates();
    console.log('✅ Simulador de minería inicializado');
  }

  setupEventListeners() {
    // Botón de iniciar minería
    const startBtn = document.getElementById('startMiningBtn');
    if (startBtn) {
      startBtn.addEventListener('click', () => this.startMining());
    }

    // Botón de detener minería
    const stopBtn = document.getElementById('stopMiningBtn');
    if (stopBtn) {
      stopBtn.addEventListener('click', () => this.stopMining());
    }

    // Slider de potencia de hash
    const hashPowerSlider = document.getElementById('hashPowerSlider');
    if (hashPowerSlider) {
      hashPowerSlider.addEventListener('input', (e) => {
        this.hashPower = parseFloat(e.target.value);
        this.updateHashPowerDisplay();
      });
    }

    // Botón de conectar wallet
    const connectWalletBtn = document.getElementById('connectWalletBtn');
    if (connectWalletBtn) {
      connectWalletBtn.addEventListener('click', () => this.connectWallet());
    }

    // Botón de ver historial
    const viewHistoryBtn = document.getElementById('viewHistoryBtn');
    if (viewHistoryBtn) {
      viewHistoryBtn.addEventListener('click', () => this.showMiningHistory());
    }

    // Botón de exportar datos
    const exportDataBtn = document.getElementById('exportDataBtn');
    if (exportDataBtn) {
      exportDataBtn.addEventListener('click', () => this.exportMiningData());
    }
  }

  async loadUserData() {
    try {
      // Intentar obtener wallet del localStorage o de la sesión
      this.walletAddress = localStorage.getItem('rsc_wallet_address') || 
                          sessionStorage.getItem('rsc_wallet_address');
      
      if (this.walletAddress) {
        await this.loadMiningStatus();
        this.updateWalletDisplay();
      }
    } catch (error) {
      console.error('Error cargando datos del usuario:', error);
    }
  }

  async connectWallet() {
    try {
      // Simular conexión de wallet (en producción esto sería con MetaMask o similar)
      const mockWallet = '0x' + '1234567890abcdef'.repeat(4); // Wallet de ejemplo
      
      this.walletAddress = mockWallet;
      localStorage.setItem('rsc_wallet_address', mockWallet);
      
      this.updateWalletDisplay();
      await this.loadMiningStatus();
      
      this.showNotification('Wallet conectada: ' + mockWallet.substring(0, 10) + '...', 'success');
    } catch (error) {
      this.showNotification('Error conectando wallet: ' + error.message, 'error');
    }
  }

  updateWalletDisplay() {
    const walletDisplay = document.getElementById('walletDisplay');
    const connectWalletBtn = document.getElementById('connectWalletBtn');
    
    if (walletDisplay && connectWalletBtn) {
      if (this.walletAddress) {
        walletDisplay.textContent = this.walletAddress.substring(0, 10) + '...' + this.walletAddress.substring(38);
        walletDisplay.style.display = 'block';
        connectWalletBtn.style.display = 'none';
      } else {
        walletDisplay.style.display = 'none';
        connectWalletBtn.style.display = 'block';
      }
    }
  }

  updateHashPowerDisplay() {
    const hashPowerValue = document.getElementById('hashPowerValue');
    if (hashPowerValue) {
      hashPowerValue.textContent = this.hashPower.toFixed(1);
    }
  }

  async startMining() {
    if (!this.walletAddress) {
      this.showNotification('Conecta tu wallet primero', 'warning');
      return;
    }

    if (this.isMining) {
      this.showNotification('Ya estás minando', 'info');
      return;
    }

    try {
      const response = await fetch('/api/mining/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: this.walletAddress,
          hashPower: this.hashPower
        })
      });

      const result = await response.json();

      if (result.success) {
        this.isMining = true;
        this.currentSession = result.sessionId;
        this.miningStartTime = new Date();
        this.currentTokens = 0;
        
        this.updateMiningUI();
        this.startRealTimeUpdates();
        this.showNotification('Minería iniciada correctamente', 'success');
        
        // Actualizar total de tokens
        this.totalTokens = result.user.totalTokens;
        this.updateTokensDisplay();
      } else {
        throw new Error(result.error || 'Error desconocido');
      }
    } catch (error) {
      this.showNotification('Error iniciando minería: ' + error.message, 'error');
      console.error('Error iniciando minería:', error);
    }
  }

  async stopMining() {
    if (!this.isMining) {
      this.showNotification('No estás minando', 'info');
      return;
    }

    try {
      const response = await fetch('/api/mining/stop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: this.walletAddress
        })
      });

      const result = await response.json();

      if (result.success) {
        this.isMining = false;
        this.currentSession = null;
        this.miningStartTime = null;
        
        this.updateMiningUI();
        this.stopRealTimeUpdates();
        
        // Actualizar total de tokens
        this.totalTokens = result.user.newBalance;
        this.updateTokensDisplay();
        
        // Mostrar resumen de sesión
        this.showMiningSummary(result.session.tokensEarned, result.session.duration);
        
        this.showNotification('Minería detenida correctamente', 'success');
      } else {
        throw new Error(result.error || 'Error desconocido');
      }
    } catch (error) {
      this.showNotification('Error deteniendo minería: ' + error.message, 'error');
      console.error('Error deteniendo minería:', error);
    }
  }

  startRealTimeUpdates() {
    this.updateInterval = setInterval(async () => {
      await this.updateMiningStatus();
    }, this.config.updateIntervalMs);
  }

  stopRealTimeUpdates() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  async updateMiningStatus() {
    if (!this.isMining || !this.walletAddress) return;

    try {
      const response = await fetch(`/api/mining/status/${this.walletAddress}`);
      const result = await response.json();

      if (result.success && result.mining.isMining) {
        const stats = result.mining.stats;
        if (stats) {
          this.currentTokens = stats.currentTokens;
          this.updateTokensDisplay();
          this.updateMiningStats(stats);
        }
      }
    } catch (error) {
      console.error('Error actualizando estado de minería:', error);
    }
  }

  updateMiningStats(stats) {
    // Actualizar tiempo de minería
    const miningTimeDisplay = document.getElementById('miningTime');
    if (miningTimeDisplay && stats.duration) {
      miningTimeDisplay.textContent = this.formatDuration(stats.duration);
    }

    // Actualizar tokens por hora estimados
    const tokensPerHourDisplay = document.getElementById('tokensPerHour');
    if (tokensPerHourDisplay && stats.tokensPerHour) {
      tokensPerHourDisplay.textContent = stats.tokensPerHour.toFixed(6);
    }

    // Actualizar estimación diaria
    const estimatedDailyDisplay = document.getElementById('estimatedDaily');
    if (estimatedDailyDisplay && stats.estimatedDailyTokens) {
      estimatedDailyDisplay.textContent = stats.estimatedDailyTokens.toFixed(6);
    }
  }

  updateMiningUI() {
    const startBtn = document.getElementById('startMiningBtn');
    const stopBtn = document.getElementById('stopMiningBtn');
    const miningStatus = document.getElementById('miningStatus');
    const miningControls = document.getElementById('miningControls');
    const miningStats = document.getElementById('miningStats');

    if (startBtn && stopBtn && miningStatus) {
      if (this.isMining) {
        startBtn.style.display = 'none';
        stopBtn.style.display = 'block';
        miningStatus.textContent = '⛏️ Minando...';
        miningStatus.className = 'mining-active';
        
        if (miningControls) miningControls.style.display = 'block';
        if (miningStats) miningStats.style.display = 'block';
      } else {
        startBtn.style.display = 'block';
        stopBtn.style.display = 'none';
        miningStatus.textContent = '⏸️ Minería detenida';
        miningStatus.className = 'mining-stopped';
        
        if (miningControls) miningControls.style.display = 'none';
        if (miningStats) miningStats.style.display = 'none';
      }
    }
  }

  updateTokensDisplay() {
    const currentTokensDisplay = document.getElementById('currentTokens');
    const totalTokensDisplay = document.getElementById('totalTokens');
    
    if (currentTokensDisplay) {
      currentTokensDisplay.textContent = this.currentTokens.toFixed(6);
    }
    
    if (totalTokensDisplay) {
      totalTokensDisplay.textContent = this.totalTokens.toFixed(6);
    }
  }

  async loadMiningStatus() {
    if (!this.walletAddress) return;

    try {
      const response = await fetch(`/api/mining/status/${this.walletAddress}`);
      const result = await response.json();

      if (result.success) {
        this.totalTokens = result.user.totalTokens;
        this.isMining = result.mining.isMining;
        
        if (this.isMining) {
          this.currentSession = result.mining.currentSession?.id;
          this.miningStartTime = new Date(result.mining.currentSession?.startTime);
          this.currentTokens = result.mining.currentSession?.tokensEarned || 0;
          
          this.startRealTimeUpdates();
        }
        
        this.updateMiningUI();
        this.updateTokensDisplay();
        this.updateMiningHistory(result.history);
      }
    } catch (error) {
      console.error('Error cargando estado de minería:', error);
    }
  }

  updateMiningHistory(history) {
    const historyTable = document.getElementById('miningHistoryTable');
    if (!historyTable || !history.recent) return;

    const tbody = historyTable.querySelector('tbody');
    if (!tbody) return;

    tbody.innerHTML = '';

    history.recent.slice(0, 10).forEach(entry => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${new Date(entry.timestamp).toLocaleString()}</td>
        <td>${entry.action}</td>
        <td>${entry.tokens_earned ? entry.tokens_earned.toFixed(6) : '-'}</td>
        <td>${entry.details || '-'}</td>
      `;
      tbody.appendChild(row);
    });
  }

  showMiningSummary(tokensEarned, duration) {
    const summary = `
      <div class="mining-summary">
        <h3>🎉 Sesión de Minería Completada</h3>
        <div class="summary-stats">
          <div class="summary-stat">
            <span class="stat-label">Tokens Ganados:</span>
            <span class="stat-value">${tokensEarned.toFixed(6)} RSC</span>
          </div>
          <div class="summary-stat">
            <span class="stat-label">Duración:</span>
            <span class="stat-value">${this.formatDuration(duration)}</span>
          </div>
          <div class="summary-stat">
            <span class="stat-label">Total Acumulado:</span>
            <span class="stat-value">${this.totalTokens.toFixed(6)} RSC</span>
          </div>
        </div>
      </div>
    `;

    this.showModal('Resumen de Minería', summary);
  }

  async showMiningHistory() {
    if (!this.walletAddress) {
      this.showNotification('Conecta tu wallet primero', 'warning');
      return;
    }

    try {
      const response = await fetch(`/api/mining/history/${this.walletAddress}?limit=50`);
      const result = await response.json();

      if (result.success) {
        let historyHTML = `
          <div class="mining-history-modal">
            <h3>📊 Historial de Minería</h3>
            <div class="history-summary">
              <div class="summary-item">
                <span class="label">Total de Tokens:</span>
                <span class="value">${result.user.totalTokens.toFixed(6)} RSC</span>
              </div>
              <div class="summary-item">
                <span class="label">Sesiones Totales:</span>
                <span class="value">${result.sessions.length}</span>
              </div>
            </div>
            <div class="history-tabs">
              <button class="tab-btn active" data-tab="sessions">Sesiones</button>
              <button class="tab-btn" data-tab="actions">Acciones</button>
            </div>
        `;

        // Tab de sesiones
        historyHTML += `
          <div class="tab-content active" id="sessions-tab">
            <table class="history-table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Hash Power</th>
                  <th>Duración</th>
                  <th>Tokens Ganados</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
        `;

        result.sessions.forEach(session => {
          const startDate = new Date(session.start_time);
          const endDate = session.end_time ? new Date(session.end_time) : null;
          const duration = endDate ? Math.floor((endDate - startDate) / 1000) : 0;
          
          historyHTML += `
            <tr>
              <td>${startDate.toLocaleString()}</td>
              <td>${session.hash_power} TH/s</td>
              <td>${this.formatDuration(duration)}</td>
              <td>${session.tokens_earned ? session.tokens_earned.toFixed(6) : '-'}</td>
              <td><span class="status-badge ${session.status}">${session.status}</span></td>
            </tr>
          `;
        });

        historyHTML += `
              </tbody>
            </table>
          </div>
        `;

        // Tab de acciones
        historyHTML += `
          <div class="tab-content" id="actions-tab">
            <table class="history-table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Acción</th>
                  <th>Tokens</th>
                  <th>Total</th>
                  <th>Detalles</th>
                </tr>
              </thead>
              <tbody>
        `;

        result.history.forEach(entry => {
          historyHTML += `
            <tr>
              <td>${new Date(entry.timestamp).toLocaleString()}</td>
              <td>${entry.action}</td>
              <td>${entry.tokens_earned ? entry.tokens_earned.toFixed(6) : '-'}</td>
              <td>${entry.running_total ? entry.running_total.toFixed(6) : '-'}</td>
              <td>${entry.details || '-'}</td>
            </tr>
          `;
        });

        historyHTML += `
              </tbody>
            </table>
          </div>
        </div>
        `;

        this.showModal('Historial Completo de Minería', historyHTML);
        this.setupHistoryTabs();
      }
    } catch (error) {
      this.showNotification('Error cargando historial: ' + error.message, 'error');
    }
  }

  setupHistoryTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const tabName = btn.dataset.tab;
        
        // Remover clase active de todos los tabs
        tabBtns.forEach(b => b.classList.remove('active'));
        tabContents.forEach(c => c.classList.remove('active'));
        
        // Activar tab seleccionado
        btn.classList.add('active');
        document.getElementById(`${tabName}-tab`).classList.add('active');
      });
    });
  }

  async exportMiningData() {
    if (!this.walletAddress) {
      this.showNotification('Conecta tu wallet primero', 'warning');
      return;
    }

    try {
      const response = await fetch(`/api/mining/history/${this.walletAddress}?limit=1000`);
      const result = await response.json();

      if (result.success) {
        const exportData = {
          exportDate: new Date().toISOString(),
          walletAddress: this.walletAddress,
          totalTokens: result.user.totalTokens,
          sessions: result.sessions,
          history: result.history
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `mining_data_${this.walletAddress.substring(0, 10)}_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.showNotification('Datos exportados correctamente', 'success');
      }
    } catch (error) {
      this.showNotification('Error exportando datos: ' + error.message, 'error');
    }
  }

  startStatsUpdates() {
    this.statsUpdateInterval = setInterval(async () => {
      await this.updateSystemStats();
    }, this.config.statsUpdateIntervalMs);
  }

  async updateSystemStats() {
    try {
      const response = await fetch('/api/mining/system-stats');
      const result = await response.json();

      if (result.success) {
        this.updateSystemStatsDisplay(result.stats);
      }
    } catch (error) {
      console.error('Error actualizando estadísticas del sistema:', error);
    }
  }

  updateSystemStatsDisplay(stats) {
    const totalUsersDisplay = document.getElementById('totalUsers');
    const totalTokensDisplay = document.getElementById('totalTokensSystem');
    const activeMinersDisplay = document.getElementById('activeMiners');
    const totalSessionsDisplay = document.getElementById('totalSessions');

    if (totalUsersDisplay) totalUsersDisplay.textContent = stats.totalUsers.toLocaleString();
    if (totalTokensDisplay) totalTokensDisplay.textContent = stats.totalTokens.toFixed(2);
    if (activeMinersDisplay) activeMinersDisplay.textContent = stats.activeMiners.toLocaleString();
    if (totalSessionsDisplay) totalSessionsDisplay.textContent = stats.totalSessions.toLocaleString();
  }

  formatDuration(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    } else if (minutes > 0) {
      return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    } else {
      return `${secs}s`;
    }
  }

  showModal(title, content) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h2>${title}</h2>
          <button class="modal-close">&times;</button>
        </div>
        <div class="modal-body">
          ${content}
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Cerrar modal
    modal.querySelector('.modal-close').addEventListener('click', () => {
      document.body.removeChild(modal);
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        document.body.removeChild(modal);
      }
    });
  }

  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;

    document.body.appendChild(notification);

    // Mostrar notificación
    setTimeout(() => notification.classList.add('show'), 100);

    // Ocultar y remover después de 5 segundos
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 5000);
  }

  destroy() {
    this.stopRealTimeUpdates();
    if (this.statsUpdateInterval) {
      clearInterval(this.statsUpdateInterval);
    }
    console.log('✅ Simulador de minería destruido');
  }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  window.miningSimulator = new MiningSimulator();
});

// Exportar para uso global
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MiningSimulator;
}
