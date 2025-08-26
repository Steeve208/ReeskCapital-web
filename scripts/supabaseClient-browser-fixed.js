/* ================================
   SUPABASE CLIENT CONFIGURATION - BROWSER FIXED
================================ */

// Configuración de Supabase para navegador
const SUPABASE_CONFIG = {
    url: 'https://unevdceponbnmhvpzlzf.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVuZXZkY2Vwb25ibm1odnB6bHpmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU5MTIyMTksImV4cCI6MjA3MTQ4ODIxOX0.OLHbZrezgBiXWQplN1jrGD_xkARqG2uD8ECqzo05jE4'
};

// Cliente Supabase global
let supabaseClient = null;

// Función para inicializar Supabase
function initializeSupabase() {
    try {
        if (typeof window.supabase !== 'undefined') {
            supabaseClient = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
            console.log('✅ Supabase client inicializado correctamente');
            return true;
        } else {
            console.warn('⚠️ Supabase no está disponible aún. Esperando...');
            return false;
        }
    } catch (error) {
        console.error('❌ Error inicializando Supabase:', error);
        return false;
    }
}

// Función para esperar a que Supabase esté disponible
function waitForSupabase(maxAttempts = 30, interval = 1000) {
    return new Promise((resolve, reject) => {
        let attempts = 0;
        
        const checkSupabase = () => {
            attempts++;
            console.log(`🔄 Intento ${attempts}/${maxAttempts} - Verificando Supabase...`);
            
            if (typeof window.supabase !== 'undefined') {
                console.log('✅ Supabase detectado, inicializando...');
                if (initializeSupabase()) {
                    resolve(true);
                } else {
                    reject(new Error('Falló la inicialización después de detectar Supabase'));
                }
            } else if (attempts >= maxAttempts) {
                reject(new Error(`Supabase no disponible después de ${maxAttempts} intentos`));
            } else {
                setTimeout(checkSupabase, interval);
            }
        };
        
        checkSupabase();
    });
}

// Helper functions para operaciones comunes
const SupabaseHelpers = {
    // Inicializar y verificar conexión
    async init() {
        if (!supabaseClient) {
            try {
                console.log('🔄 Esperando a que Supabase esté disponible...');
                await waitForSupabase();
                console.log('✅ Supabase inicializado exitosamente');
            } catch (error) {
                console.error('❌ Error esperando Supabase:', error);
                throw new Error('No se pudo inicializar Supabase: ' + error.message);
            }
        }
        
        // Test de conexión
        try {
            const { data, error } = await supabaseClient.from('miners').select('count').limit(1);
            if (error) {
                console.warn('⚠️ Advertencia de conexión:', error.message);
                // No fallar por errores de tabla, solo por errores de conexión
                if (error.code === 'PGRST116') {
                    console.log('ℹ️ Tabla no existe, pero conexión está funcionando');
                    return true;
                }
            } else {
                console.log('✅ Conexión a Supabase establecida');
            }
            return true;
        } catch (error) {
            console.error('❌ Error de conexión:', error);
            return false;
        }
    },

    // Guardar minero al iniciar minería
    async saveMiner(email, name, walletAddress = null) {
        try {
            if (!supabaseClient) {
                throw new Error('Supabase no está inicializado');
            }

            const { data, error } = await supabaseClient
                .from('miners')
                .upsert([
                    { 
                        email, 
                        name, 
                        wallet_address: walletAddress,
                        hash_power: 0, 
                        balance: 0,
                        created_at: new Date().toISOString(),
                        last_active: new Date().toISOString()
                    }
                ], { onConflict: 'email' })
                .select();

            if (error) {
                console.error("Error guardando minero:", error);
                return { success: false, error: error.message };
            } else {
                console.log("Miner registrado exitosamente:", data);
                return { success: true, data };
            }
        } catch (error) {
            console.error("Excepción guardando minero:", error);
            return { success: false, error: error.message };
        }
    },

    // Actualizar progreso de minería
    async updateMiningProgress(email, newHashPower, newBalance) {
        try {
            if (!supabaseClient) {
                throw new Error('Supabase no está inicializado');
            }

            const { data, error } = await supabaseClient
                .from('miners')
                .update({ 
                    hash_power: newHashPower,
                    balance: newBalance,
                    last_active: new Date().toISOString()
                })
                .eq('email', email)
                .select();

            if (error) {
                console.error("Error actualizando progreso:", error);
                return { success: false, error: error.message };
            } else {
                console.log("Progreso de minería actualizado:", data);
                return { success: true, data };
            }
        } catch (error) {
            console.error("Excepción actualizando progreso:", error);
            return { success: false, error: error.message };
        }
    },

    // Obtener datos del minero
    async getMiner(email) {
        try {
            if (!supabaseClient) {
                throw new Error('Supabase no está inicializado');
            }

            const { data, error } = await supabaseClient
                .from('miners')
                .select('*')
                .eq('email', email)
                .single();

            if (error) {
                console.error("Error obteniendo minero:", error);
                return { success: false, error: error.message };
            } else {
                return { success: true, data };
            }
        } catch (error) {
            console.error("Excepción obteniendo minero:", error);
            return { success: false, error: error.message };
        }
    },

    // Obtener todos los mineros para leaderboard
    async getAllMiners() {
        try {
            if (!supabaseClient) {
                throw new Error('Supabase no está inicializado');
            }

            const { data, error } = await supabaseClient
                .from('miners')
                .select('*')
                .order('hash_power', { ascending: false })
                .limit(100);

            if (error) {
                console.error("Error obteniendo mineros:", error);
                return { success: false, error: error.message };
            } else {
                return { success: true, data };
            }
        } catch (error) {
            console.error("Excepción obteniendo mineros:", error);
            return { success: false, error: error.message };
        }
    },

    // Registrar transacción de minería
    async recordMiningTransaction(email, hashPower, reward, blockHash) {
        try {
            if (!supabaseClient) {
                throw new Error('Supabase no está inicializado');
            }

            const { data, error } = await supabaseClient
                .from('mining_transactions')
                .insert([
                    {
                        email: email,
                        hash_power: hashPower,
                        reward: reward,
                        block_hash: blockHash,
                        timestamp: new Date().toISOString()
                    }
                ])
                .select();

            if (error) {
                console.error("Error registrando transacción:", error);
                return { success: false, error: error.message };
            } else {
                console.log("Transacción registrada:", data);
                return { success: true, data };
            }
        } catch (error) {
            console.error("Excepción registrando transacción:", error);
            return { success: false, error: error.message };
        }
    }
};

// Auto-inicialización cuando se carga la página
if (typeof window !== 'undefined') {
    // Función de inicialización retrasada
    const delayedInit = async () => {
        console.log('🚀 Iniciando inicialización retrasada de Supabase...');
        try {
            await SupabaseHelpers.init();
            console.log('🎉 Supabase inicializado automáticamente');
        } catch (error) {
            console.error('❌ Error en auto-inicialización:', error);
            // Reintentar después de un delay
            setTimeout(delayedInit, 5000);
        }
    };

    // Esperar a que el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(delayedInit, 2000); // Esperar 2 segundos después del DOM
        });
    } else {
        setTimeout(delayedInit, 2000); // DOM ya está listo
    }

    // También intentar en el evento load
    window.addEventListener('load', () => {
        setTimeout(delayedInit, 1000);
    });
}

// Exportar para uso global
if (typeof window !== 'undefined') {
    window.SupabaseHelpers = SupabaseHelpers;
    window.supabaseClient = supabaseClient;
}

// Para compatibilidad con módulos ES6
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SupabaseHelpers, supabaseClient };
}
