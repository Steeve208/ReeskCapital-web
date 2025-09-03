// 🔐 RSC MINING AUTHENTICATION SYSTEM - ENTERPRISE GRADE
// Sistema de autenticación criptográfico de nivel empresarial
// Implementa las mejores prácticas de seguridad y criptografía

class RSCMiningAuthSystem {
    constructor() {
        this.supabaseClient = null;
        this.currentUser = null;
        this.sessionToken = null;
        this.securityConfig = {
            hashAlgorithm: 'SHA-512',
            saltLength: 64,
            keyDerivationIterations: 100000,
            sessionTimeout: 24 * 60 * 60 * 1000, // 24 horas
            maxLoginAttempts: 5,
            lockoutDuration: 15 * 60 * 1000, // 15 minutos
            requireMFA: false,
            passwordMinLength: 8,
            passwordComplexity: {
                requireUppercase: true,
                requireLowercase: true,
                requireNumbers: true,
                requireSpecialChars: true
            }
        };
        
        this.init();
    }
    
    async init() {
        try {
            console.log('🔐 Inicializando sistema de autenticación RSC Mining...');
            
            // Inicializar Supabase
            await this.initializeSupabase();
            
            // Configurar listeners de seguridad
            this.setupSecurityListeners();
            
            // Verificar sesión existente
            await this.checkExistingSession();
            
            console.log('✅ Sistema de autenticación inicializado correctamente');
        } catch (error) {
            console.error('❌ Error al inicializar sistema de autenticación:', error);
            throw error;
        }
    }
    
    async initializeSupabase() {
        if (typeof createSupabaseClient === 'function') {
            this.supabaseClient = createSupabaseClient();
            if (!this.supabaseClient) {
                throw new Error('No se pudo crear cliente Supabase');
            }
            console.log('✅ Cliente Supabase inicializado');
        } else {
            throw new Error('Función createSupabaseClient no disponible');
        }
    }
    
    // ========================================
    // FUNCIONES CRIPTOGRÁFICAS AVANZADAS
    // ========================================
    
    /**
     * Genera un salt criptográficamente seguro
     * @param {number} length - Longitud del salt
     * @returns {string} Salt generado
     */
    generateCryptoSalt(length = 64) {
        const array = new Uint8Array(length);
        crypto.getRandomValues(array);
        return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    }
    
    /**
     * Deriva una clave usando PBKDF2 (Password-Based Key Derivation Function 2)
     * @param {string} password - Contraseña del usuario
     * @param {string} salt - Salt único
     * @param {number} iterations - Número de iteraciones
     * @returns {Promise<string>} Hash derivado
     */
    async deriveKey(password, salt, iterations = 100000) {
        const encoder = new TextEncoder();
        const passwordBuffer = encoder.encode(password);
        const saltBuffer = encoder.encode(salt);
        
        // Usar Web Crypto API para derivación de clave
        const key = await crypto.subtle.importKey(
            'raw',
            passwordBuffer,
            { name: 'PBKDF2' },
            false,
            ['deriveBits']
        );
        
        const derivedBits = await crypto.subtle.deriveBits(
            {
                name: 'PBKDF2',
                salt: saltBuffer,
                iterations: iterations,
                hash: 'SHA-512'
            },
            key,
            512 // 512 bits = 64 bytes
        );
        
        return Array.from(new Uint8Array(derivedBits), byte => 
            byte.toString(16).padStart(2, '0')
        ).join('');
    }
    
    /**
     * Hashea una contraseña con salt y derivación de clave
     * @param {string} password - Contraseña a hashear
     * @param {string} salt - Salt único
     * @returns {Promise<string>} Hash final
     */
    async hashPassword(password, salt) {
        try {
            const derivedKey = await this.deriveKey(password, salt, this.securityConfig.keyDerivationIterations);
            return derivedKey;
        } catch (error) {
            console.error('Error al hashear contraseña:', error);
            throw new Error('Error de seguridad al procesar contraseña');
        }
    }
    
