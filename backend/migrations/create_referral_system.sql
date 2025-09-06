-- 🎯 RSC REFERRAL SYSTEM - DATABASE SCHEMA
-- Esquema de base de datos para el sistema de referidos

-- Tabla de códigos de referido
CREATE TABLE IF NOT EXISTS referral_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES mining_users(id) ON DELETE CASCADE,
    code VARCHAR(100) UNIQUE NOT NULL,
    platform VARCHAR(50) DEFAULT 'web_mining',
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'expired')),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    usage_count INTEGER DEFAULT 0,
    max_usage INTEGER DEFAULT 1000,
    last_used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de referidos
CREATE TABLE IF NOT EXISTS referrals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referrer_user_id UUID NOT NULL REFERENCES mining_users(id) ON DELETE CASCADE,
    referred_user_id UUID NOT NULL REFERENCES mining_users(id) ON DELETE CASCADE,
    referral_code VARCHAR(100) NOT NULL REFERENCES referral_codes(code),
    bonus_rate DECIMAL(5,4) DEFAULT 0.1000, -- 10%
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'cancelled')),
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Evitar auto-referencias
    CONSTRAINT no_self_referral CHECK (referrer_user_id != referred_user_id),
    
    -- Un usuario solo puede tener un referidor activo
    UNIQUE(referred_user_id, status) DEFERRABLE INITIALLY DEFERRED
);

-- Tabla de estadísticas de referidos
CREATE TABLE IF NOT EXISTS referral_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES mining_users(id) ON DELETE CASCADE,
    total_referrals INTEGER DEFAULT 0,
    active_referrals INTEGER DEFAULT 0,
    total_earnings DECIMAL(20,8) DEFAULT 0.00000000,
    last_calculation TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de ganancias por referidos
CREATE TABLE IF NOT EXISTS referral_earnings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referrer_user_id UUID NOT NULL REFERENCES mining_users(id) ON DELETE CASCADE,
    referred_user_id UUID NOT NULL REFERENCES mining_users(id) ON DELETE CASCADE,
    referral_id UUID NOT NULL REFERENCES referrals(id) ON DELETE CASCADE,
    amount DECIMAL(20,8) NOT NULL,
    bonus_rate DECIMAL(5,4) NOT NULL,
    source_transaction_id UUID, -- Referencia a la transacción que generó la ganancia
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    paid_at TIMESTAMP WITH TIME ZONE
);

-- Tabla de ganancias totales por referidor
CREATE TABLE IF NOT EXISTS referral_total_earnings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referrer_user_id UUID UNIQUE NOT NULL REFERENCES mining_users(id) ON DELETE CASCADE,
    total_earned DECIMAL(20,8) DEFAULT 0.00000000,
    total_paid DECIMAL(20,8) DEFAULT 0.00000000,
    pending_amount DECIMAL(20,8) DEFAULT 0.00000000,
    last_calculation TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de auditoría para referidos
CREATE TABLE IF NOT EXISTS referral_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES mining_users(id) ON DELETE SET NULL,
    action VARCHAR(50) NOT NULL,
    referral_code VARCHAR(100),
    referrer_user_id UUID REFERENCES mining_users(id) ON DELETE SET NULL,
    referred_user_id UUID REFERENCES mining_users(id) ON DELETE SET NULL,
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_referral_codes_user_id ON referral_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_referral_codes_code ON referral_codes(code);
CREATE INDEX IF NOT EXISTS idx_referral_codes_status ON referral_codes(status);
CREATE INDEX IF NOT EXISTS idx_referral_codes_expires_at ON referral_codes(expires_at);

CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals(referrer_user_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred ON referrals(referred_user_id);
CREATE INDEX IF NOT EXISTS idx_referrals_code ON referrals(referral_code);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON referrals(status);

CREATE INDEX IF NOT EXISTS idx_referral_earnings_referrer ON referral_earnings(referrer_user_id);
CREATE INDEX IF NOT EXISTS idx_referral_earnings_referred ON referral_earnings(referred_user_id);
CREATE INDEX IF NOT EXISTS idx_referral_earnings_status ON referral_earnings(status);
CREATE INDEX IF NOT EXISTS idx_referral_earnings_created_at ON referral_earnings(created_at);

CREATE INDEX IF NOT EXISTS idx_referral_audit_user_id ON referral_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_referral_audit_action ON referral_audit_log(action);
CREATE INDEX IF NOT EXISTS idx_referral_audit_created_at ON referral_audit_log(created_at);

-- Triggers para actualizar timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_referral_codes_updated_at 
    BEFORE UPDATE ON referral_codes 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_referrals_updated_at 
    BEFORE UPDATE ON referrals 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_referral_stats_updated_at 
    BEFORE UPDATE ON referral_stats 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_referral_total_earnings_updated_at 
    BEFORE UPDATE ON referral_total_earnings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Función para calcular ganancias de referidos
CREATE OR REPLACE FUNCTION calculate_referral_earnings(p_referrer_user_id UUID)
RETURNS DECIMAL(20,8) AS $$
DECLARE
    total_earnings DECIMAL(20,8) := 0;
    referral_record RECORD;
    user_earnings DECIMAL(20,8);
BEGIN
    -- Obtener todos los referidos activos del usuario
    FOR referral_record IN 
        SELECT r.*, rc.bonus_rate 
        FROM referrals r
        JOIN referral_codes rc ON r.referral_code = rc.code
        WHERE r.referrer_user_id = p_referrer_user_id 
        AND r.status = 'active'
    LOOP
        -- Obtener ganancias totales del usuario referido
        SELECT COALESCE(SUM(tokens_amount), 0) INTO user_earnings
        FROM mining_transactions 
        WHERE user_id = referral_record.referred_user_id 
        AND transaction_type = 'mining_reward'
        AND status = 'confirmed';
        
        -- Calcular ganancia del referidor (10% por defecto)
        total_earnings := total_earnings + (user_earnings * referral_record.bonus_rate);
    END LOOP;
    
    RETURN total_earnings;
END;
$$ LANGUAGE plpgsql;

-- Función para procesar ganancias de referidos automáticamente
CREATE OR REPLACE FUNCTION process_referral_earnings()
RETURNS VOID AS $$
DECLARE
    referral_record RECORD;
    user_earnings DECIMAL(20,8);
    bonus_amount DECIMAL(20,8);
BEGIN
    -- Procesar ganancias para todos los referidos activos
    FOR referral_record IN 
        SELECT r.*, rc.bonus_rate 
        FROM referrals r
        JOIN referral_codes rc ON r.referral_code = rc.code
        WHERE r.status = 'active'
    LOOP
        -- Obtener ganancias del usuario referido desde la última actualización
        SELECT COALESCE(SUM(tokens_amount), 0) INTO user_earnings
        FROM mining_transactions 
        WHERE user_id = referral_record.referred_user_id 
        AND transaction_type = 'mining_reward'
        AND status = 'confirmed'
        AND created_at > COALESCE(
            (SELECT last_calculation FROM referral_total_earnings 
             WHERE referrer_user_id = referral_record.referrer_user_id), 
            '1970-01-01'::timestamp
        );
        
        IF user_earnings > 0 THEN
            -- Calcular bonus del referidor
            bonus_amount := user_earnings * referral_record.bonus_rate;
            
            -- Registrar ganancia del referidor
            INSERT INTO referral_earnings (
                referrer_user_id, 
                referred_user_id, 
                referral_id, 
                amount, 
                bonus_rate,
                status
            ) VALUES (
                referral_record.referrer_user_id,
                referral_record.referred_user_id,
                referral_record.id,
                bonus_amount,
                referral_record.bonus_rate,
                'pending'
            );
            
            -- Actualizar totales del referidor
            INSERT INTO referral_total_earnings (
                referrer_user_id, 
                total_earned, 
                pending_amount,
                last_calculation
            ) VALUES (
                referral_record.referrer_user_id,
                bonus_amount,
                bonus_amount,
                NOW()
            )
            ON CONFLICT (referrer_user_id) 
            DO UPDATE SET 
                total_earned = referral_total_earnings.total_earned + bonus_amount,
                pending_amount = referral_total_earnings.pending_amount + bonus_amount,
                last_calculation = NOW(),
                updated_at = NOW();
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Vista para estadísticas de referidos
CREATE OR REPLACE VIEW referral_statistics AS
SELECT 
    rte.referrer_user_id,
    mu.username as referrer_username,
    rte.total_earned,
    rte.total_paid,
    rte.pending_amount,
    COUNT(r.id) as total_referrals,
    COUNT(CASE WHEN r.status = 'active' THEN 1 END) as active_referrals,
    rte.last_calculation
FROM referral_total_earnings rte
JOIN mining_users mu ON rte.referrer_user_id = mu.id
LEFT JOIN referrals r ON rte.referrer_user_id = r.referrer_user_id
GROUP BY rte.referrer_user_id, mu.username, rte.total_earned, rte.total_paid, rte.pending_amount, rte.last_calculation;

-- Comentarios en las tablas
COMMENT ON TABLE referral_codes IS 'Códigos únicos de referido generados por usuarios';
COMMENT ON TABLE referrals IS 'Relaciones de referidos entre usuarios';
COMMENT ON TABLE referral_stats IS 'Estadísticas de referidos por usuario';
COMMENT ON TABLE referral_earnings IS 'Ganancias individuales por referidos';
COMMENT ON TABLE referral_total_earnings IS 'Totales de ganancias por referidor';
COMMENT ON TABLE referral_audit_log IS 'Log de auditoría para acciones de referidos';
