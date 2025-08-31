/* ===== PROFESSIONAL NAVBAR FUNCTIONALITY - PRODUCTION READY ===== */

class ProfessionalNavbarManager {
    constructor() {
        this.isMobileMenuOpen = false;
        this.isAnimating = false;
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.init();
    }
    
    init() {
        // Asegurar que el menú móvil esté oculto al inicializar
        this.forceHideMobileMenu();
        
        this.setupEventListeners();
        this.setupMobileMenu();
        this.setupSearch();
        this.setupThemeToggle();
        this.setupWallet();
        this.setupNetworkSwitch();
        this.setupPerformanceMetrics();
        this.setupPriceTicker();
        this.setupEliteSearch();
        this.setupSystemControls();
        this.setupResponsiveHandling();
        this.setupAccessibility();
        this.setupAnimations();
        this.setupNotifications();
    }

    // ===== FORCE HIDE MOBILE MENU =====
    forceHideMobileMenu() {
        const mobileMenu = document.getElementById('mobileMenu');
        if (mobileMenu) {
            // Remover todas las clases que puedan estar activas
            mobileMenu.classList.remove('active', 'show', 'open');
            
            // Aplicar estilos inline para asegurar que esté oculto
            mobileMenu.style.right = '-100%';
            mobileMenu.style.visibility = 'hidden';
            mobileMenu.style.opacity = '0';
            mobileMenu.style.transform = 'translateX(100%)';
            mobileMenu.style.pointerEvents = 'none';
            
            // Asegurar que el body no tenga scroll bloqueado
            document.body.style.overflow = '';
            document.body.classList.remove('mobile-menu-open');
            
            // Resetear el estado
            this.isMobileMenuOpen = false;
        }
        
        // También ocultar el overlay si existe
        const mobileMenuOverlay = document.getElementById('mobileMenuOverlay');
        if (mobileMenuOverlay) {
            mobileMenuOverlay.classList.remove('active');
            mobileMenuOverlay.style.display = 'none';
        }
        
        // Resetear el botón hamburguesa
        const hamburgerMenu = document.getElementById('eliteHamburger');
        if (hamburgerMenu) {
            hamburgerMenu.classList.remove('active');
            hamburgerMenu.setAttribute('aria-expanded', 'false');
        }
    }
    
