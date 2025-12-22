-- ===== TABLAS ADICIONALES PARA NUEVA PLATAFORMA DE MINERÍA =====
-- Ejecutar este script en Supabase SQL Editor
-- Estas tablas complementan las existentes: users, mining_sessions, transactions, referrals, referral_codes

-- Extensión para UUID (si no existe)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===== 1. TABLA DE POOLS =====
CREATE TABLE IF NOT EXISTS pools (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    url VARCHAR(255) NOT NULL,
    port INTEGER NOT NULL,
    algorithm VARCHAR(50) DEFAULT 'sha256',
    fee_percentage DECIMAL(5, 2) DEFAULT 1.00,
    status VARCHAR(20) DEFAULT 'active', -- active, inactive, maintenance
    priority INTEGER DEFAULT 0,
    is_default BOOLEAN DEFAULT false,
    stats JSONB DEFAULT '{}'::jsonb, -- hashrate, miners, latency, uptime
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(url, port)
);

-- ===== 2. TABLA DE POOLS CONFIGURADOS POR USUARIO =====
CREATE TABLE IF NOT EXISTS user_pools (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    pool_id UUID REFERENCES pools(id) ON DELETE CASCADE,
    custom_name VARCHAR(100), -- Nombre personalizado del pool
    custom_url VARCHAR(255), -- URL personalizada (si no usa pool_id)
    custom_port INTEGER, -- Puerto personalizado
    priority INTEGER DEFAULT 0, -- Orden de prioridad para este usuario
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, pool_id, custom_url)
);

-- ===== 3. TABLA DE RETIROS =====
CREATE TABLE IF NOT EXISTS withdrawals (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount DECIMAL(20, 8) NOT NULL CHECK (amount > 0),
    address VARCHAR(255) NOT NULL, -- Dirección de destino
    fee DECIMAL(20, 8) DEFAULT 0.00000000, -- Fee de transacción
    net_amount DECIMAL(20, 8) NOT NULL, -- amount - fee
    status VARCHAR(20) DEFAULT 'pending', -- pending, processing, completed, failed, cancelled
    tx_hash VARCHAR(255), -- Hash de transacción blockchain
    confirmations INTEGER DEFAULT 0, -- Confirmaciones de blockchain
    metadata JSONB DEFAULT '{}'::jsonb, -- Datos adicionales
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    failed_at TIMESTAMP WITH TIME ZONE,
    failure_reason TEXT
);

-- ===== 4. TABLA DE API KEYS =====
CREATE TABLE IF NOT EXISTS api_keys (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    key_name VARCHAR(100) NOT NULL, -- Nombre descriptivo
    api_key VARCHAR(255) UNIQUE NOT NULL, -- Key generada
    api_secret VARCHAR(255) NOT NULL, -- Secret (hasheado)
    permissions JSONB DEFAULT '{"read": true, "write": false, "withdraw": false}'::jsonb,
    last_used TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE, -- NULL = nunca expira
    status VARCHAR(20) DEFAULT 'active', -- active, revoked, expired
    usage_count INTEGER DEFAULT 0, -- Contador de usos
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===== 5. TABLA DE WEBHOOKS =====
CREATE TABLE IF NOT EXISTS webhooks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    url VARCHAR(500) NOT NULL, -- URL del webhook
    events JSONB NOT NULL DEFAULT '[]'::jsonb, -- Eventos a escuchar
    secret VARCHAR(255) NOT NULL, -- Secret para validar webhooks
    status VARCHAR(20) DEFAULT 'active', -- active, inactive
    last_triggered TIMESTAMP WITH TIME ZONE,
    failure_count INTEGER DEFAULT 0, -- Contador de fallos consecutivos
    last_failure_at TIMESTAMP WITH TIME ZONE,
    last_failure_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===== 6. TABLA DE TICKETS DE SOPORTE =====
CREATE TABLE IF NOT EXISTS support_tickets (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    category VARCHAR(50) DEFAULT 'general', -- technical, billing, general, bug, feature
    status VARCHAR(20) DEFAULT 'open', -- open, in_progress, resolved, closed
    priority VARCHAR(20) DEFAULT 'medium', -- low, medium, high, urgent
    assigned_to UUID REFERENCES users(id), -- Admin asignado (NULL si no está asignado)
    responses JSONB DEFAULT '[]'::jsonb, -- Array de respuestas
    metadata JSONB DEFAULT '{}'::jsonb, -- Datos adicionales
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE,
    closed_at TIMESTAMP WITH TIME ZONE
);

-- ===== 7. TABLA DE NOTIFICACIONES =====
CREATE TABLE IF NOT EXISTS notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(20) DEFAULT 'info', -- info, success, warning, error
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    action_url VARCHAR(500), -- URL de acción (opcional)
    read BOOLEAN DEFAULT false, -- Si fue leída
    read_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}'::jsonb, -- Datos adicionales
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===== 8. TABLA DE ESTADÍSTICAS AGREGADAS DE MINERÍA =====
CREATE TABLE IF NOT EXISTS mining_stats (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL, -- Fecha del día
    total_hashrate DECIMAL(15, 2) DEFAULT 0.00, -- Hashrate total del día
    avg_hashrate DECIMAL(15, 2) DEFAULT 0.00, -- Hashrate promedio
    peak_hashrate DECIMAL(15, 2) DEFAULT 0.00, -- Hashrate máximo
    tokens_mined DECIMAL(20, 8) DEFAULT 0.00000000, -- Tokens minados
    sessions_count INTEGER DEFAULT 0, -- Número de sesiones
    total_duration_ms BIGINT DEFAULT 0, -- Duración total en ms
    efficiency_avg DECIMAL(5, 2) DEFAULT 0.00, -- Eficiencia promedio
    shares_accepted INTEGER DEFAULT 0, -- Shares aceptados
    shares_rejected INTEGER DEFAULT 0, -- Shares rechazados
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, date)
);

