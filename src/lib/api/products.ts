import type { Product, ProductInput } from "@/types";
import { ApiError, apiFetch } from "./client";
import { cached, invalidate } from "./cache";
import { parseList, parseProduct, readId } from "./normalizers";

const PAGE_SIZE = 100;

function requireProduct(raw: unknown): Product {
  const product = parseProduct(raw);
  if (!product) throw new ApiError("This product could not be found or has invalid data.", 404);
  return product;
}

export async function getProductsPage(offset: number, limit: number): Promise<Product[]> {
  const raw = await apiFetch<unknown>("/products", { query: { offset, limit } });
  return parseList(raw, parseProduct);
}

export async function searchProducts(opts: {
  title?: string;
  categoryId?: string;
  limit?: number;
}): Promise<Product[]> {
  const categoryId =
    opts.categoryId && opts.categoryId !== "all" && /^\d+$/.test(opts.categoryId)
      ? Number(opts.categoryId)
      : undefined;
  const raw = await apiFetch<unknown>("/products", {
    query: {
      title: opts.title?.trim() || undefined,
      categoryId,
      offset: 0,
      limit: opts.limit ?? 8,
    },
  });
  return parseList(raw, parseProduct);
}

export function getProducts(): Promise<Product[]> {
  return cached("products:all", 60_000, async () => {
    const byId = new Map<number, Product>();
    for (let page = 0; page < 20; page++) {
      const raw = await apiFetch<unknown>("/products", {
        query: { offset: page * PAGE_SIZE, limit: PAGE_SIZE },
      });
      if (!Array.isArray(raw) || raw.length === 0) break;
      const before = byId.size;
      for (const item of raw) {
        const product = parseProduct(item);
        if (product) byId.set(product.id, product);
      }
      if (raw.length < PAGE_SIZE || byId.size === before) break;
    }
    return [...byId.values()];
  });
}

export async function getProduct(id: number | string): Promise<Product> {
  return requireProduct(await apiFetch<unknown>(`/products/${encodeURIComponent(String(id))}`));
}

export async function getProductBySlug(slug: string): Promise<Product> {
  return requireProduct(await apiFetch<unknown>(`/products/slug/${encodeURIComponent(slug)}`));
}

export async function getRelatedProducts(id: number): Promise<Product[]> {
  const raw = await apiFetch<unknown>(`/products/${id}/related`);
  return parseList(raw, parseProduct);
}

export async function createProduct(input: ProductInput): Promise<number> {
  const raw = await apiFetch<unknown>("/products", { method: "POST", body: input, auth: true });
  invalidate("products:");
  const id = readId(raw);
  if (id === null) throw new ApiError("The API did not return the new product's id.", 502);
  return id;
}

export async function updateProduct(id: number, input: ProductInput): Promise<void> {
  await apiFetch<unknown>(`/products/${id}`, { method: "PUT", body: input, auth: true });
  invalidate("products:");
}
