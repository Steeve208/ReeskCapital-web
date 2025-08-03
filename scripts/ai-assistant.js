// ===== IA ASISTENTE AVANZADA - RSC CHAIN =====
// Sistema de inteligencia artificial para soporte completo

class RSCChainAI {
  constructor() {
    this.knowledge = this.initializeKnowledge();
    this.conversationContext = [];
    this.userPreferences = {};
    this.currentSession = {
      startTime: new Date(),
      messages: [],
      userLevel: 'beginner', // beginner, intermediate, advanced
      interests: [],
      lastActivity: new Date()
    };
  }

  initializeKnowledge() {
    return {
      // Conocimiento general de RSC Chain
      platform: {
        name: "RSC Chain",
        description: "Blockchain revolucionaria sin bancos, sin fronteras, sin permiso",
        features: [
          "Minería web desde el navegador",
          "Wallet descentralizada",
          "P2P sin KYC",
          "Staking avanzado",
          "Explorer de blockchain",
          "RSC Bank (próximamente)",
          "Pagos sin contacto (próximamente)"
        ],
        values: [
          "Privacidad total",
          "Libertad financiera",
          "Acceso global",
          "Sin intermediarios"
        ]
      },

      // Funcionalidades específicas
      features: {
        mining: {
          name: "Minería Web",
          description: "Minar RSC directamente desde tu navegador",
          benefits: [
            "No necesitas hardware especializado",
            "Minería eficiente con CPU/GPU",
            "Recompensas automáticas",
            "Configuración simple"
          ],
          setup: [
            "1. Ve a la sección 'Minar'",
            "2. Conecta tu wallet",
            "3. Ajusta la intensidad de minería",
            "4. ¡Comienza a minar!"
          ],
          tips: [
            "Usa Chrome o Firefox para mejor rendimiento",
            "Ajusta la intensidad según tu dispositivo",
            "Mantén la pestaña abierta para minar",
            "Las recompensas se pagan automáticamente"
          ]
        },

        wallet: {
          name: "Wallet RSC",
          description: "Wallet descentralizada para gestionar tus RSC",
          features: [
            "Crear/importar wallets",
            "Enviar/recibir RSC",
            "Ver historial de transacciones",
            "Backup seguro",
            "Múltiples direcciones"
          ],
          security: [
            "Llaves privadas encriptadas",
            "Backup automático",
            "Verificación de transacciones",
            "Protección contra phishing"
          ]
        },

        p2p: {
          name: "P2P Trading",
          description: "Intercambio directo sin intermediarios",
          features: [
            "Crear/responder anuncios",
            "Chat integrado",
            "Escrow automático",
            "Sin KYC requerido",
            "Múltiples métodos de pago"
          ],
          safety: [
            "Siempre usa el escrow",
            "Verifica la reputación del vendedor",
            "No compartas información personal",
            "Confirma la recepción antes de liberar"
          ]
        },

        staking: {
          name: "Staking Avanzado",
          description: "Gana recompensas bloqueando tus RSC",
          benefits: [
            "Rendimientos del 8-15% anual",
            "Liquidez flexible",
            "Recompensas automáticas",
            "Sin lock-in obligatorio"
          ],
          strategies: [
            "Staking a corto plazo: 1-3 meses",
            "Staking a largo plazo: 6-12 meses",
            "Staking flexible: retiros inmediatos",
            "Staking delegado: participación en red"
          ]
        },

        explorer: {
          name: "Block Explorer",
          description: "Explorador de transacciones y bloques",
          features: [
            "Buscar transacciones por hash",
            "Ver bloques en tiempo real",
            "Estadísticas de red",
            "Gráficos de actividad",
            "Información de direcciones"
          ]
        },

        bank: {
          name: "RSC Bank",
          description: "Banca descentralizada (próximamente)",
          features: [
            "Pagos por QR",
            "Conversión automática de monedas",
            "Pagos sin contacto",
            "Historial bancario",
            "Métodos de pago múltiples"
          ],
          status: "En desarrollo - Disponible próximamente"
        }
      },

      // Problemas comunes y soluciones
      troubleshooting: {
        mining: {
          "No puedo minar": [
            "Verifica que tu navegador soporte WebAssembly",
            "Asegúrate de tener una wallet conectada",
            "Intenta refrescar la página",
            "Revisa que no tengas bloqueadores de scripts"
          ],
          "Minería lenta": [
            "Reduce la intensidad de minería",
            "Cierra otras pestañas del navegador",
            "Verifica tu conexión a internet",
            "Considera usar un navegador más potente"
          ],
          "No recibo recompensas": [
            "Las recompensas se pagan cada 24 horas",
            "Verifica tu dirección de wallet",
            "Asegúrate de haber minado al menos 1 hora",
            "Contacta soporte si pasan más de 48 horas"
          ]
        },

        wallet: {
          "No puedo crear wallet": [
            "Asegúrate de tener una conexión estable",
            "Verifica que tu navegador esté actualizado",
            "Intenta en modo incógnito",
            "Limpia la caché del navegador"
          ],
          "Perdí mi wallet": [
            "Usa tu frase de recuperación",
            "Importa tu wallet con las llaves privadas",
            "Si no tienes backup, contacta soporte inmediatamente",
            "Nunca compartas tus llaves privadas"
          ],
          "Transacción fallida": [
            "Verifica que tienes suficientes RSC",
            "Asegúrate de incluir la fee de red",
            "Verifica la dirección de destino",
            "Espera confirmaciones de la red"
          ]
        },

        p2p: {
          "No puedo crear anuncio": [
            "Verifica que tu wallet esté conectada",
            "Asegúrate de tener RSC para la fee",
            "Completa todos los campos requeridos",
            "Verifica que el precio sea razonable"
          ],
          "Problema con el escrow": [
            "El escrow se libera automáticamente",
            "Verifica que ambas partes confirmen",
            "Contacta soporte si hay disputa",
            "Nunca liberes sin confirmar recepción"
          ]
        },

        staking: {
          "No puedo hacer staking": [
            "Verifica que tienes RSC disponibles",
            "Asegúrate de tener suficiente para el mínimo",
            "Verifica que tu wallet esté conectada",
            "Espera confirmaciones de la red"
          ],
          "No veo recompensas": [
            "Las recompensas se pagan cada 24 horas",
            "Verifica tu dirección de staking",
            "Asegúrate de que el staking esté activo",
            "Revisa el historial de recompensas"
          ]
        }
      },

      // Guías paso a paso
      guides: {
        "Primera vez": [
          "1. Crea una wallet en la sección 'Wallet'",
          "2. Guarda tu frase de recuperación de forma segura",
          "3. Ve a 'Minar' y conecta tu wallet",
          "4. Ajusta la intensidad y comienza a minar",
          "5. Explora P2P para intercambiar RSC",
          "6. Considera hacer staking para ganar más"
        ],
        "Seguridad": [
          "1. Nunca compartas tus llaves privadas",
          "2. Usa contraseñas fuertes",
          "3. Habilita autenticación de dos factores",
          "4. Mantén backups seguros",
          "5. Verifica siempre las direcciones",
          "6. Usa solo sitios oficiales"
        ],
        "Optimización": [
          "1. Usa navegadores actualizados",
          "2. Mantén tu sistema optimizado",
          "3. Usa conexiones estables",
          "4. Monitorea el rendimiento",
          "5. Ajusta configuraciones según tu hardware"
        ]
      },

      // Respuestas inteligentes
      responses: {
        greetings: [
          "¡Hola! Soy tu asistente de RSC Chain. ¿En qué puedo ayudarte hoy?",
          "¡Bienvenido a RSC Chain! ¿Qué te gustaría saber sobre nuestra plataforma?",
          "Hola, soy tu guía personal de RSC Chain. ¿Qué te interesa explorar?"
        ],
        help: [
          "Estoy aquí para ayudarte con cualquier aspecto de RSC Chain. ¿Qué necesitas?",
          "Puedo ayudarte con minería, wallet, P2P, staking y más. ¿Qué te interesa?",
          "Cuéntame qué quieres hacer y te guío paso a paso."
        ],
        thanks: [
          "¡De nada! Estoy aquí para ayudarte siempre que lo necesites.",
          "Me alegra haber podido ayudarte. ¡Que tengas un excelente día!",
          "¡Un placer! Recuerda que puedes volver cuando quieras."
        ]
      }
    };
  }

