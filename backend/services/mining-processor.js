/**
 * 🔄 PROCESADOR AUTOMÁTICO DE MINERÍA
 * 
 * Este servicio procesa automáticamente todas las sesiones de minería activas:
 * - Calcula tokens basado en tiempo transcurrido
 * - Actualiza el balance del usuario en tiempo real
 * - Detiene sesiones que han cumplido 24 horas
 * - Funciona incluso si el usuario cierra la web
 */

const { pool } = require('../config/database');

// Configuración
const PROCESSING_INTERVAL = 60000; // Procesar cada 1 minuto
const SESSION_DURATION_MS = 24 * 60 * 60 * 1000; // 24 horas
const TOKENS_PER_SECOND_BASE = 0.000116; // RSC por segundo base (10 RSC por día con 1000 H/s)

let processingInterval = null;
let isProcessing = false;

/**
 * Iniciar procesador automático
 */
function startMiningProcessor() {
  if (processingInterval) {
    console.log('⚠️ Procesador de minería ya está corriendo');
    return;
  }

  console.log('🔄 Iniciando procesador automático de minería...');
  console.log(`⏱️  Intervalo de procesamiento: ${PROCESSING_INTERVAL / 1000} segundos`);
  
  // Procesar inmediatamente al iniciar
  processActiveMiningSessions();
  
  // Configurar intervalo periódico
  processingInterval = setInterval(() => {
    processActiveMiningSessions();
  }, PROCESSING_INTERVAL);
  
  console.log('✅ Procesador automático de minería iniciado');
}

/**
 * Detener procesador automático
 */
function stopMiningProcessor() {
  if (processingInterval) {
    clearInterval(processingInterval);
    processingInterval = null;
    console.log('⏹️ Procesador automático de minería detenido');
  }
}

/**
 * Procesar todas las sesiones de minería activas
 */
async function processActiveMiningSessions() {
  if (isProcessing) {
    console.log('⏳ Procesamiento ya en curso, omitiendo...');
    return;
  }

  isProcessing = true;
  
  try {
    // Obtener todas las sesiones activas
    // Usar COALESCE para compatibilidad con diferentes esquemas
    const activeSessions = await pool.query(
      `SELECT 
         id,
         user_id,
         COALESCE(session_id::text, session_uuid::text, id::text) as session_id,
         start_time,
         COALESCE(hash_rate::numeric, hash_power::numeric, 1000) as hash_rate,
         COALESCE(tokens_mined::numeric, tokens_earned::numeric, 0) as tokens_mined,
         COALESCE(efficiency::numeric, 100) as efficiency,
         COALESCE(updated_at, created_at) as updated_at,
         created_at,
         status
       FROM mining_sessions 
       WHERE status = 'active' 
       ORDER BY start_time ASC`
    );

    if (activeSessions.rows.length === 0) {
      isProcessing = false;
      return;
    }

    console.log(`🔄 Procesando ${activeSessions.rows.length} sesión(es) activa(s)...`);

    const now = new Date();
    
    for (const session of activeSessions.rows) {
      try {
        await processMiningSession(session, now);
      } catch (error) {
        console.error(`❌ Error procesando sesión ${session.session_id}:`, error);
        // Continuar con la siguiente sesión
      }
    }

    console.log(`✅ Procesamiento completado: ${activeSessions.rows.length} sesión(es)`);
    
  } catch (error) {
    console.error('❌ Error en procesador automático:', error);
  } finally {
    isProcessing = false;
  }
}

/**
 * Procesar una sesión de minería individual
 */
