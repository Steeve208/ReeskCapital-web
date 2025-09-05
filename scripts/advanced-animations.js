/* ================================
   ADVANCED ANIMATIONS.JS — SISTEMA AVANZADO DE ANIMACIONES Y MICRO-INTERACCIONES
================================ */

class AdvancedAnimationSystem {
  constructor() {
    this.animations = new Map();
    this.observers = new Map();
    this.isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.init();
  }

  init() {
    this.setupScrollReveal();
    this.setupIntersectionObserver();
    this.setupScrollIndicator();
    this.setupMagneticElements();
    this.setupRippleEffects();
    this.setupHoverEffects();
    this.setupClickEffects();
    this.setupFormAnimations();
    this.setupNotificationSystem();
    this.setupParallaxEffects();
    this.setupParticleSystem();
    this.setupGlitchEffects();
    this.setupTypewriterEffects();
    this.setupLoadingAnimations();
    this.setupModalAnimations();
    this.setupProgressAnimations();
    this.setupToggleAnimations();
    this.setupTooltipSystem();
    this.setupCursorEffects();
    this.setupPerformanceOptimizations();
  }

  // ===== SCROLL REVEAL SYSTEM =====
  setupScrollReveal() {
    const revealElements = document.querySelectorAll('[data-reveal]');
    
    revealElements.forEach((element, index) => {
      element.classList.add('scroll-reveal');
      element.style.animationDelay = `${index * 0.1}s`;
    });
  }

