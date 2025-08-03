/* ===============================
   ROADMAP.JS — MANEJO Y ANIMACIÓN ROADMAP
================================= */

// Utilidad para traer roadmap desde JSON local
async function loadRoadmapData() {
  try {
    const res = await fetch('data/roadmap.json');
    if (!res.ok) throw new Error("No se pudo cargar roadmap.json");
    return await res.json();
  } catch (e) {
    console.error('[RSC] Error cargando roadmap:', e);
    return [];
  }
}

// Renderizado dinámico del roadmap
async function renderRoadmap() {
  const container = document.querySelector('.roadmap-timeline');
  if (!container) return;
  container.innerHTML = ""; // Limpia el timeline

  const roadmapData = await loadRoadmapData();
  if (!roadmapData || !roadmapData.length) {
    container.innerHTML = "<div class='roadmap-item'>No hay hitos disponibles.</div>";
    return;
  }

  roadmapData.forEach((item, idx) => {
    const div = document.createElement('div');
    div.className = `roadmap-item q${item.quarter.toLowerCase()}${item.future ? ' future' : ''}`;
    if (item.active) div.classList.add('active');
    div.innerHTML = `
      <div class="roadmap-date">${item.quarter} ${item.year}</div>
      <div class="roadmap-content">
        <h4>${item.title}</h4>
        <p>${item.desc}</p>
        <button class="roadmap-more-btn" data-idx="${idx}">Ver detalles</button>
        <div class="roadmap-details" style="display:none;"></div>
      </div>
    `;
    // Agrega detalles extendidos, si existen
    if (item.details) {
      div.querySelector('.roadmap-details').innerHTML = item.details;
    }
    container.appendChild(div);
  });

  // Animación de aparición secuencial
  if (container.parentElement.classList.contains('roadmap-animate')) {
    setTimeout(() => {
      container.querySelectorAll('.roadmap-item').forEach((el, i) => {
        setTimeout(() => el.classList.add('fade-in'), i * 160);
      });
    }, 350);
  }

  // Manejar clics para ver detalles de cada hito
  container.querySelectorAll('.roadmap-more-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const parent = btn.closest('.roadmap-content');
      const details = parent.querySelector('.roadmap-details');
      if (!details) return;
      const expanded = details.style.display === 'block';
      // Cierra todos
      container.querySelectorAll('.roadmap-details').forEach(d => d.style.display = 'none');
      if (!expanded) details.style.display = 'block';
    });
  });

  // Resalta etapa futura al hacer hover/click
  container.querySelectorAll('.roadmap-item.future').forEach(block => {
    block.addEventListener('mouseenter', () => block.classList.add('active'));
    block.addEventListener('mouseleave', () => block.classList.remove('active'));
    block.addEventListener('click', () => block.classList.toggle('active'));
  });
}

// Inicializa roadmap al cargar
document.addEventListener('DOMContentLoaded', renderRoadmap);

// ===== ROADMAP ISOMÉTRICO 3D - RSC CHAIN =====

class IsometricRoadmap {
  constructor() {
    this.nodes = [];
    this.currentStage = 0;
    this.isAnimating = false;
    this.init();
  }

  init() {
    this.setupNodes();
    this.setupStages();
    this.setupInteractions();
    this.startAnimations();
  }

  setupNodes() {
    const nodeElements = document.querySelectorAll('.roadmap-node');
    this.nodes = Array.from(nodeElements);
    
    // Configurar estados iniciales
    this.nodes.forEach((node, index) => {
      node.dataset.index = index;
      
      // Agregar eventos
      node.addEventListener('mouseenter', () => {
        this.onNodeHover(node);
      });
      
      node.addEventListener('mouseleave', () => {
        this.onNodeLeave(node);
      });
      
      node.addEventListener('click', () => {
        this.showNodeDetails(node);
      });
    });
  }

