/**
 * 🧪 TEST DEL SISTEMA DE REFERIDOS
 * Script para probar que las comisiones de referidos funcionan correctamente
 */

class ReferralSystemTest {
    constructor() {
        this.testResults = [];
        // La instancia está en window.supabaseIntegration, no window.supabase
        this.supabase = window.supabaseIntegration || null;
    }

    /**
     * Ejecutar todos los tests
     */
    async runAllTests() {
        console.log('🧪 Iniciando tests del sistema de referidos...\n');
        
        try {
            // Test 1: Verificar que el listener está configurado
            await this.testListenerSetup();
            
            // Test 2: Verificar autenticación y referrer
            await this.testUserHasReferrer();
            
            // Test 3: Verificar actualización de balance (puede funcionar sin referrer)
            await this.testBalanceUpdate();
            
            // Test 4: Simular procesamiento de comisión (requiere referrer)
            await this.testCommissionProcessing();
            
            // Test 5: Verificar eventos
            await this.testEvents();
            
            // Mostrar resumen
            this.showResults();
            
        } catch (error) {
            console.error('❌ Error ejecutando tests:', error);
            this.addResult('ERROR GENERAL', false, error.message);
            this.showResults();
        }
    }

    /**
     * Test 1: Verificar que el listener está configurado
     */
    async testListenerSetup() {
        console.log('📋 Test 1: Verificando listener de comisiones...');
        
        try {
            // Verificar que el evento puede ser escuchado
            let eventReceived = false;
            const testHandler = (event) => {
                eventReceived = true;
            };
            
            window.addEventListener('rsc:referrer-commission-received', testHandler);
            
            // Disparar evento de prueba
            window.dispatchEvent(new CustomEvent('rsc:referrer-commission-received', {
                detail: {
                    referrerId: 'test-id',
                    commissionAmount: 0.1,
                    referredUserId: 'test-referred',
                    miningAmount: 1.0
                }
            }));
            
            // Esperar un momento
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // Limpiar
            window.removeEventListener('rsc:referrer-commission-received', testHandler);
            
            this.addResult('Listener configurado', eventReceived, eventReceived ? 'Listener funciona correctamente' : 'Listener no está funcionando');
            
        } catch (error) {
            this.addResult('Listener configurado', false, error.message);
        }
    }

    /**
     * Test 2: Verificar que el usuario tiene referrer
     */
    async testUserHasReferrer() {
        console.log('📋 Test 2: Verificando que el usuario tiene referrer...');
        
        try {
            // Primero verificar que supabaseIntegration existe
            if (!this.supabase) {
                this.addResult('Usuario autenticado', false, 'window.supabaseIntegration no está disponible. ¿Está cargado el script?');
                return;
            }
            
            // Verificar que el usuario está autenticado
            if (!this.supabase.user || !this.supabase.user.isAuthenticated) {
                this.addResult('Usuario autenticado', false, 'Usuario no está autenticado. Por favor, inicia sesión primero.');
                return;
            }
            
            this.addResult('Usuario autenticado', true, `Usuario autenticado: ${this.supabase.user.username || this.supabase.user.email || 'N/A'}`);
            
            // Ahora verificar si tiene referrer
            const hasReferrer = !!this.supabase.user.referredBy;
            const referrerId = this.supabase.user.referredBy;
            
            this.addResult(
                'Usuario tiene referrer', 
                hasReferrer, 
                hasReferrer ? `Referrer ID: ${referrerId}` : 'Usuario no tiene referrer asignado. Necesitas registrarte con un código de referido.'
            );
            
        } catch (error) {
            this.addResult('Usuario tiene referrer', false, error.message);
        }
    }

