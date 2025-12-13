# 🎄 Explicación Completa del Evento Navideño

## 📋 Resumen General

El **Christmas Community Bonanza** es un evento navideño diseñado para **construir comunidad** y **atraer nuevos usuarios**. Los usuarios pueden ganar hasta **850+ RSK** participando en diferentes actividades.

---

## 🎯 Objetivo Principal

**Construir una comunidad activa** mediante:
- Incentivos para seguir redes sociales
- Sistema de referidos escalonado
- Desafíos diarios y semanales
- Rankings competitivos
- Recompensas comunitarias

---

## 📅 Duración del Evento

- **Fecha de inicio:** 9 de diciembre de 2025
- **Fecha de fin:** 15 de enero de 2026
- **Duración total:** ~37 días

El evento verifica automáticamente si está activo comparando la fecha actual con estas fechas.

---

## 🎁 PARTE 1: Sistema de Regalos (4 Regalos - 200 RSK Total)

### Cómo Funciona:

Los usuarios deben **desbloquear y reclamar** 4 regalos en orden progresivo:

#### **Regalo #1: Follow X (50 RSK)**
- **Requisito:** Seguir la cuenta de X (Twitter) de RSC
- **Cómo se desbloquea:**
  1. Usuario hace clic en el botón "Follow on X"
  2. Se abre la página de X en una nueva pestaña
  3. Después de 2 segundos, el sistema marca el regalo como desbloqueado
  4. El usuario puede reclamar los 50 RSK

#### **Regalo #2: Join Telegram (50 RSK)**
- **Requisito:** Unirse al grupo de Telegram de RSC
- **Cómo se desbloquea:**
  1. Usuario hace clic en el botón "Join Telegram"
  2. Se abre el grupo de Telegram en una nueva pestaña
  3. Después de 2 segundos, el sistema marca el regalo como desbloqueado
  4. El usuario puede reclamar los 50 RSK
  5. *(Nota: Para verificación real, se necesita configurar el bot de Telegram)*

#### **Regalo #3: Mine 1 Hour (50 RSK)**
- **Requisito:** Minar durante 1 hora continua
- **Cómo se desbloquea:**
  1. El usuario inicia la minería
  2. El sistema verifica cada minuto cuánto tiempo ha minado
  3. Cuando alcanza 60 minutos (1 hora), el regalo se desbloquea automáticamente
  4. El usuario puede reclamar los 50 RSK

#### **Regalo #4: Bonus Gift (50 RSK)**
- **Requisito:** Completar los 3 regalos anteriores
- **Cómo se desbloquea:**
  1. Automáticamente cuando los regalos 1, 2 y 3 están todos reclamados
  2. El usuario puede reclamar los 50 RSK adicionales

### Estados de los Regalos:

- **🔒 Locked (Bloqueado):** Aún no se ha cumplido el requisito
- **🔓 Unlocked (Desbloqueado):** Se cumplió el requisito, pero aún no se ha reclamado
- **✅ Claimed (Reclamado):** Ya se reclamó y se agregó al balance del usuario

### Flujo Técnico:

```javascript
// 1. Usuario hace acción (ej: sigue en X)
handleSocialAction('follow_twitter')
  ↓
// 2. Se abre el enlace
window.open(twitter_url)
  ↓
// 3. Después de 2 segundos, se desbloquea
setTimeout(() => unlockGift('gift1'), 2000)
  ↓
// 4. Usuario hace clic en el regalo
claimGift('gift1')
  ↓
// 5. Se llama a la API
POST /api/christmas-event/claim-gift
  ↓
// 6. Se actualiza la base de datos y el balance
UPDATE users SET balance = balance + 50
UPDATE christmas_event_gifts SET claimed = true
```

---

## 👥 PARTE 2: Sistema de Referidos (Hasta 500+ RSK)

### Cómo Funciona:

Los usuarios ganan bonos **escalonados** por cada amigo que inviten:

### Milestones de Referidos:

