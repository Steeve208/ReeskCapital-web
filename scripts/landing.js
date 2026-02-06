/* ===== LANDING - Menu, smooth scroll, back to top ===== */
(function () {
  'use strict';

  function initMobileMenu() {
    var toggle = document.getElementById('neurosearchMobileToggle');
    var menu = document.getElementById('mobileMenu');
    var closeBtn = document.getElementById('mobileMenuClose');
    var overlay = document.getElementById('mobileMenuOverlay');
    var navLinks = document.querySelectorAll('.mobile-nav-link');

    function openMenu() {
      if (!menu || !overlay) return;
      menu.classList.add('active');
      overlay.classList.add('active');
      document.body.style.overflow = 'hidden';
    }

    function closeMenu() {
      if (!menu || !overlay) return;
      menu.classList.remove('active');
      overlay.classList.remove('active');
      document.body.style.overflow = '';
    }

    if (toggle) {
      toggle.addEventListener('click', function (e) {
        e.preventDefault();
        if (menu && menu.classList.contains('active')) closeMenu();
        else openMenu();
      });
    }
    if (closeBtn) closeBtn.addEventListener('click', closeMenu);
    if (overlay) overlay.addEventListener('click', closeMenu);
    navLinks.forEach(function (link) {
      link.addEventListener('click', closeMenu);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu && menu.classList.contains('active')) closeMenu();
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > 1024 && menu && menu.classList.contains('active')) closeMenu();
    });
  }

  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
      var href = anchor.getAttribute('href');
      if (href === '#') return;
      anchor.addEventListener('click', function (e) {
        var id = href.slice(1);
        var el = document.getElementById(id);
        if (el) {
          e.preventDefault();
          var nav = document.querySelector('.neurosearch-navbar');
          var offset = nav ? nav.offsetHeight : 0;
          var top = el.getBoundingClientRect().top + window.pageYOffset - offset;
          window.scrollTo({ top: top, behavior: 'smooth' });
        }
      });
    });
  }

  function initBackToTop() {
    var btn = document.getElementById('backToTop');
    if (!btn) return;
    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  function initLanguageSelector() {
    var btn = document.getElementById('languageSelectorBtn');
    var dropdown = document.getElementById('languageDropdown');
    if (!btn || !dropdown) return;
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      dropdown.classList.toggle('show');
    });
    document.addEventListener('click', function () {
      dropdown.classList.remove('show');
    });
    dropdown.addEventListener('click', function (e) {
      e.stopPropagation();
    });
  }

  function initCounters() {
    var els = document.querySelectorAll('[data-target]');
    if (!els.length) return;
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var el = entry.target;
          var target = parseInt(el.getAttribute('data-target'), 10);
          if (isNaN(target)) return;
          observer.unobserve(el);
          var duration = 1500;
          var start = 0;
          var startTime = null;
          function step(ts) {
            if (!startTime) startTime = ts;
            var progress = Math.min((ts - startTime) / duration, 1);
            var ease = 1 - Math.pow(1 - progress, 2);
            var current = Math.floor(start + (target - start) * ease);
            el.textContent = current.toLocaleString();
            if (progress < 1) requestAnimationFrame(step);
            else el.textContent = target.toLocaleString();
          }
          requestAnimationFrame(step);
        });
      },
      { threshold: 0.2, rootMargin: '0px 0px -50px 0px' }
    );
    els.forEach(function (el) {
      observer.observe(el);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }

  function run() {
    initMobileMenu();
    initSmoothScroll();
    initBackToTop();
    initLanguageSelector();
    initCounters();
  }
})();
