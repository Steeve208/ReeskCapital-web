/* ================================
   MAIN.JS — INICIALIZADOR GLOBAL AVANZADO
================================ */

// Importar scripts de secciones y utilidades
const scriptsToInit = [
  "animations.js",
  "hero-3d.js",
  "notifications.js",
  "faq.js",
  "roadmap.js",
  "stats.js",
  "highlights.js",
  "staking.js",
  "p2p.js",
  "mine.js",
  "wallet.js"
];

scriptsToInit.forEach(file => {
  const script = document.createElement('script');
  script.src = `assets/js/${file}`;
  script.defer = true;
  document.body.appendChild(script);
});

/* ======== INICIALIZACIÓN PRINCIPAL ======== */
document.addEventListener("DOMContentLoaded", () => {
  console.log("🚀 RSC Chain Web inicializando...");
  
  // Inicializar componentes principales
  initNavigation();
  initScrollEffects();
  initAnimations();
  initPerformance();
  initAccessibility();
  initAnalytics();
  
  console.log("✅ RSC Chain Web inicializada correctamente");
});

/* ======== NAVEGACIÓN AVANZADA ======== */
function initNavigation() {
  // Highlight link activo en navbar
  const links = document.querySelectorAll('.navbar-links a');
  links.forEach(link => {
    if (window.location.pathname.endsWith(link.getAttribute('href'))) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

  // Toggle menú responsive con animaciones
  const toggle = document.getElementById('navbarToggle');
  const navLinks = document.querySelector('.navbar-links');
  
  if (toggle && navLinks) {
    toggle.addEventListener('click', () => {
      navLinks.classList.toggle('active');
      toggle.classList.toggle('active');
      
      // Animar elementos del menú
      const menuItems = navLinks.querySelectorAll('li');
      menuItems.forEach((item, index) => {
        if (navLinks.classList.contains('active')) {
          item.style.animation = `slideInFromTop 0.3s ease ${index * 0.1}s both`;
        } else {
          item.style.animation = '';
        }
      });
    });
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!toggle.contains(e.target) && !navLinks.contains(e.target)) {
        navLinks.classList.remove('active');
        toggle.classList.remove('active');
      }
    });
    
    // Close mobile menu when clicking on a link
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        toggle.classList.remove('active');
      });
    });
  }

  // Scroll suave para anchors internos con offset
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', function(e) {
      const hash = this.getAttribute('href');
      if (hash.length > 1 && document.querySelector(hash)) {
        e.preventDefault();
        const target = document.querySelector(hash);
        const offset = 80; // Offset para navbar fijo
        const targetPosition = target.offsetTop - offset;
        
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });
}

/* ======== EFECTOS DE SCROLL AVANZADOS ======== */
function initScrollEffects() {
  // Navbar shadow on scroll
  const navbar = document.querySelector('.navbar');
  if (navbar) {
    let lastScrollY = window.scrollY;
    
    window.addEventListener('scroll', () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > 20) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
      
      // Efecto de parallax en el hero
      if (window.hero3D) {
        const scrolled = window.pageYOffset;
        const rate = scrolled * -0.5;
        const hero = document.querySelector('.hero-rsc');
        if (hero) {
          hero.style.transform = `translateY(${rate}px)`;
        }
      }
      
      lastScrollY = currentScrollY;
    });
  }

  // Intersection Observer para animaciones al hacer scroll
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        
        // Efectos específicos por tipo de elemento
        if (entry.target.classList.contains('highlight-card')) {
          entry.target.style.animation = 'scaleIn 0.6s ease both';
        } else if (entry.target.classList.contains('stat-card')) {
          entry.target.style.animation = 'fadeInUp 0.6s ease both';
        } else if (entry.target.classList.contains('action-card')) {
          entry.target.style.animation = 'fadeInLeft 0.6s ease both';
        }
      }
    });
  }, observerOptions);

  // Observar elementos para animación
  document.querySelectorAll('.highlight-card, .stat-card, .action-card, .pool-card, .validator-card, .balance-card, .transaction-item').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    observer.observe(el);
  });
}

/* ======== ANIMACIONES AVANZADAS ======== */
function initAnimations() {
  // Efecto de typing en el hero
  const heroTitle = document.querySelector('.hero-rsc-content h1');
  if (heroTitle && window.TypewriterEffect) {
    const typewriter = new window.TypewriterEffect(heroTitle, heroTitle.textContent, 50);
    setTimeout(() => typewriter.start(), 1000);
  }

  // Efecto de glitch en títulos importantes
  document.querySelectorAll('h1, h2').forEach(title => {
    if (window.GlitchEffect) {
      new window.GlitchEffect(title);
    }
  });

  // Efecto 3D en cards
  document.querySelectorAll('.highlight-card, .stat-card, .action-card').forEach(card => {
    if (window.Card3DEffect) {
      new window.Card3DEffect(card);
    }
  });

  // Sistema de partículas en el hero
  const heroContainer = document.querySelector('.hero-rsc');
  if (heroContainer && window.ParticleSystem) {
    new window.ParticleSystem(heroContainer);
  }

  // Efecto de ondas
  if (heroContainer && window.WaveEffect) {
    new window.WaveEffect(heroContainer);
  }

  // Parallax effect
  if (window.ParallaxEffect) {
    new window.ParallaxEffect();
  }
}

