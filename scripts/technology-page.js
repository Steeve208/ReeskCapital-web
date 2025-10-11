// ===== TECHNOLOGY PAGE INTERACTIVITY =====

class TechnologyPage {
  constructor() {
    this.init();
  }

  init() {
    this.initializeAnimations();
    this.initializeScrollEffects();
    this.initializeComparisonCharts();
    this.initializeTechVisualizations();
    this.initializeMobileMenu();
    this.initializeSmoothScrolling();
    console.log('🚀 Technology Page initialized');
  }

  // Initialize scroll-triggered animations
  initializeAnimations() {
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

    // Observe all animated elements
    const animatedElements = document.querySelectorAll(`
      .tech-node,
      .arch-layer,
      .ai-component-card,
      .security-layer,
      .consensus-component,
      .protocol-card,
      .feature-card,
      .application-item,
      .innovation-item,
      .metric-card
    `);

    animatedElements.forEach(el => observer.observe(el));
  }

  // Initialize scroll effects
  initializeScrollEffects() {
    let ticking = false;

    const updateScrollEffects = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;

      // Parallax effect for hero background
      const heroBg = document.querySelector('.tech-hero-bg');
      if (heroBg) {
        heroBg.style.transform = `translateY(${scrollY * 0.5}px)`;
      }

      // Update tech core rotation based on scroll
      const techCore = document.querySelector('.tech-core');
      if (techCore) {
        const rotation = scrollY * 0.1;
        techCore.style.transform = `translate(-50%, -50%) rotate(${rotation}deg)`;
      }

      ticking = false;
    };

    const requestScrollUpdate = () => {
      if (!ticking) {
        requestAnimationFrame(updateScrollEffects);
        ticking = true;
      }
    };

