// Main application entry point (non-module version)



function initFooterAndCTAs() {
  const wa = (window.CONFIG && window.CONFIG.whatsapp) ? window.CONFIG.whatsapp : '';
  if (!wa) return;
  const mktEl = document.getElementById('marketing-cta');
  const consultEl = document.getElementById('consult-cta');
  if (mktEl) {
    const mktMsg = encodeURIComponent("Hi Prism Labs! I'm interested in your digital marketing services and would like to learn more.");
    mktEl.href = `https://wa.me/${wa}?text=${mktMsg}`;
  }
  if (consultEl) {
    const consultMsg = encodeURIComponent("Hi Prism Labs, I'd like to book a consultation with your team.");
    consultEl.href = `https://wa.me/${wa}?text=${consultMsg}`;
  }
}

function initMobileMenu() {
  const toggle = document.getElementById('labs-menu-toggle');
  const close = document.getElementById('labs-menu-close');
  const menu = document.getElementById('labs-mobile-menu');
  if (!toggle || !menu) return;

  const openMenu = () => {
    menu.classList.remove('hidden');
    menu.classList.add('flex');
    document.body.style.overflow = 'hidden';
  };

  const closeMenu = () => {
    menu.classList.remove('flex');
    menu.classList.add('hidden');
    document.body.style.overflow = '';
  };

  toggle.addEventListener('click', openMenu);
  if (close) close.addEventListener('click', closeMenu);

  menu.querySelectorAll('.labs-mobile-link').forEach(link => {
    link.addEventListener('click', closeMenu);
  });
}

function initApp() {
  initCursor();
  initHero();
  initTemplates();
  initGallery();
  initStories();
  initPrismaChat();
  initFooterAndCTAs();
  initMobileMenu();
  initAnimations();
  initInteractiveLogo();
  // initCubeInteraction is handled inside initInteractiveLogo()
  if (window.lucide) lucide.createIcons();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
