# ❄️ Snow Mining Event - Guía de Instalación

## 📦 Archivos Incluidos

El evento Snow Mining consta de los siguientes archivos:

### JavaScript
- ✅ `scripts/mining/snow-mining-event.js` - Lógica principal del evento
- ✅ `scripts/mining/snow-mining-adapter.js` - Integración con el sistema de minería
- ✅ `scripts/notification-system.js` - Sistema de notificaciones visual

### CSS
- ✅ `styles/snow-mining-event.css` - Estilos del evento

### HTML
- ✅ `pages/mine.html` - Ya modificado con el nuevo evento

### Documentación
- ✅ `docs/SNOW_MINING_EVENT.md` - Documentación completa
- ✅ `docs/SNOW_MINING_INSTALLATION.md` - Este archivo

---

## ✅ Estado de la Instalación

**¡El evento ya está instalado y listo para usar!**

Todos los archivos han sido creados y las referencias han sido actualizadas en `mine.html`.

---

## 🚀 Verificación

### 1. Verificar Archivos

Asegúrate de que estos archivos existan:

```bash
rsc-web/
├── scripts/
│   ├── mining/
│   │   ├── snow-mining-event.js          ✅
│   │   └── snow-mining-adapter.js         ✅
│   └── notification-system.js              ✅
├── styles/
│   └── snow-mining-event.css               ✅
└── pages/
    └── mine.html                           ✅ (modificado)
```

### 2. Verificar Referencias en mine.html

El archivo `mine.html` debe tener estas líneas:

```html
<!-- CSS -->
<link rel="stylesheet" href="../styles/snow-mining-event.css?v=1.0">

<!-- JavaScript -->
<script src="../scripts/notification-system.js"></script>
<script src="../scripts/mining/snow-mining-event.js?v=1.0"></script>
<script src="../scripts/mining/snow-mining-adapter.js?v=1.0"></script>
```

### 3. Verificar Sección HTML

Busca en `mine.html` la sección:

```html
<section class="snow-mining-event">
    <div class="container">
        <div class="snow-event-card">
            <!-- Contenido del evento -->
        </div>
    </div>
</section>
```

---

## 🎯 Prueba del Evento

### Prueba Local

1. **Abre la página de minería:**
   ```
   http://localhost:PORT/pages/mine.html
   ```
   O simplemente abre el archivo `mine.html` en tu navegador.

2. **Verifica que el evento se muestre:**
   - Deberías ver el título "❄️ Snow Mining Bonanza ❄️"
   - El canvas con animación de nieve
   - Las estadísticas del evento

3. **Abre la consola del navegador (F12):**
   - Deberías ver: `❄️ Inicializando Snow Mining Event...`
   - Luego: `✅ Snow Mining Event inicializado correctamente`
   - Y: `🔌 Inicializando Snow Mining Adapter...`

4. **Inicia la minería:**
   - Haz clic en "Start Mining"
   - Deberías ver items cayendo en el canvas
   - Haz clic en los items para colectarlos

5. **Verifica el multiplicador:**
   - Al colectar un item, deberías ver el multiplicador activarse
   - Las ganancias de minería se multiplicarán automáticamente

---

## 🔧 Configuración

### Ajustar Fechas del Evento

Para cambiar las fechas del evento, edita `snow-mining-event.js`:

```javascript
this.config = {
    name: 'Snow Mining Bonanza',
    startDate: new Date('2024-12-13'),  // ← Cambiar aquí
    endDate: new Date('2025-01-15'),    // ← Cambiar aquí
    // ...
};
```

### Ajustar Multiplicadores

Para cambiar los multiplicadores de los items:

```javascript
multipliers: {
    snowflake: 1.5,   // ← +50% minería
    bell: 2.0,        // ← +100% minería
    gift: 2.5,        // ← +150% minería
    star: 3.0         // ← +200% minería
}
```

### Ajustar Recompensas

Para cambiar las recompensas por colección:

```javascript
collectionRewards: {
    10: 25,    // ← 10 items = 25 RSK
    25: 50,    // ← 25 items = 50 RSK
    50: 100,   // ← 50 items = 100 RSK
    100: 250   // ← 100 items = 250 RSK
}
```

### Ajustar Frecuencia de Items

Para cambiar cada cuánto tiempo caen items:

En `snow-mining-event.js`, busca:

```javascript
// Animación de items especiales (cuando está minando)
this.animations.itemSpawn = setInterval(() => {
    if (this.state.isMining && Math.random() < 0.15) {  // ← 15% de probabilidad
        this.spawnSpecialItem();
    }
}, 3000);  // ← Cada 3 segundos
```

---

## 🎨 Personalización Visual

### Colores

Edita `snow-mining-event.css` para cambiar los colores principales:

```css
/* Evento Snow Mining */
.snow-event-card {
    border: 2px solid rgba(137, 207, 240, 0.3);  /* ← Borde azul nieve */
    /* ... */
}

.snow-event-title {
    background: linear-gradient(45deg, #89CFF0, #FFFFFF, #89CFF0);  /* ← Gradiente título */
    /* ... */
}
```

### Tamaño del Canvas

```css
.snow-canvas-container {
    height: 400px;  /* ← Altura en desktop */
}

@media (max-width: 768px) {
    .snow-canvas-container {
        height: 300px;  /* ← Altura en móvil */
    }
}
```

---

## 🐛 Solución de Problemas

