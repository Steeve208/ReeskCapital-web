"""
RSC Chain Chatbot Backend
Servidor Flask para el chatbot de atención al cliente con IA
"""
import os
import json
import re
from datetime import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv()

app = Flask(__name__)
CORS(app)  # Permitir CORS para todas las rutas

# Importar el sistema de IA
from rsc_knowledge import RSCKnowledgeBase
from rsc_ai import RSCAI

# Inicializar componentes
knowledge_base = RSCKnowledgeBase()
ai_system = RSCAI(knowledge_base)

# Configuración de email
EMAIL_CONFIG = {
    'smtp_server': os.getenv('SMTP_SERVER', 'smtp.gmail.com'),
    'smtp_port': int(os.getenv('SMTP_PORT', 587)),
    'email_user': os.getenv('EMAIL_USER', ''),
    'email_password': os.getenv('EMAIL_PASSWORD', ''),
    'support_email': os.getenv('SUPPORT_EMAIL', 'support@rscchain.com')
}

# Almacenamiento de sesiones (en producción usar Redis o DB)
user_sessions = {}


@app.route('/api/chatbot/message', methods=['POST'])
def handle_message():
    """Endpoint principal para recibir mensajes del chat"""
    try:
        data = request.json
        message = data.get('message', '').strip()
        session_id = data.get('session_id', 'default')
        user_email = data.get('user_email', '')
        username = data.get('username', '')
        
        if not message:
            return jsonify({
                'success': False,
                'error': 'Mensaje vacío'
            }), 400
        
        # Inicializar sesión si no existe
        if session_id not in user_sessions:
            user_sessions[session_id] = {
                'messages': [],
                'requires_contact_info': False,
                'contact_attempts': 0,
                'email': user_email,
                'username': username
            }
        
        session = user_sessions[session_id]
        
        # Agregar mensaje del usuario
        session['messages'].append({
            'role': 'user',
            'content': message,
            'timestamp': datetime.now().isoformat()
        })
        
        # Verificar si necesita información de contacto
        if session.get('requires_contact_info'):
            return handle_contact_info_request(session, message, session_id)
        
        # Procesar con IA
        response = ai_system.process_message(
            message, 
            session['messages'],
            user_email,
            username
        )
        
        # Verificar si la respuesta indica que necesita escalar
        if response.get('needs_escalation', False):
            session['requires_contact_info'] = True
            session['contact_attempts'] = 0
            session['issue_description'] = message
            
            return jsonify({
                'success': True,
                'message': response['message'],
                'needs_contact_info': True,
                'session_id': session_id
            })
        
        # Agregar respuesta del bot
        session['messages'].append({
            'role': 'assistant',
            'content': response['message'],
            'timestamp': datetime.now().isoformat()
        })
        
        return jsonify({
            'success': True,
            'message': response['message'],
            'session_id': session_id
        })
        
    except Exception as e:
        print(f"Error en handle_message: {str(e)}")
        return jsonify({
            'success': False,
            'error': f'Error procesando mensaje: {str(e)}'
        }), 500


def handle_contact_info_request(session, message, session_id):
    """Maneja la recopilación de información de contacto"""
    session['contact_attempts'] += 1
    
    # Extraer email si está en el mensaje
    email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
    emails = re.findall(email_pattern, message)
    
    if emails:
        session['email'] = emails[0]
    
    # Buscar username (palabras antes de @email o después de "usuario:" o "nombre:")
    username_patterns = [
        r'usuario[:\s]+([A-Za-z0-9_]+)',
        r'nombre[:\s]+([A-Za-z0-9_\s]+)',
        r'username[:\s]+([A-Za-z0-9_]+)'
    ]
    
    username = session.get('username', '')
    for pattern in username_patterns:
        matches = re.findall(pattern, message, re.IGNORECASE)
        if matches:
            username = matches[0].strip()
            break
    
    if username and not session.get('username'):
        session['username'] = username
    
    # Verificar si tenemos toda la información
    has_email = bool(session.get('email'))
    has_username = bool(session.get('username'))
    
    if has_email and has_username:
        # Enviar email al soporte
        issue = session.get('issue_description', 'Problema no especificado')
        success = send_support_email(
            session['email'],
            session['username'],
            issue,
            session['messages']
        )
        
        if success:
            session['requires_contact_info'] = False
            return jsonify({
                'success': True,
                'message': '✅ Perfecto! He recibido tu información. Nuestro equipo de soporte se pondrá en contacto contigo pronto a través de tu email.',
                'session_id': session_id
            })
        else:
            return jsonify({
                'success': False,
                'message': '⚠️ Hubo un problema al enviar tu solicitud. Por favor, inténtalo de nuevo o contacta directamente a support@rscchain.com',
                'session_id': session_id
            })
    
    # Solicitar información faltante
    if not has_email:
        return jsonify({
            'success': True,
            'message': '📧 Por favor, comparte tu dirección de email para que nuestro equipo pueda contactarte.',
            'needs_contact_info': True,
            'session_id': session_id
        })
    
    if not has_username:
        return jsonify({
            'success': True,
            'message': '👤 Por favor, comparte tu nombre de usuario en RSC Chain.',
            'needs_contact_info': True,
            'session_id': session_id
        })


