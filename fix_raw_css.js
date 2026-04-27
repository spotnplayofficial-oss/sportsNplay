const fs = require('fs');
const path = require('path');

const dirs = [
  'c:/Users/shikh/Desktop/SpotAndPlay/playnsports/client/src/pages',
  'c:/Users/shikh/Desktop/SpotAndPlay/playnsports/client/src/components'
];

function walk(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    let filepath = path.join(dir, file);
    if (fs.statSync(filepath).isDirectory()) {
      results = results.concat(walk(filepath));
    } else if (file.endsWith('.jsx') || file.endsWith('.js')) {
      results.push(filepath);
    }
  });
  return results;
}

const files = walk(dirs[0]).concat(walk(dirs[1]));

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let newContent = content;

  // Replace text colors
  newContent = newContent.replace(/color:\s*'(?:white|#fff|#ffffff)'/g, "color: 'var(--text-main)'");
  newContent = newContent.replace(/color:\s*white;/g, 'color: var(--text-main);');
  newContent = newContent.replace(/color:\s*(?:white|#fff) !important;/g, 'color: var(--text-main) !important;');

  // Muted texts
  newContent = newContent.replace(/color:\s*'rgba\(255,255,255,0.5\)'/g, "color: 'var(--text-muted)'");

  // Solid Backgrounds
  newContent = newContent.replace(/background:\s*#111 !important;/g, 'background: var(--bg-surface) !important;');
  newContent = newContent.replace(/background:\s*#111;/g, 'background: var(--bg-surface);');
  newContent = newContent.replace(/background:\s*'(?:#111|#060606|#1a1a1a)'/g, "background: 'var(--bg-surface)'");

  // Specific MapSearch leaflet container issue, user said dark map is okay. 
  // Let's make the map container surface color use var(--bg-surface) but fallback to black if needed?
  // wait `.map-container .leaflet-container`  background: #0a0a0a !important;
  newContent = newContent.replace(/background:\s*#0a0a0a !important;/g, 'background: var(--bg-surface) !important;');

  if (content !== newContent) {
    fs.writeFileSync(file, newContent, 'utf8');
    console.log('Fixed raw CSS in:', path.basename(file));
  }
});
