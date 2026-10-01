import React, { useState, useEffect } from 'react';
import { ShieldCheck, Car, ChevronRight, CheckCircle2, Search, ArrowRight } from 'lucide-react';
import { CarBrand, CarModel } from '../types/index.ts';
import { api } from '../services/api.ts';
import { useVehicle } from '../context/VehicleContext.tsx';

interface CompatibilityViewProps {
  onSelectVehicleToShop: (brand: string, model: string, year: number) => void;
}

export const CompatibilityView: React.FC<CompatibilityViewProps> = ({ onSelectVehicleToShop }) => {
  const { selectedVehicle, setSelectedVehicle } = useVehicle();
  const [brands, setBrands] = useState<CarBrand[]>([]);
  const [models, setModels] = useState<CarModel[]>([]);
  const [activeBrand, setActiveBrand] = useState('brand_hyundai');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        const [b, m] = await Promise.all([api.cars.getBrands(), api.cars.getModels()]);
        setBrands(b);
        setModels(m);
      } catch (err) {
        console.error('Failed loading car data:', err);
      }
    }
    loadData();
  }, []);

  const filteredModels = models.filter(m => {
    const brandMatch = m.brandId.toLowerCase() === activeBrand.toLowerCase();
    const searchMatch = !searchQuery || m.name.toLowerCase().includes(searchQuery.toLowerCase()) || m.brandName.toLowerCase().includes(searchQuery.toLowerCase());
    return brandMatch && searchMatch;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-red-600 dark:text-red-500">Automotive Engineering</span>
        <h1 className="text-3xl font-black text-zinc-950 dark:text-white font-display">AutoApex Vehicle Fitment Matrix</h1>
        <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
          Every custom 7D floor mat, perforated Nappa seat cover, aerodynamic spoiler, and electronics kit is laser-scanned to millimeter precision for certified chassis tolerances.
        </p>
      </div>

      {/* Brand Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 border-b border-zinc-200 dark:border-zinc-850">
        {brands.map(b => (
          <button
            key={b.id}
            onClick={() => setActiveBrand(b.id)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              activeBrand === b.id
                ? 'bg-zinc-900 text-white dark:bg-zinc-800 dark:text-white shadow-sm'
                : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-200 dark:hover:bg-zinc-900'
            }`}
          >
            {b.name}
          </button>
        ))}
      </div>

      {/* Models Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredModels.map(model => (
          <div
            key={model.id}
            className="p-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 rounded-2xl space-y-4 transition-all shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] uppercase font-mono text-zinc-500">{model.brandName}</span>
                <h3 className="text-base font-bold text-zinc-950 dark:text-white mt-0.5">{model.name}</h3>
                <span className="text-xs text-zinc-500 dark:text-zinc-400">{model.bodyType} Segment</span>
              </div>
              <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-zinc-850 flex items-center justify-center text-red-600 dark:text-red-500">
                <Car className="w-4 h-4" />
              </div>
            </div>

            <div className="space-y-1 text-xs">
              <span className="text-[10px] text-zinc-500 block">Supported Production Years:</span>
              <div className="flex flex-wrap gap-1">
                {model.years.map(yr => (
                  <span key={yr} className="px-2 py-0.5 bg-zinc-100 dark:bg-zinc-950 text-zinc-700 dark:text-zinc-300 rounded font-mono text-[10px] border border-zinc-200 dark:border-zinc-850">
                    {yr}
                  </span>
                ))}
              </div>
            </div>

            <button
              onClick={() => {
                const latestYear = model.years[model.years.length - 1];
                setSelectedVehicle({ brand: model.brandName, model: model.name, year: latestYear });
                onSelectVehicleToShop(model.brandName, model.name, latestYear);
              }}
              className="w-full py-2 bg-zinc-100 hover:bg-red-600 text-zinc-800 hover:text-white dark:bg-zinc-950 dark:hover:bg-red-600 dark:text-zinc-200 dark:hover:text-white border border-zinc-200 hover:border-red-600 dark:border-zinc-800 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>View Compatible Gear</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
