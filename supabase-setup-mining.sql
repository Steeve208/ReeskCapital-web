-- RSC Chain Mining Platform - Supabase Setup
-- Este archivo configura la base de datos para la plataforma de minería simulada

-- Crear tabla para balances de usuarios
CREATE TABLE IF NOT EXISTS users_balances (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    balance DECIMAL(20, 8) DEFAULT 0.0 NOT NULL,
    last_mine_at TIMESTAMP WITH TIME ZONE,
    total_mined DECIMAL(20, 8) DEFAULT 0.0 NOT NULL,
    total_mining_time INTEGER DEFAULT 0 NOT NULL, -- en minutos
    sessions_today INTEGER DEFAULT 0 NOT NULL,
    daily_limit_used DECIMAL(20, 8) DEFAULT 0.0 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Crear tabla para historial de minería
CREATE TABLE IF NOT EXISTS mining_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_email VARCHAR(255) NOT NULL,
    session_start TIMESTAMP WITH TIME ZONE NOT NULL,
    session_end TIMESTAMP WITH TIME ZONE,
    tokens_earned DECIMAL(20, 8) NOT NULL,
    session_duration INTEGER NOT NULL, -- en minutos
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    
    FOREIGN KEY (user_email) REFERENCES users_balances(email) ON DELETE CASCADE
);

