/* ================================
   ALGORITHM SYSTEM - RSC MINING
================================ */

/**
 * ⚡ SISTEMA DE ALGORITMOS DE MINERÍA
 * 
 * Sistema completo de algoritmos con diferentes características
 * - Diferentes tasas de minería
 * - Consumo de energía variable
 * - Eficiencia base distinta
 * - Sistema de desbloqueo por nivel
 */

class AlgorithmSystem {
    constructor() {
        this.algorithms = {
            'quantum-core': {
                name: 'Quantum Core',
                description: 'Highest efficiency, moderate power consumption',
                icon: 'fas fa-atom',
                baseEfficiency: 95,
                basePowerConsumption: 2.5,
                baseHashRate: 1000,
                unlockLevel: 1,
                unlockCost: 0,
                miningRateMultiplier: 1.0,
                energyEfficiency: 0.8,
                stability: 90,
                color: '#00d4ff'
            },
            'neural-network': {
                name: 'Neural Network',
                description: 'Adaptive learning, low power consumption',
                icon: 'fas fa-brain',
                baseEfficiency: 88,
                basePowerConsumption: 1.8,
                baseHashRate: 800,
                unlockLevel: 3,
                unlockCost: 50,
                miningRateMultiplier: 0.9,
                energyEfficiency: 1.2,
                stability: 85,
                color: '#ff6b6b'
            },
            'hybrid-fusion': {
                name: 'Hybrid Fusion',
                description: 'Best of both worlds, high power consumption',
                icon: 'fas fa-bolt',
                baseEfficiency: 92,
                basePowerConsumption: 3.2,
                baseHashRate: 1200,
                unlockLevel: 5,
                unlockCost: 200,
                miningRateMultiplier: 1.1,
                energyEfficiency: 0.9,
                stability: 88,
                color: '#4ecdc4'
            },
            'adaptive-matrix': {
                name: 'Adaptive Matrix',
                description: 'Self-optimizing, highest power consumption',
                icon: 'fas fa-cogs',
                baseEfficiency: 98,
                basePowerConsumption: 4.1,
                baseHashRate: 1500,
                unlockLevel: 7,
                unlockCost: 500,
                miningRateMultiplier: 1.3,
                energyEfficiency: 0.7,
                stability: 95,
                color: '#ffe66d'
            }
        };

        this.userAlgorithms = {
            unlocked: ['quantum-core'],
            active: 'quantum-core',
            purchased: ['quantum-core']
        };

        this.initializeAlgorithmSystem();
    }

    initializeAlgorithmSystem() {
        // Cargar datos del usuario desde localStorage
        const stored = localStorage.getItem('rsc_user_algorithms');
        if (stored) {
            const savedData = JSON.parse(stored);
            this.userAlgorithms = { ...this.userAlgorithms, ...savedData };
        }

        // Verificar algoritmos desbloqueados por nivel
        this.checkUnlockedAlgorithms();
    }

    checkUnlockedAlgorithms() {
        const userLevel = window.levelSystem?.userLevel?.level || 1;
        
        Object.keys(this.algorithms).forEach(algorithmId => {
            const algorithm = this.algorithms[algorithmId];
            if (algorithm.unlockLevel <= userLevel && !this.userAlgorithms.unlocked.includes(algorithmId)) {
                this.userAlgorithms.unlocked.push(algorithmId);
            }
        });

        this.saveAlgorithmData();
    }

    getAlgorithmStats(algorithmId) {
        const algorithm = this.algorithms[algorithmId];
        if (!algorithm) return null;

        const userLevel = window.levelSystem?.userLevel?.level || 1;
        const levelMultiplier = 1 + (userLevel - 1) * 0.05; // 5% más por nivel

        // Aplicar bonificaciones de equipos
        const equipmentBonus = window.equipmentSystem?.getTotalEfficiencyBonus() || 0;
        const equipmentHashBonus = window.equipmentSystem?.getTotalHashRateBonus() || 0;

        return {
            ...algorithm,
            currentEfficiency: Math.min(100, algorithm.baseEfficiency + equipmentBonus),
            currentPowerConsumption: algorithm.basePowerConsumption * levelMultiplier,
            currentHashRate: Math.floor(algorithm.baseHashRate * levelMultiplier + equipmentHashBonus),
            isUnlocked: this.userAlgorithms.unlocked.includes(algorithmId),
            isPurchased: this.userAlgorithms.purchased.includes(algorithmId),
            isActive: this.userAlgorithms.active === algorithmId,
            canPurchase: this.canPurchaseAlgorithm(algorithmId)
        };
    }

