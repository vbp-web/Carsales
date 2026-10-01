import React, { useState } from 'react';
import { Star, Heart, ShoppingBag, Check, ShieldCheck, AlertCircle } from 'lucide-react';
import { Product } from '../../types/index.ts';
import { useCart } from '../../context/CartContext.tsx';
import { useWishlist } from '../../context/WishlistContext.tsx';
import { useVehicle } from '../../context/VehicleContext.tsx';

interface ProductCardProps {
  product: Product;
  onClick: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onClick }) => {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { checkCompatibility, selectedVehicle } = useVehicle();
  const [imageError, setImageError] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const isWishlisted = isInWishlist(product.id);
  const fitment = checkCompatibility(product);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsAdding(true);
    await addToCart(product, 1);
    setTimeout(() => setIsAdding(false), 800);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(product);
  };

  return (
    <div
      onClick={onClick}
      className="group relative bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700 rounded-xl overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-zinc-200/50 dark:hover:shadow-black/50 flex flex-col cursor-pointer"
    >
      {/* Visual Image container */}
      <div className="relative aspect-[4/3] bg-zinc-100 dark:bg-zinc-950 overflow-hidden flex items-center justify-center">
        {!imageError ? (
          <img
            src={product.thumbnail || product.images[0]}
            alt={product.name}
            referrerPolicy="no-referrer"
            onError={() => setImageError(true)}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-900 dark:to-zinc-950 flex flex-col items-center justify-center p-4 text-center">
            <span className="text-zinc-500 dark:text-zinc-600 text-xs font-mono">{product.category}</span>
            <span className="text-zinc-700 dark:text-zinc-400 text-xs font-medium mt-1">{product.brand}</span>
          </div>
        )}

        {/* Compatibility Overlay Bar */}
        <div className="absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-none">
          {fitment.isCompatible ? (
            <span className="text-[11px] font-medium text-emerald-800 dark:text-emerald-300 bg-white/90 dark:bg-zinc-950/80 backdrop-blur-md px-2 py-0.5 rounded border border-emerald-300 dark:border-emerald-500/30 flex items-center gap-1 shadow-sm">
              <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              {product.universalFit ? 'Universal Fit' : selectedVehicle ? `Fits ${selectedVehicle.model}` : 'Verified Fit'}
            </span>
          ) : (
            <span className="text-[11px] font-medium text-amber-800 dark:text-amber-300 bg-white/90 dark:bg-zinc-950/80 backdrop-blur-md px-2 py-0.5 rounded border border-amber-300 dark:border-amber-500/30 flex items-center gap-1 shadow-sm">
              <AlertCircle className="w-3 h-3 text-amber-600 dark:text-amber-400" />
              May Not Fit
            </span>
          )}

          {/* Single clean subtle tag */}
          {product.isBestseller && (
            <span className="text-[10px] font-semibold text-zinc-700 dark:text-zinc-300 bg-white/95 dark:bg-zinc-900/90 px-2 py-0.5 rounded border border-zinc-200 dark:border-zinc-700 shadow-sm">
              Bestseller
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={handleWishlist}
          className="absolute top-2 right-2 p-2 rounded-lg bg-white/90 dark:bg-zinc-900/80 backdrop-blur-sm border border-zinc-200 dark:border-zinc-700/60 hover:bg-white dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors shadow-sm"
          title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
        </button>
      </div>

      {/* Card Content Area */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Brand & Category quiet metadata */}
          <div className="flex items-center gap-2 text-[11px] text-zinc-500 mb-1">
            <span className="uppercase tracking-wider font-semibold text-zinc-600 dark:text-zinc-400">{product.brand}</span>
            <span aria-hidden="true">·</span>
            <span>{product.subcategory || product.category}</span>
          </div>

          {/* Product Title */}
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 line-clamp-2 leading-snug group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
            {product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1.5 mt-2 text-xs text-zinc-500 dark:text-zinc-400">
            <div className="flex items-center text-amber-500 dark:text-amber-400">
              <Star className="w-3.5 h-3.5 fill-current" />
            </div>
            <span className="font-semibold text-zinc-800 dark:text-zinc-200 tabular-nums">{product.rating.toFixed(1)}</span>
            <span className="text-zinc-400 dark:text-zinc-500 tabular-nums">({product.reviewCount})</span>
          </div>
        </div>

        {/* Pricing & CTA */}
        <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-850 flex items-center justify-between gap-2">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-bold text-zinc-950 dark:text-white tabular-nums">
                ₹{product.price.toLocaleString()}
              </span>
              {product.mrp > product.price && (
                <span className="text-xs text-zinc-400 dark:text-zinc-500 line-through tabular-nums">
                  ₹{product.mrp.toLocaleString()}
                </span>
              )}
            </div>
            {product.discountPercent > 0 && (
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                {product.discountPercent}% OFF
              </span>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            disabled={product.stockStatus === 'OUT_OF_STOCK' || isAdding}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer ${
              product.stockStatus === 'OUT_OF_STOCK'
                ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 cursor-not-allowed'
                : isAdding
                ? 'bg-emerald-600 text-white'
                : 'bg-zinc-100 hover:bg-red-600 text-zinc-800 hover:text-white dark:bg-zinc-800 dark:hover:bg-red-600 dark:text-zinc-200 dark:hover:text-white border border-zinc-200 dark:border-transparent'
            }`}
          >
            {isAdding ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Added</span>
              </>
            ) : product.stockStatus === 'OUT_OF_STOCK' ? (
              <span>Sold Out</span>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Add</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
