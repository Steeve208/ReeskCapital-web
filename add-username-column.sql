-- Agregar columna username a la tabla users_balances
-- Ejecuta esto en el SQL Editor de Supabase

-- 1. Agregar columna username
ALTER TABLE users_balances 
ADD COLUMN IF NOT EXISTS username VARCHAR(50) UNIQUE;

-- 2. Agregar índice para búsquedas por username
CREATE INDEX IF NOT EXISTS idx_users_balances_username ON users_balances(username);

-- 3. Verificar la nueva estructura
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'users_balances' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 4. Actualizar usuarios existentes (si los hay) con un username temporal
UPDATE users_balances 
SET username = 'user_' || id::text 
WHERE username IS NULL;

-- 5. Hacer username NOT NULL después de actualizar
ALTER TABLE users_balances 
ALTER COLUMN username SET NOT NULL;
