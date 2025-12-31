/* ================================
   CHRISTMAS COMMUNITY MILESTONES
   Milestones comunitarios globales
   ================================ */

/**
 * 🌍 SISTEMA DE MILESTONES COMUNITARIOS
 * 
 * Características:
 * - Hitos globales que desbloquean recompensas para TODOS
 * - Tracking en tiempo real
 * - Distribución automática de recompensas
 */

class ChristmasCommunityMilestones {
    constructor() {
        this.config = {
            milestones: {
                active_users_1000: {
                    milestone: 'active_users_1000',
                    name: '1,000 Usuarios Activos',
                    description: 'Alcanzar 1,000 usuarios activos en el evento',
                    target: 1000,
                    reward: 50 // RSC para todos
                },
                total_referrals_5000: {
                    milestone: 'total_referrals_5000',
                    name: '5,000 Referidos Totales',
                    description: 'La comunidad alcanza 5,000 referidos totales',
                    target: 5000,
                    reward: 100
                },
                total_mined_100000: {
                    milestone: 'total_mined_100000',
                    name: '100,000 RSC Minados',
                    description: 'La comunidad mina 100,000 RSC en total',
                    target: 100000,
                    reward: 200
                },
                active_users_10000: {
                    milestone: 'active_users_10000',
                    name: '10,000 Usuarios Activos',
                    description: 'Alcanzar 10,000 usuarios activos en el evento',
                    target: 10000,
                    reward: 500
                }
            }
        };
        
        this.milestoneStats = {};
        this.supabase = null;
        this.updateTimer = null;
        
        this.init();
    }
    
    async init() {
        console.log('🌍 Inicializando Christmas Community Milestones...');
        
        try {
            await this.waitForSupabase();
            await this.loadMilestoneStats();
            this.startUpdateTimer();
            
            console.log('✅ Christmas Community Milestones inicializado');
        } catch (error) {
            console.error('❌ Error inicializando Community Milestones:', error);
        }
    }
    
    async waitForSupabase() {
        return new Promise((resolve) => {
            if (window.supabaseIntegration) {
                this.supabase = window.supabaseIntegration;
                resolve();
            } else {
                const checkInterval = setInterval(() => {
                    if (window.supabaseIntegration) {
                        clearInterval(checkInterval);
                        this.supabase = window.supabaseIntegration;
                        resolve();
                    }
                }, 100);
            }
        });
    }
    
    async loadMilestoneStats() {
        if (!this.supabase?.config) return;
        
        try {
            // Cargar desde base de datos
            const response = await this.makeRequest('GET',
                '/rest/v1/community_milestones?select=*');
            
            if (response.ok) {
                const data = await response.json();
                
                // Inicializar stats
                Object.keys(this.config.milestones).forEach(key => {
                    const milestoneConfig = this.config.milestones[key];
                    const dbEntry = data.find(d => d.milestone === milestoneConfig.milestone);
                    
                    this.milestoneStats[milestoneConfig.milestone] = {
                        target: milestoneConfig.target,
                        current: dbEntry ? parseFloat(dbEntry.current) || 0 : 0,
                        reward: milestoneConfig.reward,
                        completed: dbEntry ? (dbEntry.completed || false) : false,
                        distributed: dbEntry ? (dbEntry.reward_distributed || false) : false
                    };
                });
            }
        } catch (error) {
            console.warn('⚠️ Error cargando milestones:', error);
            
            // Inicializar con valores por defecto
            Object.keys(this.config.milestones).forEach(key => {
                const milestoneConfig = this.config.milestones[key];
                this.milestoneStats[milestoneConfig.milestone] = {
                    target: milestoneConfig.target,
                    current: 0,
                    reward: milestoneConfig.reward,
                    completed: false,
                    distributed: false
                };
            });
        }
    }
    
