/* ========================================
   SUPABASE MINING INTEGRATION - RSC CHAIN
   Conecta el frontend de minería con la base de datos
================================ */

class SupabaseMiningIntegration {
    constructor() {
        this.supabase = null;
        this.currentUser = null;
        this.isConnected = false;
        this.syncInterval = null;
        this.lastSync = 0;
        
        // Configuración de Supabase
        this.config = {
            url: 'https://unevdceponbnmhvpzlzf.supabase.co',
            anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVuZXZkY2Vwb25ibm1odnB6bHpmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU5MTIyMTksImV4cCI6MjA3MTQ4ODIxOX0.OLHbZrezgBiXWQplN1jrGD_xkARqG2uD8ECqzo05jE4'
        };
        
        this.init();
    }

    async init() {
        console.log('🚀 Inicializando integración Supabase para RSC Mining...');
        
        try {
            // Esperar a que Supabase esté disponible
            await this.waitForSupabase();
            
            // Inicializar cliente
            this.supabase = window.supabase.createClient(this.config.url, this.config.anonKey);
            
            // Verificar conexión
            await this.testConnection();
            
            // Configurar usuario
            await this.setupUser();
            
            // Iniciar sincronización
            this.startSync();
            
            console.log('✅ Integración Supabase inicializada correctamente');
            this.isConnected = true;
            
            // Emitir evento de conexión exitosa
            this.emitEvent('supabase:connected', { success: true });
            
        } catch (error) {
            console.error('❌ Error inicializando integración Supabase:', error);
            this.emitEvent('supabase:error', { error: error.message });
        }
    }

    async waitForSupabase() {
        return new Promise((resolve) => {
            const checkSupabase = () => {
                if (typeof window.supabase !== 'undefined') {
                    resolve();
                } else {
                    setTimeout(checkSupabase, 100);
                }
            };
            checkSupabase();
        });
    }

    async testConnection() {
        try {
            const { data, error } = await this.supabase
                .from('miners')
                .select('count')
                .limit(1);
            
            if (error) {
                throw new Error(`Error de conexión: ${error.message}`);
            }
            
            console.log('✅ Conexión a Supabase establecida');
            return true;
        } catch (error) {
            throw new Error(`No se pudo conectar a Supabase: ${error.message}`);
        }
    }

    async setupUser() {
        try {
            // Intentar obtener usuario existente o crear uno nuevo
            const userEmail = localStorage.getItem('rsc_user_email') || 'user@rsc.local';
            const userName = localStorage.getItem('rsc_user_name') || 'Usuario RSC';
            
            // Buscar usuario existente
            let { data: existingUser, error: searchError } = await this.supabase
                .from('miners')
                .select('*')
                .eq('email', userEmail)
                .single();
            
            if (searchError && searchError.code !== 'PGRST116') {
                throw searchError;
            }
            
            if (!existingUser) {
                // Crear nuevo usuario
                const { data: newUser, error: createError } = await this.supabase
                    .from('miners')
                    .insert([{
                        email: userEmail,
                        name: userName,
                        wallet_address: this.generateWalletAddress(),
                        hash_power: 0,
                        balance: 0,
                        blocks_mined: 0,
                        created_at: new Date().toISOString(),
                        last_active: new Date().toISOString()
                    }])
                    .select()
                    .single();
                
                if (createError) throw createError;
                existingUser = newUser;
                console.log('✅ Nuevo usuario creado en Supabase');
            }
            
            this.currentUser = existingUser;
            console.log('✅ Usuario configurado:', this.currentUser.name);
            
            // Guardar en localStorage
            localStorage.setItem('rsc_user_email', this.currentUser.email);
            localStorage.setItem('rsc_user_name', this.currentUser.name);
            localStorage.setItem('rsc_user_id', this.currentUser.id);
            
            return this.currentUser;
            
        } catch (error) {
            console.error('❌ Error configurando usuario:', error);
            throw error;
        }
    }

