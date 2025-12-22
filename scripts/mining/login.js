// ===== MINING PLATFORM LOGIN =====

(function() {
    'use strict';
    
    let currentTab = 'login';
    
    // Initialize immediately if DOM is ready, otherwise wait
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            initializeLogin();
            setupEventListeners();
            checkExistingSession();
        });
    } else {
        // DOM already loaded
        initializeLogin();
        setupEventListeners();
        checkExistingSession();
    }
    
    function initializeLogin() {
        console.log('🔐 Initializing Mining Platform Login...');
        
        // Check if user is already logged in
        if (window.supabaseIntegration && window.supabaseIntegration.user?.isAuthenticated) {
            redirectToDashboard();
            return;
        }
    }
    
    function setupEventListeners() {
        // Tab switching
        const tabs = document.querySelectorAll('.login-tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                const targetTab = this.getAttribute('data-tab');
                switchTab(targetTab);
            });
        });
        
        // Password toggles
        const toggleLoginPassword = document.getElementById('toggleLoginPassword');
        const toggleRegisterPassword = document.getElementById('toggleRegisterPassword');
        
        if (toggleLoginPassword) {
            toggleLoginPassword.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                togglePasswordVisibility('loginPassword', toggleLoginPassword);
            });
        }
        
        if (toggleRegisterPassword) {
            toggleRegisterPassword.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                togglePasswordVisibility('registerPassword', toggleRegisterPassword);
            });
        }
        
        // Login form
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', handleLogin);
        }
        
        // Register form
        const registerForm = document.getElementById('registerForm');
        if (registerForm) {
            registerForm.addEventListener('submit', handleRegister);
        }
    }
    
    function switchTab(tab) {
        currentTab = tab;
        
        // Update tab buttons
        document.querySelectorAll('.login-tab').forEach(t => {
            t.classList.toggle('active', t.getAttribute('data-tab') === tab);
        });
        
        // Update form containers
        document.getElementById('loginFormContainer').classList.toggle('active', tab === 'login');
        document.getElementById('registerFormContainer').classList.toggle('active', tab === 'register');
    }
    
    function togglePasswordVisibility(inputId, button) {
        const input = document.getElementById(inputId);
        const icon = button.querySelector('i');
        
        if (input.type === 'password') {
            input.type = 'text';
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
        } else {
            input.type = 'password';
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
        }
    }
    
    async function handleLogin(e) {
        e.preventDefault();
        
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        const rememberMe = document.getElementById('rememberMe').checked;
        const submitBtn = document.getElementById('loginSubmitBtn');
        
        if (!email || !password) {
            window.miningNotifications?.error('Por favor completa todos los campos');
            return;
        }
        
        // Disable button
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Iniciando sesión...</span>';
        
        try {
            // Wait for Supabase Integration to be ready
            await waitForSupabase();
            
            // Login with Supabase
            const result = await window.supabaseIntegration.loginUser(email, password);
            
            if (result) {
                // También hacer login con el backend para obtener token JWT
                try {
                    await loginWithBackend(email, password);
                    
                    // Después del login exitoso, cargar y guardar el perfil del usuario inmediatamente
                    if (window.miningBackendAPI && window.miningBackendAPI.isAuthenticated()) {
                        try {
                            const profileResponse = await window.miningBackendAPI.getProfile();
                            if (profileResponse.success && profileResponse.data?.user) {
                                const user = profileResponse.data.user;
                                // Guardar datos del usuario en localStorage para persistencia
                                const userData = {
                                    username: user.username,
                                    email: user.email,
                                    balance: parseFloat(user.balance || 0),
                                    lastUpdated: new Date().toISOString()
                                };
                                localStorage.setItem('mining_user_profile', JSON.stringify(userData));
                                console.log('✅ Perfil del usuario guardado después del login:', userData);
                            }
                        } catch (profileError) {
                            console.warn('Error cargando perfil después del login:', profileError);
                        }
                    }
                } catch (backendError) {
                    console.warn('Error haciendo login con backend (continuando con Supabase):', backendError);
                    // Continuar aunque falle el login del backend
                }
                
                // Save remember me preference
                if (rememberMe) {
                    localStorage.setItem('rememberMe', 'true');
                }
                
                window.miningNotifications?.success('¡Inicio de sesión exitoso!');
                
                // Redirect to dashboard after short delay
                setTimeout(() => {
                    redirectToDashboard();
                }, 1000);
            } else {
                throw new Error('Credenciales inválidas');
            }
        } catch (error) {
            console.error('Login error:', error);
            window.miningNotifications?.error(error.message || 'Error al iniciar sesión. Verifica tus credenciales.');
        } finally {
            // Re-enable button
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<span>Iniciar Sesión</span> <i class="fas fa-arrow-right"></i>';
        }
    }
    
    async function handleRegister(e) {
        e.preventDefault();
        
        const email = document.getElementById('registerEmail').value;
        const username = document.getElementById('registerUsername').value;
        const password = document.getElementById('registerPassword').value;
        const referralCode = document.getElementById('registerReferralCode').value || null;
        const acceptTerms = document.getElementById('acceptTerms').checked;
        const submitBtn = document.getElementById('registerSubmitBtn');
        
        if (!email || !username || !password) {
            window.miningNotifications?.error('Por favor completa todos los campos requeridos');
            return;
        }
        
        if (password.length < 8) {
            window.miningNotifications?.error('La contraseña debe tener al menos 8 caracteres');
            return;
        }
        
        if (!acceptTerms) {
            window.miningNotifications?.error('Debes aceptar los términos y condiciones');
            return;
        }
        
        // Disable button
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Creando cuenta...</span>';
        
        try {
            // Wait for Supabase Integration to be ready
            await waitForSupabase();
            
            // Register with Supabase
            const result = await window.supabaseIntegration.registerUser(email, username, password, referralCode);
            
            if (result) {
                window.miningNotifications?.success('¡Cuenta creada exitosamente!');
                
                // Auto-login after registration
                setTimeout(async () => {
                    await window.supabaseIntegration.loginUser(email, password);
                    redirectToDashboard();
                }, 1000);
            } else {
                throw new Error('Error al crear la cuenta');
            }
        } catch (error) {
            console.error('Register error:', error);
            window.miningNotifications?.error(error.message || 'Error al crear la cuenta. Intenta de nuevo.');
        } finally {
            // Re-enable button
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<span>Crear Cuenta</span> <i class="fas fa-arrow-right"></i>';
        }
    }
    
    function waitForSupabase() {
        return new Promise((resolve, reject) => {
            if (window.supabaseIntegration) {
                resolve();
                return;
            }
            
            let attempts = 0;
            const maxAttempts = 50;
            
            const checkInterval = setInterval(() => {
                attempts++;
                if (window.supabaseIntegration) {
                    clearInterval(checkInterval);
                    resolve();
                } else if (attempts >= maxAttempts) {
                    clearInterval(checkInterval);
                    reject(new Error('Supabase Integration no disponible'));
                }
            }, 100);
        });
    }
    
    async function loginWithBackend(email, password) {
        try {
            // Detectar URL del backend
            const currentHost = window.location.hostname;
            const baseURL = (currentHost === 'localhost' || currentHost === '127.0.0.1')
                ? (window.BACKEND_API_URL || 'http://localhost:4000')
                : (window.BACKEND_API_URL || `${window.location.protocol}//${currentHost}${window.location.port ? ':' + window.location.port : ''}`);
            
            const response = await fetch(`${baseURL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });
            
            if (response.ok) {
                const data = await response.json();
                if (data.success && data.data?.token) {
                    // Guardar token para miningBackendAPI
                    localStorage.setItem('mining_auth_token', data.data.token);
                    
                    // Si miningBackendAPI ya está inicializado, actualizar su token
                    if (window.miningBackendAPI) {
                        window.miningBackendAPI.saveToken(data.data.token);
                    }
                    
                    console.log('✅ Token del backend guardado correctamente');
                    return true;
                }
            }
            
            throw new Error('Error en login del backend');
        } catch (error) {
            console.error('Error haciendo login con backend:', error);
            throw error;
        }
    }
    
    function checkExistingSession() {
        // Check if user is already logged in
        if (window.supabaseIntegration) {
            if (window.supabaseIntegration.user?.isAuthenticated) {
                redirectToDashboard();
            } else {
                // Try to load stored user
                window.supabaseIntegration.loadStoredUser().then(() => {
                    if (window.supabaseIntegration.user?.isAuthenticated) {
                        redirectToDashboard();
                    }
                });
            }
        }
    }
    
    function redirectToDashboard() {
        // Get return URL from query params or default to dashboard
        const urlParams = new URLSearchParams(window.location.search);
        let returnUrl = urlParams.get('return') || 'dashboard.html';
        
        // Ensure .html extension if not present
        if (!returnUrl.endsWith('.html')) {
            returnUrl += '.html';
        }
        
        window.location.href = returnUrl;
    }
    
    console.log('✅ Login page initialized');
})();

