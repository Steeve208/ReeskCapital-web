-- ========================================
-- SUPABASE DATABASE SETUP FOR RSC MINING
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de transacciones de minería
CREATE TABLE IF NOT EXISTS mining_transactions (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    hash_power DECIMAL(20,2) NOT NULL,
    reward DECIMAL(20,2) NOT NULL,
    block_hash VARCHAR(255) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_miners_email ON miners(email);
CREATE INDEX IF NOT EXISTS idx_miners_hash_power ON miners(hash_power DESC);
CREATE INDEX IF NOT EXISTS idx_miners_balance ON miners(balance DESC);
CREATE INDEX IF NOT EXISTS idx_miners_last_active ON miners(last_active DESC);

CREATE INDEX IF NOT EXISTS idx_mining_transactions_email ON mining_transactions(email);
CREATE INDEX IF NOT EXISTS idx_mining_transactions_timestamp ON mining_transactions(timestamp DESC);

-- Políticas de seguridad para acceso anónimo (para demo)
-- NOTA: En producción, considera usar autenticación real

-- Permitir inserción para todos (registro de mineros)
CREATE POLICY IF NOT EXISTS "Allow anonymous insert on miners" ON miners
    FOR INSERT WITH CHECK (true);

-- Permitir actualización para todos (actualización de progreso)
CREATE POLICY IF NOT EXISTS "Allow anonymous update on miners" ON miners
    FOR UPDATE USING (true);

-- Permitir lectura para todos (leaderboard público)
CREATE POLICY IF NOT EXISTS "Allow anonymous select on miners" ON miners
    FOR SELECT USING (true);

-- Permitir inserción para todos (transacciones de minería)
CREATE POLICY IF NOT EXISTS "Allow anonymous insert on mining_transactions" ON mining_transactions
    FOR INSERT WITH CHECK (true);

-- Permitir lectura para todos (historial de transacciones)
CREATE POLICY IF NOT EXISTS "Allow anonymous select on mining_transactions" ON mining_transactions
    FOR SELECT USING (true);

-- Habilitar RLS (Row Level Security)
ALTER TABLE miners ENABLE ROW LEVEL SECURITY;
ALTER TABLE mining_transactions ENABLE ROW LEVEL SECURITY;

-- Datos de ejemplo (opcional)
INSERT INTO miners (email, name, wallet_address, hash_power, balance, blocks_mined) VALUES
    ('demo1@example.com', 'Minero Demo 1', '0x1234567890abcdef', 150.50, 1250.75, 25),
    ('demo2@example.com', 'Minero Demo 2', '0xabcdef1234567890', 89.25, 567.30, 15),
    ('demo3@example.com', 'Minero Demo 3', NULL, 45.80, 234.60, 8)
ON CONFLICT (email) DO NOTHING;

-- Función para actualizar last_active automáticamente
CREATE OR REPLACE FUNCTION update_last_active()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_active = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar last_active en cada update
CREATE TRIGGER update_miners_last_active
    BEFORE UPDATE ON miners
    FOR EACH ROW
    EXECUTE FUNCTION update_last_active();

-- Función para obtener estadísticas generales
CREATE OR REPLACE FUNCTION get_mining_stats()
RETURNS TABLE(
    total_miners BIGINT,
    total_hash_power DECIMAL,
    total_balance DECIMAL,
    total_blocks_mined BIGINT,
    avg_hash_power DECIMAL,
    avg_balance DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::BIGINT as total_miners,
        COALESCE(SUM(hash_power), 0) as total_hash_power,
        COALESCE(SUM(balance), 0) as total_balance,
        COALESCE(SUM(blocks_mined), 0)::BIGINT as total_blocks_mined,
        COALESCE(AVG(hash_power), 0) as avg_hash_power,
        COALESCE(AVG(balance), 0) as avg_balance
    FROM miners;
END;
$$ LANGUAGE plpgsql;

-- Función para obtener top mineros
CREATE OR REPLACE FUNCTION get_top_miners(limit_count INTEGER DEFAULT 10)
RETURNS TABLE(
    rank INTEGER,
    email VARCHAR,
    name VARCHAR,
    hash_power DECIMAL,
    balance DECIMAL,
    blocks_mined INTEGER,
    last_active TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ROW_NUMBER() OVER (ORDER BY hash_power DESC, balance DESC) as rank,
        m.email,
        m.name,
        m.hash_power,
        m.balance,
        m.blocks_mined,
        m.last_active
    FROM miners m
    ORDER BY m.hash_power DESC, m.balance DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Vista para estadísticas en tiempo real
CREATE OR REPLACE VIEW mining_dashboard AS
SELECT 
    COUNT(*) as total_miners,
    COALESCE(SUM(hash_power), 0) as total_hash_power,
    COALESCE(SUM(balance), 0) as total_balance,
    COALESCE(SUM(blocks_mined), 0) as total_blocks_mined,
    COALESCE(AVG(hash_power), 0) as avg_hash_power,
    COALESCE(AVG(balance), 0) as avg_balance,
    COUNT(CASE WHEN last_active > NOW() - INTERVAL '1 hour' THEN 1 END) as active_last_hour,
    COUNT(CASE WHEN last_active > NOW() - INTERVAL '24 hours' THEN 1 END) as active_last_day
FROM miners;

-- Comentarios en las tablas
COMMENT ON TABLE miners IS 'Tabla principal de mineros del sistema RSC';
COMMENT ON TABLE mining_transactions IS 'Historial de transacciones de minería';
COMMENT ON COLUMN miners.email IS 'Email único del minero';
COMMENT ON COLUMN miners.hash_power IS 'Poder de hash actual del minero';
COMMENT ON COLUMN miners.balance IS 'Balance actual en RSC';
COMMENT ON COLUMN miners.blocks_mined IS 'Número total de bloques minados';

-- Verificar la configuración
SELECT 
    'miners' as table_name,
    COUNT(*) as row_count
FROM miners
UNION ALL
SELECT 
    'mining_transactions' as table_name,
    COUNT(*) as row_count
FROM mining_transactions;

-- Mostrar estadísticas del dashboard
SELECT * FROM mining_dashboard;
