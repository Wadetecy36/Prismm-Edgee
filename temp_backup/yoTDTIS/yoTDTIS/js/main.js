import { CONFIG } from './config.js';
import { initTemplates } from './templates.js';
import { initGallery } from './gallery.js';
import { initPrismaChat } from './prisma_chat.js';
import { initAnimations } from './animations.js';
import { initHero } from './hero.js';
import { initAdmin } from './admin.js';

function initFooterAndCTAs() {
  const wa = CONFIG.whatsapp;
  const mail = CONFIG.email;
  document.getElementById('footer-wa').innerHTML = `<a href="https://wa.me/${wa}" class="hover:text-prism-gold flex items-center gap-2"><i data-lucide="message-circle" class="w-4 h-4"></i> WhatsApp: +${wa}</a>`;
  document.getElementById('footer-email').innerHTML = `<a href="mailto:${mail}" class="hover:text-prism-gold flex items-center gap-2"><i data-lucide="mail" class="w-4 h-4"></i> ${mail}</a>`;

  const mktMsg = encodeURIComponent("Hi Prism Labs! I'm interested in your digital marketing services and would like to learn more.");
  document.getElementById('marketing-cta').href = `https://wa.me/${wa}?text=${mktMsg}`;

  const consultMsg = encodeURIComponent("Hi Prism Labs, I'd like to book a consultation with your team.");
  document.getElementById('consult-cta').href = `https://wa.me/${wa}?text=${consultMsg}`;
}

document.addEventListener('DOMContentLoaded', () => {
  initHero();
  initTemplates();
  initGallery();
  initPrismaChat();
  initFooterAndCTAs();
  initAdmin();
  initAnimations();
  if (window.lucide) lucide.createIcons();
});
