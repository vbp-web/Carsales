import React, { useState, useEffect } from 'react';
import { Car, ChevronRight, CheckCircle2 } from 'lucide-react';
import { useVehicle } from '../../context/VehicleContext.tsx';
import { api } from '../../services/api.ts';
import { CarBrand, CarModel } from '../../types/index.ts';

interface CarSelectorProps {
  onFindProducts?: (brand: string, model: string, year: number) => void;
  compact?: boolean;
}

export const CarSelector: React.FC<CarSelectorProps> = ({ onFindProducts, compact = false }) => {
  const { selectedVehicle, setSelectedVehicle } = useVehicle();

  const [brands, setBrands] = useState<CarBrand[]>([]);
  const [models, setModels] = useState<CarModel[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<string>(selectedVehicle?.brand || 'Hyundai');
  const [selectedModel, setSelectedModel] = useState<string>(selectedVehicle?.model || 'Creta');
  const [selectedYear, setSelectedYear] = useState<number>(selectedVehicle?.year || 2024);
  const [availableYears, setAvailableYears] = useState<number[]>([2020, 2021, 2022, 2023, 2024, 2025]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadBrands() {
      try {
        const data = await api.cars.getBrands();
        setBrands(data);
      } catch (err) {
        console.error('Failed fetching brands:', err);
      }
    }
    loadBrands();
  }, []);

  useEffect(() => {
    async function loadModels() {
      if (!selectedBrand) return;
      try {
        setLoading(true);
        const data = await api.cars.getModels(selectedBrand);
        setModels(data);
        if (data.length > 0) {
          const exists = data.some(m => m.name === selectedModel);
          if (!exists) {
            setSelectedModel(data[0].name);
            setAvailableYears(data[0].years);
            setSelectedYear(data[0].years[data[0].years.length - 1]);
          } else {
            const current = data.find(m => m.name === selectedModel);
            if (current) {
              setAvailableYears(current.years);
              if (!current.years.includes(selectedYear)) {
                setSelectedYear(current.years[current.years.length - 1]);
              }
            }
          }
        }
      } catch (err) {
        console.error('Failed fetching models:', err);
      } finally {
        setLoading(false);
      }
    }
    loadModels();
  }, [selectedBrand]);

  const handleModelChange = (modelName: string) => {
    setSelectedModel(modelName);
    const m = models.find(mod => mod.name === modelName);
    if (m && m.years?.length) {
      setAvailableYears(m.years);
      setSelectedYear(m.years[m.years.length - 1]);
    }
  };

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBrand || !selectedModel || !selectedYear) return;

    setSelectedVehicle({
      brand: selectedBrand,
      model: selectedModel,
      year: selectedYear
    });

    if (onFindProducts) {
      onFindProducts(selectedBrand, selectedModel, selectedYear);
    }
  };

  const popularCars = [
    { brand: 'Hyundai', model: 'Creta', year: 2024 },
    { brand: 'Tata Motors', model: 'Nexon', year: 2024 },
    { brand: 'Mahindra', model: 'Thar', year: 2024 },
    { brand: 'Toyota', model: 'Fortuner', year: 2024 },
    { brand: 'Kia', model: 'Seltos', year: 2024 },
    { brand: 'Maruti Suzuki', model: 'Brezza', year: 2024 }
  ];

  return (
    <div
      className={`w-full bg-white dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 backdrop-blur-sm transition-colors duration-200 ${
        compact ? 'shadow-md dark:shadow-lg' : 'shadow-xl shadow-zinc-200/50 dark:shadow-2xl'
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-red-600/10 border border-red-500/20 text-red-600 dark:text-red-500 flex items-center justify-center">
            <Car className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-zinc-900 dark:text-white">Find Accessories For Your Car</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Guaranteed 100% laser-measured fitment for your vehicle</p>
          </div>
        </div>

        {selectedVehicle && (
          <div className="flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 px-3 py-1 rounded-lg">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            <span>Active: {selectedVehicle.brand} {selectedVehicle.model} ({selectedVehicle.year})</span>
          </div>
        )}
      </div>

      <form onSubmit={handleApply} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        {/* Step 1: Brand */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Car Brand</label>
          <select
            value={selectedBrand}
            onChange={e => setSelectedBrand(e.target.value)}
            className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg px-3 py-2.5 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-red-500 transition-colors"
          >
            {brands.map(b => (
              <option key={b.id} value={b.name}>
                {b.name}
              </option>
            ))}
          </select>
        </div>

        {/* Step 2: Model */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Car Model</label>
          <select
            value={selectedModel}
            onChange={e => handleModelChange(e.target.value)}
            disabled={loading}
            className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg px-3 py-2.5 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-red-500 transition-colors disabled:opacity-50"
          >
            {models.map(m => (
              <option key={m.id} value={m.name}>
                {m.name} ({m.bodyType})
              </option>
            ))}
          </select>
        </div>

        {/* Step 3: Year */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Manufacturing Year</label>
          <select
            value={selectedYear}
            onChange={e => setSelectedYear(Number(e.target.value))}
            className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg px-3 py-2.5 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-red-500 transition-colors"
          >
            {availableYears.map(yr => (
              <option key={yr} value={yr}>
                {yr}
              </option>
            ))}
          </select>
        </div>

        {/* Action Button */}
        <div className="flex items-end">
          <button
            type="submit"
            className="w-full bg-red-600 hover:bg-red-500 text-white font-semibold text-xs py-2.5 px-4 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-md shadow-red-500/20"
          >
            <span>Find Compatible Gear</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </form>

      {/* Quick Select Popular Vehicles */}
      <div className="mt-4 pt-3 border-t border-zinc-200 dark:border-zinc-850 flex flex-wrap items-center gap-2">
        <span className="text-[11px] text-zinc-500 shrink-0">Popular:</span>
        {popularCars.map(c => (
          <button
            key={`${c.brand}-${c.model}`}
            type="button"
            onClick={() => {
              setSelectedBrand(c.brand);
              setSelectedModel(c.model);
              setSelectedYear(c.year);
              setSelectedVehicle(c);
              if (onFindProducts) onFindProducts(c.brand, c.model, c.year);
            }}
            className={`text-[11px] px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
              selectedVehicle?.brand === c.brand && selectedVehicle?.model === c.model
                ? 'bg-zinc-800 text-white dark:bg-zinc-800 dark:text-white border border-zinc-700'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white bg-zinc-100 dark:bg-zinc-950/60 hover:bg-zinc-200 dark:hover:bg-zinc-850'
            }`}
          >
            {c.brand} {c.model}
          </button>
        ))}
      </div>
    </div>
  );
};
