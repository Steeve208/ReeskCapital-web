/* ===== MOBILE RESPONSIVE JAVASCRIPT ===== */
/* Mejora la funcionalidad móvil de RSC Chain */

class MobileResponsive {
  constructor() {
    this.mobileMenuOpen = false;
    this.touchStartY = 0;
    this.touchStartX = 0;
    this.isScrolling = false;
    
    this.init();
  }
  
  init() {
    this.setupMobileMenu();
    this.setupTouchGestures();
    this.setupScrollOptimizations();
    this.setupViewportFix();
    this.setupPerformanceOptimizations();
    this.setupAccessibility();
    
    console.log('📱 Mobile Responsive System initialized');
  }
  
  /* ===== MOBILE MENU ===== */
  setupMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileHamburger = document.getElementById('mobileHamburger');
    const mobileMenu = document.getElementById('mobileMenu');
    const mobileClose = document.getElementById('mobileClose');
    const mobileOverlay = document.getElementById('mobileMenuOverlay');
    
    // Mobile menu button (desktop navbar)
    if (mobileMenuBtn) {
      mobileMenuBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.toggleMobileMenu();
      });
    }
    
    // Mobile hamburger (mobile navbar)
    if (mobileHamburger) {
      mobileHamburger.addEventListener('click', (e) => {
        e.preventDefault();
        this.toggleMobileMenu();
      });
    }
    
    // Close button
    if (mobileClose) {
      mobileClose.addEventListener('click', (e) => {
        e.preventDefault();
        this.closeMobileMenu();
      });
    }
    
    // Overlay click
    if (mobileOverlay) {
      mobileOverlay.addEventListener('click', (e) => {
        e.preventDefault();
        this.closeMobileMenu();
      });
    }
    
    // Close on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.mobileMenuOpen) {
        this.closeMobileMenu();
      }
    });
    
    // Close on window resize to desktop
    window.addEventListener('resize', () => {
      if (window.innerWidth > 768 && this.mobileMenuOpen) {
        this.closeMobileMenu();
      }
    });
  }
  
  toggleMobileMenu() {
    const mobileMenu = document.getElementById('mobileMenu');
    const mobileOverlay = document.getElementById('mobileMenuOverlay');
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileHamburger = document.getElementById('mobileHamburger');
    
    if (!mobileMenu) return;
    
    this.mobileMenuOpen = !this.mobileMenuOpen;
    
    if (this.mobileMenuOpen) {
      this.openMobileMenu();
    } else {
      this.closeMobileMenu();
    }
  }
  
  openMobileMenu() {
    const mobileMenu = document.getElementById('mobileMenu');
    const mobileOverlay = document.getElementById('mobileMenuOverlay');
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileHamburger = document.getElementById('mobileHamburger');
    
    if (mobileMenu) {
      mobileMenu.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
    
    if (mobileOverlay) {
      mobileOverlay.classList.add('active');
    }
    
    if (mobileMenuBtn) {
      mobileMenuBtn.classList.add('open');
    }
    
    if (mobileHamburger) {
      mobileHamburger.classList.add('open');
    }
    
    // Animate menu items
    this.animateMenuItems();
    
    // Prevent body scroll
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
  }
  
  closeMobileMenu() {
    const mobileMenu = document.getElementById('mobileMenu');
    const mobileOverlay = document.getElementById('mobileMenuOverlay');
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileHamburger = document.getElementById('mobileHamburger');
    
    if (mobileMenu) {
      mobileMenu.classList.remove('active');
    }
    
    if (mobileOverlay) {
      mobileOverlay.classList.remove('active');
    }
    
    if (mobileMenuBtn) {
      mobileMenuBtn.classList.remove('open');
    }
    
    if (mobileHamburger) {
      mobileHamburger.classList.remove('open');
    }
    
    // Restore body scroll
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.width = '';
    
    this.mobileMenuOpen = false;
  }
  
  animateMenuItems() {
    const menuItems = document.querySelectorAll('.mobile-menu-link, .mobile-menu-action');
    
    menuItems.forEach((item, index) => {
      item.style.opacity = '0';
      item.style.transform = 'translateX(-20px)';
      
      setTimeout(() => {
        item.style.transition = 'all 0.3s ease';
        item.style.opacity = '1';
        item.style.transform = 'translateX(0)';
      }, index * 100);
    });
  }
  
  /* ===== TOUCH GESTURES ===== */
  setupTouchGestures() {
    // Swipe to close mobile menu
    let startX = 0;
    let startY = 0;
    let endX = 0;
    let endY = 0;
    
    document.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    });
    
    document.addEventListener('touchend', (e) => {
      endX = e.changedTouches[0].clientX;
      endY = e.changedTouches[0].clientY;
      
      const diffX = startX - endX;
      const diffY = startY - endY;
      
      // Swipe left to close menu
      if (this.mobileMenuOpen && diffX > 50 && Math.abs(diffY) < 100) {
        this.closeMobileMenu();
      }
    });
    
    // Pull to refresh simulation
    let pullStartY = 0;
    let pullCurrentY = 0;
    let isPulling = false;
    
    document.addEventListener('touchstart', (e) => {
      if (window.scrollY === 0) {
        pullStartY = e.touches[0].clientY;
        isPulling = true;
      }
    });
    
    document.addEventListener('touchmove', (e) => {
      if (isPulling && window.scrollY === 0) {
        pullCurrentY = e.touches[0].clientY;
        const pullDistance = pullCurrentY - pullStartY;
        
        if (pullDistance > 0) {
          e.preventDefault();
          // Add pull to refresh visual feedback
          this.showPullToRefresh(pullDistance);
        }
      }
    });
    
    document.addEventListener('touchend', () => {
      if (isPulling) {
        const pullDistance = pullCurrentY - pullStartY;
        
        if (pullDistance > 100) {
          this.triggerPullToRefresh();
        }
        
        this.hidePullToRefresh();
        isPulling = false;
      }
    });
  }
  
  showPullToRefresh(distance) {
    // Visual feedback for pull to refresh
    const indicator = document.querySelector('.pull-to-refresh-indicator');
    if (indicator) {
      const opacity = Math.min(distance / 100, 1);
      indicator.style.opacity = opacity;
      indicator.style.transform = `translateY(${Math.min(distance, 50)}px)`;
    }
  }
  
  hidePullToRefresh() {
    const indicator = document.querySelector('.pull-to-refresh-indicator');
    if (indicator) {
      indicator.style.opacity = '0';
      indicator.style.transform = 'translateY(0)';
    }
  }
  
  triggerPullToRefresh() {
    // Simulate refresh
    console.log('🔄 Pull to refresh triggered');
    window.location.reload();
  }
  
  /* ===== SCROLL OPTIMIZATIONS ===== */
  setupScrollOptimizations() {
    let ticking = false;
    
    const updateScrollPosition = () => {
      const scrollY = window.scrollY;
      const navbar = document.querySelector('.navbar');
      
      // Add/remove scrolled class for navbar styling
      if (navbar) {
        if (scrollY > 50) {
          navbar.classList.add('scrolled');
        } else {
          navbar.classList.remove('scrolled');
        }
      }
      
      // Update scroll indicator
      this.updateScrollIndicator();
      
      ticking = false;
    };
    
    const requestTick = () => {
      if (!ticking) {
        requestAnimationFrame(updateScrollPosition);
        ticking = true;
      }
    };
    
    window.addEventListener('scroll', requestTick, { passive: true });
  }
  
  updateScrollIndicator() {
    const scrollIndicator = document.querySelector('.scroll-indicator');
    if (scrollIndicator) {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = (scrollTop / scrollHeight) * 100;
      
      scrollIndicator.style.width = `${scrollPercent}%`;
    }
  }
  
  /* ===== VIEWPORT FIX ===== */
  setupViewportFix() {
    // Fix viewport height on mobile browsers
    const setViewportHeight = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };
    
    setViewportHeight();
    window.addEventListener('resize', setViewportHeight);
    window.addEventListener('orientationchange', () => {
      setTimeout(setViewportHeight, 100);
    });
  }
  
  /* ===== PERFORMANCE OPTIMIZATIONS ===== */
  setupPerformanceOptimizations() {
    // Reduce animations on low-end devices
    if (this.isLowEndDevice()) {
      this.reduceAnimations();
    }
    
    // Lazy load images
    this.setupLazyLoading();
    
    // Optimize scroll performance
    this.optimizeScrollPerformance();
  }
  
  isLowEndDevice() {
    // Simple heuristic to detect low-end devices
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    const memory = navigator.deviceMemory;
    const cores = navigator.hardwareConcurrency;
    
    return (
      (connection && connection.effectiveType === 'slow-2g') ||
      (memory && memory < 4) ||
      (cores && cores < 4) ||
      window.innerWidth < 360
    );
  }
  
  reduceAnimations() {
    // Disable heavy animations on low-end devices
    const style = document.createElement('style');
    style.textContent = `
      * {
        animation-duration: 0.1s !important;
        transition-duration: 0.1s !important;
      }
      
      .quantum-particles,
      .quantum-grid,
      .quantum-waves,
      .quantum-rings {
        animation: none !important;
      }
    `;
    document.head.appendChild(style);
  }
  
  setupLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries, observer) => {
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
      // Fallback for older browsers
      images.forEach(img => {
        img.src = img.dataset.src;
        img.classList.remove('lazy');
      });
    }
  }
  
  optimizeScrollPerformance() {
    // Use passive event listeners for better scroll performance
    const passiveEvents = ['scroll', 'touchstart', 'touchmove', 'wheel'];
    
    passiveEvents.forEach(event => {
      document.addEventListener(event, () => {}, { passive: true });
    });
  }
  
  /* ===== ACCESSIBILITY ===== */
  setupAccessibility() {
    // Focus management for mobile menu
    this.setupFocusManagement();
    
    // Keyboard navigation
    this.setupKeyboardNavigation();
    
    // Screen reader announcements
    this.setupScreenReaderSupport();
  }
  
  setupFocusManagement() {
    const mobileMenu = document.getElementById('mobileMenu');
    const focusableElements = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    
    if (mobileMenu) {
      const focusableContent = mobileMenu.querySelectorAll(focusableElements);
      const firstFocusableElement = focusableContent[0];
      const lastFocusableElement = focusableContent[focusableContent.length - 1];
      
      // Trap focus within mobile menu
      mobileMenu.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
          if (e.shiftKey) {
            if (document.activeElement === firstFocusableElement) {
              lastFocusableElement.focus();
              e.preventDefault();
            }
          } else {
            if (document.activeElement === lastFocusableElement) {
              firstFocusableElement.focus();
              e.preventDefault();
            }
          }
        }
      });
    }
  }
  
  setupKeyboardNavigation() {
    // Arrow key navigation for menu items
    const menuItems = document.querySelectorAll('.mobile-menu-link, .mobile-menu-action');
    
    menuItems.forEach((item, index) => {
      item.addEventListener('keydown', (e) => {
        switch (e.key) {
          case 'ArrowDown':
            e.preventDefault();
            const nextItem = menuItems[index + 1] || menuItems[0];
            nextItem.focus();
            break;
          case 'ArrowUp':
            e.preventDefault();
            const prevItem = menuItems[index - 1] || menuItems[menuItems.length - 1];
            prevItem.focus();
            break;
          case 'Enter':
          case ' ':
            e.preventDefault();
            item.click();
            break;
        }
      });
    });
  }
  
  setupScreenReaderSupport() {
    // Announce menu state changes
    const announceToScreenReader = (message) => {
      const announcement = document.createElement('div');
      announcement.setAttribute('aria-live', 'polite');
      announcement.setAttribute('aria-atomic', 'true');
      announcement.className = 'sr-only';
      announcement.textContent = message;
      
      document.body.appendChild(announcement);
      
      setTimeout(() => {
        document.body.removeChild(announcement);
      }, 1000);
    };
    
    // Override menu toggle to include announcements
    const originalToggle = this.toggleMobileMenu.bind(this);
    this.toggleMobileMenu = () => {
      originalToggle();
      const message = this.mobileMenuOpen ? 'Menu opened' : 'Menu closed';
      announceToScreenReader(message);
    };
  }
  
  /* ===== UTILITY METHODS ===== */
  
  // Smooth scroll to element
  scrollToElement(element, offset = 0) {
    if (element) {
      const elementPosition = element.offsetTop - offset;
      window.scrollTo({
        top: elementPosition,
        behavior: 'smooth'
      });
    }
  }
  
  // Check if element is in viewport
  isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  }
  
  // Debounce function
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
  
  // Throttle function
  throttle(func, limit) {
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
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new MobileResponsive();
});

// Export for global access
window.MobileResponsive = MobileResponsive;
