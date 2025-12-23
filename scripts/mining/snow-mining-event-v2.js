/**
 * ❄️ SNOW MINING EVENT v2.0 - ULTRA GAMIFICADO
 * Sistema de evento completamente rediseñado para máxima adicción y engagement
 * 
 * NUEVAS MECÁNICAS:
 * - Sistema de niveles y XP
 * - Combos y multiplicadores dinámicos
 * - Power-ups especiales
 * - Boss battles
 * - Misiones diarias
 * - Leaderboard competitivo
 * - Sistema de streak
 * - Mini-juegos
 * - Efectos visuales impactantes
 */

class SnowMiningEventV2 {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        
        // Sistema de progresión
        this.level = 1;
        this.xp = 0;
        this.xpToNextLevel = 100;
        this.totalXP = 0;
        
        // Sistema de juego
        this.items = [];
        this.powerUps = [];
        this.bosses = [];
        this.particles = [];
        this.explosions = [];
        this.snowflakes = [];
        
        // Estadísticas
        this.stats = {
            itemsCollected: 0,
            combos: 0,
            maxCombo: 0,
            bossesDefeated: 0,
            perfectClicks: 0,
            streak: 0,
            maxStreak: 0,
            totalEarned: 0,
            playTime: 0
        };
        
        // Sistema de combos
        this.combo = 0;
        this.comboMultiplier = 1.0;
        this.comboTimer = 0;
        this.comboTimeLimit = 3000; // 3 segundos para mantener combo
        
        // Power-ups activos
        this.activePowerUps = {
            magnet: false,
            slowMotion: false,
            doubleXP: false,
            lucky: false,
            frenzy: false
        };
        
        // Sistema de energía/stamina
        this.energy = 100;
        this.maxEnergy = 100;
        this.energyRegenRate = 1; // por segundo
        
        // Misiones diarias
        this.dailyMissions = [];
        this.missionProgress = {};
        
        // Modo de juego actual
        this.gameMode = 'classic'; // classic, frenzy, boss, survival
        
        // Timing
        this.lastSpawn = 0;
        this.spawnInterval = 2000; // 2 segundos base
        this.difficulty = 1.0;
        
        // Items mejorados con más variedad
        // Valores ajustados: el máximo es 0.01 RSK
        this.itemTypes = [
            { 
                emoji: '❄️', 
                type: 'snowflake', 
                multiplier: 1.1, 
                xp: 5, 
                name: 'Copo de Nieve',
                rarity: 0.50,
                speed: 2,
                value: 0.001  // 0.001 RSK - más común, menos valor
            },
            { 
                emoji: '🔔', 
                type: 'bell', 
                multiplier: 1.25, 
                xp: 10, 
                name: 'Campana',
                rarity: 0.25,
                speed: 3,
                value: 0.003  // 0.003 RSK
            },
            { 
                emoji: '🎁', 
                type: 'gift', 
                multiplier: 1.5, 
                xp: 20, 
                name: 'Regalo',
                rarity: 0.15,
                speed: 4,
                value: 0.005  // 0.005 RSK
            },
            { 
                emoji: '⭐', 
                type: 'star', 
                multiplier: 2.0, 
                xp: 50, 
                name: 'Estrella',
                rarity: 0.08,
                speed: 5,
                value: 0.008  // 0.008 RSK
            },
            { 
                emoji: '💎', 
                type: 'diamond', 
                multiplier: 3.0, 
                xp: 100, 
                name: 'Diamante',
                rarity: 0.02,
                speed: 6,
                value: 0.01  // 0.01 RSK - máximo valor (más raro)
            }
        ];
        
        // Power-ups
        this.powerUpTypes = [
            {
                emoji: '🧲',
                type: 'magnet',
                name: 'Magnet',
                duration: 10000,
                rarity: 0.1,
                description: 'Atrae items automáticamente por 10s'
            },
            {
                emoji: '⏱️',
                type: 'slowMotion',
                name: 'Slow Motion',
                duration: 8000,
                rarity: 0.08,
                description: 'Ralentiza items por 8s'
            },
            {
                emoji: '⚡',
                type: 'doubleXP',
                name: 'Double XP',
                duration: 15000,
                rarity: 0.12,
                description: 'Doble XP por 15s'
            },
            {
                emoji: '🍀',
                type: 'lucky',
                name: 'Lucky',
                duration: 20000,
                rarity: 0.15,
                description: 'Mayor probabilidad de items raros'
            },
            {
                emoji: '🔥',
                type: 'frenzy',
                name: 'Frenzy',
                duration: 12000,
                rarity: 0.05,
                description: 'Items caen 3x más rápido'
            }
        ];
        
