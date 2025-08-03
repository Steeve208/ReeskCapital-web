/* ================================
   ANIMATIONS.JS — EFECTOS VISUALES AVANZADOS
================================ */

// Sistema de partículas 3D
class ParticleSystem {
  constructor(container) {
    this.container = container;
    this.particles = [];
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.width = container.offsetWidth;
    this.height = container.offsetHeight;
    this.particleCount = 150;
    this.init();
  }

  init() {
    this.canvas.style.position = 'absolute';
    this.canvas.style.top = '0';
    this.canvas.style.left = '0';
    this.canvas.style.pointerEvents = 'none';
    this.canvas.style.zIndex = '1';
    this.container.appendChild(this.canvas);
    this.resize();
    this.createParticles();
    this.animate();
    
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
  }

  createParticles() {
    for (let i = 0; i < this.particleCount; i++) {
      this.particles.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 3 + 1,
        opacity: Math.random() * 0.5 + 0.2,
        color: `hsl(${Math.random() * 60 + 240}, 70%, 60%)`
      });
    }
  }

  animate() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    
    this.particles.forEach(particle => {
      particle.x += particle.vx;
      particle.y += particle.vy;
      
      if (particle.x < 0 || particle.x > this.width) particle.vx *= -1;
      if (particle.y < 0 || particle.y > this.height) particle.vy *= -1;
      
      this.ctx.beginPath();
      this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      this.ctx.fillStyle = particle.color;
      this.ctx.globalAlpha = particle.opacity;
      this.ctx.fill();
    });
    
    // Conectar partículas cercanas
    this.connectParticles();
    
    requestAnimationFrame(() => this.animate());
  }

  connectParticles() {
    for (let i = 0; i < this.particles.length; i++) {
      for (let j = i + 1; j < this.particles.length; j++) {
        const dx = this.particles[i].x - this.particles[j].x;
        const dy = this.particles[i].y - this.particles[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 100) {
          this.ctx.beginPath();
          this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
          this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
          this.ctx.strokeStyle = `rgba(118, 87, 252, ${0.1 * (1 - distance / 100)})`;
          this.ctx.lineWidth = 1;
          this.ctx.stroke();
        }
      }
    }
  }
}

// Efecto de ondas en el hero
class WaveEffect {
  constructor(container) {
    this.container = container;
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.width = container.offsetWidth;
    this.height = container.offsetHeight;
    this.time = 0;
    this.init();
  }

  init() {
    this.canvas.style.position = 'absolute';
    this.canvas.style.bottom = '0';
    this.canvas.style.left = '0';
    this.canvas.style.pointerEvents = 'none';
    this.canvas.style.zIndex = '2';
    this.container.appendChild(this.canvas);
    this.resize();
    this.animate();
    
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
  }

  animate() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    
    // Dibujar ondas
    this.drawWave(0.8, 0.3, '#7657fc');
    this.drawWave(0.6, 0.2, '#3fd8c2');
    this.drawWave(0.4, 0.1, '#e0c64a');
    
    this.time += 0.02;
    requestAnimationFrame(() => this.animate());
  }

  drawWave(amplitude, frequency, color) {
    this.ctx.beginPath();
    this.ctx.moveTo(0, this.height);
    
    for (let x = 0; x < this.width; x++) {
      const y = this.height * (1 - amplitude) + 
                Math.sin(x * frequency + this.time) * 20 * amplitude;
      this.ctx.lineTo(x, y);
    }
    
    this.ctx.lineTo(this.width, this.height);
    this.ctx.closePath();
    this.ctx.fillStyle = color;
    this.ctx.globalAlpha = 0.1;
    this.ctx.fill();
  }
}

// Efecto de glitch en texto
class GlitchEffect {
  constructor(element) {
    this.element = element;
    this.originalText = element.textContent;
    this.chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*';
    this.isGlitching = false;
    this.init();
  }

  init() {
    this.element.addEventListener('mouseenter', () => this.startGlitch());
    this.element.addEventListener('mouseleave', () => this.stopGlitch());
  }

  startGlitch() {
    if (this.isGlitching) return;
    this.isGlitching = true;
    this.glitchInterval = setInterval(() => {
      this.element.textContent = this.originalText
        .split('')
        .map(char => Math.random() > 0.9 ? this.chars[Math.floor(Math.random() * this.chars.length)] : char)
        .join('');
    }, 50);
  }

