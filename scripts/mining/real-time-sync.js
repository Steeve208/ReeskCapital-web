/**
 * 🔄 RSC REAL-TIME SYNC SYSTEM
 * 
 * Sistema de sincronización en tiempo real entre frontend y backend
 * - WebSocket para comunicación bidireccional
 * - Sincronización automática de datos
 * - Reconexión automática
 * - Compresión de datos
 * - Validación de integridad
 */

class RealTimeSyncSystem {
    constructor() {
        this.version = '2.0.0';
        this.isConnected = false;
        this.isReconnecting = false;
        this.connectionAttempts = 0;
        this.maxReconnectAttempts = 10;
        this.reconnectDelay = 1000;
        this.maxReconnectDelay = 30000;
        
        // Configuración de conexión
        this.config = {
            wsUrl: 'wss://your-backend.com/ws',
            httpUrl: 'https://your-backend.com/api',
            heartbeatInterval: 30000,
            syncInterval: 5000,
            compressionThreshold: 1024,
            maxMessageSize: 1024 * 1024, // 1MB
            encryptionKey: null
        };
        
        // Estado de sincronización
        this.syncState = {
            lastSyncTime: null,
            pendingChanges: new Map(),
            conflictResolution: 'server', // 'server', 'client', 'merge'
            autoSync: true,
            offlineMode: false,
            queuedMessages: []
        };
        
        // WebSocket
        this.ws = null;
        this.heartbeatTimer = null;
        this.syncTimer = null;
        
        // Event listeners
        this.eventListeners = new Map();
        
        // Sistema de cola para mensajes offline
        this.messageQueue = [];
        this.maxQueueSize = 1000;
        
        // Sistema de validación
        this.validators = new Map();
        
        // Inicializar
        this.init();
    }
    
    /**
     * Inicializar sistema de sincronización
     */
    async init() {
        try {
            console.log('🔄 Inicializando Real-Time Sync System v' + this.version);
            
            // Configurar validadores
            this.setupValidators();
            
            // Configurar event listeners
            this.setupEventListeners();
            
            // Intentar conectar
            await this.connect();
            
            console.log('✅ Real-Time Sync System inicializado');
            
        } catch (error) {
            console.error('❌ Error inicializando Real-Time Sync System:', error);
            this.emit('syncError', { error: error.message });
        }
    }
    
    /**
     * Conectar al servidor
     */
    async connect() {
        try {
            if (this.isConnected) {
                console.log('⚠️ Ya conectado al servidor');
                return;
            }
            
            console.log('🔌 Conectando al servidor...');
            
            // Crear WebSocket
            this.ws = new WebSocket(this.config.wsUrl);
            
            // Configurar event listeners del WebSocket
            this.ws.onopen = () => this.handleConnectionOpen();
            this.ws.onmessage = (event) => this.handleMessage(event);
            this.ws.onclose = (event) => this.handleConnectionClose(event);
            this.ws.onerror = (error) => this.handleConnectionError(error);
            
        } catch (error) {
            console.error('❌ Error conectando:', error);
            this.scheduleReconnect();
        }
    }
    
    /**
     * Manejar conexión abierta
     */
    handleConnectionOpen() {
        console.log('✅ Conectado al servidor');
        this.isConnected = true;
        this.isReconnecting = false;
        this.connectionAttempts = 0;
        
        // Iniciar heartbeat
        this.startHeartbeat();
        
        // Iniciar sincronización
        this.startSync();
        
        // Procesar cola de mensajes
        this.processMessageQueue();
        
        this.emit('connected', {
            timestamp: Date.now(),
            url: this.config.wsUrl
        });
    }
    
    /**
     * Manejar mensaje recibido
     */
    handleMessage(event) {
        try {
            const message = JSON.parse(event.data);
            
            // Validar mensaje
            if (!this.validateMessage(message)) {
                console.warn('⚠️ Mensaje inválido recibido:', message);
                return;
            }
            
            // Procesar mensaje
            this.processMessage(message);
            
        } catch (error) {
            console.error('❌ Error procesando mensaje:', error);
        }
    }
    
