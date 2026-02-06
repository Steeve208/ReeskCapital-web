/**
 * SCROLL FIX - Mantenimiento extremo
 * Garantiza que la página siempre pueda subir/bajar con rueda (desktop) y dedo (móvil).
 * Aplicación suavizada por requestAnimationFrame para evitar lentitud y temblor.
 */

(function() {
  'use strict';

  var touchStartY = 0;
  var touchStartX = 0;
  var pendingScroll = 0;
  var rafScheduled = false;

  function isMenuOpen() {
    var menu = document.getElementById('mobileMenu');
    return menu && menu.classList.contains('active');
  }

  function isElementBlockingScroll(el) {
    if (!el || el === document.body || el === document.documentElement) return false;
    var s = getComputedStyle(el);
    var ox = s.overflowX, oy = s.overflowY, o = s.overflow;
    var hidden = ox === 'hidden' || oy === 'hidden' || o === 'hidden';
    if (!hidden) return false;
    var noScrollY = el.scrollHeight <= el.clientHeight + 2;
    var noScrollX = el.scrollWidth <= el.clientWidth + 2;
    return noScrollY && noScrollX;
  }

  function getBlockingAncestor(target) {
    var el = target;
    while (el && el !== document.documentElement) {
      if (isElementBlockingScroll(el)) return el;
      el = el.parentElement;
    }
    return null;
  }

  function ensureBodyScrollable() {
    if (isMenuOpen()) return;
    document.body.style.overflow = '';
    document.body.style.overflowX = 'hidden';
    document.body.style.overflowY = 'auto';
    document.documentElement.style.overflowY = 'auto';
  }

  function applyPendingScroll() {
    rafScheduled = false;
    if (pendingScroll === 0) return;
    var dy = pendingScroll;
    pendingScroll = 0;
    window.scrollBy(0, dy);
  }

  function scheduleScroll(deltaY) {
    pendingScroll += deltaY;
    if (!rafScheduled) {
      rafScheduled = true;
      requestAnimationFrame(applyPendingScroll);
    }
  }

  // --- Rueda (desktop): suavizado y sensibilidad normal ---
  document.addEventListener('wheel', function(e) {
    if (isMenuOpen()) return;
    if (!getBlockingAncestor(e.target)) return;
    var dy = e.deltaY;
    if (e.deltaMode === 1) dy *= 33;
    scheduleScroll(dy);
    e.preventDefault();
  }, { passive: false });

  // --- Touch (móvil): suavizado por frame ---
  document.addEventListener('touchstart', function(e) {
    if (e.touches.length !== 1) return;
    touchStartY = e.touches[0].clientY;
    touchStartX = e.touches[0].clientX;
  }, { passive: true, capture: true });

  document.addEventListener('touchmove', function(e) {
    if (isMenuOpen()) return;
    if (e.touches.length !== 1) return;
    if (!getBlockingAncestor(e.target)) return;
    var dy = e.touches[0].clientY - touchStartY;
    touchStartY = e.touches[0].clientY;
    touchStartX = e.touches[0].clientX;
    scheduleScroll(dy);
    e.preventDefault();
    e.stopPropagation();
  }, { passive: false, capture: true });

  // Restaurar scroll al cargar y cuando cierra el menú
  function init() {
    ensureBodyScrollable();
    var menu = document.getElementById('mobileMenu');
    var overlay = document.getElementById('mobileMenuOverlay');
    if (menu) {
      var observer = new MutationObserver(function() {
        if (!menu.classList.contains('active')) ensureBodyScrollable();
      });
      observer.observe(menu, { attributes: true, attributeFilter: ['class'] });
    }
    if (overlay) {
      overlay.addEventListener('click', ensureBodyScrollable, true);
    }
    document.addEventListener('visibilitychange', ensureBodyScrollable);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
