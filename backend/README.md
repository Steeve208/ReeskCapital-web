# RSC Mining Backend

Backend completo para el sistema de minería RSC con sistema de referidos integrado.

## 🚀 Características

### **Sistema de Usuarios**
- ✅ Registro de usuarios con email y username únicos
- ✅ Gestión de balances de RSC
- ✅ Sistema de códigos de invitación únicos
- ✅ Autenticación y autorización

### **Sistema de Referidos**
- ✅ Códigos de invitación únicos de 8 caracteres
- ✅ Comisión del 10% para referrers
- ✅ Tracking de referidos y comisiones
- ✅ Estadísticas de referidos

### **Sistema de Minería**
- ✅ Gestión de sesiones de minería de 24 horas
- ✅ Sincronización con frontend
- ✅ Cálculo automático de comisiones
- ✅ Historial de sesiones

### **API REST Completa**
- ✅ Endpoints de usuarios
- ✅ Endpoints de minería
- ✅ Endpoints de referidos
- ✅ Middleware de seguridad
- ✅ Rate limiting

## 📋 Requisitos

- **Node.js**: >= 18.0.0
- **npm**: >= 8.0.0
- **Supabase**: Proyecto configurado
- **PostgreSQL**: Base de datos

## 🛠️ Instalación

### 1. Clonar y configurar

```bash
cd backend
npm install
```

### 2. Configurar variables de entorno

```bash
cp env.example .env
```

Editar `.env` con tus credenciales:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
PORT=3000
NODE_ENV=development
```

### 3. Configurar base de datos

Ejecutar el script SQL en Supabase:

```bash
# Copiar y pegar el contenido de supabase-schema.sql en el SQL Editor de Supabase
```

### 4. Iniciar servidor

```bash
# Desarrollo
npm run dev

