# 🚀 INSTRUCCIONES PARA INICIAR EL BACKEND

## ⚠️ Error "Failed to fetch" - Solución

Este error significa que el **backend no está corriendo**. Sigue estos pasos:

### 1️⃣ Iniciar el Backend

Abre una terminal en la carpeta `backend` y ejecuta:

```bash
cd backend
npm install
npm start
```

O si tienes nodemon instalado (modo desarrollo con auto-reload):

```bash
npm run dev
```

### 2️⃣ Verificar que el Backend esté Corriendo

Deberías ver en la terminal:

```
🚀 RSC Mining Backend iniciado exitosamente!
📡 Servidor escuchando en puerto 4000
🌍 Entorno: development
📊 Health check: http://localhost:4000/health
```

### 3️⃣ Verificar la Conexión

Abre tu navegador y ve a:
- http://localhost:4000/health

Deberías ver una respuesta JSON con `"status": "ok"`

### 4️⃣ Configurar la Base de Datos

Antes de usar el backend, asegúrate de:

1. **PostgreSQL esté corriendo**
2. **Ejecutar las migraciones SQL**:
   - `backend/migrations/alter_existing_tables_mining_platform.sql`
   - `backend/migrations/create_mining_platform_tables.sql`

### 5️⃣ Variables de Entorno (Opcional)

Si necesitas configurar el puerto u otras opciones, crea un archivo `.env` en `backend/`:

```env
PORT=4000
DATABASE_URL=postgres://usuario:password@localhost:5432/rsc_mining
JWT_SECRET=tu_secret_key_aqui
ADMIN_JWT_SECRET=tu_admin_secret_key_aqui
```

## 🔍 Verificar el Problema

1. **Abre la consola del navegador** (F12)
2. **Intenta iniciar sesión**
3. **Revisa los mensajes de error**:
   - Si dice "No se pudo conectar al servidor" → El backend no está corriendo
   - Si dice "401 Unauthorized" → Credenciales incorrectas
   - Si dice "500 Internal Server Error" → Error en el backend (revisa los logs)

## 📝 Notas Importantes

- El backend debe estar corriendo **antes** de intentar iniciar sesión
- El puerto por defecto es **4000**
- Si cambias el puerto, actualiza la URL en `scripts/mining/backend-api.js`
- El backend debe tener acceso a la base de datos PostgreSQL

## 🆘 Si el Problema Persiste

1. Verifica que el puerto 4000 no esté en uso por otro programa
2. Revisa los logs del backend en la terminal
3. Verifica la configuración de la base de datos
4. Asegúrate de que todas las dependencias estén instaladas (`npm install`)

