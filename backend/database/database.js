// ===== SISTEMA DE BASE DE DATOS - MINERÍA SIMULADA RSC =====
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

class MiningDatabase {
  constructor() {
    this.dbPath = path.join(__dirname, 'mining_simulation.db');
    this.db = null;
    this.isInitialized = false;
  }

  async init() {
    try {
      // Crear directorio si no existe
      const dbDir = path.dirname(this.dbPath);
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
      }

      // Conectar a la base de datos
      this.db = new sqlite3.Database(this.dbPath);
      
      // Habilitar foreign keys
      await this.run('PRAGMA foreign_keys = ON');
      
      // Crear tablas
      await this.createTables();
      
      // Insertar configuración inicial
      await this.initializeSystemConfig();
      
      this.isInitialized = true;
      console.log('✅ Base de datos inicializada correctamente');
      
      return true;
    } catch (error) {
      console.error('❌ Error inicializando base de datos:', error);
      throw error;
    }
  }

  async createTables() {
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Dividir el schema en statements individuales
    const statements = schema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    for (const statement of statements) {
      if (statement.trim()) {
        await this.run(statement);
      }
    }
  }

  async initializeSystemConfig() {
    const configs = [
      { key: 'tokens_per_second', value: '0.001', description: 'Tokens ganados por segundo por unidad de hash power' },
      { key: 'max_hash_power', value: '100.0', description: 'Máxima potencia de hash permitida por usuario' },
      { key: 'min_hash_power', value: '0.1', description: 'Mínima potencia de hash permitida por usuario' },
      { key: 'session_timeout_hours', value: '24', description: 'Tiempo máximo de sesión de minería en horas' },
      { key: 'migration_enabled', value: 'false', description: 'Si la migración a mainnet está habilitada' },
      { key: 'system_version', value: '1.0.0', description: 'Versión actual del sistema de minería simulada' }
    ];

    for (const config of configs) {
      await this.run(
        'INSERT OR IGNORE INTO system_config (config_key, config_value, description) VALUES (?, ?, ?)',
        [config.key, config.value, config.description]
      );
    }
  }

  // ===== OPERACIONES DE USUARIOS =====
  
  async createUser(walletAddress, email = null, username = null) {
    try {
      const result = await this.run(
        'INSERT INTO users (wallet_address, email, username) VALUES (?, ?, ?)',
        [walletAddress, email, username]
      );
      
      const userId = result.lastID;
      
      // Crear entrada en historial
      await this.run(
        'INSERT INTO mining_history (user_id, action, tokens_earned, running_total, details) VALUES (?, ?, ?, ?, ?)',
        [userId, 'user_created', 0, 0, 'Usuario creado']
      );
      
      return { success: true, userId, walletAddress };
    } catch (error) {
      if (error.message.includes('UNIQUE constraint failed')) {
        throw new Error('Wallet address ya existe');
      }
      throw error;
    }
  }

  async getUserByWallet(walletAddress) {
    return await this.get('SELECT * FROM users WHERE wallet_address = ?', [walletAddress]);
  }

  async getUserById(userId) {
    return await this.get('SELECT * FROM users WHERE id = ?', [userId]);
  }

  async updateUserBalance(userId, tokensToAdd) {
    const result = await this.run(
      'UPDATE users SET total_simulated_tokens = total_simulated_tokens + ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [tokensToAdd, userId]
    );
    
    if (result.changes > 0) {
      // Obtener el nuevo balance
      const user = await this.getUserById(userId);
      
      // Registrar en historial
      await this.run(
        'INSERT INTO mining_history (user_id, action, tokens_earned, running_total, details) VALUES (?, ?, ?, ?, ?)',
        [userId, 'balance_update', tokensToAdd, user.total_simulated_tokens, 'Balance actualizado por minería']
      );
      
      return user.total_simulated_tokens;
    }
    
    throw new Error('Usuario no encontrado');
  }

  async updateLastMiningActivity(userId) {
    await this.run(
      'UPDATE users SET last_mining_activity = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [userId]
    );
  }

  // ===== OPERACIONES DE SESIONES DE MINERÍA =====
  
  async startMiningSession(userId, hashPower) {
    const sessionUuid = uuidv4();
    const startTime = new Date().toISOString();
    
    const result = await this.run(
      'INSERT INTO mining_sessions (user_id, session_uuid, start_time, hash_power) VALUES (?, ?, ?, ?)',
      [userId, sessionUuid, startTime, hashPower]
    );
    
    const sessionId = result.lastID;
    
    // Registrar en historial
    await this.run(
      'INSERT INTO mining_history (user_id, session_id, action, tokens_earned, running_total, details) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, sessionId, 'mining_started', 0, 0, `Sesión iniciada con ${hashPower} TH/s`]
    );
    
    // Actualizar actividad del usuario
    await this.updateLastMiningActivity(userId);
    
    return {
      id: sessionId,
      uuid: sessionUuid,
      userId,
      startTime,
      hashPower,
      status: 'active'
    };
  }

  async stopMiningSession(userId) {
    const session = await this.get(
      'SELECT * FROM mining_sessions WHERE user_id = ? AND status = "active" ORDER BY start_time DESC LIMIT 1',
      [userId]
    );
    
    if (!session) {
      throw new Error('No hay sesión activa de minería');
    }
    
    const endTime = new Date().toISOString();
    const durationSeconds = Math.floor((new Date(endTime) - new Date(session.start_time)) / 1000);
    
    // Calcular tokens ganados (esto se calcula en el manager)
    const tokensEarned = 0; // Se actualizará después
    
    await this.run(
      'UPDATE mining_sessions SET end_time = ?, status = "completed", duration_seconds = ?, tokens_earned = ? WHERE id = ?',
      [endTime, durationSeconds, tokensEarned, session.id]
    );
    
    // Registrar en historial
    await this.run(
      'INSERT INTO mining_history (user_id, session_id, action, tokens_earned, running_total, details) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, session.id, 'mining_stopped', tokensEarned, 0, `Sesión completada, duración: ${durationSeconds}s`]
    );
    
    return {
      ...session,
      endTime,
      durationSeconds,
      tokensEarned,
      status: 'completed'
    };
  }

  async updateSessionTokens(sessionId, tokensEarned) {
    await this.run(
      'UPDATE mining_sessions SET tokens_earned = ? WHERE id = ?',
      [tokensEarned, sessionId]
    );
  }

  async getActiveMiningSessions() {
    return await this.all(
      'SELECT ms.*, u.wallet_address FROM mining_sessions ms JOIN users u ON ms.user_id = u.id WHERE ms.status = "active"'
    );
  }

  async getUserSessions(userId, limit = 50) {
    return await this.all(
      'SELECT * FROM mining_sessions WHERE user_id = ? ORDER BY start_time DESC LIMIT ?',
      [userId, limit]
    );
  }

  // ===== OPERACIONES DE HISTORIAL =====
  
  async getMiningHistory(userId, limit = 100) {
    return await this.all(
      'SELECT * FROM mining_history WHERE user_id = ? ORDER BY timestamp DESC LIMIT ?',
      [userId, limit]
    );
  }

  async addMiningHistoryEntry(userId, action, tokensEarned, runningTotal, details = '', sessionId = null) {
    return await this.run(
      'INSERT INTO mining_history (user_id, session_id, action, tokens_earned, running_total, details) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, sessionId, action, tokensEarned, runningTotal, details]
    );
  }

  // ===== OPERACIONES ADMINISTRATIVAS =====
  
  async logAdminAction(adminUserId, actionType, targetUserId = null, amount = 0, reason = '') {
    return await this.run(
      'INSERT INTO admin_actions (admin_user_id, target_user_id, action_type, amount, reason) VALUES (?, ?, ?, ?, ?)',
      [adminUserId, targetUserId, actionType, amount, reason]
    );
  }

  async getAllUsers(limit = 100, offset = 0) {
    return await this.all(
      'SELECT * FROM users ORDER BY total_simulated_tokens DESC LIMIT ? OFFSET ?',
      [limit, offset]
    );
  }

  async getTotalUsers() {
    const result = await this.get('SELECT COUNT(*) as count FROM users WHERE status = "active"');
    return result.count;
  }

  async getTotalTokensSimulated() {
    const result = await this.get('SELECT SUM(total_simulated_tokens) as total FROM users WHERE status = "active"');
    return result.total || 0;
  }

  async getActiveMiners() {
    const result = await this.get(
      'SELECT COUNT(DISTINCT user_id) as count FROM mining_sessions WHERE status = "active"'
    );
    return result.count;
  }

  async getTotalMiningSessions() {
    const result = await this.get('SELECT COUNT(*) as count FROM mining_sessions');
    return result.count;
  }

  // ===== OPERACIONES DE MIGRACIÓN =====
  
  async markUserAsMigrated(userId) {
    await this.run(
      'UPDATE users SET is_migrated = TRUE, migration_date = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [userId]
    );
  }

  async createMigrationRecord(userId, walletAddress, tokensToMigrate) {
    return await this.run(
      'INSERT INTO migrations (user_id, wallet_address, tokens_migrated, status) VALUES (?, ?, ?, "pending")',
      [userId, walletAddress, tokensToMigrate]
    );
  }

  async updateMigrationStatus(migrationId, status, txHash = null) {
    const updates = ['status = ?'];
    const params = [status];
    
    if (txHash) {
      updates.push('migration_tx_hash = ?');
      params.push(txHash);
    }
    
    if (status === 'completed') {
      updates.push('completed_at = CURRENT_TIMESTAMP');
    }
    
    params.push(migrationId);
    
    await this.run(
      `UPDATE migrations SET ${updates.join(', ')} WHERE id = ?`,
      params
    );
  }

  // ===== OPERACIONES DE CONFIGURACIÓN =====
  
  async getSystemConfig(key = null) {
    if (key) {
      return await this.get('SELECT * FROM system_config WHERE config_key = ?', [key]);
    }
    return await this.all('SELECT * FROM system_config');
  }

  async updateSystemConfig(key, value) {
    await this.run(
      'UPDATE system_config SET config_value = ?, updated_at = CURRENT_TIMESTAMP WHERE config_key = ?',
      [value, key]
    );
  }

  async updateDailyStats() {
    const today = new Date().toISOString().split('T')[0];
    
    const stats = await this.get(`
      SELECT 
        COUNT(DISTINCT u.id) as total_users,
        COUNT(DISTINCT ms.user_id) as active_miners,
        COALESCE(SUM(u.total_simulated_tokens), 0) as total_tokens_simulated,
        COUNT(ms.id) as total_mining_sessions,
        COALESCE(SUM(ms.duration_seconds) / 3600.0, 0) as total_mining_hours
      FROM users u
      LEFT JOIN mining_sessions ms ON u.id = ms.user_id AND ms.status = 'completed'
      WHERE u.status = 'active'
    `);
    
    await this.run(`
      INSERT OR REPLACE INTO system_stats 
      (stat_date, total_users, active_miners, total_tokens_simulated, total_mining_sessions, total_mining_hours)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [today, stats.total_users, stats.active_miners, stats.total_tokens_simulated, stats.total_mining_sessions, stats.total_mining_hours]);
    
    return stats;
  }

  // ===== OPERACIONES DE EXPORTACIÓN =====
  
  async exportAllData() {
    const users = await this.all('SELECT * FROM users');
    const sessions = await this.all('SELECT * FROM mining_sessions');
    const history = await this.all('SELECT * FROM mining_history');
    const migrations = await this.all('SELECT * FROM migrations');
    const config = await this.all('SELECT * FROM system_config');
    const stats = await this.all('SELECT * FROM system_stats');
    
    return {
      exportDate: new Date().toISOString(),
      users,
      sessions,
      history,
      migrations,
      config,
      stats,
      summary: {
        totalUsers: users.length,
        totalTokens: users.reduce((sum, u) => sum + (u.total_simulated_tokens || 0), 0),
        totalSessions: sessions.length,
        totalHistory: history.length,
        totalMigrations: migrations.length
      }
    };
  }

  // ===== OPERACIONES DE LIMPIEZA =====
  
  async cleanupOldSessions(hoursOld = 24) {
    const cutoffTime = new Date(Date.now() - hoursOld * 60 * 60 * 1000).toISOString();
    
    // Marcar sesiones antiguas como timeout
    await this.run(
      'UPDATE mining_sessions SET status = "timeout", end_time = ? WHERE status = "active" AND start_time < ?',
      [cutoffTime, cutoffTime]
    );
    
    const result = await this.run(
      'SELECT COUNT(*) as count FROM mining_sessions WHERE status = "timeout" AND start_time < ?',
      [cutoffTime]
    );
    
    return result.count;
  }

  // ===== MÉTODOS UTILITARIOS =====
  
  async run(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) reject(err);
        else resolve({ lastID: this.lastID, changes: this.changes });
      });
    });
  }

  async get(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  async all(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  async close() {
    if (this.db) {
      return new Promise((resolve) => {
        this.db.close(resolve);
      });
    }
  }
}

module.exports = MiningDatabase;
