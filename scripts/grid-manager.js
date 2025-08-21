// ===== GESTOR DEL SISTEMA DE GRID - FASE 1 =====

class GridManager {
    constructor() {
        this.currentBreakpoint = 'xs';
        this.breakpoints = {
            xs: 320,
            sm: 480,
            md: 768,
            lg: 1024,
            xl: 1200,
            '2xl': 1440,
            '3xl': 1920
        };
        this.gridContainers = new Map();
        this.init();
    }

    init() {
        this.detectBreakpoint();
        this.setupEventListeners();
        this.initializeGridContainers();
        this.setupResizeObserver();
        this.applyGridClasses();
    }

    detectBreakpoint() {
        const width = window.innerWidth;
        
        if (width >= this.breakpoints['3xl']) {
            this.currentBreakpoint = '3xl';
        } else if (width >= this.breakpoints['2xl']) {
            this.currentBreakpoint = '2xl';
        } else if (width >= this.breakpoints.xl) {
            this.currentBreakpoint = 'xl';
        } else if (width >= this.breakpoints.lg) {
            this.currentBreakpoint = 'lg';
        } else if (width >= this.breakpoints.md) {
            this.currentBreakpoint = 'md';
        } else if (width >= this.breakpoints.sm) {
            this.currentBreakpoint = 'sm';
        } else {
            this.currentBreakpoint = 'xs';
        }
    }

