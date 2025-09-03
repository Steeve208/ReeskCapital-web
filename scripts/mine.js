// RSC Mining Platform - Sistema de Minería Simulada Off-Chain
class RSCMiningPlatform {
    constructor() {
        // Configuración de Supabase
        this.supabaseUrl = 'https://your-project.supabase.co'; // Reemplazar con tu URL
        this.supabaseKey = 'your-anon-key'; // Reemplazar con tu anon key
        
        // Estado de la aplicación
        this.state = {
            isAuthenticated: false,
            currentUser: null,
            isMining: false,
            miningStartTime: null,
            sessionTokens: 0,
            totalMined: 0.001, // Saldo inicial mínimo
            totalTime: 0,
            sessionsToday: 0,
            dailyLimit: 0,
            theme: 'light',
            // Nuevos estados para minería 24/7
            miningSessionStart: null,
            miningSessionEnd: null,
            currentMiningRate: 0.0001,
            lastTokenUpdate: null,
            sessionStatus: 'inactive', // 'inactive', 'active', 'completed'
            // Nuevos estados para cooldown y bloqueo
            lastClaimTime: null,
            claimCooldown: 30 * 60 * 1000, // 30 minutos en milisegundos
            pendingTokens: 0 // Tokens no reclamados de sesión anterior
        };
        
        // Configuración de minería 24/7
        this.config = {
            tokensPerMinute: 0.0001, // 0.0001 tokens por minuto (base)
            dailyLimit: 2, // 2 RSC máximo por día
            updateInterval: 1000, // Actualizar cada segundo
            sessionDuration: 24 * 60 * 60 * 1000, // 24 horas en milisegundos
            baseRate: 0.0001 // Tasa base de tokens por minuto
        };
        
        // Elementos DOM
        this.elements = {};
        
        // Timers
        this.updateTimer = null;
        this.sessionTimer = null;
        
        // Inicializar
        this.init();
    }
    
    async init() {
        try {
            // Inicializar Supabase
            await this.initializeSupabase();
            
            // Configurar DOM
            this.setupDOM();
            
            // Configurar event listeners
            this.setupEventListeners();
            
            // Cargar datos persistentes
            this.loadPersistedData();
            
            // Verificar autenticación
            await this.checkAuthentication();
            
            // Iniciar loop de actualización
            this.startUpdateLoop();
            
            console.log('RSC Mining Platform inicializado correctamente');
        } catch (error) {
            console.error('Error al inicializar:', error);
            this.showNotification('Error al inicializar la plataforma', 'error');
        }
    }
    
    async initializeSupabase() {
        try {
            console.log('🔧 Inicializando Supabase...');
            
            // Usar la función simplificada
            if (typeof createSupabaseClient === 'function') {
                this.supabase = createSupabaseClient();
                if (this.supabase) {
                    console.log('✅ Supabase inicializado correctamente');
                    return this.supabase;
                } else {
                    throw new Error('No se pudo crear cliente Supabase');
                }
            } else {
                throw new Error('Función createSupabaseClient no disponible');
            }
            
        } catch (error) {
            console.error('❌ Error al inicializar Supabase:', error.message);
            console.warn('⚠️ Continuando en modo local...');
            this.supabase = null;
        }
    }
    
    setupDOM() {
        // Elementos de autenticación
        this.elements.authSection = document.getElementById('authSection');
        this.elements.miningInterface = document.getElementById('miningInterface');
        this.elements.loginForm = document.getElementById('loginForm');
        this.elements.registerForm = document.getElementById('registerForm');
        this.elements.authTabs = document.querySelectorAll('.auth-tab');
        
        // Elementos de usuario
        this.elements.userInfo = document.getElementById('userInfo');
        this.elements.userUsername = document.getElementById('userUsername');
        this.elements.logoutBtn = document.getElementById('logoutBtn');
        
        // Elementos de minería
        this.elements.startMining = document.getElementById('startMining');
        this.elements.claimRewards = document.getElementById('claimRewards');
        
        // Elementos de estado
        this.elements.hashRate = document.getElementById('hashRate');
        this.elements.intensity = document.getElementById('intensity');
        this.elements.efficiency = document.getElementById('efficiency');
        this.elements.sessionTime = document.getElementById('sessionTime');
        this.elements.progressFill = document.getElementById('progressFill');
        this.elements.tokensEarned = document.getElementById('tokensEarned');
        this.elements.activeTime = document.getElementById('activeTime');
        this.elements.statusIndicator = document.getElementById('statusIndicator');
        
        // Elementos de estadísticas
        this.elements.userBalance = document.getElementById('userBalance');
        this.elements.dailyLimit = document.getElementById('dailyLimit');
        this.elements.totalMined = document.getElementById('totalMined');
        this.elements.totalTime = document.getElementById('totalTime');
        this.elements.sessionsToday = document.getElementById('sessionsToday');
        this.elements.userRanking = document.getElementById('userRanking');
        
        // Elementos del sidebar (ahora en la parte inferior)
        this.elements.sidebarUsername = document.getElementById('sidebarUsername');
        this.elements.sidebarEmail = document.getElementById('sidebarEmail');
        this.elements.sidebarBalance = document.getElementById('sidebarBalance');
        this.elements.sidebarSessionsToday = document.getElementById('sidebarSessionsToday');
        this.elements.lastMining = document.getElementById('lastMining');
        this.elements.networkDifficulty = document.getElementById('networkDifficulty');
        this.elements.networkBlocks = document.getElementById('networkBlocks');
        
        // Elementos de historial
        this.elements.miningHistory = document.getElementById('miningHistory');
        
        // Elementos de navegación
        this.elements.hamburgerMenu = document.getElementById('hamburgerMenu');
        this.elements.mobileNav = document.getElementById('mobileNav');
        this.elements.themeToggle = document.getElementById('themeToggle');
        this.elements.settingsBtn = document.getElementById('settingsBtn');
        
        // Elementos de modales
        this.elements.modalOverlay = document.getElementById('modalOverlay');
        this.elements.mainnetModal = document.getElementById('mainnetModal');
        this.elements.mainnetModalClose = document.getElementById('mainnetModalClose');
        this.elements.settingsModal = document.getElementById('settingsModal');
        this.elements.settingsModalClose = document.getElementById('settingsModalClose');
        this.elements.refreshStatsBtn = document.getElementById('refreshStatsBtn');
        this.elements.exportDataBtn = document.getElementById('exportDataBtn');
        this.elements.backupDataBtn = document.getElementById('backupDataBtn');
        
        // Contenedor de notificaciones
        this.elements.notificationContainer = document.getElementById('notificationContainer');
        
        // Log de depuración para identificar elementos faltantes
        console.log('🔍 Elementos DOM cargados:', {
            startMining: !!this.elements.startMining,
            claimRewards: !!this.elements.claimRewards,
            userBalance: !!this.elements.userBalance,
            tokensEarned: !!this.elements.tokensEarned,
            statusIndicator: !!this.elements.statusIndicator
        });
    }
    
