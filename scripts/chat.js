// ===== CHAT DE SOPORTE AVANZADO - RSC CHAIN =====

class AdvancedSupportChat {
  constructor() {
    this.isOpen = false;
    this.isMinimized = false;
    this.messages = [];
    this.currentCategory = null;
    this.typingTimeout = null;
    this.notificationTimeout = null;
    this.init();
  }

  init() {
    this.setupElements();
    this.setupEventListeners();
    this.loadChatHistory();
    this.setupAI();
  }

  setupElements() {
    this.chatContainer = document.getElementById('supportChat');
    this.chatToggle = document.getElementById('chatToggle');
    this.chatMessages = document.getElementById('chatMessages');
    this.chatInput = document.getElementById('chatInput');
    this.sendBtn = document.getElementById('sendMessage');
    this.minimizeBtn = document.getElementById('minimizeChat');
    this.closeBtn = document.getElementById('closeChat');
    this.typingIndicator = document.getElementById('typingIndicator');
    this.emojiPanel = document.getElementById('emojiPanel');
    this.emojiBtn = document.getElementById('emojiBtn');
    this.attachBtn = document.getElementById('attachFile');
    this.notification = document.getElementById('chatNotification');
    this.messageBadge = document.getElementById('messageBadge');
  }

  setupEventListeners() {
    // Toggle del chat
    this.chatToggle.addEventListener('click', () => {
      this.toggleChat();
    });

    // Controles del chat
    this.minimizeBtn.addEventListener('click', () => {
      this.toggleMinimize();
    });

    this.closeBtn.addEventListener('click', () => {
      this.closeChat();
    });

    // Envío de mensajes
    this.sendBtn.addEventListener('click', () => {
      this.sendMessage();
    });

    this.chatInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage();
      }
    });

    this.chatInput.addEventListener('input', () => {
      this.updateSendButton();
    });

    // Panel de emojis
    this.emojiBtn.addEventListener('click', () => {
      this.toggleEmojiPanel();
    });

    // Emojis
    document.querySelectorAll('.emoji').forEach(emoji => {
      emoji.addEventListener('click', () => {
        this.insertEmoji(emoji.dataset.emoji);
      });
    });

    // Categorías de soporte
    document.querySelectorAll('.category-card').forEach(card => {
      card.addEventListener('click', () => {
        this.selectCategory(card.dataset.category);
      });
    });

    // Cerrar emoji panel al hacer clic fuera
    document.addEventListener('click', (e) => {
      if (!this.emojiPanel.contains(e.target) && !this.emojiBtn.contains(e.target)) {
        this.hideEmojiPanel();
      }
    });

    // Adjuntar archivo
    this.attachBtn.addEventListener('click', () => {
      this.attachFile();
    });
  }

  setupAI() {
    this.aiResponses = {
      technical: {
        greeting: "🔧 Entiendo que tienes un problema técnico. Te ayudo a resolverlo.",
        questions: [
          "¿Qué tipo de error estás experimentando?",
          "¿En qué dispositivo/navegador ocurre?",
          "¿Has intentado refrescar la página?"
        ],
        solutions: [
          "Prueba limpiando el caché del navegador",
          "Verifica tu conexión a internet",
          "Contacta soporte si persiste el problema"
        ]
      },
      transactions: {
        greeting: "💰 Te ayudo con tu consulta sobre transacciones.",
        questions: [
          "¿Qué tipo de transacción necesitas realizar?",
          "¿Tienes tu wallet conectada?",
          "¿Cuál es el monto de la transacción?"
        ],
        solutions: [
          "Verifica que tienes suficientes RSC",
          "Confirma la dirección de destino",
          "Revisa la comisión de red"
        ]
      },
      mining: {
        greeting: "⛏️ Configuración de minería RSC Chain.",
        questions: [
          "¿Qué hardware estás usando?",
          "¿Ya tienes el software instalado?",
          "¿Cuál es tu hashrate actual?"
        ],
        solutions: [
          "Descarga el minero oficial de RSC",
          "Configura tu pool de minería",
          "Optimiza tu GPU para máximo rendimiento"
        ]
      },
      staking: {
        greeting: "🔒 Delegación y staking en RSC Chain.",
        questions: [
          "¿Cuántos RSC quieres stakear?",
          "¿Ya tienes tu wallet configurada?",
          "¿Conoces el período de lock?"
        ],
        solutions: [
          "Conecta tu wallet a la plataforma",
          "Selecciona un validador confiable",
          "Confirma la delegación"
        ]
      },
      p2p: {
        greeting: "💱 Trading P2P descentralizado.",
        questions: [
          "¿Qué par quieres intercambiar?",
          "¿Prefieres comprar o vender?",
          "¿Tienes experiencia en P2P?"
        ],
        solutions: [
          "Crea una orden en el marketplace",
          "Negocia directamente con otros usuarios",
          "Usa el escrow para seguridad"
        ]
      },
      wallet: {
        greeting: "💼 Configuración y seguridad de wallet.",
        questions: [
          "¿Ya tienes una wallet creada?",
          "¿Has guardado tu seed phrase?",
          "¿Quieres configurar 2FA?"
        ],
        solutions: [
          "Guarda tu seed phrase en lugar seguro",
          "Activa la autenticación de dos factores",
          "Nunca compartas tus claves privadas"
        ]
      }
    };
  }

  toggleChat() {
    this.isOpen = !this.isOpen;
    
    if (this.isOpen) {
      this.openChat();
    } else {
      this.closeChat();
    }
  }

  openChat() {
    this.chatContainer.classList.add('active');
    document.querySelector('.chat-overlay').classList.add('active');
    this.chatInput.focus();
    this.hideNotification();
    this.resetBadge();
  }

  closeChat() {
    this.chatContainer.classList.remove('active');
    document.querySelector('.chat-overlay').classList.remove('active');
    this.hideEmojiPanel();
  }

  toggleMinimize() {
    this.isMinimized = !this.isMinimized;
    this.chatContainer.classList.toggle('minimized', this.isMinimized);
    
    if (this.isMinimized) {
      this.minimizeBtn.querySelector('.btn-icon').textContent = '□';
    } else {
      this.minimizeBtn.querySelector('.btn-icon').textContent = '−';
    }
  }

  sendMessage() {
    const message = this.chatInput.value.trim();
    if (!message) return;

    // Agregar mensaje del usuario
    this.addMessage(message, 'user');
    this.chatInput.value = '';
    this.updateSendButton();

    // Simular respuesta de IA
    this.simulateTyping();
    
    setTimeout(() => {
      this.generateAIResponse(message);
    }, 1500);
  }

  addMessage(content, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    
    const timestamp = new Date().toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });

    if (sender === 'user') {
      messageDiv.innerHTML = `
        <div class="message-content">
          <div class="message-bubble">
            <div class="message-text">
              <p>${this.escapeHtml(content)}</p>
            </div>
            <div class="message-time">${timestamp}</div>
          </div>
        </div>
        <div class="message-avatar">
          <div class="avatar-icon">👤</div>
        </div>
      `;
    } else {
      messageDiv.innerHTML = `
        <div class="message-avatar">
          <div class="avatar-icon">🤖</div>
        </div>
        <div class="message-content">
          <div class="message-bubble">
            <div class="message-text">
              ${content}
            </div>
            <div class="message-time">${timestamp}</div>
          </div>
        </div>
      `;
    }

    this.chatMessages.appendChild(messageDiv);
    this.scrollToBottom();
    
    // Guardar en historial
    this.messages.push({ content, sender, timestamp });
    this.saveChatHistory();
  }

  generateAIResponse(userMessage) {
    // Usar la IA avanzada si está disponible
    if (window.RSCChainAI) {
      const ai = new RSCChainAI();
      const response = ai.processMessage(userMessage);
      this.addMessage(response, 'assistant');
      return;
    }
    
    // Fallback a respuestas básicas si la IA no está disponible
    const lowerMessage = userMessage.toLowerCase();
    let response = '';

    // Detectar categoría basada en palabras clave
    if (lowerMessage.includes('error') || lowerMessage.includes('problema') || lowerMessage.includes('bug')) {
      response = this.generateCategoryResponse('technical');
    } else if (lowerMessage.includes('transacción') || lowerMessage.includes('pago') || lowerMessage.includes('transferencia')) {
      response = this.generateCategoryResponse('transactions');
    } else if (lowerMessage.includes('minería') || lowerMessage.includes('minar') || lowerMessage.includes('hashrate')) {
      response = this.generateCategoryResponse('mining');
    } else if (lowerMessage.includes('staking') || lowerMessage.includes('delegación') || lowerMessage.includes('recompensa')) {
      response = this.generateCategoryResponse('staking');
    } else if (lowerMessage.includes('p2p') || lowerMessage.includes('trading') || lowerMessage.includes('intercambio')) {
      response = this.generateCategoryResponse('p2p');
    } else if (lowerMessage.includes('wallet') || lowerMessage.includes('cartera') || lowerMessage.includes('seguridad')) {
      response = this.generateCategoryResponse('wallet');
    } else {
      response = this.generateGeneralResponse();
    }

    this.addMessage(response, 'assistant');
  }

  generateCategoryResponse(category) {
    const responses = this.aiResponses[category];
    const greeting = responses.greeting;
    const randomQuestion = responses.questions[Math.floor(Math.random() * responses.questions.length)];
    const randomSolution = responses.solutions[Math.floor(Math.random() * responses.solutions.length)];

    return `
      <p>${greeting}</p>
      <p><strong>Pregunta:</strong> ${randomQuestion}</p>
      <p><strong>Solución:</strong> ${randomSolution}</p>
      <p>¿Necesitas ayuda con algo más específico?</p>
    `;
  }

  generateGeneralResponse() {
    const responses = [
      "Entiendo tu consulta. ¿Podrías ser más específico sobre qué necesitas ayuda?",
      "Te ayudo con eso. ¿En qué área específica de RSC Chain necesitas soporte?",
      "Perfecto, estoy aquí para ayudarte. ¿Qué aspecto de la blockchain te interesa?",
      "Excelente pregunta. ¿Te gustaría que profundice en algún tema en particular?"
    ];

    return responses[Math.floor(Math.random() * responses.length)];
  }

  selectCategory(category) {
    this.currentCategory = category;
    const responses = this.aiResponses[category];
    
    this.simulateTyping();
    
    setTimeout(() => {
      const response = `
        <p>${responses.greeting}</p>
        <p>Te puedo ayudar con:</p>
        <ul>
          ${responses.questions.map(q => `<li>${q}</li>`).join('')}
        </ul>
        <p>¿Cuál de estos puntos te interesa más?</p>
      `;
      
      this.addMessage(response, 'assistant');
    }, 1000);
  }

  simulateTyping() {
    this.typingIndicator.classList.add('show');
    
    if (this.typingTimeout) {
      clearTimeout(this.typingTimeout);
    }
    
    this.typingTimeout = setTimeout(() => {
      this.typingIndicator.classList.remove('show');
    }, 2000);
  }

  updateSendButton() {
    const hasText = this.chatInput.value.trim().length > 0;
    this.sendBtn.disabled = !hasText;
    
    if (hasText) {
      this.sendBtn.style.opacity = '1';
    } else {
      this.sendBtn.style.opacity = '0.5';
    }
  }

  toggleEmojiPanel() {
    this.emojiPanel.classList.toggle('show');
  }

  hideEmojiPanel() {
    this.emojiPanel.classList.remove('show');
  }

  insertEmoji(emoji) {
    const cursorPos = this.chatInput.selectionStart;
    const textBefore = this.chatInput.value.substring(0, cursorPos);
    const textAfter = this.chatInput.value.substring(cursorPos);
    
    this.chatInput.value = textBefore + emoji + textAfter;
    this.chatInput.focus();
    this.chatInput.setSelectionRange(cursorPos + emoji.length, cursorPos + emoji.length);
    
    this.updateSendButton();
    this.hideEmojiPanel();
  }

  attachFile() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*,.pdf,.txt';
    
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        this.addMessage(`📎 Archivo adjunto: ${file.name}`, 'user');
        
        // Simular procesamiento
        setTimeout(() => {
          this.addMessage('He recibido tu archivo. Lo estoy analizando para darte la mejor ayuda posible.', 'assistant');
        }, 1000);
      }
    };
    
    input.click();
  }

  showNotification() {
    this.notification.classList.add('show');
    
    if (this.notificationTimeout) {
      clearTimeout(this.notificationTimeout);
    }
    
    this.notificationTimeout = setTimeout(() => {
      this.hideNotification();
    }, 5000);
  }

  hideNotification() {
    this.notification.classList.remove('show');
  }

  updateBadge(count) {
    this.messageBadge.textContent = count;
    this.messageBadge.classList.add('show');
  }

  resetBadge() {
    this.messageBadge.classList.remove('show');
  }

  scrollToBottom() {
    this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  saveChatHistory() {
    localStorage.setItem('rsc_chat_history', JSON.stringify(this.messages));
  }

  loadChatHistory() {
    const history = localStorage.getItem('rsc_chat_history');
    if (history) {
      this.messages = JSON.parse(history);
    }
  }

  // Simular notificaciones automáticas
  startAutoNotifications() {
    setInterval(() => {
      if (!this.isOpen && Math.random() < 0.1) {
        this.showNotification();
        this.updateBadge(1);
      }
    }, 30000); // Cada 30 segundos
  }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  window.chatManager = new AdvancedSupportChat();
  window.chatManager.startAutoNotifications();
}); 