-- ===== ÍNDICES PARA OPTIMIZACIÓN =====

-- Pools
CREATE INDEX IF NOT EXISTS idx_pools_status ON pools(status);
CREATE INDEX IF NOT EXISTS idx_pools_is_default ON pools(is_default);
CREATE INDEX IF NOT EXISTS idx_pools_algorithm ON pools(algorithm);

-- User Pools
CREATE INDEX IF NOT EXISTS idx_user_pools_user_id ON user_pools(user_id);
CREATE INDEX IF NOT EXISTS idx_user_pools_pool_id ON user_pools(pool_id);
CREATE INDEX IF NOT EXISTS idx_user_pools_is_active ON user_pools(is_active);

-- Withdrawals
CREATE INDEX IF NOT EXISTS idx_withdrawals_user_id ON withdrawals(user_id);
CREATE INDEX IF NOT EXISTS idx_withdrawals_status ON withdrawals(status);
CREATE INDEX IF NOT EXISTS idx_withdrawals_created_at ON withdrawals(created_at);
CREATE INDEX IF NOT EXISTS idx_withdrawals_tx_hash ON withdrawals(tx_hash) WHERE tx_hash IS NOT NULL;

-- API Keys
CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_api_key ON api_keys(api_key);
CREATE INDEX IF NOT EXISTS idx_api_keys_status ON api_keys(status);
CREATE INDEX IF NOT EXISTS idx_api_keys_expires_at ON api_keys(expires_at) WHERE expires_at IS NOT NULL;

-- Webhooks
CREATE INDEX IF NOT EXISTS idx_webhooks_user_id ON webhooks(user_id);
CREATE INDEX IF NOT EXISTS idx_webhooks_status ON webhooks(status);
CREATE INDEX IF NOT EXISTS idx_webhooks_url ON webhooks(url);

-- Support Tickets
CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_category ON support_tickets(category);
CREATE INDEX IF NOT EXISTS idx_support_tickets_priority ON support_tickets(priority);
CREATE INDEX IF NOT EXISTS idx_support_tickets_assigned_to ON support_tickets(assigned_to) WHERE assigned_to IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_support_tickets_created_at ON support_tickets(created_at);

-- Notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, read, created_at DESC);

-- Mining Stats
CREATE INDEX IF NOT EXISTS idx_mining_stats_user_id ON mining_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_mining_stats_date ON mining_stats(date);
CREATE INDEX IF NOT EXISTS idx_mining_stats_user_date ON mining_stats(user_id, date DESC);

-- ===== FUNCIONES Y TRIGGERS =====

-- Función para actualizar updated_at (si no existe)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_pools_updated_at BEFORE UPDATE ON pools
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_pools_updated_at BEFORE UPDATE ON user_pools
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_withdrawals_updated_at BEFORE UPDATE ON withdrawals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_api_keys_updated_at BEFORE UPDATE ON api_keys
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_webhooks_updated_at BEFORE UPDATE ON webhooks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_support_tickets_updated_at BEFORE UPDATE ON support_tickets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mining_stats_updated_at BEFORE UPDATE ON mining_stats
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===== DATOS INICIALES (Opcional) =====

-- Insertar pool por defecto
INSERT INTO pools (name, url, port, algorithm, fee_percentage, is_default, status, priority)
VALUES 
    ('RSC Main Pool', 'pool.rscchain.com', 3333, 'sha256', 1.00, true, 'active', 1),
    ('RSC Backup Pool', 'backup.pool.rscchain.com', 3333, 'sha256', 1.00, false, 'active', 2)
ON CONFLICT (url, port) DO NOTHING;

-- ===== COMENTARIOS EN TABLAS =====

COMMENT ON TABLE pools IS 'Pools de minería disponibles';
COMMENT ON TABLE user_pools IS 'Pools configurados por usuario';
COMMENT ON TABLE withdrawals IS 'Solicitudes de retiro de fondos';
COMMENT ON TABLE api_keys IS 'Claves API para integraciones';
COMMENT ON TABLE webhooks IS 'Webhooks configurados por usuario';
COMMENT ON TABLE support_tickets IS 'Tickets de soporte técnico';
COMMENT ON TABLE notifications IS 'Notificaciones del usuario';
COMMENT ON TABLE mining_stats IS 'Estadísticas agregadas de minería por día';

-- ===== FIN DEL SCRIPT =====
-- Verificar que todas las tablas se crearon correctamente:
-- SELECT table_name FROM information_schema.tables 
-- WHERE table_schema = 'public' 
-- AND table_name IN ('pools', 'user_pools', 'withdrawals', 'api_keys', 'webhooks', 'support_tickets', 'notifications', 'mining_stats');

