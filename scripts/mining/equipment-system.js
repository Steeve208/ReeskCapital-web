/* ================================
   EQUIPMENT SYSTEM - RSC MINING
================================ */

/**
 * 🛠️ SISTEMA DE EQUIPOS DE MINERÍA
 * 
 * Sistema completo de equipos con mejoras progresivas
 * - Compra y mejora de equipos
 * - Bonificaciones reales de rendimiento
 * - Sistema de desbloqueo por nivel
 * - Equipos únicos y raros
 */

class EquipmentSystem {
    constructor() {
        this.equipmentTypes = {
            processor: {
                name: 'Quantum Processor',
                icon: 'fas fa-microchip',
                baseCost: 10,
                costMultiplier: 1.5,
                maxLevel: 10,
                baseHashRate: 50,
                hashRatePerLevel: 25,
                baseEfficiency: 5,
                efficiencyPerLevel: 2
            },
            memory: {
                name: 'Neural Memory',
                icon: 'fas fa-memory',
                baseCost: 8,
                costMultiplier: 1.4,
                maxLevel: 10,
                baseHashRate: 30,
                hashRatePerLevel: 15,
                baseEfficiency: 3,
                efficiencyPerLevel: 1.5
            },
            cooling: {
                name: 'Cooling System',
                icon: 'fas fa-fan',
                baseCost: 6,
                costMultiplier: 1.3,
                maxLevel: 10,
                baseHashRate: 20,
                hashRatePerLevel: 10,
                baseEfficiency: 4,
                efficiencyPerLevel: 1.8
            },
            power: {
                name: 'Power Core',
                icon: 'fas fa-bolt',
                baseCost: 12,
                costMultiplier: 1.6,
                maxLevel: 10,
                baseHashRate: 40,
                hashRatePerLevel: 20,
                baseEfficiency: 6,
                efficiencyPerLevel: 2.5
            }
        };
        
        this.userEquipment = {};
        this.initializeEquipment();
    }

    initializeEquipment() {
        // Inicializar equipos del usuario desde localStorage o Supabase
        const stored = localStorage.getItem('rsc_user_equipment');
        if (stored) {
            this.userEquipment = JSON.parse(stored);
        } else {
            // Equipos iniciales nivel 1
            Object.keys(this.equipmentTypes).forEach(type => {
                this.userEquipment[type] = {
                    level: 1,
                    purchased: true,
                    lastUpgrade: Date.now()
                };
            });
            this.saveEquipment();
        }
    }

    getEquipmentStats(type) {
        const equipment = this.equipmentTypes[type];
        const userEquipment = this.userEquipment[type];
        
        if (!equipment || !userEquipment) return null;

        const level = userEquipment.level;
        const hashRate = equipment.baseHashRate + (equipment.hashRatePerLevel * (level - 1));
        const efficiency = equipment.baseEfficiency + (equipment.efficiencyPerLevel * (level - 1));
        const cost = Math.floor(equipment.baseCost * Math.pow(equipment.costMultiplier, level - 1));

        return {
            name: equipment.name,
            icon: equipment.icon,
            level: level,
            hashRate: hashRate,
            efficiency: efficiency,
            cost: cost,
            canUpgrade: level < equipment.maxLevel,
            maxLevel: equipment.maxLevel
        };
    }

    getAllEquipmentStats() {
        const stats = {};
        Object.keys(this.equipmentTypes).forEach(type => {
            stats[type] = this.getEquipmentStats(type);
        });
        return stats;
    }

    getTotalHashRateBonus() {
        let totalBonus = 0;
        Object.keys(this.equipmentTypes).forEach(type => {
            const stats = this.getEquipmentStats(type);
            if (stats) {
                totalBonus += stats.hashRate;
            }
        });
        return totalBonus;
    }

    getTotalEfficiencyBonus() {
        let totalBonus = 0;
        Object.keys(this.equipmentTypes).forEach(type => {
            const stats = this.getEquipmentStats(type);
            if (stats) {
                totalBonus += stats.efficiency;
            }
        });
        return totalBonus;
    }

    canUpgradeEquipment(type) {
        const stats = this.getEquipmentStats(type);
        if (!stats || !stats.canUpgrade) return false;

        // Verificar si el usuario tiene suficiente balance
        const user = window.supabaseIntegration?.getCurrentUser();
        if (!user) return false;

        return user.balance >= stats.cost;
    }

