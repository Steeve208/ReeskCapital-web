// ===== RSC CHAIN - MAIN JAVASCRIPT =====

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    initNavigation();
    initAnimations();
    initPerformanceMetrics();
    initMobileMenu();
    initSmoothScrolling();
    initNewsletterForm();
    initUtilityButtons();
    initParticleSystem();
    initAdvancedEffects();
    init3DTransforms();
});

// ===== NAVIGATION =====
function initNavigation() {
    const header = document.querySelector('.header');
    const navbar = document.querySelector('.navbar');
    
    // Sticky navigation effect
    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
    
    // Active navigation link highlighting
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section[id]');
    
    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (window.scrollY >= (sectionTop - 200)) {
                current = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });
}

// ===== UTILITY BUTTONS =====
function initUtilityButtons() {
    // Search button
    const searchBtn = document.getElementById('searchBtn');
    if (searchBtn) {
        searchBtn.addEventListener('click', () => {
            showNotification('Search function coming soon', 'info');
        });
    }
    
    // Wallet button
    const walletBtn = document.getElementById('walletBtn');
    if (walletBtn) {
        walletBtn.addEventListener('click', () => {
            showNotification('Conectando wallet...', 'info');
            // Simulate wallet connection
            setTimeout(() => {
                showNotification('Wallet conectado exitosamente', 'success');
                walletBtn.innerHTML = `
                    <i class="fas fa-wallet"></i>
                    <div class="wallet-text">
                        <span>Wallet Conectado</span>
                        <span>RSC Mainnet</span>
                    </div>
                `;
                walletBtn.style.background = '#0a2e0a';
                walletBtn.style.color = '#00ff88';
            }, 2000);
        });
    }
    
    // Code button
    const codeBtn = document.getElementById('codeBtn');
    if (codeBtn) {
        codeBtn.addEventListener('click', () => {
            showNotification('Modo desarrollador activado', 'info');
        });
    }
    
    // Palette button
    const paletteBtn = document.getElementById('paletteBtn');
    if (paletteBtn) {
        paletteBtn.addEventListener('click', () => {
            toggleTheme();
        });
    }
    
    // Settings button
    const settingsBtn = document.getElementById('settingsBtn');
    if (settingsBtn) {
        settingsBtn.addEventListener('click', () => {
            showNotification('Settings panel coming soon', 'info');
        });
    }
}

// ===== THEME TOGGLE =====
function toggleTheme() {
    const body = document.body;
    const currentTheme = body.getAttribute('data-theme') || 'dark';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    body.setAttribute('data-theme', newTheme);
    
    if (newTheme === 'light') {
        document.documentElement.style.setProperty('--bg-primary', '#ffffff');
        document.documentElement.style.setProperty('--bg-secondary', '#f5f5f5');
        document.documentElement.style.setProperty('--bg-card', '#ffffff');
        document.documentElement.style.setProperty('--text-primary', '#000000');
        document.documentElement.style.setProperty('--text-secondary', '#4a4a4a');
        document.documentElement.style.setProperty('--border', '#e5e5e5');
        showNotification('Tema claro activado', 'success');
    } else {
        document.documentElement.style.setProperty('--bg-primary', '#000000');
        document.documentElement.style.setProperty('--bg-secondary', '#0a0a0a');
        document.documentElement.style.setProperty('--bg-card', '#111111');
        document.documentElement.style.setProperty('--text-primary', '#ffffff');
        document.documentElement.style.setProperty('--text-secondary', '#a3a3a3');
        document.documentElement.style.setProperty('--border', '#262626');
        showNotification('Tema oscuro activado', 'success');
    }
}

// ===== ANIMATIONS =====
function initAnimations() {
    // Intersection Observer for fade-in animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in-up');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Observe all cards and sections
    const animatedElements = document.querySelectorAll('.tech-card, .ecosystem-card, .performance-card, .stat-card, .channel-card');
    animatedElements.forEach(el => {
        observer.observe(el);
    });
    
    // Hero title animation
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle) {
        heroTitle.classList.add('fade-in');
    }
}

