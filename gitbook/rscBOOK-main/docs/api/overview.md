# 🛠️ API Completa

> **Interfaz de programación más avanzada del mundo blockchain**

## 🌟 Visión General

RSC Chain proporciona una **API completa y avanzada** que permite a desarrolladores integrar fácilmente todas las funcionalidades de la blockchain más avanzada del mundo. Nuestra API incluye **REST endpoints**, **WebSocket en tiempo real**, **GraphQL**, **gRPC** y **SDKs nativos** para múltiples lenguajes.

## 🏗️ Arquitectura de API

### **Capa de API Multi-Protocolo**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           RSC Chain API Architecture                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐             │
│  │   🌐 REST API   │  │   🔌 WebSocket  │  │   📊 GraphQL    │             │
│  │                 │  │                 │  │                 │             │
│  │ • HTTP/HTTPS    │  │ • Real-time     │  │ • Query Language│             │
│  │ • JSON/XML      │  │ • Bi-directional│  │ • Schema        │             │
│  │ • CRUD          │  │ • Events        │  │ • Introspection │             │
│  │ • RESTful       │  │ • Streaming     │  │ • Mutations     │             │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘             │
│                                                                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐             │
│  │   🔐 Auth       │  │   📱 Mobile     │  │   🖥️ Desktop    │             │
│  │   & Security    │  │   SDK           │  │   SDK           │             │
│  │                 │  │                 │  │                 │             │
│  │ • JWT Tokens    │  │ • iOS/Android   │  │ • Windows/Mac   │             │
│  │ • OAuth 2.0     │  │ • React Native  │  │ • Linux         │             │
│  │ • API Keys      │  │ • Flutter       │  │ • Electron      │             │
│  │ • Rate Limiting │  │ • Native APIs   │  │ • Native APIs   │             │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘             │
│                                                                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐             │
│  │   🌍 Web SDK    │  │   📚 Developer  │  │   📖 OpenAPI    │             │
│  │                 │  │   Tools         │  │   Spec          │             │
│  │                 │  │                 │  │                 │             │
│  │ • JavaScript    │  │ • CLI Tools     │  │ • Swagger UI    │             │
│  │ • TypeScript    │  │ • Code Gen      │  │ • Documentation │             │
│  │ • React/Vue     │  │ • Testing       │  │ • Examples      │             │
│  │ • Node.js       │  │ • Debugging     │  │ • SDKs          │             │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘             │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 🌐 REST API

### **Endpoints Principales**

#### **Blockchain Info**
```http
GET /api/v1/blockchain/status
GET /api/v1/blockchain/info
GET /api/v1/blockchain/peers
GET /api/v1/blockchain/sync
```

#### **Blocks & Transactions**
```http
GET /api/v1/blocks
GET /api/v1/blocks/{height}
GET /api/v1/blocks/{hash}
GET /api/v1/transactions
GET /api/v1/transactions/{hash}
POST /api/v1/transactions/send
```

#### **Wallets & Accounts**
```http
GET /api/v1/wallets
POST /api/v1/wallets/create
GET /api/v1/wallets/{address}
GET /api/v1/wallets/{address}/balance
GET /api/v1/wallets/{address}/transactions
```

#### **Smart Contracts**
```http
GET /api/v1/contracts
POST /api/v1/contracts/deploy
GET /api/v1/contracts/{address}
POST /api/v1/contracts/{address}/call
GET /api/v1/contracts/{address}/events
```

### **Ejemplos de Uso**

#### **Obtener Estado de la Blockchain**
```bash
curl -X GET "https://api.rsc-chain.com/v1/blockchain/status" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

```json
{
  "status": "synced",
  "block_height": 1234567,
  "latest_block_hash": "0x1234...",
  "total_transactions": 9876543,
  "network_difficulty": "0x1a2b3c4d",
  "peers_count": 1250,
  "sync_progress": 100.0
}
```

#### **Enviar Transacción**
```bash
curl -X POST "https://api.rsc-chain.com/v1/transactions/send" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{
    "from": "0x1234...",
    "to": "0x5678...",
    "amount": "1000000000000000000",
    "gas_limit": 21000,
    "gas_price": "20000000000"
  }'
```

## 🔌 WebSocket API

### **Conexión WebSocket**
```javascript
const ws = new WebSocket('wss://api.rsc-chain.com/ws/v1');

