import React, { useState } from 'react';
import {
  Car,
  Search,
  Heart,
  ShoppingBag,
  User as UserIcon,
  ShieldAlert,
  ChevronDown,
  Menu,
  X,
  LogOut,
  Package,
  Sun,
  Moon
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useCart } from '../../context/CartContext.tsx';
import { useWishlist } from '../../context/WishlistContext.tsx';
import { useVehicle } from '../../context/VehicleContext.tsx';
import { useTheme } from '../../context/ThemeContext.tsx';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string, params?: any) => void;
  onOpenVehicleModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate, onOpenVehicleModal }) => {
  const { user, logout, quickLoginDemo } = useAuth();
  const { itemCount, setIsCartDrawerOpen } = useCart();
  const { wishlist } = useWishlist();
  const { selectedVehicle } = useVehicle();
  const { theme, toggleTheme } = useTheme();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchInput, setShowSearchInput] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onNavigate('catalog', { search: searchQuery.trim() });
      setShowSearchInput(false);
      setSearchQuery('');
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-zinc-950/90 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-850 transition-colors duration-200">
      {/* Top Bar: Brand, Navigation, Actions */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* Zone 1: Brand wordmark */}
        <div className="flex items-center gap-4 sm:gap-6 shrink-0">
          <button
            onClick={() => {
              onNavigate('home');
              setMobileMenuOpen(false);
            }}
            className="text-lg sm:text-xl md:text-2xl font-black tracking-tight text-zinc-900 dark:text-white flex items-center gap-1.5 sm:gap-2 group text-left cursor-pointer"
          >
            <span className="font-display">AutoApex</span>
            <span className="w-2 h-2 rounded-full bg-red-600 transition-transform group-hover:scale-125" />
          </button>
        </div>

        {/* Zone 2: Desktop Navigation Links (Visible on lg: 1024px+) */}
        <nav className="hidden lg:flex items-center gap-5 xl:gap-7 text-sm font-medium text-zinc-600 dark:text-zinc-400">
          <button
            onClick={() => onNavigate('home')}
            className={`transition-colors hover:text-zinc-900 dark:hover:text-white cursor-pointer ${
              currentView === 'home' ? 'text-zinc-950 dark:text-white font-semibold' : ''
            }`}
          >
            Home
          </button>
          <button
            onClick={() => onNavigate('catalog')}
            className={`transition-colors hover:text-zinc-900 dark:hover:text-white cursor-pointer ${
              currentView === 'catalog' ? 'text-zinc-950 dark:text-white font-semibold' : ''
            }`}
          >
            Shop Accessories
          </button>
          <button
            onClick={() => onNavigate('compatibility')}
            className={`transition-colors hover:text-zinc-900 dark:hover:text-white cursor-pointer ${
              currentView === 'compatibility' ? 'text-zinc-950 dark:text-white font-semibold' : ''
            }`}
          >
            Fitment Guide
          </button>
          <button
            onClick={() => onNavigate('offers')}
            className={`transition-colors hover:text-zinc-900 dark:hover:text-white cursor-pointer ${
              currentView === 'offers' ? 'text-zinc-950 dark:text-white font-semibold' : ''
            }`}
          >
            Offers
          </button>
          {user && (
            <button
              onClick={() => onNavigate('orders')}
              className={`transition-colors hover:text-zinc-900 dark:hover:text-white cursor-pointer ${
                currentView === 'orders' ? 'text-zinc-950 dark:text-white font-semibold' : ''
              }`}
            >
              My Orders
            </button>
          )}
          {user?.role === 'ADMIN' && (
            <button
              onClick={() => onNavigate('admin')}
              className={`text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                currentView.startsWith('admin') ? 'text-red-700 dark:text-red-300' : ''
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              Admin
            </button>
          )}
        </nav>

        {/* Zone 3: Actions */}
        <div className="flex items-center gap-1 sm:gap-2 md:gap-2.5">
          {/* Theme switcher toggle */}
          <button
            onClick={toggleTheme}
            className="p-1.5 sm:p-2 text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
          >
            {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-amber-400" />}
          </button>

          {/* Vehicle selector affordance (Visible on sm+ screens; on mobile it sits inside mobile drawer) */}
          <button
            onClick={onOpenVehicleModal}
            className="hidden sm:flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-medium text-zinc-800 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
            title="Configure or change selected vehicle"
          >
            <Car className="w-3.5 h-3.5 text-red-600 dark:text-red-500" />
            <span className="max-w-[100px] md:max-w-[130px] truncate">
              {selectedVehicle ? `${selectedVehicle.brand} ${selectedVehicle.model}` : 'Select Car'}
            </span>
            <ChevronDown className="w-3 h-3 text-zinc-500 dark:text-zinc-400" />
          </button>

          {/* Search bar toggle/input */}
          <div className="relative">
            {showSearchInput ? (
              <form onSubmit={handleSearchSubmit} className="absolute right-0 sm:right-0 top-1/2 -translate-y-1/2 w-[min(calc(100vw-2rem),20rem)] z-50">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search Creta mats, dashcam..."
                    autoFocus
                    className="w-full bg-white dark:bg-zinc-900 text-xs text-zinc-900 dark:text-white pl-8 pr-7 py-2 rounded-lg border border-red-500 dark:border-red-500 focus:outline-none shadow-2xl ring-2 ring-red-500/20"
                  />
                  <Search className="w-3.5 h-3.5 text-red-500 absolute left-2.5 top-2.5" />
                  <button
                    type="button"
                    onClick={() => setShowSearchInput(false)}
                    className="absolute right-2 top-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            ) : (
              <button
                onClick={() => setShowSearchInput(true)}
                className="p-1.5 sm:p-2 text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
                title="Search accessories"
              >
                <Search className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Wishlist */}
          <button
            onClick={() => onNavigate('wishlist')}
            className="relative p-1.5 sm:p-2 text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
            title="Saved wishlist items"
          >
            <Heart className="w-4 h-4" />
            {wishlist.length > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-zinc-900 text-white dark:bg-zinc-800 text-[10px] font-bold rounded-full flex items-center justify-center border border-zinc-200 dark:border-zinc-700 tabular-nums">
                {wishlist.length}
              </span>
            )}
          </button>

          {/* Cart Bag */}
          <button
            onClick={() => setIsCartDrawerOpen(true)}
            className="relative p-1.5 sm:p-2 text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
            title="Open cart drawer"
          >
            <ShoppingBag className="w-4 h-4" />
            {itemCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center tabular-nums">
                {itemCount}
              </span>
            )}
          </button>

          {/* User Account Dropdown / Sign In Trigger */}
          <div className="relative">
            {user ? (
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-1.5 p-1 sm:px-2.5 sm:py-1.5 text-xs font-medium text-zinc-800 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-850 rounded-lg transition-colors cursor-pointer"
              >
                <div className="w-6 h-6 rounded-full bg-red-600/10 text-red-600 dark:bg-red-600/30 dark:text-red-400 flex items-center justify-center font-bold text-[10px]">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="hidden md:inline max-w-[75px] truncate">{user.name.split(' ')[0]}</span>
                <ChevronDown className="w-3 h-3 text-zinc-500 dark:text-zinc-400 hidden sm:inline" />
              </button>
            ) : (
              <button
                onClick={() => onNavigate('auth')}
                className="hidden sm:inline-flex px-3 py-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-500 rounded-lg transition-colors cursor-pointer whitespace-nowrap shadow-sm shadow-red-500/20"
              >
                Sign In
              </button>
            )}

            {/* Dropdown Menu */}
            {userDropdownOpen && user && (
              <div
                className="absolute right-0 mt-2 w-52 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100"
                onClick={() => setUserDropdownOpen(false)}
              >
                <div className="px-3.5 py-2 border-b border-zinc-100 dark:border-zinc-800">
                  <p className="text-xs font-semibold text-zinc-900 dark:text-white truncate">{user.name}</p>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">{user.email}</p>
                  <span className="inline-block mt-1 text-[10px] font-mono uppercase tracking-wider text-red-600 dark:text-red-400">
                    {user.role}
                  </span>
                </div>

                <button
                  onClick={() => onNavigate('account')}
                  className="w-full text-left px-3.5 py-2 text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white flex items-center gap-2 cursor-pointer"
                >
                  <UserIcon className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
                  My Account
                </button>
                <button
                  onClick={() => onNavigate('orders')}
                  className="w-full text-left px-3.5 py-2 text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white flex items-center gap-2 cursor-pointer"
                >
                  <Package className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
                  My Orders
                </button>
                {user.role === 'ADMIN' && (
                  <button
                    onClick={() => onNavigate('admin')}
                    className="w-full text-left px-3.5 py-2 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-zinc-800 flex items-center gap-2 cursor-pointer font-medium"
                  >
                    <ShieldAlert className="w-3.5 h-3.5" />
                    Admin Control Center
                  </button>
                )}

                <div className="border-t border-zinc-100 dark:border-zinc-800 my-1" />

                <button
                  onClick={logout}
                  className="w-full text-left px-3.5 py-2 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-zinc-800 flex items-center gap-2 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </button>
              </div>
            )}
          </div>

          {/* Hamburger Menu Toggle (Visible on screens < lg) */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-1.5 sm:p-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu with Backdrop (Visible on screens < lg) */}
      {mobileMenuOpen && (
        <>
          <div
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 top-16 bg-black/60 backdrop-blur-xs z-30 lg:hidden"
          />
          <div className="lg:hidden absolute top-16 left-0 right-0 bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-850 px-4 py-5 space-y-4 z-40 max-h-[calc(100vh-4rem)] overflow-y-auto shadow-2xl animate-in slide-in-from-top-2 duration-150">
            {/* Quick Vehicle Config Bar */}
            <div className="p-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 dark:bg-red-950/60 dark:text-red-500 border border-red-200 dark:border-red-900 flex items-center justify-center">
                  <Car className="w-4 h-4" />
                </div>
                <div className="text-xs">
                  <span className="text-[10px] text-zinc-500 block">Selected Vehicle</span>
                  <span className="font-bold text-zinc-900 dark:text-white">
                    {selectedVehicle ? `${selectedVehicle.brand} ${selectedVehicle.model} (${selectedVehicle.year})` : 'No vehicle configured'}
                  </span>
                </div>
              </div>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenVehicleModal();
                }}
                className="px-3 py-1.5 bg-white dark:bg-zinc-800 text-xs font-semibold text-zinc-800 dark:text-zinc-200 rounded-lg border border-zinc-200 dark:border-zinc-700 shadow-sm"
              >
                {selectedVehicle ? 'Change' : 'Configure'}
              </button>
            </div>

            {/* Navigation Links */}
            <div className="space-y-1 text-sm font-medium">
              <button
                onClick={() => {
                  onNavigate('home');
                  setMobileMenuOpen(false);
                }}
                className={`block w-full text-left px-3 py-2 rounded-lg transition-colors ${
                  currentView === 'home'
                    ? 'bg-zinc-100 dark:bg-zinc-900 text-zinc-950 dark:text-white font-bold'
                    : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900'
                }`}
              >
                Home
              </button>
              <button
                onClick={() => {
                  onNavigate('catalog');
                  setMobileMenuOpen(false);
                }}
                className={`block w-full text-left px-3 py-2 rounded-lg transition-colors ${
                  currentView === 'catalog'
                    ? 'bg-zinc-100 dark:bg-zinc-900 text-zinc-950 dark:text-white font-bold'
                    : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900'
                }`}
              >
                Shop Accessories
              </button>
              <button
                onClick={() => {
                  onNavigate('compatibility');
                  setMobileMenuOpen(false);
                }}
                className={`block w-full text-left px-3 py-2 rounded-lg transition-colors ${
                  currentView === 'compatibility'
                    ? 'bg-zinc-100 dark:bg-zinc-900 text-zinc-950 dark:text-white font-bold'
                    : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900'
                }`}
              >
                Vehicle Fitment Guide
              </button>
              <button
                onClick={() => {
                  onNavigate('offers');
                  setMobileMenuOpen(false);
                }}
                className={`block w-full text-left px-3 py-2 rounded-lg transition-colors ${
                  currentView === 'offers'
                    ? 'bg-zinc-100 dark:bg-zinc-900 text-zinc-950 dark:text-white font-bold'
                    : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900'
                }`}
              >
                Coupons & Discounts
              </button>
              <button
                onClick={() => {
                  onNavigate('wishlist');
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                  currentView === 'wishlist'
                    ? 'bg-zinc-100 dark:bg-zinc-900 text-zinc-950 dark:text-white font-bold'
                    : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900'
                }`}
              >
                <span>Saved Wishlist</span>
                <span className="text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 px-2 py-0.5 rounded-full font-bold">
                  {wishlist.length}
                </span>
              </button>

              {user && (
                <>
                  <button
                    onClick={() => {
                      onNavigate('orders');
                      setMobileMenuOpen(false);
                    }}
                    className={`block w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      currentView === 'orders'
                        ? 'bg-zinc-100 dark:bg-zinc-900 text-zinc-950 dark:text-white font-bold'
                        : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900'
                    }`}
                  >
                    My Orders & Tracking
                  </button>
                  <button
                    onClick={() => {
                      onNavigate('account');
                      setMobileMenuOpen(false);
                    }}
                    className={`block w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      currentView === 'account'
                        ? 'bg-zinc-100 dark:bg-zinc-900 text-zinc-950 dark:text-white font-bold'
                        : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900'
                    }`}
                  >
                    Account & Addresses
                  </button>
                </>
              )}

              {user?.role === 'ADMIN' && (
                <button
                  onClick={() => {
                    onNavigate('admin');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-red-600 dark:text-red-400 font-bold hover:bg-red-50 dark:hover:bg-zinc-900"
                >
                  <ShieldAlert className="w-4 h-4" />
                  <span>Admin Control Center</span>
                </button>
              )}
            </div>

            {/* Auth CTA or Sign Out Button */}
            <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800">
              {user ? (
                <div className="flex items-center justify-between">
                  <div className="text-xs">
                    <span className="font-bold text-zinc-900 dark:text-white block">{user.name}</span>
                    <span className="text-[11px] text-zinc-500">{user.email}</span>
                  </div>
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="px-3 py-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-zinc-900 rounded-lg flex items-center gap-1.5"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    onNavigate('auth');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-center py-3 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl shadow-md shadow-red-500/20"
                >
                  Sign In to AutoApex
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </header>
  );
};