  setupIntersectionObserver() {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    this.intersectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          this.triggerAnimation(entry.target);
        }
      });
    }, observerOptions);

    // Observar elementos con animaciones
    document.querySelectorAll('.scroll-reveal, .scroll-reveal-left, .scroll-reveal-right').forEach(el => {
      this.intersectionObserver.observe(el);
    });
  }

  triggerAnimation(element) {
    const animationType = element.dataset.animation || 'fadeInUp';
    const delay = element.dataset.delay || 0;
    
    setTimeout(() => {
      element.classList.add(animationType);
      element.classList.add('animated');
    }, delay);
  }

  // ===== SCROLL INDICATOR =====
  setupScrollIndicator() {
    const indicator = document.createElement('div');
    indicator.className = 'scroll-indicator';
    document.body.appendChild(indicator);

    window.addEventListener('scroll', () => {
      const scrollTop = window.pageYOffset;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = (scrollTop / docHeight) * 100;
      
      indicator.style.width = `${scrollPercent}%`;
    });
  }

  // ===== MAGNETIC ELEMENTS =====
  setupMagneticElements() {
    const magneticElements = document.querySelectorAll('.btn-magnetic, .card-magnetic');
    
    magneticElements.forEach(element => {
      element.addEventListener('mousemove', (e) => {
        if (this.isReducedMotion) return;
        
        const rect = element.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        
        const strength = 0.3;
        element.style.transform = `translate(${x * strength}px, ${y * strength}px) scale(1.05)`;
      });

      element.addEventListener('mouseleave', () => {
        element.style.transform = 'translate(0, 0) scale(1)';
      });
    });
  }

  // ===== RIPPLE EFFECTS =====
  setupRippleEffects() {
    const rippleElements = document.querySelectorAll('.ripple-effect');
    
    rippleElements.forEach(element => {
      element.addEventListener('click', (e) => {
        if (this.isReducedMotion) return;
        
        const ripple = document.createElement('span');
        const rect = element.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        ripple.style.cssText = `
          position: absolute;
          width: ${size}px;
          height: ${size}px;
          left: ${x}px;
          top: ${y}px;
          background: rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          transform: scale(0);
          animation: ripple 0.6s linear;
          pointer-events: none;
        `;
        
        element.appendChild(ripple);
        
        setTimeout(() => {
          ripple.remove();
        }, 600);
      });
    });
  }

  // ===== HOVER EFFECTS =====
  setupHoverEffects() {
    // Efectos de hover para cards
    const cards = document.querySelectorAll('.card, .stat-card, .action-card');
    
    cards.forEach(card => {
      card.addEventListener('mouseenter', () => {
        if (this.isReducedMotion) return;
        
        card.classList.add('card-floating');
        this.addGlowEffect(card);
      });

      card.addEventListener('mouseleave', () => {
        card.classList.remove('card-floating');
        this.removeGlowEffect(card);
      });
    });

    // Efectos de hover para botones
    const buttons = document.querySelectorAll('.btn');
    
    buttons.forEach(button => {
      button.addEventListener('mouseenter', () => {
        if (this.isReducedMotion) return;
        
        button.classList.add('btn-magnetic');
        this.addPulseEffect(button);
      });

      button.addEventListener('mouseleave', () => {
        button.classList.remove('btn-magnetic');
        this.removePulseEffect(button);
      });
    });
  }

  addGlowEffect(element) {
    element.style.boxShadow = '0 0 20px rgba(0, 255, 136, 0.3)';
    element.style.transition = 'all 0.3s ease';
  }

  removeGlowEffect(element) {
    element.style.boxShadow = '';
  }

  addPulseEffect(element) {
    element.style.animation = 'pulse 2s infinite';
  }

  removePulseEffect(element) {
    element.style.animation = '';
  }

  // ===== CLICK EFFECTS =====
  setupClickEffects() {
    const clickElements = document.querySelectorAll('.btn, .card, .nav-item');
    
    clickElements.forEach(element => {
      element.addEventListener('click', (e) => {
        if (this.isReducedMotion) return;
        
        this.createClickEffect(e, element);
      });
    });
  }

  createClickEffect(event, element) {
    const effect = document.createElement('div');
    const rect = element.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    effect.style.cssText = `
      position: absolute;
      width: 20px;
      height: 20px;
      left: ${x - 10}px;
      top: ${y - 10}px;
      background: radial-gradient(circle, rgba(0, 255, 136, 0.8) 0%, transparent 70%);
      border-radius: 50%;
      transform: scale(0);
      animation: clickEffect 0.6s ease-out;
      pointer-events: none;
      z-index: 1000;
    `;
    
    element.style.position = 'relative';
    element.appendChild(effect);
    
    setTimeout(() => {
      effect.remove();
    }, 600);
  }

  // ===== FORM ANIMATIONS =====
  setupFormAnimations() {
    const formInputs = document.querySelectorAll('.form-input, .form-select, .form-textarea');
    
    formInputs.forEach(input => {
      input.classList.add('form-input-animated');
      
      input.addEventListener('focus', () => {
        if (this.isReducedMotion) return;
        
        input.parentElement.classList.add('focused');
        this.animateLabel(input);
      });

      input.addEventListener('blur', () => {
        input.parentElement.classList.remove('focused');
      });
    });
  }

  animateLabel(input) {
    const label = input.previousElementSibling;
    if (label && label.classList.contains('form-label-animated')) {
      label.style.transform = 'translateY(-5px) scale(0.9)';
      label.style.color = 'var(--primary-color)';
    }
  }

  // ===== NOTIFICATION SYSTEM =====
  setupNotificationSystem() {
    this.notificationContainer = document.createElement('div');
    this.notificationContainer.className = 'notification-container';
    this.notificationContainer.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 10000;
      display: flex;
      flex-direction: column;
      gap: 10px;
    `;
    document.body.appendChild(this.notificationContainer);
  }

  showNotification(message, type = 'info', duration = 3000) {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type} notification-slide-in`;
    notification.innerHTML = `
      <div class="notification-content">
        <span class="notification-text">${message}</span>
        <button class="notification-close">&times;</button>
      </div>
    `;
    
    this.notificationContainer.appendChild(notification);
    
    // Auto remove
    setTimeout(() => {
      this.hideNotification(notification);
    }, duration);
    
    // Manual close
    notification.querySelector('.notification-close').addEventListener('click', () => {
      this.hideNotification(notification);
    });
  }

  hideNotification(notification) {
    notification.classList.add('notification-slide-out');
    setTimeout(() => {
      notification.remove();
    }, 300);
  }

  // ===== PARALLAX EFFECTS =====
  setupParallaxEffects() {
    const parallaxElements = document.querySelectorAll('[data-parallax]');
    
    window.addEventListener('scroll', () => {
      if (this.isReducedMotion) return;
      
      const scrolled = window.pageYOffset;
      
      parallaxElements.forEach(element => {
        const speed = parseFloat(element.dataset.parallax) || 0.5;
        const yPos = -(scrolled * speed);
        element.style.transform = `translateY(${yPos}px)`;
      });
    });
  }

  // ===== PARTICLE SYSTEM =====
  setupParticleSystem() {
    const particleContainers = document.querySelectorAll('.particle-container');
    
    particleContainers.forEach(container => {
      this.createParticleSystem(container);
    });
  }

  createParticleSystem(container) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 1;
    `;
    
    container.appendChild(canvas);
    
    const particles = [];
    const particleCount = 50;
    
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 3 + 1,
        opacity: Math.random() * 0.5 + 0.2
      });
    }
    
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach(particle => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        
        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;
        
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 255, 136, ${particle.opacity})`;
        ctx.fill();
      });
      
      requestAnimationFrame(animate);
    };
    
    animate();
  }

  // ===== GLITCH EFFECTS =====
  setupGlitchEffects() {
    const glitchElements = document.querySelectorAll('.text-glitch');
    
    glitchElements.forEach(element => {
      element.addEventListener('mouseenter', () => {
        if (this.isReducedMotion) return;
        
        element.classList.add('text-glitch');
        setTimeout(() => {
          element.classList.remove('text-glitch');
        }, 300);
      });
    });
  }

  // ===== TYPEWRITER EFFECTS =====
  setupTypewriterEffects() {
    const typewriterElements = document.querySelectorAll('[data-typewriter]');
    
    typewriterElements.forEach(element => {
      const text = element.textContent;
      const speed = parseInt(element.dataset.speed) || 100;
      
      element.textContent = '';
      this.typewriterEffect(element, text, speed);
    });
  }

  typewriterEffect(element, text, speed) {
    let index = 0;
    
    const type = () => {
      if (index < text.length) {
        element.textContent += text[index];
        index++;
        setTimeout(type, speed);
      }
    };
    
    type();
  }

  // ===== LOADING ANIMATIONS =====
  setupLoadingAnimations() {
    const loadingElements = document.querySelectorAll('.loading');
    
    loadingElements.forEach(element => {
      element.style.animation = 'spin 1s linear infinite';
    });
  }

  // ===== MODAL ANIMATIONS =====
  setupModalAnimations() {
    const modals = document.querySelectorAll('.modal');
    
    modals.forEach(modal => {
      const backdrop = modal.querySelector('.modal-backdrop');
      const content = modal.querySelector('.modal-content');
      
      if (backdrop) {
        backdrop.addEventListener('click', () => {
          this.hideModal(modal);
        });
      }
      
      const closeButtons = modal.querySelectorAll('.modal-close');
      closeButtons.forEach(button => {
        button.addEventListener('click', () => {
          this.hideModal(modal);
        });
      });
    });
  }

  showModal(modal) {
    modal.style.display = 'flex';
    modal.classList.add('modal-backdrop');
    
    const content = modal.querySelector('.modal-content');
    if (content) {
      content.classList.add('modal-content');
    }
  }

  hideModal(modal) {
    const content = modal.querySelector('.modal-content');
    if (content) {
      content.classList.add('closing');
    }
    
    setTimeout(() => {
      modal.style.display = 'none';
      if (content) {
        content.classList.remove('closing');
      }
    }, 200);
  }

  // ===== PROGRESS ANIMATIONS =====
  setupProgressAnimations() {
    const progressBars = document.querySelectorAll('.progress-bar');
    
    progressBars.forEach(bar => {
      bar.classList.add('progress-bar-animated');
      
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const width = entry.target.dataset.width || '100%';
            entry.target.style.width = width;
          }
        });
      });
      
      observer.observe(bar);
    });
  }

  // ===== TOGGLE ANIMATIONS =====
  setupToggleAnimations() {
    const toggles = document.querySelectorAll('.toggle-switch');
    
    toggles.forEach(toggle => {
      toggle.addEventListener('click', () => {
        toggle.classList.toggle('active');
        
        // Trigger custom event
        const event = new CustomEvent('toggleChange', {
          detail: { active: toggle.classList.contains('active') }
        });
        toggle.dispatchEvent(event);
      });
    });
  }

  // ===== TOOLTIP SYSTEM =====
  setupTooltipSystem() {
    const tooltipElements = document.querySelectorAll('[data-tooltip]');
    
    tooltipElements.forEach(element => {
      element.classList.add('tooltip');
    });
  }

  // ===== CURSOR EFFECTS =====
  setupCursorEffects() {
    const cursor = document.createElement('div');
    cursor.className = 'custom-cursor';
    cursor.style.cssText = `
      position: fixed;
      width: 20px;
      height: 20px;
      background: var(--primary-color);
      border-radius: 50%;
      pointer-events: none;
      z-index: 10000;
      transition: transform 0.1s ease;
      mix-blend-mode: difference;
    `;
    
    document.body.appendChild(cursor);
    
    document.addEventListener('mousemove', (e) => {
      cursor.style.left = e.clientX - 10 + 'px';
      cursor.style.top = e.clientY - 10 + 'px';
    });
    
    // Cursor hover effects
    const hoverElements = document.querySelectorAll('a, button, .card, .btn');
    
    hoverElements.forEach(element => {
      element.addEventListener('mouseenter', () => {
        cursor.style.transform = 'scale(1.5)';
      });
      
      element.addEventListener('mouseleave', () => {
        cursor.style.transform = 'scale(1)';
      });
    });
  }

  // ===== PERFORMANCE OPTIMIZATIONS =====
  setupPerformanceOptimizations() {
    // Throttle scroll events
    let scrollTimeout;
    window.addEventListener('scroll', () => {
      if (scrollTimeout) return;
      
      scrollTimeout = setTimeout(() => {
        this.handleScroll();
        scrollTimeout = null;
      }, 16); // ~60fps
    });
    
    // Use requestAnimationFrame for animations
    this.animationFrame = null;
  }

  handleScroll() {
    // Handle scroll-based animations here
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
    
    this.animationFrame = requestAnimationFrame(() => {
      // Scroll animations logic
    });
  }

  // ===== UTILITY METHODS =====
  addAnimation(element, animationClass, duration = 1000) {
    element.classList.add(animationClass);
    
    setTimeout(() => {
      element.classList.remove(animationClass);
    }, duration);
  }

  removeAnimation(element, animationClass) {
    element.classList.remove(animationClass);
  }

  // ===== PUBLIC API =====
  showNotification(message, type = 'info', duration = 3000) {
    this.showNotification(message, type, duration);
  }

  showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      this.showModal(modal);
    }
  }

  hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      this.hideModal(modal);
    }
  }

  animateElement(element, animationType, duration = 1000) {
    this.addAnimation(element, animationType, duration);
  }
}

