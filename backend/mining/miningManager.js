// SimulatedMiningManager - usa la base de datos SQLite existente con un adapter
const MiningDatabase = require('../database/database');

class SimulatedMiningManager {
  constructor() {
    this.db = null;
    this._db = null; // instancia real de MiningDatabase
  }

  async init() {
    this._db = new MiningDatabase();
    await this._db.init();

    // Adapter: expone la API que espera routes.js
    this.db = {
      getUserByWallet: (walletAddress) => this._db.getUserByWallet(walletAddress),

      createUser: async (obj) => {
        const walletAddress = obj.walletAddress || obj.wallet_address;
        const email = obj.email || null;
        const username = obj.username || (obj.walletAddress ? `User_${String(walletAddress).slice(-6)}` : null);
        const result = await this._db.createUser(walletAddress, email, username);
        const user = await this._db.getUserById(result.userId);
        return { id: user.id, userId: user.id, username: user.username, walletAddress: user.wallet_address || walletAddress, ...user };
      },

      getUserById: async (id) => {
        if (typeof id === 'object' && id != null && id.id != null) return id;
        return this._db.getUserById(id);
      },

      createMiningSession: async (session) => {
        const userId = session.userId;
        const hashPower = session.hashPower || 1;
        const result = await this._db.startMiningSession(userId, hashPower);
        return result;
      },

      updateMiningSession: async (sessionId, updates) => {
        const fields = [];
        const params = [];
        if (updates.isActive === false || updates.status) {
          fields.push('status = ?');
          params.push(updates.status || 'completed');
        }
        if (updates.endTime) {
          fields.push('end_time = ?');
          params.push(updates.endTime);
        }
        if (updates.tokensClaimed != null) {
          fields.push('tokens_earned = ?');
          params.push(updates.tokensClaimed);
        }
        if (updates.totalTokens != null) {
          fields.push('tokens_earned = ?');
          params.push(updates.totalTokens);
        }
        if (fields.length === 0) return;
        params.push(sessionId);
        await this._db.run(
          `UPDATE mining_sessions SET ${fields.join(', ')} WHERE id = ?`,
          params
        );
      },

      updateSystemStats: async () => {
        // No-op o actualizar system_stats si se necesita
        await this._db.updateDailyStats().catch(() => {});
      },

      getActiveMiningSession: async (walletAddress) => {
        const user = await this._db.getUserByWallet(walletAddress);
        if (!user) return null;
        const sessions = await this._db.all(
          'SELECT * FROM mining_sessions WHERE user_id = ? AND status = ? ORDER BY start_time DESC LIMIT 1',
          [user.id, 'active']
        );
        const row = sessions && sessions[0];
        if (!row) return null;
        return {
          id: row.id,
          startTime: row.start_time,
          endTime: row.end_time,
          hashPower: row.hash_power,
          totalTokens: row.tokens_earned,
          userId: row.user_id
        };
      },

      createMiningHistory: async (obj) => {
        const userId = obj.userId;
        const sessionId = obj.sessionId || null;
        const tokensEarned = obj.tokensMined || obj.tokens_earned || 0;
        await this._db.addMiningHistoryEntry(userId, obj.status || 'claimed', tokensEarned, tokensEarned, obj.status || '', sessionId);
      },

      getMiningHistory: async (walletAddress, limit = 100) => {
        const user = await this._db.getUserByWallet(walletAddress);
        if (!user) return [];
        return this._db.getMiningHistory(user.id, limit);
      },

      getSystemStats: async () => {
        const [activeMiners, totalTokens, totalSessions] = await Promise.all([
          this._db.getActiveMiners(),
          this._db.getTotalTokensSimulated(),
          this._db.getTotalMiningSessions()
        ]);
        return {
          activeMiners: activeMiners || 0,
          totalTokensSimulated: totalTokens || 0,
          totalMiningSessions: totalSessions || 0
        };
      },

      updateLastMiningActivity: async (walletAddress) => {
        const user = await this._db.getUserByWallet(walletAddress);
        if (user) await this._db.updateLastMiningActivity(user.id);
      }
    };
  }
}

module.exports = SimulatedMiningManager;
