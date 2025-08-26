-- ========================================
-- CREAR TABLAS PARA RSC MINING SYSTEM
-- ========================================

-- Tabla de mineros
CREATE TABLE IF NOT EXISTS miners (
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

-- Tabla de transacciones de minería
CREATE TABLE IF NOT EXISTS mining_transactions (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    hash_power DECIMAL(20,2) NOT NULL,
    reward DECIMAL(20,2) NOT NULL,
    block_hash VARCHAR(255) NOT NULL,
    timestamp TIMESTAMP DEFAULT NOW()
);

-- Tabla de sesiones de minería
CREATE TABLE IF NOT EXISTS mining_sessions (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    session_id VARCHAR(255) UNIQUE NOT NULL,
    start_time TIMESTAMP DEFAULT NOW(),
    end_time TIMESTAMP,
    total_hash_power DECIMAL(20,2) DEFAULT 0,
    total_reward DECIMAL(20,2) DEFAULT 0,
    is_active BOOLEAN DEFAULT true
);

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_miners_email ON miners(email);
CREATE INDEX IF NOT EXISTS idx_miners_hash_power ON miners(hash_power DESC);
CREATE INDEX IF NOT EXISTS idx_mining_transactions_email ON mining_transactions(email);
CREATE INDEX IF NOT EXISTS idx_mining_transactions_timestamp ON mining_transactions(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_mining_sessions_email ON mining_sessions(email);
CREATE INDEX IF NOT EXISTS idx_mining_sessions_active ON mining_sessions(is_active);

-- Políticas RLS (Row Level Security) - Permitir acceso público para testing
ALTER TABLE miners ENABLE ROW LEVEL SECURITY;
ALTER TABLE mining_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE mining_sessions ENABLE ROW LEVEL SECURITY;

-- Política para permitir acceso público (solo para testing)
CREATE POLICY "Allow public access" ON miners FOR ALL USING (true);
CREATE POLICY "Allow public access" ON mining_transactions FOR ALL USING (true);
CREATE POLICY "Allow public access" ON mining_sessions FOR ALL USING (true);

-- Insertar algunos datos de prueba
INSERT INTO miners (email, name, wallet_address, hash_power, balance) 
VALUES 
    ('admin@rsc.com', 'Admin Miner', '0x1234567890abcdef', 1000, 100),
    ('test@rsc.com', 'Test Miner', '0xfedcba0987654321', 500, 50)
ON CONFLICT (email) DO NOTHING;

-- Verificar que las tablas se crearon correctamente
SELECT 'miners' as table_name, COUNT(*) as row_count FROM miners
UNION ALL
SELECT 'mining_transactions' as table_name, COUNT(*) as row_count FROM mining_transactions
UNION ALL
SELECT 'mining_sessions' as table_name, COUNT(*) as row_count FROM mining_sessions;
