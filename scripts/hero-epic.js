// ===== HERO-EPIC.JS - EFECTOS DINÁMICOS AVANZADOS =====

class HeroEpic {
  constructor() {
    this.isInitialized = false;
    this.mouseX = 0;
    this.mouseY = 0;
    this.particles = [];
    this.energyOrbs = [];
    this.dataStreams = [];
    
    this.init();
  }

  init() {
    if (this.isInitialized) return;
    
    this.createDynamicEffects();
    this.setupEventListeners();
    this.createParticleSystem();
    this.createEnergyOrbs();
    this.createDataStreams();
    this.animate();
    
    this.isInitialized = true;
  }

  createDynamicEffects() {
    // Crear efectos de partículas dinámicas
    this.createFloatingParticles();
    
    // Crear efectos de energía
    this.createEnergyEffects();
    
    // Crear efectos de datos
    this.createDataEffects();
  }

  createFloatingParticles() {
    const particleContainer = document.createElement('div');
    particleContainer.className = 'dynamic-particles';
    particleContainer.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 2;
    `;
    
    document.querySelector('.hero-epic').appendChild(particleContainer);

    // Crear partículas dinámicas
    for (let i = 0; i < 30; i++) {
      this.createParticle(particleContainer);
    }
  }

  createParticle(container) {
    const particle = document.createElement('div');
    particle.className = 'dynamic-particle';
    
    const size = Math.random() * 6 + 3;
    const x = Math.random() * window.innerWidth;
    const y = Math.random() * window.innerHeight;
    const duration = Math.random() * 15 + 10;
    const delay = Math.random() * 5;
    const color = this.getRandomColor();
    
    particle.style.cssText = `
      position: absolute;
      width: ${size}px;
      height: ${size}px;
      background: ${color};
      border-radius: 50%;
      left: ${x}px;
      top: ${y}px;
      opacity: 0.8;
      pointer-events: none;
      animation: dynamicFloat ${duration}s ease-in-out infinite;
      animation-delay: ${delay}s;
      box-shadow: 0 0 ${size * 3}px ${color};
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
      '#a18fff',
      '#00ff88'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  createEnergyEffects() {
    const energyContainer = document.createElement('div');
    energyContainer.className = 'energy-effects';
    energyContainer.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 3;
    `;
    
    document.querySelector('.hero-epic').appendChild(energyContainer);

    // Crear orbes de energía
    for (let i = 0; i < 8; i++) {
      this.createEnergyOrb(energyContainer);
    }
  }

  createEnergyOrb(container) {
    const orb = document.createElement('div');
    orb.className = 'energy-orb';
    
    const size = Math.random() * 100 + 50;
    const x = Math.random() * 100;
    const y = Math.random() * 100;
    const duration = Math.random() * 8 + 6;
    const delay = Math.random() * 5;
    
    orb.style.cssText = `
      position: absolute;
      width: ${size}px;
      height: ${size}px;
      left: ${x}%;
      top: ${y}%;
      background: radial-gradient(circle, rgba(118, 87, 252, 0.2) 0%, transparent 70%);
      border-radius: 50%;
      pointer-events: none;
      animation: energyFloat ${duration}s ease-in-out infinite;
      animation-delay: ${delay}s;
      filter: blur(2px);
    `;
    
    container.appendChild(orb);
    this.energyOrbs.push(orb);
  }

  createDataEffects() {
    const dataContainer = document.createElement('div');
    dataContainer.className = 'data-effects';
    dataContainer.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 4;
    `;
    
    document.querySelector('.hero-epic').appendChild(dataContainer);

    // Crear streams de datos
    for (let i = 0; i < 5; i++) {
      this.createDataStream(dataContainer);
    }
  }

  createDataStream(container) {
    const stream = document.createElement('div');
    stream.className = 'data-stream';
    
    const height = Math.random() * 200 + 100;
    const x = Math.random() * 100;
    const duration = Math.random() * 10 + 8;
    const delay = Math.random() * 5;
    
    stream.style.cssText = `
      position: absolute;
      width: 2px;
      height: ${height}px;
      left: ${x}%;
      top: -${height}px;
      background: linear-gradient(180deg, #3fd8c2 0%, transparent 100%);
      pointer-events: none;
      animation: dataStreamFlow ${duration}s linear infinite;
      animation-delay: ${delay}s;
      opacity: 0.6;
    `;
    
    container.appendChild(stream);
    this.dataStreams.push(stream);
  }

  setupEventListeners() {
    // Mouse tracking para efectos de parallax
    document.addEventListener('mousemove', (e) => {
      this.mouseX = e.clientX;
      this.mouseY = e.clientY;
      this.updateParallaxEffects();
    });

    // Scroll effects
    window.addEventListener('scroll', () => {
      this.updateScrollEffects();
    });

    // Click effects
    document.addEventListener('click', (e) => {
      this.createClickRipple(e.clientX, e.clientY);
    });

    // Hover effects para elementos interactivos
    this.setupHoverEffects();

    // Typing effect para el cursor
    this.initTypingEffect();
  }

  updateParallaxEffects() {
    const hero = document.querySelector('.hero-epic');
    const rect = hero.getBoundingClientRect();
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const mouseX = this.mouseX - rect.left;
    const mouseY = this.mouseY - rect.top;
    
    const moveX = (mouseX - centerX) / centerX * 20;
    const moveY = (mouseY - centerY) / centerY * 20;
    
    // Aplicar efectos de parallax a elementos específicos
    const parallaxElements = document.querySelectorAll('.energy-orb, .dynamic-particle');
    parallaxElements.forEach((element, index) => {
      const speed = 0.1 + (index * 0.02);
      element.style.transform = `translate(${moveX * speed}px, ${moveY * speed}px)`;
    });
  }

  updateScrollEffects() {
    const scrolled = window.pageYOffset;
    const hero = document.querySelector('.hero-epic');
    
    if (hero) {
      const opacity = Math.max(0.3, 1 - (scrolled * 0.001));
      hero.style.opacity = opacity;
      
      const scale = Math.max(0.8, 1 - (scrolled * 0.0005));
      hero.style.transform = `scale(${scale})`;
    }
  }

  createClickRipple(x, y) {
    const ripple = document.createElement('div');
    ripple.className = 'click-ripple';
    
    ripple.style.cssText = `
      position: fixed;
      left: ${x - 25}px;
      top: ${y - 25}px;
      width: 50px;
      height: 50px;
      border: 2px solid #7657fc;
      border-radius: 50%;
      pointer-events: none;
      z-index: 10000;
      animation: rippleExpand 0.8s ease-out forwards;
    `;
    
    document.body.appendChild(ripple);
    
    setTimeout(() => {
      ripple.remove();
    }, 800);
  }

  setupHoverEffects() {
    // Efectos hover para botones
    const buttons = document.querySelectorAll('.btn-epic-primary, .btn-epic-secondary, .btn-epic-tertiary');
    buttons.forEach(button => {
      button.addEventListener('mouseenter', () => {
        this.createButtonHoverEffect(button);
      });
      
      button.addEventListener('mouseleave', () => {
        this.removeButtonHoverEffect(button);
      });
    });

    // Efectos hover para estadísticas
    const statCards = document.querySelectorAll('.stat-card-epic');
    statCards.forEach(card => {
      card.addEventListener('mouseenter', () => {
        this.createStatHoverEffect(card);
      });
      
      card.addEventListener('mouseleave', () => {
        this.removeStatHoverEffect(card);
      });
    });

    // Efectos hover para características
    const featureItems = document.querySelectorAll('.feature-item');
    featureItems.forEach(item => {
      item.addEventListener('mouseenter', () => {
        this.createFeatureHoverEffect(item);
      });
      
      item.addEventListener('mouseleave', () => {
        this.removeFeatureHoverEffect(item);
      });
    });
  }

  createButtonHoverEffect(button) {
    const glow = document.createElement('div');
    glow.className = 'button-glow';
    glow.style.cssText = `
      position: absolute;
      top: -10px;
      left: -10px;
      right: -10px;
      bottom: -10px;
      background: radial-gradient(circle, rgba(118, 87, 252, 0.3) 0%, transparent 70%);
      border-radius: 20px;
      opacity: 0;
      animation: glowFadeIn 0.3s ease-out forwards;
      pointer-events: none;
      z-index: -1;
    `;
    
    button.style.position = 'relative';
    button.appendChild(glow);
  }

  removeButtonHoverEffect(button) {
    const glow = button.querySelector('.button-glow');
    if (glow) {
      glow.style.animation = 'glowFadeOut 0.3s ease-out forwards';
      setTimeout(() => {
        glow.remove();
      }, 300);
    }
  }

  createStatHoverEffect(card) {
    const particles = card.querySelector('.stat-particles');
    if (particles) {
      particles.style.opacity = '1';
      particles.style.animation = 'particleMove 2s linear infinite';
    }
  }

  removeStatHoverEffect(card) {
    const particles = card.querySelector('.stat-particles');
    if (particles) {
      particles.style.opacity = '0';
      particles.style.animation = 'none';
    }
  }

  createFeatureHoverEffect(item) {
    const icon = item.querySelector('.feature-icon');
    if (icon) {
      icon.style.animation = 'iconSpin 0.5s ease-out';
    }
  }

  removeFeatureHoverEffect(item) {
    const icon = item.querySelector('.feature-icon');
    if (icon) {
      icon.style.animation = 'iconBounce 2s ease-in-out infinite';
    }
  }

  initTypingEffect() {
    const cursor = document.querySelector('.typing-cursor');
    if (cursor) {
      cursor.style.animation = 'blink 1s ease-in-out infinite';
    }
  }

  animate() {
    // Animar partículas
    this.particles.forEach((particle, index) => {
      const rect = particle.getBoundingClientRect();
      if (rect.top < -50) {
        particle.style.top = window.innerHeight + 'px';
        particle.style.left = Math.random() * window.innerWidth + 'px';
      }
    });

    // Animar orbes de energía
    this.energyOrbs.forEach((orb, index) => {
      const rect = orb.getBoundingClientRect();
      if (rect.right < 0) {
        orb.style.left = '100%';
        orb.style.top = Math.random() * 100 + '%';
      }
    });

    // Animar streams de datos
    this.dataStreams.forEach((stream, index) => {
      const rect = stream.getBoundingClientRect();
      if (rect.top > window.innerHeight) {
        stream.style.top = '-200px';
        stream.style.left = Math.random() * 100 + '%';
      }
    });

    requestAnimationFrame(() => this.animate());
  }
}

// CSS animations adicionales
const epicStyles = document.createElement('style');
epicStyles.textContent = `
  @keyframes dynamicFloat {
    0%, 100% {
      transform: translateY(0px) rotate(0deg);
      opacity: 0.8;
    }
    50% {
      transform: translateY(-40px) rotate(180deg);
      opacity: 1;
    }
  }

  @keyframes energyFloat {
    0%, 100% {
      transform: translateY(0px) scale(1);
      opacity: 0.3;
    }
    50% {
      transform: translateY(-30px) scale(1.2);
      opacity: 0.6;
    }
  }

  @keyframes dataStreamFlow {
    0% {
      transform: translateY(0);
      opacity: 0.6;
    }
    100% {
      transform: translateY(100vh);
      opacity: 0;
    }
  }

  @keyframes rippleExpand {
    0% {
      transform: scale(0);
      opacity: 1;
    }
    100% {
      transform: scale(3);
      opacity: 0;
    }
  }

  @keyframes glowFadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes glowFadeOut {
    from { opacity: 1; }
    to { opacity: 0; }
  }

  @keyframes iconSpin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .dynamic-particles {
    position: absolute;
    pointer-events: none;
    z-index: 2;
  }

  .energy-effects {
    position: absolute;
    pointer-events: none;
    z-index: 3;
  }

  .data-effects {
    position: absolute;
    pointer-events: none;
    z-index: 4;
  }

  .click-ripple {
    position: fixed;
    pointer-events: none;
    z-index: 10000;
  }

  .button-glow {
    position: absolute;
    pointer-events: none;
    z-index: -1;
  }
`;

document.head.appendChild(epicStyles);

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  new HeroEpic();
});

// Exportar para uso global
window.HeroEpic = HeroEpic; 