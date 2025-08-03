/* ===== WALLET FUNCTIONALITY ===== */

class WalletManager {
    constructor() {
        this.currentWallet = null;
        this.balance = 0;
        this.transactions = [];
        this.isInitialized = false;
        this.init();
    }

    async init() {
        try {
            // Check if wallet exists in localStorage
            const savedWallet = localStorage.getItem('rsc_wallet');
            if (savedWallet) {
                this.currentWallet = JSON.parse(savedWallet);
                await this.loadWalletData();
                this.showPage('overview');
            } else {
                // No wallet found, show login page
                this.showPage('login');
            }
            
            this.setupEventListeners();
            this.setupSidebarNavigation();
            this.isInitialized = true;
            
            // Start real-time updates only if wallet is connected
            if (this.currentWallet) {
                this.startRealTimeUpdates();
            }
            
        } catch (error) {
            console.error('Wallet initialization failed:', error);
            showNotification('error', 'Wallet Error', 'Failed to initialize wallet');
            // Show login page on error
            this.showPage('login');
        }
    }

    setupEventListeners() {
        // Wallet actions
        document.addEventListener('click', (e) => {
            if (e.target.matches('.wallet-action-btn')) {
                const action = e.target.dataset.action;
                this.handleWalletAction(action);
            }
            
            if (e.target.matches('.copy-btn')) {
                this.copyToClipboard(e.target.dataset.text);
            }
            
            if (e.target.matches('.backup-btn')) {
                this.handleBackup(e.target.dataset.type);
            }
        });

        // Form submissions
        document.addEventListener('submit', (e) => {
            if (e.target.matches('#send-form')) {
                e.preventDefault();
                this.handleSendTransaction();
            }
            
            if (e.target.matches('#login-form')) {
                e.preventDefault();
                this.handleWalletLogin();
            }
        });

        // Settings toggles
        document.addEventListener('change', (e) => {
            if (e.target.matches('.toggle-switch')) {
                this.handleSettingToggle(e.target);
            }
        });
    }