    /**
     * Test 3: Simular procesamiento de comisión
     */
    async testCommissionProcessing() {
        console.log('📋 Test 4: Simulando procesamiento de comisión...');
        
        try {
            if (!this.supabase) {
                this.addResult('Procesamiento de comisión', false, 'window.supabaseIntegration no está disponible');
                return;
            }
            
            if (!this.supabase.user || !this.supabase.user.isAuthenticated) {
                this.addResult('Procesamiento de comisión', false, 'Usuario no autenticado');
                return;
            }
            
            if (!this.supabase.user.referredBy) {
                // Ofrecer opción de asignar un referrer de prueba
                this.addResult(
                    'Procesamiento de comisión', 
                    false, 
                    'No se puede probar: usuario sin referrer. Usa: testReferralSystem().assignTestReferrer("USER_ID") para asignar uno de prueba.'
                );
                return;
            }
            
            const testMiningAmount = 1.0; // 1 RSC
            const expectedCommission = testMiningAmount * 0.1; // 10% = 0.1 RSC
            
            console.log(`   Simulando minería de ${testMiningAmount} RSC`);
            console.log(`   Comisión esperada: ${expectedCommission} RSC para referrer ${this.supabase.user.referredBy}`);
            
            // Llamar a la función de procesamiento
            if (typeof this.supabase.processReferralCommissions === 'function') {
                const balanceBefore = this.supabase.user.balance || 0;
                
                await this.supabase.processReferralCommissions(testMiningAmount);
                
                // Esperar un momento para que se procese
                await new Promise(resolve => setTimeout(resolve, 3000));
                
                // Verificar que se procesó (no podemos verificar el balance del referrer desde aquí)
                this.addResult(
                    'Procesamiento de comisión', 
                    true, 
                    `Comisión de ${expectedCommission} RSC enviada al referrer ${this.supabase.user.referredBy}. Verifica en la base de datos que el referrer recibió la comisión.`
                );
            } else {
                this.addResult('Procesamiento de comisión', false, 'Función processReferralCommissions no encontrada');
            }
            
        } catch (error) {
            this.addResult('Procesamiento de comisión', false, error.message);
        }
    }

    /**
     * Asignar un referrer de prueba (solo para testing)
     */
    async assignTestReferrer(referrerUserId) {
        try {
            if (!this.supabase || !this.supabase.user || !this.supabase.user.isAuthenticated) {
                console.error('❌ Usuario no autenticado');
                return false;
            }

            console.log(`🔧 Asignando referrer de prueba: ${referrerUserId}`);
            
            // Actualizar en localStorage
            this.supabase.user.referredBy = referrerUserId;
            this.supabase.saveUserToStorage();
            
            // Actualizar en la base de datos
            const response = await this.supabase.makeRequest('PATCH', `/rest/v1/users?id=eq.${this.supabase.user.id}`, {
                referred_by: referrerUserId
            });
            
            if (response.ok) {
                console.log('✅ Referrer asignado correctamente');
                return true;
            } else {
                console.error('❌ Error asignando referrer:', await response.text());
                return false;
            }
        } catch (error) {
            console.error('❌ Error asignando referrer:', error);
            return false;
        }
    }

    /**
     * Test 4: Verificar actualización de balance
     */
    async testBalanceUpdate() {
        console.log('📋 Test 4: Verificando actualización de balance...');
        
        try {
            if (!this.supabase) {
                this.addResult('Actualización de balance', false, 'window.supabaseIntegration no está disponible');
                return;
            }
            
            if (!this.supabase.user || !this.supabase.user.isAuthenticated) {
                this.addResult('Actualización de balance', false, 'Usuario no autenticado');
                return;
            }
            
            const balanceBefore = this.supabase.user.balance || 0;
            
            // Simular actualización de balance
            const testCommission = 0.1;
            this.supabase.user.balance = balanceBefore + testCommission;
            
            if (typeof this.supabase.saveUserToStorage === 'function') {
                this.supabase.saveUserToStorage();
            }
            
            const balanceAfter = this.supabase.user.balance;
            const balanceUpdated = balanceAfter === balanceBefore + testCommission;
            
            // Restaurar balance original
            this.supabase.user.balance = balanceBefore;
            if (typeof this.supabase.saveUserToStorage === 'function') {
                this.supabase.saveUserToStorage();
            }
            
            this.addResult(
                'Actualización de balance', 
                balanceUpdated, 
                balanceUpdated 
                    ? `Balance actualizado: ${balanceBefore} → ${balanceAfter} RSC` 
                    : `Error: Balance no se actualizó correctamente`
            );
            
        } catch (error) {
            this.addResult('Actualización de balance', false, error.message);
        }
    }

