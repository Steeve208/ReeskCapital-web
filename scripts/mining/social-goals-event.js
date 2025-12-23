// ===== SOCIAL MEDIA GOALS EVENT =====
// Community growth tracking and rewards system

class SocialGoalsEvent {
    constructor() {
        // Event configuration
        this.config = {
            startDate: new Date('2025-12-13T00:00:00'),  // December 13, 2025
            endDate: new Date('2026-03-13T09:00:00')     // March 13, 2026 at 09:00 (3 months + 9 hours)
        };

        // Social platforms data
        this.platforms = {
            youtube: {
                name: 'YouTube',
                icon: 'fab fa-youtube',
                color: '#FF0000',
                current: 0,  // Current subscribers
                label: 'Subscribers',
                link: 'https://youtube.com/@rscchain?si=q6UGp29sDIDnSPKj',  // YouTube channel link
                linkText: 'Subscribe',
                milestones: [
                    { target: 100, reward: 25, claimed: false },
                    { target: 500, reward: 50, claimed: false },
                    { target: 1000, reward: 100, claimed: false },
                    { target: 5000, reward: 250, claimed: false },
                    { target: 10000, reward: 500, claimed: false }
                ]
            },
            x: {
                name: 'X (Twitter)',
                icon: 'fab fa-x-twitter',
                color: '#000000',
                current: 2000,  // Current followers
                label: 'Followers',
                link: 'https://x.com/Reeskcap',  // X profile link
                linkText: 'Follow',
                milestones: [
                    { target: 2500, reward: 25, claimed: false },
                    { target: 5000, reward: 50, claimed: false },
                    { target: 10000, reward: 100, claimed: false },
                    { target: 25000, reward: 250, claimed: false },
                    { target: 50000, reward: 500, claimed: false }
                ]
            },
            telegram: {
                name: 'Telegram',
                icon: 'fab fa-telegram',
                color: '#0088cc',
                current: 2017,  // Current members (from web search)
                label: 'Members',
                link: 'https://t.me/RSCchain',  // Telegram group link
                linkText: 'Join',
                milestones: [
                    { target: 2500, reward: 25, claimed: false },
                    { target: 5000, reward: 50, claimed: false },
                    { target: 10000, reward: 100, claimed: false },
                    { target: 25000, reward: 250, claimed: false },
                    { target: 50000, reward: 500, claimed: false }
                ]
            },
            discord: {
                name: 'Discord',
                icon: 'fab fa-discord',
                color: '#5865F2',
                current: 260,  // Current members
                label: 'Members',
                link: 'https://discord.gg/dJjJ4N3dC',  // Discord server link
                linkText: 'Join Server',
                milestones: [
                    { target: 500, reward: 25, claimed: false },
                    { target: 1000, reward: 50, claimed: false },
                    { target: 2500, reward: 100, claimed: false },
                    { target: 5000, reward: 250, claimed: false },
                    { target: 10000, reward: 500, claimed: false }
                ]
            }
        };

        this.initialized = false;
    }

    async initialize() {
        console.log('🎯 Initializing Social Goals Event...');

        try {
            await this.waitForDOM();
            await this.loadMetricsFromAdmin(); // Load from admin panel
            this.loadState();
            this.renderPlatforms();
            this.updateTimeLeft();
            this.setupAutoUpdate();

            this.initialized = true;
            console.log('✅ Social Goals Event initialized');
            this.showNotification('🎯 Social Goals Event Active!', 'success');

        } catch (error) {
            console.error('❌ Error initializing Social Goals Event:', error);
        }
    }

