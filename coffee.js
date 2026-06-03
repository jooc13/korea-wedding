(function () {
  /* ── Styles ── */
  const S = document.createElement('style');
  S.textContent = `
.cof-up {
  position: fixed;
  bottom: 52px;
  right: 70px;
  z-index: 1001;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  user-select: none;
}
.cof-steam-svg {
  width: 116px;
  height: 67px;
  display: block;
  margin-bottom: -5px;
}
.cof-mug-svg {
  width: 168px;
  height: auto;
  display: block;
  filter: drop-shadow(2px 5px 8px rgba(0,0,0,0.40));
}

/* Fallen cup */
.cof-down {
  position: fixed;
  bottom: 36px;
  right: 48px;
  z-index: 1001;
  display: none;
  user-select: none;
}
.cof-down svg {
  width: 210px;
  height: auto;
  display: block;
  filter: drop-shadow(2px 4px 7px rgba(0,0,0,0.38));
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
  background: rgba(14,3,0,0.50);
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

/* Empty state — cup back upright, drained; interior stays visible */
.cof-up.cof-empty .cof-steam-svg { visibility: hidden; }
.cof-up.cof-empty #c-coffee      { opacity: 0; }
.cof-up.cof-empty #c-shine       { opacity: 0; }
`;
  document.head.appendChild(S);

  /* ──────────────────────────────────────────────
     UPRIGHT MUG
     Fixes: rounded base sitting ON table (no float),
     filled-ellipse rim (no stroke rings),
     #c-interior so empty state shows cream ceramic not transparency
  ────────────────────────────────────────────── */
  const mugSVG = `
<svg class="cof-mug-svg" viewBox="0 0 185 186" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="c-mg" x1="0" x2="1" y1="0" y2="0">
      <stop offset="0%"   stop-color="#787470"/>
      <stop offset="6%"   stop-color="#aeaaa4"/>
      <stop offset="18%"  stop-color="#cec8c4"/>
      <stop offset="30%"  stop-color="#e4e0da"/>
      <stop offset="44%"  stop-color="#edeae4"/>
      <stop offset="56%"  stop-color="#eae6e0"/>
      <stop offset="68%"  stop-color="#dedad4"/>
      <stop offset="80%"  stop-color="#c6c2bc"/>
      <stop offset="92%"  stop-color="#aeaaa4"/>
      <stop offset="100%" stop-color="#9a9692"/>
    </linearGradient>
    <linearGradient id="c-hg" x1="0" x2="1" y1="0" y2="0">
      <stop offset="0%"   stop-color="#b0aca6"/>
      <stop offset="30%"  stop-color="#d8d4ce"/>
      <stop offset="52%"  stop-color="#e4e0da"/>
      <stop offset="76%"  stop-color="#d0ccc6"/>
      <stop offset="100%" stop-color="#bcb8b2"/>
    </linearGradient>
    <!-- Rim top face: left-to-right shading matching body -->
    <linearGradient id="c-rg" x1="0" x2="1" y1="0" y2="0">
      <stop offset="0%"   stop-color="#9a9692"/>
      <stop offset="22%"  stop-color="#c8c4be"/>
      <stop offset="44%"  stop-color="#e4e0da"/>
      <stop offset="60%"  stop-color="#e0dcd6"/>
      <stop offset="82%"  stop-color="#c4c0ba"/>
      <stop offset="100%" stop-color="#acabA4"/>
    </linearGradient>
    <radialGradient id="c-cg" cx="38%" cy="34%" r="60%">
      <stop offset="0%"   stop-color="#3c1408"/>
      <stop offset="52%"  stop-color="#1c0806"/>
      <stop offset="100%" stop-color="#0a0302"/>
    </radialGradient>
    <!-- Base ring gradient -->
    <linearGradient id="c-bg" x1="0" x2="1" y1="0" y2="0">
      <stop offset="0%"   stop-color="#888480"/>
      <stop offset="50%"  stop-color="#b4b0aa"/>
      <stop offset="100%" stop-color="#96928e"/>
    </linearGradient>
  </defs>

  <!-- Mug body (slightly tapered, classic diner shape) -->
  <path d="M 16,46 L 132,46 L 127,162 L 21,162 Z" fill="url(#c-mg)"/>

  <!-- Cylinder-depth: left and right edge darkening -->
  <path d="M 16,46 L 30,46 L 27,162 L 21,162 Z" fill="rgba(0,0,0,0.09)"/>
  <path d="M 118,46 L 132,46 L 127,162 L 121,162 Z" fill="rgba(0,0,0,0.07)"/>
  <!-- Center-left highlight band -->
  <path d="M 46,52 L 58,52 L 55,154 L 44,154 Z" fill="rgba(255,255,255,0.08)"/>

  <!-- BASE: ellipse painted over flat bottom edge → creates rounded foot appearance -->
  <!-- Outer base ring (slightly darker ceramic) -->
  <ellipse cx="74" cy="162" rx="56" ry="9" fill="url(#c-bg)"/>
  <!-- Inner foot highlight -->
  <ellipse cx="74" cy="161" rx="50" ry="6" fill="#c4c0ba"/>
  <!-- Contact shadow: sits DIRECTLY on the desk surface, no float -->
  <ellipse cx="74" cy="167" rx="50" ry="4" fill="rgba(0,0,0,0.30)"/>

  <!-- Handle -->
  <path d="
    M 130,70 C 130,70 178,70 178,102
    C 178,134 130,134 130,134
    L 130,120 C 130,120 160,120 160,102
    C 160,84  130,84  130,84 Z
  " fill="url(#c-hg)" stroke="#a8a49e" stroke-width="1.5"/>
  <path d="M 130,84 C 152,85 156,93 156,102 C 156,111 152,119 130,120
    L 130,122 C 154,121 158,112 158,102 C 158,92 154,83 130,82 Z"
    fill="rgba(0,0,0,0.09)"/>
  <path d="M 132,72 C 164,74 174,86 174,102 C 174,118 164,130 132,132
    L 132,130 C 162,128 172,116 172,102 C 172,88 162,76 132,74 Z"
    fill="rgba(255,255,255,0.14)"/>

  <!-- RIM: solid filled ellipses — no stroke rings, no concentric artifacts -->
  <!-- Outer rim face (the ceramic top-wall band) -->
  <ellipse cx="74" cy="44" rx="58" ry="13" fill="url(#c-rg)"/>
  <!-- Inner hole: shows ceramic interior, NOT transparent -->
  <ellipse cx="74" cy="43" rx="47" ry="9" fill="#dedad4"/>
  <!-- Rim top-face catch-light -->
  <ellipse cx="74" cy="36" rx="55" ry="8" fill="rgba(255,255,255,0.22)"/>
  <!-- Rim inner-edge soft shadow for depth -->
  <ellipse cx="74" cy="47" rx="47" ry="9" fill="rgba(0,0,0,0.07)"/>

  <!-- INTERIOR CERAMIC: always visible, ensures empty state shows cream not transparency -->
  <ellipse id="c-interior" cx="74" cy="46" rx="46" ry="8.5" fill="#d4d0c8"/>

  <!-- Coffee surface (hidden when empty via CSS) -->
  <ellipse id="c-coffee" cx="74" cy="46" rx="46" ry="8.5" fill="url(#c-cg)"/>
  <!-- Coffee specular highlight -->
  <ellipse id="c-shine" cx="51" cy="41" rx="15" ry="4.5"
    fill="rgba(90,34,8,0.36)" transform="rotate(-14 51 41)"/>
</svg>`;

  /* ── Steam animation CSS ── */
  const steamStyle = document.createElement('style');
  steamStyle.textContent = `
@keyframes wsp-rise {
  0%   { transform: translateY(0px)   translateX(0px);  opacity: 0;    }
  12%  { opacity: 0.62; }
  35%  { transform: translateY(-10px) translateX(3px);  opacity: 0.58; }
  65%  { transform: translateY(-22px) translateX(-3px); opacity: 0.40; }
  88%  { opacity: 0.12; }
  100% { transform: translateY(-34px) translateX(1px);  opacity: 0;    }
}
.wsp { animation: wsp-rise 2.6s ease-in-out infinite; transform-box: fill-box; transform-origin: bottom center; }
.wsp-2 { animation-delay: 0.87s; }
.wsp-3 { animation-delay: 1.73s; }
`;
  document.head.appendChild(steamStyle);

  /* ── Steam SVG ── */
  const steamSVG = `
<svg class="cof-steam-svg" id="cof-steam" viewBox="0 0 100 55" xmlns="http://www.w3.org/2000/svg">
  <g class="wsp wsp-1">
    <path d="M 18,53 C 12,38 30,28 16,12 C 7,2 18,0 18,0"
      fill="none" stroke="rgba(215,215,228,0.70)" stroke-width="4" stroke-linecap="round"/>
  </g>
  <g class="wsp wsp-2">
    <path d="M 50,53 C 50,35 33,23 50,9 C 60,0 47,0 49,0"
      fill="none" stroke="rgba(215,215,228,0.70)" stroke-width="4.5" stroke-linecap="round"/>
  </g>
  <g class="wsp wsp-3">
    <path d="M 82,53 C 88,38 70,28 84,12 C 93,2 82,0 82,0"
      fill="none" stroke="rgba(215,215,228,0.70)" stroke-width="3.5" stroke-linecap="round"/>
  </g>
</svg>`;

  /* ── FALLEN MUG ── */
  const fallenSVG = `
<svg viewBox="0 0 240 160" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="c-fmg" x1="0" x2="0" y1="0" y2="1">
      <stop offset="0%"   stop-color="#f2eeea"/>
      <stop offset="14%"  stop-color="#e0dcd6"/>
      <stop offset="38%"  stop-color="#b8b4ae"/>
      <stop offset="66%"  stop-color="#8a8682"/>
      <stop offset="100%" stop-color="#66625e"/>
    </linearGradient>
    <linearGradient id="c-fhg" x1="0" x2="0" y1="0" y2="1">
      <stop offset="0%"   stop-color="#f0ece6"/>
      <stop offset="45%"  stop-color="#dedad4"/>
      <stop offset="100%" stop-color="#b8b4ae"/>
    </linearGradient>
    <linearGradient id="c-fbg" x1="0" x2="0" y1="0" y2="1">
      <stop offset="0%"   stop-color="#e0dcd6"/>
      <stop offset="100%" stop-color="#9e9a96"/>
    </linearGradient>
  </defs>

  <!-- Shadow -->
  <ellipse cx="118" cy="152" rx="100" ry="7" fill="rgba(0,0,0,0.22)"/>

  <!-- HANDLE: very thick D-loop sticking prominently above body -->
  <!-- Outer shape of handle -->
  <path d="M 106,58 C 106,14 164,14 164,58 L 164,76
           C 164,36 122,36 122,76 Z"
    fill="url(#c-fhg)" stroke="#a8a4a0" stroke-width="2"/>
  <!-- Highlight on outer arc -->
  <path d="M 110,58 C 110,20 160,20 160,58 L 158,58
           C 158,22 112,22 112,58 Z"
    fill="rgba(255,255,255,0.30)"/>
  <!-- Shadow on inner arc -->
  <path d="M 122,76 C 122,42 148,42 148,76 L 150,76
           C 150,40 120,40 120,76 Z"
    fill="rgba(0,0,0,0.20)"/>
  <!-- Ceramic thickness at top of handle -->
  <path d="M 106,58 C 106,14 164,14 164,58 L 164,60
           C 164,16 108,16 108,60 Z"
    fill="rgba(255,255,255,0.14)"/>

  <!-- BODY: squat, clear diner-mug shape -->
  <path d="M 60,58 L 158,58 C 172,58 178,76 178,96
           C 178,116 172,134 158,134 L 60,134 Z"
    fill="url(#c-fmg)"/>
  <!-- Top highlight band -->
  <path d="M 60,58 L 158,58 C 168,58 174,65 176,74 L 60,74 Z"
    fill="rgba(255,255,255,0.18)"/>
  <!-- Bottom shadow band -->
  <path d="M 60,122 L 158,122 C 166,124 172,129 176,134 L 158,134 L 60,134 Z"
    fill="rgba(0,0,0,0.13)"/>

  <!-- BASE (right end) — solid ceramic disc, clearly not a tube -->
  <ellipse cx="160" cy="96" rx="20" ry="38" fill="url(#c-fbg)"/>
  <ellipse cx="160" cy="96" rx="13" ry="26" fill="#d4d0ca"/>
  <ellipse cx="160" cy="96" rx="7"  ry="14" fill="#c8c4be"/>
  <ellipse cx="160" cy="96" rx="10" ry="20" fill="none" stroke="rgba(0,0,0,0.22)" stroke-width="2"/>
  <ellipse cx="160" cy="96" rx="20" ry="38" fill="none" stroke="rgba(0,0,0,0.12)" stroke-width="1.5"/>

  <!-- OPENING (left) — thick cream rim, pitch-dark interior -->
  <ellipse cx="58" cy="96" rx="20" ry="38" fill="#dedad4"/>
  <ellipse cx="58" cy="96" rx="15" ry="32" fill="#e8e4de"/>
  <ellipse cx="57" cy="96" rx="10" ry="23" fill="#0c0402"/>
  <ellipse cx="56" cy="96" rx="6"  ry="14" fill="#1a0806"/>
  <ellipse cx="57" cy="96" rx="10" ry="23" fill="none" stroke="rgba(0,0,0,0.45)" stroke-width="3"/>

  <!-- Coffee dripping from opening -->
  <path d="M 38,108 C 30,116 22,128 26,138 C 29,144 40,142 38,136
           C 42,142 34,146 30,138 C 24,128 32,114 40,110 Z"
    fill="rgba(8,2,0,0.75)"/>
  <path d="M 48,116 C 44,122 42,132 44,138 C 46,142 50,140 48,136
           C 50,140 47,144 45,138 C 41,130 44,120 50,118 Z"
    fill="rgba(8,2,0,0.55)"/>
</svg>`;

  /* ──────────────────────────────────────────────
     SPILL
     One large organic dark blob — no amber dots,
     no glowing hotspots. Realistic dark coffee puddle.
     The blob is positioned so the dense area is near
     where the cup opening sits (left side of the cup),
     spreading leftward across the desk.
  ────────────────────────────────────────────── */
  const spillSVG = `<svg width="100%" height="100%" viewBox="0 0 500 230"
    xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="spill-g" cx="58%" cy="60%" r="62%">
      <stop offset="0%"   stop-color="#080300" stop-opacity="0.96"/>
      <stop offset="45%"  stop-color="#0a0400" stop-opacity="0.92"/>
      <stop offset="75%"  stop-color="#080300" stop-opacity="0.80"/>
      <stop offset="92%"  stop-color="#050200" stop-opacity="0.52"/>
      <stop offset="100%" stop-color="#020100" stop-opacity="0.12"/>
    </radialGradient>
  </defs>

  <!-- Main puddle: large organic dark blob spreading left from cup opening -->
  <path d="
    M 306,52
    C 328,38  382,46  426,68
    C 460,86  482,116 468,150
    C 454,182 418,200 372,200
    C 326,200 276,192 224,196
    C 174,200 124,194 82,178
    C 48,164  20,146  12,124
    C 4,104   16,88   44,88
    C 66,88   90,98   116,106
    C 144,114 168,122 196,116
    C 226,110 248,98  272,88
    C 290,80  296,64  306,52 Z
  " fill="url(#spill-g)"/>

  <!-- Dense thickening patch — where coffee pools nearest to the opening -->
  <path d="
    M 276,60 C 320,48 390,64 428,96
    C 450,114 450,144 428,160
    C 406,176 372,178 348,168
    C 324,158 316,136 318,112
    C 320,88  290,68  276,60 Z
  " fill="rgba(4,1,0,0.28)"/>

  <!-- Organic edge irregularities: thin trickle tendrils -->
  <path d="M 12,124 C 4,128 2,138 8,146 C 14,154 38,156 60,152
           C 38,154 12,150 12,124 Z" fill="rgba(6,2,0,0.50)"/>
  <path d="M 82,178 C 62,180 40,186 38,196 C 38,204 64,208 88,206
           C 66,206 40,200 82,178 Z" fill="rgba(6,2,0,0.40)"/>
</svg>`;

  /* ── Build DOM ── */
  const elUp = document.createElement('div');
  elUp.className = 'cof-up';
  elUp.id = 'cof-up';
  elUp.innerHTML = steamSVG + mugSVG;

  const elDown = document.createElement('div');
  elDown.className = 'cof-down';
  elDown.id = 'cof-down';
  elDown.innerHTML = fallenSVG;

  const elRiver = document.createElement('div');
  elRiver.className = 'cof-river';
  elRiver.id = 'cof-river';
  elRiver.innerHTML = spillSVG;

  const elPool = document.createElement('div');
  elPool.className = 'cof-pool';
  elPool.id = 'cof-pool';

  document.body.appendChild(elUp);
  document.body.appendChild(elDown);
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
    elPool.classList.add('cof-show');
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
  bottom: 268px;
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
/* Tail: outer — bottom-right corner, pointing down and off to the right */
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
/* Tail: inner white fill */
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
  elBubble.textContent = 'OH YOU PIECE OF SHIT\nFUCKING MOTHERFUCKER!';
  document.body.appendChild(elBubble);

  function showBubble() {
    elBubble.classList.remove('cof-bubble-show');
    void elBubble.offsetWidth; /* force reflow to restart animation */
    elBubble.classList.add('cof-bubble-show');
    setTimeout(function () { elBubble.classList.remove('cof-bubble-show'); }, 2300);
  }

  elUp.addEventListener('click', doSpill);
  elRiver.addEventListener('click', doCleanup);
  elPool.addEventListener('click', doCleanup);
})();
