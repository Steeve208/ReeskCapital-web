# 🚀 Integración de Minería Mainnet-Ready - RSC Chain

## 📋 **Resumen**

Este documento explica cómo integrar el nuevo sistema de minería mainnet-ready con tu backend existente de RSC Chain. El sistema permite transicionar suavemente de testnet a mainnet, manteniendo compatibilidad con tu infraestructura actual.

## 🏗️ **Arquitectura de Integración**

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND MAINNET-READY                   │
│  (mine-mainnet-ready.html + mining-mainnet-ready.js)       │
├─────────────────────────────────────────────────────────────┤
│                    NUEVAS RUTAS API                         │
│  (routes-mining-mainnet.js)                                 │
├─────────────────────────────────────────────────────────────┤
│                    SERVICIO DE INTEGRACIÓN                  │
│  (mining-mainnet-service.js)                                │
├─────────────────────────────────────────────────────────────┤
│                    BACKEND EXISTENTE                        │
│  (routes.js + MiningDatabase)                               │
├─────────────────────────────────────────────────────────────┤
│                    BLOCKCHAIN RSC CHAIN                     │
│  (testnet/mainnet)                                          │
└─────────────────────────────────────────────────────────────┘
```

## 📁 **Archivos Creados**

### **1. Rutas API (`routes-mining-mainnet.js`)**
- **Verificación de estado de blockchain**
- **Gestión de sesiones de minería**
- **Transacciones de recompensas**
- **Sincronización con blockchain**
- **Health checks y monitoreo**

### **2. Servicio de Integración (`mining-mainnet-service.js`)**
- **Lógica de negocio para minería mainnet**
- **Validaciones y seguridad**
- **Sincronización automática**
- **Manejo de errores y fallbacks**

### **3. Configuración (`mining-mainnet.config.js`)**
- **Configuración de blockchain**
- **Parámetros de minería**
- **Configuración de seguridad**
- **Monitoreo y alertas**

### **4. Variables de Entorno (`env.mining-mainnet.example`)**
- **Configuración completa del sistema**
- **Variables para desarrollo y producción**
- **Configuración de base de datos**

### **5. Script de Pruebas (`test-mining-mainnet-integration.js`)**
- **Pruebas automatizadas de integración**
- **Verificación de endpoints**
- **Validación de funcionalidad**

## 🔧 **Instalación y Configuración**

### **Paso 1: Copiar Archivos**
```bash
# Los archivos ya están creados en tu proyecto
# Verifica que estén en las ubicaciones correctas:
backend/
├── routes-mining-mainnet.js
├── services/mining-mainnet-service.js
├── config/mining-mainnet.config.js
├── env.mining-mainnet.example
└── test-mining-mainnet-integration.js
```

### **Paso 2: Configurar Variables de Entorno**
```bash
# Copiar el archivo de ejemplo
cp backend/env.mining-mainnet.example backend/.env

# Editar las variables según tu configuración
nano backend/.env
```

**Variables importantes a configurar:**
```bash
# Blockchain
RSC_BLOCKCHAIN_API=https://rsc-chain-production.up.railway.app/
RSC_NETWORK=testnet

# Base de datos
DB_TYPE=sqlite
DB_PATH=./database/mining-mainnet.db

# Seguridad
ENCRYPTION_KEY=tu_clave_de_32_caracteres_aqui
```

### **Paso 3: Verificar Dependencias**
```bash
# Asegúrate de tener estas dependencias en package.json
npm install axios express
```

### **Paso 4: Reiniciar el Servidor**
```bash
# El servidor ya está configurado para usar las nuevas rutas
# Solo reinicia para aplicar los cambios
npm restart
```

## 🚀 **Uso de la API**

### **1. Verificar Estado de Blockchain**
```bash
GET /api/blockchain/status
```

**Respuesta:**
```json
{
  "network": "testnet",
  "isMainnet": false,
  "chainId": 1,
  "blockHeight": 0,
  "status": "connected"
}
```

### **2. Iniciar Sesión de Minería**
```bash
POST /api/mining/session/start
```

**Body:**
```json
{
  "walletAddress": "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
  "sessionId": "session_123456",
  "hashPower": 10.0,
  "network": "testnet"
}
```

### **3. Actualizar Progreso**
```bash
POST /api/mining/progress/update
```

**Body:**
```json
{
  "sessionId": "session_123456",
  "currentTokens": 5.5,
  "currentHashRate": 10.0,
  "network": "testnet"
}
```

### **4. Detener Sesión**
```bash
POST /api/mining/session/stop
```

**Body:**
```json
{
  "sessionId": "session_123456",
  "endTime": "2024-12-19T10:30:00.000Z",
  "tokensEarned": 8.5,
  "network": "testnet"
}
```

### **5. Procesar Recompensa**
```bash
POST /api/transaction/mining-reward
```

**Body:**
```json
{
  "from": "0x0000000000000000000000000000000000000000",
  "to": "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
  "amount": 8.5,
  "type": "mining_reward",
  "sessionId": "session_123456",
  "network": "testnet"
}
```

## 🧪 **Pruebas de Integración**

### **Ejecutar Todas las Pruebas**
```bash
cd backend
node test-mining-mainnet-integration.js
```

### **Ejecutar Pruebas Específicas**
```javascript
const { testBlockchainStatus, testMiningSessionStart } = require('./test-mining-mainnet-integration');

