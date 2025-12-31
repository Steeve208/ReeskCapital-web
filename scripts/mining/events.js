// ===== MINING PLATFORM EVENTS PAGE =====
// Versión simplificada y funcional

(function() {
    'use strict';
    
    console.log('🎬 Events page script starting...');
    
    // Definición de eventos
    const availableEvents = [
        {
            id: 'snow-mining',
            name: '❄️ Snow Mining Event v2.0',
            description: 'Evento ultra gamificado con niveles, combos, power-ups, bosses y misiones. Sistema de progresión completo con recompensas escalonadas.',
            icon: 'fas fa-snowflake',
            startDate: new Date('2024-12-01'),
            endDate: new Date('2026-01-31'),
            script: '../../scripts/mining/snow-mining-event-v2.js',
            adapter: '../../scripts/mining/snow-mining-adapter.js',
            css: '../../styles/snow-mining-event.css',
            color: '#00d4ff'
        },
        {
            id: 'christmas',
            name: '🎄 Christmas Community Bonanza',
            description: 'Evento navideño orientado a construir comunidad. Sistema de regalos progresivos, referidos con bonos escalonados y desafíos diarios.',
            icon: 'fas fa-gift',
            startDate: new Date('2024-12-09'),
            endDate: new Date('2025-01-15'),
            script: '../../scripts/mining/christmas-event.js',
            color: '#ff6b6b'
        },
        {
            id: 'christmas-competition',
            name: '🎄 Evento Navideño Competitivo 2024',
            description: '¡Compite por el airdrop más grande del año! Sistema de puntos competitivo con leaderboard global, desafíos diarios, milestones comunitarios y airdrop escalonado de hasta 10,000 RSC para los top 100.',
            icon: 'fas fa-trophy',
            startDate: new Date('2024-12-25T00:00:00'),
            endDate: new Date('2026-01-02T23:59:59'),
            page: '../../pages/christmas-event.html',
            color: '#dc2626'
        },
        {
            id: 'social-goals',
            name: '🎯 Social Goals Event',
            description: 'Completa objetivos sociales y gana recompensas. Sigue nuestras redes sociales y participa en la comunidad.',
            icon: 'fas fa-bullseye',
            startDate: new Date('2024-01-01'),
            endDate: new Date('2025-12-31'),
            script: '../../scripts/mining/social-goals-event.js',
            color: '#4ecdc4'
        },
        {
            id: 'welcome-bonus',
            name: '🚀 Welcome Bonus',
            description: 'Bonificación de bienvenida para nuevos usuarios. Completa acciones sociales y reclama 50 RSK.',
            icon: 'fas fa-rocket',
            startDate: new Date('2024-01-01'),
            endDate: new Date('2025-12-31'),
            script: '../../scripts/mining/welcome-bonus-event.js',
            color: '#ffd700'
        }
    ];
    
    // Función para calcular el estado del evento
    function getEventStatus(event) {
        const now = new Date();
        if (now >= event.startDate && now <= event.endDate) {
            return 'active';
        } else if (now < event.startDate) {
            return 'upcoming';
        } else {
            return 'past';
        }
    }
    
    // Función para formatear fecha
    function formatDate(date) {
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }
    
    // Función para calcular tiempo restante
    function getTimeLeft(endDate) {
        const now = new Date();
        const timeLeft = endDate - now;
        const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        return `${days}d ${hours}h`;
    }
    
    // Función para crear tarjeta de evento
    function createEventCard(event, status) {
        let timeInfo = '';
        let statusBadge = '';
        let actionButton = '';
        
        if (status === 'active') {
            timeInfo = `<div class="event-time-left"><i class="fas fa-clock"></i> ${getTimeLeft(event.endDate)} left</div>`;
            statusBadge = '<span class="event-status-badge active"><i class="fas fa-fire"></i> Active</span>';
            actionButton = `<button class="btn btn-primary event-activate-btn" onclick="window.miningEvents.activateEvent('${event.id}')">
                <i class="fas fa-play"></i>
                <span>Activate Event</span>
            </button>`;
        } else if (status === 'upcoming') {
            const daysUntil = Math.ceil((event.startDate - new Date()) / (1000 * 60 * 60 * 24));
            timeInfo = `<div class="event-time-until"><i class="fas fa-calendar"></i> Starts in ${daysUntil} days</div>`;
            statusBadge = '<span class="event-status-badge upcoming"><i class="fas fa-clock"></i> Upcoming</span>';
            actionButton = `<button class="btn btn-secondary event-activate-btn" disabled>
                <i class="fas fa-clock"></i>
                <span>Coming Soon</span>
            </button>`;
        } else {
            timeInfo = `<div class="event-time-past"><i class="fas fa-history"></i> Ended</div>`;
            statusBadge = '<span class="event-status-badge past"><i class="fas fa-check"></i> Past</span>';
            actionButton = `<button class="btn btn-secondary event-activate-btn" disabled>
                <i class="fas fa-history"></i>
                <span>Event Ended</span>
            </button>`;
        }
        
        return `
            <div class="event-card ${status}" style="border-left: 4px solid ${event.color}">
                <div class="event-card-header">
                    <div class="event-icon" style="color: ${event.color}">
                        <i class="${event.icon}"></i>
                    </div>
                    <div class="event-header-content">
                        <h3 class="event-name">${event.name}</h3>
                        ${statusBadge}
                    </div>
                </div>
                <div class="event-card-body">
                    <p class="event-description">${event.description}</p>
                    <div class="event-dates">
                        <div class="event-date-item">
                            <i class="fas fa-calendar-alt"></i>
                            <span>Start: ${formatDate(event.startDate)}</span>
                        </div>
                        <div class="event-date-item">
                            <i class="fas fa-calendar-check"></i>
                            <span>End: ${formatDate(event.endDate)}</span>
                        </div>
                    </div>
                    ${timeInfo}
                </div>
                <div class="event-card-footer">
                    ${actionButton}
                </div>
            </div>
        `;
    }
    
    // Función para renderizar eventos
    function renderEvents() {
        console.log('🎨 Rendering events...');
        
        // Asegurar que las secciones estén visibles
        const sections = document.querySelectorAll('.events-section');
        sections.forEach(section => {
            if (section) section.style.display = 'block';
        });
        
        // Remover contenedor de evento activo si existe
        const activeContainer = document.getElementById('activeEventContainer');
        if (activeContainer) {
            activeContainer.remove();
        }
        
        // Clasificar eventos
        const activeEvents = [];
        const upcomingEvents = [];
        const pastEvents = [];
        
        availableEvents.forEach(event => {
            const status = getEventStatus(event);
            event.status = status;
            
            if (status === 'active') {
                activeEvents.push(event);
            } else if (status === 'upcoming') {
                upcomingEvents.push(event);
            } else {
                pastEvents.push(event);
            }
        });
        
        console.log(`📊 Found: ${activeEvents.length} active, ${upcomingEvents.length} upcoming, ${pastEvents.length} past`);
        
        // Renderizar en contenedores
        const activeGrid = document.getElementById('activeEventsGrid');
        const upcomingGrid = document.getElementById('upcomingEventsGrid');
        const pastGrid = document.getElementById('pastEventsGrid');
        
        if (activeGrid) {
            if (activeEvents.length > 0) {
                activeGrid.innerHTML = activeEvents.map(e => createEventCard(e, 'active')).join('');
                console.log(`✅ Rendered ${activeEvents.length} active events`);
            } else {
                activeGrid.innerHTML = '<div class="event-empty-state"><i class="fas fa-calendar-times"></i><p>No active events at the moment</p></div>';
            }
        }
        
        if (upcomingGrid) {
            if (upcomingEvents.length > 0) {
                upcomingGrid.innerHTML = upcomingEvents.map(e => createEventCard(e, 'upcoming')).join('');
                console.log(`✅ Rendered ${upcomingEvents.length} upcoming events`);
            } else {
                upcomingGrid.innerHTML = '<div class="event-empty-state"><i class="fas fa-calendar-times"></i><p>No upcoming events</p></div>';
            }
        }
        
        if (pastGrid) {
            if (pastEvents.length > 0) {
                pastGrid.innerHTML = pastEvents.map(e => createEventCard(e, 'past')).join('');
                console.log(`✅ Rendered ${pastEvents.length} past events`);
            } else {
                pastGrid.innerHTML = '<div class="event-empty-state"><i class="fas fa-calendar-times"></i><p>No past events</p></div>';
            }
        }
        
        console.log('✅ Events rendered successfully');
    }
    
    // Función para activar evento
    function activateEvent(eventId) {
        const event = availableEvents.find(e => e.id === eventId);
        if (!event) {
            console.error('Event not found:', eventId);
            return;
        }

        console.log('🎉 Activating event:', event.name);

        // Si el evento tiene una página dedicada, redirigir
        if (event.page) {
            window.location.href = event.page;
            return;
        }
        
        // Ocultar secciones de eventos
        const sections = document.querySelectorAll('.events-section');
        sections.forEach(section => {
            if (section) section.style.display = 'none';
        });
        
        // Crear contenedor para el evento
        let container = document.getElementById('activeEventContainer');
        if (!container) {
            container = document.createElement('div');
            container.id = 'activeEventContainer';
            container.className = 'active-event-container';
            const pageContainer = document.querySelector('.page-container');
            if (pageContainer) {
                pageContainer.appendChild(container);
            }
        }
        
        // Insertar HTML del evento
        if (event.id === 'snow-mining') {
            container.innerHTML = getSnowMiningHTML(event);
        } else {
            container.innerHTML = `<div class="event-interface-card"><h2>${event.name}</h2><p>${event.description}</p></div>`;
        }
        
        // Agregar botón volver
        const backBtn = document.createElement('button');
        backBtn.className = 'btn btn-secondary event-back-btn';
        backBtn.innerHTML = '<i class="fas fa-arrow-left"></i> <span>Volver a Eventos</span>';
        backBtn.onclick = () => {
            container.remove();
            sections.forEach(s => s.style.display = 'block');
            renderEvents();
        };
        container.insertBefore(backBtn, container.firstChild);
        
        // Cargar CSS
        if (event.css) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = event.css;
            link.id = `event-css-${event.id}`;
            if (!document.getElementById(link.id)) {
                document.head.appendChild(link);
            }
        }
        
        // Cargar script
        if (event.script) {
            const script = document.createElement('script');
            script.src = event.script;
            script.id = `event-script-${event.id}`;
            script.onload = () => {
                console.log('✅ Event script loaded');
                setTimeout(() => {
                    if (window.initializeSnowMiningEventV2) {
                        window.initializeSnowMiningEventV2();
                    } else if (window.SnowMiningEventV2) {
                        window.snowMiningEventV2 = new window.SnowMiningEventV2();
                        window.snowMiningEventV2.initialize();
                    }
                }, 500);
            };
            if (!document.getElementById(script.id)) {
                document.body.appendChild(script);
            }
        }
    }
    
    // HTML para Snow Mining Event
    function getSnowMiningHTML(event) {
        return `
            <div class="snow-mining-event-v2">
                <div class="snow-event-card">
                    <div class="snow-event-header">
                        <h2 class="snow-event-title">❄️ ${event.name}</h2>
                        <p class="snow-event-subtitle">Sistema ultra gamificado con niveles, combos, power-ups y bosses épicos</p>
                    </div>
                    
                    <div class="event-progression-panel">
                        <div class="level-display">
                            <div class="level-info">
                                <span class="level-label">Nivel</span>
                                <span class="level-value" id="eventLevel">1</span>
                            </div>
                            <div class="xp-info">
                                <div class="xp-bar-container">
                                    <div class="xp-bar" id="eventXPBar"></div>
                                </div>
                                <span class="xp-text" id="eventXP">0/100 XP</span>
                            </div>
                        </div>
                        <div class="energy-display">
                            <div class="energy-info">
                                <i class="fas fa-bolt"></i>
                                <span class="energy-label">Energía</span>
                                <span class="energy-value" id="eventEnergy">100/100</span>
                            </div>
                            <div class="energy-bar-container">
                                <div class="energy-bar" id="eventEnergyBar"></div>
                            </div>
                        </div>
                        <div class="combo-display" id="eventCombo" style="display: none;">
                            <i class="fas fa-fire"></i>
                            <span>0x COMBO</span>
                        </div>
                    </div>
                    
                    <div class="snow-canvas-container">
                        <canvas id="snowCanvas"></canvas>
                        <div class="snow-stats-overlay">
                            <div class="snow-stat-box">
                                <div class="snow-stat-label">Items</div>
                                <div class="snow-stat-value" id="currentItems">0</div>
                            </div>
                            <div class="snow-stat-box">
                                <div class="snow-stat-label">Ganado</div>
                                <div class="snow-stat-value" id="currentEarned">0 RSK</div>
                            </div>
                            <div class="snow-stat-box">
                                <div class="snow-stat-label">Streak</div>
                                <div class="snow-stat-value" id="currentStreak">0</div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="power-ups-active" id="powerUpsActive">
                        <h4 class="section-subtitle-small">Power-ups Activos</h4>
                        <div class="power-ups-list" id="activePowerUpsList">
                            <div class="no-powerups">Ningún power-up activo</div>
                        </div>
                    </div>
                    
                    <div class="daily-missions-section">
                        <h3 class="section-subtitle"><i class="fas fa-tasks"></i> <span>Misiones Diarias</span></h3>
                        <div class="missions-list" id="eventMissions"></div>
                    </div>
                    
                    <div class="event-stats-section">
                        <h3 class="section-subtitle"><i class="fas fa-chart-line"></i> <span>Estadísticas</span></h3>
                        <div class="stats-grid" id="eventStats"></div>
                    </div>
                </div>
            </div>
        `;
    }
    
    // Inicialización
    function init() {
        console.log('🚀 Initializing events page...');
        
        const activeGrid = document.getElementById('activeEventsGrid');
        const upcomingGrid = document.getElementById('upcomingEventsGrid');
        const pastGrid = document.getElementById('pastEventsGrid');
        
        if (!activeGrid || !upcomingGrid || !pastGrid) {
            console.warn('⚠️ Grids not found, retrying...');
            setTimeout(init, 200);
            return;
        }
        
        console.log('✅ All grids found');
        renderEvents();
    }
    
    // Inicializar cuando el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        setTimeout(init, 100);
    }
    
    // Exportar funciones globales
    window.miningEvents = {
        availableEvents: availableEvents,
        activateEvent: activateEvent,
        renderEvents: renderEvents
    };
    
    console.log('✅ Events page script loaded');
})();