    setupEventListeners() {
        // Escuchar cambios de tamaño de ventana
        window.addEventListener('resize', this.debounce(() => {
            this.detectBreakpoint();
            this.updateGridLayouts();
        }, 250));

        // Escuchar cambios de orientación
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                this.detectBreakpoint();
                this.updateGridLayouts();
            }, 100);
        });

        // Escuchar cambios en las preferencias del usuario
        this.setupMediaQueryListeners();
    }

    setupMediaQueryListeners() {
        // Reducir movimiento
        const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        reducedMotionQuery.addEventListener('change', (e) => {
            this.toggleReducedMotion(e.matches);
        });

        // Modo oscuro
        const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
        darkModeQuery.addEventListener('change', (e) => {
            this.toggleDarkMode(e.matches);
        });
    }

    setupResizeObserver() {
        // Observar cambios en el tamaño de los contenedores
        if ('ResizeObserver' in window) {
            this.resizeObserver = new ResizeObserver(entries => {
                entries.forEach(entry => {
                    this.handleContainerResize(entry);
                });
            });
        }
    }

    initializeGridContainers() {
        // Encontrar todos los contenedores de grid
        const gridElements = document.querySelectorAll('.grid, .grid-2, .grid-3, .grid-4, .grid-6, .grid-8, .grid-12');
        
        gridElements.forEach((element, index) => {
            const containerId = `grid-${index}`;
            this.gridContainers.set(containerId, {
                element: element,
                type: this.getGridType(element),
                breakpoint: this.currentBreakpoint,
                columns: this.getGridColumns(element)
            });
            
            // Aplicar clases de grid item
            this.applyGridItemClasses(element);
        });
    }

    getGridType(element) {
        if (element.classList.contains('grid-2')) return 'grid-2';
        if (element.classList.contains('grid-3')) return 'grid-3';
        if (element.classList.contains('grid-4')) return 'grid-4';
        if (element.classList.contains('grid-6')) return 'grid-6';
        if (element.classList.contains('grid-8')) return 'grid-8';
        if (element.classList.contains('grid-12')) return 'grid-12';
        if (element.classList.contains('grid-auto-fit')) return 'auto-fit';
        if (element.classList.contains('grid-auto-fill')) return 'auto-fill';
        if (element.classList.contains('grid-responsive')) return 'responsive';
        if (element.classList.contains('grid-masonry')) return 'masonry';
        return 'default';
    }

    getGridColumns(element) {
        const computedStyle = window.getComputedStyle(element);
        return computedStyle.gridTemplateColumns.split(' ').length;
    }

    applyGridItemClasses(element) {
        const children = element.children;
        Array.from(children).forEach((child, index) => {
            child.classList.add('grid-item');
            
            // Añadir clases específicas según el tipo de grid
            if (element.classList.contains('grid-masonry')) {
                child.classList.add('masonry-item');
            }
            
            // Añadir clases de animación
            if (!this.isReducedMotion()) {
                child.style.animationDelay = `${index * 0.1}s`;
            }
        });
    }

    updateGridLayouts() {
        this.gridContainers.forEach((container, id) => {
            const { element, type } = container;
            
            // Actualizar breakpoint
            container.breakpoint = this.currentBreakpoint;
            
            // Aplicar clases responsive
            this.applyResponsiveClasses(element, type);
            
            // Actualizar columnas
            container.columns = this.getGridColumns(element);
            
            // Aplicar optimizaciones específicas del breakpoint
            this.applyBreakpointOptimizations(element, this.currentBreakpoint);
        });
    }

    applyResponsiveClasses(element, type) {
        // Remover clases de breakpoint anteriores
        element.classList.remove('grid-xs', 'grid-sm', 'grid-md', 'grid-lg', 'grid-xl', 'grid-2xl', 'grid-3xl');
        
        // Añadir clase del breakpoint actual
        element.classList.add(`grid-${this.currentBreakpoint}`);
        
        // Aplicar clases específicas según el tipo y breakpoint
        switch (type) {
            case 'grid-2':
                this.applyGrid2Responsive(element);
                break;
            case 'grid-3':
                this.applyGrid3Responsive(element);
                break;
            case 'grid-4':
                this.applyGrid4Responsive(element);
                break;
            case 'auto-fit':
                this.applyAutoFitResponsive(element);
                break;
            case 'responsive':
                this.applyResponsiveGrid(element);
                break;
            case 'masonry':
                this.applyMasonryResponsive(element);
                break;
        }
    }

    applyGrid2Responsive(element) {
        // En móvil, cambiar a 1 columna
        if (this.currentBreakpoint === 'xs' || this.currentBreakpoint === 'sm') {
            element.style.gridTemplateColumns = '1fr';
        } else {
            element.style.gridTemplateColumns = 'repeat(2, 1fr)';
        }
    }

    applyGrid3Responsive(element) {
        if (this.currentBreakpoint === 'xs') {
            element.style.gridTemplateColumns = '1fr';
        } else if (this.currentBreakpoint === 'sm' || this.currentBreakpoint === 'md') {
            element.style.gridTemplateColumns = 'repeat(2, 1fr)';
        } else {
            element.style.gridTemplateColumns = 'repeat(3, 1fr)';
        }
    }

    applyGrid4Responsive(element) {
        if (this.currentBreakpoint === 'xs') {
            element.style.gridTemplateColumns = '1fr';
        } else if (this.currentBreakpoint === 'sm') {
            element.style.gridTemplateColumns = 'repeat(2, 1fr)';
        } else if (this.currentBreakpoint === 'md') {
            element.style.gridTemplateColumns = 'repeat(3, 1fr)';
        } else {
            element.style.gridTemplateColumns = 'repeat(4, 1fr)';
        }
    }

    applyAutoFitResponsive(element) {
        const minWidth = this.getAutoFitMinWidth();
        element.style.gridTemplateColumns = `repeat(auto-fit, minmax(${minWidth}px, 1fr))`;
    }

    applyResponsiveGrid(element) {
        const minWidth = this.getResponsiveMinWidth();
        element.style.gridTemplateColumns = `repeat(auto-fit, minmax(${minWidth}px, 1fr))`;
    }

    applyMasonryResponsive(element) {
        const minWidth = this.getMasonryMinWidth();
        element.style.gridTemplateColumns = `repeat(auto-fill, minmax(${minWidth}px, 1fr))`;
    }

    getAutoFitMinWidth() {
        switch (this.currentBreakpoint) {
            case 'xs': return 250;
            case 'sm': return 280;
            case 'md': return 300;
            case 'lg': return 320;
            case 'xl': return 350;
            case '2xl': return 380;
            case '3xl': return 400;
            default: return 300;
        }
    }

    getResponsiveMinWidth() {
        switch (this.currentBreakpoint) {
            case 'xs': return 280;
            case 'sm': return 320;
            case 'md': return 350;
            case 'lg': return 380;
            case 'xl': return 400;
            case '2xl': return 450;
            case '3xl': return 500;
            default: return 350;
        }
    }

    getMasonryMinWidth() {
        switch (this.currentBreakpoint) {
            case 'xs': return 250;
            case 'sm': return 280;
            case 'md': return 300;
            case 'lg': return 320;
            case 'xl': return 350;
            case '2xl': return 380;
            case '3xl': return 400;
            default: return 300;
        }
    }

    applyBreakpointOptimizations(element, breakpoint) {
        // Optimizaciones específicas para cada breakpoint
        switch (breakpoint) {
            case 'xs':
                this.optimizeForMobile(element);
                break;
            case 'sm':
                this.optimizeForMobileLarge(element);
                break;
            case 'md':
                this.optimizeForTablet(element);
                break;
            case 'lg':
                this.optimizeForDesktop(element);
                break;
            case 'xl':
            case '2xl':
            case '3xl':
                this.optimizeForLargeScreens(element);
                break;
        }
    }

    optimizeForMobile(element) {
        // Reducir gaps y padding en móvil
        element.style.gap = '0.5rem';
        element.style.padding = '0.5rem';
        
        // Simplificar animaciones
        if (element.classList.contains('grid-item')) {
            element.style.animation = 'none';
            element.style.transition = 'transform 0.2s ease';
        }
    }

    optimizeForMobileLarge(element) {
        element.style.gap = '1rem';
        element.style.padding = '1rem';
    }

    optimizeForTablet(element) {
        element.style.gap = '1.5rem';
        element.style.padding = '1.5rem';
    }

    optimizeForDesktop(element) {
        element.style.gap = '2rem';
        element.style.padding = '2rem';
    }

    optimizeForLargeScreens(element) {
        element.style.gap = '3rem';
        element.style.padding = '2.5rem';
    }

    handleContainerResize(entry) {
        const element = entry.target;
        const containerId = this.findContainerId(element);
        
        if (containerId) {
            const container = this.gridContainers.get(containerId);
            if (container) {
                container.columns = this.getGridColumns(element);
                this.updateGridLayouts();
            }
        }
    }

    findContainerId(element) {
        for (const [id, container] of this.gridContainers) {
            if (container.element === element) {
                return id;
            }
        }
        return null;
    }

    toggleReducedMotion(reduced) {
        if (reduced) {
            document.body.classList.add('reduced-motion');
            this.disableAnimations();
        } else {
            document.body.classList.remove('reduced-motion');
            this.enableAnimations();
        }
    }

    toggleDarkMode(dark) {
        if (dark) {
            document.body.classList.add('dark-mode-preference');
        } else {
            document.body.classList.remove('dark-mode-preference');
        }
    }

    disableAnimations() {
        const animatedElements = document.querySelectorAll('.grid-item');
        animatedElements.forEach(element => {
            element.style.animation = 'none';
            element.style.transition = 'none';
        });
    }

    enableAnimations() {
        const animatedElements = document.querySelectorAll('.grid-item');
        animatedElements.forEach((element, index) => {
            element.style.animation = 'gridItemFadeIn 0.6s ease forwards';
            element.style.animationDelay = `${index * 0.1}s`;
        });
    }

    isReducedMotion() {
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    // Métodos públicos para manipular grids dinámicamente
    createGrid(container, type = 'default', options = {}) {
        const gridId = `grid-${Date.now()}`;
        const gridElement = document.createElement('div');
        
        gridElement.className = `grid ${type}`;
        gridElement.id = gridId;
        
        // Aplicar opciones
        if (options.columns) {
            gridElement.style.gridTemplateColumns = `repeat(${options.columns}, 1fr)`;
        }
        
        if (options.gap) {
            gridElement.style.gap = options.gap;
        }
        
        container.appendChild(gridElement);
        
        // Registrar en el gestor
        this.gridContainers.set(gridId, {
            element: gridElement,
            type: type,
            breakpoint: this.currentBreakpoint,
            columns: options.columns || 1
        });
        
        return gridElement;
    }

    addGridItem(gridElement, content, options = {}) {
        const item = document.createElement('div');
        item.className = 'grid-item';
        
        if (typeof content === 'string') {
            item.innerHTML = content;
        } else if (content instanceof HTMLElement) {
            item.appendChild(content);
        }
        
        // Aplicar opciones
        if (options.className) {
            item.classList.add(options.className);
        }
        
        if (options.style) {
            Object.assign(item.style, options.style);
        }
        
        gridElement.appendChild(item);
        
        // Aplicar animación
        if (!this.isReducedMotion()) {
            const items = gridElement.querySelectorAll('.grid-item');
            const index = items.length - 1;
            item.style.animationDelay = `${index * 0.1}s`;
        }
        
        return item;
    }

    removeGridItem(gridElement, item) {
        if (item.parentNode === gridElement) {
            item.remove();
            this.reorderGridItems(gridElement);
        }
    }

    reorderGridItems(gridElement) {
        const items = gridElement.querySelectorAll('.grid-item');
        items.forEach((item, index) => {
            if (!this.isReducedMotion()) {
                item.style.animationDelay = `${index * 0.1}s`;
            }
        });
    }

    // Método para debug
    debugGrid() {
        console.log('=== GRID MANAGER DEBUG ===');
        console.log('Current Breakpoint:', this.currentBreakpoint);
        console.log('Grid Containers:', this.gridContainers);
        
        this.gridContainers.forEach((container, id) => {
            console.log(`Container ${id}:`, {
                type: container.type,
                breakpoint: container.breakpoint,
                columns: container.columns,
                element: container.element
            });
        });
    }

    // Utilidad para debounce
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

    // Método para obtener información del grid actual
    getGridInfo() {
        return {
            currentBreakpoint: this.currentBreakpoint,
            totalContainers: this.gridContainers.size,
            containers: Array.from(this.gridContainers.entries()).map(([id, container]) => ({
                id,
                type: container.type,
                breakpoint: container.breakpoint,
                columns: container.columns
            }))
        };
    }
}

