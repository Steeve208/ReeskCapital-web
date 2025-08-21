/* ================================
   BLOCKCHAIN DATA - RSC CHAIN REAL
================================ */

class BlockchainDataLoader {
    constructor() {
        this.stats = {
            totalSupply: 0,
            circulatingSupply: 0,
            totalStaked: 0,
            activeValidators: 0,
            totalTransactions: 0,
            currentPrice: 0,
            lastBlock: 0,
            lastTransaction: '',
            networkHashrate: 0,
            networkUsage: 0,
            tps: 0,
            nodes: 0
        };
        this.isConnected = false;
        this.lastUpdate = null;
        this.updateInterval = null;
        this.init();
    }

    async init() {
        console.log('🚀 Inicializando Blockchain Data Loader...');
        await this.checkConnection();
        await this.loadBlockchainStats();
        this.updateUI();
        this.startAutoRefresh();
    }

    async checkConnection() {
        try {
            const result = await blockchainConnection.checkConnection();
            this.isConnected = result.success;
            if (this.isConnected) {
                console.log('✅ Conectado a RSC Chain');
            } else {
                console.error('❌ Error de conexión con RSC Chain');
            }
        } catch (error) {
            console.error('Error verificando conexión:', error);
            this.isConnected = false;
        }
    }

    async loadBlockchainStats() {
        try {
            if (!this.isConnected) {
                await this.checkConnection();
            }

            if (!this.isConnected) {
                console.warn('⚠️ No conectado a RSC Chain, usando datos de respaldo');
                return;
            }

            // Obtener estadísticas de la blockchain
            const statsResult = await blockchainConnection.getBlockchainStats();
            
            if (statsResult.success) {
                const data = statsResult.data;
                this.stats = {
                    totalSupply: data.totalSupply || 0,
                    circulatingSupply: data.circulatingSupply || 0,
                    totalStaked: data.totalStaked || 0,
                    activeValidators: data.activeValidators || 0,
                    totalTransactions: data.totalTransactions || 0,
                    currentPrice: data.currentPrice || 0,
                    lastBlock: data.lastBlock || 0,
                    lastTransaction: data.lastTransaction || '',
                    networkHashrate: data.networkHashrate || 0,
                    networkUsage: data.networkUsage || 0,
                    tps: data.tps || 0,
                    nodes: data.nodes || 0
                };
                this.lastUpdate = new Date();
                console.log('📊 Estadísticas actualizadas:', this.stats);
            } else {
                console.error('Error cargando estadísticas:', statsResult.error);
            }
        } catch (error) {
            console.error('Error cargando estadísticas de blockchain:', error);
        }
    }

    updateUI() {
        // Actualizar estadísticas en la página principal
        const statElements = {
            'totalSupply': document.getElementById('totalSupply'),
            'circulatingSupply': document.getElementById('circulatingSupply'),
            'totalStaked': document.getElementById('totalStaked'),
            'activeValidators': document.getElementById('activeValidators'),
            'totalTransactions': document.getElementById('totalTransactions'),
            'currentPrice': document.getElementById('currentPrice'),
            'rscPrice': document.getElementById('rscPrice'),
            'rscSupply': document.getElementById('rscSupply'),
            'tpsValue': document.getElementById('tpsValue'),
            'nodesValue': document.getElementById('nodesValue'),
            'lastBlock': document.getElementById('lastBlock'),
            'lastTx': document.getElementById('lastTx'),
            'globalHashrate': document.getElementById('globalHashrate'),
            'networkUsage': document.getElementById('networkUsage')
        };

        Object.keys(statElements).forEach(key => {
            const element = statElements[key];
            if (element) {
                const value = this.stats[key] || this.stats[key.replace('Value', '')] || 0;
                
                if (key === 'currentPrice' || key === 'rscPrice') {
                    element.textContent = `$${value.toFixed(4)}`;
                } else if (key === 'lastBlock') {
                    element.textContent = `#${value.toLocaleString()}`;
                } else if (key === 'lastTx') {
                    element.textContent = value || 'Sin transacciones';
                } else if (key === 'globalHashrate') {
                    element.textContent = `${value} TH/s`;
                } else if (key === 'networkUsage') {
                    element.textContent = `${value}%`;
                } else {
                    element.textContent = this.formatNumber(value);
                }
            }
        });

        // Actualizar indicador de conexión
        this.updateConnectionStatus();
        
        // Actualizar gráficos si existen
        this.updateCharts();
    }

