// 🚀 RSC SIMULATED MINING ENGINE - REVOLUTIONARY WEB MINING
// Motor de minería simulada que prepara usuarios para el mainnet real
// Implementa algoritmos realistas y características educativas

class RSCSimulatedMiningEngine {
    constructor() {
        this.supabaseClient = null;
        this.currentSession = null;
        this.miningConfig = {
            // Configuración de simulación realista
            baseDifficulty: 1.0,
            targetBlockTime: 600, // 10 minutos como Bitcoin
            maxMiningPower: 5.0,
            minSessionDuration: 60, // 1 minuto mínimo
            maxDailyReward: 2.0, // 2 RSC máximo por día
            baseRewardRate: 0.0001, // 0.0001 RSC por segundo base
            difficultyAdjustmentInterval: 2016, // Ajustar cada 2016 bloques como Bitcoin
            referralBonus: 0.10, // 10% de bonificación por referidos
            mainnetCountdown: new Date('2024-12-31T23:59:59Z'), // Fecha estimada de mainnet
            simulationMode: true
        };
        
        this.miningState = {
            isMining: false,
            currentDifficulty: 1.0,
            sessionStartTime: null,
            lastBlockTime: null,
            totalBlocksFound: 0,
            currentHashRate: 0,
            sessionTokens: 0,
            miningPower: 1.0,
            referralEarnings: 0,
            totalReferrals: 0,
            blocksMined: 0,
            efficiency: 0
        };
        
        this.networkStats = {
            activeMiners: 0,
            totalMiningPower: 0,
            networkDifficulty: 1.0,
            blocks24h: 0,
            rsc24h: 0,
            avgBlockTime: 600,
            totalSupply: 21000000, // 21M RSC máximo como Bitcoin
            circulatingSupply: 0
        };
        
        this.leaderboard = [];
        this.recentActivity = [];
        this.miningInterval = null;
        this.hashVisualization = null;
        
        this.init();
    }
    
    async init() {
        try {
            console.log('🚀 Inicializando motor de minería simulada RSC...');
            
            // Inicializar Supabase
            await this.initializeSupabase();
            
            // Cargar configuración y estadísticas
            await this.loadSimulationConfig();
            await this.loadNetworkStats();
            await this.loadLeaderboard();
            await this.loadRecentActivity();
            
            // Inicializar balance del usuario
            this.initializeUserBalance();
            
            // Configurar visualización de hash
            this.setupHashVisualization();
            
            console.log('✅ Motor de minería simulada inicializado correctamente');
        } catch (error) {
            console.error('❌ Error al inicializar motor de minería simulada:', error);
            throw error;
        }
    }
    
    async initializeSupabase() {
        if (typeof createSupabaseClient === 'function') {
            this.supabaseClient = createSupabaseClient();
            if (!this.supabaseClient) {
                throw new Error('No se pudo crear cliente Supabase');
            }
            console.log('✅ Cliente Supabase inicializado para minería simulada');
        } else {
            throw new Error('Función createSupabaseClient no disponible');
        }
    }
    
    // ========================================
    // CONFIGURACIÓN Y ESTADÍSTICAS
    // ========================================
    
    async loadSimulationConfig() {
        try {
            // Simular carga de configuración
            this.miningState.currentDifficulty = this.miningConfig.baseDifficulty;
            this.networkStats.networkDifficulty = this.miningConfig.baseDifficulty;
            
            // Simular estadísticas de red
            this.networkStats.activeMiners = Math.floor(Math.random() * 1000) + 500;
            this.networkStats.totalMiningPower = this.networkStats.activeMiners * (Math.random() * 2 + 1);
            this.networkStats.blocks24h = Math.floor(Math.random() * 144) + 100;
            this.networkStats.rsc24h = this.networkStats.blocks24h * 0.5;
            this.networkStats.avgBlockTime = this.miningConfig.targetBlockTime + (Math.random() * 60 - 30);
            
            console.log('✅ Configuración de simulación cargada');
        } catch (error) {
            console.warn('⚠️ Error al cargar configuración de simulación:', error);
        }
    }
    
