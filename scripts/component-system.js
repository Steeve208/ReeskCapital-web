// ===== RSC CHAIN - ADVANCED COMPONENT SYSTEM =====

class ComponentSystem {
    constructor() {
        this.components = new Map();
        this.eventBus = new EventTarget();
        this.initialized = false;
    }

    // Initialize the component system
    init() {
        if (this.initialized) return;
        
        this.registerCoreComponents();
        this.initializeComponents();
        this.setupEventListeners();
        this.initialized = true;
        
        console.log('🚀 RSC Chain Component System Initialized');
    }

    // Register core components
    registerCoreComponents() {
        this.register('Button', ButtonComponent);
        this.register('Card', CardComponent);
        this.register('Modal', ModalComponent);
        this.register('Notification', NotificationComponent);
        this.register('ProgressBar', ProgressBarComponent);
        this.register('Counter', CounterComponent);
        this.register('Chart', ChartComponent);
        this.register('ParticleSystem', ParticleSystemComponent);
        this.register('BlockchainVisualizer', BlockchainVisualizerComponent);
        this.register('MiningInterface', MiningInterfaceComponent);
        this.register('WalletConnector', WalletConnectorComponent);
        this.register('SocialFeed', SocialFeedComponent);
        this.register('AIAssistant', AIAssistantComponent);
        this.register('NFTGallery', NFTGalleryComponent);
        this.register('DeFiDashboard', DeFiDashboardComponent);
    }

    // Register a component
    register(name, componentClass) {
        this.components.set(name, componentClass);
    }

    // Create a component instance
    create(name, options = {}) {
        const ComponentClass = this.components.get(name);
        if (!ComponentClass) {
            throw new Error(`Component ${name} not found`);
        }
        return new ComponentClass(options);
    }

    // Initialize all components on the page
    initializeComponents() {
        // Initialize buttons
        document.querySelectorAll('[data-component="button"]').forEach(element => {
            const component = this.create('Button', { element });
            component.init();
        });

        // Initialize cards
        document.querySelectorAll('[data-component="card"]').forEach(element => {
            const component = this.create('Card', { element });
            component.init();
        });

        // Initialize modals
        document.querySelectorAll('[data-component="modal"]').forEach(element => {
            const component = this.create('Modal', { element });
            component.init();
        });

        // Initialize progress bars
        document.querySelectorAll('[data-component="progress"]').forEach(element => {
            const component = this.create('ProgressBar', { element });
            component.init();
        });

        // Initialize counters
        document.querySelectorAll('[data-component="counter"]').forEach(element => {
            const component = this.create('Counter', { element });
            component.init();
        });

        // Initialize charts
        document.querySelectorAll('[data-component="chart"]').forEach(element => {
            const component = this.create('Chart', { element });
            component.init();
        });

        // Initialize particle systems
        document.querySelectorAll('[data-component="particles"]').forEach(element => {
            const component = this.create('ParticleSystem', { element });
            component.init();
        });

        // Initialize blockchain visualizers
        document.querySelectorAll('[data-component="blockchain"]').forEach(element => {
            const component = this.create('BlockchainVisualizer', { element });
            component.init();
        });

        // Initialize mining interfaces
        document.querySelectorAll('[data-component="mining"]').forEach(element => {
            const component = this.create('MiningInterface', { element });
            component.init();
        });

        // Initialize wallet connectors
        document.querySelectorAll('[data-component="wallet"]').forEach(element => {
            const component = this.create('WalletConnector', { element });
            component.init();
        });

        // Initialize social feeds
        document.querySelectorAll('[data-component="social"]').forEach(element => {
            const component = this.create('SocialFeed', { element });
            component.init();
        });

        // Initialize AI assistants
        document.querySelectorAll('[data-component="ai"]').forEach(element => {
            const component = this.create('AIAssistant', { element });
            component.init();
        });

        // Initialize NFT galleries
        document.querySelectorAll('[data-component="nft"]').forEach(element => {
            const component = this.create('NFTGallery', { element });
            component.init();
        });

        // Initialize DeFi dashboards
        document.querySelectorAll('[data-component="defi"]').forEach(element => {
            const component = this.create('DeFiDashboard', { element });
            component.init();
        });
    }

