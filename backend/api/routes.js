/**
 * RSC MINING API ROUTES
 * 
 * API REST completa para el sistema de minería con referidos
 * - Endpoints de usuarios
 * - Endpoints de minería
 * - Endpoints de referidos
 * - Middleware de autenticación
 */

import express from 'express';
import { userService } from '../services/user-service.js';
import { miningService } from '../services/mining-service.js';

const router = express.Router();

// ===== MIDDLEWARE DE AUTENTICACIÓN =====
const authenticateUser = async (req, res, next) => {
    try {
        const { userId } = req.headers;
        
        if (!userId) {
            return res.status(401).json({
                success: false,
                error: 'Usuario no autenticado'
            });
        }

        // Verificar que el usuario existe
        const user = await userService.getUserById(userId);
        if (!user || !user.is_active) {
            return res.status(401).json({
                success: false,
                error: 'Usuario no válido o inactivo'
            });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error('❌ Error de autenticación:', error);
        res.status(500).json({
            success: false,
            error: 'Error de autenticación'
        });
    }
};

// ===== RUTAS DE USUARIOS =====

/**
 * POST /api/users/register
 * Registrar nuevo usuario
 */
router.post('/users/register', async (req, res) => {
    try {
        const { email, username, referralCode } = req.body;

        const result = await userService.registerUser({
            email,
            username,
            referralCode
        });

        if (result.success) {
            res.status(201).json(result);
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        console.error('❌ Error en registro de usuario:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor'
        });
    }
});

/**
 * GET /api/users/profile
 * Obtener perfil del usuario
 */
router.get('/users/profile', authenticateUser, async (req, res) => {
    try {
        const user = req.user;
        
        // Obtener estadísticas de referidos
        const referralStats = await userService.getReferralStats(user.id);
        
        // Obtener estadísticas de minería
        const miningStats = await miningService.getUserMiningStats(user.id);

        res.json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                balance: parseFloat(user.balance),
                referralCode: user.referral_code,
                referredBy: user.referred_by,
                createdAt: user.created_at
            },
            referralStats,
            miningStats
        });
    } catch (error) {
        console.error('❌ Error obteniendo perfil:', error);
        res.status(500).json({
            success: false,
            error: 'Error obteniendo perfil'
        });
    }
});

/**
 * GET /api/users/balance
 * Obtener balance del usuario
 */
router.get('/users/balance', authenticateUser, async (req, res) => {
    try {
        const balance = await userService.getUserBalance(req.user.id);
        res.json({
            success: true,
            ...balance
        });
    } catch (error) {
        console.error('❌ Error obteniendo balance:', error);
        res.status(500).json({
            success: false,
            error: 'Error obteniendo balance'
        });
    }
});

/**
 * GET /api/users/referrals
 * Obtener referidos del usuario
 */
router.get('/users/referrals', authenticateUser, async (req, res) => {
    try {
        const referrals = await userService.getUserReferrals(req.user.id);
        res.json({
            success: true,
            referrals
        });
    } catch (error) {
        console.error('❌ Error obteniendo referidos:', error);
        res.status(500).json({
            success: false,
            error: 'Error obteniendo referidos'
        });
    }
});

/**
 * GET /api/users/transactions
 * Obtener historial de transacciones
 */
router.get('/users/transactions', authenticateUser, async (req, res) => {
    try {
        const { limit = 50, offset = 0 } = req.query;
        const transactions = await userService.getUserTransactions(
            req.user.id,
            parseInt(limit),
            parseInt(offset)
        );
        
        res.json({
            success: true,
            transactions
        });
    } catch (error) {
        console.error('❌ Error obteniendo transacciones:', error);
        res.status(500).json({
            success: false,
            error: 'Error obteniendo transacciones'
        });
    }
});

/**
 * POST /api/users/validate-referral
 * Validar código de referral
 */
router.post('/users/validate-referral', async (req, res) => {
    try {
        const { referralCode } = req.body;
        
        if (!referralCode) {
            return res.status(400).json({
                success: false,
                error: 'Código de referral requerido'
            });
        }

        const result = await userService.validateReferralCode(referralCode);
        res.json(result);
    } catch (error) {
        console.error('❌ Error validando código de referral:', error);
        res.status(500).json({
            success: false,
            error: 'Error validando código de referral'
        });
    }
});

// ===== RUTAS DE MINERÍA =====

/**
 * POST /api/mining/start
 * Iniciar sesión de minería
 */
