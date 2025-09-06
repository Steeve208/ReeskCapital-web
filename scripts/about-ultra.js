// About Page - Ultra Modern JavaScript

document.addEventListener('DOMContentLoaded', function() {
    initAboutUltra();
});

function initAboutUltra() {
    initParticles();
    initAOS();
    initCounters();
    initDemos();
    initLiveStats();
    initScrollEffects();
    initMobileMenu();
    initSmoothScrolling();
    initPerformanceOptimizations();
}

// Particle System - Optimized for Mobile
function initParticles() {
    if (typeof particlesJS !== 'undefined') {
        // Detect mobile devices
        const isMobile = window.innerWidth <= 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        particlesJS('particles-js', {
            particles: {
                number: {
                    value: isMobile ? 50 : 100, // Reduce particles on mobile
                    density: {
                        enable: true,
                        value_area: isMobile ? 1200 : 800
                    }
                },
                color: {
                    value: '#00ff88'
                },
                shape: {
                    type: 'circle',
                    stroke: {
                        width: 0,
                        color: '#000000'
                    }
                },
                opacity: {
                    value: 0.6,
                    random: true,
                    anim: {
                        enable: true,
                        speed: 1,
                        opacity_min: 0.1,
                        sync: false
                    }
                },
                size: {
                    value: 4,
                    random: true,
                    anim: {
                        enable: true,
                        speed: 2,
                        size_min: 0.1,
                        sync: false
                    }
                },
                line_linked: {
                    enable: true,
                    distance: 200,
                    color: '#00ff88',
                    opacity: 0.3,
                    width: 1
                },
                move: {
                    enable: true,
                    speed: 3,
                    direction: 'none',
                    random: true,
                    straight: false,
                    out_mode: 'out',
                    bounce: false,
                    attract: {
                        enable: true,
                        rotateX: 600,
                        rotateY: 1200
                    }
                }
            },
            interactivity: {
                detect_on: 'canvas',
                events: {
                    onhover: {
                        enable: true,
                        mode: 'repulse'
                    },
                    onclick: {
                        enable: true,
                        mode: 'push'
                    },
                    resize: true
                },
                modes: {
                    grab: {
                        distance: 400,
                        line_linked: {
                            opacity: 1
                        }
                    },
                    bubble: {
                        distance: 400,
                        size: 40,
                        duration: 2,
                        opacity: 8,
                        speed: 3
                    },
                    repulse: {
                        distance: 200,
                        duration: 0.4
                    },
                    push: {
                        particles_nb: 4
                    },
                    remove: {
                        particles_nb: 2
                    }
                }
            },
            retina_detect: true
        });
    }
}

// AOS Animation Library
function initAOS() {
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 1000,
            easing: 'ease-in-out',
            once: true,
            offset: 100,
            delay: 100
        });
    }
}

// Counter Animation
function initCounters() {
    const counters = document.querySelectorAll('[data-count]');
    
    const animateCounter = (counter) => {
        const target = parseFloat(counter.getAttribute('data-count'));
        const duration = 2500;
        const start = performance.now();
        
        const updateCounter = (currentTime) => {
            const elapsed = currentTime - start;
            const progress = Math.min(elapsed / duration, 1);
            
            const easeOutCubic = 1 - Math.pow(1 - progress, 3);
            const current = target * easeOutCubic;
            
            if (target >= 1000) {
                counter.textContent = Math.floor(current).toLocaleString() + '+';
            } else if (target < 10) {
                counter.textContent = current.toFixed(1);
            } else {
                counter.textContent = Math.floor(current);
            }
            
            if (progress < 1) {
                requestAnimationFrame(updateCounter);
            }
        };
        
        requestAnimationFrame(updateCounter);
    };
    
    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                counterObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    counters.forEach(counter => counterObserver.observe(counter));
}