    /**
     * Procesar mensaje
     */
    processMessage(message) {
        const { type, data, timestamp, id } = message;
        
        switch (type) {
            case 'heartbeat':
                this.handleHeartbeat(data);
                break;
            case 'sync_data':
                this.handleSyncData(data);
                break;
            case 'mining_update':
                this.handleMiningUpdate(data);
                break;
            case 'user_update':
                this.handleUserUpdate(data);
                break;
            case 'notification':
                this.handleNotification(data);
                break;
            case 'error':
                this.handleError(data);
                break;
            default:
                console.warn('⚠️ Tipo de mensaje desconocido:', type);
        }
    }
    
    /**
     * Manejar heartbeat
     */
    handleHeartbeat(data) {
        this.syncState.lastSyncTime = Date.now();
        this.emit('heartbeat', data);
    }
    
    /**
     * Manejar datos de sincronización
     */
    handleSyncData(data) {
        const { user_id, mining_data, balance, notifications } = data;
        
        // Actualizar datos locales
        this.updateLocalData({
            userId: user_id,
            miningData: mining_data,
            balance: balance,
            notifications: notifications
        });
        
        this.emit('dataSynced', data);
    }
    
    /**
     * Manejar actualización de minería
     */
    handleMiningUpdate(data) {
        const { session_id, tokens_mined, hash_rate, efficiency } = data;
        
        this.emit('miningUpdate', {
            sessionId: session_id,
            tokensMined: tokens_mined,
            hashRate: hash_rate,
            efficiency: efficiency,
            timestamp: Date.now()
        });
    }
    
    /**
     * Manejar actualización de usuario
     */
    handleUserUpdate(data) {
        const { user_id, balance, mining_power, level } = data;
        
        this.emit('userUpdate', {
            userId: user_id,
            balance: balance,
            miningPower: mining_power,
            level: level,
            timestamp: Date.now()
        });
    }
    
    /**
     * Manejar notificación
     */
    handleNotification(data) {
        const { type, message, priority, actions } = data;
        
        this.emit('notification', {
            type,
            message,
            priority,
            actions,
            timestamp: Date.now()
        });
    }
    
    /**
     * Manejar error
     */
    handleError(data) {
        const { code, message, details } = data;
        
        console.error('❌ Error del servidor:', message);
        this.emit('serverError', { code, message, details });
    }
    
    /**
     * Manejar conexión cerrada
     */
    handleConnectionClose(event) {
        console.log('🔌 Conexión cerrada:', event.code, event.reason);
        this.isConnected = false;
        
        // Limpiar timers
        this.stopHeartbeat();
        this.stopSync();
        
        // Intentar reconectar si no fue intencional
        if (event.code !== 1000 && !this.isReconnecting) {
            this.scheduleReconnect();
        }
        
        this.emit('disconnected', {
            code: event.code,
            reason: event.reason,
            timestamp: Date.now()
        });
    }
    
    /**
     * Manejar error de conexión
     */
    handleConnectionError(error) {
        console.error('❌ Error de conexión:', error);
        this.emit('connectionError', { error: error.message });
    }
    
    /**
     * Programar reconexión
     */
    scheduleReconnect() {
        if (this.isReconnecting || this.connectionAttempts >= this.maxReconnectAttempts) {
            console.log('❌ Máximo de intentos de reconexión alcanzado');
            this.emit('maxReconnectAttemptsReached');
            return;
        }
        
        this.isReconnecting = true;
        this.connectionAttempts++;
        
        const delay = Math.min(
            this.reconnectDelay * Math.pow(2, this.connectionAttempts - 1),
            this.maxReconnectDelay
        );
        
        console.log(`🔄 Reconectando en ${delay}ms (intento ${this.connectionAttempts}/${this.maxReconnectAttempts})`);
        
        setTimeout(() => {
            this.isReconnecting = false;
            this.connect();
        }, delay);
    }
    
