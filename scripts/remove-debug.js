// ===== REMOVER DEBUG PANEL - RSC Chain =====
// Este script elimina el panel de debug en producción

(function() {
  // Verificar si estamos en producción
  const isProduction = !window.location.hostname.includes('localhost') && 
                      !window.location.hostname.includes('127.0.0.1') && 
                      !window.location.hostname.includes('dev') &&
                      !window.location.search.includes('debug=true');
  
  if (isProduction) {
    // Eliminar panel de debug si existe
    const debugPanel = document.getElementById('chatDebugPanel');
    if (debugPanel) {
      debugPanel.remove();
      console.log('✅ Panel de debug removido (modo producción)');
    }
    
    // Ocultar mensajes de debug en consola
    const originalLog = console.log;
    console.log = function(...args) {
      if (!args[0] || !args[0].toString().includes('🔍 Chat Debug')) {
        originalLog.apply(console, args);
      }
    };
  }
})();

// Función para remover debug manualmente
window.removeChatDebug = function() {
  const debugPanel = document.getElementById('chatDebugPanel');
  if (debugPanel) {
    debugPanel.remove();
    console.log('✅ Panel de debug removido manualmente');
  }
}; 