// Interactive Demos
function initDemos() {
    // Transaction Speed Demo
    const startTxDemo = document.getElementById('startTxDemo');
    const txNodes = document.querySelectorAll('.tx-node');
    const txPerSec = document.getElementById('txPerSec');
    const latency = document.getElementById('latency');
    
    let demoInterval;
    let isRunning = false;
    
    if (startTxDemo) {
        startTxDemo.addEventListener('click', function() {
            if (!isRunning) {
                isRunning = true;
                this.textContent = 'Stop Demo';
                this.style.background = 'linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)';
                
                let txCount = 0;
                let currentLatency = 0;
                
                demoInterval = setInterval(() => {
                    // Animate transaction nodes
                    txNodes.forEach((node, index) => {
                        setTimeout(() => {
                            node.classList.add('active');
                            setTimeout(() => {
                                node.classList.remove('active');
                            }, 300);
                        }, index * 150);
                    });
                    
                    // Update stats with realistic values
                    const txIncrement = Math.floor(Math.random() * 100) + 50;
                    txCount += txIncrement;
                    currentLatency = Math.floor(Math.random() * 200) + 50;
                    
                    txPerSec.textContent = txCount.toLocaleString();
                    latency.textContent = currentLatency + 'ms';
                }, 1000);
            } else {
                isRunning = false;
                this.textContent = 'Start Demo';
                this.style.background = 'linear-gradient(135deg, #00ff88 0%, #00cc6a 100%)';
                clearInterval(demoInterval);
            }
        });
    }
    
    // Mining Calculator
    const hashRateSlider = document.getElementById('hashRate');
    const powerSlider = document.getElementById('powerConsumption');
    const hashRateValue = document.getElementById('hashRateValue');
    const powerValue = document.getElementById('powerValue');
    const dailyRSC = document.getElementById('dailyRSC');
    const monthlyRSC = document.getElementById('monthlyRSC');
    const efficiency = document.getElementById('efficiency');
    
    function updateCalculator() {
        const hashRate = parseFloat(hashRateSlider.value);
        const power = parseFloat(powerSlider.value);
        
        hashRateValue.textContent = hashRate + ' TH/s';
        powerValue.textContent = power + 'W';
        
        // More realistic mining calculations
        const baseReward = 0.1; // Base RSC per TH/s per hour
        const difficultyFactor = 0.8; // Simulated difficulty
        const powerEfficiency = Math.max(0.1, hashRate / power); // TH/s per watt
        
        const hourlyReward = (hashRate * baseReward * difficultyFactor) / 24;
        const dailyReward = hourlyReward * 24;
        const monthlyReward = dailyReward * 30;
        const efficiencyValue = powerEfficiency * 1000; // TH/s per kW
        
        dailyRSC.textContent = dailyReward.toFixed(2);
        monthlyRSC.textContent = monthlyReward.toFixed(2);
        efficiency.textContent = efficiencyValue.toFixed(2);
    }
    
    if (hashRateSlider && powerSlider) {
        hashRateSlider.addEventListener('input', updateCalculator);
        powerSlider.addEventListener('input', updateCalculator);
        updateCalculator(); // Initial calculation
    }
}