  // Procesar mensaje del usuario
  processMessage(userMessage) {
    const lowerMessage = userMessage.toLowerCase();
    this.updateSession(userMessage);
    
    // Detectar intención del usuario
    const intent = this.detectIntent(lowerMessage);
    const response = this.generateResponse(intent, userMessage);
    
    // Guardar en contexto
    this.conversationContext.push({
      user: userMessage,
      ai: response,
      timestamp: new Date(),
      intent: intent
    });
    
    return response;
  }

  // Detectar intención del usuario
  detectIntent(message) {
    if (this.containsAny(message, ['hola', 'hello', 'hi', 'buenos días', 'buenas'])) {
      return 'greeting';
    }
    
    if (this.containsAny(message, ['gracias', 'thanks', 'thank you'])) {
      return 'thanks';
    }
    
    if (this.containsAny(message, ['ayuda', 'help', 'soporte', 'support'])) {
      return 'help';
    }
    
    if (this.containsAny(message, ['minar', 'mining', 'minero', 'miner'])) {
      return 'mining';
    }
    
    if (this.containsAny(message, ['wallet', 'cartera', 'dirección', 'address'])) {
      return 'wallet';
    }
    
    if (this.containsAny(message, ['p2p', 'trading', 'intercambio', 'compra', 'venta'])) {
      return 'p2p';
    }
    
    if (this.containsAny(message, ['staking', 'stake', 'bloquear', 'recompensas'])) {
      return 'staking';
    }
    
    if (this.containsAny(message, ['explorer', 'explorador', 'transacciones', 'bloques'])) {
      return 'explorer';
    }
    
    if (this.containsAny(message, ['bank', 'banco', 'pagos', 'qr'])) {
      return 'bank';
    }
    
    if (this.containsAny(message, ['problema', 'error', 'bug', 'no funciona', 'falla'])) {
      return 'troubleshooting';
    }
    
    if (this.containsAny(message, ['cómo', 'how', 'tutorial', 'guía', 'pasos'])) {
      return 'guide';
    }
    
    if (this.containsAny(message, ['seguridad', 'security', 'seguro', 'safe'])) {
      return 'security';
    }
    
    if (this.containsAny(message, ['precio', 'price', 'valor', 'value', 'cotización'])) {
      return 'price';
    }
    
    return 'general';
  }

