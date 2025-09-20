/* ===== RSC REFERRAL COMPETITION SYSTEM ===== */

class ReferralCompetition {
    constructor() {
        this.config = {
            competitionDuration: 60, // días
            prizeAmount: 550, // RSC
            minReferralsToWin: 5, // mínimo de referidos para ganar
            updateInterval: 300000, // 5 minutos en ms
        };

        this.currentCompetition = {
            id: null,
            startDate: null,
            endDate: null,
            isActive: false,
            participants: [],
            winner: null,
            prizeAwarded: false
        };

        this.leaderboard = [];
        this.userStats = {
            currentRank: null,
            referralsCount: 0,
            daysRemaining: 0
        };

        this.init();
    }

    async init() {
        console.log('🏆 Inicializando Sistema de Competencia de Referidos...');
        
        try {
            await this.loadCurrentCompetition();
            await this.loadLeaderboard();
            this.startUpdateTimer();
            
            console.log('✅ Sistema de Competencia de Referidos inicializado');
        } catch (error) {
            console.error('❌ Error inicializando competencia:', error);
        }
    }

    // ===============================
    // GESTIÓN DE COMPETENCIA
    // ===============================

    async loadCurrentCompetition() {
        try {
            // Intentar obtener competencia activa desde backend
            const response = await this.makeRequest('GET', '/rest/v1/referral_competitions?is_active=eq.true&order=created_at.desc&limit=1');
            
            if (response.ok) {
                const competitions = await response.json();
                
                if (competitions.length > 0) {
                    const competition = competitions[0];
                    this.currentCompetition = {
                        id: competition.id,
                        startDate: new Date(competition.start_date),
                        endDate: new Date(competition.end_date),
                        isActive: competition.is_active,
                        participants: competition.participants || [],
                        winner: competition.winner_id,
                        prizeAwarded: competition.prize_awarded
                    };
                    
                    console.log('📊 Competencia cargada:', this.currentCompetition);
                } else {
                    // No hay competencia activa, crear una nueva
                    await this.createNewCompetition();
                }
            } else {
                // Error o no existe tabla, crear competencia local
                await this.createNewCompetition();
            }
        } catch (error) {
            console.warn('⚠️ Error cargando competencia, creando nueva:', error);
            await this.createNewCompetition();
        }
    }

    async createNewCompetition() {
        console.log('🚀 Creando nueva competencia de referidos...');
        
        const now = new Date();
        const endDate = new Date(now.getTime() + (this.config.competitionDuration * 24 * 60 * 60 * 1000));
        
        this.currentCompetition = {
            id: `comp_${Date.now()}`,
            startDate: now,
            endDate: endDate,
            isActive: true,
            participants: [],
            winner: null,
            prizeAwarded: false
        };

        try {
            // Intentar guardar en backend
            const competitionData = {
                id: this.currentCompetition.id,
                start_date: this.currentCompetition.startDate.toISOString(),
                end_date: this.currentCompetition.endDate.toISOString(),
                is_active: true,
                prize_amount: this.config.prizeAmount,
                participants: [],
                winner_id: null,
                prize_awarded: false,
                created_at: new Date().toISOString()
            };

            const response = await this.makeRequest('POST', '/rest/v1/referral_competitions', competitionData);
            
            if (response.ok) {
                console.log('✅ Competencia creada en backend');
            } else {
                console.warn('⚠️ Error creando competencia en backend, usando local');
            }
        } catch (error) {
            console.warn('⚠️ Error creando competencia en backend:', error);
        }

        // Guardar localmente como respaldo
        localStorage.setItem('rsc_referral_competition', JSON.stringify(this.currentCompetition));
        
        console.log(`🏁 Nueva competencia iniciada hasta: ${endDate.toLocaleDateString()}`);
    }

    async loadLeaderboard() {
        try {
            if (!this.currentCompetition.isActive) {
                this.leaderboard = [];
                return;
            }

            // Obtener estadísticas REALES de referidos de la base de datos
            const response = await this.makeRequest('GET', `/rest/v1/users?select=id,username,email,referral_stats&order=referral_count.desc&limit=10`);
            
            if (response.ok) {
                const users = await response.json();
                
                // Filtrar solo usuarios con referidos reales
                const realUsers = users.filter(user => user.referral_count && user.referral_count > 0);
                
                this.leaderboard = realUsers.map((user, index) => ({
                    rank: index + 1,
                    userId: user.id,
                    username: user.username || user.email?.split('@')[0] || 'Usuario',
                    referralsCount: user.referral_count || 0,
                    lastActive: new Date(user.last_sign_in_at || user.created_at),
                    isCurrentUser: user.id === window.supabaseIntegration?.user?.id
                }));
                
                console.log(`📊 Leaderboard cargado: ${this.leaderboard.length} usuarios reales`);
            } else {
                // Si no hay datos o error, mostrar leaderboard vacío
                console.log('📊 No hay datos de referidos aún - leaderboard vacío');
                this.leaderboard = [];
            }

            // Actualizar estadísticas del usuario actual
            await this.updateUserStats();
            
        } catch (error) {
            console.warn('⚠️ Error cargando leaderboard:', error);
            this.leaderboard = [];
        }
    }

