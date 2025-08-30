# 🚀 RSC Chain - Plataforma de Minería Simulada Completa

## 📋 **Descripción General**

Esta es una **plataforma de minería simulada off-chain** para RSC Chain, diseñada para construir comunidad y engagement mientras se desarrolla la mainnet. Los usuarios minan tokens de prueba que se convertirán en RSC reales cuando la blockchain esté activa.

## 🎯 **Características Principales**

### **🔐 Sistema de Autenticación**
- ✅ **Login/Registro** con email y contraseña
- ✅ **Sesiones persistentes** en Supabase
- ✅ **Seguridad RLS** (Row Level Security)
- ✅ **Fallback a localStorage** si Supabase no está disponible

### **⛏️ Sistema de Minería Simulada**
- ✅ **10 tokens por minuto** de minería activa
- ✅ **Límite diario: 2 RSC** por usuario
- ✅ **Minería basada en tiempo** (no hashrate real)
- ✅ **Sesiones persistentes** con timeout automático
- ✅ **Reclamación de recompensas** en tiempo real

### **💾 Persistencia de Datos**
- ✅ **Supabase** como base de datos principal
- ✅ **localStorage** como respaldo local
- ✅ **Sincronización automática** entre cliente y servidor
- ✅ **Historial completo** de sesiones de minería

### **🎨 Interfaz de Usuario**
- ✅ **Diseño responsive** para todos los dispositivos
- ✅ **Tema claro/oscuro** con persistencia
- ✅ **Animaciones suaves** y transiciones
- ✅ **Menú hamburguesa** integrado en navbar
- ✅ **Notificaciones en tiempo real**

## 🛠️ **Instalación y Configuración**

### **1. Requisitos Previos**
```bash
# Node.js 16+ y npm
node --version
npm --version

# Navegador moderno con ES6+ support
# Chrome 80+, Firefox 75+, Safari 13+, Edge 80+
```

### **2. Clonar el Proyecto**
```bash
git clone <tu-repositorio>
cd rsc-web
```

### **3. Configurar Supabase**

