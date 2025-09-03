class NFTMarketplace {
    constructor() {
        this.nfts = new Map();
        this.collections = new Map();
        this.userNFTs = new Map();
        this.currentUser = null;
        this.eventBus = new EventTarget();
        this.initialized = false;
    }

    async init() {
        if (this.initialized) return;
        
        try {
            await this.loadSampleData();
            await this.setupEventListeners();
            this.initialized = true;
            
            console.log('🖼️ RSC Chain NFT Marketplace Initialized');
            this.emit('nft:ready', { status: 'connected' });
        } catch (error) {
            console.error('Failed to initialize NFT Marketplace:', error);
            this.emit('nft:error', { error: error.message });
        }
    }

    async loadSampleData() {
        const sampleCollections = [
            {
                id: 'collection_001',
                name: 'RSC Genesis Blocks',
                description: 'The first NFT collection on RSC Chain representing genesis blocks',
                image: 'https://via.placeholder.com/400x400/22c55e/ffffff?text=Genesis+Block',
                creator: 'RSC Team',
                totalSupply: 1000,
                floorPrice: 2.5,
                volume: 125000,
                verified: true
            },
            {
                id: 'collection_002',
                name: 'Quantum Miners',
                description: 'Elite miners with quantum computing capabilities',
                image: 'https://via.placeholder.com/400x400/3b82f6/ffffff?text=Quantum+Miner',
                creator: 'CryptoArtist_99',
                totalSupply: 500,
                floorPrice: 3.8,
                volume: 89000,
                verified: true
            },
            {
                id: 'collection_003',
                name: 'AI Consensus',
                description: 'Unique NFTs representing AI consensus algorithms',
                image: 'https://via.placeholder.com/400x400/a855f7/ffffff?text=AI+Consensus',
                creator: 'BlockchainDev',
                totalSupply: 250,
                floorPrice: 4.2,
                volume: 67000,
                verified: false
            }
        ];

        sampleCollections.forEach(collection => {
            this.collections.set(collection.id, collection);
        });

        const sampleNFTs = [
            {
                id: 'nft_001',
                tokenId: 1,
                name: 'Genesis Block #1',
                description: 'The very first block mined on RSC Chain',
                image: 'https://via.placeholder.com/400x400/22c55e/ffffff?text=Genesis+%231',
                collectionId: 'collection_001',
                owner: 'user_001',
                creator: 'RSC Team',
                price: 5.0,
                lastSale: 4.5,
                rarity: 'Legendary',
                attributes: [
                    { trait_type: 'Block Height', value: '0' },
                    { trait_type: 'Timestamp', value: '2024-01-01' },
                    { trait_type: 'Hash Rate', value: '1000 H/s' }
                ],
                listed: true,
                verified: true
            },
            {
                id: 'nft_002',
                tokenId: 42,
                name: 'Quantum Miner Alpha',
                description: 'Advanced quantum mining rig with AI optimization',
                image: 'https://via.placeholder.com/400x400/3b82f6/ffffff?text=Quantum+Alpha',
                collectionId: 'collection_002',
                owner: 'user_002',
                creator: 'CryptoArtist_99',
                price: 7.2,
                lastSale: 6.8,
                rarity: 'Epic',
                attributes: [
                    { trait_type: 'Computing Power', value: '10 TH/s' },
                    { trait_type: 'AI Level', value: 'Advanced' },
                    { trait_type: 'Efficiency', value: '95%' }
                ],
                listed: true,
                verified: true
            },
            {
                id: 'nft_003',
                tokenId: 128,
                name: 'AI Consensus Node',
                description: 'Neural network node for blockchain consensus',
                image: 'https://via.placeholder.com/400x400/a855f7/ffffff?text=AI+Node',
                collectionId: 'collection_003',
                owner: 'user_003',
                creator: 'BlockchainDev',
                price: 3.5,
                lastSale: 3.2,
                rarity: 'Rare',
                attributes: [
                    { trait_type: 'Neural Layers', value: '12' },
                    { trait_type: 'Consensus Speed', value: '1.2s' },
                    { trait_type: 'Accuracy', value: '99.9%' }
                ],
                listed: true,
                verified: false
            }
        ];

        sampleNFTs.forEach(nft => {
            this.nfts.set(nft.id, nft);
        });
    }

    async setupEventListeners() {
        this.eventBus.addEventListener('nft:mint', (event) => {
            this.handleMintNFT(event.detail);
        });

        this.eventBus.addEventListener('nft:buy', (event) => {
            this.handleBuyNFT(event.detail);
        });

        this.eventBus.addEventListener('nft:list', (event) => {
            this.handleListNFT(event.detail);
        });
    }

    async mintNFT(nftData) {
        if (!this.currentUser) {
            throw new Error('User must be logged in to mint NFTs');
        }

        const nft = {
            id: `nft_${Date.now()}`,
            tokenId: Math.floor(Math.random() * 1000000),
            name: nftData.name,
            description: nftData.description,
            image: nftData.image,
            collectionId: nftData.collectionId || 'user_collection',
            owner: this.currentUser.id,
            creator: this.currentUser.id,
            price: 0,
            lastSale: 0,
            rarity: nftData.rarity || 'Common',
            attributes: nftData.attributes || [],
            listed: false,
            verified: false,
            mintDate: new Date()
        };

        this.nfts.set(nft.id, nft);

        if (!this.userNFTs.has(this.currentUser.id)) {
            this.userNFTs.set(this.currentUser.id, []);
        }
        this.userNFTs.get(this.currentUser.id).push(nft.id);

        this.emit('nft:minted', nft);
        return nft;
    }

    async buyNFT(nftId, price) {
        if (!this.currentUser) {
            throw new Error('User must be logged in to buy NFTs');
        }

        const nft = this.nfts.get(nftId);
        if (!nft) {
            throw new Error('NFT not found');
        }

        if (!nft.listed) {
            throw new Error('NFT is not listed for sale');
        }

        if (nft.owner === this.currentUser.id) {
            throw new Error('Cannot buy your own NFT');
        }

        const previousOwner = nft.owner;
        nft.owner = this.currentUser.id;
        nft.lastSale = price;
        nft.listed = false;
        nft.price = 0;

        // Update user NFTs
        if (!this.userNFTs.has(this.currentUser.id)) {
            this.userNFTs.set(this.currentUser.id, []);
        }
        this.userNFTs.get(this.currentUser.id).push(nftId);

        // Remove from previous owner
        if (this.userNFTs.has(previousOwner)) {
            const userNFTs = this.userNFTs.get(previousOwner);
            const index = userNFTs.indexOf(nftId);
            if (index > -1) {
                userNFTs.splice(index, 1);
            }
        }

        this.emit('nft:purchased', { nft, buyer: this.currentUser.id, seller: previousOwner, price });
        return nft;
    }

    async listNFT(nftId, price) {
        if (!this.currentUser) {
            throw new Error('User must be logged in to list NFTs');
        }

        const nft = this.nfts.get(nftId);
        if (!nft) {
            throw new Error('NFT not found');
        }

        if (nft.owner !== this.currentUser.id) {
            throw new Error('You can only list your own NFTs');
        }

        nft.listed = true;
        nft.price = price;

        this.emit('nft:listed', { nft, price });
        return nft;
    }

    async unlistNFT(nftId) {
        if (!this.currentUser) {
            throw new Error('User must be logged in to unlist NFTs');
        }

        const nft = this.nfts.get(nftId);
        if (!nft) {
            throw new Error('NFT not found');
        }

        if (nft.owner !== this.currentUser.id) {
            throw new Error('You can only unlist your own NFTs');
        }

        nft.listed = false;
        nft.price = 0;

        this.emit('nft:unlisted', { nft });
        return nft;
    }

    getNFTs(filters = {}) {
        let nfts = Array.from(this.nfts.values());

        if (filters.listed) {
            nfts = nfts.filter(nft => nft.listed);
        }

        if (filters.collectionId) {
            nfts = nfts.filter(nft => nft.collectionId === filters.collectionId);
        }

        if (filters.owner) {
            nfts = nfts.filter(nft => nft.owner === filters.owner);
        }

        if (filters.creator) {
            nfts = nfts.filter(nft => nft.creator === filters.creator);
        }

        if (filters.minPrice) {
            nfts = nfts.filter(nft => nft.price >= filters.minPrice);
        }

        if (filters.maxPrice) {
            nfts = nfts.filter(nft => nft.price <= filters.maxPrice);
        }

        if (filters.rarity) {
            nfts = nfts.filter(nft => nft.rarity === filters.rarity);
        }

        if (filters.sortBy) {
            switch (filters.sortBy) {
                case 'price_asc':
                    nfts.sort((a, b) => a.price - b.price);
                    break;
                case 'price_desc':
                    nfts.sort((a, b) => b.price - a.price);
                    break;
                case 'newest':
                    nfts.sort((a, b) => new Date(b.mintDate) - new Date(a.mintDate));
                    break;
                case 'oldest':
                    nfts.sort((a, b) => new Date(a.mintDate) - new Date(b.mintDate));
                    break;
            }
        }

        return nfts;
    }

    getCollections() {
        return Array.from(this.collections.values());
    }

    getCollection(collectionId) {
        return this.collections.get(collectionId);
    }

    getNFT(nftId) {
        return this.nfts.get(nftId);
    }

    getUserNFTs(userId) {
        return this.getNFTs({ owner: userId });
    }

    handleMintNFT(data) {
        console.log('NFT minted:', data);
    }

    handleBuyNFT(data) {
        console.log('NFT purchased:', data);
    }

    handleListNFT(data) {
        console.log('NFT listed:', data);
    }

    emit(eventName, data) {
        this.eventBus.dispatchEvent(new CustomEvent(eventName, { detail: data }));
    }

    on(eventName, handler) {
        this.eventBus.addEventListener(eventName, handler);
    }

    off(eventName, handler) {
        this.eventBus.removeEventListener(eventName, handler);
    }
}