async function processMiningSession(session, currentTime) {
  const startTime = new Date(session.start_time);
  const elapsedMs = currentTime - startTime;
  const elapsedSeconds = Math.floor(elapsedMs / 1000);
  
  // Verificar si la sesión ha cumplido 24 horas
  if (elapsedMs >= SESSION_DURATION_MS) {
    const sessionId = session.session_id || session.session_uuid || session.id;
    console.log(`⏰ Sesión ${sessionId} ha cumplido 24 horas, deteniendo...`);
    await stopMiningSession(session);
    return;
  }

  // Calcular tokens minados desde la última actualización
  const lastUpdate = session.updated_at ? new Date(session.updated_at) : 
                     session.created_at ? new Date(session.created_at) : startTime;
  const timeSinceLastUpdate = Math.floor((currentTime - lastUpdate) / 1000); // segundos
  
  if (timeSinceLastUpdate < 30) {
    // No actualizar si han pasado menos de 30 segundos
    return;
  }

  // Calcular tokens basado en hash rate y tiempo
  // Usar hash_rate si existe, sino hash_power (compatibilidad con esquema antiguo)
  const hashRate = parseFloat(session.hash_rate || session.hash_power || 1000);
  const efficiency = parseFloat(session.efficiency || 100);
  
  // Fórmula: tokens = (hash_rate / 1000) * tokens_per_second * tiempo * (efficiency / 100)
  // TOKENS_PER_SECOND_BASE = 0.000116 RSC/s (10 RSC por día con 1000 H/s)
  // Con 1000 H/s = 0.000116 RSC/s = 0.00696 RSC/min = 0.4176 RSC/hora = 10.0224 RSC/día
  const tokensPerSecond = (hashRate / 1000) * TOKENS_PER_SECOND_BASE * (efficiency / 100);
  const newTokens = tokensPerSecond * timeSinceLastUpdate;
  
  // Asegurar que no se generen tokens negativos
  if (newTokens <= 0) {
    return;
  }
  
  // Obtener tokens minados actuales (usar tokens_mined o tokens_earned según el esquema)
  const currentTokensMined = parseFloat(session.tokens_mined || session.tokens_earned || 0);
  const totalTokensMined = currentTokensMined + newTokens;

  // Actualizar sesión con nuevos tokens (usar campos disponibles)
  const updateFields = [];
  const updateValues = [];
  
  if (session.tokens_mined !== undefined) {
    updateFields.push('tokens_mined = $' + (updateValues.length + 1));
    updateValues.push(totalTokensMined);
  } else if (session.tokens_earned !== undefined) {
    updateFields.push('tokens_earned = $' + (updateValues.length + 1));
    updateValues.push(totalTokensMined);
  }
  
  if (session.updated_at !== undefined) {
    updateFields.push('updated_at = $' + (updateValues.length + 1));
    updateValues.push(currentTime);
  }
  
  updateValues.push(session.id);
  
  if (updateFields.length > 0) {
    await pool.query(
      `UPDATE mining_sessions 
       SET ${updateFields.join(', ')}
       WHERE id = $${updateValues.length}`,
      updateValues
    );
  }

  // Actualizar balance del usuario
  await updateUserBalance(session.user_id, newTokens, session.id);

  const sessionId = session.session_id || session.session_uuid || session.id;
  console.log(`💰 Sesión ${sessionId}: +${newTokens.toFixed(6)} RSC (Total: ${totalTokensMined.toFixed(6)} RSC)`);
}

/**
 * Actualizar balance del usuario
 */
async function updateUserBalance(userId, tokensToAdd, sessionId) {
  if (tokensToAdd <= 0) return;

  try {
    // Obtener balance actual
    const userResult = await pool.query(
      `SELECT balance FROM users WHERE id = $1`,
      [userId]
    );

    if (userResult.rows.length === 0) {
      console.warn(`⚠️ Usuario ${userId} no encontrado`);
      return;
    }

    const balanceBefore = parseFloat(userResult.rows[0].balance || 0);
    const balanceAfter = balanceBefore + tokensToAdd;

    // Actualizar balance
    await pool.query(
      `UPDATE users SET balance = $1, updated_at = NOW() WHERE id = $2`,
      [balanceAfter, userId]
    );

    // Crear transacción de minería
    await pool.query(
      `INSERT INTO transactions 
       (user_id, type, amount, balance_before, balance_after, reference_id, reference_type, description, status)
       VALUES ($1, 'mining', $2, $3, $4, $5, 'mining_session', $6, 'completed')`,
      [
        userId,
        tokensToAdd,
        balanceBefore,
        balanceAfter,
        sessionId,
        `Mining reward - ${tokensToAdd.toFixed(6)} RSC`
      ]
    );

    // Procesar comisiones de referidos (10% de los tokens minados)
    await processReferralCommission(userId, tokensToAdd);

  } catch (error) {
    console.error(`❌ Error actualizando balance para usuario ${userId}:`, error);
    throw error;
  }
}

