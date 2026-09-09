import { CONFIG } from './config.js';
import { observeElement } from './animations.js';

export function getGalleryItems() {
  const local = localStorage.getItem('prism_gallery');
  if (local) {
    try {
      return JSON.parse(local);
    } catch(e) { }
  }
  localStorage.setItem('prism_gallery', JSON.stringify(CONFIG.galleryItems));
  return CONFIG.galleryItems;
}

function openLightbox(item) {
  const root = document.getElementById('lightbox-root');
  root.innerHTML = `
    <div class="modal-backdrop" id="lb-bd">
      <div class="relative max-w-5xl w-full" onclick="event.stopPropagation()">
        <button id="lb-close" class="absolute -top-12 right-0 text-prism-pearl hover:text-prism-gold"><i data-lucide="x"></i></button>
        ${item.type === 'video'
          ? `<video controls autoplay class="w-full rounded-lg"><source src="${item.src}" /></video>`
          : `<img src="${item.src}" class="w-full rounded-lg" />`}
      </div>
    </div>
  `;
  if (window.lucide) lucide.createIcons();
  document.getElementById('lb-bd').addEventListener('click', () => root.innerHTML = '');
  document.getElementById('lb-close').addEventListener('click', () => root.innerHTML = '');
}

export function renderGallery() {
  const items = getGalleryItems();
  const g = document.getElementById('media-gallery');
  g.innerHTML = items.map((it, i) => `
    <div class="gallery-item reveal" data-i="${i}">
      <img src="${it.src}" loading="lazy" alt="campaign visual" onerror="this.src='https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=600'" />
      ${it.type === 'video' ? '<div class="absolute inset-0 flex items-center justify-center bg-black/30"><div class="w-14 h-14 rounded-full bg-prism-gold flex items-center justify-center"><i data-lucide="play" class="text-prism-black"></i></div></div>' : ''}
    </div>
  `).join('');
  
  if (window.lucide) lucide.createIcons();

  g.querySelectorAll('.gallery-item').forEach(el => {
    observeElement(el);
    el.addEventListener('click', () => openLightbox(items[el.dataset.i]));
  });
}

export function initGallery() {
  renderGallery();
}