// Enhanced Scroll Effects - Optimized for Mobile
function initScrollEffects() {
    const navbar = document.querySelector('.navbar-ultra');
    const hero = document.querySelector('.hero-ultra');
    
    let lastScrollY = window.scrollY;
    let ticking = false;
    
    // Detect mobile devices
    const isMobile = window.innerWidth <= 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    function updateScrollEffects() {
        const scrolled = window.scrollY;
        
        // Navbar effects
        if (scrolled > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        
        // Parallax effect for hero (disabled on mobile for performance)
        if (hero && !isMobile) {
            const heroHeight = hero.offsetHeight;
            const scrolledPercent = scrolled / heroHeight;
            
            if (scrolledPercent <= 1) {
                hero.style.transform = `translateY(${scrolled * 0.3}px)`;
            }
        }
        
        // Floating elements rotation (disabled on mobile)
        if (!isMobile) {
            const blocks = document.querySelectorAll('.block');
            blocks.forEach((block, index) => {
                const rotation = scrolled * 0.1 + (index * 10);
                block.style.transform = `rotateY(${rotation}deg) rotateX(${rotation * 0.5}deg)`;
            });
            
            // Neural network animation
            const nodes = document.querySelectorAll('.node');
            nodes.forEach((node, index) => {
                const floatOffset = Math.sin(scrolled * 0.01 + index) * 10;
                node.style.transform = `translateY(${floatOffset}px)`;
            });
        }
        
        lastScrollY = scrolled;
        ticking = false;
    }
    
    function requestTick() {
        if (!ticking) {
            requestAnimationFrame(updateScrollEffects);
            ticking = true;
        }
    }
    
    window.addEventListener('scroll', requestTick, { passive: true });
}

// Mobile Menu - Enhanced
function initMobileMenu() {
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (navToggle && navMenu) {
        // Add mobile menu styles
        const style = document.createElement('style');
        style.textContent = `
            .nav-menu {
                position: fixed;
                top: 70px;
                left: 0;
                right: 0;
                background: rgba(10, 10, 10, 0.98);
                backdrop-filter: blur(20px);
                border-top: 1px solid var(--border-color);
                padding: 2rem;
                transform: translateY(-100%);
                opacity: 0;
                visibility: hidden;
                transition: all 0.3s ease;
                z-index: 999;
            }
            
            .nav-menu.active {
                transform: translateY(0);
                opacity: 1;
                visibility: visible;
            }
            
            .nav-menu a {
                display: block;
                padding: 1rem 0;
                border-bottom: 1px solid rgba(0, 255, 136, 0.1);
                text-align: center;
                font-size: 1.125rem;
            }
            
            .nav-menu a:last-child {
                border-bottom: none;
            }
            
            .nav-toggle.active span:nth-child(1) {
                transform: rotate(45deg) translate(5px, 5px);
            }
            
            .nav-toggle.active span:nth-child(2) {
                opacity: 0;
            }
            
            .nav-toggle.active span:nth-child(3) {
                transform: rotate(-45deg) translate(7px, -6px);
            }
            
            @media (min-width: 769px) {
                .nav-menu {
                    position: static;
                    background: transparent;
                    backdrop-filter: none;
                    border: none;
                    padding: 0;
                    transform: none;
                    opacity: 1;
                    visibility: visible;
                    display: flex;
                }
                
                .nav-menu a {
                    display: inline-block;
                    padding: 0;
                    border: none;
                    text-align: left;
                    font-size: 1rem;
                }
            }
        `;
        document.head.appendChild(style);
        
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            navToggle.classList.toggle('active');
            document.body.classList.toggle('menu-open');
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
                document.body.classList.remove('menu-open');
            }
        });
        
        // Close menu on escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
                document.body.classList.remove('menu-open');
            }
        });
        
        // Close menu when clicking on a link
        navMenu.addEventListener('click', function(e) {
            if (e.target.tagName === 'A') {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
                document.body.classList.remove('menu-open');
            }
        });
    }
}

// Smooth Scrolling
function initSmoothScrolling() {
    document.addEventListener('click', function(e) {
        if (e.target.tagName === 'A' && e.target.getAttribute('href').startsWith('#')) {
            e.preventDefault();
            const targetId = e.target.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                const offsetTop = targetElement.offsetTop - 80; // Account for fixed navbar
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        }
    });
}

