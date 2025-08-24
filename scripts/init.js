/* ================================
   INIT.JS — INICIALIZACIÓN ROBUSTA
================================ */

// Función de inicialización principal
async function initializeRSCApp() {
  try {
    console.log('🚀 Iniciando RSC Chain Web...');
    
    // Verificar dependencias críticas
    await checkDependencies();
    
    // Inicializar componentes en orden
    await initializeComponents();
    
    // Configurar event listeners
    setupGlobalEventListeners();
    
    // Cargar datos iniciales
    await loadInitialData();
    
    // Marcar como inicializado
    window.rscAppInitialized = true;
    
    console.log('✅ RSC Chain Web inicializado correctamente');
    
    // Emitir evento de inicialización
    document.dispatchEvent(new CustomEvent('rsc:initialized'));
    
  } catch (error) {
    console.error('❌ Error en inicialización:', error);
    showErrorNotification('Error al inicializar la aplicación', error.message);
  }
}

// Verificar dependencias críticas
async function checkDependencies() {
  const dependencies = [
    { name: 'Chart.js', check: () => typeof Chart !== 'undefined' },
    { name: 'Three.js', check: () => typeof THREE !== 'undefined' },
    { name: 'DOM', check: () => document.readyState === 'complete' }
  ];
  
  for (const dep of dependencies) {
    if (!dep.check()) {
      throw new Error(`Dependencia faltante: ${dep.name}`);
    }
  }
}

// Inicializar componentes
async function initializeComponents() {
  const components = [
    { name: 'Config', init: () => window.API_CONFIG },
    { name: 'Notifications', init: () => window.showNotification },
    { name: 'Theme', init: () => setupTheme() },
    { name: 'Navigation', init: () => setupNavigation() },
    { name: '3D Hero', init: () => initializeHero3D() },
    { name: 'Charts', init: () => initializeCharts() },
    { name: 'WebSocket', init: () => initializeWebSocket() }
  ];
  
  for (const component of components) {
    try {
      await component.init();
      console.log(`✅ ${component.name} inicializado`);
    } catch (error) {
      console.warn(`⚠️ Error inicializando ${component.name}:`, error);
    }
  }
}

// Configurar tema
function setupTheme() {
  const savedTheme = localStorage.getItem('rsc_theme') || 'dark';
  document.body.className = `${savedTheme}-mode`;
  
  const themeToggle = document.getElementById('themeToggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const currentTheme = document.body.classList.contains('dark-mode') ? 'dark' : 'light';
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      
      document.body.className = `${newTheme}-mode`;
      localStorage.setItem('rsc_theme', newTheme);
      
      // Actualizar icono
      const themeIcon = themeToggle.querySelector('.theme-icon');
      if (themeIcon) {
        themeIcon.textContent = newTheme === 'dark' ? '🌙' : '☀️';
      }
    });
  }
}

// Configurar navegación
function setupNavigation() {
  const navLinks = document.querySelectorAll('.navbar-links a');
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const href = link.getAttribute('href');
      if (href && href !== '#') {
        window.location.href = href;
      }
    });
  });
  
  // Mobile menu toggle
  const navbarToggle = document.getElementById('navbarToggle');
  const navbar = document.querySelector('.navbar');
  
  if (navbarToggle && navbar) {
    navbarToggle.addEventListener('click', () => {
      navbar.classList.toggle('mobile-open');
      navbarToggle.setAttribute('aria-expanded', 
        navbar.classList.contains('mobile-open').toString());
    });
  }
}

// Inicializar Hero 3D
function initializeHero3D() {
  const container = document.getElementById('hero3dContainer');
  if (container && typeof Hero3D !== 'undefined') {
    try {
      window.hero3d = new Hero3D(container);
    } catch (error) {
      console.warn('⚠️ Error inicializando Hero 3D:', error);
    }
  }
}

// Inicializar gráficos
function initializeCharts() {
  if (typeof ChartManager !== 'undefined') {
    try {
      window.chartManager = new ChartManager();
    } catch (error) {
      console.warn('⚠️ Error inicializando Chart Manager:', error);
    }
  }
}

// Inicializar WebSocket
function initializeWebSocket() {
  if (typeof WebSocketManager !== 'undefined') {
    try {
      window.wsManager = new WebSocketManager();
    } catch (error) {
      console.warn('⚠️ Error inicializando WebSocket:', error);
    }
  }
}

