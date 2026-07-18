const fs = require('fs');
let css = fs.readFileSync('src/index.css', 'utf8');

// remove slate vars from theme
css = css.replace(/\s*--color-slate-\d+: var\(--my-slate-\d+\);/g, '');
// remove slate vars from root and dark
css = css.replace(/\s*--my-slate-\d+: #[0-9a-fA-F]+;/g, '');

fs.writeFileSync('src/index.css', css);
console.log('Removed slate inversion');