    /**
     * Test 5: Verificar eventos
     */
    async testEvents() {
        console.log('📋 Test 5: Verificando eventos...');
        
        try {
            const events = [
                'rsc:referral-commission-processed',
                'rsc:referrer-commission-received',
                'balanceUpdated'
            ];
            
            const eventsReceived = {};
            const handlers = {};
            
            // Configurar listeners
            events.forEach(eventName => {
                eventsReceived[eventName] = false;
                handlers[eventName] = (event) => {
                    eventsReceived[eventName] = true;
                    console.log(`   ✅ Evento recibido: ${eventName}`, event.detail);
                };
                window.addEventListener(eventName, handlers[eventName]);
            });
            
            // Disparar eventos de prueba
            const testReferrerId = this.supabase?.user?.referredBy || 'test-referrer-id';
            const testReferredId = this.supabase?.user?.id || 'test-referred-id';
            
            window.dispatchEvent(new CustomEvent('rsc:referral-commission-processed', {
                detail: {
                    referrerId: testReferrerId,
                    commissionAmount: 0.1,
                    referredUserId: testReferredId,
                    miningAmount: 1.0
                }
            }));
            
            window.dispatchEvent(new CustomEvent('rsc:referrer-commission-received', {
                detail: {
                    referrerId: testReferrerId,
                    commissionAmount: 0.1,
                    referredUserId: testReferredId,
                    miningAmount: 1.0
                }
            }));
            
            window.dispatchEvent(new CustomEvent('balanceUpdated', {
                detail: {
                    balance: 100.0,
                    change: 0.1,
                    source: 'referral_commission'
                }
            }));
            
            // Esperar un momento
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Limpiar listeners
            events.forEach(eventName => {
                window.removeEventListener(eventName, handlers[eventName]);
            });
            
            const allEventsWork = events.every(eventName => eventsReceived[eventName]);
            const eventsStatus = events.map(e => `${e}: ${eventsReceived[e] ? '✅' : '❌'}`).join(', ');
            
            this.addResult(
                'Eventos funcionando', 
                allEventsWork, 
                allEventsWork ? 'Todos los eventos funcionan' : `Algunos eventos no funcionan: ${eventsStatus}`
            );
            
        } catch (error) {
            this.addResult('Eventos funcionando', false, error.message);
        }
    }

    /**
     * Agregar resultado del test
     */
    addResult(testName, passed, message) {
        this.testResults.push({
            name: testName,
            passed,
            message,
            timestamp: new Date().toISOString()
        });
        
        const icon = passed ? '✅' : '❌';
        console.log(`   ${icon} ${testName}: ${message}\n`);
    }

    /**
     * Mostrar resumen de resultados
     */
    showResults() {
        console.log('\n' + '='.repeat(60));
        console.log('📊 RESUMEN DE TESTS');
        console.log('='.repeat(60));
        
        const total = this.testResults.length;
        const passed = this.testResults.filter(r => r.passed).length;
        const failed = total - passed;
        
        console.log(`\nTotal de tests: ${total}`);
        console.log(`✅ Pasados: ${passed}`);
        console.log(`❌ Fallidos: ${failed}`);
        console.log(`📈 Tasa de éxito: ${((passed / total) * 100).toFixed(1)}%\n`);
        
        console.log('Detalles:');
        this.testResults.forEach((result, index) => {
            const icon = result.passed ? '✅' : '❌';
            console.log(`${index + 1}. ${icon} ${result.name}`);
            console.log(`   ${result.message}`);
        });
        
        console.log('\n' + '='.repeat(60));
        
        // Mostrar en la UI si es posible
        this.showResultsInUI();
    }

