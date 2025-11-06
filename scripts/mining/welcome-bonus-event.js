/* ================================
   WELCOME BONUS EVENT SYSTEM
================================ */

/**
 * 🎉 WELCOME BONUS EVENT SYSTEM
 * 
 * Sistema completo para el evento de bienvenida
 * - Banner flotante después de 10 segundos
 * - Contador de tiempo y cupos restantes
 * - Reconocimiento de dispositivo/usuario
 * - Entrega automática de 450 RSC
 * - Persistencia en localStorage y Supabase
 */

class WelcomeBonusEvent {
    constructor() {
        this.eventData = {
            id: 'welcome_bonus_2024',
            name: 'Welcome Bonus Event',
            description: 'Get 450 RSC free when you register',
            reward: 450,
            maxSlots: 3, // 🔧 ONLY 3 SLOTS AVAILABLE
            duration: 30, // days
            startDate: new Date(),
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            claimedSlots: 3, // 🔧 EVENT FINISHED - All slots claimed
            isActive: false // 🔧 EVENT CLOSED - No more claims allowed
        };

        this.userData = {
            hasSeenBanner: false,
            hasClaimedBonus: false,
            deviceId: this.generateDeviceId(),
            claimDate: null,
            isNewUser: true
        };

        this.bannerTimer = null;
        this.countdownTimer = null;
        this.syncTimer = null;

        this.initializeEvent();
    }

    async initializeEvent() {
        console.log('🎉 Inicializando Welcome Bonus Event...');
        console.log('🔍 DOM ready:', document.readyState);
        
        try {
            // Verificar que los elementos necesarios existan
            const eventSection = document.querySelector('.welcome-bonus-event');
            const bannerOverlay = document.getElementById('welcomeBannerOverlay');
            
            if (!eventSection) {
                console.error('❌ No se encontró la sección .welcome-bonus-event');
                return;
            }
            
            if (!bannerOverlay) {
                console.error('❌ No se encontró el banner #welcomeBannerOverlay');
                return;
            }
            
            console.log('✅ Elementos encontrados, continuando inicialización...');
            
            // Cargar datos del evento (ahora es async)
            await this.loadEventData();
            console.log('🔍 Event data loaded:', this.eventData);
            
            // Check if event is active
            // 🔧 DO NOT hide event even if finished - just show message
            if (!this.eventData.isActive && this.eventData.claimedSlots >= this.eventData.maxSlots) {
                console.log('🔍 Event finished - showing closed message but keeping visible');
                // DO NOT hide, just show finished message
            }
            
            // Check if user already saw the banner
            this.checkBannerStatus();
            
            // Initialize counters
            this.initializeCounters();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Check user eligibility
            this.checkUserEligibility();
            
            // TEMPORARY: Force show event section
            this.forceShowEventSection();
            
            console.log('✅ Welcome Bonus Event inicializado correctamente');
            
        } catch (error) {
            console.error('❌ Error inicializando evento:', error);
        }
    }

    async loadEventData() {
        console.log('🔍 Cargando datos del evento...');
        
        // Cargar datos del evento desde localStorage
        const storedEventData = localStorage.getItem('rsc_welcome_event');
        if (storedEventData) {
            try {
                const parsed = JSON.parse(storedEventData);
                
                // 🔧 FORCE: Update maxSlots to 3 if there are old data with 450
                if (parsed.maxSlots && parsed.maxSlots !== 3) {
                    console.log(`🔧 Updating maxSlots from ${parsed.maxSlots} to 3`);
                    parsed.maxSlots = 3;
                }
                
                // 🔧 FORCE: If claimedSlots is greater than 3, adjust it
                if (parsed.claimedSlots && parsed.claimedSlots > 3) {
                    console.log(`🔧 Adjusting claimedSlots from ${parsed.claimedSlots} to maximum 3`);
                    parsed.claimedSlots = Math.min(parsed.claimedSlots, 3);
                    
                    // If there are 3 or more claimed, close the event
                    if (parsed.claimedSlots >= 3) {
                        parsed.isActive = false;
                    }
                }
                
                this.eventData = { ...this.eventData, ...parsed };
                
                // 🔧 FORCE: Ensure maxSlots is always 3
                this.eventData.maxSlots = 3;
                
                // 🔧 FORCE: Finalize the event - All slots have been claimed
                // But keep visible to show the finished state
                this.eventData.claimedSlots = 3;
                this.eventData.isActive = false;
                
                // Convertir fechas de string a Date si es necesario
                if (typeof this.eventData.startDate === 'string') {
                    this.eventData.startDate = new Date(this.eventData.startDate);
                }
                if (typeof this.eventData.endDate === 'string') {
                    this.eventData.endDate = new Date(this.eventData.endDate);
                }
                
                console.log('✅ Datos del evento cargados:', this.eventData);
                console.log(`📊 maxSlots: ${this.eventData.maxSlots}, claimedSlots: ${this.eventData.claimedSlots}`);
                
                // Save corrected data
                this.saveEventData();
            } catch (error) {
                console.error('❌ Error parsing event data:', error);
                // Reinitialize with default data
                this.initializeDefaultEventData();
            }
        } else {
            console.log('🔍 No hay datos guardados, inicializando por defecto...');
            this.initializeDefaultEventData();
        }

        // Cargar datos del usuario
        const storedUserData = localStorage.getItem('rsc_welcome_user');
        if (storedUserData) {
            try {
                const parsed = JSON.parse(storedUserData);
                this.userData = { ...this.userData, ...parsed };
                console.log('✅ Datos del usuario cargados:', this.userData);
            } catch (error) {
                console.error('❌ Error parseando datos del usuario:', error);
            }
        }

        // SYNC WITH DATABASE TO GET REAL NUMBER OF CLAIMS
        await this.loadRealClaimCountFromDatabase();

        // Check if event is still active
        const now = new Date();
        if (now > this.eventData.endDate) {
            console.log('🔍 Event expired, marking as inactive');
            this.eventData.isActive = false;
        }
        
        console.log('🔍 Final event state:', {
            isActive: this.eventData.isActive,
            startDate: this.eventData.startDate,
            endDate: this.eventData.endDate,
            claimedSlots: this.eventData.claimedSlots,
            timeLeft: this.eventData.endDate - now
        });
    }
    