    /**
     * Verifica una contraseña contra su hash almacenado
     * @param {string} password - Contraseña a verificar
     * @param {string} storedHash - Hash almacenado
     * @param {string} storedSalt - Salt almacenado
     * @returns {Promise<boolean>} True si la contraseña es válida
     */
    async verifyPassword(password, storedHash, storedSalt) {
        try {
            const inputHash = await this.hashPassword(password, storedSalt);
            return inputHash === storedHash;
        } catch (error) {
            console.error('Error al verificar contraseña:', error);
            return false;
        }
    }
    
    /**
     * Valida la complejidad de una contraseña
     * @param {string} password - Contraseña a validar
     * @returns {object} Resultado de la validación
     */
    validatePasswordStrength(password) {
        const validations = {
            length: password.length >= this.securityConfig.passwordMinLength,
            uppercase: /[A-Z]/.test(password),
            lowercase: /[a-z]/.test(password),
            numbers: /\d/.test(password),
            special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
        };
        
        const isValid = Object.values(validations).every(v => v);
        const score = Object.values(validations).filter(v => v).length;
        
        return {
            isValid,
            score,
            validations,
            strength: score < 3 ? 'weak' : score < 5 ? 'medium' : 'strong'
        };
    }
    
    // ========================================
    // FUNCIONES DE AUTENTICACIÓN
    // ========================================
    
    /**
     * Registra un nuevo usuario con validaciones de seguridad
     * @param {string} email - Email del usuario
     * @param {string} username - Nombre de usuario
     * @param {string} password - Contraseña
     * @param {string} walletAddress - Dirección de wallet (opcional)
     * @returns {Promise<object>} Usuario creado
     */
    async registerUser(email, username, password, walletAddress = null) {
        try {
            console.log('🔐 Registrando nuevo usuario:', email);
            
            // Validaciones de seguridad
            if (!this.validateEmail(email)) {
                throw new Error('Email inválido');
            }
            
            if (!this.validateUsername(username)) {
                throw new Error('Username inválido (3-50 caracteres, solo letras, números y guiones)');
            }
            
            const passwordValidation = this.validatePasswordStrength(password);
            if (!passwordValidation.isValid) {
                throw new Error(`Contraseña débil. Requiere: ${this.securityConfig.passwordMinLength}+ caracteres, mayúsculas, minúsculas, números y caracteres especiales`);
            }
            
            // Verificar si el usuario ya existe
            const existingUser = await this.getUserByEmail(email);
            if (existingUser) {
                throw new Error('Este email ya está registrado');
            }
            
            const existingUsername = await this.getUserByUsername(username);
            if (existingUsername) {
                throw new Error('Este username ya está en uso');
            }
            
            // Generar salt y hash de contraseña
            const salt = this.generateCryptoSalt(this.securityConfig.saltLength);
            const passwordHash = await this.hashPassword(password, salt);
            
            // Crear usuario en la base de datos
            const userData = {
                email: email.toLowerCase().trim(),
                username: username.trim(),
                password_hash: passwordHash,
                salt: salt,
                wallet_address: walletAddress,
                balance: 0.00000000,
                total_mined: 0.00000000,
                mining_power: 1.0000,
                account_status: 'active',
                verification_level: 1,
                created_at: new Date().toISOString()
            };
            
            const { data: newUser, error } = await this.supabaseClient
                .from('mining_users')
                .insert([userData])
                .select()
                .single();
            
            if (error) {
                throw new Error(`Error al crear usuario: ${error.message}`);
            }
            
            // Log de seguridad
            await this.logSecurityEvent('user_registered', newUser.id, {
                email: newUser.email,
                username: newUser.username,
                ip_address: await this.getClientIP()
            });
            
            console.log('✅ Usuario registrado exitosamente');
            
            // Retornar usuario sin información sensible
            return {
                id: newUser.id,
                email: newUser.email,
                username: newUser.username,
                balance: newUser.balance,
                mining_power: newUser.mining_power,
                account_status: newUser.account_status,
                created_at: newUser.created_at
            };
            
        } catch (error) {
            console.error('❌ Error en registro:', error);
            throw error;
        }
    }
    