  stopGlitch() {
    this.isGlitching = false;
    clearInterval(this.glitchInterval);
    this.element.textContent = this.originalText;
  }
}

// Efecto de hover 3D en cards
class Card3DEffect {
  constructor(card) {
    this.card = card;
    this.init();
  }

  init() {
    this.card.addEventListener('mousemove', (e) => this.handleMouseMove(e));
    this.card.addEventListener('mouseleave', () => this.handleMouseLeave());
  }

  handleMouseMove(e) {
    const rect = this.card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = (y - centerY) / 10;
    const rotateY = (centerX - x) / 10;
    
    this.card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`;
  }

  handleMouseLeave() {
    this.card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
  }
}

// Efecto de typing en texto
class TypewriterEffect {
  constructor(element, text, speed = 100) {
    this.element = element;
    this.text = text;
    this.speed = speed;
    this.currentIndex = 0;
    this.isTyping = false;
  }

  start() {
    if (this.isTyping) return;
    this.isTyping = true;
    this.element.textContent = '';
    this.type();
  }

  type() {
    if (this.currentIndex < this.text.length) {
      this.element.textContent += this.text[this.currentIndex];
      this.currentIndex++;
      setTimeout(() => this.type(), this.speed);
    } else {
      this.isTyping = false;
    }
  }
}

// Efecto de scroll parallax avanzado
class ParallaxEffect {
  constructor() {
    this.elements = document.querySelectorAll('[data-parallax]');
    this.init();
  }

  init() {
    window.addEventListener('scroll', () => this.handleScroll());
    window.addEventListener('resize', () => this.handleResize());
  }

  handleScroll() {
    const scrolled = window.pageYOffset;
    
    this.elements.forEach(element => {
      const speed = element.dataset.parallax || 0.5;
      const yPos = -(scrolled * speed);
      element.style.transform = `translateY(${yPos}px)`;
    });
  }

  handleResize() {
    // Recalcular posiciones si es necesario
  }
}

// Efecto de carga con skeleton
class SkeletonLoader {
  constructor(container) {
    this.container = container;
    this.init();
  }

  init() {
    this.container.innerHTML = `
      <div class="skeleton-item">
        <div class="skeleton-line"></div>
        <div class="skeleton-line short"></div>
      </div>
    `;
  }

  hide() {
    this.container.style.display = 'none';
  }

  show() {
    this.container.style.display = 'block';
  }
}

// Inicialización de efectos
document.addEventListener('DOMContentLoaded', () => {
  // Inicializar sistema de partículas en el hero
  const heroContainer = document.querySelector('.hero-rsc');
  if (heroContainer) {
    new ParticleSystem(heroContainer);
    new WaveEffect(heroContainer);
  }

  // Aplicar efecto glitch a títulos importantes
  document.querySelectorAll('h1, h2').forEach(title => {
    new GlitchEffect(title);
  });

  // Aplicar efecto 3D a cards
  document.querySelectorAll('.highlight-card, .stat-card, .action-card').forEach(card => {
    new Card3DEffect(card);
  });

  // Inicializar parallax
  new ParallaxEffect();

  // Efecto de typing en el hero
  const heroTitle = document.querySelector('.hero-rsc-content h1');
  if (heroTitle) {
    const typewriter = new TypewriterEffect(heroTitle, heroTitle.textContent, 50);
    setTimeout(() => typewriter.start(), 1000);
  }
});

// Efectos de scroll suave
const smoothScroll = (target, duration = 1000) => {
  const targetPosition = target.getBoundingClientRect().top;
  const startPosition = window.pageYOffset;
  const distance = targetPosition - startPosition;
  let startTime = null;

  function animation(currentTime) {
    if (startTime === null) startTime = currentTime;
    const timeElapsed = currentTime - startTime;
    const run = ease(timeElapsed, startPosition, distance, duration);
    window.scrollTo(0, run);
    if (timeElapsed < duration) requestAnimationFrame(animation);
  }

  function ease(t, b, c, d) {
    t /= d / 2;
    if (t < 1) return c / 2 * t * t + b;
    t--;
    return -c / 2 * (t * (t - 2) - 1) + b;
  }

  requestAnimationFrame(animation);
};

// Exportar funciones para uso global
window.RSCAnimations = {
  ParticleSystem,
  WaveEffect,
  GlitchEffect,
  Card3DEffect,
  TypewriterEffect,
  ParallaxEffect,
  SkeletonLoader,
  smoothScroll
};
