/* ===== QUANTUM HERO INTERACTIVE SYSTEM ===== */

class QuantumHero {
  constructor() {
    this.init();
    this.setupEventListeners();
    this.startAnimations();
  }

  init() {
    this.hero = document.querySelector('.quantum-hero');
    this.nodes = document.querySelectorAll('.quantum-node');
    this.particles = document.querySelectorAll('.quantum-particle');
    this.connections = document.querySelectorAll('.quantum-connection');
    this.blocks = document.querySelectorAll('.quantum-block');
    this.techIcons = document.querySelectorAll('.tech-icon');
    this.statValues = document.querySelectorAll('.stat-value');
    
    this.mouseX = 0;
    this.mouseY = 0;
    this.isAnimating = false;
    
    this.setupParticleSystem();
    this.setupNodeInteractions();
    this.setupStatsCounter();
  }

  setupEventListeners() {
    // Mouse movement for parallax effects
    document.addEventListener('mousemove', (e) => {
      this.mouseX = e.clientX / window.innerWidth;
      this.mouseY = e.clientY / window.innerHeight;
      this.updateParallax();
    });

    // Scroll effects
    window.addEventListener('scroll', () => {
      this.updateScrollEffects();
    });

    // Resize handling
    window.addEventListener('resize', () => {
      this.handleResize();
    });

    // Node hover effects
    this.nodes.forEach((node, index) => {
      node.addEventListener('mouseenter', () => {
        this.activateNode(node, index);
      });
      
      node.addEventListener('mouseleave', () => {
        this.deactivateNode(node, index);
      });
    });

    // Tech icon interactions
    this.techIcons.forEach((icon, index) => {
      icon.addEventListener('click', () => {
        this.activateTechIcon(icon, index);
      });
    });
  }

  setupParticleSystem() {
    // Create additional particles dynamically
    this.createDynamicParticles();
    
    // Animate particles with different speeds
    this.particles.forEach((particle, index) => {
      const speed = 0.5 + Math.random() * 1.5;
      const delay = Math.random() * 4;
      
      particle.style.animationDuration = `${speed * 4}s`;
      particle.style.animationDelay = `-${delay}s`;
    });
  }

  createDynamicParticles() {
    const dataFlow = document.querySelector('.data-flow');
    if (!dataFlow) return;

    // Create additional particles for more dynamic effect
    for (let i = 0; i < 10; i++) {
      const particle = document.createElement('div');
      particle.className = 'quantum-particle';
      particle.style.left = Math.random() * 100 + '%';
      particle.style.top = Math.random() * 100 + '%';
      particle.style.animationDelay = Math.random() * 4 + 's';
      particle.style.animationDuration = (2 + Math.random() * 3) + 's';
      
      dataFlow.appendChild(particle);
    }
  }

  setupNodeInteractions() {
    this.nodes.forEach((node, index) => {
      // Add click functionality
      node.addEventListener('click', () => {
        this.showNodeInfo(node, index);
      });

      // Add touch support for mobile
      node.addEventListener('touchstart', (e) => {
        e.preventDefault();
        this.activateNode(node, index);
      });
    });
  }

