const fs = require('fs');
const path = require('path');
const brainDir = 'C:\\Users\\dines\\.gemini\\antigravity\\brain\\099d1afc-5924-49f5-bd3a-3ed010f92bb9';
const destDir = 'C:\\Users\\dines\\.gemini\\antigravity\\scratch\\GoMeat\\frontend\\public\\images\\products';

const filesToCopy = [
  { src: 'raw_surmai_steaks_1794232043934.jpg', dest: 'prod_1.jpg' },
  { src: 'raw_surmai_steaks_1794232043934.jpg', dest: 'raw_surmai.jpg' },
  { src: 'raw_mutton_curry_cut_1794232070700.jpg', dest: 'prod_4.jpg' },
  { src: 'raw_mutton_curry_cut_1794232070700.jpg', dest: 'raw_mutton.jpg' },
  { src: 'cooked_nati_koli_1794232016399.jpg', dest: 'cooked_nati_koli.jpg' },
  { src: 'cooked_fish_tikka_1794232043006.jpg', dest: 'cooked_fish_tikka.jpg' }
];

for (const f of filesToCopy) {
  const s = path.join(brainDir, f.src);
  const d = path.join(destDir, f.dest);
  if (fs.existsSync(s)) {
    fs.copyFileSync(s, d);
    console.log('Copied ' + f.src + ' -> ' + f.dest + ' (' + fs.statSync(d).size + ' bytes)');
  } else {
    console.error('File not found: ' + s);
  }
}