// ===== PERFORMANCE METRICS =====
function initPerformanceMetrics() {
    // Simulate live data updates
    const metrics = {
        tps: { current: 84567, min: 80000, max: 100000 },
        blockHeight: { current: 2847392, increment: 1 },
        price: { current: 15.47, volatility: 0.1 },
        marketCap: { current: 4.2, volatility: 0.05 },
        nodes: { current: 1247, min: 1200, max: 1300 },
        staked: { current: 67.8, min: 65, max: 70 }
    };
    
    // Update TPS with realistic fluctuations
    setInterval(() => {
        const tpsElements = document.querySelectorAll('.stat-value[data-target="10000"]');
        tpsElements.forEach(element => {
            const change = (Math.random() - 0.5) * 2000;
            metrics.tps.current = Math.max(metrics.tps.min, Math.min(metrics.tps.max, metrics.tps.current + change));
            element.textContent = Math.round(metrics.tps.current).toLocaleString();
        });
    }, 3000);
    
    // Update block height
    setInterval(() => {
        const blockElement = document.getElementById('liveBlockHeight');
        if (blockElement) {
            metrics.blockHeight.current += metrics.blockHeight.increment;
            blockElement.textContent = metrics.blockHeight.current.toLocaleString();
        }
    }, 2000);
    
    // Update price with realistic volatility
    setInterval(() => {
        const priceElement = document.getElementById('livePrice');
        if (priceElement) {
            const change = (Math.random() - 0.5) * metrics.price.volatility;
            metrics.price.current = Math.max(0.01, metrics.price.current + change);
            priceElement.textContent = `$${metrics.price.current.toFixed(2)}`;
            
            // Update price change indicator
            const priceChangeElement = priceElement.parentElement.querySelector('.card-change');
            if (priceChangeElement) {
                const changePercent = (change / (metrics.price.current - change)) * 100;
                priceChangeElement.textContent = `${changePercent > 0 ? '+' : ''}${changePercent.toFixed(2)}%`;
                priceChangeElement.className = `card-change ${changePercent > 0 ? 'positive' : 'negative'}`;
            }
        }
    }, 5000);
    
    // Update market cap
    setInterval(() => {
        const marketCapElement = document.getElementById('liveMarketCap');
        if (marketCapElement) {
            const change = (Math.random() - 0.5) * metrics.marketCap.volatility;
            metrics.marketCap.current = Math.max(0.1, metrics.marketCap.current + change);
            marketCapElement.textContent = `$${metrics.marketCap.current.toFixed(1)}B`;
        }
    }, 8000);
    
    // Update nodes count
    setInterval(() => {
        const nodesElements = document.querySelectorAll('.stat-value[data-target="50000"]');
        nodesElements.forEach(element => {
            const change = Math.random() > 0.5 ? 1 : -1;
            metrics.nodes.current = Math.max(metrics.nodes.min, Math.min(metrics.nodes.max, metrics.nodes.current + change));
            element.textContent = metrics.nodes.current.toLocaleString();
        });
    }, 10000);
    
    // Update staked percentage
    setInterval(() => {
        const stakedElement = document.getElementById('liveStaked');
        if (stakedElement) {
            const change = (Math.random() - 0.5) * 0.5;
            metrics.staked.current = Math.max(metrics.staked.min, Math.min(metrics.staked.max, metrics.staked.current + change));
            stakedElement.textContent = `${metrics.staked.current.toFixed(1)}%`;
            
            // Update progress bar
            const progressFill = stakedElement.parentElement.querySelector('.progress-fill');
            if (progressFill) {
                progressFill.style.width = `${metrics.staked.current}%`;
            }
        }
    }, 12000);
}

// ===== MOBILE MENU =====
function initMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const navMenu = document.querySelector('.nav-menu');
    const navUtility = document.querySelector('.nav-utility');
    
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {
            const isOpen = navMenu.classList.contains('mobile-open');
            
            if (isOpen) {
                navMenu.classList.remove('mobile-open');
                navUtility.classList.remove('mobile-open');
                mobileMenuBtn.classList.remove('active');
            } else {
                navMenu.classList.add('mobile-open');
                navUtility.classList.add('mobile-open');
                mobileMenuBtn.classList.add('active');
            }
        });
    }
    
    // Close mobile menu when clicking on a link
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('mobile-open');
            navUtility.classList.remove('mobile-open');
            mobileMenuBtn.classList.remove('active');
        });
    });
}

// ===== SMOOTH SCROLLING =====
function initSmoothScrolling() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = targetSection.offsetTop - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// ===== NEWSLETTER FORM =====
function initNewsletterForm() {
    const newsletterForm = document.querySelector('.newsletter-form');
    
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const emailInput = newsletterForm.querySelector('input[type="email"]');
            const email = emailInput.value.trim();
            
            if (email && isValidEmail(email)) {
                // Simulate form submission
                showNotification('¡Gracias por suscribirte! Te mantendremos informado sobre las últimas novedades de RSC Chain.', 'success');
                emailInput.value = '';
            } else {
                showNotification('Por favor, introduce un email válido.', 'error');
            }
        });
    }
}

// ===== UTILITY FUNCTIONS =====
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function showNotification(message, type = 'info') {
    // Use the advanced notification system
    showAdvancedNotification(message, type, 5000);
}

