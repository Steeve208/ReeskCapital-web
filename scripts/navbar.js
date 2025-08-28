/* ===== MODERN NAVBAR FUNCTIONALITY ===== */

class ModernNavbarManager {
    constructor() {
        this.isMobileMenuOpen = false;
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.setupMobileMenu();
        this.handleResize();
        this.setupThemeToggle();
        this.setupLanguageToggle();
    }
    
    setupEventListeners() {
        // Hamburger menu toggle
        const hamburgerMenu = document.getElementById('hamburgerMenu');
        if (hamburgerMenu) {
            hamburgerMenu.addEventListener('click', () => this.toggleMobileMenu());
        }
        
        // Close menu button
        const closeMenu = document.getElementById('closeMenu');
        if (closeMenu) {
            closeMenu.addEventListener('click', () => this.closeMobileMenu());
        }
        
        // Mobile menu overlay
        const mobileMenuOverlay = document.getElementById('mobileMenuOverlay');
        if (mobileMenuOverlay) {
            mobileMenuOverlay.addEventListener('click', () => this.closeMobileMenu());
        }
        
        // Handle window resize
        window.addEventListener('resize', () => this.handleResize());
        
        // Close mobile menu when clicking on links
        const menuLinks = document.querySelectorAll('.menu-link');
        menuLinks.forEach(link => {
            link.addEventListener('click', () => this.closeMobileMenu());
        });
        
        // Close mobile menu when clicking on action buttons
        const menuActions = document.querySelectorAll('.menu-action');
        menuActions.forEach(action => {
            if (!action.classList.contains('theme-toggle') && !action.classList.contains('language-toggle')) {
                action.addEventListener('click', () => this.closeMobileMenu());
            }
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
    
    setupThemeToggle() {
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.toggleTheme());
        }
    }
    
    setupLanguageToggle() {
        const languageToggle = document.getElementById('languageToggle');
        if (languageToggle) {
            languageToggle.addEventListener('click', () => this.toggleLanguage());
        }
    }
    
    toggleTheme() {
        const body = document.body;
        const themeToggle = document.getElementById('themeToggle');
        
        if (body.classList.contains('dark-theme')) {
            body.classList.remove('dark-theme');
            body.classList.add('light-theme');
            if (themeToggle) {
                themeToggle.innerHTML = `
                    <span class="action-icon">☀️</span>
                    <span>Light Mode</span>
                `;
            }
            localStorage.setItem('theme', 'light');
        } else {
            body.classList.remove('light-theme');
            body.classList.add('dark-theme');
            if (themeToggle) {
                themeToggle.innerHTML = `
                    <span class="action-icon">🌙</span>
                    <span>Dark Mode</span>
                `;
            }
            localStorage.setItem('theme', 'dark');
        }
    }
    
    toggleLanguage() {
        const languageToggle = document.getElementById('languageToggle');
        const currentLang = languageToggle.querySelector('span:last-child').textContent;
        
        if (currentLang === 'English') {
            languageToggle.innerHTML = `
                <span class="action-icon">🇪🇸</span>
                <span>Español</span>
            `;
            localStorage.setItem('language', 'es');
        } else {
            languageToggle.innerHTML = `
                <span class="action-icon">🌐</span>
                <span>English</span>
            `;
            localStorage.setItem('language', 'en');
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
        const hamburgerMenu = document.getElementById('hamburgerMenu');
        
        if (mobileMenu && mobileMenuOverlay && hamburgerMenu) {
            this.isMobileMenuOpen = true;
            
            // Show mobile menu
            mobileMenu.classList.add('active');
            mobileMenuOverlay.classList.add('active');
            
            // Update hamburger menu
            hamburgerMenu.classList.add('active');
            
            // Prevent body scroll
            document.body.style.overflow = 'hidden';
            
            // Add active class to navbar
            document.querySelector('.navbar').classList.add('mobile-menu-open');
            
            console.log('Mobile menu opened successfully');
        } else {
            console.error('Some elements not found for mobile menu');
        }
    }
    
    closeMobileMenu() {
        const mobileMenu = document.getElementById('mobileMenu');
        const mobileMenuOverlay = document.getElementById('mobileMenuOverlay');
        const hamburgerMenu = document.getElementById('hamburgerMenu');
        
        if (mobileMenu && mobileMenuOverlay && hamburgerMenu) {
            this.isMobileMenuOpen = false;
            
            // Hide mobile menu
            mobileMenu.classList.remove('active');
            mobileMenuOverlay.classList.remove('active');
            
            // Update hamburger menu
            hamburgerMenu.classList.remove('active');
            
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
        const allMenuLinks = document.querySelectorAll('.menu-link');
        
        allMenuLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === currentPath || 
                (currentPath === '/' && link.getAttribute('href') === 'index.html')) {
                link.classList.add('active');
            }
        });
    }
    
    // Update wallet button state
    updateWalletButtonState(isAuthenticated, username) {
        const mobileWalletBtn = document.getElementById('mobileWalletConnectBtn');
        
        if (isAuthenticated) {
            const walletText = username || 'Connected';
            
            if (mobileWalletBtn) {
                mobileWalletBtn.innerHTML = `
                    <span class="action-icon">🔒</span>
                    <span>${walletText}</span>
                `;
                mobileWalletBtn.href = 'pages/wallet.html';
                mobileWalletBtn.classList.add('authenticated');
            }
        } else {
            if (mobileWalletBtn) {
                mobileWalletBtn.innerHTML = `
                    <span class="action-icon">🔒</span>
                    <span>Connect Wallet</span>
                `;
                mobileWalletBtn.href = '#';
                mobileWalletBtn.classList.remove('authenticated');
            }
        }
    }
    
    // Load saved preferences
    loadPreferences() {
        // Load theme
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            document.body.classList.add(`${savedTheme}-theme`);
            const themeToggle = document.getElementById('themeToggle');
            if (themeToggle && savedTheme === 'light') {
                themeToggle.innerHTML = `
                    <span class="action-icon">☀️</span>
                    <span>Light Mode</span>
                `;
            }
        }
        
        // Load language
        const savedLanguage = localStorage.getItem('language');
        if (savedLanguage === 'es') {
            const languageToggle = document.getElementById('languageToggle');
            if (languageToggle) {
                languageToggle.innerHTML = `
                    <span class="action-icon">🇪🇸</span>
                    <span>Español</span>
                `;
            }
        }
    }
}

// Initialize navbar when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.navbarManager = new ModernNavbarManager();
    
    // Load saved preferences
    if (window.navbarManager) {
        window.navbarManager.loadPreferences();
        window.navbarManager.updateActiveLink();
    }
    
    // Force a resize event to trigger responsive layout
    window.dispatchEvent(new Event('resize'));
});

// Export for use in other modules
window.ModernNavbarManager = ModernNavbarManager;