/**
 * Detener sesión de minería automáticamente (24 horas cumplidas)
 */
async function stopMiningSession(session) {
  try {
    const endTime = new Date();
    const startTime = new Date(session.start_time);
    const durationMs = endTime - startTime;
    const tokensMined = parseFloat(session.tokens_mined || 0);

    // Actualizar sesión a completada
    await pool.query(
      `UPDATE mining_sessions 
       SET end_time = $1, duration_ms = $2, status = 'completed', updated_at = NOW()
       WHERE id = $3`,
      [endTime, durationMs, session.id]
    );

    // Asegurar que el balance final esté actualizado
    if (tokensMined > 0) {
      await updateUserBalance(session.user_id, 0, session.id); // Solo para asegurar última actualización
    }

    const sessionId = session.session_id || session.session_uuid || session.id;
    console.log(`✅ Sesión ${sessionId} detenida automáticamente después de 24 horas`);
    console.log(`   Tokens minados: ${tokensMined.toFixed(6)} RSC`);
    console.log(`   Duración: ${Math.floor(durationMs / 1000 / 60)} minutos`);

  } catch (error) {
    console.error(`❌ Error deteniendo sesión ${session.session_id}:`, error);
    throw error;
  }
}

/**
 * Procesar comisión de referido
 */
async function processReferralCommission(userId, amount) {
  try {
    // Obtener usuario y su referrer
    const userResult = await pool.query(
      `SELECT referred_by FROM users WHERE id = $1`,
      [userId]
    );

    if (userResult.rows.length === 0 || !userResult.rows[0].referred_by) {
      return; // No tiene referrer
    }

    const referrerId = userResult.rows[0].referred_by;

    // Obtener tasa de comisión (10% por defecto)
    const referralResult = await pool.query(
      `SELECT commission_rate FROM referrals 
       WHERE referrer_id = $1 AND referred_id = $2`,
      [referrerId, userId]
    );

    const commissionRate = referralResult.rows.length > 0 
      ? parseFloat(referralResult.rows[0].commission_rate || 0.1)
      : 0.1; // 10% por defecto

    const commissionAmount = amount * commissionRate;

    if (commissionAmount <= 0) return;

    // Obtener balance del referrer
    const referrerBalanceResult = await pool.query(
      `SELECT balance FROM users WHERE id = $1`,
      [referrerId]
    );

    if (referrerBalanceResult.rows.length === 0) {
      return;
    }

    const balanceBefore = parseFloat(referrerBalanceResult.rows[0].balance || 0);
    const balanceAfter = balanceBefore + commissionAmount;

    // Actualizar balance del referrer
    await pool.query(
      `UPDATE users SET balance = $1, updated_at = NOW() WHERE id = $2`,
      [balanceAfter, referrerId]
    );

    // Actualizar comisión total
    await pool.query(
      `UPDATE referrals 
       SET total_commission = COALESCE(total_commission, 0) + $1, updated_at = NOW()
       WHERE referrer_id = $2 AND referred_id = $3`,
      [commissionAmount, referrerId, userId]
    );

    // Crear transacción de comisión
    await pool.query(
      `INSERT INTO transactions 
       (user_id, type, amount, balance_before, balance_after, reference_id, reference_type, description, status)
       VALUES ($1, 'referral_commission', $2, $3, $4, $5, 'referral', $6, 'completed')`,
      [referrerId, commissionAmount, balanceBefore, balanceAfter, userId, `Commission from referred user mining`]
    );

  } catch (error) {
    console.error('❌ Error procesando comisión de referido:', error);
    // No lanzar error para no interrumpir el procesamiento principal
  }
}

module.exports = {
  startMiningProcessor,
  stopMiningProcessor,
  processActiveMiningSessions
};

