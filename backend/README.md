# 🚀 RSC Mining Backend v2.0.0

Backend completo para sistema de minería RSC con **ranking público**, **API pública con caché**, **controles anti‑abuso**, **exportación CSV**, **paginación**, **métricas**, **Docker** y **migraciones SQL**.

## ✨ Características Principales

- 🔐 **Sistema de Autenticación JWT** para usuarios y administradores
- ⛏️ **Sistema de Minería** con cooldown y límites diarios
- 🏆 **Leaderboard Público** con múltiples períodos (día, semana, mes, todo el tiempo)
- 🚀 **API Pública** con caché optimizado
- 👑 **Panel de Administración** completo
- 📊 **Exportación de Datos** a CSV
- 🛡️ **Sistema Anti-Abuso** con rate limiting y auditoría
- 📈 **Métricas y Monitoreo** del sistema
- 🗄️ **Migraciones Automáticas** de base de datos
- 📝 **Auditoría Completa** de acciones
- 🐳 **Docker** y **docker-compose** incluidos

## 🏗️ Arquitectura

```
rsc-mining-backend/
├── src/                    # Código fuente
│   ├── config/            # Configuración y conexiones
│   ├── security/          # Autenticación y rate limiting
│   ├── services/          # Lógica de negocio
│   ├── routes/            # Endpoints de la API
│   └── utils/             # Utilidades y helpers
├── migrations/            # Migraciones de base de datos
├── docker-compose.yml     # Orquestación de servicios
├── Dockerfile            # Imagen del backend
└── README.md             # Esta documentación
```

## 🚀 Instalación Rápida

### 1. Clonar y configurar

```bash
# Clonar el repositorio
git clone <repo-url>
cd rsc-mining-backend

# Instalar dependencias
npm install

# Copiar variables de entorno
cp env.example .env
```

### 2. Configurar variables de entorno

Edita el archivo `.env` con tus configuraciones:

```bash
# PostgreSQL
DATABASE_URL=postgres://user:password@localhost:5432/rsc

# Auth
JWT_SECRET=tu_jwt_secret_super_seguro
ADMIN_JWT_SECRET=tu_admin_jwt_secret_super_seguro

# Seguridad
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX=120

# Minería
MINE_COOLDOWN_SECONDS=60
MINE_REWARD_MIN=0.001
MINE_REWARD_MAX=0.05
MINE_DAILY_CAP=5
```

### 3. Ejecutar migraciones

```bash
# Ejecutar todas las migraciones
npm run migrate

# Ver estado de migraciones
npm run migrate status

# Ejecutar migración específica
npm run migrate run 001_init.sql
```

### 4. Iniciar servidor

```bash
# Desarrollo
npm run dev

# Producción
npm start
```

## 🐳 Docker (Recomendado)

### Inicio rápido con Docker

```bash
# Construir e iniciar todos los servicios
docker-compose up -d

# Ver logs
docker-compose logs -f rsc-backend

# Parar servicios
docker-compose down
```

### Servicios incluidos

- **PostgreSQL 15** - Base de datos principal
- **Redis 7** - Caché (opcional)
- **RSC Backend** - API de minería
- **pgAdmin** - Gestión de base de datos (desarrollo)
- **Nginx** - Proxy reverso (producción)

## 📚 API Endpoints

### 🔐 Autenticación

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `POST` | `/auth/register` | Registro de usuario |
| `POST` | `/auth/login` | Login de usuario |
| `POST` | `/auth/admin/login` | Login de administrador |
| `GET` | `/auth/profile` | Perfil del usuario |

### ⛏️ Minería

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `POST` | `/mine/mine` | Ejecutar minería |
| `GET` | `/mine/balance` | Obtener balance |
| `GET` | `/mine/stats` | Estadísticas de minería |
| `GET` | `/mine/history` | Historial de minería |
| `GET` | `/mine/status` | Estado de minería |

### 🌐 API Pública

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/public/leaderboard` | Leaderboard público |
| `GET` | `/public/stats` | Estadísticas del sistema |
| `GET` | `/public/leaderboard/top10` | Top 10 mineros |
| `GET` | `/public/periods` | Períodos disponibles |

### 👑 Administración

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/admin/dashboard` | Dashboard administrativo |
| `GET` | `/admin/users` | Lista de usuarios |
| `GET` | `/admin/mining-events` | Eventos de minería |
| `GET` | `/admin/export/users.csv` | Exportar usuarios a CSV |
| `GET` | `/admin/export/mining.csv` | Exportar minería a CSV |

