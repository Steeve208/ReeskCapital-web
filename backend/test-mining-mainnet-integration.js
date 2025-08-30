// ========================================
// SCRIPT DE PRUEBA PARA INTEGRACIÓN MAINNET-READY
// ========================================

const axios = require('axios');
const MiningMainnetService = require('./services/mining-mainnet-service');

// Configuración de prueba
const TEST_CONFIG = {
    baseURL: 'http://localhost:3000',
    timeout: 10000
};

// Datos de prueba
const TEST_DATA = {
    walletAddress: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
    sessionId: 'test_session_' + Date.now(),
    hashPower: 10.0,
    network: 'testnet'
};

// ========================================
// FUNCIONES DE PRUEBA
// ========================================

async function testBlockchainStatus() {
    console.log('\n🔍 Probando verificación de estado de blockchain...');
    
    try {
        const response = await axios.get(`${TEST_CONFIG.baseURL}/api/blockchain/status`);
        console.log('✅ Estado de blockchain:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Error verificando estado de blockchain:', error.message);
        return null;
    }
}

async function testMiningSessionStart() {
    console.log('\n🚀 Probando inicio de sesión de minería...');
    
    try {
        const response = await axios.post(`${TEST_CONFIG.baseURL}/api/mining/session/start`, TEST_DATA);
        console.log('✅ Sesión iniciada:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Error iniciando sesión:', error.message);
        return null;
    }
}

async function testMiningProgressUpdate() {
    console.log('\n📊 Probando actualización de progreso...');
    
    try {
        const progressData = {
            sessionId: TEST_DATA.sessionId,
            currentTokens: 5.5,
            currentHashRate: 10.0,
            network: TEST_DATA.network
        };
        
        const response = await axios.post(`${TEST_CONFIG.baseURL}/api/mining/progress/update`, progressData);
        console.log('✅ Progreso actualizado:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Error actualizando progreso:', error.message);
        return null;
    }
}

async function testMiningSessionStop() {
    console.log('\n⏹️ Probando detención de sesión de minería...');
    
    try {
        const stopData = {
            sessionId: TEST_DATA.sessionId,
            endTime: new Date().toISOString(),
            tokensEarned: 8.5,
            network: TEST_DATA.network
        };
        
        const response = await axios.post(`${TEST_CONFIG.baseURL}/api/mining/session/stop`, stopData);
        console.log('✅ Sesión detenida:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Error deteniendo sesión:', error.message);
        return null;
    }
}

async function testMiningRewardTransaction() {
    console.log('\n💰 Probando transacción de recompensa...');
    
    try {
        const transactionData = {
            from: '0x0000000000000000000000000000000000000000',
            to: TEST_DATA.walletAddress,
            amount: 8.5,
            type: 'mining_reward',
            sessionId: TEST_DATA.sessionId,
            network: TEST_DATA.network
        };
        
        const response = await axios.post(`${TEST_CONFIG.baseURL}/api/transaction/mining-reward`, transactionData);
        console.log('✅ Transacción procesada:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Error procesando transacción:', error.message);
        return null;
    }
}

async function testMiningStatus() {
    console.log('\n🔍 Probando consulta de estado de minería...');
    
    try {
        const response = await axios.get(`${TEST_CONFIG.baseURL}/api/mining/status/${TEST_DATA.walletAddress}?network=${TEST_DATA.network}`);
        console.log('✅ Estado de minería:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Error consultando estado:', error.message);
        return null;
    }
}

async function testSystemStats() {
    console.log('\n📊 Probando estadísticas del sistema...');
    
    try {
        const response = await axios.get(`${TEST_CONFIG.baseURL}/api/mining/system-stats`);
        console.log('✅ Estadísticas del sistema:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Error obteniendo estadísticas:', error.message);
        return null;
    }
}

async function testBlockchainSync() {
    console.log('\n🔄 Probando sincronización con blockchain...');
    
    try {
        const syncData = {
            walletAddress: TEST_DATA.walletAddress,
            sessionId: TEST_DATA.sessionId,
            network: TEST_DATA.network
        };
        
        const response = await axios.post(`${TEST_CONFIG.baseURL}/api/mining/sync/blockchain`, syncData);
        console.log('✅ Sincronización completada:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Error en sincronización:', error.message);
        return null;
    }
}

async function testBlockchainHealth() {
    console.log('\n🏥 Probando salud de blockchain...');
    
    try {
        const response = await axios.get(`${TEST_CONFIG.baseURL}/api/blockchain/health`);
        console.log('✅ Estado de salud:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Error verificando salud:', error.message);
        return null;
    }
}

