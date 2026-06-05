(function () {
  /* ── Styles ── */
  const S = document.createElement('style');
  S.textContent = `
.cof-up {
  position: fixed;
  bottom: 36px;
  right: 58px;
  z-index: 1001;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  user-select: none;
}
.cof-mug-img {
  height: 285px;
  width: auto;
  display: block;
  filter: drop-shadow(0px 8px 14px rgba(0,0,0,0.52)) drop-shadow(0px 2px 3px rgba(0,0,0,0.30));
}

/* Fallen cup */
.cof-down {
  position: fixed;
  bottom: 36px;
  right: 48px;
  z-index: 1001;
  display: none;
  user-select: none;
  pointer-events: none;
}
.cof-down-img {
  width: 440px;
  height: auto;
  display: block;
}

/* Spill puddle */
.cof-river {
  position: fixed;
  bottom: 0px;
  right: 0px;
  width: 500px;
  height: 230px;
  z-index: 1000;
  display: none;
  cursor: pointer;
  pointer-events: all;
}

/* Pool around monitor stand */
.cof-pool {
  position: fixed;
  bottom: 6px;
  left: 50%;
  transform: translateX(-50%);
  width: 170px;
  height: 46px;
  background: radial-gradient(ellipse, rgba(46,18,6,0.72) 0%, rgba(62,26,10,0.50) 55%, rgba(80,36,14,0.10) 100%);
  border-radius: 50%;
  z-index: 5;
  display: none;
  cursor: pointer;
  pointer-events: all;
}

.cof-up.cof-gone    { display: none; }
.cof-down.cof-show  { display: block; }
.cof-river.cof-show { display: block; }
.cof-pool.cof-show  { display: block; }

/* Empty state — cup back upright, drained */
.cof-up.cof-empty #c-coffee      { opacity: 0; }
.cof-up.cof-empty #c-shine       { opacity: 0; }
.cof-up.cof-empty #c-shine2      { opacity: 0; }
`;
  document.head.appendChild(S);

  const mugSVG = `<img class="cof-mug-img" alt="coffee mug" draggable="false">`;

  /* ─────────────────────────────────────────────────────────────
     FALLEN MUG — opening faces lower-left toward the spill
  ───────────────────────────────────────────────────────────── */
  const fallenSVG = `<img class="cof-down-img" alt="spilled coffee" draggable="false">`;

  /* ── Build DOM ── */
  const elUp = document.createElement('div');
  elUp.className = 'cof-up';
  elUp.id = 'cof-up';
  elUp.innerHTML = mugSVG;

  const elDown = document.createElement('div');
  elDown.className = 'cof-down';
  elDown.id = 'cof-down';
  elDown.innerHTML = fallenSVG;

  const elRiver = document.createElement('div');
  elRiver.className = 'cof-river';
  elRiver.id = 'cof-river';
  elRiver.innerHTML = ''; /* transparent click zone — spill photo is in elDown */

  const elPool = document.createElement('div');
  elPool.className = 'cof-pool';
  elPool.id = 'cof-pool';

  document.body.appendChild(elUp);

  /* ── Shared background-removal helper ──────────────────────────
     Pass 1: erase near-white achromatic pixels (the background).
     Pass 2 (×2): erase dark JPEG ringing artifacts — any dark pixel
       (sum < 160) where 5+ of its 8 neighbours are already transparent
       is an isolated artifact in the background, not real mug content.
  ────────────────────────────────────────────────────────────── */
  function removeBg(imgEl, src) {
    const loader = new Image();
    loader.onload = function () {
      const c = document.createElement('canvas');
      const W = c.width  = loader.width;
      const H = c.height = loader.height;
      const ctx = c.getContext('2d');
      ctx.drawImage(loader, 0, 0);
      const idata = ctx.getImageData(0, 0, W, H);
      const d = idata.data;
      const alpha = new Uint8Array(W * H);

      /* Pass 1 — white/near-white removal */
      for (let i = 0; i < d.length; i += 4) {
        const mx = Math.max(d[i], d[i+1], d[i+2]);
        const mn = Math.min(d[i], d[i+1], d[i+2]);
        if (d[i]+d[i+1]+d[i+2] > 710 && mx-mn < 22) {
          d[i+3] = 0; alpha[i>>2] = 0;
        } else {
          alpha[i>>2] = 255;
        }
      }

      /* Pass 2a — immediate-neighbour fringe (1-pixel radius)
         Dark-ish pixel (sum < 260) with 4+ of 8 neighbours transparent. */
      for (let pass = 0; pass < 3; pass++) {
        for (let y = 1; y < H-1; y++) {
          for (let x = 1; x < W-1; x++) {
            const p = y*W + x;
            if (alpha[p] === 0) continue;
            const i = p<<2;
            if (d[i]+d[i+1]+d[i+2] > 260) continue;
            let t = 0;
            if (alpha[(y-1)*W+(x-1)]===0) t++;
            if (alpha[(y-1)*W+ x   ]===0) t++;
            if (alpha[(y-1)*W+(x+1)]===0) t++;
            if (alpha[ y   *W+(x-1)]===0) t++;
            if (alpha[ y   *W+(x+1)]===0) t++;
            if (alpha[(y+1)*W+(x-1)]===0) t++;
            if (alpha[(y+1)*W+ x   ]===0) t++;
            if (alpha[(y+1)*W+(x+1)]===0) t++;
            if (t >= 4) { d[i+3] = 0; alpha[p] = 0; }
          }
        }
      }

      /* Pass 2b — inward JPEG ringing (5-pixel proximity radius)
         Very dark pixels (sum < 130) that sit within 5px of any
         transparent pixel are inward ringing artefacts at the mug
         boundary. Coffee deeper inside the mug is ≥10px from the
         edge and won't be touched. */
      for (let y = 0; y < H; y++) {
        for (let x = 0; x < W; x++) {
          const p = y*W + x;
          if (alpha[p] === 0) continue;
          const i = p<<2;
          if (d[i]+d[i+1]+d[i+2] > 130) continue;
          let near = false;
          const r = 5;
          outer: for (let dy = -r; dy <= r && !near; dy++) {
            for (let dx = -r; dx <= r && !near; dx++) {
              const ny = y+dy, nx = x+dx;
              if (ny >= 0 && ny < H && nx >= 0 && nx < W) {
                if (alpha[ny*W+nx] === 0) near = true;
              }
            }
          }
          if (near) { d[i+3] = 0; alpha[p] = 0; }
        }
      }

      ctx.putImageData(idata, 0, 0);
      imgEl.src = c.toDataURL('image/png');
    };
    loader.src = src;
  }

  elUp.querySelector('.cof-mug-img').src = 'annacoffeepic.png';

  document.body.appendChild(elDown);
  removeBg(elDown.querySelector('.cof-down-img'), 'coffee-spill.png');

  document.body.appendChild(elRiver);
  document.body.appendChild(elPool);

  /* ── State machine ── */
  let state = 'full';

  function doSpill() {
    if (state !== 'full') return;
    state = 'spilled';
    elUp.classList.add('cof-gone');
    elDown.classList.add('cof-show');
    elRiver.classList.add('cof-show');
    showBubble();
  }

  function doCleanup() {
    if (state !== 'spilled') return;
    state = 'empty';
    elUp.classList.remove('cof-gone');
    elUp.classList.add('cof-empty');
    elDown.classList.remove('cof-show');
    elRiver.classList.remove('cof-show');
    elPool.classList.remove('cof-show');
  }

  /* ── Speech bubble ── */
  const bubbleStyle = document.createElement('style');
  bubbleStyle.textContent = `
.cof-bubble {
  position: fixed;
  bottom: 340px;
  right: 52px;
  background: #fff;
  border: 2.5px solid #222;
  border-radius: 22px;
  padding: 9px 16px 9px 16px;
  font-family: 'Arial Black', 'Impact', sans-serif;
  font-size: 15px;
  font-weight: 900;
  color: #222;
  letter-spacing: 0.5px;
  line-height: 1.35;
  text-align: center;
  white-space: pre;
  z-index: 9999;
  pointer-events: none;
  opacity: 0;
  box-shadow: 2px 3px 0 rgba(0,0,0,0.18);
}
.cof-bubble::after {
  content: '';
  position: absolute;
  bottom: -22px;
  right: 10px;
  width: 0;
  height: 0;
  border: 0;
  border-top: 14px solid #222;
  border-left: 8px solid transparent;
  border-right: 0px solid transparent;
  transform: rotate(18deg);
  transform-origin: top right;
}
.cof-bubble::before {
  content: '';
  position: absolute;
  bottom: -15px;
  right: 12px;
  width: 0;
  height: 0;
  border: 0;
  border-top: 11px solid #fff;
  border-left: 6px solid transparent;
  border-right: 0px solid transparent;
  transform: rotate(18deg);
  transform-origin: top right;
  z-index: 1;
}
@keyframes cof-swear {
  0%   { opacity: 0; transform: translateX(40px) scale(0.85); }
  14%  { opacity: 1; transform: translateX(-4px) scale(1.05); }
  22%  { transform: translateX(0)  scale(1); }
  68%  { opacity: 1; transform: translateX(0) scale(1); }
  100% { opacity: 0; transform: translateX(18px) scale(0.95); }
}
.cof-bubble.cof-bubble-show {
  animation: cof-swear 2.2s ease-out forwards;
}
`;
  document.head.appendChild(bubbleStyle);

  const elBubble = document.createElement('div');
  elBubble.className = 'cof-bubble';
  elBubble.textContent = 'Oh FUCK!';
  document.body.appendChild(elBubble);

  function showBubble() {
    elBubble.classList.remove('cof-bubble-show');
    void elBubble.offsetWidth;
    elBubble.classList.add('cof-bubble-show');
    setTimeout(function () { elBubble.classList.remove('cof-bubble-show'); }, 2300);
  }

  elUp.addEventListener('click', doSpill);
  elRiver.addEventListener('click', doCleanup);
  elPool.addEventListener('click', doCleanup);
})();
