const fs = require('fs');

let content = fs.readFileSync('src/components/ProductCard.tsx', 'utf8');

// Add Heart icon import if not there
if (!content.includes('Heart')) {
  content = content.replace(/import \{.*?\} from "lucide-react";/, match => {
    return match.replace('}', ', Heart }');
  });
}

// Add props to interface
const interfaceTarget = `  layout: 'grid' | 'list' | 'carousel' | 'masonry';
  onViewDetail?: (product: Product, initialTab?: 'classic' | 'spin360' | 'video' | 'tryon') => void;
}`;
const interfaceReplace = `  layout: 'grid' | 'list' | 'carousel' | 'masonry';
  onViewDetail?: (product: Product, initialTab?: 'classic' | 'spin360' | 'video' | 'tryon') => void;
  isWishlisted?: boolean;
  onToggleWishlist?: (product: Product) => void;
}`;
content = content.replace(interfaceTarget, interfaceReplace);

// Add props to component function signature
const fnTarget = `  onViewDetail
}: ProductCardProps) {`;
const fnReplace = `  onViewDetail,
  isWishlisted,
  onToggleWishlist
}: ProductCardProps) {`;
content = content.replace(fnTarget, fnReplace);

// Add Heart icon in the grid/masonry layout 
// "absolute top-4.5 left-4.5 flex flex-col gap-1.5 z-10"
// We'll add a heart button at top-4.5 right-4.5
const gridTarget = `<div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        
        {/* Badges */}`;
const gridReplace = `<div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        
        <button
          onClick={(e) => { e.stopPropagation(); onToggleWishlist?.(product); }}
          className={\`absolute top-4.5 right-4.5 z-20 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md border transition-all duration-300 cursor-pointer \${isWishlisted ? 'bg-rose-50 border-rose-200 text-rose-500' : 'bg-white/50 border-white/40 text-neutral-600 hover:bg-white/90 hover:text-rose-500'}\`}
        >
          <Heart className={\`w-4 h-4 \${isWishlisted ? 'fill-rose-500' : ''}\`} />
        </button>

        {/* Badges */}`;
content = content.replace(gridTarget, gridReplace);

// Add Heart icon in the list layout
const listTarget = `<div className="flex items-center gap-6 shrink-0 w-full sm:w-auto">
          <div className="flex flex-col items-end">`;
const listReplace = `<div className="flex items-center gap-6 shrink-0 w-full sm:w-auto">
          <button
            onClick={(e) => { e.stopPropagation(); onToggleWishlist?.(product); }}
            className={\`w-9 h-9 rounded-full flex items-center justify-center border transition-all duration-300 cursor-pointer \${isWishlisted ? 'bg-rose-50 border-rose-200 text-rose-500' : 'bg-neutral-50 border-neutral-200 text-neutral-400 hover:bg-rose-50 hover:text-rose-400 hover:border-rose-200'}\`}
          >
            <Heart className={\`w-4.5 h-4.5 \${isWishlisted ? 'fill-rose-500' : ''}\`} />
          </button>
          <div className="flex flex-col items-end">`;
content = content.replace(listTarget, listReplace);

fs.writeFileSync('src/components/ProductCard.tsx', content);
console.log('Patched ProductCard.tsx with Heart icon');