    async loadNetworkStats() {
        try {
            // Simular estadísticas de red en tiempo real
            this.updateNetworkStats();
            console.log('✅ Estadísticas de red simuladas cargadas');
        } catch (error) {
            console.warn('⚠️ Error al cargar estadísticas de red:', error);
        }
    }
    
    async loadLeaderboard() {
        try {
            // Simular leaderboard
            this.leaderboard = [
                { rank: 1, username: 'MinerMaster2024', amount: 125.45, miningPower: 4.8 },
                { rank: 2, username: 'CryptoHunter', amount: 98.32, miningPower: 4.2 },
                { rank: 3, username: 'BlockChainPro', amount: 87.67, miningPower: 3.9 },
                { rank: 4, username: 'HashKing', amount: 76.23, miningPower: 3.5 },
                { rank: 5, username: 'RSCMiner', amount: 65.89, miningPower: 3.1 }
            ];
            console.log('✅ Leaderboard simulado cargado');
        } catch (error) {
            console.warn('⚠️ Error al cargar leaderboard:', error);
        }
    }
    
    async loadRecentActivity() {
        try {
            // Simular actividad reciente
            this.recentActivity = [
                {
                    type: 'block_found',
                    message: '¡Bloque encontrado! +0.5 RSC ganados',
                    timestamp: new Date(Date.now() - 300000),
                    amount: 0.5
                },
                {
                    type: 'referral_bonus',
                    message: 'Bonificación por referido: +0.05 RSC',
                    timestamp: new Date(Date.now() - 600000),
                    amount: 0.05
                },
                {
                    type: 'difficulty_adjustment',
                    message: 'Dificultad ajustada: 1.2x',
                    timestamp: new Date(Date.now() - 900000),
                    amount: null
                }
            ];
            console.log('✅ Actividad reciente simulada cargada');
        } catch (error) {
            console.warn('⚠️ Error al cargar actividad reciente:', error);
        }
    }
    
    // ========================================
    // FUNCIONES DE MINERÍA SIMULADA
    // ========================================
    
    async startMining(user, miningPower = 1.0) {
        try {
            console.log('⛏️ Iniciando minería simulada para usuario:', user.email || 'Usuario de prueba');
            
            // TEMPORAL: Desactivar validaciones para pruebas
            if (!user || !user.id) {
                // Crear usuario de prueba si no existe
                user = {
                    id: 'test_user_123',
                    email: 'test@rsc.com',
                    username: 'TestMiner'
                };
            }
            
            if (this.miningState.isMining) {
                throw new Error('Ya hay una sesión de minería activa');
            }
            
            // TEMPORAL: Desactivar verificación de límite diario para pruebas
            // const canMine = await this.checkDailyLimit(user.email);
            // if (!canMine) {
            //     throw new Error('Has alcanzado el límite diario de 2 RSC');
            // }
            
            // Crear sesión de minería simulada
            const sessionData = {
                user_id: user.id,
                session_hash: this.generateSessionHash(user.id),
                start_time: new Date().toISOString(),
                session_status: 'active',
                mining_power_used: Math.min(miningPower, this.miningConfig.maxMiningPower),
                difficulty_level: this.miningState.currentDifficulty,
                simulation_mode: true,
                ip_address: await this.getClientIP(),
                user_agent: navigator.userAgent
            };
            
            // Guardar en localStorage para simulación
            localStorage.setItem('rsc_mining_session', JSON.stringify(sessionData));
            
            // Inicializar estado de minería
            this.currentSession = sessionData;
            this.miningState.isMining = true;
            this.miningState.sessionStartTime = Date.now();
            this.miningState.miningPower = sessionData.mining_power_used;
            this.miningState.sessionTokens = 0;
            this.miningState.totalBlocksFound = 0;
            this.miningState.efficiency = 0;
            
            // Incrementar contador de sesiones
            const totalSessions = parseInt(localStorage.getItem('rsc_total_sessions') || '0');
            localStorage.setItem('rsc_total_sessions', (totalSessions + 1).toString());
            
            // Guardar tiempo de inicio de sesión
            localStorage.setItem('rsc_session_start_time', Date.now().toString());
            
            // Iniciar proceso de minería simulada
            this.startSimulatedMining();
            
            // Iniciar visualización de hash
            this.startHashVisualization();
            
            console.log('✅ Minería simulada iniciada');
            
            return sessionData;
            
        } catch (error) {
            console.error('❌ Error al iniciar minería simulada:', error);
            throw error;
        }
    }
    