| Referidos | Recompensa | Total Acumulado |
|-----------|-----------|-----------------|
| 1 amigo   | 25 RSK    | 25 RSK          |
| 3 amigos  | 100 RSK   | 125 RSK         |
| 5 amigos  | 200 RSK   | 325 RSK         |
| 10 amigos | 500 RSK   | 825 RSK         |

### Cómo Funciona:

1. **Usuario obtiene su código de referido:**
   - Se muestra automáticamente en la sección de Referrals
   - Formato: `RSC_XXXXX` o similar
   - Puede copiarlo con un clic

2. **Usuario comparte su código:**
   - Botones para compartir en X, Telegram, WhatsApp, etc.
   - O puede copiar el enlace completo

3. **Amigo se registra con el código:**
   - Al registrarse, se crea la relación de referido en la base de datos
   - El contador de referidos se actualiza automáticamente

4. **Sistema verifica milestones:**
   - Cada 5 minutos, el sistema verifica cuántos referidos tiene el usuario
   - Si alcanza un milestone (1, 3, 5, 10), se desbloquea automáticamente
   - El usuario puede reclamar el bono

5. **Usuario reclama el milestone:**
   - Hace clic en "Claim" en el milestone desbloqueado
   - Se llama a la API: `POST /api/christmas-event/claim-referral-milestone`
   - Se agrega la recompensa a su balance

### Flujo Técnico:

```javascript
// 1. Sistema verifica referidos cada 5 minutos
updateReferralProgress()
  ↓
// 2. Obtiene conteo desde Supabase
getReferralCount()
  SELECT COUNT(*) FROM referrals WHERE referrer_user_id = X
  ↓
// 3. Verifica milestones alcanzados
checkReferralMilestones(count)
  if (count >= 1 && !claimed) → unlock milestone1
  if (count >= 3 && !claimed) → unlock milestone3
  ...
  ↓
// 4. Usuario reclama
claimReferralMilestone(3)
  ↓
// 5. API actualiza balance
POST /api/christmas-event/claim-referral-milestone
  UPDATE users SET balance = balance + 100
```

---

## 🎯 PARTE 3: Desafíos Diarios y Semanales (30+ RSK)

### Desafío 1: Daily Mining (5 RSK/día)

- **Requisito:** Minar durante 30 minutos en un día
- **Recompensa:** 5 RSK
- **Frecuencia:** Diario (se resetea cada 24 horas)
- **Cómo funciona:**
  1. El usuario inicia la minería
  2. El sistema rastrea cuántos minutos ha minado hoy
  3. Cuando alcanza 30 minutos, el desafío se completa
  4. El usuario puede reclamar 5 RSK
  5. Al día siguiente, el progreso se resetea a 0

### Desafío 2: Telegram Activity (10 RSK/semana)

- **Requisito:** Enviar 5 mensajes en el grupo de Telegram
- **Recompensa:** 10 RSK
- **Frecuencia:** Semanal
- **Cómo funciona:**
  1. Usuario se une al grupo de Telegram
  2. Envía mensajes en el grupo
  3. El bot de Telegram (si está configurado) rastrea los mensajes
  4. Cuando alcanza 5 mensajes, el desafío se completa
  5. El usuario puede reclamar 10 RSK
  6. *(Nota: Requiere bot de Telegram configurado)*

### Desafío 3: Social Share (15 RSK)

- **Requisito:** Compartir el evento en redes sociales
- **Recompensa:** 15 RSK
- **Frecuencia:** Una vez durante el evento
- **Cómo funciona:**
  1. Usuario comparte el evento en X, Facebook, etc.
  2. Hace clic en "Mark as Shared"
  3. El desafío se completa
  4. El usuario puede reclamar 15 RSK

### Flujo Técnico:

```javascript
// Desafío diario de minería
checkMiningProgress()
  ↓
// Verifica tiempo minado hoy
const duration = (now - startTime) / 60000 // minutos
  ↓
// Actualiza progreso
updateDailyMiningChallenge(duration)
  if (duration >= 30) → challenge.completed = true
  ↓
// Usuario reclama
claimChallenge('dailyMining')
  ↓
// API actualiza balance
POST /api/christmas-event/claim-challenge
  UPDATE users SET balance = balance + 5
```

