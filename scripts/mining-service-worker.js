// ========================================
// SERVICE WORKER PARA MINERÍA AUTOMÁTICA
// ========================================

const CACHE_NAME = 'rsc-mining-v1';
const MINING_INTERVAL = 1000; // 1 segundo entre operaciones
const MAX_DAILY_RSC = 1; // Máximo 1 RSC por día
const SESSION_DURATION_MS = 24 * 60 * 60 * 1000; // 24 horas de sesión en milisegundos
const DAILY_LIMIT_MS = 24 * 60 * 60 * 1000; // 24 horas en milisegundos

let miningActive = false;
let miningStartTime = null;
let totalMinedRSC = 0;
let lastResetDate = null;

// ========================================
// INSTALACIÓN Y ACTIVACIÓN
// ========================================

self.addEventListener('install', (event) => {
    console.log('🔄 Service Worker de Minería instalado');
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    console.log('✅ Service Worker de Minería activado');
    event.waitUntil(self.clients.claim());
    
    // Inicializar estado de minería
    initializeMiningState();
});

// ========================================
// MANEJO DE MENSAJES
// ========================================

self.addEventListener('message', (event) => {
    const { type, data } = event.data;
    
    switch (type) {
        case 'START_MINING':
            startMining(data);
            break;
        case 'STOP_MINING':
            stopMining();
            break;
        case 'GET_MINING_STATUS':
            sendMiningStatus(event.source);
            break;
        case 'RESET_DAILY_LIMIT':
            resetDailyLimit();
            break;
        case 'UPDATE_MINING_DATA':
            updateMiningData(data);
            break;
    }
});

// ========================================
// FUNCIONES DE MINERÍA
// ========================================

function initializeMiningState() {
    // Recuperar estado guardado
    const savedState = localStorage.getItem('rscMiningState');
    if (savedState) {
        const state = JSON.parse(savedState);
        miningActive = state.miningActive || false;
        miningStartTime = state.miningStartTime ? new Date(state.miningStartTime) : null;
        totalMinedRSC = state.totalMinedRSC || 0;
        lastResetDate = state.lastResetDate ? new Date(state.lastResetDate) : null;
    }
    
    // Verificar si es un nuevo día
    checkDailyReset();
    
    // Si la minería estaba activa, continuarla
    if (miningActive) {
        startMining({});
    }
}

function startMining(data) {
    if (miningActive) {
        console.log('⚠️ La minería ya está activa');
        return;
    }
    
    // Verificar límite diario
    if (totalMinedRSC >= MAX_DAILY_RSC) {
        console.log('🚫 Límite diario alcanzado');
        notifyClient('DAILY_LIMIT_REACHED', { totalMined: totalMinedRSC });
        return;
    }
    
    // Verificar si ya se completó una sesión de 24 horas hoy
    if (miningStartTime && (Date.now() - miningStartTime.getTime()) >= SESSION_DURATION_MS) {
        console.log('⏰ Sesión de 24 horas completada, esperando nueva activación');
        notifyClient('SESSION_COMPLETED', { 
            totalMined: totalMinedRSC,
            sessionDuration: SESSION_DURATION_MS
        });
        return;
    }
    
    miningActive = true;
    miningStartTime = miningStartTime || new Date();
    
    console.log('⛏️ Iniciando minería automática - Sesión de 24 horas');
    
    // Guardar estado
    saveMiningState();
    
    // Notificar al cliente
    notifyClient('MINING_STARTED', {
        startTime: miningStartTime,
        totalMined: totalMinedRSC,
        sessionDuration: SESSION_DURATION_MS
    });
    
    // Iniciar bucle de minería
    startMiningLoop();
}

function stopMining() {
    if (!miningActive) {
        console.log('⚠️ La minería no está activa');
        return;
    }
    
    miningActive = false;
    console.log('⏹️ Deteniendo minería automática');
    
    // Guardar estado
    saveMiningState();
    
    // Notificar al cliente
    notifyClient('MINING_STOPPED', {
        totalMined: totalMinedRSC,
        sessionDuration: miningStartTime ? Date.now() - miningStartTime.getTime() : 0
    });
}

