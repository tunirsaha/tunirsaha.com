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
    const lines = ['> TUNIRSAHA.COM', '> LOADING PORTFOLIO ... OK', '> PREPARING INTERFACE ... OK', '> CONNECTING LIVE FEEDS ... OK'];
    lines.forEach((l, i) => setTimeout(() => {
      const s = document.createElement('span'); s.textContent = l; boot.appendChild(s);
    }, 150 + i * 280));
    const t0 = performance.now(), dur = 1200;
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
    if (!('IntersectionObserver' in window)) { targets.forEach(fire); return; }
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
    if (!GS) return;
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
      /* parallax: the hero name runs ahead of the page, the portrait lags it,
         and each section's second title line slides in from the right as it nears */
      if (matchMedia('(min-width: 768px)').matches) {
        const hero = { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: .6 };
        GS.to('.hero__name', { y: -70, ease: 'none', scrollTrigger: hero });
        GS.to('.hero__art', { y: 60, ease: 'none', scrollTrigger: hero });
      }
      /* section headers drift a little against the scroll, same idea as the hero name.
         on the head wrapper, so it never fights the title's own rise-and-fade reveal */
      GS.utils.toArray('.block:not(.contact) .block__head').forEach(el => {
        GS.fromTo(el, { y: 34 }, { y: -34, ease: 'none',
          scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: .6 } });
      });
      /* the closing "LET'S BUILD." gets the same drift. it is the last thing on the
         page, so the range ends earlier (the page runs out before it reaches the top) */
      GS.fromTo('.contact__big', { y: 34 }, { y: -34, ease: 'none',
        scrollTrigger: { trigger: '.contact__big', start: 'top bottom', end: 'bottom 45%', scrub: .6 } });
      GS.utils.toArray('.block__title-2').forEach(el => {
        GS.fromTo(el, { x: 70 }, { x: 0, ease: 'none',
          scrollTrigger: { trigger: el, start: 'top bottom', end: 'top 45%', scrub: .8 } });
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
        allowed. touch visitors get the static page ── */
  function initInteractive() {
    if (!GS || !matchMedia('(hover: hover) and (pointer: fine)').matches) return;
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
    /* capability cards: the spotlight (CSS) follows the pointer */
    $$('.cap').forEach(c => c.addEventListener('pointermove', e => {
      const r = c.getBoundingClientRect();
      c.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      c.style.setProperty('--my', (e.clientY - r.top) + 'px');
    }));
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

  /* ── ticker: drifts left on its own, speeds up with page scroll, and can be
        grabbed. let go mid-swipe and it keeps its momentum, then eases back to
        the drift. it leans (skew) in the direction it is moving, by its speed ── */
  function initMarquee() {
    const track = $('[data-marquee]'); if (!track) return;
    const rail = track.parentElement;
    const BASE = 80, clamp = (v, a, b) => Math.max(a, Math.min(b, v));
    let w = 0, x = 0, v = -BASE, last = performance.now();
    let dragging = false, hover = false, px = 0, pt = 0, pv = 0;
    const measure = () => { w = track.scrollWidth / 2; };
    measure();
    addEventListener('resize', measure);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);

    const tick = t => {
      const dt = Math.min((t - last) / 1000, .05); last = t;
      if (!dragging) {
        /* velocity eases toward the drift (0 while hovered); k sets how long a fling lasts */
        const target = hover ? 0 : -BASE * boost;
        v += (target - v) * (1 - Math.exp(-dt * 1.4));
        x += v * dt;
      }
      boost = lerp(boost, 1, .04);
      if (w) x = -((((-x) % w) + w) % w);
      const sk = clamp(-(v + BASE) * .006, -8, 8);
      track.style.transform = `translate3d(${x}px,0,0) skewX(${sk}deg)`;
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);

    rail.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') hover = true; });
    rail.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse') hover = false; });
    rail.addEventListener('pointerdown', e => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      dragging = true; px = e.clientX; pt = performance.now(); pv = 0; v = 0;
      rail.setPointerCapture(e.pointerId);
    });
    rail.addEventListener('pointermove', e => {
      if (!dragging) return;
      const now = performance.now(), dx = e.clientX - px, dt = (now - pt) / 1000;
      x += dx;
      if (dt > 0) pv = lerp(pv, dx / dt, .4);   /* smoothed release velocity, px/s */
      px = e.clientX; pt = now;
    });
    const release = () => {
      if (!dragging) return;
      dragging = false;
      /* a pause before letting go means no fling */
      v = performance.now() - pt > 90 ? 0 : clamp(pv, -4500, 4500);
    };
    rail.addEventListener('pointerup', release);
    rail.addEventListener('pointercancel', release);
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
    if (!art || !cv || !wide.matches) return;
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

      /* work in device pixels, straight into an RGBA buffer: no per-dot fillStyle
         strings, so the dots can be as fine as ~1 css px (2 device px) and the
         settled mosaic is the photo itself, resampled 1:1, not an approximation.
         the CSS box is object-fit:cover at 50% 0, mirrored here. */
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const Wd = Math.round(art.clientWidth * dpr), Hd = Math.round(art.clientHeight * dpr);
      cv.width = Wd; cv.height = Hd;
      const sd = Math.max(Wd / src.w, Hd / src.h);
      const oxd = (Wd - src.w * sd) / 2;
      const B = 2, bs = B / sd;                       /* block edge: device px, and the source px it spans */
      const cols = Math.ceil(Wd / B), rows = Math.ceil(Hd / B);
      const cap = cols * rows;
      const X = new Float32Array(cap), Y = new Float32Array(cap), SX = new Float32Array(cap),
            SY = new Float32Array(cap), D = new Float32Array(cap), C = new Uint32Array(cap);
      let n = 0;
      for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
        const bx = c * B, by = r * B;
        const x0 = Math.floor((bx - oxd) / sd), y0 = Math.floor(by / sd);
        const x1 = Math.min(Math.max(x0 + 1, Math.ceil((bx - oxd) / sd + bs)), src.w), y1 = Math.min(Math.max(y0 + 1, Math.ceil(by / sd + bs)), src.h);
        if (x0 < 0 || y0 < 0 || x0 >= src.w || y0 >= src.h) continue;
        let R = 0, G = 0, Bl = 0, A = 0, k = 0;
        for (let yy = y0; yy < y1; yy++) for (let xx = x0; xx < x1; xx++) {
          const i = (yy * src.w + xx) * 4, al = src.px[i + 3];
          R += src.px[i] * al; G += src.px[i + 1] * al; Bl += src.px[i + 2] * al; A += al; k++;
        }
        if (!A || A / k < 128) continue;
        X[n] = bx; Y[n] = by;
        SX[n] = Math.random() * Wd * 1.6 - Wd * 0.3;   /* start from everywhere, incl. just off-canvas */
        SY[n] = Math.random() * Hd * 1.6 - Hd * 0.3;
        D[n] = Math.random() * 700;                      /* per-dot start delay, ms */
        C[n] = (255 << 24) | (Math.round(Bl / A) << 16) | (Math.round(G / A) << 8) | Math.round(R / A);   /* little-endian ABGR */
        n++;
      }

      const m = getComputedStyle(art).backgroundColor.match(/[\d.]+/g) || [237, 234, 226];
      const bgc = (255 << 24) | (+m[2] << 16) | (+m[1] << 8) | +m[0];
      const ctx = cv.getContext('2d');
      const img = ctx.createImageData(Wd, Hd), buf = new Uint32Array(img.data.buffer);
      const DUR = 1700;
      const t0 = performance.now();
      art.classList.remove('is-settling'); cv.style.cssText = '';
      art.classList.add('is-assembling');
      const frame = t => {
        if (mine !== run) return;
        const k = t - t0;
        buf.fill(bgc);
        let done = true;
        for (let i = 0; i < n; i++) {
          const q = Math.min(Math.max((k - D[i]) / DUR, 0), 1);
          let px, py;
          if (q >= 1) { px = X[i]; py = Y[i]; }
          else {
            done = false;
            const e = q < .5 ? 4 * q * q * q : 1 - Math.pow(-2 * q + 2, 3) / 2;   /* ease-in-out cubic */
            px = (SX[i] + (X[i] - SX[i]) * e) | 0; py = (SY[i] + (Y[i] - SY[i]) * e) | 0;
          }
          if (px < 0 || py < 0 || px + B > Wd || py + B > Hd) {
            if (px + B <= 0 || py + B <= 0 || px >= Wd || py >= Hd) continue;
          }
          const col = C[i];
          for (let dy = 0; dy < B; dy++) {
            const yy = py + dy; if (yy < 0 || yy >= Hd) continue;
            for (let dx = 0; dx < B; dx++) { const xx = px + dx; if (xx >= 0 && xx < Wd) buf[yy * Wd + xx] = col; }
          }
        }
        ctx.putImageData(img, 0, 0);
        if (done) {
          /* hand over to the real photo by fading the mosaic out over it, not a hard swap */
          art.classList.remove('is-assembling'); art.classList.add('is-settling');
          cv.style.transition = 'opacity .6s ease';
          requestAnimationFrame(() => { cv.style.opacity = '0'; });
          setTimeout(() => { if (mine === run) { art.classList.remove('is-settling'); cv.style.cssText = ''; } }, 700);
          return;
        }
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

  /* ── smooth anchor scroll (native) ── */
  function goTo(t) {
    const el = typeof t === 'string' ? $(t) : t; if (!el) return;
    el.scrollIntoView({ behavior: 'smooth' });
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
      document.body.classList.toggle('scrolled', s > 600);
      boost = 1 + Math.min(Math.abs(s - last) * .05, 7);
      last = s;
      prog.style.width = (s / (document.documentElement.scrollHeight - innerHeight) * 100) + '%';
    }, { passive: true });
    $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
      const id = a.getAttribute('href'); if (id.length > 1 && $(id)) { e.preventDefault(); goTo(id); }
    }));
    /* the brand slot doubles as a section indicator: the TS mark stays, the label
       beside it follows whichever section is under the header */
    const lab = $('#secLabel');
    if (lab && 'IntersectionObserver' in window) {
      const names = { arsenal: '01 / BUILD', missions: '02 / EXPERIENCE', telemetry: '03 / LIVE STATS', lab: '04 / LAB',
                      dossier: '05 / CREDENTIALS', resume: '06 / RESUME', contact: '07 / CONTACT' };
      let cur = lab.textContent, t;
      const show = txt => {
        if (txt === cur) return; cur = txt;
        lab.classList.add('swap'); clearTimeout(t);
        t = setTimeout(() => { lab.textContent = txt; lab.classList.remove('swap'); }, 220);
      };
      const io = new IntersectionObserver(es => es.forEach(e => {
        if (e.isIntersecting) show(names[e.target.id] || '00 / HOME');
      }), { rootMargin: '-45% 0px -50% 0px' });
      $$('main > section[id], main > .hero, main section.block[id]').forEach(el => io.observe(el));
      const hero = $('.hero'); if (hero) io.observe(hero);
    }
    $('#yr').textContent = new Date().getFullYear();
  }

  /* ── hero readout: years / months / days since Oct 2014 ── */
  function initSys() {
    const up = $('#upYears');
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
        [...grid.children].forEach((c, i) => { c.style.animationDelay = Math.floor(i / 7) * 14 + 'ms'; });
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
    initReveals(); initGsap(); initInteractive(); initMarquee(); initAccordion(); initFlip(); initPortrait();
    initLoader(); initSys(); initConsoleNote();
    initGitHub(); initLeetCode(); initChess(); initResume();
    /* hero facts count up on reveal */
    const facts = $('.hero__facts');
    if (facts) {
      if (!('IntersectionObserver' in window)) runCounters(facts);
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
