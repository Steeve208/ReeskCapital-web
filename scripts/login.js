/* ===== SISTEMA DE LOGIN SIMPLIFICADO PARA MINERÍA RSC ===== */

class LoginManager {
    constructor() {
        this.isAuthenticated = false;
        this.currentUser = null;
        this.init();
    }

    init() {
        this.checkAuthStatus();
        console.log('🔐 Sistema de login simplificado inicializado');
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
                        window.location.href = 'mine.html';
                    }
                }
            } catch (error) {
                console.error('❌ Error verificando sesión:', error);
                localStorage.removeItem('rsc_user_session');
            }
        }
    }

    async createAccount() {
        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;
        const walletAddress = document.getElementById('walletAddress').value;

        if (!username || !email) {
            showNotification('warning', 'Campos Vacíos', 'Por favor completa el nombre de usuario y email');
            return;
        }

        try {
            console.log('📝 Creando cuenta para:', username);
            
            // Crear usuario local
            const user = {
                id: 'user_' + Date.now(),
                username: username,
                email: email,
                walletAddress: walletAddress || null,
                walletType: walletAddress ? 'custom' : 'none',
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

            showNotification('success', '¡Cuenta Creada!', 'Bienvenido al sistema de minería RSC');
            
            // Redirigir a minería
            setTimeout(() => {
                window.location.href = 'mine.html';
            }, 1500);

        } catch (error) {
            console.error('❌ Error creando cuenta:', error);
            showNotification('error', 'Error de Creación', 'No se pudo crear la cuenta');
        }
    }

    enableDemoMode() {
        console.log('🎮 Activando modo demo');
        
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

        // Guardar sesión demo
        localStorage.setItem('rsc_user_session', JSON.stringify({
            isAuthenticated: true,
            user: demoUser,
            loginTime: new Date().toISOString(),
            isDemo: true
        }));

        this.isAuthenticated = true;
        this.currentUser = demoUser;

        showNotification('success', 'Modo Demo Activado', 'Puedes probar el sistema de minería');
        
        // Redirigir a minería
        setTimeout(() => {
            window.location.href = 'mine.html';
        }, 1500);
    }

    logout() {
        this.isAuthenticated = false;
        this.currentUser = null;
        localStorage.removeItem('rsc_user_session');
        
        showNotification('info', 'Sesión Cerrada', 'Has cerrado sesión correctamente');
        
        // Redirigir a login
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);
    }
}

// Inicializar sistema de login cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
    window.loginManager = new LoginManager();
});

// Exportar para uso global
window.LoginManager = LoginManager;