    window.addEventListener('scroll', requestScrollUpdate);
  }

  // Initialize comparison charts animation
  initializeComparisonCharts() {
    const chartObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const barFills = entry.target.querySelectorAll('.bar-fill');
          barFills.forEach(bar => {
            const percentage = bar.dataset.percentage;
            setTimeout(() => {
              bar.style.width = percentage + '%';
            }, 200);
          });
        }
      });
    }, { threshold: 0.5 });

    const comparisonChart = document.querySelector('.comparison-chart');
    if (comparisonChart) {
      chartObserver.observe(comparisonChart);
    }
  }

  // Initialize technology visualizations
  initializeTechVisualizations() {
    // Tech node hover effects
    const techNodes = document.querySelectorAll('.tech-node');
    techNodes.forEach(node => {
      node.addEventListener('mouseenter', () => {
        this.animateNodeConnection(node);
      });

      node.addEventListener('mouseleave', () => {
        this.resetNodeConnection(node);
      });
    });

    // Component animations
    this.initializeComponentAnimations();
  }

  // Animate node connections on hover
  animateNodeConnection(node) {
    const connections = document.querySelectorAll('.connection');
    const nodeType = node.dataset.tech;
    
    connections.forEach(connection => {
      if (connection.classList.contains(`${nodeType}-connection`)) {
        connection.style.opacity = '1';
        connection.style.transform += ' scale(1.2)';
      }
    });

    // Add pulse effect to node
    node.style.animation = 'nodePulse 1s ease-in-out infinite';
  }

  // Reset node connections
  resetNodeConnection(node) {
    const connections = document.querySelectorAll('.connection');
    const nodeType = node.dataset.tech;
    
    connections.forEach(connection => {
      if (connection.classList.contains(`${nodeType}-connection`)) {
        connection.style.opacity = '0.3';
        connection.style.transform = connection.style.transform.replace(' scale(1.2)', '');
      }
    });

    // Remove pulse effect
    node.style.animation = '';
  }

  // Initialize component animations
  initializeComponentAnimations() {
    // Mining animation
    const miningBlocks = document.querySelectorAll('.mining-animation .block');
    miningBlocks.forEach((block, index) => {
      block.style.animationDelay = `${index * 0.5}s`;
    });

    // Staking animation
    const stakingCoins = document.querySelectorAll('.staking-animation .coin');
    stakingCoins.forEach((coin, index) => {
      coin.style.animationDelay = `${index * 0.3}s`;
    });

    // VRF animation
    const vrfBeacons = document.querySelectorAll('.vrf-animation .random-beacon');
    vrfBeacons.forEach((beacon, index) => {
      beacon.style.animationDelay = `${index * 0.7}s`;
    });
  }

  // Initialize mobile menu
  initializeMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    const mobileClose = document.getElementById('mobileMenuClose');

    if (mobileMenuBtn && mobileMenu) {
      mobileMenuBtn.addEventListener('click', () => {
        mobileMenu.classList.toggle('active');
        document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
      });
    }

    if (mobileClose) {
      mobileClose.addEventListener('click', () => {
        mobileMenu.classList.remove('active');
        document.body.style.overflow = '';
      });
    }

    // Close menu when clicking on overlay
    const mobileOverlay = mobileMenu?.querySelector('.mobile-menu-overlay');
    if (mobileOverlay) {
      mobileOverlay.addEventListener('click', () => {
        mobileMenu.classList.remove('active');
        document.body.style.overflow = '';
      });
    }
  }

  // Initialize smooth scrolling
  initializeSmoothScrolling() {
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    anchorLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href');
        const targetSection = document.querySelector(targetId);
        
        if (targetSection) {
          const headerHeight = document.querySelector('.navbar')?.offsetHeight || 0;
          const targetPosition = targetSection.offsetTop - headerHeight;
          
          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
        }
      });
    });
  }

  // Utility method to add CSS animations
  addCustomAnimations() {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes nodePulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.1); }
      }

      @keyframes componentPulse {
        0%, 100% { opacity: 0.3; transform: scale(1); }
        50% { opacity: 1; transform: scale(1.2); }
      }

      .animate-in {
        animation: fadeInUp 0.6s ease-out forwards;
      }

      @keyframes fadeInUp {
        from {
          opacity: 0;
          transform: translateY(30px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .tech-node.animate {
        animation: nodeGlow 2s ease-in-out infinite;
      }

      @keyframes nodeGlow {
        0%, 100% { box-shadow: 0 0 20px rgba(0, 255, 136, 0.3); }
        50% { box-shadow: 0 0 40px rgba(0, 255, 136, 0.6); }
      }
    `;
    document.head.appendChild(style);
  }

  // Initialize performance monitoring
  initializePerformanceMonitoring() {
    // Monitor scroll performance
    let scrollStartTime = 0;
    let scrollEndTime = 0;

    window.addEventListener('scrollstart', () => {
      scrollStartTime = performance.now();
    });

    window.addEventListener('scrollend', () => {
      scrollEndTime = performance.now();
      const scrollDuration = scrollEndTime - scrollStartTime;
      
      if (scrollDuration > 16) { // More than one frame
        console.warn(`Slow scroll detected: ${scrollDuration.toFixed(2)}ms`);
      }
    });
  }

  // Initialize accessibility features
  initializeAccessibility() {
    // Add keyboard navigation for tech nodes
    const techNodes = document.querySelectorAll('.tech-node');
    techNodes.forEach(node => {
      node.setAttribute('tabindex', '0');
      node.setAttribute('role', 'button');
      node.setAttribute('aria-label', `Technology node: ${node.querySelector('.node-label')?.textContent}`);
      
      node.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.animateNodeConnection(node);
        }
      });
    });

    // Add focus indicators
    const focusableElements = document.querySelectorAll('a, button, [tabindex]');
    focusableElements.forEach(el => {
      el.addEventListener('focus', () => {
        el.style.outline = '2px solid #00ff88';
        el.style.outlineOffset = '2px';
      });
      
      el.addEventListener('blur', () => {
        el.style.outline = '';
        el.style.outlineOffset = '';
      });
    });
  }

  // Initialize error handling
  initializeErrorHandling() {
    window.addEventListener('error', (e) => {
      console.error('Technology page error:', e.error);
    });

    window.addEventListener('unhandledrejection', (e) => {
      console.error('Technology page promise rejection:', e.reason);
    });
  }

  // Public method to refresh animations
  refreshAnimations() {
    this.initializeAnimations();
    this.initializeTechVisualizations();
  }

  // Public method to update comparison charts
  updateComparisonCharts() {
    this.initializeComparisonCharts();
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.technologyPage = new TechnologyPage();
});

// Export for global access
window.TechnologyPage = TechnologyPage;
