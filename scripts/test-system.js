/**
 * TEST SYSTEM - PRUEBA COMPLETA DEL SISTEMA RSC
 * 
 * Prueba todas las funcionalidades del sistema unificado
 * - Verificación de componentes
 * - Pruebas de funcionalidad
 * - Validación de datos
 * - Reporte de resultados
 */

(function() {
    'use strict';
    
    console.log('🧪 RSC Test System iniciando...');
    
    class RSCTestSystem {
        constructor() {
            this.tests = [];
            this.results = {
                passed: 0,
                failed: 0,
                total: 0
            };
        }
        
        /**
         * Ejecutar todas las pruebas
         */
        async runAllTests() {
            console.log('🧪 Ejecutando pruebas completas del sistema RSC...');
            
            this.tests = [];
            this.results = { passed: 0, failed: 0, total: 0 };
            
            // Esperar a que el sistema esté listo
            await this.waitForSystem();
            
            // Ejecutar pruebas
            await this.testSupabaseConnection();
            await this.testRSCStore();
            await this.testSecureAuth();
            await this.testMiningEngine();
            await this.testDataValidator();
            await this.testErrorHandler();
            await this.testRSCSystem();
            await this.testDataIntegrity();
            await this.testPerformance();
            
            // Mostrar resultados
            this.displayResults();
            
            return this.results;
        }
        
        /**
         * Esperar a que el sistema esté listo
         */
        async waitForSystem() {
            console.log('⏳ Esperando a que el sistema esté listo...');
            
            const maxWait = 10000; // 10 segundos
            const startTime = Date.now();
            
            while (Date.now() - startTime < maxWait) {
                if (window.RSCSystem && window.RSCSystem.isInitialized) {
                    console.log('✅ Sistema RSC listo');
                    return true;
                }
                await new Promise(resolve => setTimeout(resolve, 100));
            }
            
            console.warn('⚠️ Sistema RSC no se inicializó en el tiempo esperado');
            return false;
        }
        
        /**
         * Probar conexión con Supabase
         */
        async testSupabaseConnection() {
            const testName = 'Supabase Connection';
            console.log(`🧪 Probando ${testName}...`);
            
            try {
                if (!window.supabase) {
                    throw new Error('Cliente Supabase no disponible');
                }
                
                const { data, error } = await window.supabase
                    .from('users')
                    .select('count')
                    .limit(1);
                
                if (error) {
                    throw new Error(`Error de conexión: ${error.message}`);
                }
                
                this.addTestResult(testName, true, 'Conexión con Supabase exitosa');
                
            } catch (error) {
                this.addTestResult(testName, false, `Error: ${error.message}`);
            }
        }
        
        /**
         * Probar RSC Store
         */
        async testRSCStore() {
            const testName = 'RSC Store';
            console.log(`🧪 Probando ${testName}...`);
            
            try {
                if (!window.RSCStore) {
                    throw new Error('RSCStore no disponible');
                }
                
                // Probar obtención de estado
                const state = window.RSCStore.getState();
                if (!state || typeof state !== 'object') {
                    throw new Error('Estado del store inválido');
                }
                
                // Probar actualización de estado
                const testData = { test: 'value' };
                window.RSCStore.setState({ testData });
                
                const updatedState = window.RSCStore.getState();
                if (updatedState.testData !== testData) {
                    throw new Error('Actualización de estado falló');
                }
                
                this.addTestResult(testName, true, 'RSC Store funcionando correctamente');
                
            } catch (error) {
                this.addTestResult(testName, false, `Error: ${error.message}`);
            }
        }
        
        /**
         * Probar Secure Auth
         */
        async testSecureAuth() {
            const testName = 'Secure Auth';
            console.log(`🧪 Probando ${testName}...`);
            
            try {
                if (!window.SecureAuth) {
                    throw new Error('SecureAuth no disponible');
                }
                
                // Probar validación de email
                const emailValidation = window.SecureAuth.validateEmail?.('test@example.com');
                if (!emailValidation || !emailValidation.valid) {
                    throw new Error('Validación de email falló');
                }
                
                // Probar validación de contraseña
                const passwordValidation = window.SecureAuth.validatePassword?.('Test123!');
                if (!passwordValidation || !passwordValidation.valid) {
                    throw new Error('Validación de contraseña falló');
                }
                
                this.addTestResult(testName, true, 'Secure Auth funcionando correctamente');
                
            } catch (error) {
                this.addTestResult(testName, false, `Error: ${error.message}`);
            }
        }
        
        /**
         * Probar Mining Engine
         */
        async testMiningEngine() {
            const testName = 'Mining Engine';
            console.log(`🧪 Probando ${testName}...`);
            
            try {
                if (!window.MiningEngine) {
                    throw new Error('MiningEngine no disponible');
                }
                
                // Probar obtención de estado
                const status = window.MiningEngine.getStatus();
                if (!status || typeof status !== 'object') {
                    throw new Error('Estado del motor de minería inválido');
                }
                
                // Probar obtención de estadísticas
                const stats = window.MiningEngine.getStats();
                if (!stats || typeof stats !== 'object') {
                    throw new Error('Estadísticas del motor de minería inválidas');
                }
                
                this.addTestResult(testName, true, 'Mining Engine funcionando correctamente');
                
            } catch (error) {
                this.addTestResult(testName, false, `Error: ${error.message}`);
            }
        }
        
        /**
         * Probar Data Validator
         */
        async testDataValidator() {
            const testName = 'Data Validator';
            console.log(`🧪 Probando ${testName}...`);
            
            try {
                if (!window.DataValidator) {
                    throw new Error('DataValidator no disponible');
                }
                
                // Probar validación de email
                const emailValidation = window.DataValidator.validateEmail('test@example.com');
                if (!emailValidation.valid) {
                    throw new Error('Validación de email falló');
                }
                
                // Probar validación de contraseña
                const passwordValidation = window.DataValidator.validatePassword('Test123!');
                if (!passwordValidation.valid) {
                    throw new Error('Validación de contraseña falló');
                }
                
                // Probar validación de balance
                const balanceValidation = window.DataValidator.validateBalance(100.5);
                if (!balanceValidation.valid) {
                    throw new Error('Validación de balance falló');
                }
                
                this.addTestResult(testName, true, 'Data Validator funcionando correctamente');
                
            } catch (error) {
                this.addTestResult(testName, false, `Error: ${error.message}`);
            }
        }
        
        /**
         * Probar Error Handler
         */
        async testErrorHandler() {
            const testName = 'Error Handler';
            console.log(`🧪 Probando ${testName}...`);
            
            try {
                if (!window.ErrorHandler) {
                    throw new Error('ErrorHandler no disponible');
                }
                
                // Probar manejo de error
                const testError = new Error('Test error');
                const errorInfo = window.ErrorHandler.handleError(testError, { source: 'TEST' });
                
                if (!errorInfo || !errorInfo.id) {
                    throw new Error('Manejo de error falló');
                }
                
                // Probar obtención de log de errores
                const errorLog = window.ErrorHandler.getErrorLog();
                if (!Array.isArray(errorLog)) {
                    throw new Error('Log de errores inválido');
                }
                
                this.addTestResult(testName, true, 'Error Handler funcionando correctamente');
                
            } catch (error) {
                this.addTestResult(testName, false, `Error: ${error.message}`);
            }
        }
        
        /**
         * Probar RSC System
         */
        async testRSCSystem() {
            const testName = 'RSC System';
            console.log(`🧪 Probando ${testName}...`);
            
            try {
                if (!window.RSCSystem) {
                    throw new Error('RSCSystem no disponible');
                }
                
                // Probar obtención de estado del sistema
                const systemStatus = window.RSCSystem.getSystemStatus();
                if (!systemStatus || typeof systemStatus !== 'object') {
                    throw new Error('Estado del sistema inválido');
                }
                
                // Probar obtención de estadísticas
                const systemStats = window.RSCSystem.getSystemStats();
                if (!systemStats || typeof systemStats !== 'object') {
                    throw new Error('Estadísticas del sistema inválidas');
                }
                
                // Probar obtención de información de debugging
                const debugInfo = window.RSCSystem.getDebugInfo();
                if (!debugInfo || typeof debugInfo !== 'object') {
                    throw new Error('Información de debugging inválida');
                }
                
                this.addTestResult(testName, true, 'RSC System funcionando correctamente');
                
            } catch (error) {
                this.addTestResult(testName, false, `Error: ${error.message}`);
            }
        }
        
        /**
         * Probar integridad de datos
         */
        async testDataIntegrity() {
            const testName = 'Data Integrity';
            console.log(`🧪 Probando ${testName}...`);
            
            try {
                // Verificar que no hay datos corruptos en localStorage
                const keys = ['rsc_user', 'rsc_wallet_balance', 'rsc_mining_state'];
                
                for (const key of keys) {
                    const value = localStorage.getItem(key);
                    if (value) {
                        try {
                            JSON.parse(value);
                        } catch (error) {
                            throw new Error(`Datos corruptos en localStorage: ${key}`);
                        }
                    }
                }
                
                this.addTestResult(testName, true, 'Integridad de datos verificada');
                
            } catch (error) {
                this.addTestResult(testName, false, `Error: ${error.message}`);
            }
        }
        
        /**
         * Probar rendimiento
         */
        async testPerformance() {
            const testName = 'Performance';
            console.log(`🧪 Probando ${testName}...`);
            
            try {
                // Verificar métricas de memoria
                if (performance.memory) {
                    const memory = performance.memory;
                    const memoryUsage = memory.usedJSHeapSize / memory.jsHeapSizeLimit;
                    
                    if (memoryUsage > 0.9) {
                        throw new Error(`Uso de memoria muy alto: ${(memoryUsage * 100).toFixed(1)}%`);
                    }
                }
                
                // Verificar tiempo de carga
                const loadTime = performance.timing ? 
                    performance.timing.loadEventEnd - performance.timing.navigationStart : 0;
                
                if (loadTime > 10000) {
                    throw new Error(`Tiempo de carga muy alto: ${loadTime}ms`);
                }
                
                this.addTestResult(testName, true, 'Rendimiento dentro de parámetros normales');
                
            } catch (error) {
                this.addTestResult(testName, false, `Error: ${error.message}`);
            }
        }
        
        /**
         * Agregar resultado de prueba
         */
        addTestResult(testName, passed, message) {
            const result = {
                name: testName,
                passed: passed,
                message: message,
                timestamp: new Date().toISOString()
            };
            
            this.tests.push(result);
            this.results.total++;
            
            if (passed) {
                this.results.passed++;
                console.log(`✅ ${testName}: ${message}`);
            } else {
                this.results.failed++;
                console.log(`❌ ${testName}: ${message}`);
            }
        }
        
        /**
         * Mostrar resultados
         */
        displayResults() {
            console.log('\n📊 Resultados de las pruebas:');
            console.log(`✅ Pasaron: ${this.results.passed}`);
            console.log(`❌ Fallaron: ${this.results.failed}`);
            console.log(`📈 Total: ${this.results.total}`);
            console.log(`📊 Porcentaje de éxito: ${((this.results.passed / this.results.total) * 100).toFixed(1)}%`);
            
            if (this.results.failed > 0) {
                console.log('\n❌ Pruebas que fallaron:');
                this.tests.filter(t => !t.passed).forEach(test => {
                    console.log(`   - ${test.name}: ${test.message}`);
                });
            }
            
            if (this.results.passed === this.results.total) {
                console.log('\n🎉 ¡Todas las pruebas pasaron! El sistema está funcionando correctamente.');
            } else {
                console.log('\n⚠️ Algunas pruebas fallaron. Revisar los errores arriba.');
            }
        }
        
        /**
         * Obtener resumen
         */
        getSummary() {
            return {
                ...this.results,
                successRate: (this.results.passed / this.results.total) * 100,
                tests: this.tests
            };
        }
    }
    
    // Crear instancia global
    const rscTestSystem = new RSCTestSystem();
    
    // Hacer disponible globalmente
    if (typeof window !== 'undefined') {
        window.RSCTestSystem = rscTestSystem;
    }
    
    // Ejecutar pruebas automáticamente después de 3 segundos
    setTimeout(() => {
        rscTestSystem.runAllTests();
    }, 3000);
    
})();