        // Bosses - Recompensas ajustadas proporcionalmente
        this.bossTypes = [
            {
                emoji: '🎅',
                name: 'Santa Boss',
                health: 10,
                reward: 0.05,  // 0.05 RSK (equivalente a 5 items comunes)
                xp: 200,
                spawnChance: 0.02,
                speed: 3
            },
            {
                emoji: '🦌',
                name: 'Reindeer Boss',
                health: 15,
                reward: 0.075,  // 0.075 RSK
                xp: 300,
                spawnChance: 0.015,
                speed: 4
            },
            {
                emoji: '❄️👑',
                name: 'Snow King',
                health: 20,
                reward: 0.1,  // 0.1 RSK (máximo para bosses)
                xp: 500,
                spawnChance: 0.01,
                speed: 5
            }
        ];
        
        // Recompensas por nivel
        this.levelRewards = {
            5: { rsc: 10, title: 'Novato' },
            10: { rsc: 25, title: 'Aprendiz' },
            15: { rsc: 50, title: 'Experto' },
            20: { rsc: 100, title: 'Maestro' },
            25: { rsc: 200, title: 'Leyenda' },
            30: { rsc: 500, title: 'Élite' }
        };
        
        // Configuración
        this.config = {
            startDate: new Date('2025-12-13'),
            endDate: new Date('2026-01-03')
        };
        
