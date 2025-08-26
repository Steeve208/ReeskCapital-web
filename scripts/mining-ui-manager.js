/* ========================================
   MINING UI MANAGER - RSC CHAIN
   Gestiona la interfaz de usuario de minería
   con integración en tiempo real con Supabase
================================ */

class MiningUIManager {
    constructor() {
        this.elements = {};
        this.updateInterval = null;
        this.isInitialized = false;
        
        this.init();
    }

    async init() {
        console.log('🎨 Inicializando Mining UI Manager...');
        
        try {
            // Esperar a que Supabase esté disponible
            await this.waitForSupabase();
            
            // Configurar elementos de UI
            this.setupUIElements();
            
            // Configurar event listeners
            this.setupEventListeners();
            
            // Iniciar actualizaciones automáticas
            this.startAutoUpdates();
            
            // Escuchar eventos de Supabase
            this.setupSupabaseEventListeners();
            
            this.isInitialized = true;
            console.log('✅ Mining UI Manager inicializado correctamente');
            
        } catch (error) {
            console.error('❌ Error inicializando Mining UI Manager:', error);
        }
    }

    async waitForSupabase() {
        return new Promise((resolve) => {
            const checkSupabase = () => {
                if (window.supabaseMining && window.supabaseMining.isConnected) {
                    resolve();
                } else {
                    setTimeout(checkSupabase, 100);
                }
            };
            checkSupabase();
        });
    }

    setupUIElements() {
        // Elementos principales
        this.elements = {
            startBtn: document.getElementById('startMiningBtn'),
            stopBtn: document.getElementById('stopMiningBtn'),
            claimBtn: document.getElementById('claimBtn'),
            hashRate: document.getElementById('myHashRate'),
            minedRSC: document.getElementById('myMinedRSC'),
            activeTime: document.getElementById('myActiveTime'),
            level: document.getElementById('myLevel'),
            sessionProgress: document.getElementById('sessionProgressContainer'),
            sessionProgressBar: document.getElementById('sessionProgressBar'),
            sessionTimeRemaining: document.getElementById('sessionTimeRemaining'),
            intensitySlider: document.getElementById('miningIntensity'),
            intensityValue: document.getElementById('intensityValue'),
            refreshBtn: document.getElementById('refreshBtn')
        };

        console.log('🎯 Elementos de UI configurados');
    }

    setupEventListeners() {
        // Slider de intensidad
        if (this.elements.intensitySlider) {
            this.elements.intensitySlider.addEventListener('input', (e) => {
                this.updateIntensityDisplay(e.target.value);
            });
        }

        // Botón de actualización
        if (this.elements.refreshBtn) {
            this.elements.refreshBtn.addEventListener('click', () => {
                this.refreshMiningData();
            });
        }

        console.log('🎧 Event listeners configurados');
    }

    setupSupabaseEventListeners() {
        // Escuchar eventos de Supabase
        window.addEventListener('mining:stats:updated', (event) => {
            this.updateMiningStats(event.detail.stats);
        });

        window.addEventListener('mining:leaderboard:updated', (event) => {
            this.updateLeaderboard(event.detail.leaderboard);
        });

        window.addEventListener('mining:rewards:claimed', (event) => {
            this.showRewardClaimed(event.detail.amount);
        });

        window.addEventListener('supabase:connected', (event) => {
            this.onSupabaseConnected();
        });

        window.addEventListener('supabase:error', (event) => {
            this.onSupabaseError(event.detail.error);
        });

        console.log('🔗 Event listeners de Supabase configurados');
    }

    startAutoUpdates() {
        // Actualizar UI cada segundo
        this.updateInterval = setInterval(() => {
            this.updateMiningUI();
        }, 1000);

        console.log('🔄 Actualizaciones automáticas de UI iniciadas');
    }

    updateMiningUI() {
        if (!window.rscMiningSystem) return;

        const miningSystem = window.rscMiningSystem;
        
        // Actualizar estadísticas en tiempo real
        if (miningSystem.miningSession && miningSystem.isMining) {
            this.updateRealTimeStats(miningSystem);
            this.updateSessionProgress(miningSystem);
        }

        // Actualizar botones
        this.updateButtonStates(miningSystem);
    }

    updateRealTimeStats(miningSystem) {
        const session = miningSystem.miningSession;
        if (!session) return;

        // Hash Rate
        if (this.elements.hashRate) {
            this.elements.hashRate.textContent = `${miningSystem.hashPower * 1000} H/s`;
        }

        // RSC Minados
        if (this.elements.minedRSC) {
            this.elements.minedRSC.textContent = `${miningSystem.formatNumber(session.totalTokens || 0)} RSC`;
        }

        // Tiempo Activo
        if (this.elements.activeTime) {
            const elapsed = miningSystem.getElapsedTime();
            this.elements.activeTime.textContent = miningSystem.formatTime(elapsed);
        }

        // Nivel
        if (this.elements.level) {
            const level = miningSystem.calculateLevel(session.totalTokens || 0);
            this.elements.level.textContent = `Nivel ${level}`;
        }
    }

