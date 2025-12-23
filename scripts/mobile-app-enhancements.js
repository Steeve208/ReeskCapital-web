// ===== MOBILE APP ENHANCEMENTS =====
// Hace que el landing se sienta como una app móvil nativa

class MobileAppEnhancements {
  constructor() {
    this.isMobile = window.innerWidth <= 768;
    this.isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    this.isAndroid = /Android/.test(navigator.userAgent);
    this.touchStartY = 0;
    this.touchStartX = 0;
    this.isScrolling = false;
    this.init();
  }

  init() {
    this.setupViewport();
    this.setupTouchFeedback();
    this.setupSwipeGestures();
    this.setupPullToRefresh();
    this.setupSmoothScrolling();
    this.setupPerformanceOptimizations();
    this.setupSafeAreaInsets();
    this.setupAppLikeBehavior();
  }

  setupViewport() {
    // Asegurar que el viewport sea correcto
    const viewport = document.querySelector('meta[name="viewport"]');
    if (viewport) {
      viewport.setAttribute('content', 
        'width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes, viewport-fit=cover'
      );
    }

    // Prevenir zoom en doble tap (excepto en inputs)
    let lastTouchEnd = 0;
    document.addEventListener('touchend', (e) => {
      const now = Date.now();
      if (now - lastTouchEnd <= 300) {
        e.preventDefault();
      }
      lastTouchEnd = now;
    }, { passive: false });

    // Prevenir zoom en inputs
    const inputs = document.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
      input.addEventListener('touchstart', (e) => {
        e.stopPropagation();
      });
    });
  }

  setupTouchFeedback() {
    // Agregar feedback táctil a elementos interactivos
    const touchElements = document.querySelectorAll(
      'button, a, .btn, .neurosearch-feature-card, .institutional-trust-card, ' +
      '.compliance-feature-card, .partner-logo-card, .neurosearch-comm-social-card'
    );

    touchElements.forEach(element => {
      element.addEventListener('touchstart', (e) => {
        element.style.transition = 'transform 0.1s ease, opacity 0.1s ease';
        element.style.transform = 'scale(0.98)';
        element.style.opacity = '0.9';
      }, { passive: true });

      element.addEventListener('touchend', () => {
        setTimeout(() => {
          element.style.transform = '';
          element.style.opacity = '';
        }, 100);
      }, { passive: true });

      element.addEventListener('touchcancel', () => {
        element.style.transform = '';
        element.style.opacity = '';
      }, { passive: true });
    });
  }

  setupSwipeGestures() {
    let startX = 0;
    let startY = 0;
    let currentX = 0;
    let currentY = 0;
    let isSwiping = false;

    document.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      isSwiping = false;
    }, { passive: true });

    document.addEventListener('touchmove', (e) => {
      if (!startX || !startY) return;

      currentX = e.touches[0].clientX;
      currentY = e.touches[0].clientY;

      const diffX = Math.abs(currentX - startX);
      const diffY = Math.abs(currentY - startY);

      // Detectar swipe horizontal
      if (diffX > diffY && diffX > 30) {
        isSwiping = true;
        // Prevenir scroll vertical durante swipe horizontal
        if (Math.abs(diffX) > Math.abs(diffY)) {
          e.preventDefault();
        }
      }
    }, { passive: false });

    document.addEventListener('touchend', (e) => {
      if (!isSwiping || !startX || !startY) {
        startX = 0;
        startY = 0;
        return;
      }

      const diffX = currentX - startX;
      const diffY = currentY - startY;

      // Swipe izquierda (siguiente)
      if (diffX < -50 && Math.abs(diffY) < 100) {
        this.handleSwipeLeft();
      }
      // Swipe derecha (anterior)
      else if (diffX > 50 && Math.abs(diffY) < 100) {
        this.handleSwipeRight();
      }

      startX = 0;
      startY = 0;
      isSwiping = false;
    }, { passive: true });
  }

  handleSwipeLeft() {
    // Navegar a siguiente sección
    const sections = document.querySelectorAll('section[id]');
    const currentSection = this.getCurrentSection();
    if (currentSection) {
      const currentIndex = Array.from(sections).indexOf(currentSection);
      if (currentIndex < sections.length - 1) {
        sections[currentIndex + 1].scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }

  handleSwipeRight() {
    // Navegar a sección anterior
    const sections = document.querySelectorAll('section[id]');
    const currentSection = this.getCurrentSection();
    if (currentSection) {
      const currentIndex = Array.from(sections).indexOf(currentSection);
      if (currentIndex > 0) {
        sections[currentIndex - 1].scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }

  getCurrentSection() {
    const sections = document.querySelectorAll('section[id]');
    const scrollPosition = window.scrollY + window.innerHeight / 2;

    for (let section of sections) {
      const sectionTop = section.offsetTop;
      const sectionBottom = sectionTop + section.offsetHeight;

      if (scrollPosition >= sectionTop && scrollPosition <= sectionBottom) {
        return section;
      }
    }

    return sections[0];
  }

  setupPullToRefresh() {
    let pullStartY = 0;
    let pullCurrentY = 0;
    let isPulling = false;
    const threshold = 80;

    // Crear indicador de pull to refresh
    const indicator = document.createElement('div');
    indicator.className = 'pull-to-refresh-indicator';
    indicator.innerHTML = '<i class="fas fa-sync-alt"></i>';
    document.body.appendChild(indicator);

    document.addEventListener('touchstart', (e) => {
      if (window.scrollY === 0) {
        pullStartY = e.touches[0].clientY;
        isPulling = true;
      }
    }, { passive: true });

    document.addEventListener('touchmove', (e) => {
      if (isPulling && window.scrollY === 0) {
        pullCurrentY = e.touches[0].clientY;
        const pullDistance = pullCurrentY - pullStartY;

        if (pullDistance > 0 && pullDistance < 150) {
          indicator.style.opacity = Math.min(pullDistance / threshold, 1);
          indicator.style.transform = `translateX(-50%) translateY(${Math.min(pullDistance, 60)}px)`;
          
          // Rotar el icono
          const rotation = (pullDistance / threshold) * 360;
          indicator.querySelector('i').style.transform = `rotate(${rotation}deg)`;
        }
      }
    }, { passive: true });

    document.addEventListener('touchend', () => {
      if (isPulling) {
        const pullDistance = pullCurrentY - pullStartY;
        
        if (pullDistance > threshold) {
          this.triggerRefresh();
        }

        // Reset
        indicator.style.opacity = '0';
        indicator.style.transform = 'translateX(-50%) translateY(0)';
        indicator.querySelector('i').style.transform = 'rotate(0deg)';
        isPulling = false;
        pullStartY = 0;
        pullCurrentY = 0;
      }
    }, { passive: true });
  }

  triggerRefresh() {
    // Mostrar feedback visual
    const indicator = document.querySelector('.pull-to-refresh-indicator');
    indicator.querySelector('i').classList.add('fa-spin');
    
    // Recargar la página después de un breve delay
    setTimeout(() => {
      window.location.reload();
    }, 500);
  }

  setupSmoothScrolling() {
    // Smooth scroll mejorado para móvil
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (href === '#') return;

        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          const offset = 80; // Altura del navbar
          const targetPosition = target.offsetTop - offset;

          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
        }
      });
    });
  }

  setupPerformanceOptimizations() {
    // Lazy load de imágenes
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            if (img.dataset.src) {
              img.src = img.dataset.src;
              img.removeAttribute('data-src');
              observer.unobserve(img);
            }
          }
        });
      });

      document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
      });
    }

    // Reducir animaciones en dispositivos lentos
    if (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4) {
      document.documentElement.style.setProperty('--transition-normal', '0.1s');
      document.documentElement.style.setProperty('--transition-slow', '0.2s');
    }
  }

  setupSafeAreaInsets() {
    // Aplicar safe area insets para iOS
    if (this.isIOS) {
      const style = document.createElement('style');
      style.textContent = `
        body {
          padding-top: env(safe-area-inset-top);
          padding-bottom: env(safe-area-inset-bottom);
        }
      `;
      document.head.appendChild(style);
    }
  }

  setupAppLikeBehavior() {
    // Prevenir bounce scroll en iOS
    if (this.isIOS) {
      document.body.style.overscrollBehavior = 'none';
    }

    // Agregar clase para estilos específicos de app
    if (this.isMobile) {
      document.documentElement.classList.add('mobile-device');
    }

    if (this.isIOS) {
      document.documentElement.classList.add('ios-device');
    }

    if (this.isAndroid) {
      document.documentElement.classList.add('android-device');
    }

    // Detectar orientación
    window.addEventListener('orientationchange', () => {
      setTimeout(() => {
        window.scrollTo(0, 0);
      }, 100);
    });

    // Prevenir scroll horizontal accidental
    document.addEventListener('touchmove', (e) => {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    }, { passive: false });

    // Conectar botón del navbar con menú móvil
    this.setupMobileMenuConnection();
  }

  setupMobileMenuConnection() {
    // Conectar el botón del navbar con el menú móvil
    const navbarToggle = document.getElementById('neurosearchMobileToggle');
    const mobileMenu = document.getElementById('mobileMenu');
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileOverlay = document.getElementById('mobileMenuOverlay');
    const mobileMenuClose = document.getElementById('mobileMenuClose');

    // Función para abrir el menú
    const openMenu = () => {
      if (mobileMenu) {
        mobileMenu.classList.add('active');
        if (navbarToggle) {
          navbarToggle.classList.add('active');
        }
        if (mobileOverlay) {
          mobileOverlay.classList.add('active');
        }
        document.body.style.overflow = 'hidden';
      }
    };

    // Función para cerrar el menú
    const closeMenu = () => {
      if (mobileMenu) {
        mobileMenu.classList.remove('active');
        if (navbarToggle) {
          navbarToggle.classList.remove('active');
        }
        if (mobileOverlay) {
          mobileOverlay.classList.remove('active');
        }
        document.body.style.overflow = '';
      }
    };

    // Botón toggle del navbar
    if (navbarToggle && mobileMenu) {
      navbarToggle.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (mobileMenu.classList.contains('active')) {
          closeMenu();
        } else {
          openMenu();
        }
      });
    }

    // Botón de cerrar
    if (mobileMenuClose) {
      mobileMenuClose.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        closeMenu();
      });
    }

    // Cerrar menú al hacer clic en overlay
    if (mobileOverlay) {
      mobileOverlay.addEventListener('click', (e) => {
        e.preventDefault();
        closeMenu();
      });
    }

    // Cerrar menú al hacer clic en enlaces
    const mobileNavLinks = document.querySelectorAll('.mobile-nav-link, .mobile-menu-link');
    mobileNavLinks.forEach(link => {
      link.addEventListener('click', () => {
        closeMenu();
      });
    });

    // Cerrar con Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobileMenu && mobileMenu.classList.contains('active')) {
        closeMenu();
      }
    });

    // Cerrar al hacer swipe izquierda en el menú
    if (mobileMenu) {
      let touchStartX = 0;
      let touchEndX = 0;

      mobileMenu.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
      }, { passive: true });

      mobileMenu.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        const swipeDistance = touchStartX - touchEndX;
        
        // Si el swipe es hacia la izquierda y es significativo, cerrar
        if (swipeDistance > 100) {
          closeMenu();
        }
      }, { passive: true });
    }
  }
}

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new MobileAppEnhancements();
  });
} else {
  new MobileAppEnhancements();
}

