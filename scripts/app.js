/* ================================
   APP.JS — APLICACIÓN PRINCIPAL SIMPLIFICADA
================================ */

// Configuración básica
const APP_CONFIG = {
  API_BASE_URL: 'http://localhost:4000/api',
  THEME: localStorage.getItem('rsc_theme') || 'dark'
};

// Aplicación principal
class RSCApp {
  constructor() {
    this.currentPage = 'home';
    this.isInitialized = false;
    this.init();
  }

  init() {
    try {
      console.log('🚀 Inicializando RSC Chain...');
      
      // Configurar tema
      this.setupTheme();
      
      // Configurar navegación
      this.setupNavigation();
      
      // Configurar notificaciones
      this.setupNotifications();
      
      // Cargar datos iniciales
      this.loadInitialData();
      
      // Configurar event listeners
      this.setupEventListeners();
      
      this.isInitialized = true;
      console.log('✅ RSC Chain inicializado correctamente');
      
      // Mostrar notificación de éxito
      this.showNotification('success', 'Aplicación Lista', 'RSC Chain cargado correctamente');
      
    } catch (error) {
      console.error('❌ Error inicializando:', error);
      this.showNotification('error', 'Error de Inicialización', error.message);
    }
  }

  setupTheme() {
    document.body.className = `${APP_CONFIG.THEME}-mode`;
    
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
      themeToggle.addEventListener('click', () => {
        const currentTheme = document.body.classList.contains('dark-mode') ? 'dark' : 'light';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.body.className = `${newTheme}-mode`;
        localStorage.setItem('rsc_theme', newTheme);
        APP_CONFIG.THEME = newTheme;
        
        // Actualizar icono
        const themeIcon = themeToggle.querySelector('.theme-icon');
        if (themeIcon) {
          themeIcon.textContent = newTheme === 'dark' ? '🌙' : '☀️';
        }
      });
    }
  }

  setupNavigation() {
    // Navegación principal
    const navLinks = document.querySelectorAll('.navbar-links a');
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const href = link.getAttribute('href');
        if (href && href !== '#') {
          this.navigateTo(href);
        }
      });
    });

    // Mobile menu
    const navbarToggle = document.getElementById('navbarToggle');
    const navbar = document.querySelector('.navbar');
    
    if (navbarToggle && navbar) {
      navbarToggle.addEventListener('click', () => {
        navbar.classList.toggle('mobile-open');
      });
    }

    // Language selector
    const languageSelector = document.getElementById('languageSelector');
    if (languageSelector) {
      languageSelector.addEventListener('click', (e) => {
        e.stopPropagation();
        const dropdown = languageSelector.querySelector('.language-dropdown');
        dropdown.classList.toggle('active');
      });
    }
  }

  setupNotifications() {
    // Crear contenedor de notificaciones si no existe
    if (!document.getElementById('notificationsContainer')) {
      const container = document.createElement('div');
      container.id = 'notificationsContainer';
      container.className = 'notifications-container';
      document.body.appendChild(container);
    }
  }

  loadInitialData() {
    // Cargar datos mock para mostrar algo
    const mockData = {
      price: 0.85 + Math.random() * 0.1,
      marketCap: 850000000 + Math.random() * 100000000,
      volume: 15000000 + Math.random() * 5000000,
      miners: 1250 + Math.floor(Math.random() * 100),
      tps: 1500 + Math.floor(Math.random() * 500)
    };

    this.updateStats(mockData);
  }

  updateStats(data) {
    // Actualizar estadísticas en el footer
    const elements = {
      price: document.getElementById('footerPrice'),
      marketCap: document.getElementById('footerMarketCap'),
      volume: document.getElementById('footerVolume'),
      miners: document.getElementById('footerMiners')
    };

    if (elements.price) {
      elements.price.textContent = `$${this.formatNumber(data.price)}`;
    }
    if (elements.marketCap) {
      elements.marketCap.textContent = `$${this.formatNumber(data.marketCap)}`;
    }
    if (elements.volume) {
      elements.volume.textContent = `$${this.formatNumber(data.volume)}`;
    }
    if (elements.miners) {
      elements.miners.textContent = this.formatNumber(data.miners);
    }

    // Actualizar estadísticas en la página principal
    const statsElements = document.querySelectorAll('.stat-value');
    statsElements.forEach((element, index) => {
      switch (index) {
        case 0:
          element.textContent = `$${this.formatNumber(data.price)}`;
          break;
        case 1:
          element.textContent = this.formatNumber(data.marketCap);
          break;
        case 2:
          element.textContent = this.formatNumber(data.tps);
          break;
      }
    });
  }

  setupEventListeners() {
    // Botones de acción
    const actionButtons = document.querySelectorAll('.btn-primary, .btn-secondary, .btn-tertiary');
    actionButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        const action = button.textContent.trim();
        this.handleAction(action);
      });
    });

    // Wallet connect button
    const walletBtn = document.getElementById('walletConnectBtn');
    if (walletBtn) {
      walletBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.navigateTo('/wallet');
      });
    }

    // Cerrar notificaciones al hacer click fuera
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.language-dropdown')) {
        const dropdowns = document.querySelectorAll('.language-dropdown');
        dropdowns.forEach(dropdown => dropdown.classList.remove('active'));
      }
    });
  }

  handleAction(action) {
    switch (action) {
      case 'Crear Wallet':
        this.navigateTo('/wallet');
        break;
      case 'Iniciar Minería':
        this.navigateTo('/mine');
        break;
      case 'Comerciar P2P':
        this.navigateTo('/p2p');
        break;
      default:
        console.log('Acción no reconocida:', action);
    }
  }

  navigateTo(path) {
    try {
      // Si estamos en el mismo dominio, usar navegación normal
      if (path.startsWith('/')) {
        window.location.href = path;
      } else {
        // Para rutas externas
        window.open(path, '_blank');
      }
    } catch (error) {
      console.error('Error navegando a:', path, error);
      this.showNotification('error', 'Error de Navegación', 'No se pudo cargar la página');
    }
  }

  showNotification(type, title, message, duration = 5000) {
    const container = document.getElementById('notificationsContainer');
    if (!container) return;

    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
      <div class="notification-header">
        <span class="notification-title">${title}</span>
        <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
      </div>
      <div class="notification-message">${message}</div>
    `;

    container.appendChild(notification);

    // Auto-remover después del tiempo especificado
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove();
      }
    }, duration);
  }

  formatNumber(num) {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(num || 0);
  }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  window.rscApp = new RSCApp();
});

// Exportar para uso global
window.RSCApp = RSCApp; 