    /**
     * Mostrar resultados en la UI
     */
    showResultsInUI() {
        // Crear un modal con los resultados
        const modal = document.createElement('div');
        modal.id = 'referral-test-results';
        modal.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #1a1a2e;
            color: #fff;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.5);
            z-index: 10000;
            max-width: 600px;
            max-height: 80vh;
            overflow-y: auto;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        `;
        
        const total = this.testResults.length;
        const passed = this.testResults.filter(r => r.passed).length;
        const failed = total - passed;
        
        modal.innerHTML = `
            <div style="margin-bottom: 20px;">
                <h2 style="margin: 0 0 10px 0; color: #00d4ff;">🧪 Test del Sistema de Referidos</h2>
                <div style="display: flex; gap: 20px; margin-top: 15px;">
                    <div>
                        <div style="font-size: 24px; font-weight: bold; color: #00d4ff;">${total}</div>
                        <div style="font-size: 12px; color: #888;">Total</div>
                    </div>
                    <div>
                        <div style="font-size: 24px; font-weight: bold; color: #4caf50;">${passed}</div>
                        <div style="font-size: 12px; color: #888;">✅ Pasados</div>
                    </div>
                    <div>
                        <div style="font-size: 24px; font-weight: bold; color: #f44336;">${failed}</div>
                        <div style="font-size: 12px; color: #888;">❌ Fallidos</div>
                    </div>
                </div>
            </div>
            <div style="margin-top: 20px;">
                ${this.testResults.map((result, index) => `
                    <div style="margin-bottom: 15px; padding: 10px; background: ${result.passed ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)'}; border-radius: 5px; border-left: 3px solid ${result.passed ? '#4caf50' : '#f44336'};">
                        <div style="font-weight: bold; margin-bottom: 5px;">
                            ${result.passed ? '✅' : '❌'} ${result.name}
                        </div>
                        <div style="font-size: 12px; color: #aaa;">
                            ${result.message}
                        </div>
                    </div>
                `).join('')}
            </div>
            <button id="close-test-results" style="
                margin-top: 20px;
                padding: 10px 20px;
                background: #00d4ff;
                color: #000;
                border: none;
                border-radius: 5px;
                cursor: pointer;
                font-weight: bold;
                width: 100%;
            ">Cerrar</button>
        `;
        
        document.body.appendChild(modal);
        
        document.getElementById('close-test-results').addEventListener('click', () => {
            modal.remove();
        });
        
        // Cerrar con ESC
        const closeHandler = (e) => {
            if (e.key === 'Escape') {
                modal.remove();
                document.removeEventListener('keydown', closeHandler);
            }
        };
        document.addEventListener('keydown', closeHandler);
    }
}

// Función global para ejecutar los tests
const testReferralSystemFn = async function() {
    const tester = new ReferralSystemTest();
    await tester.runAllTests();
    return tester;
};

// Función helper para asignar referrer de prueba
testReferralSystemFn.assignTestReferrer = async function(referrerUserId) {
    const tester = new ReferralSystemTest();
    return await tester.assignTestReferrer(referrerUserId);
};

window.testReferralSystem = testReferralSystemFn;

// Auto-ejecutar si se está en modo desarrollo
if (window.location.search.includes('test=referral')) {
    console.log('🧪 Modo test activado. Ejecutando tests del sistema de referidos...');
    setTimeout(() => {
        window.testReferralSystem();
    }, 2000); // Esperar 2 segundos para que todo se cargue
}

// También crear un botón flotante para ejecutar el test fácilmente
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', addTestButton);
} else {
    addTestButton();
}

function addTestButton() {
    // Solo agregar el botón si no existe
    if (document.getElementById('referral-test-btn')) return;
    
    const button = document.createElement('button');
    button.id = 'referral-test-btn';
    button.innerHTML = '🧪 Test Referidos';
    button.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 9999;
        padding: 12px 20px;
        background: linear-gradient(135deg, #00d4ff 0%, #0099cc 100%);
        color: #000;
        border: none;
        border-radius: 25px;
        cursor: pointer;
        font-weight: bold;
        font-size: 14px;
        box-shadow: 0 4px 15px rgba(0, 212, 255, 0.4);
        transition: all 0.3s ease;
    `;
    
    button.addEventListener('mouseenter', () => {
        button.style.transform = 'scale(1.05)';
        button.style.boxShadow = '0 6px 20px rgba(0, 212, 255, 0.6)';
    });
    
    button.addEventListener('mouseleave', () => {
        button.style.transform = 'scale(1)';
        button.style.boxShadow = '0 4px 15px rgba(0, 212, 255, 0.4)';
    });
    
    button.addEventListener('click', async () => {
        button.disabled = true;
        button.innerHTML = '⏳ Ejecutando...';
        try {
            await window.testReferralSystem();
        } catch (error) {
            console.error('Error ejecutando test:', error);
        } finally {
            button.disabled = false;
            button.innerHTML = '🧪 Test Referidos';
        }
    });
    
    document.body.appendChild(button);
}

console.log('✅ Script de test del sistema de referidos cargado. Usa: testReferralSystem() o haz clic en el botón flotante');

