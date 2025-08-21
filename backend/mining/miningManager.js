// ===== GESTOR DE MINERÍA SIMULADA - RSC CHAIN =====
const MiningDatabase = require('../database/database');
const EventEmitter = require('events');

class SimulatedMiningManager extends EventEmitter {
  constructor() {
    super();
    this.activeMiningSessions = new Map();
    this.db = null;
    this.isInitialized = false;
    this.cleanupInterval = null;
    this.statsUpdateInterval = null;
    
    // Configuración por defecto
    this.config = {
      tokensPerSecond: 0.001,
      maxHashPower: 100.0,
      minHashPower: 0.1,
      sessionTimeoutHours: 24,
      updateIntervalMs: 1000, // Actualizar cada segundo
      statsUpdateIntervalMs: 60000 // Actualizar estadísticas cada minuto
    };
  }

  async init() {
    try {
      // Inicializar base de datos
      this.db = new MiningDatabase();
      await this.db.init();
      
      // Cargar configuración del sistema
      await this.loadSystemConfig();
      
      // Iniciar procesos de limpieza y estadísticas
      this.startCleanupProcess();
      this.startStatsUpdateProcess();
      
      // Recuperar sesiones activas de la base de datos
      await this.recoverActiveSessions();
      
      this.isInitialized = true;
      console.log('✅ Gestor de minería simulada inicializado correctamente');
      
      return true;
    } catch (error) {
      console.error('❌ Error inicializando gestor de minería:', error);
      throw error;
    }
  }

  async loadSystemConfig() {
    try {
      const configs = await this.db.getSystemConfig();
      
      for (const config of configs) {
        switch (config.config_key) {
          case 'tokens_per_second':
            this.config.tokensPerSecond = parseFloat(config.config_value);
            break;
          case 'max_hash_power':
            this.config.maxHashPower = parseFloat(config.config_value);
            break;
          case 'min_hash_power':
            this.config.minHashPower = parseFloat(config.config_value);
            break;
          case 'session_timeout_hours':
            this.config.sessionTimeoutHours = parseInt(config.config_value);
            break;
        }
      }
      
      console.log('📊 Configuración del sistema cargada:', this.config);
    } catch (error) {
      console.warn('⚠️ No se pudo cargar configuración del sistema, usando valores por defecto');
    }
  }

  async recoverActiveSessions() {
    try {
      const activeSessions = await this.db.getActiveMiningSessions();
      
      for (const session of activeSessions) {
        // Verificar si la sesión no ha expirado
        const sessionAge = Date.now() - new Date(session.start_time).getTime();
        const maxAge = this.config.sessionTimeoutHours * 60 * 60 * 1000;
        
        if (sessionAge < maxAge) {
          // Recuperar sesión activa
          this.activeMiningSessions.set(session.user_id, {
            id: session.id,
            uuid: session.session_uuid,
            userId: session.user_id,
            startTime: new Date(session.start_time),
            hashPower: session.hash_power,
            lastCalculation: new Date(),
            tokensEarned: 0,
            updateInterval: null
          });
          
          // Reiniciar cálculo de tokens
          this.startTokenCalculation(session.user_id);
        } else {
          // Marcar sesión como expirada
          await this.db.run(
            'UPDATE mining_sessions SET status = "timeout", end_time = ? WHERE id = ?',
            [new Date().toISOString(), session.id]
          );
        }
      }
      
      console.log(`🔄 Recuperadas ${this.activeMiningSessions.size} sesiones activas`);
    } catch (error) {
      console.error('❌ Error recuperando sesiones activas:', error);
    }
  }

  // ===== GESTIÓN DE SESIONES DE MINERÍA =====
  
  async startMining(userId, hashPower) {
    try {
      // Validar hash power
      if (hashPower < this.config.minHashPower || hashPower > this.config.maxHashPower) {
        throw new Error(`Hash power debe estar entre ${this.config.minHashPower} y ${this.config.maxHashPower} TH/s`);
      }
      
      // Verificar si el usuario ya está minando
      if (this.activeMiningSessions.has(userId)) {
        throw new Error('Usuario ya tiene una sesión activa de minería');
      }
      
      // Crear sesión en la base de datos
      const session = await this.db.startMiningSession(userId, hashPower);
      
      // Crear sesión en memoria
      const miningSession = {
        id: session.id,
        uuid: session.uuid,
        userId,
        startTime: new Date(session.startTime),
        hashPower,
        lastCalculation: new Date(),
        tokensEarned: 0,
        updateInterval: null
      };
      
      this.activeMiningSessions.set(userId, miningSession);
      
      // Iniciar cálculo de tokens en tiempo real
      this.startTokenCalculation(userId);
      
      // Emitir evento
      this.emit('mining_started', { userId, hashPower, sessionId: session.id });
      
      console.log(`⛏️ Usuario ${userId} inició minería con ${hashPower} TH/s`);
      
      return session;
    } catch (error) {
      console.error(`❌ Error iniciando minería para usuario ${userId}:`, error);
      throw error;
    }
  }

