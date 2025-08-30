// ========================================
// SERVICIO DE MINERÍA MAINNET-READY
// ========================================

const axios = require('axios');
const config = require('../config/mining-mainnet.config');
const MiningDatabase = require('../database/database');

class MiningMainnetService {
    constructor() {
        this.config = config;
        this.db = null;
        this.isInitialized = false;
        this.blockchainStatus = {
            isMainnet: false,
            network: 'testnet',
            lastCheck: null,
            isConnected: false
        };
    }

    async init() {
        try {
            // Inicializar base de datos
            this.db = new MiningDatabase();
            await this.db.init();
            
            // Verificar estado inicial de blockchain
            await this.checkBlockchainStatus();
            
            // Iniciar monitoreo periódico
            this.startBlockchainMonitoring();
            
            this.isInitialized = true;
            console.log('✅ Servicio de minería mainnet-ready inicializado');
            
            return true;
        } catch (error) {
            console.error('❌ Error inicializando servicio de minería mainnet:', error);
            throw error;
        }
    }

    // ========================================
    // VERIFICACIÓN DE ESTADO DE BLOCKCHAIN
    // ========================================

    async checkBlockchainStatus() {
        try {
            const response = await axios.get(`${this.config.blockchain.apiUrl}/status`, {
                timeout: this.config.blockchain.timeouts.connection
            });

            if (response.data && response.data.network) {
                this.blockchainStatus = {
                    isMainnet: response.data.network === 'mainnet',
                    network: response.data.network,
                    lastCheck: new Date().toISOString(),
                    isConnected: true,
                    chainId: response.data.chainId,
                    blockHeight: response.data.blockHeight
                };
                
                console.log('✅ Estado de blockchain verificado:', this.blockchainStatus);
            } else {
                throw new Error('Respuesta inválida del endpoint de estado');
            }
        } catch (error) {
            console.warn('⚠️ No se pudo verificar estado de blockchain:', error.message);
            
            this.blockchainStatus = {
                isMainnet: false,
                network: 'testnet',
                lastCheck: new Date().toISOString(),
                isConnected: false,
                error: error.message
            };
        }
    }

    startBlockchainMonitoring() {
        // Verificar estado cada 5 minutos
        setInterval(async () => {
            await this.checkBlockchainStatus();
        }, 5 * 60 * 1000);
    }

    // ========================================
    // GESTIÓN DE SESIONES DE MINERÍA
    // ========================================

    async startMiningSession(sessionData) {
        try {
            const { walletAddress, sessionId, hashPower, network = 'testnet' } = sessionData;
            
            // Validar parámetros
            if (!this.validateMiningSession(sessionData)) {
                throw new Error('Parámetros de sesión inválidos');
            }

            // Verificar si el usuario puede iniciar una nueva sesión
            const canStart = await this.canUserStartMining(walletAddress);
            if (!canStart.allowed) {
                throw new Error(canStart.reason);
            }

            // Crear sesión de minería
            const miningSession = {
                id: sessionId,
                walletAddress: walletAddress,
                startTime: new Date().toISOString(),
                hashPower: parseFloat(hashPower),
                network: network,
                status: 'active',
                isMainnet: network === 'mainnet',
                tokensEarned: 0,
                lastUpdate: new Date().toISOString(),
                createdAt: new Date().toISOString()
            };

            // Si es mainnet y la blockchain está disponible, sincronizar
            if (network === 'mainnet' && this.blockchainStatus.isConnected) {
                try {
                    const blockchainResponse = await this.syncSessionWithBlockchain(miningSession, 'start');
                    if (blockchainResponse.success) {
                        miningSession.blockchainSync = true;
                        miningSession.blockchainTxHash = blockchainResponse.transactionHash;
                    }
                } catch (blockchainError) {
                    console.warn('⚠️ No se pudo sincronizar con blockchain:', blockchainError.message);
                    miningSession.blockchainSync = false;
                    miningSession.blockchainError = blockchainError.message;
                }
            }

            // Guardar en base de datos
            await this.saveMiningSession(miningSession);

            // Actualizar estadísticas del sistema
            await this.updateSystemStats('session_started', miningSession);

            console.log('✅ Sesión de minería iniciada:', miningSession.id);
            
            return {
                success: true,
                session: miningSession,
                message: 'Sesión de minería iniciada exitosamente'
            };

        } catch (error) {
            console.error('❌ Error iniciando sesión de minería:', error);
            throw error;
        }
    }

