/* ================================
   GLASSMORPHISM SYSTEM - RSC CHAIN
   Sistema avanzado de efectos visuales modernos
================================ */

class GlassmorphismSystem {
  constructor() {
    this.particles = [];
    this.animationId = null;
    this.isRunning = false;
    this.mousePosition = { x: 0, y: 0 };
    this.touchPosition = { x: 0, y: 0 };
    this.init();
  }

  init() {
    this.createParticleSystem();
    this.setupMouseTracking();
    this.setupTouchTracking();
    this.setupScrollEffects();
    this.setupHoverEffects();
    this.setupLiquidEffects();
    this.setupMorphingEffects();
    this.setupNeonEffects();
    this.setupGradientEffects();
    this.setupBlurEffects();
    this.setupAccessibility();
    this.start();
  }

  // ===== SISTEMA DE PARTÍCULAS =====
  createParticleSystem() {
    this.particleContainer = document.createElement('div');
    this.particleContainer.className = 'particle-container';
    this.particleContainer.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: -1;
    `;
    
    document.body.appendChild(this.particleContainer);
    
    this.createParticles();
  }

  createParticles() {
    const particleCount = 50;
    
    for (let i = 0; i < particleCount; i++) {
      const particle = this.createParticle();
      this.particles.push(particle);
      this.particleContainer.appendChild(particle.element);
    }
  }

  createParticle() {
    const particle = document.createElement('div');
    particle.style.cssText = `
      position: absolute;
      width: ${Math.random() * 4 + 2}px;
      height: ${Math.random() * 4 + 2}px;
      background: rgba(0, 255, 136, ${Math.random() * 0.5 + 0.1});
      border-radius: 50%;
      pointer-events: none;
    `;
    
    return {
      element: particle,
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      size: Math.random() * 4 + 2,
      opacity: Math.random() * 0.5 + 0.1,
      life: Math.random() * 1000 + 500
    };
  }

  updateParticles() {
    this.particles.forEach(particle => {
      // Update position
      particle.x += particle.vx;
      particle.y += particle.vy;
      
      // Update life
      particle.life -= 1;
      
      // Reset if dead
      if (particle.life <= 0) {
        particle.x = Math.random() * window.innerWidth;
        particle.y = Math.random() * window.innerHeight;
        particle.life = Math.random() * 1000 + 500;
        particle.opacity = Math.random() * 0.5 + 0.1;
      }
      
      // Apply mouse attraction
      const dx = this.mousePosition.x - particle.x;
      const dy = this.mousePosition.y - particle.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < 100) {
        const force = (100 - distance) / 100;
        particle.vx += (dx / distance) * force * 0.01;
        particle.vy += (dy / distance) * force * 0.01;
      }
      
      // Apply boundaries
      if (particle.x < 0 || particle.x > window.innerWidth) {
        particle.vx *= -1;
      }
      if (particle.y < 0 || particle.y > window.innerHeight) {
        particle.vy *= -1;
      }
      
      // Update element
      particle.element.style.left = particle.x + 'px';
      particle.element.style.top = particle.y + 'px';
      particle.element.style.opacity = particle.opacity;
    });
  }

  // ===== SEGUIMIENTO DEL MOUSE =====
  setupMouseTracking() {
    document.addEventListener('mousemove', (e) => {
      this.mousePosition.x = e.clientX;
      this.mousePosition.y = e.clientY;
      
      this.updateMouseEffects(e.clientX, e.clientY);
    });
  }

  updateMouseEffects(x, y) {
    // Update hover effects
    this.updateHoverEffects(x, y);
    
    // Update glow effects
    this.updateGlowEffects(x, y);
  }

  updateHoverEffects(x, y) {
    const elements = document.querySelectorAll('.hover-lift, .hover-glow, .hover-scale, .hover-rotate');
    
    elements.forEach(element => {
      const rect = element.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
      
      if (distance < 100) {
        const intensity = (100 - distance) / 100;
        element.style.transform = `scale(${1 + intensity * 0.1})`;
        element.style.filter = `brightness(${1 + intensity * 0.2})`;
      } else {
        element.style.transform = 'scale(1)';
        element.style.filter = 'brightness(1)';
      }
    });
  }

  updateGlowEffects(x, y) {
    const elements = document.querySelectorAll('.neon, .glow, .neon-text');
    
    elements.forEach(element => {
      const rect = element.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
      
      if (distance < 150) {
        const intensity = (150 - distance) / 150;
        const glowIntensity = intensity * 0.5;
        
        element.style.boxShadow = `0 0 ${20 + glowIntensity * 20}px rgba(0, 255, 136, ${0.3 + glowIntensity * 0.4})`;
        element.style.textShadow = `0 0 ${10 + glowIntensity * 10}px rgba(0, 255, 136, ${0.5 + glowIntensity * 0.3})`;
      }
    });
  }

  // ===== SEGUIMIENTO TÁCTIL =====
  setupTouchTracking() {
    document.addEventListener('touchstart', (e) => {
      const touch = e.touches[0];
      this.touchPosition.x = touch.clientX;
      this.touchPosition.y = touch.clientY;
      
      this.updateTouchEffects(touch.clientX, touch.clientY);
    });
    
    document.addEventListener('touchmove', (e) => {
      const touch = e.touches[0];
      this.touchPosition.x = touch.clientX;
      this.touchPosition.y = touch.clientY;
      
      this.updateTouchEffects(touch.clientX, touch.clientY);
    });
  }

  updateTouchEffects(x, y) {
    // Similar to mouse effects but for touch
    this.updateHoverEffects(x, y);
    this.updateGlowEffects(x, y);
  }

  // ===== EFECTOS DE SCROLL =====
  setupScrollEffects() {
    let ticking = false;
    
    const updateScrollEffects = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      
      this.updateParallaxEffects(scrollY);
      this.updateBlurEffects(scrollY);
      this.updateGlassEffects(scrollY);
      
      ticking = false;
    };
    
    const requestTick = () => {
      if (!ticking) {
        requestAnimationFrame(updateScrollEffects);
        ticking = true;
      }
    };
    
    window.addEventListener('scroll', requestTick);
  }

  updateParallaxEffects(scrollY) {
    const elements = document.querySelectorAll('.parallax');
    
    elements.forEach((element, index) => {
      const speed = 0.5 + (index % 3) * 0.2;
      const yPos = -(scrollY * speed);
      element.style.transform = `translateY(${yPos}px)`;
    });
  }

  updateBlurEffects(scrollY) {
    const elements = document.querySelectorAll('.blur-on-scroll');
    
    elements.forEach(element => {
      const rect = element.getBoundingClientRect();
      const elementTop = rect.top;
      const elementHeight = rect.height;
      const windowHeight = window.innerHeight;
      
      if (elementTop < windowHeight && elementTop + elementHeight > 0) {
        const scrollProgress = (windowHeight - elementTop) / (windowHeight + elementHeight);
        const blurIntensity = Math.max(0, Math.min(1, scrollProgress));
        
        element.style.backdropFilter = `blur(${blurIntensity * 20}px)`;
        element.style.webkitBackdropFilter = `blur(${blurIntensity * 20}px)`;
      }
    });
  }

  updateGlassEffects(scrollY) {
    const elements = document.querySelectorAll('.glass, .glass-card');
    
    elements.forEach(element => {
      const rect = element.getBoundingClientRect();
      const elementTop = rect.top;
      const elementHeight = rect.height;
      const windowHeight = window.innerHeight;
      
      if (elementTop < windowHeight && elementTop + elementHeight > 0) {
        const scrollProgress = (windowHeight - elementTop) / (windowHeight + elementHeight);
        const opacity = Math.max(0.1, Math.min(0.3, scrollProgress));
        
        element.style.background = `rgba(255, 255, 255, ${opacity})`;
      }
    });
  }

  // ===== EFECTOS DE HOVER =====
  setupHoverEffects() {
    const elements = document.querySelectorAll('.hover-lift, .hover-glow, .hover-scale, .hover-rotate');
    
    elements.forEach(element => {
      element.addEventListener('mouseenter', () => {
        this.animateHover(element);
      });
      
      element.addEventListener('mouseleave', () => {
        this.resetHover(element);
      });
    });
  }

  animateHover(element) {
    element.style.transition = 'all 0.3s cubic-bezier(0.25, 1, 0.5, 1)';
    
    if (element.classList.contains('hover-lift')) {
      element.style.transform = 'translateY(-8px)';
      element.style.boxShadow = '0 16px 64px rgba(0, 0, 0, 0.25)';
    }
    
    if (element.classList.contains('hover-glow')) {
      element.style.boxShadow = '0 0 20px rgba(0, 255, 136, 0.5)';
    }
    
    if (element.classList.contains('hover-scale')) {
      element.style.transform = 'scale(1.05)';
    }
    
    if (element.classList.contains('hover-rotate')) {
      element.style.transform = 'rotate(5deg)';
    }
  }

  resetHover(element) {
    element.style.transform = '';
    element.style.boxShadow = '';
  }

  // ===== EFECTOS LÍQUIDOS =====
  setupLiquidEffects() {
    const elements = document.querySelectorAll('.liquid');
    
    elements.forEach(element => {
      element.addEventListener('mouseenter', () => {
        this.animateLiquid(element);
      });
      
      element.addEventListener('mouseleave', () => {
        this.resetLiquid(element);
      });
    });
  }

  animateLiquid(element) {
    element.style.transition = 'all 0.5s cubic-bezier(0.25, 1, 0.5, 1)';
    element.style.borderRadius = '50%';
    element.style.transform = 'scale(1.1)';
  }

  resetLiquid(element) {
    element.style.borderRadius = '';
    element.style.transform = '';
  }

  // ===== EFECTOS DE MORFING =====
  setupMorphingEffects() {
    const elements = document.querySelectorAll('.morph, .morph-smooth');
    
    elements.forEach(element => {
      element.addEventListener('mouseenter', () => {
        this.animateMorph(element);
      });
      
      element.addEventListener('mouseleave', () => {
        this.resetMorph(element);
      });
    });
  }

  animateMorph(element) {
    const duration = element.classList.contains('morph-smooth') ? '0.5s' : '0.3s';
    element.style.transition = `all ${duration} cubic-bezier(0.25, 1, 0.5, 1)`;
    element.style.borderRadius = '50%';
    element.style.transform = 'scale(1.1) rotate(5deg)';
  }

  resetMorph(element) {
    element.style.borderRadius = '';
    element.style.transform = '';
  }

  // ===== EFECTOS NEON =====
  setupNeonEffects() {
    const elements = document.querySelectorAll('.neon, .neon-text');
    
    elements.forEach(element => {
      element.addEventListener('mouseenter', () => {
        this.animateNeon(element);
      });
      
      element.addEventListener('mouseleave', () => {
        this.resetNeon(element);
      });
    });
  }

  animateNeon(element) {
    element.style.transition = 'all 0.3s cubic-bezier(0.25, 1, 0.5, 1)';
    element.style.boxShadow = '0 0 40px rgba(0, 255, 136, 0.8)';
    element.style.textShadow = '0 0 20px rgba(0, 255, 136, 0.8)';
    element.style.transform = 'scale(1.05)';
  }

  resetNeon(element) {
    element.style.boxShadow = '';
    element.style.textShadow = '';
    element.style.transform = '';
  }

  // ===== EFECTOS DE GRADIENTE =====
  setupGradientEffects() {
    const elements = document.querySelectorAll('.gradient-neon, .gradient-rainbow, .gradient-aurora');
    
    elements.forEach(element => {
      element.addEventListener('mouseenter', () => {
        this.animateGradient(element);
      });
      
      element.addEventListener('mouseleave', () => {
        this.resetGradient(element);
      });
    });
  }

  animateGradient(element) {
    element.style.transition = 'all 0.3s cubic-bezier(0.25, 1, 0.5, 1)';
    element.style.backgroundSize = '300% 300%';
    element.style.transform = 'scale(1.02)';
  }

  resetGradient(element) {
    element.style.backgroundSize = '';
    element.style.transform = '';
  }

  // ===== EFECTOS DE BLUR =====
  setupBlurEffects() {
    const elements = document.querySelectorAll('.blur-sm, .blur-md, .blur-lg, .blur-xl');
    
    elements.forEach(element => {
      element.addEventListener('mouseenter', () => {
        this.animateBlur(element);
      });
      
      element.addEventListener('mouseleave', () => {
        this.resetBlur(element);
      });
    });
  }

  animateBlur(element) {
    element.style.transition = 'all 0.3s cubic-bezier(0.25, 1, 0.5, 1)';
    
    if (element.classList.contains('blur-sm')) {
      element.style.backdropFilter = 'blur(8px)';
      element.style.webkitBackdropFilter = 'blur(8px)';
    } else if (element.classList.contains('blur-md')) {
      element.style.backdropFilter = 'blur(16px)';
      element.style.webkitBackdropFilter = 'blur(16px)';
    } else if (element.classList.contains('blur-lg')) {
      element.style.backdropFilter = 'blur(24px)';
      element.style.webkitBackdropFilter = 'blur(24px)';
    } else if (element.classList.contains('blur-xl')) {
      element.style.backdropFilter = 'blur(32px)';
      element.style.webkitBackdropFilter = 'blur(32px)';
    }
  }

  resetBlur(element) {
    element.style.backdropFilter = '';
    element.style.webkitBackdropFilter = '';
  }

  // ===== ACCESIBILIDAD =====
  setupAccessibility() {
    // Check for reduced motion preference
    if (window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      
      if (mediaQuery.matches) {
        this.disableAnimations();
      }
      
      mediaQuery.addEventListener('change', (e) => {
        if (e.matches) {
          this.disableAnimations();
        } else {
          this.enableAnimations();
        }
      });
    }
  }

  disableAnimations() {
    this.isRunning = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    
    // Disable CSS animations
    document.documentElement.classList.add('reduce-motion');
  }

  enableAnimations() {
    this.isRunning = true;
    this.start();
    
    // Enable CSS animations
    document.documentElement.classList.remove('reduce-motion');
  }

  // ===== CICLO PRINCIPAL =====
  start() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.animate();
  }

  stop() {
    this.isRunning = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  }

  animate() {
    if (!this.isRunning) return;
    
    this.updateParticles();
    
    this.animationId = requestAnimationFrame(() => this.animate());
  }

  // ===== API PÚBLICA =====
  addParticle(x, y) {
    const particle = this.createParticle();
    particle.x = x;
    particle.y = y;
    this.particles.push(particle);
    this.particleContainer.appendChild(particle.element);
  }

  removeParticle(index) {
    if (index >= 0 && index < this.particles.length) {
      this.particleContainer.removeChild(this.particles[index].element);
      this.particles.splice(index, 1);
    }
  }

  clearParticles() {
    this.particles.forEach(particle => {
      this.particleContainer.removeChild(particle.element);
    });
    this.particles = [];
  }

  setParticleCount(count) {
    this.clearParticles();
    for (let i = 0; i < count; i++) {
      const particle = this.createParticle();
      this.particles.push(particle);
      this.particleContainer.appendChild(particle.element);
    }
  }

  // ===== DESTROY =====
  destroy() {
    this.stop();
    
    if (this.particleContainer) {
      this.particleContainer.remove();
    }
    
    // Remove event listeners
    document.removeEventListener('mousemove', this.updateMouseEffects);
    document.removeEventListener('touchstart', this.updateTouchEffects);
    document.removeEventListener('touchmove', this.updateTouchEffects);
  }
}

// ===== INICIALIZACIÓN =====
document.addEventListener('DOMContentLoaded', () => {
  window.RSCGlassmorphismSystem = new GlassmorphismSystem();
});

// ===== EXPORT =====
window.RSCGlassmorphismSystem = GlassmorphismSystem;
