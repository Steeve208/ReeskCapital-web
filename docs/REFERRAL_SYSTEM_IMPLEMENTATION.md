# 🎯 RSC Referral System - Implementation Guide

## Sistema de Referidos RSC - Guía de Implementación

### **Arquitectura del Sistema**

El sistema de referidos está diseñado con una arquitectura híbrida que permite funcionar tanto en modo local (para desarrollo/demo) como con backend completo (para producción).

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │   Database      │
│   (React/Vue)   │◄──►│   (Node.js)     │◄──►│   (PostgreSQL)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Local Storage  │    │   Redis Cache   │    │   Audit Logs    │
│  (Fallback)     │    │   (Optional)    │    │   (Security)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### **Flujo de Implementación**

#### **1. Modo Desarrollo/Demo (Actual)**
- ✅ **Frontend completo** con localStorage
- ✅ **Validaciones locales** básicas
- ✅ **Códigos de prueba** pre-generados
- ✅ **Simulación de ganancias** en tiempo real

#### **2. Modo Producción (Backend)**
- 🔄 **API REST** completa
- 🔄 **Base de datos** PostgreSQL
- 🔄 **Validaciones** de seguridad
- 🔄 **Auditoría** completa
- 🔄 **Cache** Redis (opcional)

### **Implementación Paso a Paso**

#### **Paso 1: Configurar Base de Datos**

```sql
-- Ejecutar migración
psql -d rsc_database -f backend/migrations/create_referral_system.sql
```

#### **Paso 2: Configurar Backend**

```javascript
// backend/routes/index.js
const referralRoutes = require('./referrals');
app.use('/api/referrals', referralRoutes);
```

#### **Paso 3: Configurar Variables de Entorno**

```env
# .env
DATABASE_URL=postgresql://user:password@localhost:5432/rsc_database
JWT_SECRET=your_jwt_secret_here
REDIS_URL=redis://localhost:6379
REFERRAL_BONUS_RATE=0.10
MAX_REFERRALS_PER_USER=10000
```

#### **Paso 4: Actualizar Frontend**

```javascript
// Cambiar modo de operación
const USE_BACKEND = process.env.NODE_ENV === 'production';

if (USE_BACKEND) {
    // Usar funciones del backend
    const code = await generateReferralCodeBackend(userId);
} else {
    // Usar funciones locales
    const code = generateReferralCodeLocal(userId);
}
```

### **Características del Sistema**

#### **Seguridad**
- ✅ **Validación de códigos** en backend
- ✅ **Prevención de fraude** (auto-referencia)
- ✅ **Límites de uso** por IP/usuario
- ✅ **Auditoría completa** de acciones
- ✅ **Tokens JWT** para autenticación

#### **Escalabilidad**
- ✅ **Cache Redis** para consultas frecuentes
- ✅ **Índices de base de datos** optimizados
- ✅ **Paginación** en consultas grandes
- ✅ **Rate limiting** por IP/usuario

#### **Monitoreo**
- ✅ **Logs de auditoría** detallados
- ✅ **Métricas** de uso del sistema
- ✅ **Alertas** por actividad sospechosa
- ✅ **Dashboard** de administración

### **API Endpoints**

#### **Generar Código de Referido**
```http
POST /api/referrals/generate
Authorization: Bearer <token>
Content-Type: application/json

{
  "user_id": "uuid",
  "platform": "web_mining"
}
```

#### **Validar Código**
```http
POST /api/referrals/validate
Content-Type: application/json

{
  "referral_code": "RSC_userId_timestamp_random"
}
```

#### **Procesar Referido**
```http
POST /api/referrals/process
Authorization: Bearer <token>
Content-Type: application/json

{
  "referral_code": "RSC_userId_timestamp_random",
  "user_id": "uuid",
  "ip_address": "192.168.1.1",
  "user_agent": "Mozilla/5.0..."
}
```

#### **Obtener Estadísticas**
```http
GET /api/referrals/stats/:userId
Authorization: Bearer <token>
```

### **Configuración de Producción**

#### **1. Base de Datos**
```sql
-- Crear usuario de base de datos
CREATE USER rsc_referrals WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE rsc_database TO rsc_referrals;

-- Crear índices adicionales
CREATE INDEX CONCURRENTLY idx_referral_earnings_created_at 
ON referral_earnings(created_at) WHERE status = 'pending';
```

