-- ===== RSC MINING BACKEND SCHEMA - VERSIÓN CORREGIDA =====
-- Esquema completo para Supabase con sistema de referidos
-- Ejecutar este script completo en tu SQL Editor de Supabase

-- Extensión para UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===== TABLA DE USUARIOS =====
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    balance DECIMAL(20, 8) DEFAULT 0.00000000,
    referral_code VARCHAR(10) UNIQUE NOT NULL,
    referred_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true
);

-- ===== TABLA DE REFERRALS =====
CREATE TABLE IF NOT EXISTS referrals (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    referrer_id UUID NOT NULL REFERENCES users(id),
    referred_id UUID NOT NULL REFERENCES users(id),
    commission_rate DECIMAL(5, 4) DEFAULT 0.1000, -- 10%
    total_commission DECIMAL(20, 8) DEFAULT 0.00000000,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(referrer_id, referred_id)
);

-- ===== TABLA DE SESIONES DE MINERÍA =====
CREATE TABLE IF NOT EXISTS mining_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    session_id VARCHAR(100) UNIQUE NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE,
    duration_ms BIGINT,
    tokens_mined DECIMAL(20, 8) DEFAULT 0.00000000,
    hash_rate DECIMAL(15, 2) DEFAULT 0.00,
    efficiency DECIMAL(5, 2) DEFAULT 100.00,
    status VARCHAR(20) DEFAULT 'active', -- active, completed, expired
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===== TABLA DE TRANSACCIONES =====
CREATE TABLE IF NOT EXISTS transactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    type VARCHAR(20) NOT NULL, -- mining, referral_commission, bonus
    amount DECIMAL(20, 8) NOT NULL,
    balance_before DECIMAL(20, 8) NOT NULL,
    balance_after DECIMAL(20, 8) NOT NULL,
    reference_id UUID, -- ID de sesión o referral
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===== TABLA DE CÓDIGOS DE INVITACIÓN =====
CREATE TABLE IF NOT EXISTS referral_codes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    code VARCHAR(10) UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE
);

-- ===== ÍNDICES PARA OPTIMIZACIÓN =====
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_referral_code ON users(referral_code);
CREATE INDEX IF NOT EXISTS idx_users_referred_by ON users(referred_by);
CREATE INDEX IF NOT EXISTS idx_mining_sessions_user_id ON mining_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_mining_sessions_session_id ON mining_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_mining_sessions_status ON mining_sessions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer_id ON referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred_id ON referrals(referred_id);

-- ===== FUNCIONES DE TRIGGER =====

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_mining_sessions_updated_at ON mining_sessions;
CREATE TRIGGER update_mining_sessions_updated_at BEFORE UPDATE ON mining_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===== FUNCIÓN PARA GENERAR CÓDIGO DE REFERRAL =====
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS VARCHAR(10) AS $$
DECLARE
    code VARCHAR(10);
    exists_count INTEGER;
BEGIN
    LOOP
        -- Generar código de 8 caracteres alfanuméricos
        code := UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8));
        
        -- Verificar si ya existe
        SELECT COUNT(*) INTO exists_count FROM users WHERE referral_code = code;
        
        -- Si no existe, salir del loop
        IF exists_count = 0 THEN
            EXIT;
        END IF;
    END LOOP;
    
    RETURN code;
END;
$$ LANGUAGE plpgsql;

-- ===== FUNCIÓN PARA PROCESAR COMISIÓN DE REFERRAL =====
CREATE OR REPLACE FUNCTION process_referral_commission(
    p_referred_user_id UUID,
    p_mining_amount DECIMAL(20, 8)
)
RETURNS DECIMAL(20, 8) AS $$
DECLARE
    v_referrer_id UUID;
    v_commission_rate DECIMAL(5, 4);
    v_commission_amount DECIMAL(20, 8);
    v_referrer_balance DECIMAL(20, 8);
