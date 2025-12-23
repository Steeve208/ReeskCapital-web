/* ===== MINING PLATFORM - MÓVIL APP JAVASCRIPT ===== */
/* Funcionalidades móviles: navegación, swipe, gestures, etc. */

class MiningMobileApp {
    constructor() {
        this.isMobile = window.innerWidth <= 768;
        this.currentPage = this.getCurrentPage();
        this.swipeStartX = 0;
        this.swipeStartY = 0;
        this.swipeThreshold = 50;
        this.sidebarOpen = false;
        this.modalOpen = false;
        
        this.init();
    }
    
    init() {
        if (!this.isMobile) return;
        
        this.createBottomNavigation();
        this.createMobileTopbar();
        this.setupSwipeGestures();
        this.setupTouchInteractions();
        this.setupPullToRefresh();
        this.setupSafeAreas();
        this.updateActiveNavItem();
        this.setupUserDataListener();
        
        // Listeners
        window.addEventListener('resize', () => this.handleResize());
        window.addEventListener('orientationchange', () => this.handleOrientationChange());
    }
    
    setupUserDataListener() {
        // Escuchar cuando se actualicen los datos del usuario
        // Usar MutationObserver para detectar cambios en los elementos del layout
        const observer = new MutationObserver(() => {
            this.updateMobileUserData();
        });
        
        // Observar cambios en los elementos de usuario del layout principal
        const userNameEl = document.getElementById('userName');
        const userBalanceEl = document.getElementById('userBalance');
        
        if (userNameEl) {
            observer.observe(userNameEl, { childList: true, characterData: true, subtree: true });
        }
        if (userBalanceEl) {
            observer.observe(userBalanceEl, { childList: true, characterData: true, subtree: true });
        }
        
        // También actualizar periódicamente (cada 5 segundos) por si acaso
        setInterval(() => {
            this.updateMobileUserData();
        }, 5000);
    }
    
    getCurrentPage() {
        const path = window.location.pathname;
        if (path.includes('dashboard')) return 'dashboard';
        if (path.includes('control')) return 'control';
        if (path.includes('analytics')) return 'analytics';
        if (path.includes('earnings')) return 'earnings';
        if (path.includes('transactions')) return 'transactions';
        if (path.includes('pools')) return 'pools';
        if (path.includes('referrals')) return 'referrals';
        if (path.includes('events')) return 'events';
        if (path.includes('settings')) return 'settings';
        if (path.includes('api')) return 'api';
        if (path.includes('support')) return 'support';
        return 'dashboard';
    }
    
    createBottomNavigation() {
        // Verificar si ya existe
        if (document.getElementById('mobileBottomNav')) return;
        
        const nav = document.createElement('nav');
        nav.className = 'mobile-bottom-nav';
        nav.id = 'mobileBottomNav';
        
        const navList = document.createElement('ul');
        navList.className = 'mobile-bottom-nav-list';
        
        const navItems = [
            { id: 'dashboard', icon: 'fas fa-chart-line', label: 'Dashboard', href: 'dashboard.html', badge: null },
            { id: 'control', icon: 'fas fa-play-circle', label: 'Control', href: 'control.html', badge: null },
            { id: 'analytics', icon: 'fas fa-chart-bar', label: 'Analytics', href: 'analytics.html', badge: null },
            { id: 'earnings', icon: 'fas fa-coins', label: 'Earnings', href: 'earnings.html', badge: null },
            { id: 'more', icon: 'fas fa-ellipsis-h', label: 'More', href: '#', badge: null }
        ];
        
        navItems.forEach(item => {
            const li = document.createElement('li');
            li.className = 'mobile-bottom-nav-item';
            if (item.id === this.currentPage) {
                li.classList.add('active');
            }
            
            li.innerHTML = `
                <i class="${item.icon} mobile-bottom-nav-icon"></i>
                <span class="mobile-bottom-nav-label">${item.label}</span>
                ${item.badge ? `<span class="mobile-bottom-nav-badge">${item.badge}</span>` : ''}
            `;
            
            li.addEventListener('click', (e) => {
                e.preventDefault();
                if (item.id === 'more') {
                    this.openMoreMenu();
                } else {
                    this.navigateToPage(item.href);
                }
            });
            
            navList.appendChild(li);
        });
        
        nav.appendChild(navList);
        document.body.appendChild(nav);
    }
    