  // Generar respuesta inteligente
  generateResponse(intent, originalMessage) {
    switch (intent) {
      case 'greeting':
        return this.getRandomResponse('greetings') + this.getContextualInfo();
        
      case 'thanks':
        return this.getRandomResponse('thanks');
        
      case 'help':
        return this.generateHelpResponse();
        
      case 'mining':
        return this.generateMiningResponse(originalMessage);
        
      case 'wallet':
        return this.generateWalletResponse(originalMessage);
        
      case 'p2p':
        return this.generateP2PResponse(originalMessage);
        
      case 'staking':
        return this.generateStakingResponse(originalMessage);
        
      case 'explorer':
        return this.generateExplorerResponse(originalMessage);
        
      case 'bank':
        return this.generateBankResponse(originalMessage);
        
      case 'troubleshooting':
        return this.generateTroubleshootingResponse(originalMessage);
        
      case 'guide':
        return this.generateGuideResponse(originalMessage);
        
      case 'security':
        return this.generateSecurityResponse(originalMessage);
        
      case 'price':
        return this.generatePriceResponse(originalMessage);
        
      default:
        return this.generateGeneralResponse(originalMessage);
    }
  }

  // Respuestas específicas por funcionalidad
  generateMiningResponse(message) {
    const mining = this.knowledge.features.mining;
    
    if (this.containsAny(message, ['cómo', 'how', 'empezar', 'comenzar'])) {
      return `🚀 **Cómo empezar a minar RSC:**
      
${mining.setup.join('\n')}

**💡 Consejos importantes:**
${mining.tips.join('\n')}

**🎯 Beneficios:**
${mining.benefits.join('\n')}

¿Te gustaría que te ayude con algún paso específico?`;
    }
    
    if (this.containsAny(message, ['problema', 'error', 'no funciona'])) {
      return this.getTroubleshootingResponse('mining', message);
    }
    
    return `⛏️ **Minería Web RSC Chain**
    
${mining.description}

**Beneficios principales:**
${mining.benefits.join('\n')}

**¿Qué necesitas saber específicamente sobre minería?**`;
  }

