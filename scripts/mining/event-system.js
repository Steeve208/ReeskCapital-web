/* ================================
   EVENT SYSTEM - RSC MINING
================================ */

/**
 * 🎉 SISTEMA DE EVENTOS Y TEMPORADAS
 * 
 * Sistema completo de eventos para mantener engagement
 * - Eventos de fin de semana
 * - Temporadas con recompensas especiales
 * - Competencias globales
 * - Bonificaciones limitadas
 * - Desafíos especiales
 */

class EventSystem {
    constructor() {
        this.activeEvents = [];
        this.userEventProgress = {};
        this.seasonData = {
            currentSeason: 1,
            seasonStart: new Date(),
            seasonEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 días
            seasonXP: 0,
            seasonLevel: 1,
            seasonRewards: []
        };

        this.eventTypes = {
            'double_xp': {
                name: 'Double XP Weekend',
                description: 'Gana el doble de XP por minería',
                icon: 'fas fa-star',
                multiplier: 2,
                duration: 48, // horas
                color: '#ffd700'
            },
            'mining_competition': {
                name: 'Mining Competition',
                description: 'Competencia global de minería',
                icon: 'fas fa-trophy',
                multiplier: 1.5,
                duration: 72, // horas
                color: '#ff6b6b'
            },
            'equipment_sale': {
                name: 'Equipment Sale',
                description: 'Descuentos en equipos',
                icon: 'fas fa-tags',
                multiplier: 0.8, // 20% descuento
                duration: 24, // horas
                color: '#4ecdc4'
            },
            'rare_drop': {
                name: 'Rare Drop Event',
                description: 'Mayor probabilidad de equipos raros',
                icon: 'fas fa-gem',
                multiplier: 3,
                duration: 96, // horas
                color: '#9b59b6'
            }
        };

        this.initializeEventSystem();
    }

    initializeEventSystem() {
        // Cargar datos de eventos desde localStorage
        const stored = localStorage.getItem('rsc_event_data');
        if (stored) {
            const data = JSON.parse(stored);
            this.activeEvents = data.activeEvents || [];
            this.userEventProgress = data.userEventProgress || {};
            this.seasonData = { ...this.seasonData, ...data.seasonData };
        }

        // Verificar eventos activos
        this.checkActiveEvents();
        
        // Iniciar temporada si es necesario
        this.initializeSeason();
    }

    checkActiveEvents() {
        const now = new Date();
        
        // Limpiar eventos expirados
        this.activeEvents = this.activeEvents.filter(event => {
            const endTime = new Date(event.startTime.getTime() + event.duration * 60 * 60 * 1000);
            return endTime > now;
        });

        // Verificar si hay eventos que deberían estar activos
        this.checkScheduledEvents();
    }

    checkScheduledEvents() {
        const now = new Date();
        const dayOfWeek = now.getDay();
        const hour = now.getHours();

        // Eventos de fin de semana (sábado y domingo)
        if (dayOfWeek === 6 || dayOfWeek === 0) {
            this.startEvent('double_xp');
        }

        // Eventos de competencia (primer viernes de cada mes)
        const firstFriday = this.getFirstFridayOfMonth(now);
        if (now.getDate() === firstFriday.getDate() && dayOfWeek === 5) {
            this.startEvent('mining_competition');
        }

        // Eventos de venta (cada 2 semanas)
        const weeksSinceStart = Math.floor((now - this.seasonData.seasonStart) / (7 * 24 * 60 * 60 * 1000));
        if (weeksSinceStart % 2 === 0 && hour === 0) {
            this.startEvent('equipment_sale');
        }

        // Eventos de rare drop (aleatorios)
        if (Math.random() < 0.1) { // 10% de probabilidad cada verificación
            this.startEvent('rare_drop');
        }
    }

    getFirstFridayOfMonth(date) {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const firstFriday = new Date(firstDay);
        
        while (firstFriday.getDay() !== 5) {
            firstFriday.setDate(firstFriday.getDate() + 1);
        }
        
        return firstFriday;
    }

