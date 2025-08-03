// ===== RESPONSIVE JAVASCRIPT =====

class ResponsiveManager {
    constructor() {
        this.currentBreakpoint = 'mobile';
        this.currentOrientation = 'portrait';
        this.isTouchDevice = false;
        this.isHighDPI = false;
        this.isReducedMotion = false;
        this.isDarkMode = false;
        this.isHighContrast = false;
        this.isReducedData = false;
        this.init();
    }

    init() {
        this.detectDeviceCapabilities();
        this.setupEventListeners();
        this.setupResizeObserver();
        this.setupOrientationChange();
        this.setupAccessibilityFeatures();
        this.applyResponsiveClasses();
        this.setupTouchHandlers();
        this.setupKeyboardNavigation();
    }

    detectDeviceCapabilities() {
        // Detectar tipo de dispositivo
        this.isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        
        // Detectar pantalla de alta densidad
        this.isHighDPI = window.devicePixelRatio > 1;
        
        // Detectar preferencias de accesibilidad
        this.isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        this.isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
        this.isHighContrast = window.matchMedia('(prefers-contrast: high)').matches;
        this.isReducedData = window.matchMedia('(prefers-reduced-data: reduce)').matches;
        
        // Aplicar clases CSS según capacidades
        this.applyDeviceClasses();
    }

    applyDeviceClasses() {
        const body = document.body;
        
        // Clases de dispositivo
        if (this.isTouchDevice) {
            body.classList.add('touch-device');
        } else {
            body.classList.add('no-touch-device');
        }
        
        if (this.isHighDPI) {
            body.classList.add('high-dpi');
        }
        
        if (this.isReducedMotion) {
            body.classList.add('reduced-motion');
        }
        
        if (this.isDarkMode) {
            body.classList.add('dark-mode-preference');
        }
        
        if (this.isHighContrast) {
            body.classList.add('high-contrast');
        }
        
        if (this.isReducedData) {
            body.classList.add('reduced-data');
        }
    }

