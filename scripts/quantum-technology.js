/* ===== QUANTUM TECHNOLOGY INTERACTIVE SYSTEM ===== */

class QuantumTechnology {
  constructor() {
    this.init();
    this.setupEventListeners();
    this.startAnimations();
  }

  init() {
    this.section = document.querySelector('.quantum-technology');
    this.techCards = document.querySelectorAll('.quantum-tech-card');
    this.learnMoreButtons = document.querySelectorAll('.tech-learn-more');
    this.metricBars = document.querySelectorAll('.metric-fill');
    this.chartBars = document.querySelectorAll('.bar-fill');
    this.overviewStats = document.querySelectorAll('.overview-stat');
    
    this.isVisible = false;
    this.animationsStarted = false;
    
    this.setupIntersectionObserver();
    this.setupCardInteractions();
    this.setupMetricAnimations();
  }

  setupEventListeners() {
    // Card hover effects
    this.techCards.forEach((card, index) => {
      card.addEventListener('mouseenter', () => {
        this.activateCard(card, index);
      });
      
      card.addEventListener('mouseleave', () => {
        this.deactivateCard(card, index);
      });
      
      card.addEventListener('click', () => {
        this.showCardDetails(card, index);
      });
    });

    // Learn more buttons
    this.learnMoreButtons.forEach((button, index) => {
      button.addEventListener('click', (e) => {
        e.stopPropagation();
        this.handleLearnMore(index);
      });
    });

    // Overview stats hover
    this.overviewStats.forEach((stat, index) => {
      stat.addEventListener('mouseenter', () => {
        this.animateStatIcon(stat);
      });
    });

    // Scroll effects
    window.addEventListener('scroll', () => {
      this.updateScrollEffects();
    });
  }

