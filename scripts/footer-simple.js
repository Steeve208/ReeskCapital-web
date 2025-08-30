// ================================
// FOOTER SIMPLE - RSC CHAIN
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
                const originalText = btn.textContent;
                
                btn.textContent = '✅ Enviado!';
                btn.style.background = 'linear-gradient(135deg, #00ff88, #00ccff)';
                btn.disabled = true;
                
                // Resetear después de 2 segundos
                setTimeout(() => {
                    btn.textContent = originalText;
                    btn.style.background = 'linear-gradient(135deg, #7657fc, #3fd8c2)';
                    btn.disabled = false;
                    this.querySelector('.newsletter-input').value = '';
                }, 2000);
            } else {
                alert('Por favor, ingresa un email válido');
            }
        });
    }

    // Efectos hover para enlaces
    const footerLinks = document.querySelectorAll('.footer-links a');
    footerLinks.forEach(link => {
        link.addEventListener('mouseenter', function() {
            this.style.color = '#3fd8c2';
        });
        
        link.addEventListener('mouseleave', function() {
            this.style.color = 'rgba(255, 255, 255, 0.7)';
        });
    });
}

// Validar email
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Función global para reinicializar el footer
window.reinitializeFooter = function() {
    initializeFooter();
    console.log('Footer Simple reinicializado');
};
