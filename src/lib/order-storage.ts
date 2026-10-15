import type { SimulatedOrder } from "@/types";

export const ORDER_STORAGE_KEY = "shop.lastOrder";

export function readLastOrder(): SimulatedOrder | null {
  try {
    const raw = window.sessionStorage.getItem(ORDER_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<SimulatedOrder>;
    return parsed && typeof parsed.reference === "string" && Array.isArray(parsed.items)
      ? (parsed as SimulatedOrder)
      : null;
  } catch {
    return null;
  }
}
