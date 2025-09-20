-- ===== CREAR TABLAS AVANZADAS =====
-- Ejecutar este SQL en Supabase Dashboard -> SQL Editor

-- Tabla de equipos de usuario
CREATE TABLE IF NOT EXISTS user_equipment (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    equipment_data JSONB NOT NULL DEFAULT '{}',
    total_hash_rate_bonus DECIMAL(10, 2) DEFAULT 0.00,
    total_efficiency_bonus DECIMAL(10, 2) DEFAULT 0.00,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Tabla de niveles de usuario
CREATE TABLE IF NOT EXISTS user_levels (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    level INTEGER NOT NULL DEFAULT 1,
    xp BIGINT NOT NULL DEFAULT 0,
    total_xp BIGINT NOT NULL DEFAULT 0,
    achievements JSONB NOT NULL DEFAULT '[]',
    unlocked_features JSONB NOT NULL DEFAULT '[]',
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Tabla de algoritmos de usuario
CREATE TABLE IF NOT EXISTS user_algorithms (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    unlocked_algorithms JSONB NOT NULL DEFAULT '[]',
    purchased_algorithms JSONB NOT NULL DEFAULT '[]',
    active_algorithm VARCHAR(50) DEFAULT 'sha256',
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Tabla de clanes
CREATE TABLE IF NOT EXISTS clans (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    leader_id UUID NOT NULL REFERENCES users(id),
    member_count INTEGER DEFAULT 1,
    total_contribution DECIMAL(20, 8) DEFAULT 0.00000000,
    level INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de miembros de clan
CREATE TABLE IF NOT EXISTS clan_members (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    clan_id UUID NOT NULL REFERENCES clans(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    role VARCHAR(20) DEFAULT 'member',
    contribution DECIMAL(20, 8) DEFAULT 0.00000000,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(clan_id, user_id)
);

-- Habilitar RLS
ALTER TABLE user_equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_algorithms ENABLE ROW LEVEL SECURITY;
ALTER TABLE clans ENABLE ROW LEVEL SECURITY;
ALTER TABLE clan_members ENABLE ROW LEVEL SECURITY;

-- Políticas RLS básicas
CREATE POLICY "Users can manage own equipment" ON user_equipment FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own levels" ON user_levels FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own algorithms" ON user_algorithms FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Anyone can view clans" ON clans FOR SELECT USING (true);
CREATE POLICY "Users can create clans" ON clans FOR INSERT WITH CHECK (auth.uid() = leader_id);
CREATE POLICY "Anyone can view clan members" ON clan_members FOR SELECT USING (true);
CREATE POLICY "Users can join clans" ON clan_members FOR INSERT WITH CHECK (auth.uid() = user_id);
