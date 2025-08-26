# 🚀 Integración de Supabase con RSC Mining System

## 📋 Descripción

Este proyecto integra **Supabase** como base de datos en tiempo real para el sistema de minería RSC, permitiendo:

- ✅ **Registro de mineros** con persistencia en base de datos
- ✅ **Seguimiento en tiempo real** del progreso de minería
- ✅ **Almacenamiento de transacciones** de minería
- ✅ **Tabla de líderes** actualizada automáticamente
- ✅ **Sincronización** entre dispositivos

## 🛠️ Instalación

### 1. Dependencias

```bash
npm install @supabase/supabase-js
```

### 2. Configuración de Supabase

El proyecto ya está configurado con las credenciales de Supabase:

- **URL**: `https://unevdceponbnmhvpzlzf.supabase.co`
- **Anon Key**: Configurado en `scripts/supabaseClient-browser.js`

## 📁 Estructura de Archivos

```
scripts/
├── supabaseClient.js              # Cliente ES6 modules
├── supabaseClient-browser.js      # Cliente para navegador
└── mining-supabase-integration.js # Sistema de minería integrado

supabase-mining-demo.html          # Demo completo
SUPABASE_INTEGRATION_README.md     # Este archivo
```

## 🗄️ Estructura de Base de Datos

### Tabla: `miners`
```sql
CREATE TABLE miners (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  wallet_address VARCHAR(255),
  hash_power DECIMAL(20,2) DEFAULT 0,
  balance DECIMAL(20,2) DEFAULT 0,
  blocks_mined INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  last_active TIMESTAMP DEFAULT NOW()
);
```

### Tabla: `mining_transactions`
```sql
CREATE TABLE mining_transactions (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  hash_power DECIMAL(20,2) NOT NULL,
  reward DECIMAL(20,2) NOT NULL,
  block_hash VARCHAR(255) NOT NULL,
  timestamp TIMESTAMP DEFAULT NOW()
);
```

## 🚀 Uso Básico

### 1. Incluir en HTML

```html
<!-- Supabase CDN -->
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>

<!-- Scripts del proyecto -->
<script src="scripts/supabaseClient-browser.js"></script>
<script src="scripts/mining-supabase-integration.js"></script>
```

### 2. Registrar un Minero

```javascript
// El sistema se inicializa automáticamente
// Los usuarios pueden registrarse a través del formulario HTML

// O programáticamente:
if (window.SupabaseHelpers) {
  const result = await window.SupabaseHelpers.saveMiner(
    'usuario@email.com',
    'Nombre Usuario',
    '0x1234...' // Wallet opcional
  );
}
```

### 3. Iniciar Minería

```javascript
// El sistema maneja automáticamente:
// - Inicio/parada de minería
// - Actualización de estadísticas
// - Guardado en Supabase
// - Notificaciones en tiempo real
```

## 🔧 Funciones Disponibles

### SupabaseHelpers

```javascript
// Guardar minero
await window.SupabaseHelpers.saveMiner(email, name, walletAddress)

// Actualizar progreso
await window.SupabaseHelpers.updateMiningProgress(email, hashPower, balance)

// Obtener minero
await window.SupabaseHelpers.getMiner(email)

// Obtener todos los mineros (para leaderboard)
await window.SupabaseHelpers.getAllMiners()

// Guardar transacción
await window.SupabaseHelpers.saveMiningTransaction(email, hashPower, reward, blockHash)

// Verificar si existe
await window.SupabaseHelpers.checkMinerExists(email)
```

### MiningSupabaseIntegration

```javascript
// Acceder a la instancia
const miningSystem = window.miningSupabase;

// Obtener estadísticas
const stats = miningSystem.getMiningStats();

// Reiniciar sesión
miningSystem.resetMining();
```

## 🎯 Características del Sistema

### ✨ Funcionalidades Principales

1. **Registro Automático**: Los usuarios se registran una vez y se mantiene su progreso
2. **Persistencia**: Todos los datos se guardan en Supabase automáticamente
3. **Sincronización**: Los datos se actualizan en tiempo real
4. **Leaderboard**: Tabla de líderes actualizada automáticamente
5. **Notificaciones**: Sistema de notificaciones visuales para eventos de minería

### 🔄 Flujo de Trabajo

1. **Usuario se registra** → Se crea entrada en `miners`
2. **Inicia minería** → Se actualiza `last_active`
3. **Mina bloques** → Se actualiza `hash_power`, `balance`, `blocks_mined`
4. **Transacciones** → Se guardan en `mining_transactions`
5. **Leaderboard** → Se actualiza automáticamente

