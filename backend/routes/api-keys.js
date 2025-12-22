/**
 * 🔌 API KEYS ROUTES
 * Rutas para gestión de API keys
 */

const express = require('express');
const crypto = require('crypto');
const { pool } = require('../config/database');
const { userAuth } = require('../security/auth');
const { hashPassword } = require('../security/auth');
const router = express.Router();

router.use(userAuth);

/**
 * GET /api/api-keys
 * Obtener API keys del usuario
 */
router.get('/', async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `SELECT id, key_name, permissions, last_used, expires_at, status, created_at
       FROM api_keys
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId]
    );

    res.json({
      success: true,
      data: {
        keys: result.rows
      }
    });

  } catch (error) {
    console.error('Error obteniendo API keys:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

/**
 * POST /api/api-keys
 * Crear nueva API key
 */
router.post('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const { key_name, permissions, expires_at } = req.body;

    if (!key_name) {
      return res.status(400).json({
        success: false,
        error: 'Nombre de la key es requerido'
      });
    }

    // Generar API key y secret
    const apiKey = `rsc_live_${crypto.randomBytes(24).toString('hex')}`;
    const apiSecret = crypto.randomBytes(32).toString('hex');
    const hashedSecret = await hashPassword(apiSecret);

    const defaultPermissions = {
      read: true,
      write: false,
      withdraw: false
    };

    const result = await pool.query(
      `INSERT INTO api_keys 
       (user_id, key_name, api_key, api_secret, permissions, expires_at, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'active')
       RETURNING id, key_name, api_key, created_at`,
      [
        userId,
        key_name,
        apiKey,
        hashedSecret,
        JSON.stringify(permissions || defaultPermissions),
        expires_at || null
      ]
    );

    // Retornar secret solo una vez
    res.json({
      success: true,
      data: {
        id: result.rows[0].id,
        api_key: apiKey,
        api_secret: apiSecret, // Solo se muestra una vez
        key_name: key_name,
        created_at: result.rows[0].created_at
      }
    });

  } catch (error) {
    console.error('Error creando API key:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

/**
 * DELETE /api/api-keys/:id
 * Revocar API key
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await pool.query(
      `UPDATE api_keys 
       SET status = 'revoked', updated_at = NOW()
       WHERE id = $1 AND user_id = $2
       RETURNING *`,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'API key no encontrada'
      });
    }

    res.json({
      success: true,
      message: 'API key revocada correctamente'
    });

  } catch (error) {
    console.error('Error revocando API key:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

/**
 * POST /api/api-keys/:id/test
 * Probar API key
 */
router.post('/:id/test', async (req, res) => {
  try {
    const { id } = req.params;
    const { endpoint, method } = req.body;
    const userId = req.user.id;

    const result = await pool.query(
      `SELECT * FROM api_keys 
       WHERE id = $1 AND user_id = $2 AND status = 'active'`,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'API key no encontrada o inactiva'
      });
    }

    // Simular test (en producción esto haría una request real)
    res.json({
      success: true,
      data: {
        api_key_id: id,
        endpoint: endpoint || '/api/mining/active',
        method: method || 'GET',
        status: 'valid',
        test_result: 'API key válida y funcional'
      }
    });

  } catch (error) {
    console.error('Error probando API key:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

module.exports = router;