async function testBlockchainInfo() {
    console.log('\nℹ️ Probando información de blockchain...');
    
    try {
        const response = await axios.get(`${TEST_CONFIG.baseURL}/api/blockchain/info`);
        console.log('✅ Información de blockchain:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Error obteniendo información:', error.message);
        return null;
    }
}

// ========================================
// PRUEBA DEL SERVICIO DIRECTO
// ========================================

async function testMiningMainnetService() {
    console.log('\n🧪 Probando servicio de minería mainnet directamente...');
    
    try {
        const service = new MiningMainnetService();
        await service.init();
        
        console.log('✅ Servicio inicializado correctamente');
        
        // Probar estado de blockchain
        const blockchainStatus = service.getBlockchainStatus();
        console.log('📡 Estado de blockchain:', blockchainStatus);
        
        // Probar información de red
        const networkInfo = service.getNetworkInfo();
        console.log('🌐 Información de red:', networkInfo);
        
        // Probar si mainnet está activo
        const isMainnetActive = service.isMainnetActive();
        console.log('🚀 Mainnet activo:', isMainnetActive);
        
        return true;
    } catch (error) {
        console.error('❌ Error probando servicio:', error.message);
        return false;
    }
}

// ========================================
// FUNCIÓN PRINCIPAL DE PRUEBA
// ========================================

async function runAllTests() {
    console.log('🚀 INICIANDO PRUEBAS DE INTEGRACIÓN MAINNET-READY');
    console.log('=' .repeat(60));
    
    const results = {
        blockchainStatus: false,
        sessionStart: false,
        progressUpdate: false,
        sessionStop: false,
        rewardTransaction: false,
        miningStatus: false,
        systemStats: false,
        blockchainSync: false,
        blockchainHealth: false,
        blockchainInfo: false,
        serviceDirect: false
    };
    
    try {
        // Probar servicio directamente
        results.serviceDirect = await testMiningMainnetService();
        
        // Probar endpoints de la API
        results.blockchainStatus = await testBlockchainStatus();
        results.sessionStart = await testMiningSessionStart();
        results.progressUpdate = await testMiningProgressUpdate();
        results.sessionStop = await testMiningSessionStop();
        results.rewardTransaction = await testMiningRewardTransaction();
        results.miningStatus = await testMiningStatus();
        results.systemStats = await testSystemStats();
        results.blockchainSync = await testBlockchainSync();
        results.blockchainHealth = await testBlockchainHealth();
        results.blockchainInfo = await testBlockchainInfo();
        
    } catch (error) {
        console.error('❌ Error ejecutando pruebas:', error.message);
    }
    
    // Mostrar resumen de resultados
    console.log('\n' + '=' .repeat(60));
    console.log('📋 RESUMEN DE PRUEBAS');
    console.log('=' .repeat(60));
    
    Object.entries(results).forEach(([test, result]) => {
        const status = result ? '✅ PASÓ' : '❌ FALLÓ';
        console.log(`${test.padEnd(20)}: ${status}`);
    });
    
    const passedTests = Object.values(results).filter(Boolean).length;
    const totalTests = Object.keys(results).length;
    const successRate = ((passedTests / totalTests) * 100).toFixed(1);
    
    console.log('\n' + '=' .repeat(60));
    console.log(`🎯 RESULTADO FINAL: ${passedTests}/${totalTests} pruebas pasaron (${successRate}%)`);
    
    if (passedTests === totalTests) {
        console.log('🎉 ¡Todas las pruebas pasaron! La integración está funcionando correctamente.');
    } else {
        console.log('⚠️ Algunas pruebas fallaron. Revisa los logs para más detalles.');
    }
    
    console.log('=' .repeat(60));
}

// ========================================
// EJECUTAR PRUEBAS
// ========================================

if (require.main === module) {
    // Verificar si el servidor está ejecutándose
    console.log('🔍 Verificando si el servidor está ejecutándose...');
    
    runAllTests().catch(error => {
        console.error('❌ Error fatal en las pruebas:', error);
        process.exit(1);
    });
}

module.exports = {
    runAllTests,
    testBlockchainStatus,
    testMiningSessionStart,
    testMiningProgressUpdate,
    testMiningSessionStop,
    testMiningRewardTransaction,
    testMiningStatus,
    testSystemStats,
    testBlockchainSync,
    testBlockchainHealth,
    testBlockchainInfo,
    testMiningMainnetService
};