def send_support_email(user_email, username, issue, conversation_history):
    """Envía email al equipo de soporte con la información del usuario"""
    try:
        if not EMAIL_CONFIG['email_user'] or not EMAIL_CONFIG['email_password']:
            print("⚠️ Configuración de email no disponible")
            # En producción, podrías guardar en una DB para procesar después
            return False
        
        msg = MIMEMultipart()
        msg['From'] = EMAIL_CONFIG['email_user']
        msg['To'] = EMAIL_CONFIG['support_email']
        msg['Subject'] = f'[RSC Chain Support] Nueva solicitud de: {username}'
        
        # Formatear historial de conversación
        conversation_text = "\n".join([
            f"[{m.get('timestamp', 'N/A')}] {m.get('role', 'unknown').upper()}: {m.get('content', '')}"
            for m in conversation_history[-10:]  # Últimos 10 mensajes
        ])
        
        body = f"""
        Nueva solicitud de soporte desde el chatbot RSC Chain
        
        ==========================================
        INFORMACIÓN DEL USUARIO
        ==========================================
        Email: {user_email}
        Usuario: {username}
        Fecha: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
        
        ==========================================
        PROBLEMA REPORTADO
        ==========================================
        {issue}
        
        ==========================================
        HISTORIAL DE CONVERSACIÓN
        ==========================================
        {conversation_text}
        
        ==========================================
        ACCIÓN REQUERIDA
        ==========================================
        Por favor, contacta al usuario para resolver su problema.
        
        Responder a: {user_email}
        """
        
        msg.attach(MIMEText(body, 'plain'))
        
        # Enviar email
        server = smtplib.SMTP(EMAIL_CONFIG['smtp_server'], EMAIL_CONFIG['smtp_port'])
        server.starttls()
        server.login(EMAIL_CONFIG['email_user'], EMAIL_CONFIG['email_password'])
        server.send_message(msg)
        server.quit()
        
        print(f"✅ Email enviado al soporte para: {user_email}")
        return True
        
    except Exception as e:
        print(f"❌ Error enviando email: {str(e)}")
        return False


@app.route('/api/chatbot/health', methods=['GET'])
def health_check():
    """Endpoint de salud del servicio"""
    return jsonify({
        'status': 'healthy',
        'service': 'RSC Chain Chatbot',
        'timestamp': datetime.now().isoformat()
    })


@app.route('/api/chatbot/knowledge', methods=['GET'])
def get_knowledge_stats():
    """Endpoint para obtener estadísticas de la base de conocimiento"""
    return jsonify({
        'total_topics': len(knowledge_base.knowledge_base),
        'categories': list(knowledge_base.knowledge_base.keys()),
        'timestamp': datetime.now().isoformat()
    })


if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('FLASK_ENV') == 'development'
    
    print(f"""
    🤖 RSC Chain Chatbot Backend
    =============================
    Servidor iniciando en puerto {port}
    Modo: {'Desarrollo' if debug else 'Producción'}
    Base de conocimiento: {len(knowledge_base.knowledge_base)} temas
    """)
    
    app.run(host='0.0.0.0', port=port, debug=debug)

