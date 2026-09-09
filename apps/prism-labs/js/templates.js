// ─── WEBSITE TEMPLATES MODAL (Prism Labs) ──────────────────────────

const COMPANY_WHATSAPP = '233248607998'; // Prism Edge WhatsApp
const COMPANY_EMAIL    = 'prismmedgee@gmail.com';

// ─── Custom Template Builder ───────────────────────────────────────────
function openCustomTemplateBuilder(onComplete) {
  const modal = document.createElement('div');
  modal.id = 'tpl-builder-modal';
  modal.style.cssText = `
    position:fixed;inset:0;z-index:9300;
    background:rgba(0,0,0,0.9);backdrop-filter:blur(20px);
    display:flex;align-items:center;justify-content:center;padding:24px;
    animation:fadeIn .25s ease;
  `;

  modal.innerHTML = `
    <div style="max-width:500px;width:100%;background:#0a0a0f;border:1px solid rgba(212,175,55,0.25);border-radius:24px;padding:30px;position:relative;">
      <button id="builder-close" style="position:absolute;top:20px;right:20px;width:36px;height:36px;border-radius:50%;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);color:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:16px;">&times;</button>

      <div style="font-size:11px;letter-spacing:.3em;color:rgba(212,175,55,0.6);margin-bottom:8px;">CUSTOMIZER</div>
      <h3 style="font-size:1.5rem;font-weight:700;color:#fff;margin:0 0 20px;">Create Your Style</h3>

      <div style="display:flex;flex-direction:column;gap:16px;">
        <div>
          <label style="font-size:12px;color:rgba(255,255,255,0.6);display:block;margin-bottom:6px;">Style Name</label>
          <input class="pe-input" id="cust-name" value="My Custom Style" />
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
          <div>
            <label style="font-size:12px;color:rgba(255,255,255,0.6);display:block;margin-bottom:6px;">Color 1</label>
            <input type="color" id="cust-c1" value="#0A0A0A" style="width:100%;height:40px;background:none;border:none;cursor:pointer;" />
          </div>
          <div>
            <label style="font-size:12px;color:rgba(255,255,255,0.6);display:block;margin-bottom:6px;">Color 2</label>
            <input type="color" id="cust-c2" value="#1A3EBF" style="width:100%;height:40px;background:none;border:none;cursor:pointer;" />
          </div>
        </div>

        <div>
          <label style="font-size:12px;color:rgba(255,255,255,0.6);display:block;margin-bottom:6px;">Text Color</label>
          <select class="pe-input" id="cust-text">
            <option value="#ffffff">Light (White)</option>
            <option value="#000000">Dark (Black)</option>
          </select>
        </div>

        <!-- Real-time Preview Area -->
        <div id="cust-preview" style="height:120px;border-radius:12px;display:flex;align-items:center;justify-content:center;margin-top:10px;transition:all 0.3s;">
          <span id="cust-preview-text" style="font-weight:700;font-size:18px;">Preview Text</span>
        </div>

        <button id="cust-save-btn" class="pe-btn-gold" style="width:100%;margin-top:10px;">
          Use This Style & Continue →
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  const c1 = document.getElementById('cust-c1');
  const c2 = document.getElementById('cust-c2');
  const txt = document.getElementById('cust-text');
  const prev = document.getElementById('cust-preview');
  const prevTxt = document.getElementById('cust-preview-text');

  function updatePreview() {
    const grad = `linear-gradient(135deg, ${c1.value}, ${c2.value})`;
    prev.style.background = grad;
    prevTxt.style.color = txt.value;
  }

  c1.addEventListener('input', updatePreview);
  c2.addEventListener('input', updatePreview);
  txt.addEventListener('change', updatePreview);
  updatePreview(); // Initial call

  const close = () => modal.remove();
  document.getElementById('builder-close').addEventListener('click', close);
  
  document.getElementById('cust-save-btn').addEventListener('click', () => {
    const name = document.getElementById('cust-name').value.trim() || 'Custom Style';
    const grad = `linear-gradient(135deg, ${c1.value}, ${c2.value})`;
    const customTemplate = {
      name: name,
      tags: ['#custom', '#user-created'],
      grad: grad,
      textColor: txt.value,
      desc: 'A style customized by the user.',
      preview: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800'
    };
    
    close();
    onComplete(customTemplate);
  });
}

// ─── Open the main template showcase ────────────────────────────────────────
window.openTemplatesShowcase = function() {
  const templates = window.CONFIG.templates || [];
  const overlay = document.createElement('div');
  overlay.id = 'tpl-overlay';
  overlay.style.cssText = `
    position:fixed;inset:0;z-index:9000;
    background:rgba(0,0,0,0.92);backdrop-filter:blur(16px);
    overflow-y:auto;display:flex;flex-direction:column;
    animation:fadeIn .3s ease;
  `;

  overlay.innerHTML = `
    <style>
      @keyframes fadeIn { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:none} }
      @keyframes slideUp { from{opacity:0;transform:translateY(40px)} to{opacity:1;transform:none} }
      .tpl-card {
        background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);
        border-radius:20px;overflow:hidden;cursor:pointer;transition:all .35s;
      }
      .tpl-card:hover { transform:translateY(-8px);border-color:rgba(212,175,55,0.4);box-shadow:0 24px 48px rgba(212,175,55,0.15); }
      .tpl-thumb { position:relative;height:180px;overflow:hidden; }
      .tpl-thumb-overlay {
        position:absolute;inset:0;display:flex;align-items:center;justify-content:center;
        background:rgba(0,0,0,0);transition:background .3s;
      }
      .tpl-card:hover .tpl-thumb-overlay { background:rgba(0,0,0,0.45); }
      .preview-pill {
        opacity:0;transform:translateY(8px);transition:all .25s;
        padding:8px 20px;border-radius:999px;background:#D4AF37;color:#000;
        font-size:12px;font-weight:700;letter-spacing:.08em;
      }
      .tpl-card:hover .preview-pill { opacity:1;transform:none; }
      .tpl-tag {
        padding:2px 10px;border-radius:999px;font-size:10px;
        background:rgba(212,175,55,0.1);border:1px solid rgba(212,175,55,0.2);color:#D4AF37;
      }
      .pe-input {
        width:100%;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);
        border-radius:12px;padding:12px 16px;color:#fff;font-size:14px;outline:none;
        transition:border .2s;box-sizing:border-box;
      }
      .pe-input:focus { border-color:#D4AF37; }
      .pe-input::placeholder { color:rgba(255,255,255,0.3); }
      .pe-btn-gold {
        display:flex;align-items:center;justify-content:center;gap:8px;
        padding:14px 24px;border-radius:999px;
        background:linear-gradient(135deg,#D4AF37,#996515);
        color:#000;font-weight:700;font-size:14px;cursor:pointer;border:none;
        transition:all .25s;
      }
      .pe-btn-gold:hover { transform:scale(1.04);box-shadow:0 0 30px rgba(212,175,55,0.5); }
      .pe-btn-outline {
        display:flex;align-items:center;justify-content:center;gap:8px;
        padding:14px 24px;border-radius:999px;
        border:1px solid rgba(255,255,255,0.15);
        color:#fff;font-weight:600;font-size:14px;cursor:pointer;background:none;
        transition:all .25s;
      }
      .pe-btn-outline:hover { border-color:#D4AF37;color:#D4AF37; }
    </style>

    <div style="max-width:1200px;width:100%;margin:0 auto;padding:48px 24px;">
      <!-- Header -->
      <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:48px;">
        <div>
          <div style="font-size:11px;letter-spacing:.3em;color:rgba(212,175,55,.7);margin-bottom:12px;">— WEBSITE STYLES</div>
          <h2 style="font-size:clamp(2rem,5vw,3.5rem);font-weight:700;background:linear-gradient(90deg,#D4AF37,#fff,#D4AF37);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;margin:0 0 12px;">
            Choose Your Style
          </h2>
          <p style="color:rgba(255,255,255,0.5);font-size:16px;max-width:520px;">
            Click any design concept to preview it. When you find the one that speaks to your brand, select it and we'll build it for you.
          </p>
        </div>
        <button id="tpl-close-btn" style="flex-shrink:0;width:48px;height:48px;border-radius:50%;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);color:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all .2s;font-size:20px;margin-left:24px;">&times;</button>
      </div>

      <!-- Template Grid -->
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:24px;">
        ${templates.map((t, i) => `
          <div class="tpl-card" data-tpl-idx="${i}" style="animation:slideUp .5s ease ${i * 0.07}s both;">
            <div class="tpl-thumb" style="background:${t.grad};">
              <div style="position:absolute;top:16px;left:16px;font-size:10px;letter-spacing:.15em;color:${t.textColor};opacity:0.7;">0${i+1}</div>
              <div class="tpl-thumb-overlay">
                <span class="preview-pill">QUICK PREVIEW</span>
              </div>
            </div>
            <div style="padding:20px;">
              <h3 style="font-size:20px;font-weight:700;color:${t.textColor};margin:0 0 8px;">${t.name}</h3>
              <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:14px;">
                ${t.tags.map(tag => `<span class="tpl-tag">${tag}</span>`).join('')}
              </div>
              <p style="font-size:13px;color:rgba(255,255,255,0.5);line-height:1.6;margin:0 0 16px;">${t.desc}</p>
              <button class="tpl-select-btn pe-btn-gold" data-tpl-idx="${i}" style="width:100%;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                Select This Style
              </button>
            </div>
          </div>
        `).join('')}
        
        <!-- Custom Card -->
        <div class="tpl-card" id="custom-tpl-trigger" style="animation:slideUp .5s ease ${templates.length * 0.07}s both; background: rgba(255,255,255,0.02); border: 1px dashed rgba(212,175,55,0.4); display: flex; flex-direction: column;">
          <div class="tpl-thumb" style="display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.2);height:180px;">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          </div>
          <div style="padding:20px;text-align:center;display:flex;flex-direction:column;flex:1;">
            <h3 style="font-size:20px;font-weight:700;color:#D4AF37;margin:0 0 8px;">Create Custom Style</h3>
            <p style="font-size:13px;color:rgba(255,255,255,0.5);line-height:1.6;margin:0 0 16px;flex:1;">Define your own colors and style.</p>
            <button class="pe-btn-outline" style="width:100%;margin-top:auto;">Customize →</button>
          </div>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
  document.body.style.overflow = 'hidden';

  // Close
  const close = () => {
    overlay.remove();
    document.body.style.overflow = '';
  };
  document.getElementById('tpl-close-btn').addEventListener('click', close);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });

  // Preview on card click (but not select button or custom trigger)
  overlay.querySelectorAll('.tpl-card').forEach(card => {
    card.addEventListener('click', (e) => {
      if (e.target.closest('.tpl-select-btn')) return;
      if (card.id === 'custom-tpl-trigger') return;
      const idx = parseInt(card.dataset.tplIdx);
      openTemplatePreview(templates[idx], close);
    });
  });

  // Custom Template Builder
  const customTrigger = document.getElementById('custom-tpl-trigger');
  if (customTrigger) {
    customTrigger.addEventListener('click', () => {
      openCustomTemplateBuilder((customTemplate) => {
        // When complete, close the showcase and open inquiry form
        close();
        openInquiryForm(customTemplate);
      });
    });
  }

  // Select button
  overlay.querySelectorAll('.tpl-select-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const idx = parseInt(btn.dataset.tplIdx);
      openInquiryForm(templates[idx]);
    });
  });
}

