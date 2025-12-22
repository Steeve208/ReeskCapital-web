// ===== REFERRALS PAGE LOGIC =====

(function() {
    'use strict';
    
    let commissionsChart = null;
    
    document.addEventListener('DOMContentLoaded', async function() {
        await initializeReferrals();
        setupEventListeners();
        await loadReferralsData(); // Esta función ya carga comisiones también
        setupCommissionsChart();
    });
    
    async function initializeReferrals() {
        console.log('👥 Initializing Referrals page...');
        
        // Cargar código de referral del usuario
        await loadReferralCode();
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
    
    async function loadReferralCode() {
        try {
            // Esperar a que Supabase esté listo
            const isReady = await waitForSupabaseIntegration();
            
            if (!isReady) {
                console.warn('⚠️ No se pudo cargar código de referral: Supabase no disponible');
                return;
            }
            
            const userId = window.supabaseIntegration.user.id;
            let referralCode = window.supabaseIntegration.user.referralCode || 
                             window.supabaseIntegration.user.referral_code;
            
            // Si no está en memoria, obtenerlo desde la base de datos
            if (!referralCode) {
                console.log('📡 Obteniendo código de referral desde Supabase...');
                try {
                    const userResponse = await window.supabaseIntegration.makeRequest(
                        'GET',
                        `/rest/v1/users?id=eq.${userId}&select=referral_code`
                    );
                    
                    if (userResponse.ok) {
                        const users = await userResponse.json();
                        if (users.length > 0 && users[0].referral_code) {
                            referralCode = users[0].referral_code;
                            // Guardar en el objeto user para futuras referencias
                            window.supabaseIntegration.user.referralCode = referralCode;
                            window.supabaseIntegration.user.referral_code = referralCode;
                        }
                    }
                } catch (error) {
                    console.error('❌ Error obteniendo código de referral desde BD:', error);
                    return;
                }
            }
            
            if (referralCode) {
                const referralLink = `${window.location.origin}${window.location.pathname.replace('referrals.html', 'login.html')}?ref=${referralCode}`;
                
                const codeInput = document.getElementById('referralCode');
                const linkInput = document.getElementById('referralLink');
                
                if (codeInput) {
                    codeInput.value = referralCode;
                    console.log('✅ Código de referral cargado:', referralCode);
                }
                if (linkInput) {
                    linkInput.value = referralLink;
                    console.log('✅ Link de referral cargado:', referralLink);
                }
            } else {
                console.warn('⚠️ No se encontró código de referral para el usuario');
            }
        } catch (error) {
            console.error('❌ Error cargando código de referral:', error);
        }
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
    
    async function waitForSupabase() {
        let attempts = 0;
        const maxAttempts = 50;
        
        return new Promise((resolve) => {
            const checkInterval = setInterval(() => {
                attempts++;
                
                // Verificar si supabaseIntegration está disponible y autenticado
                if (window.supabaseIntegration && 
                    window.supabaseIntegration.user && 
                    window.supabaseIntegration.user.isAuthenticated &&
                    window.supabaseIntegration.user.id) {
                    clearInterval(checkInterval);
                    console.log('✅ Referrals: Supabase listo y autenticado');
                    resolve(true);
                    return;
                }
                
                if (attempts >= maxAttempts) {
                    clearInterval(checkInterval);
                    console.warn('⚠️ Referrals: Supabase no disponible después de esperar');
                    resolve(false);
                }
            }, 100);
        });
    }
    
    async function loadReferralsData() {
        // Esperar a que Supabase esté listo y autenticado
        const isSupabaseReady = await waitForSupabase();
        
        if (isSupabaseReady && window.supabaseIntegration && window.supabaseIntegration.user && window.supabaseIntegration.user.isAuthenticated) {
            try {
                console.log('📡 Referrals: Cargando datos desde Supabase...');
                const userId = window.supabaseIntegration.user.id;
                
                // 1. Obtener lista de referidos desde la tabla referrals
                console.log('📡 Obteniendo referidos para usuario:', userId);
                const referralsResponse = await window.supabaseIntegration.makeRequest(
                    'GET',
                    `/rest/v1/referrals?referrer_id=eq.${userId}&select=id,referrer_id,referred_id,created_at,commission_rate,total_commission`
                );
                
                let referrals = [];
                if (referralsResponse.ok) {
                    const referralsData = await referralsResponse.json();
                    console.log('✅ Referidos obtenidos:', referralsData.length, referralsData);
                    
                    // Para cada referido, obtener sus datos completos, hashrate y earnings
                    for (const ref of referralsData) {
                        const referredId = ref.referred_id;
                        console.log('📊 Procesando referido:', referredId);
                        
                        // Obtener datos del usuario referido
                        const userResponse = await window.supabaseIntegration.makeRequest(
                            'GET',
                            `/rest/v1/users?id=eq.${referredId}&select=id,email,username,created_at,balance,status,is_active,referral_code`
                        );
                        
                        let userData = {};
                        if (userResponse.ok) {
                            const users = await userResponse.json();
                            if (users.length > 0) {
                                userData = users[0];
                                console.log('✅ Datos del usuario referido:', userData.email);
                            } else {
                                console.warn('⚠️ Usuario referido no encontrado:', referredId);
                            }
                        } else {
                            console.error('❌ Error obteniendo datos del usuario:', userResponse.status);
                        }
                        
                        // Obtener hashrate promedio desde mining_sessions
                        const hashrateResponse = await window.supabaseIntegration.makeRequest(
                            'GET',
                            `/rest/v1/mining_sessions?user_id=eq.${referredId}&status=eq.completed&select=hash_rate`
                        );
                        
                        let avgHashrate = 0;
                        if (hashrateResponse.ok) {
                            const sessions = await hashrateResponse.json();
                            if (sessions.length > 0) {
                                const totalHashrate = sessions.reduce((sum, s) => sum + parseFloat(s.hash_rate || 0), 0);
                                avgHashrate = totalHashrate / sessions.length;
                                console.log('📈 Hashrate promedio:', avgHashrate);
                            }
                        }
                        
                        // Obtener earnings totales desde transactions
                        const earningsResponse = await window.supabaseIntegration.makeRequest(
                            'GET',
                            `/rest/v1/transactions?user_id=eq.${referredId}&type=eq.mining&amount=gt.0&select=amount,status`
                        );
                        
                        let totalEarnings = 0;
                        if (earningsResponse.ok) {
                            const transactions = await earningsResponse.json();
                            totalEarnings = transactions.reduce((sum, t) => {
                                const status = t.status || 'completed';
                                if (status === 'completed' || status === null) {
                                    return sum + parseFloat(t.amount || 0);
                                }
                                return sum;
                            }, 0);
                            console.log('💰 Earnings totales:', totalEarnings);
                        }
                        
                        referrals.push({
                            ...ref,
                            referred_id: referredId,
                            referred_email: userData.email || 'N/A',
                            referred_username: userData.username || userData.email || 'N/A',
                            referred_joined_at: userData.created_at || ref.created_at,
                            referred_balance: parseFloat(userData.balance || 0),
                            referred_status: userData.status,
                            referred_is_active: userData.is_active,
                            referred_referral_code: userData.referral_code,
                            avg_hashrate: avgHashrate,
                            total_earnings: totalEarnings,
                            total_commission: parseFloat(ref.total_commission || 0)
                        });
                    }
                }
                
                // 2. Obtener comisiones desde transactions
                const commissionsResponse = await window.supabaseIntegration.makeRequest(
                    'GET',
                    `/rest/v1/transactions?user_id=eq.${userId}&type=eq.referral_commission&order=created_at.desc&select=*`
                );
                
                let commissions = [];
                if (commissionsResponse.ok) {
                    commissions = await commissionsResponse.json();
                }
                
                // 3. Calcular estadísticas
                const totalReferrals = referrals.length;
                const activeReferrals = referrals.filter(r => {
                    const status = r.referred_status;
                    const isActive = r.referred_is_active;
                    return (status === 'active' || status === null) && 
                           (isActive === true || isActive === null);
                }).length;
                
                const totalCommissions = commissions.reduce((sum, c) => {
                    const status = c.status || 'completed';
                    if (status === 'completed' || status === null) {
                        return sum + parseFloat(c.amount || 0);
                    }
                    return sum;
                }, 0);
                
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const todayCommissions = commissions
                    .filter(c => {
                        const date = new Date(c.created_at);
                        return date >= today;
                    })
                    .reduce((sum, c) => {
                        const status = c.status || 'completed';
                        if (status === 'completed' || status === null) {
                            return sum + parseFloat(c.amount || 0);
                        }
                        return sum;
                    }, 0);
                
                // 4. Actualizar UI
                if (document.getElementById('totalReferrals')) {
                    document.getElementById('totalReferrals').textContent = totalReferrals;
                }
                
                if (document.getElementById('totalCommissions')) {
                    document.getElementById('totalCommissions').textContent = totalCommissions.toFixed(6) + ' RSC';
                }
                
                if (document.getElementById('todayCommissions')) {
                    document.getElementById('todayCommissions').textContent = todayCommissions.toFixed(6) + ' RSC';
                }
                
                console.log('✅ Referrals: Datos cargados desde Supabase', {
                    total: totalReferrals,
                    active: activeReferrals,
                    commissions: commissions.length
                });
                
                // 5. Cargar listas
                loadReferralsList(referrals);
                loadCommissions(commissions);
                
                // 6. Actualizar logros de referidos
                updateReferralMilestones(totalReferrals);
                return;
                
            } catch (error) {
                console.error('❌ Error cargando datos de referidos desde Supabase:', error);
            }
        }
        
        // Fallback a mock data
        console.warn('⚠️ Referrals: Usando datos mock');
        loadReferralsList();
        loadCommissions();
        updateReferralMilestones(0); // Sin referidos
    }
    
    function updateReferralMilestones(totalReferrals) {
        const milestones = [
            { id: 1, target: 1, reward: 10 },
            { id: 5, target: 5, reward: 50 },
            { id: 10, target: 10, reward: 150 },
            { id: 25, target: 25, reward: 500 }
        ];
        
        milestones.forEach(milestone => {
            const current = totalReferrals;
            const target = milestone.target;
            const progress = Math.min((current / target) * 100, 100);
            const isCompleted = current >= target;
            
            // Actualizar barra de progreso
            const progressBar = document.getElementById(`milestone-${milestone.id}-progress`);
            if (progressBar) {
                progressBar.style.width = `${progress}%`;
            }
            
            // Actualizar texto de progreso
            const progressText = document.getElementById(`milestone-${milestone.id}-text`);
            if (progressText) {
                if (isCompleted) {
                    progressText.textContent = `${target}/${target} Completado`;
                } else {
                    progressText.textContent = `${current}/${target} Referidos`;
                }
            }
            
            // Actualizar botón
            const btn = document.getElementById(`milestone-${milestone.id}-btn`);
            if (btn) {
                if (isCompleted) {
                    // Por ahora, solo mostrar "Reclamado" si está completado
                    // TODO: Agregar verificación desde BD de logros reclamados
                    btn.textContent = 'Reclamado';
                    btn.className = 'btn btn-primary btn-sm';
                    btn.disabled = true;
                } else {
                    btn.textContent = 'En Progreso';
                    btn.className = 'btn btn-secondary btn-sm';
                    btn.disabled = true;
                }
            }
        });
        
        console.log('✅ Logros actualizados:', { totalReferrals });
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
    
    function loadReferralsList(referralsData = null) {
        const tbody = document.getElementById('referralsTableBody');
        if (!tbody) return;
        
        if (referralsData && referralsData.length > 0) {
            tbody.innerHTML = referralsData.map(ref => {
                // Datos del referido (desde backend o estructura Supabase)
                const email = ref.referred_email || ref.email || 'N/A';
                const username = ref.referred_username || ref.username || email;
                const referredId = ref.referred_id || ref.id;
                const date = new Date(ref.created_at || ref.referred_joined_at);
                
                // Hashrate y earnings desde backend (ya calculados en la query)
                const hashrate = parseFloat(ref.avg_hashrate || 0);
                const earnings = parseFloat(ref.total_earnings || 0);
                const commission = parseFloat(ref.total_commission || 0);
                
                // Status del referido (manejar tanto status VARCHAR como is_active BOOLEAN)
                const status = ref.referred_status || ref.status;
                const isActiveValue = ref.referred_is_active !== undefined ? ref.referred_is_active : null;
                const isActive = (status === 'active' || status === null) && 
                                (isActiveValue === true || isActiveValue === null);
                
                return `
                    <tr>
                        <td>${email}</td>
                        <td>${date.toLocaleDateString('es-ES')}</td>
                        <td>
                            <span class="status-badge ${isActive ? 'confirmed' : 'pending'}">
                                ${isActive ? 'Activo' : 'Inactivo'}
                            </span>
                        </td>
                        <td>${formatHashrate(hashrate)}</td>
                        <td>${earnings.toFixed(6)} RSC</td>
                        <td>
                            <span class="amount-value positive">${commission.toFixed(6)} RSC</span>
                        </td>
                        <td>
                            <button class="table-action-btn" onclick="viewReferralDetails('${referredId}')">
                                <i class="fas fa-eye"></i>
                            </button>
                        </td>
                    </tr>
                `;
            }).join('');
            return;
        }
        
        // No mostrar datos mock - solo mostrar mensaje vacío
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="empty-state">
                    <i class="fas fa-user-plus"></i>
                    <p>No tienes referidos aún. ¡Comparte tu código para empezar a ganar!</p>
                </td>
            </tr>
        `;
    }
    
    function loadCommissions(commissionsData = null) {
        const tbody = document.getElementById('commissionsTableBody');
        if (!tbody) return;
        
        if (commissionsData && commissionsData.length > 0) {
            tbody.innerHTML = commissionsData.map(comm => {
                const date = new Date(comm.created_at);
                const status = comm.status || 'completed';
                
                // Obtener información del referido desde metadata o description
                let referredEmail = 'N/A';
                let miningAmount = 0;
                
                if (comm.metadata) {
                    referredEmail = comm.metadata.referredEmail || comm.metadata.referred_email || 'N/A';
                    miningAmount = Math.abs(parseFloat(comm.metadata.miningAmount || comm.metadata.mining_amount || 0));
                } else if (comm.description) {
                    // Intentar extraer del description si existe
                    const match = comm.description.match(/from (.+?)(?: -|$)/i);
                    if (match) referredEmail = match[1];
                }
                
                // Si no hay miningAmount en metadata, calcular desde balance_before y balance_after
                if (miningAmount === 0 && comm.balance_before !== undefined && comm.balance_after !== undefined) {
                    miningAmount = Math.abs(parseFloat(comm.balance_after) - parseFloat(comm.balance_before));
                }
                
                return `
                    <tr>
                        <td>${date.toLocaleString('es-ES')}</td>
                        <td>${referredEmail}</td>
                        <td>${miningAmount.toFixed(6)} RSC</td>
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
        
        // No mostrar datos mock - solo mostrar mensaje vacío
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="empty-state">
                    <i class="fas fa-coins"></i>
                    <p>No hay comisiones registradas</p>
                </td>
            </tr>
        `;
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
            // Obtener datos reales desde Supabase
            if (window.supabaseIntegration && 
                window.supabaseIntegration.user && 
                window.supabaseIntegration.user.isAuthenticated) {
                
                const userId = window.supabaseIntegration.user.id;
                const days = 30;
                const startDate = new Date();
                startDate.setDate(startDate.getDate() - days);
                
                // Obtener comisiones de los últimos 30 días
                const response = await window.supabaseIntegration.makeRequest(
                    'GET',
                    `/rest/v1/transactions?user_id=eq.${userId}&type=eq.referral_commission&created_at=gte.${startDate.toISOString()}&order=created_at.asc&select=amount,created_at,status`
                );
                
                if (response.ok) {
                    const transactions = await response.json();
                    
                    // Agrupar por día
                    const dataMap = new Map();
                    transactions.forEach(t => {
                        const date = new Date(t.created_at);
                        const key = date.toISOString().split('T')[0];
                        const status = t.status || 'completed';
                        
                        if (status === 'completed' || status === null) {
                            const current = dataMap.get(key) || 0;
                            dataMap.set(key, current + parseFloat(t.amount || 0));
                        }
                    });
                    
                    // Crear arrays para el gráfico
                    const labels = [];
                    const data = [];
                    
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


