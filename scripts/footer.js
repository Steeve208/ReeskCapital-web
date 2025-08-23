// ===== FOOTER AVANZADO - RSC CHAIN =====

class AdvancedFooter {
  constructor() {
    this.metrics = {};
    this.updateInterval = null;
    this.particles = [];
    this.init();
  }

  init() {
    this.setupParticles();
    this.setupMetrics();
    this.setupNewsletter();
    this.setupModals();
    this.setupAnimations();
    this.startLiveUpdates();
  }

  // ===== SISTEMA DE PARTÍCULAS =====
  setupParticles() {
    const container = document.getElementById('footerParticles');
    if (!container) return;

    // Crear partículas iniciales
    for (let i = 0; i < 30; i++) {
      this.createParticle(container);
    }

    // Animar partículas
    setInterval(() => {
      this.animateParticles();
    }, 200);
  }

  createParticle(container) {
    const particle = document.createElement('div');
    particle.className = 'footer-particle';
    particle.style.left = Math.random() * 100 + '%';
    particle.style.animationDelay = Math.random() * 15 + 's';
    particle.style.animationDuration = (Math.random() * 5 + 10) + 's';
    container.appendChild(particle);
    this.particles.push(particle);
  }

  animateParticles() {
    this.particles.forEach(particle => {
      if (Math.random() < 0.05) {
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = '0s';
      }
    });
  }

