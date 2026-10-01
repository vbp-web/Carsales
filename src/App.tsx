import React, { useState, useEffect } from 'react';
import { ToastProvider } from './context/ToastContext.tsx';
import { ThemeProvider } from './context/ThemeContext.tsx';
import { AuthProvider } from './context/AuthContext.tsx';
import { VehicleProvider } from './context/VehicleContext.tsx';
import { CartProvider } from './context/CartContext.tsx';
import { WishlistProvider } from './context/WishlistContext.tsx';
import { Navbar } from './components/common/Navbar.tsx';
import { Footer } from './components/common/Footer.tsx';
import { CartDrawer } from './components/cart/CartDrawer.tsx';
import { VehicleModal } from './components/common/VehicleModal.tsx';
import { AuthModal } from './components/auth/AuthModal.tsx';

// Views
import { HomeView } from './views/HomeView.tsx';
import { CatalogView } from './views/CatalogView.tsx';
import { ProductDetailView } from './views/ProductDetailView.tsx';
import { CheckoutView } from './views/CheckoutView.tsx';
import { OrdersView } from './views/OrdersView.tsx';
import { OrderDetailsView } from './views/OrderDetailsView.tsx';
import { AccountView } from './views/AccountView.tsx';
import { AdminView } from './views/AdminView.tsx';
import { OffersView } from './views/OffersView.tsx';
import { CompatibilityView } from './views/CompatibilityView.tsx';
import { Order } from './types/index.ts';
import { X, Sparkles } from 'lucide-react';

function AppContent() {
  const [currentView, setCurrentView] = useState<string>('home');
  const [viewParams, setViewParams] = useState<Record<string, any>>({});
  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [showPromoBanner, setShowPromoBanner] = useState(true);

  // Scroll to top on navigation
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentView, viewParams]);

  const navigate = (view: string, params: Record<string, any> = {}) => {
    if (view === 'auth') {
      setIsAuthModalOpen(true);
      return;
    }
    setCurrentView(view);
    setViewParams(params);
  };

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 flex flex-col font-sans selection:bg-red-600 selection:text-white transition-colors duration-200">
      {/* 1. Slim dismissible promotional banner (Governance: <= 40px) */}
      {showPromoBanner && (
        <aside aria-label="Announcement" className="h-9 bg-zinc-100 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 text-[11px] text-zinc-700 dark:text-zinc-300 px-4 flex items-center justify-between z-50 transition-colors">
          <div className="flex-1 text-center truncate">
            <span className="text-red-600 dark:text-red-400 font-bold mr-1.5">SPECIAL OFFER:</span>
            <span>Use coupon <strong className="text-zinc-900 dark:text-white font-mono bg-white dark:bg-zinc-950 px-1 py-0.5 rounded border border-zinc-300 dark:border-zinc-800">CAR10</strong> for 10% instant off + Free Delivery over ₹1,999</span>
          </div>
          <button
            onClick={() => setShowPromoBanner(false)}
            className="text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300 p-1 shrink-0 ml-2"
            title="Dismiss announcement"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </aside>
      )}

      {/* 2. Top Bar Contract Navbar */}
      <Navbar
        currentView={currentView}
        onNavigate={navigate}
        onOpenVehicleModal={() => setIsVehicleModalOpen(true)}
      />

      {/* 3. Main Dynamic View Container */}
      <main className="flex-1">
        {currentView === 'home' && (
          <HomeView
            onNavigate={navigate}
            onOpenVehicleModal={() => setIsVehicleModalOpen(true)}
          />
        )}

        {currentView === 'catalog' && (
          <CatalogView
            initialParams={viewParams}
            onNavigateProduct={(id) => navigate('product', { id })}
            onOpenVehicleModal={() => setIsVehicleModalOpen(true)}
          />
        )}

        {currentView === 'product' && (
          <ProductDetailView
            productId={viewParams.id || 'prod_creta_7d_mats'}
            onNavigateProduct={(id) => navigate('product', { id })}
            onCheckout={() => navigate('checkout')}
            onOpenVehicleModal={() => setIsVehicleModalOpen(true)}
          />
        )}

        {currentView === 'checkout' && (
          <CheckoutView
            onOrderSuccess={(order: Order) => navigate('order-details', { id: order.id })}
            onNavigateHome={() => navigate('home')}
          />
        )}

        {currentView === 'orders' && (
          <OrdersView
            onSelectOrder={(id) => navigate('order-details', { id })}
            onNavigateHome={() => navigate('catalog')}
          />
        )}

        {currentView === 'order-details' && (
          <OrderDetailsView
            orderId={viewParams.id || 'ord_demo_9821'}
            onBack={() => navigate('orders')}
            onNavigateProduct={(id) => navigate('product', { id })}
          />
        )}

        {currentView === 'account' && (
          <AccountView
            onNavigateOrders={() => navigate('orders')}
            onNavigateWishlist={() => navigate('catalog')}
            onNavigateAdmin={() => navigate('admin')}
            onOpenVehicleModal={() => setIsVehicleModalOpen(true)}
            onNavigateAuth={() => navigate('auth')}
          />
        )}

        {currentView === 'wishlist' && (
          <CatalogView
            initialParams={{ search: '' }}
            onNavigateProduct={(id) => navigate('product', { id })}
            onOpenVehicleModal={() => setIsVehicleModalOpen(true)}
          />
        )}

        {currentView === 'admin' && (
          <AdminView onBackToStore={() => navigate('home')} />
        )}

        {currentView === 'offers' && (
          <OffersView onNavigateCatalog={() => navigate('catalog')} />
        )}

        {currentView === 'compatibility' && (
          <CompatibilityView
            onSelectVehicleToShop={(brand, model, year) =>
              navigate('catalog', { carBrand: brand, carModel: model, carYear: year })
            }
          />
        )}
      </main>

      {/* 4. Global Drawers & Modals */}
      <CartDrawer
        onCheckout={() => navigate('checkout')}
        onNavigateCatalog={() => navigate('catalog')}
      />

      <VehicleModal
        isOpen={isVehicleModalOpen}
        onClose={() => setIsVehicleModalOpen(false)}
        onSelectVehicle={(brand, model, year) => {
          navigate('catalog', { carBrand: brand, carModel: model, carYear: year });
        }}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {/* 5. Automotive Footer */}
      <Footer onNavigate={navigate} />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <VehicleProvider>
            <CartProvider>
              <WishlistProvider>
                <AppContent />
              </WishlistProvider>
            </CartProvider>
          </VehicleProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