// ─── Full-screen template preview ───────────────────────────────────────────
function openTemplatePreview(template, parentClose) {
  const prev = document.createElement('div');
  prev.id = 'tpl-preview-overlay';
  prev.style.cssText = `
    position:fixed;inset:0;z-index:9100;
    background:rgba(0,0,0,0.97);
    display:flex;align-items:center;justify-content:center;
    padding:24px;animation:fadeIn .25s ease;
  `;

  prev.innerHTML = `
    <div style="max-width:1100px;width:100%;background:#0a0a0f;border:1px solid rgba(212,175,55,0.2);border-radius:24px;overflow:hidden;display:grid;grid-template-columns:2fr 1fr;">
      <!-- Preview Image -->
      <div style="height:70vh;overflow:hidden;position:relative;">
        <img src="${template.preview}" style="width:100%;height:100%;object-fit:cover;" />
        <div style="position:absolute;inset:0;background:linear-gradient(to right,transparent 60%,#0a0a0f);"></div>
        <div style="position:absolute;top:20px;left:20px;padding:6px 14px;border-radius:999px;background:rgba(0,0,0,0.6);border:1px solid rgba(212,175,55,0.3);font-size:10px;color:#D4AF37;letter-spacing:.15em;">DESIGN PREVIEW</div>
      </div>
      <!-- Info Panel -->
      <div style="padding:40px;display:flex;flex-direction:column;justify-content:center;">
        <div style="font-size:10px;letter-spacing:.3em;color:rgba(212,175,55,0.6);margin-bottom:16px;">CONCEPT</div>
        <h3 style="font-size:2.5rem;font-weight:700;color:#D4AF37;margin:0 0 16px;line-height:1;">${template.name}</h3>
        <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:20px;">
          ${template.tags.map(t => `<span style="padding:4px 12px;border-radius:999px;background:rgba(212,175,55,0.1);border:1px solid rgba(212,175,55,0.2);font-size:11px;color:#D4AF37;">${t}</span>`).join('')}
        </div>
        <p style="color:rgba(255,255,255,0.6);font-size:15px;line-height:1.7;margin:0 0 32px;">${template.desc}</p>
        <button id="preview-select-btn" style="padding:16px 24px;border-radius:999px;background:linear-gradient(135deg,#D4AF37,#996515);color:#000;font-weight:700;font-size:14px;border:none;cursor:pointer;transition:all .25s;margin-bottom:12px;">
          I Want This Style →
        </button>
        <button id="preview-back-btn" style="padding:12px 24px;border-radius:999px;border:1px solid rgba(255,255,255,0.15);color:rgba(255,255,255,0.6);background:none;font-size:13px;cursor:pointer;transition:all .25s;">
          ← Back to All Styles
        </button>
      </div>
    </div>
    <button id="preview-close-x" style="position:fixed;top:24px;right:24px;width:44px;height:44px;border-radius:50%;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);color:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:18px;z-index:9200;">&times;</button>
  `;

  document.body.appendChild(prev);

  const closePreview = () => prev.remove();

  document.getElementById('preview-close-x').addEventListener('click', closePreview);
  document.getElementById('preview-back-btn').addEventListener('click', closePreview);
  prev.addEventListener('click', (e) => { if (e.target === prev) closePreview(); });

  document.getElementById('preview-select-btn').addEventListener('click', () => {
    closePreview();
    openInquiryForm(template);
  });
}

