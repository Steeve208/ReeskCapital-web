/* ================================
   LEVEL SYSTEM - RSC MINING
================================ */

/**
 * 🎯 SISTEMA DE NIVELES Y PROGRESIÓN
 * 
 * Sistema completo de niveles con desbloqueo progresivo
 * - XP por minería exitosa
 * - Desbloqueo de características por nivel
 * - Multiplicadores de recompensa
 * - Logros y misiones
 */

class LevelSystem {
    constructor() {
        this.userLevel = {
            level: 1,
            xp: 0,
            totalXp: 0,
            achievements: [],
            unlockedFeatures: ['basic_mining'],
            lastLevelUp: null
        };

        this.levelRequirements = {
            1: { xpRequired: 0, unlocks: ['basic_mining'] },
            2: { xpRequired: 100, unlocks: ['equipment_upgrade'] },
            3: { xpRequired: 250, unlocks: ['neural_algorithm'] },
            4: { xpRequired: 500, unlocks: ['daily_bonus'] },
            5: { xpRequired: 1000, unlocks: ['hybrid_algorithm'] },
            6: { xpRequired: 2000, unlocks: ['clan_system'] },
            7: { xpRequired: 4000, unlocks: ['adaptive_algorithm'] },
            8: { xpRequired: 8000, unlocks: ['marketplace'] },
            9: { xpRequired: 15000, unlocks: ['rare_equipment'] },
            10: { xpRequired: 30000, unlocks: ['legendary_equipment'] }
        };

        this.achievements = {
            first_mining: {
                name: 'Primera Minería',
                description: 'Completa tu primera sesión de minería',
                xpReward: 50,
                icon: 'fas fa-play',
                unlocked: false
            },
            mining_master: {
                name: 'Maestro Minero',
                description: 'Minera por 7 días consecutivos',
                xpReward: 200,
                icon: 'fas fa-trophy',
                unlocked: false
            },
            equipment_collector: {
                name: 'Coleccionista de Equipos',
                description: 'Mejora todos tus equipos al nivel 5',
                xpReward: 300,
                icon: 'fas fa-tools',
                unlocked: false
            },
            referral_king: {
                name: 'Rey de los Referidos',
                description: 'Invita a 10 amigos',
                xpReward: 500,
                icon: 'fas fa-users',
                unlocked: false
            },
            level_10: {
                name: 'Leyenda',
                description: 'Alcanza el nivel 10',
                xpReward: 1000,
                icon: 'fas fa-crown',
                unlocked: false
            }
        };

        this.initializeLevelSystem();
    }

    initializeLevelSystem() {
        // Cargar datos del usuario desde localStorage
        const stored = localStorage.getItem('rsc_user_level');
        if (stored) {
            const savedData = JSON.parse(stored);
            this.userLevel = { ...this.userLevel, ...savedData };
        }

        // Verificar logros desbloqueados
        this.checkAchievements();
    }

    addXP(amount, source = 'mining') {
        const oldLevel = this.userLevel.level;
        this.userLevel.xp += amount;
        this.userLevel.totalXp += amount;

        // Verificar si subió de nivel
        const newLevel = this.calculateLevel();
        if (newLevel > oldLevel) {
            this.levelUp(newLevel);
        }

        this.saveLevelData();
        this.checkAchievements();

        console.log(`+${amount} XP (${source}) - Nivel ${this.userLevel.level}`);
        return {
            xpGained: amount,
            newLevel: this.userLevel.level,
            leveledUp: newLevel > oldLevel
        };
    }

    calculateLevel() {
        let level = 1;
        for (let lvl = 1; lvl <= 10; lvl++) {
            if (this.userLevel.totalXp >= this.levelRequirements[lvl].xpRequired) {
                level = lvl;
            } else {
                break;
            }
        }
        return level;
    }

