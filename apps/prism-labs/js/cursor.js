/**
 * Prism Labs — Creative Prismatic Cursor
 * A premium holographic diamond cursor with color-shifting trails and magnetic hover.
 */
window.initCursor = function () {
  // ── Inject CSS ────────────────────────────────────────────────────────────
  const css = document.createElement('style');
  css.textContent = `
    *, *::before, *::after { cursor: none !important; }

    #pl-cursor-wrap {
      position: fixed; top: 0; left: 0;
      pointer-events: none; z-index: 99999;
      will-change: transform;
    }

    /* Outer prism ring */
    #pl-ring {
      position: absolute;
      width: 44px; height: 44px;
      transform: translate(-50%, -50%) rotate(45deg);
      border: 1.5px solid rgba(232,201,122,0.65);
      border-radius: 4px;
      background: rgba(232,201,122,0.03);
      box-shadow: 0 0 12px rgba(232,201,122,0.15),
                  inset 0 0 8px rgba(26,62,191,0.08);
      transition: width .35s cubic-bezier(.2,.8,.2,1),
                  height .35s cubic-bezier(.2,.8,.2,1),
                  border-color .3s, background .3s, box-shadow .3s;
    }

    /* Inner dot */
    #pl-dot {
      position: absolute;
      width: 5px; height: 5px;
      transform: translate(-50%, -50%);
      background: #E8C97A;
      border-radius: 50%;
      transition: width .15s, height .15s, background .2s, border-radius .2s;
    }

    /* Trailing sparks */
    .pl-spark {
      position: fixed;
      pointer-events: none;
      border-radius: 50%;
      transform: translate(-50%, -50%);
      z-index: 99998;
      mix-blend-mode: screen;
      animation: spark-fade .6s ease-out forwards;
    }
    @keyframes spark-fade {
      0%   { opacity: .8; transform: translate(-50%,-50%) scale(1); }
      100% { opacity: 0;  transform: translate(-50%,-50%) scale(0); }
    }

    /* Hover state — expanded glowing diamond */
    body.pl-hov #pl-ring {
      width: 58px; height: 58px;
      border-color: rgba(232,201,122,0.95);
      background: rgba(232,201,122,0.06);
      box-shadow: 0 0 24px rgba(232,201,122,0.35),
                  0 0 48px rgba(232,201,122,0.12),
                  inset 0 0 16px rgba(26,62,191,0.18);
    }
    body.pl-hov #pl-dot {
      width: 3px; height: 3px;
      background: #fff;
      border-radius: 50%;
    }

    /* Click burst */
    body.pl-click #pl-ring {
      width: 72px; height: 72px;
      border-color: rgba(255,255,255,0.9);
      background: rgba(232,201,122,0.12);
      transition: width .1s, height .1s, border-color .1s;
    }

    /* Text cursor state — thin I-beam look */
    body.pl-text #pl-ring {
      width: 2px; height: 28px;
      border-radius: 2px;
      border-color: rgba(232,201,122,0.8);
      background: rgba(232,201,122,0.5);
    }
    body.pl-text #pl-dot { opacity: 0; }
  `;
  document.head.appendChild(css);

  // ── Build DOM ─────────────────────────────────────────────────────────────
  const wrap = document.createElement('div'); wrap.id = 'pl-cursor-wrap';
  const ring = document.createElement('div'); ring.id = 'pl-ring';
  const dot  = document.createElement('div'); dot.id  = 'pl-dot';
  wrap.append(ring, dot);
  document.body.appendChild(wrap);

  // ── State ─────────────────────────────────────────────────────────────────
  let mx = 0, my = 0;
  let rx = 0, ry = 0;    // ring lerp position
  let sparkHue = 45;     // cycles through gold → blue

  // ── Mouse tracking ────────────────────────────────────────────────────────
  document.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;

    // Dot snaps instantly
    dot.style.left = mx + 'px';
    dot.style.top  = my + 'px';

    // Spawn trailing spark every ~40px moved
    spawnSpark(mx, my);
  });

  // ── RAF — lagged ring follow ──────────────────────────────────────────────
  (function loop() {
    rx += (mx - rx) * 0.11;
    ry += (my - ry) * 0.11;
    wrap.style.transform = `translate(${rx}px,${ry}px)`;
    ring.style.left = '0px';
    ring.style.top  = '0px';
    requestAnimationFrame(loop);
  })();

  // ── Spark particle ────────────────────────────────────────────────────────
  let lastSx = 0, lastSy = 0;
  function spawnSpark(x, y) {
    const dist = Math.hypot(x - lastSx, y - lastSy);
    if (dist < 28) return;
    lastSx = x; lastSy = y;

    sparkHue = (sparkHue + 18) % 360;
    const s = document.createElement('div');
    s.className = 'pl-spark';
    const size = 4 + Math.random() * 4;
    // Alternate between gold and prism-blue hues
    const isGold = sparkHue < 180;
    const color  = isGold
      ? `rgba(232,201,122,${0.5 + Math.random() * 0.4})`
      : `rgba(26,62,191,${0.5 + Math.random() * 0.4})`;

    s.style.cssText = `
      left:${x + (Math.random()-0.5)*12}px;
      top:${y + (Math.random()-0.5)*12}px;
      width:${size}px; height:${size}px;
      background:${color};
    `;
    document.body.appendChild(s);
    setTimeout(() => s.remove(), 620);
  }

  // ── Click burst ───────────────────────────────────────────────────────────
  document.addEventListener('mousedown', () => {
    document.body.classList.add('pl-click');
    // Burst of sparks on click
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const r = 16 + Math.random() * 16;
      spawnSpark(mx + Math.cos(angle) * r, my + Math.sin(angle) * r);
    }
    setTimeout(() => document.body.classList.remove('pl-click'), 180);
  });

  // ── Hover detection ───────────────────────────────────────────────────────
  const HOV = 'a, button, [role="button"], .gallery-item, .glass-card, .tpl-card, .about-prism, [data-hover], input[type="file"], label';
  const TXT = 'input:not([type="file"]), textarea, [contenteditable]';

  function bind(el) {
    if (el._plCur) return;
    el._plCur = true;
    el.addEventListener('mouseenter', () => document.body.classList.add('pl-hov'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('pl-hov'));
  }
  function bindText(el) {
    if (el._plTxt) return;
    el._plTxt = true;
    el.addEventListener('mouseenter', () => document.body.classList.add('pl-text'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('pl-text'));
  }

  const attach = () => {
    document.querySelectorAll(HOV).forEach(bind);
    document.querySelectorAll(TXT).forEach(bindText);
  };
  attach();
  new MutationObserver(attach).observe(document.body, { childList: true, subtree: true });

  // ── Hide default on leave/enter ───────────────────────────────────────────
  document.addEventListener('mouseleave', () => { wrap.style.opacity = '0'; });
  document.addEventListener('mouseenter', () => { wrap.style.opacity = '1'; });
};