// ─── Inquiry / Customisation Form ───────────────────────────────────────────
function openInquiryForm(template) {
  // Close any open template overlays first
  document.getElementById('tpl-overlay')?.remove();
  document.getElementById('tpl-preview-overlay')?.remove();

  const modal = document.createElement('div');
  modal.id = 'tpl-inquiry-modal';
  modal.style.cssText = `
    position:fixed;inset:0;z-index:9200;
    background:rgba(0,0,0,0.88);backdrop-filter:blur(20px);
    display:flex;align-items:center;justify-content:center;padding:24px;
    animation:fadeIn .25s ease;
  `;

  modal.innerHTML = `
    <div style="max-width:540px;width:100%;background:#0a0a0f;border:1px solid rgba(212,175,55,0.25);border-radius:24px;padding:40px;position:relative;max-height:90vh;overflow-y:auto;">
      <button id="inq-close" style="position:absolute;top:20px;right:20px;width:36px;height:36px;border-radius:50%;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);color:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:16px;">&times;</button>

      <!-- Selected template badge -->
      <div style="display:flex;align-items:center;gap:12px;padding:12px 16px;border-radius:14px;border:1px solid rgba(212,175,55,0.2);background:rgba(212,175,55,0.05);margin-bottom:28px;">
        <div style="width:36px;height:36px;border-radius:8px;flex-shrink:0;background:${template.grad};"></div>
        <div>
          <div style="font-size:10px;letter-spacing:.2em;color:rgba(212,175,55,0.6);">SELECTED STYLE</div>
          <div style="font-size:16px;font-weight:700;color:#D4AF37;">${template.name}</div>
        </div>
      </div>

      <div style="font-size:11px;letter-spacing:.3em;color:rgba(212,175,55,0.6);margin-bottom:8px;">GET STARTED</div>
      <h3 style="font-size:1.75rem;font-weight:700;color:#fff;margin:0 0 6px;">Tell Us About Your Brand</h3>
      <p style="font-size:14px;color:rgba(255,255,255,0.45);margin:0 0 28px;">Fill in your details and we'll reach out with a custom quote within 24 hours.</p>

      <form id="tpl-inquiry-form" style="display:flex;flex-direction:column;gap:14px;">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
          <input class="pe-input" id="inq-name" placeholder="Your Name" required />
          <input class="pe-input" id="inq-business" placeholder="Brand / Business Name" required />
        </div>
        <input class="pe-input" id="inq-email" type="email" placeholder="Email Address" required />
        <input class="pe-input" id="inq-phone" placeholder="WhatsApp / Phone Number" />
        <textarea class="pe-input" id="inq-brief" rows="4" placeholder="Describe your brand and what you need (pages, features, colours, etc.)" style="resize:vertical;" required></textarea>

        <div style="padding:14px 16px;border-radius:12px;background:rgba(212,175,55,0.05);border:1px solid rgba(212,175,55,0.1);font-size:12px;color:rgba(212,175,55,0.75);display:flex;align-items:flex-start;gap:8px;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="flex-shrink:0;margin-top:1px;"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          Your inquiry will be sent directly to the Prism Edge team with your selected style and brief. We'll reply within 24 hours.
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:6px;">
          <button type="button" id="inq-wa" class="pe-btn-gold">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            WhatsApp Us
          </button>
          <button type="button" id="inq-email-btn" class="pe-btn-outline">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,12 2,6"></polyline></svg>
            Send Email
          </button>
        </div>
      </form>
    </div>
  `;

  document.body.appendChild(modal);

  const closeModal = () => {
    modal.remove();
    document.body.style.overflow = '';
  };

  document.getElementById('inq-close').addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

  function collectData() {
    const name     = document.getElementById('inq-name').value.trim();
    const business = document.getElementById('inq-business').value.trim();
    const email    = document.getElementById('inq-email').value.trim();
    const phone    = document.getElementById('inq-phone').value.trim();
    const brief    = document.getElementById('inq-brief').value.trim();
    if (!name || !business || !email || !brief) {
      document.getElementById('tpl-inquiry-form').reportValidity();
      return null;
    }
    return { name, business, email, phone, brief };
  }

  document.getElementById('inq-wa').addEventListener('click', () => {
    const d = collectData(); if (!d) return;
    const msg = `Hi Prism Edge! 👋\n\nI'd like to get a website built in the *${template.name}* style.\n\n📌 *Selected Style:* ${template.name} (${template.tags.join(', ')})\n\n*My Details:*\n• Name: ${d.name}\n• Brand: ${d.business}\n• Email: ${d.email}${d.phone ? `\n• Phone: ${d.phone}` : ''}\n\n*My Brief:*\n${d.brief}\n\nPlease reach out with a custom quote. Thank you!`;
    window.open(`https://wa.me/${COMPANY_WHATSAPP}?text=${encodeURIComponent(msg)}`, '_blank');
    closeModal();
    if (window.showToast) window.showToast('Opening WhatsApp with your inquiry…');
  });

  document.getElementById('inq-email-btn').addEventListener('click', () => {
    const d = collectData(); if (!d) return;
    const subject = encodeURIComponent(`Website Inquiry: ${template.name} Style for ${d.business}`);
    const body = encodeURIComponent(`Hi Prism Edge!\n\nI'd like to get a website built.\n\nStyle: ${template.name} (${template.tags.join(', ')})\n\nMy Details:\nName: ${d.name}\nBrand: ${d.business}\nEmail: ${d.email}\nPhone: ${d.phone || 'N/A'}\n\nMy Brief:\n${d.brief}\n\nPlease reach out with a custom quote. Thank you!`);
    window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=${COMPANY_EMAIL}&su=${subject}&body=${body}`, '_blank');
    closeModal();
    if (window.showToast) window.showToast('Opening Email with your inquiry…');
  });
}

window.initTemplates = function() {
  const grid = document.getElementById('template-grid');
  if (!grid) return;

  const templates = window.CONFIG.templates || [];

  // Inject styles if they don't exist
  if (!document.getElementById('tpl-inline-styles')) {
    const style = document.createElement('style');
    style.id = 'tpl-inline-styles';
    style.innerHTML = `
      @keyframes slideUp { from{opacity:0;transform:translateY(40px)} to{opacity:1;transform:none} }
      .tpl-card {
        background: #ffffff;
        border-radius: 12px;
        overflow: hidden;
        cursor: pointer;
        display: flex;
        flex-direction: column;
        border: 1px solid rgba(0,0,0,0.05);
        box-shadow: 0 4px 12px rgba(0,0,0,0.02);
        transition: all 0.25s ease;
      }
      .tpl-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 12px 24px rgba(0,0,0,0.08);
      }
      .tpl-thumb {
        position: relative;
        height: 220px;
        overflow: hidden;
      }
      .tpl-thumb img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.5s ease;
      }
      .tpl-card:hover .tpl-thumb img {
        transform: scale(1.05);
      }
      .tpl-thumb-overlay {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(0,0,0,0);
        transition: background 0.3s;
      }
      .tpl-card:hover .tpl-thumb-overlay {
        background: rgba(0,0,0,0.3);
      }
      .preview-pill {
        opacity: 0;
        transform: translateY(10px);
        transition: all 0.3s ease;
        padding: 10px 24px;
        border-radius: 999px;
        background: #D4AF37;
        color: #ffffff;
        font-size: 13px;
        font-weight: 600;
        letter-spacing: .05em;
      }
      .tpl-card:hover .preview-pill {
        opacity: 1;
        transform: none;
      }
      .tpl-info {
        padding: 16px;
        display: flex;
        flex-direction: column;
      }
      .tpl-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 4px;
      }
      .tpl-title {
        font-size: 15px;
        font-weight: 600;
        color: #1a1a1a;
        margin: 0;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .tpl-author {
        font-size: 13px;
        color: #888888;
      }
      .tpl-stats {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-top: 12px;
        font-size: 13px;
        color: #888888;
        font-weight: 500;
      }
      .stat-item {
        display: flex;
        align-items: center;
        gap: 4px;
      }
      .stat-icon {
        width: 14px;
        height: 14px;
      }
    `;
    document.head.appendChild(style);
  }

  if (templates.length === 0) {
    grid.innerHTML = '<p class="text-prism-pearl/50 text-center col-span-full py-12">No templates available at the moment. Please check back later.</p>';
    return;
  }

  grid.innerHTML = templates.map((t, i) => `
    <div class="tpl-card" data-tpl-idx="${i}" style="animation:slideUp .5s ease ${i * 0.07}s both;">
      <div class="tpl-thumb">
        <img src="${t.preview}" alt="${t.name}">
        <div class="tpl-thumb-overlay">
          <span class="preview-pill">View Details</span>
        </div>
      </div>
      <div class="tpl-info">
        <div class="tpl-header">
          <h3 class="tpl-title">${t.name}</h3>
        </div>
        <div class="tpl-author">${t.author || 'by Prism Edge'}</div>
        <div class="tpl-stats">
          <div class="stat-item">
            <svg class="stat-icon" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
            ${t.likes || '1.2k'}
          </div>
          <div class="stat-item">
            <svg class="stat-icon" fill="currentColor" viewBox="0 0 24 24"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>
            ${t.views || '12k'}
          </div>
        </div>
      </div>
    </div>
  `).join('');

  // Attach event listeners
  grid.querySelectorAll('.tpl-card').forEach(card => {
    card.addEventListener('click', () => {
      const idx = parseInt(card.dataset.tplIdx);
      openTemplatePreview(templates[idx], () => {}); // No parent close needed
    });
  });

}