### 📊 Sistema

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/health` | Health check |
| `GET` | `/metrics` | Métricas del sistema |
| `GET` | `/system/info` | Información del sistema |

## 🔧 Configuración

### Variables de Entorno

| Variable | Descripción | Valor por Defecto |
|----------|-------------|-------------------|
| `DATABASE_URL` | URL de conexión PostgreSQL | - |
| `JWT_SECRET` | Secreto para JWT de usuarios | - |
| `ADMIN_JWT_SECRET` | Secreto para JWT de admins | - |
| `RATE_LIMIT_WINDOW_MS` | Ventana de rate limiting | `60000` |
| `RATE_LIMIT_MAX` | Máximo de requests por ventana | `120` |
| `MINE_COOLDOWN_SECONDS` | Segundos entre minas | `60` |
| `MINE_REWARD_MIN` | Recompensa mínima | `0.001` |
| `MINE_REWARD_MAX` | Recompensa máxima | `0.05` |
| `MINE_DAILY_CAP` | Límite diario de recompensas | `5` |
| `CACHE_TTL_SECONDS` | TTL del caché | `30` |

### Configuración de Base de Datos

El sistema incluye:

- **UUIDs** para todos los IDs
- **Índices optimizados** para consultas rápidas
- **Triggers automáticos** para auditoría
- **Vistas materializadas** para estadísticas
- **Funciones PL/pgSQL** para operaciones complejas

## 🛡️ Seguridad

### Características de Seguridad

- **JWT separado** para usuarios y administradores
- **Rate limiting** por IP y endpoint
- **Validación de entrada** con esquemas
- **Auditoría completa** de acciones
- **Headers de seguridad** con Helmet
- **CORS configurable** por entorno
- **Contraseñas hasheadas** con bcrypt (costo 12)

### Anti-Abuso

- **Cooldown** entre minas
- **Límite diario** de recompensas
- **Transacciones atómicas** con bloqueos
- **Auditoría de IP** y User-Agent
- **Rate limiting** por tipo de operación

## 📊 Caché y Rendimiento

### Sistema de Caché

- **NodeCache** por defecto (intercambiable por Redis)
- **TTL configurable** por tipo de dato
- **Invalidación automática** por patrón
- **Estadísticas** de hit/miss

### Optimizaciones

- **Pool de conexiones** PostgreSQL
- **Consultas optimizadas** con índices
- **Paginación** en todos los endpoints
- **Lazy loading** de datos pesados

## 🗄️ Base de Datos

### Esquema Principal

```sql
-- Usuarios
users (id, email, password_hash, wallet_address, mined_balance, status, ...)

-- Eventos de minería
mining_events (id, user_id, reward, ip, user_agent, created_at, ...)

-- Administradores
admins (id, email, password_hash, ...)

-- Auditoría
admin_actions (id, admin_user_id, target_user_id, action_type, ...)
```

### Migraciones

```bash
# Ejecutar migraciones
npm run migrate

# Ver estado
npm run migrate status

# Ejecutar específica
npm run migrate run 001_init.sql
```

## 🧪 Testing

### Ejecutar Tests

```bash
# Tests unitarios
npm test

# Tests de integración
npm run test:integration

# Coverage
npm run test:coverage
```

### Endpoints de Testing

- `/health` - Verificar salud del sistema
- `/metrics` - Métricas de rendimiento
- `/system/info` - Información del sistema

## 🚀 Despliegue

### Producción

```bash
# Construir imagen
docker build -t rsc-mining-backend .

# Ejecutar con docker-compose
docker-compose -f docker-compose.yml --profile production up -d
```

### Variables de Producción

```bash
NODE_ENV=production
JWT_SECRET=<secret-super-seguro>
ADMIN_JWT_SECRET=<admin-secret-super-seguro>
DATABASE_URL=<postgresql-production-url>
```

### Monitoreo

- **Health checks** automáticos
- **Métricas** en tiempo real
- **Logs estructurados** con Morgan
- **Auditoría** completa de acciones

## 🔄 Migración desde SQLite

Si tienes un sistema existente en SQLite:

1. **Exportar datos** desde SQLite
2. **Ejecutar migraciones** PostgreSQL
3. **Importar datos** a las nuevas tablas
4. **Verificar integridad** de los datos

## 📈 Escalabilidad

### Horizontal

- **Load balancer** con Nginx
- **Múltiples instancias** del backend
- **Redis compartido** para caché
- **Base de datos** con réplicas

### Vertical

- **Optimización de consultas** con índices
- **Caché inteligente** por tipo de dato
- **Pool de conexiones** configurable
- **Rate limiting** granular

## 🐛 Troubleshooting

### Problemas Comunes

1. **Error de conexión a PostgreSQL**
   - Verificar `DATABASE_URL`
   - Comprobar que PostgreSQL esté ejecutándose

2. **Error de JWT**
   - Verificar `JWT_SECRET` y `ADMIN_JWT_SECRET`
   - Comprobar formato de token

3. **Rate limiting excesivo**
   - Ajustar `RATE_LIMIT_MAX` y `RATE_LIMIT_WINDOW_MS`
   - Verificar logs de rate limiting

### Logs

```bash
# Ver logs del backend
docker-compose logs -f rsc-backend

# Ver logs de PostgreSQL
docker-compose logs -f postgres

# Ver logs de Redis
docker-compose logs -f redis
```

## 🤝 Contribución

### Estructura del Código

- **ES6+** con async/await
- **Módulos ES** con require
- **Promesas** para operaciones asíncronas
- **Try-catch** para manejo de errores

### Convenciones

- **Camel case** para variables y funciones
- **Snake case** para base de datos
- **Pascal case** para clases
- **Comentarios JSDoc** para funciones

## 📄 Licencia

Este proyecto está bajo la licencia ISC.

## 🆘 Soporte

- **Documentación**: Este README
- **Issues**: GitHub Issues
- **Email**: support@rsc.com
- **Discord**: [Enlace al servidor]

## 🎯 Roadmap

### v2.1.0
- [ ] WebSocket para actualizaciones en tiempo real
- [ ] Sistema de notificaciones push
- [ ] API GraphQL opcional

### v2.2.0
- [ ] Integración con wallets reales
- [ ] Sistema de staking
- [ ] Marketplace de NFTs

### v3.0.0
- [ ] Migración a mainnet
- [ ] Smart contracts integrados
- [ ] DeFi features

---

**¡Gracias por usar RSC Mining Backend! 🚀⛏️**
