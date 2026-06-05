/* ═══════════════════════════════════════════════════════════════════
   WeddingOS 95 — Window Manager
   Handles: open, close, minimize, maximize/restore, drag, z-ordering,
            taskbar button generation, content loading via fetch.
   ═══════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ── Program registry ─────────────────────────────────────────── */
  const PROGS = {
    calendar: { icon:'📅', title:'Calendar',               short:'Calendar',        w:598, url:'theweekend.html' },
    todo:     { icon:'📋', title:'To-Do List',            short:'To-Do List',      w:400, url:'todo.html' },
    travel:   { icon:'✈️', title:'Travel — Seoul',       short:'Travel',          w:676, url:'travel.html'   },
    contacts: { icon:'📒', title:'Contacts',              short:'Contacts',        w:494, url:'contacts.html' },
    staying:  { icon:'🇰🇷',title:'Staying Around?',      short:'Staying Around?', w:598, url:'staying.html'  },
    mail:     { icon:'✉️', title:'Mail',                  short:'Mail',           w:598, url:'mail.html'   },
    photos:   { icon:'📷', title:'Photos',                short:'Photos',         w:728, url:'photos.html' },
    game:     { icon:'🕹️', title:'QWOP: Get to the Altar', short:'QWOP',          w:754, url:'game.html'   },
  };

  /* ── State ────────────────────────────────────────────────────── */
  let zTop     = 60;
  let cascade  = 0;
  const STEP   = 24;
  const MAX_C  = 7;
  const wins   = {};  // id → { el, bodyEl, statusEl, state, prevCSS }
  const loaded = new Set(); // tracks which page styles have been injected

  /* ── DOM shortcuts ────────────────────────────────────────────── */
  const da  = () => document.querySelector('.desktop-area');
  const tb  = () => document.querySelector('.taskbar');
  const clk = () => document.querySelector('.taskbar-clock');

  /* ── Z-order helpers ──────────────────────────────────────────── */
  function nextZ() { return ++zTop; }

  function topWinId() {
    let maxZ = -1, tid = null;
    for (const [id, w] of Object.entries(wins)) {
      if (w.state === 'minimized') continue;
      const z = parseInt(w.el.style.zIndex) || 0;
      if (z > maxZ) { maxZ = z; tid = id; }
    }
    return tid;
  }

  /* ── open(id) ─────────────────────────────────────────────────── */
  function open(id) {
    const prog = PROGS[id];
    if (!prog) return;

    /* Already exists → restore or focus */
    if (wins[id]) {
      if (wins[id].state === 'minimized') restore(id);
      else bringToFront(id);
      return;
    }

    /* Cascade / center position */
    const area = da();
    let top, left;
    const off = (cascade % MAX_C) * STEP;
    top  = 20 + off;
    left = 50 + off;
    cascade++;

    /* Build window element */
    const el = document.createElement('div');
    el.className = 'window wm-window';
    el.id = 'wm-' + id;
    el.style.cssText =
      `position:absolute;top:${top}px;left:${left}px;` +
      `width:${Math.min(prog.w, area.clientWidth - 40)}px;` +
      `max-height:calc(100% - ${top + 8}px);` +
      `display:flex;flex-direction:column;z-index:${nextZ()};`;

    el.innerHTML = `
      <div class="title-bar wm-tb">
        <span class="title-bar-text">${prog.icon} ${prog.title}</span>
        <div class="title-bar-controls">
          <button class="title-btn wm-btn-min" title="Minimize">_</button>
          <button class="title-btn wm-btn-max" title="Maximize">□</button>
          <button class="title-btn wm-btn-cls" title="Close">✕</button>
        </div>
      </div>
      <div class="menu-bar">
        <span class="menu-item">File</span>
        <span class="menu-item">View</span>
        <span class="menu-item">Help</span>
      </div>
      <div class="window-body wm-body" style="flex:1;overflow-y:auto;min-height:60px;"></div>
      <div class="status-bar wm-status">
        <span class="status-segment">${prog.short}</span>
      </div>`;

    area.appendChild(el);

    const bodyEl   = el.querySelector('.wm-body');
    const statusEl = el.querySelector('.wm-status');
    const titleBar = el.querySelector('.wm-tb');

    /* Button wiring */
    el.querySelector('.wm-btn-min').addEventListener('click', e => { e.stopPropagation(); minimize(id); });
    el.querySelector('.wm-btn-max').addEventListener('click', e => { e.stopPropagation(); toggleMax(id); });
    el.querySelector('.wm-btn-cls').addEventListener('click', e => { e.stopPropagation(); close(id); });

    /* Focus on any mousedown inside window */
    el.addEventListener('mousedown', () => bringToFront(id));

    /* Drag by title bar */
    makeDraggable(el, titleBar, id);

    /* Double-click title bar → toggle maximize */
    titleBar.addEventListener('dblclick', e => {
      if (e.target.tagName !== 'BUTTON') toggleMax(id);
    });

    wins[id] = { el, bodyEl, statusEl, state: 'open', prevCSS: null };

    loadContent(id, prog, bodyEl, statusEl);
    bringToFront(id);
    refreshTaskbar();
  }

  /* ── Content loading ──────────────────────────────────────────── */
  function loadContent(id, prog, bodyEl, statusEl) {
    /* Fetch from separate page */
    if (prog.url) {
      bodyEl.innerHTML = '<p class="stub-note" style="padding:8px 0;">Loading…</p>';
      fetch(prog.url + '?wm=1', { cache: 'no-cache' })
        .then(r => r.text())
        .then(html => {
          const doc = new DOMParser().parseFromString(html, 'text/html');

          /* Inject page-specific <style> tags once */
          if (!loaded.has(id)) {
            doc.querySelectorAll('style').forEach(s => {
              const tag = document.createElement('style');
              tag.textContent = s.textContent;
              tag.dataset.wmSrc = id;
              document.head.appendChild(tag);
            });
            loaded.add(id);
          }

          const wb = doc.querySelector('.window-body');
          const sb = doc.querySelector('.status-bar .status-segment');
          if (wb) {
            bodyEl.innerHTML = wb.innerHTML;
            /* Run any init scripts embedded in the page body */
            wb.querySelectorAll('script[data-wm-init]').forEach(s => {
              const tag = document.createElement('script');
              tag.textContent = s.textContent;
              document.body.appendChild(tag);
              document.body.removeChild(tag);
            });
          }
          if (sb) statusEl.innerHTML = `<span class="status-segment">${sb.textContent}</span>`;
          bodyEl.scrollTop = 0;
        })
        .catch(() => {
          bodyEl.innerHTML = '<p class="stub-note">Unable to load content.</p>';
        });
    }
  }

  /* ── bringToFront ─────────────────────────────────────────────── */
  function bringToFront(id) {
    if (!wins[id]) return;
    wins[id].el.style.zIndex = nextZ();
    refreshTaskbar();
  }

  /* ── minimize ─────────────────────────────────────────────────── */
  function minimize(id) {
    const w = wins[id];
    if (!w || w.state === 'minimized') return;
    w.preMinState = w.state;   // remember 'open' or 'maximized'
    w.el.style.display = 'none';
    w.state = 'minimized';
    refreshTaskbar();
  }

  /* ── restore ──────────────────────────────────────────────────── */
  function restore(id) {
    const w = wins[id];
    if (!w) return;
    const prev = w.preMinState || 'open';
    delete w.preMinState;
    w.el.style.display = 'flex';
    w.state = prev;
    const maxBtn = w.el.querySelector('.wm-btn-max');
    if (maxBtn) maxBtn.textContent = (prev === 'maximized') ? '❐' : '□';
    bringToFront(id);
  }

  /* ── toggleMax ────────────────────────────────────────────────── */
  function toggleMax(id) {
    const w = wins[id];
    if (!w) return;
    const maxBtn = w.el.querySelector('.wm-btn-max');
    if (w.state === 'maximized') {
      w.el.style.cssText = w.prevCSS;
      w.state = 'open';
      if (maxBtn) maxBtn.textContent = '□';
    } else {
      w.prevCSS = w.el.style.cssText;
      const area = da();
      w.el.style.cssText =
        `position:absolute;top:0;left:0;` +
        `width:${area.clientWidth}px;height:${area.clientHeight}px;` +
        `max-height:${area.clientHeight}px;` +
        `display:flex;flex-direction:column;z-index:${nextZ()};`;
      w.state = 'maximized';
      if (maxBtn) maxBtn.textContent = '❐';
    }
    refreshTaskbar();
  }

  /* ── close ────────────────────────────────────────────────────── */
  function close(id) {
    const w = wins[id];
    if (!w) return;
    w.el.remove();
    delete wins[id];
    refreshTaskbar();
  }

  /* ── Drag ─────────────────────────────────────────────────────── */
  function makeDraggable(el, handle, id) {
    let dragging = false, ox = 0, oy = 0;

    handle.addEventListener('mousedown', e => {
      if (e.target.tagName === 'BUTTON') return;
      if (wins[id] && wins[id].state === 'maximized') return;
      dragging = true;
      ox = e.clientX - el.offsetLeft;
      oy = e.clientY - el.offsetTop;
      bringToFront(id);
      e.preventDefault();
    });

    document.addEventListener('mousemove', e => {
      if (!dragging) return;
      const area = da();
      /* Clamp: title bar must stay in visible area */
      const nx = Math.max(-el.offsetWidth + 80, Math.min(area.clientWidth  - 40,  e.clientX - ox));
      const ny = Math.max(0,                    Math.min(area.clientHeight - 18,  e.clientY - oy));
      el.style.left = nx + 'px';
      el.style.top  = ny + 'px';
    });

    document.addEventListener('mouseup', () => { dragging = false; });
  }

  /* ── openInline(title, html, opts) ───────────────────────────── */
  const inlineMeta = {};

  function openInline(title, html, opts) {
    opts = opts || {};
    const id   = 'inline-' + Date.now();
    const icon = opts.icon   || '⚠️';
    const w    = opts.width  || 300;
    const h    = opts.height || 160;

    inlineMeta[id] = { icon, short: title };

    const area = da();
    let top, left;
    if (opts.center) {
      top  = Math.max(20, Math.round((area.clientHeight - h) / 2));
      left = Math.max(40, Math.round((area.clientWidth  - w) / 2));
    } else {
      const off = (cascade % MAX_C) * STEP;  cascade++;
      top  = Math.max(20, Math.round((area.clientHeight - h) / 2) + off);
      left = Math.max(40, Math.round((area.clientWidth  - w) / 2) + off);
    }

    const el = document.createElement('div');
    el.className = 'window wm-window';
    el.id = 'wm-' + id;
    el.style.cssText =
      `position:absolute;top:${top}px;left:${left}px;` +
      `width:${w}px;` +
      `display:flex;flex-direction:column;z-index:${nextZ()};`;

    const showMM  = !opts.noMinMax;
    const onClose = opts.onClose || null;

    el.innerHTML =
      `<div class="title-bar wm-tb">` +
        `<span class="title-bar-text">${icon} ${title}</span>` +
        `<div class="title-bar-controls">` +
          (showMM ? `<button class="title-btn wm-btn-min" title="Minimize">_</button>` : '') +
          (showMM ? `<button class="title-btn wm-btn-max" title="Maximize">□</button>` : '') +
          `<button class="title-btn wm-btn-cls" title="Close">✕</button>` +
        `</div>` +
      `</div>` +
      `<div class="window-body wm-body" style="flex:1;overflow:hidden;min-height:${h}px;">${html}</div>`;

    area.appendChild(el);

    const titleBar = el.querySelector('.wm-tb');
    if (showMM) {
      el.querySelector('.wm-btn-min').addEventListener('click', e => { e.stopPropagation(); minimize(id); });
      el.querySelector('.wm-btn-max').addEventListener('click', e => { e.stopPropagation(); toggleMax(id); });
    }
    el.querySelector('.wm-btn-cls').addEventListener('click', e => {
      e.stopPropagation();
      if (onClose) onClose(id); else close(id);
    });
    el.addEventListener('mousedown', () => bringToFront(id));
    makeDraggable(el, titleBar, id);
    titleBar.addEventListener('dblclick', e => { if (e.target.tagName !== 'BUTTON') toggleMax(id); });

    wins[id] = { el, bodyEl: el.querySelector('.wm-body'), statusEl: null, state: 'open', prevCSS: null };
    bringToFront(id);
    refreshTaskbar();
    return id;
  }

  /* ── refreshTaskbar ─────────────────────────────────────────── */
  function refreshTaskbar() {
    const taskbar = tb();
    const clock   = clk();
    taskbar.querySelectorAll('.taskbar-task').forEach(b => b.remove());
    const tid = topWinId();

    function addBtn(id, icon, short) {
      const w   = wins[id];
      const btn = document.createElement('button');
      btn.className   = 'taskbar-task';
      btn.textContent = icon + ' ' + short;
      const isActive  = (id === tid && w.state !== 'minimized');
      if (isActive) {
        btn.style.boxShadow = 'inset 1px 1px 0 #404040,inset 2px 2px 0 #808080,inset -1px -1px 0 #fff,inset -2px -2px 0 #e8e8e8';
        btn.style.background = '#bdbdbd';
      }
      btn.addEventListener('click', () => {
        const cur = wins[id];
        if (!cur) return;
        if (cur.state === 'minimized') restore(id);
        else if (isActive)             minimize(id);
        else                           bringToFront(id);
      });
      taskbar.insertBefore(btn, clock);
    }

    for (const [id] of Object.entries(wins)) {
      if (PROGS[id])       addBtn(id, PROGS[id].icon, PROGS[id].short);
      else if (inlineMeta[id]) addBtn(id, inlineMeta[id].icon, inlineMeta[id].short);
    }
  }

  /* ── Public API ───────────────────────────────────────────────── */
  window.WM = { open, close, minimize, restore, toggleMax, openInline };


})();
