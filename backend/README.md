# RSC Mining Backend

Complete backend for the RSC mining system with integrated referral system.

## 🚀 Features

### **User System**
- ✅ User registration with unique email and username
- ✅ RSC balance management
- ✅ Unique invitation code system
- ✅ Authentication and authorization

### **Referral System**
- ✅ Unique 8-character invitation codes
- ✅ 10% commission for referrers
- ✅ Referral and commission tracking
- ✅ Referral statistics

### **Mining System**
- ✅ 24-hour mining session management
- ✅ Frontend synchronization
- ✅ Automatic commission calculation
- ✅ Session history

### **Complete REST API**
- ✅ User endpoints
- ✅ Mining endpoints
- ✅ Referral endpoints
- ✅ Security middleware
- ✅ Rate limiting

## 📋 Requirements

- **Node.js**: >= 18.0.0
- **npm**: >= 8.0.0
- **Supabase**: Configured project
- **PostgreSQL**: Database

## 🛠️ Installation

### 1. Clone and configure

```bash
cd backend
npm install
```

### 2. Configure environment variables

```bash
cp env.example .env
```

Edit `.env` with your credentials:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
PORT=3000
NODE_ENV=development
```

### 3. Configure database

Run the SQL script in Supabase:

```bash
# Copy and paste the content of supabase-schema.sql in Supabase SQL Editor
```

### 4. Start server

```bash
# Development
npm run dev

# Production
npm start
```

## 📊 Database Structure

### **Table: users**
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

### **Table: referrals**
```sql
- id (UUID, PK)
- referrer_id (UUID, FK)
- referred_id (UUID, FK)
- commission_rate (DECIMAL)
- total_commission (DECIMAL)
- created_at (TIMESTAMP)
```

### **Table: mining_sessions**
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

### **Table: transactions**
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

### **Users**

#### `POST /api/users/register`
Register new user

```json
{
  "email": "user@example.com",
  "username": "username",
  "referralCode": "ABC12345" // Optional
}
```

#### `GET /api/users/profile`
Get user profile

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