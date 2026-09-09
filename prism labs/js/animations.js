const obs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      obs.unobserve(e.target);
    }
  });
}, { threshold: 0.12 });

window.initAnimations = function() {
  document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
}

window.observeElement = function(el) {
  obs.observe(el);
}

window.initCubeInteraction = function() {
  const cube = document.querySelector('.about-prism');
  const container = document.querySelector('#about');
  if (!cube || !container) return;

  cube.classList.remove('animate-float'); // Disable CSS animation

  let isHovered = false;
  let mouseX = 0, mouseY = 0;
  let targetX = 0, targetY = 0;
  let currentX = 0, currentY = 0;
  
  let rotateY = 0;
  let floatOffset = 0;

  container.addEventListener('mousemove', (e) => {
    isHovered = true;
    const rect = container.getBoundingClientRect();
    mouseX = e.clientX - rect.left - rect.width / 2;
    mouseY = e.clientY - rect.top - rect.height / 2;
    
    // Move to pointer: calculate target translation
    targetX = mouseX * 0.3; // Scale down movement
    targetY = mouseY * 0.3;
  });

  container.addEventListener('mouseleave', () => {
    isHovered = false;
    targetX = 0;
    targetY = 0;
  });

  function animate() {
    floatOffset += 0.02;
    const floatY = Math.sin(floatOffset) * 15; // Float effect
    
    // Auto spin
    rotateY += 0.5;
    
    // Smooth follow
    currentX += (targetX - currentX) * 0.1;
    currentY += (targetY - currentY) * 0.1;
    
    // Apply transform
    cube.style.transform = `translate(${currentX}px, ${currentY + floatY}px) rotateY(${rotateY}deg)`;
    requestAnimationFrame(animate);
  }
  animate();
}
