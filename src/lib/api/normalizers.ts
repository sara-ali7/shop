import { cleanImage, cleanImages } from "@/lib/images";
import type { Category, Product, User } from "@/types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
const str = (value: unknown, fallback = "") => (typeof value === "string" ? value : fallback);

const UNCATEGORIZED: Category = {
  id: 0,
  name: "Uncategorized",
  slug: "",
  image: "",
  creationAt: "",
  updatedAt: "",
};

export function parseCategory(raw: unknown): Category | null {
  if (!isRecord(raw) || typeof raw.id !== "number" || !str(raw.name).trim()) return null;
  return {
    id: raw.id,
    name: str(raw.name).trim(),
    slug: str(raw.slug),
    image: cleanImage(str(raw.image)) ?? "",
    creationAt: str(raw.creationAt),
    updatedAt: str(raw.updatedAt),
  };
}

export function parseProduct(raw: unknown): Product | null {
  if (!isRecord(raw) || typeof raw.id !== "number") return null;
  const title = str(raw.title).trim();
  const price = Number(raw.price);
  if (!title || !Number.isFinite(price) || price < 0) return null;
  return {
    id: raw.id,
    title,
    slug: str(raw.slug),
    price,
    description: str(raw.description),
    images: cleanImages(raw.images),
    category: parseCategory(raw.category) ?? UNCATEGORIZED,
    creationAt: str(raw.creationAt),
    updatedAt: str(raw.updatedAt),
  };
}

/** Deliberately drops `password` (the API returns it) and anything else unknown. */
export function parseUser(raw: unknown): User | null {
  if (!isRecord(raw) || typeof raw.id !== "number" || typeof raw.email !== "string") return null;
  const rawAvatar = cleanImage(str(raw.avatar)) ?? "";

  // Do not assign a profile picture to signed up accounts (filter placeholder / generated pravatars)
  const isPlaceholderOrGenerated =
    !rawAvatar ||
    rawAvatar.includes("pravatar.cc") ||
    rawAvatar.includes("/avatar/none") ||
    rawAvatar.includes("/avatar/default") ||
    rawAvatar.includes("dummyimage.com") ||
    rawAvatar.includes("placehold.co");

  return {
    id: raw.id,
    email: raw.email,
    name: str(raw.name),
    role: str(raw.role, "customer"),
    avatar: isPlaceholderOrGenerated ? "" : rawAvatar,
    creationAt: str(raw.creationAt),
    updatedAt: str(raw.updatedAt),
  };
}

export function parseList<T>(raw: unknown, parse: (item: unknown) => T | null): T[] {
  if (!Array.isArray(raw)) return [];
  return raw.map(parse).filter((item): item is T => item !== null);
}

export function readId(raw: unknown): number | null {
  return isRecord(raw) && typeof raw.id === "number" ? raw.id : null;
}