  setupStages() {
    // Definir etapas del roadmap
    const stages = [
      {
        id: 'token-issue',
        status: 'completed',
        title: 'Token Issue',
        description: 'Lanzamiento inicial del token RSC',
        date: 'October 2022',
        details: {
          achievements: [
            '✅ Token RSC creado y distribuido',
            '✅ Validadores iniciales seleccionados',
            '✅ Smart contracts auditados',
            '✅ Comunidad inicial establecida'
          ],
          metrics: {
            tokens: '1,000,000 RSC',
            validators: '15',
            transactions: '50,000+'
          }
        }
      },
      {
        id: 'new-protocol',
        status: 'completed',
        title: 'New Protocol',
        description: 'Protocolo PoS avanzado implementado',
        date: 'October 2023',
        details: {
          achievements: [
            '✅ Consenso PoS implementado',
            '✅ Validación distribuida activa',
            '✅ Seguridad mejorada',
            '✅ Performance optimizada'
          ],
          metrics: {
            validators: '25',
            tps: '10,000+',
            uptime: '99.9%'
          }
        }
      },
      {
        id: 'token-upgrade',
        status: 'active',
        title: 'Token Upgrade',
        description: 'Actualización con funcionalidades DeFi',
        date: 'October 2024',
        details: {
          achievements: [
            '🔄 Staking avanzado (80% completado)',
            '🔄 Yield farming (70% completado)',
            '🔄 Liquidity pools (60% completado)',
            '⏳ Governance DAO (pendiente)'
          ],
          metrics: {
            staked: '40%',
            pools: '8',
            apy: '12-18%'
          }
        }
      },
      {
        id: 'app-start',
        status: 'pending',
        title: 'APP Start',
        description: 'Aplicación móvil con wallet integrado',
        date: 'October 2025',
        details: {
          features: [
            '📱 Wallet no custodial',
            '💱 Trading P2P',
            '🔒 Seguridad biométrica',
            '🌍 Multi-idioma'
          ],
          platforms: ['iOS', 'Android', 'Web']
        }
      },
      {
        id: 'distribution',
        status: 'pending',
        title: 'Distribution',
        description: 'Expansión global y partnerships',
        date: 'October 2026',
        details: {
          partnerships: [
            '🏦 Bancos tradicionales',
            '💳 Proveedores de pagos',
            '🌐 Exchanges globales',
            '🏛️ Reguladores'
          ],
          markets: ['América', 'Europa', 'Asia', 'África']
        }
      },
      {
        id: 'moon',
        status: 'pending',
        title: 'To the MOON!',
        description: 'Dominio del mercado DeFi',
        date: 'Future here',
        details: {
          vision: [
            '🚀 Líder en DeFi',
            '💎 Token top 10',
            '🌍 Adopción global',
            '⚡ Innovación continua'
          ],
          goals: {
            marketCap: '$10B+',
            users: '100M+',
            countries: '150+'
          }
        }
      }
    ];

    // Aplicar estados
    stages.forEach((stage, index) => {
      const node = this.nodes[index];
      if (node) {
        node.classList.add(stage.status);
        node.dataset.stage = stage.id;
        node.dataset.stageData = JSON.stringify(stage);
      }
    });
  }

