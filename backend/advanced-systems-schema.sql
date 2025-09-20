-- ===== RSC ADVANCED MINING SYSTEMS SCHEMA =====
-- Esquema para los sistemas avanzados de minería

-- ===== TABLA DE EQUIPOS DE USUARIO =====
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

-- ===== TABLA DE NIVELES DE USUARIO =====
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

-- ===== TABLA DE ALGORITMOS DE USUARIO =====
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

-- ===== TABLA DE CLANES =====
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

-- ===== TABLA DE MIEMBROS DE CLAN =====
CREATE TABLE IF NOT EXISTS clan_members (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    clan_id UUID NOT NULL REFERENCES clans(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    role VARCHAR(20) DEFAULT 'member', -- member, officer, leader
    contribution DECIMAL(20, 8) DEFAULT 0.00000000,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(clan_id, user_id)
);

-- ===== TABLA DE CHAT DE CLAN =====
CREATE TABLE IF NOT EXISTS clan_chat (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    clan_id UUID NOT NULL REFERENCES clans(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===== TABLA DE MARKETPLACE =====
CREATE TABLE IF NOT EXISTS marketplace_listings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    seller_id UUID NOT NULL REFERENCES users(id),
    equipment_type VARCHAR(50) NOT NULL,
    equipment_level INTEGER NOT NULL,
    price DECIMAL(20, 8) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'active', -- active, sold, expired
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days')
);

-- ===== TABLA DE COMPRAS DEL MARKETPLACE =====
CREATE TABLE IF NOT EXISTS marketplace_purchases (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    listing_id UUID NOT NULL REFERENCES marketplace_listings(id),
    buyer_id UUID NOT NULL REFERENCES users(id),
    seller_id UUID NOT NULL REFERENCES users(id),
    price DECIMAL(20, 8) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===== TABLA DE EVENTOS =====
CREATE TABLE IF NOT EXISTS events (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    event_type VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    multiplier DECIMAL(5, 2) NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===== TABLA DE PROGRESO DE EVENTOS DE USUARIO =====
CREATE TABLE IF NOT EXISTS user_event_progress (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    event_id UUID NOT NULL REFERENCES events(id),
    progress DECIMAL(20, 8) DEFAULT 0.00000000,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, event_id)
);

-- ===== TABLA DE TEMPORADAS =====
CREATE TABLE IF NOT EXISTS seasons (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    season_number INTEGER UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===== TABLA DE PROGRESO DE TEMPORADA DE USUARIO =====
CREATE TABLE IF NOT EXISTS user_season_progress (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    season_id UUID NOT NULL REFERENCES seasons(id),
    season_xp BIGINT DEFAULT 0,
    season_level INTEGER DEFAULT 1,
    rewards_claimed JSONB DEFAULT '[]',
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, season_id)
);

-- ===== ÍNDICES PARA OPTIMIZACIÓN =====
CREATE INDEX IF NOT EXISTS idx_user_equipment_user_id ON user_equipment(user_id);
CREATE INDEX IF NOT EXISTS idx_user_levels_user_id ON user_levels(user_id);
CREATE INDEX IF NOT EXISTS idx_user_algorithms_user_id ON user_algorithms(user_id);
CREATE INDEX IF NOT EXISTS idx_clan_members_clan_id ON clan_members(clan_id);
CREATE INDEX IF NOT EXISTS idx_clan_members_user_id ON clan_members(user_id);
CREATE INDEX IF NOT EXISTS idx_clan_chat_clan_id ON clan_chat(clan_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_seller_id ON marketplace_listings(seller_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_status ON marketplace_listings(status);
CREATE INDEX IF NOT EXISTS idx_marketplace_purchases_buyer_id ON marketplace_purchases(buyer_id);
CREATE INDEX IF NOT EXISTS idx_events_active ON events(is_active);
CREATE INDEX IF NOT EXISTS idx_user_event_progress_user_id ON user_event_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_season_progress_user_id ON user_season_progress(user_id);

-- ===== POLÍTICAS RLS (Row Level Security) =====
-- Habilitar RLS en todas las tablas
ALTER TABLE user_equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_algorithms ENABLE ROW LEVEL SECURITY;
ALTER TABLE clans ENABLE ROW LEVEL SECURITY;
ALTER TABLE clan_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE clan_chat ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_event_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE seasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_season_progress ENABLE ROW LEVEL SECURITY;

-- Políticas para user_equipment
CREATE POLICY "Users can view own equipment" ON user_equipment FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own equipment" ON user_equipment FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own equipment" ON user_equipment FOR UPDATE USING (auth.uid() = user_id);

-- Políticas para user_levels
CREATE POLICY "Users can view own levels" ON user_levels FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own levels" ON user_levels FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own levels" ON user_levels FOR UPDATE USING (auth.uid() = user_id);

-- Políticas para user_algorithms
CREATE POLICY "Users can view own algorithms" ON user_algorithms FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own algorithms" ON user_algorithms FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own algorithms" ON user_algorithms FOR UPDATE USING (auth.uid() = user_id);

-- Políticas para clans
CREATE POLICY "Anyone can view clans" ON clans FOR SELECT USING (true);
CREATE POLICY "Users can create clans" ON clans FOR INSERT WITH CHECK (auth.uid() = leader_id);
CREATE POLICY "Clan leaders can update their clans" ON clans FOR UPDATE USING (auth.uid() = leader_id);

-- Políticas para clan_members
CREATE POLICY "Users can view clan members" ON clan_members FOR SELECT USING (true);
CREATE POLICY "Users can join clans" ON clan_members FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can leave clans" ON clan_members FOR DELETE USING (auth.uid() = user_id);

-- Políticas para clan_chat
CREATE POLICY "Clan members can view chat" ON clan_chat FOR SELECT USING (
    EXISTS (SELECT 1 FROM clan_members WHERE clan_id = clan_chat.clan_id AND user_id = auth.uid())
);
CREATE POLICY "Clan members can send messages" ON clan_chat FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (SELECT 1 FROM clan_members WHERE clan_id = clan_chat.clan_id AND user_id = auth.uid())
);

-- Políticas para marketplace_listings
CREATE POLICY "Anyone can view active listings" ON marketplace_listings FOR SELECT USING (status = 'active');
CREATE POLICY "Users can create listings" ON marketplace_listings FOR INSERT WITH CHECK (auth.uid() = seller_id);
CREATE POLICY "Users can update own listings" ON marketplace_listings FOR UPDATE USING (auth.uid() = seller_id);

-- Políticas para marketplace_purchases
CREATE POLICY "Users can view own purchases" ON marketplace_purchases FOR SELECT USING (auth.uid() = buyer_id);
CREATE POLICY "Users can make purchases" ON marketplace_purchases FOR INSERT WITH CHECK (auth.uid() = buyer_id);

-- Políticas para events
CREATE POLICY "Anyone can view events" ON events FOR SELECT USING (true);

-- Políticas para user_event_progress
CREATE POLICY "Users can view own event progress" ON user_event_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own event progress" ON user_event_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own event progress" ON user_event_progress FOR UPDATE USING (auth.uid() = user_id);

-- Políticas para seasons
CREATE POLICY "Anyone can view seasons" ON seasons FOR SELECT USING (true);

-- Políticas para user_season_progress
CREATE POLICY "Users can view own season progress" ON user_season_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own season progress" ON user_season_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own season progress" ON user_season_progress FOR UPDATE USING (auth.uid() = user_id);

-- ===== DATOS INICIALES =====
-- Insertar temporada inicial
INSERT INTO seasons (season_number, name, description, start_time, end_time, is_active) 
VALUES (1, 'Season 1: Genesis', 'The beginning of RSC mining', NOW(), NOW() + INTERVAL '30 days', true)
ON CONFLICT (season_number) DO NOTHING;

-- Insertar evento inicial
INSERT INTO events (event_type, name, description, multiplier, start_time, end_time, is_active)
VALUES ('double_xp', 'Double XP Weekend', 'Gain double XP from all activities', 2.0, NOW(), NOW() + INTERVAL '48 hours', true)
ON CONFLICT DO NOTHING;
