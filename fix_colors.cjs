const fs = require('fs');

const css = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
@import "tailwindcss";

@theme {
  --font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;
  --font-serif: "Playfair Display", Georgia, serif;
  --font-mono: "JetBrains Mono", monospace;
  
  --color-white: var(--my-white);
  --color-neutral-50: var(--my-neutral-50);
  --color-neutral-100: var(--my-neutral-100);
  --color-neutral-200: var(--my-neutral-200);
  --color-neutral-300: var(--my-neutral-300);
  --color-neutral-400: var(--my-neutral-400);
  --color-neutral-500: var(--my-neutral-500);
  --color-neutral-600: var(--my-neutral-600);
  --color-neutral-700: var(--my-neutral-700);
  --color-neutral-800: var(--my-neutral-800);
  --color-neutral-900: var(--my-neutral-900);
  --color-black: var(--my-black);
}

@layer base {
  :root {
    --my-white: #ffffff;
    --my-neutral-50: #fafafa;
    --my-neutral-100: #f5f5f5;
    --my-neutral-200: #e5e5e5;
    --my-neutral-300: #d4d4d4;
    --my-neutral-400: #a3a3a3;
    --my-neutral-500: #737373;
    --my-neutral-600: #525252;
    --my-neutral-700: #404040;
    --my-neutral-800: #262626;
    --my-neutral-900: #171717;
    --my-black: #000000;
  }
  .dark {
    --my-white: #0f172a;
    --my-neutral-50: #020617;
    --my-neutral-100: #1e293b;
    --my-neutral-200: #334155;
    --my-neutral-300: #475569;
    --my-neutral-400: #64748b;
    --my-neutral-500: #94a3b8;
    --my-neutral-600: #cbd5e1;
    --my-neutral-700: #e2e8f0;
    --my-neutral-800: #f1f5f9;
    --my-neutral-900: #f8fafc;
    --my-black: #ffffff;
  }
}

::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
::-webkit-scrollbar-track {
  background: var(--my-neutral-50);
}
::-webkit-scrollbar-thumb {
  background: var(--my-neutral-300);
  border-radius: 4px;
}
::-webkit-scrollbar-thumb:hover {
  background: var(--my-neutral-500);
}

html {
  scroll-behavior: smooth;
}

body {
  font-family: var(--font-sans);
  background-color: var(--my-neutral-50);
  color: var(--my-black);
}

@custom-variant dark (&:where(.dark, .dark *));
`;

fs.writeFileSync('src/index.css', css);
console.log('Fixed css');