    levelUp(newLevel) {
        const oldLevel = this.userLevel.level;
        this.userLevel.level = newLevel;
        this.userLevel.lastLevelUp = Date.now();

        // Desbloquear características del nuevo nivel
        const levelData = this.levelRequirements[newLevel];
        if (levelData && levelData.unlocks) {
            levelData.unlocks.forEach(feature => {
                if (!this.userLevel.unlockedFeatures.includes(feature)) {
                    this.userLevel.unlockedFeatures.push(feature);
                }
            });
        }

        // Mostrar notificación de subida de nivel
        this.showLevelUpNotification(newLevel, oldLevel);

        console.log(`🎉 ¡Subiste al nivel ${newLevel}!`);
    }

    showLevelUpNotification(newLevel, oldLevel) {
        const levelData = this.levelRequirements[newLevel];
        const unlockedFeatures = levelData ? levelData.unlocks : [];

        let message = `🎉 ¡Subiste al nivel ${newLevel}!`;
        if (unlockedFeatures.length > 0) {
            message += `\n\nNuevas características desbloqueadas:`;
            unlockedFeatures.forEach(feature => {
                message += `\n• ${this.getFeatureName(feature)}`;
            });
        }

        // Mostrar notificación en la UI
        if (window.showNotification) {
            window.showNotification(message, 'success');
        }

        // Mostrar modal de nivel si existe
        this.showLevelUpModal(newLevel, unlockedFeatures);
    }

    showLevelUpModal(newLevel, unlockedFeatures) {
        // Crear modal de subida de nivel
        const modal = document.createElement('div');
        modal.className = 'level-up-modal';
        modal.innerHTML = `
            <div class="level-up-content">
                <div class="level-up-header">
                    <i class="fas fa-star"></i>
                    <h2>¡Nivel ${newLevel} Desbloqueado!</h2>
                </div>
                <div class="level-up-features">
                    <h3>Nuevas Características:</h3>
                    <ul>
                        ${unlockedFeatures.map(feature => 
                            `<li><i class="fas fa-check"></i> ${this.getFeatureName(feature)}</li>`
                        ).join('')}
                    </ul>
                </div>
                <button class="btn-quantum" onclick="this.parentElement.parentElement.remove()">
                    <i class="fas fa-check"></i>
                    <span>Continuar</span>
                </button>
            </div>
        `;

        document.body.appendChild(modal);
        
        // Auto-remover después de 5 segundos
        setTimeout(() => {
            if (modal.parentElement) {
                modal.remove();
            }
        }, 5000);
    }

    getFeatureName(feature) {
        const featureNames = {
            'basic_mining': 'Minería Básica',
            'equipment_upgrade': 'Mejora de Equipos',
            'neural_algorithm': 'Algoritmo Neural',
            'daily_bonus': 'Bonificación Diaria',
            'hybrid_algorithm': 'Algoritmo Híbrido',
            'clan_system': 'Sistema de Clanes',
            'adaptive_algorithm': 'Algoritmo Adaptativo',
            'marketplace': 'Marketplace',
            'rare_equipment': 'Equipos Raros',
            'legendary_equipment': 'Equipos Legendarios'
        };
        return featureNames[feature] || feature;
    }

    checkAchievements() {
        Object.keys(this.achievements).forEach(achievementId => {
            const achievement = this.achievements[achievementId];
            if (achievement.unlocked) return;

            let shouldUnlock = false;

            switch (achievementId) {
                case 'first_mining':
                    shouldUnlock = this.userLevel.totalXp > 0;
                    break;
                case 'mining_master':
                    // Verificar si ha minado 7 días consecutivos
                    shouldUnlock = this.checkConsecutiveMiningDays() >= 7;
                    break;
                case 'equipment_collector':
                    // Verificar si todos los equipos están en nivel 5
                    shouldUnlock = this.checkAllEquipmentLevel5();
                    break;
                case 'referral_king':
                    // Verificar si tiene 10 referidos
                    shouldUnlock = this.checkReferralCount() >= 10;
                    break;
                case 'level_10':
                    shouldUnlock = this.userLevel.level >= 10;
                    break;
            }

            if (shouldUnlock) {
                this.unlockAchievement(achievementId);
            }
        });
    }

