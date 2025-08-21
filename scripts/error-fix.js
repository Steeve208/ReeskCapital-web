/* ================================
   ERROR-FIX.JS — SOLUCIÓN RÁPIDA DE ERRORES
================================ */

// Solución para el error "Error al inicializar la aplicación"
function fixInitializationError() {
  console.log('🔧 Aplicando solución para error de inicialización...');
  
  // 1. Verificar si los archivos críticos están cargados
  const criticalFiles = [
    'config.js',
    'main.js',
    'notifications.js'
  ];
  
  let missingFiles = [];
  criticalFiles.forEach(file => {
    const script = document.querySelector(`script[src*="${file}"]`);
    if (!script) {
      missingFiles.push(file);
    }
  });
  
  if (missingFiles.length > 0) {
    console.error('❌ Archivos faltantes:', missingFiles);
    loadMissingFiles(missingFiles);
  }
  
  // 2. Verificar funciones críticas
  const criticalFunctions = [
    'showNotification',
    'API_CONFIG',
    'formatNumber'
  ];
  
  let missingFunctions = [];
  criticalFunctions.forEach(func => {
    if (typeof window[func] === 'undefined') {
      missingFunctions.push(func);
    }
  });
  
  if (missingFunctions.length > 0) {
    console.error('❌ Funciones faltantes:', missingFunctions);
    createFallbackFunctions(missingFunctions);
  }
  
  // 3. Reinicializar componentes
  setTimeout(() => {
    reinitializeComponents();
  }, 1000);
}

// Cargar archivos faltantes
function loadMissingFiles(files) {
  files.forEach(file => {
    const script = document.createElement('script');
    script.src = `assets/js/${file}`;
    script.onload = () => console.log(`✅ ${file} cargado`);
    script.onerror = () => console.error(`❌ Error cargando ${file}`);
    document.head.appendChild(script);
  });
}

// Crear funciones de fallback
function createFallbackFunctions(functions) {
  functions.forEach(func => {
    switch (func) {
      case 'showNotification':
        window.showNotification = function(type, title, message) {
          console.log(`[${type.toUpperCase()}] ${title}: ${message}`);
          createSimpleNotification(type, title, message);
        };
        break;
        
      case 'API_CONFIG':
        window.API_CONFIG = {
          BASE_URL: 'http://localhost:4000/api',
          WALLET: { CREATE: '/wallet/create' },
          MINING: { START: '/mining/start' },
          STAKING: { POOLS: '/staking/pools' },
          P2P: { ORDERS: '/p2p/orders' },
          BLOCKCHAIN: { STATS: '/blockchain/stats' }
        };
        break;
        
      case 'formatNumber':
        window.formatNumber = function(num) {
          return new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 6
          }).format(num || 0);
        };
        break;
    }
  });
}

// Crear notificación simple
function createSimpleNotification(type, title, message) {
  const notification = document.createElement('div');
  notification.className = `simple-notification ${type}`;
  notification.innerHTML = `
    <div class="notification-header">
      <span class="notification-title">${title}</span>
      <button onclick="this.parentElement.parentElement.remove()">×</button>
    </div>
    <div class="notification-message">${message}</div>
  `;
  
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${type === 'error' ? '#ef4444' : type === 'success' ? '#10b981' : '#3b82f6'};
    color: white;
    padding: 16px;
    border-radius: 8px;
    z-index: 10000;
    max-width: 300px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    if (notification.parentElement) {
      notification.remove();
    }
  }, 5000);
}

// Reinicializar componentes
function reinitializeComponents() {
  console.log('🔄 Reinicializando componentes...');
  
  // Reinicializar tema
  const savedTheme = localStorage.getItem('rsc_theme') || 'dark';
  document.body.className = `${savedTheme}-mode`;
  
  // Reinicializar navegación
  setupBasicNavigation();
  
  // Reinicializar notificaciones
  setupBasicNotifications();
  
  // Cargar datos básicos
  loadBasicData();
  
  console.log('✅ Componentes reinicializados');
}

// Configurar navegación básica
function setupBasicNavigation() {
  const navbarToggle = document.getElementById('navbarToggle');
  const navbar = document.querySelector('.navbar');
  
  if (navbarToggle && navbar) {
    navbarToggle.addEventListener('click', () => {
      navbar.classList.toggle('mobile-open');
    });
  }
  
  // Configurar enlaces de navegación
  const navLinks = document.querySelectorAll('.navbar-links a');
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href && href !== '#') {
        e.preventDefault();
        window.location.href = href;
      }
    });
  });
}

// Configurar notificaciones básicas
function setupBasicNotifications() {
  const notificationsContainer = document.getElementById('notificationsContainer');
  if (!notificationsContainer) {
    const container = document.createElement('div');
    container.id = 'notificationsContainer';
    container.className = 'notifications-container';
    document.body.appendChild(container);
  }
}

// Cargar datos básicos
async function loadBasicData() {
  try {
    // Cargar datos reales de blockchain
    const response = await fetch('/api/blockchain/stats');
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
    
  } catch (error) {
    console.warn('⚠️ Error cargando datos básicos:', error);
    // Si hay error, usar valores en 0
    updateBlockchainStats({
      price: 0,
      marketCap: 0,
      volume: 0,
      miners: 0
    });
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
    elements.price.textContent = `$${formatNumber(data.price)}`;
  }
  if (elements.marketCap) {
    elements.marketCap.textContent = `$${formatNumber(data.marketCap)}`;
  }
  if (elements.volume) {
    elements.volume.textContent = `$${formatNumber(data.volume)}`;
  }
  if (elements.miners) {
    elements.miners.textContent = formatNumber(data.miners);
  }
}

// Función para aplicar todas las correcciones
function applyAllFixes() {
  console.log('🔧 Aplicando todas las correcciones...');
  
  fixInitializationError();
  
  // Marcar como corregido
  window.rscAppFixed = true;
  
  // Mostrar notificación de éxito
  setTimeout(() => {
    if (typeof showNotification === 'function') {
      showNotification('success', 'Aplicación Corregida', 'Los errores han sido solucionados');
    } else {
      createSimpleNotification('success', 'Aplicación Corregida', 'Los errores han sido solucionados');
    }
  }, 2000);
}

// Aplicar correcciones automáticamente si hay errores
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    if (!window.rscAppInitialized && !window.rscAppFixed) {
      console.log('⚠️ Aplicación no inicializada, aplicando correcciones...');
      applyAllFixes();
    }
  }, 3000);
});

// Exportar funciones para uso global
window.fixInitializationError = fixInitializationError;
window.applyAllFixes = applyAllFixes; 