    startEvent(eventType) {
        const eventConfig = this.eventTypes[eventType];
        if (!eventConfig) return;

        // Verificar si ya está activo
        const existingEvent = this.activeEvents.find(e => e.type === eventType);
        if (existingEvent) return;

        const event = {
            id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type: eventType,
            name: eventConfig.name,
            description: eventConfig.description,
            icon: eventConfig.icon,
            multiplier: eventConfig.multiplier,
            color: eventConfig.color,
            startTime: new Date(),
            duration: eventConfig.duration,
            participants: [],
            totalContribution: 0
        };

        this.activeEvents.push(event);
        this.saveEventData();

        // Mostrar notificación
        this.showEventNotification(event);

        console.log(`🎉 Evento iniciado: ${event.name}`);
    }

    showEventNotification(event) {
        const notification = document.createElement('div');
        notification.className = 'event-notification';
        notification.innerHTML = `
            <div class="event-content" style="border-left: 4px solid ${event.color}">
                <div class="event-icon">
                    <i class="${event.icon}"></i>
                </div>
                <div class="event-text">
                    <h4>🎉 ${event.name}</h4>
                    <p>${event.description}</p>
                    <span class="event-duration">Duración: ${event.duration}h</span>
                </div>
            </div>
        `;

        document.body.appendChild(notification);

        // Auto-remover después de 5 segundos
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }

    endEvent(eventId) {
        const eventIndex = this.activeEvents.findIndex(e => e.id === eventId);
        if (eventIndex === -1) return;

        const event = this.activeEvents[eventIndex];
        this.activeEvents.splice(eventIndex, 1);
        this.saveEventData();

        console.log(`🏁 Evento finalizado: ${event.name}`);
    }

    joinEvent(eventId) {
        const event = this.activeEvents.find(e => e.id === eventId);
        if (!event) return;

        const user = window.supabaseIntegration?.getCurrentUser();
        if (!user) return;

        if (!event.participants.includes(user.id)) {
            event.participants.push(user.id);
            this.saveEventData();
        }
    }

    addEventContribution(eventId, amount) {
        const event = this.activeEvents.find(e => e.id === eventId);
        if (!event) return;

        const user = window.supabaseIntegration?.getCurrentUser();
        if (!user) return;

        // Asegurar que el usuario esté en el evento
        this.joinEvent(eventId);

        // Agregar contribución
        event.totalContribution += amount;

        // Actualizar progreso del usuario
        if (!this.userEventProgress[eventId]) {
            this.userEventProgress[eventId] = {
                contribution: 0,
                startTime: new Date()
            };
        }
        this.userEventProgress[eventId].contribution += amount;

        this.saveEventData();
    }

    getEventMultiplier(eventType) {
        const event = this.activeEvents.find(e => e.type === eventType);
        return event ? event.multiplier : 1;
    }

    getActiveEvents() {
        return this.activeEvents;
    }

    getEventLeaderboard(eventId) {
        const event = this.activeEvents.find(e => e.id === eventId);
        if (!event) return [];

        // Simular leaderboard (en producción vendría de Supabase)
        return event.participants.map(userId => ({
            userId: userId,
            username: `User${userId.substr(-4)}`,
            contribution: Math.floor(Math.random() * 1000),
            rank: 0
        })).sort((a, b) => b.contribution - a.contribution)
          .map((participant, index) => ({
              ...participant,
              rank: index + 1
          }));
    }

    initializeSeason() {
        const now = new Date();
        
        // Verificar si la temporada actual ha expirado
        if (now > this.seasonData.seasonEnd) {
            this.endSeason();
            this.startNewSeason();
        }
    }

    startNewSeason() {
        this.seasonData = {
            currentSeason: this.seasonData.currentSeason + 1,
            seasonStart: new Date(),
            seasonEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            seasonXP: 0,
            seasonLevel: 1,
            seasonRewards: []
        };

        this.saveEventData();
        console.log(`🎊 Nueva temporada iniciada: ${this.seasonData.currentSeason}`);
    }

    endSeason() {
        // Procesar recompensas de temporada
        this.processSeasonRewards();
        console.log(`🏁 Temporada ${this.seasonData.currentSeason} finalizada`);
    }

    processSeasonRewards() {
        const user = window.supabaseIntegration?.getCurrentUser();
        if (!user) return;

        const seasonLevel = this.seasonData.seasonLevel;
        const rewards = this.getSeasonRewards(seasonLevel);

        if (rewards.length > 0) {
            // Aplicar recompensas
            rewards.forEach(reward => {
                if (reward.type === 'rsc') {
                    user.balance += reward.amount;
                } else if (reward.type === 'equipment') {
                    // Agregar equipo especial
                    this.giveSeasonEquipment(reward.equipmentId);
                }
            });

            window.supabaseIntegration.saveUserToStorage();
            this.showSeasonRewards(rewards);
        }
    }

