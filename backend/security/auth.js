const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const config = require('../config/env');

// Tipos de usuario JWT
const JWT_USER = 'user';
const JWT_ADMIN = 'admin';

// Función para firmar token de usuario
function signUserToken(payload) {
  return jwt.sign(
    { ...payload, type: JWT_USER },
    config.jwt.secret,
    { expiresIn: config.jwt.expires }
  );
}

// Función para firmar token de administrador
function signAdminToken(payload) {
  return jwt.sign(
    { ...payload, type: JWT_ADMIN },
    config.jwt.adminSecret,
    { expiresIn: config.jwt.adminExpires }
  );
}

// Función para verificar token de usuario
function verifyUserToken(token) {
  try {
    const decoded = jwt.verify(token, config.jwt.secret);
    if (decoded.type !== JWT_USER) {
      throw new Error('Invalid token type');
    }
    return decoded;
  } catch (err) {
    throw new Error('Invalid user token');
  }
}

// Función para verificar token de administrador
function verifyAdminToken(token) {
  try {
    const decoded = jwt.verify(token, config.jwt.adminSecret);
    if (decoded.type !== JWT_ADMIN) {
      throw new Error('Invalid token type');
    }
    return decoded;
  } catch (err) {
    throw new Error('Invalid admin token');
  }
}

// Middleware de autenticación de usuario
function userAuth(req, res, next) {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ 
        error: 'Token de autenticación requerido',
        code: 'AUTH_TOKEN_MISSING'
      });
    }

    const decoded = verifyUserToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ 
      error: 'Token de usuario inválido',
      code: 'AUTH_TOKEN_INVALID',
      details: err.message
    });
  }
}

// Middleware de autenticación de administrador
function adminAuth(req, res, next) {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ 
        error: 'Token de administrador requerido',
        code: 'ADMIN_TOKEN_MISSING'
      });
    }

    const decoded = verifyAdminToken(token);
    req.admin = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ 
      error: 'Token de administrador inválido',
      code: 'ADMIN_TOKEN_INVALID',
      details: err.message
    });
  }
}

// Función para hashear contraseñas
async function hashPassword(password) {
  const saltRounds = 12; // Costo alto para producción
  return await bcrypt.hash(password, saltRounds);
}

// Función para verificar contraseñas
async function verifyPassword(password, hash) {
  return await bcrypt.compare(password, hash);
}

// Función para generar contraseña aleatoria (para admins)
function generateRandomPassword(length = 16) {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
}

module.exports = {
  signUserToken,
  signAdminToken,
  verifyUserToken,
  verifyAdminToken,
  userAuth,
  adminAuth,
  hashPassword,
  verifyPassword,
  generateRandomPassword,
  JWT_USER,
  JWT_ADMIN
};
