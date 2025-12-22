const express = require('express');
const { pool } = require('../config/database');
const { 
  signUserToken, 
  signAdminToken, 
  hashPassword, 
  verifyPassword,
  generateRandomPassword 
} = require('../security/auth');
const { authLimiter } = require('../security/rateLimit');

const router = express.Router();

// Aplicar rate limiting a todas las rutas de auth
router.use(authLimiter);

/**
 * POST /auth/register
 * Registra un nuevo usuario
 */
router.post('/register', async (req, res) => {
  try {
    const { email, username, password, wallet_address, referral_code, referred_by } = req.body;
    
    // Validaciones básicas
    if (!email || !username || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email, nombre de usuario y contraseña son requeridos',
        code: 'MISSING_REQUIRED_FIELDS'
      });
    }
    
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        error: 'La contraseña debe tener al menos 8 caracteres',
        code: 'PASSWORD_TOO_SHORT'
      });
    }
    
    if (!/^0x[a-fA-F0-9]{40}$/.test(wallet_address)) {
      return res.status(400).json({
        success: false,
        error: 'Dirección de wallet inválida',
        code: 'INVALID_WALLET_ADDRESS'
      });
    }
    
    // Verificar si el email ya existe
    const { rows: [existingUser] } = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );
    
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'El email ya está registrado',
        code: 'EMAIL_ALREADY_EXISTS'
      });
    }
    
    // Verificar si el username ya existe
    const { rows: [existingUsername] } = await pool.query(
      'SELECT id FROM users WHERE username = $1',
      [username]
    );
    
    if (existingUsername) {
      return res.status(409).json({
        success: false,
        error: 'El nombre de usuario ya está en uso',
        code: 'USERNAME_ALREADY_EXISTS'
      });
    }
    
    // Verificar código de referido si se proporciona
    let referrerId = null;
    if (referral_code) {
      const { rows: [referrer] } = await pool.query(
        'SELECT id FROM users WHERE referral_code = $1',
        [referral_code]
      );
      if (referrer) {
        referrerId = referrer.id;
      }
    }
    
    // Generar código de referral único
    const generateReferralCode = () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let code = '';
      for (let i = 0; i < 8; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return code;
    };
    
    let userReferralCode = generateReferralCode();
    let codeExists = true;
    while (codeExists) {
      const { rows: [existingCode] } = await pool.query(
        'SELECT id FROM users WHERE referral_code = $1',
        [userReferralCode]
      );
      if (!existingCode) {
        codeExists = false;
      } else {
        userReferralCode = generateReferralCode();
      }
    }
    
    // Hashear contraseña
    const passwordHash = await hashPassword(password);
    
    // Crear usuario
    const { rows: [newUser] } = await pool.query(
      `INSERT INTO users (email, username, password_hash, wallet_address, referral_code, referred_by, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'active')
       RETURNING id, email, username, wallet_address, referral_code, created_at`,
      [email, username, passwordHash, wallet_address || null, userReferralCode, referrerId]
    );
    
    // Crear relación de referral si hay referrer
    if (referrerId) {
      await pool.query(
        `INSERT INTO referrals (referrer_id, referred_id, referral_code, commission_rate, status)
         VALUES ($1, $2, $3, 0.1, 'active')
         ON CONFLICT (referrer_id, referred_id) DO NOTHING`,
        [referrerId, newUser.id, referral_code]
      );
    }
    
    // Generar token JWT
    const token = signUserToken({
      id: newUser.id,
      email: newUser.email,
      username: newUser.username,
      wallet_address: newUser.wallet_address
    });
    
    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      data: {
        user: {
          id: newUser.id,
          email: newUser.email,
          wallet_address: newUser.wallet_address,
          created_at: newUser.created_at
        },
        token
      }
    });
    
  } catch (error) {
    console.error('Error registrando usuario:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      code: 'INTERNAL_SERVER_ERROR'
    });
  }
});

/**
 * POST /auth/login
 * Login de usuario
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validaciones básicas
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email y contraseña son requeridos',
        code: 'MISSING_CREDENTIALS'
      });
    }
    
    // Buscar usuario
    const { rows: [user] } = await pool.query(
      'SELECT id, email, password_hash, wallet_address, status, created_at FROM users WHERE email = $1',
      [email]
    );
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Credenciales inválidas',
        code: 'INVALID_CREDENTIALS'
      });
    }
    
    if (user.status !== 'active') {
      return res.status(403).json({
        success: false,
        error: 'Usuario inactivo',
        code: 'USER_INACTIVE'
      });
    }
    
    // Verificar contraseña
    const isValidPassword = await verifyPassword(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: 'Credenciales inválidas',
        code: 'INVALID_CREDENTIALS'
      });
    }
    
    // Generar token JWT
    const token = signUserToken({
      id: user.id,
      email: user.email,
      wallet_address: user.wallet_address
    });
    
    res.json({
      success: true,
      message: 'Login exitoso',
      data: {
        user: {
          id: user.id,
          email: user.email,
          wallet_address: user.wallet_address,
          created_at: user.created_at
        },
        token
      }
    });
    
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      code: 'INTERNAL_SERVER_ERROR'
    });
  }
});

/**
 * POST /auth/admin/login
 * Login de administrador
 */
