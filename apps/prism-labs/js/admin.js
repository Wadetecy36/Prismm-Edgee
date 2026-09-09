function initAdmin() {
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
      close();
      openAdminDashboard();
    } else {
      alert('Invalid credentials. Use "admin" and "password".');
    }
  });
}

async function openAdminDashboard() {
  const root = document.getElementById('admin-root');
  document.body.style.overflow = 'hidden';

  const close = () => {
    root.innerHTML = '';
    document.body.style.overflow = '';
  };

  const renderDashboard = async () => {
    // Always read from IndexedDB so it matches what gallery.js renders
    let items = [];
    try {
      if (window.PrismDB) {
        items = await window.PrismDB.getAllMedia('prism_gallery');
        items = items.sort((a, b) => (b.ts || 0) - (a.ts || 0));
      }
    } catch (e) {
      console.warn('Could not load from IndexedDB', e);
    }

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
              <h3 class="font-serif text-xl text-prism-gold mb-4">Upload Media</h3>
              <form id="add-media-form" class="space-y-4">
                <div class="space-y-2">
                  <label class="text-[10px] tracking-widest text-prism-gold/70 uppercase">Select File</label>
                  <input required type="file" id="media-file" accept="image/*,video/*"
                    class="w-full bg-prism-black/60 border border-prism-pearl/10 rounded-lg px-4 py-3 text-sm focus:border-prism-gold/60 focus:outline-none text-prism-pearl file:bg-prism-gold file:text-prism-black file:border-none file:rounded-full file:px-3 file:py-1 file:mr-3 file:text-xs file:font-medium file:cursor-pointer" />
                </div>
                <div id="upload-status" class="hidden text-[10px] text-prism-gold animate-pulse">Processing file...</div>
                <div id="upload-success" class="hidden text-[10px] text-green-400">✓ Uploaded successfully!</div>
                <button type="submit" id="upload-btn"
                  class="w-full py-3 rounded-full bg-prism-gold text-prism-black font-medium hover:scale-[1.02] transition text-sm flex items-center justify-center gap-2">
                  <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/>
                    <path d="M12 12v9"/><path d="m16 16-4-4-4 4"/>
                  </svg>
                  Add to Marketing Gallery
                </button>
              </form>
            </div>
            
            <div class="md:col-span-2 glass-card p-6">
              <h3 class="font-serif text-xl text-prism-gold mb-4">Current Gallery
                <span class="text-sm font-sans font-normal text-prism-gold/50 ml-2">${items.length} item${items.length !== 1 ? 's' : ''}</span>
              </h3>
              <div class="grid grid-cols-2 md:grid-cols-3 gap-4" id="admin-gallery-grid">
                ${items.map((it) => `
                  <div class="relative group rounded-lg overflow-hidden border border-prism-pearl/10 aspect-square bg-prism-black/50">
                    <div class="absolute top-2 left-2 z-10">
                      <span class="px-2 py-0.5 rounded-full bg-prism-black/80 text-[8px] text-prism-gold border border-prism-gold/20 uppercase tracking-tighter">
                        ${it.type}
                      </span>
                    </div>
                    ${it.type === 'video'
                      ? `<video src="${it.src}" class="w-full h-full object-cover" muted loop autoplay playsinline></video>`
                      : `<img src="${it.src}" class="w-full h-full object-cover" />`}
                    <div class="absolute inset-0 bg-prism-black/80 opacity-0 group-hover:opacity-100 transition flex items-center justify-center z-20">
                      <button data-id="${it.id}" type="button" class="del-media-btn w-12 h-12 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center hover:bg-red-500 hover:text-white transition shadow-2xl">
                        <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                `).join('')}
                ${items.length === 0 ? '<p class="text-prism-pearl/50 text-sm col-span-full py-12 text-center border-2 border-dashed border-prism-pearl/5 rounded-xl">No media items in gallery.</p>' : ''}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    if (window.lucide) lucide.createIcons();

    document.getElementById('close-admin').addEventListener('click', close);

    document.getElementById('add-media-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const fileInput = document.getElementById('media-file');
      const statusEl = document.getElementById('upload-status');
      const successEl = document.getElementById('upload-success');
      const btn = document.getElementById('upload-btn');
      const file = fileInput.files[0];

      if (!file) return;

      statusEl.classList.remove('hidden');
      successEl.classList.add('hidden');
      btn.disabled = true;
      btn.style.opacity = '0.6';

      try {
        const src = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (ev) => resolve(ev.target.result);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        const type = file.type.startsWith('video') ? 'video' : 'image';
        const item = { type, src, caption: file.name, ts: Date.now() };

        if (window.PrismDB) {
          await window.PrismDB.saveMedia(item, 'prism_gallery');
          // Write lightweight sync keys so gallery.js in other tabs picks up changes
          const ts = Date.now().toString();
          try { localStorage.setItem('prism_gallery_sync', ts); } catch(_) {}
          try { localStorage.setItem('prism_gallery_ts', ts); } catch(_) {}
          // Also try BroadcastChannel
          try {
            const ch = new BroadcastChannel('prism_sync');
            ch.postMessage({ type: 'PRISM_GALLERY_UPDATED' });
            ch.close();
          } catch (_) {}
          window.dispatchEvent(new StorageEvent('storage', { key: 'prism_gallery_sync' }));
        }

        // Refresh the gallery on the page behind the modal
        if (typeof renderGallery === 'function') await renderGallery();

        statusEl.classList.add('hidden');
        successEl.classList.remove('hidden');
        fileInput.value = '';
        setTimeout(() => successEl.classList.add('hidden'), 3000);

        // Re-render the dashboard grid
        await renderDashboard();
      } catch (err) {
        console.error('Upload error:', err);
        statusEl.textContent = '✗ Upload failed. Try a smaller file.';
        statusEl.classList.remove('animate-pulse');
        statusEl.style.color = '#f87171';
      } finally {
        btn.disabled = false;
        btn.style.opacity = '';
      }
    });

    document.querySelectorAll('.del-media-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        if (!confirm('Remove this item from the gallery?')) return;
        const id = e.currentTarget.dataset.id;
        try {
          if (window.PrismDB) {
            // id may be a number (IndexedDB autoIncrement) or string (localStorage fallback)
            const numId = Number(id);
            await window.PrismDB.deleteMedia(isNaN(numId) ? id : numId, 'prism_gallery');
          }
          // Sync to other tabs
          const ts = Date.now().toString();
          try { localStorage.setItem('prism_gallery_sync', ts); } catch(_) {}
          try { localStorage.setItem('prism_gallery_ts', ts); } catch(_) {}
          try {
            const ch = new BroadcastChannel('prism_sync');
            ch.postMessage({ type: 'PRISM_GALLERY_UPDATED' });
            ch.close();
          } catch (_) {}
          if (typeof renderGallery === 'function') await renderGallery();
          await renderDashboard();
        } catch (err) {
          console.error('Delete error:', err);
        }
      });
    });
  };

  await renderDashboard();
}