    getSeasonRewards(level) {
        const rewards = {
            1: [{ type: 'rsc', amount: 100 }],
            2: [{ type: 'rsc', amount: 200 }, { type: 'equipment', equipmentId: 'season_2_processor' }],
            3: [{ type: 'rsc', amount: 500 }, { type: 'equipment', equipmentId: 'season_3_memory' }],
            4: [{ type: 'rsc', amount: 1000 }, { type: 'equipment', equipmentId: 'season_4_cooling' }],
            5: [{ type: 'rsc', amount: 2000 }, { type: 'equipment', equipmentId: 'season_5_power' }]
        };

        return rewards[level] || [];
    }

    giveSeasonEquipment(equipmentId) {
        // Implementar lógica para dar equipos de temporada
        console.log(`🎁 Equipo de temporada otorgado: ${equipmentId}`);
    }

    showSeasonRewards(rewards) {
        const modal = document.createElement('div');
        modal.className = 'season-rewards-modal';
        modal.innerHTML = `
            <div class="season-rewards-content">
                <div class="season-rewards-header">
                    <i class="fas fa-trophy"></i>
                    <h2>🎊 Recompensas de Temporada</h2>
                </div>
                <div class="season-rewards-list">
                    ${rewards.map(reward => `
                        <div class="season-reward-item">
                            <i class="fas fa-gift"></i>
                            <span>${reward.type === 'rsc' ? `${reward.amount} RSC` : `Equipo ${reward.equipmentId}`}</span>
                        </div>
                    `).join('')}
                </div>
                <button class="btn-quantum" onclick="this.parentElement.parentElement.remove()">
                    <i class="fas fa-check"></i>
                    <span>Continuar</span>
                </button>
            </div>
        `;

        document.body.appendChild(modal);
    }

    addSeasonXP(amount) {
        this.seasonData.seasonXP += amount;
        
        // Verificar si subió de nivel en la temporada
        const newSeasonLevel = Math.floor(this.seasonData.seasonXP / 1000) + 1;
        if (newSeasonLevel > this.seasonData.seasonLevel) {
            this.seasonData.seasonLevel = newSeasonLevel;
            this.showSeasonLevelUp(newSeasonLevel);
        }

        this.saveEventData();
    }

    showSeasonLevelUp(level) {
        const notification = document.createElement('div');
        notification.className = 'season-level-up-notification';
        notification.innerHTML = `
            <div class="season-level-up-content">
                <i class="fas fa-star"></i>
                <h3>🎊 Nivel de Temporada ${level}</h3>
                <p>¡Nuevas recompensas desbloqueadas!</p>
            </div>
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 3000);
    }

    getSeasonProgress() {
        const currentXP = this.seasonData.seasonXP;
        const currentLevel = this.seasonData.seasonLevel;
        const nextLevelXP = currentLevel * 1000;
        const progressXP = currentXP - ((currentLevel - 1) * 1000);
        const requiredXP = nextLevelXP - ((currentLevel - 1) * 1000);

        return {
            level: currentLevel,
            xp: currentXP,
            progressXP: progressXP,
            requiredXP: requiredXP,
            progressPercentage: Math.min(100, (progressXP / requiredXP) * 100)
        };
    }

    getSeasonTimeRemaining() {
        const now = new Date();
        const remaining = this.seasonData.seasonEnd - now;
        
        if (remaining <= 0) return 0;

        const days = Math.floor(remaining / (24 * 60 * 60 * 1000));
        const hours = Math.floor((remaining % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
        const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));

        return {
            days,
            hours,
            minutes,
            total: remaining
        };
    }

    saveEventData() {
        const data = {
            activeEvents: this.activeEvents,
            userEventProgress: this.userEventProgress,
            seasonData: this.seasonData
        };
        localStorage.setItem('rsc_event_data', JSON.stringify(data));
    }

    // Verificar eventos cada minuto
    startEventChecker() {
        setInterval(() => {
            this.checkActiveEvents();
        }, 60000); // 1 minuto
    }
}

// Crear instancia global
window.eventSystem = new EventSystem();

// Iniciar verificador de eventos
window.eventSystem.startEventChecker();

console.log('🎉 Event System cargado');

