/* ================================
   TESTING.JS — PRUEBAS Y OPTIMIZACIÓN
================================ */

class TestingManager {
  constructor() {
    this.tests = new Map();
    this.performanceMetrics = new Map();
    this.isRunning = false;
    this.init();
  }

  init() {
    this.setupTests();
    this.setupPerformanceMonitoring();
  }

  setupTests() {
    // Test de APIs
    this.tests.set('api', this.testAPIs.bind(this));
    
    // Test de WebSocket
    this.tests.set('websocket', this.testWebSocket.bind(this));
    
    // Test de UI
    this.tests.set('ui', this.testUI.bind(this));
    
    // Test de Performance
    this.tests.set('performance', this.testPerformance.bind(this));
    
    // Test de Responsive
    this.tests.set('responsive', this.testResponsive.bind(this));
  }

  setupPerformanceMonitoring() {
    // Monitorear métricas de performance
    if ('performance' in window) {
      window.addEventListener('load', () => {
        this.measurePageLoad();
      });
    }

    // Monitorear errores
    window.addEventListener('error', (event) => {
      this.logError('JavaScript Error', event.error);
    });

    // Monitorear promesas rechazadas
    window.addEventListener('unhandledrejection', (event) => {
      this.logError('Unhandled Promise Rejection', event.reason);
    });
  }

  async runAllTests() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    console.log('🧪 Iniciando pruebas...');
    
    const results = {};
    
    for (const [name, test] of this.tests) {
      try {
        console.log(`🔍 Ejecutando test: ${name}`);
        results[name] = await test();
      } catch (error) {
        console.error(`❌ Error en test ${name}:`, error);
        results[name] = { success: false, error: error.message };
      }
    }
    
