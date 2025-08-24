/* ===== DECENTRALIZED BANKING FUNCTIONALITY ===== */

class BankManager {
    constructor() {
        this.bankBalance = 0;
        this.transactions = [];
        this.paymentMethods = [];
        this.currencies = [];
        this.exchangeRates = {};
        this.isInitialized = false;
        this.init();
    }

    async init() {
        try {
            // Load bank data
            this.loadBankData();
            
            this.setupEventListeners();
            this.setupSidebarNavigation();
            this.showPage('payments');
            this.isInitialized = true;
            
            // Load initial data
            await this.loadCurrencies();
            await this.loadExchangeRates();
            await this.loadPaymentMethods();
            
        } catch (error) {
            console.error('Bank initialization failed:', error);
            showNotification('error', 'Bank Error', 'Failed to initialize banking system');
        }
    }

    setupEventListeners() {
        // Payment actions
        document.addEventListener('click', (e) => {
            if (e.target.matches('.payment-btn')) {
                const action = e.target.dataset.action;
                this.handlePaymentAction(action);
            }
            
            if (e.target.matches('.qr-scan-btn')) {
                this.handleQRScan();
            }
            
            if (e.target.matches('.recharge-btn')) {
                this.handleRecharge();
            }
        });

        // Form submissions
        document.addEventListener('submit', (e) => {
            if (e.target.matches('#payment-form')) {
                e.preventDefault();
                this.handlePaymentForm();
            }
            
            if (e.target.matches('#recharge-form')) {
                e.preventDefault();
                this.handleRechargeForm();
            }
        });

        // Currency conversion
        document.addEventListener('input', (e) => {
            if (e.target.matches('.amount-input')) {
                this.updateConversion(e.target);
            }
            
            if (e.target.matches('.currency-select')) {
                this.updateConversion(e.target);
            }
        });
    }