        this.isActive = false;
        this.isMining = false;
        this.isPaused = false;
        this.lastFrameTime = 0;
        this.animationFrame = null;
        this.spawnIntervalId = null;
    }
    
    async initialize() {
        console.log('❄️ Inicializando Snow Mining Event v2.0...');
        
        try {
            if (!this.isEventActive()) {
                console.log('⏸️ Evento no está activo');
                this.isActive = false;
                return;
            }
            
            await this.waitForDOM();
            this.setupCanvas();
            this.setupEvents();
            this.loadState();
            this.initializeDailyMissions();
            this.checkMiningStatus();
            
            // Inicializar nieve de fondo siempre
            this.initializeSnowflakes();
            
            this.start();
            this.updateUI();
            
            this.isActive = true;
            console.log('✅ Snow Mining Event v2.0 inicializado');
            this.showNotification('❄️ Snow Mining Event v2.0 activado!', 'success');
            
        } catch (error) {
            console.error('❌ Error inicializando evento:', error);
        }
    }
    
    isEventActive() {
        const now = new Date();
        return now >= this.config.startDate && now <= this.config.endDate;
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
        window.addEventListener('resize', () => {
            this.resizeCanvas();
            // Reinicializar nieve si el canvas cambia de tamaño
            if (this.snowflakes.length > 0) {
                this.initializeSnowflakes();
            }
        });
        
        console.log('✅ Canvas configurado:', this.canvas.width, 'x', this.canvas.height);
    }
    
    resizeCanvas() {
        if (!this.canvas) return;
        const rect = this.canvas.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
        console.log('📐 Canvas redimensionado:', this.canvas.width, 'x', this.canvas.height);
    }
    
    setupEvents() {
        if (!this.canvas) return;
        
        // Click en canvas
        this.canvas.addEventListener('click', (e) => this.handleCanvasClick(e));
        
        // Touch events para móvil
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const rect = this.canvas.getBoundingClientRect();
            this.handleClick(touch.clientX - rect.left, touch.clientY - rect.top);
        });
        
        // Escuchar cambios de minería
        window.addEventListener('miningStateChanged', (e) => {
            this.isMining = e.detail.isMining;
            if (this.isMining) {
                this.onMiningStart();
            } else {
                this.onMiningStop();
            }
        });
    }
    
    handleCanvasClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        this.handleClick(x, y);
    }
    
    handleClick(x, y) {
        if (this.energy < 5) {
            this.showNotification('⚡ Sin energía! Espera un momento...', 'warning');
            return;
        }
        
        this.energy = Math.max(0, this.energy - 5);
        
        // Verificar colisiones con items
        let itemHit = false;
        for (let i = this.items.length - 1; i >= 0; i--) {
            const item = this.items[i];
            const distance = Math.sqrt(
                Math.pow(x - item.x, 2) + Math.pow(y - item.y, 2)
            );
            
            if (distance < item.radius) {
                this.collectItem(item, i);
                itemHit = true;
                break;
            }
        }
        
        // Verificar colisiones con power-ups
        if (!itemHit) {
            for (let i = this.powerUps.length - 1; i >= 0; i--) {
                const powerUp = this.powerUps[i];
                const distance = Math.sqrt(
                    Math.pow(x - powerUp.x, 2) + Math.pow(y - powerUp.y, 2)
                );
                
                if (distance < powerUp.radius) {
                    this.collectPowerUp(powerUp, i);
                    itemHit = true;
                    break;
                }
            }
        }
        
        // Verificar colisiones con bosses
        if (!itemHit) {
            for (let i = this.bosses.length - 1; i >= 0; i--) {
                const boss = this.bosses[i];
                const distance = Math.sqrt(
                    Math.pow(x - boss.x, 2) + Math.pow(y - boss.y, 2)
                );
                
                if (distance < boss.radius) {
                    this.hitBoss(boss, i);
                    break;
                }
            }
        }
        
        // Si no golpeó nada, perder combo
        if (!itemHit) {
            this.breakCombo();
        }
    }
    
    collectItem(item, index) {
        // Calcular recompensa con combos
        const baseReward = item.value;
        const comboBonus = this.combo * 0.1;
        const reward = baseReward * (1 + comboBonus) * this.comboMultiplier;
        
        // Aplicar multiplicadores de power-ups
        if (this.activePowerUps.doubleXP) {
            this.addXP(item.xp * 2);
        } else {
            this.addXP(item.xp);
        }
        
        // Incrementar combo
        this.incrementCombo();
        
        // Actualizar estadísticas
        this.stats.itemsCollected++;
        this.stats.totalEarned += reward;
        
        // Efectos visuales
        this.createExplosion(item.x, item.y, item.emoji);
        this.createParticles(item.x, item.y, '#00ff88');
        this.showFloatingText(item.x, item.y, `+${reward.toFixed(2)} RSK`, '#00ff88');
        
        // Remover item
        this.items.splice(index, 1);
        
        // Aplicar multiplicador de minería
        this.applyMiningMultiplier(item.multiplier);
        
        // Actualizar UI
        this.updateUI();
        
        // Sonido (si está disponible)
        this.playSound('collect');
    }
    
    collectPowerUp(powerUp, index) {
        this.activatePowerUp(powerUp.type);
        this.createExplosion(powerUp.x, powerUp.y, powerUp.emoji);
        this.showFloatingText(powerUp.x, powerUp.y, powerUp.name, '#ffd700');
        this.powerUps.splice(index, 1);
        this.playSound('powerup');
    }
    
    hitBoss(boss, index) {
        boss.health--;
        this.createExplosion(boss.x, boss.y, '💥');
        
        if (boss.health <= 0) {
            // Boss derrotado
            const reward = boss.reward * this.comboMultiplier;
            this.addXP(boss.xp);
            this.stats.bossesDefeated++;
            this.stats.totalEarned += reward;
            
            this.createMegaExplosion(boss.x, boss.y);
            this.showFloatingText(boss.x, boss.y, `BOSS! +${reward} RSK`, '#ff0000');
            this.bosses.splice(index, 1);
            
            // Recompensa especial
            this.showLevelUpNotification(`¡${boss.name} derrotado! +${reward} RSK`);
            this.playSound('bossDefeat');
        } else {
            this.showFloatingText(boss.x, boss.y, `${boss.health} HP`, '#ff6b6b');
            this.playSound('hit');
        }
        
        this.updateUI();
    }
    
    incrementCombo() {
        this.combo++;
        this.comboTimer = this.comboTimeLimit;
        this.stats.maxCombo = Math.max(this.stats.maxCombo, this.combo);
        
        // Calcular multiplicador de combo
        if (this.combo >= 10) {
            this.comboMultiplier = 2.0;
        } else if (this.combo >= 5) {
            this.comboMultiplier = 1.5;
        } else {
            this.comboMultiplier = 1.0 + (this.combo * 0.1);
        }
        
        // Notificación de combo
        if (this.combo % 5 === 0) {
            this.showComboNotification(this.combo);
        }
    }
    
    breakCombo() {
        if (this.combo > 0) {
            this.stats.combos++;
            this.combo = 0;
            this.comboMultiplier = 1.0;
        }
    }
    
    activatePowerUp(type) {
        const powerUp = this.powerUpTypes.find(p => p.type === type);
        if (!powerUp) return;
        
        this.activePowerUps[type] = true;
        
        // Efectos según el power-up
        switch(type) {
            case 'magnet':
                this.startMagnetMode();
                break;
            case 'slowMotion':
                this.startSlowMotion();
                break;
            case 'doubleXP':
                // Ya manejado en collectItem
                break;
            case 'lucky':
                // Aumentar probabilidad de items raros
                break;
            case 'frenzy':
                this.startFrenzyMode();
                break;
        }
        
        // Desactivar después de la duración
        setTimeout(() => {
            this.activePowerUps[type] = false;
            this.showNotification(`${powerUp.name} expiró`, 'info');
        }, powerUp.duration);
        
        this.showNotification(`${powerUp.name} activado!`, 'success');
    }
    
    startMagnetMode() {
        // Los items se mueven hacia el cursor
        const magnetInterval = setInterval(() => {
            if (!this.activePowerUps.magnet) {
                clearInterval(magnetInterval);
                return;
            }
            
            // Mover items hacia el centro (simulado)
            this.items.forEach(item => {
                const dx = this.canvas.width / 2 - item.x;
                const dy = this.canvas.height / 2 - item.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance > 0) {
                    item.x += (dx / distance) * 2;
                    item.y += (dy / distance) * 2;
                }
            });
        }, 50);
    }
    
    startSlowMotion() {
        // Reducir velocidad de items
        const originalSpeed = this.items.map(item => item.speed);
        this.items.forEach((item, i) => {
            item.speed = originalSpeed[i] * 0.3;
        });
        
        setTimeout(() => {
            this.items.forEach((item, i) => {
                item.speed = originalSpeed[i];
            });
        }, 8000);
    }
    
    startFrenzyMode() {
        // Aumentar spawn rate
        this.spawnInterval = 500; // Items cada 0.5 segundos
        
        setTimeout(() => {
            this.spawnInterval = 2000;
        }, 12000);
    }
    
    addXP(amount) {
        this.xp += amount;
        this.totalXP += amount;
        
        // Verificar level up
        while (this.xp >= this.xpToNextLevel) {
            this.xp -= this.xpToNextLevel;
            this.levelUp();
        }
        
        this.updateUI();
    }
    
    levelUp() {
        this.level++;
        this.xpToNextLevel = Math.floor(100 * Math.pow(1.2, this.level - 1));
        
        // Recompensa por nivel
        const reward = this.levelRewards[this.level];
        if (reward) {
            this.stats.totalEarned += reward.rsc;
            this.showLevelUpNotification(`¡Nivel ${this.level}! ${reward.title} - +${reward.rsc} RSK`);
        } else {
            this.showLevelUpNotification(`¡Nivel ${this.level}!`);
        }
        
        // Efectos visuales
        this.createLevelUpEffect();
        this.playSound('levelup');
    }
    
    spawnItem() {
        // Modo demo: siempre spawnean items, incluso sin minería activa
        // Si la minería está activa, spawnean más rápido
        if (this.items.length > 20) return; // Límite de items en pantalla
        
        const rand = Math.random();
        let cumulative = 0;
        let selectedItem = this.itemTypes[0];
        
        // Ajustar probabilidades con power-up lucky
        const luckyBonus = this.activePowerUps.lucky ? 0.3 : 0;
        
        for (const item of this.itemTypes) {
            cumulative += item.rarity * (1 - luckyBonus * 0.5);
            if (rand <= cumulative) {
                selectedItem = item;
                break;
            }
        }
        
        const item = {
            ...selectedItem,
            x: Math.random() * (this.canvas.width - 60) + 30,
            y: -30,
            rotation: 0,
            rotationSpeed: (Math.random() - 0.5) * 0.1,
            radius: 25,
            speed: selectedItem.speed * (this.activePowerUps.slowMotion ? 0.3 : 1)
        };
        
        this.items.push(item);
    }
    
    spawnPowerUp() {
        if (Math.random() > 0.15) return; // 15% de probabilidad
        if (this.powerUps.length > 2) return;
        
        const powerUp = this.powerUpTypes[
            Math.floor(Math.random() * this.powerUpTypes.length)
        ];
        
        this.powerUps.push({
            ...powerUp,
            x: Math.random() * (this.canvas.width - 60) + 30,
            y: -30,
            radius: 30,
            speed: 2
        });
    }
    
    spawnBoss() {
        if (Math.random() > 0.01) return; // 1% de probabilidad por frame
        if (this.bosses.length > 0) return; // Solo un boss a la vez
        
        const boss = this.bossTypes[
            Math.floor(Math.random() * this.bossTypes.length)
        ];
        
        this.bosses.push({
            ...boss,
            x: Math.random() * (this.canvas.width - 100) + 50,
            y: -50,
            radius: 40,
            speed: boss.speed,
            maxHealth: boss.health
        });
        
        this.showNotification(`¡${boss.name} apareció!`, 'warning');
        this.playSound('bossSpawn');
    }
    
    start() {
        this.lastFrameTime = performance.now();
        this.gameLoop();
        
        // Spawn de items - más frecuente si está minando
        const spawnItems = () => {
            if (!this.isPaused) {
                this.spawnItem();
                // Power-ups y bosses solo cuando está minando
                if (this.isMining) {
                    if (Math.random() < 0.3) this.spawnPowerUp();
                    if (Math.random() < 0.01) this.spawnBoss();
                }
            }
        };
        
        // Spawn inicial inmediato
        setTimeout(spawnItems, 1000);
        
        // Spawn periódico
        this.spawnIntervalId = setInterval(spawnItems, this.isMining ? this.spawnInterval : this.spawnInterval * 2);
        
        // Regeneración de energía
        setInterval(() => {
            if (!this.isPaused && this.energy < this.maxEnergy) {
                this.energy = Math.min(this.maxEnergy, this.energy + this.energyRegenRate);
                this.updateUI();
            }
        }, 1000);
        
        // Combo timer
        setInterval(() => {
            if (this.comboTimer > 0) {
                this.comboTimer -= 100;
                if (this.comboTimer <= 0) {
                    this.breakCombo();
                }
            }
        }, 100);
        
        // Actualizar tiempo de juego
        setInterval(() => {
            if (!this.isPaused) {
                this.stats.playTime++;
            }
        }, 1000);
    }
    
    gameLoop() {
        if (this.isPaused) {
            this.animationFrame = requestAnimationFrame(() => this.gameLoop());
            return;
        }
        
        const currentTime = performance.now();
        const deltaTime = currentTime - this.lastFrameTime;
        this.lastFrameTime = currentTime;
        
        this.update(deltaTime);
        this.render();
        
        this.animationFrame = requestAnimationFrame(() => this.gameLoop());
    }
    
    update(deltaTime) {
        // Actualizar items
        this.items.forEach(item => {
            item.y += item.speed;
            item.rotation += item.rotationSpeed;
            
            // Remover si sale de pantalla
            if (item.y > this.canvas.height + 50) {
                const index = this.items.indexOf(item);
                if (index > -1) {
                    this.items.splice(index, 1);
                    this.breakCombo();
                }
            }
        });
        
        // Actualizar power-ups
        this.powerUps.forEach(powerUp => {
            powerUp.y += powerUp.speed;
            if (powerUp.y > this.canvas.height + 50) {
                const index = this.powerUps.indexOf(powerUp);
                if (index > -1) this.powerUps.splice(index, 1);
            }
        });
        
        // Actualizar bosses
        this.bosses.forEach(boss => {
            boss.y += boss.speed;
            if (boss.y > this.canvas.height + 50) {
                const index = this.bosses.indexOf(boss);
                if (index > -1) this.bosses.splice(index, 1);
            }
        });
        
        // Actualizar partículas
        this.particles = this.particles.filter(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.life--;
            particle.alpha = particle.life / particle.maxLife;
            return particle.life > 0;
        });
        
        // Actualizar explosiones
        this.explosions = this.explosions.filter(explosion => {
            explosion.frame++;
            explosion.radius += 2;
            return explosion.frame < 20;
        });
        
        // Actualizar nieve
        this.snowflakes.forEach(flake => {
            flake.y += flake.speed;
            flake.x += Math.sin(flake.time) * 0.5;
            flake.time += 0.02;
            
            if (flake.y > this.canvas.height) {
                flake.y = -10;
                flake.x = Math.random() * this.canvas.width;
            }
        });
    }
    
    render() {
        if (!this.ctx || !this.canvas) return;
        
        // Limpiar canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Fondo con gradiente
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, 'rgba(10, 14, 39, 0.8)');
        gradient.addColorStop(1, 'rgba(26, 26, 62, 0.8)');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Renderizar nieve de fondo
        this.renderSnowflakes();
        
        // Renderizar items
        this.items.forEach(item => this.renderItem(item));
        
        // Renderizar power-ups
        this.powerUps.forEach(powerUp => this.renderPowerUp(powerUp));
        
        // Renderizar bosses
        this.bosses.forEach(boss => this.renderBoss(boss));
        
        // Renderizar partículas
        this.particles.forEach(particle => this.renderParticle(particle));
        
        // Renderizar explosiones
        this.explosions.forEach(explosion => this.renderExplosion(explosion));
        
        // Renderizar combo
        if (this.combo > 0) {
            this.renderCombo();
        }
    }
    
    renderItem(item) {
        this.ctx.save();
        this.ctx.translate(item.x, item.y);
        this.ctx.rotate(item.rotation);
        
        // Sombra
        this.ctx.shadowBlur = 15;
        this.ctx.shadowColor = 'rgba(0, 255, 136, 0.5)';
        
        // Emoji del item
        this.ctx.font = '40px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(item.emoji, 0, 0);
        
        this.ctx.restore();
    }
    
    renderPowerUp(powerUp) {
        this.ctx.save();
        this.ctx.translate(powerUp.x, powerUp.y);
        
        // Efecto de brillo
        const time = Date.now() * 0.005;
        const glow = Math.sin(time) * 0.3 + 0.7;
        
        this.ctx.shadowBlur = 20 * glow;
        this.ctx.shadowColor = '#ffd700';
        
        this.ctx.font = '35px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(powerUp.emoji, 0, 0);
        
        this.ctx.restore();
    }
    
    renderBoss(boss) {
        this.ctx.save();
        this.ctx.translate(boss.x, boss.y);
        
        // Efecto de pulso
        const pulse = Math.sin(Date.now() * 0.01) * 5 + 40;
        
        this.ctx.shadowBlur = 30;
        this.ctx.shadowColor = '#ff0000';
        
        this.ctx.font = '50px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(boss.emoji, 0, 0);
        
        // Barra de vida
        this.ctx.restore();
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(boss.x - 30, boss.y + 35, 60, 8);
        this.ctx.fillStyle = '#ff0000';
        this.ctx.fillRect(boss.x - 30, boss.y + 35, 60 * (boss.health / boss.maxHealth), 8);
        
        this.ctx.restore();
    }
    
    renderSnowflakes() {
        if (!this.ctx || !this.snowflakes || this.snowflakes.length === 0) return;
        
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        this.snowflakes.forEach(flake => {
            this.ctx.beginPath();
            this.ctx.arc(flake.x, flake.y, flake.size, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }
    
    renderParticle(particle) {
        this.ctx.save();
        this.ctx.globalAlpha = particle.alpha;
        this.ctx.fillStyle = particle.color;
        this.ctx.beginPath();
        this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();
    }
    
    renderExplosion(explosion) {
        this.ctx.save();
        this.ctx.globalAlpha = 1 - (explosion.frame / 20);
        this.ctx.strokeStyle = explosion.color;
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.arc(explosion.x, explosion.y, explosion.radius, 0, Math.PI * 2);
        this.ctx.stroke();
        this.ctx.restore();
    }
    
    renderCombo() {
        const x = this.canvas.width / 2;
        const y = 100;
        
        this.ctx.save();
        this.ctx.font = 'bold 48px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillStyle = '#ffd700';
        this.ctx.strokeStyle = '#000000';
        this.ctx.lineWidth = 4;
        this.ctx.strokeText(`${this.combo}x COMBO!`, x, y);
        this.ctx.fillText(`${this.combo}x COMBO!`, x, y);
        this.ctx.restore();
    }
    
    createExplosion(x, y, emoji) {
        this.explosions.push({
            x, y,
            radius: 20,
            frame: 0,
            color: '#00ff88'
        });
        
        // Partículas
        for (let i = 0; i < 10; i++) {
            this.particles.push({
                x, y,
                vx: (Math.random() - 0.5) * 10,
                vy: (Math.random() - 0.5) * 10,
                size: Math.random() * 4 + 2,
                color: '#00ff88',
                life: 30,
                maxLife: 30,
                alpha: 1
            });
        }
    }
    
    createMegaExplosion(x, y) {
        for (let i = 0; i < 50; i++) {
            this.particles.push({
                x, y,
                vx: (Math.random() - 0.5) * 20,
                vy: (Math.random() - 0.5) * 20,
                size: Math.random() * 6 + 3,
                color: ['#ff0000', '#ffd700', '#00ff88'][Math.floor(Math.random() * 3)],
                life: 60,
                maxLife: 60,
                alpha: 1
            });
        }
    }
    
    createLevelUpEffect() {
        // Efecto visual de level up
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: radial-gradient(circle, rgba(0,255,136,0.3) 0%, transparent 70%);
            pointer-events: none;
            z-index: 9999;
            animation: fadeOut 1s ease-out forwards;
        `;
        document.body.appendChild(overlay);
        setTimeout(() => overlay.remove(), 1000);
    }
    
    createParticles(x, y, color) {
        for (let i = 0; i < 5; i++) {
            this.particles.push({
                x, y,
                vx: (Math.random() - 0.5) * 5,
                vy: (Math.random() - 0.5) * 5,
                size: Math.random() * 3 + 1,
                color: color,
                life: 20,
                maxLife: 20,
                alpha: 1
            });
        }
    }
    
    showFloatingText(x, y, text, color) {
        const floating = document.createElement('div');
        floating.textContent = text;
        floating.style.cssText = `
            position: absolute;
            left: ${x}px;
            top: ${y}px;
            color: ${color};
            font-weight: bold;
            font-size: 18px;
            pointer-events: none;
            z-index: 10000;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
            animation: floatUp 1s ease-out forwards;
        `;
        
        const rect = this.canvas.getBoundingClientRect();
        floating.style.left = (rect.left + x) + 'px';
        floating.style.top = (rect.top + y) + 'px';
        
        document.body.appendChild(floating);
        setTimeout(() => floating.remove(), 1000);
    }
    
    showComboNotification(combo) {
        if (window.miningNotifications) {
            window.miningNotifications.show(
                `🔥 ${combo}x COMBO! Multiplicador: ${this.comboMultiplier.toFixed(1)}x`,
                { type: 'success', duration: 2000 }
            );
        }
    }
    
    showLevelUpNotification(message) {
        if (window.miningNotifications) {
            window.miningNotifications.show(
                `🎉 ${message}`,
                { type: 'success', duration: 4000 }
            );
        }
    }
    
    showNotification(message, type = 'info') {
        if (window.miningNotifications) {
            window.miningNotifications.show(message, { type, duration: 3000 });
        } else {
            console.log(`[${type.toUpperCase()}] ${message}`);
        }
    }
    
    playSound(type) {
        // Implementar sonidos si hay sistema de audio
        // Por ahora solo log
        console.log(`🔊 Sound: ${type}`);
    }
    
    initializeDailyMissions() {
        this.dailyMissions = [
            {
                id: 'collect_50',
                name: 'Colecta 50 Items',
                target: 50,
                reward: 10,
                progress: 0
            },
            {
                id: 'combo_10',
                name: 'Alcanza Combo x10',
                target: 10,
                reward: 15,
                progress: 0
            },
            {
                id: 'defeat_boss',
                name: 'Derrota un Boss',
                target: 1,
                reward: 25,
                progress: 0
            },
            {
                id: 'play_30min',
                name: 'Juega 30 minutos',
                target: 1800,
                reward: 20,
                progress: 0
            }
        ];
        
        this.dailyMissions.forEach(mission => {
            this.missionProgress[mission.id] = 0;
        });
    }
    
    checkMiningStatus() {
        const supabase = window.supabaseIntegration;
        if (supabase?.miningSession?.isActive) {
            this.isMining = true;
        }
    }
    
    onMiningStart() {
        this.isMining = true;
        this.stats.streak++;
        this.stats.maxStreak = Math.max(this.stats.maxStreak, this.stats.streak);
        
        // Inicializar nieve de fondo
        this.initializeSnowflakes();
    }
    
    onMiningStop() {
        this.isMining = false;
        this.stats.streak = 0;
    }
    
    initializeSnowflakes() {
        if (!this.canvas) return;
        
        this.snowflakes = [];
        const count = 50;
        for (let i = 0; i < count; i++) {
            this.snowflakes.push({
                x: Math.random() * (this.canvas.width || 800),
                y: Math.random() * (this.canvas.height || 400),
                size: Math.random() * 3 + 1,
                speed: Math.random() * 2 + 0.5,
                time: Math.random() * Math.PI * 2
            });
        }
        console.log(`❄️ Inicializadas ${count} partículas de nieve`);
    }
    
    applyMiningMultiplier(multiplier) {
        // Aplicar multiplicador al sistema de minería
        if (window.snowMiningAdapter) {
            window.snowMiningAdapter.setMultiplier(multiplier, 30000); // 30 segundos
        }
    }
    
    updateUI() {
        // Actualizar nivel y XP
        const levelEl = document.getElementById('eventLevel');
        const xpEl = document.getElementById('eventXP');
        const xpBarEl = document.getElementById('eventXPBar');
        
        if (levelEl) levelEl.textContent = this.level;
        if (xpEl) xpEl.textContent = `${this.xp}/${this.xpToNextLevel} XP`;
        if (xpBarEl) {
            const progress = (this.xp / this.xpToNextLevel) * 100;
            xpBarEl.style.width = `${progress}%`;
        }
        
        // Actualizar energía
        const energyEl = document.getElementById('eventEnergy');
        const energyBarEl = document.getElementById('eventEnergyBar');
        
        if (energyEl) energyEl.textContent = `${Math.floor(this.energy)}/${this.maxEnergy}`;
        if (energyBarEl) {
            const progress = (this.energy / this.maxEnergy) * 100;
            energyBarEl.style.width = `${progress}%`;
        }
        
        // Actualizar combo
        const comboEl = document.getElementById('eventCombo');
        if (comboEl) {
            if (this.combo > 0) {
                comboEl.innerHTML = `<i class="fas fa-fire"></i><span>${this.combo}x COMBO (${this.comboMultiplier.toFixed(1)}x)</span>`;
                comboEl.style.display = 'flex';
            } else {
                comboEl.style.display = 'none';
            }
        }
        
        // Actualizar estadísticas del overlay
        const currentItemsEl = document.getElementById('currentItems');
        const currentEarnedEl = document.getElementById('currentEarned');
        const currentStreakEl = document.getElementById('currentStreak');
        
        if (currentItemsEl) currentItemsEl.textContent = this.stats.itemsCollected;
        if (currentEarnedEl) currentEarnedEl.textContent = `${this.stats.totalEarned.toFixed(2)} RSK`;
        if (currentStreakEl) currentStreakEl.textContent = this.stats.streak;
        
        // Actualizar estadísticas
        const statsEl = document.getElementById('eventStats');
        if (statsEl) {
            statsEl.innerHTML = `
                <div><strong>Items:</strong> ${this.stats.itemsCollected}</div>
                <div><strong>Max Combo:</strong> ${this.stats.maxCombo}x</div>
                <div><strong>Bosses:</strong> ${this.stats.bossesDefeated}</div>
                <div><strong>Ganado:</strong> ${this.stats.totalEarned.toFixed(2)} RSK</div>
            `;
        }
        
        // Actualizar power-ups activos
        this.updatePowerUpsUI();
        
        // Actualizar misiones
        this.updateMissionsUI();
    }
    
    updatePowerUpsUI() {
        const powerUpsListEl = document.getElementById('activePowerUpsList');
        if (!powerUpsListEl) return;
        
        const activePowerUps = Object.entries(this.activePowerUps)
            .filter(([type, active]) => active)
            .map(([type]) => {
                const powerUp = this.powerUpTypes.find(p => p.type === type);
                return powerUp;
            })
            .filter(Boolean);
        
        if (activePowerUps.length === 0) {
            powerUpsListEl.innerHTML = '<div class="no-powerups">Ningún power-up activo</div>';
        } else {
            powerUpsListEl.innerHTML = activePowerUps.map(powerUp => `
                <div class="power-up-active">
                    <span class="power-up-emoji">${powerUp.emoji}</span>
                    <span class="power-up-name">${powerUp.name}</span>
                </div>
            `).join('');
        }
    }
    
    updateMissionsUI() {
        const missionsEl = document.getElementById('eventMissions');
        if (!missionsEl) return;
        
        // Actualizar progreso de misiones
        this.missionProgress['collect_50'] = Math.min(this.stats.itemsCollected, 50);
        this.missionProgress['combo_10'] = this.stats.maxCombo >= 10 ? 1 : 0;
        this.missionProgress['defeat_boss'] = this.stats.bossesDefeated;
        this.missionProgress['play_30min'] = Math.min(this.stats.playTime, 1800);
        
        missionsEl.innerHTML = this.dailyMissions.map(mission => {
            const progress = this.missionProgress[mission.id] || 0;
            const completed = progress >= mission.target;
            const progressPercent = Math.min((progress / mission.target) * 100, 100);
            
            return `
                <div class="mission-item ${completed ? 'completed' : ''}">
                    <div class="mission-info">
                        <span class="mission-name">${mission.name}</span>
                        <span class="mission-reward">+${mission.reward} RSK</span>
                    </div>
                    <div class="mission-progress">
                        <div class="mission-progress-bar" style="width: ${progressPercent}%"></div>
                        <span class="mission-progress-text">${progress}/${mission.target}</span>
                    </div>
                </div>
            `;
        }).join('');
    }
    
    loadState() {
        try {
            const saved = localStorage.getItem('snow_mining_event_v2_state');
            if (saved) {
                const data = JSON.parse(saved);
                this.level = data.level || 1;
                this.xp = data.xp || 0;
                this.totalXP = data.totalXP || 0;
                this.stats = { ...this.stats, ...data.stats };
                this.missionProgress = data.missionProgress || {};
            }
        } catch (error) {
            console.error('Error loading state:', error);
        }
    }
    
    saveState() {
        try {
            const data = {
                level: this.level,
                xp: this.xp,
                totalXP: this.totalXP,
                stats: this.stats,
                missionProgress: this.missionProgress,
                timestamp: Date.now()
            };
            localStorage.setItem('snow_mining_event_v2_state', JSON.stringify(data));
        } catch (error) {
            console.error('Error saving state:', error);
        }
    }
    
    // Guardar estado periódicamente
    startAutoSave() {
        setInterval(() => {
            this.saveState();
        }, 30000); // Cada 30 segundos
    }
}

// Inicialización
function initializeSnowMiningEventV2() {
    if (!window.snowMiningEventV2) {
        window.snowMiningEventV2 = new SnowMiningEventV2();
        window.snowMiningEventV2.initialize();
        window.snowMiningEventV2.startAutoSave();
    }
}

// Exportar
window.SnowMiningEventV2 = SnowMiningEventV2;
window.initializeSnowMiningEventV2 = initializeSnowMiningEventV2;

