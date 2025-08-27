/* ===== WALLET RSC - JAVASCRIPT REDISEÑADO ===== */

class WalletRSC {
    constructor() {
        // Estado de la wallet
        this.state = {
            balance: 0,
            miningRewards: 0,
            stakingRewards: 0,
            transactions: [],
            currentSection: 'overview',
            isConnected: false,
            isBlockchainConnected: false,
            isP2PConnected: false,
            isMiningConnected: false
        };

        // Configuración
        this.config = {
            walletAddress: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
            rscPrice: 0.85, // Precio simulado en USD
            gasFees: {
                slow: 0.0001,
                normal: 0.0002,
                fast: 0.0003
            }
        };

        // Inicializar
        this.init();
    }

    async init() {
        try {
            console.log('🚀 Inicializando Wallet RSC...');
            
            // Configurar event listeners
            this.setupEventListeners();
            
            // Configurar navegación
            this.setupNavigation();
            
            // Cargar datos iniciales
            await this.loadInitialData();
            
            // Inicializar integraciones
            await this.initializeIntegrations();
            
            console.log('✅ Wallet RSC inicializada correctamente');
            
        } catch (error) {
            console.error('❌ Error inicializando wallet:', error);
            this.showNotification('Error inicializando wallet', 'error');
        }
    }

    // ===== EVENT LISTENERS =====
    