    /**
     * Autentica un usuario con validaciones de seguridad
     * @param {string} email - Email del usuario
     * @param {string} password - Contraseña
     * @returns {Promise<object>} Resultado de la autenticación
     */
    async authenticateUser(email, password) {
        try {
            console.log('🔐 Autenticando usuario:', email);
            
            // Validar email
            if (!this.validateEmail(email)) {
                throw new Error('Email inválido');
            }
            
            // Buscar usuario
            const user = await this.getUserByEmail(email.toLowerCase().trim());
            if (!user) {
                await this.logSecurityEvent('login_failed', null, {
                    email: email,
                    reason: 'user_not_found',
                    ip_address: await this.getClientIP()
                });
                throw new Error('Usuario no encontrado');
            }
            
            // Verificar si la cuenta está bloqueada
            if (user.account_status === 'suspended' || user.account_status === 'banned') {
                throw new Error(`Cuenta ${user.account_status}. Contacta al administrador.`);
            }
            
            if (user.locked_until && new Date(user.locked_until) > new Date()) {
                const lockTime = new Date(user.locked_until).toLocaleString();
                throw new Error(`Cuenta bloqueada hasta: ${lockTime}`);
            }
            
            // Verificar contraseña
            const isPasswordValid = await this.verifyPassword(password, user.password_hash, user.salt);
            
            if (isPasswordValid) {
                console.log('✅ Contraseña válida');
                
                // Resetear intentos fallidos
                await this.resetFailedLoginAttempts(user.email);
                
                // Crear sesión
                const session = await this.createUserSession(user);
                
                // Log de seguridad
                await this.logSecurityEvent('login_successful', user.id, {
                    email: user.email,
                    ip_address: await this.getClientIP(),
                    session_id: session.id
                });
                
                // Actualizar último login
                await this.updateLastLogin(user.id);
                
                // Retornar datos del usuario autenticado
                this.currentUser = {
                    id: user.id,
                    email: user.email,
                    username: user.username,
                    balance: user.balance,
                    total_mined: user.total_mined,
                    mining_power: user.mining_power,
                    account_status: user.account_status,
                    verification_level: user.verification_level
                };
                
                this.sessionToken = session.session_hash;
                
                return {
                    success: true,
                    user: this.currentUser,
                    session: session
                };
                
            } else {
                console.log('❌ Contraseña incorrecta');
                
                // Incrementar intentos fallidos
                await this.incrementFailedLoginAttempts(user.email);
                
                // Log de seguridad
                await this.logSecurityEvent('login_failed', user.id, {
                    email: user.email,
                    reason: 'invalid_password',
                    ip_address: await this.getClientIP()
                });
                
                throw new Error('Contraseña incorrecta');
            }
            
        } catch (error) {
            console.error('❌ Error en autenticación:', error);
            throw error;
        }
    }
    
    /**
     * Cierra la sesión del usuario
     * @returns {Promise<boolean>} True si se cerró correctamente
     */
    async logout() {
        try {
            if (this.currentUser && this.sessionToken) {
                // Marcar sesión como terminada
                await this.terminateUserSession(this.sessionToken);
                
                // Log de seguridad
                await this.logSecurityEvent('logout', this.currentUser.id, {
                    email: this.currentUser.email,
                    session_id: this.sessionToken
                });
            }
            
            // Limpiar estado local
            this.currentUser = null;
            this.sessionToken = null;
            
            // Limpiar localStorage
            localStorage.removeItem('rsc_mining_user');
            localStorage.removeItem('rsc_mining_session');
            
            console.log('✅ Sesión cerrada correctamente');
            return true;
            
        } catch (error) {
            console.error('❌ Error al cerrar sesión:', error);
            return false;
        }
    }
    
    // ========================================
    // FUNCIONES DE SESIÓN
    // ========================================
    
    /**
     * Crea una nueva sesión de usuario
     * @param {object} user - Usuario autenticado
     * @returns {Promise<object>} Sesión creada
     */
    async createUserSession(user) {
        const sessionHash = this.generateSessionHash(user.id);
        const sessionData = {
            user_id: user.id,
            session_hash: sessionHash,
            start_time: new Date().toISOString(),
            session_status: 'active',
            ip_address: await this.getClientIP(),
            user_agent: navigator.userAgent
        };
        
        const { data: session, error } = await this.supabaseClient
            .from('mining_sessions')
            .insert([sessionData])
            .select()
            .single();
        
        if (error) {
            throw new Error(`Error al crear sesión: ${error.message}`);
        }
        
        return session;
    }
    
