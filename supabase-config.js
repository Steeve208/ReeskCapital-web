// RSC Chain Mining Platform - Supabase Configuration
// Reemplaza estos valores con tus credenciales de Supabase

const SUPABASE_CONFIG = {
    // URL de tu proyecto Supabase
    url: 'https://unevdceponbnmhvpzlzf.supabase.co',
    
    // Anon key pública de tu proyecto
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVuZXZkY2Vwb25ibm1odnB6bHpmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU5MTIyMTksImV4cCI6MjA3MTQ4ODIxOX0.OLHbZrezgBiXWQplN1jrGD_xkARqG2uD8ECqzo05jE4',
    
    // Configuración de la base de datos
    database: {
        // Nombre de las tablas
        tables: {
            users_balances: 'users_balances',
            mining_history: 'mining_history',
            system_stats: 'system_stats'
        },
        
            // Configuración de RLS (Row Level Security)
    enableRLS: false, // Deshabilitado temporalmente para pruebas
        
        // Configuración de autenticación
        auth: {
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: true
        }
    },
    
    // Configuración de la plataforma de minería
    mining: {
        // Tokens por minuto de minería activa
        tokensPerMinute: 10,
        
        // Límite diario máximo por usuario (en RSC)
        dailyLimit: 2.0,
        
        // Intervalo de actualización en milisegundos
        updateInterval: 1000,
        
        // Timeout de sesión en milisegundos (5 minutos)
        sessionTimeout: 300000,
        
        // Configuración de dificultad
        difficulty: {
            min: 1,
            max: 10,
            default: 3
        }
    },
    
    // Configuración de notificaciones
    notifications: {
        // Duración de notificaciones en milisegundos
        duration: 5000,
        
        // Posición de notificaciones
        position: 'top-right',
        
        // Sonidos habilitados
        sounds: true
    },
    
    // Configuración de persistencia
    persistence: {
        // Usar localStorage
        useLocalStorage: true,
        
        // Usar Supabase
        useSupabase: true,
        
        // Sincronización automática
        autoSync: true,
        
        // Intervalo de sincronización en milisegundos
        syncInterval: 30000
    },
    
    // Configuración de desarrollo
    development: {
        // Modo debug
        debug: false,
        
        // Logs detallados
        verbose: false,
        
        // Simular latencia de red
        simulateLatency: false,
        
        // Tiempo de latencia simulado en milisegundos
        latencyMs: 100
    }
};

// Función para obtener configuración
function getSupabaseConfig() {
    return SUPABASE_CONFIG;
}

// Función para validar configuración
function validateSupabaseConfig() {
    const config = SUPABASE_CONFIG;
    
    if (!config.url || config.url === 'https://your-project-id.supabase.co') {
        console.error('❌ Error: Debes configurar la URL de Supabase');
        return false;
    }
    
    if (!config.anonKey || config.anonKey === 'your-anon-key-here') {
        console.error('❌ Error: Debes configurar la anon key de Supabase');
        return false;
    }
    
    if (!config.url.includes('supabase.co')) {
        console.error('❌ Error: La URL de Supabase no es válida');
        return false;
    }
    
    console.log('✅ Configuración de Supabase válida');
    return true;
}

// Función para inicializar Supabase
async function initializeSupabase() {
    try {
        if (!validateSupabaseConfig()) {
            throw new Error('Configuración de Supabase inválida');
        }
        
        const config = SUPABASE_CONFIG;
        
        // Crear cliente Supabase
        const supabase = window.supabase.createClient(config.url, config.anonKey);
        
        // Verificar conexión
        const { data, error } = await supabase
            .from(config.database.tables.users_balances)
            .select('count')
            .limit(1);
        
        if (error) {
            throw new Error(`Error de conexión: ${error.message}`);
        }
        
        console.log('✅ Conexión a Supabase establecida correctamente');
        return supabase;
        
    } catch (error) {
        console.error('❌ Error al inicializar Supabase:', error.message);
        throw error;
    }
}

