// RSC Chain Mining Platform - Configuración Simplificada de Supabase
// Este archivo proporciona funciones básicas para conectar con Supabase

const SUPABASE_CONFIG = {
    url: 'https://unevdceponbnmhvpzlzf.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVuZXZkY2Vwb25ibm1odnB6bHpmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU5MTIyMTksImV4cCI6MjA3MTQ4ODIxOX0.OLHbZrezgBiXWQplN1jrGD_xkARqG2uD8ECqzo05jE4'
};

// Función para crear cliente Supabase
function createSupabaseClient() {
    if (typeof supabase === 'undefined') {
        console.error('❌ Supabase SDK no está cargado');
        return null;
    }
    
    try {
        const client = supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
        console.log('✅ Cliente Supabase creado');
        return client;
    } catch (error) {
        console.error('❌ Error al crear cliente Supabase:', error);
        return null;
    }
}

// Función para crear usuario
async function createUserInSupabase(email, username) {
    const supabase = createSupabaseClient();
    if (!supabase) {
        throw new Error('No se pudo crear cliente Supabase');
    }
    
    try {
        console.log('🔍 Intentando crear usuario con email:', email, 'y username:', username);
        
        // Insertar campos esenciales incluyendo username
        const userData = {
            email: email,
            username: username,
            balance: 0.0
        };
        
        console.log('📝 Datos a insertar:', userData);
        
        // Intentar crear en diferentes tablas posibles
        const possibleTables = ['users_balances', 'miners', 'users', 'user_balances'];
        let createdUser = null;
        
        for (const tableName of possibleTables) {
            try {
                console.log(`🔍 Intentando crear en tabla: ${tableName}`);
                
                const { data, error } = await supabase
                    .from(tableName)
                    .insert([userData])
                    .select()
                    .single();
                
                if (error) {
                    console.warn(`⚠️ Error creando en tabla ${tableName}:`, error.message);
                    continue; // Intentar siguiente tabla
                }
                
                if (data) {
                    console.log(`✅ Usuario creado exitosamente en tabla: ${tableName}`, data);
                    createdUser = data;
                    break; // Usuario creado, salir del loop
                }
            } catch (tableError) {
                console.warn(`⚠️ Error accediendo tabla ${tableName}:`, tableError.message);
                continue;
            }
        }
        
        if (!createdUser) {
            throw new Error('No se pudo crear usuario en ninguna tabla disponible');
        }
        
        return createdUser;
        
    } catch (error) {
        console.error('❌ Error al crear usuario:', error);
        throw error;
    }
}

// Función para obtener usuario por email
async function getUserByEmailFromSupabase(email) {
    const supabase = createSupabaseClient();
    if (!supabase) {
        throw new Error('No se pudo crear cliente Supabase');
    }
    
    try {
        console.log('🔍 Buscando usuario con email:', email);
        
        // Intentar buscar en diferentes tablas posibles
        const possibleTables = ['users_balances', 'miners', 'users', 'user_balances'];
        let userData = null;
        
        for (const tableName of possibleTables) {
            try {
                console.log(`🔍 Buscando en tabla: ${tableName}`);
                
                const { data, error } = await supabase
                    .from(tableName)
                    .select('*')
                    .eq('email', email)
                    .single();
                
                if (error) {
                    if (error.code === 'PGRST116') {
                        console.log(`⚠️ Usuario no encontrado en tabla: ${tableName}`);
                        continue; // Intentar siguiente tabla
                    }
                    console.warn(`⚠️ Error en tabla ${tableName}:`, error.message);
                    continue;
                }
                
                if (data) {
                    console.log(`✅ Usuario encontrado en tabla: ${tableName}`, data);
                    userData = data;
                    break; // Usuario encontrado, salir del loop
                }
            } catch (tableError) {
                console.warn(`⚠️ Error accediendo tabla ${tableName}:`, tableError.message);
                continue;
            }
        }
        
        if (!userData) {
            console.log('❌ Usuario no encontrado en ninguna tabla');
            return null;
        }
        
        return userData;
        
    } catch (error) {
        console.error('❌ Error al obtener usuario:', error);
        throw error;
    }
}

// Función para actualizar balance
async function updateUserBalanceInSupabase(email, newBalance, tokensEarned, sessionDuration) {
    const supabase = createSupabaseClient();
    if (!supabase) {
        throw new Error('No se pudo crear cliente Supabase');
    }
    
    try {
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
            .from('users_balances')
            .update(updateData)
            .eq('email', email)
            .select()
            .single();
        
        if (error) {
            throw error;
        }
        
        console.log('✅ Balance actualizado en Supabase:', data);
        return data;
        
    } catch (error) {
        console.error('❌ Error al actualizar balance:', error);
        throw error;
    }
}

// Función para obtener historial de minería
async function getMiningHistoryFromSupabase(email, limit = 10) {
    const supabase = createSupabaseClient();
    if (!supabase) {
        throw new Error('No se pudo crear cliente Supabase');
    }
    
    try {
        const { data, error } = await supabase
            .from('mining_history')
            .select('*')
            .eq('user_email', email)
            .order('created_at', { ascending: false })
            .limit(limit);
        
        if (error) {
            throw error;
        }
        
        return data || [];
        
    } catch (error) {
        console.error('❌ Error al obtener historial:', error);
        return [];
    }
}

// Función para registrar sesión de minería
async function recordMiningSessionInSupabase(email, sessionData) {
    const supabase = createSupabaseClient();
    if (!supabase) {
        throw new Error('No se pudo crear cliente Supabase');
    }
    
    try {
        const sessionRecord = {
            user_email: email,
            session_start: sessionData.startTime,
            session_end: sessionData.endTime,
            tokens_earned: sessionData.tokensEarned,
            session_duration: sessionData.duration
        };
        
        const { data, error } = await supabase
            .from('mining_history')
            .insert([sessionRecord])
            .select()
            .single();
        
        if (error) {
            throw error;
        }
        
        console.log('✅ Sesión registrada en Supabase:', data);
        return data;
        
    } catch (error) {
        console.error('❌ Error al registrar sesión:', error);
        throw error;
    }
}

// Exportar funciones para uso global
if (typeof window !== 'undefined') {
    window.SUPABASE_CONFIG = SUPABASE_CONFIG;
    window.createSupabaseClient = createSupabaseClient;
    window.createUserInSupabase = createUserInSupabase;
    window.getUserByEmailFromSupabase = getUserByEmailFromSupabase;
    window.updateUserBalanceInSupabase = updateUserBalanceInSupabase;
    window.getMiningHistoryFromSupabase = getMiningHistoryFromSupabase;
    window.recordMiningSessionInSupabase = recordMiningSessionInSupabase;
}
