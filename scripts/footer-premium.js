// ================================
// FOOTER PREMIUM - RSC CHAIN
// ================================

document.addEventListener('DOMContentLoaded', function() {
    initializeFooter();
});

function initializeFooter() {
    // Botón volver arriba
    const backToTopBtn = document.getElementById('backToTop');
    if (backToTopBtn) {
        // Mostrar/ocultar botón según scroll
        window.addEventListener('scroll', function() {
            if (window.pageYOffset > 300) {
                backToTopBtn.classList.add('show');
            } else {
                backToTopBtn.classList.remove('show');
            }
        });

        // Funcionalidad del botón
        backToTopBtn.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // Newsletter form
    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = this.querySelector('.newsletter-input').value;
            
            if (email && isValidEmail(email)) {
                // Simular envío exitoso
                const btn = this.querySelector('.newsletter-btn');
                const originalText = btn.innerHTML;
                
                btn.innerHTML = '<span>✅ Enviado!</span>';
                btn.style.background = 'linear-gradient(135deg, #00ff88, #00ccff)';
                btn.disabled = true;
                
                // Resetear después de 2 segundos
                setTimeout(() => {
                    btn.innerHTML = originalText;
                    btn.style.background = 'linear-gradient(135deg, var(--footer-accent), var(--footer-accent-secondary))';
                    btn.disabled = false;
                    this.querySelector('.newsletter-input').value = '';
                    
                    // Mostrar mensaje de éxito
                    showNotification('¡Gracias por suscribirte!', 'success');
                }, 2000);
            } else {
                showNotification('Por favor, ingresa un email válido', 'error');
            }
        });
    }

    // Efectos hover para enlaces
    const sectionLinks = document.querySelectorAll('.section-link');
    sectionLinks.forEach(link => {
        link.addEventListener('mouseenter', function() {
            this.style.transform = 'translateX(5px)';
        });
        
        link.addEventListener('mouseleave', function() {
            this.style.transform = 'translateX(0)';
        });
    });

    // Efectos hover para feature items
    const featureItems = document.querySelectorAll('.feature-item');
    featureItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            this.style.transform = 'translateX(5px)';
        });
        
        item.addEventListener('mouseleave', function() {
            this.style.transform = 'translateX(0)';
        });
    });

    // Efectos hover para estadísticas
    const statCards = document.querySelectorAll('.stat-card');
    statCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-3px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });

    // Animación de entrada para elementos
    animateElementsOnScroll();
}

// Validar email
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Mostrar notificación
function showNotification(message, type = 'info') {
    // Crear elemento de notificación
    const notification = document.createElement('div');
    notification.className = `footer-notification ${type}`;
    notification.innerHTML = `
        <span class="notification-icon">${getNotificationIcon(type)}</span>
        <span class="notification-text">${message}</span>
    `;
    
    // Estilos de la notificación
    notification.style.cssText = `
        position: fixed;
        bottom: 2rem;
        left: 2rem;
        background: ${getNotificationColor(type)};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        z-index: 10000;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        transform: translateX(-400px);
        transition: transform 0.3s ease;
        max-width: 350px;
        font-size: 0.9rem;
    `;
    
    document.body.appendChild(notification);
    
    // Mostrar notificación
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Ocultar después de 4 segundos
    setTimeout(() => {
        notification.style.transform = 'translateX(-400px)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 4000);
}

// Obtener icono de notificación
function getNotificationIcon(type) {
    switch (type) {
        case 'success': return '✅';
        case 'error': return '❌';
        case 'warning': return '⚠️';
        default: return 'ℹ️';
    }
}

// Obtener color de notificación
function getNotificationColor(type) {
    switch (type) {
        case 'success': return 'linear-gradient(135deg, #00ff88, #00ccff)';
        case 'error': return 'linear-gradient(135deg, #ff6b6b, #ff8e8e)';
        case 'warning': return 'linear-gradient(135deg, #ffd93d, #ffb84d)';
        default: return 'linear-gradient(135deg, #7657fc, #3fd8c2)';
    }
}

// Animación de elementos al hacer scroll
function animateElementsOnScroll() {
    const elements = document.querySelectorAll('.footer-brand, .footer-section, .stat-card, .newsletter-section');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });
    
    elements.forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(element);
    });
}

// Función global para reinicializar el footer
window.reinitializeFooter = function() {
    initializeFooter();
    console.log('Footer Premium reinicializado');
};

// Exportar funciones para uso global
window.footerPremium = {
    initialize: initializeFooter,
    reinitialize: window.reinitializeFooter
};
