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
                        data: [0, 0, 0, 0],
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
    
    async function waitForSupabaseIntegration() {
        let attempts = 0;
        const maxAttempts = 50;
        
        return new Promise((resolve) => {
            const checkInterval = setInterval(() => {
                attempts++;
                
                if (window.supabaseIntegration && 
                    window.supabaseIntegration.user && 
                    window.supabaseIntegration.user.isAuthenticated &&
                    window.supabaseIntegration.user.id) {
                    clearInterval(checkInterval);
                    resolve(true);
                    return;
                }
                
                if (attempts >= maxAttempts) {
                    clearInterval(checkInterval);
                    console.warn('⚠️ Supabase Integration no disponible');
                    resolve(false);
                }
            }, 100);
        });
    }
    
    async function loadAnalyticsData(customFrom = null, customTo = null) {
        // Esperar a que Supabase esté listo
        const isReady = await waitForSupabaseIntegration();
        
        if (!isReady || !window.supabaseIntegration || !window.supabaseIntegration.user || !window.supabaseIntegration.user.isAuthenticated) {
            console.warn('⚠️ Analytics: Supabase no disponible, mostrando datos vacíos');
            updateChartsWithEmptyData();
            updateSummaryWithEmptyData();
            return;
        }
        
        try {
            console.log('📡 Analytics: Cargando datos desde Supabase...');
            const userId = window.supabaseIntegration.user.id;
            
            // Calcular fechas según el rango
            const { startDate, endDate } = calculateDateRange(currentRange, customFrom, customTo);
            
            // 1. Obtener datos de hashrate desde mining_sessions
            const hashrateData = await loadHashrateData(userId, startDate, endDate, currentRange);
            
            // 2. Obtener datos de earnings desde transactions
            const earningsData = await loadEarningsData(userId, startDate, endDate, currentRange);
            
            // 3. Calcular distribución de ganancias
            const distributionData = await loadDistributionData(userId, startDate, endDate);
            
            // 4. Actualizar gráficos con datos reales
            updateChartsWithRealData(hashrateData, earningsData, distributionData);
            
            // 5. Actualizar resumen con datos reales
            updateSummaryWithRealData(hashrateData, earningsData);
            
            console.log('✅ Analytics: Datos cargados desde Supabase');
            
        } catch (error) {
            console.error('❌ Error cargando datos de analytics:', error);
            updateChartsWithEmptyData();
            updateSummaryWithEmptyData();
        }
    }
    
    function calculateDateRange(range, customFrom, customTo) {
        const endDate = new Date();
        let startDate = new Date();
        
        if (customFrom && customTo) {
            startDate = new Date(customFrom);
            endDate = new Date(customTo);
        } else {
            switch (range) {
                case '24h':
                    startDate.setHours(startDate.getHours() - 24);
                    break;
                case '7d':
                    startDate.setDate(startDate.getDate() - 7);
                    break;
                case '30d':
                    startDate.setDate(startDate.getDate() - 30);
                    break;
                case '90d':
                    startDate.setDate(startDate.getDate() - 90);
                    break;
                default:
                    startDate.setHours(startDate.getHours() - 24);
            }
        }
        
        return { startDate, endDate };
    }
    
    async function loadHashrateData(userId, startDate, endDate, range) {
        try {
            const response = await window.supabaseIntegration.makeRequest(
                'GET',
                `/rest/v1/mining_sessions?user_id=eq.${userId}&start_time=gte.${startDate.toISOString()}&start_time=lte.${endDate.toISOString()}&select=start_time,hash_rate,status&order=start_time.asc`
            );
            
            if (!response.ok) {
                return { labels: [], data: [] };
            }
            
            const sessions = await response.json();
            const completedSessions = sessions.filter(s => s.status === 'completed' || s.status === 'active');
            
            // Agrupar por intervalo según el rango
            const interval = range === '24h' ? 'hour' : 'day';
            const grouped = groupByInterval(completedSessions, interval, startDate, endDate);
            
            return {
                labels: grouped.labels,
                data: grouped.data
            };
        } catch (error) {
            console.error('Error cargando hashrate:', error);
            return { labels: [], data: [] };
        }
    }
    
    async function loadEarningsData(userId, startDate, endDate, range) {
        try {
            const response = await window.supabaseIntegration.makeRequest(
                'GET',
                `/rest/v1/transactions?user_id=eq.${userId}&type=eq.mining&amount=gt.0&created_at=gte.${startDate.toISOString()}&created_at=lte.${endDate.toISOString()}&select=created_at,amount,status&order=created_at.asc`
            );
            
            if (!response.ok) {
                return { labels: [], data: [] };
            }
            
            const transactions = await response.json();
            const completedTransactions = transactions.filter(t => 
                (t.status === 'completed' || t.status === null) && parseFloat(t.amount || 0) > 0
            );
            
            // Agrupar por intervalo según el rango
            const interval = range === '24h' ? 'hour' : 'day';
            const grouped = groupTransactionsByInterval(completedTransactions, interval, startDate, endDate);
            
            return {
                labels: grouped.labels,
                data: grouped.data
            };
        } catch (error) {
            console.error('Error cargando earnings:', error);
            return { labels: [], data: [] };
        }
    }
    
    async function loadDistributionData(userId, startDate, endDate) {
        try {
            const response = await window.supabaseIntegration.makeRequest(
                'GET',
                `/rest/v1/transactions?user_id=eq.${userId}&amount=gt.0&created_at=gte.${startDate.toISOString()}&created_at=lte.${endDate.toISOString()}&select=type,amount,status`
            );
            
            if (!response.ok) {
                return { mining: 0, commissions: 0, referrals: 0, bonuses: 0 };
            }
            
            const transactions = await response.json();
            const completedTransactions = transactions.filter(t => 
                (t.status === 'completed' || t.status === null) && parseFloat(t.amount || 0) > 0
            );
            
            const distribution = {
                mining: 0,
                commissions: 0,
                referrals: 0,
                bonuses: 0
            };
            
            completedTransactions.forEach(t => {
                const amount = parseFloat(t.amount || 0);
                const type = t.type || 'mining';
                
                if (type === 'mining') {
                    distribution.mining += amount;
                } else if (type === 'referral_commission' || type === 'commission') {
                    distribution.commissions += amount;
                } else if (type === 'referral' || type === 'referral_bonus') {
                    distribution.referrals += amount;
                } else if (type === 'bonus' || type === 'reward') {
                    distribution.bonuses += amount;
                }
            });
            
            return distribution;
        } catch (error) {
            console.error('Error cargando distribución:', error);
            return { mining: 0, commissions: 0, referrals: 0, bonuses: 0 };
        }
    }
    
    function groupByInterval(sessions, interval, startDate, endDate) {
        const groups = new Map();
        const labels = [];
        const data = [];
        
        // Crear intervalos
        const current = new Date(startDate);
        while (current <= endDate) {
            const key = interval === 'hour' 
                ? `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}-${String(current.getDate()).padStart(2, '0')}T${String(current.getHours()).padStart(2, '0')}:00:00`
                : `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}-${String(current.getDate()).padStart(2, '0')}`;
            
            groups.set(key, []);
            
            if (interval === 'hour') {
                labels.push(current.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }));
                current.setHours(current.getHours() + 1);
            } else {
                labels.push(current.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }));
                current.setDate(current.getDate() + 1);
            }
        }
        
        // Agrupar sesiones
        sessions.forEach(session => {
            const date = new Date(session.start_time);
            const key = interval === 'hour'
                ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}T${String(date.getHours()).padStart(2, '0')}:00:00`
                : `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
            
            if (groups.has(key)) {
                groups.get(key).push(session);
            }
        });
        
        // Calcular promedios por intervalo
        groups.forEach((groupSessions, key) => {
            if (groupSessions.length > 0) {
                const avg = groupSessions.reduce((sum, s) => sum + parseFloat(s.hash_rate || 0), 0) / groupSessions.length;
                data.push(avg);
            } else {
                data.push(0);
            }
        });
        
        return { labels, data };
    }
    
    function groupTransactionsByInterval(transactions, interval, startDate, endDate) {
        const groups = new Map();
        const labels = [];
        const data = [];
        
        // Crear intervalos
        const current = new Date(startDate);
        while (current <= endDate) {
            const key = interval === 'hour'
                ? `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}-${String(current.getDate()).padStart(2, '0')}T${String(current.getHours()).padStart(2, '0')}:00:00`
                : `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}-${String(current.getDate()).padStart(2, '0')}`;
            
            groups.set(key, []);
            
            if (interval === 'hour') {
                labels.push(current.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }));
                current.setHours(current.getHours() + 1);
            } else {
                labels.push(current.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }));
                current.setDate(current.getDate() + 1);
            }
        }
        
        // Agrupar transacciones
        transactions.forEach(transaction => {
            const date = new Date(transaction.created_at);
            const key = interval === 'hour'
                ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}T${String(date.getHours()).padStart(2, '0')}:00:00`
                : `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
            
            if (groups.has(key)) {
                groups.get(key).push(transaction);
            }
        });
        
        // Calcular sumas por intervalo
        groups.forEach((groupTransactions, key) => {
            const sum = groupTransactions.reduce((s, t) => s + parseFloat(t.amount || 0), 0);
            data.push(sum);
        });
        
        return { labels, data };
    }
    
    function updateChartsWithRealData(hashrateData, earningsData, distributionData) {
        // Actualizar gráfico de hashrate
        if (hashrateChart && hashrateData.labels && hashrateData.data) {
            hashrateChart.data.labels = hashrateData.labels;
            hashrateChart.data.datasets[0].data = hashrateData.data;
            hashrateChart.update();
        }
        
        // Actualizar gráfico de earnings
        if (earningsChart && earningsData.labels && earningsData.data) {
            earningsChart.data.labels = earningsData.labels;
            earningsChart.data.datasets[0].data = earningsData.data;
            earningsChart.update();
        }
        
        // Actualizar gráfico de distribución
        if (distributionChart && distributionData) {
            const total = distributionData.mining + distributionData.commissions + 
                         distributionData.referrals + distributionData.bonuses;
            
            if (total > 0) {
                distributionChart.data.datasets[0].data = [
                    distributionData.mining,
                    distributionData.commissions,
                    distributionData.referrals,
                    distributionData.bonuses
                ];
            } else {
                // Si no hay datos, mostrar ceros
                distributionChart.data.datasets[0].data = [0, 0, 0, 0];
            }
            distributionChart.update();
        }
        
        // Performance chart - por ahora sin datos reales (requiere métricas del sistema)
        if (performanceChart) {
            // Mantener vacío hasta que tengamos datos reales de performance
            performanceChart.data.labels = hashrateData.labels || [];
            performanceChart.data.datasets[0].data = [];
            performanceChart.data.datasets[1].data = [];
            performanceChart.update();
        }
    }
    
    function updateChartsWithEmptyData() {
        const emptyLabels = [];
        const emptyData = [];
        
        // Crear labels vacíos según el rango
        const count = currentRange === '24h' ? 24 : (currentRange === '7d' ? 7 : (currentRange === '30d' ? 30 : 90));
        const interval = currentRange === '24h' ? 'hour' : 'day';
        
        for (let i = count - 1; i >= 0; i--) {
            const date = new Date();
            if (interval === 'hour') {
                date.setHours(date.getHours() - i);
                emptyLabels.push(date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }));
            } else {
                date.setDate(date.getDate() - i);
                emptyLabels.push(date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }));
            }
            emptyData.push(0);
        }
        
        if (hashrateChart) {
            hashrateChart.data.labels = emptyLabels;
            hashrateChart.data.datasets[0].data = emptyData;
            hashrateChart.update();
        }
        
        if (earningsChart) {
            earningsChart.data.labels = emptyLabels;
            earningsChart.data.datasets[0].data = emptyData;
            earningsChart.update();
        }
        
        if (distributionChart) {
            distributionChart.data.datasets[0].data = [0, 0, 0, 0];
            distributionChart.update();
        }
        
        if (performanceChart) {
            performanceChart.data.labels = emptyLabels;
            performanceChart.data.datasets[0].data = [];
            performanceChart.data.datasets[1].data = [];
            performanceChart.update();
        }
    }
    
    function updateSummaryWithRealData(hashrateData, earningsData) {
        // Calcular promedio de hashrate
        if (hashrateData.data && hashrateData.data.length > 0) {
            const avgHashrate = hashrateData.data.reduce((sum, h) => sum + h, 0) / hashrateData.data.length;
            const avgHashrateEl = document.getElementById('avgHashrate');
            if (avgHashrateEl) {
                avgHashrateEl.textContent = formatHashrate(avgHashrate);
            }
        } else {
            const avgHashrateEl = document.getElementById('avgHashrate');
            if (avgHashrateEl) {
                avgHashrateEl.textContent = '0.00 H/s';
            }
        }
        
        // Calcular total de earnings
        if (earningsData.data && earningsData.data.length > 0) {
            const totalEarnings = earningsData.data.reduce((sum, e) => sum + e, 0);
            const totalEarningsEl = document.getElementById('totalEarnings');
            if (totalEarningsEl) {
                totalEarningsEl.textContent = totalEarnings.toFixed(6) + ' RSC';
            }
        } else {
            const totalEarningsEl = document.getElementById('totalEarnings');
            if (totalEarningsEl) {
                totalEarningsEl.textContent = '0.000000 RSC';
            }
        }
    }
    
    function updateSummaryWithEmptyData() {
        const avgHashrateEl = document.getElementById('avgHashrate');
        if (avgHashrateEl) {
            avgHashrateEl.textContent = '0.00 H/s';
        }
        
        const totalEarningsEl = document.getElementById('totalEarnings');
        if (totalEarningsEl) {
            totalEarningsEl.textContent = '0.000000 RSC';
        }
    }
    
    function formatHashrate(hashrate) {
        const h = parseFloat(hashrate || 0);
        if (h >= 1000000000) {
            return `${(h / 1000000000).toFixed(2)} TH/s`;
        } else if (h >= 1000000) {
            return `${(h / 1000000).toFixed(2)} GH/s`;
        } else if (h >= 1000) {
            return `${(h / 1000).toFixed(2)} KH/s`;
        } else {
            return `${h.toFixed(2)} H/s`;
        }
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