-- Crear tabla para estadísticas del sistema
CREATE TABLE IF NOT EXISTS system_stats (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    total_users INTEGER DEFAULT 0 NOT NULL,
    total_tokens_mined DECIMAL(20, 8) DEFAULT 0.0 NOT NULL,
    active_miners INTEGER DEFAULT 0 NOT NULL,
    daily_total_mined DECIMAL(20, 8) DEFAULT 0.0 NOT NULL,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Crear índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_users_balances_email ON users_balances(email);
CREATE INDEX IF NOT EXISTS idx_mining_history_user_email ON mining_history(user_email);
CREATE INDEX IF NOT EXISTS idx_mining_history_created_at ON mining_history(created_at);

-- Crear función para actualizar timestamp de updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Crear trigger para actualizar updated_at automáticamente
CREATE TRIGGER update_users_balances_updated_at 
    BEFORE UPDATE ON users_balances 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Crear función para resetear límites diarios
CREATE OR REPLACE FUNCTION reset_daily_limits()
RETURNS void AS $$
BEGIN
    UPDATE users_balances 
    SET 
        sessions_today = 0,
        daily_limit_used = 0.0,
        updated_at = NOW()
    WHERE DATE(updated_at) < CURRENT_DATE;
END;
$$ language 'plpgsql';

-- Crear función para obtener estadísticas del sistema
CREATE OR REPLACE FUNCTION get_system_stats()
RETURNS TABLE(
    total_users BIGINT,
    total_tokens_mined DECIMAL(20, 8),
    active_miners BIGINT,
    daily_total_mined DECIMAL(20, 8)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::BIGINT as total_users,
        COALESCE(SUM(balance), 0.0) as total_tokens_mined,
        COUNT(CASE WHEN last_mine_at > NOW() - INTERVAL '1 hour' THEN 1 END)::BIGINT as active_miners,
        COALESCE(SUM(daily_limit_used), 0.0) as daily_total_mined
    FROM users_balances;
END;
$$ language 'plpgsql';

-- Crear función para procesar recompensa de minería
CREATE OR REPLACE FUNCTION process_mining_reward(
    p_user_email VARCHAR(255),
    p_tokens_earned DECIMAL(20, 8),
    p_session_duration INTEGER
)
RETURNS BOOLEAN AS $$
DECLARE
    v_current_balance DECIMAL(20, 8);
    v_daily_limit_used DECIMAL(20, 8);
    v_max_daily_limit DECIMAL(20, 8) := 2.0; -- 2 RSC máximo por día
BEGIN
    -- Obtener balance actual y límite diario usado
    SELECT balance, daily_limit_used 
    INTO v_current_balance, v_daily_limit_used
    FROM users_balances 
    WHERE email = p_user_email;
    
    -- Verificar si existe el usuario
    IF v_current_balance IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Verificar límite diario
    IF v_daily_limit_used + p_tokens_earned > v_max_daily_limit THEN
        -- Ajustar tokens ganados al límite disponible
        p_tokens_earned := GREATEST(0, v_max_daily_limit - v_daily_limit_used);
        
        IF p_tokens_earned <= 0 THEN
            RETURN FALSE; -- Límite diario alcanzado
        END IF;
    END IF;
    
    -- Actualizar balance y estadísticas
    UPDATE users_balances 
    SET 
        balance = balance + p_tokens_earned,
        total_mined = total_mined + p_tokens_earned,
        total_mining_time = total_mining_time + p_session_duration,
        daily_limit_used = daily_limit_used + p_tokens_earned,
        sessions_today = sessions_today + 1,
        last_mine_at = NOW(),
        updated_at = NOW()
    WHERE email = p_user_email;
    
    -- Registrar en historial
    INSERT INTO mining_history (
        user_email, 
        session_start, 
        session_end, 
        tokens_earned, 
        session_duration
    ) VALUES (
        p_user_email,
        NOW() - (p_session_duration || ' minutes')::INTERVAL,
        NOW(),
        p_tokens_earned,
        p_session_duration
    );
    
    RETURN TRUE;
END;
$$ language 'plpgsql';

-- Crear función para obtener ranking de usuarios
CREATE OR REPLACE FUNCTION get_user_ranking()
RETURNS TABLE(
    rank BIGINT,
    email VARCHAR(255),
    total_mined DECIMAL(20, 8),
    total_mining_time INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ROW_NUMBER() OVER (ORDER BY total_mined DESC, total_mining_time DESC) as rank,
        email,
        total_mined,
        total_mining_time
    FROM users_balances
    ORDER BY total_mined DESC, total_mining_time DESC;
END;
$$ language 'plpgsql';

-- Insertar datos iniciales del sistema
INSERT INTO system_stats (total_users, total_tokens_mined, active_miners, daily_total_mined)
VALUES (0, 0.0, 0, 0.0)
ON CONFLICT DO NOTHING;

-- Crear políticas de seguridad RLS (Row Level Security)
ALTER TABLE users_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE mining_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_stats ENABLE ROW LEVEL SECURITY;

-- Política para users_balances: usuarios solo pueden ver/modificar sus propios datos
CREATE POLICY "Users can view own balance" ON users_balances
    FOR SELECT USING (auth.jwt() ->> 'email' = email);

CREATE POLICY "Users can update own balance" ON users_balances
    FOR UPDATE USING (auth.jwt() ->> 'email' = email);

CREATE POLICY "Users can insert own balance" ON users_balances
    FOR INSERT WITH CHECK (auth.jwt() ->> 'email' = email);

-- Política para mining_history: usuarios solo pueden ver su propio historial
CREATE POLICY "Users can view own mining history" ON mining_history
    FOR SELECT USING (auth.jwt() ->> 'email' = user_email);

CREATE POLICY "Users can insert own mining history" ON mining_history
    FOR INSERT WITH CHECK (auth.jwt() ->> 'email' = user_email);

-- Política para system_stats: todos pueden ver estadísticas del sistema
CREATE POLICY "Anyone can view system stats" ON system_stats
    FOR SELECT USING (true);

-- Crear vista para estadísticas públicas
CREATE OR REPLACE VIEW public_mining_stats AS
SELECT 
    COUNT(*) as total_users,
    COALESCE(SUM(balance), 0.0) as total_tokens_mined,
    COUNT(CASE WHEN last_mine_at > NOW() - INTERVAL '1 hour' THEN 1 END) as active_miners
FROM users_balances;

-- Comentarios de la base de datos
COMMENT ON TABLE users_balances IS 'Almacena balances y estadísticas de minería de usuarios';
COMMENT ON TABLE mining_history IS 'Historial de sesiones de minería de usuarios';
COMMENT ON TABLE system_stats IS 'Estadísticas generales del sistema de minería';
COMMENT ON FUNCTION process_mining_reward IS 'Procesa recompensas de minería con validaciones de límites';
COMMENT ON FUNCTION get_user_ranking IS 'Obtiene ranking de usuarios por tokens minados';

-- Crear job para resetear límites diarios (ejecutar cada día a las 00:00)
-- Nota: Esto requiere pg_cron extension en Supabase
-- SELECT cron.schedule('reset-daily-limits', '0 0 * * *', 'SELECT reset_daily_limits();');

-- Verificar que las tablas se crearon correctamente
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name IN ('users_balances', 'mining_history', 'system_stats')
ORDER BY table_name, ordinal_position;