    setupSidebarNavigation() {
        const navLinks = document.querySelectorAll('.bank-nav-link');
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

    loadBankData() {
        // Load from localStorage
        const savedBalance = localStorage.getItem('rsc_bank_balance');
        const savedTransactions = localStorage.getItem('rsc_bank_transactions');
        
        if (savedBalance) {
            this.bankBalance = parseFloat(savedBalance);
        }
        
        if (savedTransactions) {
            this.transactions = JSON.parse(savedTransactions);
        }
    }

    saveBankData() {
        localStorage.setItem('rsc_bank_balance', this.bankBalance.toString());
        localStorage.setItem('rsc_bank_transactions', JSON.stringify(this.transactions));
    }

    async loadCurrencies() {
        try {
            // Load currencies from API
            // const response = await fetch(`${API_BASE_URL}/api/bank/currencies`); // Backend desconectado
            const data = await response.json();
            
            if (data.success) {
                this.currencies = data.currencies;
                this.updateCurrenciesUI();
            }
        } catch (error) {
            console.error('Failed to load currencies:', error);
            // Load mock data
            this.loadMockCurrencies();
        }
    }

    loadMockCurrencies() {
        this.currencies = [
            { code: 'USD', name: 'US Dollar', symbol: '$', rate: 1.0 },
            { code: 'EUR', name: 'Euro', symbol: '€', rate: 0.85 },
            { code: 'GBP', name: 'British Pound', symbol: '£', rate: 0.73 },
            { code: 'JPY', name: 'Japanese Yen', symbol: '¥', rate: 110.0 },
            { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', rate: 1.25 },
            { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', rate: 1.35 },
            { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF', rate: 0.92 },
            { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', rate: 6.45 }
        ];
        this.updateCurrenciesUI();
    }

    async loadExchangeRates() {
        try {
            // Load exchange rates from API
            // const response = await fetch(`${API_BASE_URL}/api/bank/exchange-rates`); // Backend desconectado
            const data = await response.json();
            
            if (data.success) {
                this.exchangeRates = data.rates;
            }
        } catch (error) {
            console.error('Failed to load exchange rates:', error);
            // Use mock rates
            this.exchangeRates = {
                USD: 1.0,
                EUR: 0.85,
                GBP: 0.73,
                JPY: 110.0,
                CAD: 1.25,
                AUD: 1.35,
                CHF: 0.92,
                CNY: 6.45
            };
        }
    }

    async loadPaymentMethods() {
        try {
            // Load payment methods from API
            // const response = await fetch(`${API_BASE_URL}/api/bank/payment-methods`); // Backend desconectado
            const data = await response.json();
            
            if (data.success) {
                this.paymentMethods = data.methods;
                this.updatePaymentMethodsUI();
            }
        } catch (error) {
            console.error('Failed to load payment methods:', error);
            // Load mock data
            this.loadMockPaymentMethods();
        }
    }

    loadMockPaymentMethods() {
        this.paymentMethods = [
            {
                id: 'card',
                name: 'Credit/Debit Card',
                icon: '💳',
                description: 'Visa, Mastercard, American Express',
                processingTime: 'Instant',
                fees: '2.5%'
            },
            {
                id: 'bank',
                name: 'Bank Transfer',
                icon: '🏦',
                description: 'Direct bank transfer',
                processingTime: '1-3 business days',
                fees: '1.0%'
            },
            {
                id: 'paypal',
                name: 'PayPal',
                icon: '📧',
                description: 'PayPal account',
                processingTime: 'Instant',
                fees: '3.0%'
            },
            {
                id: 'crypto',
                name: 'Cryptocurrency',
                icon: '₿',
                description: 'Bitcoin, Ethereum, RSC',
                processingTime: '10-30 minutes',
                fees: '0.5%'
            }
        ];
        this.updatePaymentMethodsUI();
    }

    handlePaymentAction(action) {
        switch (action) {
            case 'send':
                this.handleSendPayment();
                break;
            case 'receive':
                this.handleReceivePayment();
                break;
            case 'scan':
                this.handleQRScan();
                break;
            case 'recharge':
                this.handleRecharge();
                break;
            default:
                console.log('Unknown payment action:', action);
        }
    }

    async handleSendPayment() {
        // Show payment form
        this.showPaymentForm();
    }

    async handleReceivePayment() {
        // Generate QR code for receiving
        this.generateReceiveQR();
    }

    async handleQRScan() {
        try {
            // Simulate QR scanning
            const scannedData = this.simulateQRScan();
            
            if (scannedData) {
                this.processScannedPayment(scannedData);
            }
        } catch (error) {
            console.error('QR scan failed:', error);
            showNotification('error', 'Scan Error', 'Failed to scan QR code');
        }
    }

    simulateQRScan() {
        // Simulate scanned QR data
        return {
            type: 'payment',
            amount: 50.0,
            currency: 'USD',
            recipient: 'John Doe',
            message: 'Lunch payment'
        };
    }

    processScannedPayment(data) {
        // Pre-fill payment form with scanned data
        const form = document.getElementById('payment-form');
        if (form) {
            form.querySelector('[name="amount"]').value = data.amount;
            form.querySelector('[name="currency"]').value = data.currency;
            form.querySelector('[name="recipient"]').value = data.recipient;
            form.querySelector('[name="message"]').value = data.message;
            
            this.updateConversion(form.querySelector('[name="amount"]'));
        }
        
        this.showPage('payments');
        showNotification('success', 'QR Scanned', 'Payment details loaded from QR code');
    }

    async handleRecharge() {
        // Show recharge form
        this.showRechargeForm();
    }

    async handlePaymentForm() {
        const form = document.getElementById('payment-form');
        const amount = parseFloat(form.querySelector('[name="amount"]').value);
        const currency = form.querySelector('[name="currency"]').value;
        const recipient = form.querySelector('[name="recipient"]').value;
        const message = form.querySelector('[name="message"]').value;
        const method = form.querySelector('[name="payment_method"]').value;

        if (!amount || amount <= 0) {
            showNotification('error', 'Invalid Amount', 'Please enter a valid amount');
            return;
        }

        if (!recipient) {
            showNotification('error', 'Invalid Recipient', 'Please enter recipient information');
            return;
        }

        try {
            // Convert amount to USD for processing
            const usdAmount = this.convertToUSD(amount, currency);
            
            if (usdAmount > this.bankBalance) {
                showNotification('error', 'Insufficient Balance', 'You don\'t have enough funds');
                return;
            }

            // Process payment
            const payment = {
                id: this.generatePaymentId(),
                type: 'send',
                amount: amount,
                currency: currency,
                usdAmount: usdAmount,
                recipient: recipient,
                message: message,
                method: method,
                status: 'pending',
                timestamp: new Date().toISOString()
            };

            // Deduct from balance
            this.bankBalance -= usdAmount;
            
            // Add to transactions
            this.transactions.unshift(payment);
            
            this.saveBankData();
            this.updateBankUI();
            
            // Clear form
            form.reset();
            
            showNotification('success', 'Payment Sent', `Payment of ${amount} ${currency} sent successfully`);
            
            // Simulate confirmation
            setTimeout(() => {
                payment.status = 'completed';
                this.updateBankUI();
                showNotification('success', 'Payment Confirmed', 'Payment has been confirmed');
            }, 3000);
            
        } catch (error) {
            console.error('Payment failed:', error);
            showNotification('error', 'Payment Error', 'Failed to process payment');
        }
    }

    async handleRechargeForm() {
        const form = document.getElementById('recharge-form');
        const amount = parseFloat(form.querySelector('[name="amount"]').value);
        const currency = form.querySelector('[name="currency"]').value;
        const method = form.querySelector('[name="recharge_method"]').value;

        if (!amount || amount <= 0) {
            showNotification('error', 'Invalid Amount', 'Please enter a valid amount');
            return;
        }

        try {
            // Convert amount to USD
            const usdAmount = this.convertToUSD(amount, currency);
            
            // Process recharge
            const recharge = {
                id: this.generatePaymentId(),
                type: 'recharge',
                amount: amount,
                currency: currency,
                usdAmount: usdAmount,
                method: method,
                status: 'pending',
                timestamp: new Date().toISOString()
            };

            // Add to balance
            this.bankBalance += usdAmount;
            
            // Add to transactions
            this.transactions.unshift(recharge);
            
            this.saveBankData();
            this.updateBankUI();
            
            // Clear form
            form.reset();
            
            showNotification('success', 'Recharge Successful', `Account recharged with ${amount} ${currency}`);
            
            // Simulate confirmation
            setTimeout(() => {
                recharge.status = 'completed';
                this.updateBankUI();
                showNotification('success', 'Recharge Confirmed', 'Recharge has been confirmed');
            }, 2000);
            
        } catch (error) {
            console.error('Recharge failed:', error);
            showNotification('error', 'Recharge Error', 'Failed to process recharge');
        }
    }

    showPaymentForm() {
        this.showPage('payments');
        
        // Focus on payment form
        const form = document.getElementById('payment-form');
        if (form) {
            form.querySelector('[name="amount"]').focus();
        }
    }

    showRechargeForm() {
        this.showPage('recharge');
        
        // Focus on recharge form
        const form = document.getElementById('recharge-form');
        if (form) {
            form.querySelector('[name="amount"]').focus();
        }
    }

    generateReceiveQR() {
        const qrData = {
            type: 'receive',
            address: '0x' + Math.random().toString(36).substr(2, 40),
            amount: 0,
            currency: 'USD'
        };

        const qrContainer = document.querySelector('.receive-qr');
        if (qrContainer) {
            // Generate QR code (in production, use a proper QR library)
            const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(JSON.stringify(qrData))}`;
            qrContainer.innerHTML = `
                <div class="qr-code">
                    <img src="${qrUrl}" alt="Receive QR Code" style="width: 100%; height: 100%; object-fit: contain;">
                </div>
                <div class="qr-info">
                    <p>Scan this QR code to send money to your account</p>
                    <p class="qr-address">${qrData.address}</p>
                </div>
            `;
        }
    }

    updateConversion(input) {
        const form = input.closest('form');
        const amount = parseFloat(input.value) || 0;
        const currency = form.querySelector('[name="currency"]').value;
        
        const usdAmount = this.convertToUSD(amount, currency);
        const conversionElement = form.querySelector('.conversion-display');
        
        if (conversionElement) {
            conversionElement.innerHTML = `
                <div class="conversion-info">
                    <span class="conversion-amount">${amount} ${currency}</span>
                    <span class="conversion-equals">=</span>
                    <span class="conversion-usd">$${usdAmount.toFixed(2)} USD</span>
                </div>
            `;
        }
    }

    convertToUSD(amount, currency) {
        const rate = this.exchangeRates[currency] || 1.0;
        return amount * rate;
    }

    updateCurrenciesUI() {
        const container = document.querySelector('.currencies-list');
        if (!container) return;

        const currenciesHTML = this.currencies.map(currency => this.createCurrencyHTML(currency)).join('');
        container.innerHTML = currenciesHTML;
    }

    createCurrencyHTML(currency) {
        return `
            <div class="currency-item">
                <div class="currency-info">
                    <div class="currency-symbol">${currency.symbol}</div>
                    <div class="currency-details">
                        <div class="currency-name">${currency.name}</div>
                        <div class="currency-code">${currency.code}</div>
                    </div>
                </div>
                <div class="currency-rate">
                    <span class="rate-label">Rate:</span>
                    <span class="rate-value">${currency.rate} USD</span>
                </div>
            </div>
        `;
    }

    updatePaymentMethodsUI() {
        const container = document.querySelector('.payment-methods');
        if (!container) return;

        const methodsHTML = this.paymentMethods.map(method => this.createPaymentMethodHTML(method)).join('');
        container.innerHTML = methodsHTML;
    }

    createPaymentMethodHTML(method) {
        return `
            <div class="payment-method" data-id="${method.id}">
                <div class="method-icon">${method.icon}</div>
                <div class="method-info">
                    <div class="method-name">${method.name}</div>
                    <div class="method-description">${method.description}</div>
                    <div class="method-details">
                        <span class="processing-time">${method.processingTime}</span>
                        <span class="fees">Fees: ${method.fees}</span>
                    </div>
                </div>
            </div>
        `;
    }

    updateBankUI() {
        this.updateBankBalance();
        this.updateTransactionsUI();
        this.updateBankStats();
    }

    updateBankBalance() {
        const balanceElement = document.querySelector('.bank-balance');
        if (balanceElement) {
            balanceElement.textContent = `$${this.bankBalance.toFixed(2)}`;
        }
    }

    updateTransactionsUI() {
        const container = document.querySelector('.banking-history');
        if (!container) return;

        if (this.transactions.length === 0) {
            container.innerHTML = '<p class="no-transactions">No transactions yet</p>';
            return;
        }

        const transactionsHTML = this.transactions.map(tx => this.createTransactionHTML(tx)).join('');
        container.innerHTML = transactionsHTML;
    }

    createTransactionHTML(tx) {
        const typeClass = tx.type === 'send' ? 'sent' : tx.type === 'receive' ? 'received' : 'recharge';
        const typeText = tx.type === 'send' ? 'Sent' : tx.type === 'receive' ? 'Received' : 'Recharge';
        const amount = tx.type === 'send' ? `-${tx.amount}` : `+${tx.amount}`;
        
        return `
            <div class="history-item">
                <div class="history-icon ${typeClass}">
                    ${tx.type === 'send' ? '↗' : tx.type === 'receive' ? '↘' : '💳'}
                </div>
                <div class="history-details">
                    <div class="history-title">${typeText}</div>
                    <div class="history-subtitle">
                        ${tx.recipient || tx.method} • ${new Date(tx.timestamp).toLocaleDateString()}
                    </div>
                </div>
                <div class="history-amount ${typeClass}">
                    ${amount} ${tx.currency}
                </div>
                <div class="history-status status-${tx.status}">
                    ${tx.status}
                </div>
            </div>
        `;
    }

    updateBankStats() {
        const statsElements = document.querySelectorAll('.bank-stat-value');
        statsElements.forEach(element => {
            const stat = element.dataset.stat;
            switch (stat) {
                case 'total_transactions':
                    element.textContent = this.transactions.length;
                    break;
                case 'total_sent':
                    const totalSent = this.transactions
                        .filter(tx => tx.type === 'send')
                        .reduce((sum, tx) => sum + tx.usdAmount, 0);
                    element.textContent = `$${totalSent.toFixed(2)}`;
                    break;
                case 'total_received':
                    const totalReceived = this.transactions
                        .filter(tx => tx.type === 'receive')
                        .reduce((sum, tx) => sum + tx.usdAmount, 0);
                    element.textContent = `$${totalReceived.toFixed(2)}`;
                    break;
                case 'success_rate':
                    const completed = this.transactions.filter(tx => tx.status === 'completed').length;
                    const successRate = this.transactions.length > 0 ? 
                        (completed / this.transactions.length) * 100 : 100;
                    element.textContent = `${successRate.toFixed(1)}%`;
                    break;
            }
        });
    }

    showPage(pageName) {
        // Hide all pages
        const pages = document.querySelectorAll('.bank-page');
        pages.forEach(page => page.classList.remove('active'));
        
        // Show target page
        const targetPage = document.querySelector(`.bank-page[data-page="${pageName}"]`);
        if (targetPage) {
            targetPage.classList.add('active');
        }
        
        // Update page-specific content
        this.updatePageContent(pageName);
    }

    updatePageContent(pageName) {
        switch (pageName) {
            case 'payments':
                this.updatePaymentsPage();
                break;
            case 'history':
                this.updateHistoryPage();
                break;
            case 'settings':
                this.updateSettingsPage();
                break;
            case 'recharge':
                this.updateRechargePage();
                break;
        }
    }

    updatePaymentsPage() {
        this.updatePaymentMethodsUI();
    }

    updateHistoryPage() {
        this.updateTransactionsUI();
    }

    updateSettingsPage() {
        // Load current settings
        const settings = ['notifications', 'auto_convert', 'qr_enabled'];
        settings.forEach(setting => {
            const toggle = document.querySelector(`[data-setting="${setting}"]`);
            if (toggle) {
                const saved = localStorage.getItem(`bank_setting_${setting}`);
                if (saved === 'true') {
                    toggle.classList.add('active');
                }
            }
        });
    }

    updateRechargePage() {
        this.updateCurrenciesUI();
    }

    generatePaymentId() {
        return 'payment_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
}

// Initialize bank when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.bankManager = new BankManager();
});

// Export for global access
window.BankManager = BankManager; 