    setupEventListeners() {
        // Hamburger menu toggle with debouncing
        const hamburgerMenu = document.getElementById('hamburgerMenu');
        if (hamburgerMenu) {
            hamburgerMenu.addEventListener('click', this.debounce(() => this.toggleMobileMenu(), 300));
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
        
        // Handle window resize with throttling
        window.addEventListener('resize', this.throttle(() => this.handleResize(), 250));
        
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
        
        // Handle focus management
        document.addEventListener('focusin', (e) => this.handleFocusManagement(e));
    }
    
    setupMobileMenu() {
        try {
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
                    } else if (window.wallet) {
                        // Fallback to wallet instance
                        console.log('Wallet instance found, triggering connection');
                    }
                });
            }
            
            // Add loading states to menu items
            this.setupMenuLoadingStates();
            
        } catch (error) {
            console.error('Error setting up mobile menu:', error);
        }
    }
    
    setupTouchGestures() {
        // Swipe to close mobile menu
        let touchStartX = 0;
        let touchStartY = 0;
        
        document.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        });
        
        document.addEventListener('touchend', (e) => {
            if (!this.isMobileMenuOpen) return;
            
            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;
            const deltaX = touchStartX - touchEndX;
            const deltaY = Math.abs(touchStartY - touchEndY);
            
            // Swipe right to close (minimum 50px, maximum 100px vertical movement)
            if (deltaX > 50 && deltaY < 100) {
                this.closeMobileMenu();
            }
        });
    }
    
    setupAccessibility() {
        // ARIA labels and roles
        const hamburgerMenu = document.getElementById('hamburgerMenu');
        if (hamburgerMenu) {
            hamburgerMenu.setAttribute('aria-expanded', 'false');
            hamburgerMenu.setAttribute('aria-controls', 'mobileMenu');
            hamburgerMenu.setAttribute('aria-label', 'Toggle navigation menu');
        }
        
        const mobileMenu = document.getElementById('mobileMenu');
        if (mobileMenu) {
            mobileMenu.setAttribute('role', 'navigation');
            mobileMenu.setAttribute('aria-label', 'Main navigation');
        }
        
        // Focus trap for mobile menu
        this.setupFocusTrap();
    }
    
    setupFocusTrap() {
        const mobileMenu = document.getElementById('mobileMenu');
        if (!mobileMenu) return;
        
        const focusableElements = mobileMenu.querySelectorAll(
            'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        mobileMenu.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                if (e.shiftKey) {
                    if (document.activeElement === firstElement) {
                        e.preventDefault();
                        lastElement.focus();
                    }
                } else {
                    if (document.activeElement === lastElement) {
                        e.preventDefault();
                        firstElement.focus();
                    }
                }
                }
            });
        }
    
    setupPerformanceOptimizations() {
        // Use Intersection Observer for navbar effects
        if ('IntersectionObserver' in window) {
            this.setupIntersectionObserver();
        }
        
        // Preload critical resources
        this.preloadCriticalResources();
    }
    
    setupIntersectionObserver() {
        const navbar = document.querySelector('.navbar');
        if (!navbar) return;
        
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        navbar.classList.add('navbar-visible');
                    } else {
                        navbar.classList.remove('navbar-visible');
                    }
                });
            },
            { threshold: 0.1 }
        );
        
        // Observe the hero section
        const heroSection = document.querySelector('.hero-professional');
        if (heroSection) {
            observer.observe(heroSection);
        }
    }
    
    preloadCriticalResources() {
        // Preload logo image
        const logoImg = new Image();
        logoImg.src = 'assets/img/logo.png';
        
        // Preload critical fonts
        if ('fonts' in document) {
            document.fonts.load('1em Poppins');
        }
    }
    
    setupMenuLoadingStates() {
        const menuLinks = document.querySelectorAll('.menu-link');
        const menuActions = document.querySelectorAll('.menu-action');
        
        // Add loading state to external links
        menuLinks.forEach(link => {
            if (link.href && !link.href.includes(window.location.origin)) {
                link.addEventListener('click', () => {
                    link.classList.add('loading');
                    setTimeout(() => {
                        link.classList.remove('loading');
                    }, 2000);
                });
            }
        });
        
        // Add loading state to action buttons
        menuActions.forEach(action => {
            if (action.classList.contains('wallet-btn')) {
                action.addEventListener('click', () => {
                    action.classList.add('loading');
                    setTimeout(() => {
                        action.classList.remove('loading');
                    }, 1500);
                });
            }
        });
    }
    
    setupThemeToggle() {
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.toggleTheme());
            
            // Set initial state
            const savedTheme = localStorage.getItem('theme') || 'dark';
            this.setTheme(savedTheme);
        }
    }
    
    setupLanguageToggle() {
        const languageToggle = document.getElementById('languageToggle');
        if (languageToggle) {
            languageToggle.addEventListener('click', () => this.toggleLanguage());
            
            // Set initial state
            const savedLanguage = localStorage.getItem('language') || 'en';
            this.setLanguage(savedLanguage);
        }
    }
    
    setTheme(theme) {
        const body = document.body;
        const themeToggle = document.getElementById('themeToggle');
        
        if (theme === 'light') {
            body.classList.remove('dark-theme');
            body.classList.add('light-theme');
            if (themeToggle) {
                themeToggle.innerHTML = `
                    <span class="action-icon">☀️</span>
                    <span>Light Mode</span>
                `;
            }
        } else {
            body.classList.remove('light-theme');
            body.classList.add('dark-theme');
            if (themeToggle) {
                themeToggle.innerHTML = `
                    <span class="action-icon">🌙</span>
                    <span>Dark Mode</span>
                `;
            }
        }
        
        localStorage.setItem('theme', theme);
        
        // Dispatch custom event
        window.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme } }));
    }
    
    setLanguage(language) {
        const languageToggle = document.getElementById('languageToggle');
        
        if (language === 'es') {
            languageToggle.innerHTML = `
                <span class="action-icon">🇪🇸</span>
                <span>Español</span>
            `;
        } else {
            languageToggle.innerHTML = `
                <span class="action-icon">🌐</span>
                <span>English</span>
            `;
        }
        
        localStorage.setItem('language', language);
        
        // Dispatch custom event
        window.dispatchEvent(new CustomEvent('languageChanged', { detail: { language } }));
    }
    
    toggleTheme() {
        const currentTheme = document.body.classList.contains('dark-theme') ? 'dark' : 'light';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        this.setTheme(newTheme);
    }
    
    toggleLanguage() {
        const currentLang = localStorage.getItem('language') || 'en';
        const newLang = currentLang === 'en' ? 'es' : 'en';
        this.setLanguage(newLang);
    }
    
    toggleMobileMenu() {
        if (this.isAnimating) return;
        
        if (this.isMobileMenuOpen) {
            this.closeMobileMenu();
        } else {
            this.openMobileMenu();
        }
    }
    
    openMobileMenu() {
        if (this.isAnimating) return;
        
        const mobileMenu = document.getElementById('mobileMenu');
        const mobileMenuOverlay = document.getElementById('mobileMenuOverlay');
        const hamburgerMenu = document.getElementById('hamburgerMenu');
        
        if (mobileMenu && mobileMenuOverlay && hamburgerMenu) {
            this.isAnimating = true;
            this.isMobileMenuOpen = true;
            
            // Update ARIA attributes
            hamburgerMenu.setAttribute('aria-expanded', 'true');
            
            // Show mobile menu
            mobileMenu.classList.add('active');
            mobileMenuOverlay.classList.add('active');
            
            // Update hamburger menu
            hamburgerMenu.classList.add('active');
            
            // Prevent body scroll
            document.body.style.overflow = 'hidden';
            
            // Add active class to navbar
            document.querySelector('.navbar')?.classList.add('mobile-menu-open');
            
            // Focus first focusable element
            setTimeout(() => {
                const firstFocusable = mobileMenu.querySelector('a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])');
                if (firstFocusable) {
                    firstFocusable.focus();
                }
                this.isAnimating = false;
            }, 400);
            
            console.log('✅ Mobile menu opened successfully');
        } else {
            console.error('❌ Some elements not found for mobile menu');
            this.isAnimating = false;
        }
    }
    
    closeMobileMenu() {
        if (this.isAnimating) return;
        
        const mobileMenu = document.getElementById('mobileMenu');
        const mobileMenuOverlay = document.getElementById('mobileMenuOverlay');
        const hamburgerMenu = document.getElementById('hamburgerMenu');
        
        if (mobileMenu && mobileMenuOverlay && hamburgerMenu) {
            this.isAnimating = true;
            this.isMobileMenuOpen = false;
            
            // Update ARIA attributes
            hamburgerMenu.setAttribute('aria-expanded', 'false');
            
            // Hide mobile menu
            mobileMenu.classList.remove('active');
            mobileMenuOverlay.classList.remove('active');
            
            // Update hamburger menu
            hamburgerMenu.classList.remove('active');
            
            // Restore body scroll
            document.body.style.overflow = 'auto';
            
            // Remove active class from navbar
            document.querySelector('.navbar')?.classList.remove('mobile-menu-open');
            
            // Return focus to hamburger button
            setTimeout(() => {
                hamburgerMenu.focus();
                this.isAnimating = false;
            }, 400);
            
            console.log('✅ Mobile menu closed successfully');
        }
    }
    
    handleResize() {
        // Close mobile menu on resize if screen becomes larger
        if (window.innerWidth > 992 && this.isMobileMenuOpen) {
            this.closeMobileMenu();
        }
        
        // Update navbar height for mobile
        const navbar = document.querySelector('.navbar');
        if (navbar) {
            if (window.innerWidth <= 768) {
                navbar.style.height = '70px';
            } else {
                navbar.style.height = '80px';
            }
        }
    }
    
    handleFocusManagement(event) {
        // Ensure focus stays within mobile menu when open
        if (this.isMobileMenuOpen) {
            const mobileMenu = document.getElementById('mobileMenu');
            if (mobileMenu && !mobileMenu.contains(event.target)) {
                // Focus first focusable element in mobile menu
                const firstFocusable = mobileMenu.querySelector('a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])');
                if (firstFocusable) {
                    firstFocusable.focus();
                }
            }
        }
    }
    
    // Utility functions
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
        };
    }
    
    // Public methods for external use
    openMenu() {
        this.openMobileMenu();
    }
    
    closeMenu() {
        this.closeMobileMenu();
    }
    
    isMenuOpen() {
        return this.isMobileMenuOpen;
    }
    
    // Cleanup method
    destroy() {
        // Remove event listeners
        window.removeEventListener('resize', this.handleResize);
        document.removeEventListener('keydown', this.handleKeydown);
        document.removeEventListener('focusin', this.handleFocusManagement);
        
        // Close menu if open
        if (this.isMobileMenuOpen) {
            this.closeMobileMenu();
        }
        
        console.log('✅ Professional Navbar Manager destroyed');
    }
}

// ===== INITIALIZATION =====

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
    // Create global instance
    window.navbarManager = new ProfessionalNavbarManager();
    
    // Expose class for global use
    window.ProfessionalNavbarManager = ProfessionalNavbarManager;
    
    console.log('🚀 Professional Navbar Manager loaded successfully');
});

// Handle page visibility changes for performance
document.addEventListener('visibilitychange', () => {
    if (document.hidden && window.navbarManager?.isMobileMenuOpen) {
        window.navbarManager.closeMobileMenu();
    }
});

// Handle beforeunload for cleanup
window.addEventListener('beforeunload', () => {
    if (window.navbarManager) {
        window.navbarManager.destroy();
    }
});
