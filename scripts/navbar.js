/* ===== RESPONSIVE NAVBAR FUNCTIONALITY ===== */

class NavbarManager {
    constructor() {
        this.isMobileMenuOpen = false;
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.setupMobileMenu();
        this.handleResize();
    }
    
    setupEventListeners() {
        // Mobile menu toggle
        const navbarToggle = document.getElementById('navbarToggle');
        if (navbarToggle) {
            navbarToggle.addEventListener('click', () => this.toggleMobileMenu());
        }
        
        // Mobile menu overlay
        const mobileMenuOverlay = document.getElementById('mobileMenuOverlay');
        if (mobileMenuOverlay) {
            mobileMenuOverlay.addEventListener('click', () => this.closeMobileMenu());
        }
        
        // Handle window resize
        window.addEventListener('resize', () => this.handleResize());
        
        // Close mobile menu when clicking on links
        const mobileMenuLinks = document.querySelectorAll('.mobile-menu-links a');
        mobileMenuLinks.forEach(link => {
            link.addEventListener('click', () => this.closeMobileMenu());
        });
        
        // Close mobile menu when clicking on action buttons
        const mobileMenuActions = document.querySelectorAll('.mobile-menu-actions a');
        mobileMenuActions.forEach(action => {
            action.addEventListener('click', () => this.closeMobileMenu());
        });
        
        // Handle escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isMobileMenuOpen) {
                this.closeMobileMenu();
            }
        });
    }
    
    setupMobileMenu() {
        // Sync mobile wallet button with main wallet button
        const mainWalletBtn = document.getElementById('walletConnectBtn');
        const mobileWalletBtn = document.getElementById('mobileWalletConnectBtn');
        
        if (mainWalletBtn && mobileWalletBtn) {
            // Clone the main wallet button functionality
            mobileWalletBtn.addEventListener('click', (e) => {
                e.preventDefault();
                // Trigger the same action as the main wallet button
                if (window.walletAuthManager) {
                    window.walletAuthManager.showAuthModal();
                }
            });
        }
    }
    
    toggleMobileMenu() {
        if (this.isMobileMenuOpen) {
            this.closeMobileMenu();
        } else {
            this.openMobileMenu();
        }
    }
    
    openMobileMenu() {
        const mobileMenu = document.getElementById('mobileMenu');
        const mobileMenuOverlay = document.getElementById('mobileMenuOverlay');
        const navbarToggle = document.getElementById('navbarToggle');
        
        console.log('Opening mobile menu...', { mobileMenu, mobileMenuOverlay, navbarToggle });
        
        if (mobileMenu && mobileMenuOverlay && navbarToggle) {
            this.isMobileMenuOpen = true;
            
            // Show mobile menu
            mobileMenu.classList.add('active');
            mobileMenuOverlay.classList.add('active');
            
            // Update toggle button
            navbarToggle.innerHTML = '<span>✕</span>';
            navbarToggle.setAttribute('aria-expanded', 'true');
            
            // Prevent body scroll
            document.body.style.overflow = 'hidden';
            
            // Add active class to navbar
            document.querySelector('.navbar').classList.add('mobile-menu-open');
            
            console.log('Mobile menu opened successfully');
            console.log('Mobile menu classes:', mobileMenu.className);
            console.log('Mobile menu style:', mobileMenu.style.cssText);
        } else {
            console.error('Some elements not found for mobile menu');
        }
    }
    
    closeMobileMenu() {
        const mobileMenu = document.getElementById('mobileMenu');
        const mobileMenuOverlay = document.getElementById('mobileMenuOverlay');
        const navbarToggle = document.getElementById('navbarToggle');
        
        if (mobileMenu && mobileMenuOverlay && navbarToggle) {
            this.isMobileMenuOpen = false;
            
            // Hide mobile menu
            mobileMenu.classList.remove('active');
            mobileMenuOverlay.classList.remove('active');
            
            // Update toggle button
            navbarToggle.innerHTML = '<span>☰</span>';
            navbarToggle.setAttribute('aria-expanded', 'false');
            
            // Restore body scroll
            document.body.style.overflow = 'auto';
            
            // Remove active class from navbar
            document.querySelector('.navbar').classList.remove('mobile-menu-open');
        }
    }
    
    handleResize() {
        // Close mobile menu on resize if screen becomes larger
        if (window.innerWidth > 992 && this.isMobileMenuOpen) {
            this.closeMobileMenu();
        }
    }
    
    // Update active navigation link
    updateActiveLink() {
        const currentPath = window.location.pathname;
        const allNavLinks = document.querySelectorAll('.navbar-links a, .mobile-menu-links a');
        
        allNavLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === currentPath || 
                (currentPath === '/' && link.getAttribute('href') === 'index.html')) {
                link.classList.add('active');
            }
        });
    }
    
    // Update wallet button state
    updateWalletButtonState(isAuthenticated, username) {
        const mainWalletBtn = document.getElementById('walletConnectBtn');
        const mobileWalletBtn = document.getElementById('mobileWalletConnectBtn');
        
        if (isAuthenticated) {
            const walletText = username || 'Connected';
            
            if (mainWalletBtn) {
                mainWalletBtn.innerHTML = `
                    <span class="wallet-icon">🔒</span>
                    <span class="wallet-text">${walletText}</span>
                `;
                mainWalletBtn.href = 'pages/wallet.html';
                mainWalletBtn.classList.add('authenticated');
            }
            
            if (mobileWalletBtn) {
                mobileWalletBtn.innerHTML = `
                    <span class="wallet-icon">🔒</span>
                    <span class="wallet-text">${walletText}</span>
                `;
                mobileWalletBtn.href = 'pages/wallet.html';
                mobileWalletBtn.classList.add('authenticated');
            }
        } else {
            if (mainWalletBtn) {
                mainWalletBtn.innerHTML = `
                    <span class="wallet-icon">🔒</span>
                    <span class="wallet-text">Connect Wallet</span>
                `;
                mainWalletBtn.href = '#';
                mainWalletBtn.classList.remove('authenticated');
            }
            
            if (mobileWalletBtn) {
                mobileWalletBtn.innerHTML = `
                    <span class="wallet-icon">🔒</span>
                    <span class="wallet-text">Connect Wallet</span>
                `;
                mobileWalletBtn.href = '#';
                mobileWalletBtn.classList.remove('authenticated');
            }
        }
    }
}

// Initialize navbar when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.navbarManager = new NavbarManager();
    
    // Update active link
    if (window.navbarManager) {
        window.navbarManager.updateActiveLink();
    }
    
    // Force a resize event to trigger responsive layout
    window.dispatchEvent(new Event('resize'));
});

// Export for use in other modules
window.NavbarManager = NavbarManager;
