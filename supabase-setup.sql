-- RSC Chain Mining Platform - Setup de Base de Datos
-- Ejecuta este script en el SQL Editor de Supabase

-- 1. Crear tabla de usuarios y balances
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

-- 2. Crear tabla de historial de minería
CREATE TABLE IF NOT EXISTS mining_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_email VARCHAR(255) NOT NULL,
    session_start TIMESTAMP WITH TIME ZONE NOT NULL,
    session_end TIMESTAMP WITH TIME ZONE NOT NULL,
    tokens_earned DECIMAL(20, 8) NOT NULL,
    session_duration INTEGER NOT NULL, -- en minutos
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 3. Crear tabla de estadísticas del sistema
CREATE TABLE IF NOT EXISTS system_stats (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    total_users INTEGER DEFAULT 0 NOT NULL,
    total_tokens_mined DECIMAL(20, 8) DEFAULT 0.0 NOT NULL,
    active_miners INTEGER DEFAULT 0 NOT NULL,
    daily_total_mined DECIMAL(20, 8) DEFAULT 0.0 NOT NULL,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 4. Crear índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_users_balances_email ON users_balances(email);
CREATE INDEX IF NOT EXISTS idx_mining_history_user_email ON mining_history(user_email);
CREATE INDEX IF NOT EXISTS idx_mining_history_created_at ON mining_history(created_at);

-- 5. Crear función para procesar recompensas de minería
CREATE OR REPLACE FUNCTION process_mining_reward(
    user_email_param VARCHAR(255),
    tokens_earned_param DECIMAL(20, 8),
    session_duration_param INTEGER
)
RETURNS DECIMAL(20, 8)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    current_balance DECIMAL(20, 8);
    daily_limit_used DECIMAL(20, 8);
    max_daily_limit DECIMAL(20, 8) := 2.0; -- Límite diario de 2 RSC
    actual_tokens DECIMAL(20, 8);
BEGIN
    -- Obtener balance actual y límite diario usado
    SELECT balance, daily_limit_used INTO current_balance, daily_limit_used
    FROM users_balances 
    WHERE email = user_email_param;
    
    -- Verificar límite diario
    IF daily_limit_used >= max_daily_limit THEN
        RAISE EXCEPTION 'Límite diario alcanzado';
    END IF;
    
    -- Calcular tokens reales (respetando límite diario)
    actual_tokens := LEAST(tokens_earned_param, max_daily_limit - daily_limit_used);
    
    -- Actualizar balance del usuario
    UPDATE users_balances 
    SET 
        balance = balance + actual_tokens,
        total_mined = total_mined + actual_tokens,
        total_mining_time = total_mining_time + session_duration_param,
        daily_limit_used = daily_limit_used + actual_tokens,
        sessions_today = sessions_today + 1,
        last_mine_at = NOW(),
        updated_at = NOW()
    WHERE email = user_email_param;
    
    RETURN actual_tokens;
END;
$$;

-- 6. Crear función para obtener ranking de usuarios
CREATE OR REPLACE FUNCTION get_user_ranking(limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
    email VARCHAR(255),
    total_mined DECIMAL(20, 8),
    total_mining_time INTEGER,
    rank_position BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ub.email,
        ub.total_mined,
        ub.total_mining_time,
        ROW_NUMBER() OVER (ORDER BY ub.total_mined DESC) as rank_position
    FROM users_balances ub
    ORDER BY ub.total_mined DESC
    LIMIT limit_count;
END;
$$;

-- 7. Crear función para resetear límites diarios
CREATE OR REPLACE FUNCTION reset_daily_limits()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE users_balances 
    SET 
        sessions_today = 0,
        daily_limit_used = 0.0,
        updated_at = NOW();
END;
$$;

-- 8. Crear trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_balances_updated_at 
    BEFORE UPDATE ON users_balances 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 9. Insertar estadísticas iniciales del sistema
INSERT INTO system_stats (total_users, total_tokens_mined, active_miners, daily_total_mined)
VALUES (0, 0.0, 0, 0.0)
ON CONFLICT DO NOTHING;

-- 10. Configurar RLS (Row Level Security)
ALTER TABLE users_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE mining_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_stats ENABLE RLS;

-- 11. Crear políticas RLS para users_balances
CREATE POLICY "Users can view their own data" ON users_balances
    FOR SELECT USING (email = current_setting('request.jwt.claims', true)::json->>'email');

CREATE POLICY "Users can update their own data" ON users_balances
    FOR UPDATE USING (email = current_setting('request.jwt.claims', true)::json->>'email');

CREATE POLICY "Allow insert for new users" ON users_balances
    FOR INSERT WITH CHECK (true);

-- 12. Crear políticas RLS para mining_history
CREATE POLICY "Users can view their own mining history" ON mining_history
    FOR SELECT USING (user_email = current_setting('request.jwt.claims', true)::json->>'email');

CREATE POLICY "Users can insert their own mining sessions" ON mining_history
    FOR INSERT WITH CHECK (user_email = current_setting('request.jwt.claims', true)::json->>'email');

-- 13. Crear políticas RLS para system_stats
CREATE POLICY "Allow read access to system stats" ON system_stats
    FOR SELECT USING (true);

-- 14. Crear job para resetear límites diarios (ejecutar cada día a las 00:00)
-- Nota: Esto requiere pg_cron extension que puede no estar disponible en el plan gratuito
-- Como alternativa, puedes crear un cron job en tu servidor o usar la función manualmente

-- 15. Verificar que las tablas se crearon correctamente
SELECT 
    table_name, 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name IN ('users_balances', 'mining_history', 'system_stats')
ORDER BY table_name, ordinal_position;

-- ¡Listo! Tu base de datos está configurada para la plataforma de minería RSC