ws.onopen = () => {
  console.log('Conectado a RSC Chain WebSocket');
  
  // Suscribirse a eventos
  ws.send(JSON.stringify({
    type: 'subscribe',
    channels: ['blocks', 'transactions', 'mempool']
  }));
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Evento recibido:', data);
};
```

### **Eventos Disponibles**

#### **Nuevos Bloques**
```json
{
  "type": "block",
  "data": {
    "height": 1234567,
    "hash": "0x1234...",
    "timestamp": 1640995200,
    "transactions_count": 150,
    "miner": "0xabcd...",
    "difficulty": "0x1a2b3c4d"
  }
}
```

#### **Nuevas Transacciones**
```json
{
  "type": "transaction",
  "data": {
    "hash": "0x5678...",
    "from": "0x1234...",
    "to": "0xabcd...",
    "amount": "1000000000000000000",
    "gas_used": 21000,
    "gas_price": "20000000000",
    "status": "confirmed"
  }
}
```

## 📊 GraphQL API

### **Schema GraphQL**
```graphql
type Query {
  blockchain: Blockchain!
  block(height: Int, hash: String): Block
  blocks(first: Int, after: String): BlockConnection!
  transaction(hash: String!): Transaction
  transactions(first: Int, after: String): TransactionConnection!
  wallet(address: String!): Wallet
  contract(address: String!): Contract
}

type Blockchain {
  status: String!
  blockHeight: Int!
  latestBlock: Block!
  totalTransactions: Int!
  networkDifficulty: String!
  peersCount: Int!
  syncProgress: Float!
}

type Block {
  height: Int!
  hash: String!
  timestamp: Int!
  transactionsCount: Int!
  miner: String!
  difficulty: String!
  transactions: [Transaction!]!
}

type Transaction {
  hash: String!
  from: String!
  to: String!
  amount: String!
  gasUsed: Int!
  gasPrice: String!
  status: String!
  block: Block
}
```

### **Ejemplo de Query**
```graphql
query GetBlockchainInfo {
  blockchain {
    status
    blockHeight
    totalTransactions
    peersCount
    syncProgress
    latestBlock {
      height
      hash
      timestamp
      transactionsCount
    }
  }
}
```

## 🔐 Autenticación y Seguridad

### **JWT Authentication**
```javascript
// Obtener token JWT
const response = await fetch('https://api.rsc-chain.com/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    username: 'your_username',
    password: 'your_password'
  })
});

const { token } = await response.json();

