/**
 * Prism Labs — Interactive 3D Cube
 * Drag to rotate, hover for parallax, click to spin.
 * Works with the .about-prism-scene parent (which holds the CSS perspective).
 */
function initInteractiveLogo() {
  const cube  = document.querySelector('.about-prism');
  const scene = document.querySelector('.about-prism-scene');
  if (!cube || !scene) return;

  // ── State ─────────────────────────────────────────────────────────────────
  let rotX = -12, rotY = 25;
  let velX = 0,   velY = 0;
  let isDragging = false;
  let isHovered  = false;
  let isSpinning = false;
  let lastMX = 0, lastMY = 0;
  let autoT = 0;
  let rafId;

  // Remove the CSS float animation — we drive transforms via JS
  cube.classList.remove('animate-float');
  cube.style.willChange = 'transform';

  const apply = () => {
    cube.style.transform =
      `rotateX(${rotX}deg) rotateY(${rotY}deg)`;
  };
  apply();

  // ── Auto gentle float loop ────────────────────────────────────────────────
  function loop() {
    if (!isDragging && !isHovered && !isSpinning) {
      autoT += 0.008;
      // Gentle sway
      rotY += (25 + Math.sin(autoT) * 18 - rotY) * 0.012;
      rotX += (-12 + Math.cos(autoT * 0.7) * 6 - rotX) * 0.012;
      // Inertia on drag release
    } else if (!isDragging && !isSpinning) {
      velX *= 0.92;
      velY *= 0.92;
      rotX += velX;
      rotY += velY;
    }
    apply();
    rafId = requestAnimationFrame(loop);
  }
  loop();

  // ── Hover parallax ────────────────────────────────────────────────────────
  scene.addEventListener('mouseenter', () => { isHovered = true; });
  scene.addEventListener('mouseleave', () => {
    isHovered = false;
    isDragging = false;
    cube.style.cursor = 'grab';
  });

  scene.addEventListener('mousemove', e => {
    if (isDragging) return;
    const rect = scene.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width  - 0.5;  // -0.5 to 0.5
    const ny = (e.clientY - rect.top)  / rect.height - 0.5;

    const tX = -ny * 28;
    const tY =  nx * 28;
    rotX += (tX - rotX) * 0.14;
    rotY += (tY - rotY) * 0.14;

    // Dynamic glow follows pointer
    cube.style.filter =
      `drop-shadow(${nx * 30}px ${ny * 30}px 28px rgba(232,201,122,0.5))
       drop-shadow(${-nx * 15}px ${-ny * 15}px 16px rgba(26,62,191,0.28))`;
  });

  scene.addEventListener('mouseleave', () => {
    cube.style.filter = '';
  });

  // ── Click — 720° spin burst ───────────────────────────────────────────────
  cube.addEventListener('click', e => {
    if (isDragging || isSpinning) return;
    isSpinning = true;

    // Flash all faces
    cube.querySelectorAll('.face').forEach((f, i) => {
      f.style.transition = 'box-shadow .15s';
      f.style.boxShadow  = `inset 0 0 80px rgba(232,201,122,${0.4 + i * 0.05})`;
      setTimeout(() => { f.style.boxShadow = ''; f.style.transition = ''; }, 450);
    });

    const startY  = rotY;
    const startX  = rotX;
    const startTs = performance.now();
    const dur     = 950;
    const dir     = Math.sign(velY) || 1;

    cancelAnimationFrame(rafId);
    function spinFrame(now) {
      const t  = Math.min((now - startTs) / dur, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      rotY = startY + 720 * dir * ease;
      rotX = startX + Math.sin(t * Math.PI) * -22;
      apply();
      if (t < 1) {
        rafId = requestAnimationFrame(spinFrame);
      } else {
        rotY = startY % 360;
        rotX = startX;
        isSpinning = false;
        rafId = requestAnimationFrame(loop);
      }
    }
    rafId = requestAnimationFrame(spinFrame);
  });

  // ── Mouse drag ────────────────────────────────────────────────────────────
  cube.addEventListener('mousedown', e => {
    isDragging = true;
    lastMX = e.clientX;
    lastMY = e.clientY;
    velX = 0; velY = 0;
    cube.style.cursor = 'grabbing';
    e.preventDefault();
  });

  window.addEventListener('mousemove', e => {
    if (!isDragging) return;
    const dx = e.clientX - lastMX;
    const dy = e.clientY - lastMY;
    velY = dx * 0.45;
    velX = -dy * 0.45;
    rotY += velY;
    rotX += velX;
    lastMX = e.clientX;
    lastMY = e.clientY;
  });

  window.addEventListener('mouseup', () => {
    isDragging = false;
    cube.style.cursor = 'grab';
  });

  // ── Touch drag ────────────────────────────────────────────────────────────
  cube.addEventListener('touchstart', e => {
    const t = e.touches[0];
    lastMX = t.clientX; lastMY = t.clientY;
    isHovered = true;
    cube.classList.remove('animate-float');
  }, { passive: true });

  cube.addEventListener('touchmove', e => {
    const t  = e.touches[0];
    velY = (t.clientX - lastMX) * 0.5;
    velX = -(t.clientY - lastMY) * 0.5;
    rotY += velY;
    rotX += velX;
    lastMX = t.clientX; lastMY = t.clientY;
    apply();
    e.preventDefault();
  }, { passive: false });

  cube.addEventListener('touchend', () => { isHovered = false; });

  // ── Hint ──────────────────────────────────────────────────────────────────
  cube.title = 'Drag or click to interact';
}
