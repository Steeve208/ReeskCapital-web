-- ========================================
-- CHRISTMAS COMPETITION - DATABASE SCHEMA
-- Esquema completo para el evento competitivo navideño
-- ========================================

-- Tabla de puntos de Christmas Points por usuario
CREATE TABLE IF NOT EXISTS christmas_points (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    total_points DECIMAL(15, 2) DEFAULT 0,
    current_streak INTEGER DEFAULT 0,
    last_login_date TIMESTAMP WITH TIME ZONE,
    stats JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Tabla de leaderboard (vista materializada o tabla de ranking)
CREATE TABLE IF NOT EXISTS christmas_leaderboard (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rank INTEGER NOT NULL,
    total_points DECIMAL(15, 2) NOT NULL,
    current_streak INTEGER DEFAULT 0,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Tabla de airdrop claims (registro de airdrops distribuidos)
CREATE TABLE IF NOT EXISTS christmas_airdrop_claims (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rank INTEGER NOT NULL,
    reward_amount DECIMAL(20, 8) NOT NULL,
    claimed BOOLEAN DEFAULT false,
    claimed_at TIMESTAMP WITH TIME ZONE,
    transaction_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, rank)
);

-- Tabla de regalos navideños
CREATE TABLE IF NOT EXISTS christmas_event_gifts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    gift_id VARCHAR(50) NOT NULL,
    unlocked BOOLEAN DEFAULT false,
    claimed BOOLEAN DEFAULT false,
    unlocked_at TIMESTAMP WITH TIME ZONE,
    claimed_at TIMESTAMP WITH TIME ZONE,
    points_awarded DECIMAL(15, 2) DEFAULT 0,
    rsc_reward DECIMAL(20, 8) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, gift_id)
);

-- Tabla de desafíos
CREATE TABLE IF NOT EXISTS christmas_event_challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    challenge_id VARCHAR(50) NOT NULL,
    challenge_type VARCHAR(20) NOT NULL, -- 'daily' o 'weekly'
    progress DECIMAL(15, 2) DEFAULT 0,
    completed BOOLEAN DEFAULT false,
    claimed BOOLEAN DEFAULT false,
    last_reset TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, challenge_id, challenge_type)
);

-- Tabla de milestones comunitarios
CREATE TABLE IF NOT EXISTS community_milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    milestone VARCHAR(100) NOT NULL UNIQUE,
    target DECIMAL(20, 2) NOT NULL,
    current DECIMAL(20, 2) DEFAULT 0,
    reward DECIMAL(20, 8) NOT NULL,
    completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMP WITH TIME ZONE,
    reward_distributed BOOLEAN DEFAULT false,
    distributed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejorar performance
CREATE INDEX IF NOT EXISTS idx_christmas_points_user ON christmas_points(user_id);
CREATE INDEX IF NOT EXISTS idx_christmas_points_total ON christmas_points(total_points DESC);
CREATE INDEX IF NOT EXISTS idx_christmas_leaderboard_rank ON christmas_leaderboard(rank);
CREATE INDEX IF NOT EXISTS idx_christmas_leaderboard_points ON christmas_leaderboard(total_points DESC);
CREATE INDEX IF NOT EXISTS idx_christmas_airdrop_user ON christmas_airdrop_claims(user_id);
CREATE INDEX IF NOT EXISTS idx_christmas_airdrop_rank ON christmas_airdrop_claims(rank);
CREATE INDEX IF NOT EXISTS idx_christmas_gifts_user ON christmas_event_gifts(user_id);
CREATE INDEX IF NOT EXISTS idx_christmas_challenges_user ON christmas_event_challenges(user_id);