    setupEventListeners() {
        // Escuchar cambios en el tamaño de la ventana
        window.addEventListener('resize', this.debounce(() => {
            this.updateBreakpoint();
            this.applyResponsiveClasses();
        }, 250));
        
        // Escuchar cambios en las preferencias del usuario
        this.setupMediaQueryListeners();
        
        // Escuchar cambios de orientación
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                this.updateOrientation();
                this.applyResponsiveClasses();
            }, 100);
        });
    }

    setupMediaQueryListeners() {
        // Reducir movimiento
        const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        reducedMotionQuery.addEventListener('change', (e) => {
            this.isReducedMotion = e.matches;
            this.applyDeviceClasses();
        });
        
        // Modo oscuro
        const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
        darkModeQuery.addEventListener('change', (e) => {
            this.isDarkMode = e.matches;
            this.applyDeviceClasses();
        });
        
        // Alto contraste
        const highContrastQuery = window.matchMedia('(prefers-contrast: high)');
        highContrastQuery.addEventListener('change', (e) => {
            this.isHighContrast = e.matches;
            this.applyDeviceClasses();
        });
        
        // Datos reducidos
        const reducedDataQuery = window.matchMedia('(prefers-reduced-data: reduce)');
        reducedDataQuery.addEventListener('change', (e) => {
            this.isReducedData = e.matches;
            this.applyDeviceClasses();
        });
    }

    setupResizeObserver() {
        // Observar cambios en el tamaño del viewport
        if ('ResizeObserver' in window) {
            const resizeObserver = new ResizeObserver(entries => {
                for (let entry of entries) {
                    if (entry.target === document.body) {
                        this.updateBreakpoint();
                        this.applyResponsiveClasses();
                    }
                }
            });
            
            resizeObserver.observe(document.body);
        }
    }

    setupOrientationChange() {
        // Detectar orientación inicial
        this.updateOrientation();
        
        // Escuchar cambios de orientación
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                this.updateOrientation();
                this.applyResponsiveClasses();
            }, 100);
        });
    }

    updateOrientation() {
        this.currentOrientation = window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';
        document.body.setAttribute('data-orientation', this.currentOrientation);
    }

    updateBreakpoint() {
        const width = window.innerWidth;
        let newBreakpoint = 'mobile';
        
        if (width >= 1440) {
            newBreakpoint = 'xl-desktop';
        } else if (width >= 1200) {
            newBreakpoint = 'large-desktop';
        } else if (width >= 1024) {
            newBreakpoint = 'desktop';
        } else if (width >= 768) {
            newBreakpoint = 'tablet';
        } else if (width >= 480) {
            newBreakpoint = 'large-mobile';
        } else {
            newBreakpoint = 'mobile';
        }
        
        if (this.currentBreakpoint !== newBreakpoint) {
            this.currentBreakpoint = newBreakpoint;
            document.body.setAttribute('data-breakpoint', newBreakpoint);
            this.onBreakpointChange(newBreakpoint);
        }
    }

    onBreakpointChange(newBreakpoint) {
        // Ajustar navegación según el breakpoint
        this.adjustNavigation(newBreakpoint);
        
        // Ajustar layout según el breakpoint
        this.adjustLayout(newBreakpoint);
        
        // Ajustar interacciones según el breakpoint
        this.adjustInteractions(newBreakpoint);
        
        // Emitir evento personalizado
        window.dispatchEvent(new CustomEvent('breakpointChange', {
            detail: { breakpoint: newBreakpoint }
        }));
    }

    adjustNavigation(breakpoint) {
        const navbar = document.querySelector('.navbar');
        const navbarToggle = document.querySelector('.navbar-toggle');
        const navbarLinks = document.querySelector('.navbar-links');
        
        if (!navbar || !navbarToggle || !navbarLinks) return;
        
        if (breakpoint === 'mobile' || breakpoint === 'large-mobile') {
            // Navegación móvil con hamburger menu
            navbarToggle.style.display = 'block';
            navbarLinks.style.display = 'none';
            
            // Toggle del menú móvil
            navbarToggle.addEventListener('click', () => {
                navbarLinks.classList.toggle('active');
                navbarToggle.setAttribute('aria-expanded', 
                    navbarLinks.classList.contains('active').toString());
            });
            
            // Cerrar menú al hacer click fuera
            document.addEventListener('click', (e) => {
                if (!navbar.contains(e.target)) {
                    navbarLinks.classList.remove('active');
                    navbarToggle.setAttribute('aria-expanded', 'false');
                }
            });
        } else {
            // Navegación desktop
            navbarToggle.style.display = 'none';
            navbarLinks.style.display = 'flex';
            navbarLinks.classList.remove('active');
        }
    }

    adjustLayout(breakpoint) {
        // Ajustar sidebar en páginas como about
        const aboutContainer = document.querySelector('.about-container-enhanced');
        if (aboutContainer) {
            if (breakpoint === 'mobile' || breakpoint === 'large-mobile') {
                aboutContainer.style.flexDirection = 'column';
            } else {
                aboutContainer.style.flexDirection = 'row';
            }
        }
        
        // Ajustar grids según el breakpoint
        this.adjustGrids(breakpoint);
        
        // Ajustar espaciado según el breakpoint
        this.adjustSpacing(breakpoint);
    }

    adjustGrids(breakpoint) {
        const grids = document.querySelectorAll('.features-grid, .stats-grid, .values-grid-enhanced');
        
        grids.forEach(grid => {
            const columns = this.getGridColumns(breakpoint, grid.className);
            grid.style.gridTemplateColumns = columns;
        });
    }

    getGridColumns(breakpoint, className) {
        const gridConfigs = {
            'features-grid': {
                'mobile': '1fr',
                'large-mobile': '1fr',
                'tablet': 'repeat(2, 1fr)',
                'desktop': 'repeat(3, 1fr)',
                'large-desktop': 'repeat(4, 1fr)',
                'xl-desktop': 'repeat(4, 1fr)'
            },
            'stats-grid': {
                'mobile': 'repeat(2, 1fr)',
                'large-mobile': 'repeat(2, 1fr)',
                'tablet': 'repeat(4, 1fr)',
                'desktop': 'repeat(4, 1fr)',
                'large-desktop': 'repeat(4, 1fr)',
                'xl-desktop': 'repeat(4, 1fr)'
            },
            'values-grid-enhanced': {
                'mobile': '1fr',
                'large-mobile': '1fr',
                'tablet': 'repeat(2, 1fr)',
                'desktop': 'repeat(2, 1fr)',
                'large-desktop': 'repeat(4, 1fr)',
                'xl-desktop': 'repeat(4, 1fr)'
            }
        };
        
        const config = gridConfigs[className];
        return config ? config[breakpoint] || '1fr' : '1fr';
    }

    adjustSpacing(breakpoint) {
        const spacingMap = {
            'mobile': 'var(--spacing-sm)',
            'large-mobile': 'var(--spacing-md)',
            'tablet': 'var(--spacing-md)',
            'desktop': 'var(--spacing-lg)',
            'large-desktop': 'var(--spacing-lg)',
            'xl-desktop': 'var(--spacing-xl)'
        };
        
        const spacing = spacingMap[breakpoint] || 'var(--spacing-md)';
        document.documentElement.style.setProperty('--current-spacing', spacing);
    }

    adjustInteractions(breakpoint) {
        if (breakpoint === 'mobile' || breakpoint === 'large-mobile') {
            // Optimizar para touch en móviles
            this.optimizeForTouch();
        } else {
            // Optimizar para mouse en desktop
            this.optimizeForMouse();
        }
    }

    optimizeForTouch() {
        // Aumentar tamaño de elementos clickeables
        const clickableElements = document.querySelectorAll('.btn, .nav-link, .action-btn, .timeline-btn');
        clickableElements.forEach(element => {
            element.style.minHeight = '44px';
            element.style.minWidth = '44px';
        });
        
        // Añadir feedback táctil
        this.addTouchFeedback();
    }

    optimizeForMouse() {
        // Restaurar tamaños normales
        const clickableElements = document.querySelectorAll('.btn, .nav-link, .action-btn, .timeline-btn');
        clickableElements.forEach(element => {
            element.style.minHeight = '';
            element.style.minWidth = '';
        });
        
        // Añadir hover effects
        this.addHoverEffects();
    }

    addTouchFeedback() {
        // Añadir efectos de feedback táctil
        const touchElements = document.querySelectorAll('.btn, .nav-link, .action-btn');
        touchElements.forEach(element => {
            element.addEventListener('touchstart', () => {
                element.style.transform = 'scale(0.95)';
            });
            
            element.addEventListener('touchend', () => {
                element.style.transform = '';
            });
        });
    }

    addHoverEffects() {
        // Los efectos hover ya están en CSS, solo asegurar que funcionen
        const hoverElements = document.querySelectorAll('.btn, .nav-link, .action-btn, .value-card-enhanced');
        hoverElements.forEach(element => {
            element.addEventListener('mouseenter', () => {
                if (!this.isReducedMotion) {
                    element.style.transition = 'all 0.3s ease';
                }
            });
        });
    }

    setupAccessibilityFeatures() {
        // Navegación por teclado
        this.setupKeyboardNavigation();
        
        // Focus management
        this.setupFocusManagement();
        
        // Screen reader support
        this.setupScreenReaderSupport();
    }

    setupKeyboardNavigation() {
        // Navegación por teclado en el navbar
        const navbarLinks = document.querySelectorAll('.navbar-links a');
        navbarLinks.forEach((link, index) => {
            link.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    link.click();
                }
            });
            
            // Navegación con flechas
            link.addEventListener('keydown', (e) => {
                if (e.key === 'ArrowRight') {
                    e.preventDefault();
                    const nextLink = navbarLinks[index + 1] || navbarLinks[0];
                    nextLink.focus();
                } else if (e.key === 'ArrowLeft') {
                    e.preventDefault();
                    const prevLink = navbarLinks[index - 1] || navbarLinks[navbarLinks.length - 1];
                    prevLink.focus();
                }
            });
        });
    }

    setupFocusManagement() {
        // Mantener focus visible
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                document.body.classList.add('keyboard-navigation');
            }
        });
        
        document.addEventListener('mousedown', () => {
            document.body.classList.remove('keyboard-navigation');
        });
    }

    setupScreenReaderSupport() {
        // Añadir ARIA labels dinámicamente
        const buttons = document.querySelectorAll('button:not([aria-label])');
        buttons.forEach(button => {
            if (button.textContent.trim()) {
                button.setAttribute('aria-label', button.textContent.trim());
            }
        });
        
        // Añadir roles semánticos
        const nav = document.querySelector('nav');
        if (nav) {
            nav.setAttribute('role', 'navigation');
        }
        
        const main = document.querySelector('main');
        if (main) {
            main.setAttribute('role', 'main');
        }
    }

    setupTouchHandlers() {
        if (this.isTouchDevice) {
            // Gestos táctiles
            this.setupTouchGestures();
            
            // Optimizar scroll
            this.optimizeScroll();
        }
    }

    setupTouchGestures() {
        let startX = 0;
        let startY = 0;
        
        document.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        });
        
        document.addEventListener('touchend', (e) => {
            const endX = e.changedTouches[0].clientX;
            const endY = e.changedTouches[0].clientY;
            const diffX = startX - endX;
            const diffY = startY - endY;
            
            // Swipe horizontal para navegación
            if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
                if (diffX > 0) {
                    // Swipe izquierda - siguiente
                    this.handleSwipeNavigation('next');
                } else {
                    // Swipe derecha - anterior
                    this.handleSwipeNavigation('prev');
                }
            }
        });
    }

    handleSwipeNavigation(direction) {
        // Navegación por swipe en páginas como about
        const currentSection = document.querySelector('.nav-link.active');
        if (currentSection) {
            const sections = Array.from(document.querySelectorAll('.nav-link'));
            const currentIndex = sections.indexOf(currentSection);
            let nextIndex;
            
            if (direction === 'next') {
                nextIndex = currentIndex + 1 >= sections.length ? 0 : currentIndex + 1;
            } else {
                nextIndex = currentIndex - 1 < 0 ? sections.length - 1 : currentIndex - 1;
            }
            
            sections[nextIndex].click();
        }
    }

    optimizeScroll() {
        // Smooth scroll optimizado para touch
        if ('scrollBehavior' in document.documentElement.style) {
            document.documentElement.style.scrollBehavior = 'smooth';
        }
        
        // Prevenir scroll en elementos interactivos
        const interactiveElements = document.querySelectorAll('.btn, .nav-link, .action-btn');
        interactiveElements.forEach(element => {
            element.addEventListener('touchstart', (e) => {
                e.preventDefault();
            }, { passive: false });
        });
    }

    applyResponsiveClasses() {
        const body = document.body;
        
        // Remover clases anteriores
        body.classList.remove('mobile', 'tablet', 'desktop', 'large-desktop', 'xl-desktop');
        
        // Añadir clase actual
        body.classList.add(this.currentBreakpoint);
        
        // Aplicar clases de orientación
        body.classList.remove('portrait', 'landscape');
        body.classList.add(this.currentOrientation);
    }

    // Utilidades
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

    // Métodos públicos para uso externo
    getCurrentBreakpoint() {
        return this.currentBreakpoint;
    }
    
    getCurrentOrientation() {
        return this.currentOrientation;
    }
    
    isMobile() {
        return this.currentBreakpoint === 'mobile' || this.currentBreakpoint === 'large-mobile';
    }
    
    isTablet() {
        return this.currentBreakpoint === 'tablet';
    }
    
    isDesktop() {
        return this.currentBreakpoint === 'desktop' || this.currentBreakpoint === 'large-desktop' || this.currentBreakpoint === 'xl-desktop';
    }
    
    isTouch() {
        return this.isTouchDevice;
    }
    
    isHighDPI() {
        return this.isHighDPI;
    }
    
    isReducedMotion() {
        return this.isReducedMotion;
    }
    
    isDarkMode() {
        return this.isDarkMode;
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.responsiveManager = new ResponsiveManager();
});

// Exportar para uso global
window.ResponsiveManager = ResponsiveManager; 