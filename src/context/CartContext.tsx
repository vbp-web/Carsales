import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { CartItem, Product, Coupon } from '../types/index.ts';
import { api } from '../services/api.ts';
import { useAuth } from './AuthContext.tsx';
import { useToast } from './ToastContext.tsx';
import { useVehicle } from './VehicleContext.tsx';

interface CartContextValue {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  discount: number;
  coupon: Coupon | null;
  couponCode: string;
  tax: number;
  shipping: number;
  total: number;
  isCartDrawerOpen: boolean;
  setIsCartDrawerOpen: (open: boolean) => void;
  addToCart: (product: Product, quantity?: number) => Promise<void>;
  updateQuantity: (productIdOrItemId: string, quantity: number) => Promise<void>;
  removeFromCart: (productIdOrItemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  applyCoupon: (code: string) => Promise<boolean>;
  removeCoupon: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

const LOCAL_CART_KEY = 'autoapex_local_cart';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const stored = localStorage.getItem(LOCAL_CART_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [couponCode, setCouponCode] = useState<string>('');
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);

  const { user, token } = useAuth();
  const { selectedVehicle } = useVehicle();
  const { success, error, info } = useToast();

  // Load backend cart if logged in
  const fetchBackendCart = useCallback(async () => {
    if (!token) return;
    try {
      const backendItems = await api.cart.get();
      if (backendItems) {
        setItems(backendItems);
      }
    } catch (err) {
      console.error('Failed fetching cart:', err);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchBackendCart();
    }
  }, [token, fetchBackendCart]);

  // Persist locally for guests
  useEffect(() => {
    if (!token) {
      localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(items));
    }
  }, [items, token]);

  const addToCart = async (product: Product, quantity = 1) => {
    if (product.stockStatus === 'OUT_OF_STOCK') {
      error('Out of Stock', 'This item is currently sold out.');
      return;
    }

    if (token) {
      try {
        const updated = await api.cart.add({
          productId: product.id,
          quantity,
          selectedVehicle: selectedVehicle || undefined
        });
        setItems(updated);
        success('Added to Cart', `${product.name} added.`);
        setIsCartDrawerOpen(true);
      } catch (err: any) {
        error('Cart Error', err.message);
      }
    } else {
      // Local state
      setItems(prev => {
        const existingIdx = prev.findIndex(i => i.productId === product.id);
        if (existingIdx > -1) {
          const next = [...prev];
          next[existingIdx].quantity += quantity;
          return next;
        }
        return [
          ...prev,
          {
            id: 'local_' + Math.random().toString(36).slice(2, 9),
            userId: 'guest',
            productId: product.id,
            product,
            quantity,
            selectedVehicle: selectedVehicle || undefined,
            addedAt: new Date().toISOString()
          }
        ];
      });
      success('Added to Cart', `${product.name} added.`);
      setIsCartDrawerOpen(true);
    }
  };

  const updateQuantity = async (productIdOrItemId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(productIdOrItemId);
      return;
    }

    if (token) {
      try {
        const updated = await api.cart.update(productIdOrItemId, quantity);
        setItems(updated);
      } catch (err: any) {
        error('Cart Error', err.message);
      }
    } else {
      setItems(prev =>
        prev.map(i => (i.id === productIdOrItemId || i.productId === productIdOrItemId ? { ...i, quantity } : i))
      );
    }
  };

  const removeFromCart = async (productIdOrItemId: string) => {
    if (token) {
      try {
        const updated = await api.cart.remove(productIdOrItemId);
        setItems(updated);
        info('Item Removed', 'Product removed from your cart.');
      } catch (err: any) {
        error('Cart Error', err.message);
      }
    } else {
      setItems(prev => prev.filter(i => i.id !== productIdOrItemId && i.productId !== productIdOrItemId));
      info('Item Removed', 'Product removed from your cart.');
    }
  };

  const clearCart = async () => {
    if (token) {
      try {
        await api.cart.clear();
      } catch (err) {
        console.error('Failed clearing remote cart:', err);
      }
    }
    setItems([]);
    setCoupon(null);
    setCouponCode('');
    setDiscountAmount(0);
    localStorage.removeItem(LOCAL_CART_KEY);
  };

  // Pricing calculations
  const subtotal = items.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0);

  const applyCoupon = async (code: string): Promise<boolean> => {
    if (!code.trim()) {
      error('Coupon Error', 'Please enter a coupon code.');
      return false;
    }
    try {
      const res = await api.coupons.validate(code, subtotal);
      if (res.valid) {
        setCoupon(res.coupon);
        setCouponCode(code.toUpperCase());
        setDiscountAmount(res.discount);
        success('Coupon Applied', res.message);
        return true;
      }
      return false;
    } catch (err: any) {
      error('Coupon Invalid', err.message);
      return false;
    }
  };

  const removeCoupon = () => {
    setCoupon(null);
    setCouponCode('');
    setDiscountAmount(0);
    info('Coupon Removed', 'Coupon code has been removed.');
  };

  // Re-verify coupon discount if subtotal changes
  useEffect(() => {
    if (coupon) {
      if (subtotal < coupon.minOrderAmount) {
        removeCoupon();
        info('Coupon Disqualified', `Minimum order of ₹${coupon.minOrderAmount} required.`);
      } else {
        const newDisc =
          coupon.discountType === 'PERCENTAGE'
            ? Math.min((subtotal * coupon.discountValue) / 100, coupon.maxDiscountAmount)
            : Math.min(coupon.discountValue, coupon.maxDiscountAmount);
        setDiscountAmount(Math.round(newDisc));
      }
    }
  }, [subtotal, coupon]);

  const discount = discountAmount;
  const shipping = subtotal > 1999 || subtotal === 0 ? 0 : 199;
  const tax = Math.round((subtotal - discount) * 0.18); // 18% GST standard on automotive goods
  const total = Math.max(0, subtotal - discount + tax + shipping);
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        subtotal,
        discount,
        coupon,
        couponCode,
        tax,
        shipping,
        total,
        isCartDrawerOpen,
        setIsCartDrawerOpen,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        applyCoupon,
        removeCoupon
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};