## 🎨 Personalización

### Estilos CSS

El sistema incluye estilos modernos y responsivos. Puedes personalizar:

```css
/* Colores principales */
:root {
  --primary-color: #667eea;
  --secondary-color: #764ba2;
  --success-color: #2ed573;
  --danger-color: #ff6b6b;
}

/* Notificaciones */
.notification {
  /* Personalizar notificaciones */
}

/* Botones */
.btn {
  /* Personalizar botones */
}
```

### Configuración

```javascript
// En mining-supabase-integration.js
class MiningSupabaseIntegration {
  constructor() {
    // Personalizar intervalos de minería
    this.miningInterval = null;
    this.miningSpeed = 1000; // 1 segundo por bloque
    
    // Personalizar recompensas
    this.minReward = 1;
    this.maxReward = 11;
  }
}
```

## 🧪 Testing

### Demo Completo

Abre `supabase-mining-demo.html` en tu navegador para probar:

1. **Registro**: Completa el formulario con email y nombre
2. **Minería**: Inicia y detén la minería
3. **Estadísticas**: Observa el progreso en tiempo real
4. **Leaderboard**: Ve la tabla de líderes actualizada

### Verificación en Supabase

1. Ve a tu dashboard de Supabase
2. Navega a la tabla `miners`
3. Verifica que se creen nuevas entradas
4. Observa las actualizaciones en tiempo real

## 🚨 Solución de Problemas

### Error: "Supabase helpers not loaded"

```javascript
// Verifica que el script se cargue correctamente
console.log(window.SupabaseHelpers); // Debe mostrar el objeto

// Asegúrate de incluir el CDN de Supabase primero
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
```

### Error: "Permission denied"

```javascript
// Verifica las políticas de seguridad en Supabase
// Las tablas deben permitir INSERT, UPDATE, SELECT para usuarios anónimos
```

### Error: "Table does not exist"

```sql
-- Ejecuta estos comandos en SQL Editor de Supabase
CREATE TABLE miners (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  wallet_address VARCHAR(255),
  hash_power DECIMAL(20,2) DEFAULT 0,
  balance DECIMAL(20,2) DEFAULT 0,
  blocks_mined INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  last_active TIMESTAMP DEFAULT NOW()
);

CREATE TABLE mining_transactions (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  hash_power DECIMAL(20,2) NOT NULL,
  reward DECIMAL(20,2) NOT NULL,
  block_hash VARCHAR(255) NOT NULL,
  timestamp TIMESTAMP DEFAULT NOW()
);
```

## 🔒 Seguridad

### Políticas de Supabase

```sql
-- Permitir inserción para usuarios autenticados
CREATE POLICY "Users can insert their own data" ON miners
FOR INSERT WITH CHECK (auth.email() = email);

-- Permitir actualización para usuarios autenticados
CREATE POLICY "Users can update their own data" ON miners
FOR UPDATE USING (auth.email() = email);

-- Permitir lectura para todos (leaderboard)
CREATE POLICY "Anyone can view miners" ON miners
FOR SELECT USING (true);
```

## 📱 Integración con Aplicaciones Existentes

### Agregar a tu HTML existente

```html
<!-- En tu página de minería existente -->
<div id="miningForm">
  <input type="email" name="email" placeholder="Email" required>
  <input type="text" name="name" placeholder="Nombre" required>
  <button type="submit">Registrarse</button>
</div>

<div id="miningControls" style="display: none;">
  <button id="startMining">Iniciar Minería</button>
  <button id="stopMining">Detener Minería</button>
</div>
```

### Integrar con tu sistema existente

```javascript
// En tu script existente
if (window.miningSupabase) {
  // El sistema ya está funcionando
  console.log('Sistema de minería Supabase activo');
} else {
  // Inicializar manualmente
  window.miningSupabase = new MiningSupabaseIntegration();
}
```

## 🎉 ¡Listo!

Tu sistema de minería RSC ahora está completamente integrado con Supabase:

- ✅ **Base de datos en tiempo real**
- ✅ **Persistencia de datos**
- ✅ **Sincronización automática**
- ✅ **Interfaz moderna y responsiva**
- ✅ **Sistema de notificaciones**
- ✅ **Leaderboard en tiempo real**

¡Disfruta de tu sistema de minería mejorado! 🚀⛏️
