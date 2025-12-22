// ===== MINING DASHBOARD LOGIC =====

(function() {
    'use strict';
    
    let hashrateChart = null;
    let earningsChart = null;
    
    document.addEventListener('DOMContentLoaded', function() {
        initializeDashboard();
        setupCharts();
        startDataUpdates();
    });
    
    function initializeDashboard() {
        console.log('📊 Initializing Dashboard...');
        
        // Quick start mining button
        const quickStartBtn = document.getElementById('quickStartMining');
        if (quickStartBtn) {
            quickStartBtn.addEventListener('click', () => {
                window.location.href = 'control.html';
            });
        }
        
        // Cargar datos desde localStorage inmediatamente (para mostrar algo rápido)
        const cachedUserData = loadUserDataFromStorage();
        if (cachedUserData) {
            console.log('⚡ Dashboard: Cargando datos de usuario en caché inmediatamente...');
            updateUserSidebar(cachedUserData.username || 'Usuario', cachedUserData.balance || 0);
        }
        
        // Cargar datos del dashboard desde localStorage inmediatamente
        const cachedDashboardData = loadDashboardDataFromStorage();
        if (cachedDashboardData) {
            console.log('⚡ Dashboard: Cargando datos del dashboard en caché inmediatamente...');
            updateDashboardElements(cachedDashboardData, cachedDashboardData.usd_rate || 0.5);
        }
        
        // Load user profile data (username and balance) - actualizar desde backend en segundo plano
        setTimeout(() => {
            loadUserProfile(true); // Forzar actualización desde backend
        }, 1000);
        
        // Load initial data - actualizar desde backend en segundo plano
        setTimeout(() => {
            loadDashboardData();
        }, 1500);
        
        // Actualizar datos cada 30 segundos para mantenerlos actualizados en tiempo real
        setInterval(() => {
            console.log('🔄 Dashboard: Actualizando datos desde backend...');
            loadUserProfile(true); // Siempre forzar actualización para obtener balance actualizado
            updateStatsMock(true); // Actualizar estadísticas del dashboard
        }, 30000);
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
                        y: {
                            beginAtZero: true,
                            grid: {
                                color: 'rgba(255, 255, 255, 0.1)'
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
        
        // Earnings Chart
        const earningsCtx = document.getElementById('earningsChart');
        if (earningsCtx) {
            earningsChart = new Chart(earningsCtx, {
                type: 'bar',
                data: {
                    labels: [],
                    datasets: [{
                        label: 'Earnings (RSC)',
                        data: [],
                        backgroundColor: 'rgba(99, 102, 241, 0.6)',
                        borderColor: '#6366f1',
                        borderWidth: 2
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
        
        // Chart range buttons
        const chartRangeBtns = document.querySelectorAll('.chart-range-btn');
        chartRangeBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const chartCard = this.closest('.chart-card');
                const otherBtns = chartCard.querySelectorAll('.chart-range-btn');
                otherBtns.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                
                const range = this.getAttribute('data-range');
                updateChartData(range);
            });
        });
    }
    
    async function loadDashboardData() {
        // Wait for adapter to be ready
        let attempts = 0;
        const maxAttempts = 100; // Aumentar intentos para dar más tiempo
        
        const waitForAdapter = setInterval(async () => {
            attempts++;
            
            // Verificar si miningBackendAPI está listo y autenticado
            if (window.miningBackendAPI) {
                // Recargar token por si acaso
                window.miningBackendAPI.loadToken();
                
                if (window.miningBackendAPI.isAuthenticated()) {
                    clearInterval(waitForAdapter);
                    await loadDashboardDataFromBackend();
                    return;
                }
                
                // Si no está autenticado pero tenemos credenciales de supabaseIntegration, intentar login automático
                if (window.supabaseIntegration && window.supabaseIntegration.user?.isAuthenticated) {
                    const userData = window.supabaseIntegration.user;
                    // Intentar hacer login automático con el backend
                    try {
                        await autoLoginWithBackend(userData.email);
                        // Recargar token después del login
                        window.miningBackendAPI.loadToken();
                        if (window.miningBackendAPI.isAuthenticated()) {
                            clearInterval(waitForAdapter);
                            await loadDashboardDataFromBackend();
                            return;
                        }
                    } catch (error) {
                        console.warn('No se pudo hacer login automático con backend:', error);
                    }
                }
            }
            
            // Fallback a otros adapters
            if (window.miningSupabaseAdapter && window.miningSupabaseAdapter.initialized) {
                clearInterval(waitForAdapter);
                loadDashboardDataFromSupabase();
                return;
            }
            
            if (window.supabaseIntegration && window.supabaseIntegration.user?.isAuthenticated) {
                clearInterval(waitForAdapter);
                loadDashboardDataFromSupabase();
                return;
            }
            
            if (attempts >= maxAttempts) {
                clearInterval(waitForAdapter);
                console.warn('⚠️ Adapter no disponible, usando datos mock');
                await updateStatsMock();
                await updateChartsMock('24h');
            }
        }, 100);
    }
    
    async function autoLoginWithBackend(email) {
        // Intentar obtener password desde localStorage (si está guardado)
        // Nota: En producción esto no es seguro, pero para desarrollo puede funcionar
        // Mejor solución sería tener un endpoint que genere un token temporal basado en la sesión de Supabase
        try {
            // Por ahora, solo verificamos si hay token guardado
            const token = localStorage.getItem('mining_auth_token');
            if (token) {
                // Verificar si el token es válido haciendo una petición de prueba
                if (window.miningBackendAPI) {
                    try {
                        const testResponse = await window.miningBackendAPI.request('GET', '/api/mining/active');
                        // Si la petición funciona, el token es válido
                        return true;
                    } catch (error) {
                        // Token inválido, limpiarlo
                        localStorage.removeItem('mining_auth_token');
                        if (window.miningBackendAPI) {
                            window.miningBackendAPI.clearToken();
                        }
                    }
                }
            }
        } catch (error) {
            console.warn('Error en auto-login:', error);
        }
        return false;
    }
    
    async function loadDashboardDataFromBackend() {
        try {
            console.log('📊 Cargando datos del dashboard desde backend...');
            
            // Verificar que el token esté disponible
            if (!window.miningBackendAPI || !window.miningBackendAPI.isAuthenticated()) {
                console.warn('⚠️ No hay token de autenticación disponible');
                // Intentar cargar token nuevamente
                if (window.miningBackendAPI) {
                    window.miningBackendAPI.loadToken();
                }
                
                // Si aún no hay token, usar fallback
                if (!window.miningBackendAPI || !window.miningBackendAPI.isAuthenticated()) {
                    console.warn('⚠️ Usando datos en caché - no hay autenticación');
                    // Intentar cargar desde localStorage
                    const cachedData = loadDashboardDataFromStorage();
                    if (cachedData) {
                        updateDashboardElements(cachedData, cachedData.usd_rate || 0.5);
                    }
                    await updateChartsMock('24h');
                    return;
                }
            }
            
            // Cargar estadísticas (forzar actualización desde backend)
            await updateStatsMock(true);
            
            // Cargar gráficos
            await updateChartsMock('24h');
            
        } catch (error) {
            console.error('❌ Error cargando datos del dashboard:', error);
            // Fallback a datos en caché
            const cachedData = loadDashboardDataFromStorage();
            if (cachedData) {
                console.log('ℹ️ Usando datos en caché debido a error');
                updateDashboardElements(cachedData, cachedData.usd_rate || 0.5);
            }
            await updateChartsMock('24h');
        }
    }
    
    async function loadDashboardDataFromSupabase() {
        try {
            console.log('📊 Cargando datos del dashboard desde Supabase...');
            
            // Get user data
            const userData = await window.miningSupabaseAdapter?.getUserData() || 
                            (window.supabaseIntegration?.user || null);
            
            if (!userData) {
                console.warn('⚠️ No se encontraron datos del usuario');
                updateStatsMock();
                updateChartsMock('24h');
                return;
            }
            
            // Get dashboard stats
            const stats = await window.miningSupabaseAdapter?.getDashboardStats();
            
            if (stats) {
                updateStatsFromData(stats, userData);
            } else {
                // Fallback to basic user data
                updateStatsFromUserData(userData);
            }
            
            // Get analytics data for charts
            const analyticsData = await window.miningSupabaseAdapter?.getAnalyticsData('24h');
            
            if (analyticsData) {
                updateChartsFromData(analyticsData, '24h');
            } else {
                await updateChartsMock('24h');
            }
            
        } catch (error) {
            console.error('❌ Error cargando datos del dashboard:', error);
            await updateStatsMock();
            await updateChartsMock('24h');
        }
    }
    
    function updateStatsFromData(stats, userData) {
        const elements = {
            currentHashrate: document.getElementById('currentHashrate'),
            avgHashrate: document.getElementById('avgHashrate'),
            totalBalance: document.getElementById('totalBalance'),
            availableBalance: document.getElementById('availableBalance'),
            todayEarnings: document.getElementById('todayEarnings'),
            todayEarningsUSD: document.getElementById('todayEarningsUSD'),
            uptime: document.getElementById('uptime')
        };
        
        const statsData = stats.stats || {};
        const balance = parseFloat(userData.balance || 0);
        const todayEarnings = parseFloat(statsData.today_earnings || 0);
        
        if (elements.currentHashrate) {
            elements.currentHashrate.textContent = formatHashrate(statsData.current_hashrate || 0);
        }
        if (elements.avgHashrate) {
            elements.avgHashrate.textContent = formatHashrate(statsData.avg_hashrate || statsData.current_hashrate || 0);
        }
        if (elements.totalBalance) {
            elements.totalBalance.textContent = `${balance.toFixed(6)} RSC`;
        }
        if (elements.availableBalance) {
            elements.availableBalance.textContent = `${balance.toFixed(6)} RSC`;
        }
        if (elements.todayEarnings) {
            elements.todayEarnings.textContent = `${todayEarnings.toFixed(6)} RSC`;
        }
        if (elements.todayEarningsUSD) {
            elements.todayEarningsUSD.textContent = (todayEarnings * 0.5).toFixed(2);
        }
        if (elements.uptime) {
            elements.uptime.textContent = formatUptime(statsData.uptime_seconds || 0);
        }
    }
    
    function updateStatsFromUserData(userData) {
        const elements = {
            currentHashrate: document.getElementById('currentHashrate'),
            avgHashrate: document.getElementById('avgHashrate'),
            totalBalance: document.getElementById('totalBalance'),
            availableBalance: document.getElementById('availableBalance'),
            todayEarnings: document.getElementById('todayEarnings'),
            todayEarningsUSD: document.getElementById('todayEarningsUSD'),
            uptime: document.getElementById('uptime')
        };
        
        const balance = parseFloat(userData.balance || 0);
        
        if (elements.currentHashrate) elements.currentHashrate.textContent = '0.00 H/s';
        if (elements.avgHashrate) elements.avgHashrate.textContent = '0.00 H/s';
        if (elements.totalBalance) elements.totalBalance.textContent = `${balance.toFixed(6)} RSC`;
        if (elements.availableBalance) elements.availableBalance.textContent = `${balance.toFixed(6)} RSC`;
        if (elements.todayEarnings) elements.todayEarnings.textContent = '0.000000 RSC';
        if (elements.todayEarningsUSD) elements.todayEarningsUSD.textContent = '0.00';
        if (elements.uptime) elements.uptime.textContent = '00:00:00';
    }
    
    function formatHashrate(hashrate) {
        if (hashrate >= 1000000000) {
            return `${(hashrate / 1000000000).toFixed(2)} TH/s`;
        } else if (hashrate >= 1000000) {
            return `${(hashrate / 1000000).toFixed(2)} GH/s`;
        } else if (hashrate >= 1000) {
            return `${(hashrate / 1000).toFixed(2)} KH/s`;
        } else {
            return `${hashrate.toFixed(2)} H/s`;
        }
    }
    
    function formatUptime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    
    function updateChartsFromData(analyticsData, range) {
        if (!analyticsData || !analyticsData.hashrate || !analyticsData.earnings) {
            updateChartsMock(range);
            return;
        }
        
        // Update hashrate chart
        if (hashrateChart && analyticsData.hashrate.length > 0) {
            const labels = analyticsData.hashrate.map(h => {
                const date = new Date(h.time);
                return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
            });
            const data = analyticsData.hashrate.map(h => h.value);
            
            hashrateChart.data.labels = labels;
            hashrateChart.data.datasets[0].data = data;
            hashrateChart.update();
        }
        
        // Update earnings chart
        if (earningsChart && analyticsData.earnings.length > 0) {
            const labels = analyticsData.earnings.map(e => {
                const date = new Date(e.time);
                return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
            });
            const data = analyticsData.earnings.map(e => e.value);
            
            earningsChart.data.labels = labels;
            earningsChart.data.datasets[0].data = data;
            earningsChart.update();
        }
    }
    
    // Función para guardar datos del dashboard en localStorage
    function saveDashboardDataToStorage(dashboardData) {
        try {
            const dataToSave = {
                current_hashrate: dashboardData.current_hashrate || 0,
                avg_hashrate: dashboardData.avg_hashrate || 0,
                total_balance: dashboardData.total_balance || 0,
                available_balance: dashboardData.available_balance || 0,
                today_earnings: dashboardData.today_earnings || 0,
                uptime_seconds: dashboardData.uptime_seconds || 0,
                usd_rate: dashboardData.usd_rate || 0.5,
                lastUpdated: new Date().toISOString()
            };
            localStorage.setItem('mining_dashboard_data', JSON.stringify(dataToSave));
            console.log('💾 Datos del dashboard guardados en localStorage');
        } catch (error) {
            console.error('❌ Error guardando datos del dashboard en localStorage:', error);
        }
    }
    
    // Función para cargar datos del dashboard desde localStorage
    function loadDashboardDataFromStorage() {
        try {
            const stored = localStorage.getItem('mining_dashboard_data');
            if (stored) {
                const dashboardData = JSON.parse(stored);
                console.log('📦 Datos del dashboard cargados desde localStorage');
                return dashboardData;
            }
        } catch (error) {
            console.error('❌ Error cargando datos del dashboard desde localStorage:', error);
        }
        return null;
    }
    
    // Función para actualizar los elementos del DOM con datos del dashboard
    function updateDashboardElements(data, usdRate = 0.5) {
        const elements = {
            currentHashrate: document.getElementById('currentHashrate'),
            avgHashrate: document.getElementById('avgHashrate'),
            totalBalance: document.getElementById('totalBalance'),
            availableBalance: document.getElementById('availableBalance'),
            todayEarnings: document.getElementById('todayEarnings'),
            todayEarningsUSD: document.getElementById('todayEarningsUSD'),
            uptime: document.getElementById('uptime')
        };
        
        if (elements.currentHashrate) {
            elements.currentHashrate.textContent = formatHashrate(data.current_hashrate || 0);
        }
        if (elements.avgHashrate) {
            elements.avgHashrate.textContent = formatHashrate(data.avg_hashrate || 0);
        }
        if (elements.totalBalance) {
            elements.totalBalance.textContent = `${(data.total_balance || 0).toFixed(6)} RSC`;
        }
        if (elements.availableBalance) {
            elements.availableBalance.textContent = `${(data.available_balance || 0).toFixed(6)} RSC`;
        }
        if (elements.todayEarnings) {
            elements.todayEarnings.textContent = `${(data.today_earnings || 0).toFixed(6)} RSC`;
        }
        if (elements.todayEarningsUSD) {
            const earningsUSD = (data.today_earnings || 0) * (data.usd_rate || usdRate);
            elements.todayEarningsUSD.textContent = earningsUSD.toFixed(2);
        }
        if (elements.uptime) {
            elements.uptime.textContent = formatUptime(data.uptime_seconds || 0);
        }
    }
    
    async function updateStatsMock(forceRefresh = false) {
        const elements = {
            currentHashrate: document.getElementById('currentHashrate'),
            avgHashrate: document.getElementById('avgHashrate'),
            totalBalance: document.getElementById('totalBalance'),
            availableBalance: document.getElementById('availableBalance'),
            todayEarnings: document.getElementById('todayEarnings'),
            todayEarningsUSD: document.getElementById('todayEarningsUSD'),
            uptime: document.getElementById('uptime')
        };
        
        // Si no es una actualización forzada, cargar primero desde localStorage
        if (!forceRefresh) {
            const cachedData = loadDashboardDataFromStorage();
            if (cachedData) {
                console.log('⚡ Mostrando datos del dashboard en caché mientras se actualiza...');
                updateDashboardElements(cachedData, cachedData.usd_rate || 0.5);
            }
        }
        
        try {
            // Intentar obtener datos del backend
            if (window.miningBackendAPI && window.miningBackendAPI.isAuthenticated()) {
                // Obtener datos del dashboard
                const dashboardResponse = await window.miningBackendAPI.request('GET', '/api/mining/dashboard');
                
                if (dashboardResponse.success && dashboardResponse.data) {
                    const data = dashboardResponse.data;
                    
                    // Obtener tasa USD
                    let usdRate = 0.5; // Valor por defecto
                    try {
                        const rateResponse = await window.miningBackendAPI.request('GET', '/api/mining/usd-rate');
                        if (rateResponse.success && rateResponse.data) {
                            usdRate = parseFloat(rateResponse.data.usd_rate || 0.5);
                        }
                    } catch (error) {
                        console.warn('Error obteniendo tasa USD, usando valor por defecto:', error);
                    }
                    
                    // Agregar tasa USD a los datos
                    data.usd_rate = usdRate;
                    
                    // Guardar en localStorage para persistencia
                    saveDashboardDataToStorage(data);
                    
                    // Actualizar elementos con datos reales
                    updateDashboardElements(data, usdRate);
                    
                    console.log('✅ Datos del dashboard actualizados desde backend');
                    return; // Salir si se obtuvieron datos correctamente
                }
            }
        } catch (error) {
            console.error('Error obteniendo datos del dashboard:', error);
            // Si hay error pero tenemos datos en caché, mantenerlos
            if (!forceRefresh) {
                console.log('ℹ️ Manteniendo datos en caché debido a error del backend');
                return;
            }
        }
        
        // Fallback a datos mock solo si no hay datos en caché y no se pudo obtener del backend
        if (forceRefresh) {
            console.warn('⚠️ No se pudieron obtener datos del dashboard, usando valores por defecto');
            if (elements.currentHashrate) elements.currentHashrate.textContent = '0.00 H/s';
            if (elements.avgHashrate) elements.avgHashrate.textContent = '0.00 H/s';
            if (elements.totalBalance) elements.totalBalance.textContent = '0.000000 RSC';
            if (elements.availableBalance) elements.availableBalance.textContent = '0.000000 RSC';
            if (elements.todayEarnings) elements.todayEarnings.textContent = '0.000000 RSC';
            if (elements.todayEarningsUSD) elements.todayEarningsUSD.textContent = '0.00';
            if (elements.uptime) elements.uptime.textContent = '00:00:00';
        }
    }
    
    function updateCharts(range) {
        // Update charts based on range
        // This would fetch data from API
        updateChartsMock(range);
    }
    
    async function updateChartsMock(range) {
        try {
            // Intentar obtener datos reales del backend
            if (window.miningBackendAPI && window.miningBackendAPI.isAuthenticated()) {
                const chartsResponse = await window.miningBackendAPI.request('GET', `/api/mining/charts-data?range=${range}`);
                
                if (chartsResponse.success && chartsResponse.data) {
                    const { hashrate, earnings } = chartsResponse.data;
                    
                    // Actualizar gráfico de hashrate
                    if (hashrateChart && hashrate && hashrate.length > 0) {
                        const labels = hashrate.map(h => {
                            const date = new Date(h.time);
                            return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
                        });
                        const data = hashrate.map(h => h.value);
                        
                        hashrateChart.data.labels = labels;
                        hashrateChart.data.datasets[0].data = data;
                        hashrateChart.update();
                    }
                    
                    // Actualizar gráfico de earnings
                    if (earningsChart && earnings && earnings.length > 0) {
                        const labels = earnings.map(e => {
                            const date = new Date(e.time);
                            return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
                        });
                        const data = earnings.map(e => e.value);
                        
                        earningsChart.data.labels = labels;
                        earningsChart.data.datasets[0].data = data;
                        earningsChart.update();
                    }
                    
                    // Si hay datos, no usar mock
                    if ((hashrate && hashrate.length > 0) || (earnings && earnings.length > 0)) {
                        return;
                    }
                }
            }
        } catch (error) {
            console.error('Error obteniendo datos de gráficos:', error);
        }
        
        // Fallback a datos mock si no se pudo obtener datos reales
        const hours = range === '24h' ? 24 : range === '7d' ? 168 : range === '30d' ? 720 : 2160;
        const labels = [];
        const hashrateData = [];
        const earningsData = [];
        
        for (let i = hours - 1; i >= 0; i--) {
            const date = new Date();
            if (range === '24h') {
                date.setHours(date.getHours() - i);
            } else if (range === '7d') {
                date.setHours(date.getHours() - i);
            } else if (range === '30d') {
                date.setDate(date.getDate() - i);
            } else {
                date.setDate(date.getDate() - i);
            }
            labels.push(date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }));
            hashrateData.push(Math.random() * 2000 + 1000);
            earningsData.push(Math.random() * 0.5 + 0.1);
        }
        
        if (hashrateChart) {
            hashrateChart.data.labels = labels;
            hashrateChart.data.datasets[0].data = hashrateData;
            hashrateChart.update();
        }
        
        if (earningsChart) {
            earningsChart.data.labels = labels;
            earningsChart.data.datasets[0].data = earningsData;
            earningsChart.update();
        }
    }
    
    async function updateChartData(range) {
        // Update chart data based on selected range
        if (window.miningBackendAPI && window.miningBackendAPI.isAuthenticated()) {
            try {
                await updateChartsMock(range);
            } catch (error) {
                console.error('Error actualizando gráficos:', error);
                await updateChartsMock(range);
            }
        } else if (window.miningSupabaseAdapter && window.miningSupabaseAdapter.initialized) {
            try {
                const analyticsData = await window.miningSupabaseAdapter.getAnalyticsData(range);
                if (analyticsData) {
                    updateChartsFromData(analyticsData, range);
                } else {
                    await updateChartsMock(range);
                }
            } catch (error) {
                console.error('Error actualizando gráficos:', error);
                await updateChartsMock(range);
            }
        } else {
            await updateChartsMock(range);
        }
    }
    
    // Función para guardar datos del usuario en localStorage (compartida con layout.js)
    function saveUserDataToStorage(userData) {
        try {
            const dataToSave = {
                username: userData.username,
                email: userData.email,
                balance: parseFloat(userData.balance || 0),
                lastUpdated: new Date().toISOString()
            };
            localStorage.setItem('mining_user_profile', JSON.stringify(dataToSave));
            console.log('💾 Dashboard: Datos del usuario guardados en localStorage');
        } catch (error) {
            console.error('❌ Dashboard: Error guardando datos en localStorage:', error);
        }
    }
    
    // Función para cargar datos del usuario desde localStorage
    function loadUserDataFromStorage() {
        try {
            const stored = localStorage.getItem('mining_user_profile');
            if (stored) {
                return JSON.parse(stored);
            }
        } catch (error) {
            console.error('❌ Dashboard: Error cargando datos desde localStorage:', error);
        }
        return null;
    }
    
    async function loadUserProfile(forceRefresh = false) {
        try {
            console.log('🔄 Dashboard: Cargando perfil del usuario...', forceRefresh ? '(forzando actualización)' : '');
            
            // Si no es una actualización forzada, cargar primero desde localStorage
            if (!forceRefresh) {
                const cachedData = loadUserDataFromStorage();
                if (cachedData) {
                    console.log('⚡ Dashboard: Mostrando datos en caché mientras se actualiza...');
                    updateUserSidebar(cachedData.username || 'Usuario', cachedData.balance || 0);
                }
            }
            
            // Esperar a que el backend API esté listo
            if (window.miningBackendAPI) {
                // Asegurarse de que el token esté cargado
                if (!window.miningBackendAPI.token) {
                    window.miningBackendAPI.loadToken();
                }
                
                if (window.miningBackendAPI.isAuthenticated()) {
                    try {
                        console.log('📡 Dashboard: Obteniendo perfil actualizado desde backend API...');
                        const profileResponse = await window.miningBackendAPI.getProfile();
                        
                        if (profileResponse.success && profileResponse.data?.user) {
                            const user = profileResponse.data.user;
                            const userData = {
                                username: user.username || user.email || 'Usuario',
                                email: user.email,
                                balance: parseFloat(user.balance || 0)
                            };
                            
                            console.log('✅ Dashboard: Datos del usuario actualizados desde backend:', userData);
                            
                            // Guardar en localStorage para persistencia
                            saveUserDataToStorage(userData);
                            
                            // Actualizar display
                            updateUserSidebar(userData.username, userData.balance);
                            return;
                        } else {
                            console.warn('⚠️ Dashboard: Respuesta del backend sin datos de usuario');
                        }
                    } catch (error) {
                        console.error('❌ Dashboard: Error cargando perfil desde backend API:', error);
                        // Si hay error pero tenemos datos en caché, mantenerlos
                        if (!forceRefresh) {
                            console.log('ℹ️ Dashboard: Manteniendo datos en caché debido a error del backend');
                        }
                    }
                } else {
                    console.warn('⚠️ Dashboard: Backend API no autenticado');
                }
            }
            
            // Fallback: intentar desde Supabase adapter
            if (window.miningSupabaseAdapter && window.miningSupabaseAdapter.initialized) {
                try {
                    const userData = await window.miningSupabaseAdapter.getUserData();
                    if (userData) {
                        console.log('✅ Dashboard: Datos obtenidos desde Supabase adapter');
                        updateUserSidebar(userData.username || userData.email || 'Usuario', userData.balance || 0);
                        return;
                    }
                } catch (error) {
                    console.error('❌ Dashboard: Error desde Supabase adapter:', error);
                }
            }
            
            // Fallback: intentar desde supabaseIntegration
            if (window.supabaseIntegration && window.supabaseIntegration.user?.isAuthenticated) {
                const user = window.supabaseIntegration.user;
                console.log('✅ Dashboard: Datos obtenidos desde supabaseIntegration');
                updateUserSidebar(user.username || user.email || 'Usuario', user.balance || 0);
                return;
            }
            
            // Si no hay datos, mantener valores por defecto
            console.warn('⚠️ Dashboard: No se pudo cargar el perfil del usuario - usando valores por defecto');
            
        } catch (error) {
            console.error('❌ Dashboard: Error cargando perfil del usuario:', error);
        }
    }
    
    function updateUserSidebar(username, balance) {
        console.log(`🔄 Dashboard: Actualizando sidebar - ${username} - ${balance}`);
        
        // Actualizar nombre de usuario en el sidebar
        const userNameElement = document.getElementById('userName');
        if (userNameElement) {
            userNameElement.textContent = username;
            console.log(`✅ Dashboard: Nombre actualizado en sidebar: "${username}"`);
        } else {
            console.warn('⚠️ Dashboard: Elemento #userName no encontrado');
        }
        
        // Actualizar nombre de usuario en el topbar
        const userNameSmallElement = document.getElementById('userNameSmall');
        if (userNameSmallElement) {
            userNameSmallElement.textContent = username;
            console.log(`✅ Dashboard: Nombre actualizado en topbar: "${username}"`);
        } else {
            console.warn('⚠️ Dashboard: Elemento #userNameSmall no encontrado');
        }
        
        // Actualizar balance en el sidebar
        const userBalanceElement = document.getElementById('userBalance');
        if (userBalanceElement) {
            const balanceValue = parseFloat(balance || 0);
            userBalanceElement.textContent = `${balanceValue.toFixed(6)} RSC`;
            console.log(`✅ Dashboard: Balance actualizado: ${balanceValue.toFixed(6)} RSC`);
        } else {
            console.warn('⚠️ Dashboard: Elemento #userBalance no encontrado');
        }
        
        console.log(`✅ Dashboard: Perfil actualizado completamente - ${username} - ${balance.toFixed(6)} RSC`);
    }
    
    function startDataUpdates() {
        // Update data every 30 seconds
        setInterval(async () => {
            if (window.miningBackendAPI && window.miningBackendAPI.isAuthenticated()) {
                await loadDashboardDataFromBackend();
                // También actualizar perfil del usuario
                await loadUserProfile();
            } else if (window.miningSupabaseAdapter && window.miningSupabaseAdapter.initialized) {
                loadDashboardDataFromSupabase();
                await loadUserProfile();
            } else if (window.supabaseIntegration && window.supabaseIntegration.user?.isAuthenticated) {
                loadDashboardDataFromSupabase();
                await loadUserProfile();
            } else {
                await loadDashboardData();
            }
        }, 30000);
    }
    
    console.log('✅ Dashboard initialized');
})();

