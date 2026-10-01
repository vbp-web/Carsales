import React, { useEffect, useState } from 'react';
import {
  Car,
  ShieldCheck,
  ChevronRight,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Star,
  CheckCircle2,
  Mail,
  Zap
} from 'lucide-react';
import { Product, Category } from '../types/index.ts';
import { api } from '../services/api.ts';
import { useVehicle } from '../context/VehicleContext.tsx';
import { ProductCard } from '../components/common/ProductCard.tsx';
import { CarSelector } from '../components/common/CarSelector.tsx';
import { useToast } from '../context/ToastContext.tsx';

interface HomeViewProps {
  onNavigate: (view: string, params?: any) => void;
  onOpenVehicleModal: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ onNavigate }) => {
  const { selectedVehicle } = useVehicle();
  const { success } = useToast();

  const [categories, setCategories] = useState<Category[]>([]);
  const [bestsellers, setBestsellers] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [aiRecommendations, setAiRecommendations] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [newsletterEmail, setNewsletterEmail] = useState('');

  const heroImage = '/src/assets/images/hero_automotive_accessories_1790681434171.jpg';

  useEffect(() => {
    async function loadHomeData() {
      try {
        setLoading(true);
        const [cats, bestsellersRes, newArrivalsRes, recs] = await Promise.all([
          api.categories.getAll(),
          api.products.getAll({ bestseller: true, limit: 4 }),
          api.products.getAll({ newArrival: true, limit: 4 }),
          api.recommendations.get({
            carBrand: selectedVehicle?.brand,
            carModel: selectedVehicle?.model,
            carYear: selectedVehicle?.year,
            limit: 4
          })
        ]);

        setCategories(cats || []);
        setBestsellers(bestsellersRes.products || []);
        setNewArrivals(newArrivalsRes.products || []);
        setAiRecommendations(recs || []);
      } catch (err) {
        console.error('Failed loading home data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadHomeData();
  }, [selectedVehicle]);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      success('Subscribed!', 'Use coupon FIRST500 for ₹500 off your first purchase.');
      setNewsletterEmail('');
    }
  };

  const carBrands = [
    { name: 'Hyundai', models: 'Creta, Venue, Verna' },
    { name: 'Tata Motors', models: 'Nexon, Harrier, Safari' },
    { name: 'Mahindra', models: 'Thar, Scorpio-N, XUV700' },
    { name: 'Toyota', models: 'Fortuner, Innova Crysta' },
    { name: 'Honda', models: 'City, Elevate, Amaze' },
    { name: 'Kia', models: 'Seltos, Sonet, Carens' },
    { name: 'Maruti Suzuki', models: 'Brezza, Grand Vitara' },
    { name: 'Volkswagen', models: 'Virtus, Taigun, Tiguan' }
  ];

  return (
    <div className="space-y-16">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden bg-zinc-100/70 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-850 transition-colors duration-200">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Column */}
          <div className="lg:col-span-7 space-y-6 z-10">
            <div className="flex items-center gap-2 text-xs text-red-600 dark:text-red-400 font-semibold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
              <span>Laser-Engineered Automotive Gear</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-zinc-950 dark:text-white tracking-tight leading-[1.08] font-display max-w-xl">
              Precision accessories tailored for your drive.
            </h1>

            <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-lg">
              Explore laser-scanned 7D all-weather mats, bespoke perforated Nappa leather seat covers, 4K Sony STARVIS night-vision dashcams, and aerodynamic styling designed to fit your exact vehicle.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => onNavigate('catalog')}
                className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-semibold text-xs sm:text-sm rounded-xl flex items-center gap-2 transition-colors cursor-pointer shadow-lg shadow-red-600/20"
              >
                <span>Find Accessories For Your Car</span>
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onNavigate('catalog')}
                className="px-5 py-3 bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 hover:text-zinc-950 dark:hover:text-white border border-zinc-300 dark:border-zinc-800 font-semibold text-xs sm:text-sm rounded-xl transition-colors cursor-pointer shadow-sm"
              >
                Shop All Accessories
              </button>
            </div>

            {/* Micro Trust Markers */}
            <div className="pt-4 flex flex-wrap items-center gap-5 text-xs text-zinc-600 dark:text-zinc-400">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Zero Fitment Errors</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Razorpay Secured</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Star className="w-4 h-4 text-amber-500 dark:text-amber-400 fill-current" />
                <span>4.8/5 Rated by 12,000+ Drivers</span>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Visual Asset */}
          <div className="lg:col-span-5 relative">
            <div className="relative aspect-[16/9] lg:aspect-[4/3] rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-2xl bg-zinc-900 group">
              <img
                src={heroImage}
                alt="Automotive accessories showcase"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 p-3 bg-white/95 dark:bg-zinc-950/80 backdrop-blur-md rounded-xl border border-zinc-200 dark:border-zinc-800/80 flex items-center justify-between text-xs shadow-lg">
                <div>
                  <span className="text-zinc-500 dark:text-zinc-400 block text-[11px]">Active Vehicle Config</span>
                  <span className="font-semibold text-zinc-900 dark:text-white">
                    {selectedVehicle ? `${selectedVehicle.brand} ${selectedVehicle.model} (${selectedVehicle.year})` : 'Select your car'}
                  </span>
                </div>
                <button
                  onClick={() => onNavigate('catalog', { carBrand: selectedVehicle?.brand, carModel: selectedVehicle?.model })}
                  className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white font-semibold rounded text-[11px] transition-colors cursor-pointer"
                >
                  View Fits
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Embedded Car Selector Component */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mb-8 relative z-20">
          <CarSelector
            onFindProducts={(brand, model, year) => {
              onNavigate('catalog', { carBrand: brand, carModel: model, carYear: year });
            }}
          />
        </div>
      </section>

      {/* 3. Featured Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-red-600 dark:text-red-500">Categories</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-zinc-950 dark:text-white tracking-tight font-display mt-1">
              Curated by vehicle segment
            </h2>
          </div>
          <button
            onClick={() => onNavigate('catalog')}
            className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>Explore all categories</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {categories.map(cat => (
            <div
              key={cat.id}
              onClick={() => onNavigate('catalog', { category: cat.name })}
              className="group p-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 rounded-xl transition-all duration-200 hover:-translate-y-1 hover:shadow-lg shadow-sm cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-mono text-zinc-500 tabular-nums">0{cat.productCount || 12} Products</span>
                  <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800/80 group-hover:bg-red-50 dark:group-hover:bg-red-600/20 text-zinc-600 dark:text-zinc-400 group-hover:text-red-600 dark:group-hover:text-red-400 flex items-center justify-center transition-colors">
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>

                <h3 className="text-base font-bold text-zinc-950 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                  {cat.name}
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed line-clamp-2">
                  {cat.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-850 flex flex-wrap gap-1.5">
                {cat.subcategories.slice(0, 3).map(sub => (
                  <span key={sub} className="text-[10px] text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-950 px-2 py-0.5 rounded border border-zinc-200 dark:border-zinc-850">
                    {sub}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. AI-Powered Smart Vehicle Recommendations */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-zinc-100 dark:bg-gradient-to-br dark:from-zinc-900 dark:via-zinc-900 dark:to-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 sm:p-8 relative overflow-hidden transition-colors">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-red-600/10 dark:bg-red-600/20 text-red-600 dark:text-red-500 border border-red-500/20 dark:border-red-500/30 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-zinc-950 dark:text-white font-display">
                    Recommended For Your {selectedVehicle ? `${selectedVehicle.brand} ${selectedVehicle.model}` : 'Vehicle'}
                  </h3>
                  <span className="text-[10px] font-mono uppercase bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800/40 px-2 py-0.5 rounded font-semibold">
                    Smart Engine
                  </span>
                </div>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
                  Algorithmic fitment matching and cross-category accessory synergy
                </p>
              </div>
            </div>

            <button
              onClick={() => onNavigate('catalog', { carBrand: selectedVehicle?.brand, carModel: selectedVehicle?.model })}
              className="text-xs font-semibold text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 flex items-center gap-1 cursor-pointer"
            >
              <span>View full matching catalog</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {aiRecommendations.slice(0, 4).map(prod => (
              <ProductCard
                key={prod.id}
                product={prod}
                onClick={() => onNavigate('product', { id: prod.id })}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 5. Best Sellers Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-red-600 dark:text-red-500">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Top Drivers' Choice</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-zinc-950 dark:text-white tracking-tight font-display mt-1">
              Bestselling Automotive Upgrades
            </h2>
          </div>
          <button
            onClick={() => onNavigate('catalog', { sort: 'popular' })}
            className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>See all top sellers</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {bestsellers.map(prod => (
            <ProductCard
              key={prod.id}
              product={prod}
              onClick={() => onNavigate('product', { id: prod.id })}
            />
          ))}
        </div>
      </section>

      {/* 6. Promotional Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-zinc-900 text-white border border-zinc-800 rounded-2xl p-6 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden shadow-xl">
          <div className="space-y-3 max-w-xl z-10">
            <span className="text-xs font-bold text-red-400 uppercase tracking-wider">Exclusive First Order Code</span>
            <h3 className="text-2xl sm:text-3xl font-bold text-white font-display">
              Get ₹500 off your complete car upgrade kit.
            </h3>
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
              Use code <strong className="text-white font-mono bg-zinc-950 px-2 py-0.5 rounded border border-zinc-700">FIRST500</strong> at checkout on orders above ₹2,500. Includes free doorstep express delivery and laser-measured fitment assurance.
            </p>
            <div className="pt-2">
              <button
                onClick={() => onNavigate('catalog')}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white font-semibold text-xs rounded-xl transition-colors cursor-pointer shadow-md shadow-red-950"
              >
                Claim Discount & Shop
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 w-full md:w-auto shrink-0 z-10 text-center">
            <div className="p-4 bg-zinc-950/80 border border-zinc-800 rounded-xl">
              <span className="text-2xl font-bold text-white tabular-nums">100%</span>
              <span className="block text-[11px] text-zinc-400 mt-1">Laser Scanned Fit</span>
            </div>
            <div className="p-4 bg-zinc-950/80 border border-zinc-800 rounded-xl">
              <span className="text-2xl font-bold text-white tabular-nums">2-Year</span>
              <span className="block text-[11px] text-zinc-400 mt-1">Direct Warranty</span>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Shop by Car Brand Strip */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-8 space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-red-600 dark:text-red-500">Vehicle Database</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-zinc-950 dark:text-white font-display">
            Shop By Car Manufacturer
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Select your car brand to view 100% verified matching custom accessories.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {carBrands.map(brand => (
            <button
              key={brand.name}
              onClick={() => onNavigate('catalog', { carBrand: brand.name })}
              className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 rounded-xl text-left transition-all hover:-translate-y-0.5 cursor-pointer group shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-zinc-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                  {brand.name}
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white group-hover:translate-x-0.5 transition-transform" />
              </div>
              <span className="text-[11px] text-zinc-500 block mt-1 truncate">{brand.models}</span>
            </button>
          ))}
        </div>
      </section>

      {/* 8. New Arrivals */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-red-600 dark:text-red-500">
              <Zap className="w-3.5 h-3.5" />
              <span>Latest Drops</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-zinc-950 dark:text-white tracking-tight font-display mt-1">
              New High-Performance Arrivals
            </h2>
          </div>
          <button
            onClick={() => onNavigate('catalog', { newArrival: true })}
            className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>View all new gear</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {newArrivals.map(prod => (
            <ProductCard
              key={prod.id}
              product={prod}
              onClick={() => onNavigate('product', { id: prod.id })}
            />
          ))}
        </div>
      </section>

      {/* 9. Verified Customer Reviews */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-8 space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-red-600 dark:text-red-500">Social Proof</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-zinc-950 dark:text-white font-display">
            Trusted by Passionate Car Owners
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl space-y-3 shadow-sm">
            <div className="flex items-center gap-1 text-amber-500 dark:text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-current" />
              ))}
            </div>
            <h4 className="text-sm font-semibold text-zinc-900 dark:text-white">"Flawless fit on my 2024 Creta SX(O)"</h4>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              The laser measurements are spot-on! No gaps on the dead pedal or side sills. The extra curly grass mat holds dirt and sand perfectly. Very premium feel.
            </p>
            <div className="pt-2 border-t border-zinc-100 dark:border-zinc-850 flex items-center justify-between text-[11px]">
              <span className="font-semibold text-zinc-800 dark:text-zinc-300">Vikram Malhotra</span>
              <span className="text-emerald-700 dark:text-emerald-400 font-semibold">Verified Creta Owner</span>
            </div>
          </div>

          <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl space-y-3 shadow-sm">
            <div className="flex items-center gap-1 text-amber-500 dark:text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-current" />
              ))}
            </div>
            <h4 className="text-sm font-semibold text-zinc-900 dark:text-white">"Crystal clear 4K night footage"</h4>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              License plates are completely legible even on dark highways with high beam glare thanks to the Sony Starvis 2 sensor. 5GHz Wi-Fi downloads video clips to my phone in seconds.
            </p>
            <div className="pt-2 border-t border-zinc-100 dark:border-zinc-850 flex items-center justify-between text-[11px]">
              <span className="font-semibold text-zinc-800 dark:text-zinc-300">Ananya Sharma</span>
              <span className="text-emerald-700 dark:text-emerald-400 font-semibold">Verified Buyer</span>
            </div>
          </div>

          <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl space-y-3 shadow-sm">
            <div className="flex items-center gap-1 text-amber-500 dark:text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-current" />
              ))}
            </div>
            <h4 className="text-sm font-semibold text-zinc-900 dark:text-white">"Feels like a ₹50 Lakh luxury interior"</h4>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              The red contrast stitching and perforated leather look stunning on my Nexon. The side airbag test certification gave me complete confidence.
            </p>
            <div className="pt-2 border-t border-zinc-100 dark:border-zinc-850 flex items-center justify-between text-[11px]">
              <span className="font-semibold text-zinc-800 dark:text-zinc-300">Sanjay Nair</span>
              <span className="text-emerald-700 dark:text-emerald-400 font-semibold">Verified Nexon Owner</span>
            </div>
          </div>
        </div>
      </section>

      {/* 10. Newsletter Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
        <div className="bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 sm:p-12 text-center max-w-2xl mx-auto space-y-4 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-red-600/10 text-red-600 dark:text-red-500 border border-red-500/20 flex items-center justify-center mx-auto">
            <Mail className="w-5 h-5" />
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-zinc-950 dark:text-white font-display">
            Join the AutoApex Driver Club
          </h3>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Receive custom fitment releases for newly launched car models, member discounts, and automotive maintenance guides.
          </p>

          <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto pt-2">
            <input
              type="email"
              value={newsletterEmail}
              onChange={e => setNewsletterEmail(e.target.value)}
              placeholder="Enter your email address"
              required
              className="flex-1 bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-red-500"
            />
            <button
              type="submit"
              className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white font-semibold text-xs rounded-xl transition-colors cursor-pointer shadow-md shadow-red-600/20"
            >
              Get Discount
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};
