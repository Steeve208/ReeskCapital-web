/* ================================
   BACKEND-INTEGRATION.JS — INTEGRACIÓN CON BACKEND RSC MINING
================================ */

/**
 * 🚀 INTEGRACIÓN COMPLETA CON BACKEND RSC MINING v2.0.0
 * 
 * Este archivo conecta el frontend con el backend avanzado de minería RSC
 * Incluye todas las funcionalidades: leaderboard, API pública, admin, etc.
 */

class RSCMiningBackend {
    constructor() {
        // Configuración del backend
        this.config = {
            // URL del backend (local por defecto, cambiar en producción)
            BASE_URL: 'http://localhost:4000',
            
            // Endpoints de la API
            ENDPOINTS: {
                // Autenticación
                AUTH: {
                    REGISTER: '/auth/register',
                    LOGIN: '/auth/login',
                    ADMIN_LOGIN: '/auth/admin/login',
                    PROFILE: '/auth/profile'
                },
                
                // Minería
                MINE: {
                    MINE: '/mine/mine',
                    BALANCE: '/mine/balance',
                    STATS: '/mine/stats',
                    HISTORY: '/mine/history',
                    STATUS: '/mine/status'
                },
                
                // API Pública
                PUBLIC: {
                    LEADERBOARD: '/public/leaderboard',
                    STATS: '/public/stats',
                    TOP10: '/public/leaderboard/top10',
                    PERIODS: '/public/periods'
                },
                
                // Administración
                ADMIN: {
                    DASHBOARD: '/admin/dashboard',
                    USERS: '/admin/users',
                    MINING_EVENTS: '/admin/mining-events',
                    EXPORT_USERS: '/admin/export/users.csv',
                    EXPORT_MINING: '/admin/export/mining.csv',
                    CACHE_CLEAR: '/admin/cache/clear',
                    SYSTEM_INFO: '/admin/system/info'
                },
                
                // Sistema
                SYSTEM: {
                    HEALTH: '/health',
                    METRICS: '/metrics',
                    SYSTEM_INFO: '/system/info'
                }
            },
            
            // Configuración de caché
            CACHE: {
                ENABLED: true,
                TTL: 30 * 1000, // 30 segundos
                LEADERBOARD_TTL: 60 * 1000 // 1 minuto para leaderboard
            },
            
            // Configuración de rate limiting
            RATE_LIMIT: {
                MINE_COOLDOWN: 60, // segundos
                MAX_ATTEMPTS: 3
            }
        };
        
        // Estado del usuario
        this.user = {
            isAuthenticated: false,
            token: null,
            profile: null,
            isAdmin: false,
            adminToken: null
        };
        
        // Caché local
        this.cache = new Map();
        
        // Inicializar
        this.init();
    }
    
    async init() {
        console.log('🚀 Inicializando integración con Backend RSC Mining...');
        
        try {
            // Verificar conectividad con el backend
            await this.checkBackendHealth();
            
            // Cargar token guardado si existe
            this.loadStoredTokens();
            
            // Configurar interceptores de red
            this.setupNetworkInterceptors();
            
            console.log('✅ Integración con Backend RSC Mining inicializada');
            
        } catch (error) {
            console.error('❌ Error inicializando integración con backend:', error);
            this.showBackendError('No se pudo conectar con el backend de minería RSC');
        }
    }
    
    // ===== VERIFICACIÓN DE SALUD DEL BACKEND =====
    
    async checkBackendHealth() {
        try {
            const response = await this.makeRequest('GET', this.config.ENDPOINTS.SYSTEM.HEALTH);
            if (response.ok) {
                console.log('✅ Backend RSC Mining está funcionando correctamente');
                return true;
            } else {
                throw new Error('Backend no responde correctamente');
            }
        } catch (error) {
            console.error('❌ Backend no disponible:', error);
            throw error;
        }
    }
    
    // ===== AUTENTICACIÓN =====
    
    async registerUser(email, password, referralCode = null) {
        try {
            const response = await this.makeRequest('POST', this.config.ENDPOINTS.AUTH.REGISTER, {
                email,
                password,
                referralCode
            });
            
            if (response.ok) {
                showNotification('success', 'Registro Exitoso', 'Usuario registrado correctamente. Ahora puedes iniciar sesión.');
                return true;
            } else {
                const error = await response.json();
                throw new Error(error.error || 'Error en el registro');
            }
        } catch (error) {
            showNotification('error', 'Error de Registro', error.message);
            throw error;
        }
    }
    