    // FUNCIÓN ELIMINADA - Solo datos reales para producción

    async updateUserStats() {
        if (!window.supabaseIntegration?.user?.isAuthenticated) {
            this.userStats = {
                currentRank: null,
                referralsCount: 0,
                daysRemaining: 0
            };
            return;
        }

        try {
            // Obtener estadísticas reales del usuario actual
            const userId = window.supabaseIntegration.user.id;
            const response = await this.makeRequest('GET', `/rest/v1/users?id=eq.${userId}&select=referral_count`);
            
            let userReferrals = 0;
            if (response.ok) {
                const userData = await response.json();
                if (userData.length > 0) {
                    userReferrals = userData[0].referral_count || 0;
                }
            }

            // Encontrar posición en el leaderboard
            const userEntry = this.leaderboard.find(entry => entry.isCurrentUser);
            let currentRank = null;
            
            if (userReferrals > 0) {
                // Si tiene referidos pero no está en el top 10, calcular su posición aproximada
                if (!userEntry) {
                    const higherUsers = this.leaderboard.filter(entry => entry.referralsCount > userReferrals);
                    currentRank = higherUsers.length + 1;
                } else {
                    currentRank = userEntry.rank;
                }
            }

            // Calcular días restantes
            const now = new Date();
            const timeRemaining = this.currentCompetition.endDate - now;
            const daysRemaining = Math.max(0, Math.ceil(timeRemaining / (24 * 60 * 60 * 1000)));

            this.userStats = {
                currentRank: currentRank,
                referralsCount: userReferrals,
                daysRemaining: daysRemaining
            };

            console.log(`👤 Stats del usuario: Rango ${currentRank || 'N/A'}, ${userReferrals} referidos`);
            
        } catch (error) {
            console.error('❌ Error obteniendo stats del usuario:', error);
            // Fallback con datos básicos
            const now = new Date();
            const timeRemaining = this.currentCompetition.endDate - now;
            const daysRemaining = Math.max(0, Math.ceil(timeRemaining / (24 * 60 * 60 * 1000)));
            
            this.userStats = {
                currentRank: null,
                referralsCount: 0,
                daysRemaining: daysRemaining
            };
        }
    }

    // ===============================
    // GESTIÓN DE PREMIOS
    // ===============================

    async checkCompetitionEnd() {
        if (!this.currentCompetition.isActive) return;

        const now = new Date();
        if (now >= this.currentCompetition.endDate) {
            console.log('🏁 Competencia terminada, determinando ganador...');
            await this.endCompetition();
        }
    }

    async endCompetition() {
        try {
            // Determinar ganador
            if (this.leaderboard.length > 0 && this.leaderboard[0].referralsCount >= this.config.minReferralsToWin) {
                const winner = this.leaderboard[0];
                
                // Marcar competencia como terminada
                this.currentCompetition.isActive = false;
                this.currentCompetition.winner = winner.userId;
                
                // Otorgar premio
                await this.awardPrize(winner);
                
                // Crear nueva competencia
                setTimeout(() => {
                    this.createNewCompetition();
                }, 5000); // Esperar 5 segundos antes de crear nueva competencia
                
                console.log(`🎉 Ganador: ${winner.username} con ${winner.referralsCount} referidos`);
                
                // Mostrar notificación
                if (winner.isCurrentUser) {
                    this.showNotification(`🎉 ¡Felicidades! Has ganado la competencia con ${winner.referralsCount} referidos. Premio: ${this.config.prizeAmount} RSC`, 'success');
                } else {
                    this.showNotification(`🏆 Competencia terminada. Ganador: ${winner.username} con ${winner.referralsCount} referidos`, 'info');
                }
            } else {
                // No hay ganador válido, crear nueva competencia
                this.currentCompetition.isActive = false;
                console.log('❌ No hay ganador válido (mínimo 5 referidos)');
                setTimeout(() => {
                    this.createNewCompetition();
                }, 5000);
            }
            
            // Actualizar backend
            await this.updateCompetitionInBackend();
            
        } catch (error) {
            console.error('❌ Error terminando competencia:', error);
        }
    }

