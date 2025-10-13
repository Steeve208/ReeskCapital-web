// ===== SISTEMA DE NOTIFICACIONES RSC CHAIN =====

class NotificationSystem {
  constructor() {
    this.notifications = [];
    this.maxNotifications = configManager.config.NOTIFICATIONS.MAX_NOTIFICATIONS;
    this.autoHide = configManager.config.NOTIFICATIONS.AUTO_HIDE;
    this.hideDelay = configManager.config.NOTIFICATIONS.HIDE_DELAY;
    this.soundEnabled = configManager.config.NOTIFICATIONS.SOUND_ENABLED;
    this.position = configManager.config.NOTIFICATIONS.POSITION;
    
    this.container = document.getElementById('notificationsContainer');
    this.audioContext = null;
    this.soundCache = new Map();
    
    this.init();
  }

  // Initialization
  init() {
    if (!this.container) {
      console.error('Container de notificaciones no encontrado');
      return;
    }

    // Configure position
    this.setPosition(this.position);
    
    // Initialize audio if enabled
    if (this.soundEnabled) {
      this.initAudio();
    }
    
    // Configurar event listeners
    this.setupEventListeners();
    
    console.log('🔔 Sistema de notificaciones inicializado');
  }

  // Configurar event listeners
  setupEventListeners() {
    // Escuchar eventos de notificación
    document.addEventListener('notification:show', (e) => {
      this.show(e.detail);
    });

    document.addEventListener('notification:hide', (e) => {
      this.hide(e.detail.id);
    });

    document.addEventListener('notification:clear', () => {
      this.clearAll();
    });

    // Escuchar cambios en la configuración
    document.addEventListener('config:changed', (e) => {
      this.updateConfig(e.detail);
    });
  }

  // Mostrar notificación
  show(options) {
    const notification = this.createNotification(options);
    
    // Agregar a la lista
    this.notifications.push(notification);
    
    // Crear elemento DOM
    const element = this.createNotificationElement(notification);
    
    // Agregar al contenedor
    this.container.appendChild(element);
    
    // Reproducir sonido si está habilitado
    if (this.soundEnabled && notification.sound) {
      this.playSound(notification.sound);
    }
    
    // Auto-ocultar si está habilitado
    if (this.autoHide && !notification.persistent) {
      this.scheduleHide(notification.id);
    }
    
    // Limitar número de notificaciones
    this.limitNotifications();
    
    // Emitir evento
    this.emit('notification:shown', notification);
    
    return notification.id;
  }

  // Crear notificación
  createNotification(options) {
    const defaultOptions = {
      id: Date.now() + Math.random(),
      type: 'info',
      title: '',
      message: '',
      duration: this.hideDelay,
      persistent: false,
      actions: [],
      sound: null,
      data: {},
      timestamp: new Date()
    };

    return { ...defaultOptions, ...options };
  }

  // Crear elemento DOM de notificación
  createNotificationElement(notification) {
    const element = document.createElement('div');
    element.className = `notification ${notification.type}`;
    element.setAttribute('data-notification-id', notification.id);
    
    // Configurar animación de entrada
    element.style.animation = 'slideInNotification 0.3s ease forwards';
    
    // Contenido de la notificación
    element.innerHTML = `
      <div class="notification-header">
        <div class="notification-title">
          <span class="notification-icon">${this.getIcon(notification.type)}</span>
          <span class="notification-title-text">${notification.title || this.getDefaultTitle(notification.type)}</span>
        </div>
        <button class="notification-close" aria-label="Cerrar notificación">×</button>
      </div>
      <div class="notification-message">${notification.message}</div>
      ${this.createActionsHTML(notification.actions)}
      ${!notification.persistent ? '<div class="notification-progress"><div class="notification-progress-bar"></div></div>' : ''}
    `;
    
    // Configurar event listeners del elemento
    this.setupElementEventListeners(element, notification);
    
    return element;
  }

