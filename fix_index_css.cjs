const fs = require('fs');
let css = fs.readFileSync('src/index.css', 'utf8');

// Replace body background
css = css.replace(/body\s*\{[\s\S]*?\}/, 'body {\n  font-family: var(--font-sans);\n}');
css += '\n\n@custom-variant dark (&:where(.dark, .dark *));\n';

fs.writeFileSync('src/index.css', css);
