# 🚀 Inicio Rápido - Backend del Chatbot

## Para iniciar el backend y que el chat funcione completamente:

### Paso 1: Crear archivo de configuración

**Windows (PowerShell):**
```powershell
cd chatbot-backend
copy env.example .env
```

**Windows (CMD):**
```cmd
cd chatbot-backend
copy env.example .env
```

**Linux/Mac:**
```bash
cd chatbot-backend
cp env.example .env
```

### Paso 2: Configurar variables (opcional para probar)

Para empezar a probar, puedes dejar el `.env` como está. El servidor funcionará, pero el envío de emails no estará activo hasta que configures el email.

Si quieres configurar email (opcional):
1. Abre `.env` con un editor de texto
2. Cambia `EMAIL_USER` por tu email de Gmail
3. Para `EMAIL_PASSWORD`, necesitas crear un "App Password" en Gmail:
   - Ve a: https://myaccount.google.com/apppasswords
   - Genera una contraseña para "Mail"
   - Úsala como `EMAIL_PASSWORD`

### Paso 3: Instalar dependencias (si no lo has hecho)

```bash
pip install -r requirements.txt
```

### Paso 4: Iniciar el servidor

**Windows:**
```bash
python app.py
```

O usa el script:
```bash
start.bat
```

**Linux/Mac:**
```bash
python3 app.py
```

O:
```bash
chmod +x start.sh
./start.sh
```

### Paso 5: Verificar que funciona

Deberías ver en la consola:
```
🤖 RSC Chain Chatbot Backend
=============================
Servidor iniciando en puerto 5000
Modo: Desarrollo
Base de conocimiento: X temas
```

### Paso 6: Probar el chat

1. Abre `index.html` en tu navegador
2. Haz clic en el botón flotante del chat
3. Escribe un mensaje
4. El bot debería responder con información completa (ya no en modo limitado)

## ✅ Señales de que funciona correctamente:

- ✅ El servidor muestra "Base de conocimiento: X temas"
- ✅ No ves errores en la consola del servidor
- ✅ El chat responde con información detallada (no dice "modo limitado")
- ✅ Puedes hacer preguntas como "¿Cómo minar?" y obtienes respuestas completas

## 🐛 Si sigue en modo limitado:

1. **Verifica que el servidor esté corriendo** en el puerto 5000
2. **Abre la consola del navegador (F12)** y busca errores
3. **Verifica la URL**: El frontend intenta conectar a `http://localhost:5000/api/chatbot/message`
4. **Prueba el endpoint manualmente**: 
   - Abre en el navegador: `http://localhost:5000/api/chatbot/health`
   - Deberías ver un JSON con `"status": "healthy"`

## 💡 Nota:

Si no configuras el email, el bot funcionará perfectamente para responder preguntas, pero cuando necesite escalar a soporte humano, no podrá enviar emails. Todo lo demás funciona sin configuración de email.