BEGIN
    -- Obtener el referrer del usuario
    SELECT referred_by INTO v_referrer_id 
    FROM users 
    WHERE id = p_referred_user_id;
    
    -- Si no tiene referrer, no hay comisión
    IF v_referrer_id IS NULL THEN
        RETURN 0;
    END IF;
    
    -- Obtener la tasa de comisión
    SELECT commission_rate INTO v_commission_rate 
    FROM referrals 
    WHERE referrer_id = v_referrer_id AND referred_id = p_referred_user_id;
    
    -- Calcular comisión (10% por defecto)
    v_commission_amount := p_mining_amount * COALESCE(v_commission_rate, 0.1000);
    
    -- Obtener balance actual del referrer
    SELECT balance INTO v_referrer_balance 
    FROM users 
    WHERE id = v_referrer_id;
    
    -- Actualizar balance del referrer
    UPDATE users 
    SET balance = balance + v_commission_amount,
        updated_at = NOW()
    WHERE id = v_referrer_id;
    
    -- Actualizar comisión total en referrals
    UPDATE referrals 
    SET total_commission = total_commission + v_commission_amount
    WHERE referrer_id = v_referrer_id AND referred_id = p_referred_user_id;
    
    -- Registrar transacción de comisión
    INSERT INTO transactions (
        user_id, type, amount, balance_before, balance_after, 
        reference_id, description
    ) VALUES (
        v_referrer_id, 'referral_commission', v_commission_amount, 
        v_referrer_balance, v_referrer_balance + v_commission_amount,
        p_referred_user_id, 'Commission from referred user mining'
    );
    
    RETURN v_commission_amount;
END;
$$ LANGUAGE plpgsql;

-- ===== FUNCIÓN PARA REGISTRAR USUARIO (CORREGIDA) =====
CREATE OR REPLACE FUNCTION register_user(
    p_email VARCHAR(255),
    p_username VARCHAR(50),
    p_referral_code VARCHAR(10) DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    v_user_id UUID;
    v_referrer_id UUID;
    v_new_referral_code VARCHAR(10);
    v_result JSON;
    v_existing_user_id UUID;
BEGIN
    -- Verificar si ya existe un usuario con este email
    SELECT id INTO v_existing_user_id FROM users WHERE email = p_email;
    IF v_existing_user_id IS NOT NULL THEN
        RETURN json_build_object(
            'success', false,
            'error', 'User already exists with this email'
        );
    END IF;
    
    -- Verificar si ya existe un usuario con este username
    SELECT id INTO v_existing_user_id FROM users WHERE username = p_username;
    IF v_existing_user_id IS NOT NULL THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Username already taken'
        );
    END IF;
    
    -- Generar código de referral único
    v_new_referral_code := generate_referral_code();
    
    -- Verificar si hay código de referral válido
    IF p_referral_code IS NOT NULL AND p_referral_code != '' THEN
        SELECT id INTO v_referrer_id 
        FROM users 
        WHERE referral_code = p_referral_code AND is_active = true;
    END IF;
    
    -- Insertar usuario
    INSERT INTO users (email, username, referral_code, referred_by)
    VALUES (p_email, p_username, v_new_referral_code, v_referrer_id)
    RETURNING id INTO v_user_id;
    
    -- Si tiene referrer, crear relación de referral
    IF v_referrer_id IS NOT NULL THEN
        INSERT INTO referrals (referrer_id, referred_id)
        VALUES (v_referrer_id, v_user_id)
        ON CONFLICT (referrer_id, referred_id) DO NOTHING;
    END IF;
    
    -- Crear entrada en referral_codes
    INSERT INTO referral_codes (user_id, code)
    VALUES (v_user_id, v_new_referral_code)
    ON CONFLICT (code) DO NOTHING;
    
    -- Preparar resultado
    v_result := json_build_object(
        'success', true,
        'user_id', v_user_id,
        'referral_code', v_new_referral_code,
        'referred_by', v_referrer_id
    );
    
    RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- ===== FUNCIÓN PARA ACTUALIZAR BALANCE (CORREGIDA) =====
