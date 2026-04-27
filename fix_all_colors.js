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
    } else if (file.endsWith('.jsx')) {
      results.push(filepath);
    }
  });
  return results;
}

const files = walk(dirs[0]).concat(walk(dirs[1]));

files.forEach(f => {
  let c = fs.readFileSync(f, 'utf8');
  let oldC = c;

  c = c.replace(/color:\s*rgba\(255,\s*255,\s*255,\s*0\.[1-9]+\)(?=[;!\}\r\n])/g, 'color: var(--text-muted)');
  c = c.replace(/background:\s*rgba\(255,\s*255,\s*255,\s*0\.0[1-9]\)(?=[;!\}\r\n])/g, 'background: var(--glass-05)');
  c = c.replace(/border-color:\s*rgba\(255,\s*255,\s*255,\s*0\.1[0-9]\)(?=[;!\}\r\n])/g, 'border-color: var(--glass-10)');
  
  if (oldC !== c) {
    fs.writeFileSync(f, c);
    console.log('Final cleanup in', f);
  }
});
