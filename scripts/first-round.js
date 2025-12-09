// ===== FIRST ROUND PAGE LOGIC =====

class FirstRoundManager {
    constructor() {
        this.currentWallet = null;
        this.isConnected = false;
        this.roundState = 'upcoming'; // 'upcoming', 'live', 'sold-out', 'closed'
        this.selectedCurrency = 'BNB';
        this.contributionAmount = 0;
        this.userData = null;
        
        // Round configuration
        this.roundConfig = {
            hardCap: 5000000, // RSK
            maxInvestors: 100,
            pricePerRSK: 0.02, // USD
            supplyTotal: 35999999,
            minContribution: 200, // USD
            maxContribution: 300000, // RSK
            remainingSupply: 1250000, // RSK
            vesting: {
                tge: 15, // %
                monthly: 7.08, // % per month for 12 months
                months: 12
            }
        };
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.loadRoundState();
        this.updateUI();
        this.setupFAQ();
        this.setupCountdown();
    }
    
    setupEventListeners() {
        // Connect wallet buttons
        document.querySelectorAll('#connectWalletBtn, #connectWalletBtn2, #finalConnectBtn').forEach(btn => {
            btn.addEventListener('click', () => this.connectWallet());
        });
        
        // Currency selector
        document.querySelectorAll('.currency-option').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.currency-option').forEach(b => b.classList.remove('active'));
                e.currentTarget.classList.add('active');
                this.selectedCurrency = e.currentTarget.dataset.currency;
                this.updateCurrencyRate();
                this.updatePurchaseSummary();
            });
        });
        
        // Amount input
        const amountInput = document.getElementById('contributionAmount');
        if (amountInput) {
            amountInput.addEventListener('input', (e) => {
                this.contributionAmount = parseFloat(e.target.value) || 0;
                this.updateEstimatedRSK();
                this.updatePurchaseSummary();
                this.validatePurchase();
            });
        }
        
        // Confirm purchase
        const confirmBtn = document.getElementById('confirmPurchaseBtn');
        if (confirmBtn) {
            confirmBtn.addEventListener('click', () => this.confirmPurchase());
        }
        
        // Copy address
        const copyBtn = document.getElementById('copyAddressBtn');
        if (copyBtn) {
            copyBtn.addEventListener('click', () => this.copyAddress());
        }
        
        // View contributions
        const viewBtn = document.getElementById('viewContributionsBtn');
        if (viewBtn) {
            viewBtn.addEventListener('click', () => this.viewContributions());
        }
    }
    
    setupFAQ() {
        document.querySelectorAll('.faq-question').forEach(question => {
            question.addEventListener('click', (e) => {
                const faqItem = e.currentTarget.closest('.faq-item');
                const isActive = faqItem.classList.contains('active');
                
                // Close all FAQ items
                document.querySelectorAll('.faq-item').forEach(item => {
                    item.classList.remove('active');
                });
                
                // Toggle current item
                if (!isActive) {
                    faqItem.classList.add('active');
                }
            });
        });
    }
    
    setupCountdown() {
        // Example countdown logic for upcoming state
        if (this.roundState === 'upcoming') {
            // Set target date (example: 3 days from now)
            const targetDate = new Date();
            targetDate.setDate(targetDate.getDate() + 3);
            
            const countdown = setInterval(() => {
                const now = new Date().getTime();
                const distance = targetDate.getTime() - now;
                
                if (distance < 0) {
                    clearInterval(countdown);
                    this.roundState = 'live';
                    this.updateUI();
                    return;
                }
                
                const days = Math.floor(distance / (1000 * 60 * 60 * 24));
                const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((distance % (1000 * 60)) / 1000);
                
                // Update countdown display if exists
                const countdownElement = document.getElementById('countdownDisplay');
                if (countdownElement) {
                    countdownElement.textContent = `${days}d ${hours}h ${minutes}m ${seconds}s`;
                }
            }, 1000);
        }
    }
    
    loadRoundState() {
        // Load round state from backend or localStorage
        const savedState = localStorage.getItem('firstRoundState');
        if (savedState) {
            this.roundState = savedState;
        }
        
        // Check if round is sold out
        if (this.roundConfig.remainingSupply <= 0) {
            this.roundState = 'sold-out';
        }
    }
    
    updateUI() {
        this.updateRoundStatus();
        this.updatePurchaseModule();
        this.updateUserPanel();
    }
    
    updateRoundStatus() {
        const statusCard = document.getElementById('roundStatusCard');
        const statusValue = document.getElementById('roundStatus');
        
        if (!statusCard || !statusValue) return;
        
        const statusConfig = {
            'upcoming': { text: 'Upcoming', color: '#ffc107' },
            'live': { text: 'Live', color: '#00ff00' },
            'sold-out': { text: 'Sold Out', color: '#ff6b6b' },
            'closed': { text: 'Closed', color: '#888888' }
        };
        
        const config = statusConfig[this.roundState] || statusConfig['upcoming'];
        statusValue.textContent = config.text;
        statusValue.style.color = config.color;
        statusCard.style.borderColor = `rgba(${this.hexToRgb(config.color)}, 0.3)`;
    }
    
    updatePurchaseModule() {
        const purchaseModule = document.getElementById('purchaseModule');
        const confirmBtn = document.getElementById('confirmPurchaseBtn');
        
        if (!purchaseModule || !confirmBtn) return;
        
        switch (this.roundState) {
            case 'upcoming':
                confirmBtn.disabled = true;
                confirmBtn.textContent = 'Round aún no ha comenzado';
                break;
            case 'live':
                confirmBtn.disabled = false;
                confirmBtn.innerHTML = '<i class="fas fa-check-circle"></i><span>Confirmar contribución</span>';
                break;
            case 'sold-out':
                confirmBtn.disabled = true;
                confirmBtn.textContent = 'Round Completado';
                purchaseModule.style.opacity = '0.6';
                break;
            case 'closed':
                confirmBtn.disabled = true;
                confirmBtn.textContent = 'Round Finalizado';
                purchaseModule.style.opacity = '0.6';
                break;
        }
    }
    
    updateUserPanel() {
        if (this.isConnected && this.currentWallet) {
            document.getElementById('notConnectedState').style.display = 'none';
            document.getElementById('connectedState').style.display = 'block';
            document.getElementById('walletAddress').textContent = this.formatAddress(this.currentWallet);
            
            // Load user data
            this.loadUserData();
        } else {
            document.getElementById('notConnectedState').style.display = 'block';
            document.getElementById('connectedState').style.display = 'none';
        }
    }
    
    async connectWallet() {
        try {
            // Check if MetaMask is installed
            if (typeof window.ethereum === 'undefined') {
                alert('Por favor instala MetaMask o otra wallet compatible para continuar.');
                return;
            }
            
            // Request account access
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            
            if (accounts.length > 0) {
                this.currentWallet = accounts[0];
                this.isConnected = true;
                
                // Save to localStorage
                localStorage.setItem('firstRoundWallet', this.currentWallet);
                
                this.updateUserPanel();
                
                // Listen for account changes
                window.ethereum.on('accountsChanged', (accounts) => {
                    if (accounts.length === 0) {
                        this.disconnectWallet();
                    } else {
                        this.currentWallet = accounts[0];
                        this.updateUserPanel();
                    }
                });
            }
        } catch (error) {
            console.error('Error connecting wallet:', error);
            alert('Error al conectar la wallet. Por favor intenta de nuevo.');
        }
    }
    
    disconnectWallet() {
        this.currentWallet = null;
        this.isConnected = false;
        localStorage.removeItem('firstRoundWallet');
        this.updateUserPanel();
    }
    
    async loadUserData() {
        if (!this.currentWallet) return;
        
        try {
            // Fetch user data from backend
            // const response = await fetch(`/api/first-round/user/${this.currentWallet}`);
            // this.userData = await response.json();
            
            // Mock data for now
            this.userData = {
                status: 'approved',
                maxLimit: 250000,
                reservedAmount: 80000,
                availableAmount: 170000,
                whitelisted: true
            };
            
            this.updateUserDataDisplay();
        } catch (error) {
            console.error('Error loading user data:', error);
        }
    }
    
    updateUserDataDisplay() {
        if (!this.userData) return;
        
        const statusBadge = document.getElementById('userStatus');
        if (statusBadge) {
            statusBadge.textContent = this.userData.status === 'approved' ? 'Aprobado' : 'Pendiente';
            statusBadge.className = `status-badge ${this.userData.status}`;
        }
        
        document.getElementById('maxLimit').textContent = `${this.formatNumber(this.userData.maxLimit)} RSK`;
        document.getElementById('reservedAmount').textContent = `${this.formatNumber(this.userData.reservedAmount)} RSK`;
        document.getElementById('availableAmount').textContent = `${this.formatNumber(this.userData.availableAmount)} RSK`;
        
        const whitelistStatus = document.getElementById('whitelistStatus');
        if (whitelistStatus) {
            if (this.userData.whitelisted) {
                whitelistStatus.innerHTML = '<i class="fas fa-check-circle"></i><span>Wallet verificada para el Private Round #1.</span>';
                whitelistStatus.style.display = 'flex';
            } else {
                whitelistStatus.innerHTML = '<i class="fas fa-times-circle"></i><span>Tu wallet no está en la lista para este Private Round.</span>';
                whitelistStatus.style.display = 'flex';
                whitelistStatus.style.background = 'rgba(255, 0, 0, 0.1)';
                whitelistStatus.style.borderColor = 'rgba(255, 0, 0, 0.3)';
                whitelistStatus.style.color = '#ff6b6b';
            }
        }
    }
    
    updateCurrencyRate() {
        // Fetch current BNB/USDT price and calculate RSK rate
        // Mock for now
        const bnbPrice = 300; // USD
        const rskPerBNB = bnbPrice / this.roundConfig.pricePerRSK;
        
        const rateElement = document.getElementById('currencyRate');
        if (rateElement) {
            if (this.selectedCurrency === 'BNB') {
                rateElement.textContent = `1 BNB = ${this.formatNumber(rskPerBNB)} RSK (aprox.)`;
            } else {
                rateElement.textContent = `1 USDT = ${this.formatNumber(1 / this.roundConfig.pricePerRSK)} RSK`;
            }
        }
    }
    
    updateEstimatedRSK() {
        if (!this.contributionAmount || this.contributionAmount <= 0) {
            document.getElementById('estimatedRSK').textContent = '0';
            return;
        }
        
        // Calculate estimated RSK based on currency
        let usdAmount = 0;
        
        if (this.selectedCurrency === 'BNB') {
            const bnbPrice = 300; // USD (should fetch from API)
            usdAmount = this.contributionAmount * bnbPrice;
        } else {
            usdAmount = this.contributionAmount;
        }
        
        const estimatedRSK = usdAmount / this.roundConfig.pricePerRSK;
        document.getElementById('estimatedRSK').textContent = this.formatNumber(estimatedRSK);
    }
    
    updatePurchaseSummary() {
        if (!this.isConnected || !this.currentWallet) {
            document.getElementById('purchaseSummary').style.display = 'none';
            return;
        }
        
        document.getElementById('purchaseSummary').style.display = 'block';
        document.getElementById('summaryAddress').textContent = this.formatAddress(this.currentWallet);
        document.getElementById('summaryRSK').textContent = document.getElementById('estimatedRSK').textContent;
        document.getElementById('summaryCurrency').textContent = this.selectedCurrency;
    }
    
    validatePurchase() {
        const confirmBtn = document.getElementById('confirmPurchaseBtn');
        if (!confirmBtn) return;
        
        if (!this.isConnected) {
            confirmBtn.disabled = true;
            return;
        }
        
        if (this.roundState !== 'live') {
            confirmBtn.disabled = true;
            return;
        }
        
        if (!this.contributionAmount || this.contributionAmount <= 0) {
            confirmBtn.disabled = true;
            return;
        }
        
        // Check minimum
        const usdAmount = this.selectedCurrency === 'BNB' 
            ? this.contributionAmount * 300 
            : this.contributionAmount;
        
        if (usdAmount < this.roundConfig.minContribution) {
            confirmBtn.disabled = true;
            return;
        }
        
        // Check maximum
        const estimatedRSK = parseFloat(document.getElementById('estimatedRSK').textContent.replace(/,/g, ''));
        if (estimatedRSK > (this.userData?.availableAmount || this.roundConfig.maxContribution)) {
            confirmBtn.disabled = true;
            return;
        }
        
        confirmBtn.disabled = false;
    }
    
    async confirmPurchase() {
        if (!this.isConnected || !this.currentWallet) {
            alert('Por favor conecta tu wallet primero.');
            return;
        }
        
        if (this.roundState !== 'live') {
            alert('El round no está activo en este momento.');
            return;
        }
        
        const amount = this.contributionAmount;
        const currency = this.selectedCurrency;
        const estimatedRSK = parseFloat(document.getElementById('estimatedRSK').textContent.replace(/,/g, ''));
        
        // Confirm with user
        const confirmed = confirm(
            `¿Confirmas tu contribución de ${amount} ${currency} por aproximadamente ${this.formatNumber(estimatedRSK)} RSK?`
        );
        
        if (!confirmed) return;
        
        try {
            // Process payment
            if (currency === 'BNB') {
                // Send BNB transaction
                const txHash = await this.sendBNBTransaction(amount);
                await this.registerContribution(txHash, amount, currency, estimatedRSK);
            } else {
                // Send USDT transaction
                const txHash = await this.sendUSDTTransaction(amount);
                await this.registerContribution(txHash, amount, currency, estimatedRSK);
            }
            
            // Show success
            document.getElementById('purchaseSuccess').style.display = 'block';
            document.getElementById('contributionAmount').value = '';
            this.contributionAmount = 0;
            this.updateEstimatedRSK();
            this.updatePurchaseSummary();
            
        } catch (error) {
            console.error('Error processing purchase:', error);
            alert('Error al procesar la contribución. Por favor intenta de nuevo.');
        }
    }
    
    async sendBNBTransaction(amount) {
        // Convert to wei
        const weiAmount = window.ethereum.utils.toWei(amount.toString(), 'ether');
        
        const tx = await window.ethereum.request({
            method: 'eth_sendTransaction',
            params: [{
                from: this.currentWallet,
                to: '0x...', // Treasury address
                value: weiAmount,
                gas: '0x5208' // 21000
            }]
        });
        
        return tx;
    }
    
    async sendUSDTTransaction(amount) {
        // USDT token transfer (requires contract interaction)
        // Implementation depends on USDT contract address
        throw new Error('USDT transaction not implemented yet');
    }
    
    async registerContribution(txHash, amount, currency, rskAmount) {
        // Register contribution in backend
        const response = await fetch('/api/first-round/contribute', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                wallet: this.currentWallet,
                txHash: txHash,
                amount: amount,
                currency: currency,
                rskAmount: rskAmount,
                timestamp: new Date().toISOString()
            })
        });
        
        if (!response.ok) {
            throw new Error('Error registering contribution');
        }
        
        // Reload user data
        await this.loadUserData();
    }
    
    copyAddress() {
        if (!this.currentWallet) return;
        
        navigator.clipboard.writeText(this.currentWallet).then(() => {
            const btn = document.getElementById('copyAddressBtn');
            const originalHTML = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-check"></i>';
            setTimeout(() => {
                btn.innerHTML = originalHTML;
            }, 2000);
        });
    }
    
    viewContributions() {
        // Navigate to contributions page or show modal
        alert('Funcionalidad de ver contribuciones próximamente.');
    }
    
    formatAddress(address) {
        if (!address) return '';
        return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
    }
    
    formatNumber(num) {
        return new Intl.NumberFormat('en-US', {
            maximumFractionDigits: 2
        }).format(num);
    }
    
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result 
            ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
            : '0, 255, 255';
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.firstRoundManager = new FirstRoundManager();
});