  generateWalletResponse(message) {
    const wallet = this.knowledge.features.wallet;
    
    if (this.containsAny(message, ['crear', 'nueva', 'crear wallet'])) {
      return `💼 **Crear tu Wallet RSC:**
      
1. Ve a la sección "Wallet"
2. Haz clic en "Crear Nueva Wallet"
3. Guarda tu frase de recuperación de forma segura
4. Establece una contraseña fuerte
5. Confirma la creación

**🔒 Seguridad:**
${wallet.security.join('\n')}

¿Necesitas ayuda con algún paso?`;
    }
    
    if (this.containsAny(message, ['seguridad', 'seguro', 'backup'])) {
      return `🔒 **Seguridad de Wallet:**
      
${wallet.security.join('\n')}

**Consejos adicionales:**
• Nunca compartas tus llaves privadas
• Usa contraseñas únicas y fuertes
• Mantén backups en múltiples ubicaciones
• Verifica siempre las direcciones antes de enviar

¿Tienes alguna pregunta específica sobre seguridad?`;
    }
    
    return `💼 **Wallet RSC Chain**
    
${wallet.description}

**Funcionalidades:**
${wallet.features.join('\n')}

**¿Qué te gustaría hacer con tu wallet?**`;
  }

  generateP2PResponse(message) {
    const p2p = this.knowledge.features.p2p;
    
    if (this.containsAny(message, ['crear', 'anuncio', 'vender', 'comprar'])) {
      return `🔄 **Crear Anuncio P2P:**
      
1. Ve a la sección "P2P"
2. Haz clic en "Crear Anuncio"
3. Selecciona tipo (Compra/Venta)
4. Establece precio y cantidad
5. Elige métodos de pago
6. Publica tu anuncio

**⚠️ Seguridad P2P:**
${p2p.safety.join('\n')}

¿Necesitas ayuda con algún paso?`;
    }
    
    return `🔄 **P2P Trading RSC Chain**
    
${p2p.description}

**Características:**
${p2p.features.join('\n')}

**¿Quieres crear un anuncio o buscar ofertas?**`;
  }

  generateStakingResponse(message) {
    const staking = this.knowledge.features.staking;
    
    if (this.containsAny(message, ['cómo', 'empezar', 'hacer staking'])) {
      return `🔒 **Cómo hacer Staking:**
      
1. Ve a la sección "Staking"
2. Conecta tu wallet
3. Selecciona cantidad a stakear
4. Elige período de staking
5. Confirma la transacción
6. ¡Comienza a ganar recompensas!

**📈 Estrategias:**
${staking.strategies.join('\n')}

¿Te gustaría que te explique alguna estrategia específica?`;
    }
    
    return `🔒 **Staking Avanzado RSC Chain**
    
${staking.description}

**Beneficios:**
${staking.benefits.join('\n')}

**¿Quieres empezar a hacer staking?**`;
  }