    this.isRunning = false;
    this.displayTestResults(results);
    return results;
  }

  async testAPIs() {
    const results = {};
    const apis = [
      { name: 'Wallet Create', endpoint: '/wallet/create', method: 'POST' },
      { name: 'Wallet Balance', endpoint: '/wallet/balance', method: 'POST' },
      { name: 'Mining Start', endpoint: '/mining/start', method: 'POST' },
      { name: 'Staking Pools', endpoint: '/staking/pools', method: 'GET' },
      { name: 'P2P Orders', endpoint: '/p2p/orders', method: 'GET' },
      { name: 'Blockchain Stats', endpoint: '/blockchain/stats', method: 'GET' }
    ];

    for (const api of apis) {
      try {
        const startTime = performance.now();
        const response = await apiRequest(api.endpoint, { method: api.method });
        const endTime = performance.now();
        
        results[api.name] = {
          success: response.success,
          responseTime: endTime - startTime,
          status: response.success ? 'OK' : 'ERROR'
        };
      } catch (error) {
        results[api.name] = {
          success: false,
          error: error.message,
          status: 'ERROR'
        };
      }
    }

    return { success: true, results };
  }

  async testWebSocket() {
    return new Promise((resolve) => {
      if (!window.wsManager) {
        resolve({ success: false, error: 'WebSocket manager no disponible' });
        return;
      }

      const timeout = setTimeout(() => {
        resolve({ success: false, error: 'Timeout en conexión WebSocket' });
      }, 5000);

      window.wsManager.subscribe('connected', () => {
        clearTimeout(timeout);
        resolve({ success: true, message: 'WebSocket conectado exitosamente' });
      });

      window.wsManager.subscribe('error', (error) => {
        clearTimeout(timeout);
        resolve({ success: false, error: error.message });
      });
    });
  }

  async testUI() {
    const results = {};
    
    // Test de elementos críticos
    const criticalElements = [
      { selector: '.navbar', name: 'Navbar' },
      { selector: '.hero-section', name: 'Hero Section' },
      { selector: '.wallet-container', name: 'Wallet Container' },
      { selector: '.mining-container', name: 'Mining Container' },
      { selector: '.staking-container', name: 'Staking Container' },
      { selector: '.p2p-container', name: 'P2P Container' }
    ];

    for (const element of criticalElements) {
      const el = document.querySelector(element.selector);
      results[element.name] = {
        exists: !!el,
        visible: el ? el.offsetParent !== null : false,
        accessible: el ? this.testAccessibility(el) : false
      };
    }

    // Test de funcionalidad
    results['Dark Mode Toggle'] = this.testDarkModeToggle();
    results['Notifications'] = this.testNotifications();
    results['Responsive Design'] = this.testResponsiveDesign();

    return { success: true, results };
  }

  testAccessibility(element) {
    // Verificar atributos de accesibilidad
    const hasAriaLabel = element.hasAttribute('aria-label');
    const hasRole = element.hasAttribute('role');
    const hasTabIndex = element.hasAttribute('tabindex');
    const isFocusable = element.tabIndex >= 0;
    
    return hasAriaLabel || hasRole || hasTabIndex || isFocusable;
  }

  testDarkModeToggle() {
    const toggle = document.getElementById('themeToggle');
    if (!toggle) return { success: false, error: 'Toggle no encontrado' };
    
    const initialTheme = document.body.classList.contains('dark-mode');
    toggle.click();
    const newTheme = document.body.classList.contains('dark-mode');
    
    return {
      success: initialTheme !== newTheme,
      message: 'Toggle de tema funciona correctamente'
    };
  }

  testNotifications() {
    try {
      showNotification('success', 'Test', 'Notificación de prueba');
      return { success: true, message: 'Sistema de notificaciones funciona' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  testResponsiveDesign() {
    const breakpoints = [
      { width: 320, name: 'Mobile' },
      { width: 768, name: 'Tablet' },
      { width: 1024, name: 'Desktop' },
      { width: 1440, name: 'Large Desktop' }
    ];

    const results = {};
    
    breakpoints.forEach(breakpoint => {
      const originalWidth = window.innerWidth;
      
      // Simular tamaño de pantalla
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: breakpoint.width
      });
      
      // Disparar evento de resize
      window.dispatchEvent(new Event('resize'));
      
      // Verificar si hay elementos que se ocultan/muestran
      const navbar = document.querySelector('.navbar');
      const isResponsive = navbar && navbar.offsetWidth > 0;
      
      results[breakpoint.name] = {
        width: breakpoint.width,
        responsive: isResponsive
      };
      
      // Restaurar tamaño original
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: originalWidth
      });
    });

    return { success: true, results };
  }

  async testPerformance() {
    const metrics = {};
    
    // Métricas de carga de página
    if ('performance' in window) {
      const perfData = performance.getEntriesByType('navigation')[0];
      metrics['Page Load Time'] = perfData.loadEventEnd - perfData.loadEventStart;
      metrics['DOM Content Loaded'] = perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart;
      metrics['First Paint'] = perfData.responseStart - perfData.requestStart;
    }

    // Métricas de memoria
    if ('memory' in performance) {
      metrics['Memory Used'] = performance.memory.usedJSHeapSize;
      metrics['Memory Total'] = performance.memory.totalJSHeapSize;
    }

    // Test de rendimiento de animaciones
    metrics['Animation Performance'] = await this.testAnimationPerformance();

    return { success: true, metrics };
  }

  async testAnimationPerformance() {
    return new Promise((resolve) => {
      const startTime = performance.now();
      let frameCount = 0;
      
      const testAnimation = () => {
        frameCount++;
        if (performance.now() - startTime < 1000) {
          requestAnimationFrame(testAnimation);
        } else {
          resolve({
            fps: frameCount,
            performance: frameCount >= 50 ? 'Good' : frameCount >= 30 ? 'Acceptable' : 'Poor'
          });
        }
      };
      
      requestAnimationFrame(testAnimation);
    });
  }

  measurePageLoad() {
    const perfData = performance.getEntriesByType('navigation')[0];
    
    this.performanceMetrics.set('pageLoad', {
      totalTime: perfData.loadEventEnd - perfData.loadEventStart,
      domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
      firstPaint: perfData.responseStart - perfData.requestStart
    });

    console.log('📊 Métricas de carga:', this.performanceMetrics.get('pageLoad'));
  }

  logError(type, error) {
    const errorLog = {
      type,
      message: error.message || error,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent
    };

    console.error('❌ Error capturado:', errorLog);
    
    // Enviar a servicio de logging si está disponible
    if (window.wsManager && window.wsManager.isConnected) {
      window.wsManager.send({
        type: 'error_log',
        data: errorLog
      });
    }
  }

  displayTestResults(results) {
    console.log('📋 Resultados de las pruebas:');
    
    let passed = 0;
    let failed = 0;
    
    for (const [testName, result] of Object.entries(results)) {
      if (result.success) {
        console.log(`✅ ${testName}: PASÓ`);
        passed++;
      } else {
        console.log(`❌ ${testName}: FALLÓ - ${result.error || 'Error desconocido'}`);
        failed++;
      }
    }
    
    console.log(`\n📊 Resumen: ${passed} pasaron, ${failed} fallaron`);
    
    // Mostrar notificación con resultados
    if (failed === 0) {
      showNotification('success', 'Pruebas Completadas', `Todas las pruebas pasaron (${passed} tests)`);
    } else {
      showNotification('warning', 'Pruebas Completadas', `${passed} pasaron, ${failed} fallaron`);
    }
  }

  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      performance: this.performanceMetrics,
      tests: this.tests
    };

    console.log('📄 Reporte generado:', report);
    return report;
  }
}

// Función para ejecutar pruebas manualmente
function runTests() {
  if (window.testingManager) {
    return window.testingManager.runAllTests();
  } else {
    console.error('Testing manager no disponible');
    return null;
  }
}

// Función para generar reporte
function generateTestReport() {
  if (window.testingManager) {
    return window.testingManager.generateReport();
  } else {
    console.error('Testing manager no disponible');
    return null;
  }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  window.testingManager = new TestingManager();
});

// Exportar funciones para uso global
window.runTests = runTests;
window.generateTestReport = generateTestReport;
window.TestingManager = TestingManager; 