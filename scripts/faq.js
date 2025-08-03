const faqSearch = document.getElementById('faqSearch');
const faqList = document.getElementById('faqList');

if (faqSearch && faqList) {
  faqSearch.addEventListener('input', function() {
    const query = this.value.toLowerCase();
    faqList.querySelectorAll('.faq-card').forEach(card => {
      const text = card.innerText.toLowerCase();
      card.style.display = text.includes(query) ? '' : 'none';
    });
  });
}

document.querySelectorAll('.faq-question').forEach(btn => {
  btn.addEventListener('click', function() {
    const card = this.closest('.faq-card');
    const expanded = card.classList.toggle('open');
    card.setAttribute('aria-expanded', expanded);
    this.setAttribute('aria-expanded', expanded);
    // Cerrar otros
    document.querySelectorAll('.faq-card').forEach(el => {
      if (el !== card) {
        el.classList.remove('open');
        el.setAttribute('aria-expanded', false);
        el.querySelector('.faq-question').setAttribute('aria-expanded', false);
      }
    });
  });
});

// Accesibilidad: abrir/cerrar con Enter/Espacio
document.querySelectorAll('.faq-card').forEach(card => {
  card.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      this.querySelector('.faq-question').click();
    }
  });
});