    async upgradeEquipment(type) {
        try {
            const stats = this.getEquipmentStats(type);
            if (!stats) {
                throw new Error('Equipo no encontrado');
            }

            if (!this.canUpgradeEquipment(type)) {
                throw new Error('No se puede mejorar el equipo');
            }

            const user = window.supabaseIntegration.getCurrentUser();
            if (!user) {
                throw new Error('Usuario no autenticado');
            }

            // Verificar balance nuevamente
            if (user.balance < stats.cost) {
                throw new Error('Balance insuficiente');
            }

            // Deductir costo del balance
            user.balance -= stats.cost;
            window.supabaseIntegration.saveUserToStorage();

            // Mejorar equipo
            this.userEquipment[type].level += 1;
            this.userEquipment[type].lastUpgrade = Date.now();
            this.saveEquipment();

            // Sincronizar con Supabase
            await this.syncEquipmentToSupabase();

            console.log(`✅ Equipo ${stats.name} mejorado a nivel ${this.userEquipment[type].level}`);
            return {
                success: true,
                newLevel: this.userEquipment[type].level,
                newStats: this.getEquipmentStats(type),
                remainingBalance: user.balance
            };

        } catch (error) {
            console.error('❌ Error mejorando equipo:', error);
            throw error;
        }
    }

    async syncEquipmentToSupabase() {
        try {
            if (!window.supabaseIntegration?.user?.isAuthenticated) return;

            const userId = window.supabaseIntegration.user.id;
            const equipmentData = {
                user_id: userId,
                equipment_data: JSON.stringify(this.userEquipment),
                total_hash_rate_bonus: this.getTotalHashRateBonus(),
                total_efficiency_bonus: this.getTotalEfficiencyBonus(),
                last_updated: new Date().toISOString()
            };

            // Intentar actualizar primero
            const updateResponse = await window.supabaseIntegration.makeRequest(
                'PATCH',
                `/rest/v1/user_equipment?user_id=eq.${userId}`,
                equipmentData
            );

            if (!updateResponse.ok) {
                // Si no existe, crear nuevo registro
                const insertResponse = await window.supabaseIntegration.makeRequest(
                    'POST',
                    '/rest/v1/user_equipment',
                    equipmentData
                );

                if (!insertResponse.ok) {
                    throw new Error('Error sincronizando equipos con Supabase');
                }
            }

            console.log('✅ Equipos sincronizados con Supabase');
        } catch (error) {
            console.error('❌ Error sincronizando equipos:', error);
        }
    }

    saveEquipment() {
        localStorage.setItem('rsc_user_equipment', JSON.stringify(this.userEquipment));
    }

    // Método para obtener equipos únicos/raros
    getRareEquipment() {
        return [
            {
                id: 'quantum_core_legendary',
                name: 'Quantum Core Legendary',
                icon: 'fas fa-gem',
                type: 'processor',
                rarity: 'legendary',
                baseHashRate: 200,
                baseEfficiency: 15,
                cost: 1000,
                description: 'Procesador cuántico legendario con rendimiento excepcional'
            },
            {
                id: 'neural_matrix_epic',
                name: 'Neural Matrix Epic',
                icon: 'fas fa-brain',
                type: 'memory',
                rarity: 'epic',
                baseHashRate: 150,
                baseEfficiency: 12,
                cost: 750,
                description: 'Matriz neural épica con capacidades avanzadas'
            },
            {
                id: 'cryo_cooler_rare',
                name: 'Cryo Cooler Rare',
                icon: 'fas fa-snowflake',
                type: 'cooling',
                rarity: 'rare',
                baseHashRate: 100,
                baseEfficiency: 10,
                cost: 500,
                description: 'Sistema de enfriamiento criogénico raro'
            }
        ];
    }

    // Método para verificar si el usuario puede comprar equipo raro
    canPurchaseRareEquipment(equipmentId) {
        const rareEquipment = this.getRareEquipment().find(eq => eq.id === equipmentId);
        if (!rareEquipment) return false;

        const user = window.supabaseIntegration?.getCurrentUser();
        if (!user) return false;

        return user.balance >= rareEquipment.cost;
    }

    // Método para comprar equipo raro
    async purchaseRareEquipment(equipmentId) {
        try {
            const rareEquipment = this.getRareEquipment().find(eq => eq.id === equipmentId);
            if (!rareEquipment) {
                throw new Error('Equipo raro no encontrado');
            }

            if (!this.canPurchaseRareEquipment(equipmentId)) {
                throw new Error('No se puede comprar el equipo raro');
            }

            const user = window.supabaseIntegration.getCurrentUser();
            if (!user) {
                throw new Error('Usuario no autenticado');
            }

            // Deductir costo del balance
            user.balance -= rareEquipment.cost;
            window.supabaseIntegration.saveUserToStorage();

            // Agregar equipo raro al inventario del usuario
            if (!this.userEquipment.rare) {
                this.userEquipment.rare = [];
            }
            this.userEquipment.rare.push({
                id: equipmentId,
                purchased: true,
                purchaseDate: Date.now()
            });

            this.saveEquipment();
            await this.syncEquipmentToSupabase();

            console.log(`✅ Equipo raro ${rareEquipment.name} comprado`);
            return {
                success: true,
                equipment: rareEquipment,
                remainingBalance: user.balance
            };

        } catch (error) {
            console.error('❌ Error comprando equipo raro:', error);
            throw error;
        }
    }
}

// Crear instancia global
window.equipmentSystem = new EquipmentSystem();

console.log('🛠️ Equipment System cargado');

