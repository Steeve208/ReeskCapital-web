-- ========================================
-- SCRIPT PARA CORREGIR LA BASE DE DATOS RSC
-- ========================================

-- Primero, vamos a ver qué tablas existen
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%mining%';

-- Eliminar tablas existentes si están mal configuradas
DROP TABLE IF EXISTS mining_sessions CASCADE;
DROP TABLE IF EXISTS mining_transactions CASCADE;
DROP TABLE IF EXISTS miners CASCADE;

-- Crear tabla de mineros CORRECTA
CREATE TABLE miners (
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

-- Crear tabla de transacciones CORRECTA
CREATE TABLE mining_transactions (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    hash_power DECIMAL(20,2) NOT NULL,
    reward DECIMAL(20,2) NOT NULL,
    block_hash VARCHAR(255) NOT NULL,
    timestamp TIMESTAMP DEFAULT NOW()
);

-- Crear tabla de sesiones CORRECTA
CREATE TABLE mining_sessions (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    session_id VARCHAR(255) UNIQUE NOT NULL,
    start_time TIMESTAMP DEFAULT NOW(),
    end_time TIMESTAMP,
    total_hash_power DECIMAL(20,2) DEFAULT 0,
    total_reward DECIMAL(20,2) DEFAULT 0,
    is_active BOOLEAN DEFAULT true
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_miners_email ON miners(email);
CREATE INDEX idx_miners_hash_power ON miners(hash_power DESC);
CREATE INDEX idx_mining_transactions_email ON mining_transactions(email);
CREATE INDEX idx_mining_transactions_timestamp ON mining_transactions(timestamp DESC);
CREATE INDEX idx_mining_sessions_email ON mining_sessions(email);
CREATE INDEX idx_mining_sessions_active ON mining_sessions(is_active);

-- Habilitar RLS (Row Level Security)
ALTER TABLE miners ENABLE ROW LEVEL SECURITY;
ALTER TABLE mining_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE mining_sessions ENABLE ROW LEVEL SECURITY;

-- Crear políticas para permitir acceso público (solo para testing)
CREATE POLICY "Allow public access" ON miners FOR ALL USING (true);
CREATE POLICY "Allow public access" ON mining_transactions FOR ALL USING (true);
CREATE POLICY "Allow public access" ON mining_sessions FOR ALL USING (true);

-- Insertar datos de prueba
INSERT INTO miners (email, name, wallet_address, hash_power, balance) 
VALUES 
    ('admin@rsc.com', 'Admin Miner', '0x1234567890abcdef', 1000, 100),
    ('test@rsc.com', 'Test Miner', '0xfedcba0987654321', 500, 50),
    ('user@rsc.local', 'Usuario RSC', '0xabcdef1234567890', 750, 75)
ON CONFLICT (email) DO NOTHING;

-- Verificar que las tablas se crearon correctamente
SELECT 'miners' as table_name, COUNT(*) as row_count FROM miners
UNION ALL
SELECT 'mining_transactions' as table_name, COUNT(*) as row_count FROM mining_transactions
UNION ALL
SELECT 'mining_sessions' as table_name, COUNT(*) as row_count FROM mining_sessions;

-- Mostrar estructura de las tablas
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name IN ('miners', 'mining_transactions', 'mining_sessions')
ORDER BY table_name, ordinal_position;