  async stopMining(userId) {
    try {
      const session = this.activeMiningSessions.get(userId);
      
      if (!session) {
        throw new Error('No hay sesión activa de minería');
      }
      
      // Detener cálculo de tokens
      this.stopTokenCalculation(userId);
      
      // Calcular tokens finales
      const finalTokens = this.calculateTokens(session);
      session.tokensEarned = finalTokens;
      
      // Finalizar sesión en la base de datos
      const dbSession = await this.db.stopMiningSession(userId);
      
      // Actualizar tokens ganados en la base de datos
      await this.db.updateSessionTokens(session.id, finalTokens);
      
      // Actualizar balance del usuario
      const newBalance = await this.db.updateUserBalance(userId, finalTokens);
      
      // Remover sesión de memoria
      this.activeMiningSessions.delete(userId);
      
      // Emitir evento
      this.emit('mining_stopped', { 
        userId, 
        tokensEarned: finalTokens, 
        newBalance,
        sessionId: session.id 
      });
      
      console.log(`⏹️ Usuario ${userId} detuvo minería, ganó ${finalTokens.toFixed(6)} tokens`);
      
      return {
        ...dbSession,
        tokensEarned: finalTokens,
        newBalance
      };
    } catch (error) {
      console.error(`❌ Error deteniendo minería para usuario ${userId}:`, error);
      throw error;
    }
  }

  // ===== CÁLCULO DE TOKENS EN TIEMPO REAL =====
  
  startTokenCalculation(userId) {
    const session = this.activeMiningSessions.get(userId);
    if (!session) return;
    
    // Limpiar intervalo existente si hay uno
    if (session.updateInterval) {
      clearInterval(session.updateInterval);
    }
    
    // Crear nuevo intervalo
    session.updateInterval = setInterval(() => {
      try {
        // Calcular tokens acumulados hasta ahora
        const currentTokens = this.calculateTokens(session);
        const tokensDelta = currentTokens - session.tokensEarned;
        
        if (tokensDelta > 0) {
          session.tokensEarned = currentTokens;
          session.lastCalculation = new Date();
          
          // Emitir actualización
          this.emit('tokens_updated', {
            userId,
            sessionId: session.id,
            tokensEarned: currentTokens,
            tokensDelta,
            hashPower: session.hashPower,
            duration: this.getSessionDuration(session)
          });
          
          // Actualizar en base de datos cada 10 segundos para no sobrecargar
          if (this.getSessionDuration(session) % 10 === 0) {
            this.db.updateSessionTokens(session.id, currentTokens);
          }
        }
      } catch (error) {
        console.error(`❌ Error en cálculo de tokens para usuario ${userId}:`, error);
      }
    }, this.config.updateIntervalMs);
  }

  stopTokenCalculation(userId) {
    const session = this.activeMiningSessions.get(userId);
    if (session && session.updateInterval) {
      clearInterval(session.updateInterval);
      session.updateInterval = null;
    }
  }

  calculateTokens(session) {
    const now = Date.now();
    const duration = (now - session.startTime.getTime()) / 1000; // en segundos
    return duration * session.hashPower * this.config.tokensPerSecond;
  }

  getSessionDuration(session) {
    return Math.floor((Date.now() - session.startTime.getTime()) / 1000);
  }

  // ===== CONSULTAS DE ESTADO =====
  
  isUserMining(userId) {
    return this.activeMiningSessions.has(userId);
  }

  getCurrentSession(userId) {
    const session = this.activeMiningSessions.get(userId);
    if (!session) return null;
    
    return {
      id: session.id,
      uuid: session.uuid,
      startTime: session.startTime,
      hashPower: session.hashPower,
      tokensEarned: session.tokensEarned,
      duration: this.getSessionDuration(session),
      status: 'active'
    };
  }

  getAllActiveSessions() {
    const sessions = [];
    
    for (const [userId, session] of this.activeMiningSessions) {
      sessions.push({
        userId,
        sessionId: session.id,
        startTime: session.startTime,
        hashPower: session.hashPower,
        tokensEarned: session.tokensEarned,
        duration: this.getSessionDuration(session)
      });
    }
    
    return sessions;
  }

