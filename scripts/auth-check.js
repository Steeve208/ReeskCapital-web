/* ===== VERIFICACIÓN DE AUTENTICACIÓN PARA MINERÍA ===== */

class AuthChecker {
    constructor() {
        this.isAuthenticated = false;
        this.currentUser = null;
        this.init();
    }

    init() {
        this.checkAuthStatus();
        this.setupAuthUI();
        console.log('🔐 Verificador de autenticación inicializado');
    }

    checkAuthStatus() {
        const sessionData = localStorage.getItem('rsc_user_session');
        
        if (sessionData) {
            try {
                const session = JSON.parse(sessionData);
                
                if (session.isAuthenticated && session.user) {
                    this.isAuthenticated = true;
                    this.currentUser = session.user;
                    console.log('✅ Usuario autenticado:', this.currentUser);
                    this.showMiningInterface();
                } else {
                    this.showLoginPrompt();
                }
            } catch (error) {
                console.error('❌ Error verificando sesión:', error);
                localStorage.removeItem('rsc_user_session');
                this.showLoginPrompt();
            }
        } else {
            this.showLoginPrompt();
        }
    }

    showLoginPrompt() {
        console.log('🔒 Usuario no autenticado, mostrando prompt de login');
        
        // Ocultar interfaz de minería
        this.hideMiningInterface();
        
        // Mostrar prompt de login
        this.createLoginPrompt();
    }

    showMiningInterface() {
        console.log('🚀 Usuario autenticado, mostrando interfaz de minería');
        
        // Ocultar prompt de login si existe
        const loginPrompt = document.querySelector('.login-prompt');
        if (loginPrompt) {
            loginPrompt.remove();
        }
        
        // Mostrar interfaz de minería
        const miningInterface = document.querySelector('.mining-epic');
        if (miningInterface) {
            miningInterface.style.display = 'block';
        }
        
        // Mostrar información del usuario
        this.showUserInfo();
    }

    hideMiningInterface() {
        const miningInterface = document.querySelector('.mining-epic');
        if (miningInterface) {
            miningInterface.style.display = 'none';
        }
    }

    createLoginPrompt() {
        // Remover prompt existente si hay uno
        const existingPrompt = document.querySelector('.login-prompt');
        if (existingPrompt) {
            existingPrompt.remove();
        }

        const loginPrompt = document.createElement('div');
        loginPrompt.className = 'login-prompt';
        loginPrompt.innerHTML = `
            <div class="login-prompt-content">
                <div class="login-prompt-header">
                    <h2>🔒 Acceso Requerido</h2>
                    <p>Para acceder al sistema de minería RSC, debes crear una cuenta</p>
                </div>
                
                <div class="login-prompt-options">
                    <div class="login-option">
                        <h3>📝 Crear Cuenta</h3>
                        <p>Crea tu cuenta con nombre de usuario y email</p>
                        <button class="btn-connect-wallet" onclick="window.location.href='login.html'">
                            Crear Cuenta
                        </button>
                    </div>
                    
                    <div class="login-option">
                        <h3>🎮 Modo Demo</h3>
                        <p>Prueba el sistema sin crear cuenta</p>
                        <button class="btn-demo-mode" onclick="window.authChecker.enableDemoMode()">
                            Activar Demo
                        </button>
                    </div>
                </div>
                
                <div class="login-prompt-info">
                    <h4>¿Por qué necesito una cuenta?</h4>
                    <ul>
                        <li>🔐 <strong>Seguridad:</strong> Tu información está protegida</li>
                        <li>📊 <strong>Rastreo:</strong> Podemos rastrear tus tokens minados</li>
                        <li>🎯 <strong>Migración:</strong> Los tokens se migrarán a mainnet</li>
                        <li>🏆 <strong>Progreso:</strong> Mantenemos tu progreso y nivel</li>
                        <li>💎 <strong>RSC:</strong> Moneda independiente - no necesitas wallet externa</li>
                    </ul>
                </div>
            </div>
        `;

        // Insertar después del navbar
        const navbar = document.querySelector('.navbar');
        if (navbar) {
            navbar.parentNode.insertBefore(loginPrompt, navbar.nextSibling);
        }

        // Agregar estilos
        this.addLoginPromptStyles();
    }