    async loginUser(email, password) {
        try {
            const response = await this.makeRequest('POST', this.config.ENDPOINTS.AUTH.LOGIN, {
                email,
                password
            });
            
            if (response.ok) {
                const data = await response.json();
                this.user.token = data.token;
                this.user.isAuthenticated = true;
                this.user.isAdmin = false;
                
                // Guardar token
                this.saveStoredTokens();
                
                // Cargar perfil
                await this.loadUserProfile();
                
                showNotification('success', 'Login Exitoso', 'Sesión iniciada correctamente');
                return true;
            } else {
                const error = await response.json();
                throw new Error(error.error || 'Credenciales inválidas');
            }
        } catch (error) {
            showNotification('error', 'Error de Login', error.message);
            throw error;
        }
    }
    
    async loginAdmin(email, password) {
        try {
            const response = await this.makeRequest('POST', this.config.ENDPOINTS.AUTH.ADMIN_LOGIN, {
                email,
                password
            });
            
            if (response.ok) {
                const data = await response.json();
                this.user.adminToken = data.token;
                this.user.isAdmin = true;
                
                // Guardar token admin
                this.saveStoredTokens();
                
                showNotification('success', 'Login Admin Exitoso', 'Sesión de administrador iniciada');
                return true;
            } else {
                const error = await response.json();
                throw new Error(error.error || 'Credenciales de administrador inválidas');
            }
        } catch (error) {
            showNotification('error', 'Error de Login Admin', error.message);
            throw error;
        }
    }
    
    async loadUserProfile() {
        if (!this.user.token) return null;
        
        try {
            const response = await this.makeRequest('GET', this.config.ENDPOINTS.AUTH.PROFILE, null, true);
            if (response.ok) {
                this.user.profile = await response.json();
                return this.user.profile;
            }
        } catch (error) {
            console.error('Error cargando perfil:', error);
        }
        return null;
    }
    
    logout() {
        this.user.isAuthenticated = false;
        this.user.isAdmin = false;
        this.user.token = null;
        this.user.adminToken = null;
        this.user.profile = null;
        
        // Limpiar caché
        this.clearCache();
        
        // Limpiar tokens guardados
        localStorage.removeItem('rsc_user_token');
        localStorage.removeItem('rsc_admin_token');
        
        showNotification('info', 'Sesión Cerrada', 'Has cerrado sesión correctamente');
    }
    
    // ===== MINERÍA =====
    
    async executeMining() {
        if (!this.user.isAuthenticated) {
            throw new Error('Debes iniciar sesión para minar');
        }
        
        try {
            const response = await this.makeRequest('POST', this.config.ENDPOINTS.MINE.MINE, {}, true);
            
            if (response.ok) {
                const data = await response.json();
                
                // Limpiar caché de balance y stats
                this.clearCacheByPattern('balance');
                this.clearCacheByPattern('stats');
                this.clearCacheByPattern('leaderboard');
                
                showNotification('success', 'Minería Exitosa', `¡Has minado ${data.reward} RSC!`);
                return data;
            } else {
                const error = await response.json();
                if (error.reason === 'COOLDOWN') {
                    showNotification('warning', 'Cooldown Activo', `Espera ${error.secondsLeft} segundos para minar nuevamente`);
                } else if (error.reason === 'DAILY_CAP') {
                    showNotification('warning', 'Límite Diario Alcanzado', 'Has alcanzado el límite diario de minería');
                } else {
                    throw new Error(error.error || 'Error en la minería');
                }
                return error;
            }
        } catch (error) {
            showNotification('error', 'Error de Minería', error.message);
            throw error;
        }
    }
    
    async getUserBalance() {
        if (!this.user.isAuthenticated) return 0;
        
        const cacheKey = 'user_balance';
        if (this.isCacheValid(cacheKey)) {
            return this.cache.get(cacheKey);
        }
        
        try {
            const response = await this.makeRequest('GET', this.config.ENDPOINTS.MINE.BALANCE, null, true);
            if (response.ok) {
                const data = await response.json();
                this.setCache(cacheKey, data.balance);
                return data.balance;
            }
        } catch (error) {
            console.error('Error obteniendo balance:', error);
        }
        return 0;
    }
    
    async getMiningStats() {
        if (!this.user.isAuthenticated) return null;
        
        const cacheKey = 'mining_stats';
        if (this.isCacheValid(cacheKey)) {
            return this.cache.get(cacheKey);
        }
        
        try {
            const response = await this.makeRequest('GET', this.config.ENDPOINTS.MINE.STATS, null, true);
            if (response.ok) {
                const data = await response.json();
                this.setCache(cacheKey, data);
                return data;
            }
        } catch (error) {
            console.error('Error obteniendo stats de minería:', error);
        }
        return null;
    }
    
