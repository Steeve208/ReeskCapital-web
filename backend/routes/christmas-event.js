/* ================================
   CHRISTMAS EVENT API ROUTES
   Endpoints para el evento navideño
   ================================ */

import express from 'express';
import { createClient } from '@supabase/supabase-js';
import ChristmasAirdropService from '../services/christmas-airdrop.js';

const router = express.Router();

// Configuración de Supabase
const supabaseConfig = {
    url: process.env.SUPABASE_URL || 'https://unevdceponbnmhvpzlzf.supabase.co',
    anonKey: process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVuZXZkY2Vwb25ibm1odnB6bHpmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU5MTIyMTksImV4cCI6MjA3MTQ4ODIxOX0.OLHbZrezgBiXWQplN1jrGD_xkARqG2uD8ECqzo05jE4',
    serviceKey: process.env.SUPABASE_SERVICE_KEY
};

const supabase = createClient(supabaseConfig.url, supabaseConfig.serviceKey || supabaseConfig.anonKey);
const airdropService = new ChristmasAirdropService(supabaseConfig);

/**
 * GET /api/christmas-event/leaderboard
 * Obtener leaderboard del evento
 */
router.get('/leaderboard', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 100;
        
        const { data, error } = await supabase
            .from('christmas_leaderboard')
            .select(`
                rank,
                total_points,
                current_streak,
                users:user_id (
                    id,
                    username,
                    email
                )
            `)
            .order('rank', { ascending: true })
            .limit(limit);
        
        if (error) throw error;
        
        res.json({
            success: true,
            leaderboard: data || []
        });
    } catch (error) {
        console.error('Error obteniendo leaderboard:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/christmas-event/user-stats/:userId
 * Obtener estadísticas del usuario
 */
router.get('/user-stats/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        
        // Obtener puntos
        const { data: pointsData, error: pointsError } = await supabase
            .from('christmas_points')
            .select('*')
            .eq('user_id', userId)
            .single();
        
        if (pointsError && pointsError.code !== 'PGRST116') throw pointsError;
        
        // Obtener regalos
        const { data: giftsData, error: giftsError } = await supabase
            .from('christmas_event_gifts')
            .select('*')
            .eq('user_id', userId);
        
        if (giftsError) throw giftsError;
        
        // Obtener desafíos
        const { data: challengesData, error: challengesError } = await supabase
            .from('christmas_event_challenges')
            .select('*')
            .eq('user_id', userId);
        
        if (challengesError) throw challengesError;
        
        // Obtener conteo de referidos
        const { data: referralsData, error: referralsError } = await supabase
            .from('referrals')
            .select('id', { count: 'exact', head: true })
            .eq('referrer_id', userId);
        
        if (referralsError) throw referralsError;
        
        res.json({
            success: true,
            stats: {
                points: pointsData || null,
                gifts: giftsData || [],
                challenges: challengesData || [],
                referrals: referralsData?.length || 0
            }
        });
    } catch (error) {
        console.error('Error obteniendo estadísticas:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * POST /api/christmas-event/claim-gift
 * Reclamar un regalo navideño
 */
router.post('/claim-gift', async (req, res) => {
    try {
        const { userId, giftId } = req.body;
        
        if (!userId || !giftId) {
            return res.status(400).json({
                success: false,
                error: 'userId y giftId son requeridos'
            });
        }
        
        // Verificar que el regalo esté desbloqueado y no reclamado
        const { data: giftData, error: giftError } = await supabase
            .from('christmas_event_gifts')
            .select('*')
            .eq('user_id', userId)
            .eq('gift_id', giftId)
            .single();
        
        if (giftError) throw giftError;
        
        if (!giftData.unlocked) {
            return res.status(400).json({
                success: false,
                error: 'El regalo no está desbloqueado'
            });
        }
        
        if (giftData.claimed) {
            return res.status(400).json({
                success: false,
                error: 'El regalo ya fue reclamado'
            });
        }
        
        // Marcar como reclamado
        await supabase
            .from('christmas_event_gifts')
            .update({
                claimed: true,
                claimed_at: new Date().toISOString()
            })
            .eq('user_id', userId)
            .eq('gift_id', giftId);
        
        res.json({
            success: true,
            message: 'Regalo reclamado exitosamente'
        });
    } catch (error) {
        console.error('Error reclamando regalo:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * POST /api/christmas-event/distribute-airdrop
 * Distribuir airdrop (solo admin)
 */
router.post('/distribute-airdrop', async (req, res) => {
    try {
        // Verificar que el evento haya terminado
        const endDate = new Date('2026-01-02T23:59:59');
        if (new Date() <= endDate) {
            return res.status(400).json({
                success: false,
                error: 'El evento aún no ha terminado'
            });
        }
        
        const claims = await airdropService.distributeAirdrop();
        
        res.json({
            success: true,
            claims: claims.length,
            message: 'Airdrop distribuido exitosamente'
        });
    } catch (error) {
        console.error('Error distribuyendo airdrop:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * POST /api/christmas-event/claim-airdrop
 * Reclamar airdrop del usuario
 */
router.post('/claim-airdrop', async (req, res) => {
    try {
        const { userId } = req.body;
        
        if (!userId) {
            return res.status(400).json({
                success: false,
                error: 'userId es requerido'
            });
        }
        
        const result = await airdropService.processAirdropClaim(userId);
        
        res.json({
            success: true,
            ...result
        });
    } catch (error) {
        console.error('Error reclamando airdrop:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/christmas-event/airdrop-status/:userId
 * Obtener estado del airdrop del usuario
 */
router.get('/airdrop-status/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        
        const status = await airdropService.getUserAirdropStatus(userId);
        
        res.json({
            success: true,
            airdrop: status
        });
    } catch (error) {
        console.error('Error obteniendo estado de airdrop:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

export default router;

