// ===== SCRIPT DE EMERGENCIA DEL CHAT =====
// Este script fuerza la creación y visualización del chat

class ChatEmergency {
  constructor() {
    this.init();
  }

  init() {
    console.log('🚨 Chat Emergency iniciado');
    
    // Esperar un poco y luego verificar
    setTimeout(() => {
      this.forceCreateChat();
    }, 1000);
  }

  forceCreateChat() {
    console.log('🔧 Forzando creación del chat...');
    
    // Verificar si el chat existe
    const existingChat = document.getElementById('supportChat');
    if (!existingChat) {
      console.log('❌ Chat no encontrado, creando...');
      this.createEmergencyChat();
    } else {
      console.log('✅ Chat encontrado, verificando visibilidad...');
      this.forceShowChat();
    }
  }

  createEmergencyChat() {
    // Crear el HTML del chat de emergencia
    const chatHTML = `
      <div class="advanced-support-chat" id="supportChat" style="display: block !important; visibility: visible !important; opacity: 1 !important;">
        <!-- Overlay de fondo -->
        <div class="chat-overlay"></div>
        
        <!-- Contenedor principal del chat -->
        <div class="chat-container">
          
          <!-- Header del chat -->
          <div class="chat-header">
            <div class="chat-header-left">
              <div class="chat-avatar">
                <div class="avatar-icon">🤖</div>
                <div class="status-indicator online"></div>
              </div>
              <div class="chat-info">
                <h3 class="chat-title">Asistente RSC Chain</h3>
                <div class="chat-status">
                  <span class="status-dot online"></span>
                  <span class="status-text">En línea</span>
                  <span class="response-time">Respuesta en < 30s</span>
                </div>
              </div>
            </div>
            
            <div class="chat-header-right">
              <button class="chat-control-btn" id="minimizeChat" title="Minimizar">
                <span class="btn-icon">−</span>
              </button>
              <button class="chat-control-btn" id="closeChat" title="Cerrar">
                <span class="btn-icon">×</span>
              </button>
            </div>
          </div>
          
          <!-- Área de conversación -->
          <div class="chat-messages" id="chatMessages">
            <!-- Mensaje de bienvenida -->
            <div class="message assistant-message">
              <div class="message-avatar">
                <div class="avatar-icon">🤖</div>
              </div>
              <div class="message-content">
                <div class="message-bubble">
                  <div class="message-text">
                    <p>¡Hola! Soy el asistente inteligente de <strong>RSC Chain</strong>. 🤖</p>
                    <p>Estoy aquí para ayudarte con cualquier consulta sobre nuestra blockchain revolucionaria.</p>
                  </div>
                  <div class="message-time">Ahora</div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Área de entrada -->
          <div class="chat-input-area">
            <div class="input-container">
              <div class="input-wrapper">
                <input type="text" id="chatInput" placeholder="Escribe tu mensaje..." class="chat-input">
                <div class="input-actions">
                  <button class="action-btn" id="attachFile" title="Adjuntar archivo">
                    <span class="btn-icon">📎</span>
                  </button>
                  <button class="action-btn" id="emojiBtn" title="Emojis">
                    <span class="btn-icon">😊</span>
                  </button>
                </div>
              </div>
              <button class="send-btn" id="sendMessage" disabled>
                <span class="send-icon">→</span>
              </button>
            </div>
          </div>
        </div>
        
        <!-- Botón flotante para abrir chat -->
        <div class="chat-toggle" id="chatToggle" style="display: block !important; visibility: visible !important; opacity: 1 !important;">
          <div class="toggle-icon">💬</div>
          <div class="toggle-badge" id="messageBadge">0</div>
        </div>
      </div>
    `;

    // Insertar el chat al final del body
    document.body.insertAdjacentHTML('beforeend', chatHTML);
    console.log('✅ Chat de emergencia creado');
    
    // Inicializar eventos del chat
    this.initializeChatEvents();
  }

  forceShowChat() {
    const supportChat = document.getElementById('supportChat');
    const chatToggle = document.getElementById('chatToggle');
    
    if (supportChat) {
      supportChat.style.display = 'block';
      supportChat.style.visibility = 'visible';
      supportChat.style.opacity = '1';
      supportChat.style.zIndex = '9999';
      console.log('✅ Chat forzado a mostrar');
    }
    
    if (chatToggle) {
      chatToggle.style.display = 'block';
      chatToggle.style.visibility = 'visible';
      chatToggle.style.opacity = '1';
      chatToggle.style.zIndex = '10000';
      console.log('✅ Botón del chat forzado a mostrar');
    }
  }

