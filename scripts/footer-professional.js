/* ================================
   FOOTER PROFESIONAL AVANZADO
   🌟 INTERACTIVO • 🎮 GAMIFICADO • 🔮 FUTURISTA
================================ */

class AdvancedFooter {
  constructor() {
    this.isInitialized = false;
    this.animations = [];
    this.stats = {
      users: 2500000,
      tps: 50000,
      security: 100,
      uptime: 99.99
    };
    this.init();
  }

  init() {
    if (this.isInitialized) return;
    
    console.log('🚀 Inicializando Footer Avanzado...');
    
    this.createParticles();
    this.initializeAnimations();
    this.setupEventListeners();
    this.initializeStats();
    this.setupScrollAnimations();
    this.initializeNewsletter();
    this.setupBackToTop();
    this.createInteractiveElements();
    
    this.isInitialized = true;
    console.log('✅ Footer Avanzado inicializado correctamente');
  }

  // =====================
  // SISTEMA DE PARTÍCULAS 3D
  // =====================

  createParticles() {
    const footer = document.querySelector('.footer-professional');
    if (!footer) return;

    const particlesContainer = document.createElement('div');
    particlesContainer.className = 'footer-particles-3d';
    
    // Crear partículas 3D
    for (let i = 0; i < 15; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle-3d';
      particle.style.left = Math.random() * 100 + '%';
      particle.style.animationDelay = Math.random() * 20 + 's';
      particle.style.animationDuration = (15 + Math.random() * 10) + 's';
      
      // Hacer partículas interactivas
      particle.addEventListener('mouseenter', () => this.onParticleHover(particle));
      particle.addEventListener('mouseleave', () => this.onParticleLeave(particle));
      
      particlesContainer.appendChild(particle);
      this.particles.push(particle);
    }
    
    footer.appendChild(particlesContainer);
    
    // Crear grid holográfico
    const grid = document.createElement('div');
    grid.className = 'footer-holographic-grid';
    footer.appendChild(grid);
  }

  onParticleHover(particle) {
    particle.style.background = '#00ccff';
    particle.style.transform = 'scale(3)';
    particle.style.boxShadow = '0 0 30px #00ccff';
    particle.style.zIndex = '1000';
  }

  onParticleLeave(particle) {
    particle.style.background = '#00ff88';
    particle.style.transform = 'scale(1)';
    particle.style.boxShadow = 'none';
    particle.style.zIndex = '1';
  }

  // =====================
  // ANIMACIONES AVANZADAS
  // =====================

  initializeAnimations() {
    // Animación de entrada para columnas
    const columns = document.querySelectorAll('.footer-column');
    columns.forEach((column, index) => {
      column.style.animationDelay = `${index * 0.2}s`;
      column.classList.add('animate-in');
    });

    // Animación de estadísticas
    this.animateStats();
  }

