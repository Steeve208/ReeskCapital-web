/* ================================
   CHRISTMAS CHALLENGES SYSTEM
   Sistema de desafíos diarios y semanales
   ================================ */

/**
 * 🎯 SISTEMA DE DESAFÍOS NAVIDEÑOS
 * 
 * Características:
 * - Desafíos diarios que renuevan cada 24h
 * - Desafíos semanales que renuevan cada 7 días
 * - Tracking de progreso en tiempo real
 * - Recompensas automáticas al completar
 */

class ChristmasChallenges {
    constructor() {
        this.config = {
            daily: {
                mine10RSC: {
                    id: 'mine_10_rsc',
                    name: 'Minar 10 RSC',
                    description: 'Mina 10 RSC para completar este desafío',
                    requirement: 10,
                    reward: 100 // Christmas Points
                },
                invite1Friend: {
                    id: 'invite_1_friend',
                    name: 'Invitar 1 Amigo',
                    description: 'Invita a 1 amigo para completar este desafío',
                    requirement: 1,
                    reward: 200 // Christmas Points
                },
                completeMiningSession: {
                    id: 'complete_mining_session',
                    name: 'Completar Sesión de Minería',
                    description: 'Completa una sesión de minería de 24 horas',
                    requirement: 1,
                    reward: 50 // Christmas Points
                }
            },
            weekly: {
                mine100RSC: {
                    id: 'mine_100_rsc',
                    name: 'Minar 100 RSC',
                    description: 'Mina 100 RSC esta semana',
                    requirement: 100,
                    reward: 1000, // Christmas Points
                    rscReward: 100 // RSC adicional
                },
                invite5Friends: {
                    id: 'invite_5_friends',
                    name: 'Invitar 5 Amigos',
                    description: 'Invita a 5 amigos esta semana',
                    requirement: 5,
                    reward: 2000, // Christmas Points
                    rscReward: 500 // RSC adicional
                },
                streak7Days: {
                    id: 'streak_7_days',
                    name: 'Streak de 7 Días',
                    description: 'Inicia sesión 7 días consecutivos',
                    requirement: 7,
                    reward: 1500, // Christmas Points
                    rscReward: 200 // RSC adicional
                }
            }
        };
        
        this.userChallenges = {
            daily: {},
            weekly: {}
        };
        
        this.supabase = null;
        this.competition = null;
        
        this.init();
    }
    
