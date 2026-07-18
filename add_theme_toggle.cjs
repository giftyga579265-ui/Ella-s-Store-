const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const navInsert = `            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="w-9 h-9 rounded-full border border-neutral-200 dark:border-slate-700 flex items-center justify-center text-neutral-600 dark:text-slate-400 hover:border-indigo-500 hover:text-indigo-600 bg-white dark:bg-slate-900 transition-colors cursor-pointer"
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              onClick={() => {
                setShowNotifications(true);`;

content = content.replace(/<button\s+onClick=\{\(\) => \{\s*setShowNotifications\(true\);/, navInsert);

// Add Sun and Moon to imports if missing
content = content.replace(/import\s*\{\s*([^}]+)\}\s*from\s*["']lucide-react["'];/, (match, p1) => {
  let imports = p1.split(',').map(s => s.trim());
  if (!imports.includes('Sun')) imports.push('Sun');
  if (!imports.includes('Moon')) imports.push('Moon');
  return `import { ${imports.join(', ')} } from 'lucide-react';`;
});

fs.writeFileSync('src/App.tsx', content);
console.log('Added theme toggle');
