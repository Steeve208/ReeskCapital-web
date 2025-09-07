/**
 * RSC AUTHENTICATION SYSTEM
 * 
 * Sistema de autenticación completo para RSC Mining
 * - Login y registro de usuarios
 * - Integración con backend
 * - Gestión de sesiones
 * - Sistema de referidos
 */

class RSCAuth {
    constructor() {
        this.isAuthenticated = false;
        this.currentUser = null;
        this.backend = null;
        this.init();
    }

    /**
     * Inicializar sistema de autenticación
     */
    async init() {
        try {
            console.log('🔐 Inicializando sistema de autenticación...');
            
            // Verificar si hay usuario guardado
            this.checkStoredUser();
            
            // Configurar event listeners
            this.setupEventListeners();
            
            // Inicializar backend si está disponible
            if (window.RSCMiningBackend) {
                this.backend = window.RSCMiningBackend;
            }
            
            // Si no hay usuario guardado, mostrar auth
            if (!this.isAuthenticated) {
                this.showAuthSection();
            }
            
            console.log('✅ Sistema de autenticación inicializado');
        } catch (error) {
            console.error('❌ Error inicializando autenticación:', error);
        }
    }

    /**
     * Verificar usuario guardado
     */
    checkStoredUser() {
        try {
            const storedUser = localStorage.getItem('rsc_user');
            if (storedUser) {
                this.currentUser = JSON.parse(storedUser);
                this.isAuthenticated = true;
                
                // Verificar si el backend está disponible
                this.verifyBackendConnection();
                
                console.log('👤 Usuario autenticado:', this.currentUser.username);
            }
        } catch (error) {
            console.error('❌ Error verificando usuario guardado:', error);
            localStorage.removeItem('rsc_user');
        }
    }

    /**
     * Verificar conexión con backend
     */
    async verifyBackendConnection() {
        try {
            const backendConnected = await this.connectToBackend();
            if (backendConnected) {
                // Si hay backend, mostrar dashboard
                this.showMiningDashboard();
            } else {
                // Si no hay backend, mostrar auth
                this.showAuthSection();
            }
        } catch (error) {
            console.error('❌ Error verificando backend:', error);
            this.showAuthSection();
        }
    }

    /**
     * Mostrar sección de autenticación
     */
    showAuthSection() {
        const authSection = document.getElementById('authSection');
        const miningDashboard = document.getElementById('miningDashboard');
        
        if (authSection) authSection.classList.remove('hidden');
        if (miningDashboard) miningDashboard.classList.add('hidden');
        
        // Limpiar datos de usuario
        this.currentUser = null;
        this.isAuthenticated = false;
        localStorage.removeItem('rsc_user');
        localStorage.removeItem('rsc_user_id');
    }