    // ===== LEADERBOARD PÚBLICO =====
    
    async getLeaderboard(period = 'all', page = 1, pageSize = 20) {
        const cacheKey = `leaderboard_${period}_${page}_${pageSize}`;
        
        if (this.isCacheValid(cacheKey, this.config.CACHE.LEADERBOARD_TTL)) {
            return this.cache.get(cacheKey);
        }
        
        try {
            const params = new URLSearchParams({
                period,
                page: page.toString(),
                pageSize: pageSize.toString()
            });
            
            const response = await this.makeRequest('GET', `${this.config.ENDPOINTS.PUBLIC.LEADERBOARD}?${params}`);
            
            if (response.ok) {
                const data = await response.json();
                this.setCache(cacheKey, data, this.config.CACHE.LEADERBOARD_TTL);
                return data;
            } else {
                throw new Error('Error obteniendo leaderboard');
            }
        } catch (error) {
            console.error('Error obteniendo leaderboard:', error);
            throw error;
        }
    }
    
    async getTop10Miners(period = 'all') {
        try {
            const response = await this.makeRequest('GET', `${this.config.ENDPOINTS.PUBLIC.TOP10}?period=${period}`);
            
            if (response.ok) {
                return await response.json();
            } else {
                throw new Error('Error obteniendo top 10');
            }
        } catch (error) {
            console.error('Error obteniendo top 10:', error);
            throw error;
        }
    }
    
    async getSystemStats() {
        const cacheKey = 'system_stats';
        
        if (this.isCacheValid(cacheKey)) {
            return this.cache.get(cacheKey);
        }
        
        try {
            const response = await this.makeRequest('GET', this.config.ENDPOINTS.PUBLIC.STATS);
            
            if (response.ok) {
                const data = await response.json();
                this.setCache(cacheKey, data);
                return data;
            } else {
                throw new Error('Error obteniendo estadísticas del sistema');
            }
        } catch (error) {
            console.error('Error obteniendo stats del sistema:', error);
            throw error;
        }
    }
    
    // ===== ADMINISTRACIÓN =====
    
    async getAdminDashboard() {
        if (!this.user.isAdmin) {
            throw new Error('Acceso denegado. Se requieren permisos de administrador');
        }
        
        try {
            const response = await this.makeRequest('GET', this.config.ENDPOINTS.ADMIN.DASHBOARD, null, false, true);
            
            if (response.ok) {
                return await response.json();
            } else {
                throw new Error('Error obteniendo dashboard administrativo');
            }
        } catch (error) {
            console.error('Error obteniendo dashboard admin:', error);
            throw error;
        }
    }
    
