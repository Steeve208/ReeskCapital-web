/**
 * 🎄 CHRISTMAS COMMUNITY BONANZA EVENT
 * Evento Navideño Orientado a Construir Comunidad
 * 
 * Características:
 * - Sistema de regalos progresivos (4 regalos)
 * - Sistema de referidos con bonos escalonados
 * - Desafíos diarios y semanales
 * - Leaderboard comunitario
 * - Bonos de comunidad
 */

class ChristmasEvent {
    constructor() {
        // Configuración del evento
        this.config = {
            name: 'Christmas Community Bonanza',
            startDate: new Date('2024-12-09'), // Fecha de inicio (hoy)
            endDate: new Date('2025-01-15'), // Extendido hasta mediados de enero
            giftRewards: {
                gift1: 50,  // Follow X
                gift2: 50,  // Join Telegram
                gift3: 50,  // Mine 1 hour
                gift4: 50   // Complete all 3
            },
            referralMilestones: {
                1: 25,   // 1 friend = +25 RSK
                3: 100,  // 3 friends = +100 RSK
                5: 200,  // 5 friends = +200 RSK
                10: 500  // 10 friends = +500 RSK + special gift
            },
            challenges: {
                dailyMining: { reward: 5, requirement: 30 }, // 30 minutes
                telegramActivity: { reward: 10, requirement: 5 }, // 5 messages
                socialShare: { reward: 15, requirement: 1 } // 1 share
            },
            socialLinks: {
                twitter: 'https://x.com/Reeskcap',
                telegram: 'https://t.me/RSCchain'
            }
        };

        // Estado del usuario
        this.userState = {
            gifts: {
                gift1: { unlocked: false, claimed: false },
                gift2: { unlocked: false, claimed: false },
                gift3: { unlocked: false, claimed: false },
                gift4: { unlocked: false, claimed: false }
            },
            referrals: {
                count: 0,
                milestones: {
                    milestone1: false,
                    milestone3: false,
                    milestone5: false,
                    milestone10: false
                }
            },
            challenges: {
                dailyMining: { progress: 0, completed: false, lastReset: null },
                telegramActivity: { progress: 0, completed: false, lastReset: null },
                socialShare: { progress: 0, completed: false }
            },
            totalEarned: 0,
            lastUpdate: new Date()
        };

        // Referencias a elementos DOM
        this.elements = {};

        // Inicializar
        this.initialize();
    }

    async initialize() {
        console.log('🎄 Inicializando Christmas Community Bonanza...');

        try {
            // Esperar a que Supabase esté listo
            await this.waitForSupabase();

            // Cargar estado guardado
            await this.loadSavedState();

            // Esperar DOM
            await this.waitForDOM();

            // Configurar elementos
            this.setupElements();

            // Configurar event listeners
            this.setupEventListeners();

            // Inicializar tabs
            this.initializeTabs();

            // Verificar estado del evento
            if (!this.isEventActive()) {
                console.warn('⚠️ Event is not active. Dates:', {
                    now: new Date(),
                    start: this.config.startDate,
                    end: this.config.endDate
                });
            }

            // Actualizar UI
            this.updateUI();

            // Iniciar timers
            this.startTimers();

            // Actualizar tiempo restante inmediatamente
            this.updateTimeLeft();

            console.log('✅ Christmas Event inicializado correctamente');
        } catch (error) {
            console.error('❌ Error inicializando Christmas Event:', error);
        }
    }

    async waitForSupabase() {
        return new Promise((resolve) => {
            if (window.supabaseIntegration) {
                resolve(window.supabaseIntegration);
            } else {
                const checkInterval = setInterval(() => {
                    if (window.supabaseIntegration) {
                        clearInterval(checkInterval);
                        resolve(window.supabaseIntegration);
                    }
                }, 100);
            }
        });
    }

