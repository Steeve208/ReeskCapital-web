# RSC Chain API Endpoints

## Endpoints de la Blockchain (Producción)

### Endpoints Principales Disponibles
```
GET  /api/v1/status          # Estado del nodo
GET  /api/v1/block/latest    # Último bloque
GET  /api/v1/wallet/:address # Balance de wallet
POST /api/v1/wallet/create   # Crear wallet
POST /api/v1/tx/send         # Enviar transacción
POST /api/v1/mining/start    # Iniciar minería
GET  /api/v1/system/stats    # Estadísticas del sistema
```

## Endpoints del Backend (Proxy)

### Wallet
```
POST /api/wallet/create      # Crear wallet (proxy a /api/v1/wallet/create)
POST /api/wallet/balance     # Obtener balance (calculado desde transacciones)
POST /api/wallet/transactions # Obtener transacciones (proxy a /api/v1/transactions)
POST /api/wallet/send        # Enviar transacción (proxy a /api/v1/transaction)
```

### Blockchain Stats
```
POST /api/blockchain/stats   # Estadísticas generales (calculadas desde endpoints reales)
GET  /api/blockchain/latest-block # Último bloque (desde /api/v1/blocks)
GET  /api/blockchain/network-info # Info de red (desde /api/v1/status)
```

### Mining (Implementado en RSC Chain)
```
POST /api/mining/start       # Iniciar minería (conecta a /api/v1/mining/start)
POST /api/mining/stop        # Detener minería (proxy a RSC Chain)
GET  /api/mining/status      # Estado de minería (proxy a RSC Chain)
POST /api/mining/reward      # Recompensa de minería (desde /api/v1/wallet/:address)
```

### Staking (No implementado en blockchain actual)
```
GET  /api/staking/pools      # Pools de staking (501 - No implementado)
GET  /api/staking/validators # Validadores (501 - No implementado)
POST /api/staking/delegate   # Delegar tokens (501 - No implementado)
POST /api/staking/undelegate # Retirar delegación (501 - No implementado)
POST /api/staking/delegations # Consultar delegaciones (501 - No implementado)
```

### P2P (No implementado en blockchain actual)
```
GET  /api/p2p/orders         # Órdenes P2P (501 - No implementado)
POST /api/p2p/orders         # Crear orden P2P (501 - No implementado)
POST /api/p2p/execute        # Ejecutar orden P2P (501 - No implementado)
DELETE /api/p2p/orders/:id   # Cancelar orden P2P (501 - No implementado)
POST /api/p2p/transactions   # Transacciones P2P (501 - No implementado)
```

## Ejemplos de Uso

### Crear Wallet
```bash
curl -X POST http://localhost:4000/api/wallet/create \
  -H "Content-Type: application/json"
```

### Obtener Balance
```bash
curl -X POST http://localhost:4000/api/wallet/balance \
  -H "Content-Type: application/json" \
  -d '{"address": "0x1234567890123456789012345678901234567890"}'
```

### Enviar Transacción
```bash
curl -X POST http://localhost:4000/api/wallet/send \
  -H "Content-Type: application/json" \
  -d '{
    "from": "0x1234567890123456789012345678901234567890",
    "to": "0x0987654321098765432109876543210987654321",
    "amount": 100,
    "privateKey": "0x..."
  }'
```

### Obtener Estadísticas
```bash
curl -X POST http://localhost:4000/api/blockchain/stats \
  -H "Content-Type: application/json"
```

### Obtener Transacciones
```bash
curl -X POST http://localhost:4000/api/wallet/transactions \
  -H "Content-Type: application/json" \
  -d '{"address": "0x1234567890123456789012345678901234567890"}'
```

## Respuestas de Error

Todas las respuestas de error siguen este formato:
```json
{
  "error": "Descripción del error",
  "details": "Detalles adicionales del error"
}
```

## Respuestas de Éxito

### Wallet Create
```json
{
  "address": "0x...",
  "privateKey": "0x...",
  "message": "Wallet created successfully"
}
```

### Balance
```json
{
  "balance": 1000.5
}
```

### Transactions
```json
{
  "transactions": [
    {
      "from": "0x...",
      "to": "0x...",
      "amount": 100,
      "timestamp": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### Blockchain Stats
```json
{
  "totalSupply": 1000000000,
  "circulatingSupply": 1000000000,
  "totalStaked": 0,
  "activeValidators": 0,
  "totalTransactions": 1500,
  "currentPrice": 0,
  "latestBlock": {...},
  "nodeStatus": {...}
}
```

## Notas Importantes

1. **Endpoints Reales**: Solo wallet y transacciones están completamente implementados
2. **Endpoints No Implementados**: Mining, staking y P2P no están implementados en la blockchain actual
3. **Validación**: Todos los endpoints validan direcciones de wallet (formato 0x...)
4. **Balance**: Se calcula desde las transacciones, no hay endpoint directo de balance
5. **Transacciones**: Se filtran por dirección de wallet

## Estado de Implementación

- ✅ **Wallet**: Completamente funcional (conecta a RSC Chain)
- ✅ **Transacciones**: Completamente funcional (conecta a RSC Chain)
- ✅ **Estadísticas**: Completamente funcional (conecta a RSC Chain)
- ✅ **Mining**: Implementado (conecta a RSC Chain)
- ❌ **Staking**: No implementado en blockchain actual
- ❌ **P2P**: No implementado en blockchain actual 