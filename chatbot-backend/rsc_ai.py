"""
Sistema de IA para RSC Chain Chatbot
Procesa mensajes y genera respuestas inteligentes
"""
import re
from datetime import datetime


class RSCAI:
    """Sistema de IA especializado en RSC Chain"""
    
    def __init__(self, knowledge_base):
        self.knowledge = knowledge_base
        self.confidence_threshold = 0.7  # Umbral de confianza para escalar a humano
        self.issue_patterns = self._build_issue_patterns()
        self.issue_titles = {
            ('mining', 'cannot_start'): 'iniciar la minería',
            ('mining', 'no_rewards'): 'recibir tus recompensas de minería',
            ('wallet', 'cannot_create'): 'crear una wallet',
            ('wallet', 'wrong_balance'): 'ver el balance correcto en tu wallet',
            ('staking', 'cannot_delegate'): 'delegar tus tokens en staking',
            ('staking', 'no_rewards'): 'recibir recompensas de staking'
        }
        
    def process_message(self, message, conversation_history=None, user_email=None, username=None):
        """
        Procesa un mensaje y genera una respuesta
        
        Returns:
            dict: {
                'message': str - respuesta del bot,
                'needs_escalation': bool - si necesita contacto humano,
                'confidence': float - nivel de confianza (0-1)
            }
        """
        if conversation_history is None:
            conversation_history = []
        
        message_lower = message.lower()
        
        # Detectar intención
        intent = self._detect_intent(message_lower)
        
        # Determinar categoría
        category = self._detect_category(message_lower)
        
        # Buscar información relevante
        knowledge_results = self.knowledge.search(message_lower, category)
        
        # Calcular confianza
        confidence = self._calculate_confidence(message_lower, knowledge_results, category)
        
        needs_escalation = confidence < self.confidence_threshold
        
        # Si necesita escalación y no es un saludo, pedir información de contacto
        if needs_escalation and intent != 'greeting':
            return {
                'message': self._generate_escalation_message(message),
                'needs_escalation': True,
                'confidence': confidence
            }
        
        # Generar respuesta basada en intención y conocimiento
        response = self._generate_response(intent, category, knowledge_results, message_lower, conversation_history)
        
        return {
            'message': response,
            'needs_escalation': False,
            'confidence': confidence
        }
    
    def _detect_intent(self, message):
        """Detecta la intención del mensaje"""
        # Saludos
        if re.search(r'\b(hola|hi|hello|buenos días|buenas tardes|buenas noches|saludos|hey)\b', message):
            return 'greeting'
        
        # Preguntas de ayuda
        if re.search(r'\b(cómo|como|how|ayuda|help|problema|error|no funciona|no puedo)\b', message):
            return 'help'
        
        # Preguntas informativas
        if re.search(r'\b(qué|que|what|quien|who|cuándo|when|dónde|where|por qué|why|explica|explicar)\b', message):
            return 'information'
        
        # Problemas técnicos
        if re.search(r'\b(error|fallo|bug|roto|no funciona|no carga|no puedo|problema|tengo un problema)\b', message):
            return 'technical_issue'
        
        return 'general'
    
    def _detect_category(self, message):
        """Detecta la categoría del mensaje"""
        categories = {
            'mining': ['minar', 'minería', 'mining', 'minero', 'sesión', 'recompensa'],
            'wallet': ['wallet', 'cartera', 'balance', 'dirección', 'address', 'clave', 'private key'],
            'staking': ['staking', 'stake', 'delegar', 'delegación', 'validador', 'pool'],
            'p2p': ['p2p', 'trading', 'intercambio', 'anuncio', 'trade', 'compra', 'venta'],
            'explorer': ['explorer', 'explorador', 'bloque', 'block', 'transacción', 'transaction'],
            'technical': ['consenso', 'consensus', 'seguridad', 'security', 'api', 'blockchain', 'red']
        }
        
        message_words = set(message.lower().split())
        
        for category, keywords in categories.items():
            if any(keyword in message for keyword in keywords):
                return category
        
        return None
    
    def _calculate_confidence(self, message, knowledge_results, category):
        """Calcula el nivel de confianza en la respuesta"""
        # Si hay resultados relevantes, confianza alta
        if knowledge_results:
            return 0.9
        
        # Si detectamos categoría pero no hay resultados exactos
        if category:
            return 0.7
        
        # Mensajes muy cortos o ambiguos
        if len(message.split()) < 3:
            return 0.5
        
        # Preguntas muy específicas o técnicas que no encontramos
        technical_indicators = ['error', 'código', 'log', 'bug', 'fallo']
        if any(indicator in message for indicator in technical_indicators):
            return 0.4
        
        return 0.6
    
    def _generate_response(self, intent, category, knowledge_results, message, conversation_history):
        """Genera la respuesta del bot"""
        
        # Respuestas según intención
        if intent == 'greeting':
            hour = datetime.now().hour
            if 6 <= hour < 12:
                greeting = "¡Buenos días! 👋"
            elif 12 <= hour < 20:
                greeting = "¡Buenas tardes! 👋"
            else:
                greeting = "¡Buenas noches! 👋"
            
            return f"""{greeting}

Soy el asistente virtual de RSC Chain. Estoy aquí para ayudarte con:
• ⛏️ Minería de RSC tokens
• 💼 Gestión de wallets
• 🔒 Staking y delegación
• 🔄 Trading P2P
• 🔍 Explorer de blockchain
• Y mucho más...

¿En qué puedo ayudarte hoy?"""
        
        # Si es un problema técnico, ofrecer asistencia guiada
        if intent == 'technical_issue':
            troubleshooting_response = self._handle_troubleshooting(category, message)
            if troubleshooting_response:
                return troubleshooting_response

        # Si tenemos resultados de conocimiento, usarlos
        if knowledge_results:
            best_result = knowledge_results[0]
            response = best_result.get('content', '')
            
            # Agregar contexto adicional si hay más información
            if len(knowledge_results) > 1:
                additional_info = []
                for result in knowledge_results[1:3]:  # Máximo 2 adicionales
                    if result.get('content'):
                        additional_info.append(f"• {result['content'][:100]}...")
                
                if additional_info:
                    response += "\n\n📌 Información adicional:\n" + "\n".join(additional_info)
            
            return response
        
        # Respuestas genéricas por categoría
        category_responses = {
            'mining': """Sobre minería en RSC Chain:

⛏️ **¿Cómo empezar?**
Ve a la página de Mining y haz clic en "Iniciar Minería". Cada sesión dura 24 horas y es completamente automática.

**Características:**
• Minería web-based (no necesitas software)
• Sesiones de 24 horas
• Recompensas automáticas
• Sin necesidad de hardware especializado

¿Tienes alguna pregunta específica sobre la minería?""",
            
            'wallet': """Sobre Wallets en RSC Chain:

💼 **Crear una Wallet**
Puedes crear una wallet no-custodial directamente en tu navegador. Tus claves privadas nunca salen de tu dispositivo.

**Características:**
• No-custodial (tú controlas tus fondos)
• Creación gratuita e instantánea
• Soporte para transacciones rápidas
• Integración con Explorer

**Seguridad:**
• Guarda tu clave privada en un lugar seguro
• Nunca la compartas con nadie
• Haz backup en múltiples lugares

¿Necesitas ayuda con algo específico de tu wallet?""",
            
            'staking': """Sobre Staking en RSC Chain:

🔒 **¿Qué es Staking?**
Staking te permite delegar tus tokens RSC a validadores y ganar recompensas pasivas.

**Ventajas:**
• Ingresos pasivos
• Contribuyes a la seguridad de la red
• Puedes retirar cuando quieras
• Diversificación de recompensas

¿Quieres saber más sobre cómo hacer staking o sobre estrategias?"""
        }
        
        if category and category in category_responses:
            return category_responses[category]
        
        # Respuesta genérica si no encontramos nada específico
        return """Entiendo tu pregunta y quiero ayudarte lo mejor posible.

RSC Chain es una blockchain avanzada con varias áreas importantes:

**Funcionalidades principales:**
• ⛏️ Minería Web - Minar tokens desde tu navegador
• 💼 Wallet - Gestionar tus tokens de forma segura
• 🔒 Staking - Generar recompensas delegando tokens
• 🔄 P2P Trading - Intercambiar tokens con otros usuarios
• 🔍 Explorer - Revisar bloques y transacciones

Cuéntame qué parte estás explorando o qué problema específico ves y te guiaré paso a paso. Si aparece un mensaje de error, indícamelo para darte la solución exacta."""
    
    def _generate_escalation_message(self, original_message):
        """Genera mensaje cuando necesita escalar a soporte humano"""
        return """Entiendo que tu pregunta es muy específica o que estás experimentando un problema técnico que requiere atención personalizada.

Para que nuestro equipo de soporte pueda ayudarte de la mejor manera, necesito algunos datos:

📧 **Tu email**: ¿Podrías compartir tu dirección de email?
👤 **Tu nombre de usuario**: ¿Cuál es tu nombre de usuario en RSC Chain?

Una vez que tengamos esta información, nuestro equipo se pondrá en contacto contigo para resolver tu problema lo antes posible.

**Por favor, comparte tu email y username cuando estés listo.**"""

    def _build_issue_patterns(self):
        """Crea los patrones para detectar problemas comunes por categoría"""
        return {
            'mining': [
                (re.compile(r'(no puedo|minar no|no me deja|minar.*no funciona|no inicia|no arranca)'), 'cannot_start'),
                (re.compile(r'(no recibo|no veo|sin recompensa|no me dieron|no aparecen).*recompensa'), 'no_rewards')
            ],
            'wallet': [
                (re.compile(r'(no puedo|no me deja|error).*crear.*wallet'), 'cannot_create'),
                (re.compile(r'(balance|saldo).*(incorrecto|no coincide|no se actualiza)'), 'wrong_balance')
            ],
            'staking': [
                (re.compile(r'(no puedo|no me deja|error).*delegar'), 'cannot_delegate'),
                (re.compile(r'(no recibo|sin recompensa|no llegan).*staking'), 'no_rewards')
            ]
        }

    def _handle_troubleshooting(self, category, message):
        """Devuelve una respuesta de troubleshooting conversacional"""
        if category:
            troubleshooting = self.knowledge.get_troubleshooting_info(category)
            if troubleshooting:
                issue_key = self._detect_issue_type(category, message)
                if issue_key and issue_key in troubleshooting:
                    steps = troubleshooting[issue_key]
                    return self._format_troubleshooting_response(category, issue_key, steps)
                else:
                    combined_steps = '\n\n'.join(steps for steps in troubleshooting.values())
                    return (
                        "Entiendo que algo no está funcionando como debería. "
                        "Revisa estos puntos clave por favor:\n\n"
                        f"{combined_steps}\n\n"
                        "Si alguno falla o ves un mensaje de error, cuéntamelo y busco una solución específica."
                    )

        general_troubleshooting = self.knowledge.get_category_info('troubleshooting')
        general_text = general_troubleshooting.get('general') if general_troubleshooting else ''
        if general_text:
            return (
                "Entiendo que estás experimentando un problema y quiero ayudarte. "
                f"Mientras lo revisamos, revisa lo siguiente:\n\n{general_text}\n\n"
                "Indícame qué paso ya probaste o qué mensaje aparece y lo revisamos juntos."
            )

        return None

    def _detect_issue_type(self, category, message):
        """Detecta el tipo de problema específico mediante patrones"""
        patterns = self.issue_patterns.get(category, [])
        for pattern, issue_key in patterns:
            if pattern.search(message.lower()):
                return issue_key
        return None

    def _format_troubleshooting_response(self, category, issue_key, steps):
        """Crea un mensaje amigable con los pasos a seguir"""
        title = self.issue_titles.get((category, issue_key), 'el problema')
        intro = (
            f"Gracias por avisar. Veo que estás teniendo dificultades para {title}. "
            "Vamos a revisarlo paso a paso:"
        )
        closing = (
            "\n\nCuando termines estos pasos dime cuál te falló o si aparece algo distinto y seguimos avanzando."
        )
        return f"{intro}\n\n{steps}{closing}"

