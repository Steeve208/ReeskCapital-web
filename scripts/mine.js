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
            totalMined: 0,
            totalTime: 0,
            sessionsToday: 0,
            dailyLimit: 0,
            theme: 'light'
        };
        
        // Configuración de minería
        this.config = {
            tokensPerMinute: 10, // 10 tokens por minuto activo
            dailyLimit: 2, // 2 RSC máximo por día
            updateInterval: 1000, // Actualizar cada segundo
            sessionTimeout: 300000 // 5 minutos de timeout
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
        this.elements.stopMining = document.getElementById('stopMining');
        this.elements.claimRewards = document.getElementById('claimRewards');
        
        // Elementos de estado
        this.elements.hashRate = document.getElementById('hashRate');
        this.elements.intensity = document.getElementById('intensity');
        this.elements.efficiency = document.getElementById('efficiency');
        this.elements.sessionTime = document.getElementById('sessionTime');
        this.elements.progressFill = document.getElementById('progressFill');
        this.elements.tokensEarned = document.getElementById('tokensEarned');
        this.elements.activeTime = document.getElementById('activeTime');
        
        // Elementos de estadísticas
        this.elements.userBalance = document.getElementById('userBalance');
        this.elements.dailyLimit = document.getElementById('dailyLimit');
        this.elements.totalMined = document.getElementById('totalMined');
        this.elements.totalTime = document.getElementById('totalTime');
        this.elements.sessionsToday = document.getElementById('sessionsToday');
        this.elements.userRanking = document.getElementById('userRanking');
        
        // Elementos del sidebar
        this.elements.sidebarUsername = document.getElementById('sidebarUsername');
        this.elements.sidebarEmail = document.getElementById('sidebarEmail');
        this.elements.sidebarBalance = document.getElementById('sidebarBalance');
        this.elements.lastMining = document.getElementById('lastMining');
        this.elements.networkDifficulty = document.getElementById('networkDifficulty');
        this.elements.networkBlocks = document.getElementById('networkBlocks');
        
        // Elementos de historial
        this.elements.miningHistory = document.getElementById('miningHistory');
        
        // Elementos de navegación
        this.elements.hamburgerMenu = document.getElementById('hamburgerMenu');
        this.elements.mobileNav = document.getElementById('mobileNav');
        this.elements.themeToggle = document.getElementById('themeToggle');
        
        // Elementos de modales
        this.elements.modalOverlay = document.getElementById('modalOverlay');
        this.elements.mainnetModal = document.getElementById('mainnetModal');
        this.elements.mainnetModalClose = document.getElementById('mainnetModalClose');
        
        // Contenedor de notificaciones
        this.elements.notificationContainer = document.getElementById('notificationContainer');
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
        this.elements.stopMining.addEventListener('click', () => this.stopMining());
        this.elements.claimRewards.addEventListener('click', () => this.claimRewards());
        
        // Botones de navegación
        this.elements.logoutBtn.addEventListener('click', () => this.logout());
        this.elements.hamburgerMenu.addEventListener('click', () => this.toggleMobileMenu());
        this.elements.themeToggle.addEventListener('click', () => this.toggleTheme());
        
        // Cerrar modales
        this.elements.modalOverlay.addEventListener('click', () => this.hideAllModals());
        this.elements.mainnetModalClose.addEventListener('click', () => this.hideMainnetModal());
        
        // Eventos de teclado
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideAllModals();
            }
        });
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
            // Validar que el email sea válido
            if (!email || !email.includes('@')) {
                throw new Error('Email inválido');
            }
            
            let userData = null;
            
            // Intentar cargar desde Supabase
            if (this.supabase && typeof getUserByEmailFromSupabase === 'function') {
                try {
                    userData = await getUserByEmailFromSupabase(email);
                    console.log('📊 Usuario encontrado en Supabase:', userData);
                } catch (error) {
                    console.warn('⚠️ Error al cargar desde Supabase:', error.message);
                }
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
            }
            
            // Actualizar estado
            this.state.currentUser = userData;
            this.state.isAuthenticated = true;
            this.state.totalMined = userData.balance || 0;
            
            // Actualizar UI
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
            
            // Login simplificado - solo verificar que el usuario existe
            if (this.supabase && typeof getUserByEmailFromSupabase === 'function') {
                try {
                    console.log('🔍 Verificando usuario en Supabase...');
                    const userData = await getUserByEmailFromSupabase(email);
                    
                    if (userData) {
                        await this.loadUserData(email);
                        this.showNotification('Sesión iniciada correctamente con Supabase', 'success');
                    } else {
                        // Usuario no existe, crearlo
                        await this.loadUserData(email);
                        this.showNotification('Usuario creado y sesión iniciada', 'success');
                    }
                } catch (error) {
                    console.warn('⚠️ Error con Supabase, usando modo local:', error.message);
                    await this.loadUserData(email);
                    this.showNotification('Sesión iniciada (modo local)', 'success');
                }
            } else {
                // Login local (simulado)
                console.log('📱 Modo local: iniciando sesión con email:', email);
                await this.loadUserData(email);
                this.showNotification('Sesión iniciada correctamente (modo local)', 'success');
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
            
            // Registro simplificado - crear usuario directamente en la tabla
            if (this.supabase && typeof createUserInSupabase === 'function') {
                try {
                    console.log('🔍 Creando usuario en Supabase...');
                    await this.loadUserData(email);
                    this.showNotification('Usuario registrado correctamente en Supabase', 'success');
                } catch (error) {
                    console.warn('⚠️ Error con Supabase, usando modo local:', error.message);
                    await this.loadUserData(email);
                    this.showNotification('Usuario registrado (modo local)', 'success');
                }
            } else {
                // Registro local (simulado)
                console.log('📱 Modo local: registrando usuario con email:', email);
                await this.loadUserData(email);
                this.showNotification('Usuario registrado correctamente (modo local)', 'success');
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
        
        // Verificar límite diario
        if (this.state.dailyLimit >= this.config.dailyLimit) {
            this.showNotification('Has alcanzado el límite diario de 2 RSC', 'warning');
            return;
        }
        
        try {
            // Iniciar minería
            this.state.isMining = true;
            this.state.miningStartTime = Date.now();
            this.state.sessionTokens = 0;
            
            // Actualizar UI
            this.elements.startMining.disabled = true;
            this.elements.stopMining.disabled = false;
            this.elements.startMining.classList.add('loading');
            
            // Iniciar timers
            this.startSessionTimer();
            this.startUpdateTimer();
            
            // Guardar estado
            this.saveMiningSession();
            
            this.showNotification('Minería iniciada correctamente', 'success');
            console.log('Minería iniciada');
        } catch (error) {
            console.error('Error al iniciar minería:', error);
            this.showNotification('Error al iniciar minería', 'error');
            this.state.isMining = false;
        }
    }
    
    stopMining() {
        if (!this.state.isMining) {
            return;
        }
        
        try {
            // Detener minería
            this.state.isMining = false;
            
            // Calcular recompensas de la sesión
            const sessionRewards = this.calculateSessionRewards();
            this.state.sessionTokens = sessionRewards;
            
            // Actualizar balance
            this.state.totalMined += sessionRewards;
            this.state.dailyLimit += sessionRewards;
            
            // Actualizar UI
            this.elements.startMining.disabled = false;
            this.elements.stopMining.disabled = true;
            this.elements.startMining.classList.remove('loading');
            
            // Detener timers
            this.stopSessionTimer();
            this.stopUpdateTimer();
            
            // Guardar datos
            this.saveMiningData();
            this.addMiningHistoryEntry(sessionRewards);
            
            // Actualizar display
            this.updateMiningStats();
            this.updateUserDisplay();
            
            this.showNotification(`Minería detenida. Ganaste ${sessionRewards.toFixed(2)} RSC`, 'success');
            console.log('Minería detenida, recompensas:', sessionRewards);
        } catch (error) {
            console.error('Error al detener minería:', error);
            this.showNotification('Error al detener minería', 'error');
        }
    }
    
    async claimRewards() {
        if (!this.state.isAuthenticated) {
            this.showNotification('Debes iniciar sesión para reclamar recompensas', 'warning');
            return;
        }
        
        if (this.state.sessionTokens <= 0) {
            this.showNotification('No hay recompensas para reclamar', 'warning');
            return;
        }
        
        try {
            // Reclamar recompensas de la sesión actual
            const claimedTokens = this.state.sessionTokens;
            this.state.totalMined += claimedTokens;
            this.state.dailyLimit += claimedTokens;
            this.state.sessionTokens = 0;
            
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
            
            this.showNotification(`Recompensas reclamadas: ${claimedTokens.toFixed(2)} RSC`, 'success');
            console.log('Recompensas reclamadas:', claimedTokens);
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
        
        this.elements.sessionTime.textContent = 
            `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        // Actualizar barra de progreso
        const maxSessionTime = this.config.sessionTimeout;
        const progress = Math.min((sessionDuration / maxSessionTime) * 100, 100);
        this.elements.progressFill.style.width = `${progress}%`;
        
        // Actualizar tokens ganados
        const tokens = this.calculateSessionRewards();
        this.elements.tokensEarned.textContent = tokens.toFixed(2);
        
        // Actualizar tiempo activo
        const activeMinutes = Math.floor(sessionDuration / 60000);
        this.elements.activeTime.textContent = activeMinutes;
    }
    
    updateMiningStats() {
        if (!this.state.isMining) return;
        
        // Hash rate
        const hashRate = this.calculateHashRate();
        this.elements.hashRate.textContent = `${hashRate} H/s`;
        
        // Intensidad
        const sessionDuration = (Date.now() - this.state.miningStartTime) / 1000;
        let intensity = 'Baja';
        if (sessionDuration > 300) intensity = 'Media';
        if (sessionDuration > 600) intensity = 'Alta';
        this.elements.intensity.textContent = intensity;
        
        // Eficiencia
        const efficiency = this.calculateEfficiency();
        this.elements.efficiency.textContent = `${efficiency}%`;
    }
    
    updateUserDisplay() {
        if (!this.state.currentUser) return;
        
        // Username del usuario (más profesional que email)
        if (this.state.currentUser.username) {
            this.elements.userUsername.textContent = this.state.currentUser.username;
            this.elements.sidebarUsername.textContent = this.state.currentUser.username;
        } else {
            // Fallback al email si no hay username
            this.elements.userUsername.textContent = this.state.currentUser.email;
            this.elements.sidebarUsername.textContent = this.state.currentUser.email;
        }
        
        // Balance
        this.elements.userBalance.textContent = this.state.totalMined.toFixed(2);
        this.elements.sidebarBalance.textContent = this.state.totalMined.toFixed(2);
        
        // Límite diario
        this.elements.dailyLimit.textContent = `${this.state.dailyLimit.toFixed(2)} / ${this.config.dailyLimit}`;
        
        // Total minado
        this.elements.totalMined.textContent = `${this.state.totalMined.toFixed(2)} RSC`;
        
        // Tiempo total
        const totalHours = Math.floor(this.state.totalTime / 60);
        this.elements.totalTime.textContent = `${totalHours} horas`;
        
        // Sesiones hoy
        this.elements.sessionsToday.textContent = this.state.sessionsToday;
        
        // Ranking (simulado)
        this.elements.userRanking.textContent = `#${Math.floor(Math.random() * 1000) + 1}`;
        
        // Última minería
        if (this.state.currentUser.last_mine_at) {
            const lastMining = new Date(this.state.currentUser.last_mine_at);
            this.elements.lastMining.textContent = lastMining.toLocaleDateString();
        } else {
            this.elements.lastMining.textContent = 'Nunca';
        }
        
        // Dificultad de red (simulada)
        const difficulties = ['Baja', 'Media', 'Alta'];
        this.elements.networkDifficulty.textContent = difficulties[Math.floor(Math.random() * 3)];
        
        // Bloques de red (simulados)
        this.elements.networkBlocks.textContent = 'Simulado';
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
            
            // Cargar datos de minería
            const miningData = JSON.parse(localStorage.getItem('rsc_mining_data') || '{}');
            this.state.totalMined = miningData.totalMined || 0;
            this.state.totalTime = miningData.totalTime || 0;
            this.state.sessionsToday = miningData.sessionsToday || 0;
            this.state.dailyLimit = miningData.dailyLimit || 0;
            
            // Cargar sesión de minería
            const sessionData = JSON.parse(localStorage.getItem('rsc_mining_session') || '{}');
            if (sessionData.isMining && sessionData.startTime) {
                const sessionAge = Date.now() - sessionData.startTime;
                if (sessionAge < this.config.sessionTimeout) {
                    // Restaurar sesión
                    this.state.isMining = true;
                    this.state.miningStartTime = sessionData.startTime;
                    this.state.sessionTokens = sessionData.sessionTokens || 0;
                    
                    // Reiniciar timers
                    this.startSessionTimer();
                    this.startUpdateTimer();
                    
                    // Actualizar UI
                    this.elements.startMining.disabled = true;
                    this.elements.stopMining.disabled = false;
                }
            }
        } catch (error) {
            console.error('Error al cargar datos persistentes:', error);
        }
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
}

// Inicializar la plataforma cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.rscMiningPlatform = new RSCMiningPlatform();
});

// Función global para mostrar información de mainnet
function showMainnetInfo() {
    if (window.rscMiningPlatform) {
        window.rscMiningPlatform.elements.mainnetModal.classList.add('active');
        window.rscMiningPlatform.elements.modalOverlay.classList.add('active');
        document.body.classList.add('modal-open');
    }
}
