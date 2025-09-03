// 🔐 Sistema de Autenticación Segura para RSC Mining
// Incluye hash de contraseñas, salt único y protección contra ataques

// Función para generar salt único
function generateSalt(length = 32) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

// Función para hashear contraseña con salt
async function hashPassword(password, salt) {
    try {
        // Usar Web Crypto API para hash seguro
        const encoder = new TextEncoder();
        const data = encoder.encode(password + salt);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        return hashHex;
    } catch (error) {
        console.error('Error al hashear contraseña:', error);
        throw new Error('Error de seguridad al procesar contraseña');
    }
}

// Función para verificar contraseña
async function verifyPassword(password, storedHash, storedSalt) {
    try {
        const inputHash = await hashPassword(password, storedSalt);
        return inputHash === storedHash;
    } catch (error) {
        console.error('Error al verificar contraseña:', error);
        return false;
    }
}

// Función para crear usuario con contraseña segura
async function createSecureUserInSupabase(email, username, password) {
    const supabase = createSupabaseClient();
    if (!supabase) {
        throw new Error('No se pudo crear cliente Supabase');
    }
    
    try {
        console.log('🔐 Creando usuario seguro con email:', email);
        
        // Generar salt único
        const salt = generateSalt();
        
        // Hashear contraseña
        const passwordHash = await hashPassword(password, salt);
        
        // Datos del usuario
        const userData = {
            email: email,
            username: username,
            password_hash: passwordHash,
            salt: salt,
            balance: 0.0,
            account_status: 'active',
            failed_login_attempts: 0,
            created_at: new Date().toISOString()
        };
        
        console.log('📝 Datos seguros a insertar:', {
            email: userData.email,
            username: userData.username,
            balance: userData.balance,
            status: userData.account_status
        });
        
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
                    continue;
                }
                
                if (data) {
                    console.log(`✅ Usuario creado exitosamente en tabla: ${tableName}`);
                    // No retornar la contraseña hasheada por seguridad
                    createdUser = {
                        email: data.email,
                        username: data.username,
                        balance: data.balance,
                        account_status: data.account_status,
                        created_at: data.created_at
                    };
                    break;
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
        console.error('❌ Error al crear usuario seguro:', error);
        throw error;
    }
}

// Función para autenticar usuario con contraseña
async function authenticateUserInSupabase(email, password) {
    const supabase = createSupabaseClient();
    if (!supabase) {
        throw new Error('No se pudo crear cliente Supabase');
    }
    
    try {
        console.log('🔐 Autenticando usuario:', email);
        
        // Buscar usuario en diferentes tablas
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
                        continue;
                    }
                    console.warn(`⚠️ Error en tabla ${tableName}:`, error.message);
                    continue;
                }
                
                if (data) {
                    console.log(`✅ Usuario encontrado en tabla: ${tableName}`);
                    userData = data;
                    break;
                }
            } catch (tableError) {
                console.warn(`⚠️ Error accediendo tabla ${tableName}:`, tableError.message);
                continue;
            }
        }
        
        if (!userData) {
            console.log('❌ Usuario no encontrado');
            return { success: false, error: 'Usuario no encontrado' };
        }
        
        // Verificar si la cuenta está bloqueada
        if (userData.account_status === 'suspended' || userData.account_status === 'banned') {
            return { 
                success: false, 
                error: `Cuenta ${userData.account_status}. Contacta al administrador.` 
            };
        }
        
        if (userData.locked_until && new Date(userData.locked_until) > new Date()) {
            const lockTime = new Date(userData.locked_until).toLocaleString();
            return { 
                success: false, 
                error: `Cuenta bloqueada hasta: ${lockTime}` 
            };
        }
        
        // Verificar contraseña
        if (!userData.password_hash || !userData.salt) {
            console.warn('⚠️ Usuario sin contraseña configurada');
            return { 
                success: false, 
                error: 'Usuario sin contraseña configurada. Usa el registro.' 
            };
        }
        
        const isPasswordValid = await verifyPassword(password, userData.password_hash, userData.salt);
        
        if (isPasswordValid) {
            console.log('✅ Contraseña válida');
            
            // Resetear intentos fallidos
            try {
                await supabase
                    .from('users_balances')
                    .update({ 
                        failed_login_attempts: 0,
                        locked_until: null,
                        last_activity: new Date().toISOString()
                    })
                    .eq('email', email);
            } catch (updateError) {
                console.warn('⚠️ No se pudo actualizar último login:', updateError.message);
            }
            
            // Retornar datos del usuario (sin información sensible)
            return {
                success: true,
                user: {
                    email: userData.email,
                    username: userData.username,
                    balance: userData.balance,
                    account_status: userData.account_status,
                    last_activity: userData.last_activity
                }
            };
        } else {
            console.log('❌ Contraseña incorrecta');
            
            // Incrementar intentos fallidos
            try {
                await supabase
                    .from('users_balances')
                    .update({ 
                        failed_login_attempts: (userData.failed_login_attempts || 0) + 1,
                        last_activity: new Date().toISOString()
                    })
                    .eq('email', email);
            } catch (updateError) {
                console.warn('⚠️ No se pudo actualizar intentos fallidos:', updateError.message);
            }
            
            return { 
                success: false, 
                error: 'Contraseña incorrecta' 
            };
        }
        
    } catch (error) {
        console.error('❌ Error en autenticación:', error);
        throw error;
    }
}

// Función para cambiar contraseña
async function changePasswordInSupabase(email, currentPassword, newPassword) {
    try {
        // Primero autenticar con contraseña actual
        const authResult = await authenticateUserInSupabase(email, currentPassword);
        
        if (!authResult.success) {
            return { success: false, error: authResult.error };
        }
        
        // Generar nuevo salt y hash
        const newSalt = generateSalt();
        const newPasswordHash = await hashPassword(newPassword, newSalt);
        
        // Actualizar en Supabase
        const supabase = createSupabaseClient();
        const { data, error } = await supabase
            .from('users_balances')
            .update({ 
                password_hash: newPasswordHash,
                salt: newSalt,
                last_activity: new Date().toISOString()
            })
            .eq('email', email)
            .select()
            .single();
        
        if (error) {
            throw error;
        }
        
        console.log('✅ Contraseña cambiada exitosamente');
        return { success: true };
        
    } catch (error) {
        console.error('❌ Error al cambiar contraseña:', error);
        return { success: false, error: error.message };
    }
}

// Función para verificar si email ya existe
async function checkEmailExistsInSupabase(email) {
    const supabase = createSupabaseClient();
    if (!supabase) {
        throw new Error('No se pudo crear cliente Supabase');
    }
    
    try {
        const possibleTables = ['users_balances', 'miners', 'users', 'user_balances'];
        
        for (const tableName of possibleTables) {
            try {
                const { data, error } = await supabase
                    .from(tableName)
                    .select('email')
                    .eq('email', email)
                    .single();
                
                if (!error && data) {
                    return true; // Email existe
                }
            } catch (tableError) {
                continue;
            }
        }
        
        return false; // Email no existe
        
    } catch (error) {
        console.error('❌ Error al verificar email:', error);
        throw error;
    }
}

// Exportar funciones para uso global
window.SecureAuth = {
    createSecureUser: createSecureUserInSupabase,
    authenticateUser: authenticateUserInSupabase,
    changePassword: changePasswordInSupabase,
    checkEmailExists: checkEmailExistsInSupabase,
    generateSalt: generateSalt,
    hashPassword: hashPassword,
    verifyPassword: verifyPassword
};

console.log('🔐 Sistema de autenticación segura cargado');
