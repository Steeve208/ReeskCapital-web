-- ============================================
-- PROCESADOR AUTOMÁTICO DE MINERÍA EN SUPABASE
-- ============================================
-- Esta función procesa automáticamente todas las sesiones de minería activas
-- Se ejecuta cada minuto usando pg_cron
-- Funciona incluso si el usuario cierra la web

-- Configuración
-- TOKENS_PER_SECOND_BASE = 0.000116 RSC/s (10 RSC por día con 1000 H/s)
-- SESSION_DURATION = 24 horas

-- ============================================
-- FUNCIÓN: Procesar todas las sesiones activas
-- ============================================

CREATE OR REPLACE FUNCTION process_active_mining_sessions()
RETURNS TABLE(
    sessions_processed INTEGER,
    total_tokens_added DECIMAL,
    sessions_completed INTEGER
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_session RECORD;
    v_now TIMESTAMP WITH TIME ZONE;
    v_start_time TIMESTAMP WITH TIME ZONE;
    v_last_update TIMESTAMP WITH TIME ZONE;
    v_elapsed_ms BIGINT;
    v_elapsed_seconds INTEGER;
    v_time_since_last_update INTEGER;
    v_hash_rate DECIMAL;
    v_efficiency DECIMAL;
    v_tokens_per_second DECIMAL;
    v_new_tokens DECIMAL;
    v_current_tokens DECIMAL;
    v_total_tokens DECIMAL;
    v_balance_before DECIMAL;
    v_balance_after DECIMAL;
    v_sessions_processed INTEGER := 0;
    v_total_tokens_added DECIMAL := 0;
    v_sessions_completed INTEGER := 0;
    v_session_duration_ms BIGINT := 24 * 60 * 60 * 1000; -- 24 horas
    v_tokens_per_second_base DECIMAL := 0.000116; -- RSC por segundo base
BEGIN
    v_now := NOW();
    
    -- Procesar cada sesión activa
    FOR v_session IN 
        SELECT 
            id,
            user_id,
            COALESCE(session_id::text, session_uuid::text, id::text) as session_id,
            start_time,
            COALESCE(hash_rate::numeric, hash_power::numeric, 1000) as hash_rate,
            COALESCE(tokens_mined::numeric, tokens_earned::numeric, 0) as tokens_mined,
            COALESCE(efficiency::numeric, 100) as efficiency,
            COALESCE(updated_at, created_at, start_time) as last_update
        FROM mining_sessions
        WHERE status = 'active'
        ORDER BY start_time ASC
    LOOP
        BEGIN
            v_start_time := v_session.start_time;
            v_elapsed_ms := EXTRACT(EPOCH FROM (v_now - v_start_time)) * 1000;
            
            -- Verificar si la sesión ha cumplido 24 horas
            IF v_elapsed_ms >= v_session_duration_ms THEN
                -- Detener sesión automáticamente
                UPDATE mining_sessions
                SET 
                    end_time = v_now,
                    duration_ms = v_elapsed_ms,
                    status = 'completed',
                    updated_at = v_now
                WHERE id = v_session.id;
                
                v_sessions_completed := v_sessions_completed + 1;
                CONTINUE; -- Pasar a la siguiente sesión
            END IF;
            
            -- Calcular tiempo desde última actualización
            v_last_update := v_session.last_update;
            v_time_since_last_update := EXTRACT(EPOCH FROM (v_now - v_last_update))::INTEGER;
            
            -- No actualizar si han pasado menos de 30 segundos
            IF v_time_since_last_update < 30 THEN
                CONTINUE;
            END IF;
            
            -- Calcular tokens basado en hash rate y tiempo
            v_hash_rate := v_session.hash_rate;
            v_efficiency := v_session.efficiency;
            v_tokens_per_second := (v_hash_rate / 1000) * v_tokens_per_second_base * (v_efficiency / 100);
            v_new_tokens := v_tokens_per_second * v_time_since_last_update;
            
            -- Asegurar que no se generen tokens negativos
            IF v_new_tokens <= 0 THEN
                CONTINUE;
            END IF;
            
            -- Obtener tokens minados actuales
            v_current_tokens := v_session.tokens_mined;
            v_total_tokens := v_current_tokens + v_new_tokens;
            
            -- Actualizar sesión con nuevos tokens
            UPDATE mining_sessions
            SET 
                tokens_mined = v_total_tokens,
                updated_at = v_now
            WHERE id = v_session.id;
            
            -- Actualizar balance del usuario
            SELECT balance INTO v_balance_before
            FROM users
            WHERE id = v_session.user_id;
            
            v_balance_after := v_balance_before + v_new_tokens;
            
            UPDATE users
            SET 
                balance = v_balance_after,
                updated_at = v_now
            WHERE id = v_session.user_id;
            
            -- Crear transacción de minería
            INSERT INTO transactions (
                user_id, 
                type, 
                amount, 
                balance_before, 
                balance_after, 
                reference_id, 
                reference_type, 
                description, 
                status
            ) VALUES (
                v_session.user_id,
                'mining',
                v_new_tokens,
                v_balance_before,
                v_balance_after,
                v_session.id,
                'mining_session',
                'Mining reward - ' || v_new_tokens::text || ' RSC',
                'completed'
            );
            
            -- Procesar comisión de referido (10%)
            PERFORM process_referral_commission_for_mining(v_session.user_id, v_new_tokens);
            
            -- Actualizar contadores
            v_sessions_processed := v_sessions_processed + 1;
            v_total_tokens_added := v_total_tokens_added + v_new_tokens;
            
        EXCEPTION WHEN OTHERS THEN
            -- Continuar con la siguiente sesión si hay error
            RAISE WARNING 'Error procesando sesión %: %', v_session.id, SQLERRM;
            CONTINUE;
        END;
    END LOOP;
    
    -- Retornar resultados
    RETURN QUERY SELECT 
        v_sessions_processed,
        v_total_tokens_added,
        v_sessions_completed;
END;
$$;

-- ============================================
-- FUNCIÓN AUXILIAR: Procesar comisión de referido
-- ============================================

CREATE OR REPLACE FUNCTION process_referral_commission_for_mining(
    p_user_id UUID,
    p_amount DECIMAL
)
RETURNS DECIMAL
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_referrer_id UUID;
    v_commission_rate DECIMAL := 0.1; -- 10%
    v_commission_amount DECIMAL;
    v_balance_before DECIMAL;
    v_balance_after DECIMAL;
BEGIN
    -- Obtener referrer del usuario
    SELECT referred_by INTO v_referrer_id
    FROM users
    WHERE id = p_user_id;
    
    -- Si no tiene referrer, retornar 0
    IF v_referrer_id IS NULL THEN
        RETURN 0;
    END IF;
    
    -- Calcular comisión
    v_commission_amount := p_amount * v_commission_rate;
    
    IF v_commission_amount <= 0 THEN
        RETURN 0;
    END IF;
    
    -- Obtener balance del referrer
    SELECT balance INTO v_balance_before
    FROM users
    WHERE id = v_referrer_id;
    
    v_balance_after := v_balance_before + v_commission_amount;
    
    -- Actualizar balance del referrer
    UPDATE users
    SET 
        balance = v_balance_after,
        updated_at = NOW()
    WHERE id = v_referrer_id;
    
    -- Actualizar comisión total en referrals
    UPDATE referrals
    SET 
        total_commission = COALESCE(total_commission, 0) + v_commission_amount,
        updated_at = NOW()
    WHERE referrer_id = v_referrer_id AND referred_id = p_user_id;
    
    -- Crear transacción de comisión
    INSERT INTO transactions (
        user_id,
        type,
        amount,
        balance_before,
        balance_after,
        reference_id,
        reference_type,
        description,
        status
    ) VALUES (
        v_referrer_id,
        'referral_commission',
        v_commission_amount,
        v_balance_before,
        v_balance_after,
        p_user_id,
        'referral',
        'Commission from referred user mining',
        'completed'
    );
    
    RETURN v_commission_amount;
END;
$$;

-- ============================================
-- CONFIGURAR PG_CRON PARA EJECUTAR CADA MINUTO
-- ============================================
-- ⚠️ NOTA: Este procesador automático está DESHABILITADO
-- El sistema funciona completamente desde el frontend (local)
-- y sincroniza con Supabase periódicamente
-- 
-- Si en el futuro quieres habilitar el procesador automático,
-- descomenta las siguientes líneas:

/*
-- Eliminar cron job existente si existe
SELECT cron.unschedule('process-mining-sessions');

-- Crear cron job para ejecutar cada minuto
SELECT cron.schedule(
    'process-mining-sessions',           -- Nombre del job
    '* * * * *',                         -- Cada minuto (cron syntax)
    $$SELECT process_active_mining_sessions();$$
);
*/

-- ============================================
-- VERIFICAR QUE EL CRON JOB ESTÁ CONFIGURADO
-- ============================================
-- Ejecutar esto para ver los cron jobs activos:
-- SELECT * FROM cron.job;

-- ============================================
-- EJECUTAR MANUALMENTE (PARA PRUEBAS)
-- ============================================
-- SELECT * FROM process_active_mining_sessions();

