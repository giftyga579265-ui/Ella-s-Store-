const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// Add state
const stateInsert = `
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('ella_theme') === 'dark';
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('ella_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('ella_theme', 'light');
    }
  }, [isDarkMode]);
`;

content = content.replace('const [siteLoading, setSiteLoading] = useState(false);', stateInsert + '\n  const [siteLoading, setSiteLoading] = useState(false);');

fs.writeFileSync('src/App.tsx', content);
console.log('Added theme state');