    async awardPrize(winner) {
        try {
            // Otorgar premio al ganador
            if (window.supabaseIntegration && winner.isCurrentUser) {
                window.supabaseIntegration.user.balance += this.config.prizeAmount;
                await window.supabaseIntegration.syncBalanceToBackend();
                
                console.log(`💰 Premio otorgado: ${this.config.prizeAmount} RSC`);
            }
            
            // Registrar transacción de premio
            const transactionData = {
                user_id: winner.userId,
                amount: this.config.prizeAmount,
                type: 'referral_competition_prize',
                description: `Premio competencia de referidos - ${winner.referralsCount} referidos`,
                created_at: new Date().toISOString()
            };
            
            await this.makeRequest('POST', '/rest/v1/transactions', transactionData);
            
            this.currentCompetition.prizeAwarded = true;
            
        } catch (error) {
            console.error('❌ Error otorgando premio:', error);
        }
    }

    // ===============================
    // API Y BACKEND
    // ===============================

    async updateCompetitionInBackend() {
        try {
            const updateData = {
                is_active: this.currentCompetition.isActive,
                winner_id: this.currentCompetition.winner,
                prize_awarded: this.currentCompetition.prizeAwarded,
                participants: this.currentCompetition.participants,
                updated_at: new Date().toISOString()
            };

            await this.makeRequest('PATCH', `/rest/v1/referral_competitions?id=eq.${this.currentCompetition.id}`, updateData);
            
        } catch (error) {
            console.error('❌ Error actualizando competencia en backend:', error);
        }
    }

    async makeRequest(method, endpoint, data = null) {
        if (!window.supabaseIntegration?.config) {
            throw new Error('Supabase no configurado');
        }

        const url = `${window.supabaseIntegration.config.supabaseUrl}${endpoint}`;
        const options = {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'apikey': window.supabaseIntegration.config.supabaseAnonKey,
                'Authorization': `Bearer ${window.supabaseIntegration.config.supabaseAnonKey}`
            }
        };

        if (data && (method === 'POST' || method === 'PATCH')) {
            options.body = JSON.stringify(data);
        }

        return fetch(url, options);
    }

    // ===============================
    // TIMERS Y ACTUALIZACIONES
    // ===============================

    startUpdateTimer() {
        // Actualizar cada 5 minutos
        setInterval(async () => {
            await this.loadLeaderboard();
            await this.checkCompetitionEnd();
            
            // Disparar evento para actualizar UI
            window.dispatchEvent(new CustomEvent('referralCompetitionUpdate', {
                detail: {
                    leaderboard: this.leaderboard,
                    userStats: this.userStats,
                    competition: this.currentCompetition
                }
            }));
        }, this.config.updateInterval);

        console.log('⏰ Timer de competencia iniciado (5 min)');
    }

    // ===============================
    // GETTERS PÚBLICOS
    // ===============================

    getLeaderboard() {
        return this.leaderboard;
    }

    getUserStats() {
        return this.userStats;
    }

    getCompetitionInfo() {
        return {
            isActive: this.currentCompetition.isActive,
            startDate: this.currentCompetition.startDate,
            endDate: this.currentCompetition.endDate,
            daysRemaining: this.userStats.daysRemaining,
            prizeAmount: this.config.prizeAmount,
            minReferrals: this.config.minReferralsToWin
        };
    }

    isUserParticipating() {
        return this.userStats.referralsCount > 0;
    }

    // ===============================
    // UI HELPERS
    // ===============================

    showNotification(message, type = 'info') {
        if (window.showNotification) {
            window.showNotification(message, type);
        } else {
            console.log(`📢 ${type.toUpperCase()}: ${message}`);
        }
    }

    formatTimeRemaining() {
        const days = this.userStats.daysRemaining;
        if (days === 0) return 'Último día';
        if (days === 1) return '1 día restante';
        return `${days} días restantes`;
    }

    getRankSuffix(rank) {
        if (rank === 1) return 'st';
        if (rank === 2) return 'nd';
        if (rank === 3) return 'rd';
        return 'th';
    }
}

// Crear instancia global
window.referralCompetition = new ReferralCompetition();

console.log('🏆 Referral Competition System cargado');
