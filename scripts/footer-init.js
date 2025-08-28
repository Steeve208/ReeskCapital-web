/* ================================
   FOOTER INITIALIZER
   🚀 ACTIVACIÓN INMEDIATA
================================ */

console.log('🚀 Iniciando Footer Initializer...');

// Función para inicializar el footer inmediatamente
function initializeFooterImmediately() {
  console.log('📱 Inicializando footer...');
  
  // 1. Crear partículas 3D
  createParticles();
  
  // 2. Activar animaciones
  activateAnimations();
  
  // 3. Configurar eventos
  setupEvents();
  
  // 4. Mostrar elementos
  showElements();
  
  console.log('✅ Footer inicializado correctamente');
}

// Crear partículas 3D
function createParticles() {
  const footer = document.querySelector('.footer-professional');
  if (!footer) {
    console.log('❌ Footer no encontrado');
    return;
  }
  
  // Crear contenedor de partículas
  let particlesContainer = footer.querySelector('.footer-particles-3d');
  if (!particlesContainer) {
    particlesContainer = document.createElement('div');
    particlesContainer.className = 'footer-particles-3d';
    footer.appendChild(particlesContainer);
  }
  
  // Crear partículas
  for (let i = 0; i < 15; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle-3d';
    particle.style.cssText = `
      position: absolute;
      width: 4px;
      height: 4px;
      background: #00ff88;
      border-radius: 50%;
      left: ${Math.random() * 100}%;
      animation: particleFloat ${15 + Math.random() * 10}s linear infinite;
      animation-delay: ${Math.random() * 20}s;
      z-index: 1;
    `;
    particlesContainer.appendChild(particle);
  }
  
  // Crear grid holográfico
  let grid = footer.querySelector('.footer-holographic-grid');
  if (!grid) {
    grid = document.createElement('div');
    grid.className = 'footer-holographic-grid';
    footer.appendChild(grid);
  }
  
  console.log('✨ Partículas 3D creadas');
}

// Activar animaciones
function activateAnimations() {
  // Animar estadísticas
  const statNumbers = document.querySelectorAll('.stat-number');
  statNumbers.forEach((stat, index) => {
    setTimeout(() => {
      stat.style.animation = 'statUpdate 0.5s ease';
      stat.style.transform = 'scale(1.1)';
      setTimeout(() => {
        stat.style.transform = 'scale(1)';
      }, 500);
    }, index * 200);
  });
  
  // Mostrar elementos con animación
  const elements = document.querySelectorAll('.footer-column, .stat-item, .newsletter-section, .legal-section, .social-proof-section, .back-to-top-section');
  elements.forEach((element, index) => {
    setTimeout(() => {
      element.style.opacity = '1';
      element.style.transform = 'translateY(0)';
    }, index * 100);
  });
  
  console.log('🎬 Animaciones activadas');
}

// Configurar eventos
function setupEvents() {
  // Hover effects para enlaces
  const footerLinks = document.querySelectorAll('.footer-link');
  footerLinks.forEach(link => {
    link.addEventListener('mouseenter', function() {
      this.style.transform = 'translateX(8px) scale(1.02)';
      this.style.color = '#00ff88';
    });
    
    link.addEventListener('mouseleave', function() {
      this.style.transform = 'translateX(0) scale(1)';
      this.style.color = '';
    });
  });
  
  // Hover effects para redes sociales
  const socialLinks = document.querySelectorAll('.social-link');
  socialLinks.forEach(link => {
    link.addEventListener('mouseenter', function() {
      this.style.transform = 'translateY(-5px) scale(1.05)';
      this.style.boxShadow = '0 8px 25px rgba(0, 255, 136, 0.3)';
    });
    
    link.addEventListener('mouseleave', function() {
      this.style.transform = 'translateY(0) scale(1)';
      this.style.boxShadow = '';
    });
  });
  
  // Hover effects para estadísticas
  const statItems = document.querySelectorAll('.stat-item');
  statItems.forEach(item => {
    item.addEventListener('mouseenter', function() {
      this.style.transform = 'translateY(-8px) scale(1.05)';
      this.style.boxShadow = '0 15px 40px rgba(0, 255, 136, 0.3)';
    });
    
    item.addEventListener('mouseleave', function() {
      this.style.transform = 'translateY(0) scale(1)';
      this.style.boxShadow = '';
    });
  });
  
  // Newsletter
  const newsletterForm = document.querySelector('.newsletter-form');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const input = this.querySelector('.newsletter-input');
      const button = this.querySelector('.newsletter-btn');
      
      if (input.value) {
        button.innerHTML = '<span>¡Enviado! 🎉</span>';
        button.style.background = 'linear-gradient(135deg, #00ff88, #00ccff)';
        input.value = '';
        
        setTimeout(() => {
          button.innerHTML = '<span>Suscribirse</span><span class="btn-arrow">→</span>';
          button.style.background = '';
        }, 2000);
      }
    });
  }
  
  // Botón volver arriba
  const backToTopBtn = document.getElementById('backToTop');
  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', function() {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
    
    // Mostrar/ocultar botón
    window.addEventListener('scroll', function() {
      if (window.pageYOffset > 300) {
        backToTopBtn.style.opacity = '1';
        backToTopBtn.style.visibility = 'visible';
      } else {
        backToTopBtn.style.opacity = '0';
        backToTopBtn.style.visibility = 'hidden';
      }
    });
  }
  
  console.log('🎯 Eventos configurados');
}

// Mostrar elementos
function showElements() {
  // Hacer visibles todos los elementos
  const hiddenElements = document.querySelectorAll('.footer-column, .stat-item, .newsletter-section, .legal-section, .social-proof-section, .back-to-top-section');
  hiddenElements.forEach(element => {
    element.style.opacity = '1';
    element.style.transform = 'translateY(0)';
  });
  
  // Activar barras de progreso
  const progressBars = document.querySelectorAll('.stat-progress');
  progressBars.forEach((bar, index) => {
    setTimeout(() => {
      bar.style.width = '100%';
    }, index * 200);
  });
  
  console.log('👁️ Elementos mostrados');
}

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeFooterImmediately);
} else {
  initializeFooterImmediately();
}

// Inicializar también cuando se cargue la ventana
window.addEventListener('load', function() {
  setTimeout(initializeFooterImmediately, 500);
});

// Función global para reinicializar
window.reinitializeFooter = initializeFooterImmediately;

console.log('🎯 Footer Initializer cargado y listo');