    updateSessionProgress(miningSystem) {
        const session = miningSystem.miningSession;
        if (!session) return;

        // Mostrar contenedor de progreso
        if (this.elements.sessionProgress) {
            this.elements.sessionProgress.style.display = 'block';
        }

        // Calcular progreso
        const startTime = new Date(session.startTime);
        const endTime = new Date(session.endTime);
        const now = new Date();
        
        const totalDuration = endTime - startTime;
        const elapsed = now - startTime;
        const progress = Math.min((elapsed / totalDuration) * 100, 100);
        
        // Actualizar barra de progreso
        if (this.elements.sessionProgressBar) {
            this.elements.sessionProgressBar.style.width = `${progress}%`;
        }

        // Actualizar tiempo restante
        if (this.elements.sessionTimeRemaining) {
            const remaining = Math.max(endTime - now, 0);
            const hours = Math.floor(remaining / (1000 * 60 * 60));
            const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
            this.elements.sessionTimeRemaining.textContent = `${hours}h ${minutes}m restantes`;
        }
    }

    updateButtonStates(miningSystem) {
        // Botón de inicio
        if (this.elements.startBtn) {
            this.elements.startBtn.disabled = miningSystem.isMining;
        }

        // Botón de parada
        if (this.elements.stopBtn) {
            this.elements.stopBtn.disabled = !miningSystem.isMining;
        }

        // Botón de reclamar
        if (this.elements.claimBtn) {
            const hasRewards = (miningSystem.miningSession?.totalTokens || 0) > 0;
            this.elements.claimBtn.disabled = !hasRewards;
        }
    }

    updateIntensityDisplay(value) {
        if (this.elements.intensityValue) {
            let label = 'Media';
            if (value <= 3) label = 'Baja';
            else if (value >= 7) label = 'Alta';
            
            this.elements.intensityValue.textContent = label;
        }

        // Actualizar hash power en el sistema de minería
        if (window.rscMiningSystem) {
            window.rscMiningSystem.hashPower = parseInt(value);
            window.rscMiningSystem.updateMiningSession();
        }
    }

    async refreshMiningData() {
        try {
            if (window.supabaseMining && window.supabaseMining.isConnected) {
                // Obtener estadísticas actualizadas
                const stats = await window.supabaseMining.getMinerStats();
                if (stats) {
                    this.updateMiningStats(stats);
                }

                // Obtener historial
                const history = await window.supabaseMining.getMiningHistory();
                if (history.length > 0) {
                    this.updateMiningHistory(history);
                }

                console.log('✅ Datos de minería actualizados desde Supabase');
            }
        } catch (error) {
            console.error('❌ Error actualizando datos:', error);
        }
    }

    updateMiningStats(stats) {
        // Actualizar estadísticas del minero
        if (this.elements.hashRate) {
            this.elements.hashRate.textContent = `${stats.hash_power * 1000} H/s`;
        }

        if (this.elements.minedRSC) {
            this.elements.minedRSC.textContent = `${stats.balance.toFixed(6)} RSC`;
        }

        if (this.elements.level) {
            const level = this.calculateLevel(stats.balance);
            this.elements.level.textContent = `Nivel ${level}`;
        }
    }

    updateMiningHistory(history) {
        // Aquí puedes implementar la actualización del historial
        // Por ejemplo, en una tabla o gráfico
        console.log('📊 Historial de minería actualizado:', history);
    }

    updateLeaderboard(leaderboard) {
        // Aquí puedes implementar la actualización del leaderboard
        console.log('🏆 Leaderboard actualizado:', leaderboard);
    }

    showRewardClaimed(amount) {
        // Mostrar notificación de recompensa reclamada
        if (window.rscMiningSystem) {
            window.rscMiningSystem.showNotification(
                'success', 
                '¡Recompensas Reclamadas!', 
                `Has reclamado ${amount.toFixed(6)} RSC`
            );
        }
    }

    onSupabaseConnected() {
        console.log('🔗 Supabase conectado - UI actualizada');
        this.refreshMiningData();
    }

    onSupabaseError(error) {
        console.error('❌ Error de Supabase:', error);
        // Mostrar notificación de error
        if (window.rscMiningSystem) {
            window.rscMiningSystem.showNotification(
                'error',
                'Error de Conexión',
                'No se pudo conectar con la base de datos'
            );
        }
    }

    calculateLevel(balance) {
        if (balance < 10) return 1;
        if (balance < 50) return 2;
        if (balance < 100) return 3;
        if (balance < 500) return 4;
        if (balance < 1000) return 5;
        return Math.floor(balance / 200) + 5;
    }

    // Limpiar recursos
    destroy() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
        console.log('🧹 Mining UI Manager destruido');
    }
}

// Crear instancia global
const miningUIManager = new MiningUIManager();

// Exportar para uso global
if (typeof window !== 'undefined') {
    window.miningUIManager = miningUIManager;
    window.MiningUIManager = MiningUIManager;
}

// Para compatibilidad con módulos ES6
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { MiningUIManager, miningUIManager };
}
