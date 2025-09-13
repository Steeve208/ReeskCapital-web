/* ===== QUANTUM FOOTER INTERACTIVE SYSTEM ===== */

class QuantumFooter {
  constructor() {
    this.init();
    this.setupEventListeners();
    this.startNetworkStats();
    this.setupScrollEffects();
    this.initializeAnimations();
  }

  init() {
    this.footer = document.querySelector('.quantum-footer');
    this.backToTopBtn = document.getElementById('backToTop');
    this.newsletterForm = document.querySelector('.quantum-newsletter-form');
    this.quantumLinks = document.querySelectorAll('.quantum-link');
    this.networkStats = {
      blocks: document.getElementById('networkBlocks'),
      tps: document.getElementById('networkTps'),
      nodes: document.getElementById('activeNodes')
    };
    
    // Network data simulation
    this.networkData = {
      blocks: 1247832,
      tps: 2847,
      nodes: 15632,
      lastUpdate: Date.now()
    };
    
    this.isVisible = false;
    this.animationsStarted = false;
    
    this.setupIntersectionObserver();
  }

  setupEventListeners() {
    // Back to top button
    if (this.backToTopBtn) {
      this.backToTopBtn.addEventListener('click', () => {
        this.scrollToTop();
      });
    }

    // Newsletter form
    if (this.newsletterForm) {
      this.newsletterForm.addEventListener('submit', (e) => {
        this.handleNewsletterSubmit(e);
      });
    }

    // Quantum links hover effects
    this.quantumLinks.forEach((link, index) => {
      link.addEventListener('mouseenter', () => {
        this.activateQuantumLink(link, index);
      });
      
      link.addEventListener('mouseleave', () => {
        this.deactivateQuantumLink(link, index);
      });
      
      link.addEventListener('click', (e) => {
        this.handleLinkClick(e, link, index);
      });
    });

    // Scroll events
    window.addEventListener('scroll', () => {
      this.handleScroll();
    });

    // Resize events
    window.addEventListener('resize', () => {
      this.handleResize();
    });
  }