router.post('/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validaciones básicas
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email y contraseña son requeridos',
        code: 'MISSING_CREDENTIALS'
      });
    }
    
    // Buscar administrador
    const { rows: [admin] } = await pool.query(
      'SELECT id, email, password_hash, created_at FROM admins WHERE email = $1',
      [email]
    );
    
    if (!admin) {
      return res.status(401).json({
        success: false,
        error: 'Credenciales de administrador inválidas',
        code: 'INVALID_ADMIN_CREDENTIALS'
      });
    }
    
    // Verificar contraseña
    const isValidPassword = await verifyPassword(password, admin.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: 'Credenciales de administrador inválidas',
        code: 'INVALID_ADMIN_CREDENTIALS'
      });
    }
    
    // Generar token JWT de administrador
    const token = signAdminToken({
      id: admin.id,
      email: admin.email
    });
    
    res.json({
      success: true,
      message: 'Login de administrador exitoso',
      data: {
        admin: {
          id: admin.id,
          email: admin.email,
          created_at: admin.created_at
        },
        token
      }
    });
    
  } catch (error) {
    console.error('Error en login de administrador:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      code: 'INTERNAL_SERVER_ERROR'
    });
  }
});

/**
 * POST /auth/admin/create
 * Crear un nuevo administrador (solo para super admins)
 */
router.post('/admin/create', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validaciones básicas
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email y contraseña son requeridos',
        code: 'MISSING_CREDENTIALS'
      });
    }
    
    if (password.length < 12) {
      return res.status(400).json({
        success: false,
        error: 'La contraseña de administrador debe tener al menos 12 caracteres',
        code: 'PASSWORD_TOO_SHORT'
      });
    }
    
    // Verificar si el email ya existe
    const { rows: [existingAdmin] } = await pool.query(
      'SELECT id FROM admins WHERE email = $1',
      [email]
    );
    
    if (existingAdmin) {
      return res.status(409).json({
        success: false,
        error: 'El email ya está registrado como administrador',
        code: 'ADMIN_EMAIL_ALREADY_EXISTS'
      });
    }
    
    // Hashear contraseña
    const passwordHash = await hashPassword(password);
    
    // Crear administrador
    const { rows: [newAdmin] } = await pool.query(
      `INSERT INTO admins (email, password_hash)
       VALUES ($1, $2)
       RETURNING id, email, created_at`,
      [email, passwordHash]
    );
    
    res.status(201).json({
      success: true,
      message: 'Administrador creado exitosamente',
      data: {
        admin: {
          id: newAdmin.id,
          email: newAdmin.email,
          created_at: newAdmin.created_at
        }
      }
    });
    
  } catch (error) {
    console.error('Error creando administrador:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      code: 'INTERNAL_SERVER_ERROR'
    });
  }
});

/**
 * POST /auth/admin/reset-password
 * Reset de contraseña de administrador
 */
router.post('/admin/reset-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email es requerido',
        code: 'MISSING_EMAIL'
      });
    }
    
    // Verificar si el administrador existe
    const { rows: [admin] } = await pool.query(
      'SELECT id FROM admins WHERE email = $1',
      [email]
    );
    
    if (!admin) {
      return res.status(404).json({
        success: false,
        error: 'Administrador no encontrado',
        code: 'ADMIN_NOT_FOUND'
      });
    }
    
    // Generar nueva contraseña aleatoria
    const newPassword = generateRandomPassword(16);
    const passwordHash = await hashPassword(newPassword);
    
    // Actualizar contraseña
    await pool.query(
      'UPDATE admins SET password_hash = $1 WHERE id = $2',
      [passwordHash, admin.id]
    );
    
    res.json({
      success: true,
      message: 'Contraseña de administrador reseteada exitosamente',
      data: {
        newPassword,
        note: 'Guarda esta contraseña en un lugar seguro'
      }
    });
    
  } catch (error) {
    console.error('Error reseteando contraseña de administrador:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      code: 'INTERNAL_SERVER_ERROR'
    });
  }
});

/**
 * GET /auth/profile
 * Obtener perfil del usuario autenticado
 */
router.get('/profile', async (req, res) => {
  try {
    // Este endpoint requiere autenticación, se maneja en el middleware
    const user = req.user;
    
    const { rows: [userProfile] } = await pool.query(
      `SELECT 
         id, email, username, balance, wallet_address, referral_code, referred_by, 
         mined_balance, last_mine, status, created_at
       FROM users 
       WHERE id = $1`,
      [user.id]
    );
    
    if (!userProfile) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado',
        code: 'USER_NOT_FOUND'
      });
    }
    
    res.json({
      success: true,
      data: {
        user: {
          id: userProfile.id,
          email: userProfile.email,
          username: userProfile.username || userProfile.email?.split('@')[0] || 'Usuario',
          balance: parseFloat(userProfile.balance || 0),
          wallet_address: userProfile.wallet_address,
          referral_code: userProfile.referral_code,
          referred_by: userProfile.referred_by,
          mined_balance: parseFloat(userProfile.mined_balance || 0),
          last_mine: userProfile.last_mine,
          status: userProfile.status,
          created_at: userProfile.created_at
        }
      }
    });
    
  } catch (error) {
    console.error('Error obteniendo perfil:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      code: 'INTERNAL_SERVER_ERROR'
    });
  }
});

module.exports = router;