    generateWalletAddress() {
        return '0x' + Math.random().toString(16).substr(2, 40);
    }

    // ===== FUNCIONES DE MINERÍA =====

    async startMiningSession(sessionData) {
        try {
            if (!this.isConnected) {
                throw new Error('Supabase no está conectado');
            }

            // Generar un ID único para la sesión
            const sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

            const { data, error } = await this.supabase
                .from('mining_sessions')
                .insert([{
                    email: this.currentUser.email,
                    session_id: sessionId,
                    start_time: sessionData.start_time || new Date().toISOString(),
                    end_time: null,
                    total_hash_power: sessionData.hash_power || 0,
                    total_reward: 0,
                    is_active: true
                }])
                .select()
                .single();

            if (error) throw error;
            
            console.log('✅ Sesión de minería iniciada en Supabase');
            return sessionId; // Retornar el ID de la sesión
            
        } catch (error) {
            console.error('❌ Error iniciando sesión de minería:', error);
            throw error;
        }
    }

    async updateMiningProgress(sessionId, progressData) {
        try {
            if (!this.isConnected) return;

            const { error } = await this.supabase
                .from('mining_sessions')
                .update({
                    total_reward: progressData.totalTokens,
                    last_active: new Date().toISOString()
                })
                .eq('session_id', sessionId);

            if (error) throw error;
            
            // También actualizar el minero
            await this.updateMinerStats(progressData);
            
        } catch (error) {
            console.error('❌ Error actualizando progreso:', error);
        }
    }

    async updateMinerStats(progressData) {
        try {
            const { error } = await this.supabase
                .from('miners')
                .update({
                    hash_power: progressData.hashPower,
                    balance: progressData.totalTokens,
                    last_active: new Date().toISOString()
                })
                .eq('email', this.currentUser.email);

            if (error) throw error;
            
        } catch (error) {
            console.error('❌ Error actualizando estadísticas del minero:', error);
        }
    }

    async completeMiningSession(sessionId, finalData) {
        try {
            if (!this.isConnected) return;

            // Finalizar sesión
            const { error: sessionError } = await this.supabase
                .from('mining_sessions')
                .update({
                    is_active: false,
                    end_time: new Date().toISOString(),
                    total_reward: finalData.tokens_mined || finalData.totalTokens || 0
                })
                .eq('session_id', sessionId);

            if (sessionError) throw sessionError;

            // Registrar transacción
            const { error: transactionError } = await this.supabase
                .from('mining_transactions')
                .insert([{
                    email: this.currentUser.email,
                    hash_power: finalData.hash_rate || finalData.hashPower || 0,
                    reward: finalData.tokens_mined || finalData.totalTokens || 0,
                    block_hash: this.generateBlockHash(),
                    timestamp: new Date().toISOString()
                }]);

            if (transactionError) throw transactionError;

            // Actualizar minero
            await this.updateMinerStats(finalData);
            
            console.log('✅ Sesión de minería completada en Supabase');
            
        } catch (error) {
            console.error('❌ Error completando sesión:', error);
        }
    }

    generateBlockHash() {
        return '0x' + Math.random().toString(16).substr(2, 64);
    }

    async createMiningTransaction(transactionData) {
        try {
            if (!this.isConnected) return;

            const { error } = await this.supabase
                .from('mining_transactions')
                .insert([{
                    email: this.currentUser.email,
                    hash_power: transactionData.hash_power || 0,
                    reward: transactionData.tokens_mined || 0,
                    block_hash: this.generateBlockHash(),
                    timestamp: new Date().toISOString()
                }]);

            if (error) throw error;
            
            console.log('✅ Transacción de minería creada en Supabase');
            
        } catch (error) {
            console.error('❌ Error creando transacción:', error);
            throw error;
        }
    }

    // ===== FUNCIONES DE CONSULTA =====

