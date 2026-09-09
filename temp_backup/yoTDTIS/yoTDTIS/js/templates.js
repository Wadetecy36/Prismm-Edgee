import { CONFIG } from './config.js';

function createCard(t, idx) {
  return `
  <div class="template-card reveal" data-tpl="${t.name}">
    <div class="template-thumb" style="background:${t.grad}">
      <div class="absolute inset-0 flex items-center justify-center">
        <span class="font-serif text-3xl ${t.name === 'Clean Minimal' ? 'text-prism-black' : 'text-prism-pearl'} tracking-wide">${t.name}</span>
      </div>
      <div class="absolute top-3 right-3 text-[10px] tracking-widest ${t.name === 'Clean Minimal' ? 'text-prism-black/60' : 'text-prism-pearl/60'}">0${idx+1}</div>
    </div>
    <div class="p-6">
      <h3 class="font-serif text-2xl text-prism-gold mb-2">${t.name}</h3>
      <div class="flex flex-wrap gap-2 mb-5">
        ${t.tags.map(tag => `<span class="text-xs text-prism-pearl/50">${tag}</span>`).join('')}
      </div>
      <button class="select-tpl w-full py-3 border border-prism-gold/40 text-prism-gold rounded-full text-sm hover:bg-prism-gold hover:text-prism-black transition tracking-wide">
        Select This Template
      </button>
    </div>
  </div>`;
}

function openModal(templateName) {
  const root = document.getElementById('modal-root');
  root.innerHTML = `
    <div class="modal-backdrop" id="modal-bd">
      <div class="modal-card" onclick="event.stopPropagation()">
        <div class="flex justify-between items-start mb-6">
          <div>
            <p class="text-prism-gold/70 text-xs tracking-[0.3em] mb-2">SELECTED TEMPLATE</p>
            <h3 class="font-serif text-3xl text-prism-gold">${templateName}</h3>
          </div>
          <button id="close-modal" class="text-prism-pearl/60 hover:text-prism-gold"><i data-lucide="x"></i></button>
        </div>
        <form id="tpl-form" class="space-y-4">
          <input type="hidden" name="template" value="${templateName}" />
          <input required name="name" placeholder="Full Name" class="w-full bg-prism-black/60 border border-prism-pearl/10 rounded-lg px-4 py-3 text-sm focus:border-prism-gold/60 focus:outline-none" />
          <input required name="business" placeholder="Business Name" class="w-full bg-prism-black/60 border border-prism-pearl/10 rounded-lg px-4 py-3 text-sm focus:border-prism-gold/60 focus:outline-none" />
          <input required type="email" name="email" placeholder="Email Address" class="w-full bg-prism-black/60 border border-prism-pearl/10 rounded-lg px-4 py-3 text-sm focus:border-prism-gold/60 focus:outline-none" />
          <input required name="phone" placeholder="Phone Number" class="w-full bg-prism-black/60 border border-prism-pearl/10 rounded-lg px-4 py-3 text-sm focus:border-prism-gold/60 focus:outline-none" />
          <textarea required name="brief" rows="4" placeholder="Brief description of your brand/needs" class="w-full bg-prism-black/60 border border-prism-pearl/10 rounded-lg px-4 py-3 text-sm focus:border-prism-gold/60 focus:outline-none resize-none"></textarea>
          <div class="grid grid-cols-2 gap-3 pt-2">
            <button type="button" id="send-wa" class="py-3 rounded-full bg-prism-gold text-prism-black font-medium hover:scale-[1.02] transition flex items-center justify-center gap-2 text-sm">
              <i data-lucide="message-circle" class="w-4 h-4"></i> WhatsApp
            </button>
            <button type="button" id="send-email" class="py-3 rounded-full bg-prism-blue text-prism-pearl font-medium hover:bg-prism-blue/80 transition flex items-center justify-center gap-2 text-sm">
              <i data-lucide="mail" class="w-4 h-4"></i> Email
            </button>
          </div>
        </form>
      </div>
    </div>
  `;
  if (window.lucide) lucide.createIcons();

  document.getElementById('modal-bd').addEventListener('click', () => root.innerHTML = '');
  document.getElementById('close-modal').addEventListener('click', () => root.innerHTML = '');

  const buildMsg = () => {
    const f = document.getElementById('tpl-form');
    if (!f.checkValidity()) { f.reportValidity(); return null; }
    const d = new FormData(f);
    return {
      tpl: d.get('template'),
      name: d.get('name'),
      business: d.get('business'),
      email: d.get('email'),
      phone: d.get('phone'),
      brief: d.get('brief')
    };
  };

  document.getElementById('send-wa').addEventListener('click', () => {
    const d = buildMsg(); if (!d) return;
    const text = `Hi Prism Labs!\n\nI'd like to inquire about the *${d.tpl}* template.\n\n*Name:* ${d.name}\n*Business:* ${d.business}\n*Email:* ${d.email}\n*Phone:* ${d.phone}\n\n*Brief:* ${d.brief}`;
    window.open(`https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(text)}`, '_blank');
  });
  document.getElementById('send-email').addEventListener('click', () => {
    const d = buildMsg(); if (!d) return;
    const subj = encodeURIComponent(`Website Inquiry - ${d.tpl}`);
    const body = encodeURIComponent(`Hi Prism Labs,\n\nI'd like to inquire about the ${d.tpl} template.\n\nName: ${d.name}\nBusiness: ${d.business}\nEmail: ${d.email}\nPhone: ${d.phone}\n\nBrief: ${d.brief}`);
    window.location.href = `mailto:${CONFIG.email}?subject=${subj}&body=${body}`;
  });
}

export function initTemplates() {
  const grid = document.getElementById('template-grid');
  grid.innerHTML = CONFIG.templates.map((t, i) => createCard(t, i)).join('');
  grid.querySelectorAll('.select-tpl').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const card = e.target.closest('.template-card');
      openModal(card.dataset.tpl);
    });
  });
}
