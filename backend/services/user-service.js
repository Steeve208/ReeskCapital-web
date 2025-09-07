/**
 * RSC USER SERVICE
 * 
 * Servicio completo de gestión de usuarios con sistema de referidos
 * - Registro de usuarios
 * - Sistema de códigos de invitación
 * - Gestión de referidos y comisiones
 * - Integración con minería
 */

import { supabase, TABLES, TRANSACTION_TYPES, COMMISSION_RATES } from '../supabase-config.js';

export class UserService {
    constructor() {
        this.table = TABLES.USERS;
        this.referralsTable = TABLES.REFERRALS;
        this.transactionsTable = TABLES.TRANSACTIONS;
        this.referralCodesTable = TABLES.REFERRAL_CODES;
    }

    /**
     * Registrar nuevo usuario
     */
    async registerUser(userData) {
        try {
            const { email, username, referralCode } = userData;

            // Validar datos de entrada
            if (!email || !username) {
                throw new Error('Email y username son requeridos');
            }

            // Verificar si el email ya existe
            const existingUser = await this.getUserByEmail(email);
            if (existingUser) {
                throw new Error('El email ya está registrado');
            }

            // Verificar si el username ya existe
            const existingUsername = await this.getUserByUsername(username);
            if (existingUsername) {
                throw new Error('El username ya está en uso');
            }

            // Verificar código de referral si se proporciona
            let referrerId = null;
            if (referralCode) {
                const referrer = await this.getUserByReferralCode(referralCode);
                if (!referrer) {
                    throw new Error('Código de referral inválido');
                }
                referrerId = referrer.id;
            }

            // Llamar a la función de registro en Supabase
            const { data, error } = await supabase.rpc('register_user', {
                p_email: email,
                p_username: username,
                p_referral_code: referralCode
            });

            if (error) {
                throw new Error(`Error registrando usuario: ${error.message}`);
            }

            // Obtener datos completos del usuario
            const newUser = await this.getUserById(data.user_id);

            console.log(`✅ Usuario registrado: ${username} (${email})`);
            if (referrerId) {
                console.log(`🔗 Referido por: ${referralCode}`);
            }

            return {
                success: true,
                user: newUser,
                referralCode: data.referral_code,
                referredBy: data.referred_by
            };

        } catch (error) {
            console.error('❌ Error registrando usuario:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Obtener usuario por ID
     */
    async getUserById(userId) {
        try {
            const { data, error } = await supabase
                .from(this.table)
                .select('*')
                .eq('id', userId)
                .single();

            if (error) {
                throw new Error(`Error obteniendo usuario: ${error.message}`);
            }

            return data;
        } catch (error) {
            console.error('❌ Error obteniendo usuario por ID:', error);
            return null;
        }
    }

    /**
     * Obtener usuario por email
     */
    async getUserByEmail(email) {
        try {
            const { data, error } = await supabase
                .from(this.table)
                .select('*')
                .eq('email', email)
                .single();

            if (error && error.code !== 'PGRST116') {
                throw new Error(`Error obteniendo usuario: ${error.message}`);
            }

            return data;
        } catch (error) {
            console.error('❌ Error obteniendo usuario por email:', error);
            return null;
        }
    }

    /**
     * Obtener usuario por username
     */
    async getUserByUsername(username) {
        try {
            const { data, error } = await supabase
                .from(this.table)
                .select('*')
                .eq('username', username)
                .single();

            if (error && error.code !== 'PGRST116') {
                throw new Error(`Error obteniendo usuario: ${error.message}`);
            }

            return data;
        } catch (error) {
            console.error('❌ Error obteniendo usuario por username:', error);
            return null;
        }
    }

    /**
     * Obtener usuario por código de referral
     */
    async getUserByReferralCode(referralCode) {
        try {
            const { data, error } = await supabase
                .from(this.table)
                .select('*')
                .eq('referral_code', referralCode)
                .eq('is_active', true)
                .single();

            if (error && error.code !== 'PGRST116') {
                throw new Error(`Error obteniendo usuario: ${error.message}`);
            }

            return data;
        } catch (error) {
            console.error('❌ Error obteniendo usuario por código de referral:', error);
            return null;
        }
    }

    /**
     * Actualizar balance de usuario
     */
    async updateUserBalance(userId, amount, transactionType, description = null) {
        try {
            // Llamar a la función de actualización de balance
            const { data, error } = await supabase.rpc('update_user_balance', {
                p_user_id: userId,
                p_amount: amount,
                p_transaction_type: transactionType,
                p_description: description
            });

            if (error) {
                throw new Error(`Error actualizando balance: ${error.message}`);
            }

            console.log(`💰 Balance actualizado: ${amount} RSC para usuario ${userId}`);
            console.log(`💸 Comisión pagada: ${data.commission_paid} RSC`);

            return {
                success: true,
                balanceBefore: data.balance_before,
                balanceAfter: data.balance_after,
                commissionPaid: data.commission_paid
            };

        } catch (error) {
            console.error('❌ Error actualizando balance:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Obtener referidos de un usuario
     */
    async getUserReferrals(userId) {
        try {
            const { data, error } = await supabase
                .from(this.referralsTable)
                .select(`
                    *,
                    referred_user:referred_id (
                        id,
                        username,
                        email,
                        balance,
                        created_at
                    )
                `)
                .eq('referrer_id', userId);

            if (error) {
                throw new Error(`Error obteniendo referidos: ${error.message}`);
            }

            return data;
        } catch (error) {
            console.error('❌ Error obteniendo referidos:', error);
            return [];
        }
    }

    /**
     * Obtener estadísticas de referidos
     */
    async getReferralStats(userId) {
        try {
            const { data, error } = await supabase
                .from(this.referralsTable)
                .select('*')
                .eq('referrer_id', userId);

            if (error) {
                throw new Error(`Error obteniendo estadísticas de referidos: ${error.message}`);
            }

            const totalReferrals = data.length;
            const totalCommission = data.reduce((sum, ref) => sum + parseFloat(ref.total_commission || 0), 0);

            return {
                totalReferrals,
                totalCommission,
                referrals: data
            };
        } catch (error) {
            console.error('❌ Error obteniendo estadísticas de referidos:', error);
            return {
                totalReferrals: 0,
                totalCommission: 0,
                referrals: []
            };
        }
    }

    /**
     * Obtener historial de transacciones
     */
    async getUserTransactions(userId, limit = 50, offset = 0) {
        try {
            const { data, error } = await supabase
                .from(this.transactionsTable)
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .range(offset, offset + limit - 1);

            if (error) {
                throw new Error(`Error obteniendo transacciones: ${error.message}`);
            }

            return data;
        } catch (error) {
            console.error('❌ Error obteniendo transacciones:', error);
            return [];
        }
    }

    /**
     * Obtener balance actual
     */
    async getUserBalance(userId) {
        try {
            const user = await this.getUserById(userId);
            if (!user) {
                throw new Error('Usuario no encontrado');
            }

            return {
                balance: parseFloat(user.balance),
                username: user.username,
                email: user.email
            };
        } catch (error) {
            console.error('❌ Error obteniendo balance:', error);
            return {
                balance: 0,
                username: null,
                email: null
            };
        }
    }

    /**
     * Validar código de referral
     */
    async validateReferralCode(referralCode) {
        try {
            const user = await this.getUserByReferralCode(referralCode);
            
            if (!user) {
                return {
                    valid: false,
                    message: 'Código de referral inválido'
                };
            }

            return {
                valid: true,
                message: 'Código de referral válido',
                referrer: {
                    id: user.id,
                    username: user.username,
                    email: user.email
                }
            };
        } catch (error) {
            console.error('❌ Error validando código de referral:', error);
            return {
                valid: false,
                message: 'Error validando código de referral'
            };
        }
    }

    /**
     * Obtener ranking de usuarios por balance
     */
    async getUserRanking(limit = 100) {
        try {
            const { data, error } = await supabase
                .from(this.table)
                .select('id, username, email, balance, created_at')
                .eq('is_active', true)
                .order('balance', { ascending: false })
                .limit(limit);

            if (error) {
                throw new Error(`Error obteniendo ranking: ${error.message}`);
            }

            return data.map((user, index) => ({
                rank: index + 1,
                ...user,
                balance: parseFloat(user.balance)
            }));
        } catch (error) {
            console.error('❌ Error obteniendo ranking:', error);
            return [];
        }
    }

    /**
     * Obtener estadísticas generales
     */
    async getGeneralStats() {
        try {
            // Total de usuarios
            const { count: totalUsers } = await supabase
                .from(this.table)
                .select('*', { count: 'exact', head: true })
                .eq('is_active', true);

            // Total de referidos
            const { count: totalReferrals } = await supabase
                .from(this.referralsTable)
                .select('*', { count: 'exact', head: true });

            // Balance total del sistema
            const { data: balanceData } = await supabase
                .from(this.table)
                .select('balance')
                .eq('is_active', true);

            const totalBalance = balanceData.reduce((sum, user) => sum + parseFloat(user.balance || 0), 0);

            return {
                totalUsers,
                totalReferrals,
                totalBalance,
                averageBalance: totalUsers > 0 ? totalBalance / totalUsers : 0
            };
        } catch (error) {
            console.error('❌ Error obteniendo estadísticas generales:', error);
            return {
                totalUsers: 0,
                totalReferrals: 0,
                totalBalance: 0,
                averageBalance: 0
            };
        }
    }

    /**
     * Desactivar usuario
     */
    async deactivateUser(userId) {
        try {
            const { error } = await supabase
                .from(this.table)
                .update({ is_active: false, updated_at: new Date().toISOString() })
                .eq('id', userId);

            if (error) {
                throw new Error(`Error desactivando usuario: ${error.message}`);
            }

            console.log(`✅ Usuario ${userId} desactivado`);
            return { success: true };
        } catch (error) {
            console.error('❌ Error desactivando usuario:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Reactivar usuario
     */
    async reactivateUser(userId) {
        try {
            const { error } = await supabase
                .from(this.table)
                .update({ is_active: true, updated_at: new Date().toISOString() })
                .eq('id', userId);

            if (error) {
                throw new Error(`Error reactivando usuario: ${error.message}`);
            }

            console.log(`✅ Usuario ${userId} reactivado`);
            return { success: true };
        } catch (error) {
            console.error('❌ Error reactivando usuario:', error);
            return { success: false, error: error.message };
        }
    }
}

// Exportar instancia del servicio
export const userService = new UserService();
export default userService;
