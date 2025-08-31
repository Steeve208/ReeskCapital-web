/* ===== RSC CHAIN MAIN CONTENT FUNCTIONALITY ===== */

class RSCMainContentManager {
    constructor() {
        this.isInitialized = false;
        this.animationFrame = null;
        this.init();
    }

    init() {
        try {
            this.setupHeroAnimations();
            this.setupStatsAnimations();
            this.setupScrollEffects();
            this.setupInteractiveElements();
            this.startLiveUpdates();
            
            this.isInitialized = true;
            console.log('✅ RSC Main Content Manager initialized successfully');
        } catch (error) {
            console.error('❌ Error initializing RSC Main Content Manager:', error);
        }
    }

    setupHeroAnimations() {
        // Animate hero particles
        const particles = document.querySelectorAll('.hero-particle');
        particles.forEach((particle, index) => {
            particle.style.animationDelay = `${index * 0.5}s`;
        });

        // Animate blockchain visualization
        const blocks = document.querySelectorAll('.block');
        blocks.forEach((block, index) => {
            setTimeout(() => {
                block.classList.add('active');
            }, index * 200);
        });

        // Animate connection lines
        const lines = document.querySelectorAll('.line');
        lines.forEach((line, index) => {
            line.style.animationDelay = `${index * 0.3}s`;
        });
    }

    setupStatsAnimations() {
        // Animate stats on scroll
        const statsObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateStatValue(entry.target);
                }
            });
        }, { threshold: 0.5 });

        const statValues = document.querySelectorAll('.stat-value');
        statValues.forEach(stat => {
            statsObserver.observe(stat);
        });
    }

    animateStatValue(statElement) {
        const finalValue = statElement.textContent;
        const isNumber = /[\d,]+/.test(finalValue);
        
        if (isNumber) {
            const numericValue = parseInt(finalValue.replace(/[^\d]/g, ''));
            const suffix = finalValue.replace(/[\d,]/g, '');
            
            let currentValue = 0;
            const increment = numericValue / 50;
            const duration = 1000;
            const stepTime = duration / 50;

            const timer = setInterval(() => {
                currentValue += increment;
                if (currentValue >= numericValue) {
                    currentValue = numericValue;
                    clearInterval(timer);
                }
                
                statElement.textContent = this.formatNumber(currentValue) + suffix;
            }, stepTime);
        }
    }

    formatNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toLocaleString();
    }

    setupScrollEffects() {
        // Parallax effect for hero section
        const heroSection = document.querySelector('.hero-elite-section');
        if (heroSection) {
            window.addEventListener('scroll', () => {
                const scrolled = window.pageYOffset;
                const rate = scrolled * -0.5;
                heroSection.style.transform = `translateY(${rate}px)`;
            });
        }

        // Fade in effects for sections
        const sections = document.querySelectorAll('section');
        const sectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, { threshold: 0.1 });

        sections.forEach(section => {
            section.style.opacity = '0';
            section.style.transform = 'translateY(30px)';
            section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            sectionObserver.observe(section);
        });
    }

    setupInteractiveElements() {
        // Feature cards hover effects
        const featureCards = document.querySelectorAll('.feature-card');
        featureCards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                this.addRippleEffect(card);
            });
        });

        // Ecosystem cards hover effects
        const ecosystemCards = document.querySelectorAll('.ecosystem-card');
        ecosystemCards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                this.addRippleEffect(card);
            });
        });

        // Button hover effects
        const buttons = document.querySelectorAll('.btn-primary, .btn-secondary');
        buttons.forEach(button => {
            button.addEventListener('mouseenter', () => {
                this.addButtonGlow(button);
            });
            
            button.addEventListener('mouseleave', () => {
                this.removeButtonGlow(button);
            });
        });
    }

    addRippleEffect(element) {
        const ripple = document.createElement('div');
        ripple.className = 'ripple-effect';
        ripple.style.cssText = `
            position: absolute;
            border-radius: 50%;
            background: rgba(0, 255, 136, 0.3);
            transform: scale(0);
            animation: ripple-animation 0.6s linear;
            pointer-events: none;
        `;

        const rect = element.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;

        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';

        element.appendChild(ripple);

        setTimeout(() => {
            ripple.remove();
        }, 600);
    }

    addButtonGlow(button) {
        button.style.boxShadow = '0 0 30px rgba(0, 255, 136, 0.6)';
        button.style.transform = 'translateY(-2px) scale(1.02)';
    }

    removeButtonGlow(button) {
        button.style.boxShadow = '';
        button.style.transform = '';
    }

    startLiveUpdates() {
        // Simulate live blockchain updates
        setInterval(() => {
            this.updateBlockHeight();
            this.updateNetworkMetrics();
        }, 5000);
    }

    updateBlockHeight() {
        const blockHeightElement = document.getElementById('blockHeight');
        if (blockHeightElement) {
            const currentHeight = parseInt(blockHeightElement.textContent.replace(/,/g, ''));
            const newHeight = currentHeight + Math.floor(Math.random() * 3) + 1;
            blockHeightElement.textContent = newHeight.toLocaleString();
        }
    }

    updateNetworkMetrics() {
        // Update TPS with realistic variations
        const tpsElements = document.querySelectorAll('[id*="TPS"], [id*="tps"]');
        tpsElements.forEach(element => {
            const currentTPS = parseInt(element.textContent.replace(/[^\d]/g, ''));
            const variation = Math.floor(Math.random() * 1000) - 500;
            const newTPS = Math.max(80000, currentTPS + variation);
            element.textContent = newTPS.toLocaleString();
        });
    }

    // Performance optimization
    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        }
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Cleanup method
    destroy() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
        
        // Remove event listeners
        window.removeEventListener('scroll', this.scrollHandler);
        
        this.isInitialized = false;
        console.log('🔄 RSC Main Content Manager destroyed');
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.rscMainContentManager = new RSCMainContentManager();
});

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes ripple-animation {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
    
    .ripple-effect {
        position: absolute;
        border-radius: 50%;
        background: rgba(0, 255, 136, 0.3);
        transform: scale(0);
        animation: ripple-animation 0.6s linear;
        pointer-events: none;
    }
`;
document.head.appendChild(style);

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RSCMainContentManager;
}
