/* ===== SISTEMA HÍBRIDO DE MINERÍA RSC - PERSISTENCIA REAL ===== */

class HybridMiningSystem {
    constructor() {
        this.isMining = false;
        this.miningSession = null;
        this.hashPower = 5;
        this.sessionDuration = 24 * 60 * 60 * 1000; // 24 horas
        this.tokenCalculationInterval = null;
        this.backgroundSyncInterval = null;
        this.lastSaveTime = 0;
        this.lastBackendSync = 0;
        
        this.init();
    }

    async init() {
        console.log('🚀 Sistema Híbrido de Minería RSC inicializando...');
        
        // Verificar autenticación
        if (!window.authChecker || !window.authChecker.isAuthenticated) {
            console.log('❌ Usuario no autenticado');
            return;
        }

        this.setupEventListeners();
        this.loadMiningData();
        this.startBackgroundSync();
        
        console.log('✅ Sistema Híbrido de Minería RSC inicializado');
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
        const refreshBtn = document.getElementById('refreshBtn-main');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.refreshMiningData());
        }

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

        // Evento cuando la página se enfoca
        window.addEventListener('focus', () => {
            if (this.isMining) {
                console.log('🎯 Página enfocada - Actualizando estado de minería');
                this.updateMiningUI();
                this.syncWithBackend();
            }
        });

        // Evento cuando se navega a la página
        window.addEventListener('pageshow', () => {
            console.log('📱 Página mostrada - Verificando estado de minería');
            setTimeout(() => {
                this.loadMiningData();
                this.syncWithBackend();
            }, 500);
        });

        // Evento cuando se vuelve a la página desde otra pestaña
        window.addEventListener('focusin', () => {
            if (this.isMining) {
                console.log('🎯 Página enfocada - Verificando minería activa');
                this.updateMiningUI();
                this.syncWithBackend();
            }
        });
    }

    async startMining() {
        if (this.isMining) {
            showNotification('warning', 'Ya estás minando', 'La minería ya está activa');
            return;
        }

        // Verificar autenticación
        if (!window.authChecker || !window.authChecker.isAuthenticated) {
            showNotification('error', 'Acceso Denegado', 'Debes iniciar sesión para minar');
            return;
        }

        const currentUser = window.authChecker.currentUser;
        console.log('🚀 Iniciando minería para usuario:', currentUser.username);

        try {
            // Crear sesión de minería de 24 horas
            this.miningSession = {
                id: this.generateSessionId(),
                startTime: new Date().toISOString(),
                endTime: new Date(Date.now() + this.sessionDuration).toISOString(),
                isActive: true,
                hashPower: this.hashPower,
                walletAddress: currentUser.walletAddress || 'demo',
                userId: currentUser.id,
                totalTokens: 0,
                lastUpdate: new Date().toISOString(),
                createdAt: new Date().toISOString()
            };

            this.isMining = true;

            // Iniciar cálculo de tokens en segundo plano
            this.startTokenCalculation();
            
            // Guardar datos localmente
            this.saveMiningData();
            
            // Sincronizar con backend
            await this.syncWithBackend();

            // Actualizar UI
            this.updateMiningUI();
            
            showNotification('success', '¡Minería Iniciada!', 'Comenzaste a minar RSC por 24 horas');

            console.log('✅ Minería iniciada exitosamente:', this.miningSession);

        } catch (error) {
            console.error('❌ Error iniciando minería:', error);
            showNotification('error', 'Error de Minería', error.message);
            this.isMining = false;
            this.miningSession = null;
            this.updateMiningUI();
        }
    }

    stopMining() {
        if (!this.isMining) {
            showNotification('warning', 'No estás minando', 'No hay minería activa para detener');
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
        
        // Sincronizar con backend
        this.syncWithBackend();
        
        this.updateMiningUI();
        showNotification('info', 'Minería Detenida', 'Has detenido la minería manualmente');
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
        
        // Guardar datos cada 10 segundos
        const currentTime = Date.now();
        if (currentTime - this.lastSaveTime > 10000) {
            this.saveMiningData();
            this.lastSaveTime = currentTime;
        }
        
        // Sincronizar con backend cada 30 segundos
        if (currentTime - this.lastBackendSync > 30000) {
            this.syncWithBackend();
            this.lastBackendSync = currentTime;
        }
        
        // Actualizar UI si la página está visible
        if (!document.hidden) {
            this.updateMiningUI();
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
        
        // Sincronizar con backend
        this.syncWithBackend();
        
        this.updateMiningUI();
        
        // Mostrar notificación de sesión completada
        showNotification('success', '¡Minería Completada!', 
            `Has completado tu sesión de 24h. Minaste ${this.formatNumber(this.miningSession.totalTokens || 0)} RSC`);
        
        // Mostrar resumen de la sesión
        this.showMiningSummary(this.miningSession);
    }

    startBackgroundSync() {
        // Sincronizar con backend cada 30 segundos
        this.backgroundSyncInterval = setInterval(() => {
            if (this.isMining) {
                this.syncWithBackend();
            }
        }, 30000);

        console.log('🔄 Sincronización en segundo plano iniciada');
    }

    async syncWithBackend() {
        if (!this.miningSession) return;

        try {
            // Intentar sincronizar con el backend
            const response = await fetch('/api/mining/update-progress', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sessionId: this.miningSession.id,
                    totalTokens: this.miningSession.totalTokens,
                    elapsed: this.getElapsedTime()
                })
            });

            if (response.ok) {
                console.log('✅ Progreso sincronizado con backend');
            }
        } catch (error) {
            console.log('🔄 Backend no disponible, continuando en modo local');
        }
    }

    ensureBackgroundMining() {
        // Asegurar que la minería continúe en segundo plano
        if (this.isMining && !this.tokenCalculationInterval) {
            console.log('🔄 Restaurando cálculo de tokens en segundo plano');
            this.startTokenCalculation();
        }
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

        const hashRate = this.hashPower * 1000; // MH/s
        const minedRSC = this.miningSession.totalTokens || 0;
        const activeTime = this.calculateActiveTime();
        const level = this.calculateLevel(minedRSC);

        // Actualizar elementos en la UI
        const hashRateElement = document.getElementById('myHashRate');
        const minedRSCElement = document.getElementById('myMinedRSC');
        const activeTimeElement = document.getElementById('myActiveTime');
        const levelElement = document.getElementById('myLevel');

        if (hashRateElement) hashRateElement.textContent = this.formatNumber(hashRate) + ' MH/s';
        if (minedRSCElement) minedRSCElement.textContent = this.formatNumber(minedRSC) + ' RSC';
        if (activeTimeElement) activeTimeElement.textContent = activeTime;
        if (levelElement) levelElement.textContent = 'Nivel ' + level;
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

    calculateActiveTime() {
        if (!this.miningSession) return '0h 0m';

        const startTime = new Date(this.miningSession.startTime);
        const now = new Date();
        const elapsed = now - startTime;
        
        const hours = Math.floor(elapsed / (1000 * 60 * 60));
        const minutes = Math.floor((elapsed % (1000 * 60 * 60)) / (1000 * 60));
        
        return `${hours}h ${minutes}m`;
    }

    calculateLevel(tokens) {
        if (tokens < 10) return 1;
        if (tokens < 50) return 2;
        if (tokens < 100) return 3;
        if (tokens < 500) return 4;
        if (tokens < 1000) return 5;
        return Math.floor(tokens / 200) + 5;
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

    showMiningSummary(session) {
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
                    <button onclick="window.hybridMiningSystem.startMining()">Minar Nuevamente</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    }

    async claimTokens() {
        if (!this.miningSession || this.miningSession.isActive) {
            showNotification('warning', 'Minería Activa', 'Debes esperar a que termine tu sesión de 24h');
            return;
        }

        const tokensToClaim = this.miningSession.totalTokens || 0;
        if (tokensToClaim <= 0) {
            showNotification('warning', 'Sin Tokens', 'No tienes tokens para reclamar');
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
                    userId: window.authChecker.currentUser.id
                })
            });

            if (response.ok) {
                showNotification('success', '¡Tokens Reclamados!', 
                    `Has reclamado ${this.formatNumber(tokensToClaim)} RSC`);
                
                // Resetear sesión
                this.miningSession.totalTokens = 0;
                this.saveMiningData();
                this.updateMiningUI();
            }
        } catch (error) {
            console.log('🔄 Backend no disponible, reclamando localmente');
            showNotification('success', '¡Tokens Reclamados!', 
                `Has reclamado ${this.formatNumber(tokensToClaim)} RSC (modo local)`);
            
            this.miningSession.totalTokens = 0;
            this.saveMiningData();
            this.updateMiningUI();
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
                lastSave: new Date().toISOString(),
                version: '4.0',
                hybridSystem: true
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

    loadMiningData() {
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

    refreshMiningData() {
        this.updateMiningUI();
        this.updateGlobalStats();
        showNotification('info', 'Datos Actualizados', 'Información de minería refrescada');
    }

    updateGlobalStats() {
        // Actualizar estadísticas globales desde el backend
        fetch('/api/mining/system-stats')
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Actualizar UI con estadísticas globales
                    console.log('📊 Estadísticas globales actualizadas:', data);
                }
            })
            .catch(error => {
                console.log('🔄 Backend no disponible para estadísticas globales');
            });
    }

    formatNumber(num) {
        if (num < 1000) return num.toFixed(2);
        if (num < 1000000) return (num / 1000).toFixed(2) + 'K';
        return (num / 1000000).toFixed(2) + 'M';
    }

    // Limpiar recursos al destruir
    destroy() {
        if (this.tokenCalculationInterval) {
            clearInterval(this.tokenCalculationInterval);
        }
        if (this.backgroundSyncInterval) {
            clearInterval(this.backgroundSyncInterval);
        }
        console.log('🧹 Recursos del sistema híbrido de minería limpiados');
    }
}

// Inicializar sistema de minería híbrido cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
    if (window.authChecker && window.authChecker.isAuthenticated) {
        window.hybridMiningSystem = new HybridMiningSystem();
    }
});

// Exportar para uso global
window.HybridMiningSystem = HybridMiningSystem;