#### **3.1 Crear Proyecto en Supabase**
1. Ve a [supabase.com](https://supabase.com)
2. Crea un nuevo proyecto
3. Anota tu **URL** y **anon key**

#### **3.2 Configurar Base de Datos**
```sql
-- Ejecutar el archivo SQL en tu proyecto Supabase
-- SQL Editor > New Query > Pegar contenido de supabase-setup-mining.sql
```

#### **3.3 Configurar Credenciales**
```javascript
// Editar supabase-config.js
const SUPABASE_CONFIG = {
    url: 'https://tu-proyecto.supabase.co',        // Tu URL real
    anonKey: 'tu-anon-key-real',                  // Tu anon key real
    // ... resto de configuración
};
```

### **4. Instalar Dependencias**
```bash
# Dependencias del frontend
npm install

# Dependencias del backend (si usas Node.js)
cd backend
npm install
```

### **5. Configurar Variables de Entorno**
```bash
# Crear archivo .env en la raíz
cp .env.example .env

# Editar .env con tus credenciales
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_ANON_KEY=tu-anon-key
```

## 🚀 **Ejecutar la Plataforma**

### **Opción 1: Servidor Local (Recomendado)**
```bash
# Instalar servidor HTTP simple
npm install -g http-server

# Ejecutar en la raíz del proyecto
http-server -p 8080 -c-1

# Abrir en navegador: http://localhost:8080
```

### **Opción 2: Live Server (VS Code)**
1. Instalar extensión "Live Server"
2. Click derecho en `index.html`
3. Seleccionar "Open with Live Server"

### **Opción 3: Python Simple Server**
```bash
# Python 3
python -m http.server 8080

# Python 2
python -m SimpleHTTPServer 8080
```

## 📁 **Estructura del Proyecto**

```
rsc-web/
├── 📄 index.html                 # Página principal
├── 📁 pages/
│   └── 📄 mine.html             # Página de minería
├── 📁 styles/
│   └── 📄 mine.css              # Estilos de minería
├── 📁 scripts/
│   ├── 📄 mine.js               # Lógica principal de minería
│   └── 📄 supabase-config.js    # Configuración de Supabase
├── 📁 supabase/
│   └── 📄 supabase-setup-mining.sql  # Script de base de datos
├── 📄 supabase-config.js        # Configuración de Supabase
└── 📄 README-MINING-PLATFORM-COMPLETE.md
```

## 🔧 **Configuración Avanzada**

### **Personalizar Tokens por Minuto**
```javascript
// En supabase-config.js
mining: {
    tokensPerMinute: 15,  // Cambiar a 15 tokens/min
    dailyLimit: 3.0,      // Cambiar límite diario a 3 RSC
}
```

### **Modificar Límites Diarios**
```sql
-- En Supabase, modificar la función process_mining_reward
CREATE OR REPLACE FUNCTION process_mining_reward(
    p_user_email VARCHAR(255),
    p_tokens_earned DECIMAL(20, 8),
    p_session_duration INTEGER
)
RETURNS BOOLEAN AS $$
DECLARE
    v_max_daily_limit DECIMAL(20, 8) := 5.0; -- Cambiar a 5 RSC
BEGIN
    -- ... resto de la función
END;
$$ language 'plpgsql';
```

### **Configurar Notificaciones**
```javascript
// En supabase-config.js
notifications: {
    duration: 10000,        // 10 segundos
    position: 'top-left',   // Posición diferente
    sounds: false           // Deshabilitar sonidos
}
```

## 🧪 **Testing y Debugging**

### **Modo Debug**
```javascript
// En supabase-config.js
development: {
    debug: true,           // Habilitar logs detallados
    verbose: true,         // Logs muy detallados
    simulateLatency: true, // Simular latencia de red
    latencyMs: 200         // 200ms de latencia
}
```

### **Verificar Conexión a Supabase**
```javascript
// En consola del navegador
validateSupabaseConfig();  // Validar configuración
initializeSupabase();      // Probar conexión
getDatabaseStats();        // Obtener estadísticas
```

### **Logs del Sistema**
```javascript
// En consola del navegador
console.log('Estado de la plataforma:', window.rscMiningPlatform.state);
console.log('Configuración:', window.rscMiningPlatform.config);
```

## 🔒 **Seguridad y Privacidad**

### **Row Level Security (RLS)**
- ✅ Usuarios solo pueden acceder a sus propios datos
- ✅ Autenticación requerida para operaciones sensibles
- ✅ Validación de límites diarios en base de datos

### **Validaciones del Cliente**
- ✅ Verificación de límites diarios antes de minar
- ✅ Timeout automático de sesiones
- ✅ Sanitización de inputs de usuario

### **Protección contra Abuso**
- ✅ Límite diario de 2 RSC por usuario
- ✅ Timeout de sesión de 5 minutos
- ✅ Validación de tiempo de minería

## 📊 **Monitoreo y Analytics**

### **Estadísticas del Sistema**
```sql
-- Consultar estadísticas en Supabase
SELECT * FROM system_stats;
SELECT * FROM public_mining_stats;
SELECT * FROM get_user_ranking();
```

### **Métricas de Usuario**
- Total de usuarios registrados
- Tokens minados en total
- Mineros activos (última hora)
- Total minado hoy

### **Logs de Actividad**
```sql
-- Ver historial de minería
SELECT * FROM mining_history 
WHERE user_email = 'usuario@email.com' 
ORDER BY created_at DESC;
```

## 🚀 **Despliegue en Producción**

### **1. Preparar para Producción**
```bash
# Minificar CSS y JS (opcional)
npm run build

# Verificar configuración
validateSupabaseConfig()
```

### **2. Subir a Hosting**
- **Netlify**: Drag & drop de la carpeta
- **Vercel**: Conectar repositorio Git
- **GitHub Pages**: Activar en configuración
- **Hosting tradicional**: Subir archivos via FTP

### **3. Configurar Dominio**
```bash
# Agregar tu dominio en Supabase
# Settings > API > Site URL
```

### **4. Verificar SSL**
- ✅ HTTPS obligatorio para Supabase
- ✅ Certificados SSL válidos
- ✅ Redirección HTTP → HTTPS

## 🔄 **Mantenimiento y Actualizaciones**

### **Reseteo Diario Automático**
```sql
-- En Supabase, programar job diario
SELECT cron.schedule('reset-daily-limits', '0 0 * * *', 'SELECT reset_daily_limits();');
```

### **Backup de Datos**
```sql
-- Exportar datos importantes
SELECT * FROM users_balances;
SELECT * FROM mining_history;
SELECT * FROM system_stats;
```

### **Monitoreo de Rendimiento**
- Verificar conexiones a Supabase
- Monitorear uso de almacenamiento
- Revisar logs de errores

## 🐛 **Solución de Problemas**

### **Error: "Supabase no está disponible"**
```bash
# Verificar configuración
1. Revisar URL y anon key en supabase-config.js
2. Verificar conexión a internet
3. Comprobar estado de Supabase
4. Revisar políticas RLS en base de datos
```

### **Error: "Usuario no encontrado"**
```bash
# Verificar tabla users_balances
1. Ejecutar script SQL completo
2. Verificar políticas RLS
3. Comprobar autenticación de usuario
```

### **Error: "Límite diario alcanzado"**
```bash
# Verificar límites
1. Esperar reset diario (00:00 UTC)
2. Verificar función reset_daily_limits()
3. Comprobar configuración de dailyLimit
```

### **Problemas de Rendimiento**
```bash
# Optimizaciones
1. Reducir updateInterval en configuración
2. Limpiar historial antiguo
3. Optimizar consultas SQL
4. Usar índices apropiados
```

## 📈 **Roadmap y Futuras Funcionalidades**

### **Fase 2: Integración con Mainnet**
- 🔄 Conexión directa a blockchain RSC
- 🔄 Consenso PoW + PoS + IA
- 🔄 Validación real de bloques
- 🔄 Conversión de tokens de prueba a RSC reales

### **Fase 3: Funcionalidades Avanzadas**
- 🔄 Pool de minería
- 🔄 Dificultad dinámica
- 🔄 Competencias y rankings
- 🔄 NFTs de logros

### **Fase 4: Ecosistema Completo**
- 🔄 Marketplace de tokens
- 🔄 Staking y governance
- 🔄 Integración con DeFi
- 🔄 Apps móviles

## 🤝 **Contribuir al Proyecto**

### **Reportar Bugs**
1. Crear issue en GitHub
2. Describir el problema detalladamente
3. Incluir pasos para reproducir
4. Adjuntar logs de consola

### **Sugerir Mejoras**
1. Crear issue con etiqueta "enhancement"
2. Describir la funcionalidad deseada
3. Explicar el beneficio para usuarios
4. Proponer implementación

### **Pull Requests**
1. Fork del repositorio
2. Crear rama para tu feature
3. Implementar cambios
4. Crear PR con descripción clara

## 📞 **Soporte y Contacto**

### **Documentación**
- 📖 [Guía de Usuario](docs/user-guide.md)
- 🔧 [API Reference](docs/api-reference.md)
- 🚀 [Deployment Guide](docs/deployment.md)

### **Comunidad**
- 💬 [Discord](https://discord.gg/rscchain)
- 🐦 [Twitter](https://twitter.com/rscchain)
- 📧 [Email](mailto:support@rscchain.com)

### **Desarrolladores**
- 👨‍💻 [GitHub](https://github.com/rscchain)
- 📚 [Documentación Técnica](docs/technical/)
- 🐛 [Issues](https://github.com/rscchain/issues)

## 📄 **Licencia**

Este proyecto está bajo la licencia MIT. Ver [LICENSE](LICENSE) para más detalles.

## 🙏 **Agradecimientos**

- **Supabase** por la infraestructura de base de datos
- **Comunidad RSC Chain** por el feedback y testing
- **Contribuidores** que han ayudado al desarrollo
- **Usuarios** que prueban la plataforma

---

## 🎯 **¡Listo para Minar!**

Tu plataforma de minería RSC Chain está completamente configurada y lista para usar. Los usuarios pueden:

1. **Registrarse** con su email
2. **Iniciar sesión** en la plataforma
3. **Minar tokens** de prueba (10 por minuto)
4. **Acumular balance** hasta 2 RSC por día
5. **Ver estadísticas** en tiempo real
6. **Reclamar recompensas** cuando quieran

**¡La minería simulada está activa y la comunidad puede comenzar a construir!** 🚀⛏️

---

*Última actualización: Diciembre 2024*
*Versión: 1.0.0*
*Estado: ✅ Completamente Funcional*
