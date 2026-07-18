import React from "react";
import { Product } from "../types";
import { ShoppingBag, Star, Plus, Sparkles, Bell } from "lucide-react";

interface ProductCardProps {
  key?: any;
  product: Product;
  allProducts?: Product[];
  onAddToCart: (product: Product) => void;
  isLoggedIn: boolean;
  onShowLogin?: () => void;
  onNotifyMe?: (product: Product) => void;
  layout: 'grid' | 'list' | 'carousel' | 'masonry';
  onViewDetail?: (product: Product, initialTab?: 'classic' | 'spin360' | 'video' | 'tryon') => void;
}

export default function ProductCard({ product, allProducts = [], onAddToCart, isLoggedIn, onShowLogin, onNotifyMe, layout, onViewDetail }: ProductCardProps) {
  const isFood = product.category === "food" || product.category === "kitchen";
  
  const handleAddClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isLoggedIn) {
      if (onShowLogin) onShowLogin();
    } else {
      onAddToCart(product);
    }
  };

  const compProducts = React.useMemo(() => {
    if (!allProducts || allProducts.length === 0 || isFood) return [];
    
    let targetCategories: string[] = [];
    const cat = (product.category || '').toLowerCase();
    
    if (cat === "dresses") {
      targetCategories = ["bags", "shoes", "accessories"];
    } else if (cat === "bags") {
      targetCategories = ["dresses", "shoes", "accessories"];
    } else if (cat === "shoes") {
      targetCategories = ["dresses", "bags", "accessories"];
    } else if (cat === "accessories") {
      targetCategories = ["dresses", "bags", "shoes"];
    } else {
      targetCategories = [cat, "accessories"];
    }

    return allProducts
      .filter(p => p.id !== product.id && targetCategories.includes((p.category || '').toLowerCase()) && p.stock > 0)
      .slice(0, 2);
  }, [allProducts, product]);

  if (layout === "list") {
    return (
      <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-neutral-200 dark:border-slate-700 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 hover:border-indigo-500/50 transition-all duration-300 hover:shadow-lg animate-in fade-in">
        <div className="flex flex-col md:flex-row md:items-center gap-4.5 flex-1">
          <div className="flex items-center gap-4.5 cursor-pointer hover:opacity-95 transition-opacity" onClick={() => onViewDetail?.(product)}>
            <img src={product.image} alt={product.name} className="w-20 h-20 rounded-2xl object-cover border border-neutral-150 dark:border-slate-800 shadow-inner shrink-0" />
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-md font-mono">{product.category}</span>
                {product.stock <= 3 && product.stock > 0 && (
                  <span className="text-[9px] bg-rose-50 border border-rose-200 text-rose-600 px-2 py-0.5 rounded font-black font-mono">ONLY {product.stock} LEFT</span>
                )}
              </div>
              <h4 className="font-sans text-base text-neutral-900 dark:text-slate-100 font-semibold tracking-tight hover:text-indigo-600 transition-colors">{product.name}</h4>
              <p className="text-xs text-neutral-500 dark:text-slate-400 line-clamp-1 leading-relaxed max-w-md">{product.description}</p>
            </div>
          </div>
          {/* Suggestions block inside list layout */}
          {compProducts.length > 0 && (
            <div className="md:ml-6 pt-3 md:pt-0 md:pl-6 md:border-l border-neutral-100 dark:border-slate-800 flex flex-col gap-1.5 shrink-0 max-w-xs">
              <div className="flex items-center gap-1 text-[9px] font-black uppercase text-indigo-600 tracking-wider font-mono">
                <span className="text-xs animate-pulse filter drop-shadow-[0_0_2px_rgba(245,158,11,0.5)]">🎗️</span>
                <span>Complete the Look</span>
              </div>
              <div className="flex gap-2">
                {compProducts.map(comp => (
                  <div key={comp.id} className="flex items-center gap-1.5 p-1 rounded-xl bg-neutral-50 dark:bg-slate-950 hover:bg-neutral-100 dark:bg-slate-800 transition-colors border border-neutral-100/50 text-left">
                    <img src={comp.image} alt={comp.name} className="w-7 h-7 rounded-lg object-cover shrink-0 border border-neutral-200 dark:border-slate-700" />
                    <div className="max-w-[70px] overflow-hidden">
                      <p className="text-[9px] font-bold text-neutral-800 dark:text-slate-200 truncate leading-none">{comp.name}</p>
                      <p className="text-[8px] font-mono font-bold text-indigo-600">₵{comp.price.toFixed(0)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="flex items-center gap-6 shrink-0 w-full sm:w-auto">
          <div className="flex flex-col items-end">
            <span className="text-lg font-mono font-black tracking-tight text-neutral-900 dark:text-slate-100">₵{product.price.toFixed(2)}</span>
            {isFood && <span className="text-[10px] text-neutral-400 font-medium tracking-wide">Hot & Ready</span>}
          </div>
          {product.stock === 0 ? (
            <button
              onClick={(e) => { e.stopPropagation(); onNotifyMe?.(product); }}
              className="bg-neutral-800 hover:bg-neutral-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold tracking-wider transition-all duration-300 flex items-center gap-1.5 shadow-md cursor-pointer"
            >
              <Bell className="w-3.5 h-3.5" />
              Notify Me
            </button>
          ) : (
            <button
              onClick={handleAddClick}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl text-xs font-bold tracking-wider transition-all duration-300 flex items-center gap-1.5 shadow-md shadow-indigo-600/10 cursor-pointer"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              Add to Bag
            </button>
          )}
        </div>
      </div>
    );
  }

  // Grid / Masonry / Carousel layout
  return (
    <div 
      className={`group bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-neutral-150 dark:border-slate-800 transition-all duration-500 hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-1.5 flex flex-col h-full relative ${layout === 'masonry' ? 'break-inside-avoid mb-6' : ''}`}
      onClick={() => onViewDetail?.(product)}
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-neutral-100 dark:bg-slate-800 cursor-pointer">
        <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        
        {/* Badges */}
        <div className="absolute top-4.5 left-4.5 flex flex-col gap-1.5 z-10">
          <span className="bg-white/90 text-indigo-600 text-[9px] px-2.5 py-1 rounded-full font-bold tracking-widest font-mono uppercase shadow-md backdrop-blur-md border border-indigo-200">
            {product.category}
          </span>
          {product.stock === 0 ? (
            <span className="bg-rose-50/90 text-rose-600 text-[9px] px-2.5 py-1 rounded-full font-black tracking-widest font-mono shadow-md uppercase border border-rose-200 backdrop-blur-md">
              Sold Out
            </span>
          ) : product.stock <= 3 ? (
            <span className="bg-amber-50/90 text-amber-700 text-[9px] px-2.5 py-1 rounded-full font-black tracking-widest font-mono shadow-md uppercase border border-amber-200 backdrop-blur-md">
              Only {product.stock} Left
            </span>
          ) : null}
        </div>
      </div>

      <div className="p-5 flex flex-col flex-1 relative bg-white dark:bg-slate-900">
        <div className="flex-1 space-y-1 mb-4">
          <div className="flex items-center justify-between">
            <h3 className="font-sans text-base font-bold text-neutral-900 dark:text-slate-100 line-clamp-1 group-hover:text-indigo-600 transition-colors">{product.name}</h3>
            {(product as any).rating && (
              <div className="flex items-center gap-1 bg-amber-50 px-1.5 py-0.5 rounded text-[10px] font-bold text-amber-600 shrink-0">
                <Star className="w-3 h-3 fill-amber-500 stroke-amber-500" />
                {(product as any).rating}
              </div>
            )}
          </div>
          <p className="text-xs text-neutral-500 dark:text-slate-400 line-clamp-2 leading-relaxed">{product.description}</p>
        </div>

        <div className="pt-3.5 border-t border-neutral-100 dark:border-slate-800 flex items-center justify-between">
          <span className="text-xl font-mono font-black text-black dark:text-white">₵{product.price.toFixed(2)}</span>
          {product.stock === 0 ? (
            <button
              onClick={(e) => { e.stopPropagation(); onNotifyMe?.(product); }}
              className="bg-neutral-800 hover:bg-neutral-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold tracking-wider transition-all duration-300 flex items-center gap-1.5 shadow-md cursor-pointer"
            >
              <Bell className="w-3.5 h-3.5" />
              Notify Me
            </button>
          ) : (
            <button
              onClick={handleAddClick}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl text-xs font-bold tracking-wider transition-all duration-300 flex items-center gap-1.5 shadow-md shadow-indigo-600/10 cursor-pointer"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              Add to Bag
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
