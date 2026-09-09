import { renderGallery } from './gallery.js';

export function initAdmin() {
  const link = document.getElementById('admin-login-link');
  if (link) {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      openLoginModal();
    });
  }
}

function openLoginModal() {
  const root = document.getElementById('admin-root');
  document.body.style.overflow = 'hidden';

  const close = () => {
    root.innerHTML = '';
    document.body.style.overflow = '';
  };

  root.innerHTML = `
    <div class="modal-backdrop" id="admin-login-bd">
      <div class="modal-card" onclick="event.stopPropagation()">
        <h3 class="font-serif text-3xl text-prism-gold mb-4">Admin Access</h3>
        <p class="text-prism-pearl/60 text-sm mb-6">Enter your credentials to access the Prism Edge portal.</p>
        <form id="admin-login-form" class="space-y-4">
          <input required id="admin-user" placeholder="Username" class="w-full bg-prism-black/60 border border-prism-pearl/10 rounded-lg px-4 py-3 text-sm focus:border-prism-gold/60 focus:outline-none text-prism-pearl" />
          <input required type="password" id="admin-pass" placeholder="Password" class="w-full bg-prism-black/60 border border-prism-pearl/10 rounded-lg px-4 py-3 text-sm focus:border-prism-gold/60 focus:outline-none text-prism-pearl" />
          <button type="submit" class="w-full py-3 rounded-full bg-prism-gold text-prism-black font-medium hover:scale-[1.02] transition text-sm">
            Authenticate
          </button>
        </form>
      </div>
    </div>
  `;
  
  document.getElementById('admin-login-bd').addEventListener('click', close);
  document.getElementById('admin-login-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const u = document.getElementById('admin-user').value;
    const p = document.getElementById('admin-pass').value;
    if (u === 'admin' && p === 'password') {
      openAdminDashboard();
    } else {
      alert('Invalid credentials. Use "admin" and "password".');
    }
  });
}

function openAdminDashboard() {
  const root = document.getElementById('admin-root');
  
  const close = () => {
    root.innerHTML = '';
    document.body.style.overflow = '';
  };

  const renderDashboard = () => {
    const items = JSON.parse(localStorage.getItem('prism_gallery') || '[]');
    root.innerHTML = `
      <div class="fixed inset-0 z-[100] bg-prism-black overflow-y-auto">
        <div class="max-w-5xl mx-auto px-6 py-12">
          <div class="flex justify-between items-center mb-10 border-b border-prism-gold/10 pb-6">
            <div>
              <p class="text-prism-gold/70 text-xs tracking-[0.3em] mb-2">PRISM EDGE</p>
              <h2 class="font-serif text-4xl text-prism-gold">Media Management</h2>
            </div>
            <button id="close-admin" class="px-5 py-2 border border-prism-gold/40 text-prism-gold rounded-full text-xs hover:bg-prism-gold hover:text-prism-black transition">
              Exit Portal
            </button>
          </div>
          
          <div class="grid md:grid-cols-3 gap-8">
            <div class="glass-card p-6 h-fit">
              <h3 class="font-serif text-xl text-prism-gold mb-4">Add Media</h3>
              <form id="add-media-form" class="space-y-4">
                <select id="media-type" class="w-full bg-prism-black/60 border border-prism-pearl/10 rounded-lg px-4 py-3 text-sm focus:border-prism-gold/60 focus:outline-none text-prism-pearl">
                  <option value="image">Image</option>
                  <option value="video">Video</option>
                </select>
                <input required id="media-url" placeholder="Media URL (e.g., https://...)" class="w-full bg-prism-black/60 border border-prism-pearl/10 rounded-lg px-4 py-3 text-sm focus:border-prism-gold/60 focus:outline-none text-prism-pearl" />
                <button type="submit" class="w-full py-3 rounded-full bg-prism-blue text-prism-pearl font-medium hover:bg-prism-blue/80 transition text-sm">
                  Upload Media
                </button>
              </form>
            </div>
            
            <div class="md:col-span-2 glass-card p-6">
              <h3 class="font-serif text-xl text-prism-gold mb-4">Current Gallery</h3>
              <div class="grid grid-cols-2 md:grid-cols-3 gap-4" id="admin-gallery-grid">
                ${items.map((it, i) => `
                  <div class="relative group rounded-lg overflow-hidden border border-prism-pearl/10 aspect-square bg-prism-black/50">
                    ${it.type === 'video' 
                      ? `<div class="absolute inset-0 flex items-center justify-center bg-prism-black/50 z-10"><i data-lucide="video" class="w-6 h-6 text-prism-pearl"></i></div>` 
                      : ''}
                    <img src="${it.src}" class="w-full h-full object-cover" onerror="this.src='https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=600'" />
                    <div class="absolute inset-0 bg-prism-black/80 opacity-0 group-hover:opacity-100 transition flex items-center justify-center z-20">
                      <button data-idx="${i}" type="button" class="del-media-btn w-10 h-10 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center hover:bg-red-500 hover:text-white transition">
                        <i data-lucide="trash-2" class="w-4 h-4"></i>
                      </button>
                    </div>
                  </div>
                `).join('')}
                ${items.length === 0 ? '<p class="text-prism-pearl/50 text-sm col-span-full">No media found.</p>' : ''}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    if (window.lucide) lucide.createIcons();

    document.getElementById('close-admin').addEventListener('click', close);
    
    document.getElementById('add-media-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const type = document.getElementById('media-type').value;
      const src = document.getElementById('media-url').value;
      const newItems = [...JSON.parse(localStorage.getItem('prism_gallery') || '[]'), { type, src }];
      localStorage.setItem('prism_gallery', JSON.stringify(newItems));
      renderGallery();
      renderDashboard();
    });

    document.querySelectorAll('.del-media-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(e.currentTarget.dataset.idx, 10);
        const currItems = JSON.parse(localStorage.getItem('prism_gallery') || '[]');
        currItems.splice(idx, 1);
        localStorage.setItem('prism_gallery', JSON.stringify(currItems));
        renderGallery();
        renderDashboard();
      });
    });
  };

  renderDashboard();
}
