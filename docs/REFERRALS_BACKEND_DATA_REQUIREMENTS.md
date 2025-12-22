# 📋 Datos Necesarios del Backend para Integración de Referrals

## Estructura de Datos Requerida

### 1. **GET /api/referrals** - Lista de Referidos

**Datos necesarios por cada referido:**

```json
{
  "id": "uuid",
  "referrer_id": "uuid",
  "referred_id": "uuid",
  "referred_email": "string",        // Desde users.email
  "referred_username": "string",     // Desde users.username
  "referred_joined_at": "timestamp", // Desde users.created_at o referrals.created_at
  "referred_status": "string",        // Desde users.status ('active' o null)
  "referred_balance": "decimal",     // Desde users.balance
  "commission_rate": "decimal",      // Desde referrals.commission_rate
  "total_commission": "decimal",     // Desde referrals.total_commission
  "created_at": "timestamp",         // Desde referrals.created_at
  "avg_hashrate": "decimal",         // CALCULADO: AVG(hash_rate) desde mining_sessions WHERE user_id = referred_id AND status = 'completed'
  "total_earnings": "decimal"        // CALCULADO: SUM(amount) desde transactions WHERE user_id = referred_id AND type = 'mining' AND amount > 0
}
```

**Totales necesarios:**
- `total_referrals`: COUNT(*) de referrals
- `active_referrals`: COUNT(*) WHERE users.status = 'active'
- `total_commissions`: SUM(total_commission) de referrals

---

### 2. **GET /api/referrals/commissions** - Lista de Comisiones

**Datos necesarios por cada comisión:**

```json
{
  "id": "uuid",
  "user_id": "uuid",                 // ID del referrer (quien recibe la comisión)
  "type": "referral_commission",
  "amount": "decimal",               // Monto de la comisión
  "balance_before": "decimal",
  "balance_after": "decimal",
  "reference_id": "uuid",            // ID del referido o de la transacción de mining original
  "reference_type": "string",         // 'referral' o 'mining_session'
  "description": "string",           // Ej: "Commission from referred user mining"
  "metadata": {                       // JSONB con información adicional
    "referredEmail": "string",       // Email del referido que generó la comisión
    "referred_id": "uuid",           // ID del referido
    "miningAmount": "decimal",       // Monto minado que generó la comisión
    "miningTransactionId": "uuid"   // ID de la transacción de mining original
  },
  "status": "string",                 // 'completed', 'pending'
  "created_at": "timestamp"
}
```

**Totales necesarios:**
- `total`: SUM(amount) de todas las comisiones del período
- `period_total`: igual que total

---

### 3. **GET /api/referrals/commissions-chart** - Datos para Gráfico

**Datos necesarios:**

```json
{
  "chart_data": [
    {
      "date": "YYYY-MM-DD",          // DATE(created_at)
      "commissions": "decimal"        // SUM(amount) agrupado por día
    }
  ]
}
```

**Filtros:**
- `days`: número de días (default: 30)
- Solo transacciones con `type = 'referral_commission'`
- Solo transacciones con `status = 'completed'` o `status IS NULL`

---

### 4. **GET /api/referrals/stats** - Estadísticas Generales

**Datos necesarios:**

```json
{
  "total_referrals": "integer",
  "active_referrals": "integer",
  "total_commissions_earned": "decimal",
  "commission_rate": "decimal",      // Tasa promedio de comisión
  "referral_code": "string"          // Código de referral del usuario actual
}
```

---

## Estructura de Tablas Esperada

### Tabla `referrals`
- `id` (UUID)
- `referrer_id` (UUID) → FK a users.id
- `referred_id` (UUID) → FK a users.id
- `commission_rate` (DECIMAL 5,4) → default 0.1000 (10%)
- `total_commission` (DECIMAL 20,8) → suma acumulada
- `status` (VARCHAR 20) → 'active', 'inactive', 'cancelled'
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### Tabla `users`
- `id` (UUID)
- `email` (VARCHAR 255)
- `username` (VARCHAR 50)
- `balance` (DECIMAL 20,8)
- `status` (VARCHAR 20) → 'active' o NULL
- `referral_code` (VARCHAR 10)
- `created_at` (TIMESTAMP)

### Tabla `mining_sessions`
- `id` (UUID)
- `user_id` (UUID) → FK a users.id
- `hash_rate` (DECIMAL 15,2)
- `status` (VARCHAR 20) → 'active', 'completed', 'expired'
- `created_at` (TIMESTAMP)

### Tabla `transactions`
- `id` (UUID)
- `user_id` (UUID) → FK a users.id
- `type` (VARCHAR 30) → 'mining', 'referral_commission', etc.
- `amount` (DECIMAL 20,8)
- `balance_before` (DECIMAL 20,8)
- `balance_after` (DECIMAL 20,8)
- `reference_id` (UUID)
- `reference_type` (VARCHAR 30)
- `description` (TEXT)
- `metadata` (JSONB)
- `status` (VARCHAR 20) → 'completed', 'pending', etc.
- `created_at` (TIMESTAMP)

---

## Consultas SQL Necesarias

### 1. Lista de Referidos con Hashrate y Earnings

```sql
SELECT 
  r.*,
  u.id as referred_id,
  u.email as referred_email,
  u.username as referred_username,
  u.created_at as referred_joined_at,
  u.balance as referred_balance,
  u.status as referred_status,
  -- Hashrate promedio
  COALESCE((
    SELECT AVG(hash_rate)
    FROM mining_sessions
    WHERE user_id = r.referred_id 
    AND status = 'completed'
  ), 0) as avg_hashrate,
  -- Earnings totales
  COALESCE((
    SELECT SUM(amount)
    FROM transactions
    WHERE user_id = r.referred_id 
    AND type = 'mining' 
    AND amount > 0
    AND (COALESCE(status, 'completed') = 'completed' OR status IS NULL)
  ), 0) as total_earnings
FROM referrals r
JOIN users u ON r.referred_id = u.id
WHERE r.referrer_id = $1
ORDER BY r.created_at DESC
```

### 2. Comisiones del Período

```sql
SELECT * FROM transactions
WHERE user_id = $1 
AND type = 'referral_commission' 
AND created_at >= $2
AND (COALESCE(status, 'completed') = 'completed' OR status IS NULL)
ORDER BY created_at DESC
```

### 3. Datos para Gráfico de Comisiones

```sql
SELECT 
  DATE(created_at) as date,
  COALESCE(SUM(amount), 0) as daily_commissions
FROM transactions
WHERE user_id = $1 
AND type = 'referral_commission'
AND created_at >= $2
AND (COALESCE(status, 'completed') = 'completed' OR status IS NULL)
GROUP BY DATE(created_at)
ORDER BY date ASC
```

---

## Campos Críticos en `transactions.metadata`

Para mostrar correctamente la información de comisiones, el campo `metadata` (JSONB) debería contener:

```json
{
  "referredEmail": "usuario@example.com",
  "referred_id": "uuid-del-referido",
  "miningAmount": 10.5,
  "miningTransactionId": "uuid-de-transaccion-mining"
}
```

Esto permite mostrar:
- Email del referido que generó la comisión
- Monto minado que generó la comisión
- Relación con la transacción original

---

## Validaciones Necesarias

1. **Campo `status` en users**: Verificar si existe `status` o usar `is_active` (BOOLEAN)
2. **Campo `status` en referrals**: Verificar si existe o usar `is_active` (BOOLEAN)
3. **Campo `status` en transactions**: Puede ser NULL, tratar como 'completed' si es NULL
4. **Campo `metadata` en transactions**: Puede ser NULL o vacío, manejar con valores por defecto