    // Setup global event listeners
    setupEventListeners() {
        // Theme toggle
        this.eventBus.addEventListener('theme:change', (event) => {
            this.handleThemeChange(event.detail);
        });

        // Wallet connection
        this.eventBus.addEventListener('wallet:connect', (event) => {
            this.handleWalletConnect(event.detail);
        });

        // Mining events
        this.eventBus.addEventListener('mining:start', (event) => {
            this.handleMiningStart(event.detail);
        });

        // Social events
        this.eventBus.addEventListener('social:post', (event) => {
            this.handleSocialPost(event.detail);
        });

        // AI events
        this.eventBus.addEventListener('ai:query', (event) => {
            this.handleAIQuery(event.detail);
        });
    }

    // Event handlers
    handleThemeChange(theme) {
        document.body.setAttribute('data-theme', theme);
        localStorage.setItem('rsc-theme', theme);
    }

    handleWalletConnect(walletData) {
        console.log('Wallet connected:', walletData);
        // Update UI with wallet information
        this.updateWalletUI(walletData);
    }

    handleMiningStart(miningData) {
        console.log('Mining started:', miningData);
        // Start mining interface
        this.startMiningInterface(miningData);
    }

    handleSocialPost(postData) {
        console.log('Social post:', postData);
        // Add post to feed
        this.addToSocialFeed(postData);
    }

    handleAIQuery(queryData) {
        console.log('AI query:', queryData);
        // Process AI query
        this.processAIQuery(queryData);
    }

    // Utility methods
    updateWalletUI(walletData) {
        const walletElements = document.querySelectorAll('[data-wallet-info]');
        walletElements.forEach(element => {
            element.textContent = walletData.address;
        });
    }

    startMiningInterface(miningData) {
        const miningComponents = document.querySelectorAll('[data-component="mining"]');
        miningComponents.forEach(element => {
            const component = this.create('MiningInterface', { element });
            component.startMining(miningData);
        });
    }

    addToSocialFeed(postData) {
        const socialComponents = document.querySelectorAll('[data-component="social"]');
        socialComponents.forEach(element => {
            const component = this.create('SocialFeed', { element });
            component.addPost(postData);
        });
    }

    processAIQuery(queryData) {
        const aiComponents = document.querySelectorAll('[data-component="ai"]');
        aiComponents.forEach(element => {
            const component = this.create('AIAssistant', { element });
            component.processQuery(queryData);
        });
    }

    // Emit events
    emit(eventName, data) {
        this.eventBus.dispatchEvent(new CustomEvent(eventName, { detail: data }));
    }
}

// ===== BASE COMPONENT CLASS =====
class BaseComponent {
    constructor(options = {}) {
        this.element = options.element;
        this.options = options;
        this.state = {};
        this.eventListeners = [];
    }

    init() {
        this.setupEventListeners();
        this.render();
    }

    setupEventListeners() {
        // Override in subclasses
    }

    render() {
        // Override in subclasses
    }

    updateState(newState) {
        this.state = { ...this.state, ...newState };
        this.render();
    }

    addEventListener(event, handler) {
        if (this.element) {
            this.element.addEventListener(event, handler);
            this.eventListeners.push({ event, handler });
        }
    }

    destroy() {
        this.eventListeners.forEach(({ event, handler }) => {
            if (this.element) {
                this.element.removeEventListener(event, handler);
            }
        });
        this.eventListeners = [];
    }
}

// ===== BUTTON COMPONENT =====
class ButtonComponent extends BaseComponent {
    setupEventListeners() {
        this.addEventListener('click', (e) => {
            this.handleClick(e);
        });

        this.addEventListener('mouseenter', (e) => {
            this.handleHover(e);
        });

        this.addEventListener('mouseleave', (e) => {
            this.handleLeave(e);
        });
    }

    handleClick(e) {
        const action = this.element.getAttribute('data-action');
        const component = this.element.getAttribute('data-component');
        
        if (action) {
            this.executeAction(action);
        }
        
        // Add click animation
        this.element.classList.add('btn-clicked');
        setTimeout(() => {
            this.element.classList.remove('btn-clicked');
        }, 200);
    }

    handleHover(e) {
        this.element.classList.add('btn-hover');
    }

    handleLeave(e) {
        this.element.classList.remove('btn-hover');
    }

    executeAction(action) {
        switch (action) {
            case 'mining:start':
                componentSystem.emit('mining:start', { timestamp: Date.now() });
                break;
            case 'wallet:connect':
                componentSystem.emit('wallet:connect', { address: '0x...' });
                break;
            case 'theme:toggle':
                const currentTheme = document.body.getAttribute('data-theme') || 'dark';
                const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
                componentSystem.emit('theme:change', newTheme);
                break;
            default:
                console.log('Unknown action:', action);
        }
    }
}

