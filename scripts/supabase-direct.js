/**
 * SUPABASE DIRECT CONNECTION
 * 
 * Conexión directa a Supabase sin backend
 * - Registro de usuarios
 * - Gestión de balances
 * - Sistema de referidos
 */

// Configuración de Supabase
const SUPABASE_URL = 'https://unevdceponbnmhvpzlzf.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVuZXZkY2Vwb25ibm1odnB6bHpmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU5MTIyMTksImV4cCI6MjA3MTQ4ODIxOX0.OLHbZrezgBiXWQplN1jrGD_xkARqG2uD8ECqzo05jE4';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVuZXZkY2Vwb25ibm1odnB6bHpmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTkxMjIxOSwiZXhwIjoyMDcxNDg4MjE5fQ.f0JDrO3AJrgpB8UwCuwHFXw8WWAY9Y-kCojWCaKIhjU';

class SupabaseDirect {
    constructor() {
        this.url = SUPABASE_URL;
        this.key = SUPABASE_SERVICE_KEY; // Usar service key para bypass RLS
        this.isConnected = false;
        this.init();
    }

    /**
     * Inicializar conexión
     */
    async init() {
        try {
            console.log('🔗 Conectando directamente a Supabase...');
            
            // Verificar conexión
            const response = await fetch(`${this.url}/rest/v1/users?select=count`, {
                headers: {
                    'apikey': this.key,
                    'Authorization': `Bearer ${this.key}`
                }
            });
            
            if (response.ok) {
                this.isConnected = true;
                console.log('✅ Conectado directamente a Supabase');
            } else {
                console.warn('⚠️ Error conectando a Supabase');
            }
        } catch (error) {
            console.error('❌ Error inicializando Supabase:', error);
        }
    }

    /**
     * Registrar usuario
     */
    async registerUser(userData) {
        try {
            const { email, username, referralCode } = userData;
            
            // Generar código de referral único
            const referralCodeGenerated = this.generateReferralCode();
            
            // Crear usuario
            const user = {
                email: email,
                username: username,
                balance: 0,
                referral_code: referralCodeGenerated,
                referred_by: referralCode || null,
                created_at: new Date().toISOString(),
                is_active: true
            };

            // Insertar en Supabase
            const response = await fetch(`${this.url}/rest/v1/users`, {
                method: 'POST',
                headers: {
                    'apikey': this.key,
                    'Authorization': `Bearer ${this.key}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=representation'
                },
                body: JSON.stringify(user)
            });

            if (response.ok) {
                const result = await response.json();
                console.log('✅ Usuario registrado en Supabase:', result[0]);
                return {
                    success: true,
                    user: result[0]
                };
            } else {
                const error = await response.json();
                console.error('❌ Error registrando usuario:', error);
                return {
                    success: false,
                    error: error.message || 'Error registrando usuario'
                };
            }
        } catch (error) {
            console.error('❌ Error registrando usuario:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Obtener usuario por email
     */
    async getUserByEmail(email) {
        try {
            const response = await fetch(`${this.url}/rest/v1/users?email=eq.${email}&select=*`, {
                headers: {
                    'apikey': this.key,
                    'Authorization': `Bearer ${this.key}`
                }
            });

            if (response.ok) {
                const result = await response.json();
                return result[0] || null;
            }
            return null;
        } catch (error) {
            console.error('❌ Error obteniendo usuario:', error);
            return null;
        }
    }

    /**
     * Actualizar balance de usuario por email
     */
    async updateUserBalance(email, newBalance) {
        try {
            const response = await fetch(`${this.url}/rest/v1/users?email=eq.${email}`, {
                method: 'PATCH',
                headers: {
                    'apikey': this.key,
                    'Authorization': `Bearer ${this.key}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    balance: newBalance,
                    updated_at: new Date().toISOString()
                })
            });

            if (response.ok) {
                console.log('✅ Balance actualizado en Supabase:', newBalance);
                return true;
            } else {
                console.error('❌ Error actualizando balance');
                return false;
            }
        } catch (error) {
            console.error('❌ Error actualizando balance:', error);
            return false;
        }
    }

    /**
     * Crear sesión de minería
     */
    async createMiningSession(sessionData) {
        try {
            const session = {
                user_id: sessionData.userId,
                session_id: sessionData.sessionId,
                start_time: new Date(sessionData.startTime).toISOString(),
                end_time: new Date(sessionData.endTime).toISOString(),
                duration_ms: sessionData.endTime - sessionData.startTime,
                tokens_mined: 0,
                hash_rate: sessionData.hashRate || 1000,
                efficiency: sessionData.efficiency || 100,
                status: 'active',
                created_at: new Date().toISOString()
            };

            const response = await fetch(`${this.url}/rest/v1/mining_sessions`, {
                method: 'POST',
                headers: {
                    'apikey': this.key,
                    'Authorization': `Bearer ${this.key}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=representation'
                },
                body: JSON.stringify(session)
            });

            if (response.ok) {
                const result = await response.json();
                console.log('✅ Sesión de minería creada:', result[0]);
                return {
                    success: true,
                    session: result[0]
                };
            } else {
                const error = await response.json();
                console.error('❌ Error creando sesión:', error);
                return {
                    success: false,
                    error: error.message
                };
            }
        } catch (error) {
            console.error('❌ Error creando sesión:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Actualizar sesión de minería
     */
    async updateMiningSession(sessionId, updateData) {
        try {
            const response = await fetch(`${this.url}/rest/v1/mining_sessions?session_id=eq.${sessionId}`, {
                method: 'PATCH',
                headers: {
                    'apikey': this.key,
                    'Authorization': `Bearer ${this.key}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ...updateData,
                    updated_at: new Date().toISOString()
                })
            });

            if (response.ok) {
                console.log('✅ Sesión de minería actualizada');
                return true;
            } else {
                console.error('❌ Error actualizando sesión');
                return false;
            }
        } catch (error) {
            console.error('❌ Error actualizando sesión:', error);
            return false;
        }
    }

    /**
     * Crear transacción
     */
    async createTransaction(transactionData) {
        try {
            const transaction = {
                user_id: transactionData.userId,
                type: transactionData.type,
                amount: transactionData.amount,
                balance_before: transactionData.balanceBefore,
                balance_after: transactionData.balanceAfter,
                reference_id: transactionData.referenceId,
                description: transactionData.description,
                created_at: new Date().toISOString()
            };

            const response = await fetch(`${this.url}/rest/v1/transactions`, {
                method: 'POST',
                headers: {
                    'apikey': this.key,
                    'Authorization': `Bearer ${this.key}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(transaction)
            });

            if (response.ok) {
                console.log('✅ Transacción creada');
                return true;
            } else {
                console.error('❌ Error creando transacción');
                return false;
            }
        } catch (error) {
            console.error('❌ Error creando transacción:', error);
            return false;
        }
    }

    /**
     * Generar código de referral
     */
    generateReferralCode() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < 8; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    /**
     * Verificar conexión
     */
    async checkConnection() {
        try {
            const response = await fetch(`${this.url}/rest/v1/users?select=count`, {
                headers: {
                    'apikey': this.key,
                    'Authorization': `Bearer ${this.key}`
                }
            });
            return response.ok;
        } catch (error) {
            return false;
        }
    }
}

// Crear instancia global
window.SupabaseDirect = new SupabaseDirect();

console.log('🔗 Supabase Direct cargado');
