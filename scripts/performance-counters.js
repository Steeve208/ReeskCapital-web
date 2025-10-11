// === PERFORMANCE & COMMUNITY COUNTERS ANIMATION ===
document.addEventListener('DOMContentLoaded', function() {
  
  function animateValue(element, target, duration = 2000) {
    const start = 0;
    const increment = target / (duration / 16);
    let current = start;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      
      if (target > 1000) {
        element.textContent = Math.floor(current).toLocaleString();
      } else {
        element.textContent = Math.floor(current);
      }
    }, 16);
  }
  
  // Animar Performance Section
  const perfSection = document.querySelector('.performance-modern');
  if (perfSection) {
    const perfObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const counters = perfSection.querySelectorAll('[data-target]');
          counters.forEach(counter => {
            const target = parseInt(counter.getAttribute('data-target'));
            animateValue(counter, target);
          });
          perfObserver.disconnect();
        }
      });
    }, { threshold: 0.3 });
    
    perfObserver.observe(perfSection);
  }
  
  // Animar Community Section
  const commSection = document.querySelector('.community-modern');
  if (commSection) {
    const commObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const counters = commSection.querySelectorAll('[data-target]');
          counters.forEach(counter => {
            const target = parseInt(counter.getAttribute('data-target'));
            animateValue(counter, target);
          });
          commObserver.disconnect();
        }
      });
    }, { threshold: 0.3 });
    
    commObserver.observe(commSection);
  }
});