    createMobileTopbar() {
        // Verificar si ya existe
        if (document.getElementById('mobileTopbar')) return;
        
        const topbar = document.createElement('header');
        topbar.className = 'mobile-topbar';
        topbar.id = 'mobileTopbar';
        
        topbar.innerHTML = `
            <div class="mobile-topbar-content">
                <div class="mobile-topbar-left">
                    <button class="mobile-menu-btn" id="mobileMenuBtn">
                        <i class="fas fa-bars"></i>
                    </button>
                    <div class="mobile-logo-compact">
                        <div class="mobile-logo-icon">
                            <img src="../../assets/img/rsc-logo-quantum.svg" alt="RSC">
                        </div>
                        <span class="mobile-logo-text">RSC Mining</span>
                    </div>
                </div>
                <div class="mobile-topbar-right">
                    <button class="mobile-notification-btn" id="mobileNotificationBtn">
                        <i class="fas fa-bell"></i>
                        <span class="mobile-notification-badge">3</span>
                    </button>
                    <div class="mobile-user-avatar" id="mobileUserAvatar">
                        <i class="fas fa-user"></i>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertBefore(topbar, document.body.firstChild);
        
        // Event listeners
        document.getElementById('mobileMenuBtn').addEventListener('click', () => this.toggleSidebar());
        document.getElementById('mobileNotificationBtn').addEventListener('click', () => this.openNotifications());
        document.getElementById('mobileUserAvatar').addEventListener('click', () => this.openUserMenu());
    }
    
    toggleSidebar() {
        this.sidebarOpen = !this.sidebarOpen;
        const drawer = document.getElementById('mobileSidebarDrawer');
        const overlay = document.getElementById('mobileOverlay');
        
        if (!drawer) {
            this.createSidebarDrawer();
            return;
        }
        
        if (this.sidebarOpen) {
            drawer.classList.add('active');
            if (overlay) overlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        } else {
            drawer.classList.remove('active');
            if (overlay) overlay.classList.remove('active');
            document.body.style.overflow = '';
        }
    }
    
    createSidebarDrawer() {
        const overlay = document.createElement('div');
        overlay.className = 'mobile-overlay';
        overlay.id = 'mobileOverlay';
        overlay.addEventListener('click', () => this.toggleSidebar());
        
        const drawer = document.createElement('div');
        drawer.className = 'mobile-sidebar-drawer';
        drawer.id = 'mobileSidebarDrawer';
        
        drawer.innerHTML = `
            <div class="mobile-sidebar-header">
                <div class="mobile-sidebar-user">
                    <div class="mobile-user-avatar">
                        <i class="fas fa-user"></i>
                    </div>
                    <div>
                        <div class="user-name" id="mobileUserName">Usuario</div>
                        <div class="user-balance" id="mobileUserBalance">0.000000 RSC</div>
                    </div>
                </div>
                <button class="mobile-modal-close" id="mobileSidebarClose">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <nav class="mobile-sidebar-nav">
                <a href="dashboard.html" class="mobile-sidebar-nav-item ${this.currentPage === 'dashboard' ? 'active' : ''}" data-page="dashboard">
                    <i class="fas fa-chart-line"></i>
                    <span>Dashboard</span>
                </a>
                <a href="control.html" class="mobile-sidebar-nav-item ${this.currentPage === 'control' ? 'active' : ''}" data-page="control">
                    <i class="fas fa-play-circle"></i>
                    <span>Mining Control</span>
                </a>
                <a href="analytics.html" class="mobile-sidebar-nav-item ${this.currentPage === 'analytics' ? 'active' : ''}" data-page="analytics">
                    <i class="fas fa-chart-bar"></i>
                    <span>Analytics</span>
                </a>
                <a href="earnings.html" class="mobile-sidebar-nav-item ${this.currentPage === 'earnings' ? 'active' : ''}" data-page="earnings">
                    <i class="fas fa-coins"></i>
                    <span>Earnings</span>
                </a>
                <a href="transactions.html" class="mobile-sidebar-nav-item ${this.currentPage === 'transactions' ? 'active' : ''}" data-page="transactions">
                    <i class="fas fa-exchange-alt"></i>
                    <span>Transactions</span>
                </a>
                <a href="pools.html" class="mobile-sidebar-nav-item ${this.currentPage === 'pools' ? 'active' : ''}" data-page="pools">
                    <i class="fas fa-swimming-pool"></i>
                    <span>Pool Management</span>
                </a>
                <a href="referrals.html" class="mobile-sidebar-nav-item ${this.currentPage === 'referrals' ? 'active' : ''}" data-page="referrals">
                    <i class="fas fa-users"></i>
                    <span>Referrals</span>
                </a>
                <a href="events.html" class="mobile-sidebar-nav-item ${this.currentPage === 'events' ? 'active' : ''}" data-page="events">
                    <i class="fas fa-calendar-star"></i>
                    <span>Events</span>
                </a>
                <a href="settings.html" class="mobile-sidebar-nav-item ${this.currentPage === 'settings' ? 'active' : ''}" data-page="settings">
                    <i class="fas fa-cog"></i>
                    <span>Settings</span>
                </a>
                <a href="api.html" class="mobile-sidebar-nav-item ${this.currentPage === 'api' ? 'active' : ''}" data-page="api">
                    <i class="fas fa-code"></i>
                    <span>API & Integrations</span>
                </a>
                <a href="support.html" class="mobile-sidebar-nav-item ${this.currentPage === 'support' ? 'active' : ''}" data-page="support">
                    <i class="fas fa-life-ring"></i>
                    <span>Support</span>
                </a>
            </nav>
        `;
        
        document.body.appendChild(overlay);
        document.body.appendChild(drawer);
        
        // Close button
        document.getElementById('mobileSidebarClose').addEventListener('click', () => this.toggleSidebar());
        
        // Nav items
        drawer.querySelectorAll('.mobile-sidebar-nav-item').forEach(item => {
            item.addEventListener('click', () => {
                this.toggleSidebar();
            });
        });
        
        // Actualizar datos del usuario si ya están disponibles
        this.updateMobileUserData();
        
        this.sidebarOpen = true;
        drawer.classList.add('active');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    
    updateMobileUserData() {
        // Intentar obtener datos del usuario desde los elementos del layout principal
        const mobileUserNameEl = document.getElementById('mobileUserName');
        const mobileUserBalanceEl = document.getElementById('mobileUserBalance');
        
        if (!mobileUserNameEl || !mobileUserBalanceEl) return;
        
        // Primero intentar obtener desde los elementos del layout principal (si ya están actualizados)
        const layoutUserNameEl = document.getElementById('userName');
        const layoutUserBalanceEl = document.getElementById('userBalance');
        
        if (layoutUserNameEl && layoutUserNameEl.textContent && layoutUserNameEl.textContent !== 'Usuario') {
            mobileUserNameEl.textContent = layoutUserNameEl.textContent;
        }
        
        if (layoutUserBalanceEl && layoutUserBalanceEl.textContent && layoutUserBalanceEl.textContent !== '0.000000 RSC') {
            mobileUserBalanceEl.textContent = layoutUserBalanceEl.textContent;
        }
        
        // Si no hay datos en el layout, intentar desde localStorage
        if ((!layoutUserNameEl || layoutUserNameEl.textContent === 'Usuario') && 
            (!layoutUserBalanceEl || layoutUserBalanceEl.textContent === '0.000000 RSC')) {
            try {
                const cachedData = localStorage.getItem('mining_user_profile');
                if (cachedData) {
                    const userData = JSON.parse(cachedData);
                    const userName = userData.username || (userData.email ? userData.email.split('@')[0] : 'Usuario');
                    const balance = parseFloat(userData.balance || 0);
                    
                    if (!mobileUserNameEl.textContent || mobileUserNameEl.textContent === 'Usuario') {
                        mobileUserNameEl.textContent = userName;
                    }
                    if (!mobileUserBalanceEl.textContent || mobileUserBalanceEl.textContent === '0.000000 RSC') {
                        mobileUserBalanceEl.textContent = `${balance.toFixed(6)} RSC`;
                    }
                }
            } catch (error) {
                console.warn('Error cargando datos del usuario para menú móvil:', error);
            }
        }
    }
    
    openMoreMenu() {
        // Crear modal con opciones adicionales
        const modal = document.createElement('div');
        modal.className = 'mobile-modal';
        modal.id = 'mobileMoreModal';
        
        modal.innerHTML = `
            <div class="mobile-modal-header">
                <h2 class="mobile-modal-title">More Options</h2>
                <button class="mobile-modal-close" id="mobileMoreModalClose">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="mobile-modal-content">
                <a href="transactions.html" class="mobile-sidebar-nav-item">
                    <i class="fas fa-exchange-alt"></i>
                    <span>Transactions</span>
                </a>
                <a href="pools.html" class="mobile-sidebar-nav-item">
                    <i class="fas fa-swimming-pool"></i>
                    <span>Pool Management</span>
                </a>
                <a href="referrals.html" class="mobile-sidebar-nav-item">
                    <i class="fas fa-users"></i>
                    <span>Referrals</span>
                </a>
                <a href="settings.html" class="mobile-sidebar-nav-item">
                    <i class="fas fa-cog"></i>
                    <span>Settings</span>
                </a>
                <a href="api.html" class="mobile-sidebar-nav-item">
                    <i class="fas fa-code"></i>
                    <span>API & Integrations</span>
                </a>
                <a href="support.html" class="mobile-sidebar-nav-item">
                    <i class="fas fa-life-ring"></i>
                    <span>Support</span>
                </a>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        document.getElementById('mobileMoreModalClose').addEventListener('click', () => {
            modal.classList.remove('active');
            setTimeout(() => modal.remove(), 300);
        });
        
        modal.querySelectorAll('.mobile-sidebar-nav-item').forEach(item => {
            item.addEventListener('click', () => {
                modal.classList.remove('active');
                setTimeout(() => modal.remove(), 300);
            });
        });
        
        setTimeout(() => modal.classList.add('active'), 10);
    }
    
