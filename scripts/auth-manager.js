/* ========================================
   AUTH MANAGER - RSC CHAIN
   Gestiona la autenticación de usuarios
   con integración con Supabase
================================ */

class AuthManager {
    constructor() {
        this.currentUser = null;
        this.isAuthenticated = false;
        this.authModal = null;
        
        this.init();
    }

    async init() {
        console.log('🔐 Inicializando Auth Manager...');
        
        try {
            // Esperar a que Supabase esté disponible
            await this.waitForSupabase();
            
            // Verificar si hay una sesión existente
            await this.checkExistingSession();
            
            // Si no hay usuario, crear uno automáticamente
            if (!this.isAuthenticated) {
                await this.autoAuthenticate();
            }
            
            // Configurar event listeners
            this.setupEventListeners();
            
            // Configurar modal de autenticación
            this.setupAuthModal();
            
            console.log('✅ Auth Manager inicializado correctamente');
            
        } catch (error) {
            console.error('❌ Error inicializando Auth Manager:', error);
        }
    }

    async waitForSupabase() {
        return new Promise((resolve) => {
            const checkSupabase = () => {
                if (window.supabaseMining && window.supabaseMining.isConnected) {
                    resolve();
                } else {
                    setTimeout(checkSupabase, 100);
                }
            };
            checkSupabase();
        });
    }

    async autoAuthenticate() {
        try {
            console.log('🔐 Autenticación automática...');
            
            // Crear usuario por defecto
            const defaultEmail = 'user@rsc.local';
            const defaultName = 'Usuario RSC';
            
            await this.authenticateUser(defaultEmail, defaultName);
            
            console.log('✅ Usuario autenticado automáticamente:', this.currentUser.name);
            
        } catch (error) {
            console.error('❌ Error en autenticación automática:', error);
        }
    }

    async checkExistingSession() {
        try {
            const userEmail = localStorage.getItem('rsc_user_email');
            const userName = localStorage.getItem('rsc_user_name');
            
            if (userEmail && userName) {
                this.currentUser = {
                    email: userEmail,
                    name: userName,
                    id: localStorage.getItem('rsc_user_id') || 'user_' + Date.now()
                };
                
                this.isAuthenticated = true;
                console.log('✅ Sesión existente encontrada:', this.currentUser.name);
                
                // Emitir evento de autenticación
                this.emitEvent('auth:user:authenticated', { user: this.currentUser });
                
                return true;
            }
        } catch (error) {
            console.error('❌ Error verificando sesión existente:', error);
        }
        
        return false;
    }

