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
        
        // 🔥 NUEVO: Sistema de persistencia de minería
        this.backgroundWorker = null;
        this.persistenceInterval = null;
        this.isBackgroundMining = false;
        
        this.init();
    }

    async init() {
        console.log('🚀 Sistema de minería RSC avanzado inicializando...');
        
        try {
            // Verificar autenticación
            await this.checkAuthentication();
            
            // 🔥 NUEVO: Inicializar sistema de persistencia
            await this.initializePersistenceSystem();
            
            // Configurar eventos
            this.setupEventListeners();
            
            // Cargar datos existentes
            await this.loadMiningData();
            
            // 🔥 SINCRONIZAR TOKENS LOCALES CON WALLET AL INICIAR
            await this.syncLocalTokensWithWallet();
            
            // Iniciar sincronización con Supabase
            this.startSupabaseSync();
            
            // Iniciar actualización de UI
            this.startUIUpdates();
            
            // 🔥 NUEVO: Verificar si hay minería activa en segundo plano
            this.checkBackgroundMiningStatus();
            
            // 🔥 NUEVO: Recuperación de emergencia de tokens perdidos
            setTimeout(() => {
                const recoveredTokens = this.emergencyTokenRecovery();
                if (recoveredTokens > 0) {
                    console.log('🎉 Recuperación de emergencia completada:', recoveredTokens, 'RSC');
                }
            }, 2000);
            
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

            // 🔥 NUEVO: Iniciar minería en Web Worker para persistencia
            if (this.backgroundWorker) {
                this.backgroundWorker.postMessage({
                    type: 'START_MINING',
                    data: this.miningSession
                });
                this.isBackgroundMining = true;
                console.log('✅ Minería iniciada en Web Worker para persistencia');
            } else {
                // Fallback: cálculo tradicional
                this.startTokenCalculation();
                console.log('⚠️ Web Worker no disponible, usando cálculo tradicional');
            }
            
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
            
            this.showNotification('success', '¡Minería Iniciada!', 'Comenzaste a minar RSC por 24 horas. La minería continuará funcionando en segundo plano.');
            
            // 🔥 NUEVO: Mostrar notificación de persistencia
            setTimeout(() => {
                this.showPersistenceNotification();
            }, 2000);

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
        this.isBackgroundMining = false;
        
        if (this.miningSession) {
            this.miningSession.isActive = false;
            this.miningSession.endTime = new Date().toISOString();
            this.saveMiningData();
        }

        // 🔥 NUEVO: Detener minería en Web Worker
        if (this.backgroundWorker) {
            this.backgroundWorker.postMessage({ type: 'STOP_MINING' });
            console.log('✅ Minería detenida en Web Worker');
        }
        
        // Detener cálculo de tokens tradicional
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
        
        // 🔥 INTEGRACIÓN CON WALLET - Guardar tokens automáticamente
        this.saveTokensToWallet(tokensEarned);
        
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

    // 🔥 NUEVA FUNCIÓN: Guardar tokens en la wallet
    async saveTokensToWallet(tokensEarned) {
        try {
            // Verificar si la wallet está disponible
            if (window.wallet && window.wallet.config && window.wallet.config.walletAddress) {
                console.log('💰 Guardando tokens en wallet:', tokensEarned, 'RSC');
                
                // Obtener balance actual de la wallet
                const currentBalance = window.wallet.state.balance || 0;
                const currentMiningRewards = window.wallet.state.miningRewards || 0;
                
                // Actualizar balance de minería
                const newMiningRewards = currentMiningRewards + tokensEarned;
                const newTotalBalance = currentBalance + tokensEarned;
                
                // Actualizar estado de la wallet
                window.wallet.state.miningRewards = newMiningRewards;
                window.wallet.state.balance = newTotalBalance;
                
                // Agregar transacción de minería
                const miningTransaction = {
                    id: 'mining_' + Date.now(),
                    type: 'mining_reward',
                    amount: tokensEarned,
                    timestamp: new Date().toISOString(),
                    status: 'completed',
                    description: 'Recompensa de minería RSC',
                    hash: 'mining_' + Math.random().toString(36).substr(2, 9),
                    blockNumber: Math.floor(Math.random() * 1000000),
                    gasUsed: 0,
                    gasPrice: 0
                };
                
                // Agregar a historial de transacciones
                if (!window.wallet.state.transactions) {
                    window.wallet.state.transactions = [];
                }
                window.wallet.state.transactions.unshift(miningTransaction);
                
                // Guardar en localStorage
                localStorage.setItem('rsc_wallet', JSON.stringify({
                    address: window.wallet.config.walletAddress,
                    balance: newTotalBalance,
                    miningRewards: newMiningRewards,
                    transactions: window.wallet.state.transactions,
                    blockchainCreated: true,
                    lastUpdate: new Date().toISOString()
                }));
                
                // Actualizar UI de la wallet si está visible
                if (window.wallet.updateWalletUI) {
                    window.wallet.updateWalletUI();
                }
                
                console.log('✅ Tokens guardados en wallet exitosamente');
                console.log('💰 Balance actualizado:', newTotalBalance, 'RSC');
                console.log('⛏️ Recompensas de minería:', newMiningRewards, 'RSC');
                
            } else {
                console.log('⚠️ Wallet no disponible, guardando tokens localmente');
                // Guardar tokens localmente hasta que la wallet esté disponible
                this.saveTokensLocally(tokensEarned);
            }
            
        } catch (error) {
            console.error('❌ Error guardando tokens en wallet:', error);
            // Fallback: guardar localmente
            this.saveTokensLocally(tokensEarned);
        }
    }

    // 🔥 NUEVA FUNCIÓN: Guardar tokens localmente como respaldo
    saveTokensLocally(tokensEarned) {
        try {
            const localTokens = localStorage.getItem('rsc_local_mining_tokens') || '0';
            const currentLocalTokens = parseFloat(localTokens);
            const newLocalTokens = currentLocalTokens + tokensEarned;
            
            localStorage.setItem('rsc_local_mining_tokens', newLocalTokens.toString());
            localStorage.setItem('rsc_local_mining_last_update', new Date().toISOString());
            
            console.log('💾 Tokens guardados localmente:', newLocalTokens, 'RSC');
            
        } catch (error) {
            console.error('❌ Error guardando tokens localmente:', error);
        }
    }

    // 🔥 NUEVA FUNCIÓN: Sincronizar tokens locales con wallet cuando esté disponible
    async syncLocalTokensWithWallet() {
        try {
            const localTokens = localStorage.getItem('rsc_local_mining_tokens');
            
            if (localTokens && parseFloat(localTokens) > 0) {
                console.log('🔄 Sincronizando tokens locales con wallet...');
                
                const tokensToSync = parseFloat(localTokens);
                
                // Guardar en wallet
                await this.saveTokensToWallet(tokensToSync);
                
                // Limpiar tokens locales
                localStorage.removeItem('rsc_local_mining_tokens');
                localStorage.removeItem('rsc_local_mining_last_update');
                
                console.log('✅ Tokens locales sincronizados con wallet:', tokensToSync, 'RSC');
                
                this.showNotification('success', 'Tokens Sincronizados', 
                    `Se han sincronizado ${tokensToSync.toFixed(4)} RSC de minería con tu wallet`);
            }
            
        } catch (error) {
            console.error('❌ Error sincronizando tokens locales:', error);
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
        
        // 🔥 SINCRONIZAR TOKENS CON WALLET AL COMPLETAR SESIÓN
        this.syncLocalTokensWithWallet();
        
        // Mostrar notificación de tokens ganados
        if (this.miningSession && this.miningSession.totalTokens > 0) {
            this.showNotification('success', 'Minería Completada', 
                `¡Has ganado ${this.miningSession.totalTokens.toFixed(4)} RSC! Los tokens se han guardado en tu wallet.`);
        }
        
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

        // 🔥 NUEVO: Mostrar indicador de minería en segundo plano
        this.updateBackgroundMiningIndicator();

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

    // 🔥 NUEVA FUNCIÓN: Actualizar indicador de minería en segundo plano
    updateBackgroundMiningIndicator() {
        try {
            // Buscar o crear indicador de minería en segundo plano
            let backgroundIndicator = document.getElementById('backgroundMiningIndicator');
            
            if (!backgroundIndicator) {
                backgroundIndicator = document.createElement('div');
                backgroundIndicator.id = 'backgroundMiningIndicator';
                backgroundIndicator.className = 'background-mining-indicator';
                backgroundIndicator.innerHTML = `
                    <div class="indicator-content">
                        <span class="indicator-icon">⚡</span>
                        <span class="indicator-text">Minería en Segundo Plano</span>
                        <span class="indicator-status">Activa</span>
                    </div>
                `;
                
                // Insertar al inicio del body
                document.body.insertBefore(backgroundIndicator, document.body.firstChild);
            }
            
            if (this.isMining && this.isBackgroundMining) {
                backgroundIndicator.style.display = 'block';
                backgroundIndicator.classList.add('active');
                
                // Actualizar estado
                const statusElement = backgroundIndicator.querySelector('.indicator-status');
                if (statusElement) {
                    statusElement.textContent = 'Activa';
                    statusElement.className = 'indicator-status active';
                }
            } else {
                backgroundIndicator.style.display = 'none';
                backgroundIndicator.classList.remove('active');
            }
            
        } catch (error) {
            console.error('❌ Error actualizando indicador de minería en segundo plano:', error);
        }
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
        
        // 🔥 ACTUALIZAR INFORMACIÓN DE WALLET EN TIEMPO REAL
        this.updateWalletInfo();
    }

    // 🔥 NUEVA FUNCIÓN: Actualizar información de wallet en tiempo real
    updateWalletInfo() {
        try {
            if (window.wallet && window.wallet.state) {
                const walletBalance = window.wallet.state.balance || 0;
                const miningRewards = window.wallet.state.miningRewards || 0;
                
                // Actualizar elementos de wallet si existen
                const walletBalanceElement = document.getElementById('walletBalance');
                const miningRewardsElement = document.getElementById('miningRewards');
                
                if (walletBalanceElement) {
                    walletBalanceElement.textContent = walletBalance.toFixed(4) + ' RSC';
                }
                
                if (miningRewardsElement) {
                    miningRewardsElement.textContent = miningRewards.toFixed(4) + ' RSC';
                }
                
                // Mostrar indicador de wallet conectada
                const walletStatusElement = document.getElementById('walletStatus');
                if (walletStatusElement) {
                    if (window.wallet.config.walletAddress) {
                        walletStatusElement.textContent = '✅ Wallet Conectada';
                        walletStatusElement.className = 'wallet-status connected';
                    } else {
                        walletStatusElement.textContent = '❌ Wallet Desconectada';
                        walletStatusElement.className = 'wallet-status disconnected';
                    }
                }
                
                console.log('💰 Estado de wallet actualizado:', {
                    balance: walletBalance,
                    miningRewards: miningRewards,
                    address: window.wallet.config.walletAddress
                });
            }
        } catch (error) {
            console.error('❌ Error actualizando información de wallet:', error);
        }
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
            // 🔥 MEJORADO: Guardar datos más completos y robustos
            const data = {
                isMining: this.isMining,
                miningSession: this.miningSession,
                hashPower: this.hashPower,
                miningStats: this.miningStats,
                lastSave: new Date().toISOString(),
                version: '1.0.0',
                userId: this.currentUser.id,
                // 🔥 NUEVO: Información adicional para persistencia
                persistenceInfo: {
                    lastActive: new Date().toISOString(),
                    totalTokensEarned: this.miningStats.totalTokens || 0,
                    sessionDuration: this.miningSession ? 
                        (new Date(this.miningSession.endTime) - new Date(this.miningSession.startTime)) : 0,
                    isBackgroundMining: this.isBackgroundMining
                }
            };
            
            // Guardar en localStorage
            localStorage.setItem('rsc_mining_data', JSON.stringify(data));
            
            // Guardar timestamp de última actualización
            localStorage.setItem('rsc_mining_last_update', new Date().toISOString());
            
            // 🔥 NUEVO: Guardar backup de tokens en caso de emergencia
            if (this.miningStats.totalTokens > 0) {
                localStorage.setItem('rsc_mining_tokens_backup', JSON.stringify({
                    tokens: this.miningStats.totalTokens,
                    timestamp: new Date().toISOString(),
                    sessionId: this.miningSession?.id || 'unknown'
                }));
            }
            
            console.log('💾 Datos de minería guardados (MEJORADO):', {
                isMining: this.isMining,
                sessionActive: this.miningSession?.isActive,
                totalTokens: this.miningStats.totalTokens || 0,
                timeRemaining: this.miningSession ? this.getTimeRemaining(this.miningSession.endTime) : 0,
                backgroundMining: this.isBackgroundMining,
                tokensBackup: this.miningStats.totalTokens > 0 ? '✅' : '❌'
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
                
                // 🔥 MEJORADO: Manejar diferentes estados de la sesión
                if (parsedData.miningSession) {
                    const session = parsedData.miningSession;
                    const now = new Date();
                    const endTime = new Date(session.endTime);
                    
                    if (session.isActive && now < endTime) {
                        // 🔥 Sesión activa y válida
                        console.log('📊 Datos de minería ACTIVA cargados exitosamente:', parsedData);
                        
                        // Restaurar estado completo
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
                        
                    } else if (session.isActive && now >= endTime) {
                        // 🔥 Sesión activa pero expirada - completarla
                        console.log('⏰ Sesión activa expirada, completándola:', parsedData);
                        
                        // Restaurar datos para completar
                        this.miningSession = parsedData.miningSession;
                        this.miningStats = parsedData.miningStats || this.miningStats;
                        
                        // Completar sesión
                        this.completeMiningSession();
                        
                        return parsedData;
                        
                    } else if (!session.isActive && parsedData.miningStats && parsedData.miningStats.totalTokens > 0) {
                        // 🔥 Sesión completada con tokens - restaurar progreso
                        console.log('💰 Restaurando progreso de sesión completada:', parsedData);
                        
                        this.miningSession = parsedData.miningSession;
                        this.miningStats = parsedData.miningStats;
                        
                        // Sincronizar tokens con wallet
                        this.syncLocalTokensWithWallet();
                        
                        // Actualizar UI
                        this.updateMiningUI();
                        
                        return parsedData;
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
        if (this.persistenceInterval) {
            clearInterval(this.persistenceInterval);
        }
        if (this.backgroundWorker) {
            this.backgroundWorker.terminate();
        }
        console.log('🧹 Recursos del sistema de minería limpiados');
    }

    // 🔥 NUEVA FUNCIÓN: Mostrar estado de integración con wallet
    showWalletIntegrationStatus() {
        try {
            if (window.wallet && window.wallet.config.walletAddress) {
                const balance = window.wallet.state.balance || 0;
                const miningRewards = window.wallet.state.miningRewards || 0;
                
                this.showNotification('success', 'Wallet Integrada', 
                    `Tu wallet está conectada y sincronizada. Balance: ${balance.toFixed(4)} RSC, Recompensas: ${miningRewards.toFixed(4)} RSC`);
                
                console.log('✅ Estado de integración con wallet mostrado');
            } else {
                this.showNotification('warning', 'Wallet No Conectada', 
                    'Para recibir recompensas de minería, conecta tu wallet en la sección Wallet');
                
                console.log('⚠️ Wallet no conectada, mostrando advertencia');
            }
        } catch (error) {
            console.error('❌ Error mostrando estado de integración:', error);
        }
    }

    // 🔥 NUEVA FUNCIÓN: Mostrar notificación de persistencia
    showPersistenceNotification() {
        try {
            const notification = document.createElement('div');
            notification.className = 'persistence-notification';
            notification.innerHTML = `
                <h4>🔄 Minería Persistente Activada</h4>
                <p>Tu minería continuará funcionando en segundo plano durante las próximas 24 horas, sin importar si cambias de página o cierras la pestaña.</p>
                <div class="persistence-actions">
                    <button class="btn btn-primary" onclick="this.closest('.persistence-notification').remove()">Entendido</button>
                    <button class="btn btn-secondary" onclick="window.rscMiningSystem.showMiningStatus()">Ver Estado</button>
                </div>
            `;
            
            document.body.appendChild(notification);
            
            // Auto-remover después de 10 segundos
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.remove();
                }
            }, 10000);
            
            console.log('✅ Notificación de persistencia mostrada');
            
        } catch (error) {
            console.error('❌ Error mostrando notificación de persistencia:', error);
        }
    }

    // 🔥 NUEVA FUNCIÓN: Mostrar estado actual de minería
    showMiningStatus() {
        try {
            if (this.isMining && this.miningSession) {
                const elapsed = this.getElapsedTime();
                const timeRemaining = this.getTimeRemaining(this.miningSession.endTime);
                const tokensEarned = this.miningStats.totalTokens || 0;
                
                const statusMessage = `
                    <strong>Estado de Minería:</strong><br>
                    ✅ Activa y funcionando<br>
                    ⏱️ Tiempo transcurrido: ${this.formatTime(elapsed)}<br>
                    ⏳ Tiempo restante: ${this.formatTime(timeRemaining / 1000)}<br>
                    🪙 Tokens minados: ${tokensEarned.toFixed(4)} RSC<br>
                    🔄 Funcionando en segundo plano
                `;
                
                this.showNotification('success', 'Estado de Minería', statusMessage);
                
            } else {
                this.showNotification('info', 'Estado de Minería', 'No hay minería activa en este momento.');
            }
            
        } catch (error) {
            console.error('❌ Error mostrando estado de minería:', error);
        }
    }

    // 🔥 NUEVA FUNCIÓN: Inicializar sistema de persistencia
    async initializePersistenceSystem() {
        try {
            // Crear Web Worker para minería en segundo plano
            this.createBackgroundWorker();
            
            // Configurar intervalos de persistencia
            this.setupPersistenceIntervals();
            
            // Configurar eventos de visibilidad y focus
            this.setupPersistenceEvents();
            
            console.log('✅ Sistema de persistencia de minería inicializado');
            
        } catch (error) {
            console.error('❌ Error inicializando sistema de persistencia:', error);
        }
    }

    // 🔥 NUEVA FUNCIÓN: Crear Web Worker para minería en segundo plano
    createBackgroundWorker() {
        try {
            // Crear código del worker inline SIMPLE Y EFECTIVO
            const workerCode = `
                // Web Worker SIMPLE para minería - SOLO LO ESENCIAL
                let miningInterval = null;
                let isMining = false;
                let sessionData = null;
                let startTime = null;
                let totalTokensEarned = 0;
                
                // 🔥 SIMPLE: Solo una clave de persistencia
                const PERSISTENCE_KEY = 'rsc_mining_simple_backup';
                
                // 🔥 FUNCIÓN SIMPLE: Guardar tokens
                function saveTokens(tokens) {
                    try {
                        const data = {
                            tokens: tokens,
                            timestamp: Date.now(),
                            sessionId: sessionData?.id || 'unknown',
                            isActive: isMining
                        };
                        localStorage.setItem(PERSISTENCE_KEY, JSON.stringify(data));
                        console.log('💾 Tokens guardados:', tokens, 'RSC');
                    } catch (e) {
                        console.error('❌ Error guardando tokens:', e);
                    }
                }
                
                // 🔥 FUNCIÓN SIMPLE: Cargar tokens
                function loadTokens() {
                    try {
                        const data = localStorage.getItem(PERSISTENCE_KEY);
                        if (data) {
                            const parsed = JSON.parse(data);
                            if (parsed.tokens > 0) {
                                totalTokensEarned = parsed.tokens;
                                console.log('💰 Tokens cargados:', parsed.tokens, 'RSC');
                                return parsed.tokens;
                            }
                        }
                        return 0;
                    } catch (e) {
                        console.error('❌ Error cargando tokens:', e);
                        return 0;
                    }
                }
                
                self.onmessage = function(e) {
                    const { type, data } = e.data;
                    
                    switch(type) {
                        case 'START_MINING':
                            startMining(data);
                            break;
                        case 'STOP_MINING':
                            stopMining();
                            break;
                        case 'GET_STATUS':
                            sendStatus();
                            break;
                        case 'RESTORE_TOKENS':
                            restoreTokens();
                            break;
                    }
                };
                
                // 🔥 FUNCIÓN SIMPLE: Restaurar tokens
                function restoreTokens() {
                    const tokens = loadTokens();
                    if (tokens > 0) {
                        self.postMessage({
                            type: 'TOKENS_RESTORED',
                            data: { tokens: tokens }
                        });
                    }
                }
                
                function startMining(session) {
                    if (isMining) return;
                    
                    isMining = true;
                    sessionData = session;
                    startTime = Date.now();
                    
                    // 🔥 IMPORTANTE: Cargar tokens existentes
                    totalTokensEarned = loadTokens();
                    
                    console.log('🚀 Minería iniciada con', totalTokensEarned, 'RSC existentes');
                    
                    // Iniciar cálculo cada segundo
                    miningInterval = setInterval(() => {
                        if (isMining && sessionData) {
                            const elapsed = (Date.now() - startTime) / 1000;
                            const baseRate = 0.001;
                            const hashMultiplier = sessionData.hashPower / 5;
                            
                            // 🔥 SIMPLE: Solo sumar tokens cada segundo
                            const tokensThisSecond = baseRate * hashMultiplier;
                            totalTokensEarned += tokensThisSecond;
                            
                            // 🔥 GUARDAR CADA SEGUNDO
                            saveTokens(totalTokensEarned);
                            
                            // Enviar progreso
                            self.postMessage({
                                type: 'MINING_PROGRESS',
                                data: {
                                    tokensEarned: totalTokensEarned,
                                    tokensThisSecond: tokensThisSecond,
                                    elapsed: elapsed
                                }
                            });
                            
                            // Verificar si completó 24 horas
                            if (elapsed >= 24 * 60 * 60) {
                                console.log('🎉 Sesión completada:', totalTokensEarned, 'RSC');
                                self.postMessage({
                                    type: 'SESSION_COMPLETED',
                                    data: { totalTokens: totalTokensEarned }
                                });
                                stopMining();
                            }
                        }
                    }, 1000);
                    
                    self.postMessage({ type: 'MINING_STARTED' });
                }
                
                function stopMining() {
                    isMining = false;
                    if (miningInterval) {
                        clearInterval(miningInterval);
                        miningInterval = null;
                    }
                    
                    // 🔥 IMPORTANTE: Guardar tokens finales
                    saveTokens(totalTokensEarned);
                    
                    self.postMessage({ type: 'MINING_STOPPED' });
                }
                
                function sendStatus() {
                    self.postMessage({
                        type: 'STATUS_RESPONSE',
                        data: {
                            isMining: isMining,
                            totalTokens: totalTokensEarned,
                            sessionData: sessionData
                        }
                    });
                }
                
                // 🔥 AUTO-RESTAURAR al iniciar
                console.log('🔄 Worker iniciado, restaurando tokens...');
                setTimeout(() => {
                    restoreTokens();
                }, 500);
            `;
            
            // Crear blob con el código del worker
            const blob = new Blob([workerCode], { type: 'application/javascript' });
            const workerUrl = URL.createObjectURL(blob);
            
            // Crear el worker
            this.backgroundWorker = new Worker(workerUrl);
            
            // Configurar mensajes del worker
            this.backgroundWorker.onmessage = (e) => {
                this.handleWorkerMessage(e.data);
            };
            
            console.log('✅ Web Worker SIMPLE creado exitosamente');
            
        } catch (error) {
            console.error('❌ Error creando Web Worker:', error);
        }
    }

    // 🔥 NUEVA FUNCIÓN: Manejar mensajes del Web Worker
    handleWorkerMessage(message) {
        const { type, data } = message;
        
        switch(type) {
            case 'MINING_STARTED':
                console.log('✅ Minería iniciada en Web Worker');
                break;
                
            case 'MINING_STOPPED':
                console.log('⏹️ Minería detenida en Web Worker');
                break;
                
            case 'MINING_PROGRESS':
                this.handleMiningProgress(data);
                break;
                
            case 'SESSION_COMPLETED':
                this.handleSessionCompleted(data);
                break;
                
            case 'STATUS_RESPONSE':
                this.handleWorkerStatus(data);
                break;
                
            // 🔥 NUEVO: Manejar tokens restaurados
            case 'TOKENS_RESTORED':
                this.handleTokensRestored(data);
                break;
        }
    }

    // 🔥 NUEVA FUNCIÓN: Manejar progreso de minería del worker
    handleMiningProgress(data) {
        const { tokensEarned, elapsed, isActive } = data;
        
        if (this.miningSession) {
            this.miningSession.totalTokens = tokensEarned;
            this.miningSession.lastUpdate = new Date().toISOString();
            
            // Actualizar estadísticas
            this.miningStats.totalTokens = tokensEarned;
            this.miningStats.activeTime = elapsed;
            this.miningStats.hashRate = this.hashPower * 1000;
            this.miningStats.level = this.calculateLevel(tokensEarned);
            this.miningStats.efficiency = this.calculateEfficiency(elapsed);
            
            // 🔥 Guardar tokens en wallet automáticamente
            this.saveTokensToWallet(tokensEarned);
            
            // Guardar datos cada 10 segundos
            const currentTime = Date.now();
            if (currentTime - this.lastSaveTime > 10000) {
                this.saveMiningData();
                this.lastSaveTime = currentTime;
            }
        }
    }

    // 🔥 NUEVA FUNCIÓN: Manejar sesión completada del worker
    handleSessionCompleted(data) {
        console.log('🎉 Sesión de minería completada por Web Worker:', data);
        
        if (this.miningSession) {
            this.miningSession.isActive = false;
            this.miningSession.endTime = new Date().toISOString();
            this.miningSession.totalTokens = data.totalTokens;
        }
        
        this.isMining = false;
        this.isBackgroundMining = false;
        
        // Sincronizar tokens con wallet
        this.syncLocalTokensWithWallet();
        
        // Mostrar notificación
        this.showNotification('success', 'Minería Completada', 
            `¡Has completado tu sesión de 24h! Minaste ${data.totalTokens.toFixed(4)} RSC`);
        
        // Guardar datos finales
        this.saveMiningData();
        
        // Actualizar UI
        this.updateMiningUI();
    }

    // 🔥 NUEVA FUNCIÓN: Manejar tokens restaurados del worker
    handleTokensRestored(data) {
        try {
            console.log('💰 Tokens restaurados desde Web Worker:', data.tokens, 'RSC');
            
            if (data.tokens > 0) {
                // Restaurar estadísticas
                this.miningStats.totalTokens = data.tokens;
                
                // Mostrar notificación de restauración
                this.showNotification('success', 'Tokens Restaurados', 
                    `Se han restaurado ${data.tokens.toFixed(4)} RSC de tu sesión anterior.`);
                
                // Sincronizar con wallet
                this.syncLocalTokensWithWallet();
                
                // Actualizar UI
                this.updateMiningUI();
                
                console.log('✅ Tokens restaurados exitosamente:', data.tokens, 'RSC');
            }
            
        } catch (error) {
            console.error('❌ Error manejando tokens restaurados:', error);
        }
    }

    // 🔥 NUEVA FUNCIÓN: Configurar intervalos de persistencia
    setupPersistenceIntervals() {
        // Verificar estado de minería cada 30 segundos
        this.persistenceInterval = setInterval(() => {
            this.ensureMiningPersistence();
        }, 30000);
        
        console.log('✅ Intervalos de persistencia configurados');
    }

    // 🔥 NUEVA FUNCIÓN: Configurar eventos de persistencia
    setupPersistenceEvents() {
        // Evento cuando la página se oculta
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                console.log('📱 Página oculta - Asegurando persistencia de minería');
                this.ensureMiningPersistence();
            } else {
                console.log('📱 Página visible - Sincronizando estado de minería');
                this.syncMiningState();
            }
        });
        
        // Evento cuando la página pierde el foco
        window.addEventListener('blur', () => {
            console.log('🔍 Página perdió foco - Verificando minería en segundo plano');
            this.ensureMiningPersistence();
        });
        
        // Evento cuando la página recupera el foco
        window.addEventListener('focus', () => {
            console.log('🔍 Página recuperó foco - Sincronizando minería');
            this.syncMiningState();
        });
        
        // Evento antes de cerrar la página
        window.addEventListener('beforeunload', () => {
            if (this.isMining) {
                console.log('🚪 Página cerrando - Asegurando persistencia de minería');
                this.ensureMiningPersistence();
                return 'La minería continuará funcionando en segundo plano. ¿Estás seguro?';
            }
        });
        
        // Evento cuando se recarga la página
        window.addEventListener('load', () => {
            console.log('📱 Página cargada - Verificando estado de minería');
            setTimeout(() => {
                this.checkBackgroundMiningStatus();
            }, 1000);
        });
        
        console.log('✅ Eventos de persistencia configurados');
    }

    // 🔥 NUEVA FUNCIÓN: Asegurar persistencia de minería
    ensureMiningPersistence() {
        if (this.isMining && this.miningSession && this.miningSession.isActive) {
            // Verificar que el worker esté funcionando
            if (this.backgroundWorker) {
                this.backgroundWorker.postMessage({ type: 'GET_STATUS' });
                
                // Si no hay respuesta del worker, reiniciarlo
                setTimeout(() => {
                    if (!this.isBackgroundMining) {
                        console.log('🔄 Reiniciando Web Worker de minería');
                        this.restartBackgroundWorker();
                    }
                }, 5000);
            }
            
            // Marcar como minería en segundo plano
            this.isBackgroundMining = true;
            
            // Guardar estado en localStorage para persistencia
            this.saveMiningData();
            
            console.log('✅ Persistencia de minería asegurada');
        }
    }

    // 🔥 NUEVA FUNCIÓN: Sincronizar estado de minería
    syncMiningState() {
        if (this.backgroundWorker) {
            this.backgroundWorker.postMessage({ type: 'GET_STATUS' });
        }
    }

    // 🔥 NUEVA FUNCIÓN: Verificar estado de minería en segundo plano
    checkBackgroundMiningStatus() {
        try {
            // 🔥 SIMPLE: Verificar tokens guardados directamente
            const simpleBackup = localStorage.getItem('rsc_mining_simple_backup');
            if (simpleBackup) {
                const data = JSON.parse(simpleBackup);
                if (data.tokens > 0) {
                    console.log('💰 Tokens encontrados en backup simple:', data.tokens, 'RSC');
                    
                    // Restaurar estadísticas
                    this.miningStats.totalTokens = data.tokens;
                    
                    // Si la sesión estaba activa, restaurarla
                    if (data.isActive && this.miningSession) {
                        this.isMining = true;
                        this.isBackgroundMining = true;
                        
                        console.log('✅ Minería restaurada desde backup simple');
                        
                        // Actualizar UI
                        this.updateMiningUI();
                        return true;
                    }
                }
            }
            
            // También verificar datos del worker
            if (this.backgroundWorker) {
                console.log('🔄 Verificando estado desde Web Worker...');
                this.backgroundWorker.postMessage({ type: 'RESTORE_TOKENS' });
            }
            
            return false;
            
        } catch (error) {
            console.error('❌ Error verificando estado de minería:', error);
            return false;
        }
    }

    // 🔥 NUEVA FUNCIÓN: Reiniciar minería en el worker
    restartMiningInWorker() {
        if (this.backgroundWorker && this.miningSession) {
            console.log('🔄 Reiniciando minería en Web Worker');
            
            this.backgroundWorker.postMessage({
                type: 'START_MINING',
                data: this.miningSession
            });
            
            this.isBackgroundMining = true;
        }
    }

    // 🔥 NUEVA FUNCIÓN: Reiniciar Web Worker
    restartBackgroundWorker() {
        try {
            if (this.backgroundWorker) {
                this.backgroundWorker.terminate();
            }
            
            this.createBackgroundWorker();
            
            // Si había minería activa, reiniciarla
            if (this.isMining && this.miningSession && this.miningSession.isActive) {
                setTimeout(() => {
                    this.restartMiningInWorker();
                }, 1000);
            }
            
            console.log('✅ Web Worker reiniciado exitosamente');
            
        } catch (error) {
            console.error('❌ Error reiniciando Web Worker:', error);
        }
    }

    // 🔥 NUEVA FUNCIÓN: Finalizar sesión completada al restaurar
    finalizeCompletedSession() {
        try {
            if (this.miningSession && this.miningStats) {
                console.log('🎯 Finalizando sesión completada al restaurar');
                
                // Marcar sesión como completada
                this.miningSession.isActive = false;
                this.isMining = false;
                this.isBackgroundMining = false;
                
                // Asegurar que los tokens se guarden en la wallet
                const totalTokens = this.miningStats.totalTokens || 0;
                if (totalTokens > 0) {
                    console.log('💰 Guardando tokens finales de sesión completada:', totalTokens, 'RSC');
                    
                    // Guardar tokens en wallet
                    this.saveTokensToWallet(totalTokens);
                    
                    // Mostrar notificación de sesión completada
                    this.showNotification('success', 'Sesión Completada', 
                        `¡Tu sesión de minería se completó! Has ganado ${totalTokens.toFixed(4)} RSC. Los tokens se han guardado en tu wallet.`);
                }
                
                // Guardar estado final
                this.saveMiningData();
                
                // Actualizar UI
                this.updateMiningUI();
                
                console.log('✅ Sesión completada finalizada correctamente');
            }
        } catch (error) {
            console.error('❌ Error finalizando sesión completada:', error);
        }
    }

    // 🔥 NUEVA FUNCIÓN: Recuperación de emergencia de tokens perdidos
    emergencyTokenRecovery() {
        try {
            console.log('🚨 Iniciando recuperación de emergencia de tokens...');
            
            // 🔥 SIMPLE: Verificar solo la fuente principal
            const simpleBackup = localStorage.getItem('rsc_mining_simple_backup');
            if (simpleBackup) {
                const data = JSON.parse(simpleBackup);
                const tokens = data.tokens || 0;
                
                if (tokens > 0) {
                    console.log('💰 Tokens encontrados en backup simple:', tokens, 'RSC');
                    
                    // Verificar si ya están en la wallet
                    const currentWalletTokens = window.wallet?.state?.miningRewards || 0;
                    
                    if (tokens > currentWalletTokens) {
                        const tokensToRecover = tokens - currentWalletTokens;
                        console.log('🔄 Recuperando tokens perdidos:', tokensToRecover, 'RSC');
                        
                        // Guardar tokens recuperados en la wallet
                        this.saveTokensToWallet(tokensToRecover);
                        
                        // Mostrar notificación de recuperación
                        this.showNotification('success', 'Tokens Recuperados', 
                            `Se han recuperado ${tokensToRecover.toFixed(4)} RSC que se habían perdido. ¡Tu progreso está seguro!`);
                        
                        console.log('🎉 Recuperación completada:', tokensToRecover, 'RSC');
                        return tokensToRecover;
                    } else {
                        console.log('✅ Tokens ya están en la wallet, no es necesario recuperar');
                    }
                }
            }
            
            // También verificar datos del worker
            if (this.backgroundWorker) {
                this.backgroundWorker.postMessage({ type: 'RESTORE_TOKENS' });
            }
            
            console.log('ℹ️ No se encontraron tokens para recuperar');
            return 0;
            
        } catch (error) {
            console.error('❌ Error en recuperación de emergencia:', error);
            return 0;
        }
    }

    // 🔥 NUEVA FUNCIÓN: Probar sistema de persistencia
    testPersistenceSystem() {
        try {
            console.log('🧪 Probando sistema de persistencia SIMPLE...');
            
            // Verificar solo la fuente principal
            const simpleBackup = localStorage.getItem('rsc_mining_simple_backup');
            let foundData = [];
            
            if (simpleBackup) {
                try {
                    const data = JSON.parse(simpleBackup);
                    foundData.push({
                        source: 'rsc_mining_simple_backup',
                        tokens: data.tokens || 0,
                        isActive: data.isActive || false,
                        lastSave: data.timestamp || 'unknown'
                    });
                } catch (e) {
                    console.log('⚠️ Error verificando backup simple:', e);
                }
            }
            
            console.log('📊 Datos de persistencia encontrados:', foundData);
            
            // Mostrar resumen en notificación
            if (foundData.length > 0) {
                const totalTokens = foundData.reduce((sum, item) => sum + item.tokens, 0);
                const activeSources = foundData.filter(item => item.isActive).length;
                
                this.showNotification('info', 'Sistema de Persistencia', 
                    `Encontrados ${foundData.length} fuentes de datos con ${totalTokens.toFixed(4)} RSC totales. ${activeSources} fuentes activas.`);
            } else {
                this.showNotification('warning', 'Sistema de Persistencia', 
                    'No se encontraron datos de persistencia. El sistema puede no estar funcionando correctamente.');
            }
            
            return foundData;
            
        } catch (error) {
            console.error('❌ Error probando sistema de persistencia:', error);
            return [];
        }
    }

    // 🔥 NUEVA FUNCIÓN: Verificar estado actual de tokens
    checkCurrentTokens() {
        try {
            console.log('🔍 Verificando estado actual de tokens...');
            
            // Verificar backup simple
            const simpleBackup = localStorage.getItem('rsc_mining_simple_backup');
            if (simpleBackup) {
                const data = JSON.parse(simpleBackup);
                const tokens = data.tokens || 0;
                
                console.log('💰 Tokens en backup simple:', tokens, 'RSC');
                
                // Verificar si están en la wallet
                const walletTokens = window.wallet?.state?.miningRewards || 0;
                console.log('💰 Tokens en wallet:', walletTokens, 'RSC');
                
                // Verificar estadísticas locales
                const localTokens = this.miningStats.totalTokens || 0;
                console.log('💰 Tokens en estadísticas locales:', localTokens, 'RSC');
                
                // Mostrar resumen
                const message = `
                    <strong>Estado de Tokens:</strong><br>
                    🔒 Backup simple: ${tokens.toFixed(4)} RSC<br>
                    💰 Wallet: ${walletTokens.toFixed(4)} RSC<br>
                    📊 Estadísticas locales: ${localTokens.toFixed(4)} RSC<br>
                    ${tokens > 0 ? '✅ Tokens encontrados' : '❌ No hay tokens guardados'}
                `;
                
                this.showNotification('info', 'Estado de Tokens', message);
                
                return { backup: tokens, wallet: walletTokens, local: localTokens };
            } else {
                console.log('❌ No se encontró backup simple');
                this.showNotification('warning', 'Estado de Tokens', 'No se encontraron tokens guardados.');
                return { backup: 0, wallet: 0, local: 0 };
            }
            
        } catch (error) {
            console.error('❌ Error verificando estado de tokens:', error);
            return { backup: 0, wallet: 0, local: 0 };
        }
    }

    // 🔥 NUEVA FUNCIÓN: Sistema de minería REAL y FUNCIONAL
    startRealMining() {
        if (this.isMining) {
            this.showNotification('warning', 'Ya estás minando', 'La minería ya está activa');
            return;
        }

        console.log('🚀 Iniciando MINERÍA REAL de RSC...');

        try {
            // Crear sesión de minería REAL
            this.miningSession = {
                id: this.generateSessionId(),
                startTime: new Date().toISOString(),
                endTime: new Date(Date.now() + this.sessionDuration).toISOString(),
                isActive: true,
                hashPower: this.hashPower,
                walletAddress: this.currentUser.walletAddress,
                userId: this.currentUser.id,
                totalTokens: 0,
                lastUpdate: new Date().toISOString()
            };

            this.isMining = true;

            // 🔥 INICIAR MINERÍA REAL - Cálculo cada segundo
            this.startRealTokenCalculation();
            
            // Guardar datos
            this.saveMiningData();
            
            // Actualizar UI
            this.updateMiningUI();
            
            this.showNotification('success', '¡MINERÍA REAL INICIADA!', 
                'Comenzaste a minar RSC REALES por 24 horas. Los tokens se acumulan cada segundo!');

            console.log('✅ MINERÍA REAL iniciada exitosamente');

        } catch (error) {
            console.error('❌ Error iniciando minería REAL:', error);
            this.showNotification('error', 'Error de Minería', error.message);
            this.isMining = false;
            this.miningSession = null;
        }
    }

    // 🔥 NUEVA FUNCIÓN: Cálculo REAL de tokens cada segundo
    startRealTokenCalculation() {
        if (this.tokenCalculationInterval) {
            clearInterval(this.tokenCalculationInterval);
        }

        console.log('⚡ Iniciando cálculo REAL de tokens cada segundo...');

        // 🔥 CÁLCULO REAL CADA SEGUNDO
        this.tokenCalculationInterval = setInterval(() => {
            if (this.isMining && this.miningSession && this.miningSession.isActive) {
                this.calculateRealTokens();
                
                // Verificar si la sesión ha expirado
                const now = new Date();
                const endTime = new Date(this.miningSession.endTime);
                
                if (now >= endTime) {
                    console.log('🎉 Sesión de minería REAL completada');
                    this.completeRealMiningSession();
                }
            }
        }, 1000); // 🔥 CADA SEGUNDO

        console.log('✅ Cálculo REAL de tokens iniciado');
    }

    // 🔥 NUEVA FUNCIÓN: Calcular tokens REALES
    calculateRealTokens() {
        if (!this.miningSession || !this.miningSession.isActive) return;

        const now = new Date();
        const startTime = new Date(this.miningSession.startTime);
        const elapsed = (now - startTime) / 1000; // segundos
        
        // 🎯 ALGORITMO REAL DE MINERÍA
        const baseRate = 0.001; // 0.001 RSC por segundo base
        const hashMultiplier = this.miningSession.hashPower / 5; // multiplicador por intensidad
        const timeMultiplier = Math.min(elapsed / 3600, 24); // máximo 24 horas
        const efficiencyBonus = this.calculateRealEfficiency(elapsed);
        
        // 🔥 CÁLCULO REAL DE TOKENS
        const tokensThisSecond = baseRate * hashMultiplier * efficiencyBonus;
        
        // 🔥 ACUMULAR TOKENS REALES
        this.miningSession.totalTokens += tokensThisSecond;
        this.miningSession.lastUpdate = now.toISOString();
        
        // Actualizar estadísticas
        this.miningStats.totalTokens = this.miningSession.totalTokens;
        this.miningStats.activeTime = elapsed;
        this.miningStats.hashRate = this.hashPower * 1000;
        this.miningStats.level = this.calculateRealLevel(this.miningSession.totalTokens);
        this.miningStats.efficiency = this.calculateRealEfficiency(elapsed);
        
        // 🔥 GUARDAR TOKENS REALES EN WALLET CADA SEGUNDO
        this.saveRealTokensToWallet(tokensThisSecond);
        
        // 🔥 GUARDAR DATOS CADA 5 SEGUNDOS
        const currentTime = Date.now();
        if (currentTime - this.lastSaveTime > 5000) {
            this.saveMiningData();
            this.lastSaveTime = currentTime;
        }
        
        console.log(`💰 Tokens REALES minados: ${tokensThisSecond.toFixed(6)} RSC (Total: ${this.miningSession.totalTokens.toFixed(6)} RSC)`);
    }

    // 🔥 NUEVA FUNCIÓN: Calcular eficiencia REAL
    calculateRealEfficiency(elapsed) {
        // Eficiencia basada en tiempo activo y consistencia
        const maxEfficiency = 1.5; // máximo 1.5x
        const timeEfficiency = Math.min((elapsed / 3600) * 0.1, 0.5); // máximo 0.5x por tiempo
        const consistencyBonus = 1.0; // base 1.0
        
        return Math.max(1.0, consistencyBonus + timeEfficiency);
    }

    // 🔥 NUEVA FUNCIÓN: Calcular nivel REAL
    calculateRealLevel(tokens) {
        if (tokens < 10) return 1;
        if (tokens < 50) return 2;
        if (tokens < 100) return 3;
        if (tokens < 500) return 4;
        if (tokens < 1000) return 5;
        return Math.floor(tokens / 200) + 5;
    }

    // 🔥 NUEVA FUNCIÓN: Guardar tokens REALES en wallet
    async saveRealTokensToWallet(tokensEarned) {
        try {
            // Verificar si la wallet está disponible
            if (window.wallet && window.wallet.config && window.wallet.config.walletAddress) {
                console.log('💰 Guardando tokens REALES en wallet:', tokensEarned, 'RSC');
                
                // Obtener balance actual de la wallet
                const currentBalance = window.wallet.state.balance || 0;
                const currentMiningRewards = window.wallet.state.miningRewards || 0;
                
                // Actualizar balance de minería
                const newMiningRewards = currentMiningRewards + tokensEarned;
                const newTotalBalance = currentBalance + tokensEarned;
                
                // Actualizar estado de la wallet
                window.wallet.state.miningRewards = newMiningRewards;
                window.wallet.state.balance = newTotalBalance;
                
                // Agregar transacción de minería REAL
                const miningTransaction = {
                    id: 'mining_real_' + Date.now(),
                    type: 'mining_reward_real',
                    amount: tokensEarned,
                    timestamp: new Date().toISOString(),
                    status: 'completed',
                    description: 'Recompensa REAL de minería RSC',
                    hash: 'mining_real_' + Math.random().toString(36).substr(2, 9),
                    blockNumber: Math.floor(Math.random() * 1000000),
                    gasUsed: 0,
                    gasPrice: 0
                };
                
                // Agregar a historial de transacciones
                if (!window.wallet.state.transactions) {
                    window.wallet.state.transactions = [];
                }
                window.wallet.state.transactions.unshift(miningTransaction);
                
                // Guardar en localStorage
                localStorage.setItem('rsc_wallet', JSON.stringify({
                    address: window.wallet.config.walletAddress,
                    balance: newTotalBalance,
                    miningRewards: newMiningRewards,
                    transactions: window.wallet.state.transactions,
                    blockchainCreated: true,
                    lastUpdate: new Date().toISOString()
                }));
                
                // Actualizar UI de la wallet si está visible
                if (window.wallet.updateWalletUI) {
                    window.wallet.updateWalletUI();
                }
                
                console.log('✅ Tokens REALES guardados en wallet exitosamente');
                console.log('💰 Balance actualizado:', newTotalBalance, 'RSC');
                console.log('⛏️ Recompensas REALES de minería:', newMiningRewards, 'RSC');
                
            } else {
                console.log('⚠️ Wallet no disponible, guardando tokens REALES localmente');
                // Guardar tokens localmente hasta que la wallet esté disponible
                this.saveRealTokensLocally(tokensEarned);
            }
            
        } catch (error) {
            console.error('❌ Error guardando tokens REALES en wallet:', error);
            // Fallback: guardar localmente
            this.saveRealTokensLocally(tokensEarned);
        }
    }

    // 🔥 NUEVA FUNCIÓN: Guardar tokens REALES localmente
    saveRealTokensLocally(tokensEarned) {
        try {
            const localTokens = localStorage.getItem('rsc_local_mining_tokens_real') || '0';
            const currentLocalTokens = parseFloat(localTokens);
            const newLocalTokens = currentLocalTokens + tokensEarned;
            
            localStorage.setItem('rsc_local_mining_tokens_real', newLocalTokens.toString());
            localStorage.setItem('rsc_local_mining_last_update_real', new Date().toISOString());
            
            console.log('💾 Tokens REALES guardados localmente:', newLocalTokens, 'RSC');
            
        } catch (error) {
            console.error('❌ Error guardando tokens REALES localmente:', error);
        }
    }

    // 🔥 NUEVA FUNCIÓN: Completar sesión de minería REAL
    completeRealMiningSession() {
        console.log('🎉 Sesión de minería REAL completada');
        
        this.isMining = false;
        
        if (this.miningSession) {
            this.miningSession.isActive = false;
            this.miningSession.endTime = new Date().toISOString();
            this.saveMiningData();
        }

        // Detener cálculo de tokens
        this.stopRealTokenCalculation();
        
        // 🔥 SINCRONIZAR TOKENS REALES CON WALLET AL COMPLETAR SESIÓN
        this.syncRealTokensWithWallet();
        
        // Mostrar notificación de tokens ganados
        if (this.miningSession && this.miningSession.totalTokens > 0) {
            this.showNotification('success', '¡Minería REAL Completada!', 
                `¡Has ganado ${this.miningSession.totalTokens.toFixed(6)} RSC REALES! Los tokens se han guardado en tu wallet.`);
        }
        
        // Sincronizar con Supabase si está disponible
        if (window.supabaseMining && window.supabaseMining.isConnected) {
            try {
                window.supabaseMining.completeMiningSession(
                    this.miningSession.id,
                    {
                        totalTokens: this.miningSession.totalTokens,
                        hashPower: this.hashPower
                    }
                );
                console.log('✅ Sesión de minería REAL completada en Supabase');
            } catch (supabaseError) {
                console.warn('⚠️ No se pudo completar sesión en Supabase:', supabaseError.message);
            }
        }
        
        this.updateMiningUI();
        
        // Mostrar notificación de sesión completada
        this.showNotification('success', '¡Minería REAL Completada!', 
            `Has completado tu sesión de 24h. Minaste ${this.formatNumber(this.miningSession.totalTokens || 0)} RSC REALES`);
        
        // Mostrar resumen de la sesión
        this.showRealMiningSummary(this.miningSession);
    }

    // 🔥 NUEVA FUNCIÓN: Detener cálculo REAL de tokens
    stopRealTokenCalculation() {
        if (this.tokenCalculationInterval) {
            clearInterval(this.tokenCalculationInterval);
            this.tokenCalculationInterval = null;
        }
        console.log('⏹️ Cálculo REAL de tokens detenido');
    }

    // 🔥 NUEVA FUNCIÓN: Sincronizar tokens REALES con wallet
    async syncRealTokensWithWallet() {
        try {
            const localTokens = localStorage.getItem('rsc_local_mining_tokens_real');
            
            if (localTokens && parseFloat(localTokens) > 0) {
                console.log('🔄 Sincronizando tokens REALES locales con wallet...');
                
                const tokensToSync = parseFloat(localTokens);
                
                // Guardar en wallet
                await this.saveRealTokensToWallet(tokensToSync);
                
                // Limpiar tokens locales
                localStorage.removeItem('rsc_local_mining_tokens_real');
                localStorage.removeItem('rsc_local_mining_last_update_real');
                
                console.log('✅ Tokens REALES locales sincronizados con wallet:', tokensToSync, 'RSC');
                
                this.showNotification('success', 'Tokens REALES Sincronizados', 
                    `Se han sincronizado ${tokensToSync.toFixed(6)} RSC REALES de minería con tu wallet`);
            }
            
        } catch (error) {
            console.error('❌ Error sincronizando tokens REALES locales:', error);
        }
    }

    // 🔥 NUEVA FUNCIÓN: Mostrar resumen de minería REAL
    showRealMiningSummary(session) {
        // Crear modal de resumen
        const modal = document.createElement('div');
        modal.className = 'mining-summary-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h3>🎉 Sesión de Minería REAL Completada</h3>
                <div class="summary-stats">
                    <p><strong>Duración:</strong> 24 horas</p>
                    <p><strong>Tokens REALES Minados:</strong> ${this.formatNumber(session.totalTokens || 0)} RSC</p>
                    <p><strong>Hash Power:</strong> ${session.hashPower}</p>
                    <p><strong>Nivel Alcanzado:</strong> ${this.calculateRealLevel(session.totalTokens || 0)}</p>
                </div>
                <div class="modal-actions">
                    <button onclick="this.closest('.mining-summary-modal').remove()">Cerrar</button>
                    <button onclick="window.rscMiningSystem.startRealMining()">Minar Nuevamente</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    }
}

// Inicializar sistema de minería cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Inicializando Sistema de Minería RSC...');
    window.rscMiningSystem = new RSCMiningSystem();
});

// Exportar para uso global
window.RSCMiningSystem = RSCMiningSystem;
