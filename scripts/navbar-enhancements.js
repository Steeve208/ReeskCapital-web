/**
 * RSC CHAIN - NAVBAR ENHANCEMENTS
 * Advanced navbar functionality with premium UX
 */

class NavbarEnhancements {
    constructor() {
        this.header = document.querySelector('.header');
        this.navbar = document.querySelector('.navbar');
        this.navLinks = document.querySelectorAll('.nav-link');
        this.mobileMenuBtn = document.querySelector('.mobile-menu-btn');
        this.walletBtn = document.querySelector('.wallet-btn');
        this.lastScrollY = window.scrollY;
        this.isScrolling = false;
        this.mobileMenuOpen = false;
        
        this.init();
    }

    init() {
        this.setupScrollBehavior();
        this.setupActiveNavigation();
        this.setupMobileMenu();
        this.setupWalletSimulator();
        this.setupSearchOverlay();
        this.setupNotifications();
        this.setupKeyboardNavigation();
        this.setupSmoothScrolling();
        this.setupAIAssistant();
        this.setupThemeSwitcher();
        this.setupAnalyticsPanel();
        this.setupVoiceControl();
        this.setupParticleSystem();
        this.setupAdvancedGestures();
        
        console.log('🚀 Navbar enhancements initialized with DRAMATIC improvements');
    }

