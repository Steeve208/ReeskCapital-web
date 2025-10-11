// scripts/about-page.js

document.addEventListener('DOMContentLoaded', function() {
    // Initialize AOS (Animate On Scroll)
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 1000,
            easing: 'ease-in-out',
            once: true,
            offset: 100
        });
    }

    // Counter Animation for Hero Stats
    function animateCounters() {
        const counters = document.querySelectorAll('.stat-number[data-count]');
        
        counters.forEach(counter => {
            const target = parseFloat(counter.getAttribute('data-count'));
            const duration = 2000; // 2 seconds
            const increment = target / (duration / 16); // 60fps
            let current = 0;
            
            const updateCounter = () => {
                current += increment;
                if (current < target) {
                    if (target >= 1000) {
                        counter.textContent = Math.floor(current).toLocaleString();
                    } else {
                        counter.textContent = current.toFixed(1);
                    }
                    requestAnimationFrame(updateCounter);
                } else {
                    if (target >= 1000) {
                        counter.textContent = target.toLocaleString();
                    } else {
                        counter.textContent = target.toFixed(1);
                    }
                }
            };
            
            // Start animation when element is in viewport
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        updateCounter();
                        observer.unobserve(entry.target);
                    }
                });
            });
            
            observer.observe(counter);
        });
    }

    // Smooth Scrolling for Anchor Links
    function initSmoothScrolling() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    // Mobile Menu Toggle
    function initMobileMenu() {
        const navToggle = document.querySelector('#mobile-toggle');
        const mobileMenu = document.querySelector('#mobile-menu');
        
        if (navToggle && mobileMenu) {
            navToggle.addEventListener('click', function() {
                navToggle.classList.toggle('active');
                mobileMenu.classList.toggle('active');
                document.body.classList.toggle('menu-open');
            });

            // Close menu when clicking on links
            mobileMenu.querySelectorAll('.mobile-nav-link').forEach(link => {
                link.addEventListener('click', () => {
                    navToggle.classList.remove('active');
                    mobileMenu.classList.remove('active');
                    document.body.classList.remove('menu-open');
                });
            });

            // Close menu when clicking outside
            document.addEventListener('click', function(e) {
                if (!navToggle.contains(e.target) && !mobileMenu.contains(e.target)) {
                    navToggle.classList.remove('active');
                    mobileMenu.classList.remove('active');
                    document.body.classList.remove('menu-open');
                }
            });
        }
    }

    // Navbar Scroll Effect
    function initNavbarScrollEffect() {
        const navbar = document.querySelector('.about-navbar');
        
        if (navbar) {
            let lastScrollTop = 0;
            
            window.addEventListener('scroll', () => {
                const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                
                // Add scrolled class for styling
                if (scrollTop > 50) {
                    navbar.classList.add('scrolled');
                } else {
                    navbar.classList.remove('scrolled');
                }
                
                lastScrollTop = scrollTop;
            });
        }
    }

    // Parallax Effect for Hero Section
    function initParallaxEffect() {
        const heroSection = document.querySelector('.about-hero');
        const heroParticles = document.querySelector('.hero-particles');
        
        if (heroSection && heroParticles) {
            window.addEventListener('scroll', () => {
                const scrolled = window.pageYOffset;
                const rate = scrolled * -0.5;
                
                heroParticles.style.transform = `translateY(${rate}px)`;
            });
        }
    }

    // Interactive Timeline
    function initInteractiveTimeline() {
        const timelineItems = document.querySelectorAll('.timeline-item');
        
        timelineItems.forEach((item, index) => {
            const marker = item.querySelector('.timeline-marker');
            const content = item.querySelector('.timeline-content');
            
            if (marker && content) {
                // Add click event to timeline markers
                marker.addEventListener('click', function() {
                    // Remove active class from all items
                    timelineItems.forEach(timelineItem => {
                        timelineItem.classList.remove('active');
                    });
                    
                    // Add active class to clicked item
                    item.classList.add('active');
                    
                    // Smooth scroll to content
                    content.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center'
                    });
                });

                // Add hover effects
                marker.addEventListener('mouseenter', function() {
                    marker.style.transform = 'scale(1.1)';
                });

                marker.addEventListener('mouseleave', function() {
                    marker.style.transform = 'scale(1)';
                });
            }
        });
    }

    // Team Member Interactions
    function initTeamMemberInteractions() {
        const teamMembers = document.querySelectorAll('.team-member');
        
        teamMembers.forEach(member => {
            const avatar = member.querySelector('.member-avatar');
            const socialLinks = member.querySelectorAll('.social-link');
            
            // Avatar hover effect
            if (avatar) {
                avatar.addEventListener('mouseenter', function() {
                    avatar.style.transform = 'scale(1.05) rotate(5deg)';
                });

                avatar.addEventListener('mouseleave', function() {
                    avatar.style.transform = 'scale(1) rotate(0deg)';
                });
            }

            // Social links animation
            socialLinks.forEach((link, index) => {
                link.addEventListener('mouseenter', function() {
                    this.style.transform = 'translateY(-5px) scale(1.1)';
                });

                link.addEventListener('mouseleave', function() {
                    this.style.transform = 'translateY(0) scale(1)';
                });
            });
        });
    }

    // Value Cards Hover Effects
    function initValueCardEffects() {
        const valueCards = document.querySelectorAll('.value-card');
        
        valueCards.forEach(card => {
            const icon = card.querySelector('.value-icon');
            
            card.addEventListener('mouseenter', function() {
                if (icon) {
                    icon.style.transform = 'scale(1.1) rotate(10deg)';
                }
            });

            card.addEventListener('mouseleave', function() {
                if (icon) {
                    icon.style.transform = 'scale(1) rotate(0deg)';
                }
            });
        });
    }

    // Achievement Cards Animation
    function initAchievementAnimations() {
        const achievementCards = document.querySelectorAll('.achievement-card');
        
        achievementCards.forEach(card => {
            const icon = card.querySelector('.achievement-icon');
            
            card.addEventListener('mouseenter', function() {
                if (icon) {
                    icon.style.animation = 'bounce 0.6s ease-in-out';
                }
            });

            card.addEventListener('mouseleave', function() {
                if (icon) {
                    icon.style.animation = 'none';
                }
            });
        });
    }

    // Tech Highlight Animations
    function initTechAnimations() {
        const techCards = document.querySelectorAll('.tech-highlight-card');
        
        techCards.forEach(card => {
            const visual = card.querySelector('.tech-visual');
            
            if (visual) {
                // Intersection Observer for tech animations
                const observer = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            entry.target.classList.add('animate');
                        } else {
                            entry.target.classList.remove('animate');
                        }
                    });
                }, { threshold: 0.5 });
                
                observer.observe(visual);
            }
        });
    }

    // Scroll Progress Indicator
    function initScrollProgress() {
        const progressBar = document.createElement('div');
        progressBar.className = 'scroll-progress';
        progressBar.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 0%;
            height: 3px;
            background: linear-gradient(90deg, var(--color-primary), var(--color-secondary));
            z-index: 9999;
            transition: width 0.1s ease;
        `;
        document.body.appendChild(progressBar);

        window.addEventListener('scroll', () => {
            const scrollTop = window.pageYOffset;
            const docHeight = document.body.scrollHeight - window.innerHeight;
            const scrollPercent = (scrollTop / docHeight) * 100;
            progressBar.style.width = scrollPercent + '%';
        });
    }

    // Lazy Loading for Images
    function initLazyLoading() {
        const images = document.querySelectorAll('img[data-src]');
        
        const imageObserver = new IntersectionObserver((entries) => {
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

    // Keyboard Navigation
    function initKeyboardNavigation() {
        document.addEventListener('keydown', function(e) {
            // ESC key closes mobile menu
            if (e.key === 'Escape') {
                const navToggle = document.querySelector('#mobile-toggle');
                const mobileMenu = document.querySelector('#mobile-menu');
                
                if (navToggle && mobileMenu) {
                    navToggle.classList.remove('active');
                    mobileMenu.classList.remove('active');
                    document.body.classList.remove('menu-open');
                }
            }
        });
    }

    // Performance Optimization
    function initPerformanceOptimizations() {
        // Debounce scroll events
        let scrollTimeout;
        const originalScrollHandler = window.onscroll;
        
        window.onscroll = function() {
            if (scrollTimeout) {
                clearTimeout(scrollTimeout);
            }
            scrollTimeout = setTimeout(() => {
                if (originalScrollHandler) {
                    originalScrollHandler();
                }
            }, 16); // ~60fps
        };

        // Preload critical resources
        const criticalResources = [
            '../assets/img/rsc-logo-quantum.svg'
        ];

        criticalResources.forEach(resource => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.href = resource;
            link.as = 'image';
            document.head.appendChild(link);
        });
    }

    // Error Handling
    function initErrorHandling() {
        window.addEventListener('error', function(e) {
            console.error('About page error:', e.error);
            // Could send error to analytics service here
        });

        window.addEventListener('unhandledrejection', function(e) {
            console.error('Unhandled promise rejection:', e.reason);
            // Could send error to analytics service here
        });
    }

    // Initialize all functions
    function init() {
        try {
            animateCounters();
            initSmoothScrolling();
            initMobileMenu();
            initNavbarScrollEffect();
            initParallaxEffect();
            initInteractiveTimeline();
            initTeamMemberInteractions();
            initValueCardEffects();
            initAchievementAnimations();
            initTechAnimations();
            initScrollProgress();
            initLazyLoading();
            initKeyboardNavigation();
            initPerformanceOptimizations();
            initErrorHandling();
            
            console.log('About page initialized successfully');
        } catch (error) {
            console.error('Error initializing about page:', error);
        }
    }

    // Start initialization
    init();

    // Add CSS animations dynamically
    const style = document.createElement('style');
    style.textContent = `
        @keyframes bounce {
            0%, 20%, 50%, 80%, 100% {
                transform: translateY(0);
            }
            40% {
                transform: translateY(-10px);
            }
            60% {
                transform: translateY(-5px);
            }
        }
        
        .timeline-item.active .timeline-content {
            box-shadow: 0 12px 48px rgba(0, 255, 136, 0.2);
            border-color: var(--color-primary);
        }
        
        .tech-visual.animate .neural-network,
        .tech-visual.animate .quantum-core,
        .tech-visual.animate .consensus-visualization {
            animation-play-state: running;
        }
        
        .tech-visual:not(.animate) .neural-network,
        .tech-visual:not(.animate) .quantum-core,
        .tech-visual:not(.animate) .consensus-visualization {
            animation-play-state: paused;
        }
        
        .lazy {
            opacity: 0;
            transition: opacity 0.3s;
        }
        
        .lazy.loaded {
            opacity: 1;
        }
        
        @media (prefers-reduced-motion: reduce) {
            * {
                animation-duration: 0.01ms !important;
                animation-iteration-count: 1 !important;
                transition-duration: 0.01ms !important;
            }
        }
    `;
    document.head.appendChild(style);
});
