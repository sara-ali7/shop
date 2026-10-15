import type { Category, CategoryInput, Product } from "@/types";
import { ApiError, apiFetch } from "./client";
import { cached, invalidate } from "./cache";
import { parseCategory, parseList, parseProduct, readId } from "./normalizers";

function requireCategory(raw: unknown): Category {
  const category = parseCategory(raw);
  if (!category) throw new ApiError("This category could not be found.", 404);
  return category;
}

export function getCategories(): Promise<Category[]> {
  return cached("categories:all", 5 * 60_000, async () =>
    parseList(await apiFetch<unknown>("/categories"), parseCategory),
  );
}

export async function getCategory(id: number | string): Promise<Category> {
  return requireCategory(await apiFetch<unknown>(`/categories/${encodeURIComponent(String(id))}`));
}

export async function getCategoryBySlug(slug: string): Promise<Category> {
  return requireCategory(await apiFetch<unknown>(`/categories/slug/${encodeURIComponent(slug)}`));
}

export async function getCategoryProducts(id: number): Promise<Product[]> {
  return parseList(await apiFetch<unknown>(`/categories/${id}/products`), parseProduct);
}

export async function createCategory(input: CategoryInput): Promise<number> {
  const raw = await apiFetch<unknown>("/categories", { method: "POST", body: input, auth: true });
  invalidate("categories:");
  const id = readId(raw);
  if (id === null) throw new ApiError("The API did not return the new category's id.", 502);
  return id;
}

export async function updateCategory(id: number, input: CategoryInput): Promise<void> {
  await apiFetch<unknown>(`/categories/${id}`, { method: "PUT", body: input, auth: true });
  invalidate("categories:");
  invalidate("products:");
}
