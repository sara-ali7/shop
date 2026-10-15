"use client";

import { createContext, useContext, useEffect, useMemo, useReducer, useState, useCallback } from "react";
import { roundMoney } from "@/lib/utils";
import type { CartItem, Product } from "@/types";

const STORAGE_KEY = "shop.cart.v1";
const MAX_QTY = 99;

type Action =
  | { type: "hydrate"; items: CartItem[] }
  | { type: "add"; item: Omit<CartItem, "quantity">; quantity: number }
  | { type: "increase"; id: number }
  | { type: "decrease"; id: number }
  | { type: "remove"; id: number }
  | { type: "clear" };

const clampQty = (n: number) => Math.min(MAX_QTY, Math.max(1, Math.floor(n)));

function reducer(items: CartItem[], action: Action): CartItem[] {
  switch (action.type) {
    case "hydrate":
      return action.items;
    case "add": {
      const existing = items.find((i) => i.id === action.item.id);
      if (existing) {
        return items.map((i) =>
          i.id === action.item.id ? { ...i, quantity: clampQty(i.quantity + action.quantity) } : i,
        );
      }
      return [...items, { ...action.item, quantity: clampQty(action.quantity) }];
    }
    case "increase":
      return items.map((i) => (i.id === action.id ? { ...i, quantity: clampQty(i.quantity + 1) } : i));
    case "decrease":
      return items.map((i) => (i.id === action.id ? { ...i, quantity: clampQty(i.quantity - 1) } : i));
    case "remove":
      return items.filter((i) => i.id !== action.id);
    case "clear":
      return [];
  }
}

function isCartItem(value: unknown): value is CartItem {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.id === "number" &&
    typeof v.title === "string" &&
    typeof v.price === "number" &&
    Number.isFinite(v.price) &&
    typeof v.quantity === "number" &&
    v.quantity >= 1 &&
    (typeof v.image === "string" || v.image === null)
  );
}

function loadCart(): CartItem[] {
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]");
    return Array.isArray(parsed)
      ? parsed.filter(isCartItem).map((i) => ({ ...i, quantity: clampQty(i.quantity) }))
      : [];
  } catch {
    return [];
  }
}

interface CartContextValue {
  items: CartItem[];
  hydrated: boolean;
  itemCount: number;
  subtotal: number;
  total: number;
  addItem: (product: Product, quantity?: number) => void;
  increase: (id: number) => void;
  decrease: (id: number) => void;
  remove: (id: number) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, dispatch] = useReducer(reducer, []);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    dispatch({ type: "hydrate", items: loadCart() });
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
    }
  }, [items, hydrated]);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) dispatch({ type: "hydrate", items: loadCart() });
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const addItem = useCallback((product: Product, quantity = 1) => {
    dispatch({
      type: "add",
      quantity,
      item: {
        id: product.id,
        title: product.title,
        price: product.price,
        image: product.images[0] ?? null,
      },
    });
  }, []);

  const value = useMemo<CartContextValue>(() => {
    const subtotal = roundMoney(items.reduce((sum, i) => sum + i.price * i.quantity, 0));
    return {
      items,
      hydrated,
      itemCount: items.reduce((sum, i) => sum + i.quantity, 0),
      subtotal,
      total: subtotal,
      addItem,
      increase: (id) => dispatch({ type: "increase", id }),
      decrease: (id) => dispatch({ type: "decrease", id }),
      remove: (id) => dispatch({ type: "remove", id }),
      clear: () => dispatch({ type: "clear" }),
    };
  }, [items, hydrated, addItem]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
