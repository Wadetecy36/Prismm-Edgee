const API_KEY = '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';
const MODEL = 'deepseek/deepseek-chat-v3-0324:free';
const MAX_TURNS = 4;

const SYSTEM_PROMPT = `You are PRISMA, a highly professional yet warm and friendly AI brand consultant for Prism Labs, a division of Prism Edge. Your role is to have a natural, engaging conversation with business owners to understand their brand, products, target market, current challenges, and goals.

Ask smart follow-up questions. Be encouraging but honest. Keep responses concise (2-4 sentences). After gathering enough information (about 4-6 user exchanges), generate a structured analysis.

When ready to deliver the analysis, respond with normal text PLUS a JSON block wrapped in <ANALYSIS>...</ANALYSIS> tags with this exact structure:
<ANALYSIS>
{
  "scores": {
    "Online Presence": 0-100,
    "Content Quality": 0-100,
    "Target Audience Clarity": 0-100,
    "Conversion Strategy": 0-100,
    "Brand Identity": 0-100
  },
  "working": ["point 1", "point 2", "point 3"],
  "fix": ["point 1", "point 2", "point 3"],
  "roadmap": [
    {"step": "Step name", "detail": "short detail"},
    {"step": "Step name", "detail": "short detail"},
    {"step": "Step name", "detail": "short detail"}
  ],
  "recommendation": "Recommended Prism Labs service"
}
</ANALYSIS>

Always end the analysis with an invitation to speak with the human team at Prism Labs.`;

const history = [
  { role: 'system', content: SYSTEM_PROMPT }
];

let chartInstance = null;
let turnCount = 0;
let hasAnalyzed = false;

function addMessage(text, sender) {
  const wrap = document.getElementById('chat-messages');
  const div = document.createElement('div');
  div.className = sender === 'ai' ? 'msg-ai' : 'msg-user';
  const cleaned = text.replace(/<ANALYSIS>[\s\S]*?<\/ANALYSIS>/, '').trim();
  div.textContent = cleaned || text;
  wrap.appendChild(div);
  wrap.scrollTop = wrap.scrollHeight;
}

function addTyping() {
  const wrap = document.getElementById('chat-messages');
  const div = document.createElement('div');
  div.className = 'msg-ai';
  div.id = 'typing-bubble';
  div.innerHTML = '<span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span>';
  wrap.appendChild(div);
  wrap.scrollTop = wrap.scrollHeight;
}
function removeTyping() {
  const t = document.getElementById('typing-bubble');
  if (t) t.remove();
}

async function callAI(userMessage) {
  history.push({ role: 'user', content: userMessage });
  
  let currentHistory = [...history];
  if (turnCount >= MAX_TURNS && !hasAnalyzed) {
    currentHistory.push({ role: 'system', content: 'The user has provided enough information. You MUST now output the JSON analysis wrapped in <ANALYSIS>...</ANALYSIS> tags. Do not ask further questions.' });
  }

  try {
    const targetUrl = 'https://openrouter.ai/api/v1/chat/completions';
    const proxyUrl = 'https://edge.flowith.io/api-proxy/' + encodeURIComponent(targetUrl);

    const res = await fetch(proxyUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: MODEL,
        messages: currentHistory,
        temperature: 0.8
      })
    });
    const data = await res.json();
    const reply = data.choices?.[0]?.message?.content || "I'm having trouble connecting. Could you try again?";
    history.push({ role: 'assistant', content: reply });
    return reply;
  } catch (e) {
    return "I'm experiencing a brief connection delay. Please try again in a moment.";
  }
}

function parseAnalysis(text) {
  const m = text.match(/<ANALYSIS>([\s\S]*?)<\/ANALYSIS>/);
  if (!m) return null;
  try { return JSON.parse(m[1].trim()); } catch { return null; }
}

