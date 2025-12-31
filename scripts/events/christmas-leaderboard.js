/* ================================
   CHRISTMAS LEADERBOARD SYSTEM
   Leaderboard en tiempo real para el evento navideño
   ================================ */

/**
 * 🏆 SISTEMA DE LEADERBOARD NAVIDEÑO
 * 
 * Características:
 * - Ranking en tiempo real basado en Christmas Points
 * - Top 100 con airdrop escalonado
 * - Badges especiales para top 10
 * - Actualización automática cada 5 minutos
 */

class ChristmasLeaderboard {
    constructor() {
        this.config = {
            updateInterval: 5 * 60 * 1000, // 5 minutos
            topCount: 100, // Top 100 reciben airdrop
            airdropRewards: {
                top1: 10000,      // Top 1: 10,000 RSC
                top2_3: 5000,     // Top 2-3: 5,000 RSC c/u
                top4_10: 2500,    // Top 4-10: 2,500 RSC c/u
                top11_25: 1000,    // Top 11-25: 1,000 RSC c/u
                top26_50: 500,     // Top 26-50: 500 RSC c/u
                top51_100: 250     // Top 51-100: 250 RSC c/u
            }
        };
        
        this.leaderboard = [];
        this.userRank = null;
        this.userPoints = 0;
        this.lastUpdate = null;
        
        this.supabase = null;
        this.updateTimer = null;
        
        this.init();
    }
    