// ===== CSS ANIMATIONS =====
const style = document.createElement('style');
style.textContent = `
  @keyframes ripple {
    0% { transform: scale(0); opacity: 1; }
    100% { transform: scale(1); opacity: 0; }
  }
  
  @keyframes clickEffect {
    0% { transform: scale(0); opacity: 1; }
    100% { transform: scale(1); opacity: 0; }
  }
  
  .notification {
    background: rgba(0, 0, 0, 0.9);
    color: white;
    padding: 15px 20px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }
  
  .notification-success {
    background: rgba(34, 197, 94, 0.9);
  }
  
  .notification-error {
    background: rgba(239, 68, 68, 0.9);
  }
  
  .notification-warning {
    background: rgba(245, 158, 11, 0.9);
  }
  
  .notification-info {
    background: rgba(59, 130, 246, 0.9);
  }
  
  .notification-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 15px;
  }
  
  .notification-close {
    background: none;
    border: none;
    color: inherit;
    font-size: 18px;
    cursor: pointer;
    padding: 0;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: all 0.3s ease;
  }
  
  .notification-close:hover {
    background: rgba(255, 255, 255, 0.2);
  }
`;

document.head.appendChild(style);

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
  window.RSCAdvancedAnimations = new AdvancedAnimationSystem();
});

// ===== EXPORT FOR GLOBAL USE =====
window.RSCAdvancedAnimations = AdvancedAnimationSystem;
