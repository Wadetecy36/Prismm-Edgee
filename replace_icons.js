const fs = require('fs');
const path = require('path');
const https = require('https');

const dirs = [
  path.join(__dirname, 'kqDJT8D'),
  path.join(__dirname, 'yoTDTIS')
];

let filesToProcess = [];

function findFiles(d) {
  const files = fs.readdirSync(d);
  for (let f of files) {
    const full = path.join(d, f);
    if (fs.statSync(full).isDirectory()) findFiles(full);
    else if (f.endsWith('.html') || f.endsWith('.js')) {
      filesToProcess.push(full);
    }
  }
}
dirs.forEach(findFiles);

const uniqueIcons = new Set();
const fileIcons = {};

const re = /<i\s+[^>]*data-lucide=["']([^"']+)["'][^>]*><\/i>/gi;

filesToProcess.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  let match;
  fileIcons[file] = [];
  while ((match = re.exec(content)) !== null) {
    uniqueIcons.add(match[1]);
    fileIcons[file].push({
      fullMatch: match[0],
      iconName: match[1]
    });
  }
});

console.log('Unique icons:', Array.from(uniqueIcons));

// Download all SVGs
async function fetchSvg(name) {
  return new Promise((resolve, reject) => {
    https.get(`https://unpkg.com/lucide-static@0.344.0/icons/${name}.svg`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) resolve(data);
        else resolve(null);
      });
    }).on('error', reject);
  });
}

async function run() {
  const svgMap = {};
  for (const icon of uniqueIcons) {
    console.log('Fetching', icon);
    const svg = await fetchSvg(icon);
    if (svg) {
      svgMap[icon] = svg;
    } else {
      console.log('FAILED to fetch', icon);
    }
  }

  // Replace in files
  for (const file of filesToProcess) {
    const matches = fileIcons[file];
    if (!matches || matches.length === 0) continue;
    
    let content = fs.readFileSync(file, 'utf8');
    let changed = false;
    
    const replaceRe = /<i\s+(.*?)(data-lucide=["']([^"']+)["'])(.*?)><\/i>/gi;
    
    content = content.replace(replaceRe, (match, before, dataAttr, iconName, after) => {
      const svg = svgMap[iconName];
      if (!svg) return match;
      
      let cls = '';
      const clsMatch = match.match(/class=["']([^"']+)["']/i);
      if (clsMatch) {
        cls = clsMatch[1];
      }
      
      let newSvg = svg.replace(/class="[^"]*"/, ''); 
      newSvg = newSvg.replace('<svg ', `<svg class="${cls}" `);
      changed = true;
      return newSvg;
    });
    
    if (changed) {
      fs.writeFileSync(file, content, 'utf8');
      console.log('Updated', file);
    }
  }
}

run();
