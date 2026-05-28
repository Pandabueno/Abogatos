/* ============================================================
   BUFETE JURÍDICO MONZÓN & FRANCO — js/main.js
   ============================================================ */

/* ---- 1. MENÚ HAMBURGUESA ---- */
(function initMenu() {
  var btn = document.getElementById('hamburger');
  var nav = document.getElementById('nav-wrapper');
  if (!btn || !nav) return;

  function open() {
    btn.setAttribute('aria-expanded', 'true');
    nav.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function close() {
    btn.setAttribute('aria-expanded', 'false');
    nav.classList.remove('open');
    document.body.style.overflow = '';
  }

  btn.addEventListener('click', function () {
    btn.getAttribute('aria-expanded') === 'true' ? close() : open();
  });

  nav.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', close); });

  document.addEventListener('click', function (e) {
    if (!btn.contains(e.target) && !nav.contains(e.target)) close();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') close();
  });
})();

/* ---- 2. HEADER TRANSPARENTE → SÓLIDO AL HACER SCROLL (solo index) ---- */
(function initHeaderScroll() {
  var header = document.getElementById('site-header');
  if (!header || !header.classList.contains('transparent')) return;

  function update() {
    if (window.scrollY > 50) {
      header.classList.remove('transparent');
    } else {
      header.classList.add('transparent');
    }
  }

  window.addEventListener('scroll', update, { passive: true });
  update();
})();

/* ---- 3. FADE-IN AL SCROLL ---- */
(function initFadeIn() {
  var els = document.querySelectorAll('.fade-in');
  if (!els.length || !('IntersectionObserver' in window)) {
    els.forEach(function (el) { el.classList.add('visible'); });
    return;
  }

  var obs = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  els.forEach(function (el) { obs.observe(el); });
})();

/* ---- 4. BOTÓN FLOTANTE MÓVIL ---- */
(function initFloatBtn() {
  var mainBtn = document.getElementById('float-main-btn');
  var opts    = document.getElementById('float-opts');
  if (!mainBtn || !opts) return;

  mainBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    var open = opts.classList.contains('open');
    opts.classList.toggle('open', !open);
    mainBtn.setAttribute('aria-expanded', String(!open));
  });

  document.addEventListener('click', function (e) {
    if (!e.target.closest('#float-btn-wrap')) {
      opts.classList.remove('open');
      mainBtn.setAttribute('aria-expanded', 'false');
    }
  });
})();

/* ---- 5. FAQ ACCORDION ---- */
(function initFAQ() {
  var btns = document.querySelectorAll('.faq-q');
  if (!btns.length) return;

  btns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var answer = btn.nextElementSibling;
      var isOpen = btn.getAttribute('aria-expanded') === 'true';

      btns.forEach(function (other) {
        if (other !== btn) {
          other.setAttribute('aria-expanded', 'false');
          var a = other.nextElementSibling;
          if (a) a.classList.remove('open');
        }
      });

      btn.setAttribute('aria-expanded', String(!isOpen));
      if (answer) answer.classList.toggle('open', !isOpen);
    });
  });
})();

/* ---- 6. VALIDACIÓN DE FORMULARIO DE CONTACTO ---- */
(function initForm() {
  var form = document.getElementById('contact-form');
  if (!form) return;
  var success = document.getElementById('form-success');

  function showErr(group, msg) {
    group.classList.add('has-error');
    var span = group.querySelector('.form-err');
    if (span) span.textContent = msg;
  }
  function clearErr(group) {
    group.classList.remove('has-error');
  }
  function validEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }
  function validPhone(v) {
    var c = v.replace(/[\s\-\+\(\)]/g, '');
    return /^(502)?\d{8}$/.test(c);
  }

  form.querySelectorAll('input:not([type="checkbox"]), select, textarea').forEach(function (f) {
    f.addEventListener('input', function () {
      var g = f.closest('.form-group');
      if (g) clearErr(g);
    });
  });
  var privacyCb = form.querySelector('#privacy');
  if (privacyCb) {
    privacyCb.addEventListener('change', function () {
      var g = privacyCb.closest('.form-group');
      if (g) clearErr(g);
    });
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var ok = true;

    var gName = form.querySelector('#group-name');
    var vName = form.querySelector('#name').value.trim();
    if (!vName || vName.length < 3) { showErr(gName, 'Ingresa tu nombre completo.'); ok = false; } else clearErr(gName);

    var gPhone = form.querySelector('#group-phone');
    var vPhone = form.querySelector('#phone').value.trim();
    if (!vPhone) { showErr(gPhone, 'Ingresa tu número de teléfono.'); ok = false; }
    else if (!validPhone(vPhone)) { showErr(gPhone, 'Número guatemalteco inválido (8 dígitos, ej: 5057 3561).'); ok = false; }
    else clearErr(gPhone);

    var gEmail = form.querySelector('#group-email');
    var vEmail = form.querySelector('#email').value.trim();
    if (!vEmail) { showErr(gEmail, 'Ingresa tu correo electrónico.'); ok = false; }
    else if (!validEmail(vEmail)) { showErr(gEmail, 'Correo electrónico inválido.'); ok = false; }
    else clearErr(gEmail);

    var gArea = form.querySelector('#group-area');
    var vArea = form.querySelector('#area').value;
    if (!vArea) { showErr(gArea, 'Selecciona un área legal.'); ok = false; } else clearErr(gArea);

    var gMsg = form.querySelector('#group-message');
    var vMsg = form.querySelector('#message').value.trim();
    if (!vMsg || vMsg.length < 10) { showErr(gMsg, 'Describe tu caso brevemente (mínimo 10 caracteres).'); ok = false; } else clearErr(gMsg);

    var gPrivacy = form.querySelector('#group-privacy');
    if (!privacyCb || !privacyCb.checked) { showErr(gPrivacy, 'Debes aceptar la política de privacidad.'); ok = false; } else clearErr(gPrivacy);

    if (ok && success) {
      success.style.display = 'block';
      form.reset();
      form.querySelectorAll('.form-group').forEach(function (g) { clearErr(g); });
      success.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  });
})();

/* ---- 7. LINK ACTIVO EN NAV ---- */
(function setActiveNav() {
  var page = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.main-nav a').forEach(function (a) {
    var href = (a.getAttribute('href') || '').split('/').pop();
    if (href === page || (page === '' && href === 'index.html')) {
      a.classList.add('active');
      a.setAttribute('aria-current', 'page');
    }
  });
})();