    setupEventListeners() {
        // Botón de login en navbar
        const loginBtn = document.querySelector('.login-link');
        if (loginBtn) {
            loginBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showAuthModal();
            });
        }

        // Botón de conectar wallet
        const walletBtn = document.getElementById('walletConnectBtn');
        if (walletBtn) {
            walletBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showAuthModal();
            });
        }

        console.log('🎧 Event listeners de autenticación configurados');
    }

    setupAuthModal() {
        // Crear modal de autenticación
        this.authModal = document.createElement('div');
        this.authModal.className = 'auth-modal';
        this.authModal.style.display = 'none';
        
        this.authModal.innerHTML = `
            <div class="auth-modal-content">
                <div class="auth-modal-header">
                    <h3>🔐 Acceso RSC Chain</h3>
                    <button class="auth-modal-close" onclick="window.authManager.hideAuthModal()">×</button>
                </div>
                
                <div class="auth-modal-body">
                    <div class="auth-tabs">
                        <button class="auth-tab active" data-tab="login">Iniciar Sesión</button>
                        <button class="auth-tab" data-tab="register">Registrarse</button>
                    </div>
                    
                    <!-- Formulario de Login -->
                    <form id="loginForm" class="auth-form active">
                        <div class="form-group">
                            <label for="loginEmail">Email:</label>
                            <input type="email" id="loginEmail" required placeholder="tu@email.com">
                        </div>
                        <div class="form-group">
                            <label for="loginPassword">Contraseña:</label>
                            <input type="password" id="loginPassword" required placeholder="••••••••">
                        </div>
                        <button type="submit" class="auth-btn">Iniciar Sesión</button>
                    </form>
                    
                    <!-- Formulario de Registro -->
                    <form id="registerForm" class="auth-form">
                        <div class="form-group">
                            <label for="registerName">Nombre:</label>
                            <input type="text" id="registerName" required placeholder="Tu Nombre">
                        </div>
                        <div class="form-group">
                            <label for="registerEmail">Email:</label>
                            <input type="email" id="registerEmail" required placeholder="tu@email.com">
                        </div>
                        <div class="form-group">
                            <label for="registerPassword">Contraseña:</label>
                            <input type="password" id="registerPassword" required placeholder="••••••••">
                        </div>
                        <button type="submit" class="auth-btn">Registrarse</button>
                    </form>
                    
                    <!-- Acceso Rápido (para desarrollo) -->
                    <div class="quick-access">
                        <p>🔧 Acceso Rápido para Desarrollo:</p>
                        <button onclick="window.authManager.quickLogin()" class="quick-btn">
                            Acceso Rápido
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Agregar modal al DOM
        document.body.appendChild(this.authModal);
        
        // Configurar tabs
        this.setupAuthTabs();
        
        // Configurar formularios
        this.setupAuthForms();
        
        console.log('🎭 Modal de autenticación configurado');
    }

    setupAuthTabs() {
        const tabs = this.authModal.querySelectorAll('.auth-tab');
        const forms = this.authModal.querySelectorAll('.auth-form');
        
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const targetTab = tab.dataset.tab;
                
                // Activar tab
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                
                // Mostrar formulario correspondiente
                forms.forEach(form => {
                    form.classList.remove('active');
                    if (form.id === targetTab + 'Form') {
                        form.classList.add('active');
                    }
                });
            });
        });
    }

    setupAuthForms() {
        // Formulario de login
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin();
            });
        }
        
        // Formulario de registro
        const registerForm = document.getElementById('registerForm');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleRegister();
            });
        }
    }

    async handleLogin() {
        try {
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            
            if (!email || !password) {
                throw new Error('Por favor completa todos los campos');
            }
            
            // Para desarrollo, simular login exitoso
            // En producción, aquí iría la autenticación real con Supabase
            await this.authenticateUser(email, 'Usuario Login');
            
            this.hideAuthModal();
            this.showNotification('success', '¡Bienvenido!', 'Has iniciado sesión correctamente');
            
        } catch (error) {
            console.error('❌ Error en login:', error);
            this.showNotification('error', 'Error de Login', error.message);
        }
    }

    async handleRegister() {
        try {
            const name = document.getElementById('registerName').value;
            const email = document.getElementById('registerEmail').value;
            const password = document.getElementById('registerPassword').value;
            
            if (!name || !email || !password) {
                throw new Error('Por favor completa todos los campos');
            }
            
            // Para desarrollo, simular registro exitoso
            // En producción, aquí iría el registro real con Supabase
            await this.authenticateUser(email, name);
            
            this.hideAuthModal();
            this.showNotification('success', '¡Registro Exitoso!', 'Tu cuenta ha sido creada correctamente');
            
        } catch (error) {
            console.error('❌ Error en registro:', error);
            this.showNotification('error', 'Error de Registro', error.message);
        }
    }

    async authenticateUser(email, name) {
        try {
            // Crear usuario local
            this.currentUser = {
                email: email,
                name: name,
                id: 'user_' + Date.now(),
                walletAddress: '0x' + Math.random().toString(16).substr(2, 40)
            };
            
            // Guardar en localStorage
            localStorage.setItem('rsc_user_email', this.currentUser.email);
            localStorage.setItem('rsc_user_name', this.currentUser.name);
            localStorage.setItem('rsc_user_id', this.currentUser.id);
            
            this.isAuthenticated = true;
            
            // Actualizar UI
            this.updateAuthUI();
            
            // Emitir evento de autenticación
            this.emitEvent('auth:user:authenticated', { user: this.currentUser });
            
            // Si Supabase está disponible, sincronizar usuario
            if (window.supabaseMining && window.supabaseMining.isConnected) {
                try {
                    await window.supabaseMining.setupUser();
                    console.log('✅ Usuario sincronizado con Supabase');
                    
                    // Emitir evento de sincronización exitosa
                    this.emitEvent('auth:user:synced', { user: this.currentUser });
                    
                } catch (supabaseError) {
                    console.warn('⚠️ No se pudo sincronizar con Supabase:', supabaseError.message);
                }
            }
            
            console.log('✅ Usuario autenticado:', this.currentUser.name);
            
            return this.currentUser;
            
        } catch (error) {
            throw new Error('Error autenticando usuario: ' + error.message);
        }
    }

    quickLogin() {
        // Acceso rápido para desarrollo
        this.authenticateUser('dev@rsc.local', 'Usuario Desarrollo');
        this.hideAuthModal();
        this.showNotification('info', 'Acceso Rápido', 'Modo desarrollo activado');
    }

    updateAuthUI() {
        // Actualizar botón de login
        const loginBtn = document.querySelector('.login-link');
        if (loginBtn) {
            loginBtn.textContent = `👤 ${this.currentUser.name}`;
            loginBtn.classList.add('authenticated');
        }
        
        // Actualizar botón de wallet
        const walletBtn = document.getElementById('walletConnectBtn');
        if (walletBtn) {
            walletBtn.innerHTML = `
                <span class="wallet-icon">🔓</span>
                <span class="wallet-text">${this.currentUser.walletAddress.substr(0, 8)}...</span>
            `;
            walletBtn.classList.add('connected');
        }
        
        // Emitir evento de cambio de UI
        this.emitEvent('auth:ui:updated', { user: this.currentUser });
    }

    showAuthModal() {
        if (this.authModal) {
            this.authModal.style.display = 'flex';
        }
    }

    hideAuthModal() {
        if (this.authModal) {
            this.authModal.style.display = 'none';
        }
    }

    logout() {
        // Limpiar datos de usuario
        this.currentUser = null;
        this.isAuthenticated = false;
        
        // Limpiar localStorage
        localStorage.removeItem('rsc_user_email');
        localStorage.removeItem('rsc_user_name');
        localStorage.removeItem('rsc_user_id');
        
        // Restaurar UI
        this.restoreAuthUI();
        
        // Emitir evento de logout
        this.emitEvent('auth:user:loggedout', {});
        
        console.log('🔓 Usuario desconectado');
    }

    restoreAuthUI() {
        // Restaurar botón de login
        const loginBtn = document.querySelector('.login-link');
        if (loginBtn) {
            loginBtn.textContent = '🔐 Login';
            loginBtn.classList.remove('authenticated');
        }
        
        // Restaurar botón de wallet
        const walletBtn = document.getElementById('walletConnectBtn');
        if (walletBtn) {
            walletBtn.innerHTML = `
                <span class="wallet-icon">🔒</span>
                <span class="wallet-text">Connect Wallet</span>
            `;
            walletBtn.classList.remove('connected');
        }
    }

    showNotification(type, title, message) {
        // Crear notificación
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-header">
                <span class="notification-title">${title}</span>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
            <div class="notification-message">${message}</div>
        `;

        const container = document.getElementById('notificationsContainer');
        if (container) {
            container.appendChild(notification);
            
            // Auto-remover después de 5 segundos
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.remove();
                }
            }, 5000);
        }
    }

    emitEvent(eventName, data) {
        const event = new CustomEvent(eventName, { detail: data });
        window.dispatchEvent(event);
    }

    // Getters
    getUser() {
        return this.currentUser;
    }
    
    isUserAuthenticated() {
        return this.isAuthenticated;
    }
}

// Crear instancia global
const authManager = new AuthManager();

// Exportar para uso global
if (typeof window !== 'undefined') {
    window.authManager = authManager;
    window.AuthManager = AuthManager;
}

// Para compatibilidad con módulos ES6
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AuthManager, authManager };
}