    updateConnectionStatus() {
        const connectionElements = document.querySelectorAll('.connection-status');
        connectionElements.forEach(element => {
            if (this.isConnected) {
                element.textContent = '🟢 Conectado';
                element.className = 'connection-status connected';
            } else {
                element.textContent = '🔴 Desconectado';
                element.className = 'connection-status disconnected';
            }
        });

        // Mostrar última actualización
        const lastUpdateElements = document.querySelectorAll('.last-update');
        if (this.lastUpdate) {
            const timeAgo = this.getTimeAgo(this.lastUpdate);
            lastUpdateElements.forEach(element => {
                element.textContent = `Última actualización: ${timeAgo}`;
            });
        }
    }

    getTimeAgo(date) {
        const now = new Date();
        const diff = now - date;
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);

        if (seconds < 60) return `${seconds}s`;
        if (minutes < 60) return `${minutes}m`;
        return `${hours}h`;
    }

    formatNumber(num) {
        if (num >= 1000000000) {
            return (num / 1000000000).toFixed(1) + 'B';
        } else if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toLocaleString();
    }

    updateCharts() {
        // Actualizar gráficos con datos reales si existen
        const chartElements = document.querySelectorAll('[data-chart]');
        chartElements.forEach(element => {
            const chartType = element.dataset.chart;
            this.updateSpecificChart(chartType, element);
        });
    }

    updateSpecificChart(chartType, element) {
        switch (chartType) {
            case 'price':
                this.updatePriceChart(element);
                break;
            case 'staking':
                this.updateStakingChart(element);
                break;
            case 'transactions':
                this.updateTransactionsChart(element);
                break;
            case 'tps':
                this.updateTPSChart(element);
                break;
        }
    }

    updatePriceChart(element) {
        if (window.Chart && element && this.stats.currentPrice > 0) {
            const ctx = element.getContext('2d');
            
            new Chart(ctx, {
                type: 'line',
                data: {
                    labels: ['Precio RSC'],
                    datasets: [{
                        label: 'RSC Price',
                        data: [this.stats.currentPrice],
                        borderColor: '#3fd8c2',
                        backgroundColor: 'rgba(63, 216, 194, 0.1)',
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        x: { display: false },
                        y: { display: false }
                    }
                }
            });
        }
    }

    updateStakingChart(element) {
        if (window.Chart && element && this.stats.circulatingSupply > 0) {
            const ctx = element.getContext('2d');
            const stakingPercentage = (this.stats.totalStaked / this.stats.circulatingSupply) * 100;
            
            new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: ['Staked', 'Available'],
                    datasets: [{
                        data: [stakingPercentage, 100 - stakingPercentage],
                        backgroundColor: ['#3fd8c2', '#2a2a2a'],
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } }
                }
            });
        }
    }

    updateTransactionsChart(element) {
        if (window.Chart && element && this.stats.totalTransactions > 0) {
            const ctx = element.getContext('2d');
            
            new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: ['Total Transacciones'],
                    datasets: [{
                        label: 'Transactions',
                        data: [this.stats.totalTransactions],
                        backgroundColor: '#7657fc',
                        borderColor: '#7657fc',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        x: { display: false },
                        y: { display: false }
                    }
                }
            });
        }
    }

    updateTPSChart(element) {
        if (window.Chart && element && this.stats.tps > 0) {
            const ctx = element.getContext('2d');
            
            new Chart(ctx, {
                type: 'line',
                data: {
                    labels: ['TPS Actual'],
                    datasets: [{
                        label: 'TPS',
                        data: [this.stats.tps],
                        borderColor: '#00FF88',
                        backgroundColor: 'rgba(0, 255, 136, 0.1)',
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        x: { display: false },
                        y: { display: false }
                    }
                }
            });
        }
    }

    startAutoRefresh() {
        // Actualizar datos cada 30 segundos
        this.updateInterval = setInterval(async () => {
            await this.loadBlockchainStats();
            this.updateUI();
        }, 30000);
    }

    // Método para obtener datos específicos
    async getSpecificData(endpoint) {
        try {
            if (!this.isConnected) {
                return null;
            }

            switch (endpoint) {
                case 'blocks':
                    return await blockchainConnection.getRecentBlocks();
                case 'transactions':
                    return await blockchainConnection.getRecentTransactions();
                case 'staking-pools':
                    return await blockchainConnection.getStakingPools();
                case 'validators':
                    return await blockchainConnection.getValidators();
                default:
                    console.warn(`Endpoint no reconocido: ${endpoint}`);
                    return null;
            }
        } catch (error) {
            console.error(`Error cargando ${endpoint}:`, error);
            return null;
        }
    }

    // Método para forzar actualización
    async forceUpdate() {
        await this.loadBlockchainStats();
        this.updateUI();
    }

    // Método para obtener estado de conexión
    getConnectionStatus() {
        return {
            isConnected: this.isConnected,
            lastUpdate: this.lastUpdate,
            stats: this.stats
        };
    }

    // Método para limpiar recursos
    destroy() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
    }
}

