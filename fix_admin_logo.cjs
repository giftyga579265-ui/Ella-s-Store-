const fs = require('fs');
let content = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

// Add import if missing
if (!content.includes('import Logo from')) {
  content = content.replace(
    'import CharityManager from "./CharityManager";',
    'import CharityManager from "./CharityManager";\n// @ts-ignore\nimport Logo from "../assets/images/ellas_store_logo_1782860468627.jpg";'
  );
}

// Replace the minimized E logo
content = content.replace(
  /<div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-amber-500 font-serif font-black shadow-inner shadow-black\/50">\s*E\s*<\/div>/,
  '<div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden border border-slate-700 shadow-inner shadow-black/50">\n              <img src={Logo} alt="Logo" className="w-full h-full object-cover" />\n            </div>'
);

// Replace the main E logo
content = content.replace(
  /<div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-neutral-900 dark:text-slate-100 font-serif font-black text-xl shadow">\s*E\s*<\/div>/,
  '<div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center shadow border border-amber-500/30">\n              <img src={Logo} alt="Logo" className="w-full h-full object-cover" />\n            </div>'
);

fs.writeFileSync('src/components/AdminDashboard.tsx', content);
console.log('Fixed admin logo');
