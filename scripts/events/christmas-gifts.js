/* ================================
   CHRISTMAS GIFTS SYSTEM
   Sistema de 12 regalos navideños
   ================================ */

/**
 * 🎁 SISTEMA DE REGALOS NAVIDEÑOS
 * 
 * Características:
 * - 12 regalos que se desbloquean progresivamente
 * - Desbloqueo basado en participación, puntos, referidos, etc.
 * - Recompensas de 25-500 RSC (convertidos a Christmas Points)
 */

class ChristmasGifts {
    constructor() {
        this.config = {
            gifts: [
                {
                    id: 'gift_1',
                    name: 'Primer Regalo',
                    description: 'Inicia sesión por primera vez',
                    unlockCondition: { type: 'login', value: 1 },
                    reward: 25 // RSC (se convierte a puntos)
                },
                {
                    id: 'gift_2',
                    name: 'Regalo de Minería',
                    description: 'Mina 10 RSC',
                    unlockCondition: { type: 'mining', value: 10 },
                    reward: 50
                },
                {
                    id: 'gift_3',
                    name: 'Regalo de Amistad',
                    description: 'Invita a 1 amigo',
                    unlockCondition: { type: 'referral', value: 1 },
                    reward: 75
                },
                {
                    id: 'gift_4',
                    name: 'Regalo de Puntos',
                    description: 'Consigue 500 Christmas Points',
                    unlockCondition: { type: 'points', value: 500 },
                    reward: 100
                },
                {
                    id: 'gift_5',
                    name: 'Regalo de Dedicación',
                    description: 'Inicia sesión 3 días consecutivos',
                    unlockCondition: { type: 'streak', value: 3 },
                    reward: 125
                },
                {
                    id: 'gift_6',
                    name: 'Regalo de Comunidad',
                    description: 'Consigue 1,000 Christmas Points',
                    unlockCondition: { type: 'points', value: 1000 },
                    reward: 150
                },
                {
                    id: 'gift_7',
                    name: 'Regalo de Minería Avanzada',
                    description: 'Mina 50 RSC',
                    unlockCondition: { type: 'mining', value: 50 },
                    reward: 200
                },
                {
                    id: 'gift_8',
                    name: 'Regalo de Puntos Premium',
                    description: 'Consigue 2,000 Christmas Points',
                    unlockCondition: { type: 'points', value: 2000 },
                    reward: 250
                },
                {
                    id: 'gift_9',
                    name: 'Regalo de Streak Largo',
                    description: 'Inicia sesión 7 días consecutivos',
                    unlockCondition: { type: 'streak', value: 7 },
                    reward: 300
                },
                {
                    id: 'gift_10',
                    name: 'Regalo de Influencer',
                    description: 'Invita a 10 amigos',
                    unlockCondition: { type: 'referral', value: 10 },
                    reward: 350
                },
                {
                    id: 'gift_11',
                    name: 'Regalo de Élite',
                    description: 'Consigue 5,000 Christmas Points',
                    unlockCondition: { type: 'points', value: 5000 },
                    reward: 400
                },
                {
                    id: 'gift_12',
                    name: 'Regalo Final',
                    description: 'Completa todos los demás regalos',
                    unlockCondition: { type: 'all_gifts', value: 11 },
                    reward: 500
                }
            ]
        };
        
        this.userGifts = {};
        this.supabase = null;
        this.competition = null;
        
        // Control de estado para prevenir múltiples verificaciones/reclamaciones
        this.checkingUnlocks = false;
        this.claimingGifts = new Set();
        
        this.init();
    }
    
