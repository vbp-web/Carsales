import React from 'react';
import { ShieldCheck, Truck, RotateCcw, Headphones, Lock } from 'lucide-react';

interface FooterProps {
  onNavigate: (view: string, params?: any) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="w-full bg-zinc-100 dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-850 mt-20 text-zinc-600 dark:text-zinc-400 text-xs transition-colors duration-200">
      {/* Trust & Guarantee Banner */}
      <div className="border-b border-zinc-200 dark:border-zinc-850 bg-white/70 dark:bg-zinc-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-red-600 dark:text-red-500 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-zinc-900 dark:text-white text-xs">100% Fitment Guarantee</h4>
              <p className="text-[11px] text-zinc-500 mt-0.5">Laser-scanned precision vehicle fit</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-red-600 dark:text-red-500 shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-zinc-900 dark:text-white text-xs">Free Express Delivery</h4>
              <p className="text-[11px] text-zinc-500 mt-0.5">On orders above ₹1,999</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-red-600 dark:text-red-500 shrink-0">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-zinc-900 dark:text-white text-xs">7-Day Hassle-Free Returns</h4>
              <p className="text-[11px] text-zinc-500 mt-0.5">If fitment does not match</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-red-600 dark:text-red-500 shrink-0">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-zinc-900 dark:text-white text-xs">Automotive Specialists</h4>
              <p className="text-[11px] text-zinc-500 mt-0.5">Direct technical fitment support</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-5 gap-8">
        {/* Brand Column */}
        <div className="md:col-span-2 space-y-3">
          <div className="flex items-center gap-2">
            <span className="font-display text-xl font-black text-zinc-900 dark:text-white">AutoApex</span>
            <span className="w-2 h-2 rounded-full bg-red-600" />
          </div>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-sm">
            Engineering premium custom-molded automotive accessories, all-weather 7D mats, 4K night-vision surveillance systems, and aero components tailored with surgical fitment for Indian and global automobiles.
          </p>
          <div className="pt-2 flex items-center gap-2 text-zinc-500 text-[11px]">
            <Lock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Secure 256-Bit SSL Encrypted Razorpay Gateway</span>
          </div>
        </div>

        {/* Quick Links */}
        <div className="space-y-2.5">
          <h4 className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider">Catalog</h4>
          <ul className="space-y-1.5 text-xs">
            <li>
              <button onClick={() => onNavigate('catalog', { category: 'Interior' })} className="hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer">
                Interior Accessories
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('catalog', { category: 'Exterior' })} className="hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer">
                Exterior & Aerodynamics
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('catalog', { category: 'Electronics' })} className="hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer">
                Electronics & Dash Cams
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('catalog', { category: 'Car Care' })} className="hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer">
                Car Care & Coatings
              </button>
            </li>
          </ul>
        </div>

        {/* Popular Cars */}
        <div className="space-y-2.5">
          <h4 className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider">Popular Fitments</h4>
          <ul className="space-y-1.5 text-xs">
            <li>
              <button onClick={() => onNavigate('catalog', { carBrand: 'Hyundai', carModel: 'Creta' })} className="hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer">
                Hyundai Creta (2020-2025)
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('catalog', { carBrand: 'Tata Motors', carModel: 'Nexon' })} className="hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer">
                Tata Nexon (2020-2025)
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('catalog', { carBrand: 'Mahindra', carModel: 'Thar' })} className="hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer">
                Mahindra Thar (2020-2025)
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('catalog', { carBrand: 'Toyota', carModel: 'Fortuner' })} className="hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer">
                Toyota Fortuner (2018-2025)
              </button>
            </li>
          </ul>
        </div>

        {/* Customer Service */}
        <div className="space-y-2.5">
          <h4 className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider">Assistance</h4>
          <ul className="space-y-1.5 text-xs">
            <li>
              <button onClick={() => onNavigate('orders')} className="hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer">
                Order Tracking
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('compatibility')} className="hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer">
                Vehicle Fitment Guide
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('offers')} className="hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer">
                Coupons & Discounts
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('auth')} className="hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer">
                My Account
              </button>
            </li>
          </ul>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="border-t border-zinc-200 dark:border-zinc-850 py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-zinc-500">
          <p>© 2026 AutoApex Technologies Ltd. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span>Payment Partner: Razorpay</span>
            <span>·</span>
            <span>Logistics: Delhivery Express</span>
            <span>·</span>
            <span>Engineered with Precision</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
