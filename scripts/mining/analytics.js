// ===== ANALYTICS PAGE LOGIC =====

(function() {
    'use strict';
    
    let hashrateChart = null;
    let earningsChart = null;
    let distributionChart = null;
    let performanceChart = null;
    let currentRange = '24h';
    
    document.addEventListener('DOMContentLoaded', function() {
        initializeAnalytics();
        setupEventListeners();
        loadAnalyticsData();
    });
    
    function initializeAnalytics() {
        console.log('📈 Initializing Analytics page...');
        
        setupCharts();
    }
    
    function setupEventListeners() {
        // Time range buttons
        const timeRangeBtns = document.querySelectorAll('.time-range-btn');
        timeRangeBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const range = this.getAttribute('data-range');
                
                // Update active state
                timeRangeBtns.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                
                // Show/hide custom date range
                const customRange = document.getElementById('customDateRange');
                if (range === 'custom') {
                    customRange.style.display = 'flex';
                } else {
                    customRange.style.display = 'none';
                    currentRange = range;
                    loadAnalyticsData();
                }
            });
        });
        
        // Apply custom range
        const applyCustomBtn = document.getElementById('applyCustomRange');
        if (applyCustomBtn) {
            applyCustomBtn.addEventListener('click', () => {
                const from = document.getElementById('customDateFrom').value;
                const to = document.getElementById('customDateTo').value;
                if (from && to) {
                    currentRange = 'custom';
                    loadAnalyticsData(from, to);
                }
            });
        }
        
        // Export buttons
        const exportReportBtn = document.getElementById('exportReportBtn');
        if (exportReportBtn) {
            exportReportBtn.addEventListener('click', exportPDF);
        }
        
        const exportDataBtn = document.getElementById('exportDataBtn');
        if (exportDataBtn) {
            exportDataBtn.addEventListener('click', exportData);
        }
    }
    
    function setupCharts() {
        // Hashrate Chart
        const hashrateCtx = document.getElementById('hashrateChart');
        if (hashrateCtx) {
            hashrateChart = new Chart(hashrateCtx, {
                type: 'line',
                data: {
                    labels: [],
                    datasets: [{
                        label: 'Hashrate (H/s)',
                        data: [],
                        borderColor: '#00ff88',
                        backgroundColor: 'rgba(0, 255, 136, 0.1)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4,
                        pointRadius: 0,
                        pointHoverRadius: 6
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
                            intersect: false
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            grid: {
                                color: 'rgba(255, 255, 255, 0.1)'
                            },
                            ticks: {
                                color: '#a0a0a0',
                                callback: function(value) {
                                    return value.toLocaleString() + ' H/s';
                                }
                            }
                        },
                        x: {
                            grid: {
                                color: 'rgba(255, 255, 255, 0.1)'
                            },
                            ticks: {
                                color: '#a0a0a0',
                                maxTicksLimit: 12
                            }
                        }
                    }
                }
            });
        }
        
        // Earnings Chart
        const earningsCtx = document.getElementById('earningsChart');
        if (earningsCtx) {
            earningsChart = new Chart(earningsCtx, {
                type: 'bar',
                data: {
                    labels: [],
                    datasets: [{
                        label: 'Ganancias (RSC)',
                        data: [],
                        backgroundColor: 'rgba(99, 102, 241, 0.6)',
                        borderColor: '#6366f1',
                        borderWidth: 2,
                        borderRadius: 4
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
                        y: {
                            beginAtZero: true,
                            grid: {
                                color: 'rgba(255, 255, 255, 0.1)'
                            },
                            ticks: {
                                color: '#a0a0a0',
                                callback: function(value) {
                                    return value.toFixed(6) + ' RSC';
                                }
                            }
                        },
                        x: {
                            grid: {
                                color: 'rgba(255, 255, 255, 0.1)'
                            },
                            ticks: {
                                color: '#a0a0a0'
                            }
                        }
                    }
                }
            });
        }
        
        // Distribution Chart
        const distributionCtx = document.getElementById('distributionChart');
        if (distributionCtx) {
            distributionChart = new Chart(distributionCtx, {
                type: 'doughnut',
                data: {
                    labels: ['Minería', 'Comisiones', 'Referidos', 'Bonos'],
                    datasets: [{
                        data: [70, 15, 10, 5],
                        backgroundColor: [
                            '#00ff88',
                            '#6366f1',
                            '#ffa500',
                            '#00bfff'
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
                                color: '#a0a0a0',
                                padding: 15
                            }
                        }
                    }
                }
            });
        }
        
        // Performance Chart
        const performanceCtx = document.getElementById('performanceChart');
        if (performanceCtx) {
            performanceChart = new Chart(performanceCtx, {
                type: 'line',
                data: {
                    labels: [],
                    datasets: [
                        {
                            label: 'Temperatura (°C)',
                            data: [],
                            borderColor: '#ff4444',
                            backgroundColor: 'rgba(255, 68, 68, 0.1)',
                            borderWidth: 2,
                            fill: true,
                            tension: 0.4,
                            yAxisID: 'y'
                        },
                        {
                            label: 'Uso de CPU (%)',
                            data: [],
                            borderColor: '#00bfff',
                            backgroundColor: 'rgba(0, 191, 255, 0.1)',
                            borderWidth: 2,
                            fill: true,
                            tension: 0.4,
                            yAxisID: 'y1'
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    interaction: {
                        mode: 'index',
                        intersect: false
                    },
                    plugins: {
                        legend: {
                            labels: {
                                color: '#a0a0a0'
                            }
                        }
                    },
                    scales: {
                        y: {
                            type: 'linear',
                            display: true,
                            position: 'left',
                            title: {
                                display: true,
                                text: 'Temperatura (°C)',
                                color: '#a0a0a0'
                            },
                            grid: {
                                color: 'rgba(255, 255, 255, 0.1)'
                            },
                            ticks: {
                                color: '#a0a0a0'
                            }
                        },
                        y1: {
                            type: 'linear',
                            display: true,
                            position: 'right',
                            title: {
                                display: true,
                                text: 'CPU (%)',
                                color: '#a0a0a0'
                            },
                            grid: {
                                drawOnChartArea: false
                            },
                            ticks: {
                                color: '#a0a0a0'
                            }
                        },
                        x: {
                            grid: {
                                color: 'rgba(255, 255, 255, 0.1)'
                            },
                            ticks: {
                                color: '#a0a0a0'
                            }
                        }
                    }
                }
            });
        }
    }
    
    async function loadAnalyticsData(customFrom = null, customTo = null) {
        // Load data based on current range
        if (window.miningSupabaseAdapter) {
            try {
                const analyticsData = await window.miningSupabaseAdapter.getAnalyticsData(currentRange);
                if (analyticsData) {
                    updateChartsFromSupabase(analyticsData);
                    updateSummaryFromSupabase(analyticsData);
                } else {
                    // Fallback to mock data
                    const data = generateMockData(currentRange, customFrom, customTo);
                    updateCharts(data);
                    updateSummary(data);
                }
            } catch (error) {
                console.error('Error cargando datos de analytics:', error);
                // Fallback to mock data
                const data = generateMockData(currentRange, customFrom, customTo);
                updateCharts(data);
                updateSummary(data);
            }
        } else {
            const data = generateMockData(currentRange, customFrom, customTo);
            updateCharts(data);
            updateSummary(data);
        }
    }
    
    function updateChartsFromSupabase(data) {
        // Update charts with real data from Supabase
        if (hashrateChart && data.hashrate) {
            hashrateChart.data.labels = data.hashrate.map(h => new Date(h.time).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }));
            hashrateChart.data.datasets[0].data = data.hashrate.map(h => h.value);
            hashrateChart.update();
        }
        
        if (earningsChart && data.earnings) {
            earningsChart.data.labels = data.earnings.map(e => new Date(e.time).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }));
            earningsChart.data.datasets[0].data = data.earnings.map(e => e.value);
            earningsChart.update();
        }
    }
    
    function updateSummaryFromSupabase(data) {
        // Calculate averages from real data
        if (data.hashrate && data.hashrate.length > 0) {
            const avgHashrate = data.hashrate.reduce((sum, h) => sum + h.value, 0) / data.hashrate.length;
            document.getElementById('avgHashrate').textContent = avgHashrate.toFixed(2) + ' H/s';
        }
        
        if (data.earnings && data.earnings.length > 0) {
            const totalEarnings = data.earnings.reduce((sum, e) => sum + e.value, 0);
            document.getElementById('totalEarnings').textContent = totalEarnings.toFixed(6) + ' RSC';
        }
    }
    
    function generateMockData(range, from, to) {
        let labels = [];
        let hashrateData = [];
        let earningsData = [];
        let performanceData = { temp: [], cpu: [] };
        
        let count = 24; // Default to 24 hours
        let interval = 'hour';
        
        if (range === '7d') {
            count = 7;
            interval = 'day';
        } else if (range === '30d') {
            count = 30;
            interval = 'day';
        } else if (range === '90d') {
            count = 90;
            interval = 'day';
        }
        
        for (let i = count - 1; i >= 0; i--) {
            const date = new Date();
            if (interval === 'hour') {
                date.setHours(date.getHours() - i);
                labels.push(date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }));
            } else {
                date.setDate(date.getDate() - i);
                labels.push(date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }));
            }
            
            hashrateData.push(Math.random() * 500 + 1000);
            earningsData.push(Math.random() * 2 + 0.5);
            performanceData.temp.push(Math.random() * 10 + 60);
            performanceData.cpu.push(Math.random() * 20 + 50);
        }
        
        return {
            labels,
            hashrate: hashrateData,
            earnings: earningsData,
            performance: performanceData
        };
    }
    
    function updateCharts(data) {
        if (hashrateChart) {
            hashrateChart.data.labels = data.labels;
            hashrateChart.data.datasets[0].data = data.hashrate;
            hashrateChart.update();
        }
        
        if (earningsChart) {
            earningsChart.data.labels = data.labels;
            earningsChart.data.datasets[0].data = data.earnings;
            earningsChart.update();
        }
        
        if (performanceChart) {
            performanceChart.data.labels = data.labels;
            performanceChart.data.datasets[0].data = data.performance.temp;
            performanceChart.data.datasets[1].data = data.performance.cpu;
            performanceChart.update();
        }
    }
    
    function updateSummary(data) {
        // Calculate averages
        const avgHashrate = data.hashrate.reduce((a, b) => a + b, 0) / data.hashrate.length;
        const totalEarnings = data.earnings.reduce((a, b) => a + b, 0);
        
        document.getElementById('avgHashrate').textContent = avgHashrate.toFixed(2) + ' H/s';
        document.getElementById('totalEarnings').textContent = totalEarnings.toFixed(6) + ' RSC';
    }
    
    function exportChart(chartId) {
        const chart = window[chartId.replace('Chart', 'Chart')] || 
                     (chartId === 'hashrateChart' ? hashrateChart :
                      chartId === 'earningsChart' ? earningsChart : null);
        
        if (chart) {
            const url = chart.toBase64Image();
            const a = document.createElement('a');
            a.href = url;
            a.download = `${chartId}_${new Date().toISOString().split('T')[0]}.png`;
            a.click();
        }
    }
    
    window.exportChart = exportChart;
    
    function exportPDF() {
        // This would use a PDF library like jsPDF
        alert('Exportación PDF - Funcionalidad próximamente');
    }
    
    function exportData() {
        // Export data as CSV
        const data = {
            labels: [],
            hashrate: [],
            earnings: []
        };
        
        // Get current chart data
        if (hashrateChart) {
            data.labels = hashrateChart.data.labels;
            data.hashrate = hashrateChart.data.datasets[0].data;
        }
        
        if (earningsChart) {
            data.earnings = earningsChart.data.datasets[0].data;
        }
        
        // Create CSV
        const csv = [
            'Fecha,Hashrate (H/s),Ganancias (RSC)',
            ...data.labels.map((label, i) => 
                `${label},${data.hashrate[i] || ''},${data.earnings[i] || ''}`
            )
        ].join('\n');
        
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analytics_${currentRange}_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    }
    
    console.log('✅ Analytics page initialized');
})();

