import React from 'react';
import { X, Car } from 'lucide-react';
import { CarSelector } from './CarSelector.tsx';

interface VehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectVehicle: (brand: string, model: string, year: number) => void;
}

export const VehicleModal: React.FC<VehicleModalProps> = ({
  isOpen,
  onClose,
  onSelectVehicle
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div onClick={onClose} className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-2xl space-y-4 transition-colors">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-850">
          <div className="flex items-center gap-2">
            <Car className="w-5 h-5 text-red-600 dark:text-red-500" />
            <h3 className="text-base font-bold text-zinc-950 dark:text-white">Select Vehicle Fitment</h3>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <CarSelector
          onFindProducts={(brand, model, year) => {
            onSelectVehicle(brand, model, year);
            onClose();
          }}
          compact
        />
      </div>
    </div>
  );
};