    addLoginPromptStyles() {
        if (document.getElementById('login-prompt-styles')) return;

        const styles = `
            <style id="login-prompt-styles">
                .login-prompt {
                    min-height: calc(100vh - 80px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 2rem;
                    background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%);
                }
                
                .login-prompt-content {
                    background: rgba(0, 0, 0, 0.8);
                    border: 2px solid rgba(255, 255, 255, 0.1);
                    border-radius: 1.5rem;
                    padding: 3rem;
                    max-width: 800px;
                    width: 100%;
                    backdrop-filter: blur(20px);
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
                }
                
                .login-prompt-header {
                    text-align: center;
                    margin-bottom: 3rem;
                }
                
                .login-prompt-header h2 {
                    font-size: 2.5rem;
                    font-weight: 800;
                    background: linear-gradient(45deg, #f59e0b, #d97706);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    margin-bottom: 1rem;
                }
                
                .login-prompt-header p {
                    color: rgba(255, 255, 255, 0.8);
                    font-size: 1.2rem;
                }
                
                .login-prompt-options {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 2rem;
                    margin-bottom: 3rem;
                }
                
                .login-option {
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 1rem;
                    padding: 2rem;
                    text-align: center;
                    transition: all 0.3s ease;
                }
                
                .login-option:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
                    border-color: #f59e0b;
                }
                
                .login-option h3 {
                    color: #f59e0b;
                    font-size: 1.3rem;
                    font-weight: 700;
                    margin-bottom: 1rem;
                }
                
                .login-option p {
                    color: rgba(255, 255, 255, 0.8);
                    margin-bottom: 1.5rem;
                    line-height: 1.6;
                }
                
                .btn-connect-wallet,
                .btn-email-login,
                .btn-demo-mode {
                    padding: 1rem 2rem;
                    border: none;
                    border-radius: 0.75rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    width: 100%;
                }
                
                .btn-connect-wallet {
                    background: linear-gradient(135deg, #10b981, #059669);
                    color: white;
                }
                
                .btn-email-login {
                    background: linear-gradient(135deg, #6366f1, #8b5cf6);
                    color: white;
                }
                
                .btn-demo-mode {
                    background: linear-gradient(135deg, #f59e0b, #d97706);
                    color: white;
                }
                
                .btn-connect-wallet:hover,
                .btn-email-login:hover,
                .btn-demo-mode:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
                }
                
                .login-prompt-info {
                    background: rgba(16, 185, 129, 0.1);
                    border: 1px solid rgba(16, 185, 129, 0.3);
                    border-radius: 1rem;
                    padding: 2rem;
                }
                
                .login-prompt-info h4 {
                    color: #10b981;
                    font-size: 1.2rem;
                    font-weight: 700;
                    margin-bottom: 1rem;
                    text-align: center;
                }
                
                .login-prompt-info ul {
                    list-style: none;
                    padding: 0;
                }
                
                .login-prompt-info li {
                    color: rgba(255, 255, 255, 0.8);
                    margin: 0.75rem 0;
                    font-size: 1rem;
                    line-height: 1.6;
                }
                
                @media (max-width: 768px) {
                    .login-prompt {
                        padding: 1rem;
                    }
                    
                    .login-prompt-content {
                        padding: 2rem;
                    }
                    
                    .login-prompt-options {
                        grid-template-columns: 1fr;
                    }
                }
            </style>
        `;

        document.head.insertAdjacentHTML('beforeend', styles);
    }

