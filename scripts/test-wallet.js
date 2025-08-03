/* ================================
   TEST WALLET FUNCTIONALITY
================================ */

console.log('🧪 Testing Wallet functionality...');

// Función para probar la creación de wallet
async function testWalletCreation() {
    console.log('=== WALLET CREATION TEST ===');
    
    if (typeof window.blockchainConnection === 'undefined') {
        console.error('❌ blockchainConnection no está disponible');
        return;
    }
    
    console.log('🆕 Probando creación de wallet...');
    const result = await window.blockchainConnection.createWallet();
    
    if (result.success) {
        console.log('✅ Wallet creada exitosamente:', result.data);
        return result.data;
    } else {
        console.error('❌ Error creando wallet:', result.error);
        return null;
    }
}

// Función para probar la importación de wallet
async function testWalletImport() {
    console.log('=== WALLET IMPORT TEST ===');
    
    if (typeof window.blockchainConnection === 'undefined') {
        console.error('❌ blockchainConnection no está disponible');
        return;
    }
    
    // Simular una clave privada de prueba
    const testPrivateKey = '0x1234567890123456789012345678901234567890123456789012345678901234';
    
    console.log('📥 Probando importación de wallet...');
    const result = await window.blockchainConnection.importWallet(testPrivateKey);
    
    if (result.success) {
        console.log('✅ Wallet importada exitosamente:', result.data);
        return result.data;
    } else {
        console.error('❌ Error importando wallet:', result.error);
        return null;
    }
}

// Función para probar la validación de dirección
async function testAddressValidation() {
    console.log('=== ADDRESS VALIDATION TEST ===');
    
    if (typeof window.blockchainConnection === 'undefined') {
        console.error('❌ blockchainConnection no está disponible');
        return;
    }
    
    const testAddress = '0x1234567890123456789012345678901234567890';
    
    console.log('🔍 Probando validación de dirección...');
    const result = await window.blockchainConnection.validateWalletAddress(testAddress);
    
    if (result.success) {
        console.log('✅ Dirección validada:', result.data);
    } else {
        console.error('❌ Error validando dirección:', result.error);
    }
}

// Función para probar el balance de wallet
async function testWalletBalance() {
    console.log('=== WALLET BALANCE TEST ===');
    
    if (typeof window.blockchainConnection === 'undefined') {
        console.error('❌ blockchainConnection no está disponible');
        return;
    }
    
    const testAddress = '0x1234567890123456789012345678901234567890';
    
    console.log('💰 Probando obtención de balance...');
    const result = await window.blockchainConnection.getWalletBalance(testAddress);
    
    if (result.success) {
        console.log('✅ Balance obtenido:', result.data);
    } else {
        console.error('❌ Error obteniendo balance:', result.error);
    }
}

// Función para probar las transacciones de wallet
async function testWalletTransactions() {
    console.log('=== WALLET TRANSACTIONS TEST ===');
    
    if (typeof window.blockchainConnection === 'undefined') {
        console.error('❌ blockchainConnection no está disponible');
        return;
    }
    
    const testAddress = '0x1234567890123456789012345678901234567890';
    
    console.log('📊 Probando obtención de transacciones...');
    const result = await window.blockchainConnection.getWalletTransactions(testAddress);
    
    if (result.success) {
        console.log('✅ Transacciones obtenidas:', result.data);
    } else {
        console.error('❌ Error obteniendo transacciones:', result.error);
    }
}

// Función para probar el envío de transacciones
async function testSendTransaction() {
    console.log('=== SEND TRANSACTION TEST ===');
    
    if (typeof window.blockchainConnection === 'undefined') {
        console.error('❌ blockchainConnection no está disponible');
        return;
    }
    
    const transactionData = {
        from: '0x1234567890123456789012345678901234567890',
        to: '0x0987654321098765432109876543210987654321',
        amount: 0.001,
        note: 'Test transaction',
        timestamp: new Date().toISOString()
    };
    
    console.log('💸 Probando envío de transacción...');
    const result = await window.blockchainConnection.sendTransaction(transactionData);
    
    if (result.success) {
        console.log('✅ Transacción enviada:', result.data);
    } else {
        console.error('❌ Error enviando transacción:', result.error);
    }
}

// Función para probar el sistema de wallet completo
async function testWalletSystem() {
    console.log('=== WALLET SYSTEM TEST ===');
    
    // Verificar si WalletManager está disponible
    if (typeof window.walletManager === 'undefined') {
        console.error('❌ walletManager no está disponible');
        return;
    }
    
    console.log('✅ walletManager disponible');
    
    // Probar funciones del wallet manager
    console.log('📋 Estado del wallet:', window.walletManager.currentWallet);
    console.log('💰 Balance actual:', window.walletManager.balance);
    console.log('📊 Transacciones:', window.walletManager.transactions.length);
    
    // Probar métodos del wallet manager
    if (window.walletManager.currentWallet) {
        console.log('👛 Wallet conectada:', window.walletManager.currentWallet.address);
    } else {
        console.log('🔌 No hay wallet conectada');
    }
}

// Ejecutar todas las pruebas
async function runWalletTests() {
    console.log('🚀 Iniciando pruebas de Wallet...');
    
    await testWalletCreation();
    await testWalletImport();
    await testAddressValidation();
    await testWalletBalance();
    await testWalletTransactions();
    await testSendTransaction();
    await testWalletSystem();
    
    console.log('✅ Todas las pruebas de Wallet completadas');
}

// Ejecutar pruebas cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    // Esperar un poco para que se carguen los scripts
    setTimeout(() => {
        runWalletTests();
    }, 3000);
});

// Exportar funciones para uso manual
window.testWalletCreation = testWalletCreation;
window.testWalletImport = testWalletImport;
window.testAddressValidation = testAddressValidation;
window.testWalletBalance = testWalletBalance;
window.testWalletTransactions = testWalletTransactions;
window.testSendTransaction = testSendTransaction;
window.testWalletSystem = testWalletSystem;
window.runWalletTests = runWalletTests; 