    startUpdateTimer() {
        // Actualizar estadísticas cada 10 minutos
        this.updateTimer = setInterval(() => {
            this.updateCurrentStats();
        }, 10 * 60 * 1000);
        
        // Actualizar inmediatamente
        this.updateCurrentStats();
    }
    
    async updateCurrentStats() {
        await this.updateActiveUsers();
        await this.updateTotalReferrals();
        await this.updateTotalMined();
        
        // Verificar si algún milestone se completó
        Object.keys(this.milestoneStats).forEach(milestoneId => {
            this.checkMilestoneCompletion(milestoneId);
        });
    }
    
    async updateActiveUsers() {
        try {
            // Contar usuarios con puntos > 0
            const response = await this.makeRequest('GET',
                '/rest/v1/christmas_points?total_points=gt.0&select=count');
            
            if (response.ok) {
                const data = await response.json();
                const count = Array.isArray(data) ? data.length : parseInt(data) || 0;
                
                await this.updateMilestoneProgress('active_users_1000', count);
                await this.updateMilestoneProgress('active_users_10000', count);
            }
        } catch (error) {
            console.warn('⚠️ Error actualizando usuarios activos:', error);
        }
    }
    
    async updateTotalReferrals() {
        try {
            // Contar total de referidos
            const response = await this.makeRequest('GET',
                '/rest/v1/referrals?select=count');
            
            if (response.ok) {
                const data = await response.json();
                const count = Array.isArray(data) ? data.length : parseInt(data) || 0;
                
                await this.updateMilestoneProgress('total_referrals_5000', count);
            }
        } catch (error) {
            console.warn('⚠️ Error actualizando referidos:', error);
        }
    }
    
    async updateTotalMined() {
        try {
            // Sumar total de RSC minados (suma de balances de usuarios)
            const response = await this.makeRequest('GET',
                '/rest/v1/users?select=balance');
            
            if (response.ok) {
                const users = await response.json();
                const totalMined = users.reduce((sum, user) => 
                    sum + (parseFloat(user.balance) || 0), 0);
                
                await this.updateMilestoneProgress('total_mined_100000', Math.floor(totalMined));
            }
        } catch (error) {
            console.warn('⚠️ Error actualizando minería:', error);
        }
    }
    
    async updateMilestoneProgress(milestoneId, currentValue) {
        try {
            if (this.milestoneStats[milestoneId]) {
                this.milestoneStats[milestoneId].current = currentValue;
                
                // Actualizar en base de datos
                await this.makeRequest('PATCH',
                    `/rest/v1/community_milestones?milestone=eq.${milestoneId}`,
                    {
                        current: currentValue,
                        updated_at: new Date().toISOString()
                    });
                
                // Verificar si se completó
                this.checkMilestoneCompletion(milestoneId);
            }
        } catch (error) {
            console.warn('⚠️ Error actualizando progreso de milestone:', error);
        }
    }
    
    async checkMilestoneCompletion(milestoneId) {
        const stats = this.milestoneStats[milestoneId];
        if (!stats) return;
        
        if (!stats.completed && stats.current >= stats.target) {
            await this.completeMilestone(milestoneId);
        }
    }
    
    async completeMilestone(milestoneId) {
        const stats = this.milestoneStats[milestoneId];
        if (!stats || stats.completed) return;
        
        try {
            // Marcar como completado en base de datos
            await this.makeRequest('PATCH',
                `/rest/v1/community_milestones?milestone=eq.${milestoneId}`,
                {
                    completed_at: new Date().toISOString(),
                    reward_distributed: false // Se distribuirá después
                });
            
            stats.completed = true;
            
            // Distribuir recompensa a todos los usuarios
            await this.distributeMilestoneReward(milestoneId, stats.reward);
            
            // Marcar como distribuido
            await this.makeRequest('PATCH',
                `/rest/v1/community_milestones?milestone=eq.${milestoneId}`,
                {
                    reward_distributed: true,
                    distributed_at: new Date().toISOString()
                });
            
            stats.distributed = true;
            
            // Disparar evento
            window.dispatchEvent(new CustomEvent('christmasMilestoneCompleted', {
                detail: {
                    milestoneId,
                    reward: stats.reward
                }
            }));
            
            // Mostrar notificación global
            this.showGlobalNotification(
                `🎉 ¡Milestone comunitario completado! Todos recibieron ${stats.reward} RSC en Christmas Points`,
                'success'
            );
            
            console.log(`🎉 Milestone ${milestoneId} completado! Recompensa: ${stats.reward} RSC para todos`);
        } catch (error) {
            console.error('❌ Error completando milestone:', error);
        }
    }
    