// Configurar event listeners globales
function setupGlobalEventListeners() {
  // Resize handler
  window.addEventListener('resize', debounce(() => {
    if (window.hero3d) {
      window.hero3d.onWindowResize();
    }
  }, 250));
  
  // Scroll handler
  window.addEventListener('scroll', debounce(() => {
    if (window.hero3d) {
      window.hero3d.onScroll();
    }
  }, 100));
  
  // Language selector
  const languageSelector = document.getElementById('languageSelector');
  if (languageSelector) {
    languageSelector.addEventListener('click', (e) => {
      e.stopPropagation();
      const dropdown = languageSelector.querySelector('.language-dropdown');
      dropdown.classList.toggle('active');
    });
    
    // Cerrar al hacer click fuera
    document.addEventListener('click', () => {
      const dropdown = languageSelector.querySelector('.language-dropdown');
      dropdown.classList.remove('active');
    });
  }
}

// Cargar datos iniciales
async function loadInitialData() {
  try {
    // Cargar datos de blockchain
    await loadBlockchainData();
    
    // Cargar datos de usuario
    await loadUserData();
    
  } catch (error) {
    console.warn('⚠️ Error cargando datos iniciales:', error);
  }
}

// Cargar datos de blockchain
async function loadBlockchainData() {
  try {
            // const response = await fetch('/api/blockchain/stats'); // Backend desconectado
    if (response.ok) {
      const data = await response.json();
      if (data.success && data.stats) {
        updateBlockchainStats(data.stats);
      } else {
        // Si no hay datos, usar valores en 0
        updateBlockchainStats({
          price: 0,
          marketCap: 0,
          volume: 0,
          miners: 0
        });
      }
    }
  } catch (error) {
    console.warn('⚠️ Error cargando datos de blockchain:', error);
    // Si hay error, usar valores en 0
    updateBlockchainStats({
      price: 0,
      marketCap: 0,
      volume: 0,
      miners: 0
    });
  }
}

// Cargar datos de usuario
async function loadUserData() {
  const savedWallet = localStorage.getItem('rsc_wallet');
  if (savedWallet) {
    try {
      const wallet = JSON.parse(savedWallet);
      updateUserData(wallet);
    } catch (error) {
      console.warn('⚠️ Error cargando datos de usuario:', error);
    }
  }
}

// Actualizar estadísticas de blockchain
function updateBlockchainStats(data) {
  const elements = {
    price: document.getElementById('footerPrice'),
    marketCap: document.getElementById('footerMarketCap'),
    volume: document.getElementById('footerVolume'),
    miners: document.getElementById('footerMiners')
  };
  
  if (elements.price) {
    elements.price.textContent = `$${formatNumber(data.price || 0)}`;
  }
  if (elements.marketCap) {
    elements.marketCap.textContent = `$${formatNumber(data.marketCap || 0)}`;
  }
  if (elements.volume) {
    elements.volume.textContent = `$${formatNumber(data.volume || 0)}`;
  }
  if (elements.miners) {
    elements.miners.textContent = formatNumber(data.miners || 0);
  }
}

// Actualizar datos de usuario
function updateUserData(wallet) {
  const walletConnectBtn = document.getElementById('walletConnectBtn');
  if (walletConnectBtn && wallet.address) {
    walletConnectBtn.innerHTML = `
      <span class="wallet-icon">👛</span>
      <span class="wallet-text">${formatAddress(wallet.address)}</span>
    `;
  }
}

// Función de utilidad para debounce
function debounce(func, wait) {
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

// Función de utilidad para formatear números
function formatNumber(num) {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(num || 0);
}

// Función de utilidad para formatear direcciones
function formatAddress(address) {
  if (!address) return '';
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
}

// Función para mostrar notificación de error
function showErrorNotification(title, message) {
  if (typeof showNotification === 'function') {
    showNotification('error', title, message);
  } else {
    // Fallback simple
    const notification = document.createElement('div');
    notification.className = 'error-notification';
    notification.innerHTML = `
      <div class="notification-content">
        <h4>${title}</h4>
        <p>${message}</p>
      </div>
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 5000);
  }
}

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeRSCApp);
} else {
  initializeRSCApp();
}

// Exportar para uso global
window.initializeRSCApp = initializeRSCApp; 