    /**
     * Iniciar heartbeat
     */
    startHeartbeat() {
        this.heartbeatTimer = setInterval(() => {
            this.sendHeartbeat();
        }, this.config.heartbeatInterval);
    }
    
    /**
     * Detener heartbeat
     */
    stopHeartbeat() {
        if (this.heartbeatTimer) {
            clearInterval(this.heartbeatTimer);
            this.heartbeatTimer = null;
        }
    }
    
    /**
     * Enviar heartbeat
     */
    sendHeartbeat() {
        this.sendMessage({
            type: 'heartbeat',
            data: {
                timestamp: Date.now(),
                client_id: this.getClientId()
            }
        });
    }
    
    /**
     * Iniciar sincronización
     */
    startSync() {
        this.syncTimer = setInterval(() => {
            this.syncData();
        }, this.config.syncInterval);
    }
    
    /**
     * Detener sincronización
     */
    stopSync() {
        if (this.syncTimer) {
            clearInterval(this.syncTimer);
            this.syncTimer = null;
        }
    }
    
    /**
     * Sincronizar datos
     */
    async syncData() {
        try {
            if (!this.isConnected) {
                this.queueMessage({
                    type: 'sync_data',
                    data: this.getPendingChanges()
                });
                return;
            }
            
            const pendingChanges = this.getPendingChanges();
            if (pendingChanges.size === 0) {
                return;
            }
            
            this.sendMessage({
                type: 'sync_data',
                data: {
                    changes: Array.from(pendingChanges.entries()),
                    timestamp: Date.now(),
                    client_id: this.getClientId()
                }
            });
            
            // Limpiar cambios pendientes
            this.syncState.pendingChanges.clear();
            
        } catch (error) {
            console.error('❌ Error sincronizando datos:', error);
        }
    }
    
    /**
     * Enviar mensaje
     */
    sendMessage(message) {
        try {
            if (!this.isConnected) {
                this.queueMessage(message);
                return;
            }
            
            // Validar mensaje
            if (!this.validateMessage(message)) {
                console.warn('⚠️ Mensaje inválido:', message);
                return;
            }
            
            // Comprimir si es necesario
            const data = this.compressMessage(message);
            
            // Enviar
            this.ws.send(JSON.stringify(data));
            
        } catch (error) {
            console.error('❌ Error enviando mensaje:', error);
        }
    }
    
    /**
     * Cola de mensajes
     */
    queueMessage(message) {
        if (this.messageQueue.length >= this.maxQueueSize) {
            this.messageQueue.shift(); // Remover mensaje más antiguo
        }
        
        this.messageQueue.push({
            ...message,
            queuedAt: Date.now()
        });
        
        console.log(`📦 Mensaje encolado (${this.messageQueue.length}/${this.maxQueueSize})`);
    }
    
    /**
     * Procesar cola de mensajes
     */
    processMessageQueue() {
        if (this.messageQueue.length === 0) return;
        
        console.log(`📤 Procesando ${this.messageQueue.length} mensajes encolados`);
        
        const messages = [...this.messageQueue];
        this.messageQueue = [];
        
        messages.forEach(message => {
            this.sendMessage(message);
        });
    }
    
    /**
     * Validar mensaje
     */
    validateMessage(message) {
        if (!message || typeof message !== 'object') {
            return false;
        }
        
        if (!message.type || typeof message.type !== 'string') {
            return false;
        }
        
        if (message.data === undefined) {
            return false;
        }
        
        // Validar tamaño
        const messageSize = JSON.stringify(message).length;
        if (messageSize > this.config.maxMessageSize) {
            console.warn('⚠️ Mensaje demasiado grande:', messageSize);
            return false;
        }
        
        return true;
    }
    
    /**
     * Comprimir mensaje
     */
    compressMessage(message) {
        const messageStr = JSON.stringify(message);
        
        if (messageStr.length < this.config.compressionThreshold) {
            return message;
        }
        
        // Aquí se implementaría compresión real
        // Por ahora, solo marcamos como comprimido
        return {
            ...message,
            compressed: true,
            originalSize: messageStr.length
        };
    }
    