  setupIntersectionObserver() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !this.animationsStarted) {
          this.isVisible = true;
          this.startFooterAnimations();
          this.animationsStarted = true;
        }
      });
    }, {
      threshold: 0.1
    });

    if (this.footer) {
      observer.observe(this.footer);
    }
  }

  startNetworkStats() {
    // Update network stats every 3 seconds
    setInterval(() => {
      this.updateNetworkStats();
    }, 3000);

    // Initial update
    this.updateNetworkStats();
  }

  updateNetworkStats() {
    // Simulate realistic blockchain metrics
    const now = Date.now();
    const timeDiff = (now - this.networkData.lastUpdate) / 1000;
    
    // Update blocks (approximately every 1.8 seconds)
    const newBlocks = Math.floor(timeDiff / 1.8);
    if (newBlocks > 0) {
      this.networkData.blocks += newBlocks;
      this.networkData.lastUpdate = now;
    }
    
    // Simulate TPS fluctuation
    this.networkData.tps += Math.floor((Math.random() - 0.5) * 200);
    this.networkData.tps = Math.max(1000, Math.min(5000, this.networkData.tps));
    
    // Simulate nodes fluctuation
    this.networkData.nodes += Math.floor((Math.random() - 0.5) * 50);
    this.networkData.nodes = Math.max(10000, Math.min(20000, this.networkData.nodes));
    
    // Update DOM with animations
    this.animateStatUpdate(this.networkStats.blocks, this.formatNumber(this.networkData.blocks));
    this.animateStatUpdate(this.networkStats.tps, this.formatNumber(this.networkData.tps));
    this.animateStatUpdate(this.networkStats.nodes, this.formatNumber(this.networkData.nodes));
  }

  animateStatUpdate(element, newValue) {
    if (!element) return;
    
    const currentValue = element.textContent;
    if (currentValue === newValue) return;
    
    // Add update animation
    element.style.transform = 'scale(1.1)';
    element.style.color = '#00d4ff';
    
    setTimeout(() => {
      element.textContent = newValue;
      element.style.transform = 'scale(1)';
      element.style.color = '#00ff88';
    }, 200);
  }

  formatNumber(num) {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(0) + 'K';
    }
    return num.toString();
  }

  setupScrollEffects() {
    // Show/hide back to top button based on scroll position
    const toggleBackToTop = () => {
      if (window.scrollY > 500) {
        this.backToTopBtn?.classList.add('show');
        this.backToTopBtn?.classList.remove('hide');
      } else {
        this.backToTopBtn?.classList.add('hide');
        this.backToTopBtn?.classList.remove('show');
      }
    };

    window.addEventListener('scroll', toggleBackToTop);
    toggleBackToTop(); // Initial check
  }

  scrollToTop() {
    // Smooth scroll to top with custom animation
    const startPosition = window.scrollY;
    const startTime = performance.now();
    const duration = 1000;

    const animateScroll = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function for smooth animation
      const easeOutCubic = 1 - Math.pow(1 - progress, 3);
      
      window.scrollTo(0, startPosition * (1 - easeOutCubic));
      
      if (progress < 1) {
        requestAnimationFrame(animateScroll);
      }
    };

    requestAnimationFrame(animateScroll);
    
    // Add visual feedback
    this.createScrollIndicator();
  }

  createScrollIndicator() {
    const indicator = document.createElement('div');
    indicator.className = 'scroll-indicator';
    indicator.innerHTML = '<i class="fas fa-chevron-up"></i>';
    
    indicator.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 60px;
      height: 60px;
      background: rgba(0, 212, 255, 0.9);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 20px;
      z-index: 10000;
      animation: scrollIndicatorPulse 1s ease-out;
      pointer-events: none;
    `;

    document.body.appendChild(indicator);

    setTimeout(() => {
      indicator.remove();
    }, 1000);
  }

  handleNewsletterSubmit(e) {
    e.preventDefault();
    
    const email = e.target.querySelector('input[type="email"]').value;
    const submitBtn = e.target.querySelector('.quantum-subscribe-btn');
    
    // Disable button and show loading
    submitBtn.disabled = true;
    const originalText = submitBtn.querySelector('.btn-text').textContent;
    submitBtn.querySelector('.btn-text').textContent = 'Subscribing...';
    
    // Simulate API call
    setTimeout(() => {
      this.showNewsletterSuccess(email);
      
      // Reset form
      e.target.reset();
      submitBtn.disabled = false;
      submitBtn.querySelector('.btn-text').textContent = originalText;
    }, 2000);
  }

  showNewsletterSuccess(email) {
    const notification = document.createElement('div');
    notification.className = 'newsletter-success-notification';
    notification.innerHTML = `
      <div class="notification-content">
        <div class="success-icon">
          <i class="fas fa-check-circle"></i>
        </div>
        <div class="success-message">
          <h4>Successfully Subscribed!</h4>
          <p>Welcome to the RSC Chain community, <strong>${email.split('@')[0]}</strong>!</p>
          <p>You'll receive the latest updates about our quantum blockchain technology.</p>
        </div>
      </div>
      <button class="notification-close">×</button>
    `;

    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      max-width: 400px;
      background: rgba(0, 0, 0, 0.95);
      border: 1px solid rgba(0, 255, 136, 0.3);
      border-radius: 15px;
      padding: 1.5rem;
      color: white;
      z-index: 10000;
      animation: notificationSlideIn 0.5s ease-out;
      backdrop-filter: blur(10px);
      box-shadow: 0 10px 40px rgba(0, 255, 136, 0.2);
    `;

    document.body.appendChild(notification);

    // Close button functionality
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
      this.closeNotification(notification);
    });

    // Auto close after 5 seconds
    setTimeout(() => {
      this.closeNotification(notification);
    }, 5000);
  }

  closeNotification(notification) {
    notification.style.animation = 'notificationSlideOut 0.3s ease-out';
    setTimeout(() => {
      notification.remove();
    }, 300);
  }

  activateQuantumLink(link, index) {
    // Add hover effects
    const icon = link.querySelector('i');
    if (icon) {
      icon.style.transform = 'scale(1.2) rotate(10deg)';
    }
    
    // Create ripple effect
    this.createRippleEffect(link);
  }

  deactivateQuantumLink(link, index) {
    const icon = link.querySelector('i');
    if (icon) {
      icon.style.transform = 'scale(1) rotate(0deg)';
    }
  }

  handleLinkClick(e, link, index) {
    // Create click effect
    this.createClickEffect(link);
    
    // Track analytics (if needed)
    this.trackLinkClick(link.href, link.textContent.trim());
  }

  createRippleEffect(element) {
    const ripple = document.createElement('div');
    ripple.className = 'quantum-ripple';
    
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    
    ripple.style.cssText = `
      position: absolute;
      top: 50%;
      left: 0;
      width: ${size}px;
      height: ${size}px;
      background: radial-gradient(circle, rgba(0, 212, 255, 0.3) 0%, transparent 70%);
      border-radius: 50%;
      transform: translate(-50%, -50%) scale(0);
      animation: quantumRipple 0.6s ease-out;
      pointer-events: none;
      z-index: 0;
    `;

    element.style.position = 'relative';
    element.appendChild(ripple);

    setTimeout(() => {
      ripple.remove();
    }, 600);
  }

  createClickEffect(element) {
    const effect = document.createElement('div');
    effect.className = 'quantum-click-effect';
    
    effect.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(135deg, rgba(0, 212, 255, 0.2), rgba(0, 255, 136, 0.2));
      border-radius: 8px;
      animation: quantumClickFlash 0.3s ease-out;
      pointer-events: none;
      z-index: 1;
    `;

    element.style.position = 'relative';
    element.appendChild(effect);

    setTimeout(() => {
      effect.remove();
    }, 300);
  }

  trackLinkClick(href, text) {
    // Analytics tracking placeholder
    console.log(`Link clicked: ${text} -> ${href}`);
  }

  startFooterAnimations() {
    // Animate quantum links in sequence
    this.quantumLinks.forEach((link, index) => {
      setTimeout(() => {
        link.style.animation = 'quantumLinkSlideIn 0.6s ease-out forwards';
      }, index * 100);
    });

    // Animate network stats
    const statItems = document.querySelectorAll('.stat-item');
    statItems.forEach((stat, index) => {
      setTimeout(() => {
        stat.style.animation = 'statItemSlideIn 0.8s ease-out forwards';
      }, index * 200);
    });
  }

  initializeAnimations() {
    // Create floating particles
    this.createFloatingParticles();
    
    // Start energy flow animation
    this.startEnergyFlow();
  }

  createFloatingParticles() {
    if (!this.footer) return;

    const particleContainer = document.createElement('div');
    particleContainer.className = 'footer-floating-particles';
    particleContainer.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 1;
    `;

    // Create blockchain-themed particles
    const symbols = ['₿', '⟐', '◊', '⬢', '⬡', '◈'];
    
    for (let i = 0; i < 20; i++) {
      const particle = document.createElement('div');
      particle.textContent = symbols[Math.floor(Math.random() * symbols.length)];
      particle.style.cssText = `
        position: absolute;
        color: rgba(0, 212, 255, 0.3);
        font-size: ${10 + Math.random() * 8}px;
        font-weight: bold;
        left: ${Math.random() * 100}%;
        top: ${Math.random() * 100}%;
        animation: floatingFooterParticle ${15 + Math.random() * 20}s linear infinite;
        animation-delay: ${Math.random() * 10}s;
      `;
      
      particleContainer.appendChild(particle);
    }

    this.footer.appendChild(particleContainer);
  }

  startEnergyFlow() {
    // Create energy flow lines
    const energyContainer = document.createElement('div');
    energyContainer.className = 'footer-energy-flow';
    energyContainer.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 1;
    `;

    // Create multiple energy lines
    for (let i = 0; i < 5; i++) {
      const line = document.createElement('div');
      line.style.cssText = `
        position: absolute;
        width: 2px;
        height: 100px;
        background: linear-gradient(180deg, transparent, #00d4ff, transparent);
        left: ${20 + i * 20}%;
        top: -100px;
        animation: energyLineFlow ${8 + Math.random() * 4}s ease-in-out infinite;
        animation-delay: ${i * 2}s;
        opacity: 0.6;
      `;
      
      energyContainer.appendChild(line);
    }

    this.footer.appendChild(energyContainer);
  }

  handleScroll() {
    if (!this.isVisible) return;

    // Parallax effect for footer background
    const scrollY = window.scrollY;
    const footerTop = this.footer.offsetTop;
    const windowHeight = window.innerHeight;
    
    if (scrollY + windowHeight > footerTop) {
      const parallaxOffset = (scrollY + windowHeight - footerTop) * 0.1;
      const footerBg = this.footer.querySelector('.footer-quantum-bg');
      if (footerBg) {
        footerBg.style.transform = `translateY(${-parallaxOffset}px)`;
      }
    }
  }

  handleResize() {
    // Responsive adjustments if needed
    if (window.innerWidth < 768) {
      // Mobile specific adjustments
    }
  }
}

// Additional CSS for animations
const footerStyle = document.createElement('style');
footerStyle.textContent = `
  @keyframes scrollIndicatorPulse {
    0% {
      transform: translate(-50%, -50%) scale(0);
      opacity: 0;
    }
    50% {
      transform: translate(-50%, -50%) scale(1.2);
      opacity: 1;
    }
    100% {
      transform: translate(-50%, -50%) scale(1);
      opacity: 0.8;
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

  @keyframes quantumRipple {
    0% {
      transform: translate(-50%, -50%) scale(0);
      opacity: 0.8;
    }
    100% {
      transform: translate(-50%, -50%) scale(2);
      opacity: 0;
    }
  }

  @keyframes quantumClickFlash {
    0% {
      opacity: 0;
    }
    50% {
      opacity: 1;
    }
    100% {
      opacity: 0;
    }
  }

  @keyframes quantumLinkSlideIn {
    0% {
      opacity: 0;
      transform: translateX(-20px);
    }
    100% {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes statItemSlideIn {
    0% {
      opacity: 0;
      transform: translateY(20px);
    }
    100% {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes floatingFooterParticle {
    0% {
      transform: translateY(0px) rotate(0deg);
      opacity: 0;
    }
    10% {
      opacity: 0.8;
    }
    90% {
      opacity: 0.8;
    }
    100% {
      transform: translateY(-100vh) rotate(360deg);
      opacity: 0;
    }
  }

  @keyframes energyLineFlow {
    0% {
      top: -100px;
      opacity: 0;
    }
    10% {
      opacity: 0.6;
    }
    90% {
      opacity: 0.6;
    }
    100% {
      top: 100%;
      opacity: 0;
    }
  }

  .newsletter-success-notification .notification-content {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    margin-bottom: 1rem;
  }

  .newsletter-success-notification .success-icon {
    color: #00ff88;
    font-size: 2rem;
    flex-shrink: 0;
  }

  .newsletter-success-notification .success-message h4 {
    color: #00ff88;
    margin: 0 0 0.5rem 0;
    font-size: 1.125rem;
  }

  .newsletter-success-notification .success-message p {
    color: #a3a3a3;
    margin: 0 0 0.5rem 0;
    font-size: 0.875rem;
    line-height: 1.4;
  }

  .newsletter-success-notification .notification-close {
    position: absolute;
    top: 10px;
    right: 15px;
    background: none;
    border: none;
    color: #a3a3a3;
    font-size: 1.5rem;
    cursor: pointer;
    padding: 0;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: all 0.3s ease;
  }

  .newsletter-success-notification .notification-close:hover {
    color: #00d4ff;
    background: rgba(0, 212, 255, 0.1);
  }
`;

document.head.appendChild(footerStyle);

// Initialize Quantum Footer when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new QuantumFooter();
});

// Export for potential external use
window.QuantumFooter = QuantumFooter;
