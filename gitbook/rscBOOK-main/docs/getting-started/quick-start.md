# 🚀 Inicio Rápido

> **Comienza con RSC Chain en menos de 5 minutos**

## 🎯 ¿Qué vas a aprender?

En esta guía aprenderás a:
- ✅ Instalar RSC Chain en tu sistema
- ✅ Configurar el entorno de desarrollo
- ✅ Iniciar tu primer nodo
- ✅ Crear tu primera wallet
- ✅ Enviar tu primera transacción
- ✅ Explorar las capacidades de IA

## 📋 Prerrequisitos

### Sistema Operativo
- **Windows**: Windows 10/11 (64-bit)
- **macOS**: macOS 10.15 o superior
- **Linux**: Ubuntu 20.04+, CentOS 8+, o similar

### Hardware Mínimo
- **CPU**: 4 cores (8 cores recomendado)
- **RAM**: 8GB (16GB recomendado)
- **Almacenamiento**: 100GB SSD
- **Red**: Conexión a Internet estable

### Software Requerido
- **Rust**: 1.70+ ([Instalar Rust](https://rustup.rs/))
- **Git**: 2.30+ ([Instalar Git](https://git-scm.com/))
- **Docker**: 20.10+ (opcional, para desarrollo)

## ⚙️ Instalación

### 1. Clonar el Repositorio

```bash
# Clonar el repositorio
git clone https://github.com/rsc-chain/rsc-chain.git
cd rsc-chain

# Verificar que estás en la rama correcta
git checkout main
```

### 2. Instalar Dependencias

```bash
# Instalar dependencias de Rust
cargo build --release

# Verificar la instalación
cargo run -- --help
```

### 3. Configuración Inicial

```bash
# Crear archivo de configuración
cp config.example.json config.json

# Editar configuración (opcional)
nano config.json
```

## 🚀 Primeros Pasos

### 1. Iniciar el Sistema

```bash
# Iniciar RSC Chain
cargo run -- start

# Verificar que está funcionando
cargo run -- status
```

**Salida esperada:**
```
🚀 Starting ultra-advanced blockchain system...
✅ Storage manager started
✅ Blockchain initialized
✅ Consensus engine started
✅ Security system started
✅ AI system started
✅ P2P network started
✅ API server started
✅ Ultra-advanced blockchain system started successfully!
```

### 2. Crear tu Primera Wallet

```bash
# Crear una nueva wallet
cargo run -- wallet create "Mi Primera Wallet" --password "mi_password_seguro"

# Listar wallets
cargo run -- wallet list
```

**Salida esperada:**
```
✅ Wallet created successfully!
Address: 0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6
Balance: 0 RSC
Staked: 0 RSC
```

### 3. Obtener RSC Tokens (Testnet)

```bash
# Solicitar tokens de prueba
cargo run -- faucet request --address 0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6

# Verificar balance
cargo run -- wallet info --address 0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6
```

### 4. Enviar tu Primera Transacción

```bash
# Enviar transacción
cargo run -- wallet send \
  --from 0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6 \
  --to 0x1234567890123456789012345678901234567890 \
  --amount 100 \
  --password "mi_password_seguro"

# Verificar transacción
cargo run -- transaction info --hash <transaction_hash>
```

## 🤖 Explorar las Capacidades de IA

### 1. Verificar Estado de IA

```bash
# Verificar estado del sistema de IA
cargo run -- ai status

# Ver modelos disponibles
cargo run -- ai models list
```

### 2. Ejecutar Análisis Predictivo

```bash
# Analizar patrones de transacciones
cargo run -- ai predict --input "transaction_patterns" --data "recent_transactions.json"

# Optimizar rendimiento de red
cargo run -- ai optimize --target "network_performance"
```

### 3. Entrenar Modelo Personalizado

```bash
# Entrenar modelo con datos personalizados
cargo run -- ai train \
  --model "custom_anomaly_detector" \
  --data "my_data.csv" \
  --epochs 100 \
  --learning-rate 0.001
```

## 🔍 Explorar la Red

### 1. Ver Estado de la Red

```bash
# Ver información de la red
cargo run -- network status

# Listar peers conectados
cargo run -- network peers
```

### 2. Explorar Blockchain

```bash
# Ver último bloque
cargo run -- blockchain latest

# Ver estadísticas de la cadena
cargo run -- blockchain stats

# Buscar transacciones
cargo run -- transaction search --address 0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6
```

## 📊 Monitoreo y Métricas

### 1. Ver Métricas en Tiempo Real

```bash
# Ver métricas del sistema
cargo run -- monitor --realtime

# Ver métricas específicas
cargo run -- monitor --metrics cpu,memory,network
```

### 2. Configurar Alertas

```bash
# Configurar alerta de CPU
cargo run -- monitor alert --metric cpu --threshold 80 --action email

# Ver alertas activas
cargo run -- monitor alerts list
```

## 🔧 Desarrollo

### 1. Configurar Entorno de Desarrollo

```bash
# Instalar herramientas de desarrollo
cargo install cargo-watch
cargo install cargo-audit

# Configurar pre-commit hooks
cargo run -- dev setup
```

### 2. Ejecutar Tests

```bash
# Ejecutar todos los tests
cargo test

# Ejecutar tests específicos
cargo test --test consensus_tests

# Ejecutar tests con coverage
cargo run -- dev test --coverage
```

### 3. Debugging

```bash
# Ejecutar en modo debug
RUST_LOG=debug cargo run -- start

# Analizar logs
cargo run -- logs --level debug --follow
```

## 🌐 Interfaz Web

### 1. Acceder a la API

```bash
# La API estará disponible en:
# http://localhost:3000

# Documentación OpenAPI:
# http://localhost:3000/docs

# Explorador de bloques:
# http://localhost:3000/explorer
```

### 2. Usar WebSocket

```javascript
// Conectar a WebSocket
const ws = new WebSocket('ws://localhost:3000/ws');

// Suscribirse a eventos
ws.send(JSON.stringify({
  type: 'subscribe',
  channel: 'blocks'
}));

// Recibir eventos
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Nuevo bloque:', data);
};
```

## 🚨 Solución de Problemas

### Problemas Comunes

#### 1. Error de Puerto en Uso
```bash
# Cambiar puerto
cargo run -- start --port 3001
```

#### 2. Error de Permisos
```bash
# En Linux/macOS
sudo chown -R $USER:$USER ~/.rsc-chain
```

#### 3. Error de Memoria
```bash
# Reducir uso de memoria
cargo run -- start --memory-limit 4gb
```

#### 4. Error de Red
```bash
# Verificar conectividad
cargo run -- network test

# Reiniciar red
cargo run -- network restart
```

### Obtener Ayuda

```bash
# Ver ayuda general
cargo run -- --help

# Ver ayuda de comando específico
cargo run -- wallet --help

# Ver logs detallados
cargo run -- logs --level trace
```

## 🎉 ¡Felicidades!

¡Has completado el inicio rápido de RSC Chain! Ahora tienes:

- ✅ Un nodo RSC Chain funcionando
- ✅ Tu primera wallet creada
- ✅ Una transacción enviada
- ✅ Explorado las capacidades de IA
- ✅ Monitoreado el sistema

## 🚀 Próximos Pasos

Ahora que tienes lo básico, puedes:

1. **[🏗️ Explorar la Arquitectura](architecture/overview.md)** - Entiende cómo funciona internamente
2. **[🤖 Profundizar en IA](ai/overview.md)** - Aprende sobre las capacidades de inteligencia artificial
3. **[🔐 Seguridad](security/overview.md)** - Conoce las medidas de seguridad avanzadas
4. **[⚡ Consenso](consensus/overview.md)** - Entiende el mecanismo de consenso híbrido
5. **[🌐 Red P2P](p2p/overview.md)** - Explora la red distribuida
6. **[🛠️ Desarrollo](development/overview.md)** - Contribuye al proyecto

## 📞 Soporte

Si tienes problemas o preguntas:

- **📖 Documentación**: [docs.rsc-chain.com](https://docs.rsc-chain.com)
- **💬 Discord**: [RSC Chain Community](https://discord.gg/rsc-chain)
- **🐦 Twitter**: [@RSCChain](https://twitter.com/RSCChain)
- **📧 Email**: support@rsc-chain.com

---

**¡Bienvenido al futuro de la blockchain!** 🚀✨