### Error: "snowMiningEvent is not defined"

**Causa:** El script no se ha cargado correctamente.

**Solución:**
1. Verifica que la ruta al script sea correcta
2. Revisa la consola por errores de carga
3. Asegúrate de que el archivo existe

### Error: "Cannot read property 'getContext' of null"

**Causa:** El elemento canvas no existe en el DOM.

**Solución:**
1. Verifica que el HTML tenga `<canvas id="snowCanvas"></canvas>`
2. Asegúrate de que los scripts se cargan después del DOM

### Los items no caen

**Causa:** La minería no está activa o el evento no detecta el cambio.

**Solución:**
1. Verifica la consola por el mensaje "⛏️ Minería iniciada"
2. Asegúrate de que el adapter esté inicializado
3. Revisa que el evento `miningStateChanged` se esté disparando

### El multiplicador no se aplica

**Causa:** El adapter no está interceptando correctamente las ganancias.

**Solución:**
1. Verifica que `supabaseIntegration` esté disponible
2. Comprueba la consola por errores del adapter
3. Asegúrate de que el adapter se cargue después de `supabase-integration.js`

---

## 📊 Monitoreo y Debug

### Modo Debug

Para activar logs detallados, abre la consola y ejecuta:

```javascript
// Ver estado del evento
console.log(window.snowMiningEvent.state);

// Ver configuración
console.log(window.snowMiningEvent.config);

// Simular colección de item
window.snowMiningEvent.collectItem({
    type: 'star',
    x: 200,
    y: 200
});
```

### Ver Colección Actual

```javascript
console.log(window.snowMiningEvent.state.collection);
// Output: { snowflake: 5, bell: 3, gift: 2, star: 1 }
```

### Forzar Bonus

```javascript
window.snowMiningEvent.activateRandomBonus();
```

---

## 🔄 Actualizaciones Futuras

### Agregar Nuevos Items

1. Agrega el tipo en `config.snowItems`:
```javascript
snowItems: ['snowflake', 'bell', 'gift', 'star', 'tree'],  // ← Nuevo
```

2. Agrega el multiplicador:
```javascript
multipliers: {
    // ...
    tree: 4.0  // ← Nuevo multiplicador
}
```

3. Agrega el emoji en `getItemEmoji()`:
```javascript
getItemEmoji(type) {
    const emojis = {
        // ...
        tree: '🎄'  // ← Nuevo emoji
    };
    return emojis[type] || '❄️';
}
```

### Agregar Sonidos

1. Coloca archivos de audio en `/assets/sounds/`
2. Los sonidos se reproducirán automáticamente al colectar items

Nombres de archivos soportados:
- `collect.mp3` - Al colectar item
- `bonus.mp3` - Al activar bonus
- `reward.mp3` - Al reclamar recompensa

---

## 📦 Integración con Base de Datos

### Crear Tabla (Opcional)

Si quieres guardar el progreso en base de datos:

```sql
CREATE TABLE snow_mining_event (
    user_id UUID PRIMARY KEY REFERENCES users(id),
    snowflakes INT DEFAULT 0,
    bells INT DEFAULT 0,
    gifts INT DEFAULT 0,
    stars INT DEFAULT 0,
    total_collected INT DEFAULT 0,
    total_earned DECIMAL DEFAULT 0,
    claimed_rewards JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### Implementar Sincronización

Modifica el método `saveState()` en `snow-mining-event.js`:

```javascript
async saveState() {
    // LocalStorage
    localStorage.setItem('snow_mining_event_state', JSON.stringify(stateToSave));
    
    // Base de datos
    const supabase = window.supabaseIntegration;
    if (supabase?.user?.isAuthenticated) {
        await supabase.supabase
            .from('snow_mining_event')
            .upsert({
                user_id: supabase.user.id,
                ...this.state.collection,
                total_collected: this.state.totalCollected,
                total_earned: this.state.totalEarned,
                claimed_rewards: this.state.claimedRewards,
                updated_at: new Date()
            });
    }
}
```

---

## ✅ Checklist de Lanzamiento

Antes de lanzar el evento en producción:

- [ ] Verificar fechas del evento
- [ ] Probar en múltiples navegadores
- [ ] Probar en dispositivos móviles
- [ ] Verificar integración con sistema de minería
- [ ] Verificar que los multiplicadores se apliquen correctamente
- [ ] Probar colección de items
- [ ] Probar reclamo de recompensas
- [ ] Verificar persistencia de datos
- [ ] Revisar rendimiento (FPS del canvas)
- [ ] Verificar que no haya errores en consola
- [ ] Probar con usuarios de prueba
- [ ] Documentar cualquier configuración especial

---

## 🎉 ¡Listo para Producción!

El evento Snow Mining está **completamente funcional** y listo para ser usado.

### Características Incluidas:
✅ Canvas interactivo con animaciones fluidas
✅ Sistema de colección de items
✅ Multiplicadores de minería en tiempo real
✅ Recompensas automáticas
✅ Notificaciones visuales
✅ Responsive design
✅ Persistencia en LocalStorage
✅ Integración completa con sistema de minería
✅ Sistema de bonus y efectos especiales

---

## 📞 Soporte

Si tienes problemas:
1. Revisa la consola del navegador (F12)
2. Consulta la documentación completa en `SNOW_MINING_EVENT.md`
3. Verifica este archivo para problemas comunes

**¡Feliz minería navideña! ❄️🎁⭐**

