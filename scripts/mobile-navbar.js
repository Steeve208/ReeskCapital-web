/* ===== MOBILE NAVBAR FUNCTIONALITY ===== */

class MobileNavbarManager {
    constructor() {
        this.isMobileMenuOpen = false;
        this.isAnimating = false;
        this.init();
    }
    
    init() {
        try {
            this.setupEventListeners();
            this.setupResponsive();
            console.log('✅ Mobile Navbar Manager initialized successfully');
        } catch (error) {
            console.error('❌ Error initializing Mobile Navbar Manager:', error);
        }
    }
    
    setupEventListeners() {
        // Mobile hamburger button
        const mobileHamburger = document.getElementById('mobileHamburger');
        if (mobileHamburger) {
            mobileHamburger.addEventListener('click', () => this.toggleMobileMenu());
        }
        
        // Mobile close button
        const mobileClose = document.getElementById('mobileClose');
        if (mobileClose) {
            mobileClose.addEventListener('click', () => this.closeMobileMenu());
        }
        
        // Mobile menu overlay
        const mobileMenuOverlay = document.getElementById('mobileMenuOverlay');
        if (mobileMenuOverlay) {
            mobileMenuOverlay.addEventListener('click', () => this.closeMobileMenu());
        }
        
        // Close menu when clicking on links
        const mobileMenuLinks = document.querySelectorAll('.mobile-menu-link, .mobile-menu-action');
        mobileMenuLinks.forEach(link => {
            link.addEventListener('click', () => {
                setTimeout(() => this.closeMobileMenu(), 100);
            });
        });
        
        // Close menu on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isMobileMenuOpen) {
                this.closeMobileMenu();
            }
        });
        
        // Close menu on window resize
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768 && this.isMobileMenuOpen) {
                this.closeMobileMenu();
            }
        });
    }
    
    setupResponsive() {
        // Check initial screen size
        this.handleResize();
        
        // Listen for resize events
        window.addEventListener('resize', () => this.handleResize());
    }
    
    handleResize() {
        const isMobile = window.innerWidth <= 768;
        const mobileNavbar = document.querySelector('.mobile-navbar');
        const header = document.querySelector('.header');
        const main = document.querySelector('main');
        
        if (isMobile) {
            // Show mobile navbar, hide desktop header
            if (mobileNavbar) mobileNavbar.style.display = 'block';
            if (header) header.style.display = 'none';
            if (main) main.style.marginTop = '60px';
        } else {
            // Hide mobile navbar, show desktop header
            if (mobileNavbar) mobileNavbar.style.display = 'none';
            if (header) header.style.display = 'block';
            if (main) main.style.marginTop = '';
            
            // Close mobile menu if open
            if (this.isMobileMenuOpen) {
                this.closeMobileMenu();
            }
        }
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
        const mobileHamburger = document.getElementById('mobileHamburger');
        
        if (mobileMenu && mobileMenuOverlay && mobileHamburger) {
            this.isAnimating = true;
            this.isMobileMenuOpen = true;
            
            // Update ARIA attributes
            mobileHamburger.setAttribute('aria-expanded', 'true');
            
            // Show mobile menu
            mobileMenu.classList.add('active');
            mobileMenuOverlay.classList.add('active');
            
            // Update hamburger menu
            mobileHamburger.classList.add('active');
            
            // Prevent body scroll
            document.body.style.overflow = 'hidden';
            document.body.classList.add('mobile-menu-open');
            
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
        const mobileHamburger = document.getElementById('mobileHamburger');
        
        if (mobileMenu && mobileMenuOverlay && mobileHamburger) {
            this.isAnimating = true;
            this.isMobileMenuOpen = false;
            
            // Update ARIA attributes
            mobileHamburger.setAttribute('aria-expanded', 'false');
            
            // Hide mobile menu
            mobileMenu.classList.remove('active');
            mobileMenuOverlay.classList.remove('active');
            
            // Update hamburger menu
            mobileHamburger.classList.remove('active');
            
            // Restore body scroll
            document.body.style.overflow = '';
            document.body.classList.remove('mobile-menu-open');
            
            // Focus hamburger button
            setTimeout(() => {
                mobileHamburger.focus();
                this.isAnimating = false;
            }, 400);
            
            console.log('✅ Mobile menu closed successfully');
        } else {
            console.error('❌ Some elements not found for mobile menu');
            this.isAnimating = false;
        }
    }
    
    // Public method to check if menu is open
    isMenuOpen() {
        return this.isMobileMenuOpen;
    }
    
    // Public method to force close menu
    forceCloseMenu() {
        if (this.isMobileMenuOpen) {
            this.closeMobileMenu();
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.mobileNavbarManager = new MobileNavbarManager();
});

// Initialize when window loads (fallback)
window.addEventListener('load', () => {
    if (!window.mobileNavbarManager) {
        window.mobileNavbarManager = new MobileNavbarManager();
    }
});