    openNotifications() {
        // Implementar panel de notificaciones móvil
        console.log('Open notifications');
    }
    
    openUserMenu() {
        // Implementar menú de usuario móvil
        console.log('Open user menu');
    }
    
    navigateToPage(href) {
        if (href === '#' || href === window.location.pathname) return;
        
        // Animación de transición
        document.body.style.opacity = '0.7';
        
        setTimeout(() => {
            window.location.href = href;
        }, 150);
    }
    
    updateActiveNavItem() {
        const navItems = document.querySelectorAll('.mobile-bottom-nav-item');
        navItems.forEach(item => {
            item.classList.remove('active');
            const icon = item.querySelector('.mobile-bottom-nav-icon');
            if (icon) {
                const iconClass = icon.className;
                if (iconClass.includes('chart-line') && this.currentPage === 'dashboard') {
                    item.classList.add('active');
                } else if (iconClass.includes('play-circle') && this.currentPage === 'control') {
                    item.classList.add('active');
                } else if (iconClass.includes('chart-bar') && this.currentPage === 'analytics') {
                    item.classList.add('active');
                } else if (iconClass.includes('coins') && this.currentPage === 'earnings') {
                    item.classList.add('active');
                }
            }
        });
    }
    
    setupSwipeGestures() {
        let touchStartX = 0;
        let touchStartY = 0;
        let touchEndX = 0;
        let touchEndY = 0;
        
        document.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
            touchStartY = e.changedTouches[0].screenY;
        }, { passive: true });
        
        document.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            touchEndY = e.changedTouches[0].screenY;
            this.handleSwipe(touchStartX, touchStartY, touchEndX, touchEndY);
        }, { passive: true });
    }
    
    handleSwipe(startX, startY, endX, endY) {
        const deltaX = endX - startX;
        const deltaY = endY - startY;
        const absDeltaX = Math.abs(deltaX);
        const absDeltaY = Math.abs(deltaY);
        
        // Swipe horizontal (más de 50px y más horizontal que vertical)
        if (absDeltaX > this.swipeThreshold && absDeltaX > absDeltaY) {
            if (deltaX > 0) {
                // Swipe right - abrir sidebar
                if (!this.sidebarOpen && startX < 20) {
                    this.toggleSidebar();
                }
            } else {
                // Swipe left - cerrar sidebar
                if (this.sidebarOpen) {
                    this.toggleSidebar();
                }
            }
        }
    }
    
    setupTouchInteractions() {
        // Mejorar feedback táctil
        const touchElements = document.querySelectorAll('.mobile-card, .mobile-btn, .mobile-stat-card');
        
        touchElements.forEach(element => {
            element.addEventListener('touchstart', function() {
                this.style.transform = 'scale(0.98)';
            }, { passive: true });
            
            element.addEventListener('touchend', function() {
                setTimeout(() => {
                    this.style.transform = '';
                }, 150);
            }, { passive: true });
        });
    }
    
    setupPullToRefresh() {
        // Implementación básica de pull to refresh
        let startY = 0;
        let currentY = 0;
        let pulling = false;
        
        const mainContent = document.querySelector('.mining-content') || document.body;
        
        mainContent.addEventListener('touchstart', (e) => {
            if (window.scrollY === 0) {
                startY = e.touches[0].clientY;
                pulling = true;
            }
        }, { passive: true });
        
        mainContent.addEventListener('touchmove', (e) => {
            if (pulling && window.scrollY === 0) {
                currentY = e.touches[0].clientY;
                const pullDistance = currentY - startY;
                
                if (pullDistance > 0 && pullDistance < 100) {
                    // Mostrar indicador de pull to refresh
                    // Puedes agregar un indicador visual aquí
                }
            }
        }, { passive: true });
        
        mainContent.addEventListener('touchend', () => {
            if (pulling) {
                const pullDistance = currentY - startY;
                if (pullDistance > 80) {
                    // Recargar datos
                    window.location.reload();
                }
                pulling = false;
            }
        }, { passive: true });
    }
    
    setupSafeAreas() {
        // Asegurar que el contenido respete las safe areas en dispositivos con notch
        const style = document.createElement('style');
        style.textContent = `
            @supports (padding: max(0px)) {
                .mobile-bottom-nav {
                    padding-bottom: max(env(safe-area-inset-bottom), 8px);
                }
                .mobile-topbar {
                    padding-top: max(env(safe-area-inset-top), 0px);
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    handleResize() {
        const wasMobile = this.isMobile;
        this.isMobile = window.innerWidth <= 768;
        
        if (wasMobile !== this.isMobile) {
            // Recargar si cambió el estado móvil
            window.location.reload();
        }
    }
    
    handleOrientationChange() {
        // Ajustar layout cuando cambia la orientación
        setTimeout(() => {
            window.scrollTo(0, 0);
            // Forzar reflow
            document.body.offsetHeight;
        }, 100);
    }
}

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new MiningMobileApp();
    });
} else {
    new MiningMobileApp();
}

// Exportar para uso global
window.MiningMobileApp = MiningMobileApp;