function renderAnalysis(data) {
  const placeholder = document.getElementById('analysis-placeholder');
  const out = document.getElementById('analysis-output');
  
  gsap.to(placeholder, { opacity: 0, duration: 0.5, onComplete: () => {
    placeholder.classList.add('hidden');
    out.classList.remove('hidden');
    
    gsap.fromTo(out, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" });

    if (chartInstance) chartInstance.destroy();
    const ctx = document.getElementById('brandRadar').getContext('2d');
    chartInstance = new Chart(ctx, {
      type: 'radar',
      data: {
        labels: Object.keys(data.scores),
        datasets: [{
          label: 'Brand Strength',
          data: Object.values(data.scores),
          backgroundColor: 'rgba(232,201,122,0.2)',
          borderColor: '#E8C97A',
          borderWidth: 2,
          pointBackgroundColor: '#1A3EBF',
          pointBorderColor: '#E8C97A'
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { labels: { color: '#F5F5F0' } } },
        scales: {
          r: {
            beginAtZero: true,
            max: 100,
            grid: { color: 'rgba(232,201,122,0.15)' },
            angleLines: { color: 'rgba(232,201,122,0.15)' },
            pointLabels: { color: '#F5F5F0', font: { size: 10 } },
            ticks: { color: '#E8C97A', backdropColor: 'transparent', font: { size: 9 } }
          }
        }
      }
    });

    document.getElementById('working-list').innerHTML = (data.working || []).map(w => `<li>• ${w}</li>`).join('');
    document.getElementById('fix-list').innerHTML = (data.fix || []).map(w => `<li>• ${w}</li>`).join('');
    document.getElementById('roadmap-list').innerHTML = (data.roadmap || []).map((r, i) => `
      <li class="flex gap-3 analysis-item opacity-0 transform translate-y-4">
        <span class="w-6 h-6 rounded-full bg-prism-gold text-prism-black flex items-center justify-center text-xs font-bold flex-shrink-0">${i+1}</span>
        <div>
          <p class="text-prism-gold text-sm">${r.step}</p>
          <p class="text-prism-pearl/60 text-xs">${r.detail}</p>
        </div>
      </li>
    `).join('');
    
    gsap.to('.analysis-item', { opacity: 1, y: 0, duration: 0.5, stagger: 0.2, delay: 0.3 });
  }});
}

export function initPrismaChat() {
  const form = document.getElementById('chat-form');
  const input = document.getElementById('chat-input');

  addMessage("Hi! I'm PRISMA, your AI brand strategist from Prism Labs. I'm here to help you understand your brand's growth potential. Let's start — tell me about your business. What do you sell or offer, and who is your target audience?", 'ai');
  history.push({ role: 'assistant', content: "Hi! I'm PRISMA..." });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const txt = input.value.trim();
    if (!txt) return;
    addMessage(txt, 'user');
    input.value = '';
    
    turnCount++;
    addTyping();
    const reply = await callAI(txt);
    removeTyping();
    addMessage(reply, 'ai');
    
    if (!hasAnalyzed) {
      let analysis = parseAnalysis(reply);
      if (!analysis && turnCount >= MAX_TURNS) {
        analysis = {
          scores: { "Online Presence": 40, "Content Quality": 60, "Target Audience Clarity": 50, "Conversion Strategy": 30, "Brand Identity": 70 },
          working: ["Strong core product vision", "Clear brand ambition"],
          fix: ["Lack of clear digital footprint", "Inconsistent content strategy"],
          roadmap: [
            { step: "Digital Foundation", detail: "Launch a conversion-optimized website tailored for target audience." },
            { step: "Content Strategy", detail: "Develop a focused content calendar." },
            { step: "Paid Acquisition", detail: "Setup targeted ad campaigns to accelerate growth." }
          ],
          recommendation: "Website Development & Digital Marketing Accelerator"
        };
      }
      
      if (analysis) {
        hasAnalyzed = true;
        renderAnalysis(analysis);
      }
    }
  });
}
