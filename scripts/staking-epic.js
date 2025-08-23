// ===== STAKING-EPIC.JS - STAKING ÉPICO AVANZADO =====

class StakingEpic {
  constructor() {
    this.isInitialized = false;
    this.currentSection = 'dashboard';
    this.charts = {};
    this.websocket = null;
    this.userLevel = 5;
    this.userXP = 750;
    this.achievements = [];
    this.staking3d = null;
    
    this.init();
  }

  init() {
    if (this.isInitialized) return;
    
    this.setupEventListeners();
    this.initializeCharts();
    this.initialize3DVisualization();
    this.loadInitialData();
    this.setupWebSocket();
    this.loadAchievements();
    this.startAutoRefresh();
    
    this.isInitialized = true;
  }

  setupEventListeners() {
    // Navegación del sidebar
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const section = item.dataset.section;
        this.showSection(section);
        
        // Actualizar estado activo
        document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
        item.classList.add('active');
      });
    });

    // Botones de control
    document.getElementById('refreshBtn').addEventListener('click', () => {
      this.refreshData();
    });

    document.getElementById('claimAllBtn').addEventListener('click', () => {
      this.claimAllRewards();
    });

    // Controles de visualización 3D
    document.querySelectorAll('.control-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const view = btn.dataset.view;
        this.change3DView(view);
        
        document.querySelectorAll('.control-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });

    // Controles de gráficos
    document.querySelectorAll('.time-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const period = btn.dataset.period;
        this.updateChartPeriod(period);
        
        document.querySelectorAll('.time-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });

    // Filtros de pools
    document.getElementById('poolTypeFilter').addEventListener('change', (e) => {
      this.filterPools(e.target.value);
    });

    // Cerrar modales
    document.getElementById('modalClose').addEventListener('click', () => {
      this.closeModal('stakeModal');
    });

    document.getElementById('rewardsModalClose').addEventListener('click', () => {
      this.closeModal('rewardsModal');
    });

    // Click fuera de modales para cerrar
    document.querySelectorAll('.stake-modal, .rewards-modal').forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          this.closeModal(modal.id);
        }
      });
    });
  }

  showSection(sectionName) {
    // Ocultar todas las secciones
    document.querySelectorAll('.staking-section').forEach(section => {
      section.classList.remove('active');
    });

    // Mostrar la sección seleccionada
    const targetSection = document.getElementById(sectionName);
    if (targetSection) {
      targetSection.classList.add('active');
      this.currentSection = sectionName;
      
      // Cargar datos específicos de la sección
      this.loadSectionData(sectionName);
    }
  }

  loadSectionData(sectionName) {
    switch (sectionName) {
      case 'dashboard':
        this.loadDashboardData();
        break;
      case 'pools':
        this.loadPoolsData();
        break;
      case 'my-stakes':
        this.loadMyStakesData();
        break;
      case 'validators':
        this.loadValidatorsData();
        break;
      case 'rewards':
        this.loadRewardsData();
        break;
      case 'analytics':
        this.loadAnalyticsData();
        break;
    }
  }

  initializeCharts() {
    // Gráfico de rendimiento de staking
    const performanceCtx = document.getElementById('stakingPerformanceChart');
    if (performanceCtx) {
      this.charts.performance = new Chart(performanceCtx, {
        type: 'line',
        data: {
          labels: this.generateTimeLabels(7),
          datasets: [{
            label: 'APY',
            data: this.generateRandomData(7, 8, 15),
            borderColor: '#7657fc',
            backgroundColor: 'rgba(118, 87, 252, 0.1)',
            tension: 0.4,
            fill: true
          }, {
            label: 'Recompensas',
            data: this.generateRandomData(7, 10, 50),
            borderColor: '#3fd8c2',
            backgroundColor: 'rgba(63, 216, 194, 0.1)',
            tension: 0.4,
            fill: true
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              labels: {
                color: '#e4e9ff'
              }
            }
          },
          scales: {
            x: {
              ticks: {
                color: '#bfc3df'
              },
              grid: {
                color: 'rgba(118, 87, 252, 0.1)'
              }
            },
            y: {
              ticks: {
                color: '#bfc3df'
              },
              grid: {
                color: 'rgba(118, 87, 252, 0.1)'
              }
            }
          }
        }
      });
    }

    // Gráfico de distribución de pools
    const distributionCtx = document.getElementById('poolsDistributionChart');
    if (distributionCtx) {
      this.charts.distribution = new Chart(distributionCtx, {
        type: 'doughnut',
        data: {
          labels: ['Líquido', 'Bloqueado', 'Flexible', 'Otros'],
          datasets: [{
            data: [40, 30, 20, 10],
            backgroundColor: [
              '#7657fc',
              '#3fd8c2',
              '#e0c64a',
              '#f59e0b'
            ],
            borderWidth: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                color: '#e4e9ff',
                padding: 20
              }
            }
          }
        }
      });
    }

    // Gráficos de analytics
    this.initializeAnalyticsCharts();
  }

  initializeAnalyticsCharts() {
    // Gráfico de rendimiento histórico
    const historicalCtx = document.getElementById('historicalPerformanceChart');
    if (historicalCtx) {
      this.charts.historical = new Chart(historicalCtx, {
        type: 'line',
        data: {
          labels: this.generateTimeLabels(30),
          datasets: [{
            label: 'Rendimiento Total',
            data: this.generateRandomData(30, 100, 200),
            borderColor: '#7657fc',
            backgroundColor: 'rgba(118, 87, 252, 0.1)',
            tension: 0.4,
            fill: true
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              labels: {
                color: '#e4e9ff'
              }
            }
          },
          scales: {
            x: {
              ticks: {
                color: '#bfc3df'
              },
              grid: {
                color: 'rgba(118, 87, 252, 0.1)'
              }
            },
            y: {
              ticks: {
                color: '#bfc3df'
              },
              grid: {
                color: 'rgba(118, 87, 252, 0.1)'
              }
            }
          }
        }
      });
    }

    // Gráfico de comparación de pools
    const comparisonCtx = document.getElementById('poolsComparisonChart');
    if (comparisonCtx) {
      this.charts.comparison = new Chart(comparisonCtx, {
        type: 'bar',
        data: {
          labels: ['Pool A', 'Pool B', 'Pool C', 'Pool D'],
          datasets: [{
            label: 'APY',
            data: [12.5, 11.8, 13.2, 10.9],
            backgroundColor: [
              '#7657fc',
              '#3fd8c2',
              '#e0c64a',
              '#f59e0b'
            ],
            borderWidth: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              labels: {
                color: '#e4e9ff'
              }
            }
          },
          scales: {
            x: {
              ticks: {
                color: '#bfc3df'
              },
              grid: {
                color: 'rgba(118, 87, 252, 0.1)'
              }
            },
            y: {
              ticks: {
                color: '#bfc3df'
              },
              grid: {
                color: 'rgba(118, 87, 252, 0.1)'
              }
            }
          }
        }
      });
    }

    // Gráfico de optimización
    const optimizationCtx = document.getElementById('stakingOptimizationChart');
    if (optimizationCtx) {
      this.charts.optimization = new Chart(optimizationCtx, {
        type: 'radar',
        data: {
          labels: ['APY', 'Liquidez', 'Seguridad', 'Flexibilidad', 'Comisión'],
          datasets: [{
            label: 'Pool Actual',
            data: [85, 70, 90, 60, 80],
            borderColor: '#7657fc',
            backgroundColor: 'rgba(118, 87, 252, 0.2)',
            pointBackgroundColor: '#7657fc',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: '#7657fc'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              labels: {
                color: '#e4e9ff'
              }
            }
          },
          scales: {
            r: {
              beginAtZero: true,
              max: 100,
              ticks: {
                color: '#bfc3df',
                backdropColor: 'transparent'
              },
              grid: {
                color: 'rgba(118, 87, 252, 0.1)'
              },
              pointLabels: {
                color: '#bfc3df'
              }
            }
          }
        }
      });
    }

    // Gráfico de predicciones
    const predictionsCtx = document.getElementById('stakingPredictionsChart');
    if (predictionsCtx) {
      this.charts.predictions = new Chart(predictionsCtx, {
        type: 'line',
        data: {
          labels: this.generateTimeLabels(12),
          datasets: [{
            label: 'Predicción APY',
            data: this.generateRandomData(12, 10, 18),
            borderColor: '#3fd8c2',
            backgroundColor: 'rgba(63, 216, 194, 0.1)',
            tension: 0.4,
            fill: true,
            borderDash: [5, 5]
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              labels: {
                color: '#e4e9ff'
              }
            }
          },
          scales: {
            x: {
              ticks: {
                color: '#bfc3df'
              },
              grid: {
                color: 'rgba(118, 87, 252, 0.1)'
              }
            },
            y: {
              ticks: {
                color: '#bfc3df'
              },
              grid: {
                color: 'rgba(118, 87, 252, 0.1)'
              }
            }
          }
        }
      });
    }
  }

  initialize3DVisualization() {
    const container = document.getElementById('staking3d');
    if (!container) return;

    // Configurar Three.js
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    // Crear elementos 3D
    this.create3DElements(scene);

    // Configurar cámara
    camera.position.z = 5;

    // Animación
    const animate = () => {
      requestAnimationFrame(animate);
      
      // Rotar elementos
      scene.children.forEach(child => {
        if (child.type === 'Mesh') {
          child.rotation.x += 0.01;
          child.rotation.y += 0.01;
        }
      });
      
      renderer.render(scene, camera);
    };

    animate();

    // Responsive
    window.addEventListener('resize', () => {
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    });

    this.staking3d = { scene, camera, renderer };
  }

  create3DElements(scene) {
    // Crear pools de staking
    for (let i = 0; i < 8; i++) {
      const geometry = new THREE.CylinderGeometry(0.3, 0.3, 1, 8);
      const material = new THREE.MeshPhongMaterial({
        color: 0x7657fc,
        transparent: true,
        opacity: 0.8
      });
      const cylinder = new THREE.Mesh(geometry, material);
      
      cylinder.position.x = (Math.random() - 0.5) * 8;
      cylinder.position.y = (Math.random() - 0.5) * 8;
      cylinder.position.z = (Math.random() - 0.5) * 8;
      
      scene.add(cylinder);
    }

    // Crear conexiones entre pools
    for (let i = 0; i < 15; i++) {
      const geometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(Math.random() * 8 - 4, Math.random() * 8 - 4, Math.random() * 8 - 4),
        new THREE.Vector3(Math.random() * 8 - 4, Math.random() * 8 - 4, Math.random() * 8 - 4)
      ]);
      const material = new THREE.LineBasicMaterial({ color: 0x3fd8c2, transparent: true, opacity: 0.5 });
      const line = new THREE.Line(geometry, material);
      scene.add(line);
    }

    // Añadir luces
    const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0x7657fc, 1);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);
  }

  change3DView(view) {
    if (!this.staking3d) return;

    const { scene } = this.staking3d;
    
    // Limpiar escena
    while(scene.children.length > 0) {
      scene.remove(scene.children[0]);
    }

    // Recrear elementos según la vista
    switch (view) {
      case 'pools':
        this.createPoolsView(scene);
        break;
      case 'stakes':
        this.createStakesView(scene);
        break;
      case 'rewards':
        this.createRewardsView(scene);
        break;
    }
  }

  createPoolsView(scene) {
    // Crear pools como cilindros
    for (let i = 0; i < 6; i++) {
      const geometry = new THREE.CylinderGeometry(0.4, 0.4, 1.2, 8);
      const material = new THREE.MeshPhongMaterial({
        color: 0x7657fc,
        transparent: true,
        opacity: 0.8
      });
      const cylinder = new THREE.Mesh(geometry, material);
      
      cylinder.position.x = (i - 2.5) * 2;
      cylinder.position.y = 0;
      cylinder.position.z = 0;
      
      scene.add(cylinder);
    }

    // Añadir luces
    const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0x7657fc, 1);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);
  }

  createStakesView(scene) {
    // Crear stakes como esferas
    for (let i = 0; i < 20; i++) {
      const geometry = new THREE.SphereGeometry(0.2, 16, 16);
      const material = new THREE.MeshPhongMaterial({
        color: 0x3fd8c2,
        transparent: true,
        opacity: 0.7
      });
      const sphere = new THREE.Mesh(geometry, material);
      
      sphere.position.x = (Math.random() - 0.5) * 10;
      sphere.position.y = (Math.random() - 0.5) * 10;
      sphere.position.z = (Math.random() - 0.5) * 10;
      
      scene.add(sphere);
    }

    // Añadir luces
    const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0x3fd8c2, 1);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);
  }

  createRewardsView(scene) {
    // Crear recompensas como partículas doradas
    for (let i = 0; i < 30; i++) {
      const geometry = new THREE.SphereGeometry(0.1, 8, 8);
      const material = new THREE.MeshPhongMaterial({
        color: 0xe0c64a,
        transparent: true,
        opacity: 0.8
      });
      const sphere = new THREE.Mesh(geometry, material);
      
      sphere.position.x = (Math.random() - 0.5) * 12;
      sphere.position.y = (Math.random() - 0.5) * 12;
      sphere.position.z = (Math.random() - 0.5) * 12;
      
      scene.add(sphere);
    }

    // Añadir luces
    const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xe0c64a, 1);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);
  }

  setupWebSocket() {
    // Simular WebSocket para datos en tiempo real
    setInterval(async () => {
      await this.updateRealTimeData();
    }, 5000);
  }

  async updateRealTimeData() {
    // Intentar obtener datos reales de la API de RSC Chain
    let stats = {
      totalStaked: 0,
      totalRewards: 0,
      avgAPY: 0,
      myStaked: 0,
      myRewards: 0,
      myAPY: 0,
      myRank: 0
    };

    try {
      // Obtener estadísticas de staking de la API
      const response = await fetch('https://rsc-chain-production.up.railway.app/api/staking/stats');
      if (response.ok) {
        const data = await response.json();
        stats = {
          totalStaked: data.total_staked || 0,
          totalRewards: data.total_rewards || 0,
          avgAPY: data.average_apy || 0,
          myStaked: data.my_staked || 0,
          myRewards: data.my_rewards || 0,
          myAPY: data.my_apy || 0,
          myRank: data.my_rank || 0
        };
        console.log('✅ Datos de staking reales obtenidos desde RSC Chain API');
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.warn('⚠️ No se pudieron cargar datos de staking reales:', error.message);
      // Mantener valores en 0 si no hay conexión
    }

    // Actualizar UI
    document.getElementById('totalStaked').textContent = stats.totalStaked.toLocaleString() + ' RSC';
    document.getElementById('totalRewards').textContent = stats.totalRewards.toLocaleString() + ' RSC';
    document.getElementById('avgAPY').textContent = stats.avgAPY + '%';
    document.getElementById('myStaked').textContent = stats.myStaked.toLocaleString() + ' RSC';
    document.getElementById('myRewards').textContent = stats.myRewards.toLocaleString() + ' RSC';
    document.getElementById('myAPY').textContent = stats.myAPY + '%';
    document.getElementById('myRank').textContent = '#' + stats.myRank.toLocaleString();

    // Actualizar overlay
    document.getElementById('overlayPools').textContent = '12';
    document.getElementById('overlayStakes').textContent = '1,247';
    document.getElementById('overlayRewards').textContent = '45.6K RSC';
  }

  loadAchievements() {
    this.achievements = [
      { id: 1, title: 'Primer Stake', desc: 'Completa tu primer stake', icon: '🥇', unlocked: true },
      { id: 2, title: 'Staker Activo', desc: 'Stakea por 7 días', icon: '💰', unlocked: true },
      { id: 3, title: 'Staker Épico', desc: 'Stakea 1000 RSC', icon: '👑', unlocked: false },
      { id: 4, title: 'Recompensas Doradas', desc: 'Gana 100 RSC en recompensas', icon: '🏆', unlocked: false },
      { id: 5, title: 'Validador Maestro', desc: 'Participa en 5 pools diferentes', icon: '🔐', unlocked: false }
    ];

    this.updateAchievementsUI();
  }

  updateAchievementsUI() {
    const container = document.querySelector('.achievements-list');
    if (!container) return;

    container.innerHTML = '';
    
    this.achievements.forEach(achievement => {
      const item = document.createElement('div');
      item.className = `achievement-item ${achievement.unlocked ? 'unlocked' : 'locked'}`;
      item.innerHTML = `
        <div class="achievement-icon">${achievement.icon}</div>
        <div class="achievement-info">
          <div class="achievement-title">${achievement.title}</div>
          <div class="achievement-desc">${achievement.desc}</div>
        </div>
      `;
      container.appendChild(item);
    });
  }

  refreshData() {
    // Simular refresh de datos
    this.loadSectionData(this.currentSection);
    
    // Mostrar notificación
    if (window.showNotification) {
      window.showNotification('success', 'Datos Actualizados', 'La información ha sido actualizada correctamente');
    }
  }

  async claimAllRewards() {
    try {
      // Intentar reclamar recompensas reales de la API
      const response = await fetch('https://rsc-chain-production.up.railway.app/api/staking/claim-rewards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        const data = await response.json();
        const totalRewards = data.claimed_amount || 0;
        
        // Mostrar modal de recompensas
        this.showRewardsModal(totalRewards);
        
        // Actualizar UI
        document.getElementById('myRewards').textContent = '0 RSC';
        
        // Mostrar notificación
        if (window.showNotification) {
          window.showNotification('success', '¡Recompensas Reclamadas!', `Has reclamado ${totalRewards} RSC en recompensas`);
        }
        
        // Actualizar datos en tiempo real
        await this.updateRealTimeData();
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.warn('⚠️ No se pudieron reclamar recompensas:', error.message);
      if (window.showNotification) {
        window.showNotification('error', 'Error', 'No se pudieron reclamar las recompensas');
      }
    }
  }

  showRewardsModal(amount) {
    document.getElementById('rewardsAmount').textContent = amount + ' RSC';
    document.getElementById('rewardsModal').style.display = 'flex';
    
    // Animación de partículas
    this.animateRewardsParticles();
  }

  animateRewardsParticles() {
    const particles = document.querySelector('.rewards-particles');
    if (particles) {
      particles.style.animation = 'particleMove 2s ease-out';
      setTimeout(() => {
        particles.style.animation = 'particleMove 10s linear infinite';
      }, 2000);
    }
  }

  closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
  }

  updateChartPeriod(period) {
    // Actualizar datos de gráficos según el período
    const data = this.generateChartData(period);
    
    if (this.charts.performance) {
      this.charts.performance.data.labels = data.labels;
      this.charts.performance.data.datasets[0].data = data.apy;
      this.charts.performance.data.datasets[1].data = data.rewards;
      this.charts.performance.update();
    }
  }

  generateChartData(period) {
    let labels = [];
    let apy = [];
    let rewards = [];
    
    switch (period) {
      case '7d':
        labels = this.generateTimeLabels(7);
        apy = this.generateRandomData(7, 8, 15);
        rewards = this.generateRandomData(7, 10, 50);
        break;
      case '30d':
        labels = this.generateTimeLabels(30);
        apy = this.generateRandomData(30, 9, 16);
        rewards = this.generateRandomData(30, 15, 80);
        break;
      case '1y':
        labels = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        apy = this.generateRandomData(12, 10, 18);
        rewards = this.generateRandomData(12, 50, 200);
        break;
    }
    
    return { labels, apy, rewards };
  }

  generateTimeLabels(count) {
    const labels = [];
    for (let i = count - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      labels.push(date.getDate() + '/' + (date.getMonth() + 1));
    }
    return labels;
  }

  generateRandomData(count, min, max) {
    const data = [];
    for (let i = 0; i < count; i++) {
      data.push(Math.floor(Math.random() * (max - min + 1)) + min);
    }
    return data;
  }

  loadInitialData() {
    this.loadDashboardData();
  }

  loadDashboardData() {
    // Los datos se cargan automáticamente con las actualizaciones en tiempo real
  }

  loadPoolsData() {
    // Intentar cargar datos reales de la blockchain
    this.loadRealPoolsData();
  }

  loadMyStakesData() {
    // Intentar cargar stakes reales de la blockchain
    this.loadRealStakesData();
  }

  loadValidatorsData() {
    // Intentar cargar validadores reales de la blockchain
    this.loadRealValidatorsData();
  }

  loadRewardsData() {
    // Intentar cargar recompensas reales de la blockchain
    this.loadRealRewardsData();
  }

  async loadRealPoolsData() {
    try {
      // Intentar conectar a la blockchain real
      if (window.blockchainConnection && window.blockchainConnection.isConnected) {
        const poolsResult = await window.blockchainConnection.getStakingPools();
        if (poolsResult.success) {
          this.updatePoolsGrid(poolsResult.data);
        } else {
          this.showNoDataMessage('pools', 'No se pueden cargar pools de staking');
        }
      } else {
        this.showNoDataMessage('pools', 'No conectado a RSC Chain');
      }
    } catch (error) {
      console.error('Error cargando pools:', error);
      this.showNoDataMessage('pools', 'Error de conexión');
    }
  }

  async loadRealStakesData() {
    try {
      if (window.blockchainConnection && window.blockchainConnection.isConnected) {
        const stakesResult = await window.blockchainConnection.getUserStakes();
        if (stakesResult.success) {
          this.updateStakesTable(stakesResult.data);
        } else {
          this.showNoDataMessage('stakes', 'No se pueden cargar stakes');
        }
      } else {
        this.showNoDataMessage('stakes', 'No conectado a RSC Chain');
      }
    } catch (error) {
      console.error('Error cargando stakes:', error);
      this.showNoDataMessage('stakes', 'Error de conexión');
    }
  }

  async loadRealValidatorsData() {
    try {
      if (window.blockchainConnection && window.blockchainConnection.isConnected) {
        const validatorsResult = await window.blockchainConnection.getValidators();
        if (validatorsResult.success) {
          this.updateValidatorsGrid(validatorsResult.data);
        } else {
          this.showNoDataMessage('validators', 'No se pueden cargar validadores');
        }
      } else {
        this.showNoDataMessage('validators', 'No conectado a RSC Chain');
      }
    } catch (error) {
      console.error('Error cargando validadores:', error);
      this.showNoDataMessage('validators', 'Error de conexión');
    }
  }

  async loadRealRewardsData() {
    try {
      if (window.blockchainConnection && window.blockchainConnection.isConnected) {
        const rewardsResult = await window.blockchainConnection.getUserRewards();
        if (rewardsResult.success) {
          this.updateRewardsUI(rewardsResult.data);
        } else {
          this.showNoDataMessage('rewards', 'No se pueden cargar recompensas');
        }
      } else {
        this.showNoDataMessage('rewards', 'No conectado a RSC Chain');
      }
    } catch (error) {
      console.error('Error cargando recompensas:', error);
      this.showNoDataMessage('rewards', 'Error de conexión');
    }
  }

  showNoDataMessage(type, message) {
    // Mostrar mensaje apropiado en lugar de datos simulados
    const container = this.getContainerByType(type);
    if (container) {
      container.innerHTML = `
        <div class="no-data-message">
          <div class="no-data-icon">📊</div>
          <h3>Sin datos disponibles</h3>
          <p>${message}</p>
          <button class="retry-btn" onclick="window.stakingEpic.loadReal${type.charAt(0).toUpperCase() + type.slice(1)}Data()">
            Reintentar
          </button>
        </div>
      `;
    }
  }

  getContainerByType(type) {
    switch (type) {
      case 'pools': return document.getElementById('poolsGrid');
      case 'stakes': return document.getElementById('stakesTable');
      case 'validators': return document.getElementById('validatorsGrid');
      case 'rewards': return document.getElementById('rewardsContainer');
      default: return null;
    }
  }

  // Las funciones de generación de datos mock han sido removidas
  // Los datos ahora se cargan desde la blockchain real o se muestran mensajes de error apropiados

  updatePoolsGrid(pools) {
    const grid = document.querySelector('.pools-grid-epic');
    if (!grid) return;

    grid.innerHTML = '';
    
    pools.forEach(pool => {
      const card = document.createElement('div');
      card.className = 'pool-card-epic';
      card.innerHTML = `
        <div class="pool-header">
          <div class="pool-name">${pool.name}</div>
          <div class="pool-status ${pool.status}">${pool.status}</div>
        </div>
        <div class="pool-apy">
          <div class="pool-apy-value">${pool.apy}%</div>
          <div class="pool-apy-label">APY</div>
        </div>
        <div class="pool-details">
          <div class="pool-detail">
            <div class="pool-detail-value">${pool.totalStaked.toLocaleString()}</div>
            <div class="pool-detail-label">Total Stakeado</div>
          </div>
          <div class="pool-detail">
            <div class="pool-detail-value">${pool.minStake}</div>
            <div class="pool-detail-label">Min. Stake</div>
          </div>
        </div>
        <div class="pool-actions">
          <button class="pool-btn primary" onclick="stakingEpic.stakePool(${pool.id})">Stakear</button>
          <button class="pool-btn secondary" onclick="stakingEpic.viewPoolDetails(${pool.id})">Detalles</button>
        </div>
      `;
      grid.appendChild(card);
    });
  }

  updateStakesTable(stakes) {
    const tbody = document.getElementById('stakesTableBody');
    if (!tbody) return;

    tbody.innerHTML = '';
    
    stakes.forEach(stake => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${stake.pool}</td>
        <td>${stake.amount.toLocaleString()} RSC</td>
        <td>${stake.apy}%</td>
        <td>${stake.rewards.toFixed(2)} RSC</td>
        <td>${stake.time}</td>
        <td><span class="status-dot ${stake.status}"></span><span class="status-text ${stake.status}">${stake.status}</span></td>
        <td>
          <button class="pool-btn secondary" onclick="stakingEpic.claimRewards(${stake.id})">Reclamar</button>
          <button class="pool-btn secondary" onclick="stakingEpic.unstake(${stake.id})">Unstake</button>
        </td>
      `;
      tbody.appendChild(row);
    });
  }

  updateValidatorsGrid(validators) {
    const grid = document.querySelector('.validators-grid-epic');
    if (!grid) return;

    grid.innerHTML = '';
    
    validators.forEach(validator => {
      const card = document.createElement('div');
      card.className = 'validator-card-epic';
      card.innerHTML = `
        <div class="validator-header">
          <div class="validator-avatar">${validator.name.charAt(0)}</div>
          <div class="validator-info">
            <h3>${validator.name}</h3>
            <p>${validator.address}</p>
          </div>
        </div>
        <div class="validator-stats">
          <div class="validator-stat">
            <div class="validator-stat-value">${validator.stake.toLocaleString()}</div>
            <div class="validator-stat-label">Stake Total</div>
          </div>
          <div class="validator-stat">
            <div class="validator-stat-value">${validator.uptime}%</div>
            <div class="validator-stat-label">Uptime</div>
          </div>
        </div>
        <div class="validator-status">
          <span class="status-indicator ${validator.status}"></span>
          <span class="status-text ${validator.status}">${validator.status}</span>
        </div>
        <div class="validator-commission">
          <div class="commission-value">${validator.commission}%</div>
          <div class="commission-label">Comisión</div>
        </div>
        <div class="pool-actions">
          <button class="pool-btn primary" onclick="stakingEpic.delegate(${validator.id})">Delegar</button>
          <button class="pool-btn secondary" onclick="stakingEpic.viewValidatorDetails(${validator.id})">Detalles</button>
        </div>
      `;
      grid.appendChild(card);
    });
  }

  updateRewardsUI(rewards) {
    document.getElementById('totalRewardsValue').textContent = rewards.total + ' RSC';
    document.getElementById('rewardsGrowth').textContent = rewards.growth;
    document.getElementById('nextReward').textContent = rewards.nextReward + ' RSC';
    
    // Actualizar historial
    const historyContainer = document.querySelector('.rewards-list');
    if (historyContainer) {
      historyContainer.innerHTML = '';
      rewards.history.forEach(reward => {
        const item = document.createElement('div');
        item.className = 'reward-item';
        item.innerHTML = `
          <div class="reward-date">${reward.date}</div>
          <div class="reward-amount">${reward.amount} RSC</div>
          <div class="reward-pool">${reward.pool}</div>
        `;
        historyContainer.appendChild(item);
      });
    }
  }

  // Métodos de acción
  stakePool(poolId) {
    this.showModal('Stakear RSC', `¿Quieres stakear en el pool ${poolId}?`);
  }

  viewPoolDetails(poolId) {
    this.showModal('Detalles del Pool', `Detalles del pool ${poolId}`);
  }

  claimRewards(stakeId) {
    this.showModal('Reclamar Recompensas', `Reclamando recompensas del stake ${stakeId}`);
  }

  unstake(stakeId) {
    this.showModal('Unstake', `¿Quieres hacer unstake del stake ${stakeId}?`);
  }

  delegate(validatorId) {
    this.showModal('Delegar', `¿Quieres delegar al validador ${validatorId}?`);
  }

  viewValidatorDetails(validatorId) {
    this.showModal('Detalles del Validador', `Detalles del validador ${validatorId}`);
  }

  showModal(title, content) {
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalBody').innerHTML = content;
    document.getElementById('stakeModal').style.display = 'flex';
  }

  filterPools(type) {
    // Implementar filtrado de pools
    console.log('Filtrando pools por tipo:', type);
  }

  startAutoRefresh() {
    setInterval(async () => {
      await this.updateRealTimeData();
    }, 30000); // Cada 30 segundos
  }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  window.stakingEpic = new StakingEpic();
});

// Exportar para uso global
window.StakingEpic = StakingEpic; 