  generateExplorerResponse(message) {
    const explorer = this.knowledge.features.explorer;
    
    return `🔍 **Block Explorer RSC Chain**
    
${explorer.description}

**Funcionalidades:**
${explorer.features.join('\n')}

**Para usar el explorer:**
1. Ve a la sección "Explorer"
2. Busca transacciones por hash
3. Explora bloques en tiempo real
4. Revisa estadísticas de red

¿Qué te gustaría explorar?`;
  }

  generateBankResponse(message) {
    const bank = this.knowledge.features.bank;
    
    return `🏦 **RSC Bank - Próximamente**
    
${bank.description}

**Funcionalidades que vendrán:**
${bank.features.join('\n')}

**Estado actual:** ${bank.status}

**¿Te interesa saber más sobre las futuras funcionalidades bancarias?**`;
  }

  generateTroubleshootingResponse(message) {
    const category = this.detectTroubleshootingCategory(message);
    const solutions = this.knowledge.troubleshooting[category];
    
    if (solutions) {
      return `🔧 **Soluciones para tu problema:**
      
${solutions.join('\n')}

**Si el problema persiste:**
• Refresca la página
• Limpia la caché del navegador
• Intenta en modo incógnito
• Contacta soporte técnico

¿Alguna de estas soluciones te ayudó?`;
    }
    
    return `🔧 **Soporte Técnico**
    
Para ayudarte mejor, ¿podrías describir el problema específico que estás experimentando?

**Categorías de problemas comunes:**
• Minería
• Wallet
• P2P Trading
• Staking
• Transacciones

¿En qué sección estás teniendo problemas?`;
  }

  generateGuideResponse(message) {
    if (this.containsAny(message, ['primera vez', 'empezar', 'beginner'])) {
      return `🎯 **Guía para Principiantes:**
      
${this.knowledge.guides['Primera vez'].join('\n')}

**¿En qué paso necesitas ayuda específica?**`;
    }
    
    if (this.containsAny(message, ['seguridad', 'security'])) {
      return `🔒 **Guía de Seguridad:**
      
${this.knowledge.guides['Seguridad'].join('\n')}

**¿Tienes alguna pregunta sobre seguridad específica?**`;
    }
    
    return `📚 **Guías Disponibles:**
      
• **Primera vez**: Cómo empezar con RSC Chain
• **Seguridad**: Protege tu wallet y fondos
• **Optimización**: Mejora el rendimiento

¿Qué guía te interesa más?`;
  }

  generateSecurityResponse(message) {
    return `🔒 **Seguridad en RSC Chain**
    
**Principios fundamentales:**
• Nunca compartas tus llaves privadas
• Usa contraseñas únicas y fuertes
• Verifica siempre las direcciones
• Mantén backups seguros
• Usa solo sitios oficiales

**Protecciones integradas:**
• Encriptación de extremo a extremo
• Verificación de transacciones
• Protección contra phishing
• Backup automático

¿Tienes alguna preocupación específica sobre seguridad?`;
  }

  generatePriceResponse(message) {
    return `💰 **Información de Precio RSC**
    
**Para obtener el precio actual:**
• Revisa el explorer de la blockchain
• Consulta exchanges de confianza
• Usa el P2P para ver precios del mercado

**Factores que afectan el precio:**
• Demanda de la red
• Actividad de minería
• Adopción de la plataforma
• Condiciones del mercado

**Nota:** Los precios pueden variar según el exchange y la liquidez.

¿Te interesa saber más sobre el trading de RSC?`;
  }