    async stopMining() {
        try {
            if (!this.miningState.isMining || !this.currentSession) {
                throw new Error('No hay sesión de minería activa');
            }
            
            console.log('⛏️ Deteniendo minería simulada...');
            
            // Detener proceso de minería
            this.stopSimulatedMining();
            this.stopHashVisualization();
            
            // Calcular duración y tokens ganados
            const sessionDuration = Math.floor((Date.now() - this.miningState.sessionStartTime) / 1000);
            const tokensEarned = this.calculateSessionReward(sessionDuration);
            
            // Actualizar tiempo total de minería
            const totalMiningTime = parseInt(localStorage.getItem('rsc_total_mining_time') || '0');
            localStorage.setItem('rsc_total_mining_time', (totalMiningTime + sessionDuration).toString());
            
            // Actualizar estadísticas
            this.miningState.sessionTokens = tokensEarned;
            this.miningState.blocksMined = this.miningState.totalBlocksFound;
            this.miningState.efficiency = this.calculateEfficiency();
            
            // Guardar resultado en localStorage
            const sessionResult = {
                sessionId: this.currentSession.id,
                duration: sessionDuration,
                tokensEarned: tokensEarned,
                blocksFound: this.miningState.totalBlocksFound,
                miningPower: this.miningState.miningPower,
                difficulty: this.miningState.currentDifficulty,
                efficiency: this.miningState.efficiency,
                timestamp: new Date().toISOString()
            };
            
            localStorage.setItem('rsc_last_session', JSON.stringify(sessionResult));
            
            // Limpiar estado
            this.miningState.isMining = false;
            this.currentSession = null;
            this.miningState.sessionStartTime = null;
            this.miningState.sessionTokens = 0;
            this.miningState.totalBlocksFound = 0;
            
            console.log('✅ Minería simulada detenida. Resultado:', sessionResult);
            
            return sessionResult;
            
        } catch (error) {
            console.error('❌ Error al detener minería simulada:', error);
            throw error;
        }
    }
    
    startSimulatedMining() {
        if (this.miningInterval) {
            clearInterval(this.miningInterval);
        }
        
        // Proceso de minería cada 2 segundos para simulación
        this.miningInterval = setInterval(async () => {
            if (this.miningState.isMining) {
                await this.simulateMiningProcess();
            }
        }, 2000);
        
        console.log('⛏️ Proceso de minería simulada iniciado');
    }
    
    stopSimulatedMining() {
        if (this.miningInterval) {
            clearInterval(this.miningInterval);
            this.miningInterval = null;
        }
        console.log('⛏️ Proceso de minería simulada detenido');
    }
    
    async simulateMiningProcess() {
        try {
            // Simular trabajo de minería
            const blockHash = this.generateSimulatedBlockHash();
            const targetHash = this.calculateTargetHash();
            
            // Incrementar hash rate siempre
            this.miningState.currentHashRate++;
            
            // Verificar si el hash cumple con la dificultad (más fácil para demo)
            if (this.verifyBlockHash(blockHash, targetHash)) {
                console.log('🎯 ¡Bloque simulado encontrado! Hash:', blockHash);
                
                // Incrementar contadores
                this.miningState.totalBlocksFound++;
                this.miningState.lastBlockTime = Date.now();
                
                // Calcular recompensa del bloque (más generosa para demo)
                const blockReward = this.calculateBlockReward() * 10; // 10x más recompensas para demo
                this.miningState.sessionTokens += blockReward;
                
                // Actualizar balance del usuario
                this.updateUserBalance(blockReward);
                
                // Actualizar ganancias para sistema de referidos
                this.updateReferredUserEarnings(this.currentSession.user_id, blockReward);
                
                // Agregar a actividad reciente
                this.addToRecentActivity('block_found', `¡Bloque encontrado! +${blockReward.toFixed(8)} RSC ganados`, blockReward);
                
                // Actualizar estadísticas de red
                this.updateNetworkStats();
                
                // Emitir evento de actualización de balance
                this.emitBalanceUpdate();
            }
            
            // Actualizar eficiencia
            this.miningState.efficiency = this.calculateEfficiency();
            
            // Emitir evento de actualización de estadísticas
            this.emitStatsUpdate();
            
        } catch (error) {
            console.warn('⚠️ Error en proceso de minería simulada:', error);
        }
    }
    
