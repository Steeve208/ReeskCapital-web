/* ================================
   CHRISTMAS REFERRALS SYSTEM
   Sistema de referidos mejorado para el evento navideño
   ================================ */

/**
 * 👥 SISTEMA DE REFERIDOS MEJORADO
 * 
 * Características:
 * - Bonificación instantánea: 100 RSC al referidor, 50 RSC al referido
 * - Comisión permanente: 15% (aumentada desde 10%) durante el evento
 * - Milestones de referidos con recompensas escalonadas
 * - Integración con Christmas Points
 */

class ChristmasReferrals {
    constructor() {
        this.config = {
            instantBonuses: {
                referrer: 100, // RSC instantáneo al referidor
                referred: 50   // RSC instantáneo al referido
            },
            commissionRate: 0.15, // 15% durante el evento
            milestones: {
                5: 500,      // 5 referidos: +500 RSC
                10: 1500,    // 10 referidos: +1,500 RSC
                20: 5000,    // 20 referidos: +5,000 RSC
                50: 15000,   // 50 referidos: +15,000 RSC
                100: 50000   // 100 referidos: +50,000 RSC
            }
        };
        
        this.userMilestones = {};
        this.supabase = null;
        this.competition = null;
        
        this.init();
    }
    
    async init() {
        console.log('👥 Inicializando Christmas Referrals...');
        
        try {
            await this.waitForSupabase();
            await this.waitForCompetition();
            await this.loadUserMilestones();
            this.setupEventListeners();
            
            console.log('✅ Christmas Referrals inicializado');
        } catch (error) {
            console.error('❌ Error inicializando Referrals:', error);
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
    
    async loadUserMilestones() {
        if (!this.supabase?.user?.id) return;
        
        try {
            const saved = localStorage.getItem(`christmas_referral_milestones_${this.supabase.user.id}`);
            if (saved) {
                this.userMilestones = JSON.parse(saved);
            }
        } catch (error) {
            console.warn('⚠️ Error cargando milestones:', error);
        }
    }
    
    setupEventListeners() {
        // Escuchar cuando se registra un nuevo referido
        window.addEventListener('rsc:new-referral-registered', (event) => {
            if (event.detail) {
                const { referrerId, referredUserId } = event.detail;
                this.processNewReferral(referrerId, referredUserId);
            }
        });
        
        // También escuchar eventos de comisión (ya procesados por el sistema existente)
        window.addEventListener('rsc:referrer-commission-received', () => {
            // La comisión del 15% ya se procesa en el sistema existente
            // Aquí solo verificamos milestones
            if (this.supabase?.user?.id) {
                this.checkMilestones(this.supabase.user.id);
            }
        });
    }
    
    isEventActive() {
        const now = new Date();
        const startDate = new Date('2024-12-25T00:00:00');
        const endDate = new Date('2026-01-02T23:59:59');
        return now >= startDate && now <= endDate;
    }
    
    /**
     * Procesar bonificaciones cuando se registra un nuevo referido
     */
    async processNewReferral(referrerId, referredUserId) {
        if (!this.isEventActive()) return;
        
        try {
            // Convertir bonificaciones a Christmas Points (NO agregar al balance)
            const referrerPoints = this.config.instantBonuses.referrer * 10; // 1 RSC = 10 puntos
            const referredPoints = this.config.instantBonuses.referred * 10;
            
            // Agregar puntos al referidor (si es el usuario actual)
            if (referrerId === this.supabase?.user?.id && this.competition) {
                this.competition.addPoints(referrerPoints, 'referral', { 
                    type: 'instant_bonus',
                    rscReward: this.config.instantBonuses.referrer 
                });
            }
            
            // Agregar puntos al referido (se procesará cuando inicie sesión)
            // Guardar en base de datos para procesar después
            
            // Agregar puntos de referido al sistema de competencia
            if (this.competition) {
                this.competition.addReferralPoints();
            }
            
            // Verificar milestones
            await this.checkMilestones(referrerId);
            
            // Mostrar notificación
            this.showNotification(
                `🎉 ¡Nuevo referido! +${referrerPoints} Christmas Points (${this.config.instantBonuses.referrer} RSC para rescate)`,
                'success'
            );
            
            console.log(`✅ Bonificaciones procesadas: Referidor ${referrerId}, Referido ${referredUserId}`);
        } catch (error) {
            console.error('❌ Error procesando bonificaciones de referido:', error);
        }
    }
    
    /**
     * Procesar bonificaciones cuando un referido mina
     */
    async processReferralBonuses(referrerId, referredUserId) {
        if (!this.isEventActive()) return;
        
        // La comisión del 15% ya se procesa en el sistema de referidos existente
        // Aquí solo verificamos milestones
        await this.checkMilestones(referrerId);
    }
    
    /**
     * Verificar y procesar milestones de referidos
     */
    async checkMilestones(userId) {
        try {
            // Obtener conteo actual de referidos
            const referralCount = await this.getReferralCount(userId);
            
            // Verificar cada milestone
            for (const [count, reward] of Object.entries(this.config.milestones)) {
                const milestoneCount = parseInt(count);
                
                if (referralCount >= milestoneCount && !this.userMilestones[count]?.claimed) {
                    // Milestone alcanzado y no reclamado
                    await this.claimMilestone(userId, milestoneCount, reward);
                }
            }
        } catch (error) {
            console.error('❌ Error verificando milestones:', error);
        }
    }
    
    /**
     * Reclamar milestone de referidos
     */
    async claimMilestone(userId, milestoneCount, reward) {
        try {
            // Convertir recompensa a Christmas Points (NO agregar al balance)
            const pointsToAdd = reward * 10; // 1 RSC = 10 puntos
            
            // Agregar puntos al sistema de competencia
            if (userId === this.supabase?.user?.id && this.competition) {
                this.competition.addPoints(pointsToAdd, 'referral', { 
                    type: 'milestone',
                    milestoneCount,
                    rscReward: reward 
                });
            }
            
            // Marcar como reclamado
            if (!this.userMilestones[milestoneCount]) {
                this.userMilestones[milestoneCount] = {};
            }
            this.userMilestones[milestoneCount].claimed = true;
            this.userMilestones[milestoneCount].claimedAt = new Date();
            this.userMilestones[milestoneCount].reward = reward;
            
            this.saveMilestones();
            
            // Mostrar notificación
            this.showNotification(
                `🎉 ¡Milestone alcanzado! ${milestoneCount} referidos: +${pointsToAdd} Christmas Points (${reward} RSC para rescate)`,
                'success'
            );
            
            console.log(`✅ Milestone ${milestoneCount} reclamado: ${reward} RSC = ${pointsToAdd} puntos`);
        } catch (error) {
            console.error('❌ Error reclamando milestone:', error);
        }
    }
    
    async getReferralCount(userId) {
        if (!userId || !this.supabase?.config) return 0;
        
        try {
            const response = await fetch(
                `${this.supabase.config.url}/rest/v1/referrals?referrer_id=eq.${userId}&select=count`,
                {
                    headers: {
                        'apikey': this.supabase.config.anonKey,
                        'Authorization': `Bearer ${this.supabase.config.anonKey}`
                    }
                }
            );
            
            if (response.ok) {
                const data = await response.json();
                return Array.isArray(data) ? data.length : parseInt(data) || 0;
            }
        } catch (error) {
            console.warn('⚠️ Error obteniendo conteo de referidos:', error);
        }
        return 0;
    }
    
    saveMilestones() {
        if (this.supabase?.user?.id) {
            localStorage.setItem(`christmas_referral_milestones_${this.supabase.user.id}`, 
                JSON.stringify(this.userMilestones));
        }
    }
    
    showNotification(message, type = 'info') {
        if (window.showNotification) {
            window.showNotification(message, type);
        } else {
            console.log(`📢 ${message}`);
        }
    }
    
    // Getters públicos
    getClaimedMilestones() {
        return Object.entries(this.userMilestones)
            .filter(([count, data]) => data.claimed)
            .map(([count, data]) => ({
                count: parseInt(count),
                reward: data.reward,
                claimedAt: data.claimedAt
            }));
    }
}

// Crear instancia global
window.christmasReferrals = new ChristmasReferrals();

console.log('👥 Christmas Referrals System cargado');

