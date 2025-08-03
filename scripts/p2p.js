/* ===== P2P FUNCTIONALITY ===== */

class P2PManager {
    constructor() {
        this.ads = [];
        this.myAds = [];
        this.transactions = [];
        this.chatMessages = [];
        this.currentUser = null;
        this.isInitialized = false;
        this.init();
    }

    async init() {
        try {
            // Load user data
            this.loadUserData();
            
            this.setupEventListeners();
            this.setupSidebarNavigation();
            this.showPage('marketplace');
            this.isInitialized = true;
            
            // Load initial data
            await this.loadMarketData();
            
        } catch (error) {
            console.error('P2P initialization failed:', error);
            showNotification('error', 'P2P Error', 'Failed to initialize P2P system');
        }
    }

    setupEventListeners() {
        // Ad interactions
        document.addEventListener('click', (e) => {
            if (e.target.matches('.ad-btn')) {
                const action = e.target.dataset.action;
                const adId = e.target.dataset.adId;
                this.handleAdAction(action, adId);
            }
            
            if (e.target.matches('.filter-tab')) {
                this.handleFilterChange(e.target);
            }
            
            if (e.target.matches('.search-btn')) {
                this.handleSearch();
            }
        });

        // Form submissions
        document.addEventListener('submit', (e) => {
            if (e.target.matches('#create-ad-form')) {
                e.preventDefault();
                this.handleCreateAd();
            }
            
            if (e.target.matches('#chat-form')) {
                e.preventDefault();
                this.handleSendMessage();
            }
        });

        // Search input
        document.addEventListener('input', (e) => {
            if (e.target.matches('.search-input')) {
                this.handleSearchInput(e.target.value);
            }
        });
    }

