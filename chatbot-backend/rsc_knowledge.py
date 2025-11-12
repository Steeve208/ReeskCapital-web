"""
Base de Conocimiento de RSC Chain
Contiene toda la información necesaria para que el bot responda preguntas
"""


class RSCKnowledgeBase:
    """Base de conocimiento completa sobre RSC Chain"""
    
    def __init__(self):
        self.knowledge_base = self._build_knowledge_base()
    
    def _build_knowledge_base(self):
        """Construye la base de conocimiento completa"""
        return {
            'general': {
                'rsc_chain': {
                    'description': """RSC Chain es una blockchain de próxima generación que combina las mejores características de Proof of Work (PoW), Proof of Stake (PoS) e Inteligencia Artificial (AI). Es una plataforma descentralizada que ofrece transacciones rápidas, seguridad cuántica y verdadera descentralización.""",
                    'features': [
                        'Transacciones ultra-rápidas (10,000+ TPS)',
                        'Seguridad cuántica resistente',
                        'Consenso híbrido PoW + PoS + AI',
                        'Sin ICO o pre-venta',
                        'Distribución justa mediante minería web',
                        'Red descentralizada con 99.99% uptime'
                    ],
                    'tech_specs': {
                        'tps': '10,000+ transacciones por segundo',
                        'finality': '1.8 segundos',
                        'security': '512-bit, Quantum Safe',
                        'uptime': '99.99%',
                        'total_supply': '2.1M RSC tokens',
                        'burned': '50% ya quemados (1.05M RSC circulando)'
                    }
                },
                'what_is': """RSC Chain es una blockchain revolucionaria que utiliza tecnología de vanguardia para ofrecer:
• Minería web accesible desde cualquier navegador
• Sistema de staking avanzado con validadores
• Trading P2P descentralizado
• Wallet no-custodial segura
• Explorer completo de la blockchain
• Sin necesidad de KYC o bancos tradicionales"""
            },
            
            'mining': {
                'how_to_start': """Para empezar a minar RSC Chain:
1. Ve a la página de Mining (pages/mine.html)
2. Haz clic en "Iniciar Minería" o "Start Mining"
3. El sistema iniciará automáticamente una sesión de 24 horas
4. Tus recompensas se acumularán durante la sesión
5. Puedes reclamar tus recompensas al finalizar la sesión

La minería es completamente web-based, no necesitas instalar software.""",
                
                'session_duration': """Cada sesión de minería dura exactamente 24 horas. Una vez que finaliza, debes esperar un período de cooldown antes de iniciar una nueva sesión.""",
                
                'rewards': """Las recompensas de minería se calculan automáticamente y se distribuyen al finalizar cada sesión de 24 horas. El sistema es completamente automático y no requiere intervención manual.""",
                
                'troubleshooting': {
                    'cannot_start': """Si no puedes iniciar la minería:
• Verifica que tu sesión anterior haya finalizado completamente
• Asegúrate de que no estés en período de cooldown
• Limpia la caché del navegador y recarga la página
• Verifica tu conexión a internet
• Si el problema persiste, contacta al soporte""",
                    
                    'no_rewards': """Si no recibes recompensas:
• Verifica que hayas completado una sesión completa de 24 horas
• Asegúrate de haber iniciado correctamente la minería
• Revisa tu historial de sesiones en la página de Mining
• Espera unos minutos después de finalizar la sesión
• Contacta al soporte si el problema persiste"""
                },
                
                'tips': """Consejos para optimizar tu minería:
• Mantén el navegador abierto durante las 24 horas
• Usa una conexión estable a internet
• No cierres la pestaña del navegador durante la minería
• Verifica regularmente el estado de tu sesión
• Reclama tus recompensas tan pronto como estén disponibles"""
            },
            
            'wallet': {
                'creation': """Para crear una wallet en RSC Chain:
1. Ve a la página de Wallet (pages/wallet.html)
2. Haz clic en "Crear Wallet" o "Create Wallet"
3. Guarda cuidadosamente tu clave privada (private key)
4. Guarda tu frase mnemotécnica si se proporciona
5. Nunca compartas tu clave privada con nadie

IMPORTANTE: Tu wallet es no-custodial, solo tú tienes acceso a tus fondos.""",
                
                'security': """Seguridad de la Wallet:
• Las claves privadas NUNCA salen de tu navegador
• Guarda tu clave privada en un lugar seguro
• Considera usar un gestor de contraseñas
• Haz backup de tu clave privada en múltiples lugares seguros
• Nunca compartas tu clave privada por email, mensaje o redes sociales
• Verifica siempre que estés en el sitio oficial de RSC Chain""",
                
                'balance': """Para consultar tu balance:
1. Ve a la página de Wallet
2. Ingresa tu dirección de wallet
3. El sistema consultará automáticamente tu balance en la blockchain
4. Tu balance se actualiza en tiempo real""",
                
                'send_transaction': """Para enviar una transacción:
1. Ve a la sección "Enviar" en tu wallet
2. Ingresa la dirección de destino
3. Especifica la cantidad de RSC a enviar
4. Revisa los detalles cuidadosamente
5. Confirma la transacción
6. Espera la confirmación en la blockchain (1.8 segundos promedio)""",
                
                'troubleshooting': {
                    'cannot_create': """Si no puedes crear una wallet:
• Verifica que tu navegador soporte JavaScript
• Asegúrate de tener conexión a internet
• Intenta en otro navegador (Chrome, Firefox, Edge)
• Limpia la caché del navegador
• Contacta al soporte si el problema persiste""",
                    
                    'wrong_balance': """Si tu balance no es correcto:
• Espera unos segundos y recarga la página
• Verifica que estés usando la dirección correcta
• Asegúrate de que tus transacciones hayan sido confirmadas
• Consulta el Explorer para ver tus transacciones
• Si el problema persiste, contacta al soporte"""
                }
            },
            
            'staking': {
                'what_is': """Staking en RSC Chain te permite:
• Delegar tus tokens RSC a validadores
• Ganar recompensas pasivas por participar en la seguridad de la red
• Contribuir a la descentralización de la red
• Retirar tus tokens cuando quieras (sin período de lock)""",
                
                'how_to_stake': """Para hacer staking:
1. Ve a la página de Staking (pages/staking.html)
2. Revisa los pools de staking disponibles
3. Selecciona un validador o pool
4. Especifica la cantidad de RSC a delegar
5. Confirma la delegación
6. Tus recompensas comenzarán a acumularse automáticamente""",
                
                'strategies': """Estrategias de Staking:
• Diversificación: Delegar a múltiples validadores reduce riesgos
• Validadores activos: Elige validadores con buen historial
• Recompensas: Compara las tasas de recompensa entre validadores
• Descentralización: Apoya validadores más pequeños para ayudar a descentralizar la red""",
                
                'rewards': """Las recompensas de staking:
• Se calculan automáticamente
• Dependen del validador y la cantidad delegada
• Se distribuyen periódicamente
• Puedes retirar tus recompensas cuando quieras""",
                
                'troubleshooting': {
                    'cannot_delegate': """Si no puedes delegar:
• Verifica que tengas suficientes tokens RSC
• Asegúrate de tener conexión a internet
• Verifica que el validador esté activo
• Recarga la página e intenta nuevamente""",
                    
                    'no_rewards': """Si no recibes recompensas de staking:
• Verifica que hayas delegado correctamente
• Asegúrate de que el validador esté activo
• Espera el período de distribución de recompensas
• Consulta tu historial de delegaciones
• Contacta al soporte si el problema persiste"""
                }
            },
            
            'p2p': {
                'what_is': """P2P Trading en RSC Chain permite:
• Intercambiar tokens RSC de forma descentralizada
• Crear y responder a anuncios de compra/venta
• Realizar trades seguros con sistema de escrow
• Comunicarte directamente con otros traders""",
                
                'how_to_trade': """Para usar P2P Trading:
1. Ve a la página P2P (pages/p2p.html)
2. Explora los anuncios disponibles
3. Crea tu propio anuncio si quieres comprar o vender
4. Responde a anuncios que te interesen
5. Completa el trade siguiendo las instrucciones
6. El sistema de escrow mantendrá los fondos seguros hasta completar el trade""",
                
                'safety': """Seguridad en P2P Trading:
• Usa el sistema de escrow siempre
• Verifica la reputación del trader
• Comunícate claramente antes de iniciar un trade
• No compartas tu clave privada nunca
• Reporta cualquier actividad sospechosa"""
            },
            
            'explorer': {
                'features': """El Explorer de RSC Chain te permite:
• Ver transacciones en tiempo real
• Explorar bloques de la blockchain
• Consultar direcciones de wallets
• Ver estadísticas de la red
• Analizar el crecimiento de la blockchain""",
                
                'how_to_use': """Para usar el Explorer:
1. Ve a la página Explorer (pages/explorer.html)
2. Busca por dirección de wallet, hash de transacción o número de bloque
3. Explora las estadísticas de la red
4. Revisa el historial de transacciones
5. Analiza los datos de la blockchain"""
            },
            
            'technical': {
                'consensus': """RSC Chain usa un consenso híbrido único:
• Proof of Work (PoW): Para seguridad y distribución justa
• Proof of Stake (PoS): Para eficiencia y velocidad
• Inteligencia Artificial (AI): Para optimización y decisiones inteligentes
Esta combinación ofrece lo mejor de todos los mundos.""",
                
                'security': """Seguridad de RSC Chain:
• Criptografía post-cuántica (PQC)
• Resistente a ataques cuánticos futuros
• Validación descentralizada
• Sin puntos únicos de fallo
• Red distribuida globalmente""",
                
                'api': """API de RSC Chain:
• Base URL: https://rsc-chain-production.up.railway.app/
• Endpoints principales:
  - /api/v1/wallet/* - Operaciones de wallet
  - /api/v1/mining/* - Operaciones de minería
  - /api/v1/blockchain/* - Información de blockchain
  - /api/v1/tx/* - Transacciones"""
            },
            
            'troubleshooting': {
                'general': """Problemas comunes y soluciones:
• Problemas de conexión: Verifica tu internet, limpia caché
• Errores de página: Recarga, prueba otro navegador
• Transacciones lentas: Normalmente se confirman en 1.8 segundos
• Balance incorrecto: Espera unos segundos, recarga la página
• Si nada funciona: Contacta al soporte con tu email y username""",
                
                'contact_support': """Si necesitas ayuda adicional:
1. Proporciona tu email
2. Proporciona tu nombre de usuario
3. Describe el problema en detalle
4. Nuestro equipo te contactará pronto"""
            }
        }
    
    def search(self, query, category=None):
        """Busca información relevante en la base de conocimiento"""
        query_lower = query.lower()
        results = []
        
        # Si se especifica categoría, buscar solo ahí
        search_base = {category: self.knowledge_base[category]} if category and category in self.knowledge_base else self.knowledge_base
        
        for cat, content in search_base.items():
            if isinstance(content, dict):
                for key, value in content.items():
                    if isinstance(value, dict):
                        # Buscar en sub-diccionarios
                        for sub_key, sub_value in value.items():
                            if isinstance(sub_value, str) and query_lower in sub_value.lower():
                                results.append({
                                    'category': cat,
                                    'topic': key,
                                    'subtopic': sub_key,
                                    'content': sub_value
                                })
                    elif isinstance(value, str) and query_lower in value.lower():
                        results.append({
                            'category': cat,
                            'topic': key,
                            'content': value
                        })
                    elif isinstance(value, list):
                        for item in value:
                            if isinstance(item, str) and query_lower in item.lower():
                                results.append({
                                    'category': cat,
                                    'topic': key,
                                    'content': item
                                })
        
        return results
    
    def get_category_info(self, category):
        """Obtiene toda la información de una categoría"""
        return self.knowledge_base.get(category, {})

    def get_troubleshooting_info(self, category):
        """Devuelve los pasos de resolución de problemas para una categoría"""
        category_info = self.knowledge_base.get(category, {})
        return category_info.get('troubleshooting', {})

    def list_troubleshooting_topics(self, category):
        """Lista las claves disponibles de troubleshooting para una categoría"""
        troubleshooting = self.get_troubleshooting_info(category)
        return list(troubleshooting.keys())

