/**
 * ⚙️ SETTINGS ROUTES
 * Rutas para configuración del usuario
 */

const express = require('express');
const { pool } = require('../config/database');
const { userAuth, verifyPassword, hashPassword } = require('../security/auth');
const router = express.Router();

router.use(userAuth);

/**
 * GET /api/settings
 * Obtener configuración del usuario
 */
router.get('/', async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `SELECT settings FROM users WHERE id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado'
      });
    }

    const settings = result.rows[0].settings || {};

    res.json({
      success: true,
      data: {
        mining: settings.mining || {
          auto_start: false,
          intensity: 'medium',
          cpu_threads: 4
        },
        pool: settings.pool || {
          default_pool: null,
          failover_enabled: true
        },
        notifications: settings.notifications || {
          email: true,
          push: false
        },
        theme: settings.theme || 'dark'
      }
    });

  } catch (error) {
    console.error('Error obteniendo configuración:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

/**
 * PUT /api/settings
 * Actualizar configuración
 */
router.put('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const { mining, pool, notifications, theme } = req.body;

    // Obtener configuración actual
    const currentResult = await pool.query(
      `SELECT settings FROM users WHERE id = $1`,
      [userId]
    );

    if (currentResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado'
      });
    }

    const currentSettings = currentResult.rows[0].settings || {};
    const newSettings = {
      ...currentSettings,
      ...(mining && { mining }),
      ...(pool && { pool }),
      ...(notifications && { notifications }),
      ...(theme && { theme })
    };

    await pool.query(
      `UPDATE users SET settings = $1, updated_at = NOW() WHERE id = $2`,
      [JSON.stringify(newSettings), userId]
    );

    res.json({
      success: true,
      data: newSettings
    });

  } catch (error) {
    console.error('Error actualizando configuración:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

/**
 * POST /api/settings/change-password
 * Cambiar contraseña
 */
router.post('/change-password', async (req, res) => {
  try {
    const userId = req.user.id;
    const { current_password, new_password } = req.body;

    if (!current_password || !new_password) {
      return res.status(400).json({
        success: false,
        error: 'Contraseña actual y nueva contraseña son requeridas'
      });
    }

    if (new_password.length < 8) {
      return res.status(400).json({
        success: false,
        error: 'La nueva contraseña debe tener al menos 8 caracteres'
      });
    }

    // Obtener usuario
    const userResult = await pool.query(
      `SELECT password FROM users WHERE id = $1`,
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado'
      });
    }

    // Verificar contraseña actual
    const isValid = await verifyPassword(current_password, userResult.rows[0].password);
    if (!isValid) {
      return res.status(401).json({
        success: false,
        error: 'Contraseña actual incorrecta'
      });
    }

    // Hashear nueva contraseña
    const hashedPassword = await hashPassword(new_password);

    // Actualizar contraseña
    await pool.query(
      `UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2`,
      [hashedPassword, userId]
    );

    res.json({
      success: true,
      message: 'Contraseña actualizada correctamente'
    });

  } catch (error) {
    console.error('Error cambiando contraseña:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

module.exports = router;