    // ========================================
    // ALGORITMOS DE MINERÍA REALISTAS
    // ========================================
    
    generateSimulatedBlockHash() {
        const timestamp = Date.now().toString();
        const nonce = Math.random().toString(36).substring(2);
        const data = `${this.currentSession.session_hash}_${timestamp}_${nonce}`;
        
        // Simular hash SHA-256 más realista
        return this.simulateSHA256(data);
    }
    
    simulateSHA256(data) {
        // Simulación más realista de SHA-256
        let hash = 0;
        for (let i = 0; i < data.length; i++) {
            const char = data.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convertir a 32-bit integer
        }
        
        // Simular hash de 64 caracteres hexadecimales
        const hexHash = Math.abs(hash).toString(16).padStart(16, '0');
        return hexHash.repeat(4).substring(0, 64);
    }
    
    calculateTargetHash() {
        // Dificultad más alta = hash objetivo más bajo
        // Para demo, hacer más fácil encontrar bloques
        const difficulty = Math.max(0.1, this.miningState.currentDifficulty);
        const targetLength = Math.floor(8 / difficulty); // Reducido de 64 a 8 para demo
        
        return '0'.repeat(targetLength) + 'f'.repeat(8 - targetLength);
    }
    
    verifyBlockHash(blockHash, targetHash) {
        // Verificar que el hash comience con el número correcto de ceros
        const leadingZeros = targetHash.match(/^0+/)[0].length;
        const hashLeadingZeros = blockHash.match(/^0+/)[0].length;
        
        // Para demo, hacer más fácil encontrar bloques (probabilidad del 5%)
        const randomChance = Math.random() < 0.05; // 5% de probabilidad cada intento
        
        return hashLeadingZeros >= leadingZeros || randomChance;
    }
    
    // ========================================
    // CÁLCULOS DE RECOMPENSAS
    // ========================================
    
    calculateBlockReward() {
        const baseReward = this.miningConfig.baseRewardRate;
        const powerMultiplier = this.miningState.miningPower;
        const difficultyMultiplier = Math.max(0.1, 1.0 / this.miningState.currentDifficulty);
        
        return baseReward * powerMultiplier * difficultyMultiplier;
    }
    
    calculateSessionReward(durationSeconds) {
        if (durationSeconds < this.miningConfig.minSessionDuration) {
            return 0;
        }
        
        const baseReward = this.miningConfig.baseRewardRate;
        const powerMultiplier = this.miningState.miningPower;
        const difficultyMultiplier = Math.max(0.1, 1.0 / this.miningState.currentDifficulty);
        const timeMultiplier = durationSeconds / 60; // Por minuto
        
        const totalReward = baseReward * powerMultiplier * difficultyMultiplier * timeMultiplier;
        
        // Aplicar límite diario
        return Math.min(totalReward, this.miningConfig.maxDailyReward);
    }
    
    calculateEfficiency() {
        if (this.miningState.currentHashRate === 0) return 0;
        
        const expectedHashes = this.miningState.currentHashRate;
        const actualBlocks = this.miningState.totalBlocksFound;
        
        return Math.min(100, (actualBlocks / expectedHashes) * 100);
    }
    
    // ========================================
    // SISTEMA DE REFERIDOS
    // ========================================
    
