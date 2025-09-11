-- ===== VERIFICAR BACKEND COMPLETO =====
-- Ejecutar este script para verificar que todo esté funcionando

-- 1. Verificar que las tablas existen
SELECT 'TABLAS' as tipo, table_name as nombre
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'referrals', 'mining_sessions', 'transactions', 'referral_codes')
ORDER BY table_name;

-- 2. Verificar que las funciones existen
SELECT 'FUNCIONES' as tipo, routine_name as nombre
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('register_user', 'update_user_balance', 'process_referral_commission', 'generate_referral_code')
ORDER BY routine_name;

-- 3. Probar función generate_referral_code
SELECT 'TEST' as tipo, 'generate_referral_code' as nombre, generate_referral_code() as resultado;

-- 4. Probar función register_user
SELECT 'TEST' as tipo, 'register_user' as nombre, register_user(
    'test_backend@rscchain.com',
    'testbackend',
    NULL
) as resultado;

-- 5. Verificar que el usuario se creó
SELECT 'USUARIO_CREADO' as tipo, id, email, username, referral_code, created_at
FROM users 
WHERE email = 'test_backend@rscchain.com';

-- 6. Probar función update_user_balance
SELECT 'TEST' as tipo, 'update_user_balance' as nombre, update_user_balance(
    (SELECT id FROM users WHERE email = 'test_backend@rscchain.com'),
    0.001,
    'mining',
    'Test mining transaction'
) as resultado;

-- 7. Verificar transacción creada
SELECT 'TRANSACCION_CREADA' as tipo, id, user_id, type, amount, created_at
FROM transactions 
WHERE user_id = (SELECT id FROM users WHERE email = 'test_backend@rscchain.com')
ORDER BY created_at DESC
LIMIT 1;

-- 8. Limpiar datos de prueba
DELETE FROM transactions WHERE user_id = (SELECT id FROM users WHERE email = 'test_backend@rscchain.com');
DELETE FROM users WHERE email = 'test_backend@rscchain.com';

-- 9. Verificar políticas RLS
SELECT 'POLITICAS_RLS' as tipo, schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'referrals', 'mining_sessions', 'transactions', 'referral_codes')
ORDER BY tablename, policyname;