// Función para obtener estadísticas de la base de datos
async function getDatabaseStats(supabase) {
    try {
        const config = SUPABASE_CONFIG;
        
        // Obtener estadísticas del sistema
        const { data: systemStats, error: systemError } = await supabase
            .from(config.database.tables.system_stats)
            .select('*')
            .single();
        
        if (systemError) throw systemError;
        
        // Obtener total de usuarios
        const { count: userCount, error: userError } = await supabase
            .from(config.database.tables.users_balances)
            .select('*', { count: 'exact', head: true });
        
        if (userError) throw userError;
        
        return {
            systemStats,
            userCount,
            timestamp: new Date().toISOString()
        };
        
    } catch (error) {
        console.error('Error al obtener estadísticas:', error);
        return null;
    }
}

// Función para crear usuario en la base de datos
async function createUser(supabase, email) {
    try {
        const config = SUPABASE_CONFIG;
        
        const userData = {
            email: email,
            balance: 0.0,
            total_mined: 0.0,
            total_mining_time: 0,
            sessions_today: 0,
            daily_limit_used: 0.0
        };
        
        const { data, error } = await supabase
            .from(config.database.tables.users_balances)
            .insert([userData])
            .select()
            .single();
        
        if (error) throw error;
        
        console.log('✅ Usuario creado:', data);
        return data;
        
    } catch (error) {
        console.error('Error al crear usuario:', error);
        throw error;
    }
}

// Función para actualizar balance de usuario
async function updateUserBalance(supabase, email, newBalance, tokensEarned, sessionDuration) {
    try {
        const config = SUPABASE_CONFIG;
        
        const updateData = {
            balance: newBalance,
            total_mined: newBalance,
            total_mining_time: sessionDuration,
            daily_limit_used: tokensEarned,
            sessions_today: 1,
            last_mine_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        
        const { data, error } = await supabase
            .from(config.database.tables.users_balances)
            .update(updateData)
            .eq('email', email)
            .select()
            .single();
        
        if (error) throw error;
        
        console.log('✅ Balance actualizado:', data);
        return data;
        
    } catch (error) {
        console.error('Error al actualizar balance:', error);
        throw error;
    }
}

// Función para obtener historial de minería
async function getMiningHistory(supabase, email, limit = 10) {
    try {
        const config = SUPABASE_CONFIG;
        
        const { data, error } = await supabase
            .from(config.database.tables.mining_history)
            .select('*')
            .eq('user_email', email)
            .order('created_at', { ascending: false })
            .limit(limit);
        
        if (error) throw error;
        
        return data || [];
        
    } catch (error) {
        console.error('Error al obtener historial:', error);
        return [];
    }
}

// Función para registrar sesión de minería
async function recordMiningSession(supabase, email, sessionData) {
    try {
        const config = SUPABASE_CONFIG;
        
        const sessionRecord = {
            user_email: email,
            session_start: sessionData.startTime,
            session_end: sessionData.endTime,
            tokens_earned: sessionData.tokensEarned,
            session_duration: sessionData.duration
        };
        
        const { data, error } = await supabase
            .from(config.database.tables.mining_history)
            .insert([sessionRecord])
            .select()
            .single();
        
        if (error) throw error;
        
        console.log('✅ Sesión registrada:', data);
        return data;
        
    } catch (error) {
        console.error('Error al registrar sesión:', error);
        throw error;
    }
}

// Exportar funciones para uso global
if (typeof window !== 'undefined') {
    window.SUPABASE_CONFIG = SUPABASE_CONFIG;
    window.getSupabaseConfig = getSupabaseConfig;
    window.validateSupabaseConfig = validateSupabaseConfig;
    window.initializeSupabase = initializeSupabase;
    window.getDatabaseStats = getDatabaseStats;
    window.createUser = createUser;
    window.updateUserBalance = updateUserBalance;
    window.getMiningHistory = getMiningHistory;
    window.recordMiningSession = recordMiningSession;
}

// Exportar para módulos ES6
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        SUPABASE_CONFIG,
        getSupabaseConfig,
        validateSupabaseConfig,
        initializeSupabase,
        getDatabaseStats,
        createUser,
        updateUserBalance,
        getMiningHistory,
        recordMiningSession
    };
}
