// ===== HERO-EFFECTS.JS - EFECTOS AVANZADOS PARA EL HERO =====

class HeroEffects {
  constructor() {
    this.particles = [];
    this.floatingElements = [];
    this.mouseTrail = [];
    this.isInitialized = false;
    
    this.init();
  }

  init() {
    if (this.isInitialized) return;
    
    this.createParticleSystem();
    this.createFloatingElements();
    this.createMouseTrail();
    this.setupEventListeners();
    this.animate();
    
    this.isInitialized = true;
  }

  createParticleSystem() {
    const particleContainer = document.createElement('div');
    particleContainer.className = 'particle-system';
    particleContainer.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 1;
      overflow: hidden;
    `;
    
    document.querySelector('.hero-section').appendChild(particleContainer);

    // Crear partículas
    for (let i = 0; i < 50; i++) {
      this.createParticle(particleContainer);
    }
  }

  createParticle(container) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    
    const size = Math.random() * 4 + 2;
    const x = Math.random() * window.innerWidth;
    const y = Math.random() * window.innerHeight;
    const duration = Math.random() * 10 + 10;
    const delay = Math.random() * 5;
    
    particle.style.cssText = `
      position: absolute;
      width: ${size}px;
      height: ${size}px;
      background: ${this.getRandomColor()};
      border-radius: 50%;
      left: ${x}px;
      top: ${y}px;
      opacity: 0.7;
      pointer-events: none;
      animation: particleFloat ${duration}s ease-in-out infinite;
      animation-delay: ${delay}s;
      box-shadow: 0 0 ${size * 2}px currentColor;
    `;
    
    container.appendChild(particle);
    this.particles.push(particle);
  }

  getRandomColor() {
    const colors = [
      '#7657fc',
      '#3fd8c2', 
      '#e0c64a',
      '#ff6b6b',
      '#a18fff'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  createFloatingElements() {
    const heroSection = document.querySelector('.hero-section');
    
    for (let i = 0; i < 8; i++) {
      const element = document.createElement('div');
      element.className = 'floating-element';
      
      const size = Math.random() * 60 + 40;
      const x = Math.random() * 100;
      const y = Math.random() * 100;
      const duration = Math.random() * 8 + 6;
      const delay = Math.random() * 5;
      
      element.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        left: ${x}%;
        top: ${y}%;
        background: radial-gradient(circle, ${this.getRandomColor()}20, transparent);
        border-radius: 50%;
        pointer-events: none;
        z-index: 1;
        animation: float ${duration}s ease-in-out infinite;
        animation-delay: ${delay}s;
        filter: blur(1px);
      `;
      
      heroSection.appendChild(element);
      this.floatingElements.push(element);
    }
  }

  createMouseTrail() {
    const trailContainer = document.createElement('div');
    trailContainer.className = 'mouse-trail';
    trailContainer.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 9999;
    `;
    
    document.body.appendChild(trailContainer);
  }

  setupEventListeners() {
    // Mouse trail effect
    document.addEventListener('mousemove', (e) => {
      this.createMouseTrailPoint(e.clientX, e.clientY);
    });

    // Parallax effect
    document.addEventListener('scroll', () => {
      this.updateParallax();
    });

    // Click effects
    document.addEventListener('click', (e) => {
      this.createClickEffect(e.clientX, e.clientY);
    });

    // Hover effects for buttons
    document.querySelectorAll('.btn-primary, .btn-secondary, .btn-tertiary').forEach(btn => {
      btn.addEventListener('mouseenter', (e) => {
        this.createHoverEffect(e.target);
      });
    });

    // Typing effect for title
    this.initTypingEffect();
  }

  createMouseTrailPoint(x, y) {
    const trailPoint = document.createElement('div');
    trailPoint.style.cssText = `
      position: fixed;
      left: ${x}px;
      top: ${y}px;
      width: 4px;
      height: 4px;
      background: #7657fc;
      border-radius: 50%;
      pointer-events: none;
      z-index: 9999;
      animation: trailFade 0.5s ease-out forwards;
    `;
    
    document.querySelector('.mouse-trail').appendChild(trailPoint);
    
    setTimeout(() => {
      trailPoint.remove();
    }, 500);
  }

  createClickEffect(x, y) {
    const clickEffect = document.createElement('div');
    clickEffect.style.cssText = `
      position: fixed;
      left: ${x - 25}px;
      top: ${y - 25}px;
      width: 50px;
      height: 50px;
      border: 2px solid #7657fc;
      border-radius: 50%;
      pointer-events: none;
      z-index: 10000;
      animation: clickRipple 0.6s ease-out forwards;
    `;
    
    document.body.appendChild(clickEffect);
    
    setTimeout(() => {
      clickEffect.remove();
    }, 600);
  }

  createHoverEffect(element) {
    const ripple = document.createElement('div');
    ripple.className = 'ripple-effect';
    ripple.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      width: 0;
      height: 0;
      background: rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      transform: translate(-50%, -50%);
      animation: rippleExpand 0.6s ease-out;
      pointer-events: none;
    `;
    
    element.style.position = 'relative';
    element.appendChild(ripple);
    
    setTimeout(() => {
      ripple.remove();
    }, 600);
  }

  initTypingEffect() {
    const title = document.querySelector('.hero-title');
    if (!title) return;
    
    const lines = title.querySelectorAll('.title-line');
    lines.forEach((line, index) => {
      const text = line.textContent;
      line.textContent = '';
      
      setTimeout(() => {
        this.typeText(line, text, 0);
      }, index * 500);
    });
  }

  typeText(element, text, index) {
    if (index < text.length) {
      element.textContent += text[index];
      setTimeout(() => {
        this.typeText(element, text, index + 1);
      }, 50);
    }
  }

  updateParallax() {
    const scrolled = window.pageYOffset;
    const parallaxElements = document.querySelectorAll('.floating-element');
    
    parallaxElements.forEach((element, index) => {
      const speed = 0.5 + (index * 0.1);
      const yPos = -(scrolled * speed);
      element.style.transform = `translateY(${yPos}px)`;
    });
  }

  animate() {
    // Animar partículas
    this.particles.forEach(particle => {
      const rect = particle.getBoundingClientRect();
      if (rect.top < -50) {
        particle.style.top = window.innerHeight + 'px';
        particle.style.left = Math.random() * window.innerWidth + 'px';
      }
    });

    // Animar elementos flotantes
    this.floatingElements.forEach(element => {
      const rect = element.getBoundingClientRect();
      if (rect.right < 0) {
        element.style.left = '100%';
        element.style.top = Math.random() * 100 + '%';
      }
    });

    requestAnimationFrame(() => this.animate());
  }
}

