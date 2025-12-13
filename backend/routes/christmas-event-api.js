/**
 * 🎄 CHRISTMAS EVENT API
 * Endpoints para el evento navideño comunitario
 */

const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabase');

// Middleware de autenticación
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Token de acceso requerido' });
    }

    // Verificar token (implementar según tu sistema)
    req.user = { id: 'user_123' }; // Placeholder
    next();
};

// ========================================
// OBTENER ESTADÍSTICAS DEL EVENTO PARA USUARIO
// ========================================

router.get('/user-stats/:userId', authenticateToken, async (req, res) => {
    try {
        const { userId } = req.params;

        // Obtener estadísticas de regalos
        const { data: gifts, error: giftsError } = await supabase
            .from('christmas_event_gifts')
            .select('*')
            .eq('user_id', userId);

        // Obtener estadísticas de referidos
        const { data: referralStats, error: referralError } = await supabase
            .from('referral_stats')
            .select('total_referrals')
            .eq('user_id', userId)
            .single();

        // Obtener estadísticas de desafíos
        const { data: challenges, error: challengesError } = await supabase
            .from('christmas_event_challenges')
            .select('*')
            .eq('user_id', userId);

        // Calcular total ganado
        const totalEarned = (gifts?.reduce((sum, g) => sum + (g.claimed ? g.reward : 0), 0) || 0) +
                           (challenges?.reduce((sum, c) => sum + (c.claimed ? c.reward : 0), 0) || 0);

        res.json({
            success: true,
            gifts: gifts || [],
            referralCount: referralStats?.total_referrals || 0,
            challenges: challenges || [],
            totalEarned: totalEarned
        });

    } catch (error) {
        console.error('Error obteniendo estadísticas del evento:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// ========================================
// RECLAMAR REGALO
// ========================================

router.post('/claim-gift', authenticateToken, async (req, res) => {
    try {
        const { userId, giftId } = req.body;

        // Verificar que el regalo esté desbloqueado
        const { data: gift, error: giftError } = await supabase
            .from('christmas_event_gifts')
            .select('*')
            .eq('user_id', userId)
            .eq('gift_id', giftId)
            .single();

        if (giftError || !gift) {
            return res.status(404).json({ error: 'Gift not found' });
        }

        if (!gift.unlocked) {
            return res.status(400).json({ error: 'Gift is not unlocked yet' });
        }

        if (gift.claimed) {
            return res.status(400).json({ error: 'Gift already claimed' });
        }

        // Marcar como reclamado
        const { error: updateError } = await supabase
            .from('christmas_event_gifts')
            .update({ 
                claimed: true,
                claimed_at: new Date().toISOString()
            })
            .eq('user_id', userId)
            .eq('gift_id', giftId);

        if (updateError) {
            throw updateError;
        }

        // Agregar recompensa al balance del usuario
        const { error: balanceError } = await supabase
            .from('users')
            .update({
                balance: supabase.raw(`balance + ${gift.reward}`)
            })
            .eq('id', userId);

        if (balanceError) {
            console.error('Error updating balance:', balanceError);
        }

        res.json({
            success: true,
            reward: gift.reward,
            message: `You claimed ${gift.reward} RSK!`
        });

    } catch (error) {
        console.error('Error claiming gift:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// ========================================
// RECLAMAR MILESTONE DE REFERIDOS
// ========================================

router.post('/claim-referral-milestone', authenticateToken, async (req, res) => {
    try {
        const { userId, milestone } = req.body;

        const milestones = {
            1: 25,
            3: 100,
            5: 200,
            10: 500
        };

        const reward = milestones[milestone];
        if (!reward) {
            return res.status(400).json({ error: 'Invalid milestone' });
        }

        // Verificar que el usuario tenga suficientes referidos
        const { data: stats, error: statsError } = await supabase
            .from('referral_stats')
            .select('total_referrals')
            .eq('user_id', userId)
            .single();

        if (statsError || !stats || stats.total_referrals < milestone) {
            return res.status(400).json({ error: 'Milestone not reached' });
        }

        // Verificar que no haya sido reclamado antes
        const { data: claimed, error: claimedError } = await supabase
            .from('christmas_event_milestones')
            .select('*')
            .eq('user_id', userId)
            .eq('milestone', milestone)
            .single();

        if (claimed) {
            return res.status(400).json({ error: 'Milestone already claimed' });
        }

        // Marcar como reclamado
        await supabase
            .from('christmas_event_milestones')
            .insert([{
                user_id: userId,
                milestone: milestone,
                reward: reward,
                claimed_at: new Date().toISOString()
            }]);

        // Agregar recompensa
        await supabase
            .from('users')
            .update({
                balance: supabase.raw(`balance + ${reward}`)
            })
            .eq('id', userId);

        res.json({
            success: true,
            reward: reward,
            message: `You claimed ${reward} RSK for ${milestone} referrals!`
        });

    } catch (error) {
        console.error('Error claiming milestone:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// ========================================
// RECLAMAR DESAFÍO
// ========================================

router.post('/claim-challenge', authenticateToken, async (req, res) => {
    try {
        const { userId, challengeId } = req.body;

        const challenges = {
            dailyMining: { reward: 5, requirement: 30 },
            telegramActivity: { reward: 10, requirement: 5 },
            socialShare: { reward: 15, requirement: 1 }
        };

        const challenge = challenges[challengeId];
        if (!challenge) {
            return res.status(400).json({ error: 'Invalid challenge' });
        }

        // Verificar progreso del desafío
        const { data: challengeData, error: challengeError } = await supabase
            .from('christmas_event_challenges')
            .select('*')
            .eq('user_id', userId)
            .eq('challenge_id', challengeId)
            .single();

        if (challengeError || !challengeData) {
            return res.status(404).json({ error: 'Challenge not found' });
        }

        if (challengeData.progress < challenge.requirement) {
            return res.status(400).json({ error: 'Challenge not completed' });
        }

        if (challengeData.claimed) {
            return res.status(400).json({ error: 'Challenge already claimed' });
        }

        // Marcar como reclamado
        await supabase
            .from('christmas_event_challenges')
            .update({
                claimed: true,
                claimed_at: new Date().toISOString()
            })
            .eq('user_id', userId)
            .eq('challenge_id', challengeId);

        // Agregar recompensa
        await supabase
            .from('users')
            .update({
                balance: supabase.raw(`balance + ${challenge.reward}`)
            })
            .eq('id', userId);

        res.json({
            success: true,
            reward: challenge.reward,
            message: `You claimed ${challenge.reward} RSK!`
        });

    } catch (error) {
        console.error('Error claiming challenge:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// ========================================
// OBTENER LEADERBOARD DEL EVENTO
// ========================================

router.get('/leaderboard/:type', async (req, res) => {
    try {
        const { type } = req.params;
        const { limit = 10 } = req.query;

        let leaderboard = [];

        if (type === 'referrals') {
            // Top referrers
            const { data, error } = await supabase
                .from('referral_stats')
                .select(`
                    total_referrals,
                    users!inner(username, email)
                `)
                .order('total_referrals', { ascending: false })
                .limit(parseInt(limit));

            if (!error && data) {
                leaderboard = data.map((item, index) => ({
                    rank: index + 1,
                    name: item.users?.username || item.users?.email || 'Anonymous',
                    value: item.total_referrals,
                    stats: `${item.total_referrals} referrals`
                }));
            }
        } else if (type === 'mining') {
            // Top miners
            const { data, error } = await supabase
                .from('users')
                .select('username, email, total_mined')
                .eq('is_active', true)
                .order('total_mined', { ascending: false })
                .limit(parseInt(limit));

            if (!error && data) {
                leaderboard = data.map((item, index) => ({
                    rank: index + 1,
                    name: item.username || item.email || 'Anonymous',
                    value: item.total_mined || 0,
                    stats: `${item.total_mined || 0} RSK mined`
                }));
            }
        } else if (type === 'activity') {
            // Most active (combinación de mining + referrals)
            // Por ahora usar total_mined como métrica
            const { data, error } = await supabase
                .from('users')
                .select('username, email, total_mined, mining_level')
                .eq('is_active', true)
                .order('mining_level', { ascending: false })
                .limit(parseInt(limit));

            if (!error && data) {
                leaderboard = data.map((item, index) => ({
                    rank: index + 1,
                    name: item.username || item.email || 'Anonymous',
                    value: item.mining_level || 0,
                    stats: `Level ${item.mining_level || 0}`
                }));
            }
        }

        res.json({
            success: true,
            leaderboard: leaderboard,
            type: type
        });

    } catch (error) {
        console.error('Error getting leaderboard:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// ========================================
// OBTENER ESTADÍSTICAS COMUNITARIAS
// ========================================

router.get('/community-stats', async (req, res) => {
    try {
        // Total de usuarios activos
        const { count: totalUsers } = await supabase
            .from('users')
            .select('*', { count: 'exact', head: true })
            .eq('is_active', true);

        // Total de referidos
        const { count: totalReferrals } = await supabase
            .from('referrals')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'active');

        // Total minado
        const { data: miningData } = await supabase
            .from('users')
            .select('total_mined')
            .eq('is_active', true);

        const totalMined = miningData?.reduce((sum, user) => sum + (user.total_mined || 0), 0) || 0;

        // Telegram members - usar servicio de Telegram
        let telegramMembers = 0;
        try {
            const telegramService = require('../services/telegram-service');
            telegramMembers = await telegramService.getGroupMemberCount();
        } catch (error) {
            console.error('Error getting Telegram members:', error);
        }

        res.json({
            success: true,
            stats: {
                totalUsers: totalUsers || 0,
                totalReferrals: totalReferrals || 0,
                totalMined: totalMined,
                telegramMembers: telegramMembers
            },
            milestones: {
                telegram1000: {
                    target: 1000,
                    current: telegramMembers,
                    reward: 25,
                    completed: telegramMembers >= 1000
                }
            }
        });

    } catch (error) {
        console.error('Error getting community stats:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// ========================================
// ACTUALIZAR PROGRESO DE DESAFÍO
// ========================================

router.post('/update-challenge-progress', authenticateToken, async (req, res) => {
    try {
        const { userId, challengeId, progress } = req.body;

        // Upsert del progreso
        const { error } = await supabase
            .from('christmas_event_challenges')
            .upsert([{
                user_id: userId,
                challenge_id: challengeId,
                progress: progress,
                last_updated: new Date().toISOString()
            }], {
                onConflict: 'user_id,challenge_id'
            });

        if (error) {
            throw error;
        }

        res.json({
            success: true,
            message: 'Progress updated'
        });

    } catch (error) {
        console.error('Error updating challenge progress:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

module.exports = router;

