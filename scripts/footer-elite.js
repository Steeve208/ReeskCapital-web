/* ===== RSC CHAIN ELITE FOOTER FUNCTIONALITY ===== */

class EliteFooterManager {
    constructor() {
        this.isNewsletterSubmitting = false;
        this.backToTopButton = null;
        this.newsletterForm = null;
        this.init();
    }

    init() {
        try {
            this.setupBackToTop();
            this.setupNewsletterForm();
            this.setupFooterAnimations();
            this.setupSocialLinks();
            this.setupLegalLinks();
            this.setupFooterLinks();
            this.setupScrollEffects();
            
            console.log('✅ Elite Footer Manager initialized successfully');
        } catch (error) {
            console.error('❌ Error initializing Elite Footer Manager:', error);
        }
    }

    setupBackToTop() {
        this.backToTopButton = document.getElementById('backToTop');
        if (this.backToTopButton) {
            // Show/hide button based on scroll position
            window.addEventListener('scroll', this.throttle(() => {
                if (window.pageYOffset > 300) {
                    this.backToTopButton.classList.add('show');
                } else {
                    this.backToTopButton.classList.remove('show');
                }
            }, 100));

            // Smooth scroll to top
            this.backToTopButton.addEventListener('click', (e) => {
                e.preventDefault();
                this.smoothScrollToTop();
            });
        }
    }

    smoothScrollToTop() {
        const scrollToTop = () => {
            const c = document.documentElement.scrollTop || document.body.scrollTop;
            if (c > 0) {
                window.requestAnimationFrame(scrollToTop);
                window.scrollTo(0, c - c / 8);
            }
        };
        scrollToTop();
    }

    setupNewsletterForm() {
        this.newsletterForm = document.querySelector('.newsletter-form-elite');
        if (this.newsletterForm) {
            this.newsletterForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleNewsletterSubmit();
            });

            // Add focus effects
            const emailInput = this.newsletterForm.querySelector('.newsletter-input-elite');
            if (emailInput) {
                emailInput.addEventListener('focus', () => {
                    this.newsletterForm.classList.add('focused');
                });

                emailInput.addEventListener('blur', () => {
                    this.newsletterForm.classList.remove('focused');
                });
            }
        }
    }

    async handleNewsletterSubmit() {
        if (this.isNewsletterSubmitting) return;

        const emailInput = this.newsletterForm.querySelector('.newsletter-input-elite');
        const submitButton = this.newsletterForm.querySelector('.newsletter-btn-elite');
        const email = emailInput.value.trim();

        if (!this.isValidEmail(email)) {
            this.showNotification('Por favor, ingresa un email válido', 'error');
            return;
        }

        this.isNewsletterSubmitting = true;
        
        // Update button state
        const originalText = submitButton.innerHTML;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>Enviando...</span>';
        submitButton.disabled = true;

        try {
            // Simulate API call
            await this.simulateNewsletterAPI(email);
            
            // Success
            this.showNotification('¡Gracias! Te has suscrito exitosamente al newsletter de RSC Chain', 'success');
            emailInput.value = '';
            
            // Add success animation
            this.newsletterForm.classList.add('success');
            setTimeout(() => {
                this.newsletterForm.classList.remove('success');
            }, 3000);

        } catch (error) {
            this.showNotification('Error al suscribirse. Intenta nuevamente.', 'error');
        } finally {
            // Restore button state
            submitButton.innerHTML = originalText;
            submitButton.disabled = false;
            this.isNewsletterSubmitting = false;
        }
    }

    async simulateNewsletterAPI(email) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Simulate 90% success rate
                if (Math.random() > 0.1) {
                    resolve({ success: true });
                } else {
                    reject(new Error('Network error'));
                }
            }, 1500);
        });
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    setupFooterAnimations() {
        // Animate footer elements on scroll
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, observerOptions);

        // Observe footer sections
        const footerSections = document.querySelectorAll('.footer-section');
        footerSections.forEach(section => {
            observer.observe(section);
        });

        // Animate brand section
        const brandSection = document.querySelector('.footer-brand-section');
        if (brandSection) {
            observer.observe(brandSection);
        }
    }

    setupSocialLinks() {
        const socialLinks = document.querySelectorAll('.social-link');
        socialLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const platform = link.getAttribute('title') || 'Social Media';
                this.showNotification(`Redirigiendo a ${platform}...`, 'info');
                
                // Simulate redirect delay
                setTimeout(() => {
                    // In a real implementation, this would redirect to the actual social media URL
                    console.log(`Redirecting to ${platform}`);
                }, 1000);
            });

            // Add hover sound effect (optional)
            link.addEventListener('mouseenter', () => {
                this.playHoverSound();
            });
        });
    }

    setupLegalLinks() {
        const legalLinks = document.querySelectorAll('.legal-link');
        legalLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = link.textContent;
                this.showNotification(`Abriendo ${page}...`, 'info');
                
                // Simulate page load
                setTimeout(() => {
                    console.log(`Opening ${page} page`);
                }, 800);
            });
        });
    }

    setupFooterLinks() {
        const footerLinks = document.querySelectorAll('.footer-link');
        footerLinks.forEach(link => {
            // Add loading state for external links
            if (link.href && !link.href.includes(window.location.origin)) {
                link.addEventListener('click', () => {
                    link.classList.add('loading');
                    setTimeout(() => {
                        link.classList.remove('loading');
                    }, 2000);
                });
            }

            // Add ripple effect
            link.addEventListener('click', (e) => {
                this.createRippleEffect(e, link);
            });
        });
    }

    createRippleEffect(event, element) {
        const ripple = document.createElement('span');
        const rect = element.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;

        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.classList.add('ripple');

        element.appendChild(ripple);

        setTimeout(() => {
            ripple.remove();
        }, 600);
    }

    setupScrollEffects() {
        // Parallax effect for footer background
        window.addEventListener('scroll', this.throttle(() => {
            const footer = document.querySelector('.rsc-elite-footer');
            if (footer) {
                const scrolled = window.pageYOffset;
                const rate = scrolled * -0.5;
                footer.style.transform = `translateY(${rate}px)`;
            }
        }, 16));

        // Animate particles on scroll
        window.addEventListener('scroll', this.throttle(() => {
            const particles = document.querySelectorAll('.footer-particles .particle');
            const scrolled = window.pageYOffset;
            
            particles.forEach((particle, index) => {
                const speed = (index + 1) * 0.5;
                particle.style.transform = `translateY(${scrolled * speed}px)`;
            });
        }, 16));
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `footer-notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas ${this.getNotificationIcon(type)}"></i>
                <span>${message}</span>
            </div>
        `;

        // Add to footer
        const footer = document.querySelector('.rsc-elite-footer');
        footer.appendChild(notification);

        // Show notification
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);

        // Remove notification
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 4000);
    }

    getNotificationIcon(type) {
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };
        return icons[type] || icons.info;
    }

    playHoverSound() {
        // Optional: Add hover sound effect
        // This would require audio files and browser autoplay policies
        console.log('Hover sound effect');
    }

    // Utility functions
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
        };
    }

    // Public methods
    scrollToTop() {
        this.smoothScrollToTop();
    }

    subscribeNewsletter(email) {
        if (this.newsletterForm) {
            const emailInput = this.newsletterForm.querySelector('.newsletter-input-elite');
            if (emailInput) {
                emailInput.value = email;
                this.handleNewsletterSubmit();
            }
        }
    }

    // Cleanup method
    destroy() {
        // Remove event listeners
        window.removeEventListener('scroll', this.handleScroll);
        
        console.log('✅ Elite Footer Manager destroyed');
    }
}