    async init() {
        console.log('🏆 Inicializando Christmas Leaderboard...');
        
        try {
            await this.waitForSupabase();
            await this.loadLeaderboard();
            this.startUpdateTimer();
            
            console.log('✅ Christmas Leaderboard inicializado');
        } catch (error) {
            console.error('❌ Error inicializando Leaderboard:', error);
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
    
    async loadLeaderboard() {
        try {
            if (!this.supabase?.config) {
                console.warn('⚠️ Supabase no configurado');
                return;
            }
            
            // Obtener top 100 usuarios ordenados por puntos
            const response = await this.makeRequest('GET',
                `/rest/v1/christmas_points?select=user_id,total_points,current_streak&order=total_points.desc&limit=${this.config.topCount}`);
            
            if (response.ok) {
                const pointsData = await response.json();
                
                // Obtener información de usuarios
                const userIds = pointsData.map(p => p.user_id);
                const usersData = {};
                
                if (userIds.length > 0) {
                    try {
                        // Obtener usuarios en lotes (Supabase tiene límite de caracteres en URLs)
                        const userIdsStr = userIds.map(id => `"${id}"`).join(',');
                        const usersResponse = await this.makeRequest('GET',
                            `/rest/v1/users?select=id,username,email&id=in.(${userIdsStr})`);
                        
                        if (usersResponse.ok) {
                            const users = await usersResponse.json();
                            users.forEach(user => {
                                usersData[user.id] = user;
                            });
                        }
                    } catch (error) {
                        console.warn('⚠️ Error obteniendo datos de usuarios:', error);
                    }
                }
                
                // Construir leaderboard
                this.leaderboard = pointsData.map((entry, index) => {
                    const user = usersData[entry.user_id] || {};
                    const rank = index + 1;
                    
                    return {
                        rank: rank,
                        userId: entry.user_id,
                        username: user.username || user.email?.split('@')[0] || 'Usuario',
                        points: parseFloat(entry.total_points) || 0,
                        streak: parseInt(entry.current_streak) || 0,
                        isCurrentUser: entry.user_id === this.supabase?.user?.id,
                        badge: this.getBadgeForRank(rank),
                        airdropReward: this.getAirdropReward(rank)
                    };
                });
                
                // Encontrar posición del usuario actual
                const currentUserId = this.supabase?.user?.id;
                if (currentUserId) {
                    const userEntry = this.leaderboard.find(e => e.userId === currentUserId);
                    if (userEntry) {
                        this.userRank = userEntry.rank;
                        this.userPoints = userEntry.points;
                    } else {
                        // Usuario no está en top 100, obtener su posición
                        await this.loadUserRank();
                    }
                }
                
                this.lastUpdate = new Date();
                
                // Disparar evento
                window.dispatchEvent(new CustomEvent('christmasLeaderboardUpdated', {
                    detail: {
                        leaderboard: this.leaderboard,
                        userRank: this.userRank,
                        userPoints: this.userPoints
                    }
                }));
                
                console.log(`🏆 Leaderboard actualizado: ${this.leaderboard.length} usuarios`);
            } else {
                const errorText = await response.text();
                console.error('❌ Error cargando leaderboard:', errorText);
            }
        } catch (error) {
            console.error('❌ Error cargando leaderboard:', error);
        }
    }
    
    async loadUserRank() {
        if (!this.supabase?.user?.id || !this.supabase?.config) return;
        
        try {
            // Contar cuántos usuarios tienen más puntos
            const userPoints = window.christmasCompetition?.getTotalPoints() || 0;
            
            const response = await this.makeRequest('GET',
                `/rest/v1/christmas_points?total_points=gt.${userPoints}&select=count`);
            
            if (response.ok) {
                const data = await response.json();
                // El rank es count + 1
                this.userRank = (Array.isArray(data) ? data.length : parseInt(data) || 0) + 1;
                this.userPoints = userPoints;
            }
        } catch (error) {
            console.warn('⚠️ Error obteniendo rank del usuario:', error);
        }
    }
    
    getBadgeForRank(rank) {
        switch (rank) {
            case 1:
                return '🥇';
            case 2:
                return '🥈';
            case 3:
                return '🥉';
            case 4:
            case 5:
            case 6:
            case 7:
            case 8:
            case 9:
            case 10:
                return '⭐';
            default:
                return rank;
        }
    }
    
    getAirdropReward(rank) {
        if (rank === 1) {
            return this.config.airdropRewards.top1;
        } else if (rank >= 2 && rank <= 3) {
            return this.config.airdropRewards.top2_3;
        } else if (rank >= 4 && rank <= 10) {
            return this.config.airdropRewards.top4_10;
        } else if (rank >= 11 && rank <= 25) {
            return this.config.airdropRewards.top11_25;
        } else if (rank >= 26 && rank <= 50) {
            return this.config.airdropRewards.top26_50;
        } else if (rank >= 51 && rank <= 100) {
            return this.config.airdropRewards.top51_100;
        } else {
            return 0;
        }
    }
    
    startUpdateTimer() {
        // Actualizar cada 5 minutos
        this.updateTimer = setInterval(() => {
            this.loadLeaderboard();
        }, this.config.updateInterval);
        
        // También actualizar cuando cambien los puntos del usuario
        window.addEventListener('christmasPointsUpdated', (event) => {
            console.log('🏆 Leaderboard: Puntos actualizados, recargando...', event.detail);
            // Esperar más tiempo para asegurar sincronización con BD
            setTimeout(() => {
                this.loadLeaderboard();
            }, 5000);
        });
        
        // Escuchar cuando se reclama un regalo
        window.addEventListener('christmasGiftClaimed', (event) => {
            console.log('🏆 Leaderboard: Regalo reclamado, recargando...', event.detail);
            setTimeout(() => {
                this.loadLeaderboard();
            }, 5000);
        });
        
        // También escuchar cuando se inicializa el sistema de competencia
        window.addEventListener('christmasCompetitionReady', () => {
            console.log('🏆 Leaderboard: Sistema de competencia listo, cargando leaderboard...');
            setTimeout(() => {
                this.loadLeaderboard();
            }, 2000);
        });
        
        // Actualizar periódicamente para asegurar sincronización
        setInterval(() => {
            this.loadLeaderboard();
        }, 30 * 1000); // Cada 30 segundos
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
    
    // Getters públicos
    getLeaderboard() {
        return [...this.leaderboard];
    }
    
    getUserRank() {
        return this.userRank;
    }
    
    getUserPoints() {
        return this.userPoints;
    }
    
    getLastUpdate() {
        return this.lastUpdate;
    }
    
    getAirdropRewardForRank(rank) {
        return this.getAirdropReward(rank);
    }
}

// Crear instancia global
window.christmasLeaderboard = new ChristmasLeaderboard();

console.log('🏆 Christmas Leaderboard System cargado');

