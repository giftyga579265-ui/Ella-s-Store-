import React from "react";
import { Product } from "../types";
import { ShoppingBag, Star } from "lucide-react";

interface ProductCardProps {
  key?: any;
  product: Product;
  onAddToCart: (product: Product) => void;
  isLoggedIn: boolean;
  onShowLogin: () => void;
  layout: 'grid' | 'list' | 'carousel' | 'masonry';
}

export default function ProductCard({ product, onAddToCart, isLoggedIn, onShowLogin, layout }: ProductCardProps) {
  
  const handleAddClick = () => {
    if (!isLoggedIn) {
      onShowLogin();
    } else {
      onAddToCart(product);
    }
  };

  if (layout === "list") {
    return (
      <div className="bg-white p-5 rounded-3xl border border-neutral-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 hover:border-indigo-500/50 transition-all duration-300 hover:shadow-lg animate-in fade-in">
        <div className="flex items-center gap-4.5">
          <img src={product.image} alt={product.name} className="w-20 h-20 rounded-2xl object-cover border border-neutral-150 shadow-inner shrink-0" />
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-md font-mono">{product.category}</span>
              {product.stock <= 3 && product.stock > 0 && (
                <span className="text-[9px] bg-rose-50 border border-rose-200 text-rose-600 px-2 py-0.5 rounded font-black font-mono">ONLY {product.stock} LEFT</span>
              )}
            </div>
            <h4 className="font-sans text-base text-neutral-900 font-semibold tracking-tight">{product.name}</h4>
            <p className="text-xs text-neutral-500 line-clamp-1 leading-relaxed max-w-md">{product.description}</p>
          </div>
        </div>

        <div className="text-left sm:text-right space-y-2.5 shrink-0 w-full sm:w-auto flex sm:flex-col justify-between sm:justify-start items-center sm:items-end">
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
      <div className="relative aspect-[4/5] bg-neutral-100 overflow-hidden w-full">
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
        <div className="space-y-1.5">
          <h4 className="font-sans text-neutral-900 text-lg group-hover:text-indigo-600 transition-colors duration-300 font-semibold tracking-tight line-clamp-1">
            {product.name}
          </h4>
          <p className="text-neutral-500 text-xs leading-relaxed line-clamp-2">{product.description}</p>
        </div>

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
