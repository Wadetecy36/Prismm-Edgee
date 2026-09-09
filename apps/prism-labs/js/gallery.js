async function getGalleryItems() {
  try {
    let items = await window.PrismDB.getAllMedia('prism_gallery');
    
    // Fallback: Check localStorage directly in case IndexedDB is isolated but LS is shared
    if (!items || items.length === 0) {
      try {
        const lsItems = JSON.parse(localStorage.getItem('prism_gallery') || '[]');
        if (lsItems.length > 0) items = lsItems;
      } catch(e) {}
    }

    if (items && items.length > 0) {
      return items.sort((a, b) => b.ts - a.ts);
    }
  } catch (e) {
    console.error("Failed to load prism_gallery from DB", e);
  }
  return window.CONFIG.galleryItems;
}

function openLightbox(item) {
  const root = document.getElementById('lightbox-root');
  if (!root) return;
  const mediaUrl = item.url || item.src;
  root.innerHTML = `
    <div class="modal-backdrop" id="lb-bd">
      <div class="relative max-w-5xl w-full" onclick="event.stopPropagation()">
        <button id="lb-close" class="absolute -top-12 right-0 text-prism-pearl hover:text-prism-gold"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>
        ${item.type === 'video'
      ? `<video controls autoplay class="w-full rounded-lg"><source src="${mediaUrl}" /></video>`
      : `<img src="${mediaUrl}" class="w-full rounded-lg" />`}
      </div>
    </div>
  `;
  document.getElementById('lb-close').onclick = () => { root.innerHTML = ''; };
  document.getElementById('lb-bd').onclick = () => { root.innerHTML = ''; };
}

// Track last known count to detect changes via polling
let _lastGalleryCount = -1;
let _lastGalleryTs = 0;

async function renderGallery() {
  const items = await getGalleryItems();
  const g = document.getElementById('media-gallery');
  if (!g) return;

  // Track state for change detection
  _lastGalleryCount = items.length;
  if (items.length > 0 && items[0].ts) _lastGalleryTs = items[0].ts;

  if (items.length === 0) {
    g.innerHTML = '<p class="col-span-4 text-center text-prism-pearl/40 py-8">No marketing media yet. Upload from the Admin Panel.</p>';
    return;
  }

  g.innerHTML = items.map((it, i) => {
    const mediaUrl = it.url || it.src;
    const media = it.type === 'video'
      ? `<video src="${mediaUrl}" muted loop autoplay playsinline class="w-full h-full object-cover"></video>`
      : `<img src="${mediaUrl}" loading="lazy" alt="${it.caption || 'campaign visual'}" onerror="this.src='https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=600'" />`;
    return `
    <div class="gallery-item group reveal" data-i="${i}" style="cursor: pointer;">
      ${media}
      <div class="absolute inset-0 bg-prism-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
        <div class="w-12 h-12 rounded-full border border-prism-gold/50 flex items-center justify-center text-prism-gold bg-prism-black/60">
          ${it.type === 'video' ? '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>' : '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 3 21 3 21 9"></polyline><polyline points="9 21 3 21 3 15"></polyline><line x1="21" y1="3" x2="14" y2="10"></line><line x1="3" y1="21" x2="10" y2="14"></line></svg>'}
        </div>
      </div>
      ${it.caption ? `<div class="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent"><p class="text-xs text-prism-pearl/80 truncate">${it.caption}</p></div>` : ''}
    </div>
    `;
  }).join('');

  if (window.lucide) lucide.createIcons();

  g.querySelectorAll('.gallery-item').forEach(el => {
    if (window.observeElement) window.observeElement(el);
    el.addEventListener('click', () => openLightbox(items[parseInt(el.dataset.i)]));
  });
}

function initGallery() {
  renderGallery();

  // Strategy 1: Listen to localStorage storage events.
  window.addEventListener('storage', (e) => {
    if (e.key === 'prism_gallery' || e.key === 'prism_gallery_ts' || e.key === 'prism_gallery_sync') {
      console.log('[Gallery] Storage event received for key:', e.key);
      renderGallery();
    }
  });

  // Strategy 2: BroadcastChannel
  try {
    const syncChannel = new BroadcastChannel('prism_sync');
    syncChannel.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'PRISM_GALLERY_UPDATED') {
        console.log('[Gallery] BroadcastChannel update received');
        renderGallery();
      }
    });
  } catch (_) { }

  // Strategy 3: POLLING — bulletproof fallback
  setInterval(async () => {
    try {
      const items = await window.PrismDB.getAllMedia('prism_gallery');
      const sortedItems = (items && items.length > 0) ? items.sort((a, b) => b.ts - a.ts) : [];
      const newCount = sortedItems.length;
      const newTs = (sortedItems.length > 0 && sortedItems[0].ts) ? sortedItems[0].ts : 0;

      if (newCount !== _lastGalleryCount || newTs !== _lastGalleryTs) {
        console.log('[Gallery] Polling detected change:', { oldCount: _lastGalleryCount, newCount, oldTs: _lastGalleryTs, newTs });
        renderGallery();
      }
    } catch (_) { }
  }, 3000);
}
