/* ===== SISTEMA DE MINERÍA RSC AVANZADO Y FUNCIONAL ===== */

class RSCMiningSystem {
    constructor() {
        this.isMining = false;
        this.miningSession = null;
        this.hashPower = 5;
        this.sessionDuration = 24 * 60 * 60 * 1000; // 24 horas
        this.tokenCalculationInterval = null;
        this.uiUpdateInterval = null;
        this.backendSyncInterval = null;
        this.lastSaveTime = 0;
        this.lastBackendSync = 0;
        this.currentUser = null;
        this.miningStats = {
            totalTokens: 0,
            activeTime: 0,
            hashRate: 0,
            level: 1,
            efficiency: 100
        };
        
        this.init();
    }

    async init() {
        console.log('🚀 Sistema de minería RSC avanzado inicializando...');
        
        try {
            // Verificar autenticación
            await this.checkAuthentication();
            
            // Configurar eventos
            this.setupEventListeners();
            
            // Cargar datos existentes
            await this.loadMiningData();
            
            // Iniciar sincronización con Supabase
            this.startSupabaseSync();
            
            // Iniciar actualización de UI
            this.startUIUpdates();
            
            console.log('✅ Sistema de minería RSC avanzado inicializado correctamente');
            
        } catch (error) {
            console.error('❌ Error inicializando sistema de minería:', error);
            this.showNotification('error', 'Error del Sistema', 'No se pudo inicializar el sistema de minería');
        }
    }

    async checkAuthentication() {
        try {
            // Intentar obtener usuario autenticado de la API
            const token = localStorage.getItem('rsc_auth_token');
            if (token) {
                // const response = await fetch('https://rsc-chain-production.up.railway.app/api/auth/me', {
        // Backend desconectado - usando datos simulados
        const response = { ok: true, json: () => Promise.resolve({ 
          user: { id: 'offline-user', username: 'Usuario Offline' },
          status: 'offline'
        })};
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                
                if (response.ok) {
                    const userData = await response.json();
                    this.currentUser = userData.user;
                    console.log('✅ Usuario autenticado:', this.currentUser.username);
                    return;
                }
            }
        } catch (error) {
            console.warn('⚠️ No se pudo verificar autenticación:', error.message);
        }
        
        // Fallback para desarrollo
        this.currentUser = {
            id: 'user_' + Date.now(),
            username: 'Usuario_RSC',
            walletAddress: '0x' + Math.random().toString(16).substr(2, 40),
            email: 'usuario@rsc.local'
        };
        console.log('⚠️ Usando usuario de desarrollo (no autenticado)');
    }

