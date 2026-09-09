export function initHero() {
  const hero = document.getElementById('hero');
  if (!hero) return;
  hero.addEventListener('mousemove', (e) => {
    const bg = hero.querySelector('.prismatic-bg');
    if (!bg) return;
    const x = (e.clientX / window.innerWidth - 0.5) * 30;
    const y = (e.clientY / window.innerHeight - 0.5) * 30;
    bg.style.transform = `translate(${x}px, ${y}px) scale(1.1)`;
  });
}