#### **2. Redis Cache**
```javascript
// Configurar Redis para cache
const redis = require('redis');
const client = redis.createClient({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD
});
```

#### **3. Rate Limiting**
```javascript
// Implementar rate limiting
const rateLimit = require('express-rate-limit');

const referralLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por IP
  message: 'Demasiadas solicitudes de referidos'
});
```

### **Monitoreo y Alertas**

#### **Métricas Importantes**
- **Códigos generados** por día
- **Referidos procesados** por día
- **Ganancias calculadas** por día
- **Errores de validación** por día
- **Actividad sospechosa** por IP

#### **Alertas Configurables**
- **Spam de códigos** (>10 códigos/hora por IP)
- **Uso excesivo** (>1000 validaciones/hora por IP)
- **Errores de base de datos** (>5% error rate)
- **Ganancias anómalas** (>10x promedio)

### **Testing**

#### **Tests Unitarios**
```javascript
// tests/referral-system.test.js
describe('Referral System', () => {
  test('should generate valid referral code', async () => {
    const code = await generateReferralCode('user123');
    expect(code).toMatch(/^RSC_user123_\d+_\w+$/);
  });
  
  test('should prevent self-referral', async () => {
    await expect(processReferral(code, 'user123'))
      .rejects.toThrow('No puedes referirte a ti mismo');
  });
});
```

#### **Tests de Integración**
```javascript
// tests/referral-integration.test.js
describe('Referral Integration', () => {
  test('should process referral end-to-end', async () => {
    // 1. Generar código
    const code = await generateReferralCode('user1');
    
    // 2. Usar código
    const result = await processReferral(code, 'user2');
    
    // 3. Verificar relación
    expect(result.referrer_id).toBe('user1');
    expect(result.referred_id).toBe('user2');
  });
});
```

### **Deployment**

#### **Docker Compose**
```yaml
# docker-compose.yml
version: '3.8'
services:
  postgres:
    image: postgres:13
    environment:
      POSTGRES_DB: rsc_database
      POSTGRES_USER: rsc_referrals
      POSTGRES_PASSWORD: secure_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
      
  redis:
    image: redis:6-alpine
    command: redis-server --requirepass redis_password
    
  app:
    build: .
    environment:
      DATABASE_URL: postgresql://rsc_referrals:secure_password@postgres:5432/rsc_database
      REDIS_URL: redis://:redis_password@redis:6379
    depends_on:
      - postgres
      - redis
```

#### **Kubernetes**
```yaml
# k8s/referral-system.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: rsc-referral-system
spec:
  replicas: 3
  selector:
    matchLabels:
      app: rsc-referral-system
  template:
    metadata:
      labels:
        app: rsc-referral-system
    spec:
      containers:
      - name: referral-api
        image: rsc/referral-system:latest
        ports:
        - containerPort: 3000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: rsc-secrets
              key: database-url
```

### **Mantenimiento**

#### **Tareas Diarias**
- ✅ **Verificar logs** de errores
- ✅ **Monitorear métricas** de uso
- ✅ **Revisar alertas** de seguridad

#### **Tareas Semanales**
- ✅ **Calcular ganancias** de referidos
- ✅ **Limpiar logs** antiguos
- ✅ **Actualizar estadísticas**

#### **Tareas Mensuales**
- ✅ **Auditoría de seguridad**
- ✅ **Optimización de base de datos**
- ✅ **Análisis de rendimiento**

### **Consideraciones de Seguridad**

1. **Validación de entrada** en todos los endpoints
2. **Rate limiting** para prevenir abuso
3. **Auditoría completa** de todas las acciones
4. **Encriptación** de datos sensibles
5. **Monitoreo** de actividad sospechosa

### **Escalabilidad Futura**

1. **Microservicios** para diferentes funcionalidades
2. **Message queues** para procesamiento asíncrono
3. **CDN** para contenido estático
4. **Load balancers** para alta disponibilidad
5. **Monitoring** avanzado con Prometheus/Grafana

---

## 🚀 Resumen

El sistema de referidos RSC está diseñado para ser:
- **Seguro**: Validaciones robustas y auditoría completa
- **Escalable**: Arquitectura modular y cache inteligente
- **Mantenible**: Código limpio y documentación completa
- **Monitoreable**: Métricas detalladas y alertas configurables

**Modo actual**: Funciona completamente en frontend para desarrollo y demo
**Modo producción**: Backend completo con base de datos y validaciones de seguridad
