async function getStories() {
  try {
    const items = await window.PrismDB.getAllMedia('pe_stories');
    if (items && items.length > 0) {
      return items.sort((a, b) => b.ts - a.ts);
    }
  } catch(e) {
    console.error("Failed to load pe_stories from DB", e);
  }
  
  // Default fallback story
  return [
    {
      companyName: 'BLACKCITY',
      tagline: 'STREETWEAR / IDENTITY',
      industry: 'UPCOMING CLOTHING BRAND',
      title: 'From vision to movement.',
      description: 'BlackCity came to us as a vision — a bold, unapologetic streetwear brand with a powerful identity but no digital presence. We worked closely with the BlackCity team to build their brand\'s online foundation, develop a content strategy that speaks to their audience, and map out a scaling roadmap that positions them for long-term growth.',
      quote: 'This is what we live for — taking raw potential and turning it into a movement.',
      logoUrl: 'assets/blakcity-logo.png',
      bgUrl: 'assets/blakcity-poster.png'
    }
  ];
}

async function renderStories() {
  const stories = await getStories();
  const container = document.getElementById('stories-container');
  if (!container) return;

  if (stories.length === 0) {
    container.innerHTML = '<p class="text-center text-prism-pearl/40">No stories added yet.</p>';
    return;
  }

  container.innerHTML = stories.map((story, idx) => `
    <div class="case-study-card reveal interactive-story" data-idx="${idx}" style="transform-style: preserve-3d;">
      <div class="grid md:grid-cols-5 gap-0">
        <div class="md:col-span-2 case-visual flex items-center justify-center p-12 min-h-[400px] relative overflow-hidden" style="background-color: #050505; transform-style: preserve-3d;">
          ${story.logoUrl ? `<img src="${story.logoUrl}" class="absolute inset-0 w-full h-full object-contain opacity-20" style="transform: translateZ(10px);" />` : ''}
          <div class="relative z-10 text-center" style="transform: translateZ(20px);">
            <p class="text-prism-gold/60 text-xs tracking-[0.4em] mb-3">FEATURED CASE STUDY</p>
            <h3 class="font-serif text-5xl md:text-6xl text-prism-pearl mb-2">${story.companyName}</h3>
            <p class="text-prism-pearl/50 text-sm tracking-widest">${story.tagline}</p>
          </div>
        </div>
        <div class="md:col-span-3 p-12 relative overflow-hidden flex flex-col justify-center" style="transform-style: preserve-3d;">
          <div class="absolute inset-0 z-0">
            ${story.bgUrl ? `<img src="${story.bgUrl}" class="w-full h-full object-cover opacity-30 grayscale hover:grayscale-0 transition-all duration-700" />` : '<div class="w-full h-full bg-prism-black opacity-30"></div>'}
            <div class="absolute inset-0 bg-gradient-to-r from-prism-black via-prism-black/80 to-transparent"></div>
          </div>
          <div class="relative z-10" style="transform: translateZ(15px);">
          <p class="text-prism-gold/80 text-xs tracking-[0.3em] mb-4">${story.industry}</p>
          <h4 class="font-serif text-4xl text-prism-pearl mb-6">${story.title}</h4>
          <p class="text-prism-pearl/85 text-lg leading-relaxed mb-8">${story.description}</p>
          ${story.quote ? `<p class="text-prism-gold italic font-serif text-lg">${story.quote}</p>` : ''}
          </div>
        </div>
      </div>
    </div>
  `).join('');
  
  if (window.lucide) lucide.createIcons();
  
  // Add 3D tilt effect to stories
  document.querySelectorAll('.interactive-story').forEach(el => {
    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const rotateX = (y / rect.height - 0.5) * 10;
      const rotateY = (x / rect.width - 0.5) * 10;
      
      el.style.transform = `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(15px)`;
    });
    
    el.addEventListener('mouseleave', () => {
      el.style.transform = 'perspective(1200px) rotateX(0) rotateY(0) translateZ(0)';
    });
  });
}

function initStories() {
  renderStories();

  window.addEventListener('storage', (e) => {
    if (e.key === 'pe_stories') {
      renderStories();
    }
  });

  const syncChannel = new BroadcastChannel('prism_sync');
  syncChannel.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'PE_STORIES_UPDATED') {
      renderStories();
    }
  });
}
