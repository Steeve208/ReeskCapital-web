-- ============================================
-- ENABLE ROW LEVEL SECURITY (RLS) FOR ALL TABLES
-- ============================================
-- Este script habilita RLS y crea políticas de seguridad para todas las tablas

-- ===== USERS TABLE =====
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios solo pueden ver y editar sus propios datos
DROP POLICY IF EXISTS "Users can view own data" ON users;
CREATE POLICY "Users can view own data" ON users
    FOR SELECT
    USING (auth.uid()::text = id::text OR id::text = current_setting('request.jwt.claims', true)::json->>'user_id');

DROP POLICY IF EXISTS "Users can update own data" ON users;
CREATE POLICY "Users can update own data" ON users
    FOR UPDATE
    USING (auth.uid()::text = id::text OR id::text = current_setting('request.jwt.claims', true)::json->>'user_id');

-- Permitir inserción de nuevos usuarios (registro)
DROP POLICY IF EXISTS "Anyone can insert users" ON users;
CREATE POLICY "Anyone can insert users" ON users
    FOR INSERT
    WITH CHECK (true);

-- ===== MINING_SESSIONS TABLE =====
ALTER TABLE mining_sessions ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios solo pueden ver y gestionar sus propias sesiones
DROP POLICY IF EXISTS "Users can view own mining sessions" ON mining_sessions;
CREATE POLICY "Users can view own mining sessions" ON mining_sessions
    FOR SELECT
    USING (user_id::text = current_setting('request.jwt.claims', true)::json->>'user_id');

DROP POLICY IF EXISTS "Users can insert own mining sessions" ON mining_sessions;
CREATE POLICY "Users can insert own mining sessions" ON mining_sessions
    FOR INSERT
    WITH CHECK (user_id::text = current_setting('request.jwt.claims', true)::json->>'user_id');

DROP POLICY IF EXISTS "Users can update own mining sessions" ON mining_sessions;
CREATE POLICY "Users can update own mining sessions" ON mining_sessions
    FOR UPDATE
    USING (user_id::text = current_setting('request.jwt.claims', true)::json->>'user_id');

-- ===== TRANSACTIONS TABLE =====
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios solo pueden ver sus propias transacciones
DROP POLICY IF EXISTS "Users can view own transactions" ON transactions;
CREATE POLICY "Users can view own transactions" ON transactions
    FOR SELECT
    USING (user_id::text = current_setting('request.jwt.claims', true)::json->>'user_id');

DROP POLICY IF EXISTS "Users can insert own transactions" ON transactions;
CREATE POLICY "Users can insert own transactions" ON transactions
    FOR INSERT
    WITH CHECK (user_id::text = current_setting('request.jwt.claims', true)::json->>'user_id');

-- ===== REFERRALS TABLE =====
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios pueden ver referidos donde son referrer o referred
DROP POLICY IF EXISTS "Users can view own referrals" ON referrals;
CREATE POLICY "Users can view own referrals" ON referrals
    FOR SELECT
    USING (
        referrer_id::text = current_setting('request.jwt.claims', true)::json->>'user_id' OR
        referred_id::text = current_setting('request.jwt.claims', true)::json->>'user_id'
    );

DROP POLICY IF EXISTS "System can insert referrals" ON referrals;
CREATE POLICY "System can insert referrals" ON referrals
    FOR INSERT
    WITH CHECK (true);

-- ===== REFERRAL_CODES TABLE =====
ALTER TABLE referral_codes ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios pueden ver todos los códigos (para validación)
DROP POLICY IF EXISTS "Users can view referral codes" ON referral_codes;
CREATE POLICY "Users can view referral codes" ON referral_codes
    FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "System can insert referral codes" ON referral_codes;
CREATE POLICY "System can insert referral codes" ON referral_codes
    FOR INSERT
    WITH CHECK (true);

-- ===== POOLS TABLE =====
ALTER TABLE pools ENABLE ROW LEVEL SECURITY;

-- Política: Todos pueden ver pools activos
DROP POLICY IF EXISTS "Anyone can view active pools" ON pools;
CREATE POLICY "Anyone can view active pools" ON pools
    FOR SELECT
    USING (status = 'active');

-- ===== USER_POOLS TABLE =====
ALTER TABLE user_pools ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios solo pueden gestionar sus propios pools
DROP POLICY IF EXISTS "Users can view own user pools" ON user_pools;
CREATE POLICY "Users can view own user pools" ON user_pools
    FOR SELECT
    USING (user_id::text = current_setting('request.jwt.claims', true)::json->>'user_id');

