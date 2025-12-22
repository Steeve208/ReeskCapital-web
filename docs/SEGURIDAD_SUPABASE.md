# 🔐 Seguridad de Claves de Supabase

## ⚠️ Problema Identificado

Las claves de Supabase están actualmente hardcodeadas en el código JavaScript del frontend (`scripts/supabase-integration.js`). Aunque la **anon key** está diseñada para ser pública, es una mejor práctica no exponerla directamente en el código fuente.

## 🛡️ Solución Implementada

### 1. Archivo de Configuración Separado

Se creó `scripts/config/supabase-config.js` para centralizar las credenciales:

```javascript
const SUPABASE_CONFIG = {
    url: 'https://unevdceponbnmhvpzlzf.supabase.co',
    anonKey: 'tu-clave-aqui'
};
```

### 2. Carga de Configuración

El código ahora carga la configuración desde `window.SUPABASE_CONFIG` si está disponible, o usa valores por defecto.

## 📋 Recomendaciones de Seguridad

### ✅ Para Desarrollo

1. **Usar archivo de configuración local:**
   - Cargar `scripts/config/supabase-config.js` antes de `supabase-integration.js`
   - Agregar `scripts/config/supabase-config.js` al `.gitignore`

### ✅ Para Producción

1. **Variables de Entorno:**
   ```javascript
   const SUPABASE_CONFIG = {
       url: process.env.SUPABASE_URL,
       anonKey: process.env.SUPABASE_ANON_KEY
   };
   ```

2. **Servidor de Configuración:**
   - Cargar configuración desde un endpoint seguro
   - Usar autenticación para acceder a la configuración

3. **Obfuscación (opcional):**
   - Minificar y ofuscar el código JavaScript
   - Usar herramientas como Webpack o Vite con plugins de ofuscación

## 🔑 Tipos de Claves de Supabase

### Anon Key (Clave Anónima)
- ✅ **Diseñada para ser pública** - Se usa en el frontend
- ⚠️ **Limitada por RLS (Row Level Security)** - Las políticas de seguridad protegen los datos
- ⚠️ **No debe tener permisos de escritura** en tablas sensibles sin RLS

### Service Role Key (Clave de Servicio)
- ❌ **NUNCA exponer en el frontend**
- ❌ **Solo en el backend** - Servidor Node.js, funciones serverless, etc.
- ⚠️ **Bypasea RLS** - Tiene acceso completo a la base de datos

## 🛡️ Protección Actual

### Row Level Security (RLS)

Supabase usa RLS para proteger los datos incluso con la anon key expuesta:

```sql
-- Ejemplo de política RLS
CREATE POLICY "Users can only see their own data"
ON users FOR SELECT
USING (auth.uid() = id);
```

### Buenas Prácticas

1. ✅ **RLS habilitado** en todas las tablas
2. ✅ **Políticas restrictivas** - Solo permitir acceso necesario
3. ✅ **Validación en el backend** - Verificar datos críticos en el servidor
4. ✅ **Rate limiting** - Limitar requests por IP/usuario

## 📝 Checklist de Seguridad

- [x] Claves movidas a archivo de configuración separado
- [ ] Archivo de configuración agregado a `.gitignore`
- [ ] RLS habilitado en todas las tablas
- [ ] Políticas de seguridad configuradas
- [ ] Service Role Key nunca expuesta
- [ ] Validación de datos en el backend
- [ ] Rate limiting implementado

## 🚨 Acciones Inmediatas Recomendadas

1. **Agregar a `.gitignore`:**
   ```
   scripts/config/supabase-config.js
   ```

2. **Crear archivo de ejemplo:**
   ```
   scripts/config/supabase-config.example.js
   ```

3. **Verificar RLS en Supabase:**
   - Ir a Authentication > Policies
   - Verificar que todas las tablas tengan políticas activas

4. **Rotar claves si es necesario:**
   - Si las claves fueron comprometidas, rotarlas en Supabase Dashboard
   - Actualizar configuración en todos los entornos

## 📚 Recursos

- [Supabase Security Best Practices](https://supabase.com/docs/guides/platform/security)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [API Keys Documentation](https://supabase.com/docs/guides/api/api-keys)

