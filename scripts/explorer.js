/* ===== BLOCKCHAIN EXPLORER FUNCTIONALITY ===== */

class ExplorerManager {
    constructor() {
        this.blocks = [];
        this.transactions = [];
        this.addresses = [];
        this.networkStats = {};
        this.searchResults = [];
        this.isInitialized = false;
        this.init();
    }

    async init() {
        try {
            this.setupEventListeners();
            this.setupSidebarNavigation();
            this.showPage('blocks');
            this.isInitialized = true;
            
            // Load initial data
            await this.loadNetworkStats();
            await this.loadLatestBlocks();
            await this.loadLatestTransactions();
            
        } catch (error) {
            console.error('Explorer initialization failed:', error);
            showNotification('error', 'Explorer Error', 'Failed to initialize blockchain explorer');
        }
    }

    setupEventListeners() {
        // Search functionality
        document.addEventListener('submit', (e) => {
            if (e.target.matches('#search-form')) {
                e.preventDefault();
                this.handleSearch();
            }
        });

        // Search input
        document.addEventListener('input', (e) => {
            if (e.target.matches('.search-input')) {
                this.handleSearchInput(e.target.value);
            }
        });

        // Block/Transaction clicks
        document.addEventListener('click', (e) => {
            if (e.target.matches('.block-item, .transaction-item')) {
                const type = e.target.dataset.type;
                const id = e.target.dataset.id;
                this.handleItemClick(type, id);
            }
            
            if (e.target.matches('.copy-btn')) {
                this.copyToClipboard(e.target.dataset.text);
            }
        });

        // Pagination
        document.addEventListener('click', (e) => {
            if (e.target.matches('.pagination-btn')) {
                const page = e.target.dataset.page;
                this.handlePagination(page);
            }
        });
    }

    setupSidebarNavigation() {
        const navLinks = document.querySelectorAll('.explorer-nav-link');
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

    async loadNetworkStats() {
        try {
            // Load network stats from API
            const response = await fetch(`${API_BASE_URL}/api/blockchain/stats`);
            const data = await response.json();
            
            if (data.success) {
                this.networkStats = data.stats;
                this.updateNetworkStatsUI();
            }
        } catch (error) {
            console.error('Failed to load network stats:', error);
            // Load mock data
            this.loadMockNetworkStats();
        }
    }

    loadMockNetworkStats() {
        this.networkStats = {
            totalBlocks: 125000,
            totalTransactions: 850000,
            totalAddresses: 45000,
            currentTPS: 1250,
            averageBlockTime: 2.5,
            totalSupply: 100000000,
            circulatingSupply: 75000000,
            marketCap: 85000000,
            price: 0.85
        };
        this.updateNetworkStatsUI();
    }

    async loadLatestBlocks() {
        try {
            // Load latest blocks from API
            const response = await fetch(`${API_BASE_URL}/api/blockchain/blocks`);
            const data = await response.json();
            
            if (data.success) {
                this.blocks = data.blocks;
                this.updateBlocksUI();
            }
        } catch (error) {
            console.error('Failed to load latest blocks:', error);
            // Load mock data
            this.loadMockBlocks();
        }
    }

    loadMockBlocks() {
        this.blocks = [
            {
                number: 125000,
                hash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
                timestamp: new Date(Date.now() - 5000).toISOString(),
                transactions: 45,
                size: 2048,
                gasUsed: 1500000,
                gasLimit: 2000000,
                miner: '0x9876543210fedcba9876543210fedcba9876543210fedcba9876543210fedcba',
                difficulty: '2.5M',
                totalDifficulty: '125.5T'
            },
            {
                number: 124999,
                hash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
                timestamp: new Date(Date.now() - 10000).toISOString(),
                transactions: 38,
                size: 1856,
                gasUsed: 1200000,
                gasLimit: 2000000,
                miner: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
                difficulty: '2.4M',
                totalDifficulty: '125.2T'
            },
            {
                number: 124998,
                hash: '0x567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef123456',
                timestamp: new Date(Date.now() - 15000).toISOString(),
                transactions: 52,
                size: 2304,
                gasUsed: 1800000,
                gasLimit: 2000000,
                miner: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
                difficulty: '2.3M',
                totalDifficulty: '124.9T'
            }
        ];
        this.updateBlocksUI();
    }

    async loadLatestTransactions() {
        try {
            // Load latest transactions from API
            const response = await fetch(`${API_BASE_URL}/api/blockchain/transactions`);
            const data = await response.json();
            
            if (data.success) {
                this.transactions = data.transactions;
                this.updateTransactionsUI();
            }
        } catch (error) {
            console.error('Failed to load latest transactions:', error);
            // Load mock data
            this.loadMockTransactions();
        }
    }

    loadMockTransactions() {
        this.transactions = [
            {
                hash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
                blockNumber: 125000,
                from: '0x9876543210fedcba9876543210fedcba9876543210fedcba9876543210fedcba',
                to: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
                value: 1000,
                gasPrice: 20,
                gasUsed: 21000,
                status: 'success',
                timestamp: new Date(Date.now() - 5000).toISOString()
            },
            {
                hash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
                blockNumber: 124999,
                from: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
                to: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
                value: 500,
                gasPrice: 25,
                gasUsed: 65000,
                status: 'success',
                timestamp: new Date(Date.now() - 10000).toISOString()
            },
            {
                hash: '0x567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef123456',
                blockNumber: 124998,
                from: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
                to: '0x567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef123456',
                value: 2500,
                gasPrice: 18,
                gasUsed: 45000,
                status: 'success',
                timestamp: new Date(Date.now() - 15000).toISOString()
            }
        ];
        this.updateTransactionsUI();
    }

    async handleSearch() {
        const searchInput = document.querySelector('.search-input');
        const query = searchInput.value.trim();

        if (!query) {
            showNotification('warning', 'Search Error', 'Please enter a search term');
            return;
        }

        try {
            // Determine search type
            const searchType = this.determineSearchType(query);
            
            // Perform search
            const response = await fetch(`${API_BASE_URL}/api/blockchain/search`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    query: query,
                    type: searchType
                })
            });