---

## 🏆 PARTE 4: Leaderboard Comunitario

### Cómo Funciona:

El leaderboard muestra los **top usuarios** en 3 categorías diferentes:

### 1. Top Referrers (Top Referidores)
- Muestra los usuarios con más referidos
- Se actualiza en tiempo real
- Ordenado por `total_referrals` descendente

### 2. Top Miners (Top Mineros)
- Muestra los usuarios que más han minado
- Se actualiza en tiempo real
- Ordenado por `total_mined` descendente

### 3. Most Active (Más Activos)
- Muestra los usuarios más activos
- Combina métricas de minería y actividad
- Ordenado por `mining_level` o actividad total

### Flujo Técnico:

```javascript
// Usuario cambia de tab en leaderboard
switchTab('leaderboard')
  ↓
// Carga leaderboard
loadLeaderboard('referrals')
  ↓
// Llama a API
GET /api/christmas-event/leaderboard/referrals?limit=10
  ↓
// API consulta base de datos
SELECT * FROM referral_stats ORDER BY total_referrals DESC LIMIT 10
  ↓
// Renderiza en UI
renderLeaderboard(data)
```

---

## 🎯 PARTE 5: Hitos Comunitarios

### Cómo Funciona:

Son **objetivos comunitarios** que, cuando se alcanzan, **todos los usuarios activos** reciben una recompensa.

### Ejemplo: 1,000 Miembros en Telegram

- **Objetivo:** Llegar a 1,000 miembros en el grupo de Telegram
- **Recompensa:** 25 RSK para todos los usuarios activos
- **Progreso:** Se actualiza cada 10 minutos
- **Cómo funciona:**
  1. El sistema consulta el número de miembros del grupo de Telegram
  2. Muestra el progreso: "750/1000"
  3. Cuando se alcanza 1000, se activa la distribución
  4. Todos los usuarios activos reciben 25 RSK automáticamente

### Flujo Técnico:

```javascript
// Sistema carga hitos cada 10 minutos
loadCommunityMilestones()
  ↓
// Llama a API
GET /api/christmas-event/community-stats
  ↓
// API consulta Telegram (si bot configurado)
telegramService.getGroupMemberCount()
  ↓
// Actualiza progreso en UI
progressBar.style.width = (current / target) * 100%
  ↓
// Si se alcanza el hito
if (current >= target && !distributed) {
  distributeCommunityReward(25)
  ↓
  // Distribuye a todos los usuarios activos
  POST /api/christmas-event/distribute-community-reward
  UPDATE users SET balance = balance + 25 WHERE is_active = true
}
```

---

## 💾 PARTE 6: Persistencia de Datos

### Dónde se Guarda:

1. **Base de Datos (Supabase):**
   - `christmas_event_gifts` - Estado de regalos por usuario
   - `christmas_event_milestones` - Milestones de referidos reclamados
   - `christmas_event_challenges` - Progreso de desafíos
   - `telegram_activity` - Actividad en Telegram
   - `community_milestones` - Estado de hitos comunitarios

2. **LocalStorage (Navegador):**
   - Se usa como **fallback** si no hay conexión
   - Se guarda automáticamente cuando cambia el estado
   - Se carga al iniciar el evento

### Flujo de Carga:

```javascript
// Al iniciar el evento
initialize()
  ↓
// 1. Carga desde localStorage (rápido)
loadSavedState()
  const saved = localStorage.getItem('christmas_event_state')
  ↓
// 2. Si usuario está autenticado, carga desde DB
if (authenticated) {
  GET /api/christmas-event/user-stats/:userId
  ↓
  // 3. Merge con datos de localStorage
  this.userState = { ...localStorage, ...database }
  ↓
  // 4. Guarda en localStorage
  saveState()
}
```

---

