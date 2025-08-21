/* ===== MINING FUNCTIONALITY ===== */

class MiningSystem {
    constructor() {
        this.isMining = false;
        this.miningSession = null;
        this.hashPower = 5;
        this.sessionDuration = 24 * 60 * 60 * 1000; // 24 horas en milisegundos
        this.serviceWorker = null;
        this.serviceWorkerReady = false;
        
        this.init();
    }

    async init() {
        console.log('🚀 Sistema de minería RSC inicializando...');
        
        try {
            // Inicializar Service Worker
            await this.initServiceWorker();
            
            // Configurar event listeners
            this.setupEventListeners();
            
            // Cargar datos de minería
            this.loadMiningData();
            
            console.log('✅ Sistema de minería RSC inicializado exitosamente');
            
        } catch (error) {
            console.error('❌ Error inicializando sistema de minería:', error);
            showNotification('error', 'Error del Sistema', 'No se pudo inicializar el sistema de minería. Recarga la página.');
        }
    }

    async initServiceWorker() {
        try {
            console.log('🔧 Inicializando Service Worker...');
            
            // Verificar si el navegador soporta Service Workers
            if (!('serviceWorker' in navigator)) {
                throw new Error('Service Worker no soportado en este navegador');
            }

            console.log('✅ Service Worker soportado, registrando...');

            // Registrar Service Worker
            const registration = await navigator.serviceWorker.register('./sw-mining.js');
            console.log('🔧 Service Worker registrado:', registration);

            // Esperar a que esté activo
            await navigator.serviceWorker.ready;
            console.log('✅ Service Worker listo');

            // Escuchar mensajes del Service Worker
            navigator.serviceWorker.addEventListener('message', (event) => {
                console.log('📨 Mensaje recibido del Service Worker:', event.data);
                this.handleServiceWorkerMessage(event.data);
            });

            // Verificar estado del Service Worker
            if (registration.active) {
                this.serviceWorkerReady = true;
                console.log('✅ Service Worker activo y listo');
                this.checkServiceWorkerStatus();
            } else {
                console.log('⏳ Service Worker no está activo aún, esperando...');
                // Esperar a que se active
                await new Promise((resolve) => {
                    const checkActive = () => {
                        if (registration.active) {
                            this.serviceWorkerReady = true;
                            console.log('✅ Service Worker ahora está activo');
                            this.checkServiceWorkerStatus();
                            resolve();
                        } else {
                            setTimeout(checkActive, 100);
                        }
                    };
                    checkActive();
                });
            }

            // Escuchar cambios de estado
            registration.addEventListener('updatefound', () => {
                const newWorker = registration.installing;
                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        console.log('🔄 Nueva versión del Service Worker disponible');
                    }
                });
            });

            console.log('✅ Service Worker inicializado exitosamente');

        } catch (error) {
            console.error('❌ Error inicializando Service Worker:', error);
            this.serviceWorkerReady = false;
            throw error;
        }
    }

    handleServiceWorkerMessage(message) {
        console.log('📨 Procesando mensaje del Service Worker:', message);
        
        const { type, data } = message;
        
        try {
            switch (type) {
                case 'MINING_STARTED':
                    console.log('✅ Minería iniciada en Service Worker');
                    this.isMining = true;
                    if (data.sessionId) {
                        this.miningSession.id = data.sessionId;
                    }
                    this.updateMiningUI();
                    showNotification('success', 'Minería Iniciada', 'El Service Worker está procesando tu minería');
                    break;
                    
                case 'MINING_STOPPED':
                    console.log('⏹️ Minería detenida en Service Worker');
                    this.isMining = false;
                    this.updateMiningUI();
                    showNotification('info', 'Minería Detenida', 'El Service Worker ha detenido la minería');
                    break;
                    
                case 'SESSION_COMPLETED':
                    console.log('🎉 Sesión completada desde Service Worker');
                    this.completeMiningSession(data);
                    break;
                    
                case 'PROGRESS_UPDATE':
                    console.log('📊 Actualización de progreso:', data);
                    this.updateProgressFromServiceWorker(data);
                    break;
                    
                case 'ACTIVE_SESSION_RESPONSE':
                    console.log('📊 Respuesta de sesión activa:', data);
                    this.handleActiveSessionResponse(data);
                    break;
                    
                case 'SESSION_UPDATED':
                    console.log('📝 Sesión actualizada:', data.session);
                    if (data.session) {
                        this.miningSession = { ...this.miningSession, ...data.session };
                        this.updateMiningUI();
                    }
                    break;
                    
                case 'PONG':
                    console.log('🏓 Service Worker respondiendo ping');
                    break;
                    
                case 'ERROR':
                    console.error('❌ Error del Service Worker:', data.error);
                    showNotification('error', 'Error del Sistema', data.error);
                    break;
                    
                default:
                    console.log('📨 Mensaje del Service Worker no reconocido:', type, data);
            }
        } catch (error) {
            console.error('❌ Error procesando mensaje del Service Worker:', error);
        }
    }

    updateProgressFromServiceWorker(data) {
        console.log('📊 Actualizando progreso desde Service Worker:', data);
        
        try {
            if (this.miningSession && this.miningSession.id === data.sessionId) {
                // Actualizar tokens minados
                this.miningSession.totalTokens = data.totalTokens;
                this.miningSession.lastUpdate = new Date().toISOString();
                
                console.log('📈 Tokens actualizados:', data.totalTokens);
                
                // Actualizar UI si la página está visible
                if (!document.hidden) {
                    this.updateMiningUI();
                }
                
                // Guardar datos actualizados
                this.saveMiningData();
            } else {
                console.log('⚠️ Sesión no encontrada o ID no coincide');
            }
        } catch (error) {
            console.error('❌ Error actualizando progreso:', error);
        }
    }

    handleActiveSessionResponse(data) {
        if (data.session) {
            console.log('📊 Sesión activa encontrada:', data.session);
            
            // Restaurar sesión
            this.miningSession = data.session;
            this.isMining = data.session.isActive;
            this.hashPower = data.session.hashPower || 5;
            
            // Verificar si la sesión sigue activa
            const now = new Date();
            const endTime = new Date(data.session.endTime);
            
            if (now < endTime && data.session.isActive) {
                console.log('🔄 Restaurando sesión activa');
                this.updateMiningUI();
                showNotification('info', 'Minería Restaurada', 'Tu minería de 24h continúa funcionando');
            } else if (now >= endTime) {
                console.log('⏰ Sesión expirada');
                this.completeMiningSession({
                    totalTokens: data.session.totalTokens || 0,
                    sessionId: data.session.id
                });
            }
        } else {
            console.log('📭 No hay sesión activa');
        }
    }

    checkServiceWorkerStatus() {
        if (navigator.serviceWorker.controller && this.serviceWorkerReady) {
            // Verificar si hay minería activa
            this.getActiveMiningSession();
            
            // Hacer ping al Service Worker cada 30 segundos
            setInterval(() => {
                if (this.serviceWorkerReady) {
                    this.pingServiceWorker();
                }
            }, 30000);
        }
    }

    async getActiveMiningSession() {
        if (!navigator.serviceWorker.controller) return;
        
        try {
            navigator.serviceWorker.controller.postMessage({
                type: 'GET_ACTIVE_SESSION',
                data: { userId: window.authChecker.currentUser.id }
            });
        } catch (error) {
            console.error('❌ Error obteniendo sesión activa:', error);
        }
    }

    pingServiceWorker() {
        if (navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({
                type: 'PING',
                data: { timestamp: Date.now() }
            });
        }
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
                if (this.isMining && this.serviceWorkerReady) {
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
                console.log('📱 Página oculta - Minería continúa en Service Worker');
            } else {
                console.log('📱 Página visible - Actualizando UI');
                this.updateMiningUI();
                this.checkServiceWorkerStatus();
            }
        });

        // Evento antes de cerrar la página
        window.addEventListener('beforeunload', () => {
            if (this.isMining && this.serviceWorkerReady) {
                console.log('🚪 Página cerrando - Minería continúa en Service Worker');
                return 'La minería continuará funcionando en segundo plano. ¿Estás seguro?';
            }
        });

        // Evento cuando la página se vuelve a cargar
        window.addEventListener('load', () => {
            console.log('📱 Página cargada - Verificando estado de minería');
            setTimeout(() => {
                this.checkServiceWorkerStatus();
                this.loadMiningData();
            }, 1000);
        });

        // Evento cuando la página se enfoca
        window.addEventListener('focus', () => {
            if (this.isMining) {
                console.log('🎯 Página enfocada - Actualizando estado de minería');
                this.updateMiningUI();
                this.checkServiceWorkerStatus();
            }
        });

        // Evento cuando se navega a la página
        window.addEventListener('pageshow', () => {
            console.log('📱 Página mostrada - Verificando estado de minería');
            setTimeout(() => {
                this.checkServiceWorkerStatus();
                this.loadMiningData();
            }, 500);
        });

        // Evento cuando se vuelve a la página desde otra pestaña
        window.addEventListener('focusin', () => {
            if (this.isMining) {
                console.log('🎯 Página enfocada - Verificando minería activa');
                this.checkServiceWorkerStatus();
                this.updateMiningUI();
            }
        });
    }

    async startMining() {
        if (this.isMining) {
            showNotification('warning', 'Ya estás minando', 'La minería ya está activa');
            return;
        }

        try {
            console.log('🚀 Iniciando minería RSC...');
            console.log('Estado actual:', {
                isMining: this.isMining,
                serviceWorkerReady: this.serviceWorkerReady,
                hasServiceWorker: !!navigator.serviceWorker,
                hasController: !!navigator.serviceWorker?.controller
            });
            
            // Verificar si el Service Worker está listo
            if (!this.serviceWorkerReady) {
                console.log('⚠️ Service Worker no está listo, intentando inicializar...');
                await this.initServiceWorker();
                
                if (!this.serviceWorkerReady) {
                    showNotification('error', 'Error del Sistema', 'El sistema de minería no está listo. Recarga la página.');
                    return;
                }
            }

            // Verificar si hay un Service Worker activo
            if (!navigator.serviceWorker.controller) {
                console.log('⚠️ No hay Service Worker activo, esperando...');
                await new Promise(resolve => setTimeout(resolve, 2000));
                
                if (!navigator.serviceWorker.controller) {
                    showNotification('error', 'Error del Sistema', 'No se pudo conectar con el Service Worker. Recarga la página.');
                    return;
                }
            }

            console.log('✅ Service Worker verificado, creando sesión...');
            
            // Crear nueva sesión de minería
            const sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            const startTime = new Date();
            const endTime = new Date(startTime.getTime() + this.sessionDuration);
            
            this.miningSession = {
                id: sessionId,
                userId: 'anonymous_' + Date.now(),
                startTime: startTime.toISOString(),
                endTime: endTime.toISOString(),
                isActive: true,
                hashPower: this.hashPower,
                totalTokens: 0,
                lastUpdate: startTime.toISOString(),
                status: 'active'
            };

            console.log('📝 Sesión creada:', this.miningSession);

            // Iniciar minería en el Service Worker
            console.log('📡 Enviando mensaje al Service Worker...');
            
            if (navigator.serviceWorker.controller) {
                navigator.serviceWorker.controller.postMessage({
                    type: 'START_MINING',
                    data: {
                        session: this.miningSession,
                        hashPower: this.hashPower
                    }
                });
                
                console.log('✅ Mensaje enviado al Service Worker');
            } else {
                throw new Error('Service Worker no disponible');
            }

            // Actualizar UI
            this.isMining = true;
            this.updateMiningUI();
            
            // Mostrar banner de minería activa
            this.showActiveMiningBanner();
            
            // Iniciar contador de tiempo
            this.startTimeCounter();
            
            // Guardar datos localmente
            this.saveMiningData();
            
            showNotification('success', 'Minería Iniciada', 'Tu sesión de 24 horas ha comenzado. Los tokens se acumulan automáticamente.');
            
            console.log('✅ Minería iniciada exitosamente');
            
        } catch (error) {
            console.error('❌ Error iniciando minería:', error);
            showNotification('error', 'Error al Iniciar', 'No se pudo iniciar la minería. Intenta recargar la página.');
            
            // Resetear estado en caso de error
            this.isMining = false;
            this.miningSession = null;
            this.updateMiningUI();
        }
    }

    async stopMining() {
        if (!this.isMining) {
            showNotification('warning', 'No estás minando', 'No hay minería activa para detener');
            return;
        }

        try {
            console.log('⏹️ Deteniendo minería RSC...');
            
            // Detener minería en el Service Worker
            if (navigator.serviceWorker.controller) {
                navigator.serviceWorker.controller.postMessage({
                    type: 'STOP_MINING',
                    data: {
                        sessionId: this.miningSession.id,
                        totalTokens: this.miningSession.totalTokens
                    }
                });
            }

            // Detener contador de tiempo
            this.stopTimeCounter();
            
            // Ocultar banner de minería activa
            this.hideActiveMiningBanner();
            
            // Actualizar estado
            this.isMining = false;
            if (this.miningSession) {
                this.miningSession.isActive = false;
                this.miningSession.status = 'stopped';
                this.miningSession.endTime = new Date().toISOString();
            }
            
            // Actualizar UI
            this.updateMiningUI();
            
            // Guardar datos
            this.saveMiningData();
            
            showNotification('info', 'Minería Detenida', 'Has detenido la minería. Los tokens acumulados están disponibles para reclamar.');
            
            console.log('✅ Minería detenida exitosamente');
            
        } catch (error) {
            console.error('❌ Error deteniendo minería:', error);
            showNotification('error', 'Error al Detener', 'No se pudo detener la minería correctamente.');
        }
    }

    completeMiningSession(data) {
        console.log('🎉 Completando sesión de minería:', data);
        
        try {
            // Detener contador de tiempo
            this.stopTimeCounter();
            
            // Ocultar banner de minería activa
            this.hideActiveMiningBanner();
            
            // Actualizar estado
            this.isMining = false;
            if (this.miningSession) {
                this.miningSession.isActive = false;
                this.miningSession.status = 'completed';
                this.miningSession.totalTokens = data.totalTokens || 0;
                this.miningSession.endTime = new Date().toISOString();
            }
            
            // Actualizar UI
            this.updateMiningUI();
            
            // Guardar datos
            this.saveMiningData();
            
            // Mostrar notificación de sesión completada
            showNotification('success', '¡Sesión Completada!', 
                `Has completado tu sesión de 24 horas. Tokens minados: ${this.formatNumber(data.totalTokens || 0)} RSC`);
            
            // Habilitar botón de reclamar
            const claimBtn = document.getElementById('claimBtn');
            if (claimBtn) {
                claimBtn.disabled = false;
                claimBtn.classList.add('available');
            }
            
            console.log('✅ Sesión completada exitosamente');
            
        } catch (error) {
            console.error('❌ Error completando sesión:', error);
        }
    }

    updateMiningUI() {
        console.log('🎨 Actualizando UI de minería...');
        
        try {
            // Botones principales
            const startBtn = document.getElementById('startMiningBtn');
            const stopBtn = document.getElementById('stopMiningBtn');
            const claimBtn = document.getElementById('claimBtn');
            
            if (startBtn) {
                startBtn.disabled = this.isMining;
                startBtn.classList.toggle('active', this.isMining);
            }
            
            if (stopBtn) {
                stopBtn.disabled = !this.isMining;
                stopBtn.classList.toggle('active', this.isMining);
            }
            
            if (claimBtn) {
                const hasTokens = this.miningSession && this.miningSession.totalTokens > 0;
                claimBtn.disabled = !hasTokens || this.isMining;
                claimBtn.classList.toggle('available', hasTokens && !this.isMining);
            }
            
            // Banner de minería activa
            if (this.isMining && this.miningSession) {
                this.showActiveMiningBanner();
                this.updateSessionProgress();
            } else {
                this.hideActiveMiningBanner();
            }
            
            // Estadísticas del usuario
            this.updateUserStats();
            
            // Slider de intensidad
            const intensitySlider = document.getElementById('miningIntensity');
            if (intensitySlider) {
                intensitySlider.disabled = this.isMining;
                intensitySlider.value = this.hashPower;
                this.updateIntensityDisplay();
            }
            
            console.log('✅ UI de minería actualizada');
            
        } catch (error) {
            console.error('❌ Error actualizando UI:', error);
        }
    }

    updateUserStats() {
        if (!this.miningSession) return;
        
        try {
            // Hash rate
            const hashRateDisplay = document.getElementById('myHashRate');
            if (hashRateDisplay) {
                const hashRate = this.isMining ? this.hashPower * 100 : 0;
                hashRateDisplay.textContent = this.formatHashRate(hashRate);
            }
            
            // RSC minados
            const minedRSCDisplay = document.getElementById('myMinedRSC');
            if (minedRSCDisplay) {
                const totalTokens = this.miningSession.totalTokens || 0;
                minedRSCDisplay.textContent = `${this.formatNumber(totalTokens)} RSC`;
            }
            
            // Tiempo activo
            const activeTimeDisplay = document.getElementById('myActiveTime');
            if (activeTimeDisplay && this.isMining) {
                this.updateTimeDisplay();
            }
            
            // Nivel del usuario
            const levelDisplay = document.getElementById('myLevel');
            if (levelDisplay) {
                const totalTokens = this.miningSession.totalTokens || 0;
                const level = this.calculateUserLevel(totalTokens);
                levelDisplay.textContent = `Nivel ${level}`;
            }
            
        } catch (error) {
            console.error('❌ Error actualizando estadísticas:', error);
        }
    }

    // Calcular nivel del usuario basado en tokens minados
    calculateUserLevel(totalTokens) {
        if (totalTokens >= 1000) return 5; // Épico
        if (totalTokens >= 500) return 4;  // Avanzado
        if (totalTokens >= 100) return 3;  // Intermedio
        if (totalTokens >= 50) return 2;   // Básico
        return 1; // Novato
    }

    // Formatear hash rate
    formatHashRate(hashRate) {
        if (hashRate >= 1000000) return (hashRate / 1000000).toFixed(2) + ' MH/s';
        if (hashRate >= 1000) return (hashRate / 1000).toFixed(2) + ' KH/s';
        return hashRate + ' H/s';
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
            if (this.hashPower <= 3) {
                intensityValue.textContent = 'Baja';
                intensityValue.className = 'intensity-low';
            } else if (this.hashPower <= 7) {
                intensityValue.textContent = 'Media';
                intensityValue.className = 'intensity-medium';
            } else {
                intensityValue.textContent = 'Alta';
                intensityValue.className = 'intensity-high';
            }
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
                    <button onclick="window.miningSystem.startMining()">Minar Nuevamente</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    }

    async claimTokens() {
        if (!this.miningSession || this.miningSession.totalTokens <= 0) {
            showNotification('warning', 'No hay tokens', 'No tienes tokens para reclamar');
            return;
        }

        if (this.isMining) {
            showNotification('warning', 'Minería Activa', 'Debes detener la minería antes de reclamar tokens');
            return;
        }

        try {
            console.log('🎁 Reclamando tokens RSC...');
            
            const tokensToClaim = this.miningSession.totalTokens;
            
            // Mostrar confirmación
            const confirmed = confirm(
                `¿Estás seguro de que quieres reclamar ${this.formatNumber(tokensToClaim)} RSC?\n\n` +
                'Los tokens serán transferidos a tu wallet y la sesión se reiniciará.'
            );
            
            if (!confirmed) return;
            
            // Simular proceso de reclamación
            showNotification('info', 'Procesando...', 'Reclamando tokens RSC...');
            
            // Simular delay de procesamiento
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Actualizar sesión
            this.miningSession.totalTokens = 0;
            this.miningSession.status = 'claimed';
            this.miningSession.claimedAt = new Date().toISOString();
            
            // Guardar datos
            this.saveMiningData();
            
            // Actualizar UI
            this.updateMiningUI();
            
            // Mostrar notificación de éxito
            showNotification('success', '¡Tokens Reclamados!', 
                `Has reclamado exitosamente ${this.formatNumber(tokensToClaim)} RSC. ` +
                'Los tokens están ahora en tu wallet.');
            
            console.log('✅ Tokens reclamados exitosamente');
            
        } catch (error) {
            console.error('❌ Error reclamando tokens:', error);
            showNotification('error', 'Error al Reclamar', 'No se pudieron reclamar los tokens. Intenta de nuevo.');
        }
    }

    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    saveMiningData() {
        try {
            const data = {
                miningSession: this.miningSession,
                hashPower: this.hashPower,
                isMining: this.isMining,
                lastSaved: new Date().toISOString()
            };
            
            localStorage.setItem('rscMiningData', JSON.stringify(data));
            console.log('💾 Datos de minería guardados:', data);
            
        } catch (error) {
            console.error('❌ Error guardando datos de minería:', error);
        }
    }

    loadMiningData() {
        try {
            console.log('📊 Cargando datos de minería...');
            
            // Cargar datos del localStorage
            const savedData = localStorage.getItem('rscMiningData');
            if (savedData) {
                const data = JSON.parse(savedData);
                this.miningSession = data.miningSession || null;
                this.hashPower = data.hashPower || 5;
                this.isMining = data.isMining || false;
                
                console.log('📊 Datos de minería cargados:', data);
                
                // Verificar si hay una sesión activa
                if (this.miningSession && this.miningSession.isActive) {
                    const now = new Date();
                    const endTime = new Date(this.miningSession.endTime);
                    
                    if (now < endTime) {
                        console.log('🔄 Sesión activa encontrada, restaurando...');
                        this.isMining = true;
                        this.startTimeCounter();
                        this.showActiveMiningBanner();
                    } else {
                        console.log('⏰ Sesión expirada, completando...');
                        this.completeMiningSession({
                            totalTokens: this.miningSession.totalTokens || 0,
                            sessionId: this.miningSession.id
                        });
                    }
                }
                
                // Actualizar UI
                this.updateMiningUI();
            }
            
            console.log('✅ Datos de minería cargados exitosamente');
            
        } catch (error) {
            console.error('❌ Error cargando datos de minería:', error);
            // Resetear datos en caso de error
            this.miningSession = null;
            this.isMining = false;
            this.hashPower = 5;
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

    // Mostrar banner de minería activa
    showActiveMiningBanner() {
        const banner = document.getElementById('activeMiningBanner');
        if (banner) {
            banner.style.display = 'flex';
            banner.classList.add('active');
        }
        
        // Mostrar contenedor de progreso de sesión
        const sessionContainer = document.getElementById('sessionProgressContainer');
        if (sessionContainer) {
            sessionContainer.style.display = 'block';
        }
    }

    // Ocultar banner de minería activa
    hideActiveMiningBanner() {
        const banner = document.getElementById('activeMiningBanner');
        if (banner) {
            banner.style.display = 'none';
            banner.classList.remove('active');
        }
        
        // Ocultar contenedor de progreso de sesión
        const sessionContainer = document.getElementById('sessionProgressContainer');
        if (sessionContainer) {
            sessionContainer.style.display = 'none';
        }
    }

    // Iniciar contador de tiempo
    startTimeCounter() {
        if (this.timeCounter) {
            clearInterval(this.timeCounter);
        }
        
        this.timeCounter = setInterval(() => {
            if (this.miningSession && this.isMining) {
                this.updateTimeDisplay();
                this.updateSessionProgress();
            }
        }, 1000);
    }

    // Detener contador de tiempo
    stopTimeCounter() {
        if (this.timeCounter) {
            clearInterval(this.timeCounter);
            this.timeCounter = null;
        }
    }

    // Actualizar display de tiempo
    updateTimeDisplay() {
        if (!this.miningSession) return;
        
        const now = new Date();
        const startTime = new Date(this.miningSession.startTime);
        const elapsed = now - startTime;
        
        const hours = Math.floor(elapsed / (1000 * 60 * 60));
        const minutes = Math.floor((elapsed % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((elapsed % (1000 * 60)) / 1000);
        
        const timeDisplay = document.getElementById('myActiveTime');
        if (timeDisplay) {
            timeDisplay.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
    }

    // Actualizar progreso de sesión
    updateSessionProgress() {
        if (!this.miningSession) return;
        
        const now = new Date();
        const startTime = new Date(this.miningSession.startTime);
        const endTime = new Date(this.miningSession.endTime);
        
        const totalDuration = endTime - startTime;
        const elapsed = now - startTime;
        const progress = Math.min((elapsed / totalDuration) * 100, 100);
        
        // Actualizar barra de progreso
        const progressBar = document.getElementById('sessionProgressBar');
        if (progressBar) {
            progressBar.style.width = `${progress}%`;
        }
        
        // Actualizar tiempo restante
        const timeRemaining = document.getElementById('sessionTimeRemaining');
        if (timeRemaining) {
            const remaining = endTime - now;
            if (remaining > 0) {
                const hours = Math.floor(remaining / (1000 * 60 * 60));
                const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
                timeRemaining.textContent = `${hours}h ${minutes}m restantes`;
            } else {
                timeRemaining.textContent = 'Sesión completada';
            }
        }
        
        // Verificar si la sesión ha terminado
        if (now >= endTime) {
            this.completeMiningSession({
                totalTokens: this.miningSession.totalTokens || 0,
                sessionId: this.miningSession.id
            });
        }
    }

    // Limpiar recursos al destruir
    destroy() {
        // El Service Worker se mantiene activo independientemente
        console.log('🧹 Recursos del sistema de minería limpiados');
    }
}

// Inicializar sistema de minería cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
    if (window.authChecker && window.authChecker.isAuthenticated) {
        window.miningSystem = new MiningSystem();
    }
});

// Exportar para uso global
window.MiningSystem = MiningSystem;