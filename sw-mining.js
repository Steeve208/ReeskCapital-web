/* ===== SERVICE WORKER PARA MINERÍA RSC - VERSIÓN SIMPLIFICADA ===== */

const CACHE_NAME = 'rsc-mining-v1';
const DB_NAME = 'RSCMiningDB';
const DB_VERSION = 1;
const STORE_NAME = 'mining_sessions';

let db = null;
let activeMiningSessions = new Map();

// Inicializar base de datos IndexedDB
function initDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
            db = request.result;
            resolve(db);
        };
        
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            
            // Crear store para sesiones de minería
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
                store.createIndex('userId', 'userId', { unique: false });
                store.createIndex('isActive', 'isActive', { unique: false });
                store.createIndex('endTime', 'endTime', { unique: false });
            }
        };
    });
}

// Calcular tokens basado en tiempo transcurrido
function calculateTokens(session) {
    const now = new Date();
    const startTime = new Date(session.startTime);
    const elapsed = (now - startTime) / 1000; // segundos
    
    // Calcular tokens basado en tiempo transcurrido y hash power
    const baseRate = 0.0001; // tokens por segundo base
    const hashMultiplier = session.hashPower / 5; // multiplicador por intensidad
    const timeMultiplier = Math.min(elapsed / 3600, 24); // máximo 24 horas
    
    // Fórmula de tokens: baseRate * hashMultiplier * timeMultiplier * elapsed
    const tokens = baseRate * hashMultiplier * timeMultiplier * elapsed;
    
    // Añadir pequeñas variaciones para simular minería real
    const variation = 0.8 + (Math.random() * 0.4); // ±20% variación
    
    return Math.max(0, tokens * variation);
}

// Iniciar minería
async function startMining(session, hashPower) {
    try {
        console.log('🚀 Service Worker: Iniciando minería para sesión:', session.id);
        
        // Crear sesión de minería
        const miningSession = {
            ...session,
            hashPower: hashPower,
            createdAt: new Date().toISOString(),
            lastUpdate: new Date().toISOString(),
            totalTokens: 0
        };
        
        // Guardar en memoria activa
        activeMiningSessions.set(session.id, miningSession);
        
        // Iniciar proceso de minería
        startMiningProcess(miningSession);
        
        console.log('✅ Service Worker: Minería iniciada exitosamente');
        
        // Notificar al cliente
        notifyClient('MINING_STARTED', { sessionId: session.id });
        
    } catch (error) {
        console.error('❌ Service Worker: Error iniciando minería:', error);
        notifyClient('ERROR', { error: error.message });
    }
}

// Detener minería
async function stopMining(sessionId) {
    try {
        console.log('⏹️ Service Worker: Deteniendo minería para sesión:', sessionId);
        
        // Remover de sesiones activas
        activeMiningSessions.delete(sessionId);
        
        console.log('✅ Service Worker: Minería detenida exitosamente');
        
        // Notificar al cliente
        notifyClient('MINING_STOPPED');
        
    } catch (error) {
        console.error('❌ Service Worker: Error deteniendo minería:', error);
        notifyClient('ERROR', { error: error.message });
    }
}

// Proceso de minería en segundo plano
function startMiningProcess(session) {
    console.log('⚡ Service Worker: Iniciando proceso de minería para sesión:', session.id);
    
    // Simular minería continua
    const miningInterval = setInterval(async () => {
        try {
            // Verificar si la sesión sigue activa
            if (!activeMiningSessions.has(session.id)) {
                console.log('⏹️ Service Worker: Sesión detenida, limpiando intervalo');
                clearInterval(miningInterval);
                return;
            }
            
            // Calcular tokens minados
            const tokens = calculateTokens(session);
            
            // Actualizar sesión
            session.totalTokens = tokens;
            session.lastUpdate = new Date().toISOString();
            
            console.log('📊 Service Worker: Tokens calculados:', tokens);
            
            // Enviar actualización al cliente
            notifyClient('PROGRESS_UPDATE', {
                sessionId: session.id,
                totalTokens: tokens,
                timestamp: Date.now()
            });
            
        } catch (error) {
            console.error('❌ Service Worker: Error en proceso de minería:', error);
        }
    }, 5000); // Actualizar cada 5 segundos
}

// Notificar al cliente
function notifyClient(type, data = {}) {
    try {
        self.clients.matchAll().then(clients => {
            clients.forEach(client => {
                client.postMessage({
                    type: type,
                    data: data
                });
            });
        });
    } catch (error) {
        console.error('❌ Service Worker: Error notificando al cliente:', error);
    }
}

// Inicializar Service Worker
self.addEventListener('install', (event) => {
    console.log('🔧 Service Worker: Instalando...');
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    console.log('🚀 Service Worker: Activando...');
    event.waitUntil(self.clients.claim());
    
    // Inicializar base de datos
    initDB().then(() => {
        console.log('✅ Service Worker: Base de datos inicializada');
    }).catch(error => {
        console.error('❌ Service Worker: Error inicializando base de datos:', error);
    });
});

// Manejar mensajes del cliente
self.addEventListener('message', async (event) => {
    const { type, data } = event.data;
    
    try {
        console.log('📨 Service Worker: Mensaje recibido:', type, data);
        
        switch (type) {
            case 'START_MINING':
                await startMining(data.session, data.hashPower);
                break;
                
            case 'STOP_MINING':
                await stopMining(data.sessionId);
                break;
                
            case 'GET_ACTIVE_SESSION':
                const session = activeMiningSessions.get(data.userId);
                notifyClient('ACTIVE_SESSION_RESPONSE', { session });
                break;
                
            case 'PING':
                notifyClient('PONG', { timestamp: Date.now() });
                break;
                
            default:
                console.log('📨 Service Worker: Mensaje no reconocido:', type);
        }
    } catch (error) {
        console.error('❌ Service Worker: Error procesando mensaje:', error);
        notifyClient('ERROR', { error: error.message });
    }
});

console.log('✅ Service Worker: Sistema de minería RSC inicializado');
