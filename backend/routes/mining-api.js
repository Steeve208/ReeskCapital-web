/**
 * 🚀 RSC MINING API - BACKEND REVOLUCIONARIO
 * 
 * API completa para el sistema de minería cuántica
 * - Endpoints de minería avanzados
 * - Sincronización en tiempo real
 * - Sistema anti-fraude
 * - Métricas en tiempo real
 * - WebSocket para comunicación bidireccional
 */

import express from 'express';
import { supabase } from '../supabase-config.js';
import { authenticateToken } from '../security/auth.js';
import { rateLimit } from '../security/rateLimit.js';
import { validateMiningData } from '../utils/validation.js';
import { calculateMiningReward } from '../utils/mining-calculations.js';
import { logSecurityEvent } from '../utils/security-logger.js';

const router = express.Router();

// Middleware de autenticación para todas las rutas
router.use(authenticateToken);

// Middleware de rate limiting
router.use(rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // máximo 100 requests por ventana
    message: 'Too many requests from this IP'
}));

/**
 * POST /api/mining/start
 * Iniciar sesión de minería
 */
router.post('/start', async (req, res) => {
    try {
        const { algorithm, device_fingerprint } = req.body;
        const userId = req.user.id;
        
        // Validar datos
        if (!algorithm || !device_fingerprint) {
            return res.status(400).json({
                success: false,
                error: 'Algorithm and device fingerprint required'
            });
        }
        
        // Verificar si ya hay una sesión activa
        const { data: activeSession, error: sessionError } = await supabase
            .from('mining_sessions')
            .select('*')
            .eq('user_id', userId)
            .eq('status', 'active')
            .single();
        
        if (activeSession && !sessionError) {
            return res.status(409).json({
                success: false,
                error: 'Mining session already active',
                session_id: activeSession.session_token
            });
        }
        
        // Generar session token único
        const sessionToken = generateSessionToken();
        
        // Obtener datos del usuario
        const { data: user, error: userError } = await supabase
            .from('users')
            .select('mining_power, mining_level, balance')
            .eq('id', userId)
            .single();
        
        if (userError || !user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }
        
        // Calcular poder de minería
        const miningPower = await calculateMiningPower(userId, algorithm);
        
        // Crear sesión de minería
        const { data: session, error: createError } = await supabase
            .from('mining_sessions')
            .insert({
                user_id: userId,
                session_token: sessionToken,
                algorithm_type: algorithm,
                mining_power_multiplier: miningPower,
                start_time: new Date().toISOString(),
                device_fingerprint: device_fingerprint,
                status: 'active'
            })
            .select()
            .single();
        
        if (createError) {
            console.error('Error creating mining session:', createError);
            return res.status(500).json({
                success: false,
                error: 'Failed to create mining session'
            });
        }
        
        // Log de seguridad
        await logSecurityEvent(userId, 'mining_started', {
            session_id: sessionToken,
            algorithm: algorithm,
            device_fingerprint: device_fingerprint
        });
        
        res.json({
            success: true,
            session_id: sessionToken,
            algorithm: algorithm,
            mining_power: miningPower,
            start_time: session.start_time,
            user_balance: user.balance
        });
        
    } catch (error) {
        console.error('Error starting mining session:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

/**
 * POST /api/mining/stop
 * Detener sesión de minería
 */
router.post('/stop', async (req, res) => {
    try {
        const { session_id } = req.body;
        const userId = req.user.id;
        
        if (!session_id) {
            return res.status(400).json({
                success: false,
                error: 'Session ID required'
            });
        }
        
        // Obtener sesión activa
        const { data: session, error: sessionError } = await supabase
            .from('mining_sessions')
            .select('*')
            .eq('user_id', userId)
            .eq('session_token', session_id)
            .eq('status', 'active')
            .single();
        
        if (sessionError || !session) {
            return res.status(404).json({
                success: false,
                error: 'Active mining session not found'
            });
        }
        
        // Calcular duración
        const endTime = new Date();
        const startTime = new Date(session.start_time);
        const durationMs = endTime - startTime;
        const durationSeconds = Math.floor(durationMs / 1000);
        
        // Calcular tokens minados
        const tokensMined = await calculateMiningReward(session, durationSeconds);
        
        // Actualizar sesión
        const { error: updateError } = await supabase
            .from('mining_sessions')
            .update({
                end_time: endTime.toISOString(),
                duration_seconds: durationSeconds,
                tokens_mined: tokensMined,
                status: 'completed'
            })
            .eq('id', session.id);
        
        if (updateError) {
            console.error('Error updating mining session:', updateError);
            return res.status(500).json({
                success: false,
                error: 'Failed to update mining session'
            });
        }
        
        // Actualizar balance del usuario
        const { error: balanceError } = await supabase
            .from('users')
            .update({
                balance: supabase.raw('balance + ?', [tokensMined]),
                total_mined: supabase.raw('total_mined + ?', [tokensMined])
            })
            .eq('id', userId);
        
        if (balanceError) {
            console.error('Error updating user balance:', balanceError);
            return res.status(500).json({
                success: false,
                error: 'Failed to update user balance'
            });
        }
        
        // Registrar transacción
        await supabase
            .from('transactions')
            .insert({
                user_id: userId,
                type: 'mining',
                amount: tokensMined,
                balance_before: session.balance_before || 0,
                balance_after: (session.balance_before || 0) + tokensMined,
                reference_id: session.id,
                reference_type: 'mining_session',
                description: `Mining session completed - ${durationSeconds}s`
            });
        
        // Procesar comisiones de referidos
        await processReferralCommissions(userId, tokensMined);
        
        // Log de seguridad
        await logSecurityEvent(userId, 'mining_stopped', {
            session_id: session_id,
            tokens_mined: tokensMined,
            duration: durationSeconds
        });
        
        res.json({
            success: true,
            session_id: session_id,
            tokens_mined: tokensMined,
            duration: durationSeconds,
            end_time: endTime.toISOString()
        });
        
    } catch (error) {
        console.error('Error stopping mining session:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

/**
 * POST /api/mining/sync
 * Sincronizar datos de minería
 */
router.post('/sync', async (req, res) => {
    try {
        const { session_id, tokens_mined, hash_rate, efficiency, energy_consumed } = req.body;
        const userId = req.user.id;
        
        if (!session_id) {
            return res.status(400).json({
                success: false,
                error: 'Session ID required'
            });
        }
        
        // Validar datos
        const validation = validateMiningData({
            tokens_mined,
            hash_rate,
            efficiency,
            energy_consumed
        });
        
        if (!validation.valid) {
            return res.status(400).json({
                success: false,
                error: 'Invalid mining data',
                details: validation.errors
            });
        }
        
        // Obtener sesión
        const { data: session, error: sessionError } = await supabase
            .from('mining_sessions')
            .select('*')
            .eq('user_id', userId)
            .eq('session_token', session_id)
            .single();
        
        if (sessionError || !session) {
            return res.status(404).json({
                success: false,
                error: 'Mining session not found'
            });
        }
        
        // Actualizar sesión
        const { error: updateError } = await supabase
            .from('mining_sessions')
            .update({
                tokens_mined: tokens_mined,
                hash_rate: hash_rate,
                peak_hash_rate: Math.max(session.peak_hash_rate || 0, hash_rate),
                average_efficiency: efficiency,
                energy_consumed: energy_consumed,
                carbon_footprint: energy_consumed * 0.0005
            })
            .eq('id', session.id);
        
        if (updateError) {
            console.error('Error syncing mining session:', updateError);
            return res.status(500).json({
                success: false,
                error: 'Failed to sync mining session'
            });
        }
        
        // Registrar métricas en tiempo real
        await supabase
            .from('real_time_metrics')
            .insert({
                user_id: userId,
                metric_type: 'mining_sync',
                metric_value: tokens_mined,
                metadata: {
                    hash_rate: hash_rate,
                    efficiency: efficiency,
                    energy_consumed: energy_consumed,
                    session_id: session_id
                }
            });
        
        res.json({
            success: true,
            session_id: session_id,
            synced_at: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Error syncing mining data:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

/**
 * GET /api/mining/status
 * Obtener estado de minería del usuario
 */
router.get('/status', async (req, res) => {
    try {
        const userId = req.user.id;
        
        // Obtener sesión activa
        const { data: activeSession, error: sessionError } = await supabase
            .from('mining_sessions')
            .select('*')
            .eq('user_id', userId)
            .eq('status', 'active')
            .single();
        
        // Obtener datos del usuario
        const { data: user, error: userError } = await supabase
            .from('users')
            .select('balance, total_mined, mining_power, mining_level')
            .eq('id', userId)
            .single();
        
        if (userError || !user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }
        
        // Obtener estadísticas de minería
        const { data: stats, error: statsError } = await supabase
            .from('mining_sessions')
            .select('tokens_mined, duration_seconds, hash_rate, efficiency')
            .eq('user_id', userId)
            .eq('status', 'completed')
            .order('created_at', { ascending: false })
            .limit(10);
        
        res.json({
            success: true,
            user: {
                balance: user.balance,
                total_mined: user.total_mined,
                mining_power: user.mining_power,
                mining_level: user.mining_level
            },
            active_session: activeSession ? {
                session_id: activeSession.session_token,
                algorithm: activeSession.algorithm_type,
                start_time: activeSession.start_time,
                tokens_mined: activeSession.tokens_mined,
                hash_rate: activeSession.hash_rate,
                efficiency: activeSession.average_efficiency
            } : null,
            recent_sessions: stats || []
        });
        
    } catch (error) {
        console.error('Error getting mining status:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

/**
 * GET /api/mining/algorithms
 * Obtener algoritmos disponibles
 */
router.get('/algorithms', async (req, res) => {
    try {
        const { data: algorithms, error } = await supabase
            .from('mining_algorithms')
            .select('*')
            .eq('is_active', true)
            .order('unlock_level', { ascending: true });
        
        if (error) {
            console.error('Error getting algorithms:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to get algorithms'
            });
        }
        
        res.json({
            success: true,
            algorithms: algorithms
        });
        
    } catch (error) {
        console.error('Error getting algorithms:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

/**
 * GET /api/mining/leaderboard
 * Obtener leaderboard de minería
 */
router.get('/leaderboard', async (req, res) => {
    try {
        const { limit = 50, period = 'all' } = req.query;
        
        let query = supabase
            .from('users')
            .select('username, total_mined, mining_level, mining_power')
            .eq('is_active', true)
            .order('total_mined', { ascending: false })
            .limit(parseInt(limit));
        
        // Filtrar por período si se especifica
        if (period !== 'all') {
            const now = new Date();
            let startDate;
            
            switch (period) {
                case 'day':
                    startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
                    break;
                case 'week':
                    startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                    break;
                case 'month':
                    startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                    break;
            }
            
            if (startDate) {
                query = query.gte('last_active', startDate.toISOString());
            }
        }
        
        const { data: leaderboard, error } = await query;
        
        if (error) {
            console.error('Error getting leaderboard:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to get leaderboard'
            });
        }
        
        res.json({
            success: true,
            leaderboard: leaderboard,
            period: period,
            total: leaderboard.length
        });
        
    } catch (error) {
        console.error('Error getting leaderboard:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

/**
 * POST /api/mining/equipment/purchase
 * Comprar equipo de minería
 */
router.post('/equipment/purchase', async (req, res) => {
    try {
        const { equipment_type, equipment_name, power_level, efficiency_boost, cost } = req.body;
        const userId = req.user.id;
        
        // Validar datos
        if (!equipment_type || !equipment_name || !power_level || !efficiency_boost || !cost) {
            return res.status(400).json({
                success: false,
                error: 'All equipment parameters required'
            });
        }
        
        // Verificar balance suficiente
        const { data: user, error: userError } = await supabase
            .from('users')
            .select('balance')
            .eq('id', userId)
            .single();
        
        if (userError || !user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }
        
        if (user.balance < cost) {
            return res.status(400).json({
                success: false,
                error: 'Insufficient balance'
            });
        }
        
        // Comprar equipo
        const { data: equipment, error: purchaseError } = await supabase
            .from('mining_equipment')
            .insert({
                user_id: userId,
                equipment_type: equipment_type,
                equipment_name: equipment_name,
                power_level: power_level,
                efficiency_boost: efficiency_boost,
                energy_consumption: power_level * 0.1
            })
            .select()
            .single();
        
        if (purchaseError) {
            console.error('Error purchasing equipment:', purchaseError);
            return res.status(500).json({
                success: false,
                error: 'Failed to purchase equipment'
            });
        }
        
        // Actualizar balance
        const { error: balanceError } = await supabase
            .from('users')
            .update({
                balance: supabase.raw('balance - ?', [cost])
            })
            .eq('id', userId);
        
        if (balanceError) {
            console.error('Error updating balance:', balanceError);
            return res.status(500).json({
                success: false,
                error: 'Failed to update balance'
            });
        }
        
        // Registrar transacción
        await supabase
            .from('transactions')
            .insert({
                user_id: userId,
                type: 'purchase',
                amount: -cost,
                balance_before: user.balance,
                balance_after: user.balance - cost,
                reference_id: equipment.id,
                reference_type: 'equipment',
                description: `Purchased ${equipment_name}`
            });
        
        res.json({
            success: true,
            equipment: equipment,
            new_balance: user.balance - cost
        });
        
    } catch (error) {
        console.error('Error purchasing equipment:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

/**
 * GET /api/mining/equipment
 * Obtener equipos del usuario
 */
router.get('/equipment', async (req, res) => {
    try {
        const userId = req.user.id;
        
        const { data: equipment, error } = await supabase
            .from('mining_equipment')
            .select('*')
            .eq('user_id', userId)
            .eq('is_active', true)
            .order('purchased_at', { ascending: false });
        
        if (error) {
            console.error('Error getting equipment:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to get equipment'
            });
        }
        
        res.json({
            success: true,
            equipment: equipment
        });
        
    } catch (error) {
        console.error('Error getting equipment:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

// Funciones auxiliares

/**
 * Generar session token único
 */
function generateSessionToken() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2);
    return `session_${timestamp}_${random}`;
}

/**
 * Calcular poder de minería
 */
async function calculateMiningPower(userId, algorithm) {
    try {
        // Obtener datos del usuario
        const { data: user, error: userError } = await supabase
            .from('users')
            .select('mining_power, mining_level')
            .eq('id', userId)
            .single();
        
        if (userError || !user) {
            return 1.0;
        }
        
        // Obtener datos del algoritmo
        const { data: algorithmData, error: algoError } = await supabase
            .from('mining_algorithms')
            .select('base_efficiency')
            .eq('name', algorithm)
            .single();
        
        if (algoError || !algorithmData) {
            return user.mining_power;
        }
        
        // Calcular poder total
        const basePower = user.mining_power;
        const levelMultiplier = 1.0 + (user.mining_level - 1) * 0.1;
        const algorithmMultiplier = algorithmData.base_efficiency / 100.0;
        
        return basePower * levelMultiplier * algorithmMultiplier;
        
    } catch (error) {
        console.error('Error calculating mining power:', error);
        return 1.0;
    }
}

/**
 * Procesar comisiones de referidos
 */
async function processReferralCommissions(userId, amount) {
    try {
        // Obtener referrer del usuario
        const { data: user, error: userError } = await supabase
            .from('users')
            .select('referred_by')
            .eq('id', userId)
            .single();
        
        if (userError || !user || !user.referred_by) {
            return;
        }
        
        // Obtener tasa de comisión
        const { data: referral, error: referralError } = await supabase
            .from('referrals')
            .select('commission_rate, level')
            .eq('referred_id', userId)
            .eq('referrer_id', user.referred_by)
            .single();
        
        if (referralError || !referral) {
            return;
        }
        
        // Calcular comisión
        const commissionRate = referral.commission_rate || 0.1;
        const levelBonus = 1.0 + (referral.level - 1) * 0.05;
        const commissionAmount = amount * commissionRate * levelBonus;
        
        // Actualizar balance del referrer
        const { error: balanceError } = await supabase
            .from('users')
            .update({
                balance: supabase.raw('balance + ?', [commissionAmount])
            })
            .eq('id', user.referred_by);
        
        if (balanceError) {
            console.error('Error updating referrer balance:', balanceError);
            return;
        }
        
        // Actualizar comisión total
        await supabase
            .from('referrals')
            .update({
                total_commission: supabase.raw('total_commission + ?', [commissionAmount])
            })
            .eq('referrer_id', user.referred_by)
            .eq('referred_id', userId);
        
        // Registrar transacción
        await supabase
            .from('transactions')
            .insert({
                user_id: user.referred_by,
                type: 'referral_commission',
                amount: commissionAmount,
                reference_id: userId,
                reference_type: 'referral',
                description: `Commission from referred user mining (Level ${referral.level})`
            });
        
    } catch (error) {
        console.error('Error processing referral commissions:', error);
    }
}

export default router;
