-- ===== RSC REVOLUTIONARY MINING SYSTEM SCHEMA =====
-- Sistema de minería revolucionario con algoritmos únicos
-- Base de datos optimizada para rendimiento y escalabilidad

-- Extensión para UUID y funciones avanzadas
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ===== TABLA DE USUARIOS MEJORADA =====
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    balance DECIMAL(20, 8) DEFAULT 0.00000000,
    total_mined DECIMAL(20, 8) DEFAULT 0.00000000,
    mining_power DECIMAL(10, 2) DEFAULT 1.00,
    mining_level INTEGER DEFAULT 1,
    experience_points BIGINT DEFAULT 0,
    referral_code VARCHAR(12) UNIQUE NOT NULL,
    referred_by UUID REFERENCES users(id),
    total_referrals INTEGER DEFAULT 0,
    last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    is_premium BOOLEAN DEFAULT false,
    device_fingerprint VARCHAR(64),
    security_level INTEGER DEFAULT 1
);

-- ===== TABLA DE SESIONES DE MINERÍA REVOLUCIONARIA =====
CREATE TABLE IF NOT EXISTS mining_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    session_token VARCHAR(64) UNIQUE NOT NULL,
    algorithm_type VARCHAR(20) DEFAULT 'quantum', -- quantum, neural, hybrid, adaptive
    mining_power_multiplier DECIMAL(5, 2) DEFAULT 1.00,
    efficiency_boost DECIMAL(5, 2) DEFAULT 0.00,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE,
    duration_seconds BIGINT DEFAULT 0,
    tokens_mined DECIMAL(20, 8) DEFAULT 0.00000000,
    hash_rate DECIMAL(15, 2) DEFAULT 0.00,
    peak_hash_rate DECIMAL(15, 2) DEFAULT 0.00,
    average_efficiency DECIMAL(5, 2) DEFAULT 100.00,
    status VARCHAR(20) DEFAULT 'active', -- active, paused, completed, expired, error
    energy_consumed DECIMAL(10, 4) DEFAULT 0.0000,
    carbon_footprint DECIMAL(10, 6) DEFAULT 0.000000,
    difficulty_level INTEGER DEFAULT 1,
    bonus_multiplier DECIMAL(5, 2) DEFAULT 1.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===== TABLA DE ALGORITMOS DE MINERÍA =====