    async stopMiningSession(sessionData) {
        try {
            const { sessionId, endTime, tokensEarned, network = 'testnet' } = sessionData;
            
            // Obtener sesión existente
            const existingSession = await this.getMiningSession(sessionId);
            if (!existingSession) {
                throw new Error('Sesión de minería no encontrada');
            }

            // Actualizar sesión
            const sessionUpdate = {
                status: 'completed',
                endTime: endTime || new Date().toISOString(),
                tokensEarned: parseFloat(tokensEarned) || existingSession.tokensEarned,
                lastUpdate: new Date().toISOString()
            };

            // Si es mainnet, sincronizar con blockchain
            if (network === 'mainnet' && this.blockchainStatus.isConnected) {
                try {
                    const blockchainResponse = await this.syncSessionWithBlockchain(
                        { ...existingSession, ...sessionUpdate }, 
                        'stop'
                    );
                    if (blockchainResponse.success) {
                        sessionUpdate.blockchainSync = true;
                        sessionUpdate.blockchainTxHash = blockchainResponse.transactionHash;
                    }
                } catch (blockchainError) {
                    console.warn('⚠️ No se pudo sincronizar con blockchain:', blockchainError.message);
                    sessionUpdate.blockchainSync = false;
                    sessionUpdate.blockchainError = blockchainError.message;
                }
            }

            // Actualizar en base de datos
            await this.updateMiningSession(sessionId, sessionUpdate);

            // Actualizar estadísticas del sistema
            await this.updateSystemStats('session_completed', {
                ...existingSession,
                ...sessionUpdate
            });

            console.log('✅ Sesión de minería detenida:', sessionId);
            
            return {
                success: true,
                sessionUpdate: sessionUpdate,
                message: 'Sesión de minería detenida exitosamente'
            };

        } catch (error) {
            console.error('❌ Error deteniendo sesión de minería:', error);
            throw error;
        }
    }

    async updateMiningProgress(sessionData) {
        try {
            const { sessionId, currentTokens, currentHashRate, network = 'testnet' } = sessionData;
            
            // Obtener sesión existente
            const existingSession = await this.getMiningSession(sessionId);
            if (!existingSession) {
                throw new Error('Sesión de minería no encontrada');
            }

            // Actualizar progreso
            const progressUpdate = {
                currentTokens: parseFloat(currentTokens) || 0,
                currentHashRate: parseFloat(currentHashRate) || 0,
                lastUpdate: new Date().toISOString()
            };

            // Si es mainnet, sincronizar con blockchain
            if (network === 'mainnet' && this.blockchainStatus.isConnected) {
                try {
                    const blockchainResponse = await this.syncProgressWithBlockchain(
                        sessionId, 
                        progressUpdate
                    );
                    if (blockchainResponse.success) {
                        progressUpdate.blockchainSync = true;
                    }
                } catch (blockchainError) {
                    console.warn('⚠️ No se pudo sincronizar progreso con blockchain:', blockchainError.message);
                    progressUpdate.blockchainSync = false;
                    progressUpdate.blockchainError = blockchainError.message;
                }
            }

            // Actualizar en base de datos
            await this.updateMiningSession(sessionId, progressUpdate);

            return {
                success: true,
                progressUpdate: progressUpdate,
                message: 'Progreso actualizado exitosamente'
            };

        } catch (error) {
            console.error('❌ Error actualizando progreso:', error);
            throw error;
        }
    }