    /**
     * Termina una sesión de usuario
     * @param {string} sessionHash - Hash de la sesión
     * @returns {Promise<boolean>} True si se terminó correctamente
     */
    async terminateUserSession(sessionHash) {
        const { error } = await this.supabaseClient
            .from('mining_sessions')
            .update({
                session_status: 'terminated',
                end_time: new Date().toISOString()
            })
            .eq('session_hash', sessionHash);
        
        return !error;
    }
    
    /**
     * Genera un hash único para la sesión
     * @param {string} userId - ID del usuario
     * @returns {string} Hash de sesión
     */
    generateSessionHash(userId) {
        const timestamp = Date.now().toString();
        const random = Math.random().toString(36).substring(2);
        return `${userId}_${timestamp}_${random}`;
    }
    
    // ========================================
    // FUNCIONES DE SEGURIDAD
    // ========================================
    
    /**
     * Incrementa los intentos fallidos de login
     * @param {string} email - Email del usuario
     */
    async incrementFailedLoginAttempts(email) {
        const { error } = await this.supabaseClient
            .rpc('increment_failed_login', { user_email: email });
        
        if (error) {
            console.warn('⚠️ No se pudo actualizar intentos fallidos:', error.message);
        }
    }
    
    /**
     * Resetea los intentos fallidos de login
     * @param {string} email - Email del usuario
     */
    async resetFailedLoginAttempts(email) {
        const { error } = await this.supabaseClient
            .rpc('reset_failed_login', { user_email: email });
        
        if (error) {
            console.warn('⚠️ No se pudo resetear intentos fallidos:', error.message);
        }
    }
    
    /**
     * Actualiza el último login del usuario
     * @param {string} userId - ID del usuario
     */
    async updateLastLogin(userId) {
        const { error } = await this.supabaseClient
            .from('mining_users')
            .update({ last_login: new Date().toISOString() })
            .eq('id', userId);
        
        if (error) {
            console.warn('⚠️ No se pudo actualizar último login:', error.message);
        }
    }
    
    /**
     * Registra un evento de seguridad
     * @param {string} actionType - Tipo de acción
     * @param {string} userId - ID del usuario (opcional)
     * @param {object} details - Detalles del evento
     */
    async logSecurityEvent(actionType, userId = null, details = {}) {
        try {
            const logData = {
                user_id: userId,
                action_type: actionType,
                ip_address: await this.getClientIP(),
                user_agent: navigator.userAgent,
                details: details,
                risk_score: this.calculateRiskScore(actionType, details),
                created_at: new Date().toISOString()
            };
            
            const { error } = await this.supabaseClient
                .from('security_logs')
                .insert([logData]);
            
            if (error) {
                console.warn('⚠️ No se pudo registrar evento de seguridad:', error.message);
            }
        } catch (error) {
            console.warn('⚠️ Error al registrar evento de seguridad:', error);
        }
    }
    
    /**
     * Calcula el score de riesgo de una acción
     * @param {string} actionType - Tipo de acción
     * @param {object} details - Detalles de la acción
     * @returns {number} Score de riesgo (0-100)
     */
    calculateRiskScore(actionType, details) {
        let score = 0;
        
        switch (actionType) {
            case 'login_failed':
                score = 30;
                break;
            case 'login_successful':
                score = 5;
                break;
            case 'user_registered':
                score = 10;
                break;
            case 'logout':
                score = 0;
                break;
            default:
                score = 15;
        }
        
        // Ajustar por IP
        if (details.ip_address && details.ip_address.includes('192.168.')) {
            score -= 10; // Red local
        }
        
        return Math.max(0, Math.min(100, score));
    }
    
    // ========================================
    // FUNCIONES DE VALIDACIÓN
    // ========================================
    