    async init() {
        console.log('🎯 Inicializando Christmas Challenges...');
        
        try {
            await this.waitForSupabase();
            await this.waitForCompetition();
            await this.loadUserChallenges();
            this.setupEventListeners();
            
            console.log('✅ Christmas Challenges inicializado');
        } catch (error) {
            console.error('❌ Error inicializando Challenges:', error);
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
    
    async waitForCompetition() {
        return new Promise((resolve) => {
            if (window.christmasCompetition) {
                this.competition = window.christmasCompetition;
                resolve();
            } else {
                const checkInterval = setInterval(() => {
                    if (window.christmasCompetition) {
                        clearInterval(checkInterval);
                        this.competition = window.christmasCompetition;
                        resolve();
                    }
                }, 100);
            }
        });
    }
    
    async loadUserChallenges() {
        if (!this.supabase?.user?.id) return;
        
        try {
            // Cargar desde localStorage
            const saved = localStorage.getItem(`christmas_challenges_${this.supabase.user.id}`);
            if (saved) {
                const parsed = JSON.parse(saved);
                this.userChallenges = { ...this.userChallenges, ...parsed };
            }
            
            // Inicializar desafíos que no existen
            Object.keys(this.config.daily).forEach(key => {
                const challengeConfig = this.config.daily[key];
                if (!this.userChallenges.daily[challengeConfig.id]) {
                    this.userChallenges.daily[challengeConfig.id] = {
                        progress: 0,
                        completed: false,
                        claimed: false,
                        lastReset: null
                    };
                }
            });
            
            Object.keys(this.config.weekly).forEach(key => {
                const challengeConfig = this.config.weekly[key];
                if (!this.userChallenges.weekly[challengeConfig.id]) {
                    this.userChallenges.weekly[challengeConfig.id] = {
                        progress: 0,
                        completed: false,
                        claimed: false,
                        lastReset: null
                    };
                }
            });
            
            // Verificar y resetear desafíos diarios si es necesario
            this.checkDailyReset();
            
            // Verificar y resetear desafíos semanales si es necesario
            this.checkWeeklyReset();
            
            this.saveState();
        } catch (error) {
            console.error('❌ Error cargando desafíos:', error);
        }
    }
    
    checkDailyReset() {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        Object.keys(this.config.daily).forEach(key => {
            const challengeConfig = this.config.daily[key];
            const challenge = this.userChallenges.daily[challengeConfig.id];
            
            if (!challenge) return;
            
            const lastReset = challenge.lastReset ? 
                new Date(new Date(challenge.lastReset).setHours(0, 0, 0, 0)) : null;
            
            // Si no hay reset previo o es un nuevo día, resetear
            if (!lastReset || lastReset.getTime() !== today.getTime()) {
                challenge.progress = 0;
                challenge.completed = false;
                challenge.claimed = false;
                challenge.lastReset = today;
            }
        });
    }
    
    checkWeeklyReset() {
        const now = new Date();
        const weekStart = this.getWeekStart(now);
        
        Object.keys(this.config.weekly).forEach(key => {
            const challengeConfig = this.config.weekly[key];
            const challenge = this.userChallenges.weekly[challengeConfig.id];
            
            if (!challenge) return;
            
            const lastReset = challenge.lastReset ? 
                new Date(new Date(challenge.lastReset).setHours(0, 0, 0, 0)) : null;
            
            // Si no hay reset previo o es una nueva semana, resetear
            if (!lastReset || lastReset.getTime() !== weekStart.getTime()) {
                challenge.progress = 0;
                challenge.completed = false;
                challenge.claimed = false;
                challenge.lastReset = weekStart;
            }
        });
    }
    
    getWeekStart(date) {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day; // Diferencia hasta el lunes
        return new Date(d.setDate(diff));
    }
    
    setupEventListeners() {
        // Escuchar eventos de minería
        const handleBalanceUpdate = (event) => {
            if (event.detail && event.detail.source === 'mining' && event.detail.change > 0) {
                this.updateMiningChallenges(event.detail.change);
            }
        };
        
        // Agregar listener inmediatamente
        window.addEventListener('balanceUpdated', handleBalanceUpdate);
        
        // También verificar balance actual si hay minería activa
        setTimeout(() => {
            this.checkCurrentMiningProgress();
        }, 2000);
        
        // Escuchar eventos de referidos
        window.addEventListener('rsc:referrer-commission-received', () => {
            this.updateReferralChallenges();
        });
        
        // Escuchar eventos de streak
        window.addEventListener('christmasPointsUpdated', (event) => {
            if (event.detail && event.detail.source === 'dailyLogin') {
                this.updateStreakChallenge();
            }
        });
        
        // Escuchar eventos de sesión de minería completada
        window.addEventListener('miningSessionCompleted', () => {
            console.log('🎯 Desafío: Sesión de minería completada detectada');
            this.completeMiningSessionChallenge();
        });
        
        // También escuchar cuando se inicia una sesión
        window.addEventListener('miningSessionStarted', () => {
            console.log('🎯 Desafío: Sesión de minería iniciada');
        });
        
        // Verificar si hay una sesión activa al inicializar
        setTimeout(() => {
            this.checkActiveMiningSession();
        }, 3000);
    }
    
    async checkCurrentMiningProgress() {
        if (!this.supabase?.miningSession?.isActive) return;
        
        try {
            // Obtener tokens minados hasta ahora
            const tokensMined = parseFloat(this.supabase.miningSession.tokensMined) || 0;
            
            if (tokensMined > 0) {
                // Actualizar desafíos con los tokens ya minados
                this.updateMiningChallenges(tokensMined);
                console.log(`📊 Desafíos actualizados con minería existente: ${tokensMined} RSC`);
            }
        } catch (error) {
            console.warn('⚠️ Error verificando progreso de minería:', error);
        }
    }
    
    updateMiningChallenges(rscMined) {
        // Desafío diario: Minar 10 RSC
        const dailyChallenge = this.userChallenges.daily['mine_10_rsc'];
        if (dailyChallenge && !dailyChallenge.completed) {
            dailyChallenge.progress = Math.min(
                (dailyChallenge.progress || 0) + rscMined,
                this.config.daily.mine10RSC.requirement
            );
            
            if (dailyChallenge.progress >= this.config.daily.mine10RSC.requirement) {
                dailyChallenge.completed = true;
                this.completeChallenge('daily', 'mine_10_rsc');
            }
        }
        
        // Desafío semanal: Minar 100 RSC
        const weeklyChallenge = this.userChallenges.weekly['mine_100_rsc'];
        if (weeklyChallenge && !weeklyChallenge.completed) {
            weeklyChallenge.progress = Math.min(
                (weeklyChallenge.progress || 0) + rscMined,
                this.config.weekly.mine100RSC.requirement
            );
            
            if (weeklyChallenge.progress >= this.config.weekly.mine100RSC.requirement) {
                weeklyChallenge.completed = true;
                this.completeChallenge('weekly', 'mine_100_rsc');
            }
        }
        
        this.saveState();
        this.syncToDatabase();
    }
    
    updateReferralChallenges() {
        // Desafío diario: Invitar 1 amigo
        const dailyChallenge = this.userChallenges.daily['invite_1_friend'];
        if (dailyChallenge && !dailyChallenge.completed) {
            dailyChallenge.progress = Math.min(
                (dailyChallenge.progress || 0) + 1,
                this.config.daily.invite1Friend.requirement
            );
            
            if (dailyChallenge.progress >= this.config.daily.invite1Friend.requirement) {
                dailyChallenge.completed = true;
                this.completeChallenge('daily', 'invite_1_friend');
            }
        }
        
        // Desafío semanal: Invitar 5 amigos
        const weeklyChallenge = this.userChallenges.weekly['invite_5_friends'];
        if (weeklyChallenge && !weeklyChallenge.completed) {
            weeklyChallenge.progress = Math.min(
                (weeklyChallenge.progress || 0) + 1,
                this.config.weekly.invite5Friends.requirement
            );
            
            if (weeklyChallenge.progress >= this.config.weekly.invite5Friends.requirement) {
                weeklyChallenge.completed = true;
                this.completeChallenge('weekly', 'invite_5_friends');
            }
        }
        
        this.saveState();
        this.syncToDatabase();
    }
    
    updateStreakChallenge() {
        const weeklyChallenge = this.userChallenges.weekly['streak_7_days'];
        if (weeklyChallenge && !weeklyChallenge.completed && this.competition) {
            const currentStreak = this.competition.getCurrentStreak();
            weeklyChallenge.progress = Math.min(currentStreak, 7);
            
            if (weeklyChallenge.progress >= 7) {
                weeklyChallenge.completed = true;
                this.completeChallenge('weekly', 'streak_7_days');
            }
        }
        
        this.saveState();
        this.syncToDatabase();
    }
    
    completeMiningSessionChallenge() {
        const dailyChallenge = this.userChallenges.daily['complete_mining_session'];
        if (!dailyChallenge) {
            // Inicializar si no existe
            this.userChallenges.daily['complete_mining_session'] = {
                progress: 0,
                completed: false,
                claimed: false,
                lastReset: null
            };
        }
        
        const challenge = this.userChallenges.daily['complete_mining_session'];
        if (challenge && !challenge.completed) {
            challenge.progress = 1;
            challenge.completed = true;
            this.completeChallenge('daily', 'complete_mining_session');
            console.log('✅ Desafío de sesión de minería completado');
        }
    }
    
    checkActiveMiningSession() {
        if (!this.supabase?.miningSession?.isActive) return;
        
        // Si hay una sesión activa con más de 1 hora, considerar el desafío completado
        if (this.supabase.miningSession.startTime) {
            const startTime = new Date(this.supabase.miningSession.startTime);
            const hours = (Date.now() - startTime.getTime()) / (1000 * 60 * 60);
            
            if (hours >= 1) {
                console.log(`🎯 Sesión de minería activa con ${hours.toFixed(2)} horas - Desafío completado`);
                this.completeMiningSessionChallenge();
            }
        }
    }
    
    async completeChallenge(type, challengeId) {
        const challengeConfig = type === 'daily' ? 
            Object.values(this.config.daily).find(c => c.id === challengeId) :
            Object.values(this.config.weekly).find(c => c.id === challengeId);
        
        if (!challengeConfig) return;
        
        // Agregar puntos al sistema de competencia
        if (this.competition) {
            this.competition.addChallengePoints(challengeConfig.reward, type);
        }
        
        // Convertir recompensa RSC a Christmas Points si es desafío semanal
        // NO agregar al balance, se acumula en Christmas Points para rescate
        if (type === 'weekly' && challengeConfig.rscReward) {
            const pointsToAdd = challengeConfig.rscReward * 10; // 1 RSC = 10 puntos
            if (this.competition) {
                this.competition.addPoints(pointsToAdd, 'challenge', { 
                    challengeId, 
                    rscReward: challengeConfig.rscReward 
                });
            }
        }
        
        // Disparar evento
        window.dispatchEvent(new CustomEvent('christmasChallengeCompleted', {
            detail: {
                type,
                challengeId,
                points: challengeConfig.reward,
                rscReward: challengeConfig.rscReward || 0
            }
        }));
        
        // Mostrar notificación
        const rscInfo = challengeConfig.rscReward ? 
            ` (+${challengeConfig.rscReward * 10} puntos = ${challengeConfig.rscReward} RSC para rescate)` : '';
        this.showNotification(
            `🎉 Desafío completado: ${challengeConfig.name}! +${challengeConfig.reward} puntos${rscInfo}`,
            'success'
        );
        
        this.saveState();
        this.syncToDatabase();
    }
    
    async claimChallenge(type, challengeId) {
        const challenge = type === 'daily' ? 
            this.userChallenges.daily[challengeId] : 
            this.userChallenges.weekly[challengeId];
        
        if (!challenge || !challenge.completed || challenge.claimed) {
            return false;
        }
        
        challenge.claimed = true;
        this.saveState();
        this.syncToDatabase();
        
        return true;
    }
    
    saveState() {
        if (this.supabase?.user?.id) {
            localStorage.setItem(`christmas_challenges_${this.supabase.user.id}`, 
                JSON.stringify(this.userChallenges));
        }
    }
    
    async syncToDatabase() {
        // Sincronizar con base de datos si es necesario
        // Por ahora solo guardamos en localStorage
    }
    
    showNotification(message, type = 'info') {
        // Usar sistema de notificaciones existente o crear uno simple
        if (window.showNotification) {
            window.showNotification(message, type);
        } else {
            console.log(`📢 ${message}`);
        }
    }
    
    // Getters públicos
    getDailyChallenges() {
        return Object.keys(this.config.daily).map(key => {
            const config = this.config.daily[key];
            const userChallenge = this.userChallenges.daily[config.id] || {
                progress: 0,
                completed: false,
                claimed: false
            };
            
            return {
                ...config,
                ...userChallenge,
                percentage: (userChallenge.progress / config.requirement) * 100
            };
        });
    }
    
    getWeeklyChallenges() {
        return Object.keys(this.config.weekly).map(key => {
            const config = this.config.weekly[key];
            const userChallenge = this.userChallenges.weekly[config.id] || {
                progress: 0,
                completed: false,
                claimed: false
            };
            
            return {
                ...config,
                ...userChallenge,
                percentage: (userChallenge.progress / config.requirement) * 100
            };
        });
    }
}

// Crear instancia global
window.christmasChallenges = new ChristmasChallenges();

console.log('🎯 Christmas Challenges System cargado');

