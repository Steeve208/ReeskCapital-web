/* ================================
   MINING SYSTEM - NEW ARCHITECTURE
================================ */

class RSCMiningSystem {
  constructor() {
    this.currentSession = null;
    this.isMining = false;
    this.heartbeatInterval = null;
    this.heartbeatTimer = null;
    this.sessionStats = {
      totalSeconds: 0,
      tokensEarned: 0,
      startTime: null
    };
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.checkAuthState();
    this.setupAuthListener();
  }

  setupEventListeners() {
    // Login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => this.handleLogin(e));
    }

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

    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => this.logout());
    }
  }

  setupAuthListener() {
    if (window.RSCMiningClient) {
      window.RSCMiningClient.onAuthStateChange((event, session) => {
        console.log('Auth state changed:', event, session);
        this.handleAuthStateChange(event, session);
      });
    }
  }

  async checkAuthState() {
    if (window.RSCMiningClient) {
      const userResult = await window.RSCMiningClient.getCurrentUser();
      if (userResult.success && userResult.user) {
        this.showAuthenticatedUI();
        this.loadUserData();
      } else {
        this.showLoginUI();
      }
    }
  }

  handleAuthStateChange(event, session) {
    if (event === 'SIGNED_IN' && session) {
      this.showAuthenticatedUI();
      this.loadUserData();
    } else if (event === 'SIGNED_OUT') {
      this.showLoginUI();
      this.stopMining(); // Stop any active mining
    }
  }

  async handleLogin(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const email = formData.get('email');

    if (!email) {
      this.showNotification('Please enter your email', 'error');
      return;
    }

    this.showNotification('Sending magic link...', 'info');
    
    try {
      const result = await window.RSCMiningClient.signInWithEmail(email);
      if (result.success) {
        this.showNotification(result.message, 'success');
        // The user will receive an email and click the magic link
      } else {
        this.showNotification('Login failed: ' + result.error, 'error');
      }
    } catch (error) {
      this.showNotification('Login error: ' + error.message, 'error');
    }
  }

  async logout() {
    try {
      await window.RSCMiningClient.signOut();
      this.showNotification('Logged out successfully', 'success');
    } catch (error) {
      this.showNotification('Logout error: ' + error.message, 'error');
    }
  }

  async loadUserData() {
    try {
      // Load profile
      const profileResult = await window.RSCMiningClient.getProfile();
      if (profileResult.success) {
        this.updateProfileDisplay(profileResult.data);
      }

      // Load balance
      const balanceResult = await window.RSCMiningClient.getBalance();
      if (balanceResult.success) {
        this.updateBalanceDisplay(balanceResult.data);
      }

      // Load mining sessions
      const sessionsResult = await window.RSCMiningClient.getMiningSessions();
      if (sessionsResult.success) {
        this.updateSessionsDisplay(sessionsResult.data);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  }

  async startMining() {
    if (!window.RSCMiningClient) {
      this.showNotification('Mining client not available', 'error');
      return;
    }

    if (this.isMining) {
      this.showNotification('Already mining', 'info');
      return;
    }

    try {
      const deviceFingerprint = window.RSCMiningClient.generateDeviceFingerprint();
      const result = await window.RSCMiningClient.startMining(deviceFingerprint);
      
      if (result.success) {
        this.currentSession = result.data.session_id;
        this.isMining = true;
        this.sessionStats.startTime = new Date();
        this.sessionStats.totalSeconds = 0;
        this.sessionStats.tokensEarned = 0;
        
        this.updateMiningUI();
        this.startHeartbeat();
        
        this.showNotification('Mining started successfully!', 'success');
      } else {
        this.showNotification('Failed to start mining: ' + result.error, 'error');
      }
    } catch (error) {
      this.showNotification('Error starting mining: ' + error.message, 'error');
    }
  }

  async stopMining() {
    if (!this.isMining || !this.currentSession) {
      return;
    }

    try {
      const result = await window.RSCMiningClient.stopMining(this.currentSession);
      
      if (result.success) {
        this.isMining = false;
        this.currentSession = null;
        this.stopHeartbeat();
        this.updateMiningUI();
        
        // Reload user data to get updated balance
        this.loadUserData();
        
        this.showNotification('Mining stopped', 'info');
      } else {
        this.showNotification('Failed to stop mining: ' + result.error, 'error');
      }
    } catch (error) {
      this.showNotification('Error stopping mining: ' + error.message, 'error');
    }
  }

  startHeartbeat() {
    // Send heartbeat every 15 seconds
    this.heartbeatInterval = setInterval(async () => {
      if (this.isMining && this.currentSession) {
        try {
          const result = await window.RSCMiningClient.heartbeat(this.currentSession);
          if (result.success) {
            this.updateSessionStats(result.data);
          } else {
            console.error('Heartbeat failed:', result.error);
            // If heartbeat fails, stop mining
            this.stopMining();
          }
        } catch (error) {
          console.error('Heartbeat error:', error);
          this.stopMining();
        }
      }
    }, 15000);

    // Also send immediate heartbeat
    this.sendHeartbeat();
  }

  async sendHeartbeat() {
    if (this.isMining && this.currentSession) {
      try {
        const result = await window.RSCMiningClient.heartbeat(this.currentSession);
        if (result.success) {
          this.updateSessionStats(result.data);
        }
      } catch (error) {
        console.error('Immediate heartbeat error:', error);
      }
    }
  }

  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  updateSessionStats(heartbeatData) {
    this.sessionStats.totalSeconds += heartbeatData.added_seconds;
    this.sessionStats.tokensEarned += heartbeatData.added_tokens;
    
    this.updateMiningStatsDisplay();
  }

  updateMiningUI() {
    const startBtn = document.getElementById('startMining');
    const stopBtn = document.getElementById('stopMining');
    
    if (startBtn) startBtn.style.display = this.isMining ? 'none' : 'inline-block';
    if (stopBtn) stopBtn.style.display = this.isMining ? 'inline-block' : 'none';
    
    this.updateMiningStatsDisplay();
  }

  updateMiningStatsDisplay() {
    const totalSecondsElement = document.getElementById('totalSeconds');
    const tokensEarnedElement = document.getElementById('tokensEarned');
    const sessionTimeElement = document.getElementById('sessionTime');
    
    if (totalSecondsElement) {
      totalSecondsElement.textContent = this.sessionStats.totalSeconds;
    }
    
    if (tokensEarnedElement) {
      tokensEarnedElement.textContent = this.formatTokens(this.sessionStats.tokensEarned);
    }
    
    if (sessionTimeElement && this.sessionStats.startTime) {
      const elapsed = Math.floor((new Date() - this.sessionStats.startTime) / 1000);
      sessionTimeElement.textContent = this.formatTime(elapsed);
    }
  }

  updateProfileDisplay(profile) {
    const profileElement = document.getElementById('userProfile');
    if (profileElement) {
      profileElement.innerHTML = `
        <h3>Welcome, ${profile.display_name || profile.email}</h3>
        <p>Email: ${profile.email}</p>
        <p>Member since: ${new Date(profile.created_at).toLocaleDateString()}</p>
      `;
    }
  }

  updateBalanceDisplay(balance) {
    const balanceElement = document.getElementById('userBalance');
    if (balanceElement) {
      balanceElement.innerHTML = `
        <h3>Your RSC Balance</h3>
        <div class="balance-amount">${this.formatTokens(balance.rsc_available)} RSC</div>
        <p>Available: ${this.formatTokens(balance.rsc_available)}</p>
        <p>Locked: ${this.formatTokens(balance.rsc_locked)}</p>
        <p>Last updated: ${new Date(balance.updated_at).toLocaleString()}</p>
      `;
    }
  }

  updateSessionsDisplay(sessions) {
    const sessionsElement = document.getElementById('miningSessions');
    if (sessionsElement) {
      if (sessions.length === 0) {
        sessionsElement.innerHTML = '<p>No mining sessions yet</p>';
        return;
      }

      const sessionsHtml = sessions.map(session => `
        <div class="session-item">
          <div class="session-header">
            <span class="session-status ${session.status}">${session.status}</span>
            <span class="session-date">${new Date(session.created_at).toLocaleDateString()}</span>
          </div>
          <div class="session-details">
            <p>Duration: ${this.formatTime(session.total_seconds)}</p>
            <p>Tokens earned: ${this.formatTokens(session.tokens_earned)} RSC</p>
            <p>Device: ${session.device_fingerprint || 'Unknown'}</p>
          </div>
        </div>
      `).join('');

      sessionsElement.innerHTML = sessionsHtml;
    }
  }

  showAuthenticatedUI() {
    const loginSection = document.getElementById('loginSection');
    const miningSection = document.getElementById('miningSection');
    const profileSection = document.getElementById('profileSection');
    
    if (loginSection) loginSection.style.display = 'none';
    if (miningSection) miningSection.style.display = 'block';
    if (profileSection) profileSection.style.display = 'block';
  }

  showLoginUI() {
    const loginSection = document.getElementById('loginSection');
    const miningSection = document.getElementById('miningSection');
    const profileSection = document.getElementById('profileSection');
    
    if (loginSection) loginSection.style.display = 'block';
    if (miningSection) miningSection.style.display = 'none';
    if (profileSection) profileSection.style.display = 'none';
    
    // Stop any active mining
    this.stopMining();
  }

  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 5000);
  }

  formatTokens(amount) {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 8,
      maximumFractionDigits: 8
    }).format(amount || 0);
  }

  formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  }

  // Get current mining status
  getMiningStatus() {
    return {
      isMining: this.isMining,
      sessionId: this.currentSession,
      stats: this.sessionStats
    };
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.rscMiningSystem = new RSCMiningSystem();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = RSCMiningSystem;
}
