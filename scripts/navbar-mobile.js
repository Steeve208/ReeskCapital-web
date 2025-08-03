// ===== NAVBAR MOBILE MANAGER - REORGANIZADO =====

class NavbarMobileManager {
    constructor() {
        this.isMenuOpen = false;
        this.isLanguageDropdownOpen = false;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupTouchHandlers();
        this.setupKeyboardNavigation();
        this.setupAccessibility();
    }

    setupEventListeners() {
        // Toggle del menú móvil
        const navbarToggle = document.querySelector('.navbar-toggle');
        if (navbarToggle) {
            navbarToggle.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleMobileMenu();
            });
        }

        // Cerrar menú al hacer click fuera
        document.addEventListener('click', (e) => {
            const navbar = document.querySelector('.navbar');
            const navbarLinks = document.querySelector('.navbar-links');
            
            if (navbar && navbarLinks && this.isMenuOpen) {
                if (!navbar.contains(e.target)) {
                    this.closeMobileMenu();
                }
            }
        });

        // Selector de idioma móvil
        const mobileLanguageSelector = document.querySelector('.mobile-language-selector');
        if (mobileLanguageSelector) {
            mobileLanguageSelector.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.toggleMobileLanguageDropdown();
            });
        }

        // Opciones de idioma móvil
        const mobileLanguageOptions = document.querySelectorAll('.mobile-language-option');
        mobileLanguageOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const lang = option.getAttribute('data-lang');
                this.changeMobileLanguage(lang);
                this.closeMobileLanguageDropdown();
            });
        });

        // Toggle de tema móvil
        const mobileThemeToggle = document.querySelector('.mobile-theme-toggle');
        if (mobileThemeToggle) {
            mobileThemeToggle.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleMobileTheme();
            });
        }

        // Botón de wallet móvil
        const mobileWalletBtn = document.querySelector('.mobile-wallet-btn');
        if (mobileWalletBtn) {
            mobileWalletBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.connectMobileWallet();
            });
        }

        // Enlaces de navegación móvil
        const mobileNavLinks = document.querySelectorAll('.navbar-links a');
        mobileNavLinks.forEach(link => {
            link.addEventListener('click', () => {
                this.closeMobileMenu();
            });
        });
    }

    setupTouchHandlers() {
        // Gestos táctiles para el navbar
        let startX = 0;
        let startY = 0;
        
        const navbar = document.querySelector('.navbar');
        if (navbar) {
            navbar.addEventListener('touchstart', (e) => {
                startX = e.touches[0].clientX;
                startY = e.touches[0].clientY;
            });
            
            navbar.addEventListener('touchend', (e) => {
                const endX = e.changedTouches[0].clientX;
                const endY = e.changedTouches[0].clientY;
                const diffX = startX - endX;
                const diffY = startY - endY;
                
                // Swipe horizontal para cerrar menú
                if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
                    if (this.isMenuOpen) {
                        this.closeMobileMenu();
                    }
                }
            });
        }
    }

    setupKeyboardNavigation() {
        // Navegación por teclado en el menú móvil
        const navbarLinks = document.querySelectorAll('.navbar-links a');
        navbarLinks.forEach((link, index) => {
            link.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    link.click();
                    this.closeMobileMenu();
                }
                
                // Navegación con flechas
                if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    const nextLink = navbarLinks[index + 1] || navbarLinks[0];
                    nextLink.focus();
                } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    const prevLink = navbarLinks[index - 1] || navbarLinks[navbarLinks.length - 1];
                    prevLink.focus();
                }
            });
        });
        
        // Escape para cerrar menús
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (this.isMenuOpen) {
                    this.closeMobileMenu();
                }
                if (this.isLanguageDropdownOpen) {
                    this.closeMobileLanguageDropdown();
                }
            }
        });
    }

    setupAccessibility() {
        // ARIA labels y roles
        const navbarToggle = document.querySelector('.navbar-toggle');
        if (navbarToggle) {
            navbarToggle.setAttribute('aria-label', 'Abrir menú de navegación');
            navbarToggle.setAttribute('aria-expanded', 'false');
            navbarToggle.setAttribute('aria-controls', 'navbar-links');
        }
        
        const navbarLinks = document.querySelector('.navbar-links');
        if (navbarLinks) {
            navbarLinks.setAttribute('role', 'menu');
            navbarLinks.setAttribute('aria-label', 'Menú de navegación móvil');
        }
        
        // Roles para elementos del menú
        const menuItems = document.querySelectorAll('.navbar-links li');
        menuItems.forEach(item => {
            item.setAttribute('role', 'none');
            const link = item.querySelector('a');
            if (link) {
                link.setAttribute('role', 'menuitem');
            }
        });
    }

    toggleMobileMenu() {
        const navbarLinks = document.querySelector('.navbar-links');
        const navbarToggle = document.querySelector('.navbar-toggle');
        
        if (!navbarLinks || !navbarToggle) return;
        
        if (this.isMenuOpen) {
            this.closeMobileMenu();
        } else {
            this.openMobileMenu();
        }
    }

    openMobileMenu() {
        const navbarLinks = document.querySelector('.navbar-links');
        const navbarToggle = document.querySelector('.navbar-toggle');
        
        if (!navbarLinks || !navbarToggle) return;
        
        navbarLinks.classList.add('active');
        navbarToggle.setAttribute('aria-expanded', 'true');
        navbarToggle.setAttribute('aria-label', 'Cerrar menú de navegación');
        
        this.isMenuOpen = true;
        
        // Focus en el primer elemento del menú
        const firstLink = navbarLinks.querySelector('a');
        if (firstLink) {
            setTimeout(() => firstLink.focus(), 100);
        }
        
        // Prevenir scroll del body
        document.body.style.overflow = 'hidden';
        
        // Emitir evento
        window.dispatchEvent(new CustomEvent('mobileMenuOpen'));
    }

    closeMobileMenu() {
        const navbarLinks = document.querySelector('.navbar-links');
        const navbarToggle = document.querySelector('.navbar-toggle');
        
        if (!navbarLinks || !navbarToggle) return;
        
        navbarLinks.classList.remove('active');
        navbarToggle.setAttribute('aria-expanded', 'false');
        navbarToggle.setAttribute('aria-label', 'Abrir menú de navegación');
        
        this.isMenuOpen = false;
        
        // Restaurar scroll del body
        document.body.style.overflow = '';
        
        // Focus en el botón toggle
        navbarToggle.focus();
        
        // Emitir evento
        window.dispatchEvent(new CustomEvent('mobileMenuClose'));
    }

    toggleMobileLanguageDropdown() {
        const mobileLanguageDropdown = document.querySelector('.mobile-language-dropdown');
        const mobileLanguageSelector = document.querySelector('.mobile-language-selector');
        
        if (!mobileLanguageDropdown || !mobileLanguageSelector) return;
        
        if (this.isLanguageDropdownOpen) {
            this.closeMobileLanguageDropdown();
        } else {
            this.openMobileLanguageDropdown();
        }
    }

    openMobileLanguageDropdown() {
        const mobileLanguageDropdown = document.querySelector('.mobile-language-dropdown');
        const mobileLanguageSelector = document.querySelector('.mobile-language-selector');
        
        if (!mobileLanguageDropdown || !mobileLanguageSelector) return;
        
        mobileLanguageDropdown.style.display = 'block';
        this.isLanguageDropdownOpen = true;
        
        // Focus en la primera opción
        const firstOption = mobileLanguageDropdown.querySelector('.mobile-language-option');
        if (firstOption) {
            setTimeout(() => firstOption.focus(), 100);
        }
    }

    closeMobileLanguageDropdown() {
        const mobileLanguageDropdown = document.querySelector('.mobile-language-dropdown');
        const mobileLanguageSelector = document.querySelector('.mobile-language-selector');
        
        if (!mobileLanguageDropdown || !mobileLanguageSelector) return;
        
        mobileLanguageDropdown.style.display = 'none';
        this.isLanguageDropdownOpen = false;
        
        // Focus en el selector
        mobileLanguageSelector.focus();
    }

    changeMobileLanguage(lang) {
        // Implementar cambio de idioma
        console.log(`Cambiando idioma a: ${lang}`);
        
        // Actualizar el texto del selector móvil
        const mobileLanguageSelector = document.querySelector('.mobile-language-selector span');
        if (mobileLanguageSelector) {
            mobileLanguageSelector.textContent = lang.toUpperCase();
        }
        
        // Actualizar también el selector desktop si existe
        const desktopLanguageSelector = document.querySelector('.language-selector span');
        if (desktopLanguageSelector) {
            desktopLanguageSelector.textContent = lang.toUpperCase();
        }
        
        // Emitir evento de cambio de idioma
        window.dispatchEvent(new CustomEvent('languageChange', {
            detail: { language: lang }
        }));
        
        // Mostrar notificación
        this.showNotification(`Idioma cambiado a ${lang.toUpperCase()}`);
    }

    toggleMobileTheme() {
        const mobileThemeToggle = document.querySelector('.mobile-theme-toggle');
        const desktopThemeToggle = document.querySelector('.theme-toggle');
        
        if (!mobileThemeToggle) return;
        
        const currentTheme = document.body.classList.contains('dark-mode') ? 'dark' : 'light';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        // Cambiar tema
        if (newTheme === 'dark') {
            document.body.classList.add('dark-mode');
            // Actualizar iconos móviles
            const mobileIcon = mobileThemeToggle.querySelector('span:first-child');
            const mobileText = mobileThemeToggle.querySelector('span:last-child');
            if (mobileIcon) mobileIcon.textContent = '☀️';
            if (mobileText) mobileText.textContent = 'Claro';
            
            // Actualizar iconos desktop
            const desktopIcon = desktopThemeToggle?.querySelector('.theme-icon');
            if (desktopIcon) desktopIcon.textContent = '☀️';
        } else {
            document.body.classList.remove('dark-mode');
            // Actualizar iconos móviles
            const mobileIcon = mobileThemeToggle.querySelector('span:first-child');
            const mobileText = mobileThemeToggle.querySelector('span:last-child');
            if (mobileIcon) mobileIcon.textContent = '🌙';
            if (mobileText) mobileText.textContent = 'Oscuro';
            
            // Actualizar iconos desktop
            const desktopIcon = desktopThemeToggle?.querySelector('.theme-icon');
            if (desktopIcon) desktopIcon.textContent = '🌙';
        }
        
        // Guardar preferencia
        localStorage.setItem('theme', newTheme);
        
        // Emitir evento
        window.dispatchEvent(new CustomEvent('themeChange', {
            detail: { theme: newTheme }
        }));
        
        // Mostrar notificación
        this.showNotification(`Tema cambiado a ${newTheme === 'dark' ? 'oscuro' : 'claro'}`);
    }

    connectMobileWallet() {
        // Implementar conexión de wallet
        console.log('Conectando wallet desde móvil...');
        
        // Simular proceso de conexión
        this.showNotification('Conectando wallet...', 'info');
        
        setTimeout(() => {
            this.showNotification('Wallet conectada exitosamente!', 'success');
            
            // Cambiar texto del botón móvil
            const mobileWalletBtn = document.querySelector('.mobile-wallet-btn');
            if (mobileWalletBtn) {
                const walletText = mobileWalletBtn.querySelector('span:first-child');
                if (walletText) {
                    walletText.textContent = 'Conectada';
                }
            }
            
            // Cambiar también el botón desktop si existe
            const desktopWalletBtn = document.querySelector('.btn-wallet-connect');
            if (desktopWalletBtn) {
                const desktopWalletText = desktopWalletBtn.querySelector('.wallet-text');
                if (desktopWalletText) {
                    desktopWalletText.textContent = 'Wallet Conectada';
                }
            }
        }, 2000);
    }

    showNotification(message, type = 'info') {
        // Usar el sistema de notificaciones existente
        if (window.showNotification) {
            window.showNotification(message, type);
        } else {
            // Fallback simple
            const notification = document.createElement('div');
            notification.className = `notification notification-${type}`;
            notification.textContent = message;
            notification.style.cssText = `
                position: fixed;
                top: 80px;
                right: 20px;
                padding: 1rem 1.5rem;
                background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#6366f1'};
                color: white;
                border-radius: 0.5rem;
                z-index: 10000;
                animation: slideIn 0.3s ease;
                font-size: 0.9rem;
            `;
            
            document.body.appendChild(notification);
            
            setTimeout(() => {
                notification.remove();
            }, 3000);
        }
    }

    // Métodos públicos para uso externo
    isMobileMenuOpen() {
        return this.isMenuOpen;
    }
    
    isLanguageDropdownOpen() {
        return this.isLanguageDropdownOpen;
    }
    
    getCurrentLanguage() {
        const mobileLanguageSelector = document.querySelector('.mobile-language-selector span');
        const desktopLanguageSelector = document.querySelector('.language-selector span');
        return mobileLanguageSelector ? mobileLanguageSelector.textContent : 
               desktopLanguageSelector ? desktopLanguageSelector.textContent : 'ES';
    }
    
    getCurrentTheme() {
        return document.body.classList.contains('dark-mode') ? 'dark' : 'light';
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.navbarMobileManager = new NavbarMobileManager();
});

// Exportar para uso global
window.NavbarMobileManager = NavbarMobileManager; 