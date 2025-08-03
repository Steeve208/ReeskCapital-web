// ===== FIX DEBUG PANEL - RSC Chain =====
// Script para eliminar inmediatamente el panel de debug

(function() {
  // Eliminar panel de debug inmediatamente
  function removeDebugPanel() {
    const debugPanel = document.getElementById('chatDebugPanel');
    if (debugPanel) {
      debugPanel.remove();
      console.log('✅ Panel de debug eliminado');
    }
  }
  
  // Ejecutar inmediatamente
  removeDebugPanel();
  
  // También ejecutar después de un retraso por si acaso
  setTimeout(removeDebugPanel, 100);
  setTimeout(removeDebugPanel, 500);
  setTimeout(removeDebugPanel, 1000);
  
  // Función global para eliminar debug
  window.removeDebug = removeDebugPanel;
  
  // Comando de consola
  console.log('💬 Para eliminar debug: removeDebug()');
})(); 