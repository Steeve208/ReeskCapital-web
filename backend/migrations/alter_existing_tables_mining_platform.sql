-- ===== ALTERACIONES A TABLAS EXISTENTES =====
-- Ejecutar este script para agregar campos faltantes a las tablas existentes
-- Solo ejecutar si los campos no existen

-- ===== ALTERAR TABLA USERS =====
-- Agregar campos adicionales si no existen

-- Wallet address para retiros
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'wallet_address'
    ) THEN
        ALTER TABLE users ADD COLUMN wallet_address VARCHAR(255);
    END IF;
END $$;

-- Status (si no existe como VARCHAR)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'status'
    ) THEN
        ALTER TABLE users ADD COLUMN status VARCHAR(20) DEFAULT 'active';
    END IF;
END $$;

-- Last login
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'last_login'
    ) THEN
        ALTER TABLE users ADD COLUMN last_login TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- Settings JSONB
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'settings'
    ) THEN
        ALTER TABLE users ADD COLUMN settings JSONB DEFAULT '{}'::jsonb;
    END IF;
END $$;

-- Password hash (si no existe)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'password'
    ) THEN
        -- Verificar si existe password_hash
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'users' AND column_name = 'password_hash'
        ) THEN
            ALTER TABLE users ADD COLUMN password VARCHAR(255);
        END IF;
    END IF;
END $$;

-- ===== ALTERAR TABLA MINING_SESSIONS =====

-- Pool URL
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'mining_sessions' AND column_name = 'pool_url'
    ) THEN
        ALTER TABLE mining_sessions ADD COLUMN pool_url VARCHAR(255);
    END IF;
END $$;

-- Algorithm
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'mining_sessions' AND column_name = 'algorithm'
    ) THEN
        ALTER TABLE mining_sessions ADD COLUMN algorithm VARCHAR(50) DEFAULT 'sha256';
    END IF;
END $$;

-- CPU Threads
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'mining_sessions' AND column_name = 'cpu_threads'
    ) THEN
        ALTER TABLE mining_sessions ADD COLUMN cpu_threads INTEGER;
    END IF;
END $$;

-- Intensity
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'mining_sessions' AND column_name = 'intensity'
    ) THEN
        ALTER TABLE mining_sessions ADD COLUMN intensity VARCHAR(20);
    END IF;
END $$;

-- Peak Hash Rate
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'mining_sessions' AND column_name = 'peak_hash_rate'
    ) THEN
        ALTER TABLE mining_sessions ADD COLUMN peak_hash_rate DECIMAL(15, 2) DEFAULT 0.00;
    END IF;
END $$;

-- Metadata JSONB
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'mining_sessions' AND column_name = 'metadata'
    ) THEN
        ALTER TABLE mining_sessions ADD COLUMN metadata JSONB DEFAULT '{}'::jsonb;
    END IF;
END $$;

-- ===== ALTERAR TABLA TRANSACTIONS =====

-- ID Primary Key (si no existe)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'transactions' AND column_name = 'id'
    ) THEN
        ALTER TABLE transactions ADD COLUMN id UUID DEFAULT uuid_generate_v4() PRIMARY KEY;
    END IF;
END $$;

-- Reference Type
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'transactions' AND column_name = 'reference_type'
    ) THEN
        ALTER TABLE transactions ADD COLUMN reference_type VARCHAR(50);
    END IF;
END $$;

-- Status
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'transactions' AND column_name = 'status'
    ) THEN
        ALTER TABLE transactions ADD COLUMN status VARCHAR(20) DEFAULT 'completed';
    END IF;
END $$;

-- Metadata JSONB
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'transactions' AND column_name = 'metadata'
    ) THEN
        ALTER TABLE transactions ADD COLUMN metadata JSONB DEFAULT '{}'::jsonb;
    END IF;
END $$;

-- Updated At
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'transactions' AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE transactions ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- ===== ALTERAR TABLA REFERRALS =====

-- Status
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'referrals' AND column_name = 'status'
    ) THEN
        ALTER TABLE referrals ADD COLUMN status VARCHAR(20) DEFAULT 'active';
    END IF;
END $$;

-- Referral Code
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'referrals' AND column_name = 'referral_code'
    ) THEN
        ALTER TABLE referrals ADD COLUMN referral_code VARCHAR(10);
    END IF;
END $$;

-- Updated At
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'referrals' AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE referrals ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- ===== CREAR ÍNDICES ADICIONALES =====

-- Users
CREATE INDEX IF NOT EXISTS idx_users_wallet_address ON users(wallet_address) WHERE wallet_address IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_users_last_login ON users(last_login) WHERE last_login IS NOT NULL;

-- Mining Sessions
CREATE INDEX IF NOT EXISTS idx_mining_sessions_pool_url ON mining_sessions(pool_url) WHERE pool_url IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_mining_sessions_algorithm ON mining_sessions(algorithm);
CREATE INDEX IF NOT EXISTS idx_mining_sessions_start_time ON mining_sessions(start_time);

-- Transactions
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_reference_type ON transactions(reference_type) WHERE reference_type IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at);

-- Referrals
CREATE INDEX IF NOT EXISTS idx_referrals_status ON referrals(status);
CREATE INDEX IF NOT EXISTS idx_referrals_referral_code ON referrals(referral_code) WHERE referral_code IS NOT NULL;

-- ===== FIN DEL SCRIPT =====

