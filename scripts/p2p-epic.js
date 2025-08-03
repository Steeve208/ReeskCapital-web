// P2P Épico - JavaScript Avanzado

class P2PEpic {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.animationId = null;
        this.charts = {};
        this.currentSection = 'marketplace';
        this.websocket = null;
        this.isConnected = false;
        
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

        // Filtros
        document.getElementById('clearFilters')?.addEventListener('click', () => {
            this.clearFilters();
        });

        document.getElementById('applyFilters')?.addEventListener('click', () => {
            this.applyFilters();
        });

        // Rango de precio
        const priceRange = document.getElementById('priceRange');
        if (priceRange) {
            priceRange.addEventListener('input', (e) => {
                document.getElementById('rangeValue').textContent = `$${e.target.value}`;
            });
        }

        // Botones de acción
        document.getElementById('refreshBtn')?.addEventListener('click', () => {
            this.refreshData();
        });

        document.getElementById('createAdBtn')?.addEventListener('click', () => {
            this.switchSection('create');
        });

        // Formulario de crear anuncio
        this.setupCreateAdForm();

        // Modales
        this.setupModals();
    }

    switchSection(section) {
        // Ocultar todas las secciones
        document.querySelectorAll('.p2p-section').forEach(s => {
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
            case 'marketplace':
                this.loadMarketplaceData();
                break;
            case 'create':
                this.setupCreateAdForm();
                break;
            case 'my-ads':
                this.loadMyAdsData();
                break;
            case 'history':
                this.loadHistoryData();
                break;
            case 'reputation':
                this.loadReputationData();
                break;
            case 'analytics':
                this.loadAnalyticsData();
                break;
        }
    }

    initCharts() {
        // Gráfico de precios P2P
        const p2pPricesCtx = document.getElementById('p2pPricesChart');
        if (p2pPricesCtx) {
            this.charts.p2pPrices = new Chart(p2pPricesCtx, {
                type: 'line',
                data: {
                    labels: this.generateTimeLabels(24),
                    datasets: [{
                        label: 'Precio RSC',
                        data: this.generatePriceData(24),
                        borderColor: '#6366f1',
                        backgroundColor: 'rgba(99, 102, 241, 0.1)',
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

        // Gráfico de distribución de trades
        const tradesDistributionCtx = document.getElementById('tradesDistributionChart');
        if (tradesDistributionCtx) {
            this.charts.tradesDistribution = new Chart(tradesDistributionCtx, {
                type: 'doughnut',
                data: {
                    labels: ['Compras', 'Ventas', 'Pendientes'],
                    datasets: [{
                        data: [65, 25, 10],
                        backgroundColor: [
                            '#10b981',
                            '#ef4444',
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
                                color: 'rgba(255, 255, 255, 0.7)',
                                padding: 20
                            }
                        }
                    }
                }
            });
        }

        // Gráficos de analytics
        this.initAnalyticsCharts();
    }

    initAnalyticsCharts() {
        // Rendimiento de Trading
        const tradingPerformanceCtx = document.getElementById('tradingPerformanceChart');
        if (tradingPerformanceCtx) {
            this.charts.tradingPerformance = new Chart(tradingPerformanceCtx, {
                type: 'line',
                data: {
                    labels: this.generateTimeLabels(30),
                    datasets: [{
                        label: 'Volumen',
                        data: this.generateVolumeData(30),
                        borderColor: '#6366f1',
                        backgroundColor: 'rgba(99, 102, 241, 0.1)',
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

        // Métodos de Pago
        const paymentMethodsCtx = document.getElementById('paymentMethodsChart');
        if (paymentMethodsCtx) {
            this.charts.paymentMethods = new Chart(paymentMethodsCtx, {
                type: 'pie',
                data: {
                    labels: ['Transferencia Bancaria', 'Efectivo', 'Crypto'],
                    datasets: [{
                        data: [45, 35, 20],
                        backgroundColor: [
                            '#6366f1',
                            '#10b981',
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
                                color: 'rgba(255, 255, 255, 0.7)',
                                padding: 20
                            }
                        }
                    }
                }
            });
        }

        // Análisis de Precios
        const priceAnalysisCtx = document.getElementById('priceAnalysisChart');
        if (priceAnalysisCtx) {
            this.charts.priceAnalysis = new Chart(priceAnalysisCtx, {
                type: 'bar',
                data: {
                    labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
                    datasets: [{
                        label: 'Precio Promedio',
                        data: [0.85, 0.92, 0.88, 0.95, 1.02, 0.98],
                        backgroundColor: 'rgba(99, 102, 241, 0.8)',
                        borderColor: '#6366f1',
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

        // Predicciones de Mercado
        const marketPredictionsCtx = document.getElementById('marketPredictionsChart');
        if (marketPredictionsCtx) {
            this.charts.marketPredictions = new Chart(marketPredictionsCtx, {
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
        const container = document.getElementById('marketplace3d');
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

        const directionalLight = new THREE.DirectionalLight(0x6366f1, 1);
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
        // Nodos de traders
        for (let i = 0; i < 50; i++) {
            const geometry = new THREE.SphereGeometry(0.1, 8, 8);
            const material = new THREE.MeshPhongMaterial({ 
                color: Math.random() > 0.5 ? 0x6366f1 : 0x10b981 
            });
            const sphere = new THREE.Mesh(geometry, material);
            
            sphere.position.x = (Math.random() - 0.5) * 20;
            sphere.position.y = (Math.random() - 0.5) * 20;
            sphere.position.z = (Math.random() - 0.5) * 20;
            
            this.scene.add(sphere);
        }

        // Conexiones entre nodos
        const lineMaterial = new THREE.LineBasicMaterial({ color: 0x6366f1, opacity: 0.3, transparent: true });
        
        for (let i = 0; i < 20; i++) {
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

        // Partículas de volumen
        const particleCount = 100;
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
        });

        this.renderer.render(this.scene, this.camera);
    }

    setupMouseEvents() {
        const container = document.getElementById('marketplace3d');
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
            case 'trades':
                this.scene.rotation.set(0, 0, 0);
                break;
            case 'volume':
                this.scene.rotation.set(0.5, 0.5, 0);
                break;
            case 'users':
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
            myTrades: Math.floor(Math.random() * 100) + 50,
            myVolume: `$${(Math.random() * 10000 + 5000).toFixed(2)}`,
            myRating: (Math.random() * 2 + 3).toFixed(1),
            myRank: `#${Math.floor(Math.random() * 2000) + 1}`
        };

        Object.keys(stats).forEach(key => {
            const element = document.getElementById(key);
            if (element) {
                element.textContent = stats[key];
            }
        });

        // Actualizar overlay stats
        const overlayStats = {
            overlayTrades: Math.floor(Math.random() * 2000) + 1000,
            overlayVolume: `$${(Math.random() * 100000 + 50000).toFixed(0)}`,
            overlayUsers: Math.floor(Math.random() * 1000) + 500
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
        this.loadMarketplaceData();
        this.loadMyAdsData();
        this.loadHistoryData();
        this.loadReputationData();
    }

    loadMarketplaceData() {
        const adsGrid = document.getElementById('adsGrid');
        if (!adsGrid) return;

        const mockAds = [
            {
                type: 'buy',
                price: 0.95,
                amount: 1000,
                user: 'TraderPro',
                rating: 4.8,
                payment: ['Transferencia Bancaria', 'Efectivo'],
                time: '2 min'
            },
            {
                type: 'sell',
                price: 0.98,
                amount: 500,
                user: 'CryptoMaster',
                rating: 4.9,
                payment: ['Crypto'],
                time: '5 min'
            },
            {
                type: 'buy',
                price: 0.92,
                amount: 2000,
                user: 'RSCTrader',
                rating: 4.7,
                payment: ['Transferencia Bancaria'],
                time: '1 min'
            }
        ];

        adsGrid.innerHTML = mockAds.map(ad => this.createAdCard(ad)).join('');
    }

    createAdCard(ad) {
        return `
            <div class="ad-card-epic">
                <div class="ad-header">
                    <span class="ad-type ${ad.type}">${ad.type === 'buy' ? 'Comprar' : 'Vender'}</span>
                    <span class="ad-time">${ad.time}</span>
                </div>
                <div class="ad-price">
                    $${ad.price.toFixed(2)} <span class="ad-currency">USD</span>
                </div>
                <div class="ad-details">
                    <div class="ad-amount">${ad.amount.toLocaleString()} RSC</div>
                    <div class="ad-payment">
                        ${ad.payment.map(p => `<span class="payment-tag">${p}</span>`).join('')}
                    </div>
                </div>
                <div class="ad-user">
                    <div class="user-avatar">${ad.user.charAt(0)}</div>
                    <div class="user-info">
                        <div class="user-name">${ad.user}</div>
                        <div class="user-rating">
                            ${'⭐'.repeat(Math.floor(ad.rating))} ${ad.rating}
                        </div>
                    </div>
                </div>
                <div class="ad-actions">
                    <button class="ad-btn primary">Iniciar Trade</button>
                    <button class="ad-btn secondary">Chat</button>
                </div>
            </div>
        `;
    }

    loadMyAdsData() {
        const myAdsGrid = document.getElementById('myAdsGrid');
        if (!myAdsGrid) return;

        const mockMyAds = [
            {
                type: 'sell',
                price: 0.97,
                amount: 1500,
                status: 'active',
                views: 45,
                time: '1 hora'
            },
            {
                type: 'buy',
                price: 0.94,
                amount: 800,
                status: 'active',
                views: 23,
                time: '30 min'
            }
        ];

        myAdsGrid.innerHTML = mockMyAds.map(ad => this.createMyAdCard(ad)).join('');
    }

    createMyAdCard(ad) {
        return `
            <div class="my-ad-card">
                <div class="ad-header">
                    <span class="ad-type ${ad.type}">${ad.type === 'buy' ? 'Comprar' : 'Vender'}</span>
                    <span class="ad-status ${ad.status}">${ad.status}</span>
                </div>
                <div class="ad-price">$${ad.price.toFixed(2)} USD</div>
                <div class="ad-amount">${ad.amount.toLocaleString()} RSC</div>
                <div class="ad-stats">
                    <span>👁️ ${ad.views} vistas</span>
                    <span>⏰ ${ad.time}</span>
                </div>
                <div class="ad-actions">
                    <button class="btn-secondary">Editar</button>
                    <button class="btn-danger">Eliminar</button>
                </div>
            </div>
        `;
    }

    loadHistoryData() {
        const historyTableBody = document.getElementById('historyTableBody');
        if (!historyTableBody) return;

        const mockHistory = [
            {
                id: 'TX001',
                type: 'buy',
                amount: 500,
                price: 0.95,
                counterparty: 'TraderPro',
                status: 'completed',
                date: '2024-01-15 14:30'
            },
            {
                id: 'TX002',
                type: 'sell',
                amount: 300,
                price: 0.98,
                counterparty: 'CryptoMaster',
                status: 'pending',
                date: '2024-01-15 13:45'
            }
        ];

        historyTableBody.innerHTML = mockHistory.map(trade => `
            <tr>
                <td>${trade.id}</td>
                <td><span class="trade-type ${trade.type}">${trade.type}</span></td>
                <td>${trade.amount} RSC</td>
                <td>$${trade.price}</td>
                <td>${trade.counterparty}</td>
                <td><span class="status ${trade.status}">${trade.status}</span></td>
                <td>${trade.date}</td>
                <td>
                    <button class="btn-small">Ver</button>
                </td>
            </tr>
        `).join('');
    }

    loadReputationData() {
        const reviewsList = document.getElementById('reviewsList');
        if (!reviewsList) return;

        const mockReviews = [
            {
                user: 'TraderPro',
                rating: 5,
                comment: 'Excelente trader, muy rápido y confiable.',
                date: '2024-01-14'
            },
            {
                user: 'CryptoMaster',
                rating: 4,
                comment: 'Buen servicio, recomendado.',
                date: '2024-01-13'
            }
        ];

        reviewsList.innerHTML = mockReviews.map(review => `
            <div class="review-item">
                <div class="review-avatar">${review.user.charAt(0)}</div>
                <div class="review-content">
                    <div class="review-header">
                        <span class="review-user">${review.user}</span>
                        <div class="review-rating">
                            ${'⭐'.repeat(review.rating)}
                        </div>
                    </div>
                    <div class="review-text">${review.comment}</div>
                    <div class="review-date">${review.date}</div>
                </div>
            </div>
        `).join('');
    }

    loadAnalyticsData() {
        // Los gráficos ya están inicializados
        // Aquí se podrían cargar datos adicionales si es necesario
    }

    setupCreateAdForm() {
        // Selector de tipo de anuncio
        document.querySelectorAll('.type-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.type-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });

        // Métodos de pago
        document.querySelectorAll('.payment-method-option input').forEach(input => {
            input.addEventListener('change', (e) => {
                const option = e.target.closest('.payment-method-option');
                if (e.target.checked) {
                    option.style.borderColor = '#6366f1';
                    option.style.background = 'rgba(99, 102, 241, 0.1)';
                } else {
                    option.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                    option.style.background = 'transparent';
                }
            });
        });

        // Botones de acción
        document.getElementById('previewBtn')?.addEventListener('click', () => {
            this.previewAd();
        });

        document.getElementById('createBtn')?.addEventListener('click', () => {
            this.createAd();
        });
    }

    previewAd() {
        // Mostrar vista previa del anuncio
        console.log('Vista previa del anuncio');
    }

    createAd() {
        // Crear anuncio
        console.log('Creando anuncio...');
        this.showNotification('Anuncio creado exitosamente', 'success');
        this.switchSection('my-ads');
    }

    setupModals() {
        // Modal de chat
        const chatModal = document.getElementById('chatModal');
        const chatModalClose = document.getElementById('chatModalClose');

        chatModalClose?.addEventListener('click', () => {
            chatModal.classList.remove('active');
        });

        // Modal de trade
        const tradeModal = document.getElementById('tradeModal');
        const tradeModalClose = document.getElementById('tradeModalClose');

        tradeModalClose?.addEventListener('click', () => {
            tradeModal.classList.remove('active');
        });

        // Cerrar modales al hacer clic fuera
        window.addEventListener('click', (e) => {
            if (e.target === chatModal) {
                chatModal.classList.remove('active');
            }
            if (e.target === tradeModal) {
                tradeModal.classList.remove('active');
            }
        });
    }

    clearFilters() {
        document.querySelectorAll('.filter-option input').forEach(input => {
            input.checked = false;
        });
        document.getElementById('priceRange').value = 50;
        document.getElementById('rangeValue').textContent = '$50';
    }

    applyFilters() {
        // Aplicar filtros
        console.log('Aplicando filtros...');
        this.loadMarketplaceData(); // Recargar con filtros
    }

    refreshData() {
        // Refrescar datos
        console.log('Refrescando datos...');
        this.updateRealTimeStats();
        this.showNotification('Datos actualizados', 'info');
    }

    updateChartPeriod(period) {
        // Actualizar período del gráfico
        console.log('Actualizando período:', period);
        
        // Simular actualización de datos
        const newData = this.generatePriceData(period === '24h' ? 24 : period === '7d' ? 7 : 30);
        
        if (this.charts.p2pPrices) {
            this.charts.p2pPrices.data.datasets[0].data = newData;
            this.charts.p2pPrices.update();
        }
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

    generatePriceData(count) {
        const data = [];
        let basePrice = 0.95;
        
        for (let i = 0; i < count; i++) {
            basePrice += (Math.random() - 0.5) * 0.1;
            data.push(Math.max(0.8, Math.min(1.2, basePrice)));
        }
        
        return data;
    }

    generateVolumeData(count) {
        const data = [];
        let baseVolume = 5000;
        
        for (let i = 0; i < count; i++) {
            baseVolume += (Math.random() - 0.5) * 1000;
            data.push(Math.max(1000, baseVolume));
        }
        
        return data;
    }

    generatePredictionData(count) {
        const data = [];
        let basePrice = 0.98;
        
        for (let i = 0; i < count; i++) {
            basePrice += (Math.random() - 0.5) * 0.05;
            data.push(Math.max(0.9, Math.min(1.1, basePrice)));
        }
        
        return data;
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new P2PEpic();
});

// Exportar para uso global
window.P2PEpic = P2PEpic; 