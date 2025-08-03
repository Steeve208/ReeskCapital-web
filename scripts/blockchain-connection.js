/* ================================
   BLOCKCHAIN CONNECTION - RSC CHAIN
================================ */

class BlockchainConnection {
  constructor() {
    this.baseUrl = 'https://rsc-chain-production.up.railway.app';
    this.isConnected = false;
    this.connectionStatus = 'disconnected';
    this.lastUpdate = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  // Verificar conexión con la blockchain
  async checkConnection() {
    try {
      console.log('🔗 Checking RSC Chain connection...');
      console.log('🌐 URL:', `${this.baseUrl}/api/status`);
      
      const response = await fetch(`${this.baseUrl}/api/status`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        mode: 'cors',
        timeout: 10000
      });
      
      console.log('📡 Response status:', response.status);
      console.log('📡 Response headers:', response.headers);
      
      if (response.ok) {
        const data = await response.json();
        this.isConnected = true;
        this.connectionStatus = 'connected';
        this.lastUpdate = new Date();
        console.log('✅ RSC Chain connected:', data);
        return { success: true, data };
      } else {
        console.error('❌ HTTP Error:', response.status, response.statusText);
        this.isConnected = false;
        this.connectionStatus = 'error';
        return { success: false, error: `HTTP ${response.status}: ${response.statusText}` };
      }
    } catch (error) {
      console.error('❌ RSC Chain connection failed:', error);
      this.isConnected = false;
      this.connectionStatus = 'error';
      
      // Proporcionar información más detallada del error
      let errorMessage = error.message;
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        errorMessage = 'Error de red: No se pudo conectar al servidor';
      } else if (error.name === 'TypeError' && error.message.includes('CORS')) {
        errorMessage = 'Error de CORS: El servidor no permite conexiones desde este origen';
      }
      
      return { 
        success: false, 
        error: errorMessage,
        details: {
          name: error.name,
          message: error.message,
          stack: error.stack
        }
      };
    }
  }

  // Obtener estadísticas de la blockchain
  async getBlockchainStats() {
    try {
      const response = await fetch(`${this.baseUrl}/api/blockchain/stats`);
      if (response.ok) {
        const data = await response.json();
        return { success: true, data };
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      console.error('Error getting blockchain stats:', error);
      return { success: false, error: error.message };
    }
  }

  // Obtener balance de wallet
  async getWalletBalance(address) {
    try {
      const response = await fetch(`${this.baseUrl}/api/wallet/balance/${address}`);
      if (response.ok) {
        const data = await response.json();
        return { success: true, data };
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      console.error('Error getting wallet balance:', error);
      return { success: false, error: error.message };
    }
  }

  // Obtener transacciones de wallet
  async getWalletTransactions(address) {
    try {
      const response = await fetch(`${this.baseUrl}/api/wallet/transactions/${address}`);
      if (response.ok) {
        const data = await response.json();
        return { success: true, data };
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      console.error('Error getting wallet transactions:', error);
      return { success: false, error: error.message };
    }
  }

  // Obtener bloques recientes
  async getRecentBlocks(limit = 10) {
    try {
      const response = await fetch(`${this.baseUrl}/api/blockchain/blocks?limit=${limit}`);
      if (response.ok) {
        const data = await response.json();
        return { success: true, data };
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      console.error('Error getting recent blocks:', error);
      return { success: false, error: error.message };
    }
  }

  // Obtener transacciones recientes
  async getRecentTransactions(limit = 10) {
    try {
      const response = await fetch(`${this.baseUrl}/api/blockchain/transactions?limit=${limit}`);
      if (response.ok) {
        const data = await response.json();
        return { success: true, data };
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      console.error('Error getting recent transactions:', error);
      return { success: false, error: error.message };
    }
  }

  // Obtener pools de staking
  async getStakingPools() {
    try {
      const response = await fetch(`${this.baseUrl}/api/staking/pools`);
      if (response.ok) {
        const data = await response.json();
        return { success: true, data };
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      console.error('Error getting staking pools:', error);
      return { success: false, error: error.message };
    }
  }

  // Obtener validadores
  async getValidators() {
    try {
      const response = await fetch(`${this.baseUrl}/api/staking/validators`);
      if (response.ok) {
        const data = await response.json();
        return { success: true, data };
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      console.error('Error getting validators:', error);
      return { success: false, error: error.message };
    }
  }

  // Obtener órdenes P2P
  async getP2POrders() {
    try {
      const response = await fetch(`${this.baseUrl}/api/p2p/orders`);
      if (response.ok) {
        const data = await response.json();
        return { success: true, data };
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      console.error('Error getting P2P orders:', error);
      return { success: false, error: error.message };
    }
  }

  // Obtener estado de minería
  async getMiningStatus(address) {
    try {
      const response = await fetch(`${this.baseUrl}/api/mining/status/${address}`);
      if (response.ok) {
        const data = await response.json();
        return { success: true, data };
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      console.error('Error getting mining status:', error);
      return { success: false, error: error.message };
    }
  }

  // Crear nueva wallet
  async createWallet() {
    try {
      const response = await fetch(`${this.baseUrl}/api/wallet/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        return { success: true, data };
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      console.error('Error creating wallet:', error);
      return { success: false, error: error.message };
    }
  }

  // Importar wallet existente
  async importWallet(privateKey) {
    try {
      const response = await fetch(`${this.baseUrl}/api/wallet/import`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ privateKey })
      });
      
      if (response.ok) {
        const data = await response.json();
        return { success: true, data };
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      console.error('Error importing wallet:', error);
      return { success: false, error: error.message };
    }
  }

  // Importar wallet con seed phrase
  async importWalletFromSeed(seedPhrase) {
    try {
      const response = await fetch(`${this.baseUrl}/api/wallet/import-seed`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ seedPhrase })
      });
      
      if (response.ok) {
        const data = await response.json();
        return { success: true, data };
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      console.error('Error importing wallet from seed:', error);
      return { success: false, error: error.message };
    }
  }

  // Validar dirección de wallet
  async validateWalletAddress(address) {
    try {
      const response = await fetch(`${this.baseUrl}/api/wallet/validate/${address}`);
      if (response.ok) {
        const data = await response.json();
        return { success: true, data };
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      console.error('Error validating wallet address:', error);
      return { success: false, error: error.message };
    }
  }

  // Enviar transacción
  async sendTransaction(transactionData) {
    try {
      const response = await fetch(`${this.baseUrl}/api/wallet/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(transactionData)
      });
      
      if (response.ok) {
        const data = await response.json();
        return { success: true, data };
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      console.error('Error sending transaction:', error);
      return { success: false, error: error.message };
    }
  }

  // Delegar tokens
  async delegateTokens(delegationData) {
    try {
      const response = await fetch(`${this.baseUrl}/api/staking/delegate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(delegationData)
      });
      
      if (response.ok) {
        const data = await response.json();
        return { success: true, data };
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      console.error('Error delegating tokens:', error);
      return { success: false, error: error.message };
    }
  }

  // Crear orden P2P
  async createP2POrder(orderData) {
    try {
      const response = await fetch(`${this.baseUrl}/api/p2p/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
      });
      
      if (response.ok) {
        const data = await response.json();
        return { success: true, data };
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      console.error('Error creating P2P order:', error);
      return { success: false, error: error.message };
    }
  }

  // Iniciar minería
  async startMining(miningData) {
    try {
      const response = await fetch(`${this.baseUrl}/api/mining/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(miningData)
      });
      
      if (response.ok) {
        const data = await response.json();
        return { success: true, data };
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      console.error('Error starting mining:', error);
      return { success: false, error: error.message };
    }
  }

  // Detener minería
  async stopMining(address) {
    try {
      const response = await fetch(`${this.baseUrl}/api/mining/stop`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ address })
      });
      
      if (response.ok) {
        const data = await response.json();
        return { success: true, data };
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      console.error('Error stopping mining:', error);
      return { success: false, error: error.message };
    }
  }

  // Obtener estado de conexión
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      status: this.connectionStatus,
      lastUpdate: this.lastUpdate,
      baseUrl: this.baseUrl
    };
  }

  // Reconectar automáticamente
  async reconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return false;
    }

    this.reconnectAttempts++;
    console.log(`🔄 Reconnecting to RSC Chain (attempt ${this.reconnectAttempts})...`);
    
    const result = await this.checkConnection();
    if (result.success) {
      this.reconnectAttempts = 0;
      return true;
    }
    
    return false;
  }
}

// Crear instancia global
const blockchainConnection = new BlockchainConnection();

// Inicializar conexión al cargar la página
document.addEventListener('DOMContentLoaded', async () => {
  console.log('🚀 Initializing RSC Chain connection...');
  await blockchainConnection.checkConnection();
});

// Exportar para uso global
window.blockchainConnection = blockchainConnection;
window.BlockchainConnection = BlockchainConnection; 