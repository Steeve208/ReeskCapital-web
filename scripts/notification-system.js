/**
 * SISTEMA DE NOTIFICACIONES
 * Sistema visual para mostrar notificaciones al usuario
 */

class NotificationSystem {
    constructor() {
        this.notifications = [];
        this.container = null;
        this.maxNotifications = 5;
        this.initialize();
    }

    initialize() {
        // Crear contenedor si no existe
        if (!this.container) {
            this.createContainer();
        }

        // Crear estilos
        this.createStyles();
    }

    createContainer() {
        this.container = document.createElement('div');
        this.container.id = 'notificationContainer';
        this.container.className = 'notification-container';
        document.body.appendChild(this.container);
    }

    createStyles() {
        const style = document.createElement('style');
        style.textContent = `
.notification-container {
    position: fixed;
    top: 80px;
    right: 20px;
    z-index: 10000;
    display: flex;
    flex-direction: column;
    gap: 10px;
    pointer-events: none;
}

.notification {
    background: rgba(15, 20, 40, 0.95);
    backdrop-filter: blur(20px);
    border-radius: 12px;
    padding: 16px 20px;
    min-width: 300px;
    max-width: 400px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
    border: 2px solid;
    display: flex;
    align-items: center;
    gap: 12px;
    transform: translateX(500px);
    opacity: 0;
    transition: all 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    pointer-events: auto;
    cursor: pointer;
}

.notification.show {
    transform: translateX(0);
    opacity: 1;
}

.notification.hide {
    transform: translateX(500px);
    opacity: 0;
}

.notification.success {
    border-color: #00ff00;
    background: linear-gradient(135deg, rgba(0, 255, 0, 0.1), rgba(15, 20, 40, 0.95));
}

.notification.error {
    border-color: #ff4444;
    background: linear-gradient(135deg, rgba(255, 68, 68, 0.1), rgba(15, 20, 40, 0.95));
}

.notification.warning {
    border-color: #ffbb33;
    background: linear-gradient(135deg, rgba(255, 187, 51, 0.1), rgba(15, 20, 40, 0.95));
}

.notification.info {
    border-color: #33b5e5;
    background: linear-gradient(135deg, rgba(51, 181, 229, 0.1), rgba(15, 20, 40, 0.95));
}

.notification-icon {
    font-size: 1.5rem;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border-radius: 50%;
}

.notification.success .notification-icon {
    color: #00ff00;
    background: rgba(0, 255, 0, 0.1);
}

.notification.error .notification-icon {
    color: #ff4444;
    background: rgba(255, 68, 68, 0.1);
}

.notification.warning .notification-icon {
    color: #ffbb33;
    background: rgba(255, 187, 51, 0.1);
}

.notification.info .notification-icon {
    color: #33b5e5;
    background: rgba(51, 181, 229, 0.1);
}

.notification-content {
    flex: 1;
    color: white;
}

.notification-message {
    font-size: 0.95rem;
    line-height: 1.4;
    margin: 0;
}

.notification-close {
    background: none;
    border: none;
    color: rgba(255, 255, 255, 0.5);
    font-size: 1.2rem;
    cursor: pointer;
    padding: 0;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: all 0.3s ease;
    flex-shrink: 0;
}

.notification-close:hover {
    background: rgba(255, 255, 255, 0.1);
    color: white;
}

.notification-progress {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 0 0 12px 12px;
    overflow: hidden;
}

.notification-progress-bar {
    height: 100%;
    background: currentColor;
    transition: width 0.1s linear;
}

@media (max-width: 768px) {
    .notification-container {
        top: 60px;
        right: 10px;
        left: 10px;
    }

    .notification {
        min-width: auto;
        max-width: none;
        transform: translateY(-200px);
    }

    .notification.show {
        transform: translateY(0);
    }

    .notification.hide {
        transform: translateY(-200px);
    }
}
        `;
        document.head.appendChild(style);
    }

    show(message, type = 'info', duration = 5000) {
        // Limitar cantidad de notificaciones
        if (this.notifications.length >= this.maxNotifications) {
            this.remove(this.notifications[0]);
        }

        const notification = this.createNotification(message, type, duration);
        this.container.appendChild(notification);
        this.notifications.push(notification);

        // Animar entrada
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);

        // Auto-remover después de la duración
        if (duration > 0) {
            const hideTimeout = setTimeout(() => {
                this.remove(notification);
            }, duration);

            notification.hideTimeout = hideTimeout;
        }

        return notification;
    }

    createNotification(message, type, duration) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;

        // Icono según el tipo
        const icons = {
            success: '<i class="fas fa-check-circle"></i>',
            error: '<i class="fas fa-times-circle"></i>',
            warning: '<i class="fas fa-exclamation-triangle"></i>',
            info: '<i class="fas fa-info-circle"></i>'
        };

        notification.innerHTML = `
            <div class="notification-icon">${icons[type] || icons.info}</div>
            <div class="notification-content">
                <p class="notification-message">${message}</p>
            </div>
            <button class="notification-close" aria-label="Close">
                <i class="fas fa-times"></i>
            </button>
            ${duration > 0 ? '<div class="notification-progress"><div class="notification-progress-bar"></div></div>' : ''}
        `;

        // Click en cerrar
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.remove(notification);
        });

        // Click en toda la notificación
        notification.addEventListener('click', () => {
            this.remove(notification);
        });

        // Animación de progreso
        if (duration > 0) {
            const progressBar = notification.querySelector('.notification-progress-bar');
            if (progressBar) {
                let startTime = Date.now();
                const updateProgress = () => {
                    const elapsed = Date.now() - startTime;
                    const progress = Math.max(0, 100 - (elapsed / duration * 100));
                    progressBar.style.width = `${progress}%`;

                    if (progress > 0) {
                        requestAnimationFrame(updateProgress);
                    }
                };
                updateProgress();
            }
        }

        return notification;
    }

    remove(notification) {
        if (!notification || !this.notifications.includes(notification)) {
            return;
        }

        // Limpiar timeout
        if (notification.hideTimeout) {
            clearTimeout(notification.hideTimeout);
        }

        // Animar salida
        notification.classList.remove('show');
        notification.classList.add('hide');

        // Remover del DOM
        setTimeout(() => {
            if (notification.parentElement) {
                notification.parentElement.removeChild(notification);
            }
            const index = this.notifications.indexOf(notification);
            if (index > -1) {
                this.notifications.splice(index, 1);
            }
        }, 500);
    }

    removeAll() {
        this.notifications.forEach(notification => {
            this.remove(notification);
        });
    }

    success(message, duration = 5000) {
        return this.show(message, 'success', duration);
    }

    error(message, duration = 5000) {
        return this.show(message, 'error', duration);
    }

    warning(message, duration = 5000) {
        return this.show(message, 'warning', duration);
    }

    info(message, duration = 5000) {
        return this.show(message, 'info', duration);
    }
}

// Inicializar sistema de notificaciones
let notificationSystem = null;

function initializeNotificationSystem() {
    if (!notificationSystem) {
        notificationSystem = new NotificationSystem();
        window.NotificationSystem = notificationSystem;
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeNotificationSystem);
} else {
    initializeNotificationSystem();
}

window.NotificationSystemClass = NotificationSystem;

