(function () {
  'use strict';

  // Header scroll
  var header = document.querySelector('.header');
  if (header) {
    function onScroll() {
      header.classList.toggle('scrolled', window.scrollY > 20);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // Mobile nav: overlay, click outside, hamburger → X
  var navToggle = document.querySelector('.nav-toggle');
  var nav = document.querySelector('.nav');
  var navOverlay = document.getElementById('nav-overlay');

  function setNavOpen(open) {
    if (!nav || !navToggle) return;
    nav.classList.toggle('open', open);
    navToggle.classList.toggle('is-open', open);
    document.body.classList.toggle('nav-open', open);
    navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    navToggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    if (navOverlay) {
      navOverlay.setAttribute('aria-hidden', open ? 'false' : 'true');
    }
  }

  function closeNav() {
    setNavOpen(false);
  }

  function toggleNav() {
    setNavOpen(!nav.classList.contains('open'));
  }

  if (navToggle && nav) {
    navToggle.addEventListener('click', function (e) {
      e.stopPropagation();
      toggleNav();
    });

    document.querySelectorAll('.nav a').forEach(function (link) {
      link.addEventListener('click', function () {
        closeNav();
      });
    });
  }

  if (navOverlay) {
    navOverlay.addEventListener('click', function () {
      closeNav();
    });
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && nav && nav.classList.contains('open')) {
      closeNav();
    }
  });

  window.addEventListener(
    'resize',
    function () {
      if (window.innerWidth > 768 && nav && nav.classList.contains('open')) {
        closeNav();
      }
    },
    { passive: true }
  );

  // Cookies
  var cookieNotice = document.getElementById('cookie-notice');
  var cookieAccept = document.getElementById('cookie-accept');
  if (cookieNotice && cookieAccept) {
    var accepted = localStorage.getItem('canblau-cookies');
    if (!accepted) {
      cookieNotice.classList.add('visible');
    }
    cookieAccept.addEventListener('click', function () {
      localStorage.setItem('canblau-cookies', '1');
      cookieNotice.classList.remove('visible');
    });
  }

  // Enlaces mailto de reserva con huéspedes desde los selects de la sección Reservas
  document.querySelectorAll('[data-reserva-mailto]').forEach(function (btn) {
    var wrap = btn.closest('.reserva-form-wrap');
    if (!wrap) return;
    var selects = wrap.querySelectorAll('select');
    if (selects.length < 3) return;

    function syncHref() {
      var a = selects[0].value;
      var n = selects[1].value;
      var b = selects[2].value;
      var body =
        'Adultos: ' +
        a +
        ', Niños: ' +
        n +
        ', Bebés: ' +
        b +
        '.';
      btn.href =
        'mailto:blaunit@gmail.com?subject=' +
        encodeURIComponent('Reserva Can Blau Homes') +
        '&body=' +
        encodeURIComponent(body);
    }

    selects.forEach(function (sel) {
      sel.addEventListener('change', syncHref);
    });
    syncHref();
  });
})();
