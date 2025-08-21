// ===== MAIN.JS - FUNCIONALIDAD PRINCIPAL MEJORADA =====

// Configuración global
const CONFIG = {
  API_BASE_URL: 'http://localhost:3000/api',
  UPDATE_INTERVAL: 5000,
  SUPPORT_EMAIL: 'support@reeskcapital.co'
};

// Estado de la aplicación
let appState = {
  isInitialized: false,
  currentTheme: 'dark',
  currentLanguage: 'es',
  walletConnected: false,
  scrollY: 0
};

// Inicialización de la aplicación
function initApp() {
  try {
    console.log('🚀 Inicializando ReeskCapital.co...');
    
    // Inicializar componentes
    initHeader();
    initTheme();
    initLanguage();
    initNavigation();
    initHeroAnimations();
    initFeaturesAnimations();
    initMobileCarousel();
    initStats();
    initChat();
    initScrollEffects();
    initRoadmap();
    initFooter();
    
    appState.isInitialized = true;
    console.log('✅ Aplicación inicializada correctamente');
    
    // Ocultar mensaje de error si existe
    hideError();
    
  } catch (error) {
    console.error('❌ Error al inicializar:', error);
    showError('Error al inicializar la aplicación');
  }
}

// Inicializar header sticky
function initHeader() {
  const navbar = document.querySelector('.navbar');
  
  if (navbar) {
    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;
      appState.scrollY = scrollY;
      
      if (scrollY > 50) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    });
  }
}

// Inicializar animaciones del hero
function initHeroAnimations() {
  // Animación de typing effect para el título
  const heroTitle = document.querySelector('.hero-title');
  if (heroTitle) {
    const lines = heroTitle.querySelectorAll('.title-line');
    lines.forEach((line, index) => {
      line.style.animationDelay = `${0.2 + index * 0.2}s`;
    });
  }
  
  // Animación de countUp para las métricas
  const statValues = document.querySelectorAll('.stat-value');
  statValues.forEach((stat, index) => {
    stat.style.animationDelay = `${1.2 + index * 0.1}s`;
  });
}

// Inicializar animaciones de características
function initFeaturesAnimations() {
  const featureCards = document.querySelectorAll('.feature-card');
  
  // Observer para animaciones de entrada
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });
  
  featureCards.forEach(card => {
    observer.observe(card);
  });
  
  // Efectos hover mejorados
  featureCards.forEach(card => {
    card.addEventListener('mouseenter', () => {
      card.style.transform = 'scale(1.05) translateY(-8px)';
    });
    
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'scale(1) translateY(0)';
    });
  });
}

// Inicializar carousel mobile para características
function initMobileCarousel() {
  const featuresGrid = document.querySelector('.features-grid');
  
  if (!featuresGrid || window.innerWidth > 768) return;
  
  let isDown = false;
  let startX;
  let scrollLeft;
  
  featuresGrid.addEventListener('mousedown', (e) => {
    isDown = true;
    featuresGrid.style.cursor = 'grabbing';
    startX = e.pageX - featuresGrid.offsetLeft;
    scrollLeft = featuresGrid.scrollLeft;
  });
  
  featuresGrid.addEventListener('mouseleave', () => {
    isDown = false;
    featuresGrid.style.cursor = 'grab';
  });
  
  featuresGrid.addEventListener('mouseup', () => {
    isDown = false;
    featuresGrid.style.cursor = 'grab';
  });
  
  featuresGrid.addEventListener('mousemove', (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - featuresGrid.offsetLeft;
    const walk = (x - startX) * 2;
    featuresGrid.scrollLeft = scrollLeft - walk;
  });
  
  // Touch events para dispositivos móviles
  featuresGrid.addEventListener('touchstart', (e) => {
    isDown = true;
    startX = e.touches[0].pageX - featuresGrid.offsetLeft;
    scrollLeft = featuresGrid.scrollLeft;
  });
  
  featuresGrid.addEventListener('touchend', () => {
    isDown = false;
  });
  
  featuresGrid.addEventListener('touchmove', (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.touches[0].pageX - featuresGrid.offsetLeft;
    const walk = (x - startX) * 2;
    featuresGrid.scrollLeft = scrollLeft - walk;
  });
}

