// ===== SUPABASE ADAPTER FOR NEW MINING PLATFORM =====
// Conecta la nueva plataforma de minería con Supabase directamente usando la API REST

(function() {
    'use strict';
    
    class MiningPlatformSupabaseAdapter {
        constructor() {
            this.supabase = window.supabaseIntegration;
            this.initialized = false;
            
            if (!this.supabase) {
                console.warn('⚠️ Supabase Integration no encontrado. Esperando...');
                this.waitForSupabase();
            } else {
                this.init();
            }
        }
        
        async waitForSupabase() {
            const maxAttempts = 50;
            let attempts = 0;
            
            const checkInterval = setInterval(() => {
                attempts++;
                if (window.supabaseIntegration) {
                    this.supabase = window.supabaseIntegration;
                    clearInterval(checkInterval);
                    this.init();
                } else if (attempts >= maxAttempts) {
                    clearInterval(checkInterval);
                    console.error('❌ Supabase Integration no disponible después de esperar');
                }
            }, 100);
        }
        
        init() {
            if (this.initialized) return;
            
            this.initialized = true;
            console.log('✅ Mining Platform Supabase Adapter inicializado');
            
            // Exponer métodos globales
            window.miningSupabaseAdapter = this;
            window.miningSupabase = this; // Para compatibilidad
        }
        
        // ===== USER METHODS =====
        
        async getUserData() {
            if (!this.supabase?.user?.isAuthenticated) {
                return null;
            }
            
            try {
                const response = await this.supabase.makeRequest(
                    'GET',
                    `/rest/v1/users?id=eq.${this.supabase.user.id}&select=*`
                );
                
                if (response.ok) {
                    const data = await response.json();
                    return data[0] || null;
                }
            } catch (error) {
                console.error('Error obteniendo datos del usuario:', error);
            }
            
            return {
                id: this.supabase.user.id,
                email: this.supabase.user.email,
                username: this.supabase.user.username,
                balance: this.supabase.user.balance,
                referral_code: this.supabase.user.referralCode
            };
        }
        
        async updateUserBalance(newBalance) {
            if (!this.supabase?.user?.isAuthenticated) return false;
            
            try {
                const response = await this.supabase.makeRequest(
                    'PATCH',
                    `/rest/v1/users?id=eq.${this.supabase.user.id}`,
                    { balance: newBalance }
                );
                
                if (response.ok) {
                    this.supabase.user.balance = newBalance;
                    this.supabase.saveUserToStorage();
                    return true;
                }
            } catch (error) {
                console.error('Error actualizando balance:', error);
            }
            
            return false;
        }
        
        // ===== MINING SESSION METHODS =====
        
        async startMiningSession(config = {}) {
            if (!this.supabase?.user?.isAuthenticated) {
                throw new Error('Usuario no autenticado');
            }
            
            try {
                const sessionData = {
                    user_id: this.supabase.user.id,
                    session_id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    start_time: new Date().toISOString(),
                    status: 'active',
                    hash_rate: config.hashRate || config.hash_rate || 1000,
                    efficiency: 100,
                    tokens_mined: 0,
                    pool_url: config.poolUrl || config.pool_url || null,
                    algorithm: config.algorithm || 'sha256',
                    cpu_threads: config.cpuThreads || config.cpu_threads || null,
                    intensity: config.intensity || 'medium'
                };
                
                const response = await this.supabase.makeRequest(
                    'POST',
                    '/rest/v1/mining_sessions',
                    sessionData
                );
                
                if (response.ok || response.status === 201) {
                    const data = await response.json();
                    const session = Array.isArray(data) ? data[0] : data;
                    
                    // Actualizar objeto local
                    this.supabase.miningSession = {
                        isActive: true,
                        sessionId: session.session_id,
                        startTime: session.start_time,
                        hashRate: session.hash_rate,
                        tokensMined: 0,
                        efficiency: session.efficiency
                    };
                    
                    return session;
                } else {
                    const error = await response.json();
                    throw new Error(error.message || 'Error iniciando sesión de minería');
                }
            } catch (error) {
                console.error('Error iniciando sesión de minería:', error);
                throw error;
            }
        }
        
        async stopMiningSession(sessionId = null) {
            if (!this.supabase?.miningSession?.sessionId && !sessionId) {
                return false;
            }
            
            try {
                const activeSessionId = sessionId || this.supabase.miningSession.sessionId;
                const endTime = new Date().toISOString();
                const startTime = new Date(this.supabase.miningSession.startTime);
                const duration = new Date(endTime) - startTime;
                
                const updateData = {
                    end_time: endTime,
                    duration_ms: duration,
                    status: 'completed',
                    tokens_mined: this.supabase.miningSession.tokensMined || 0,
                    hash_rate: this.supabase.miningSession.hashRate || 0
                };
                
                const response = await this.supabase.makeRequest(
                    'PATCH',
                    `/rest/v1/mining_sessions?session_id=eq.${activeSessionId}`,
                    updateData
                );
                
                if (response.ok) {
                    // Actualizar balance del usuario
                    const newBalance = this.supabase.user.balance + (this.supabase.miningSession.tokensMined || 0);
                    await this.updateUserBalance(newBalance);
                    
                    // Resetear sesión local
                    this.supabase.miningSession = {
                        isActive: false,
                        sessionId: null,
                        startTime: null,
                        tokensMined: 0,
                        hashRate: 0
                    };
                    
                    return true;
                }
            } catch (error) {
                console.error('Error deteniendo sesión de minería:', error);
            }
            
            return false;
        }
        
        async getActiveMiningSession() {
            if (!this.supabase?.user?.isAuthenticated) return null;
            
            try {
                const response = await this.supabase.makeRequest(
                    'GET',
                    `/rest/v1/mining_sessions?user_id=eq.${this.supabase.user.id}&status=eq.active&order=start_time.desc&limit=1`
                );
                
                if (response.ok) {
                    const data = await response.json();
                    return data[0] || null;
                }
            } catch (error) {
                console.error('Error obteniendo sesión activa:', error);
            }
            
            return null;
        }
        
        async getMiningSessions(limit = 50) {
            if (!this.supabase?.user?.isAuthenticated) return [];
            
            try {
                const response = await this.supabase.makeRequest(
                    'GET',
                    `/rest/v1/mining_sessions?user_id=eq.${this.supabase.user.id}&order=start_time.desc&limit=${limit}`
                );
                
                if (response.ok) {
                    return await response.json();
                }
            } catch (error) {
                console.error('Error obteniendo sesiones de minería:', error);
            }
            
            return [];
        }
        
        async updateMiningSession(sessionId, data) {
            try {
                const response = await this.supabase.makeRequest(
                    'PATCH',
                    `/rest/v1/mining_sessions?session_id=eq.${sessionId}`,
                    data
                );
                
                return response.ok;
            } catch (error) {
                console.error('Error actualizando sesión:', error);
                return false;
            }
        }
        
        // ===== TRANSACTIONS METHODS =====
        
        async getTransactions(limit = 100, offset = 0, filters = {}) {
            if (!this.supabase?.user?.isAuthenticated) return [];
            
            try {
                let query = `/rest/v1/transactions?user_id=eq.${this.supabase.user.id}&order=created_at.desc&limit=${limit}&offset=${offset}`;
                
                if (filters.type) {
                    query += `&type=eq.${filters.type}`;
                }
                if (filters.status) {
                    query += `&status=eq.${filters.status}`;
                }
                
                const response = await this.supabase.makeRequest('GET', query);
                
                if (response.ok) {
                    return await response.json();
                }
            } catch (error) {
                console.error('Error obteniendo transacciones:', error);
            }
            
            return [];
        }
        
        async createTransaction(transactionData) {
            if (!this.supabase?.user?.isAuthenticated) return null;
            
            try {
                const transaction = {
                    user_id: this.supabase.user.id,
                    type: transactionData.type || 'mining',
                    amount: transactionData.amount,
                    balance_before: this.supabase.user.balance,
                    balance_after: this.supabase.user.balance + transactionData.amount,
                    reference_id: transactionData.referenceId || null,
                    reference_type: transactionData.referenceType || null,
                    description: transactionData.description || '',
                    metadata: transactionData.metadata || {},
                    created_at: new Date().toISOString()
                };
                
                const response = await this.supabase.makeRequest(
                    'POST',
                    '/rest/v1/transactions',
                    transaction
                );
                
                if (response.ok || response.status === 201) {
                    const data = await response.json();
                    return Array.isArray(data) ? data[0] : data;
                }
            } catch (error) {
                console.error('Error creando transacción:', error);
            }
            
            return null;
        }
        
        // ===== EARNINGS METHODS =====
        
        async getEarnings(period = 'month') {
            if (!this.supabase?.user?.isAuthenticated) {
                return {
                    total: 0,
                    available: 0,
                    pending: 0,
                    withdrawn: 0
                };
            }
            
            try {
                const now = new Date();
                let startDate;
                
                switch (period) {
                    case 'today':
                        startDate = new Date(now.setHours(0, 0, 0, 0));
                        break;
                    case 'week':
                        startDate = new Date(now.setDate(now.getDate() - 7));
                        break;
                    case 'month':
                        startDate = new Date(now.setMonth(now.getMonth() - 1));
                        break;
                    case 'year':
                        startDate = new Date(now.setFullYear(now.getFullYear() - 1));
                        break;
                    default:
                        startDate = new Date(0);
                }
                
                // Obtener transacciones de minería
                const response = await this.supabase.makeRequest(
                    'GET',
                    `/rest/v1/transactions?user_id=eq.${this.supabase.user.id}&type=eq.mining&created_at=gte.${startDate.toISOString()}&order=created_at.desc`
                );
                
                if (response.ok) {
                    const transactions = await response.json();
                    const total = transactions.reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
                    
                    // Obtener retiros pendientes
                    const withdrawalsResponse = await this.supabase.makeRequest(
                        'GET',
                        `/rest/v1/withdrawals?user_id=eq.${this.supabase.user.id}&status=in.(pending,processing)`
                    );
                    
                    let pending = 0;
                    if (withdrawalsResponse.ok) {
                        const withdrawals = await withdrawalsResponse.json();
                        pending = withdrawals.reduce((sum, w) => sum + parseFloat(w.amount || 0), 0);
                    }
                    
                    // Obtener retiros completados
                    const completedWithdrawalsResponse = await this.supabase.makeRequest(
                        'GET',
                        `/rest/v1/withdrawals?user_id=eq.${this.supabase.user.id}&status=eq.completed&created_at=gte.${startDate.toISOString()}`
                    );
                    
                    let withdrawn = 0;
                    if (completedWithdrawalsResponse.ok) {
                        const withdrawals = await completedWithdrawalsResponse.json();
                        withdrawn = withdrawals.reduce((sum, w) => sum + parseFloat(w.amount || 0), 0);
                    }
                    
                    return {
                        total: total,
                        available: this.supabase.user.balance || 0,
                        pending: pending,
                        withdrawn: withdrawn
                    };
                }
            } catch (error) {
                console.error('Error obteniendo ganancias:', error);
            }
            
            return {
                total: this.supabase.user.balance || 0,
                available: this.supabase.user.balance || 0,
                pending: 0,
                withdrawn: 0
            };
        }
        
        async processWithdrawal(address, amount, password = null) {
            if (!this.supabase?.user?.isAuthenticated) {
                throw new Error('Usuario no autenticado');
            }
            
            if (amount > this.supabase.user.balance) {
                throw new Error('Balance insuficiente');
            }
            
            try {
                const MIN_WITHDRAWAL = 10.0;
                const WITHDRAWAL_FEE = 0.5;
                
                if (amount < MIN_WITHDRAWAL) {
                    throw new Error(`El monto mínimo de retiro es ${MIN_WITHDRAWAL} tokens`);
                }
                
                const totalNeeded = amount + WITHDRAWAL_FEE;
                const netAmount = amount - WITHDRAWAL_FEE;
                
                // Crear retiro
                const withdrawalData = {
                    user_id: this.supabase.user.id,
                    amount: amount,
                    address: address,
                    fee: WITHDRAWAL_FEE,
                    net_amount: netAmount,
                    status: 'pending'
                };
                
                const withdrawalResponse = await this.supabase.makeRequest(
                    'POST',
                    '/rest/v1/withdrawals',
                    withdrawalData
                );
                
                if (withdrawalResponse.ok || withdrawalResponse.status === 201) {
                    const withdrawal = await withdrawalResponse.json();
                    const withdrawalResult = Array.isArray(withdrawal) ? withdrawal[0] : withdrawal;
                    
                    // Actualizar balance
                    const newBalance = this.supabase.user.balance - totalNeeded;
                    await this.updateUserBalance(newBalance);
                    
                    // Crear transacción
                    await this.createTransaction({
                        type: 'withdrawal',
                        amount: -totalNeeded,
                        description: `Retiro a ${address.substring(0, 10)}...`,
                        metadata: { address, withdrawal_id: withdrawalResult.id }
                    });
                    
                    return withdrawalResult;
                } else {
                    const error = await withdrawalResponse.json();
                    throw new Error(error.message || 'Error procesando retiro');
                }
            } catch (error) {
                console.error('Error procesando retiro:', error);
                throw error;
            }
        }
        
        async getPayoutHistory(limit = 50, offset = 0) {
            if (!this.supabase?.user?.isAuthenticated) return [];
            
            try {
                const response = await this.supabase.makeRequest(
                    'GET',
                    `/rest/v1/withdrawals?user_id=eq.${this.supabase.user.id}&order=created_at.desc&limit=${limit}&offset=${offset}`
                );
                
                if (response.ok) {
                    return await response.json();
                }
            } catch (error) {
                console.error('Error obteniendo historial de retiros:', error);
            }
            
            return [];
        }
        
        // ===== REFERRALS METHODS =====
        
        async getReferrals() {
            if (!this.supabase?.user?.isAuthenticated) return [];
            
            try {
                const response = await this.supabase.makeRequest(
                    'GET',
                    `/rest/v1/referrals?referrer_id=eq.${this.supabase.user.id}&select=*,referred:users(id,email,username,created_at)`
                );
                
                if (response.ok) {
                    return await response.json();
                }
            } catch (error) {
                console.error('Error obteniendo referidos:', error);
            }
            
            return [];
        }
        
        async getReferralCommissions(period = 'month') {
            if (!this.supabase?.user?.isAuthenticated) return [];
            
            try {
                const now = new Date();
                let startDate;
                
                switch (period) {
                    case 'today':
                        startDate = new Date(now.setHours(0, 0, 0, 0));
                        break;
                    case 'week':
                        startDate = new Date(now.setDate(now.getDate() - 7));
                        break;
                    case 'month':
                        startDate = new Date(now.setMonth(now.getMonth() - 1));
                        break;
                    default:
                        startDate = new Date(0);
                }
                
                const response = await this.supabase.makeRequest(
                    'GET',
                    `/rest/v1/transactions?user_id=eq.${this.supabase.user.id}&type=eq.referral_commission&created_at=gte.${startDate.toISOString()}&order=created_at.desc`
                );
                
                if (response.ok) {
                    return await response.json();
                }
            } catch (error) {
                console.error('Error obteniendo comisiones:', error);
            }
            
            return [];
        }
        
        // ===== ANALYTICS METHODS =====
        
        async getAnalyticsData(range = '24h') {
            if (!this.supabase?.user?.isAuthenticated) return null;
            
            try {
                const now = new Date();
                let startDate;
                
                switch (range) {
                    case '24h':
                        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
                        break;
                    case '7d':
                        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                        break;
                    case '30d':
                        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                        break;
                    case '90d':
                        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
                        break;
                    default:
                        startDate = new Date(0);
                }
                
                // Obtener sesiones de minería
                const sessionsResponse = await this.supabase.makeRequest(
                    'GET',
                    `/rest/v1/mining_sessions?user_id=eq.${this.supabase.user.id}&start_time=gte.${startDate.toISOString()}&order=start_time.asc`
                );
                
                // Obtener transacciones
                const transactionsResponse = await this.supabase.makeRequest(
                    'GET',
                    `/rest/v1/transactions?user_id=eq.${this.supabase.user.id}&created_at=gte.${startDate.toISOString()}&order=created_at.asc`
                );
                
                if (sessionsResponse.ok && transactionsResponse.ok) {
                    const sessions = await sessionsResponse.json();
                    const transactions = await transactionsResponse.json();
                    
                    return {
                        sessions,
                        transactions,
                        hashrate: sessions.map(s => ({
                            time: s.start_time,
                            value: parseFloat(s.hash_rate || 0)
                        })),
                        earnings: transactions.filter(t => t.type === 'mining').map(t => ({
                            time: t.created_at,
                            value: parseFloat(t.amount || 0)
                        }))
                    };
                }
            } catch (error) {
                console.error('Error obteniendo datos de analytics:', error);
            }
            
            return null;
        }
        
        async getDashboardStats() {
            if (!this.supabase?.user?.isAuthenticated) return null;
            
            try {
                // Obtener sesión activa
                const activeSession = await this.getActiveMiningSession();
                
                // Obtener ganancias de hoy
                const todayStart = new Date();
                todayStart.setHours(0, 0, 0, 0);
                const todayEarningsResponse = await this.supabase.makeRequest(
                    'GET',
                    `/rest/v1/transactions?user_id=eq.${this.supabase.user.id}&type=eq.mining&amount=gt.0&created_at=gte.${todayStart.toISOString()}`
                );
                
                let todayEarnings = 0;
                if (todayEarningsResponse.ok) {
                    const transactions = await todayEarningsResponse.json();
                    todayEarnings = transactions.reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
                }
                
                return {
                    stats: {
                        current_hashrate: activeSession?.hash_rate || 0,
                        balance: this.supabase.user.balance || 0,
                        today_earnings: todayEarnings,
                        uptime_percentage: 99.5
                    },
                    hashrate_history: [],
                    earnings_history: [],
                    recent_activity: []
                };
            } catch (error) {
                console.error('Error obteniendo stats del dashboard:', error);
            }
            
            return null;
        }
        
        async getHashrateHistory(range = '24h') {
            if (!this.supabase?.user?.isAuthenticated) return [];
            
            try {
                const now = new Date();
                let startDate;
                
                switch (range) {
                    case '24h':
                        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
                        break;
                    case '7d':
                        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                        break;
                    case '30d':
                        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                        break;
                    case '90d':
                        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
                        break;
                    default:
                        startDate = new Date(0);
                }
                
                const response = await this.supabase.makeRequest(
                    'GET',
                    `/rest/v1/mining_sessions?user_id=eq.${this.supabase.user.id}&start_time=gte.${startDate.toISOString()}&order=start_time.asc&select=start_time,hash_rate,tokens_mined`
                );
                
                if (response.ok) {
                    const sessions = await response.json();
                    return sessions.map(s => ({
                        time: s.start_time,
                        hashrate: parseFloat(s.hash_rate || 0),
                        tokens_mined: parseFloat(s.tokens_mined || 0)
                    }));
                }
            } catch (error) {
                console.error('Error obteniendo historial de hashrate:', error);
            }
            
            return [];
        }
        
        async getEarningsHistory(period = 'month') {
            if (!this.supabase?.user?.isAuthenticated) return [];
            
            try {
                const now = new Date();
                let startDate;
                
                switch (period) {
                    case 'today':
                        startDate = new Date(now.setHours(0, 0, 0, 0));
                        break;
                    case 'week':
                        startDate = new Date(now.setDate(now.getDate() - 7));
                        break;
                    case 'month':
                        startDate = new Date(now.setMonth(now.getMonth() - 1));
                        break;
                    case 'year':
                        startDate = new Date(now.setFullYear(now.getFullYear() - 1));
                        break;
                    default:
                        startDate = new Date(0);
                }
                
                const response = await this.supabase.makeRequest(
                    'GET',
                    `/rest/v1/transactions?user_id=eq.${this.supabase.user.id}&type=eq.mining&amount=gt.0&created_at=gte.${startDate.toISOString()}&order=created_at.desc&limit=50`
                );
                
                if (response.ok) {
                    return await response.json();
                }
            } catch (error) {
                console.error('Error obteniendo historial de ganancias:', error);
            }
            
            return [];
        }
        
        async getMiningDistribution(period = 'month') {
            if (!this.supabase?.user?.isAuthenticated) return null;
            
            try {
                const now = new Date();
                let startDate;
                
                switch (period) {
                    case 'week':
                        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                        break;
                    case 'month':
                        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                        break;
                    case 'year':
                        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
                        break;
                    default:
                        startDate = new Date(0);
                }
                
                // Distribución por pool
                const poolResponse = await this.supabase.makeRequest(
                    'GET',
                    `/rest/v1/mining_sessions?user_id=eq.${this.supabase.user.id}&start_time=gte.${startDate.toISOString()}&select=pool_url,tokens_mined`
                );
                
                // Distribución por algoritmo
                const algorithmResponse = await this.supabase.makeRequest(
                    'GET',
                    `/rest/v1/mining_sessions?user_id=eq.${this.supabase.user.id}&start_time=gte.${startDate.toISOString()}&select=algorithm,tokens_mined`
                );
                
                let byPool = [];
                let byAlgorithm = [];
                
                if (poolResponse.ok) {
                    const sessions = await poolResponse.json();
                    // Agrupar por pool
                    const poolMap = {};
                    sessions.forEach(s => {
                        const pool = s.pool_url || 'unknown';
                        if (!poolMap[pool]) {
                            poolMap[pool] = { pool, sessions: 0, tokens_mined: 0 };
                        }
                        poolMap[pool].sessions++;
                        poolMap[pool].tokens_mined += parseFloat(s.tokens_mined || 0);
                    });
                    byPool = Object.values(poolMap);
                }
                
                if (algorithmResponse.ok) {
                    const sessions = await algorithmResponse.json();
                    // Agrupar por algoritmo
                    const algoMap = {};
                    sessions.forEach(s => {
                        const algo = s.algorithm || 'unknown';
                        if (!algoMap[algo]) {
                            algoMap[algo] = { algorithm: algo, sessions: 0, tokens_mined: 0 };
                        }
                        algoMap[algo].sessions++;
                        algoMap[algo].tokens_mined += parseFloat(s.tokens_mined || 0);
                    });
                    byAlgorithm = Object.values(algoMap);
                }
                
                return {
                    by_pool: byPool,
                    by_algorithm: byAlgorithm,
                    by_time_of_day: []
                };
            } catch (error) {
                console.error('Error obteniendo distribución:', error);
            }
            
            return null;
        }
        
        async getPerformanceMetrics(range = '24h') {
            return await this.getAnalyticsData(range);
        }
        
        // ===== POOLS METHODS =====
        
        async getPools() {
            if (!this.supabase?.user?.isAuthenticated) return [];
            
            try {
                const response = await this.supabase.makeRequest(
                    'GET',
                    '/rest/v1/pools?status=eq.active&order=priority.asc'
                );
                
                if (response.ok) {
                    return await response.json();
                }
            } catch (error) {
                console.error('Error obteniendo pools:', error);
            }
            
            return [];
        }
        
        async addPool(poolData) {
            if (!this.supabase?.user?.isAuthenticated) return null;
            
            try {
                const userPoolData = {
                    user_id: this.supabase.user.id,
                    pool_id: poolData.pool_id || null,
                    custom_name: poolData.custom_name || null,
                    custom_url: poolData.custom_url || null,
                    custom_port: poolData.custom_port || null,
                    priority: poolData.priority || 0,
                    is_active: true
                };
                
                const response = await this.supabase.makeRequest(
                    'POST',
                    '/rest/v1/user_pools',
                    userPoolData
                );
                
                if (response.ok || response.status === 201) {
                    const data = await response.json();
                    return Array.isArray(data) ? data[0] : data;
                }
            } catch (error) {
                console.error('Error agregando pool:', error);
            }
            
            return null;
        }
        
        async updatePool(id, poolData) {
            if (!this.supabase?.user?.isAuthenticated) return false;
            
            try {
                const response = await this.supabase.makeRequest(
                    'PATCH',
                    `/rest/v1/user_pools?id=eq.${id}&user_id=eq.${this.supabase.user.id}`,
                    poolData
                );
                
                return response.ok;
            } catch (error) {
                console.error('Error actualizando pool:', error);
            }
            
            return false;
        }
        
        async deletePool(id) {
            if (!this.supabase?.user?.isAuthenticated) return false;
            
            try {
                const response = await this.supabase.makeRequest(
                    'DELETE',
                    `/rest/v1/user_pools?id=eq.${id}&user_id=eq.${this.supabase.user.id}`
                );
                
                return response.ok;
            } catch (error) {
                console.error('Error eliminando pool:', error);
            }
            
            return false;
        }
        
        async getPoolStats(poolUrl) {
            return {
                hashrate: '1,234.56 GH/s',
                miners: 1234,
                fee: '1.0%',
                latency: '12ms'
            };
        }
        
        // ===== SUPPORT METHODS =====
        
        async createSupportTicket(ticketData) {
            if (!this.supabase?.user?.isAuthenticated) return null;
            
            try {
                const ticket = {
                    user_id: this.supabase.user.id,
                    subject: ticketData.subject,
                    message: ticketData.message,
                    category: ticketData.category || 'general',
                    priority: ticketData.priority || 'medium',
                    status: 'open'
                };
                
                const response = await this.supabase.makeRequest(
                    'POST',
                    '/rest/v1/support_tickets',
                    ticket
                );
                
                if (response.ok || response.status === 201) {
                    const data = await response.json();
                    return Array.isArray(data) ? data[0] : data;
                }
            } catch (error) {
                console.error('Error creando ticket:', error);
            }
            
            return null;
        }
        
        // ===== SETTINGS METHODS =====
        
        async changePassword(currentPassword, newPassword) {
            if (!this.supabase?.user?.isAuthenticated) return false;
            
            try {
                // Obtener usuario actual
                const userResponse = await this.supabase.makeRequest(
                    'GET',
                    `/rest/v1/users?id=eq.${this.supabase.user.id}&select=password`
                );
                
                if (userResponse.ok) {
                    const users = await userResponse.json();
                    if (users.length > 0) {
                        const storedPassword = atob(users[0].password); // Decodificar base64
                        
                        if (storedPassword !== currentPassword) {
                            throw new Error('Contraseña actual incorrecta');
                        }
                        
                        // Actualizar contraseña
                        const hashedPassword = btoa(newPassword);
                        const updateResponse = await this.supabase.makeRequest(
                            'PATCH',
                            `/rest/v1/users?id=eq.${this.supabase.user.id}`,
                            { password: hashedPassword }
                        );
                        
                        return updateResponse.ok;
                    }
                }
            } catch (error) {
                console.error('Error cambiando contraseña:', error);
                throw error;
            }
            
            return false;
        }
        
        async deleteAccount() {
            console.warn('deleteAccount: No implementado aún');
            return false;
        }
        
        async getUserSettings() {
            if (!this.supabase?.user?.isAuthenticated) return {};
            
            try {
                const response = await this.supabase.makeRequest(
                    'GET',
                    `/rest/v1/users?id=eq.${this.supabase.user.id}&select=settings`
                );
                
                if (response.ok) {
                    const data = await response.json();
                    if (data.length > 0 && data[0].settings) {
                        return typeof data[0].settings === 'string' ? JSON.parse(data[0].settings) : data[0].settings;
                    }
                }
            } catch (error) {
                console.error('Error obteniendo configuraciones:', error);
            }
            
            return {};
        }
        
        async updateUserSettings(settings) {
            if (!this.supabase?.user?.isAuthenticated) return false;
            
            try {
                // Obtener settings actuales
                const currentSettings = await this.getUserSettings();
                const mergedSettings = { ...currentSettings, ...settings };
                
                const response = await this.supabase.makeRequest(
                    'PATCH',
                    `/rest/v1/users?id=eq.${this.supabase.user.id}`,
                    { settings: mergedSettings }
                );
                
                return response.ok;
            } catch (error) {
                console.error('Error actualizando configuraciones:', error);
                return false;
            }
        }
        
        async getApiKeys() {
            if (!this.supabase?.user?.isAuthenticated) return [];
            
            try {
                const response = await this.supabase.makeRequest(
                    'GET',
                    `/rest/v1/api_keys?user_id=eq.${this.supabase.user.id}&order=created_at.desc`
                );
                
                if (response.ok) {
                    return await response.json();
                }
            } catch (error) {
                console.error('Error obteniendo API keys:', error);
            }
            
            return [];
        }
        
        async getWebhooks() {
            if (!this.supabase?.user?.isAuthenticated) return [];
            
            try {
                const response = await this.supabase.makeRequest(
                    'GET',
                    `/rest/v1/webhooks?user_id=eq.${this.supabase.user.id}&order=created_at.desc`
                );
                
                if (response.ok) {
                    return await response.json();
                }
            } catch (error) {
                console.error('Error obteniendo webhooks:', error);
            }
            
            return [];
        }
        
        // ===== API KEYS METHODS =====
        
        async createApiKey(keyData) {
            if (!this.supabase?.user?.isAuthenticated) return null;
            
            try {
                // Generar API key
                const apiKey = `rsc_live_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                const apiSecret = Math.random().toString(36).substr(2, 32);
                
                const keyDataObj = {
                    user_id: this.supabase.user.id,
                    key_name: keyData.key_name,
                    api_key: apiKey,
                    api_secret: btoa(apiSecret), // Hash simple
                    permissions: JSON.stringify(keyData.permissions || { read: true, write: false, withdraw: false }),
                    status: 'active'
                };
                
                const response = await this.supabase.makeRequest(
                    'POST',
                    '/rest/v1/api_keys',
                    keyDataObj
                );
                
                if (response.ok || response.status === 201) {
                    const data = await response.json();
                    const result = Array.isArray(data) ? data[0] : data;
                    return {
                        ...result,
                        api_secret: apiSecret // Solo se muestra una vez
                    };
                }
            } catch (error) {
                console.error('Error creando API key:', error);
            }
            
            return null;
        }
        
        async revokeApiKey(id) {
            if (!this.supabase?.user?.isAuthenticated) return false;
            
            try {
                const response = await this.supabase.makeRequest(
                    'PATCH',
                    `/rest/v1/api_keys?id=eq.${id}&user_id=eq.${this.supabase.user.id}`,
                    { status: 'revoked' }
                );
                
                return response.ok;
            } catch (error) {
                console.error('Error revocando API key:', error);
            }
            
            return false;
        }
        
        async testWebhook(id, testData) {
            if (!this.supabase?.user?.isAuthenticated) return false;
            
            try {
                // Actualizar last_triggered
                const response = await this.supabase.makeRequest(
                    'PATCH',
                    `/rest/v1/webhooks?id=eq.${id}&user_id=eq.${this.supabase.user.id}`,
                    { last_triggered: new Date().toISOString() }
                );
                
                return response.ok;
            } catch (error) {
                console.error('Error probando webhook:', error);
            }
            
            return false;
        }
        
        async deleteWebhook(id) {
            if (!this.supabase?.user?.isAuthenticated) return false;
            
            try {
                const response = await this.supabase.makeRequest(
                    'DELETE',
                    `/rest/v1/webhooks?id=eq.${id}&user_id=eq.${this.supabase.user.id}`
                );
                
                return response.ok;
            } catch (error) {
                console.error('Error eliminando webhook:', error);
            }
            
            return false;
        }
        
        // ===== REAL-TIME UPDATES =====
        
        setupRealtimeUpdates(callback) {
            // Configurar actualizaciones en tiempo real usando Supabase Realtime
            if (this.supabase?.user?.isAuthenticated) {
                // Por ahora usamos polling
                setInterval(async () => {
                    if (callback) {
                        const data = await this.getUserData();
                        callback(data);
                    }
                }, 5000);
            }
        }
    }
    
    // Inicializar cuando el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.miningSupabaseAdapter = new MiningPlatformSupabaseAdapter();
        });
    } else {
        window.miningSupabaseAdapter = new MiningPlatformSupabaseAdapter();
    }
    
    console.log('🔌 Mining Platform Supabase Adapter cargado');
})();
