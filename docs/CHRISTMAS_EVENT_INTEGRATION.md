# 🎄 Christmas Event - Guía de Integración Completa

## Resumen
Esta guía explica cómo integrar todas las funcionalidades del evento navideño con el backend real.

---

## 1. ✅ Integrar con API de Referidos Real

### Endpoint Disponible
```
GET /api/referrals/stats/:userId
```

### Implementación en `christmas-event.js`

Ya está implementado en el método `getReferralCount()`. El código usa Supabase directamente:

```javascript
async getReferralCount() {
    const supabase = window.supabaseIntegration;
    if (!supabase?.user?.isAuthenticated) return 0;

    try {
        const { data, error } = await supabase.supabase
            .from('referrals')
            .select('id', { count: 'exact', head: true })
            .eq('referrer_user_id', supabase.user.id)
            .eq('status', 'active');

        if (error) throw error;
        return data?.length || 0;
    } catch (error) {
        console.error('Error getting referral count:', error);
        return 0;
    }
}
```

### Alternativa: Usar API Endpoint
Si prefieres usar el endpoint REST:

```javascript
const response = await fetch(`/api/referrals/stats/${supabase.user.id}`, {
    headers: {
        'Authorization': `Bearer ${supabase.user.token}`
    }
});

if (response.ok) {
    const stats = await response.json();
    return stats.total_referrals || 0;
}
```

---

## 2. ✅ Conectar con Leaderboard del Backend

### Endpoints Disponibles

1. **Mining Leaderboard:**
   ```
   GET /api/mining/leaderboard?limit=10&period=all
   ```

2. **Public Leaderboard:**
   ```
   GET /public/leaderboard/top10?period=all
   ```

3. **Nuevo Endpoint del Evento:**
   ```
   GET /api/christmas-event/leaderboard/:type?limit=10
   ```
   - `type`: `referrals`, `mining`, `activity`

### Implementación

Ya está implementado en `loadLeaderboard()`. El código:
- Usa `/api/mining/leaderboard` para top miners
- Usa Supabase directamente para top referrers
- Combina datos para "most active"

### Agregar el Nuevo Endpoint al Server

En tu `server.js` o archivo principal de rutas:

```javascript
const christmasEventRoutes = require('./backend/routes/christmas-event-api');
app.use('/api/christmas-event', christmasEventRoutes);
```

---

## 3. 📱 Añadir Tracking de Actividad en Telegram

### Opción A: Telegram Bot API (Recomendado)

#### Paso 1: Crear Bot de Telegram

1. Habla con [@BotFather](https://t.me/BotFather) en Telegram
2. Envía `/newbot` y sigue las instrucciones
3. Obtén tu `BOT_TOKEN`

#### Paso 2: Configurar Webhook

```javascript
// backend/services/telegram-service.js
const axios = require('axios');

class TelegramService {
    constructor() {
        this.botToken = process.env.TELEGRAM_BOT_TOKEN;
        this.apiUrl = `https://api.telegram.org/bot${this.botToken}`;
    }

    // Verificar si un usuario está en el grupo
    async checkUserInGroup(userId, chatId) {
        try {
            const response = await axios.get(
                `${this.apiUrl}/getChatMember`,
                {
                    params: {
                        chat_id: chatId,
                        user_id: userId
                    }
                }
            );
            
            return response.data.result.status !== 'left' && 
                   response.data.result.status !== 'kicked';
        } catch (error) {
            console.error('Error checking Telegram user:', error);
            return false;
        }
    }

    // Obtener número de miembros del grupo
    async getGroupMemberCount(chatId) {
        try {
            const response = await axios.get(
                `${this.apiUrl}/getChatMembersCount`,
                {
                    params: { chat_id: chatId }
                }
            );
            
            return response.data.result || 0;
        } catch (error) {
            console.error('Error getting member count:', error);
            return 0;
        }
    }

    // Registrar actividad de usuario
    async registerUserActivity(telegramUserId, username) {
        try {
            // Guardar en base de datos
            const { error } = await supabase
                .from('telegram_activity')
                .upsert([{
                    telegram_user_id: telegramUserId,
                    username: username,
                    last_activity: new Date().toISOString(),
                    message_count: supabase.raw('message_count + 1')
                }], {
                    onConflict: 'telegram_user_id'
                });

            return !error;
        } catch (error) {
            console.error('Error registering activity:', error);
            return false;
        }
    }
}

module.exports = new TelegramService();
```

#### Paso 3: Crear Endpoint para Verificar Usuario

```javascript
// backend/routes/christmas-event-api.js

