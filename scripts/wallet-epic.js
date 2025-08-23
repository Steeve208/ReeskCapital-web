// Wallet Épico - Centro del Ecosistema RSC
class WalletEpic {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.animationId = null;
        this.charts = {};
        this.currentSection = 'overview';
        this.websocket = null;
        this.isConnected = false;
        this.walletAddress = '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6';
        this.balance = 0;
        this.transactions = [];
        this.miningRewards = 0;
        this.stakingRewards = 0;
        
        this.init();
    }

    async init() {
        this.setupEventListeners();
        this.initializeCharts();
        this.init3DVisualization();
        this.simulateWebSocket();
        await this.loadWalletData();
        this.generateQRCode();
        this.updateWalletStats();
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

        // Botones de acción rápida
        document.getElementById('quickSendBtn')?.addEventListener('click', () => {
            this.switchSection('send');
        });

        document.getElementById('quickReceiveBtn')?.addEventListener('click', () => {
            this.switchSection('receive');
        });

        document.getElementById('claimMiningBtn')?.addEventListener('click', () => {
            this.claimMiningRewards();
        });

        document.getElementById('backupWalletBtn')?.addEventListener('click', () => {
            this.backupWallet();
        });

        // Copiar dirección
        document.getElementById('copyAddressBtn')?.addEventListener('click', () => {
            this.copyWalletAddress();
        });

        document.getElementById('copyWalletAddressBtn')?.addEventListener('click', () => {
            this.copyWalletAddress();
        });

        // Mostrar QR
        document.getElementById('showQRBtn')?.addEventListener('click', () => {
            this.showQRModal();
        });

        // Enviar transacción
        document.getElementById('sendTransactionBtn')?.addEventListener('click', () => {
            this.sendTransaction();
        });

        document.getElementById('previewTransactionBtn')?.addEventListener('click', () => {
            this.previewTransaction();
        });

        // Cantidades rápidas
        document.querySelectorAll('.amount-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const amount = e.target.getAttribute('data-amount');
                if (amount === 'MAX') {
                    document.getElementById('sendAmount').value = this.balance.toFixed(6);
                } else {
                    document.getElementById('sendAmount').value = amount;
                }
                this.updateTransactionSummary();
            });
        });

        // Gas selector
        document.querySelectorAll('.gas-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.gas-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.updateTransactionSummary();
            });
        });

        // Filtros de transacciones
        document.getElementById('transactionFilter')?.addEventListener('change', () => {
            this.filterTransactions();
        });

        document.getElementById('timeFilter')?.addEventListener('change', () => {
            this.filterTransactions();
        });

        // Controles de visualización 3D
        document.querySelectorAll('.control-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.control-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.change3DView(e.target.getAttribute('data-view'));
            });
        });

        // Modales
        document.getElementById('transactionModalClose')?.addEventListener('click', () => {
            this.closeModal('transactionModal');
        });

        document.getElementById('qrModalClose')?.addEventListener('click', () => {
            this.closeModal('qrModal');
        });

        document.getElementById('confirmTransactionBtn')?.addEventListener('click', () => {
            this.confirmTransaction();
        });

        document.getElementById('cancelTransactionBtn')?.addEventListener('click', () => {
            this.closeModal('transactionModal');
        });

        // Actualizar resumen de transacción
        document.getElementById('sendAmount')?.addEventListener('input', () => {
            this.updateTransactionSummary();
        });

        document.getElementById('recipientAddress')?.addEventListener('input', () => {
            this.updateTransactionSummary();
        });

        // Botones de minería y staking
        document.getElementById('claimMiningRewardsBtn')?.addEventListener('click', () => {
            this.claimMiningRewards();
        });

        document.getElementById('startMiningBtn')?.addEventListener('click', () => {
            this.startMining();
        });

        document.getElementById('stakeRSCBtn')?.addEventListener('click', () => {
            this.stakeRSC();
        });

        document.getElementById('unstakeRSCBtn')?.addEventListener('click', () => {
            this.unstakeRSC();
        });

        // Seguridad
        document.getElementById('changePasswordBtn')?.addEventListener('click', () => {
            this.changePassword();
        });

        document.getElementById('setup2FABtn')?.addEventListener('click', () => {
            this.setup2FA();
        });

        document.getElementById('exportPrivateKeyBtn')?.addEventListener('click', () => {
            this.exportPrivateKey();
        });

        // Exportar transacciones
        document.getElementById('exportTransactionsBtn')?.addEventListener('click', () => {
            this.exportTransactions();
        });

        // Actualizar vista general
        document.getElementById('refreshOverviewBtn')?.addEventListener('click', () => {
            this.refreshOverview();
        });

        // Ver todas las transacciones
        document.getElementById('viewAllTransactionsBtn')?.addEventListener('click', () => {
            this.switchSection('transactions');
        });
    }

    switchSection(section) {
        // Ocultar todas las secciones
        document.querySelectorAll('.wallet-section').forEach(s => {
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

        // Inicializar contenido específico de la sección
        switch (section) {
            case 'overview':
                this.updateOverview();
                break;
            case 'send':
                this.updateSendSection();
                break;
            case 'receive':
                this.updateReceiveSection();
                break;
            case 'transactions':
                this.updateTransactionsSection();
                break;
            case 'mining':
                this.updateMiningSection();
                break;
            case 'staking':
                this.updateStakingSection();
                break;
            case 'security':
                this.updateSecuritySection();
                break;
            case 'analytics':
                this.updateAnalyticsSection();
                break;
        }
    }

    initializeCharts() {
        // Balance Chart
        const balanceCtx = document.getElementById('balanceChart');
        if (balanceCtx) {
            this.charts.balance = new Chart(balanceCtx, {
                type: 'line',
                data: {
                    labels: this.generateTimeLabels(24),
                    datasets: [{
                        label: 'Balance RSC',
                        data: this.generateBalanceData(24),
                        borderColor: '#3b82f6',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
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
                            display: false
                        },
                        y: {
                            display: false
                        }
                    },
                    elements: {
                        point: {
                            radius: 0
                        }
                    }
                }
            });
        }

        // Transactions Chart
        const transactionsCtx = document.getElementById('transactionsChart');
        if (transactionsCtx) {
            this.charts.transactions = new Chart(transactionsCtx, {
                type: 'bar',
                data: {
                    labels: this.generateTimeLabels(7),
                    datasets: [{
                        label: 'Transacciones',
                        data: this.generateTransactionData(7),
                        backgroundColor: 'rgba(59, 130, 246, 0.8)',
                        borderColor: '#3b82f6',
                        borderWidth: 1
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
                                display: false
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

        // Mining Chart
        const miningCtx = document.getElementById('miningChart');
        if (miningCtx) {
            this.charts.mining = new Chart(miningCtx, {
                type: 'line',
                data: {
                    labels: this.generateTimeLabels(12),
                    datasets: [{
                        label: 'Hash Rate',
                        data: this.generateMiningData(12),
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
                                display: false
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

        // Staking Chart
        const stakingCtx = document.getElementById('stakingChart');
        if (stakingCtx) {
            this.charts.staking = new Chart(stakingCtx, {
                type: 'doughnut',
                data: {
                    labels: ['Stakeado', 'Disponible'],
                    datasets: [{
                        data: [60, 40],
                        backgroundColor: ['#10b981', 'rgba(255, 255, 255, 0.1)'],
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        }
                    }
                }
            });
        }

        // Analytics Charts
        this.initializeAnalyticsCharts();
    }

    initializeAnalyticsCharts() {
        // Balance History Chart
        const balanceHistoryCtx = document.getElementById('balanceHistoryChart');
        if (balanceHistoryCtx) {
            this.charts.balanceHistory = new Chart(balanceHistoryCtx, {
                type: 'line',
                data: {
                    labels: this.generateTimeLabels(30),
                    datasets: [{
                        label: 'Balance Histórico',
                        data: this.generateBalanceData(30),
                        borderColor: '#3b82f6',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
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
                                display: false
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

        // Assets Distribution Chart
        const assetsDistributionCtx = document.getElementById('assetsDistributionChart');
        if (assetsDistributionCtx) {
            this.charts.assetsDistribution = new Chart(assetsDistributionCtx, {
                type: 'doughnut',
                data: {
                    labels: ['RSC Disponible', 'RSC Stakeado', 'Recompensas Mineras'],
                    datasets: [{
                        data: [40, 35, 25],
                        backgroundColor: ['#3b82f6', '#10b981', '#f59e0b'],
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
                                color: 'rgba(255, 255, 255, 0.7)'
                            }
                        }
                    }
                }
            });
        }

        // Monthly Activity Chart
        const monthlyActivityCtx = document.getElementById('monthlyActivityChart');
        if (monthlyActivityCtx) {
            this.charts.monthlyActivity = new Chart(monthlyActivityCtx, {
                type: 'bar',
                data: {
                    labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
                    datasets: [{
                        label: 'Transacciones',
                        data: [12, 19, 15, 25, 22, 30],
                        backgroundColor: 'rgba(59, 130, 246, 0.8)'
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
                                display: false
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

        // Predictions Chart
        const predictionsCtx = document.getElementById('predictionsChart');
        if (predictionsCtx) {
            this.charts.predictions = new Chart(predictionsCtx, {
                type: 'line',
                data: {
                    labels: this.generateTimeLabels(7),
                    datasets: [{
                        label: 'Predicción',
                        data: this.generatePredictionData(7),
                        borderColor: '#8b5cf6',
                        backgroundColor: 'rgba(139, 92, 246, 0.1)',
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4,
                        borderDash: [5, 5]
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
                                display: false
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
        const container = document.getElementById('wallet3d');
        if (!container) return;

        // Configuración de Three.js
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setSize(container.clientWidth, container.clientHeight);
        this.renderer.setClearColor(0x000000, 0);
        container.appendChild(this.renderer.domElement);

        // Crear geometrías para representar la wallet
        this.createWalletGeometry();

        // Configurar cámara
        this.camera.position.z = 5;

        // Animación
        this.animate();

        // Eventos del mouse
        this.setupMouseEvents();
    }

    createWalletGeometry() {
        // Crear múltiples esferas que representan transacciones
        for (let i = 0; i < 20; i++) {
            const geometry = new THREE.SphereGeometry(0.1, 8, 8);
            const material = new THREE.MeshBasicMaterial({
                color: new THREE.Color().setHSL(Math.random(), 0.7, 0.5),
                transparent: true,
                opacity: 0.8
            });
            const sphere = new THREE.Mesh(geometry, material);
            
            // Posición aleatoria
            sphere.position.set(
                (Math.random() - 0.5) * 10,
                (Math.random() - 0.5) * 10,
                (Math.random() - 0.5) * 10
            );
            
            // Velocidad de rotación
            sphere.userData = {
                rotationSpeed: {
                    x: (Math.random() - 0.5) * 0.02,
                    y: (Math.random() - 0.5) * 0.02,
                    z: (Math.random() - 0.5) * 0.02
                }
            };
            
            this.scene.add(sphere);
        }

        // Crear líneas que conectan las esferas (representando transacciones)
        for (let i = 0; i < 10; i++) {
            const geometry = new THREE.BufferGeometry();
            const positions = new Float32Array([
                (Math.random() - 0.5) * 10,
                (Math.random() - 0.5) * 10,
                (Math.random() - 0.5) * 10,
                (Math.random() - 0.5) * 10,
                (Math.random() - 0.5) * 10,
                (Math.random() - 0.5) * 10
            ]);
            geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            
            const material = new THREE.LineBasicMaterial({
                color: 0x3b82f6,
                transparent: true,
                opacity: 0.6
            });
            
            const line = new THREE.Line(geometry, material);
            this.scene.add(line);
        }
    }

    animate() {
        this.animationId = requestAnimationFrame(() => this.animate());

        // Rotar todas las esferas
        this.scene.children.forEach(child => {
            if (child.userData.rotationSpeed) {
                child.rotation.x += child.userData.rotationSpeed.x;
                child.rotation.y += child.userData.rotationSpeed.y;
                child.rotation.z += child.userData.rotationSpeed.z;
            }
        });

        // Rotar toda la escena
        this.scene.rotation.y += 0.005;

        this.renderer.render(this.scene, this.camera);
    }

    setupMouseEvents() {
        const container = document.getElementById('wallet3d');
        if (!container) return;

        let mouseX = 0;
        let mouseY = 0;

        container.addEventListener('mousemove', (event) => {
            mouseX = (event.clientX / container.clientWidth) * 2 - 1;
            mouseY = -(event.clientY / container.clientHeight) * 2 + 1;

            // Mover cámara suavemente
            this.camera.position.x += (mouseX * 2 - this.camera.position.x) * 0.05;
            this.camera.position.y += (mouseY * 2 - this.camera.position.y) * 0.05;
            this.camera.lookAt(0, 0, 0);
        });
    }

    change3DView(view) {
        // Cambiar la visualización 3D según la vista seleccionada
        switch (view) {
            case 'balance':
                this.scene.rotation.set(0, 0, 0);
                break;
            case 'transactions':
                this.scene.rotation.set(0, Math.PI / 4, 0);
                break;
            case 'network':
                this.scene.rotation.set(Math.PI / 4, 0, 0);
                break;
        }
    }

    simulateWebSocket() {
        // Simular conexión WebSocket para datos en tiempo real
        this.websocket = {
            send: (data) => {
                console.log('WebSocket send:', data);
            }
        };

        // Simular actualizaciones en tiempo real
        setInterval(() => {
            this.updateRealTimeData();
        }, 5000);

        this.isConnected = true;
        this.updateConnectionStatus();
    }

    updateRealTimeData() {
        // Simular actualizaciones de datos en tiempo real
        this.balance += (Math.random() - 0.5) * 0.001;
        this.miningRewards += Math.random() * 0.0001;
        this.stakingRewards += Math.random() * 0.0001;

        this.updateWalletStats();
        this.updateCharts();
    }

    updateConnectionStatus() {
        const statusDot = document.querySelector('.status-dot');
        if (statusDot) {
            statusDot.className = this.isConnected ? 'status-dot online' : 'status-dot offline';
        }
    }

    loadWalletData() {
        // Cargar datos de la wallet
        this.balance = 1250.456789;
        this.miningRewards = 45.123456;
        this.stakingRewards = 78.987654;
        this.transactions = await this.generateTransactionHistory();

        this.updateWalletStats();
        this.updateRecentActivity();
    }

    updateWalletStats() {
        // Actualizar estadísticas principales
        document.getElementById('totalBalance').textContent = `${this.balance.toFixed(6)} RSC`;
        document.getElementById('miningRewards').textContent = `${this.miningRewards.toFixed(6)} RSC`;
        document.getElementById('mainBalance').textContent = `${this.balance.toFixed(6)} RSC`;
        document.getElementById('totalMined').textContent = `${this.miningRewards.toFixed(6)} RSC`;
        document.getElementById('pendingRewards').textContent = `${this.miningRewards.toFixed(6)} RSC`;
        document.getElementById('totalStaked').textContent = `${this.stakingRewards.toFixed(6)} RSC`;
        document.getElementById('stakingRewards').textContent = `${this.stakingRewards.toFixed(6)} RSC`;

        // Actualizar dirección de wallet
        document.getElementById('walletAddressDisplay').textContent = `${this.walletAddress.slice(0, 6)}...${this.walletAddress.slice(-4)}`;
        document.getElementById('fullWalletAddress').textContent = this.walletAddress;
    }

    updateRecentActivity() {
        const activityList = document.getElementById('recentActivityList');
        if (!activityList) return;

        activityList.innerHTML = '';

        // Mostrar las últimas 5 transacciones
        this.transactions.slice(0, 5).forEach(tx => {
            const activityItem = document.createElement('div');
            activityItem.className = 'activity-item';
            activityItem.innerHTML = `
                <div class="activity-icon ${tx.type}">${tx.type === 'sent' ? '📤' : '📥'}</div>
                <div class="activity-details">
                    <div class="activity-title">${tx.title}</div>
                    <div class="activity-time">${tx.time}</div>
                </div>
                <div class="activity-amount ${tx.type}">${tx.amount} RSC</div>
            `;
            activityList.appendChild(activityItem);
        });
    }

    generateTransactionHistory() {
        const types = ['sent', 'received', 'mining', 'staking'];
        const titles = [
            'Envío a usuario',
            'Recibido de usuario',
            'Recompensa de minería',
            'Recompensa de staking',
            'Transferencia P2P',
            'Depósito de minería'
        ];

        const history = [];
        for (let i = 0; i < 20; i++) {
            const type = types[Math.floor(Math.random() * types.length)];
            const title = titles[Math.floor(Math.random() * titles.length)];
            const amount = (Math.random() * 100).toFixed(6);
            const time = this.getRandomTime();

            history.push({
                id: i + 1,
                type,
                title,
                amount: parseFloat(amount),
                time,
                hash: `0x${Math.random().toString(16).slice(2, 10)}...`
            });
        }

        return history.sort((a, b) => new Date(b.time) - new Date(a.time));
    }

    getRandomTime() {
        const now = new Date();
        const hours = Math.floor(Math.random() * 24);
        const minutes = Math.floor(Math.random() * 60);
        const timeAgo = new Date(now.getTime() - (hours * 60 + minutes) * 60 * 1000);
        
        if (hours === 0) {
            return `${minutes} min ago`;
        } else if (hours < 24) {
            return `${hours}h ago`;
        } else {
            const days = Math.floor(hours / 24);
            return `${days}d ago`;
        }
    }

    generateTimeLabels(count) {
        const labels = [];
        for (let i = count - 1; i >= 0; i--) {
            const date = new Date();
            date.setHours(date.getHours() - i);
            labels.push(date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }));
        }
        return labels;
    }

    async generateBalanceData(count) {
        try {
            // Intentar obtener datos reales de balance de la API
            const response = await fetch(`https://rsc-chain-production.up.railway.app/api/wallet/balance-history/${this.walletAddress}`);
            if (response.ok) {
                const data = await response.json();
                return data.balance_history || Array(count).fill(this.balance);
            } else {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
        } catch (error) {
            console.warn('⚠️ No se pudieron cargar datos de balance reales:', error.message);
            // Fallback a datos estáticos
            return Array(count).fill(this.balance);
        }
    }

    async generateTransactionData(count) {
        try {
            // Intentar obtener datos reales de transacciones de la API
            const response = await fetch(`https://rsc-chain-production.up.railway.app/api/wallet/transaction-stats/${this.walletAddress}`);
            if (response.ok) {
                const data = await response.json();
                return data.transaction_counts || Array(count).fill(0);
            } else {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
        } catch (error) {
            console.warn('⚠️ No se pudieron cargar datos de transacciones reales:', error.message);
            // Fallback a datos vacíos
            return Array(count).fill(0);
        }
    }

    async generateMiningData(count) {
        try {
            // Intentar obtener datos reales de minería de la API
            const response = await fetch(`https://rsc-chain-production.up.railway.app/api/mining/hashrate-history/${this.walletAddress}`);
            if (response.ok) {
                const data = await response.json();
                return data.hashrate_history || Array(count).fill(0);
            } else {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
        } catch (error) {
            console.warn('⚠️ No se pudieron cargar datos de minería reales:', error.message);
            // Fallback a datos vacíos
            return Array(count).fill(0);
        }
    }

    async generatePredictionData(count) {
        try {
            // Intentar obtener datos reales de predicción de la API
            const response = await fetch('https://rsc-chain-production.up.railway.app/api/blockchain/price-prediction');
            if (response.ok) {
                const data = await response.json();
                return data.prediction_data || Array(count).fill(0);
            } else {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
        } catch (error) {
            console.warn('⚠️ No se pudieron cargar datos de predicción reales:', error.message);
            // Fallback a datos vacíos
            return Array(count).fill(0);
        }
    }

    updateCharts() {
        // Actualizar datos de los gráficos
        if (this.charts.balance) {
            this.charts.balance.data.datasets[0].data = this.generateBalanceData(24);
            this.charts.balance.update();
        }

        if (this.charts.transactions) {
            this.charts.transactions.data.datasets[0].data = this.generateTransactionData(7);
            this.charts.transactions.update();
        }

        if (this.charts.mining) {
            this.charts.mining.data.datasets[0].data = this.generateMiningData(12);
            this.charts.mining.update();
        }
    }

    updateTransactionSummary() {
        const amount = parseFloat(document.getElementById('sendAmount').value) || 0;
        const gasFee = 0.0001; // Gas fee fijo por ahora
        const total = amount + gasFee;

        document.getElementById('summaryAmount').textContent = `${amount.toFixed(6)} RSC`;
        document.getElementById('summaryGas').textContent = `${gasFee.toFixed(6)} RSC`;
        document.getElementById('summaryTotal').textContent = `${total.toFixed(6)} RSC`;
    }

    generateQRCode() {
        const qrContainer = document.getElementById('addressQR');
        if (!qrContainer) return;

        try {
            const qr = qrcode(0, 'M');
            qr.addData(this.walletAddress);
            qr.make();

            const qrImage = qr.createImgTag(5);
            qrContainer.innerHTML = qrImage;
        } catch (error) {
            console.error('Error generating QR code:', error);
            qrContainer.innerHTML = '<div style="width: 200px; height: 200px; background: #333; display: flex; align-items: center; justify-content: center; color: white;">QR Error</div>';
        }
    }

    copyWalletAddress() {
        navigator.clipboard.writeText(this.walletAddress).then(() => {
            this.showNotification('Dirección copiada al portapapeles', 'success');
        }).catch(() => {
            this.showNotification('Error al copiar dirección', 'error');
        });
    }

    showQRModal() {
        const modal = document.getElementById('qrModal');
        if (modal) {
            modal.classList.add('active');
        }
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
        }
    }

    previewTransaction() {
        const recipient = document.getElementById('recipientAddress').value;
        const amount = document.getElementById('sendAmount').value;
        const gasFee = 0.0001;

        if (!recipient || !amount) {
            this.showNotification('Por favor completa todos los campos', 'warning');
            return;
        }

        // Actualizar modal de confirmación
        document.getElementById('modalRecipient').textContent = recipient;
        document.getElementById('modalAmount').textContent = `${parseFloat(amount).toFixed(6)} RSC`;
        document.getElementById('modalGas').textContent = `${gasFee.toFixed(6)} RSC`;
        document.getElementById('modalTotal').textContent = `${(parseFloat(amount) + gasFee).toFixed(6)} RSC`;

        // Mostrar modal
        const modal = document.getElementById('transactionModal');
        if (modal) {
            modal.classList.add('active');
        }
    }

    sendTransaction() {
        const recipient = document.getElementById('recipientAddress').value;
        const amount = parseFloat(document.getElementById('sendAmount').value);

        if (!recipient || !amount) {
            this.showNotification('Por favor completa todos los campos', 'warning');
            return;
        }

        if (amount > this.balance) {
            this.showNotification('Saldo insuficiente', 'error');
            return;
        }

        // Simular envío de transacción
        this.showNotification('Transacción enviada', 'success');
        
        // Actualizar balance
        this.balance -= amount;
        this.updateWalletStats();

        // Limpiar formulario
        document.getElementById('recipientAddress').value = '';
        document.getElementById('sendAmount').value = '';

        // Cerrar modal
        this.closeModal('transactionModal');
    }

    confirmTransaction() {
        this.sendTransaction();
    }

    claimMiningRewards() {
        if (this.miningRewards > 0) {
            this.balance += this.miningRewards;
            const claimed = this.miningRewards;
            this.miningRewards = 0;
            
            this.updateWalletStats();
            this.showNotification(`Recompensas reclamadas: ${claimed.toFixed(6)} RSC`, 'success');
        } else {
            this.showNotification('No hay recompensas para reclamar', 'warning');
        }
    }

    startMining() {
        this.showNotification('Minería iniciada', 'success');
    }

    stakeRSC() {
        const amount = prompt('Cantidad de RSC a stake:');
        if (amount && parseFloat(amount) > 0 && parseFloat(amount) <= this.balance) {
            this.balance -= parseFloat(amount);
            this.stakingRewards += parseFloat(amount);
            this.updateWalletStats();
            this.showNotification(`${amount} RSC stakeados`, 'success');
        }
    }

    unstakeRSC() {
        const amount = prompt('Cantidad de RSC a unstake:');
        if (amount && parseFloat(amount) > 0 && parseFloat(amount) <= this.stakingRewards) {
            this.balance += parseFloat(amount);
            this.stakingRewards -= parseFloat(amount);
            this.updateWalletStats();
            this.showNotification(`${amount} RSC unstakeados`, 'success');
        }
    }

    changePassword() {
        this.showNotification('Función de cambio de contraseña', 'info');
    }

    setup2FA() {
        this.showNotification('Configuración de 2FA', 'info');
    }

    exportPrivateKey() {
        this.showNotification('Exportar clave privada', 'warning');
    }

    backupWallet() {
        this.showNotification('Backup de wallet creado', 'success');
    }

    exportTransactions() {
        this.showNotification('Transacciones exportadas', 'success');
    }

    refreshOverview() {
        this.updateWalletStats();
        this.updateCharts();
        this.showNotification('Datos actualizados', 'success');
    }

    filterTransactions() {
        // Implementar filtrado de transacciones
        this.showNotification('Filtros aplicados', 'info');
    }

    updateOverview() {
        this.updateWalletStats();
        this.updateRecentActivity();
        this.updateCharts();
    }

    updateSendSection() {
        this.updateTransactionSummary();
    }

    updateReceiveSection() {
        this.generateQRCode();
    }

    updateTransactionsSection() {
        // Actualizar lista de transacciones
        this.filterTransactions();
    }

    updateMiningSection() {
        // Actualizar datos de minería
    }

    updateStakingSection() {
        // Actualizar datos de staking
    }

    updateSecuritySection() {
        // Actualizar datos de seguridad
    }

    updateAnalyticsSection() {
        // Actualizar analytics
        this.updateCharts();
    }

    showNotification(message, type = 'info') {
        // Usar el sistema de notificaciones existente si está disponible
        if (window.showNotification) {
            window.showNotification(message, type);
        } else {
            console.log(`${type.toUpperCase()}: ${message}`);
        }
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', async () => {
    window.walletEpic = new WalletEpic();
    await window.walletEpic.init();
});

// Exportar para uso global
window.WalletEpic = WalletEpic; 