    setupEventListeners() {
        // Tabs de autenticación
        this.elements.authTabs.forEach(tab => {
            tab.addEventListener('click', () => this.switchAuthTab(tab.dataset.tab));
        });
        
        // Formularios de autenticación
        this.elements.loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        this.elements.registerForm.addEventListener('submit', (e) => this.handleRegister(e));
        
        // Botones de minería
        this.elements.startMining.addEventListener('click', () => this.startMining());
        this.elements.claimRewards.addEventListener('click', () => this.claimRewards());
        
        // Botones de navegación
        this.elements.logoutBtn.addEventListener('click', () => this.logout());
        this.elements.hamburgerMenu.addEventListener('click', () => this.toggleMobileMenu());
        this.elements.themeToggle.addEventListener('click', () => this.toggleTheme());
        
        // Botón de ajustes
        if (this.elements.settingsBtn) {
            this.elements.settingsBtn.addEventListener('click', () => this.openSettingsModal());
        }
        
        // Botón de ajustes móvil
        const settingsMobileBtn = document.getElementById('settingsMobileBtn');
        if (settingsMobileBtn) {
            settingsMobileBtn.addEventListener('click', () => {
                this.openSettingsModal();
                this.toggleMobileMenu(); // Cerrar menú móvil
            });
        }
        
        // Botones del sidebar
        const sidebarSettingsBtn = document.getElementById('sidebarSettingsBtn');
        if (sidebarSettingsBtn) {
            sidebarSettingsBtn.addEventListener('click', () => this.openSettingsModal());
        }
        
        const sidebarMainnetBtn = document.getElementById('sidebarMainnetBtn');
        if (sidebarMainnetBtn) {
            sidebarMainnetBtn.addEventListener('click', () => this.showMainnetModal());
        }
        
        // Cerrar modales
        this.elements.modalOverlay.addEventListener('click', () => this.hideAllModals());
        this.elements.mainnetModalClose.addEventListener('click', () => this.hideMainnetModal());
        
        // Cerrar modal de ajustes
        if (this.elements.settingsModalClose) {
            this.elements.settingsModalClose.addEventListener('click', () => this.closeSettingsModal());
        }
        
        // Eventos de teclado
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideAllModals();
            }
        });
        
        // Botones de acción del modal de ajustes
        if (this.elements.refreshStatsBtn) {
            this.elements.refreshStatsBtn.addEventListener('click', () => this.refreshStats());
        }
        
        if (this.elements.exportDataBtn) {
            this.elements.exportDataBtn.addEventListener('click', () => this.exportData());
        }
        
        if (this.elements.backupDataBtn) {
            this.elements.backupDataBtn.addEventListener('click', () => this.backupData());
        }
    }
    
    async checkAuthentication() {
        try {
            // Verificar sesión en Supabase
            if (this.supabase) {
                const { data: { session } } = await this.supabase.auth.getSession();
                if (session) {
                    await this.loadUserData(session.user.email);
                    return;
                }
            }
            
            // Verificar sesión local
            const savedEmail = localStorage.getItem('rsc_user_email');
            if (savedEmail) {
                await this.loadUserData(savedEmail);
                return;
            }
            
            // No autenticado
            this.showAuthSection();
        } catch (error) {
            console.error('Error al verificar autenticación:', error);
            this.showAuthSection();
        }
    }
    
    async loadUserData(email) {
        try {
            console.log('🚀 Iniciando carga de datos para usuario:', email);
            
            // Validar que el email sea válido
            if (!email || !email.includes('@')) {
                throw new Error('Email inválido');
            }
            
            let userData = null;
            
            // Intentar cargar desde Supabase
            if (this.supabase && typeof getUserByEmailFromSupabase === 'function') {
                try {
                    console.log('🔍 Intentando cargar desde Supabase...');
                    userData = await getUserByEmailFromSupabase(email);
                    
                    if (userData) {
                        console.log('📊 Usuario encontrado en Supabase:', userData);
                        console.log('💰 Balance del usuario:', userData.balance);
                        console.log('👤 Username del usuario:', userData.username);
                    } else {
                        console.log('⚠️ Usuario no encontrado en Supabase');
                    }
                } catch (error) {
                    console.warn('⚠️ Error al cargar desde Supabase:', error.message);
                }
            } else {
                console.warn('⚠️ Supabase no disponible o función getUserByEmailFromSupabase no encontrada');
            }
            
            // Si no hay datos en Supabase, crear usuario nuevo
            if (!userData) {
                console.log('➕ Creando nuevo usuario...');
                
                // Intentar crear en Supabase
                if (this.supabase && typeof createUserInSupabase === 'function') {
                    try {
                        // Obtener username del formulario si está disponible
                        const usernameInput = document.getElementById('registerUsername');
                        const username = usernameInput ? usernameInput.value.trim() : `user_${Date.now()}`;
                        
                        console.log('🔧 Creando usuario en Supabase con username:', username);
                        userData = await createUserInSupabase(email, username);
                        console.log('✅ Usuario creado en Supabase:', email);
                    } catch (error) {
                        console.warn('⚠️ No se pudo crear en Supabase:', error.message);
                        console.log('📱 Continuando con almacenamiento local...');
                        
                        // Crear usuario local como respaldo
                        userData = {
                            email: email,
                            username: username || `user_${Date.now()}`,
                            balance: 0,
                            last_mine_at: null
                        };
                    }
                } else {
                    console.log('📱 Modo local: creando usuario local');
                    // Crear usuario local
                    userData = {
                        email: email,
                        username: `user_${Date.now()}`,
                        balance: 0,
                        last_mine_at: null
                    };
                }
                
                // Guardar en localStorage como respaldo
                localStorage.setItem('rsc_user_email', email);
                localStorage.setItem('rsc_user_data', JSON.stringify(userData));
                console.log('💾 Usuario guardado en localStorage');
            }
            
            // Actualizar estado
            console.log('🔄 Actualizando estado de la aplicación...');
            this.state.currentUser = userData;
            this.state.isAuthenticated = true;
            this.state.totalMined = userData.balance || 0;
            
            console.log('📊 Estado actualizado:', {
                isAuthenticated: this.state.isAuthenticated,
                currentUser: this.state.currentUser,
                totalMined: this.state.totalMined
            });
            
            // Actualizar UI
            console.log('🎨 Actualizando interfaz de usuario...');
            this.showMiningInterface();
            this.updateUserDisplay();
            this.loadMiningHistory();
            
            console.log('✅ Usuario cargado correctamente:', userData);
        } catch (error) {
            console.error('❌ Error al cargar datos del usuario:', error);
            this.showNotification('Error al cargar datos del usuario: ' + error.message, 'error');
        }
    }
    
    async handleLogin(e) {
        e.preventDefault();
        
        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value;
        
        // Validar email
        if (!email || !email.includes('@')) {
            this.showNotification('Por favor, ingresa un email válido', 'error');
            return;
        }
        
        // Validar contraseña
        if (!password || password.length < 3) {
            this.showNotification('La contraseña debe tener al menos 3 caracteres', 'error');
            return;
        }
        
        try {
            // Mostrar indicador de carga
            const loginBtn = e.target.querySelector('button[type="submit"]');
            const originalText = loginBtn.innerHTML;
            loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Iniciando...';
            loginBtn.disabled = true;
            
            // Login seguro con verificación de contraseña
            if (window.SecureAuth && typeof window.SecureAuth.authenticateUser === 'function') {
                try {
                    console.log('🔐 Autenticando usuario con contraseña...');
                    const authResult = await window.SecureAuth.authenticateUser(email, password);
                    
                    if (authResult.success) {
                        console.log('✅ Autenticación exitosa:', authResult.user);
                        
                        // Cargar datos del usuario autenticado
                        await this.loadUserData(email);
                        this.showNotification('Sesión iniciada correctamente', 'success');
                    } else {
                        console.log('❌ Autenticación fallida:', authResult.error);
                        this.showNotification(authResult.error, 'error');
                        return;
                    }
                } catch (error) {
                    console.warn('⚠️ Error con autenticación segura:', error.message);
                    this.showNotification('Error de autenticación: ' + error.message, 'error');
                    return;
                }
            } else if (this.supabase && typeof getUserByEmailFromSupabase === 'function') {
                // Fallback al sistema anterior (solo para compatibilidad)
                console.log('⚠️ Sistema seguro no disponible, usando fallback...');
                try {
                    const userData = await getUserByEmailFromSupabase(email);
                    
                    if (userData) {
                        await this.loadUserData(email);
                        this.showNotification('Sesión iniciada (modo compatibilidad)', 'warning');
                    } else {
                        this.showNotification('Usuario no encontrado. Regístrate primero.', 'error');
                        return;
                    }
                } catch (error) {
                    console.warn('⚠️ Error con fallback:', error.message);
                    this.showNotification('Error al iniciar sesión: ' + error.message, 'error');
                    return;
                }
            } else {
                // Modo local (simulado)
                console.log('📱 Modo local: iniciando sesión con email:', email);
                await this.loadUserData(email);
                this.showNotification('Sesión iniciada (modo local)', 'success');
            }
            
            // Limpiar formulario
            e.target.reset();
            
        } catch (error) {
            console.error('❌ Error en login:', error);
            this.showNotification('Error al iniciar sesión: ' + error.message, 'error');
        } finally {
            // Restaurar botón
            const loginBtn = e.target.querySelector('button[type="submit"]');
            loginBtn.innerHTML = originalText;
            loginBtn.disabled = false;
        }
    }
    
    async handleRegister(e) {
        e.preventDefault();
        
        const username = document.getElementById('registerUsername').value.trim();
        const email = document.getElementById('registerEmail').value.trim();
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        // Validar username
        if (!username || username.length < 3) {
            this.showNotification('El nombre de usuario debe tener al menos 3 caracteres', 'error');
            return;
        }
        
        if (username.length > 20) {
            this.showNotification('El nombre de usuario no puede tener más de 20 caracteres', 'error');
            return;
        }
        
        // Validar email
        if (!email || !email.includes('@')) {
            this.showNotification('Por favor, ingresa un email válido', 'error');
            return;
        }
        
        // Validar contraseña
        if (!password || password.length < 6) {
            this.showNotification('La contraseña debe tener al menos 6 caracteres', 'error');
            return;
        }
        
        // Validar confirmación
        if (password !== confirmPassword) {
            this.showNotification('Las contraseñas no coinciden', 'error');
            return;
        }
        
        try {
            // Mostrar indicador de carga
            const registerBtn = e.target.querySelector('button[type="submit"]');
            const originalText = registerBtn.innerHTML;
            registerBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Registrando...';
            registerBtn.disabled = true;
            
            // Registro seguro con contraseña hasheada
            if (window.SecureAuth && typeof window.SecureAuth.createSecureUser === 'function') {
                try {
                    console.log('🔐 Registrando usuario seguro...');
                    
                    // Verificar si el email ya existe
                    const emailExists = await window.SecureAuth.checkEmailExists(email);
                    if (emailExists) {
                        this.showNotification('Este email ya está registrado. Usa otro email o inicia sesión.', 'error');
                        return;
                    }
                    
                    // Crear usuario seguro
                    const userData = await window.SecureAuth.createSecureUser(email, username, password);
                    console.log('✅ Usuario creado exitosamente:', userData);
                    
                    // Cargar datos del usuario
                    await this.loadUserData(email);
                    this.showNotification('Usuario registrado correctamente', 'success');
                    
                } catch (error) {
                    console.warn('⚠️ Error con registro seguro:', error.message);
                    this.showNotification('Error al registrar: ' + error.message, 'error');
                    return;
                }
            } else if (this.supabase && typeof createUserInSupabase === 'function') {
                // Fallback al sistema anterior
                console.log('⚠️ Sistema seguro no disponible, usando fallback...');
                try {
                    await this.loadUserData(email);
                    this.showNotification('Usuario registrado (modo compatibilidad)', 'warning');
                } catch (error) {
                    console.warn('⚠️ Error con fallback:', error.message);
                    this.showNotification('Error al registrar: ' + error.message, 'error');
                    return;
                }
            } else {
                // Modo local (simulado)
                console.log('📱 Modo local: registrando usuario con email:', email);
                await this.loadUserData(email);
                this.showNotification('Usuario registrado (modo local)', 'success');
            }
            
            // Limpiar formulario
            e.target.reset();
            
        } catch (error) {
            console.error('❌ Error en registro:', error);
            this.showNotification('Error al registrar usuario: ' + error.message, 'error');
        } finally {
            // Restaurar botón
            const registerBtn = e.target.querySelector('button[type="submit"]');
            registerBtn.innerHTML = originalText;
            registerBtn.disabled = false;
        }
    }
    
    async logout() {
        try {
            // Detener minería si está activa
            if (this.state.isMining) {
                this.stopMining();
            }
            
            // Logout simplificado - no necesitamos auth.signOut()
            console.log('📤 Cerrando sesión...');
            
            // Limpiar estado local
            this.state.isAuthenticated = false;
            this.state.currentUser = null;
            this.state.isMining = false;
            this.state.totalMined = 0;
            this.state.dailyLimit = 0;
            this.state.sessionsToday = 0;
            
            // Limpiar localStorage completamente
            localStorage.removeItem('rsc_user_email');
            localStorage.removeItem('rsc_user_data');
            localStorage.removeItem('rsc_mining_data');
            localStorage.removeItem('rsc_mining_session');
            localStorage.removeItem('rsc_mining_history');
            
            // Mostrar sección de autenticación
            this.showAuthSection();
            
            // Limpiar formularios
            document.getElementById('loginForm').reset();
            document.getElementById('registerForm').reset();
            
            this.showNotification('Sesión cerrada correctamente', 'success');
            console.log('✅ Logout completado, datos limpiados');
        } catch (error) {
            console.error('❌ Error al cerrar sesión:', error);
            this.showNotification('Error al cerrar sesión', 'error');
        }
    }
    
    startMining() {
        if (!this.state.isAuthenticated) {
            this.showNotification('Debes iniciar sesión para minar', 'warning');
            return;
        }
        
        if (this.state.isMining) {
            this.showNotification('La minería ya está activa', 'warning');
            return;
        }
        
        // Verificar si hay tokens pendientes de reclamar
        if (this.state.pendingTokens > 0) {
            this.showNotification('Debes reclamar los tokens de tu sesión anterior antes de minar nuevamente', 'warning');
            return;
        }
        
        // Iniciar sesión de minería de 24 horas
        this.start24HourMiningSession();
        
        this.showNotification('Minería iniciada - 24 horas activas', 'success');
        console.log('Minería iniciada - Ciclo de 24 horas');
    }
    
    start24HourMiningSession() {
        const now = Date.now();
        const sessionEnd = now + this.config.sessionDuration; // 24 horas
        
        // Actualizar estado
        this.state.isMining = true;
        this.state.miningSessionStart = now;
        this.state.miningSessionEnd = sessionEnd;
        this.state.sessionStatus = 'active';
        this.state.sessionTokens = 0;
        
        // Guardar en localStorage para persistencia
        localStorage.setItem('rsc_mining_active', 'true');
        localStorage.setItem('rsc_mining_start', now.toString());
        localStorage.setItem('rsc_mining_end', sessionEnd.toString());
        
        // Iniciar minería automática
        this.startAutomaticMining();
        
        // Actualizar UI
        if (this.elements.startMining) {
            this.elements.startMining.disabled = true;
            this.elements.startMining.classList.add('loading');
        }
        
        // Guardar en Supabase
        this.saveMiningSessionToSupabase();
    }
    
    startAutomaticMining() {
        // Timer principal que corre cada segundo
        this.state.miningTimer = setInterval(() => {
            this.processMiningTick();
        }, 1000);
        
        // Timer de actualización de UI cada 5 segundos
        this.state.updateTimer = setInterval(() => {
            this.updateMiningInterface();
        }, 5000);
        
        console.log('⛏️ Minería automática iniciada - 24 horas activas');
    }
    
    processMiningTick() {
        const now = Date.now();
        
        // Verificar si la sesión ha terminado
        if (now >= this.state.miningSessionEnd) {
            this.completeMiningSession();
            return;
        }
        
        // Calcular tokens ganados en este tick
        const elapsedMinutes = (now - this.state.miningSessionStart) / (1000 * 60);
        const tokensEarned = elapsedMinutes * this.config.baseRate;
        
        // Actualizar saldo (SIEMPRE aumenta, nunca baja)
        const newBalance = this.state.totalMined + (tokensEarned * 0.000001); // Factor de conversión
        
        if (newBalance > this.state.totalMined) {
            this.state.totalMined = newBalance;
            this.state.sessionTokens = tokensEarned;
            
            // Guardar en localStorage
            localStorage.setItem('rsc_user_balance', newBalance.toString());
            
            // Actualizar Supabase cada 30 segundos
            if (!this.state.lastTokenUpdate || (now - this.state.lastTokenUpdate) > 30000) {
                this.updateBalanceInSupabase(newBalance);
                this.state.lastTokenUpdate = now;
            }
        }
    }
    
    stopMining() {
        if (!this.state.isMining) {
            return;
        }
        
        try {
            // Detener minería manualmente
            this.completeMiningSession();
            
            this.showNotification('Minería detenida manualmente', 'info');
            console.log('Minería detenida manualmente');
        } catch (error) {
            console.error('Error al detener minería:', error);
            this.showNotification('Error al detener minería', 'error');
        }
    }
    
    completeMiningSession() {
        // Detener timers
        if (this.state.miningTimer) {
            clearInterval(this.state.miningTimer);
            this.state.miningTimer = null;
        }
        
        if (this.state.updateTimer) {
            clearInterval(this.state.updateTimer);
            this.state.updateTimer = null;
        }
        
        // Calcular recompensas finales
        if (this.state.miningSessionStart && this.state.miningSessionEnd) {
            const now = Date.now();
            const endTime = Math.min(now, this.state.miningSessionEnd);
            const elapsedMinutes = (endTime - this.state.miningSessionStart) / (1000 * 60);
            const finalTokens = elapsedMinutes * this.config.baseRate;
            
            // Establecer tokens pendientes (deben ser reclamados antes de minar nuevamente)
            this.state.pendingTokens = finalTokens;
            this.state.sessionTokens = 0;
            
            // Guardar en localStorage
            localStorage.setItem('rsc_user_balance', this.state.totalMined.toString());
            localStorage.setItem('rsc_pending_tokens', finalTokens.toString());
            
            console.log(`💰 Sesión completada: ${finalTokens.toFixed(6)} tokens pendientes de reclamar`);
        }
        
        // Limpiar estado de sesión
        this.state.isMining = false;
        this.state.sessionStatus = 'completed';
        this.state.miningSessionStart = null;
        this.state.miningSessionEnd = null;
        
        // Limpiar localStorage
        localStorage.setItem('rsc_mining_active', 'false');
        localStorage.removeItem('rsc_mining_start');
        localStorage.removeItem('rsc_mining_end');
        
        // Actualizar UI
        if (this.elements.startMining) {
            this.elements.startMining.disabled = false;
            this.elements.startMining.classList.remove('loading');
        }
        
        // Guardar en Supabase
        this.updateBalanceInSupabase(this.state.totalMined);
        
        // Actualizar interfaz
        this.updateMiningInterface();
        this.updateUserDisplay();
        
        console.log('✅ Sesión de minería completada');
    }
    
    async claimRewards() {
        if (!this.state.isAuthenticated) {
            this.showNotification('Debes iniciar sesión para reclamar recompensas', 'warning');
            return;
        }
        
        // Verificar si hay tokens de sesión O tokens pendientes
        if (this.state.sessionTokens <= 0 && this.state.pendingTokens <= 0) {
            this.showNotification('No hay recompensas para reclamar', 'warning');
            return;
        }
        
        // Verificar cooldown de 30 minutos
        const now = Date.now();
        if (this.state.lastClaimTime && (now - this.state.lastClaimTime) < this.state.claimCooldown) {
            const remainingTime = Math.ceil((this.state.claimCooldown - (now - this.state.lastClaimTime)) / (1000 * 60));
            this.showNotification(`Debes esperar ${remainingTime} minutos antes de reclamar nuevamente`, 'warning');
            return;
        }
        
        try {
            let totalClaimed = 0;
            
            // Reclamar tokens de sesión actual si existen
            if (this.state.sessionTokens > 0) {
                totalClaimed += this.state.sessionTokens;
                this.state.totalMined += this.state.sessionTokens;
                this.state.dailyLimit += this.state.sessionTokens;
                this.state.sessionTokens = 0;
                console.log('✅ Tokens de sesión reclamados:', this.state.sessionTokens);
            }
            
            // Reclamar tokens pendientes si existen
            if (this.state.pendingTokens > 0) {
                totalClaimed += this.state.pendingTokens;
                this.state.totalMined += this.state.pendingTokens;
                this.state.dailyLimit += this.state.pendingTokens;
                this.state.pendingTokens = 0;
                localStorage.removeItem('rsc_pending_tokens');
                console.log('✅ Tokens pendientes reclamados:', this.state.pendingTokens);
            }
            
            this.state.lastClaimTime = now;
            
            // Actualizar en Supabase
            if (this.supabase && this.state.currentUser) {
                try {
                    await this.supabase
                        .from('users_balances')
                        .update({ 
                            balance: this.state.totalMined,
                            last_mine_at: new Date().toISOString()
                        })
                        .eq('email', this.state.currentUser.email);
                } catch (error) {
                    console.warn('No se pudo actualizar en Supabase:', error.message);
                }
            }
            
            // Guardar localmente
            this.saveMiningData();
            
            // Actualizar UI
            this.updateMiningStats();
            this.updateUserDisplay();
            
            this.showNotification(`Recompensas reclamadas: ${totalClaimed.toFixed(6)} RSC`, 'success');
            console.log('✅ Total reclamado:', totalClaimed.toFixed(6), 'RSC');
        } catch (error) {
            console.error('Error al reclamar recompensas:', error);
            this.showNotification('Error al reclamar recompensas', 'error');
        }
    }
    
    calculateSessionRewards() {
        if (!this.state.miningStartTime || !this.state.isMining) {
            return 0;
        }
        
        const sessionDuration = (Date.now() - this.state.miningStartTime) / 1000 / 60; // minutos
        const tokens = sessionDuration * this.config.tokensPerMinute;
        
        // Aplicar límite diario
        const remainingDaily = this.config.dailyLimit - this.state.dailyLimit;
        return Math.min(tokens, remainingDaily);
    }
    
    calculateHashRate() {
        if (!this.state.isMining) return 0;
        
        // Hash rate simulado basado en tiempo de sesión
        const sessionDuration = (Date.now() - this.state.miningStartTime) / 1000;
        return Math.floor(100 + (sessionDuration * 0.1));
    }
    
    calculateEfficiency() {
        if (!this.state.isMining) return 0;
        
        // Eficiencia simulada basada en tiempo de sesión
        const sessionDuration = (Date.now() - this.state.miningStartTime) / 1000;
        return Math.min(95, Math.floor(60 + (sessionDuration * 0.5)));
    }
    
    startSessionTimer() {
        this.sessionTimer = setInterval(() => {
            if (this.state.isMining) {
                this.updateSessionDisplay();
            }
        }, 1000);
    }
    
    stopSessionTimer() {
        if (this.sessionTimer) {
            clearInterval(this.sessionTimer);
            this.sessionTimer = null;
        }
    }
    
    startUpdateTimer() {
        this.updateTimer = setInterval(() => {
            if (this.state.isMining) {
                this.updateMiningStats();
            }
        }, this.config.updateInterval);
    }
    
    stopUpdateTimer() {
        if (this.updateTimer) {
            clearInterval(this.updateTimer);
            this.updateTimer = null;
        }
    }
    
    updateSessionDisplay() {
        if (!this.state.miningStartTime || !this.state.isMining) {
            return;
        }
        
        const sessionDuration = Date.now() - this.state.miningStartTime;
        const hours = Math.floor(sessionDuration / 3600000);
        const minutes = Math.floor((sessionDuration % 3600000) / 60000);
        const seconds = Math.floor((sessionDuration % 60000) / 1000);
        
        if (this.elements.sessionTime) {
            this.elements.sessionTime.textContent = 
                `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
        
        // Actualizar barra de progreso
        if (this.elements.progressFill) {
            const maxSessionTime = this.config.sessionTimeout;
            const progress = Math.min((sessionDuration / maxSessionTime) * 100, 100);
            this.elements.progressFill.style.width = `${progress}%`;
        }
        
        // Actualizar tokens ganados
        if (this.elements.tokensEarned) {
            const tokens = this.calculateSessionRewards();
            this.elements.tokensEarned.textContent = tokens.toFixed(2);
        }
        
        // Actualizar tiempo activo
        if (this.elements.activeTime) {
            const activeMinutes = Math.floor(sessionDuration / 60000);
            this.elements.activeTime.textContent = activeMinutes;
        }
    }
    
    updateMiningStats() {
        if (!this.state.isMining) return;
        
        // Hash rate
        if (this.elements.hashRate) {
            const hashRate = this.calculateHashRate();
            this.elements.hashRate.textContent = `${hashRate} H/s`;
        }
        
        // Intensidad
        if (this.elements.intensity) {
            const sessionDuration = (Date.now() - this.state.miningStartTime) / 1000;
            let intensity = 'Baja';
            if (sessionDuration > 300) intensity = 'Media';
            if (sessionDuration > 600) intensity = 'Alta';
            this.elements.intensity.textContent = intensity;
        }
        
        // Eficiencia
        if (this.elements.efficiency) {
            const efficiency = this.calculateEfficiency();
            this.elements.efficiency.textContent = `${efficiency}%`;
        }
    }
    
    updateUserDisplay() {
        if (!this.state.currentUser) return;
        
        // Username del usuario (más profesional que email)
        if (this.state.currentUser.username) {
            if (this.elements.userUsername) {
                this.elements.userUsername.textContent = this.state.currentUser.username;
            }
            if (this.elements.sidebarUsername) {
                this.elements.sidebarUsername.textContent = this.state.currentUser.username;
            }
        } else {
            // Fallback al email si no hay username
            if (this.elements.userUsername) {
                this.elements.userUsername.textContent = this.state.currentUser.email;
            }
            if (this.elements.sidebarUsername) {
                this.elements.sidebarUsername.textContent = this.state.currentUser.email;
            }
        }
        
        // Balance
        if (this.elements.userBalance) {
            this.elements.userBalance.textContent = this.state.totalMined.toFixed(2);
        }
        if (this.elements.sidebarBalance) {
            this.elements.sidebarBalance.textContent = this.state.totalMined.toFixed(2);
        }
        
        // Sesiones hoy en el sidebar
        if (this.elements.sidebarSessionsToday) {
            this.elements.sidebarSessionsToday.textContent = this.state.sessionsToday;
        }
        
        // Límite diario
        if (this.elements.dailyLimit) {
            this.elements.dailyLimit.textContent = `${this.state.dailyLimit.toFixed(2)} / ${this.config.dailyLimit}`;
        }
        
        // Total minado
        if (this.elements.totalMined) {
            this.elements.totalMined.textContent = `${this.state.totalMined.toFixed(2)} RSC`;
        }
        
        // Tiempo total
        if (this.elements.totalTime) {
            const totalHours = Math.floor(this.state.totalTime / 60);
            this.elements.totalTime.textContent = `${totalHours} horas`;
        }
        
        // Sesiones hoy
        if (this.elements.sessionsToday) {
            this.elements.sessionsToday.textContent = this.state.sessionsToday;
        }
        
        // Ranking (simulado)
        if (this.elements.userRanking) {
            this.elements.userRanking.textContent = `#${Math.floor(Math.random() * 1000) + 1}`;
        }
        
        // Última minería
        if (this.elements.lastMining) {
            if (this.state.currentUser.last_mine_at) {
                const lastMining = new Date(this.state.currentUser.last_mine_at);
                this.elements.lastMining.textContent = lastMining.toLocaleDateString();
            } else {
                this.elements.lastMining.textContent = 'Nunca';
            }
        }
        
        // Dificultad de red (simulada)
        if (this.elements.networkDifficulty) {
            const difficulties = ['Baja', 'Media', 'Alta'];
            this.elements.networkDifficulty.textContent = difficulties[Math.floor(Math.random() * 3)];
        }
        
        // Bloques de red (simulados)
        if (this.elements.networkBlocks) {
            this.elements.networkBlocks.textContent = 'Simulado';
        }
    }
    
    addMiningHistoryEntry(tokens) {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        
        const now = new Date();
        const dateStr = now.toLocaleDateString();
        const timeStr = now.toLocaleTimeString();
        
        historyItem.innerHTML = `
            <div class="history-header">
                <span class="history-date">${dateStr} ${timeStr}</span>
                <span class="history-amount">+${tokens.toFixed(2)} RSC</span>
            </div>
            <div class="history-duration">Sesión completada</div>
        `;
        
        // Agregar al inicio del historial
        const noHistory = this.elements.miningHistory.querySelector('.no-history');
        if (noHistory) {
            noHistory.remove();
        }
        
        this.elements.miningHistory.insertBefore(historyItem, this.elements.miningHistory.firstChild);
        
        // Limitar historial a 10 entradas
        const historyItems = this.elements.miningHistory.querySelectorAll('.history-item');
        if (historyItems.length > 10) {
            historyItems[historyItems.length - 1].remove();
        }
    }
    
    loadMiningHistory() {
        // Cargar historial desde localStorage
        const history = JSON.parse(localStorage.getItem('rsc_mining_history') || '[]');
        
        if (history.length === 0) {
            this.elements.miningHistory.innerHTML = '<p class="no-history">No hay historial aún</p>';
            return;
        }
        
        this.elements.miningHistory.innerHTML = '';
        history.slice(0, 10).forEach(entry => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            historyItem.innerHTML = `
                <div class="history-header">
                    <span class="history-date">${entry.date}</span>
                    <span class="history-amount">+${entry.tokens.toFixed(2)} RSC</span>
                </div>
                <div class="history-duration">${entry.duration}</div>
            `;
            this.elements.miningHistory.appendChild(historyItem);
        });
    }
    
    switchAuthTab(tab) {
        // Remover active de todos los tabs
        this.elements.authTabs.forEach(t => t.classList.remove('active'));
        
        // Agregar active al tab seleccionado
        document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
        
        // Mostrar formulario correspondiente
        document.querySelectorAll('.auth-form').forEach(form => form.classList.remove('active'));
        document.getElementById(`${tab}Form`).classList.add('active');
    }
    
    showAuthSection() {
        this.elements.authSection.style.display = 'flex';
        this.elements.miningInterface.style.display = 'none';
        this.elements.userInfo.style.display = 'none';
    }
    
    showMiningInterface() {
        this.elements.authSection.style.display = 'none';
        this.elements.miningInterface.style.display = 'block';
        this.elements.userInfo.style.display = 'flex';
    }
    
    toggleMobileMenu() {
        this.elements.hamburgerMenu.classList.toggle('active');
        this.elements.mobileNav.classList.toggle('active');
        document.body.classList.toggle('mobile-menu-open');
    }
    
    toggleTheme() {
        this.state.theme = this.state.theme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', this.state.theme);
        this.persistData();
        
        // Cambiar icono
        const icon = this.elements.themeToggle.querySelector('i');
        icon.className = this.state.theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
    }
    
    hideAllModals() {
        this.elements.modalOverlay.classList.remove('active');
        this.elements.mainnetModal.classList.remove('active');
        document.body.classList.remove('modal-open');
    }
    
    hideMainnetModal() {
        this.elements.mainnetModal.classList.remove('active');
        this.elements.modalOverlay.classList.remove('active');
        document.body.classList.remove('modal-open');
    }
    
    openSettingsModal() {
        // Actualizar información en el modal antes de mostrarlo
        this.updateSettingsModalInfo();
        
        this.elements.settingsModal.classList.add('active');
        this.elements.modalOverlay.classList.add('active');
        document.body.classList.add('modal-open');
    }
    
    closeSettingsModal() {
        this.elements.settingsModal.classList.remove('active');
        this.elements.modalOverlay.classList.remove('active');
        document.body.classList.remove('modal-open');
    }
    
    showMainnetModal() {
        this.elements.mainnetModal.classList.add('active');
        this.elements.modalOverlay.classList.add('active');
        document.body.classList.add('modal-open');
    }
    
    updateSettingsModalInfo() {
        // Actualizar información del usuario
        if (this.elements.settingsUsername && this.state.currentUser) {
            this.elements.settingsUsername.textContent = this.state.currentUser.username || 'Usuario';
        }
        
        if (this.elements.settingsEmail && this.state.currentUser) {
            this.elements.settingsEmail.textContent = this.state.currentUser.email || 'No disponible';
        }
        
        // Actualizar tarjetas de estadísticas rápidas
        if (this.elements.settingsBalance) {
            this.elements.settingsBalance.textContent = this.state.totalMined.toFixed(2);
        }
        
        if (this.elements.settingsTotalTime) {
            const hours = Math.floor(this.state.totalTime / 60);
            this.elements.settingsTotalTime.textContent = `${hours}h`;
        }
        
        if (this.elements.settingsSessionsToday) {
            this.elements.settingsSessionsToday.textContent = this.state.sessionsToday;
        }
        
        if (this.elements.settingsUserRanking) {
            this.elements.settingsUserRanking.textContent = `#${this.state.userRanking || '-'}`;
        }
        
        if (this.elements.settingsLastMining) {
            const lastMining = localStorage.getItem('rsc_last_mining') || 'Nunca';
            this.elements.settingsLastMining.textContent = lastMining;
        }
        
        if (this.elements.settingsMemberSince) {
            const memberSince = localStorage.getItem('rsc_member_since') || 'Hoy';
            this.elements.settingsMemberSince.textContent = memberSince;
        }
        
        // Actualizar información de la red
        if (this.elements.settingsDifficulty) {
            this.elements.settingsDifficulty.textContent = 'Baja';
        }
        
        if (this.elements.settingsBlocks) {
            this.elements.settingsBlocks.textContent = 'Simulado';
        }
    }
    
    refreshStats() {
        // Actualizar estadísticas
        this.updateSettingsModalInfo();
        this.showNotification('Estadísticas actualizadas', 'success');
    }
    
    exportData() {
        // Exportar datos del usuario
        const userData = {
            username: this.state.currentUser?.username || 'Usuario',
            email: this.state.currentUser?.email || 'No disponible',
            balance: this.state.totalMined,
            totalTime: this.state.totalTime,
            sessionsToday: this.state.sessionsToday,
            lastMining: localStorage.getItem('rsc_last_mining') || 'Nunca'
        };
        
        const dataStr = JSON.stringify(userData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `rsc_mining_data_${Date.now()}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
        this.showNotification('Datos exportados correctamente', 'success');
    }
    
    backupData() {
        // Crear respaldo en localStorage
        const backupData = {
            timestamp: new Date().toISOString(),
            user: this.state.currentUser,
            miningStats: {
                totalMined: this.state.totalMined,
                totalTime: this.state.totalTime,
                sessionsToday: this.state.sessionsToday,
                userRanking: this.state.userRanking
            },
            lastMining: localStorage.getItem('rsc_last_mining'),
            memberSince: localStorage.getItem('rsc_member_since')
        };
        
        localStorage.setItem('rsc_backup_data', JSON.stringify(backupData));
        
        // Mostrar notificación de éxito
        this.showNotification('Respaldo creado correctamente en tu dispositivo', 'success');
        
        // Simular envío a la nube (en una implementación real, esto iría a Supabase)
        setTimeout(() => {
            this.showNotification('Respaldo sincronizado con la nube', 'info');
        }, 1000);
    }
    
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        const iconMap = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };
        
        notification.innerHTML = `
            <i class="${iconMap[type]}"></i>
            <div class="notification-content">
                <div class="notification-title">${type.charAt(0).toUpperCase() + type.slice(1)}</div>
                <div class="notification-message">${message}</div>
            </div>
            <button class="notification-close">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        // Event listener para cerrar
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.remove();
        });
        
        // Agregar al contenedor
        this.elements.notificationContainer.appendChild(notification);
        
        // Auto-remover después de 5 segundos
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    }
    
    saveMiningData() {
        try {
            const data = {
                totalMined: this.state.totalMined,
                totalTime: this.state.totalTime,
                sessionsToday: this.state.sessionsToday,
                dailyLimit: this.state.dailyLimit,
                lastMining: new Date().toISOString()
            };
            
            localStorage.setItem('rsc_mining_data', JSON.stringify(data));
            
            // Guardar en Supabase si está disponible
            if (this.supabase && this.state.currentUser) {
                this.supabase
                    .from('users_balances')
                    .update({ 
                        balance: this.state.totalMined,
                        last_mine_at: new Date().toISOString()
                    })
                    .eq('email', this.state.currentUser.email)
                    .then(() => console.log('Datos guardados en Supabase'))
                    .catch(error => console.warn('Error al guardar en Supabase:', error.message));
            }
        } catch (error) {
            console.error('Error al guardar datos:', error);
        }
    }
    
    saveMiningSession() {
        try {
            const sessionData = {
                startTime: this.state.miningStartTime,
                isMining: this.state.isMining,
                sessionTokens: this.state.sessionTokens
            };
            
            localStorage.setItem('rsc_mining_session', JSON.stringify(sessionData));
        } catch (error) {
            console.error('Error al guardar sesión:', error);
        }
    }
    
    loadPersistedData() {
        try {
            // Cargar tema
            const savedTheme = localStorage.getItem('rsc_theme') || 'light';
            this.state.theme = savedTheme;
            document.documentElement.setAttribute('data-theme', savedTheme);
            
            // Cargar datos de minería 24/7
            this.loadMiningData();
            
        } catch (error) {
            console.error('Error al cargar datos persistentes:', error);
        }
    }
    
    loadMiningData() {
        // Cargar saldo del usuario
        const savedBalance = localStorage.getItem('rsc_user_balance');
        if (savedBalance) {
            this.state.totalMined = parseFloat(savedBalance);
        } else {
            // Establecer saldo inicial
            this.state.totalMined = 0.001;
            localStorage.setItem('rsc_user_balance', '0.001');
        }
        
        // Cargar tokens pendientes
        const pendingTokens = localStorage.getItem('rsc_pending_tokens');
        if (pendingTokens) {
            this.state.pendingTokens = parseFloat(pendingTokens);
        }
        
        // Cargar estado de sesión de minería
        const miningActive = localStorage.getItem('rsc_mining_active');
        const miningStart = localStorage.getItem('rsc_mining_start');
        const miningEnd = localStorage.getItem('rsc_mining_end');
        
        if (miningActive === 'true' && miningStart && miningEnd) {
            const now = Date.now();
            const endTime = parseInt(miningEnd);
            
            if (now < endTime) {
                // Sesión de minería activa - continuar
                this.state.miningSessionStart = parseInt(miningStart);
                this.state.miningSessionEnd = endTime;
                this.state.sessionStatus = 'active';
                this.state.isMining = true;
                
                // Iniciar minería automática
                this.startAutomaticMining();
            } else {
                // Sesión completada - limpiar
                this.completeMiningSession();
            }
        }
        
        // Actualizar interfaz
        this.updateMiningInterface();
    }
    
    persistData() {
        try {
            localStorage.setItem('rsc_theme', this.state.theme);
        } catch (error) {
            console.error('Error al persistir datos:', error);
        }
    }
    
    startUpdateLoop() {
        // Verificar límite diario cada hora
        setInterval(() => {
            const now = new Date();
            const lastCheck = localStorage.getItem('rsc_last_daily_check');
            
            if (!lastCheck || new Date(lastCheck).getDate() !== now.getDate()) {
                // Nuevo día, resetear límite diario
                this.state.dailyLimit = 0;
                this.state.sessionsToday = 0;
                this.saveMiningData();
                localStorage.setItem('rsc_last_daily_check', now.toISOString());
                
                console.log('Límite diario reseteado');
            }
        }, 3600000); // 1 hora
    }
    
    checkDailyLimit() {
        return this.state.dailyLimit < this.config.dailyLimit;
    }
    
    updateMiningInterface() {
        if (!this.elements.startMining) return;
        
        // Actualizar botones según estado
        if (this.state.sessionStatus === 'active') {
            this.elements.startMining.disabled = true;
            this.elements.startMining.textContent = 'Minando 24h...';
            
            // Mostrar progreso de sesión
            this.updateSessionProgress();
        } else if (this.state.sessionStatus === 'completed') {
            // Verificar si hay tokens pendientes
            if (this.state.pendingTokens > 0) {
                this.elements.startMining.disabled = true;
                this.elements.startMining.textContent = 'Reclama Tokens Primero';
                this.elements.startMining.classList.add('blocked');
            } else {
                this.elements.startMining.disabled = false;
                this.elements.startMining.textContent = 'Iniciar Nueva Minería';
                this.elements.startMining.classList.remove('blocked');
            }
        } else {
            // Verificar si hay tokens pendientes
            if (this.state.pendingTokens > 0) {
                this.elements.startMining.disabled = true;
                this.elements.startMining.textContent = `Reclama ${this.state.pendingTokens.toFixed(6)} Tokens`;
                this.elements.startMining.classList.add('blocked');
            } else {
                this.elements.startMining.disabled = false;
                this.elements.startMining.textContent = 'Iniciar Minería';
                this.elements.startMining.classList.remove('blocked');
            }
        }
        
        // Actualizar saldo en tiempo real
        this.updateBalanceDisplay();
        
        // Actualizar indicador de estado
        this.updateStatusIndicator();
    }
    
    updateSessionProgress() {
        if (!this.state.miningSessionStart || !this.state.miningSessionEnd) return;
        
        const now = Date.now();
        const elapsed = now - this.state.miningSessionStart;
        const total = this.state.miningSessionEnd - this.state.miningSessionStart;
        const progress = Math.min((elapsed / total) * 100, 100);
        
        // Actualizar barra de progreso si existe
        if (this.elements.progressFill) {
            this.elements.progressFill.style.width = `${progress}%`;
        }
        
        // Actualizar tiempo transcurrido
        if (this.elements.sessionTime) {
            const hours = Math.floor(elapsed / (1000 * 60 * 60));
            const minutes = Math.floor((elapsed % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((elapsed % (1000 * 60)) / 1000);
            this.elements.sessionTime.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
    }
    
    updateBalanceDisplay() {
        // Actualizar saldo principal
        if (this.elements.userBalance) {
            this.elements.userBalance.textContent = this.state.totalMined.toFixed(6);
        }
        
        // Actualizar saldo en sidebar
        if (this.elements.sidebarBalance) {
            this.elements.sidebarBalance.textContent = `${this.state.totalMined.toFixed(6)} RSC`;
        }
        
        // Actualizar tokens de sesión
        if (this.elements.tokensEarned) {
            this.elements.tokensEarned.textContent = this.state.sessionTokens.toFixed(6);
        }
        
        // Mostrar tokens pendientes si existen
        if (this.state.pendingTokens > 0) {
            console.log(`⚠️ Tokens pendientes: ${this.state.pendingTokens.toFixed(6)} RSC - Debes reclamarlos antes de minar`);
            
            // Mostrar indicador visual de tokens pendientes
            const pendingTokensElement = document.getElementById('pendingTokens');
            const pendingTokensValueElement = document.getElementById('pendingTokensValue');
            
            if (pendingTokensElement && pendingTokensValueElement) {
                pendingTokensElement.style.display = 'flex';
                pendingTokensValueElement.textContent = this.state.pendingTokens.toFixed(6);
            }
        } else {
            // Ocultar indicador si no hay tokens pendientes
            const pendingTokensElement = document.getElementById('pendingTokens');
            if (pendingTokensElement) {
                pendingTokensElement.style.display = 'none';
            }
        }
        
        // Log del estado actual para depuración
        console.log('🔍 Estado actual:', {
            sessionTokens: this.state.sessionTokens.toFixed(6),
            pendingTokens: this.state.pendingTokens.toFixed(6),
            totalMined: this.state.totalMined.toFixed(6)
        });
    }
    
    updateStatusIndicator() {
        if (!this.elements.statusIndicator) return;
        
        const indicator = this.elements.statusIndicator;
        
        if (this.state.sessionStatus === 'active') {
            indicator.textContent = '⛏️ Minando Activamente';
            indicator.className = 'status-indicator mining';
        } else if (this.state.sessionStatus === 'completed') {
            indicator.textContent = '✅ Sesión Completada';
            indicator.className = 'status-indicator completed';
        } else {
            indicator.textContent = '⏸️ Inactivo';
            indicator.className = 'status-indicator inactive';
        }
    }
    
    saveMiningSessionToSupabase() {
        if (!this.supabase) return;
        
        try {
            const sessionData = {
                user_email: this.state.currentUser.email,
                session_start: new Date(this.state.miningSessionStart).toISOString(),
                session_end: new Date(this.state.miningSessionEnd).toISOString(),
                status: 'active',
                tokens_earned: 0
            };
            
            // Aquí iría la lógica para guardar en Supabase
            console.log('💾 Guardando sesión de minería en Supabase:', sessionData);
        } catch (error) {
            console.error('Error al guardar sesión en Supabase:', error);
        }
    }
    
    updateBalanceInSupabase(newBalance) {
        if (!this.supabase || !this.state.currentUser) return;
        
        try {
            // Aquí iría la lógica para actualizar balance en Supabase
            console.log('💾 Actualizando balance en Supabase:', newBalance);
        } catch (error) {
            console.error('Error al actualizar balance en Supabase:', error);
        }
    }
    
    // Función para limpiar estado bloqueado (útil para debugging)
    clearBlockedState() {
        console.log('🧹 Limpiando estado bloqueado...');
        console.log('Estado antes:', {
            pendingTokens: this.state.pendingTokens,
            sessionTokens: this.state.sessionTokens
        });
        
        // Limpiar tokens pendientes
        this.state.pendingTokens = 0;
        localStorage.removeItem('rsc_pending_tokens');
        
        // Limpiar tokens de sesión
        this.state.sessionTokens = 0;
        
        console.log('Estado después:', {
            pendingTokens: this.state.pendingTokens,
            sessionTokens: this.state.sessionTokens
        });
        
        // Actualizar interfaz
        this.updateMiningInterface();
        this.updateBalanceDisplay();
        
        this.showNotification('Estado bloqueado limpiado - Puedes minar nuevamente', 'success');
    }
}

// Inicializar la plataforma cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.rscMiningPlatform = new RSCMiningPlatform();
    
    // Función de emergencia para limpiar estado bloqueado
    window.clearMiningBlock = () => {
        if (window.rscMiningPlatform) {
            window.rscMiningPlatform.clearBlockedState();
        } else {
            console.log('❌ Plataforma no inicializada');
        }
    };
    
    console.log('🚀 Para limpiar estado bloqueado, ejecuta: clearMiningBlock()');
});

// Función global para mostrar información de mainnet
function showMainnetInfo() {
    if (window.rscMiningPlatform) {
        window.rscMiningPlatform.elements.mainnetModal.classList.add('active');
        window.rscMiningPlatform.elements.modalOverlay.classList.add('active');
        document.body.classList.add('modal-open');
    }
}