CREATE TABLE IF NOT EXISTS mining_algorithms (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    type VARCHAR(20) NOT NULL, -- quantum, neural, hybrid, adaptive
    base_efficiency DECIMAL(5, 2) NOT NULL,
    power_consumption DECIMAL(5, 2) NOT NULL,
    unlock_level INTEGER NOT NULL,
    unlock_cost DECIMAL(20, 8) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===== TABLA DE EQUIPOS DE MINERÍA =====
CREATE TABLE IF NOT EXISTS mining_equipment (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    equipment_type VARCHAR(30) NOT NULL, -- gpu, cpu, quantum, neural, hybrid
    equipment_name VARCHAR(100) NOT NULL,
    power_level DECIMAL(5, 2) NOT NULL,
    efficiency_boost DECIMAL(5, 2) NOT NULL,
    energy_consumption DECIMAL(5, 2) NOT NULL,
    durability INTEGER DEFAULT 100,
    max_durability INTEGER DEFAULT 100,
    is_active BOOLEAN DEFAULT true,
    purchased_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_maintenance TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===== TABLA DE TRANSACCIONES AVANZADA =====
CREATE TABLE IF NOT EXISTS transactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    type VARCHAR(30) NOT NULL, -- mining, referral_commission, bonus, purchase, sale, transfer
    amount DECIMAL(20, 8) NOT NULL,
    balance_before DECIMAL(20, 8) NOT NULL,
    balance_after DECIMAL(20, 8) NOT NULL,
    reference_id UUID, -- ID de sesión, referral, o transacción relacionada
    reference_type VARCHAR(30), -- mining_session, referral, equipment, bonus
    description TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===== TABLA DE REFERRALS MEJORADA =====
CREATE TABLE IF NOT EXISTS referrals (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    referrer_id UUID NOT NULL REFERENCES users(id),
    referred_id UUID NOT NULL REFERENCES users(id),
    commission_rate DECIMAL(5, 4) DEFAULT 0.1000, -- 10%
    total_commission DECIMAL(20, 8) DEFAULT 0.00000000,
    level INTEGER DEFAULT 1, -- Nivel de referral (1-5)
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(referrer_id, referred_id)
);

-- ===== TABLA DE BONUS Y RECOMPENSAS =====
CREATE TABLE IF NOT EXISTS bonuses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    bonus_type VARCHAR(30) NOT NULL, -- daily, weekly, monthly, achievement, referral, mining
    amount DECIMAL(20, 8) NOT NULL,
    multiplier DECIMAL(5, 2) DEFAULT 1.00,
    reason TEXT,
    reference_id UUID,
    expires_at TIMESTAMP WITH TIME ZONE,
    is_claimed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===== TABLA DE LOGROS =====
CREATE TABLE IF NOT EXISTS achievements (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    achievement_type VARCHAR(50) NOT NULL,
    achievement_name VARCHAR(100) NOT NULL,
    description TEXT,
    reward_amount DECIMAL(20, 8) DEFAULT 0.00000000,
    unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_claimed BOOLEAN DEFAULT false
);

-- ===== TABLA DE CONFIGURACIÓN DEL SISTEMA =====
CREATE TABLE IF NOT EXISTS system_config (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    config_key VARCHAR(100) UNIQUE NOT NULL,
    config_value JSONB NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===== TABLA DE MÉTRICAS EN TIEMPO REAL =====
CREATE TABLE IF NOT EXISTS real_time_metrics (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    metric_type VARCHAR(50) NOT NULL,
    metric_value DECIMAL(20, 8) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'
);

-- ===== TABLA DE SEGURIDAD Y AUDITORÍA =====
CREATE TABLE IF NOT EXISTS security_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    action VARCHAR(50) NOT NULL,
    ip_address INET,
    user_agent TEXT,
    device_fingerprint VARCHAR(64),
    risk_score INTEGER DEFAULT 0,
    details JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===== ÍNDICES PARA OPTIMIZACIÓN EXTREMA =====
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_referral_code ON users(referral_code);
CREATE INDEX IF NOT EXISTS idx_users_referred_by ON users(referred_by);
CREATE INDEX IF NOT EXISTS idx_users_last_active ON users(last_active);
CREATE INDEX IF NOT EXISTS idx_users_mining_level ON users(mining_level);

CREATE INDEX IF NOT EXISTS idx_mining_sessions_user_id ON mining_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_mining_sessions_session_token ON mining_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_mining_sessions_status ON mining_sessions(status);
CREATE INDEX IF NOT EXISTS idx_mining_sessions_start_time ON mining_sessions(start_time);
CREATE INDEX IF NOT EXISTS idx_mining_sessions_algorithm ON mining_sessions(algorithm_type);

CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_transactions_reference ON transactions(reference_id, reference_type);

CREATE INDEX IF NOT EXISTS idx_referrals_referrer_id ON referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred_id ON referrals(referred_id);
CREATE INDEX IF NOT EXISTS idx_referrals_level ON referrals(level);

CREATE INDEX IF NOT EXISTS idx_bonuses_user_id ON bonuses(user_id);
CREATE INDEX IF NOT EXISTS idx_bonuses_type ON bonuses(bonus_type);
CREATE INDEX IF NOT EXISTS idx_bonuses_expires ON bonuses(expires_at);

CREATE INDEX IF NOT EXISTS idx_achievements_user_id ON achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_achievements_type ON achievements(achievement_type);

CREATE INDEX IF NOT EXISTS idx_metrics_user_id ON real_time_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_metrics_type ON real_time_metrics(metric_type);
CREATE INDEX IF NOT EXISTS idx_metrics_timestamp ON real_time_metrics(timestamp);

CREATE INDEX IF NOT EXISTS idx_security_user_id ON security_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_security_action ON security_logs(action);
CREATE INDEX IF NOT EXISTS idx_security_created_at ON security_logs(created_at);

-- ===== FUNCIONES DE TRIGGER AVANZADAS =====

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mining_sessions_updated_at BEFORE UPDATE ON mining_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===== FUNCIONES REVOLUCIONARIAS =====

-- Función para generar código de referral único
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS VARCHAR(12) AS $$
DECLARE
    code VARCHAR(12);
    exists_count INTEGER;
BEGIN
    LOOP
        -- Generar código de 12 caracteres alfanuméricos
        code := UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 12));
        
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

-- Función para calcular poder de minería
CREATE OR REPLACE FUNCTION calculate_mining_power(
    p_user_id UUID,
    p_algorithm_type VARCHAR(20) DEFAULT 'quantum'
)
RETURNS DECIMAL(10, 2) AS $$
DECLARE
    v_base_power DECIMAL(10, 2);
    v_level_multiplier DECIMAL(5, 2);
    v_equipment_boost DECIMAL(5, 2);
    v_algorithm_multiplier DECIMAL(5, 2);
    v_final_power DECIMAL(10, 2);
BEGIN
    -- Obtener poder base del usuario
    SELECT mining_power INTO v_base_power FROM users WHERE id = p_user_id;
    
    -- Calcular multiplicador por nivel
    SELECT mining_level INTO v_level_multiplier FROM users WHERE id = p_user_id;
    v_level_multiplier := 1.0 + (v_level_multiplier - 1) * 0.1;
    
    -- Calcular boost de equipos
    SELECT COALESCE(SUM(power_level), 0) INTO v_equipment_boost 
    FROM mining_equipment 
    WHERE user_id = p_user_id AND is_active = true;
    
    -- Calcular multiplicador del algoritmo
    SELECT base_efficiency / 100.0 INTO v_algorithm_multiplier 
    FROM mining_algorithms 
    WHERE name = p_algorithm_type AND is_active = true;
    
    -- Calcular poder final
    v_final_power := v_base_power * v_level_multiplier * (1.0 + v_equipment_boost) * COALESCE(v_algorithm_multiplier, 1.0);
    
    RETURN v_final_power;
END;
$$ LANGUAGE plpgsql;

-- Función para procesar comisión de referral mejorada
CREATE OR REPLACE FUNCTION process_referral_commission(
    p_referred_user_id UUID,
    p_mining_amount DECIMAL(20, 8),
    p_commission_level INTEGER DEFAULT 1
)
RETURNS DECIMAL(20, 8) AS $$
DECLARE
    v_referrer_id UUID;
    v_commission_rate DECIMAL(5, 4);
    v_commission_amount DECIMAL(20, 8);
    v_referrer_balance DECIMAL(20, 8);
    v_level_bonus DECIMAL(5, 4);
BEGIN
    -- Obtener el referrer del usuario
    SELECT referred_by INTO v_referrer_id 
    FROM users 
    WHERE id = p_referred_user_id;
    
    -- Si no tiene referrer, no hay comisión
    IF v_referrer_id IS NULL THEN
        RETURN 0;
    END IF;
    
    -- Obtener la tasa de comisión base
    SELECT commission_rate INTO v_commission_rate 
    FROM referrals 
    WHERE referrer_id = v_referrer_id AND referred_id = p_referred_user_id;
    
    -- Calcular bonus por nivel de referral
    v_level_bonus := 1.0 + (p_commission_level - 1) * 0.05; -- 5% extra por nivel
    
    -- Calcular comisión total
    v_commission_amount := p_mining_amount * COALESCE(v_commission_rate, 0.1000) * v_level_bonus;
    
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
        reference_id, reference_type, description, metadata
    ) VALUES (
        v_referrer_id, 'referral_commission', v_commission_amount, 
        v_referrer_balance, v_referrer_balance + v_commission_amount,
        p_referred_user_id, 'referral', 
        'Commission from referred user mining (Level ' || p_commission_level || ')',
        jsonb_build_object('level', p_commission_level, 'referred_user', p_referred_user_id)
    );
    
    RETURN v_commission_amount;