// Inicializar efectos de scroll
function initScrollEffects() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, observerOptions);
  
  // Observar elementos para animación
  const animatedElements = document.querySelectorAll('.roadmap-item');
  animatedElements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'all 0.6s ease';
    observer.observe(el);
  });
}

// Inicializar tema
function initTheme() {
  const themeToggle = document.getElementById('themeToggle');
  const body = document.body;
  
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      if (body.classList.contains('dark-mode')) {
        body.classList.remove('dark-mode');
        appState.currentTheme = 'light';
        localStorage.setItem('theme', 'light');
        themeToggle.querySelector('.theme-icon').textContent = '☀️';
      } else {
        body.classList.add('dark-mode');
        appState.currentTheme = 'dark';
        localStorage.setItem('theme', 'dark');
        themeToggle.querySelector('.theme-icon').textContent = '🌙';
      }
    });
  }
  
  // Cargar tema guardado
  const savedTheme = localStorage.getItem('theme') || 'dark';
  if (savedTheme === 'dark') {
    body.classList.add('dark-mode');
    if (themeToggle) {
      themeToggle.querySelector('.theme-icon').textContent = '🌙';
    }
  } else {
    body.classList.remove('dark-mode');
    if (themeToggle) {
      themeToggle.querySelector('.theme-icon').textContent = '☀️';
    }
  }
}

// Inicializar idioma
function initLanguage() {
  const languageSelector = document.getElementById('languageSelector');
  const languageOptions = document.querySelectorAll('.language-option');
  
  if (languageSelector) {
    languageSelector.addEventListener('click', () => {
      const dropdown = languageSelector.querySelector('.language-dropdown');
      dropdown.classList.toggle('show');
    });
  }
  
  languageOptions.forEach(option => {
    option.addEventListener('click', () => {
      const lang = option.dataset.lang;
      appState.currentLanguage = lang;
      localStorage.setItem('language', lang);
      
      // Actualizar texto del selector
      const selectorText = document.querySelector('#languageSelector span');
      if (selectorText) {
        selectorText.textContent = lang.toUpperCase();
      }
      
      // Cerrar dropdown
      const dropdown = document.querySelector('.language-dropdown');
      if (dropdown) {
        dropdown.classList.remove('show');
      }
    });
  });
  
  // Cargar idioma guardado
  const savedLanguage = localStorage.getItem('language') || 'es';
  appState.currentLanguage = savedLanguage;
  const selectorText = document.querySelector('#languageSelector span');
  if (selectorText) {
    selectorText.textContent = savedLanguage.toUpperCase();
  }
}

// Inicializar navegación
function initNavigation() {
  const navbarToggle = document.getElementById('navbarToggle');
  const navbarLinks = document.querySelector('.navbar-links');
  
  if (navbarToggle && navbarLinks) {
    navbarToggle.addEventListener('click', () => {
      navbarLinks.classList.toggle('show');
      navbarToggle.setAttribute('aria-expanded', 
        navbarLinks.classList.contains('show').toString());
    });
  }
  
  // Marcar enlace activo
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('.navbar-links a');
  
  navLinks.forEach(link => {
    if (link.getAttribute('href') === currentPage) {
      link.classList.add('active');
    }
  });
  
  // Efectos hover en enlaces
  navLinks.forEach(link => {
    link.addEventListener('mouseenter', () => {
      link.style.transform = 'translateY(-2px)';
    });
    
    link.addEventListener('mouseleave', () => {
      link.style.transform = 'translateY(0)';
    });
  });
}

// Inicializar estadísticas con animación
function initStats() {
  // Simular datos en tiempo real
  updateStats();
  
  // Actualizar cada 5 segundos
  setInterval(updateStats, CONFIG.UPDATE_INTERVAL);
}

