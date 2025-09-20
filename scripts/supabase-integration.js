/* ================================
   SUPABASE INTEGRATION - SIMPLE
================================ */

/**
 * 🔗 INTEGRACIÓN SIMPLE CON SUPABASE
 * 
 * Se integra con el sistema existente de la página de minería
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
            console.log('🔗 Inicializando integración con Supabase...');
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
                console.log('✅ Conexión con Supabase establecida');
                return true;
            } else {
                throw new Error('Error de conexión con Supabase');
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
                    throw new Error('Este email ya está registrado. Inicia sesión en su lugar.');
                }
            }
            
            // Hash simple de la contraseña (en producción usar bcrypt)
            const hashedPassword = btoa(password); // Base64 encoding simple
            
            const response = await this.makeRequest('POST', '/rest/v1/users', {
                email: email,
                username: username,
                password: hashedPassword,
                balance: 0,
                referral_code: this.generateReferralCode(),
                referred_by: referralCode || null
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

    async loginUser(email, password) {
        try {
            console.log('🔐 Iniciando sesión:', email);
            
            const response = await this.makeRequest('GET', `/rest/v1/users?email=eq.${email}&select=*`);
            
            if (response.ok) {
                const users = await response.json();
                
                if (users.length > 0) {
                    const userData = users[0];
                    
                    // Verificar contraseña
                    const storedPassword = userData.password;
                    const hashedInputPassword = btoa(password);
                    
                    if (storedPassword !== hashedInputPassword) {
                        throw new Error('Contraseña incorrecta');
                    }
                    
                    this.user.id = userData.id;
                    this.user.email = userData.email;
                    this.user.username = userData.username;
                    this.user.balance = parseFloat(userData.balance) || 0;
                    this.user.referralCode = userData.referral_code;
                    this.user.referredBy = userData.referred_by;
                    this.user.isAuthenticated = true;
                    
                    this.saveUserToStorage();
                    
                    console.log('✅ Sesión iniciada correctamente');
                    return userData;
                } else {
                    throw new Error('Email no registrado. Regístrate primero.');
                }
            } else {
                throw new Error('Error iniciando sesión');
            }
        } catch (error) {
            console.error('❌ Error iniciando sesión:', error);
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
        console.log('ℹ️ Sesión cerrada');
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
                
                console.log(`🔍 Verificando sesión existente...`);
                console.log(`📅 Inicio: ${startTime.toLocaleString()}`);
                console.log(`⏱️ Tiempo transcurrido: ${Math.floor(elapsed / 1000 / 60)} minutos`);
                
                if (elapsed < duration) {
                    // La sesión aún está activa - restaurar todos los datos
                    this.miningSession.isActive = true;
                    this.miningSession.sessionId = sessionData.sessionId;
                    this.miningSession.startTime = sessionData.startTime;
                    this.miningSession.endTime = sessionData.endTime;
                    this.miningSession.hashRate = sessionData.hashRate || 500;
                    this.miningSession.efficiency = sessionData.efficiency || 100;
                    
                    // Calcular tokens minados basado en tiempo transcurrido (minería en segundo plano)
                    const expectedTokens = this.calculateOfflineMining(elapsed);
                    this.miningSession.tokensMined = Math.max(sessionData.tokensMined || 0, expectedTokens);
                    
                    // Actualizar balance del usuario con la minería offline
                    const tokensToAdd = this.miningSession.tokensMined - (sessionData.tokensMined || 0);
                    if (tokensToAdd > 0) {
                        this.user.balance += tokensToAdd;
                        this.saveUserToStorage();
                        console.log(`⛏️ Minería offline: +${tokensToAdd.toFixed(6)} RSC`);
                    }
                    
                    // Guardar sesión actualizada
                    this.saveMiningSession();
                    
                    // Iniciar sincronización automática con el backend
                    this.startBackgroundSync();
                    
                    // 🔧 INICIAR TIMER DE ACTUALIZACIÓN AUTOMÁTICA
                    this.startMiningUpdateTimer();
                    
                    console.log('✅ Sesión de minería activa restaurada');
                    console.log(`💰 Tokens minados: ${this.miningSession.tokensMined.toFixed(6)} RSC`);
                    console.log(`⏰ Tiempo restante: ${this.getRemainingTime()} horas`);
                    
                    return true;
                } else {
                    // La sesión expiró - procesar recompensas y limpiar
                    console.log('⏰ Sesión de 24 horas completada - Procesando recompensas...');
                    
                    const tokensMined = sessionData.tokensMined || 0;
                    if (tokensMined > 0 && this.user.isAuthenticated) {
                        this.user.balance += tokensMined;
                        this.saveUserToStorage();
                        console.log(`💰 Recompensas finales procesadas: +${tokensMined.toFixed(6)} RSC`);
                    }
                    
                    // Limpiar sesión expirada
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
                console.log(`⏱️ Tiempo transcurrido: ${Math.floor(elapsed / 1000 / 60)} minutos`);
                
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
        // Tasa de minería: 0.00694 RSC por minuto (10 RSC por día)
        const miningRatePerMinute = 0.00694;
        const elapsedMinutes = elapsedTime / (1000 * 60);
        
        // Agregar algo de variabilidad para hacer más realista
        const variability = 0.8 + (Math.random() * 0.4); // Entre 0.8 y 1.2
        const expectedTokens = elapsedMinutes * miningRatePerMinute * variability;
        
        console.log(`⏱️ Minería offline: ${elapsedMinutes.toFixed(1)} min → ${expectedTokens.toFixed(6)} RSC`);
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
                    
                    // Limpiar sesión expirada
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
            isActive: this.miningSession.isActive
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

    updateMiningStats(tokensMined, hashRate, efficiency) {
        if (this.miningSession.isActive) {
            // Solo actualizar métricas de rendimiento, no tokens (se calculan por tiempo)
            this.miningSession.hashRate = hashRate;
            this.miningSession.efficiency = efficiency;
            
            // Recalcular tokens basado en tiempo transcurrido para mantener consistencia
            const now = new Date();
            const startTime = new Date(this.miningSession.startTime);
            const elapsed = now - startTime;
            const expectedTokens = this.calculateOfflineMining(elapsed);
            
            // Solo actualizar si el cálculo offline es mayor (para no perder progreso)
            if (expectedTokens > this.miningSession.tokensMined) {
                const tokensToAdd = expectedTokens - this.miningSession.tokensMined;
                this.miningSession.tokensMined = expectedTokens;
                
                // Aplicar multiplicadores de sistemas avanzados
                const finalTokensToAdd = this.applyAdvancedMultipliers(tokensToAdd);
                
                // Actualizar balance del usuario
                this.user.balance += finalTokensToAdd;
                this.saveUserToStorage();
                
                // 🔧 SINCRONIZAR CON BASE DE DATOS
                this.syncBalanceToBackend().catch(error => {
                    console.warn('⚠️ Error sincronizando balance:', error);
                });
                
                // Actualizar sistemas avanzados
                this.updateAdvancedSystems(finalTokensToAdd, hashRate, efficiency);
                
                console.log(`💰 Minería continua: +${finalTokensToAdd.toFixed(6)} RSC | Balance: ${this.user.balance.toFixed(6)} RSC`);
            }
            
            // Guardar sesión automáticamente
            this.saveMiningSession();
        }
    }

    applyAdvancedMultipliers(baseTokens) {
        let finalTokens = baseTokens;
        
        // Multiplicador de nivel
        if (window.levelSystem) {
            const levelMultiplier = window.levelSystem.getCurrentMultiplier();
            finalTokens *= levelMultiplier;
        }
        
        // Multiplicador de algoritmo
        if (window.algorithmSystem) {
            const algorithmMultiplier = window.algorithmSystem.getEventMultiplier('mining');
            finalTokens *= algorithmMultiplier;
        }
        
        // Multiplicador de eventos
        if (window.eventSystem) {
            const eventMultiplier = window.eventSystem.getEventMultiplier('double_xp');
            finalTokens *= eventMultiplier;
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
                    const balance = parseFloat(users[0].balance) || 0;
                    this.user.balance = balance;
                    return balance;
                }
            }
            
            return this.user.balance;
        } catch (error) {
            console.error('❌ Error obteniendo balance:', error);
            return this.user.balance;
        }
    }

    async syncBalanceToBackend() {
        try {
            if (!this.user.isAuthenticated || !this.user.id) {
                console.log('⚠️ Usuario no autenticado, saltando sync');
                return false;
            }

            console.log(`🔄 Sincronizando balance: ${this.user.balance.toFixed(6)} RSC`);
            
            const response = await this.makeRequest('PATCH', `/rest/v1/users?id=eq.${this.user.id}`, {
                balance: this.user.balance
            });

            if (response.ok) {
                console.log(`✅ Balance sincronizado con backend: ${this.user.balance.toFixed(6)} RSC`);
                return true;
            } else {
                console.error('❌ Error sincronizando balance');
                return false;
            }
        } catch (error) {
            console.error('❌ Error en syncBalanceToBackend:', error);
            return false;
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

    async makeRequest(method, endpoint, body = null) {
        const url = `${this.config.url}${endpoint}`;
        const headers = {
            'apikey': this.config.anonKey,
            'Authorization': `Bearer ${this.config.anonKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
        };

        const options = {
            method,
            headers,
            mode: 'cors'
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
                            
                            // Usar el balance local si es mayor que el de la DB (para preservar minería offline)
                            const dbBalance = parseFloat(dbUser.balance) || 0;
                            const localBalance = parseFloat(userData.balance) || 0;
                            this.user.balance = Math.max(dbBalance, localBalance);
                            
                            this.user.referralCode = dbUser.referral_code;
                            this.user.referredBy = dbUser.referred_by;
                            this.user.isAuthenticated = true;
                            
                            console.log(`💰 Balance DB: ${dbBalance.toFixed(6)}, Local: ${localBalance.toFixed(6)}, Usado: ${this.user.balance.toFixed(6)}`);
                            
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

        // Crear nuevo timer que se ejecute cada 30 segundos
        this.miningUpdateTimer = setInterval(() => {
            if (this.miningSession.isActive) {
                // Forzar actualización de minería
                const currentHashRate = this.miningSession.hashRate || 100;
                const currentEfficiency = this.miningSession.efficiency || 100;
                
                // Actualizar stats (esto recalculará tokens basado en tiempo transcurrido)
                this.updateMiningStats(0, currentHashRate, currentEfficiency);
                
                console.log('🔄 Actualización automática de minería ejecutada');
            }
        }, 30000); // 30 segundos

        console.log('⏰ Timer de actualización automática iniciado (30s)');
    }

    // Detener timer de actualización
    stopMiningUpdateTimer() {
        if (this.miningUpdateTimer) {
            clearInterval(this.miningUpdateTimer);
            this.miningUpdateTimer = null;
            console.log('⏹️ Timer de actualización automática detenido');
        }
    }
}

// Crear instancia global
window.supabaseIntegration = new SupabaseIntegration();

console.log('🔗 Supabase Integration cargado');
