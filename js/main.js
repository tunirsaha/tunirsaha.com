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

  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const lerp = (a, b, t) => a + (b - a) * t;

  /* shared scroll velocity → ticker boost */
  let boost = 1;

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
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach(e => { if (!e.isIntersecting) return; fire(e.target); obs.unobserve(e.target); });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    targets.forEach(el => io.observe(el));
    /* FAILSAFE: nothing stays hidden */
    setTimeout(() => targets.forEach(el => { if (!el.classList.contains('is-in')) fire(el); }), 4000);
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
    rail.addEventListener('touchstart', () => { paused = true; }, { passive: true });
  }

  /* ── mission log accordion (height tween via CSS transition) ── */
  function initAccordion() {
    const items = $$('[data-acc]'); if (!items.length) return;
    const expand = it => {
      const b = $('.acc__body', it);
      it.classList.add('open'); $('.acc__hd', it).setAttribute('aria-expanded', 'true');
      b.style.height = b.scrollHeight + 'px';
      b.addEventListener('transitionend', function f(e) {
        if (e.propertyName !== 'height') return;
        if (it.classList.contains('open')) b.style.height = 'auto';
        b.removeEventListener('transitionend', f);
      });
    };
    const collapse = it => {
      const b = $('.acc__body', it);
      it.classList.remove('open'); $('.acc__hd', it).setAttribute('aria-expanded', 'false');
      b.style.height = b.scrollHeight + 'px';
      void b.offsetHeight;                           // force reflow: auto → px → 0 animates
      b.style.height = '0px';
    };
    items.forEach((it, i) => {
      const hd = $('.acc__hd', it), body = $('.acc__body', it);
      if (body && !body.id) body.id = `acc-body-${i}`;
      hd.setAttribute('aria-controls', body.id);
      hd.setAttribute('aria-expanded', it.classList.contains('open') ? 'true' : 'false');
      hd.addEventListener('click', () => {
        const open = it.classList.contains('open');
        items.forEach(o => { if (o !== it && o.classList.contains('open')) collapse(o); });
        open ? collapse(it) : expand(it);
      });
    });
  }

  /* ── lab panel ── */
  function initLab() {
    const lab = $('.lab'), panel = $('#expPanel'); if (!lab) return;
    const f = { name: $('#expPanelName'), desc: $('#expPanelDesc'), st: $('#expPanelSt'), stack: $('#expPanelStack'), link: $('#expPanelLink') };
    let cur = null;

    /* the panel is authored after .lab, which is right for the 2- and 3-column
       grids: it spans the full width below every card. stacked on one column it
       is wrong - tap the first card and the detail opens past the last one, with
       no visible connection to what you tapped. so while the grid is stacked,
       move the panel to sit directly under the active card instead. */
    const homeParent = panel.parentNode, homeNext = panel.nextSibling;
    const stacked = matchMedia('(max-width: 767px)');
    const place = () => {
      if (cur && stacked.matches) { if (cur.nextElementSibling !== panel) cur.after(panel); }
      else if (panel.parentNode !== homeParent) homeParent.insertBefore(panel, homeNext);
    };
    (stacked.addEventListener ? stacked.addEventListener.bind(stacked, 'change') : stacked.addListener.bind(stacked))(place);

    const close = () => {
      panel.classList.remove('open', 'in'); panel.setAttribute('aria-hidden', 'true');
      $$('.exp').forEach(e => { e.classList.remove('active'); e.setAttribute('aria-expanded', 'false'); });
      cur = null;
      place();
    };
    $$('[data-exp]').forEach(btn => {
      btn.setAttribute('aria-controls', 'expPanel');
      btn.setAttribute('aria-expanded', 'false');
      btn.addEventListener('click', () => {
      if (cur === btn) { close(); return; }
      $$('.exp').forEach(e => { e.classList.remove('active'); e.setAttribute('aria-expanded', 'false'); });
      btn.classList.add('active'); btn.setAttribute('aria-expanded', 'true'); cur = btn;
      place();
      f.name.textContent = $('.exp__name', btn).textContent;
      f.st.textContent = btn.dataset.status; f.desc.textContent = btn.dataset.desc; f.stack.textContent = btn.dataset.stack;
      if (f.link) {
        const url = btn.dataset.url || '';
        f.link.href = url;
        f.link.hidden = !url;
      }
      panel.classList.remove('in');
      panel.classList.add('open');
      panel.setAttribute('aria-hidden', 'false');
      requestAnimationFrame(() => requestAnimationFrame(() => panel.classList.add('in')));
      });
    });
    $('#expClose').addEventListener('click', close);
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

  /* ── GitHub contribution heatmap ── */
  async function initGitHub() {
    const grid = $('#ghGrid'), total = $('#ghTotal'); if (!grid) return;
    try {
      const data = await getJSON(`https://github-contributions-api.jogruber.de/v4/${GITHUB_USER}?y=last`);
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
      countTo(total, sum, { dur: 1400, fmt: v => `${v.toLocaleString()} contributions / 1y` });
    } catch (e) {
      total.textContent = 'graph unavailable';
      grid.innerHTML = '<span class="sig__err mono">Couldn\'t reach GitHub - view profile ↗</span>';
    }
  }

  /* ── LeetCode stats ── */
  async function initLeetCode() {
    const settle = () => { const s = $('#lcStats'); if (s) s.setAttribute('aria-busy', 'false'); };
    const set = (id, v) => { const el = $(id); if (!el) return; el.classList.remove('skel');
      typeof v === 'number' ? countTo(el, v) : el.textContent = v; };
    const pick = (a, b) => (a != null ? a : b);
    const endpoints = [
      `https://alfa-leetcode-api.onrender.com/userProfile/${LEETCODE_USER}`,
      `https://leetcode-stats-api.herokuapp.com/${LEETCODE_USER}`
    ];
    for (let i = 0; i < endpoints.length; i++) {
      try {
        const d = await getJSON(endpoints[i], 12000);
        const total = pick(d.totalSolved, d.solvedProblem);
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
    initReveals(); initMarquee(); initAccordion(); initLab();
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
