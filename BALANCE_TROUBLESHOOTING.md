# 💰 RSC Balance & Levels Troubleshooting Guide

## 🚨 Problema: "Balance no se actualiza en tiempo real"

### ✅ DIAGNÓSTICO RÁPIDO

1. **Abre la herramienta de debug de balance:**
   - Ve a: `test-balance-realtime.html`
   - Haz clic en "Login Test User"
   - Haz clic en "Start Mining Session"
   - Observa los logs en tiempo real

2. **Verifica los logs de consola:**
   - Deberías ver cada 5 segundos:
   ```
   ⛏️ Mining tick: +0.000123 RSC
   🔧 Aplicando multiplicadores a 0.000123 tokens base
   💰 Balance actualizado correctamente
   🎯 Calculando XP: 0.000123 RSC × 10 = 1 XP
   ```

### 🔍 PROBLEMAS COMUNES Y SOLUCIONES

#### **Problema 1: Balance se queda estancado**
**Síntomas:**
- Balance no cambia después de varios minutos
- Logs muestran "PROBLEMA: El balance no cambió"

**Solución:**
1. Verifica que estés autenticado:
   ```javascript
   window.supabaseIntegration.isUserAuthenticated()
   ```
2. Verifica que hay sesión activa:
   ```javascript
   window.supabaseIntegration.getMiningSession().isActive
   ```
3. Reinicia la sesión de minería

#### **Problema 2: Niveles no suben**
**Síntomas:**
- XP no se agrega
- Logs muestran "Sistema de niveles no disponible"

**Solución:**
1. Verifica que el sistema de niveles esté cargado:
   ```javascript
   console.log(window.levelSystem)
   ```
2. Si es `undefined`, recarga la página
3. Verifica que los scripts estén incluidos en la página

#### **Problema 3: Multiplicadores no funcionan**
**Síntomas:**
- Logs muestran "LevelSystem no disponible"
- Tokens no se multiplican por nivel

**Solución:**
1. Verifica sistemas avanzados:
   ```javascript
   console.log('LevelSystem:', !!window.levelSystem)
   console.log('AlgorithmSystem:', !!window.algorithmSystem)
   console.log('EventSystem:', !!window.eventSystem)
   ```

### 🛠️ HERRAMIENTAS DE DEBUG

#### **1. Herramienta de Balance en Tiempo Real (`test-balance-realtime.html`)**
- **Login Test User:** Autentica automáticamente
- **Start Mining Session:** Inicia minería con logs detallados
- **Simulate One Mining Tick:** Prueba un ciclo de minería
- **Force Update Balance:** Actualiza display manualmente

#### **2. Consola del Navegador**
Comandos útiles para debug:
```javascript
// Verificar estado del usuario
window.supabaseIntegration.getCurrentUser()

// Verificar sesión de minería
window.supabaseIntegration.getMiningSession()

// Forzar actualización de balance
window.supabaseIntegration.forceUIUpdate()

// Simular minería manual
await window.supabaseIntegration.updateMiningStats(0.001, 500, 95)

// Verificar nivel actual
window.levelSystem.userLevel
```

### 📊 LOGS ESPERADOS (FUNCIONAMIENTO CORRECTO)

#### **Cada 5 segundos durante minería:**
```
⛏️ Mining: 0.000234 RSC, 567 H/s, 92.3%
🔧 Aplicando multiplicadores a 0.000234 tokens base
🎯 Multiplicador de nivel: 1.2x
⚡ Multiplicador de algoritmo: 1.0x
🎉 Multiplicador de eventos: 1.0x
🔧 Multiplicador total: 1.20x | 0.000234 → 0.000281 RSC
💰 Minería activa: +0.000281 RSC | Balance: 12.345678 → 12.345959 RSC
✅ Balance actualizado correctamente
🎯 Calculando XP: 0.000281 RSC × 10 = 2 XP
🎯 XP agregado: 1234 → 1236 (+2)
🔄 Balance UI actualizado: 12.345959 RSC
```

#### **Al subir de nivel:**
```
🎯 XP agregado: 998 → 1002 (+4)
🎯 Nivel: 2 → 3 (¡SUBIÓ!)
🎉 ¡SUBISTE DE NIVEL! Ahora eres nivel 3
🔄 Level UI actualizado: Nivel 3 (1002 XP)
```

### 🎯 PASOS DE SOLUCIÓN PASO A PASO

#### **Paso 1: Verificación Básica**
1. Abre `test-balance-realtime.html`
2. Verifica que aparezca "Supabase Integration inicializado"
3. Haz clic en "Login Test User"
4. Verifica que aparezca "Login successful"

#### **Paso 2: Iniciar Minería**
1. Haz clic en "Start Mining Session"
2. Verifica que aparezca "Mining session started"
3. Observa que el balance cambie cada 5 segundos
4. Verifica que los logs muestren tokens siendo agregados

#### **Paso 3: Verificar Niveles**
1. Observa la sección "Level System" en la herramienta
2. Verifica que XP aumente con cada tick de minería
3. Si no aumenta, verifica los logs de XP

#### **Paso 4: Solución de Problemas**
Si algo no funciona:
1. Abre la consola (F12)
2. Busca errores en rojo
3. Ejecuta los comandos de debug mencionados arriba
4. Reporta los errores específicos

### 🔧 CONFIGURACIÓN TÉCNICA

#### **Tasas de Minería:**
- **Base:** 3-7.5 RSC por día
- **Por tick (5s):** ~0.0001-0.0003 RSC
- **XP por RSC:** 10 XP
- **Multiplicador de nivel:** 1.0x a 3.0x según nivel

#### **Sistemas Requeridos:**
- `scripts/supabase-integration.js` ✅
- `scripts/mining/level-system.js` ✅
- `scripts/mining/algorithm-system.js` ✅
- `scripts/mining/event-system.js` (opcional)

### 📞 SOPORTE AVANZADO

Si el problema persiste después de seguir esta guía:
1. Ejecuta la herramienta de debug completa
2. Copia TODOS los logs de la consola
3. Incluye el resultado de estos comandos:
   ```javascript
   console.log('User:', window.supabaseIntegration.getCurrentUser())
   console.log('Session:', window.supabaseIntegration.getMiningSession())
   console.log('Level:', window.levelSystem?.userLevel)
   ```

### ✅ VERIFICACIÓN FINAL

**El sistema funciona correctamente si ves:**
- Balance aumentando cada 5 segundos ✅
- XP aumentando con cada tick de minería ✅
- Niveles subiendo al alcanzar los puntos requeridos ✅
- Multiplicadores aplicándose correctamente ✅
- Logs detallados sin errores ✅

**¡Con estos pasos el balance y niveles deberían funcionar perfectamente!** 🎉