    /**
     * Configurar event listeners
     */
    setupEventListeners() {
        // Login form
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        // Register form
        const registerForm = document.getElementById('registerForm');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => this.handleRegister(e));
        }

        // Toggle between forms
        const showRegister = document.getElementById('showRegister');
        const showLogin = document.getElementById('showLogin');
        
        if (showRegister) {
            showRegister.addEventListener('click', (e) => this.toggleForms(e, 'register'));
        }
        
        if (showLogin) {
            showLogin.addEventListener('click', (e) => this.toggleForms(e, 'login'));
        }
    }

    /**
     * Manejar login
     */
    async handleLogin(e) {
        e.preventDefault();
        
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        if (!email || !password) {
            this.showNotification('error', 'Error', 'Por favor completa todos los campos');
            return;
        }

        try {
            this.showLoading('Iniciando sesión...');
            
            // Usar Supabase directo
            if (window.SupabaseDirect && window.SupabaseDirect.isConnected) {
                // Login con Supabase
                const user = await this.loginWithSupabase(email, password);
                if (user) {
                    this.currentUser = user;
                    this.isAuthenticated = true;
                    
                    // Guardar usuario
                    localStorage.setItem('rsc_user', JSON.stringify(user));
                    localStorage.setItem('rsc_user_id', user.id);
                    
                    // Mostrar dashboard
                    this.showMiningDashboard();
                    
                    this.showNotification('success', '¡Bienvenido!', `Hola ${user.username}`);
                    
                    console.log('✅ Login exitoso:', user.username);
                } else {
                    this.showNotification('error', 'Error', 'Error al iniciar sesión');
                }
            } else {
                // Simular login local
                const user = await this.simulateLogin(email, password);
                
                if (user) {
                    this.currentUser = user;
                    this.isAuthenticated = true;
                    
                    // Guardar usuario
                    localStorage.setItem('rsc_user', JSON.stringify(user));
                    localStorage.setItem('rsc_user_id', user.id);
                    
                    // Mostrar dashboard
                    this.showMiningDashboard();
                    
                    this.showNotification('success', '¡Bienvenido!', `Hola ${user.username}`);
                    
                    console.log('✅ Login exitoso:', user.username);
                } else {
                    this.showNotification('error', 'Error', 'Credenciales incorrectas');
                }
            }
        } catch (error) {
            console.error('❌ Error en login:', error);
            this.showNotification('error', 'Error', 'Error al iniciar sesión');
        } finally {
            this.hideLoading();
        }
    }

    /**
     * Login con Supabase directo
     */
    async loginWithSupabase(email, password) {
        try {
            // Buscar usuario existente
            const existingUser = await window.SupabaseDirect.getUserByEmail(email);
            
            if (existingUser) {
                return {
                    id: existingUser.id,
                    email: existingUser.email,
                    username: existingUser.username,
                    balance: existingUser.balance || 0,
                    referralCode: existingUser.referral_code
                };
            } else {
                // Crear usuario si no existe
                const result = await window.SupabaseDirect.registerUser({
                    email: email,
                    username: email.split('@')[0],
                    referralCode: null
                });
                
                if (result.success) {
                    return {
                        id: result.user.id,
                        email: result.user.email,
                        username: result.user.username,
                        balance: result.user.balance || 0,
                        referralCode: result.user.referral_code
                    };
                }
            }
            
            return null;
        } catch (error) {
            console.error('❌ Error en login con Supabase:', error);
            return null;
        }
    }

    /**
     * Obtener usuario del backend
     */
    async getUserFromBackend(email) {
        try {
            // Simular obtención de usuario
            // En producción esto sería una llamada a /api/users/profile
            return {
                id: 'user_' + Date.now(),
                email: email,
                username: email.split('@')[0],
                balance: 0,
                referralCode: 'TEMP123'
            };
        } catch (error) {
            console.error('❌ Error obteniendo usuario:', error);
            return null;
        }
    }

    /**
     * Manejar registro
     */
    async handleRegister(e) {
        e.preventDefault();
        
        const email = document.getElementById('registerEmail').value;
        const username = document.getElementById('registerUsername').value;
        const password = document.getElementById('registerPassword').value;
        const referralCode = document.getElementById('referralCode').value;
        
        if (!email || !username || !password) {
            this.showNotification('error', 'Error', 'Por favor completa todos los campos requeridos');
            return;
        }

        try {
            this.showLoading('Creando cuenta...');
            
            // Registrar usuario
            const user = await this.registerUser({
                email,
                username,
                password,
                referralCode
            });
            
            if (user) {
                this.currentUser = user;
                this.isAuthenticated = true;
                
                // Guardar usuario
                localStorage.setItem('rsc_user', JSON.stringify(user));
                localStorage.setItem('rsc_user_id', user.id);
                
                // Mostrar dashboard
                this.showMiningDashboard();
                
                this.showNotification('success', '¡Cuenta creada!', `Bienvenido ${user.username}`);
                
                console.log('✅ Registro exitoso:', user.username);
            } else {
                this.showNotification('error', 'Error', 'Error al crear la cuenta');
            }
        } catch (error) {
            console.error('❌ Error en registro:', error);
            this.showNotification('error', 'Error', error.message || 'Error al crear la cuenta');
        } finally {
            this.hideLoading();
        }
    }

    /**
     * Registrar usuario
     */
    async registerUser(userData) {
        try {
            // Usar conexión directa a Supabase
            if (window.SupabaseDirect && window.SupabaseDirect.isConnected) {
                const result = await window.SupabaseDirect.registerUser({
                    email: userData.email,
                    username: userData.username,
                    referralCode: userData.referralCode
                });
                
                if (result.success) {
                    return {
                        id: result.user.id,
                        email: result.user.email,
                        username: result.user.username,
                        balance: result.user.balance,
                        referralCode: result.user.referral_code
                    };
                } else {
                    throw new Error(result.error);
                }
            } else {
                // Simular registro local
                return this.simulateRegister(userData);
            }
        } catch (error) {
            console.error('❌ Error registrando usuario:', error);
            throw error;
        }
    }

    /**
     * Conectar con backend
     */
    async connectToBackend() {
        try {
            const response = await fetch('http://localhost:3000/health');
            if (response.ok) {
                console.log('✅ Backend conectado correctamente');
                return true;
            } else {
                console.warn('⚠️ Backend no disponible, usando modo local');
                return false;
            }
        } catch (error) {
            console.warn('⚠️ Backend no disponible, usando modo local');
            return false;
        }
    }

    /**
     * Registrar usuario en backend
     */
    async registerWithBackend(userData) {
        try {
            const response = await fetch('http://localhost:3000/api/users/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: userData.email,
                    username: userData.username,
                    referralCode: userData.referralCode
                })
            });

            const result = await response.json();
            return result;
        } catch (error) {
            console.error('❌ Error registrando en backend:', error);
            throw error;
        }
    }

    /**
     * Simular login (para testing)
     */
    async simulateLogin(email, password) {
        // Simular delay de red
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Verificar si el usuario existe
        const storedUsers = JSON.parse(localStorage.getItem('rsc_users') || '[]');
        const user = storedUsers.find(u => u.email === email && u.password === password);
        
        if (user) {
            return {
                id: user.id,
                email: user.email,
                username: user.username,
                balance: user.balance || 0,
                referralCode: user.referralCode
            };
        }
        
        return null;
    }

    /**
     * Simular registro (para testing)
     */
    async simulateRegister(userData) {
        // Simular delay de red
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Generar ID único
        const id = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        
        // Generar código de referral
        const referralCode = this.generateReferralCode();
        
        const user = {
            id,
            email: userData.email,
            username: userData.username,
            password: userData.password,
            balance: 0,
            referralCode,
            referredBy: userData.referralCode || null,
            createdAt: new Date().toISOString()
        };
        
        // Guardar usuario
        const storedUsers = JSON.parse(localStorage.getItem('rsc_users') || '[]');
        storedUsers.push(user);
        localStorage.setItem('rsc_users', JSON.stringify(storedUsers));
        
        return {
            id: user.id,
            email: user.email,
            username: user.username,
            balance: user.balance,
            referralCode: user.referralCode
        };
    }

    /**
     * Generar código de referral
     */
    generateReferralCode() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < 8; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    /**
     * Toggle entre formularios
     */
    toggleForms(e, formType) {
        e.preventDefault();
        
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');
        
        if (formType === 'register') {
            loginForm.classList.remove('active');
            registerForm.classList.add('active');
        } else {
            registerForm.classList.remove('active');
            loginForm.classList.add('active');
        }
    }

    /**
     * Mostrar dashboard de minería
     */
    showMiningDashboard() {
        const authSection = document.getElementById('authSection');
        const miningDashboard = document.getElementById('miningDashboard');
        
        if (authSection) authSection.classList.add('hidden');
        if (miningDashboard) miningDashboard.classList.remove('hidden');
        
        // Actualizar información del usuario
        this.updateUserInfo();
        
        // Inicializar sistema de minería si está disponible
        if (window.RSCMiningCore) {
            window.RSCMiningCore.init();
        }
    }

    /**
     * Actualizar información del usuario
     */
    updateUserInfo() {
        if (!this.currentUser) return;
        
        const userName = document.getElementById('userName');
        const userEmail = document.getElementById('userEmail');
        const userBalance = document.getElementById('userBalance');
        
        if (userName) userName.textContent = this.currentUser.username;
        if (userEmail) userEmail.textContent = this.currentUser.email;
        if (userBalance) userBalance.textContent = this.currentUser.balance.toFixed(6) + ' RSC';
    }

    /**
     * Cerrar sesión
     */
    logout() {
        this.currentUser = null;
        this.isAuthenticated = false;
        
        localStorage.removeItem('rsc_user');
        localStorage.removeItem('rsc_user_id');
        localStorage.removeItem('rsc_users'); // Limpiar usuarios locales
        
        const authSection = document.getElementById('authSection');
        const miningDashboard = document.getElementById('miningDashboard');
        
        if (authSection) authSection.classList.remove('hidden');
        if (miningDashboard) miningDashboard.classList.add('hidden');
        
        console.log('👋 Sesión cerrada');
    }

    /**
     * Limpiar todos los datos y forzar autenticación
     */
    clearAllData() {
        // Limpiar localStorage
        localStorage.removeItem('rsc_user');
        localStorage.removeItem('rsc_user_id');
        localStorage.removeItem('rsc_users');
        localStorage.removeItem('rsc_wallet_balance');
        localStorage.removeItem('rsc_mining_session');
        localStorage.removeItem('rsc_mining_stats');
        localStorage.removeItem('rsc_mining_config');
        
        // Resetear estado
        this.currentUser = null;
        this.isAuthenticated = false;
        
        // Mostrar auth
        this.showAuthSection();
        
        console.log('🧹 Todos los datos limpiados');
    }

    /**
     * Mostrar notificación
     */
    showNotification(type, title, message) {
        // Crear elemento de notificación
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <div class="notification-icon">
                    <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
                </div>
                <div class="notification-text">
                    <div class="notification-title">${title}</div>
                    <div class="notification-message">${message}</div>
                </div>
            </div>
        `;
        
        // Agregar estilos
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#10b981' : '#ef4444'};
            color: white;
            padding: 1rem;
            border-radius: 10px;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
            z-index: 10000;
            animation: slideIn 0.3s ease-out;
        `;
        
        document.body.appendChild(notification);
        
        // Remover después de 3 segundos
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    /**
     * Mostrar loading
     */
    showLoading(message) {
        const loading = document.createElement('div');
        loading.id = 'authLoading';
        loading.innerHTML = `
            <div class="loading-overlay">
                <div class="loading-spinner"></div>
                <div class="loading-text">${message}</div>
            </div>
        `;
        
        loading.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
        `;
        
        document.body.appendChild(loading);
    }

    /**
     * Ocultar loading
     */
    hideLoading() {
        const loading = document.getElementById('authLoading');
        if (loading) {
            loading.remove();
        }
    }

    /**
     * Obtener usuario actual
     */
    getCurrentUser() {
        return this.currentUser;
    }

    /**
     * Verificar si está autenticado
     */
    isLoggedIn() {
        return this.isAuthenticated;
    }
}

// Inicializar sistema de autenticación
window.RSCAuth = new RSCAuth();

// Agregar estilos CSS para notificaciones
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    .loading-overlay {
        text-align: center;
        color: white;
    }
    
    .loading-spinner {
        width: 40px;
        height: 40px;
        border: 4px solid rgba(255, 255, 255, 0.3);
        border-top: 4px solid white;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin: 0 auto 1rem;
    }
    
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
    
    .loading-text {
        font-size: 1rem;
        font-weight: 500;
    }
`;
document.head.appendChild(style);