// ===== BLOCKCHAIN ANIMATION =====
function initBlockchainAnimation() {
    // Initialize new blockchain visualization
    const nodes = document.querySelectorAll('.node');
    const dataParticles = document.querySelectorAll('.data-particle');
    const connectionLines = document.querySelectorAll('.line');
    
    // Add staggered animation to nodes
    nodes.forEach((node, index) => {
        node.style.animationDelay = `${index * 0.5}s`;
        node.classList.add('fade-in-up');
        
        // Add hover effects
        node.addEventListener('mouseenter', () => {
            node.style.transform = 'scale(1.1)';
            node.style.boxShadow = '0 0 25px rgba(0, 255, 136, 0.6)';
        });
        
        node.addEventListener('mouseleave', () => {
            node.style.transform = 'scale(1)';
            node.style.boxShadow = 'none';
        });
    });
    
    // Add animation to data particles
    dataParticles.forEach((particle, index) => {
        particle.style.animationDelay = `${index * 1.5}s`;
    });
    
    // Add animation to connection lines
    connectionLines.forEach((line, index) => {
        line.style.animationDelay = `${index * 0.3}s`;
    });
}

// ===== PERFORMANCE CHART =====
function initPerformanceChart() {
    const tpsChart = document.getElementById('tpsChart');
    if (tpsChart) {
        const ctx = tpsChart.getContext('2d');
        
        // Simple line chart for TPS
        const data = {
            labels: ['', '', '', '', '', '', '', '', '', ''],
            datasets: [{
                label: 'TPS',
                data: [80000, 82000, 85000, 83000, 87000, 89000, 86000, 88000, 92000, 90000],
                borderColor: '#00ff88',
                backgroundColor: 'rgba(0, 255, 136, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4
            }]
        };
        
        // Create simple chart using canvas
        drawLineChart(ctx, data);
    }
}

function drawLineChart(ctx, data) {
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
    const maxValue = Math.max(...data.datasets[0].data);
    const minValue = Math.min(...data.datasets[0].data);
    const range = maxValue - minValue;
    
    ctx.strokeStyle = data.datasets[0].borderColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    data.datasets[0].data.forEach((value, index) => {
        const x = padding + (index * (width - 2 * padding)) / (data.datasets[0].data.length - 1);
        const y = height - padding - ((value - minValue) / range) * (height - 2 * padding);
        
        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });
    
    ctx.stroke();
}

// ===== ADVANCED PARTICLE SYSTEM =====
function initParticleSystem() {
    const heroSection = document.querySelector('.hero');
    if (!heroSection) return;
    
    // Create particle container
    const particleContainer = document.createElement('div');
    particleContainer.className = 'particles';
    heroSection.appendChild(particleContainer);
    
    // Generate particles
    for (let i = 0; i < 50; i++) {
        createParticle(particleContainer);
    }
    
    // Continuously add new particles
    setInterval(() => {
        if (particleContainer.children.length < 50) {
            createParticle(particleContainer);
        }
    }, 2000);
}

function createParticle(container) {
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

// ===== ADVANCED EFFECTS SYSTEM =====
function initAdvancedEffects() {
    // Add shimmer effect to buttons
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.addEventListener('mouseenter', () => {
            button.classList.add('shimmer');
        });
        
        button.addEventListener('mouseleave', () => {
            button.classList.remove('shimmer');
        });
    });
    
    // Add glow effect to cards
    const cards = document.querySelectorAll('.tech-card, .ecosystem-card, .performance-card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.classList.add('glow');
        });
        
        card.addEventListener('mouseleave', () => {
            card.classList.remove('glow');
        });
    });
    
    // Add floating animation to icons
    const icons = document.querySelectorAll('.tech-icon, .card-icon, .stat-icon');
    icons.forEach((icon, index) => {
        icon.style.animationDelay = (index * 0.2) + 's';
        icon.classList.add('float');
    });
}

// ===== 3D TRANSFORMS SYSTEM =====
function init3DTransforms() {
    const cards = document.querySelectorAll('.card-3d');
    
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = (y - centerY) / 10;
            const rotateY = (centerX - x) / 10;
            
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px) scale(1.02)`;
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0) scale(1)';
        });
    });
}

// ===== ADVANCED NOTIFICATION SYSTEM =====
function showAdvancedNotification(message, type = 'info', duration = 5000) {
    const notification = document.createElement('div');
    notification.className = `notification-glass ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // Close button functionality
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        hideNotification(notification);
    });
    
    // Auto-remove
    setTimeout(() => {
        hideNotification(notification);
    }, duration);
}

function hideNotification(notification) {
    notification.classList.remove('show');
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 300);
}

