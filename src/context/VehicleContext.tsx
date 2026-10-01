import React, { createContext, useContext, useState, useEffect } from 'react';
import { VehicleSelection, Product } from '../types/index.ts';

interface VehicleContextValue {
  selectedVehicle: VehicleSelection | null;
  setSelectedVehicle: (vehicle: VehicleSelection | null) => void;
  clearVehicle: () => void;
  checkCompatibility: (product: Product) => { isCompatible: boolean; universal: boolean; reason: string };
}

const VehicleContext = createContext<VehicleContextValue | null>(null);

const STORAGE_KEY = 'autoapex_selected_vehicle';

export const VehicleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedVehicle, setSelectedVehicleState] = useState<VehicleSelection | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : { brand: 'Hyundai', model: 'Creta', year: 2024 }; // Default popular car pre-selected for rich demo UX
    } catch {
      return { brand: 'Hyundai', model: 'Creta', year: 2024 };
    }
  });

  const setSelectedVehicle = (vehicle: VehicleSelection | null) => {
    setSelectedVehicleState(vehicle);
    if (vehicle) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(vehicle));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const clearVehicle = () => {
    setSelectedVehicle(null);
  };

  const checkCompatibility = (product: Product) => {
    if (product.universalFit) {
      return {
        isCompatible: true,
        universal: true,
        reason: 'Universal Fit: Guaranteed to fit all automotive models.'
      };
    }

    if (!selectedVehicle) {
      return {
        isCompatible: true,
        universal: false,
        reason: 'Select your vehicle to verify precision fitment.'
      };
    }

    const match = product.compatibility.find(c => {
      if (c.universal) return true;
      const b = c.brandName.toLowerCase() === selectedVehicle.brand.toLowerCase();
      const m = c.modelName.toLowerCase() === selectedVehicle.model.toLowerCase();
      const y = selectedVehicle.year >= c.yearStart && selectedVehicle.year <= c.yearEnd;
      return b && m && y;
    });

    if (match) {
      return {
        isCompatible: true,
        universal: false,
        reason: `Guaranteed fit for ${selectedVehicle.brand} ${selectedVehicle.model} (${match.yearStart}–${match.yearEnd}).`
      };
    }

    return {
      isCompatible: false,
      universal: false,
      reason: `Not certified to fit ${selectedVehicle.brand} ${selectedVehicle.model} (${selectedVehicle.year}).`
    };
  };

  return (
    <VehicleContext.Provider value={{ selectedVehicle, setSelectedVehicle, clearVehicle, checkCompatibility }}>
      {children}
    </VehicleContext.Provider>
  );
};

export const useVehicle = () => {
  const context = useContext(VehicleContext);
  if (!context) throw new Error('useVehicle must be used within VehicleProvider');
  return context;
};
