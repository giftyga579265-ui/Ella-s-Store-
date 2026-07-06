import React from "react";
import { Product } from "../types";
import { ShoppingBag, Star, Plus, Sparkles } from "lucide-react";

interface ProductCardProps {
  key?: any;
  product: Product;
  allProducts?: Product[];
  onAddToCart: (product: Product) => void;
  isLoggedIn: boolean;
  onShowLogin: () => void;
  layout: 'grid' | 'list' | 'carousel' | 'masonry';
  onViewDetail?: (product: Product) => void;
}

export default function ProductCard({ product, allProducts = [], onAddToCart, isLoggedIn, onShowLogin, layout, onViewDetail }: ProductCardProps) {
  
  const handleAddClick = () => {
    if (!isLoggedIn) {
      onShowLogin();
    } else {
      onAddToCart(product);
    }
  };

  const compProducts = React.useMemo(() => {
    if (!allProducts || allProducts.length === 0) return [];
    
    let targetCategories: string[] = [];
    const cat = product.category.toLowerCase();
    
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
      .filter(p => p.id !== product.id && targetCategories.includes(p.category.toLowerCase()) && p.stock > 0)
      .slice(0, 2);
  }, [allProducts, product]);

  if (layout === "list") {
    return (
      <div className="bg-white p-5 rounded-3xl border border-neutral-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 hover:border-indigo-500/50 transition-all duration-300 hover:shadow-lg animate-in fade-in">
        <div className="flex flex-col md:flex-row md:items-center gap-4.5 flex-1">
          <div className="flex items-center gap-4.5 cursor-pointer hover:opacity-95 transition-opacity" onClick={() => onViewDetail?.(product)}>
            <img src={product.image} alt={product.name} className="w-20 h-20 rounded-2xl object-cover border border-neutral-150 shadow-inner shrink-0" />
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-md font-mono">{product.category}</span>
                {product.stock <= 3 && product.stock > 0 && (
                  <span className="text-[9px] bg-rose-50 border border-rose-200 text-rose-600 px-2 py-0.5 rounded font-black font-mono">ONLY {product.stock} LEFT</span>
                )}
              </div>
              <h4 className="font-sans text-base text-neutral-900 font-semibold tracking-tight hover:text-indigo-600 transition-colors">{product.name}</h4>
              <p className="text-xs text-neutral-500 line-clamp-1 leading-relaxed max-w-md">{product.description}</p>
            </div>
          </div>

          {/* Suggestions block inside list layout */}
          {compProducts.length > 0 && (
            <div className="md:ml-6 pt-3 md:pt-0 md:pl-6 md:border-l border-neutral-100 flex flex-col gap-1.5 shrink-0 max-w-xs">
              <div className="flex items-center gap-1 text-[9px] font-black uppercase text-indigo-600 tracking-wider font-mono">
                <Sparkles className="w-2.5 h-2.5 animate-pulse" />
                <span>Complete the Look</span>
              </div>
              <div className="flex gap-2">
                {compProducts.map(comp => (
                  <div key={comp.id} className="flex items-center gap-1.5 p-1 rounded-xl bg-neutral-50 hover:bg-neutral-100 transition-colors border border-neutral-100/50 text-left">
                    <img src={comp.image} alt={comp.name} className="w-7 h-7 rounded-lg object-cover shrink-0 border border-neutral-200" />
                    <div className="max-w-[70px] overflow-hidden">
                      <p className="text-[9px] font-bold text-neutral-800 truncate leading-none">{comp.name}</p>
                      <p className="text-[8px] font-mono font-bold text-indigo-600">₵{comp.price.toFixed(0)}</p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!isLoggedIn) {
                          onShowLogin();
                        } else {
                          onAddToCart(comp);
                        }
                      }}
                      className="p-0.5 bg-white hover:bg-indigo-600 hover:text-white text-indigo-600 rounded border border-neutral-200 hover:border-indigo-600 transition-all cursor-pointer shadow-sm shrink-0"
                      title={`Add ${comp.name}`}
                    >
                      <Plus className="w-2.5 h-2.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="text-left sm:text-right space-y-2.5 shrink-0 w-full sm:w-auto flex sm:flex-col justify-between sm:justify-start items-center sm:items-end border-t sm:border-0 pt-3 sm:pt-0">
          <div className="text-xl font-mono font-black text-black">₵{product.price.toFixed(2)}</div>
          <button
            onClick={handleAddClick}
            disabled={product.stock === 0}
            className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-neutral-100 disabled:text-neutral-400 text-white px-5 py-2.5 rounded-xl text-xs font-bold tracking-wider transition-all duration-300 flex items-center gap-1.5 shadow-md shadow-indigo-600/10 cursor-pointer"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            {product.stock === 0 ? "Out of Stock" : "Add to Bag"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-neutral-200 hover:border-indigo-500/50 hover:shadow-lg transition-all duration-500 hover:-translate-y-1.5 flex flex-col justify-between animate-in fade-in group h-full">
      {/* Image Wrap */}
      <div className="relative aspect-[4/5] bg-neutral-100 overflow-hidden w-full cursor-pointer hover:opacity-95 transition-opacity" onClick={() => onViewDetail?.(product)}>
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-90 group-hover:opacity-100"
          loading="lazy"
        />
        
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

      {/* Info Block */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-1.5 cursor-pointer" onClick={() => onViewDetail?.(product)}>
          <h4 className="font-sans text-neutral-900 text-lg group-hover:text-indigo-600 transition-colors duration-300 font-semibold tracking-tight line-clamp-1">
            {product.name}
          </h4>
          <p className="text-neutral-500 text-xs leading-relaxed line-clamp-2">{product.description}</p>
        </div>

        {/* Complete the look recommendations for Grid/Carousel layouts */}
        {compProducts.length > 0 && (
          <div className="mt-2 pt-3 border-t border-neutral-100 space-y-2">
            <div className="flex items-center gap-1 text-[10px] font-black uppercase text-indigo-600 tracking-wider font-mono">
              <Sparkles className="w-3 h-3 animate-pulse text-indigo-500" />
              <span>Complete the Look</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {compProducts.map(comp => (
                <div key={comp.id} className="flex items-center gap-1.5 p-1 rounded-xl bg-neutral-50 hover:bg-neutral-100 transition-all border border-neutral-150/40 text-left">
                  <img src={comp.image} alt={comp.name} className="w-7 h-7 rounded-lg object-cover shrink-0 border border-neutral-200" />
                  <div className="overflow-hidden flex-1 min-w-0">
                    <p className="text-[9px] font-bold text-neutral-800 truncate leading-none mb-0.5">{comp.name}</p>
                    <p className="text-[8px] font-mono font-bold text-indigo-600">₵{comp.price.toFixed(0)}</p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!isLoggedIn) {
                        onShowLogin();
                      } else {
                        onAddToCart(comp);
                      }
                    }}
                    className="p-1 bg-white hover:bg-indigo-600 hover:text-white text-indigo-600 rounded-lg border border-neutral-200 hover:border-indigo-600 transition-all cursor-pointer shadow-sm shrink-0"
                    title={`Add matching ${comp.name}`}
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="pt-3.5 border-t border-neutral-100 flex items-center justify-between">
          <span className="text-xl font-mono font-black text-black">₵{product.price.toFixed(2)}</span>
          <button
            onClick={handleAddClick}
            disabled={product.stock === 0}
            className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-neutral-100 disabled:text-neutral-400 text-white px-5 py-2.5 rounded-xl text-xs font-bold tracking-wider transition-all duration-300 flex items-center gap-1.5 shadow-md shadow-indigo-600/10 disabled:shadow-none disabled:opacity-40 cursor-pointer"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            {product.stock === 0 ? "Sold Out" : "Add to Bag"}
          </button>
        </div>
      </div>
    </div>
  );
}