router.post('/verify-telegram', authenticateToken, async (req, res) => {
    try {
        const { userId, telegramUserId } = req.body;
        
        const telegramService = require('../services/telegram-service');
        const chatId = process.env.TELEGRAM_GROUP_ID; // ID del grupo
        
        // Verificar que el usuario está en el grupo
        const isMember = await telegramService.checkUserInGroup(telegramUserId, chatId);
        
        if (isMember) {
            // Marcar como completado en la base de datos
            await supabase
                .from('christmas_event_gifts')
                .upsert([{
                    user_id: userId,
                    gift_id: 'gift2',
                    unlocked: true,
                    unlocked_at: new Date().toISOString()
                }], {
                    onConflict: 'user_id,gift_id'
                });
        }
        
        res.json({
            success: isMember,
            message: isMember ? 'Verified!' : 'User not found in group'
        });
        
    } catch (error) {
        console.error('Error verifying Telegram:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});
```

#### Paso 4: Configurar Bot para Escuchar Mensajes

```javascript
// backend/services/telegram-bot.js
const TelegramBot = require('node-telegram-bot-api');
const telegramService = require('./telegram-service');

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

// Escuchar mensajes en el grupo
bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const username = msg.from.username;
    
    // Solo procesar mensajes del grupo oficial
    if (chatId.toString() === process.env.TELEGRAM_GROUP_ID) {
        // Registrar actividad
        await telegramService.registerUserActivity(userId, username);
        
        // Buscar usuario en nuestra DB por telegram_user_id
        // y actualizar su progreso de desafío
        const { data: user } = await supabase
            .from('mining_users')
            .select('id')
            .eq('telegram_user_id', userId)
            .single();
            
        if (user) {
            // Actualizar progreso del desafío de Telegram
            await supabase
                .from('christmas_event_challenges')
                .upsert([{
                    user_id: user.id,
                    challenge_id: 'telegramActivity',
                    progress: supabase.raw('progress + 1'),
                    last_updated: new Date().toISOString()
                }], {
                    onConflict: 'user_id,challenge_id'
                });
        }
    }
});
```

### Opción B: Verificación Manual (Más Simple)

Si no quieres configurar un bot, puedes usar verificación manual:

1. El usuario ingresa su username de Telegram
2. Verificas manualmente o con una API pública
3. Marcas como completado

```javascript
// Frontend: Pedir username de Telegram
async function verifyTelegramMembership() {
    const telegramUsername = prompt('Enter your Telegram username (without @):');
    
    if (telegramUsername) {
        const response = await fetch('/api/christmas-event/verify-telegram', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                userId: supabase.user.id,
                telegramUsername: telegramUsername
            })
        });
        
        // Backend verifica manualmente o con API
    }
}
```

---

## 4. 🎯 Configurar Hitos Comunitarios

### Endpoint Disponible

```
GET /api/christmas-event/community-stats
```

### Implementación en Frontend

```javascript
async loadCommunityMilestones() {
    try {
        const response = await fetch('/api/christmas-event/community-stats');
        if (response.ok) {
            const data = await response.json();
            
            // Actualizar UI con hitos
            const telegramMilestone = data.milestones.telegram1000;
            const progress = (telegramMilestone.current / telegramMilestone.target) * 100;
            
            // Actualizar barra de progreso
            const progressBar = document.querySelector('[data-community="telegram-1000"] .progress-fill-small');
            if (progressBar) {
                progressBar.style.width = `${progress}%`;
            }
            
            // Si se alcanza el hito, otorgar recompensa a todos
            if (telegramMilestone.completed && !telegramMilestone.rewardDistributed) {
                this.distributeCommunityReward(telegramMilestone.reward);
            }
        }
    } catch (error) {
        console.error('Error loading community milestones:', error);
    }
}

async distributeCommunityReward(reward) {
    // Llamar a endpoint que distribuye recompensa a todos los usuarios activos
    const response = await fetch('/api/christmas-event/distribute-community-reward', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({
            milestone: 'telegram1000',
            reward: reward
        })
    });
}
```

### Endpoint para Distribuir Recompensas Comunitarias

```javascript
// backend/routes/christmas-event-api.js