// ===== INITIALIZATION =====

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
    // Create global instance
    window.footerManager = new EliteFooterManager();
    
    // Expose class for global use
    window.EliteFooterManager = EliteFooterManager;
    
    console.log('🚀 Elite Footer Manager loaded successfully');
});

// Handle page visibility changes for performance
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Pause animations when page is not visible
        const particles = document.querySelectorAll('.footer-particles .particle');
        particles.forEach(particle => {
            particle.style.animationPlayState = 'paused';
        });
    } else {
        // Resume animations when page becomes visible
        const particles = document.querySelectorAll('.footer-particles .particle');
        particles.forEach(particle => {
            particle.style.animationPlayState = 'running';
        });
    }
});

// Handle beforeunload for cleanup
window.addEventListener('beforeunload', () => {
    if (window.footerManager) {
        window.footerManager.destroy();
    }
});

// ===== ADDITIONAL CSS FOR NOTIFICATIONS =====
const notificationStyles = `
.footer-notification {
    position: fixed;
    bottom: 2rem;
    left: 2rem;
    background: rgba(0, 0, 0, 0.9);
    color: #fff;
    padding: 1rem 1.5rem;
    border-radius: 12px;
    border: 1px solid rgba(0, 255, 136, 0.3);
    backdrop-filter: blur(20px);
    z-index: 10000;
    transform: translateY(100px);
    opacity: 0;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    max-width: 400px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.footer-notification.show {
    transform: translateY(0);
    opacity: 1;
}

.footer-notification.success {
    border-color: rgba(0, 255, 136, 0.3);
}

.footer-notification.error {
    border-color: rgba(255, 107, 107, 0.3);
}

.footer-notification.warning {
    border-color: rgba(255, 193, 7, 0.3);
}

.footer-notification.info {
    border-color: rgba(0, 204, 255, 0.3);
}

.notification-content {
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.notification-content i {
    font-size: 1.2rem;
}

.footer-notification.success .notification-content i {
    color: #00ff88;
}

.footer-notification.error .notification-content i {
    color: #ff6b6b;
}

.footer-notification.warning .notification-content i {
    color: #ffc107;
}

.footer-notification.info .notification-content i {
    color: #00ccff;
}

.ripple {
    position: absolute;
    border-radius: 50%;
    background: rgba(0, 255, 136, 0.3);
    transform: scale(0);
    animation: ripple-animation 0.6s linear;
    pointer-events: none;
}

@keyframes ripple-animation {
    to {
        transform: scale(4);
        opacity: 0;
    }
}

.footer-link.loading {
    pointer-events: none;
    opacity: 0.7;
}

.footer-link.loading::after {
    content: '';
    position: absolute;
    right: 1rem;
    width: 12px;
    height: 12px;
    border: 2px solid transparent;
    border-top: 2px solid #00ff88;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

.newsletter-form-elite.focused {
    transform: scale(1.02);
}

.newsletter-form-elite.success {
    animation: success-pulse 0.5s ease-out;
}

@keyframes success-pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
}

.footer-section.animate-in {
    animation: slideInUp 0.6s ease-out forwards;
}

@keyframes slideInUp {
    from {
        opacity: 0;
        transform: translateY(30px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}
`;

// Inject styles
const styleSheet = document.createElement('style');
styleSheet.textContent = notificationStyles;
document.head.appendChild(styleSheet);
