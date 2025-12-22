// ===== BACKEND API CLIENT FOR MINING PLATFORM =====
// Cliente unificado para comunicarse con el backend

(function() {
    'use strict';
    
    class MiningBackendAPI {
        constructor() {
            // Detectar URL del backend automáticamente
            const currentHost = window.location.hostname;
            const currentPort = window.location.port;
            
            // Si estamos en desarrollo local, usar localhost:4000
            // Si estamos en producción, usar el mismo host
            if (currentHost === 'localhost' || currentHost === '127.0.0.1') {
                this.baseURL = window.BACKEND_API_URL || 'http://localhost:4000';
            } else {
                // En producción, usar el mismo dominio
                const protocol = window.location.protocol;
                this.baseURL = window.BACKEND_API_URL || `${protocol}//${currentHost}${currentPort ? ':' + currentPort : ''}`;
            }
            
            this.token = null;
            this.initialized = false;
            
            console.log(`🔌 Backend API URL: ${this.baseURL}`);
            
            // Cargar token del storage
            this.loadToken();
            this.init();
        }
        
        init() {
            if (this.initialized) return;
            
            this.initialized = true;
            console.log('✅ Mining Backend API Client inicializado');
            
            // Exponer globalmente
            window.miningBackendAPI = this;
        }
        
        loadToken() {
            try {
                const stored = localStorage.getItem('mining_auth_token');
                if (stored) {
                    this.token = stored;
                }
            } catch (error) {
                console.warn('Error cargando token:', error);
            }
        }
        
        saveToken(token) {
            try {
                this.token = token;
                localStorage.setItem('mining_auth_token', token);
            } catch (error) {
                console.warn('Error guardando token:', error);
            }
        }
        
        clearToken() {
            this.token = null;
            try {
                localStorage.removeItem('mining_auth_token');
            } catch (error) {
                console.warn('Error limpiando token:', error);
            }
        }
        
        async request(method, endpoint, data = null) {
            const url = `${this.baseURL}${endpoint}`;
            const options = {
                method: method,
                headers: {
                    'Content-Type': 'application/json'
                }
            };
            
            if (this.token) {
                options.headers['Authorization'] = `Bearer ${this.token}`;
            }
            
            if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
                options.body = JSON.stringify(data);
            }
            
            try {
                console.log(`🌐 ${method} ${url}`, data ? { data } : '');
                
                const response = await fetch(url, options);
                
                // Verificar si la respuesta es JSON
                const contentType = response.headers.get('content-type');
                let result;
                
                if (contentType && contentType.includes('application/json')) {
                    result = await response.json();
                } else {
                    const text = await response.text();
                    throw new Error(`Respuesta no válida del servidor: ${text.substring(0, 100)}`);
                }
                
                if (!response.ok) {
                    // Si es error de autenticación, limpiar token
                    if (response.status === 401 || response.status === 403) {
                        this.clearToken();
                        // Redirigir a login si estamos en una página protegida
                        if (!window.location.pathname.includes('login.html')) {
                            window.location.href = 'login.html';
                        }
                    }
                    
                    throw new Error(result.error || result.message || `Error ${response.status}: ${response.statusText}`);
                }
                
                return result;
            } catch (error) {
                // Mejorar mensajes de error
                if (error.name === 'TypeError' && error.message.includes('fetch')) {
                    console.error(`❌ Error de conexión: No se pudo conectar al backend en ${this.baseURL}`);
                    console.error(`   Verifica que el backend esté corriendo en ${this.baseURL}`);
                    throw new Error(`No se pudo conectar al servidor. Verifica que el backend esté corriendo en ${this.baseURL}`);
                }
                
                console.error(`❌ Error en ${method} ${endpoint}:`, error);
                throw error;
            }
        }
        
        // ===== AUTH METHODS =====
        
        async login(email, password) {
            try {
                const result = await this.request('POST', '/auth/login', { email, password });
                if (result.success && result.data?.token) {
                    this.saveToken(result.data.token);
                }
                return result;
            } catch (error) {
                throw error;
            }
        }
        
        async register(email, username, password, referralCode = null) {
            try {
                const result = await this.request('POST', '/auth/register', {
                    email,
                    username,
                    password,
                    referral_code: referralCode
                });
                if (result.success && result.data?.token) {
                    this.saveToken(result.data.token);
                }
                return result;
            } catch (error) {
                throw error;
            }
        }
        
        async getProfile() {
            return await this.request('GET', '/auth/profile');
        }
        
        // ===== MINING METHODS =====
        
        async startMiningSession(config = {}) {
            return await this.request('POST', '/api/mining/start', config);
        }
        
        async updateMiningSession(sessionId, data) {
            return await this.request('PUT', `/api/mining/update/${sessionId}`, data);
        }
        
        async stopMiningSession(sessionId) {
            return await this.request('POST', `/api/mining/stop/${sessionId}`);
        }
        
        async getActiveMiningSession() {
            return await this.request('GET', '/api/mining/active');
        }
        
        async getMiningHistory(limit = 50, offset = 0, filters = {}) {
            const params = new URLSearchParams({
                limit: limit.toString(),
                offset: offset.toString(),
                ...filters
            });
            return await this.request('GET', `/api/mining/history?${params}`);
        }
        
        async getMiningStats(period = 'all') {
            return await this.request('GET', `/api/mining/stats?period=${period}`);
        }
        
        async getHashrateHistory(range = '24h') {
            return await this.request('GET', `/api/mining/hashrate-history?range=${range}`);
        }
        
        // ===== EARNINGS METHODS =====
        
        async getEarningsSummary(period = 'month') {
            return await this.request('GET', `/api/earnings/summary?period=${period}`);
        }
        
        async getEarningsHistory(limit = 50, offset = 0, filters = {}) {
            const params = new URLSearchParams({
                limit: limit.toString(),
                offset: offset.toString(),
                ...filters
            });
            return await this.request('GET', `/api/earnings/history?${params}`);
        }
        
        async processWithdrawal(amount, address, password = null) {
            return await this.request('POST', '/api/earnings/withdraw', {
                amount,
                address,
                password
            });
        }
        
        async getWithdrawals(limit = 50, offset = 0, status = null) {
            const params = new URLSearchParams({
                limit: limit.toString(),
                offset: offset.toString()
            });
            if (status) params.append('status', status);
            return await this.request('GET', `/api/earnings/withdrawals?${params}`);
        }
        
        async getWithdrawalDetails(id) {
            return await this.request('GET', `/api/earnings/withdrawals/${id}`);
        }
        
        // ===== TRANSACTIONS METHODS =====
        
        async getTransactions(limit = 50, offset = 0, filters = {}) {
            const params = new URLSearchParams({
                limit: limit.toString(),
                offset: offset.toString(),
                ...filters
            });
            return await this.request('GET', `/api/transactions?${params}`);
        }
        
        async getTransactionDetails(id) {
            return await this.request('GET', `/api/transactions/${id}`);
        }
        
        async exportTransactions(format = 'csv', filters = {}) {
            const params = new URLSearchParams(filters);
            const response = await fetch(`${this.baseURL}/api/transactions/export/${format}?${params}`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });
            
            if (!response.ok) {
                throw new Error('Error exportando transacciones');
            }
            
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `transactions_${Date.now()}.${format}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }
        
        // ===== ANALYTICS METHODS =====
        
        async getDashboardData() {
            return await this.request('GET', '/api/analytics/dashboard');
        }
        
        async getPerformanceData(range = '24h') {
            return await this.request('GET', `/api/analytics/performance?range=${range}`);
        }
        
        async getDistributionData(period = 'month') {
            return await this.request('GET', `/api/analytics/distribution?period=${period}`);
        }
        
        // ===== POOLS METHODS =====
        
        async getPools() {
            return await this.request('GET', '/api/pools');
        }
        
        async getPoolDetails(id) {
            return await this.request('GET', `/api/pools/${id}`);
        }
        
        async getUserPools() {
            return await this.request('GET', '/api/pools/user/list');
        }
        
        async addUserPool(poolData) {
            return await this.request('POST', '/api/pools/user/add', poolData);
        }
        
        async updateUserPool(id, poolData) {
            return await this.request('PUT', `/api/pools/user/${id}`, poolData);
        }
        
        async deleteUserPool(id) {
            return await this.request('DELETE', `/api/pools/user/${id}`);
        }
        
        // ===== REFERRALS METHODS =====
        
        async getReferrals() {
            return await this.request('GET', '/api/referrals');
        }
        
        async getReferralCommissions(period = 'month') {
            return await this.request('GET', `/api/referrals/commissions?period=${period}`);
        }
        
        async getReferralStats() {
            return await this.request('GET', '/api/referrals/stats');
        }
        
        async validateReferralCode(code) {
            return await this.request('POST', '/api/referrals/validate-code', {
                referral_code: code
            });
        }
        
        // ===== SETTINGS METHODS =====
        
        async getSettings() {
            return await this.request('GET', '/api/settings');
        }
        
        async updateSettings(settings) {
            return await this.request('PUT', '/api/settings', settings);
        }
        
        async changePassword(currentPassword, newPassword) {
            return await this.request('POST', '/api/settings/change-password', {
                current_password: currentPassword,
                new_password: newPassword
            });
        }
        
        // ===== API KEYS METHODS =====
        
        async getApiKeys() {
            return await this.request('GET', '/api/api-keys');
        }
        
        async createApiKey(keyData) {
            return await this.request('POST', '/api/api-keys', keyData);
        }
        
        async revokeApiKey(id) {
            return await this.request('DELETE', `/api/api-keys/${id}`);
        }
        
        async testApiKey(id, testData) {
            return await this.request('POST', `/api/api-keys/${id}/test`, testData);
        }
        
        // ===== WEBHOOKS METHODS =====
        
        async getWebhooks() {
            return await this.request('GET', '/api/webhooks');
        }
        
        async createWebhook(webhookData) {
            return await this.request('POST', '/api/webhooks', webhookData);
        }
        
        async updateWebhook(id, webhookData) {
            return await this.request('PUT', `/api/webhooks/${id}`, webhookData);
        }
        
        async deleteWebhook(id) {
            return await this.request('DELETE', `/api/webhooks/${id}`);
        }
        
        async testWebhook(id, testData) {
            return await this.request('POST', `/api/webhooks/${id}/test`, testData);
        }
        
        // ===== SUPPORT METHODS =====
        
        async getSupportTickets(status = null) {
            const params = status ? `?status=${status}` : '';
            return await this.request('GET', `/api/support/tickets${params}`);
        }
        
        async createSupportTicket(ticketData) {
            return await this.request('POST', '/api/support/tickets', ticketData);
        }
        
        async getSupportTicketDetails(id) {
            return await this.request('GET', `/api/support/tickets/${id}`);
        }
        
        async respondToTicket(id, message) {
            return await this.request('POST', `/api/support/tickets/${id}/respond`, {
                message
            });
        }
        
        // ===== NOTIFICATIONS METHODS =====
        
        async getNotifications(read = null) {
            const params = read !== null ? `?read=${read}` : '';
            return await this.request('GET', `/api/notifications${params}`);
        }
        
        async markNotificationRead(id) {
            return await this.request('PUT', `/api/notifications/${id}/read`);
        }
        
        async markAllNotificationsRead() {
            return await this.request('PUT', '/api/notifications/read-all');
        }
        
        async deleteNotification(id) {
            return await this.request('DELETE', `/api/notifications/${id}`);
        }
        
        // ===== UTILITY METHODS =====
        
        logout() {
            this.clearToken();
            window.location.href = 'login.html';
        }
        
        isAuthenticated() {
            return !!this.token;
        }
    }
    
    // Inicializar cuando el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.miningBackendAPI = new MiningBackendAPI();
        });
    } else {
        window.miningBackendAPI = new MiningBackendAPI();
    }
    
    console.log('🔌 Mining Backend API Client cargado');
})();