    // Advanced scroll behavior with auto-hide
    setupScrollBehavior() {
        let ticking = false;
        
        const updateScroll = () => {
            const currentScrollY = window.scrollY;
            const scrollDirection = currentScrollY > this.lastScrollY ? 'down' : 'up';
            
            // Add scrolled class for styling
            if (currentScrollY > 50) {
                this.header.classList.add('scrolled');
            } else {
                this.header.classList.remove('scrolled');
            }
            
            // Auto-hide navbar on scroll down (mobile only)
            if (window.innerWidth <= 768) {
                if (scrollDirection === 'down' && currentScrollY > 100) {
                    this.header.classList.add('hidden');
                } else if (scrollDirection === 'up' || currentScrollY <= 100) {
                    this.header.classList.remove('hidden');
                }
            }
            
            this.lastScrollY = currentScrollY;
            ticking = false;
        };
        
        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(updateScroll);
                ticking = true;
            }
        });
    }

    // Smart active navigation based on scroll position
    setupActiveNavigation() {
        const sections = document.querySelectorAll('section[id]');
        
        const updateActiveNav = () => {
            const scrollPos = window.scrollY + 100;
            
            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                const sectionHeight = section.offsetHeight;
                const sectionId = section.getAttribute('id');
                const navLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);
                
                if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
                    // Remove active class from all nav links
                    this.navLinks.forEach(link => link.classList.remove('active'));
                    // Add active class to current section's nav link
                    if (navLink) {
                        navLink.classList.add('active');
                    }
                }
            });
        };
        
        window.addEventListener('scroll', updateActiveNav);
        updateActiveNav(); // Initial call
    }

    // Enhanced mobile menu with animations
    setupMobileMenu() {
        if (!this.mobileMenuBtn) return;
        
        this.mobileMenuBtn.addEventListener('click', () => {
            this.toggleMobileMenu();
        });
        
        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            if (this.mobileMenuOpen && !this.mobileMenuBtn.contains(e.target)) {
                this.closeMobileMenu();
            }
        });
    }

    toggleMobileMenu() {
        this.mobileMenuOpen = !this.mobileMenuOpen;
        
        if (this.mobileMenuOpen) {
            this.openMobileMenu();
        } else {
            this.closeMobileMenu();
        }
    }

    openMobileMenu() {
        this.mobileMenuBtn.classList.add('active');
        this.createMobileMenuOverlay();
        document.body.style.overflow = 'hidden';
    }

    closeMobileMenu() {
        this.mobileMenuBtn.classList.remove('active');
        this.removeMobileMenuOverlay();
        document.body.style.overflow = '';
        this.mobileMenuOpen = false;
    }

    createMobileMenuOverlay() {
        const overlay = document.createElement('div');
        overlay.className = 'mobile-menu-overlay';
        overlay.innerHTML = `
            <div class="mobile-menu-content">
                <div class="mobile-menu-header">
                    <h3>RSC Chain</h3>
                    <button class="mobile-menu-close">&times;</button>
                </div>
                <nav class="mobile-menu-nav">
                    ${Array.from(this.navLinks).map(link => `
                        <a href="${link.getAttribute('href')}" class="mobile-nav-link">
                            <span class="mobile-nav-icon">${link.querySelector('.nav-icon').textContent}</span>
                            <span class="mobile-nav-text">${link.querySelector('.nav-text').textContent}</span>
                        </a>
                    `).join('')}
                </nav>
                <div class="mobile-menu-actions">
                    <button class="mobile-wallet-btn">
                        <span>🔗</span>
                        <span>Connect Wallet</span>
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(overlay);
        
        // Add event listeners
        overlay.querySelector('.mobile-menu-close').addEventListener('click', () => {
            this.closeMobileMenu();
        });
        
        overlay.querySelectorAll('.mobile-nav-link').forEach(link => {
            link.addEventListener('click', () => {
                this.closeMobileMenu();
            });
        });
        
        overlay.querySelector('.mobile-wallet-btn').addEventListener('click', () => {
            this.simulateWalletConnection();
            this.closeMobileMenu();
        });
        
        // Animate in
        setTimeout(() => {
            overlay.classList.add('active');
        }, 10);
    }

    removeMobileMenuOverlay() {
        const overlay = document.querySelector('.mobile-menu-overlay');
        if (overlay) {
            overlay.classList.remove('active');
            setTimeout(() => {
                overlay.remove();
            }, 300);
        }
    }

    // Wallet simulator with realistic animations
    setupWalletSimulator() {
        if (!this.walletBtn) return;
        
        this.walletBtn.addEventListener('click', () => {
            this.simulateWalletConnection();
        });
    }

    simulateWalletConnection() {
        const originalText = this.walletBtn.innerHTML;
        
        // Show connecting state
        this.walletBtn.innerHTML = `
            <span class="wallet-icon">⏳</span>
            <div class="wallet-text">
                <span>Connecting...</span>
                <span>Please wait</span>
            </div>
        `;
        this.walletBtn.disabled = true;
        
        // Simulate connection delay
        setTimeout(() => {
            // Show connected state
            this.walletBtn.innerHTML = `
                <span class="wallet-icon">✅</span>
                <div class="wallet-text">
                    <span>0x742d...35Cc</span>
                    <span>1,250.5 RSC</span>
                </div>
            `;
            this.walletBtn.disabled = false;
            
            // Show success notification
            this.showNotification('Wallet connected successfully!', 'success');
            
            // Add connected class for styling
            this.walletBtn.classList.add('connected');
            
        }, 2000);
    }

    // Search overlay functionality
    setupSearchOverlay() {
        // Create search button if it doesn't exist
        const searchBtn = document.querySelector('.search-btn');
        if (!searchBtn) {
            const searchButton = document.createElement('button');
            searchButton.className = 'utility-btn search-btn';
            searchButton.innerHTML = '🔍';
            searchButton.title = 'Search';
            
            const navUtility = document.querySelector('.nav-utility');
            if (navUtility) {
                navUtility.insertBefore(searchButton, navUtility.firstChild);
                
                searchButton.addEventListener('click', () => {
                    this.openSearchOverlay();
                });
            }
        }
    }

    openSearchOverlay() {
        const overlay = document.createElement('div');
        overlay.className = 'search-overlay';
        overlay.innerHTML = `
            <div class="search-content">
                <div class="search-header">
                    <input type="text" placeholder="Search RSC Chain..." class="search-input" autofocus>
                    <button class="search-close">&times;</button>
                </div>
                <div class="search-results">
                    <div class="search-suggestions">
                        <h4>Quick Links</h4>
                        <div class="suggestion-item" data-href="#home">🏠 Home</div>
                        <div class="suggestion-item" data-href="#mining">⛏️ Mining</div>
                        <div class="suggestion-item" data-href="#wallet">💰 Wallet</div>
                        <div class="suggestion-item" data-href="#community">👥 Community</div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(overlay);
        
        const searchInput = overlay.querySelector('.search-input');
        const searchClose = overlay.querySelector('.search-close');
        
        searchClose.addEventListener('click', () => {
            this.closeSearchOverlay(overlay);
        });
        
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                this.closeSearchOverlay(overlay);
            }
        });
        
        // Handle suggestion clicks
        overlay.querySelectorAll('.suggestion-item').forEach(item => {
            item.addEventListener('click', () => {
                const href = item.getAttribute('data-href');
                this.smoothScrollTo(href);
                this.closeSearchOverlay(overlay);
            });
        });
        
        // Animate in
        setTimeout(() => {
            overlay.classList.add('active');
            searchInput.focus();
        }, 10);
    }

    closeSearchOverlay(overlay) {
        overlay.classList.remove('active');
        setTimeout(() => {
            overlay.remove();
        }, 300);
    }

    // Notification system
    setupNotifications() {
        // Create notification container
        if (!document.querySelector('.notification-container')) {
            const container = document.createElement('div');
            container.className = 'notification-container';
            document.body.appendChild(container);
        }
    }

    showNotification(message, type = 'info', duration = 3000) {
        const container = document.querySelector('.notification-container');
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">${this.getNotificationIcon(type)}</span>
                <span class="notification-message">${message}</span>
                <button class="notification-close">&times;</button>
            </div>
        `;
        
        container.appendChild(notification);
        
        // Auto remove
        setTimeout(() => {
            this.removeNotification(notification);
        }, duration);
        
        // Manual close
        notification.querySelector('.notification-close').addEventListener('click', () => {
            this.removeNotification(notification);
        });
        
        // Animate in
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
    }

    removeNotification(notification) {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }

    getNotificationIcon(type) {
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        return icons[type] || icons.info;
    }

    // Keyboard navigation
    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            // Open search with Ctrl/Cmd + K
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                this.openSearchOverlay();
            }
            
            // Close mobile menu with Escape
            if (e.key === 'Escape' && this.mobileMenuOpen) {
                this.closeMobileMenu();
            }
        });
    }

    // Smooth scrolling for navigation links
    setupSmoothScrolling() {
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                if (href && href.startsWith('#')) {
                    e.preventDefault();
                    this.smoothScrollTo(href);
                }
            });
        });
    }

    smoothScrollTo(target) {
        const element = document.querySelector(target);
        if (element) {
            const headerHeight = this.header.offsetHeight;
            const targetPosition = element.offsetTop - headerHeight - 20;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    }

    // ===== DRAMATIC IMPROVEMENTS =====

    // AI Assistant integrated in navbar
    setupAIAssistant() {
        const aiButton = document.createElement('button');
        aiButton.className = 'utility-btn ai-assistant-btn';
        aiButton.innerHTML = '🤖';
        aiButton.title = 'AI Assistant - Ask me anything about RSC';
        
        const navUtility = document.querySelector('.nav-utility');
        if (navUtility) {
            navUtility.appendChild(aiButton);
            
            aiButton.addEventListener('click', () => {
                this.openAIAssistant();
            });
        }
    }

    openAIAssistant() {
        const overlay = document.createElement('div');
        overlay.className = 'ai-assistant-overlay';
        overlay.innerHTML = `
            <div class="ai-assistant-container">
                <div class="ai-header">
                    <div class="ai-avatar">
                        <div class="ai-avatar-glow"></div>
                        🤖
                    </div>
                    <div class="ai-info">
                        <h3>RSC AI Assistant</h3>
                        <p>Ask me anything about RSC Chain</p>
                    </div>
                    <button class="ai-close">&times;</button>
                </div>
                <div class="ai-chat-area">
                    <div class="ai-messages" id="ai-messages">
                        <div class="ai-message ai-message-bot">
                            <div class="message-avatar">🤖</div>
                            <div class="message-content">
                                <div class="message-text">Hello! I'm your RSC AI Assistant. I can help you with:</div>
                                <div class="ai-quick-actions">
                                    <button class="quick-action" data-action="mining">⛏️ Mining Guide</button>
                                    <button class="quick-action" data-action="wallet">💰 Wallet Setup</button>
                                    <button class="quick-action" data-action="defi">🏦 DeFi Strategies</button>
                                    <button class="quick-action" data-action="nft">🎨 NFT Marketplace</button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="ai-input-area">
                        <div class="ai-input-container">
                            <input type="text" id="ai-input" placeholder="Ask me anything about RSC..." autocomplete="off">
                            <button class="ai-send-btn">➤</button>
                            <button class="ai-voice-btn" title="Voice Input">🎤</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(overlay);
        
        // Event listeners
        overlay.querySelector('.ai-close').addEventListener('click', () => {
            this.closeAIAssistant(overlay);
        });
        
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                this.closeAIAssistant(overlay);
            }
        });
        
        const aiInput = overlay.querySelector('#ai-input');
        const sendBtn = overlay.querySelector('.ai-send-btn');
        const voiceBtn = overlay.querySelector('.ai-voice-btn');
        
        sendBtn.addEventListener('click', () => {
            this.sendAIMessage(aiInput.value, overlay);
        });
        
        aiInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendAIMessage(aiInput.value, overlay);
            }
        });
        
        voiceBtn.addEventListener('click', () => {
            this.toggleVoiceInput(voiceBtn);
        });
        
        // Quick actions
        overlay.querySelectorAll('.quick-action').forEach(btn => {
            btn.addEventListener('click', () => {
                const action = btn.getAttribute('data-action');
                this.handleQuickAction(action, overlay);
            });
        });
        
        // Animate in
        setTimeout(() => {
            overlay.classList.add('active');
            aiInput.focus();
        }, 10);
    }

    closeAIAssistant(overlay) {
        overlay.classList.remove('active');
        setTimeout(() => {
            overlay.remove();
        }, 300);
    }

    sendAIMessage(message, overlay) {
        if (!message.trim()) return;
        
        const messagesContainer = overlay.querySelector('#ai-messages');
        const aiInput = overlay.querySelector('#ai-input');
        
        // Add user message
        this.addAIMessage(messagesContainer, message, 'user');
        aiInput.value = '';
        
        // Simulate AI response
        setTimeout(() => {
            const response = this.generateAIResponse(message);
            this.addAIMessage(messagesContainer, response, 'bot');
        }, 1000);
    }

    addAIMessage(container, message, type) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `ai-message ai-message-${type}`;
        
        if (type === 'user') {
            messageDiv.innerHTML = `
                <div class="message-content">
                    <div class="message-text">${message}</div>
                </div>
                <div class="message-avatar">👤</div>
            `;
        } else {
            messageDiv.innerHTML = `
                <div class="message-avatar">🤖</div>
                <div class="message-content">
                    <div class="message-text">${message}</div>
                </div>
            `;
        }
        
        container.appendChild(messageDiv);
        container.scrollTop = container.scrollHeight;
    }

    generateAIResponse(message) {
        const responses = {
            mining: "RSC Chain uses Proof of Stake consensus. You can stake your RSC tokens to earn rewards and help secure the network. The current APY is 12.5%.",
            wallet: "To connect your wallet, click the wallet button in the navbar. We support MetaMask, WalletConnect, and other Web3 wallets.",
            defi: "RSC Chain offers yield farming, liquidity pools, and staking opportunities. You can earn up to 25% APY in our DeFi protocols.",
            nft: "Our NFT marketplace allows you to create, buy, and sell NFTs. All transactions are secured on the RSC blockchain.",
            price: "RSC is currently trading at $0.045 with a market cap of $2.1B. The token has seen 340% growth this year.",
            default: "I'm here to help with RSC Chain! You can ask me about mining, wallets, DeFi, NFTs, or any other blockchain topics."
        };
        
        const lowerMessage = message.toLowerCase();
        for (const [key, response] of Object.entries(responses)) {
            if (lowerMessage.includes(key)) {
                return response;
            }
        }
        return responses.default;
    }

    handleQuickAction(action, overlay) {
        const responses = {
            mining: "⛏️ **Mining Guide**: RSC Chain uses Proof of Stake. Stake your tokens to earn 12.5% APY. Minimum stake: 100 RSC tokens.",
            wallet: "💰 **Wallet Setup**: Connect MetaMask or any Web3 wallet. Your funds are secure and you maintain full control.",
            defi: "🏦 **DeFi Strategies**: Earn up to 25% APY through yield farming, liquidity pools, and staking protocols.",
            nft: "🎨 **NFT Marketplace**: Create, buy, and sell NFTs. All transactions are recorded on the RSC blockchain."
        };
        
        const messagesContainer = overlay.querySelector('#ai-messages');
        this.addAIMessage(messagesContainer, responses[action], 'bot');
    }

    toggleVoiceInput(btn) {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            this.showNotification('Voice input not supported in this browser', 'warning');
            return;
        }
        
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';
        
        btn.classList.toggle('listening');
        
        if (btn.classList.contains('listening')) {
            recognition.start();
            btn.innerHTML = '🔴';
            this.showNotification('Listening... Speak now', 'info');
            
            recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                const aiInput = document.querySelector('#ai-input');
                if (aiInput) {
                    aiInput.value = transcript;
                    aiInput.focus();
                }
            };
            
            recognition.onend = () => {
                btn.classList.remove('listening');
                btn.innerHTML = '🎤';
            };
        } else {
            recognition.stop();
        }
    }

    // Advanced Theme Switcher
    setupThemeSwitcher() {
        const themeBtn = document.createElement('button');
        themeBtn.className = 'utility-btn theme-switcher-btn';
        themeBtn.innerHTML = '🌙';
        themeBtn.title = 'Switch Theme';
        
        const navUtility = document.querySelector('.nav-utility');
        if (navUtility) {
            navUtility.appendChild(themeBtn);
            
            themeBtn.addEventListener('click', () => {
                this.openThemeSwitcher();
            });
        }
    }

    openThemeSwitcher() {
        const overlay = document.createElement('div');
        overlay.className = 'theme-switcher-overlay';
        overlay.innerHTML = `
            <div class="theme-switcher-container">
                <div class="theme-header">
                    <h3>Choose Your Theme</h3>
                    <button class="theme-close">&times;</button>
                </div>
                <div class="theme-grid">
                    <div class="theme-option" data-theme="dark">
                        <div class="theme-preview dark-preview"></div>
                        <span>Dark Mode</span>
                    </div>
                    <div class="theme-option" data-theme="light">
                        <div class="theme-preview light-preview"></div>
                        <span>Light Mode</span>
                    </div>
                    <div class="theme-option" data-theme="neon">
                        <div class="theme-preview neon-preview"></div>
                        <span>Neon Cyber</span>
                    </div>
                    <div class="theme-option" data-theme="ocean">
                        <div class="theme-preview ocean-preview"></div>
                        <span>Ocean Blue</span>
                    </div>
                    <div class="theme-option" data-theme="sunset">
                        <div class="theme-preview sunset-preview"></div>
                        <span>Sunset Orange</span>
                    </div>
                    <div class="theme-option" data-theme="forest">
                        <div class="theme-preview forest-preview"></div>
                        <span>Forest Green</span>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(overlay);
        
        overlay.querySelector('.theme-close').addEventListener('click', () => {
            this.closeThemeSwitcher(overlay);
        });
        
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                this.closeThemeSwitcher(overlay);
            }
        });
        
        overlay.querySelectorAll('.theme-option').forEach(option => {
            option.addEventListener('click', () => {
                const theme = option.getAttribute('data-theme');
                this.applyTheme(theme);
                this.closeThemeSwitcher(overlay);
            });
        });
        
        setTimeout(() => {
            overlay.classList.add('active');
        }, 10);
    }

    closeThemeSwitcher(overlay) {
        overlay.classList.remove('active');
        setTimeout(() => {
            overlay.remove();
        }, 300);
    }

    applyTheme(theme) {
        document.body.className = `theme-${theme}`;
        localStorage.setItem('rsc-theme', theme);
        this.showNotification(`Theme changed to ${theme}`, 'success');
    }

    // Real-time Analytics Panel
    setupAnalyticsPanel() {
        const analyticsBtn = document.createElement('button');
        analyticsBtn.className = 'utility-btn analytics-btn';
        analyticsBtn.innerHTML = '📊';
        analyticsBtn.title = 'Live Analytics';
        
        const navUtility = document.querySelector('.nav-utility');
        if (navUtility) {
            navUtility.appendChild(analyticsBtn);
            
            analyticsBtn.addEventListener('click', () => {
                this.openAnalyticsPanel();
            });
        }
    }

    openAnalyticsPanel() {
        const overlay = document.createElement('div');
        overlay.className = 'analytics-overlay';
        overlay.innerHTML = `
            <div class="analytics-container">
                <div class="analytics-header">
                    <h3>📊 Live Analytics</h3>
                    <button class="analytics-close">&times;</button>
                </div>
                <div class="analytics-grid">
                    <div class="analytics-card">
                        <div class="analytics-icon">💰</div>
                        <div class="analytics-info">
                            <h4>RSC Price</h4>
                            <div class="analytics-value" id="rsc-price">$0.045</div>
                            <div class="analytics-change positive">+12.5%</div>
                        </div>
                    </div>
                    <div class="analytics-card">
                        <div class="analytics-icon">⛏️</div>
                        <div class="analytics-info">
                            <h4>Active Miners</h4>
                            <div class="analytics-value" id="active-miners">2,847</div>
                            <div class="analytics-change positive">+156</div>
                        </div>
                    </div>
                    <div class="analytics-card">
                        <div class="analytics-icon">🔗</div>
                        <div class="analytics-info">
                            <h4>Network Hash</h4>
                            <div class="analytics-value" id="network-hash">847.2 TH/s</div>
                            <div class="analytics-change positive">+5.2%</div>
                        </div>
                    </div>
                    <div class="analytics-card">
                        <div class="analytics-icon">🏦</div>
                        <div class="analytics-info">
                            <h4>TVL</h4>
                            <div class="analytics-value" id="tvl">$12.4M</div>
                            <div class="analytics-change positive">+8.7%</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(overlay);
        
        overlay.querySelector('.analytics-close').addEventListener('click', () => {
            this.closeAnalyticsPanel(overlay);
        });
        
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                this.closeAnalyticsPanel(overlay);
            }
        });
        
        // Start live updates
        this.startAnalyticsUpdates(overlay);
        
        setTimeout(() => {
            overlay.classList.add('active');
        }, 10);
    }

    closeAnalyticsPanel(overlay) {
        overlay.classList.remove('active');
        setTimeout(() => {
            overlay.remove();
        }, 300);
    }

    startAnalyticsUpdates(overlay) {
        const updateInterval = setInterval(() => {
            if (!document.querySelector('.analytics-overlay')) {
                clearInterval(updateInterval);
                return;
            }
            
            // Simulate live data updates
            const priceElement = overlay.querySelector('#rsc-price');
            const minersElement = overlay.querySelector('#active-miners');
            const hashElement = overlay.querySelector('#network-hash');
            const tvlElement = overlay.querySelector('#tvl');
            
            if (priceElement) {
                const currentPrice = parseFloat(priceElement.textContent.replace('$', ''));
                const newPrice = (currentPrice + (Math.random() - 0.5) * 0.001).toFixed(3);
                priceElement.textContent = `$${newPrice}`;
            }
            
            if (minersElement) {
                const currentMiners = parseInt(minersElement.textContent.replace(',', ''));
                const newMiners = currentMiners + Math.floor((Math.random() - 0.5) * 10);
                minersElement.textContent = newMiners.toLocaleString();
            }
        }, 2000);
    }

    // Voice Control System
    setupVoiceControl() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const voiceBtn = document.createElement('button');
            voiceBtn.className = 'utility-btn voice-control-btn';
            voiceBtn.innerHTML = '🎤';
            voiceBtn.title = 'Voice Control';
            
            const navUtility = document.querySelector('.nav-utility');
            if (navUtility) {
                navUtility.appendChild(voiceBtn);
                
                voiceBtn.addEventListener('click', () => {
                    this.startVoiceControl();
                });
            }
        }
    }

    startVoiceControl() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';
        
        this.showNotification('Voice control activated. Say "search", "wallet", "mining", or "analytics"', 'info');
        
        recognition.onresult = (event) => {
            const command = event.results[0][0].transcript.toLowerCase();
            this.executeVoiceCommand(command);
        };
        
        recognition.start();
    }

    executeVoiceCommand(command) {
        if (command.includes('search')) {
            this.openSearchOverlay();
        } else if (command.includes('wallet')) {
            this.simulateWalletConnection();
        } else if (command.includes('mining')) {
            this.smoothScrollTo('#mining');
        } else if (command.includes('analytics')) {
            this.openAnalyticsPanel();
        } else if (command.includes('ai') || command.includes('assistant')) {
            this.openAIAssistant();
        } else {
            this.showNotification(`Command "${command}" not recognized`, 'warning');
        }
    }

    // Interactive Particle System
    setupParticleSystem() {
        const canvas = document.createElement('canvas');
        canvas.className = 'navbar-particles';
        canvas.style.position = 'absolute';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.pointerEvents = 'none';
        canvas.style.zIndex = '-1';
        
        this.header.appendChild(canvas);
        
        const ctx = canvas.getContext('2d');
        let particles = [];
        
        const resizeCanvas = () => {
            canvas.width = this.header.offsetWidth;
            canvas.height = this.header.offsetHeight;
        };
        
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        
        class Particle {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.vx = (Math.random() - 0.5) * 0.5;
                this.vy = (Math.random() - 0.5) * 0.5;
                this.size = Math.random() * 2 + 1;
                this.opacity = Math.random() * 0.5 + 0.2;
            }
            
            update() {
                this.x += this.vx;
                this.y += this.vy;
                
                if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
                if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
            }
            
            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(34, 197, 94, ${this.opacity})`;
                ctx.fill();
            }
        }
        
        for (let i = 0; i < 20; i++) {
            particles.push(new Particle());
        }
        
        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            particles.forEach(particle => {
                particle.update();
                particle.draw();
            });
            
            requestAnimationFrame(animate);
        };
        
        animate();
    }

    // Advanced Touch Gestures
    setupAdvancedGestures() {
        let startX, startY, startTime;
        
        this.header.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
            startTime = Date.now();
        });
        
        this.header.addEventListener('touchend', (e) => {
            const endX = e.changedTouches[0].clientX;
            const endY = e.changedTouches[0].clientY;
            const endTime = Date.now();
            
            const deltaX = endX - startX;
            const deltaY = endY - startY;
            const deltaTime = endTime - startTime;
            
            // Swipe gestures
            if (deltaTime < 300) {
                if (Math.abs(deltaX) > Math.abs(deltaY)) {
                    if (deltaX > 50) {
                        // Swipe right - open search
                        this.openSearchOverlay();
                    } else if (deltaX < -50) {
                        // Swipe left - open AI
                        this.openAIAssistant();
                    }
                } else {
                    if (deltaY < -50) {
                        // Swipe up - open analytics
                        this.openAnalyticsPanel();
                    } else if (deltaY > 50) {
                        // Swipe down - open theme switcher
                        this.openThemeSwitcher();
                    }
                }
            }
        });
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new NavbarEnhancements();
});
