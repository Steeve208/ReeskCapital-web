/* ================================
   TEST BLOCKCHAIN CONNECTION
================================ */

console.log('🔍 Testing blockchain connection...');

// Función para probar la conexión básica
async function testBasicConnection() {
    console.log('=== BASIC CONNECTION TEST ===');
    
    if (typeof window.blockchainConnection === 'undefined') {
        console.error('❌ blockchainConnection no está disponible');
        return false;
    }
    
    console.log('✅ blockchainConnection disponible');
    
    try {
        const result = await window.blockchainConnection.checkConnection();
        console.log('📡 Resultado de conexión:', result);
        
        if (result.success) {
            console.log('✅ Conexión exitosa a RSC Chain');
            return true;
        } else {
            console.error('❌ Error de conexión:', result.error);
            return false;
        }
    } catch (error) {
        console.error('❌ Error en test de conexión:', error);
        return false;
    }
}

// Función para probar la creación de wallet
async function testWalletCreation() {
    console.log('=== WALLET CREATION TEST ===');
    
    if (typeof window.blockchainConnection === 'undefined') {
        console.error('❌ blockchainConnection no está disponible');
        return false;
    }
    
    try {
        console.log('🆕 Intentando crear wallet...');
        const result = await window.blockchainConnection.createWallet();
        console.log('📡 Resultado de creación:', result);
        
        if (result.success) {
            console.log('✅ Wallet creada exitosamente:', result.data);
            return true;
        } else {
            console.error('❌ Error creando wallet:', result.error);
            return false;
        }
    } catch (error) {
        console.error('❌ Error en test de creación:', error);
        return false;
    }
}

// Función para probar el estado de la red
async function testNetworkStatus() {
    console.log('=== NETWORK STATUS TEST ===');
    
    if (typeof window.blockchainConnection === 'undefined') {
        console.error('❌ blockchainConnection no está disponible');
        return false;
    }
    
    try {
        console.log('📊 Obteniendo estadísticas de red...');
        const result = await window.blockchainConnection.getBlockchainStats();
        console.log('📡 Estadísticas de red:', result);
        
        if (result.success) {
            console.log('✅ Estadísticas obtenidas:', result.data);
            return true;
        } else {
            console.error('❌ Error obteniendo estadísticas:', result.error);
            return false;
        }
    } catch (error) {
        console.error('❌ Error en test de estadísticas:', error);
        return false;
    }
}

// Función para mostrar información de debug
function showDebugInfo() {
    console.log('=== DEBUG INFO ===');
    
    console.log('🌐 URL de la blockchain:', window.blockchainConnection?.baseUrl);
    console.log('🔗 Estado de conexión:', window.blockchainConnection?.isConnected);
    console.log('📡 Status de conexión:', window.blockchainConnection?.connectionStatus);
    console.log('🕒 Última actualización:', window.blockchainConnection?.lastUpdate);
    
    // Verificar si los scripts están cargados
    console.log('📜 Scripts cargados:');
    console.log('  - blockchainConnection:', typeof window.blockchainConnection);
    console.log('  - walletManager:', typeof window.walletManager);
    console.log('  - apiRequest:', typeof window.apiRequest);
}

// Función para probar la API directamente
async function testDirectAPI() {
    console.log('=== DIRECT API TEST ===');
    
    const baseUrl = 'https://rsc-chain-production.up.railway.app';
    
    try {
        console.log('🔗 Probando endpoint de status...');
        const response = await fetch(`${baseUrl}/api/status`);
        console.log('📡 Respuesta HTTP:', response.status, response.statusText);
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Datos de status:', data);
            return true;
        } else {
            console.error('❌ Error HTTP:', response.status);
            return false;
        }
    } catch (error) {
        console.error('❌ Error en test directo:', error);
        return false;
    }
}

// Ejecutar todas las pruebas
async function runConnectionTests() {
    console.log('🚀 Iniciando pruebas de conexión...');
    
    showDebugInfo();
    
    const basicConnection = await testBasicConnection();
    const directAPI = await testDirectAPI();
    const networkStatus = await testNetworkStatus();
    const walletCreation = await testWalletCreation();
    
    console.log('📊 Resumen de pruebas:');
    console.log('  - Conexión básica:', basicConnection ? '✅' : '❌');
    console.log('  - API directa:', directAPI ? '✅' : '❌');
    console.log('  - Estado de red:', networkStatus ? '✅' : '❌');
    console.log('  - Creación de wallet:', walletCreation ? '✅' : '❌');
    
    if (basicConnection && directAPI && networkStatus && walletCreation) {
        console.log('🎉 Todas las pruebas pasaron');
    } else {
        console.log('⚠️ Algunas pruebas fallaron');
    }
}

// Ejecutar pruebas cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    // Esperar un poco para que se carguen los scripts
    setTimeout(() => {
        runConnectionTests();
    }, 2000);
});

// Exportar funciones para uso manual
window.testBasicConnection = testBasicConnection;
window.testWalletCreation = testWalletCreation;
window.testNetworkStatus = testNetworkStatus;
window.testDirectAPI = testDirectAPI;
window.showDebugInfo = showDebugInfo;
window.runConnectionTests = runConnectionTests; 