// Usar token en requests
const apiResponse = await fetch('https://api.rsc-chain.com/v1/wallets', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

### **API Keys**
```javascript
// Usar API key
const response = await fetch('https://api.rsc-chain.com/v1/transactions', {
  headers: {
    'X-API-Key': 'your_api_key_here'
  }
});
```

### **Rate Limiting**
```javascript
// Manejar rate limiting
const response = await fetch('https://api.rsc-chain.com/v1/transactions');
const rateLimitRemaining = response.headers.get('X-RateLimit-Remaining');
const rateLimitReset = response.headers.get('X-RateLimit-Reset');

if (response.status === 429) {
  console.log('Rate limit exceeded. Reset at:', rateLimitReset);
}
```

## 📱 Mobile SDK

### **iOS SDK**
```swift
import RSCChainSDK

// Configurar SDK
RSCChain.configure(apiKey: "your_api_key")

// Obtener estado de blockchain
RSCChain.shared.getBlockchainStatus { result in
    switch result {
    case .success(let status):
        print("Block height: \(status.blockHeight)")
    case .failure(let error):
        print("Error: \(error)")
    }
}

// Enviar transacción
let transaction = Transaction(
    from: "0x1234...",
    to: "0x5678...",
    amount: "1000000000000000000"
)

RSCChain.shared.sendTransaction(transaction) { result in
    switch result {
    case .success(let hash):
        print("Transaction sent: \(hash)")
    case .failure(let error):
        print("Error: \(error)")
    }
}
```

### **Android SDK**
```kotlin
import com.rscchain.sdk.RSCChain

// Configurar SDK
RSCChain.configure("your_api_key")

// Obtener estado de blockchain
RSCChain.getBlockchainStatus { result ->
    result.onSuccess { status ->
        println("Block height: ${status.blockHeight}")
    }.onFailure { error ->
        println("Error: $error")
    }
}

// Enviar transacción
val transaction = Transaction(
    from = "0x1234...",
    to = "0x5678...",
    amount = "1000000000000000000"
)

RSCChain.sendTransaction(transaction) { result ->
    result.onSuccess { hash ->
        println("Transaction sent: $hash")
    }.onFailure { error ->
        println("Error: $error")
    }
}
```

## 🌍 Web SDK

### **JavaScript SDK**
```javascript
import { RSCChain } from '@rsc-chain/sdk';

// Configurar SDK
const rscChain = new RSCChain({
  apiKey: 'your_api_key',
  network: 'mainnet'
});

// Obtener estado de blockchain
const status = await rscChain.getBlockchainStatus();
console.log('Block height:', status.blockHeight);

// Enviar transacción
const transaction = await rscChain.sendTransaction({
  from: '0x1234...',
  to: '0x5678...',
  amount: '1000000000000000000'
});
console.log('Transaction hash:', transaction.hash);

// Suscribirse a eventos
rscChain.subscribe('blocks', (block) => {
  console.log('New block:', block.height);
});
```

### **React Hook**
```javascript
import { useRSCChain } from '@rsc-chain/react';

function BlockchainStatus() {
  const { status, loading, error } = useRSCChain('blockchain/status');

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h2>Blockchain Status</h2>
      <p>Block Height: {status.blockHeight}</p>
      <p>Status: {status.status}</p>
      <p>Peers: {status.peersCount}</p>
    </div>
  );
}
```

## 📚 Developer Tools

### **CLI Tool**
```bash
# Instalar CLI
npm install -g @rsc-chain/cli

# Configurar API key
rsc-chain config set api-key YOUR_API_KEY

# Obtener estado de blockchain
rsc-chain blockchain status

# Enviar transacción
rsc-chain transaction send \
  --from 0x1234... \
  --to 0x5678... \
  --amount 1000000000000000000

# Monitorear eventos
rsc-chain monitor --events blocks,transactions
```

### **Testing Framework**
```javascript
import { RSCChainTest } from '@rsc-chain/testing';

describe('RSC Chain API', () => {
  let rscChain;

  beforeEach(() => {
    rscChain = new RSCChainTest({
      network: 'testnet'
    });
  });

  test('should get blockchain status', async () => {
    const status = await rscChain.getBlockchainStatus();
    expect(status.status).toBe('synced');
  });

  test('should send transaction', async () => {
    const transaction = await rscChain.sendTransaction({
      from: '0x1234...',
      to: '0x5678...',
      amount: '1000000000000000000'
    });
    expect(transaction.hash).toBeDefined();
  });
});
```

## 📖 OpenAPI Specification

### **Swagger UI**
La documentación completa de la API está disponible en:
- **Swagger UI**: https://api.rsc-chain.com/docs
- **OpenAPI Spec**: https://api.rsc-chain.com/openapi.json

### **Code Generation**
```bash
# Generar SDK desde OpenAPI spec
openapi-generator generate \
  -i https://api.rsc-chain.com/openapi.json \
  -g javascript \
  -o ./generated-sdk

# Generar tipos TypeScript
openapi-typescript https://api.rsc-chain.com/openapi.json \
  -o types.ts
```

## 🚀 Ejemplos de Integración

### **DeFi Application**
```javascript
import { RSCChain, DeFi } from '@rsc-chain/sdk';

const rscChain = new RSCChain({ apiKey: 'your_api_key' });
const defi = new DeFi(rscChain);

// Obtener pools de liquidez
const pools = await defi.getLiquidityPools();

// Proporcionar liquidez
const liquidity = await defi.provideLiquidity({
  pool: pools[0].address,
  tokenA: '1000000000000000000',
  tokenB: '1000000000000000000'
});

// Hacer swap
const swap = await defi.swap({
  pool: pools[0].address,
  tokenIn: 'TOKEN_A',
  tokenOut: 'TOKEN_B',
  amountIn: '1000000000000000000'
});
```

### **Gaming Integration**
```javascript
import { RSCChain, Gaming } from '@rsc-chain/sdk';

const rscChain = new RSCChain({ apiKey: 'your_api_key' });
const gaming = new Gaming(rscChain);

// Crear NFT
const nft = await gaming.createNFT({
  name: 'Epic Sword',
  description: 'A legendary weapon',
  image: 'https://example.com/sword.png'
});

// Transferir NFT
const transfer = await gaming.transferNFT({
  nftId: nft.id,
  from: '0x1234...',
  to: '0x5678...'
});
```

---

**RSC Chain API - Donde la innovación encuentra la facilidad** 🚀✨
