-- RSC Chain Mining Platform - Sistema de Minería de 24 Horas
-- Ejecuta esto en el SQL Editor de Supabase

-- 1. Actualizar tabla users_balances para sesiones de 24h
ALTER TABLE users_balances 
ADD COLUMN IF NOT EXISTS current_session_start TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS current_session_duration INTEGER DEFAULT 0, -- en minutos
ADD COLUMN IF NOT EXISTS longest_session INTEGER DEFAULT 0, -- en minutos
ADD COLUMN IF NOT EXISTS total_sessions INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS consecutive_days INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_session_date DATE,
ADD COLUMN IF NOT EXISTS current_streak INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS best_streak INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS efficiency_rating DECIMAL(3,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS ranking_position INTEGER DEFAULT 999999;

-- 2. Crear tabla de logros del usuario
CREATE TABLE IF NOT EXISTS user_achievements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_email VARCHAR(255) NOT NULL,
    achievement_id VARCHAR(100) NOT NULL,
    achievement_name VARCHAR(255) NOT NULL,
    achievement_description TEXT,
    unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    bonus_tokens DECIMAL(20, 8) DEFAULT 0.0,
    icon VARCHAR(50),
    rarity VARCHAR(20) DEFAULT 'common'
);

-- 3. Crear tabla de sesiones de minería detallada
CREATE TABLE IF NOT EXISTS mining_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_email VARCHAR(255) NOT NULL,
    session_start TIMESTAMP WITH TIME ZONE NOT NULL,
    session_end TIMESTAMP WITH TIME ZONE,
    duration_minutes INTEGER DEFAULT 0,
    tokens_earned DECIMAL(20, 8) DEFAULT 0.0,
    base_tokens DECIMAL(20, 8) DEFAULT 0.0,
    bonus_tokens DECIMAL(20, 8) DEFAULT 0.0,
    milestone_bonus DECIMAL(20, 8) DEFAULT 0.0,
    efficiency_score DECIMAL(3,2) DEFAULT 0.00,
    session_state VARCHAR(50) DEFAULT 'active',
    milestones_reached TEXT[], -- Array de hitos alcanzados
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Crear tabla de hitos de sesión
CREATE TABLE IF NOT EXISTS session_milestones (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    milestone_name VARCHAR(100) NOT NULL,
    milestone_hours INTEGER NOT NULL,
    bonus_tokens DECIMAL(20, 8) NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    rarity VARCHAR(20) DEFAULT 'common'
);

-- 5. Insertar hitos predefinidos
INSERT INTO session_milestones (milestone_name, milestone_hours, bonus_tokens, description, icon, rarity) VALUES
('Primera Hora', 1, 50.0, 'Completa tu primera hora de minería', '🥉', 'common'),
('Minero Persistente', 4, 200.0, 'Mina durante 4 horas consecutivas', '🥈', 'uncommon'),
('Minero Dedicado', 8, 500.0, 'Alcanza 8 horas de minería continua', '🥇', 'rare'),
('Minero Experto', 12, 1000.0, 'Completa 12 horas de minería', '💎', 'epic'),
('Minero Maestro', 18, 2000.0, 'Alcanza 18 horas de minería', '🔥', 'legendary'),
('Minero Supremo', 24, 5000.0, 'Completa 24 horas de minería continua', '👑', 'mythic'),
('Minero Incansable', 48, 10000.0, 'Mina durante 48 horas sin parar', '⚡', 'divine')
ON CONFLICT DO NOTHING;

-- 6. Crear tabla de rankings globales
CREATE TABLE IF NOT EXISTS global_rankings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_email VARCHAR(255) NOT NULL,
    username VARCHAR(100),
    total_tokens_mined DECIMAL(20, 8) DEFAULT 0.0,
    total_mining_time INTEGER DEFAULT 0,
    longest_session INTEGER DEFAULT 0,
    best_streak INTEGER DEFAULT 0,
    efficiency_rating DECIMAL(3,2) DEFAULT 0.00,
    ranking_position INTEGER DEFAULT 999999,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Crear índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_mining_sessions_user_email ON mining_sessions(user_email);
