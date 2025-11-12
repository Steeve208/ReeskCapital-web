// ===== CHATBOT DE ATENCIÓN RSC CHAIN =====
class RSCChatbot {
  constructor() {
    this.button = document.getElementById('chatbotButton');
    this.window = document.getElementById('chatbotWindow');
    this.closeBtn = document.getElementById('chatbotClose');
    this.messagesContainer = document.getElementById('chatbotMessages');
    this.input = document.getElementById('chatbotInput');
    this.sendBtn = document.getElementById('chatbotSend');
    this.welcome = document.getElementById('chatbotWelcome');
    
    this.isOpen = false;
    this.isTyping = false;
    this.sessionId = this.generateSessionId();
    this.apiUrl = this.getApiUrl();
    this.needsContactInfo = false;
    
    this.init();
  }
  
  generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }
  
  getApiUrl() {
    // En desarrollo: http://localhost:5000
    // En producción: ajustar según tu configuración
    const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    return isDevelopment 
      ? 'http://localhost:5000/api/chatbot'
      : '/api/chatbot';  // Asume que el backend está en el mismo dominio o usa proxy
  }
  
  init() {
    // Event listeners
    this.button.addEventListener('click', () => this.toggleChat());
    this.closeBtn.addEventListener('click', () => this.closeChat());
    this.sendBtn.addEventListener('click', () => this.sendMessage());
    
    // Enviar con Enter (Shift+Enter para nueva línea)
    this.input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage();
      }
    });
    
    // Auto-resize textarea
    this.input.addEventListener('input', () => {
      this.input.style.height = 'auto';
      this.input.style.height = Math.min(this.input.scrollHeight, 120) + 'px';
    });
    
    // Cerrar al hacer clic fuera (opcional)
    document.addEventListener('click', (e) => {
      if (this.isOpen && 
          !this.window.contains(e.target) && 
          !this.button.contains(e.target)) {
        // Desactivado por defecto - descomentar si se quiere
        // this.closeChat();
      }
    });
    
    console.log('✅ RSC Chatbot inicializado');
  }
  
  toggleChat() {
    if (this.isOpen) {
      this.closeChat();
    } else {
      this.openChat();
    }
  }
  
  openChat() {
    this.isOpen = true;
    this.window.classList.add('active');
    this.button.classList.add('chat-open');
    this.input.focus();
    
    // Scroll al final
    setTimeout(() => {
      this.scrollToBottom();
    }, 100);
  }
  
  closeChat() {
    this.isOpen = false;
    this.window.classList.remove('active');
    this.button.classList.remove('chat-open');
  }
  
  async sendMessage() {
    const message = this.input.value.trim();
    
    if (!message || this.isTyping) return;
    
    // Ocultar welcome message
    if (this.welcome) {
      this.welcome.style.display = 'none';
    }
    
    // Agregar mensaje del usuario
    this.addMessage(message, 'user');
    
    // Limpiar input
    this.input.value = '';
    this.input.style.height = 'auto';
    
    // Scroll al final
    this.scrollToBottom();
    
    // Mostrar indicador de escritura
    this.showTypingIndicator();
    
    try {
      // Obtener email y username si están disponibles (desde localStorage o sistema de auth)
      const userEmail = localStorage.getItem('user_email') || '';
      const username = localStorage.getItem('username') || '';
      
      // Llamar al backend
      const response = await fetch(`${this.apiUrl}/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: message,
          session_id: this.sessionId,
          user_email: userEmail,
          username: username
        })
      });
      
      const data = await response.json();
      
      // Ocultar indicador de escritura
      this.hideTypingIndicator();
      
      if (data.success) {
        // Agregar respuesta del bot
        this.addMessage(data.message, 'bot');
        
        // Verificar si necesita información de contacto
        if (data.needs_contact_info) {
          this.needsContactInfo = true;
        }
      } else {
        // Error del backend, usar fallback local
        this.addMessage('⚠️ Hubo un problema al procesar tu mensaje. Por favor, intenta nuevamente o contacta directamente a support@rscchain.com', 'bot');
      }
    } catch (error) {
      console.error('Error comunicándose con el backend:', error);
      
      // Fallback: usar respuesta local si el backend no está disponible
      this.hideTypingIndicator();
      
      // Intentar respuesta básica local
      const fallbackResponse = this.generateFallbackResponse(message);
      this.addMessage(fallbackResponse, 'bot');
      
      // Mostrar mensaje informativo
      setTimeout(() => {
        this.addMessage('💡 Nota: Estoy funcionando en modo limitado. Para soporte completo, asegúrate de que el backend del chatbot esté ejecutándose.', 'bot');
      }, 1000);
    }
  }
  
  generateFallbackResponse(message) {
    // Respuestas básicas cuando el backend no está disponible
    const msg = message.toLowerCase();
    
    if (msg.includes('minar') || msg.includes('mining')) {
      return 'Para minar RSC, ve a la página de Mining y haz clic en "Iniciar Minería". Cada sesión dura 24 horas y es completamente automática.';
    }
    
    if (msg.includes('wallet') || msg.includes('cartera')) {
      return 'Para crear una wallet, ve a la página de Wallet y haz clic en "Crear Wallet". Asegúrate de guardar tu clave privada en un lugar seguro.';
    }
    
    if (msg.includes('staking') || msg.includes('stake')) {
      return 'El staking te permite delegar tus tokens RSC a validadores y ganar recompensas pasivas. Ve a la página de Staking para más información.';
    }
    
    return 'Entiendo tu pregunta. Actualmente estoy en modo limitado. Para asistencia completa, por favor contacta a support@rscchain.com o asegúrate de que el backend del chatbot esté ejecutándose.';
  }
  
  addMessage(text, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `chatbot-message ${type}`;
    
    const avatar = document.createElement('div');
    avatar.className = 'chatbot-message-avatar';
    avatar.innerHTML = type === 'bot' 
      ? '<i class="fas fa-robot"></i>' 
      : '<i class="fas fa-user"></i>';
    
    const content = document.createElement('div');
    content.className = 'chatbot-message-content';
    content.textContent = text;
    
    const time = document.createElement('div');
    time.className = 'chatbot-message-time';
    time.textContent = new Date().toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    
    messageDiv.appendChild(avatar);
    messageDiv.appendChild(content);
    content.appendChild(time);
    
    this.messagesContainer.appendChild(messageDiv);
    this.scrollToBottom();
  }
  
  showTypingIndicator() {
    this.isTyping = true;
    const typingDiv = document.createElement('div');
    typingDiv.className = 'chatbot-message bot';
    typingDiv.id = 'typingIndicator';
    
    typingDiv.innerHTML = `
      <div class="chatbot-message-avatar">
        <i class="fas fa-robot"></i>
      </div>
      <div class="chatbot-typing">
        <div class="chatbot-typing-dot"></div>
        <div class="chatbot-typing-dot"></div>
        <div class="chatbot-typing-dot"></div>
      </div>
    `;
    
    this.messagesContainer.appendChild(typingDiv);
    this.scrollToBottom();
  }
  
  hideTypingIndicator() {
    const indicator = document.getElementById('typingIndicator');
    if (indicator) {
      indicator.remove();
    }
    this.isTyping = false;
  }
  
  scrollToBottom() {
    this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
  }
  
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  window.rscChatbot = new RSCChatbot();
});