    getAllAlgorithmStats() {
        const stats = {};
        Object.keys(this.algorithms).forEach(algorithmId => {
            stats[algorithmId] = this.getAlgorithmStats(algorithmId);
        });
        return stats;
    }

    canPurchaseAlgorithm(algorithmId) {
        const algorithm = this.algorithms[algorithmId];
        if (!algorithm) return false;

        // Verificar si ya está desbloqueado y comprado
        if (this.userAlgorithms.purchased.includes(algorithmId)) return false;

        // Verificar nivel requerido
        const userLevel = window.levelSystem?.userLevel?.level || 1;
        if (userLevel < algorithm.unlockLevel) return false;

        // Verificar si está desbloqueado
        if (!this.userAlgorithms.unlocked.includes(algorithmId)) return false;

        // Verificar balance del usuario
        const user = window.supabaseIntegration?.getCurrentUser();
        if (!user) return false;

        return user.balance >= algorithm.unlockCost;
    }

    async purchaseAlgorithm(algorithmId) {
        try {
            const algorithm = this.algorithms[algorithmId];
            if (!algorithm) {
                throw new Error('Algoritmo no encontrado');
            }

            if (!this.canPurchaseAlgorithm(algorithmId)) {
                throw new Error('No se puede comprar el algoritmo');
            }

            const user = window.supabaseIntegration.getCurrentUser();
            if (!user) {
                throw new Error('Usuario no autenticado');
            }

            // Deductir costo del balance
            user.balance -= algorithm.unlockCost;
            window.supabaseIntegration.saveUserToStorage();

            // Agregar algoritmo a los comprados
            this.userAlgorithms.purchased.push(algorithmId);
            this.saveAlgorithmData();

            // Sincronizar con Supabase
            await this.syncAlgorithmsToSupabase();

            console.log(`✅ Algoritmo ${algorithm.name} comprado`);
            return {
                success: true,
                algorithm: algorithm,
                remainingBalance: user.balance
            };

        } catch (error) {
            console.error('❌ Error comprando algoritmo:', error);
            throw error;
        }
    }

    async switchAlgorithm(algorithmId) {
        try {
            const algorithm = this.algorithms[algorithmId];
            if (!algorithm) {
                throw new Error('Algoritmo no encontrado');
            }

            if (!this.userAlgorithms.purchased.includes(algorithmId)) {
                throw new Error('Algoritmo no comprado');
            }

            // Cambiar algoritmo activo
            this.userAlgorithms.active = algorithmId;
            this.saveAlgorithmData();

            // Sincronizar con Supabase
            await this.syncAlgorithmsToSupabase();

            console.log(`✅ Algoritmo cambiado a ${algorithm.name}`);
            return {
                success: true,
                activeAlgorithm: algorithmId
            };

        } catch (error) {
            console.error('❌ Error cambiando algoritmo:', error);
            throw error;
        }
    }

    getActiveAlgorithm() {
        return this.getAlgorithmStats(this.userAlgorithms.active);
    }

    calculateMiningRate() {
        const activeAlgorithm = this.getActiveAlgorithm();
        if (!activeAlgorithm) {
            // Fallback rate: 3-7.5 RSC per day
            const baseFallbackRate = 5.25 / (24 * 60); // 0.00364583 RSC/min promedio
            const variability = 0.57 + (Math.random() * 0.86); // Entre 3-7.5 RSC/day
            return baseFallbackRate * variability;
        }

        // Tasa base de minería: 3-7.5 RSC por día (promedio 5.25)
        const baseRatePerMinute = 5.25 / (24 * 60); // 0.00364583 RSC/min
        
        // Aplicar multiplicador del algoritmo
        const algorithmMultiplier = activeAlgorithm.miningRateMultiplier;
        
        // Aplicar multiplicador de nivel
        const levelMultiplier = window.levelSystem?.getCurrentMultiplier() || 1;
        
        // Aplicar multiplicador de eficiencia
        const efficiencyMultiplier = activeAlgorithm.currentEfficiency / 100;
        
        // Variabilidad para mantener rango 3-7.5 RSC/day
        const variability = 0.57 + (Math.random() * 0.86); // Entre 0.57 y 1.43
        
        const finalRate = baseRatePerMinute * algorithmMultiplier * levelMultiplier * efficiencyMultiplier * variability;
        
        // Asegurar que no exceda 7.5 RSC/day (0.00520833 RSC/min)
        return Math.min(finalRate, 0.00520833);
    }

