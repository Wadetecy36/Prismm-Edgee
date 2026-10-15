import { seedGallery } from './data.js';
import { showToast } from './toast.js';

let items = [];
let current = 0;

export function initGallery() {
  const stored = localStorage.getItem('pe_gallery');
  items = stored ? JSON.parse(stored) : [...seedGallery];

  renderGrid();
  initAdmin();
  initLightbox();

  const fab = document.getElementById('upload-fab');
  fab?.addEventListener('click', openUploadModal);
}

function escapeHtml(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderGrid() {
  const grid = document.getElementById('gallery-grid');
  if (!grid) return;
  grid.innerHTML = items.map((it, i) => {
    const safeUrl = encodeURI(it.url || '');
    const safeCaption = escapeHtml(it.caption || '');
    const media = it.type === 'video'
      ? `<video src="${safeUrl}" muted></video><div class="play-overlay"><div class="pbtn"><svg width="20" height="20" fill="white" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg></div></div>`
      : `<img src="${safeUrl}" alt="${safeCaption}" loading="lazy">`;
    return `<div class="gallery-item" data-i="${i}">${media}<div class="caption">${safeCaption}</div></div>`;
  }).join('');

  grid.querySelectorAll('.gallery-item').forEach(el => {
    el.addEventListener('click', () => openLightbox(parseInt(el.dataset.i)));
  });
}

async function initAdmin() {
  const fab = document.getElementById('upload-fab');

  // Verify server-side session
  try {
    const res = await fetch('/api/auth/check', { credentials: 'same-origin' }).catch(() => null);
    if (res && res.ok) {
      const data = await res.json();
      if (data && data.authenticated) {
        sessionStorage.setItem('pe_admin', '1');
        fab?.classList.remove('hidden');
        fab?.classList.add('flex');
      }
    }
  } catch (_) {}

  const isAdmin = sessionStorage.getItem('pe_admin') === '1';
  if (isAdmin) { fab?.classList.remove('hidden'); fab?.classList.add('flex'); }

  let keys = '';
  document.addEventListener('keydown', async (e) => {
    keys += e.key.toLowerCase();
    if (keys.length > 20) keys = keys.slice(-20);
    if (keys.includes('admin')) {
      const pass = prompt('Admin password:');
      if (pass) {
        try {
          const authRes = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'same-origin',
            body: JSON.stringify({ password: pass })
          });
          const authData = await authRes.json().catch(() => ({}));
          if (authRes.ok && authData.success) {
            sessionStorage.setItem('pe_admin', '1');
            fab?.classList.remove('hidden');
            fab?.classList.add('flex');
            showToast('Admin mode enabled');
          } else {
            alert(authData.error || 'Incorrect password');
          }
        } catch (_) {
          alert('Authentication service unreachable');
        }
      }
      keys = '';
    }
  });
}

function openUploadModal() {
  const modal = document.getElementById('upload-modal');
  modal.classList.remove('hidden');
  modal.classList.add('flex');

  const closeBtn = document.getElementById('upload-close');
  const dropZone = document.getElementById('drop-zone');
  const fileBtn = document.getElementById('file-btn');
  const fileInput = document.getElementById('file-input');
  const fileName = document.getElementById('file-name');
  const postBtn = document.getElementById('post-btn');
  const captionInput = document.getElementById('caption-input');

  let selectedFile = null;

  const close = () => {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    fileName.textContent = '';
    captionInput.value = '';
    selectedFile = null;
  };

  closeBtn.onclick = close;
  fileBtn.onclick = (e) => { e.stopPropagation(); fileInput.click(); };
  dropZone.onclick = () => fileInput.click();
  fileInput.onchange = (e) => {
    selectedFile = e.target.files[0];
    if (selectedFile) fileName.textContent = selectedFile.name;
  };
  dropZone.ondragover = (e) => { e.preventDefault(); dropZone.style.borderColor = '#E8C97A'; };
  dropZone.ondragleave = () => { dropZone.style.borderColor = ''; };
  dropZone.ondrop = (e) => {
    e.preventDefault();
    dropZone.style.borderColor = '';
    selectedFile = e.dataTransfer.files[0];
    if (selectedFile) fileName.textContent = selectedFile.name;
  };

  postBtn.onclick = () => {
    if (!selectedFile) { alert('Please select a file'); return; }
    const reader = new FileReader();
    reader.onload = (ev) => {
      items.unshift({
        type: selectedFile.type.startsWith('video') ? 'video' : 'image',
        url: ev.target.result,
        caption: captionInput.value || 'Untitled',
        ts: Date.now(),
      });
      localStorage.setItem('pe_gallery', JSON.stringify(items));
      renderGrid();
      showToast('Media uploaded successfully');
      close();
    };
    reader.readAsDataURL(selectedFile);
  };
}

function openLightbox(i) {
  current = i;
  const lb = document.getElementById('lightbox');
  lb.classList.remove('hidden');
  lb.classList.add('flex');
  renderLightbox();

  document.getElementById('lb-close').onclick = closeLightbox;
  document.getElementById('lb-prev').onclick = () => { current = (current - 1 + items.length) % items.length; renderLightbox(); };
  document.getElementById('lb-next').onclick = () => { current = (current + 1) % items.length; renderLightbox(); };
}

function renderLightbox() {
  const it = items[current];
  const content = document.getElementById('lb-content');
  if (!content || !it) return;
  const safeUrl = encodeURI(it.url || '');
  const safeCaption = escapeHtml(it.caption || '');
  content.innerHTML = it.type === 'video'
    ? `<video src="${safeUrl}" controls autoplay muted></video>`
    : `<img src="${safeUrl}" alt="${safeCaption}">`;
  document.getElementById('lb-caption').textContent = it.caption;
}

function closeLightbox() {
  const lb = document.getElementById('lightbox');
  lb.classList.add('hidden');
  lb.classList.remove('flex');
  document.getElementById('lb-content').innerHTML = '';
}

function initLightbox() {
  document.addEventListener('keydown', (e) => {
    const lb = document.getElementById('lightbox');
    if (lb.classList.contains('hidden')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') { current = (current - 1 + items.length) % items.length; renderLightbox(); }
    if (e.key === 'ArrowRight') { current = (current + 1) % items.length; renderLightbox(); }
  });
}
