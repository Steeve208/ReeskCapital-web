/* ================================
   MOBILE RESPONSIVE SYSTEM - RSC CHAIN
   Sistema avanzado de responsive design y touch interactions
================================ */

class MobileResponsiveSystem {
  constructor() {
    this.isMobile = window.innerWidth <= 1023;
    this.isTablet = window.innerWidth >= 768 && window.innerWidth <= 1023;
    this.isDesktop = window.innerWidth >= 1024;
    this.touchStartY = 0;
    this.touchStartX = 0;
    this.touchEndY = 0;
    this.touchEndX = 0;
    this.swipeThreshold = 50;
    this.pullToRefreshThreshold = 100;
    this.isPulling = false;
    this.mobileNavOpen = false;
    this.init();
  }

  init() {
    this.setupMobileNavigation();
    this.setupTouchInteractions();
    this.setupSwipeGestures();
    this.setupPullToRefresh();
    this.setupResponsiveImages();
    this.setupPerformanceOptimizations();
    this.setupAccessibility();
    this.setupOrientationChange();
    this.setupViewportHandling();
    this.setupLazyLoading();
    this.setupIntersectionObserver();
    this.setupScrollOptimizations();
    this.setupFormOptimizations();
    this.setupAnimationOptimizations();
  }

  // ===== MOBILE NAVIGATION =====
  setupMobileNavigation() {
    this.createMobileNav();
    this.setupHamburgerMenu();
    this.setupNavInteractions();
    this.setupNavAnimations();
  }

  createMobileNav() {
    // Crear contenedor de navegación móvil
    const mobileNavContainer = document.createElement('div');
    mobileNavContainer.className = 'mobile-nav-container';
    mobileNavContainer.id = 'mobileNavContainer';
    
    // Header de navegación móvil
    const mobileNavHeader = document.createElement('div');
    mobileNavHeader.className = 'mobile-nav-header';
    
    const mobileNavLogo = document.createElement('div');
    mobileNavLogo.className = 'mobile-nav-logo';
    mobileNavLogo.textContent = 'RSC Chain';
    
    const mobileNavClose = document.createElement('button');
    mobileNavClose.className = 'mobile-nav-close';
    mobileNavClose.innerHTML = '&times;';
    mobileNavClose.setAttribute('aria-label', 'Close navigation');
    
    mobileNavHeader.appendChild(mobileNavLogo);
    mobileNavHeader.appendChild(mobileNavClose);
    
    // Menú de navegación móvil
    const mobileNavMenu = document.createElement('div');
    mobileNavMenu.className = 'mobile-nav-menu';
    
    const navItems = [
      { text: 'Home', icon: 'fas fa-home', href: '#home' },
      { text: 'About', icon: 'fas fa-info-circle', href: '#about' },
      { text: 'Features', icon: 'fas fa-star', href: '#features' },
      { text: 'Mining', icon: 'fas fa-coins', href: '#mining' },
      { text: 'Wallet', icon: 'fas fa-wallet', href: '#wallet' },
      { text: 'Explorer', icon: 'fas fa-search', href: '#explorer' },
      { text: 'Staking', icon: 'fas fa-lock', href: '#staking' },
      { text: 'P2P', icon: 'fas fa-users', href: '#p2p' },
      { text: 'Bank', icon: 'fas fa-university', href: '#bank' },
      { text: 'Docs', icon: 'fas fa-book', href: '#docs' },
      { text: 'FAQ', icon: 'fas fa-question-circle', href: '#faq' }
    ];
    
    navItems.forEach(item => {
      const navItem = document.createElement('a');
      navItem.className = 'mobile-nav-item';
      navItem.href = item.href;
      navItem.innerHTML = `<i class="${item.icon}"></i>${item.text}`;
      mobileNavMenu.appendChild(navItem);
    });
    
    mobileNavContainer.appendChild(mobileNavHeader);
    mobileNavContainer.appendChild(mobileNavMenu);
    document.body.appendChild(mobileNavContainer);
    
    this.mobileNavContainer = mobileNavContainer;
    this.mobileNavClose = mobileNavClose;
    this.mobileNavItems = mobileNavMenu.querySelectorAll('.mobile-nav-item');
  }

