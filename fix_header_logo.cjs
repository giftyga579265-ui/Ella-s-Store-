const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const navStart = `<div className="max-w-7xl mx-auto flex flex-col gap-4">
          <div className="flex items-center justify-between gap-4 w-full">`;

const newNavStart = `<div className="max-w-7xl mx-auto flex flex-col gap-4">
          <div className="flex items-center justify-between gap-4 w-full">
            <div className="hidden md:block">
              <ProfessionalLogo />
            </div>`;

content = content.replace(navStart, newNavStart);
fs.writeFileSync('src/App.tsx', content);
console.log("Fixed header logo");