  initializeChatEvents() {
    // Evento para el botón del chat
    const chatToggle = document.getElementById('chatToggle');
    const supportChat = document.getElementById('supportChat');
    const closeChat = document.getElementById('closeChat');
    const minimizeChat = document.getElementById('minimizeChat');
    
    if (chatToggle) {
      chatToggle.addEventListener('click', () => {
        if (supportChat) {
          supportChat.style.display = supportChat.style.display === 'none' ? 'block' : 'none';
        }
      });
    }
    
    if (closeChat) {
      closeChat.addEventListener('click', () => {
        if (supportChat) {
          supportChat.style.display = 'none';
        }
      });
    }
    
    if (minimizeChat) {
      minimizeChat.addEventListener('click', () => {
        if (supportChat) {
          supportChat.style.display = 'none';
        }
      });
    }
    
    // Evento para enviar mensajes
    const chatInput = document.getElementById('chatInput');
    const sendMessage = document.getElementById('sendMessage');
    
    if (chatInput && sendMessage) {
      chatInput.addEventListener('input', () => {
        sendMessage.disabled = !chatInput.value.trim();
      });
      
      sendMessage.addEventListener('click', () => {
        this.handleSendMessage();
      });
      
      chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          this.handleSendMessage();
        }
      });
    }
    
    console.log('✅ Eventos del chat inicializados');
  }

  handleSendMessage() {
    const chatInput = document.getElementById('chatInput');
    const chatMessages = document.getElementById('chatMessages');
    
    if (!chatInput || !chatMessages) return;
    
    const message = chatInput.value.trim();
    if (!message) return;
    
    // Agregar mensaje del usuario
    const userMessage = document.createElement('div');
    userMessage.className = 'message user-message';
    userMessage.innerHTML = `
      <div class="message-content">
        <div class="message-bubble">
          <div class="message-text">${message}</div>
          <div class="message-time">Ahora</div>
        </div>
      </div>
    `;
    chatMessages.appendChild(userMessage);
    
    // Limpiar input
    chatInput.value = '';
    document.getElementById('sendMessage').disabled = true;
    
    // Simular respuesta de la IA
    setTimeout(() => {
      this.generateAIResponse(message);
    }, 1000);
    
    // Scroll al final
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  generateAIResponse(userMessage) {
    const chatMessages = document.getElementById('chatMessages');
    if (!chatMessages) return;
    
    // Usar la IA si está disponible
    let response = '';
    if (window.RSCChainAI) {
      const ai = new RSCChainAI();
      response = ai.processMessage(userMessage);
    } else {
      // Respuesta de emergencia
      response = this.getEmergencyResponse(userMessage);
    }
    
    // Agregar respuesta de la IA
    const aiMessage = document.createElement('div');
    aiMessage.className = 'message assistant-message';
    aiMessage.innerHTML = `
      <div class="message-avatar">
        <div class="avatar-icon">🤖</div>
      </div>
      <div class="message-content">
        <div class="message-bubble">
          <div class="message-text">${response}</div>
          <div class="message-time">Ahora</div>
        </div>
      </div>
    `;
    chatMessages.appendChild(aiMessage);
    
    // Scroll al final
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  getEmergencyResponse(message) {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('hola') || lowerMessage.includes('hello')) {
      return '¡Hola! Soy el asistente de RSC Chain. ¿En qué puedo ayudarte?';
    } else if (lowerMessage.includes('minar') || lowerMessage.includes('mining')) {
      return 'Para minar RSC, ve a la página de minería y haz clic en "Start Mining". No necesitas hardware especializado.';
    } else if (lowerMessage.includes('wallet')) {
      return 'Puedes crear una wallet en la página de Wallet. Recuerda guardar tu frase semilla en un lugar seguro.';
    } else if (lowerMessage.includes('p2p')) {
      return 'El P2P permite intercambiar RSC sin KYC. Usa la protección escrow para mayor seguridad.';
    } else if (lowerMessage.includes('staking')) {
      return 'El staking te permite ganar recompensas por mantener RSC bloqueados. Ve a la página de Staking para más información.';
    } else {
      return 'Gracias por tu mensaje. Soy el asistente de RSC Chain y estoy aquí para ayudarte con cualquier consulta sobre nuestra blockchain.';
    }
  }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
  new ChatEmergency();
});

// También inicializar después de un retraso por si acaso
setTimeout(() => {
  if (!document.getElementById('supportChat')) {
    new ChatEmergency();
  }
}, 2000);

// Exportar para uso global
window.ChatEmergency = ChatEmergency; 