## ⏰ PARTE 7: Timers y Actualizaciones Automáticas

### Timers Configurados:

1. **Actualización de tiempo restante:** Cada 1 hora
   - Actualiza el contador "X días Y horas restantes"

2. **Verificación de progreso de minería:** Cada 1 minuto
   - Verifica si el usuario ha minado 1 hora (Regalo #3)
   - Actualiza progreso del desafío diario

3. **Actualización de referidos:** Cada 5 minutos
   - Obtiene el conteo actualizado de referidos
   - Verifica si se alcanzaron nuevos milestones

4. **Carga de hitos comunitarios:** Cada 10 minutos
   - Actualiza el progreso de hitos comunitarios
   - Verifica si se alcanzó algún hito

---

## 🔄 Flujo Completo de un Usuario Nuevo

### Día 1:

1. **Usuario se registra** en la plataforma
2. **Ve el evento navideño** en la página de minería
3. **Hace clic en "Follow on X"**
   - Se abre X
   - Regalo #1 se desbloquea
   - Reclama 50 RSK ✅

4. **Hace clic en "Join Telegram"**
   - Se abre Telegram
   - Regalo #2 se desbloquea
   - Reclama 50 RSK ✅

5. **Inicia la minería**
   - Después de 1 hora, Regalo #3 se desbloquea
   - Reclama 50 RSK ✅
   - Después de 30 minutos, completa Desafío Diario
   - Reclama 5 RSK ✅

6. **Regalo #4 se desbloquea automáticamente**
   - Reclama 50 RSK ✅

**Total del Día 1: 205 RSK**

### Día 2-7:

- **Completa Desafío Diario cada día:** 5 RSK × 6 días = 30 RSK
- **Invita 3 amigos:**
  - Alcanza milestone de 1 amigo: +25 RSK
  - Alcanza milestone de 3 amigos: +100 RSK
- **Comparte el evento:** +15 RSK

**Total Semana 1: 205 + 30 + 25 + 100 + 15 = 375 RSK**

### Semana 2-5:

- **Continúa completando desafíos diarios**
- **Invita más amigos** (hasta 10)
- **Participa en hitos comunitarios**

**Total Posible: 850+ RSK**

---

## 🛠️ Estado Técnico Actual

### ✅ Funcionando:

- ✅ Sistema de regalos (desbloqueo y reclamación)
- ✅ Sistema de referidos (conteo y milestones)
- ✅ Desafíos diarios de minería
- ✅ Leaderboard (3 categorías)
- ✅ Persistencia en base de datos
- ✅ Persistencia en localStorage
- ✅ Timers automáticos
- ✅ Verificación de fechas del evento

### ⚠️ Requiere Configuración:

- ⚠️ **Verificación real de Telegram:** Requiere bot de Telegram configurado
- ⚠️ **Tracking de mensajes en Telegram:** Requiere bot escuchando mensajes
- ⚠️ **Distribución automática de hitos:** Requiere endpoint de admin

### 🔧 Mejoras Futuras:

- 🔧 Notificaciones push cuando se desbloquea algo
- 🔧 Historial de recompensas reclamadas
- 🔧 Estadísticas más detalladas
- 🔧 Más hitos comunitarios

---

## 📊 Resumen de Recompensas

| Categoría | Recompensa Máxima |
|-----------|-------------------|
| Regalos | 200 RSK |
| Referidos | 500+ RSK |
| Desafíos | 30+ RSK/día |
| Hitos Comunitarios | 25+ RSK |
| **TOTAL POSIBLE** | **850+ RSK** |

---

## 🎯 Objetivo del Evento: Construir Comunidad

El evento está diseñado para:

1. **Atraer nuevos usuarios** mediante incentivos claros
2. **Retener usuarios** con desafíos diarios
3. **Crear viralidad** con sistema de referidos
4. **Construir comunidad** con hitos comunitarios
5. **Generar engagement** con leaderboards competitivos

---

¿Tienes alguna pregunta sobre cómo funciona alguna parte específica?




