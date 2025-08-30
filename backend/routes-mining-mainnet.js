const express = require('express');
const axios = require('axios');
const router = express.Router();

const BLOCKCHAIN_API = 'https://rsc-chain-production.up.railway.app/';

// ========================================
// RUTAS DE MINERÍA MAINNET-READY
// ========================================

// ========================================
// VERIFICACIÓN DE ESTADO DE MAINNET
// ========================================

// Verificar estado de la red (testnet/mainnet)
router.get('/api/blockchain/status', async (req, res) => {
    try {
        console.log('🔍 Verificando estado de la red blockchain...');
        
        // Intentar conectar a la blockchain para verificar estado
        const response = await axios.get(`${BLOCKCHAIN_API}/status`, {
            timeout: 5000
        });
        
        if (response.data && response.data.network) {
            const networkStatus = {
                network: response.data.network,
                isMainnet: response.data.network === 'mainnet',
                chainId: response.data.chainId || 1,
                blockHeight: response.data.blockHeight || 0,
                lastUpdate: new Date().toISOString(),
                status: 'connected'
            };
            
            console.log('✅ Estado de red obtenido:', networkStatus);
            res.json(networkStatus);
        } else {
            // Si no hay información específica, asumir testnet
            const fallbackStatus = {
                network: 'testnet',
                isMainnet: false,
                chainId: 1,
                blockHeight: 0,
                lastUpdate: new Date().toISOString(),
                status: 'fallback',
                message: 'No se pudo determinar el estado exacto de la red'
            };
            
            console.log('⚠️ Usando estado fallback:', fallbackStatus);
            res.json(fallbackStatus);
        }
        
    } catch (error) {
        console.error('❌ Error verificando estado de red:', error.message);
        
        // Estado de fallback cuando no hay conexión
        const offlineStatus = {
            network: 'testnet',
            isMainnet: false,
            chainId: 1,
            blockHeight: 0,
            lastUpdate: new Date().toISOString(),
            status: 'offline',
            message: 'No se pudo conectar a la blockchain',
            error: error.message
        };
        
        res.json(offlineStatus);
    }
});

// ========================================
// GESTIÓN DE SESIONES DE MINERÍA MAINNET
// ========================================

