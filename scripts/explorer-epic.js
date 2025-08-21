// ===== EXPLORER-EPIC.JS - EXPLORER ÉPICO AVANZADO =====

class ExplorerEpic {
  constructor() {
    this.isInitialized = false;
    this.currentSection = 'dashboard';
    this.charts = {};
    this.websocket = null;
    this.autoRefresh = false;
    this.blockchain3d = null;
    
    this.init();
  }

  init() {
    if (this.isInitialized) return;
    
    this.setupEventListeners();
    this.initializeCharts();
    this.initialize3DVisualization();
    this.loadInitialData();
    this.setupWebSocket();
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

    // Búsqueda
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    
    searchInput.addEventListener('input', (e) => {
      this.handleSearchInput(e.target.value);
    });
    
    searchBtn.addEventListener('click', () => {
      this.performSearch();
    });

    // Ejemplos de búsqueda
    document.querySelectorAll('.example-tag').forEach(tag => {
      tag.addEventListener('click', () => {
        const example = tag.dataset.example;
        searchInput.value = example;
        this.performSearch();
      });
    });

    // Botones de control
    document.getElementById('refreshBtn').addEventListener('click', () => {
      this.refreshData();
    });

    document.getElementById('autoRefreshBtn').addEventListener('click', () => {
      this.toggleAutoRefresh();
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

    // Cerrar modal
    document.getElementById('modalClose').addEventListener('click', () => {
      this.closeModal();
    });

    // Click fuera del modal para cerrar
    document.getElementById('detailsModal').addEventListener('click', (e) => {
      if (e.target.id === 'detailsModal') {
        this.closeModal();
      }
    });
  }

  showSection(sectionName) {
    // Ocultar todas las secciones
    document.querySelectorAll('.explorer-section').forEach(section => {
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
      case 'blocks':
        this.loadBlocksData();
        break;
      case 'transactions':
        this.loadTransactionsData();
        break;
      case 'addresses':
        this.loadAddressesData();
        break;
      case 'network':
        this.loadNetworkData();
        break;
      case 'analytics':
        this.loadAnalyticsData();
        break;
    }
  }

  initializeCharts() {
    // Gráfico de actividad de red
    const networkCtx = document.getElementById('networkActivityChart');
    if (networkCtx) {
      this.charts.networkActivity = new Chart(networkCtx, {
        type: 'line',
        data: {
          labels: this.generateTimeLabels(24),
          datasets: [{
            label: 'Transacciones',
            data: this.generateRandomData(24, 100, 1000),
            borderColor: '#7657fc',
            backgroundColor: 'rgba(118, 87, 252, 0.1)',
            tension: 0.4,
            fill: true
          }, {
            label: 'Bloques',
            data: this.generateRandomData(24, 10, 100),
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

    // Gráfico de tipos de transacciones
    const typesCtx = document.getElementById('transactionTypesChart');
    if (typesCtx) {
      this.charts.transactionTypes = new Chart(typesCtx, {
        type: 'doughnut',
        data: {
          labels: ['Transferencias', 'Contratos', 'Staking', 'Otros'],
          datasets: [{
            data: [45, 25, 20, 10],
            backgroundColor: [
              '#10b981',
              '#f59e0b',
              '#6366f1',
              '#ef4444'
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
    // Gráfico de volumen
    const volumeCtx = document.getElementById('volumeChart');
    if (volumeCtx) {
      this.charts.volume = new Chart(volumeCtx, {
        type: 'bar',
        data: {
          labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
          datasets: [{
            label: 'Volumen (M RSC)',
            data: [120, 180, 250, 320, 280, 450],
            backgroundColor: 'rgba(118, 87, 252, 0.8)',
            borderColor: '#7657fc',
            borderWidth: 2
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

    // Gráfico de direcciones
    const addressesCtx = document.getElementById('addressesChart');
    if (addressesCtx) {
      this.charts.addresses = new Chart(addressesCtx, {
        type: 'pie',
        data: {
          labels: ['Activas', 'Inactivas', 'Contratos'],
          datasets: [{
            data: [65, 25, 10],
            backgroundColor: [
              '#10b981',
              '#f59e0b',
              '#6366f1'
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
                color: '#e4e9ff'
              }
            }
          }
        }
      });
    }

    // Gráfico de mineros
    const minersCtx = document.getElementById('minersChart');
    if (minersCtx) {
      this.charts.miners = new Chart(minersCtx, {
        type: 'line',
        data: {
          labels: this.generateTimeLabels(7),
          datasets: [{
            label: 'Hashrate (TH/s)',
            data: this.generateRandomData(7, 50, 200),
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

    // Gráfico de estadísticas de red
    const networkStatsCtx = document.getElementById('networkStatsChart');
    if (networkStatsCtx) {
      this.charts.networkStats = new Chart(networkStatsCtx, {
        type: 'radar',
        data: {
          labels: ['TPS', 'Nodos', 'Uptime', 'Seguridad', 'Velocidad'],
          datasets: [{
            label: 'Rendimiento',
            data: [95, 85, 99, 90, 88],
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
  }

  initialize3DVisualization() {
    const container = document.getElementById('blockchain3d');
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

    this.blockchain3d = { scene, camera, renderer };
  }

  create3DElements(scene) {
    // Crear bloques
    for (let i = 0; i < 20; i++) {
      const geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
      const material = new THREE.MeshPhongMaterial({
        color: 0x7657fc,
        transparent: true,
        opacity: 0.8
      });
      const cube = new THREE.Mesh(geometry, material);
      
      cube.position.x = (Math.random() - 0.5) * 10;
      cube.position.y = (Math.random() - 0.5) * 10;
      cube.position.z = (Math.random() - 0.5) * 10;
      
      scene.add(cube);
    }

    // Crear conexiones
    for (let i = 0; i < 30; i++) {
      const geometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(Math.random() * 10 - 5, Math.random() * 10 - 5, Math.random() * 10 - 5),
        new THREE.Vector3(Math.random() * 10 - 5, Math.random() * 10 - 5, Math.random() * 10 - 5)
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
    if (!this.blockchain3d) return;

    const { scene } = this.blockchain3d;
    
    // Limpiar escena
    while(scene.children.length > 0) {
      scene.remove(scene.children[0]);
    }

    // Recrear elementos según la vista
    switch (view) {
      case 'network':
        this.createNetworkView(scene);
        break;
      case 'blocks':
        this.createBlocksView(scene);
        break;
      case 'transactions':
        this.createTransactionsView(scene);
        break;
    }
  }

  createNetworkView(scene) {
    // Crear nodos de red
    for (let i = 0; i < 15; i++) {
      const geometry = new THREE.SphereGeometry(0.3, 16, 16);
      const material = new THREE.MeshPhongMaterial({
        color: 0x3fd8c2,
        transparent: true,
        opacity: 0.8
      });
      const sphere = new THREE.Mesh(geometry, material);
      
      sphere.position.x = (Math.random() - 0.5) * 8;
      sphere.position.y = (Math.random() - 0.5) * 8;
      sphere.position.z = (Math.random() - 0.5) * 8;
      
      scene.add(sphere);
    }

    // Añadir luces
    const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0x3fd8c2, 1);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);
  }

  createBlocksView(scene) {
    // Crear bloques en cadena
    for (let i = 0; i < 10; i++) {
      const geometry = new THREE.BoxGeometry(0.8, 0.8, 0.8);
      const material = new THREE.MeshPhongMaterial({
        color: 0x7657fc,
        transparent: true,
        opacity: 0.8
      });
      const cube = new THREE.Mesh(geometry, material);
      
      cube.position.x = i * 1.2 - 5;
      cube.position.y = 0;
      cube.position.z = 0;
      
      scene.add(cube);
    }

    // Añadir luces
    const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0x7657fc, 1);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);
  }

  createTransactionsView(scene) {
    // Crear transacciones como partículas
    for (let i = 0; i < 50; i++) {
      const geometry = new THREE.SphereGeometry(0.1, 8, 8);
      const material = new THREE.MeshPhongMaterial({
        color: 0xe0c64a,
        transparent: true,
        opacity: 0.6
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

    const directionalLight = new THREE.DirectionalLight(0xe0c64a, 1);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);
  }

  setupWebSocket() {
    // Simular WebSocket para datos en tiempo real
    setInterval(() => {
      this.updateRealTimeData();
    }, 5000);
  }

  updateRealTimeData() {
    // Actualizar estadísticas en tiempo real
    const stats = {
      totalBlocks: Math.floor(Math.random() * 1000000) + 1234567,
      avgTPS: (Math.random() * 20 + 10).toFixed(1),
      activeNodes: Math.floor(Math.random() * 100) + 1200,
      rscPrice: (Math.random() * 2 + 4).toFixed(2),
      currentTPS: Math.floor(Math.random() * 500) + 500
    };

    // Actualizar UI
    document.getElementById('totalBlocks').textContent = stats.totalBlocks.toLocaleString();
    document.getElementById('avgTPS').textContent = stats.avgTPS + 'K';
    document.getElementById('activeNodes').textContent = stats.activeNodes.toLocaleString();
    document.getElementById('rscPrice').textContent = '$' + stats.rscPrice;
    document.getElementById('currentTPS').textContent = stats.currentTPS;

    // Actualizar overlay
    document.getElementById('overlayBlocks').textContent = stats.totalBlocks.toLocaleString();
    document.getElementById('overlayTXs').textContent = Math.floor(stats.currentTPS * 0.1).toLocaleString();
    document.getElementById('overlayNodes').textContent = stats.activeNodes.toLocaleString();
  }

  handleSearchInput(value) {
    if (value.length < 3) {
      document.getElementById('searchSuggestions').style.display = 'none';
      return;
    }

    // Simular sugerencias de búsqueda
    const suggestions = this.generateSearchSuggestions(value);
    this.showSearchSuggestions(suggestions);
  }

  generateSearchSuggestions(query) {
    const suggestions = [
      `Bloque #${Math.floor(Math.random() * 1000000)}`,
      `TX: 0x${Math.random().toString(16).substr(2, 8)}...`,
      `Dirección: RSC1${Math.random().toString(36).substr(2, 8)}...`
    ];

    return suggestions.filter(s => s.toLowerCase().includes(query.toLowerCase()));
  }

  showSearchSuggestions(suggestions) {
    const container = document.getElementById('searchSuggestions');
    container.innerHTML = '';

    suggestions.forEach(suggestion => {
      const div = document.createElement('div');
      div.className = 'search-suggestion';
      div.textContent = suggestion;
      div.addEventListener('click', () => {
        document.getElementById('searchInput').value = suggestion;
        container.style.display = 'none';
        this.performSearch();
      });
      container.appendChild(div);
    });

    container.style.display = suggestions.length > 0 ? 'block' : 'none';
  }

  performSearch() {
    const query = document.getElementById('searchInput').value.trim();
    if (!query) return;

    // Simular búsqueda
    this.showSearchResults(query);
  }

  showSearchResults(query) {
    // Simular resultados de búsqueda
    const results = this.generateSearchResults(query);
    
    // Mostrar en modal
    this.showModal('Resultados de Búsqueda', this.formatSearchResults(results));
  }

  generateSearchResults(query) {
    return [
      {
        type: 'block',
        id: Math.floor(Math.random() * 1000000),
        hash: '0x' + Math.random().toString(16).substr(2, 64),
        timestamp: new Date().toISOString(),
        transactions: Math.floor(Math.random() * 100) + 10
      },
      {
        type: 'transaction',
        hash: '0x' + Math.random().toString(16).substr(2, 64),
        from: 'RSC1' + Math.random().toString(36).substr(2, 20),
        to: 'RSC1' + Math.random().toString(36).substr(2, 20),
        amount: (Math.random() * 1000).toFixed(2),
        timestamp: new Date().toISOString()
      }
    ];
  }

  formatSearchResults(results) {
    let html = '<div class="search-results">';
    
    results.forEach(result => {
      if (result.type === 'block') {
        html += `
          <div class="result-item">
            <h4>Bloque #${result.id}</h4>
            <p><strong>Hash:</strong> ${result.hash}</p>
            <p><strong>Transacciones:</strong> ${result.transactions}</p>
            <p><strong>Timestamp:</strong> ${new Date(result.timestamp).toLocaleString()}</p>
          </div>
        `;
      } else if (result.type === 'transaction') {
        html += `
          <div class="result-item">
            <h4>Transacción</h4>
            <p><strong>Hash:</strong> ${result.hash}</p>
            <p><strong>De:</strong> ${result.from}</p>
            <p><strong>Para:</strong> ${result.to}</p>
            <p><strong>Cantidad:</strong> ${result.amount} RSC</p>
            <p><strong>Timestamp:</strong> ${new Date(result.timestamp).toLocaleString()}</p>
          </div>
        `;
      }
    });
    
    html += '</div>';
    return html;
  }

  showModal(title, content) {
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalBody').innerHTML = content;
    document.getElementById('detailsModal').style.display = 'flex';
  }

  closeModal() {
    document.getElementById('detailsModal').style.display = 'none';
  }

  refreshData() {
    // Simular refresh de datos
    this.loadSectionData(this.currentSection);
    
    // Mostrar notificación
    if (window.showNotification) {
      window.showNotification('success', 'Datos Actualizados', 'La información ha sido actualizada correctamente');
    }
  }

  toggleAutoRefresh() {
    this.autoRefresh = !this.autoRefresh;
    const btn = document.getElementById('autoRefreshBtn');
    
    if (this.autoRefresh) {
      btn.innerHTML = '<span class="btn-icon">⏸️</span><span>Auto-refresh ON</span>';
      btn.style.background = 'rgba(16, 185, 129, 0.2)';
      btn.style.borderColor = '#10b981';
      btn.style.color = '#10b981';
    } else {
      btn.innerHTML = '<span class="btn-icon">🔄</span><span>Auto-refresh</span>';
      btn.style.background = 'rgba(118, 87, 252, 0.1)';
      btn.style.borderColor = 'rgba(118, 87, 252, 0.3)';
      btn.style.color = '#7657fc';
    }
  }

  startAutoRefresh() {
    setInterval(() => {
      if (this.autoRefresh) {
        this.refreshData();
      }
    }, 30000); // Cada 30 segundos
  }

  updateChartPeriod(period) {
    // Actualizar datos de gráficos según el período
    const data = this.generateChartData(period);
    
    if (this.charts.networkActivity) {
      this.charts.networkActivity.data.labels = data.labels;
      this.charts.networkActivity.data.datasets[0].data = data.transactions;
      this.charts.networkActivity.data.datasets[1].data = data.blocks;
      this.charts.networkActivity.update();
    }
  }

  generateChartData(period) {
    let labels = [];
    let transactions = [];
    let blocks = [];
    
    switch (period) {
      case '24h':
        labels = this.generateTimeLabels(24);
        transactions = this.generateRandomData(24, 100, 1000);
        blocks = this.generateRandomData(24, 10, 100);
        break;
      case '7d':
        labels = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
        transactions = this.generateRandomData(7, 500, 2000);
        blocks = this.generateRandomData(7, 50, 200);
        break;
      case '30d':
        labels = this.generateTimeLabels(30);
        transactions = this.generateRandomData(30, 200, 1500);
        blocks = this.generateRandomData(30, 20, 150);
        break;
    }
    
    return { labels, transactions, blocks };
  }

  generateTimeLabels(count) {
    const labels = [];
    for (let i = count - 1; i >= 0; i--) {
      const date = new Date();
      date.setHours(date.getHours() - i);
      labels.push(date.getHours() + ':00');
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

  loadBlocksData() {
    // Intentar cargar bloques reales de la blockchain
    this.loadRealBlocksData();
  }

  loadTransactionsData() {
    // Intentar cargar transacciones reales de la blockchain
    this.loadRealTransactionsData();
  }

  loadAddressesData() {
    // Intentar cargar direcciones reales de la blockchain
    this.loadRealAddressesData();
  }

  async loadRealBlocksData() {
    try {
      if (window.blockchainConnection && window.blockchainConnection.isConnected) {
        const blocksResult = await window.blockchainConnection.getRecentBlocks();
        if (blocksResult.success) {
          this.updateBlocksTable(blocksResult.data);
        } else {
          this.showNoDataMessage('blocks', 'No se pueden cargar bloques');
        }
      } else {
        this.showNoDataMessage('blocks', 'No conectado a RSC Chain');
      }
    } catch (error) {
      console.error('Error cargando bloques:', error);
      this.showNoDataMessage('blocks', 'Error de conexión');
    }
  }

  async loadRealTransactionsData() {
    try {
      if (window.blockchainConnection && window.blockchainConnection.isConnected) {
        const transactionsResult = await window.blockchainConnection.getRecentTransactions();
        if (transactionsResult.success) {
          this.updateTransactionsTable(transactionsResult.data);
        } else {
          this.showNoDataMessage('transactions', 'No se pueden cargar transacciones');
        }
      } else {
        this.showNoDataMessage('transactions', 'No conectado a RSC Chain');
      }
    } catch (error) {
      console.error('Error cargando transacciones:', error);
      this.showNoDataMessage('transactions', 'Error de conexión');
    }
  }

  async loadRealAddressesData() {
    try {
      if (window.blockchainConnection && window.blockchainConnection.isConnected) {
        const addressesResult = await window.blockchainConnection.getTopAddresses();
        if (addressesResult.success) {
          this.updateAddressesGrid(addressesResult.data);
        } else {
          this.showNoDataMessage('addresses', 'No se pueden cargar direcciones');
        }
      } else {
        this.showNoDataMessage('addresses', 'No conectado a RSC Chain');
      }
    } catch (error) {
      console.error('Error cargando direcciones:', error);
      this.showNoDataMessage('addresses', 'Error de conexión');
    }
  }

  showNoDataMessage(type, message) {
    const container = this.getContainerByType(type);
    if (container) {
      container.innerHTML = `
        <div class="no-data-message">
          <div class="no-data-icon">🔍</div>
          <h3>Sin datos disponibles</h3>
          <p>${message}</p>
          <button class="retry-btn" onclick="window.explorerEpic.loadReal${type.charAt(0).toUpperCase() + type.slice(1)}Data()">
            Reintentar
          </button>
        </div>
      `;
    }
  }

  getContainerByType(type) {
    switch (type) {
      case 'blocks': return document.getElementById('blocksTableBody');
      case 'transactions': return document.getElementById('transactionsTableBody');
      case 'addresses': return document.querySelector('.addresses-grid');
      default: return null;
    }
  }

  loadNetworkData() {
    // Los datos de red se actualizan en tiempo real
  }

  loadAnalyticsData() {
    // Los gráficos de analytics ya están inicializados
  }

  generateMockBlocks() {
    return [];
  }

  generateMockTransactions() {
    return [];
  }

  generateMockAddresses() {
    return [];
  }

  updateBlocksTable(blocks) {
    const tbody = document.getElementById('blocksTableBody');
    if (!tbody) return;

    tbody.innerHTML = '';
    
    blocks.forEach(block => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td class="block-number">#${block.number}</td>
        <td class="block-hash">${block.hash}</td>
        <td>${block.miner}</td>
        <td class="block-transactions">${block.transactions}</td>
        <td class="block-size">${block.size} bytes</td>
        <td class="block-time">${new Date(block.timestamp).toLocaleString()}</td>
        <td><span class="status-dot ${block.status}"></span><span class="status-text ${block.status}">${block.status}</span></td>
      `;
      tbody.appendChild(row);
    });
  }

  updateTransactionsTable(transactions) {
    const tbody = document.getElementById('transactionsTableBody');
    if (!tbody) return;

    tbody.innerHTML = '';
    
    transactions.forEach(tx => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td class="tx-hash">${tx.hash}</td>
        <td><span class="tx-type ${tx.type}">${tx.type}</span></td>
        <td>${tx.from}</td>
        <td>${tx.to}</td>
        <td class="tx-amount">${tx.amount} RSC</td>
        <td class="tx-fee">${tx.fee} RSC</td>
        <td class="tx-status">
          <span class="status-dot ${tx.status}"></span>
          <span class="status-text ${tx.status}">${tx.status}</span>
        </td>
        <td>${new Date(tx.timestamp).toLocaleString()}</td>
      `;
      tbody.appendChild(row);
    });
  }

  updateAddressesGrid(addresses) {
    const grid = document.querySelector('.addresses-grid');
    if (!grid) return;

    grid.innerHTML = '';
    
    addresses.forEach(address => {
      const card = document.createElement('div');
      card.className = 'address-card-epic';
      card.innerHTML = `
        <div class="address-header">
          <div class="address-hash">${address.address}</div>
          <div class="address-balance">${address.balance} RSC</div>
        </div>
        <div class="address-stats">
          <div class="address-stat">
            <div class="stat-value">${address.transactions}</div>
            <div class="stat-label">Transacciones</div>
          </div>
          <div class="address-stat">
            <div class="stat-value">${new Date(address.lastActivity).toLocaleDateString()}</div>
            <div class="stat-label">Última Actividad</div>
          </div>
        </div>
      `;
      grid.appendChild(card);
    });
  }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  new ExplorerEpic();
});

// Exportar para uso global
window.ExplorerEpic = ExplorerEpic; 