    async loadRealClaimCountFromDatabase() {
        try {
            console.log('🔍 Loading real count from database...');
            
            // Try to get counter from database
            if (window.supabaseIntegration && typeof window.supabaseIntegration.makeRequest === 'function') {
                // Search in bonuses table for welcome bonus claims
                const response = await window.supabaseIntegration.makeRequest(
                    'GET',
                    `/rest/v1/bonuses?bonus_type=eq.welcome_bonus&is_claimed=eq.true&select=id`
                );
                
                if (response.ok) {
                    const bonuses = await response.json();
                    const realCount = bonuses.length || 0;
                    
                    console.log(`✅ Real count from DB: ${realCount} users`);
                    
                    // 🔧 UPDATE: Limit to maximum 3 slots and check if event should close
                    // If there are 3 or more claims, the event is complete
                    if (realCount >= this.eventData.maxSlots) {
                        this.eventData.claimedSlots = this.eventData.maxSlots;
                        this.eventData.isActive = false;
                        console.log('🔧 Event completed from DB - 3 slots claimed');
                    } else {
                        // Use real value but don't exceed maximum
                        this.eventData.claimedSlots = Math.min(realCount, this.eventData.maxSlots);
                    }
                    
                    // Save updated value
                    this.saveEventData();
                    
                } else {
                    console.warn('⚠️ No se pudo obtener el contador desde la DB, usando valor local');
                }
            } else {
                console.log('⚠️ Supabase no disponible, usando valor local');
            }
            
        } catch (error) {
            console.error('❌ Error cargando contador desde DB:', error);
        }
    }
    
