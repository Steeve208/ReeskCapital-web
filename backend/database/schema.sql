-- ===== ESQUEMA DE BASE DE DATOS - MINERÍA SIMULADA RSC =====
-- Base de datos SQLite para el sistema de minería simulada

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  wallet_address TEXT UNIQUE NOT NULL,
  email TEXT,
  username TEXT,
  registration_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  total_simulated_tokens REAL DEFAULT 0,
  last_mining_activity DATETIME,
  is_migrated BOOLEAN DEFAULT FALSE,
  migration_date DATETIME,
  status TEXT DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de sesiones de minería
CREATE TABLE IF NOT EXISTS mining_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  session_uuid TEXT UNIQUE NOT NULL,
  start_time DATETIME NOT NULL,
  end_time DATETIME,
  hash_power REAL NOT NULL,
  tokens_earned REAL DEFAULT 0,
  status TEXT DEFAULT 'active',
  duration_seconds INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id)
);

-- Tabla de historial de minería
CREATE TABLE IF NOT EXISTS mining_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  session_id INTEGER,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  action TEXT NOT NULL,
  tokens_earned REAL DEFAULT 0,
  running_total REAL NOT NULL,
  details TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id),
  FOREIGN KEY (session_id) REFERENCES mining_sessions (id)
);

-- Tabla de acciones administrativas
CREATE TABLE IF NOT EXISTS admin_actions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  admin_user_id TEXT NOT NULL,
  target_user_id INTEGER,
  action_type TEXT NOT NULL,
  action_details TEXT,
  amount REAL DEFAULT 0,
  reason TEXT,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (target_user_id) REFERENCES users (id)
);

-- Tabla de migraciones
CREATE TABLE IF NOT EXISTS migrations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  wallet_address TEXT NOT NULL,
  tokens_migrated REAL NOT NULL,
  migration_tx_hash TEXT,
  status TEXT DEFAULT 'pending',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME,
  FOREIGN KEY (user_id) REFERENCES users (id)
);

-- Tabla de configuración del sistema
CREATE TABLE IF NOT EXISTS system_config (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  config_key TEXT UNIQUE NOT NULL,
  config_value TEXT NOT NULL,
  description TEXT,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de estadísticas del sistema
CREATE TABLE IF NOT EXISTS system_stats (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  stat_date DATE UNIQUE NOT NULL,
  total_users INTEGER DEFAULT 0,
  active_miners INTEGER DEFAULT 0,
  total_tokens_simulated REAL DEFAULT 0,
  total_mining_sessions INTEGER DEFAULT 0,
  total_mining_hours REAL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Índices para optimización
CREATE INDEX IF NOT EXISTS idx_users_wallet ON users(wallet_address);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_mining_sessions_user ON mining_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_mining_sessions_status ON mining_sessions(status);
CREATE INDEX IF NOT EXISTS idx_mining_history_user ON mining_history(user_id);
CREATE INDEX IF NOT EXISTS idx_mining_history_timestamp ON mining_history(timestamp);
CREATE INDEX IF NOT EXISTS idx_admin_actions_target ON admin_actions(target_user_id);
CREATE INDEX IF NOT EXISTS idx_migrations_user ON migrations(user_id);
CREATE INDEX IF NOT EXISTS idx_migrations_status ON migrations(status);

-- Insertar configuración inicial del sistema
INSERT OR IGNORE INTO system_config (config_key, config_value, description) VALUES
('tokens_per_second', '0.001', 'Tokens ganados por segundo por unidad de hash power'),
('max_hash_power', '100.0', 'Máxima potencia de hash permitida por usuario'),
('min_hash_power', '0.1', 'Mínima potencia de hash permitida por usuario'),
('session_timeout_hours', '24', 'Tiempo máximo de sesión de minería en horas'),
('migration_enabled', 'false', 'Si la migración a mainnet está habilitada'),
('system_version', '1.0.0', 'Versión actual del sistema de minería simulada');

-- Insertar estadísticas iniciales
INSERT OR IGNORE INTO system_stats (stat_date, total_users, active_miners, total_tokens_simulated) 
VALUES (DATE('now'), 0, 0, 0);