// Performance Optimizations - Mobile Enhanced
function initPerformanceOptimizations() {
    // Detect mobile devices
    const isMobile = window.innerWidth <= 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    // Lazy load images
    const images = document.querySelectorAll('img[data-src]');
    
    if ('IntersectionObserver' in window && images.length > 0) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        }, {
            rootMargin: isMobile ? '50px' : '100px'
        });
        
        images.forEach(img => imageObserver.observe(img));
    }
    
    // Preload critical resources
    const criticalResources = [
        'https://unpkg.com/aos@2.3.1/dist/aos.css',
        'https://unpkg.com/aos@2.3.1/dist/aos.js'
    ];
    
    criticalResources.forEach(resource => {
        if (resource.endsWith('.css')) {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'style';
            link.href = resource;
            document.head.appendChild(link);
        } else {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'script';
            link.href = resource;
            document.head.appendChild(link);
        }
    });
    
    // Optimize animations for better performance
    const animatedElements = document.querySelectorAll('.tech-card, .feature-card, .team-member, .use-case-card, .partner-card, .security-card');
    animatedElements.forEach(el => {
        el.style.willChange = 'transform';
    });
    
    // Disable heavy animations on mobile
    if (isMobile) {
        // Disable 3D transforms on mobile
        const threeDElements = document.querySelectorAll('.floating-block, .block, .node');
        threeDElements.forEach(el => {
            el.style.display = 'none';
        });
        
        // Reduce animation complexity
        const style = document.createElement('style');
        style.textContent = `
            @media (max-width: 768px) {
                .icon-svg {
                    animation: none !important;
                }
                
                .tech-card:hover,
                .feature-card:hover,
                .team-member:hover,
                .use-case-card:hover,
                .partner-card:hover,
                .security-card:hover {
                    transform: translateY(-5px) !important;
                }
                
                .hero-3d-elements {
                    display: none !important;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Optimize scroll performance
    let scrollTimeout;
    window.addEventListener('scroll', function() {
        if (scrollTimeout) {
            clearTimeout(scrollTimeout);
        }
        scrollTimeout = setTimeout(function() {
            // Throttle scroll events
        }, 16); // ~60fps
    }, { passive: true });
    
    // Optimize resize performance
    let resizeTimeout;
    window.addEventListener('resize', function() {
        if (resizeTimeout) {
            clearTimeout(resizeTimeout);
        }
        resizeTimeout = setTimeout(function() {
            // Handle resize
            const newIsMobile = window.innerWidth <= 768;
            if (newIsMobile !== isMobile) {
                location.reload(); // Reload to apply mobile optimizations
            }
        }, 250);
    });
}

// Enhanced hover effects
function initHoverEffects() {
    const cards = document.querySelectorAll('.tech-card, .feature-card, .team-member');
    
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-15px) scale(1.02)';
            this.style.willChange = 'transform';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
}

// Initialize hover effects
document.addEventListener('DOMContentLoaded', function() {
    initHoverEffects();
});

// Add loading animation
window.addEventListener('load', function() {
    document.body.classList.add('loaded');
    
    // Trigger initial animations
    const heroElements = document.querySelectorAll('.hero-text > *');
    heroElements.forEach((el, index) => {
        setTimeout(() => {
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
        }, index * 200);
    });
});

// Add keyboard navigation
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        const navMenu = document.querySelector('.nav-menu');
        if (navMenu && navMenu.classList.contains('active')) {
            navMenu.classList.remove('active');
            document.querySelector('.nav-toggle').classList.remove('active');
            document.body.classList.remove('menu-open');
        }
    }
});

// Add touch gestures for mobile
function initTouchGestures() {
    let startY = 0;
    let startX = 0;
    
    document.addEventListener('touchstart', function(e) {
        startY = e.touches[0].clientY;
        startX = e.touches[0].clientX;
    });
    
    document.addEventListener('touchend', function(e) {
        const endY = e.changedTouches[0].clientY;
        const endX = e.changedTouches[0].clientX;
        const diffY = startY - endY;
        const diffX = startX - endX;
        
        // Swipe up to scroll down
        if (Math.abs(diffY) > Math.abs(diffX) && diffY > 50) {
            window.scrollBy(0, window.innerHeight);
        }
        // Swipe down to scroll up
        else if (Math.abs(diffY) > Math.abs(diffX) && diffY < -50) {
            window.scrollBy(0, -window.innerHeight);
        }
    });
}

// Initialize touch gestures
document.addEventListener('DOMContentLoaded', function() {
    initTouchGestures();
});

// Add performance monitoring
function initPerformanceMonitoring() {
    if ('performance' in window) {
        window.addEventListener('load', function() {
            setTimeout(() => {
                const perfData = performance.getEntriesByType('navigation')[0];
                console.log('Page load time:', perfData.loadEventEnd - perfData.loadEventStart, 'ms');
            }, 0);
        });
    }
}

// Initialize performance monitoring
document.addEventListener('DOMContentLoaded', function() {
    initPerformanceMonitoring();
});

// Live Stats Functionality
function initLiveStats() {
    const liveTps = document.getElementById('liveTps');
    const liveBlocks = document.getElementById('liveBlocks');
    const liveNodes = document.getElementById('liveNodes');
    const liveLatency = document.getElementById('liveLatency');
    
    if (!liveTps || !liveBlocks || !liveNodes || !liveLatency) return;
    
    // Simulate real-time data updates
    let tpsCount = 85000;
    let blocksCount = 1250000;
    let nodesCount = 2500;
    let latencyCount = 120;
    
    function updateLiveStats() {
        // TPS with realistic variation
        const tpsVariation = Math.random() * 20000 - 10000;
        tpsCount = Math.max(50000, tpsCount + tpsVariation);
        liveTps.textContent = Math.floor(tpsCount).toLocaleString();
        
        // Blocks increment
        blocksCount += Math.floor(Math.random() * 5) + 1;
        liveBlocks.textContent = blocksCount.toLocaleString();
        
        // Nodes with occasional changes
        if (Math.random() < 0.1) {
            const nodeChange = Math.random() < 0.5 ? 1 : -1;
            nodesCount = Math.max(2000, nodesCount + nodeChange);
        }
        liveNodes.textContent = nodesCount.toLocaleString();
        
        // Latency with realistic variation
        const latencyVariation = Math.random() * 40 - 20;
        latencyCount = Math.max(50, Math.min(200, latencyCount + latencyVariation));
        liveLatency.textContent = Math.floor(latencyCount);
    }
    
    // Update every 2 seconds
    setInterval(updateLiveStats, 2000);
    
    // Initial update
    updateLiveStats();
}

// Enhanced News Card Interactions
function initNewsInteractions() {
    const newsCards = document.querySelectorAll('.news-card');
    
    newsCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
}

// Initialize news interactions
document.addEventListener('DOMContentLoaded', function() {
    initNewsInteractions();
});

// Comparison Table Interactions
function initComparisonInteractions() {
    const tableRows = document.querySelectorAll('.table-row');
    
    tableRows.forEach(row => {
        row.addEventListener('mouseenter', function() {
            this.style.backgroundColor = 'rgba(0, 255, 136, 0.1)';
        });
        
        row.addEventListener('mouseleave', function() {
            this.style.backgroundColor = 'transparent';
        });
    });
}

// Initialize comparison interactions
document.addEventListener('DOMContentLoaded', function() {
    initComparisonInteractions();
});

// Security Badge Animations
function initSecurityBadges() {
    const badges = document.querySelectorAll('.badge');
    
    badges.forEach(badge => {
        badge.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.1)';
            this.style.boxShadow = '0 5px 15px rgba(0, 255, 136, 0.3)';
        });
        
        badge.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
            this.style.boxShadow = 'none';
        });
    });
}

// Initialize security badge animations
document.addEventListener('DOMContentLoaded', function() {
    initSecurityBadges();
});

// Use Case Card Animations
function initUseCaseAnimations() {
    const useCaseCards = document.querySelectorAll('.use-case-card');
    
    useCaseCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            const icon = this.querySelector('.use-case-icon svg');
            if (icon) {
                icon.style.animation = 'rotate 2s linear infinite';
            }
        });
        
        card.addEventListener('mouseleave', function() {
            const icon = this.querySelector('.use-case-icon svg');
            if (icon) {
                icon.style.animation = 'none';
            }
        });
    });
}

// Initialize use case animations
document.addEventListener('DOMContentLoaded', function() {
    initUseCaseAnimations();
});

// Partner Logo Animations
function initPartnerAnimations() {
    const partnerCards = document.querySelectorAll('.partner-card');
    
    partnerCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            const logo = this.querySelector('.logo-placeholder');
            if (logo) {
                logo.style.transform = 'scale(1.1) rotate(5deg)';
                logo.style.boxShadow = '0 10px 30px rgba(0, 255, 136, 0.3)';
            }
        });
        
        card.addEventListener('mouseleave', function() {
            const logo = this.querySelector('.logo-placeholder');
            if (logo) {
                logo.style.transform = 'scale(1) rotate(0deg)';
                logo.style.boxShadow = 'none';
            }
        });
    });
}

// Initialize partner animations
document.addEventListener('DOMContentLoaded', function() {
    initPartnerAnimations();
});
