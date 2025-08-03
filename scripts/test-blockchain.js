/* ================================
   TEST BLOCKCHAIN CONNECTION
================================ */

console.log('🧪 Testing RSC Chain connection...');

// Función para probar la conexión
async function testBlockchainConnection() {
    console.log('=== RSC CHAIN CONNECTION TEST ===');
    
    // Verificar si blockchainConnection está disponible
    if (typeof window.blockchainConnection === 'undefined') {
        console.error('❌ blockchainConnection no está disponible');
        return;
    }
    
    console.log('✅ blockchainConnection disponible');
    
    // Probar conexión
    console.log('🔗 Probando conexión...');
    const connectionResult = await window.blockchainConnection.checkConnection();
    
    if (connectionResult.success) {
        console.log('✅ Conexión exitosa:', connectionResult.data);
        
        // Probar obtener estadísticas
        console.log('📊 Probando obtener estadísticas...');
        const statsResult = await window.blockchainConnection.getBlockchainStats();
        
        if (statsResult.success) {
            console.log('✅ Estadísticas obtenidas:', statsResult.data);
        } else {
            console.error('❌ Error obteniendo estadísticas:', statsResult.error);
        }
        
        // Probar obtener bloques recientes
        console.log('🔍 Probando obtener bloques recientes...');
        const blocksResult = await window.blockchainConnection.getRecentBlocks(5);
        
        if (blocksResult.success) {
            console.log('✅ Bloques obtenidos:', blocksResult.data);
        } else {
            console.error('❌ Error obteniendo bloques:', blocksResult.error);
        }
        
        // Probar obtener transacciones recientes
        console.log('💸 Probando obtener transacciones recientes...');
        const txResult = await window.blockchainConnection.getRecentTransactions(5);
        
        if (txResult.success) {
            console.log('✅ Transacciones obtenidas:', txResult.data);
        } else {
            console.error('❌ Error obteniendo transacciones:', txResult.error);
        }
        
    } else {
        console.error('❌ Error de conexión:', connectionResult.error);
    }
    
    console.log('=== END RSC CHAIN CONNECTION TEST ===');
}

// Función para probar wallet
async function testWalletFunctionality() {
    console.log('=== WALLET FUNCTIONALITY TEST ===');
    
    // Simular una dirección de wallet
    const testAddress = '0x1234567890123456789012345678901234567890';
    
    console.log('👛 Probando obtener balance de wallet...');
    const balanceResult = await window.blockchainConnection.getWalletBalance(testAddress);
    
    if (balanceResult.success) {
        console.log('✅ Balance obtenido:', balanceResult.data);
    } else {
        console.error('❌ Error obteniendo balance:', balanceResult.error);
    }
    
    console.log('📊 Probando obtener transacciones de wallet...');
    const txResult = await window.blockchainConnection.getWalletTransactions(testAddress);
    
    if (txResult.success) {
        console.log('✅ Transacciones de wallet obtenidas:', txResult.data);
    } else {
        console.error('❌ Error obteniendo transacciones de wallet:', txResult.error);
    }
    
    console.log('=== END WALLET FUNCTIONALITY TEST ===');
}

// Función para probar staking
async function testStakingFunctionality() {
    console.log('=== STAKING FUNCTIONALITY TEST ===');
    
    console.log('💰 Probando obtener pools de staking...');
    const poolsResult = await window.blockchainConnection.getStakingPools();
    
    if (poolsResult.success) {
        console.log('✅ Pools de staking obtenidos:', poolsResult.data);
    } else {
        console.error('❌ Error obteniendo pools de staking:', poolsResult.error);
    }
    
    console.log('🏛️ Probando obtener validadores...');
    const validatorsResult = await window.blockchainConnection.getValidators();
    
    if (validatorsResult.success) {
        console.log('✅ Validadores obtenidos:', validatorsResult.data);
    } else {
        console.error('❌ Error obteniendo validadores:', validatorsResult.error);
    }
    
    console.log('=== END STAKING FUNCTIONALITY TEST ===');
}

// Función para probar P2P
async function testP2PFunctionality() {
    console.log('=== P2P FUNCTIONALITY TEST ===');
    
    console.log('🤝 Probando obtener órdenes P2P...');
    const ordersResult = await window.blockchainConnection.getP2POrders();
    
    if (ordersResult.success) {
        console.log('✅ Órdenes P2P obtenidas:', ordersResult.data);
    } else {
        console.error('❌ Error obteniendo órdenes P2P:', ordersResult.error);
    }
    
    console.log('=== END P2P FUNCTIONALITY TEST ===');
}

// Función para probar mining
async function testMiningFunctionality() {
    console.log('=== MINING FUNCTIONALITY TEST ===');
    
    const testAddress = '0x1234567890123456789012345678901234567890';
    
    console.log('⛏️ Probando obtener estado de minería...');
    const miningResult = await window.blockchainConnection.getMiningStatus(testAddress);
    
    if (miningResult.success) {
        console.log('✅ Estado de minería obtenido:', miningResult.data);
    } else {
        console.error('❌ Error obteniendo estado de minería:', miningResult.error);
    }
    
    console.log('=== END MINING FUNCTIONALITY TEST ===');
}

// Ejecutar todas las pruebas
async function runAllTests() {
    console.log('🚀 Iniciando pruebas de RSC Chain...');
    
    await testBlockchainConnection();
    await testWalletFunctionality();
    await testStakingFunctionality();
    await testP2PFunctionality();
    await testMiningFunctionality();
    
    console.log('✅ Todas las pruebas completadas');
}

// Ejecutar pruebas cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    // Esperar un poco para que se carguen los scripts
    setTimeout(() => {
        runAllTests();
    }, 2000);
});

// Exportar funciones para uso manual
window.testBlockchainConnection = testBlockchainConnection;
window.testWalletFunctionality = testWalletFunctionality;
window.testStakingFunctionality = testStakingFunctionality;
window.testP2PFunctionality = testP2PFunctionality;
window.testMiningFunctionality = testMiningFunctionality;
window.runAllTests = runAllTests; 