  setupStatsCounter() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.animateStats();
          observer.unobserve(entry.target);
        }
      });
    });

    const statsSection = document.querySelector('.quantum-stats');
    if (statsSection) {
      observer.observe(statsSection);
    }
  }

  updateParallax() {
    if (!this.hero) return;

    const moveX = (this.mouseX - 0.5) * 20;
    const moveY = (this.mouseY - 0.5) * 20;

    // Move background elements
    const quantumBg = this.hero.querySelector('.quantum-bg');
    if (quantumBg) {
      quantumBg.style.transform = `translate(${moveX * 0.5}px, ${moveY * 0.5}px)`;
    }

    // Move blockchain core
    const blockchainCore = this.hero.querySelector('.blockchain-core');
    if (blockchainCore) {
      blockchainCore.style.transform = `translate(-50%, -50%) translate(${moveX * 0.3}px, ${moveY * 0.3}px)`;
    }

    // Move floating tech icons
    this.techIcons.forEach((icon, index) => {
      const intensity = 0.1 + (index * 0.05);
      icon.style.transform = `translate(${moveX * intensity}px, ${moveY * intensity}px)`;
    });
  }

  updateScrollEffects() {
    const scrollY = window.scrollY;
    const heroHeight = this.hero ? this.hero.offsetHeight : 0;
    const scrollProgress = Math.min(scrollY / heroHeight, 1);

    // Parallax scroll effects
    if (this.hero) {
      this.hero.style.transform = `translateY(${scrollProgress * 50}px)`;
    }

    // Fade out elements as user scrolls
    const heroContent = document.querySelector('.quantum-hero-content');
    if (heroContent) {
      heroContent.style.opacity = 1 - scrollProgress * 0.5;
    }
  }

  activateNode(node, index) {
    if (this.isAnimating) return;
    this.isAnimating = true;

    // Add active class
    node.classList.add('active');
    
    // Create ripple effect
    this.createRippleEffect(node);
    
    // Highlight connections
    this.highlightConnections(index);
    
    // Show node information
    this.showNodeTooltip(node, index);

    setTimeout(() => {
      this.isAnimating = false;
    }, 1000);
  }

  deactivateNode(node, index) {
    node.classList.remove('active');
    this.hideNodeTooltip();
    this.resetConnections();
  }

  createRippleEffect(node) {
    const ripple = document.createElement('div');
    ripple.className = 'node-ripple';
    ripple.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      width: 0;
      height: 0;
      border-radius: 50%;
      background: rgba(0, 212, 255, 0.3);
      transform: translate(-50%, -50%);
      animation: rippleExpand 1s ease-out forwards;
      pointer-events: none;
      z-index: 1;
    `;

    node.appendChild(ripple);

    setTimeout(() => {
      ripple.remove();
    }, 1000);
  }

  highlightConnections(nodeIndex) {
    this.connections.forEach((connection, index) => {
      if (index === nodeIndex || index === nodeIndex + 1) {
        connection.style.opacity = '1';
        connection.style.animation = 'connectionFlow 1s ease-in-out infinite';
      } else {
        connection.style.opacity = '0.3';
      }
    });
  }

  resetConnections() {
    this.connections.forEach(connection => {
      connection.style.opacity = '';
      connection.style.animation = '';
    });
  }

  showNodeTooltip(node, index) {
    const techTypes = ['AI', 'Crypto', 'Consensus', 'Mining', 'VRF', 'DeFi'];
    const descriptions = [
      'Artificial Intelligence engine for smart contract optimization',
      'Quantum-resistant cryptography for maximum security',
      'Hybrid consensus mechanism combining PoW and PoS',
      'Advanced quantum mining algorithm',
      'Verifiable Random Function for fair block selection',
      'Decentralized Finance protocol integration'
    ];

    const tooltip = document.createElement('div');
    tooltip.className = 'node-tooltip';
    tooltip.innerHTML = `
      <div class="tooltip-header">
        <h4>${techTypes[index]}</h4>
        <div class="tooltip-close">×</div>
      </div>
      <div class="tooltip-content">
        <p>${descriptions[index]}</p>
        <div class="tooltip-stats">
          <div class="stat">
            <span class="stat-label">Efficiency</span>
            <span class="stat-value">${95 + Math.random() * 5}%</span>
          </div>
          <div class="stat">
            <span class="stat-label">Security</span>
            <span class="stat-value">${98 + Math.random() * 2}%</span>
          </div>
        </div>
      </div>
    `;

    tooltip.style.cssText = `
      position: absolute;
      top: -200px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0, 0, 0, 0.9);
      border: 1px solid rgba(0, 212, 255, 0.3);
      border-radius: 12px;
      padding: 1rem;
      min-width: 250px;
      z-index: 1000;
      animation: tooltipFadeIn 0.3s ease-out;
      backdrop-filter: blur(10px);
    `;

    node.appendChild(tooltip);

    // Close tooltip functionality
    const closeBtn = tooltip.querySelector('.tooltip-close');
    closeBtn.addEventListener('click', () => {
      this.hideNodeTooltip();
    });

    // Auto-hide after 5 seconds
    setTimeout(() => {
      this.hideNodeTooltip();
    }, 5000);
  }

  hideNodeTooltip() {
    const tooltip = document.querySelector('.node-tooltip');
    if (tooltip) {
      tooltip.style.animation = 'tooltipFadeOut 0.3s ease-out forwards';
      setTimeout(() => {
        tooltip.remove();
      }, 300);
    }
  }

  activateTechIcon(icon, index) {
    // Create explosion effect
    this.createExplosionEffect(icon);
    
    // Show tech information
    this.showTechInfo(icon, index);
  }

  createExplosionEffect(icon) {
    const explosion = document.createElement('div');
    explosion.className = 'tech-explosion';
    explosion.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      width: 100px;
      height: 100px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(0, 212, 255, 0.5), transparent);
      transform: translate(-50%, -50%) scale(0);
      animation: explosionExpand 0.6s ease-out forwards;
      pointer-events: none;
      z-index: 1;
    `;

    icon.appendChild(explosion);

    setTimeout(() => {
      explosion.remove();
    }, 600);
  }

  showTechInfo(icon, index) {
    const techInfo = [
      'Quantum Computing Integration',
      'Advanced Microchip Technology',
      'Infinite Scalability Protocol',
      'Satellite Network Communication'
    ];

    // Create floating text
    const floatingText = document.createElement('div');
    floatingText.textContent = techInfo[index];
    floatingText.style.cssText = `
      position: absolute;
      top: -30px;
      left: 50%;
      transform: translateX(-50%);
      color: #00d4ff;
      font-weight: 600;
      font-size: 12px;
      white-space: nowrap;
      animation: floatingTextUp 2s ease-out forwards;
      pointer-events: none;
      z-index: 1000;
    `;

    icon.appendChild(floatingText);

    setTimeout(() => {
      floatingText.remove();
    }, 2000);
  }

  animateStats() {
    this.statValues.forEach(stat => {
      const target = parseFloat(stat.getAttribute('data-target'));
      const duration = 2000;
      const startTime = performance.now();

      const animate = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const currentValue = target * easeOut;
        
        if (target < 100) {
          stat.textContent = currentValue.toFixed(2);
        } else if (target < 1000) {
          stat.textContent = Math.floor(currentValue).toLocaleString();
        } else {
          stat.textContent = Math.floor(currentValue).toLocaleString();
        }

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          stat.textContent = target.toLocaleString();
        }
      };

      requestAnimationFrame(animate);
    });
  }

  startAnimations() {
    // Start continuous animations
    this.animateBlocks();
    this.animateParticles();
    this.animateConnections();
  }

  animateBlocks() {
    this.blocks.forEach((block, index) => {
      const delay = index * 0.2;
      block.style.animationDelay = `${delay}s`;
    });
  }

  animateParticles() {
    // Create particle trails
    setInterval(() => {
      this.createParticleTrail();
    }, 2000);
  }

  createParticleTrail() {
    const dataFlow = document.querySelector('.data-flow');
    if (!dataFlow) return;

    const trail = document.createElement('div');
    trail.className = 'particle-trail';
    trail.style.cssText = `
      position: absolute;
      width: 4px;
      height: 4px;
      background: #00d4ff;
      border-radius: 50%;
      box-shadow: 0 0 10px #00d4ff;
      left: ${Math.random() * 100}%;
      top: ${Math.random() * 100}%;
      animation: particleTrail 3s ease-out forwards;
      pointer-events: none;
    `;

    dataFlow.appendChild(trail);

    setTimeout(() => {
      trail.remove();
    }, 3000);
  }

  animateConnections() {
    // Randomly activate connections
    setInterval(() => {
      const randomConnection = this.connections[Math.floor(Math.random() * this.connections.length)];
      randomConnection.style.animation = 'connectionFlow 1s ease-in-out';
      
      setTimeout(() => {
        randomConnection.style.animation = '';
      }, 1000);
    }, 3000);
  }

  handleResize() {
    // Recalculate positions on resize
    this.updateParallax();
  }
}

