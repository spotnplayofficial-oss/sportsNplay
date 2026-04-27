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

  // 1. Clean up duplicate CSS tailwind collisions
  newContent = newContent.replace(/bg-black\/(\d+) dark:bg-white\/\1 dark:bg-black\/\1/g, 'bg-white/$1 dark:bg-black/$1');
  newContent = newContent.replace(/bg-white\/(\d+) dark:bg-black\/\1 dark:bg-white\/\1/g, 'bg-black/$1 dark:bg-white/$1');
  
  newContent = newContent.replace(/border-white\/(\d+) dark:border-black\/\1 dark:border-white\/\1/g, 'border-black/$1 dark:border-white/$1');
  newContent = newContent.replace(/border-black\/(\d+) dark:border-white\/\1 dark:border-black\/\1/g, 'border-white/$1 dark:border-black/$1');

  // Fix text-gray collisions
  newContent = newContent.replace(/text-gray-900 dark:text-white dark:text-gray-900/g, 'text-gray-900 dark:text-white');
  newContent = newContent.replace(/text-gray-600 dark:text-gray-400 dark:text-gray-600/g, 'text-gray-600 dark:text-gray-400');
  newContent = newContent.replace(/text-gray-700 dark:text-gray-300 dark:text-gray-700/g, 'text-gray-700 dark:text-gray-300');
  newContent = newContent.replace(/text-gray-800 dark:text-gray-200 dark:text-gray-800/g, 'text-gray-800 dark:text-gray-200');

  // Fix Navbar hamburger menu being invisible white in light mode
  if (file.includes('Navbar.jsx')) {
    newContent = newContent.replace(/background:\s*white;/g, 'background: var(--text-main);');
  }

  // 2. Fix hardcoded input fields and form labels globally via injected styles
  // Old logic from dark mode had explicit styling
  newContent = newContent.replace(/color:\s*rgba\(255,255,255,0\.[3-6]\);/g, 'color: var(--text-muted);');
  newContent = newContent.replace(/color:\s*rgba\(255,\s*255,\s*255,\s*0\.[3-6]\);/g, 'color: var(--text-muted);');
  newContent = newContent.replace(/\.input-field\s*\{\s*[^}]*background:\s*rgba\(255,255,255,0\.0[2-5]\);/g, (match) => match.replace(/background:\s*rgba\(255,255,255,0\.0[2-5]\);/, 'background: var(--glass-05);'));
  newContent = newContent.replace(/\.input-field::placeholder\s*\{\s*color:\s*(?:var\([^)]+\)|rgba\([^)]+\));\s*\}/g, '.input-field::placeholder { color: var(--text-muted); opacity: 0.5; }');
  
  newContent = newContent.replace(/\.label\s*\{\s*font-size:\s*11px;\s*color:\s*(?:rgba\([^)]+\)|white);\s*text-transform:/g, '.label { font-size: 11px; color: var(--text-muted); text-transform:');

  // 3. User request: "login box white dark border" (white mode)
  // Which meant replacing the glass morph on Login/Register
  if (file.includes('Login.jsx') || file.includes('Register.jsx') || file.includes('OTPLogin.jsx')) {
    newContent = newContent.replace(/bg-black\/2 dark:bg-white\/2 border border-white\/6 dark:border-black\/6 dark:border-white\/6/g, 'bg-white dark:bg-white/2 border border-black/10 dark:border-white/6');
  }

  if (content !== newContent) {
    fs.writeFileSync(file, newContent, 'utf8');
    console.log('Fixed clean up styles in:', path.basename(file));
  }
});
