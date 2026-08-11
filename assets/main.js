/* MAJICA ENTERPRISES — site behaviour */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------- Nav scroll state ---------------- */
  var nav = document.querySelector('.nav');
  function onScroll() {
    if (!nav) return;
    if (window.scrollY > 24) nav.classList.add('is-scrolled');
    else nav.classList.remove('is-scrolled');
  }
  document.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------------- Mobile menu ---------------- */
  var toggle = document.querySelector('.nav-toggle');
  var mobileMenu = document.querySelector('.mobile-menu');
  var cookieBannerEl = document.querySelector('.cookie-banner');
  if (toggle && mobileMenu) {
    var closeMenu = function () {
      toggle.classList.remove('is-open');
      mobileMenu.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
      if (cookieBannerEl) cookieBannerEl.classList.remove('is-hidden-by-menu');
    };
    var openMenu = function () {
      toggle.classList.add('is-open');
      mobileMenu.classList.add('is-open');
      toggle.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
      if (cookieBannerEl) cookieBannerEl.classList.add('is-hidden-by-menu');
    };
    toggle.addEventListener('click', function () {
      if (mobileMenu.classList.contains('is-open')) closeMenu();
      else openMenu();
    });
    mobileMenu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', closeMenu);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeMenu();
    });
  }

  /* ---------------- Scroll reveal ---------------- */
  var revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length) {
    if (reduceMotion || !('IntersectionObserver' in window)) {
      revealEls.forEach(function (el) { el.classList.add('is-visible'); });
    } else {
      var io = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-visible');
              io.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.14, rootMargin: '0px 0px -40px 0px' }
      );
      revealEls.forEach(function (el) { io.observe(el); });
    }
  }

  /* ---------------- Scroll-scrubbed pillar sequence (home) ----------------
     Unlike .reveal (one-shot fade-in), progress here is tied 1:1 to scroll
     position within the pinned section: lines draw, nodes scale in, and the
     headline assembles as the user scrolls, then un-does if they scroll back
     up. Skipped entirely under prefers-reduced-motion (CSS shows end-state). */
  var scrub = document.querySelector('.scrub-section');
  if (scrub && !reduceMotion) {
    var scrubLines = Array.prototype.slice.call(scrub.querySelectorAll('.scrub-line'));
    var scrubLineLengths = scrubLines.map(function (l) {
      var len = l.getTotalLength();
      l.style.strokeDasharray = len;
      l.style.strokeDashoffset = len;
      return len;
    });
    var scrubNodes = Array.prototype.slice.call(scrub.querySelectorAll('.scrub-node'));
    var scrubLabelSpans = Array.prototype.slice.call(scrub.querySelectorAll('.scrub-label span'));
    var scrubPayoff = scrub.querySelector('.scrub-payoff');
    var scrubCore = scrub.querySelector('.scrub-core');
    var scrubGlow = scrub.querySelector('.scrub-core-glow');

    var scrubStages = [
      { start: 0.04, end: 0.30 },
      { start: 0.32, end: 0.56 },
      { start: 0.58, end: 0.80 }
    ];
    var scrubPayoffStage = { start: 0.82, end: 1.0 };

    var scrubClamp01 = function (v) { return v < 0 ? 0 : v > 1 ? 1 : v; };

    function updateScrub() {
      var rect = scrub.getBoundingClientRect();
      var total = scrub.offsetHeight - window.innerHeight;
      var progress = total > 0 ? scrubClamp01(-rect.top / total) : 0;

      scrubStages.forEach(function (s, i) {
        var local = scrubClamp01((progress - s.start) / (s.end - s.start));
        scrubLines[i].style.strokeDashoffset = scrubLineLengths[i] * (1 - local);
        scrubNodes[i].style.opacity = local;
        scrubNodes[i].style.transform = 'scale(' + (0.4 + local * 0.6) + ')';
        scrubLabelSpans[i].style.opacity = local;
        scrubLabelSpans[i].style.transform = 'translateY(' + (10 - local * 10) + 'px)';
      });

      var pLocal = scrubClamp01((progress - scrubPayoffStage.start) / (scrubPayoffStage.end - scrubPayoffStage.start));
      scrubPayoff.style.opacity = pLocal;
      scrubPayoff.style.transform = 'translate(-50%, ' + (-50 + (1 - pLocal) * 10) + '%)';

      scrubCore.style.opacity = 0.35 + progress * 0.65;
      if (scrubGlow) scrubGlow.style.opacity = 0.15 + progress * 0.55;
    }

    updateScrub();
    var scrubTicking = false;
    document.addEventListener('scroll', function () {
      if (!scrubTicking) {
        requestAnimationFrame(function () { updateScrub(); scrubTicking = false; });
        scrubTicking = true;
      }
    }, { passive: true });
    window.addEventListener('resize', updateScrub);
  }

  /* ---------------- Orbital hero signature ---------------- */
  var canvas = document.getElementById('orbit-canvas');
  if (canvas && canvas.getContext) {
    var ctx = canvas.getContext('2d');
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var W, H, cx, cy, baseR;
    var mouseX = 0, mouseY = 0, targetX = 0, targetY = 0;
    var t = 0;

    var nodes = [
      { label: '01', name: 'DESIGN',       radiusRatio: 0.62, speed: 0.26, angle: 0.6,  size: 5.5 },
      { label: '02', name: 'DEVELOPMENT',  radiusRatio: 0.86, speed: 0.17, angle: 2.6,  size: 5.5 },
      { label: '03', name: 'MAISON',       radiusRatio: 0.74, speed: 0.21, angle: 4.5,  size: 5.5 }
    ];

    function resize() {
      var rect = canvas.parentElement.getBoundingClientRect();
      W = rect.width;
      H = rect.height;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      canvas.style.width = W + 'px';
      canvas.style.height = H + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cx = W / 2;
      cy = H / 2;
      baseR = Math.min(W, H) / 2;
    }
    resize();
    window.addEventListener('resize', resize);

    canvas.parentElement.addEventListener('mousemove', function (e) {
      var rect = canvas.getBoundingClientRect();
      targetX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      targetY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    });
    canvas.parentElement.addEventListener('mouseleave', function () {
      targetX = 0; targetY = 0;
    });

    function drawStatic() {
      ctx.clearRect(0, 0, W, H);
      ctx.save();
      ctx.translate(cx, cy);
      ctx.strokeStyle = 'rgba(224,224,224,0.14)';
      ctx.lineWidth = 1;
      var core = baseR * 0.16;
      ctx.beginPath();
      ctx.arc(0, 0, core, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(171,146,95,0.9)';
      ctx.fill();
      nodes.forEach(function (n) {
        var r = baseR * n.radiusRatio;
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.stroke();
        var x = Math.cos(n.angle) * r;
        var y = Math.sin(n.angle) * r * 0.94;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(x, y);
        ctx.strokeStyle = 'rgba(224,224,224,0.08)';
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(x, y, n.size, 0, Math.PI * 2);
        ctx.fillStyle = '#e0e0e0';
        ctx.fill();
      });
      ctx.restore();
    }

    function frame() {
      t += 0.0032;
      mouseX += (targetX - mouseX) * 0.04;
      mouseY += (targetY - mouseY) * 0.04;

      ctx.clearRect(0, 0, W, H);
      ctx.save();
      ctx.translate(cx + mouseX * 14, cy + mouseY * 14);
      ctx.rotate(mouseX * 0.05);

      /* core glow */
      var core = baseR * 0.16;
      var grad = ctx.createRadialGradient(0, 0, 0, 0, 0, core * 2.4);
      grad.addColorStop(0, 'rgba(224,224,224,0.9)');
      grad.addColorStop(0.35, 'rgba(171,146,95,0.35)');
      grad.addColorStop(1, 'rgba(171,146,95,0)');
      ctx.beginPath();
      ctx.arc(0, 0, core * 2.4, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(0, 0, core, 0, Math.PI * 2);
      ctx.fillStyle = '#f5f4f1';
      ctx.fill();

      nodes.forEach(function (n, i) {
        var r = baseR * n.radiusRatio;
        var ang = n.angle + t * n.speed;
        var x = Math.cos(ang) * r;
        var y = Math.sin(ang) * r * 0.94;

        /* orbit ring */
        ctx.beginPath();
        ctx.ellipse(0, 0, r, r * 0.94, 0, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(224,224,224,0.10)';
        ctx.lineWidth = 1;
        ctx.stroke();

        /* connector */
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(x, y);
        ctx.strokeStyle = 'rgba(171,146,95,0.18)';
        ctx.stroke();

        /* node glow */
        var ng = ctx.createRadialGradient(x, y, 0, x, y, n.size * 5);
        ng.addColorStop(0, 'rgba(171,146,95,0.55)');
        ng.addColorStop(1, 'rgba(171,146,95,0)');
        ctx.beginPath();
        ctx.arc(x, y, n.size * 5, 0, Math.PI * 2);
        ctx.fillStyle = ng;
        ctx.fill();

        /* node */
        ctx.beginPath();
        ctx.arc(x, y, n.size, 0, Math.PI * 2);
        ctx.fillStyle = '#e0e0e0';
        ctx.fill();

        /* label */
        ctx.font = '600 10px Inter, sans-serif';
        ctx.fillStyle = 'rgba(224,224,224,0.55)';
        ctx.textBaseline = 'middle';
        var lx = x + (x >= 0 ? 12 : -12);
        ctx.textAlign = x >= 0 ? 'left' : 'right';
        ctx.fillText(n.label + ' \u2014 ' + n.name, lx, y);
      });

      ctx.restore();
      requestAnimationFrame(frame);
    }

    if (reduceMotion) {
      drawStatic();
    } else {
      requestAnimationFrame(frame);
    }
  }

  /* ---------------- Cookie consent ---------------- */
  var COOKIE_KEY = 'majica_cookie_consent';
  var banner = document.querySelector('.cookie-banner');
  if (banner) {
    var accept = banner.querySelector('[data-cookie-accept]');
    try {
      if (!localStorage.getItem(COOKIE_KEY)) {
        window.setTimeout(function () { banner.classList.add('is-visible'); }, 700);
      }
    } catch (e) {
      window.setTimeout(function () { banner.classList.add('is-visible'); }, 700);
    }
    if (accept) {
      accept.addEventListener('click', function () {
        try { localStorage.setItem(COOKIE_KEY, 'accepted'); } catch (e) {}
        banner.classList.remove('is-visible');
      });
    }
  }

   /* ---------------- Contact form ---------------- */
  /* Live delivery via Web3Forms: submits the form data via fetch to
     Web3Forms' API, which forwards it to business@majica-enterprises.com. */
  var form = document.getElementById('contact-form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = form.querySelector('#name');
      var success = document.querySelector('.form-success');
      var successName = document.querySelector('[data-success-name]');
      fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { 'Accept': 'application/json' }
      })
        .then(function (r) { return r.json(); })
        .then(function (data) {
          if (data.success) {
            if (successName && name) successName.textContent = name.value.trim();
            form.style.display = 'none';
            if (success) success.style.display = 'block';
          } else {
            alert('Fehler beim Senden. Bitte versuche es erneut.');
          }
        })
        .catch(function () {
          alert('Fehler beim Senden. Bitte versuche es erneut.');
        });
    });
  }
})();
