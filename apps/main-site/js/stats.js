export function initStats() {
  const nums = document.querySelectorAll('.stat-num[data-target]');
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const el = e.target;
        const target = parseInt(el.dataset.target);
        let current = 0;
        const step = target / 50;
        const tick = () => {
          current += step;
          if (current >= target) {
            el.textContent = target + '+';
          } else {
            el.textContent = Math.floor(current);
            requestAnimationFrame(tick);
          }
        };
        tick();
        obs.unobserve(el);
      }
    });
  }, { threshold: 0.5 });
  nums.forEach(n => obs.observe(n));
}

export function renderServices() {
  const grid = document.getElementById('services-grid');
  if (!grid) return;
  import('./data.js').then(({ services }) => {
    grid.innerHTML = services.map(s => `
      <div class="service-card">
        <div class="flex items-center justify-between mb-4">
          <div class="icon">${s.icon}</div>
          ${s.category ? `<span class="service-tag text-xs font-mono font-semibold tracking-wider px-2.5 py-1 rounded border border-white/10 text-violet bg-white/5">${s.category}</span>` : ''}
        </div>
        <h3 class="font-display text-2xl font-semibold mb-2">${s.title}</h3>
        <p class="text-sharp/70 text-sm leading-relaxed">${s.desc}</p>
      </div>
    `).join('');
    grid.querySelectorAll('.service-card').forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        card.style.setProperty('--mx', (e.clientX - rect.left) + 'px');
        card.style.setProperty('--my', (e.clientY - rect.top) + 'px');
      });
    });
  });
}

export function renderTestimonials() {
  const track = document.getElementById('testimonials-track');
  if (!track) return;
  import('./data.js').then(({ testimonials }) => {
    track.innerHTML = testimonials.map(t => `
      <div class="testimonial-card">
        <div class="text-violet text-4xl font-display leading-none mb-4">"</div>
        <p class="text-sharp/85 mb-6 leading-relaxed">${t.quote}</p>
        <div class="flex items-center gap-3">
          <div class="avatar">${t.initials}</div>
          <div>
            <div class="font-semibold text-sm">${t.name}</div>
            <div class="text-xs text-sharp/50 font-mono">${t.role}</div>
          </div>
        </div>
        <div class="flex gap-1 mt-4 text-cyan">${'★'.repeat(5)}</div>
      </div>
    `).join('');
  });
}
