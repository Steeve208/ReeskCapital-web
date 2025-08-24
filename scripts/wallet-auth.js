/* ===== WALLET AUTHENTICATION SYSTEM ===== */

class WalletAuthManager {
    constructor() {
        this.isAuthenticated = false;
        this.currentUser = null;
        this.walletData = null;
        this.init();
    }
    
    init() {
        this.checkAuthStatus();
        this.setupEventListeners();
        this.updateUI();
    }
    
    checkAuthStatus() {
        // Check if user is already authenticated
        const token = localStorage.getItem('rsc-auth-token');
        const userData = localStorage.getItem('rsc-user-data');
        
        if (token && userData) {
            try {
                this.currentUser = JSON.parse(userData);
                this.isAuthenticated = true;
                this.loadWalletData();
            } catch (error) {
                console.error('Invalid stored auth data:', error);
                this.logout();
            }
        }
    }
    
    setupEventListeners() {
        // Use event delegation for better performance
        document.addEventListener('click', (e) => {
            // Wallet connect button
            if (e.target.matches('#walletConnectBtn') || e.target.closest('#walletConnectBtn')) {
                e.preventDefault();
                this.showAuthModal();
            }
            
            // Auth modal events
            if (e.target.matches('.auth-modal-close, .auth-modal-overlay')) {
                this.hideAuthModal();
            }
            
            if (e.target.matches('.login-btn')) {
                this.handleLogin();
            }
            
            if (e.target.matches('.register-btn')) {
                this.handleRegister();
            }
            
            if (e.target.matches('.logout-btn')) {
                this.logout();
            }
        });
        
        // Form submissions
        document.addEventListener('submit', (e) => {
            if (e.target.matches('#loginForm')) {
                e.preventDefault();
                this.handleLogin();
            }
            
            if (e.target.matches('#registerForm')) {
                e.preventDefault();
                this.handleRegister();
            }
        });
    }
    