// ===== ADVANCED MODAL SYSTEM =====
function showModal(content, title = '') {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content">
            ${title ? `<h3>${title}</h3>` : ''}
            <div class="modal-body">${content}</div>
            <button class="modal-close btn btn-secondary">Close</button>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Show modal
    setTimeout(() => {
        modal.classList.add('active');
    }, 100);
    
    // Close functionality
    const closeBtn = modal.querySelector('.modal-close');
    closeBtn.addEventListener('click', () => {
        hideModal(modal);
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            hideModal(modal);
        }
    });
}

function hideModal(modal) {
    modal.classList.remove('active');
    setTimeout(() => {
        if (modal.parentNode) {
            modal.parentNode.removeChild(modal);
        }
    }, 300);
}

// ===== ADVANCED LOADING SYSTEM =====
function showLoading(element, text = 'Loading...') {
    const loading = document.createElement('div');
    loading.className = 'loading-overlay';
    loading.innerHTML = `
        <div class="loading-content">
            <div class="spinner-glass"></div>
            <p>${text}</p>
        </div>
    `;
    
    element.style.position = 'relative';
    element.appendChild(loading);
    
    return loading;
}

function hideLoading(loading) {
    if (loading && loading.parentNode) {
        loading.parentNode.removeChild(loading);
    }
}

// ===== ADVANCED TOOLTIP SYSTEM =====
function initTooltips() {
    const tooltipElements = document.querySelectorAll('[data-tooltip]');
    
    tooltipElements.forEach(element => {
        element.classList.add('tooltip');
    });
}

// ===== ADVANCED PROGRESS BARS =====
function animateProgressBars() {
    const progressBars = document.querySelectorAll('.progress-fill');
    
    progressBars.forEach(bar => {
        const targetWidth = bar.style.width || '0%';
        bar.style.width = '0%';
        
        setTimeout(() => {
            bar.style.width = targetWidth;
        }, 500);
    });
}

// ===== ADVANCED COUNTERS =====
function animateCounters() {
    const counters = document.querySelectorAll('.counter');
    
    counters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-target'));
        const duration = 2000; // 2 seconds
        const increment = target / (duration / 16); // 60fps
        let current = 0;
        
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            counter.textContent = Math.floor(current).toLocaleString();
        }, 16);
    });
}

// ===== INITIALIZE ADDITIONAL FEATURES =====
document.addEventListener('DOMContentLoaded', function() {
    // Initialize blockchain animation
    initBlockchainAnimation();
    
    // Initialize performance chart
    initPerformanceChart();
    
    // Add CSS for mobile menu
    addMobileMenuStyles();
    
    // Initialize advanced features
    initTooltips();
    animateProgressBars();
    animateCounters();
    
    // Add advanced CSS for loading overlay
    addAdvancedStyles();
});

function addMobileMenuStyles() {
    const style = document.createElement('style');
    style.textContent = `
        @media (max-width: 768px) {
            .nav-menu, .nav-utility {
                position: fixed;
                top: 70px;
                left: 0;
                right: 0;
                background: var(--bg-primary);
                border-bottom: 1px solid var(--border);
                padding: 1rem;
                transform: translateY(-100%);
                opacity: 0;
                visibility: hidden;
                transition: all 0.3s ease;
                flex-direction: column;
                gap: 1rem;
            }
            
            .nav-menu.mobile-open,
            .nav-utility.mobile-open {
                transform: translateY(0);
                opacity: 1;
                visibility: visible;
            }
            
            .mobile-menu-btn.active span:nth-child(1) {
                transform: rotate(45deg) translate(5px, 5px);
            }
            
            .mobile-menu-btn.active span:nth-child(2) {
                opacity: 0;
            }
            
            .mobile-menu-btn.active span:nth-child(3) {
                transform: rotate(-45deg) translate(7px, -6px);
            }
        }
        
        @keyframes slideInRight {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
    `;
    document.head.appendChild(style);
}

function addAdvancedStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .loading-overlay {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.8);
            backdrop-filter: var(--glass-backdrop);
            -webkit-backdrop-filter: var(--glass-backdrop);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            border-radius: var(--radius-xl);
        }
        
        .loading-content {
            text-align: center;
            color: var(--text-primary);
        }
        
        .loading-content p {
            margin-top: 1rem;
            color: var(--text-secondary);
        }
        
        .counter {
            font-weight: 800;
            color: var(--primary-500);
        }
        
        .notification-close {
            background: none;
            border: none;
            color: var(--text-primary);
            font-size: 1.5rem;
            cursor: pointer;
            padding: 0;
            margin-left: 1rem;
            transition: var(--transition);
        }
        
        .notification-close:hover {
            color: var(--error);
            transform: scale(1.1);
        }
        
        .modal-close {
            margin-top: 1rem;
        }
        
        .modal-body {
            margin: 1rem 0;
        }
        
        .modal-body h3 {
            margin-bottom: 1rem;
            color: var(--primary-500);
        }
    `;
    document.head.appendChild(style);
}
