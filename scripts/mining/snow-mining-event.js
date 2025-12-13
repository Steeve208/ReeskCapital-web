/**
 * ❄️ SNOW MINING EVENT - VERSION FUNCIONAL
 * Sistema de minería especial con bonificadores navideños
 */

class SnowMiningEvent {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        
        this.items = [];
        this.snowflakes = [];
        this.particles = [];

        this.collection = {
            snowflakes: 0,
            bells: 0,
            gifts: 0,
            santa: 0
        };

        this.totalCollected = 0;
        this.multiplier = 1.0;
        this.bonusTimeLeft = 0;
        this.totalEarned = 0;
        this.claimedRewards = [];
        
        // Cooldown para bonus aleatorio
        this.lastBonusTime = 0;
        this.bonusCooldown = 15 * 60 * 1000; // 15 minutos en milisegundos

        this.itemTypes = [
            { emoji: '❄️', type: 'snowflakes', multiplier: 1.02, name: 'Snowflake', rarity: 0.65 },      // 65% - Very Common - +2%
            { emoji: '🔔', type: 'bells', multiplier: 1.12, name: 'Bell', rarity: 0.25 },                // 25% - Common - +12%
            { emoji: '🎁', type: 'gifts', multiplier: 1.85, name: 'Gift', rarity: 0.08 },                // 8% - Rare - +85%
            { emoji: '🎅', type: 'santa', multiplier: 3.0, name: 'Santa Claus', rarity: 0.02 }           // 2% - ULTRA RARE - +200%
        ];

        this.collectionRewards = {
            50: 5,      // 50 items = 5 RSK (muy difícil)
            100: 15,    // 100 items = 15 RSK (extremadamente difícil)
            250: 30,    // 250 items = 30 RSK (casi imposible)
            500: 50     // 500 items = 50 RSK (legendary)
        };

        this.config = {
            startDate: new Date('2025-12-13'),  // December 13, 2025
            endDate: new Date('2026-01-03')     // January 3, 2026
        };

