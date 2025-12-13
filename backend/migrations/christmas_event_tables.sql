-- ========================================
-- CHRISTMAS EVENT - DATABASE SCHEMA
-- Esquema de base de datos para el evento navideño
-- ========================================

-- Tabla de regalos del evento navideño
CREATE TABLE IF NOT EXISTS christmas_event_gifts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    gift_id VARCHAR(50) NOT NULL,
    reward DECIMAL(10, 6) NOT NULL,
    unlocked BOOLEAN DEFAULT false,
    claimed BOOLEAN DEFAULT false,
    unlocked_at TIMESTAMP WITH TIME ZONE,
    claimed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, gift_id)
);

-- Tabla de milestones de referidos del evento
CREATE TABLE IF NOT EXISTS christmas_event_milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    milestone INTEGER NOT NULL,
    reward DECIMAL(10, 6) NOT NULL,
    claimed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, milestone)
);

-- Tabla de desafíos del evento
CREATE TABLE IF NOT EXISTS christmas_event_challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    challenge_id VARCHAR(50) NOT NULL,
    progress DECIMAL(10, 2) DEFAULT 0,
    reward DECIMAL(10, 6) NOT NULL,
    completed BOOLEAN DEFAULT false,
    claimed BOOLEAN DEFAULT false,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    claimed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, challenge_id)
);

-- Tabla de actividad de Telegram
CREATE TABLE IF NOT EXISTS telegram_activity (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    telegram_user_id BIGINT UNIQUE NOT NULL,
    username VARCHAR(255),
    message_count INTEGER DEFAULT 0,
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de hitos comunitarios
CREATE TABLE IF NOT EXISTS community_milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    milestone VARCHAR(100) UNIQUE NOT NULL,
    target INTEGER NOT NULL,
    current INTEGER DEFAULT 0,
    reward DECIMAL(10, 6) NOT NULL,
    reward_distributed BOOLEAN DEFAULT false,
    completed_at TIMESTAMP WITH TIME ZONE,
    distributed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Agregar columna telegram_user_id a users (si no existe)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'telegram_user_id'
    ) THEN
        ALTER TABLE users 
        ADD COLUMN telegram_user_id BIGINT;
    END IF;
END $$;

-- Índices para mejorar performance
CREATE INDEX IF NOT EXISTS idx_christmas_gifts_user ON christmas_event_gifts(user_id);
CREATE INDEX IF NOT EXISTS idx_christmas_gifts_gift ON christmas_event_gifts(gift_id);
CREATE INDEX IF NOT EXISTS idx_christmas_milestones_user ON christmas_event_milestones(user_id);
CREATE INDEX IF NOT EXISTS idx_christmas_challenges_user ON christmas_event_challenges(user_id);
CREATE INDEX IF NOT EXISTS idx_christmas_challenges_challenge ON christmas_event_challenges(challenge_id);
CREATE INDEX IF NOT EXISTS idx_telegram_activity_user ON telegram_activity(telegram_user_id);
CREATE INDEX IF NOT EXISTS idx_users_telegram ON users(telegram_user_id);

-- Insertar hitos comunitarios iniciales
INSERT INTO community_milestones (milestone, target, reward) 
VALUES 
    ('telegram1000', 1000, 25)
ON CONFLICT (milestone) DO NOTHING;

-- Comentarios en las tablas
COMMENT ON TABLE christmas_event_gifts IS 'Regalos del evento navideño por usuario';
COMMENT ON TABLE christmas_event_milestones IS 'Milestones de referidos del evento navideño';
COMMENT ON TABLE christmas_event_challenges IS 'Desafíos diarios y semanales del evento';
COMMENT ON TABLE telegram_activity IS 'Actividad de usuarios en Telegram';
COMMENT ON TABLE community_milestones IS 'Hitos comunitarios del evento';