  // ===== MÉTRICAS EN TIEMPO REAL =====
  setupMetrics() {
    // Cargar métricas iniciales
    this.loadMetrics();
    
    // Configurar botón de refresh
    const refreshBtn = document.getElementById('refreshMetrics');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => {
        this.refreshMetrics();
      });
    }
  }

  async loadMetrics() {
    try {
      // Simular llamada a API real
      const response = await fetch('/api/blockchain/stats');
      const data = await response.json();
      
      this.updateMetricsDisplay(data);
    } catch (error) {
      // Fallback con datos mock
      this.updateMetricsDisplay(this.getMockData());
    }
  }

  async getMockData() {
    try {
      // Intentar obtener datos reales de la API de RSC Chain
      const response = await fetch('https://rsc-chain-production.up.railway.app/api/blockchain/stats');
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Métricas reales obtenidas desde RSC Chain API');
        return {
          price: data.rsc_price || 0,
          priceChange: data.price_change || 0,
          marketCap: data.market_cap || 0,
          marketCapChange: data.market_cap_change || 0,
          activeNodes: data.nodes || 0,
          tps: data.tps || 0,
          stakedSupply: data.staked_supply || 0,
          uptime: data.uptime || 0,
          tokenPrice: data.rsc_price || 0,
          stakingAPY: data.staking_apy || 0,
          hashrate: data.hashrate || 0
        };
      }
    } catch (error) {
      console.warn('⚠️ No se pudieron cargar métricas reales:', error.message);
    }
    
    // Fallback a valores vacíos si no hay conexión
    return {
      price: 0,
      priceChange: 0,
      marketCap: 0,
      marketCapChange: 0,
      activeNodes: 0,
      tps: 0,
      stakedSupply: 0,
      uptime: 0,
      tokenPrice: 0,
      stakingAPY: 0,
      hashrate: 0
    };
  }

  updateMetricsDisplay(data) {
    // Precio RSC
    this.updateMetric('livePrice', `$${data.price.toFixed(4)}`);
    this.updateMetric('priceChange', `${data.priceChange > 0 ? '+' : ''}${(data.priceChange * 100).toFixed(2)}%`);
    this.updateMetricClass('priceChange', data.priceChange > 0 ? 'positive' : 'negative');

    // Market Cap
    this.updateMetric('marketCap', `$${(data.marketCap / 1000000).toFixed(2)}M`);
    this.updateMetric('capChange', `${data.marketCapChange > 0 ? '+' : ''}${(data.marketCapChange * 100).toFixed(2)}%`);
    this.updateMetricClass('capChange', data.marketCapChange > 0 ? 'positive' : 'negative');

    // Nodos activos
    this.updateMetric('activeNodes', data.activeNodes);

    // TPS
    this.updateMetric('tps', data.tps.toLocaleString());

    // Supply staked
    this.updateMetric('stakedSupply', `${data.stakedSupply.toFixed(1)}%`);
    this.updateProgressBar('stakedProgress', data.stakedSupply);

    // Uptime
    this.updateMetric('uptime', `${data.uptime}%`);

    // Token price (ecosistema)
    this.updateMetric('tokenPrice', `$${data.tokenPrice.toFixed(4)}`);

    // Staking APY
    this.updateMetric('stakingAPY', `${data.stakingAPY.toFixed(1)}%`);

    // Hashrate
    this.updateMetric('hashrate', `${data.hashrate.toFixed(1)} TH/s`);

    // Actualizar timestamp
    this.updateLastUpdate();
  }

  updateMetric(elementId, value) {
    const element = document.getElementById(elementId);
    if (element) {
      // Efecto de parpadeo al actualizar
      element.style.animation = 'none';
      element.offsetHeight; // Trigger reflow
      element.style.animation = 'metricUpdate 0.3s ease';
      
      element.textContent = value;
    }
  }

  updateMetricClass(elementId, className) {
    const element = document.getElementById(elementId);
    if (element) {
      element.className = `metric-change ${className}`;
    }
  }

  updateProgressBar(elementId, percentage) {
    const element = document.getElementById(elementId);
    if (element) {
      element.style.width = `${percentage}%`;
    }
  }

  updateLastUpdate() {
    const element = document.getElementById('lastUpdate');
    if (element) {
      const now = new Date();
      element.textContent = `Última actualización: ${now.toLocaleTimeString()}`;
    }
  }

  async refreshMetrics() {
    const refreshBtn = document.getElementById('refreshMetrics');
    if (refreshBtn) {
      refreshBtn.style.transform = 'rotate(360deg)';
      setTimeout(() => {
        refreshBtn.style.transform = 'rotate(0deg)';
      }, 1000);
    }

    await this.loadMetrics();
  }

  startLiveUpdates() {
    // Actualizar métricas cada 15 segundos
    this.updateInterval = setInterval(() => {
      this.loadMetrics();
    }, 15000);
  }

  // ===== NEWSLETTER AVANZADO =====
  setupNewsletter() {
    const emailInput = document.getElementById('newsletterEmail');
    const submitBtn = document.getElementById('newsletterBtn');
    const validationEl = document.getElementById('emailValidation');

    if (emailInput && submitBtn) {
      // Validación en tiempo real
      emailInput.addEventListener('input', (e) => {
        this.validateEmail(e.target.value, validationEl);
      });

      // Envío del formulario
      submitBtn.addEventListener('click', () => {
        this.handleNewsletterSubmit(emailInput.value, submitBtn, validationEl);
      });

      // Enter key
      emailInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          this.handleNewsletterSubmit(emailInput.value, submitBtn, validationEl);
        }
      });
    }
  }

  validateEmail(email, validationEl) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!email) {
      this.showValidation(validationEl, '', '');
      return false;
    }
    
    if (!emailRegex.test(email)) {
      this.showValidation(validationEl, 'error', 'Email inválido');
      return false;
    }
    
    this.showValidation(validationEl, 'success', 'Email válido');
    return true;
  }

  showValidation(element, type, message) {
    if (element) {
      element.textContent = message;
      element.className = `validation-message ${type}`;
    }
  }

  async handleNewsletterSubmit(email, submitBtn, validationEl) {
    if (!this.validateEmail(email, validationEl)) {
      return;
    }

    // Mostrar estado de carga
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;

    try {
      // Simular envío a API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Guardar en localStorage
      const subscribers = JSON.parse(localStorage.getItem('newsletter_subscribers') || '[]');
      if (!subscribers.includes(email)) {
        subscribers.push(email);
        localStorage.setItem('newsletter_subscribers', JSON.stringify(subscribers));
      }

      // Mostrar éxito
      this.showNewsletterSuccess(validationEl);
      
      // Limpiar input
      document.getElementById('newsletterEmail').value = '';
      
    } catch (error) {
      this.showValidation(validationEl, 'error', 'Error al suscribirse');
    } finally {
      submitBtn.classList.remove('loading');
      submitBtn.disabled = false;
    }
  }

  showNewsletterSuccess(validationEl) {
    this.showValidation(validationEl, 'success', '¡Suscrito exitosamente!');
    
    // Mostrar notificación
    this.showNotification('¡Bienvenido a RSC Chain!', 'Te mantendremos informado sobre las últimas actualizaciones.', 'success');
  }

  // ===== MODALES LEGALES =====
  setupModals() {
    const modalTriggers = document.querySelectorAll('[data-modal]');
    const modals = document.querySelectorAll('.legal-modal');

    modalTriggers.forEach(trigger => {
      trigger.addEventListener('click', (e) => {
        e.preventDefault();
        const modalId = trigger.dataset.modal + 'Modal';
        this.openModal(modalId);
      });
    });

    modals.forEach(modal => {
      const closeBtn = modal.querySelector('.modal-close');
      if (closeBtn) {
        closeBtn.addEventListener('click', () => {
          this.closeModal(modal);
        });
      }

      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          this.closeModal(modal);
        }
      });
    });

    // Cerrar con Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeAllModals();
      }
    });
  }

  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  }

  closeModal(modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }

  closeAllModals() {
    const modals = document.querySelectorAll('.legal-modal');
    modals.forEach(modal => {
      this.closeModal(modal);
    });
  }

  // ===== ANIMACIONES AVANZADAS =====
  setupAnimations() {
    // Animación de entrada de secciones
    const sections = document.querySelectorAll('.footer-section');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.animation = 'sectionEntrance 0.8s ease forwards';
        }
      });
    }, { threshold: 0.1 });

    sections.forEach(section => {
      observer.observe(section);
    });

    // Animación de métricas
    this.setupMetricAnimations();
  }

  setupMetricAnimations() {
    const metricCards = document.querySelectorAll('.metric-card');
    
    metricCards.forEach(card => {
      card.addEventListener('mouseenter', () => {
        this.animateMetricCard(card, true);
      });
      
      card.addEventListener('mouseleave', () => {
        this.animateMetricCard(card, false);
      });
    });
  }

  animateMetricCard(card, isEntering) {
    if (isEntering) {
      card.style.transform = 'translateY(-5px) scale(1.02)';
      card.style.boxShadow = '0 15px 35px rgba(78, 205, 196, 0.3)';
    } else {
      card.style.transform = 'translateY(0) scale(1)';
      card.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.2)';
    }
  }

  // ===== NOTIFICACIONES =====
  showNotification(title, message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `footer-notification ${type}`;
    notification.innerHTML = `
      <div class="notification-header">
        <span class="notification-icon">${this.getNotificationIcon(type)}</span>
        <span class="notification-title">${title}</span>
        <button class="notification-close">&times;</button>
      </div>
      <div class="notification-message">${message}</div>
    `;

    document.body.appendChild(notification);

    // Animar entrada
    setTimeout(() => {
      notification.classList.add('show');
    }, 10);

    // Auto-remover después de 5 segundos
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => {
        notification.remove();
      }, 300);
    }, 5000);

    // Cerrar manualmente
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
      notification.classList.remove('show');
      setTimeout(() => {
        notification.remove();
      }, 300);
    });
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

  // ===== UTILIDADES =====
  formatNumber(num) {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  }

  // ===== CLEANUP =====
  destroy() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
    
    // Limpiar partículas
    this.particles.forEach(particle => {
      if (particle.parentNode) {
        particle.parentNode.removeChild(particle);
      }
    });
  }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  window.footerManager = new AdvancedFooter();
});

// Cleanup al salir de la página
window.addEventListener('beforeunload', () => {
  if (window.footerManager) {
    window.footerManager.destroy();
  }
}); 