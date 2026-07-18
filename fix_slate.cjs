const fs = require('fs');

let css = fs.readFileSync('src/index.css', 'utf8');

const themeInsert = `
  --color-slate-50: var(--my-slate-50);
  --color-slate-100: var(--my-slate-100);
  --color-slate-200: var(--my-slate-200);
  --color-slate-300: var(--my-slate-300);
  --color-slate-400: var(--my-slate-400);
  --color-slate-500: var(--my-slate-500);
  --color-slate-600: var(--my-slate-600);
  --color-slate-700: var(--my-slate-700);
  --color-slate-800: var(--my-slate-800);
  --color-slate-900: var(--my-slate-900);
  --color-slate-950: var(--my-slate-950);
`;

const rootInsert = `
    --my-slate-50: #f8fafc;
    --my-slate-100: #f1f5f9;
    --my-slate-200: #e2e8f0;
    --my-slate-300: #cbd5e1;
    --my-slate-400: #94a3b8;
    --my-slate-500: #64748b;
    --my-slate-600: #475569;
    --my-slate-700: #334155;
    --my-slate-800: #1e293b;
    --my-slate-900: #0f172a;
    --my-slate-950: #020617;
`;

const darkInsert = `
    --my-slate-50: #020617;
    --my-slate-100: #0f172a;
    --my-slate-200: #1e293b;
    --my-slate-300: #334155;
    --my-slate-400: #475569;
    --my-slate-500: #64748b;
    --my-slate-600: #94a3b8;
    --my-slate-700: #cbd5e1;
    --my-slate-800: #e2e8f0;
    --my-slate-900: #f1f5f9;
    --my-slate-950: #f8fafc;
`;

css = css.replace(/@theme \{/, '@theme {' + themeInsert);
css = css.replace(/:root \{/, ':root {' + rootInsert);
css = css.replace(/\.dark \{/, '.dark {' + darkInsert);

fs.writeFileSync('src/index.css', css);
console.log('Fixed slate');