/* ======== OPTIMIZACIÓN DE RENDIMIENTO ======== */
function initPerformance() {
  // Lazy loading para imágenes
  const images = document.querySelectorAll('img[data-src]');
  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.classList.remove('lazy');
        imageObserver.unobserve(img);
      }
    });
  });

  images.forEach(img => imageObserver.observe(img));

  // Throttle para eventos de scroll
  let ticking = false;
  function updateOnScroll() {
    if (!ticking) {
      requestAnimationFrame(() => {
        // Actualizar efectos de scroll aquí
        ticking = false;
      });
      ticking = true;
    }
  }

  window.addEventListener('scroll', updateOnScroll);

  // Preload de recursos críticos
  const criticalResources = [
    'assets/css/global.css',
    'assets/css/hero.css',
    'assets/js/animations.js'
  ];

  criticalResources.forEach(resource => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = resource;
    link.as = resource.endsWith('.css') ? 'style' : 'script';
    document.head.appendChild(link);
  });
}

/* ======== ACCESIBILIDAD ======== */
function initAccessibility() {
  // Navegación por teclado
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      // Cerrar modales abiertos
      const modals = document.querySelectorAll('.modal.active');
      modals.forEach(modal => {
        modal.classList.remove('active');
      });
    }
  });

  // Focus visible para elementos interactivos
  document.querySelectorAll('button, a, input, select, textarea').forEach(element => {
    element.addEventListener('focus', () => {
      element.classList.add('focus-visible');
    });
    
    element.addEventListener('blur', () => {
      element.classList.remove('focus-visible');
    });
  });

  // Reducir movimiento si el usuario lo prefiere
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.body.classList.add('reduced-motion');
  }
}

/* ======== ANALÍTICAS Y MONITOREO ======== */
function initAnalytics() {
  // Tracking de eventos personalizados
  const trackEvent = (eventName, data = {}) => {
    if (typeof gtag !== 'undefined') {
      gtag('event', eventName, data);
    }
    
    // Log local para debugging
    console.log(`📊 Event: ${eventName}`, data);
  };

  // Track clicks en CTA
  document.querySelectorAll('.btn-hero-glow, .btn-hero-outline, .btn-login').forEach(btn => {
    btn.addEventListener('click', () => {
      trackEvent('cta_click', {
        button_text: btn.textContent,
        page: window.location.pathname
      });
    });
  });

  // Track navegación
  document.querySelectorAll('.navbar-links a').forEach(link => {
    link.addEventListener('click', () => {
      trackEvent('navigation', {
        destination: link.getAttribute('href'),
        from_page: window.location.pathname
      });
    });
  });

  // Track scroll depth
  let maxScroll = 0;
  window.addEventListener('scroll', () => {
    const scrollPercent = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
    if (scrollPercent > maxScroll) {
      maxScroll = scrollPercent;
      if (maxScroll % 25 === 0) { // Track cada 25%
        trackEvent('scroll_depth', {
          depth: maxScroll
        });
      }
    }
  });

  // Exponer función de tracking globalmente
  window.RSC = window.RSC || {};
  window.RSC.trackEvent = trackEvent;
}

/* ======== HELPERS GLOBALES ======== */
window.RSC = {
  ...window.RSC,
  
  // Formateo de números
  formatNumber: (n, decimals = 2) => {
    return n.toLocaleString('en-US', { 
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals 
    });
  },

  // Formateo de monedas
  formatCurrency: (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  },

  // Copiar al portapapeles
  copyToClipboard: async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      RSC.showNotification('Copiado al portapapeles', 'success');
    } catch (err) {
      console.error('Error al copiar:', err);
      RSC.showNotification('Error al copiar', 'error');
    }
  },

  // Obtener parámetros de URL
  getQueryParam: (name) => {
    const url = new URL(window.location.href);
    return url.searchParams.get(name);
  },

  // Mostrar notificaciones
  showNotification: (message, type = 'info', duration = 3000) => {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, duration);
  },

  // Validación de formularios
  validateForm: (form) => {
    const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
    let isValid = true;
    
    inputs.forEach(input => {
      if (!input.value.trim()) {
        input.classList.add('error');
        isValid = false;
      } else {
        input.classList.remove('error');
      }
    });
    
    return isValid;
  },

  // Debounce para funciones
  debounce: (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  // Throttle para funciones
  throttle: (func, limit) => {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }
};

/* ======== DETECCIÓN DE ENTORNO ======== */
if (location.hostname === "localhost" || location.hostname === "127.0.0.1") {
  console.log("%c[RSC] 🛠️ Modo desarrollo activado", "color:#3fd8c2;font-weight:bold;font-size:14px");
  document.body.classList.add('dev-mode');
} else {
  console.log("%c[RSC] 🚀 RSC Chain Web inicializada", "color:#7657fc;font-weight:bold;font-size:14px");
}

/* ======== SERVICE WORKER (OPCIONAL) ======== */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('SW registrado:', registration);
      })
      .catch(error => {
        console.log('SW error:', error);
      });
  });
}