// ===== CARD COMPONENT =====
class CardComponent extends BaseComponent {
    setupEventListeners() {
        this.addEventListener('mouseenter', (e) => {
            this.handleHover(e);
        });

        this.addEventListener('mouseleave', (e) => {
            this.handleLeave(e);
        });
    }

    handleHover(e) {
        this.element.classList.add('card-hover');
        this.element.style.transform = 'translateY(-8px) scale(1.02)';
    }

    handleLeave(e) {
        this.element.classList.remove('card-hover');
        this.element.style.transform = 'translateY(0) scale(1)';
    }
}

// ===== MODAL COMPONENT =====
class ModalComponent extends BaseComponent {
    setupEventListeners() {
        const closeBtn = this.element.querySelector('.modal-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.close();
            });
        }

        this.element.addEventListener('click', (e) => {
            if (e.target === this.element) {
                this.close();
            }
        });
    }

    open() {
        this.element.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    close() {
        this.element.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// ===== NOTIFICATION COMPONENT =====
class NotificationComponent extends BaseComponent {
    show(message, type = 'info', duration = 5000) {
        const notification = document.createElement('div');
        notification.className = `notification-glass ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-message">${message}</span>
                <button class="notification-close">&times;</button>
            </div>
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.add('show');
        }, 100);

        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            this.hide(notification);
        });

        setTimeout(() => {
            this.hide(notification);
        }, duration);
    }

    hide(notification) {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }
}

// ===== PROGRESS BAR COMPONENT =====
class ProgressBarComponent extends BaseComponent {
    setupEventListeners() {
        // Animate progress bar when it comes into view
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animate();
                }
            });
        });
        observer.observe(this.element);
    }

    animate() {
        const targetWidth = this.element.getAttribute('data-progress') || '0%';
        const progressFill = this.element.querySelector('.progress-fill');
        
        if (progressFill) {
            progressFill.style.width = '0%';
            setTimeout(() => {
                progressFill.style.width = targetWidth;
            }, 500);
        }
    }
}

// ===== COUNTER COMPONENT =====
class CounterComponent extends BaseComponent {
    setupEventListeners() {
        // Animate counter when it comes into view
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animate();
                }
            });
        });
        observer.observe(this.element);
    }

    animate() {
        const target = parseInt(this.element.getAttribute('data-target')) || 0;
        const duration = 2000; // 2 seconds
        const increment = target / (duration / 16); // 60fps
        let current = 0;

        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            this.element.textContent = Math.floor(current).toLocaleString();
        }, 16);
    }
}

// ===== CHART COMPONENT =====
class ChartComponent extends BaseComponent {
    setupEventListeners() {
        // Initialize chart when it comes into view
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.initChart();
                }
            });
        });
        observer.observe(this.element);
    }

    initChart() {
        const canvas = this.element.querySelector('canvas');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const data = JSON.parse(this.element.getAttribute('data-chart') || '{}');
        
        this.drawChart(ctx, data);
    }

    drawChart(ctx, data) {
        // Simple chart implementation
        const width = ctx.canvas.width;
        const height = ctx.canvas.height;
        const padding = 20;

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        // Draw grid
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1;

        // Vertical lines
        for (let i = 0; i <= 10; i++) {
            const x = padding + (i * (width - 2 * padding)) / 10;
            ctx.beginPath();
            ctx.moveTo(x, padding);
            ctx.lineTo(x, height - padding);
            ctx.stroke();
        }

        // Horizontal lines
        for (let i = 0; i <= 5; i++) {
            const y = padding + (i * (height - 2 * padding)) / 5;
            ctx.beginPath();
            ctx.moveTo(padding, y);
            ctx.lineTo(width - padding, y);
            ctx.stroke();
        }

        // Draw data line
        if (data.values && data.values.length > 0) {
            const maxValue = Math.max(...data.values);
            const minValue = Math.min(...data.values);
            const range = maxValue - minValue;

            ctx.strokeStyle = data.color || '#22c55e';
            ctx.lineWidth = 2;
            ctx.beginPath();

            data.values.forEach((value, index) => {
                const x = padding + (index * (width - 2 * padding)) / (data.values.length - 1);
                const y = height - padding - ((value - minValue) / range) * (height - 2 * padding);

                if (index === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            });

            ctx.stroke();
        }
    }
}

// ===== PARTICLE SYSTEM COMPONENT =====
class ParticleSystemComponent extends BaseComponent {
    setupEventListeners() {
        this.particles = [];
        this.animationId = null;
        this.initParticles();
    }

    initParticles() {
        const container = this.element;
        const particleCount = parseInt(container.getAttribute('data-count')) || 50;

        for (let i = 0; i < particleCount; i++) {
            this.createParticle(container);
        }

        this.animate();
    }

    createParticle(container) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        // Random position
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = '100%';
        
        // Random size
        const size = Math.random() * 3 + 1;
        particle.style.width = size + 'px';
        particle.style.height = size + 'px';
        
        // Random animation duration
        const duration = Math.random() * 4 + 4;
        particle.style.animationDuration = duration + 's';
        
        container.appendChild(particle);
        
        // Remove particle after animation
        setTimeout(() => {
            if (particle.parentNode) {
                particle.parentNode.removeChild(particle);
            }
        }, duration * 1000);
    }

    animate() {
        // Continuously add new particles
        setInterval(() => {
            if (this.element.children.length < 50) {
                this.createParticle(this.element);
            }
        }, 2000);
    }
}

// ===== BLOCKCHAIN VISUALIZER COMPONENT =====
class BlockchainVisualizerComponent extends BaseComponent {
    setupEventListeners() {
        this.blocks = [];
        this.initBlockchain();
    }

    initBlockchain() {
        const container = this.element;
        const blockCount = parseInt(container.getAttribute('data-blocks')) || 3;

        for (let i = 0; i < blockCount; i++) {
            this.createBlock(container, i);
        }
    }

    createBlock(container, index) {
        const block = document.createElement('div');
        block.className = `block block-${index + 1}`;
        
        block.innerHTML = `
            <div class="block-header">
                <span class="block-hash">0x${Math.random().toString(16).substr(2, 8)}...</span>
                <span class="block-number">#${Math.floor(Math.random() * 1000000)}</span>
            </div>
            <div class="block-content">
                <div class="transaction">Tx: 0x${Math.random().toString(16).substr(2, 8)}...</div>
                <div class="transaction">Tx: 0x${Math.random().toString(16).substr(2, 8)}...</div>
                <div class="transaction">Tx: 0x${Math.random().toString(16).substr(2, 8)}...</div>
            </div>
        `;

        container.appendChild(block);
        
        // Add staggered animation
        block.style.animationDelay = `${index * 0.2}s`;
        block.classList.add('fade-in-up');
    }
}

// ===== MINING INTERFACE COMPONENT =====
class MiningInterfaceComponent extends BaseComponent {
    setupEventListeners() {
        this.isMining = false;
        this.hashRate = 0;
        this.rewards = 0;
        
        this.startButton = this.element.querySelector('.start-mining-btn');
        this.stopButton = this.element.querySelector('.stop-mining-btn');
        this.hashRateDisplay = this.element.querySelector('.hash-rate');
        this.rewardsDisplay = this.element.querySelector('.rewards');
        
        if (this.startButton) {
            this.startButton.addEventListener('click', () => {
                this.startMining();
            });
        }
        
        if (this.stopButton) {
            this.stopButton.addEventListener('click', () => {
                this.stopMining();
            });
        }
    }

    startMining() {
        this.isMining = true;
        this.element.classList.add('mining-active');
        
        // Simulate mining
        this.miningInterval = setInterval(() => {
            this.hashRate = Math.random() * 1000 + 500;
            this.rewards += Math.random() * 0.001;
            
            this.updateDisplay();
        }, 1000);
        
        componentSystem.emit('mining:start', {
            timestamp: Date.now(),
            hashRate: this.hashRate
        });
    }

    stopMining() {
        this.isMining = false;
        this.element.classList.remove('mining-active');
        
        if (this.miningInterval) {
            clearInterval(this.miningInterval);
        }
        
        componentSystem.emit('mining:stop', {
            timestamp: Date.now(),
            totalRewards: this.rewards
        });
    }

    updateDisplay() {
        if (this.hashRateDisplay) {
            this.hashRateDisplay.textContent = `${this.hashRate.toFixed(2)} H/s`;
        }
        
        if (this.rewardsDisplay) {
            this.rewardsDisplay.textContent = `${this.rewards.toFixed(6)} RSC`;
        }
    }
}

// ===== WALLET CONNECTOR COMPONENT =====
class WalletConnectorComponent extends BaseComponent {
    setupEventListeners() {
        this.connectButton = this.element.querySelector('.connect-wallet-btn');
        this.walletInfo = this.element.querySelector('.wallet-info');
        
        if (this.connectButton) {
            this.connectButton.addEventListener('click', () => {
                this.connectWallet();
            });
        }
    }

    connectWallet() {
        // Simulate wallet connection
        const walletData = {
            address: '0x' + Math.random().toString(16).substr(2, 40),
            balance: Math.random() * 1000,
            network: 'RSC Mainnet'
        };
        
        this.updateWalletInfo(walletData);
        componentSystem.emit('wallet:connect', walletData);
    }

    updateWalletInfo(walletData) {
        if (this.walletInfo) {
            this.walletInfo.innerHTML = `
                <div class="wallet-address">${walletData.address}</div>
                <div class="wallet-balance">${walletData.balance.toFixed(4)} RSC</div>
                <div class="wallet-network">${walletData.network}</div>
            `;
        }
        
        if (this.connectButton) {
            this.connectButton.textContent = 'Connected';
            this.connectButton.disabled = true;
        }
    }
}

// ===== SOCIAL FEED COMPONENT =====
class SocialFeedComponent extends BaseComponent {
    setupEventListeners() {
        this.posts = [];
        this.initFeed();
    }

    initFeed() {
        // Load initial posts
        this.loadPosts();
    }

    loadPosts() {
        // Simulate loading posts
        const samplePosts = [
            {
                id: 1,
                author: 'RSC_Miner_001',
                content: 'Just mined my first RSC block! 🎉',
                timestamp: Date.now() - 3600000,
                likes: 42,
                comments: 8
            },
            {
                id: 2,
                author: 'CryptoTrader_99',
                content: 'RSC Chain is the future of blockchain technology!',
                timestamp: Date.now() - 7200000,
                likes: 156,
                comments: 23
            }
        ];
        
        samplePosts.forEach(post => {
            this.addPost(post);
        });
    }

    addPost(postData) {
        this.posts.unshift(postData);
        this.renderPosts();
    }

    renderPosts() {
        const feedContainer = this.element.querySelector('.feed-container');
        if (!feedContainer) return;
        
        feedContainer.innerHTML = this.posts.map(post => `
            <div class="post">
                <div class="post-header">
                    <div class="post-author">${post.author}</div>
                    <div class="post-time">${this.formatTime(post.timestamp)}</div>
                </div>
                <div class="post-content">${post.content}</div>
                <div class="post-actions">
                    <button class="like-btn">❤️ ${post.likes}</button>
                    <button class="comment-btn">💬 ${post.comments}</button>
                </div>
            </div>
        `).join('');
    }

    formatTime(timestamp) {
        const now = Date.now();
        const diff = now - timestamp;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);
        
        if (days > 0) return `${days}d ago`;
        if (hours > 0) return `${hours}h ago`;
        return `${minutes}m ago`;
    }
}

// ===== AI ASSISTANT COMPONENT =====
class AIAssistantComponent extends BaseComponent {
    setupEventListeners() {
        this.chatContainer = this.element.querySelector('.chat-container');
        this.inputField = this.element.querySelector('.chat-input');
        this.sendButton = this.element.querySelector('.send-btn');
        
        if (this.sendButton) {
            this.sendButton.addEventListener('click', () => {
                this.sendMessage();
            });
        }
        
        if (this.inputField) {
            this.inputField.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.sendMessage();
                }
            });
        }
    }

    sendMessage() {
        const message = this.inputField.value.trim();
        if (!message) return;
        
        this.addMessage(message, 'user');
        this.inputField.value = '';
        
        // Simulate AI response
        setTimeout(() => {
            this.generateAIResponse(message);
        }, 1000);
    }

    addMessage(content, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;
        messageDiv.innerHTML = `
            <div class="message-content">${content}</div>
            <div class="message-time">${new Date().toLocaleTimeString()}</div>
        `;
        
        this.chatContainer.appendChild(messageDiv);
        this.chatContainer.scrollTop = this.chatContainer.scrollHeight;
    }

    generateAIResponse(userMessage) {
        const responses = [
            "I can help you with RSC Chain mining optimization. What specific aspect would you like to know about?",
            "Based on current network conditions, I recommend adjusting your mining strategy for better efficiency.",
            "Your wallet balance is looking good! Consider staking some RSC for additional rewards.",
            "The RSC Chain network is currently operating at optimal performance. All systems are green!",
            "I've analyzed your mining data and found some opportunities for improvement. Would you like me to explain?"
        ];
        
        const response = responses[Math.floor(Math.random() * responses.length)];
        this.addMessage(response, 'ai');
    }
}

// ===== NFT GALLERY COMPONENT =====
class NFTGalleryComponent extends BaseComponent {
    setupEventListeners() {
        this.nfts = [];
        this.initGallery();
    }

    initGallery() {
        // Load sample NFTs
        this.loadNFTs();
    }

    loadNFTs() {
        const sampleNFTs = [
            {
                id: 1,
                name: 'RSC Genesis Block',
                image: 'https://via.placeholder.com/300x300/22c55e/ffffff?text=RSC+Genesis',
                price: '1.5 RSC',
                owner: '0x...abc123'
            },
            {
                id: 2,
                name: 'Quantum Miner',
                image: 'https://via.placeholder.com/300x300/3b82f6/ffffff?text=Quantum+Miner',
                price: '2.3 RSC',
                owner: '0x...def456'
            },
            {
                id: 3,
                name: 'AI Consensus',
                image: 'https://via.placeholder.com/300x300/a855f7/ffffff?text=AI+Consensus',
                price: '3.7 RSC',
                owner: '0x...ghi789'
            }
        ];
        
        sampleNFTs.forEach(nft => {
            this.addNFT(nft);
        });
    }

    addNFT(nftData) {
        this.nfts.push(nftData);
        this.renderNFTs();
    }

    renderNFTs() {
        const galleryContainer = this.element.querySelector('.gallery-container');
        if (!galleryContainer) return;
        
        galleryContainer.innerHTML = this.nfts.map(nft => `
            <div class="nft-card">
                <div class="nft-image">
                    <img src="${nft.image}" alt="${nft.name}">
                </div>
                <div class="nft-info">
                    <h3 class="nft-name">${nft.name}</h3>
                    <div class="nft-price">${nft.price}</div>
                    <div class="nft-owner">Owner: ${nft.owner}</div>
                    <button class="buy-btn">Buy Now</button>
                </div>
            </div>
        `).join('');
    }
}

// ===== DEFI DASHBOARD COMPONENT =====
class DeFiDashboardComponent extends BaseComponent {
    setupEventListeners() {
        this.portfolio = {
            totalValue: 0,
            assets: [],
            staking: {
                staked: 0,
                rewards: 0,
                apy: 0
            },
            liquidity: {
                pools: [],
                totalLiquidity: 0
            }
        };
        
        this.initDashboard();
    }

    initDashboard() {
        this.loadPortfolioData();
        this.updateDisplay();
    }

    loadPortfolioData() {
        // Simulate portfolio data
        this.portfolio = {
            totalValue: 15420.50,
            assets: [
                { symbol: 'RSC', balance: 1000, value: 10000 },
                { symbol: 'ETH', balance: 2.5, value: 5000 },
                { symbol: 'BTC', balance: 0.1, value: 420.50 }
            ],
            staking: {
                staked: 500,
                rewards: 25.75,
                apy: 12.5
            },
            liquidity: {
                pools: [
                    { name: 'RSC/ETH', liquidity: 5000, apy: 18.5 },
                    { name: 'RSC/BTC', liquidity: 3000, apy: 15.2 }
                ],
                totalLiquidity: 8000
            }
        };
    }

    updateDisplay() {
        const totalValueEl = this.element.querySelector('.total-value');
        const stakedEl = this.element.querySelector('.staked-amount');
        const rewardsEl = this.element.querySelector('.rewards-amount');
        const liquidityEl = this.element.querySelector('.liquidity-amount');
        
        if (totalValueEl) {
            totalValueEl.textContent = `$${this.portfolio.totalValue.toLocaleString()}`;
        }
        
        if (stakedEl) {
            stakedEl.textContent = `${this.portfolio.staking.staked} RSC`;
        }
        
        if (rewardsEl) {
            rewardsEl.textContent = `${this.portfolio.staking.rewards} RSC`;
        }
        
        if (liquidityEl) {
            liquidityEl.textContent = `$${this.portfolio.liquidity.totalLiquidity.toLocaleString()}`;
        }
    }
}

// ===== INITIALIZE COMPONENT SYSTEM =====
const componentSystem = new ComponentSystem();

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    componentSystem.init();
});

// Export for global access
window.componentSystem = componentSystem;
