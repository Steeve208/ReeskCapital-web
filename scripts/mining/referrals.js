// ===== REFERRALS PAGE LOGIC =====

(function() {
    'use strict';
    
    let commissionsChart = null;
    
    document.addEventListener('DOMContentLoaded', function() {
        initializeReferrals();
        setupEventListeners();
        loadReferralsData();
        loadCommissions();
        setupCommissionsChart();
    });
    
    function initializeReferrals() {
        console.log('👥 Initializing Referrals page...');
    }
    
    function setupEventListeners() {
        // Copy referral code
        const copyCodeBtn = document.getElementById('copyReferralCodeBtn');
        if (copyCodeBtn) {
            copyCodeBtn.addEventListener('click', () => {
                const code = document.getElementById('referralCode').value;
                copyToClipboard(code);
                showNotification('Código copiado al portapapeles', 'success');
            });
        }
        
        // Copy referral link
        const copyLinkBtn = document.getElementById('copyReferralLinkBtn');
        if (copyLinkBtn) {
            copyLinkBtn.addEventListener('click', () => {
                const link = document.getElementById('referralLink').value;
                copyToClipboard(link);
                showNotification('Link copiado al portapapeles', 'success');
            });
        }
        
        // Download QR
        const downloadQRBtn = document.getElementById('downloadQRBtn');
        if (downloadQRBtn) {
            downloadQRBtn.addEventListener('click', downloadQRCode);
        }
        
        // Filter referrals
        const referralFilter = document.getElementById('referralFilter');
        if (referralFilter) {
            referralFilter.addEventListener('change', function() {
                filterReferrals(this.value);
            });
        }
    }
    
    async function loadReferralsData() {
        // Intentar cargar desde backend API primero
        if (window.miningBackendAPI && window.miningBackendAPI.isAuthenticated()) {
            try {
                // Cargar referidos
                const referralsResponse = await window.miningBackendAPI.request('GET', '/api/referrals');
                if (referralsResponse.success && referralsResponse.data) {
                    const referrals = referralsResponse.data.referrals || [];
                    
                    // Cargar comisiones
                    const commissionsResponse = await window.miningBackendAPI.request('GET', '/api/referrals/commissions?period=all');
                    const commissions = commissionsResponse.success && commissionsResponse.data 
                        ? commissionsResponse.data.commissions || [] 
                        : [];
                    
                    // Update stats
                    if (document.getElementById('totalReferrals')) {
                        document.getElementById('totalReferrals').textContent = referralsResponse.data.total_referrals || referrals.length;
                    }
                    
                    const totalCommissions = commissionsResponse.success && commissionsResponse.data
                        ? parseFloat(commissionsResponse.data.total || 0)
                        : commissions.reduce((sum, c) => sum + parseFloat(c.amount || 0), 0);
                    
                    if (document.getElementById('totalCommissions')) {
                        document.getElementById('totalCommissions').textContent = totalCommissions.toFixed(6) + ' RSC';
                    }
                    
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const todayCommissions = commissions
                        .filter(c => {
                            const date = new Date(c.created_at);
                            return date >= today;
                        })
                        .reduce((sum, c) => sum + parseFloat(c.amount || 0), 0);
                    
                    if (document.getElementById('todayCommissions')) {
                        document.getElementById('todayCommissions').textContent = todayCommissions.toFixed(6) + ' RSC';
                    }
                    
                    // Load referrals list
                    await loadReferralsList(referrals);
                    await loadCommissions(commissions);
                    await updateCommissionsChart();
                    return;
                }
            } catch (error) {
                console.error('Error cargando datos de referidos desde backend:', error);
            }
        }
        
        // Fallback a Supabase o mock data
        if (window.miningSupabaseAdapter) {
            try {
                const referrals = await window.miningSupabaseAdapter.getReferrals();
                const commissions = await window.miningSupabaseAdapter.getReferralCommissions('all');
                
                // Update stats
                if (document.getElementById('totalReferrals')) {
                    document.getElementById('totalReferrals').textContent = referrals.length;
                }
                
                const totalCommissions = commissions.reduce((sum, c) => sum + parseFloat(c.amount || 0), 0);
                if (document.getElementById('totalCommissions')) {
                    document.getElementById('totalCommissions').textContent = totalCommissions.toFixed(6) + ' RSC';
                }
                
                const todayCommissions = commissions.filter(c => {
                    const date = new Date(c.created_at);
                    const today = new Date();
                    return date.toDateString() === today.toDateString();
                }).reduce((sum, c) => sum + parseFloat(c.amount || 0), 0);
                
                if (document.getElementById('todayCommissions')) {
                    document.getElementById('todayCommissions').textContent = todayCommissions.toFixed(6) + ' RSC';
                }
                
                // Load referrals list
                await loadReferralsList(referrals);
                await loadCommissions(commissions);
            } catch (error) {
                console.error('Error cargando datos de referidos:', error);
                await loadReferralsList();
            }
        } else {
            await loadReferralsList();
        }
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
    
    async function loadReferralsList(referralsData = null) {
        const tbody = document.getElementById('referralsTableBody');
        if (!tbody) return;
        
        if (referralsData && referralsData.length > 0) {
            tbody.innerHTML = referralsData.map(ref => {
                const email = ref.referred_email || ref.email || 'N/A';
                const username = ref.referred_username || ref.username || email;
                const date = new Date(ref.created_at || ref.referred_joined_at);
                const hashrate = parseFloat(ref.avg_hashrate || 0);
                const earnings = parseFloat(ref.total_earnings || 0);
                const commission = parseFloat(ref.total_commission || 0);
                const status = ref.status || 'active';
                
                return `
                    <tr>
                        <td>${email}</td>
                        <td>${date.toLocaleDateString('es-ES')}</td>
                        <td>
                            <span class="status-badge ${status === 'active' ? 'confirmed' : 'pending'}">
                                ${status === 'active' ? 'Activo' : 'Inactivo'}
                            </span>
                        </td>
                        <td>${formatHashrate(hashrate)}</td>
                        <td>${earnings.toFixed(6)} RSC</td>
                        <td>
                            <span class="amount-value positive">${commission.toFixed(6)} RSC</span>
                        </td>
                        <td>
                            <button class="table-action-btn" onclick="viewReferralDetails('${ref.referred_id || ref.id}')">
                                <i class="fas fa-eye"></i>
                            </button>
                        </td>
                    </tr>
                `;
            }).join('');
            return;
        }
        
        const referrals = [
            {
                user: 'usuario1@example.com',
                date: new Date('2024-01-10'),
                status: 'active',
                hashrate: '1.23 KH/s',
                totalEarnings: '45.678901 RSC',
                commissions: '4.567890 RSC'
            },
            {
                user: 'usuario2@example.com',
                date: new Date('2024-01-08'),
                status: 'active',
                hashrate: '0.89 KH/s',
                totalEarnings: '32.123456 RSC',
                commissions: '3.212346 RSC'
            },
            {
                user: 'usuario3@example.com',
                date: new Date('2024-01-05'),
                status: 'inactive',
                hashrate: '0.00 KH/s',
                totalEarnings: '5.123456 RSC',
                commissions: '0.512346 RSC'
            }
        ];
        
        if (referrals.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="empty-state">
                        <i class="fas fa-user-plus"></i>
                        <p>No tienes referidos aún. ¡Comparte tu código para empezar a ganar!</p>
                    </td>
                </tr>
            `;
        } else {
            tbody.innerHTML = referrals.map(ref => `
                <tr>
                    <td>${ref.user}</td>
                    <td>${ref.date.toLocaleDateString('es-ES')}</td>
                    <td>
                        <span class="status-badge ${ref.status === 'active' ? 'confirmed' : 'pending'}">
                            ${ref.status === 'active' ? 'Activo' : 'Inactivo'}
                        </span>
                    </td>
                    <td>${ref.hashrate}</td>
                    <td>${ref.totalEarnings}</td>
                    <td>
                        <span class="amount-value positive">${ref.commissions}</span>
                    </td>
                    <td>
                        <button class="table-action-btn" onclick="viewReferralDetails('${ref.user}')">
                            <i class="fas fa-eye"></i>
                        </button>
                    </td>
                </tr>
            `).join('');
        }
    }
    
    async function loadCommissions(commissionsData = null) {
        const tbody = document.getElementById('commissionsTableBody');
        if (!tbody) return;
        
        if (commissionsData && commissionsData.length > 0) {
            // Si tenemos datos del backend, obtener información del referido desde reference_id
            const commissionsWithDetails = await Promise.all(commissionsData.map(async (comm) => {
                let referredEmail = 'N/A';
                let miningAmount = 0;
                
                // Intentar obtener información del referido desde reference_id
                if (comm.reference_id && window.miningBackendAPI && window.miningBackendAPI.isAuthenticated()) {
                    try {
                        // El reference_id debería ser el user_id del referido
                        // Podríamos hacer una consulta adicional, pero por ahora usamos metadata
                        referredEmail = comm.metadata?.referredEmail || comm.description?.match(/from (.+)/)?.[1] || 'N/A';
                        miningAmount = parseFloat(comm.metadata?.miningAmount || comm.balance_after - comm.balance_before || 0);
                    } catch (error) {
                        console.warn('Error obteniendo detalles de comisión:', error);
                    }
                } else {
                    referredEmail = comm.metadata?.referredEmail || 'N/A';
                    miningAmount = Math.abs(parseFloat(comm.metadata?.miningAmount || 0));
                }
                
                return {
                    ...comm,
                    referredEmail,
                    miningAmount
                };
            }));
            
            tbody.innerHTML = commissionsWithDetails.map(comm => {
                const date = new Date(comm.created_at);
                const status = comm.status || 'completed';
                
                return `
                    <tr>
                        <td>${date.toLocaleString('es-ES')}</td>
                        <td>${comm.referredEmail}</td>
                        <td>${comm.miningAmount.toFixed(6)} RSC</td>
                        <td>
                            <span class="amount-value positive">+${parseFloat(comm.amount || 0).toFixed(6)} RSC</span>
                        </td>
                        <td>
                            <span class="status-badge ${status === 'completed' ? 'confirmed' : 'pending'}">
                                ${status === 'completed' ? 'Confirmado' : 'Pendiente'}
                            </span>
                        </td>
                    </tr>
                `;
            }).join('');
            return;
        }
        
        const commissions = [
            {
                date: new Date('2024-01-15T10:30:00'),
                referral: 'usuario1@example.com',
                referralEarnings: '1.234567 RSC',
                commission: '0.123457 RSC',
                status: 'confirmed'
            },
            {
                date: new Date('2024-01-14T15:20:00'),
                referral: 'usuario2@example.com',
                referralEarnings: '0.890123 RSC',
                commission: '0.089012 RSC',
                status: 'confirmed'
            },
            {
                date: new Date('2024-01-13T09:15:00'),
                referral: 'usuario1@example.com',
                referralEarnings: '2.345678 RSC',
                commission: '0.234568 RSC',
                status: 'pending'
            }
        ];
        
        if (commissions.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" class="empty-state">
                        <i class="fas fa-coins"></i>
                        <p>No hay comisiones registradas</p>
                    </td>
                </tr>
            `;
        } else {
            tbody.innerHTML = commissions.map(comm => `
                <tr>
                    <td>${comm.date.toLocaleString('es-ES')}</td>
                    <td>${comm.referral}</td>
                    <td>${comm.referralEarnings}</td>
                    <td>
                        <span class="amount-value positive">+${comm.commission}</span>
                    </td>
                    <td>
                        <span class="status-badge ${comm.status === 'confirmed' ? 'confirmed' : 'pending'}">
                            ${comm.status === 'confirmed' ? 'Confirmado' : 'Pendiente'}
                        </span>
                    </td>
                </tr>
            `).join('');
        }
    }
    
    function setupCommissionsChart() {
        const ctx = document.getElementById('commissionsChart');
        if (!ctx) return;
        
        commissionsChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: [],
                datasets: [{
                    label: 'Comisiones (RSC)',
                    data: [],
                    backgroundColor: 'rgba(0, 255, 136, 0.6)',
                    borderColor: '#00ff88',
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
        
        // Load chart data
        updateCommissionsChart();
    }
    
    async function updateCommissionsChart() {
        if (!commissionsChart) return;
        
        try {
            // Intentar obtener datos reales del backend
            if (window.miningBackendAPI && window.miningBackendAPI.isAuthenticated()) {
                const response = await window.miningBackendAPI.request('GET', '/api/referrals/commissions-chart?days=30');
                
                if (response.success && response.data && response.data.chart_data) {
                    const chartData = response.data.chart_data;
                    
                    // Crear un mapa de fechas para llenar días faltantes
                    const days = 30;
                    const labels = [];
                    const data = [];
                    const dataMap = new Map();
                    
                    // Mapear datos existentes
                    chartData.forEach(item => {
                        const date = new Date(item.date);
                        const key = date.toISOString().split('T')[0];
                        dataMap.set(key, item.commissions);
                    });
                    
                    // Llenar los últimos 30 días
                    for (let i = days - 1; i >= 0; i--) {
                        const date = new Date();
                        date.setDate(date.getDate() - i);
                        const key = date.toISOString().split('T')[0];
                        
                        labels.push(date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }));
                        data.push(dataMap.get(key) || 0);
                    }
                    
                    commissionsChart.data.labels = labels;
                    commissionsChart.data.datasets[0].data = data;
                    commissionsChart.update();
                    return;
                }
            }
        } catch (error) {
            console.error('Error cargando datos del gráfico de comisiones:', error);
        }
        
        // Fallback a datos mock
        const days = 30;
        const labels = [];
        const data = [];
        
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            labels.push(date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }));
            data.push(Math.random() * 2 + 0.1);
        }
        
        commissionsChart.data.labels = labels;
        commissionsChart.data.datasets[0].data = data;
        commissionsChart.update();
    }
    
    function filterReferrals(filter) {
        // Filter referrals list
        console.log('Filtering referrals:', filter);
        loadReferralsList(); // Reload with filter
    }
    
    function copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            console.log('Copied to clipboard:', text);
        }).catch(err => {
            console.error('Failed to copy:', err);
        });
    }
    
    function downloadQRCode() {
        // Generate and download QR code
        alert('Descarga de QR Code - Funcionalidad próximamente');
    }
    
    window.shareReferral = function(platform) {
        const code = document.getElementById('referralCode').value;
        const link = document.getElementById('referralLink').value;
        
        let shareUrl = '';
        const text = `¡Únete a RSC Mining usando mi código de referido ${code}! ${link}`;
        
        switch(platform) {
            case 'twitter':
                shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
                break;
            case 'telegram':
                shareUrl = `https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(text)}`;
                break;
            case 'whatsapp':
                shareUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
                break;
        }
        
        if (shareUrl) {
            window.open(shareUrl, '_blank');
        }
    };
    
    window.viewReferralDetails = function(user) {
        alert('Detalles del referido: ' + user);
    };
    
    function showNotification(message, type) {
        if (window.showNotification) {
            window.showNotification(message, type);
        } else {
            alert(message);
        }
    }
    
    console.log('✅ Referrals page initialized');
})();


