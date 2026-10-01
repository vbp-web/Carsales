import React, { useState, useEffect } from 'react';
import { Tag, Copy, Check, Sparkles, Percent, ShieldCheck } from 'lucide-react';
import { Coupon } from '../types/index.ts';
import { api } from '../services/api.ts';
import { useToast } from '../context/ToastContext.tsx';

interface OffersViewProps {
  onNavigateCatalog: () => void;
}

export const OffersView: React.FC<OffersViewProps> = ({ onNavigateCatalog }) => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const { success } = useToast();

  useEffect(() => {
    async function loadCoupons() {
      try {
        const data = await api.coupons.getAll();
        setCoupons(data);
      } catch (err) {
        console.error('Failed loading coupons:', err);
      }
    }
    loadCoupons();
  }, []);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    success('Copied to Clipboard!', `Coupon code ${code} is ready to paste at checkout.`);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="text-center max-w-xl mx-auto space-y-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-red-600 dark:text-red-500">Savings & Promotions</span>
        <h1 className="text-3xl font-black text-zinc-950 dark:text-white font-display">Exclusive AutoApex Offers</h1>
        <p className="text-xs text-zinc-600 dark:text-zinc-400">
          Apply any of our active verified promotion codes during checkout for instant savings.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {coupons.map(coupon => (
          <div
            key={coupon.id}
            className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl relative overflow-hidden flex flex-col justify-between space-y-4 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-2xl font-black text-zinc-950 dark:text-white tabular-nums">
                  {coupon.discountType === 'PERCENTAGE' ? `${coupon.discountValue}% OFF` : `₹${coupon.discountValue} OFF`}
                </span>
                <p className="text-xs text-zinc-700 dark:text-zinc-300 font-semibold mt-1">{coupon.description}</p>
              </div>

              <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 dark:bg-red-600/10 dark:text-red-500 border border-red-200 dark:border-red-500/20 flex items-center justify-center shrink-0">
                <Tag className="w-5 h-5" />
              </div>
            </div>

            <div className="pt-3 border-t border-zinc-100 dark:border-zinc-850 flex items-center justify-between gap-3">
              <div>
                <span className="text-[10px] text-zinc-500 block">Min. Order Value:</span>
                <span className="text-xs font-mono font-semibold text-zinc-700 dark:text-zinc-300">
                  ₹{coupon.minOrderAmount.toLocaleString()}
                </span>
              </div>

              <button
                onClick={() => handleCopy(coupon.code)}
                className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-950 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-mono font-bold text-zinc-900 dark:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {copiedCode === coupon.code ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-emerald-600 dark:text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
                    <span>{coupon.code}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="p-6 bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-850 rounded-2xl text-center space-y-3 shadow-sm">
        <h3 className="text-sm font-bold text-zinc-950 dark:text-white">Ready to customize your car?</h3>
        <p className="text-xs text-zinc-600 dark:text-zinc-400 max-w-md mx-auto">
          All coupons include our 100% Fitment Guarantee and Free Express Shipping on orders above ₹1,999.
        </p>
        <button
          onClick={onNavigateCatalog}
          className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white font-semibold text-xs rounded-xl shadow-md shadow-red-600/20 cursor-pointer"
        >
          Browse Catalog
        </button>
      </div>
    </div>
  );
};
