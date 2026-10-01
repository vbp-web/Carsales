import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Product } from '../types/index.ts';
import { api } from '../services/api.ts';
import { useAuth } from './AuthContext.tsx';
import { useToast } from './ToastContext.tsx';

interface WishlistContextValue {
  wishlist: Product[];
  wishlistIds: string[];
  isInWishlist: (productId: string) => boolean;
  toggleWishlist: (product: Product) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
}

const WishlistContext = createContext<WishlistContextValue | null>(null);

const LOCAL_WISHLIST_KEY = 'autoapex_local_wishlist';

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const { token } = useAuth();
  const { success, info } = useToast();

  const fetchWishlist = useCallback(async () => {
    if (!token) {
      try {
        const stored = localStorage.getItem(LOCAL_WISHLIST_KEY);
        setWishlist(stored ? JSON.parse(stored) : []);
      } catch {
        setWishlist([]);
      }
      return;
    }

    try {
      const items = await api.wishlist.get();
      setWishlist(items || []);
    } catch (err) {
      console.error('Failed fetching wishlist:', err);
    }
  }, [token]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const wishlistIds = wishlist.map(p => p.id);

  const isInWishlist = (productId: string) => wishlistIds.includes(productId);

  const toggleWishlist = async (product: Product) => {
    const isPresent = isInWishlist(product.id);

    if (token) {
      try {
        const res = await api.wishlist.toggle(product.id);
        if (res.inWishlist) {
          setWishlist(prev => [...prev, product]);
          success('Saved to Wishlist', `${product.name} saved.`);
        } else {
          setWishlist(prev => prev.filter(p => p.id !== product.id));
          info('Removed from Wishlist', `${product.name} removed.`);
        }
      } catch (err: any) {
        console.error(err);
      }
    } else {
      if (isPresent) {
        const next = wishlist.filter(p => p.id !== product.id);
        setWishlist(next);
        localStorage.setItem(LOCAL_WISHLIST_KEY, JSON.stringify(next));
        info('Removed from Wishlist', `${product.name} removed.`);
      } else {
        const next = [...wishlist, product];
        setWishlist(next);
        localStorage.setItem(LOCAL_WISHLIST_KEY, JSON.stringify(next));
        success('Saved to Wishlist', `${product.name} saved.`);
      }
    }
  };

  const removeFromWishlist = async (productId: string) => {
    const prod = wishlist.find(p => p.id === productId);
    if (prod) {
      await toggleWishlist(prod);
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        wishlistIds,
        isInWishlist,
        toggleWishlist,
        removeFromWishlist
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) throw new Error('useWishlist must be used within WishlistProvider');
  return context;
};