    calculateHashRate() {
        const activeAlgorithm = this.getActiveAlgorithm();
        if (!activeAlgorithm) return 0;

        // Hash rate base del algoritmo
        let hashRate = activeAlgorithm.currentHashRate;
        
        // Aplicar variabilidad realista (±10%)
        const variability = 0.9 + (Math.random() * 0.2);
        hashRate *= variability;
        
        return Math.floor(hashRate);
    }

    calculateEfficiency() {
        const activeAlgorithm = this.getActiveAlgorithm();
        if (!activeAlgorithm) return 100;

        // Eficiencia base del algoritmo
        let efficiency = activeAlgorithm.currentEfficiency;
        
        // Aplicar variabilidad realista (±5%)
        const variability = 0.95 + (Math.random() * 0.1);
        efficiency *= variability;
        
        return Math.min(100, Math.floor(efficiency));
    }

    calculatePowerConsumption() {
        const activeAlgorithm = this.getActiveAlgorithm();
        if (!activeAlgorithm) return 0;

        // Consumo de energía base del algoritmo
        let powerConsumption = activeAlgorithm.currentPowerConsumption;
        
        // Aplicar variabilidad realista (±5%)
        const variability = 0.95 + (Math.random() * 0.1);
        powerConsumption *= variability;
        
        return Math.floor(powerConsumption * 100) / 100;
    }

    getAlgorithmRecommendation() {
        const userLevel = window.levelSystem?.userLevel?.level || 1;
        const userBalance = window.supabaseIntegration?.getCurrentUser()?.balance || 0;

        // Recomendar algoritmo basado en nivel y balance
        if (userLevel >= 7 && userBalance >= 500) {
            return 'adaptive-matrix';
        } else if (userLevel >= 5 && userBalance >= 200) {
            return 'hybrid-fusion';
        } else if (userLevel >= 3 && userBalance >= 50) {
            return 'neural-network';
        } else {
            return 'quantum-core';
        }
    }

    saveAlgorithmData() {
        localStorage.setItem('rsc_user_algorithms', JSON.stringify(this.userAlgorithms));
    }

    async syncAlgorithmsToSupabase() {
        try {
            if (!window.supabaseIntegration?.user?.isAuthenticated) return;

            const userId = window.supabaseIntegration.user.id;
            const algorithmData = {
                user_id: userId,
                unlocked_algorithms: JSON.stringify(this.userAlgorithms.unlocked),
                purchased_algorithms: JSON.stringify(this.userAlgorithms.purchased),
                active_algorithm: this.userAlgorithms.active,
                last_updated: new Date().toISOString()
            };

            // Intentar actualizar primero
            const updateResponse = await window.supabaseIntegration.makeRequest(
                'PATCH',
                `/rest/v1/user_algorithms?user_id=eq.${userId}`,
                algorithmData
            );

            if (!updateResponse.ok) {
                // Si no existe, crear nuevo registro
                const insertResponse = await window.supabaseIntegration.makeRequest(
                    'POST',
                    '/rest/v1/user_algorithms',
                    algorithmData
                );

                if (!insertResponse.ok) {
                    throw new Error('Error sincronizando algoritmos con Supabase');
                }
            }

            console.log('✅ Algoritmos sincronizados con Supabase');
        } catch (error) {
            console.error('❌ Error sincronizando algoritmos:', error);
        }
    }
}

// Crear instancia global
window.algorithmSystem = new AlgorithmSystem();

console.log('⚡ Algorithm System cargado');

