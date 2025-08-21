/* ===== WEB WORKER PARA MINERÍA EN SEGUNDO PLANO ===== */

// Este worker funciona independientemente de la página
// y continúa minando aunque cambies de página

let miningSession = null;
let isMining = false;
let tokenCalculationInterval = null;
let lastSaveTime = 0;

// Función para calcular tokens
function calculateTokens() {
    if (!miningSession || !miningSession.isActive) return;

    const now = new Date();
    const startTime = new Date(miningSession.startTime);
    const elapsed = (now - startTime) / 1000; // segundos
    
    // Calcular tokens basado en tiempo transcurrido y hash power
    const baseRate = 0.001; // tokens por segundo base
    const hashMultiplier = miningSession.hashPower / 5; // multiplicador por intensidad
    const timeMultiplier = Math.min(elapsed / 3600, 24); // máximo 24 horas
    
    const tokensEarned = baseRate * hashMultiplier * timeMultiplier;
    
    miningSession.totalTokens = tokensEarned;
    miningSession.lastUpdate = now.toISOString();
    
    // Guardar en localStorage cada 10 segundos
    const currentTime = Date.now();
    if (currentTime - lastSaveTime > 10000) {
        saveMiningData();
        lastSaveTime = currentTime;
    }
    
    // Enviar progreso al thread principal
    self.postMessage({
        type: 'PROGRESS_UPDATE',
        data: {
            totalTokens: tokensEarned,
            elapsed: elapsed,
            timeRemaining: getTimeRemaining(miningSession.endTime)
        }
    });
}

// Función para obtener tiempo restante
function getTimeRemaining(endTime) {
    const now = new Date();
    const end = new Date(endTime);
    const remaining = end - now;
    
    if (remaining <= 0) return 0;
    return remaining;
}

// Función para guardar datos
function saveMiningData() {
    try {
        const data = {
            isMining: isMining,
            miningSession: miningSession,
            lastSave: new Date().toISOString(),
            workerActive: true
        };
        
        // Usar postMessage para guardar en localStorage desde el thread principal
        self.postMessage({
            type: 'SAVE_DATA',
            data: data
        });
        
    } catch (error) {
        console.error('Worker: Error guardando datos:', error);
    }
}

// Función para iniciar minería
function startMining(sessionData) {
    console.log('Worker: Iniciando minería:', sessionData);
    
    miningSession = sessionData;
    isMining = true;
    
    // Iniciar cálculo de tokens cada segundo
    if (tokenCalculationInterval) {
        clearInterval(tokenCalculationInterval);
    }
    
    tokenCalculationInterval = setInterval(() => {
        calculateTokens();
        
        // Verificar si la sesión ha expirado
        if (miningSession && miningSession.isActive) {
            const now = new Date();
            const endTime = new Date(miningSession.endTime);
            
            if (now >= endTime) {
                console.log('Worker: Sesión completada');
                completeMiningSession();
            }
        }
    }, 1000);
    
    // Guardar datos inmediatamente
    saveMiningData();
    
    // Enviar confirmación
    self.postMessage({
        type: 'MINING_STARTED',
        data: { success: true }
    });
}

// Función para detener minería
function stopMining() {
    console.log('Worker: Deteniendo minería');
    
    isMining = false;
    
    if (tokenCalculationInterval) {
        clearInterval(tokenCalculationInterval);
        tokenCalculationInterval = null;
    }
    
    if (miningSession) {
        miningSession.isActive = false;
        miningSession.endTime = new Date().toISOString();
    }
    
    // Guardar estado final
    saveMiningData();
    
    // Enviar confirmación
    self.postMessage({
        type: 'MINING_STOPPED',
        data: { success: true }
    });
}

// Función para completar sesión
function completeMiningSession() {
    console.log('Worker: Completando sesión de minería');
    
    isMining = false;
    
    if (tokenCalculationInterval) {
        clearInterval(tokenCalculationInterval);
        tokenCalculationInterval = null;
    }
    
    if (miningSession) {
        miningSession.isActive = false;
        miningSession.endTime = new Date().toISOString();
    }
    
    // Guardar estado final
    saveMiningData();
    
    // Enviar notificación de sesión completada
    self.postMessage({
        type: 'SESSION_COMPLETED',
        data: {
            totalTokens: miningSession ? miningSession.totalTokens : 0,
            sessionId: miningSession ? miningSession.id : null
        }
    });
}

// Función para verificar estado
function checkMiningStatus() {
    if (miningSession && miningSession.isActive) {
        const now = new Date();
        const endTime = new Date(miningSession.endTime);
        
        if (now < endTime) {
            // Sesión sigue activa
            self.postMessage({
                type: 'STATUS_UPDATE',
                data: {
                    isActive: true,
                    timeRemaining: getTimeRemaining(endTime),
                    totalTokens: miningSession.totalTokens
                }
            });
        } else {
            // Sesión expirada
            completeMiningSession();
        }
    } else {
        self.postMessage({
            type: 'STATUS_UPDATE',
            data: { isActive: false }
        });
    }
}

// Función para restaurar sesión
function restoreMiningSession(sessionData) {
    console.log('Worker: Restaurando sesión de minería:', sessionData);
    
    if (sessionData && sessionData.miningSession && sessionData.miningSession.isActive) {
        const session = sessionData.miningSession;
        const now = new Date();
        const endTime = new Date(session.endTime);
        
        if (now < endTime) {
            // Restaurar minería
            startMining(session);
        } else {
            // Sesión expirada
            self.postMessage({
                type: 'SESSION_EXPIRED',
                data: { sessionId: session.id }
            });
        }
    }
}

// Escuchar mensajes del thread principal
self.addEventListener('message', function(e) {
    const { type, data } = e.data;
    
    switch (type) {
        case 'START_MINING':
            startMining(data);
            break;
            
        case 'STOP_MINING':
            stopMining();
            break;
            
        case 'CHECK_STATUS':
            checkMiningStatus();
            break;
            
        case 'RESTORE_SESSION':
            restoreMiningSession(data);
            break;
            
        case 'PING':
            // Responder al ping para verificar que el worker está activo
            self.postMessage({
                type: 'PONG',
                data: { timestamp: Date.now() }
            });
            break;
            
        default:
            console.log('Worker: Comando desconocido:', type);
    }
});

// Verificar estado cada 30 segundos
setInterval(() => {
    if (isMining) {
        checkMiningStatus();
    }
}, 30000);

// Notificar que el worker está activo
self.postMessage({
    type: 'WORKER_READY',
    data: { timestamp: Date.now() }
});

console.log('Worker: Sistema de minería RSC inicializado');
