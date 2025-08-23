/* ================================
   CHARTS.JS — GRÁFICOS EN TIEMPO REAL
================================ */

class ChartManager {
  constructor() {
    this.charts = new Map();
    this.dataSources = new Map();
    this.updateIntervals = new Map();
    this.init();
  }

  init() {
    this.setupCharts();
    this.startRealTimeUpdates();
  }

  setupCharts() {
    // Gráfico de precio RSC
    this.createPriceChart();
    
    // Gráfico de volumen de transacciones
    this.createVolumeChart();
    
    // Gráfico de staking
    this.createStakingChart();
    
    // Gráfico de minería
    this.createMiningChart();
  }

  createPriceChart() {
    const ctx = document.getElementById('priceChart');
    if (!ctx) return;

    const chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: [],
        datasets: [{
          label: 'Precio RSC (USD)',
          data: [],
          borderColor: '#7657fc',
          backgroundColor: 'rgba(118, 87, 252, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointRadius: 0,
          pointHoverRadius: 6,
          pointHoverBackgroundColor: '#7657fc'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: '#ffffff',
            bodyColor: '#ffffff',
            borderColor: '#7657fc',
            borderWidth: 1
          }
        },
        scales: {
          x: {
            display: false,
            grid: {
              display: false
            }
          },
          y: {
            display: true,
            grid: {
              color: 'rgba(255, 255, 255, 0.1)'
            },
            ticks: {
              color: '#ffffff',
              font: {
                size: 12
              }
            }
          }
        },
        interaction: {
          mode: 'nearest',
          axis: 'x',
          intersect: false
        }
      }
    });

    this.charts.set('price', chart);
    this.dataSources.set('price', []);
  }

  createVolumeChart() {
    const ctx = document.getElementById('volumeChart');
    if (!ctx) return;

    const chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: [],
        datasets: [{
          label: 'Volumen (RSC)',
          data: [],
          backgroundColor: 'rgba(16, 185, 129, 0.8)',
          borderColor: '#10b981',
          borderWidth: 1,
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: '#ffffff',
            bodyColor: '#ffffff',
            borderColor: '#10b981',
            borderWidth: 1
          }
        },
        scales: {
          x: {
            display: false,
            grid: {
              display: false
            }
          },
          y: {
            display: true,
            grid: {
              color: 'rgba(255, 255, 255, 0.1)'
            },
            ticks: {
              color: '#ffffff',
              font: {
                size: 12
              }
            }
          }
        }
      }
    });

    this.charts.set('volume', chart);
    this.dataSources.set('volume', []);
  }

  createStakingChart() {
    const ctx = document.getElementById('stakingChart');
    if (!ctx) return;

    const chart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Staked', 'Available'],
        datasets: [{
          data: [0, 100],
          backgroundColor: [
            '#7657fc',
            'rgba(118, 87, 252, 0.2)'
          ],
          borderColor: [
            '#7657fc',
            '#7657fc'
          ],
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: '#ffffff',
              font: {
                size: 12
              }
            }
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: '#ffffff',
            bodyColor: '#ffffff',
            borderColor: '#7657fc',
            borderWidth: 1
          }
        }
      }
    });

    this.charts.set('staking', chart);
  }

  createMiningChart() {
    const ctx = document.getElementById('miningChart');
    if (!ctx) return;

    const chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: [],
        datasets: [{
          label: 'Hash Rate (H/s)',
          data: [],
          borderColor: '#f59e0b',
          backgroundColor: 'rgba(245, 158, 11, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointRadius: 0,
          pointHoverRadius: 6,
          pointHoverBackgroundColor: '#f59e0b'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: '#ffffff',
            bodyColor: '#ffffff',
            borderColor: '#f59e0b',
            borderWidth: 1
          }
        },
        scales: {
          x: {
            display: false,
            grid: {
              display: false
            }
          },
          y: {
            display: true,
            grid: {
              color: 'rgba(255, 255, 255, 0.1)'
            },
            ticks: {
              color: '#ffffff',
              font: {
                size: 12
              }
            }
          }
        },
        interaction: {
          mode: 'nearest',
          axis: 'x',
          intersect: false
        }
      }
    });

    this.charts.set('mining', chart);
    this.dataSources.set('mining', []);
  }

  updatePriceChart(price) {
    const chart = this.charts.get('price');
    const dataSource = this.dataSources.get('price');
    
    if (!chart || !dataSource) return;

    const now = new Date();
    const timeLabel = now.toLocaleTimeString();
    
    dataSource.push({
      x: timeLabel,
      y: price
    });

    // Mantener solo los últimos 50 puntos
    if (dataSource.length > 50) {
      dataSource.shift();
    }

    chart.data.labels = dataSource.map(d => d.x);
    chart.data.datasets[0].data = dataSource.map(d => d.y);
    chart.update('none');
  }

  updateVolumeChart(volume) {
    const chart = this.charts.get('volume');
    const dataSource = this.dataSources.get('volume');
    
    if (!chart || !dataSource) return;

    const now = new Date();
    const timeLabel = now.toLocaleTimeString();
    
    dataSource.push({
      x: timeLabel,
      y: volume
    });

    // Mantener solo los últimos 20 puntos
    if (dataSource.length > 20) {
      dataSource.shift();
    }

    chart.data.labels = dataSource.map(d => d.x);
    chart.data.datasets[0].data = dataSource.map(d => d.y);
    chart.update('none');
  }

  updateStakingChart(staked, total) {
    const chart = this.charts.get('staking');
    if (!chart) return;

    const available = total - staked;
    const stakedPercentage = (staked / total) * 100;

    chart.data.datasets[0].data = [stakedPercentage, 100 - stakedPercentage];
    chart.update('none');
  }

  updateMiningChart(hashRate) {
    const chart = this.charts.get('mining');
    const dataSource = this.dataSources.get('mining');
    
    if (!chart || !dataSource) return;

    const now = new Date();
    const timeLabel = now.toLocaleTimeString();
    
    dataSource.push({
      x: timeLabel,
      y: hashRate
    });

    // Mantener solo los últimos 30 puntos
    if (dataSource.length > 30) {
      dataSource.shift();
    }

    chart.data.labels = dataSource.map(d => d.x);
    chart.data.datasets[0].data = dataSource.map(d => d.y);
    chart.update('none');
  }

  startRealTimeUpdates() {
    // Actualizar precio cada 30 segundos
    this.updateIntervals.set('price', setInterval(() => {
      this.fetchPriceData();
    }, 30000));

    // Actualizar volumen cada 60 segundos
    this.updateIntervals.set('volume', setInterval(() => {
      this.fetchVolumeData();
    }, 60000));

    // Actualizar datos de staking cada 2 minutos
    this.updateIntervals.set('staking', setInterval(() => {
      this.fetchStakingData();
    }, 120000));

    // Actualizar datos de minería cada 10 segundos
    this.updateIntervals.set('mining', setInterval(() => {
      this.fetchMiningData();
    }, 10000));

    // Cargar datos iniciales
    this.fetchPriceData();
    this.fetchVolumeData();
    this.fetchStakingData();
    this.fetchMiningData();
  }

  async fetchPriceData() {
    try {
      const response = await apiRequest('/blockchain/stats');
      if (response.success && response.data.stats) {
        const price = response.data.stats.price || 0;
        this.updatePriceChart(price);
      }
    } catch (error) {
      console.error('Error fetching price data:', error);
      // Fallback a precio 0 si no hay conexión
      this.updatePriceChart(0);
    }
  }

  async fetchVolumeData() {
    try {
      const response = await apiRequest('/blockchain/stats');
      if (response.success && response.data.stats) {
        const volume = response.data.stats.dailyVolume || 0;
        this.updateVolumeChart(volume);
      }
    } catch (error) {
      console.error('Error fetching volume data:', error);
      // Fallback a volumen 0 si no hay conexión
      this.updateVolumeChart(0);
    }
  }

  async fetchStakingData() {
    try {
      const response = await apiRequest('/staking/pools');
      if (response.success && response.data.pools) {
        const totalStaked = response.data.pools.reduce((sum, pool) => sum + pool.totalStaked, 0);
        const totalSupply = 1000000000; // Supply total de RSC
        this.updateStakingChart(totalStaked, totalSupply);
      }
    } catch (error) {
      console.error('Error fetching staking data:', error);
    }
  }

  async fetchMiningData() {
    try {
      // Intentar obtener datos reales de minería
      const response = await apiRequest('/mining/stats');
      if (response.success && response.data.stats) {
        const hashRate = response.data.stats.hashRate || 0;
        this.updateMiningChart(hashRate);
      } else {
        // Fallback a hashRate 0 si no hay datos
        this.updateMiningChart(0);
      }
    } catch (error) {
      console.error('Error fetching mining data:', error);
      // Fallback a hashRate 0 si no hay conexión
      this.updateMiningChart(0);
    }
  }

  destroy() {
    // Limpiar todos los intervalos
    this.updateIntervals.forEach(interval => {
      clearInterval(interval);
    });
    
    // Destruir todos los gráficos
    this.charts.forEach(chart => {
      chart.destroy();
    });
    
    this.charts.clear();
    this.dataSources.clear();
    this.updateIntervals.clear();
  }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  window.chartManager = new ChartManager();
});

// Exportar para uso global
window.ChartManager = ChartManager; 