  getUserStats(userId) {
    const session = this.activeMiningSessions.get(userId);
    if (!session) return null;
    
    const duration = this.getSessionDuration(session);
    const tokensPerHour = session.hashPower * this.config.tokensPerSecond * 3600;
    const estimatedDailyTokens = tokensPerHour * 24;
    
    return {
      isMining: true,
      sessionId: session.id,
      startTime: session.startTime,
      hashPower: session.hashPower,
      currentTokens: session.tokensEarned,
      duration,
      tokensPerHour,
      estimatedDailyTokens,
      hashPowerMultiplier: this.config.tokensPerSecond
    };
  }

  // ===== PROCESOS DE MANTENIMIENTO =====
  
  startCleanupProcess() {
    this.cleanupInterval = setInterval(async () => {
      try {
        await this.cleanupExpiredSessions();
      } catch (error) {
        console.error('❌ Error en proceso de limpieza:', error);
      }
    }, 5 * 60 * 1000); // Cada 5 minutos
  }

  startStatsUpdateProcess() {
    this.statsUpdateInterval = setInterval(async () => {
      try {
        await this.updateSystemStats();
      } catch (error) {
        console.error('❌ Error actualizando estadísticas:', error);
      }
    }, this.config.statsUpdateIntervalMs);
  }

  async cleanupExpiredSessions() {
    try {
      const cutoffTime = new Date(Date.now() - this.config.sessionTimeoutHours * 60 * 60 * 1000);
      let cleanedCount = 0;
      
      for (const [userId, session] of this.activeMiningSessions) {
        if (session.startTime < cutoffTime) {
          console.log(`⏰ Sesión expirada para usuario ${userId}, limpiando...`);
          
          // Detener cálculo
          this.stopTokenCalculation(userId);
          
          // Finalizar sesión en base de datos
          await this.db.run(
            'UPDATE mining_sessions SET status = "timeout", end_time = ? WHERE id = ?',
            [new Date().toISOString(), session.id]
          );
          
          // Remover de memoria
          this.activeMiningSessions.delete(userId);
          
          cleanedCount++;
        }
      }
      
      if (cleanedCount > 0) {
        console.log(`🧹 Limpiadas ${cleanedCount} sesiones expiradas`);
      }
    } catch (error) {
      console.error('❌ Error en limpieza de sesiones:', error);
    }
  }

  async updateSystemStats() {
    try {
      if (this.db) {
        await this.db.updateDailyStats();
      }
    } catch (error) {
      console.error('❌ Error actualizando estadísticas del sistema:', error);
    }
  }

  // ===== CONFIGURACIÓN DINÁMICA =====
  
  async updateConfig(key, value) {
    try {
      // Validar valor
      switch (key) {
        case 'tokens_per_second':
          if (value <= 0) throw new Error('Tokens por segundo debe ser mayor a 0');
          this.config.tokensPerSecond = parseFloat(value);
          break;
        case 'max_hash_power':
          if (value <= 0) throw new Error('Hash power máximo debe ser mayor a 0');
          this.config.maxHashPower = parseFloat(value);
          break;
        case 'min_hash_power':
          if (value <= 0) throw new Error('Hash power mínimo debe ser mayor a 0');
          this.config.minHashPower = parseFloat(value);
          break;
        case 'session_timeout_hours':
          if (value <= 0) throw new Error('Timeout de sesión debe ser mayor a 0');
          this.config.sessionTimeoutHours = parseInt(value);
          break;
        default:
          throw new Error(`Configuración desconocida: ${key}`);
      }
      
      // Actualizar en base de datos
      await this.db.updateSystemConfig(key, value);
      
      console.log(`⚙️ Configuración actualizada: ${key} = ${value}`);
      
      // Emitir evento de configuración actualizada
      this.emit('config_updated', { key, value });
      
      return true;
    } catch (error) {
      console.error(`❌ Error actualizando configuración ${key}:`, error);
      throw error;
    }
  }

  getCurrentConfig() {
    return { ...this.config };
  }

  // ===== LIMPIEZA Y DESTRUCCIÓN =====
  
  async shutdown() {
    try {
      console.log('🔄 Cerrando gestor de minería simulada...');
      
      // Detener todos los intervalos
      if (this.cleanupInterval) {
        clearInterval(this.cleanupInterval);
      }
      if (this.statsUpdateInterval) {
        clearInterval(this.statsUpdateInterval);
      }
      
      // Detener todas las sesiones activas
      for (const [userId, session] of this.activeMiningSessions) {
        this.stopTokenCalculation(userId);
      }
      
      // Limpiar sesiones activas
      this.activeMiningSessions.clear();
      
      // Cerrar base de datos
      if (this.db) {
        await this.db.close();
      }
      
      console.log('✅ Gestor de minería simulada cerrado correctamente');
    } catch (error) {
      console.error('❌ Error cerrando gestor de minería:', error);
    }
  }
}

module.exports = SimulatedMiningManager;
