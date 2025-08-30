-- Script de Debug para RSC Chain Mining Platform
-- Ejecuta esto en el SQL Editor de Supabase

-- 1. Verificar estructura exacta de la tabla users_balances
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'users_balances' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Verificar si hay restricciones o triggers
SELECT 
    constraint_name,
    constraint_type,
    table_name
FROM information_schema.table_constraints 
WHERE table_name = 'users_balances' 
AND table_schema = 'public';

-- 3. Verificar si RLS está habilitado
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'users_balances';

-- 4. Intentar insertar un usuario de prueba
INSERT INTO users_balances (
    email,
    balance,
    total_mined,
    total_mining_time,
    sessions_today,
    daily_limit_used
) VALUES (
    'test@example.com',
    0.0,
    0.0,
    0,
    0,
    0.0
) RETURNING *;

-- 5. Verificar que el usuario se insertó
SELECT * FROM users_balances WHERE email = 'test@example.com';

-- 6. Limpiar usuario de prueba
DELETE FROM users_balances WHERE email = 'test@example.com';
