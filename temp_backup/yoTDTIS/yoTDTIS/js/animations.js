const obs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      obs.unobserve(e.target);
    }
  });
}, { threshold: 0.12 });

export function initAnimations() {
  document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
}

export function observeElement(el) {
  obs.observe(el);
}