  setupHamburgerMenu() {
    // Crear botón hamburger
    const hamburgerMenu = document.createElement('button');
    hamburgerMenu.className = 'hamburger-menu';
    hamburgerMenu.setAttribute('aria-label', 'Open navigation menu');
    hamburgerMenu.innerHTML = '<span></span><span></span><span></span>';
    
    // Insertar en el header
    const header = document.querySelector('.header') || document.querySelector('header');
    if (header) {
      const headerContent = header.querySelector('.header-content') || header;
      headerContent.appendChild(hamburgerMenu);
    }
    
    this.hamburgerMenu = hamburgerMenu;
    
    // Event listeners
    hamburgerMenu.addEventListener('click', () => this.toggleMobileNav());
    this.mobileNavClose.addEventListener('click', () => this.closeMobileNav());
  }

  setupNavInteractions() {
    // Cerrar navegación al hacer clic en enlaces
    this.mobileNavItems.forEach(item => {
      item.addEventListener('click', () => {
        this.closeMobileNav();
        this.setActiveNavItem(item);
      });
    });
    
    // Cerrar navegación al hacer clic fuera
    this.mobileNavContainer.addEventListener('click', (e) => {
      if (e.target === this.mobileNavContainer) {
        this.closeMobileNav();
      }
    });
    
    // Cerrar navegación con tecla Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.mobileNavOpen) {
        this.closeMobileNav();
      }
    });
  }

  setupNavAnimations() {
    // Animaciones de entrada para elementos del menú
    this.mobileNavItems.forEach((item, index) => {
      item.style.opacity = '0';
      item.style.transform = 'translateX(-20px)';
      item.style.transition = 'all 0.3s ease';
      
      setTimeout(() => {
        item.style.opacity = '1';
        item.style.transform = 'translateX(0)';
      }, index * 50);
    });
  }

  toggleMobileNav() {
    if (this.mobileNavOpen) {
      this.closeMobileNav();
    } else {
      this.openMobileNav();
    }
  }

  openMobileNav() {
    this.mobileNavContainer.classList.add('open');
    this.hamburgerMenu.classList.add('open');
    this.mobileNavOpen = true;
    document.body.style.overflow = 'hidden';
    
    // Animar elementos del menú
    this.animateNavItems();
  }

  closeMobileNav() {
    this.mobileNavContainer.classList.remove('open');
    this.hamburgerMenu.classList.remove('open');
    this.mobileNavOpen = false;
    document.body.style.overflow = '';
  }

  animateNavItems() {
    this.mobileNavItems.forEach((item, index) => {
      item.style.opacity = '0';
      item.style.transform = 'translateX(-20px)';
      
      setTimeout(() => {
        item.style.opacity = '1';
        item.style.transform = 'translateX(0)';
      }, index * 50);
    });
  }

  setActiveNavItem(activeItem) {
    this.mobileNavItems.forEach(item => {
      item.classList.remove('active');
    });
    activeItem.classList.add('active');
  }

  // ===== TOUCH INTERACTIONS =====
  setupTouchInteractions() {
    this.setupTouchEvents();
    this.setupTouchFeedback();
    this.setupTouchOptimizations();
  }

  setupTouchEvents() {
    // Touch start
    document.addEventListener('touchstart', (e) => {
      this.touchStartY = e.touches[0].clientY;
      this.touchStartX = e.touches[0].clientX;
      this.isPulling = false;
    }, { passive: true });

    // Touch move
    document.addEventListener('touchmove', (e) => {
      if (this.touchStartY === 0) return;
      
      this.touchEndY = e.touches[0].clientY;
      this.touchEndX = e.touches[0].clientX;
      
      const deltaY = this.touchEndY - this.touchStartY;
      const deltaX = this.touchEndX - this.touchStartX;
      
      // Detectar pull to refresh
      if (deltaY > this.pullToRefreshThreshold && window.scrollY === 0) {
        this.handlePullToRefresh(deltaY);
      }
      
      // Detectar swipe
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > this.swipeThreshold) {
        this.handleSwipe(deltaX, deltaY);
      }
    }, { passive: true });

    // Touch end
    document.addEventListener('touchend', (e) => {
      if (this.isPulling) {
        this.handlePullToRefreshEnd();
      }
      
      this.touchStartY = 0;
      this.touchStartX = 0;
      this.touchEndY = 0;
      this.touchEndX = 0;
    }, { passive: true });
  }

  setupTouchFeedback() {
    // Añadir feedback táctil a elementos interactivos
    const touchElements = document.querySelectorAll('button, a, .btn, .card, .nav-item');
    
    touchElements.forEach(element => {
      element.addEventListener('touchstart', () => {
        element.style.transform = 'scale(0.95)';
        element.style.transition = 'transform 0.1s ease';
      });
      
      element.addEventListener('touchend', () => {
        element.style.transform = 'scale(1)';
      });
    });
  }

  setupTouchOptimizations() {
    // Optimizar para touch
    document.addEventListener('touchstart', () => {}, { passive: true });
    document.addEventListener('touchmove', () => {}, { passive: true });
    document.addEventListener('touchend', () => {}, { passive: true });
  }

  // ===== SWIPE GESTURES =====
  setupSwipeGestures() {
    this.setupSwipeContainers();
    this.setupSwipeNavigation();
  }

  setupSwipeContainers() {
    const swipeContainers = document.querySelectorAll('.swipe-container');
    
    swipeContainers.forEach(container => {
      let startX = 0;
      let currentX = 0;
      let isDragging = false;
      
      container.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
        isDragging = true;
      });
      
      container.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        
        currentX = e.touches[0].clientX;
        const deltaX = currentX - startX;
        
        container.style.transform = `translateX(${deltaX}px)`;
      });
      
      container.addEventListener('touchend', () => {
        if (!isDragging) return;
        
        const deltaX = currentX - startX;
        
        if (Math.abs(deltaX) > this.swipeThreshold) {
          if (deltaX > 0) {
            this.handleSwipeRight(container);
          } else {
            this.handleSwipeLeft(container);
          }
        }
        
        container.style.transform = 'translateX(0)';
        isDragging = false;
      });
    });
  }

  setupSwipeNavigation() {
    // Swipe para navegación móvil
    document.addEventListener('touchstart', (e) => {
      if (this.mobileNavOpen) return;
      
      this.touchStartX = e.touches[0].clientX;
    });
    
    document.addEventListener('touchend', (e) => {
      if (this.mobileNavOpen) return;
      
      this.touchEndX = e.changedTouches[0].clientX;
      const deltaX = this.touchEndX - this.touchStartX;
      
      if (Math.abs(deltaX) > this.swipeThreshold) {
        if (deltaX > 0) {
          this.openMobileNav();
        }
      }
    });
  }

  handleSwipeLeft(container) {
    // Implementar swipe left
    console.log('Swipe left detected');
  }

  handleSwipeRight(container) {
    // Implementar swipe right
    console.log('Swipe right detected');
  }

  handleSwipe(deltaX, deltaY) {
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX > 0) {
        console.log('Swipe right');
      } else {
        console.log('Swipe left');
      }
    } else {
      if (deltaY > 0) {
        console.log('Swipe down');
      } else {
        console.log('Swipe up');
      }
    }
  }

  // ===== PULL TO REFRESH =====
  setupPullToRefresh() {
    this.createPullToRefreshIndicator();
  }

  createPullToRefreshIndicator() {
    const indicator = document.createElement('div');
    indicator.className = 'pull-to-refresh-indicator';
    indicator.id = 'pullToRefreshIndicator';
    document.body.appendChild(indicator);
    
    this.pullToRefreshIndicator = indicator;
  }

  handlePullToRefresh(deltaY) {
    this.isPulling = true;
    const progress = Math.min(deltaY / this.pullToRefreshThreshold, 1);
    
    this.pullToRefreshIndicator.style.opacity = progress;
    this.pullToRefreshIndicator.style.top = `${deltaY - 50}px`;
    
    if (progress >= 1) {
      this.pullToRefreshIndicator.classList.add('active');
    }
  }

  handlePullToRefreshEnd() {
    if (this.pullToRefreshIndicator.classList.contains('active')) {
      this.refreshContent();
    }
    
    this.pullToRefreshIndicator.style.opacity = '0';
    this.pullToRefreshIndicator.classList.remove('active');
    this.isPulling = false;
  }

  refreshContent() {
    // Implementar refresh del contenido
    console.log('Refreshing content...');
    
    // Simular refresh
    setTimeout(() => {
      console.log('Content refreshed');
    }, 1000);
  }

  // ===== RESPONSIVE IMAGES =====
  setupResponsiveImages() {
    this.setupImageLazyLoading();
    this.setupImageOptimization();
  }

  setupImageLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    
    if ('IntersectionObserver' in window) {
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
    } else {
      // Fallback para navegadores sin IntersectionObserver
      images.forEach(img => {
        img.src = img.dataset.src;
        img.classList.remove('lazy');
      });
    }
  }

  setupImageOptimization() {
    // Optimizar imágenes para diferentes tamaños de pantalla
    const images = document.querySelectorAll('img');
    
    images.forEach(img => {
      img.classList.add('img-responsive');
      
      // Añadir loading="lazy" si no está presente
      if (!img.hasAttribute('loading')) {
        img.setAttribute('loading', 'lazy');
      }
    });
  }

  // ===== PERFORMANCE OPTIMIZATIONS =====
  setupPerformanceOptimizations() {
    this.setupScrollOptimizations();
    this.setupAnimationOptimizations();
    this.setupMemoryOptimizations();
  }

  setupScrollOptimizations() {
    let scrollTimeout;
    
    window.addEventListener('scroll', () => {
      if (scrollTimeout) return;
      
      scrollTimeout = setTimeout(() => {
        this.handleScroll();
        scrollTimeout = null;
      }, 16);
    });
  }

  setupAnimationOptimizations() {
    // Optimizar animaciones para móviles
    if (this.isMobile) {
      const animatedElements = document.querySelectorAll('.animated, .fade-in, .slide-in');
      
      animatedElements.forEach(element => {
        element.classList.add('gpu-accelerated-mobile');
      });
    }
  }

  setupMemoryOptimizations() {
    // Limpiar event listeners cuando no se necesiten
    window.addEventListener('beforeunload', () => {
      this.cleanup();
    });
  }

  handleScroll() {
    // Manejar scroll optimizado
    const scrollY = window.scrollY;
    
    // Actualizar header
    const header = document.querySelector('.header-responsive');
    if (header) {
      if (scrollY > 100) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }
  }

  // ===== ACCESSIBILITY =====
  setupAccessibility() {
    this.setupKeyboardNavigation();
    this.setupScreenReaderSupport();
    this.setupFocusManagement();
  }

  setupKeyboardNavigation() {
    // Navegación con teclado
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
    // Añadir atributos ARIA
    const hamburgerMenu = document.querySelector('.hamburger-menu');
    if (hamburgerMenu) {
      hamburgerMenu.setAttribute('aria-expanded', 'false');
    }
    
    const mobileNav = document.querySelector('.mobile-nav-container');
    if (mobileNav) {
      mobileNav.setAttribute('aria-hidden', 'true');
    }
  }

  setupFocusManagement() {
    // Manejar focus en navegación móvil
    this.mobileNavItems.forEach((item, index) => {
      item.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowDown' && index < this.mobileNavItems.length - 1) {
          this.mobileNavItems[index + 1].focus();
        } else if (e.key === 'ArrowUp' && index > 0) {
          this.mobileNavItems[index - 1].focus();
        }
      });
    });
  }

  // ===== ORIENTATION CHANGE =====
  setupOrientationChange() {
    window.addEventListener('orientationchange', () => {
      setTimeout(() => {
        this.handleOrientationChange();
      }, 100);
    });
  }

  handleOrientationChange() {
    // Manejar cambio de orientación
    this.updateViewport();
    this.recalculateLayout();
  }

  // ===== VIEWPORT HANDLING =====
  setupViewportHandling() {
    this.updateViewport();
    this.setupViewportMeta();
  }

  updateViewport() {
    this.isMobile = window.innerWidth <= 1023;
    this.isTablet = window.innerWidth >= 768 && window.innerWidth <= 1023;
    this.isDesktop = window.innerWidth >= 1024;
  }

  setupViewportMeta() {
    // Asegurar que el viewport meta esté configurado correctamente
    let viewportMeta = document.querySelector('meta[name="viewport"]');
    
    if (!viewportMeta) {
      viewportMeta = document.createElement('meta');
      viewportMeta.name = 'viewport';
      document.head.appendChild(viewportMeta);
    }
    
    viewportMeta.content = 'width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes';
  }

  // ===== LAZY LOADING =====
  setupLazyLoading() {
    this.setupContentLazyLoading();
    this.setupImageLazyLoading();
  }

  setupContentLazyLoading() {
    const lazyElements = document.querySelectorAll('[data-lazy]');
    
    if ('IntersectionObserver' in window) {
      const lazyObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const element = entry.target;
            this.loadLazyContent(element);
            lazyObserver.unobserve(element);
          }
        });
      });
      
      lazyElements.forEach(element => lazyObserver.observe(element));
    }
  }

  loadLazyContent(element) {
    const content = element.dataset.lazy;
    element.innerHTML = content;
    element.classList.remove('lazy');
  }

  // ===== INTERSECTION OBSERVER =====
  setupIntersectionObserver() {
    this.setupScrollReveal();
    this.setupPerformanceObserver();
  }

  setupScrollReveal() {
    const revealElements = document.querySelectorAll('.scroll-reveal');
    
    if ('IntersectionObserver' in window) {
      const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
          }
        });
      });
      
      revealElements.forEach(element => revealObserver.observe(element));
    }
  }

  setupPerformanceObserver() {
    // Observar elementos para optimización de performance
    const performanceElements = document.querySelectorAll('.card, .btn, .nav-item');
    
    if ('IntersectionObserver' in window) {
      const performanceObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('gpu-accelerated-mobile');
          } else {
            entry.target.classList.remove('gpu-accelerated-mobile');
          }
        });
      });
      
      performanceElements.forEach(element => performanceObserver.observe(element));
    }
  }

  // ===== FORM OPTIMIZATIONS =====
  setupFormOptimizations() {
    this.setupFormValidation();
    this.setupFormAccessibility();
  }

  setupFormValidation() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
      form.addEventListener('submit', (e) => {
        if (!this.validateForm(form)) {
          e.preventDefault();
        }
      });
    });
  }

  setupFormAccessibility() {
    const formInputs = document.querySelectorAll('input, select, textarea');
    
    formInputs.forEach(input => {
      input.classList.add('form-input-responsive');
      
      // Añadir labels si no existen
      if (!input.id || !document.querySelector(`label[for="${input.id}"]`)) {
        const label = document.createElement('label');
        label.className = 'form-label-responsive';
        label.textContent = input.placeholder || input.name || 'Input';
        label.setAttribute('for', input.id || input.name);
        input.parentNode.insertBefore(label, input);
      }
    });
  }

  validateForm(form) {
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
  }

  // ===== UTILITY METHODS =====
  recalculateLayout() {
    // Recalcular layout después de cambios
    this.updateViewport();
    this.updateTouchTargets();
  }

  updateTouchTargets() {
    // Actualizar tamaños de touch targets
    const touchElements = document.querySelectorAll('.btn, .nav-item, .card');
    
    touchElements.forEach(element => {
      if (this.isMobile) {
        element.classList.add('touch-target-comfortable');
      } else {
        element.classList.remove('touch-target-comfortable');
      }
    });
  }

  cleanup() {
    // Limpiar event listeners y recursos
    if (this.mobileNavContainer) {
      this.mobileNavContainer.remove();
    }
    
    if (this.pullToRefreshIndicator) {
      this.pullToRefreshIndicator.remove();
    }
  }

  // ===== PUBLIC API =====
  openMobileNav() {
    this.openMobileNav();
  }

  closeMobileNav() {
    this.closeMobileNav();
  }

  toggleMobileNav() {
    this.toggleMobileNav();
  }

  refreshContent() {
    this.refreshContent();
  }
}

// ===== INICIALIZACIÓN =====
document.addEventListener('DOMContentLoaded', () => {
  window.RSCMobileSystem = new MobileResponsiveSystem();
});

// ===== EXPORT =====
window.RSCMobileSystem = MobileResponsiveSystem;