    showAuthModal() {
        // Create auth modal if it doesn't exist
        if (!document.getElementById('authModal')) {
            this.createAuthModal();
        }
        
        const modal = document.getElementById('authModal');
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
    
    hideAuthModal() {
        const modal = document.getElementById('authModal');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    }
    
    createAuthModal() {
        const modalHTML = `
            <div class="auth-modal-overlay" id="authModal">
                <div class="auth-modal">
                    <div class="auth-modal-header">
                        <h2>Connect to RSC Chain</h2>
                        <button class="auth-modal-close">&times;</button>
                    </div>
                    
                    <div class="auth-modal-tabs">
                        <button class="tab-btn active" data-tab="login">Login</button>
                        <button class="tab-btn" data-tab="register">Register</button>
                    </div>
                    
                    <div class="auth-modal-content">
                        <!-- Login Form -->
                        <form id="loginForm" class="auth-form active" data-form="login">
                            <div class="form-group">
                                <label for="loginEmail">Email</label>
                                <input type="email" id="loginEmail" name="email" required>
                            </div>
                            <div class="form-group">
                                <label for="loginPassword">Password</label>
                                <input type="password" id="loginPassword" name="password" required>
                            </div>
                            <button type="submit" class="login-btn">Login</button>
                        </form>
                        
                        <!-- Register Form -->
                        <form id="registerForm" class="auth-form" data-form="register">
                            <div class="form-group">
                                <label for="registerEmail">Email</label>
                                <input type="email" id="registerEmail" name="email" required>
                            </div>
                            <div class="form-group">
                                <label for="registerPassword">Password</label>
                                <input type="password" id="registerPassword" name="password" required>
                            </div>
                            <div class="form-group">
                                <label for="confirmPassword">Confirm Password</label>
                                <input type="password" id="confirmPassword" name="confirmPassword" required>
                            </div>
                            <button type="submit" class="register-btn">Register</button>
                        </form>
                    </div>
                    
                    <div class="auth-modal-footer">
                        <p>By connecting, you agree to our Terms of Service and Privacy Policy</p>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Setup tab switching with event delegation
        const modal = document.getElementById('authModal');
        modal.addEventListener('click', (e) => {
            if (e.target.matches('.tab-btn')) {
                const tab = e.target.dataset.tab;
                this.switchAuthTab(tab);
            }
        });
    }
    
    switchAuthTab(tab) {
        // Update active tab button
        document.querySelectorAll('.auth-modal-tabs .tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tab);
        });
        
        // Update active form
        document.querySelectorAll('.auth-form').forEach(form => {
            form.classList.toggle('active', form.dataset.form === tab);
        });
    }
    
    async handleLogin() {
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        if (!email || !password) {
            this.showNotification('error', 'Please fill in all fields');
            return;
        }
        
        try {
            // Simulate API call - replace with actual backend endpoint
            const response = await this.loginUser(email, password);
            
            if (response.success) {
                this.isAuthenticated = true;
                this.currentUser = response.user;
                this.saveAuthData(response.token, response.user);
                this.loadWalletData();
                this.hideAuthModal();
                this.updateUI();
                this.showNotification('success', 'Successfully logged in!');
            } else {
                this.showNotification('error', response.message || 'Login failed');
            }
        } catch (error) {
            console.error('Login error:', error);
            this.showNotification('error', 'Login failed. Please try again.');
        }
    }
    
    async handleRegister() {
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        if (!email || !password || !confirmPassword) {
            this.showNotification('error', 'Please fill in all fields');
            return;
        }
        
        if (password !== confirmPassword) {
            this.showNotification('error', 'Passwords do not match');
            return;
        }
        
        try {
            // Simulate API call - replace with actual backend endpoint
            const response = await this.registerUser(email, password);
            
            if (response.success) {
                this.showNotification('success', 'Registration successful! Please login.');
                this.switchAuthTab('login');
                // Clear register form
                document.getElementById('registerForm').reset();
            } else {
                this.showNotification('error', response.message || 'Registration failed');
            }
        } catch (error) {
            console.error('Registration error:', error);
            this.showNotification('error', 'Registration failed. Please try again.');
        }
    }
    
    async loginUser(email, password) {
        // Simulate API call - replace with actual backend endpoint
        // const response = await fetch('/api/auth/login', {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify({ email, password })
        // });
        // return response.json();
        
        // Mock response for now
        return new Promise((resolve) => {
            setTimeout(() => {
                if (email && password) {
                    resolve({
                        success: true,
                        user: {
                            id: 'user_' + Date.now(),
                            email: email,
                            username: email.split('@')[0]
                        },
                        token: 'mock_token_' + Date.now()
                    });
                } else {
                    resolve({
                        success: false,
                        message: 'Invalid credentials'
                    });
                }
            }, 500); // Reduced from 1000ms for better UX
        });
    }
    
    async registerUser(email, password) {
        // Simulate API call - replace with actual backend endpoint
        // const response = await fetch('/api/auth/register', {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify({ email, password })
        // });
        // return response.json();
        
        // Mock response for now
        return new Promise((resolve) => {
            setTimeout(() => {
                if (email && password) {
                    resolve({
                        success: true,
                        message: 'User registered successfully'
                    });
                } else {
                    resolve({
                        success: false,
                        message: 'Registration failed'
                    });
                }
            }, 500); // Reduced from 1000ms for better UX
        });
    }
    
    saveAuthData(token, user) {
        localStorage.setItem('rsc-auth-token', token);
        localStorage.setItem('rsc-user-data', JSON.stringify(user));
    }
    
    async loadWalletData() {
        if (!this.isAuthenticated) return;
        
        try {
            // Simulate loading wallet data - replace with actual API call
            // const response = await fetch('/api/wallet/data', {
            //     headers: { 'Authorization': `Bearer ${localStorage.getItem('rsc-auth-token')}` }
            // });
            // this.walletData = await response.json();
            
            // Mock wallet data
            this.walletData = {
                address: '0x' + Math.random().toString(16).substr(2, 40),
                balance: Math.random() * 1000,
                transactions: [],
                miningStats: {
                    totalMined: Math.random() * 100,
                    currentHashrate: Math.random() * 1000
                }
            };
            
            this.updateWalletUI();
        } catch (error) {
            console.error('Failed to load wallet data:', error);
        }
    }
    
    updateUI() {
        // Update both main and mobile wallet buttons
        if (window.navbarManager) {
            window.navbarManager.updateWalletButtonState(
                this.isAuthenticated, 
                this.currentUser?.username
            );
        } else {
            // Fallback if navbar manager is not available
            const walletConnectBtn = document.getElementById('walletConnectBtn');
            if (walletConnectBtn) {
                if (this.isAuthenticated) {
                    walletConnectBtn.innerHTML = `
                        <span class="wallet-icon">🔒</span>
                        <span class="wallet-text">${this.currentUser.username}</span>
                    `;
                    walletConnectBtn.href = 'pages/wallet.html';
                    walletConnectBtn.classList.add('authenticated');
                } else {
                    walletConnectBtn.innerHTML = `
                        <span class="wallet-icon">🔒</span>
                        <span class="wallet-text">Connect Wallet</span>
                    `;
                    walletConnectBtn.href = '#';
                    walletConnectBtn.classList.remove('authenticated');
                }
            }
        }
    }
    
    updateWalletUI() {
        // Update wallet display if on wallet page
        if (window.location.pathname.includes('wallet.html') && this.walletData) {
            this.displayWalletInfo();
        }
    }
    
    displayWalletInfo() {
        const walletContainer = document.getElementById('walletInfo');
        if (walletContainer && this.walletData) {
            walletContainer.innerHTML = `
                <div class="wallet-header">
                    <h2>Welcome, ${this.currentUser.username}!</h2>
                    <button class="logout-btn">Logout</button>
                </div>
                
                <div class="wallet-overview">
                    <div class="wallet-address">
                        <label>Wallet Address:</label>
                        <div class="address-display">
                            <span>${this.walletData.address}</span>
                            <button class="copy-btn" data-text="${this.walletData.address}">Copy</button>
                        </div>
                    </div>
                    
                    <div class="wallet-balance">
                        <label>Balance:</label>
                        <span class="balance-amount">${this.walletData.balance.toFixed(4)} RSC</span>
                    </div>
                </div>
                
                <div class="mining-stats">
                    <h3>Mining Statistics</h3>
                    <div class="stats-grid">
                        <div class="stat-item">
                            <span class="stat-label">Total Mined:</span>
                            <span class="stat-value">${this.walletData.miningStats.totalMined.toFixed(2)} RSC</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Current Hashrate:</span>
                            <span class="stat-value">${this.walletData.miningStats.currentHashrate.toFixed(2)} H/s</span>
                        </div>
                    </div>
                </div>
            `;
        }
    }
    
    logout() {
        this.isAuthenticated = false;
        this.currentUser = null;
        this.walletData = null;
        
        localStorage.removeItem('rsc-auth-token');
        localStorage.removeItem('rsc-user-data');
        
        this.updateUI();
        
        // Redirect to home if on wallet page
        if (window.location.pathname.includes('wallet.html')) {
            window.location.href = '../index.html';
        }
        
        this.showNotification('info', 'Logged out successfully');
    }
    
    showNotification(type, message) {
        // Use existing notification system if available
        if (window.showNotification) {
            window.showNotification(type, 'Wallet Auth', message);
        } else {
            console.log(`${type.toUpperCase()}: ${message}`);
        }
    }
}

// Initialize wallet auth when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.walletAuthManager = new WalletAuthManager();
});

// Export for use in other modules
window.WalletAuthManager = WalletAuthManager;