    async distributeMilestoneReward(milestoneId, reward) {
        try {
            // Obtener todos los usuarios activos (con puntos > 0)
            const response = await this.makeRequest('GET',
                '/rest/v1/christmas_points?total_points=gt.0&select=user_id');
            
            if (response.ok) {
                const users = await response.json();
                
                // Convertir recompensa RSC a Christmas Points (1 RSC = 10 puntos)
                const pointsToAdd = reward * 10;
                
                // Distribuir puntos a cada usuario (NO agregar al balance)
                for (const user of users) {
                    try {
                        // Actualizar puntos en la tabla christmas_points
                        const currentPointsResponse = await this.makeRequest('GET',
                            `/rest/v1/christmas_points?user_id=eq.${user.user_id}&select=total_points`);
                        
                        if (currentPointsResponse.ok) {
                            const currentData = await currentPointsResponse.json();
                            const currentPoints = currentData.length > 0 ? 
                                parseFloat(currentData[0].total_points) || 0 : 0;
                            
                            await this.makeRequest('PATCH',
                                `/rest/v1/christmas_points?user_id=eq.${user.user_id}`,
                                {
                                    total_points: currentPoints + pointsToAdd,
                                    updated_at: new Date().toISOString()
                                });
                            
                            // Si es el usuario actual, actualizar también en el sistema local
                            if (user.user_id === this.supabase?.user?.id && window.christmasCompetition) {
                                window.christmasCompetition.addPoints(pointsToAdd, 'community_milestone', {
                                    milestoneId,
                                    rscReward: reward
                                });
                            }
                        }
                        
                        console.log(`✅ Puntos distribuidos a usuario ${user.user_id}: +${pointsToAdd} puntos (${reward} RSC para rescate)`);
                    } catch (error) {
                        console.warn(`⚠️ Error distribuyendo recompensa a usuario ${user.user_id}:`, error);
                    }
                }
                
                console.log(`✅ Recompensa de milestone distribuida: ${pointsToAdd} puntos (${reward} RSC) a ${users.length} usuarios`);
            }
        } catch (error) {
            console.error('❌ Error distribuyendo recompensa de milestone:', error);
        }
    }
    
    async makeRequest(method, endpoint, body = null) {
        if (!this.supabase?.config) {
            throw new Error('Supabase no configurado');
        }
        
        const url = `${this.supabase.config.url}${endpoint}`;
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
                'apikey': this.supabase.config.anonKey,
                'Authorization': `Bearer ${this.supabase.config.anonKey}`
            }
        };
        
        if (body && (method === 'POST' || method === 'PATCH')) {
            options.body = JSON.stringify(body);
        }
        
        return fetch(url, options);
    }
    
    showGlobalNotification(message, type = 'info') {
        // Disparar evento para notificación global
        window.dispatchEvent(new CustomEvent('christmasGlobalNotification', {
            detail: { message, type }
        }));
        
        console.log(`📢 ${message}`);
    }
    
    // Getters públicos
    getMilestoneStats() {
        return { ...this.milestoneStats };
    }
}

// Crear instancia global
window.christmasCommunityMilestones = new ChristmasCommunityMilestones();

console.log('🌍 Christmas Community Milestones System cargado');

