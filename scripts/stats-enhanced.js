// ===== STATS-ENHANCED.JS - ESTADÍSTICAS MEJORADAS =====

class StatsManager {
  constructor() {
    this.statsElements = {
      'marketCap': document.getElementById('marketCap'),
      'volume24h': document.getElementById('volume24h'),
      'totalBlocks': document.getElementById('totalBlocks'),
      'activeUsers': document.getElementById('activeUsers'),
      'rscPrice': document.getElementById('rscPrice'),
      'rscSupply': document.getElementById('rscSupply'),
      'tpsValue': document.getElementById('tpsValue'),
      'nodesValue': document.getElementById('nodesValue'),
      'priceChange': document.getElementById('priceChange'),
      'dashboardPrice': document.getElementById('dashboardPrice'),
      'dashboardSupply': document.getElementById('dashboardSupply')
    };
    
    this.updateInterval = 10000; // 10 segundos
    this.isUpdating = false;
    
    this.init();
  }

  init() {
    console.log('🚀 Inicializando Stats Manager...');
    
    // Cargar datos iniciales
    this.loadStats();
    
    // Configurar auto-refresh
    setInterval(() => {
      this.loadStats();
    }, this.updateInterval);
    
    // Configurar contadores animados
    this.setupCounters();
  }

  async loadStats() {
    if (this.isUpdating) return;
    
    this.isUpdating = true;
    
    try {
      // Intentar cargar datos reales de la API
      const response = await fetch('/api/stats');
      let data;
      
      if (response.ok) {
        data = await response.json();
        console.log('✅ Datos reales cargados:', data);
      } else {
        // Fallback a datos simulados si la API no está disponible
        data = this.generateMockData();
        console.log('⚠️ Usando datos simulados');
      }
      
      this.updateStats(data);
      
    } catch (error) {
      console.error('❌ Error cargando stats:', error);
      // Usar datos simulados en caso de error
      const mockData = this.generateMockData();
      this.updateStats(mockData);
    }
    
    this.isUpdating = false;
  }

  generateMockData() {
    return {
      market_cap: (Math.random() * 1000000 + 100000).toFixed(0),
      volume_24h: (Math.random() * 500000 + 50000).toFixed(0),
      total_blocks: Math.floor(Math.random() * 1000000),
      active_users: Math.floor(Math.random() * 10000),
      rsc_price: (Math.random() * 10 + 0.1).toFixed(2),
      rsc_supply: Math.floor(Math.random() * 1000000),
      tps: Math.floor(Math.random() * 1000),
      nodes: Math.floor(Math.random() * 100),
      price_change: (Math.random() * 20 - 10).toFixed(2)
    };
  }

  updateStats(data) {
    // Actualizar cada elemento con animación
    const updates = [
      { id: 'marketCap', value: `$${parseInt(data.market_cap).toLocaleString()}` },
      { id: 'volume24h', value: `$${parseInt(data.volume_24h).toLocaleString()}` },
      { id: 'totalBlocks', value: data.total_blocks.toLocaleString() },
      { id: 'activeUsers', value: data.active_users.toLocaleString() },
      { id: 'rscPrice', value: `$${data.rsc_price}` },
      { id: 'rscSupply', value: data.rsc_supply.toLocaleString() },
      { id: 'tpsValue', value: data.tps },
      { id: 'nodesValue', value: data.nodes },
      { id: 'dashboardPrice', value: `$${data.rsc_price}` },
      { id: 'dashboardSupply', value: data.rsc_supply.toLocaleString() }
    ];

    // Actualizar price change con color
    const priceChangeElement = this.statsElements['priceChange'];
    if (priceChangeElement) {
      const change = parseFloat(data.price_change);
      const sign = change >= 0 ? '+' : '';
      priceChangeElement.textContent = `${sign}${change}%`;
      priceChangeElement.style.color = change >= 0 ? '#00ff88' : '#ff6b6b';
    }

    // Aplicar actualizaciones con animación
    updates.forEach(update => {
      const element = this.statsElements[update.id];
      if (element) {
        this.animateValueChange(element, update.value);
      }
    });
  }

  animateValueChange(element, newValue) {
    const oldValue = element.textContent;
    
    if (oldValue !== newValue) {
      // Efecto de parpadeo
      element.classList.add('updating');
      
      setTimeout(() => {
        element.textContent = newValue;
        element.classList.remove('updating');
        
        // Efecto de escala
        element.style.transform = 'scale(1.1)';
        element.style.color = '#00ff88';
        
        setTimeout(() => {
          element.style.transform = 'scale(1)';
          element.style.color = '';
        }, 200);
        
      }, 150);
    }
  }

  setupCounters() {
    // Configurar contadores animados para elementos que no se actualizan frecuentemente
    const staticElements = ['totalBlocks', 'activeUsers'];
    
    staticElements.forEach(id => {
      const element = this.statsElements[id];
      if (element) {
        const finalValue = parseInt(element.textContent.replace(/,/g, ''));
        this.animateCounter(element, 0, finalValue, 2000);
      }
    });
  }

  animateCounter(element, start, end, duration) {
    const startTime = performance.now();
    const startValue = start;
    const endValue = end;
    
    const updateCounter = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Función de easing
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentValue = Math.floor(startValue + (endValue - startValue) * easeOutQuart);
      
      element.textContent = currentValue.toLocaleString();
      
      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      }
    };
    
    requestAnimationFrame(updateCounter);
  }

  // Método para forzar actualización manual
  forceUpdate() {
    this.loadStats();
  }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  new StatsManager();
});

// Exportar para uso global
window.StatsManager = StatsManager; 