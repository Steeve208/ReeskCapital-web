# 🚀 RSC Quantum Mining - Configuración de Supabase

## 📋 Configuración Requerida

Para que el sistema de minería funcione con el backend real de Supabase, necesitas configurar las siguientes credenciales:

### 1. 🔧 Configurar Supabase

1. **Crear proyecto en Supabase:**
   - Ve a [supabase.com](https://supabase.com)
   - Crea una nueva cuenta o inicia sesión
   - Crea un nuevo proyecto

2. **Obtener credenciales:**
   - Ve a Settings > API
   - Copia la URL del proyecto
   - Copia la clave anónima (anon key)

### 2. 📝 Actualizar Configuración

Edita el archivo `scripts/config/supabase-config.js`:

```javascript
export const SUPABASE_CONFIG = {
    // Reemplazar con tus credenciales reales
    url: 'https://tu-proyecto.supabase.co',
    anonKey: 'tu-clave-anonima-aqui',
    // ... resto de la configuración
};
```

### 3. 🗄️ Configurar Base de Datos

Ejecuta el script SQL en tu proyecto de Supabase:

1. Ve a SQL Editor en tu dashboard de Supabase
2. Copia y pega el contenido de `backend/supabase-mining-schema.sql`
3. Ejecuta el script para crear todas las tablas

### 4. 🔐 Configurar Autenticación

1. Ve a Authentication > Settings en tu dashboard de Supabase
2. Configura los siguientes ajustes:
   - **Site URL:** `http://localhost:3000` (para desarrollo)
   - **Redirect URLs:** `http://localhost:3000/pages/mine.html`
   - **Email confirmations:** Habilitado
   - **Password requirements:** Mínimo 8 caracteres

### 5. 🛡️ Configurar Políticas de Seguridad (RLS)

Las políticas de Row Level Security ya están incluidas en el script SQL, pero puedes verificar que estén activas:

1. Ve a Authentication > Policies
2. Verifica que las políticas estén habilitadas para todas las tablas

### 6. 📊 Configurar Realtime

1. Ve a Database > Replication
2. Habilita la replicación para las siguientes tablas:
   - `mining_sessions`
   - `transactions`
   - `users`

## 🚀 Funcionalidades del Backend

### ✅ **Autenticación Completa**
- Registro de usuarios con sistema de referidos
- Login/logout seguro
- Gestión de sesiones
- Verificación de email

### ✅ **Sistema de Minería**
- Sesiones de minería persistentes
- Algoritmos cuánticos configurables
- Métricas en tiempo real
- Sincronización automática

### ✅ **Sistema de Referidos**
- Códigos de referral únicos
- Comisiones automáticas
- Múltiples niveles de referidos
- Tracking de conversiones

### ✅ **Transacciones**
- Historial completo de transacciones
- Diferentes tipos de transacciones
- Metadatos detallados
- Auditoría completa

### ✅ **Métricas en Tiempo Real**
- Hash rate dinámico
- Eficiencia de minería
- Consumo de energía
- Estadísticas de usuario

## 🔧 Estructura de la Base de Datos

### Tablas Principales:
- **users** - Información de usuarios
- **mining_sessions** - Sesiones de minería
- **transactions** - Historial de transacciones
- **referrals** - Sistema de referidos
- **mining_algorithms** - Algoritmos disponibles
- **mining_equipment** - Equipos de minería
- **bonuses** - Sistema de bonificaciones
- **achievements** - Logros y recompensas

### Funciones SQL:
- `calculate_mining_power()` - Calcula poder de minería
- `process_referral_commission()` - Procesa comisiones
- `register_user_advanced()` - Registro avanzado
- `update_user_balance_advanced()` - Actualización de balance

## 🧪 Pruebas

### 1. **Probar Conexión:**
```javascript
// En la consola del navegador
console.log(window.supabaseClient.getConnectionState());
```

### 2. **Probar Autenticación:**
- Registra un nuevo usuario
- Inicia sesión
- Verifica que los datos se guarden en Supabase

### 3. **Probar Minería:**
- Inicia una sesión de minería
- Verifica que se cree en la base de datos
- Observa las métricas en tiempo real

## 🚨 Solución de Problemas

### Error: "Supabase Client not available"
- Verifica que el archivo `supabase-client.js` esté cargado
- Revisa la consola para errores de importación

### Error: "Invalid API key"
- Verifica que las credenciales estén correctas
- Asegúrate de usar la clave anónima, no la de servicio

### Error: "Table doesn't exist"
- Ejecuta el script SQL completo
- Verifica que todas las tablas se hayan creado

### Error: "RLS policy violation"
- Verifica que las políticas de RLS estén configuradas
- Asegúrate de que el usuario esté autenticado

## 📈 Monitoreo

### Dashboard de Supabase:
- **Database:** Monitorea el uso de la base de datos
- **Authentication:** Revisa usuarios y sesiones
- **Realtime:** Monitorea conexiones en tiempo real
- **Logs:** Revisa logs de errores y actividad

### Métricas Importantes:
- Número de usuarios activos
- Sesiones de minería activas
- Tokens minados por día
- Conversiones de referidos

## 🔄 Sincronización

El sistema sincroniza automáticamente:
- **Cada 5 segundos:** Métricas de minería
- **Cada 1 segundo:** Datos locales
- **En tiempo real:** Cambios de estado
- **Al finalizar:** Resumen de sesión

## 🎯 Próximos Pasos

1. **Configurar credenciales reales**
2. **Ejecutar script SQL**
3. **Probar autenticación**
4. **Probar minería**
5. **Configurar dominio de producción**

¡El sistema está listo para funcionar con Supabase! 🚀