-- Función para actualizar el leaderboard automáticamente
CREATE OR REPLACE FUNCTION update_christmas_leaderboard()
RETURNS TRIGGER AS $$
BEGIN
    -- Actualizar ranking basado en total_points
    WITH ranked_users AS (
        SELECT 
            user_id,
            total_points,
            current_streak,
            ROW_NUMBER() OVER (ORDER BY total_points DESC) as rank
        FROM christmas_points
        WHERE total_points > 0
    )
    INSERT INTO christmas_leaderboard (user_id, rank, total_points, current_streak, last_updated)
    SELECT user_id, rank, total_points, current_streak, NOW()
    FROM ranked_users
    ON CONFLICT (user_id) 
    DO UPDATE SET
        rank = EXCLUDED.rank,
        total_points = EXCLUDED.total_points,
        current_streak = EXCLUDED.current_streak,
        last_updated = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar leaderboard cuando cambian los puntos
DROP TRIGGER IF EXISTS trigger_update_christmas_leaderboard ON christmas_points;
CREATE TRIGGER trigger_update_christmas_leaderboard
AFTER INSERT OR UPDATE OF total_points ON christmas_points
FOR EACH ROW
EXECUTE FUNCTION update_christmas_leaderboard();

-- Función para calcular recompensa de airdrop según ranking
CREATE OR REPLACE FUNCTION get_christmas_airdrop_reward(p_rank INTEGER)
RETURNS DECIMAL(20, 8) AS $$
BEGIN
    CASE
        WHEN p_rank = 1 THEN RETURN 10000.0;
        WHEN p_rank BETWEEN 2 AND 3 THEN RETURN 5000.0;
        WHEN p_rank BETWEEN 4 AND 10 THEN RETURN 2500.0;
        WHEN p_rank BETWEEN 11 AND 25 THEN RETURN 1000.0;
        WHEN p_rank BETWEEN 26 AND 50 THEN RETURN 500.0;
        WHEN p_rank BETWEEN 51 AND 100 THEN RETURN 250.0;
        ELSE RETURN 0.0;
    END CASE;
END;
$$ LANGUAGE plpgsql;

-- Función para distribuir airdrop al final del evento
CREATE OR REPLACE FUNCTION distribute_christmas_airdrop()
RETURNS TABLE(user_id UUID, rank INTEGER, reward DECIMAL(20, 8)) AS $$
BEGIN
    RETURN QUERY
    WITH top_users AS (
        SELECT 
            cl.user_id,
            cl.rank,
            get_christmas_airdrop_reward(cl.rank) as reward
        FROM christmas_leaderboard cl
        WHERE cl.rank <= 100
        ORDER BY cl.rank
    )
    INSERT INTO christmas_airdrop_claims (user_id, rank, reward_amount, claimed)
    SELECT user_id, rank, reward, false
    FROM top_users
    ON CONFLICT (user_id, rank) DO NOTHING
    RETURNING christmas_airdrop_claims.user_id, christmas_airdrop_claims.rank, christmas_airdrop_claims.reward_amount;
END;
$$ LANGUAGE plpgsql;

-- Actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_christmas_points_updated_at ON christmas_points;
CREATE TRIGGER update_christmas_points_updated_at
BEFORE UPDATE ON christmas_points
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_christmas_gifts_updated_at ON christmas_event_gifts;
CREATE TRIGGER update_christmas_gifts_updated_at
BEFORE UPDATE ON christmas_event_gifts
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_christmas_challenges_updated_at ON christmas_event_challenges;
CREATE TRIGGER update_christmas_challenges_updated_at
BEFORE UPDATE ON christmas_event_challenges
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Comentarios en las tablas
COMMENT ON TABLE christmas_points IS 'Puntos de Christmas Points por usuario';
COMMENT ON TABLE christmas_leaderboard IS 'Ranking en tiempo real del evento navideño';
COMMENT ON TABLE christmas_airdrop_claims IS 'Registro de airdrops distribuidos a ganadores';
COMMENT ON TABLE christmas_event_gifts IS 'Regalos navideños desbloqueados y reclamados por usuario';
COMMENT ON TABLE christmas_event_challenges IS 'Desafíos diarios y semanales del evento navideño';
COMMENT ON TABLE community_milestones IS 'Milestones comunitarios globales del evento';

