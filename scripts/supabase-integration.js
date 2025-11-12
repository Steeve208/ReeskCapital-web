/* ================================
   SUPABASE INTEGRATION - SIMPLE
================================ */

/**
 * 🔗 SIMPLE SUPABASE INTEGRATION
 * 
 * Integrates with the existing mining page system
 */

class SupabaseIntegration {
    constructor() {
        this.config = {
            url: 'https://unevdceponbnmhvpzlzf.supabase.co',
            anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVuZXZkY2Vwb25ibm1odnB6bHpmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU5MTIyMTksImV4cCI6MjA3MTQ4ODIxOX0.OLHbZrezgBiXWQplN1jrGD_xkARqG2uD8ECqzo05jE4'
        };
        
        this.user = {
            isAuthenticated: false,
            id: null,
            email: null,
            username: null,
            balance: 0,
            referralCode: null
        };
        
        this.miningSession = {
            isActive: false,
            sessionId: null,
            startTime: null,
            endTime: null,
            tokensMined: 0,
            hashRate: 0,
            efficiency: 100,
            duration: 24 * 60 * 60 * 1000 // 24 horas en milisegundos
        };
        
        this.syncInterval = null;
        
        this.init();
    }

    async init() {
        try {
            console.log('🔗 Initializing Supabase integration...');
            await this.checkConnection();
            await this.loadStoredUser();
            await this.checkMiningSession();
            console.log('✅ Supabase Integration inicializado');
        } catch (error) {
            console.error('❌ Error inicializando Supabase:', error);
        }
    }

    async checkConnection() {
        try {
            const response = await this.makeRequest('GET', '/rest/v1/users?select=count&limit=1');
            if (response.ok) {
                console.log('✅ Supabase connection established');
                return true;
            } else {
                throw new Error('Supabase connection error');
            }
        } catch (error) {
            console.error('❌ Error conectando con Supabase:', error);
            throw error;
        }
    }

    async registerUser(email, username, password, referralCode = null) {
        try {
            console.log('📝 Registrando usuario:', { email, username, referralCode });
            
            // Verificar si el email ya existe
            const checkResponse = await this.makeRequest('GET', `/rest/v1/users?email=eq.${email}&select=id`);
            if (checkResponse.ok) {
                const existingUsers = await checkResponse.json();
                if (existingUsers.length > 0) {
                    throw new Error('This email is already registered. Please login instead.');
                }
            }
            
            // Find the referrer user ID if a referral code is provided
            let referrerId = null;
            if (referralCode) {
                console.log('🔍 Searching for user with referral code:', referralCode);
                const referrerResponse = await this.makeRequest('GET', `/rest/v1/users?referral_code=eq.${referralCode}&select=id`);
                if (referrerResponse.ok) {
                    const referrers = await referrerResponse.json();
                    if (referrers.length > 0) {
                        referrerId = referrers[0].id;
                        console.log('✅ Referrer user found:', referrerId);
                    } else {
                        throw new Error('Invalid referral code. Please verify the code is correct.');
                    }
                } else {
                    throw new Error('Error validating referral code');
                }
            }
            
            // Simple password hash (use bcrypt in production)
            const hashedPassword = btoa(password); // Base64 encoding simple
            
            const response = await this.makeRequest('POST', '/rest/v1/users', {
                email: email,
                username: username,
                password: hashedPassword,
                balance: 0,
                referral_code: this.generateReferralCode(),
                referred_by: referrerId
            });

            if (response.ok || response.status === 201) {
                const data = await response.json();
                
                if (Array.isArray(data) && data.length > 0) {
                    const userData = data[0];
                    this.user.id = userData.id;
                    this.user.email = userData.email;
                    this.user.username = userData.username;
                    this.user.balance = parseFloat(userData.balance) || 0;
                    this.user.referralCode = userData.referral_code;
                    this.user.referredBy = userData.referred_by;
                    this.user.isAuthenticated = true;
                    
                    this.saveUserToStorage();
                    
                    console.log('✅ Usuario registrado exitosamente');
                    return userData;
                } else {
                    throw new Error('Error en el formato de respuesta del registro');
                }
            } else {
                const error = await response.json();
                throw new Error(error.message || 'Error en el registro');
            }
        } catch (error) {
            console.error('❌ Error registrando usuario:', error);
            throw error;
        }
    }

    generateReferralCode() {
        return 'RSC' + Math.random().toString(36).substr(2, 6).toUpperCase();
    }

    /**
     * 🧪 CREAR USUARIO DE PRUEBA
     * Crea un usuario de prueba para testing
     */
    async createTestUser() {
        try {
            console.log('🧪 Creating test user...');
            
            // Generate unique username with timestamp
            const timestamp = Date.now().toString().slice(-6);
            const testUser = {
                email: `test${timestamp}@rsc.com`,
                username: `testuser${timestamp}`,
                password: '123456'
            };
            
            console.log('👤 Intentando crear usuario:', testUser.email, testUser.username);
            
            // Verificar si ya existe por email
            const existingResponse = await this.makeRequest('GET', `/rest/v1/users?email=eq.${encodeURIComponent(testUser.email)}&select=*`);
            
            if (existingResponse.ok) {
                const existingUsers = await existingResponse.json();
                if (existingUsers.length > 0) {
                    console.log('✅ Usuario de prueba ya existe:', existingUsers[0]);
                    return existingUsers[0];
                }
            }
            
            // Crear nuevo usuario de prueba
            const result = await this.registerUser(testUser.email, testUser.username, testUser.password);
            console.log('✅ Usuario de prueba creado:', result);
            return result;
            
        } catch (error) {
            console.error('❌ Error creando usuario de prueba:', error);
            
            // Si falla por username duplicado, intentar con otro
            if (error.message.includes('duplicate key') || error.message.includes('unique constraint')) {
                console.log('🔄 Intentando con username diferente...');
                const randomSuffix = Math.random().toString(36).substring(2, 8);
                const alternativeUser = {
                    email: `test${randomSuffix}@rsc.com`,
                    username: `testuser${randomSuffix}`,
                    password: '123456'
                };
                
                try {
                    const result = await this.registerUser(alternativeUser.email, alternativeUser.username, alternativeUser.password);
                    console.log('✅ Usuario de prueba alternativo creado:', result);
                    return result;
                } catch (retryError) {
                    console.error('❌ Error en segundo intento:', retryError);
                    throw retryError;
                }
            }
            
            throw error;
        }
    }

    /**
     * 🔍 OBTENER PRIMER USUARIO EXISTENTE
     * Obtiene el primer usuario de la base de datos para testing
     */
    async getFirstExistingUser() {
        try {
            console.log('🔍 Buscando primer usuario existente...');
            
            const response = await this.makeRequest('GET', '/rest/v1/users?select=*&limit=1');
            
            if (response.ok) {
                const users = await response.json();
                if (users.length > 0) {
                    const user = users[0];
                    console.log('✅ Usuario existente encontrado:', {
                        email: user.email,
                        username: user.username,
                        id: user.id
                    });
                    return user;
                } else {
                    console.log('❌ No hay usuarios en la base de datos');
                    return null;
                }
            } else {
                console.error('❌ Error obteniendo usuarios:', response.status);
                return null;
            }
        } catch (error) {
            console.error('❌ Error buscando usuarios:', error);
            return null;
        }
    }