  // Configurar event listeners del elemento
  setupElementEventListeners(element, notification) {
    // Botón de cerrar
    const closeBtn = element.querySelector('.notification-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        this.hide(notification.id);
      });
    }
    
    // Acciones
    const actionButtons = element.querySelectorAll('.notification-action');
    actionButtons.forEach((btn, index) => {
      btn.addEventListener('click', () => {
        const action = notification.actions[index];
        if (action && action.callback) {
          action.callback(notification);
        }
        this.hide(notification.id);
      });
    });
    
    // Hover para pausar auto-hide
    element.addEventListener('mouseenter', () => {
      this.pauseAutoHide(notification.id);
    });
    
    element.addEventListener('mouseleave', () => {
      this.resumeAutoHide(notification.id);
    });
  }

  // Crear HTML de acciones
  createActionsHTML(actions) {
    if (!actions || actions.length === 0) {
      return '';
    }
    
    const actionsHTML = actions.map(action => `
      <button class="notification-action ${action.primary ? 'primary' : ''}" data-action="${action.name}">
        ${action.icon ? `<span class="action-icon">${action.icon}</span>` : ''}
        ${action.label}
      </button>
    `).join('');
    
    return `<div class="notification-actions">${actionsHTML}</div>`;
  }

  // Ocultar notificación
  hide(id) {
    const notification = this.notifications.find(n => n.id === id);
    if (!notification) return;
    
    const element = this.container.querySelector(`[data-notification-id="${id}"]`);
    if (element) {
      // Animación de salida
      element.style.animation = 'slideOutNotification 0.3s ease forwards';
      
      setTimeout(() => {
        element.remove();
        this.removeNotification(id);
    }, 300);
  }

    // Emitir evento
    this.emit('notification:hidden', notification);
  }

  // Remover notificación de la lista
  removeNotification(id) {
    this.notifications = this.notifications.filter(n => n.id !== id);
  }

  // Programar ocultamiento automático
  scheduleHide(id) {
    const notification = this.notifications.find(n => n.id === id);
    if (!notification) return;
    
    const timeoutId = setTimeout(() => {
      this.hide(id);
    }, notification.duration);
    
    // Guardar timeout para poder cancelarlo
    notification.timeoutId = timeoutId;
  }

  // Pausar auto-hide
  pauseAutoHide(id) {
    const notification = this.notifications.find(n => n.id === id);
    if (notification && notification.timeoutId) {
      clearTimeout(notification.timeoutId);
    }
  }

  // Reanudar auto-hide
  resumeAutoHide(id) {
    const notification = this.notifications.find(n => n.id === id);
    if (notification) {
      this.scheduleHide(id);
    }
  }

  // Limitar número de notificaciones
  limitNotifications() {
    if (this.notifications.length > this.maxNotifications) {
      const oldestNotification = this.notifications[0];
      this.hide(oldestNotification.id);
    }
  }

  // Limpiar todas las notificaciones
  clearAll() {
    this.notifications.forEach(notification => {
      this.hide(notification.id);
    });
  }

  // ===== TIPOS DE NOTIFICACIÓN =====

  // Notificación de éxito
  success(message, options = {}) {
    return this.show({
      type: 'success',
      message,
      ...options
    });
  }

  // Notificación de error
  error(message, options = {}) {
    return this.show({
      type: 'error',
      message,
      ...options
    });
  }

  // Notificación de advertencia
  warning(message, options = {}) {
    return this.show({
      type: 'warning',
      message,
      ...options
    });
  }

  // Notificación de información
  info(message, options = {}) {
    return this.show({
      type: 'info',
      message,
      ...options
    });
  }

  // Notificación de carga
  loading(message, options = {}) {
    return this.show({
      type: 'loading',
      message,
      persistent: true,
      ...options
    });
  }

  // Notificación de progreso
  progress(message, progress, options = {}) {
    const notificationId = this.show({
      type: 'progress',
      message,
      persistent: true,
      ...options
    });
    
    // Actualizar progreso
    this.updateProgress(notificationId, progress);
    
    return notificationId;
  }

  // Actualizar progreso
  updateProgress(id, progress) {
    const element = this.container.querySelector(`[data-notification-id="${id}"]`);
    if (element) {
      const progressBar = element.querySelector('.notification-progress-bar');
      if (progressBar) {
        progressBar.style.width = `${progress}%`;
      }
    }
  }

  // ===== NOTIFICACIONES ESPECIALIZADAS =====

  // Notificación de transacción
  transaction(hash, status, options = {}) {
    const messages = {
      pending: 'Transacción enviada, esperando confirmación...',
      confirmed: 'Transacción confirmada exitosamente',
      failed: 'Transacción falló',
      cancelled: 'Transacción cancelada'
    };
    
    return this.show({
      type: status === 'confirmed' ? 'success' : status === 'failed' ? 'error' : 'info',
      title: `Transacción ${status}`,
      message: messages[status] || 'Transacción procesada',
      actions: [
        {
          name: 'view',
          label: 'Ver en Explorer',
          icon: '🔍',
          callback: () => {
            window.open(`/explorer/tx/${hash}`, '_blank');
          }
        }
      ],
      data: { hash, status },
      ...options
    });
  }

  // Notificación de minería
  mining(action, amount = null, options = {}) {
    const messages = {
      started: 'Minería iniciada',
      stopped: 'Minería detenida',
      reward: `Recompensa de minería: ${amount} RSC`,
      error: 'Error en la minería'
    };
    
    return this.show({
      type: action === 'reward' ? 'success' : action === 'error' ? 'error' : 'info',
      title: 'Minería RSC',
      message: messages[action] || 'Acción de minería completada',
      data: { action, amount },
      ...options
    });
  }

  // Notificación de staking
  staking(action, amount = null, options = {}) {
    const messages = {
      staked: `Stakeado ${amount} RSC`,
      unstaked: `Retirado ${amount} RSC`,
      reward: `Recompensa de staking: ${amount} RSC`,
      error: 'Error en staking'
    };
    
    return this.show({
      type: action === 'reward' ? 'success' : action === 'error' ? 'error' : 'info',
      title: 'Staking RSC',
      message: messages[action] || 'Acción de staking completada',
      data: { action, amount },
      ...options
    });
  }

  // Notificación de P2P
  p2p(action, details = {}, options = {}) {
    const messages = {
      trade_created: 'Anuncio P2P creado',
      trade_accepted: 'Transacción P2P aceptada',
      trade_completed: 'Transacción P2P completada',
      trade_cancelled: 'Transacción P2P cancelada',
      dispute_opened: 'Disputa abierta',
      dispute_resolved: 'Disputa resuelta'
    };
    
    return this.show({
      type: action.includes('completed') ? 'success' : 
            action.includes('cancelled') || action.includes('dispute') ? 'warning' : 'info',
      title: 'P2P Trading',
      message: messages[action] || 'Acción P2P completada',
      data: { action, details },
      ...options
    });
  }

  // ===== UTILIDADES =====

  // Obtener icono por tipo
  getIcon(type) {
    const icons = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️',
      loading: '⏳',
      progress: '📊'
    };
    return icons[type] || icons.info;
  }

  // Obtener título por defecto
  getDefaultTitle(type) {
    const titles = {
      success: 'Éxito',
      error: 'Error',
      warning: 'Advertencia',
      info: 'Información',
      loading: 'Cargando',
      progress: 'Progreso'
    };
    return titles[type] || titles.info;
  }

  // Configurar posición
  setPosition(position) {
    if (this.container) {
      this.container.className = `notifications-container notifications-${position}`;
    }
  }

  // Actualizar configuración
  updateConfig(config) {
    if (config.maxNotifications !== undefined) {
      this.maxNotifications = config.maxNotifications;
    }
    if (config.autoHide !== undefined) {
      this.autoHide = config.autoHide;
    }
    if (config.hideDelay !== undefined) {
      this.hideDelay = config.hideDelay;
    }
    if (config.soundEnabled !== undefined) {
      this.soundEnabled = config.soundEnabled;
    }
    if (config.position !== undefined) {
      this.setPosition(config.position);
    }
  }

  // ===== AUDIO =====

  // Inicializar audio
  initAudio() {
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (error) {
      console.warn('Audio context no disponible:', error);
    }
  }

  // Reproducir sonido
  playSound(soundType) {
    if (!this.soundEnabled || !this.audioContext) return;
    
    const sounds = {
      success: this.createSuccessSound(),
      error: this.createErrorSound(),
      warning: this.createWarningSound(),
      info: this.createInfoSound()
    };
    
    const sound = sounds[soundType];
    if (sound) {
      sound.play();
    }
  }

  // Crear sonidos
  createSuccessSound() {
    return this.createTone(800, 0.3, 0.1);
  }

  createErrorSound() {
    return this.createTone(400, 0.5, 0.3);
  }

  createWarningSound() {
    return this.createTone(600, 0.4, 0.2);
  }

  createInfoSound() {
    return this.createTone(1000, 0.2, 0.1);
  }

  // Crear tono
  createTone(frequency, duration, volume) {
    if (!this.audioContext) return null;
    
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume, this.audioContext.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);
    
    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration);
    
    return oscillator;
  }

  // ===== EVENTOS =====

  // Emitir evento
  emit(eventName, data = {}) {
    const event = new CustomEvent(eventName, { detail: data });
    document.dispatchEvent(event);
  }
}

// ===== INSTANCIA GLOBAL =====

let notificationSystem;

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  notificationSystem = new NotificationSystem();
});

// ===== FUNCIONES DE CONVENIENCIA =====

// Función global para mostrar notificaciones
window.showNotification = function(message, type = 'info', options = {}) {
  if (notificationSystem) {
    return notificationSystem.show({ message, type, ...options });
  }
  return null;
};

// Funciones específicas por tipo
window.showSuccess = function(message, options = {}) {
  return notificationSystem?.success(message, options);
};

window.showError = function(message, options = {}) {
  return notificationSystem?.error(message, options);
};

window.showWarning = function(message, options = {}) {
  return notificationSystem?.warning(message, options);
};

window.showInfo = function(message, options = {}) {
  return notificationSystem?.info(message, options);
};

window.showLoading = function(message, options = {}) {
  return notificationSystem?.loading(message, options);
};

// ===== EXPORTACIÓN =====

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { NotificationSystem, notificationSystem };
} else {
window.NotificationSystem = NotificationSystem; 
  window.notificationSystem = notificationSystem;
} 