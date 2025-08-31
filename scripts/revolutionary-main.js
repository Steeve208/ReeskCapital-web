/* ===== RSC CHAIN REVOLUTIONARY MAIN SCRIPT ===== */

class RSCRevolutionaryMain {
  constructor() {
    this.state = {
      isLoading: false,
      currentSection: 'hero',
      notifications: [],
      scrollProgress: 0
    };
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.initializeAnimations();
    this.startLiveMetrics();
    this.setupScrollEffects();
    this.initializeCharts();
    this.setupSectionNavigation();
    this.setupPerformanceOptimizations();
    
    // Mostrar notificación de bienvenida
    setTimeout(() => {
      this.showNotification('RSC Chain cargado exitosamente', 'success');
    }, 1000);
  }

  setupEventListeners() {
    // Watch demo button
    const watchDemoBtn = document.getElementById('watchDemo');
    if (watchDemoBtn) {
      watchDemoBtn.addEventListener('click', () => this.showDemo());
    }

    // AI Assistant button
    const aiAssistantBtn = document.getElementById('openAIAssistant');
    if (aiAssistantBtn) {
      aiAssistantBtn.addEventListener('click', () => this.openAIAssistant());
    }

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      });
    });
  }

  initializeAnimations() {
    // Intersection Observer for fade-in animations
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
        }
      });
    }, observerOptions);

    // Observe all sections for animation
    document.querySelectorAll('section').forEach(section => {
      section.classList.add('fade-in-section');
      observer.observe(section);
    });

    // Animate hero elements on load
    this.animateHeroElements();
  }

  animateHeroElements() {
    const heroElements = [
      '.hero-badge',
      '.hero-title',
      '.hero-description',
      '.hero-stats',
      '.hero-actions',
      '.hero-visual'
    ];

    heroElements.forEach((selector, index) => {
      const element = document.querySelector(selector);
      if (element) {
        setTimeout(() => {
          element.classList.add('animate-in');
        }, index * 200);
      }
    });
  }

  startLiveMetrics() {
    // Simulate live TPS updates
    this.updateTPS();
    
    // Simulate live block height updates
    this.updateBlockHeight();
    
    // Simulate live price updates
    this.updatePrice();
    
    // Update other metrics periodically
    setInterval(() => {
      this.updateMetrics();
    }, 5000);
  }

  updateTPS() {
    const tpsElement = document.getElementById('liveTPS');
    if (!tpsElement) return;

    const baseTPS = 84567;
    const variation = Math.random() * 2000 - 1000;
    const newTPS = Math.max(80000, baseTPS + variation);
    
    tpsElement.textContent = newTPS.toLocaleString();
    
    // Add pulse effect
    tpsElement.classList.add('pulse');
    setTimeout(() => {
      tpsElement.classList.remove('pulse');
    }, 1000);
  }

  updateBlockHeight() {
    const heightElement = document.getElementById('liveBlockHeight');
    if (!heightElement) return;

    const currentHeight = parseInt(heightElement.textContent.replace(/,/g, ''));
    const newHeight = currentHeight + 1;
    
    heightElement.textContent = newHeight.toLocaleString();
    
    // Add glow effect
    heightElement.classList.add('glow');
    setTimeout(() => {
      heightElement.classList.remove('glow');
    }, 2000);
  }

  updatePrice() {
    const priceElement = document.getElementById('livePrice');
    if (!priceElement) return;

    const currentPrice = parseFloat(priceElement.textContent.replace('$', ''));
    const variation = (Math.random() - 0.5) * 0.5; // ±0.25
    const newPrice = Math.max(0.01, currentPrice + variation);
    
    priceElement.textContent = `$${newPrice.toFixed(2)}`;
    
    // Add color change based on movement
    if (variation > 0) {
      priceElement.classList.add('price-up');
      setTimeout(() => priceElement.classList.remove('price-up'), 2000);
    } else if (variation < 0) {
      priceElement.classList.add('price-down');
      setTimeout(() => priceElement.classList.remove('price-down'), 2000);
    }
  }

  updateMetrics() {
    // Update market cap
    const marketCapElement = document.getElementById('liveMarketCap');
    if (marketCapElement) {
      const currentCap = parseFloat(marketCapElement.textContent.replace(/[$,]/g, ''));
      const variation = (Math.random() - 0.5) * 0.02; // ±1%
      const newCap = currentCap * (1 + variation);
      marketCapElement.textContent = `$${(newCap / 1e9).toFixed(1)}B`;
    }

    // Update staked supply
    const stakedElement = document.getElementById('liveStaked');
    if (stakedElement) {
      const currentStaked = parseFloat(stakedElement.textContent.replace('%', ''));
      const variation = (Math.random() - 0.5) * 0.5; // ±0.25%
      const newStaked = Math.max(60, Math.min(80, currentStaked + variation));
      stakedElement.textContent = `${newStaked.toFixed(1)}%`;
      
      // Update progress bar
      const progressElement = document.getElementById('stakedProgress');
      if (progressElement) {
        progressElement.style.width = `${newStaked}%`;
      }
    }

    // Update active nodes
    const nodesElement = document.getElementById('liveNodes');
    if (nodesElement) {
      const currentNodes = parseInt(nodesElement.textContent.replace(/,/g, ''));
      const variation = Math.floor(Math.random() * 10) - 5; // ±5
      const newNodes = Math.max(1200, currentNodes + variation);
      nodesElement.textContent = newNodes.toLocaleString();
    }
  }

  setupScrollEffects() {
    // Parallax effect for hero background
    window.addEventListener('scroll', () => {
      const scrolled = window.pageYOffset;
      const parallaxElements = document.querySelectorAll('.quantum-particles, .neural-network-grid');
      
      parallaxElements.forEach(element => {
        const speed = 0.5;
        element.style.transform = `translateY(${scrolled * speed}px)`;
      });
    });

    // Sticky navigation effect
    const nav = document.querySelector('.rsc-main-nav');
    if (nav) {
      window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
          nav.classList.add('nav-sticky');
        } else {
          nav.classList.remove('nav-sticky');
        }
      });
    }
  }

  initializeCharts() {
    // Initialize TPS chart if Chart.js is available
    if (typeof Chart !== 'undefined') {
      this.createTPSChart();
    }
  }

  createTPSChart() {
    const ctx = document.getElementById('tpsChart');
    if (!ctx) return;

    const chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: Array.from({length: 20}, (_, i) => i),
        datasets: [{
          label: 'TPS',
          data: Array.from({length: 20}, () => 80000 + Math.random() * 10000),
          borderColor: '#00ffff',
          backgroundColor: 'rgba(0, 255, 255, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointRadius: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          x: {
            display: false
          },
          y: {
            display: false
          }
        },
        elements: {
          point: {
            radius: 0
          }
        },
        animation: {
          duration: 1000
        }
      }
    });

    // Update chart data periodically
    setInterval(() => {
      const newData = chart.data.datasets[0].data.slice(1);
      newData.push(80000 + Math.random() * 10000);
      chart.data.datasets[0].data = newData;
      chart.update('none');
    }, 2000);
  }

  showDemo() {
    // Create demo modal
    const modal = document.createElement('div');
    modal.className = 'demo-modal';
    modal.innerHTML = `
      <div class="demo-modal-content">
        <div class="demo-modal-header">
          <h3>🚀 RSC Chain Demo</h3>
          <button class="demo-close">&times;</button>
        </div>
        <div class="demo-modal-body">
          <div class="demo-video-placeholder">
            <div class="video-icon">▶️</div>
            <p>Demo de la Blockchain Revolucionaria</p>
            <div class="demo-features">
              <div class="demo-feature">
                <span class="feature-icon">⚡</span>
                <span>100,000+ TPS en Acción</span>
              </div>
              <div class="demo-feature">
                <span class="feature-icon">🔐</span>
                <span>Seguridad Post-Cuántica</span>
              </div>
              <div class="demo-feature">
                <span class="feature-icon">🧠</span>
                <span>IA Integrada</span>
              </div>
            </div>
          </div>
        </div>
        <div class="demo-modal-footer">
          <button class="demo-btn primary">Comenzar Ahora</button>
          <button class="demo-btn secondary">Ver Documentación</button>
        </div>
      </div>
    `;

    // Add modal to page
    document.body.appendChild(modal);

    // Show modal with animation
    setTimeout(() => modal.classList.add('show'), 10);

    // Close modal functionality
    const closeBtn = modal.querySelector('.demo-close');
    closeBtn.addEventListener('click', () => {
      modal.classList.remove('show');
      setTimeout(() => modal.remove(), 300);
    });

    // Close on outside click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('show');
        setTimeout(() => modal.remove(), 300);
      }
    });

    // Demo button actions
    const startBtn = modal.querySelector('.demo-btn.primary');
    startBtn.addEventListener('click', () => {
      window.location.href = 'pages/mine.html';
    });

    const docsBtn = modal.querySelector('.demo-btn.secondary');
    docsBtn.addEventListener('click', () => {
      window.location.href = 'pages/docs.html';
    });
  }

  openAIAssistant() {
    // Open the existing AI assistant chat
    const chatToggle = document.getElementById('chatToggle');
    if (chatToggle) {
      chatToggle.click();
    }
  }

  // Add CSS for animations and effects
  addCustomStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .fade-in-section {
        opacity: 0;
        transform: translateY(30px);
        transition: all 0.8s ease;
      }
      
      .fade-in-section.animate-in {
        opacity: 1;
        transform: translateY(0);
      }
      
      .animate-in {
        animation: slideInUp 0.8s ease forwards;
      }
      
      @keyframes slideInUp {
        from {
          opacity: 0;
          transform: translateY(30px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      .pulse {
        animation: pulse 1s ease;
      }
      
      @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); }
      }
      
      .glow {
        animation: glow 2s ease;
      }
      
      @keyframes glow {
        0%, 100% { text-shadow: 0 0 5px #00ffff; }
        50% { text-shadow: 0 0 20px #00ffff, 0 0 30px #00ffff; }
      }
      
      .price-up {
        color: #00ff00 !important;
        animation: priceChange 2s ease;
      }
      
      .price-down {
        color: #ff4444 !important;
        animation: priceChange 2s ease;
      }
      
      @keyframes priceChange {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.1); }
      }
      
      .nav-sticky {
        position: fixed;
        top: 0;
        width: 100%;
        z-index: 1000;
        backdrop-filter: blur(20px);
        background: rgba(10, 10, 10, 0.9);
        border-bottom: 1px solid rgba(0, 255, 255, 0.2);
        animation: slideDown 0.3s ease;
      }
      
      @keyframes slideDown {
        from { transform: translateY(-100%); }
        to { transform: translateY(0); }
      }
      
      .demo-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        opacity: 0;
        transition: opacity 0.3s ease;
      }
      
      .demo-modal.show {
        opacity: 1;
      }
      
      .demo-modal-content {
        background: linear-gradient(135deg, #1a1a2e, #16213e);
        border: 1px solid rgba(0, 255, 255, 0.3);
        border-radius: 20px;
        max-width: 600px;
        width: 90%;
        max-height: 80vh;
        overflow-y: auto;
        transform: scale(0.9);
        transition: transform 0.3s ease;
      }
      
      .demo-modal.show .demo-modal-content {
        transform: scale(1);
      }
      
      .demo-modal-header {
        padding: 24px;
        border-bottom: 1px solid rgba(0, 255, 255, 0.2);
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      
      .demo-modal-header h3 {
        color: #ffffff;
        margin: 0;
        font-size: 1.5rem;
      }
      
      .demo-close {
        background: none;
        border: none;
        color: #888;
        font-size: 2rem;
        cursor: pointer;
        padding: 0;
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        transition: all 0.3s ease;
      }
      
      .demo-close:hover {
        background: rgba(255, 255, 255, 0.1);
        color: #ffffff;
      }
      
      .demo-modal-body {
        padding: 24px;
      }
      
      .demo-video-placeholder {
        text-align: center;
        padding: 40px 20px;
        background: rgba(0, 255, 255, 0.05);
        border-radius: 16px;
        border: 2px dashed rgba(0, 255, 255, 0.3);
      }
      
      .video-icon {
        font-size: 4rem;
        margin-bottom: 20px;
        display: block;
      }
      
      .demo-video-placeholder p {
        color: #b0b0b0;
        font-size: 1.125rem;
        margin-bottom: 24px;
      }
      
      .demo-features {
        display: flex;
        flex-direction: column;
        gap: 16px;
        align-items: center;
      }
      
      .demo-feature {
        display: flex;
        align-items: center;
        gap: 12px;
        color: #d0d0d0;
      }
      
      .feature-icon {
        font-size: 1.25rem;
        color: #00ffff;
      }
      
      .demo-modal-footer {
        padding: 24px;
        border-top: 1px solid rgba(0, 255, 255, 0.2);
        display: flex;
        gap: 16px;
        justify-content: center;
      }
      
      .demo-btn {
        padding: 12px 24px;
        border-radius: 12px;
        font-weight: 600;
        text-decoration: none;
        border: none;
        cursor: pointer;
        transition: all 0.3s ease;
      }
      
      .demo-btn.primary {
        background: linear-gradient(135deg, #00ffff, #8a2be2);
        color: #000;
      }
      
      .demo-btn.secondary {
        background: transparent;
        color: #00ffff;
        border: 2px solid #00ffff;
      }
      
      .demo-btn:hover {
        transform: translateY(-2px);
      }
    `;
    
    document.head.appendChild(style);
  }

  setupSectionNavigation() {
    const sectionDots = document.querySelectorAll('.section-dot');
    const sections = [
      '.revolutionary-hero',
      '.innovation-showcase',
      '.ecosystem-overview',
      '.technical-specs',
      '.use-cases-showcase',
      '.community-support',
      '.call-to-action'
    ];

    // Click navigation
    sectionDots.forEach((dot, index) => {
      dot.addEventListener('click', () => {
        const targetSection = document.querySelector(sections[index]);
        if (targetSection) {
          targetSection.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      });
    });

    // Scroll-based active state and progress bar
    window.addEventListener('scroll', () => {
      const scrollPosition = window.pageYOffset + 200;
      
      // Update scroll progress bar
      const scrollProgressBar = document.getElementById('scrollProgressBar');
      if (scrollProgressBar) {
        const scrollTop = window.pageYOffset;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = (scrollTop / docHeight) * 100;
        scrollProgressBar.style.width = scrollPercent + '%';
        this.state.scrollProgress = scrollPercent;
      }
      
      sections.forEach((section, index) => {
        const element = document.querySelector(section);
        if (element) {
          const sectionTop = element.offsetTop;
          const sectionHeight = element.offsetHeight;
          
          if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
            sectionDots.forEach(dot => dot.classList.remove('active'));
            sectionDots[index].classList.add('active');
            this.state.currentSection = sections[index].replace('.', '');
          }
        }
      });
    });
  }

  // Métodos de gestión de estado
  setLoading(loading) {
    this.state.isLoading = loading;
    const loadingIndicator = document.getElementById('loadingIndicator');
    if (loadingIndicator) {
      if (loading) {
        loadingIndicator.classList.add('active');
      } else {
        loadingIndicator.classList.remove('active');
      }
    }
  }

  showNotification(message, type = 'info', duration = 5000) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    const notificationSystem = document.getElementById('notificationSystem');
    if (notificationSystem) {
      notificationSystem.appendChild(notification);
      
      // Show notification
      setTimeout(() => notification.classList.add('show'), 100);
      
      // Remove notification
      setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
      }, duration);
    }
  }

  // Método para manejar errores
  handleError(error, context = 'general') {
    console.error(`Error in ${context}:`, error);
    this.showNotification(`Error: ${error.message}`, 'error');
  }

  // Sistema de optimización de rendimiento
  setupPerformanceOptimizations() {
    // Lazy loading para imágenes
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.classList.remove('lazy');
            observer.unobserve(img);
          }
        }
      });
    });

    document.querySelectorAll('img[data-src]').forEach(img => {
      imageObserver.observe(img);
    });

    // Throttled scroll event para performance
    let ticking = false;
    const scrollHandler = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          this.updateScrollProgress();
          this.updateBackToTop();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', scrollHandler, { passive: true });

    // Back to Top functionality
    this.setupBackToTop();
  }

  setupBackToTop() {
    const backToTopBtn = document.getElementById('backToTop');
    if (!backToTopBtn) return;

    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  updateBackToTop() {
    const backToTopBtn = document.getElementById('backToTop');
    if (!backToTopBtn) return;

    if (window.scrollY > 300) {
      backToTopBtn.classList.add('visible');
    } else {
      backToTopBtn.classList.remove('visible');
    }
  }

  // Método para limpiar recursos
  cleanup() {
    // Remove event listeners
    window.removeEventListener('scroll', this.updateScrollProgress);
    
    // Clear intervals
    if (this.metricsInterval) {
      clearInterval(this.metricsInterval);
    }
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const revolutionaryMain = new RSCRevolutionaryMain();
  revolutionaryMain.addCustomStyles();
});

// Cleanup when page unloads
window.addEventListener('beforeunload', () => {
  if (window.revolutionaryMain) {
    window.revolutionaryMain.cleanup();
  }
});

// Export for global access
window.RSCRevolutionaryMain = RSCRevolutionaryMain;

// Export for global access
window.RSCRevolutionaryMain = RSCRevolutionaryMain;
