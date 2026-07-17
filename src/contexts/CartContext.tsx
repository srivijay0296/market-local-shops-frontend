import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { cartApi } from '@/lib/api/cart';
import { toast } from 'sonner';

export interface CartItem {
  product_id: string;
  variant_id?: string;
  quantity: number;
  name: string;
  price: number;
  image?: string;
  shop_id?: string;
  vendor?: string;
}

interface CartContextType {
  cart: CartItem[];
  loading: boolean;
  addToCart: (item: Omit<CartItem, 'quantity'>, quantity?: number) => Promise<void>;
  removeFromCart: (productId: string, variantId?: string) => Promise<void>;
  updateQuantity: (productId: string, variantIdOrQty?: string | number | null, quantity?: number) => Promise<void>;
  clearCart: () => Promise<void>;
  cartCount: number;
  cartTotal: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_KEY = 'ecom_cart_v2';

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Sync Logic
  // 1. Load initially from localStorage for Guests
  // 2. If logged in, fetch from backend and merge? 
  // For now, let's keep it simple: if logged in, backend is source of truth.
  
  // Sync Logic
  useEffect(() => {
    setLoading(true);
    try {
      const stored = localStorage.getItem(CART_KEY);
      if (stored) setCart(JSON.parse(stored));
    } catch (err) {
      console.error("Cart Init Error", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Persistence
  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }, [cart]);

  const addToCart = useCallback(async (item: Omit<CartItem, 'quantity'>, quantity = 1) => {
    setCart(prev => {
      const idx = prev.findIndex(c => c.product_id === item.product_id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = { ...updated[idx], quantity: updated[idx].quantity + quantity };
        return updated;
      }
      return [...prev, { ...item, quantity }];
    });
    setIsCartOpen(true);
    toast.success("Added to cart!");
  }, []);

  const removeFromCart = useCallback(async (productId: string, _variantId?: string) => {
    setCart(prev => prev.filter(c => c.product_id !== productId));
  }, []);

  const updateQuantity = useCallback(async (productId: string, variantIdOrQty?: string | number | null, maybeQty?: number) => {
    let quantity: number;
    if (maybeQty !== undefined) {
      quantity = maybeQty;
    } else {
      quantity = typeof variantIdOrQty === 'number' ? variantIdOrQty : 0;
    }

    if (quantity <= 0) {
      return removeFromCart(productId);
    }

    setCart(prev => prev.map(c =>
      c.product_id === productId ? { ...c, quantity } : c
    ));
  }, [removeFromCart]);

  const clearCart = useCallback(async () => {
    setCart([]);
    localStorage.removeItem(CART_KEY);
  }, []);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider value={{
      cart, loading, addToCart, removeFromCart, updateQuantity, clearCart,
      cartCount, cartTotal, isCartOpen, setIsCartOpen,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
}