// CSS for animations
const style = document.createElement('style');
style.textContent = `
  @keyframes rippleExpand {
    0% {
      width: 0;
      height: 0;
      opacity: 1;
    }
    100% {
      width: 200px;
      height: 200px;
      opacity: 0;
    }
  }

  @keyframes tooltipFadeIn {
    0% {
      opacity: 0;
      transform: translateX(-50%) translateY(10px);
    }
    100% {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }
  }

  @keyframes tooltipFadeOut {
    0% {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }
    100% {
      opacity: 0;
      transform: translateX(-50%) translateY(-10px);
    }
  }

  @keyframes explosionExpand {
    0% {
      transform: translate(-50%, -50%) scale(0);
      opacity: 1;
    }
    100% {
      transform: translate(-50%, -50%) scale(1);
      opacity: 0;
    }
  }

  @keyframes floatingTextUp {
    0% {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }
    100% {
      opacity: 0;
      transform: translateX(-50%) translateY(-50px);
    }
  }

  @keyframes particleTrail {
    0% {
      opacity: 1;
      transform: scale(1);
    }
    100% {
      opacity: 0;
      transform: scale(0);
    }
  }

  .node-tooltip {
    font-family: 'Inter', sans-serif;
  }

  .tooltip-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
  }

  .tooltip-header h4 {
    color: #00d4ff;
    margin: 0;
    font-size: 1rem;
  }

  .tooltip-close {
    color: #a3a3a3;
    cursor: pointer;
    font-size: 1.2rem;
    line-height: 1;
  }

  .tooltip-content p {
    color: #a3a3a3;
    margin: 0 0 1rem 0;
    font-size: 0.875rem;
    line-height: 1.4;
  }

  .tooltip-stats {
    display: flex;
    gap: 1rem;
  }

  .tooltip-stats .stat {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .tooltip-stats .stat-label {
    font-size: 0.75rem;
    color: #666666;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .tooltip-stats .stat-value {
    font-size: 1rem;
    font-weight: 700;
    color: #00ff88;
  }

  .quantum-node.active {
    transform: scale(1.2);
  }

  .quantum-node.active .node-glow {
    animation: nodeGlow 0.5s ease-in-out infinite;
  }
`;

document.head.appendChild(style);

// Initialize Quantum Hero when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new QuantumHero();
});

// Export for potential external use
window.QuantumHero = QuantumHero;
