/* ═══════════════════════════════════════════════════════════
   TUNIR SAHA - brutalist runtime · zero dependencies
   every animation below is hand-rolled rAF / CSS transitions
   ═══════════════════════════════════════════════════════════ */
(() => {
  'use strict';

  /* ── CONFIG - drop your handles here ── */
  const GITHUB_USER = 'tunirsaha';
  const LEETCODE_USER = 'sahatunir';
  const CHESS_USER = 'tunirsaha';

  /* set pre-paint by the head script: OS reduce-motion, or the footer switch */
  const RM = document.documentElement.classList.contains('reduce-motion');
  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const lerp = (a, b, t) => a + (b - a) * t;

  /* shared scroll velocity → ticker boost */
  let boost = 1;

  /* GSAP is optional: when it loads, it owns the scroll reveals (initGsap);
     when it does not, the IntersectionObserver path in initReveals still runs */
  const GS = window.gsap && window.ScrollTrigger ? window.gsap : null;
  const afterBoot = fn => {
    if (document.body.classList.contains('booted')) { fn(); return; }
    new MutationObserver((m, o) => {
      if (document.body.classList.contains('booted')) { o.disconnect(); fn(); }
    }).observe(document.body, { attributes: true, attributeFilter: ['class'] });
  };

  /* ── theme ── */
  function initTheme() {
    const root = document.documentElement, meta = $('meta[name="theme-color"]');
    const C = { light: '#edeae2', dark: '#15151c' };
    const apply = t => { root.setAttribute('data-theme', t); if (meta) meta.setAttribute('content', C[t]); };
    apply(root.getAttribute('data-theme') || 'light');
    const btn = $('#themer');
    if (btn) btn.addEventListener('click', () => {
      const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      apply(next); try { localStorage.setItem('theme', next); } catch (e) {}
    });
  }

  /* ── count-up ── */
  function countTo(el, target, { dur = 1100, pad = 0, suffix = '', fmt = null } = {}) {
    const out = v => fmt ? fmt(v) : String(v).padStart(pad, '0') + suffix;
    if (RM) { el.textContent = out(target); return; }
    const t0 = performance.now();
    const step = t => {
      const p = Math.min((t - t0) / dur, 1);
      const e = 1 - Math.pow(1 - p, 3);
      el.textContent = out(Math.round(target * e));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  /* ── loader / boot sequence ── */
  function initLoader() {
    const loader = $('#loader'), fill = $('#loaderFill'), pct = $('#loaderPct'), boot = $('#loaderBoot');
    const done = () => {
      document.body.classList.remove('is-loading');
      document.body.classList.add('booted');
      loader.classList.add('done');
      const hide = () => { loader.style.display = 'none'; };
      loader.addEventListener('transitionend', hide, { once: true });
      setTimeout(hide, 1200);                        // failsafe
    };
    if (RM) { fill.style.width = '100%'; pct.textContent = '100'; done(); return; }
    const lines = ['> TUNIRSAHA.COM', '> LOADING PORTFOLIO ... OK', '> PREPARING INTERFACE ... OK', '> CONNECTING LIVE FEEDS ... OK'];
    lines.forEach((l, i) => setTimeout(() => {
      const s = document.createElement('span'); s.textContent = l; boot.appendChild(s);
    }, 150 + i * 280));
    const t0 = performance.now(), dur = 1650;
    const step = t => {
      const p = Math.min((t - t0) / dur, 1);
      const e = p < .5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
      fill.style.width = e * 100 + '%';
      pct.textContent = String(Math.round(e * 100)).padStart(2, '0');
      p < 1 ? requestAnimationFrame(step) : setTimeout(done, 180);
    };
    requestAnimationFrame(step);
  }

  /* ── reveals (IntersectionObserver, fail-safe) ── */
  function initReveals() {
    $$('[data-wipe]').forEach(el => {
      el.style.position = 'relative';
      const cover = document.createElement('span');
      cover.className = 'wipe-cover'; cover.dataset.cover = '1';
      el.appendChild(cover);
    });
    const fire = el => {
      el.classList.add('is-in');
      const cover = el.querySelector('[data-cover]');
      if (cover) { cover.classList.add('out'); setTimeout(() => cover.remove(), 800); }
      if (el.hasAttribute('data-countup')) runCounters(el);
    };
    const targets = $$('[data-reveal], [data-stagger], [data-wipe], [data-countup]');
    if (!('IntersectionObserver' in window) || RM) { targets.forEach(fire); return; }
    /* GSAP reveals these itself (initGsap); the observer keeps the rest */
    const ioTargets = targets.filter(el => !(GS && gsapOwns(el)));
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach(e => { if (!e.isIntersecting) return; fire(e.target); obs.unobserve(e.target); });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    ioTargets.forEach(el => io.observe(el));
    /* no timed fallback here: a timer revealed every section on load, before the
       reader scrolled to it. the observer reveals each block as it arrives */
  }
  /* the hero portrait keeps its own observer: its canvas must start when visible */
  const gsapOwns = el => el.matches('[data-stagger], [data-reveal]:not(.hero__art)');

  /* ── GSAP motion: each reveal is a tween fired by ScrollTrigger, once.
        starts after the loader lifts, so the first block is seen, not hidden ── */
  function initGsap() {
    if (!GS || RM) return;   /* reduced motion: CSS/observer path only */
    /* html.gsap turns off the CSS reveal transitions: GSAP writes these
       properties every frame, and a CSS transition on top would lag them */
    document.documentElement.classList.add('gsap');
    GS.registerPlugin(ScrollTrigger);
    afterBoot(() => {
      /* single elements: rise and fade. hero items get a short lead-in */
      GS.utils.toArray('[data-reveal]:not(.hero__art)').forEach(el => {
        GS.fromTo(el, { y: 28, opacity: 0 }, {
          y: 0, opacity: 1, duration: 1, ease: 'power3.out',
          delay: el.closest('.hero') ? .25 : 0,
          onComplete: () => el.classList.add('revealed'),
          scrollTrigger: { trigger: el, start: 'top 88%', once: true }
        });
      });
      /* lists: children cascade in. cards and rows share one motion */
      GS.utils.toArray('[data-stagger]').forEach(list => {
        const kids = [...list.children], st = { trigger: list, start: 'top 85%', once: true };
        GS.fromTo(kids, { y: 24, x: 0, opacity: 0 }, {
          y: 0, x: 0, opacity: 1, duration: .8, stagger: .09, ease: 'power3.out',
          onComplete: () => kids.forEach(k => k.classList.add('revealed')),
          scrollTrigger: st
        });
        /* lab and signal cards stamp their hard shadow on as they land.
           the shadow is cleared afterwards so the :hover shadow still works */
        if (list.matches('.live, .lab')) {
          const rest = getComputedStyle(kids[0]).boxShadow;
          GS.fromTo(kids, { boxShadow: rest.replace(/[\d.]+px/g, '0px') }, {
            boxShadow: rest, duration: .6, stagger: .09, ease: 'power3.out',
            clearProps: 'boxShadow', scrollTrigger: st
          });
        }
        /* capability tags drop in once their card has landed */
        if (list.matches('.caps')) {
          GS.fromTo(list.querySelectorAll('.cap__tags li'), { y: 6, opacity: 0 }, {
            y: 0, opacity: 1, duration: .5, stagger: .015, delay: .3, ease: 'power3.out',
            scrollTrigger: st
          });
        }
      });
    });
  }

  /* ── pointer interaction (GSAP quickTo): only with a fine pointer and motion
        allowed. touch and reduced-motion visitors get the static page ── */
  function initInteractive() {
    if (!GS || RM || !matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    /* magnetic controls drift a fraction of the way toward the pointer */
    GS.utils.toArray('.topbar__cta, .themer, .rsm__btn, .contact__link').forEach(el => {
      el.classList.add('magnetic');
      const x = GS.quickTo(el, 'x', { duration: .45, ease: 'power3.out' });
      const y = GS.quickTo(el, 'y', { duration: .45, ease: 'power3.out' });
      el.addEventListener('pointermove', e => {
        const r = el.getBoundingClientRect();
        x((e.clientX - r.left - r.width / 2) * .22);
        y((e.clientY - r.top - r.height / 2) * .22);
      });
      el.addEventListener('pointerleave', () => { x(0); y(0); });
    });
    /* the halftone portrait tilts a few degrees toward the pointer */
    const fig = $('.hero__art');
    if (fig) {
      /* reset the reveal's translateY(12px) first, or GSAP keeps it as the rest position */
      GS.set(fig, { x: 0, y: 0, transformPerspective: 900, transformOrigin: '50% 50%' });
      const rx = GS.quickTo(fig, 'rotationX', { duration: .7, ease: 'power3.out' });
      const ry = GS.quickTo(fig, 'rotationY', { duration: .7, ease: 'power3.out' });
      fig.addEventListener('pointermove', e => {
        const r = fig.getBoundingClientRect();
        ry(((e.clientX - r.left) / r.width - .5) * 8);
        rx(-((e.clientY - r.top) / r.height - .5) * 8);
      });
      fig.addEventListener('pointerleave', () => { rx(0); ry(0); });
    }
  }

  function runCounters(scope) {
    $$('[data-count]', scope).forEach(el =>
      countTo(el, +el.dataset.count, { pad: +(el.dataset.pad || 0), suffix: el.dataset.suffix || '' }));
  }

  /* ── ticker (rAF marquee, scroll-velocity reactive) ── */
  function initMarquee() {
    const track = $('[data-marquee]'); if (!track || RM) return;
    const rail = track.parentElement;
    let w = 0, x = 0, last = performance.now(), paused = false;
    const measure = () => { w = track.scrollWidth / 2; };
    measure();
    addEventListener('resize', measure);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
    const tick = t => {
      const dt = Math.min((t - last) / 1000, .05); last = t;
      if (!paused) {
        x -= 80 * boost * dt;
        if (w && -x >= w) x += w;
        track.style.transform = `translateX(${x}px)`;
        boost = lerp(boost, 1, .04);
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);

    /* pause auto-scroll + let user drag/scroll the rail manually */
    rail.addEventListener('mouseenter', () => { paused = true; });
    rail.addEventListener('mouseleave', () => { paused = false; dragging = false; });
    let dragging = false, startX = 0, startScroll = 0;
    rail.addEventListener('mousedown', e => {
      dragging = true; paused = true;
      startX = e.pageX; startScroll = rail.scrollLeft;
    });
    addEventListener('mouseup', () => { dragging = false; });
    rail.addEventListener('mousemove', e => {
      if (!dragging) return;
      e.preventDefault();
      rail.scrollLeft = startScroll - (e.pageX - startX);
    });
    /* touch has no mouseleave to resume on, so the pause has to be released
       explicitly - without this the first tap froze the ticker for the rest of
       the visit. the delay lets momentum scrolling settle before the transform
       starts moving again, otherwise the two fight each other under the finger. */
    let resume;
    rail.addEventListener('touchstart', () => { paused = true; clearTimeout(resume); }, { passive: true });
    const unpause = () => { clearTimeout(resume); resume = setTimeout(() => { paused = false; }, 900); };
    rail.addEventListener('touchend', unpause, { passive: true });
    rail.addEventListener('touchcancel', unpause, { passive: true });
  }

  /* ── mission log accordion (height tween via CSS transition) ── */
  function initAccordion() {
    const items = $$('[data-acc]'); if (!items.length) return;
    /* the CSS tweens grid-template-rows, so open/close is just the class */
    const setOpen = (it, on) => {
      it.classList.toggle('open', on); $('.acc__hd', it).setAttribute('aria-expanded', on ? 'true' : 'false');
    };
    items.forEach((it, i) => {
      const hd = $('.acc__hd', it), body = $('.acc__body', it);
      if (body && !body.id) body.id = `acc-body-${i}`;
      hd.setAttribute('aria-controls', body.id);
      hd.setAttribute('aria-expanded', it.classList.contains('open') ? 'true' : 'false');
      hd.addEventListener('click', () => {
        const open = it.classList.contains('open');
        items.forEach(o => { if (o !== it && o.classList.contains('open')) setOpen(o, false); });
        setOpen(it, !open);
      });
    });
  }

  /* ── hero portrait: halftone dots fly in from everywhere and settle into the
        photo. runs once the loader clears and again on every theme switch, using
        that theme's PNG. the dots are sampled from the same file the <img> shows,
        so when they land the real image takes over with nothing visibly changing.
        a canvas read on file:// is tainted, so the catch leaves the static image. */
  function initPortrait() {
    const art = $('.hero__art'), cv = $('.hero__art-canvas');
    const wide = matchMedia('(min-width: 768px)');
    if (!art || !cv || RM || !wide.matches) return;
    const ctx = cv.getContext('2d');
    const cache = {};
    let run = 0;

    /* decode once per file: RGBA pixels of the native 900x1040 PNG */
    const load = src => cache[src] || (cache[src] = new Promise((ok, no) => {
      const img = new Image();
      img.onload = () => {
        try {
          const c = document.createElement('canvas');
          c.width = img.naturalWidth; c.height = img.naturalHeight;
          const x = c.getContext('2d', { willReadFrequently: true });
          x.drawImage(img, 0, 0);
          ok({ w: c.width, h: c.height, px: x.getImageData(0, 0, c.width, c.height).data });
        } catch (e) { no(e); }
      };
      img.onerror = no;
      img.src = src;
    }));

    /* only assemble while the photo is on screen, so the reader sees the whole
       gather. a theme switch made off-screen waits until the photo scrolls in. */
    let visible = false, pending = false;
    const assemble = async () => {
      if (!visible) { pending = true; return; }
      const mine = ++run;
      const dark = document.documentElement.getAttribute('data-theme') === 'dark';
      const srcEl = $(dark ? '.hero__art-dark source' : '.hero__art picture:not(.hero__art-dark) source');
      let src;
      try { src = await load(srcEl.getAttribute('srcset')); } catch (e) { return; }
      if (mine !== run) return;

      /* the CSS box is object-fit:cover, object-position 50% 0 - mirror that mapping */
      const W = art.clientWidth, H = art.clientHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      cv.width = W * dpr; cv.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const s = Math.max(W / src.w, H / src.h);
      const ox = (W - src.w * s) / 2;
      /* one dot per ~3 css px: dense enough to read as the halftone, light enough
         to animate ~10k squares a frame */
      const step = Math.max(1, Math.round(3 / s));
      const dots = [];
      for (let y = 0; y < src.h; y += step) for (let x = 0; x < src.w; x += step) {
        const i = (y * src.w + x) * 4;
        if (src.px[i + 3] < 128) continue;
        dots.push({
          x: ox + x * s, y: y * s, sz: step * s,
          c: `rgb(${src.px[i]},${src.px[i + 1]},${src.px[i + 2]})`,
          sx: Math.random() * W * 1.6 - W * 0.3,   /* start from everywhere, incl. just off-canvas */
          sy: Math.random() * H * 1.6 - H * 0.3,
          d: Math.random() * 700                    /* per-dot start delay, ms */
        });
      }

      const bg = getComputedStyle(art).backgroundColor;
      const DUR = 1700;
      const t0 = performance.now();
      art.classList.add('is-assembling');
      const frame = t => {
        if (mine !== run) return;
        const k = t - t0;
        ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
        let done = true;
        for (const p of dots) {
          const q = Math.min(Math.max((k - p.d) / DUR, 0), 1);
          if (q < 1) done = false;
          const e = q < .5 ? 4 * q * q * q : 1 - Math.pow(-2 * q + 2, 3) / 2;   /* ease-in-out cubic */
          ctx.fillStyle = p.c;
          ctx.fillRect(p.sx + (p.x - p.sx) * e, p.sy + (p.y - p.sy) * e, p.sz, p.sz);
        }
        if (done) { art.classList.remove('is-assembling'); return; }
        requestAnimationFrame(frame);
      };
      requestAnimationFrame(frame);
    };

    new IntersectionObserver(es => {
      visible = es[0].isIntersecting;
      if (visible && pending) { pending = false; assemble().catch(() => {}); }
    }, { threshold: 0.35 }).observe(art);

    /* wait for the loader to lift, so the first assembly is seen, not hidden */
    const whenBooted = fn => {
      if (document.body.classList.contains('booted')) { fn(); return; }
      new MutationObserver((m, o) => {
        if (document.body.classList.contains('booted')) { o.disconnect(); fn(); }
      }).observe(document.body, { attributes: true, attributeFilter: ['class'] });
    };
    whenBooted(() => { assemble().catch(() => {}); });
    new MutationObserver(() => { assemble().catch(() => {}); })
      .observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  }

  /* ── lab cards: each card flips in place to show its detail on the back.
        the faces are inert while hidden, so only the visible face is reachable ── */
  function initFlip() {
    $$('[data-card]').forEach(card => {
      const front = $('.exp__front', card), back = $('.exp__back', card);
      const open = $('[data-flip-open]', front), close = $('[data-flip-close]', back);
      const set = on => {
        card.classList.toggle('is-flipped', on);
        open.setAttribute('aria-expanded', on ? 'true' : 'false');
        front.toggleAttribute('inert', on); back.toggleAttribute('inert', !on);
      };
      set(false);
      open.addEventListener('click', () => { set(true); close.focus(); });
      close.addEventListener('click', () => { set(false); open.focus(); });
    });
  }

  /* ── footer switch: flips the reduce-motion override and reloads, so every
        tween and observer is set up again from scratch ── */
  function initMotion() {
    const btn = $('#motionToggle'); if (!btn) return;
    btn.textContent = `MOTION: ${RM ? 'OFF' : 'ON'}`;
    btn.setAttribute('aria-pressed', RM ? 'false' : 'true');
    btn.addEventListener('click', () => {
      try { localStorage.setItem('motion', RM ? 'on' : 'off'); } catch (e) {}
      location.reload();
    });
  }

  /* ── smooth anchor scroll (native) ── */
  function goTo(t) {
    const el = typeof t === 'string' ? $(t) : t; if (!el) return;
    el.scrollIntoView({ behavior: RM ? 'auto' : 'smooth' });
  }

  /* ── mobile menu ── */
  function initMenu() {
    const burger = $('#burger'), menu = $('#mmenu'); if (!burger) return;
    const inertBg = [$('main'), $('footer')].filter(Boolean);
    const links = $$('[data-mlink]', menu);
    const set = on => {
      document.body.classList.toggle('menu-open', on);
      burger.setAttribute('aria-expanded', on); menu.setAttribute('aria-hidden', !on);
      inertBg.forEach(el => on ? el.setAttribute('inert', '') : el.removeAttribute('inert'));
      /* the closed menu is only translated off-screen, so its eight links stayed in
         the tab order under aria-hidden="true" — the exact pairing axe flags as
         aria-hidden-focus. inert is the same tool already used on main/footer, just
         pointed the other way. order matters at both ends: uninert before focusing
         into the menu, and move focus out to the burger before inerting it, since
         focus() is a no-op inside an inert subtree. */
      if (on) { menu.removeAttribute('inert'); if (links[0]) links[0].focus(); }
      else {
        if (document.activeElement && menu.contains(document.activeElement)) burger.focus();
        menu.setAttribute('inert', '');
      }
    };
    burger.addEventListener('click', () => set(!document.body.classList.contains('menu-open')));
    $$('[data-mlink]').forEach(a => a.addEventListener('click', e => {
      const id = a.getAttribute('href'); set(false);
      if ($(id)) { e.preventDefault(); setTimeout(() => goTo(id), 300); }
    }));
    addEventListener('keydown', e => {
      if (e.key === 'Escape') { set(false); return; }
      if (e.key !== 'Tab' || !document.body.classList.contains('menu-open') || !links.length) return;
      const first = links[0], last = links[links.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
  }

  /* ── nav + progress + scroll velocity ── */
  function initNav() {
    const bar = $('#topbar'), prog = $('#progress');
    let last = 0;
    addEventListener('scroll', () => {
      const s = scrollY;
      bar.classList.toggle('hide', s > last && s > 500);
      boost = 1 + Math.min(Math.abs(s - last) * .05, 7);
      last = s;
      prog.style.width = (s / (document.documentElement.scrollHeight - innerHeight) * 100) + '%';
    }, { passive: true });
    $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
      const id = a.getAttribute('href'); if (id.length > 1 && $(id)) { e.preventDefault(); goTo(id); }
    }));
    $('#yr').textContent = new Date().getFullYear();
  }

  /* ── hero system readout: IST clock, uptime, visit n° ── */
  function initSys() {
    const time = $('#sysTime'), up = $('#upYears');
    const tick = () => {
      /* IST regardless of where the visitor is - it's *my* clock */
      const ist = new Date(Date.now() + (330 + new Date().getTimezoneOffset()) * 60000);
      if (time) time.textContent = [ist.getHours(), ist.getMinutes(), ist.getSeconds()]
        .map(n => String(n).padStart(2, '0')).join(':');
    };
    tick(); setInterval(tick, 1000);
    if (up) {
      const f = () => {
        const a = new Date(2014, 9, 14), b = new Date();
        let y = b.getFullYear() - a.getFullYear();
        let m = b.getMonth() - a.getMonth();
        let d = b.getDate() - a.getDate();
        if (d < 0) { m--; d += new Date(b.getFullYear(), b.getMonth(), 0).getDate(); }
        if (m < 0) { y--; m += 12; }
        up.textContent = `${y}Y ${m}M ${d}D`;
      };
      f(); setInterval(f, 3600000);
    }
  }

  /* ── note for the people who look under the hood ── */
  function initConsoleNote() {
    try {
      console.log(
        '%c TUNIR SAHA - BUILD CONSOLE ',
        'background:#2436ff;color:#edeae2;font:bold 12px/2 monospace;',
        '\nYou opened devtools. Of course you did.' +
        '\nEverything here is hand-written - no frameworks, no build step, no template.' +
        '\nFound a bug? Tell me: sahatunir@gmail.com'
      );
    } catch (e) {}
  }

  /* ── fetch helper ── */
  async function getJSON(url, ms = 9000) {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), ms);
    try {
      const r = await fetch(url, { signal: ctrl.signal });
      if (!r.ok) throw new Error(r.status);
      return await r.json();
    } finally { clearTimeout(t); }
  }

  /* ── GitHub contribution heatmap, with year tabs (2019 to now, 2026 by default) ── */
  async function initGitHub() {
    const grid = $('#ghGrid'), total = $('#ghTotal'), tabs = $('#ghYears'); if (!grid) return;
    const now = new Date().getFullYear();
    const years = Array.from({ length: now - 2019 + 1 }, (_, i) => String(now - i));
    const render = async year => {
      total.textContent = '…';
      try {
        const data = await getJSON(`https://github-contributions-api.jogruber.de/v4/${GITHUB_USER}?y=${year}`);
        const days = data.contributions || [];
        if (!days.length) throw new Error('empty');
        grid.innerHTML = '';
        /* pad to weekday of first datapoint so columns align with real weeks */
        const offset = new Date(days[0].date + 'T00:00:00').getDay();
        for (let i = 0; i < offset; i++) grid.appendChild(Object.assign(document.createElement('span'), { className: 'gh__cell' }));
        let sum = 0;
        days.forEach(d => {
          sum += d.count || 0;
          const cell = document.createElement('span');
          cell.className = 'gh__cell';
          cell.dataset.lvl = d.level || 0;
          cell.title = `${d.date}: ${d.count} contribution${d.count === 1 ? '' : 's'}`;
          grid.appendChild(cell);
        });
        grid.setAttribute('aria-label', `GitHub contribution graph, ${year}`);
        countTo(total, sum, { dur: 1400, fmt: v => `${v.toLocaleString()} contributions / ${year}` });
      } catch (e) {
        total.textContent = 'graph unavailable';
        grid.innerHTML = '<span class="sig__err mono">Couldn\'t reach GitHub - view profile ↗</span>';
      }
    };
    if (tabs) {
      tabs.innerHTML = '';
      years.forEach(y => {
        const t = document.createElement('button');
        t.type = 'button'; t.className = 'gh__tab mono'; t.setAttribute('role', 'tab');
        t.textContent = y; t.dataset.year = y;
        t.setAttribute('aria-selected', y === String(now) ? 'true' : 'false');
        t.setAttribute('aria-controls', 'ghGrid');
        t.tabIndex = y === String(now) ? 0 : -1;
        t.addEventListener('click', () => select(t));
        /* arrow keys walk the tabs, as the tab pattern expects */
        t.addEventListener('keydown', e => {
          const i = [...tabs.children].indexOf(t);
          const next = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
          if (!next) return;
          e.preventDefault();
          const n = tabs.children[(i + next + tabs.children.length) % tabs.children.length];
          n.focus(); select(n);
        });
        tabs.appendChild(t);
      });
    }
    const select = t => {
      [...tabs.children].forEach(o => { const on = o === t; o.setAttribute('aria-selected', on ? 'true' : 'false'); o.tabIndex = on ? 0 : -1; });
      render(t.dataset.year);
    };
    render(String(now));
  }

  /* ── LeetCode stats ── */
  async function initLeetCode() {
    const settle = () => { const s = $('#lcStats'); if (s) s.setAttribute('aria-busy', 'false'); };
    const set = (id, v) => { const el = $(id); if (!el) return; el.classList.remove('skel');
      typeof v === 'number' ? countTo(el, v) : el.textContent = v; };
    const pick = (a, b) => (a != null ? a : b);
    /* the same endpoint twice, not two providers. it runs on a free tier that
       sleeps: the first request after an idle window spends most of a minute
       booting, so attempt one pays for the boot and aborts, and attempt two
       lands on a warm process. the second gets the longer budget because by
       then the only question is whether the boot finished.

       the old leetcode-stats-api.herokuapp.com fallback was removed rather than
       repaired — heroku ended its free tier and that host now answers 503 with
       no Access-Control-Allow-Origin. the browser reports the missing header
       instead of the status, so a dead fallback was surfacing in the console as
       a CORS failure on a site that never had one. */
    const url = `https://alfa-leetcode-api.onrender.com/userProfile/${LEETCODE_USER}`;
    for (const ms of [12000, 20000]) {
      try {
        const d = await getJSON(url, ms);
        const total = d.totalSolved;
        if (total == null) throw new Error('shape');
        set('#lcTotal', +total);
        set('#lcEasy', pick(d.easySolved, '-'));
        set('#lcMed', pick(d.mediumSolved, '-'));
        set('#lcHard', pick(d.hardSolved, '-'));
        const rank = $('#lcRank');
        d.ranking ? countTo(rank, +d.ranking, { dur: 1400, fmt: v => 'RANK #' + v.toLocaleString() })
                  : rank.textContent = 'PROFILE';
        settle();
        return;
      } catch (e) { /* try next */ }
    }
    ['#lcTotal', '#lcEasy', '#lcMed', '#lcHard'].forEach(id => set(id, '-'));
    $('#lcRank').textContent = 'OFFLINE';
    settle();
  }

  /* ── Chess.com ── */
  async function initChess() {
    const state = $('#chessState'), note = $('#chessNote');
    if (!CHESS_USER || !state) return;
    state.textContent = '…';
    try {
      const d = await getJSON(`https://api.chess.com/pub/player/${CHESS_USER}/stats`);
      const r = k => d[k] && d[k].last ? d[k].last.rating : null;
      [['#chRapid', 'chess_rapid'], ['#chBlitz', 'chess_blitz'], ['#chBullet', 'chess_bullet']].forEach(([id, k]) => {
        const el = $(id), v = r(k);
        v != null ? countTo(el, v) : el.textContent = '-';
      });
      state.textContent = 'LIVE';
      if (note) note.style.display = 'none';
    } catch (e) {
      state.textContent = 'OFFLINE';
      if (note) note.textContent = 'Chess.com unreachable right now.';
    }
  }



  /* ── resume download → GA event ── */
  function initResume() {
    $$('[data-resume]').forEach(a => a.addEventListener('click', () => {
      if (typeof gtag !== 'function') return;
      gtag('event', 'resume_download', {
        file_name: 'tunir-saha-resume.pdf',
        link_text: a.textContent.trim().replace(/\s+/g, ' ')
      });
    }));
  }

  /* ── boot ── */
  function boot() {
    initTheme(); initNav(); initMenu();
    initReveals(); initGsap(); initInteractive(); initMarquee(); initAccordion(); initFlip(); initMotion(); initPortrait();
    initLoader(); initSys(); initConsoleNote();
    initGitHub(); initLeetCode(); initChess(); initResume();
    /* hero facts count up on reveal */
    const facts = $('.hero__facts');
    if (facts) {
      if (!('IntersectionObserver' in window) || RM) runCounters(facts);
      else {
        const io = new IntersectionObserver((es, obs) => {
          es.forEach(e => { if (!e.isIntersecting) return; runCounters(e.target); obs.unobserve(e.target); });
        }, { threshold: 0.3 });
        io.observe(facts);
      }
    }
  }
  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', boot) : boot();
})();
