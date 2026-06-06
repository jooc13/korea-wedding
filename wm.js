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
    game:     { icon:'🕹️', title:'Get to the Altar',      short:'Altar',         w:754, url:'game.html'   },
    browser:  { icon:'🌐', title:'Web Browser',           short:'Browser',       w:700                   },
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

  /* ── openBrowser(id) — retro two-page browser ────────────────── */
  function openBrowser(id, prog, area, top, left) {
    const pages = [
      { label: 'glitrsoep.substack.com', url: 'https://glitrsoep.substack.com/', preview: 'glitrsoep-preview.jpg' },
      { label: 'joochung.substack.com',   url: 'https://joochung.substack.com',   preview: 'joochung-preview.jpg'  }
    ];
    let curIdx = 0;

    const NAV = 'background:#d4d0c8;border:none;padding:2px 7px;font-family:Tahoma,"MS Sans Serif",Arial,sans-serif;font-size:10px;cursor:pointer;color:#000;box-shadow:inset 1px 1px 0 #fff,inset -1px -1px 0 #808080;white-space:nowrap;';
    const NAV_DIS = NAV + 'opacity:.45;cursor:default;';
    const GO = 'background:#d4d0c8;border-style:solid;border-width:1px;border-color:#dfdfdf #808080 #808080 #dfdfdf;padding:0 10px;height:18px;box-sizing:border-box;font-family:Tahoma,"MS Sans Serif",Arial,sans-serif;font-size:10px;cursor:pointer;color:#000;white-space:nowrap;font-weight:bold;';
    const BM  = 'background:#d4d0c8;border:none;padding:0 6px;height:17px;font-family:Tahoma,"MS Sans Serif",Arial,sans-serif;font-size:10px;cursor:pointer;color:#000;box-shadow:inset 1px 1px 0 #fff,inset -1px -1px 0 #808080;white-space:nowrap;';
    const BM_ON = 'background:#c8c4bc;border:none;padding:0 6px;height:17px;font-family:Tahoma,"MS Sans Serif",Arial,sans-serif;font-size:10px;cursor:pointer;color:#000;box-shadow:inset 1px 1px 0 #606060,inset -1px -1px 0 #fff;white-space:nowrap;';

    const el = document.createElement('div');
    el.className = 'window wm-window';
    el.id = 'wm-' + id;
    el.style.cssText =
      `position:absolute;top:${top}px;left:${left}px;` +
      `width:${Math.min(prog.w, area.clientWidth - 40)}px;` +
      `height:${Math.min(520, Math.round(area.clientHeight * 0.82))}px;` +
      `display:flex;flex-direction:column;z-index:${nextZ()};overflow:hidden;`;

    el.innerHTML =
      `<div class="title-bar wm-tb">` +
        `<span class="title-bar-text">🌐 Web Browser</span>` +
        `<div class="title-bar-controls">` +
          `<button class="title-btn wm-btn-min" title="Minimize">_</button>` +
          `<button class="title-btn wm-btn-max" title="Maximize">□</button>` +
          `<button class="title-btn wm-btn-cls" title="Close">✕</button>` +
        `</div>` +
      `</div>` +
      `<div style="background:#d4d0c8;padding:2px 4px;display:flex;align-items:center;gap:3px;border-bottom:1px solid #808080;flex-shrink:0;">` +
        `<button class="br-back" style="${NAV_DIS}" disabled>◀ Back</button>` +
        `<button class="br-fwd"  style="${NAV_DIS}" disabled>Fwd ▶</button>` +
        `<div style="width:1px;height:20px;background:#888;margin:0 2px;flex-shrink:0;"></div>` +
        `<span style="font-size:11px;font-family:Tahoma,Arial,sans-serif;color:#000;flex-shrink:0;white-space:nowrap;">Address</span>` +
        `<div class="br-addr" style="flex:1;min-width:0;background:#fff;height:18px;` +
          `box-shadow:inset 1px 1px 0 #808080,inset -1px -1px 0 #dfdfdf;` +
          `padding:0 4px;font-size:10px;display:flex;align-items:center;` +
          `font-family:'Courier New',monospace;overflow:hidden;white-space:nowrap;color:#000;"></div>` +
        `<button class="br-go" style="${GO}">Go</button>` +
      `</div>` +
      `<div style="background:#c0bdb5;padding:1px 6px;display:flex;align-items:center;gap:3px;border-bottom:1px solid #808080;flex-shrink:0;">` +
        `<span style="font-size:10px;font-family:Tahoma,Arial,sans-serif;color:#444;flex-shrink:0;margin-right:2px;">Links:</span>` +
        `<button class="br-bm" data-idx="0" style="${BM_ON}">📰 glitrsoep.substack.com</button>` +
        `<button class="br-bm" data-idx="1" style="${BM}">📰 joochung.substack.com</button>` +
      `</div>` +
      /* Screenshot preview — clicking opens real page in new tab */
      `<div class="br-content" style="flex:1;overflow:hidden;display:flex;flex-direction:column;min-height:0;position:relative;cursor:pointer;" title="Click to open in new tab">` +
        `<img class="br-preview" src="" alt="" draggable="false" ` +
          `style="width:100%;height:100%;object-fit:cover;object-position:top left;display:block;user-select:none;"/>` +
        /* hover overlay */
        `<div class="br-hint" style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;` +
          `background:rgba(0,0,0,0);transition:background .18s;pointer-events:none;">` +
          `<span class="br-hint-label" style="background:rgba(0,0,0,0.72);color:#fff;padding:8px 18px;` +
            `font-family:Tahoma,Arial,sans-serif;font-size:13px;letter-spacing:.3px;` +
            `opacity:0;transition:opacity .18s;white-space:nowrap;">↗ Open in new tab</span>` +
        `</div>` +
      `</div>` +
      `<div class="status-bar wm-status" style="display:flex;padding:0;flex-shrink:0;">` +
        `<span class="status-segment br-status" style="flex:1;">Ready</span>` +
        `<span class="status-segment" style="width:90px;text-align:center;border-left:1px solid #808080;">Internet</span>` +
      `</div>`;

    area.appendChild(el);

    const previewImg = el.querySelector('.br-preview');
    const hintBox    = el.querySelector('.br-hint');
    const hintLabel  = el.querySelector('.br-hint-label');
    const contentDiv = el.querySelector('.br-content');
    const addrDiv    = el.querySelector('.br-addr');
    const statusSeg  = el.querySelector('.br-status');
    const backBtn    = el.querySelector('.br-back');
    const fwdBtn     = el.querySelector('.br-fwd');
    const bmBtns     = el.querySelectorAll('.br-bm');

    /* Hover overlay */
    contentDiv.addEventListener('mouseenter', () => {
      hintBox.style.background = 'rgba(0,0,0,0.18)';
      hintLabel.style.opacity = '1';
    });
    contentDiv.addEventListener('mouseleave', () => {
      hintBox.style.background = 'rgba(0,0,0,0)';
      hintLabel.style.opacity = '0';
    });

    /* Click → new tab */
    contentDiv.addEventListener('click', () => { window.open(pages[curIdx].url, '_blank'); });

    function setNavBtn(btn, enabled) {
      btn.disabled = !enabled;
      btn.style.cssText = enabled ? NAV : NAV_DIS;
    }

    function navigate(idx) {
      curIdx = idx;
      const page = pages[idx];
      addrDiv.textContent = page.url;
      statusSeg.textContent = 'Done';
      previewImg.src = page.preview;
      setNavBtn(backBtn, idx > 0);
      setNavBtn(fwdBtn, idx < pages.length - 1);
      bmBtns.forEach((b, i) => { b.style.cssText = (i === idx) ? BM_ON : BM; });
    }

    backBtn.addEventListener('click', () => { if (curIdx > 0) navigate(curIdx - 1); });
    fwdBtn.addEventListener('click',  () => { if (curIdx < pages.length - 1) navigate(curIdx + 1); });
    bmBtns.forEach((b, i) => b.addEventListener('click', () => navigate(i)));
    el.querySelector('.br-go').addEventListener('click', () => { window.open(pages[curIdx].url, '_blank'); });

    const titleBar = el.querySelector('.wm-tb');
    el.querySelector('.wm-btn-min').addEventListener('click', e => { e.stopPropagation(); minimize(id); });
    el.querySelector('.wm-btn-max').addEventListener('click', e => { e.stopPropagation(); toggleMax(id); });
    el.querySelector('.wm-btn-cls').addEventListener('click', e => { e.stopPropagation(); close(id); });
    el.addEventListener('mousedown', () => bringToFront(id));
    makeDraggable(el, titleBar, id);
    titleBar.addEventListener('dblclick', e => { if (e.target.tagName !== 'BUTTON') toggleMax(id); });

    wins[id] = { el, bodyEl: contentDiv, statusEl: el.querySelector('.wm-status'), state: 'open', prevCSS: null };
    navigate(0);
    bringToFront(id);
    refreshTaskbar();
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

    if (id === 'browser') { openBrowser(id, prog, area, top, left); return; }

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
    /* Re-raise all inline popups above regular windows, preserving their order */
    if (!id.startsWith('inline-')) {
      Object.keys(wins)
        .filter(k => k.startsWith('inline-'))
        .sort((a, b) => (parseInt(wins[a].el.style.zIndex) || 0) - (parseInt(wins[b].el.style.zIndex) || 0))
        .forEach(k => { wins[k].el.style.zIndex = nextZ(); });
    }
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
    delete inlineMeta[id];
    refreshTaskbar();
  }

  /* ── Drag ─────────────────────────────────────────────────────── */
  let _drag = null; // shared drag state — one mousemove/mouseup handler for all windows

  document.addEventListener('mousemove', e => {
    if (!_drag) return;
    const area = da();
    const nx = Math.max(-_drag.el.offsetWidth + 80, Math.min(area.clientWidth  - 40,  e.clientX - _drag.ox));
    const ny = Math.max(0,                           Math.min(area.clientHeight - 18,  e.clientY - _drag.oy));
    _drag.el.style.left = nx + 'px';
    _drag.el.style.top  = ny + 'px';
  });

  document.addEventListener('mouseup', () => { _drag = null; });

  function makeDraggable(el, handle, id) {
    handle.addEventListener('mousedown', e => {
      if (e.target.tagName === 'BUTTON') return;
      if (wins[id] && wins[id].state === 'maximized') return;
      _drag = { el, ox: e.clientX - el.offsetLeft, oy: e.clientY - el.offsetTop };
      bringToFront(id);
      e.preventDefault();
    });
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
    const openInlineCount = Object.keys(wins).filter(k => k.startsWith('inline-')).length;

    const el = document.createElement('div');
    el.className = 'window wm-window';
    el.id = 'wm-' + id;
    el.style.cssText =
      `position:absolute;top:-9999px;left:-9999px;` +
      `width:${w}px;visibility:hidden;` +
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

    /* Measure actual rendered size, then position correctly */
    const aw = el.offsetWidth;
    const ah = el.offsetHeight;
    let top, left;
    if (openInlineCount === 0) {
      top  = Math.max(20, Math.round((area.clientHeight - ah) / 2));
      left = Math.max(40, Math.round((area.clientWidth  - aw) / 2));
    } else {
      const off = (openInlineCount % MAX_C) * STEP;
      top  = Math.max(20, Math.round((area.clientHeight - ah) / 2) + off);
      left = Math.max(40, Math.round((area.clientWidth  - aw) / 2) + off);
    }
    el.style.top        = top  + 'px';
    el.style.left       = left + 'px';
    el.style.visibility = '';

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
