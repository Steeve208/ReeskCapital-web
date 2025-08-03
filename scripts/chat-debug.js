// ===== DEBUG DEL CHAT - RSC Chain =====
// Este script ayuda a diagnosticar problemas con el chat

class ChatDebugger {
  constructor() {
    this.init();
  }

  init() {
    console.log('🔍 Chat Debugger iniciado');
    this.checkChatElements();
    this.checkChatVisibility();
    this.checkChatScripts();
    this.addDebugUI();
  }

  checkChatElements() {
    console.log('📋 Verificando elementos del chat...');
    
    const chatToggle = document.getElementById('chatToggle');
    const supportChat = document.getElementById('supportChat');
    const chatMessages = document.getElementById('chatMessages');
    const chatInput = document.getElementById('chatInput');

    console.log('Chat Toggle:', chatToggle);
    console.log('Support Chat:', supportChat);
    console.log('Chat Messages:', chatMessages);
    console.log('Chat Input:', chatInput);

    if (!chatToggle) {
      console.error('❌ No se encontró el botón del chat (chatToggle)');
      this.createChatToggle();
    }

    if (!supportChat) {
      console.error('❌ No se encontró el contenedor del chat (supportChat)');
    }
  }

  checkChatVisibility() {
    console.log('👁️ Verificando visibilidad del chat...');
    
    const chatToggle = document.getElementById('chatToggle');
    const supportChat = document.getElementById('supportChat');

    if (chatToggle) {
      const toggleStyle = window.getComputedStyle(chatToggle);
      console.log('Chat Toggle Display:', toggleStyle.display);
      console.log('Chat Toggle Visibility:', toggleStyle.visibility);
      console.log('Chat Toggle Position:', toggleStyle.position);
      console.log('Chat Toggle Z-Index:', toggleStyle.zIndex);
    }

    if (supportChat) {
      const chatStyle = window.getComputedStyle(supportChat);
      console.log('Support Chat Display:', chatStyle.display);
      console.log('Support Chat Visibility:', chatStyle.visibility);
      console.log('Support Chat Position:', chatStyle.position);
      console.log('Support Chat Z-Index:', chatStyle.zIndex);
    }
  }

  checkChatScripts() {
    console.log('📜 Verificando scripts del chat...');
    
    const scripts = document.querySelectorAll('script[src*="chat"]');
    console.log('Scripts de chat encontrados:', scripts.length);
    
    scripts.forEach(script => {
      console.log('Script:', script.src);
    });

    // Verificar si las clases están disponibles
    console.log('AdvancedSupportChat disponible:', typeof window.AdvancedSupportChat);
    console.log('ChatComponent disponible:', typeof window.ChatComponent);
    console.log('RSCChainAI disponible:', typeof window.RSCChainAI);
  }

  createChatToggle() {
    console.log('🔧 Creando botón del chat...');
    
    const chatToggle = document.createElement('div');
    chatToggle.id = 'chatToggle';
    chatToggle.className = 'chat-toggle';
    chatToggle.innerHTML = `
      <div class="toggle-icon">💬</div>
      <div class="toggle-badge" id="messageBadge">0</div>
    `;
    
    document.body.appendChild(chatToggle);
    console.log('✅ Botón del chat creado');
  }

  addDebugUI() {
    // Solo mostrar debug en modo desarrollo
    const isDevelopment = window.location.hostname === 'localhost' || 
                        window.location.hostname === '127.0.0.1' || 
                        window.location.hostname.includes('dev') ||
                        window.location.search.includes('debug=true');
    
    if (!isDevelopment) {
      console.log('🔍 Chat Debug: Modo producción - debug deshabilitado');
      return;
    }
    
    // Crear panel de debug solo en desarrollo
    const debugPanel = document.createElement('div');
    debugPanel.id = 'chatDebugPanel';
    debugPanel.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      background: rgba(0,0,0,0.9);
      color: white;
      padding: 10px;
      border-radius: 5px;
      font-size: 12px;
      z-index: 10000;
      max-width: 300px;
    `;
    
    debugPanel.innerHTML = `
      <div style="margin-bottom: 10px;">
        <strong>🔍 Chat Debug (DEV)</strong>
        <button onclick="document.getElementById('chatDebugPanel').remove()" style="float: right; background: red; color: white; border: none; padding: 2px 5px;">×</button>
      </div>
      <div id="debugInfo"></div>
      <button onclick="window.chatDebugger.forceShowChat()" style="background: #007bff; color: white; border: none; padding: 5px 10px; margin-top: 5px; border-radius: 3px;">Forzar Mostrar Chat</button>
    `;
    
    document.body.appendChild(debugPanel);
    this.updateDebugInfo();
  }

  updateDebugInfo() {
    const debugInfo = document.getElementById('debugInfo');
    if (!debugInfo) return;

    const chatToggle = document.getElementById('chatToggle');
    const supportChat = document.getElementById('supportChat');
    
    debugInfo.innerHTML = `
      <div>Chat Toggle: ${chatToggle ? '✅' : '❌'}</div>
      <div>Support Chat: ${supportChat ? '✅' : '❌'}</div>
      <div>AdvancedSupportChat: ${typeof window.AdvancedSupportChat !== 'undefined' ? '✅' : '❌'}</div>
      <div>ChatComponent: ${typeof window.ChatComponent !== 'undefined' ? '✅' : '❌'}</div>
    `;
  }

  forceShowChat() {
    console.log('🔧 Forzando mostrar chat...');
    
    // Crear chat si no existe
    if (!document.getElementById('supportChat')) {
      if (window.ChatComponent) {
        new ChatComponent();
      }
    }
    
    // Mostrar chat
    const supportChat = document.getElementById('supportChat');
    if (supportChat) {
      supportChat.style.display = 'block';
      supportChat.style.visibility = 'visible';
      supportChat.style.opacity = '1';
      console.log('✅ Chat forzado a mostrar');
    }
    
    // Mostrar botón
    const chatToggle = document.getElementById('chatToggle');
    if (chatToggle) {
      chatToggle.style.display = 'block';
      chatToggle.style.visibility = 'visible';
      chatToggle.style.opacity = '1';
      console.log('✅ Botón del chat forzado a mostrar');
    }
  }

  // Método para simular clic en el chat
  simulateChatClick() {
    const chatToggle = document.getElementById('chatToggle');
    if (chatToggle) {
      chatToggle.click();
      console.log('🖱️ Clic simulado en el chat');
    } else {
      console.log('❌ No se puede simular clic - botón no encontrado');
    }
  }
}

// Inicializar debugger cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
  window.chatDebugger = new ChatDebugger();
  
  // Agregar comando de consola
  window.debugChat = function() {
    window.chatDebugger.forceShowChat();
  };
  
  console.log('💬 Para forzar mostrar el chat, ejecuta: debugChat()');
});

// Exportar para uso global
window.ChatDebugger = ChatDebugger; 