    setupSidebarNavigation() {
        const navLinks = document.querySelectorAll('.wallet-nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = link.dataset.page;
                this.showPage(page);
                
                // Update active state
                navLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
            });
        });
    }

    async loadWalletData() {
        if (!this.currentWallet) return;

        try {
            // Load balance
            await this.updateBalance();
            
            // Load transactions
            await this.loadTransactions();
            
            // Update UI
            this.updateWalletUI();
            
        } catch (error) {
            console.error('Failed to load wallet data:', error);
            showNotification('error', 'Data Error', 'Failed to load wallet data');
        }
    }

    async updateBalance() {
        if (!this.currentWallet) return;

        try {
            // Obtener balance real de la blockchain
            if (window.blockchainConnection && window.blockchainConnection.isConnected) {
                const result = await window.blockchainConnection.getWalletBalance(this.currentWallet.address);
                
                if (result.success) {
                    this.balance = result.data.balance || 0;
                    console.log('💰 Balance actualizado desde blockchain:', this.balance);
                } else {
                    console.error('Error obteniendo balance:', result.error);
                    // Usar balance local como respaldo
                    this.balance = parseFloat(localStorage.getItem('rsc_wallet_balance')) || 0;
                }
            } else {
                console.warn('⚠️ No conectado a blockchain, usando balance local');
                this.balance = parseFloat(localStorage.getItem('rsc_wallet_balance')) || 0;
            }
            
            // Guardar balance local como respaldo
            localStorage.setItem('rsc_wallet_balance', this.balance.toString());
            
        } catch (error) {
            console.error('Error actualizando balance:', error);
            // Usar balance local como respaldo
            this.balance = parseFloat(localStorage.getItem('rsc_wallet_balance')) || 0;
        }
    }

    async loadTransactions() {
        if (!this.currentWallet) return;

        try {
            // Obtener transacciones reales de la blockchain
            if (window.blockchainConnection && window.blockchainConnection.isConnected) {
                const result = await window.blockchainConnection.getWalletTransactions(this.currentWallet.address);
                
                if (result.success) {
                    this.transactions = result.data.transactions || [];
                    console.log('📊 Transacciones cargadas desde blockchain:', this.transactions.length);
                } else {
                    console.error('Error obteniendo transacciones:', result.error);
                    // Usar transacciones locales como respaldo
                    this.transactions = JSON.parse(localStorage.getItem('rsc_wallet_transactions')) || [];
                }
            } else {
                console.warn('⚠️ No conectado a blockchain, usando transacciones locales');
                this.transactions = JSON.parse(localStorage.getItem('rsc_wallet_transactions')) || [];
            }
            
            // Guardar transacciones locales como respaldo
            localStorage.setItem('rsc_wallet_transactions', JSON.stringify(this.transactions));
            
        } catch (error) {
            console.error('Error cargando transacciones:', error);
            // Usar transacciones locales como respaldo
            this.transactions = JSON.parse(localStorage.getItem('rsc_wallet_transactions')) || [];
        }
    }

    updateWalletUI() {
        this.updateBalanceUI();
        this.updateTransactionsUI();
        this.updateAddressUI();
    }

    updateBalanceUI() {
        const balanceElement = document.querySelector('.balance-amount');
        const currencyElement = document.querySelector('.balance-currency');
        const changeElement = document.querySelector('.balance-change');
        
        if (balanceElement) {
            balanceElement.textContent = this.formatNumber(this.balance);
        }
        
        if (currencyElement) {
            currencyElement.textContent = 'RSC';
        }
        
        if (changeElement) {
            // Simulate price change
            const change = Math.random() > 0.5 ? 0.05 : -0.03;
            const changeClass = change > 0 ? 'positive' : 'negative';
            const changeIcon = change > 0 ? '↗' : '↘';
            
            changeElement.className = `balance-change ${changeClass}`;
            changeElement.innerHTML = `${changeIcon} ${Math.abs(change).toFixed(2)}%`;
        }
    }

    updateTransactionsUI() {
        const container = document.querySelector('.transaction-history');
        if (!container) return;

        const transactionsList = container.querySelector('.transactions-list') || container;
        
        if (this.transactions.length === 0) {
            transactionsList.innerHTML = '<p class="no-transactions">No transactions yet</p>';
            return;
        }

        const transactionsHTML = this.transactions.map(tx => this.createTransactionHTML(tx)).join('');
        transactionsList.innerHTML = transactionsHTML;
    }

    createTransactionHTML(tx) {
        const type = tx.type === 'send' ? 'sent' : 'received';
        const amount = tx.type === 'send' ? `-${tx.amount}` : `+${tx.amount}`;
        const icon = tx.type === 'send' ? '↗' : '↘';
        
        return `
            <div class="transaction-item">
                <div class="transaction-icon ${type}">${icon}</div>
                <div class="transaction-details">
                    <div class="transaction-title">${tx.type === 'send' ? 'Sent' : 'Received'}</div>
                    <div class="transaction-subtitle">${tx.hash}</div>
                </div>
                <div class="transaction-amount ${type}">${amount} RSC</div>
            </div>
        `;
    }

    updateAddressUI() {
        const addressElement = document.querySelector('.wallet-address');
        const qrElement = document.querySelector('.qr-code');
        
        if (addressElement && this.currentWallet?.address) {
            addressElement.textContent = this.currentWallet.address;
        }
        
        if (qrElement && this.currentWallet?.address) {
            this.generateQRCode(this.currentWallet.address, qrElement);
        }
    }

    async generateQRCode(text, element) {
        try {
            // Simple QR code generation (in production, use a proper QR library)
            const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(text)}`;
            element.innerHTML = `<img src="${qrUrl}" alt="QR Code" style="width: 100%; height: 100%; object-fit: contain;">`;
        } catch (error) {
            console.error('Failed to generate QR code:', error);
            element.innerHTML = '<div style="text-align: center; color: #666;">QR Code Error</div>';
        }
    }

    async checkBlockchainConnection() {
        console.log('🔍 Verificando conexión con blockchain...');
        
        if (!window.blockchainConnection) {
            console.error('❌ blockchainConnection no está disponible');
            return false;
        }
        
        try {
            const result = await window.blockchainConnection.checkConnection();
            console.log('📡 Estado de conexión:', result);
            
            if (result.success) {
                console.log('✅ Conectado a RSC Chain');
                return true;
            } else {
                console.error('❌ Error de conexión:', result.error);
                return false;
            }
        } catch (error) {
            console.error('❌ Error verificando conexión:', error);
            return false;
        }
    }

    async handleWalletLogin() {
        console.log('🚀 handleWalletLogin iniciado');
        
        const form = document.getElementById('login-form');
        if (!form) {
            console.error('❌ Formulario de login no encontrado');
            return;
        }
        
        const privateKey = form.querySelector('[name="private_key"]').value;
        const seedPhrase = form.querySelector('[name="seed_phrase"]').value;
        const action = form.querySelector('[name="action"]').value; // create, import, import-seed

        console.log('📋 Datos del formulario:', { action, hasPrivateKey: !!privateKey, hasSeedPhrase: !!seedPhrase });

        if (action === 'import' && !privateKey) {
            console.error('❌ Clave privada requerida para importar');
            showNotification('error', 'Login Error', 'Please enter private key');
            return;
        }

        if (action === 'import-seed' && !seedPhrase) {
            console.error('❌ Seed phrase requerida para importar');
            showNotification('error', 'Login Error', 'Please enter seed phrase');
            return;
        }

        try {
            console.log('🔗 Verificando conexión con blockchain...');
            let walletData = null;

            // Verificar conexión con blockchain
            const isConnected = await this.checkBlockchainConnection();

            // Conectar a la blockchain real
            if (isConnected) {
                console.log('✅ Conectado a blockchain, procesando...');
                let result = null;

                switch (action) {
                    case 'create':
                        console.log('🆕 Creating new wallet on blockchain...');
                        result = await window.blockchainConnection.createWallet();
                        break;
                    
                    case 'import':
                        console.log('📥 Importing wallet with private key...');
                        result = await window.blockchainConnection.importWallet(privateKey);
                        break;
                    
                    case 'import-seed':
                        console.log('🌱 Importing wallet with seed phrase...');
                        result = await window.blockchainConnection.importWalletFromSeed(seedPhrase);
                        break;
                    
                    default:
                        console.error('❌ Acción inválida:', action);
                        throw new Error('Invalid action');
                }

                if (result.success) {
                    console.log('✅ Operación de wallet exitosa:', result.data);
                    walletData = {
                        address: result.data.address,
                        privateKey: result.data.privateKey || null,
                        seedPhrase: result.data.seedPhrase || null,
                        createdAt: new Date().toISOString(),
                        imported: action !== 'create'
                    };
                } else {
                    console.error('❌ Error en operación de wallet:', result.error);
                    showNotification('error', 'Wallet Error', result.error || 'Failed to process wallet');
                    return;
                }
            } else {
                console.warn('⚠️ No conectado a blockchain, creando wallet local');
                
                // Crear wallet local como respaldo
                walletData = {
                    address: this.generateAddress(),
                    privateKey: privateKey || 'local_generated',
                    seedPhrase: seedPhrase || null,
                    createdAt: new Date().toISOString(),
                    imported: action !== 'create',
                    local: true
                };
            }

            // Guardar wallet
            console.log('💾 Guardando wallet:', walletData.address);
            this.currentWallet = walletData;
            localStorage.setItem('rsc_wallet', JSON.stringify(walletData));
            
            // Cargar datos de la wallet
            console.log('📊 Cargando datos de la wallet...');
            await this.loadWalletData();
            this.showPage('overview');
            
            // Mostrar notificación apropiada
            if (action === 'create') {
                console.log('✅ Wallet creada exitosamente');
                showNotification('success', 'Wallet Created', 'New wallet created successfully');
            } else {
                console.log('✅ Wallet importada exitosamente');
                showNotification('success', 'Wallet Imported', 'Wallet imported successfully');
            }
            
        } catch (error) {
            console.error('❌ Error en handleWalletLogin:', error);
            showNotification('error', 'Login Error', 'Failed to process wallet');
        }
    }

    generateAddress() {
        // Generate a mock address (in production, use proper cryptography)
        const chars = '0123456789abcdef';
        let address = '0x';
        for (let i = 0; i < 40; i++) {
            address += chars[Math.floor(Math.random() * chars.length)];
        }
        return address;
    }

    async handleSendTransaction() {
        const form = document.getElementById('send-form');
        const toAddress = form.querySelector('[name="to_address"]').value;
        const amount = parseFloat(form.querySelector('[name="amount"]').value);
        const note = form.querySelector('[name="note"]').value;

        if (!toAddress || !amount) {
            showNotification('error', 'Transaction Error', 'Please fill all required fields');
            return;
        }

        if (amount > this.balance) {
            showNotification('error', 'Insufficient Balance', 'You don\'t have enough RSC');
            return;
        }

        try {
            // Enviar transacción real a la blockchain
            if (window.blockchainConnection && window.blockchainConnection.isConnected) {
                const transactionData = {
                    from: this.currentWallet.address,
                    to: toAddress,
                    amount: amount,
                    note: note,
                    timestamp: new Date().toISOString()
                };

                const result = await window.blockchainConnection.sendTransaction(transactionData);
                
                if (result.success) {
                    const transaction = {
                        hash: result.data.hash || this.generateTransactionHash(),
                        from: this.currentWallet.address,
                        to: toAddress,
                        amount: amount,
                        note: note,
                        type: 'send',
                        timestamp: new Date().toISOString(),
                        status: 'confirmed'
                    };

                    // Agregar a transacciones locales
                    this.transactions.unshift(transaction);
                    this.balance -= amount;
                    
                    // Actualizar UI
                    this.updateWalletUI();
                    
                    // Limpiar formulario
                    form.reset();
                    
                    showNotification('success', 'Transaction Sent', 'Transaction submitted successfully to blockchain');
                    
                    // Guardar datos locales
                    localStorage.setItem('rsc_wallet_balance', this.balance.toString());
                    localStorage.setItem('rsc_wallet_transactions', JSON.stringify(this.transactions));
                    
                } else {
                    console.error('Error enviando transacción:', result.error);
                    showNotification('error', 'Transaction Error', 'Failed to send transaction to blockchain');
                }
            } else {
                console.warn('⚠️ No conectado a blockchain, simulando transacción');
                
                // Simular transacción local
                const transaction = {
                    hash: this.generateTransactionHash(),
                    from: this.currentWallet.address,
                    to: toAddress,
                    amount: amount,
                    note: note,
                    type: 'send',
                    timestamp: new Date().toISOString(),
                    status: 'pending'
                };

                // Agregar a transacciones locales
                this.transactions.unshift(transaction);
                this.balance -= amount;
                
                // Actualizar UI
                this.updateWalletUI();
                
                // Limpiar formulario
                form.reset();
                
                showNotification('success', 'Transaction Sent', 'Transaction submitted (offline mode)');
                
                // Simular confirmación
                setTimeout(() => {
                    transaction.status = 'confirmed';
                    this.updateTransactionsUI();
                }, 3000);
                
                // Guardar datos locales
                localStorage.setItem('rsc_wallet_balance', this.balance.toString());
                localStorage.setItem('rsc_wallet_transactions', JSON.stringify(this.transactions));
            }
            
        } catch (error) {
            console.error('Transaction failed:', error);
            showNotification('error', 'Transaction Error', 'Failed to send transaction');
        }
    }

    generateTransactionHash() {
        const chars = '0123456789abcdef';
        let hash = '0x';
        for (let i = 0; i < 64; i++) {
            hash += chars[Math.floor(Math.random() * chars.length)];
        }
        return hash;
    }

    handleWalletAction(action) {
        switch (action) {
            case 'send':
                this.showPage('send');
                break;
            case 'receive':
                this.showPage('receive');
                break;
            case 'history':
                this.showPage('history');
                break;
            case 'settings':
                this.showPage('settings');
                break;
            case 'backup':
                this.handleBackup('wallet');
                break;
            case 'disconnect':
                this.disconnectWallet();
                break;
        }
    }

    disconnectWallet() {
        try {
            // Limpiar datos de la wallet
            this.currentWallet = null;
            this.balance = 0;
            this.transactions = [];
            
            // Limpiar localStorage
            localStorage.removeItem('rsc_wallet');
            localStorage.removeItem('rsc_wallet_balance');
            localStorage.removeItem('rsc_wallet_transactions');
            
            // Detener actualizaciones en tiempo real
            if (this.updateInterval) {
                clearInterval(this.updateInterval);
                this.updateInterval = null;
            }
            
            // Mostrar página de login
            this.showPage('login');
            
            showNotification('success', 'Wallet Disconnected', 'Wallet has been disconnected');
            
        } catch (error) {
            console.error('Error disconnecting wallet:', error);
            showNotification('error', 'Disconnect Error', 'Failed to disconnect wallet');
        }
    }

    async handleBackup(type) {
        if (!this.currentWallet) {
            showNotification('error', 'Backup Error', 'No wallet to backup');
            return;
        }

        try {
            let data, filename;
            
            if (type === 'private_key') {
                data = this.currentWallet.privateKey;
                filename = 'rsc_wallet_private_key.txt';
            } else if (type === 'seed_phrase') {
                data = this.currentWallet.seedPhrase || 'No seed phrase available';
                filename = 'rsc_wallet_seed_phrase.txt';
            } else {
                data = JSON.stringify(this.currentWallet, null, 2);
                filename = 'rsc_wallet_backup.json';
            }

            // Create download
            const blob = new Blob([data], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            showNotification('success', 'Backup Created', 'Wallet backup downloaded successfully');
            
        } catch (error) {
            console.error('Backup failed:', error);
            showNotification('error', 'Backup Error', 'Failed to create backup');
        }
    }

    copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            showNotification('success', 'Copied', 'Address copied to clipboard');
        }).catch(() => {
            showNotification('error', 'Copy Failed', 'Failed to copy to clipboard');
        });
    }

    handleSettingToggle(toggle) {
        const setting = toggle.dataset.setting;
        const isActive = toggle.classList.contains('active');
        
        if (isActive) {
            toggle.classList.remove('active');
        } else {
            toggle.classList.add('active');
        }
        
        // Save setting
        localStorage.setItem(`wallet_setting_${setting}`, !isActive);
        
        showNotification('success', 'Setting Updated', `${setting} ${!isActive ? 'enabled' : 'disabled'}`);
    }

    showPage(pageName) {
        // Hide all sections
        const sections = document.querySelectorAll('.wallet-section');
        sections.forEach(section => section.classList.remove('active'));
        
        // Show selected section
        const selectedSection = document.querySelector(`#${pageName}`);
        if (selectedSection) {
            selectedSection.classList.add('active');
        }
        
        // Update navigation
        const navLinks = document.querySelectorAll('.wallet-nav-link');
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.dataset.page === pageName) {
                link.classList.add('active');
            }
        });
        
        // Check if wallet is required for this page
        if (pageName !== 'login' && !this.currentWallet) {
            console.warn('No wallet connected, redirecting to login');
            this.showPage('login');
            return;
        }
        
        // Update page content based on page
        switch (pageName) {
            case 'login':
                this.updateLoginPage();
                break;
            case 'overview':
                this.updateOverviewPage();
                break;
            case 'send':
                this.updateSendPage();
                break;
            case 'receive':
                this.updateReceivePage();
                break;
            case 'transactions':
                this.updateHistoryPage();
                break;
            case 'security':
                this.updateSettingsPage();
                break;
        }
    }

    updatePageContent(pageName) {
        switch (pageName) {
            case 'overview':
                this.updateOverviewPage();
                break;
            case 'send':
                this.updateSendPage();
                break;
            case 'receive':
                this.updateReceivePage();
                break;
            case 'history':
                this.updateHistoryPage();
                break;
            case 'settings':
                this.updateSettingsPage();
                break;
        }
    }

    updateOverviewPage() {
        // Overview page is updated by updateWalletUI()
    }

    updateSendPage() {
        const form = document.getElementById('send-form');
        if (form) {
            form.reset();
        }
    }

    updateReceivePage() {
        if (this.currentWallet?.address) {
            this.updateAddressUI();
        }
    }

    updateHistoryPage() {
        // History page is updated by updateTransactionsUI()
    }

    updateSettingsPage() {
        // Load saved settings
        const settings = ['notifications', 'auto_backup', 'dark_mode'];
        settings.forEach(setting => {
            const toggle = document.querySelector(`[data-setting="${setting}"]`);
            if (toggle) {
                const saved = localStorage.getItem(`wallet_setting_${setting}`);
                if (saved === 'true') {
                    toggle.classList.add('active');
                }
            }
        });
    }

    updateLoginPage() {
        const loginContainer = document.querySelector('.wallet-login-container');
        if (!loginContainer) return;

        // Mostrar formulario de login con opciones
        loginContainer.innerHTML = `
            <div class="wallet-login-header">
                <h2>🔐 Conectar Wallet</h2>
                <p>Selecciona una opción para conectar tu wallet</p>
            </div>
            
            <div class="wallet-login-options">
                <div class="login-option" data-action="create">
                    <div class="option-icon">🆕</div>
                    <div class="option-content">
                        <h3>Crear Nueva Wallet</h3>
                        <p>Genera una nueva wallet en la blockchain de RSC Chain. Se creará automáticamente una clave privada y seed phrase seguros.</p>
                    </div>
                </div>
                
                <div class="login-option" data-action="import">
                    <div class="option-icon">📥</div>
                    <div class="option-content">
                        <h3>Importar con Clave Privada</h3>
                        <p>Conecta una wallet existente usando tu clave privada de 64 caracteres (0x...).</p>
                    </div>
                </div>
                
                <div class="login-option" data-action="import-seed">
                    <div class="option-icon">🌱</div>
                    <div class="option-content">
                        <h3>Importar con Seed Phrase</h3>
                        <p>Conecta una wallet existente usando tu frase semilla de 12 o 24 palabras.</p>
                    </div>
                </div>
            </div>
            
            <form id="login-form" class="wallet-login-form" style="display: none;">
                <input type="hidden" name="action" value="">
                
                <div class="form-info" id="formInfo">
                    <!-- El mensaje informativo se mostrará aquí -->
                </div>
                
                <div class="form-group private-key-group" style="display: none;">
                    <label for="private_key">Clave Privada</label>
                    <input type="password" id="private_key" name="private_key" placeholder="0x..." required>
                    <small>Ingresa tu clave privada de 64 caracteres</small>
                </div>
                
                <div class="form-group seed-phrase-group" style="display: none;">
                    <label for="seed_phrase">Seed Phrase</label>
                    <textarea id="seed_phrase" name="seed_phrase" placeholder="palabra1 palabra2 palabra3..." rows="3" required></textarea>
                    <small>Ingresa tu frase semilla de 12 o 24 palabras</small>
                </div>
                
                <div class="form-actions">
                    <button type="button" class="btn-secondary" id="cancelBtn">Cancelar</button>
                    <button type="submit" class="btn-primary" id="submitBtn">Selecciona una opción</button>
                </div>
            </form>
            
            <div class="wallet-login-info">
                <h4>ℹ️ Información Importante</h4>
                <ul>
                    <li>🔒 Tus claves privadas nunca salen de tu dispositivo</li>
                    <li>🌐 Las wallets se crean en la blockchain de RSC Chain</li>
                    <li>💾 Guarda tu seed phrase en un lugar seguro</li>
                    <li>⚠️ Nunca compartas tu clave privada con nadie</li>
                </ul>
                
                <div class="connection-test-section">
                    <h5>🔍 Prueba de Conexión</h5>
                    <button type="button" class="btn-test" id="testConnectionBtn">
                        🧪 Probar Conexión Blockchain
                    </button>
                    <div id="connectionStatus" class="connection-status-info"></div>
                </div>
            </div>
        `;

        // Agregar event listeners para las opciones
        const options = loginContainer.querySelectorAll('.login-option');
        options.forEach(option => {
            option.addEventListener('click', () => {
                const action = option.dataset.action;
                const form = loginContainer.querySelector('#login-form');
                const actionInput = form.querySelector('[name="action"]');
                const privateKeyGroup = form.querySelector('.private-key-group');
                const seedPhraseGroup = form.querySelector('.seed-phrase-group');
                const submitBtn = form.querySelector('#submitBtn');
                const formInfo = form.querySelector('#formInfo');
                
                // Actualizar acción
                actionInput.value = action;
                
                // Mostrar campos apropiados
                privateKeyGroup.style.display = action === 'import' ? 'block' : 'none';
                seedPhraseGroup.style.display = action === 'import-seed' ? 'block' : 'none';
                
                // Actualizar texto del botón según la acción
                switch (action) {
                    case 'create':
                        submitBtn.textContent = '🆕 Crear Nueva Wallet';
                        formInfo.innerHTML = '<div class="info-message success">✅ Se creará una nueva wallet en la blockchain de RSC Chain con claves seguras.</div>';
                        break;
                    case 'import':
                        submitBtn.textContent = '📥 Importar con Clave Privada';
                        formInfo.innerHTML = '<div class="info-message warning">⚠️ Asegúrate de que tu clave privada sea correcta. Se conectará a la blockchain de RSC Chain.</div>';
                        break;
                    case 'import-seed':
                        submitBtn.textContent = '🌱 Importar con Seed Phrase';
                        formInfo.innerHTML = '<div class="info-message warning">⚠️ Asegúrate de que tu seed phrase sea correcta. Se conectará a la blockchain de RSC Chain.</div>';
                        break;
                    default:
                        submitBtn.textContent = 'Conectar Wallet';
                        formInfo.innerHTML = '';
                }
                
                // Mostrar formulario
                form.style.display = 'block';
                
                // Actualizar UI de opciones
                options.forEach(opt => opt.classList.remove('selected'));
                option.classList.add('selected');
            });
        });

        // Agregar event listener para el botón cancelar
        const cancelBtn = loginContainer.querySelector('#cancelBtn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                const form = loginContainer.querySelector('#login-form');
                const submitBtn = form.querySelector('#submitBtn');
                const formInfo = form.querySelector('#formInfo');
                
                form.style.display = 'none';
                
                // Resetear texto del botón y mensaje informativo
                submitBtn.textContent = 'Selecciona una opción';
                formInfo.innerHTML = '';
                
                // Deseleccionar opciones
                options.forEach(opt => opt.classList.remove('selected'));
            });
        }

        // Agregar event listener para el formulario
        const form = loginContainer.querySelector('#login-form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                console.log('🔄 Formulario enviado, procesando...');
                this.handleWalletLogin();
            });
        }

        // Agregar event listener para el botón de prueba de conexión
        const testConnectionBtn = loginContainer.querySelector('#testConnectionBtn');
        if (testConnectionBtn) {
            testConnectionBtn.addEventListener('click', async () => {
                console.log('🧪 Probando conexión...');
                testConnectionBtn.textContent = '🔄 Probando...';
                testConnectionBtn.disabled = true;
                
                const statusDiv = loginContainer.querySelector('#connectionStatus');
                
                try {
                    const isConnected = await this.checkBlockchainConnection();
                    
                    if (isConnected) {
                        statusDiv.innerHTML = '<span style="color: #10b981;">✅ Conectado a RSC Chain</span>';
                        testConnectionBtn.textContent = '✅ Conexión Exitosa';
                    } else {
                        statusDiv.innerHTML = '<span style="color: #ef4444;">❌ Error de conexión</span>';
                        testConnectionBtn.textContent = '❌ Error de Conexión';
                    }
                } catch (error) {
                    console.error('Error en prueba de conexión:', error);
                    statusDiv.innerHTML = '<span style="color: #ef4444;">❌ Error: ' + error.message + '</span>';
                    testConnectionBtn.textContent = '❌ Error';
                }
                
                setTimeout(() => {
                    testConnectionBtn.textContent = '🧪 Probar Conexión Blockchain';
                    testConnectionBtn.disabled = false;
                }, 3000);
            });
        }
    }

    startRealTimeUpdates() {
        // Update balance every 30 seconds
        setInterval(() => {
            if (this.currentWallet) {
                this.updateBalance();
            }
        }, 30000);
    }

    formatNumber(num) {
        return new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 6
        }).format(num);
    }
}

// Initialize wallet when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.walletManager = new WalletManager();
});

// Export for global access
window.WalletManager = WalletManager;
