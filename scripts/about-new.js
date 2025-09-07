// About Page JavaScript - Next Level Design

document.addEventListener('DOMContentLoaded', function() {
    initAboutPage();
});

function initAboutPage() {
    initMobileMenu();
    initScrollEffects();
    initAnimations();
    initParticles();
    initCounters();
    initDemos();
    initAOS();
}

// Mobile Menu Functionality
function initMobileMenu() {
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            navToggle.classList.toggle('active');
        });
    }
}

// Scroll Effects
function initScrollEffects() {
    const navbar = document.querySelector('.navbar');
    
    window.addEventListener('scroll', function() {
        if (window.scrollY > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
}

// Animations
function initAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);
    
    // Observe all cards and sections
    const animatedElements = document.querySelectorAll('.overview-card, .section-header');
    animatedElements.forEach(el => observer.observe(el));
}

// Smooth scrolling for anchor links
document.addEventListener('click', function(e) {
    if (e.target.tagName === 'A' && e.target.getAttribute('href').startsWith('#')) {
        e.preventDefault();
        const targetId = e.target.getAttribute('href').substring(1);
        const targetElement = document.getElementById(targetId);
        
        if (targetElement) {
            targetElement.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }
});

// Add loading animation
window.addEventListener('load', function() {
    document.body.classList.add('loaded');
});

// Add hover effects
function addHoverEffects() {
    const cards = document.querySelectorAll('.overview-card');
    
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-15px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
}

// Initialize hover effects
document.addEventListener('DOMContentLoaded', function() {
    addHoverEffects();
});

// Add keyboard navigation
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        const navMenu = document.querySelector('.nav-menu');
        if (navMenu && navMenu.classList.contains('active')) {
            navMenu.classList.remove('active');
            document.querySelector('.nav-toggle').classList.remove('active');
        }
    }
});

// Performance optimization
function optimizePerformance() {
    // Lazy load images if any are added later
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
        });
        
        images.forEach(img => imageObserver.observe(img));
    }
}

// Initialize performance optimizations
window.addEventListener('load', function() {
    optimizePerformance();
});

// Particle System Initialization
function initParticles() {
    if (typeof particlesJS !== 'undefined') {
        particlesJS('particles-js', {
            particles: {
                number: {
                    value: 80,
                    density: {
                        enable: true,
                        value_area: 800
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
                    value: 0.5,
                    random: false,
                    anim: {
                        enable: false,
                        speed: 1,
                        opacity_min: 0.1,
                        sync: false
                    }
                },
                size: {
                    value: 3,
                    random: true,
                    anim: {
                        enable: false,
                        speed: 40,
                        size_min: 0.1,
                        sync: false
                    }
                },
                line_linked: {
                    enable: true,
                    distance: 150,
                    color: '#00ff88',
                    opacity: 0.4,
                    width: 1
                },
                move: {
                    enable: true,
                    speed: 6,
                    direction: 'none',
                    random: false,
                    straight: false,
                    out_mode: 'out',
                    bounce: false,
                    attract: {
                        enable: false,
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

// Counter Animation
function initCounters() {
    const counters = document.querySelectorAll('[data-count]');
    
    const animateCounter = (counter) => {
        const target = parseFloat(counter.getAttribute('data-count'));
        const duration = 2000;
        const start = performance.now();
        
        const updateCounter = (currentTime) => {
            const elapsed = currentTime - start;
            const progress = Math.min(elapsed / duration, 1);
            
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const current = target * easeOutQuart;
            
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
                this.style.background = '#ff6b35';
                
                let txCount = 0;
                let currentLatency = 0;
                
                demoInterval = setInterval(() => {
                    // Animate transaction nodes
                    txNodes.forEach((node, index) => {
                        setTimeout(() => {
                            node.classList.add('active');
                            setTimeout(() => {
                                node.classList.remove('active');
                            }, 200);
                        }, index * 100);
                    });
                    
                    // Update stats
                    txCount += Math.floor(Math.random() * 50) + 50;
                    currentLatency = Math.floor(Math.random() * 500) + 100;
                    
                    txPerSec.textContent = txCount.toLocaleString();
                    latency.textContent = currentLatency + 'ms';
                }, 1000);
            } else {
                isRunning = false;
                this.textContent = 'Start Demo';
                this.style.background = '#00ff88';
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
        
        // Calculate mining rewards (simplified formula)
        const dailyReward = (hashRate * 0.001) * 24; // Simplified calculation
        const monthlyReward = dailyReward * 30;
        const efficiencyValue = (hashRate / power) * 1000; // TH/s per kW
        
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

// AOS Animation Library
function initAOS() {
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 1000,
            easing: 'ease-in-out',
            once: true,
            offset: 100
        });
    }
}

// Enhanced Scroll Effects
function initScrollEffects() {
    const navbar = document.querySelector('.navbar');
    const hero = document.querySelector('.hero');
    
    window.addEventListener('scroll', function() {
        const scrolled = window.scrollY;
        
        // Navbar effects
        if (scrolled > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        
        // Parallax effect for hero
        if (hero) {
            const heroHeight = hero.offsetHeight;
            const scrolledPercent = scrolled / heroHeight;
            
            if (scrolledPercent <= 1) {
                hero.style.transform = `translateY(${scrolled * 0.5}px)`;
            }
        }
        
        // Floating block rotation
        const floatingBlock = document.querySelector('.floating-block');
        if (floatingBlock) {
            const rotation = scrolled * 0.1;
            floatingBlock.style.transform = `rotateY(${rotation}deg) rotateX(${rotation * 0.5}deg)`;
        }
    });
}

// Enhanced Animations
function initAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                
                // Add staggered animation for grid items
                if (entry.target.classList.contains('overview-card') || 
                    entry.target.classList.contains('tech-card')) {
                    const siblings = Array.from(entry.target.parentNode.children);
                    const index = siblings.indexOf(entry.target);
                    entry.target.style.animationDelay = `${index * 0.1}s`;
                }
            }
        });
    }, observerOptions);
    
    // Observe all animated elements
    const animatedElements = document.querySelectorAll('.overview-card, .tech-card, .timeline-item, .demo-card, .section-header');
    animatedElements.forEach(el => observer.observe(el));
}

// Performance optimizations
function optimizePerformance() {
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
}
