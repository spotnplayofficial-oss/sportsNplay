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

  // Wait, I should not match existing "dark:" just in case, but there aren't any.

  newContent = newContent.replace(/bg-\[#060606\]/g, 'bg-[#fcfcfc] dark:bg-[#060606]');
  newContent = newContent.replace(/bg-\[#1a1a1a\]/g, 'bg-[#ffffff] dark:bg-[#1a1a1a]');
  
  newContent = newContent.replace(/bg-black\/([0-9]+)/g, 'bg-white/$1 dark:bg-black/$1');
  newContent = newContent.replace(/bg-white\/([0-9]+)/g, 'bg-black/$1 dark:bg-white/$1');
  newContent = newContent.replace(/border-white\/([0-9]+)/g, 'border-black/$1 dark:border-white/$1');
  newContent = newContent.replace(/border-black\/([0-9]+)/g, 'border-white/$1 dark:border-black/$1');
  newContent = newContent.replace(/border-white(?!\w|-|\/)/g, 'border-black/10 dark:border-white');

  newContent = newContent.replace(/text-white(?!\w|-|\/)/g, 'text-gray-900 dark:text-white');
  newContent = newContent.replace(/text-white\/([0-9]+)/g, 'text-gray-900/$1 dark:text-white/$1');
  
  newContent = newContent.replace(/text-gray-400/g, 'text-gray-600 dark:text-gray-400');
  newContent = newContent.replace(/text-gray-300/g, 'text-gray-700 dark:text-gray-300');
  
  // Shimmer
  newContent = newContent.replace(/#fff 0%, #4ade80 50%, #fff 100%/g, 'var(--shimmer-color)');

  // Note: the CSS variable approach to raw CSS strings.
  // The raw rgba(255) needs to be replaced with var(--glass-light)
  newContent = newContent.replace(/rgba\(255,255,255,0.02\)/g, 'var(--glass-02, rgba(255,255,255,0.02))');
  newContent = newContent.replace(/rgba\(255,255,255,0.04\)/g, 'var(--glass-04, rgba(255,255,255,0.04))');
  newContent = newContent.replace(/rgba\(255,255,255,0.05\)/g, 'var(--glass-05, rgba(255,255,255,0.05))');
  newContent = newContent.replace(/rgba\(255,255,255,0.06\)/g, 'var(--glass-06, rgba(255,255,255,0.06))');
  newContent = newContent.replace(/rgba\(255,255,255,0.08\)/g, 'var(--glass-08, rgba(255,255,255,0.08))');
  newContent = newContent.replace(/rgba\(255,255,255,0.1\)/g, 'var(--glass-10, rgba(255,255,255,0.1))');
  newContent = newContent.replace(/rgba\(255,255,255,0.2\)/g, 'var(--glass-20, rgba(255,255,255,0.2))');

  // specific fix for whitespace-nowrap that gets caught:
  newContent = newContent.replace(/text-gray-900space-nowrap/g, 'whitespace-nowrap');

  if (content !== newContent) {
    fs.writeFileSync(file, newContent, 'utf8');
    console.log('Modified', path.basename(file));
  }
});