# Producción
npm start
```

## 📊 Estructura de Base de Datos

### **Tabla: users**
```sql
- id (UUID, PK)
- email (VARCHAR, UNIQUE)
- username (VARCHAR, UNIQUE)
- balance (DECIMAL)
- referral_code (VARCHAR, UNIQUE)
- referred_by (UUID, FK)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
- is_active (BOOLEAN)
```

### **Tabla: referrals**
```sql
- id (UUID, PK)
- referrer_id (UUID, FK)
- referred_id (UUID, FK)
- commission_rate (DECIMAL)
- total_commission (DECIMAL)
- created_at (TIMESTAMP)
```

### **Tabla: mining_sessions**
```sql
- id (UUID, PK)
- user_id (UUID, FK)
- session_id (VARCHAR, UNIQUE)
- start_time (TIMESTAMP)
- end_time (TIMESTAMP)
- duration_ms (BIGINT)
- tokens_mined (DECIMAL)
- hash_rate (DECIMAL)
- efficiency (DECIMAL)
- status (VARCHAR)
```

### **Tabla: transactions**
```sql
- id (UUID, PK)
- user_id (UUID, FK)
- type (VARCHAR)
- amount (DECIMAL)
- balance_before (DECIMAL)
- balance_after (DECIMAL)
- reference_id (UUID)
- description (TEXT)
- created_at (TIMESTAMP)
```

## 🔌 API Endpoints

### **Usuarios**

#### `POST /api/users/register`
Registrar nuevo usuario

```json
{
  "email": "user@example.com",
  "username": "username",
  "referralCode": "ABC12345" // Opcional
}
```

#### `GET /api/users/profile`
Obtener perfil del usuario

**Headers:**
```
X-User-ID: user-uuid
```

#### `GET /api/users/balance`
Obtener balance del usuario

#### `GET /api/users/referrals`
Obtener referidos del usuario

#### `GET /api/users/transactions`
Obtener historial de transacciones

#### `POST /api/users/validate-referral`
Validar código de referral

```json
{
  "referralCode": "ABC12345"
}
```

### **Minería**

#### `POST /api/mining/start`
Iniciar sesión de minería

```json
{
  "sessionId": "session-uuid",
  "startTime": 1703123456789,
  "endTime": 1703209856789,
  "hashRate": 1000,
  "efficiency": 100
}
```

#### `PUT /api/mining/update`
Actualizar sesión de minería

```json
{
  "sessionId": "session-uuid",
  "tokensMined": 1.234567,
  "hashRate": 1200,
  "efficiency": 110
}
```

#### `POST /api/mining/end`
Finalizar sesión de minería

```json
{
  "sessionId": "session-uuid",
  "tokensMined": 1.234567,
  "hashRate": 1200,
  "efficiency": 110
}
```

#### `GET /api/mining/active`
Obtener sesión activa

#### `GET /api/mining/history`
Obtener historial de minería

#### `POST /api/mining/sync`
Sincronizar datos de minería

### **Públicos**

#### `GET /api/ranking`
Obtener ranking de usuarios

#### `GET /api/mining/ranking`
Obtener ranking de mineros

#### `GET /api/stats`
Obtener estadísticas generales

## 🔧 Funciones de Base de Datos

### **generate_referral_code()**
Genera código de referral único de 8 caracteres

### **process_referral_commission(user_id, amount)**
Procesa comisión del 10% para referrers

### **register_user(email, username, referral_code)**
Registra nuevo usuario con sistema de referidos

### **update_user_balance(user_id, amount, type, description)**
Actualiza balance de usuario con comisiones automáticas

## 🛡️ Seguridad

- **CORS** configurado para dominios específicos
- **Helmet** para headers de seguridad
- **Rate Limiting** para prevenir abuso
- **Row Level Security (RLS)** en Supabase
- **Validación** de datos de entrada
- **Autenticación** por headers

## 📈 Monitoreo

### **Health Check**
```
GET /health
```

### **Logs**
- Logs estructurados con Winston
- Diferentes niveles (debug, info, warn, error)
- Rotación automática de logs

### **Métricas**
- Tiempo de respuesta
- Tasa de errores
- Uso de memoria
- Conexiones activas

## 🚀 Despliegue

### **Variables de Entorno de Producción**

```env
NODE_ENV=production
PORT=3000
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
CORS_ORIGINS=https://your-domain.com
```

### **Docker**

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

### **PM2**

```bash
npm install -g pm2
pm2 start server.js --name "rsc-mining-backend"
pm2 save
pm2 startup
```

## 🔄 Integración con Frontend

El frontend se integra automáticamente usando `rsc-mining-backend-integration.js`:

```javascript
// Inicializar integración
await window.RSCMiningBackend.initialize();

// Sincronizar datos de minería
await window.RSCMiningBackend.syncMiningData({
    tokensMined: 1.234567,
    isActive: true
});

// Obtener balance
const balance = await window.RSCMiningBackend.getUserBalance();
```

## 📝 Scripts Disponibles

```bash
npm start          # Iniciar servidor
npm run dev        # Modo desarrollo con nodemon
npm test           # Ejecutar tests
npm run lint       # Linter
npm run lint:fix   # Arreglar problemas de linting
```

## 🐛 Troubleshooting

### **Error de conexión a Supabase**
- Verificar variables de entorno
- Comprobar URL y keys de Supabase
- Verificar conectividad de red

### **Error de base de datos**
- Ejecutar script SQL completo
- Verificar permisos de usuario
- Comprobar configuración de RLS

### **Error de CORS**
- Verificar configuración de CORS_ORIGINS
- Comprobar headers de respuesta
- Verificar preflight requests

## 📞 Soporte

Para soporte técnico o reportar bugs:

- **Email**: support@rscchain.com
- **GitHub**: [Issues](https://github.com/your-org/rsc-mining-backend/issues)
- **Documentación**: [Wiki](https://github.com/your-org/rsc-mining-backend/wiki)

## 📄 Licencia

MIT License - ver [LICENSE](LICENSE) para más detalles.