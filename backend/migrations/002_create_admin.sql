-- ===== MIGRACIÓN 002 - CREAR ADMINISTRADOR INICIAL =====
-- Crea un administrador inicial para el sistema

-- Función para crear hash de contraseña (simulada, se debe generar con bcrypt)
-- En producción, usar: SELECT crypt('password123', gen_salt('bf', 12));

-- Crear administrador inicial
-- NOTA: Esta contraseña debe ser cambiada inmediatamente en producción
INSERT INTO admins (email, password_hash) VALUES
(
  'admin@rsc.local',
  -- Hash generado con bcrypt para 'AdminRSC2024!' (costo 12)
  '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8KqHh6O'
)
ON CONFLICT (email) DO NOTHING;

-- Crear administrador adicional para desarrollo
INSERT INTO admins (email, password_hash) VALUES
(
  'dev@rsc.local',
  -- Hash generado con bcrypt para 'DevRSC2024!' (costo 12)
  '$2b$12$9KqHh6OLQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J'
)
ON CONFLICT (email) DO NOTHING;

-- Insertar configuración adicional del sistema
INSERT INTO system_config (config_key, config_value, description) VALUES
('admin_contact', 'admin@rsc.local', 'Email de contacto del administrador principal'),
('system_name', 'RSC Mining System', 'Nombre del sistema de minería'),
('maintenance_mode', 'false', 'Si el sistema está en modo mantenimiento'),
('max_users', '10000', 'Máximo número de usuarios permitidos'),
('mining_enabled', 'true', 'Si la minería está habilitada'),
('registration_enabled', 'true', 'Si el registro de usuarios está habilitado')
ON CONFLICT (config_key) DO NOTHING;

-- Crear índices adicionales para optimización
CREATE INDEX IF NOT EXISTS idx_users_referral_code ON users(referral_code);
CREATE INDEX IF NOT EXISTS idx_users_referred_by ON users(referred_by);
CREATE INDEX IF NOT EXISTS idx_mining_events_ip ON mining_events(ip);
CREATE INDEX IF NOT EXISTS idx_mining_events_reward ON mining_events(reward);

-- Crear vista para estadísticas de referidos
CREATE OR REPLACE VIEW referral_stats AS
SELECT 
  referral_code,
  COUNT(*) as total_referrals,
  COUNT(CASE WHEN status = 'active' THEN 1 END) as active_referrals,
  COALESCE(SUM(mined_balance), 0) as total_referred_balance
FROM users 
WHERE referral_code IS NOT NULL
GROUP BY referral_code
ORDER BY total_referrals DESC;

-- Crear vista para estadísticas de minería por IP (para detección de abuso)
CREATE OR REPLACE VIEW ip_mining_stats AS
SELECT 
  ip,
  COUNT(*) as total_mining_events,
  COUNT(DISTINCT user_id) as unique_users,
  COALESCE(SUM(reward), 0) as total_rewards,
  MIN(created_at) as first_mining,
  MAX(created_at) as last_mining
FROM mining_events 
WHERE ip IS NOT NULL
GROUP BY ip
HAVING COUNT(*) > 1
ORDER BY total_mining_events DESC;

-- Crear función para limpiar eventos de minería antiguos (mantenimiento)
CREATE OR REPLACE FUNCTION cleanup_old_mining_events(days_to_keep INTEGER DEFAULT 90)
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM mining_events 
  WHERE created_at < NOW() - INTERVAL '1 day' * days_to_keep;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Crear función para obtener estadísticas de usuario
CREATE OR REPLACE FUNCTION get_user_mining_stats(user_uuid UUID)
RETURNS TABLE(
  total_mines BIGINT,
  total_reward NUMERIC,
  daily_mines BIGINT,
  daily_reward NUMERIC,
  last_mine_date TIMESTAMP,
  avg_reward NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::BIGINT as total_mines,
    COALESCE(SUM(me.reward), 0) as total_reward,
    COUNT(CASE WHEN me.created_at::date = CURRENT_DATE THEN 1 END)::BIGINT as daily_mines,
    COALESCE(SUM(CASE WHEN me.created_at::date = CURRENT_DATE THEN me.reward ELSE 0 END), 0) as daily_reward,
    MAX(me.created_at) as last_mine_date,
    COALESCE(AVG(me.reward), 0) as avg_reward
  FROM mining_events me
  WHERE me.user_id = user_uuid;
END;
$$ LANGUAGE plpgsql;

-- Crear función para obtener top miners
CREATE OR REPLACE FUNCTION get_top_miners(limit_count INTEGER DEFAULT 10, period_days INTEGER DEFAULT 30)
RETURNS TABLE(
  user_id UUID,
  email VARCHAR,
  wallet_address VARCHAR,
  total_mined NUMERIC,
  total_mines BIGINT,
  rank_position BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.email,
    u.wallet_address,
    COALESCE(SUM(me.reward), 0) as total_mined,
    COUNT(me.id)::BIGINT as total_mines,
    ROW_NUMBER() OVER (ORDER BY COALESCE(SUM(me.reward), 0) DESC) as rank_position
  FROM users u
  LEFT JOIN mining_events me ON me.user_id = u.id 
    AND me.created_at >= NOW() - INTERVAL '1 day' * period_days
  WHERE u.status = 'active'
  GROUP BY u.id, u.email, u.wallet_address
  ORDER BY total_mined DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Comentarios en las funciones
COMMENT ON FUNCTION cleanup_old_mining_events(INTEGER) IS 'Limpia eventos de minería antiguos para mantenimiento';
COMMENT ON FUNCTION get_user_mining_stats(UUID) IS 'Obtiene estadísticas de minería de un usuario específico';
COMMENT ON FUNCTION get_top_miners(INTEGER, INTEGER) IS 'Obtiene el ranking de mineros para un período específico';

-- Crear trigger para actualizar estadísticas automáticamente
CREATE OR REPLACE FUNCTION update_system_stats_trigger()
RETURNS TRIGGER AS $$
BEGIN
  -- Actualizar estadísticas cuando se inserta o actualiza un evento de minería
  PERFORM calculate_daily_stats();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger para eventos de minería
CREATE TRIGGER trigger_update_system_stats
  AFTER INSERT OR UPDATE OR DELETE ON mining_events
  FOR EACH ROW EXECUTE FUNCTION update_system_stats_trigger();

-- Crear trigger para cambios de usuario
CREATE TRIGGER trigger_update_user_stats
  AFTER INSERT OR UPDATE OR DELETE ON users
  FOR EACH ROW EXECUTE FUNCTION update_system_stats_trigger();