function updateStats() {
  // Obtener datos reales de la blockchain
  fetch('/api/blockchain/stats')
    .then(response => response.json())
    .then(data => {
      if (data.success && data.stats) {
        const stats = data.stats;
        
        // Actualizar elementos con animación
        const elements = {
          'rscPrice': `$${stats.price || 0}`,
          'rscSupply': (stats.circulatingSupply || 0).toLocaleString(),
          'tpsValue': stats.tps || 0,
          'nodesValue': stats.activeValidators || 0,
          'marketCap': `$${(stats.marketCap || 0).toLocaleString()}`,
          'volume24h': `$${(stats.volume24h || 0).toLocaleString()}`,
          'totalBlocks': (stats.totalBlocks || 0).toLocaleString(),
          'activeUsers': (stats.activeUsers || 0).toLocaleString(),
          'dashboardPrice': `$${stats.price || 0}`,
          'dashboardSupply': (stats.circulatingSupply || 0).toLocaleString()
        };
        
        Object.keys(elements).forEach(id => {
          const element = document.getElementById(id);
          if (element) {
            // Animación de cambio de valor
            const oldValue = element.textContent;
            const newValue = elements[id];
            
            if (oldValue !== newValue) {
              element.style.transform = 'scale(1.1)';
              element.style.color = '#00ff88';
              
              setTimeout(() => {
                element.textContent = newValue;
                element.style.transform = 'scale(1)';
                element.style.color = '';
              }, 150);
            }
          }
        });
      }
    })
    .catch(error => {
      console.warn('Error obteniendo estadísticas de la blockchain:', error);
      // Si no hay datos, mostrar 0
      const elements = {
        'rscPrice': '$0',
        'rscSupply': '0',
        'tpsValue': '0',
        'nodesValue': '0',
        'marketCap': '$0',
        'volume24h': '$0',
        'totalBlocks': '0',
        'activeUsers': '0',
        'dashboardPrice': '$0',
        'dashboardSupply': '0'
      };
      
      Object.keys(elements).forEach(id => {
        const element = document.getElementById(id);
        if (element) {
          element.textContent = elements[id];
        }
      });
    });
}

// Inicializar chat
function initChat() {
  const chatToggle = document.getElementById('supportChat');
  const chatModal = document.querySelector('.support-chat');
  const chatClose = document.getElementById('chatClose');
  const chatSend = document.getElementById('chatSend');
  const chatInput = document.getElementById('chatInput');
  
  if (chatToggle && chatModal) {
    chatToggle.addEventListener('click', (e) => {
      e.preventDefault();
      chatModal.classList.add('active');
    });
  }
  
  if (chatClose) {
    chatClose.addEventListener('click', () => {
      chatModal.classList.remove('active');
    });
  }
  
  if (chatSend && chatInput) {
    chatSend.addEventListener('click', sendMessage);
    chatInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        sendMessage();
      }
    });
  }
}

function sendMessage() {
  const chatInput = document.getElementById('chatInput');
  const chatMessages = document.getElementById('chatMessages');
  
  if (chatInput && chatInput.value.trim()) {
    const message = chatInput.value.trim();
    
    // Agregar mensaje del usuario
    const userMessage = document.createElement('div');
    userMessage.className = 'message user';
    userMessage.innerHTML = `<p>${message}</p>`;
    chatMessages.appendChild(userMessage);
    
    // Limpiar input
    chatInput.value = '';
    
    // Simular respuesta del bot
    setTimeout(() => {
      const botMessage = document.createElement('div');
      botMessage.className = 'message bot';
      botMessage.innerHTML = `<p>Gracias por tu mensaje. Un agente te responderá pronto.</p>`;
      chatMessages.appendChild(botMessage);
      
      // Scroll al final
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }, 1000);
    
    // Scroll al final
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }
}

// Inicializar roadmap
function initRoadmap() {
  // Las animaciones del roadmap se manejan en roadmap.js
  console.log('🗺️ Roadmap inicializado');
}

// Inicializar footer
function initFooter() {
  // Las funcionalidades del footer se manejan en footer.js
  console.log('🦶 Footer inicializado');
}

// Mostrar error
function showError(message) {
  const notificationsContainer = document.getElementById('notificationsContainer');
  if (notificationsContainer) {
    const notification = document.createElement('div');
    notification.className = 'notification error';
    notification.innerHTML = `
      <div class="notification-content">
        <span class="notification-icon">❌</span>
        <div class="notification-text">
          <h4>Error</h4>
          <p>${message}</p>
        </div>
        <button class="notification-close">&times;</button>
      </div>
    `;
    
    notificationsContainer.appendChild(notification);
    
    // Auto-remover después de 5 segundos
    setTimeout(() => {
      notification.remove();
    }, 5000);
  }
}

// Ocultar error
function hideError() {
  const errorNotifications = document.querySelectorAll('.notification.error');
  errorNotifications.forEach(notification => {
    notification.remove();
  });
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', initApp);

// Exportar para uso global
window.appState = appState;
window.CONFIG = CONFIG;
