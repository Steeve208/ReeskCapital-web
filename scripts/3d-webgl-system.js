/* ================================
   3D WEBGL SYSTEM - RSC CHAIN
   Sistema avanzado de efectos 3D y WebGL
================================ */

class WebGL3DSystem {
  constructor() {
    this.canvas = null;
    this.gl = null;
    this.program = null;
    this.animations = new Map();
    this.particles = [];
    this.mouse = { x: 0, y: 0 };
    this.isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.init();
  }

  init() {
    this.setupWebGL();
    this.setup3DEffects();
    this.setupParallax3D();
    this.setupTilt3D();
    this.setupParticleSystem();
    this.setupScroll3D();
    this.setupMouseTracking();
    this.setupPerformanceOptimizations();
  }

  // ===== WEBGL SETUP =====
  setupWebGL() {
    // Crear canvas para efectos WebGL
    this.canvas = document.createElement('canvas');
    this.canvas.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: -1;
    `;
    document.body.appendChild(this.canvas);

    // Obtener contexto WebGL
    this.gl = this.canvas.getContext('webgl') || this.canvas.getContext('experimental-webgl');
    
    if (!this.gl) {
      console.warn('WebGL not supported, falling back to CSS 3D');
      return;
    }

    this.resizeCanvas();
    this.setupShaders();
    this.setupBuffers();
    this.animate();
    
    window.addEventListener('resize', () => this.resizeCanvas());
  }

  resizeCanvas() {
    if (!this.canvas) return;
    
    const rect = this.canvas.getBoundingClientRect();
    this.canvas.width = rect.width * window.devicePixelRatio;
    this.canvas.height = rect.height * window.devicePixelRatio;
    this.canvas.style.width = rect.width + 'px';
    this.canvas.style.height = rect.height + 'px';
    
    if (this.gl) {
      this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    }
  }

  setupShaders() {
    if (!this.gl) return;

    const vertexShaderSource = `
      attribute vec2 a_position;
      attribute vec2 a_texCoord;
      varying vec2 v_texCoord;
      uniform vec2 u_resolution;
      
      void main() {
        vec2 zeroToOne = a_position / u_resolution;
        vec2 zeroToTwo = zeroToOne * 2.0;
        vec2 clipSpace = zeroToTwo - 1.0;
        gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
        v_texCoord = a_texCoord;
      }
    `;

    const fragmentShaderSource = `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_mouse;
      uniform vec2 u_resolution;
      varying vec2 v_texCoord;
      
      void main() {
        vec2 uv = v_texCoord;
        vec2 mouse = u_mouse / u_resolution;
        
        // Efecto de ondas
        float wave1 = sin(uv.x * 10.0 + u_time) * 0.1;
        float wave2 = sin(uv.y * 10.0 + u_time * 1.5) * 0.1;
        float wave3 = sin((uv.x + uv.y) * 5.0 + u_time * 0.8) * 0.05;
        
        // Efecto de partículas
        float particles = 0.0;
        for (int i = 0; i < 20; i++) {
          float fi = float(i);
          vec2 particlePos = vec2(
            sin(u_time * 0.5 + fi * 0.3) * 0.5 + 0.5,
            cos(u_time * 0.3 + fi * 0.4) * 0.5 + 0.5
          );
          float dist = distance(uv, particlePos);
          particles += 0.01 / (dist + 0.01);
        }
        
        // Efecto de gradiente
        vec3 color1 = vec3(0.0, 1.0, 0.53); // #00ff88
        vec3 color2 = vec3(0.31, 0.8, 0.77); // #4ecdc4
        vec3 color3 = vec3(1.0, 0.42, 0.21); // #ff6b35
        
        vec3 gradient = mix(color1, color2, uv.x);
        gradient = mix(gradient, color3, uv.y);
        
        // Aplicar efectos
        vec2 distortedUV = uv + vec2(wave1, wave2) + wave3;
        float intensity = particles * 0.3;
        
        vec3 finalColor = gradient + intensity;
        finalColor = mix(finalColor, vec3(1.0), particles * 0.1);
        
        gl_FragColor = vec4(finalColor, 0.1);
      }
    `;

    this.program = this.createShaderProgram(vertexShaderSource, fragmentShaderSource);
  }

  createShaderProgram(vertexSource, fragmentSource) {
    if (!this.gl) return null;

    const vertexShader = this.createShader(this.gl.VERTEX_SHADER, vertexSource);
    const fragmentShader = this.createShader(this.gl.FRAGMENT_SHADER, fragmentSource);

    const program = this.gl.createProgram();
    this.gl.attachShader(program, vertexShader);
    this.gl.attachShader(program, fragmentShader);
    this.gl.linkProgram(program);

    if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
      console.error('Error linking shader program:', this.gl.getProgramInfoLog(program));
      return null;
    }

    return program;
  }

  createShader(type, source) {
    if (!this.gl) return null;

    const shader = this.gl.createShader(type);
    this.gl.shaderSource(shader, source);
    this.gl.compileShader(shader);

    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      console.error('Error compiling shader:', this.gl.getShaderInfoLog(shader));
      this.gl.deleteShader(shader);
      return null;
    }

    return shader;
  }

  setupBuffers() {
    if (!this.gl || !this.program) return;

    // Crear geometría de cuadrilátero
    const positions = new Float32Array([
      -1, -1,
       1, -1,
      -1,  1,
      -1,  1,
       1, -1,
       1,  1,
    ]);

    const texCoords = new Float32Array([
      0, 0,
      1, 0,
      0, 1,
      0, 1,
      1, 0,
      1, 1,
    ]);

    this.positionBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, positions, this.gl.STATIC_DRAW);

    this.texCoordBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.texCoordBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, texCoords, this.gl.STATIC_DRAW);
  }

  animate() {
    if (this.isReducedMotion) return;

    this.render();
    requestAnimationFrame(() => this.animate());
  }

  render() {
    if (!this.gl || !this.program) return;

    this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    this.gl.useProgram(this.program);

    // Configurar atributos
    const positionLocation = this.gl.getAttribLocation(this.program, 'a_position');
    const texCoordLocation = this.gl.getAttribLocation(this.program, 'a_texCoord');

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
    this.gl.enableVertexAttribArray(positionLocation);
    this.gl.vertexAttribPointer(positionLocation, 2, this.gl.FLOAT, false, 0, 0);

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.texCoordBuffer);
    this.gl.enableVertexAttribArray(texCoordLocation);
    this.gl.vertexAttribPointer(texCoordLocation, 2, this.gl.FLOAT, false, 0, 0);

    // Configurar uniforms
    const timeLocation = this.gl.getUniformLocation(this.program, 'u_time');
    const mouseLocation = this.gl.getUniformLocation(this.program, 'u_mouse');
    const resolutionLocation = this.gl.getUniformLocation(this.program, 'u_resolution');

    this.gl.uniform1f(timeLocation, Date.now() * 0.001);
    this.gl.uniform2f(mouseLocation, this.mouse.x, this.mouse.y);
    this.gl.uniform2f(resolutionLocation, this.canvas.width, this.canvas.height);

    // Dibujar
    this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
  }

  // ===== EFECTOS 3D =====
  setup3DEffects() {
    // Aplicar efectos 3D a elementos
    this.apply3DEffects();
    
    // Observar cambios en el DOM
    const observer = new MutationObserver(() => {
      this.apply3DEffects();
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  apply3DEffects() {
    // Cards 3D avanzadas
    document.querySelectorAll('.card, .stat-card, .action-card').forEach(card => {
      if (!card.classList.contains('card-3d-advanced')) {
        card.classList.add('card-3d-advanced');
        this.add3DInteraction(card);
      }
    });

    // Botones 3D
    document.querySelectorAll('.btn').forEach(btn => {
      if (!btn.classList.contains('btn-3d')) {
        btn.classList.add('btn-3d');
        this.add3DInteraction(btn);
      }
    });

    // Texto 3D
    document.querySelectorAll('h1, h2').forEach(text => {
      if (!text.classList.contains('text-3d')) {
        text.classList.add('text-3d');
      }
    });
  }

  add3DInteraction(element) {
    element.addEventListener('mousemove', (e) => {
      if (this.isReducedMotion) return;
      
      const rect = element.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const rotateX = (y - centerY) / 10;
      const rotateY = (centerX - x) / 10;
      
      element.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(20px)`;
    });

    element.addEventListener('mouseleave', () => {
      element.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)';
    });
  }

  // ===== PARALLAX 3D =====
  setupParallax3D() {
    const parallaxElements = document.querySelectorAll('[data-parallax-3d]');
    
    window.addEventListener('scroll', () => {
      if (this.isReducedMotion) return;
      
      const scrolled = window.pageYOffset;
      
      parallaxElements.forEach(element => {
        const speed = parseFloat(element.dataset.parallax3d) || 0.5;
        const yPos = -(scrolled * speed);
        const zPos = scrolled * speed * 0.1;
        
        element.style.transform = `translateY(${yPos}px) translateZ(${zPos}px)`;
      });
    });
  }

  // ===== TILT 3D =====
  setupTilt3D() {
    const tiltElements = document.querySelectorAll('.tilt-3d-advanced');
    
    tiltElements.forEach(element => {
      element.addEventListener('mousemove', (e) => {
        if (this.isReducedMotion) return;
        
        const rect = element.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = (y - centerY) / 5;
        const rotateY = (centerX - x) / 5;
        
        element.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.1, 1.1, 1.1)`;
      });

      element.addEventListener('mouseleave', () => {
        element.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
      });
    });
  }

  // ===== SISTEMA DE PARTÍCULAS =====
  setupParticleSystem() {
    this.createParticleContainer();
    this.generateParticles();
    this.animateParticles();
  }

  createParticleContainer() {
    const container = document.createElement('div');
    container.className = 'particles-3d';
    container.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: -1;
    `;
    document.body.appendChild(container);
    this.particleContainer = container;
  }

  generateParticles() {
    const particleCount = 50;
    
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle-3d';
      particle.style.cssText = `
        position: absolute;
        width: ${Math.random() * 4 + 2}px;
        height: ${Math.random() * 4 + 2}px;
        background: hsl(${Math.random() * 60 + 180}, 70%, 60%);
        border-radius: 50%;
        left: ${Math.random() * 100}%;
        top: ${Math.random() * 100}%;
        animation-delay: ${Math.random() * 6}s;
        animation-duration: ${Math.random() * 4 + 4}s;
      `;
      
      this.particleContainer.appendChild(particle);
      this.particles.push(particle);
    }
  }

  animateParticles() {
    if (this.isReducedMotion) return;
    
    this.particles.forEach(particle => {
      const rect = particle.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      
      const distance = Math.sqrt(
        Math.pow(x - this.mouse.x, 2) + Math.pow(y - this.mouse.y, 2)
      );
      
      if (distance < 100) {
        const force = (100 - distance) / 100;
        particle.style.transform = `translateZ(${force * 50}px) scale(${1 + force * 0.5})`;
      } else {
        particle.style.transform = 'translateZ(0px) scale(1)';
      }
    });
    
    requestAnimationFrame(() => this.animateParticles());
  }

  // ===== SCROLL 3D =====
  setupScroll3D() {
    const scrollElements = document.querySelectorAll('[data-scroll-3d]');
    
    window.addEventListener('scroll', () => {
      if (this.isReducedMotion) return;
      
      const scrolled = window.pageYOffset;
      const windowHeight = window.innerHeight;
      
      scrollElements.forEach(element => {
        const rect = element.getBoundingClientRect();
        const elementTop = rect.top;
        const elementHeight = rect.height;
        
        if (elementTop < windowHeight && elementTop + elementHeight > 0) {
          const progress = (windowHeight - elementTop) / (windowHeight + elementHeight);
          const rotateX = (progress - 0.5) * 30;
          const translateZ = (progress - 0.5) * 100;
          
          element.style.transform = `perspective(1000px) rotateX(${rotateX}deg) translateZ(${translateZ}px)`;
        }
      });
    });
  }

  // ===== MOUSE TRACKING =====
  setupMouseTracking() {
    document.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
    });
  }

  // ===== PERFORMANCE OPTIMIZATIONS =====
  setupPerformanceOptimizations() {
    // Throttle scroll events
    let scrollTimeout;
    window.addEventListener('scroll', () => {
      if (scrollTimeout) return;
      
      scrollTimeout = setTimeout(() => {
        this.handleScroll();
        scrollTimeout = null;
      }, 16);
    });
    
    // Intersection Observer para elementos 3D
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('gpu-accelerated-3d');
        } else {
          entry.target.classList.remove('gpu-accelerated-3d');
        }
      });
    });
    
    document.querySelectorAll('.card-3d-advanced, .btn-3d, .text-3d').forEach(el => {
      observer.observe(el);
    });
  }

  handleScroll() {
    // Handle scroll-based 3D effects
  }

  // ===== PUBLIC API =====
  createCube3D(container, size = 200) {
    const cube = document.createElement('div');
    cube.className = 'cube-3d';
    cube.style.width = size + 'px';
    cube.style.height = size + 'px';
    
    const faces = ['front', 'back', 'right', 'left', 'top', 'bottom'];
    const texts = ['RSC', 'CHAIN', '3D', 'WEBGL', 'BLOCK', 'CHAIN'];
    
    faces.forEach((face, index) => {
      const faceElement = document.createElement('div');
      faceElement.className = `cube-face ${face}`;
      faceElement.textContent = texts[index];
      cube.appendChild(faceElement);
    });
    
    container.appendChild(cube);
    return cube;
  }

  createFlipCard3D(container, frontText, backText) {
    const flipCard = document.createElement('div');
    flipCard.className = 'flip-card-3d';
    
    const front = document.createElement('div');
    front.className = 'flip-card-front';
    front.textContent = frontText;
    
    const back = document.createElement('div');
    back.className = 'flip-card-back';
    back.textContent = backText;
    
    flipCard.appendChild(front);
    flipCard.appendChild(back);
    container.appendChild(flipCard);
    
    return flipCard;
  }

  createCarousel3D(container, items) {
    const carousel = document.createElement('div');
    carousel.className = 'carousel-3d';
    
    items.forEach((item, index) => {
      const carouselItem = document.createElement('div');
      carouselItem.className = 'carousel-item-3d';
      carouselItem.textContent = item;
      carouselItem.style.setProperty('--rotation', `${index * 60}deg`);
      carousel.appendChild(carouselItem);
    });
    
    container.appendChild(carousel);
    return carousel;
  }

  // ===== DESTROY =====
  destroy() {
    if (this.canvas && this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }
    
    if (this.particleContainer && this.particleContainer.parentNode) {
      this.particleContainer.parentNode.removeChild(this.particleContainer);
    }
    
    this.animations.clear();
    this.particles = [];
  }
}

// ===== INICIALIZACIÓN =====
document.addEventListener('DOMContentLoaded', () => {
  window.RSC3DSystem = new WebGL3DSystem();
});

// ===== EXPORT =====
window.RSC3DSystem = WebGL3DSystem;
