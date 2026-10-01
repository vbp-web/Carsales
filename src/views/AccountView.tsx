import React, { useState } from 'react';
import {
  User as UserIcon,
  Package,
  Heart,
  MapPin,
  Car,
  ShieldAlert,
  LogOut,
  Plus,
  Trash2,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { useWishlist } from '../context/WishlistContext.tsx';
import { useVehicle } from '../context/VehicleContext.tsx';

interface AccountViewProps {
  onNavigateOrders: () => void;
  onNavigateWishlist: () => void;
  onNavigateAdmin: () => void;
  onOpenVehicleModal: () => void;
}

export const AccountView: React.FC<AccountViewProps> = ({
  onNavigateOrders,
  onNavigateWishlist,
  onNavigateAdmin,
  onOpenVehicleModal
}) => {
  const { user, addresses, logout, deleteAddress, createAddress, quickLoginDemo } = useAuth();
  const { wishlist } = useWishlist();
  const { selectedVehicle } = useVehicle();

  const [activeTab, setActiveTab] = useState<'profile' | 'addresses' | 'garage'>('profile');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAddrName, setNewAddrName] = useState(user?.name || '');
  const [newAddrPhone, setNewAddrPhone] = useState(user?.phone || '');
  const [newAddrLine1, setNewAddrLine1] = useState('');
  const [newAddrCity, setNewAddrCity] = useState('');
  const [newAddrState, setNewAddrState] = useState('');
  const [newAddrPincode, setNewAddrPincode] = useState('');

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    await createAddress({
      name: newAddrName,
      phone: newAddrPhone,
      addressLine1: newAddrLine1,
      apartment: '',
      city: newAddrCity,
      state: newAddrState,
      pincode: newAddrPincode,
      country: 'India',
      isDefault: addresses.length === 0
    });
    setShowAddModal(false);
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-zinc-950 dark:text-white">Sign In to AutoApex</h2>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">Manage orders, delivery addresses, and configured vehicles.</p>
        <div className="flex flex-col gap-2 pt-2">
          <button
            onClick={() => quickLoginDemo('CUSTOMER')}
            className="w-full py-2.5 bg-red-600 hover:bg-red-500 text-white font-semibold text-xs rounded-xl shadow-md shadow-red-500/20"
          >
            Sign in as Demo Customer
          </button>
          <button
            onClick={() => quickLoginDemo('ADMIN')}
            className="w-full py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-xs rounded-xl"
          >
            Sign in as Demo Administrator
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Profile Summary */}
      <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-red-600/10 border border-red-500/20 text-red-600 dark:text-red-500 font-black text-2xl flex items-center justify-center font-display">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-zinc-950 dark:text-white">{user.name}</h1>
              <span className="text-[10px] font-mono uppercase bg-red-100 text-red-700 dark:bg-red-950/80 dark:text-red-400 border border-red-200 dark:border-red-900 px-2 py-0.5 rounded font-semibold">
                {user.role}
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{user.email} · {user.phone || '+91 98765 43210'}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {user.role === 'ADMIN' && (
            <button
              onClick={onNavigateAdmin}
              className="px-4 py-2 bg-red-50 dark:bg-red-950/60 hover:bg-red-100 dark:hover:bg-red-900 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800/60 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Admin Dashboard</span>
            </button>
          )}

          <button
            onClick={logout}
            className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-zinc-200 dark:border-transparent"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* KPI Cards: Total Orders, Wishlist, Active Car */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          onClick={onNavigateOrders}
          className="p-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 hover:border-zinc-300 dark:hover:border-zinc-800 rounded-2xl transition-colors cursor-pointer flex items-center justify-between shadow-sm"
        >
          <div>
            <span className="text-[11px] text-zinc-500 uppercase font-semibold tracking-wider block">My Orders</span>
            <span className="text-2xl font-bold text-zinc-950 dark:text-white tabular-nums mt-1 block">View History</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-850 flex items-center justify-center text-red-600 dark:text-red-500">
            <Package className="w-5 h-5" />
          </div>
        </div>

        <div
          onClick={onNavigateWishlist}
          className="p-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 hover:border-zinc-300 dark:hover:border-zinc-800 rounded-2xl transition-colors cursor-pointer flex items-center justify-between shadow-sm"
        >
          <div>
            <span className="text-[11px] text-zinc-500 uppercase font-semibold tracking-wider block">Saved Wishlist</span>
            <span className="text-2xl font-bold text-zinc-950 dark:text-white tabular-nums mt-1 block">{wishlist.length} Items</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-850 flex items-center justify-center text-red-600 dark:text-red-500">
            <Heart className="w-5 h-5" />
          </div>
        </div>

        <div
          onClick={onOpenVehicleModal}
          className="p-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 hover:border-zinc-300 dark:hover:border-zinc-800 rounded-2xl transition-colors cursor-pointer flex items-center justify-between shadow-sm"
        >
          <div>
            <span className="text-[11px] text-zinc-500 uppercase font-semibold tracking-wider block">Configured Garage</span>
            <span className="text-sm font-bold text-zinc-950 dark:text-white truncate max-w-[150px] mt-1 block">
              {selectedVehicle ? `${selectedVehicle.brand} ${selectedVehicle.model}` : 'Configure Car'}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-850 flex items-center justify-center text-red-600 dark:text-red-500">
            <Car className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-zinc-200 dark:border-zinc-850 pb-3 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('profile')}
          className={`pb-2 transition-colors cursor-pointer ${
            activeTab === 'profile'
              ? 'text-zinc-950 dark:text-white border-b-2 border-red-500'
              : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
          }`}
        >
          Profile Details
        </button>
        <button
          onClick={() => setActiveTab('addresses')}
          className={`pb-2 transition-colors cursor-pointer ${
            activeTab === 'addresses'
              ? 'text-zinc-950 dark:text-white border-b-2 border-red-500'
              : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
          }`}
        >
          Saved Delivery Addresses ({addresses.length})
        </button>
        <button
          onClick={() => setActiveTab('garage')}
          className={`pb-2 transition-colors cursor-pointer ${
            activeTab === 'garage'
              ? 'text-zinc-950 dark:text-white border-b-2 border-red-500'
              : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
          }`}
        >
          Vehicle Garage
        </button>
      </div>

      {/* Tab 1: Profile */}
      {activeTab === 'profile' && (
        <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded-2xl space-y-4 max-w-xl text-xs shadow-sm">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-zinc-500 block mb-1">Name</span>
              <p className="font-semibold text-zinc-900 dark:text-white">{user.name}</p>
            </div>
            <div>
              <span className="text-zinc-500 block mb-1">Email Address</span>
              <p className="font-semibold text-zinc-900 dark:text-white">{user.email}</p>
            </div>
            <div>
              <span className="text-zinc-500 block mb-1">Phone Number</span>
              <p className="font-semibold text-zinc-900 dark:text-white">{user.phone || 'Not provided'}</p>
            </div>
            <div>
              <span className="text-zinc-500 block mb-1">Account Role</span>
              <p className="font-semibold text-red-600 dark:text-red-400">{user.role}</p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Addresses */}
      {activeTab === 'addresses' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider">Saved Shipping Addresses</h3>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white font-semibold text-xs rounded-lg flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Address</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {addresses.map(addr => (
              <div key={addr.id} className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded-xl text-xs space-y-2 relative shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-zinc-950 dark:text-white">{addr.name}</span>
                  <button
                    onClick={() => deleteAddress(addr.id)}
                    className="text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 p-1 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-zinc-800 dark:text-zinc-300">{addr.addressLine1}</p>
                <p className="text-zinc-500 dark:text-zinc-400">{addr.city}, {addr.state} - {addr.pincode}</p>
                <p className="text-zinc-500 font-mono">Phone: {addr.phone}</p>
                {addr.isDefault && (
                  <span className="inline-block text-[10px] text-emerald-700 dark:text-emerald-400 font-mono font-bold">DEFAULT DESTINATION</span>
                )}
              </div>
            ))}
          </div>

          {showAddModal && (
            <form onSubmit={handleAddAddress} className="p-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl space-y-3 max-w-lg shadow-sm">
              <h4 className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider">New Shipping Destination</h4>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Full Name"
                  value={newAddrName}
                  onChange={e => setNewAddrName(e.target.value)}
                  required
                  className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded px-3 py-1.5 text-xs text-zinc-900 dark:text-white"
                />
                <input
                  type="text"
                  placeholder="Phone"
                  value={newAddrPhone}
                  onChange={e => setNewAddrPhone(e.target.value)}
                  required
                  className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded px-3 py-1.5 text-xs text-zinc-900 dark:text-white"
                />
              </div>
              <input
                type="text"
                placeholder="Street Address"
                value={newAddrLine1}
                onChange={e => setNewAddrLine1(e.target.value)}
                required
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded px-3 py-1.5 text-xs text-zinc-900 dark:text-white"
              />
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="text"
                  placeholder="City"
                  value={newAddrCity}
                  onChange={e => setNewAddrCity(e.target.value)}
                  required
                  className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded px-3 py-1.5 text-xs text-zinc-900 dark:text-white"
                />
                <input
                  type="text"
                  placeholder="State"
                  value={newAddrState}
                  onChange={e => setNewAddrState(e.target.value)}
                  required
                  className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded px-3 py-1.5 text-xs text-zinc-900 dark:text-white"
                />
                <input
                  type="text"
                  placeholder="Pincode"
                  value={newAddrPincode}
                  onChange={e => setNewAddrPincode(e.target.value)}
                  required
                  className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded px-3 py-1.5 text-xs text-zinc-900 dark:text-white font-mono"
                />
              </div>
              <div className="flex gap-2">
                <button type="submit" className="px-4 py-2 bg-red-600 text-white rounded text-xs font-semibold">
                  Save Address
                </button>
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-400 rounded text-xs">
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Tab 3: Garage */}
      {activeTab === 'garage' && (
        <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded-2xl space-y-4 max-w-xl text-xs shadow-sm">
          <h3 className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <Car className="w-4 h-4 text-red-600 dark:text-red-500" />
            Configured Vehicle
          </h3>
          {selectedVehicle ? (
            <div className="p-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl flex items-center justify-between">
              <div>
                <p className="font-bold text-zinc-950 dark:text-white text-sm">{selectedVehicle.brand} {selectedVehicle.model}</p>
                <p className="text-zinc-500 dark:text-zinc-400">Year: {selectedVehicle.year} · Verified Laser Mold Matrix Active</p>
              </div>
              <button
                onClick={onOpenVehicleModal}
                className="px-3 py-1.5 bg-white dark:bg-zinc-850 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 rounded text-xs border border-zinc-300 dark:border-transparent"
              >
                Change Car
              </button>
            </div>
          ) : (
            <p className="text-zinc-500 dark:text-zinc-400">No vehicle selected. Set your vehicle to get automatic fitment filtering.</p>
          )}
        </div>
      )}
    </div>
  );
};