  setupInteractions() {
    // Navegación con teclado
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') {
        this.nextStage();
      } else if (e.key === 'ArrowLeft') {
        this.previousStage();
      }
    });

    // Auto-rotación de cubos
    this.setupCubeRotation();
  }

  setupCubeRotation() {
    const cubes = document.querySelectorAll('.cube');
    cubes.forEach((cube, index) => {
      setInterval(() => {
        cube.style.transform = `rotateX(45deg) rotateZ(${Date.now() * 0.001 + index * 0.5}deg)`;
      }, 50);
    });
  }

  onNodeHover(node) {
    if (this.isAnimating) return;
    
    // Efecto de elevación
    node.style.transform = 'scale(1.1) translateZ(30px)';
    
    // Resaltar conexiones
    this.highlightConnections(node);
    
    // Mostrar tooltip
    this.showTooltip(node);
  }

  onNodeLeave(node) {
    if (this.isAnimating) return;
    
    // Restaurar transformación
    node.style.transform = 'scale(1) translateZ(0)';
    
    // Ocultar tooltip
    this.hideTooltip();
    
    // Restaurar conexiones
    this.restoreConnections();
  }

  highlightConnections(node) {
    const connections = document.querySelectorAll('.connection-line');
    connections.forEach(connection => {
      connection.style.strokeWidth = '5';
      connection.style.filter = 'drop-shadow(0 0 10px rgba(78, 205, 196, 0.8))';
    });
  }

  restoreConnections() {
    const connections = document.querySelectorAll('.connection-line');
    connections.forEach(connection => {
      connection.style.strokeWidth = '3';
      connection.style.filter = 'drop-shadow(0 0 5px rgba(78, 205, 196, 0.5))';
    });
  }

  showTooltip(node) {
    const stageData = JSON.parse(node.dataset.stageData || '{}');
    const tooltip = document.createElement('div');
    tooltip.className = 'roadmap-tooltip';
    tooltip.innerHTML = `
      <h4>${stageData.title}</h4>
      <p>${stageData.description}</p>
      <span class="tooltip-date">${stageData.date}</span>
    `;
    
    document.body.appendChild(tooltip);
    
    // Posicionar tooltip
    const rect = node.getBoundingClientRect();
    tooltip.style.left = rect.left + rect.width / 2 + 'px';
    tooltip.style.top = rect.top - 80 + 'px';
    
    setTimeout(() => tooltip.classList.add('active'), 10);
  }

  hideTooltip() {
    const tooltip = document.querySelector('.roadmap-tooltip');
    if (tooltip) {
      tooltip.classList.remove('active');
      setTimeout(() => tooltip.remove(), 300);
    }
  }

  showNodeDetails(node) {
    const stageData = JSON.parse(node.dataset.stageData || '{}');
    
    const modal = document.createElement('div');
    modal.className = 'roadmap-modal';
    modal.innerHTML = `
      <div class="roadmap-modal-content">
        <div class="roadmap-modal-header">
          <h3>${stageData.title}</h3>
          <button class="roadmap-modal-close">&times;</button>
        </div>
        <div class="roadmap-modal-body">
          ${this.getStageDetails(stageData)}
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    setTimeout(() => modal.classList.add('active'), 10);
    
    const closeBtn = modal.querySelector('.roadmap-modal-close');
    closeBtn.addEventListener('click', () => this.closeModal(modal));
    
    modal.addEventListener('click', (e) => {
      if (e.target === modal) this.closeModal(modal);
    });
  }

  getStageDetails(stageData) {
    let details = `
      <div class="stage-info">
        <h4>${stageData.title}</h4>
        <p class="stage-description">${stageData.description}</p>
        <div class="stage-date">${stageData.date}</div>
      </div>
    `;

    if (stageData.details.achievements) {
      details += `
        <div class="stage-achievements">
          <h5>Logros:</h5>
          <ul>
            ${stageData.details.achievements.map(achievement => `<li>${achievement}</li>`).join('')}
          </ul>
        </div>
      `;
    }

    if (stageData.details.features) {
      details += `
        <div class="stage-features">
          <h5>Características:</h5>
          <ul>
            ${stageData.details.features.map(feature => `<li>${feature}</li>`).join('')}
          </ul>
        </div>
      `;
    }

    if (stageData.details.partnerships) {
      details += `
        <div class="stage-partnerships">
          <h5>Partnerships:</h5>
          <ul>
            ${stageData.details.partnerships.map(partnership => `<li>${partnership}</li>`).join('')}
          </ul>
        </div>
      `;
    }

    if (stageData.details.vision) {
      details += `
        <div class="stage-vision">
          <h5>Visión:</h5>
          <ul>
            ${stageData.details.vision.map(vision => `<li>${vision}</li>`).join('')}
          </ul>
        </div>
      `;
    }

    if (stageData.details.metrics) {
      details += `
        <div class="stage-metrics">
          <h5>Métricas:</h5>
          <div class="metrics-grid">
            ${Object.entries(stageData.details.metrics).map(([key, value]) => 
              `<div class="metric">
                <span class="metric-label">${key}:</span>
                <span class="metric-value">${value}</span>
              </div>`
            ).join('')}
          </div>
        </div>
      `;
    }

    return details;
  }

  closeModal(modal) {
    modal.classList.remove('active');
    setTimeout(() => modal.remove(), 300);
  }

  nextStage() {
    if (this.currentStage < this.nodes.length - 1) {
      this.currentStage++;
      this.highlightCurrentStage();
    }
  }

  previousStage() {
    if (this.currentStage > 0) {
      this.currentStage--;
      this.highlightCurrentStage();
    }
  }

  highlightCurrentStage() {
    this.nodes.forEach((node, index) => {
      if (index === this.currentStage) {
        node.style.transform = 'scale(1.1) translateZ(20px)';
        node.style.boxShadow = '0 15px 40px rgba(78, 205, 196, 0.4)';
      } else {
        node.style.transform = 'scale(1) translateZ(0)';
        node.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.2)';
      }
    });
  }

  startAnimations() {
    // Animar entrada de nodos
    this.nodes.forEach((node, index) => {
      setTimeout(() => {
        node.style.animation = 'nodeEntrance 0.8s ease forwards';
      }, index * 200);
    });

    // Animar líneas de conexión
    const lines = document.querySelectorAll('.connection-line');
    lines.forEach((line, index) => {
      setTimeout(() => {
        line.style.animation = 'dash 3s linear infinite';
      }, 1000 + index * 300);
    });
  }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  new IsometricRoadmap();
});

// ===== ROADMAP AVANZADO - SISTEMA COMPLETO RSC CHAIN =====

class AdvancedRoadmap {
  constructor() {
    this.nodes = [];
    this.currentStage = 0;
    this.isAnimating = false;
    this.isZoomed = false;
    this.particles = [];
    this.achievements = [];
    this.votes = {};
    this.init();
  }

  init() {
    this.setupParticles();
    this.setupNodes();
    this.setupStages();
    this.setupControls();
    this.setupInteractions();
    this.setupGamification();
    this.startAnimations();
    this.loadProgress();
  }

  // ===== SISTEMA DE PARTÍCULAS =====
  setupParticles() {
    const container = document.getElementById('particleContainer');
    if (!container) return;

    // Crear partículas
    for (let i = 0; i < 50; i++) {
      this.createParticle(container);
    }

    // Animar partículas
    setInterval(() => {
      this.animateParticles();
    }, 100);
  }

  createParticle(container) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    particle.style.left = Math.random() * 100 + '%';
    particle.style.animationDelay = Math.random() * 8 + 's';
    particle.style.animationDuration = (Math.random() * 4 + 6) + 's';
    container.appendChild(particle);
    this.particles.push(particle);
  }

  animateParticles() {
    this.particles.forEach(particle => {
      if (Math.random() < 0.1) {
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = '0s';
      }
    });
  }

  // ===== CONFIGURACIÓN DE NODOS =====
  setupNodes() {
    const nodeElements = document.querySelectorAll('.roadmap-node');
    this.nodes = Array.from(nodeElements);
    
    this.nodes.forEach((node, index) => {
      node.dataset.index = index;
      
      // Eventos avanzados
      node.addEventListener('mouseenter', () => {
        this.onNodeHover(node);
        this.createParticleEffect(node);
      });
      
      node.addEventListener('mouseleave', () => {
        this.onNodeLeave(node);
      });
      
      node.addEventListener('click', () => {
        this.showNodeDetails(node);
        this.unlockAchievement(node);
      });

      // Touch events para móvil
      node.addEventListener('touchstart', (e) => {
        e.preventDefault();
        this.onNodeTouch(node);
      });
    });
  }

  // ===== CONTROLES DE NAVEGACIÓN =====
  setupControls() {
    const prevBtn = document.getElementById('prevStage');
    const nextBtn = document.getElementById('nextStage');
    const zoomBtn = document.getElementById('zoomToggle');
    const currentStageEl = document.getElementById('currentStage');

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        this.previousStage();
        this.updateStageIndicator();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        this.nextStage();
        this.updateStageIndicator();
      });
    }

    if (zoomBtn) {
      zoomBtn.addEventListener('click', () => {
        this.toggleZoom();
      });
    }

    // Navegación por teclado
    document.addEventListener('keydown', (e) => {
      switch(e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          this.previousStage();
          this.updateStageIndicator();
          break;
        case 'ArrowRight':
          e.preventDefault();
          this.nextStage();
          this.updateStageIndicator();
          break;
        case ' ':
          e.preventDefault();
          this.toggleZoom();
          break;
      }
    });

    // Gestos táctiles
    this.setupTouchGestures();
  }

  setupTouchGestures() {
    let startX = 0;
    let startY = 0;
    const roadmap = document.getElementById('roadmapIsometric');

    if (!roadmap) return;

    roadmap.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    });

    roadmap.addEventListener('touchend', (e) => {
      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;
      const diffX = startX - endX;
      const diffY = startY - endY;

      if (Math.abs(diffX) > Math.abs(diffY)) {
        if (diffX > 50) {
          this.nextStage();
        } else if (diffX < -50) {
          this.previousStage();
        }
      } else {
        if (diffY > 50) {
          this.toggleZoom();
        }
      }
    });
  }

  // ===== GAMIFICACIÓN =====
  setupGamification() {
    this.setupAchievements();
    this.setupVoting();
    this.setupProgressTracking();
  }

  setupAchievements() {
    this.achievements = [
      { id: 'launch', name: '🚀 Lanzamiento', description: 'Completaste el lanzamiento inicial' },
      { id: 'protocol', name: '⚡ Protocolo', description: 'Implementaste el nuevo protocolo' },
      { id: 'upgrade', name: '🔄 Upgrade', description: 'Actualizaste el token exitosamente' },
      { id: 'app', name: '📱 App', description: 'Lanzaste la aplicación móvil' },
      { id: 'global', name: '🌍 Global', description: 'Alcanzaste distribución global' },
      { id: 'moon', name: '🚀 Moon', description: '¡Llegaste a la luna!' }
    ];
  }

  setupVoting() {
    const voteBtns = document.querySelectorAll('.vote-btn');
    voteBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        this.handleVote(btn.dataset.feature);
      });
    });
  }

  handleVote(feature) {
    if (!this.votes[feature]) {
      this.votes[feature] = 0;
    }
    this.votes[feature]++;
    
    // Actualizar UI
    this.updateVoteDisplay(feature);
    
    // Guardar en localStorage
    localStorage.setItem('roadmap_votes', JSON.stringify(this.votes));
    
    // Mostrar feedback
    this.showVoteFeedback(feature);
  }

  updateVoteDisplay(feature) {
    const btn = document.querySelector(`[data-feature="${feature}"]`);
    if (btn) {
      const totalVotes = Object.values(this.votes).reduce((a, b) => a + b, 0);
      const percentage = totalVotes > 0 ? Math.round((this.votes[feature] / totalVotes) * 100) : 0;
      const countEl = btn.querySelector('.vote-count');
      if (countEl) {
        countEl.textContent = `${percentage}%`;
      }
    }
  }

  showVoteFeedback(feature) {
    const feedback = document.createElement('div');
    feedback.className = 'vote-feedback';
    feedback.innerHTML = `
      <span class="feedback-icon">👍</span>
      <span class="feedback-text">¡Voto registrado para ${feature}!</span>
    `;
    
    document.body.appendChild(feedback);
    
    setTimeout(() => {
      feedback.classList.add('show');
    }, 10);
    
    setTimeout(() => {
      feedback.classList.remove('show');
      setTimeout(() => feedback.remove(), 300);
    }, 2000);
  }

  setupProgressTracking() {
    // Cargar progreso guardado
    const savedProgress = localStorage.getItem('roadmap_progress');
    if (savedProgress) {
      this.progress = JSON.parse(savedProgress);
    } else {
      this.progress = {
        overall: 25,
        stages: {
          'token-issue': 100,
          'new-protocol': 100,
          'token-upgrade': 75,
          'app-start': 0,
          'distribution': 0,
          'moon': 0
        }
      };
    }
    
    this.updateProgressDisplay();
  }

  updateProgressDisplay() {
    const progressFill = document.getElementById('overallProgress');
    const progressText = document.getElementById('progressPercent');
    
    if (progressFill) {
      progressFill.style.width = `${this.progress.overall}%`;
    }
    
    if (progressText) {
      progressText.textContent = `${this.progress.overall}%`;
    }
  }

  // ===== INTERACCIONES AVANZADAS =====
  onNodeHover(node) {
    if (this.isAnimating) return;
    
    // Efecto de elevación
    node.style.transform = 'scale(1.1) translateZ(40px)';
    
    // Resaltar conexiones
    this.highlightConnections(node);
    
    // Crear efecto de partículas
    this.createParticleEffect(node);
    
    // Mostrar tooltip avanzado
    this.showAdvancedTooltip(node);
  }

  onNodeLeave(node) {
    if (this.isAnimating) return;
    
    node.style.transform = 'scale(1) translateZ(0)';
    this.hideAdvancedTooltip();
    this.restoreConnections();
  }

  onNodeTouch(node) {
    // Para dispositivos táctiles
    this.showNodeDetails(node);
    this.unlockAchievement(node);
  }

  createParticleEffect(node) {
    const rect = node.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        this.createExplosionParticle(centerX, centerY);
      }, i * 100);
    }
  }

  createExplosionParticle(x, y) {
    const particle = document.createElement('div');
    particle.className = 'explosion-particle';
    particle.style.left = x + 'px';
    particle.style.top = y + 'px';
    particle.style.background = '#4ECDC4';
    
    document.body.appendChild(particle);
    
    setTimeout(() => {
      particle.remove();
    }, 1000);
  }

  // ===== LOGROS Y GAMIFICACIÓN =====
  unlockAchievement(node) {
    const stageId = node.dataset.stage;
    const achievement = this.achievements.find(a => a.id === stageId);
    
    if (achievement && !this.isAchievementUnlocked(achievement.id)) {
      this.showAchievementUnlocked(achievement);
      this.saveAchievement(achievement.id);
    }
  }

  isAchievementUnlocked(achievementId) {
    const unlocked = JSON.parse(localStorage.getItem('roadmap_achievements') || '[]');
    return unlocked.includes(achievementId);
  }

  saveAchievement(achievementId) {
    const unlocked = JSON.parse(localStorage.getItem('roadmap_achievements') || '[]');
    if (!unlocked.includes(achievementId)) {
      unlocked.push(achievementId);
      localStorage.setItem('roadmap_achievements', JSON.stringify(unlocked));
    }
  }

  showAchievementUnlocked(achievement) {
    const achievementEl = document.getElementById('achievementUnlocked');
    if (achievementEl) {
      const iconEl = achievementEl.querySelector('.achievement-icon');
      const textEl = achievementEl.querySelector('.achievement-text');
      
      if (iconEl) iconEl.textContent = achievement.name.split(' ')[0];
      if (textEl) textEl.textContent = achievement.description;
      
      achievementEl.classList.add('show');
      
      setTimeout(() => {
        achievementEl.classList.remove('show');
      }, 3000);
    }
  }

  // ===== NAVEGACIÓN AVANZADA =====
  nextStage() {
    if (this.currentStage < this.nodes.length - 1) {
      this.currentStage++;
      this.highlightCurrentStage();
      this.updateProgress();
    }
  }

  previousStage() {
    if (this.currentStage > 0) {
      this.currentStage--;
      this.highlightCurrentStage();
      this.updateProgress();
    }
  }

  highlightCurrentStage() {
    this.nodes.forEach((node, index) => {
      if (index === this.currentStage) {
        node.style.transform = 'scale(1.15) translateZ(30px)';
        node.style.boxShadow = '0 20px 50px rgba(78, 205, 196, 0.5)';
        node.classList.add('active');
      } else {
        node.style.transform = 'scale(1) translateZ(0)';
        node.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.2)';
        node.classList.remove('active');
      }
    });
  }

  updateStageIndicator() {
    const currentStageEl = document.getElementById('currentStage');
    if (currentStageEl) {
      currentStageEl.textContent = this.currentStage + 1;
    }
  }

  toggleZoom() {
    const roadmap = document.getElementById('roadmapIsometric');
    if (roadmap) {
      this.isZoomed = !this.isZoomed;
      roadmap.classList.toggle('zoomed', this.isZoomed);
      
      const zoomBtn = document.getElementById('zoomToggle');
      if (zoomBtn) {
        zoomBtn.innerHTML = this.isZoomed ? 
          '<span class="btn-icon">🔍-</span>' : 
          '<span class="btn-icon">🔍+</span>';
      }
    }
  }

  // ===== PROGRESO Y MÉTRICAS =====
  updateProgress() {
    const completedStages = this.nodes.filter(node => 
      node.classList.contains('completed')
    ).length;
    
    this.progress.overall = Math.round((completedStages / this.nodes.length) * 100);
    this.updateProgressDisplay();
    
    // Guardar progreso
    localStorage.setItem('roadmap_progress', JSON.stringify(this.progress));
  }

  loadProgress() {
    // Cargar votos guardados
    const savedVotes = localStorage.getItem('roadmap_votes');
    if (savedVotes) {
      this.votes = JSON.parse(savedVotes);
      Object.keys(this.votes).forEach(feature => {
        this.updateVoteDisplay(feature);
      });
    }
  }

  // ===== ANIMACIONES AVANZADAS =====
  startAnimations() {
    // Animar entrada de nodos con delay escalonado
    this.nodes.forEach((node, index) => {
      setTimeout(() => {
        node.style.animation = 'nodeEntrance 0.8s ease forwards';
      }, index * 300);
    });

    // Animar líneas de conexión
    const lines = document.querySelectorAll('.connection-line');
    lines.forEach((line, index) => {
      setTimeout(() => {
        line.style.animation = 'dash 3s linear infinite';
      }, 1500 + index * 400);
    });

    // Animar cubos
    this.animateCubes();
  }

  animateCubes() {
    const cubes = document.querySelectorAll('.cube');
    cubes.forEach((cube, index) => {
      setInterval(() => {
        const rotation = Date.now() * 0.001 + index * 0.5;
        cube.style.transform = `rotateX(45deg) rotateY(${rotation}deg) rotateZ(${rotation * 0.5}deg)`;
      }, 50);
    });
  }

  // ===== TOOLTIPS AVANZADOS =====
  showAdvancedTooltip(node) {
    const stageData = JSON.parse(node.dataset.stageData || '{}');
    const tooltip = document.createElement('div');
    tooltip.className = 'advanced-tooltip';
    tooltip.innerHTML = `
      <div class="tooltip-header">
        <h4>${stageData.title}</h4>
        <div class="tooltip-status ${stageData.status}">${this.getStatusText(stageData.status)}</div>
      </div>
      <p>${stageData.description}</p>
      <div class="tooltip-metrics">
        ${this.getTooltipMetrics(stageData)}
      </div>
      <div class="tooltip-date">${stageData.date}</div>
    `;
    
    document.body.appendChild(tooltip);
    
    // Posicionar tooltip
    const rect = node.getBoundingClientRect();
    tooltip.style.left = rect.left + rect.width / 2 + 'px';
    tooltip.style.top = rect.top - 120 + 'px';
    
    setTimeout(() => tooltip.classList.add('active'), 10);
  }

  hideAdvancedTooltip() {
    const tooltip = document.querySelector('.advanced-tooltip');
    if (tooltip) {
      tooltip.classList.remove('active');
      setTimeout(() => tooltip.remove(), 300);
    }
  }

  getStatusText(status) {
    const statusMap = {
      'completed': '✅ Completado',
      'active': '🔄 En Progreso',
      'pending': '⏳ Pendiente'
    };
    return statusMap[status] || '⏳ Pendiente';
  }

  getTooltipMetrics(stageData) {
    if (!stageData.details || !stageData.details.metrics) return '';
    
    return Object.entries(stageData.details.metrics)
      .map(([key, value]) => `<div class="tooltip-metric"><strong>${key}:</strong> ${value}</div>`)
      .join('');
  }

  // ===== CONEXIONES Y EFECTOS =====
  highlightConnections(node) {
    const connections = document.querySelectorAll('.connection-line');
    connections.forEach(connection => {
      connection.style.strokeWidth = '5';
      connection.style.filter = 'drop-shadow(0 0 15px rgba(78, 205, 196, 0.8))';
    });
  }

  restoreConnections() {
    const connections = document.querySelectorAll('.connection-line');
    connections.forEach(connection => {
      connection.style.strokeWidth = '3';
      connection.style.filter = 'drop-shadow(0 0 5px rgba(78, 205, 196, 0.5))';
    });
  }

  // ===== DETALLES DE NODOS =====
  showNodeDetails(node) {
    const stageData = JSON.parse(node.dataset.stageData || '{}');
    
    const modal = document.createElement('div');
    modal.className = 'advanced-roadmap-modal';
    modal.innerHTML = `
      <div class="advanced-modal-content">
        <div class="advanced-modal-header">
          <h3>${stageData.title}</h3>
          <button class="advanced-modal-close">&times;</button>
        </div>
        <div class="advanced-modal-body">
          ${this.getAdvancedStageDetails(stageData)}
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    setTimeout(() => modal.classList.add('active'), 10);
    
    const closeBtn = modal.querySelector('.advanced-modal-close');
    closeBtn.addEventListener('click', () => this.closeAdvancedModal(modal));
    
    modal.addEventListener('click', (e) => {
      if (e.target === modal) this.closeAdvancedModal(modal);
    });
  }

  getAdvancedStageDetails(stageData) {
    let details = `
      <div class="advanced-stage-info">
        <h4>${stageData.title}</h4>
        <p class="advanced-stage-description">${stageData.description}</p>
        <div class="advanced-stage-date">${stageData.date}</div>
      </div>
    `;

    if (stageData.details) {
      if (stageData.details.achievements) {
        details += `
          <div class="advanced-achievements">
            <h5>Logros Principales:</h5>
            <ul>
              ${stageData.details.achievements.map(achievement => `<li>${achievement}</li>`).join('')}
            </ul>
          </div>
        `;
      }

      if (stageData.details.metrics) {
        details += `
          <div class="advanced-metrics">
            <h5>Métricas Clave:</h5>
            <div class="metrics-grid">
              ${Object.entries(stageData.details.metrics).map(([key, value]) => 
                `<div class="advanced-metric">
                  <span class="metric-label">${key}:</span>
                  <span class="metric-value">${value}</span>
                </div>`
              ).join('')}
            </div>
          </div>
        `;
      }

      if (stageData.details.features) {
        details += `
          <div class="advanced-features">
            <h5>Características:</h5>
            <ul>
              ${stageData.details.features.map(feature => `<li>${feature}</li>`).join('')}
            </ul>
          </div>
        `;
      }
    }

    return details;
  }

  closeAdvancedModal(modal) {
    modal.classList.remove('active');
    setTimeout(() => modal.remove(), 300);
  }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  new AdvancedRoadmap();
});

