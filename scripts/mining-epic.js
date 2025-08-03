// Mining Épico - JavaScript Avanzado

class MiningEpic {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.animationId = null;
        this.charts = {};
        this.currentSection = 'mining';
        this.websocket = null;
        this.isConnected = false;
        this.isMining = false;
        this.miningInterval = null;
        this.hashRate = 0;
        this.minedRSC = 0;
        this.activeTime = 0;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initCharts();
        this.init3DVisualization();
        this.simulateWebSocket();
        this.loadMockData();
        this.startRealTimeUpdates();
    }

    setupEventListeners() {
        // Navegación
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const section = item.getAttribute('data-section');
                this.switchSection(section);
            });
        });

        // Controles de visualización 3D
        document.querySelectorAll('.control-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.control-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.update3DView(btn.getAttribute('data-view'));
            });
        });

        // Controles de gráficos
        document.querySelectorAll('.time-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.time-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.updateChartPeriod(btn.getAttribute('data-period'));
            });
        });

        // Controles de minería
        document.getElementById('startMiningBtn')?.addEventListener('click', () => {
            this.startMining();
        });

        document.getElementById('stopMiningBtn')?.addEventListener('click', () => {
            this.stopMining();
        });

        document.getElementById('claimBtn')?.addEventListener('click', () => {
            this.claimRSC();
        });

        document.getElementById('claimAllBtn')?.addEventListener('click', () => {
            this.claimAllRSC();
        });

        // Intensidad de minería
        const intensitySlider = document.getElementById('miningIntensity');
        if (intensitySlider) {
            intensitySlider.addEventListener('input', (e) => {
                this.updateIntensity(e.target.value);
            });
        }

        // Prioridad de proceso
        document.getElementById('processPriority')?.addEventListener('change', (e) => {
            this.updateProcessPriority(e.target.value);
        });

        // Botones de acción
        document.getElementById('refreshBtn')?.addEventListener('click', () => {
            this.refreshData();
        });

        // Modales
        this.setupModals();
    }

    switchSection(section) {
        // Ocultar todas las secciones
        document.querySelectorAll('.mining-section').forEach(s => {
            s.classList.remove('active');
        });

        // Mostrar la sección seleccionada
        const targetSection = document.getElementById(section);
        if (targetSection) {
            targetSection.classList.add('active');
        }

        // Actualizar navegación
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });

        const activeNav = document.querySelector(`[data-section="${section}"]`);
        if (activeNav) {
            activeNav.classList.add('active');
        }

        this.currentSection = section;
        this.updateSectionData(section);
    }

    updateSectionData(section) {
        switch (section) {
            case 'mining':
                this.loadMiningData();
                break;
            case 'progress':
                this.loadProgressData();
                break;
            case 'claim':
                this.loadClaimData();
                break;
            case 'ranking':
                this.loadRankingData();
                break;
            case 'levels':
                this.loadLevelsData();
                break;
            case 'analytics':
                this.loadAnalyticsData();
                break;
        }
    }

    initCharts() {
        // Gráfico de Hash Rate
        const hashRateCtx = document.getElementById('hashRateChart');
        if (hashRateCtx) {
            this.charts.hashRate = new Chart(hashRateCtx, {
                type: 'line',
                data: {
                    labels: this.generateTimeLabels(20),
                    datasets: [{
                        label: 'Hash Rate',
                        data: this.generateHashRateData(20),
                        borderColor: '#f59e0b',
                        backgroundColor: 'rgba(245, 158, 11, 0.1)',
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        }
                    },
                    scales: {
                        x: {
                            grid: {
                                color: 'rgba(255, 255, 255, 0.1)'
                            },
                            ticks: {
                                color: 'rgba(255, 255, 255, 0.7)'
                            }
                        },
                        y: {
                            grid: {
                                color: 'rgba(255, 255, 255, 0.1)'
                            },
                            ticks: {
                                color: 'rgba(255, 255, 255, 0.7)'
                            }
                        }
                    }
                }
            });
        }

        // Gráfico de Tiempo
        const timeGraphCtx = document.getElementById('timeGraph');
        if (timeGraphCtx) {
            this.charts.timeGraph = new Chart(timeGraphCtx, {
                type: 'line',
                data: {
                    labels: this.generateTimeLabels(10),
                    datasets: [{
                        label: 'Tiempo Activo',
                        data: this.generateTimeData(10),
                        borderColor: '#10b981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        borderWidth: 2,
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        }
                    },
                    scales: {
                        x: {
                            grid: {
                                color: 'rgba(255, 255, 255, 0.1)'
                            },
                            ticks: {
                                color: 'rgba(255, 255, 255, 0.7)'
                            }
                        },
                        y: {
                            grid: {
                                color: 'rgba(255, 255, 255, 0.1)'
                            },
                            ticks: {
                                color: 'rgba(255, 255, 255, 0.7)'
                            }
                        }
                    }
                }
            });
        }

        // Gráficos de progreso
        this.initProgressCharts();
    }

    initProgressCharts() {
        // Hash Rate Progress Chart
        const hashRateProgressCtx = document.getElementById('hashRateProgressChart');
        if (hashRateProgressCtx) {
            this.charts.hashRateProgress = new Chart(hashRateProgressCtx, {
                type: 'line',
                data: {
                    labels: this.generateTimeLabels(24),
                    datasets: [{
                        label: 'Hash Rate',
                        data: this.generateHashRateData(24),
                        borderColor: '#f59e0b',
                        backgroundColor: 'rgba(245, 158, 11, 0.1)',
                        borderWidth: 2,
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            labels: {
                                color: 'rgba(255, 255, 255, 0.7)'
                            }
                        }
                    },
                    scales: {
                        x: {
                            grid: {
                                color: 'rgba(255, 255, 255, 0.1)'
                            },
                            ticks: {
                                color: 'rgba(255, 255, 255, 0.7)'
                            }
                        },
                        y: {
                            grid: {
                                color: 'rgba(255, 255, 255, 0.1)'
                            },
                            ticks: {
                                color: 'rgba(255, 255, 255, 0.7)'
                            }
                        }
                    }
                }
            });
        }

        // RSC Accumulated Chart
        const rscAccumulatedCtx = document.getElementById('rscAccumulatedChart');
        if (rscAccumulatedCtx) {
            this.charts.rscAccumulated = new Chart(rscAccumulatedCtx, {
                type: 'line',
                data: {
                    labels: this.generateTimeLabels(24),
                    datasets: [{
                        label: 'RSC Acumulados',
                        data: this.generateRSCData(24),
                        borderColor: '#10b981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        borderWidth: 2,
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            labels: {
                                color: 'rgba(255, 255, 255, 0.7)'
                            }
                        }
                    },
                    scales: {
                        x: {
                            grid: {
                                color: 'rgba(255, 255, 255, 0.1)'
                            },
                            ticks: {
                                color: 'rgba(255, 255, 255, 0.7)'
                            }
                        },
                        y: {
                            grid: {
                                color: 'rgba(255, 255, 255, 0.1)'
                            },
                            ticks: {
                                color: 'rgba(255, 255, 255, 0.7)'
                            }
                        }
                    }
                }
            });
        }

        // Analytics Charts
        this.initAnalyticsCharts();
    }

    initAnalyticsCharts() {
        // Historical Performance Chart
        const historicalPerformanceCtx = document.getElementById('historicalPerformanceChart');
        if (historicalPerformanceCtx) {
            this.charts.historicalPerformance = new Chart(historicalPerformanceCtx, {
                type: 'line',
                data: {
                    labels: this.generateTimeLabels(30),
                    datasets: [{
                        label: 'Rendimiento',
                        data: this.generatePerformanceData(30),
                        borderColor: '#f59e0b',
                        backgroundColor: 'rgba(245, 158, 11, 0.1)',
                        borderWidth: 2,
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            labels: {
                                color: 'rgba(255, 255, 255, 0.7)'
                            }
                        }
                    },
                    scales: {
                        x: {
                            grid: {
                                color: 'rgba(255, 255, 255, 0.1)'
                            },
                            ticks: {
                                color: 'rgba(255, 255, 255, 0.7)'
                            }
                        },
                        y: {
                            grid: {
                                color: 'rgba(255, 255, 255, 0.1)'
                            },
                            ticks: {
                                color: 'rgba(255, 255, 255, 0.7)'
                            }
                        }
                    }
                }
            });
        }

        // Hash Rate Distribution Chart
        const hashRateDistributionCtx = document.getElementById('hashRateDistributionChart');
        if (hashRateDistributionCtx) {
            this.charts.hashRateDistribution = new Chart(hashRateDistributionCtx, {
                type: 'doughnut',
                data: {
                    labels: ['Alto', 'Medio', 'Bajo'],
                    datasets: [{
                        data: [60, 30, 10],
                        backgroundColor: [
                            '#f59e0b',
                            '#10b981',
                            '#6b7280'
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
                                color: 'rgba(255, 255, 255, 0.7)',
                                padding: 20
                            }
                        }
                    }
                }
            });
        }

        // Mining Optimization Chart
        const miningOptimizationCtx = document.getElementById('miningOptimizationChart');
        if (miningOptimizationCtx) {
            this.charts.miningOptimization = new Chart(miningOptimizationCtx, {
                type: 'bar',
                data: {
                    labels: ['CPU', 'GPU', 'RAM', 'Red'],
                    datasets: [{
                        label: 'Optimización',
                        data: [85, 92, 78, 95],
                        backgroundColor: 'rgba(245, 158, 11, 0.8)',
                        borderColor: '#f59e0b',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            labels: {
                                color: 'rgba(255, 255, 255, 0.7)'
                            }
                        }
                    },
                    scales: {
                        x: {
                            grid: {
                                color: 'rgba(255, 255, 255, 0.1)'
                            },
                            ticks: {
                                color: 'rgba(255, 255, 255, 0.7)'
                            }
                        },
                        y: {
                            grid: {
                                color: 'rgba(255, 255, 255, 0.1)'
                            },
                            ticks: {
                                color: 'rgba(255, 255, 255, 0.7)'
                            }
                        }
                    }
                }
            });
        }

        // Mining Predictions Chart
        const miningPredictionsCtx = document.getElementById('miningPredictionsChart');
        if (miningPredictionsCtx) {
            this.charts.miningPredictions = new Chart(miningPredictionsCtx, {
                type: 'line',
                data: {
                    labels: this.generateTimeLabels(7),
                    datasets: [{
                        label: 'Predicción',
                        data: this.generatePredictionData(7),
                        borderColor: '#06b6d4',
                        backgroundColor: 'rgba(6, 182, 212, 0.1)',
                        borderWidth: 2,
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
                                color: 'rgba(255, 255, 255, 0.7)'
                            }
                        }
                    },
                    scales: {
                        x: {
                            grid: {
                                color: 'rgba(255, 255, 255, 0.1)'
                            },
                            ticks: {
                                color: 'rgba(255, 255, 255, 0.7)'
                            }
                        },
                        y: {
                            grid: {
                                color: 'rgba(255, 255, 255, 0.1)'
                            },
                            ticks: {
                                color: 'rgba(255, 255, 255, 0.7)'
                            }
                        }
                    }
                }
            });
        }
    }

    init3DVisualization() {
        const container = document.getElementById('mining3d');
        if (!container) return;

        // Configuración de Three.js
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setSize(container.clientWidth, container.clientHeight);
        this.renderer.setClearColor(0x000000, 0);
        container.appendChild(this.renderer.domElement);

        // Iluminación
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xf59e0b, 1);
        directionalLight.position.set(10, 10, 5);
        this.scene.add(directionalLight);

        // Crear elementos 3D
        this.create3DElements();

        // Posición de la cámara
        this.camera.position.z = 15;

        // Animación
        this.animate();

        // Eventos del mouse
        this.setupMouseEvents();
    }

    create3DElements() {
        // Bloques de minería
        for (let i = 0; i < 30; i++) {
            const geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
            const material = new THREE.MeshPhongMaterial({ 
                color: Math.random() > 0.7 ? 0xf59e0b : 0x10b981 
            });
            const cube = new THREE.Mesh(geometry, material);
            
            cube.position.x = (Math.random() - 0.5) * 20;
            cube.position.y = (Math.random() - 0.5) * 20;
            cube.position.z = (Math.random() - 0.5) * 20;
            
            this.scene.add(cube);
        }

        // Partículas de hash
        const particleCount = 200;
        const particles = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);

        for (let i = 0; i < particleCount; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 30;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 30;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 30;

            colors[i * 3] = Math.random();
            colors[i * 3 + 1] = Math.random();
            colors[i * 3 + 2] = Math.random();
        }

        particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        particles.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const particleMaterial = new THREE.PointsMaterial({
            size: 0.1,
            vertexColors: true,
            transparent: true,
            opacity: 0.8
        });

        const particleSystem = new THREE.Points(particles, particleMaterial);
        this.scene.add(particleSystem);

        // Líneas de conexión
        const lineMaterial = new THREE.LineBasicMaterial({ color: 0xf59e0b, opacity: 0.3, transparent: true });
        
        for (let i = 0; i < 15; i++) {
            const points = [];
            points.push(new THREE.Vector3(
                (Math.random() - 0.5) * 20,
                (Math.random() - 0.5) * 20,
                (Math.random() - 0.5) * 20
            ));
            points.push(new THREE.Vector3(
                (Math.random() - 0.5) * 20,
                (Math.random() - 0.5) * 20,
                (Math.random() - 0.5) * 20
            ));
            
            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            const line = new THREE.Line(geometry, lineMaterial);
            this.scene.add(line);
        }
    }

    animate() {
        this.animationId = requestAnimationFrame(() => this.animate());

        // Rotar la escena
        this.scene.rotation.y += 0.005;
        this.scene.rotation.x += 0.002;

        // Animar partículas
        this.scene.children.forEach(child => {
            if (child.type === 'Points') {
                child.rotation.y += 0.01;
            }
            if (child.type === 'Mesh') {
                child.rotation.x += 0.01;
                child.rotation.y += 0.01;
            }
        });

        this.renderer.render(this.scene, this.camera);
    }

    setupMouseEvents() {
        const container = document.getElementById('mining3d');
        if (!container) return;

        let mouseX = 0;
        let mouseY = 0;

        container.addEventListener('mousemove', (event) => {
            mouseX = (event.clientX / container.clientWidth) * 2 - 1;
            mouseY = -(event.clientY / container.clientHeight) * 2 + 1;

            // Rotar la cámara suavemente
            this.camera.position.x += (mouseX * 2 - this.camera.position.x) * 0.02;
            this.camera.position.y += (mouseY * 2 - this.camera.position.y) * 0.02;
            this.camera.lookAt(this.scene.position);
        });
    }

    update3DView(view) {
        // Cambiar la visualización según el tipo de vista
        switch (view) {
            case 'blocks':
                this.scene.rotation.set(0, 0, 0);
                break;
            case 'mining':
                this.scene.rotation.set(0.5, 0.5, 0);
                break;
            case 'network':
                this.scene.rotation.set(0, 0.5, 0.5);
                break;
        }
    }

    simulateWebSocket() {
        // Simular conexión WebSocket
        this.websocket = {
            send: (data) => {
                console.log('WebSocket send:', data);
            }
        };

        // Simular datos en tiempo real
        setInterval(() => {
            this.updateRealTimeStats();
        }, 3000);
    }

    updateRealTimeStats() {
        // Actualizar estadísticas en tiempo real
        const stats = {
            globalHashRate: `${(Math.random() * 1000 + 500).toFixed(0)} TH/s`,
            totalMinedGlobal: `${(Math.random() * 1000000 + 500000).toFixed(0)} RSC`,
            activeMiners: Math.floor(Math.random() * 5000 + 2000),
            difficulty: Math.floor(Math.random() * 1000 + 500)
        };

        Object.keys(stats).forEach(key => {
            const element = document.getElementById(key);
            if (element) {
                element.textContent = stats[key];
            }
        });

        // Actualizar overlay stats
        const overlayStats = {
            overlayBlocks: Math.floor(Math.random() * 5000 + 2000),
            overlayHashRate: `${(Math.random() * 100 + 50).toFixed(1)}K H/s`,
            overlayMiners: Math.floor(Math.random() * 1000 + 500)
        };

        Object.keys(overlayStats).forEach(key => {
            const element = document.getElementById(key);
            if (element) {
                element.textContent = overlayStats[key];
            }
        });
    }

    loadMockData() {
        // Cargar datos simulados
        this.loadMiningData();
        this.loadProgressData();
        this.loadClaimData();
        this.loadRankingData();
        this.loadLevelsData();
    }

    loadMiningData() {
        // Los datos se actualizan en tiempo real
        this.updateMiningStats();
    }

    loadProgressData() {
        // Cargar datos de progreso
        this.updateProgressStats();
    }

    loadClaimData() {
        // Cargar datos de reclamación
        const claimData = {
            claimableRSC: '0.000000 RSC',
            claimGrowth: '+12.5%',
            nextClaim: '2.5 RSC'
        };

        Object.keys(claimData).forEach(key => {
            const element = document.getElementById(key);
            if (element) {
                element.textContent = claimData[key];
            }
        });
    }

    loadRankingData() {
        // Cargar datos de ranking
        const topMiners = [
            { name: 'MinerPro', hashRate: '45.6K H/s', rscMined: '1,234.56' },
            { name: 'CryptoMiner', hashRate: '42.1K H/s', rscMined: '987.32' },
            { name: 'RSCTrader', hashRate: '38.9K H/s', rscMined: '756.89' }
        ];

        const minersList = document.getElementById('topMinersList');
        if (minersList) {
            minersList.innerHTML = topMiners.map((miner, index) => `
                <div class="miner-item">
                    <div class="miner-rank">#${index + 1}</div>
                    <div class="miner-info">
                        <div class="miner-name">${miner.name}</div>
                        <div class="miner-stats">
                            <span>Hash Rate: ${miner.hashRate}</span>
                            <span>RSC Minados: ${miner.rscMined}</span>
                        </div>
                    </div>
                </div>
            `).join('');
        }
    }

    loadLevelsData() {
        // Cargar datos de niveles
        const levels = [
            { level: 1, name: 'Novato', unlocked: true, benefits: ['+0% Hash Rate', '+0% Recompensas'] },
            { level: 2, name: 'Principiante', unlocked: true, benefits: ['+10% Hash Rate', '+5% Recompensas'] },
            { level: 3, name: 'Intermedio', unlocked: true, benefits: ['+25% Hash Rate', '+15% Recompensas'] },
            { level: 4, name: 'Avanzado', unlocked: false, benefits: ['+50% Hash Rate', '+30% Recompensas'] },
            { level: 5, name: 'Experto', unlocked: false, benefits: ['+100% Hash Rate', '+50% Recompensas'] }
        ];

        const levelsGrid = document.querySelector('.levels-grid');
        if (levelsGrid) {
            levelsGrid.innerHTML = levels.map(level => `
                <div class="level-item ${level.unlocked ? 'unlocked' : 'locked'}">
                    <div class="level-header">
                        <div class="level-number">${level.level}</div>
                        <div class="level-status">${level.unlocked ? 'Desbloqueado' : 'Bloqueado'}</div>
                    </div>
                    <h4>${level.name}</h4>
                    <div class="level-benefits">
                        ${level.benefits.map(benefit => `<span>${benefit}</span>`).join('')}
                    </div>
                </div>
            `).join('');
        }
    }

    loadAnalyticsData() {
        // Los gráficos ya están inicializados
        // Aquí se podrían cargar datos adicionales si es necesario
    }

    startMining() {
        if (this.isMining) return;

        this.isMining = true;
        this.updateMiningStatus('online');
        
        // Habilitar/deshabilitar botones
        document.getElementById('startMiningBtn').disabled = true;
        document.getElementById('stopMiningBtn').disabled = false;

        // Iniciar simulación de minería
        this.miningInterval = setInterval(() => {
            this.hashRate = Math.random() * 1000 + 500;
            this.minedRSC += Math.random() * 0.001;
            this.activeTime += 1;

            this.updateMiningStats();
        }, 1000);

        this.showNotification('Minería iniciada', 'success');
    }

    stopMining() {
        if (!this.isMining) return;

        this.isMining = false;
        this.updateMiningStatus('offline');
        
        // Habilitar/deshabilitar botones
        document.getElementById('startMiningBtn').disabled = false;
        document.getElementById('stopMiningBtn').disabled = true;

        // Detener simulación
        if (this.miningInterval) {
            clearInterval(this.miningInterval);
            this.miningInterval = null;
        }

        this.showNotification('Minería detenida', 'info');
    }

    claimRSC() {
        if (this.minedRSC <= 0) {
            this.showNotification('No hay RSC para reclamar', 'warning');
            return;
        }

        const amount = this.minedRSC;
        this.minedRSC = 0;
        
        this.showRewardModal(amount);
        this.updateMiningStats();
        
        this.showNotification(`${amount.toFixed(6)} RSC reclamados`, 'success');
    }

    claimAllRSC() {
        this.claimRSC();
    }

    updateMiningStatus(status) {
        const statusIndicator = document.querySelector('.status-indicator');
        const statusDot = statusIndicator?.querySelector('.status-dot');
        const statusText = statusIndicator?.querySelector('span');

        if (statusDot) {
            statusDot.className = `status-dot ${status}`;
        }

        if (statusText) {
            statusText.textContent = status === 'online' ? 'Conectado' : 'Desconectado';
        }
    }

    updateMiningStats() {
        // Actualizar estadísticas de minería
        const stats = {
            myHashRate: `${this.hashRate.toFixed(0)} H/s`,
            myMinedRSC: `${this.minedRSC.toFixed(6)} RSC`,
            myActiveTime: this.formatTime(this.activeTime),
            myRank: `#${Math.floor(Math.random() * 2000) + 1}`
        };

        Object.keys(stats).forEach(key => {
            const element = document.getElementById(key);
            if (element) {
                element.textContent = stats[key];
            }
        });
    }

    updateProgressStats() {
        // Actualizar estadísticas de progreso
        const stats = {
            currentHashRate: `${this.hashRate.toFixed(0)} H/s`,
            totalMined: `${this.minedRSC.toFixed(6)} RSC`,
            sessionTime: this.formatTime(this.activeTime),
            efficiency: `${Math.floor(Math.random() * 20 + 80)}%`
        };

        Object.keys(stats).forEach(key => {
            const element = document.getElementById(key);
            if (element) {
                element.textContent = stats[key];
            }
        });
    }

    updateIntensity(value) {
        const intensityValue = document.getElementById('intensityValue');
        const intensityLabels = ['Baja', 'Media', 'Alta'];
        
        if (intensityValue) {
            if (value <= 3) {
                intensityValue.textContent = 'Baja';
            } else if (value <= 7) {
                intensityValue.textContent = 'Media';
            } else {
                intensityValue.textContent = 'Alta';
            }
        }

        // Ajustar hash rate según intensidad
        this.hashRate = value * 200;
        this.updateMiningStats();
    }

    updateProcessPriority(priority) {
        console.log('Prioridad de proceso actualizada:', priority);
        // Aquí se implementaría la lógica real de prioridad
    }

    updateChartPeriod(period) {
        // Actualizar período del gráfico
        console.log('Actualizando período:', period);
        
        // Simular actualización de datos
        const newData = this.generateHashRateData(period === '1h' ? 24 : period === '24h' ? 24 : 168);
        
        if (this.charts.hashRateProgress) {
            this.charts.hashRateProgress.data.datasets[0].data = newData;
            this.charts.hashRateProgress.update();
        }
    }

    refreshData() {
        // Refrescar datos
        console.log('Refrescando datos...');
        this.updateRealTimeStats();
        this.showNotification('Datos actualizados', 'info');
    }

    showRewardModal(amount) {
        const modal = document.getElementById('rewardModal');
        const rewardAmount = document.getElementById('rewardAmount');
        
        if (modal && rewardAmount) {
            rewardAmount.textContent = `${amount.toFixed(6)} RSC`;
            modal.classList.add('active');
            
            setTimeout(() => {
                modal.classList.remove('active');
            }, 3000);
        }
    }

    setupModals() {
        // Modal de recompensa
        const rewardModal = document.getElementById('rewardModal');
        const rewardModalClose = document.getElementById('rewardModalClose');

        rewardModalClose?.addEventListener('click', () => {
            rewardModal.classList.remove('active');
        });

        // Cerrar modales al hacer clic fuera
        window.addEventListener('click', (e) => {
            if (e.target === rewardModal) {
                rewardModal.classList.remove('active');
            }
        });
    }

    startRealTimeUpdates() {
        // Actualizaciones en tiempo real
        setInterval(() => {
            this.updateRealTimeStats();
        }, 5000);
    }

    showNotification(message, type = 'info') {
        // Mostrar notificación
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    formatTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    // Funciones auxiliares para generar datos
    generateTimeLabels(count) {
        const labels = [];
        for (let i = count - 1; i >= 0; i--) {
            const date = new Date();
            date.setHours(date.getHours() - i);
            labels.push(date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }));
        }
        return labels;
    }

    generateHashRateData(count) {
        const data = [];
        let baseHashRate = 500;
        
        for (let i = 0; i < count; i++) {
            baseHashRate += (Math.random() - 0.5) * 100;
            data.push(Math.max(100, baseHashRate));
        }
        
        return data;
    }

    generateTimeData(count) {
        const data = [];
        let baseTime = 0;
        
        for (let i = 0; i < count; i++) {
            baseTime += Math.random() * 60;
            data.push(baseTime);
        }
        
        return data;
    }

    generateRSCData(count) {
        const data = [];
        let baseRSC = 0;
        
        for (let i = 0; i < count; i++) {
            baseRSC += Math.random() * 0.01;
            data.push(baseRSC);
        }
        
        return data;
    }

    generatePerformanceData(count) {
        const data = [];
        let basePerformance = 80;
        
        for (let i = 0; i < count; i++) {
            basePerformance += (Math.random() - 0.5) * 10;
            data.push(Math.max(60, Math.min(100, basePerformance)));
        }
        
        return data;
    }

    generatePredictionData(count) {
        const data = [];
        let basePrediction = 85;
        
        for (let i = 0; i < count; i++) {
            basePrediction += (Math.random() - 0.5) * 5;
            data.push(Math.max(80, Math.min(95, basePrediction)));
        }
        
        return data;
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new MiningEpic();
});

// Exportar para uso global
window.MiningEpic = MiningEpic; 