DROP POLICY IF EXISTS "Users can insert own user pools" ON user_pools;
CREATE POLICY "Users can insert own user pools" ON user_pools
    FOR INSERT
    WITH CHECK (user_id::text = current_setting('request.jwt.claims', true)::json->>'user_id');

DROP POLICY IF EXISTS "Users can update own user pools" ON user_pools;
CREATE POLICY "Users can update own user pools" ON user_pools
    FOR UPDATE
    USING (user_id::text = current_setting('request.jwt.claims', true)::json->>'user_id');

DROP POLICY IF EXISTS "Users can delete own user pools" ON user_pools;
CREATE POLICY "Users can delete own user pools" ON user_pools
    FOR DELETE
    USING (user_id::text = current_setting('request.jwt.claims', true)::json->>'user_id');

-- ===== WITHDRAWALS TABLE =====
ALTER TABLE withdrawals ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios solo pueden ver y crear sus propios retiros
DROP POLICY IF EXISTS "Users can view own withdrawals" ON withdrawals;
CREATE POLICY "Users can view own withdrawals" ON withdrawals
    FOR SELECT
    USING (user_id::text = current_setting('request.jwt.claims', true)::json->>'user_id');

DROP POLICY IF EXISTS "Users can insert own withdrawals" ON withdrawals;
CREATE POLICY "Users can insert own withdrawals" ON withdrawals
    FOR INSERT
    WITH CHECK (user_id::text = current_setting('request.jwt.claims', true)::json->>'user_id');

-- ===== API_KEYS TABLE =====
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios solo pueden gestionar sus propias API keys
DROP POLICY IF EXISTS "Users can view own api keys" ON api_keys;
CREATE POLICY "Users can view own api keys" ON api_keys
    FOR SELECT
    USING (user_id::text = current_setting('request.jwt.claims', true)::json->>'user_id');

DROP POLICY IF EXISTS "Users can insert own api keys" ON api_keys;
CREATE POLICY "Users can insert own api keys" ON api_keys
    FOR INSERT
    WITH CHECK (user_id::text = current_setting('request.jwt.claims', true)::json->>'user_id');

DROP POLICY IF EXISTS "Users can update own api keys" ON api_keys;
CREATE POLICY "Users can update own api keys" ON api_keys
    FOR UPDATE
    USING (user_id::text = current_setting('request.jwt.claims', true)::json->>'user_id');

DROP POLICY IF EXISTS "Users can delete own api keys" ON api_keys;
CREATE POLICY "Users can delete own api keys" ON api_keys
    FOR DELETE
    USING (user_id::text = current_setting('request.jwt.claims', true)::json->>'user_id');

-- ===== WEBHOOKS TABLE =====
ALTER TABLE webhooks ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios solo pueden gestionar sus propios webhooks
DROP POLICY IF EXISTS "Users can view own webhooks" ON webhooks;
CREATE POLICY "Users can view own webhooks" ON webhooks
    FOR SELECT
    USING (user_id::text = current_setting('request.jwt.claims', true)::json->>'user_id');

DROP POLICY IF EXISTS "Users can insert own webhooks" ON webhooks;
CREATE POLICY "Users can insert own webhooks" ON webhooks
    FOR INSERT
    WITH CHECK (user_id::text = current_setting('request.jwt.claims', true)::json->>'user_id');

DROP POLICY IF EXISTS "Users can update own webhooks" ON webhooks;
CREATE POLICY "Users can update own webhooks" ON webhooks
    FOR UPDATE
    USING (user_id::text = current_setting('request.jwt.claims', true)::json->>'user_id');

DROP POLICY IF EXISTS "Users can delete own webhooks" ON webhooks;
CREATE POLICY "Users can delete own webhooks" ON webhooks
    FOR DELETE
    USING (user_id::text = current_setting('request.jwt.claims', true)::json->>'user_id');

-- ===== SUPPORT_TICKETS TABLE =====
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios solo pueden ver y gestionar sus propios tickets
DROP POLICY IF EXISTS "Users can view own support tickets" ON support_tickets;
CREATE POLICY "Users can view own support tickets" ON support_tickets
    FOR SELECT
    USING (user_id::text = current_setting('request.jwt.claims', true)::json->>'user_id');

DROP POLICY IF EXISTS "Users can insert own support tickets" ON support_tickets;
CREATE POLICY "Users can insert own support tickets" ON support_tickets
    FOR INSERT
    WITH CHECK (user_id::text = current_setting('request.jwt.claims', true)::json->>'user_id');

