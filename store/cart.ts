"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItem = {
  productId: string;
  slug: string;
  name: string;
  price: number;
  image: string | null;
  sizeMl: number;
  quantity: number;
};

type CartState = {
  items: CartItem[];
  isOpen: boolean;
  open: () => void;
  close: () => void;
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number, openCart?: boolean) => void;
  removeItem: (productId: string) => void;
  setQuantity: (productId: string, quantity: number) => void;
  clear: () => void;
};

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
      addItem: (item, quantity = 1, openCart = true) => {
        const items = get().items;
        const existing = items.find((entry) => entry.productId === item.productId);
        const nextItems = existing
          ? items.map((entry) =>
              entry.productId === item.productId
                ? { ...entry, quantity: Math.min(10, entry.quantity + quantity) }
                : entry,
            )
          : [...items, { ...item, quantity }];
        set({ items: nextItems, isOpen: openCart ? true : get().isOpen });
      },
      removeItem: (productId) =>
        set({ items: get().items.filter((item) => item.productId !== productId) }),
      setQuantity: (productId, quantity) =>
        set({
          items: get().items.map((item) =>
            item.productId === productId
              ? { ...item, quantity: Math.max(1, Math.min(10, quantity)) }
              : item,
          ),
        }),
      clear: () => set({ items: [] }),
    }),
    {
      name: "ojoma-cart",
      partialize: (state) => ({ items: state.items }),
    },
  ),
);

export function cartCount(items: CartItem[]) {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

export function cartSubtotal(items: CartItem[]) {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}
