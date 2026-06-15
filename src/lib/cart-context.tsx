"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

export type CartItem = {
  id: string;
  slug: string;
  name: string;
  subtitle?: string | null;
  price_vnd: number;
  image_url?: string | null;
  variant?: string | null; // selected variant label
  qty: number;
};

type CartContextValue = {
  items: CartItem[];
  count: number;
  addItem: (item: Omit<CartItem, "qty"> & { qty?: number }) => void;
  removeItem: (id: string, variant?: string | null) => void;
  setQty: (id: string, variant: string | null | undefined, qty: number) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "lumia_cart";

function itemKey(id: string, variant?: string | null) {
  return `${id}__${variant ?? ""}`;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setItems(JSON.parse(stored) as CartItem[]);
    } catch {}
  }, []);

  const addItem = useCallback((item: Omit<CartItem, "qty"> & { qty?: number }) => {
    setItems((prev) => {
      const key = itemKey(item.id, item.variant);
      const existing = prev.find((i) => itemKey(i.id, i.variant) === key);
      const next = existing
        ? prev.map((i) => itemKey(i.id, i.variant) === key ? { ...i, qty: i.qty + (item.qty ?? 1) } : i)
        : [...prev, { ...item, qty: item.qty ?? 1 }];
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  const removeItem = useCallback((id: string, variant?: string | null) => {
    setItems((prev) => {
      const key = itemKey(id, variant);
      const next = prev.filter((i) => itemKey(i.id, i.variant) !== key);
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  const setQty = useCallback((id: string, variant: string | null | undefined, qty: number) => {
    setItems((prev) => {
      const key = itemKey(id, variant);
      const next = qty <= 0
        ? prev.filter((i) => itemKey(i.id, i.variant) !== key)
        : prev.map((i) => itemKey(i.id, i.variant) === key ? { ...i, qty } : i);
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    setItems([]);
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
  }, []);

  const count = items.reduce((s, i) => s + i.qty, 0);

  return (
    <CartContext.Provider value={{ items, count, addItem, removeItem, setQty, clear }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
