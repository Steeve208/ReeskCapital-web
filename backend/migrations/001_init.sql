-- ===== MIGRACIÓN INICIAL - SISTEMA DE MINERÍA RSC =====
-- Base de datos PostgreSQL para el sistema de minería RSC

-- Extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  wallet_address VARCHAR(42) UNIQUE NOT NULL CHECK (wallet_address ~ '^0x[a-fA-F0-9]{40}$'),
  referral_code VARCHAR(50),
  referred_by VARCHAR(50),
  mined_balance NUMERIC(18,8) DEFAULT 0,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'banned')),
  last_mine TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Tabla de eventos de minería (auditoría + anti‑abuso)
CREATE TABLE IF NOT EXISTS mining_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reward NUMERIC(18,8) NOT NULL CHECK (reward > 0),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  ip INET,
  user_agent TEXT
);

-- Tabla de administradores
CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Tabla de acciones administrativas (auditoría)
CREATE TABLE IF NOT EXISTS admin_actions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_user_id UUID NOT NULL REFERENCES admins(id) ON DELETE CASCADE,
  target_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action_type VARCHAR(50) NOT NULL,
  action_details TEXT,
  reason TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Tabla de configuración del sistema
CREATE TABLE IF NOT EXISTS system_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  config_key VARCHAR(100) UNIQUE NOT NULL,
  config_value TEXT NOT NULL,
  description TEXT,
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Tabla de estadísticas del sistema
CREATE TABLE IF NOT EXISTS system_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  stat_date DATE UNIQUE NOT NULL,
  total_users INTEGER DEFAULT 0,
  active_miners INTEGER DEFAULT 0,
  total_tokens_simulated NUMERIC(18,8) DEFAULT 0,
  total_mining_sessions INTEGER DEFAULT 0,
  total_mining_hours NUMERIC(10,2) DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Tabla de sesiones de minería (para futuras funcionalidades)
CREATE TABLE IF NOT EXISTS mining_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_uuid TEXT UNIQUE NOT NULL,
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP,
  hash_power NUMERIC(10,2) NOT NULL,
  tokens_earned NUMERIC(18,8) DEFAULT 0,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  duration_seconds INTEGER DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Tabla de migraciones (para futuras migraciones a mainnet)
CREATE TABLE IF NOT EXISTS migrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  wallet_address VARCHAR(42) NOT NULL,
  tokens_migrated NUMERIC(18,8) NOT NULL,
  migration_tx_hash TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMP
);

-- Insertar configuración inicial del sistema
INSERT INTO system_config (config_key, config_value, description) VALUES
('tokens_per_second', '0.001', 'Tokens ganados por segundo por unidad de hash power'),
('max_hash_power', '100.0', 'Máxima potencia de hash permitida por usuario'),
('min_hash_power', '0.1', 'Mínima potencia de hash permitida por usuario'),
('session_timeout_hours', '24', 'Tiempo máximo de sesión de minería en horas'),
('migration_enabled', 'false', 'Si la migración a mainnet está habilitada'),
('system_version', '2.0.0', 'Versión actual del sistema de minería RSC'),
('mine_cooldown_seconds', '60', 'Segundos de cooldown entre minas'),
('mine_reward_min', '0.001', 'Recompensa mínima por mina'),
('mine_reward_max', '0.05', 'Recompensa máxima por mina'),
('mine_daily_cap', '5', 'Límite diario de recompensas por usuario')
ON CONFLICT (config_key) DO NOTHING;

-- Insertar estadísticas iniciales
INSERT INTO system_stats (stat_date, total_users, active_miners, total_tokens_simulated) 
VALUES (CURRENT_DATE, 0, 0, 0)
ON CONFLICT (stat_date) DO NOTHING;

-- Crear índices para optimización
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_wallet_address ON users(wallet_address);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_users_last_mine ON users(last_mine DESC);

CREATE INDEX IF NOT EXISTS idx_mining_events_user_id ON mining_events(user_id);
CREATE INDEX IF NOT EXISTS idx_mining_events_created_at ON mining_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_mining_events_user_created ON mining_events(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_admins_email ON admins(email);

CREATE INDEX IF NOT EXISTS idx_admin_actions_admin_id ON admin_actions(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_actions_target_id ON admin_actions(target_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_actions_created_at ON admin_actions(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_mining_sessions_user_id ON mining_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_mining_sessions_status ON mining_sessions(status);
CREATE INDEX IF NOT EXISTS idx_mining_sessions_created_at ON mining_sessions(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_migrations_user_id ON migrations(user_id);
CREATE INDEX IF NOT EXISTS idx_migrations_status ON migrations(status);

-- Crear vistas para consultas comunes
CREATE OR REPLACE VIEW user_mining_summary AS
SELECT 
  u.id,
  u.email,
  u.wallet_address,
  u.mined_balance,
  u.last_mine,
  u.status,
  u.created_at,
  COUNT(me.id) as total_mines,
  COALESCE(SUM(me.reward), 0) as total_reward,
  MAX(me.created_at) as last_mine_date
FROM users u
LEFT JOIN mining_events me ON me.user_id = u.id
GROUP BY u.id, u.email, u.wallet_address, u.mined_balance, u.last_mine, u.status, u.created_at;

-- Crear función para actualizar timestamp de updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Crear trigger para actualizar updated_at automáticamente
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Crear función para calcular estadísticas diarias
CREATE OR REPLACE FUNCTION calculate_daily_stats()
RETURNS void AS $$
BEGIN
  INSERT INTO system_stats (stat_date, total_users, active_miners, total_tokens_simulated, total_mining_sessions)
  SELECT 
    CURRENT_DATE,
    COUNT(*) as total_users,
    COUNT(CASE WHEN last_mine >= NOW() - INTERVAL '24 hours' THEN 1 END) as active_miners_24h,
    COALESCE(SUM(mined_balance), 0) as total_tokens_simulated,
    COUNT(*) as total_mining_sessions
  FROM users
  ON CONFLICT (stat_date) 
  DO UPDATE SET
    total_users = EXCLUDED.total_users,
    active_miners = EXCLUDED.active_miners_24h,
    total_tokens_simulated = EXCLUDED.total_tokens_simulated,
    total_mining_sessions = EXCLUDED.total_mining_sessions;
END;
$$ LANGUAGE plpgsql;

-- Comentarios en las tablas
COMMENT ON TABLE users IS 'Tabla principal de usuarios del sistema de minería RSC';
COMMENT ON TABLE mining_events IS 'Eventos de minería para auditoría y anti-abuso';
COMMENT ON TABLE admins IS 'Administradores del sistema';
COMMENT ON TABLE admin_actions IS 'Auditoría de acciones administrativas';
COMMENT ON TABLE system_config IS 'Configuración del sistema';
COMMENT ON TABLE system_stats IS 'Estadísticas diarias del sistema';
COMMENT ON TABLE mining_sessions IS 'Sesiones de minería para futuras funcionalidades';
COMMENT ON TABLE migrations IS 'Migraciones a mainnet para futuras funcionalidades';
