/**
 * SNOW MINING ADAPTER
 * Integra el evento Snow Mining con el sistema de minería principal
 */

class SnowMiningAdapter {
    constructor() {
        this.miningActive = false;
        this.currentMultiplier = 1.0;
        this.baseHashrate = 0;
        this.originalAddBalance = null;
    }

    initialize() {
        console.log('🔌 Inicializando Snow Mining Adapter...');

        // Esperar a que ambos sistemas estén listos
        this.waitForSystems().then(() => {
            this.setupIntegration();
        });
    }

    async waitForSystems() {
        return new Promise((resolve) => {
            const checkInterval = setInterval(() => {
                if (window.snowMiningEvent && window.supabaseIntegration) {
                    clearInterval(checkInterval);
                    resolve();
                }
            }, 100);
        });
    }

    setupIntegration() {
        // Escuchar eventos de minería del sistema principal
        this.listenToMiningEvents();

        // Escuchar eventos del Snow Mining
        this.listenToSnowEvents();

        // Aplicar multiplicador a las ganancias de minería
        this.applyMultiplierToEarnings();

        console.log('✅ Snow Mining Adapter integrado correctamente');
    }

    listenToMiningEvents() {
        // Detectar cuando inicia la minería
        const originalStartMining = window.startMining;
        if (typeof originalStartMining === 'function') {
            window.startMining = (...args) => {
                const result = originalStartMining.apply(this, args);
                this.onMiningStarted();
                return result;
            };
        }

        // Detectar cuando se detiene la minería
        const originalStopMining = window.stopMining;
        if (typeof originalStopMining === 'function') {
            window.stopMining = (...args) => {
                const result = originalStopMining.apply(this, args);
                this.onMiningStopped();
                return result;
            };
        }

        // Escuchar cambios en el estado de minería desde el botón
        const startMiningBtn = document.getElementById('startMiningBtn');
        const stopMiningBtn = document.getElementById('stopMiningBtn');

        if (startMiningBtn) {
            startMiningBtn.addEventListener('click', () => {
                setTimeout(() => this.onMiningStarted(), 500);
            });
        }

        if (stopMiningBtn) {
            stopMiningBtn.addEventListener('click', () => {
                this.onMiningStopped();
            });
        }
    }

    listenToSnowEvents() {
        // Bonus activado
        window.addEventListener('snowBonusActive', (e) => {
            this.currentMultiplier = e.detail.multiplier;
            this.applyMultiplier();
            this.updateMultiplierDisplay();
        });

        // Bonus expirado
        window.addEventListener('snowBonusExpired', () => {
            this.currentMultiplier = 1.0;
            this.updateMultiplierDisplay();
        });
    }

    onMiningStarted() {
        this.miningActive = true;

        // Notificar al Snow Mining Event
        const event = new CustomEvent('miningStateChanged', {
            detail: {
                isMining: true
            }
        });
        window.dispatchEvent(event);

        console.log('⛏️ Minería iniciada - Snow Mining activo');
    }

    onMiningStopped() {
        this.miningActive = false;

        // Notificar al Snow Mining Event
        const event = new CustomEvent('miningStateChanged', {
            detail: {
                isMining: false
            }
        });
        window.dispatchEvent(event);

        console.log('⛏️ Minería detenida');
    }

    applyMultiplierToEarnings() {
        // Interceptar el método de agregar balance
        const supabase = window.supabaseIntegration;
        if (!supabase) return;

        // Guardar el método original
        if (!this.originalAddBalance) {
            this.originalAddBalance = supabase.addBalance.bind(supabase);
        }

        // Reemplazar con versión que aplica multiplicador
        supabase.addBalance = async (amount) => {
            // Aplicar multiplicador si hay bonus activo
            const multipliedAmount = amount * this.currentMultiplier;

            // Mostrar notificación si hay bonus
            if (this.currentMultiplier > 1.0) {
                const bonusAmount = multipliedAmount - amount;
                this.showBonusNotification(bonusAmount);
            }

            // Llamar al método original con el monto multiplicado
            return this.originalAddBalance(multipliedAmount);
        };

        console.log('✅ Multiplicador aplicado a las ganancias de minería');
    }

    applyMultiplier() {
        // Notificación visual del multiplicador
        console.log(`🚀 Multiplicador de minería activado: ${this.currentMultiplier}x`);
    }

    updateMultiplierDisplay() {
        // Actualizar visualización en el dashboard
        const multiplierElements = document.querySelectorAll('[data-multiplier-display]');
        multiplierElements.forEach(el => {
            el.textContent = `${this.currentMultiplier.toFixed(1)}x`;
            
            if (this.currentMultiplier > 1.0) {
                el.classList.add('active');
            } else {
                el.classList.remove('active');
            }
        });
    }

    showBonusNotification(bonusAmount) {
        const notification = document.createElement('div');
        notification.className = 'snow-bonus-notification';
        notification.innerHTML = `
            <div class="bonus-content">
                <span class="bonus-icon">❄️</span>
                <span class="bonus-text">
                    Bonus de Snow Mining<br>
                    <strong>+${bonusAmount.toFixed(6)} RSK</strong>
                </span>
            </div>
        `;

        document.body.appendChild(notification);

        // Animar y remover
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);

        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 500);
        }, 3000);
    }
}

// Crear estilos para la notificación de bonus
const style = document.createElement('style');
style.textContent = `
.snow-bonus-notification {
    position: fixed;
    top: 100px;
    right: 20px;
    background: linear-gradient(135deg, rgba(137, 207, 240, 0.95), rgba(79, 195, 247, 0.95));
    backdrop-filter: blur(10px);
    padding: 20px;
    border-radius: 16px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    box-shadow: 0 10px 40px rgba(137, 207, 240, 0.5);
    z-index: 10000;
    transform: translateX(400px);
    transition: all 0.5s ease;
}

.snow-bonus-notification.show {
    transform: translateX(0);
}

.bonus-content {
    display: flex;
    align-items: center;
    gap: 15px;
    color: white;
}

.bonus-icon {
    font-size: 2.5rem;
    filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.8));
    animation: bonusRotate 2s ease-in-out infinite;
}

@keyframes bonusRotate {
    0%, 100% { transform: rotate(0deg) scale(1); }
    50% { transform: rotate(180deg) scale(1.2); }
}

.bonus-text {
    font-size: 0.9rem;
    line-height: 1.4;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.bonus-text strong {
    font-size: 1.3rem;
    display: block;
    margin-top: 5px;
    text-shadow: 0 0 10px rgba(255, 255, 255, 0.8);
}

@media (max-width: 768px) {
    .snow-bonus-notification {
        right: 10px;
        left: 10px;
        transform: translateY(-200px);
    }
    
    .snow-bonus-notification.show {
        transform: translateY(0);
    }
}
`;
document.head.appendChild(style);

// Inicializar cuando el DOM esté listo
let snowMiningAdapter = null;

function initializeSnowMiningAdapter() {
    if (!snowMiningAdapter) {
        snowMiningAdapter = new SnowMiningAdapter();
        snowMiningAdapter.initialize();
        window.snowMiningAdapter = snowMiningAdapter;
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeSnowMiningAdapter);
} else {
    // Esperar un poco para que otros scripts se carguen
    setTimeout(initializeSnowMiningAdapter, 1000);
}

window.SnowMiningAdapter = SnowMiningAdapter;

