/* ===== RSC CHAIN ULTRA NAVBAR MANAGER - NEXT LEVEL ===== */

class RSCNavbarManager {
    constructor() {
        this.isMobileMenuOpen = false;
        this.currentLanguage = 'en';
        this.mouseX = 0;
        this.mouseY = 0;
        this.priceData = {
            value: 0.00,
            change: 0.00,
            changePercent: 0.00
        };
        this.networkData = {
            tps: 0,
            nodes: 0,
            blocks: 0
        };
        this.isWalletConnected = false;
        this.updateInterval = null;
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.setupMouseTracking();
        this.setupLiveData();
        this.setupLanguageSystem();
        this.setupWalletIntegration();
        this.setupMobileMenu();
        this.startDataUpdates();
        this.setupScrollEffects();
        this.setupKeyboardNavigation();
        
        console.log('🚀 RSC Ultra Navbar Manager initialized');
    }
    
    // ===== MOUSE TRACKING FOR LIGHT EFFECTS =====
    setupMouseTracking() {
        const navbar = document.querySelector('.navbar');
        if (!navbar) return;
        
        navbar.addEventListener('mousemove', (e) => {
            const rect = navbar.getBoundingClientRect();
            this.mouseX = ((e.clientX - rect.left) / rect.width) * 100;
            this.mouseY = ((e.clientY - rect.top) / rect.height) * 100;
            
            navbar.style.setProperty('--mouse-x', `${this.mouseX}%`);
            navbar.style.setProperty('--mouse-y', `${this.mouseY}%`);
        });
        
        navbar.addEventListener('mouseleave', () => {
            navbar.style.setProperty('--mouse-x', '50%');
            navbar.style.setProperty('--mouse-y', '50%');
        });
    }
    
    // ===== LIVE DATA SYSTEM =====
    setupLiveData() {
        this.updateLiveData();
    }
    
    async updateLiveData() {
        try {
            // Simulate API calls for real data
            await this.fetchPriceData();
            await this.fetchNetworkData();
            this.renderLiveData();
        } catch (error) {
            console.warn('Failed to fetch live data:', error);
            this.updateLiveDataFallback();
        }
    }
    
    async fetchPriceData() {
        // Simulate price API call
        const mockPrice = 0.00 + (Math.random() - 0.5) * 0.1;
        const mockChange = (Math.random() - 0.5) * 0.05;
        
        this.priceData = {
            value: Math.max(0, mockPrice),
            change: mockChange,
            changePercent: mockPrice > 0 ? (mockChange / mockPrice) * 100 : 0
        };
    }
    
    async fetchNetworkData() {
        // Simulate network metrics API call
        this.networkData = {
            tps: Math.floor(Math.random() * 1000) + 500,
            nodes: Math.floor(Math.random() * 100) + 50,
            blocks: Math.floor(Math.random() * 10000) + 100000
        };
    }
    
    updateLiveDataFallback() {
        // Fallback data when APIs fail
        this.priceData = {
            value: 0.00,
            change: 0.00,
            changePercent: 0.00
        };
        this.networkData = {
            tps: 0,
            nodes: 0,
            blocks: 0
        };
    }
    
    renderLiveData() {
        // Update price ticker
        const priceValue = document.querySelector('.price-value');
        const priceChange = document.querySelector('.price-change');
        
        if (priceValue) {
            priceValue.textContent = `RSC $${this.priceData.value.toFixed(4)}`;
        }
        
        if (priceChange) {
            const isPositive = this.priceData.change >= 0;
            priceChange.textContent = `${isPositive ? '+' : ''}${this.priceData.changePercent.toFixed(2)}%`;
            priceChange.className = `price-change ${isPositive ? 'positive' : 'negative'}`;
        }
        
        // Update network metrics
        const metricValues = document.querySelectorAll('.metric-value');
        if (metricValues.length >= 3) {
            metricValues[0].textContent = this.networkData.tps.toLocaleString();
            metricValues[1].textContent = this.networkData.nodes.toLocaleString();
            metricValues[2].textContent = this.networkData.blocks.toLocaleString();
        }
    }
    
    startDataUpdates() {
        // Update data every 3 seconds
        this.updateInterval = setInterval(() => {
            this.updateLiveData();
        }, 3000);
    }
    
    // ===== LANGUAGE SYSTEM =====
    setupLanguageSystem() {
        this.loadLanguage();
    }
    