// ===== INICIALIZACIÓN AUTOMÁTICA =====

// Crear instancia global
window.gridManager = new GridManager();

// Exportar para uso en módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GridManager;
}

// ===== UTILIDADES ADICIONALES =====

// Función para crear grids rápidamente
window.createQuickGrid = (container, items, options = {}) => {
    const grid = window.gridManager.createGrid(container, options.type || 'grid-responsive', options);
    
    items.forEach(item => {
        window.gridManager.addGridItem(grid, item, options.itemOptions);
    });
    
    return grid;
};

// Función para hacer un elemento responsive
window.makeResponsive = (element, breakpoints = {}) => {
    const defaultBreakpoints = {
        xs: { columns: 1, gap: '0.5rem' },
        sm: { columns: 2, gap: '1rem' },
        md: { columns: 3, gap: '1.5rem' },
        lg: { columns: 4, gap: '2rem' },
        xl: { columns: 6, gap: '3rem' }
    };
    
    const config = { ...defaultBreakpoints, ...breakpoints };
    
    Object.entries(config).forEach(([breakpoint, settings]) => {
        const mediaQuery = window.gridManager.breakpoints[breakpoint];
        if (mediaQuery) {
            const style = document.createElement('style');
            style.textContent = `
                @media (min-width: ${mediaQuery}px) {
                    #${element.id} {
                        grid-template-columns: repeat(${settings.columns}, 1fr) !important;
                        gap: ${settings.gap} !important;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    });
};

// Función para detectar si un elemento está en viewport
window.isInViewport = (element) => {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
};

// Función para lazy loading de grids
window.lazyLoadGrid = (gridElement, items, options = {}) => {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                items.forEach(item => {
                    window.gridManager.addGridItem(gridElement, item, options.itemOptions);
                });
                observer.unobserve(gridElement);
            }
        });
    });
    
    observer.observe(gridElement);
};
