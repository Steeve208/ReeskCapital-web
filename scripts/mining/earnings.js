// ===== EARNINGS PAGE LOGIC =====

(function() {
    'use strict';
    
    document.addEventListener('DOMContentLoaded', function() {
        initializeEarnings();
        setupEventListeners();
        loadEarningsData();
        loadPayoutHistory();
    });
    
    function initializeEarnings() {
        console.log('💰 Initializing Earnings page...');
    }
    
    function setupEventListeners() {
        // Withdrawal amount input
        const withdrawalAmount = document.getElementById('withdrawalAmount');
        const receiveAmount = document.getElementById('receiveAmount');
        
        if (withdrawalAmount && receiveAmount) {
            withdrawalAmount.addEventListener('input', function() {
                const amount = parseFloat(this.value) || 0;
                const fee = 0.001; // Network fee
                const receive = Math.max(0, amount - fee);
                receiveAmount.textContent = receive.toFixed(6) + ' RSC';
            });
        }
        
        // Withdraw button
        const withdrawBtn = document.getElementById('withdrawBtn');
        if (withdrawBtn) {
            withdrawBtn.addEventListener('click', processWithdrawal);
        }
        
        // Breakdown period selector
        const breakdownPeriod = document.getElementById('breakdownPeriod');
        if (breakdownPeriod) {
            breakdownPeriod.addEventListener('change', function() {
                loadEarningsBreakdown(this.value);
            });
        }
    }
    
    async function loadEarningsData() {
        // Intentar cargar desde backend API primero
        if (window.miningBackendAPI && window.miningBackendAPI.isAuthenticated()) {
            try {
                const response = await window.miningBackendAPI.request('GET', '/api/earnings/summary?period=all');
                if (response.success && response.data) {
                    await updateEarningsDisplay(response.data);
                    return;
                }
            } catch (error) {
                console.error('Error cargando ganancias desde backend:', error);
            }
        }
        
        // Fallback a Supabase o mock data
        if (window.miningSupabaseAdapter) {
            try {
                const earnings = await window.miningSupabaseAdapter.getEarnings('all');
                await updateEarningsDisplay(earnings);
            } catch (error) {
                console.error('Error cargando ganancias:', error);
                // Fallback to mock data
                await updateEarningsDisplay({
                    total: 0,
                    available: 0,
                    pending: 0,
                    withdrawn: 0
                });
            }
        } else if (window.supabaseIntegration) {
            loadEarningsFromSupabase();
        } else {
            // Mock data (valores en 0 si no hay datos)
            await updateEarningsDisplay({
                total: 0,
                available: 0,
                pending: 0,
                withdrawn: 0
            });
        }
    }
    
    async function loadEarningsFromSupabase() {
        if (window.miningSupabaseAdapter) {
            try {
                const earnings = await window.miningSupabaseAdapter.getEarnings('all');
                await updateEarningsDisplay(earnings);
            } catch (error) {
                console.error('Error cargando ganancias desde Supabase:', error);
            }
        }
    }
    
    async function updateEarningsDisplay(data) {
        // Obtener tasa USD desde API
        let usdRate = 0.5; // Valor por defecto
        try {
            if (window.miningBackendAPI && window.miningBackendAPI.isAuthenticated()) {
                const rateResponse = await window.miningBackendAPI.request('GET', '/api/mining/usd-rate');
                if (rateResponse.success && rateResponse.data) {
                    usdRate = parseFloat(rateResponse.data.usd_rate || 0.5);
                }
            }
        } catch (error) {
            console.warn('Error obteniendo tasa USD, usando valor por defecto:', error);
        }
        
        const total = parseFloat(data.total || 0);
        const available = parseFloat(data.available || 0);
        const pending = parseFloat(data.pending || 0);
        const withdrawn = parseFloat(data.withdrawn || 0);
        
        if (document.getElementById('totalBalance')) {
            document.getElementById('totalBalance').textContent = total.toFixed(6);
        }
        if (document.getElementById('totalBalanceUSD')) {
            document.getElementById('totalBalanceUSD').textContent = (total * usdRate).toFixed(2);
        }
        if (document.getElementById('availableBalance')) {
            document.getElementById('availableBalance').textContent = available.toFixed(6);
        }
        if (document.getElementById('pendingBalance')) {
            document.getElementById('pendingBalance').textContent = pending.toFixed(6);
        }
        if (document.getElementById('withdrawnTotal')) {
            document.getElementById('withdrawnTotal').textContent = withdrawn.toFixed(6);
        }
        if (document.getElementById('maxAmount')) {
            document.getElementById('maxAmount').textContent = available.toFixed(6) + ' RSC';
        }
    }
    
    async function loadEarningsBreakdown(period) {
        // Load breakdown data for selected period
        console.log('Loading breakdown for period:', period);
        
        try {
            if (window.miningBackendAPI && window.miningBackendAPI.isAuthenticated()) {
                const response = await window.miningBackendAPI.request('GET', `/api/earnings/breakdown?period=${period}`);
                if (response.success && response.data && response.data.breakdown) {
                    // Aquí puedes actualizar un gráfico o tabla con los datos
                    console.log('Breakdown data:', response.data.breakdown);
                    // TODO: Actualizar UI con los datos del breakdown
                    return response.data.breakdown;
                }
            }
        } catch (error) {
            console.error('Error cargando breakdown:', error);
        }
        
        return [];
    }
    
    function processWithdrawal() {
        const address = document.getElementById('withdrawalAddress').value;
        const amount = parseFloat(document.getElementById('withdrawalAmount').value);
        const available = parseFloat(document.getElementById('availableBalance').textContent);
        const minWithdrawal = 1.0;
        
        // Validation
        if (!address || address.length < 10) {
            window.miningNotifications?.error('Por favor ingresa una dirección de wallet válida');
            return;
        }
        
        if (!amount || amount <= 0) {
            window.miningNotifications?.error('Por favor ingresa un monto válido');
            return;
        }
        
        if (amount < minWithdrawal) {
            window.miningNotifications?.error(`El monto mínimo de retiro es ${minWithdrawal} RSC`);
            return;
        }
        
        if (amount > available) {
            window.miningNotifications?.error('No tienes suficiente balance disponible');
            return;
        }
        
        // Confirm withdrawal
        (async () => {
            const confirmed = await window.miningNotifications?.confirm(
                `¿Confirmar retiro de ${amount.toFixed(6)} RSC a ${address.substring(0, 10)}...?`,
                { title: 'Confirmar Retiro', type: 'warning' }
            );
            if (!confirmed) return;
            
            // Process withdrawal
            if (window.miningSupabaseAdapter) {
                window.miningSupabaseAdapter.processWithdrawal(address, amount)
                    .then(() => {
                        window.miningNotifications?.success('Retiro procesado correctamente');
                        loadEarningsData();
                        loadPayoutHistory();
                        // Clear form
                        document.getElementById('withdrawalAddress').value = '';
                        document.getElementById('withdrawalAmount').value = '';
                    })
                    .catch(error => {
                        window.miningNotifications?.error('Error al procesar retiro: ' + error.message);
                    });
            } else {
                // Mock withdrawal
                window.miningNotifications?.success('Retiro procesado correctamente');
                loadEarningsData();
                loadPayoutHistory();
                // Clear form
                document.getElementById('withdrawalAddress').value = '';
                document.getElementById('withdrawalAmount').value = '';
            }
        })();
    }
    
    async function loadPayoutHistory() {
        const tbody = document.getElementById('payoutHistoryBody');
        if (!tbody) return;
        
        // Intentar cargar desde backend API primero
        if (window.miningBackendAPI && window.miningBackendAPI.isAuthenticated()) {
            try {
                const response = await window.miningBackendAPI.request('GET', '/api/earnings/withdrawals?limit=50');
                if (response.success && response.data && response.data.withdrawals) {
                    const withdrawals = response.data.withdrawals;
                    
                    if (withdrawals.length === 0) {
                        tbody.innerHTML = `
                            <tr>
                                <td colspan="6" class="empty-state">
                                    <i class="fas fa-inbox"></i>
                                    <p>No hay pagos registrados</p>
                                </td>
                            </tr>
                        `;
                    } else {
                        tbody.innerHTML = withdrawals.map(payout => {
                            const date = new Date(payout.created_at);
                            const statusClass = payout.status === 'completed' ? 'confirmed' : 
                                               payout.status === 'pending' ? 'pending' : 
                                               payout.status === 'processing' ? 'processing' : 'failed';
                            const statusText = payout.status === 'completed' ? 'Confirmado' :
                                              payout.status === 'pending' ? 'Pendiente' :
                                              payout.status === 'processing' ? 'Procesando' : 'Fallido';
                            
                            return `
                                <tr>
                                    <td>${date.toLocaleString('es-ES')}</td>
                                    <td>${parseFloat(payout.amount || 0).toFixed(6)} RSC</td>
                                    <td><span class="transaction-hash">${payout.address || 'N/A'}</span></td>
                                    <td><span class="transaction-hash">${payout.tx_hash ? (payout.tx_hash.substring(0, 20) + '...') : (payout.id.substring(0, 20) + '...')}</span></td>
                                    <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                                    <td>
                                        <button class="table-action-btn" onclick="viewPayoutDetails('${payout.id}')">
                                            <i class="fas fa-eye"></i>
                                        </button>
                                    </td>
                                </tr>
                            `;
                        }).join('');
                    }
                    return;
                }
            } catch (error) {
                console.error('Error cargando historial de pagos desde backend:', error);
            }
        }
        
        // Fallback a Supabase
        if (window.miningSupabaseAdapter) {
            try {
                const transactions = await window.miningSupabaseAdapter.getTransactions(50);
                const withdrawals = transactions.filter(tx => tx.type === 'withdrawal');
                
                if (withdrawals.length === 0) {
                    tbody.innerHTML = `
                        <tr>
                            <td colspan="6" class="empty-state">
                                <i class="fas fa-inbox"></i>
                                <p>No hay pagos registrados</p>
                            </td>
                        </tr>
                    `;
                } else {
                    tbody.innerHTML = withdrawals.map(payout => {
                        const date = new Date(payout.created_at);
                        return `
                            <tr>
                                <td>${date.toLocaleString('es-ES')}</td>
                                <td>${Math.abs(parseFloat(payout.amount)).toFixed(6)} RSC</td>
                                <td><span class="transaction-hash">${payout.metadata?.address || 'N/A'}</span></td>
                                <td><span class="transaction-hash">${payout.id.substring(0, 20)}...</span></td>
                                <td><span class="status-badge confirmed">Confirmado</span></td>
                                <td>
                                    <button class="table-action-btn" onclick="viewPayoutDetails('${payout.id}')">
                                        <i class="fas fa-eye"></i>
                                    </button>
                                </td>
                            </tr>
                        `;
                    }).join('');
                }
                return;
            } catch (error) {
                console.error('Error cargando historial de pagos:', error);
            }
        }
        
        // Fallback: mostrar mensaje de vacío
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="empty-state">
                    <i class="fas fa-inbox"></i>
                    <p>No hay pagos registrados</p>
                </td>
            </tr>
        `;
    }
    
    window.viewPayoutDetails = function(hash) {
        window.miningNotifications?.info('Detalles del pago: ' + hash);
    };
    
    console.log('✅ Earnings page initialized');
})();