    // ========================================
    // TRANSACCIONES Y RECOMPENSAS
    // ========================================

    async processMiningReward(transactionData) {
        try {
            const { from, to, amount, type, sessionId, network = 'testnet' } = transactionData;
            
            // Validar transacción
            if (!this.validateTransaction(transactionData)) {
                throw new Error('Datos de transacción inválidos');
            }

            let transactionResult = {
                success: true,
                transactionHash: null,
                status: 'pending',
                network: network,
                timestamp: new Date().toISOString()
            };

            // Si es mainnet, procesar en blockchain
            if (network === 'mainnet' && this.blockchainStatus.isConnected) {
                try {
                    const blockchainResponse = await this.processBlockchainTransaction(transactionData);
                    if (blockchainResponse.success) {
                        transactionResult.transactionHash = blockchainResponse.transactionHash;
                        transactionResult.status = 'confirmed';
                        transactionResult.blockchainSync = true;
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

            // Guardar transacción en base de datos
            await this.saveTransaction(transactionResult);

            console.log('✅ Transacción procesada:', transactionResult);
            
            return {
                success: true,
                message: 'Transacción procesada exitosamente',
                transaction: transactionResult
            };

        } catch (error) {
            console.error('❌ Error procesando transacción:', error);
            throw error;
        }
    }

    // ========================================
    // SINCRONIZACIÓN CON BLOCKCHAIN
    // ========================================

    async syncSessionWithBlockchain(sessionData, action) {
        try {
            const endpoint = action === 'start' ? 'mining/session/start' : 'mining/session/stop';
            
            const response = await axios.post(`${this.config.blockchain.apiUrl}/${endpoint}`, {
                walletAddress: sessionData.walletAddress,
                sessionId: sessionData.id,
                startTime: sessionData.startTime,
                endTime: sessionData.endTime,
                hashPower: sessionData.hashPower,
                tokensEarned: sessionData.tokensEarned
            }, {
                timeout: this.config.blockchain.timeouts.request
            });

            return response.data;
        } catch (error) {
            throw new Error(`Error sincronizando sesión con blockchain: ${error.message}`);
        }
    }

    async syncProgressWithBlockchain(sessionId, progressData) {
        try {
            const response = await axios.post(`${this.config.blockchain.apiUrl}/mining/progress/update`, {
                sessionId: sessionId,
                currentTokens: progressData.currentTokens,
                currentHashRate: progressData.currentHashRate
            }, {
                timeout: this.config.blockchain.timeouts.request
            });

            return response.data;
        } catch (error) {
            throw new Error(`Error sincronizando progreso con blockchain: ${error.message}`);
        }
    }

    async processBlockchainTransaction(transactionData) {
        try {
            const response = await axios.post(`${this.config.blockchain.apiUrl}/transaction/mining-reward`, {
                from: transactionData.from,
                to: transactionData.to,
                amount: parseFloat(transactionData.amount),
                type: transactionData.type,
                sessionId: transactionData.sessionId
            }, {
                timeout: this.config.blockchain.timeouts.request
            });

            return response.data;
        } catch (error) {
            throw new Error(`Error procesando transacción en blockchain: ${error.message}`);
        }
    }

    // ========================================
    // VALIDACIONES
    // ========================================

    validateMiningSession(sessionData) {
        const { walletAddress, sessionId, hashPower } = sessionData;
        
        if (!walletAddress || !sessionId || !hashPower) {
            return false;
        }

        if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
            return false;
        }

        const hashPowerNum = parseFloat(hashPower);
        if (isNaN(hashPowerNum) || 
            hashPowerNum < this.config.mining.hashPower.min || 
            hashPowerNum > this.config.mining.hashPower.max) {
            return false;
        }

        return true;
    }

    validateTransaction(transactionData) {
        const { from, to, amount, type } = transactionData;
        
        if (!from || !to || !amount || !type) {
            return false;
        }

        if (!/^0x[a-fA-F0-9]{40}$/.test(from) || !/^0x[a-fA-F0-9]{40}$/.test(to)) {
            return false;
        }

        const amountNum = parseFloat(amount);
        if (isNaN(amountNum) || amountNum <= 0) {
            return false;
        }

        return true;
    }

    async canUserStartMining(walletAddress) {
        try {
            // Verificar si ya hay una sesión activa
            const activeSession = await this.getActiveMiningSession(walletAddress);
            if (activeSession) {
                return {
                    allowed: false,
                    reason: 'Ya tienes una sesión de minería activa'
                };
            }

            // Verificar límite diario
            const dailySessions = await this.getDailySessions(walletAddress);
            if (dailySessions.length >= this.config.mining.session.maxSessionsPerDay) {
                return {
                    allowed: false,
                    reason: 'Has alcanzado el límite de sesiones diarias'
                };
            }

            // Verificar cooldown
            const lastSession = await this.getLastMiningSession(walletAddress);
            if (lastSession) {
                const timeSinceLastSession = Date.now() - new Date(lastSession.endTime).getTime();
                if (timeSinceLastSession < this.config.mining.session.cooldownPeriod) {
                    const remainingTime = Math.ceil((this.config.mining.session.cooldownPeriod - timeSinceLastSession) / 1000 / 60);
                    return {
                        allowed: false,
                        reason: `Debes esperar ${remainingTime} minutos antes de la próxima sesión`
                    };
                }
            }

            return { allowed: true };
        } catch (error) {
            console.error('❌ Error verificando si usuario puede minar:', error);
            return { allowed: false, reason: 'Error interno del servidor' };
        }
    }

    // ========================================
    // OPERACIONES DE BASE DE DATOS
    // ========================================

    async saveMiningSession(sessionData) {
        // Aquí integrarías con tu MiningDatabase existente
        // Por ahora, simulamos la operación
        console.log('💾 Guardando sesión de minería en base de datos:', sessionData.id);
        return true;
    }

    async updateMiningSession(sessionId, updateData) {
        // Aquí integrarías con tu MiningDatabase existente
        console.log('🔄 Actualizando sesión de minería:', sessionId, updateData);
        return true;
    }

    async getMiningSession(sessionId) {
        // Aquí integrarías con tu MiningDatabase existente
        // Por ahora, simulamos la operación
        return null;
    }

    async getActiveMiningSession(walletAddress) {
        // Aquí integrarías con tu MiningDatabase existente
        return null;
    }

    async getDailySessions(walletAddress) {
        // Aquí integrarías con tu MiningDatabase existente
        return [];
    }

    async getLastMiningSession(walletAddress) {
        // Aquí integrarías con tu MiningDatabase existente
        return null;
    }

    async saveTransaction(transactionData) {
        // Aquí integrarías con tu MiningDatabase existente
        console.log('💾 Guardando transacción en base de datos:', transactionData.transactionHash);
        return true;
    }

    async updateSystemStats(action, data) {
        // Aquí integrarías con tu MiningDatabase existente
        console.log('📊 Actualizando estadísticas del sistema:', action, data);
        return true;
    }

    // ========================================
    // UTILIDADES
    // ========================================

    getBlockchainStatus() {
        return this.blockchainStatus;
    }

    isMainnetActive() {
        return this.blockchainStatus.isMainnet && this.blockchainStatus.isConnected;
    }

    getNetworkInfo() {
        return {
            current: this.blockchainStatus.network,
            isMainnet: this.blockchainStatus.isMainnet,
            isConnected: this.blockchainStatus.isConnected,
            lastCheck: this.blockchainStatus.lastCheck
        };
    }
}

module.exports = MiningMainnetService;
