import React, { useState } from 'react';
import { X, Trash2, ShoppingBag, ArrowRight, Tag, ShieldCheck, Check } from 'lucide-react';
import { useCart } from '../../context/CartContext.tsx';

interface CartDrawerProps {
  onCheckout: () => void;
  onNavigateCatalog: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onCheckout, onNavigateCatalog }) => {
  const {
    items,
    itemCount,
    subtotal,
    discount,
    coupon,
    couponCode,
    tax,
    shipping,
    total,
    isCartDrawerOpen,
    setIsCartDrawerOpen,
    updateQuantity,
    removeFromCart,
    applyCoupon,
    removeCoupon
  } = useCart();

  const [inputCode, setInputCode] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  if (!isCartDrawerOpen) return null;

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCode.trim()) return;
    setCouponLoading(true);
    await applyCoupon(inputCode);
    setCouponLoading(false);
  };

  const freeShippingThreshold = 1999;
  const freeShippingRemaining = Math.max(0, freeShippingThreshold - subtotal);
  const freeShippingProgress = Math.min(100, (subtotal / freeShippingThreshold) * 100);

  return (
    <div className="fixed inset-0 z-[80] overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={() => setIsCartDrawerOpen(false)}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
      />

      {/* Drawer Panel */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-4 sm:pl-10 z-[81]">
        <div className="w-screen max-w-md bg-white dark:bg-zinc-950 border-l border-zinc-200 dark:border-zinc-850 shadow-2xl flex flex-col text-zinc-900 dark:text-zinc-100 transition-colors animate-in slide-in-from-right duration-300">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-zinc-200 dark:border-zinc-850 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-red-600 dark:text-red-500" />
              <h2 className="text-base font-bold text-zinc-950 dark:text-white">Your Cart</h2>
              <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-900 px-2 py-0.5 rounded-full tabular-nums">
                {itemCount}
              </span>
            </div>
            <button
              onClick={() => setIsCartDrawerOpen(false)}
              className="p-1.5 text-zinc-400 hover:text-zinc-900 dark:hover:text-white rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress bar */}
          <div className="px-5 py-3 bg-zinc-50 dark:bg-zinc-900/60 border-b border-zinc-200 dark:border-zinc-850">
            {freeShippingRemaining > 0 ? (
              <p className="text-xs text-zinc-600 dark:text-zinc-300">
                Add <span className="font-semibold text-emerald-600 dark:text-emerald-400">₹{freeShippingRemaining.toLocaleString()}</span> more to unlock <span className="text-zinc-900 dark:text-white font-semibold">FREE Delivery</span>
              </p>
            ) : (
              <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5" />
                Unlocked FREE Express Delivery
              </p>
            )}
            <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${freeShippingProgress}%` }}
              />
            </div>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 sm:space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6">
                <div className="w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 flex items-center justify-center text-zinc-400 dark:text-zinc-600 mb-4">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="text-base font-semibold text-zinc-950 dark:text-white">Your cart is empty</h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-xs leading-relaxed">
                  Discover custom-fit accessories, 7D mats, and electronics engineered specifically for your vehicle.
                </p>
                <button
                  onClick={() => {
                    setIsCartDrawerOpen(false);
                    onNavigateCatalog();
                  }}
                  className="mt-5 px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer shadow-md shadow-red-500/20"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              items.map(item => (
                <div
                  key={item.id}
                  className="flex gap-3 p-3 bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-850 rounded-xl hover:border-zinc-300 dark:hover:border-zinc-800 transition-colors shadow-sm"
                >
                  <img
                    src={item.product?.thumbnail || item.product?.images?.[0] || '/src/assets/images/product_floor_mats_1790681468276.jpg'}
                    alt={item.product?.name || 'Accessory'}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/src/assets/images/product_floor_mats_1790681468276.jpg';
                    }}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg object-cover bg-zinc-100 dark:bg-zinc-950 shrink-0 border border-zinc-200 dark:border-zinc-800"
                  />
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-1">
                        <h4 className="text-xs font-semibold text-zinc-900 dark:text-zinc-200 line-clamp-2 leading-snug">
                          {item.product?.name || 'Precision Accessory'}
                        </h4>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 p-1 transition-colors cursor-pointer shrink-0"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {item.selectedVehicle && (
                        <p className="text-[10px] text-emerald-700 dark:text-emerald-400 font-medium flex items-center gap-1 mt-1 truncate">
                          <ShieldCheck className="w-3 h-3 shrink-0" />
                          <span>Fit: {item.selectedVehicle.brand} {item.selectedVehicle.model} ({item.selectedVehicle.year})</span>
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-zinc-200 dark:border-zinc-800/60">
                      <div className="flex items-center border border-zinc-300 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-950">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="px-2.5 py-1 text-xs text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors cursor-pointer"
                        >
                          -
                        </button>
                        <span className="px-2 text-xs font-semibold text-zinc-800 dark:text-zinc-200 tabular-nums">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="px-2.5 py-1 text-xs text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors cursor-pointer"
                        >
                          +
                        </button>
                      </div>

                      <span className="text-xs font-bold text-zinc-950 dark:text-white tabular-nums">
                        ₹{((item.product?.price || 0) * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Checkout Area */}
          {items.length > 0 && (
            <div className="p-5 bg-zinc-50 dark:bg-zinc-900/90 border-t border-zinc-200 dark:border-zinc-850 space-y-3">
              {/* Coupon Form */}
              {coupon ? (
                <div className="flex items-center justify-between p-2.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 rounded-lg text-xs">
                  <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-400">
                    <Tag className="w-3.5 h-3.5" />
                    <span>Coupon <strong>{coupon.code}</strong> applied (-₹{discount})</span>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-white text-[11px] underline cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    value={inputCode}
                    onChange={e => setInputCode(e.target.value.toUpperCase())}
                    placeholder="Coupon code (e.g. CAR10)"
                    className="flex-1 bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-900 dark:text-white uppercase focus:outline-none focus:border-red-500"
                  />
                  <button
                    type="submit"
                    disabled={couponLoading || !inputCode.trim()}
                    className="px-3.5 py-2 bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-xs font-semibold text-zinc-800 dark:text-zinc-200 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    Apply
                  </button>
                </form>
              )}

              {/* Subtotal & Breakdown */}
              <div className="space-y-1.5 text-xs pt-1">
                <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                  <span>Subtotal</span>
                  <span className="text-zinc-900 dark:text-zinc-200 tabular-nums">₹{subtotal.toLocaleString()}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                    <span>Discount</span>
                    <span className="tabular-nums">-₹{discount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                  <span>Standard GST (18%)</span>
                  <span className="text-zinc-900 dark:text-zinc-200 tabular-nums">₹{tax.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                  <span>Shipping</span>
                  <span className="text-zinc-900 dark:text-zinc-200 tabular-nums">
                    {shipping === 0 ? <strong className="text-emerald-600 dark:text-emerald-400">FREE</strong> : `₹${shipping}`}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-bold text-zinc-950 dark:text-white pt-2 border-t border-zinc-200 dark:border-zinc-800">
                  <span>Total Amount</span>
                  <span className="text-base text-red-600 dark:text-red-500 tabular-nums">₹{total.toLocaleString()}</span>
                </div>
              </div>

              {/* Checkout CTA */}
              <button
                onClick={() => {
                  setIsCartDrawerOpen(false);
                  onCheckout();
                }}
                className="w-full bg-red-600 hover:bg-red-500 text-white font-semibold text-sm py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-lg shadow-red-600/20"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
