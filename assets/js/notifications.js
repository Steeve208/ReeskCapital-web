/* ================================
   NOTIFICATIONS.JS — SISTEMA DE NOTIFICACIONES
================================ */

class NotificationSystem {
  constructor() {
    this.container = document.getElementById('notificationsContainer');
    this.notifications = [];
    this.init();
  }

  init() {
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.className = 'notifications-container';
      this.container.id = 'notificationsContainer';
      document.body.appendChild(this.container);
    }
  }

  show(message, type = 'info', title = '', duration = 5000) {
    const notification = this.createNotification(message, type, title);
    this.container.appendChild(notification);
    
    // Animar entrada
    setTimeout(() => {
      notification.classList.add('show');
    }, 100);

    // Auto-remover después del tiempo especificado
    if (duration > 0) {
      setTimeout(() => {
        this.hide(notification);
      }, duration);
    }

    this.notifications.push(notification);
    return notification;
  }

  createNotification(message, type, title) {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    let content = '';
    if (title) {
      content += `<div class="notification-title">${title}</div>`;
    }
    content += `<div class="notification-message">${message}</div>`;
    
    notification.innerHTML = content;
    
    // Añadir botón de cerrar
    const closeBtn = document.createElement('button');
    closeBtn.className = 'notification-close';
    closeBtn.innerHTML = '&times;';
    closeBtn.onclick = () => this.hide(notification);
    notification.appendChild(closeBtn);
    
    return notification;
  }

  hide(notification) {
    notification.classList.remove('show');
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
      const index = this.notifications.indexOf(notification);
      if (index > -1) {
        this.notifications.splice(index, 1);
      }
    }, 300);
  }

  hideAll() {
    this.notifications.forEach(notification => {
      this.hide(notification);
    });
  }

  // Métodos de conveniencia
  success(message, title = 'Éxito') {
    return this.show(message, 'success', title, 4000);
  }

  error(message, title = 'Error') {
    return this.show(message, 'error', title, 6000);
  }

  warning(message, title = 'Advertencia') {
    return this.show(message, 'warning', title, 5000);
  }

  info(message, title = 'Información') {
    return this.show(message, 'info', title, 4000);
  }
}

// Inicializar sistema de notificaciones
let notificationSystem;

document.addEventListener('DOMContentLoaded', () => {
  notificationSystem = new NotificationSystem();
  
  // Exponer globalmente
  window.RSC = window.RSC || {};
  window.RSC.notifications = notificationSystem;
  
  // Métodos de conveniencia globales
  window.showNotification = (message, type, title) => {
    return notificationSystem.show(message, type, title);
  };
  
  window.showSuccess = (message, title) => {
    return notificationSystem.success(message, title);
  };
  
  window.showError = (message, title) => {
    return notificationSystem.error(message, title);
  };
  
  window.showWarning = (message, title) => {
    return notificationSystem.warning(message, title);
  };
  
  window.showInfo = (message, title) => {
    return notificationSystem.info(message, title);
  };
});

// Exportar para uso en otros módulos
window.NotificationSystem = NotificationSystem; 