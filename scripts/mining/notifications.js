// ===== PROFESSIONAL NOTIFICATIONS SYSTEM =====

(function() {
    'use strict';
    
    let toastContainer = null;
    let toastIdCounter = 0;
    
    // Initialize notifications system
    function init() {
        createToastContainer();
        console.log('✅ Notifications system initialized');
    }
    
    function createToastContainer() {
        if (toastContainer) return;
        
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container';
        toastContainer.id = 'toastContainer';
        document.body.appendChild(toastContainer);
    }
    
    /**
     * Show a toast notification
     * @param {string} message - The message to display
     * @param {string} type - Type: 'success', 'error', 'warning', 'info'
     * @param {object} options - Additional options
     */
    function showToast(message, type = 'info', options = {}) {
        createToastContainer();
        
        const toastId = `toast-${++toastIdCounter}`;
        const duration = options.duration || 5000;
        const title = options.title || getDefaultTitle(type);
        const actions = options.actions || [];
        
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.id = toastId;
        
        const icon = getIcon(type);
        
        toast.innerHTML = `
            <div class="toast-icon">${icon}</div>
            <div class="toast-content">
                <div class="toast-title">${title}</div>
                <div class="toast-message">${message}</div>
                ${actions.length > 0 ? `
                    <div class="toast-actions">
                        ${actions.map((action, index) => `
                            <button class="toast-action-btn ${action.primary ? 'primary' : ''}" 
                                    onclick="${action.onClick}">
                                ${action.label}
                            </button>
                        `).join('')}
                    </div>
                ` : ''}
            </div>
            <button class="toast-close" onclick="window.miningNotifications.removeToast('${toastId}')">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        toastContainer.appendChild(toast);
        
        // Auto remove after duration
        if (duration > 0) {
            setTimeout(() => {
                removeToast(toastId);
            }, duration);
        }
        
        return toastId;
    }
    
    function getIcon(type) {
        const icons = {
            success: '<i class="fas fa-check-circle"></i>',
            error: '<i class="fas fa-exclamation-circle"></i>',
            warning: '<i class="fas fa-exclamation-triangle"></i>',
            info: '<i class="fas fa-info-circle"></i>'
        };
        return icons[type] || icons.info;
    }
    
    function getDefaultTitle(type) {
        const titles = {
            success: 'Éxito',
            error: 'Error',
            warning: 'Advertencia',
            info: 'Información'
        };
        return titles[type] || titles.info;
    }
    
    function removeToast(toastId) {
        const toast = document.getElementById(toastId);
        if (toast) {
            toast.style.animation = 'slideInRight 0.3s ease-out reverse';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }
    }
    
    /**
     * Show confirmation dialog
     * @param {string} message - The message to display
     * @param {object} options - Options: title, type, confirmText, cancelText
     * @returns {Promise<boolean>} - Resolves to true if confirmed, false if cancelled
     */
    function confirm(message, options = {}) {
        return new Promise((resolve) => {
            const title = options.title || 'Confirmar';
            const type = options.type || 'warning';
            const confirmText = options.confirmText || 'Confirmar';
            const cancelText = options.cancelText || 'Cancelar';
            const danger = options.danger || false;
            
            const overlay = document.createElement('div');
            overlay.className = 'confirm-dialog-overlay';
            
            const icon = type === 'danger' ? 'exclamation-triangle' : 
                        type === 'warning' ? 'exclamation-triangle' : 
                        'info-circle';
            const iconClass = danger ? 'danger' : type;
            
            overlay.innerHTML = `
                <div class="confirm-dialog">
                    <div class="confirm-dialog-header">
                        <div class="confirm-dialog-icon ${iconClass}">
                            <i class="fas fa-${icon}"></i>
                        </div>
                        <h3 class="confirm-dialog-title">${title}</h3>
                    </div>
                    <div class="confirm-dialog-message">${message}</div>
                    <div class="confirm-dialog-actions">
                        <button class="confirm-dialog-btn cancel" onclick="this.closest('.confirm-dialog-overlay').remove(); window.miningNotifications._resolveConfirm(false);">
                            ${cancelText}
                        </button>
                        <button class="confirm-dialog-btn ${danger ? 'danger' : 'confirm'}" onclick="this.closest('.confirm-dialog-overlay').remove(); window.miningNotifications._resolveConfirm(true);">
                            ${confirmText}
                        </button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(overlay);
            
            // Store resolve function
            window.miningNotifications._resolveConfirm = resolve;
            
            // Close on overlay click
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    overlay.remove();
                    resolve(false);
                }
            });
            
            // Close on Escape key
            const escapeHandler = (e) => {
                if (e.key === 'Escape') {
                    overlay.remove();
                    document.removeEventListener('keydown', escapeHandler);
                    resolve(false);
                }
            };
            document.addEventListener('keydown', escapeHandler);
        });
    }
    
    /**
     * Show alert dialog
     * @param {string} message - The message to display
     * @param {object} options - Options: title, type
     * @returns {Promise<void>}
     */
    function alert(message, options = {}) {
        return new Promise((resolve) => {
            const title = options.title || 'Aviso';
            const type = options.type || 'info';
            
            const overlay = document.createElement('div');
            overlay.className = 'confirm-dialog-overlay';
            
            const icon = type === 'error' ? 'exclamation-circle' : 
                        type === 'warning' ? 'exclamation-triangle' : 
                        'info-circle';
            const iconClass = type;
            
            overlay.innerHTML = `
                <div class="confirm-dialog">
                    <div class="confirm-dialog-header">
                        <div class="confirm-dialog-icon ${iconClass}">
                            <i class="fas fa-${icon}"></i>
                        </div>
                        <h3 class="confirm-dialog-title">${title}</h3>
                    </div>
                    <div class="confirm-dialog-message">${message}</div>
                    <div class="confirm-dialog-actions">
                        <button class="confirm-dialog-btn confirm" onclick="this.closest('.confirm-dialog-overlay').remove(); window.miningNotifications._resolveAlert();">
                            Aceptar
                        </button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(overlay);
            
            // Store resolve function
            window.miningNotifications._resolveAlert = resolve;
            
            // Close on overlay click
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    overlay.remove();
                    resolve();
                }
            });
            
            // Close on Escape key
            const escapeHandler = (e) => {
                if (e.key === 'Escape') {
                    overlay.remove();
                    document.removeEventListener('keydown', escapeHandler);
                    resolve();
                }
            };
            document.addEventListener('keydown', escapeHandler);
        });
    }
    
    // Expose API
    window.miningNotifications = {
        show: showToast,
        success: (message, options) => showToast(message, 'success', options),
        error: (message, options) => showToast(message, 'error', options),
        warning: (message, options) => showToast(message, 'warning', options),
        info: (message, options) => showToast(message, 'info', options),
        confirm: confirm,
        alert: alert,
        removeToast: removeToast
    };
    
    // Global helper functions
    window.showNotification = (message, type) => {
        window.miningNotifications.show(message, type);
    };
    
    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