CREATE INDEX IF NOT EXISTS idx_mining_sessions_created_at ON mining_sessions(created_at);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_email ON user_achievements(user_email);
CREATE INDEX IF NOT EXISTS idx_global_rankings_position ON global_rankings(ranking_position);
CREATE INDEX IF NOT EXISTS idx_users_balances_ranking ON users_balances(ranking_position);

-- 8. Crear función para calcular recompensas de 24h
CREATE OR REPLACE FUNCTION calculate_24h_mining_rewards(
    session_minutes INTEGER,
    user_email_param VARCHAR(255)
)
RETURNS DECIMAL(20, 8)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    base_rate DECIMAL(20, 8) := 10.0;
    total_reward DECIMAL(20, 8) := 0.0;
    milestone_bonus DECIMAL(20, 8) := 0.0;
    session_hours DECIMAL(10,2);
    difficulty_multiplier DECIMAL(5,2) := 1.0;
    ranking_multiplier DECIMAL(5,2) := 1.0;
    consistency_multiplier DECIMAL(5,2) := 1.0;
BEGIN
    -- Convertir minutos a horas
    session_hours := session_minutes / 60.0;
    
    -- Calcular tasa base según duración
    IF session_hours >= 24.0 THEN
        base_rate := 30.0;
    ELSIF session_hours >= 18.0 THEN
        base_rate := 22.0;
    ELSIF session_hours >= 12.0 THEN
        base_rate := 18.0;
    ELSIF session_hours >= 8.0 THEN
        base_rate := 15.0;
    ELSIF session_hours >= 4.0 THEN
        base_rate := 12.0;
    ELSIF session_hours >= 1.0 THEN
        base_rate := 11.0;
    END IF;
    
    -- Calcular recompensa base
    total_reward := base_rate * session_minutes / 60.0;
    
    -- Calcular bonificación por hitos
    SELECT COALESCE(SUM(bonus_tokens), 0.0) INTO milestone_bonus
    FROM session_milestones 
    WHERE milestone_hours <= session_hours;
    
    -- Aplicar multiplicadores (simplificados para esta versión)
    difficulty_multiplier := 1.0; -- Se puede implementar lógica más compleja
    ranking_multiplier := 1.0;    -- Se puede implementar lógica más compleja
    consistency_multiplier := 1.0; -- Se puede implementar lógica más compleja
    
    -- Calcular recompensa final
    total_reward := (total_reward * difficulty_multiplier * ranking_multiplier * consistency_multiplier) + milestone_bonus;
    
    RETURN total_reward;
END;
$$;

-- 9. Crear función para actualizar rankings
CREATE OR REPLACE FUNCTION update_global_rankings()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Actualizar rankings basados en total de tokens minados
    WITH ranked_users AS (
        SELECT 
            email,
            username,
            total_mined,
            total_mining_time,
            longest_session,
            best_streak,
            efficiency_rating,
            ROW_NUMBER() OVER (ORDER BY total_mined DESC) as new_rank
        FROM users_balances
        WHERE total_mined > 0
    )
    UPDATE global_rankings 
    SET 
        ranking_position = ru.new_rank,
        total_tokens_mined = ru.total_mined,
        total_mining_time = ru.total_mining_time,
        longest_session = ru.longest_session,
        best_streak = ru.best_streak,
        efficiency_rating = ru.efficiency_rating,
        last_updated = NOW()
    FROM ranked_users ru
    WHERE global_rankings.user_email = ru.email;
    
    -- Actualizar ranking en users_balances
    UPDATE users_balances 
    SET ranking_position = gr.ranking_position
    FROM global_rankings gr
    WHERE users_balances.email = gr.user_email;
END;
$$;

-- 10. Verificar la nueva estructura
SELECT 
    table_name, 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name IN ('users_balances', 'mining_sessions', 'user_achievements', 'session_milestones', 'global_rankings')
ORDER BY table_name, ordinal_position;

-- ¡Listo! Tu base de datos está configurada para minería de 24 horas
