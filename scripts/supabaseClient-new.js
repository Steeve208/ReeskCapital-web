/* ================================
   SUPABASE CLIENT - NEW ARCHITECTURE
================================ */

// Browser-compatible version for the new architecture
(function() {
  'use strict';

  // Supabase configuration
  const SUPABASE_CONFIG = {
    url: 'https://unevdceponbnmhvpzlzf.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVuZXZkY2Vwb25ibm1odnB6bHpmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU5MTIyMTksImV4cCI6MjA3MTQ4ODIxOX0.OLHbZrezgBiXWQplN1jrGD_xkARqzo05jE4'
  };

  // Check if Supabase is loaded
  if (typeof supabase === 'undefined') {
    console.warn('Supabase client not loaded. Please include the Supabase CDN script.');
    return;
  }

  // Create Supabase client
  const supabaseClient = supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);

  // Edge Functions URLs
  const EDGE_FUNCTIONS = {
    start_mining: 'https://unevdceponbnmhvpzlzf.supabase.co/functions/v1/start_mining',
    heartbeat: 'https://unevdceponbnmhvpzlzf.supabase.co/functions/v1/-heartbeat',
    stop_mining: 'https://unevdceponbnmhvpzlzf.supabase.co/functions/v1/stop_mining'
  };

  // Simple user management (local storage based)
  const UserManager = {
    currentUser: null,

    // Create a simple user session
    createUser(email, name) {
      try {
        console.log('UserManager.createUser called with:', { email, name });
        
        if (!email || !name) {
          throw new Error('Email and name are required');
        }
        
        const user = {
          id: 'user_' + Date.now(),
          email: email,
          name: name,
          created_at: new Date().toISOString()
        };
        
        console.log('User object created:', user);
        
        this.currentUser = user;
        localStorage.setItem('rsc_mining_user', JSON.stringify(user));
        
        console.log('User saved to localStorage and currentUser set');
        
        return user;
      } catch (error) {
        console.error('Error in UserManager.createUser:', error);
        throw error;
      }
    },

    // Get current user
    getCurrentUser() {
      try {
        if (!this.currentUser) {
          const stored = localStorage.getItem('rsc_mining_user');
          if (stored) {
            this.currentUser = JSON.parse(stored);
            console.log('User loaded from localStorage:', this.currentUser);
          }
        }
        return this.currentUser;
      } catch (error) {
        console.error('Error in UserManager.getCurrentUser:', error);
        return null;
      }
    },

    // Clear user session
    clearUser() {
      try {
        this.currentUser = null;
        localStorage.removeItem('rsc_mining_user');
        console.log('User session cleared');
      } catch (error) {
        console.error('Error in UserManager.clearUser:', error);
      }
    }
  };

  // New secure mining system using Edge Functions
  const SecureMiningSystem = {
    currentSession: null,
    isMining: false,
    heartbeatInterval: null,
    sessionStats: {
      totalSeconds: 0,
      tokensEarned: 0,
      startTime: null
    },

    // Start mining session using Edge Function
    async startMining() {
      try {
        const user = UserManager.getCurrentUser();
        if (!user) {
          throw new Error('No user session. Please login first.');
        }

        // Create a simple JWT-like token for the user
        const userToken = btoa(JSON.stringify({
          user_id: user.id,
          email: user.email,
          timestamp: Date.now()
        }));

        const response = await fetch(EDGE_FUNCTIONS.start_mining, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${userToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            user_email: user.email,
            user_name: user.name
          })
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to start mining');
        }

        const result = await response.json();
        this.currentSession = result.session_id;
        this.sessionStats.startTime = new Date(result.started_at);
        this.isMining = true;

        // Start heartbeat
        this.startHeartbeat();

        return result;
      } catch (error) {
        console.error('Error starting mining:', error);
        throw error;
      }
    },

    // Send heartbeat using Edge Function
    async sendHeartbeat() {
      if (!this.currentSession || !this.isMining) return;

      try {
        const user = UserManager.getCurrentUser();
        if (!user) return;

        const userToken = btoa(JSON.stringify({
          user_id: user.id,
          email: user.email,
          timestamp: Date.now()
        }));

        const response = await fetch(EDGE_FUNCTIONS.heartbeat, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${userToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ 
            session_id: this.currentSession,
            user_email: user.email
          })
        });

        if (response.ok) {
          const result = await response.json();
          this.sessionStats.totalSeconds = result.elapsed_seconds;
          this.sessionStats.tokensEarned = result.tokens_earned;
          
          // Update UI
          this.updateMiningDisplay();
        }
      } catch (error) {
        console.error('Error sending heartbeat:', error);
      }
    },

    // Stop mining using Edge Function
    async stopMining() {
      if (!this.currentSession) return;

      try {
        const user = UserManager.getCurrentUser();
        if (!user) return;

        const userToken = btoa(JSON.stringify({
          user_id: user.id,
          email: user.email,
          timestamp: Date.now()
        }));

        const response = await fetch(EDGE_FUNCTIONS.stop_mining, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${userToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ 
            session_id: this.currentSession,
            user_email: user.email
          })
        });

        if (response.ok) {
          const result = await response.json();
          this.sessionStats.totalSeconds = result.total_seconds;
          this.sessionStats.tokensEarned = result.total_tokens;
        }

        this.cleanup();
        return result;
      } catch (error) {
        console.error('Error stopping mining:', error);
        throw error;
      }
    },

    // Start heartbeat interval
    startHeartbeat() {
      this.heartbeatInterval = setInterval(() => {
        this.sendHeartbeat();
      }, 15000); // Every 15 seconds
    },

    // Cleanup mining session
    cleanup() {
      this.isMining = false;
      this.currentSession = null;
      if (this.heartbeatInterval) {
        clearInterval(this.heartbeatInterval);
        this.heartbeatInterval = null;
      }
      this.updateMiningDisplay();
    },

    // Update mining display
    updateMiningDisplay() {
      const display = document.getElementById('miningStats');
      if (display) {
        display.innerHTML = `
          <div class="stat">
            <span class="label">Session Time:</span>
            <span class="value">${this.formatTime(this.sessionStats.totalSeconds)}</span>
          </div>
          <div class="stat">
            <span class="label">Tokens Earned:</span>
            <span class="value">${this.formatNumber(this.sessionStats.tokensEarned)} RSC</span>
          </div>
        `;
      }
    },

    // Format time
    formatTime(seconds) {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const secs = seconds % 60;
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    },

    // Format number
    formatNumber(num) {
      return parseFloat(num).toFixed(6);
    },

    // Get current session info
    getCurrentSession() {
      return {
        sessionId: this.currentSession,
        isMining: this.isMining,
        stats: { ...this.sessionStats }
      };
    }
  };

  // Simple authentication helpers
  const AuthHelpers = {
    async signIn(email, name) {
      try {
        console.log('AuthHelpers.signIn called with:', { email, name });
        
        // Create user directly using UserManager
        const user = UserManager.createUser(email, name);
        
        console.log('User created successfully:', user);
        
        return { 
          data: { user }, 
          error: null 
        };
      } catch (error) {
        console.error('Error in AuthHelpers.signIn:', error);
        return { 
          data: null, 
          error: error 
        };
      }
    },

    async signOut() {
      try {
        UserManager.clearUser();
        return { error: null };
      } catch (error) {
        return { error };
      }
    },

    async getCurrentUser() {
      return UserManager.getCurrentUser();
    }
  };

  // Database helpers (read-only operations)
  const DatabaseHelpers = {
    async getMinerProfile(userId) {
      // This would normally query the database
      // For now, return mock data
      return { 
        data: { 
          id: userId, 
          email: 'user@example.com', 
          display_name: 'Miner' 
        }, 
        error: null 
      };
    },

    async getMiningHistory(userId) {
      // This would normally query the database
      // For now, return mock data
      return { 
        data: [], 
        error: null 
      };
    },

    async getBalance(userId) {
      // This would normally query the database
      // For now, return mock data
      return { 
        data: { 
          rsc_available: 0, 
          rsc_locked: 0 
        }, 
        error: null 
      };
    }
  };

  // Make everything globally available
  window.SupabaseClient = supabaseClient;
  window.SecureMiningSystem = SecureMiningSystem;
  window.AuthHelpers = AuthHelpers;
  window.DatabaseHelpers = DatabaseHelpers;
  window.UserManager = UserManager;

  console.log('✅ Secure Mining System loaded successfully!');
  console.log('🔐 Using Edge Functions for secure token calculations');
  console.log('📊 Available: SecureMiningSystem, AuthHelpers, DatabaseHelpers, UserManager');

})();
