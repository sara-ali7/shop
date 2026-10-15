type Kind = "product" | "category";
const key = (kind: Kind) => `shop.owned.${kind}`;

function read(kind: Kind): number[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(key(kind)) ?? "[]");
    return Array.isArray(parsed) ? parsed.filter((v): v is number => typeof v === "number") : [];
  } catch {
    return [];
  }
}

export function markOwned(kind: Kind, id: number): void {
  try {
    window.localStorage.setItem(key(kind), JSON.stringify([...new Set([...read(kind), id])]));
  } catch {
  }
}

export function isOwned(kind: Kind, id: number): boolean {
  return read(kind).includes(id);
}
