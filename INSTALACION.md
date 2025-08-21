# 🚀 INSTALACIÓN Y EJECUCIÓN DEL SISTEMA RSC MINING

## 📋 **REQUISITOS PREVIOS:**

- **Node.js** versión 14 o superior
- **npm** (viene con Node.js)
- **Git** (para clonar el repositorio)

## 🔧 **PASOS DE INSTALACIÓN:**

### **1. Instalar Dependencias:**
```bash
npm install
```

### **2. Ejecutar el Servidor:**
```bash
npm start
```

### **3. Verificar que Funciona:**
- Abre tu navegador
- Ve a: `http://localhost:3000`
- Deberías ver la página principal de RSC

## 🌐 **URLS DISPONIBLES:**

- **🏠 Página Principal:** `http://localhost:3000`
- **⛏️ Minería:** `http://localhost:3000/mine`
- **🔐 Login:** `http://localhost:3000/login`
- **🧪 Test Sistema Híbrido:** `http://localhost:3000/test-hybrid`
- **🔗 API Status:** `http://localhost:3000/api/status`

## 📊 **ENDPOINTS DE LA API:**

### **Minería:**
- `POST /api/mining/start` - Iniciar minería
- `POST /api/mining/stop` - Detener minería
- `GET /api/mining/status/:walletAddress` - Estado de minería
- `POST /api/mining/update-progress` - Actualizar progreso
- `POST /api/mining/claim` - Reclamar tokens
- `GET /api/mining/system-stats` - Estadísticas del sistema
- `GET /api/mining/history/:walletAddress` - Historial de minería

### **Sistema:**
- `GET /api/status` - Estado del servidor

## 🗄️ **BASE DE DATOS:**

- **Tipo:** SQLite
- **Archivo:** `backend/database/rsc_mining.db` (se crea automáticamente)
- **Tablas:** users, mining_sessions, mining_history, system_config, system_stats

## 🧪 **PROBAR EL SISTEMA:**

### **Opción 1: Sistema Principal**
1. Ve a `http://localhost:3000/mine`
2. Crea una cuenta o usa modo demo
3. Inicia minería
4. Navega a otra página
5. Regresa a minería - ¡debería continuar funcionando!

### **Opción 2: Página de Prueba**
1. Ve a `http://localhost:3000/test-hybrid`
2. Haz clic en "🚀 Iniciar Minería"
3. Prueba la navegación entre páginas
4. Verifica que la minería persiste

## 🔍 **VERIFICAR QUE FUNCIONA:**

### **En la Consola del Servidor:**
```
🚀 Servidor RSC Mining System iniciado
📍 Puerto: 3000
🌐 URL: http://localhost:3000
🔗 API: http://localhost:3000/api
⛏️ Minería: http://localhost:3000/mine
🧪 Test: http://localhost:3000/test-hybrid

✅ Sistema completamente operativo
💡 Abre http://localhost:3000 en tu navegador
```

### **En el Navegador:**
- **API Status:** `http://localhost:3000/api/status` debería devolver JSON
- **Página de Minería:** Debería cargar sin errores
- **Sistema Híbrido:** Debería inicializar correctamente

## ❌ **SOLUCIÓN DE PROBLEMAS:**

### **Error: "Cannot find module"**
```bash
npm install
```

### **Error: "Port already in use"**
```bash
# Cambiar puerto en server.js o matar proceso
npx kill-port 3000
```

### **Error: "Database locked"**
```bash
# Reiniciar servidor
npm start
```

### **Error: "CORS"**
- El servidor ya incluye CORS configurado
- Si persiste, verificar que estés usando `http://localhost:3000`

## 🚀 **DESARROLLO:**

### **Modo Desarrollo (con recarga automática):**
```bash
npm run dev
```

### **Reiniciar Servidor:**
```bash
# Ctrl+C para parar
npm start
```

## 📱 **ACCESO DESDE OTROS DISPOSITIVOS:**

Si quieres acceder desde tu teléfono u otro dispositivo en la misma red:

1. **Encuentra tu IP local:**
   ```bash
   # Windows
   ipconfig
   
   # Mac/Linux
   ifconfig
   ```

2. **Accede desde otro dispositivo:**
   ```
   http://TU_IP_LOCAL:3000
   ```

## ✅ **VERIFICACIÓN FINAL:**

- ✅ Servidor ejecutándose en puerto 3000
- ✅ Base de datos SQLite creada
- ✅ API respondiendo en `/api/status`
- ✅ Página de minería cargando
- ✅ Sistema híbrido funcionando
- ✅ Minería persistente durante 24 horas

**¡Tu sistema RSC Mining está completamente operativo! 🎉**