    setLanguage(lang) {
        this.currentLanguage = lang;
        localStorage.setItem('rsc-language', lang);
        
        const toggle = document.getElementById('languageToggle');
        const options = document.querySelectorAll('.language-option');
        
        // Update toggle text
        const selectedOption = Array.from(options).find(opt => opt.dataset.lang === lang);
        if (selectedOption) {
            const flag = selectedOption.querySelector('.language-flag').textContent;
            const text = selectedOption.querySelector('span:last-child').textContent;
            toggle.innerHTML = `
                <span class="language-flag">${flag}</span>
                <span class="language-text">${text}</span>
                <i class="fas fa-chevron-down"></i>
            `;
        }
        
        // Update active option
        options.forEach(opt => {
            opt.classList.toggle('active', opt.dataset.lang === lang);
        });
        
        // Dispatch language change event
        window.dispatchEvent(new CustomEvent('languageChanged', { 
            detail: { language: lang } 
        }));
        
        console.log(`🌐 Language changed to: ${lang}`);
    }
    
    loadLanguage() {
        const savedLang = localStorage.getItem('rsc-language') || 'en';
        this.setLanguage(savedLang);
    }
    
    // ===== WALLET INTEGRATION =====
    setupWalletIntegration() {
        const walletBtn = document.getElementById('walletConnect3D');
        if (walletBtn) {
            walletBtn.addEventListener('click', () => {
                this.handleWalletConnect();
            });
        }
    }
    
    async handleWalletConnect() {
        const walletBtn = document.getElementById('walletConnect3D');
        if (!walletBtn) return;
        
        if (this.isWalletConnected) {
            this.handleWalletDisconnect();
            return;
        }
        
        // Add loading state
        walletBtn.classList.add('loading');
        walletBtn.innerHTML = `
            <i class="fas fa-spinner fa-spin wallet-icon"></i>
            <span>Connecting...</span>
        `;
        
        try {
            // Check if MetaMask is available
            if (typeof window.ethereum !== 'undefined') {
                await this.connectMetaMask();
            } else {
                await this.connectWalletConnect();
            }
            
            this.isWalletConnected = true;
            walletBtn.innerHTML = `
                <i class="fas fa-check-circle wallet-icon"></i>
                <span>Connected</span>
            `;
            
            // Show success animation
            walletBtn.style.animation = 'wallet-glow 0.6s ease-in-out';
            setTimeout(() => {
                walletBtn.style.animation = '';
            }, 600);
            
            console.log('🔗 Wallet connected successfully');
        } catch (error) {
            console.error('Wallet connection failed:', error);
            walletBtn.innerHTML = `
                <i class="fas fa-exclamation-triangle wallet-icon"></i>
                <span>Failed</span>
            `;
            
            setTimeout(() => {
                walletBtn.innerHTML = `
                    <i class="fas fa-wallet wallet-icon"></i>
                    <span>Connect Wallet</span>
                `;
                walletBtn.classList.remove('loading');
            }, 2000);
        }
    }
    
    async connectMetaMask() {
        const accounts = await window.ethereum.request({
            method: 'eth_requestAccounts'
        });
        return accounts[0];
    }
    
    async connectWalletConnect() {
        // Simulate WalletConnect connection
        await new Promise(resolve => setTimeout(resolve, 2000));
        return '0x1234...5678';
    }
    
    handleWalletDisconnect() {
        this.isWalletConnected = false;
        const walletBtn = document.getElementById('walletConnect3D');
        if (walletBtn) {
            walletBtn.innerHTML = `
                <i class="fas fa-wallet wallet-icon"></i>
                <span>Connect Wallet</span>
            `;
            walletBtn.classList.remove('loading');
        }
        console.log('🔗 Wallet disconnected');
    }
    
    // ===== MOBILE MENU =====
    setupMobileMenu() {
        const mobileToggle = document.getElementById('mobileMenuBtn');
        if (mobileToggle) {
            mobileToggle.addEventListener('click', () => this.toggleMobileMenu());
        }
    }
    
    toggleMobileMenu() {
        this.isMobileMenuOpen = !this.isMobileMenuOpen;
        const toggle = document.getElementById('mobileMenuBtn');
        
        if (toggle) {
            toggle.classList.toggle('active', this.isMobileMenuOpen);
        }
        
        // Trigger mobile menu toggle event
        window.dispatchEvent(new CustomEvent('mobileMenuToggle', { 
            detail: { isOpen: this.isMobileMenuOpen } 
        }));
        
        console.log(`📱 Mobile menu ${this.isMobileMenuOpen ? 'opened' : 'closed'}`);
    }
    
