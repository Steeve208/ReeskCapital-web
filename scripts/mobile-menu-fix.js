/* ===== MOBILE MENU FIX - SIMPLE AND ROBUST ===== */

class MobileMenuFix {
    constructor() {
        this.isOpen = false;
        this.init();
    }

    init() {
        // Esperar a que el DOM esté completamente cargado
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }

    setup() {
        try {
            this.setupElements();
            this.setupEventListeners();
            this.setupStyles();
            console.log('✅ Mobile Menu Fix initialized successfully');
        } catch (error) {
            console.error('❌ Mobile Menu Fix error:', error);
        }
    }

    setupElements() {
        // Obtener elementos del DOM
        this.hamburger = document.getElementById('mobileHamburger');
        this.menu = document.getElementById('mobileMenu');
        this.closeBtn = document.getElementById('mobileClose');
        this.menuLinks = document.querySelectorAll('.mobile-menu-link');

        // Verificar que los elementos existen
        if (!this.hamburger) {
            console.warn('⚠️ Hamburger button not found');
            return false;
        }
        if (!this.menu) {
            console.warn('⚠️ Mobile menu not found');
            return false;
        }

        return true;
    }

    setupEventListeners() {
        // Evento del botón hamburguesa
        if (this.hamburger) {
            this.hamburger.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.toggleMenu();
            });
        }

        // Evento del botón cerrar
        if (this.closeBtn) {
            this.closeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.closeMenu();
            });
        }

        // Cerrar menú al hacer clic en los enlaces
        this.menuLinks.forEach(link => {
            link.addEventListener('click', () => {
                setTimeout(() => this.closeMenu(), 150);
            });
        });

        // Cerrar menú con tecla Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.closeMenu();
            }
        });

        // Cerrar menú al hacer clic fuera
        document.addEventListener('click', (e) => {
            if (this.isOpen && !this.menu.contains(e.target) && !this.hamburger.contains(e.target)) {
                this.closeMenu();
            }
        });
    }

    setupStyles() {
        // Asegurar que los estilos base estén aplicados
        if (this.menu) {
            // Solo aplicar estilos críticos para evitar conflictos
            this.menu.style.border = 'none';
            this.menu.style.boxShadow = '-2px 0 10px rgba(0, 0, 0, 0.3)';
        }

        if (this.hamburger) {
            this.hamburger.style.cssText = `
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                width: 32px;
                height: 32px;
                background: transparent;
                border: none;
                cursor: pointer;
                padding: 4px;
                z-index: 10000;
                position: relative;
            `;

            // Estilos para las líneas del hamburger
            const spans = this.hamburger.querySelectorAll('span');
            spans.forEach((span, index) => {
                span.style.cssText = `
                    display: block;
                    width: 24px;
                    height: 2px;
                    background: #00d4ff;
                    margin: 2px 0;
                    transition: all 0.3s ease;
                    transform-origin: center;
                `;
            });
        }
    }

    toggleMenu() {
        if (this.isOpen) {
            this.closeMenu();
        } else {
            this.openMenu();
        }
    }

    openMenu() {
        if (!this.menu || this.isOpen) return;

        this.isOpen = true;
        
        // Mostrar menú
        this.menu.style.right = '0';
        this.menu.classList.add('active');
        
        // Animar hamburger
        this.animateHamburger(true);
        
        // Prevenir scroll del body
        document.body.style.overflow = 'hidden';
        
        // Crear overlay
        this.createOverlay();
        
        console.log('📱 Mobile menu opened');
    }

    closeMenu() {
        if (!this.menu || !this.isOpen) return;

        this.isOpen = false;
        
        // Ocultar menú
        this.menu.style.right = '-100%';
        this.menu.classList.remove('active');
        
        // Animar hamburger
        this.animateHamburger(false);
        
        // Restaurar scroll del body
        document.body.style.overflow = '';
        
        // Remover overlay
        this.removeOverlay();
        
        console.log('📱 Mobile menu closed');
    }

    animateHamburger(isOpen) {
        const spans = this.hamburger.querySelectorAll('span');
        
        if (isOpen) {
            // Transformar a X
            spans[0].style.transform = 'rotate(45deg) translate(6px, 6px)';
            spans[1].style.opacity = '0';
            spans[2].style.transform = 'rotate(-45deg) translate(6px, -6px)';
            this.hamburger.classList.add('active');
        } else {
            // Volver a hamburger
            spans[0].style.transform = 'none';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'none';
            this.hamburger.classList.remove('active');
        }
    }

    createOverlay() {
        // Remover overlay existente si hay uno
        this.removeOverlay();
        
        const overlay = document.createElement('div');
        overlay.id = 'mobileMenuOverlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            z-index: 9998;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;
        
        document.body.appendChild(overlay);
        
        // Fade in
        setTimeout(() => {
            overlay.style.opacity = '1';
        }, 10);
        
        // Cerrar al hacer clic en overlay
        overlay.addEventListener('click', () => this.closeMenu());
    }

    removeOverlay() {
        const overlay = document.getElementById('mobileMenuOverlay');
        if (overlay) {
            overlay.style.opacity = '0';
            setTimeout(() => {
                if (overlay.parentNode) {
                    overlay.parentNode.removeChild(overlay);
                }
            }, 300);
        }
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.mobileMenuFix = new MobileMenuFix();
});

// También inicializar si el DOM ya está listo
if (document.readyState !== 'loading') {
    window.mobileMenuFix = new MobileMenuFix();
}