    async init() {
        console.log('🎁 Inicializando Christmas Gifts...');
        
        try {
            await this.waitForSupabase();
            await this.waitForCompetition();
            await this.loadUserGifts();
            this.setupEventListeners();
            
            console.log('✅ Christmas Gifts inicializado');
        } catch (error) {
            console.error('❌ Error inicializando Gifts:', error);
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
    
    async loadUserGifts() {
        if (!this.supabase?.user?.id) return;
        
        try {
            // Cargar desde localStorage
            const saved = localStorage.getItem(`christmas_gifts_${this.supabase.user.id}`);
            if (saved) {
                this.userGifts = JSON.parse(saved);
            }
            
            // Inicializar regalos que no existen
            this.config.gifts.forEach(gift => {
                if (!this.userGifts[gift.id]) {
                    this.userGifts[gift.id] = {
                        unlocked: false,
                        claimed: false,
                        unlockedAt: null,
                        claimedAt: null
                    };
                }
            });
            
            this.saveState();
        } catch (error) {
            console.error('❌ Error cargando regalos:', error);
        }
    }
    
    setupEventListeners() {
        // Escuchar eventos de login
        window.addEventListener('christmasPointsUpdated', (event) => {
            if (event.detail && event.detail.source === 'dailyLogin') {
                setTimeout(() => this.checkUnlocks(), 1000);
            }
        });
        
        // Escuchar eventos de minería
        const handleBalanceUpdate = (event) => {
            if (event.detail && event.detail.source === 'mining') {
                setTimeout(() => this.checkUnlocks(), 1000);
            }
        };
        window.addEventListener('balanceUpdated', handleBalanceUpdate);
        
        // Escuchar eventos de referidos
        window.addEventListener('rsc:referrer-commission-received', () => {
            setTimeout(() => this.checkUnlocks(), 1000);
        });
        
        // Escuchar eventos de puntos
        window.addEventListener('christmasPointsUpdated', () => {
            setTimeout(() => this.checkUnlocks(), 1000);
        });
        
        // Verificar desbloqueos al inicializar
        setTimeout(() => {
            this.checkUnlocks();
        }, 3000);
    }
    
    async checkUnlocks() {
        if (this.checkingUnlocks) return;
        if (!this.supabase?.user?.isAuthenticated) return;
        
        this.checkingUnlocks = true;
        
        try {
            let unlockedAny = false;
            
            for (const gift of this.config.gifts) {
                // Saltar si ya está desbloqueado Y reclamado
                if (this.userGifts[gift.id]?.unlocked && this.userGifts[gift.id]?.claimed) {
                    continue;
                }
                
                // Si ya está desbloqueado pero no reclamado, no hacer nada
                if (this.userGifts[gift.id]?.unlocked && !this.userGifts[gift.id]?.claimed) {
                    continue;
                }
                
                // Verificar si puede desbloquearse
                const shouldUnlock = await this.checkUnlockCondition(gift);
                if (shouldUnlock) {
                    console.log(`🎁 Desbloqueando regalo: ${gift.name}`);
                    await this.unlockGift(gift.id);
                    unlockedAny = true;
                }
            }
            
            // Verificar regalo especial (gift_12) - todos los demás deben estar reclamados
            if (!this.userGifts['gift_12']?.unlocked) {
                const allOtherGiftsClaimed = this.config.gifts
                    .filter(g => g.id !== 'gift_12')
                    .every(g => this.userGifts[g.id]?.claimed);
                
                if (allOtherGiftsClaimed) {
                    console.log('🎁 Desbloqueando regalo final (gift_12)');
                    await this.unlockGift('gift_12');
                    unlockedAny = true;
                }
            }
            
            if (unlockedAny) {
                this.saveState();
            }
        } catch (error) {
            console.error('❌ Error verificando desbloqueos:', error);
        } finally {
            this.checkingUnlocks = false;
        }
    }
    
    async checkUnlockCondition(gift) {
        const condition = gift.unlockCondition;
        
        try {
            switch (condition.type) {
                case 'login':
                    return this.supabase?.user?.isAuthenticated && condition.value === 1;
                
                case 'mining':
                    const balance = parseFloat(this.supabase?.user?.balance) || 0;
                    return balance >= condition.value;
                
                case 'referral':
                    const referralCount = await this.getReferralCount();
                    return referralCount >= condition.value;
                
                case 'points':
                    const totalPoints = this.competition?.getTotalPoints() || 0;
                    return totalPoints >= condition.value;
                
                case 'streak':
                    const currentStreak = this.competition?.getCurrentStreak() || 0;
                    return currentStreak >= condition.value;
                
                case 'all_gifts':
                    return this.config.gifts
                        .filter(g => g.id !== gift.id)
                        .every(g => this.userGifts[g.id]?.claimed);
                
                default:
                    return false;
            }
        } catch (error) {
            console.error(`❌ Error verificando condición para ${gift.id}:`, error);
            return false;
        }
    }
    
    async getReferralCount() {
        if (!this.supabase?.user?.id || !this.supabase?.config) return 0;
        
        try {
            const response = await fetch(
                `${this.supabase.config.url}/rest/v1/referrals?referrer_id=eq.${this.supabase.user.id}&select=count`,
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
    
    async unlockGift(giftId) {
        const gift = this.config.gifts.find(g => g.id === giftId);
        if (!gift) return;
        
        if (this.userGifts[giftId]?.unlocked) return;
        
        this.userGifts[giftId] = {
            ...this.userGifts[giftId],
            unlocked: true,
            unlockedAt: new Date()
        };
        
        // Guardar en base de datos
        await this.syncGiftToDatabase(giftId);
        
        // Disparar evento
        window.dispatchEvent(new CustomEvent('christmasGiftUnlocked', {
            detail: { giftId, gift }
        }));
        
        // Mostrar notificación
        this.showNotification(
            `🎁 ¡Regalo desbloqueado! ${gift.name} - ${gift.description}`,
            'success'
        );
        
        this.saveState();
    }
    
    async claimGift(giftId) {
        const gift = this.config.gifts.find(g => g.id === giftId);
        if (!gift) {
            console.warn(`⚠️ Regalo no encontrado: ${giftId}`);
            return false;
        }
        
        const userGift = this.userGifts[giftId];
        
        // Verificaciones estrictas
        if (!userGift) {
            console.warn(`⚠️ Regalo no inicializado: ${giftId}`);
            this.showNotification('Este regalo aún no está disponible.', 'warning');
            return false;
        }
        
        if (!userGift.unlocked) {
            console.warn(`⚠️ Regalo no desbloqueado: ${giftId}`);
            this.showNotification('Este regalo aún no está desbloqueado.', 'warning');
            return false;
        }
        
        if (userGift.claimed) {
            console.warn(`⚠️ Regalo ya reclamado: ${giftId}`);
            this.showNotification('Este regalo ya fue reclamado anteriormente.', 'info');
            return false;
        }
        
        // Prevenir reclamaciones múltiples simultáneas
        if (this.claimingGifts.has(giftId)) {
            console.warn(`⚠️ Ya se está reclamando este regalo: ${giftId}`);
            return false;
        }
        
        this.claimingGifts.add(giftId);
        
        try {
            console.log(`🎁 Reclamando regalo: ${gift.name} (${gift.reward} RSC)`);
            
            // Convertir recompensa RSC a Christmas Points (1 RSC = 10 puntos)
            const pointsToAdd = gift.reward * 10;
            
            // Agregar puntos al sistema de competencia (NO al balance)
            if (this.competition) {
                this.competition.addPoints(pointsToAdd, 'gift', { giftId, rscReward: gift.reward });
                console.log(`✅ Puntos agregados: +${pointsToAdd} Christmas Points`);
            } else {
                console.error('❌ Sistema de competencia no disponible');
                throw new Error('Sistema de competencia no disponible');
            }
            
            // Marcar como reclamado ANTES de guardar
            userGift.claimed = true;
            userGift.claimedAt = new Date();
            userGift.pointsAwarded = pointsToAdd;
            userGift.rscReward = gift.reward; // Guardar para rescate posterior
            
            // Guardar estado local primero
            this.saveState();
            
            // Guardar en base de datos
            await this.syncGiftToDatabase(giftId);
            
            // Esperar un poco para que se sincronice con el leaderboard
            setTimeout(() => {
                // Disparar evento para actualizar UI
                window.dispatchEvent(new CustomEvent('christmasGiftClaimed', {
                    detail: { giftId, gift, pointsAwarded: pointsToAdd, rscReward: gift.reward }
                }));
                
                // Forzar actualización del leaderboard
                if (window.christmasLeaderboard) {
                    window.christmasLeaderboard.loadLeaderboard();
                }
            }, 1000);
            
            // Mostrar notificación
            this.showNotification(
                `🎁 ¡Regalo reclamado! ${gift.name}: +${pointsToAdd} Christmas Points (${gift.reward} RSC para rescate)`,
                'success'
            );
            
            // Verificar si se puede desbloquear gift_12 (sin bloquear)
            setTimeout(() => {
                this.checkUnlocks();
            }, 500);
            
            return true;
        } catch (error) {
            console.error('❌ Error reclamando regalo:', error);
            
            // Revertir estado si falla
            userGift.claimed = false;
            userGift.claimedAt = null;
            this.saveState();
            
            this.showNotification('Error reclamando regalo. Intenta de nuevo.', 'error');
            return false;
        } finally {
            // Remover de set de reclamaciones en progreso
            this.claimingGifts.delete(giftId);
        }
    }
    
    async syncGiftToDatabase(giftId) {
        if (!this.supabase?.user?.isAuthenticated || !this.supabase?.config) return;
        
        const gift = this.config.gifts.find(g => g.id === giftId);
        const userGift = this.userGifts[giftId];
        
        if (!gift || !userGift) return;
        
        try {
            const data = {
                user_id: this.supabase.user.id,
                gift_id: giftId,
                unlocked: userGift.unlocked,
                claimed: userGift.claimed,
                unlocked_at: userGift.unlockedAt?.toISOString(),
                claimed_at: userGift.claimedAt?.toISOString(),
                points_awarded: userGift.pointsAwarded || 0,
                rsc_reward: userGift.rscReward || gift.reward,
                updated_at: new Date().toISOString()
            };
            
            // Intentar actualizar
            const updateResponse = await fetch(
                `${this.supabase.config.url}/rest/v1/christmas_event_gifts?user_id=eq.${this.supabase.user.id}&gift_id=eq.${giftId}`,
                {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'apikey': this.supabase.config.anonKey,
                        'Authorization': `Bearer ${this.supabase.config.anonKey}`
                    },
                    body: JSON.stringify(data)
                }
            );
            
            if (!updateResponse.ok) {
                // Insertar si no existe
                await fetch(
                    `${this.supabase.config.url}/rest/v1/christmas_event_gifts`,
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'apikey': this.supabase.config.anonKey,
                            'Authorization': `Bearer ${this.supabase.config.anonKey}`
                        },
                        body: JSON.stringify(data)
                    }
                );
            }
        } catch (error) {
            console.warn('⚠️ Error sincronizando regalo con BD:', error);
        }
    }
    
    saveState() {
        if (this.supabase?.user?.id) {
            localStorage.setItem(`christmas_gifts_${this.supabase.user.id}`, 
                JSON.stringify(this.userGifts));
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
    getUserGifts() {
        return this.config.gifts.map(gift => ({
            ...gift,
            ...this.userGifts[gift.id]
        }));
    }
}

// Crear instancia global
window.christmasGifts = new ChristmasGifts();

console.log('🎁 Christmas Gifts System cargado');