  generateHelpResponse() {
    return `🤖 **¿En qué puedo ayudarte?**
    
**Funcionalidades principales:**
• ⛏️ **Minería**: Minar RSC desde tu navegador
• 💼 **Wallet**: Gestionar tus RSC de forma segura
• 🔄 **P2P**: Intercambiar sin intermediarios
• 🔒 **Staking**: Ganar recompensas bloqueando RSC
• 🔍 **Explorer**: Explorar transacciones y bloques
• 🏦 **Bank**: Banca descentralizada (próximamente)

**También puedo ayudarte con:**
• 🔧 Problemas técnicos
• 📚 Guías paso a paso
• 🔒 Seguridad
• 💰 Información de precios

**¿Qué te interesa explorar?**`;
  }

  generateGeneralResponse(message) {
    return `🤖 **Asistente RSC Chain**
    
No estoy seguro de qué necesitas específicamente. Te puedo ayudar con:

**Funcionalidades:**
• Minería web
• Wallet descentralizada
• P2P trading
• Staking
• Explorer
• RSC Bank (próximamente)

**Soporte:**
• Problemas técnicos
• Guías paso a paso
• Seguridad
• Información general

**¿Podrías ser más específico sobre lo que necesitas?**`;
  }

  // Utilidades
  containsAny(text, keywords) {
    return keywords.some(keyword => text.includes(keyword));
  }

  getRandomResponse(type) {
    const responses = this.knowledge.responses[type];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  getContextualInfo() {
    const time = new Date().getHours();
    let greeting = '';
    
    if (time < 12) greeting = ' ¡Buenos días!';
    else if (time < 18) greeting = ' ¡Buenas tardes!';
    else greeting = ' ¡Buenas noches!';
    
    return greeting;
  }

  detectTroubleshootingCategory(message) {
    if (this.containsAny(message, ['minar', 'mining', 'minero'])) return 'mining';
    if (this.containsAny(message, ['wallet', 'cartera'])) return 'wallet';
    if (this.containsAny(message, ['p2p', 'trading'])) return 'p2p';
    if (this.containsAny(message, ['staking', 'stake'])) return 'staking';
    return 'general';
  }

  getTroubleshootingResponse(category, message) {
    const problems = this.knowledge.troubleshooting[category];
    if (!problems) return this.generateGeneralResponse(message);
    
    // Buscar problema específico
    for (const [problem, solutions] of Object.entries(problems)) {
      if (this.containsAny(message, problem.toLowerCase().split(' '))) {
        return `🔧 **Solución para "${problem}":**
        
${solutions.join('\n')}

¿Alguna de estas soluciones te ayudó?`;
      }
    }
    
    return `🔧 **Problemas comunes de ${category}:**
    
${Object.keys(problems).join('\n')}

¿Cuál de estos problemas estás experimentando?`;
  }

  updateSession(message) {
    this.currentSession.messages.push({
      content: message,
      timestamp: new Date()
    });
    this.currentSession.lastActivity = new Date();
    
    // Detectar nivel del usuario
    this.detectUserLevel(message);
  }

  detectUserLevel(message) {
    const technicalTerms = ['hash', 'block', 'transaction', 'private key', 'public key', 'blockchain'];
    const advancedTerms = ['smart contract', 'defi', 'liquidity', 'yield farming', 'governance'];
    
    if (advancedTerms.some(term => message.toLowerCase().includes(term))) {
      this.currentSession.userLevel = 'advanced';
    } else if (technicalTerms.some(term => message.toLowerCase().includes(term))) {
      this.currentSession.userLevel = 'intermediate';
    }
  }

  // Obtener estadísticas de la sesión
  getSessionStats() {
    return {
      duration: new Date() - this.currentSession.startTime,
      messageCount: this.currentSession.messages.length,
      userLevel: this.currentSession.userLevel,
      interests: this.currentSession.interests
    };
  }
}

// Exportar para uso global
window.RSCChainAI = RSCChainAI; 