CREATE OR REPLACE FUNCTION update_user_balance(
    p_user_id UUID,
    p_amount DECIMAL(20, 8),
    p_transaction_type VARCHAR(20),
    p_description TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    v_balance_before DECIMAL(20, 8);
    v_balance_after DECIMAL(20, 8);
    v_commission_amount DECIMAL(20, 8);
    v_result JSON;
    v_user_exists BOOLEAN;
BEGIN
    -- Verificar si el usuario existe
    SELECT EXISTS(SELECT 1 FROM users WHERE id = p_user_id) INTO v_user_exists;
    
    IF NOT v_user_exists THEN
        RETURN json_build_object(
            'success', false,
            'error', 'User not found'
        );
    END IF;
    
    -- Obtener balance actual
    SELECT balance INTO v_balance_before 
    FROM users 
    WHERE id = p_user_id;
    
    -- Calcular nuevo balance
    v_balance_after := v_balance_before + p_amount;
    
    -- Actualizar balance
    UPDATE users 
    SET balance = v_balance_after,
        updated_at = NOW()
    WHERE id = p_user_id;
    
    -- Registrar transacción
    INSERT INTO transactions (
        user_id, type, amount, balance_before, balance_after, description
    ) VALUES (
        p_user_id, p_transaction_type, p_amount, 
        v_balance_before, v_balance_after, p_description
    );
    
    -- Si es mining, procesar comisión de referral
    IF p_transaction_type = 'mining' AND p_amount > 0 THEN
        v_commission_amount := process_referral_commission(p_user_id, p_amount);
    END IF;
    
    -- Preparar resultado
    v_result := json_build_object(
        'success', true,
        'balance_before', v_balance_before,
        'balance_after', v_balance_after,
        'commission_paid', COALESCE(v_commission_amount, 0)
    );
    
    RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- ===== POLÍTICAS DE SEGURIDAD (RLS) =====

-- Habilitar RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE mining_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_codes ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes si existen
DROP POLICY IF EXISTS "Users can view own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Users can view own mining sessions" ON mining_sessions;
DROP POLICY IF EXISTS "Users can insert own mining sessions" ON mining_sessions;
DROP POLICY IF EXISTS "Users can update own mining sessions" ON mining_sessions;
DROP POLICY IF EXISTS "Users can view own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can view own referrals" ON referrals;

-- Políticas para usuarios (pueden ver solo sus propios datos)
CREATE POLICY "Users can view own data" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Políticas para sesiones de minería
CREATE POLICY "Users can view own mining sessions" ON mining_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own mining sessions" ON mining_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own mining sessions" ON mining_sessions
    FOR UPDATE USING (auth.uid() = user_id);

-- Políticas para transacciones
CREATE POLICY "Users can view own transactions" ON transactions
    FOR SELECT USING (auth.uid() = user_id);

-- Políticas para referrals
CREATE POLICY "Users can view own referrals" ON referrals
    FOR SELECT USING (auth.uid() = referrer_id OR auth.uid() = referred_id);

-- ===== DATOS DE PRUEBA =====
-- Insertar usuario de prueba
INSERT INTO users (email, username, referral_code) 
VALUES ('test@rscchain.com', 'testuser', 'TEST12345')
ON CONFLICT (email) DO NOTHING;

-- ===== COMENTARIOS DE DOCUMENTACIÓN =====
COMMENT ON TABLE users IS 'Tabla principal de usuarios con sistema de referidos';
COMMENT ON TABLE referrals IS 'Relaciones de referidos y comisiones';
COMMENT ON TABLE mining_sessions IS 'Sesiones de minería de usuarios';
COMMENT ON TABLE transactions IS 'Historial de transacciones de usuarios';
COMMENT ON TABLE referral_codes IS 'Códigos de invitación únicos';

COMMENT ON FUNCTION generate_referral_code() IS 'Genera código de referral único de 8 caracteres';
COMMENT ON FUNCTION process_referral_commission(UUID, DECIMAL) IS 'Procesa comisión del 10% para referrers';
COMMENT ON FUNCTION register_user(VARCHAR, VARCHAR, VARCHAR) IS 'Registra nuevo usuario con sistema de referidos';
COMMENT ON FUNCTION update_user_balance(UUID, DECIMAL, VARCHAR, TEXT) IS 'Actualiza balance de usuario con comisiones automáticas';

-- ===== VERIFICAR QUE TODO FUNCIONA =====
-- Verificar que las funciones se crearon correctamente
SELECT 
    routine_name,
    routine_type,
    data_type as return_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('register_user', 'update_user_balance', 'process_referral_commission', 'generate_referral_code')
ORDER BY routine_name;

-- Verificar que las tablas se crearon correctamente
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'referrals', 'mining_sessions', 'transactions', 'referral_codes')
ORDER BY table_name;
