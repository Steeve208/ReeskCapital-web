/* ================================
   DEBUG.JS — DIAGNÓSTICO Y SOLUCIÓN DE PROBLEMAS
================================ */

class DebugManager {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.info = [];
    this.init();
  }

  init() {
    this.setupErrorHandling();
    this.checkEnvironment();
    this.checkDependencies();
    this.checkAPIs();
    this.displayResults();
  }

  setupErrorHandling() {
    // Capturar errores globales
    window.addEventListener('error', (event) => {
      this.logError('JavaScript Error', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error
      });
    });

    // Capturar promesas rechazadas
    window.addEventListener('unhandledrejection', (event) => {
      this.logError('Unhandled Promise Rejection', {
        reason: event.reason,
        promise: event.promise
      });
    });

    // Capturar errores de recursos
    window.addEventListener('error', (event) => {
      if (event.target && event.target.tagName) {
        this.logError('Resource Error', {
          tagName: event.target.tagName,
          src: event.target.src,
          href: event.target.href
        });
      }
    }, true);
  }

  checkEnvironment() {
    this.info.push({
      type: 'Environment',
      message: `Browser: ${navigator.userAgent}`,
      status: 'info'
    });

    this.info.push({
      type: 'Environment',
      message: `URL: ${window.location.href}`,
      status: 'info'
    });

    this.info.push({
      type: 'Environment',
      message: `Protocol: ${window.location.protocol}`,
      status: 'info'
    });

    // Verificar si estamos en localhost
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      this.warnings.push({
        type: 'Environment',
        message: 'Running on localhost - some features may not work',
        status: 'warning'
      });
    }
  }

  checkDependencies() {
    const dependencies = [
      { name: 'Chart.js', global: 'Chart', required: false },
      { name: 'Three.js', global: 'THREE', required: false },
      { name: 'Fetch API', global: 'fetch', required: true },
      { name: 'LocalStorage', global: 'localStorage', required: true },
      { name: 'WebSocket', global: 'WebSocket', required: false }
    ];

    dependencies.forEach(dep => {
      if (window[dep.global]) {
        this.info.push({
          type: 'Dependency',
          message: `${dep.name} ✓ Available`,
          status: 'success'
        });
      } else if (dep.required) {
        this.errors.push({
          type: 'Dependency',
          message: `${dep.name} ✗ Missing (Required)`,
          status: 'error'
        });
      } else {
        this.warnings.push({
          type: 'Dependency',
          message: `${dep.name} ⚠ Missing (Optional)`,
          status: 'warning'
        });
      }
    });
  }

  async checkAPIs() {
    const apis = [
      { name: 'Backend API', url: '/api/health', method: 'GET' },
      { name: 'Blockchain API', url: '/api/blockchain/stats', method: 'GET' },
      { name: 'Wallet API', url: '/api/wallet/create', method: 'POST' }
    ];

    for (const api of apis) {
      try {
        const response = await fetch(api.url, { 
          method: api.method,
          headers: { 'Content-Type': 'application/json' }
        });
        
        if (response.ok) {
          this.info.push({
            type: 'API',
            message: `${api.name} ✓ Responding (${response.status})`,
            status: 'success'
          });
        } else {
          this.warnings.push({
            type: 'API',
            message: `${api.name} ⚠ Error (${response.status})`,
            status: 'warning'
          });
        }
      } catch (error) {
        this.errors.push({
          type: 'API',
          message: `${api.name} ✗ Failed: ${error.message}`,
          status: 'error'
        });
      }
    }
  }

  logError(type, data) {
    this.errors.push({
      type,
      message: data.message || data,
      data,
      timestamp: new Date().toISOString()
    });
  }

  logWarning(type, message) {
    this.warnings.push({
      type,
      message,
      timestamp: new Date().toISOString()
    });
  }

  logInfo(type, message) {
    this.info.push({
      type,
      message,
      timestamp: new Date().toISOString()
    });
  }

  displayResults() {
    console.group('🔍 RSC Chain Debug Report');
    
    if (this.errors.length > 0) {
      console.group('❌ Errors');
      this.errors.forEach(error => {
        console.error(`${error.type}: ${error.message}`, error.data || '');
      });
      console.groupEnd();
    }

    if (this.warnings.length > 0) {
      console.group('⚠️ Warnings');
      this.warnings.forEach(warning => {
        console.warn(`${warning.type}: ${warning.message}`);
      });
      console.groupEnd();
    }

    if (this.info.length > 0) {
      console.group('ℹ️ Info');
      this.info.forEach(info => {
        console.info(`${info.type}: ${info.message}`);
      });
      console.groupEnd();
    }

    console.groupEnd();

    // Mostrar resumen
    const summary = {
      errors: this.errors.length,
      warnings: this.warnings.length,
      info: this.info.length
    };

    console.log('📊 Debug Summary:', summary);

    // Si hay errores críticos, mostrar notificación
    if (this.errors.length > 0) {
      this.showDebugNotification();
    }
  }

  showDebugNotification() {
    const notification = document.createElement('div');
    notification.className = 'debug-notification';
    notification.innerHTML = `
      <div class="debug-content">
        <h4>🔍 Debug Report</h4>
        <p>${this.errors.length} errors, ${this.warnings.length} warnings</p>
        <button onclick="window.debugManager.showDetailedReport()">Ver Detalles</button>
        <button onclick="this.parentElement.parentElement.remove()">Cerrar</button>
      </div>
    `;
    
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #1a1a1a;
      border: 1px solid #333;
      border-radius: 8px;
      padding: 16px;
      color: white;
      z-index: 10000;
      max-width: 300px;
    `;
    
    document.body.appendChild(notification);
  }

  showDetailedReport() {
    const modal = document.createElement('div');
    modal.className = 'debug-modal';
    modal.innerHTML = `
      <div class="debug-modal-content">
        <h3>🔍 Debug Report Detallado</h3>
        <div class="debug-sections">
          ${this.renderErrorsSection()}
          ${this.renderWarningsSection()}
          ${this.renderInfoSection()}
        </div>
        <button onclick="this.parentElement.parentElement.remove()">Cerrar</button>
      </div>
    `;
    
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.8);
      z-index: 10001;
      display: flex;
      align-items: center;
      justify-content: center;
    `;
    
    document.body.appendChild(modal);
  }

  renderErrorsSection() {
    if (this.errors.length === 0) return '';
    
    return `
      <div class="debug-section">
        <h4>❌ Errors (${this.errors.length})</h4>
        <ul>
          ${this.errors.map(error => `
            <li><strong>${error.type}:</strong> ${error.message}</li>
          `).join('')}
        </ul>
      </div>
    `;
  }

  renderWarningsSection() {
    if (this.warnings.length === 0) return '';
    
    return `
      <div class="debug-section">
        <h4>⚠️ Warnings (${this.warnings.length})</h4>
        <ul>
          ${this.warnings.map(warning => `
            <li><strong>${warning.type}:</strong> ${warning.message}</li>
          `).join('')}
        </ul>
      </div>
    `;
  }

  renderInfoSection() {
    if (this.info.length === 0) return '';
    
    return `
      <div class="debug-section">
        <h4>ℹ️ Info (${this.info.length})</h4>
        <ul>
          ${this.info.map(info => `
            <li><strong>${info.type}:</strong> ${info.message}</li>
          `).join('')}
        </ul>
      </div>
    `;
  }
}

// Inicializar debug cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  window.debugManager = new DebugManager();
});

// Función para ejecutar debug manualmente
function runDebug() {
  if (window.debugManager) {
    window.debugManager.init();
  } else {
    console.log('Debug manager no disponible');
  }
}

// Exportar para uso global
window.DebugManager = DebugManager;
window.runDebug = runDebug; 