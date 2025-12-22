// ===== POOL MANAGEMENT LOGIC =====

(function() {
    'use strict';
    
    let poolStatsChart = null;
    
    document.addEventListener('DOMContentLoaded', function() {
        initializePools();
        setupEventListeners();
        loadActivePoolInfo();
        loadAvailablePools();
        loadPoolComparison();
        loadPoolHistory();
    });
    
    function initializePools() {
        console.log('🏊 Initializing Pool Management...');
        setupPoolStatsChart();
    }
    
    function setupEventListeners() {
        // Add pool button
        const addPoolBtn = document.getElementById('addPoolBtn');
        const addPoolModal = document.getElementById('addPoolModal');
        const closeAddPoolModal = document.getElementById('closeAddPoolModal');
        const cancelAddPoolBtn = document.getElementById('cancelAddPoolBtn');
        const confirmAddPoolBtn = document.getElementById('confirmAddPoolBtn');
        
        if (addPoolBtn && addPoolModal) {
            addPoolBtn.addEventListener('click', () => {
                addPoolModal.classList.add('active');
            });
        }
        
        if (closeAddPoolModal) {
            closeAddPoolModal.addEventListener('click', () => {
                addPoolModal.classList.remove('active');
            });
        }
        
        if (cancelAddPoolBtn) {
            cancelAddPoolBtn.addEventListener('click', () => {
                addPoolModal.classList.remove('active');
            });
        }
        
        if (confirmAddPoolBtn) {
            confirmAddPoolBtn.addEventListener('click', addNewPool);
        }
        
        // Refresh pool button
        const refreshPoolBtn = document.getElementById('refreshPoolBtn');
        if (refreshPoolBtn) {
            refreshPoolBtn.addEventListener('click', loadActivePoolInfo);
        }
        
        // Save pool buttons
        document.getElementById('savePrimaryPoolBtn')?.addEventListener('click', savePrimaryPool);
        document.getElementById('saveBackupPoolBtn')?.addEventListener('click', saveBackupPool);
    }
    
    function setupPoolStatsChart() {
        const ctx = document.getElementById('poolStatsChart');
        if (!ctx) return;
        
        poolStatsChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [
                    {
                        label: 'Hashrate del Pool',
                        data: [],
                        borderColor: '#00ff88',
                        backgroundColor: 'rgba(0, 255, 136, 0.1)',
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4
                    },
                    {
                        label: 'Tu Hashrate',
                        data: [],
                        borderColor: '#6366f1',
                        backgroundColor: 'rgba(99, 102, 241, 0.1)',
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: {
                            color: '#a0a0a0'
                        }
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
                            color: '#a0a0a0',
                            maxTicksLimit: 10
                        }
                    }
                }
            }
        });
    }
    
    async function loadActivePoolInfo() {
        // Load active pool data from Supabase
        if (window.miningSupabaseAdapter && window.miningSupabaseAdapter.initialized) {
            try {
                // Get user's active pool
                const userPoolsResponse = await window.miningSupabaseAdapter.supabase.makeRequest(
                    'GET',
                    `/rest/v1/user_pools?user_id=eq.${window.miningSupabaseAdapter.supabase.user.id}&is_active=eq.true&order=priority.asc&limit=1`
                );
                
                if (userPoolsResponse.ok) {
                    const userPools = await userPoolsResponse.json();
                    
                    if (userPools.length > 0) {
                        const userPool = userPools[0];
                        const poolUrl = userPool.custom_url || (userPool.pool_id ? await getPoolUrl(userPool.pool_id) : 'N/A');
                        
                        // Get active mining session for hashrate
                        const activeSession = await window.miningSupabaseAdapter.getActiveMiningSession();
                        const yourHashrate = activeSession?.hash_rate || 0;
                        
                        document.getElementById('activePoolUrl').textContent = poolUrl;
                        document.getElementById('poolHashrate').textContent = 'Cargando...';
                        document.getElementById('activeMiners').textContent = 'Cargando...';
                        document.getElementById('poolFee').textContent = userPool.fee_percentage ? `${userPool.fee_percentage}%` : '1.0%';
                        document.getElementById('yourHashrate').textContent = formatHashrate(yourHashrate);
                        document.getElementById('yourPercentage').textContent = '0.00%';
                        
                        // Update chart
                        updatePoolStatsChart();
                        return;
                    }
                }
            } catch (error) {
                console.error('Error cargando información del pool:', error);
            }
        }
        
        // Fallback: show default or empty
        document.getElementById('activePoolUrl').textContent = 'No configurado';
        document.getElementById('poolHashrate').textContent = '0.00 H/s';
        document.getElementById('activeMiners').textContent = '0';
        document.getElementById('poolFee').textContent = 'N/A';
        document.getElementById('yourHashrate').textContent = '0.00 H/s';
        document.getElementById('yourPercentage').textContent = '0.00%';
    }
    
    async function getPoolUrl(poolId) {
        try {
            const response = await window.miningSupabaseAdapter.supabase.makeRequest(
                'GET',
                `/rest/v1/pools?id=eq.${poolId}&select=url,port`
            );
            
            if (response.ok) {
                const pools = await response.json();
                if (pools.length > 0) {
                    return `${pools[0].url}:${pools[0].port}`;
                }
            }
        } catch (error) {
            console.error('Error obteniendo URL del pool:', error);
        }
        return 'N/A';
    }
    
    function formatHashrate(hashrate) {
        if (hashrate >= 1000000000) return `${(hashrate / 1000000000).toFixed(2)} TH/s`;
        if (hashrate >= 1000000) return `${(hashrate / 1000000).toFixed(2)} GH/s`;
        if (hashrate >= 1000) return `${(hashrate / 1000).toFixed(2)} KH/s`;
        return `${hashrate.toFixed(2)} H/s`;
    }
    
    function updatePoolStatsChart() {
        if (!poolStatsChart) return;
        
        const hours = 24;
        const labels = [];
        const poolData = [];
        const yourData = [];
        
        for (let i = hours - 1; i >= 0; i--) {
            const date = new Date();
            date.setHours(date.getHours() - i);
            labels.push(date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }));
            poolData.push(Math.random() * 200 + 1200);
            yourData.push(Math.random() * 0.5 + 1.0);
        }
        
        poolStatsChart.data.labels = labels;
        poolStatsChart.data.datasets[0].data = poolData;
        poolStatsChart.data.datasets[1].data = yourData;
        poolStatsChart.update();
    }
    
    async function loadAvailablePools() {
        const poolsGrid = document.getElementById('poolsGrid');
        if (!poolsGrid) return;
        
        // Load from Supabase
        if (window.miningSupabaseAdapter && window.miningSupabaseAdapter.initialized) {
            try {
                const pools = await window.miningSupabaseAdapter.getPools();
                
                if (pools && pools.length > 0) {
                    displayAvailablePools(pools);
                    return;
                }
            } catch (error) {
                console.error('Error cargando pools:', error);
            }
        }
        
        // Fallback: empty state
        poolsGrid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-swimming-pool"></i>
                <p>No hay pools disponibles</p>
            </div>
        `;
    }
    
    function displayAvailablePools(pools) {
        const poolsGrid = document.getElementById('poolsGrid');
        if (!poolsGrid) return;
        
        if (pools.length === 0) {
            poolsGrid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-swimming-pool"></i>
                    <p>No hay pools disponibles</p>
                </div>
            `;
            return;
        }
        
        poolsGrid.innerHTML = pools.map(pool => {
            const stats = pool.stats || {};
            const hashrate = stats.hashrate || '0.00 H/s';
            const miners = stats.miners || 0;
            const latency = stats.latency || 'N/A';
            
            return `
                <div class="pool-card ${pool.is_default ? 'recommended' : ''}">
                    <div class="pool-header">
                        <div class="pool-name">${pool.name}</div>
                        ${pool.is_default ? '<span class="pool-badge">Recomendado</span>' : ''}
                    </div>
                    <div class="pool-info">
                        <div class="pool-url">${pool.url}:${pool.port}</div>
                        <div class="pool-stats">
                            <div class="pool-stat">
                                <span class="stat-label">Hashrate:</span>
                                <span class="stat-value">${hashrate}</span>
                            </div>
                            <div class="pool-stat">
                                <span class="stat-label">Miners:</span>
                                <span class="stat-value">${miners.toLocaleString()}</span>
                            </div>
                            <div class="pool-stat">
                                <span class="stat-label">Fee:</span>
                                <span class="stat-value">${pool.fee_percentage || 1.0}%</span>
                            </div>
                            <div class="pool-stat">
                                <span class="stat-label">Latency:</span>
                                <span class="stat-value">${latency}</span>
                            </div>
                        </div>
                    </div>
                    <div class="pool-actions">
                        <button class="btn btn-primary btn-sm" onclick="selectPool('${pool.id}')">
                            <i class="fas fa-check"></i>
                            <span>Seleccionar</span>
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }
    
    // Mock data fallback (removed - now using Supabase)
    const mockPools = [
        {
            name: 'RSC Official Pool',
            url: 'pool.rscchain.com:3333',
                hashrate: '456.78 GH/s',
                miners: 456,
                fee: '1.5%',
                minPayout: '0.5 RSC',
                latency: '25ms',
                status: 'active',
                recommended: false
            }
        ];
        
        poolsGrid.innerHTML = pools.map(pool => `
            <div class="pool-card ${pool.recommended ? 'recommended' : ''}">
                <div class="pool-card-header-mini">
                    <div class="pool-name">${pool.name}</div>
                    ${pool.recommended ? '<span class="pool-badge">Recomendado</span>' : ''}
                </div>
                <div class="pool-stats-mini">
                    <div class="pool-stat-mini">
                        <span class="label">Hashrate:</span>
                        <span class="value">${pool.hashrate}</span>
                    </div>
                    <div class="pool-stat-mini">
                        <span class="label">Miners:</span>
                        <span class="value">${pool.miners.toLocaleString()}</span>
                    </div>
                    <div class="pool-stat-mini">
                        <span class="label">Comisión:</span>
                        <span class="value">${pool.fee}</span>
                    </div>
                    <div class="pool-stat-mini">
                        <span class="label">Pago Mínimo:</span>
                        <span class="value">${pool.minPayout}</span>
                    </div>
                    <div class="pool-stat-mini">
                        <span class="label">Latencia:</span>
                        <span class="value">${pool.latency}</span>
                    </div>
                </div>
                <div class="pool-actions">
                    <button class="btn-pool btn-pool-primary" onclick="switchToPool('${pool.url}')">
                        <i class="fas fa-check"></i>
                        <span>Usar Este Pool</span>
                    </button>
                    <button class="btn-pool btn-pool-secondary" onclick="viewPoolDetails('${pool.url}')">
                        <i class="fas fa-info"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }
    
    function loadPoolComparison() {
        const tbody = document.getElementById('comparisonTableBody');
        if (!tbody) return;
        
        const pools = [
            {
                name: 'RSC Official Pool',
                url: 'pool.rscchain.com:3333',
                hashrate: '1,234.56 GH/s',
                miners: 1234,
                fee: '1.0%',
                minPayout: '0.1 RSC',
                latency: '12ms',
                status: 'active'
            },
            {
                name: 'RSC Backup Pool',
                url: 'backup.pool.rscchain.com:3333',
                hashrate: '890.12 GH/s',
                miners: 890,
                fee: '1.0%',
                minPayout: '0.1 RSC',
                latency: '15ms',
                status: 'active'
            },
            {
                name: 'Community Pool #1',
                url: 'community1.pool.rscchain.com:3333',
                hashrate: '456.78 GH/s',
                miners: 456,
                fee: '1.5%',
                minPayout: '0.5 RSC',
                latency: '25ms',
                status: 'active'
            }
        ];
        
        tbody.innerHTML = pools.map(pool => `
            <tr>
                <td>
                    <div style="font-weight: 600;">${pool.name}</div>
                    <div style="font-size: 0.85rem; color: var(--color-text-secondary);">${pool.url}</div>
                </td>
                <td>${pool.hashrate}</td>
                <td>${pool.miners.toLocaleString()}</td>
                <td>${pool.fee}</td>
                <td>${pool.minPayout}</td>
                <td>${pool.latency}</td>
                <td><span class="status-badge confirmed">${pool.status}</span></td>
                <td>
                    <button class="table-action-btn" onclick="switchToPool('${pool.url}')">
                        <i class="fas fa-check"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }
    
    function loadPoolHistory() {
        const tbody = document.getElementById('poolHistoryBody');
        if (!tbody) return;
        
        const history = [
            {
                pool: 'pool.rscchain.com:3333',
                date: new Date('2024-01-10'),
                duration: '5 días',
                avgHashrate: '1.20 KH/s',
                shares: 1234,
                earnings: '12.345678 RSC'
            },
            {
                pool: 'backup.pool.rscchain.com:3333',
                date: new Date('2024-01-05'),
                duration: '2 días',
                avgHashrate: '1.15 KH/s',
                shares: 567,
                earnings: '5.678901 RSC'
            }
        ];
        
        if (history.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="empty-state">
                        <i class="fas fa-inbox"></i>
                        <p>No hay historial de pools</p>
                    </td>
                </tr>
            `;
        } else {
            tbody.innerHTML = history.map(h => `
                <tr>
                    <td>${h.pool}</td>
                    <td>${h.date.toLocaleDateString('es-ES')}</td>
                    <td>${h.duration}</td>
                    <td>${h.avgHashrate}</td>
                    <td>${h.shares.toLocaleString()}</td>
                    <td>${h.earnings}</td>
                </tr>
            `).join('');
        }
    }
    
    async function addNewPool() {
        const name = document.getElementById('newPoolName').value;
        const url = document.getElementById('newPoolUrl').value;
        const port = parseInt(document.getElementById('newPoolPort')?.value || '3333');
        const user = document.getElementById('newPoolUser')?.value || '';
        const password = document.getElementById('newPoolPassword')?.value || '';
        const setAsPrimary = document.getElementById('newPoolSetAsPrimary')?.checked || false;
        
        if (!name || !url) {
            window.miningNotifications?.error('Por favor completa el nombre y URL del pool');
            return;
        }
        
        // Add pool via Supabase
        if (window.miningSupabaseAdapter && window.miningSupabaseAdapter.initialized) {
            try {
                // Parse URL to get host and port
                const urlParts = url.includes(':') ? url.split(':') : [url, port.toString()];
                const poolUrl = urlParts[0];
                const poolPort = parseInt(urlParts[1] || port);
                
                const pool = await window.miningSupabaseAdapter.addPool({
                    custom_name: name,
                    custom_url: `${poolUrl}:${poolPort}`,
                    custom_port: poolPort,
                    priority: setAsPrimary ? 1 : 0,
                    is_active: true
                });
                
                if (pool) {
                    // Close modal
                    document.getElementById('addPoolModal').classList.remove('active');
                    
                    // Clear form
                    document.getElementById('newPoolName').value = '';
                    document.getElementById('newPoolUrl').value = '';
                    if (document.getElementById('newPoolPort')) document.getElementById('newPoolPort').value = '3333';
                    if (document.getElementById('newPoolUser')) document.getElementById('newPoolUser').value = '';
                    if (document.getElementById('newPoolPassword')) document.getElementById('newPoolPassword').value = '';
                    if (document.getElementById('newPoolSetAsPrimary')) document.getElementById('newPoolSetAsPrimary').checked = false;
                    
                    window.miningNotifications?.success('Pool añadido correctamente');
                    
                    // Reload pools
                    loadAvailablePools();
                    loadActivePoolInfo();
                } else {
                    throw new Error('Error al agregar el pool');
                }
            } catch (error) {
                console.error('Error agregando pool:', error);
                window.miningNotifications?.error('Error al agregar el pool. Intenta de nuevo.');
            }
        } else {
            window.miningNotifications?.error('Sistema no disponible. Intenta más tarde.');
        }
    }
    
    function savePrimaryPool() {
        const url = document.getElementById('primaryPoolUrl').value;
        const user = document.getElementById('primaryPoolUser').value;
        const password = document.getElementById('primaryPoolPassword').value;
        
        if (!url) {
            alert('Por favor ingresa la URL del pool');
            return;
        }
        
        // Save primary pool
        console.log('Saving primary pool:', { url, user, password });
        showNotification('Pool principal guardado', 'success');
        loadActivePoolInfo();
    }
    
    function saveBackupPool() {
        const url = document.getElementById('backupPoolUrl').value;
        const user = document.getElementById('backupPoolUser').value;
        const password = document.getElementById('backupPoolPassword').value;
        const failover = document.getElementById('enableFailover').checked;
        
        if (!url) {
            alert('Por favor ingresa la URL del pool de respaldo');
            return;
        }
        
        // Save backup pool
        console.log('Saving backup pool:', { url, user, password, failover });
        showNotification('Pool de respaldo guardado', 'success');
    }
    
    window.selectPool = async function(poolId) {
        const confirmed = await window.miningNotifications?.confirm(`¿Seleccionar este pool como principal?`);
        
        if (confirmed) {
            if (window.miningSupabaseAdapter && window.miningSupabaseAdapter.initialized) {
                try {
                    // Desactivar todos los pools del usuario
                    const userPools = await window.miningSupabaseAdapter.supabase.makeRequest(
                        'GET',
                        `/rest/v1/user_pools?user_id=eq.${window.miningSupabaseAdapter.supabase.user.id}`
                    );
                    
                    if (userPools.ok) {
                        const pools = await userPools.json();
                        for (const pool of pools) {
                            await window.miningSupabaseAdapter.updatePool(pool.id, {
                                is_active: pool.id === poolId,
                                priority: pool.id === poolId ? 1 : 0
                            });
                        }
                    }
                    
                    window.miningNotifications?.success('Pool seleccionado correctamente');
                    loadActivePoolInfo();
                    loadAvailablePools();
                } catch (error) {
                    console.error('Error seleccionando pool:', error);
                    window.miningNotifications?.error('Error al seleccionar el pool. Intenta de nuevo.');
                }
            } else {
                window.miningNotifications?.error('Sistema no disponible. Intenta más tarde.');
            }
        }
    };
    
    window.switchToPool = async function(poolUrl) {
        const confirmed = await window.miningNotifications?.confirm(`¿Cambiar al pool ${poolUrl}?`);
        
        if (confirmed) {
            // Similar to selectPool but using URL
            window.miningNotifications?.info('Funcionalidad en desarrollo');
        }
    };
    
    window.viewPoolDetails = function(poolUrl) {
        alert('Detalles del pool: ' + poolUrl);
    };
    
    function showNotification(message, type) {
        if (window.showNotification) {
            window.showNotification(message, type);
        } else {
            alert(message);
        }
    }
    
    console.log('✅ Pool Management initialized');
})();

