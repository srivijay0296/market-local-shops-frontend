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
  // 2. If logged in, fetch from Supabase and merge? 
  // For now, let's keep it simple: if logged in, Supabase is source of truth.
  
  useEffect(() => {
    const initCart = async () => {
      setLoading(true);
      try {
        if (user) {
          const dbItems = await cartApi.getCart(user.id);
          const mappedItems: CartItem[] = dbItems.map(item => ({
            product_id: item.product_id,
            quantity: item.quantity,
            name: item.product?.name || 'Unknown Product',
            price: item.product?.price || 0,
            image: item.product?.images?.[0] || '',
            shop_id: item.product?.shop_id || '',
          }));
          setCart(mappedItems);
        } else {
          const stored = localStorage.getItem(CART_KEY);
          if (stored) setCart(JSON.parse(stored));
        }
      } catch (err) {
        console.error("Cart Init Error", err);
      } finally {
        setLoading(false);
      }
    };

    initCart();
  }, [user]);

  // Persistence for Guests
  useEffect(() => {
    if (!user) {
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
    }
  }, [cart, user]);

  const addToCart = useCallback(async (item: Omit<CartItem, 'quantity'>, quantity = 1) => {
    try {
      if (user) {
        await cartApi.addToCart(user.id, item.product_id, quantity);
        // Refresh local state from DB to be safe
        const dbItems = await cartApi.getCart(user.id);
        const mappedItems: CartItem[] = dbItems.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
          name: item.product?.name || '',
          price: item.product?.price || 0,
          image: item.product?.images?.[0] || '',
          shop_id: item.product?.shop_id || '',
        }));
        setCart(mappedItems);
      } else {
        setCart(prev => {
          const idx = prev.findIndex(c => c.product_id === item.product_id);
          if (idx >= 0) {
            const updated = [...prev];
            updated[idx] = { ...updated[idx], quantity: updated[idx].quantity + quantity };
            return updated;
          }
          return [...prev, { ...item, quantity }];
        });
      }
      setIsCartOpen(true);
      toast.success("Added to cart!");
    } catch (err) {
      toast.error("Failed to add to cart");
    }
  }, [user]);

  const removeFromCart = useCallback(async (productId: string, _variantId?: string) => {
    try {
      if (user) {
        // Find by product_id
      }
      
      // Traditional approach: remove from state first
      setCart(prev => prev.filter(c => c.product_id !== productId));
      
      if (user) {
         // This is a bit inefficient without the item ID, so we use product_id based delete
         await cartApi.removeFromCartByProduct(user.id, productId);
      }
    } catch (err) {
      console.error(err);
    }
  }, [user]);

  const updateQuantity = useCallback(async (productId: string, variantIdOrQty?: string | number | null, maybeQty?: number) => {
    // Support two calling conventions:
    //   updateQuantity(productId, quantity)           <- CartContext internal
    //   updateQuantity(productId, variantId, quantity) <- CartPage with variant support
    let quantity: number;
    if (maybeQty !== undefined) {
      quantity = maybeQty;
    } else {
      quantity = typeof variantIdOrQty === 'number' ? variantIdOrQty : 0;
    }

    if (quantity <= 0) {
      return removeFromCart(productId);
    }

    try {
       if (user) {
          await cartApi.updateQuantityByProduct(user.id, productId, quantity);
       }
       setCart(prev => prev.map(c =>
        c.product_id === productId ? { ...c, quantity } : c
      ));
    } catch (err) {
      console.error(err);
    }
  }, [user, removeFromCart]);

  const clearCart = useCallback(async () => {
    try {
      if (user) {
        await cartApi.clearCart(user.id);
      }
      setCart([]);
      localStorage.removeItem(CART_KEY);
    } catch (err) {
      console.error(err);
    }
  }, [user]);

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