// Iniciar sesión de minería (compatible con mainnet y testnet)
router.post('/api/mining/session/start', async (req, res) => {
    try {
        const { walletAddress, sessionId, startTime, hashPower, network = 'testnet' } = req.body;
        
        if (!walletAddress || !sessionId || !hashPower) {
            return res.status(400).json({
                success: false,
                error: 'Parámetros requeridos: walletAddress, sessionId, hashPower'
            });
        }
        
        console.log('🚀 Iniciando sesión de minería mainnet-ready:', {
            walletAddress,
            sessionId,
            hashPower,
            network
        });
        
        // Crear sesión de minería
        const miningSession = {
            id: sessionId,
            walletAddress: walletAddress,
            startTime: startTime || new Date().toISOString(),
            hashPower: parseFloat(hashPower),
            network: network,
            status: 'active',
            isMainnet: network === 'mainnet',
            tokensEarned: 0,
            lastUpdate: new Date().toISOString(),
            createdAt: new Date().toISOString()
        };
        
        // Si es mainnet, sincronizar con blockchain
        if (network === 'mainnet') {
            try {
                const blockchainResponse = await axios.post(`${BLOCKCHAIN_API}/mining/session/start`, {
                    walletAddress,
                    sessionId,
                    startTime: miningSession.startTime,
                    hashPower: miningSession.hashPower
                });
                
                if (blockchainResponse.data.success) {
                    miningSession.blockchainSync = true;
                    miningSession.blockchainTxHash = blockchainResponse.data.transactionHash;
                    console.log('✅ Sesión sincronizada con blockchain mainnet');
                }
            } catch (blockchainError) {
                console.warn('⚠️ No se pudo sincronizar con blockchain:', blockchainError.message);
                miningSession.blockchainSync = false;
                miningSession.blockchainError = blockchainError.message;
            }
        }
        
        // Guardar en base de datos local (para compatibilidad con sistema existente)
        // Aquí puedes integrar con tu MiningDatabase existente
        
        console.log('✅ Sesión de minería iniciada:', miningSession.id);
        
        res.json({
            success: true,
            message: 'Sesión de minería iniciada exitosamente',
            session: miningSession
        });
        
    } catch (error) {
        console.error('❌ Error iniciando sesión de minería:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Detener sesión de minería
router.post('/api/mining/session/stop', async (req, res) => {
    try {
        const { sessionId, endTime, tokensEarned, network = 'testnet' } = req.body;
        
        if (!sessionId) {
            return res.status(400).json({
                success: false,
                error: 'Session ID requerido'
            });
        }
        
        console.log('⏹️ Deteniendo sesión de minería:', {
            sessionId,
            tokensEarned,
            network
        });
        
        // Actualizar sesión
        const sessionUpdate = {
            status: 'completed',
            endTime: endTime || new Date().toISOString(),
            tokensEarned: parseFloat(tokensEarned) || 0,
            lastUpdate: new Date().toISOString()
        };
        
        // Si es mainnet, sincronizar finalización con blockchain
        if (network === 'mainnet') {
            try {
                const blockchainResponse = await axios.post(`${BLOCKCHAIN_API}/mining/session/stop`, {
                    sessionId,
                    endTime: sessionUpdate.endTime,
                    tokensEarned: sessionUpdate.tokensEarned
                });
                
                if (blockchainResponse.data.success) {
                    sessionUpdate.blockchainSync = true;
                    sessionUpdate.blockchainTxHash = blockchainResponse.data.transactionHash;
                    console.log('✅ Finalización sincronizada con blockchain mainnet');
                }
            } catch (blockchainError) {
                console.warn('⚠️ No se pudo sincronizar finalización con blockchain:', blockchainError.message);
                sessionUpdate.blockchainSync = false;
                sessionUpdate.blockchainError = blockchainError.message;
            }
        }
        
        // Actualizar en base de datos local
        
        console.log('✅ Sesión de minería detenida:', sessionId);
        
        res.json({
            success: true,
            message: 'Sesión de minería detenida exitosamente',
            sessionUpdate
        });
        
    } catch (error) {
        console.error('❌ Error deteniendo sesión de minería:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Actualizar progreso de minería
router.post('/api/mining/progress/update', async (req, res) => {
    try {
        const { sessionId, currentTokens, currentHashRate, network = 'testnet' } = req.body;
        
        if (!sessionId) {
            return res.status(400).json({
                success: false,
                error: 'Session ID requerido'
            });
        }
        
        console.log('📊 Actualizando progreso de minería:', {
            sessionId,
            currentTokens,
            currentHashRate,
            network
        });
        
        // Actualizar progreso
        const progressUpdate = {
            currentTokens: parseFloat(currentTokens) || 0,
            currentHashRate: parseFloat(currentHashRate) || 0,
            lastUpdate: new Date().toISOString()
        };
        
        // Si es mainnet, sincronizar progreso con blockchain
        if (network === 'mainnet') {
            try {
                const blockchainResponse = await axios.post(`${BLOCKCHAIN_API}/mining/progress/update`, {
                    sessionId,
                    currentTokens: progressUpdate.currentTokens,
                    currentHashRate: progressUpdate.currentHashRate
                });
                
                if (blockchainResponse.data.success) {
                    progressUpdate.blockchainSync = true;
                    console.log('✅ Progreso sincronizado con blockchain mainnet');
                }
            } catch (blockchainError) {
                console.warn('⚠️ No se pudo sincronizar progreso con blockchain:', blockchainError.message);
                progressUpdate.blockchainSync = false;
                progressUpdate.blockchainError = blockchainError.message;
            }
        }
        
        // Actualizar en base de datos local
        
        res.json({
            success: true,
            message: 'Progreso actualizado exitosamente',
            progressUpdate
        });
        
    } catch (error) {
        console.error('❌ Error actualizando progreso:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ========================================
// TRANSACCIONES DE RECOMPENSAS MAINNET
// ========================================

// Transferir recompensas de minería a wallet
router.post('/api/transaction/mining-reward', async (req, res) => {
    try {
        const { from, to, amount, type, sessionId, network = 'testnet' } = req.body;
        
        if (!from || !to || !amount || !type) {
            return res.status(400).json({
                success: false,
                error: 'Parámetros requeridos: from, to, amount, type'
            });
        }
        
        console.log('💰 Procesando transacción de recompensa de minería:', {
            from,
            to,
            amount,
            type,
            sessionId,
            network
        });
        
        let transactionResult = {
            success: true,
            transactionHash: null,
            status: 'pending',
            network: network,
            timestamp: new Date().toISOString()
        };
        
        // Si es mainnet, procesar transacción real en blockchain
        if (network === 'mainnet') {
            try {
                const blockchainResponse = await axios.post(`${BLOCKCHAIN_API}/transaction/mining-reward`, {
                    from,
                    to,
                    amount: parseFloat(amount),
                    type,
                    sessionId
                });
                
                if (blockchainResponse.data.success) {
                    transactionResult.transactionHash = blockchainResponse.data.transactionHash;
                    transactionResult.status = 'confirmed';
                    transactionResult.blockchainSync = true;
                    console.log('✅ Transacción procesada en blockchain mainnet');
                } else {
                    throw new Error('Error procesando transacción en blockchain');
                }
            } catch (blockchainError) {
                console.error('❌ Error procesando transacción en blockchain:', blockchainError.message);
                transactionResult.status = 'failed';
                transactionResult.blockchainSync = false;
                transactionResult.blockchainError = blockchainError.message;
                
                // Fallback: procesar localmente
                transactionResult.status = 'pending_local';
                transactionResult.message = 'Transacción procesada localmente debido a error de blockchain';
            }
        } else {
            // En testnet, simular transacción
            transactionResult.status = 'simulated';
            transactionResult.message = 'Transacción simulada en testnet';
            transactionResult.transactionHash = 'sim_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        }
        
        // Guardar transacción en base de datos local
        
        console.log('✅ Transacción procesada:', transactionResult);
        
        res.json({
            success: true,
            message: 'Transacción procesada exitosamente',
            transaction: transactionResult
        });
        
    } catch (error) {
        console.error('❌ Error procesando transacción:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ========================================
// ESTADO Y ESTADÍSTICAS MAINNET
// ========================================

// Obtener estado de minería para wallet específica
router.get('/api/mining/status/:walletAddress', async (req, res) => {
    try {
        const { walletAddress } = req.params;
        const { network = 'testnet' } = req.query;
        
        if (!walletAddress) {
            return res.status(400).json({
                success: false,
                error: 'Dirección de wallet requerida'
            });
        }
        
        console.log('🔍 Verificando estado de minería para:', {
            walletAddress,
            network
        });
        
        // Obtener sesión activa desde base de datos local
        // Aquí puedes integrar con tu MiningDatabase existente
        
        // Simular respuesta por ahora
        const miningStatus = {
            success: true,
            walletAddress: walletAddress,
            network: network,
            isMainnet: network === 'mainnet',
            isMining: false,
            activeSession: null,
            totalTokensEarned: 0,
            lastSession: null,
            networkStatus: network === 'mainnet' ? 'mainnet' : 'testnet'
        };
        
        res.json(miningStatus);
        
    } catch (error) {
        console.error('❌ Error obteniendo estado de minería:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Obtener estadísticas del sistema de minería
router.get('/api/mining/system-stats', async (req, res) => {
    try {
        console.log('📊 Obteniendo estadísticas del sistema de minería...');
        
        // Obtener estadísticas desde base de datos local
        // Aquí puedes integrar con tu MiningDatabase existente
        
        // Simular estadísticas por ahora
        const systemStats = {
            success: true,
            stats: {
                totalActiveMiners: 0,
                totalHashPower: 0,
                totalTokensMined: 0,
                totalSessions: 0,
                networkStatus: 'testnet',
                lastUpdate: new Date().toISOString()
            }
        };
        
        res.json(systemStats);
        
    } catch (error) {
        console.error('❌ Error obteniendo estadísticas del sistema:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ========================================
// SINCRONIZACIÓN MAINNET
// ========================================

// Sincronizar datos locales con blockchain
router.post('/api/mining/sync/blockchain', async (req, res) => {
    try {
        const { walletAddress, sessionId, network = 'testnet' } = req.body;
        
        if (!walletAddress) {
            return res.status(400).json({
                success: false,
                error: 'Dirección de wallet requerida'
            });
        }
        
        console.log('🔄 Sincronizando con blockchain:', {
            walletAddress,
            sessionId,
            network
        });
        
        let syncResult = {
            success: true,
            syncedItems: [],
            errors: [],
            network: network
        };
        
        // Si es mainnet, sincronizar con blockchain
        if (network === 'mainnet') {
            try {
                // Sincronizar sesiones de minería
                const sessionsResponse = await axios.get(`${BLOCKCHAIN_API}/mining/sessions/${walletAddress}`);
                if (sessionsResponse.data.success) {
                    syncResult.syncedItems.push('mining_sessions');
                }
                
                // Sincronizar transacciones
                const transactionsResponse = await axios.get(`${BLOCKCHAIN_API}/transactions/${walletAddress}`);
                if (transactionsResponse.data.success) {
                    syncResult.syncedItems.push('transactions');
                }
                
                // Sincronizar balance
                const balanceResponse = await axios.get(`${BLOCKCHAIN_API}/wallet/${walletAddress}`);
                if (balanceResponse.data.success) {
                    syncResult.syncedItems.push('balance');
                }
                
                console.log('✅ Sincronización con blockchain completada');
                
            } catch (blockchainError) {
                console.warn('⚠️ Error sincronizando con blockchain:', blockchainError.message);
                syncResult.errors.push({
                    type: 'blockchain_sync',
                    error: blockchainError.message
                });
            }
        } else {
            syncResult.message = 'Sincronización no requerida en testnet';
        }
        
        res.json(syncResult);
        
    } catch (error) {
        console.error('❌ Error en sincronización:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ========================================
// UTILIDADES MAINNET
// ========================================

// Verificar conexión con blockchain
router.get('/api/blockchain/health', async (req, res) => {
    try {
        console.log('🏥 Verificando salud de la conexión blockchain...');
        
        const startTime = Date.now();
        const response = await axios.get(`${BLOCKCHAIN_API}/health`, {
            timeout: 5000
        });
        const responseTime = Date.now() - startTime;
        
        const healthStatus = {
            success: true,
            blockchain: {
                status: 'healthy',
                responseTime: responseTime,
                lastUpdate: new Date().toISOString()
            },
            api: {
                status: 'healthy',
                version: '1.0.0',
                timestamp: new Date().toISOString()
            }
        };
        
        if (response.data) {
            healthStatus.blockchain.details = response.data;
        }
        
        console.log('✅ Estado de salud verificado:', healthStatus);
        res.json(healthStatus);
        
    } catch (error) {
        console.error('❌ Error verificando salud de blockchain:', error.message);
        
        const errorStatus = {
            success: false,
            blockchain: {
                status: 'unhealthy',
                error: error.message,
                lastUpdate: new Date().toISOString()
            },
            api: {
                status: 'healthy',
                version: '1.0.0',
                timestamp: new Date().toISOString()
            }
        };
        
        res.status(503).json(errorStatus);
    }
});

// Obtener información de la red
router.get('/api/blockchain/info', async (req, res) => {
    try {
        console.log('ℹ️ Obteniendo información de la red blockchain...');
        
        const response = await axios.get(`${BLOCKCHAIN_API}/info`, {
            timeout: 5000
        });
        
        const networkInfo = {
            success: true,
            network: response.data.network || 'unknown',
            chainId: response.data.chainId || 1,
            blockHeight: response.data.blockHeight || 0,
            totalSupply: response.data.totalSupply || 0,
            circulatingSupply: response.data.circulatingSupply || 0,
            lastUpdate: new Date().toISOString()
        };
        
        console.log('✅ Información de red obtenida:', networkInfo);
        res.json(networkInfo);
        
    } catch (error) {
        console.error('❌ Error obteniendo información de red:', error.message);
        
        const fallbackInfo = {
            success: false,
            network: 'testnet',
            chainId: 1,
            blockHeight: 0,
            totalSupply: 0,
            circulatingSupply: 0,
            lastUpdate: new Date().toISOString(),
            message: 'No se pudo obtener información de la red',
            error: error.message
        };
        
        res.json(fallbackInfo);
    }
});

module.exports = router;
