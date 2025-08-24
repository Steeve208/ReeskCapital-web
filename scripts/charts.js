/* ================================
   CHARTS.JS — GRÁFICOS FUNCIONALES PARA WALLET
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
    // Gráfico de balance principal
    this.createBalanceChart();
    
    // Gráfico de transacciones
    this.createTransactionsChart();
    
    // Gráfico de minería
    this.createMiningChart();
    
    // Gráfico de staking
    this.createStakingChart();
    
    // Gráficos de analytics
    this.createBalanceHistoryChart();
    this.createAssetsDistributionChart();
    this.createMonthlyActivityChart();
    this.createPredictionsChart();
  }

  createBalanceChart() {
    const ctx = document.getElementById('balanceChart');
    if (!ctx) return;

    const chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: this.generateTimeLabels(24),
        datasets: [{
          label: 'Balance RSC',
          data: this.generateMockData(24, 0.000001, 0.000100),
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointRadius: 0,
          pointHoverRadius: 4,
          pointHoverBackgroundColor: '#10b981'
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
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            titleColor: '#ffffff',
            bodyColor: '#ffffff',
            borderColor: '#10b981',
            borderWidth: 1,
            callbacks: {
              label: function(context) {
                return `Balance: ${context.parsed.y.toFixed(6)} RSC`;
              }
            }
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
                size: 10
              },
              callback: function(value) {
                return value.toFixed(6);
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

    this.charts.set('balance', chart);
  }

  createTransactionsChart() {
    const ctx = document.getElementById('transactionsChart');
    if (!ctx) return;

    const chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: this.generateTimeLabels(7),
        datasets: [{
          label: 'Transacciones',
          data: this.generateMockData(7, 0, 50),
          backgroundColor: 'rgba(59, 130, 246, 0.8)',
          borderColor: '#3b82f6',
          borderWidth: 1,
          borderRadius: 4,
          borderSkipped: false
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
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            titleColor: '#ffffff',
            bodyColor: '#ffffff',
            borderColor: '#3b82f6',
            borderWidth: 1
          }
        },
        scales: {
          x: {
            display: true,
            grid: {
              display: false
            },
            ticks: {
              color: '#ffffff',
              font: {
                size: 10
              }
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
                size: 10
              },
              stepSize: 10
            }
          }
        }
      }
    });

    this.charts.set('transactions', chart);
  }

  createMiningChart() {
    const ctx = document.getElementById('miningChart');
    if (!ctx) return;

    const chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: this.generateTimeLabels(12),
        datasets: [{
          label: 'Hash Rate (H/s)',
          data: this.generateMockData(12, 1000, 50000),
          borderColor: '#f59e0b',
          backgroundColor: 'rgba(245, 158, 11, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointRadius: 0,
          pointHoverRadius: 4,
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
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            titleColor: '#ffffff',
            bodyColor: '#ffffff',
            borderColor: '#f59e0b',
            borderWidth: 1,
            callbacks: {
              label: function(context) {
                return `Hash Rate: ${context.parsed.y.toLocaleString()} H/s`;
              }
            }
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
                size: 10
              },
              callback: function(value) {
                return value.toLocaleString();
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
  }

  createStakingChart() {
    const ctx = document.getElementById('stakingChart');
    if (!ctx) return;

    const chart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Staked', 'Available', 'Rewards'],
        datasets: [{
          data: [65, 25, 10],
          backgroundColor: [
            'rgba(16, 185, 129, 0.8)',
            'rgba(59, 130, 246, 0.8)',
            'rgba(245, 158, 11, 0.8)'
          ],
          borderColor: [
            '#10b981',
            '#3b82f6',
            '#f59e0b'
          ],
          borderWidth: 2,
          hoverOffset: 4
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
              },
              padding: 20
            }
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            titleColor: '#ffffff',
            bodyColor: '#ffffff',
            borderColor: '#10b981',
            borderWidth: 1,
            callbacks: {
              label: function(context) {
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage = ((context.parsed / total) * 100).toFixed(1);
                return `${context.label}: ${percentage}%`;
              }
            }
          }
        }
      }
    });

    this.charts.set('staking', chart);
  }

  createBalanceHistoryChart() {
    const ctx = document.getElementById('balanceHistoryChart');
    if (!ctx) return;

    const chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: this.generateTimeLabels(30),
        datasets: [{
          label: 'Balance Histórico',
          data: this.generateMockData(30, 0.000001, 0.000200),
          borderColor: '#8b5cf6',
          backgroundColor: 'rgba(139, 92, 246, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointRadius: 0,
          pointHoverRadius: 6,
          pointHoverBackgroundColor: '#8b5cf6'
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
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            titleColor: '#ffffff',
            bodyColor: '#ffffff',
            borderColor: '#8b5cf6',
            borderWidth: 1
          }
        },
        scales: {
          x: {
            display: true,
            grid: {
              color: 'rgba(255, 255, 255, 0.1)'
            },
            ticks: {
              color: '#ffffff',
              font: {
                size: 11
              }
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
                size: 11
              }
            }
          }
        }
      }
    });

    this.charts.set('balanceHistory', chart);
  }

  createAssetsDistributionChart() {
    const ctx = document.getElementById('assetsDistributionChart');
    if (!ctx) return;

    const chart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: ['RSC', 'BTC', 'ETH', 'USDT', 'Otros'],
        datasets: [{
          data: [45, 20, 15, 15, 5],
          backgroundColor: [
            'rgba(16, 185, 129, 0.8)',
            'rgba(245, 158, 11, 0.8)',
            'rgba(59, 130, 246, 0.8)',
            'rgba(34, 197, 94, 0.8)',
            'rgba(156, 163, 175, 0.8)'
          ],
          borderColor: [
            '#10b981',
            '#f59e0b',
            '#3b82f6',
            '#22c55e',
            '#9ca3af'
          ],
          borderWidth: 2,
          hoverOffset: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
            labels: {
              color: '#ffffff',
              font: {
                size: 12
              },
              padding: 15
            }
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            titleColor: '#ffffff',
            bodyColor: '#ffffff',
            borderColor: '#10b981',
            borderWidth: 1
          }
        }
      }
    });

    this.charts.set('assetsDistribution', chart);
  }

  createMonthlyActivityChart() {
    const ctx = document.getElementById('monthlyActivityChart');
    if (!ctx) return;

    const chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
        datasets: [{
          label: 'Actividad Mensual',
          data: this.generateMockData(12, 50, 200),
          backgroundColor: 'rgba(59, 130, 246, 0.8)',
          borderColor: '#3b82f6',
          borderWidth: 1,
          borderRadius: 6,
          borderSkipped: false
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
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            titleColor: '#ffffff',
            bodyColor: '#ffffff',
            borderColor: '#3b82f6',
            borderWidth: 1
          }
        },
        scales: {
          x: {
            display: true,
            grid: {
              display: false
            },
            ticks: {
              color: '#ffffff',
              font: {
                size: 11
              }
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
                size: 11
              }
            }
          }
        }
      }
    });

    this.charts.set('monthlyActivity', chart);
  }

  createPredictionsChart() {
    const ctx = document.getElementById('predictionsChart');
    if (!ctx) return;

    const chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: this.generateTimeLabels(15),
        datasets: [{
          label: 'Predicción de Precio',
          data: this.generateMockData(15, 0.000001, 0.000150),
          borderColor: '#ef4444',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          borderWidth: 2,
          fill: false,
          tension: 0.4,
          pointRadius: 0,
          pointHoverRadius: 4,
          pointHoverBackgroundColor: '#ef4444',
          borderDash: [5, 5]
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
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            titleColor: '#ffffff',
            bodyColor: '#ffffff',
            borderColor: '#ef4444',
            borderWidth: 1
          }
        },
        scales: {
          x: {
            display: true,
            grid: {
              color: 'rgba(255, 255, 255, 0.1)'
            },
            ticks: {
              color: '#ffffff',
              font: {
                size: 11
              }
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
                size: 11
              }
            }
          }
        }
      }
    });

    this.charts.set('predictions', chart);
  }

  generateTimeLabels(count) {
    const labels = [];
    const now = new Date();
    
    for (let i = count - 1; i >= 0; i--) {
      const time = new Date(now.getTime() - (i * 60 * 60 * 1000)); // Cada hora
      labels.push(time.toLocaleTimeString('es-ES', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }));
    }
    
    return labels;
  }

  generateMockData(count, min, max) {
    const data = [];
    for (let i = 0; i < count; i++) {
      data.push(Math.random() * (max - min) + min);
    }
    return data;
  }

  startRealTimeUpdates() {
    // Actualizar gráficos cada 30 segundos
    this.updateIntervals.set('general', setInterval(() => {
      this.updateAllCharts();
    }, 30000));

    // Cargar datos iniciales
    this.updateAllCharts();
  }

  updateAllCharts() {
    // Actualizar datos de todos los gráficos con nuevos valores mock
    this.charts.forEach((chart, key) => {
      if (key === 'balance') {
        this.updateBalanceChart();
      } else if (key === 'transactions') {
        this.updateTransactionsChart();
      } else if (key === 'mining') {
        this.updateMiningChart();
      } else if (key === 'balanceHistory') {
        this.updateBalanceHistoryChart();
      } else if (key === 'monthlyActivity') {
        this.updateMonthlyActivityChart();
      } else if (key === 'predictions') {
        this.updatePredictionsChart();
      }
    });
  }

  updateBalanceChart() {
    const chart = this.charts.get('balance');
    if (!chart) return;

    const newData = this.generateMockData(24, 0.000001, 0.000100);
    chart.data.datasets[0].data = newData;
    chart.update('none');
  }

  updateTransactionsChart() {
    const chart = this.charts.get('transactions');
    if (!chart) return;

    const newData = this.generateMockData(7, 0, 50);
    chart.data.datasets[0].data = newData;
    chart.update('none');
  }

  updateMiningChart() {
    const chart = this.charts.get('mining');
    if (!chart) return;

    const newData = this.generateMockData(12, 1000, 50000);
    chart.data.datasets[0].data = newData;
    chart.update('none');
  }

  updateBalanceHistoryChart() {
    const chart = this.charts.get('balanceHistory');
    if (!chart) return;

    const newData = this.generateMockData(30, 0.000001, 0.000200);
    chart.data.datasets[0].data = newData;
    chart.update('none');
  }

  updateMonthlyActivityChart() {
    const chart = this.charts.get('monthlyActivity');
    if (!chart) return;

    const newData = this.generateMockData(12, 50, 200);
    chart.data.datasets[0].data = newData;
    chart.update('none');
  }

  updatePredictionsChart() {
    const chart = this.charts.get('predictions');
    if (!chart) return;

    const newData = this.generateMockData(15, 0.000001, 0.000150);
    chart.data.datasets[0].data = newData;
    chart.update('none');
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
  // Esperar un poco más para asegurar que Chart.js esté cargado
  setTimeout(() => {
    if (typeof Chart !== 'undefined') {
      window.chartManager = new ChartManager();
      console.log('✅ ChartManager inicializado correctamente');
    } else {
      console.error('❌ Chart.js no está disponible');
    }
  }, 100);
});

// Exportar para uso global
window.ChartManager = ChartManager; 