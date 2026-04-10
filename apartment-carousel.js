(function () {
  'use strict';

  function initApartmentCarousel(root) {
    if (!root) return;

    var track = root.querySelector('.carousel-track');
    var slides = root.querySelectorAll('.carousel-slide');
    var prevBtn = root.querySelector('[data-carousel-prev]');
    var nextBtn = root.querySelector('[data-carousel-next]');
    var dotsContainer = root.querySelector('[data-carousel-dots]');

    if (!track || !slides.length) return;

    var n = slides.length;
    var i = 0;

    function translate() {
      var pct = -(i / n) * 100;
      track.style.transform = 'translateX(' + pct + '%)';
      root.setAttribute('data-carousel-index', String(i));

      if (prevBtn) {
        prevBtn.disabled = false;
        nextBtn.disabled = false;
      }

      if (dotsContainer) {
        var dots = dotsContainer.querySelectorAll('.carousel-dot');
        dots.forEach(function (dot, idx) {
          dot.classList.toggle('is-active', idx === i);
          dot.setAttribute('aria-selected', idx === i ? 'true' : 'false');
        });
      }
    }

    function go(delta) {
      i = (i + delta + n) % n;
      translate();
    }

    function goTo(index) {
      i = Math.max(0, Math.min(n - 1, index));
      translate();
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', function () {
        go(-1);
      });
    }
    if (nextBtn) {
      nextBtn.addEventListener('click', function () {
        go(1);
      });
    }

    if (dotsContainer && !dotsContainer.children.length) {
      for (var d = 0; d < n; d++) {
        (function (idx) {
          var btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'carousel-dot' + (idx === 0 ? ' is-active' : '');
          btn.setAttribute('role', 'tab');
          btn.setAttribute('aria-selected', idx === 0 ? 'true' : 'false');
          btn.setAttribute('aria-label', 'Foto ' + (idx + 1) + ' de ' + n);
          btn.addEventListener('click', function () {
            goTo(idx);
          });
          dotsContainer.appendChild(btn);
        })(d);
      }
    } else if (dotsContainer) {
      dotsContainer.querySelectorAll('.carousel-dot').forEach(function (dot, idx) {
        dot.addEventListener('click', function () {
          goTo(idx);
        });
      });
    }

    root.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        go(-1);
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        go(1);
      }
    });

    root.setAttribute('tabindex', '0');
    translate();
  }

  window.initApartmentCarousel = initApartmentCarousel;

  var auto = document.querySelector('[data-carousel]');
  if (auto) {
    initApartmentCarousel(auto);
  }
})();
