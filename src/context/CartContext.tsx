import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, CartItem } from '../types';

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, qty?: number, selected_variant?: string) => void;
  removeFromCart: (productId: string, variant?: string) => void;
  updateQty: (productId: string, qty: number, variant?: string) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  isCheckoutOpen: boolean;
  openCheckout: (directProduct?: Product, variant?: string, qty?: number) => void;
  closeCheckout: () => void;
  directProduct: { product: Product; variant?: string; qty: number } | null;
  setDirectProductQty: (qty: number) => void;
  subtotal: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('kinomart_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [directProduct, setDirectProduct] = useState<{ product: Product; variant?: string; qty: number } | null>(null);

  useEffect(() => {
    localStorage.setItem('kinomart_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product: Product, qty = 1, selected_variant?: string) => {
    setCart(prev => {
      const existingIndex = prev.findIndex(
        item => item.product.id === product.id && item.selected_variant === selected_variant
      );
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].qty += qty;
        return updated;
      } else {
        return [...prev, { product, qty, selected_variant }];
      }
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (productId: string, variant?: string) => {
    setCart(prev => prev.filter(item => !(item.product.id === productId && item.selected_variant === variant)));
  };

  const updateQty = (productId: string, qty: number, variant?: string) => {
    if (qty <= 0) {
      removeFromCart(productId, variant);
      return;
    }
    setCart(prev =>
      prev.map(item => {
        if (item.product.id === productId && item.selected_variant === variant) {
          return { ...item, qty };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  const openCheckout = (product?: Product, variant?: string, qty = 1) => {
    if (product) {
      setDirectProduct({ product, variant, qty: Math.max(1, qty) });
    } else {
      setDirectProduct(null);
    }
    setIsCheckoutOpen(true);
    setIsCartOpen(false);
  };

  const setDirectProductQty = (qty: number) => {
    if (!directProduct) return;
    const newQty = Math.max(1, qty);
    setDirectProduct({ ...directProduct, qty: newQty });
  };

  const closeCheckout = () => {
    setIsCheckoutOpen(false);
    setDirectProduct(null);
  };

  const subtotal = cart.reduce((sum, item) => {
    const itemPrice = item.product.discount_price || item.product.price;
    return sum + itemPrice * item.qty;
  }, 0);

  const itemCount = cart.reduce((sum, item) => sum + item.qty, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQty,
        clearCart,
        isCartOpen,
        openCart,
        closeCart,
        isCheckoutOpen,
        openCheckout,
        closeCheckout,
        directProduct,
        setDirectProductQty,
        subtotal,
        itemCount
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};
