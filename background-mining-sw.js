/* ================================
   BACKGROUND MINING SERVICE WORKER
================================ */

/**
 * 🚀 SERVICE WORKER PARA MINERÍA EN SEGUNDO PLANO
 * 
 * Permite que la minería continúe cuando:
 * - La pestaña está en segundo plano
 * - El navegador está minimizado
 * - El usuario está en otra aplicación
 * 
 * CARACTERÍSTICAS:
 * - Minería continua en background
 * - Notificaciones de progreso
 * - Sincronización automática
 * - Conservación de batería
 */

const CACHE_NAME = 'rsc-mining-v1';
const BACKGROUND_MINING_INTERVAL = 30000; // 30 segundos
const NOTIFICATION_INTERVAL = 300000; // 5 minutos

// Estado de minería en background
let backgroundMiningState = {
    isActive: false,
    sessionId: null,
    startTime: null,
    tokensMinedInBackground: 0,
    lastNotificationTime: 0,
    miningConfig: {
        baseRate: 0.1,
        hashRate: 100,
        efficiency: 100,
        algorithm: 'sha256'
    }
};

// Instalar Service Worker
self.addEventListener('install', (event) => {
    console.log('🔧 RSC Mining Service Worker instalado');
    self.skipWaiting();
});

// Activar Service Worker
self.addEventListener('activate', (event) => {
    console.log('✅ RSC Mining Service Worker activado');
    event.waitUntil(self.clients.claim());
});

// Manejar mensajes desde la página principal
self.addEventListener('message', (event) => {
    const { type, data } = event.data;
    
    switch (type) {
        case 'START_BACKGROUND_MINING':
            startBackgroundMining(data);
            break;
        case 'STOP_BACKGROUND_MINING':
            stopBackgroundMining();
            break;
        case 'UPDATE_MINING_CONFIG':
            updateMiningConfig(data);
            break;
        case 'GET_BACKGROUND_STATUS':
            sendBackgroundStatus(event.source);
            break;
    }
});

// Iniciar minería en segundo plano
function startBackgroundMining(config) {
    console.log('🚀 Iniciando minería en segundo plano...');
    
    backgroundMiningState = {
        isActive: true,
        sessionId: config.sessionId || generateSessionId(),
        startTime: Date.now(),
        tokensMinedInBackground: 0,
        lastNotificationTime: Date.now(),
        miningConfig: { ...backgroundMiningState.miningConfig, ...config }
    };
    
    // Iniciar timer de minería
    if (self.backgroundMiningTimer) {
        clearInterval(self.backgroundMiningTimer);
    }
    
    self.backgroundMiningTimer = setInterval(() => {
        performBackgroundMining();
    }, BACKGROUND_MINING_INTERVAL);
    
    // Notificar inicio
    showNotification('🚀 Minería en Segundo Plano', {
        body: 'Tu minería RSC continúa activa en segundo plano',
        icon: '/assets/img/rsc-logo-official.png',
        badge: '/assets/img/rsc-logo-official.png',
        tag: 'background-mining-start'
    });
}

// Detener minería en segundo plano
function stopBackgroundMining() {
    console.log('⏹️ Deteniendo minería en segundo plano...');
    
    if (self.backgroundMiningTimer) {
        clearInterval(self.backgroundMiningTimer);
        self.backgroundMiningTimer = null;
    }
    
    const totalTokens = backgroundMiningState.tokensMinedInBackground;
    const duration = Date.now() - backgroundMiningState.startTime;
    
    backgroundMiningState.isActive = false;
    
    // Notificar resultado si se minaron tokens
    if (totalTokens > 0) {
        showNotification('💰 Minería Completada', {
            body: `Has minado ${totalTokens.toFixed(4)} RSC en segundo plano`,
            icon: '/assets/img/rsc-logo-official.png',
            badge: '/assets/img/rsc-logo-official.png',
            tag: 'background-mining-complete',
            requireInteraction: true
        });
    }
    
    // Enviar datos a la página principal
    broadcastToClients({
        type: 'BACKGROUND_MINING_COMPLETE',
        data: {
            tokensMinedInBackground: totalTokens,
            duration: duration,
            sessionId: backgroundMiningState.sessionId
        }
    });
}