class NFTUIManager {
    constructor(nftMarketplace) {
        this.nft = nftMarketplace;
        this.currentView = 'marketplace';
    }

    init() {
        this.setupEventListeners();
        this.renderMarketplace();
    }

    setupEventListeners() {
        this.nft.on('nft:minted', (event) => {
            this.showSuccess('NFT minted successfully!');
            this.renderMarketplace();
        });

        this.nft.on('nft:purchased', (event) => {
            this.showSuccess('NFT purchased successfully!');
            this.renderMarketplace();
        });

        this.nft.on('nft:listed', (event) => {
            this.showSuccess('NFT listed successfully!');
            this.renderMarketplace();
        });
    }

    renderMarketplace() {
        const container = document.querySelector('[data-nft-marketplace]');
        if (!container) return;

        const nfts = this.nft.getNFTs({ listed: true });
        const collections = this.nft.getCollections();

        container.innerHTML = `
            <div class="nft-marketplace">
                <div class="marketplace-header">
                    <h2>NFT Marketplace</h2>
                    <div class="marketplace-stats">
                        <div class="stat">
                            <span class="stat-value">${nfts.length}</span>
                            <span class="stat-label">Listed NFTs</span>
                        </div>
                        <div class="stat">
                            <span class="stat-value">${collections.length}</span>
                            <span class="stat-label">Collections</span>
                        </div>
                        <div class="stat">
                            <span class="stat-value">$${this.calculateTotalVolume().toLocaleString()}</span>
                            <span class="stat-label">Total Volume</span>
                        </div>
                    </div>
                </div>
                
                <div class="marketplace-filters">
                    <select class="filter-select" id="collectionFilter">
                        <option value="">All Collections</option>
                        ${collections.map(collection => `
                            <option value="${collection.id}">${collection.name}</option>
                        `).join('')}
                    </select>
                    
                    <select class="filter-select" id="rarityFilter">
                        <option value="">All Rarities</option>
                        <option value="Common">Common</option>
                        <option value="Rare">Rare</option>
                        <option value="Epic">Epic</option>
                        <option value="Legendary">Legendary</option>
                    </select>
                    
                    <select class="filter-select" id="sortFilter">
                        <option value="newest">Newest</option>
                        <option value="oldest">Oldest</option>
                        <option value="price_asc">Price: Low to High</option>
                        <option value="price_desc">Price: High to Low</option>
                    </select>
                </div>
                
                <div class="nft-grid">
                    ${nfts.map(nft => this.renderNFTCard(nft)).join('')}
                </div>
            </div>
        `;

        this.setupFilterListeners();
    }