    /**
     * Obtener cambios pendientes
     */
    getPendingChanges() {
        return this.syncState.pendingChanges;
    }
    
    /**
     * Agregar cambio pendiente
     */
    addPendingChange(key, value) {
        this.syncState.pendingChanges.set(key, {
            value,
            timestamp: Date.now()
        });
    }
    
    /**
     * Actualizar datos locales
     */
    updateLocalData(data) {
        // Actualizar datos en el store local
        if (window.RSCStore) {
            window.RSCStore.updateData(data);
        }
        
        this.emit('localDataUpdated', data);
    }
    
    /**
     * Obtener ID del cliente
     */
    getClientId() {
        let clientId = localStorage.getItem('rsc_client_id');
        if (!clientId) {
            clientId = 'client_' + Date.now() + '_' + Math.random().toString(36).substring(2);
            localStorage.setItem('rsc_client_id', clientId);
        }
        return clientId;
    }
    
    /**
     * Configurar validadores
     */
    setupValidators() {
        this.validators.set('mining_data', (data) => {
            return data && 
                   typeof data.tokens_mined === 'number' &&
                   typeof data.hash_rate === 'number' &&
                   typeof data.efficiency === 'number';
        });
        
        this.validators.set('user_data', (data) => {
            return data && 
                   typeof data.balance === 'number' &&
                   typeof data.mining_power === 'number';
        });
    }
    
    /**
     * Configurar event listeners
     */
    setupEventListeners() {
        // Online/Offline
        window.addEventListener('online', () => {
            this.syncState.offlineMode = false;
            this.emit('online');
            if (this.isConnected) {
                this.processMessageQueue();
            } else {
                this.connect();
            }
        });
        
        window.addEventListener('offline', () => {
            this.syncState.offlineMode = true;
            this.emit('offline');
        });
        
        // Before unload
        window.addEventListener('beforeunload', () => {
            this.disconnect();
        });
    }
    
    /**
     * Desconectar
     */
    disconnect() {
        if (this.ws) {
            this.ws.close(1000, 'Client disconnecting');
            this.ws = null;
        }
        
        this.stopHeartbeat();
        this.stopSync();
        
        this.isConnected = false;
        this.isReconnecting = false;
        
        console.log('🔌 Desconectado del servidor');
    }
    
    /**
     * Emitir evento
     */
    emit(event, data) {
        const listeners = this.eventListeners.get(event) || [];
        listeners.forEach(listener => {
            try {
                listener(data);
            } catch (error) {
                console.error(`❌ Error en listener de ${event}:`, error);
            }
        });
    }
    
    /**
     * Agregar event listener
     */
    on(event, listener) {
        if (!this.eventListeners.has(event)) {
            this.eventListeners.set(event, []);
        }
        this.eventListeners.get(event).push(listener);
    }
    
    /**
     * Remover event listener
     */
    off(event, listener) {
        const listeners = this.eventListeners.get(event) || [];
        const index = listeners.indexOf(listener);
        if (index > -1) {
            listeners.splice(index, 1);
        }
    }
    
    /**
     * Obtener estado de conexión
     */
    getConnectionState() {
        return {
            isConnected: this.isConnected,
            isReconnecting: this.isReconnecting,
            connectionAttempts: this.connectionAttempts,
            lastSyncTime: this.syncState.lastSyncTime,
            offlineMode: this.syncState.offlineMode,
            queuedMessages: this.messageQueue.length
        };
    }
    
    /**
     * Limpiar recursos
     */
    cleanup() {
        this.disconnect();
        this.eventListeners.clear();
        this.messageQueue = [];
        this.syncState.pendingChanges.clear();
        
        console.log('🧹 Real-Time Sync System limpiado');
    }
}

// Exportar para uso global
window.RealTimeSyncSystem = RealTimeSyncSystem;

// Crear instancia global
window.RSCRealTimeSync = new RealTimeSyncSystem();

console.log('🔄 RSC Real-Time Sync System v2.0.0 - INICIADO');