router.post('/distribute-community-reward', authenticateToken, async (req, res) => {
    try {
        // Verificar que es admin (implementar según tu sistema)
        if (!req.user.isAdmin) {
            return res.status(403).json({ error: 'Admin access required' });
        }
        
        const { milestone, reward } = req.body;
        
        // Obtener todos los usuarios activos
        const { data: users } = await supabase
            .from('mining_users')
            .select('id')
            .eq('is_active', true);
        
        // Distribuir recompensa a cada usuario
        for (const user of users) {
            await supabase
                .from('mining_users')
                .update({
                    balance: supabase.raw(`balance + ${reward}`)
                })
                .eq('id', user.id);
            
            // Registrar en historial
            await supabase
                .from('transactions')
                .insert([{
                    user_id: user.id,
                    type: 'community_milestone',
                    amount: reward,
                    description: `Community milestone: ${milestone}`,
                    created_at: new Date().toISOString()
                }]);
        }
        
        // Marcar hito como distribuido
        await supabase
            .from('community_milestones')
            .upsert([{
                milestone: milestone,
                reward_distributed: true,
                distributed_at: new Date().toISOString()
            }]);
        
        res.json({
            success: true,
            usersRewarded: users.length,
            totalDistributed: users.length * reward
        });
        
    } catch (error) {
        console.error('Error distributing reward:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});
```

---

## 5. 📊 Esquema de Base de Datos Necesario

### Tablas Requeridas

```sql
-- Regalos del evento navideño
CREATE TABLE IF NOT EXISTS christmas_event_gifts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES mining_users(id),
    gift_id VARCHAR(50) NOT NULL,
    reward DECIMAL(10, 6) NOT NULL,
    unlocked BOOLEAN DEFAULT false,
    claimed BOOLEAN DEFAULT false,
    unlocked_at TIMESTAMP,
    claimed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, gift_id)
);

-- Milestones de referidos
CREATE TABLE IF NOT EXISTS christmas_event_milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES mining_users(id),
    milestone INTEGER NOT NULL,
    reward DECIMAL(10, 6) NOT NULL,
    claimed_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, milestone)
);

-- Desafíos del evento
CREATE TABLE IF NOT EXISTS christmas_event_challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES mining_users(id),
    challenge_id VARCHAR(50) NOT NULL,
    progress DECIMAL(10, 2) DEFAULT 0,
    reward DECIMAL(10, 6) NOT NULL,
    completed BOOLEAN DEFAULT false,
    claimed BOOLEAN DEFAULT false,
    last_updated TIMESTAMP DEFAULT NOW(),
    claimed_at TIMESTAMP,
    UNIQUE(user_id, challenge_id)
);

-- Actividad de Telegram
CREATE TABLE IF NOT EXISTS telegram_activity (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    telegram_user_id BIGINT UNIQUE NOT NULL,
    username VARCHAR(255),
    message_count INTEGER DEFAULT 0,
    last_activity TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Hitos comunitarios
CREATE TABLE IF NOT EXISTS community_milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    milestone VARCHAR(100) UNIQUE NOT NULL,
    target INTEGER NOT NULL,
    current INTEGER DEFAULT 0,
    reward DECIMAL(10, 6) NOT NULL,
    reward_distributed BOOLEAN DEFAULT false,
    completed_at TIMESTAMP,
    distributed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Agregar columna telegram_user_id a mining_users (si no existe)
ALTER TABLE mining_users 
ADD COLUMN IF NOT EXISTS telegram_user_id BIGINT;
```

---

## 6. 🔧 Configuración de Variables de Entorno

Agregar a tu `.env`:

```env
# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_GROUP_ID=your_group_chat_id_here

# Christmas Event Configuration
CHRISTMAS_EVENT_START=2024-12-01
CHRISTMAS_EVENT_END=2025-01-01
```

---

## 7. 📝 Checklist de Implementación

### Backend
- [ ] Agregar rutas de `christmas-event-api.js` al servidor
- [ ] Crear tablas en Supabase (SQL arriba)
- [ ] Configurar variables de entorno
- [ ] (Opcional) Configurar Telegram Bot
- [ ] Probar endpoints con Postman/Thunder Client

### Frontend
- [ ] Actualizar `christmas-event.js` para usar endpoints reales
- [ ] Configurar base URL de API
- [ ] Agregar manejo de errores
- [ ] Probar integración completa

### Telegram (Opcional pero Recomendado)
- [ ] Crear bot con BotFather
- [ ] Configurar webhook o polling
- [ ] Agregar bot al grupo de Telegram
- [ ] Probar verificación de usuarios

---

## 8. 🚀 Próximos Pasos

1. **Implementar endpoints del evento** (archivo ya creado)
2. **Crear tablas en Supabase** (SQL proporcionado)
3. **Configurar Telegram Bot** (opcional pero recomendado)
4. **Probar integración completa**
5. **Monitorear y ajustar**

---

## 📞 Soporte

Si tienes dudas sobre la implementación, revisa:
- `backend/routes/christmas-event-api.js` - Endpoints del evento
- `scripts/mining/christmas-event.js` - Lógica del frontend
- `backend/services/leaderboardService.js` - Servicio de leaderboard
- `backend/routes/referrals.js` - API de referidos

