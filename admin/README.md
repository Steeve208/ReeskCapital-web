# RSC Chain - Panel de Administración

Panel de control modular para administrar todos los aspectos de RSC Chain Web.

## 📁 Estructura de Archivos

```
admin/
├── index.html              # Panel principal (requiere autenticación)
├── login.html              # Página de inicio de sesión
├── css/
│   ├── admin.css          # Estilos principales del panel
│   ├── components.css     # Estilos de componentes (próximamente)
│   └── modules.css        # Estilos de módulos específicos (próximamente)
├── js/
│   ├── admin.js           # Funciones principales y navegación
│   └── modules/           # Módulos individuales
│       ├── dashboard.js   # Dashboard y estadísticas
│       ├── content.js     # Gestión de contenido
│       ├── users.js       # Gestión de usuarios
│       ├── metrics.js     # Métricas del sistema
│       ├── campaigns.js   # Campañas y eventos
│       ├── rewards.js     # Motor de recompensas
│       ├── jobs.js        # Automatización
│       ├── treasury.js    # Tesorería
│       ├── admins.js      # Administradores
│       ├── audit.js       # Log de auditoría
│       └── settings.js    # Configuración
└── assets/                # Recursos del panel (próximamente)
```

## 🗄️ Base de Datos

El esquema SQL completo se encuentra en:
```
backend/migrations/admin_panel_schema.sql
```

### Pasos para configurar Supabase:

1. **Crear proyecto en Supabase**
   - Ve a https://supabase.com
   - Crea un nuevo proyecto

2. **Ejecutar el esquema SQL**
   - Copia el contenido de `admin_panel_schema.sql`
   - En Supabase: SQL Editor > Nueva consulta
   - Pega y ejecuta el script completo

3. **Obtener credenciales**
   - Project Settings > API
   - Copia:
     - `Project URL` (SUPABASE_URL)
     - `anon public` key (SUPABASE_ANON_KEY)

4. **Configurar en el código**
   - Edita `admin/js/admin.js`
   - Reemplaza:
     ```javascript
     const SUPABASE_URL = 'TU_URL_AQUI';
     const SUPABASE_ANON_KEY = 'TU_KEY_AQUI';
     ```

## 🔐 Seguridad

### Row Level Security (RLS)

Las políticas RLS deben configurarse en Supabase para:
- Admins solo pueden ver sus propios datos
- Super Admin puede ver todo
- Logs de auditoría son solo lectura

### Autenticación

- Tokens generados y almacenados en localStorage
- Sesiones verificadas en cada carga de módulo
- Logout automático al expirar sesión

### Contraseñas

**IMPORTANTE**: Implementar hashing de contraseñas antes de producción.

Recomendado:
```javascript
// Usar bcrypt o argon2 para hashear contraseñas
const hashedPassword = await bcrypt.hash(password, 10);
```

## 📊 Módulos

### 1. Dashboard
- Estadísticas generales
- Gráficas de usuarios, métricas
- Actividad reciente

### 2. Contenido
- Banners y anuncios
- Páginas dinámicas
- Configuración del sitio

### 3. Usuarios
- Lista de usuarios registrados
- Buscar y filtrar
- Ver perfil, wallet, actividad
- Bloquear/desbloquear
- Soporte (tickets)

### 4. Métricas
- Métricas genéricas configurables
- Actualización manual o automática
- Historial de cambios
- Categorías: social, platform, mining, staking

### 5. Campañas
- Crear eventos y campañas
- Definir metas (milestones)
- Tareas para usuarios
- Seguimiento de progreso

### 6. Recompensas
- **Reglas**: Crear triggers y condiciones
- **Lotes**: Procesar distribuciones masivas
- **Distribuciones**: Ver pagos individuales
- Aprobaciones y auditoría

### 7. Automatización (Jobs)
- Tareas programadas (cron)
- Ejecutar acciones automáticas
- Ver historial de ejecuciones
- Logs de errores

### 8. Tesorería
- Balance de wallets
- Límites diarios/semanales/mensuales
- Transacciones pendientes
- Aprobaciones manuales
- Ledger completo

### 9. Administradores
- Crear/editar admins
- Asignar roles
- Permisos granulares
- Estado y último login

### 10. Auditoría
- Log de todas las acciones
- Filtros por módulo, admin, fecha
- IP y User Agent
- Detalles en JSON

### 11. Configuración
- Modo mantenimiento
- Links de redes sociales
- Bonos y recompensas
- Kill switches

## 🎯 Casos de Uso

### Ejemplo: Campaña de 2K Seguidores

1. **Crear métrica** (Métricas)
   ```
   Key: youtube_followers
   Name: Seguidores de YouTube
   Target: 2000
   ```

2. **Crear campaña** (Campañas)
   ```
   Name: Campaña 2K YouTube
   Type: milestone
   Dates: Inicio - Fin
   ```

3. **Crear milestone** (dentro de campaña)
   ```
   Name: 2K Seguidores Alcanzados
   Metric: youtube_followers
   Target: 2000
   Reward: 100 RSC por usuario
   ```

4. **Crear regla de recompensa** (Recompensas)
   ```
   Trigger: metric (youtube_followers >= 2000)
   Eligibility: usuarios registrados antes de X fecha
   Reward: 100 RSC
   Approval: manual
   ```

5. **Actualizar métrica** (Métricas)
   - Cuando llegues a 2K, actualiza el valor

6. **Ejecutar lote** (Recompensas > Lotes)
   - La regla se dispara automáticamente
   - Revisar lista de beneficiarios
   - Aprobar y ejecutar

7. **Auditar** (Auditoría)
   - Ver quién hizo qué
   - Verificar distribuciones

## 🚀 Desarrollo

### Agregar nuevo módulo:

1. Crear archivo `js/modules/mi-modulo.js`
2. Implementar función `loadMiModulo()`
3. Agregar en sidebar navigation
4. Agregar case en `loadModule()` switch

### Agregar nueva tabla:

1. Crear migración SQL
2. Ejecutar en Supabase
3. Actualizar funciones CRUD en módulo JS
4. Configurar RLS policies

## 📝 Notas

- **Producción**: Cambiar tokens por JWT
- **API**: Considerar crear API REST/GraphQL
- **Cache**: Implementar cache para métricas
- **Websockets**: Para actualizaciones en tiempo real
- **Exports**: CSV, Excel, PDF de reportes
- **Charts**: Usar Chart.js para gráficas
- **Validación**: Implementar validación robusta
- **i18n**: Internacionalización futura

## 🐛 Debug

Para activar modo debug:
```javascript
localStorage.setItem('admin_debug', 'true');
```

Ver logs en consola del navegador.

## 📧 Soporte

Para dudas sobre el panel admin:
- Telegram: @RSCchain
- Email: admin@rscchain.com

---

**Autor**: RSC Chain Team  
**Versión**: 1.0.0  
**Última actualización**: Diciembre 2024


