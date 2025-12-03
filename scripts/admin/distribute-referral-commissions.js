// ===== SCRIPT PARA DISTRIBUIR COMISIONES DE REFERIDOS PENDIENTES =====
// Este script procesa todas las comisiones de referidos que aún no se han pagado
// basándose en el total minado de cada usuario referido

(function() {
    'use strict';
    
    console.log('🚀 Iniciando distribución de comisiones de referidos...');
    
    // Esperar a que Supabase Integration esté disponible
    function waitForSupabase() {
        return new Promise((resolve) => {
            if (window.supabaseIntegration && window.supabaseIntegration.config) {
                resolve(window.supabaseIntegration);
            } else {
                const checkInterval = setInterval(() => {
                    if (window.supabaseIntegration && window.supabaseIntegration.config) {
                        clearInterval(checkInterval);
                        resolve(window.supabaseIntegration);
                    }
                }, 100);
            }
        });
    }
    
    // Función para crear cliente de Supabase con service key (si está disponible)
    function createSupabaseAdminClient(supabaseIntegration) {
        const config = supabaseIntegration.config;
        
        // Intentar usar service key si está disponible en localStorage o en el config
        const serviceKey = localStorage.getItem('supabase_service_key') || config.serviceKey;
        
        if (serviceKey) {
            // Crear cliente con service key usando fetch directo
            return {
                url: config.url,
                key: serviceKey,
                makeRequest: async (method, endpoint, body = null) => {
                    const url = `${config.url}${endpoint}`;
                    const options = {
                        method: method,
                        headers: {
                            'Content-Type': 'application/json',
                            'apikey': serviceKey,
                            'Authorization': `Bearer ${serviceKey}`
                        }
                    };
                    
                    if (body) {
                        options.body = JSON.stringify(body);
                    }
                    
                    return fetch(url, options);
                }
            };
        } else {
            // Usar anon key (limitado por RLS)
            return {
                url: config.url,
                key: config.anonKey,
                makeRequest: async (method, endpoint, body = null) => {
                    const url = `${config.url}${endpoint}`;
                    const options = {
                        method: method,
                        headers: {
                            'Content-Type': 'application/json',
                            'apikey': config.anonKey,
                            'Authorization': `Bearer ${config.anonKey}`
                        }
                    };
                    
                    if (body) {
                        options.body = JSON.stringify(body);
                    }
                    
                    return fetch(url, options);
                }
            };
        }
    }
    
    // Tasa de comisión por defecto (10%)
    const DEFAULT_COMMISSION_RATE = 0.10;
    
    /**
     * Obtener el total minado de un usuario sumando transacciones de tipo 'mining'
     * Si no hay transacciones, usa el balance actual como referencia
     */
    async function getTotalMinedForUser(supabaseClient, userId, currentBalance = 0) {
        try {
            // Primero intentar obtener transacciones de minería
            const response = await supabaseClient.makeRequest(
                'GET',
                `/rest/v1/transactions?user_id=eq.${userId}&type=eq.mining&select=amount`
            );
            
            if (response.ok) {
                const transactions = await response.json();
                const totalMined = transactions.reduce((sum, tx) => {
                    return sum + parseFloat(tx.amount || 0);
                }, 0);
                
                // Si hay transacciones de minería, usarlas
                if (totalMined > 0) {
                    return totalMined;
                }
            }
            
            // Si no hay transacciones de minería, verificar otras fuentes de balance
            // (bonos, comisiones de referidos, etc.)
            const allTransactionsResponse = await supabaseClient.makeRequest(
                'GET',
                `/rest/v1/transactions?user_id=eq.${userId}&select=type,amount`
            );
            
            if (allTransactionsResponse.ok) {
                const allTransactions = await allTransactionsResponse.json();
                
                // Calcular total de bonos y comisiones recibidas
                const bonuses = allTransactions
                    .filter(tx => tx.type === 'bonus' || tx.type === 'welcome_bonus')
                    .reduce((sum, tx) => sum + parseFloat(tx.amount || 0), 0);
                
                const referralCommissions = allTransactions
                    .filter(tx => tx.type === 'referral_commission')
                    .reduce((sum, tx) => sum + parseFloat(tx.amount || 0), 0);
                
                // Estimar total minado como: balance actual - bonos - comisiones recibidas
                // Esto es una aproximación, pero es mejor que 0
                const estimatedMined = Math.max(0, currentBalance - bonuses - referralCommissions);
                
                if (estimatedMined > 0) {
                    console.log(`📊 Usuario ${userId}: Usando balance estimado como referencia (${estimatedMined.toFixed(6)} RSC)`);
                    return estimatedMined;
                }
            }
            
            return 0;
        } catch (error) {
            console.warn(`⚠️ Error calculando total minado: ${error.message}`);
            // Si hay error, usar balance actual como fallback
            return Math.max(0, currentBalance);
        }
    }
    
    /**
     * Obtener todos los usuarios con referidos
     */
    async function getAllUsersWithReferrals(supabaseClient) {
        try {
            console.log('📊 Obteniendo usuarios con referidos...');
            
            // Obtener todos los usuarios que tienen un referrer (sin total_mined)
            const response = await supabaseClient.makeRequest(
                'GET',
                '/rest/v1/users?referred_by=not.is.null&select=id,username,email,referred_by,balance'
            );
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Error obteniendo usuarios: ${response.status} - ${errorText}`);
            }
            
            const users = await response.json();
            console.log(`✅ Encontrados ${users.length} usuarios con referidos`);
            
            // Calcular total_mined para cada usuario sumando transacciones
            console.log('📊 Calculando total minado para cada usuario...');
            const usersWithTotalMined = await Promise.all(
                users.map(async (user) => {
                    const currentBalance = parseFloat(user.balance || 0);
                    const totalMined = await getTotalMinedForUser(supabaseClient, user.id, currentBalance);
                    return {
                        ...user,
                        total_mined: totalMined
                    };
                })
            );
            
            console.log(`✅ Total minado calculado para ${usersWithTotalMined.length} usuarios`);
            return usersWithTotalMined || [];
        } catch (error) {
            console.error('❌ Error obteniendo usuarios con referidos:', error);
            throw error;
        }
    }
    
    /**
     * Obtener el total de comisiones ya pagadas a un referrer por un usuario referido
     */
    async function getTotalCommissionsPaid(supabaseClient, referrerId, referredUserId) {
        try {
            const response = await supabaseClient.makeRequest(
                'GET',
                `/rest/v1/transactions?user_id=eq.${referrerId}&type=eq.referral_commission&reference_id=eq.${referredUserId}&select=amount`
            );
            
            if (!response.ok) {
                console.warn(`⚠️ Error obteniendo comisiones pagadas: ${response.status}`);
                return 0;
            }
            
            const transactions = await response.json();
            const totalPaid = transactions.reduce((sum, tx) => {
                return sum + parseFloat(tx.amount || 0);
            }, 0);
            
            return totalPaid;
        } catch (error) {
            console.warn(`⚠️ Error calculando comisiones pagadas: ${error.message}`);
            return 0;
        }
    }
    
    /**
     * Obtener la tasa de comisión para una relación de referido
     */
    async function getCommissionRate(supabaseClient, referrerId, referredUserId) {
        try {
            const response = await supabaseClient.makeRequest(
                'GET',
                `/rest/v1/referrals?referrer_id=eq.${referrerId}&referred_id=eq.${referredUserId}&select=commission_rate&limit=1`
            );
            
            if (!response.ok) {
                console.warn(`⚠️ Error obteniendo tasa de comisión: ${response.status}`);
                return DEFAULT_COMMISSION_RATE;
            }
            
            const referrals = await response.json();
            const referral = referrals && referrals.length > 0 ? referrals[0] : null;
            
            return parseFloat(referral?.commission_rate || DEFAULT_COMMISSION_RATE);
        } catch (error) {
            console.warn(`⚠️ Error obteniendo tasa de comisión: ${error.message}`);
            return DEFAULT_COMMISSION_RATE;
        }
    }
    
    /**
     * Procesar comisión pendiente para un usuario referido
     * @param {Object} supabaseClient - Cliente de Supabase
     * @param {Object} referredUser - Usuario referido
     * @param {boolean} dryRun - Si es true, solo simula sin hacer cambios reales
     */
    async function processPendingCommission(supabaseClient, referredUser, dryRun = false) {
        try {
            const referredUserId = referredUser.id;
            const referrerId = referredUser.referred_by;
            const totalMined = parseFloat(referredUser.total_mined || 0);
            
            if (totalMined <= 0) {
                console.log(`⏭️ Usuario ${referredUser.username} no ha minado nada, saltando...`);
                return { processed: false, reason: 'no_mining' };
            }
            
            // Obtener tasa de comisión
            const commissionRate = await getCommissionRate(supabaseClient, referrerId, referredUserId);
            
            // Calcular comisión total que debería haberse pagado
            const totalCommissionShouldBe = totalMined * commissionRate;
            
            // Obtener comisiones ya pagadas
            const totalPaid = await getTotalCommissionsPaid(supabaseClient, referrerId, referredUserId);
            
            // Calcular comisión pendiente
            const pendingCommission = totalCommissionShouldBe - totalPaid;
            
            if (pendingCommission <= 0) {
                console.log(`✅ Usuario ${referredUser.username}: Comisiones al día (${totalPaid.toFixed(6)}/${totalCommissionShouldBe.toFixed(6)} RSC)`);
                return { processed: false, reason: 'up_to_date', totalPaid, totalShouldBe: totalCommissionShouldBe };
            }
            
            console.log(`💰 Procesando comisión pendiente para ${referredUser.username}:`);
            console.log(`   - Total minado: ${totalMined.toFixed(6)} RSC`);
            console.log(`   - Tasa de comisión: ${(commissionRate * 100).toFixed(2)}%`);
            console.log(`   - Comisión total esperada: ${totalCommissionShouldBe.toFixed(6)} RSC`);
            console.log(`   - Comisiones ya pagadas: ${totalPaid.toFixed(6)} RSC`);
            console.log(`   - Comisión pendiente: ${pendingCommission.toFixed(6)} RSC`);
            
            // Obtener balance actual del referrer
            const referrerResponse = await supabaseClient.makeRequest(
                'GET',
                `/rest/v1/users?id=eq.${referrerId}&select=balance,username&limit=1`
            );
            
            if (!referrerResponse.ok) {
                throw new Error(`Error obteniendo datos del referrer: ${referrerResponse.status}`);
            }
            
            const referrers = await referrerResponse.json();
            const referrer = referrers && referrers.length > 0 ? referrers[0] : null;
            
            if (!referrer) {
                throw new Error('Usuario referrer no encontrado');
            }
            
            const balanceBefore = parseFloat(referrer.balance || 0);
            const balanceAfter = balanceBefore + pendingCommission;
            
            // 🔧 MODO SIMULACIÓN: Solo mostrar qué se haría sin hacer cambios reales
            if (dryRun) {
                console.log(`🧪 [SIMULACIÓN] Se actualizaría el balance de ${referrer.username || referrerId}:`);
                console.log(`   - Balance actual: ${balanceBefore.toFixed(6)} RSC`);
                console.log(`   - Balance nuevo: ${balanceAfter.toFixed(6)} RSC`);
                console.log(`   - Comisión a agregar: ${pendingCommission.toFixed(6)} RSC`);
                console.log(`🧪 [SIMULACIÓN] Se registraría una transacción de ${pendingCommission.toFixed(6)} RSC`);
                console.log(`🧪 [SIMULACIÓN] Se actualizaría total_commission en referrals`);
                
                return {
                    processed: true,
                    simulated: true,
                    referredUserId,
                    referrerId,
                    referredUsername: referredUser.username,
                    referrerUsername: referrer.username,
                    totalMined,
                    commissionRate,
                    totalCommissionShouldBe,
                    totalPaid,
                    pendingCommission,
                    balanceBefore,
                    balanceAfter
                };
            }
            
            // Actualizar balance del referrer usando la función RPC update_user_balance
            const updateBalanceResponse = await supabaseClient.makeRequest(
                'POST',
                '/rest/v1/rpc/update_user_balance',
                {
                    p_user_id: referrerId,
                    p_amount: pendingCommission,
                    p_transaction_type: 'referral_commission',
                    p_description: `Comisión de referido pendiente - ${referredUser.username} (${totalMined.toFixed(6)} RSC minados)`,
                    p_metadata: {
                        referred_user_id: referredUserId,
                        referred_username: referredUser.username,
                        total_mined: totalMined,
                        commission_rate: commissionRate,
                        total_commission_should_be: totalCommissionShouldBe,
                        total_commission_paid_before: totalPaid,
                        processed_at: new Date().toISOString(),
                        batch_processed: true
                    }
                }
            );
            
            if (!updateBalanceResponse.ok) {
                // Si la función RPC no existe, actualizar manualmente
                const manualUpdateResponse = await supabaseClient.makeRequest(
                    'PATCH',
                    `/rest/v1/users?id=eq.${referrerId}`,
                    {
                        balance: balanceAfter,
                        updated_at: new Date().toISOString()
                    }
                );
                
                if (!manualUpdateResponse.ok) {
                    throw new Error(`Error actualizando balance del referrer: ${manualUpdateResponse.status}`);
                }
                
                // Registrar transacción manualmente
                const transactionResponse = await supabaseClient.makeRequest(
                    'POST',
                    '/rest/v1/transactions',
                    {
                        user_id: referrerId,
                        type: 'referral_commission',
                        amount: pendingCommission,
                        balance_before: balanceBefore,
                        balance_after: balanceAfter,
                        reference_id: referredUserId,
                        reference_type: 'user',
                        description: `Comisión de referido pendiente - ${referredUser.username} (${totalMined.toFixed(6)} RSC minados)`,
                        metadata: {
                            referred_user_id: referredUserId,
                            referred_username: referredUser.username,
                            total_mined: totalMined,
                            commission_rate: commissionRate,
                            total_commission_should_be: totalCommissionShouldBe,
                            total_commission_paid_before: totalPaid,
                            processed_at: new Date().toISOString(),
                            batch_processed: true
                        }
                    }
                );
                
                if (!transactionResponse.ok) {
                    console.warn(`⚠️ Error registrando transacción: ${transactionResponse.status}`);
                }
            }
            
            // Actualizar total_commission en referrals
            const referralUpdateResponse = await supabaseClient.makeRequest(
                'PATCH',
                `/rest/v1/referrals?referrer_id=eq.${referrerId}&referred_id=eq.${referredUserId}`,
                {
                    total_commission: totalPaid + pendingCommission,
                    updated_at: new Date().toISOString()
                }
            );
            
            if (!referralUpdateResponse.ok) {
                // Si no existe la relación, crearla
                const insertResponse = await supabaseClient.makeRequest(
                    'POST',
                    '/rest/v1/referrals',
                    {
                        referrer_id: referrerId,
                        referred_id: referredUserId,
                        commission_rate: commissionRate,
                        total_commission: pendingCommission,
                        level: 1,
                        is_active: true
                    }
                );
                
                if (!insertResponse.ok) {
                    console.warn(`⚠️ Error creando relación de referral: ${insertResponse.status}`);
                }
            }
            
            console.log(`✅ Comisión procesada: ${pendingCommission.toFixed(6)} RSC para ${referrer.username || referrerId}`);
            console.log(`   Balance anterior: ${balanceBefore.toFixed(6)} RSC`);
            console.log(`   Balance nuevo: ${balanceAfter.toFixed(6)} RSC`);
            
            return {
                processed: true,
                referredUserId,
                referrerId,
                referredUsername: referredUser.username,
                referrerUsername: referrer.username,
                totalMined,
                commissionRate,
                totalCommissionShouldBe,
                totalPaid,
                pendingCommission,
                balanceBefore,
                balanceAfter
            };
            
        } catch (error) {
            console.error(`❌ Error procesando comisión para ${referredUser.username}:`, error);
            return {
                processed: false,
                error: error.message,
                referredUserId: referredUser.id,
                referredUsername: referredUser.username
            };
        }
    }
    
    /**
     * Función principal para distribuir todas las comisiones pendientes
     * @param {boolean} dryRun - Si es true, solo simula sin hacer cambios reales
     */
    async function distributeAllPendingCommissions(dryRun = false) {
        try {
            if (dryRun) {
                console.log('🧪 MODO SIMULACIÓN: No se realizarán cambios reales en la base de datos\n');
            } else {
                console.log('🚀 Iniciando distribución REAL de comisiones de referidos...\n');
            }
            
            // Esperar a que Supabase Integration esté disponible
            const supabaseIntegration = await waitForSupabase();
            const supabaseClient = createSupabaseAdminClient(supabaseIntegration);
            
            // Obtener todos los usuarios con referidos
            const usersWithReferrals = await getAllUsersWithReferrals(supabaseClient);
            
            if (usersWithReferrals.length === 0) {
                console.log('ℹ️ No hay usuarios con referidos para procesar');
                return {
                    success: true,
                    totalUsers: 0,
                    processed: 0,
                    skipped: 0,
                    errors: 0,
                    totalCommissions: 0
                };
            }
            
            console.log(`\n📋 Procesando ${usersWithReferrals.length} usuarios con referidos...\n`);
            
            const results = {
                processed: [],
                skipped: [],
                errors: [],
                totalCommissions: 0
            };
            
            // Procesar cada usuario
            for (let i = 0; i < usersWithReferrals.length; i++) {
                const user = usersWithReferrals[i];
                console.log(`\n[${i + 1}/${usersWithReferrals.length}] Procesando usuario: ${user.username || user.id}`);
                
                const result = await processPendingCommission(supabaseClient, user, dryRun);
                
                if (result.processed) {
                    results.processed.push(result);
                    results.totalCommissions += result.pendingCommission;
                } else if (result.error) {
                    results.errors.push(result);
                } else {
                    results.skipped.push(result);
                }
                
                // Pequeña pausa para no sobrecargar la base de datos
                await new Promise(resolve => setTimeout(resolve, 100));
            }
            
            // Resumen final
            console.log('\n' + '='.repeat(80));
            console.log('📊 RESUMEN DE DISTRIBUCIÓN DE COMISIONES');
            console.log('='.repeat(80));
            console.log(`Total de usuarios procesados: ${usersWithReferrals.length}`);
            console.log(`✅ Comisiones procesadas: ${results.processed.length}`);
            console.log(`⏭️ Usuarios saltados: ${results.skipped.length}`);
            console.log(`❌ Errores: ${results.errors.length}`);
            console.log(`💰 Total de comisiones distribuidas: ${results.totalCommissions.toFixed(6)} RSC`);
            console.log('='.repeat(80));
            
            if (results.processed.length > 0) {
                console.log('\n📋 DETALLE DE COMISIONES PROCESADAS:');
                results.processed.forEach((result, index) => {
                    console.log(`\n${index + 1}. ${result.referrerUsername} recibió ${result.pendingCommission.toFixed(6)} RSC`);
                    console.log(`   - De: ${result.referredUsername}`);
                    console.log(`   - Total minado: ${result.totalMined.toFixed(6)} RSC`);
                    console.log(`   - Tasa: ${(result.commissionRate * 100).toFixed(2)}%`);
                });
            }
            
            if (results.errors.length > 0) {
                console.log('\n❌ ERRORES ENCONTRADOS:');
                results.errors.forEach((error, index) => {
                    console.log(`${index + 1}. ${error.referredUsername || error.referredUserId}: ${error.error}`);
                });
            }
            
            return {
                success: true,
                totalUsers: usersWithReferrals.length,
                processed: results.processed.length,
                skipped: results.skipped.length,
                errors: results.errors.length,
                totalCommissions: results.totalCommissions,
                details: results
            };
            
        } catch (error) {
            console.error('❌ Error en la distribución de comisiones:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    // Exportar función para uso en consola del navegador
    if (typeof window !== 'undefined') {
        window.distributeReferralCommissions = distributeAllPendingCommissions;
        console.log('✅ Script cargado. Usa:');
        console.log('   - window.distributeReferralCommissions(true)  para SIMULAR (sin cambios)');
        console.log('   - window.distributeReferralCommissions(false) para DISTRIBUIR REALMENTE');
    }
    
    // Si se ejecuta directamente (Node.js), ejecutar inmediatamente
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = { distributeAllPendingCommissions };
    }
    
})();