    async loginUser(email, password) {
        try {
            console.log('🔐 Logging in:', email);
            console.log('🔧 Supabase configuration:', this.config);
            
            // Validar entrada
            if (!email || !password) {
                throw new Error('Email and password are required');
            }
            
            if (!email.includes('@')) {
                throw new Error('Invalid email');
            }
            
            const response = await this.makeRequest('GET', `/rest/v1/users?email=eq.${encodeURIComponent(email)}&select=*`);
            console.log('📡 Respuesta de Supabase:', response.status, response.statusText);
            
            if (response.ok) {
                const users = await response.json();
                console.log('👥 Usuarios encontrados:', users.length);
                
                if (users.length > 0) {
                    const userData = users[0];
                    console.log('👤 User data:', userData);
                    
                    // Verify password
                    const storedPassword = userData.password;
                    const hashedInputPassword = btoa(password);
                    
                    console.log('🔑 Verifying password...');
                    console.log('🔑 Stored password:', storedPassword);
                    console.log('🔑 Input password hash:', hashedInputPassword);
                    
                    if (storedPassword !== hashedInputPassword) {
                        console.log('❌ Incorrect password');
                        throw new Error('Incorrect password');
                    }
                    
                    this.user.id = userData.id;
                    this.user.email = userData.email;
                    this.user.username = userData.username;
                    this.user.balance = parseFloat(userData.balance) || 0;
                    this.user.referralCode = userData.referral_code;
                    this.user.referredBy = userData.referred_by;
                    this.user.isAuthenticated = true;
                    
                    console.log('💾 Guardando usuario en storage...');
                    this.saveUserToStorage();
                    
                    console.log('✅ Session started successfully');
                    return userData;
                } else {
                    console.log('❌ Email not registered');
                    throw new Error('Email not registered. Please register first.');
                }
            } else {
                let errorMessage = 'Error del servidor';
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.message || errorData.error || `HTTP ${response.status}`;
                    console.error('❌ Error detallado de Supabase:', errorData);
                } catch (parseError) {
                    const errorText = await response.text();
                    console.error('❌ Error en la respuesta:', response.status, errorText);
                    errorMessage = `Error ${response.status}: ${response.statusText}`;
                }
                console.log('❌ Error en respuesta de Supabase:', response.status, errorMessage);
                throw new Error(errorMessage);
            }
        } catch (error) {
            console.error('❌ Error logging in:', error);
            throw error;
        }
    }

    logout() {
        this.user.isAuthenticated = false;
        this.user.id = null;
        this.user.email = null;
        this.user.username = null;
        this.user.balance = 0;
        this.user.referralCode = null;
        this.user.referredBy = null;
        
        localStorage.removeItem('rsc_user_data');
        console.log('ℹ️ Session closed');
    }

    async checkMiningSession() {
        try {
            const stored = localStorage.getItem('rsc_mining_session');
            if (stored) {
                const sessionData = JSON.parse(stored);
                const now = new Date();
                const startTime = new Date(sessionData.startTime);
                const elapsed = now - startTime;
                const duration = 24 * 60 * 60 * 1000; // 24 horas
                
                console.log(`🔍 Checking existing session...`);
                console.log(`📅 Start: ${startTime.toLocaleString()}`);
                console.log(`⏱️ Elapsed time: ${Math.floor(elapsed / 1000 / 60)} minutes`);
                
                if (elapsed < duration) {
                    // Session is still active - restore all data
                    this.miningSession.isActive = true;
                    this.miningSession.sessionId = sessionData.sessionId;
                    this.miningSession.startTime = sessionData.startTime;
                    this.miningSession.endTime = sessionData.endTime;
                    this.miningSession.hashRate = sessionData.hashRate || 500;
                    this.miningSession.efficiency = sessionData.efficiency || 100;
                    this.miningSession.tokensMined = sessionData.tokensMined || 0;
                    
                    // 🔧 CALCULATE ONLY NEW TOKENS SINCE LAST UPDATE
                    const lastUpdateTime = sessionData.lastUpdateTime ? new Date(sessionData.lastUpdateTime) : startTime;
                    const timeSinceLastUpdate = now - lastUpdateTime;
                    
                    // Only calculate new tokens if more than 1 minute has passed since last update
                    if (timeSinceLastUpdate > 60000) { // 60 segundos
                        const newTokens = this.calculateOfflineMining(timeSinceLastUpdate);
                        
                        if (newTokens > 0) {
                            this.miningSession.tokensMined += newTokens;
                            this.user.balance += newTokens;
                            this.saveUserToStorage();
                            console.log(`⛏️ Offline mining: +${newTokens.toFixed(6)} RSC (${Math.floor(timeSinceLastUpdate / 60000)} min)`);
                        }
                    }
                    
                    // Save updated session with last update timestamp
                    this.saveMiningSession();
                    
                    // Start automatic synchronization with backend
                    this.startBackgroundSync();
                    
                    // 🔧 START AUTOMATIC UPDATE TIMER
                    this.startMiningUpdateTimer();
                    
                    console.log('✅ Active mining session restored');
                    console.log(`💰 Mined tokens: ${this.miningSession.tokensMined.toFixed(6)} RSC`);
                    console.log(`⏰ Time remaining: ${this.getRemainingTime()} hours`);
                    
                    return true;
                } else {
                    // Session expired - process rewards and cleanup
                    console.log('⏰ 24-hour session completed - Processing rewards...');
                    
                    const tokensMined = sessionData.tokensMined || 0;
                    if (tokensMined > 0 && this.user.isAuthenticated) {
                        this.user.balance += tokensMined;
                        this.saveUserToStorage();
                        console.log(`💰 Recompensas finales procesadas: +${tokensMined.toFixed(6)} RSC`);
                    }
                    
                    // Clean expired session
                    localStorage.removeItem('rsc_mining_session');
                    this.miningSession.isActive = false;
                    
                    return false;
                }
            }
            return false;
        } catch (error) {
            console.error('❌ Error verificando sesión de minería:', error);
            return false;
        }
    }

    async startMiningSession() {
        try {
            if (!this.user.isAuthenticated) {
                throw new Error('Debes iniciar sesión para minar');
            }

            console.log('🔍 Verificando sesiones existentes...');
            
            // 🔧 VERIFICAR LÍMITE GLOBAL DE MINERÍA ANTES DE INICIAR
            const canMine = await this.checkGlobalMiningLimit();
            if (!canMine) {
                throw new Error('🚫 El fondo global de minería de 7.5M RSC ha sido completamente minado. La minería ya no está disponible.');
            }
            
            // Limpiar cualquier sesión expirada primero
            this.cleanExpiredSessions();
            
            // Verificar si hay una sesión activa válida
            const stored = localStorage.getItem('rsc_mining_session');
            if (stored) {
                const sessionData = JSON.parse(stored);
                const now = new Date();
                const startTime = new Date(sessionData.startTime);
                const elapsed = now - startTime;
                const duration = 24 * 60 * 60 * 1000; // 24 horas en ms
                
                console.log(`📅 Sesión encontrada: ${startTime.toLocaleString()}`);
                console.log(`⏱️ Elapsed time: ${Math.floor(elapsed / 1000 / 60)} minutes`);
                
                // Si la sesión aún es válida (menos de 24 horas)
                if (elapsed < duration) {
                    console.log('⚠️ Ya hay una sesión de minería activa');
                    throw new Error('Ya hay una sesión de minería activa');
                }
            }

            console.log('⛏️ Iniciando nueva sesión de minería de 24 horas...');
            
            // Crear sesión de 24 horas
            const sessionId = `mining_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            const startTime = new Date().toISOString();
            const endTime = new Date(Date.now() + this.miningSession.duration).toISOString();
            
            this.miningSession.isActive = true;
            this.miningSession.sessionId = sessionId;
            this.miningSession.startTime = startTime;
            this.miningSession.endTime = endTime;
            this.miningSession.tokensMined = 0;
            this.miningSession.hashRate = 0;
            this.miningSession.efficiency = 100;
            
            // Guardar sesión en localStorage
            this.saveMiningSession();
            
            // Iniciar sincronización automática con el backend
            this.startBackgroundSync();
            
            // 🔧 INICIAR TIMER DE ACTUALIZACIÓN AUTOMÁTICA
            this.startMiningUpdateTimer();
            
            console.log('✅ Sesión de minería de 24 horas iniciada');
            console.log(`⏰ Terminará el: ${new Date(endTime).toLocaleString()}`);
            return true;
        } catch (error) {
            console.error('❌ Error iniciando sesión de minería:', error);
            throw error;
        }
    }

    calculateOfflineMining(elapsedTime) {
        // Calcular tokens minados basado en tiempo transcurrido
        // Tasa de minería: 3-7.5 RSC por día (24 horas)
        // Promedio: 5.25 RSC por día = 0.00364583 RSC por minuto
        const baseMiningRatePerMinute = 5.25 / (24 * 60); // 0.00364583 RSC/min
        const elapsedMinutes = elapsedTime / (1000 * 60);
        
        // Variabilidad entre 3 y 7.5 RSC diarios (57% a 143% del promedio)
        const variability = 0.57 + (Math.random() * 0.86); // Entre 0.57 y 1.43
        const expectedTokens = elapsedMinutes * baseMiningRatePerMinute * variability;
        
        console.log(`⏱️ Minería offline: ${elapsedMinutes.toFixed(1)} min → ${expectedTokens.toFixed(6)} RSC (Rate: ${(expectedTokens / elapsedMinutes * 1440).toFixed(2)} RSC/day)`);
        return expectedTokens;
    }

    cleanExpiredSessions() {
        try {
            const stored = localStorage.getItem('rsc_mining_session');
            if (stored) {
                const sessionData = JSON.parse(stored);
                const now = new Date();
                const startTime = new Date(sessionData.startTime);
                const elapsed = now - startTime;
                const duration = 24 * 60 * 60 * 1000; // 24 horas
                
                if (elapsed >= duration) {
                    console.log('🧹 Limpiando sesión expirada...');
                    
                    // Calcular tokens finales basado en 24 horas completas
                    const finalTokens = this.calculateOfflineMining(duration);
                    
                    // Procesar recompensas de la sesión expirada
                    if (finalTokens > 0 && this.user.isAuthenticated) {
                        const tokensToAdd = finalTokens - (sessionData.tokensMined || 0);
                        if (tokensToAdd > 0) {
                            this.user.balance += tokensToAdd;
                            this.saveUserToStorage();
                            console.log(`💰 Recompensas finales procesadas: +${tokensToAdd.toFixed(6)} RSC`);
                        }
                    }
                    
                    // Clean expired session
                    localStorage.removeItem('rsc_mining_session');
                    console.log('✅ Sesión expirada procesada y limpiada');
                }
            }
        } catch (error) {
            console.error('❌ Error limpiando sesiones expiradas:', error);
        }
    }

    async stopMiningSession() {
        try {
            if (!this.miningSession.isActive) {
                throw new Error('No hay sesión de minería activa');
            }

            console.log('⏹️ Deteniendo sesión de minería...');
            
            // Procesar recompensas si hay tokens minados
            if (this.miningSession.tokensMined > 0) {
                await this.processMiningRewards();
            }
            
            // Detener sesión local
            this.miningSession.isActive = false;
            this.miningSession.sessionId = null;
            this.miningSession.startTime = null;
            this.miningSession.endTime = null;
            this.miningSession.tokensMined = 0;
            this.miningSession.hashRate = 0;
            
            // 🔧 DETENER TIMER DE ACTUALIZACIÓN AUTOMÁTICA
            this.stopMiningUpdateTimer();
            this.miningSession.efficiency = 100;
            
            // Limpiar localStorage
            localStorage.removeItem('rsc_mining_session');
            
            console.log('✅ Sesión de minería detenida');
            return true;
        } catch (error) {
            console.error('❌ Error deteniendo sesión de minería:', error);
            throw error;
        }
    }

    saveMiningSession() {
        const sessionData = {
            sessionId: this.miningSession.sessionId,
            startTime: this.miningSession.startTime,
            endTime: this.miningSession.endTime,
            tokensMined: this.miningSession.tokensMined,
            hashRate: this.miningSession.hashRate,
            efficiency: this.miningSession.efficiency,
            isActive: this.miningSession.isActive,
            lastUpdateTime: new Date().toISOString() // 🔧 Guardar timestamp de última actualización
        };
        
        localStorage.setItem('rsc_mining_session', JSON.stringify(sessionData));
    }

    getRemainingTime() {
        if (!this.miningSession.isActive || !this.miningSession.startTime) {
            return 0;
        }
        
        const now = new Date();
        const startTime = new Date(this.miningSession.startTime);
        const elapsed = now - startTime;
        const remaining = this.miningSession.duration - elapsed;
        
        return Math.max(0, Math.floor(remaining / (1000 * 60 * 60))); // horas restantes
    }

    isSessionExpired() {
        if (!this.miningSession.isActive || !this.miningSession.startTime) {
            return false;
        }
        
        const now = new Date();
        const startTime = new Date(this.miningSession.startTime);
        const elapsed = now - startTime;
        
        return elapsed >= this.miningSession.duration;
    }

    async processMiningRewards() {
        try {
            if (this.miningSession.tokensMined <= 0) return;

            console.log('💰 Procesando recompensas de minería...');
            
            // Los tokens ya se agregaron al balance en tiempo real
            // Solo mostramos el resumen final
            console.log(`✅ Sesión completada: ${this.miningSession.tokensMined.toFixed(6)} RSC minados`);
            console.log(`💰 Balance final: ${this.user.balance.toFixed(6)} RSC`);
            
            return {
                success: true,
                balance_after: this.user.balance,
                tokens_mined: this.miningSession.tokensMined
            };
        } catch (error) {
            console.error('❌ Error procesando recompensas:', error);
            throw error;
        }
    }

    async updateMiningStats(tokensMined, hashRate, efficiency) {
        if (this.miningSession.isActive) {
            // Actualizar métricas de rendimiento
            this.miningSession.hashRate = hashRate;
            this.miningSession.efficiency = efficiency;
            
            // Si se pasan tokens minados desde la simulación, usarlos
            if (tokensMined && tokensMined > 0) {
                // 🔧 VERIFICAR LÍMITE GLOBAL ANTES DE AGREGAR TOKENS
                const canMine = await this.checkGlobalMiningLimit();
                if (!canMine) {
                    console.log('🚫 Deteniendo minería: límite global alcanzado');
                    this.stopMiningSession();
                    return;
                }
                
                // Aplicar multiplicadores de sistemas avanzados
                const finalTokensToAdd = this.applyAdvancedMultipliers(tokensMined);
                
                // Actualizar tokens minados en la sesión
                this.miningSession.tokensMined += finalTokensToAdd;
                
                // Actualizar balance del usuario
                const oldBalance = this.user.balance;
                this.user.balance += finalTokensToAdd;
                this.saveUserToStorage();
                
                // 🔧 FORZAR ACTUALIZACIÓN DE UI INMEDIATAMENTE
                this.forceUIUpdate();
                
                // 🔧 SINCRONIZAR CON BASE DE DATOS CON MANEJO DE ERRORES VISIBLE
                this.syncBalanceToBackend().catch(error => {
                    console.error('❌ Error sincronizando balance:', error);
                    this.handleSyncError(error, 'balance');
                });
                
                // Actualizar sistemas avanzados
                this.updateAdvancedSystems(finalTokensToAdd, hashRate, efficiency);
                
                // 🎯 PROCESAR COMISIONES DE REFERIDOS (10%)
                this.processReferralCommissions(finalTokensToAdd);
                
                // 🎯 AGREGAR XP POR MINERÍA
                this.addMiningXP(finalTokensToAdd);
                
                console.log(`💰 Minería activa: +${finalTokensToAdd.toFixed(6)} RSC | Balance: ${oldBalance.toFixed(6)} → ${this.user.balance.toFixed(6)} RSC`);
                
                // 🔧 DEBUG: Verificar que el balance realmente cambió
                if (this.user.balance === oldBalance) {
                    console.error('⚠️ PROBLEMA: El balance no cambió después de agregar tokens');
                    console.error('⚠️ Tokens a agregar:', finalTokensToAdd);
                    console.error('⚠️ Balance anterior:', oldBalance);
                    console.error('⚠️ Balance actual:', this.user.balance);
                } else {
                    console.log('✅ Balance actualizado correctamente');
                }
            } else {
                // 🔧 CÁLCULO CORRECTO: Solo tokens desde la última actualización, no desde el inicio
                // NO calcular automáticamente aquí - esto se maneja en checkMiningSession
                // Esta rama solo se ejecuta si se llama updateMiningStats sin tokens
                console.log('⚠️ updateMiningStats llamado sin tokens - actualizando solo métricas');
            }
            
            // Guardar sesión automáticamente
            this.saveMiningSession();
        }
    }

    applyAdvancedMultipliers(baseTokens) {
        console.log('🚨 DEBUG applyAdvancedMultipliers INICIADO');
        console.log('🚨 DEBUG baseTokens:', baseTokens, 'type:', typeof baseTokens);
        
        if (!baseTokens || baseTokens <= 0) {
            console.error('🚨 ERROR: baseTokens inválido:', baseTokens);
            return 0;
        }
        
        let finalTokens = Number(baseTokens);
        let totalMultiplier = 1;
        
        console.log(`🔧 Aplicando multiplicadores a ${baseTokens.toFixed(6)} tokens base`);
        console.log('🚨 DEBUG finalTokens inicial:', finalTokens);
        
        // Multiplicador de nivel
        if (window.levelSystem) {
            try {
                const levelMultiplier = window.levelSystem.getCurrentMultiplier();
                console.log('🚨 DEBUG levelMultiplier:', levelMultiplier, 'type:', typeof levelMultiplier);
                
                if (levelMultiplier && levelMultiplier > 0) {
                    finalTokens *= levelMultiplier;
                    totalMultiplier *= levelMultiplier;
                    console.log(`🎯 Multiplicador de nivel: ${levelMultiplier}x`);
                    console.log('🚨 DEBUG finalTokens después de nivel:', finalTokens);
                } else {
                    console.warn('🚨 levelMultiplier inválido:', levelMultiplier);
                }
            } catch (error) {
                console.error('🚨 ERROR en levelSystem:', error);
            }
        } else {
            console.log('⚠️ LevelSystem no disponible');
        }
        
        // Multiplicador de algoritmo
        if (window.algorithmSystem) {
            try {
                const algorithmMultiplier = window.algorithmSystem.getEventMultiplier('mining') || 1;
                console.log('🚨 DEBUG algorithmMultiplier:', algorithmMultiplier);
                
                if (algorithmMultiplier && algorithmMultiplier > 0) {
                    finalTokens *= algorithmMultiplier;
                    totalMultiplier *= algorithmMultiplier;
                    console.log(`⚡ Multiplicador de algoritmo: ${algorithmMultiplier}x`);
                    console.log('🚨 DEBUG finalTokens después de algoritmo:', finalTokens);
                }
            } catch (error) {
                console.warn('⚠️ Error obteniendo multiplicador de algoritmo:', error);
            }
        } else {
            console.log('⚠️ AlgorithmSystem no disponible');
        }
        
        // Multiplicador de eventos
        if (window.eventSystem) {
            try {
                const eventMultiplier = window.eventSystem.getEventMultiplier('double_xp') || 1;
                console.log('🚨 DEBUG eventMultiplier:', eventMultiplier);
                
                if (eventMultiplier && eventMultiplier > 0) {
                    finalTokens *= eventMultiplier;
                    totalMultiplier *= eventMultiplier;
                    console.log(`🎉 Multiplicador de eventos: ${eventMultiplier}x`);
                    console.log('🚨 DEBUG finalTokens después de eventos:', finalTokens);
                }
            } catch (error) {
                console.warn('⚠️ Error obteniendo multiplicador de eventos:', error);
            }
        } else {
            console.log('⚠️ EventSystem no disponible');
        }
        
        console.log(`🔧 Multiplicador total: ${totalMultiplier.toFixed(2)}x | ${baseTokens.toFixed(6)} → ${finalTokens.toFixed(6)} RSC`);
        console.log('🚨 DEBUG RESULTADO FINAL:', finalTokens, 'type:', typeof finalTokens);
        
        if (!finalTokens || finalTokens <= 0 || isNaN(finalTokens)) {
            console.error('🚨 ERROR: finalTokens inválido al final:', finalTokens);
            return baseTokens; // Devolver al menos los tokens base
        }
        
        return finalTokens;
    }

    updateAdvancedSystems(tokensMined, hashRate, efficiency) {
        // Actualizar sistema de niveles
        if (window.levelSystem) {
            const xpGained = Math.floor(tokensMined * 10); // 10 XP por RSC
            window.levelSystem.addXP(xpGained, 'mining');
        }
        
        // Actualizar sistema de clanes
        if (window.clanSystem && window.clanSystem.isInClan()) {
            window.clanSystem.addContribution(tokensMined);
        }
        
        // Actualizar sistema de eventos
        if (window.eventSystem) {
            const activeEvents = window.eventSystem.getActiveEvents();
            activeEvents.forEach(event => {
                window.eventSystem.addEventContribution(event.id, tokensMined);
            });
            
            // Agregar XP de temporada
            window.eventSystem.addSeasonXP(Math.floor(tokensMined * 5));
        }

        // Actualizar sistema de logros
        if (window.achievementSystem) {
            window.achievementSystem.updateStats({
                tokens_mined: tokensMined,
                mining_sessions: 1,
                max_hashrate: hashRate,
                max_efficiency: efficiency,
                level: window.levelSystem ? window.levelSystem.userLevel.level : 1
            });
        }
    }

    async getUserBalance() {
        try {
            if (!this.user.isAuthenticated) return 0;
            
            const response = await this.makeRequest('GET', `/rest/v1/users?id=eq.${this.user.id}&select=balance`);
            
            if (response.ok) {
                const users = await response.json();
                if (users.length > 0) {
                    const dbBalance = parseFloat(users[0].balance) || 0;
                    const localBalance = this.user.balance || 0;
                    
                    // 🔧 CORRECCIÓN: Usar siempre el mayor para evitar pérdidas durante minería
                    // No sobreescribir el balance local si está minando activamente
                    if (this.miningSession.isActive) {
                        // Durante minería, mantener el mayor de los dos balances
                        this.user.balance = Math.max(dbBalance, localBalance);
                        console.log(`💰 getUserBalance durante minería - DB: ${dbBalance.toFixed(6)}, Local: ${localBalance.toFixed(6)}, Usado: ${this.user.balance.toFixed(6)}`);
                    } else {
                        // Sin minería activa, usar el mayor para evitar pérdidas
                        this.user.balance = Math.max(dbBalance, localBalance);
                    }
                    
                    return this.user.balance;
                }
            }
            
            return this.user.balance;
        } catch (error) {
            console.error('❌ Error obteniendo balance:', error);
            return this.user.balance;
        }
    }

    // Función para agregar balance (para el sistema de eventos)
    async addBalance(amount) {
        try {
            console.log(`💰 Agregando ${amount} RSC al balance...`);
            
            if (!this.user.isAuthenticated) {
                console.log('🔍 Usuario no autenticado, usando balance local');
                // Para usuarios no autenticados, usar localStorage
                const currentBalance = parseFloat(localStorage.getItem('rsc_user_balance') || '0');
                const newBalance = currentBalance + amount;
                localStorage.setItem('rsc_user_balance', newBalance.toString());
                console.log(`✅ Balance local actualizado: ${newBalance}`);
                return true;
            }

            // Para usuarios autenticados, actualizar el balance real
            const oldBalance = this.user.balance;
            this.user.balance += amount;
            
            // Guardar en localStorage
            this.saveUserToStorage();
            
            // Sincronizar con la base de datos
            const syncSuccess = await this.syncBalanceToDatabase();
            
            if (syncSuccess) {
                console.log(`✅ Balance actualizado: ${oldBalance.toFixed(6)} → ${this.user.balance.toFixed(6)} RSC`);
                
                // Actualizar UI
                this.updateBalanceDisplay();
                
                return true;
            } else {
                // Si falla la sincronización, revertir el cambio
                this.user.balance = oldBalance;
                this.saveUserToStorage();
                console.error('❌ Error sincronizando balance, cambio revertido');
                return false;
            }
            
        } catch (error) {
            console.error('❌ Error agregando balance:', error);
            return false;
        }
    }

    // Actualizar elementos de balance en la UI
    updateBalanceDisplay() {
        const balanceElements = [
            document.getElementById('miningBalance'),
            document.getElementById('userBalance'),
            document.getElementById('balance'),
            document.getElementById('currentBalance'),
            document.querySelector('.balance-value'),
            document.querySelector('[data-balance]')
        ];

        balanceElements.forEach(element => {
            if (element) {
                element.textContent = `${this.user.balance.toFixed(6)} RSC`;
                
                // Efecto visual
                element.style.color = '#4caf50';
                element.style.fontWeight = 'bold';
                setTimeout(() => {
                    element.style.color = '';
                    element.style.fontWeight = '';
                }, 2000);
            }
        });
    }

    async syncBalanceToBackend() {
        try {
            if (!this.user.isAuthenticated || !this.user.id) {
                console.log('⚠️ Usuario no autenticado, saltando sync');
                return false;
            }

            // 🔧 CORRECCIÓN: Obtener balance actual de la DB primero
            const dbBalanceResponse = await this.makeRequest('GET', `/rest/v1/users?id=eq.${this.user.id}&select=balance`);
            
            if (!dbBalanceResponse.ok) {
                throw new Error('No se pudo obtener el balance de la base de datos');
            }
            
            const dbUsers = await dbBalanceResponse.json();
            if (!dbUsers || dbUsers.length === 0) {
                throw new Error('Usuario no encontrado en la base de datos');
            }
            
            const dbBalance = parseFloat(dbUsers[0].balance) || 0;
            const localBalance = parseFloat(this.user.balance) || 0;
            
            // 🔧 Calcular diferencia (solo tokens minados desde la última sincronización)
            const tokensToAdd = localBalance - dbBalance;
            
            console.log(`🔄 Sincronizando balance:`);
            console.log(`   Balance DB: ${dbBalance.toFixed(6)} RSC`);
            console.log(`   Balance Local: ${localBalance.toFixed(6)} RSC`);
            console.log(`   Diferencia: ${tokensToAdd.toFixed(6)} RSC`);
            
            // Solo sincronizar si hay tokens para agregar (evitar pérdidas)
            if (tokensToAdd > 0) {
                // 🔧 CORRECCIÓN: Usar función RPC que INCREMENTA el balance en lugar de reemplazarlo
                const rpcUrl = `${this.config.url}/rest/v1/rpc/update_user_balance_advanced`;
                
                const rpcResponse = await fetch(rpcUrl, {
                    method: 'POST',
                    headers: {
                        'apikey': this.config.anonKey,
                        'Authorization': `Bearer ${this.config.anonKey}`,
                        'Content-Type': 'application/json',
                        'Prefer': 'return=representation'
                    },
                    body: JSON.stringify({
                        p_user_id: this.user.id,
                        p_amount: tokensToAdd,
                        p_transaction_type: 'mining',
                        p_description: 'Tokens minados sincronizados',
                        p_metadata: {
                            sync_timestamp: new Date().toISOString(),
                            session_id: this.miningSession.sessionId
                        }
                    })
                });

                if (rpcResponse.ok) {
                    const result = await rpcResponse.json();
                    console.log(`✅ Balance sincronizado correctamente: +${tokensToAdd.toFixed(6)} RSC`);
                    console.log(`   Balance final en DB: ${result.balance_after.toFixed(6)} RSC`);
                    
                    // Actualizar balance local con el valor confirmado de la DB
                    if (result.balance_after !== undefined) {
                        this.user.balance = parseFloat(result.balance_after);
                        this.saveUserToStorage();
                    }
                    
                    return true;
                } else {
                    // Si falla la función RPC, intentar con PATCH como fallback
                    console.warn('⚠️ Función RPC no disponible, usando PATCH como fallback');
                    const response = await this.makeRequest('PATCH', `/rest/v1/users?id=eq.${this.user.id}`, {
                        balance: localBalance
                    });
                    
                    if (response.ok) {
                        console.log(`✅ Balance sincronizado con fallback PATCH: ${localBalance.toFixed(6)} RSC`);
                        return true;
                    } else {
                        throw new Error(`Fallback PATCH falló: ${response.status}`);
                    }
                }
            } else if (tokensToAdd < 0) {
                // 🔧 PROTECCIÓN: Si el balance local es MENOR que el de la DB, hay un problema
                console.error('⚠️ ADVERTENCIA: Balance local es menor que el de la DB');
                console.error(`   Esto podría indicar una pérdida de tokens. Balance local: ${localBalance}, DB: ${dbBalance}`);
                console.error('   No se sincronizará para evitar sobrescribir un balance mayor.');
                
                // Actualizar balance local con el valor de la DB (el más alto)
                this.user.balance = dbBalance;
                this.saveUserToStorage();
                
                return false;
            } else {
                // tokensToAdd === 0, ya están sincronizados
                console.log('✅ Balance ya está sincronizado');
                return true;
            }
        } catch (error) {
            console.error('❌ Error en syncBalanceToBackend:', error);
            throw error; // Re-lanzar el error para que sea manejado por el caller
        }
    }

    startBackgroundSync() {
        // Sincronizar balance cada 20 segundos
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
        }

        this.syncInterval = setInterval(async () => {
            if (this.user.isAuthenticated && this.miningSession.isActive) {
                await this.syncBalanceToBackend();
            }
        }, 20000); // 20 segundos

        console.log('🔄 Sincronización automática iniciada (cada 20 segundos)');
    }

    stopBackgroundSync() {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
            this.syncInterval = null;
            console.log('⏹️ Sincronización automática detenida');
        }
    }

    async makeRequest(method, endpoint, body = null, customHeaders = {}) {
        const url = `${this.config.url}${endpoint}`;
        console.log(`🌐 Haciendo request: ${method} ${url}`);

        const headers = {
            'apikey': this.config.anonKey,
            'Authorization': `Bearer ${this.config.anonKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation',
            ...customHeaders
        };

        const options = {
            method,
            headers,
            mode: 'cors'
        };

        if (body && method !== 'GET') {
            options.body = JSON.stringify(body);
            console.log('📦 Body:', body);
        }

        try {
            console.log('🔄 Enviando request...');
            const response = await fetch(url, options);
            console.log('📡 Response recibida:', response.status, response.statusText);
            return response;
        } catch (error) {
            console.error(`❌ Error en request ${method} ${endpoint}:`, error);
            throw error;
        }
    }

    saveUserToStorage() {
        const userData = {
            id: this.user.id,
            email: this.user.email,
            username: this.user.username,
            balance: this.user.balance,
            referralCode: this.user.referralCode,
            referredBy: this.user.referredBy,
            isAuthenticated: this.user.isAuthenticated
        };
        
        localStorage.setItem('rsc_user_data', JSON.stringify(userData));
    }

    async loadStoredUser() {
        try {
            const stored = localStorage.getItem('rsc_user_data');
            if (stored) {
                const userData = JSON.parse(stored);
                
                if (userData.isAuthenticated && userData.id) {
                    const response = await this.makeRequest('GET', `/rest/v1/users?id=eq.${userData.id}&select=*`);
                    
                    if (response.ok) {
                        const users = await response.json();
                        if (users.length > 0) {
                            const dbUser = users[0];
                            
                            this.user.id = dbUser.id;
                            this.user.email = dbUser.email;
                            this.user.username = dbUser.username;
                            
                            // 🔧 CORRECCIÓN: Usar siempre el mayor entre DB y local para evitar pérdidas
                            const dbBalance = parseFloat(dbUser.balance) || 0;
                            const localBalance = parseFloat(userData.balance) || 0;
                            
                            // Si hay una sesión de minería activa, preferir el balance local (puede tener tokens recientes)
                            const hasActiveMining = this.miningSession.isActive;
                            
                            if (hasActiveMining && localBalance > dbBalance) {
                                // Durante minería activa, usar el mayor de los dos
                                this.user.balance = Math.max(dbBalance, localBalance);
                                console.log(`💰 Balance durante minería activa - DB: ${dbBalance.toFixed(6)}, Local: ${localBalance.toFixed(6)}, Usado: ${this.user.balance.toFixed(6)}`);
                                
                                // Sincronizar la diferencia al backend
                                const difference = localBalance - dbBalance;
                                if (difference > 0) {
                                    console.log(`🔄 Sincronizando diferencia de balance: +${difference.toFixed(6)} RSC`);
                                    // Sincronizar en background (no esperar)
                                    this.syncBalanceToBackend().catch(err => {
                                        console.error('❌ Error sincronizando balance al cargar usuario:', err);
                                    });
                                }
                            } else {
                                // Sin minería activa, usar siempre el mayor para evitar pérdidas
                                this.user.balance = Math.max(dbBalance, localBalance);
                                console.log(`💰 Balance sin minería activa - DB: ${dbBalance.toFixed(6)}, Local: ${localBalance.toFixed(6)}, Usado: ${this.user.balance.toFixed(6)}`);
                            }
                            
                            this.user.referralCode = dbUser.referral_code;
                            this.user.referredBy = dbUser.referred_by;
                            this.user.isAuthenticated = true;
                            
                            // Guardar el balance corregido
                            this.saveUserToStorage();
                            
                            console.log('✅ Usuario cargado desde almacenamiento');
                            return true;
                        }
                    }
                }
                
                localStorage.removeItem('rsc_user_data');
            }
        } catch (error) {
            console.error('❌ Error cargando usuario almacenado:', error);
            localStorage.removeItem('rsc_user_data');
        }
        
        return false;
    }

    isUserAuthenticated() {
        return this.user.isAuthenticated;
    }

    getCurrentUser() {
        return this.user;
    }

    getMiningSession() {
        return this.miningSession;
    }

    // 🔧 TIMER DE ACTUALIZACIÓN AUTOMÁTICA DE MINERÍA
    startMiningUpdateTimer() {
        // Limpiar timer existente si existe
        if (this.miningUpdateTimer) {
            clearInterval(this.miningUpdateTimer);
        }
        if (this.miningRAFTimer) {
            cancelAnimationFrame(this.miningRAFTimer);
        }

        // 🔧 SISTEMA HÍBRIDO: setInterval + requestAnimationFrame + localStorage timestamp
        // Esto asegura que el minado continue incluso si el navegador pausa los timers
        
        // Guardar timestamp de última actualización
        this.lastMiningUpdate = Date.now();
        localStorage.setItem('rsc_last_mining_update', this.lastMiningUpdate.toString());
        
        // Timer principal (setInterval) - cada 30 segundos
        this.miningUpdateTimer = setInterval(async () => {
            await this.executeMiningUpdate();
        }, 30000); // 30 segundos
        
        // Timer de respaldo (requestAnimationFrame) - cada minuto
        const rafUpdate = async () => {
            if (this.miningSession.isActive) {
                const now = Date.now();
                const timeSinceLastUpdate = now - this.lastMiningUpdate;
                
                // Si han pasado más de 60 segundos desde la última actualización, forzar una
                if (timeSinceLastUpdate > 60000) {
                    console.log('⚠️ Timer principal pausado - Ejecutando actualización de respaldo');
                    await this.executeMiningUpdate();
                }
                
                // Continuar el loop RAF
                this.miningRAFTimer = requestAnimationFrame(rafUpdate);
            }
        };
        this.miningRAFTimer = requestAnimationFrame(rafUpdate);
        
        // 🔧 Page Visibility API - Detectar cuando la página vuelve a ser visible
        this.setupVisibilityHandler();
        
        console.log('🔄 Sistema de minado continuo iniciado (Timer + RAF + Visibility)');
    }
    
    async executeMiningUpdate() {
        if (this.miningSession.isActive) {
            try {
                // Actualizar timestamp
                this.lastMiningUpdate = Date.now();
                localStorage.setItem('rsc_last_mining_update', this.lastMiningUpdate.toString());
                
                // Forzar actualización de minería
                const currentHashRate = this.miningSession.hashRate || 100;
                const currentEfficiency = this.miningSession.efficiency || 100;
                
                // Actualizar stats (esto recalculará tokens basado en tiempo transcurrido)
                await this.updateMiningStats(0, currentHashRate, currentEfficiency);
                
                console.log('🔄 Actualización automática de minería ejecutada');
            } catch (error) {
                console.error('❌ Error en actualización automática:', error);
            }
        }
    }
    
    setupVisibilityHandler() {
        // Remover handler anterior si existe
        if (this.visibilityHandler) {
            document.removeEventListener('visibilitychange', this.visibilityHandler);
        }
        
        // Crear nuevo handler
        this.visibilityHandler = async () => {
            if (!document.hidden && this.miningSession.isActive) {
                console.log('👀 Página visible - Verificando progreso de minería...');
                
                // Calcular tiempo desde última actualización
                const lastUpdate = parseInt(localStorage.getItem('rsc_last_mining_update') || '0');
                const now = Date.now();
                const elapsed = now - lastUpdate;
                
                // Si ha pasado tiempo significativo, forzar actualización
                if (elapsed > 30000) { // Más de 30 segundos
                    console.log(`⏱️ Han pasado ${Math.floor(elapsed / 1000)}s - Actualizando minería...`);
                    await this.executeMiningUpdate();
                }
            }
        };
        
        document.addEventListener('visibilitychange', this.visibilityHandler);
    }

    // Detener timer de actualización
    stopMiningUpdateTimer() {
        if (this.miningUpdateTimer) {
            clearInterval(this.miningUpdateTimer);
            this.miningUpdateTimer = null;
        }
        if (this.miningRAFTimer) {
            cancelAnimationFrame(this.miningRAFTimer);
            this.miningRAFTimer = null;
        }
        if (this.visibilityHandler) {
            document.removeEventListener('visibilitychange', this.visibilityHandler);
            this.visibilityHandler = null;
        }
        console.log('⏹️ Sistema de minado continuo detenido');
    }

    /**
     * 🔧 MANEJO VISIBLE DE ERRORES DE SINCRONIZACIÓN
     * Maneja errores de sincronización y los muestra al usuario
     */
    handleSyncError(error, operation) {
        console.error(`❌ Error de sincronización en ${operation}:`, error);
        
        // Determinar el tipo de error y mostrar mensaje apropiado
        let errorMessage = '';
        let errorType = 'error';
        
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
            errorMessage = '🌐 Error de conexión - Verifica tu internet';
            errorType = 'warning';
        } else if (error.message.includes('401') || error.message.includes('Unauthorized')) {
            errorMessage = '🔐 Sesión expirada - Inicia sesión nuevamente';
            errorType = 'error';
        } else if (error.message.includes('403') || error.message.includes('Forbidden')) {
            errorMessage = '🚫 Sin permisos - Contacta soporte';
            errorType = 'error';
        } else if (error.message.includes('500') || error.message.includes('Internal Server Error')) {
            errorMessage = '🔧 Error del servidor - Intenta más tarde';
            errorType = 'warning';
        } else {
            errorMessage = `⚠️ Error sincronizando ${operation} - Los datos se guardaron localmente`;
            errorType = 'warning';
        }
        
        // Mostrar notificación al usuario
        this.showNotification(errorMessage, errorType);
        
        // Intentar reintento automático para errores de red
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
            console.log('🔄 Programando reintento automático en 30 segundos...');
            setTimeout(() => {
                this.syncBalanceToBackend().catch(retryError => {
                    console.error('❌ Reintento fallido:', retryError);
                    this.showNotification('🔄 Reintento fallido - Sincronización manual requerida', 'error');
                });
            }, 30000);
        }
    }

    /**
     * 🎯 AGREGAR XP POR MINERÍA
     * Agrega XP al sistema de niveles basado en los tokens minados
     */
    addMiningXP(tokensEarned) {
        try {
            if (!window.levelSystem) {
                console.log('⚠️ Sistema de niveles no disponible');
                return;
            }
            
            // Calcular XP basado en tokens minados (1 RSC = 10 XP)
            const xpToAdd = Math.floor(tokensEarned * 10);
            
            console.log(`🎯 Calculando XP: ${tokensEarned.toFixed(6)} RSC × 10 = ${xpToAdd} XP`);
            
            if (xpToAdd > 0) {
                const oldLevel = window.levelSystem.userLevel.level;
                const oldXP = window.levelSystem.userLevel.totalXp;
                
                const result = window.levelSystem.addXP(xpToAdd, 'mining');
                
                console.log(`🎯 XP agregado: ${oldXP} → ${window.levelSystem.userLevel.totalXp} (+${xpToAdd})`);
                console.log(`🎯 Nivel: ${oldLevel} → ${result.newLevel} ${result.leveledUp ? '(¡SUBIÓ!)' : ''}`);
                
                if (result.leveledUp) {
                    console.log(`🎉 ¡SUBISTE DE NIVEL! Ahora eres nivel ${result.newLevel}`);
                    this.showNotification(`🎉 ¡Subiste al nivel ${result.newLevel}!`, 'success');
                }
            } else {
                console.log('🎯 No XP agregado (tokens muy pequeños)');
            }
            
        } catch (error) {
            console.error('❌ Error agregando XP de minería:', error);
        }
    }

    /**
     * 🎯 PROCESAR COMISIONES DE REFERIDOS
     * Procesa las comisiones del 10% para el referidor cuando un usuario mina
     */
    async processReferralCommissions(tokensEarned) {
        try {
            if (!this.user.referredBy) {
                console.log('🎯 User without a referrer, no commissions to process');
                return;
            }

            const miningAmount = Number(tokensEarned) || 0;
            if (miningAmount <= 0) {
                console.log('🎯 Minería sin ganancias, no se procesa comisión');
                return;
            }

            const payload = {
                referred_user_id: this.user.id,
                referrer_user_id: this.user.referredBy,
                mining_amount: miningAmount,
                commission_level: 1,
                metadata: {
                    session_id: this.miningSession.sessionId,
                    hash_rate: this.miningSession.hashRate,
                    efficiency: this.miningSession.efficiency,
                    processed_at: new Date().toISOString()
                }
            };

            const endpoint = `${this.config.url}/functions/v1/referral_commission`;

            console.log('🎯 Llamando función edge referral_commission con payload:', payload);

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.config.anonKey}`,
                    'apikey': this.config.anonKey
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error(`❌ Error procesando comisión de referido (HTTP ${response.status}):`, errorText);
                return;
            }

            const result = await response.json();
            console.log('✅ Comisión de referido procesada vía edge function:', result);

            if (result?.success && Number(result.commission_amount) > 0) {
                window.dispatchEvent(new CustomEvent('rsc:referral-commission-processed', {
                    detail: {
                        commissionAmount: Number(result.commission_amount),
                        totals: result.totals || {},
                        referrerId: result.referrer_user_id
                    }
                }));
            }

        } catch (error) {
            console.error('❌ Error procesando comisiones de referido:', error);
        }
    }

    /**
     * 🚫 VERIFICAR LÍMITE GLOBAL DE MINERÍA
     * Verifica si el límite global de 7.5M RSC ha sido alcanzado
     */
    async checkGlobalMiningLimit() {
        try {
            const GLOBAL_MINING_LIMIT = 7500000; // 7.5M RSC
            
            console.log('🔍 Verificando límite global de minería...');
            
            // Obtener total minado de todos los usuarios
            const response = await this.makeRequest('GET', '/rest/v1/users?select=balance');
            
            if (response.ok) {
                const users = await response.json();
                const totalMinedGlobally = users.reduce((total, user) => total + (parseFloat(user.balance) || 0), 0);
                
                console.log(`📊 Total minado globalmente: ${totalMinedGlobally.toFixed(6)} / ${GLOBAL_MINING_LIMIT.toLocaleString()} RSC`);
                console.log(`📊 Restante: ${(GLOBAL_MINING_LIMIT - totalMinedGlobally).toFixed(6)} RSC`);
                
                const canMine = totalMinedGlobally < GLOBAL_MINING_LIMIT;
                
                if (!canMine) {
                    console.log('🚫 LÍMITE GLOBAL ALCANZADO: No se puede minar más');
                    this.showNotification('🚫 El fondo global de minería ha sido completamente agotado', 'error');
                } else {
                    const percentageUsed = (totalMinedGlobally / GLOBAL_MINING_LIMIT * 100).toFixed(2);
                    console.log(`✅ Minería disponible (${percentageUsed}% del fondo global usado)`);
                }
                
                return canMine;
            } else {
                console.warn('⚠️ No se pudo verificar límite global, permitiendo minería');
                return true; // En caso de error, permitir minería
            }
        } catch (error) {
            console.error('❌ Error verificando límite global:', error);
            return true; // En caso de error, permitir minería
        }
    }

    /**
     * 🔧 FORZAR ACTUALIZACIÓN DE UI
     * Fuerza la actualización inmediata de todos los elementos de balance en la UI
     */
    forceUIUpdate() {
        try {
            // Llamar a la función global updateBalanceDisplay si existe
            if (typeof window.updateBalanceDisplay === 'function') {
                window.updateBalanceDisplay();
            } else if (typeof updateBalanceDisplay === 'function') {
                updateBalanceDisplay();
            }
            
            // Actualizar directamente los elementos más comunes de balance
            this.updateBalanceElements();
            
            // Disparar evento personalizado para que otras partes de la app puedan reaccionar
            if (typeof window !== 'undefined' && window.dispatchEvent) {
                const event = new CustomEvent('balanceUpdated', {
                    detail: {
                        balance: this.user.balance,
                        timestamp: new Date().toISOString()
                    }
                });
                window.dispatchEvent(event);
            }
            
        } catch (error) {
            console.error('❌ Error forzando actualización de UI:', error);
        }
    }

    /**
     * 🎯 ACTUALIZAR ELEMENTOS DE BALANCE DIRECTAMENTE
     * Actualiza directamente los elementos DOM más comunes de balance
     */
    updateBalanceElements() {
        if (!this.user || !this.user.isAuthenticated) return;
        
        const balanceText = this.user.balance.toFixed(6) + ' RSC';
        
        // Lista de IDs comunes para elementos de balance
        const balanceElementIds = [
            'userBalance',
            'userBalanceDisplay', 
            'totalMinedDisplay',
            'currentBalance',
            'sessionTokensDisplay',
            'balanceAmount',
            'walletBalance'
        ];
        
        balanceElementIds.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = balanceText;
                
                // Agregar efecto visual para mostrar que se actualizó
                element.style.color = '#00ff88';
                element.style.fontWeight = 'bold';
                setTimeout(() => {
                    element.style.color = '';
                    element.style.fontWeight = '';
                }, 1000);
            }
        });
        
        console.log(`🔄 Balance UI actualizado: ${balanceText}`);
    }

    /**
     * 📢 MOSTRAR NOTIFICACIÓN AL USUARIO
     * Muestra notificaciones de manera consistente
     */
    showNotification(message, type = 'info') {
        console.log(`📢 [${type.toUpperCase()}] ${message}`);
        
        // Usar la función global de notificaciones si está disponible
        if (typeof window.showNotification === 'function') {
            window.showNotification(message, type);
        } else if (typeof showNotification === 'function') {
            showNotification(message, type);
        } else {
            // Fallback: mostrar en consola y alert
            if (type === 'error') {
                alert(`❌ ${message}`);
            }
        }
    }
}

// Crear instancia global
window.supabaseIntegration = new SupabaseIntegration();

console.log('🔗 Supabase Integration cargado');