    // ===== SCROLL EFFECTS =====
    setupScrollEffects() {
        let lastScrollY = window.scrollY;
        let ticking = false;
        
        const updateNavbar = () => {
            const navbar = document.querySelector('.navbar');
            const indicatorsBar = document.querySelector('.live-indicators-bar');
            const scrollY = window.scrollY;
            
            if (navbar) {
                if (scrollY > 100) {
                    navbar.style.background = 'rgba(0, 0, 0, 0.98)';
                    navbar.style.backdropFilter = 'blur(30px)';
                    navbar.style.borderRadius = '0';
                } else {
                    navbar.style.background = 'linear-gradient(135deg, rgba(0, 0, 0, 0.95) 0%, rgba(10, 10, 20, 0.9) 50%, rgba(0, 0, 0, 0.95) 100%)';
                    navbar.style.backdropFilter = 'blur(32px)';
                    navbar.style.borderRadius = '0 0 1.5rem 1.5rem';
                }
            }
            
            if (indicatorsBar) {
                if (scrollY > 50) {
                    indicatorsBar.style.transform = 'translateY(-100%)';
                } else {
                    indicatorsBar.style.transform = 'translateY(0)';
                }
            }
            
            lastScrollY = scrollY;
            ticking = false;
        };
        
        const requestTick = () => {
            if (!ticking) {
                requestAnimationFrame(updateNavbar);
                ticking = true;
            }
        };
        
        window.addEventListener('scroll', requestTick);
    }
    
    // ===== KEYBOARD NAVIGATION =====
    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            // ESC key closes dropdowns
            if (e.key === 'Escape') {
                this.closeAllDropdowns();
            }
            
            // Alt + L opens language selector
            if (e.altKey && e.key === 'l') {
                e.preventDefault();
                this.toggleLanguageDropdown();
            }
            
            // Alt + W opens wallet connection
            if (e.altKey && e.key === 'w') {
                e.preventDefault();
                this.handleWalletConnect();
            }
        });
    }
    
    closeAllDropdowns() {
        const dropdowns = document.querySelectorAll('.language-dropdown, .dropdown-menu');
        dropdowns.forEach(dropdown => {
            dropdown.classList.remove('active');
        });
    }
    
    toggleLanguageDropdown() {
        const dropdown = document.getElementById('languageDropdown');
        if (dropdown) {
            dropdown.classList.toggle('active');
        }
    }
    
    // ===== EVENT LISTENERS =====
    setupEventListeners() {
        // Language selector
        const languageToggle = document.getElementById('languageToggle');
        const languageDropdown = document.getElementById('languageDropdown');
        
        if (languageToggle && languageDropdown) {
            languageToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                languageDropdown.classList.toggle('active');
            });
            
            // Close dropdown when clicking outside
            document.addEventListener('click', (e) => {
                if (!languageToggle.contains(e.target) && !languageDropdown.contains(e.target)) {
                    languageDropdown.classList.remove('active');
                }
            });
        }
        
        // Language options
        const languageOptions = document.querySelectorAll('.language-option');
        languageOptions.forEach(option => {
            option.addEventListener('click', () => {
                const lang = option.dataset.lang;
                this.setLanguage(lang);
                languageDropdown.classList.remove('active');
            });
        });
        
        // Resize handler
        window.addEventListener('resize', this.debounce(() => {
            this.handleResize();
        }, 250));
        
        // Page visibility change
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pauseUpdates();
            } else {
                this.resumeUpdates();
            }
        });
    }
    
    // ===== RESIZE HANDLER =====
    handleResize() {
        // Close mobile menu on resize to desktop
        if (window.innerWidth > 768 && this.isMobileMenuOpen) {
            this.isMobileMenuOpen = false;
            const toggle = document.getElementById('mobileMenuBtn');
            if (toggle) {
                toggle.classList.remove('active');
            }
        }
        
        // Close dropdowns on mobile
        if (window.innerWidth <= 768) {
            this.closeAllDropdowns();
        }
    }
    
    // ===== UPDATE MANAGEMENT =====
    pauseUpdates() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
    }
    
    resumeUpdates() {
        if (!this.updateInterval) {
            this.startDataUpdates();
        }
    }
    
    // ===== UTILITY FUNCTIONS =====
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        }
    }
    
    // ===== DESTROY =====
    destroy() {
        // Remove event listeners
        window.removeEventListener('scroll', this.handleScroll);
        window.removeEventListener('resize', this.handleResize);
        
        // Clear intervals
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
        
        console.log('✅ RSC Ultra Navbar Manager destroyed');
    }
}

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    // Create global instance
    window.rscNavbar = new RSCNavbarManager();
    
    // Expose class for global use
    window.RSCNavbarManager = RSCNavbarManager;
    
    console.log('🚀 RSC Ultra Navbar Manager loaded successfully');
});

// Handle page visibility changes for performance
document.addEventListener('visibilitychange', () => {
    if (document.hidden && window.rscNavbar?.isMobileMenuOpen) {
        window.rscNavbar.isMobileMenuOpen = false;
        const toggle = document.getElementById('mobileMenuBtn');
        if (toggle) {
            toggle.classList.remove('active');
        }
    }
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RSCNavbarManager;
}