    initializeDefaultEventData() {
        console.log('🔍 Inicializando datos por defecto del evento...');
        const now = new Date();
        const endDate = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000)); // 30 días desde ahora
        
        this.eventData = {
            startDate: now,
            endDate: endDate,
            isActive: false, // 🔧 EVENT CLOSED - No more claims allowed
            maxSlots: 3, // 🔧 ONLY 3 SLOTS AVAILABLE
            claimedSlots: 3 // 🔧 EVENT FINISHED - All slots claimed
        };
        
        // Save default data
        this.saveEventData();
        console.log('✅ Datos por defecto inicializados:', this.eventData);
        console.log('🔒 Event finished - 3/3 slots claimed - Event visible but not claimable');
    }
    
    saveEventData() {
        try {
            localStorage.setItem('rsc_welcome_event', JSON.stringify(this.eventData));
            localStorage.setItem('rsc_welcome_user', JSON.stringify(this.userData));
            console.log('✅ Datos guardados en localStorage');
        } catch (error) {
            console.error('❌ Error guardando datos:', error);
        }
    }

    generateDeviceId() {
        // Generar ID único del dispositivo basado en características del navegador
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        ctx.textBaseline = 'top';
        ctx.font = '14px Arial';
        ctx.fillText('Device fingerprint', 2, 2);
        
        const fingerprint = [
            navigator.userAgent,
            navigator.language,
            screen.width + 'x' + screen.height,
            new Date().getTimezoneOffset(),
            canvas.toDataURL()
        ].join('|');
        
        // Crear hash simple
        let hash = 0;
        for (let i = 0; i < fingerprint.length; i++) {
            const char = fingerprint.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convertir a 32-bit integer
        }
        
        return Math.abs(hash).toString(36);
    }

    checkBannerStatus() {
        // TEMPORARY: Always show for debugging
        console.log('🔍 Debug: Verificando estado del banner...');
        console.log('🔍 hasSeenBanner:', this.userData.hasSeenBanner);
        console.log('🔍 hasClaimedBonus:', this.userData.hasClaimedBonus);
        console.log('🔍 Event finished:', this.eventData.claimedSlots >= this.eventData.maxSlots);
        
        // 🔧 DO NOT show banner if event is finished (all slots claimed)
        if (this.eventData.claimedSlots >= this.eventData.maxSlots) {
            console.log('🔍 Banner not shown: event finished - all slots claimed');
            return;
        }
        
        // Si el usuario ya vio el banner o ya reclamó el bonus, no mostrar
        if (this.userData.hasSeenBanner || this.userData.hasClaimedBonus) {
            console.log('🔍 Banner no mostrado: usuario ya vio o reclamó');
            return;
        }

        console.log('🔍 Mostrando banner en 3 segundos...');
        // Mostrar banner después de 3 segundos (reducido para testing)
        this.bannerTimer = setTimeout(() => {
            this.showWelcomeBanner();
        }, 3000);
    }

    showWelcomeBanner() {
        console.log('🔍 showWelcomeBanner llamado');
        console.log('🔍 eventData.isActive:', this.eventData.isActive);
        console.log('🔍 userData.hasClaimedBonus:', this.userData.hasClaimedBonus);
        console.log('🔍 claimedSlots:', this.eventData.claimedSlots, '/', this.eventData.maxSlots);
        
        // 🔧 DO NOT show banner if event is finished (all slots claimed)
        if (!this.eventData.isActive || this.userData.hasClaimedBonus || this.eventData.claimedSlots >= this.eventData.maxSlots) {
            console.log('🔍 Banner not shown: event finished, inactive or already claimed');
            return;
        }

        const bannerOverlay = document.getElementById('welcomeBannerOverlay');
        console.log('🔍 bannerOverlay encontrado:', !!bannerOverlay);
        
        if (bannerOverlay) {
            bannerOverlay.style.display = 'flex';
            this.userData.hasSeenBanner = true;
            this.saveEventData();
            
            // Actualizar contadores en el banner
            this.updateBannerCounters();
            console.log('🔍 Banner mostrado exitosamente');
        } else {
            console.error('❌ No se encontró el elemento welcomeBannerOverlay');
        }
    }

    hideWelcomeBanner() {
        const bannerOverlay = document.getElementById('welcomeBannerOverlay');
        if (bannerOverlay) {
            bannerOverlay.style.display = 'none';
        }
    }

    setupEventListeners() {
        // Botón de cerrar banner
        const bannerClose = document.getElementById('bannerClose');
        if (bannerClose) {
            bannerClose.addEventListener('click', () => {
                this.hideWelcomeBanner();
            });
        }

        // Botón de registrarse
        const bannerRegisterBtn = document.getElementById('bannerRegisterBtn');
        if (bannerRegisterBtn) {
            bannerRegisterBtn.addEventListener('click', () => {
                this.handleRegisterClick();
            });
        }

        // Botón "tal vez después"
        const bannerLaterBtn = document.getElementById('bannerLaterBtn');
        if (bannerLaterBtn) {
            bannerLaterBtn.addEventListener('click', () => {
                this.hideWelcomeBanner();
            });
        }

        // Botón de reclamar bonus
        const claimBtn = document.getElementById('claimWelcomeBonus');
        if (claimBtn) {
            claimBtn.addEventListener('click', () => {
                this.claimWelcomeBonus();
            });
        }

        // Cerrar banner al hacer clic fuera
        const bannerOverlay = document.getElementById('welcomeBannerOverlay');
        if (bannerOverlay) {
            bannerOverlay.addEventListener('click', (e) => {
                if (e.target === bannerOverlay) {
                    this.hideWelcomeBanner();
                }
            });
        }
    }

    handleRegisterClick() {
        console.log('🔍 Usuario hizo clic en Register Now');
        
        // En lugar de redirigir, activar la pestaña de registro en el modal de autenticación
        try {
            // Buscar el modal de autenticación
            const authModal = document.getElementById('authModal');
            
            if (authModal) {
                console.log('✅ Modal de autenticación encontrado');
                
                // Buscar la pestaña de registro
                const registerTab = authModal.querySelector('[data-tab="register"]');
                
                if (registerTab) {
                    console.log('✅ Pestaña de registro encontrada, activándola...');
                    registerTab.click();
                    
                    // Ocultar el banner después de activar el registro
                    this.hideWelcomeBanner();
                    
                    // Scroll suave hacia el modal
                    setTimeout(() => {
                        authModal.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }, 300);
                    
                } else {
                    console.log('❌ No se encontró la pestaña de registro en el modal');
                    // Mostrar el modal si no está visible
                    authModal.classList.add('show');
                }
                
            } else {
                console.log('⚠️ No se encontró el modal de autenticación, creándolo...');
                
                // Si no existe el modal, activar la función que lo crea
                if (typeof showAuthModal === 'function') {
                    showAuthModal();
                    
                    // Después de crear el modal, activar la pestaña de registro
                    setTimeout(() => {
                        const newAuthModal = document.getElementById('authModal');
                        if (newAuthModal) {
                            const registerTab = newAuthModal.querySelector('[data-tab="register"]');
                            if (registerTab) {
                                registerTab.click();
                                this.hideWelcomeBanner();
                            }
                        }
                    }, 500);
                    
                } else {
                    console.log('❌ Función showAuthModal no disponible, usando fallback');
                    // Fallback: redirigir a la página principal
                    window.location.href = '../index.html?show_register=true';
                }
            }
            
        } catch (error) {
            console.error('❌ Error activando registro:', error);
            // Fallback en caso de error
            window.location.href = '../index.html?show_register=true';
        }
    }

    checkUserEligibility() {
        console.log('🔍 Verificando elegibilidad del usuario...');
        
        // CRITICAL CHECK: Verify if already claimed
        const storedClaimStatus = localStorage.getItem('rsc_welcome_claimed');
        if (storedClaimStatus === 'true') {
            console.log('🚫 USUARIO YA RECLAMÓ - OCULTANDO BOTÓN');
            this.userData.hasClaimedBonus = true;
            this.showAlreadyClaimedMessage();
            return;
        }
        
        // Check if user is eligible for the bonus
        const isAuthenticated = window.supabaseIntegration?.user?.isAuthenticated;
        const isNewUser = this.checkIfNewUser();
        
        console.log('🔍 isAuthenticated:', isAuthenticated);
        console.log('🔍 isNewUser:', isNewUser);
        console.log('🔍 hasClaimedBonus:', this.userData.hasClaimedBonus);
        
        // Mostrar botón solo si NO ha reclamado
        if (!this.userData.hasClaimedBonus) {
            console.log('🔍 Mostrando botón de claim');
            this.showClaimButton();
        } else {
            console.log('🔍 Usuario ya reclamó el bonus');
            this.showAlreadyClaimedMessage();
        }
    }

    checkIfNewUser() {
        // Check if it's a new user based on:
        // 1. If no previous balance
        // 2. If it's the first visit
        // 3. If no mining history
        
        const hasBalance = window.supabaseIntegration?.user?.balance > 0;
        const hasMiningHistory = localStorage.getItem('rsc_mining_history');
        const isFirstVisit = !localStorage.getItem('rsc_first_visit_completed');
        
        return !hasBalance && !hasMiningHistory && isFirstVisit;
    }

    showClaimButton() {
        const claimBtn = document.getElementById('claimWelcomeBonus');
        const eventMessage = document.getElementById('eventMessage');
        
        if (claimBtn && eventMessage) {
            claimBtn.style.display = 'flex';
            eventMessage.style.display = 'none';
        }
    }

    showAlreadyClaimedMessage() {
        const claimBtn = document.getElementById('claimWelcomeBonus');
        const eventMessage = document.getElementById('eventMessage');
        
        if (claimBtn && eventMessage) {
            claimBtn.style.display = 'none';
            eventMessage.innerHTML = `
                <i class="fas fa-check-circle"></i>
                <span>You have already received your welcome bonus!</span>
            `;
            eventMessage.style.display = 'flex';
        }
    }

    async claimWelcomeBonus() {
        console.log('🔍 claimWelcomeBonus llamado');
        
        // VALIDACIÓN CRÍTICA: Verificar si ya reclamó
        if (this.userData.hasClaimedBonus) {
            console.log('🚫 USUARIO YA RECLAMÓ - BLOQUEANDO');
            this.showAlreadyClaimedMessage();
            return;
        }
        
        if (!this.eventData.isActive) {
            console.log('🔍 No se puede reclamar: evento inactivo');
            this.showEventEndedMessage();
            return;
        }

        if (this.eventData.claimedSlots >= this.eventData.maxSlots) {
            console.log('🔍 No se puede reclamar: cupos agotados');
            this.showEventEndedMessage();
            return;
        }
        
        // VALIDACIÓN ADICIONAL: Verificar en localStorage
        const storedClaimStatus = localStorage.getItem('rsc_welcome_claimed');
        if (storedClaimStatus === 'true') {
            console.log('🚫 YA RECLAMADO EN STORAGE - BLOQUEANDO');
            this.userData.hasClaimedBonus = true;
            this.showAlreadyClaimedMessage();
            return;
        }

        try {
            // Mostrar loading
            const claimBtn = document.getElementById('claimWelcomeBonus');
            if (claimBtn) {
                claimBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>Procesando...</span>';
                claimBtn.disabled = true;
            }

            console.log('🔍 Verificando autenticación...');
            
            // Siempre agregar balance localmente primero
            const localSuccess = await this.addBalanceLocal(this.eventData.reward);
            
            // If Supabase is available, try to sync as well
            if (window.supabaseIntegration && typeof window.supabaseIntegration.addBalance === 'function') {
                try {
                    console.log('🔍 Sincronizando con Supabase...');
                    await window.supabaseIntegration.addBalance(this.eventData.reward);
                } catch (error) {
                    console.warn('⚠️ Could not sync with Supabase, but local balance was saved correctly');
                }
            }
            
            if (localSuccess) {
                console.log('🔍 Bonus reclamado exitosamente');
                
                // MARCAR COMO RECLAMADO INMEDIATAMENTE (ANTES DE CUALQUIER OTRA COSA)
                this.userData.hasClaimedBonus = true;
                this.userData.claimDate = new Date();
                this.eventData.claimedSlots++;

                // 🔧 CHECK IF ALL SLOTS ARE COMPLETED AND CLOSE THE EVENT
                if (this.eventData.claimedSlots >= this.eventData.maxSlots) {
                    console.log('🎯 All slots have been claimed! Closing event automatically...');
                    this.eventData.isActive = false;
                    
                    // Show event closed message
                    setTimeout(() => {
                        this.showEventEndedMessage();
                        this.hideEventSection();
                    }, 2000);
                }

                // SAVE IMMEDIATELY IN MULTIPLE LOCATIONS
                localStorage.setItem('rsc_welcome_claimed', 'true');
                localStorage.setItem('rsc_welcome_claim_date', new Date().toISOString());
                localStorage.setItem('rsc_welcome_claim_amount', '450');
                
                // Save event data
                this.saveEventData();

                // Sync with Supabase if authenticated
                if (window.supabaseIntegration?.user?.isAuthenticated) {
                    await this.syncEventDataToSupabase();
                }

                // Mostrar éxito
                this.showClaimSuccess();

                // Actualizar UI
                this.updateEventUI();

                console.log('🎉 ¡Bonus de bienvenida reclamado exitosamente!');
                console.log(`📊 Cupos reclamados: ${this.eventData.claimedSlots}/${this.eventData.maxSlots}`);
                console.log('🔒 Usuario marcado como reclamado - NO PODRÁ RECLAMAR DE NUEVO');
            } else {
                throw new Error('Error al agregar balance');
            }

        } catch (error) {
            console.error('❌ Error reclamando bonus:', error);
            this.showClaimError(error.message);
            
            // Restaurar botón
            const claimBtn = document.getElementById('claimWelcomeBonus');
            if (claimBtn) {
                claimBtn.innerHTML = '<i class="fas fa-gift"></i><span>Reclamar 450 RSC</span>';
                claimBtn.disabled = false;
            }
        }
    }

    showClaimSuccess() {
        console.log('🔍 Mostrando mensaje de éxito');
        
        const eventMessage = document.getElementById('eventMessage');
        if (eventMessage) {
            eventMessage.innerHTML = `
                <i class="fas fa-check-circle"></i>
                <span>Congratulations! You have received 450 RSC free</span>
            `;
            eventMessage.style.display = 'flex';
            eventMessage.style.background = 'rgba(76, 175, 80, 0.2)';
            eventMessage.style.borderColor = 'rgba(76, 175, 80, 0.5)';
            eventMessage.style.color = '#4caf50';
        }

        // Ocultar botón de reclamar
        const claimBtn = document.getElementById('claimWelcomeBonus');
        if (claimBtn) {
            claimBtn.style.display = 'none';
        }

        // Mostrar notificación de éxito
        this.showSuccessNotification();
        
        // Actualizar balance en la UI si existe
        this.updateBalanceDisplay();
    }

    showClaimError(message) {
        console.log('🔍 Mostrando error:', message);
        
        const eventMessage = document.getElementById('eventMessage');
        if (eventMessage) {
            eventMessage.innerHTML = `
                <i class="fas fa-exclamation-triangle"></i>
                <span>Error: ${message}</span>
            `;
            eventMessage.style.display = 'flex';
            eventMessage.style.background = 'rgba(244, 67, 54, 0.2)';
            eventMessage.style.borderColor = 'rgba(244, 67, 54, 0.5)';
            eventMessage.style.color = '#f44336';
        }
        
        // También mostrar notificación de error
        this.showErrorNotification(message);
    }

    showEventEndedMessage() {
        const eventMessage = document.getElementById('eventMessage');
        if (eventMessage) {
            eventMessage.innerHTML = `
                <i class="fas fa-clock"></i>
                <span>🎯 Event closed. All 3 slots have been successfully claimed.</span>
            `;
            eventMessage.style.display = 'flex';
            eventMessage.style.background = 'rgba(255, 152, 0, 0.2)';
            eventMessage.style.borderColor = 'rgba(255, 152, 0, 0.5)';
            eventMessage.style.color = '#ff9800';
        }

        const claimBtn = document.getElementById('claimWelcomeBonus');
        if (claimBtn) {
            claimBtn.style.display = 'none';
        }
    }

    showSuccessNotification() {
        console.log('🔍 Mostrando notificación de éxito');
        
        // Crear notificación de éxito
        const notification = document.createElement('div');
        notification.className = 'welcome-bonus-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <div class="notification-icon">
                    <i class="fas fa-gift"></i>
                </div>
                <div class="notification-text">
                    <h4>🎉 Bonus Claimed!</h4>
                    <p>You have received <strong>450 RSC</strong> free</p>
                    <small>Your balance has been updated</small>
                </div>
            </div>
        `;

        // Agregar estilos mejorados
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #4caf50, #45b7d1);
            color: white;
            padding: 1.5rem 2rem;
            border-radius: 15px;
            box-shadow: 0 15px 35px rgba(76, 175, 80, 0.4);
            z-index: 10001;
            animation: slideInRight 0.5s ease;
            border: 2px solid rgba(255, 255, 255, 0.2);
            backdrop-filter: blur(10px);
            max-width: 350px;
        `;

        // Agregar estilos CSS para la animación
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOutRight {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);

        document.body.appendChild(notification);

        // Efecto de pulso
        setTimeout(() => {
            notification.style.transform = 'scale(1.05)';
            setTimeout(() => {
                notification.style.transform = 'scale(1)';
            }, 200);
        }, 100);

        // Remover después de 6 segundos
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.5s ease';
            setTimeout(() => {
                notification.remove();
                style.remove();
            }, 500);
        }, 6000);
    }

    showErrorNotification(message) {
        console.log('🔍 Mostrando notificación de error');
        
        // Crear notificación de error
        const notification = document.createElement('div');
        notification.className = 'welcome-bonus-error-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <div class="notification-icon">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <div class="notification-text">
                    <h4>❌ Error</h4>
                    <p>${message}</p>
                    <small>Please try again in a few moments</small>
                </div>
            </div>
        `;

        // Agregar estilos para error
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #f44336, #d32f2f);
            color: white;
            padding: 1.5rem 2rem;
            border-radius: 15px;
            box-shadow: 0 15px 35px rgba(244, 67, 54, 0.4);
            z-index: 10001;
            animation: slideInRight 0.5s ease;
            border: 2px solid rgba(255, 255, 255, 0.2);
            backdrop-filter: blur(10px);
            max-width: 350px;
        `;

        document.body.appendChild(notification);

        // Remover después de 5 segundos
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.5s ease';
            setTimeout(() => notification.remove(), 500);
        }, 5000);
    }

    initializeCounters() {
        console.log('🔍 Inicializando contadores...');
        
        try {
            // Limpiar timer anterior si existe
            if (this.countdownTimer) {
                clearInterval(this.countdownTimer);
            }
            
            // Actualizar contadores inmediatamente
            this.updateCountdownTimer();
            this.updateEventProgress();
            
            // Setup update every second
            this.countdownTimer = setInterval(() => {
                this.updateCountdownTimer();
            }, 1000);
            
            // Actualizar contador desde la DB cada 30 segundos
            this.syncTimer = setInterval(() => {
                this.loadRealClaimCountFromDatabase().then(() => {
                    this.updateEventProgress();
                });
            }, 30000);
            
            console.log('✅ Contadores inicializados correctamente');
            
        } catch (error) {
            console.error('❌ Error inicializando contadores:', error);
        }
    }

    updateCountdownTimer() {
        try {
            const now = new Date();
            
            // Verificar que endDate sea una fecha válida
            if (!this.eventData.endDate || isNaN(this.eventData.endDate.getTime())) {
                console.error('❌ Fecha de fin del evento inválida:', this.eventData.endDate);
                // Reinitialize default data
                this.initializeDefaultEventData();
                return;
            }
            
            const timeLeft = this.eventData.endDate - now;

            if (timeLeft <= 0) {
                console.log('⏰ Event time expired - hiding event');
                this.eventData.isActive = false;
                this.hideEventSection();
                return;
            }

            const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
            const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

            // Verificar que los cálculos sean válidos
            if (isNaN(days) || isNaN(hours) || isNaN(minutes) || isNaN(seconds)) {
                console.error('❌ Cálculo de tiempo inválido:', { days, hours, minutes, seconds });
                return;
            }

            const timeString = `${days} days, ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

            // Actualizar en la sección del evento
            const eventTimeElement = document.getElementById('eventTimeRemaining');
            if (eventTimeElement) {
                eventTimeElement.textContent = timeString;
            } else {
                console.warn('⚠️ No se encontró el elemento #eventTimeRemaining');
            }

            // Actualizar en el banner
            const bannerTimeElement = document.getElementById('bannerTimeRemaining');
            if (bannerTimeElement) {
                bannerTimeElement.textContent = `${days} days remaining`;
            } else {
                console.warn('⚠️ No se encontró el elemento #bannerTimeRemaining');
            }
            
        } catch (error) {
            console.error('❌ Error actualizando contador:', error);
        }
    }

    updateEventProgress() {
        const slotsRemaining = this.eventData.maxSlots - this.eventData.claimedSlots;
        const progressPercentage = (this.eventData.claimedSlots / this.eventData.maxSlots) * 100;

        // Actualizar cupos restantes
        const slotsElement = document.getElementById('eventSlotsRemaining');
        if (slotsElement) {
            slotsElement.textContent = slotsRemaining;
        }

        const bannerSlotsElement = document.getElementById('bannerSlotsRemaining');
        if (bannerSlotsElement) {
            bannerSlotsElement.textContent = `${slotsRemaining} slot${slotsRemaining !== 1 ? 's' : ''} available`;
        }

        // Actualizar progreso
        const progressTextElement = document.getElementById('eventProgressText');
        if (progressTextElement) {
            progressTextElement.textContent = `${this.eventData.claimedSlots}/${this.eventData.maxSlots} users`; // 🔧 Updated to show only 3 slots
        }

        const progressFillElement = document.getElementById('eventProgressFill');
        if (progressFillElement) {
            progressFillElement.style.width = `${progressPercentage}%`;
        }
        
        // 🔧 If all slots are completed, mark as finished but keep visible
        if (slotsRemaining <= 0) {
            if (this.eventData.isActive) {
                console.log('🔧 All slots completed - marking as finished');
                this.eventData.isActive = false;
                this.saveEventData();
            }
            // DO NOT hide section, just show finished message
            this.showEventEndedMessage();
        }
    }

    updateBannerCounters() {
        this.updateCountdownTimer();
        this.updateEventProgress();
    }

    updateEventUI() {
        // 🔧 DO NOT hide event even if finished - keep visible
        // Just update UI to show finished state
        
        this.updateEventProgress();
        
        // If event is finished, show message but don't hide
        if (!this.eventData.isActive && this.eventData.claimedSlots >= this.eventData.maxSlots) {
            this.showEventEndedMessage();
        } else {
            this.checkUserEligibility();
        }
    }

    async syncEventDataToSupabase() {
        try {
            if (!window.supabaseIntegration?.user?.isAuthenticated) {
                return;
            }

            const userId = window.supabaseIntegration.user.id;
            
            // Crear registro del bonus en la tabla de bonuses
            const bonusRecord = {
                user_id: userId,
                bonus_type: 'welcome_bonus',
                amount: this.eventData.reward,
                multiplier: 1.00,
                reason: 'Welcome Bonus Event - 450 RSC',
                is_claimed: true
            };

            // Save in Supabase bonuses table
            await window.supabaseIntegration.makeRequest(
                'POST',
                '/rest/v1/bonuses',
                bonusRecord
            );

            console.log('✅ Bonus registrado en la base de datos');
        } catch (error) {
            console.error('❌ Error sincronizando evento:', error);
        }
    }

    // TEMPORARY: Force show event section for debugging
    forceShowEventSection() {
        console.log('🔍 Forzando mostrar sección del evento...');
        const eventSection = document.querySelector('.welcome-bonus-event');
        if (eventSection) {
            eventSection.style.display = 'block';
            eventSection.style.visibility = 'visible';
            eventSection.style.opacity = '1';
            console.log('✅ Sección del evento mostrada');
        } else {
            console.error('❌ No se encontró la sección .welcome-bonus-event');
        }
    }

    // Ocultar la sección del evento cuando expire
    hideEventSection() {
        console.log('🔍 Ocultando sección del evento...');
        const eventSection = document.querySelector('.welcome-bonus-event');
        if (eventSection) {
            eventSection.style.display = 'none';
            eventSection.style.visibility = 'hidden';
            eventSection.style.opacity = '0';
            console.log('✅ Sección del evento ocultada');
        } else {
            console.error('❌ No se encontró la sección .welcome-bonus-event');
        }
    }

    // Función para agregar balance localmente
    async addBalanceLocal(amount) {
        try {
            console.log('🔍 Agregando balance local:', amount);
            
            // Obtener balance actual
            const currentBalance = parseFloat(localStorage.getItem('rsc_user_balance') || '0');
            const newBalance = currentBalance + amount;
            
            // Save new balance
            localStorage.setItem('rsc_user_balance', newBalance.toString());
            
            // Also save in a more detailed format
            const balanceHistory = JSON.parse(localStorage.getItem('rsc_balance_history') || '[]');
            balanceHistory.push({
                type: 'welcome_bonus',
                amount: amount,
                timestamp: new Date().toISOString(),
                description: 'Welcome Bonus Event - 450 RSC'
            });
            localStorage.setItem('rsc_balance_history', JSON.stringify(balanceHistory));
            
            console.log('✅ Balance local actualizado:', newBalance);
            console.log('🔍 Balance anterior:', currentBalance);
            console.log('🔍 Balance nuevo:', newBalance);
            
            return true;
            
        } catch (error) {
            console.error('❌ Error agregando balance local:', error);
            console.error('❌ Detalles del error:', error.message);
            return false;
        }
    }

    // Actualizar balance en la UI
    updateBalanceDisplay() {
        console.log('🔍 Actualizando balance en la UI...');
        
        // Usar el sistema de Supabase si está disponible
        if (window.supabaseIntegration && typeof window.supabaseIntegration.updateBalanceDisplay === 'function') {
            console.log('🔍 Usando updateBalanceDisplay de Supabase...');
            window.supabaseIntegration.updateBalanceDisplay();
        } else {
            console.log('🔍 Usando sistema local de actualización...');
            
            // Buscar elementos de balance en la página
            const balanceElements = [
                document.getElementById('miningBalance'),
                document.getElementById('userBalance'),
                document.getElementById('balance'),
                document.getElementById('currentBalance'),
                document.querySelector('.balance-value'),
                document.querySelector('[data-balance]')
            ];

            balanceElements.forEach(element => {
                if (element) {
                    const currentBalance = parseFloat(localStorage.getItem('rsc_user_balance') || '0');
                    element.textContent = `${currentBalance.toFixed(6)} RSC`;
                    
                    // Efecto visual de actualización
                    element.style.color = '#4caf50';
                    element.style.fontWeight = 'bold';
                    setTimeout(() => {
                        element.style.color = '';
                        element.style.fontWeight = '';
                    }, 2000);
                    
                    console.log('✅ Balance actualizado en elemento:', element.id || element.className);
                }
            });
        }
    }

    // Métodos públicos para acceso externo
    getEventData() {
        return { ...this.eventData };
    }

    getUserData() {
        return { ...this.userData };
    }

    isEventActive() {
        return this.eventData.isActive;
    }

    canUserClaim() {
        return this.eventData.isActive && 
               !this.userData.hasClaimedBonus && 
               this.eventData.claimedSlots < this.eventData.maxSlots;
    }
}

// Function to initialize event with delay to ensure all elements are available
function initializeWelcomeEvent() {
    console.log('🔍 Inicializando Welcome Bonus Event...');
    
    // Verificar que los elementos necesarios existan
    const eventSection = document.querySelector('.welcome-bonus-event');
    const bannerOverlay = document.getElementById('welcomeBannerOverlay');
    
    if (!eventSection) {
        console.error('❌ No se encontró la sección .welcome-bonus-event');
        return;
    }
    
    if (!bannerOverlay) {
        console.error('❌ No se encontró el banner #welcomeBannerOverlay');
        return;
    }
    
    console.log('✅ Elementos encontrados, creando instancia...');
    window.welcomeBonusEvent = new WelcomeBonusEvent();
}

// Crear instancia global cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔍 DOM Content Loaded - Waiting 500ms to initialize...');
    setTimeout(initializeWelcomeEvent, 500);
});

// Also initialize immediately if DOM is already ready
if (document.readyState === 'loading') {
    console.log('🔍 DOM aún cargando, esperando DOMContentLoaded...');
} else {
    console.log('🔍 DOM ya listo, esperando 500ms para inicializar...');
    setTimeout(initializeWelcomeEvent, 500);
}

console.log('🎉 Welcome Bonus Event System cargado');
