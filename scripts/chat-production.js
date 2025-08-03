// ===== CHAT DE PRODUCCIÓN - RSC Chain =====
// Script limpio para producción sin debug

class ProductionChat {
  constructor() {
    this.init();
  }

  init() {
    // Solo inicializar si no existe ya un chat
    if (document.getElementById('supportChat')) {
      return;
    }

    this.createChat();
    this.initializeEvents();
  }

  createChat() {
    const chatHTML = `
      <div class="advanced-support-chat" id="supportChat">
        <div class="chat-overlay"></div>
        
        <div class="chat-container">
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
          
          <div class="chat-messages" id="chatMessages">
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
            
            <div class="message assistant-message">
              <div class="message-avatar">
                <div class="avatar-icon">🤖</div>
              </div>
              <div class="message-content">
                <div class="message-bubble">
                  <div class="message-text">
                    <p><strong>¿En qué puedo ayudarte?</strong></p>
                    <p>Escribe tu consulta sobre minería, wallet, P2P, staking o cualquier aspecto de RSC Chain:</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
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
        
        <div class="chat-toggle" id="chatToggle">
          <div class="toggle-icon">💬</div>
          <div class="toggle-badge" id="messageBadge">0</div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', chatHTML);
  }

  initializeEvents() {
    const chatToggle = document.getElementById('chatToggle');
    const supportChat = document.getElementById('supportChat');
    const closeChat = document.getElementById('closeChat');
    const minimizeChat = document.getElementById('minimizeChat');
    const chatInput = document.getElementById('chatInput');
    const sendMessage = document.getElementById('sendMessage');
    
    // Toggle chat
    if (chatToggle && supportChat) {
      chatToggle.addEventListener('click', () => {
        supportChat.style.display = supportChat.style.display === 'none' ? 'block' : 'none';
      });
    }
    
    // Close chat
    if (closeChat && supportChat) {
      closeChat.addEventListener('click', () => {
        supportChat.style.display = 'none';
      });
    }
    
    // Minimize chat
    if (minimizeChat && supportChat) {
      minimizeChat.addEventListener('click', () => {
        supportChat.style.display = 'none';
      });
    }
    
    // Input events
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
  }

  handleSendMessage() {
    const chatInput = document.getElementById('chatInput');
    const chatMessages = document.getElementById('chatMessages');
    
    if (!chatInput || !chatMessages) return;
    
    const message = chatInput.value.trim();
    if (!message) return;
    
    // Add user message
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
    
    // Clear input
    chatInput.value = '';
    document.getElementById('sendMessage').disabled = true;
    
    // Generate AI response
    setTimeout(() => {
      this.generateAIResponse(message);
    }, 1000);
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  generateAIResponse(userMessage) {
    const chatMessages = document.getElementById('chatMessages');
    if (!chatMessages) return;
    
    let response = '';
    
    // Use AI if available
    if (window.RSCChainAI) {
      const ai = new RSCChainAI();
      response = ai.processMessage(userMessage);
    } else {
      // Fallback response
      response = this.getFallbackResponse(userMessage);
    }
    
    // Add AI response
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
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  getFallbackResponse(message) {
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

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  new ProductionChat();
});

// Export for global use
window.ProductionChat = ProductionChat; 