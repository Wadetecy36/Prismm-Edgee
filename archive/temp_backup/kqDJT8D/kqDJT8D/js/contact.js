import { showToast } from './toast.js';

export function initContact() {
  const form = document.getElementById('contact-form');
  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form));
    console.log('📧 Mock EmailJS send:', data);
    form.reset();
    showToast(`Message sent! We'll be in touch with you soon.`);
  });
}