  animateStats() {
    const statNumbers = document.querySelectorAll('.stat-number');
    statNumbers.forEach(stat => {
      const finalValue = stat.textContent;
      const isPercentage = finalValue.includes('%');
      const isPlus = finalValue.includes('+');
      const isK = finalValue.includes('K');
      const isM = finalValue.includes('M');
      
      let numericValue = parseFloat(finalValue.replace(/[^0-9.]/g, ''));
      let currentValue = 0;
      let increment = numericValue / 50;
      
      const animate = () => {
        currentValue += increment;
        if (currentValue >= numericValue) {
          currentValue = numericValue;
        }
        
        let displayValue = Math.floor(currentValue);
        if (isK) displayValue += 'K';
        if (isM) displayValue += 'M';
        if (isPercentage) displayValue += '%';
        if (isPlus) displayValue += '+';
        
        stat.textContent = displayValue;
        
        if (currentValue < numericValue) {
          requestAnimationFrame(animate);
        }
      };
      
      // Iniciar animación cuando sea visible
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            animate();
            observer.unobserve(entry.target);
          }
        });
      });
      
      observer.observe(stat);
    });
  }

  // =====================
  // EVENT LISTENERS AVANZADOS
  // =====================

  setupEventListeners() {
    // Hover effects para enlaces
    const footerLinks = document.querySelectorAll('.footer-link');
    footerLinks.forEach(link => {
      link.addEventListener('mouseenter', (e) => this.onLinkHover(e));
      link.addEventListener('mouseleave', (e) => this.onLinkLeave(e));
    });

    // Hover effects para redes sociales
    const socialLinks = document.querySelectorAll('.social-link');
    socialLinks.forEach(link => {
      link.addEventListener('mouseenter', (e) => this.onSocialHover(e));
      link.addEventListener('mouseleave', (e) => this.onSocialLeave(e));
    });

    // Hover effects para estadísticas
    const statItems = document.querySelectorAll('.stat-item');
    statItems.forEach(item => {
      item.addEventListener('mouseenter', (e) => this.onStatHover(e));
      item.addEventListener('mouseleave', (e) => this.onStatLeave(e));
    });

    // Efectos de hover para elementos de la empresa
    const companyElements = document.querySelectorAll('.company-vision, .company-mission');
    companyElements.forEach(element => {
      element.addEventListener('mouseenter', (e) => this.onCompanyElementHover(e));
      element.addEventListener('mouseleave', (e) => this.onCompanyElementLeave(e));
    });
  }

  onLinkHover(e) {
    const link = e.currentTarget;
    const icon = link.querySelector('.link-icon');
    
    // Efecto de brillo
    link.style.boxShadow = '0 0 30px rgba(0, 255, 136, 0.4)';
    
    // Animación del icono
    if (icon) {
      icon.style.transform = 'scale(1.5) rotate(15deg)';
      icon.style.color = '#00ff88';
    }
  }

  onLinkLeave(e) {
    const link = e.currentTarget;
    const icon = link.querySelector('.link-icon');
    
    link.style.boxShadow = '';
    
    if (icon) {
      icon.style.transform = '';
      icon.style.color = '';
    }
  }

  onSocialHover(e) {
    const link = e.currentTarget;
    const icon = link.querySelector('.social-icon');
    
    link.style.transform = 'translateY(-8px) scale(1.08)';
    link.style.boxShadow = '0 12px 35px rgba(0, 255, 136, 0.4)';
    
    if (icon) {
      icon.style.transform = 'rotate(20deg) scale(1.4)';
    }
  }

  onSocialLeave(e) {
    const link = e.currentTarget;
    const icon = link.querySelector('.social-icon');
    
    link.style.transform = '';
    link.style.boxShadow = '';
    
    if (icon) {
      icon.style.transform = '';
    }
  }

  onStatHover(e) {
    const item = e.currentTarget;
    const number = item.querySelector('.stat-number');
    
    item.style.transform = 'translateY(-10px) scale(1.08)';
    item.style.boxShadow = '0 20px 50px rgba(0, 255, 136, 0.4)';
    
    if (number) {
      number.style.transform = 'scale(1.2)';
      number.style.color = '#00ccff';
    }
  }

  onStatLeave(e) {
    const item = e.currentTarget;
    const number = item.querySelector('.stat-number');
    
    item.style.transform = '';
    item.style.boxShadow = '';
    
    if (number) {
      number.style.transform = '';
      number.style.color = '';
    }
  }

  onCompanyElementHover(e) {
    const element = e.currentTarget;
    element.style.transform = 'translateY(-8px) scale(1.03)';
    element.style.boxShadow = '0 15px 40px rgba(0, 255, 136, 0.3)';
  }

  onCompanyElementLeave(e) {
    const element = e.currentTarget;
    element.style.transform = '';
    element.style.boxShadow = '';
  }

  // =====================
  // ESTADÍSTICAS INTERACTIVAS
  // =====================

  initializeStats() {
    // Actualizar estadísticas en tiempo real
    setInterval(() => {
      this.updateStats();
    }, 5000);
    
    // Hacer estadísticas clickeables
    const statItems = document.querySelectorAll('.stat-item');
    statItems.forEach((item, index) => {
      item.style.cursor = 'pointer';
      item.addEventListener('click', () => this.onStatClick(index));
    });
  }

  updateStats() {
    // Simular actualizaciones en tiempo real
    const statNumbers = document.querySelectorAll('.stat-number');
    
    statNumbers.forEach((stat, index) => {
      const currentText = stat.textContent;
      let newValue;
      
      switch(index) {
        case 0: // Usuarios
          const currentUsers = parseInt(currentText.replace(/[^0-9]/g, ''));
          newValue = currentUsers + Math.floor(Math.random() * 1000);
          stat.textContent = newValue.toLocaleString() + '+';
          break;
        case 1: // TPS
          const currentTPS = parseInt(currentText.replace(/[^0-9]/g, ''));
          newValue = currentTPS + Math.floor(Math.random() * 100);
          stat.textContent = newValue.toLocaleString() + '+';
          break;
        case 2: // Seguridad
          stat.textContent = '100%';
          break;
        case 3: // Uptime
          const uptime = (99.99 + Math.random() * 0.01).toFixed(2);
          stat.textContent = uptime + '%';
          break;
      }
      
      // Efecto de actualización
      stat.style.animation = 'none';
      stat.offsetHeight; // Trigger reflow
      stat.style.animation = 'statUpdate 0.5s ease';
    });
  }

  onStatClick(index) {
    const statNames = ['Usuarios Activos', 'TPS', 'Seguridad', 'Uptime'];
    const statValues = document.querySelectorAll('.stat-number');
    const value = statValues[index].textContent;
    
    this.showNotification(
      `📊 ${statNames[index]}: ${value}`,
      'info'
    );
    
    // Efecto visual
    statValues[index].style.transform = 'scale(1.3)';
    setTimeout(() => {
      statValues[index].style.transform = '';
    }, 300);
  }

  // =====================
  // ANIMACIONES DE SCROLL
  // =====================

  setupScrollAnimations() {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, observerOptions);

    // Observar elementos para animaciones
    const elements = document.querySelectorAll(`
      .footer-column, .stat-item, .newsletter-section, 
      .legal-section, .social-proof-section, .back-to-top-section
    `);
    
    elements.forEach(element => {
      observer.observe(element);
    });
  }

  // =====================
  // NEWSLETTER INTERACTIVO
  // =====================

  initializeNewsletter() {
    const form = document.querySelector('.newsletter-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleNewsletterSubmit(e);
    });

    // Efectos de focus
    const input = form.querySelector('.newsletter-input');
    if (input) {
      input.addEventListener('focus', () => this.onNewsletterFocus());
      input.addEventListener('blur', () => this.onNewsletterBlur());
    }
  }

  onNewsletterFocus() {
    const form = document.querySelector('.newsletter-form');
    form.style.transform = 'scale(1.02)';
    form.style.boxShadow = '0 0 30px rgba(0, 255, 136, 0.3)';
  }

  onNewsletterBlur() {
    const form = document.querySelector('.newsletter-form');
    form.style.transform = '';
    form.style.boxShadow = '';
  }

  async handleNewsletterSubmit(e) {
    const form = e.currentTarget;
    const input = form.querySelector('.newsletter-input');
    const button = form.querySelector('.newsletter-btn');
    const email = input.value;

    if (!this.validateEmail(email)) {
      this.showNotification('❌ Por favor, ingresa un email válido', 'error');
      return;
    }

    // Simular envío
    button.disabled = true;
    button.innerHTML = '<span>Enviando...</span><span class="btn-arrow">⏳</span>';
    
    try {
      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      this.showNotification('✅ ¡Te has suscrito exitosamente!', 'success');
      input.value = '';
      
      // Efecto de celebración
      this.celebrateNewsletter();
      
    } catch (error) {
      this.showNotification('❌ Error al suscribirse. Intenta de nuevo.', 'error');
    } finally {
      button.disabled = false;
      button.innerHTML = '<span>Suscribirse</span><span class="btn-arrow">→</span>';
    }
  }

  validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  celebrateNewsletter() {
    // Crear confeti
    for (let i = 0; i < 20; i++) {
      this.createConfetti();
    }
    
    // Efecto de brillo en el formulario
    const form = document.querySelector('.newsletter-form');
    form.style.animation = 'newsletterSuccess 1s ease';
    
    setTimeout(() => {
      form.style.animation = '';
    }, 1000);
  }

  createConfetti() {
    const confetti = document.createElement('div');
    confetti.style.cssText = `
      position: fixed;
      width: 10px;
      height: 10px;
      background: ${['#00ff88', '#00ccff', '#ff6b9d'][Math.floor(Math.random() * 3)]};
      top: -10px;
      left: ${Math.random() * window.innerWidth}px;
      pointer-events: none;
      z-index: 10000;
      animation: confettiFall 3s linear forwards;
    `;
    
    document.body.appendChild(confetti);
    
    setTimeout(() => {
      confetti.remove();
    }, 3000);
  }

  // =====================
  // BOTÓN VOLVER ARRIBA
  // =====================

  setupBackToTop() {
    const button = document.getElementById('backToTop');
    if (!button) return;

    // Mostrar/ocultar botón
    window.addEventListener('scroll', () => {
      if (window.pageYOffset > 300) {
        button.style.opacity = '1';
        button.style.visibility = 'visible';
      } else {
        button.style.opacity = '0';
        button.style.visibility = 'hidden';
      }
    });

    // Funcionalidad del botón
    button.addEventListener('click', () => {
      this.scrollToTop();
    });

    // Hover effects
    button.addEventListener('mouseenter', () => {
      button.style.transform = 'translateY(-8px) scale(1.1)';
      button.style.boxShadow = '0 15px 40px rgba(0, 255, 136, 0.4)';
    });

    button.addEventListener('mouseleave', () => {
      button.style.transform = '';
      button.style.boxShadow = '';
    });
  }

  scrollToTop() {
    const scrollStep = -window.scrollY / (500 / 15);
    const scrollInterval = setInterval(() => {
      if (window.scrollY !== 0) {
        window.scrollBy(0, scrollStep);
      } else {
        clearInterval(scrollInterval);
      }
    }, 15);
  }

  // =====================
  // ELEMENTOS INTERACTIVOS
  // =====================

  createInteractiveElements() {
    // Crear tooltips para enlaces
    this.createTooltips();
    
    // Crear efectos de ripple
    this.createRippleEffects();
    
    // Crear indicadores de progreso
    this.createProgressIndicators();
  }

  createTooltips() {
    const links = document.querySelectorAll('.footer-link, .social-link');
    
    links.forEach(link => {
      const tooltip = document.createElement('div');
      tooltip.className = 'footer-tooltip';
      tooltip.textContent = link.textContent.trim();
      tooltip.style.cssText = `
        position: absolute;
        background: rgba(0, 0, 0, 0.9);
        color: white;
        padding: 8px 12px;
        border-radius: 6px;
        font-size: 12px;
        pointer-events: none;
        opacity: 0;
        transform: translateY(10px);
        transition: all 0.3s ease;
        z-index: 1000;
        white-space: nowrap;
      `;
      
      link.style.position = 'relative';
      link.appendChild(tooltip);
      
      link.addEventListener('mouseenter', () => {
        tooltip.style.opacity = '1';
        tooltip.style.transform = 'translateY(0)';
      });
      
      link.addEventListener('mouseleave', () => {
        tooltip.style.opacity = '0';
        tooltip.style.transform = 'translateY(10px)';
      });
    });
  }

  createRippleEffects() {
    const buttons = document.querySelectorAll('.newsletter-btn, .back-to-top-btn');
    
    buttons.forEach(button => {
      button.addEventListener('click', (e) => {
        this.createRipple(e, button);
      });
    });
  }

  createRipple(event, element) {
    const ripple = document.createElement('span');
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
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
    
    element.style.position = 'relative';
    element.appendChild(ripple);
    
    setTimeout(() => {
      ripple.remove();
    }, 600);
  }

  createProgressIndicators() {
    // Crear indicador de progreso para el footer
    const progressBar = document.createElement('div');
    progressBar.className = 'footer-progress';
    progressBar.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 0%;
      height: 3px;
      background: linear-gradient(90deg, #00ff88, #00ccff);
      z-index: 10001;
      transition: width 0.3s ease;
    `;
    
    document.body.appendChild(progressBar);
    
    // Actualizar progreso basado en scroll
    window.addEventListener('scroll', () => {
      const scrollTop = window.pageYOffset;
      const docHeight = document.body.scrollHeight - window.innerHeight;
      const scrollPercent = (scrollTop / docHeight) * 100;
      progressBar.style.width = scrollPercent + '%';
    });
  }

  // =====================
  // SISTEMA DE NOTIFICACIONES
  // =====================

  showNotification(message, type = 'info') {
    // Remover notificaciones existentes
    const existingNotifications = document.querySelectorAll('.footer-notification');
    existingNotifications.forEach(notification => notification.remove());

    const notification = document.createElement('div');
    notification.className = `footer-notification ${type}`;
    
    const icon = this.getNotificationIcon(type);
    notification.innerHTML = `
      <span class="notification-icon">${icon}</span>
      <span class="notification-text">${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    // Mostrar notificación
    setTimeout(() => {
      notification.classList.add('show');
    }, 100);
    
    // Auto-ocultar
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => {
        notification.remove();
      }, 500);
    }, 4000);
  }

  getNotificationIcon(type) {
    const icons = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️'
    };
    return icons[type] || icons.info;
  }

  // =====================
  // UTILIDADES
  // =====================

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

