// 🎯 RSC REFERRAL SYSTEM - BACKEND API
// Sistema de referidos con validación y seguridad en el backend

const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { supabase } = require('../config/supabase');

// Middleware de autenticación
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Token de acceso requerido' });
    }

    // Verificar token JWT (implementar según tu sistema de auth)
    // Por ahora simulamos la verificación
    req.user = { id: 'user_123', email: 'user@example.com' };
    next();
};

// ========================================
// GENERAR CÓDIGO DE REFERIDO
// ========================================

router.post('/generate', authenticateToken, async (req, res) => {
    try {
        const { user_id, platform = 'web_mining' } = req.body;
        
        // Validar que el usuario existe
        const { data: user, error: userError } = await supabase
            .from('mining_users')
            .select('id, username, email')
            .eq('id', user_id)
            .single();

        if (userError || !user) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        // Verificar si ya tiene un código activo
        const { data: existingCode, error: codeError } = await supabase
            .from('referral_codes')
            .select('*')
            .eq('user_id', user_id)
            .eq('status', 'active')
            .single();

        if (existingCode) {
            return res.json({
                success: true,
                referral_code: existingCode.code,
                expires_at: existingCode.expires_at,
                usage_count: existingCode.usage_count,
                max_usage: existingCode.max_usage
            });
        }

        // Generar código único
        const timestamp = Date.now();
        const randomSuffix = crypto.randomBytes(4).toString('hex');
        const referralCode = `RSC_${user_id}_${timestamp}_${randomSuffix}`;

        // Calcular fecha de expiración (1 año)
        const expiresAt = new Date();
        expiresAt.setFullYear(expiresAt.getFullYear() + 1);

        // Guardar en base de datos
        const { data: newCode, error: insertError } = await supabase
            .from('referral_codes')
            .insert([{
                user_id: user_id,
                code: referralCode,
                platform: platform,
                status: 'active',
                expires_at: expiresAt.toISOString(),
                usage_count: 0,
                max_usage: 1000,
                created_at: new Date().toISOString()
            }])
            .select()
            .single();

        if (insertError) {
            throw insertError;
        }

        // Log de auditoría
        await supabase
            .from('audit_logs')
            .insert([{
                user_id: user_id,
                action: 'referral_code_generated',
                details: {
                    code: referralCode,
                    platform: platform
                },
                ip_address: req.ip,
                user_agent: req.get('User-Agent'),
                created_at: new Date().toISOString()
            }]);

        res.json({
            success: true,
            referral_code: referralCode,
            expires_at: expiresAt.toISOString(),
            usage_count: 0,
            max_usage: 1000
        });

    } catch (error) {
        console.error('Error generando código de referido:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// ========================================
// VALIDAR CÓDIGO DE REFERIDO
// ========================================

router.post('/validate', async (req, res) => {
    try {
        const { referral_code } = req.body;

        if (!referral_code) {
            return res.status(400).json({ error: 'Código de referido requerido' });
        }

        // Buscar código en base de datos
        const { data: codeData, error: codeError } = await supabase
            .from('referral_codes')
            .select(`
                *,
                referrer:mining_users!referral_codes_user_id_fkey(
                    id,
                    username,
                    email
                )
            `)
            .eq('code', referral_code)
            .eq('status', 'active')
            .single();

        if (codeError || !codeData) {
            return res.status(404).json({ 
                error: 'Código de referido no encontrado o inactivo' 
            });
        }

        // Verificar si ha expirado
        if (new Date(codeData.expires_at) < new Date()) {
            return res.status(400).json({ 
                error: 'Código de referido ha expirado' 
            });
        }

        // Verificar límite de uso
        if (codeData.usage_count >= codeData.max_usage) {
            return res.status(400).json({ 
                error: 'Código de referido ha alcanzado su límite de uso' 
            });
        }

        res.json({
            valid: true,
            referrer_id: codeData.user_id,
            referrer_username: codeData.referrer.username,
            expires_at: codeData.expires_at,
            usage_count: codeData.usage_count,
            max_usage: codeData.max_usage
        });

    } catch (error) {
        console.error('Error validando código de referido:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// ========================================
// PROCESAR REFERIDO
// ========================================

router.post('/process', authenticateToken, async (req, res) => {
    try {
        const { referral_code, user_id, ip_address, user_agent } = req.body;

        // Validar código primero
        const validationResponse = await fetch(`${req.protocol}://${req.get('host')}/api/referrals/validate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ referral_code })
        });

        if (!validationResponse.ok) {
            const errorData = await validationResponse.json();
            return res.status(400).json({ error: errorData.error });
        }

        const validationData = await validationResponse.json();
        const referrerId = validationData.referrer_id;

        // Verificar que no se refiera a sí mismo
        if (referrerId === user_id) {
            return res.status(400).json({ 
                error: 'No puedes referirte a ti mismo' 
            });
        }

        // Verificar si el usuario ya tiene un referidor
        const { data: existingReferral, error: referralError } = await supabase
            .from('referrals')
            .select('*')
            .eq('referred_user_id', user_id)
            .eq('status', 'active')
            .single();

        if (existingReferral) {
            return res.status(400).json({ 
                error: 'Ya tienes un referidor asignado' 
            });
        }

        // Crear relación de referido
        const { data: newReferral, error: insertError } = await supabase
            .from('referrals')
            .insert([{
                referrer_user_id: referrerId,
                referred_user_id: user_id,
                referral_code: referral_code,
                bonus_rate: 0.10, // 10%
                status: 'active',
                ip_address: ip_address,
                user_agent: user_agent,
                created_at: new Date().toISOString()
            }])
            .select()
            .single();

        if (insertError) {
            throw insertError;
        }

        // Incrementar contador de uso del código
        await supabase
            .from('referral_codes')
            .update({ 
                usage_count: codeData.usage_count + 1,
                last_used_at: new Date().toISOString()
            })
            .eq('code', referral_code);

        // Actualizar estadísticas del referidor
        await supabase
            .from('referral_stats')
            .upsert([{
                user_id: referrerId,
                total_referrals: supabase.raw('total_referrals + 1'),
                updated_at: new Date().toISOString()
            }], {
                onConflict: 'user_id'
            });

        // Log de auditoría
        await supabase
            .from('audit_logs')
            .insert([{
                user_id: user_id,
                action: 'referral_processed',
                details: {
                    referrer_id: referrerId,
                    referral_code: referral_code
                },
                ip_address: ip_address,
                user_agent: user_agent,
                created_at: new Date().toISOString()
            }]);

        res.json({
            success: true,
            referral_id: newReferral.id,
            referrer_id: referrerId,
            bonus_rate: 0.10,
            message: 'Referido procesado exitosamente'
        });

    } catch (error) {
        console.error('Error procesando referido:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// ========================================
// OBTENER ESTADÍSTICAS DE REFERIDOS
// ========================================

router.get('/stats/:userId', authenticateToken, async (req, res) => {
    try {
        const { userId } = req.params;

        // Obtener estadísticas del usuario
        const { data: stats, error: statsError } = await supabase
            .from('referral_stats')
            .select('*')
            .eq('user_id', userId)
            .single();

        // Obtener referidos activos
        const { data: referrals, error: referralsError } = await supabase
            .from('referrals')
            .select(`
                *,
                referred_user:mining_users!referrals_referred_user_id_fkey(
                    username,
                    email
                )
            `)
            .eq('referrer_user_id', userId)
            .eq('status', 'active');

        // Calcular ganancias totales por referidos
        const { data: earnings, error: earningsError } = await supabase
            .from('referral_earnings')
            .select('total_earned')
            .eq('referrer_user_id', userId)
            .single();

        res.json({
            success: true,
            total_referrals: stats?.total_referrals || 0,
            active_referrals: referrals?.length || 0,
            total_earnings: earnings?.total_earned || 0,
            referrals: referrals || []
        });

    } catch (error) {
        console.error('Error obteniendo estadísticas:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// ========================================
// CALCULAR GANANCIAS DE REFERIDOS
// ========================================

router.post('/calculate-earnings', authenticateToken, async (req, res) => {
    try {
        const { referrer_user_id } = req.body;

        // Obtener referidos activos
        const { data: referrals, error: referralsError } = await supabase
            .from('referrals')
            .select('*')
            .eq('referrer_user_id', referrer_user_id)
            .eq('status', 'active');

        if (referralsError) {
            throw referralsError;
        }

        let totalEarnings = 0;

        // Calcular ganancias de cada referido
        for (const referral of referrals) {
            const { data: userEarnings, error: earningsError } = await supabase
                .from('mining_earnings')
                .select('total_mined')
                .eq('user_id', referral.referred_user_id)
                .single();

            if (userEarnings) {
                const bonus = userEarnings.total_mined * referral.bonus_rate;
                totalEarnings += bonus;
            }
        }

        // Actualizar ganancias del referidor
        await supabase
            .from('referral_earnings')
            .upsert([{
                referrer_user_id: referrer_user_id,
                total_earned: totalEarnings,
                updated_at: new Date().toISOString()
            }], {
                onConflict: 'referrer_user_id'
            });

        res.json({
            success: true,
            total_earnings: totalEarnings,
            referrals_count: referrals.length
        });

    } catch (error) {
        console.error('Error calculando ganancias:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

module.exports = router;