// ===== ESTADÍSTICAS ÉPICAS - RSC CHAIN REAL =====

class EpicBlockchainStats {
    constructor() {
        this.stats = {
            price: 0,
            supply: 0,
            tps: 0,
            nodes: 0,
            lastBlock: 0,
            lastTx: '',
            globalHashrate: 0,
            networkUsage: 0
        };
        this.updateInterval = null;
        this.chartInstances = {};
        this.init();
    }

    init() {
        this.setupElements();
        this.initializeCharts();
        this.startRealTimeUpdates();
        this.setupAnimations();
        console.log('🚀 Estadísticas épicas inicializadas');
    }

    setupElements() {
        this.elements = {
            price: document.getElementById('rscPrice'),
            supply: document.getElementById('rscSupply'),
            tps: document.getElementById('tpsValue'),
            nodes: document.getElementById('nodesValue'),
            priceChange: document.getElementById('priceChange'),
            lastBlock: document.getElementById('lastBlock'),
            lastTx: document.getElementById('lastTx'),
            globalHashrate: document.getElementById('globalHashrate'),
            networkUsage: document.getElementById('networkUsage'),
            tpsGraph: document.getElementById('tpsGraph')
        };
    }

    initializeCharts() {
        // Gráfico TPS
        if (this.elements.tpsGraph) {
            const ctx = this.elements.tpsGraph.getContext('2d');
            this.chartInstances.tps = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: Array(20).fill(''),
                    datasets: [{
                        label: 'TPS',
                        data: Array(20).fill(0),
                        borderColor: '#00FF88',
                        backgroundColor: 'rgba(0, 255, 136, 0.1)',
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4,
                        pointRadius: 0
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false }
                    },
                    scales: {
                        x: { display: false },
                        y: { display: false }
                    },
                    animation: {
                        duration: 0
                    }
                }
            });
        }
    }

    startRealTimeUpdates() {
        // Actualización inmediata
        this.updateStats();
        
        // Actualización cada 10 segundos
        this.updateInterval = setInterval(() => {
            this.updateStats();
        }, 10000);
    }

    async updateStats() {
        try {
            // Obtener datos reales de la blockchain
            if (window.blockchainConnection && window.blockchainConnection.isConnected) {
                const statsResult = await window.blockchainConnection.getBlockchainStats();
                
                if (statsResult.success) {
                    const data = statsResult.data;
                    this.stats = {
                        price: data.currentPrice || 0,
                        supply: data.circulatingSupply || 0,
                        tps: data.tps || 0,
                        nodes: data.nodes || 0,
                        lastBlock: data.lastBlock || 0,
                        lastTx: data.lastTransaction || '',
                        globalHashrate: data.networkHashrate || 0,
                        networkUsage: data.networkUsage || 0
                    };
                    
                    // Actualizar UI con datos reales
                    await this.updateStatWithAnimation('price', this.stats.price, '$');
                    await this.updateStatWithAnimation('supply', this.stats.supply, '');
                    await this.updateStatWithAnimation('tps', this.stats.tps, '');
                    await this.updateStatWithAnimation('nodes', this.stats.nodes, '');
                    
                    // Actualizar datos técnicos
                    this.updateTechnicalStats(this.stats);
                    
                    // Actualizar gráficos
                    this.updateCharts(this.stats);
                    
                    // Efectos visuales
                    this.triggerVisualEffects();
                } else {
                    console.warn('⚠️ Error obteniendo datos de la blockchain');
                    this.showFallbackData();
                }
            } else {
                console.warn('⚠️ No conectado a la blockchain');
                this.showFallbackData();
            }
            
        } catch (error) {
            console.error('❌ Error al actualizar estadísticas:', error);
            this.showFallbackData();
        }
    }

    async updateStatWithAnimation(elementId, newValue, prefix = '') {
        const element = this.elements[elementId];
        if (!element) return;

        const currentValue = parseFloat(element.textContent.replace(/[^0-9.-]/g, '')) || 0;
        const targetValue = newValue;
        const duration = 1000; // 1 segundo
        const steps = 60;
        const increment = (targetValue - currentValue) / steps;
        const stepDuration = duration / steps;

        // Agregar clase de actualización
        element.classList.add('updating');

        for (let i = 0; i < steps; i++) {
            await new Promise(resolve => setTimeout(resolve, stepDuration));
            const currentStep = currentValue + (increment * i);
            
            if (elementId === 'price') {
                element.textContent = prefix + currentStep.toFixed(4);
            } else if (elementId === 'supply') {
                element.textContent = this.formatNumber(currentStep);
            } else {
                element.textContent = this.formatNumber(currentStep);
            }
        }

        // Valor final
        if (elementId === 'price') {
            element.textContent = prefix + targetValue.toFixed(4);
        } else if (elementId === 'supply') {
            element.textContent = this.formatNumber(targetValue);
        } else {
            element.textContent = this.formatNumber(targetValue);
        }

        // Remover clase de actualización
        element.classList.remove('updating');
        
        // Efecto de parpadeo
        this.blinkEffect(element);
    }

    updateTechnicalStats(data) {
        if (this.elements.lastBlock) {
            this.elements.lastBlock.textContent = '#' + data.lastBlock.toLocaleString();
        }
        
        if (this.elements.lastTx) {
            this.elements.lastTx.textContent = data.lastTx || 'Sin transacciones';
        }
        
        if (this.elements.globalHashrate) {
            this.elements.globalHashrate.textContent = data.globalHashrate + ' TH/s';
        }
        
        if (this.elements.networkUsage) {
            this.elements.networkUsage.textContent = data.networkUsage + '%';
        }
    }

    updateCharts(data) {
        if (this.chartInstances.tps) {
            const chart = this.chartInstances.tps;
            const dataset = chart.data.datasets[0];
            
            // Agregar nuevo dato
            dataset.data.push(data.tps);
            dataset.data.shift();
            
            // Actualizar gráfico
            chart.update('none');
        }
    }

    formatNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toLocaleString();
    }

    blinkEffect(element) {
        element.style.animation = 'none';
        element.offsetHeight; // Trigger reflow
        element.style.animation = 'blink 0.5s ease-in-out';
    }

    triggerVisualEffects() {
        // Efecto de partículas en las tarjetas
        const statCards = document.querySelectorAll('.stat-card-epic');
        statCards.forEach((card, index) => {
            setTimeout(() => {
                this.createParticleEffect(card);
            }, index * 200);
        });

        // Efecto de energía en el hero
        if (window.epicHero3D) {
            window.epicHero3D.setIntensity(0.8);
            setTimeout(() => {
                window.epicHero3D.setIntensity(0.3);
            }, 500);
        }
    }

    createParticleEffect(element) {
        const rect = element.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        // Crear partículas
        for (let i = 0; i < 5; i++) {
            const particle = document.createElement('div');
            particle.className = 'stat-particle';
            particle.style.cssText = `
                position: fixed;
                left: ${centerX}px;
                top: ${centerY}px;
                width: 4px;
                height: 4px;
                background: #00FF88;
                border-radius: 50%;
                pointer-events: none;
                z-index: 1000;
                animation: particleFloat 1s ease-out forwards;
            `;

            document.body.appendChild(particle);

            // Animar partícula
            const angle = (i / 5) * Math.PI * 2;
            const distance = 50;
            const targetX = centerX + Math.cos(angle) * distance;
            const targetY = centerY + Math.sin(angle) * distance;

            setTimeout(() => {
                particle.style.transform = `translate(${targetX - centerX}px, ${targetY - centerY}px)`;
                particle.style.opacity = '0';
            }, 100);

            // Remover partícula
            setTimeout(() => {
                if (particle.parentNode) {
                    particle.parentNode.removeChild(particle);
                }
            }, 1000);
        }
    }

    setupAnimations() {
        // Animación de entrada para las tarjetas
        const statCards = document.querySelectorAll('.stat-card-epic');
        statCards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(50px)';
            
            setTimeout(() => {
                card.style.transition = 'all 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 200);
        });

        // Animación de los indicadores de estado
        const statusIndicators = document.querySelectorAll('.stat-status');
        statusIndicators.forEach((indicator, index) => {
            setTimeout(() => {
                indicator.style.animation = 'pulse 2s infinite';
            }, index * 100);
        });
    }

    showFallbackData() {
        console.warn('⚠️ No se pueden cargar datos de la blockchain');
        
        // En lugar de mostrar datos simulados, mostrar indicadores de error
        if (this.elements.price) this.elements.price.textContent = '--';
        if (this.elements.supply) this.elements.supply.textContent = '--';
        if (this.elements.tps) this.elements.tps.textContent = '--';
        if (this.elements.nodes) this.elements.nodes.textContent = '--';
        
        // Mostrar mensaje de error en la UI
        this.showConnectionError();
    }

    showConnectionError() {
        // Crear o actualizar mensaje de error
        let errorElement = document.getElementById('blockchain-error');
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.id = 'blockchain-error';
            errorElement.className = 'blockchain-error-message';
            errorElement.innerHTML = `
                <div class="error-content">
                    <span class="error-icon">⚠️</span>
                    <span class="error-text">No se puede conectar a RSC Chain</span>
                    <button class="retry-btn" onclick="window.epicBlockchainStats.forceUpdate()">Reintentar</button>
                </div>
            `;
            
            // Insertar después del hero
            const heroSection = document.querySelector('.hero-epic');
            if (heroSection) {
                heroSection.parentNode.insertBefore(errorElement, heroSection.nextSibling);
            }
        }
        
        // Mostrar el error
        errorElement.style.display = 'block';
    }

    // Métodos públicos para control externo
    forceUpdate() {
        this.updateStats();
    }

    setUpdateInterval(seconds) {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
        this.updateInterval = setInterval(() => {
            this.updateStats();
        }, seconds * 1000);
    }

    destroy() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
        
        // Destruir gráficos
        Object.values(this.chartInstances).forEach(chart => {
            if (chart && chart.destroy) {
                chart.destroy();
            }
        });
    }
}

// CSS para animaciones
const style = document.createElement('style');
style.textContent = `
  @keyframes blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
  
  @keyframes particleFloat {
    0% {
      opacity: 1;
      transform: scale(1);
    }
    100% {
      opacity: 0;
      transform: scale(0);
    }
  }
  
  .stat-value.updating {
    color: #00FF88 !important;
    text-shadow: 0 0 10px rgba(0, 255, 136, 0.5);
  }
  
  .stat-card-epic:hover .stat-particles {
    opacity: 1;
  }
  
  .connection-status {
    font-size: 0.8em;
    padding: 2px 8px;
    border-radius: 12px;
    font-weight: bold;
  }
  
  .connection-status.connected {
    background: rgba(0, 255, 136, 0.2);
    color: #00FF88;
  }
  
  .connection-status.disconnected {
    background: rgba(255, 0, 0, 0.2);
    color: #ff4444;
  }
  
  .last-update {
    font-size: 0.7em;
    color: #888;
    font-style: italic;
  }
`;
document.head.appendChild(style);

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.blockchainData = new BlockchainDataLoader();
    window.epicBlockchainStats = new EpicBlockchainStats();
});

// Exportar para uso global
window.BlockchainDataLoader = BlockchainDataLoader; 