END;
$$ LANGUAGE plpgsql;

-- Función para registrar usuario con sistema mejorado
CREATE OR REPLACE FUNCTION register_user_advanced(
    p_email VARCHAR(255),
    p_username VARCHAR(50),
    p_password_hash VARCHAR(255),
    p_referral_code VARCHAR(12) DEFAULT NULL,
    p_device_fingerprint VARCHAR(64) DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    v_user_id UUID;
    v_referrer_id UUID;
    v_new_referral_code VARCHAR(12);
    v_result JSON;
BEGIN
    -- Generar código de referral único
    v_new_referral_code := generate_referral_code();
    
    -- Verificar si hay código de referral
    IF p_referral_code IS NOT NULL THEN
        SELECT id INTO v_referrer_id 
        FROM users 
        WHERE referral_code = p_referral_code AND is_active = true;
    END IF;
    
    -- Insertar usuario
    INSERT INTO users (email, username, password_hash, referral_code, referred_by, device_fingerprint)
    VALUES (p_email, p_username, p_password_hash, v_new_referral_code, v_referrer_id, p_device_fingerprint)
    RETURNING id INTO v_user_id;
    
    -- Si tiene referrer, crear relación de referral
    IF v_referrer_id IS NOT NULL THEN
        INSERT INTO referrals (referrer_id, referred_id, level)
        VALUES (v_referrer_id, v_user_id, 1);
        
        -- Actualizar contador de referrers
        UPDATE users 
        SET total_referrals = total_referrals + 1 
        WHERE id = v_referrer_id;
    END IF;
    
    -- Preparar resultado
    v_result := json_build_object(
        'success', true,
        'user_id', v_user_id,
        'referral_code', v_new_referral_code,
        'referred_by', v_referrer_id,
        'mining_power', 1.00,
        'mining_level', 1
    );
    
    RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- Función para actualizar balance con sistema avanzado
CREATE OR REPLACE FUNCTION update_user_balance_advanced(
    p_user_id UUID,
    p_amount DECIMAL(20, 8),
    p_transaction_type VARCHAR(30),
    p_description TEXT DEFAULT NULL,
    p_metadata JSONB DEFAULT '{}'
)
RETURNS JSON AS $$
DECLARE
    v_balance_before DECIMAL(20, 8);
    v_balance_after DECIMAL(20, 8);
    v_commission_amount DECIMAL(20, 8);
    v_result JSON;
BEGIN
    -- Obtener balance actual
    SELECT balance INTO v_balance_before 
    FROM users 
    WHERE id = p_user_id;
    
    -- Calcular nuevo balance
    v_balance_after := v_balance_before + p_amount;
    
    -- Actualizar balance
    UPDATE users 
    SET balance = v_balance_after,
        updated_at = NOW(),
        last_active = NOW()
    WHERE id = p_user_id;
    
    -- Si es mining, actualizar total_mined
    IF p_transaction_type = 'mining' AND p_amount > 0 THEN
        UPDATE users 
        SET total_mined = total_mined + p_amount
        WHERE id = p_user_id;
    END IF;
    
    -- Registrar transacción
    INSERT INTO transactions (
        user_id, type, amount, balance_before, balance_after, 
        description, metadata
    ) VALUES (
        p_user_id, p_transaction_type, p_amount, 
        v_balance_before, v_balance_after, p_description, p_metadata
    );
    
    -- Si es mining, procesar comisión de referral
    IF p_transaction_type = 'mining' AND p_amount > 0 THEN
        v_commission_amount := process_referral_commission(p_user_id, p_amount, 1);
    END IF;
    
    -- Preparar resultado
    v_result := json_build_object(
        'success', true,
        'balance_before', v_balance_before,
        'balance_after', v_balance_after,
        'commission_paid', COALESCE(v_commission_amount, 0),
        'transaction_id', (SELECT id FROM transactions WHERE user_id = p_user_id ORDER BY created_at DESC LIMIT 1)
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
ALTER TABLE bonuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE mining_equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_logs ENABLE ROW LEVEL SECURITY;

-- Políticas para usuarios
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

-- Políticas para equipos
CREATE POLICY "Users can manage own equipment" ON mining_equipment
    FOR ALL USING (auth.uid() = user_id);

-- ===== DATOS INICIALES =====

-- Insertar algoritmos de minería
INSERT INTO mining_algorithms (name, type, base_efficiency, power_consumption, unlock_level, unlock_cost, description) VALUES
('Quantum Core', 'quantum', 150.00, 0.8, 1, 0.00000000, 'Algoritmo cuántico de última generación'),
('Neural Network', 'neural', 120.00, 0.6, 5, 10.00000000, 'Red neuronal adaptativa'),
('Hybrid Fusion', 'hybrid', 180.00, 1.2, 10, 50.00000000, 'Combinación cuántica-neural'),
('Adaptive Matrix', 'adaptive', 200.00, 1.5, 15, 100.00000000, 'Algoritmo auto-adaptativo');

-- Insertar configuración del sistema
INSERT INTO system_config (config_key, config_value, description) VALUES
('mining_base_rate', '{"value": 0.001, "unit": "RSC per second"}', 'Tasa base de minería'),
('mining_difficulty', '{"base": 1, "multiplier": 1.1, "max": 1000}', 'Configuración de dificultad'),
('referral_commission', '{"base_rate": 0.1, "level_bonus": 0.05, "max_levels": 5}', 'Sistema de comisiones'),
('energy_efficiency', '{"base_consumption": 1.0, "optimization": 0.1}', 'Configuración de energía'),
('security_settings', '{"max_sessions": 3, "session_timeout": 3600, "risk_threshold": 80}', 'Configuración de seguridad');

-- ===== COMENTARIOS DE DOCUMENTACIÓN =====
COMMENT ON TABLE users IS 'Tabla principal de usuarios con sistema de niveles y poder de minería';
COMMENT ON TABLE mining_sessions IS 'Sesiones de minería con algoritmos avanzados y métricas detalladas';
COMMENT ON TABLE mining_algorithms IS 'Algoritmos de minería disponibles con diferentes características';
COMMENT ON TABLE mining_equipment IS 'Equipos de minería que los usuarios pueden comprar y usar';
COMMENT ON TABLE transactions IS 'Historial completo de transacciones con metadatos';
COMMENT ON TABLE referrals IS 'Sistema de referidos con niveles y comisiones escalonadas';
COMMENT ON TABLE bonuses IS 'Sistema de bonificaciones y recompensas';
COMMENT ON TABLE achievements IS 'Sistema de logros y recompensas por logros';
COMMENT ON TABLE system_config IS 'Configuración dinámica del sistema';
COMMENT ON TABLE real_time_metrics IS 'Métricas en tiempo real para análisis';
COMMENT ON TABLE security_logs IS 'Logs de seguridad y auditoría';

COMMENT ON FUNCTION calculate_mining_power(UUID, VARCHAR) IS 'Calcula el poder de minería basado en nivel, equipos y algoritmo';
COMMENT ON FUNCTION process_referral_commission(UUID, DECIMAL, INTEGER) IS 'Procesa comisiones de referidos con sistema de niveles';
COMMENT ON FUNCTION register_user_advanced(VARCHAR, VARCHAR, VARCHAR, VARCHAR, VARCHAR) IS 'Registra usuario con sistema avanzado de seguridad';
COMMENT ON FUNCTION update_user_balance_advanced(UUID, DECIMAL, VARCHAR, TEXT, JSONB) IS 'Actualiza balance con sistema completo de transacciones';