    async loadMetricsFromAdmin() {
        try {
            // First try to load from localStorage (admin updates)
            const adminMetrics = localStorage.getItem('social_metrics_admin');
            
            if (adminMetrics) {
                const metrics = JSON.parse(adminMetrics);
                console.log('📊 Cargando métricas desde admin panel:', metrics);
                
                // Update platform counts
                if (metrics.youtube !== undefined) this.platforms.youtube.current = metrics.youtube;
                if (metrics.x !== undefined) this.platforms.x.current = metrics.x;
                if (metrics.telegram !== undefined) this.platforms.telegram.current = metrics.telegram;
                if (metrics.discord !== undefined) this.platforms.discord.current = metrics.discord;
                
                console.log('✅ Métricas actualizadas desde admin');
            } else {
                console.log('ℹ️ No hay métricas del admin, usando valores por defecto');
            }
            
            // TODO: En producción, cargar desde Supabase
            // const { data, error } = await supabase
            //     .from('metrics')
            //     .select('*')
            //     .eq('category', 'social');
            
        } catch (error) {
            console.error('Error loading metrics from admin:', error);
        }
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

    renderPlatforms() {
        const container = document.getElementById('socialPlatformsGrid');
        if (!container) return;

        container.innerHTML = '';

        Object.entries(this.platforms).forEach(([key, platform]) => {
            const card = this.createPlatformCard(key, platform);
            container.appendChild(card);
        });
    }

    createPlatformCard(key, platform) {
        const card = document.createElement('div');
        card.className = 'platform-card';
        card.setAttribute('data-platform', key);

        card.innerHTML = `
            <div class="platform-header">
                <div class="platform-icon" style="color: ${platform.color}">
                    <i class="${platform.icon}"></i>
                </div>
                <div class="platform-info">
                    <h3>${platform.name}</h3>
                    <p class="platform-subscribers">
                        <span class="current-count">${platform.current.toLocaleString()}</span>
                        <span class="platform-label">${platform.label}</span>
                    </p>
                </div>
            </div>
            
            <!-- Call to Action Button -->
            <a href="${platform.link}" target="_blank" rel="noopener noreferrer" class="platform-cta-btn" style="background: ${platform.color}">
                <i class="${platform.icon}"></i>
                <span>${platform.linkText}</span>
                <i class="fas fa-external-link-alt"></i>
            </a>
            
            <div class="platform-milestones" id="${key}Milestones">
                ${this.renderMilestones(key, platform)}
            </div>
        `;

        return card;
    }

    renderMilestones(platformKey, platform) {
        return platform.milestones.map((milestone, index) => {
            const progress = Math.min((platform.current / milestone.target) * 100, 100);
            const isReached = platform.current >= milestone.target;
            const isClaimed = milestone.claimed;

            return `
                <div class="milestone-item ${isReached ? 'reached' : ''} ${isClaimed ? 'claimed' : ''}">
                    <div class="milestone-header">
                        <span class="milestone-target">
                            <i class="fas fa-trophy"></i>
                            ${milestone.target.toLocaleString()} ${platform.label}
                        </span>
                        <span class="milestone-reward">
                            ${milestone.reward} RSK
                        </span>
                    </div>
                    <div class="milestone-progress">
                        <div class="milestone-progress-bar" style="width: ${progress}%"></div>
                        <span class="milestone-progress-text">${progress.toFixed(1)}%</span>
                    </div>
                    <div class="milestone-status">
                        ${isClaimed 
                            ? '<span class="status-claimed"><i class="fas fa-check-circle"></i> Claimed</span>'
                            : isReached
                                ? `<button class="claim-milestone-btn" data-platform="${platformKey}" data-index="${index}">
                                     <i class="fas fa-gift"></i> Claim Reward
                                   </button>`
                                : `<span class="status-progress">${platform.current.toLocaleString()} / ${milestone.target.toLocaleString()}</span>`
                        }
                    </div>
                </div>
            `;
        }).join('');
    }

    setupAutoUpdate() {
        // Update time left every minute
        setInterval(() => this.updateTimeLeft(), 60000);

        // Setup claim button listeners
        document.addEventListener('click', (e) => {
            if (e.target.closest('.claim-milestone-btn')) {
                const btn = e.target.closest('.claim-milestone-btn');
                const platform = btn.dataset.platform;
                const index = parseInt(btn.dataset.index);
                this.claimMilestone(platform, index);
            }
        });

        // Escuchar actualizaciones en tiempo real desde el admin panel
        window.addEventListener('socialMetricsUpdated', (e) => {
            console.log('📡 Actualización recibida del admin:', e.detail);
            const { platform, value } = e.detail;
            if (this.platforms[platform]) {
                this.platforms[platform].current = value;
                this.renderPlatforms();
                this.saveState();
                this.showNotification(`📊 ${this.platforms[platform].name} actualizado: ${value.toLocaleString()}`, 'info');
            }
        });

        // Escuchar cambios en localStorage (para cuando admin está en otra pestaña)
        window.addEventListener('storage', (e) => {
            if (e.key === 'social_metrics_admin') {
                console.log('📡 Cambio detectado en localStorage');
                this.loadMetricsFromAdmin();
                this.renderPlatforms();
            }
        });

        // Check for updates every minute (más frecuente)
        setInterval(() => {
            this.checkForUpdates();
        }, 60 * 1000);
    }

    async claimMilestone(platformKey, milestoneIndex) {
        const platform = this.platforms[platformKey];
        const milestone = platform.milestones[milestoneIndex];

        if (milestone.claimed) {
            this.showNotification('You already claimed this reward', 'warning');
            return;
        }

        if (platform.current < milestone.target) {
            this.showNotification('Milestone not reached yet', 'warning');
            return;
        }

        try {
            // Mark as claimed
            milestone.claimed = true;

            // Add reward to user balance
            const supabase = window.supabaseIntegration;
            if (supabase?.user?.isAuthenticated) {
                await supabase.addBalance(milestone.reward);
            }

            this.showNotification(`🎉 You claimed ${milestone.reward} RSK from ${platform.name}!`, 'success');
            this.saveState();
            this.renderPlatforms();

            console.log(`✅ Milestone claimed: ${platformKey} - ${milestone.target} = ${milestone.reward} RSK`);

        } catch (error) {
            // Revert claim on error
            milestone.claimed = false;
            console.error('Error claiming milestone:', error);
            this.showNotification('Error claiming reward', 'error');
        }
    }

    async checkForUpdates() {
        // Check for updates from admin panel
        console.log('🔄 Checking for social media updates...');
        
        try {
            await this.loadMetricsFromAdmin();
            this.renderPlatforms();
            console.log('✅ Métricas actualizadas automáticamente');
        } catch (error) {
            console.error('Error checking updates:', error);
        }
        
        // In production, this would also call an API to get real follower counts
        // Example:
        // const response = await fetch('/api/social-media/counts');
        // const data = await response.json();
        // this.updateCounts(data);
    }

    updateCounts(data) {
        // Update platform counts from API
        Object.entries(data).forEach(([key, count]) => {
            if (this.platforms[key]) {
                this.platforms[key].current = count;
            }
        });

        this.renderPlatforms();
        this.saveState();
    }

    updateTimeLeft() {
        const el = document.getElementById('socialGoalsTimeLeft');
        if (!el) return;

        const now = new Date();
        const end = this.config.endDate;
        const diff = end - now;

        if (diff <= 0) {
            el.textContent = 'Event ended';
            return;
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

        el.textContent = `${days}d ${hours}h remaining`;
    }

    loadState() {
        try {
            const saved = localStorage.getItem('social_goals_event_state');
            if (saved) {
                const data = JSON.parse(saved);
                
                // Load claimed milestones
                Object.entries(data.platforms || {}).forEach(([key, platformData]) => {
                    if (this.platforms[key]) {
                        this.platforms[key].milestones.forEach((milestone, index) => {
                            if (platformData.milestones[index]) {
                                milestone.claimed = platformData.milestones[index].claimed || false;
                            }
                        });
                    }
                });

                console.log('📁 State loaded:', data);
            }
        } catch (error) {
            console.error('Error loading state:', error);
        }
    }

    saveState() {
        try {
            const data = {
                platforms: {}
            };

            Object.entries(this.platforms).forEach(([key, platform]) => {
                data.platforms[key] = {
                    current: platform.current,
                    milestones: platform.milestones.map(m => ({
                        target: m.target,
                        reward: m.reward,
                        claimed: m.claimed
                    }))
                };
            });

            localStorage.setItem('social_goals_event_state', JSON.stringify(data));
        } catch (error) {
            console.error('Error saving state:', error);
        }
    }

    showNotification(message, type = 'info', duration = 3000) {
        // Use existing notification system if available
        if (window.showNotification) {
            window.showNotification(message, type);
            return;
        }

        // Fallback notification
        console.log(`[${type.toUpperCase()}] ${message}`);
        
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : type === 'warning' ? '#f59e0b' : '#3b82f6'};
            color: white;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, duration);
    }
}

// Auto-inicialización deshabilitada - Solo se inicializará cuando se cargue explícitamente desde una página de eventos
// document.addEventListener('DOMContentLoaded', () => {
//     window.socialGoalsEvent = new SocialGoalsEvent();
//     window.socialGoalsEvent.initialize();
// });

// Función para inicializar manualmente desde una página de eventos
window.initializeSocialGoalsEvent = function() {
    if (!window.socialGoalsEvent) {
        window.socialGoalsEvent = new SocialGoalsEvent();
        window.socialGoalsEvent.initialize();
    }
};

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SocialGoalsEvent;
}

