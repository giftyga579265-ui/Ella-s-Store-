import React, { useMemo } from "react";
import { Product } from "../types";
import { X, ShoppingBag, Sparkles, Plus, Check, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface ProductDetailModalProps {
  product: Product;
  allProducts: Product[];
  onClose: () => void;
  onAddToCart: (product: Product) => void;
  isLoggedIn: boolean;
  onShowLogin: () => void;
  onViewProduct: (product: Product) => void;
}

export default function ProductDetailModal({
  product,
  allProducts,
  onClose,
  onAddToCart,
  isLoggedIn,
  onShowLogin,
  onViewProduct,
}: ProductDetailModalProps) {
  // Category-based filtering:
  // Find other products that belong to the same category, excluding the currently viewed product.
  const suggestedProducts = useMemo(() => {
    if (!product || !allProducts) return [];

    // Filter items in the exact same category, excluding current product, and must be in stock
    const sameCategoryItems = allProducts.filter(
      (item) => item.id !== product.id && item.category.toLowerCase() === product.category.toLowerCase() && item.stock > 0
    );

    // If we have at least 3 matching items in the same category, return them
    if (sameCategoryItems.length >= 3) {
      return sameCategoryItems.slice(0, 3);
    }

    // Otherwise, fill up to 3 slots with in-stock items from other categories (except current)
    const otherItems = allProducts.filter(
      (item) => item.id !== product.id && item.category.toLowerCase() !== product.category.toLowerCase() && item.stock > 0
    );

    return [...sameCategoryItems, ...otherItems].slice(0, 3);
  }, [product, allProducts]);

  const handleAddClick = () => {
    if (!isLoggedIn) {
      onShowLogin();
    } else {
      onAddToCart(product);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
      id="product-detail-modal-overlay"
    >
      {/* Modal Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white text-slate-900 rounded-[2rem] shadow-2xl max-w-4xl w-full flex flex-col overflow-hidden border border-neutral-200/80 relative my-8"
        id="product-detail-modal-container"
      >
        {/* Accent Top Line */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 via-pink-500 to-indigo-500" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 z-25 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-black transition-all cursor-pointer border border-neutral-200/40"
          title="Close Dialog"
          id="product-detail-modal-close-btn"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Main Content Scrollable Area */}
        <div className="overflow-y-auto max-h-[85vh] p-6 md:p-10 space-y-8">
          
          {/* Top Half: Product Detail Split */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            
            {/* Left Column: Image with dynamic badges */}
            <div className="relative aspect-square md:aspect-[4/5] rounded-2xl overflow-hidden bg-neutral-50 border border-neutral-200 shadow-sm flex items-center justify-center">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
                <span className="bg-white/95 text-indigo-600 text-[10px] px-3 py-1 rounded-full font-black tracking-widest font-mono uppercase shadow border border-indigo-200">
                  {product.category}
                </span>
                {product.stock === 0 ? (
                  <span className="bg-rose-50/95 text-rose-600 text-[10px] px-3 py-1 rounded-full font-black tracking-widest font-mono uppercase shadow border border-rose-200">
                    Sold Out
                  </span>
                ) : product.stock <= 3 ? (
                  <span className="bg-amber-50/95 text-amber-700 text-[10px] px-3 py-1 rounded-full font-black tracking-widest font-mono uppercase shadow border border-amber-200">
                    Only {product.stock} Left
                  </span>
                ) : null}
              </div>
            </div>

            {/* Right Column: Text Information & Actions */}
            <div className="flex flex-col justify-between h-full space-y-6 pt-2">
              <div className="space-y-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest font-mono">
                    Premium Couture Line
                  </span>
                  <h2 className="font-sans text-2xl md:text-3xl text-neutral-900 font-black tracking-tight leading-tight">
                    {product.name}
                  </h2>
                </div>

                <div className="flex items-baseline gap-3">
                  <span className="text-2xl md:text-3xl font-mono font-black text-indigo-600">
                    ₵{product.price.toFixed(2)}
                  </span>
                  <span className="text-[10px] text-neutral-400 font-mono font-bold uppercase">
                    Vat inclusive
                  </span>
                </div>

                <hr className="border-neutral-100" />

                <div className="space-y-1.5">
                  <span className="text-[10px] font-black uppercase text-neutral-400 tracking-wider font-mono">
                    Overview
                  </span>
                  <p className="text-sm text-neutral-600 leading-relaxed font-sans">
                    {product.description}
                  </p>
                </div>

                <hr className="border-neutral-100" />

                {/* Additional Product Specs/Features */}
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-100">
                    <span className="text-[9px] font-mono text-neutral-400 block uppercase font-bold mb-0.5">Availability</span>
                    <span className="font-bold text-neutral-800">
                      {product.stock > 0 ? `In Stock (${product.stock} units)` : "Out of stock"}
                    </span>
                  </div>
                  <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-100">
                    <span className="text-[9px] font-mono text-neutral-400 block uppercase font-bold mb-0.5">Collection</span>
                    <span className="font-bold text-neutral-800 uppercase tracking-wider">Accra Boutique</span>
                  </div>
                </div>
              </div>

              {/* CTA Purchase Button */}
              <div className="pt-4">
                <button
                  onClick={handleAddClick}
                  disabled={product.stock === 0}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-neutral-100 disabled:text-neutral-400 text-white py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/15 cursor-pointer disabled:opacity-50"
                  id="product-detail-modal-add-to-cart-btn"
                >
                  <ShoppingBag className="w-4 h-4" />
                  {product.stock === 0 ? "Out of Stock" : "Add to Shopping Bag"}
                </button>
              </div>
            </div>

          </div>

          {/* Bottom Half: "You Might Also Like" Recommendation Section */}
          {suggestedProducts.length > 0 && (
            <div className="pt-8 border-t border-neutral-100 space-y-5" id="suggested-products-section">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-pink-50 rounded-lg text-pink-500 border border-pink-100">
                    <Sparkles className="w-4 h-4 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                      You Might Also Like
                    </h3>
                    <p className="text-[10px] text-neutral-400 font-mono">
                      Curated recommendations from our matching <span className="text-indigo-600 font-bold">{product.category}</span> line
                    </p>
                  </div>
                </div>
                <span className="text-[10px] bg-neutral-100 text-neutral-600 font-bold font-mono uppercase tracking-widest px-2.5 py-1 rounded-full">
                  Similar Items
                </span>
              </div>

              {/* Grid of suggested items */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                {suggestedProducts.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => onViewProduct(item)}
                    className="bg-neutral-50/50 hover:bg-white rounded-2xl p-3 border border-neutral-200/60 hover:border-indigo-400 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between cursor-pointer group h-full relative"
                  >
                    <div>
                      {/* Image Preview */}
                      <div className="relative aspect-square rounded-xl overflow-hidden bg-white border border-neutral-150 mb-3">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                          referrerPolicy="no-referrer"
                        />
                        <span className="absolute top-2 left-2 bg-white/90 text-neutral-600 text-[8px] px-2 py-0.5 rounded font-bold font-mono uppercase border border-neutral-200/50">
                          {item.category}
                        </span>
                      </div>

                      {/* Info details */}
                      <div className="space-y-1 px-1">
                        <h4 className="text-[11px] font-black text-neutral-800 leading-snug tracking-tight group-hover:text-indigo-600 transition-colors line-clamp-1 uppercase">
                          {item.name}
                        </h4>
                        <p className="text-[10px] text-neutral-500 line-clamp-1 leading-normal">
                          {item.description}
                        </p>
                      </div>
                    </div>

                    {/* Footer price & action button */}
                    <div className="pt-3 mt-3 border-t border-neutral-100 flex items-center justify-between px-1">
                      <span className="text-xs font-mono font-black text-neutral-900">
                        ₵{item.price.toFixed(0)}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation(); // prevent opening detailed view
                          if (!isLoggedIn) {
                            onShowLogin();
                          } else {
                            onAddToCart(item);
                          }
                        }}
                        className="p-1.5 bg-indigo-50 hover:bg-indigo-600 text-indigo-600 hover:text-white rounded-lg border border-indigo-100 hover:border-indigo-600 transition-all cursor-pointer shadow-sm"
                        title={`Quick Add ${item.name} to bag`}
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </motion.div>
    </div>
  );
}
