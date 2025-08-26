/* ===== SISTEMA DE LOGIN SIMPLIFICADO PARA MINERÍA RSC ===== */

class LoginManager {
    constructor() {
        this.isAuthenticated = false;
        this.currentUser = null;
        this.init();
    }

    init() {
        console.log('🔐 Inicializando sistema de login...');
        this.checkAuthStatus();
        this.setupEventListeners();
        console.log('✅ Sistema de login inicializado correctamente');
    }

    setupEventListeners() {
        // Asegurar que los botones estén disponibles
        setTimeout(() => {
            const createAccountBtn = document.querySelector('.btn-access');
            const demoModeBtn = document.querySelector('.btn-demo');
            
            if (createAccountBtn) {
                createAccountBtn.addEventListener('click', () => this.createAccount());
                console.log('✅ Botón crear cuenta configurado');
            }
            
            if (demoModeBtn) {
                demoModeBtn.addEventListener('click', () => this.enableDemoMode());
                console.log('✅ Botón modo demo configurado');
            }
        }, 100);
    }

    checkAuthStatus() {
        const sessionData = localStorage.getItem('rsc_user_session');
        
        if (sessionData) {
            try {
                const session = JSON.parse(sessionData);
                
                if (session.isAuthenticated && session.user) {
                    this.isAuthenticated = true;
                    this.currentUser = session.user;
                    console.log('✅ Usuario ya autenticado:', this.currentUser);
                    
                    // Si ya está autenticado, redirigir a minería
                    if (window.location.pathname.includes('login.html')) {
                        console.log('🔄 Redirigiendo usuario autenticado a minería...');
                        setTimeout(() => {
                            window.location.href = 'mine.html';
                        }, 1000);
                    }
                }
            } catch (error) {
                console.error('❌ Error verificando sesión:', error);
                localStorage.removeItem('rsc_user_session');
            }
        } else {
            console.log('ℹ️ No hay sesión activa');
        }
    }

    async createAccount() {
        console.log('📝 Iniciando creación de cuenta...');
        
        const username = document.getElementById('username');
        const email = document.getElementById('email');
        const walletAddress = document.getElementById('walletAddress');

        if (!username || !email) {
            console.error('❌ Elementos del formulario no encontrados');
            return;
        }

        const usernameValue = username.value.trim();
        const emailValue = email.value.trim();
        const walletAddressValue = walletAddress ? walletAddress.value.trim() : '';

        if (!usernameValue || !emailValue) {
            this.showNotification('warning', 'Campos Vacíos', 'Por favor completa el nombre de usuario y email');
            return;
        }

        if (usernameValue.length < 3) {
            this.showNotification('warning', 'Usuario Muy Corto', 'El nombre de usuario debe tener al menos 3 caracteres');
            return;
        }

        if (!this.isValidEmail(emailValue)) {
            this.showNotification('warning', 'Email Inválido', 'Por favor ingresa un email válido');
            return;
        }

        try {
            console.log('📝 Creando cuenta para:', usernameValue);
            
            // Crear usuario local
            const user = {
                id: 'user_' + Date.now(),
                username: usernameValue,
                email: emailValue,
                walletAddress: walletAddressValue || null,
                walletType: walletAddressValue ? 'custom' : 'none',
                registrationDate: new Date().toISOString(),
                totalSimulatedTokens: 0,
                lastMiningActivity: null,
                isMigrated: false,
                status: 'active'
            };

            // Guardar sesión
            localStorage.setItem('rsc_user_session', JSON.stringify({
                isAuthenticated: true,
                user: user,
                loginTime: new Date().toISOString()
            }));

            this.isAuthenticated = true;
            this.currentUser = user;

            this.showNotification('success', '¡Cuenta Creada!', 'Bienvenido al sistema de minería RSC');
            
            console.log('✅ Cuenta creada exitosamente, redirigiendo...');
            
            // Redirigir a minería
            setTimeout(() => {
                window.location.href = 'mine.html';
            }, 2000);

        } catch (error) {
            console.error('❌ Error creando cuenta:', error);
            this.showNotification('error', 'Error de Creación', 'No se pudo crear la cuenta. Intenta de nuevo.');
        }
    }

    enableDemoMode() {
        console.log('🎮 Activando modo demo...');
        
        // Crear usuario demo
        const demoUser = {
            id: 'demo_' + Date.now(),
            username: 'DemoUser',
            email: 'demo@rsc.com',
            walletAddress: null,
            walletType: 'demo',
            registrationDate: new Date().toISOString(),
            totalSimulatedTokens: 0,
            lastMiningActivity: null,
            isMigrated: false,
            status: 'active'
        };

        try {
            // Guardar sesión demo
            localStorage.setItem('rsc_user_session', JSON.stringify({
                isAuthenticated: true,
                user: demoUser,
                loginTime: new Date().toISOString(),
                isDemo: true
            }));

            this.isAuthenticated = true;
            this.currentUser = demoUser;

            this.showNotification('success', 'Modo Demo Activado', 'Puedes probar el sistema de minería');
            
            console.log('✅ Modo demo activado, redirigiendo...');
            
            // Redirigir a minería
            setTimeout(() => {
                window.location.href = 'mine.html';
            }, 2000);
            
        } catch (error) {
            console.error('❌ Error activando modo demo:', error);
            this.showNotification('error', 'Error Demo', 'No se pudo activar el modo demo');
        }
    }

    logout() {
        console.log('🚪 Cerrando sesión...');
        
        this.isAuthenticated = false;
        this.currentUser = null;
        localStorage.removeItem('rsc_user_session');
        
        this.showNotification('info', 'Sesión Cerrada', 'Has cerrado sesión correctamente');
        
        // Redirigir a login
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2000);
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    showNotification(type, title, message) {
        // Intentar usar el sistema de notificaciones global
        if (typeof showNotification === 'function') {
            showNotification(type, title, message);
        } else {
            // Fallback: mostrar alerta simple
            console.log(`${type.toUpperCase()}: ${title} - ${message}`);
            alert(`${title}\n${message}`);
        }
    }

    getCurrentUser() {
        return this.currentUser;
    }

    isUserAuthenticated() {
        return this.isAuthenticated;
    }
}

// Inicializar sistema de login cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 DOM cargado, inicializando LoginManager...');
    
    try {
        window.loginManager = new LoginManager();
        console.log('✅ LoginManager inicializado globalmente');
    } catch (error) {
        console.error('❌ Error inicializando LoginManager:', error);
    }
});

// Función global para compatibilidad
window.createAccount = function() {
    if (window.loginManager) {
        window.loginManager.createAccount();
    } else {
        console.error('❌ LoginManager no está disponible');
    }
};

window.enableDemoMode = function() {
    if (window.loginManager) {
        window.loginManager.enableDemoMode();
    } else {
        console.error('❌ LoginManager no está disponible');
    }
};

// Exportar para uso global
window.LoginManager = LoginManager;