            const data = await response.json();
            
            if (data.success) {
                this.searchResults = data.results;
                this.showSearchResults();
            } else {
                throw new Error(data.error || 'Search failed');
            }
            
        } catch (error) {
            console.error('Search failed:', error);
            // Show mock search results
            this.showMockSearchResults(query);
        }
    }

    determineSearchType(query) {
        if (query.startsWith('0x') && query.length === 66) {
            return 'block_hash';
        } else if (query.startsWith('0x') && query.length === 42) {
            return 'address';
        } else if (query.startsWith('0x') && query.length === 64) {
            return 'transaction_hash';
        } else if (!isNaN(query)) {
            return 'block_number';
        } else {
            return 'general';
        }
    }

    showMockSearchResults(query) {
        const searchType = this.determineSearchType(query);
        
        switch (searchType) {
            case 'block_number':
                this.searchResults = [this.blocks.find(b => b.number === parseInt(query))].filter(Boolean);
                break;
            case 'address':
                this.searchResults = [
                    {
                        type: 'address',
                        address: query,
                        balance: 15000,
                        transactionCount: 45,
                        lastActivity: new Date().toISOString()
                    }
                ];
                break;
            case 'transaction_hash':
                this.searchResults = [this.transactions.find(t => t.hash === query)].filter(Boolean);
                break;
            default:
                this.searchResults = [];
        }
        
        this.showSearchResults();
    }

    showSearchResults() {
        const container = document.querySelector('.search-results');
        if (!container) return;

        if (this.searchResults.length === 0) {
            container.innerHTML = '<p class="no-results">No results found</p>';
            return;
        }

        const resultsHTML = this.searchResults.map(result => this.createSearchResultHTML(result)).join('');
        container.innerHTML = resultsHTML;
    }

    createSearchResultHTML(result) {
        if (result.type === 'address') {
            return `
                <div class="search-result address-result">
                    <div class="result-header">
                        <h3>Address: ${result.address}</h3>
                        <span class="result-type">Address</span>
                    </div>
                    <div class="result-details">
                        <div class="detail">
                            <span class="label">Balance:</span>
                            <span class="value">${result.balance.toLocaleString()} RSC</span>
                        </div>
                        <div class="detail">
                            <span class="label">Transactions:</span>
                            <span class="value">${result.transactionCount}</span>
                        </div>
                        <div class="detail">
                            <span class="label">Last Activity:</span>
                            <span class="value">${new Date(result.lastActivity).toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            `;
        } else if (result.hash) {
            return `
                <div class="search-result transaction-result">
                    <div class="result-header">
                        <h3>Transaction: ${result.hash.substring(0, 16)}...</h3>
                        <span class="result-type">Transaction</span>
                    </div>
                    <div class="result-details">
                        <div class="detail">
                            <span class="label">From:</span>
                            <span class="value">${result.from.substring(0, 16)}...</span>
                        </div>
                        <div class="detail">
                            <span class="label">To:</span>
                            <span class="value">${result.to.substring(0, 16)}...</span>
                        </div>
                        <div class="detail">
                            <span class="label">Value:</span>
                            <span class="value">${result.value} RSC</span>
                        </div>
                    </div>
                </div>
            `;
        } else {
            return `
                <div class="search-result block-result">
                    <div class="result-header">
                        <h3>Block: ${result.number}</h3>
                        <span class="result-type">Block</span>
                    </div>
                    <div class="result-details">
                        <div class="detail">
                            <span class="label">Hash:</span>
                            <span class="value">${result.hash.substring(0, 16)}...</span>
                        </div>
                        <div class="detail">
                            <span class="label">Transactions:</span>
                            <span class="value">${result.transactions}</span>
                        </div>
                        <div class="detail">
                            <span class="label">Timestamp:</span>
                            <span class="value">${new Date(result.timestamp).toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            `;
        }
    }

    handleSearchInput(value) {
        // Real-time search suggestions could be implemented here
        if (value.length >= 3) {
            // Show search suggestions
        }
    }

    handleItemClick(type, id) {
        switch (type) {
            case 'block':
                this.showBlockDetails(id);
                break;
            case 'transaction':
                this.showTransactionDetails(id);
                break;
            case 'address':
                this.showAddressDetails(id);
                break;
        }
    }

    showBlockDetails(blockNumber) {
        const block = this.blocks.find(b => b.number === parseInt(blockNumber));
        if (!block) return;

        const detailsHTML = `
            <div class="block-details">
                <h2>Block #${block.number}</h2>
                <div class="detail-grid">
                    <div class="detail-item">
                        <span class="label">Hash:</span>
                        <span class="value">${block.hash}</span>
                        <button class="copy-btn" data-text="${block.hash}">Copy</button>
                    </div>
                    <div class="detail-item">
                        <span class="label">Timestamp:</span>
                        <span class="value">${new Date(block.timestamp).toLocaleString()}</span>
                    </div>
                    <div class="detail-item">
                        <span class="label">Transactions:</span>
                        <span class="value">${block.transactions}</span>
                    </div>
                    <div class="detail-item">
                        <span class="label">Size:</span>
                        <span class="value">${block.size} bytes</span>
                    </div>
                    <div class="detail-item">
                        <span class="label">Gas Used:</span>
                        <span class="value">${block.gasUsed.toLocaleString()}</span>
                    </div>
                    <div class="detail-item">
                        <span class="label">Gas Limit:</span>
                        <span class="value">${block.gasLimit.toLocaleString()}</span>
                    </div>
                    <div class="detail-item">
                        <span class="label">Miner:</span>
                        <span class="value">${block.miner.substring(0, 16)}...</span>
                    </div>
                    <div class="detail-item">
                        <span class="label">Difficulty:</span>
                        <span class="value">${block.difficulty}</span>
                    </div>
                </div>
            </div>
        `;

        this.showDetailsModal('Block Details', detailsHTML);
    }

    showTransactionDetails(hash) {
        const transaction = this.transactions.find(t => t.hash === hash);
        if (!transaction) return;

        const detailsHTML = `
            <div class="transaction-details">
                <h2>Transaction Details</h2>
                <div class="detail-grid">
                    <div class="detail-item">
                        <span class="label">Hash:</span>
                        <span class="value">${transaction.hash}</span>
                        <button class="copy-btn" data-text="${transaction.hash}">Copy</button>
                    </div>
                    <div class="detail-item">
                        <span class="label">Block:</span>
                        <span class="value">${transaction.blockNumber}</span>
                    </div>
                    <div class="detail-item">
                        <span class="label">From:</span>
                        <span class="value">${transaction.from}</span>
                        <button class="copy-btn" data-text="${transaction.from}">Copy</button>
                    </div>
                    <div class="detail-item">
                        <span class="label">To:</span>
                        <span class="value">${transaction.to}</span>
                        <button class="copy-btn" data-text="${transaction.to}">Copy</button>
                    </div>
                    <div class="detail-item">
                        <span class="label">Value:</span>
                        <span class="value">${transaction.value} RSC</span>
                    </div>
                    <div class="detail-item">
                        <span class="label">Gas Price:</span>
                        <span class="value">${transaction.gasPrice} Gwei</span>
                    </div>
                    <div class="detail-item">
                        <span class="label">Gas Used:</span>
                        <span class="value">${transaction.gasUsed.toLocaleString()}</span>
                    </div>
                    <div class="detail-item">
                        <span class="label">Status:</span>
                        <span class="value status-${transaction.status}">${transaction.status}</span>
                    </div>
                    <div class="detail-item">
                        <span class="label">Timestamp:</span>
                        <span class="value">${new Date(transaction.timestamp).toLocaleString()}</span>
                    </div>
                </div>
            </div>
        `;

        this.showDetailsModal('Transaction Details', detailsHTML);
    }

    showAddressDetails(address) {
        const detailsHTML = `
            <div class="address-details">
                <h2>Address Details</h2>
                <div class="detail-grid">
                    <div class="detail-item">
                        <span class="label">Address:</span>
                        <span class="value">${address}</span>
                        <button class="copy-btn" data-text="${address}">Copy</button>
                    </div>
                    <div class="detail-item">
                        <span class="label">Balance:</span>
                        <span class="value">15,000 RSC</span>
                    </div>
                    <div class="detail-item">
                        <span class="label">Transaction Count:</span>
                        <span class="value">45</span>
                    </div>
                    <div class="detail-item">
                        <span class="label">First Transaction:</span>
                        <span class="value">2024-01-15 10:30:00</span>
                    </div>
                    <div class="detail-item">
                        <span class="label">Last Transaction:</span>
                        <span class="value">2024-01-20 15:45:00</span>
                    </div>
                </div>
            </div>
        `;

        this.showDetailsModal('Address Details', detailsHTML);
    }

    showDetailsModal(title, content) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${title}</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    ${content}
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Close modal events
        modal.querySelector('.modal-close').addEventListener('click', () => {
            modal.remove();
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    handlePagination(page) {
        // Implementation for pagination
        console.log('Navigate to page:', page);
    }

    copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            showNotification('success', 'Copied', 'Text copied to clipboard');
        }).catch(() => {
            showNotification('error', 'Copy Failed', 'Failed to copy to clipboard');
        });
    }

    updateNetworkStatsUI() {
        const statsElements = document.querySelectorAll('.network-stat-value');
        statsElements.forEach(element => {
            const stat = element.dataset.stat;
            switch (stat) {
                case 'total_blocks':
                    element.textContent = this.networkStats.totalBlocks.toLocaleString();
                    break;
                case 'total_transactions':
                    element.textContent = this.networkStats.totalTransactions.toLocaleString();
                    break;
                case 'total_addresses':
                    element.textContent = this.networkStats.totalAddresses.toLocaleString();
                    break;
                case 'current_tps':
                    element.textContent = this.networkStats.currentTPS.toLocaleString();
                    break;
                case 'block_time':
                    element.textContent = `${this.networkStats.averageBlockTime}s`;
                    break;
                case 'total_supply':
                    element.textContent = this.networkStats.totalSupply.toLocaleString();
                    break;
                case 'circulating_supply':
                    element.textContent = this.networkStats.circulatingSupply.toLocaleString();
                    break;
                case 'market_cap':
                    element.textContent = `$${this.networkStats.marketCap.toLocaleString()}`;
                    break;
                case 'price':
                    element.textContent = `$${this.networkStats.price}`;
                    break;
            }
        });
    }

    updateBlocksUI() {
        const container = document.querySelector('.blocks-list');
        if (!container) return;

        if (this.blocks.length === 0) {
            container.innerHTML = '<p class="no-blocks">No blocks found</p>';
            return;
        }

        const blocksHTML = this.blocks.map(block => this.createBlockHTML(block)).join('');
        container.innerHTML = blocksHTML;
    }

    createBlockHTML(block) {
        return `
            <div class="block-item" data-type="block" data-id="${block.number}">
                <div class="block-header">
                    <div class="block-number">#${block.number}</div>
                    <div class="block-time">${this.formatTime(block.timestamp)}</div>
                </div>
                <div class="block-details">
                    <div class="block-hash">
                        <span class="label">Hash:</span>
                        <span class="value">${block.hash.substring(0, 16)}...</span>
                    </div>
                    <div class="block-transactions">
                        <span class="label">Transactions:</span>
                        <span class="value">${block.transactions}</span>
                    </div>
                    <div class="block-size">
                        <span class="label">Size:</span>
                        <span class="value">${block.size} bytes</span>
                    </div>
                    <div class="block-gas">
                        <span class="label">Gas Used:</span>
                        <span class="value">${block.gasUsed.toLocaleString()}</span>
                    </div>
                </div>
            </div>
        `;
    }

    updateTransactionsUI() {
        const container = document.querySelector('.transactions-list');
        if (!container) return;

        if (this.transactions.length === 0) {
            container.innerHTML = '<p class="no-transactions">No transactions found</p>';
            return;
        }

        const transactionsHTML = this.transactions.map(tx => this.createTransactionHTML(tx)).join('');
        container.innerHTML = transactionsHTML;
    }

    createTransactionHTML(tx) {
        return `
            <div class="transaction-item" data-type="transaction" data-id="${tx.hash}">
                <div class="transaction-header">
                    <div class="transaction-hash">${tx.hash.substring(0, 16)}...</div>
                    <div class="transaction-status status-${tx.status}">${tx.status}</div>
                </div>
                <div class="transaction-details">
                    <div class="transaction-block">
                        <span class="label">Block:</span>
                        <span class="value">${tx.blockNumber}</span>
                    </div>
                    <div class="transaction-from">
                        <span class="label">From:</span>
                        <span class="value">${tx.from.substring(0, 16)}...</span>
                    </div>
                    <div class="transaction-to">
                        <span class="label">To:</span>
                        <span class="value">${tx.to.substring(0, 16)}...</span>
                    </div>
                    <div class="transaction-value">
                        <span class="label">Value:</span>
                        <span class="value">${tx.value} RSC</span>
                    </div>
                    <div class="transaction-gas">
                        <span class="label">Gas Used:</span>
                        <span class="value">${tx.gasUsed.toLocaleString()}</span>
                    </div>
                    <div class="transaction-time">
                        <span class="label">Time:</span>
                        <span class="value">${this.formatTime(tx.timestamp)}</span>
                    </div>
                </div>
            </div>
        `;
    }

    showPage(pageName) {
        // Hide all pages
        const pages = document.querySelectorAll('.explorer-page');
        pages.forEach(page => page.classList.remove('active'));
        
        // Show target page
        const targetPage = document.querySelector(`.explorer-page[data-page="${pageName}"]`);
        if (targetPage) {
            targetPage.classList.add('active');
        }
        
        // Update page-specific content
        this.updatePageContent(pageName);
    }

    updatePageContent(pageName) {
        switch (pageName) {
            case 'blocks':
                this.updateBlocksPage();
                break;
            case 'transactions':
                this.updateTransactionsPage();
                break;
            case 'addresses':
                this.updateAddressesPage();
                break;
            case 'search':
                this.updateSearchPage();
                break;
            case 'analytics':
                this.updateAnalyticsPage();
                break;
        }
    }

    updateBlocksPage() {
        this.updateBlocksUI();
    }

    updateTransactionsPage() {
        this.updateTransactionsUI();
    }

    updateAddressesPage() {
        // Implementation for addresses page
        const container = document.querySelector('.addresses-list');
        if (container) {
            container.innerHTML = '<p>Address tracking feature coming soon</p>';
        }
    }

    updateSearchPage() {
        // Search page is already set up
    }

    updateAnalyticsPage() {
        // Implementation for analytics charts
        const container = document.querySelector('.analytics-charts');
        if (container) {
            container.innerHTML = '<p>Analytics charts coming soon</p>';
        }
    }

    formatTime(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;
        
        if (diff < 60000) { // Less than 1 minute
            return 'Just now';
        } else if (diff < 3600000) { // Less than 1 hour
            const minutes = Math.floor(diff / 60000);
            return `${minutes}m ago`;
        } else if (diff < 86400000) { // Less than 1 day
            const hours = Math.floor(diff / 3600000);
            return `${hours}h ago`;
        } else {
            return date.toLocaleDateString();
        }
    }
}

// Initialize explorer when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.explorerManager = new ExplorerManager();
});

// Export for global access
window.ExplorerManager = ExplorerManager; 