    /**
     * Valida un email
     * @param {string} email - Email a validar
     * @returns {boolean} True si es válido
     */
    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    /**
     * Valida un username
     * @param {string} username - Username a validar
     * @returns {boolean} True si es válido
     */
    validateUsername(username) {
        const usernameRegex = /^[a-zA-Z0-9_-]{3,50}$/;
        return usernameRegex.test(username);
    }
    
    // ========================================
    // FUNCIONES DE UTILIDAD
    // ========================================
    
    /**
     * Obtiene la IP del cliente (simulado)
     * @returns {Promise<string>} IP del cliente
     */
    async getClientIP() {
        // En producción, esto vendría del servidor
        return '127.0.0.1';
    }
    
    /**
     * Obtiene un usuario por email
     * @param {string} email - Email del usuario
     * @returns {Promise<object|null>} Usuario encontrado
     */
    async getUserByEmail(email) {
        const { data, error } = await this.supabaseClient
            .from('mining_users')
            .select('*')
            .eq('email', email)
            .single();
        
        if (error && error.code !== 'PGRST116') {
            throw error;
        }
        
        return data || null;
    }
    
    /**
     * Obtiene un usuario por username
     * @param {string} username - Username del usuario
     * @returns {Promise<object|null>} Usuario encontrado
     */
    async getUserByUsername(username) {
        const { data, error } = await this.supabaseClient
            .from('mining_users')
            .select('*')
            .eq('username', username)
            .single();
        
        if (error && error.code !== 'PGRST116') {
            throw error;
        }
        
        return data || null;
    }
    
    /**
     * Verifica si hay una sesión activa
     * @returns {Promise<boolean>} True si hay sesión activa
     */
    async checkExistingSession() {
        try {
            const savedUser = localStorage.getItem('rsc_mining_user');
            const savedSession = localStorage.getItem('rsc_mining_session');
            
            if (savedUser && savedSession) {
                const user = JSON.parse(savedUser);
                const session = JSON.parse(savedSession);
                
                // Verificar si la sesión sigue siendo válida
                if (new Date(session.start_time) > new Date(Date.now() - this.securityConfig.sessionTimeout)) {
                    this.currentUser = user;
                    this.sessionToken = session.session_hash;
                    console.log('✅ Sesión existente restaurada');
                    return true;
                } else {
                    // Sesión expirada, limpiar
                    localStorage.removeItem('rsc_mining_user');
                    localStorage.removeItem('rsc_mining_session');
                }
            }
            
            return false;
        } catch (error) {
            console.warn('⚠️ Error al verificar sesión existente:', error);
            return false;
        }
    }
    
    /**
     * Configura listeners de seguridad
     */
    setupSecurityListeners() {
        // Listener para cambios de visibilidad (detectar tab switching)
        document.addEventListener('visibilitychange', () => {
            if (this.currentUser) {
                this.logSecurityEvent('tab_visibility_changed', this.currentUser.id, {
                    hidden: document.hidden
                });
            }
        });
        
        // Listener para cambios de foco
        window.addEventListener('focus', () => {
            if (this.currentUser) {
                this.logSecurityEvent('window_focused', this.currentUser.id);
            }
        });
        
        window.addEventListener('blur', () => {
            if (this.currentUser) {
                this.logSecurityEvent('window_blurred', this.currentUser.id);
            }
        });
    }
    
    // ========================================
    // GETTERS PÚBLICOS
    // ========================================
    
    /**
     * Obtiene el usuario actual
     * @returns {object|null} Usuario actual
     */
    getCurrentUser() {
        return this.currentUser;
    }
    
    /**
     * Verifica si el usuario está autenticado
     * @returns {boolean} True si está autenticado
     */
    isAuthenticated() {
        return this.currentUser !== null;
    }
    
    /**
     * Obtiene el token de sesión
     * @returns {string|null} Token de sesión
     */
    getSessionToken() {
        return this.sessionToken;
    }
}

// Exportar para uso global
window.RSCMiningAuth = RSCMiningAuthSystem;

console.log('🔐 Sistema de autenticación RSC Mining cargado - Enterprise Grade');