    async processReferral(referralCode, userId) {
        try {
            // Validar código de referido
            if (!this.validateReferralCode(referralCode)) {
                throw new Error('Código de referido inválido');
            }
            
            const referrerId = this.extractUserIdFromCode(referralCode);
            
            // Verificar que no se refiera a sí mismo
            if (referrerId === userId) {
                throw new Error('No puedes referirte a ti mismo');
            }
            
            // Verificar si ya existe el referido
            const existingReferral = this.getExistingReferral(userId);
            if (existingReferral) {
                throw new Error('Ya tienes un referidor asignado');
            }
            
            // Crear datos del referido
            const referralData = {
                referrer_id: referrerId,
                referred_id: userId,
                bonus_rate: this.miningConfig.referralBonus,
                created_at: new Date().toISOString(),
                status: 'active'
            };
            
            // Guardar en localStorage
            const referrals = JSON.parse(localStorage.getItem('rsc_referrals') || '[]');
            referrals.push(referralData);
            localStorage.setItem('rsc_referrals', JSON.stringify(referrals));
            
            // Actualizar estadísticas del referidor
            this.updateReferrerStats(referrerId);
            
            // Actualizar estadísticas del referido
            this.miningState.totalReferrals++;
            
            // Agregar a actividad reciente
            this.addToRecentActivity('referral_bonus', `Nuevo referido registrado: +${this.miningConfig.referralBonus * 100}% de bonificación`, null);
            
            console.log('✅ Referido procesado:', referralData);
            return referralData;
            
        } catch (error) {
            console.error('❌ Error al procesar referido:', error);
            throw error;
        }
    }
    
    validateReferralCode(code) {
        // Validar formato del código: RSC_userId_timestamp
        const pattern = /^RSC_\w+_\d+$/;
        return pattern.test(code);
    }
    
    getExistingReferral(userId) {
        const referrals = JSON.parse(localStorage.getItem('rsc_referrals') || '[]');
        return referrals.find(r => r.referred_id === userId);
    }
    
    updateReferrerStats(referrerId) {
        // Actualizar estadísticas del referidor
        const referrerStats = JSON.parse(localStorage.getItem(`rsc_referrer_${referrerId}`) || '{"totalReferrals": 0, "totalEarnings": 0}');
        referrerStats.totalReferrals++;
        localStorage.setItem(`rsc_referrer_${referrerId}`, JSON.stringify(referrerStats));
    }
    
    async calculateReferralEarnings(userId) {
        try {
            // Obtener referidos del usuario
            const referrals = JSON.parse(localStorage.getItem('rsc_referrals') || '[]');
            const userReferrals = referrals.filter(r => r.referrer_id === userId && r.status === 'active');
            
            let totalEarnings = 0;
            
            // Calcular ganancias basadas en la actividad real de los referidos
            for (const referral of userReferrals) {
                const referredUserEarnings = this.getReferredUserEarnings(referral.referred_id);
                const bonus = referredUserEarnings * referral.bonus_rate;
                totalEarnings += bonus;
            }
            
            this.miningState.referralEarnings = totalEarnings;
            
            // Guardar ganancias del referidor
            const referrerStats = JSON.parse(localStorage.getItem(`rsc_referrer_${userId}`) || '{"totalReferrals": 0, "totalEarnings": 0}');
            referrerStats.totalEarnings = totalEarnings;
            localStorage.setItem(`rsc_referrer_${userId}`, JSON.stringify(referrerStats));
            
            return totalEarnings;
            
        } catch (error) {
            console.warn('⚠️ Error al calcular ganancias de referidos:', error);
            return 0;
        }
    }
    
    getReferredUserEarnings(referredUserId) {
        // Obtener ganancias del usuario referido
        const userEarnings = JSON.parse(localStorage.getItem(`rsc_user_earnings_${referredUserId}`) || '{"totalMined": 0}');
        return userEarnings.totalMined || 0;
    }
    
    updateReferredUserEarnings(userId, amount) {
        // Actualizar ganancias del usuario referido
        const userEarnings = JSON.parse(localStorage.getItem(`rsc_user_earnings_${userId}`) || '{"totalMined": 0}');
        userEarnings.totalMined += amount;
        localStorage.setItem(`rsc_user_earnings_${userId}`, JSON.stringify(userEarnings));
        
        // Recalcular ganancias del referidor
        this.calculateReferralEarnings(this.getReferrerId(userId));
    }
    
