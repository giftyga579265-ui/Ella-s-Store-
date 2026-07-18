const fs = require('fs');
let content = fs.readFileSync('src/components/ProductDetailModal.tsx', 'utf8');

content = content.replace(
  /onShowLogin\?: \(\) => void;/,
  "onShowLogin?: () => void;\n  onNotifyMe?: (product: Product) => void;"
);

content = content.replace(
  /onShowLogin/g,
  "onShowLogin, onNotifyMe"
);

const btnReplacement = `
              {/* CTA Purchase Button */}
              <div className="pt-4">
                {product.stock === 0 ? (
                  <button
                    onClick={() => onNotifyMe?.(product)}
                    className="w-full bg-neutral-800 hover:bg-neutral-700 text-white py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 shadow-lg cursor-pointer"
                    id="product-detail-modal-notify-me-btn"
                  >
                    <Bell className="w-4 h-4" />
                    Notify Me When Available
                  </button>
                ) : (
                  <button
                    onClick={handleAddClick}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/15 cursor-pointer"
                    id="product-detail-modal-add-to-cart-btn"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    Add to Shopping Bag
                  </button>
                )}
              </div>
`;

content = content.replace(/\{\/\* CTA Purchase Button \*\/\}[\s\S]*?<\/button>\s*<\/div>/, btnReplacement);
content = content.replace(/import \{ ([^}]+) \} from 'lucide-react';/, "import { $1, Bell } from 'lucide-react';");

fs.writeFileSync('src/components/ProductDetailModal.tsx', content);
console.log("Fixed ProductDetailModal.tsx");