function startMiningLoop() {
    if (!miningActive) return;
    
    // Verificar límites antes de cada operación
    if (totalMinedRSC >= MAX_DAILY_RSC) {
        console.log('🚫 Límite diario alcanzado, deteniendo minería');
        stopMining();
        return;
    }
    
    // Verificar si se completó la sesión de 24 horas
    if (miningStartTime && (Date.now() - miningStartTime.getTime()) >= SESSION_DURATION_MS) {
        console.log('⏰ Sesión de 24 horas completada, deteniendo minería automáticamente');
        stopMining();
        notifyClient('SESSION_COMPLETED', { 
            totalMined: totalMinedRSC,
            sessionDuration: SESSION_DURATION_MS
        });
        return;
    }
    
    // Simular operación de minería
    performMiningOperation();
    
    // Programar siguiente operación
    setTimeout(() => {
        if (miningActive) {
            startMiningLoop();
        }
    }, MINING_INTERVAL);
}

function performMiningOperation() {
    // Calcular RSC minado (simulación)
    const miningRate = 0.0001; // RSC por segundo
    const minedRSC = miningRate;
    
    totalMinedRSC += minedRSC;
    
    // Calcular tiempo restante de sesión
    const sessionTime = miningStartTime ? Date.now() - miningStartTime.getTime() : 0;
    const remainingSessionTime = Math.max(0, SESSION_DURATION_MS - sessionTime);
    
    // Notificar progreso al cliente
    notifyClient('MINING_PROGRESS', {
        minedRSC: minedRSC,
        totalMined: totalMinedRSC,
        remaining: MAX_DAILY_RSC - totalMinedRSC,
        sessionTime: sessionTime,
        remainingSessionTime: remainingSessionTime,
        sessionDuration: SESSION_DURATION_MS
    });
    
    // Guardar estado
    saveMiningState();
    
    console.log(`⛏️ Minado: ${minedRSC.toFixed(6)} RSC | Total: ${totalMinedRSC.toFixed(6)} RSC | Tiempo restante: ${Math.floor(remainingSessionTime / 60000)}m`);
}

function checkDailyReset() {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    if (!lastResetDate || lastResetDate < today) {
        console.log('🔄 Nuevo día detectado, reseteando límites');
        resetDailyLimit();
    }
}

function resetDailyLimit() {
    totalMinedRSC = 0;
    lastResetDate = new Date();
    
    console.log('🔄 Límite diario reseteado');
    
    // Guardar estado
    saveMiningState();
    
    // Notificar al cliente
    notifyClient('DAILY_LIMIT_RESET', {
        newDate: lastResetDate,
        totalMined: totalMinedRSC
    });
}

function updateMiningData(data) {
    if (data.totalMined !== undefined) {
        totalMinedRSC = data.totalMined;
    }
    if (data.lastResetDate) {
        lastResetDate = new Date(data.lastResetDate);
    }
    
    saveMiningState();
}

// ========================================
// UTILIDADES
// ========================================

function saveMiningState() {
    const state = {
        miningActive,
        miningStartTime: miningStartTime ? miningStartTime.toISOString() : null,
        totalMinedRSC,
        lastResetDate: lastResetDate ? lastResetDate.toISOString() : null
    };
    
    localStorage.setItem('rscMiningState', JSON.stringify(state));
}

function notifyClient(type, data) {
    self.clients.matchAll().then(clients => {
        clients.forEach(client => {
            client.postMessage({
                type,
                data,
                timestamp: Date.now()
            });
        });
    });
}

function sendMiningStatus(client) {
    const sessionTime = miningStartTime ? Date.now() - miningStartTime.getTime() : 0;
    const remainingSessionTime = Math.max(0, SESSION_DURATION_MS - sessionTime);
    
    client.postMessage({
        type: 'MINING_STATUS',
        data: {
            miningActive,
            miningStartTime: miningStartTime ? miningStartTime.toISOString() : null,
            totalMinedRSC,
            lastResetDate: lastResetDate ? lastResetDate.toISOString() : null,
            dailyLimit: MAX_DAILY_RSC,
            remainingLimit: MAX_DAILY_RSC - totalMinedRSC,
            sessionTime: sessionTime,
            remainingSessionTime: remainingSessionTime,
            sessionDuration: SESSION_DURATION_MS
        }
    });
}

// ========================================
// SINCRONIZACIÓN PERIÓDICA
// ========================================

// Verificar estado cada minuto
setInterval(() => {
    if (miningActive) {
        checkDailyReset();
        
        // Verificar si se completó la sesión de 24 horas
        if (miningStartTime && (Date.now() - miningStartTime.getTime()) >= SESSION_DURATION_MS) {
            console.log('⏰ Sesión de 24 horas completada, deteniendo minería automáticamente');
            stopMining();
            notifyClient('SESSION_COMPLETED', { 
                totalMined: totalMinedRSC,
                sessionDuration: SESSION_DURATION_MS
            });
        }
    }
}, 60000); // 1 minuto

console.log('🚀 Service Worker de Minería RSC inicializado');
