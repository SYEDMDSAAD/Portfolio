/* =========================================================
   Syed Mohammad Saad — Portfolio
   ========================================================= */
(function () {
  'use strict';

  const $  = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- THEME ---------- */
  const root = document.documentElement;
  const themeToggle = $('#theme-toggle');

  const storedTheme = (() => {
    try { return localStorage.getItem('theme'); } catch (e) { return null; }
  })();

  const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
  root.setAttribute('data-theme', storedTheme || (prefersLight ? 'light' : 'dark'));

  themeToggle.addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    const meta = $('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', next === 'dark' ? '#07070c' : '#fbfbfe');
    try { localStorage.setItem('theme', next); } catch (e) { /* private mode */ }
  });

  /* ---------- MOBILE NAV ---------- */
  const navToggle = $('#nav-toggle');
  const navMenu   = $('#nav-menu');

  const closeNav = () => {
    navMenu.classList.remove('is-open');
    document.body.classList.remove('nav-open');
    navToggle.setAttribute('aria-expanded', 'false');
  };

  navToggle.addEventListener('click', () => {
    const open = navMenu.classList.toggle('is-open');
    document.body.classList.toggle('nav-open', open);
    navToggle.setAttribute('aria-expanded', String(open));
  });

  $$('.nav__link, .nav__menu-foot a').forEach(link => link.addEventListener('click', closeNav));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeNav(); });
  document.addEventListener('click', e => {
    if (navMenu.classList.contains('is-open') &&
        !navMenu.contains(e.target) && !navToggle.contains(e.target)) closeNav();
  });

  /* ---------- SCROLL: progress, sticky header, active link ---------- */
  const header   = $('#header');
  const progress = $('#progress');
  const sections = $$('main section[id]');
  const navLinks = $$('.nav__link');

  let ticking = false;

  function onScroll() {
    const y = window.scrollY;

    header.classList.toggle('is-stuck', y > 12);

    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = (scrollable > 0 ? (y / scrollable) * 100 : 0) + '%';

    // Active section: the last one whose top has passed the header line.
    let currentId = sections.length ? sections[0].id : '';
    const line = y + (window.innerHeight * 0.3);
    sections.forEach(sec => { if (sec.offsetTop <= line) currentId = sec.id; });

    // At the very bottom, always highlight the last section.
    if (scrollable > 0 && y >= scrollable - 4 && sections.length) {
      currentId = sections[sections.length - 1].id;
    }

    navLinks.forEach(link => {
      link.classList.toggle('is-active', link.getAttribute('href') === '#' + currentId);
    });

    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) { window.requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });

  window.addEventListener('resize', onScroll, { passive: true });
  onScroll();

  /* ---------- REVEAL ON SCROLL ---------- */
  const revealItems = $$('.reveal');

  if (reducedMotion || !('IntersectionObserver' in window)) {
    revealItems.forEach(el => el.classList.add('is-visible'));
  } else {
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const siblings = Array.from(entry.target.parentElement.children)
          .filter(el => el.classList.contains('reveal'));
        const idx = siblings.indexOf(entry.target);
        entry.target.style.transitionDelay = Math.min(idx, 6) * 70 + 'ms';
        entry.target.classList.add('is-visible');
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

    revealItems.forEach(el => io.observe(el));
  }

  /* ---------- TYPED ROLES ---------- */
  const typedEl = $('#typed');
  const roles = [
    'Software Engineer',
    'Distributed Systems Builder',
    'Java & Python Backend Engineer',
    'Published Researcher ×2',
    'Kubernetes & Cloud Native'
  ];

  if (typedEl) {
    if (reducedMotion) {
      typedEl.textContent = roles[0];
    } else {
      let roleIdx = 0, charIdx = 0, deleting = false;

      (function type() {
        const word = roles[roleIdx];
        typedEl.textContent = word.slice(0, charIdx);

        let delay = deleting ? 40 : 75;

        if (!deleting && charIdx === word.length) {
          deleting = true;
          delay = 1900;
        } else if (deleting && charIdx === 0) {
          deleting = false;
          roleIdx = (roleIdx + 1) % roles.length;
          delay = 320;
        } else {
          charIdx += deleting ? -1 : 1;
        }

        setTimeout(type, delay);
      })();
    }
  }

  /* ---------- COUNT-UP STATS ---------- */
  const statNums = $$('.stat__num');

  function countUp(el) {
    const target   = parseFloat(el.dataset.count);
    const decimals = parseInt(el.dataset.decimals || '0', 10);
    const suffix   = el.dataset.suffix || '';

    if (reducedMotion) {
      el.textContent = target.toFixed(decimals) + suffix;
      return;
    }

    const duration = 1400;
    const start = performance.now();

    (function step(now) {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = (target * eased).toFixed(decimals) + suffix;
      if (p < 1) requestAnimationFrame(step);
    })(start);
  }

  if ('IntersectionObserver' in window) {
    const statObs = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        countUp(entry.target);
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.5 });
    statNums.forEach(el => statObs.observe(el));
  } else {
    statNums.forEach(countUp);
  }

  /* ---------- SKILL CARD SPOTLIGHT ---------- */
  if (window.matchMedia('(hover: hover)').matches) {
    $$('.skill-card').forEach(card => {
      card.addEventListener('pointermove', e => {
        const r = card.getBoundingClientRect();
        card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        card.style.setProperty('--my', (e.clientY - r.top) + 'px');
      });
    });
  }

  /* ---------- PROJECT FILTERS ---------- */
  const filters = $$('.filter');
  const cards   = $$('#work-grid .card');

  filters.forEach(btn => {
    btn.addEventListener('click', () => {
      filters.forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');

      const want = btn.dataset.filter;
      cards.forEach(card => {
        const cats = (card.dataset.cat || '').split(' ');
        const show = want === 'all' || cats.includes(want);
        card.classList.toggle('is-hidden', !show);
        if (show) {
          card.classList.remove('is-visible');
          // next frame so the transition actually replays
          requestAnimationFrame(() => card.classList.add('is-visible'));
        }
      });
    });
  });

  /* ---------- TOAST ---------- */
  const toastEl = $('#toast');
  let toastTimer;

  function toast(message, kind = 'ok') {
    clearTimeout(toastTimer);
    toastEl.textContent = message;
    toastEl.className = 'toast is-open is-' + kind;
    toastTimer = setTimeout(() => { toastEl.className = 'toast is-' + kind; }, 4800);
  }

  /* ---------- CONTACT FORM ---------- */
  const form   = $('#contactForm');
  const submit = $('#cf-submit');
  const label  = submit ? $('.btn__label', submit) : null;

  form.addEventListener('submit', async function (event) {
    event.preventDefault();

    const fields = [$('#cf-name'), $('#cf-email'), $('#cf-msg')];
    let valid = true;

    fields.forEach(field => {
      const ok = field.checkValidity() && field.value.trim() !== '';
      field.classList.toggle('is-invalid', !ok);
      if (!ok && valid) { field.focus(); valid = false; }
    });

    if (!valid) { toast('Please fill in every field with a valid value.', 'error'); return; }

    const original = label ? label.textContent : '';
    submit.disabled = true;
    if (label) label.textContent = 'Sending…';

    try {
      const res = await fetch('https://portfoliobackend-2-or8q.onrender.com/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: $('#cf-name').value.trim(),
          email: $('#cf-email').value.trim(),
          message: $('#cf-msg').value.trim()
        })
      });

      if (!res.ok) throw new Error('HTTP ' + res.status);

      const data = await res.json().catch(() => ({}));
      toast(data.message || 'Thanks — your message is on its way. I\'ll reply soon.', 'ok');
      form.reset();
    } catch (err) {
      toast('Couldn\'t send that. Email me directly at mdsaadsyed29@gmail.com', 'error');
    } finally {
      submit.disabled = false;
      if (label) label.textContent = original;
    }
  });

  $$('#contactForm input, #contactForm textarea').forEach(field => {
    field.addEventListener('input', () => field.classList.remove('is-invalid'));
  });

  /* ---------- FOOTER YEAR ---------- */
  const year = $('#year');
  if (year) year.textContent = new Date().getFullYear();

})();