        this.isActive = false;
        this.isMining = false;
    }

    async initialize() {
        console.log('❄️ Inicializando Snow Mining Event...');

        try {
            await this.waitForDOM();
            this.setupCanvas();
            this.setupEvents();
            this.loadState();
            
            // Verificar si la minería ya está activa
            this.checkMiningStatus();
            
            this.start();
            this.updateUI();
            
            this.isActive = true;
            console.log('✅ Snow Mining Event inicializado correctamente');
            this.showNotification('❄️ Snow Mining Event activated!', 'success');

        } catch (error) {
            console.error('❌ Error initializing Snow Mining Event:', error);
        }
    }

    checkMiningStatus() {
        // Verificar si hay una sesión de minería activa
        const supabase = window.supabaseIntegration;
        if (supabase?.miningSession?.isActive) {
            this.isMining = true;
            console.log('⛏️ Mining already active on load');
        }
        
        // Verificar por localStorage también
        const miningSession = localStorage.getItem('rsc_mining_session');
        if (miningSession) {
            try {
                const session = JSON.parse(miningSession);
                const now = new Date();
                const startTime = new Date(session.startTime);
                const elapsed = now - startTime;
                const duration = 24 * 60 * 60 * 1000; // 24 horas
                
                if (elapsed < duration) {
                    this.isMining = true;
                    console.log('⛏️ Mining session detected in localStorage');
                }
            } catch (error) {
                console.error('Error verifying session:', error);
            }
        }
        
        // Verificar botones visibles
        const stopBtn = document.getElementById('stopMiningBtn');
        if (stopBtn && stopBtn.style.display !== 'none') {
            this.isMining = true;
            console.log('⛏️ Mining detected by UI buttons');
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

    setupCanvas() {
        this.canvas = document.getElementById('snowCanvas');
        if (!this.canvas) {
            console.error('❌ Canvas no encontrado');
            return;
        }

        this.ctx = this.canvas.getContext('2d');
        this.resizeCanvas();
        
        window.addEventListener('resize', () => this.resizeCanvas());
        
        console.log('✅ Canvas configurado:', this.canvas.width, 'x', this.canvas.height);
    }

    resizeCanvas() {
        if (!this.canvas) return;
        this.canvas.width = this.canvas.offsetWidth;
        this.canvas.height = this.canvas.offsetHeight;
    }

    setupEvents() {
        // Click en canvas para colectar items
        if (this.canvas) {
            this.canvas.addEventListener('click', (e) => {
                const rect = this.canvas.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                this.handleClick(x, y);
            });
        }

        // Botón de activar bonus
        const activateBtn = document.getElementById('activateBonusBtn');
        if (activateBtn) {
            activateBtn.addEventListener('click', () => this.activateRandomBonus());
        }

        // Botones de reclamar recompensas
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('claim-reward-btn')) {
                const amount = parseInt(e.target.dataset.amount);
                this.claimCollectionReward(amount);
            }
        });

        // Escuchar eventos de minería
        window.addEventListener('miningStateChanged', (e) => {
            this.isMining = e.detail.isMining;
            if (this.isMining) {
                console.log('⛏️ Mining started - Spawning items');
                setTimeout(() => this.spawnItem(), 500);
                setTimeout(() => this.spawnItem(), 2000);
            }
        });
    }

    start() {
        console.log('🎬 Iniciando animaciones...');

        // Nieve de fondo
        setInterval(() => this.spawnSnowflake(), 100);
        
        // Items especiales - Durante minería activa, cada 6 segundos
        setInterval(() => {
            if (this.isMining && Math.random() < 0.5) {  // 50% de probabilidad cada 6 segundos
                this.spawnItem();
            }
        }, 6000);

        // Spawn demo - Cuando NO está minando, cada 8 segundos
        setInterval(() => {
            if (!this.isMining && Math.random() < 0.4) {  // 40% probabilidad cada 8 segundos
                this.spawnItem();
            }
        }, 8000);

        // Spawn inicial (dos items para empezar)
        setTimeout(() => this.spawnItem(), 2000);
        setTimeout(() => this.spawnItem(), 4000);
        
        // Loop de render
        this.render();
        
        // Timer de bonus - 15 segundos
        setInterval(() => {
            if (this.bonusTimeLeft > 0) {
                this.bonusTimeLeft--;
                if (this.bonusTimeLeft === 0) {
                    this.multiplier = 1.0;
                    this.showNotification('❄️ Bonus expired', 'info');
                }
                this.updateUI();
            }
            
            // Actualizar botón de bonus cada segundo
            this.updateBonusButton();
        }, 1000);

        // Actualizar tiempo restante
        setInterval(() => this.updateTimeLeft(), 60000);
        this.updateTimeLeft();
        
        // Verificar estado de minería cada 5 segundos
        setInterval(() => {
            this.checkMiningStatus();
        }, 5000);

        console.log('✅ Animaciones iniciadas - Sistema de rareza activo');
    }

    spawnSnowflake() {
        if (!this.canvas) return;

        this.snowflakes.push({
            x: Math.random() * this.canvas.width,
            y: -10,
            size: Math.random() * 3 + 1,
            speed: Math.random() * 1 + 0.5,
            drift: (Math.random() - 0.5) * 0.5,
            opacity: Math.random() * 0.5 + 0.3
        });

        if (this.snowflakes.length > 100) {
            this.snowflakes.shift();
        }
    }

    spawnItem() {
        if (!this.canvas) return;

        // Sistema de rareza - items con menos bonus son más comunes
        const rand = Math.random();
        let cumulative = 0;
        let selectedItem = this.itemTypes[0];

        for (const item of this.itemTypes) {
            cumulative += item.rarity;
            if (rand <= cumulative) {
                selectedItem = item;
                break;
            }
        }

        // Todos los items caen a velocidad normal
        this.items.push({
            x: Math.random() * (this.canvas.width - 60) + 30,
            y: -50,
            size: 45,
            speed: Math.random() * 1.5 + 1.2,  // Velocidad normal para todos
            rotation: 0,
            rotationSpeed: (Math.random() - 0.5) * 0.05,
            ...selectedItem
        });

        console.log('✨ Item spawned:', selectedItem.name, `(${Math.round(selectedItem.rarity * 100)}% prob, +${Math.round((selectedItem.multiplier - 1) * 100)}%)`);
    }

    handleClick(x, y) {
        for (let i = this.items.length - 1; i >= 0; i--) {
            const item = this.items[i];
            const distance = Math.sqrt(
                Math.pow(x - item.x, 2) + Math.pow(y - item.y, 2)
            );

            if (distance < item.size / 2) {
                this.collectItem(item);
                this.items.splice(i, 1);
                break;
            }
        }
    }

    collectItem(item) {
        // Incrementar colección
        this.collection[item.type]++;
        this.totalCollected++;

        // Aplicar multiplicador - MÁS CORTO (solo 15 segundos)
        this.multiplier = item.multiplier;
        this.bonusTimeLeft = 15;  // Reducido de 30 a 15 segundos

        // Crear partículas
        this.createParticles(item.x, item.y, item.emoji);

        // Guardar estado
        this.saveState();

        // Actualizar UI
        this.updateUI();

        // Notificar
        const bonus = Math.round((item.multiplier - 1) * 100);
        this.showNotification(`❄️ ${item.name}! +${bonus}% mining x15s`, 'success');

        // Verificar recompensas
        this.checkCollectionRewards();

        // Aplicar multiplicador a minería si está activa
        if (this.isMining) {
            this.applyMiningMultiplier();
        }
    }

    createParticles(x, y, emoji) {
        for (let i = 0; i < 10; i++) {
            const angle = (Math.PI * 2 * i) / 10;
            const speed = Math.random() * 3 + 2;
            
            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: Math.random() * 4 + 2,
                life: 60,
                emoji: emoji
            });
        }
    }

    render() {
        if (!this.ctx || !this.canvas) {
            requestAnimationFrame(() => this.render());
            return;
        }

        // Limpiar canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Dibujar nieve de fondo
        this.snowflakes.forEach((flake, index) => {
            this.ctx.fillStyle = `rgba(255, 255, 255, ${flake.opacity})`;
            this.ctx.beginPath();
            this.ctx.arc(flake.x, flake.y, flake.size, 0, Math.PI * 2);
            this.ctx.fill();

            flake.y += flake.speed;
            flake.x += flake.drift;

            if (flake.y > this.canvas.height) {
                this.snowflakes.splice(index, 1);
            }
        });

        // Dibujar partículas
        this.particles.forEach((particle, index) => {
            this.ctx.font = `${particle.size * 3}px Arial`;
            this.ctx.globalAlpha = particle.life / 60;
            this.ctx.fillText(particle.emoji, particle.x, particle.y);
            this.ctx.globalAlpha = 1;

            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.vy += 0.2;
            particle.life--;

            if (particle.life <= 0) {
                this.particles.splice(index, 1);
            }
        });

        // Dibujar items
        this.items.forEach((item, index) => {
            this.ctx.save();
            this.ctx.translate(item.x, item.y);
            this.ctx.rotate(item.rotation);

            // Sombra
            this.ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
            this.ctx.shadowBlur = 15;
            this.ctx.shadowOffsetY = 5;

            // Emoji
            this.ctx.font = `${item.size}px Arial`;
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(item.emoji, 0, 0);

            this.ctx.restore();

            // Actualizar
            item.y += item.speed;
            item.rotation += item.rotationSpeed;

            // Remover si sale
            if (item.y > this.canvas.height + 50) {
                this.items.splice(index, 1);
            }
        });

        requestAnimationFrame(() => this.render());
    }

    activateRandomBonus() {
        const now = Date.now();
        const timeLeft = this.lastBonusTime + this.bonusCooldown - now;
        
        // Verificar cooldown
        if (timeLeft > 0) {
            const minutesLeft = Math.ceil(timeLeft / 60000);
            this.showNotification(
                `⏰ You must wait ${minutesLeft} minutes to use random bonus`, 
                'warning'
            );
            return;
        }
        
        // Verificar que esté minando
        if (!this.isMining) {
            this.showNotification('⛏️ You must be mining to use random bonus', 'warning');
            return;
        }
        
        // Verificar que haya colectado al menos 5 items
        if (this.totalCollected < 5) {
            this.showNotification('❄️ You must collect at least 5 items first', 'warning');
            return;
        }

        // Activar bonus
        const itemType = this.itemTypes[Math.floor(Math.random() * this.itemTypes.length)];
        this.collectItem({
            ...itemType,
            x: this.canvas.width / 2,
            y: this.canvas.height / 2
        });
        
        // Actualizar último uso
        this.lastBonusTime = now;
        this.saveState();
        
        // Actualizar botón
        this.updateBonusButton();
    }

    applyMiningMultiplier() {
        const event = new CustomEvent('snowBonusActive', {
            detail: {
                multiplier: this.multiplier,
                timeLeft: this.bonusTimeLeft
            }
        });
        window.dispatchEvent(event);
    }

    checkCollectionRewards() {
        const milestones = Object.keys(this.collectionRewards).map(Number).sort((a, b) => a - b);
        
        for (const milestone of milestones) {
            if (this.totalCollected >= milestone && !this.claimedRewards.includes(milestone)) {
                this.showNotification(
                    `🎁 Reward available! ${milestone} items = ${this.collectionRewards[milestone]} RSK`,
                    'success',
                    8000
                );
                this.updateUI();
                break;
            }
        }
    }

    async claimCollectionReward(milestone) {
        if (this.claimedRewards.includes(milestone)) {
            this.showNotification('You already claimed this reward', 'warning');
            return;
        }

        if (this.totalCollected < milestone) {
            this.showNotification('You haven\'t reached this milestone yet', 'warning');
            return;
        }

        const reward = this.collectionRewards[milestone];

        // VERIFICACIÓN: Evitar duplicados
        if (this.claimedRewards.includes(milestone)) {
            console.warn('Intento de reclamar recompensa duplicada bloqueado');
            return;
        }

        try {
            // Marcar como reclamado ANTES de agregar el balance
            this.claimedRewards.push(milestone);
            this.saveState();

            const supabase = window.supabaseIntegration;
            if (supabase?.user?.isAuthenticated) {
                await supabase.addBalance(reward);
            }

            this.totalEarned += reward;

            this.showNotification(`🎉 You claimed ${reward} RSK!`, 'success');
            this.saveState();
            this.updateUI();

            console.log(`✅ Reward claimed: ${milestone} items = ${reward} RSK`);

        } catch (error) {
            // Si falla, remover de reclamados
            const index = this.claimedRewards.indexOf(milestone);
            if (index > -1) {
                this.claimedRewards.splice(index, 1);
            }
            console.error('Error claiming reward:', error);
            this.showNotification('Error claiming reward', 'error');
        }
    }

    updateUI() {
        // Multiplicador
        const multiplierEl = document.getElementById('currentMultiplier');
        if (multiplierEl) {
            multiplierEl.textContent = this.bonusTimeLeft > 0 
                ? `${this.multiplier.toFixed(1)}x (${this.bonusTimeLeft}s)` 
                : '1.0x';
            
            if (this.bonusTimeLeft > 0) {
                multiplierEl.classList.add('active');
            } else {
                multiplierEl.classList.remove('active');
            }
        }

        // Total colectado
        const collectedEl = document.getElementById('totalCollected');
        if (collectedEl) {
            collectedEl.textContent = this.totalCollected;
        }

        // Contadores individuales
        const snowflakesEl = document.getElementById('snowflakeCount');
        const bellsEl = document.getElementById('bellCount');
        const giftsEl = document.getElementById('giftCount');
        const starsEl = document.getElementById('starCount');
        const earnedEl = document.getElementById('snowEarned');

        if (snowflakesEl) snowflakesEl.textContent = this.collection.snowflakes || 0;
        if (bellsEl) bellsEl.textContent = this.collection.bells || 0;
        if (giftsEl) giftsEl.textContent = this.collection.gifts || 0;
        if (starsEl) starsEl.textContent = this.collection.santa || 0;  // Santa Claus
        if (earnedEl) earnedEl.textContent = `${this.totalEarned} RSK`;

        // Colección grid
        this.renderCollectionGrid();

        // Recompensas
        this.renderRewards();
        
        // Actualizar botón de bonus
        this.updateBonusButton();
    }

    updateBonusButton() {
        const btn = document.getElementById('activateBonusBtn');
        if (!btn) return;

        const now = Date.now();
        const timeLeft = this.lastBonusTime + this.bonusCooldown - now;

        if (timeLeft > 0) {
            // En cooldown
            const minutesLeft = Math.ceil(timeLeft / 60000);
            btn.disabled = true;
            btn.innerHTML = `<i class="fas fa-clock"></i> Wait ${minutesLeft}m`;
            btn.style.opacity = '0.5';
            btn.style.cursor = 'not-allowed';
        } else if (!this.isMining) {
            // No está minando
            btn.disabled = true;
            btn.innerHTML = `<i class="fas fa-exclamation-triangle"></i> Start mining first`;
            btn.style.opacity = '0.6';
            btn.style.cursor = 'not-allowed';
        } else if (this.totalCollected < 5) {
            // No tiene suficientes items
            btn.disabled = true;
            btn.innerHTML = `<i class="fas fa-lock"></i> Collect 5 items (${this.totalCollected}/5)`;
            btn.style.opacity = '0.6';
            btn.style.cursor = 'not-allowed';
        } else {
            // Disponible
            btn.disabled = false;
            btn.innerHTML = `<i class="fas fa-magic"></i> Activate Random Bonus`;
            btn.style.opacity = '1';
            btn.style.cursor = 'pointer';
        }
    }

    renderCollectionGrid() {
        const grid = document.getElementById('collectionGrid');
        if (!grid) return;

        const html = this.itemTypes.map(item => `
            <div class="collection-item">
                <div class="item-icon">${item.emoji}</div>
                <div class="item-name">${item.name}</div>
                <div class="item-count">${this.collection[item.type]}</div>
                <div class="item-bonus">+${Math.round((item.multiplier - 1) * 100)}%</div>
            </div>
        `).join('');

        grid.innerHTML = html;
    }

    renderRewards() {
        const container = document.getElementById('rewardsContainer');
        if (!container) return;

        const milestones = Object.keys(this.collectionRewards).map(Number).sort((a, b) => a - b);
        
        const html = milestones.map(milestone => {
            const reward = this.collectionRewards[milestone];
            const claimed = this.claimedRewards.includes(milestone);
            const canClaim = this.totalCollected >= milestone && !claimed;
            const progress = Math.min((this.totalCollected / milestone) * 100, 100);

            return `
                <div class="reward-item ${claimed ? 'claimed' : ''} ${canClaim ? 'available' : ''}">
                    <div class="reward-header">
                        <span class="reward-milestone">${milestone} Items</span>
                        <span class="reward-amount">${reward} RSK</span>
                    </div>
                    <div class="reward-progress">
                        <div class="reward-progress-bar" style="width: ${progress}%"></div>
                    </div>
                    <div class="reward-status">
                        ${claimed 
                            ? '<span class="status-claimed">✅ Claimed</span>'
                            : canClaim
                                ? `<button class="claim-reward-btn" data-amount="${milestone}">🎁 Claim</button>`
                                : `<span class="status-progress">${this.totalCollected}/${milestone}</span>`
                        }
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = html;
    }

    updateTimeLeft() {
        const el = document.getElementById('snowTimeLeft');
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

        el.textContent = `${days}d ${hours}h`;
    }

    loadState() {
        try {
            const saved = localStorage.getItem('snow_mining_event_state');
            if (saved) {
                const data = JSON.parse(saved);
                
                // Cargar colección con valores por defecto
                this.collection = {
                    snowflakes: data.collection?.snowflakes || 0,
                    bells: data.collection?.bells || 0,
                    gifts: data.collection?.gifts || 0,
                    santa: data.collection?.santa || data.collection?.rsk || 0  // Compatibilidad con versión antigua
                };
                
                this.totalCollected = data.totalCollected || 0;
                this.totalEarned = data.totalEarned || 0;
                this.claimedRewards = data.claimedRewards || [];
                this.lastBonusTime = data.lastBonusTime || 0;
                console.log('📁 State loaded:', data);
            }
        } catch (error) {
            console.error('Error loading state:', error);
        }
    }

    saveState() {
        try {
            const data = {
                collection: this.collection,
                totalCollected: this.totalCollected,
                totalEarned: this.totalEarned,
                claimedRewards: this.claimedRewards,
                lastBonusTime: this.lastBonusTime
            };
            localStorage.setItem('snow_mining_event_state', JSON.stringify(data));
        } catch (error) {
            console.error('Error saving state:', error);
        }
    }

    showNotification(message, type = 'info', duration = 3000) {
        if (window.NotificationSystem) {
            window.NotificationSystem.show(message, type, duration);
        } else {
            console.log(`[${type.toUpperCase()}] ${message}`);
        }
    }
}

// Inicializar
let snowMiningEvent = null;

function initializeSnowMiningEvent() {
    if (!snowMiningEvent) {
        snowMiningEvent = new SnowMiningEvent();
        snowMiningEvent.initialize();
        window.snowMiningEvent = snowMiningEvent;
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeSnowMiningEvent);
} else {
    initializeSnowMiningEvent();
}

window.SnowMiningEvent = SnowMiningEvent;