// Realizar minería en segundo plano
function performBackgroundMining() {
    if (!backgroundMiningState.isActive) return;
    
    const config = backgroundMiningState.miningConfig;
    const timeElapsed = BACKGROUND_MINING_INTERVAL / 1000; // segundos
    
    // Calcular tokens minados (reducido para conservar batería)
    const baseRate = config.baseRate * 0.7; // 70% de la tasa normal
    const efficiencyMultiplier = config.efficiency / 100;
    const tokensThisCycle = baseRate * timeElapsed * efficiencyMultiplier;
    
    backgroundMiningState.tokensMinedInBackground += tokensThisCycle;
    
    // Enviar actualización a la página principal
    broadcastToClients({
        type: 'BACKGROUND_MINING_UPDATE',
        data: {
            tokensMinedInBackground: backgroundMiningState.tokensMinedInBackground,
            tokensThisCycle: tokensThisCycle,
            duration: Date.now() - backgroundMiningState.startTime
        }
    });
    
    // Mostrar notificación periódica
    const now = Date.now();
    if (now - backgroundMiningState.lastNotificationTime >= NOTIFICATION_INTERVAL) {
        showProgressNotification();
        backgroundMiningState.lastNotificationTime = now;
    }
    
    // Sincronizar con servidor cada 5 minutos
    if (backgroundMiningState.tokensMinedInBackground > 0 && 
        backgroundMiningState.tokensMinedInBackground % 1 < tokensThisCycle) {
        syncWithServer();
    }
}

// Mostrar notificación de progreso
function showProgressNotification() {
    const tokens = backgroundMiningState.tokensMinedInBackground;
    const duration = (Date.now() - backgroundMiningState.startTime) / 1000 / 60; // minutos
    
    showNotification('⛏️ Minería en Progreso', {
        body: `${tokens.toFixed(4)} RSC minados en ${Math.round(duration)} min`,
        icon: '/assets/img/rsc-logo-official.png',
        badge: '/assets/img/rsc-logo-official.png',
        tag: 'background-mining-progress',
        silent: true
    });
}

// Actualizar configuración de minería
function updateMiningConfig(newConfig) {
    backgroundMiningState.miningConfig = { 
        ...backgroundMiningState.miningConfig, 
        ...newConfig 
    };
    
    console.log('⚙️ Configuración de minería actualizada:', backgroundMiningState.miningConfig);
}

// Enviar estado actual
function sendBackgroundStatus(client) {
    client.postMessage({
        type: 'BACKGROUND_STATUS',
        data: {
            isActive: backgroundMiningState.isActive,
            tokensMinedInBackground: backgroundMiningState.tokensMinedInBackground,
            duration: backgroundMiningState.isActive ? 
                Date.now() - backgroundMiningState.startTime : 0,
            sessionId: backgroundMiningState.sessionId
        }
    });
}

// Sincronizar con servidor
async function syncWithServer() {
    try {
        // Simular sincronización con servidor
        console.log('🔄 Sincronizando minería en segundo plano con servidor...');
        
        // En una implementación real, aquí se enviarían los datos al servidor
        broadcastToClients({
            type: 'BACKGROUND_SYNC_COMPLETE',
            data: {
                tokensMinedInBackground: backgroundMiningState.tokensMinedInBackground,
                syncTime: Date.now()
            }
        });
        
    } catch (error) {
        console.error('❌ Error sincronizando:', error);
    }
}

// Mostrar notificación
function showNotification(title, options) {
    if ('Notification' in self && self.Notification.permission === 'granted') {
        self.registration.showNotification(title, {
            ...options,
            actions: [
                {
                    action: 'open',
                    title: 'Abrir RSC Mining'
                },
                {
                    action: 'stop',
                    title: 'Detener Minería'
                }
            ]
        });
    }
}

// Manejar clics en notificaciones
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    
    if (event.action === 'open') {
        // Abrir la aplicación
        event.waitUntil(
            self.clients.matchAll({ type: 'window' }).then((clients) => {
                if (clients.length > 0) {
                    return clients[0].focus();
                }
                return self.clients.openWindow('/pages/mine.html');
            })
        );
    } else if (event.action === 'stop') {
        // Detener minería
        stopBackgroundMining();
    }
});

// Enviar mensaje a todos los clientes
function broadcastToClients(message) {
    self.clients.matchAll({ includeUncontrolled: true }).then((clients) => {
        clients.forEach((client) => {
            client.postMessage(message);
        });
    });
}

// Generar ID de sesión
function generateSessionId() {
    return 'bg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Nota: No existe 'visibilitychange' en el contexto de Service Worker.
// La visibilidad debe manejarse desde la página y comunicarse vía postMessage.

console.log('🚀 RSC Background Mining Service Worker cargado');
