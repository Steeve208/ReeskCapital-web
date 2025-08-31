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
            showNotification('Función de búsqueda próximamente disponible', 'info');
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
            showNotification('Panel de configuración próximamente disponible', 'info');
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
        const tpsElement = document.getElementById('liveTPS');
        if (tpsElement) {
            const change = (Math.random() - 0.5) * 2000;
            metrics.tps.current = Math.max(metrics.tps.min, Math.min(metrics.tps.max, metrics.tps.current + change));
            tpsElement.textContent = Math.round(metrics.tps.current).toLocaleString();
        }
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
        const nodesElement = document.getElementById('liveNodes');
        if (nodesElement) {
            const change = Math.random() > 0.5 ? 1 : -1;
            metrics.nodes.current = Math.max(metrics.nodes.min, Math.min(metrics.nodes.max, metrics.nodes.current + change));
            nodesElement.textContent = metrics.nodes.current.toLocaleString();
        }
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
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#6366f1'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        z-index: 10000;
        max-width: 400px;
        animation: slideInRight 0.3s ease-out;
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Close button functionality
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        notification.remove();
    });
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}

// ===== BLOCKCHAIN ANIMATION =====
function initBlockchainAnimation() {
    const blocks = document.querySelectorAll('.block');
    
    blocks.forEach((block, index) => {
        // Add staggered animation
        block.style.animationDelay = `${index * 0.2}s`;
        block.classList.add('fade-in-up');
        
        // Add hover effects
        block.addEventListener('mouseenter', () => {
            block.style.transform = 'translateY(-8px) scale(1.02)';
        });
        
        block.addEventListener('mouseleave', () => {
            block.style.transform = 'translateY(0) scale(1)';
        });
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

// ===== INITIALIZE ADDITIONAL FEATURES =====
document.addEventListener('DOMContentLoaded', function() {
    // Initialize blockchain animation
    initBlockchainAnimation();
    
    // Initialize performance chart
    initPerformanceChart();
    
    // Add CSS for mobile menu
    addMobileMenuStyles();
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
