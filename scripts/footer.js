// === FOOTER FUNCTIONALITY ===
document.addEventListener('DOMContentLoaded', function() {
  // Back to Top Button
  const backToTopBtn = document.getElementById('backToTop');
  
  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', function() {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }
  
  // Newsletter Form
  const newsletterForm = document.querySelector('.newsletter-form');
  
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const email = this.querySelector('input[type="email"]').value;
      
      // Aquí puedes agregar tu lógica para enviar el email
      console.log('Newsletter subscription:', email);
      
      // Mostrar mensaje de éxito
      alert('Thanks for subscribing! You will receive updates soon.');
      this.reset();
    });
  }
});