    setupSidebarNavigation() {
        const navLinks = document.querySelectorAll('.p2p-nav-link');
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

    loadUserData() {
        // Load user from localStorage or create mock user
        const savedUser = localStorage.getItem('rsc_user');
        if (savedUser) {
            this.currentUser = JSON.parse(savedUser);
        } else {
            this.currentUser = {
                id: this.generateUserId(),
                username: 'User_' + Math.random().toString(36).substr(2, 6),
                rating: 4.5,
                completedTrades: 12,
                joinDate: new Date().toISOString()
            };
            localStorage.setItem('rsc_user', JSON.stringify(this.currentUser));
        }
    }

    async loadMarketData() {
        try {
            // Load ads from API
            const response = await fetch(`${API_BASE_URL}/api/p2p/ads`);
            const data = await response.json();
            
            if (data.success) {
                this.ads = data.ads;
                this.updateMarketplaceUI();
            }
        } catch (error) {
            console.error('Failed to load market data:', error);
            // Load mock data
            this.loadMockAds();
        }
    }

    loadMockAds() {
        this.ads = [
            {
                id: '1',
                type: 'buy',
                price: 0.85,
                amount: 1000,
                minAmount: 50,
                maxAmount: 500,
                paymentMethods: ['Bank Transfer', 'PayPal'],
                user: {
                    id: 'user1',
                    username: 'CryptoTrader',
                    rating: 4.8,
                    completedTrades: 45
                },
                createdAt: new Date(Date.now() - 3600000).toISOString()
            },
            {
                id: '2',
                type: 'sell',
                price: 0.87,
                amount: 500,
                minAmount: 25,
                maxAmount: 250,
                paymentMethods: ['Cash', 'Venmo'],
                user: {
                    id: 'user2',
                    username: 'RSCHolder',
                    rating: 4.6,
                    completedTrades: 23
                },
                createdAt: new Date(Date.now() - 7200000).toISOString()
            }
        ];
        this.updateMarketplaceUI();
    }

    handleAdAction(action, adId) {
        switch (action) {
            case 'buy':
                this.handleBuyAd(adId);
                break;
            case 'sell':
                this.handleSellAd(adId);
                break;
            case 'chat':
                this.handleChatAd(adId);
                break;
            case 'edit':
                this.handleEditAd(adId);
                break;
            case 'delete':
                this.handleDeleteAd(adId);
                break;
            default:
                console.log('Unknown ad action:', action);
        }
    }

    async handleBuyAd(adId) {
        const ad = this.ads.find(a => a.id === adId);
        if (!ad) return;

        if (ad.type !== 'sell') {
            showNotification('error', 'Invalid Action', 'You can only buy from sell ads');
            return;
        }

        try {
            // Simulate transaction
            const transaction = {
                id: this.generateTransactionId(),
                adId: adId,
                type: 'buy',
                amount: ad.amount,
                price: ad.price,
                total: ad.amount * ad.price,
                seller: ad.user,
                buyer: this.currentUser,
                status: 'pending',
                createdAt: new Date().toISOString()
            };

            this.transactions.unshift(transaction);
            this.updateTransactionsUI();

            showNotification('success', 'Transaction Started', 'Transaction initiated successfully');
            
            // Simulate confirmation
            setTimeout(() => {
                transaction.status = 'completed';
                this.updateTransactionsUI();
                showNotification('success', 'Transaction Completed', 'Transaction completed successfully');
            }, 5000);
            
        } catch (error) {
            console.error('Buy transaction failed:', error);
            showNotification('error', 'Transaction Error', 'Failed to process transaction');
        }
    }

    async handleSellAd(adId) {
        const ad = this.ads.find(a => a.id === adId);
        if (!ad) return;

        if (ad.type !== 'buy') {
            showNotification('error', 'Invalid Action', 'You can only sell to buy ads');
            return;
        }

        try {
            // Simulate transaction
            const transaction = {
                id: this.generateTransactionId(),
                adId: adId,
                type: 'sell',
                amount: ad.amount,
                price: ad.price,
                total: ad.amount * ad.price,
                buyer: ad.user,
                seller: this.currentUser,
                status: 'pending',
                createdAt: new Date().toISOString()
            };

            this.transactions.unshift(transaction);
            this.updateTransactionsUI();

            showNotification('success', 'Transaction Started', 'Transaction initiated successfully');
            
            // Simulate confirmation
            setTimeout(() => {
                transaction.status = 'completed';
                this.updateTransactionsUI();
                showNotification('success', 'Transaction Completed', 'Transaction completed successfully');
            }, 5000);
            
        } catch (error) {
            console.error('Sell transaction failed:', error);
            showNotification('error', 'Transaction Error', 'Failed to process transaction');
        }
    }

    handleChatAd(adId) {
        const ad = this.ads.find(a => a.id === adId);
        if (!ad) return;

        // Load chat for this ad
        this.loadChat(adId);
        this.showPage('chat');
    }

    async handleCreateAd() {
        const form = document.getElementById('create-ad-form');
        const type = form.querySelector('[name="type"]').value;
        const price = parseFloat(form.querySelector('[name="price"]').value);
        const amount = parseFloat(form.querySelector('[name="amount"]').value);
        const minAmount = parseFloat(form.querySelector('[name="min_amount"]').value);
        const maxAmount = parseFloat(form.querySelector('[name="max_amount"]').value);
        const paymentMethods = Array.from(form.querySelectorAll('[name="payment_methods"]:checked')).map(cb => cb.value);
        const description = form.querySelector('[name="description"]').value;

        if (!price || !amount || !minAmount || !maxAmount || paymentMethods.length === 0) {
            showNotification('error', 'Validation Error', 'Please fill all required fields');
            return;
        }

        try {
            const ad = {
                id: this.generateAdId(),
                type: type,
                price: price,
                amount: amount,
                minAmount: minAmount,
                maxAmount: maxAmount,
                paymentMethods: paymentMethods,
                description: description,
                user: this.currentUser,
                createdAt: new Date().toISOString(),
                status: 'active'
            };

            // Add to my ads
            this.myAds.unshift(ad);
            
            // Add to marketplace
            this.ads.unshift(ad);
            
            this.updateMyAdsUI();
            this.updateMarketplaceUI();
            
            // Clear form
            form.reset();
            
            showNotification('success', 'Ad Created', 'Your ad has been created successfully');
            
        } catch (error) {
            console.error('Failed to create ad:', error);
            showNotification('error', 'Creation Error', 'Failed to create ad');
        }
    }

    handleEditAd(adId) {
        const ad = this.myAds.find(a => a.id === adId);
        if (!ad) return;

        // Populate form with ad data
        const form = document.getElementById('create-ad-form');
        form.querySelector('[name="type"]').value = ad.type;
        form.querySelector('[name="price"]').value = ad.price;
        form.querySelector('[name="amount"]').value = ad.amount;
        form.querySelector('[name="min_amount"]').value = ad.minAmount;
        form.querySelector('[name="max_amount"]').value = ad.maxAmount;
        form.querySelector('[name="description"]').value = ad.description;

        // Check payment methods
        form.querySelectorAll('[name="payment_methods"]').forEach(cb => {
            cb.checked = ad.paymentMethods.includes(cb.value);
        });

        this.showPage('create');
    }

    handleDeleteAd(adId) {
        if (!confirm('Are you sure you want to delete this ad?')) return;

        // Remove from my ads
        this.myAds = this.myAds.filter(a => a.id !== adId);
        
        // Remove from marketplace
        this.ads = this.ads.filter(a => a.id !== adId);
        
        this.updateMyAdsUI();
        this.updateMarketplaceUI();
        
        showNotification('success', 'Ad Deleted', 'Ad deleted successfully');
    }

    handleFilterChange(tab) {
        // Update active filter
        document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        // Apply filter
        const filter = tab.dataset.filter;
        this.applyFilter(filter);
    }

    applyFilter(filter) {
        const adCards = document.querySelectorAll('.ad-card');
        
        adCards.forEach(card => {
            const adType = card.dataset.type;
            const shouldShow = filter === 'all' || adType === filter;
            card.style.display = shouldShow ? 'block' : 'none';
        });
    }

    handleSearch() {
        const searchInput = document.querySelector('.search-input');
        const query = searchInput.value.toLowerCase();
        
        if (!query) {
            this.updateMarketplaceUI();
            return;
        }

        const filteredAds = this.ads.filter(ad => 
            ad.user.username.toLowerCase().includes(query) ||
            ad.description.toLowerCase().includes(query) ||
            ad.paymentMethods.some(method => method.toLowerCase().includes(query))
        );

        this.updateMarketplaceUI(filteredAds);
    }

    handleSearchInput(value) {
        if (value.length >= 3) {
            this.handleSearch();
        } else if (value.length === 0) {
            this.updateMarketplaceUI();
        }
    }

    loadChat(adId) {
        // Load chat messages for this ad
        this.chatMessages = [
            {
                id: '1',
                adId: adId,
                sender: 'other',
                message: 'Hi! I\'m interested in your ad.',
                timestamp: new Date(Date.now() - 300000).toISOString()
            },
            {
                id: '2',
                adId: adId,
                sender: 'me',
                message: 'Great! What would you like to know?',
                timestamp: new Date(Date.now() - 240000).toISOString()
            }
        ];
        
        this.updateChatUI();
    }

    handleSendMessage() {
        const form = document.getElementById('chat-form');
        const messageInput = form.querySelector('[name="message"]');
        const message = messageInput.value.trim();

        if (!message) return;

        const newMessage = {
            id: this.generateMessageId(),
            adId: this.currentAdId,
            sender: 'me',
            message: message,
            timestamp: new Date().toISOString()
        };

        this.chatMessages.push(newMessage);
        this.updateChatUI();
        
        // Clear input
        messageInput.value = '';
        
        // Simulate reply
        setTimeout(() => {
            const reply = {
                id: this.generateMessageId(),
                adId: this.currentAdId,
                sender: 'other',
                message: 'Thanks for the information!',
                timestamp: new Date().toISOString()
            };
            this.chatMessages.push(reply);
            this.updateChatUI();
        }, 2000);
    }

    updateMarketplaceUI(filteredAds = null) {
        const container = document.querySelector('.ad-grid');
        if (!container) return;

        const adsToShow = filteredAds || this.ads;
        
        if (adsToShow.length === 0) {
            container.innerHTML = '<p class="no-ads">No ads found</p>';
            return;
        }

        const adsHTML = adsToShow.map(ad => this.createAdHTML(ad)).join('');
        container.innerHTML = adsHTML;
    }

    createAdHTML(ad) {
        const typeClass = ad.type === 'buy' ? 'buy' : 'sell';
        const typeText = ad.type === 'buy' ? 'Buy' : 'Sell';
        
        return `
            <div class="ad-card" data-type="${ad.type}" data-id="${ad.id}">
                <div class="ad-header">
                    <div class="ad-type ${typeClass}">${typeText}</div>
                    <div class="ad-price">$${ad.price.toFixed(2)}</div>
                </div>
                <div class="ad-details">
                    <div class="ad-limit">
                        <span class="ad-limit-label">Amount:</span>
                        <span class="ad-limit-value">${ad.amount.toLocaleString()} RSC</span>
                    </div>
                    <div class="ad-limit">
                        <span class="ad-limit-label">Min/Max:</span>
                        <span class="ad-limit-value">${ad.minAmount}/${ad.maxAmount} RSC</span>
                    </div>
                </div>
                <div class="ad-payment">
                    ${ad.paymentMethods.map(method => `<span class="payment-method">${method}</span>`).join('')}
                </div>
                <div class="ad-user">
                    <div class="user-avatar">${ad.user.username.charAt(0).toUpperCase()}</div>
                    <div class="user-info">
                        <div class="user-name">${ad.user.username}</div>
                        <div class="user-rating">
                            ${'★'.repeat(Math.floor(ad.user.rating))}${'☆'.repeat(5 - Math.floor(ad.user.rating))}
                            <span>${ad.user.rating}</span>
                        </div>
                    </div>
                </div>
                <div class="ad-actions">
                    <button class="ad-btn primary" data-action="${ad.type === 'buy' ? 'sell' : 'buy'}" data-ad-id="${ad.id}">
                        ${ad.type === 'buy' ? 'Sell' : 'Buy'}
                    </button>
                    <button class="ad-btn secondary" data-action="chat" data-ad-id="${ad.id}">
                        Chat
                    </button>
                </div>
            </div>
        `;
    }

    updateMyAdsUI() {
        const container = document.querySelector('.my-ads-list');
        if (!container) return;

        if (this.myAds.length === 0) {
            container.innerHTML = '<p class="no-ads">You haven\'t created any ads yet</p>';
            return;
        }

        const adsHTML = this.myAds.map(ad => this.createMyAdHTML(ad)).join('');
        container.innerHTML = adsHTML;
    }

    createMyAdHTML(ad) {
        const typeClass = ad.type === 'buy' ? 'buy' : 'sell';
        const typeText = ad.type === 'buy' ? 'Buy' : 'Sell';
        
        return `
            <div class="ad-card" data-type="${ad.type}" data-id="${ad.id}">
                <div class="ad-header">
                    <div class="ad-type ${typeClass}">${typeText}</div>
                    <div class="ad-price">$${ad.price.toFixed(2)}</div>
                </div>
                <div class="ad-details">
                    <div class="ad-limit">
                        <span class="ad-limit-label">Amount:</span>
                        <span class="ad-limit-value">${ad.amount.toLocaleString()} RSC</span>
                    </div>
                    <div class="ad-limit">
                        <span class="ad-limit-label">Min/Max:</span>
                        <span class="ad-limit-value">${ad.minAmount}/${ad.maxAmount} RSC</span>
                    </div>
                </div>
                <div class="ad-payment">
                    ${ad.paymentMethods.map(method => `<span class="payment-method">${method}</span>`).join('')}
                </div>
                <div class="ad-actions">
                    <button class="ad-btn secondary" data-action="edit" data-ad-id="${ad.id}">
                        Edit
                    </button>
                    <button class="ad-btn danger" data-action="delete" data-ad-id="${ad.id}">
                        Delete
                    </button>
                </div>
            </div>
        `;
    }

    updateTransactionsUI() {
        const container = document.querySelector('.transaction-history');
        if (!container) return;

        if (this.transactions.length === 0) {
            container.innerHTML = '<p class="no-transactions">No transactions yet</p>';
            return;
        }

        const transactionsHTML = this.transactions.map(tx => this.createTransactionHTML(tx)).join('');
        container.innerHTML = transactionsHTML;
    }

    createTransactionHTML(tx) {
        const statusClass = tx.status === 'completed' ? 'completed' : tx.status === 'pending' ? 'pending' : 'cancelled';
        const statusText = tx.status.charAt(0).toUpperCase() + tx.status.slice(1);
        
        return `
            <div class="history-item">
                <div class="history-icon ${statusClass}">💱</div>
                <div class="history-details">
                    <div class="history-title">${tx.type === 'buy' ? 'Bought' : 'Sold'} RSC</div>
                    <div class="history-subtitle">${tx.amount.toLocaleString()} RSC @ $${tx.price.toFixed(2)}</div>
                </div>
                <div class="history-amount">$${tx.total.toFixed(2)}</div>
                <div class="history-status ${statusClass}">${statusText}</div>
            </div>
        `;
    }

    updateChatUI() {
        const container = document.querySelector('.chat-messages');
        if (!container) return;

        const messagesHTML = this.chatMessages.map(msg => this.createMessageHTML(msg)).join('');
        container.innerHTML = messagesHTML;
        
        // Scroll to bottom
        container.scrollTop = container.scrollHeight;
    }

    createMessageHTML(msg) {
        const isMe = msg.sender === 'me';
        const time = new Date(msg.timestamp).toLocaleTimeString();
        
        return `
            <div class="message ${isMe ? 'sent' : 'received'}">
                <div class="message-content">${msg.message}</div>
                <div class="message-time">${time}</div>
            </div>
        `;
    }

    showPage(pageName) {
        // Hide all pages
        const pages = document.querySelectorAll('.p2p-page');
        pages.forEach(page => page.classList.remove('active'));
        
        // Show target page
        const targetPage = document.querySelector(`.p2p-page[data-page="${pageName}"]`);
        if (targetPage) {
            targetPage.classList.add('active');
        }
        
        // Update page-specific content
        this.updatePageContent(pageName);
    }

    updatePageContent(pageName) {
        switch (pageName) {
            case 'marketplace':
                this.updateMarketplacePage();
                break;
            case 'create':
                this.updateCreatePage();
                break;
            case 'my-ads':
                this.updateMyAdsPage();
                break;
            case 'history':
                this.updateHistoryPage();
                break;
            case 'reputation':
                this.updateReputationPage();
                break;
            case 'chat':
                this.updateChatPage();
                break;
        }
    }

    updateMarketplacePage() {
        this.updateMarketplaceUI();
        this.updateMarketStats();
    }

    updateCreatePage() {
        // Form is already set up
    }

    updateMyAdsPage() {
        this.updateMyAdsUI();
    }

    updateHistoryPage() {
        this.updateTransactionsUI();
    }

    updateReputationPage() {
        // Update reputation stats
        const stats = this.calculateReputationStats();
        
        const ratingElement = document.querySelector('.reputation-value[data-stat="rating"]');
        if (ratingElement) {
            ratingElement.textContent = stats.rating.toFixed(1);
        }
        
        const tradesElement = document.querySelector('.reputation-value[data-stat="trades"]');
        if (tradesElement) {
            tradesElement.textContent = stats.completedTrades;
        }
        
        const successElement = document.querySelector('.reputation-value[data-stat="success"]');
        if (successElement) {
            successElement.textContent = `${stats.successRate}%`;
        }
    }

    updateChatPage() {
        this.updateChatUI();
    }

    updateMarketStats() {
        const totalAds = this.ads.length;
        const buyAds = this.ads.filter(a => a.type === 'buy').length;
        const sellAds = this.ads.filter(a => a.type === 'sell').length;
        const avgPrice = this.ads.length > 0 ? 
            this.ads.reduce((sum, ad) => sum + ad.price, 0) / this.ads.length : 0;

        const statsElements = document.querySelectorAll('.market-stat-value');
        statsElements.forEach(element => {
            const stat = element.dataset.stat;
            switch (stat) {
                case 'total_ads':
                    element.textContent = totalAds;
                    break;
                case 'buy_ads':
                    element.textContent = buyAds;
                    break;
                case 'sell_ads':
                    element.textContent = sellAds;
                    break;
                case 'avg_price':
                    element.textContent = `$${avgPrice.toFixed(2)}`;
                    break;
            }
        });
    }

    calculateReputationStats() {
        const completedTrades = this.transactions.filter(tx => tx.status === 'completed').length;
        const totalTrades = this.transactions.length;
        const successRate = totalTrades > 0 ? (completedTrades / totalTrades) * 100 : 100;
        
        return {
            rating: this.currentUser.rating,
            completedTrades: completedTrades,
            successRate: Math.round(successRate)
        };
    }

    generateUserId() {
        return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    generateAdId() {
        return 'ad_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    generateTransactionId() {
        return 'tx_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    generateMessageId() {
        return 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
}

// Initialize P2P when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.p2pManager = new P2PManager();
});

// Export for global access
window.P2PManager = P2PManager;