    async getUsersList(page = 1, pageSize = 20) {
        if (!this.user.isAdmin) {
            throw new Error('Acceso denegado. Se requieren permisos de administrador');
        }
        
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                pageSize: pageSize.toString()
            });
            
            const response = await this.makeRequest('GET', `${this.config.ENDPOINTS.ADMIN.USERS}?${params}`, null, false, true);
            
            if (response.ok) {
                return await response.json();
            } else {
                throw new Error('Error obteniendo lista de usuarios');
            }
        } catch (error) {
            console.error('Error obteniendo usuarios:', error);
            throw error;
        }
    }
    
    async exportUsersCSV() {
        if (!this.user.isAdmin) {
            throw new Error('Acceso denegado. Se requieren permisos de administrador');
        }
        
        try {
            const response = await this.makeRequest('GET', this.config.ENDPOINTS.ADMIN.EXPORT_USERS, null, false, true);
            
            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'usuarios_rsc_mining.csv';
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
                
                showNotification('success', 'Exportación Exitosa', 'Archivo CSV de usuarios descargado');
            } else {
                throw new Error('Error exportando usuarios');
            }
        } catch (error) {
            console.error('Error exportando usuarios:', error);
            showNotification('error', 'Error de Exportación', error.message);
        }
    }
    
    // ===== UTILIDADES =====
    
    async makeRequest(method, endpoint, body = null, useUserToken = false, useAdminToken = false) {
        const url = `${this.config.BASE_URL}${endpoint}`;
        const headers = {
            'Content-Type': 'application/json'
        };
        
        // Agregar token de autenticación
        if (useUserToken && this.user.token) {
            headers['Authorization'] = `Bearer ${this.user.token}`;
        } else if (useAdminToken && this.user.adminToken) {
            headers['Authorization'] = `Bearer ${this.user.adminToken}`;
        }
        
        const options = {
            method,
            headers,
            credentials: 'include'
        };
        
        if (body && method !== 'GET') {
            options.body = JSON.stringify(body);
        }
        
        try {
            const response = await fetch(url, options);
            return response;
        } catch (error) {
            console.error(`Error en request ${method} ${endpoint}:`, error);
            throw error;
        }
    }
    
    // ===== SISTEMA DE CACHÉ =====
    
    setCache(key, value, ttl = this.config.CACHE.TTL) {
        this.cache.set(key, {
            value,
            timestamp: Date.now(),
            ttl
        });
    }
    
    getCache(key) {
        const cached = this.cache.get(key);
        if (cached && this.isCacheValid(key, cached.ttl)) {
            return cached.value;
        }
        return null;
    }
    
    isCacheValid(key, ttl = this.config.CACHE.TTL) {
        const cached = this.cache.get(key);
        if (!cached) return false;
        
        const now = Date.now();
        const age = now - cached.timestamp;
        return age < ttl;
    }
    
    clearCache() {
        this.cache.clear();
    }
    
    clearCacheByPattern(pattern) {
        for (const key of this.cache.keys()) {
            if (key.includes(pattern)) {
                this.cache.delete(key);
            }
        }
    }
    
    // ===== PERSISTENCIA DE TOKENS =====
    
    saveStoredTokens() {
        if (this.user.token) {
            localStorage.setItem('rsc_user_token', this.user.token);
        }
        if (this.user.adminToken) {
            localStorage.setItem('rsc_admin_token', this.user.adminToken);
        }
    }
    
    loadStoredTokens() {
        const userToken = localStorage.getItem('rsc_user_token');
        const adminToken = localStorage.getItem('rsc_admin_token');
        
        if (userToken) {
            this.user.token = userToken;
            this.user.isAuthenticated = true;
            this.user.isAdmin = false;
        }
        
        if (adminToken) {
            this.user.adminToken = adminToken;
            this.user.isAdmin = true;
        }
    }
    
    // ===== INTERCEPTORES DE RED =====
    
    setupNetworkInterceptors() {
        // Interceptor para manejar errores de red
        window.addEventListener('online', () => {
            console.log('🌐 Conexión a internet restaurada');
            showNotification('success', 'Conexión Restaurada', 'Internet está funcionando nuevamente');
        });
        
        window.addEventListener('offline', () => {
            console.log('❌ Conexión a internet perdida');
            showNotification('warning', 'Sin Conexión', 'No hay conexión a internet');
        });
    }
    
    // ===== MANEJO DE ERRORES =====
    
    showBackendError(message) {
        showNotification('error', 'Error del Backend', message);
        
        // Crear elemento de error visual
        const errorElement = document.createElement('div');
        errorElement.className = 'backend-error-banner';
        errorElement.innerHTML = `
            <div class="error-content">
                <span class="error-icon">⚠️</span>
                <span class="error-text">${message}</span>
                <button class="error-retry" onclick="rscBackend.checkBackendHealth()">Reintentar</button>
            </div>
        `;
        
        // Agregar estilos
        errorElement.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            background: linear-gradient(135deg, #ef4444, #dc2626);
            color: white;
            padding: 12px 20px;
            text-align: center;
            z-index: 9999;
            font-weight: 500;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;
        
        // Agregar al DOM
        document.body.appendChild(errorElement);
        
        // Remover después de 10 segundos
        setTimeout(() => {
            if (errorElement.parentNode) {
                errorElement.parentNode.removeChild(errorElement);
            }
        }, 10000);
    }
    
    // ===== MÉTODOS PÚBLICOS =====
    
    // Verificar si el usuario está autenticado
    isUserAuthenticated() {
        return this.user.isAuthenticated;
    }
    
    // Verificar si el usuario es admin
    isUserAdmin() {
        return this.user.isAdmin;
    }
    
    // Obtener perfil del usuario
    getUserProfile() {
        return this.user.profile;
    }
    
    // Obtener configuración
    getConfig() {
        return this.config;
    }
    
    // Cambiar URL del backend (útil para desarrollo/producción)
    setBackendUrl(url) {
        this.config.BASE_URL = url;
        console.log(`🔗 URL del backend cambiada a: ${url}`);
    }
}

// ===== INICIALIZACIÓN GLOBAL =====

// Crear instancia global
window.rscBackend = new RSCMiningBackend();

// Exportar para uso en otros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RSCMiningBackend;
}

console.log('🚀 Módulo de integración con Backend RSC Mining cargado');

