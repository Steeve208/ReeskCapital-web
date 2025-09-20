/* ================================
   ACHIEVEMENT SYSTEM - RSC MINING
================================ */

/**
 * 🏆 SISTEMA DE LOGROS Y ACHIEVEMENTS
 * 
 * Sistema completo para mantener engagement
 * - Logros de minería
 * - Logros sociales
 * - Logros de progresión
 * - Recompensas especiales
 * - Notificaciones de logros
 */

class AchievementSystem {
    constructor() {
        this.achievements = {
            // 🏁 LOGROS DE INICIO
            'first_mine': {
                id: 'first_mine',
                name: 'Primer Minado',
                description: 'Realiza tu primera sesión de minería',
                icon: 'fas fa-play',
                color: '#4CAF50',
                reward: { tokens: 10, xp: 100 },
                requirement: { type: 'mining_sessions', value: 1 },
                category: 'starter'
            },
            'first_token': {
                id: 'first_token',
                name: 'Primer RSC',
                description: 'Mina tu primer RSC token',
                icon: 'fas fa-coins',
                color: '#FFD700',
                reward: { tokens: 5, xp: 50 },
                requirement: { type: 'tokens_mined', value: 1 },
                category: 'starter'
            },

            // ⛏️ LOGROS DE MINERÍA
            'mining_novice': {
                id: 'mining_novice',
                name: 'Minero Novato',
                description: 'Mina 100 RSC tokens',
                icon: 'fas fa-hammer',
                color: '#8BC34A',
                reward: { tokens: 50, xp: 500 },
                requirement: { type: 'tokens_mined', value: 100 },
                category: 'mining'
            },
            'mining_expert': {
                id: 'mining_expert',
                name: 'Minero Experto',
                description: 'Mina 1,000 RSC tokens',
                icon: 'fas fa-pickaxe',
                color: '#FF9800',
                reward: { tokens: 200, xp: 2000 },
                requirement: { type: 'tokens_mined', value: 1000 },
                category: 'mining'
            },
            'mining_master': {
                id: 'mining_master',
                name: 'Maestro Minero',
                description: 'Mina 10,000 RSC tokens',
                icon: 'fas fa-crown',
                color: '#9C27B0',
                reward: { tokens: 1000, xp: 10000 },
                requirement: { type: 'tokens_mined', value: 10000 },
                category: 'mining'
            },

            // ⏰ LOGROS DE TIEMPO
            'daily_miner': {
                id: 'daily_miner',
                name: 'Minero Diario',
                description: 'Mina durante 7 días consecutivos',
                icon: 'fas fa-calendar-check',
                color: '#2196F3',
                reward: { tokens: 100, xp: 1000 },
                requirement: { type: 'consecutive_days', value: 7 },
                category: 'time'
            },
            'dedicated_miner': {
                id: 'dedicated_miner',
                name: 'Minero Dedicado',
                description: 'Mina durante 30 días consecutivos',
                icon: 'fas fa-fire',
                color: '#FF5722',
                reward: { tokens: 500, xp: 5000 },
                requirement: { type: 'consecutive_days', value: 30 },
                category: 'time'
            },

            // 📈 LOGROS DE PROGRESIÓN
            'level_up_5': {
                id: 'level_up_5',
                name: 'Ascenso Rápido',
                description: 'Alcanza el nivel 5',
                icon: 'fas fa-arrow-up',
                color: '#4CAF50',
                reward: { tokens: 100, xp: 500 },
                requirement: { type: 'level', value: 5 },
                category: 'progression'
            },
            'level_up_10': {
                id: 'level_up_10',
                name: 'Veterano',
                description: 'Alcanza el nivel 10',
                icon: 'fas fa-medal',
                color: '#FF9800',
                reward: { tokens: 300, xp: 1500 },
                requirement: { type: 'level', value: 10 },
                category: 'progression'
            },
            'level_up_25': {
                id: 'level_up_25',
                name: 'Elite',
                description: 'Alcanza el nivel 25',
                icon: 'fas fa-star',
                color: '#9C27B0',
                reward: { tokens: 1000, xp: 5000 },
                requirement: { type: 'level', value: 25 },
                category: 'progression'
            },

            // 👥 LOGROS SOCIALES
            'social_butterfly': {
                id: 'social_butterfly',
                name: 'Mariposa Social',
                description: 'Únete a tu primer clan',
                icon: 'fas fa-users',
                color: '#E91E63',
                reward: { tokens: 50, xp: 300 },
                requirement: { type: 'clan_joined', value: 1 },
                category: 'social'
            },
            'clan_contributor': {
                id: 'clan_contributor',
                name: 'Contribuidor',
                description: 'Contribuye 1,000 RSC a tu clan',
                icon: 'fas fa-handshake',
                color: '#3F51B5',
                reward: { tokens: 200, xp: 1000 },
                requirement: { type: 'clan_contribution', value: 1000 },
                category: 'social'
            },

            // 💰 LOGROS ECONÓMICOS
            'first_purchase': {
                id: 'first_purchase',
                name: 'Primera Compra',
                description: 'Compra tu primer equipo',
                icon: 'fas fa-shopping-cart',
                color: '#607D8B',
                reward: { tokens: 25, xp: 200 },
                requirement: { type: 'equipment_purchased', value: 1 },
                category: 'economic'
            },
            'big_spender': {
                id: 'big_spender',
                name: 'Gran Gastador',
                description: 'Gasta 5,000 RSC en equipos',
                icon: 'fas fa-money-bill-wave',
                color: '#4CAF50',
                reward: { tokens: 500, xp: 2500 },
                requirement: { type: 'tokens_spent', value: 5000 },
                category: 'economic'
            },

            // 🎯 LOGROS ESPECIALES
            'efficiency_master': {
                id: 'efficiency_master',
                name: 'Maestro de Eficiencia',
                description: 'Alcanza 150% de eficiencia',
                icon: 'fas fa-bolt',
                color: '#FFEB3B',
                reward: { tokens: 300, xp: 1500 },
                requirement: { type: 'max_efficiency', value: 150 },
                category: 'special'
            },
            'speed_demon': {
                id: 'speed_demon',
                name: 'Demonio de Velocidad',
                description: 'Alcanza 1000 H/s de hash rate',
                icon: 'fas fa-tachometer-alt',
                color: '#F44336',
                reward: { tokens: 400, xp: 2000 },
                requirement: { type: 'max_hashrate', value: 1000 },
                category: 'special'
            }
        };

        this.userAchievements = {
            unlocked: [],
            progress: {},
            notifications: [],
            stats: {
                tokens_mined: 0,
                mining_sessions: 0,
                consecutive_days: 0,
                last_mining_date: null,
                level: 1,
                clan_contribution: 0,
                equipment_purchased: 0,
                tokens_spent: 0,
                max_efficiency: 0,
                max_hashrate: 0
            }
        };

        this.loadAchievementData();
    }

