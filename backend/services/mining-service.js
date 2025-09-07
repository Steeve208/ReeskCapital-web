/**
 * RSC MINING SERVICE
 * 
 * Servicio completo de minería integrado con sistema de usuarios
 * - Gestión de sesiones de minería
 * - Sincronización con frontend
 * - Cálculo de comisiones de referidos
 * - Integración con sistema de usuarios
 */

import { supabase, TABLES, MINING_STATUS, TRANSACTION_TYPES } from '../supabase-config.js';
import { userService } from './user-service.js';

export class MiningService {
    constructor() {
        this.table = TABLES.MINING_SESSIONS;
        this.usersTable = TABLES.USERS;
        this.transactionsTable = TABLES.TRANSACTIONS;
    }

    /**
     * Iniciar sesión de minería
     */
    async startMiningSession(userId, sessionData) {
        try {
            const { sessionId, startTime, endTime, hashRate, efficiency } = sessionData;

            // Verificar que el usuario existe y está activo
            const user = await userService.getUserById(userId);
            if (!user || !user.is_active) {
                throw new Error('Usuario no encontrado o inactivo');
            }

            // Verificar si ya hay una sesión activa
            const activeSession = await this.getActiveSession(userId);
            if (activeSession) {
                throw new Error('Ya tienes una sesión de minería activa');
            }

            // Crear nueva sesión de minería
            const { data, error } = await supabase
                .from(this.table)
                .insert({
                    user_id: userId,
                    session_id: sessionId,
                    start_time: new Date(startTime).toISOString(),
                    end_time: new Date(endTime).toISOString(),
                    duration_ms: endTime - startTime,
                    hash_rate: hashRate || 1000,
                    efficiency: efficiency || 100,
                    status: MINING_STATUS.ACTIVE
                })
                .select()
                .single();

            if (error) {
                throw new Error(`Error creando sesión de minería: ${error.message}`);
            }

            console.log(`✅ Sesión de minería iniciada: ${sessionId} para usuario ${userId}`);

            return {
                success: true,
                session: data
            };

        } catch (error) {
            console.error('❌ Error iniciando sesión de minería:', error);
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
            const { tokensMined, hashRate, efficiency, status } = updateData;

            // Obtener sesión actual
            const session = await this.getSessionBySessionId(sessionId);
            if (!session) {
                throw new Error('Sesión de minería no encontrada');
            }

            // Preparar datos de actualización
            const updateFields = {
                updated_at: new Date().toISOString()
            };

            if (tokensMined !== undefined) {
                updateFields.tokens_mined = tokensMined;
            }
            if (hashRate !== undefined) {
                updateFields.hash_rate = hashRate;
            }
            if (efficiency !== undefined) {
                updateFields.efficiency = efficiency;
            }
            if (status !== undefined) {
                updateFields.status = status;
            }

            // Actualizar sesión
            const { data, error } = await supabase
                .from(this.table)
                .update(updateFields)
                .eq('session_id', sessionId)
                .select()
                .single();

            if (error) {
                throw new Error(`Error actualizando sesión: ${error.message}`);
            }

            // Si se actualizaron tokens, actualizar balance del usuario
            if (tokensMined !== undefined && tokensMined > 0) {
                const previousBalance = parseFloat(session.tokens_mined || 0);
                const newTokens = tokensMined - previousBalance;
                
                if (newTokens > 0) {
                    await userService.updateUserBalance(
                        session.user_id,
                        newTokens,
                        TRANSACTION_TYPES.MINING,
                        `Mining session: ${sessionId}`
                    );
                }
            }

            return {
                success: true,
                session: data
            };

        } catch (error) {
            console.error('❌ Error actualizando sesión de minería:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Finalizar sesión de minería
     */
    async endMiningSession(sessionId, finalData) {
        try {
            const { tokensMined, hashRate, efficiency } = finalData;

            // Obtener sesión actual
            const session = await this.getSessionBySessionId(sessionId);
            if (!session) {
                throw new Error('Sesión de minería no encontrada');
            }

            // Calcular duración real
            const endTime = new Date();
            const startTime = new Date(session.start_time);
            const durationMs = endTime - startTime;

            // Actualizar sesión como completada
            const { data, error } = await supabase
                .from(this.table)
                .update({
                    end_time: endTime.toISOString(),
                    duration_ms: durationMs,
                    tokens_mined: tokensMined || session.tokens_mined,
                    hash_rate: hashRate || session.hash_rate,
                    efficiency: efficiency || session.efficiency,
                    status: MINING_STATUS.COMPLETED,
                    updated_at: endTime.toISOString()
                })
                .eq('session_id', sessionId)
                .select()
                .single();

            if (error) {
                throw new Error(`Error finalizando sesión: ${error.message}`);
            }

            // Actualizar balance final si hay tokens minados
            if (tokensMined && tokensMined > 0) {
                const previousBalance = parseFloat(session.tokens_mined || 0);
                const finalTokens = tokensMined - previousBalance;
                
                if (finalTokens > 0) {
                    await userService.updateUserBalance(
                        session.user_id,
                        finalTokens,
                        TRANSACTION_TYPES.MINING,
                        `Final mining session: ${sessionId}`
                    );
                }
            }

            console.log(`✅ Sesión de minería finalizada: ${sessionId}`);

            return {
                success: true,
                session: data
            };

        } catch (error) {
            console.error('❌ Error finalizando sesión de minería:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Obtener sesión activa de un usuario
     */
    async getActiveSession(userId) {
        try {
            const { data, error } = await supabase
                .from(this.table)
                .select('*')
                .eq('user_id', userId)
                .eq('status', MINING_STATUS.ACTIVE)
                .single();

            if (error && error.code !== 'PGRST116') {
                throw new Error(`Error obteniendo sesión activa: ${error.message}`);
            }

            return data;
        } catch (error) {
            console.error('❌ Error obteniendo sesión activa:', error);
            return null;
        }
    }

    /**
     * Obtener sesión por session_id
     */
    async getSessionBySessionId(sessionId) {
        try {
            const { data, error } = await supabase
                .from(this.table)
                .select('*')
                .eq('session_id', sessionId)
                .single();

            if (error && error.code !== 'PGRST116') {
                throw new Error(`Error obteniendo sesión: ${error.message}`);
            }

            return data;
        } catch (error) {
            console.error('❌ Error obteniendo sesión:', error);
            return null;
        }
    }

    /**
     * Obtener historial de sesiones de un usuario
     */
    async getUserMiningHistory(userId, limit = 50, offset = 0) {
        try {
            const { data, error } = await supabase
                .from(this.table)
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .range(offset, offset + limit - 1);

            if (error) {
                throw new Error(`Error obteniendo historial: ${error.message}`);
            }

            return data;
        } catch (error) {
            console.error('❌ Error obteniendo historial de minería:', error);
            return [];
        }
    }

    /**
     * Obtener estadísticas de minería de un usuario
     */
    async getUserMiningStats(userId) {
        try {
            // Obtener todas las sesiones del usuario
            const { data: sessions, error } = await supabase
                .from(this.table)
                .select('*')
                .eq('user_id', userId);

            if (error) {
                throw new Error(`Error obteniendo estadísticas: ${error.message}`);
            }

            // Calcular estadísticas
            const totalSessions = sessions.length;
            const completedSessions = sessions.filter(s => s.status === MINING_STATUS.COMPLETED).length;
            const totalTokensMined = sessions.reduce((sum, session) => sum + parseFloat(session.tokens_mined || 0), 0);
            const totalTimeMined = sessions.reduce((sum, session) => sum + (session.duration_ms || 0), 0);
            const averageHashRate = sessions.reduce((sum, session) => sum + (session.hash_rate || 0), 0) / totalSessions || 0;
            const averageEfficiency = sessions.reduce((sum, session) => sum + (session.efficiency || 0), 0) / totalSessions || 0;

            return {
                totalSessions,
                completedSessions,
                totalTokensMined,
                totalTimeMined,
                averageHashRate,
                averageEfficiency,
                lastSession: sessions[0] || null
            };
        } catch (error) {
            console.error('❌ Error obteniendo estadísticas de minería:', error);
            return {
                totalSessions: 0,
                completedSessions: 0,
                totalTokensMined: 0,
                totalTimeMined: 0,
                averageHashRate: 0,
                averageEfficiency: 0,
                lastSession: null
            };
        }
    }

    /**
     * Obtener ranking de mineros
     */
    async getMiningRanking(limit = 100) {
        try {
            const { data, error } = await supabase
                .from(this.table)
                .select(`
                    user_id,
                    users!inner(username, email),
                    SUM(tokens_mined) as total_tokens,
                    COUNT(*) as total_sessions,
                    AVG(hash_rate) as avg_hash_rate
                `)
                .eq('status', MINING_STATUS.COMPLETED)
                .group('user_id, users.username, users.email')
                .order('total_tokens', { ascending: false })
                .limit(limit);

            if (error) {
                throw new Error(`Error obteniendo ranking: ${error.message}`);
            }

            return data.map((miner, index) => ({
                rank: index + 1,
                userId: miner.user_id,
                username: miner.users.username,
                email: miner.users.email,
                totalTokens: parseFloat(miner.total_tokens || 0),
                totalSessions: miner.total_sessions,
                averageHashRate: parseFloat(miner.avg_hash_rate || 0)
            }));
        } catch (error) {
            console.error('❌ Error obteniendo ranking de mineros:', error);
            return [];
        }
    }

    /**
     * Obtener estadísticas generales de minería
     */
    async getGeneralMiningStats() {
        try {
            // Total de sesiones
            const { count: totalSessions } = await supabase
                .from(this.table)
                .select('*', { count: 'exact', head: true });

            // Sesiones activas
            const { count: activeSessions } = await supabase
                .from(this.table)
                .select('*', { count: 'exact', head: true })
                .eq('status', MINING_STATUS.ACTIVE);

            // Total de tokens minados
            const { data: tokensData } = await supabase
                .from(this.table)
                .select('tokens_mined')
                .eq('status', MINING_STATUS.COMPLETED);

            const totalTokensMined = tokensData.reduce((sum, session) => sum + parseFloat(session.tokens_mined || 0), 0);

            // Tiempo total de minería
            const { data: timeData } = await supabase
                .from(this.table)
                .select('duration_ms')
                .eq('status', MINING_STATUS.COMPLETED);

            const totalMiningTime = timeData.reduce((sum, session) => sum + (session.duration_ms || 0), 0);

            return {
                totalSessions,
                activeSessions,
                totalTokensMined,
                totalMiningTime,
                averageTokensPerSession: totalSessions > 0 ? totalTokensMined / totalSessions : 0
            };
        } catch (error) {
            console.error('❌ Error obteniendo estadísticas generales:', error);
            return {
                totalSessions: 0,
                activeSessions: 0,
                totalTokensMined: 0,
                totalMiningTime: 0,
                averageTokensPerSession: 0
            };
        }
    }

    /**
     * Limpiar sesiones expiradas
     */
    async cleanupExpiredSessions() {
        try {
            const now = new Date();
            const expiredTime = new Date(now.getTime() - (25 * 60 * 60 * 1000)); // 25 horas atrás

            // Marcar sesiones expiradas
            const { data, error } = await supabase
                .from(this.table)
                .update({
                    status: MINING_STATUS.EXPIRED,
                    updated_at: now.toISOString()
                })
                .eq('status', MINING_STATUS.ACTIVE)
                .lt('start_time', expiredTime.toISOString())
                .select();

            if (error) {
                throw new Error(`Error limpiando sesiones expiradas: ${error.message}`);
            }

            console.log(`✅ ${data.length} sesiones expiradas marcadas`);

            return {
                success: true,
                cleanedSessions: data.length
            };
        } catch (error) {
            console.error('❌ Error limpiando sesiones expiradas:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Sincronizar datos de minería desde frontend
     */
    async syncMiningData(userId, miningData) {
        try {
            const { sessionId, tokensMined, hashRate, efficiency, isActive } = miningData;

            if (isActive) {
                // Actualizar sesión activa
                return await this.updateMiningSession(sessionId, {
                    tokensMined,
                    hashRate,
                    efficiency,
                    status: MINING_STATUS.ACTIVE
                });
            } else {
                // Finalizar sesión
                return await this.endMiningSession(sessionId, {
                    tokensMined,
                    hashRate,
                    efficiency
                });
            }
        } catch (error) {
            console.error('❌ Error sincronizando datos de minería:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
}

// Exportar instancia del servicio
export const miningService = new MiningService();
export default miningService;