router.post('/mining/start', authenticateUser, async (req, res) => {
    try {
        const { sessionId, startTime, endTime, hashRate, efficiency } = req.body;

        if (!sessionId || !startTime || !endTime) {
            return res.status(400).json({
                success: false,
                error: 'Datos de sesión requeridos'
            });
        }

        const result = await miningService.startMiningSession(req.user.id, {
            sessionId,
            startTime,
            endTime,
            hashRate,
            efficiency
        });

        if (result.success) {
            res.status(201).json(result);
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        console.error('❌ Error iniciando minería:', error);
        res.status(500).json({
            success: false,
            error: 'Error iniciando minería'
        });
    }
});

/**
 * PUT /api/mining/update
 * Actualizar sesión de minería
 */
router.put('/mining/update', authenticateUser, async (req, res) => {
    try {
        const { sessionId, tokensMined, hashRate, efficiency, status } = req.body;

        if (!sessionId) {
            return res.status(400).json({
                success: false,
                error: 'Session ID requerido'
            });
        }

        const result = await miningService.updateMiningSession(sessionId, {
            tokensMined,
            hashRate,
            efficiency,
            status
        });

        res.json(result);
    } catch (error) {
        console.error('❌ Error actualizando minería:', error);
        res.status(500).json({
            success: false,
            error: 'Error actualizando minería'
        });
    }
});

/**
 * POST /api/mining/end
 * Finalizar sesión de minería
 */
router.post('/mining/end', authenticateUser, async (req, res) => {
    try {
        const { sessionId, tokensMined, hashRate, efficiency } = req.body;

        if (!sessionId) {
            return res.status(400).json({
                success: false,
                error: 'Session ID requerido'
            });
        }

        const result = await miningService.endMiningSession(sessionId, {
            tokensMined,
            hashRate,
            efficiency
        });

        res.json(result);
    } catch (error) {
        console.error('❌ Error finalizando minería:', error);
        res.status(500).json({
            success: false,
            error: 'Error finalizando minería'
        });
    }
});

/**
 * GET /api/mining/active
 * Obtener sesión activa
 */
router.get('/mining/active', authenticateUser, async (req, res) => {
    try {
        const activeSession = await miningService.getActiveSession(req.user.id);
        
        res.json({
            success: true,
            session: activeSession
        });
    } catch (error) {
        console.error('❌ Error obteniendo sesión activa:', error);
        res.status(500).json({
            success: false,
            error: 'Error obteniendo sesión activa'
        });
    }
});

/**
 * GET /api/mining/history
 * Obtener historial de minería
 */
router.get('/mining/history', authenticateUser, async (req, res) => {
    try {
        const { limit = 50, offset = 0 } = req.query;
        const history = await miningService.getUserMiningHistory(
            req.user.id,
            parseInt(limit),
            parseInt(offset)
        );
        
        res.json({
            success: true,
            history
        });
    } catch (error) {
        console.error('❌ Error obteniendo historial:', error);
        res.status(500).json({
            success: false,
            error: 'Error obteniendo historial'
        });
    }
});

/**
 * POST /api/mining/sync
 * Sincronizar datos de minería
 */
router.post('/mining/sync', authenticateUser, async (req, res) => {
    try {
        const { sessionId, tokensMined, hashRate, efficiency, isActive } = req.body;

        if (!sessionId) {
            return res.status(400).json({
                success: false,
                error: 'Session ID requerido'
            });
        }

        const result = await miningService.syncMiningData(req.user.id, {
            sessionId,
            tokensMined,
            hashRate,
            efficiency,
            isActive
        });

        res.json(result);
    } catch (error) {
        console.error('❌ Error sincronizando minería:', error);
        res.status(500).json({
            success: false,
            error: 'Error sincronizando minería'
        });
    }
});

// ===== RUTAS PÚBLICAS =====

/**
 * GET /api/ranking
 * Obtener ranking de usuarios
 */
router.get('/ranking', async (req, res) => {
    try {
        const { limit = 100 } = req.query;
        const ranking = await userService.getUserRanking(parseInt(limit));
        
        res.json({
            success: true,
            ranking
        });
    } catch (error) {
        console.error('❌ Error obteniendo ranking:', error);
        res.status(500).json({
            success: false,
            error: 'Error obteniendo ranking'
        });
    }
});

/**
 * GET /api/mining/ranking
 * Obtener ranking de mineros
 */
router.get('/mining/ranking', async (req, res) => {
    try {
        const { limit = 100 } = req.query;
        const ranking = await miningService.getMiningRanking(parseInt(limit));
        
        res.json({
            success: true,
            ranking
        });
    } catch (error) {
        console.error('❌ Error obteniendo ranking de mineros:', error);
        res.status(500).json({
            success: false,
            error: 'Error obteniendo ranking de mineros'
        });
    }
});

/**
 * GET /api/stats
 * Obtener estadísticas generales
 */
router.get('/stats', async (req, res) => {
    try {
        const [userStats, miningStats] = await Promise.all([
            userService.getGeneralStats(),
            miningService.getGeneralMiningStats()
        ]);
        
        res.json({
            success: true,
            stats: {
                users: userStats,
                mining: miningStats
            }
        });
    } catch (error) {
        console.error('❌ Error obteniendo estadísticas:', error);
        res.status(500).json({
            success: false,
            error: 'Error obteniendo estadísticas'
        });
    }
});

// ===== RUTAS DE ADMINISTRACIÓN =====

/**
 * POST /api/admin/cleanup
 * Limpiar sesiones expiradas
 */
router.post('/admin/cleanup', async (req, res) => {
    try {
        const result = await miningService.cleanupExpiredSessions();
        res.json(result);
    } catch (error) {
        console.error('❌ Error en limpieza:', error);
        res.status(500).json({
            success: false,
            error: 'Error en limpieza'
        });
    }
});

// ===== MIDDLEWARE DE MANEJO DE ERRORES =====
router.use((error, req, res, next) => {
    console.error('❌ Error no manejado:', error);
    res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
    });
});

// ===== MIDDLEWARE DE RUTA NO ENCONTRADA =====
router.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        error: 'Ruta no encontrada'
    });
});

export default router;