    unlockAchievement(achievementId) {
        const achievement = this.achievements[achievementId];
        if (achievement.unlocked) return;

        achievement.unlocked = true;
        this.userLevel.achievements.push(achievementId);

        // Dar XP por el logro
        this.addXP(achievement.xpReward, 'achievement');

        // Mostrar notificación de logro
        this.showAchievementNotification(achievement);

        console.log(`🏆 Logro desbloqueado: ${achievement.name}`);
    }

    showAchievementNotification(achievement) {
        const notification = document.createElement('div');
        notification.className = 'achievement-notification';
        notification.innerHTML = `
            <div class="achievement-content">
                <div class="achievement-icon">
                    <i class="${achievement.icon}"></i>
                </div>
                <div class="achievement-text">
                    <h4>🏆 ${achievement.name}</h4>
                    <p>${achievement.description}</p>
                    <span class="achievement-xp">+${achievement.xpReward} XP</span>
                </div>
            </div>
        `;

        document.body.appendChild(notification);

        // Auto-remover después de 4 segundos
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 4000);
    }

    checkConsecutiveMiningDays() {
        // Implementar lógica para verificar días consecutivos de minería
        // Por ahora, retornar un valor simulado
        return Math.floor(this.userLevel.totalXp / 100);
    }

    checkAllEquipmentLevel5() {
        if (!window.equipmentSystem) return false;
        
        const equipmentStats = window.equipmentSystem.getAllEquipmentStats();
        return Object.values(equipmentStats).every(stats => 
            stats && stats.level >= 5
        );
    }

    checkReferralCount() {
        // Implementar lógica para verificar número de referidos
        // Por ahora, retornar un valor simulado
        return Math.floor(this.userLevel.totalXp / 500);
    }

    getLevelProgress() {
        const currentLevel = this.userLevel.level;
        const nextLevel = Math.min(currentLevel + 1, 10);
        
        const currentLevelXP = this.levelRequirements[currentLevel].xpRequired;
        const nextLevelXP = this.levelRequirements[nextLevel].xpRequired;
        
        const progressXP = this.userLevel.totalXp - currentLevelXP;
        const requiredXP = nextLevelXP - currentLevelXP;
        
        return {
            currentLevel: currentLevel,
            nextLevel: nextLevel,
            progressXP: progressXP,
            requiredXP: requiredXP,
            progressPercentage: Math.min(100, (progressXP / requiredXP) * 100)
        };
    }

    getMultiplierForLevel(level) {
        // Multiplicador de recompensas basado en nivel
        return 1 + (level - 1) * 0.1; // 10% más por nivel
    }

    getCurrentMultiplier() {
        return this.getMultiplierForLevel(this.userLevel.level);
    }

    saveLevelData() {
        localStorage.setItem('rsc_user_level', JSON.stringify(this.userLevel));
    }

    async syncLevelToSupabase() {
        try {
            if (!window.supabaseIntegration?.user?.isAuthenticated) return;

            const userId = window.supabaseIntegration.user.id;
            const levelData = {
                user_id: userId,
                level: this.userLevel.level,
                xp: this.userLevel.xp,
                total_xp: this.userLevel.totalXp,
                achievements: JSON.stringify(this.userLevel.achievements),
                unlocked_features: JSON.stringify(this.userLevel.unlockedFeatures),
                last_updated: new Date().toISOString()
            };

            // Intentar actualizar primero
            const updateResponse = await window.supabaseIntegration.makeRequest(
                'PATCH',
                `/rest/v1/user_levels?user_id=eq.${userId}`,
                levelData
            );

            if (!updateResponse.ok) {
                // Si no existe, crear nuevo registro
                const insertResponse = await window.supabaseIntegration.makeRequest(
                    'POST',
                    '/rest/v1/user_levels',
                    levelData
                );

                if (!insertResponse.ok) {
                    throw new Error('Error sincronizando nivel con Supabase');
                }
            }

            console.log('✅ Nivel sincronizado con Supabase');
        } catch (error) {
            console.error('❌ Error sincronizando nivel:', error);
        }
    }
}

// Crear instancia global
window.levelSystem = new LevelSystem();

console.log('🎯 Level System cargado');

