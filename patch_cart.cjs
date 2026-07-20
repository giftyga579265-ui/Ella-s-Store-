const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

const target1 = `  const addToCart = (product: Product) => {
    setCart(prev => {`;
const replace1 = `  const addToCart = (product: Product) => {
    setIsCartBumping(true);
    setTimeout(() => setIsCartBumping(false), 400);
    setCart(prev => {`;
content = content.replace(target1, replace1);

const target2 = `                }
                setShowCheckout(true);
              }}
              className="relative w-9 h-9 rounded-full border border-neutral-200 dark:border-slate-700 flex items-center justify-center text-neutral-600 dark:text-slate-400 hover:border-indigo-500 hover:text-indigo-600 bg-white dark:bg-slate-900 transition-colors cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />`;
const replace2 = `                }
                setShowCheckout(true);
              }}
              className={\`relative w-9 h-9 rounded-full border flex items-center justify-center cursor-pointer transition-all duration-300 \${
                isCartBumping 
                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 scale-110 shadow-lg shadow-indigo-500/20' 
                  : 'border-neutral-200 dark:border-slate-700 text-neutral-600 dark:text-slate-400 hover:border-indigo-500 hover:text-indigo-600 bg-white dark:bg-slate-900'
              }\`}
            >
              <ShoppingBag className={\`w-4 h-4 \${isCartBumping ? 'animate-pulse scale-110' : ''}\`} />`;
content = content.replace(target2, replace2);

fs.writeFileSync('src/App.tsx', content);
console.log('Patched App.tsx for cart animations');
