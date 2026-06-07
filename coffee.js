(function () {
  /* ── Styles ── */
  const S = document.createElement('style');
  S.textContent = `
.cof-up {
  position: fixed;
  bottom: 36px;
  right: 29px;
  z-index: 1001;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  user-select: none;
}
.cof-mug-img {
  height: 242px;
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

@media (max-width: 1100px) {
  .cof-up { transform: scale(0.45); transform-origin: bottom right; }
}

.cof-up.cof-gone    { display: none; }
.cof-down.cof-show  { display: block; }
.cof-river.cof-show { display: block; }
.cof-pool.cof-show  { display: block; }

.cof-bubble {
  position: fixed;
  bottom: 200px;
  right: 52px;
  z-index: 9999;
  pointer-events: none;
  opacity: 0;
}
.cof-bubble img {
  display: block;
  height: auto;
  max-height: 420px;
}
@keyframes cof-swear {
  0%   { opacity: 0; transform: translateX(40px) scale(0.85); }
  14%  { opacity: 1; transform: translateX(-4px) scale(1.05); }
  22%  { transform: translateX(0)  scale(1); }
  78%  { opacity: 1; transform: translateX(0) scale(1); }
  100% { opacity: 0; transform: translateX(18px) scale(0.95); }
}
.cof-bubble.cof-bubble-show {
  animation: cof-swear 3.2s ease-out forwards;
}
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

  elUp.querySelector('.cof-mug-img').src = 'annacoffeepic.png';

  document.body.appendChild(elDown);
  elDown.querySelector('.cof-down-img').src = 'annacoffeespill.png';

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
    elUp.querySelector('.cof-mug-img').src = 'annacoffeeempty.png';
    elUp.classList.remove('cof-gone');
    elUp.classList.add('cof-empty');
    elDown.classList.remove('cof-show');
    elRiver.classList.remove('cof-show');
    elPool.classList.remove('cof-show');
  }

  /* ── Speech bubble ── */
  const elBubble = document.createElement('div');
  elBubble.className = 'cof-bubble';
  elBubble.innerHTML = '<img src="ohfuck.png" alt="Oh FUCK!" draggable="false">';
  document.body.appendChild(elBubble);

  function showBubble() {
    elBubble.classList.remove('cof-bubble-show');
    void elBubble.offsetWidth;
    elBubble.classList.add('cof-bubble-show');
    setTimeout(function () { elBubble.classList.remove('cof-bubble-show'); }, 3300);
  }

  elUp.addEventListener('click', doSpill);
  elRiver.addEventListener('click', doCleanup);
  elPool.addEventListener('click', doCleanup);
})();
