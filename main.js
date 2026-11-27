/* =========================================================
   Syed Mohammad Saad · Portfolio
   ========================================================= */
(function () {
  'use strict';

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var root = document.documentElement;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var hasIO = 'IntersectionObserver' in window;
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };
  var sleep = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };

  // The contact address lives once, in the page markup.
  var copyBtn = $('[data-copy]');
  var contactAddress = copyBtn ? copyBtn.getAttribute('data-copy') : '';

  /* ---------- TOAST ---------- */
  var toastEl = $('#toast'), toastTimer;
  function toast(msg, kind) {
    clearTimeout(toastTimer);
    toastEl.textContent = msg;
    toastEl.className = 'toast is-open' + (kind === 'error' ? ' is-error' : '');
    toastTimer = setTimeout(function () { toastEl.className = 'toast' + (kind === 'error' ? ' is-error' : ''); }, 3200);
  }

  /* ---------- THEME ---------- */
  var dots = null;
  var metaTheme = $('meta[name="theme-color"]');
  function paintMeta() { if (metaTheme) metaTheme.setAttribute('content', root.getAttribute('data-theme') === 'dark' ? '#08080b' : '#f8f8f6'); }
  function setTheme(t) {
    root.setAttribute('data-theme', t);
    paintMeta();
    try { localStorage.setItem('theme', t); } catch (e) { /* private mode */ }
    if (dots) dots.recolor();
  }
  function toggleTheme() { setTheme(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark'); }
  $('#theme-toggle').addEventListener('click', toggleTheme);
  paintMeta();

  /* ---------- MOBILE MENU ---------- */
  var menu = $('#mobile-menu'), menuBtn = $('#menu-btn');
  function setMenu(open) {
    menu.classList.toggle('is-open', open);
    menu.setAttribute('aria-hidden', String(!open));
    menuBtn.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
  }
  menuBtn.addEventListener('click', function () { setMenu(!menu.classList.contains('is-open')); });
  $$('a', menu).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });

  /* ---------- HERO NAME: split into letters ---------- */
  var heroName = $('.hero__name');
  var ci = 0;
  $$('[data-split]', heroName).forEach(function (word) {
    var text = word.textContent;
    word.textContent = '';
    word.setAttribute('aria-hidden', 'true');
    var chunks = word.classList.contains('word--accent') ? [text] : text.split('');
    chunks.forEach(function (ch) {
      var s = document.createElement('span');
      s.className = 'char';
      s.textContent = ch;
      s.style.setProperty('--i', ci++);
      word.appendChild(s);
    });
  });
  var fontsReady = (document.fonts && document.fonts.ready) ? Promise.race([document.fonts.ready, sleep(900)]) : Promise.resolve();
  fontsReady.then(function () { requestAnimationFrame(function () { heroName.classList.add('is-in'); }); });

  /* ---------- HEADINGS: split into words ---------- */
  $$('[data-split-words]').forEach(function (el) {
    var i = 0;
    var walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null);
    var nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(function (node) {
      var frag = document.createDocumentFragment();
      node.textContent.split(/(\s+)/).forEach(function (part) {
        if (!part) return;
        if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
        var w = document.createElement('span'); w.className = 'w';
        var wi = document.createElement('span'); wi.className = 'wi'; wi.textContent = part;
        wi.style.setProperty('--i', i++);
        w.appendChild(wi); frag.appendChild(w);
      });
      node.parentNode.replaceChild(frag, node);
    });
  });

  /* ---------- REVEAL + SPLIT HEADINGS ---------- */
  var revealEls = $$('.reveal');
  var splitEls = $$('[data-split-words]');
  if (reduced || !hasIO) {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
    splitEls.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var revealIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target;
        if (el.classList.contains('reveal')) {
          var sibs = Array.prototype.filter.call(el.parentElement.children, function (c) { return c.classList.contains('reveal'); });
          el.style.setProperty('--d', Math.min(sibs.indexOf(el), 5) * 80 + 'ms');
          el.classList.add('is-visible');
        } else {
          el.classList.add('is-in');
        }
        revealIO.unobserve(el);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    revealEls.concat(splitEls).forEach(function (el) { revealIO.observe(el); });
  }

  /* ---------- COUNT-UP ---------- */
  function countUp(el) {
    var target = parseFloat(el.dataset.count);
    var dec = parseInt(el.dataset.decimals || '0', 10);
    var fmt = function (v) { return v.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec }); };
    if (reduced) { el.textContent = fmt(target); return; }
    var t0 = performance.now(), dur = 1600;
    (function step(now) {
      var p = clamp((now - t0) / dur, 0, 1);
      var eased = 1 - Math.pow(1 - p, 4);
      el.textContent = fmt(target * eased);
      if (p < 1) requestAnimationFrame(step);
    })(t0);
  }
  if (hasIO) {
    var countIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        countUp(e.target); countIO.unobserve(e.target);
      });
    }, { threshold: 0.6 });
    $$('[data-count]').forEach(function (el) { countIO.observe(el); });
  }

  /* ---------- HERO DOT FIELD ---------- */
  dots = (function () {
    var canvas = $('#dots');
    if (!canvas || !canvas.getContext) return null;
    var ctx = canvas.getContext('2d');
    var hero = $('.hero');
    var W = 0, H = 0, dpr = 1, pts = [], gap = 26;
    var mouse = { x: -9999, y: -9999, tx: -9999, ty: -9999 };
    var running = false, visible = true, raf = 0, t0 = performance.now();
    var base = '255,255,255', acc = '167,139,250';

    function recolor() {
      var light = root.getAttribute('data-theme') === 'light';
      base = light ? '20,20,40' : '255,255,255';
      acc = light ? '124,58,237' : '167,139,250';
      if (!running) draw(performance.now());
    }
    function resize() {
      var r = hero.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = r.width; H = r.height;
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      gap = W < 640 ? 22 : 26;
      pts = [];
      var ox = (W % gap) / 2, oy = (H % gap) / 2;
      for (var y = oy; y < H; y += gap) for (var x = ox; x < W; x += gap) pts.push(x, y);
      if (!running) draw(performance.now());
    }
    function draw(now) {
      var t = (now - t0) / 1000;
      ctx.clearRect(0, 0, W, H);
      mouse.x += (mouse.tx - mouse.x) * 0.12;
      mouse.y += (mouse.ty - mouse.y) * 0.12;
      // a slow ripple travels out from behind the trace card
      var wx = W * (W < 960 ? 0.5 : 0.78), wy = H * (W < 960 ? 0.62 : 0.32), R = 170;
      for (var i = 0; i < pts.length; i += 2) {
        var x = pts[i], y = pts[i + 1];
        var dxw = x - wx, dyw = y - wy;
        var dw = Math.sqrt(dxw * dxw + dyw * dyw);
        var wave = reduced ? 0 : Math.max(0, Math.sin(dw / 70 - t * 1.6));
        wave = Math.pow(wave, 6) * 0.55 * Math.max(0, 1 - dw / (W * 0.9));
        var dx = x - mouse.x, dy = y - mouse.y;
        var d = Math.sqrt(dx * dx + dy * dy);
        var near = d < R ? 1 - d / R : 0;
        var px = x, py = y;
        if (near > 0) { var push = near * near * 10; px += (dx / (d || 1)) * push; py += (dy / (d || 1)) * push; }
        var a = 0.09 + wave * 0.5 + near * 0.75;
        var rad = 0.9 + near * 1.3 + wave * 0.6;
        ctx.fillStyle = 'rgba(' + (near > 0.08 || wave > 0.2 ? acc : base) + ',' + a.toFixed(3) + ')';
        ctx.beginPath(); ctx.arc(px, py, rad, 0, 6.2832); ctx.fill();
      }
    }
    function loop(now) { draw(now); raf = requestAnimationFrame(loop); }
    function start() { if (running || reduced) return; running = true; raf = requestAnimationFrame(loop); }
    function stop() { running = false; cancelAnimationFrame(raf); }

    hero.addEventListener('pointermove', function (e) {
      var r = hero.getBoundingClientRect();
      mouse.tx = e.clientX - r.left; mouse.ty = e.clientY - r.top;
      if (mouse.x < -999) { mouse.x = mouse.tx; mouse.y = mouse.ty; }
    });
    hero.addEventListener('pointerleave', function () { mouse.tx = mouse.ty = mouse.x = mouse.y = -9999; });
    var rzTimer;
    window.addEventListener('resize', function () { clearTimeout(rzTimer); rzTimer = setTimeout(resize, 120); }, { passive: true });
    if (hasIO) {
      new IntersectionObserver(function (es) {
        visible = es[0].isIntersecting;
        if (visible && !document.hidden) start(); else stop();
      }).observe(hero);
    }
    document.addEventListener('visibilitychange', function () { if (document.hidden) stop(); else if (visible) start(); });
    recolor(); resize(); start();
    return { recolor: recolor };
  })();

  /* ---------- LIVE TRACE ---------- */
  (function () {
    var trace = $('#trace');
    if (!trace) return;
    var q = $('.trace__qtext', trace), a = $('.trace__atext', trace);
    var qText = q.dataset.q || q.textContent, aText = a.textContent;
    if (reduced) { trace.classList.add('is-running', 'is-answering', 'is-done'); return; }

    var inView = true, waiting = null;
    if (hasIO) new IntersectionObserver(function (es) {
      inView = es[0].isIntersecting;
      if (inView && waiting) { var w = waiting; waiting = null; w(); }
    }, { threshold: 0.2 }).observe(trace);
    function whenVisible() { return inView && !document.hidden ? Promise.resolve() : new Promise(function (r) { waiting = r; }); }
    document.addEventListener('visibilitychange', function () { if (!document.hidden && inView && waiting) { var w = waiting; waiting = null; w(); } });

    async function type(el, text, speed) {
      el.textContent = '';
      for (var i = 1; i <= text.length; i++) {
        el.textContent = text.slice(0, i);
        await sleep(speed + (text[i - 1] === ' ' ? speed * 0.6 : 0));
      }
    }
    async function cycle() {
      for (;;) {
        await whenVisible();
        trace.classList.remove('is-running', 'is-answering', 'is-done');
        a.textContent = '';
        await sleep(450);
        await type(q, qText, 34);
        await sleep(250);
        trace.classList.add('is-running');
        await sleep(2300);
        trace.classList.add('is-answering');
        await type(a, aText, 15);
        trace.classList.add('is-done');
        await sleep(4200);
      }
    }
    q.textContent = ''; a.textContent = '';
    sleep(700).then(cycle);
  })();

  /* ---------- SEQUENCED TILE ANIMATIONS ---------- */
  var sequences = [
    { sel: '.vis-forge', items: ['.vf__user', '.vf__bot:not(.vf__ans)', '.vf__steps li:nth-child(1)', '.vf__steps li:nth-child(2)', '.vf__steps li:nth-child(3)', '.vf__steps li:nth-child(4)', '.vf__ans'], at: [0, 900, 1800, 2350, 2900, 3450, 4300], loop: 9500 },
    { sel: '.vis-chat', items: ['.vc__b--in', '.vc__b--out', '.vc__typing'], at: [0, 900, 1900], loop: 5600 },
    { sel: '.vis-tls', items: ['.vt__msg--r', '.vt__msg--l', '.vt__msg--r ~ .vt__msg--r', '.vt__msg--both'], at: [0, 750, 1500, 2400], loop: 6000 },
    { sel: '.vis-voice', items: ['.vv__flight:not(.vv__flight--new)', '.vv__arrow', '.vv__flight--new', '.vv__quote'], at: [200, 1000, 1500, 2300], loop: 7600 },
    { sel: '.vis-cal', items: ['.vk__toast'], at: [900], loop: 4800 }
  ];
  sequences.forEach(function (cfg) {
    var box = $(cfg.sel);
    if (!box) return;
    var els = cfg.items.map(function (s) { return $(s, box); }).filter(Boolean);
    els.forEach(function (el) { el.classList.add('seq'); });
    box.setAttribute('data-seq', '');
    if (reduced || !hasIO) { els.forEach(function (el) { el.classList.add('on'); }); return; }
    var timers = [], active = false, loopTimer;
    function run() {
      els.forEach(function (el) { el.classList.remove('on'); });
      timers = els.map(function (el, i) { return setTimeout(function () { el.classList.add('on'); }, cfg.at[i] + 250); });
      loopTimer = setTimeout(function () { if (active) run(); }, cfg.loop);
    }
    new IntersectionObserver(function (es) {
      var vis = es[0].isIntersecting;
      if (vis && !active) { active = true; run(); }
      else if (!vis && active) { active = false; timers.forEach(clearTimeout); clearTimeout(loopTimer); }
    }, { threshold: 0.35 }).observe(box);
  });

  /* pause CSS animations of off-screen cards */
  if (hasIO) {
    var viewIO = new IntersectionObserver(function (es) {
      es.forEach(function (e) { e.target.classList.toggle('in-view', e.isIntersecting); });
    }, { threshold: 0.05 });
    $$('.tile, .paper').forEach(function (el) { viewIO.observe(el); });
  } else {
    $$('.tile, .paper').forEach(function (el) { el.classList.add('in-view'); });
  }

  /* ---------- FINTWIN SHOWCASE ---------- */
  var showcase = $('#showcase'), browser = showcase ? $('.browser', showcase) : null;
  var shotBtns = $$('[data-shot]'), shots = $$('.browser__view img');
  var shotIdx = 0, shotTimer = null, shotHover = false;
  function showShot(i) {
    shotIdx = i;
    shotBtns.forEach(function (b, j) { b.classList.toggle('is-active', j === i); b.setAttribute('aria-selected', String(j === i)); });
    shots.forEach(function (img, j) { img.classList.toggle('is-active', j === i); });
  }
  function restartShots() {
    clearInterval(shotTimer);
    if (reduced) return;
    shotTimer = setInterval(function () { if (!shotHover) showShot((shotIdx + 1) % shots.length); }, 4800);
  }
  shotBtns.forEach(function (b, i) { b.addEventListener('click', function () { showShot(i); restartShots(); }); });
  if (showcase) {
    showcase.addEventListener('pointerenter', function () { shotHover = true; });
    showcase.addEventListener('pointerleave', function () { shotHover = false; });
    if (hasIO) new IntersectionObserver(function (es) {
      if (es[0].isIntersecting) restartShots(); else clearInterval(shotTimer);
    }).observe(showcase);
  }

  /* ---------- STORY (sticky scenes, inline copies on small screens) ---------- */
  var steps = $$('.step'), scenes = $$('.stage .scene');
  var inlineScenes = steps.map(function (step, i) {
    var slot = $('.scene-inline', step), src = scenes[i];
    if (!slot || !src) return null;
    var clone = src.cloneNode(true);
    clone.classList.remove('is-active');
    $$('[id]', clone).forEach(function (n) { n.id = n.id + '-m'; });
    $$('mpath', clone).forEach(function (m) { var h = m.getAttribute('href'); if (h) m.setAttribute('href', h + '-m'); });
    slot.appendChild(clone);
    return clone;
  });
  function activateStep(i) {
    if (i < 0) return;
    steps.forEach(function (s, j) { s.classList.toggle('is-active', j === i); });
    scenes.forEach(function (s, j) { s.classList.toggle('is-active', j === i); });
  }
  if (hasIO && !reduced) {
    var storyIO = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) activateStep(steps.indexOf(e.target)); });
    }, { rootMargin: '-48% 0px -48% 0px' });
    steps.forEach(function (s) { storyIO.observe(s); });
    var inlineIO = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        var c = inlineScenes[steps.indexOf(e.target.closest('.step'))];
        if (!c) return;
        c.classList.toggle('is-active', e.isIntersecting);
        // the wide diagram scrolls sideways on phones: open it centred
        if (e.isIntersecting && c.classList.contains('scene--arch') && !c.dataset.centred) {
          c.dataset.centred = '1';
          c.scrollLeft = (c.scrollWidth - c.clientWidth) / 2;
        }
      });
    }, { threshold: 0.4 });
    $$('.scene-inline').forEach(function (s) { inlineIO.observe(s); });
  } else {
    steps.forEach(function (s) { s.classList.add('is-active'); });
    inlineScenes.forEach(function (c) { if (c) c.classList.add('is-active'); });
  }

  /* ---------- TILT, SPOTLIGHT, MAGNETIC ---------- */
  if (finePointer && !reduced) {
    $$('[data-tilt]').forEach(function (card) {
      var max = card.classList.contains('about__card') ? 5 : 3.5;
      card.addEventListener('pointermove', function (e) {
        var r = card.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        card.style.setProperty('--mx', (x * 100) + '%');
        card.style.setProperty('--my', (y * 100) + '%');
        card.style.setProperty('--rx', ((0.5 - y) * max).toFixed(2) + 'deg');
        card.style.setProperty('--ry', ((x - 0.5) * max).toFixed(2) + 'deg');
      });
      card.addEventListener('pointerleave', function () {
        card.style.setProperty('--rx', '0deg'); card.style.setProperty('--ry', '0deg');
      });
    });
    $$('.magnetic').forEach(function (el) {
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        var x = e.clientX - (r.left + r.width / 2), y = e.clientY - (r.top + r.height / 2);
        el.style.transform = 'translate(' + (x * 0.18).toFixed(1) + 'px,' + (y * 0.28).toFixed(1) + 'px)';
      });
      el.addEventListener('pointerleave', function () { el.style.transform = ''; });
    });
  }

  /* ---------- SCROLL: progress, nav pill, showcase tilt, timeline ---------- */
  var progress = $('#progress');
  var navLinks = $$('.nav__link'), pill = $('#nav-pill');
  var navTargets = navLinks.map(function (l) { return $(l.getAttribute('href')); });
  var timeline = $('#timeline'), tlItems = $$('.tl');
  var activeNav = -1, ticking = false;

  function movePill(i, force) {
    if (i === activeNav && !force) return;
    activeNav = i;
    navLinks.forEach(function (l, j) { l.classList.toggle('is-active', j === i); });
    if (i < 0) { pill.style.opacity = '0'; return; }
    var l = navLinks[i];
    pill.style.width = l.offsetWidth + 'px';
    pill.style.transform = 'translateX(' + l.offsetLeft + 'px)';
    pill.style.opacity = '1';
  }
  function onScroll(force) {
    ticking = false;
    var y = window.scrollY, vh = window.innerHeight;
    var max = document.documentElement.scrollHeight - vh;
    progress.style.transform = 'scaleX(' + (max > 0 ? y / max : 0) + ')';

    var line = vh * 0.4, idx = -1;
    navTargets.forEach(function (t, i) { if (t && t.getBoundingClientRect().top <= line) idx = i; });
    if (max > 0 && y >= max - 4) idx = navTargets.length - 1;
    movePill(idx, force === true);

    if (browser && !reduced) {
      var r = showcase.getBoundingClientRect();
      browser.style.setProperty('--tilt', clamp((r.top - vh * 0.18) / (vh * 0.7), 0, 1).toFixed(3));
    }
    if (timeline) {
      var tr = timeline.getBoundingClientRect(), mid = vh * 0.62;
      timeline.style.setProperty('--p', clamp((mid - tr.top) / tr.height, 0, 1).toFixed(3));
      tlItems.forEach(function (it) { it.classList.toggle('is-passed', it.getBoundingClientRect().top + 30 < mid); });
    }
  }
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  window.addEventListener('resize', function () { onScroll(true); }, { passive: true });
  onScroll(true);
  fontsReady.then(function () { onScroll(true); });

  /* ---------- PUNE TIME ---------- */
  var puneEl = $('#pune-time');
  if (puneEl && window.Intl) {
    var tfmt = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Kolkata', hour: 'numeric', minute: '2-digit', hour12: true });
    var tick = function () { puneEl.textContent = tfmt.format(new Date()).replace(/\s?(AM|PM)/, function (m) { return ' ' + m.trim().toLowerCase(); }) + ' IST'; };
    tick(); setInterval(tick, 30000);
  }

  /* ---------- COPY EMAIL ---------- */
  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text);
    return new Promise(function (res, rej) {
      var ta = document.createElement('textarea');
      ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      try { if (document.execCommand('copy')) res(); else rej(); } catch (e) { rej(e); }
      document.body.removeChild(ta);
    });
  }
  function copyEmail(btn) {
    if (!contactAddress) return;
    copyText(contactAddress).then(function () {
      toast('Email copied to clipboard');
      if (btn) { btn.classList.add('is-copied'); setTimeout(function () { btn.classList.remove('is-copied'); }, 1800); }
    }, function () { window.location.href = 'mailto:' + contactAddress; });
  }
  $$('[data-copy]').forEach(function (b) { b.addEventListener('click', function () { copyEmail(b); }); });

  /* ---------- COMMAND MENU ---------- */
  var cmdk = $('#cmdk'), cmdInput = $('#cmdk-input'), cmdList = $('#cmdk-list');
  var isMac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
  var hint = $('#cmdk-hint'); if (hint) hint.textContent = isMac ? '⌘ K' : 'Ctrl K';
  var go = function (sel) { return function () { var t = $(sel); if (t) t.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' }); }; };
  var open = function (url) { return function () { window.open(url, '_blank', 'noopener'); }; };
  var commands = [
    { g: 'Go to', label: 'FinTwin AI', icon: 'i-arrow', run: go('#fintwin'), k: 'product flagship case study' },
    { g: 'Go to', label: 'Open source', icon: 'i-merge', run: go('#open-source'), k: 'elasticsearch lucene pr' },
    { g: 'Go to', label: 'Selected work', icon: 'i-arrow', run: go('#work'), k: 'projects forge bluewren' },
    { g: 'Go to', label: 'Research papers', icon: 'i-file', run: go('#research'), k: 'ieee publications' },
    { g: 'Go to', label: 'About and journey', icon: 'i-arrow', run: go('#about'), k: 'experience education timeline' },
    { g: 'Go to', label: 'Stack', icon: 'i-arrow', run: go('#stack'), k: 'skills tech' },
    { g: 'Go to', label: 'Contact', icon: 'i-mail', run: go('#contact'), k: 'hire email message' },
    { g: 'Actions', label: 'Open the FinTwin live demo', icon: 'i-out', run: open('https://fintwin-web-171222129367.asia-south1.run.app'), k: 'try demo' },
    { g: 'Actions', label: 'Copy email address', icon: 'i-copy', run: function () { copyEmail(); }, k: 'mail' },
    { g: 'Actions', label: 'Download résumé', icon: 'i-down', run: open('Syed_MohammadSaad_Resume.pdf'), k: 'resume cv pdf' },
    { g: 'Actions', label: 'Download full CV', icon: 'i-down', run: open('SyedMohammadSaad_CV.pdf'), k: 'resume cv pdf' },
    { g: 'Actions', label: 'GitHub profile', icon: 'i-github', run: open('https://github.com/SYEDMDSAAD'), k: 'code' },
    { g: 'Actions', label: 'LinkedIn profile', icon: 'i-linkedin', run: open('https://www.linkedin.com/in/syedmdsaad/'), k: 'connect' },
    { g: 'Actions', label: 'Switch light / dark theme', icon: 'i-sun', run: toggleTheme, k: 'mode colour color' }
  ];
  var filtered = commands, cmdIdx = 0, lastFocus = null;

  function renderCmds() {
    var q = cmdInput.value.trim().toLowerCase();
    filtered = commands.filter(function (c) { return !q || (c.label + ' ' + c.k + ' ' + c.g).toLowerCase().indexOf(q) !== -1; });
    cmdIdx = clamp(cmdIdx, 0, Math.max(0, filtered.length - 1));
    cmdList.innerHTML = '';
    if (!filtered.length) { cmdList.innerHTML = '<li class="cmdk__empty">Nothing matches that.</li>'; return; }
    var group = '';
    filtered.forEach(function (c, i) {
      if (c.g !== group) {
        group = c.g;
        var h = document.createElement('li'); h.className = 'cmdk__group'; h.textContent = group; h.setAttribute('role', 'presentation');
        cmdList.appendChild(h);
      }
      var li = document.createElement('li');
      li.className = 'cmdk__item' + (i === cmdIdx ? ' is-active' : '');
      li.setAttribute('role', 'option');
      li.setAttribute('aria-selected', String(i === cmdIdx));
      li.innerHTML = '<svg class="ic"><use href="#' + c.icon + '"/></svg><span></span><small>↵</small>';
      li.querySelector('span').textContent = c.label;
      li.addEventListener('mousemove', function () { if (cmdIdx !== i) { cmdIdx = i; paintActive(); } });
      li.addEventListener('click', function () { runCmd(i); });
      cmdList.appendChild(li);
    });
  }
  function paintActive() {
    $$('.cmdk__item', cmdList).forEach(function (li, i) {
      li.classList.toggle('is-active', i === cmdIdx); li.setAttribute('aria-selected', String(i === cmdIdx));
      if (i === cmdIdx) li.scrollIntoView({ block: 'nearest' });
    });
  }
  function openCmd() {
    lastFocus = document.activeElement;
    cmdk.hidden = false; cmdInput.value = ''; cmdIdx = 0; renderCmds();
    document.body.style.overflow = 'hidden';
    setTimeout(function () { cmdInput.focus(); }, 10);
  }
  function closeCmd() {
    cmdk.hidden = true; document.body.style.overflow = '';
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  function runCmd(i) { var c = filtered[i]; if (!c) return; closeCmd(); setTimeout(c.run, 30); }

  $('#cmdk-open').addEventListener('click', openCmd);
  $$('[data-close]', cmdk).forEach(function (el) { el.addEventListener('click', closeCmd); });
  cmdInput.addEventListener('input', function () { cmdIdx = 0; renderCmds(); });
  cmdInput.addEventListener('keydown', function (e) {
    var n = Math.max(1, filtered.length);
    if (e.key === 'ArrowDown') { e.preventDefault(); cmdIdx = (cmdIdx + 1) % n; paintActive(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); cmdIdx = (cmdIdx - 1 + n) % n; paintActive(); }
    else if (e.key === 'Enter') { e.preventDefault(); runCmd(cmdIdx); }
  });
  document.addEventListener('keydown', function (e) {
    var tag = (e.target && e.target.tagName) || '';
    var typing = /INPUT|TEXTAREA|SELECT/.test(tag) || (e.target && e.target.isContentEditable);
    if ((e.metaKey || e.ctrlKey) && (e.key || '').toLowerCase() === 'k') { e.preventDefault(); if (cmdk.hidden) openCmd(); else closeCmd(); return; }
    if (e.key === 'Escape') { if (!cmdk.hidden) closeCmd(); else if (menu.classList.contains('is-open')) setMenu(false); return; }
    if (e.key === '/' && !typing && cmdk.hidden) { e.preventDefault(); openCmd(); }
  });

  /* ---------- CONTACT FORM ---------- */
  var form = $('#contact-form'), submit = $('#cf-submit'), label = $('.btn__label', submit);
  var FORM_ENDPOINT = 'https://portfoliobackend-2-or8q.onrender.com/contact';
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var fields = [$('#cf-name'), $('#cf-email'), $('#cf-msg')], ok = true;
    fields.forEach(function (f) {
      var good = f.checkValidity() && f.value.trim() !== '';
      f.classList.toggle('is-invalid', !good);
      if (!good && ok) { f.focus(); ok = false; }
    });
    if (!ok) { toast('Please fill in every field with a valid value.', 'error'); return; }
    var orig = label.textContent;
    submit.disabled = true; label.textContent = 'Sending…';
    fetch(FORM_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: fields[0].value.trim(), email: fields[1].value.trim(), message: fields[2].value.trim() })
    }).then(function (res) {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.json().catch(function () { return {}; });
    }).then(function (data) {
      toast(data.message || "Thanks, your message is on its way. I'll reply soon.");
      form.reset();
    }).catch(function () {
      toast("Couldn't send that. Please use the email address above instead.", 'error');
    }).then(function () { submit.disabled = false; label.textContent = orig; });
  });
  $$('input, textarea', form).forEach(function (f) { f.addEventListener('input', function () { f.classList.remove('is-invalid'); }); });

  /* ---------- YEAR ---------- */
  var year = $('#year'); if (year) year.textContent = new Date().getFullYear();
})();