    async getMinerStats() {
        try {
            if (!this.isConnected) return null;

            const { data, error } = await this.supabase
                .from('miners')
                .select('*')
                .eq('email', this.currentUser.email)
                .single();

            if (error) throw error;
            return data;
            
        } catch (error) {
            console.error('❌ Error obteniendo estadísticas:', error);
            return null;
        }
    }

    async getMiningHistory() {
        try {
            if (!this.isConnected) return [];

            const { data, error } = await this.supabase
                .from('mining_transactions')
                .select('*')
                .eq('email', this.currentUser.email)
                .order('timestamp', { ascending: false })
                .limit(50);

            if (error) throw error;
            return data || [];
            
        } catch (error) {
            console.error('❌ Error obteniendo historial:', error);
            return [];
        }
    }

    async getLeaderboard() {
        try {
            if (!this.isConnected) return [];

            const { data, error } = await this.supabase
                .from('miners')
                .select('name, hash_power, balance, blocks_mined')
                .order('hash_power', { ascending: false })
                .limit(100);

            if (error) throw error;
            return data || [];
            
        } catch (error) {
            console.error('❌ Error obteniendo leaderboard:', error);
            return [];
        }
    }

    // ===== SINCRONIZACIÓN AUTOMÁTICA =====

    startSync() {
        // Sincronizar cada 30 segundos
        this.syncInterval = setInterval(() => {
            if (this.isConnected && Date.now() - this.lastSync > 30000) {
                this.syncData();
            }
        }, 30000);
        
        console.log('🔄 Sincronización automática iniciada');
    }

    async syncData() {
        try {
            this.lastSync = Date.now();
            
            // Sincronizar estadísticas del usuario
            const stats = await this.getMinerStats();
            if (stats) {
                this.emitEvent('mining:stats:updated', { stats });
            }
            
            // Sincronizar leaderboard
            const leaderboard = await this.getLeaderboard();
            if (leaderboard.length > 0) {
                this.emitEvent('mining:leaderboard:updated', { leaderboard });
            }
            
        } catch (error) {
            console.error('❌ Error en sincronización:', error);
        }
    }

    // ===== SISTEMA DE EVENTOS =====

    emitEvent(eventName, data) {
        const event = new CustomEvent(eventName, { detail: data });
        window.dispatchEvent(event);
    }

    // ===== FUNCIONES PÚBLICAS =====

    async claimRewards(amount) {
        try {
            if (!this.isConnected) {
                throw new Error('Supabase no está conectado');
            }

            if (!amount || amount <= 0) {
                throw new Error('No hay recompensas para reclamar');
            }

            // Actualizar balance del minero
            const { error } = await this.supabase
                .from('miners')
                .update({ 
                    balance: (this.currentUser.balance || 0) + amount,
                    last_active: new Date().toISOString()
                })
                .eq('email', this.currentUser.email);

            if (error) throw error;

            // Actualizar usuario local
            this.currentUser.balance = (this.currentUser.balance || 0) + amount;
            localStorage.setItem('rsc_user_balance', this.currentUser.balance);

            console.log('✅ Recompensas reclamadas:', amount);
            this.emitEvent('mining:rewards:claimed', { amount: amount });
            
            return amount;
            
        } catch (error) {
            console.error('❌ Error reclamando recompensas:', error);
            throw error;
        }
    }

    // ===== UTILIDADES =====

    getConnectionStatus() {
        return {
            isConnected: this.isConnected,
            user: this.currentUser,
            lastSync: this.lastSync
        };
    }

    disconnect() {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
        }
        this.isConnected = false;
        console.log('🔌 Integración Supabase desconectada');
    }
}

// Crear instancia global
const supabaseMining = new SupabaseMiningIntegration();

// Exportar para uso global
if (typeof window !== 'undefined') {
    window.supabaseMining = supabaseMining;
    window.SupabaseMiningIntegration = SupabaseMiningIntegration;
}

// Para compatibilidad con módulos ES6
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SupabaseMiningIntegration, supabaseMining };
}