// CSS animations
const style = document.createElement('style');
style.textContent = `
  @keyframes particleFloat {
    0%, 100% {
      transform: translateY(0px) rotate(0deg);
      opacity: 0.7;
    }
    50% {
      transform: translateY(-30px) rotate(180deg);
      opacity: 1;
    }
  }

  @keyframes float {
    0%, 100% {
      transform: translateY(0px) rotate(0deg);
    }
    50% {
      transform: translateY(-20px) rotate(180deg);
    }
  }

  @keyframes trailFade {
    0% {
      opacity: 1;
      transform: scale(1);
    }
    100% {
      opacity: 0;
      transform: scale(0);
    }
  }

  @keyframes clickRipple {
    0% {
      transform: scale(0);
      opacity: 1;
    }
    100% {
      transform: scale(2);
      opacity: 0;
    }
  }

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

  .hero-section {
    position: relative;
    overflow: hidden;
  }

  .particle {
    position: absolute;
    pointer-events: none;
    z-index: 1;
  }

  .floating-element {
    position: absolute;
    pointer-events: none;
    z-index: 1;
  }

  .mouse-trail {
    position: fixed;
    pointer-events: none;
    z-index: 9999;
  }

  .ripple-effect {
    position: absolute;
    pointer-events: none;
    z-index: 1;
  }
`;

document.head.appendChild(style);

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  new HeroEffects();
});

// Exportar para uso global
window.HeroEffects = HeroEffects; 