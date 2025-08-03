// ===== SISTEMA DE LIMPIEZA RSC CHAIN =====

class CleanupManager {
  constructor() {
    this.resources = new Map();
    this.intervals = new Set();
    this.timeouts = new Set();
    this.eventListeners = new Map();
    this.websockets = new Set();
    this.observers = new Set();
    
    this.setupCleanup();
  }

  // Configurar sistema de limpieza
  setupCleanup() {
    // Limpiar al cerrar la página
    window.addEventListener('beforeunload', () => {
      this.cleanupAll();
    });

    // Limpiar al cambiar de página (SPA)
    window.addEventListener('popstate', () => {
      this.cleanupPage();
    });

    // Limpiar cuando la página pierde el foco
    window.addEventListener('blur', () => {
      this.cleanupBackground();
    });

    // Limpiar cuando la página recupera el foco
    window.addEventListener('focus', () => {
      this.restoreBackground();
    });

    // Limpiar cuando el dispositivo entra en modo de ahorro de energía
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.cleanupBackground();
      } else {
        this.restoreBackground();
      }
    });
  }

  // ===== GESTIÓN DE RECURSOS =====

  // Registrar recurso
  registerResource(name, resource, type = 'general') {
    this.resources.set(name, { resource, type, timestamp: Date.now() });
  }

  // Obtener recurso
  getResource(name) {
    const resourceData = this.resources.get(name);
    return resourceData ? resourceData.resource : null;
  }

  // Liberar recurso
  releaseResource(name) {
    const resourceData = this.resources.get(name);
    if (resourceData) {
      this.cleanupResource(resourceData);
      this.resources.delete(name);
    }
  }

  // Limpiar recurso
  cleanupResource(resourceData) {
    const { resource, type } = resourceData;
    
    try {
      switch (type) {
        case 'websocket':
          if (resource && resource.readyState !== WebSocket.CLOSED) {
            resource.close();
          }
          break;
        case 'interval':
          clearInterval(resource);
          break;
        case 'timeout':
          clearTimeout(resource);
          break;
        case 'eventlistener':
          if (resource.element && resource.event && resource.handler) {
            resource.element.removeEventListener(resource.event, resource.handler);
          }
          break;
        case 'observer':
          if (resource && typeof resource.disconnect === 'function') {
            resource.disconnect();
          }
          break;
        case 'canvas':
          if (resource && resource.getContext) {
            const ctx = resource.getContext('2d');
            if (ctx) {
              ctx.clearRect(0, 0, resource.width, resource.height);
            }
          }
          break;
        case 'audio':
          if (resource && typeof resource.pause === 'function') {
            resource.pause();
            resource.currentTime = 0;
          }
          break;
        case 'video':
          if (resource && typeof resource.pause === 'function') {
            resource.pause();
            resource.currentTime = 0;
          }
          break;
        default:
          // Para recursos personalizados, intentar llamar a un método cleanup
          if (resource && typeof resource.cleanup === 'function') {
            resource.cleanup();
          }
      }
    } catch (error) {
      console.warn(`Error cleaning up resource ${type}:`, error);
    }
  }

  // ===== GESTIÓN DE INTERVALOS =====

  // Registrar intervalo
  registerInterval(name, callback, delay) {
    const interval = setInterval(callback, delay);
    this.intervals.add(interval);
    this.registerResource(name, interval, 'interval');
    return interval;
  }

  // Limpiar intervalo
  clearInterval(name) {
    const interval = this.getResource(name);
    if (interval) {
      clearInterval(interval);
      this.intervals.delete(interval);
      this.releaseResource(name);
    }
  }

  // Limpiar todos los intervalos
  clearAllIntervals() {
    this.intervals.forEach(interval => {
      clearInterval(interval);
    });
    this.intervals.clear();
  }

  // ===== GESTIÓN DE TIMEOUTS =====

  // Registrar timeout
  registerTimeout(name, callback, delay) {
    const timeout = setTimeout(callback, delay);
    this.timeouts.add(timeout);
    this.registerResource(name, timeout, 'timeout');
    return timeout;
  }

  // Limpiar timeout
  clearTimeout(name) {
    const timeout = this.getResource(name);
    if (timeout) {
      clearTimeout(timeout);
      this.timeouts.delete(timeout);
      this.releaseResource(name);
    }
  }

  // Limpiar todos los timeouts
  clearAllTimeouts() {
    this.timeouts.forEach(timeout => {
      clearTimeout(timeout);
    });
    this.timeouts.clear();
  }

  // ===== GESTIÓN DE EVENT LISTENERS =====

  // Registrar event listener
  registerEventListener(name, element, event, handler, options = {}) {
    element.addEventListener(event, handler, options);
    this.eventListeners.set(name, { element, event, handler, options });
    this.registerResource(name, { element, event, handler, options }, 'eventlistener');
  }

  // Remover event listener
  removeEventListener(name) {
    const listenerData = this.eventListeners.get(name);
    if (listenerData) {
      const { element, event, handler, options } = listenerData;
      element.removeEventListener(event, handler, options);
      this.eventListeners.delete(name);
      this.releaseResource(name);
    }
  }

  // Limpiar todos los event listeners
  clearAllEventListeners() {
    this.eventListeners.forEach((listenerData, name) => {
      this.removeEventListener(name);
    });
  }

  // ===== GESTIÓN DE WEBSOCKETS =====

  // Registrar WebSocket
  registerWebSocket(name, websocket) {
    this.websockets.add(websocket);
    this.registerResource(name, websocket, 'websocket');
  }

  // Cerrar WebSocket
  closeWebSocket(name) {
    const websocket = this.getResource(name);
    if (websocket && websocket.readyState !== WebSocket.CLOSED) {
      websocket.close();
      this.websockets.delete(websocket);
      this.releaseResource(name);
    }
  }

  // Cerrar todos los WebSockets
  closeAllWebSockets() {
    this.websockets.forEach(websocket => {
      if (websocket.readyState !== WebSocket.CLOSED) {
        websocket.close();
      }
    });
    this.websockets.clear();
  }

  // ===== GESTIÓN DE OBSERVERS =====

  // Registrar observer
  registerObserver(name, observer) {
    this.observers.add(observer);
    this.registerResource(name, observer, 'observer');
  }

  // Desconectar observer
  disconnectObserver(name) {
    const observer = this.getResource(name);
    if (observer && typeof observer.disconnect === 'function') {
      observer.disconnect();
      this.observers.delete(observer);
      this.releaseResource(name);
    }
  }

  // Desconectar todos los observers
  disconnectAllObservers() {
    this.observers.forEach(observer => {
      if (typeof observer.disconnect === 'function') {
        observer.disconnect();
      }
    });
    this.observers.clear();
  }

  // ===== LIMPIEZA POR CONTEXTO =====

  // Limpiar página actual
  cleanupPage() {
    console.log('🧹 Limpiando página actual...');
    
    // Limpiar modales
    this.closeAllModals();
    
    // Limpiar notificaciones
    this.clearNotifications();
    
    // Limpiar animaciones
    this.stopAnimations();
    
    // Limpiar polling específico de página
    this.clearPagePolling();
  }

  // Limpiar fondo (cuando la página no está activa)
  cleanupBackground() {
    console.log('🧹 Limpiando recursos de fondo...');
    
    // Pausar animaciones
    this.pauseAnimations();
    
    // Reducir frecuencia de polling
    this.reducePollingFrequency();
    
    // Pausar WebSockets no críticos
    this.pauseNonCriticalWebSockets();
  }

  // Restaurar fondo (cuando la página vuelve a estar activa)
  restoreBackground() {
    console.log('🔄 Restaurando recursos de fondo...');
    
    // Reanudar animaciones
    this.resumeAnimations();
    
    // Restaurar frecuencia de polling
    this.restorePollingFrequency();
    
    // Reanudar WebSockets
    this.resumeWebSockets();
  }

  // Limpiar todo
  cleanupAll() {
    console.log('🧹 Limpiando todos los recursos...');
    
    // Limpiar intervalos
    this.clearAllIntervals();
    
    // Limpiar timeouts
    this.clearAllTimeouts();
    
    // Limpiar event listeners
    this.clearAllEventListeners();
    
    // Cerrar WebSockets
    this.closeAllWebSockets();
    
    // Desconectar observers
    this.disconnectAllObservers();
    
    // Limpiar todos los recursos registrados
    this.resources.forEach((resourceData, name) => {
      this.cleanupResource(resourceData);
    });
    this.resources.clear();
    
    // Limpiar caché si es necesario
    this.clearCache();
    
    // Limpiar localStorage temporal
    this.clearTemporaryStorage();
  }

  // ===== LIMPIEZA ESPECÍFICA =====

  // Cerrar todos los modales
  closeAllModals() {
    const modals = document.querySelectorAll('.modal.active');
    modals.forEach(modal => {
      modal.classList.remove('active');
    });
  }

  // Limpiar notificaciones
  clearNotifications() {
    const notifications = document.querySelectorAll('.notification');
    notifications.forEach(notification => {
      notification.classList.add('removing');
      setTimeout(() => {
        notification.remove();
      }, 300);
    });
  }

  // Detener animaciones
  stopAnimations() {
    const animatedElements = document.querySelectorAll('[class*="animate"], [class*="pulse"], [class*="glow"]');
    animatedElements.forEach(element => {
      element.style.animationPlayState = 'paused';
    });
  }

  // Pausar animaciones
  pauseAnimations() {
    const animatedElements = document.querySelectorAll('[class*="animate"], [class*="pulse"], [class*="glow"]');
    animatedElements.forEach(element => {
      element.style.animationPlayState = 'paused';
    });
  }

  // Reanudar animaciones
  resumeAnimations() {
    const animatedElements = document.querySelectorAll('[class*="animate"], [class*="pulse"], [class*="glow"]');
    animatedElements.forEach(element => {
      element.style.animationPlayState = 'running';
    });
  }

  // Limpiar polling de página
  clearPagePolling() {
    const pagePollingNames = ['pageData', 'pageUpdates', 'pageNotifications'];
    pagePollingNames.forEach(name => {
      this.clearInterval(name);
    });
  }

  // Reducir frecuencia de polling
  reducePollingFrequency() {
    // Implementar lógica para reducir la frecuencia de polling
    // cuando la página no está activa
  }

  // Restaurar frecuencia de polling
  restorePollingFrequency() {
    // Implementar lógica para restaurar la frecuencia normal de polling
  }

  // Pausar WebSockets no críticos
  pauseNonCriticalWebSockets() {
    // Implementar lógica para pausar WebSockets no críticos
  }

  // Reanudar WebSockets
  resumeWebSockets() {
    // Implementar lógica para reanudar WebSockets
  }

  // Limpiar caché
  clearCache() {
    if ('caches' in window) {
      caches.keys().then(cacheNames => {
        cacheNames.forEach(cacheName => {
          if (cacheName.startsWith('rsc-')) {
            caches.delete(cacheName);
          }
        });
      });
    }
  }

  // Limpiar localStorage temporal
  clearTemporaryStorage() {
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('rsc_temp_')) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => {
        localStorage.removeItem(key);
    });
  }

  // ===== UTILIDADES =====

  // Obtener estadísticas de recursos
  getResourceStats() {
    return {
      resources: this.resources.size,
      intervals: this.intervals.size,
      timeouts: this.timeouts.size,
      eventListeners: this.eventListeners.size,
      websockets: this.websockets.size,
      observers: this.observers.size
    };
  }

  // Verificar fugas de memoria
  checkMemoryLeaks() {
    const stats = this.getResourceStats();
    const warnings = [];
    
    if (stats.intervals > 10) {
      warnings.push(`Demasiados intervalos activos: ${stats.intervals}`);
    }
    
    if (stats.timeouts > 20) {
      warnings.push(`Demasiados timeouts activos: ${stats.timeouts}`);
    }
    
    if (stats.eventListeners > 50) {
      warnings.push(`Demasiados event listeners: ${stats.eventListeners}`);
    }
    
    if (stats.websockets > 5) {
      warnings.push(`Demasiados WebSockets: ${stats.websockets}`);
    }
    
    if (warnings.length > 0) {
      console.warn('⚠️ Posibles fugas de memoria detectadas:', warnings);
      return warnings;
    }
    
    return [];
  }

  // Forzar garbage collection (solo en desarrollo)
  forceGarbageCollection() {
    if (configManager.isDevelopment()) {
      if (window.gc) {
        window.gc();
        console.log('🗑️ Garbage collection forzado');
      }
    }
  }
}

// ===== INSTANCIA GLOBAL =====

const cleanupManager = new CleanupManager();

// ===== EXPORTACIÓN =====

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { CleanupManager, cleanupManager };
} else {
  window.CleanupManager = CleanupManager;
  window.cleanupManager = cleanupManager;
}

// ===== LIMPIEZA AUTOMÁTICA =====

// Verificar fugas de memoria cada 5 minutos
setInterval(() => {
  cleanupManager.checkMemoryLeaks();
}, 300000);

// Forzar garbage collection cada 10 minutos en desarrollo
if (configManager && configManager.isDevelopment()) {
  setInterval(() => {
    cleanupManager.forceGarbageCollection();
  }, 600000);
} 