    setupEventListeners() {
        // Botón de inicio de minería
        const startBtn = document.getElementById('startMiningBtn');
        if (startBtn) {
            startBtn.addEventListener('click', () => this.startMining());
        }

        // Botón de parada de minería
        const stopBtn = document.getElementById('stopMiningBtn');
        if (stopBtn) {
            stopBtn.addEventListener('click', () => this.stopMining());
        }

        // Botón de reclamar recompensas
        const claimBtn = document.getElementById('claimBtn');
        if (claimBtn) {
            claimBtn.addEventListener('click', () => this.claimRewards());
        }

        // Botón de reclamar
        const claimBtn = document.getElementById('claimBtn');
        if (claimBtn) {
            claimBtn.addEventListener('click', () => this.claimTokens());
        }

        // Slider de intensidad
        const intensitySlider = document.getElementById('miningIntensity');
        if (intensitySlider) {
            intensitySlider.addEventListener('input', (e) => {
                this.hashPower = parseInt(e.target.value);
                this.updateIntensityDisplay();
                if (this.isMining) {
                    this.updateMiningSession();
                }
            });
        }

        // Botón de refresh
        const refreshBtn = document.getElementById('refreshBtn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.refreshMiningData());
        }

        // Navegación por secciones
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchSection(item.dataset.section);
            });
        });

        // Eventos de visibilidad de página
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                console.log('📱 Página oculta - Minería continúa en segundo plano');
                this.ensureBackgroundMining();
            } else {
                console.log('📱 Página visible - Actualizando UI');
                this.updateMiningUI();
                this.syncWithBackend();
            }
        });

        // Evento antes de cerrar la página
        window.addEventListener('beforeunload', () => {
            if (this.isMining) {
                console.log('🚪 Página cerrando - Guardando estado de minería');
                this.saveMiningData();
                return 'La minería continuará funcionando. ¿Estás seguro?';
            }
        });

        // Evento cuando la página se vuelve a cargar
        window.addEventListener('load', () => {
            console.log('📱 Página cargada - Verificando estado de minería');
            setTimeout(() => {
                this.loadMiningData();
                this.syncWithBackend();
            }, 1000);
        });
    }

    async startMining() {
        if (this.isMining) {
            this.showNotification('warning', 'Ya estás minando', 'La minería ya está activa');
            return;
        }

        console.log('🚀 Iniciando minería para usuario:', this.currentUser.username);

        try {
            // Crear sesión de minería de 24 horas
            this.miningSession = {
                id: this.generateSessionId(),
                startTime: new Date().toISOString(),
                endTime: new Date(Date.now() + this.sessionDuration).toISOString(),
                isActive: true,
                hashPower: this.hashPower,
                walletAddress: this.currentUser.walletAddress,
                userId: this.currentUser.id,
                totalTokens: 0,
                lastUpdate: new Date().toISOString(),
                createdAt: new Date().toISOString()
            };

            this.isMining = true;

            // Iniciar cálculo de tokens en segundo plano
            this.startTokenCalculation();
            
            // Guardar datos localmente
            this.saveMiningData();
            
            // Sincronizar con Supabase si está disponible
            if (window.supabaseMining && window.supabaseMining.isConnected) {
                try {
                    await window.supabaseMining.startMiningSession(this.miningSession);
                    console.log('✅ Sesión de minería iniciada en Supabase');
                } catch (supabaseError) {
                    console.warn('⚠️ No se pudo iniciar sesión en Supabase:', supabaseError.message);
                }
            }

            // Actualizar UI
            this.updateMiningUI();
            
            this.showNotification('success', '¡Minería Iniciada!', 'Comenzaste a minar RSC por 24 horas');

            console.log('✅ Minería iniciada exitosamente:', this.miningSession);

        } catch (error) {
            console.error('❌ Error iniciando minería:', error);
            this.showNotification('error', 'Error de Minería', error.message);
            this.isMining = false;
            this.miningSession = null;
            this.updateMiningUI();
        }
    }

    stopMining() {
        if (!this.isMining) {
            this.showNotification('warning', 'No estás minando', 'No hay minería activa para detener');
            return;
        }

        console.log('⏹️ Deteniendo minería');
        
        this.isMining = false;
        
        if (this.miningSession) {
            this.miningSession.isActive = false;
            this.miningSession.endTime = new Date().toISOString();
            this.saveMiningData();
        }

        // Detener cálculo de tokens
        this.stopTokenCalculation();
        
        // Sincronizar con Supabase si está disponible
        if (window.supabaseMining && window.supabaseMining.isConnected) {
            try {
                await window.supabaseMining.completeMiningSession(
                    this.miningSession.id,
                    {
                        totalTokens: this.miningSession.totalTokens,
                        hashPower: this.hashPower
                    }
                );
                console.log('✅ Sesión de minería completada en Supabase');
            } catch (supabaseError) {
                console.warn('⚠️ No se pudo completar sesión en Supabase:', supabaseError.message);
            }
        }
        
        this.updateMiningUI();
        this.showNotification('info', 'Minería Detenida', 'Has detenido la minería manualmente');
    }

    startTokenCalculation() {
        if (this.tokenCalculationInterval) {
            clearInterval(this.tokenCalculationInterval);
        }

        // Calcular tokens cada segundo
        this.tokenCalculationInterval = setInterval(() => {
            if (this.isMining && this.miningSession && this.miningSession.isActive) {
                this.calculateTokens();
                
                // Verificar si la sesión ha expirado
                const now = new Date();
                const endTime = new Date(this.miningSession.endTime);
                
                if (now >= endTime) {
                    console.log('🎉 Sesión de minería completada');
                    this.completeMiningSession();
                }
            }
        }, 1000);

        console.log('⚡ Cálculo de tokens iniciado');
    }

    stopTokenCalculation() {
        if (this.tokenCalculationInterval) {
            clearInterval(this.tokenCalculationInterval);
            this.tokenCalculationInterval = null;
        }
        console.log('⏹️ Cálculo de tokens detenido');
    }

    calculateTokens() {
        if (!this.miningSession || !this.miningSession.isActive) return;

        const now = new Date();
        const startTime = new Date(this.miningSession.startTime);
        const elapsed = (now - startTime) / 1000; // segundos
        
        // Calcular tokens basado en tiempo transcurrido y hash power
        const baseRate = 0.001; // tokens por segundo base
        const hashMultiplier = this.miningSession.hashPower / 5; // multiplicador por intensidad
        const timeMultiplier = Math.min(elapsed / 3600, 24); // máximo 24 horas
        
        const tokensEarned = baseRate * hashMultiplier * timeMultiplier;
        
        this.miningSession.totalTokens = tokensEarned;
        this.miningSession.lastUpdate = now.toISOString();
        
        // Actualizar estadísticas
        this.miningStats.totalTokens = tokensEarned;
        this.miningStats.activeTime = elapsed;
        this.miningStats.hashRate = this.hashPower * 1000;
        this.miningStats.level = this.calculateLevel(tokensEarned);
        this.miningStats.efficiency = this.calculateEfficiency(elapsed);
        
        // Guardar datos cada 10 segundos
        const currentTime = Date.now();
        if (currentTime - this.lastSaveTime > 10000) {
            this.saveMiningData();
            this.lastSaveTime = currentTime;
        }
        
        // Sincronizar con Supabase cada 30 segundos
        if (currentTime - this.lastBackendSync > 30000) {
            this.syncWithSupabase();
            this.lastBackendSync = currentTime;
        }
    }

    completeMiningSession() {
        console.log('🎉 Sesión de minería completada');
        
        this.isMining = false;
        
        if (this.miningSession) {
            this.miningSession.isActive = false;
            this.miningSession.endTime = new Date().toISOString();
            this.saveMiningData();
        }

        // Detener cálculo de tokens
        this.stopTokenCalculation();
        
        // Sincronizar con Supabase si está disponible
        if (window.supabaseMining && window.supabaseMining.isConnected) {
            try {
                await window.supabaseMining.completeMiningSession(
                    this.miningSession.id,
                    {
                        totalTokens: this.miningSession.totalTokens,
                        hashPower: this.hashPower
                    }
                );
                console.log('✅ Sesión de minería completada en Supabase');
            } catch (supabaseError) {
                console.warn('⚠️ No se pudo completar sesión en Supabase:', supabaseError.message);
            }
        }
        
        this.updateMiningUI();
        
        // Mostrar notificación de sesión completada
        this.showNotification('success', '¡Minería Completada!', 
            `Has completado tu sesión de 24h. Minaste ${this.formatNumber(this.miningSession.totalTokens || 0)} RSC`);
        
        // Mostrar resumen de la sesión
        this.showMiningSummary(this.miningSession);
    }

    startSupabaseSync() {
        // Sincronizar con Supabase cada 30 segundos
        this.backendSyncInterval = setInterval(() => {
            if (this.isMining) {
                this.syncWithSupabase();
            }
        }, 30000);

        console.log('🔄 Sincronización con Supabase iniciada');
    }

    async syncWithSupabase() {
        if (!this.miningSession) return;

        try {
            // Sincronizar con Supabase si está disponible
            if (window.supabaseMining && window.supabaseMining.isConnected) {
                await window.supabaseMining.updateMiningProgress(
                    this.miningSession.id,
                    {
                        totalTokens: this.miningSession.totalTokens,
                        hashPower: this.hashPower,
                        elapsed: this.getElapsedTime()
                    }
                );
                console.log('✅ Progreso sincronizado con Supabase');
            } else {
                console.log('🔄 Supabase no disponible, continuando en modo local');
            }
        } catch (error) {
            console.log('🔄 Error sincronizando con Supabase:', error.message);
        }
    }

    startUIUpdates() {
        // Actualizar UI cada segundo
        this.uiUpdateInterval = setInterval(() => {
            if (this.isMining) {
                this.updateMiningUI();
            }
        }, 1000);

        console.log('🎨 Actualizaciones de UI iniciadas');
    }

    updateMiningUI() {
        if (!this.miningSession) return;

        // Actualizar botones
        const startBtn = document.getElementById('startMiningBtn');
        const stopBtn = document.getElementById('stopMiningBtn');
        
        if (startBtn) startBtn.disabled = this.isMining;
        if (stopBtn) stopBtn.disabled = !this.isMining;

        // Mostrar/ocultar banner principal de minería activa
        const activeBanner = document.getElementById('activeMiningBanner');
        if (activeBanner) {
            if (this.isMining && this.miningSession.isActive) {
                activeBanner.style.display = 'block';
                document.body.classList.add('has-active-mining');
                
                // Actualizar texto del banner
                const statusText = document.getElementById('bannerStatusText');
                if (statusText) {
                    const timeRemaining = this.getTimeRemaining(this.miningSession.endTime);
                    if (timeRemaining > 0) {
                        const hours = Math.floor(timeRemaining / (1000 * 60 * 60));
                        const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
                        statusText.textContent = `${hours}h ${minutes}m restantes`;
                    } else {
                        statusText.textContent = 'Completando...';
                    }
                }
            } else {
                activeBanner.style.display = 'none';
                document.body.classList.remove('has-active-mining');
            }
        }

        // Mostrar/ocultar barra de progreso
        const progressContainer = document.getElementById('sessionProgressContainer');
        if (progressContainer) {
            progressContainer.style.display = this.isMining ? 'block' : 'none';
        }

        // Mostrar/ocultar indicador de minería en segundo plano
        const backgroundIndicator = document.getElementById('backgroundMiningIndicator');
        if (backgroundIndicator) {
            backgroundIndicator.style.display = this.isMining ? 'block' : 'none';
        }

        // Actualizar estadísticas del usuario
        this.updateUserStats();
        
        // Actualizar progreso de la sesión
        this.updateSessionProgress();
        
        // Actualizar intensidad
        this.updateIntensityDisplay();
    }

    updateUserStats() {
        if (!this.miningSession) return;

        // Actualizar elementos en la UI
        const hashRateElement = document.getElementById('myHashRate');
        const minedRSCElement = document.getElementById('myMinedRSC');
        const activeTimeElement = document.getElementById('myActiveTime');
        const levelElement = document.getElementById('myLevel');

        if (hashRateElement) hashRateElement.textContent = this.formatNumber(this.miningStats.hashRate) + ' H/s';
        if (minedRSCElement) minedRSCElement.textContent = this.formatNumber(this.miningStats.totalTokens) + ' RSC';
        if (activeTimeElement) activeTimeElement.textContent = this.formatTime(this.miningStats.activeTime);
        if (levelElement) levelElement.textContent = 'Nivel ' + this.miningStats.level;
    }

    updateSessionProgress() {
        if (!this.miningSession || !this.miningSession.isActive) return;

        const now = new Date();
        const startTime = new Date(this.miningSession.startTime);
        const endTime = new Date(this.miningSession.endTime);
        
        const totalDuration = endTime - startTime;
        const elapsed = now - startTime;
        const progress = Math.min((elapsed / totalDuration) * 100, 100);

        // Actualizar barra de progreso si existe
        const progressBar = document.getElementById('sessionProgressBar');
        if (progressBar) {
            progressBar.style.width = progress + '%';
        }

        // Mostrar tiempo restante
        const timeRemaining = endTime - now;
        if (timeRemaining > 0) {
            const hours = Math.floor(timeRemaining / (1000 * 60 * 60));
            const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
            
            const timeElement = document.querySelector('.session-time-remaining');
            if (timeElement) {
                timeElement.textContent = `${hours}h ${minutes}m restantes`;
            }
        }
    }

    updateIntensityDisplay() {
        const intensityValue = document.getElementById('intensityValue');
        if (intensityValue) {
            const labels = ['Muy Baja', 'Baja', 'Media', 'Alta', 'Muy Alta'];
            const index = Math.floor((this.hashPower - 1) / 2);
            intensityValue.textContent = labels[index] || 'Media';
        }

        const intensitySlider = document.getElementById('miningIntensity');
        if (intensitySlider) {
            intensitySlider.value = this.hashPower;
        }
    }

    switchSection(sectionName) {
        // Ocultar todas las secciones
        const sections = document.querySelectorAll('.mining-section');
        sections.forEach(section => {
            section.classList.remove('active');
        });

        // Mostrar la sección seleccionada
        const targetSection = document.getElementById(sectionName);
        if (targetSection) {
            targetSection.classList.add('active');
        }

        // Actualizar navegación
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.classList.remove('active');
            if (item.dataset.section === sectionName) {
                item.classList.add('active');
            }
        });

        // Cargar datos específicos de la sección
        this.loadSectionData(sectionName);
    }

    async loadSectionData(sectionName) {
        switch (sectionName) {
            case 'progress':
                this.loadProgressData();
                break;
            case 'claim':
                this.loadClaimData();
                break;
            case 'ranking':
                this.loadRankingData();
                break;
            case 'levels':
                this.loadLevelsData();
                break;
            case 'analytics':
                this.loadAnalyticsData();
                break;
        }
    }

    async loadProgressData() {
        // Cargar datos de progreso
        console.log('📊 Cargando datos de progreso...');
        
        // Actualizar gráficos si existen
        this.updateProgressCharts();
    }

    async loadClaimData() {
        // Cargar datos de reclamación
        console.log('🎁 Cargando datos de reclamación...');
        
        const claimableRSC = this.miningStats.totalTokens || 0;
        const claimableElement = document.getElementById('claimableRSC');
        if (claimableElement) {
            claimableElement.textContent = this.formatNumber(claimableRSC) + ' RSC';
        }
    }

    async loadRankingData() {
        // Cargar datos de ranking
        console.log('🏆 Cargando datos de ranking...');
        
        // Simular ranking (en producción vendría del backend)
        this.updateRankingDisplay();
    }

    async loadLevelsData() {
        // Cargar datos de niveles
        console.log('⭐ Cargando datos de niveles...');
        
        this.updateLevelsDisplay();
    }

    async loadAnalyticsData() {
        // Cargar datos de analytics
        console.log('📈 Cargando datos de analytics...');
        
        this.updateAnalyticsCharts();
    }

    updateProgressCharts() {
        // Actualizar gráficos de progreso si existen
        console.log('📊 Actualizando gráficos de progreso...');
    }

    updateRankingDisplay() {
        // Actualizar display de ranking
        console.log('🏆 Actualizando ranking...');
    }

    updateLevelsDisplay() {
        // Actualizar display de niveles
        console.log('⭐ Actualizando niveles...');
    }

    updateAnalyticsCharts() {
        // Actualizar gráficos de analytics
        console.log('📈 Actualizando gráficos de analytics...');
    }

    async claimTokens() {
        if (!this.miningSession || this.miningSession.isActive) {
            this.showNotification('warning', 'Minería Activa', 'Debes esperar a que termine tu sesión de 24h');
            return;
        }

        const tokensToClaim = this.miningSession.totalTokens || 0;
        if (tokensToClaim <= 0) {
            this.showNotification('warning', 'Sin Tokens', 'No tienes tokens para reclamar');
            return;
        }

        try {
            // Llamar al backend para reclamar
            const response = await fetch('/api/mining/claim', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sessionId: this.miningSession.id,
                    tokens: tokensToClaim,
                    userId: this.currentUser.id
                })
            });

            if (response.ok) {
                this.showNotification('success', '¡Tokens Reclamados!', 
                    `Has reclamado ${this.formatNumber(tokensToClaim)} RSC`);
                
                // Resetear sesión
                this.miningSession.totalTokens = 0;
                this.saveMiningData();
                this.updateMiningUI();
            }
        } catch (error) {
            console.log('🔄 Backend no disponible, reclamando localmente');
            this.showNotification('success', '¡Tokens Reclamados!', 
                `Has reclamado ${this.formatNumber(tokensToClaim)} RSC (modo local)`);
            
            this.miningSession.totalTokens = 0;
            this.saveMiningData();
            this.updateMiningUI();
        }
    }

    refreshMiningData() {
        this.updateMiningUI();
        this.syncWithBackend();
        this.showNotification('info', 'Datos Actualizados', 'Información de minería refrescada');
    }

    ensureBackgroundMining() {
        // Asegurar que la minería continúe en segundo plano
        if (this.isMining && !this.tokenCalculationInterval) {
            console.log('🔄 Restaurando cálculo de tokens en segundo plano');
            this.startTokenCalculation();
        }
    }

    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    saveMiningData() {
        try {
            const data = {
                isMining: this.isMining,
                miningSession: this.miningSession,
                hashPower: this.hashPower,
                miningStats: this.miningStats,
                lastSave: new Date().toISOString(),
                version: '1.0.0',
                userId: this.currentUser.id
            };
            
            // Guardar en localStorage
            localStorage.setItem('rsc_mining_data', JSON.stringify(data));
            
            // Guardar timestamp de última actualización
            localStorage.setItem('rsc_mining_last_update', new Date().toISOString());
            
            console.log('💾 Datos de minería guardados:', {
                isMining: this.isMining,
                sessionActive: this.miningSession?.isActive,
                totalTokens: this.miningSession?.totalTokens,
                timeRemaining: this.miningSession ? this.getTimeRemaining(this.miningSession.endTime) : 0
            });
            
        } catch (error) {
            console.error('❌ Error guardando datos de minería:', error);
        }
    }

    async loadMiningData() {
        try {
            // Intentar cargar desde localStorage
            let data = localStorage.getItem('rsc_mining_data');
            
            if (data) {
                const parsedData = JSON.parse(data);
                
                // Verificar que los datos sean válidos
                if (parsedData.miningSession && parsedData.miningSession.isActive) {
                    const session = parsedData.miningSession;
                    const now = new Date();
                    const endTime = new Date(session.endTime);
                    
                    // Verificar que la sesión no haya expirado
                    if (now < endTime) {
                        console.log('📊 Datos de minería cargados exitosamente:', parsedData);
                        
                        // Restaurar estado
                        this.miningSession = parsedData.miningSession;
                        this.isMining = parsedData.isMining;
                        this.hashPower = parsedData.hashPower || 5;
                        this.miningStats = parsedData.miningStats || this.miningStats;
                        
                        // Restaurar cálculo de tokens si la minería estaba activa
                        if (this.isMining && this.miningSession.isActive) {
                            this.startTokenCalculation();
                        }
                        
                        // Actualizar UI
                        this.updateMiningUI();
                        
                        return parsedData;
                    } else {
                        console.log('⏰ Sesión expirada, limpiando datos');
                        this.cleanupExpiredSession();
                        return null;
                    }
                }
            }
            
            return null;
            
        } catch (error) {
            console.error('❌ Error cargando datos de minería:', error);
            return null;
        }
    }

    cleanupExpiredSession() {
        try {
            localStorage.removeItem('rsc_mining_data');
            console.log('🧹 Datos de sesión expirada limpiados');
        } catch (error) {
            console.error('❌ Error limpiando datos expirados:', error);
        }
    }

    getTimeRemaining(endTime) {
        const now = new Date();
        const end = new Date(endTime);
        const remaining = end - now;
        
        if (remaining <= 0) return 0;
        return remaining;
    }

    getElapsedTime() {
        if (!this.miningSession) return 0;
        
        const startTime = new Date(this.miningSession.startTime);
        const now = new Date();
        return (now - startTime) / 1000; // segundos
    }

    calculateLevel(tokens) {
        if (tokens < 10) return 1;
        if (tokens < 50) return 2;
        if (tokens < 100) return 3;
        if (tokens < 500) return 4;
        if (tokens < 1000) return 5;
        return Math.floor(tokens / 200) + 5;
    }

    calculateEfficiency(elapsed) {
        // Calcular eficiencia basada en tiempo activo y consistencia
        const maxEfficiency = 100;
        const timeEfficiency = Math.min((elapsed / 3600) * 10, 50); // máximo 50% por tiempo
        const consistencyBonus = 50; // 50% por consistencia
        
        return Math.min(maxEfficiency, timeEfficiency + consistencyBonus);
    }

    formatNumber(num) {
        if (num < 1000) return num.toFixed(6);
        if (num < 1000000) return (num / 1000).toFixed(3) + 'K';
        return (num / 1000000).toFixed(3) + 'M';
    }

    formatTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    showMiningSummary(session) {
        // Crear modal de resumen
        const modal = document.createElement('div');
        modal.className = 'mining-summary-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h3>🎉 Sesión de Minería Completada</h3>
                <div class="summary-stats">
                    <p><strong>Duración:</strong> 24 horas</p>
                    <p><strong>Tokens Minados:</strong> ${this.formatNumber(session.totalTokens || 0)} RSC</p>
                    <p><strong>Hash Power:</strong> ${session.hashPower}</p>
                    <p><strong>Nivel Alcanzado:</strong> ${this.calculateLevel(session.totalTokens || 0)}</p>
                </div>
                <div class="modal-actions">
                    <button onclick="this.closest('.mining-summary-modal').remove()">Cerrar</button>
                    <button onclick="window.rscMiningSystem.startMining()">Minar Nuevamente</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    }

    showNotification(type, title, message) {
        // Crear notificación
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-header">
                <span class="notification-title">${title}</span>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
            <div class="notification-message">${message}</div>
        `;

        const container = document.getElementById('notificationsContainer');
        if (container) {
            container.appendChild(notification);
            
            // Auto-remover después de 5 segundos
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.remove();
                }
            }, 5000);
        }
    }

    updateMiningSession() {
        if (this.miningSession && this.isMining) {
            this.miningSession.hashPower = this.hashPower;
            this.saveMiningData();
        }
    }

    async claimRewards() {
        try {
            if (!window.supabaseMining || !window.supabaseMining.isConnected) {
                throw new Error('Supabase no está conectado');
            }

            const claimedAmount = await window.supabaseMining.claimRewards();
            
            // Actualizar UI local
            if (this.miningSession) {
                this.miningSession.totalTokens = 0;
                this.miningStats.totalTokens = 0;
                this.saveMiningData();
                this.updateMiningUI();
            }
            
            this.showNotification('success', '¡Recompensas Reclamadas!', 
                `Has reclamado ${this.formatNumber(claimedAmount)} RSC`);
            
            console.log('✅ Recompensas reclamadas:', claimedAmount);
            return claimedAmount;
            
        } catch (error) {
            console.error('❌ Error reclamando recompensas:', error);
            this.showNotification('error', 'Error al Reclamar', error.message);
            throw error;
        }
    }

    // Limpiar recursos al destruir
    destroy() {
        if (this.tokenCalculationInterval) {
            clearInterval(this.tokenCalculationInterval);
        }
        if (this.uiUpdateInterval) {
            clearInterval(this.uiUpdateInterval);
        }
        if (this.backendSyncInterval) {
            clearInterval(this.backendSyncInterval);
        }
        console.log('🧹 Recursos del sistema de minería limpiados');
    }
}

// Inicializar sistema de minería cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Inicializando Sistema de Minería RSC...');
    window.rscMiningSystem = new RSCMiningSystem();
});

// Exportar para uso global
window.RSCMiningSystem = RSCMiningSystem;