    renderNFTCard(nft) {
        const collection = this.nft.getCollection(nft.collectionId);
        
        return `
            <div class="nft-card" data-nft-id="${nft.id}">
                <div class="nft-image">
                    <img src="${nft.image}" alt="${nft.name}" loading="lazy">
                    ${nft.verified ? '<div class="verified-badge"><i class="fas fa-check-circle"></i></div>' : ''}
                    <div class="rarity-badge rarity-${nft.rarity.toLowerCase()}">${nft.rarity}</div>
                </div>
                <div class="nft-info">
                    <div class="nft-collection">${collection?.name || 'Unknown Collection'}</div>
                    <h3 class="nft-name">${nft.name}</h3>
                    <p class="nft-description">${nft.description}</p>
                    <div class="nft-attributes">
                        ${nft.attributes.slice(0, 3).map(attr => `
                            <div class="attribute">
                                <span class="attr-label">${attr.trait_type}:</span>
                                <span class="attr-value">${attr.value}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
                <div class="nft-footer">
                    <div class="nft-price">
                        <div class="price-label">Price</div>
                        <div class="price-value">${nft.price} RSC</div>
                    </div>
                    <div class="nft-actions">
                        ${nft.listed ? `
                            <button class="btn btn-primary" onclick="nftUI.buyNFT('${nft.id}', ${nft.price})">
                                Buy Now
                            </button>
                        ` : `
                            <button class="btn btn-secondary" disabled>
                                Not Listed
                            </button>
                        `}
                    </div>
                </div>
            </div>
        `;
    }

    setupFilterListeners() {
        const collectionFilter = document.getElementById('collectionFilter');
        const rarityFilter = document.getElementById('rarityFilter');
        const sortFilter = document.getElementById('sortFilter');

        [collectionFilter, rarityFilter, sortFilter].forEach(filter => {
            if (filter) {
                filter.addEventListener('change', () => {
                    this.applyFilters();
                });
            }
        });
    }

    applyFilters() {
        const collectionId = document.getElementById('collectionFilter')?.value || '';
        const rarity = document.getElementById('rarityFilter')?.value || '';
        const sortBy = document.getElementById('sortFilter')?.value || 'newest';

        const filters = {
            listed: true,
            sortBy: sortBy
        };

        if (collectionId) filters.collectionId = collectionId;
        if (rarity) filters.rarity = rarity;

        const nfts = this.nft.getNFTs(filters);
        const nftGrid = document.querySelector('.nft-grid');
        
        if (nftGrid) {
            nftGrid.innerHTML = nfts.map(nft => this.renderNFTCard(nft)).join('');
        }
    }

    async buyNFT(nftId, price) {
        try {
            await this.nft.buyNFT(nftId, price);
        } catch (error) {
            this.showError('Failed to buy NFT: ' + error.message);
        }
    }

    async mintNFT(nftData) {
        try {
            await this.nft.mintNFT(nftData);
        } catch (error) {
            this.showError('Failed to mint NFT: ' + error.message);
        }
    }

    async listNFT(nftId, price) {
        try {
            await this.nft.listNFT(nftId, price);
        } catch (error) {
            this.showError('Failed to list NFT: ' + error.message);
        }
    }

    calculateTotalVolume() {
        const nfts = Array.from(this.nft.nfts.values());
        return nfts.reduce((total, nft) => total + (nft.lastSale || 0), 0);
    }

    showSuccess(message) {
        if (window.componentSystem) {
            componentSystem.create('Notification').show(message, 'success');
        }
    }

    showError(message) {
        if (window.componentSystem) {
            componentSystem.create('Notification').show(message, 'error');
        }
    }
}

const nftMarketplace = new NFTMarketplace();
const nftUI = new NFTUIManager(nftMarketplace);

document.addEventListener('DOMContentLoaded', async () => {
    try {
        await nftMarketplace.init();
        nftUI.init();
    } catch (error) {
        console.error('Failed to initialize NFT Marketplace:', error);
    }
});

window.nftMarketplace = nftMarketplace;
window.nftUI = nftUI;