    setupEventListeners() {
        // Navegación
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.getAttribute('data-section');
                this.navigateToSection(section);
            });
        });

        // Botones de acción rápida
        document.getElementById('claimMiningBtn')?.addEventListener('click', () => {
            this.claimMiningRewards();
        });

        document.getElementById('p2pMarketplaceBtn')?.addEventListener('click', () => {
            this.connectToP2PMarketplace();
        });

        document.getElementById('blockchainConnectBtn')?.addEventListener('click', () => {
            this.connectToBlockchain();
        });

        document.getElementById('backupWalletBtn')?.addEventListener('click', () => {
            this.backupWallet();
        });



        // Formularios
        document.getElementById('sendForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSendTransaction();
        });

        // Botones de minería
        document.getElementById('startMiningBtn')?.addEventListener('click', () => {
            this.startMining();
        });

        document.getElementById('stopMiningBtn')?.addEventListener('click', () => {
            this.stopMining();
        });



        // Botones de utilidad
        document.getElementById('refreshBalanceBtn')?.addEventListener('click', () => {
            this.refreshBalance();
        });

        document.getElementById('copyAddressBtn')?.addEventListener('click', () => {
            this.copyWalletAddress();
        });

        document.getElementById('downloadQRBtn')?.addEventListener('click', () => {
            this.downloadQRCode();
        });

        // Botones del sidebar
        document.querySelector('.copy-address-btn')?.addEventListener('click', () => {
            this.copyWalletAddress();
        });

        document.querySelector('.qr-code-btn')?.addEventListener('click', () => {
            this.showQRCode();
        });
    }

    // ===== NAVIGATION =====
    
    setupNavigation() {
        // Marcar enlace activo
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
                link.classList.add('active');
            });
        });
    }

    navigateToSection(sectionName) {
        // Ocultar todas las secciones
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.add('hidden');
        });

        // Mostrar sección seleccionada
        const targetSection = document.getElementById(sectionName);
        if (targetSection) {
            targetSection.classList.remove('hidden');
            this.state.currentSection = sectionName;
            
            // Cargar datos específicos de la sección
            this.loadSectionData(sectionName);
        }
    }

    // ===== DATA LOADING =====
    
    async loadInitialData() {
        try {
            // Cargar balance
            await this.loadBalance();
            
            // Cargar transacciones
            await this.loadTransactions();
            
            // Cargar datos de minería
            await this.loadMiningData();
            
            // Actualizar transacciones recientes
            this.updateRecentTransactions();
            
            
            
        } catch (error) {
            console.error('Error cargando datos iniciales:', error);
        }
    }

    async loadBalance() {
        // Simular carga de balance desde blockchain
        const mockBalance = Math.random() * 1000;
        this.state.balance = mockBalance;
        
        this.updateBalanceDisplay();
    }

    async loadTransactions() {
        // Simular transacciones
        this.state.transactions = [
            {
                id: 'tx_001',
                type: 'received',
                amount: 100.5,
                from: '0x1234...5678',
                timestamp: new Date(Date.now() - 86400000),
                status: 'confirmed'
            },
            {
                id: 'tx_002',
                type: 'sent',
                amount: 25.0,
                to: '0x8765...4321',
                timestamp: new Date(Date.now() - 172800000),
                status: 'confirmed'
            }
        ];
        
        this.updateTransactionsDisplay();
    }

    async loadMiningData() {
        // Simular datos de minería
        this.state.miningRewards = Math.random() * 50;
        this.updateMiningDisplay();
    }



    loadSectionData(sectionName) {
        switch (sectionName) {
            case 'overview':
                this.loadOverviewData();
                break;
            case 'transactions':
                this.loadTransactionsData();
                break;
            case 'mining':
                this.loadMiningData();
                break;

        }
    }

    // ===== DISPLAY UPDATES =====
    
    updateBalanceDisplay() {
        const balanceElement = document.getElementById('mainBalance');
        if (balanceElement) {
            balanceElement.textContent = `${this.state.balance.toFixed(6)} RSC`;
        }

        const usdValue = (this.state.balance * this.config.rscPrice).toFixed(2);
        const usdElement = document.getElementById('balanceUSD');
        if (usdElement) {
            usdElement.textContent = `≈ $${usdValue} USD`;
        }

        // Actualizar estadísticas
        this.updateStatsDisplay();
    }

    updateStatsDisplay() {
        // Balance total
        const totalBalanceElement = document.getElementById('totalBalance');
        if (totalBalanceElement) {
            totalBalanceElement.textContent = this.state.balance.toFixed(6);
        }

        // Total enviado
        const totalSentElement = document.getElementById('totalSent');
        if (totalSentElement) {
            const totalSent = this.state.transactions
                .filter(tx => tx.type === 'sent')
                .reduce((sum, tx) => sum + tx.amount, 0);
            totalSentElement.textContent = totalSent.toFixed(6);
        }

        // Total recibido
        const totalReceivedElement = document.getElementById('totalReceived');
        if (totalReceivedElement) {
            const totalReceived = this.state.transactions
                .filter(tx => tx.type === 'received')
                .reduce((sum, tx) => sum + tx.amount, 0);
            totalReceivedElement.textContent = totalReceived.toFixed(6);
        }

        // Recompensas de minería
        const miningRewardsElement = document.getElementById('miningRewards');
        if (miningRewardsElement) {
            miningRewardsElement.textContent = this.state.miningRewards.toFixed(6);
        }
    }

    updateTransactionsDisplay() {
        const transactionsList = document.getElementById('transactionsList');
        if (!transactionsList) return;

        if (this.state.transactions.length === 0) {
            transactionsList.innerHTML = `
                <div class="text-center text-secondary py-8">
                    No hay transacciones para mostrar
                </div>
            `;
            return;
        }

        const transactionsHTML = this.state.transactions.map(tx => `
            <div class="offer-card">
                <div class="offer-header">
                    <span class="offer-type ${tx.type}">${tx.type === 'sent' ? 'Enviado' : 'Recibido'}</span>
                    <span class="offer-price">${tx.amount.toFixed(6)} RSC</span>
                </div>
                <div class="offer-details">
                    <div class="offer-detail">
                        <div class="offer-detail-label">Dirección</div>
                        <div class="offer-detail-value">${tx.type === 'sent' ? tx.to : tx.from}</div>
                    </div>
                    <div class="offer-detail">
                        <div class="offer-detail-label">Estado</div>
                        <div class="offer-detail-value">${tx.status}</div>
                    </div>
                    <div class="offer-detail">
                        <div class="offer-detail-label">Fecha</div>
                        <div class="offer-detail-value">${tx.timestamp.toLocaleDateString()}</div>
                    </div>
                </div>
            </div>
        `).join('');

        transactionsList.innerHTML = transactionsHTML;
    }

    updateRecentTransactions() {
        const recentTransactionsList = document.getElementById('recentTransactionsList');
        if (!recentTransactionsList) return;

        // Mostrar solo las últimas 5 transacciones
        const recentTransactions = this.state.transactions.slice(0, 5);

        if (recentTransactions.length === 0) {
            recentTransactionsList.innerHTML = `
                <div class="text-center text-secondary py-8">
                    No hay transacciones recientes
                </div>
            `;
            return;
        }

        const transactionsHTML = recentTransactions.map(tx => `
            <div class="transaction-item">
                <div class="transaction-info">
                    <div class="transaction-icon ${tx.type}">
                        ${tx.type === 'sent' ? '📤' : tx.type === 'received' ? '📥' : '⛏️'}
                    </div>
                    <div class="transaction-details">
                        <h4>${tx.description || (tx.type === 'sent' ? 'Enviado' : tx.type === 'received' ? 'Recibido' : 'Mining')}</h4>
                        <p>${tx.type === 'sent' ? 'A: ' + tx.to : tx.type === 'received' ? 'De: ' + tx.from : 'Recompensas de minería'}</p>
                    </div>
                </div>
                <div class="transaction-amount">
                    <div class="amount">${tx.amount.toFixed(6)} RSC</div>
                    <div class="date">${tx.timestamp.toLocaleDateString()}</div>
                </div>
            </div>
        `).join('');

        recentTransactionsList.innerHTML = transactionsHTML;
    }

    addTransaction(type, amount, description, address = null) {
        const transaction = {
            id: `tx_${Date.now()}`,
            type: type,
            amount: amount,
            description: description,
            from: type === 'sent' ? null : address || 'Sistema',
            to: type === 'sent' ? address : null,
            timestamp: new Date(),
            status: 'confirmed'
        };

        this.state.transactions.unshift(transaction);
        this.updateRecentTransactions();
    }

    updateMiningDisplay() {
        const hashrateElement = document.getElementById('miningHashrate');
        if (hashrateElement) {
            hashrateElement.textContent = '0 H/s';
        }

        const pendingRewardsElement = document.getElementById('pendingRewards');
        if (pendingRewardsElement) {
            pendingRewardsElement.textContent = this.state.miningRewards.toFixed(6);
        }
    }



    // ===== INTEGRATIONS =====
    
    async initializeIntegrations() {
        try {
            console.log('🔗 Inicializando integraciones...');
            
            // Conectar a blockchain
            await this.connectToBlockchain();
            
            // Conectar a sistema de minería
            await this.connectToMiningSystem();
            
            console.log('✅ Integraciones inicializadas');
            
        } catch (error) {
            console.error('❌ Error inicializando integraciones:', error);
        }
    }

    async connectToBlockchain() {
        try {
            this.showNotification('Conectando a RSC Chain...', 'info');
            
            // Simular conexión
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            this.state.isBlockchainConnected = true;
            this.updateIntegrationStatus('blockchainStatus', 'online');
            this.showNotification('✅ Conectado a RSC Chain', 'success');
            
        } catch (error) {
            console.error('Error conectando a blockchain:', error);
            this.showNotification('❌ Error conectando a blockchain', 'error');
        }
    }



    async connectToMiningSystem() {
        try {
            this.showNotification('Conectando al sistema de minería...', 'info');
            
            // Simular conexión
            await new Promise(resolve => setTimeout(resolve, 800));
            
            this.state.isMiningConnected = true;
            this.updateIntegrationStatus('miningIntegrationStatus', 'online');
            this.showNotification('✅ Conectado al sistema de minería', 'success');
            
        } catch (error) {
            console.error('Error conectando al sistema de minería:', error);
            this.showNotification('❌ Error conectando al sistema de minería', 'error');
        }
    }

    updateIntegrationStatus(elementId, status) {
        const element = document.getElementById(elementId);
        if (element) {
            element.className = `integration-status ${status}`;
            element.textContent = status === 'online' ? 'Conectado' : 'Desconectado';
        }
    }

    // ===== MINING FUNCTIONS =====
    
    async claimMiningRewards() {
        try {
            if (this.state.miningRewards <= 0) {
                this.showNotification('No hay recompensas para reclamar', 'warning');
                return;
            }

            this.showNotification('Reclamando recompensas de minería...', 'info');
            
            // Simular reclamación
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            const claimedAmount = this.state.miningRewards;
            this.state.balance += claimedAmount;
            this.state.miningRewards = 0;
            
            // Agregar transacción de mining
            this.addTransaction('mining', claimedAmount, 'Recompensas de Minería');
            
            this.updateBalanceDisplay();
            this.updateMiningDisplay();
            this.updateRecentTransactions();
            
            this.showNotification(`✅ Recompensas reclamadas: ${claimedAmount.toFixed(6)} RSC`, 'success');
            
        } catch (error) {
            console.error('Error reclamando recompensas:', error);
            this.showNotification('❌ Error reclamando recompensas', 'error');
        }
    }

    // Función para recibir tokens minados desde la página de minería
    receiveMiningRewards(amount) {
        try {
            this.state.miningRewards += amount;
            this.updateMiningDisplay();
            this.showNotification(`⛏️ Recibidos ${amount.toFixed(6)} RSC de minería`, 'success');
        } catch (error) {
            console.error('Error recibiendo recompensas de minería:', error);
        }
    }

    // Función para recibir tokens comprados del P2P
    receiveP2PTokens(amount, source = 'P2P Marketplace') {
        try {
            this.state.balance += amount;
            this.addTransaction('received', amount, source);
            this.updateBalanceDisplay();
            this.updateRecentTransactions();
            this.showNotification(`💱 Recibidos ${amount.toFixed(6)} RSC de ${source}`, 'success');
        } catch (error) {
            console.error('Error recibiendo tokens P2P:', error);
        }
    }

    startMining() {
        this.showNotification('⛏️ Minería iniciada', 'success');
    }

    stopMining() {
        this.showNotification('⏹️ Minería detenida', 'info');
    }



    // ===== TRANSACTION FUNCTIONS =====
    
    async handleSendTransaction() {
        try {
            const recipientAddress = document.getElementById('recipientAddress').value;
            const amount = parseFloat(document.getElementById('sendAmount').value);
            const gasFee = document.getElementById('gasFee').value;

            if (!recipientAddress || !amount || amount <= 0) {
                this.showNotification('Por favor completa todos los campos correctamente', 'error');
                return;
            }

            if (amount > this.state.balance) {
                this.showNotification('Saldo insuficiente', 'error');
                return;
            }

            this.showNotification('Procesando transacción...', 'info');
            
            // Simular procesamiento
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            // Actualizar balance
            this.state.balance -= amount;
            
            // Agregar transacción
            this.state.transactions.unshift({
                id: `tx_${Date.now()}`,
                type: 'sent',
                amount: amount,
                to: recipientAddress,
                timestamp: new Date(),
                status: 'confirmed'
            });
            
            this.updateBalanceDisplay();
            this.updateTransactionsDisplay();
            
            this.showNotification('✅ Transacción enviada exitosamente', 'success');
            
            // Limpiar formulario
            document.getElementById('sendForm').reset();
            
        } catch (error) {
            console.error('Error enviando transacción:', error);
            this.showNotification('❌ Error enviando transacción', 'error');
        }
    }

    // ===== UTILITY FUNCTIONS =====
    
    refreshBalance() {
        this.showNotification('Actualizando balance...', 'info');
        this.loadBalance();
        this.showNotification('✅ Balance actualizado', 'success');
    }

    copyWalletAddress() {
        navigator.clipboard.writeText(this.config.walletAddress).then(() => {
            this.showNotification('✅ Dirección copiada al portapapeles', 'success');
        }).catch(() => {
            this.showNotification('❌ Error copiando dirección', 'error');
        });
    }

    downloadQRCode() {
        this.showNotification('Función de descarga QR próximamente', 'info');
    }

    showQRCode() {
        this.showNotification('Mostrando código QR...', 'info');
        // Aquí se implementaría la generación del QR
    }

    backupWallet() {
        this.showNotification('Función de backup próximamente', 'info');
    }



    // ===== NOTIFICATIONS =====
    
    showNotification(message, type = 'info') {
        // Crear notificación
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-message">${message}</span>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;

        // Agregar estilos
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--card-bg);
            border: 1px solid var(--border-color);
            border-radius: var(--radius-md);
            padding: var(--spacing-md);
            color: var(--text-primary);
            z-index: 1000;
            min-width: 300px;
            box-shadow: var(--shadow-lg);
        `;

        // Agregar al DOM
        document.body.appendChild(notification);

        // Auto-remover después de 5 segundos
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }
}

// ===== INITIALIZATION =====

// Esperar a que el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    // Crear instancia global de la wallet
    window.wallet = new WalletRSC();
});

// Exportar para uso global
window.WalletRSC = WalletRSC;