// =====================
// INICIALIZACIÓN
// =====================

document.addEventListener('DOMContentLoaded', () => {
  // Esperar a que el footer esté listo
  const footer = document.querySelector('.footer-professional');
  if (footer) {
    // Inicializar después de un pequeño delay para asegurar que todo esté cargado
    setTimeout(() => {
      window.advancedFooter = new AdvancedFooter();
    }, 100);
  }
});

// =====================
// ESTILOS CSS DINÁMICOS
// =====================

const dynamicStyles = `
  @keyframes statUpdate {
    0% { transform: scale(1); }
    50% { transform: scale(1.2); }
    100% { transform: scale(1); }
  }
  
  @keyframes confettiFall {
    0% { transform: translateY(0) rotate(0deg); }
    100% { transform: translateY(100vh) rotate(720deg); }
  }
  
  @keyframes newsletterSuccess {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
  }
  
  @keyframes ripple {
    to { transform: scale(4); opacity: 0; }
  }
  
  .footer-tooltip {
    position: absolute;
    background: rgba(0, 0, 0, 0.9);
    color: white;
    padding: 8px 12px;
    border-radius: 6px;
    font-size: 12px;
    pointer-events: none;
    opacity: 0;
    transform: translateY(10px);
    transition: all 0.3s ease;
    z-index: 1000;
    white-space: nowrap;
  }
  
  .footer-progress {
    position: fixed;
    top: 0;
    left: 0;
    width: 0%;
    height: 3px;
    background: linear-gradient(90deg, #00ff88, #00ccff);
    z-index: 10001;
    transition: width 0.3s ease;
  }
`;

// Insertar estilos dinámicos
const styleSheet = document.createElement('style');
styleSheet.textContent = dynamicStyles;
document.head.appendChild(styleSheet);

// =====================
// EXPORTAR PARA USO GLOBAL
// =====================

if (typeof module !== 'undefined' && module.exports) {
  module.exports = AdvancedFooter;
} else if (typeof window !== 'undefined') {
  window.AdvancedFooter = AdvancedFooter;
}