// Probar estado de blockchain
await testBlockchainStatus();

// Probar inicio de sesión
await testMiningSessionStart();
```

## 🔄 **Flujo de Integración**

### **1. Modo Testnet (Actual)**
```
Frontend → API Routes → Mining Service → Local Database
```

### **2. Modo Mainnet (Cuando esté listo)**
```
Frontend → API Routes → Mining Service → Blockchain RSC Chain
```

### **3. Transición Automática**
```
Sistema detecta mainnet → Habilita sincronización → Convierte tokens
```

## 🛡️ **Seguridad y Validaciones**

### **Validaciones Implementadas**
- **Rate limiting**: 100 requests por minuto
- **Validación de sesiones**: Máximo 1 sesión concurrente
- **Cooldown**: 1 hora entre sesiones
- **Límite diario**: Máximo 1 sesión por día
- **Validación de wallets**: Formato Ethereum válido
- **Protección contra fraude**: Detección de bots

### **Configuración de Seguridad**
```javascript
// En mining-mainnet.config.js
security: {
  rateLimit: {
    enabled: true,
    maxRequests: 100,
    windowMs: 60000
  },
  sessionValidation: {
    enabled: true,
    maxConcurrentSessions: 1,
    sessionTimeout: 30 * 60 * 1000
  }
}
```

## 📊 **Monitoreo y Métricas**

### **Health Checks**
```bash
GET /api/blockchain/health
GET /health
```

### **Métricas del Sistema**
```bash
GET /api/mining/system-stats
```

### **Estado de Minería**
```bash
GET /api/mining/status/:walletAddress
```

## 🔧 **Personalización**

### **Modificar Configuración**
```javascript
// En mining-mainnet.config.js
module.exports = {
  mining: {
    session: {
      maxDuration: 24 * 60 * 60 * 1000, // 24 horas
      cooldownPeriod: 60 * 60 * 1000,   // 1 hora
      maxSessionsPerDay: 1
    },
    rewards: {
      baseRate: 0.001,                   // tokens por segundo
      hashMultiplier: 0.2,               // multiplicador por hash power
      maxDailyReward: 100.0              // máximo diario
    }
  }
};
```

### **Agregar Nuevas Validaciones**
```javascript
// En mining-mainnet-service.js
async validateMiningSession(sessionData) {
  // Validaciones existentes...
  
  // Tu validación personalizada
  if (sessionData.customField) {
    // Lógica de validación
  }
  
  return true;
}
```

## 🚨 **Solución de Problemas**

### **Error: "Módulo no encontrado"**
```bash
# Verificar que los archivos estén en las ubicaciones correctas
ls -la backend/services/
ls -la backend/config/
```

### **Error: "Base de datos no inicializada"**
```bash
# Verificar que MiningDatabase esté funcionando
# Revisar logs del servidor
tail -f backend/logs/server.log
```

### **Error: "Blockchain no disponible"**
```bash
# Verificar conexión a RSC Chain
curl https://rsc-chain-production.up.railway.app/health

# Verificar variables de entorno
echo $RSC_BLOCKCHAIN_API
```

### **Error: "Permisos denegados"**
```bash
# Verificar permisos de archivos
chmod 644 backend/.env
chmod 755 backend/services/
```

## 📈 **Próximos Pasos**

### **1. Integración con Base de Datos Existente**
- Conectar `MiningMainnetService` con tu `MiningDatabase`
- Migrar datos existentes si es necesario
- Implementar sincronización bidireccional

### **2. Configuración de Supabase (Opcional)**
- Configurar variables de entorno de Supabase
- Implementar persistencia cloud adicional
- Sincronización multi-dispositivo

### **3. Monitoreo Avanzado**
- Implementar alertas por email/webhook
- Dashboard de métricas en tiempo real
- Logs estructurados con rotación

### **4. Testing Automatizado**
- Integrar pruebas en CI/CD
- Cobertura de código
- Pruebas de carga y stress

## 📚 **Documentación Adicional**

- [Arquitectura de Minería](./docs/technical/MINING_MAINNET_ARCHITECTURE.md)
- [API Reference](./docs/API_REFERENCE.md)
- [Guía de Usuario](./docs/USER_GUIDE.md)
- [Troubleshooting](./docs/TROUBLESHOOTING.md)

## 🤝 **Soporte**

Si encuentras problemas o tienes preguntas:

1. **Revisar logs del servidor**
2. **Ejecutar script de pruebas**
3. **Verificar configuración de variables de entorno**
4. **Consultar documentación de RSC Chain**

---

**¡La integración está lista para usar! 🎉**

Tu sistema de minería ahora es compatible con mainnet y mantiene toda la funcionalidad existente mientras agrega capacidades avanzadas para la transición futura.