    async waitForDOM() {
        return new Promise((resolve) => {
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', resolve);
            } else {
                resolve();
            }
        });
    }

    setupElements() {
        const progressBar = document.getElementById('christmasProgressBar');
        
        this.elements = {
            // Tabs
            tabButtons: document.querySelectorAll('.tab-btn'),
            tabContents: document.querySelectorAll('.tab-content'),
            
            // Gift boxes
            giftBoxes: document.querySelectorAll('.gift-box'),
            
            // Action buttons
            twitterBtn: document.querySelector('[data-action="follow_twitter"]'),
            telegramBtn: document.querySelector('[data-action="join_telegram"]'),
            
            // Referrals
            referralCode: document.getElementById('christmasReferralCode'),
            copyReferralBtn: document.getElementById('copyChristmasReferral'),
            shareButtons: document.querySelectorAll('.btn-share'),
            
            // Challenges
            challengeCards: document.querySelectorAll('.challenge-card'),
            claimButtons: document.querySelectorAll('.btn-claim'),
            
            // Leaderboard
            lbTabs: document.querySelectorAll('.lb-tab'),
            leaderboardList: document.getElementById('leaderboardList'),
            
            // Progress
            progressBar: progressBar,
            progressFill: progressBar?.querySelector('.progress-fill'),
            progressText: document.getElementById('christmasTotalProgress'),
            timeLeft: document.getElementById('christmasTimeLeft'),
            totalEarnings: document.getElementById('christmasYourEarnings')
        };
    }

    setupEventListeners() {
        // Tab navigation
        this.elements.tabButtons?.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tab = e.target.dataset.tab;
                this.switchTab(tab);
            });
        });

        // Social action buttons
        this.elements.twitterBtn?.addEventListener('click', () => {
            this.handleSocialAction('follow_twitter');
        });

        this.elements.telegramBtn?.addEventListener('click', () => {
            this.handleSocialAction('join_telegram');
        });

        // Copy referral code
        this.elements.copyReferralBtn?.addEventListener('click', () => {
            this.copyReferralCode();
        });

        // Share buttons
        this.elements.shareButtons?.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const platform = e.target.closest('.btn-share').dataset.share;
                this.shareReferralCode(platform);
            });
        });

        // Claim challenge buttons
        this.elements.claimButtons?.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const challenge = e.target.closest('.challenge-card').dataset.challenge;
                this.claimChallenge(challenge);
            });
        });

        // Leaderboard tabs
        this.elements.lbTabs?.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const type = e.target.dataset.lb;
                this.loadLeaderboard(type);
            });
        });

        // Gift box clicks
        this.elements.giftBoxes?.forEach(box => {
            box.addEventListener('click', (e) => {
                const giftId = box.dataset.gift;
                if (box.classList.contains('unlocked') && !box.classList.contains('claimed')) {
                    this.claimGift(giftId);
                }
            });
        });

        // Listen for mining updates
        window.addEventListener('miningUpdate', () => {
            this.checkMiningProgress();
        });

        // Listen for referral updates
        window.addEventListener('referralUpdate', () => {
            this.updateReferralProgress();
        });
    }

    initializeTabs() {
        // Activate first tab
        if (this.elements.tabButtons?.length > 0) {
            this.switchTab('gifts');
        }
    }

    switchTab(tabName) {
        // Update buttons
        this.elements.tabButtons?.forEach(btn => {
            if (btn.dataset.tab === tabName) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        // Update content
        this.elements.tabContents?.forEach(content => {
            if (content.id === `${tabName}Tab`) {
                content.classList.add('active');
            } else {
                content.classList.remove('active');
            }
        });

        // Load tab-specific data
        if (tabName === 'leaderboard') {
            this.loadLeaderboard('referrals');
        }
    }

    async handleSocialAction(action) {
        const supabase = window.supabaseIntegration;
        if (!supabase?.user?.isAuthenticated) {
            this.showNotification('Please login first', 'error');
            return;
        }

        let url = '';
        if (action === 'follow_twitter') {
            url = this.config.socialLinks.twitter;
            // Mark as completed after opening
            setTimeout(() => {
                this.unlockGift('gift1');
            }, 2000);
        } else if (action === 'join_telegram') {
            url = this.config.socialLinks.telegram;
            setTimeout(() => {
                this.unlockGift('gift2');
            }, 2000);
        }

        if (url) {
            window.open(url, '_blank');
            this.showNotification(`Opening ${action === 'follow_twitter' ? 'X' : 'Telegram'}...`, 'info');
        }
    }

    async unlockGift(giftId) {
        if (this.userState.gifts[giftId]?.unlocked) return;

        // Verificar que el evento esté activo
        if (!this.isEventActive()) {
            console.warn('Event is not active, cannot unlock gift');
            return;
        }

        this.userState.gifts[giftId].unlocked = true;
        
        // Update UI
        const giftBox = document.querySelector(`[data-gift="${giftId}"]`);
        if (giftBox) {
            giftBox.classList.add('unlocked');
            giftBox.classList.remove('locked');
            const status = giftBox.querySelector('.gift-status');
            if (status) {
                status.setAttribute('data-status', 'unlocked');
                status.innerHTML = '<i class="fas fa-check"></i> Unlocked - Click to Claim';
            }
        }

        // NO desbloquear gift4 aquí - se desbloquea cuando los 3 anteriores están CLAIMED (no solo unlocked)
        // Esto se maneja en claimGift()

        this.saveState();
        this.updateUI();
        this.showNotification(`🎁 Gift ${giftId.replace('gift', '#')} unlocked! Click to claim.`, 'success');
    }

    async claimGift(giftId) {
        // Verificar que el evento esté activo
        if (!this.isEventActive()) {
            this.showNotification('Event has ended', 'error');
            return;
        }

        if (!this.userState.gifts[giftId]?.unlocked || this.userState.gifts[giftId]?.claimed) {
            return;
        }

        const supabase = window.supabaseIntegration;
        if (!supabase?.user?.isAuthenticated) {
            this.showNotification('Please login first', 'error');
            return;
        }

        try {
            const reward = this.config.giftRewards[giftId];
            
            // Opción 1: Usar API endpoint (recomendado)
            const response = await fetch('/api/christmas-event/claim-gift', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${supabase.user.token || supabase.config.anonKey}`
                },
                body: JSON.stringify({
                    userId: supabase.user.id,
                    giftId: giftId
                })
            });

            if (response.ok) {
                const result = await response.json();
                
                this.userState.gifts[giftId].claimed = true;
                this.userState.totalEarned += reward;

                // Update UI
                const giftBox = document.querySelector(`[data-gift="${giftId}"]`);
                if (giftBox) {
                    giftBox.classList.add('claimed');
                    const status = giftBox.querySelector('.gift-status');
                    if (status) {
                        status.setAttribute('data-status', 'claimed');
                        status.innerHTML = '<i class="fas fa-check-circle"></i> Claimed';
                    }
                }

                this.saveState();
                this.updateUI();
                this.showNotification(`🎉 You claimed ${reward} RSK!`, 'success');
                
                // Check if all 3 main gifts are CLAIMED - unlock gift4
                if (giftId !== 'gift4' && 
                    this.userState.gifts.gift1.claimed && 
                    this.userState.gifts.gift2.claimed && 
                    this.userState.gifts.gift3.claimed &&
                    !this.userState.gifts.gift4.unlocked) {
                    await this.unlockGift('gift4');
                }
            } else {
                // Fallback: Usar método directo de Supabase
                await supabase.addBalance(reward);
                this.userState.gifts[giftId].claimed = true;
                this.userState.totalEarned += reward;
                this.saveState();
                this.updateUI();
                this.showNotification(`🎉 You claimed ${reward} RSK!`, 'success');
                
                // Check if all 3 main gifts are CLAIMED - unlock gift4
                if (giftId !== 'gift4' && 
                    this.userState.gifts.gift1.claimed && 
                    this.userState.gifts.gift2.claimed && 
                    this.userState.gifts.gift3.claimed &&
                    !this.userState.gifts.gift4.unlocked) {
                    await this.unlockGift('gift4');
                }
            }
        } catch (error) {
            console.error('Error claiming gift:', error);
            this.showNotification('Error claiming gift. Please try again.', 'error');
        }
    }

    checkMiningProgress() {
        const supabase = window.supabaseIntegration;
        if (!supabase?.miningSession?.isActive) return;

        // Check if user has mined for 1 hour
        const startTime = supabase.miningSession.startTime;
        if (startTime) {
            const duration = (Date.now() - new Date(startTime).getTime()) / (1000 * 60); // minutes
            if (duration >= 60 && !this.userState.gifts.gift3.unlocked) {
                this.unlockGift('gift3');
            }

            // Update daily mining challenge
            this.updateDailyMiningChallenge(duration);
        }
    }

    updateDailyMiningChallenge(minutes) {
        const challenge = this.userState.challenges.dailyMining;
        const now = new Date();
        const lastReset = challenge.lastReset ? new Date(challenge.lastReset) : null;

        // Reset if new day
        if (!lastReset || now.toDateString() !== lastReset.toDateString()) {
            challenge.progress = 0;
            challenge.completed = false;
            challenge.lastReset = now.toISOString();
        }

        if (!challenge.completed) {
            challenge.progress = Math.min(minutes, this.config.challenges.dailyMining.requirement);
            if (challenge.progress >= this.config.challenges.dailyMining.requirement) {
                challenge.completed = true;
            }
            this.updateChallengeUI('daily-mining');
        }
    }

    async updateReferralProgress() {
        const supabase = window.supabaseIntegration;
        if (!supabase?.user?.isAuthenticated) return;

        try {
            // Get referral count from Supabase
            const referralCount = await this.getReferralCount();
            this.userState.referrals.count = referralCount;

            // Check milestones
            this.checkReferralMilestones(referralCount);

            this.updateReferralUI();
            this.saveState();
        } catch (error) {
            console.error('Error updating referral progress:', error);
        }
    }

    async getReferralCount() {
        const supabase = window.supabaseIntegration;
        if (!supabase?.user?.isAuthenticated) return 0;

        try {
            // Opción 1: Usar Supabase directamente
            const { data, error } = await supabase.supabase
                .from('referrals')
                .select('id', { count: 'exact', head: true })
                .eq('referrer_user_id', supabase.user.id)
                .eq('status', 'active');

            if (error) throw error;
            return data?.length || 0;

            // Opción 2: Usar API endpoint (si está disponible)
            /*
            const response = await fetch(`/api/referrals/stats/${supabase.user.id}`, {
                headers: {
                    'Authorization': `Bearer ${supabase.user.token}`
                }
            });
            
            if (response.ok) {
                const stats = await response.json();
                return stats.total_referrals || 0;
            }
            */
        } catch (error) {
            console.error('Error getting referral count:', error);
            return 0;
        }
    }

    checkReferralMilestones(count) {
        // Solo actualizar UI, no reclamar automáticamente
        // El usuario debe hacer clic en "Claim" para reclamar el milestone
        this.updateReferralUI();
    }

    async claimReferralMilestone(milestone) {
        // Verificar que el evento esté activo
        if (!this.isEventActive()) {
            this.showNotification('Event has ended', 'error');
            return;
        }

        const supabase = window.supabaseIntegration;
        if (!supabase?.user?.isAuthenticated) return;

        const reward = this.config.referralMilestones[milestone];
        if (!reward) return;

        try {
            // Usar API endpoint
            const response = await fetch('/api/christmas-event/claim-referral-milestone', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${supabase.user.token || supabase.config.anonKey}`
                },
                body: JSON.stringify({
                    userId: supabase.user.id,
                    milestone: milestone
                })
            });

            if (response.ok) {
                const result = await response.json();
                this.userState.referrals.milestones[`milestone${milestone}`] = true;
                this.userState.totalEarned += reward;

                this.updateReferralUI();
                this.saveState();
                this.showNotification(`🎉 Milestone reached! You earned ${reward} RSK!`, 'success');
            } else {
                // Fallback
                await supabase.addBalance(reward);
                this.userState.referrals.milestones[`milestone${milestone}`] = true;
                this.userState.totalEarned += reward;
                this.updateReferralUI();
                this.saveState();
                this.showNotification(`🎉 Milestone reached! You earned ${reward} RSK!`, 'success');
            }
        } catch (error) {
            console.error('Error claiming milestone:', error);
            this.showNotification('Error claiming milestone', 'error');
        }
    }

    async claimChallenge(challengeId) {
        // Verificar que el evento esté activo
        if (!this.isEventActive()) {
            this.showNotification('Event has ended', 'error');
            return;
        }

        const challenge = this.userState.challenges[challengeId];
        if (!challenge?.completed || challenge.claimed) return;

        const supabase = window.supabaseIntegration;
        if (!supabase?.user?.isAuthenticated) {
            this.showNotification('Please login first', 'error');
            return;
        }

        try {
            const reward = this.config.challenges[challengeId].reward;
            
            // Usar API endpoint
            const response = await fetch('/api/christmas-event/claim-challenge', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${supabase.user.token || supabase.config.anonKey}`
                },
                body: JSON.stringify({
                    userId: supabase.user.id,
                    challengeId: challengeId
                })
            });

            if (response.ok) {
                challenge.claimed = true;
                this.userState.totalEarned += reward;

                this.updateChallengeUI(challengeId);
                this.saveState();
                this.showNotification(`🎉 Challenge completed! You earned ${reward} RSK!`, 'success');
            } else {
                // Fallback
                await supabase.addBalance(reward);
                challenge.claimed = true;
                this.userState.totalEarned += reward;
                this.updateChallengeUI(challengeId);
                this.saveState();
                this.showNotification(`🎉 Challenge completed! You earned ${reward} RSK!`, 'success');
            }
        } catch (error) {
            console.error('Error claiming challenge:', error);
            this.showNotification('Error claiming challenge', 'error');
        }
    }

    copyReferralCode() {
        if (this.elements.referralCode) {
            this.elements.referralCode.select();
            document.execCommand('copy');
            this.showNotification('Referral code copied!', 'success');
        }
    }

    shareReferralCode(platform) {
        const code = this.elements.referralCode?.value || '';
        const text = `Join RSC Mining and earn rewards! Use my referral code: ${code}`;
        const url = window.location.href;

        if (platform === 'twitter') {
            window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
        } else if (platform === 'telegram') {
            window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank');
        }

        // Mark social share challenge as completed
        this.userState.challenges.socialShare.progress = 1;
        this.userState.challenges.socialShare.completed = true;
        this.updateChallengeUI('social-share');
        this.saveState();
    }

    async loadLeaderboard(type) {
        if (!this.elements.leaderboardList) return;

        this.elements.leaderboardList.innerHTML = `
            <div class="leaderboard-loading">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Loading leaderboard...</p>
            </div>
        `;

        try {
            let leaderboardData = [];

            if (type === 'mining') {
                // Usar endpoint de mining leaderboard
                const response = await fetch('/api/mining/leaderboard?limit=10&period=all');
                if (response.ok) {
                    const data = await response.json();
                    leaderboardData = data.leaderboard?.map((user, index) => ({
                        rank: index + 1,
                        name: user.username || user.email || 'Anonymous',
                        value: user.total_mined || 0,
                        stats: `${user.total_mined || 0} RSK mined`
                    })) || [];
                }
            } else if (type === 'referrals') {
                // Obtener top referrers desde Supabase
                const supabase = window.supabaseIntegration;
                if (supabase?.supabase) {
                    const { data, error } = await supabase.supabase
                        .from('referral_stats')
                        .select('user_id, total_referrals, mining_users(username, email)')
                        .order('total_referrals', { ascending: false })
                        .limit(10);

                    if (!error && data) {
                        leaderboardData = data.map((stat, index) => ({
                            rank: index + 1,
                            name: stat.mining_users?.username || stat.mining_users?.email || 'Anonymous',
                            value: stat.total_referrals || 0,
                            stats: `${stat.total_referrals || 0} referrals`
                        }));
                    }
                }
            } else if (type === 'activity') {
                // Combinar mining + referrals para actividad total
                // Por ahora usar mining como placeholder
                const response = await fetch('/api/mining/leaderboard?limit=10&period=week');
                if (response.ok) {
                    const data = await response.json();
                    leaderboardData = data.leaderboard?.map((user, index) => ({
                        rank: index + 1,
                        name: user.username || user.email || 'Anonymous',
                        value: user.mining_level || 0,
                        stats: `Level ${user.mining_level || 0}`
                    })) || [];
                }
            }

            // Renderizar leaderboard
            if (leaderboardData.length > 0) {
                this.elements.leaderboardList.innerHTML = leaderboardData.map(item => `
                    <div class="leaderboard-item">
                        <div class="leaderboard-rank ${item.rank <= 3 ? `top-${item.rank}` : ''}">${item.rank}</div>
                        <div class="leaderboard-info">
                            <div class="leaderboard-name">${item.name}</div>
                            <div class="leaderboard-stats">${item.stats}</div>
                        </div>
                        <div class="leaderboard-value">${item.value}</div>
                    </div>
                `).join('');
            } else {
                this.elements.leaderboardList.innerHTML = '<p>No data available yet</p>';
            }
        } catch (error) {
            console.error('Error loading leaderboard:', error);
            this.elements.leaderboardList.innerHTML = '<p>Error loading leaderboard. Please try again later.</p>';
        }
    }

    updateUI() {
        this.updateGiftsUI();
        this.updateReferralUI();
        this.updateChallengesUI();
        this.updateProgress();
        this.updateTimeLeft();
        this.updateStats();
    }

    updateGiftsUI() {
        this.elements.giftBoxes?.forEach(box => {
            const giftId = box.dataset.gift;
            const gift = this.userState.gifts[giftId];
            
            if (gift?.claimed) {
                box.classList.add('claimed');
            } else if (gift?.unlocked) {
                box.classList.add('unlocked');
            }
        });
    }

    updateReferralUI() {
        // Update referral code
        const supabase = window.supabaseIntegration;
        if (this.elements.referralCode && supabase?.user?.referralCode) {
            this.elements.referralCode.value = supabase.user.referralCode;
        }

        // Update referral count display
        const referralCountEl = document.getElementById('christmasReferralCount');
        if (referralCountEl) {
            referralCountEl.textContent = this.userState.referrals.count;
        }

        // Update milestones
        const milestones = document.querySelectorAll('.milestone-card');
        milestones.forEach(card => {
            const milestone = parseInt(card.dataset.milestone);
            const count = this.userState.referrals.count;
            const isClaimed = this.userState.referrals.milestones[`milestone${milestone}`];
            
            // Update progress
            const progressFill = card.querySelector('.progress-fill-small');
            if (progressFill) {
                if (count >= milestone) {
                    progressFill.style.width = '100%';
                    card.classList.add('completed');
                } else {
                    progressFill.style.width = `${(count / milestone) * 100}%`;
                    card.classList.remove('completed');
                }
            }

            // Update progress text
            const progressText = card.querySelector('.progress-text');
            if (progressText) {
                progressText.textContent = `${count}/${milestone}`;
            }

            // Update claim button
            let claimBtn = card.querySelector('.btn-claim-milestone');
            if (!claimBtn) {
                // Create claim button if it doesn't exist
                claimBtn = document.createElement('button');
                claimBtn.className = 'btn-claim-milestone';
                claimBtn.dataset.milestone = milestone;
                const content = card.querySelector('.milestone-content');
                if (content) {
                    content.appendChild(claimBtn);
                }
            }

            if (count >= milestone && !isClaimed) {
                claimBtn.disabled = false;
                claimBtn.classList.add('available');
                claimBtn.textContent = 'Claim Reward';
                claimBtn.onclick = () => this.claimReferralMilestone(milestone);
            } else if (isClaimed) {
                claimBtn.disabled = true;
                claimBtn.classList.add('claimed');
                claimBtn.textContent = 'Claimed';
            } else {
                claimBtn.disabled = true;
                claimBtn.textContent = 'In Progress';
            }
        });
    }

    updateChallengesUI() {
        Object.keys(this.userState.challenges).forEach(challengeId => {
            this.updateChallengeUI(challengeId);
        });
    }

    updateChallengeUI(challengeId) {
        const challenge = this.userState.challenges[challengeId];
        const card = document.querySelector(`[data-challenge="${challengeId}"]`);
        if (!card) return;

        const config = this.config.challenges[challengeId];
        const progress = challenge.progress || 0;
        const percentage = (progress / config.requirement) * 100;

        // Update progress bar
        const progressFill = card.querySelector('.progress-fill-small');
        if (progressFill) {
            progressFill.style.width = `${percentage}%`;
        }

        // Update progress text
        const progressText = card.querySelector('.progress-text');
        if (progressText) {
            if (challengeId === 'dailyMining') {
                progressText.textContent = `${Math.floor(progress)}/${config.requirement} min`;
            } else if (challengeId === 'telegramActivity') {
                progressText.textContent = `${progress}/${config.requirement} messages`;
            } else {
                progressText.textContent = `${progress}/${config.requirement} share`;
            }
        }

        // Update claim button
        const claimBtn = card.querySelector('.btn-claim');
        if (claimBtn) {
            if (challenge.completed && !challenge.claimed) {
                claimBtn.disabled = false;
                claimBtn.classList.add('available');
                claimBtn.textContent = 'Claim Reward';
            } else if (challenge.claimed) {
                claimBtn.disabled = true;
                claimBtn.textContent = 'Claimed';
            } else {
                claimBtn.disabled = true;
                claimBtn.textContent = 'In Progress';
            }
        }

        if (challenge.completed) {
            card.classList.add('completed');
        }
    }

    updateProgress() {
        const totalPossible = 200 + 500 + 5 + 10 + 15; // gifts + max referrals + challenges
        const percentage = (this.userState.totalEarned / totalPossible) * 100;

        if (this.elements.progressFill) {
            this.elements.progressFill.style.width = `${percentage}%`;
        }

        if (this.elements.progressText) {
            this.elements.progressText.textContent = `${this.userState.totalEarned} RSK earned`;
        }
    }

    isEventActive() {
        const now = new Date();
        const start = this.config.startDate;
        const end = this.config.endDate;
        return now >= start && now <= end;
    }

    updateTimeLeft() {
        const now = new Date();
        const start = this.config.startDate;
        const end = this.config.endDate;

        // Si el evento aún no ha comenzado
        if (now < start) {
            const diff = start - now;
            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            if (this.elements.timeLeft) {
                this.elements.timeLeft.textContent = `Starts in ${days}d ${hours}h`;
            }
            return;
        }

        // Si el evento ha terminado
        if (now > end) {
            if (this.elements.timeLeft) {
                this.elements.timeLeft.textContent = 'Event Ended';
            }
            return;
        }

        // Evento activo - mostrar tiempo restante
        const diff = end - now;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        
        if (this.elements.timeLeft) {
            if (days > 0) {
                this.elements.timeLeft.textContent = `${days}d ${hours}h left`;
            } else if (hours > 0) {
                this.elements.timeLeft.textContent = `${hours}h ${minutes}m left`;
            } else {
                this.elements.timeLeft.textContent = `${minutes}m left`;
            }
        }
    }

    updateStats() {
        if (this.elements.totalEarnings) {
            this.elements.totalEarnings.textContent = `${this.userState.totalEarned} RSK`;
        }
    }

    startTimers() {
        // Update time left every hour
        setInterval(() => {
            this.updateTimeLeft();
        }, 60 * 60 * 1000);

        // Check mining progress every minute
        setInterval(() => {
            this.checkMiningProgress();
        }, 60 * 1000);

        // Update referral progress every 5 minutes
        setInterval(() => {
            this.updateReferralProgress();
        }, 5 * 60 * 1000);

        // Load community milestones every 10 minutes
        setInterval(() => {
            this.loadCommunityMilestones();
        }, 10 * 60 * 1000);

        // Initial load
        this.loadCommunityMilestones();
    }

    async loadCommunityMilestones() {
        try {
            const response = await fetch('/api/christmas-event/community-stats');
            if (response.ok) {
                const data = await response.json();
                
                // Update Telegram milestone
                const telegramMilestone = data.milestones?.telegram1000;
                if (telegramMilestone) {
                    const progress = (telegramMilestone.current / telegramMilestone.target) * 100;
                    const milestoneEl = document.querySelector('[data-community="telegram-1000"]');
                    
                    if (milestoneEl) {
                        const progressBar = milestoneEl.querySelector('.progress-fill-small');
                        const progressText = milestoneEl.querySelector('.progress-text');
                        
                        if (progressBar) {
                            progressBar.style.width = `${Math.min(progress, 100)}%`;
                        }
                        
                        if (progressText) {
                            progressText.textContent = `${telegramMilestone.current}/${telegramMilestone.target}`;
                        }
                        
                        if (telegramMilestone.completed) {
                            milestoneEl.classList.add('completed');
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Error loading community milestones:', error);
        }

    }

    async loadSavedState() {
        // Verificar si el evento está activo primero
        if (!this.isEventActive()) {
            console.warn('⚠️ Event is not active. Current date:', new Date(), 'Start:', this.config.startDate, 'End:', this.config.endDate);
        }

        const supabase = window.supabaseIntegration;
        
        // Cargar desde localStorage primero (fallback rápido)
        try {
            const saved = localStorage.getItem('christmas_event_state');
            if (saved) {
                const parsed = JSON.parse(saved);
                // Solo cargar si el evento está activo o si hay datos previos
                if (this.isEventActive() || parsed.totalEarned > 0) {
                    this.userState = { ...this.userState, ...parsed };
                }
            }
        } catch (error) {
            console.error('Error loading from localStorage:', error);
        }

        // Si el usuario está autenticado, cargar desde la base de datos
        if (supabase?.user?.isAuthenticated) {
            try {
                const response = await fetch(`/api/christmas-event/user-stats/${supabase.user.id}`, {
                    headers: {
                        'Authorization': `Bearer ${supabase.user.token || supabase.config.anonKey}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    
                    // Actualizar regalos
                    if (data.gifts && Array.isArray(data.gifts)) {
                        data.gifts.forEach(gift => {
                            const giftId = gift.gift_id;
                            if (this.userState.gifts[giftId]) {
                                this.userState.gifts[giftId] = {
                                    unlocked: gift.unlocked || false,
                                    claimed: gift.claimed || false
                                };
                            }
                        });
                    }
                    
                    // Actualizar referidos
                    this.userState.referrals.count = data.referralCount || 0;
                    
                    // Actualizar desafíos
                    if (data.challenges && Array.isArray(data.challenges)) {
                        data.challenges.forEach(challenge => {
                            const challengeId = challenge.challenge_id;
                            if (this.userState.challenges[challengeId]) {
                                this.userState.challenges[challengeId] = {
                                    progress: challenge.progress || 0,
                                    completed: challenge.completed || false,
                                    claimed: challenge.claimed || false,
                                    lastReset: challenge.last_updated || null
                                };
                            }
                        });
                    }
                    
                    // Actualizar total ganado
                    this.userState.totalEarned = data.totalEarned || 0;
                    
                    // Guardar en localStorage
                    this.saveState();
                }
            } catch (error) {
                console.error('Error loading from database:', error);
                // Continuar con datos de localStorage si hay error
            }
        }
    }

    saveState() {
        try {
            localStorage.setItem('christmas_event_state', JSON.stringify(this.userState));
        } catch (error) {
            console.error('Error saving state:', error);
        }
    }

    showNotification(message, type = 'info') {
        if (window.NotificationSystem) {
            window.NotificationSystem.show(message, type);
        } else {
            console.log(`[${type.toUpperCase()}] ${message}`);
        }
    }
}

// Inicializar cuando DOM esté listo
let christmasEvent = null;

function initializeChristmasEvent() {
    if (!christmasEvent) {
        christmasEvent = new ChristmasEvent();
        window.christmasEvent = christmasEvent; // Para debugging
    }
}

// Auto-inicialización deshabilitada - Solo se inicializará cuando se cargue explícitamente desde una página de eventos
// if (document.readyState === 'loading') {
//     document.addEventListener('DOMContentLoaded', initializeChristmasEvent);
// } else {
//     initializeChristmasEvent();
// }

// Función para inicializar manualmente desde una página de eventos
window.initializeChristmasEvent = initializeChristmasEvent;
window.ChristmasEvent = ChristmasEvent;