  setupIntersectionObserver() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !this.animationsStarted) {
          this.isVisible = true;
          this.startSectionAnimations();
          this.animationsStarted = true;
        }
      });
    }, {
      threshold: 0.2
    });

    if (this.section) {
      observer.observe(this.section);
    }
  }

  setupCardInteractions() {
    this.techCards.forEach((card, index) => {
      // Add ripple effect on click
      card.addEventListener('click', (e) => {
        this.createRippleEffect(card, e);
      });

      // Add parallax effect
      card.addEventListener('mousemove', (e) => {
        this.handleCardParallax(card, e);
      });

      card.addEventListener('mouseleave', () => {
        this.resetCardParallax(card);
      });
    });
  }

  setupMetricAnimations() {
    // Animate metric bars when visible
    const metricObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const bar = entry.target;
          const width = bar.style.width || '0%';
          bar.style.width = '0%';
          
          setTimeout(() => {
            bar.style.width = width;
          }, 500);
          
          metricObserver.unobserve(bar);
        }
      });
    }, {
      threshold: 0.5
    });

    this.metricBars.forEach(bar => {
      metricObserver.observe(bar);
    });

    // Animate chart bars
    const chartObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const bar = entry.target;
          const percentage = bar.getAttribute('data-percentage');
          bar.style.width = '0%';
          
          setTimeout(() => {
            bar.style.width = percentage + '%';
          }, 800);
          
          chartObserver.unobserve(bar);
        }
      });
    }, {
      threshold: 0.5
    });

    this.chartBars.forEach(bar => {
      chartObserver.observe(bar);
    });
  }

  activateCard(card, index) {
    // Add active class
    card.classList.add('card-active');
    
    // Enhance particle system
    this.enhanceCardParticles(card);
    
    // Glow effect on icon
    const icon = card.querySelector('.tech-icon');
    if (icon) {
      icon.style.transform = 'scale(1.1)';
      icon.style.textShadow = '0 0 30px currentColor';
    }
    
    // Animate metrics
    this.animateCardMetrics(card);
  }

  deactivateCard(card, index) {
    // Remove active class
    card.classList.remove('card-active');
    
    // Reset icon
    const icon = card.querySelector('.tech-icon');
    if (icon) {
      icon.style.transform = 'scale(1)';
      icon.style.textShadow = '0 0 20px rgba(0, 212, 255, 0.5)';
    }
  }

  enhanceCardParticles(card) {
    const particleSystem = card.querySelector('.card-particle-system');
    if (particleSystem) {
      particleSystem.style.animationDuration = '8s';
      particleSystem.style.opacity = '0.8';
      
      setTimeout(() => {
        particleSystem.style.animationDuration = '15s';
        particleSystem.style.opacity = '0.6';
      }, 3000);
    }
  }

  animateCardMetrics(card) {
    const metrics = card.querySelectorAll('.metric-fill');
    metrics.forEach(metric => {
      metric.style.animation = 'metricFillGlow 1s ease-in-out infinite';
    });
  }

  createRippleEffect(card, event) {
    const rect = card.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    const ripple = document.createElement('div');
    ripple.className = 'card-ripple';
    ripple.style.cssText = `
      position: absolute;
      left: ${x}px;
      top: ${y}px;
      width: 0;
      height: 0;
      border-radius: 50%;
      background: rgba(0, 212, 255, 0.3);
      transform: translate(-50%, -50%);
      animation: cardRipple 0.8s ease-out forwards;
      pointer-events: none;
      z-index: 10;
    `;
    
    card.appendChild(ripple);
    
    setTimeout(() => {
      ripple.remove();
    }, 800);
  }

  handleCardParallax(card, event) {
    const rect = card.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const mouseX = event.clientX;
    const mouseY = event.clientY;
    
    const rotateX = (mouseY - centerY) / 20;
    const rotateY = (centerX - mouseX) / 20;
    
    card.style.transform = `translateY(-10px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  }

  resetCardParallax(card) {
    card.style.transform = 'translateY(-10px) rotateX(0deg) rotateY(0deg)';
  }

  showCardDetails(card, index) {
    const techTypes = ['ai', 'crypto', 'consensus', 'network'];
    const techType = techTypes[index];
    
    // Create modal or detailed view
    this.createTechModal(techType, index);
  }

  createTechModal(techType, index) {
    const techData = {
      ai: {
        title: 'Quantum AI Engine',
        subtitle: 'Neural Blockchain Intelligence',
        description: 'Our quantum-enhanced AI system represents the pinnacle of blockchain intelligence, utilizing advanced neural networks and machine learning algorithms to optimize every aspect of the network.',
        features: [
          'Quantum neural networks for consensus optimization',
          'Real-time threat detection and mitigation',
          'Predictive performance analytics',
          'Autonomous network healing capabilities',
          'Distributed federated learning protocols'
        ],
        metrics: {
          'Processing Power': '10.5 PetaFLOPS',
          'Learning Rate': '99.97% accuracy',
          'Response Time': '0.3ms average',
          'Network Coverage': '100% of nodes'
        }
      },
      crypto: {
        title: 'Quantum Cryptography',
        subtitle: 'Post-Quantum Security',
        description: 'Revolutionary cryptographic protocols designed to withstand quantum computing attacks while maintaining optimal performance and scalability.',
        features: [
          'XMSS and SPHINCS+ quantum-resistant signatures',
          'Lattice-based encryption algorithms',
          'Zero-knowledge proof integration',
          'Automatic cryptographic key rotation',
          'Quantum key distribution protocols'
        ],
        metrics: {
          'Security Level': '512-bit quantum resistant',
          'Key Generation': '< 1ms per key',
          'Signature Size': '2.3KB average',
          'Verification Speed': '0.1ms per signature'
        }
      },
      consensus: {
        title: 'Hybrid Consensus',
        subtitle: 'PoW/PoS/VRF Fusion',
        description: 'A revolutionary tri-hybrid consensus mechanism that combines the best aspects of Proof of Work, Proof of Stake, and Verifiable Random Functions.',
        features: [
          'Energy-efficient Proof of Work mining',
          'Stake-weighted validation system',
          'VRF-based randomness for fairness',
          'Instant finality guarantees',
          'Byzantine fault tolerance'
        ],
        metrics: {
          'Block Time': '0.8 seconds',
          'Finality': '< 2 seconds',
          'Energy Efficiency': '99.5% vs Bitcoin',
          'Validator Nodes': '50,000+ active'
        }
      },
      network: {
        title: 'Quantum Network',
        subtitle: 'Intelligent P2P Architecture',
        description: 'Advanced peer-to-peer network infrastructure with quantum-enhanced routing, geographic optimization, and intelligent load balancing.',
        features: [
          'Quantum-enhanced DHT protocols',
          'Geographic latency optimization',
          'Intelligent peer discovery',
          'Adaptive bandwidth management',
          'Multi-layer network redundancy'
        ],
        metrics: {
          'Global Latency': '25ms average',
          'Network Nodes': '50,000+ worldwide',
          'Bandwidth Efficiency': '95% optimization',
          'Uptime Guarantee': '99.99% SLA'
        }
      }
    };

    const data = techData[techType];
    if (!data) return;

    const modal = document.createElement('div');
    modal.className = 'tech-modal';
    modal.innerHTML = `
      <div class="modal-overlay"></div>
      <div class="modal-content">
        <div class="modal-header">
          <h2>${data.title}</h2>
          <p class="modal-subtitle">${data.subtitle}</p>
          <button class="modal-close">×</button>
        </div>
        <div class="modal-body">
          <p class="modal-description">${data.description}</p>
          
          <div class="modal-section">
            <h3>Key Features</h3>
            <ul class="feature-list">
              ${data.features.map(feature => `<li>${feature}</li>`).join('')}
            </ul>
          </div>
          
          <div class="modal-section">
            <h3>Performance Metrics</h3>
            <div class="metrics-grid">
              ${Object.entries(data.metrics).map(([key, value]) => `
                <div class="metric-card">
                  <div class="metric-value">${value}</div>
                  <div class="metric-label">${key}</div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    `;

    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
      animation: modalFadeIn 0.3s ease-out;
    `;

    document.body.appendChild(modal);

    // Event listeners
    const closeBtn = modal.querySelector('.modal-close');
    const overlay = modal.querySelector('.modal-overlay');
    
    const closeModal = () => {
      modal.style.animation = 'modalFadeOut 0.3s ease-out';
      setTimeout(() => {
        modal.remove();
      }, 300);
    };

    closeBtn.addEventListener('click', closeModal);
    overlay.addEventListener('click', closeModal);
    
    // ESC key to close
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        closeModal();
        document.removeEventListener('keydown', handleKeyDown);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
  }

  handleLearnMore(index) {
    const techTypes = ['ai', 'crypto', 'consensus', 'network'];
    const techType = techTypes[index];
    
    // Create floating notification
    this.showLearnMoreNotification(techType);
    
    // Could redirect to detailed page
    console.log(`Learn more about ${techType} technology`);
  }

  showLearnMoreNotification(techType) {
    const notification = document.createElement('div');
    notification.className = 'learn-more-notification';
    notification.innerHTML = `
      <div class="notification-icon">
        <i class="fas fa-info-circle"></i>
      </div>
      <div class="notification-content">
        <h4>Documentation Available</h4>
        <p>Detailed ${techType.toUpperCase()} documentation coming soon!</p>
      </div>
    `;

    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: rgba(0, 0, 0, 0.9);
      border: 1px solid rgba(0, 212, 255, 0.3);
      border-radius: 12px;
      padding: 1rem;
      color: white;
      z-index: 1000;
      display: flex;
      align-items: center;
      gap: 1rem;
      animation: notificationSlideIn 0.3s ease-out;
      backdrop-filter: blur(10px);
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.animation = 'notificationSlideOut 0.3s ease-out';
      setTimeout(() => {
        notification.remove();
      }, 300);
    }, 3000);
  }

  animateStatIcon(stat) {
    const icon = stat.querySelector('.stat-icon i');
    if (icon) {
      icon.style.animation = 'statIconBounce 0.6s ease-out';
      setTimeout(() => {
        icon.style.animation = 'statIconPulse 3s ease-in-out infinite';
      }, 600);
    }
  }

  startSectionAnimations() {
    // Animate cards in sequence
    this.techCards.forEach((card, index) => {
      setTimeout(() => {
        card.style.animation = 'cardSlideIn 0.8s ease-out forwards';
      }, index * 200);
    });

    // Animate overview stats
    this.overviewStats.forEach((stat, index) => {
      setTimeout(() => {
        stat.style.animation = 'statSlideIn 0.6s ease-out forwards';
      }, index * 100);
    });
  }

  updateScrollEffects() {
    if (!this.isVisible) return;

    const scrollY = window.scrollY;
    const sectionTop = this.section.offsetTop;
    const sectionHeight = this.section.offsetHeight;
    const windowHeight = window.innerHeight;

    // Parallax effect for background
    const parallaxOffset = (scrollY - sectionTop) * 0.1;
    const techBg = this.section.querySelector('.quantum-tech-bg');
    if (techBg) {
      techBg.style.transform = `translateY(${parallaxOffset}px)`;
    }

    // Card stagger effect on scroll
    this.techCards.forEach((card, index) => {
      const cardTop = card.offsetTop;
      const cardOffset = (scrollY - (sectionTop + cardTop)) * 0.05;
      card.style.transform = `translateY(${cardOffset}px)`;
    });
  }

  startAnimations() {
    // Create floating particles
    this.createFloatingParticles();
    
    // Start background animations
    this.animateBackground();
  }

  createFloatingParticles() {
    const particleContainer = document.createElement('div');
    particleContainer.className = 'floating-particles';
    particleContainer.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 1;
    `;

    // Create multiple floating particles
    for (let i = 0; i < 20; i++) {
      const particle = document.createElement('div');
      particle.className = 'floating-particle';
      particle.style.cssText = `
        position: absolute;
        width: 4px;
        height: 4px;
        background: #00d4ff;
        border-radius: 50%;
        left: ${Math.random() * 100}%;
        top: ${Math.random() * 100}%;
        animation: floatingParticle ${5 + Math.random() * 10}s linear infinite;
        animation-delay: ${Math.random() * 5}s;
        opacity: 0.6;
      `;
      
      particleContainer.appendChild(particle);
    }

    this.section.appendChild(particleContainer);
  }

  animateBackground() {
    // Additional background animations can be added here
    const techBg = this.section.querySelector('.quantum-tech-bg');
    if (techBg) {
      // Add subtle rotation animation
      let rotation = 0;
      setInterval(() => {
        rotation += 0.1;
        techBg.style.transform = `rotate(${rotation}deg)`;
      }, 100);
    }
  }
}

// CSS for additional animations
const style = document.createElement('style');
style.textContent = `
  @keyframes cardRipple {
    0% {
      width: 0;
      height: 0;
      opacity: 1;
    }
    100% {
      width: 300px;
      height: 300px;
      opacity: 0;
    }
  }

  @keyframes modalFadeIn {
    0% {
      opacity: 0;
      transform: scale(0.9);
    }
    100% {
      opacity: 1;
      transform: scale(1);
    }
  }

  @keyframes modalFadeOut {
    0% {
      opacity: 1;
      transform: scale(1);
    }
    100% {
      opacity: 0;
      transform: scale(0.9);
    }
  }

  @keyframes notificationSlideIn {
    0% {
      transform: translateX(100%);
      opacity: 0;
    }
    100% {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes notificationSlideOut {
    0% {
      transform: translateX(0);
      opacity: 1;
    }
    100% {
      transform: translateX(100%);
      opacity: 0;
    }
  }

  @keyframes statIconBounce {
    0%, 100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.2);
    }
  }

  @keyframes cardSlideIn {
    0% {
      opacity: 0;
      transform: translateY(50px);
    }
    100% {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes statSlideIn {
    0% {
      opacity: 0;
      transform: translateX(-30px);
    }
    100% {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes floatingParticle {
    0% {
      transform: translateY(0px) rotate(0deg);
      opacity: 0.6;
    }
    50% {
      opacity: 1;
    }
    100% {
      transform: translateY(-100vh) rotate(360deg);
      opacity: 0;
    }
  }

  .tech-modal .modal-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(5px);
  }

  .tech-modal .modal-content {
    position: relative;
    max-width: 800px;
    max-height: 90vh;
    background: rgba(0, 0, 0, 0.9);
    border: 1px solid rgba(0, 212, 255, 0.3);
    border-radius: 20px;
    padding: 2rem;
    color: white;
    overflow-y: auto;
    backdrop-filter: blur(10px);
  }

  .tech-modal .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 2rem;
    border-bottom: 1px solid rgba(0, 212, 255, 0.2);
    padding-bottom: 1rem;
  }

  .tech-modal .modal-close {
    background: none;
    border: none;
    color: #a3a3a3;
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

  .tech-modal .modal-close:hover {
    color: #00d4ff;
    background: rgba(0, 212, 255, 0.1);
  }

  .tech-modal h2 {
    color: #00d4ff;
    font-size: 2rem;
    margin: 0;
  }

  .tech-modal .modal-subtitle {
    color: #ff00ff;
    font-size: 1rem;
    margin: 0.5rem 0 0 0;
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  .tech-modal .modal-description {
    font-size: 1.125rem;
    line-height: 1.6;
    color: #a3a3a3;
    margin-bottom: 2rem;
  }

  .tech-modal .modal-section {
    margin-bottom: 2rem;
  }

  .tech-modal .modal-section h3 {
    color: #00ff88;
    font-size: 1.25rem;
    margin-bottom: 1rem;
    border-bottom: 1px solid rgba(0, 255, 136, 0.2);
    padding-bottom: 0.5rem;
  }

  .tech-modal .feature-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .tech-modal .feature-list li {
    padding: 0.5rem 0;
    border-left: 3px solid #00d4ff;
    padding-left: 1rem;
    margin-bottom: 0.5rem;
    background: rgba(0, 212, 255, 0.05);
    border-radius: 0 8px 8px 0;
  }

  .tech-modal .metrics-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
  }

  .tech-modal .metric-card {
    background: rgba(0, 212, 255, 0.1);
    border: 1px solid rgba(0, 212, 255, 0.3);
    border-radius: 12px;
    padding: 1rem;
    text-align: center;
  }

  .tech-modal .metric-card .metric-value {
    font-size: 1.5rem;
    font-weight: 700;
    color: #00ff88;
    display: block;
    margin-bottom: 0.5rem;
  }

  .tech-modal .metric-card .metric-label {
    font-size: 0.875rem;
    color: #a3a3a3;
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  .learn-more-notification .notification-icon {
    color: #00d4ff;
    font-size: 1.5rem;
  }

  .learn-more-notification .notification-content h4 {
    margin: 0 0 0.5rem 0;
    color: #00d4ff;
    font-size: 1rem;
  }

  .learn-more-notification .notification-content p {
    margin: 0;
    color: #a3a3a3;
    font-size: 0.875rem;
  }
`;

document.head.appendChild(style);

// Initialize Quantum Technology when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new QuantumTechnology();
});

// Export for potential external use
window.QuantumTechnology = QuantumTechnology;