DROP POLICY IF EXISTS "Users can update own support tickets" ON support_tickets;
CREATE POLICY "Users can update own support tickets" ON support_tickets
    FOR UPDATE
    USING (user_id::text = current_setting('request.jwt.claims', true)::json->>'user_id');

-- ===== NOTIFICATIONS TABLE =====
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios solo pueden ver sus propias notificaciones
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
CREATE POLICY "Users can view own notifications" ON notifications
    FOR SELECT
    USING (user_id::text = current_setting('request.jwt.claims', true)::json->>'user_id');

DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
CREATE POLICY "Users can update own notifications" ON notifications
    FOR UPDATE
    USING (user_id::text = current_setting('request.jwt.claims', true)::json->>'user_id');

-- ===== MINING_STATS TABLE =====
ALTER TABLE mining_stats ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios solo pueden ver sus propias estadísticas
DROP POLICY IF EXISTS "Users can view own mining stats" ON mining_stats;
CREATE POLICY "Users can view own mining stats" ON mining_stats
    FOR SELECT
    USING (user_id::text = current_setting('request.jwt.claims', true)::json->>'user_id');

DROP POLICY IF EXISTS "System can insert mining stats" ON mining_stats;
CREATE POLICY "System can insert mining stats" ON mining_stats
    FOR INSERT
    WITH CHECK (true);

-- ===== USER_LEVELS TABLE =====
ALTER TABLE user_levels ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios solo pueden ver sus propios niveles
DROP POLICY IF EXISTS "Users can view own user levels" ON user_levels;
CREATE POLICY "Users can view own user levels" ON user_levels
    FOR SELECT
    USING (user_id::text = current_setting('request.jwt.claims', true)::json->>'user_id');

-- ===== USER_ALGORITHMS TABLE =====
ALTER TABLE user_algorithms ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios solo pueden gestionar sus propios algoritmos
DROP POLICY IF EXISTS "Users can view own user algorithms" ON user_algorithms;
CREATE POLICY "Users can view own user algorithms" ON user_algorithms
    FOR SELECT
    USING (user_id::text = current_setting('request.jwt.claims', true)::json->>'user_id');

DROP POLICY IF EXISTS "Users can insert own user algorithms" ON user_algorithms;
CREATE POLICY "Users can insert own user algorithms" ON user_algorithms
    FOR INSERT
    WITH CHECK (user_id::text = current_setting('request.jwt.claims', true)::json->>'user_id');

DROP POLICY IF EXISTS "Users can update own user algorithms" ON user_algorithms;
CREATE POLICY "Users can update own user algorithms" ON user_algorithms
    FOR UPDATE
    USING (user_id::text = current_setting('request.jwt.claims', true)::json->>'user_id');

-- ===== USER_EQUIPMENT TABLE =====
ALTER TABLE user_equipment ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios solo pueden gestionar su propio equipo
DROP POLICY IF EXISTS "Users can view own user equipment" ON user_equipment;
CREATE POLICY "Users can view own user equipment" ON user_equipment
    FOR SELECT
    USING (user_id::text = current_setting('request.jwt.claims', true)::json->>'user_id');

DROP POLICY IF EXISTS "Users can insert own user equipment" ON user_equipment;
CREATE POLICY "Users can insert own user equipment" ON user_equipment
    FOR INSERT
    WITH CHECK (user_id::text = current_setting('request.jwt.claims', true)::json->>'user_id');

DROP POLICY IF EXISTS "Users can update own user equipment" ON user_equipment;
CREATE POLICY "Users can update own user equipment" ON user_equipment
    FOR UPDATE
    USING (user_id::text = current_setting('request.jwt.claims', true)::json->>'user_id');

-- ===== TELEGRAM_ACTIVITY TABLE =====
ALTER TABLE telegram_activity ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios solo pueden ver su propia actividad de Telegram
DROP POLICY IF EXISTS "Users can view own telegram activity" ON telegram_activity;
CREATE POLICY "Users can view own telegram activity" ON telegram_activity
    FOR SELECT
    USING (user_id::text = current_setting('request.jwt.claims', true)::json->>'user_id');

-- ============================================
-- VERIFICACIÓN
-- ============================================
-- Ejecuta esto para verificar que RLS está habilitado:
-- SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename IN (
--     'users', 'mining_sessions', 'transactions', 'referrals', 'pools', 
--     'user_pools', 'withdrawals', 'api_keys', 'webhooks', 'support_tickets', 
--     'notifications', 'mining_stats', 'user_levels', 'user_algorithms', 'user_equipment'
-- );

