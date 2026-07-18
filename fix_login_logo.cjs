const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
  /<div className="w-14 h-14 rounded-2xl bg-amber-500 text-neutral-900 dark:text-slate-100 flex items-center justify-center font-sans font-black text-2xl mx-auto shadow-md">\s*E\s*<\/div>/g,
  '<div className="w-14 h-14 rounded-2xl overflow-hidden flex items-center justify-center mx-auto shadow-md border border-amber-500/30">\n                <img src={Logo} alt="Logo" className="w-full h-full object-cover" />\n              </div>'
);

content = content.replace(
  /<div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-serif font-black text-2xl mx-auto shadow-md mb-2">\s*E\s*<\/div>/,
  '<div className="w-12 h-12 rounded-2xl overflow-hidden flex items-center justify-center mx-auto shadow-md border border-indigo-500/30 mb-2">\n                <img src={Logo} alt="Logo" className="w-full h-full object-cover" />\n              </div>'
);

fs.writeFileSync('src/App.tsx', content);
console.log('Fixed login logo');
