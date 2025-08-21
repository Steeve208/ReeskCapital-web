# �� Sistema de Minería Web RSC Chain

## 📋 Descripción General

El **Sistema de Minería Web RSC Chain** es una plataforma avanzada que permite a los usuarios minar tokens RSC simulados directamente desde su navegador web. Este sistema está diseñado para funcionar como una simulación antes del lanzamiento de mainnet, donde los tokens simulados se convertirán a tokens reales.

## ⚡ Características Principales

### 🔐 **Minería Simulada**
- **Tokens Simulados**: Los usuarios minan tokens RSC simulados durante la fase de desarrollo
- **Migración a Mainnet**: Los tokens simulados se convertirán automáticamente a tokens reales cuando se lance mainnet
- **Sin Riesgo**: Los usuarios pueden familiarizarse con el sistema sin comprometer fondos reales

### ⏰ **Sesiones de 24 Horas**
- **Duración Fija**: Cada sesión de minería dura exactamente 24 horas
- **Persistencia**: El sistema continúa funcionando incluso si el usuario cierra el navegador
- **Renovación Manual**: Los usuarios deben activar manualmente una nueva sesión cada 24 horas

### 🎛️ **Control de Intensidad**
- **Hash Power Ajustable**: Control deslizante del 1 al 10 para ajustar la intensidad de minería
- **Recompensas Proporcionales**: Mayor intensidad = más tokens minados
- **Optimización Personalizada**: Los usuarios pueden ajustar según sus preferencias

### 🏆 **Sistema de Niveles**
- **5 Niveles**: Novato, Básico, Intermedio, Avanzado, Épico
- **Progresión**: Los niveles se desbloquean según la cantidad de tokens minados
- **Recompensas**: Cada nivel ofrece beneficios y reconocimiento

## 🛠️ Arquitectura Técnica

### **Frontend (JavaScript)**
- **Clase MiningSystem**: Maneja toda la lógica de minería en el cliente
- **Interfaz Reactiva**: UI que se actualiza en tiempo real
- **Persistencia Local**: Almacenamiento en localStorage para respaldo

### **Service Worker**
- **Minería en Segundo Plano**: Continúa funcionando cuando la página no está activa
- **IndexedDB**: Base de datos local para almacenar sesiones de minería
- **Comunicación Bidireccional**: Mensajes entre el cliente y el Service Worker

### **Base de Datos Local**
- **IndexedDB**: Almacena sesiones de minería, tokens y configuraciones
- **Persistencia**: Los datos sobreviven a reinicios del navegador
- **Sincronización**: Mantiene consistencia entre cliente y Service Worker

## 🚀 Cómo Funciona

### **1. Inicio de Sesión**
```
Usuario → Pulsa "INICIAR MINERÍA" → Sistema crea sesión de 24h → Service Worker inicia minería
```

### **2. Proceso de Minería**
```
Service Worker → Calcula tokens cada 5 segundos → Actualiza base de datos → Notifica al cliente
```

### **3. Persistencia**
```
Navegador cerrado → Service Worker continúa → Datos guardados en IndexedDB → Restauración automática
```

### **4. Finalización**
```
24 horas completadas → Sesión automáticamente completada → Tokens disponibles para reclamar
```

## 📊 Fórmulas de Cálculo

### **Tokens por Sesión**
```
Tokens = BaseRate × HashPower × TimeMultiplier × ElapsedTime × Variation
```

**Donde:**
- **BaseRate**: 0.0001 tokens por segundo
- **HashPower**: Multiplicador basado en intensidad (1-10)
- **TimeMultiplier**: Factor de tiempo (máximo 24 horas)
- **ElapsedTime**: Tiempo transcurrido en segundos
- **Variation**: Variación aleatoria ±20% para simular minería real

### **Ejemplo de Cálculo**
```
Intensidad: 7/10
Tiempo: 12 horas
Tokens = 0.0001 × 1.4 × 12 × 43200 × 0.9 = 65.3184 RSC
```

## 🎯 Flujo de Usuario

### **Primera Vez**
1. Usuario visita la página de minería
2. Ajusta la intensidad de minería (1-10)
3. Pulsa "INICIAR MINERÍA"
4. Sistema crea sesión de 24 horas
5. Minería comienza automáticamente

### **Durante la Minería**
1. Usuario ve progreso en tiempo real
2. Tokens se acumulan automáticamente
3. Tiempo restante se muestra claramente
4. Banner de minería activa visible

### **Finalización**
1. Sesión se completa automáticamente a las 24 horas
2. Usuario puede reclamar tokens acumulados
3. Botón "RECLAMAR RSC" se habilita
4. Sistema está listo para nueva sesión

## 🔧 Configuración del Sistema

### **Archivos Principales**
- `scripts/mining.js` - Lógica principal de minería
- `sw-mining.js` - Service Worker para minería en segundo plano
- `scripts/mining-config.js` - Configuración del sistema
- `pages/mine.html` - Interfaz de usuario

### **Variables de Configuración**
```javascript
const MINING_CONFIG = {
    SESSION_DURATION: 24 * 60 * 60 * 1000, // 24 horas
    BASE_TOKEN_RATE: 0.0001,               // tokens por segundo
    UPDATE_INTERVAL: 5000,                 // 5 segundos
    MIN_HASH_POWER: 1,                    // intensidad mínima
    MAX_HASH_POWER: 10                    // intensidad máxima
};
```

## 📱 Compatibilidad

### **Navegadores Soportados**
- ✅ Chrome 88+
- ✅ Firefox 85+
- ✅ Safari 14+
- ✅ Edge 88+

### **Requisitos Mínimos**
- Service Workers habilitados
- IndexedDB soportado
- JavaScript ES6+

## 🚨 Solución de Problemas

### **Minería No Inicia**
1. Verificar que el Service Worker esté registrado
2. Recargar la página
3. Verificar consola del navegador para errores

### **Datos No Persisten**
1. Verificar que IndexedDB esté habilitado
2. Limpiar caché del navegador
3. Verificar permisos de almacenamiento

### **Service Worker No Responde**
1. Verificar registro en DevTools > Application
2. Recargar página
3. Verificar errores en consola

## 🔮 Roadmap Futuro

### **Fase 1: Simulación (Actual)**
- ✅ Minería web simulada
- ✅ Sesiones de 24 horas
- ✅ Sistema de niveles
- ✅ Persistencia local

### **Fase 2: Integración Mainnet**
- 🔄 Conexión a blockchain real
- 🔄 Tokens reales en lugar de simulados
- 🔄 Smart contracts para minería
- 🔄 Validación de transacciones

### **Fase 3: Funcionalidades Avanzadas**
- 📱 Aplicación móvil nativa
- 🤝 Minería colaborativa
- 🏆 Competencias y rankings
- 💰 Sistema de recompensas avanzado

## 📞 Soporte

### **Documentación**
- Este README
- Código comentado
- Consola del navegador

### **Contacto**
- **Email**: support@reeskcapital.co
- **Telegram**: Comunidad oficial RSC Chain
- **Discord**: Servidor de desarrolladores

## 📄 Licencia

Este sistema de minería es parte del proyecto RSC Chain y está sujeto a los términos de uso de ReeskCapital.co.

---

**🚀 ¡La revolución financiera comienza con un clic! 🚀**