    getReferrerId(userId) {
        const referrals = JSON.parse(localStorage.getItem('rsc_referrals') || '[]');
        const referral = referrals.find(r => r.referred_id === userId && r.status === 'active');
        return referral ? referral.referrer_id : null;
    }
    
    extractUserIdFromCode(code) {
        // Simular extracción de ID de usuario del código de referido
        return code.replace('RSC_', '');
    }
    
    generateReferralCode(userId) {
        // En producción, esto debería llamar al backend
        // Por ahora simulamos la generación local
        const timestamp = Date.now();
        const randomSuffix = Math.random().toString(36).substring(2, 8);
        return `RSC_${userId}_${timestamp}_${randomSuffix}`;
    }
    
    // ========================================
    // FUNCIONES DE BACKEND (SIMULADAS)
    // ========================================
    
    async generateReferralCodeBackend(userId) {
        try {
            // En producción, esto haría una llamada al backend
            const response = await fetch('/api/referrals/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.getAuthToken()}`
                },
                body: JSON.stringify({
                    user_id: userId,
                    platform: 'web_mining'
                })
            });
            
            if (!response.ok) {
                throw new Error('Error al generar código de referido');
            }
            
            const data = await response.json();
            return data.referral_code;
            
        } catch (error) {
            console.warn('⚠️ Error al generar código en backend, usando generación local:', error);
            // Fallback a generación local
            return this.generateReferralCode(userId);
        }
    }
    
    async validateReferralCodeBackend(code) {
        try {
            // En producción, esto validaría en el backend
            const response = await fetch('/api/referrals/validate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    referral_code: code
                })
            });
            
            if (!response.ok) {
                throw new Error('Código de referido inválido');
            }
            
            const data = await response.json();
            return data;
            
        } catch (error) {
            console.warn('⚠️ Error al validar código en backend, usando validación local:', error);
            // Fallback a validación local
            return this.validateReferralCodeLocal(code);
        }
    }
    
    async processReferralBackend(referralCode, userId) {
        try {
            // En producción, esto procesaría en el backend
            const response = await fetch('/api/referrals/process', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.getAuthToken()}`
                },
                body: JSON.stringify({
                    referral_code: referralCode,
                    user_id: userId,
                    ip_address: await this.getClientIP(),
                    user_agent: navigator.userAgent
                })
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al procesar referido');
            }
            
            const data = await response.json();
            return data;
            
        } catch (error) {
            console.warn('⚠️ Error al procesar referido en backend, usando procesamiento local:', error);
            // Fallback a procesamiento local
            return this.processReferralLocal(referralCode, userId);
        }
    }
    
    validateReferralCodeLocal(code) {
        // Validación local como fallback
        const pattern = /^RSC_\w+_\d+_\w+$/;
        return {
            valid: pattern.test(code),
            referrer_id: this.extractUserIdFromCode(code),
            expires_at: null,
            usage_count: 0,
            max_usage: 1000
        };
    }
    
    async processReferralLocal(referralCode, userId) {
        // Procesamiento local como fallback
        return this.processReferral(referralCode, userId);
    }
    
    getAuthToken() {
        // Obtener token de autenticación del usuario
        return localStorage.getItem('rsc_auth_token') || null;
    }
    
    // ========================================
    // VISUALIZACIÓN DE HASH
    // ========================================
    
    setupHashVisualization() {
        this.hashVisualization = {
            isActive: false,
            interval: null,
            currentHash: '',
            hashCount: 0
        };
    }
    
    startHashVisualization() {
        if (this.hashVisualization.interval) {
            clearInterval(this.hashVisualization.interval);
        }
        
        this.hashVisualization.isActive = true;
        this.hashVisualization.interval = setInterval(() => {
            if (this.miningState.isMining) {
                this.updateHashVisualization();
            }
        }, 100);
    }
    
    stopHashVisualization() {
        if (this.hashVisualization.interval) {
            clearInterval(this.hashVisualization.interval);
            this.hashVisualization.interval = null;
        }
        this.hashVisualization.isActive = false;
    }
    
    updateHashVisualization() {
        // Generar hash visual
        this.hashVisualization.currentHash = this.generateSimulatedBlockHash();
        this.hashVisualization.hashCount++;
        
        // Emitir evento para la UI
        this.emitHashUpdate();
    }
    
    emitHashUpdate() {
        const event = new CustomEvent('hashUpdate', {
            detail: {
                hash: this.hashVisualization.currentHash,
                count: this.hashVisualization.hashCount,
                hashRate: this.miningState.currentHashRate
            }
        });
        document.dispatchEvent(event);
    }
    
    // ========================================
    // ESTADÍSTICAS DE RED
    // ========================================
    
    updateNetworkStats() {
        // Simular actualización de estadísticas de red
        this.networkStats.activeMiners += Math.floor(Math.random() * 3) - 1;
        this.networkStats.totalMiningPower = this.networkStats.activeMiners * (Math.random() * 2 + 1);
        this.networkStats.blocks24h += Math.floor(Math.random() * 2);
        this.networkStats.rsc24h = this.networkStats.blocks24h * 0.5;
        
        // Ajustar dificultad ocasionalmente
        if (Math.random() < 0.01) { // 1% de probabilidad cada actualización
            this.adjustDifficulty();
        }
    }
    
    adjustDifficulty() {
        const oldDifficulty = this.miningState.currentDifficulty;
        const adjustment = (Math.random() - 0.5) * 0.2; // ±10% ajuste
        this.miningState.currentDifficulty = Math.max(0.1, oldDifficulty + adjustment);
        this.networkStats.networkDifficulty = this.miningState.currentDifficulty;
        
        this.addToRecentActivity('difficulty_adjustment', 
            `Dificultad ajustada: ${this.miningState.currentDifficulty.toFixed(2)}x`, null);
    }
    
    // ========================================
    // ACTIVIDAD RECIENTE
    // ========================================
    
    addToRecentActivity(type, message, amount) {
        const activity = {
            type: type,
            message: message,
            timestamp: new Date(),
            amount: amount
        };
        
        this.recentActivity.unshift(activity);
        
        // Mantener solo los últimos 50 elementos
        if (this.recentActivity.length > 50) {
            this.recentActivity = this.recentActivity.slice(0, 50);
        }
        
        // Emitir evento para la UI
        this.emitActivityUpdate(activity);
    }
    
    emitActivityUpdate(activity) {
        const event = new CustomEvent('activityUpdate', {
            detail: activity
        });
        document.dispatchEvent(event);
    }
    
    // ========================================
    // FUNCIONES DE BALANCE Y EVENTOS
    // ========================================
    
    initializeUserBalance() {
        // Inicializar balance del usuario si no existe
        const savedData = localStorage.getItem('rsc_user_balance');
        if (!savedData) {
            this.miningState.userBalance = 0;
            const userData = {
                id: 'test_user_123',
                balance: 0,
                lastUpdate: new Date().toISOString()
            };
            localStorage.setItem('rsc_user_balance', JSON.stringify(userData));
            console.log('💰 Balance inicializado: 0.00000000 RSC');
        } else {
            const userData = JSON.parse(savedData);
            this.miningState.userBalance = userData.balance || 0;
            console.log('💰 Balance cargado:', this.miningState.userBalance.toFixed(8), 'RSC');
        }
    }
    
    updateUserBalance(amount) {
        // Actualizar balance en el estado de minería
        if (!this.miningState.userBalance) {
            this.miningState.userBalance = 0;
        }
        this.miningState.userBalance += amount;
        
        // Guardar en localStorage para persistencia
        const userData = {
            id: this.currentSession?.user_id || 'test_user_123',
            balance: this.miningState.userBalance,
            lastUpdate: new Date().toISOString()
        };
        localStorage.setItem('rsc_user_balance', JSON.stringify(userData));
        
        console.log('💰 Balance actualizado:', this.miningState.userBalance.toFixed(8), 'RSC');
    }
    
    getUserBalance() {
        // Obtener balance desde localStorage o estado
        const savedData = localStorage.getItem('rsc_user_balance');
        if (savedData) {
            const userData = JSON.parse(savedData);
            this.miningState.userBalance = userData.balance || 0;
        }
        return this.miningState.userBalance || 0;
    }
    
    emitBalanceUpdate() {
        const event = new CustomEvent('balanceUpdate', {
            detail: {
                balance: this.miningState.userBalance,
                sessionTokens: this.miningState.sessionTokens,
                totalBlocks: this.miningState.totalBlocksFound
            }
        });
        document.dispatchEvent(event);
    }
    
    emitStatsUpdate() {
        const event = new CustomEvent('statsUpdate', {
            detail: {
                hashRate: this.miningState.currentHashRate,
                efficiency: this.miningState.efficiency,
                blocksFound: this.miningState.totalBlocksFound,
                sessionTokens: this.miningState.sessionTokens
            }
        });
        document.dispatchEvent(event);
    }
    
    // ========================================
    // FUNCIONES DE UTILIDAD
    // ========================================
    
    async checkDailyLimit(userEmail) {
        try {
            // Simular verificación de límite diario
            const today = new Date().toDateString();
            const dailyData = JSON.parse(localStorage.getItem(`rsc_daily_${userEmail}`) || '{}');
            
            if (dailyData.date === today) {
                return dailyData.mined < this.miningConfig.maxDailyReward;
            }
            
            return true;
        } catch (error) {
            console.warn('⚠️ Error al verificar límite diario:', error);
            return true;
        }
    }
    
    generateSessionHash(userId) {
        const timestamp = Date.now().toString();
        const random = Math.random().toString(36).substring(2);
        return `sim_${userId}_${timestamp}_${random}`;
    }
    
    async getClientIP() {
        return '127.0.0.1';
    }
    
    // ========================================
    // FUNCIONES DE MAINNET
    // ========================================
    
    getMainnetCountdown() {
        const now = new Date();
        const diff = this.miningConfig.mainnetCountdown - now;
        
        if (diff <= 0) {
            return {
                days: 0,
                hours: 0,
                minutes: 0,
                seconds: 0,
                isReady: true
            };
        }
        
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        
        return {
            days,
            hours,
            minutes,
            seconds,
            isReady: false
        };
    }
    
    getMainnetProgress() {
        const totalDays = 365; // Año de desarrollo
        const elapsedDays = Math.floor((new Date() - new Date('2024-01-01')) / (1000 * 60 * 60 * 24));
        const progress = Math.min(100, (elapsedDays / totalDays) * 100);
        
        return {
            progress: Math.round(progress),
            phase: this.getDevelopmentPhase(progress)
        };
    }
    
    getDevelopmentPhase(progress) {
        if (progress < 25) return 'Desarrollo Inicial';
        if (progress < 50) return 'Testing de Red';
        if (progress < 75) return 'Auditoría de Seguridad';
        if (progress < 90) return 'Preparación Mainnet';
        if (progress < 100) return 'Lanzamiento Inminente';
        return 'Mainnet Activo';
    }
    
    // ========================================
    // GETTERS PÚBLICOS
    // ========================================
    
    getMiningState() {
        return { ...this.miningState };
    }
    
    isMining() {
        return this.miningState.isMining;
    }
    
    getCurrentSession() {
        return this.currentSession;
    }
    
    getNetworkStats() {
        return { ...this.networkStats };
    }
    
    getLeaderboard() {
        return [...this.leaderboard];
    }
    
    getRecentActivity() {
        return [...this.recentActivity];
    }
    
    getMiningConfig() {
        return { ...this.miningConfig };
    }
    
    getMainnetInfo() {
        return {
            countdown: this.getMainnetCountdown(),
            progress: this.getMainnetProgress()
        };
    }
}

// Exportar para uso global
window.RSCSimulatedMiningEngine = RSCSimulatedMiningEngine;

console.log('🚀 Motor de minería simulada RSC cargado - Revolutionary Web Mining');