    enableDemoMode() {
        console.log('🎮 Activando modo demo');
        
        // Crear usuario demo
        const demoUser = {
            id: 'demo_' + Date.now(),
            walletAddress: '0x' + '1234567890abcdef'.repeat(4),
            walletType: 'demo',
            email: null,
            username: 'DemoUser',
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
            walletType: 'demo',
            loginTime: new Date().toISOString(),
            isDemo: true
        }));

        this.isAuthenticated = true;
        this.currentUser = demoUser;

        showNotification('success', 'Modo Demo Activado', 'Puedes probar el sistema de minería');
        
        // Mostrar interfaz de minería
        this.showMiningInterface();
    }

    showUserInfo() {
        if (!this.currentUser) return;

        // Crear indicador de usuario en el navbar
        this.createUserIndicator();
        
        // Mostrar información del usuario en la página
        this.updateUserDisplay();
    }

    createUserIndicator() {
        // Remover indicador existente si hay uno
        const existingIndicator = document.querySelector('.user-indicator');
        if (existingIndicator) {
            existingIndicator.remove();
        }

        const userIndicator = document.createElement('div');
        userIndicator.className = 'user-indicator';
        userIndicator.innerHTML = `
            <div class="user-info">
                <span class="user-avatar">👤</span>
                <span class="user-name">${this.currentUser.username}</span>
                <span class="user-wallet">${this.currentUser.walletAddress ? this.currentUser.walletAddress.substr(0, 6) + '...' + this.currentUser.walletAddress.substr(-4) : 'Demo'}</span>
            </div>
            <button class="btn-logout" onclick="window.authChecker.logout()">
                <span>🚪</span>
            </button>
        `;

        // Insertar en navbar actions
        const navbarActions = document.querySelector('.navbar-actions');
        if (navbarActions) {
            navbarActions.insertBefore(userIndicator, navbarActions.firstChild);
        }

        // Agregar estilos
        this.addUserIndicatorStyles();
    }

    addUserIndicatorStyles() {
        if (document.getElementById('user-indicator-styles')) return;

        const styles = `
            <style id="user-indicator-styles">
                .user-indicator {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    background: rgba(255, 255, 255, 0.1);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    border-radius: 2rem;
                    padding: 0.5rem 1rem;
                    margin-right: 1rem;
                }
                
                .user-info {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 0.25rem;
                }
                
                .user-avatar {
                    font-size: 1.2rem;
                }
                
                .user-name {
                    color: #f59e0b;
                    font-weight: 600;
                    font-size: 0.8rem;
                }
                
                .user-wallet {
                    color: rgba(255, 255, 255, 0.7);
                    font-size: 0.7rem;
                    font-family: monospace;
                }
                
                .btn-logout {
                    background: rgba(239, 68, 68, 0.2);
                    border: 1px solid rgba(239, 68, 68, 0.3);
                    border-radius: 50%;
                    width: 32px;
                    height: 32px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }
                
                .btn-logout:hover {
                    background: rgba(239, 68, 68, 0.3);
                    border-color: rgba(239, 68, 68, 0.5);
                }
                
                @media (max-width: 768px) {
                    .user-indicator {
                        margin-right: 0.5rem;
                        padding: 0.25rem 0.5rem;
                    }
                    
                    .user-name,
                    .user-wallet {
                        display: none;
                    }
                }
            </style>
        `;

        document.head.insertAdjacentHTML('beforeend', styles);
    }

    updateUserDisplay() {
        // Actualizar información del usuario en la página de minería
        const userElements = document.querySelectorAll('[data-user-info]');
        
        userElements.forEach(element => {
            const infoType = element.dataset.userInfo;
            
            switch (infoType) {
                case 'username':
                    element.textContent = this.currentUser.username;
                    break;
                case 'wallet':
                    element.textContent = this.currentUser.walletAddress || 'Demo Wallet';
                    break;
                case 'registration':
                    element.textContent = new Date(this.currentUser.registrationDate).toLocaleDateString();
                    break;
            }
        });
    }

    logout() {
        console.log('🚪 Cerrando sesión');
        
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

// Inicializar verificador de autenticación
document.addEventListener('DOMContentLoaded', () => {
    window.authChecker = new AuthChecker();
});

// Exportar para uso global
window.AuthChecker = AuthChecker;