    loadAchievementData() {
        const stored = localStorage.getItem('rsc_achievements');
        if (stored) {
            const data = JSON.parse(stored);
            this.userAchievements = { ...this.userAchievements, ...data };
        }
    }

    // ✅ Actualizar estadísticas
    updateStats(statsUpdate) {
        Object.keys(statsUpdate).forEach(key => {
            if (key === 'tokens_mined' || key === 'mining_sessions' || key === 'clan_contribution' || 
                key === 'equipment_purchased' || key === 'tokens_spent') {
                this.userAchievements.stats[key] += statsUpdate[key];
            } else {
                this.userAchievements.stats[key] = Math.max(
                    this.userAchievements.stats[key] || 0, 
                    statsUpdate[key]
                );
            }
        });

        // Actualizar días consecutivos
        this.updateConsecutiveDays();

        // Verificar logros
        this.checkAchievements();

        // Guardar datos
        this.saveAchievementData();
    }

    updateConsecutiveDays() {
        const today = new Date().toDateString();
        const lastDate = this.userAchievements.stats.last_mining_date;
        
        if (lastDate !== today) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            
            if (lastDate === yesterday.toDateString()) {
                this.userAchievements.stats.consecutive_days++;
            } else if (lastDate !== today) {
                this.userAchievements.stats.consecutive_days = 1;
            }
            
            this.userAchievements.stats.last_mining_date = today;
        }
    }

    // 🔍 Verificar logros
    checkAchievements() {
        Object.values(this.achievements).forEach(achievement => {
            if (!this.isUnlocked(achievement.id)) {
                if (this.checkRequirement(achievement)) {
                    this.unlockAchievement(achievement);
                }
            }
        });
    }

    checkRequirement(achievement) {
        const req = achievement.requirement;
        const stats = this.userAchievements.stats;
        
        switch (req.type) {
            case 'tokens_mined':
                return stats.tokens_mined >= req.value;
            case 'mining_sessions':
                return stats.mining_sessions >= req.value;
            case 'consecutive_days':
                return stats.consecutive_days >= req.value;
            case 'level':
                return stats.level >= req.value;
            case 'clan_joined':
                return window.clanSystem?.isInClan() || false;
            case 'clan_contribution':
                return stats.clan_contribution >= req.value;
            case 'equipment_purchased':
                return stats.equipment_purchased >= req.value;
            case 'tokens_spent':
                return stats.tokens_spent >= req.value;
            case 'max_efficiency':
                return stats.max_efficiency >= req.value;
            case 'max_hashrate':
                return stats.max_hashrate >= req.value;
            default:
                return false;
        }
    }

    // 🏆 Desbloquear logro
    unlockAchievement(achievement) {
        this.userAchievements.unlocked.push(achievement.id);
        
        // Agregar notificación
        const notification = {
            id: Date.now(),
            achievementId: achievement.id,
            timestamp: new Date(),
            seen: false
        };
        this.userAchievements.notifications.push(notification);

        // Aplicar recompensa
        if (achievement.reward) {
            if (achievement.reward.tokens && window.supabaseIntegration) {
                window.supabaseIntegration.addBalance(achievement.reward.tokens);
            }
            if (achievement.reward.xp && window.levelSystem) {
                window.levelSystem.addXP(achievement.reward.xp, 'achievement');
            }
        }

        // Mostrar notificación
        this.showAchievementNotification(achievement);

        console.log(`🏆 ¡Logro desbloqueado: ${achievement.name}!`);
    }

    // 🎉 Mostrar notificación de logro
    showAchievementNotification(achievement) {
        // Crear elemento de notificación
        const notification = document.createElement('div');
        notification.className = 'achievement-notification';
        notification.innerHTML = `
            <div class="achievement-notification-content">
                <i class="${achievement.icon}" style="color: ${achievement.color}"></i>
                <div class="achievement-info">
                    <h4>¡Logro Desbloqueado!</h4>
                    <h3>${achievement.name}</h3>
                    <p>${achievement.description}</p>
                    ${achievement.reward ? `
                        <div class="achievement-reward">
                            ${achievement.reward.tokens ? `+${achievement.reward.tokens} RSC ` : ''}
                            ${achievement.reward.xp ? `+${achievement.reward.xp} XP` : ''}
                        </div>
                    ` : ''}
                </div>
            </div>
        `;

        // Agregar al DOM
        document.body.appendChild(notification);

        // Animar entrada
        setTimeout(() => notification.classList.add('show'), 100);

        // Remover después de 5 segundos
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 5000);
    }

    // 📊 Métodos de consulta
    isUnlocked(achievementId) {
        return this.userAchievements.unlocked.includes(achievementId);
    }

    getUnlockedAchievements() {
        return this.userAchievements.unlocked.map(id => this.achievements[id]);
    }

    getLockedAchievements() {
        return Object.values(this.achievements).filter(a => !this.isUnlocked(a.id));
    }

    getAchievementsByCategory(category) {
        return Object.values(this.achievements).filter(a => a.category === category);
    }

    getProgress(achievementId) {
        const achievement = this.achievements[achievementId];
        if (!achievement || this.isUnlocked(achievementId)) return 100;

        const req = achievement.requirement;
        const stats = this.userAchievements.stats;
        let current = 0;

        switch (req.type) {
            case 'tokens_mined':
                current = stats.tokens_mined;
                break;
            case 'mining_sessions':
                current = stats.mining_sessions;
                break;
            case 'consecutive_days':
                current = stats.consecutive_days;
                break;
            case 'level':
                current = stats.level;
                break;
            case 'clan_contribution':
                current = stats.clan_contribution;
                break;
            case 'equipment_purchased':
                current = stats.equipment_purchased;
                break;
            case 'tokens_spent':
                current = stats.tokens_spent;
                break;
            case 'max_efficiency':
                current = stats.max_efficiency;
                break;
            case 'max_hashrate':
                current = stats.max_hashrate;
                break;
        }

        return Math.min(100, (current / req.value) * 100);
    }

    getUnreadNotifications() {
        return this.userAchievements.notifications.filter(n => !n.seen);
    }

    markNotificationAsRead(notificationId) {
        const notification = this.userAchievements.notifications.find(n => n.id === notificationId);
        if (notification) {
            notification.seen = true;
            this.saveAchievementData();
        }
    }

    getStats() {
        return { ...this.userAchievements.stats };
    }

    saveAchievementData() {
        localStorage.setItem('rsc_achievements', JSON.stringify(this.userAchievements));
    }
}

// Crear instancia global
window.achievementSystem = new AchievementSystem();

console.log('🏆 Achievement System cargado');
